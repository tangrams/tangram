import Label from './label';
import PointAnchor from './point_anchor';
import Geo from '../geo';
import OBB from '../utils/obb';
import StyleParser from '../styles/style_parser';

export default class LabelPoint extends Label {

    constructor (position, size, layout) {
        super(size, layout);
        this.type = 'point';
        this.position = [position[0], position[1]];
        this.parent = this.layout.parent;
        this.update();

        this.start_anchor_index = 1;
        this.degenerate = !this.size[0] && !this.size[1] && !this.layout.buffer[0] && !this.layout.buffer[1];
        this.throw_away = !this.getNextFit();
    }

    update() {
        super.update();
        this.computeOffset();
        this.updateBBoxes();
    }

    computeOffset () {
        this.offset = [this.layout.offset[0], this.layout.offset[1]];

        // Additional anchor/offset for point:
        if (this.parent) {
            let parent = this.parent;
            // point's own anchor, text anchor applied to point, additional point offset
            this.offset = PointAnchor.computeOffset(this.offset, parent.size, parent.anchor, PointAnchor.zero_buffer);
            this.offset = PointAnchor.computeOffset(this.offset, parent.size, this.anchor, PointAnchor.zero_buffer);
            if (parent.offset !== StyleParser.zeroPair) {        // point has an offset
                if (this.offset === StyleParser.zeroPair) {      // no text offset, use point's
                    this.offset = parent.offset;
                }
                else {                                           // text has offset, add point's
                    this.offset[0] += parent.offset[0];
                    this.offset[1] += parent.offset[1];
                }
            }
        }

        this.offset = PointAnchor.computeOffset(this.offset, this.size, this.anchor);
    }

    updateBBoxes () {
        let width = (this.size[0] + this.layout.buffer[0] * 2) * this.layout.units_per_pixel * Label.epsilon;
        let height = (this.size[1] + this.layout.buffer[1] * 2) * this.layout.units_per_pixel * Label.epsilon;

        // fudge width value as text may overflow bounding box if it has italic, bold, etc style
        if (this.layout.italic){
            width += 5 * this.layout.units_per_pixel;
        }

        let p = [
            this.position[0] + (this.offset[0] * this.layout.units_per_pixel),
            this.position[1] - (this.offset[1] * this.layout.units_per_pixel)
        ];

        this.obb = new OBB(p[0], p[1], 0, width, height);
        this.aabb = this.obb.getExtent();
    }

    // Try to move the label into the tile bounds
    // Returns true if label was moved into tile, false if it couldn't be moved
    moveIntoTile () {
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
            this.updateBBoxes();
        }

        return updated;
    }

    getNextFit() {
        return true;

        // if (!this.layout.cull_from_tile || this.inTileBounds()) {
        //     return true;
        // }

        // if (this.layout.move_into_tile){
        //     this.moveIntoTile();
        //     return true;
        // }
        // else {
        //     if (Array.isArray(this.layout.anchor)) {
        //         // Start on second anchor (first anchor was set on creation)
        //         for (let i = 1; i < this.layout.anchor.length; i++) {
        //             this.anchor = this.layout.anchor[i];
        //             this.update();

        //             this.start_anchor_index = i;

        //             if (this.inTileBounds()) {
        //                 return true;
        //             }
        //         }
        //     }

        //     // no anchors result in fit
        //     return false;
        // }
    }

    discard (bboxes, exclude = null) {
        if (this.degenerate) {
            return false;
        }

        if (super.discard(bboxes, exclude)) {
            // If more than one anchor specified, try them in order
            if (Array.isArray(this.layout.anchor)) {
                // Start on second anchor (first anchor was set on creation)
                for (let i=this.start_anchor_index; i < this.layout.anchor.length; i++) {
                    this.anchor = this.layout.anchor[i];
                    this.update();

                    // if (this.layout.cull_from_tile && !this.inTileBounds()) {
                    //     continue;
                    // }

                    if (!super.discard(bboxes, exclude)) {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }

}

// Placement strategies
LabelPoint.PLACEMENT = {
    VERTEX: 0,          // place labels at endpoints of line segments
    MIDPOINT: 1,        // place labels at midpoints of line segments
    SPACED: 2,          // place labels equally spaced along line
    CENTROID: 3         // place labels at center of polygons
};
