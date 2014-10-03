/*globals TileSource */
import {Geo}   from './geo';
import Point from './point';
import xhr from 'xhr';


export default class TileSource {

    constructor (source) {
        this.url_template = source.url || '';
        this.max_zoom = source.max_zoom || Geo.max_zoom; // overzoom will apply for zooms higher than this
    }

    // Create a tile source by type, factory-style
    static create (source) {
        switch (source.type) {
            case 'TopoJSONTileSource':
                return new TopoJSONTileSource(source);
            case 'MapboxFormatTileSource':
                return new MapboxFormatTileSource(source);
            case 'GeoJSONTileSource':
            default:
                return new GeoJSONTileSource(source);
        }
    }

    // Mercator projection
    static projectTile (tile) {
        var timer = +new Date();
        for (var t in tile.layers) {
            var num_features = tile.layers[t].features.length;
            for (var f=0; f < num_features; f++) {
                var feature = tile.layers[t].features[f];
                feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, (coordinates) => {
                    var m = Geo.latLngToMeters(Point(coordinates[0], coordinates[1]));
                    return [m.x, m.y];
                });
            }
        }

        if (tile.debug !== undefined) {
            tile.debug.projection = +new Date() - timer;
        }
        return tile;
    }

    // Re-scale geometries within each tile to the range [0, scale]
    // TODO: clip vertices at edges? right now vertices can have
    // values outside [0, scale] (over or under bounds); this would
    // pose a problem if we wanted to binary encode the vertices in
    // fewer bits (e.g. 12 bits each for scale of 4096)
    static scaleTile (tile) {
        for (var t in tile.layers) {
            var num_features = tile.layers[t].features.length;
            for (var f=0; f < num_features; f++) {
                var feature = tile.layers[t].features[f];
                feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, (coordinates) => {
                    coordinates[0] = (coordinates[0] - tile.min.x) * Geo.units_per_meter[tile.coords.z];
                    coordinates[1] = (coordinates[1] - tile.min.y) * Geo.units_per_meter[tile.coords.z]; // TODO: this will create negative y-coords, force positive as below instead? or, if later storing positive coords in bit-packed values, flip to negative in post-processing?
                    // coordinates[1] = (coordinates[1] - tile.max.y) * Geo.units_per_meter[tile.coords.z]; // alternate to force y-coords to be positive, subtract tile max instead of min
                    return coordinates;
                });
            }
        }
        return tile;
    }
}



/*** Generic network tile loading - abstract class ***/

class NetworkTileSource extends TileSource {

    constructor (source) {
        super(source);

        this.response_type = ""; // use to set explicit XHR type
        this.url_hosts = null;
        var host_match = this.url_template.match(/{s:\[([^}+]+)\]}/);
        if (host_match != null && host_match.length > 1) {
            this.url_hosts = host_match[1].split(',');
            this.next_host = 0;
        }
    }

    getDefaultHeaders() { return { "Content-Type": "application/json" }; }

    loadTile (tile, callback) {
//        var xhr = req;
        var url = this.url_template.
            replace('{x}', tile.coords.x).
            replace('{y}', tile.coords.y).
            replace('{z}', tile.coords.z);

        if (this.url_hosts != null) {
            url = url.replace(/{s:\[([^}+]+)\]}/, this.url_hosts[this.next_host]);
            this.next_host = (this.next_host + 1) % this.url_hosts.length;
        }

        xhr({
            url: url,
            headers: this.getDefaultHeaders()
        }, (err, resp, body) => {
            if (err) return callback(err);
            debugger;
            this.parseTile(tile, body);

            if (typeof callback === 'function') return callback(tile);

        });

        // tile.url = url;


//        tile.xhr = req;

//        tile.debug.network = +new Date();
/*

xhr({
    body: someJSONString,
    uri: "/foo",
    headers: {
        "Content-Type": "application/json"
    }
}, function (err, resp, body) {
    // resp === xhr
    // check resp.body or resp.statusCode
})

*/
        // req.onload = () => {
        //     // Canceled while loading?
        //     if (tile.loading == false) {
        //         return;
        //     }

        //     if (xhr.response === undefined) xhr.response = xhr.responseText;

//            tile.debug.response_size = tile.xhr.response.length || tile.xhr.response.byteLength;
//            tile.debug.network = +new Date() - tile.debug.network;

//            tile.debug.parsing = +new Date();
//            this.parseTile(tile, xhr.response);
//            tile.debug.parsing = +new Date() - tile.debug.parsing;

//            delete tile.xhr;
//            tile.loading = false;
//            tile.loaded = true;

        //     if (callback) {
        //         callback(tile);
        //     }
        // };
        // TODO: add XHR error handling
        // req.open('GET', url, true); // async flag
        // req.responseType = this.response_type;
        // req.send();

    }

    // Sub-classes must implement this method:
    // parseTile (tile) {
    // }
}


/**
 Mapzen/OSM.US-style GeoJSON vector tiles
 @class GeoJSONTileSource
*/
class GeoJSONTileSource extends NetworkTileSource {

    constructor (source) {
        super(source);
    }

    parseTile (tile, response) {
        tile.layers = JSON.parse(response);

        TileSource.projectTile(tile); // mercator projection
        TileSource.scaleTile(tile); // re-scale from meters to local tile coords
    }
}


/*** Mapzen/OSM.US-style TopoJSON vector tiles ***/

class TopoJSONTileSource extends NetworkTileSource {

    constructor (source) {
        super(source);

        // Loads TopoJSON library from official D3 source on demand
        // Not including in base library to avoid the extra weight
        if (typeof topojson == 'undefined') {
            try {
                importScripts('http://d3js.org/topojson.v1.min.js');
                console.log("loaded TopoJSON library");
            }
            catch (e) {
                console.error("failed to load TopoJSON library!", e);
            }
        }
    }

    parseTile (tile) {
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
    }

}


/*** Mapbox vector tiles ***/

class MapboxFormatTileSource extends NetworkTileSource {

    constructor (source) {
        super(source);
        this.response_type = "arraybuffer"; // binary data
        this.Protobuf = require('pbf');
        this.VectorTile = require('vector-tile').VectorTile; // Mapbox vector tile lib, forked to add GeoJSON output
    }

    parseTile (tile) {
        // Convert Mapbox vector tile to GeoJSON
        var data = new Uint8Array(tile.xhr.response);
        var buffer = new this.Protobuf(data);
        tile.data = new this.VectorTile(buffer);
        tile.layers = tile.data.toGeoJSON();
        delete tile.data;

        // Post-processing: flip tile y and copy OSM id
        for (var t in tile.layers) {
            var num_features = tile.layers[t].features.length;
            for (var f=0; f < num_features; f++) {
                var feature = tile.layers[t].features[f];

                feature.properties.id = feature.properties.osm_id;
                feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, (coordinates) => {
                    coordinates[1] = -coordinates[1];
                    return coordinates;
                });
            }
        }
    }

}

