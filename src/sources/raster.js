import DataSource, {NetworkTileSource} from './data_source';
import Tile from '../tile';
import Geo from '../geo';

export class RasterTileSource extends NetworkTileSource {

    constructor(source) {
        super(source);

        this.filtering = source.filtering; // optional texture filtering (nearest, linear, mipmap)

        // save texture objects by tile key, so URL remains stable if tile is built multiple times,
        // e.g. avoid re-loading the same tile texture under a different subdomain when using tile hosts
        this.textures = {};
    }

    load(tile) {
        tile.source_data = {};
        tile.source_data.layers = {};
        tile.pad_scale = this.pad_scale;

        // Set texture info for this tile
        tile.texture = this.tileTexture(tile);

        // Generate a single quad that fills the entire tile
        tile.source_data.layers = {
            _default: {
                type: 'FeatureCollection',
                features: [{
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[
                            [0, 0], [Geo.tile_scale, 0],
                            [Geo.tile_scale, -Geo.tile_scale], [0, -Geo.tile_scale], [0, 0]
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
        let key = tile.coord_key;
        if (!this.textures[key]) {
            let coords = Tile.overZoomedCoordinate(tile.coords, this.max_zoom);
            let url = this.formatUrl(this.url, { coords });
            this.textures[key] = { url, filtering: this.filtering };
        }
        return this.textures[key];
    }

}

DataSource.register(RasterTileSource, 'Raster');
