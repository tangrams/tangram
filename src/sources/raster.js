import DataSource, {NetworkTileSource} from './data_source';
import {TileID} from '../tile/tile_id';
import Geo from '../utils/geo';
import Texture from '../gl/texture';
import Utils from '../utils/utils';
import hashString from '../utils/hash';
import log from '../utils/log';

export class RasterTileSource extends NetworkTileSource {

    constructor (source, sources) {
        super(source, sources);

        if (this.rasters.indexOf(this.name) === -1) {
            this.rasters.unshift(this.name); // add this raster as the first
        }
        this.filtering = source.filtering; // optional texture filtering (nearest, linear, mipmap)

        // save texture objects by tile key, so URL remains stable if tile is built multiple times,
        // e.g. avoid re-loading the same tile texture under a different subdomain when using tile hosts
        this.textures = {};
    }

    async load (tile) {
        tile.source_data = {};
        tile.source_data.layers = {};
        tile.pad_scale = this.pad_scale;
        tile.rasters = [...this.rasters]; // copy list of rasters to load for tile

        // Generate a single quad that fills the entire tile
        let scale = Geo.tile_scale;
        tile.source_data.layers = {
            _default: {
                type: 'FeatureCollection',
                features: [{
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[
                            [0, 0], [scale, 0],
                            [scale, -scale], [0, -scale], [0, 0]
                        ]]
                    },
                    properties: {}
                }]
            }
        };

        tile.default_winding = 'CW';
        return tile;
    }

    // Return texture info for a raster tile
    async tileTexture (tile) {
        let coords = this.adjustRasterTileZoom(tile);
        let key = coords.key;
        // texture definitions are cached to avoid loading the same raster tile multiple times,
        // e.g. due to slightly different URLs when subdomain pattern is used (a.tile.com vs. b.tile.com)
        if (!this.textures[key]) {
            let url = this.formatURL(this.url, { coords });
            this.textures[key] = {
                name: url,
                url,
                filtering: this.filtering,
                coords
            };
        }
        return this.textures[key];
    }

    // If the raster is attached to another source, we need to compare their levels of zoom detail
    // to see if any adjustments are needed. Both the `tile_size` and `zoom_offset` data source params
    // cause the zoom level to be downsampled relative to the "base" zoom level of the map view.
    // The attaching source has already applied its own zoom downsampling. If this source has a lower
    // level of detail, we apply the remaining differential here.
    adjustRasterTileZoom (tile) {
        let coords = tile.coords;
        const tile_source = this.sources[tile.source];
        if (tile_source !== this) { // no-op if the raster source isn't being rendered as an attachment
            let zdiff = this.zoom_bias - tile_source.zoom_bias; // difference in zoom detail between the sources
            if (zdiff > 0) { // raster source is less detailed
                // do extra zoom adjustment and apply this raster source's max zoom
                coords = TileID.normalizedCoord(tile.coords, {
                    zoom_bias: zdiff,
                    max_zoom: this.max_zoom
                });
            }
            else {
                // raster source supports higher detail, but was downsampled to match (the downsampling already
                // happened upstream, when the attaching source calculated its own tile coordinate)
                if (zdiff < 0) {
                    log({ level: 'warn', once: true},
                        `Raster source '${this.name}' supports higher zoom detail than source '${tile_source.name}' ` +
                        `it's attached to. Downsampling this source ${-zdiff} extra zoom levels to match.`
                    );
                }

                // no extra zoom adjustment needed, but still need to apply this raster source's max zoom
                coords = TileID.coordWithMaxZoom(coords, this.max_zoom);
            }
        }
        return coords;
    }

}

// Data source for loading standalone, geo-referenced raster images
// The `bounds` parameter is used to position the raster image on the map
// Currently, only axis-aligned, rectangular North-up images are supported
// TODO: add support for arbitrarily rotated images and quadrangle control points
export class RasterSource extends RasterTileSource {

    constructor (source, sources) {
        super(source, sources);

        this.load_image = {}; // resolves to image, cached for life of data source

        // alpha factor applied at time raster images are loaded and tiled (*not* at shader render-time)
        this.alpha = (source.alpha != null) ? Math.max(Math.min(source.alpha, 1), 0) : null;

        // non-full-alpha pixels should be discarded (for rendering rasters w/opaque blend)
        this.mask_alpha = true;

        // don't retain tiles for this source from nearby zooms (to improve memory usage)
        this.preserve_tiles_within_zoom = 0;

        // optionally set a max pixel density used for generated raster tiles (to improve memory usage)
        this.max_display_density = source.max_display_density;

        // Optionally composite multiple images into one raster layer
        if (Array.isArray(source.composite)) {
            // TODO: calculate enclosing bounding box to speed tile intersection checks
            this.images = source.composite.map(s => {
                return {
                    url: s.url,
                    bounds: this.parseBounds(s),
                    alpha: (s.alpha != null) ? Math.max(Math.min(s.alpha, 1), 0) : null
                };
            });
        }
        // Single image raster layer
        else {
            this.images = [{
                url: this.url,
                bounds: this.bounds,
                alpha: this.alpha
            }];
        }
    }

