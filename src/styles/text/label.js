/*global Label */

import boxIntersect from 'box-intersect'; // https://github.com/mikolalysenko/box-intersect
import Utils from '../../utils/utils';
import OBB from '../../utils/obb';

export default class Label {

    constructor (text, size, options) {
        Object.assign(this, {
            text,
            size,
            options,
            position: null,
            aabb: null,
        });
    }

    // check for overlaps with other labels in the tile
    occluded (aabbs) {
        let intersect = false;

        // Broadphase
        if (aabbs.length > 0) {
            boxIntersect([this.aabb], aabbs, (i, j) => {
                // Narrow phase
                if (OBB.intersect(this.aabb.obb, aabbs[j].obb)) {
                    intersect = true;
                    return true;
                }
            });
        }

        // No collision on aabb
        if (!intersect) {
            // it's clean, add it to the list of bboxes
            aabbs.push(this.aabb);
        }
        return intersect;
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
    discard (aabbs) {
        let discard = false;

        // Should the label be culled if it can't fit inside the tile bounds?
        if (this.options.cull_from_tile) {
            let in_tile = this.inTileBounds();

            // If it doesn't fit, should we try to move it into the tile bounds?
            if (!in_tile && this.options.move_into_tile) {
                // Were we able to fit it in the tile?
                discard = this.moveIntoTile();
            } else if (!in_tile) {
                // discard since we're out of tile bounds
                return true;
            }
        }

        // should we discard? if not, just make occlusion test
        return discard || this.occluded(aabbs);
    }
}
