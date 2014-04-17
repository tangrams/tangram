function TileSource (url_template, options)
{
    var options = options || {};
    this.url_template = url_template;
    this.max_zoom = options.max_zoom || Geo.max_zoom; // overzoom will apply for zooms higher than this
}

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

        if (tile_source._loadTile) {
            tile_source._loadTile(tile, renderer);
        }
        tile.debug.network = +new Date() - tile.debug.network;

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

GeoJSONTileSource.prototype = Object.create(NetworkTileSource.prototype);

function GeoJSONTileSource (url_template, options)
{
    NetworkTileSource.apply(this, arguments);
}

GeoJSONTileSource.prototype._loadTile = function (tile, renderer)
{
    tile.layers = JSON.parse(tile.xhr.response);

    renderer.processLayersForTile(tile); // extract desired layers from full GeoJSON response
    renderer.projectTile(tile); // mercator projection
    renderer.scaleTile(tile); // re-scale from meters to local tile coords
};


/*** Mapbox vector tiles ***/

MapboxTileSource.prototype = Object.create(NetworkTileSource.prototype);

function MapboxTileSource (url_template, options)
{
    NetworkTileSource.apply(this, arguments);
    this.response_type = "arraybuffer"; // binary data
}

MapboxTileSource.prototype._loadTile = function (tile, renderer)
{
    // Convert Mapbox vector tile to GeoJSON
    tile.data = new Mapbox.VectorTile(new Uint8Array(tile.xhr.response));
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

    renderer.processLayersForTile(tile); // extract desired layers from full GeoJSON response
};
