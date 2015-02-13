import Geo from '../../geo';
import boxIntersect from 'box-intersect';
import {Vector} from '../../vector';

export default class Label {

    constructor (text, position, size, lines) {
        Object.assign(this, {
            lines: null,
            angle: null,
            text: "",
            position: [],
            size: [],
            bbox: []
        });

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

        this.bbox["text"] = text;
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
        let min = [this.bbox[0], this.bbox[1]];
        let max = [this.bbox[2], this.bbox[3]];

        if (!this.pointInTile(min) || !this.pointInTile(max)) {
            return false;
        } 

        return true;
    }

    angleForLine (line) {
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

    pointInTile (point) {
        let tile_pixel_size = Geo.units_per_pixel * Geo.tile_size;

        return point[0] > 0 && point[1] > -tile_pixel_size && point[0] < tile_pixel_size && point[1] < 0;
    }

    moveInTile () {
        if (this.lines) {
            for (let line of this.lines) {
                for (let p of line) {
                    if (this.pointInTile(p)) {
                        this.position = p;
                        this.angle = this.angleForLine(line);
                        this.bbox = this.computeOBBox();

                        if (!this.inTileBounds()) {
                            continue;
                        }

                        return true;
                    }
                }
            }
        }

        return false;
    }

    discard (move_in_tile, keep_in_tile, bboxes) {
        let discard = false;

        if (keep_in_tile) {
            let in_tile = this.inTileBounds();

            if (!in_tile && move_in_tile) {
                if (!this.moveInTile()) {
                    discard = true;
                }
            } else if (!in_tile) { 
                discard = true;
            }
        }

        return discard || this.occluded(bboxes); 
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

        let half_merc_width = this.size[0] * upp * 0.5; 
        let half_merc_height = this.size[1] * upp * 0.5;

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
 
