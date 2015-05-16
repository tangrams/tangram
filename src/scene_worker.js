/*jshint worker: true*/
import Utils from './utils/utils';
import WorkerBroker from './utils/worker_broker'; // jshint ignore:line
import Tile from './tile';
import DataSource from './data_source.js';
import FeatureSelection from './selection';
import {StyleParser} from './styles/style_parser';
import {StyleManager} from './styles/style_manager';
import {parseRules} from './styles/rule';
import Texture from './gl/texture';

export var SceneWorker = self;

// Worker functionality will only be defined in worker thread
Utils.isWorkerThread && Object.assign(self, {

    sources: {
        tiles: {},
        objects: {}
    },
    styles: {},
    rules: {},
    layers: {},
    tiles: {},
    objects: {},
    config: {},

    // Initialize worker
    init (worker_id, num_workers, device_pixel_ratio) {
        self._worker_id = worker_id;
        self.num_workers = num_workers;
        Utils.device_pixel_ratio = device_pixel_ratio;
        FeatureSelection.setPrefix(self._worker_id);
        return worker_id;
    },

    // Starts a config refresh
    updateConfig ({ config, generation }) {
        self.config = null;
        config = JSON.parse(config);

        self.generation = generation;
        self.styles = null;

        // Data block functions are not macro'ed and wrapped like the rest of the style functions are
        // TODO: probably want a cleaner way to exclude these
        for (var layer in config.layers) {
            config.layers[layer].data = Utils.stringsToFunctions(config.layers[layer].data);
        }

        // Create data sources
        config.sources = Utils.stringsToFunctions(StyleParser.expandMacros(config.sources));
        for (var name in config.sources) {
            let source = DataSource.create(Object.assign(config.sources[name], {name}));
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

        // Expand styles
        self.config = Utils.stringsToFunctions(StyleParser.expandMacros(config), StyleParser.wrapFunction);
        self.styles = StyleManager.build(self.config.styles, { generation: self.generation });

        // Parse each top-level layer as a separate rule tree
        // TODO: find a more graceful way to incorporate this

        self.rules = parseRules(self.config.layers);

        // Sync tetxure info from main thread
        self.syncing_textures = self.syncTextures();

        // Return promise for when config refresh finishes
        self.configuring = self.syncing_textures.then(() => {
            Utils.log('debug', `updated config`);
        });
    },

    // Returns a promise that fulfills when config refresh is finished
    awaitConfiguration () {
        return self.configuring;
    },

    // Build a tile: load from tile source if building for first time, otherwise rebuild with existing data
    buildTile ({ tile }) {
        // Tile cached?
        if (self.tiles[tile.key] != null) {
            // Already loading?
            if (self.tiles[tile.key].loading === true) {
                return;
            }
        }

        // Update tile cache
        tile = self.tiles[tile.key] = Object.assign(self.tiles[tile.key] || {}, tile);

        // Update config (styles, etc.), then build tile
        return self.awaitConfiguration().then(() => {
            // First time building the tile
            if (tile.loaded !== true) {

                return new Promise((resolve, reject) => {

                    tile.loading = true;
                    tile.loaded = false;
                    tile.error = null;

                    self.loadSourcesIntoTile(tile).then(() => {
                        // Any errors? Warn and continue
                        let e = Object.keys(tile.sources).
                            map(s => tile.sources[s].error && `[source '${s}': ${tile.sources[s].error}]`).
                            filter(x => x);
                        if (e.length > 0) {
                            Utils.log('warn', `tile load error(s) for ${tile.key}: ${e.join(', ')}`);
                        }

                        tile.loading = false;
                        tile.loaded = true;
                        Tile.buildGeometry(tile, self.config.layers, self.rules, self.styles).then(keys => {
                            resolve({ tile: Tile.slice(tile, keys) });
                        });
                    }).catch((error) => {
                        tile.loading = false;
                        tile.loaded = false;
                        tile.error = error.toString();
                        Utils.log('error', `tile load error for ${tile.key}: ${error.stack}`);

                        resolve({ tile: Tile.slice(tile) });
                    });
                });
            }
            // Tile already loaded, just rebuild
            else {
                Utils.log('trace', `used worker cache for tile ${tile.key}`);

                // Build geometry
                return Tile.buildGeometry(tile, self.config.layers, self.rules, self.styles).then(keys => {
                    return { tile: Tile.slice(tile, keys) };
                });
            }
        });
    },

    // Load all data sources into a tile
    loadSourcesIntoTile (tile) {
        return Promise.all(
            Object.keys(self.sources.tiles)
                .map(x => self.sources.tiles[x].load(tile))
        );
    },

    // Remove tile
    removeTile (key) {
        var tile = self.tiles[key];

        if (tile != null) {
            // Cancel if loading
            if (tile.loading === true) {
                Utils.log('trace', `cancel tile load for ${key}`);
                tile.loading = false;
            }

            Tile.cancel(tile);

            // Remove from cache
            FeatureSelection.clearTile(key);
            delete self.tiles[key];
            Utils.log('trace', `remove tile from cache for ${key}`);
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

    // Texture info needs to be synced from main thread
    syncTextures () {
        // We're only syncing the textures that have sprites defined, since these are (currently) the only ones we
        // need info about for geometry construction (e.g. width/height, which we only know after the texture loads)
        let textures = [];
        if (self.config.textures) {
            for (let [texname, texture] of Utils.entries(self.config.textures)) {
                if (texture.sprites) {
                    textures.push(texname);
                }
            }
        }

        Utils.log('trace', 'sync textures to worker:', textures);
        if (textures.length > 0) {
            return Texture.syncTexturesToWorker(textures);
        }
        return Promise.resolve();
    },

    // Profiling helpers
    profile (name) {
        console.profile(`worker ${self._worker_id}: ${name}`);
    },

    profileEnd (name) {
        console.profileEnd(`worker ${self._worker_id}: ${name}`);
    }

});
