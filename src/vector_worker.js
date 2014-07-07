var TileSource = require('./tile_source.js');
var VectorRenderer = require('./vector_renderer.js');
var GLRenderer = require('./gl/gl_renderer.js');
var GLBuilders = require('./gl/gl_builders.js');
var CanvasRenderer = require('./canvas/canvas_renderer.js');

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

    // Already loading this tile?
    if (VectorWorker.tiles[tile.key] != null) {
        return;
    }

    // if (VectorWorker.layers == null) {
    //     console.log("worker load layers");
    // }
    // if (VectorWorker.styles == null) {
    //     console.log("worker load styles");
    // }

    VectorWorker.renderer_type = event.data.renderer_type;
    VectorWorker.renderer = VectorRenderer[VectorWorker.renderer_type];
    VectorWorker.tile_source = VectorWorker.tile_source || TileSource.create(event.data.tile_source.type, event.data.tile_source.url, event.data.tile_source);
    VectorWorker.layers = VectorWorker.layers || VectorRenderer.loadLayers(event.data.layer_source);
    VectorWorker.styles = VectorWorker.styles || VectorRenderer.loadStyles(event.data.style_source);

    // First time building the tile
    if (tile.layers == null) {
        VectorWorker.tiles[tile.key] = tile; // track while loading

        VectorWorker.tile_source.loadTile(tile, function () {
            VectorRenderer.processLayersForTile(VectorWorker.layers, tile); // extract desired layers from full GeoJSON
            VectorWorker.buildTile(tile);
            delete VectorWorker.tiles[tile.key];
        });
    }
    // Tile already loaded, just rebuild
    else {
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
        // TODO: let tile source do this
        tile.loading = false;

        if (tile.xhr != null) {
            tile.xhr.abort();
            // console.log("aborted XHR for tile " + tile.key);
        }

        delete VectorWorker.tiles[key];
    }
});

// Mark layers/styles as needing reload
VectorWorker.worker.addEventListener('message', function (event) {
    if (event.data.type != 'markForRebuild') {
        return;
    }

    VectorWorker.layers = null;
    VectorWorker.styles = null;

    console.log("worker marked to prepare for tile rebuild");
});
