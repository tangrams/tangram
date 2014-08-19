var TileSource = require('./tile_source.js');
var Scene = require('./scene.js');
var GLBuilders = require('./gl/gl_builders.js');
var Style = require('./style.js');
var Utils = require('./utils.js');

var VectorWorker = {};
VectorWorker.worker = self;
VectorWorker.tiles = {}; // tiles being loaded by this worker (removed on load)

// TODO: sync render mode state between main thread and worker
// VectorWorker.modes = require('./gl/gl_modes').Modes;

GLBuilders.setTileScale(Scene.tile_scale);

// Initialize worker
VectorWorker.worker.addEventListener('message', function (event) {
    if (event.data.type != 'init') {
        return;
    }

    VectorWorker.worker_id = event.data.worker_id;
    VectorWorker.num_workers = event.data.num_workers;

    Style.selection_map_prefix = VectorWorker.worker_id;
});

VectorWorker.buildTile = function (tile)
{
    // Tile keys that will be sent back to main thread
    // We send a minimal subset to avoid unnecessary data exchange
    var keys;

    // Renderer-specific transforms
    if (typeof VectorWorker.renderer.addTile == 'function') {
        tile.debug.rendering = +new Date();
        keys = VectorWorker.renderer.addTile(tile, VectorWorker.layers, VectorWorker.styles, VectorWorker.modes);
        tile.debug.rendering = +new Date() - tile.debug.rendering;
    }

    // Make sure we send some core pieces of info
    keys.key = true;
    keys.loading = true;
    keys.loaded = true;
    keys.debug = true;

    // Build the tile subset
    var tile_subset = {};
    for (var k in keys) {
        tile_subset[k] = tile[k];
    }

    VectorWorker.worker.postMessage({
        type: 'buildTileCompleted',
        worker_id: VectorWorker.worker_id,
        tile: tile_subset,
        selection_map_size: Object.keys(Style.selection_map).length
    });
};

// Build a tile: load from tile source if building for first time, otherwise rebuild with existing data
VectorWorker.worker.addEventListener('message', function (event) {
    if (event.data.type != 'buildTile') {
        return;
    }

    var tile = event.data.tile;

    // Tile cached?
    if (VectorWorker.tiles[tile.key] != null) {
        // Already loading?
        if (VectorWorker.tiles[tile.key].loading == true) {
            return;
        }

        // Get layers from cache
        tile.layers = VectorWorker.tiles[tile.key].layers;
    }

    // Update tile cache tile
    VectorWorker.tiles[tile.key] = tile;

    // Refresh config
    VectorWorker.renderer = Scene;
    VectorWorker.tile_source = VectorWorker.tile_source || TileSource.create(event.data.tile_source.type, event.data.tile_source.url, event.data.tile_source);
    VectorWorker.styles = VectorWorker.styles || Utils.deserializeWithFunctions(event.data.styles);
    VectorWorker.layers = VectorWorker.layers || Utils.deserializeWithFunctions(event.data.layers);
    VectorWorker.modes = VectorWorker.modes || Scene.createModes({}, VectorWorker.styles);

    // First time building the tile
    if (tile.layers == null) {
        // Reset load state
        tile.loaded = false;
        tile.loading = true;

        VectorWorker.tile_source.loadTile(tile, function () {
            Scene.processLayersForTile(VectorWorker.layers, tile); // extract desired layers from full GeoJSON
            VectorWorker.buildTile(tile);
        });
    }
    // Tile already loaded, just rebuild
    else {
        VectorWorker.log("used worker cache for tile " + tile.key);

        // Update loading state
        tile.loaded = true;
        tile.loading = false;

        // TODO: should we rebuild layers here as well?
        // - if so, we need to save the raw un-processed tile data
        // - benchmark the layer processing time to see if it matters
        // - benchmark tesselation time for comparison (and could cache tesselation)
        VectorWorker.buildTile(tile);
    }
});

// Remove tile
VectorWorker.worker.addEventListener('message', function (event) {
    if (event.data.type != 'removeTile') {
        return;
    }

    var key = event.data.key;
    var tile = VectorWorker.tiles[key];
    // VectorWorker.log("worker remove tile event for " + key);

    if (tile != null) {
        if (tile.loading == true) {
            VectorWorker.log("cancel tile load for " + key);
            // TODO: let tile source do this
            tile.loading = false;

            if (tile.xhr != null) {
                tile.xhr.abort();
                // VectorWorker.log("aborted XHR for tile " + tile.key);
            }
        }

        // Remove from cache
        delete VectorWorker.tiles[key];
    }
});

// Get a feature from the selection map
VectorWorker.worker.addEventListener('message', function (event) {
    if (event.data.type != 'getFeatureSelection') {
        return;
    }

    var key = event.data.key;
    var selection = Style.selection_map[key];

    if (selection != null) {
        VectorWorker.worker.postMessage({
            type: 'getFeatureSelection',
            key: key,
            feature: selection.feature
        });
    }
});

// Make layers/styles refresh config
VectorWorker.worker.addEventListener('message', function (event) {
    if (event.data.type != 'prepareForRebuild') {
        return;
    }

    VectorWorker.styles = Utils.deserializeWithFunctions(event.data.styles);
    VectorWorker.layers = Utils.deserializeWithFunctions(event.data.layers);
    VectorWorker.modes = VectorWorker.modes || Scene.createModes({}, VectorWorker.styles);
    Style.resetSelectionMap();

    VectorWorker.log("worker refreshed config for tile rebuild");
});

// Log wrapper to include worker id #
VectorWorker.log = function (msg) {
    console.log("worker " + VectorWorker.worker_id + ": " + msg);
};
