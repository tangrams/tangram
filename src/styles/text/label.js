import Geo from '../../geo';
import boxIntersect from 'box-intersect';
import {Vector} from '../../vector';

export default class Label {

    constructor (text, position, size, lines) {
        this.text = text;
        this.position = position;
        this.size = size;

        if (lines) {
            this.lines = lines;
            this.angle = this.angleForLine(this.lines[0]);
            this.bbox = this.computeOBBox();
        } else {
            this.bbox = this.computeBBox();
        }
    }

    occluded (bboxes) {
        bboxes.push(this.bbox);

        return boxIntersect(bboxes, (i, j) => {
            if (bboxes[i] === this.bbox || bboxes[j] === this.bbox) {
                let index = bboxes.indexOf(this.bbox);
                if (index > -1) {
                    // remove that bbox
                    bboxes.splice(index, 1);
                }

                return true; // early exit
            }
        });
    }

    inTileBounds () {
        let tile_pixel_size = Geo.units_per_pixel * Geo.tile_size;

        return !(this.bbox[0] < 0 || this.bbox[1] < -tile_pixel_size || this.bbox[2] > tile_pixel_size || this.bbox[3] > 0);
    }

    angleForLine(line) {
        let p0 = line[0];
        let p1 = line[1];
        let p0p1 = Vector.sub(p1, p0);

        p0p1 = Vector.normalize(p0p1);

        let theta = Math.atan2(p0p1[0], p0p1[1]) + Math.PI / 2;

        if (theta > Math.PI / 2 || theta < -Math.PI / 2) {
            theta += Math.PI;
        }

        return theta;
    }

    moveInTile() {
        // TODO : move label in the tile considering its bbox
    }

    computeBBox () {
        let upp = Geo.units_per_pixel;

        let half_merc_width = this.size[0] * upp * 0.5;
        let half_merc_height = this.size[1] * upp * 0.5;

        return [
            this.position[0] - half_merc_width, 
            this.position[1] - half_merc_height, 
            this.position[0] + half_merc_width, 
            this.position[1] + half_merc_height
        ];
    }

    computeOBBox (size) {
        let upp = Geo.units_per_pixel;

        let half_merc_width = this.size[0] * upp * 0.5; // half mercator height
        let half_merc_height = this.size[1] * upp * 0.5; // half mercator width

        let c = Math.cos(this.angle);
        let s = Math.sin(this.angle);

        let x = half_merc_width * c - half_merc_height * s;
        let y = half_merc_width * s + half_merc_height * c;

        let max = Math.max(x, y);

        return [
            this.position[0] - max,
            this.position[1] - max,
            this.position[0] + max,
            this.position[1] + max
        ];
    }
}
 
