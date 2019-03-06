/*jshint worker: true*/

import Utils from '../utils/utils';
import {compileFunctionStrings, functionStringCache, clearFunctionStringCache} from '../utils/functions';
import debugSettings, {mergeDebugSettings} from '../utils/debug_settings';
import log from '../utils/log';
import WorkerBroker from '../utils/worker_broker'; // jshint ignore:line
import Tile from '../tile/tile';
import Geo from '../utils/geo';
import DataSource from '../sources/data_source';
import '../sources/sources';
import FeatureSelection from '../selection/selection';
import StyleParser from '../styles/style_parser';
import {StyleManager} from '../styles/style_manager';
import {parseLayers, FilterOptions, layerCache} from '../styles/layer';
import {buildFilter} from '../styles/filter';
import Texture from '../gl/texture';
import VertexElements from '../gl/vertex_elements';
import Label from '../labels/label';

const SceneWorker = Object.assign(self, {

    FeatureSelection,

    sources: {},
    styles: {},
    layers: {},
    tiles: {},

    // Initialize worker
    init (scene_id, worker_id, num_workers, log_level, device_pixel_ratio, has_element_index_unit, external_scripts) {
        this.scene_id = scene_id;
        this._worker_id = worker_id;
        this.num_workers = num_workers;
        log.setLevel(log_level);
        Utils.device_pixel_ratio = device_pixel_ratio;
        VertexElements.setElementIndexUint(has_element_index_unit);
        FeatureSelection.setPrefix(this._worker_id);
        this.style_manager = new StyleManager();
        this.importExternalScripts(external_scripts);
        Label.id_prefix = worker_id;
        Label.id_multiplier = num_workers;
        return worker_id;
    },

    // Import custom external scripts
    importExternalScripts(scripts) {
        if (scripts.length === 0) {
            return;
        }
        log('debug', 'loading custom data source scripts in worker:', scripts);

        // `window` is already shimmed to allow compatibility with some other libraries (e.g. FontFaceObserver)
        // So there's an extra dance here to look for any additional `window` properties added by these script imports,
        // then add them to the worker `self` scope.
        let prev_names = Object.getOwnPropertyNames(window);

        importScripts(...scripts);

        Object.getOwnPropertyNames(window).forEach(prop => {
            if (prev_names.indexOf(prop) === -1) {
                this[prop] = window[prop]; // new property added to window, also add it to self
            }
        });
    },

    // Starts a config refresh
    updateConfig ({ config, generation, introspection }, debug) {
        config = JSON.parse(config);
        mergeDebugSettings(debug);

        this.generation = generation;
        this.introspection = introspection;

        // Expand global properties
        this.global = compileFunctionStrings(config.global);

        // Create data sources
        this.createDataSources(config);

        // Expand styles
        config.styles = compileFunctionStrings(config.styles, StyleParser.wrapFunction);
        this.styles = this.style_manager.build(config.styles);
        this.style_manager.initStyles({
            generation: this.generation,
            styles: this.styles,
            sources: this.sources,
            introspection: this.introspection
        });

        // Parse each top-level layer as a separate tree
        this.layers = parseLayers(config.layers, this.style_manager.styles);

        // Sync tetxure info from main thread
        this.syncing_textures = this.syncTextures(config.textures);

        // Return promise for when config refresh finishes
        this.configuring = this.syncing_textures.then(() => {
            log('debug', 'updated config');
        });

        return this.configuring;
    },

    // Create data sources and clear tile cache if necessary
    createDataSources (config) {
        // Save and compare previous sources
        this.last_config_sources = this.config_sources || {};
        this.config_sources = config.sources;
        let last_sources = this.sources;
        let changed = [];

        // Parse new sources
        this.sources = {}; // clear previous sources
        for (let name in config.sources) {
            if (JSON.stringify(this.last_config_sources[name]) === JSON.stringify(config.sources[name])) {
                this.sources[name] = last_sources[name];
                continue;
            }

            // compile any user-defined JS functions
            config.sources[name] = compileFunctionStrings(config.sources[name]);

            let source;
            try {
                source = DataSource.create(Object.assign({}, config.sources[name], {name}), this.sources);
            }
            catch(e) {
                continue;
            }

            if (!source) {
                continue;
            }
            this.sources[name] = source;
            changed.push(name);
        }

        // Clear tile cache for data sources that changed
        changed.forEach(source => {
            for (let t in this.tiles) {
                if (this.tiles[t].source === source) {
                    delete this.tiles[t];
                }
            }
        });
    },

    // Returns a promise that fulfills when config refresh is finished
    awaitConfiguration () {
        return this.configuring;
    },

    // Build a tile: load from tile source if building for first time, otherwise rebuild with existing data
    buildTile ({ tile }) {
        // Tile cached?
        if (this.getTile(tile.key) != null) {
            // Already loading?
            if (this.getTile(tile.key).loading === true) {
                return;
            }
        }

        // Update tile cache
        tile = this.tiles[tile.key] = Object.assign(this.getTile(tile.key) || {}, tile);

        // Update config (styles, etc.), then build tile
        return this.awaitConfiguration().then(() => {
            // First time building the tile
            if (tile.loaded !== true) {

                tile.loading = true;
                tile.loaded = false;
                tile.error = null;

                this.loadTileSourceData(tile).then(() => {
                    if (!this.getTile(tile.key)) {
                        log('trace', `stop tile build after data source load because tile was removed: ${tile.key}`);
                        return;
                    }

                    // Warn and continue on data source error
                    if (tile.source_data.error) {
                        log('warn', `tile load error(s) for ${tile.key}: ${tile.source_data.error}`);
                    }

                    tile.loading = false;
                    tile.loaded = true;
                    Tile.buildGeometry(tile, this);
                }).catch((error) => {
                    tile.loading = false;
                    tile.loaded = false;
                    tile.error = error.stack;
                    log('error', `tile load error for ${tile.key}: ${tile.error}`);

                    // Send error to main thread
                    WorkerBroker.postMessage(`TileManager_${this.scene_id}.buildTileError`, Tile.slice(tile));
                });
            }
            // Tile already loaded, just rebuild
            else {
                log('trace', `used worker cache for tile ${tile.key}`);

                // Build geometry
                try {
                    Tile.buildGeometry(tile, this);
                }
                catch(error) {
                    // Send error to main thread
                    tile.error = error.toString();
                    WorkerBroker.postMessage(`TileManager_${this.scene_id}.buildTileError`, Tile.slice(tile));
                }
            }
        });
    },

    // Load this tile's data source, or copy from an existing tile's data
    loadTileSourceData (tile) {
        const source = this.sources[tile.source];
        if (source) {
            // Search existing tiles to see if we can reuse existing source data for this coordinate
            for (const t in this.tiles) {
                const ref = this.tiles[t];
                if (ref.source === tile.source &&
                    ref.coords.key === tile.coords.key &&
                    ref.loaded) {
                    return Promise.resolve(source.copyTileData(ref, tile));
                }
            }

            // Load new tile data (no existing data found)
            return source.load(tile);
        }
        else {
            tile.source_data = {};
            return Promise.resolve(tile);
        }
    },

    getTile(key) {
        return this.tiles[key];
    },

    // Remove tile
    removeTile (key) {
        var tile = this.tiles[key];

        if (tile != null) {
            // Cancel if loading
            if (tile.loading === true) {
                log('trace', `cancel tile load for ${key}`);
                tile.loading = false;
                Tile.cancel(tile);
            }

            // Remove from cache
            FeatureSelection.clearTile(key);
            delete this.tiles[key];
            log('trace', `remove tile from cache for ${key}`);
        }
    },

    // Query features within visible tiles, with optional filter conditions
    queryFeatures ({ filter, visible, geometry, tile_keys }) {
        let features = [];
        let tiles = tile_keys.map(t => this.tiles[t]).filter(t => t);

        // Compile feature filter
        if (filter != null) {
            filter = ['{', '['].indexOf(filter[0]) > -1 ? JSON.parse(filter) : filter; // de-serialize if looks like an object
            filter = compileFunctionStrings(filter, StyleParser.wrapFunction);
        }
        filter = buildFilter(filter, FilterOptions);

        tiles.forEach(tile => {
            for (let layer in tile.source_data.layers) {
                let data = tile.source_data.layers[layer];
                data.features.forEach(feature => {
                    // Optionally check if feature is visible (e.g. was rendered for current generation)
                    const feature_visible = (feature.generation === this.generation);
                    if ((visible === true && !feature_visible) ||
                        (visible === false && feature_visible)) {
                        return;
                    }

                    // Apply feature filter
                    let context = StyleParser.getFeatureParseContext(feature, tile, this.global);
                    context.source = tile.source;  // add data source name
                    context.layer = layer;         // add data source layer name

                    if (!filter(context)) {
                        return;
                    }

                    // Info to return with each feature
                    let subset = {
                        type: feature.type,
                        properties: Object.assign({}, feature.properties, {
                            $source: context.source,
                            $layer: context.layer,
                            $geometry: context.geometry,
                            $visible: feature_visible
                        })
                    };

                    // Optionally include geometry in response
                    if (geometry === true) {
                        // Transform back to lat lng (copy geometry to avoid local modification)
                        subset.geometry = Geo.copyGeometry(feature.geometry);
                        Geo.tileSpaceToLatlng(subset.geometry, tile.coords.z, tile.min);
                    }

                    features.push(subset);
                });
            }
        });
        return features;
    },

    // Get a feature from the selection map
    getFeatureSelection ({ id, key } = {}) {
        var selection = FeatureSelection.map[key];

        return {
            id: id,
            feature: (selection && selection.feature)
        };
    },

    // Resets the feature selection state
    resetFeatureSelection (sources = null) {
        FeatureSelection.reset(sources);
    },

    // Selection map size for this worker
    getFeatureSelectionMapSize () {
        return FeatureSelection.getMapSize();
    },

    // Texture info needs to be synced from main thread, e.g. width/height, which we only know after the texture loads
    syncTextures (tex_config) {
        let textures = [];
        if (tex_config) {
            textures.push(...Object.keys(tex_config));
        }

        log('trace', 'sync textures to worker:', textures);
        if (textures.length > 0) {
            return Texture.syncTexturesToWorker(textures);
        }
        return Promise.resolve();
    },

    // Sync device pixel ratio from main thread
    updateDevicePixelRatio (device_pixel_ratio) {
        Utils.device_pixel_ratio = device_pixel_ratio;
    },

    clearFunctionStringCache () {
        clearFunctionStringCache();
    },

    // Profiling helpers
    profile (name) {
        console.profile(`worker ${this._worker_id}: ${name}`); // eslint-disable-line no-console
    },

    profileEnd (name) {
        console.profileEnd(`worker ${this._worker_id}: ${name}`); // eslint-disable-line no-console
    },

    debug: {
        debugSettings,
        layerCache,
        functionStringCache
    }

});

WorkerBroker.addTarget('self', SceneWorker);
