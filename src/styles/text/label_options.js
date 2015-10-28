export default class LabelOptions {

    constructor ({ units_per_pixel, offset, anchor, line_exceed, move_in_tile, keep_in_tile, buffer } = {}) {
        this.buffer = buffer || [0, 0];
        this.keep_in_tile = (keep_in_tile != null) ? keep_in_tile : true;
        this.move_in_tile = (move_in_tile != null) ? move_in_tile : true;
        this.offset = offset || [0, 0];
        this.anchor = anchor;
        this.line_exceed = (line_exceed != null) ? line_exceed : 80;
        this.units_per_pixel = units_per_pixel || 1;
    }

}
