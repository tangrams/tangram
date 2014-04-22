importScripts('dist/vector-map-worker.min.js');

// Include individual scripts instead for debugging
// importScripts('lib/libtess.cat.js');
// importScripts('lib/mapbox-vector-tile.js');
// importScripts('geo.js');
// importScripts('gl.js');
// importScripts('tile_source.js');
// importScripts('vector_renderer.js');
// importScripts('canvas_renderer.js');
// importScripts('gl_renderer.js');
// importScripts('gl_builders.js');

var VectorWorker = {};
VectorWorker.worker = this;

VectorWorker.tiles = {}; // tiles being loaded by this worker (removed on load)

// Load tile
VectorWorker.worker.addEventListener('message', function (event) {
    if (event.data.type != 'loadTile') {
        return;
    }

    var tile = event.data.tile; // TODO: keep track of tiles being loaded by this worker
    var renderer_type = event.data.renderer_type;

    // TODO: avoid creating tile source on each event
    var tile_source = event.data.tile_source;
    tile_source = TileSource.create(tile_source.type, tile_source.url, tile_source);

    VectorWorker.layers = VectorWorker.layers || VectorRenderer.loadLayers(event.data.layer_source);
    VectorWorker.styles = VectorWorker.styles || VectorRenderer.loadStyles(event.data.style_source);

    VectorWorker.tiles[tile.key] = tile;

    tile_source.loadTile(tile, VectorWorker, function () {
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
