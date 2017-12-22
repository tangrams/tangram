import log from './utils/log';
import Utils from './utils/utils';
import mergeObjects from './utils/merge';
import Geo from './geo';
import {addLayerDebugEntry} from './styles/style';
import StyleParser from './styles/style_parser';
import Collision from './labels/collision';
import WorkerBroker from './utils/worker_broker';
import Task from './utils/task';
import Texture from './gl/texture';

import {mat4, vec3} from './utils/gl-matrix';

let id = 0; // unique tile id

export default class Tile {

    /**
        Tile
        @constructor
        Required properties:
        coords: object with {x, y, z} properties identifying tile coordinate location
        worker: web worker to handle tile construction
    */
    constructor({ coords, style_zoom, source, worker, view }) {
        this.id = id++;
        this.worker = worker;
        this.view = view;
        this.source = source;
        this.generation = null;
        this.valid = true;

        this.visible = false;
        this.proxy_for = null;
        this.proxy_depth = 0;
        this.proxied_as = null;
        this.fade_in = true;
        this.loading = false;
        this.loaded = false;
        this.built = false;
        this.labeled = false;
        this.error = null;
        this.debug = {};

        this.style_zoom = style_zoom; // zoom level to be used for styling
        this.coords = Tile.normalizedCoordinate(coords, this.source, this.style_zoom);
        this.key = Tile.key(this.coords, this.source, this.style_zoom);
        this.overzoom = Math.max(this.style_zoom - this.coords.z, 0); // number of levels of overzooming
        this.overzoom2 = Math.pow(2, this.overzoom);
        this.min = Geo.metersForTile(this.coords);
        this.max = Geo.metersForTile({x: this.coords.x + 1, y: this.coords.y + 1, z: this.coords.z }),
        this.span = { x: (this.max.x - this.min.x), y: (this.max.y - this.min.y) };
        this.bounds = { sw: { x: this.min.x, y: this.max.y }, ne: { x: this.max.x, y: this.min.y } };
        this.center_dist = 0;

        this.meters_per_pixel = Geo.metersPerPixel(this.style_zoom);
        this.meters_per_pixel_sq = this.meters_per_pixel * this.meters_per_pixel;
        this.units_per_pixel = Geo.units_per_pixel / this.overzoom2; // adjusted for overzoom
        this.units_per_meter_overzoom = Geo.unitsPerMeter(this.coords.z) * this.overzoom2; // adjusted for overzoom

        this.meshes = {}; // renderable VBO meshes keyed by style
        this.new_mesh_styles = []; // meshes that have been built so far in current build generation
        this.pending_label_meshes = null; // meshes that are pending collision (shouldn't be displayed yet)
    }

    static coord(c) {
        return {x: c.x, y: c.y, z: c.z, key: Tile.coordKey(c)};
    }

    static coordKey({x, y, z}) {
        return x + '/' + y + '/' + z;
    }

    static key (coords, source, style_zoom) {
        if (coords.y < 0 || coords.y >= (1 << coords.z) || coords.z < 0) {
            return; // cull tiles out of range (x will wrap)
        }
        return [source.name, style_zoom, coords.x, coords.y, coords.z].join('/');
    }

    static normalizedKey (coords, source, style_zoom) {
        return Tile.key(Tile.normalizedCoordinate(coords, source, style_zoom), source, style_zoom);
    }

    static normalizedCoordinate (coords, source, style_zoom) {
        if (source.zoom_bias) {
            coords = Tile.coordinateAtZoom(coords, Math.max(0, coords.z - source.zoom_bias)); // zoom can't go below zero
        }
        return Tile.coordinateWithMaxZoom(coords, source.max_zoom);
    }

