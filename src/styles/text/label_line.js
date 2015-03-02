import Geo from '../../geo';
import {Vector} from '../../vector';
import Label from './label';

export default class LabelLine extends Label {
    constructor (text, position, size, lines, exceed_heuristic) {
        super(text, size);

        this.segment_index = 0;
        this.lines = lines;
        this.exceed_heuristic = exceed_heuristic;
        this.angle = this.angleForSegment(this.currentSegment());
        this.position = this.middleSegment(this.currentSegment());
        this.bbox = this.computeBBox();
    }

    middleSegment(segment) {
        return [
            (segment[0][0] + segment[1][0]) / 2,
            (segment[0][1] + segment[1][1]) / 2,
        ];
    }

    moveNextSegment () {
        if (this.segment_index + 1 >= this.lines.length - 1) {
            return false;
        }

        this.segment_index++;
        let segment = this.currentSegment();

        this.angle = this.angleForSegment(segment);
        this.position = this.middleSegment(segment);
        this.bbox = this.computeBBox();

        return true;
    }

    angleForSegment (segment) {
        let p0p1 = Vector.sub(segment[0], segment[1]);

        p0p1 = Vector.normalize(p0p1);

        let theta = Math.atan2(p0p1[0], p0p1[1]) + Math.PI / 2;

        if (theta > Math.PI / 2 || theta < -Math.PI / 2) {
            theta += Math.PI;
        }

        return theta;
    }

    fitToSegment (should_fit = true) {
        if (!should_fit) {
            return true;
        }

        let segment = this.currentSegment();
        let p0p1 = Vector.sub(segment[0], segment[1]);
        let length = Vector.length(p0p1);

        let label_length = this.mercatorLength();

        if (label_length > length) {
            // an exceed heurestic of 100% would let the label fit in any cases
            let exceed = (1 - (length / label_length)) * 100;
            return exceed < this.exceed_heuristic;
        }

        return label_length < length;
    }

    currentSegment () {
        let p1 = this.lines[this.segment_index];
        let p2 = this.lines[this.segment_index + 1];

        return [ p1, p2 ];
    }

    computeBBox (size) {
        let upp = Geo.units_per_pixel;

        let merc_width = this.size[0] * upp;
        let merc_height = this.size[1] * upp;

        let c = Math.cos(this.angle);
        let s = Math.sin(this.angle);

        let x = merc_width * c - merc_height * s;
        let y = merc_width * s + merc_height * c;

        let max = Math.max(x, y) * 0.5;

        return [
            this.position[0] - max,
            this.position[1] - max,
            this.position[0] + max,
            this.position[1] + max
        ];
    }

    moveInTile () {
        let in_tile = false;
        let fits_to_segment = this.fitToSegment();

        // move this label until we found a line we can fit in
        while (!in_tile && !fits_to_segment) {
            if (!this.moveNextSegment()) {
                // we can't move further in this line
                break;
            }

            in_tile = this.inTileBounds();
            fits_to_segment = this.fitToSegment();
        }

        return !in_tile || !fits_to_segment;
    }

    discard (move_in_tile, keep_in_tile, bboxes) {
        if (this.lines && !this.fitToSegment()) {
            while (!this.fitToSegment()) {
                if (!this.moveNextSegment()) {
                    return true;
                }
            }
        }

        return super.discard(move_in_tile, keep_in_tile, bboxes);
    }
}

