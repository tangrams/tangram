var Geo = require('./geo.js');
var Point = require('./point.js');

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
                coordinates[0] = (coordinates[0] - tile.min.x) * Geo.units_per_meter[tile.coords.z];
                coordinates[1] = (coordinates[1] - tile.min.y) * Geo.units_per_meter[tile.coords.z]; // TODO: this will create negative y-coords, force positive as below instead? or, if later storing positive coords in bit-packed values, flip to negative in post-processing?
                // coordinates[1] = (coordinates[1] - tile.max.y) * Geo.units_per_meter[tile.coords.z]; // alternate to force y-coords to be positive, subtract tile max instead of min
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

    this.url_hosts = null;
    var host_match = this.url_template.match(/{s:\[([^}+]+)\]}/);
    if (host_match != null && host_match.length > 1) {
        this.url_hosts = host_match[1].split(',');
        this.next_host = 0;
    }
}

NetworkTileSource.prototype.loadTile = function (tile, callback)
{
    var tile_source = this;
    var req = new XMLHttpRequest();
    var url = this.url_template.replace('{x}', tile.coords.x).replace('{y}', tile.coords.y).replace('{z}', tile.coords.z);

    if (this.url_hosts != null) {
        url = url.replace(/{s:\[([^}+]+)\]}/, this.url_hosts[this.next_host]);
        this.next_host = (this.next_host + 1) % this.url_hosts.length;
    }

    tile.url = url;
    tile.xhr = req;
    tile.debug.network = +new Date();

    req.onload = function () {
        // Canceled while loading?
        if (tile.loading == false) {
            return;
        }

        tile.debug.response_size = tile.xhr.response.length || tile.xhr.response.byteLength;
        tile.debug.network = +new Date() - tile.debug.network;

        if (tile_source._loadTile) {
            tile.debug.parsing = +new Date();
            tile_source._loadTile(tile);
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
    req.open('GET', url, true); // async flag
    req.responseType = this.response_type;
    req.send();
};


/*** Mapzen/OSM.US-style GeoJSON vector tiles ***/

TileSource.GeoJSONTileSource = GeoJSONTileSource;
GeoJSONTileSource.prototype = Object.create(NetworkTileSource.prototype);

function GeoJSONTileSource (url_template, options)
{
    NetworkTileSource.apply(this, arguments);
}

GeoJSONTileSource.prototype._loadTile = function (tile)
{
    tile.layers = JSON.parse(tile.xhr.response);

    TileSource.projectTile(tile); // mercator projection
    TileSource.scaleTile(tile); // re-scale from meters to local tile coords
};


/*** Mapzen/OSM.US-style TopoJSON vector tiles ***/

TileSource.TopoJSONTileSource = TopoJSONTileSource;
TopoJSONTileSource.prototype = Object.create(NetworkTileSource.prototype);

function TopoJSONTileSource (url_template, options)
{
    NetworkTileSource.apply(this, arguments);

    // Loads TopoJSON library from official D3 source on demand
    // Not including in base library to avoid the extra weight
    if (typeof topojson == 'undefined') {
        try {
            importScripts('http://d3js.org/topojson.v1.min.js');
            console.log("loaded TopoJSON library");
        }
        catch (e) {
            console.log("failed to load TopoJSON library!");
        }
    }
}

TopoJSONTileSource.prototype._loadTile = function (tile)
{
    if (typeof topojson == 'undefined') {
        tile.layers = {};
        return;
    }

    tile.layers = JSON.parse(tile.xhr.response);

    // Single layer
    if (tile.layers.objects.vectiles != null) {
        tile.layers = topojson.feature(tile.layers, tile.layers.objects.vectiles);
    }
    // Multiple layers
    else {
        var layers = {};
        for (var t in tile.layers.objects) {
            layers[t] = topojson.feature(tile.layers, tile.layers.objects[t]);
        }
        tile.layers = layers;
    }

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
    this.VectorTile = require('vector-tile'); // Mapbox vector tile lib
}

MapboxTileSource.prototype._loadTile = function (tile)
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

if (module !== undefined) {
    module.exports = TileSource;
}
