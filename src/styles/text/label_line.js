import Vector from '../../vector';
import Geo from '../../geo';
import Label from './label';
import OBB from '../../utils/obb';

export default class LabelLine extends Label {

    constructor (text, size, lines, options) {
        super(text, size, options);

        this.segment_index = 0;
        this.lines = lines;
        this.update();
    }

    update () {
        let segment = this.currentSegment();
        this.angle = this.computeAngle();
        this.position = [(segment[0][0] + segment[1][0]) / 2, (segment[0][1] + segment[1][1]) / 2];
        this.aabb = this.computeAABB();
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

        let label_length = this.size.text_size[0] * Geo.units_per_pixel;

        if (label_length > length) {
            // an exceed heurestic of 100% would let the label fit in any cases
            let exceed = (1 - (length / label_length)) * 100;
            return exceed < this.options.line_exceed;
        }

        return label_length < length;
    }

    currentSegment () {
        let p1 = this.lines[this.segment_index];
        let p2 = this.lines[this.segment_index + 1];

        return [ p1, p2 ];
    }

    computeAABB () {
        let upp = Geo.units_per_pixel;
        let width = (this.size.text_size[0] + this.options.buffer[0] * 2) * upp;
        let height = (this.size.text_size[1] + this.options.buffer[1] * 2) * upp;
        // apply offset, x positive, y pointing down
        let p = [this.position[0] + this.options.offset[0], this.position[1] - this.options.offset[1]];

        // the angle of the obb is negative since it's the tile system y axis is pointing down
        let obb = new OBB(p[0], p[1], -this.angle, width, height);
        let aabb = obb.getExtent();
        aabb.obb = obb;

        return aabb;
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

    discard (aabbs) {
        if (this.lines && !this.fitToSegment()) {
            while (!this.fitToSegment()) {
                if (!this.moveNextSegment()) {
                    return true;
                }
            }
        }

        return super.discard(aabbs);
    }

}
