/*jshint worker: true */
import Geo from '../utils/geo';
import {MethodNotImplemented} from '../utils/errors';
import Utils from '../utils/utils';
import sliceObject from '../utils/slice';
import * as URLs from '../utils/urls';
import log from '../utils/log';

export default class DataSource {

    constructor (config, sources) {
        this.validate(config);

        this.config = config; // save original config
        this.sources = sources; // full set of data sources TODO: centralize these like textures?
        this.id = config.id;
        this.name = config.name;
        this.pad_scale = config.pad_scale || 0.00001; // scale tile up by small factor to cover seams
        this.default_winding = null; // winding order will adapt to data source
        this.rasters = []; // attached raster tile sources
        if (Array.isArray(config.rasters)) { // copy unique set of raster sources
            config.rasters.forEach(r => {
                if (this.rasters.indexOf(r) === -1) {
                    this.rasters.push(r);
                }
            });
        }

        // Optional setting to keep tiles within a zoom range (higher requires more memory)
        this.preserve_tiles_within_zoom = config.preserve_tiles_within_zoom;

        // Optional function to preprocess source data
        this.preprocess = config.preprocess;
        if (typeof this.preprocess === 'function') {
            this.preprocess.bind(this);
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

        // Configure zoom ranges at which new data will be loaded
        this.setZooms(config);

        // set a custom extra overzoom adjustment factor to load consistently lower zoom levels
        // than the current map zoom level – eg a zoom_offset of 1 would load z3 data at z4
        this.zoom_offset = (config.zoom_offset != null) ? config.zoom_offset : 0;
        if (this.zoom_offset < 0) {
            let msg = `Data source '${this.name}' zoom_offset must not be negative – setting to 0.`;
            log({ level: 'warn', once: true }, msg);
            this.zoom_offset = 0;
        }

        this.setTileSize(config.tile_size);

        // no tiles will be requested or displayed outside of these min/max values
        this.min_display_zoom = Math.max(config.min_display_zoom || 0, this.zooms[0]);
        this.max_display_zoom = (config.max_display_zoom != null) ? config.max_display_zoom : null;
    }

    // Register a new data source type name, providing a function that returns the class name
    // to instantiate based on the source definition in the scene
    static register (type_name, type_func) {
        if (!type_name || !type_func) {
            return;
        }

        DataSource.types[type_name] = type_func;
    }

    // Create a data source, factory-style
    static create (source, sources) {
        // Find the class to instantiate based on the source definition
        if (typeof DataSource.types[source.type] === 'function') {
            const source_class = DataSource.types[source.type](source);
            if (source_class) {
                return new source_class(source, sources);
            }
        }
    }

    // Check if a data source definition changed in a way that could affect which tiles are in view
    static tileLayoutChanged (source, prev_source) {
        if (!source || !prev_source) {
            return true;
        }

        // subset of parameters that affect tile layout
        const rebuild_params = [
            'max_zoom',
            'zooms',
            'min_display_zoom',
            'max_display_zoom',
            'bounds',
            'tile_size',
            'zoom_offset'
        ];
        const cur = sliceObject(source.config, rebuild_params);
        const prev = sliceObject(prev_source.config, rebuild_params);

        return JSON.stringify(cur) !== JSON.stringify(prev);
    }

    // Mercator projection
    static projectData (source) {
        var timer = +new Date();
        for (var t in source.layers) {
            var num_features = source.layers[t].features.length;
            for (var f=0; f < num_features; f++) {
                var feature = source.layers[t].features[f];
                Geo.transformGeometry(feature.geometry, this.projectCoord);
            }
        }

        if (source.debug !== undefined) {
            source.debug.projection = +new Date() - timer;
        }
    }

    static projectCoord (coord) {
        Geo.latLngToMeters(coord);
    }

    /**
     Re-scale geometries within each source to internal tile units
    */
    static scaleData (source, { coords: { z }, min }) {
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

    load (dest) {
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
    _load (/*dest*/) {
        throw new MethodNotImplemented('_load');
    }

    // Copy source data from another tile (so we can reuse source data for overzoomed tiles)
    copyTileData (source, dest) {
        log('trace', `Copy tile data from ${source.key} to ${dest.key}`);
        dest.source_data = { layers: source.source_data.layers };
        dest.rasters = [...source.rasters];
        dest.pad_scale = source.pad_scale;
        dest.default_winding = source.default_winding;
        return dest;
    }

    // Configure zoom ranges at which new data will be loaded
    // e.g. can be used to skip fetching data for some zooms, reusing data from next lowest available zoom instead
    setZooms ({ max_zoom, zooms }) {
        // overzoom will apply for zooms higher than this
        this.max_zoom = (max_zoom != null) ? max_zoom : Geo.default_source_max_zoom;
        if (Array.isArray(zooms)) {
            this.zooms = zooms; // TODO: support range parsing, e.g. [0-4, 6-7, 12]?
            this.max_zoom = this.zooms[this.zooms.length-1]; // overrides `max_zoom` when both are present
        }
        else {
            this.zooms = [];
            for (let i = 0; i <= this.max_zoom; i++) {
                this.zooms[i] = i;
            }
        }
    }

    // Set the internal tile size in pixels, e.g. '256px' (default), '512px', etc.
    // Must be a power of 2, and greater than or equal to 256
    setTileSize (tile_size) {
        this.tile_size = tile_size || 256;
        if (typeof this.tile_size !== 'number' || this.tile_size < 256 || !Utils.isPowerOf2(this.tile_size)) {
            log({ level: 'warn', once: true },
                `Data source '${this.name}': 'tile_size' parameter must be a number that is a power of 2 greater than or equal to 256, but was '${tile_size}'`);
            this.tile_size = 256;
        }

        // # of zoom levels bigger than 256px tiles - 8 in place of log2(256)
        // Many Tangram functions assume 256px tiles, this factor adjusts for the
        // case of bigger tile sizes - eg 512px tiles are 1 zoom level bigger,
        // 1024px tiles are 2 levels bigger
        this.zoom_bias = Math.log2(this.tile_size) - 8 + this.zoom_offset;
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
    includesTile (coords, style_z) {
        // Limit by this data source
        if (coords.z < this.min_display_zoom || (this.max_display_zoom != null && style_z > this.max_display_zoom)) {
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

    validate (/*source*/) {
    }

}

DataSource.types = {}; // set of supported data source classes, referenced by type name


/*** Generic network loading source - abstract class ***/

let network_request_id = 0; // used to namespace URL requests

export class NetworkSource extends DataSource {

    constructor (source, sources) {
        super(source, sources);
        this.response_type = ''; // use to set explicit XHR type

        // Add extra URL params, and warn on duplicates
        let [url, dupes] = URLs.addParamsToURL(source.url, source.url_params);
        this.url = url;
        dupes.forEach(([param, value]) => {
            log({ level: 'warn', once: true },
                `Data source '${this.name}': parameter '${param}' already present in URL '${source.url}', ` +
                `skipping value '${param}=${value}' specified in 'url_params'`);
        });

        // Optional HTTP request headers to send
        if (source.request_headers && typeof source.request_headers === 'object') {
            this.request_headers = source.request_headers;
        }
    }

    _load (dest) {
        let url = this.formatURL(this.url, dest);

        let source_data = dest.source_data;
        source_data.url = url;
        dest.debug = dest.debug || {};
        dest.debug.network = +new Date();

        return new Promise(resolve => {
            let request_id = (network_request_id++) + '-' + url;
            let promise = Utils.io(url, 60 * 1000, this.response_type, 'GET', this.request_headers, request_id);

            source_data.request_id = request_id;
            source_data.error = null;

            promise.then(({ body }) => {
                dest.debug.response_size = body && (body.length || body.byteLength);
                dest.debug.network = +new Date() - dest.debug.network;
                dest.debug.parsing = +new Date();

                // Apply optional data transform on raw network response
                if (body != null && typeof this.preprocess === 'function') {
                    body = this.preprocess(body);
                }

                // Return data immediately, or after user-returned promise resolves
                body = (body instanceof Promise) ? body : Promise.resolve(body);
                body.then(body => {
                    if (body != null) {
                        this.parseSourceData(dest, source_data, body);
                    }
                    else {
                        source_data.layers = {}; // for cases where server returned no content (e.g. 204 response)
                    }
                    dest.debug.parsing = +new Date() - dest.debug.parsing;
                    resolve(dest);
                });
            }).catch((error) => {
                source_data.error = error.stack;
                resolve(dest); // resolve request but pass along error
            });
        });
    }

    validate (source) {
        if (typeof source.url !== 'string') {
            throw Error('Network data source must provide a string `url` property');
        }
    }

    // Sub-classes must implement:

    formatURL (/*url_template, dest*/) {
        throw new MethodNotImplemented('formatURL');
    }

    parseSourceData (/*dest, source, reponse*/) {
        throw new MethodNotImplemented('parseSourceData');
    }
}


/*** Generic network tile loading - abstract class ***/

export class NetworkTileSource extends NetworkSource {

    constructor (source, sources) {
        super(source, sources);

        this.tiled = true;
        this.bounds = this.parseBounds(source);

        // indicates if source should build geometry tiles, enabled for sources referenced in the scene's layers,
        // and left disabled for sources that are never referenced, or only used as raster textures
        this.builds_geometry_tiles = false;

        this.tms = (source.tms === true); // optionally flip tile coords for TMS

        // optional list of subdomains to round-robin through
        if (this.url && this.url.search('{s}') > -1) {
            if (Array.isArray(source.url_subdomains) && source.url_subdomains.length > 0) {
                this.url_subdomains = source.url_subdomains;
                this.next_url_subdomain = 0;
            }
            else {
                log({ level: 'warn', once: true },
                    `Data source '${this.name}': source URL includes '{s}' subdomain marker ('${this.url}'), but no subdomains ` +
                    'were specified in \'url_subdomains\' parameter');
            }
        }

        // optional list of pixel density scale modifiers
        if (this.url && this.url.search('{r}') > -1) {
            if (Array.isArray(source.url_density_scales) && source.url_density_scales.length > 0) {
                this.url_density_scales = source.url_density_scales;
            }
            else {
                this.url_density_scales = [1, 2]; // default to supporting 1x and 2x display densities
            }
        }
    }

    // Get bounds from source config parameters
    parseBounds (source) {
        if (Array.isArray(source.bounds) && source.bounds.length === 4) {
            const [w, s, e, n] = source.bounds;
            return {
                latlng: [...source.bounds],
                meters: {
                    min: Geo.latLngToMeters([w, n]),
                    max: Geo.latLngToMeters([e, s]),
                },
                tiles: { // max tile bounds per zoom (lazily evaluated)
                    min: {},
                    max: {}
                }
            };
        }
    }

    // Returns false if tile is outside data source's bounds, true if within
    checkBounds (coords, bounds) {
        // Check tile bounds
        if (bounds) {
            // get tile and bounds coords at current zoom, wrapping to keep x coords in positive range
            coords = Geo.wrapTile(coords);

            let min = bounds.tiles.min[coords.z];
            if (!min) {
                min = bounds.tiles.min[coords.z] = Geo.tileForMeters(bounds.meters.min, coords.z);
            }

            let max = bounds.tiles.max[coords.z];
            if (!max) {
                max = bounds.tiles.max[coords.z] = Geo.tileForMeters(bounds.meters.max, coords.z);
            }

            // check latitude
            if (coords.y < min.y || coords.y > max.y) {
                return false;
            }

            // longitude bounds are between meridians
            if (min.x <= max.x) {
                if (coords.x < min.x || coords.x > max.x) {
                    return false;
                }
            }
            // longitude bounds cross the antimeridian
            else if (coords.x > max.x && coords.x < min.x) {
                return false;
            }
        }
        return true;
    }

    includesTile (coords, style_z) {
        if (!super.includesTile(coords, style_z)) {
            return false;
        }

        // Check tile bounds
        if (!this.checkBounds(coords, this.bounds)) {
            return false;
        }
        return true;
    }

    formatURL (url_template, tile) {
        let coords = Geo.wrapTile(tile.coords, { x: true });

        if (this.tms) {
            coords.y = Math.pow(2, coords.z) - 1 - coords.y; // optionally flip tile coords for TMS
        }

        // tile URL template replacement
        let url = url_template
            .replace('{x}', coords.x)
            .replace('{y}', coords.y)
            .replace('{z}', coords.z)
            .replace('{r}', this.getDensityModifier()) // modify URL by display density (e.g. @2x)
            .replace('{q}', this.toQuadKey(coords)); // quadkey for tile coordinates

        if (this.url_subdomains != null) {
            url = url.replace('{s}', this.url_subdomains[this.next_url_subdomain]);
            this.next_url_subdomain = (this.next_url_subdomain + 1) % this.url_subdomains.length;
        }
        return url;
    }

    // Find the right tile URL modifier based on the display density, e.g. add `@2x` for sources supporting 2x tiles.
    // Source `url_density_scales` param can specify an array of densities supported by the source,
    // each entry serves as a threshold based on the current display density.
    getDensityModifier () {
        if (this.url_density_scales) {
            // find the highest matching density
            const dpr = Utils.device_pixel_ratio;
            let scale = this.url_density_scales
                .filter(s => dpr >= s)
                .reverse()[0];

            // default to first scale if none matched
            scale = (scale != null ? scale : this.url_density_scales[0]);

            // scales higher than 1x use the `@` modifier (e.g. `@2x`)
            if (scale > 1) {
                return `@${scale}x`;
            }
        }
        return ''; // for 1x (or less) displays, no URL modifier is used (following @2x URL convention)
    }

    toQuadKey ({ x, y, z }) {
        let quadkey = '';
        for (let i = z; i > 0; i--) {
            let b = 0;
            let mask = 1 << (i - 1);
            if ((x & mask) !== 0) b++;
            if ((y & mask) !== 0) b += 2;
            quadkey += b.toString();
        }
        return quadkey;
    }

    // Checks for the x/y/z tile pattern in URL template
    static urlHasTilePattern (url) {
        return url && (
            (url.search('{x}') > -1 && url.search('{y}') > -1 && url.search('{z}') > -1) ||
            url.search('{q}') > -1
        );
    }

}
