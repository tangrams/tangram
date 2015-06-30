/*global Label */

import boxIntersect from 'box-intersect'; // https://github.com/mikolalysenko/box-intersect
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

    // check for overlaps with other labels in the tile
    occluded (bboxes) {
        let intersect = false;

        if (bboxes.length > 0) {
            boxIntersect([this.bbox], bboxes, (i, j) => {
                intersect = true;
                // stop checking
                return true;
            });
        }

        if (!intersect) {
            // it's clean, add it to the list of bboxes
            bboxes.push(this.bbox);
        }
        return intersect;
    }

    inTileBounds () {
        let diff = this.bbox[1] - this.bbox[0] / 2;
        diff = 0;
        let min = [ this.bbox[0] - diff, this.bbox[1] + diff ];
        let max = [ this.bbox[2] - diff, this.bbox[3] + diff ];

        if (!Utils.pointInTile(min) || !Utils.pointInTile(max)) {
            return false;
        }

        return true;
    }

    // discard if the label crosses tile boundaries
    // called from text.js
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

