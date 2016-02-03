import Geo from './geo';
import {StyleParser} from './styles/style_parser';
import {StyleManager} from './styles/style_manager';
import Collision from './labels/collision';
import WorkerBroker from './utils/worker_broker';
import Texture from './gl/texture';

import log from 'loglevel';

export default class Tile {

    /**
        Tile
        @constructor
        Required properties:
        coords: object with {x, y, z} properties identifying tile coordinate location
        worker: web worker to handle tile construction
    */
    constructor({ coords, source, worker, style_zoom }) {
        Object.assign(this, {
            coords: {
                x: null,
                y: null,
                z: null
            },
            debug: {},
            loading: false,
            loaded: false,
            error: null,
            worker: null,
            generation: null,
            visible: false,
            center_dist: 0
        });

        this.worker = worker;
        this.source = source;
        this.style_zoom = style_zoom; // zoom level to be used for styling

        this.coords = coords;
        this.coords = Tile.overZoomedCoordinate(this.coords, this.source.max_zoom);
        this.coord_key = Tile.coordKey(this.coords);
        this.key = Tile.key(this.coords, this.source, this.style_zoom);
        this.min = Geo.metersForTile(this.coords);
        this.max = Geo.metersForTile({x: this.coords.x + 1, y: this.coords.y + 1, z: this.coords.z }),
        this.span = { x: (this.max.x - this.min.x), y: (this.max.y - this.min.y) };
        this.bounds = { sw: { x: this.min.x, y: this.max.y }, ne: { x: this.max.x, y: this.min.y } };

        // Units per pixel needs to account for over-zooming
        this.units_per_pixel = Geo.units_per_pixel;
        if (this.style_zoom > this.coords.z) {
            this.units_per_pixel /= Math.pow(2, this.style_zoom - this.coords.z);
        }

        this.meters_per_pixel = Geo.metersPerPixel(this.coords.z);
        this.units_per_meter = Geo.unitsPerMeter(this.coords.z);

        this.meshes = {}; // renderable VBO meshes keyed by style
        this.textures = []; // textures that the tile owns (labels, etc.)
    }

    static create(spec) {
        return new Tile(spec);
    }

    static coordKey({x, y, z}) {
        return [x, y, z].join('/');
    }

    static key (coords, source, style_zoom) {
        coords = Tile.overZoomedCoordinate(coords, source.max_zoom);
        if (coords.y < 0 || coords.y >= (1 << coords.z) || coords.z < 0) {
            return; // cull tiles out of range (x will wrap)
        }
        return [source.name, style_zoom, coords.x, coords.y, coords.z].join('/');
    }

    static coordinateAtZoom({x, y, z}, zoom) {
        if (z !== zoom) {
            let zscale = Math.pow(2, z - zoom);
            x = Math.floor(x / zscale);
            y = Math.floor(y / zscale);
        }
        return {x, y, z: zoom};
    }

    static isChild(parent, child) {
        if (child.z > parent.z) {
            let {x, y} = Tile.coordinateAtZoom(child, parent.z);
            return (parent.x === x && parent.y === y);
        }
        return false;
    }

    static overZoomedCoordinate({x, y, z}, max_zoom) {
        if (max_zoom !== undefined && z > max_zoom) {
            return Tile.coordinateAtZoom({x, y, z}, max_zoom);
        }
        return {x, y, z};
    }

    // Sort a set of tile instances (which already have a distance from center tile computed)
    static sort(tiles) {
        return tiles.sort((a, b) => {
            let ad = a.center_dist;
            let bd = b.center_dist;
            return (bd > ad ? -1 : (bd === ad ? 0 : 1));
        });
    }

    freeResources() {
        if (this.meshes) {
            for (let m in this.meshes) {
                this.meshes[m].destroy();
            }
        }

        if (this.textures) {
            for (let t of this.textures) {
                let texture = Texture.textures[t];
                if (texture) {
                    texture.destroy();
                }
            }
        }

        this.meshes = {};
        this.textures = [];
    }

    destroy() {
        this.workerMessage('self.removeTile', this.key);
        this.freeResources();
        this.worker = null;
    }

