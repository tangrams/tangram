/*jshint worker: true*/
import Utils from './utils';
import WorkerBroker from './worker_broker'; // jshint ignore:line
import {StyleParser} from './style_parser';
import {StyleManager} from './style';
import Scene  from './scene';
import Tile from './tile';
import TileSource from './tile_source.js';
import {GLBuilders} from './gl/gl_builders';

export var SceneWorker = {};

// Worker functionality will only be defined in worker thread
Utils.inWorkerThread(() => {

    SceneWorker.worker = self;
    SceneWorker.tiles = {}; // tiles processed by this worker

    // TODO: sync render style state between main thread and worker
    GLBuilders.setTileScale(Scene.tile_scale);

    // Initialize worker
    SceneWorker.worker.init = function (worker_id) {
        SceneWorker.worker_id = worker_id;
        StyleParser.selection_map_prefix = SceneWorker.worker_id;
        return worker_id;
    };

    SceneWorker.updateConfig = function (config) {
        if (!SceneWorker.tile_source && config.tile_source) {
            SceneWorker.tile_source = TileSource.create(config.tile_source);
        }
        if (!SceneWorker.config && config.config) {
            SceneWorker.config = Utils.stringsToFunctions(StyleParser.expandMacros(JSON.parse(config.config)), StyleParser.wrapFunction);
            SceneWorker.styles = StyleManager.createStyles(SceneWorker.config.styles);
        }
    };

    // Slice a subset of keys out of a tile
    // Includes a minimum set of pre-defined keys for load state, debug. etc.
    // We use this to send a subset of the tile back to the main thread, to minimize unnecessary data transfer
    // (e.g. very large items like feature geometry are not needed on the main thread)
    SceneWorker.sliceTile = function (tile, keys) {
        keys = keys || {};
        keys.key = true;
        keys.loading = true;
        keys.loaded = true;
        keys.error = true;
        keys.debug = true;

        // Build the tile subset
        var tile_subset = {};
        for (var k in keys) {
            tile_subset[k] = tile[k];
        }

        return tile_subset;
    };

    // Build a tile: load from tile source if building for first time, otherwise rebuild with existing data
    SceneWorker.worker.buildTile = function ({ tile, tile_source, config }) {
        // Tile cached?
        if (SceneWorker.tiles[tile.key] != null) {
            // Already loading?
            if (SceneWorker.tiles[tile.key].loading === true) {
                return;
            }
        }

        // Update tile cache
        tile = SceneWorker.tiles[tile.key] = Object.assign(SceneWorker.tiles[tile.key] || {}, tile);

        // Update config (styles, etc.)
        SceneWorker.updateConfig({ tile_source, config });

        // First time building the tile
        if (tile.loaded !== true) {
            return new Promise((resolve, reject) => {
                SceneWorker.tile_source.loadTile(tile).then(() => {
                    var keys = Tile.buildGeometry(tile, SceneWorker.config.layers, SceneWorker.styles);

                    resolve({
                        tile: SceneWorker.sliceTile(tile, keys),
                        worker_id: SceneWorker.worker_id,
                        selection_map_size: StyleParser.selection_map_size
                    });
                }).catch((error) => {
                    if (error) {
                        SceneWorker.log('error', `tile load error for ${tile.key}: ${error.stack}`);
                    }
                    else {
                        SceneWorker.log('debug', `skip building tile ${tile.key} because no longer loading`);
                    }

                    resolve({
                        tile: SceneWorker.sliceTile(tile),
                        worker_id: SceneWorker.worker_id,
                        selection_map_size: StyleParser.selection_map_size
                    });
                });
            });
        }
        // Tile already loaded, just rebuild
        else {
            SceneWorker.log('debug', `used worker cache for tile ${tile.key}`);

            // Build geometry
            var keys = Tile.buildGeometry(tile, SceneWorker.config.layers, SceneWorker.styles);

            return {
                tile: SceneWorker.sliceTile(tile, keys),
                worker_id: SceneWorker.worker_id,
                selection_map_size: StyleParser.selection_map_size
            };
        }
    };

    // Remove tile
    SceneWorker.worker.removeTile = function (key) {
        var tile = SceneWorker.tiles[key];

        if (tile != null) {
            // Cancel if loading
            if (tile.loading === true) {
                SceneWorker.log('debug', `cancel tile load for ${key}`);
                tile.loading = false;
            }

            // Remove from cache
            delete SceneWorker.tiles[key];
            SceneWorker.log('debug', `remove tile from cache for ${key}`);
        }
    };

    // Get a feature from the selection map
    SceneWorker.worker.getFeatureSelection = function ({ id, key } = {}) {
        var selection = StyleParser.selection_map[key];

        return {
            id: id,
            feature: (selection && selection.feature)
        };
    };

    // Update styles, etc.
    SceneWorker.worker.prepareForRebuild = function (config) {
        SceneWorker.config = null;
        SceneWorker.styles = null;
        SceneWorker.updateConfig(config);
        StyleParser.resetSelectionMap();

        SceneWorker.log('debug', `worker updated config for tile rebuild`);
    };

    // Log wrapper, sends message to main thread for display, and includes worker id #
    SceneWorker.log = function (level, ...msg) {
        SceneWorker.worker.postMessage({
            type: 'log',
            level: level || 'info',
            worker_id: SceneWorker.worker_id,
            msg: msg
        });
    };

});