    static coordinateAtZoom({x, y, z}, zoom) {
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

    // Free resources owned by tile
    freeResources () {
        for (let m in this.meshes) {
            this.meshes[m].forEach(m => m.destroy());
        }
        this.meshes = {};

        if (this.pending_label_meshes) {
            for (let m in this.pending_label_meshes) {
                this.pending_label_meshes[m].forEach(m => m.destroy());
            }
        }
        this.pending_label_meshes = null;
    }

    destroy() {
        Task.removeForTile(this.id);
        this.workerMessage('self.removeTile', this.key);
        this.freeResources();
        this.worker = null;
        this.valid = false;
    }

    buildAsMessage() {
        return {
            id: this.id,
            key: this.key,
            source: this.source.name,
            coords: this.coords,
            min: this.min,
            max: this.max,
            units_per_pixel: this.units_per_pixel,
            meters_per_pixel: this.meters_per_pixel,
            meters_per_pixel_sq: this.meters_per_pixel_sq,
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

    build(generation, { fade_in = true } = {}) {
        this.generation = generation;
        this.fade_in = fade_in;
        if (!this.loaded) {
            this.loading = true;
            this.built = false;
            this.labeled = false;
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
            if (tile.source_data && tile.source_data.request_id) {
                Utils.cancelRequest(tile.source_data.request_id); // cancel pending tile network request
                tile.source_data.request_id = null;
            }

            Tile.abortBuild(tile);
        }
    }

    // Process geometry for tile - called by web worker
    // Returns a set of tile keys that should be sent to the main thread (so that we can minimize data exchange between worker and main thread)
    static buildGeometry (tile, { scene_id, layers, styles, global }) {
        let data = tile.source_data;

        tile.debug.rendering = +new Date();
        tile.debug.feature_count = 0;
        tile.debug.layers = null;

        Collision.startTile(tile.id, { apply_repeat_groups: true });

        // Process each top-level layer
        for (let layer_name in layers) {
            let layer = layers[layer_name];
            // Skip layers with no data source defined
            if (!layer || !layer.config_data) {
                log('warn', `Layer ${layer_name} was defined without a geometry data source and will not be rendered.`);
                continue;
            }

            // Source names don't match
            if (layer.config_data.source !== tile.source) {
                continue;
            }

            // Get data for one or more layers from source
            let source_layers = Tile.getDataForSource(data, layer.config_data, layer_name);

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

                        // Add to style
                        let style_name = group.style || group_name;
                        let style = styles[style_name];

                        if (!style) {
                            log('warn', `Style '${style_name}' not found, skipping layer '${layer_name}':`, group, feature);
                            continue;
                        }

                        group = style.preprocess(group);
                        if (group == null || group.visible === false) {
                            continue;
                        }

                        context.layers = group.layers;  // add matching draw layers

                        style.addFeature(feature, group, context);
                    }

                    tile.debug.feature_count++;
                }
            }
        }
        tile.debug.rendering = +new Date() - tile.debug.rendering;

        // Send styles back to main thread as they finish building, in two groups: collision vs. non-collision
        let tile_styles = this.stylesForTile(tile, styles).map(s => styles[s]);
        Tile.sendStyleGroups(tile, tile_styles, { scene_id }, style => style.collision ? 'collision' : 'non-collision');
        // Tile.sendStyleGroups(tile, tile_styles, { scene_id }, style => style.name); // call for each style
        // Tile.sendStyleGroups(tile, tile_styles, { scene_id }, style => 'styles'); // all styles in single call (previous behavior)
    }

    static stylesForTile (tile, styles) {
        let tile_styles = [];
        for (let s in styles) {
            if (styles[s].hasDataForTile(tile)) {
                tile_styles.push(s);
            }
        }
        return tile_styles;
    }

    // Send groups of styles back to main thread, asynchronously (as they finish building),
    // grouped by the provided function
    static sendStyleGroups(tile, styles, { scene_id }, group_by) {
        // Group styles
        let groups = {};
        styles.forEach(s => {
            let group_name = group_by(s);
            groups[group_name] = groups[group_name] || [];
            groups[group_name].push(s);
        });

        if (Object.keys(groups).length > 0) {
            let progress = { start: true };
            tile.mesh_data = {};

            for (let group_name in groups) {
                let group = groups[group_name];

                Promise.all(group.map(style => {
                    return style.endData(tile).then(style_data => {
                        if (style_data) {
                            tile.mesh_data[style.name] = style_data;
                        }
                    });
                }))
                .then(() => {
                    log('trace', `Finished style group '${group_name}' for tile ${tile.key}`);

                    // Clear group and check if all groups finished
                    groups[group_name] = [];
                    if (Object.keys(groups).every(g => groups[g].length === 0)) {
                        progress.done = true;
                    }

                    // Send meshes to main thread
                    WorkerBroker.postMessage(
                        `TileManager_${scene_id}.buildTileStylesCompleted`,
                        WorkerBroker.withTransferables({ tile: Tile.slice(tile, ['mesh_data']), progress })
                    );
                    progress.start = null;
                    tile.mesh_data = {}; // reset so each group sends separate set of style meshes

                    if (progress.done) {
                        Collision.resetTile(tile.id); // clear collision if we're done with the tile
                    }
                })
                .catch((e) => {
                    log('error', `Error for style group '${group_name}' for tile ${tile.key}`, e.stack);
                });
            }
        }
        else {
            // Nothing to build, return empty tile to main thread
            WorkerBroker.postMessage(
                `TileManager_${scene_id}.buildTileStylesCompleted`,
                WorkerBroker.withTransferables({ tile: Tile.slice(tile), progress: { start: true, done: true } })
            );
            Collision.resetTile(tile.id); // clear collision if we're done with the tile
        }
    }

