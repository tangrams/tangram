/*global Label */

import boxIntersect from 'box-intersect';
import Utils from '../../utils/utils';
import Geo from '../../geo';
import OBB from '../../utils/obb';
import Vector from '../../vector';

export default class Label {

    constructor (text, size, options) {
        Object.assign(this, {
            text,
            size,
            options,
            position: null,
            aabb: null,
        });

        this.id = Label.id++;
    }

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

    // whether the label should be discarded
    // 1. try to keep the label in tile if the label (to avoid collision over tile for now)
    // 2. if 1. -> keep a minimal distance between the label
    // 3. if 2. -> perfom occlusion
    discard (aabbs) {
        let discard = false;

        // perform specific styling rule, should we keep the label in tile bounds?
        if (this.options.keep_in_tile) {
            let in_tile = this.inTileBounds();

            if (!in_tile && this.options.move_in_tile) {
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

