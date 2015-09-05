import Label from './label';
import Geo from '../../geo';
import OBB from '../../utils/obb';

// Sets of values to match for cardinal placements
const wests = ['W', 'NW', 'SW'];
const easts = ['E', 'NE', 'SE'];
const norths = ['N', 'NW', 'NE'];
const souths = ['S', 'SW', 'SE'];

export default class LabelPoint extends Label {

    constructor (text, position, size, options) {
        super(text, size, options);
        this.position = position;
        this.update();
    }

    update() {
        this.options.offset = this.computeOffset();
        this.aabb = this.computeAABB();
    }

    computeOffset () {
        if (!this.options.placement) {
            return this.options.offset;
        }

        let offset = [this.options.offset[0], this.options.offset[1]];
        let p = this.options.placement;

        // An optional west/east offset
        if (wests.indexOf(p) > -1) {
            offset[0] -= this.size.text_size[0] / 2;
        }
        else if (easts.indexOf(p) > -1) {
            offset[0] += this.size.text_size[0] / 2;
        }

        // An optional north/south offset
        if (norths.indexOf(p) > -1) {
            offset[1] -= this.size.text_size[1] / 2;
        }
        else if (souths.indexOf(p) > -1) {
            offset[1] += this.size.text_size[1] / 2;
        }

        return offset;
    }

    computeAABB () {
        let width = (this.size.text_size[0] + this.options.buffer[0] * 2) * this.options.units_per_pixel;
        let height = (this.size.text_size[1] + this.options.buffer[1] * 2) * this.options.units_per_pixel;

        let p = [
            this.position[0] + (this.options.offset[0] * this.options.units_per_pixel),
            this.position[1] - (this.options.offset[1] * this.options.units_per_pixel)
        ];

        let obb = new OBB(p[0], p[1], 0, width, height);
        let aabb = obb.getExtent();
        aabb.obb = obb;

        return aabb;
    }

    moveInTile () {
        let updated = false;

        if (this.aabb[0] < 0) {
            this.position[0] += -this.aabb[0];
            updated = true;
        }

        if (this.aabb[2] >= Geo.tile_scale) {
            this.position[0] -= this.aabb[2] - Geo.tile_scale + 1;
            updated = true;
        }

        if (this.aabb[3] > 0) {
            this.position[1] -= this.aabb[3];
            updated = true;
        }

        if (this.aabb[1] <= -Geo.tile_scale) {
            this.position[1] -= this.aabb[1] + Geo.tile_scale - 1;
            updated = true;
        }

        if (updated) {
            this.aabb = this.computeAABB();
        }

        return !this.inTileBounds();
    }

}
