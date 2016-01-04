/*jshint worker: true */
import Geo from '../geo';
import {MethodNotImplemented} from '../utils/errors';
import Utils from '../utils/utils';

export default class DataSource {

    constructor (source) {
        this.id = source.id;
        this.name = source.name;
        this.url = source.url;
        this.pad_scale = source.pad_scale || 0.0005; // scale tile up by small factor to cover seams
        this.enforce_winding = source.enforce_winding || false; // whether to enforce winding order

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
        this.max_zoom = Math.min(source.max_zoom || Geo.max_zoom, Geo.max_zoom);
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

                        // Optionally enforce winding order since not all data sources guarantee it
                        if (this.enforce_winding) {
                            Geo.enforceWinding(feature.geometry, 'CCW');
                        }
                    });
                }
            }
        });
    }

    // Sub-classes must implement
    _load(dest) {
        throw new MethodNotImplemented('_load');
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

    _load (dest) {
        // super.load(dest);

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
