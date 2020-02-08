import log from '../utils/log';
import Utils from '../utils/utils';
import mergeObjects from '../utils/merge';
import Geo from '../utils/geo';
import {TileID} from './tile_id';
import {addLayerDebugEntry} from '../styles/style';
import StyleParser from '../styles/style_parser';
import Collision from '../labels/collision';
import WorkerBroker from '../utils/worker_broker';
import Task from '../utils/task';
import Texture from '../gl/texture';

import {mat4, vec3} from '../utils/gl-matrix';

let id = 0; // unique tile id
let build_id = 0; // id tracking order in which tiles were build

export default class Tile {

    /**
        Tile
        @constructor
        Required properties:
        coords: object with {x, y, z} properties identifying tile coordinate location
        worker: web worker to handle tile construction
    */
    constructor({ coords, style_z, source, workers, view }) {
        this.id = id++;
        this.view = view;
        this.source = source;
        this.generation = null;
        this.valid = true;

        this.visible = false;
        this.proxy_for = null;
        this.proxied_as = null;
        this.proxy_level = 0;
        this.proxy_order_offset = 0;
        this.fade_in = true;
        this.loading = false;
        this.loaded = false;
        this.built = false;
        this.labeled = false;
        this.error = null;
        this.debug = {};

        this.style_z = style_z; // zoom level to be used for styling
        this.coords = TileID.normalizedCoord(coords, this.source);
        this.key = TileID.key(this.coords, this.source, this.style_z);
        this.overzoom = Math.max(this.style_z - this.coords.z, 0); // number of levels of overzooming
        this.overzoom2 = Math.pow(2, this.overzoom);
        this.min = Geo.metersForTile(this.coords);
        this.max = Geo.metersForTile({x: this.coords.x + 1, y: this.coords.y + 1, z: this.coords.z }),
        this.span = { x: (this.max.x - this.min.x), y: -(this.max.y - this.min.y) };
        this.bounds = { sw: { x: this.min.x, y: this.max.y }, ne: { x: this.max.x, y: this.min.y } };

        this.meters_per_pixel = Geo.metersPerPixel(this.style_z);
        this.meters_per_pixel_sq = this.meters_per_pixel * this.meters_per_pixel;
        this.units_per_pixel = Geo.units_per_pixel / this.overzoom2; // adjusted for overzoom
        this.units_per_meter_overzoom = Geo.unitsPerMeter(this.coords.z) * this.overzoom2; // adjusted for overzoom
        this.preserve_tiles_within_zoom = this.source.preserve_tiles_within_zoom; // source-specific tile retention policy

        this.meshes = {}; // renderable VBO meshes keyed by style
        this.new_mesh_styles = []; // meshes that have been built so far in current build generation
        this.pending_label_meshes = null; // meshes that are pending collision (shouldn't be displayed yet)

        this.setWorker(workers);
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
            style_z: this.style_z,
            overzoom: this.overzoom,
            overzoom2: this.overzoom2,
            generation: this.generation,
            debug: this.debug
        };
    }

    // Find the appropriate worker thread for this tile
    setWorker (workers) {
        if (this.source.tiled) {
            // Pin tile to a worker thread based on its coordinates
            this.worker_id = Math.abs(this.coords.x + this.coords.y + this.coords.z) % workers.length;
        }
        else {
            // Pin all tiles from each non-tiled source to a single worker
            // Prevents data for these sources from being loaded more than once
            this.worker_id = this.source.id % workers.length;
        }

        this.worker = workers[this.worker_id];
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

        tile.debug.building = +new Date();
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

            // Build features in layer
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

                    // Build draw groups
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
        tile.debug.building = +new Date() - tile.debug.building;

        // Send styles back to main thread as they finish building, in two groups: collision vs. non-collision
        let tile_styles = this.stylesForTile(tile, styles).map(s => styles[s]);
        Tile.buildStyleGroups(tile, tile_styles, scene_id, style => style.collision ? 'collision' : 'non-collision');
        // Tile.buildStyleGroups(tile, tile_styles, scene_id, style => style.name); // call for each style
        // Tile.buildStyleGroups(tile, tile_styles, scene_id, style => 'styles'); // all styles in single call (previous behavior)
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

    // Build styles (grouped by the provided function) and send back to main thread as they finish building
    static buildStyleGroups(tile, styles, scene_id, group_by) {
        // Group the styles; each group will be sent to the main thread when the styles in the group finish building.
        const groups = styles.reduce((groups, style) => {
            const group = group_by(style);
            groups[group] = groups[group] || [];
            groups[group].push(style);
            return groups;
        }, {});

        // If nothing to build, return empty tile to main thread
        if (Object.keys(groups).length === 0) {
            WorkerBroker.postMessage(
                `TileManager_${scene_id}.buildTileStylesCompleted`,
                WorkerBroker.withTransferables({ tile: Tile.slice(tile), progress: { start: true, done: true } })
            );
            Collision.resetTile(tile.id); // clear collision if we're done with the tile
            return;
        }

        // Build each group of styles
        const progress = {};
        for (const group_name in groups) {
            Tile.buildStyleGroup({ group_name, groups, tile, progress, scene_id });
        }
    }

    // Build a single group of styles
    static async buildStyleGroup({ group_name, groups, tile, progress, scene_id }) {
        const group = groups[group_name];
        const mesh_data = {};
        try {
            // For each group, build all styles in the group
            await Promise.all(group.map(async (style) => {
                const style_data = await style.endData(tile);
                if (style_data) {
                    mesh_data[style.name] = style_data;
                }
            }));

            // Mark the group as done, and check if all groups have finished
            log('trace', `Finished style group '${group_name}' for tile ${tile.key}`);
            groups[group_name] = null;
            if (Object.keys(groups).every(g => groups[g] == null)) {
                progress.done = true;
            }

            // Send meshes to main thread
            WorkerBroker.postMessage(
                `TileManager_${scene_id}.buildTileStylesCompleted`,
                WorkerBroker.withTransferables({ tile: { ...Tile.slice(tile), mesh_data }, progress })
            );
            if (progress.done) {
                Collision.resetTile(tile.id); // clear collision if we're done with the tile
            }
        }
        catch (e) {
            log('error', `Error for style group '${group_name}' for tile ${tile.key}`, (e && e.stack) || e);
        }
    }

    /**
        Retrieves geometry from a tile according to a data source definition
        Returns an array of objects with:
            layer: source layer name
            geom: GeoJSON FeatureCollection
    */
    static getDataForSource (source_data, source_config, scene_layer_name) {
        var layers = [];

        if (source_config != null && source_data != null && source_data.layers != null) {
            // If source wildcard is specified, combine all source layers
            if (source_config.all_layers === true) {
                // Wildcard takes precedence over explicit source layer(s)
                if (source_config.layer != null) {
                    const msg = `Layer ${scene_layer_name} includes both 'all_layers: true' and an explicit ` +
                        '\'layer\' keyword in its \'data\' block. \'all_layers: true\' takes precedence, \'layer\' ' +
                        'will be ignored.';
                    log({ level: 'warn', once: true }, msg);
                }

                for (const layer in source_data.layers) {
                    layers.push({ layer, geom: source_data.layers[layer] });
                }
            }
            // If no source layer specified, and a default data source layer exists
            else if (!source_config.layer && source_data.layers._default) {
                layers.push({
                    geom: source_data.layers._default
                });
            }
            // If no source layer is specified, and a layer for the scene layer name exists
            else if (!source_config.layer && scene_layer_name) {
                layers.push({
                    layer: scene_layer_name,
                    geom: source_data.layers[scene_layer_name]
                });
            }
            // If a source layer is specified by name, use it
            else if (typeof source_config.layer === 'string') {
                layers.push({
                    layer: source_config.layer,
                    geom: source_data.layers[source_config.layer]
                });
            }
            // If multiple source layers are specified by name, combine them
            else if (Array.isArray(source_config.layer)) {
                source_config.layer.forEach(layer => {
                    layers.push({ layer, geom: source_data.layers[layer] });
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

        this.build_id = build_id++; // record order in which tile was built

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
                        if (mesh.variant.mesh_order == null) {
                            mesh.variant.mesh_order = meshes[s].length - 1; // assign default variant render order
                        }

                        this.debug.buffer_size += mesh.buffer_size;
                        this.debug.geometry_count += mesh.geometry_count;
                    }
                }

                // Sort mesh variants by explicit render order (if present)
                if (meshes[s]) {
                    meshes[s].sort((a, b) => {
                        // Sort variant order ascending if present, then all null values (where order is unspecified)
                        let ao = a.variant.mesh_order, bo = b.variant.mesh_order;
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
        }
        this.printDebug(progress);
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
            this.proxy_order_offset = 1; // draw proxies a half-layer back (order is scaled 2x to avoid integer truncation)
            tile.proxied_as = (tile.style_z > this.style_z ? 'child' : 'parent');
            this.proxy_level = Math.abs(tile.style_z - this.style_z); // # of zoom levels proxy is above/below target tile
        }
        else {
            this.proxy_for = null;
            this.proxy_order_offset = 0;
            this.proxy_level = 0;
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
        program.uniform('4fv', 'u_tile_origin', [this.min.x, this.min.y, this.style_z, this.coords.z]);
        program.uniform('1f', 'u_tile_proxy_order_offset', this.proxy_order_offset);

        // Model - transform tile space into world space (meters, absolute mercator position)
        mat4.identity(model);
        mat4.translate(model, model, vec3.fromValues(this.min.x, this.min.y, 0));
        mat4.scale(model, model, vec3.fromValues(this.span.x / Geo.tile_scale, this.span.y / Geo.tile_scale, 1)); // scale tile local coords to meters
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

    printDebug (progress) {
        const exclude = ['layers'];
        let copy = {};
        for (let key in this.debug) {
            if (exclude.indexOf(key) === -1) {
                copy[key] = this.debug[key];
            }
        }

        log('debug', `Tile ${progress.done ? '(done)' : ''}: debug for ${this.key}: [  ${JSON.stringify(copy)} ]`);
    }

}

Tile.coord_children = {}; // only allocate children coordinates once per coordinate

// Sum up layer feature/geometry stats from a set of tiles
export function debugSumLayerStats(tiles) {
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
