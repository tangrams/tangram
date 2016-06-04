/*jshint worker: true */
import Geo from '../geo';
import {MethodNotImplemented} from '../utils/errors';
import Utils from '../utils/utils';

export default class DataSource {

    constructor (config, sources) {
        this.config = config; // save original config
        this.sources = sources; // full set of data sources TODO: centralize these like textures?
        this.id = config.id;
        this.name = config.name;
        this.pad_scale = config.pad_scale || 0.0001; // scale tile up by small factor to cover seams
        this.default_winding = null; // winding order will adapt to data source
        this.rasters = // attached raster tile sources
            Array.isArray(config.rasters) ? [...new Set(config.rasters)] : []; // de-dupe with set conversion

        // Optional function to transform source data
        this.transform = config.transform;
        if (typeof this.transform === 'function') {
            this.transform.bind(this);
        }

        // Optional additional data to pass to the transform function
        this.extra_data = config.extra_data;

        // Optional additional scripts made available to the transform function
        // NOTE: these are loaded alongside the library when the workers are instantiated
        this.scripts = config.scripts;

        // overzoom will apply for zooms higher than this
        this.max_zoom = config.max_zoom || Geo.default_source_max_zoom;
    }

    // Create a tile source by type, factory-style
    static create (source, sources) {
        if (DataSource.types[source.type]) {
            return new DataSource.types[source.type](source, sources);
        }
    }

    // Check if a data source definition changed
    static changed (source, prev_source) {
        if (!source || !prev_source) {
            return true;
        }

        let cur = Object.assign({}, source.config, { id: null }); // null out ids since we don't want to compare them
        let prev = Object.assign({}, prev_source.config, { id: null });

        return JSON.stringify(cur) !== JSON.stringify(prev);
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
     Re-scale geometries within each source to internal tile units
    */
    static scaleData (source, {coords: {z}, min, max}) {
        let units_per_meter = Geo.unitsPerMeter(z);
        for (var t in source.layers) {
            var num_features = source.layers[t].features.length;
            for (var f=0; f < num_features; f++) {
                var feature = source.layers[t].features[f];
                Geo.transformGeometry(feature.geometry, coord => {
                    coord[0] = (coord[0] - min.x) * units_per_meter;
                    coord[1] = (coord[1] - min.y) * units_per_meter * -1; // flip coords positive
                });
            }
        }
    }

    load(dest) {
        dest.source_data = {};
        dest.source_data.layers = {};
        dest.pad_scale = this.pad_scale;
        dest.rasters = [...this.rasters]; // copy list of rasters to load for tile

        return this._load(dest).then((dest) => {
            // Post-processing
            for (let layer in dest.source_data.layers) {
                let data = dest.source_data.layers[layer];
                if (data && data.features) {
                    data.features.forEach(feature => {
                        Geo.transformGeometry(feature.geometry, coord => {
                            // Flip Y coords
                            coord[1] = -coord[1];

                            // Slightly scale up tile to cover seams
                            if (this.pad_scale) {
                                coord[0] = Math.round(coord[0] * (1 + this.pad_scale) - (Geo.tile_scale * this.pad_scale/2));
                                coord[1] = Math.round(coord[1] * (1 + this.pad_scale) - (Geo.tile_scale * this.pad_scale/2));
                            }
                        });

                        // Use first encountered polygon winding order as default for data source
                        this.updateDefaultWinding(feature.geometry);
                    });
                }
            }

            dest.default_winding = this.default_winding || 'CCW';
            return dest;
        });
    }

    // Sub-classes must implement
    _load(dest) {
        throw new MethodNotImplemented('_load');
    }

    // Infer winding for data source from first ring of provided geometry
    updateDefaultWinding (geom) {
        if (this.default_winding == null) {
            if (geom.type === 'Polygon') {
                this.default_winding = Geo.ringWinding(geom.coordinates[0]);
            }
            else if (geom.type === 'MultiPolygon') {
                this.default_winding = Geo.ringWinding(geom.coordinates[0][0]);
            }
        }
        return this.default_winding;
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
        this.url = Utils.addParamsToURL(source.url, source.url_params);
        this.response_type = ""; // use to set explicit XHR type

        if (this.url == null) {
            throw Error('Network data source must provide a `url` property');
        }
    }

    _load (dest) {
        let url = this.formatUrl(this.url, dest);

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

    formatUrl (url_template, dest) {
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

    formatUrl(url_template, tile) {
        let coords = Geo.wrapTile(tile.coords, { x: true });
        let url = url_template.replace('{x}', coords.x).replace('{y}', coords.y).replace('{z}', coords.z);

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
