/*global Label */

import Geo from '../../geo';
import boxIntersect from 'box-intersect';

export default class Label {
    constructor (text, size, move_in_tile, keep_in_tile, priority) {
        Object.assign(this, {
            text: "",
            position: [],
            size: [],
            bbox: [],
            priority: 0,
            move_in_tile: false,
            keep_in_tile: false
        });

        this.move_in_tile = move_in_tile;
        this.keep_in_tile = keep_in_tile;
        this.priority = priority;
        this.id = Label.id++;
        this.text = text;
        this.size = size;
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
            Label.bbox_labels[bboxes.length] = this;
            bboxes.push(this.bbox);
        }

        return intersect;
    }

    inTileBounds () {
        let min = [ this.bbox[0], this.bbox[1] ];
        let max = [ this.bbox[2], this.bbox[3] ];

        if (!this.pointInTile(min) || !this.pointInTile(max)) {
            return false;
        }

        return true;
    }

    pointInTile (point) {
        let tile_pixel_size = Geo.units_per_pixel * Geo.tile_size;

        return point[0] > 0 && point[1] > -tile_pixel_size && point[0] < tile_pixel_size && point[1] < 0;
    }

    mercatorLength () {
        return this.size[0] * Geo.units_per_pixel;
    }

    mercatorHeight () {
        return this.size[1] * Geo.units_per_pixel;
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
Label.bbox_labels = {}; // map bbox index to label object

