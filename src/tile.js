import log from './utils/log';
import Geo from './geo';
import {StyleParser} from './styles/style_parser';
import {StyleManager} from './styles/style_manager';
import Collision from './labels/collision';
import WorkerBroker from './utils/worker_broker';
import Texture from './gl/texture';

import {mat4, vec3} from './utils/gl-matrix';

export default class Tile {

    /**
        Tile
        @constructor
        Required properties:
        coords: object with {x, y, z} properties identifying tile coordinate location
        worker: web worker to handle tile construction
    */
    constructor({ coords, style_zoom, source, worker, view }) {
        this.worker = worker;
        this.view = view;
        this.source = source;
        this.generation = null;

        this.visible = false;
        this.proxy = null;
        this.proxy_depth = 0;
        this.loading = false;
        this.loaded = false;
        this.error = null;
        this.debug = {};

        this.coords = Tile.coordinateWithMaxZoom(coords, this.source.max_zoom);
        this.style_zoom = style_zoom; // zoom level to be used for styling
        this.overzoom = Math.max(this.style_zoom - this.coords.z, 0); // number of levels of overzooming
        this.overzoom2 = Math.pow(2, this.overzoom);
        this.key = Tile.key(this.coords, this.source, this.style_zoom);
        this.min = Geo.metersForTile(this.coords);
        this.max = Geo.metersForTile({x: this.coords.x + 1, y: this.coords.y + 1, z: this.coords.z }),
        this.span = { x: (this.max.x - this.min.x), y: (this.max.y - this.min.y) };
        this.bounds = { sw: { x: this.min.x, y: this.max.y }, ne: { x: this.max.x, y: this.min.y } };
        this.center_dist = 0;

        this.meters_per_pixel = Geo.metersPerPixel(this.coords.z);
        this.units_per_pixel = Geo.units_per_pixel / this.overzoom2; // adjusted for overzoom
        this.units_per_meter_overzoom = Geo.unitsPerMeter(this.coords.z) * this.overzoom2; // adjusted for overzoom

        this.meshes = {}; // renderable VBO meshes keyed by style
        this.textures = []; // textures that the tile owns (labels, etc.)
    }

    static create(spec) {
        return new Tile(spec);
    }

    static coord(c) {
        return {x: c.x, y: c.y, z: c.z, key: Tile.coordKey(c)};
    }

    static coordKey({x, y, z}) {
        return x + '/' + y + '/' + z;
    }

    static key (coords, source, style_zoom) {
        coords = Tile.coordinateWithMaxZoom(coords, source.max_zoom);
        if (coords.y < 0 || coords.y >= (1 << coords.z) || coords.z < 0) {
            return; // cull tiles out of range (x will wrap)
        }
        return [source.name, style_zoom, coords.x, coords.y, coords.z].join('/');
    }

    static coordinateAtZoom({x, y, z, key}, zoom) {
        if (z !== zoom) {
            let zscale = Math.pow(2, z - zoom);
            x = Math.floor(x / zscale);
            y = Math.floor(y / zscale);
            z = zoom;
        }
        return Tile.coord({x, y, z});
    }

    static coordinateWithMaxZoom({x, y, z}, max_zoom) {
        if (max_zoom !== undefined && z > max_zoom) {
            return Tile.coordinateAtZoom({x, y, z}, max_zoom);
        }
        return Tile.coord({x, y, z});
    }

    static childrenForCoordinate({x, y, z, key}) {
        if (!Tile.coord_children[key]) {
            z++;
            x *= 2;
            y *= 2;
            Tile.coord_children[key] = [
                Tile.coord({x, y,      z}), Tile.coord({x: x+1, y,      z}),
                Tile.coord({x, y: y+1, z}), Tile.coord({x: x+1, y: y+1, z})
            ];
        }
        return Tile.coord_children[key];
    }

    static isDescendant(parent, descendant) {
        if (descendant.z > parent.z) {
            let {x, y} = Tile.coordinateAtZoom(descendant, parent.z);
            return (parent.x === x && parent.y === y);
        }
        return false;
    }

    // Sort a set of tile instances (which already have a distance from center tile computed)
    static sort(tiles) {
        return tiles.sort((a, b) => {
            let ad = a.center_dist;
            let bd = b.center_dist;
            return (bd > ad ? -1 : (bd === ad ? 0 : 1));
        });
    }

