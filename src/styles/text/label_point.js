import Label from './label';
import Geo from '../../geo';
import OBB from '../../utils/obb';

export default class LabelPoint extends Label {

    constructor (text, position, size, options) {
        super(text, size, options);

        this.position = position;
        this.aabb = this.computeAABB();
    }

    computeAABB () {
        let width = this.size.text_size[0] * Geo.units_per_pixel;
        let height = this.size.text_size[1] * Geo.units_per_pixel;
        // apply offset, x positive, y pointing down
        let p = [this.position[0] + this.options.offset[0], this.position[1] - this.options.offset[1]];
        let obb = new OBB(p[0], p[1], 0.0, width + this.options.buffer, height + this.options.buffer);
        let aabb = obb.getExtent();
        aabb.obb = obb;

        return aabb;
    }

    moveInTile (in_tile) {
        let width = this.aabb[2] - this.aabb[0];
        let height = -this.aabb[3] - (-this.aabb[1]);

        // Move point labels to tile edges
        if (this.position[0] - width/2 < 0) {
            this.position[0] = width/2 + 1;
        }
        else if (this.position[0] + width/2 > Geo.tile_scale) {
            this.position[0] = Geo.tile_scale - (width/2 + 1);
        }

        this.position[1] *= -1; // just doing this so Y coord is positive
        if (this.position[1] - height/2 < 0) { // && this.position[1] > 0) {
            this.position[1] = height/2 + 1;
        }
        else if (this.position[1] + height/2 > Geo.tile_scale) {
            this.position[1] = Geo.tile_scale - (height/2 + 1);
        }
        this.position[1] *= -1;

        this.aabb = this.computeAABB();
        return !this.inTileBounds();
    }

}
