VectorRenderer.tile_scale = 4096;
VectorRenderer.units_per_meter = [];
VectorRenderer.units_per_pixel = [];
for (var z=0; z <= Geo.max_zoom; z++) {
    VectorRenderer.units_per_meter[z] = VectorRenderer.tile_scale / (Geo.tile_size * Geo.meters_per_pixel[z]);
    VectorRenderer.units_per_pixel[z] = VectorRenderer.tile_scale / Geo.tile_size;
}

// Layers: pass an object directly, or a URL as string to load remotely
function VectorRenderer (leaflet, layers, styles)
{
    // this.tile_base_url = 'http://tile.openstreetmap.us/vectiles-all/';
    // this.tile_base_url = 'http://api-vector-test.mapzen.com/vector/all/';
    this.tile_base_url = 'http://api-vector-dev.mapzen.com/vector/all/';
    // this.tile_base_url = 'http://localhost:8080/all/';

    this.tile_scale = 4096;
    this.tiles = {};

    this.leaflet = leaflet;

    if (typeof(layers) == 'string') {
        this.layers = VectorRenderer.loadLayers(layers);
    }
    else {
        this.layers = layers;
    }

    this.styles = styles;
}

VectorRenderer.loadLayers = function (url)
{
    var layers;
    var req = new XMLHttpRequest();
    req.onload = function () { eval('layers = ' + req.response); }; // TODO: security!
    req.open('GET', url, false /* async flag */);
    req.send();
    return layers;
};

VectorRenderer.prototype.loadTile = function (coords, div)
{
    var tile_url = this.tile_base_url + coords.z + '/' + coords.x + '/' + coords.y + '.json';
    var key = [coords.x, coords.y, coords.z].join('/');
    var req = new XMLHttpRequest();
    var renderer = this;

    this.removeTile(key);

    var tile = this.tiles[key] = this.tiles[key] || {};
    tile.key = key;
    tile.coords = coords;
    tile.xhr = req;
    tile.debug = {};
    tile.debug.network = +new Date();
    tile.loading = true;
    tile.loaded = false;

    req.onload = function () {
        var tile = renderer.tiles[key]; // = {};
        if (tile == null) {
            return;
        }

        tile.layers = JSON.parse(req.response);
        tile.debug.network = +new Date() - tile.debug.network; // network/JSON parsing

        div.setAttribute('data-tile-key', tile.key); // tile info for debugging
        div.style.width = '256px';
        div.style.height = '256px';

        // var debug_overlay = document.createElement('div');
        // debug_overlay.textContent = tile.key;
        // debug_overlay.style.position = 'absolute';
        // debug_overlay.style.left = 0;
        // debug_overlay.style.top = 0;
        // debug_overlay.style.color = 'white';
        // div.appendChild(debug_overlay);

        // Extract desired layers from full GeoJSON response
        renderer.processLayersForTile(tile);

        // Mercator projection for geometry and bounds
        tile.min = Geo.metersForTile(tile.coords);
        tile.max = Geo.metersForTile({ x: tile.coords.x + 1, y: tile.coords.y + 1, z: tile.coords.z });
        renderer.projectTile(tile);

        // Re-scale from meters to local tile coords
        renderer.scaleTile(tile, renderer.tile_scale);

        tile.xhr = null;
        tile.loading = false;
        tile.loaded = true;

        // Render
        var timer = +new Date();
        renderer.addTile(tile, div);
        tile.debug.rendering = +new Date() - timer; // rendering/geometry prep

        renderer.printDebugForTile(tile);
        renderer.leaflet.layer.tileDrawn(div);
    };
    req.open('GET', tile_url, true /* async flag */);
    req.send();
};

VectorRenderer.prototype.removeTile = function (key)
{
    console.log("tile unload for " + key);
    var tile = this.tiles[key];
    if (tile != null && tile.loading == true) {
        console.log("cancel tile load for " + key);
        tile.loaded = false;
        tile.xhr.abort();
        tile.xhr = null;
        tile.loading = false;
    }

    delete this.tiles[key];
};

// Processes the tile response to create layers as defined by this renderer
// Can include post-processing to partially filter or re-arrange data, e.g. only including POIs that have names
VectorRenderer.prototype.processLayersForTile = function (tile)
{
    var layers = {};
    for (var t=0; t < this.layers.length; t++) {
        this.layers[t].number = t;
        layers[this.layers[t].name] = this.layers[t].data(tile.layers) || { type: 'FeatureCollection', features: [] };
    }
    tile.layers = layers;
    return tile;
};

VectorRenderer.prototype.projectTile = function (tile)
{
    var timer = +new Date();
    for (var t in tile.layers) {
        var num_features = tile.layers[t].features.length;
        for (var f=0; f < num_features; f++) {
            var feature = tile.layers[t].features[f];
            feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, function (coordinates) {
                var m = Geo.latLngToMeters(Point(coordinates[0], coordinates[1]));
                return [m.x, m.y];
            });
        };
    }
    tile.debug.projection = +new Date() - timer;
    return tile;
};

// Re-scale geometries within each tile to the range [0, scale]
// TODO: clip vertices at edges? right now vertices can have values outside [0, scale] (over or under bounds); this would pose a problem if we wanted to binary encode the vertices in fewer bits (e.g. 12 bits each for scale of 4096)
VectorRenderer.prototype.scaleTile = function (tile, scale)
{
    for (var t in tile.layers) {
        var num_features = tile.layers[t].features.length;
        for (var f=0; f < num_features; f++) {
            var feature = tile.layers[t].features[f];
            feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, function (coordinates) {
                coordinates[0] = (coordinates[0] - tile.min.x) * VectorRenderer.units_per_meter[tile.coords.z];
                coordinates[1] = (coordinates[1] - tile.min.y) * VectorRenderer.units_per_meter[tile.coords.z]; // TODO: this will create negative y-coords, force positive as below instead? or, if later storing positive coords in bit-packed values, flip to negative in post-processing?
                // coordinates[1] = (coordinates[1] - tile.max.y) * VectorRenderer.units_per_meter[tile.coords.z]; // alternate to force y-coords to be positive, subtract tile max instead of min
                return coordinates;
            });
        };
    }
    return tile;
};

VectorRenderer.prototype.printDebugForTile = function (tile)
{
    console.log(
        "debug for " + tile.key + ': [ ' +
        Object.keys(tile.debug).map(function (t) { return t + ': ' + tile.debug[t]; }).join(', ') + ' ]'
    );
};
