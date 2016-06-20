/*jshint worker: true*/
import Thread from './utils/thread';
import Utils from './utils/utils';
import log from './utils/log';
import WorkerBroker from './utils/worker_broker'; // jshint ignore:line
import mergeObjects from './utils/merge';
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

    sources: {
        tiles: {},
        objects: {}
    },
    styles: {},
    layers: {},
    tiles: {},
    objects: {},
    config: {},     // raw config (e.g. functions, etc. not expanded)

    // Initialize worker
    init (worker_id, num_workers, log_level, device_pixel_ratio) {
        self._worker_id = worker_id;
        self.num_workers = num_workers;
        log.setLevel(log_level);
        Utils.device_pixel_ratio = device_pixel_ratio;
        FeatureSelection.setPrefix(self._worker_id);
        return worker_id;
    },

    // Starts a config refresh
    updateConfig ({ config, generation, introspection }) {
        config = JSON.parse(config);

        self.last_config = mergeObjects({}, self.config);
        self.config = mergeObjects({}, config);
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
        config.sources = Utils.stringsToFunctions(config.sources); // parse new sources
        self.sources.tiles = {}; // clear previous sources
        for (let name in config.sources) {
            let source;
            try {
                source = DataSource.create(Object.assign({}, config.sources[name], {name}), self.sources.tiles);
            }
            catch(e) {
                continue;
            }

            if (!source) {
                continue;
            }

            if (source.tiled) {
                self.sources.tiles[name] = source;
            }
            else {
                // Distribute object sources across workers
                if (source.id % self.num_workers === self._worker_id) {
                    // Load source if not cached
                    self.sources.objects[name] = source;
                    if (!self.objects[source.name]) {
                        self.objects[source.name] = {};
                        source.load(self.objects[source.name]);
                    }
                }
            }
        }

        // Clear tile cache if data source config changed
        if (!self.config.sources ||
            !self.last_config.sources ||
            Object.keys(self.config.sources).some(s => {
                return JSON.stringify(self.config.sources[s]) !== JSON.stringify(self.last_config.sources[s]);
            })) {
            self.tiles = {};
        }

        // Expand styles
        config.styles = Utils.stringsToFunctions(config.styles, StyleParser.wrapFunction);
        self.styles = StyleManager.build(config.styles, {
            generation: self.generation,
            sources: self.sources.tiles,
            introspection: self.introspection
        });

        // Parse each top-level layer as a separate tree
        self.layers = parseLayers(config.layers);

        // Sync tetxure info from main thread
        self.syncing_textures = self.syncTextures(config.textures);

        // Return promise for when config refresh finishes
        self.configuring = self.syncing_textures.then(() => {
            log('debug', `updated config`);
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

                return new Promise((resolve, reject) => {

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
                        Tile.buildGeometry(tile, self).then(keys => {
                            resolve(WorkerBroker.returnWithTransferables({ tile: Tile.slice(tile, keys) }));
                        });
                    }).catch((error) => {
                        tile.loading = false;
                        tile.loaded = false;
                        tile.error = error.toString();
                        log('error', `tile load error for ${tile.key}: ${tile.error} at: ${error.stack}`);

                        resolve({ tile: Tile.slice(tile) });
                    });
                });
            }
            // Tile already loaded, just rebuild
            else {
                log('trace', `used worker cache for tile ${tile.key}`);

                // Build geometry
                return Tile.buildGeometry(tile, self).then(keys => {
                    return WorkerBroker.returnWithTransferables({ tile: Tile.slice(tile, keys) });
                });
            }
        });
    },

    // Load this tile's data source
    loadTileSourceData (tile) {
        if (self.sources.tiles[tile.source]) {
            return self.sources.tiles[tile.source].load(tile);
        }
        else {
            tile.source_data = { error: `Data source '${tile.source}' not found` };
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