    // Render the sub-rectangle of the source raster image for the given tile, to a texture.
    // Clipping the source image to individual raster tiles naturally partitions images
    // (which may be large or only have a small portion in current view), and maintains
    // consistency with the raster tile pipeline allowing for sampling within the fragment shader,
    // and clipping the raster against vector source data.
    async tileTexture (tile, { blend, generation }) {
        let coords = this.adjustRasterTileZoom(tile);
        const use_alpha = (blend !== 'opaque'); // ignore source alpha multiplier with opaque blending
        const name = `raster-${this.name}-${coords.key}-${use_alpha ? 'alpha' : 'opaque'}-${generation}`; // unique texture name

        // only render each raster tile once (per scene generation)
        if (Texture.textures[name]) {
            return {
                name,
                coords,

                // tell style to skip re-creating this texture
                // we have an explicit flag for this because element-based (e.g. canvas) textures
                // are usually considered dynamic and always re-created when a new tile needs them
                // (because the user could have updated the canvas pixel contents outside of Tangram)
                skip_create: true
            };
        }

        // Display density, with extra 2x for better intra-zoom scaling, because raster tiles
        // can be scaled up to 100% before next zoom level is loaded
        let dpr = Utils.device_pixel_ratio;
        if (this.max_display_density) {
            dpr = Math.min(dpr, this.max_display_density); // optionally cap pixel density
        }
        dpr *= 2;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.tile_size * dpr; // adjusted for display density
        canvas.height = this.tile_size * dpr;

        // Applies nearest neighbor filtering to the canvas image rendering when data source requests it
        // NB: does not work on IE11 (image will be blurry when scaled)
        ctx.imageSmoothingEnabled = (this.filtering !== 'nearest');

        // Draw one or more images
        const images = this.images.filter(r => this.checkBounds(tile.coords, r.bounds));
        await Promise.all(images.map(i => {
            // TODO: log warning if alpha specified but will be ignored (in opaque mode)?
            const alpha = (use_alpha ? (i.alpha != null ? i.alpha : this.alpha) : 1);
            return this.drawImage(i.url, i.bounds, alpha, tile, dpr, ctx);
        }));

        // texture config
        return {
            name,
            element: canvas,
            filtering: this.filtering,
            coords
        };
    }

    // Draw a single image to the tile canvas based on on its bounds
    async drawImage (url, bounds, alpha, tile, dpr, ctx) {
        // Get source raster image
        const key = hashString(url); // use hash of URL for shorter keys
        this.load_image[key] = this.load_image[key] || this.loadImage(url);
        const image = await this.load_image[key];

        // Meters per pixel for this zoom, adjusted for display density and source tile size (e.g. 512px tiles)
        const mpp = Geo.metersPerPixel(tile.coords.z) / dpr / (this.tile_size / Geo.tile_size);

        // Raster origin relative to tile origin (get delta in meters, then convert to pixels)
        const dx = (bounds.meters.min[0] - tile.min.x) / mpp;
        const dy = -(bounds.meters.min[1] - tile.min.y) / mpp;

        // Raster size in pixels for current zoom
        const sx = (bounds.meters.max[0] - bounds.meters.min[0]) / mpp;
        const sy = -(bounds.meters.max[1] - bounds.meters.min[1]) / mpp;

        // Draw the raster, clipped to the current tile
        // NB: this is drawing the *whole* raster, no matter how large, and relying on the native Canvas clipping.
        // May want to benchmark with a pre-clipped draw area, though the native implementation is likely fast,
        // and has to apply its own clipping check anyway.
        ctx.globalAlpha = (alpha != null) ? alpha : 1;
        ctx.drawImage(image, dx, dy, sx, sy);
    }

    // Load source raster image
    loadImage (url) {
        return new Promise(resolve => {
            let image = new Image();
            image.onload = () => resolve(image);
            image.onerror = e => {
                // Warn and resolve on error
                log('warn', `Raster source '${this.name}': failed to load url: '${url}'`, e);
                resolve(null);
            };

            // Safari has a bug loading data-URL images with CORS enabled, so it must be disabled in that case
            // https://bugs.webkit.org/show_bug.cgi?id=123978
            if (!(Utils.isSafari() && url.slice(0, 5) === 'data:')) {
                image.crossOrigin = 'anonymous';
            }

            image.src = url;
        });
    }

    // Checks if tile interects any rasters in this source
    includesTile (coords, style_z) {
        // Checks zoom range and dependent rasters
        if (!DataSource.prototype.includesTile.call(this, coords, style_z)) {
            return false;
        }

        return this.images.some(r => this.checkBounds(coords, r.bounds)); // check if any images intersect
    }

    validate (source) {
        const is_composite = Array.isArray(source.composite);

        let url_msg = 'Raster data source must provide a string `url` parameter, or an array of `composite` raster ';
        url_msg += 'image objects that each have a `url` parameter';

        let bounds_msg = 'Raster data source must provide a `bounds` parameter, or an array of `composite` raster ';
        bounds_msg += 'image objects that each have a `bounds` parameter';

        let mutex_msg = 'Raster data source must have *either* a single image specified as `url` and `bounds `';
        mutex_msg += 'parameters, or an array of `composite` raster image objects, each with `url` and `bounds`.';

        if (is_composite) {
            if (source.composite.some(s => typeof s.url !== 'string')) {
                throw Error(url_msg);
            }

            if (source.composite.some(s => !(Array.isArray(s.bounds) && s.bounds.length === 4))) {
                throw Error(bounds_msg);
            }

            if (source.url != null || source.bounds != null) {
                throw Error(mutex_msg);
            }
        }
        else {
            if (typeof source.url !== 'string') {
                throw Error(url_msg);
            }

            if (!(Array.isArray(source.bounds) && source.bounds.length === 4)) {
                throw Error(bounds_msg);
            }
        }
    }

}

// Check for URL tile pattern, if not found, treat as geo-referenced raster layer
DataSource.register('Raster', source => {
    return RasterTileSource.urlHasTilePattern(source.url) ? RasterTileSource : RasterSource;
});
