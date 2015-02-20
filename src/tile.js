/*global Tile */
import Geo from './geo';
import {StyleParser} from './styles/style_parser';
import WorkerBroker from './utils/worker_broker';

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
            order: {
                min: Infinity,
                max: -Infinity
            },
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
        if (this != null && this.meshes != null) {
            for (var p in this.meshes) {
                this.meshes[p].destroy();
            }
        }
        this.meshes = {};
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
                    let layer_rules = rules[layer_name];
                    let rule = layer_rules.findMatchingRules(context, true);

                    // Parse & render styles
                    if (!rule || !rule.visible) {
                        continue;
                    }

                    // Add to style
                    rule.name = rule.name || StyleParser.defaults.style.name;
                    let style = styles[rule.name];

                    if (!tile_data[rule.name]) {
                        tile_data[rule.name] = style.startData();
                    }

                    style.addFeature(feature, rule, context, tile_data[rule.name]);

                    source.debug.features++;
                }

            }

            source.debug.rendering = +new Date() - source.debug.rendering;
        }

        // Finalize array buffer for each render style
        tile.mesh_data = {};
        let queue = [];
        for (let style_name in tile_data) {
            let style = styles[style_name];
            queue.push(style.endData(tile_data[style_name]).then((style_data) => {
                if (style_data) {
                    tile.mesh_data[style_name] = {
                        vertex_data: style_data.vertex_data,
                        uniforms: style_data.uniforms
                    };

                    // Track min/max order range
                    if (style_data.order.min < tile.order.min) {
                        tile.order.min = style_data.order.min;
                    }
                    if (style_data.order.max > tile.order.max) {
                        tile.order.max = style_data.order.max;
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
                mesh_data: true
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
    finalizeBuild(styles) {
        // Cleanup existing VBOs
        this.freeResources();

        // Create VBOs
        let mesh_data = this.mesh_data;
        for (var s in mesh_data) {
            this.meshes[s] = styles[s].makeMesh(mesh_data[s].vertex_data, { uniforms: mesh_data[s].uniforms });
        }

        this.debug.geometries = 0;
        this.debug.buffer_size = 0;
        for (var p in this.meshes) {
            this.debug.geometries += this.meshes[p].geometry_count;
            this.debug.buffer_size += this.meshes[p].vertex_data.byteLength;
        }
        this.debug.geom_ratio = (this.debug.geometries / this.debug.features).toFixed(1);

        this.mesh_data = null; // TODO: might want to preserve this for rebuilding geometries when styles/etc. change?
    }

    remove() {
        this.workerMessage('removeTile', this.key);
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

    merge(other) {
        for (var key in other) {
            if (key !== 'key') {
                this[key] = other[key];
            }
        }
        return this;
    }

}
