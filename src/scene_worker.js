/*jshint worker: true*/
import Utils from './utils';
import {Style} from './style';
import Scene  from './scene';
import TileSource from './tile_source.js';
import {GLBuilders} from './gl/gl_builders';

export var SceneWorker = {};
SceneWorker.worker = self;
SceneWorker.tiles = {}; // tiles being loaded by this worker (removed on load)

// TODO: sync render mode state between main thread and worker
// SceneWorker.modes = require('./gl/gl_modes').Modes;

GLBuilders.setTileScale(Scene.tile_scale);

// Initialize worker
SceneWorker.worker.addEventListener('message', function (event) {
    if (event.data.type !== 'init') {
        return;
    }

    SceneWorker.worker_id = event.data.worker_id;
    SceneWorker.num_workers = event.data.num_workers;

    Style.selection_map_prefix = SceneWorker.worker_id;
});

SceneWorker.refreshConfig = function (config) {
    SceneWorker.tile_source = SceneWorker.tile_source || TileSource.create(config.tile_source);
    SceneWorker.styles = SceneWorker.styles || Utils.deserializeWithFunctions(config.styles, Style.wrapFunction);
    SceneWorker.layers = SceneWorker.layers || Utils.deserializeWithFunctions(config.layers);
    SceneWorker.modes = SceneWorker.modes || Scene.createModes(SceneWorker.styles.modes);
};

SceneWorker.buildTile = function (tile) {
    // Tile keys that will be sent back to main thread
    // We send a minimal subset to avoid unnecessary data exchange
    var keys = {};
    if (tile.loaded === true) {
        tile.debug.rendering = +new Date();
        keys = Scene.addTile(tile, SceneWorker.layers, SceneWorker.styles, SceneWorker.modes);
        tile.debug.rendering = +new Date() - tile.debug.rendering;
    }

    // Make sure we send some core pieces of info
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

    SceneWorker.worker.postMessage({
        type: 'buildTileCompleted',
        worker_id: SceneWorker.worker_id,
        tile: tile_subset,
        selection_map_size: Object.keys(Style.selection_map).length
    });
};

// Build a tile: load from tile source if building for first time, otherwise rebuild with existing data
SceneWorker.worker.addEventListener('message', function (event) {
    if (event.data.type !== 'buildTile') {
        return;
    }

    var tile = event.data.tile;

    // Tile cached?
    if (SceneWorker.tiles[tile.key] != null) {
        // Already loading?
        if (SceneWorker.tiles[tile.key].loading === true) {
            return;
        }

        // Get layers from cache
        tile.layers = SceneWorker.tiles[tile.key].layers;
    }

    // Update tile cache tile
    SceneWorker.tiles[tile.key] = tile;

    // Refresh config (layers, styles, etc.)
    SceneWorker.refreshConfig(event.data);

    // First time building the tile
    if (tile.layers == null) {
        // Reset load state
        tile.loaded = false;
        tile.loading = true;
        tile.error = null;

        SceneWorker.tile_source.loadTile(tile, (error) => {
            // Tile load errored
            if (error) {
                console.log(`worker ${SceneWorker.worker_id} tile load error for ${tile.key}: ${error.toString()}`);
            }
            else {
                // Tile loaded successfully
                Scene.processLayersForTile(SceneWorker.layers, tile); // extract desired layers from full GeoJSON
            }

            SceneWorker.buildTile(tile);
        });
    }
    // Tile already loaded, just rebuild
    else {
        SceneWorker.log("used worker cache for tile " + tile.key);

        // Update loading state
        tile.loaded = true;
        tile.loading = false;

        // TODO: should we rebuild layers here as well?
        // - if so, we need to save the raw un-processed tile data
        // - benchmark the layer processing time to see if it matters
        // - benchmark tesselation time for comparison (and could cache tesselation)
        SceneWorker.buildTile(tile);
    }
});

// Remove tile
SceneWorker.worker.addEventListener('message', function (event) {
    if (event.data.type !== 'removeTile') {
        return;
    }

    var key = event.data.key;
    var tile = SceneWorker.tiles[key];
    // SceneWorker.log("worker remove tile event for " + key);

    if (tile != null) {
        // Remove from cache
        delete SceneWorker.tiles[key];

        // Cancel if loading
        if (tile.loading === true) {
            SceneWorker.log("cancel tile load for " + key);
            tile.loading = false;
            SceneWorker.buildTile(tile);
        }
    }
});

// Get a feature from the selection map
SceneWorker.worker.addEventListener('message', function (event) {
    if (event.data.type !== 'getFeatureSelection') {
        return;
    }

    var key = event.data.key;
    var selection = Style.selection_map[key];

    if (selection != null) {
        SceneWorker.worker.postMessage({
            type: 'getFeatureSelection',
            key: key,
            feature: selection.feature
        });
    }
});

// Make layers/styles refresh config
SceneWorker.worker.addEventListener('message', function (event) {
    if (event.data.type !== 'prepareForRebuild') {
        return;
    }

    SceneWorker.layers = null;
    SceneWorker.styles = null;
    SceneWorker.modes = null;
    SceneWorker.refreshConfig(event.data);
    Style.resetSelectionMap();

    SceneWorker.log("worker refreshed config for tile rebuild");
});

// Log wrapper to include worker id #
SceneWorker.log = function (msg) {
    // console.log isn't always available in a web worker, so send message to main thread
    SceneWorker.worker.postMessage({
        type: 'log',
        worker_id: SceneWorker.worker_id,
        msg: msg
    });
};