    buildAsMessage() {
        return {
            key: this.key,
            coord_key: this.coord_key,
            source: this.source.name,
            coords: this.coords,
            min: this.min,
            max: this.max,
            units_per_pixel: this.units_per_pixel,
            meters_per_pixel: this.meters_per_pixel,
            units_per_meter: this.units_per_meter,
            style_zoom: this.style_zoom,
            generation: this.generation,
            debug: this.debug
        };
    }

    workerMessage (...message) {
        return WorkerBroker.postMessage(this.worker, ...message);
    }

    build(generation) {
        this.generation = generation;
        if (!this.loaded) {
            this.loading = true;
        }
        return this.workerMessage('self.buildTile', { tile: this.buildAsMessage() }).catch(e => { throw e; });
    }

    // Process geometry for tile - called by web worker
    // Returns a set of tile keys that should be sent to the main thread (so that we can minimize data exchange between worker and main thread)
    static buildGeometry (tile, layers, rules, styles) {
        tile.debug.rendering = +new Date();
        tile.debug.features = 0;

        let data = tile.source_data;

        Collision.startTile(tile.key);

        // Treat top-level style rules as 'layers'
        for (let layer_name in layers) {
            let layer = layers[layer_name];
            // Skip layers with no data source defined
            if (!layer || !layer.data) {
                log.warn(`Layer ${layer} was defined without a geometry data source and will not be rendered.`);
                continue;
            }

            // Source names don't match
            if (layer.data.source !== tile.source) {
                continue;
            }

            // Get data for one or more layers from source
            let source_layers = Tile.getDataForSource(data, layer.data, layer_name);

            // Render features in layer
            for (let s=0; s < source_layers.length; s++) {
                let source_layer = source_layers[s];
                let geom = source_layer.geom;
                if (!geom) {
                    continue;
                }

                for (let f = 0; f < geom.features.length; f++) {
                    let feature = geom.features[f];
                    if (feature.geometry == null) {
                        continue; // skip features w/o geometry (valid GeoJSON)
                    }

                    let context = StyleParser.getFeatureParseContext(feature, tile);
                    context.winding = tile.default_winding;
                    context.layer = source_layer.layer; // add data source layer name

                    // Get draw groups for this feature
                    let layer_rules = rules[layer_name];
                    let draw_groups = layer_rules.buildDrawGroups(context, true);
                    if (!draw_groups) {
                        continue;
                    }

                    // Render draw groups
                    for (let group_name in draw_groups) {
                        let group = draw_groups[group_name];
                        if (!group.visible) {
                            continue;
                        }

                        // Add to style
                        let style_name = group.style || group_name;
                        let style = styles[style_name];

                        if (!style) {
                            log.warn(`Style '${style_name}' not found for rule in layer '${layer_name}':`, group, feature);
                            continue;
                        }

                        context.properties = group.properties; // add rule-specific properties to context

                        style.addFeature(feature, group, context);

                        context.properties = null; // clear group-specific properties
                    }

                    tile.debug.features++;
                }
            }
        }
        tile.debug.rendering = +new Date() - tile.debug.rendering;

        // Finalize array buffer for each render style
        let tile_styles = StyleManager.stylesForTile(tile.key);
        tile.mesh_data = {};
        let queue = [];
        for (let s=0; s < tile_styles.length; s++) {
            let style_name = tile_styles[s];
            let style = styles[style_name];
            queue.push(style.endData(tile.key).then((style_data) => {
                if (style_data) {
                    tile.mesh_data[style_name] = {
                        vertex_data: style_data.vertex_data,
                        uniforms: style_data.uniforms,
                        textures: style_data.textures
                    };
                }
            }));
        }

        return Promise.all(queue).then(() => {
            Collision.resetTile(tile.key);

            // Return keys to be transfered to main thread
            return ['mesh_data'];
        });
    }

