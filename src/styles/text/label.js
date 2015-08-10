/*global Label */

import boxIntersect from 'box-intersect';
import Utils from '../../utils/utils';
import Geo from '../../geo';
import OBB from '../../utils/obb';
import Vector from '../../vector';

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
        this.keep_min_distance = true;
    }

    isComposite () {
        return false;
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

    // keep a minimal distance between the labels
    checkMinDistance (aabbs) {
        let obb1 = this.aabb.obb;
        let w1 = Math.abs(obb1.quad[1][0] - obb1.quad[0][0]);

        for (let i = 0; i < aabbs.length; ++i) {
            let aabb = aabbs[i];
            let obb0 = aabb.obb;

            let dHalf = Vector.length(Vector.mult(Vector.sub(obb0.centroid, obb1.centroid), 0.5));
            let w0 = Math.abs(obb0.quad[1][0] - obb0.quad[0][0]);

            // skip obbs with half distance less than an obb width
            if (dHalf > w0 + this.buffer && dHalf > w1 + this.buffer) {
                continue;
            }

            for (let j = 0; j < obb0.quad.length; ++j) {
                let v0 = obb0.quad[j];
                for (let k = 0; k < obb1.quad.length; ++k) {
                    let v1 = obb1.quad[k];
                    let d = Vector.length(Vector.sub(v0, v1));

                    if (d < this.buffer) {
                        return true;
                    }
                }
            }
        }

        return false;
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

        if (this.keep_min_distance) {
            discard |= this.checkMinDistance(aabbs);
        }

        // should we discard? if not, just make occlusion test
        return discard || this.occluded(aabbs);
    }
}

Label.id = 0;

