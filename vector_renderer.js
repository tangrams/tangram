function VectorRenderer (leaflet, layers, styles)
{
    this.leaflet = leaflet;
    this.layers = layers;
    this.styles = styles;
    this.tiles = {};
}

VectorRenderer.prototype.loadTile = function (coords, div)
{
    // Load tile
    var tile_url = 'http://tile.openstreetmap.us/vectiles-all/' + coords.z + '/' + coords.x + '/' + coords.y + '.json';
    // var tile_url = 'http://api-vector-test.mapzen.com/vector/all/' + coords.z + '/' + coords.x + '/' + coords.y + '.json';
    // var tile_url = 'http://localhost:8080/vector/all/' + coords.z + '/' + coords.x + '/' + coords.y + '.json';

    var key = [coords.x, coords.y, coords.z].join('/');
    var timer = +new Date();
    var req = new XMLHttpRequest();
    var renderer = this;

    req.onload = function () {
        renderer.removeTile(key);

        var tile = renderer.tiles[key] = {};
        tile.layers = JSON.parse(req.response);
        tile.key = key;
        tile.coords = coords;
        tile.timers = {};
        tile.timers.network = +new Date() - timer; // network/JSON parsing

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
            tile.layers[t].features.forEach(function (feature) {
                feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, function (coordinates) {
                    var m = Geo.latLngToMeters(Point(coordinates[0], coordinates[1]));
                    return [m.x, m.y];
                });
            });
        }
        tile.min = Geo.metersForTile(tile.coords);
        tile.max = Geo.metersForTile({ x: tile.coords.x + 1, y: tile.coords.y + 1, z: tile.coords.z });
        tile.timers.projection = +new Date() - timer; // mercator projection

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
    delete this.tiles[key];
};
