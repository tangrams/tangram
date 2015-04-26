/*global Label */

import boxIntersect from 'box-intersect';
import Utils from '../../utils/utils';
import Geo from '../../geo';

export default class Label {
    constructor (text, size, { move_in_tile, keep_in_tile }) {
        Object.assign(this, {
            text,
            size,
            position: [],
            bbox: [],
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

    occluded (bboxes) {
        let intersect = false;

        if (bboxes.length > 0) {
            boxIntersect([this.bbox], bboxes, (i, j) => {
                intersect = true;
                return true;
            });
        }

        if (!intersect) {
            bboxes.push(this.bbox);
        }

        return intersect;
    }

    inTileBounds () {
        let min = [ this.bbox[0], this.bbox[1] ];
        let max = [ this.bbox[2], this.bbox[3] ];

        if (!Utils.pointInTile(min) || !Utils.pointInTile(max)) {
            return false;
        }

        return true;
    }

    discard (bboxes) {
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
        return discard || this.occluded(bboxes);
    }
}

Label.id = 0;

