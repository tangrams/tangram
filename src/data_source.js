/*jshint worker: true */
/*globals DataSource, topojson */
import Geo from './geo';
import {MethodNotImplemented} from './utils/errors';
import Utils from './utils/utils';

// For TopoJSON tiles
import topojson from 'topojson';

// For MVT tiles
import Pbf from 'pbf';
import {VectorTile, VectorTileFeature} from 'vector-tile';

export default class DataSource {

    constructor (source) {
        this.id = source.id;
        this.name = source.name;
        this.url = source.url;

        // Optional function to transform source data
        this.transform = source.transform;
        if (typeof this.transform === 'function') {
            this.transform.bind(this);
        }

        // Optional additional data to pass to the transform function
        this.extra_data = source.extra_data;

        // Optional additional scripts made available to the transform function
        if (typeof importScripts === 'function' && source.scripts) {
            source.scripts.forEach(function(s, si) {
                try {
                    importScripts(s);
                    Utils.log('info', 'DataSource: loaded library: ' + s);
                }
                catch (e) {
                    Utils.log('error', 'DataSource: failed to load library: ' + s);
                    Utils.log('error', e);
                }
            });
        }

        // overzoom will apply for zooms higher than this
        this.max_zoom = source.max_zoom || Geo.max_zoom;
    }

    // Create a tile source by type, factory-style
    static create (source) {
        if (DataSource.types[source.type]) {
            return new DataSource.types[source.type](source);
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

    load(dest) { throw new MethodNotImplemented('load'); }

    // Register a new data source type
    static register(type_class) {
        if (!type_class || !type_class.type) {
            return;
        }

        DataSource.types[type_class.type] = type_class;
    }

}

DataSource.types = {}; // set of supported data source classes, referenced by type name


/*** Generic network loading source - abstract class ***/

export class NetworkSource extends DataSource {

    constructor (source) {
        super(source);
        this.response_type = ""; // use to set explicit XHR type
    }

    load (dest) {
        let url = this.formatUrl(dest);

        if (dest.sources == null) {
            dest.sources = {};
        }

        var source = dest.sources[this.name] = {};

        source.url = url;
        source.debug = {};
        source.debug.network = +new Date();

        return new Promise((resolve, reject) => {
            source.error = null;
            // For testing network errors
            // var promise = Utils.io(url, 60 * 100, this.response_type);
            // if (Math.random() < .7) {
            //     promise = Promise.reject(Error('fake data source error'));
            // }
            // promise.then((body) => {
            let promise = Utils.io(url, 60 * 1000, this.response_type);
            source.request = promise.request;

            promise.then((body) => {
                source.debug.response_size = body.length || body.byteLength;
                source.debug.network = +new Date() - source.debug.network;
                source.debug.parsing = +new Date();
                this.parseSourceData(dest, source, body);
                source.debug.parsing = +new Date() - source.debug.parsing;
                resolve(dest);
            }).catch((error) => {
                source.error = error.toString();
                resolve(dest); // resolve request but pass along error
            });
        });
    }

    // Sub-classes must implement:

    formatUrl (dest) {
        throw new MethodNotImplemented('formatUrl');
    }

    parseSourceData (dest, source, reponse) {
        throw new MethodNotImplemented('parseSourceData');
    }
}


/*** Generic network tile loading - abstract class ***/

export class NetworkTileSource extends NetworkSource {

    constructor (source) {
        super(source);

        this.tiled = true;
        this.url_hosts = null;
        var host_match = this.url.match(/{s:\[([^}+]+)\]}/);
        if (host_match != null && host_match.length > 1) {
            this.url_hosts = host_match[1].split(',');
            this.next_host = 0;
        }
    }

    formatUrl(tile) {
        var url = this.url.replace('{x}', tile.coords.x).replace('{y}', tile.coords.y).replace('{z}', tile.coords.z);

        if (this.url_hosts != null) {
            url = url.replace(/{s:\[([^}+]+)\]}/, this.url_hosts[this.next_host]);
            this.next_host = (this.next_host + 1) % this.url_hosts.length;
        }
        return url;
    }

}


