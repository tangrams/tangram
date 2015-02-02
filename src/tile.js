/*global Tile */
import Geo from './geo';
import {StyleParser} from './styles/style_parser';
import WorkerBroker from './worker_broker';

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
            order: {
                min: Infinity,
                max: -Infinity
            }
        });

        this.worker = worker;
        this.max_zoom = max_zoom;

        this.coords = coords;
        this.coords = this.calculateOverZoom();
        this.key = [this.coords.x, this.coords.y, this.coords.z].join('/');
        this.min = Geo.metersForTile(this.coords);
        this.max = Geo.metersForTile({x: this.coords.x + 1, y: this.coords.y + 1, z: this.coords.z }),
        this.span = { x: (this.max.x - this.min.x), y: (this.max.y - this.min.y) };
        this.bounds = { sw: { x: this.min.x, y: this.max.y }, ne: { x: this.max.x, y: this.min.y } };
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
            order: this.order,
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

        let tile_data = {};

        for (let sourceName in tile.sources) {
            let source = tile.sources[sourceName];
            source.debug.rendering = +new Date();
            source.debug.features = 0;

            // Treat top-level style rules as 'layers'
            for (let layer_name in layers) {
                let layer = layers[layer_name];
                // Skip layers with no geometry defined
                if (!layer.geometry) {
                    log.warn(`Layer ${layer} was defined without an geometry configuration and will not be rendered.`);
                    continue;
                }

                let geom = Tile.getGeometryForSource(source, layer.geometry);
                if (!geom) {
                    continue;
                }

                // Render features within each layer, in reverse order - aka top to bottom
                let num_features = geom.features.length;
                for (let f = num_features-1; f >= 0; f--) {
                    let feature = geom.features[f];
                    let context = StyleParser.getFeatureParseContext(feature, tile);

                    // Find matching rules
                    let matched_rules = [];
                    let layer_rules = rules[layer_name];
                    for (let r in layer_rules) {
                        layer_rules[r].matchFeature(context, matched_rules);
                    }

                    // Parse & render styles
                    for (let rule of matched_rules) {
                        if (!rule.visible) {
                            continue;
                        }

                        // Add to style
                        rule.name = rule.name || StyleParser.defaults.style.name;
                        let style = styles[rule.name];

                        if (!tile_data[rule.name]) {
                            tile_data[rule.name] = style.startData();
                        }

                        style.addFeature(feature, rule, context, tile_data[rule.name]);
                    }

                    source.debug.features++;
                }

            }

            source.debug.rendering = +new Date() - source.debug.rendering;
        }

        // Finalize array buffer for each render style
        tile.vertex_data = {};
        let queue = [];
        for (let style_name in tile_data) {
            let style = styles[style_name];
            queue.push(style.endData(tile_data[style_name]).then((data) => {
                if (data) {
                    tile.vertex_data[style_name] = data;

                    // Track min/max order range
                    if (tile_data[style_name].order.min < tile.order.min) {
                        tile.order.min = tile_data[style_name].order.min;
                    }
                    if (tile_data[style_name].order.max > tile.order.max) {
                        tile.order.max = tile_data[style_name].order.max;
                    }
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
                vertex_data: true
            };
        });
    }

    /**
        Retrieves geometry from a tile according to a data source definition
    */
    static getGeometryForSource (sourceData, sourceConfig) {
        var geom;

        if (sourceConfig != null) {
            // Just pass through data untouched if no data transform function defined
            // if (!source.filter) {
            //     geom = tile.layers[source.filter];
            // }
            // Pass through data but with different layer name in tile source data
            /*else*/ if (typeof sourceConfig.filter === 'string') {
                geom = sourceData.layers[sourceConfig.filter];
            }
            // Apply the transform function for post-processing
            else if (typeof sourceConfig.filter === 'function') {
                geom = sourceConfig.filter(sourceData.layers);
            }
        }

        return geom;
    }

    /**
       Called on main thread when a web worker completes processing
       for a single tile.
    */
    finalizeGeometry(styles) {
        var vertex_data = this.vertex_data;
        // Cleanup existing GL geometry objects
        this.freeResources();
        this.gl_geometry = {};

        // Create GL geometry objects
        for (var s in vertex_data) {
            this.gl_geometry[s] = styles[s].makeGLGeometry(vertex_data[s]);
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

    remove() {
        this.workerMessage('removeTile', this.key);
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

    update(scene) {
        this.visible =  (this.coords.z === Math.round(scene.zoom)) ||
                        (this.coords.z === this.max_zoom && scene.zoom >= this.max_zoom);

        this.center_dist = Math.abs(scene.center_meters.x - this.min.x) + Math.abs(scene.center_meters.y - this.min.y);
    }

    calculateOverZoom() {
        var zgap,
            {x, y, z} = this.coords;

        if (z > this.max_zoom) {
            zgap = z - this.max_zoom;
            x = ~~(x / Math.pow(2, zgap));
            y = ~~(y / Math.pow(2, zgap));
            z -= zgap;
        }

        return {x, y, z};
    }

    load(scene) {
        scene.trackTileSetLoadStart();

        this.loading = true;
        this.build(scene);
        this.update(scene);
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
