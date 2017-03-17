/*jshint worker: true */
import Geo from '../geo';
import {MethodNotImplemented} from '../utils/errors';
import Utils from '../utils/utils';
import * as URLs from '../utils/urls';
import log from '../utils/log';

export default class DataSource {

    constructor (config, sources) {
        this.config = config; // save original config
        this.sources = sources; // full set of data sources TODO: centralize these like textures?
        this.id = config.id;
        this.name = config.name;
        this.pad_scale = config.pad_scale || 0.0001; // scale tile up by small factor to cover seams
        this.default_winding = null; // winding order will adapt to data source
        this.rasters = []; // attached raster tile sources
        if (Array.isArray(config.rasters)) { // copy unique set of raster sources
            config.rasters.forEach(r => {
                if (this.rasters.indexOf(r) === -1) {
                    this.rasters.push(r);
                }
            });
        }

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
        this.max_zoom = (config.max_zoom != null) ? config.max_zoom : Geo.default_source_max_zoom;

        this.zoom_bias = config.zoom_bias || 0;
        this.max_coord_zoom = this.max_zoom + this.zoom_bias;

        // no tiles will be requested or displayed outside of these min/max values
        this.min_display_zoom = (config.min_display_zoom != null) ? config.min_display_zoom : 0;
        this.max_display_zoom = (config.max_display_zoom != null) ? config.max_display_zoom : null;
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

    // All data sources support a min zoom, tiled sources can subclass for more specific limits (e.g. bounding box)
    includesTile (coords, style_zoom) {
        // Limit by this data source
        if (coords.z < this.min_display_zoom || (this.max_display_zoom != null && style_zoom > this.max_display_zoom)) {
            return false;
        }

        // Limit by any dependent raster sources
        for (let r=0; r < this.rasters.length; r++) {
            const source_name = this.rasters[r];
            if (this.sources[source_name] &&
                this.sources[source_name] !== this &&
                !this.sources[source_name].includesTile(coords, coords.z)) {
                return false;
            }
        }

        return true;
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

let network_request_id = 0; // used to namespace URL requests

export class NetworkSource extends DataSource {

    constructor (source, sources) {
        super(source, sources);
        this.response_type = ""; // use to set explicit XHR type

        // Add extra URL params, and warn on duplicates
        let [url, dupes] = URLs.addParamsToURL(source.url, source.url_params);
        this.url = url;
        dupes.forEach(([param, value]) => {
            log({ level: 'warn', once: true },
                `Data source '${this.name}': parameter '${param}' already present in URL '${source.url}', ` +
                `skipping value '${param}=${value}' specified in 'url_params'`);
        });

        if (typeof this.url !== 'string') {
            throw Error('Network data source must provide a string `url` property');
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

            let request_id = (network_request_id++) + '-' + url;
            let promise = Utils.io(url, 60 * 1000, this.response_type, 'GET', {}, request_id);
            source_data.request_id = request_id;

            promise.then((body) => {
                dest.debug.response_size = body.length || body.byteLength;
                dest.debug.network = +new Date() - dest.debug.network;
                dest.debug.parsing = +new Date();
                this.parseSourceData(dest, source_data, body);
                dest.debug.parsing = +new Date() - dest.debug.parsing;
                resolve(dest);
            }).catch((error) => {
                source_data.error = error.stack;
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

    constructor (source, sources) {
        super(source, sources);

        this.tiled = true;
        this.parseBounds(source);

        // indicates if source should build geometry tiles, enabled for sources referenced in the scene's layers,
        // and left disabled for sources that are never referenced, or only used as raster textures
        this.builds_geometry_tiles = false;

        this.tms = (source.tms === true); // optionally flip tile coords for TMS

        // optional list of subdomains to round-robin through
        if (this.url.search('{s}') > -1) {
            if (Array.isArray(source.url_subdomains) && source.url_subdomains.length > 0) {
                this.url_subdomains = source.url_subdomains;
                this.next_url_subdomain = 0;
            }
            else {
                log({ level: 'warn', once: true },
                    `Data source '${this.name}': source URL includes '\{s\}' subdomain marker ('${this.url}'), but no subdomains ` +
                    `were specified in 'url_subdomains' parameter`);
            }
        }
    }

    // Get bounds from source config parameters
    parseBounds (source) {
        if (Array.isArray(source.bounds) && source.bounds.length === 4) {
            this.bounds = source.bounds;
            let [w, s, e, n] = this.bounds;
            this.bounds_meters = {
                min: Geo.latLngToMeters([w, n]),
                max: Geo.latLngToMeters([e, s]),
            };
            this.bounds_tiles = { min: {}, max: {} }; // max tile bounds per zoom (lazily evaluated)
        }
    }

    // Returns false if tile is outside data source's bounds, true if within
    checkBounds (coords) {
        // Check tile bounds
        if (this.bounds) {
            coords = Geo.wrapTile(coords, { x: true });

            let min = this.bounds_tiles.min[coords.z];
            if (!min) {
                min = this.bounds_tiles.min[coords.z] = Geo.tileForMeters(this.bounds_meters.min, coords.z);
            }

            let max = this.bounds_tiles.max[coords.z];
            if (!max) {
                max = this.bounds_tiles.max[coords.z] = Geo.tileForMeters(this.bounds_meters.max, coords.z);
            }

            if (coords.x < min.x || coords.x > max.x ||
                coords.y < min.y || coords.y > max.y) {
                return false;
            }
        }
        return true;
    }

    includesTile (coords, style_zoom) {
        if (!super.includesTile(coords, style_zoom)) {
            return false;
        }

        // Check tile bounds
        if (!this.checkBounds(coords)) {
            return false;
        }
        return true;
    }

    formatUrl(url_template, tile) {
        let coords = Geo.wrapTile(tile.coords, { x: true });

        if (this.tms) {
            coords.y = Math.pow(2, coords.z) - 1 - coords.y; // optionally flip tile coords for TMS
        }

        let url = url_template.replace('{x}', coords.x).replace('{y}', coords.y).replace('{z}', coords.z);

        if (this.url_subdomains != null) {
            url = url.replace('{s}', this.url_subdomains[this.next_url_subdomain]);
            this.next_url_subdomain = (this.next_url_subdomain + 1) % this.url_subdomains.length;
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
