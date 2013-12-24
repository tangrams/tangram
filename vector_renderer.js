function VectorRenderer (leaflet, layers, styles)
{
    // this.tile_base_url = 'http://tile.openstreetmap.us/vectiles-all/';
    // this.tile_base_url = 'http://api-vector-test.mapzen.com/vector/all/';
    this.tile_base_url = 'http://api-vector-dev.mapzen.com/vector/all/';
    // this.tile_base_url = 'http://localhost:8080/all/';

    this.leaflet = leaflet;
    this.layers = layers;
    this.styles = styles;
    this.tiles = {};
}

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
    tile.timers = {};
    tile.timers.network_start = +new Date();
    tile.loading = true;
    tile.loaded = false;

    req.onload = function () {
        var tile = renderer.tiles[key]; // = {};
        if (tile == null) {
            return;
        }

        tile.layers = JSON.parse(req.response);
        tile.timers.network = +new Date() - tile.timers.network_start; // network/JSON parsing

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
        var layers = {};
        for (var t=0; t < renderer.layers.length; t++) {
            renderer.layers[t].number = t;
            layers[renderer.layers[t].name] = renderer.layers[t].data(tile.layers) || { type: 'FeatureCollection', features: [] };
        }
        tile.layers = layers;

        // Mercator projection for geometry and bounds
        timer = +new Date();
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
        tile.min = Geo.metersForTile(tile.coords);
        tile.max = Geo.metersForTile({ x: tile.coords.x + 1, y: tile.coords.y + 1, z: tile.coords.z });
        tile.timers.projection = +new Date() - timer; // mercator projection

        tile.loading = false;
        tile.loaded = true;

        // Render
        timer = +new Date();
        renderer.addTile(tile, div);

        tile.timers.rendering = +new Date() - timer; // rendering/geometry prep
        console.log("timers for tile " + tile.key +
            ": network: " + (tile.timers.network) +
            ", projection: " + (tile.timers.projection) +
            ", rendering: " + (tile.timers.rendering)
        );

        renderer.leaflet.layer.tileDrawn(div);
    };
    req.open('GET', tile_url, true /* async flag */);
    req.send();
};

VectorRenderer.prototype.removeTile = function (key)
{
    console.log("tile unload for " + key);
    var tile = renderer.tiles[key];
    if (tile != null && tile.loading == true) {
        console.log("cancel tile load for " + key);
        tile.loaded = false;
        tile.xhr.abort();
        tile.xhr = null;
        tile.loading = false;
    }

    delete this.tiles[key];
};
