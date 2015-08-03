/*global Label */

import boxIntersect from 'box-intersect';
import Utils from '../../utils/utils';
import Geo from '../../geo';
import OBB from '../../utils/obb';

export default class Label {
    constructor (text, size, { move_in_tile, keep_in_tile }) {
        Object.assign(this, {
            text,
            size,
            position: [],
            aabb: [],
            move_in_tile,
            keep_in_tile
        });

        this.id = Label.id++;
        this.buffer = this.buffer || 2; // TODO: make configurable
        this.buffer *= Geo.units_per_pixel;
    }

    isComposite () {
        return false;
    }

    occluded (aabbs) {
        let intersect = false;
        let aabb = this.aabb;

        // Broadphase
        if (aabbs.length > 1) {
            boxIntersect([this.aabb], aabbs, (i, j) => {
                // TODO: find a better way to get the obb from aabb

                // Narrow phase
                if (OBB.intersect(aabb.obb, aabbs[j].obb)) {
                    intersect = true;
                    return true;
                }
            });
        }

        // No collision on aabb
        if (!intersect) {
            aabbs.push(this.aabb);
        }

        return intersect;
    }

    inTileBounds () {
        let min = [ this.aabb[0], this.aabb[1] ];
        let max = [ this.aabb[2], this.aabb[3] ];

        if (!Utils.pointInTile(min) || !Utils.pointInTile(max)) {
            return false;
        }

        return true;
    }

    discard (aabbs) {
        let discard = false;

        // perform specific styling rule, should we keep the label in tile bounds?
        if (this.keep_in_tile) {
            let in_tile = this.inTileBounds();

            if (!in_tile && this.move_in_tile) {
                // can we move?
                discard = this.moveInTile();
            } else if (!in_tile) {
                // we didn't want to move at all,
                // just discard since we're out of tile bounds
                return true;
            }
        }

        // should we discard? if not, just make occlusion test
        return discard || this.occluded(aabbs);
    }
}

Label.id = 0;

