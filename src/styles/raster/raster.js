// Raster tile rendering style

import {StyleParser} from '../style_parser';
import {Polygons} from '../polygons/polygons';

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

        // Let style override which raster source is used for default sampling
        if (typeof this.raster_default === 'string') {
            this.defines.u_raster_texture = `u_raster_${this.raster_default}`;
            this.defines.u_raster_texture_size = `u_raster_${this.raster_default}_size`;
            this.defines.u_raster_texture_pixel_size = `u_raster_${this.raster_default}_pixel_size`;

            // Add default raster to set of rasters if not already present
            if (!this.rasters || this.rasters.indexOf(this.raster_default) === -1) {
                this.rasters = this.rasters || [];
                this.rasters.push(this.raster_default);
            }
        }
        else {
            this.defines.u_raster_texture = 'u_raster_texture_default';
            this.defines.u_raster_texture_size = 'u_raster_texture_default_size';
            this.defines.u_raster_texture_pixel_size = 'u_raster_texture_default_pixel_size';
        }

        // Use model position for raster tile texture UVs
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
                uniform_scope: 'raster_texture_default'
            };
        }

        return this.super.endData.call(this, tile);

    }

});
