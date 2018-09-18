/*jshint worker: true*/
import Thread from './utils/thread';
import Utils from './utils/utils';
import {mergeDebugSettings} from './utils/debug_settings';
import log from './utils/log';
import WorkerBroker from './utils/worker_broker'; // jshint ignore:line
import Tile from './tile';
import Geo from './geo';
import DataSource from './sources/data_source';
import FeatureSelection from './selection';
import StyleParser from './styles/style_parser';
import {StyleManager} from './styles/style_manager';
import {parseLayers, FilterOptions} from './styles/layer';
import {buildFilter} from './styles/filter';
import Texture from './gl/texture';
import VertexElements from './gl/vertex_elements';
import Label from './labels/label';

export var SceneWorker = self;

// Worker functionality will only be defined in worker thread
if (Thread.is_worker) {

Object.assign(self, {

    FeatureSelection,

    sources: {},
    styles: {},
    layers: {},
    tiles: {},

    // Initialize worker
    init (scene_id, worker_id, num_workers, log_level, device_pixel_ratio, has_element_index_unit, external_scripts) {
        self.scene_id = scene_id;
        self._worker_id = worker_id;
        self.num_workers = num_workers;
        log.setLevel(log_level);
        Utils.device_pixel_ratio = device_pixel_ratio;
        VertexElements.setElementIndexUint(has_element_index_unit);
        FeatureSelection.setPrefix(self._worker_id);
        self.style_manager = new StyleManager();
        self.importExternalScripts(external_scripts);
        Label.id_prefix = worker_id;
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
                self[prop] = window[prop]; // new property added to window, also add it to self
            }
        });
    },

    // Starts a config refresh
    updateConfig ({ config, generation, introspection }, debug) {
        config = JSON.parse(config);
        mergeDebugSettings(debug);

        self.generation = generation;
        self.introspection = introspection;

        // Expand global properties
        self.global = Utils.stringsToFunctions(config.global);

        // Create data sources
        self.createDataSources(config);

        // Expand styles
        config.styles = Utils.stringsToFunctions(config.styles, StyleParser.wrapFunction);
        self.styles = self.style_manager.build(config.styles);
        self.style_manager.initStyles({
            generation: self.generation,
            styles: self.styles,
            sources: self.sources,
            introspection: self.introspection
        });

        // Parse each top-level layer as a separate tree
        self.layers = parseLayers(config.layers, self.style_manager.styles);

        // Sync tetxure info from main thread
        self.syncing_textures = self.syncTextures(config.textures);

        // Return promise for when config refresh finishes
        self.configuring = self.syncing_textures.then(() => {
            log('debug', `updated config`);
        });

        return self.configuring;
    },

    // Create data sources and clear tile cache if necessary
    createDataSources (config) {
        // Save and compare previous sources
        self.last_config_sources = self.config_sources || {};
        self.config_sources = config.sources;
        let last_sources = self.sources;
        let changed = [];

        // Parse new sources
        config.sources = Utils.stringsToFunctions(config.sources);
        self.sources = {}; // clear previous sources
        for (let name in config.sources) {
            if (JSON.stringify(self.last_config_sources[name]) === JSON.stringify(config.sources[name])) {
                self.sources[name] = last_sources[name];
                continue;
            }

            let source;
            try {
                source = DataSource.create(Object.assign({}, config.sources[name], {name}), self.sources);
            }
            catch(e) {
                continue;
            }

            if (!source) {
                continue;
            }
            self.sources[name] = source;
            changed.push(name);
        }

        // Clear tile cache for data sources that changed
        changed.forEach(source => {
            for (let t in self.tiles) {
                if (self.tiles[t].source === source) {
                    delete self.tiles[t];
                }
            }
        });
    },

    // Returns a promise that fulfills when config refresh is finished
    awaitConfiguration () {
        return self.configuring;
    },

    // Build a tile: load from tile source if building for first time, otherwise rebuild with existing data
    buildTile ({ tile }) {
        // Tile cached?
        if (self.getTile(tile.key) != null) {
            // Already loading?
            if (self.getTile(tile.key).loading === true) {
                return;
            }
        }

        // Update tile cache
        tile = self.tiles[tile.key] = Object.assign(self.getTile(tile.key) || {}, tile);

        // Update config (styles, etc.), then build tile
        return self.awaitConfiguration().then(() => {
            // First time building the tile
            if (tile.loaded !== true) {

                tile.loading = true;
                tile.loaded = false;
                tile.error = null;

                self.loadTileSourceData(tile).then(() => {
                    if (!self.getTile(tile.key)) {
                        log('trace', `stop tile build after data source load because tile was removed: ${tile.key}`);
                        return;
                    }

                    // Warn and continue on data source error
                    if (tile.source_data.error) {
                        log('warn', `tile load error(s) for ${tile.key}: ${tile.source_data.error}`);
                    }

                    tile.loading = false;
                    tile.loaded = true;
                    Tile.buildGeometry(tile, self);
                }).catch((error) => {
                    tile.loading = false;
                    tile.loaded = false;
                    tile.error = error.stack;
                    log('error', `tile load error for ${tile.key}: ${tile.error}`);

                    // Send error to main thread
                    WorkerBroker.postMessage(`TileManager_${self.scene_id}.buildTileError`, Tile.slice(tile));
                });
            }
            // Tile already loaded, just rebuild
            else {
                log('trace', `used worker cache for tile ${tile.key}`);

                // Build geometry
                try {
                    Tile.buildGeometry(tile, self);
                }
                catch(error) {
                    // Send error to main thread
                    tile.error = error.toString();
                    WorkerBroker.postMessage(`TileManager_${self.scene_id}.buildTileError`, Tile.slice(tile));
                }
            }
        });
    },

    // Load this tile's data source
    loadTileSourceData (tile) {
        if (self.sources[tile.source]) {
            return self.sources[tile.source].load(tile);
        }
        else {
            tile.source_data = {};
            return Promise.resolve(tile);
        }
    },

    getTile(key) {
        return self.tiles[key];
    },

    // Remove tile
    removeTile (key) {
        var tile = self.tiles[key];

        if (tile != null) {
            // Cancel if loading
            if (tile.loading === true) {
                log('trace', `cancel tile load for ${key}`);
                tile.loading = false;
                Tile.cancel(tile);
            }

            // Remove from cache
            FeatureSelection.clearTile(key);
            delete self.tiles[key];
            log('trace', `remove tile from cache for ${key}`);
        }
    },

    // Query features within visible tiles, with optional filter conditions
    queryFeatures ({ filter, visible, geometry, tile_keys }) {
        let features = [];
        let tiles = tile_keys.map(t => self.tiles[t]).filter(t => t);

        // Compile feature filter
        if (filter != null) {
            filter = ['{', '['].indexOf(filter[0]) > -1 ? JSON.parse(filter) : filter; // de-serialize if looks like an object
            filter = Utils.stringsToFunctions(filter, StyleParser.wrapFunction);
        }
        filter = buildFilter(filter, FilterOptions);

        tiles.forEach(tile => {
            for (let layer in tile.source_data.layers) {
                let data = tile.source_data.layers[layer];
                data.features.forEach(feature => {
                    // Optionally check if feature is visible (e.g. was rendered for current generation)
                    const feature_visible = (feature.generation === self.generation);
                    if ((visible === true && !feature_visible) ||
                        (visible === false && feature_visible)) {
                        return;
                    }

                    // Apply feature filter
                    let context = StyleParser.getFeatureParseContext(feature, tile, self.global);
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

    // Profiling helpers
    profile (name) {
        console.profile(`worker ${self._worker_id}: ${name}`);
    },

    profileEnd (name) {
        console.profileEnd(`worker ${self._worker_id}: ${name}`);
    }

});

WorkerBroker.addTarget('self', self);

}
