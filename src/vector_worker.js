var TileSource = require('./tile_source.js');
var VectorRenderer = require('./vector_renderer.js');
var GLRenderer = require('./gl/gl_renderer.js');
var GLBuilders = require('./gl/gl_builders.js');
var CanvasRenderer = require('./canvas/canvas_renderer.js');
var Utils = require('./utils.js');

var VectorWorker = {};
VectorWorker.worker = self;
VectorWorker.tiles = {}; // tiles being loaded by this worker (removed on load)

GLBuilders.setTileScale(VectorRenderer.tile_scale);

VectorWorker.buildTile = function (tile)
{
    // Renderer-specific transforms
    if (typeof VectorWorker.renderer.addTile == 'function') {
        tile.debug.rendering = +new Date();
        VectorWorker.renderer.addTile(tile, VectorWorker.layers, VectorWorker.styles);
        tile.debug.rendering = +new Date() - tile.debug.rendering;
    }

    VectorWorker.worker.postMessage({
        type: 'buildTileCompleted',
        tile: tile
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
    VectorWorker.renderer_type = event.data.renderer_type;
    VectorWorker.renderer = VectorRenderer[VectorWorker.renderer_type];
    VectorWorker.tile_source = VectorWorker.tile_source || TileSource.create(event.data.tile_source.type, event.data.tile_source.url, event.data.tile_source);
    VectorWorker.styles = VectorWorker.styles || Utils.deserializeWithFunctions(event.data.styles);
    VectorWorker.layers = VectorWorker.layers || Utils.deserializeWithFunctions(event.data.layers);

    // First time building the tile
    if (tile.layers == null) {
        // Reset load state
        tile.loaded = false;
        tile.loading = true;

        VectorWorker.tile_source.loadTile(tile, function () {
            VectorRenderer.processLayersForTile(VectorWorker.layers, tile); // extract desired layers from full GeoJSON
            VectorWorker.buildTile(tile);
        });
    }
    // Tile already loaded, just rebuild
    else {
        console.log("used worker cache for tile " + tile.key);

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
    // console.log("worker remove tile event for " + key);

    if (tile != null) {
        if (tile.loading == true) {
            console.log("cancel tile load for " + key);
            // TODO: let tile source do this
            tile.loading = false;

            if (tile.xhr != null) {
                tile.xhr.abort();
                // console.log("aborted XHR for tile " + tile.key);
            }
        }

        // Remove from cache
        delete VectorWorker.tiles[key];
    }
});

// Make layers/styles refresh config
VectorWorker.worker.addEventListener('message', function (event) {
    if (event.data.type != 'prepareForRebuild') {
        return;
    }

    VectorWorker.styles = Utils.deserializeWithFunctions(event.data.styles);
    VectorWorker.layers = Utils.deserializeWithFunctions(event.data.layers);

    console.log("worker refreshed config for tile rebuild");
});