    /**
        Retrieves geometry from a tile according to a data source definition
        Returns an array of objects with:
            layer: source layer name
            geom: GeoJSON FeatureCollection
    */
    static getDataForSource (source_data, source_config, default_layer = null) {
        var layers = [];

        if (source_config != null) {
            // If no layer specified, and a default source layer exists
            if (!source_config.layer && source_data.layers._default) {
                layers.push({
                    layer: '_default',
                    geom: source_data.layers._default
                });
            }
            // If no layer specified, and a default requested layer exists
            else if (!source_config.layer && default_layer) {
                layers.push({
                    layer: default_layer,
                    geom: source_data.layers[default_layer]
                });
            }
            // If a layer is specified by name, use it
            else if (typeof source_config.layer === 'string') {
                layers.push({
                    layer: source_config.layer,
                    geom: source_data.layers[source_config.layer]
                });
            }
            // If multiple layers are specified by name, combine them
            else if (Array.isArray(source_config.layer)) {
                source_config.layer.forEach(layer => {
                    if (source_data.layers[layer] && source_data.layers[layer].features) {
                        layers.push({
                            layer,
                            geom: source_data.layers[layer]
                        });
                    }
                });
            }
            // Assemble a custom layer via a function, which is called with all source layers
            else if (typeof source_config.layer === 'function') {
                layers.push({
                    geom: source_config.layer(source_data.layers)
                    // custom layer has no name
                });
            }
        }

        return layers;
    }

    /**
       Called on main thread when a web worker completes processing
       for a single tile.
    */
    buildMeshes(styles) {
        if (this.error) {
            return;
        }

        // Cleanup existing VBOs
        this.freeResources();

        // Debug
        this.debug.geometries = 0;
        this.debug.buffer_size = 0;

        // Create VBOs
        let mesh_data = this.mesh_data;
        if (mesh_data) {
            for (var s in mesh_data) {
                if (mesh_data[s].vertex_data) {
                    this.debug.buffer_size += mesh_data[s].vertex_data.byteLength;
                    if (!styles[s]) {
                        log.warn(`Could not create mesh because style '${s}' not found, for tile ${this.key}, aborting tile`);
                        this.meshes = {};
                        break;
                    }
                    this.meshes[s] = styles[s].makeMesh(mesh_data[s].vertex_data, mesh_data[s]);
                    this.debug.geometries += this.meshes[s].geometry_count;
                }

                // Assign ownership to textures if needed
                if (mesh_data[s].textures) {
                    this.textures.push(...mesh_data[s].textures);
                }
            }
        }

        this.debug.geom_ratio = (this.debug.geometries / this.debug.features).toFixed(1);
        this.mesh_data = null; // TODO: might want to preserve this for rebuilding geometries when styles/etc. change?
        this.printDebug();
    }

    /**
        Called on main thread when web worker completes processing, but tile has since been discarded
        Frees resources that would have been transferred to the tile object.
        Static method because the tile object no longer exists (the tile data returned by the worker is passed instead).
    */
    static abortBuild (tile) {
        if (tile.mesh_data) {
            for (let s in tile.mesh_data) {
                let textures = tile.mesh_data[s].textures;
                if (textures) {
                    for (let t of textures) {
                        let texture = Texture.textures[t];
                        if (texture) {
                            log.trace(`destroying texture ${t} for tile ${tile.key}`);
                            texture.destroy();
                        }
                    }
                }
            }
        }
    }

    printDebug () {
        log.debug(`Tile: debug for ${this.key}: [  ${JSON.stringify(this.debug)} ]`);
    }

    update(scene) {
        let coords = this.coords;
        if (coords.z !== scene.center_tile.z) {
            coords = Tile.coordinateAtZoom(coords, scene.center_tile.z);
        }
        this.center_dist = Math.abs(scene.center_tile.x - coords.x) + Math.abs(scene.center_tile.y - coords.y);
    }

    // Slice a subset of keys out of a tile
    // Includes a minimum set of pre-defined keys for load state, debug. etc.
    // We use this to send a subset of the tile back to the main thread, to minimize unnecessary data transfer
    // (e.g. very large items like feature geometry are not needed on the main thread)
    static slice (tile, keys) {
        let keep = [
            'key',
            'loading',
            'loaded',
            'generation',
            'error',
            'debug'
        ];
        if (Array.isArray(keys)) {
            keep.push(...keys);
        }

        // Build the tile subset
        var tile_subset = {};
        for (let key of keep) {
            tile_subset[key] = tile[key];
        }

        return tile_subset;
    }

    /**
        Called on worker to cancel loading
        Static method because the worker only has object representations of tile data, there is no
        tile instance created yet.
    */
    static cancel(tile) {
        if (tile) {
            if (tile.source_data && tile.source_data.request) {
                tile.source_data.request.abort();
            }
            Tile.abortBuild(tile);
        }
    }

    merge(other) {
        for (var key in other) {
            if (key !== 'key') {
                this[key] = other[key];
            }
        }
        return this;
    }

}
