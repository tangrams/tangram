import log from '../utils/log';
import DataSource, {NetworkTileSource} from './data_source';
import Tile from '../tile';
import Geo from '../geo';
import Utils from '../utils/utils';

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
        let coords = Tile.coordinateWithMaxZoom(tile.coords, this.max_zoom);
        let key = coords.key;
        if (!this.textures[key]) {
            let url = this.formatUrl(this.url, { coords });
            this.textures[key] = {
                name: url,
                url,
                filtering: this.filtering,
                coords
            };
        }
        return this.textures[key];
    }

}

// Data source for loading standalone, geo-referenced raster images
// The `bounds` parameter is used to position the raster image on the map
// Currently, only axis-aligned, rectangular North-up images are supported
// TODO: add support for arbitrarily rotated images and quadrangle control points
export class RasterSource extends RasterTileSource {

    constructor (source, sources) {
        super(source, sources);

        // TODO: require `bounds` param, log warning
        this.load_image = null; // resolves to image, cached for life of data source
        this.mask_alpha = true; // non-full-alpha pixels should be discarded (for rendering rasters w/opaque blend)
    }

    // Render the sub-rectangle of the source raster image for the given tile, to a texture.
    // Clipping the source image to individual raster tiles naturally partitions images
    // (which may be large or only have a small portion in current view), and maintains
    // consistency with the raster tile pipeline allowing for sampling within the fragment shader,
    // and clipping the raster against vector source data.
    async tileTexture (tile) {
        const coords = Tile.coordinateWithMaxZoom(tile.coords, this.max_zoom);
        const name = `raster-${this.name}-${coords.key}`; // unique texture name

        // Display density, with extra 2x for better intra-zoom scaling, because raster tiles
        // can be scaled up to 100% before next zoom level is loaded
        const dpr = Utils.device_pixel_ratio * 2;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.tile_size * dpr; // adjusted for display density
        canvas.height = this.tile_size * dpr;

        // Get source raster image
        this.load_image = this.load_image || this.loadImage(this.url);
        const image = await this.load_image;

        // Meters per pixel for this zoom, adjusted for display density and source tile size (e.g. 512px tiles)
        const mpp = Geo.metersPerPixel(tile.coords.z) / dpr / (this.tile_size / Geo.tile_size);

        // Raster origin relative to tile origin (get delta in meters, then convert to pixels)
        const dx = (this.bounds_meters.min[0] - tile.min.x) / mpp;
        const dy = -(this.bounds_meters.min[1] - tile.min.y) / mpp;

        // Raster size in pixels for current zoom
        const sx = (this.bounds_meters.max[0] - this.bounds_meters.min[0]) / mpp;
        const sy = -(this.bounds_meters.max[1] - this.bounds_meters.min[1]) / mpp;

        // Draw the raster, clipped to the current tile
        // NB: this is drawing the *whole* raster, no matter how large, and relying on the native Canvas clipping.
        // May want to benchmark with a pre-clipped draw area, though the native implementation is likely fast,
        // and has to apply its own clipping check anyway.
        ctx.drawImage(image, dx, dy, sx, sy);

        // TODO: can we use canvas filtering options in lieu of (in addition to) GL ones
        // otherwise 'nearest' filtering doesn't generate expected results

        // texture config
        return {
            name,
            element: canvas,
            filtering: this.filtering,
            coords,
            UNPACK_PREMULTIPLY_ALPHA_WEBGL: true
        };
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

}

// Check for URL tile pattern, if not found, treat as standalone GeoJSON/TopoJSON object
DataSource.register('Raster', source => {
    return RasterTileSource.urlHasTilePattern(source.url) ? RasterTileSource : RasterSource;
});
