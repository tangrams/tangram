function TileSource (renderer, url_template, options)
{
    var options = options || {};
    this.renderer = renderer;
    this.url_template = url_template;
    this.max_zoom = options.max_zoom || Geo.max_zoom;
}

// TileSource.prototype.loadTile = function (renderer, tile, coords, div, callback)
// TileSource.prototype.loadTile = function (tile_info, callback)
TileSource.prototype.loadTile = function (tile, callback)
{
    var url = this.url_template.replace('{x}', tile.coords.x).replace('{y}', tile.coords.y).replace('{z}', tile.coords.z);
    var req = new XMLHttpRequest();
    var renderer = this.renderer;

    tile.url = url;
    tile.xhr = req;
    tile.debug.network = +new Date();

    req.responseType = "arraybuffer"; // binary data
    req.onload = function () {
        // Canceled while loading?
        if (tile.loading == false) {
            return;
        }

        // tile.layers = JSON.parse(req.response);
        tile.data = new Mapbox.VectorTile(new Uint8Array(req.response));
        tile.debug.network = +new Date() - tile.debug.network;

        // Convert Mapbox vector tile to GeoJSON
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

        // Extract desired layers from full GeoJSON response
        renderer.processLayersForTile(tile);

        // Post-processing
        // renderer.projectTile(tile);
        // renderer.scaleTile(tile); // re-scale from meters to local tile coords

        tile.xhr = null;
        tile.loading = false;
        tile.loaded = true;

        if (callback) {
            callback(tile);
        }
    };
    // TODO: add XHR error handling
    req.open('GET', url, true); // async flag
    req.send();
};
