var TileSource = require('./tile_source.js');
var VectorRenderer = require('./vector_renderer.js');
var GLRenderer = require('./gl/gl_renderer.js');
var GLBuilders = require('./gl/gl_builders.js');
var CanvasRenderer = require('./canvas/canvas_renderer.js');

var VectorWorker = {};
VectorWorker.worker = self;

VectorWorker.tiles = {}; // tiles being loaded by this worker (removed on load)

GLBuilders.setTileScale(VectorRenderer.tile_scale);

VectorWorker.tile_source = null;

// Load tile
VectorWorker.worker.addEventListener('message', function (event) {
    if (event.data.type != 'loadTile') {
        return;
    }

    var tile = event.data.tile; // TODO: keep track of tiles being loaded by this worker
    var renderer_type = event.data.renderer_type;

    VectorWorker.tile_source = VectorWorker.tile_source || TileSource.create(event.data.tile_source.type, event.data.tile_source.url, event.data.tile_source);
    VectorWorker.layers = VectorWorker.layers || VectorRenderer.loadLayers(event.data.layer_source);
    VectorWorker.styles = VectorWorker.styles || VectorRenderer.loadStyles(event.data.style_source);

    VectorWorker.tiles[tile.key] = tile;

    VectorWorker.tile_source.loadTile(tile, function () {
        // Extract desired layers from full GeoJSON
        VectorRenderer.processLayersForTile(VectorWorker.layers, tile);

        // Renderer-specific transforms
        tile.debug.rendering = +new Date();
        if (VectorRenderer[renderer_type].addTile != null) {
            VectorRenderer[renderer_type].addTile(tile, VectorWorker.layers, VectorWorker.styles);
        }
        tile.debug.rendering = +new Date() - tile.debug.rendering;

        VectorWorker.worker.postMessage({
            type: 'loadTileCompleted',
            tile: tile
        });

        delete VectorWorker.tiles[tile.key];
    });
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
