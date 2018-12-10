import DataSource, {NetworkTileSource} from './data_source';
import Tile from '../tile';
import Geo from '../geo';

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
        let new_coords = tile.coords;
        if (this.zoom_offset !== 0) {
            // account for any zoom_offset parameter on the raster datasource
            new_coords = Tile.coordinateAtZoom({x: tile.coords.x, y: tile.coords.y, z: tile.coords.z}, Math.max(tile.coords.z - this.zoom_offset, 0));
        }
        let key = new_coords.key;
        if (!this.textures[key]) {
            let coords = Tile.coordinateWithMaxZoom(new_coords, this.max_zoom);
            let url = this.formatUrl(this.url, { coords });
            this.textures[key] = { url, filtering: this.filtering, coords };
        }
        return this.textures[key];
    }

}

DataSource.register(RasterTileSource, 'Raster');
