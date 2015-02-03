/*jshint worker: true */
/*globals TileSource, topojson */
import Geo from './geo';
import {MethodNotImplemented} from './utils/errors';
import Utils from './utils/utils';
import log from 'loglevel';

export default class TileSource {

    constructor (source) {
        this.name = source.name;
        this.url_template = source.url;
        // overzoom will apply for zooms higher than this
        this.max_zoom = source.max_zoom || Geo.max_zoom;
    }

    buildAsMessage() {
        return {
            name: this.name,
            type: this.type,
            url: this.url_template,
            max_zoom: this.max_zoom
        };
    }

    // Create a tile source by type, factory-style
    static create (source) {
        switch (source.type) {
            case 'TopoJSONTileSource':
                return new TopoJSONTileSource(source);
            case 'MapboxFormatTileSource':
                return new MapboxFormatTileSource(source);
            case 'GeoJSONTileSource':
            /* falls through */
            default:
                return new GeoJSONTileSource(source);
        }
    }

    // Mercator projection
    static projectData (source) {
        var timer = +new Date();
        for (var t in source.layers) {
            var num_features = source.layers[t].features.length;
            for (var f=0; f < num_features; f++) {
                var feature = source.layers[t].features[f];
                Geo.transformGeometry(feature.geometry, coord => {
                    var [x, y] = Geo.latLngToMeters(coord);
                    coord[0] = x;
                    coord[1] = y;
                });
            }
        }

        if (source.debug !== undefined) {
            source.debug.projection = +new Date() - timer;
        }
    }

    /**
     Re-scale geometries within each source to the range [0, scale]
     TODO: clip vertices at edges? right now vertices can have
     values outside [0, scale] (over or under bounds); this would
     pose a problem if we wanted to binary encode the vertices in
     fewer bits (e.g. 12 bits each for scale of 4096)
    */
    static scaleData (source, {coords: {z}, min}) {
        for (var t in source.layers) {
            var num_features = source.layers[t].features.length;
            for (var f=0; f < num_features; f++) {
                var feature = source.layers[t].features[f];
                Geo.transformGeometry(feature.geometry, coord => {
                    coord[0] = (coord[0] - min.x) * Geo.units_per_meter[z];
                    // TODO: this will create negative y-coords, force positive as below instead? or, if later storing positive coords in bit-packed values, flip to negative in post-processing?
                    coord[1] = (coord[1] - min.y) * Geo.units_per_meter[z];
                    // coord[1] = (coord[1] - tile.max.y) * Geo.units_per_meter[tile.coords.z]; // alternate to force y-coords to be positive, subtract tile max instead of min
                });
            }
        }
    }

    loadTile(tile) { throw new MethodNotImplemented('loadTile'); }
}



/*** Generic network tile loading - abstract class ***/

export class NetworkTileSource extends TileSource {


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

    formatTileUrl(tile) {
        var url = this.url_template.replace('{x}', tile.coords.x).replace('{y}', tile.coords.y).replace('{z}', tile.coords.z);

        if (this.url_hosts != null) {
            url = url.replace(/{s:\[([^}+]+)\]}/, this.url_hosts[this.next_host]);
            this.next_host = (this.next_host + 1) % this.url_hosts.length;
        }
        return url;
    }

    loadTile (tile) {
        var url = this.formatTileUrl(tile);

        if (tile.sources == null) {
            tile.sources = {};
        }

        var source = tile.sources[this.name] = {};

        source.url = url;
        source.debug = {};
        source.debug.network = +new Date();

        return new Promise((resolve, reject) => {
            source.error = null;
            // For testing network errors
            // var promise = Utils.io(url, 60 * 100, this.response_type);
            // if (Math.random() < .7) {
            //     promise = Promise.reject(Error('fake tile error'));
            // }
            // promise.then((body) => {
            Utils.io(url, 60 * 1000, this.response_type).then((body) => {
                source.debug.response_size = body.length || body.byteLength;
                source.debug.network = +new Date() - source.debug.network;
                source.debug.parsing = +new Date();
                this.parseSourceData(tile, source, body);
                source.debug.parsing = +new Date() - source.debug.parsing;
                resolve(tile);
            }).catch((error) => {
                source.error = error.toString();
                reject(error);
            });
        });
    }

    // Sub-classes must implement this method:
    parseSourceData (tile, source, reponse) {
        throw new MethodNotImplemented('parseTile');
    }
}


/**
 Mapzen/OSM.US-style GeoJSON vector tiles
 @class GeoJSONTileSource
*/
export class GeoJSONTileSource extends NetworkTileSource {

    constructor (source) {
        super(source);
        this.type = 'GeoJSONTileSource';
    }