    /**
        Retrieves geometry from a tile according to a data source definition
        Returns an array of objects with:
            layer: source layer name
            geom: GeoJSON FeatureCollection
    */
    static getDataForSource (source_data, source_config, default_layer = null) {
        var layers = [];

        if (source_config != null && source_data != null && source_data.layers != null) {
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
    buildMeshes(styles, progress) {
        if (this.error) {
            return;
        }

        // Debug
        if (progress.start) {
            this.debug.geometry_count = 0;
            this.debug.buffer_size = 0;
        }

        // Create VBOs
        let meshes = {}; // new data to be added to tile
        let mesh_data = this.mesh_data;
        if (mesh_data) {
            for (let s in mesh_data) {
                for (let variant in mesh_data[s].meshes) {
                    let mesh_variant = mesh_data[s].meshes[variant];
                    if (mesh_variant.vertex_data) {
                        if (!styles[s]) {
                            log('warn', `Could not create mesh because style '${s}' not found, for tile ${this.key}, aborting tile`);
                            break;
                        }

                        // first add style-level uniforms, then add any mesh-specific ones
                        let mesh_options = Object.assign({}, mesh_data[s]);
                        mesh_options.uniforms = Object.assign({}, mesh_options.uniforms, mesh_variant.uniforms);
                        mesh_options.variant = mesh_variant.variant;

                        // for labels, keep buffer data on CPU so they can be modified later
                        if (mesh_variant.labels) {
                            mesh_options.retain = true;
                        }

                        let mesh = styles[s].makeMesh(mesh_variant.vertex_data, mesh_variant.vertex_elements, mesh_options);
                        mesh.variant = mesh_options.variant;
                        mesh.labels = mesh_variant.labels;
                        meshes[s] = meshes[s] || [];
                        meshes[s].push(mesh);
                        if (mesh.variant.order == null) {
                            mesh.variant.order = meshes[s].length - 1; // assign default variant render order
                        }

                        this.debug.buffer_size += mesh.buffer_size;
                        this.debug.geometry_count += mesh.geometry_count;
                    }
                }

                // Sort mesh variants by explicit render order (if present)
                if (meshes[s]) {
                    meshes[s].sort((a, b) => {
                        // Sort variant order ascending if present, then all null values (where order is unspecified)
                        let ao = a.variant.order, bo = b.variant.order;
                        return (ao == null ? 1 : (bo == null ? -1 : (ao < bo ? -1 : 1)));
                    });
                }
            }
        }
        delete this.mesh_data;

        // New meshes
        for (let m in meshes) {
            // swap in non-collision meshes right away
            if (!styles[m].collision) {
                if (this.meshes[m]) {
                    this.meshes[m].forEach(m => m.destroy()); // free old meshes
                }

                this.meshes[m] = meshes[m]; // set new mesh
                this.new_mesh_styles.push(m);
            }
            // keep label meshes out of view until collision is complete
            else {
                this.pending_label_meshes = this.pending_label_meshes || {};
                this.pending_label_meshes[m] = meshes[m];
              }
        }

        if (progress.done) {
            // Release un-replaced meshes (existing in previous generation, but weren't built for this one)
            for (let m in this.meshes) {
                if (this.new_mesh_styles.indexOf(m) === -1 && (!this.pending_label_meshes || this.pending_label_meshes[m] == null)) {
                    this.meshes[m].forEach(m => m.destroy());
                    delete this.meshes[m];
                }
            }
            this.new_mesh_styles = [];

            this.debug.geometry_ratio = (this.debug.geometry_count / this.debug.feature_count).toFixed(1);
            this.printDebug();
        }
    }

    // How many styles are currently pending label collision
    pendingLabelStyleCount () {
        return this.pending_label_meshes ? Object.keys(this.pending_label_meshes).length : 0;
    }

    // Swap label style meshes after collision is complete
    swapPendingLabels () {
        this.labeled = true; // mark as labeled

        if (this.pending_label_meshes) {
            for (let m in this.pending_label_meshes) {
                if (this.meshes[m]) {
                    this.meshes[m].forEach(m => m.destroy()); // free old meshes
                }

                this.meshes[m] = this.pending_label_meshes[m]; // set new mesh
            }
            this.pending_label_meshes = null;
        }
    }

    /**
        Called on main thread when web worker completes processing, but tile has since been discarded
        Frees resources that would have been transferred to the tile object.
        Static method because the tile object no longer exists (the tile data returned by the worker is passed instead).
    */
    static abortBuild (tile) {
        Task.removeForTile(tile.id);
        Collision.abortTile(tile.id);

        // Releases meshes
        if (tile.mesh_data) {
            for (let s in tile.mesh_data) {
                let textures = tile.mesh_data[s].textures;
                if (textures) {
                    textures.forEach(t => {
                        let texture = Texture.textures[t];
                        if (texture) {
                            log('trace', `releasing texture ${t} for tile ${tile.key}`);
                            texture.release();
                        }
                    });
                }
            }
        }
    }

    // Set as a proxy tile for another tile
    setProxyFor (tile) {
        if (tile) {
            this.visible = true;
            this.proxy_for = this.proxy_for || [];
            this.proxy_for.push(tile);
            this.proxy_depth = 1; // draw proxies a half-layer back (order is scaled 2x to avoid integer truncation)
            tile.proxied_as = (tile.style_zoom > this.style_zoom ? 'child' : 'parent');
        }
        else {
            this.proxy_for = null;
            this.proxy_depth = 0;
        }
    }

    isProxy () {
        return this.proxy_for != null;
    }

    // Proxy tiles only need to render a specific style if any of the tiles they are proxying *for*
    // haven't finished loading that style yet. If all proxied tiles *have* data for that style, then it's
    // safe to hide the proxy tile's version.
    shouldProxyForStyle (style) {
        return !this.proxy_for || this.proxy_for.some(t => t.meshes[style] == null);
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

        // Fade in labels according to proxy status, avoiding "flickering" where
        // labels quickly go from invisible back to visible
        program.uniform('1i', 'u_tile_fade_in', this.fade_in && this.proxied_as !== 'child');
    }

    // Slice a subset of keys out of a tile
    // Includes a minimum set of pre-defined keys for load state, debug. etc.
    // We use this to send a subset of the tile back to the main thread, to minimize unnecessary data transfer
    // (e.g. very large items like feature geometry are not needed on the main thread)
    static slice (tile, keys) {
        let keep = [
            'id',
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
        for (let k=0; k < keep.length; k++) {
            const key = keep[k];
            tile_subset[key] = tile[key];
        }

        return tile_subset;
    }

    merge (other) {
        this.loading = other.loading;
        this.loaded = other.loaded;
        this.generation = other.generation;
        this.error = other.error;
        this.mesh_data = other.mesh_data;
        this.debug = mergeObjects(this.debug, other.debug);
        return this;
    }

    printDebug (exclude = ['layers']) {
        let copy = {};
        for (let key in this.debug) {
            if (exclude.indexOf(key) === -1) {
                copy[key] = this.debug[key];
            }
        }

        log('debug', `Tile: debug for ${this.key}: [  ${JSON.stringify(copy)} ]`);
    }

    // Sum up layer feature/geometry stats from a set of tiles
    static debugSumLayerStats (tiles) {
        let list = {}, tree = {};

        tiles.filter(tile => tile.debug.layers).forEach(tile => {
            // layer list
            Object.keys(tile.debug.layers.list).forEach(layer => {
                let counts = tile.debug.layers.list[layer];
                addLayerDebugEntry(list, layer, counts.features, counts.geoms, counts.styles, counts.base);
            });

            // layer tree
            addDebugLayers(tile.debug.layers.tree, tree);
        });

        return { list, tree };
    }

}

Tile.coord_children = {}; // only allocate children coordinates once per coordinate

// build debug stats layer tree
function addDebugLayers (node, tree) {
    for (let layer in node) {
        let counts = node[layer];
        addLayerDebugEntry(tree, layer, counts.features, counts.geoms, counts.styles, counts.base);
        if (counts.layers) {
            tree[layer].layers = tree[layer].layers || {};
            addDebugLayers(counts.layers, tree[layer].layers); // process child layers
        }
    }
}
