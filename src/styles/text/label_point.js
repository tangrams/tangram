import Label from './label';
import Geo from '../../geo';
import OBB from '../../utils/obb';

// Sets of values to match for directional and corner anchors
const lefts = ['left', 'top-left', 'bottom-left'];
const rights = ['right', 'top-right', 'bottom-right'];
const tops = ['top', 'top-left', 'top-right'];
const bottoms = ['bottom', 'bottom-left', 'bottom-right'];

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
        if (!this.options.anchor || this.options.anchor === 'center') {
            return this.options.offset;
        }

        let offset = [this.options.offset[0], this.options.offset[1]];
        let anchor = this.options.anchor;

        // An optional left/right offset
        if (LabelPoint.isLeftAnchor(anchor)) {
            offset[0] -= this.size.text_size[0] / 2;
        }
        else if (LabelPoint.isRightAnchor(anchor)) {
            offset[0] += this.size.text_size[0] / 2;
        }

        // An optional top/bottom offset
        if (LabelPoint.isTopAnchor(anchor)) {
            offset[1] -= this.size.text_size[1] / 2;
        }
        else if (LabelPoint.isBottomAnchor(anchor)) {
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

    static isLeftAnchor (anchor) {
        return (lefts.indexOf(anchor) > -1);
    }

    static isRightAnchor (anchor) {
        return (rights.indexOf(anchor) > -1);
    }

    static isTopAnchor (anchor) {
        return (tops.indexOf(anchor) > -1);
    }

    static isBottomAnchor (anchor) {
        return (bottoms.indexOf(anchor) > -1);
    }

}
