/*jshint worker: true*/
import Utils from './utils/utils';
import WorkerBroker from './utils/worker_broker'; // jshint ignore:line
import Scene  from './scene';
import Tile from './tile';
import DataSource from './data_source.js';
import FeatureSelection from './selection';
import {StyleParser} from './styles/style_parser';
import {StyleManager} from './styles/style_manager';
import {parseRules} from './styles/rule';
import Builders from './styles/builders';
import Texture from './gl/texture';

export var SceneWorker = {
    sources: {
        tiles: {},
        objects: {}
    },
    styles: {},
    rules: {},
    layers: {},
    tiles: {},
    objects: {},
    config: {}
};

// Worker functionality will only be defined in worker thread

if (Utils.isWorkerThread) {

    self.SceneWorker = SceneWorker;
    SceneWorker.worker = self;

    // TODO: sync render style state between main thread and worker
    Builders.setTileScale(Scene.tile_scale);

    // Initialize worker
    SceneWorker.worker.init = function (worker_id, num_workers, device_pixel_ratio) {
        self._worker_id = worker_id;
        SceneWorker.num_workers = num_workers;
        Utils.device_pixel_ratio = device_pixel_ratio;
        FeatureSelection.setPrefix(self._worker_id);
        return worker_id;
    };

    // Starts a config refresh
    SceneWorker.worker.updateConfig = function ({ config, generation }) {
        SceneWorker.config = null;
        config = JSON.parse(config);

        SceneWorker.generation = generation;
        SceneWorker.styles = null;

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
                SceneWorker.sources.tiles[name] = source;
            }
            else {
                // Distribute object sources across workers
                if (source.id % SceneWorker.num_workers === self._worker_id) {
                    // Load source if not cached
                    SceneWorker.sources.objects[name] = source;
                    if (!SceneWorker.objects[source.name]) {
                        SceneWorker.objects[source.name] = {};
                        source.load(SceneWorker.objects[source.name]);
                    }
                }
            }
        }

        // Expand styles
        SceneWorker.config = Utils.stringsToFunctions(StyleParser.expandMacros(config), StyleParser.wrapFunction);
        SceneWorker.styles = StyleManager.build(SceneWorker.config.styles, { generation: SceneWorker.generation });

        // Parse each top-level layer as a separate rule tree
        // TODO: find a more graceful way to incorporate this

        SceneWorker.rules = parseRules(SceneWorker.config.layers);

        // Sync tetxure info from main thread
        SceneWorker.syncing_textures = SceneWorker.syncTextures();

        // Return promise for when config refresh finishes
        SceneWorker.configuring = SceneWorker.syncing_textures.then(() => {
            Utils.log('debug', `updated config`);
        });
    };

    // Returns a promise that fulfills when config refresh is finished
    SceneWorker.awaitConfiguration = function () {
        return SceneWorker.configuring;
    };

    // Build a tile: load from tile source if building for first time, otherwise rebuild with existing data
    SceneWorker.worker.buildTile = function ({ tile }) {
        // Tile cached?
        if (SceneWorker.tiles[tile.key] != null) {
            // Already loading?
            if (SceneWorker.tiles[tile.key].loading === true) {
                return;
            }
        }

        // Update tile cache
        tile = SceneWorker.tiles[tile.key] = Object.assign(SceneWorker.tiles[tile.key] || {}, tile);

        // Update config (styles, etc.), then build tile
        return SceneWorker.awaitConfiguration().then(() => {
            // First time building the tile
            if (tile.loaded !== true) {

                return new Promise((resolve, reject) => {

                    tile.loading = true;
                    tile.loaded = false;
                    tile.error = null;

                    SceneWorker.loadSourcesIntoTile(tile).then(() => {
                        // Any errors? Warn and continue
                        let e = Object.keys(tile.sources).
                            map(s => tile.sources[s].error && `[source '${s}': ${tile.sources[s].error}]`).
                            filter(x => x);
                        if (e.length > 0) {
                            Utils.log('warn', `tile load error(s) for ${tile.key}: ${e.join(', ')}`);
                        }

                        tile.loading = false;
                        tile.loaded = true;
                        Tile.buildGeometry(tile, SceneWorker.config.layers, SceneWorker.rules, SceneWorker.styles).then(keys => {
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
                return Tile.buildGeometry(tile, SceneWorker.config.layers, SceneWorker.rules, SceneWorker.styles).then(keys => {
                    return { tile: Tile.slice(tile, keys) };
                });
            }
        });
    };

    // Load all data sources into a tile
    SceneWorker.loadSourcesIntoTile = function (tile) {
        return Promise.all(
            Object.keys(SceneWorker.sources.tiles)
                .map(x => SceneWorker.sources.tiles[x].load(tile))
        );
    };

    // Remove tile
    SceneWorker.worker.removeTile = function (key) {
        var tile = SceneWorker.tiles[key];

        if (tile != null) {
            // Cancel if loading
            if (tile.loading === true) {
                Utils.log('trace', `cancel tile load for ${key}`);
                tile.loading = false;
            }

            Tile.cancel(tile);

            // Remove from cache
            FeatureSelection.clearTile(key);
            delete SceneWorker.tiles[key];
            Utils.log('trace', `remove tile from cache for ${key}`);
        }
    };

    // Get a feature from the selection map
    SceneWorker.worker.getFeatureSelection = function ({ id, key } = {}) {
        var selection = FeatureSelection.map[key];

        return {
            id: id,
            feature: (selection && selection.feature)
        };
    };

    // Resets the feature selection state
    SceneWorker.worker.resetFeatureSelection = function () {
        FeatureSelection.reset();
    };

    // Selection map size for this worker
    SceneWorker.worker.getFeatureSelectionMapSize = function () {
        return FeatureSelection.getMapSize();
    };

    // Texture info needs to be synced from main thread
    SceneWorker.syncTextures = function () {
        // We're only syncing the textures that have sprites defined, since these are (currently) the only ones we
        // need info about for geometry construction (e.g. width/height, which we only know after the texture loads)
        let textures = [];
        if (SceneWorker.config.textures) {
            for (let [texname, texture] of Utils.entries(SceneWorker.config.textures)) {
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
    };

    // Profiling helpers
    SceneWorker.worker.profile = function (name) {
        console.profile(`worker ${self._worker_id}: ${name}`);
    };

    SceneWorker.worker.profileEnd = function (name) {
        console.profileEnd(`worker ${self._worker_id}: ${name}`);
    };

}
