/*global Tile */
import {Geo} from './geo';
import {Style} from './style';
import WorkerBroker from './worker_broker';

import log from 'loglevel';

export default class Tile {

    constructor(spec = {}) {
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
            worker: null
        }, spec);
    }

    static create(spec) { return new Tile(spec); }

    freeResources() {
        if (this != null && this.gl_geometry != null) {
            for (var p in this.gl_geometry) {
                this.gl_geometry[p].destroy();
            }
            this.gl_geometry = null;
        }
    }

    destroy() {
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

    workerMessage (scene, ...message) {
        if (this.worker == null) {
            this.worker = scene.nextWorker();
        }
        return WorkerBroker.postMessage(this.worker, ...message);
    }

    build(scene) {
        scene.trackTileBuildStart(this.key);
        this.workerMessage(
            scene,
            'buildTile',
            {
                tile: this.buildAsMessage(),
                tile_source: this.tile_source.buildAsMessage(),
                layers: scene.layers_serialized,
                styles: scene.styles_serialized
            })
        .then(message => {
            scene.buildTileCompleted(message);
        });
    }

    // Process geometry for tile - called by web worker
    // Returns a set of tile keys that should be sent to the main thread (so that we can minimize data exchange between worker and main thread)
    static buildGeometry (tile, layers, styles, modes) {
        var layer, style, feature, mode;
        var vertex_data = {};
        var mode_vertex_data;

        // Build raw geometry arrays
        // Render layers, and features within each layer, in reverse order - aka top to bottom
        tile.debug.rendering = +new Date();
        tile.debug.features = 0;
        for (var layer_num = 0; layer_num < layers.length; layer_num++) {
            layer = layers[layer_num];

            // Skip layers with no styles defined, or layers set to not be visible
            if (styles.layers[layer.name] == null || styles.layers[layer.name].visible === false) {
                continue;
            }

            if (tile.layers[layer.name] != null) {
                var num_features = tile.layers[layer.name].features.length;

                for (var f = num_features-1; f >= 0; f--) {
                    feature = tile.layers[layer.name].features[f];
                    try {
                        style = Style.parseStyleForFeature(feature, layer.name, styles.layers[layer.name], tile);
                    }
                    catch(error) {
                        log.error('Tile.buildGeometry: style parse fail', feature, tile, error);
                        throw error;
                    }

                    // Skip feature?
                    if (style == null) {
                        continue;
                    }

                    // First feature in this render mode?
                    mode = modes[style.mode.name];
                    if (vertex_data[mode.name] == null) {
                        vertex_data[mode.name] = mode.vertex_layout.createVertexData();
                    }
                    mode_vertex_data = vertex_data[mode.name];

                    // Layer order: 'order' property between [-1, 1] adjusts render order of features *within* this layer
                    // Does not affect order outside of this layer, e.g. all features on previous layers are drawn underneath
                    //  this one, all features on subsequent layers are drawn on top of this one
                    style.layer_num = layer_num + 0.5;      // 'center' this layer at 0.5 above the baseline
                    style.layer_num += style.order / 2.5;   // scale [-1, 1] to [-.4, .4] to stay within layer bounds, .1 buffer to be safe

                    if (feature.geometry.type === 'Polygon') {
                        mode.buildPolygons([feature.geometry.coordinates], style, mode_vertex_data);
                    }
                    else if (feature.geometry.type === 'MultiPolygon') {
                        mode.buildPolygons(feature.geometry.coordinates, style, mode_vertex_data);
                    }
                    else if (feature.geometry.type === 'LineString') {
                        mode.buildLines([feature.geometry.coordinates], style, mode_vertex_data);
                    }
                    else if (feature.geometry.type === 'MultiLineString') {
                        mode.buildLines(feature.geometry.coordinates, style, mode_vertex_data);
                    }
                    else if (feature.geometry.type === 'Point') {
                        mode.buildPoints([feature.geometry.coordinates], style, mode_vertex_data);
                    }
                    else if (feature.geometry.type === 'MultiPoint') {
                        mode.buildPoints(feature.geometry.coordinates, style, mode_vertex_data);
                    }

                    tile.debug.features++;
                }
            }
        }

        // Finalize array buffer for each render mode
        tile.vertex_data = {};
        for (var m in vertex_data) {
            tile.vertex_data[m] = vertex_data[m].end().buffer;
        }

        tile.debug.rendering = +new Date() - tile.debug.rendering;

        // Return keys to be transfered to main thread
        return {
            vertex_data: true
        };
    }

    /**
       Called on main thread when a web worker completes processing
       for a single tile.
    */
    finalizeGeometry(modes) {
        var vertex_data = this.vertex_data;
        // Cleanup existing GL geometry objects
        this.freeResources();
        this.gl_geometry = {};

        // Create GL geometry objects
        for (var s in vertex_data) {
            this.gl_geometry[s] = modes[s].makeGLGeometry(vertex_data[s]);
        }

        this.debug.geometries = 0;
        this.debug.buffer_size = 0;
        for (var p in this.gl_geometry) {
            this.debug.geometries += this.gl_geometry[p].geometry_count;
            this.debug.buffer_size += this.gl_geometry[p].vertex_data.byteLength;
        }
        this.debug.geom_ratio = (this.debug.geometries / this.debug.features).toFixed(1);

        delete this.vertex_data; // TODO: might want to preserve this for rebuilding geometries when styles/etc. change?
    }

    remove(scene) {
        this.workerMessage(scene, 'removeTile', this.key);
    }

    showDebug(div) {
        var debug_overlay = document.createElement('div');
        debug_overlay.textContent = this.key;
        debug_overlay.style.position = 'absolute';
        debug_overlay.style.left = 0;
        debug_overlay.style.top = 0;
        debug_overlay.style.color = 'white';
        debug_overlay.style.fontSize = '16px';
        debug_overlay.style.textOutline = '1px #000000';
        div.appendChild(debug_overlay);
        div.style.borderStyle = 'solid';
        div.style.borderColor = 'white';
        div.style.borderWidth = '1px';
        return debug_overlay;
    }

    printDebug () {
        log.debug(`Tile: debug for ${this.key}: [  ${JSON.stringify(this.debug)} ]`);
    }

    updateDebugElement(div, show) {
        div.setAttribute('data-tile-key', this.key);
        div.style.width = '256px';
        div.style.height = '256px';

        if (show) {
            this.showDebug(div);
        }
    }

    // TODO: pass bounds only, rest of scene isn't needed
    updateVisibility(scene) {
        var visible = this.visible;
        this.visible = this.isInZoom(scene) && Geo.boxIntersect(this.bounds, scene.bounds_meters_buffered);
        this.center_dist = Math.abs(scene.center_meters.x - this.min.x) + Math.abs(scene.center_meters.y - this.min.y);
        return (visible !== this.visible);
    }

    // TODO: pass zoom only?
    isInZoom(scene) {
        return (Math.min(this.coords.z, this.tile_source.max_zoom || this.coords.z)) === scene.capped_zoom;
    }

    get key () {
        var {x, y, z} = this.tile_source.calculateOverZoom(this.coords);
        this.coords = {x, y, z};
        return [x, y, z].join('/');
    }

    load(scene, coords) {
        scene.trackTileSetLoadStart();
        Object.assign(this, {
            coords: coords,
            min: Geo.metersForTile(coords),
            max: Geo.metersForTile({x: coords.x + 1, y: coords.y + 1, z: coords.z }),
            loading: true
        });

        this.span = { x: (this.max.x - this.min.x), y: (this.max.y - this.min.y) };
        this.bounds = { sw: { x: this.min.x, y: this.max.y }, ne: { x: this.max.x, y: this.min.y } };
        this.build(scene);
        this.updateVisibility(scene);
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
