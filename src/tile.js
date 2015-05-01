/*global Tile */
import Geo from './geo';
import {StyleParser} from './styles/style_parser';
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
    constructor({ coords, worker, max_zoom }) {
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
            visible: false,
            center_dist: 0
        });

        this.worker = worker;
        this.max_zoom = max_zoom;

        this.coords = coords;
        this.coords = Tile.calculateOverZoom(this.coords, this.max_zoom);
        this.key = Tile.key(this.coords);
        this.min = Geo.metersForTile(this.coords);
        this.max = Geo.metersForTile({x: this.coords.x + 1, y: this.coords.y + 1, z: this.coords.z }),
        this.span = { x: (this.max.x - this.min.x), y: (this.max.y - this.min.y) };
        this.bounds = { sw: { x: this.min.x, y: this.max.y }, ne: { x: this.max.x, y: this.min.y } };

        this.meshes = {}; // renderable VBO meshes keyed by style
        this.textures = []; // textures that the tile owns (labels, etc.)
    }

    static create(spec) {
        return new Tile(spec);
    }

    static key({x, y, z}) {
        return [x, y, z].join('/');
    }

    static calculateOverZoom({x, y, z}, max_zoom) {
        max_zoom = max_zoom || z;

        if (z > max_zoom) {
            let zdiff = z - max_zoom;

            x = Math.floor(x >> zdiff);
            y = Math.floor(y >> zdiff);
            z -= zdiff;
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
        this.workerMessage('removeTile', this.key);
        this.freeResources();
        this.worker = null;
    }

    buildAsMessage() {
        return {
            key: this.key,
            coords: this.coords,
            min: this.min,
            max: this.max,
            debug: this.debug
        };
    }

    workerMessage (...message) {
        return WorkerBroker.postMessage(this.worker, ...message);
    }

    // TODO: remove scene dependency
    build(scene) {
        scene.trackTileBuildStart(this.key);
        this.workerMessage(
            'buildTile',
            { tile: this.buildAsMessage() })
        .then(message => {
            scene.buildTileCompleted(message);
        }).catch(error => {
            throw error;
        });
    }

    // Process geometry for tile - called by web worker
    // Returns a set of tile keys that should be sent to the main thread (so that we can minimize data exchange between worker and main thread)
    static buildGeometry (tile, layers, rules, styles) {
        tile.debug.rendering = +new Date();

        let tile_styles = {}; // track styles used in tile

        for (let source_name in tile.sources) {
            let source = tile.sources[source_name];
            source.debug.rendering = +new Date();
            source.debug.features = 0;

            // Treat top-level style rules as 'layers'
            for (let layer_name in layers) {
                let layer = layers[layer_name];
                // Skip layers with no data source defined
                if (!layer.data) {
                    log.warn(`Layer ${layer} was defined without a geometry data source and will not be rendered.`);
                    continue;
                }

                // Source names don't match
                if (layer.data.source !== source_name) {
                    continue;
                }

                let geom = Tile.getDataForSource(source, layer.data, layer_name);
                if (!geom) {
                    continue;
                }

                // Render features in layer
                let num_features = geom.features.length;
                for (let f = num_features-1; f >= 0; f--) {
                    let feature = geom.features[f];
                    let context = StyleParser.getFeatureParseContext(feature, tile);

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

                        style.addFeature(feature, group, tile.key, context);

                        if (!tile_styles[style_name]) {
                            tile_styles[style_name] = true;
                        }

                        context.properties = null; // clear group-specific properties
                    }

                    source.debug.features++;
                }

            }

            source.debug.rendering = +new Date() - source.debug.rendering;
        }

        // Finalize array buffer for each render style
        tile.mesh_data = {};
        let queue = [];
        for (let style_name in tile_styles) {
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
            // Aggregate debug info
            tile.debug.rendering = +new Date() - tile.debug.rendering;
            tile.debug.projection = 0;
            tile.debug.features = 0;
            tile.debug.network = 0;
            tile.debug.parsing = 0;

            for (let i in tile.sources) {
                tile.debug.features  += tile.sources[i].debug.features;
                tile.debug.projection += tile.sources[i].debug.projection;
                tile.debug.network += tile.sources[i].debug.network;
                tile.debug.parsing += tile.sources[i].debug.parsing;
            }

            // Return keys to be transfered to main thread
            return {
                mesh_data: true
            };
        });
    }

    /**
        Retrieves geometry from a tile according to a data source definition
    */
    static getDataForSource (source_data, source_config, default_layer = null) {
        var geom;

        if (source_config != null) {
            // If no layer specified, and a default source layer exists
            if (!source_config.layer && source_data.layers._default) {
                geom = source_data.layers._default;
            }
            // If no layer specified, and a default requested layer exists
            else if (!source_config.layer && default_layer) {
                geom = source_data.layers[default_layer];
            }
            // If a layer is specified by name, use it
            else if (typeof source_config.layer === 'string') {
                geom = source_data.layers[source_config.layer];
            }
            // Assemble a custom layer via a function, which is called with all source layers
            else if (typeof source_config.layer === 'function') {
                geom = source_config.layer(source_data.layers);
            }
        }

        return geom;
    }

    /**
       Called on main thread when a web worker completes processing
       for a single tile.
    */
    finalizeBuild(styles) {
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
        if (this.coords.z === scene.center_tile.z && scene.visible_tiles[this.key]) {
            this.visible = true;
        }
        else {
            this.visible = false;
        }

        // TODO: handle tiles of mismatching zoom levels
        if (this.coords.z === scene.center_tile.z) {
            this.center_dist = Math.abs(scene.center_tile.x - this.coords.x) + Math.abs(scene.center_tile.y - this.coords.y);
        }
        else {
            this.center_dist = Infinity;
        }
    }

    load(scene) {
        scene.trackTileSetLoadStart();

        this.loading = true;
        this.build(scene);
        this.update(scene);
    }

    /**
        Called on worker to cancel loading
        Static method because the worker only has object representations of tile data, there is no
        tile instance created yet.
    */
    static cancel(tile) {
        if (tile && tile.sources) {
            Object.keys(tile.sources).
                map(s => tile.sources[s].request).
                filter(s => s).
                forEach(s => s.abort());
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
