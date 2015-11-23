import Vector from '../../vector';
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

    fitToSegment () {
        let segment = this.currentSegment();
        let p0p1 = Vector.sub(segment[0], segment[1]);
        let length = Vector.length(p0p1);

        let label_length = this.size.collision_size[0] * this.options.units_per_pixel;

        if (label_length > length) {
            // an exceed heurestic of 100% would let the label fit in any cases
            let exceed = (1 - (length / label_length)) * 100;
            return exceed < this.options.line_exceed;
        }

        return label_length <= length;
    }

    currentSegment () {
        let p1 = this.lines[this.segment_index];
        let p2 = this.lines[this.segment_index + 1];

        return [ p1, p2 ];
    }

    computeAABB () {
        let upp = this.options.units_per_pixel;
        let width = (this.size.collision_size[0] + this.options.buffer[0] * 2) * upp;
        let height = (this.size.collision_size[1] + this.options.buffer[1] * 2) * upp;

        // apply offset, x positive, y pointing down
        let offset = Vector.rot(this.options.offset, this.angle);
        let p = [
            this.position[0] + (offset[0] * upp),
            this.position[1] - (offset[1] * upp)
        ];

        // the angle of the obb is negative since it's the tile system y axis is pointing down
        let obb = new OBB(p[0], p[1], -this.angle, width, height);
        let aabb = obb.getExtent();
        aabb.obb = obb;

        return aabb;
    }

    // Try to move the label into the tile bounds
    // Returns true if label was moved into tile, false if it couldn't be moved
    moveIntoTile () {
        let in_tile = false;
        let fits_to_segment = this.fitToSegment();

        // Try line segments until we find one that fits the label (and is inside the tile)
        while (!in_tile || !fits_to_segment) {
            if (!this.moveNextSegment()) {
                break; // we can't move further in this line
            }

            in_tile = this.inTileBounds();
            fits_to_segment = this.fitToSegment();
        }

        return in_tile && fits_to_segment;
    }

    discard (aabbs) {
        // First find a line segment that fits the label
        if (this.lines && !this.fitToSegment()) {
            while (!this.fitToSegment()) {
                if (!this.moveNextSegment()) {
                    return true;
                }
            }
        }

        // If label fits in line, run standard discard tests
        return super.discard(aabbs);
    }

}
