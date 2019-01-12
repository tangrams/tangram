import DataSource, {NetworkTileSource} from './data_source';
import {TileID} from '../tile_id';
import Geo from '../geo';
import log from '../utils/log';

export class RasterTileSource extends NetworkTileSource {

    constructor(source, sources) {
        super(source, sources);

        if (this.rasters.indexOf(this.name) === -1) {
            this.rasters.unshift(this.name); // add this raster as the first
        }
        this.filtering = source.filtering; // optional texture filtering (nearest, linear, mipmap)

        // save texture objects by tile key, so URL remains stable if tile is built multiple times,
        // e.g. avoid re-loading the same tile texture under a different subdomain when using tile hosts
        this.textures = {};
    }

    load(tile) {
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
        return Promise.resolve(tile);
    }

    // Return texture info for a raster tile
    tileTexture (tile) {
        let coords = this.adjustRasterTileZoom(tile);

        let key = coords.key;
        if (!this.textures[key]) {
            let url = this.formatUrl(this.url, { coords });
            this.textures[key] = { url, filtering: this.filtering, coords };
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

DataSource.register(RasterTileSource, 'Raster');
