import Label from './label';
import PointAnchor from './point_anchor';
import OBB from '../utils/obb';
import {StyleParser} from '../styles/style_parser';

export default class LabelPoint extends Label {

    constructor (position, size, layout) {
        super(size, layout);
        this.position = [position[0], position[1]];
        this.parent = this.layout.parent;
        this.update();

        if (this.layout.anchor) {
            this.start_anchor_index = 1;
        }

        let hasNext = this.getNextFit();
        this.throw_away = !hasNext;
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

        let p = [
            this.position[0] + (this.offset[0] * this.layout.units_per_pixel),
            this.position[1] - (this.offset[1] * this.layout.units_per_pixel)
        ];

        this.obb = new OBB(p[0], p[1], 0, width, height);
        this.aabb = this.obb.getExtent();
    }

    getNextFit() {
        if (!this.layout.cull_from_tile || this.inTileBounds()) {
            return true;
        }

        if (Array.isArray(this.layout.anchor)) {
            // Start on second anchor (first anchor was set on creation)
            for (let i = 1; i < this.layout.anchor.length; i++) {
                this.anchor = this.layout.anchor[i];
                this.update();

                this.start_anchor_index = i;

                if (this.inTileBounds()) {
                    return true;
                }
            }
        }

        // no anchors result in fit
        return false;
    }

    discard (bboxes, exclude = null) {
        if (super.discard(bboxes, exclude)) {
            // If more than one anchor specified, try them in order
            if (Array.isArray(this.layout.anchor)) {
                // Start on second anchor (first anchor was set on creation)
                for (let i=this.start_anchor_index; i < this.layout.anchor.length; i++) {
                    this.anchor = this.layout.anchor[i];
                    this.update();

                    if (this.layout.cull_from_tile && !this.inTileBounds()) {
                        continue;
                    }

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
