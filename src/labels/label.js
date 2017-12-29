import PointAnchor from './point_anchor';
import {boxIntersectsList} from './intersect';
import OBB from '../utils/obb';
// import log from '../utils/log';

export default class Label {

    constructor (size, layout = {}) {
        this.id = Label.nextLabelId();
        this.type = ''; // set by subclass
        this.size = size;
        this.layout = layout;
        this.position = null;
        this.anchor = Array.isArray(this.layout.anchor) ? this.layout.anchor[0] : this.layout.anchor; // initial anchor
        this.placed = null;
        this.offset = layout.offset;
        this.unit_scale = this.layout.units_per_pixel;
        this.aabb = null;
        this.obb = null;
        this.align = 'center';
        this.throw_away = false;    // if label does not fit (exceeds tile boundary, etc) this boolean will be true
    }

    // Minimal representation of label
    toJSON () {
        return {
            id: this.id,
            type: this.type,
            obb: this.obb.toJSON(),
            position: this.position,
            size: this.size,
            offset: this.offset,
            layout: textLayoutToJSON(this.layout)
        };
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

    // Whether the label should be discarded
    // Depends on whether label must fit in the tile bounds, and if so, can it be moved to fit there
    discard(bboxes, exclude = null) {
        if (this.throw_away) {
            return true;
        }
        return this.occluded(bboxes, exclude);
    }
}

// Generic label placement function, adds a label's bounding boxes to the currently placed set
//  Supports single or multiple collision boxes
Label.add = function (label, bboxes) {
    label.placed = true;

    if (label.aabb) {
        bboxes.aabb.push(label.aabb);
        bboxes.obb.push(label.obb);
    }

    if (label.aabbs) {
        for (let i = 0; i < label.aabbs.length; i++) {
            bboxes.aabb.push(label.aabbs[i]);
            bboxes.obb.push(label.obbs[i]);
        }
    }
};

Label.id = 0;
Label.id_prefix = ''; // id prefix scoped to worker thread

Label.nextLabelId = function () {
    return Label.id_prefix + '/' + (Label.id++);
};

Label.epsilon = 0.9999; // tolerance around collision boxes, prevent perfectly adjacent objects from colliding

// Minimal representation of text layout, sent to main thread for label collisions
export function textLayoutToJSON (layout) {
    return {
        priority: layout.priority,
        collide: layout.collide,
        repeat_distance: layout.repeat_distance,
        repeat_group: layout.repeat_group,
        buffer: layout.buffer,
        italic: layout.italic // affects bounding box size
    };
}
