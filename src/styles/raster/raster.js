// Raster tile rendering style

import {StyleParser} from '../style_parser';
import {Polygons} from '../polygons/polygons';
import {RasterTileSource} from '../../sources/raster';

export let RasterStyle = Object.create(Polygons);

Object.assign(RasterStyle, {
    name: 'raster',
    super: Polygons,
    built_in: true,
    selection: false, // no feature selection by default

    init() {
        // Enable texture UVs since they're required for raster tiles
        this.texcoords = true;

        this.super.init.apply(this, arguments);

        // Enable raster texture and configure how it is applied
        this.defines.TANGRAM_RASTER_TEXTURE = true;
        if (this.apply == null || this.apply === 'color') { // default to applying as color
            this.defines.TANGRAM_RASTER_TEXTURE_COLOR = true;
        }
        else if (this.apply === 'normal') {
            this.defines.TANGRAM_RASTER_TEXTURE_NORMAL = true;
        }
        this.defines.TANGRAM_MODEL_POSITION_VARYING = true;
    },

    _preprocess (draw) {
        // Raster tiles default to white vertex color, as this color will tint the underlying texture
        draw.color = draw.color || StyleParser.defaults.color;
        return this.super._preprocess.apply(this, arguments);
    },

    endData (tile) {
        // Configure dedicated raster style texture
        if (tile.raster_tile_texture) {
            tile.rasters = tile.rasters || {};
            let name = tile.raster_tile_texture.url;
            tile.rasters[name] = {
                name,
                config: tile.raster_tile_texture,
                uniform_scope: 'raster_texture'
            };
        }

        return this.super.endData.call(this, tile);

    }

});
