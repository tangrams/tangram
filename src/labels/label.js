import boxIntersect from 'box-intersect'; // https://github.com/mikolalysenko/box-intersect
import Utils from '../utils/utils';
import OBB from '../utils/obb';
// import log from '../utils/log';

export default class Label {

    constructor (size, options = {}) {
        this.size = size;
        this.options = options;
        this.position = null;
        this.aabb = null;
        this.obb = null;
    }

    // check for overlaps with other labels in the tile
    occluded (bboxes) {
        let intersect = false;
        let aabbs = bboxes.aabb;
        let obbs = bboxes.obb;

        // Broad phase
        if (aabbs.length > 0) {
            boxIntersect([this.aabb], aabbs, (i, j) => {
                // log('trace', 'collision: broad phase collide', this.options.id, this, this.aabb, aabbs[j]);

                // Skip narrow phase collision if no rotation
                if (this.obb.angle === 0 && obbs[j].angle === 0) {
                    // log('trace', 'collision: skip narrow phase collide because neither is rotated', this.options.id, this, this.obb, obbs[j]);
                    intersect = true;
                    return true;
                }

                // Narrow phase
                if (OBB.intersect(this.obb, obbs[j])) {
                    // log('trace', 'collision: narrow phase collide', this.options.id, this, this.obb, obbs[j]);
                    intersect = true;
                    return true;
                }
            });
        }
        return intersect;
    }

    // Add this label's bounding box to the provided set
    add (bboxes) {
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
    discard (bboxes) {
        // Should the label be culled if it can't fit inside the tile bounds?
        if (this.options.cull_from_tile) {
            let in_tile = this.inTileBounds();

            // If it doesn't fit, should we try to move it into the tile bounds?
            if (!in_tile && this.options.move_into_tile) {
                // Can we fit the label into the tile?
                if (!this.moveIntoTile()) {
                    return true; // can't fit in tile, discard
                }
            } else if (!in_tile) {
                return true; // out of tile bounds, discard
            }
        }

        // If the label hasn't been discarded yet, check to see if it's occluded by other labels
        return this.occluded(bboxes);
    }
}

Label.epsilon = 0.9999; // tolerance around collision boxes, prevent perfectly adjacent objects from colliding
