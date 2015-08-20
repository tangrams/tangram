import Geo from '../../geo';

export default class LabelOptions {

    constructor ({ offset, exceed, move_in_tile, keep_in_tile, buffer }) {
		Object.assign(this, {
            move_in_tile,
            keep_in_tile,
            offset,
            exceed,
            buffer
        });

        this.buffer = this.buffer || 2;
        this.buffer *= Geo.units_per_pixel;
        this.keep_in_tile = this.keep_in_tile || true;
        this.move_in_tile = this.move_in_tile || true;
        this.offset = this.offset || [0, 0];
        this.exceed = this.exceed || 30;
    }

}
