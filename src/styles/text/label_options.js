export default class LabelOptions {

    constructor ({ units_per_pixel, offset, anchor, line_exceed, move_into_tile, cull_from_tile, buffer } = {}) {
        this.buffer = buffer || [0, 0];
        this.cull_from_tile = (cull_from_tile != null) ? cull_from_tile : true;
        this.move_into_tile = (move_into_tile != null) ? move_into_tile : true;
        this.offset = offset || [0, 0];
        this.anchor = anchor;
        this.line_exceed = (line_exceed != null) ? line_exceed : 80;
        this.units_per_pixel = units_per_pixel || 1;
    }

}
