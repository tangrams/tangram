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
        // Required for raster tiles
        this.raster = this.raster || 'color';

        this.super.init.apply(this, arguments);
    },

    _preprocess (draw) {
        // Raster tiles default to white vertex color, as this color will tint the underlying texture
        draw.color = draw.color || StyleParser.defaults.color;
        return this.super._preprocess.apply(this, arguments);
    }

});