    parseSourceData (tile, source, response) {

        source.layers = JSON.parse(response);

        TileSource.projectData(source); // mercator projection
        TileSource.scaleData(source, tile); // re-scale from meters to local tile coords
    }
}


/*** Mapzen/OSM.US-style TopoJSON vector tiles ***/
export class TopoJSONTileSource extends NetworkTileSource {

    constructor (source) {
        super(source);
        this.type = 'TopoJSONTileSource';

        // Loads TopoJSON library from official D3 source on demand
        // Not including in base library to avoid the extra weight
        if (typeof topojson === 'undefined') {
            try {
                importScripts('http://d3js.org/topojson.v1.min.js');
                log.info('TopoJSONTileSource: loaded topojson library');
            }
            catch (e) {
                log.error('TopoJSONTileSource: failed to load TopoJSON library!');
            }
        }
    }

    parseSourceData (tile, source, response) {
        if (typeof topojson === 'undefined') {
            tile.layers = {};
            return;
        }

        source.layers = JSON.parse(response);

        // Single layer
        if (source.layers.objects.vectiles != null) {
            source.layers = topojson.feature(source.layers, source.layers.objects.vectiles);
        }
        // Multiple layers
        else {
            var layers = {};
            for (var t in source.layers.objects) {
                layers[t] = topojson.feature(source.layers, source.layers.objects[t]);
            }
            source.layers = layers;
        }

        TileSource.projectData(source); // mercator projection
        TileSource.scaleData(source, tile); // re-scale from meters to local tile coords
    }

}


/*** Mapbox vector tiles ***/

export class MapboxFormatTileSource extends NetworkTileSource {

    constructor (source) {
        super(source);
        this.type = 'MapboxFormatTileSource';
        this.response_type = "arraybuffer"; // binary data
        this.Protobuf = require('pbf');
        this.VectorTile = require('vector-tile').VectorTile; // Mapbox vector tile lib
        this.VectorTileFeature = require('vector-tile').VectorTileFeature;

        this.pad_scale = source.pad_scale || 0.001; // scale tile up by this factor (0.1%) to cover seams
    }

    parseSourceData (tile, source, response) {
        // Convert Mapbox vector tile to GeoJSON
        var data = new Uint8Array(response);
        var buffer = new this.Protobuf(data);
        source.data = new this.VectorTile(buffer);
        source.layers = this.toGeoJSON(source.data);
        delete source.data; // comment out to save raw data for debugging

        // Post-processing
        for (var t in source.layers) {
            var num_features = source.layers[t].features.length;
            for (var f=0; f < num_features; f++) {
                var feature = source.layers[t].features[f];

                // Copy OSM id
                feature.properties.id = feature.properties.osm_id;
                Geo.transformGeometry(feature.geometry, coord => {
                    // Slightly scale up tile to cover seams
                    coord[0] = Math.round(coord[0] * (1 + this.pad_scale) - (4096 * this.pad_scale/2));
                    coord[1] = Math.round(coord[1] * (1 + this.pad_scale) - (4096 * this.pad_scale/2));

                    // Flip Y coord
                    coord[1] = -coord[1];
                });
            }
        }
    }

    // Loop through layers/features using Mapbox lib API, convert to GeoJSON features
    // Returns an object with keys for each layer, e.g. { layer: geojson }
    toGeoJSON (tile) {
        var layers = {};
        for (var l in tile.layers) {
            var layer = tile.layers[l];
            var layer_geojson = {
                type: 'FeatureCollection',
                features: []
            };

            for (var f=0; f < layer.length; f++) {
                var feature = layer.feature(f);
                var feature_geojson = {
                    type: 'Feature',
                    geometry: {},
                    properties: feature.properties
                };

                var geometry = feature_geojson.geometry;
                var coordinates = feature.loadGeometry();
                for (var r=0; r < coordinates.length; r++) {
                    var ring = coordinates[r];
                    for (var c=0; c < ring.length; c++) {
                        ring[c] = [
                            ring[c].x,
                            ring[c].y
                        ];
                    }
                }
                geometry.coordinates = coordinates;

                if (this.VectorTileFeature.types[feature.type] === 'Point') {
                    geometry.type = 'Point';
                    geometry.coordinates = geometry.coordinates[0][0];
                }
                else if (this.VectorTileFeature.types[feature.type] === 'LineString') {
                    if (coordinates.length === 1) {
                        geometry.type = 'LineString';
                        geometry.coordinates = geometry.coordinates[0];
                    }
                    else {
                        geometry.type = 'MultiLineString';
                    }
                }
                else if (this.VectorTileFeature.types[feature.type] === 'Polygon') {
                    geometry.type = 'Polygon';
                }

                layer_geojson.features.push(feature_geojson);
            }
            layers[l] = layer_geojson;
        }
        return layers;
    }

}

