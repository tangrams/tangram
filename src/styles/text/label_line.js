import Vector from '../../vector';
import Geo from '../../geo';
import Label from './label';
import Utils from '../../utils/utils';

export default class LabelLine extends Label {
    constructor (text, size, lines, style, { move_in_tile, keep_in_tile }) {
        super(text, size, { move_in_tile, keep_in_tile });

        this.segment_index = 0;
        this.lines = lines;
        this.exceed_heuristic = style.exceed;
        this.offset = style.offset;
        this.update();
    }

    middleSegment (segment) {
        return [
            (segment[0][0] + segment[1][0]) / 2,
            (segment[0][1] + segment[1][1]) / 2,
        ];
    }

    update () {
        let segment = this.currentSegment();

        this.angle = this.computeAngle();

        let perp = Vector.normalize(Vector.perp(segment[0], segment[1]));
        let dot = Vector.dot(perp, [0, 1]);
        let offset = Vector.mult(perp, Utils.pixelToMercator(this.offset * Math.sign(dot)));

        this.position = Vector.add(this.middleSegment(segment), offset);
        this.bbox = this.computeBBox();
    }

    moveNextSegment () {
        if (this.segment_index + 1 >= this.lines.length - 1) {
            return false;
        }

        this.segment_index++;
        this.update();

        return true;
    }

    computeAngle () {
        let segment = this.currentSegment();
        let p0p1 = Vector.sub(segment[0], segment[1]);

        p0p1 = Vector.normalize(p0p1);

        let PI_2 = Math.PI / 2;
        let theta = Math.atan2(p0p1[0], p0p1[1]) + PI_2;

        if (theta > PI_2 || theta < -PI_2) {
            theta += Math.PI;
        }
        theta %= Math.PI * 2;

        return theta;
    }

    fitToSegment (should_fit = true) {
        if (!should_fit) {
            return true;
        }

        let segment = this.currentSegment();
        let p0p1 = Vector.sub(segment[0], segment[1]);
        let length = Vector.length(p0p1);

        let label_length = Utils.pixelToMercator(this.size.text_size[0]);

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

        let merc_width = this.size.text_size[0] * upp;
        let merc_height = this.size.text_size[1] * upp;

        let c = Math.cos(this.angle);
        let s = Math.sin(this.angle);

        let x = merc_width * c - merc_height * s;
        let y = merc_width * s + merc_height * c;

        let max = Math.max(Math.abs(x), Math.abs(y)) * 0.5 + this.buffer;

        let bbox = [
            this.position[0] - max,
            this.position[1] - max,
            this.position[0] + max,
            this.position[1] + max
        ];

        return bbox;
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

    discard (bboxes) {
        if (this.lines && !this.fitToSegment()) {
            while (!this.fitToSegment()) {
                if (!this.moveNextSegment()) {
                    return true;
                }
            }
        }

        return super.discard(bboxes);
    }
}