/**
 GeoJSON standalone (non-tiled) source
*/

export class GeoJSONSource extends NetworkSource {

    formatUrl (dest) {
        return this.url;
    }

    parseSourceData (tile, source, response) {
        source.layers = { _default: JSON.parse(response) };
        DataSource.projectData(source); // mercator projection
    }
}

GeoJSONSource.type = 'GeoJSON';
DataSource.register(GeoJSONSource);


/**
 Mapzen/OSM.US-style GeoJSON vector tiles
 @class GeoJSONTileSource
*/
export class GeoJSONTileSource extends NetworkTileSource {

    parseSourceData (tile, source, response) {
        let data = JSON.parse(response);
        this.prepareGeoJSON(data, tile, source);
    }

    prepareGeoJSON (data, tile, source) {
        // Apply optional data transform
        if (typeof this.transform === 'function') {
            data = this.transform(data, source);
        }

        // Single layer or multi-layers?
        if (data.type === 'Feature' || data.type === 'FeatureCollection') {
            source.layers = { _default: data };
        }
        else {
            source.layers = data;
        }

        DataSource.projectData(source); // mercator projection
        DataSource.scaleData(source, tile); // re-scale from meters to local tile coords
    }
}

GeoJSONTileSource.type = 'GeoJSONTiles';
DataSource.register(GeoJSONTileSource);


/**
 Mapzen/OSM.US-style TopoJSON vector tiles
 @class TopoJSONTileSource
*/
export class TopoJSONTileSource extends GeoJSONTileSource {

    parseSourceData (tile, source, response) {
        let data = JSON.parse(response);

        // Single layer
        if (data.objects &&
            Object.keys(data.objects).length === 1 &&
            data.objects.vectile != null) {
            data = topojson.feature(data, data.objects.vectile);
        }
        // Multiple layers
        else {
            let layers = {};
            for (let key in data.objects) {
                layers[key] = topojson.feature(data, data.objects[key]);
            }
            data = layers;
        }

        this.prepareGeoJSON(data, tile, source);
    }

}

TopoJSONTileSource.type = 'TopoJSONTiles';
DataSource.register(TopoJSONTileSource);



/**
 Mapbox Vector Tile format
 @class MVTSource
*/
export class MVTSource extends NetworkTileSource {

    constructor (source) {
        super(source);
        this.response_type = "arraybuffer"; // binary data
        this.pad_scale = source.pad_scale || 0.001; // scale tile up by this factor (0.1%) to cover seams
    }

    parseSourceData (tile, source, response) {
        // Convert Mapbox vector tile to GeoJSON
        var data = new Uint8Array(response);
        var buffer = new Pbf(data);
        source.data = new VectorTile(buffer);
        source.layers = this.toGeoJSON(source.data);
        delete source.data; // comment out to save raw data for debugging

        // Post-processing
        for (var t in source.layers) {
            var num_features = source.layers[t].features.length;
            for (var f=0; f < num_features; f++) {
                var feature = source.layers[t].features[f];

                // Copy OSM id
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

                if (VectorTileFeature.types[feature.type] === 'Point') {
                    geometry.type = 'Point';
                    geometry.coordinates = geometry.coordinates[0][0];
                }
                else if (VectorTileFeature.types[feature.type] === 'LineString') {
                    if (coordinates.length === 1) {
                        geometry.type = 'LineString';
                        geometry.coordinates = geometry.coordinates[0];
                    }
                    else {
                        geometry.type = 'MultiLineString';
                    }
                }
                else if (VectorTileFeature.types[feature.type] === 'Polygon') {
                    geometry.type = 'Polygon';
                }

                layer_geojson.features.push(feature_geojson);
            }
            layers[l] = layer_geojson;
        }
        return layers;
    }

}

MVTSource.type = 'MVT';
DataSource.register(MVTSource);
