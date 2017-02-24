import PointAnchor from './point_anchor';
import {boxIntersectsList} from './intersect';
import Utils from '../utils/utils';
import OBB from '../utils/obb';
// import log from '../utils/log';

export default class Label {

    constructor (size, layout = {}) {
        this.size = size;
        this.layout = layout;
        this.position = null;
        this.anchor = Array.isArray(this.layout.anchor) ? this.layout.anchor[0] : this.layout.anchor; // initial anchor
        this.placed = null;
        this.offset = layout.offset;
        this.aabb = null;
        this.obb = null;
        this.align = 'center';
        this.throw_away = false;    // if label does not fit (exceeds tile boundary, etc) this boolean will be true
    }

    update () {
        this.align = this.layout.align || PointAnchor.alignForAnchor(this.anchor);
    }

    // check for overlaps with other labels in the tile
    occluded (bboxes, exclude = null) {
        let intersect = false;
        let aabbs = bboxes.aabb;
        let obbs = bboxes.obb;

        // Broad phase
        if (aabbs.length > 0) {
            boxIntersectsList(this.aabb, aabbs, (j) => {
                // log('trace', 'collision: broad phase collide', this.layout.id, this, this.aabb, aabbs[j]);

                // Skip if colliding with excluded label
                if (exclude && aabbs[j] === exclude.aabb) {
                    // log('trace', 'collision: skipping due to explicit exclusion', this, exclude);
                    return;
                }

                // Skip narrow phase collision if no rotation
                if (this.obb.angle === 0 && obbs[j].angle === 0) {
                    // log('trace', 'collision: skip narrow phase collide because neither is rotated', this.layout.id, this, this.obb, obbs[j]);
                    intersect = true;
                    return true;
                }

                // Narrow phase
                if (OBB.intersect(this.obb, obbs[j])) {
                    // log('trace', 'collision: narrow phase collide', this.layout.id, this, this.obb, obbs[j]);
                    intersect = true;
                    return true;
                }
            });
        }
        return intersect;
    }

    // Add this label's bounding box to the provided set
    add (bboxes) {
        this.placed = true;
        bboxes.aabb.push(this.aabb);
        bboxes.obb.push(this.obb);
    }

    // checks whether the label is within the tile boundaries
    inTileBounds () {
        let min = [ this.aabb[0], this.aabb[1] ];
        let max = [ this.aabb[2], this.aabb[3] ];

        if (!Utils.pointInTile(min) || !Utils.pointInTile(max)) {
            return false;
        }

        return true;
    }

    // Whether the label should be discarded
    // Depends on whether label must fit in the tile bounds, and if so, can it be moved to fit there
    discard(bboxes, exclude = null) {
        if (this.throw_away) {
            return true;
        }
        return this.occluded(bboxes, exclude);
    }
}

Label.epsilon = 0.9999; // tolerance around collision boxes, prevent perfectly adjacent objects from colliding
