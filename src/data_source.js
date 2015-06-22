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

// For tiling GeoJSON client-side
import geojsonvt from 'geojson-vt';

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
        this.max_zoom = source.max_zoom;
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

    load(dest) {
        dest.source_data = {};
        dest.source_data.layers = {};
    }

    // Register a new data source type, under a type name
    static register(type_class, type_name) {
        if (!type_class || !type_name) {
            return;
        }

        DataSource.types[type_name] = type_class;
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
        super.load(dest);

        let url = this.formatUrl(dest);

        let source_data = dest.source_data;
        source_data.url = url;
        dest.debug = dest.debug || {};
        dest.debug.network = +new Date();

        return new Promise((resolve, reject) => {
            source_data.error = null;
            // For testing network errors
            // var promise = Utils.io(url, 60 * 100, this.response_type);
            // if (Math.random() < .7) {
            //     promise = Promise.reject(Error('fake data source error'));
            // }
            // promise.then((body) => {
            let promise = Utils.io(url, 60 * 1000, this.response_type);
            source_data.request = promise.request;

            promise.then((body) => {
                dest.debug.response_size = body.length || body.byteLength;
                dest.debug.network = +new Date() - dest.debug.network;
                dest.debug.parsing = +new Date();
                this.parseSourceData(dest, source_data, body);
                dest.debug.parsing = +new Date() - dest.debug.parsing;
                resolve(dest);
            }).catch((error) => {
                source_data.error = error.toString();
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
        let coords = Geo.wrapTile(tile.coords, { x: true });
        var url = this.url.replace('{x}', coords.x).replace('{y}', coords.y).replace('{z}', coords.z);

        if (this.url_hosts != null) {
            url = url.replace(/{s:\[([^}+]+)\]}/, this.url_hosts[this.next_host]);
            this.next_host = (this.next_host + 1) % this.url_hosts.length;
        }
        return url;
    }

    // Checks for the x/y/z tile pattern in URL template
    urlHasTilePattern(url) {
        return url &&
            url.search('{x}') > -1 &&
            url.search('{y}') > -1 &&
            url.search('{z}') > -1;
    }

}


/**
 GeoJSON standalone (non-tiled) source
 Uses geojson-vt split into tiles client-side
*/

export class GeoJSONSource extends NetworkSource {

    constructor(source) {
        super(source);
        this.tiled = true;
        this.load_data = null;
        this.tile_indexes = {}; // geojson-vt tile indices, by layer name
        this.max_zoom = this.max_zoom || 14;
    }

    load(dest) {
        if (!this.load_data) {
            this.load_data = super.load({}).then(data => {
                let layers = data.source_data.layers;
                for (let layer_name in layers) {
                    this.tile_indexes[layer_name] = geojsonvt(layers[layer_name], {
                        maxZoom: this.max_zoom,  // max zoom to preserve detail on
                        tolerance: 3, // simplification tolerance (higher means simpler)
                        extent: 4096, // tile extent (both width and height)
                        buffer: 0     // tile buffer on each side
                    });
                }

                this.loaded = true;
                return data;
            });
        }

        return this.load_data.then(() => {
            dest.source_data = { layers: {} };

            for (let layer_name in this.tile_indexes) {
                dest.source_data.layers[layer_name] = this.getTileFeatures(dest, layer_name);
            }

            return dest;
        });
    }

    getTileFeatures(tile, layer_name) {
        let coords = Geo.wrapTile(tile.coords, { x: true });

        // request a particular tile
        let t = this.tile_indexes[layer_name].getTile(coords.z, coords.x, coords.y);

        // Convert from MVT-style JSON struct to GeoJSON
        let collection;
        if (t && t.features) {
            collection = {
                type: 'FeatureCollection',
                features: []
            };

            for (let feature of t.features) {
                let type;
                if (feature.type === 1) {
                    type = 'MultiPoint';
                }
                else if (feature.type === 2) {
                    type = 'MultiLineString';
                }
                else if (feature.type === 3) {
                    type = 'MultiPolygon';
                }
                else {
                    continue;
                }

                // Flip Y coords
                let geom = feature.geometry.map(ring =>
                    ring.map(coord => [coord[0], -coord[1]])
                );

                // Decode multipolygon
                if (type === 'MultiPolygon') {
                    geom = this.decodeMultiPolygon(geom);
                }

                let f = {
                    type: 'Feature',
                    geometry: {
                        type,
                        coordinates: geom
                    },
                    properties: feature.tags
                };

                collection.features.push(f);
            }
        }

        return collection;
    }

    // Decode multipolygons, which are encoded as a single set of rings
    // Outer rings are wound CCW, inner are CW
    // A CCW ring indicates the start of a new polygon
    decodeMultiPolygon (geom) {
        let polys = [];
        let poly = [];
        for (let ring of geom) {
            let winding = Utils.ringWinding(ring);
            if (winding === 'CCW' && poly.length > 0) {
                polys.push(poly);
                poly = [];
            }
            poly.push(ring);
        }
        if (poly.length > 0) {
            polys.push(poly);
        }
        return polys;
    }

    formatUrl (dest) {
        return this.url;
    }

    parseSourceData (tile, source, response) {
        source.layers = this.getLayers(JSON.parse(response));
    }

    // Detect single or multiple layers in returned data
    getLayers (data) {
        if (data.type === 'Feature' || data.type === 'FeatureCollection') {
            return { _default: data };
        }
        else {
            return data;
        }
    }

}


/**
 TopoJSON standalone (non-tiled) source
 Uses geojson-vt split into tiles client-side
*/

export class TopoJSONSource extends GeoJSONSource {

    parseSourceData (tile, source, response) {
        let data = JSON.parse(response);
        data = this.toGeoJSON(data);
        source.layers = this.getLayers(data);
    }

    toGeoJSON (data) {
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
        return data;
    }

}

/**
 Mapzen/OSM.US-style GeoJSON vector tiles
 @class GeoJSONTileSource
*/
export class GeoJSONTileSource extends NetworkTileSource {

    constructor(source) {
        super(source);

        // Check for URL tile pattern, if not found, treat as standalone GeoJSON/TopoJSON object
        if (!this.urlHasTilePattern(this.url)) {
            // Check instance as subclass first parent class will also match
            if (this instanceof TopoJSONTileSource) {
                return new TopoJSONSource(source);
            }
            else if (this instanceof GeoJSONTileSource) {
                return new GeoJSONSource(source);
            }
            // else throw?
        }
    }

    parseSourceData (tile, source, response) {
        let data = JSON.parse(response);
        this.prepareGeoJSON(data, tile, source);
    }

    prepareGeoJSON (data, tile, source) {
        // Apply optional data transform
        if (typeof this.transform === 'function') {
            data = this.transform(data, source);
        }

        source.layers = GeoJSONSource.prototype.getLayers(data);

        // A "synthetic" tile that adjusts the tile min anchor to account for tile longitude wrapping
        let anchor = {
            coords: tile.coords,
            min: Geo.metersForTile(Geo.wrapTile(tile.coords, { x: true }))
        };

        DataSource.projectData(source); // mercator projection
        DataSource.scaleData(source, anchor); // re-scale from meters to local tile coords
    }

}

DataSource.register(GeoJSONTileSource, 'GeoJSON');      // prefered shorter name
DataSource.register(GeoJSONTileSource, 'GeoJSONTiles'); // for backwards-compatibility


/**
 Mapzen/OSM.US-style TopoJSON vector tiles
 @class TopoJSONTileSource
*/
export class TopoJSONTileSource extends GeoJSONTileSource {

    constructor(source) {
        // explicit return is needed since parent constructor can change instance class type
        return super(source);
    }

    parseSourceData (tile, source, response) {
        let data = JSON.parse(response);
        data = TopoJSONSource.prototype.toGeoJSON(data);
        this.prepareGeoJSON(data, tile, source);
    }

}

DataSource.register(TopoJSONTileSource, 'TopoJSON');        // prefered shorter name
DataSource.register(TopoJSONTileSource, 'TopoJSONTiles');   // for backwards-compatibility



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

DataSource.register(MVTSource, 'MVT');
