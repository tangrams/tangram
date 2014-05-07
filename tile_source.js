function TileSource (url_template, options)
{
    var options = options || {};
    this.url_template = url_template;
    this.max_zoom = options.max_zoom || Geo.max_zoom; // overzoom will apply for zooms higher than this
}

TileSource.create = function (type, url_template, options)
{
    return new TileSource[type](url_template, options);
};

// Mercator projection
TileSource.projectTile = function (tile)
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
TileSource.scaleTile = function (tile)
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

/*** Generic network tile loading ***/

NetworkTileSource.prototype = Object.create(TileSource.prototype);

function NetworkTileSource (url_template, options)
{
    TileSource.apply(this, arguments);

    var options = options || {};
    this.response_type = ""; // use to set explicit XHR type
}

NetworkTileSource.prototype.loadTile = function (tile, renderer, callback)
{
    var tile_source = this;
    var url = this.url_template.replace('{x}', tile.coords.x).replace('{y}', tile.coords.y).replace('{z}', tile.coords.z);
    var req = new XMLHttpRequest();

    tile.url = url;
    tile.xhr = req;
    tile.debug.network = +new Date();

    req.onload = function () {
        // Canceled while loading?
        if (tile.loading == false) {
            return;
        }

        tile.debug.network = +new Date() - tile.debug.network;

        if (tile_source._loadTile) {
            tile.debug.parsing = +new Date();
            tile_source._loadTile(tile, renderer);
            tile.debug.parsing = +new Date() - tile.debug.parsing;
        }

        tile.xhr = null;
        tile.loading = false;
        tile.loaded = true;

        if (callback) {
            callback(tile);
        }
    };
    // TODO: add XHR error handling
    req.responseType = this.response_type;
    req.open('GET', url, true); // async flag
    req.send();
};


/*** Mapzen/OSM.US-style GeoJSON vector tiles ***/

TileSource.GeoJSONTileSource = GeoJSONTileSource;
GeoJSONTileSource.prototype = Object.create(NetworkTileSource.prototype);

function GeoJSONTileSource (url_template, options)
{
    NetworkTileSource.apply(this, arguments);
}

GeoJSONTileSource.prototype._loadTile = function (tile, renderer)
{
    tile.layers = JSON.parse(tile.xhr.response);

    TileSource.projectTile(tile); // mercator projection
    TileSource.scaleTile(tile); // re-scale from meters to local tile coords
};


/*** Mapbox vector tiles ***/

TileSource.MapboxTileSource = MapboxTileSource;
MapboxTileSource.prototype = Object.create(NetworkTileSource.prototype);

function MapboxTileSource (url_template, options)
{
    NetworkTileSource.apply(this, arguments);
    this.response_type = "arraybuffer"; // binary data
    this.VectorTile = require('vectortile'); // Mapbox vector tile lib
}

MapboxTileSource.prototype._loadTile = function (tile, renderer)
{
    // Convert Mapbox vector tile to GeoJSON
    tile.data = new this.VectorTile(new Uint8Array(tile.xhr.response));
    tile.layers = tile.data.toGeoJSON();
    delete tile.data;

    // Post-processing: flip tile y and copy OSM id
    for (var t in tile.layers) {
        var num_features = tile.layers[t].features.length;
        for (var f=0; f < num_features; f++) {
            var feature = tile.layers[t].features[f];

            feature.properties.id = feature.properties.osm_id;
            feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, function (coordinates) {
                coordinates[1] = -coordinates[1];
                return coordinates;
            });
        };
    }
};