    // Free resources owned by tile
    freeResources () {
        if (this.meshes) {
            for (let m in this.meshes) {
                this.meshes[m].destroy();
            }
        }

        if (this.textures) {
            for (let t of this.textures) {
                Texture.release(t);
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
            source: this.source.name,
            coords: this.coords,
            min: this.min,
            max: this.max,
            units_per_pixel: this.units_per_pixel,
            meters_per_pixel: this.meters_per_pixel,
            units_per_meter_overzoom: this.units_per_meter_overzoom,
            style_zoom: this.style_zoom,
            overzoom: this.overzoom,
            overzoom2: this.overzoom2,
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

    /**
        Called on worker to cancel loading
        Static method because the worker only has object representations of tile data, there is no
        tile instance created yet.
    */
    static cancel(tile) {
        if (tile) {
            tile.canceled = true;
            if (tile.source_data && tile.source_data.request) {
                tile.source_data.request.abort();
            }
            Tile.abortBuild(tile);
        }
    }

    // Process geometry for tile - called by web worker
    // Returns a set of tile keys that should be sent to the main thread (so that we can minimize data exchange between worker and main thread)
    static buildGeometry (tile, { layers, styles, global }) {
        tile.debug.rendering = +new Date();
        tile.debug.features = 0;

        let data = tile.source_data;

        Collision.startTile(tile.key);

        // Process each top-level layer
        for (let layer_name in layers) {
            let layer = layers[layer_name];
            // Skip layers with no data source defined
            if (!layer || !layer.config.data) {
                log('warn', `Layer ${layer_name} was defined without a geometry data source and will not be rendered.`);
                continue;
            }

            // Source names don't match
            if (layer.config.data.source !== tile.source) {
                continue;
            }

            // Get data for one or more layers from source
            let source_layers = Tile.getDataForSource(data, layer.config.data, layer_name);

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

                    let context = StyleParser.getFeatureParseContext(feature, tile, global);
                    context.winding = tile.default_winding;
                    context.source = tile.source;        // add data source name
                    context.layer = source_layer.layer;  // add data source layer name

                    // Get draw groups for this feature
                    let draw_groups = layer.buildDrawGroups(context, true);
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
                            log('warn', `Style '${style_name}' not found, skipping layer '${layer_name}':`, group, feature);
                            continue;
                        }

                        context.layers = group.layers;  // add matching draw layers

                        style.addFeature(feature, group, context);
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
            queue.push(style.endData(tile).then((style_data) => {
                if (style_data) {
                    tile.mesh_data[style_name] = {
                        vertex_data: style_data.vertex_data,
                        vertex_elements: style_data.vertex_elements,
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

        // Debug
        this.debug.geometries = 0;
        this.debug.buffer_size = 0;

        // Create VBOs
        let meshes = {}, textures = []; // new resources, to be swapped in
        let mesh_data = this.mesh_data;
        if (mesh_data) {
            for (var s in mesh_data) {
                if (mesh_data[s].vertex_data) {
                    this.debug.buffer_size += mesh_data[s].vertex_data.byteLength;
                    if (mesh_data[s].vertex_elements) {
                        this.debug.buffer_size += mesh_data[s].vertex_elements.byteLength;
                    }
                    if (!styles[s]) {
                        log('warn', `Could not create mesh because style '${s}' not found, for tile ${this.key}, aborting tile`);
                        break;
                    }
                    meshes[s] = styles[s].makeMesh(mesh_data[s].vertex_data, mesh_data[s].vertex_elements, mesh_data[s]);
                    this.debug.geometries += meshes[s].geometry_count;
                }

                // Assign texture ownership to tiles
                // Note that it's valid for a single texture to be referenced from multiple styles
                // (e.g. same raster texture attached to multiple sources). This means the same
                // texture may be added to the tile's texture list more than once, which ensures
                // that it is properly released (to match its retain count).
                if (mesh_data[s].textures) {
                    mesh_data[s].textures.forEach(t => {
                        textures.push(t);
                    });
                }
            }
        }
        delete this.mesh_data; // TODO: might want to preserve this for rebuilding geometries when styles/etc. change?

        // Swap in new data, free old data
        this.freeResources();
        this.meshes = meshes;
        this.textures = textures;

        this.debug.geom_ratio = (this.debug.geometries / this.debug.features).toFixed(1);
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
                            log('trace', `releasing texture ${t} for tile ${tile.key}`);
                            texture.release();
                        }
                    }
                }
            }
        }
    }

    // Update relative to view
    update () {
        let coords = this.coords;
        if (coords.z !== this.view.center.tile.z) {
            coords = Tile.coordinateAtZoom(coords, this.view.center.tile.z);
        }
        this.center_dist = Math.abs(this.view.center.tile.x - coords.x) + Math.abs(this.view.center.tile.y - coords.y);
    }

    // Set as a proxy tile for another tile
    setProxyFor (tile) {
        this.proxy = tile;
        if (tile) {
            this.visible = true;
            this.proxy_depth = 1; // draw proxies a half-layer back (order is scaled 2x to avoid integer truncation)
            this.update();
        }
        else {
            this.proxy_depth = 0;
        }
    }

    // Update model matrix and tile uniforms
    setupProgram ({ model, model32 }, program) {
        // Tile origin
        program.uniform('4fv', 'u_tile_origin', [this.min.x, this.min.y, this.style_zoom, this.coords.z]);
        program.uniform('1f', 'u_tile_proxy_depth', this.proxy_depth);

        // Model - transform tile space into world space (meters, absolute mercator position)
        mat4.identity(model);
        mat4.translate(model, model, vec3.fromValues(this.min.x, this.min.y, 0));
        mat4.scale(model, model, vec3.fromValues(this.span.x / Geo.tile_scale, -1 * this.span.y / Geo.tile_scale, 1)); // scale tile local coords to meters
        mat4.copy(model32, model);
        program.uniform('Matrix4fv', 'u_model', model32);
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

    merge(other) {
        for (var key in other) {
            if (key !== 'key') {
                this[key] = other[key];
            }
        }
        return this;
    }

    printDebug () {
        log('debug', `Tile: debug for ${this.key}: [  ${JSON.stringify(this.debug)} ]`);
    }

}

Tile.coord_children = {}; // only allocate children coordinates once per coordinate
