import boxIntersect from 'box-intersect'; // https://github.com/mikolalysenko/box-intersect
import Utils from '../../utils/utils';
import OBB from '../../utils/obb';

import log from 'loglevel';

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
                log.trace(`${this.text} broad phase collide`, this, this.aabb, aabbs[j]);

                // Narrow phase
                if (OBB.intersect(this.aabb.obb, aabbs[j].obb)) {
                    log.trace(`${this.text} narrow phase collide`, this, this.aabb.obb, aabbs[j].obb);
                    intersect = true;
                    return true;
                }
            });
        }
        return intersect;
    }

    // Add this label's bounding box to the provided set
    add (aabbs) {
        aabbs.push(this.aabb);
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
        return this.occluded(aabbs);
    }
}
