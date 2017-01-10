/*jshint worker: true*/
import Thread from './utils/thread';
import Utils from './utils/utils';
import log from './utils/log';
import WorkerBroker from './utils/worker_broker'; // jshint ignore:line
import Tile from './tile';
import DataSource from './sources/data_source';
import FeatureSelection from './selection';
import {StyleParser} from './styles/style_parser';
import {StyleManager} from './styles/style_manager';
import {parseLayers} from './styles/layer';
import Texture from './gl/texture';

export var SceneWorker = self;

// Worker functionality will only be defined in worker thread
if (Thread.is_worker) {

Object.assign(self, {

    FeatureSelection,

    sources: {},
    styles: {},
    layers: {},
    tiles: {},
    objects: {},
    config: {},     // raw config (e.g. functions, etc. not expanded)

    // Initialize worker
    init (scene_id, worker_id, num_workers, log_level, device_pixel_ratio) {
        self.scene_id = scene_id;
        self._worker_id = worker_id;
        self.num_workers = num_workers;
        log.setLevel(log_level);
        Utils.device_pixel_ratio = device_pixel_ratio;
        FeatureSelection.setPrefix(self._worker_id);
        self.style_manager = new StyleManager();
        return worker_id;
    },

    // Starts a config refresh
    updateConfig ({ config, generation, introspection }) {
        config = JSON.parse(config);

        self.generation = generation;
        self.introspection = introspection;

        // Data block functions are not context wrapped like the rest of the style functions are
        // TODO: probably want a cleaner way to exclude these
        for (let layer in config.layers) {
            if (config.layers[layer]) {
                config.layers[layer].data = Utils.stringsToFunctions(config.layers[layer].data);
            }
        }

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
    },

    // Create data sources and clear tile cache if necessary
    createDataSources (config) {
        // Save and compare previous sources
        self.last_config_sources = self.config_sources;
        self.config_sources = JSON.stringify(config.sources);

        // Parse new sources
        config.sources = Utils.stringsToFunctions(config.sources);
        self.sources = {}; // clear previous sources
        for (let name in config.sources) {
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
        }

        // Clear tile cache if data source config changed
        if (self.config_sources !== self.last_config_sources) {
            self.tiles = {};
        }
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

    // Get a feature from the selection map
    getFeatureSelection ({ id, key } = {}) {
        var selection = FeatureSelection.map[key];

        return {
            id: id,
            feature: (selection && selection.feature)
        };
    },

    // Resets the feature selection state
    resetFeatureSelection () {
        FeatureSelection.reset();
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
