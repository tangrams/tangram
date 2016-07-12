import Vector from '../vector';
import Label from './label';
import OBB from '../utils/obb';
import Geo from '../geo';

const PLACEMENT = {
    MID_POINT: 0,
    CORNER: 1
};

export default class LabelLine extends Label {

    constructor (size, lines, options) {
        super(size, options);

        this.lines = lines;
        this.offset = this.options.offset;

        this.segment_size = options.segment_size;

        this.placement = (options.placement === undefined) ? PLACEMENT.MID_POINT : options.placement;

        this.position = null;
        this.pre_offset = [[0,0], [0,0]];
        this.collapsed_size = [];
        this.kink_index = 0;

        // optionally limit the line segments that the label may be placed in, by specifying a segment index range
        // used as a coarse subdivide for placing multiple labels per line geometry
        this.segment_index = options.segment_index || options.segment_start || 0;
        this.segment_max = options.segment_end || this.lines.length;

        this.throw_away = false;

        // get first good segment
        var segment = this.getNextFittingSegment(this.getCurrentSegment());

        if (!segment) this.throw_away = true;
    }

    nextLabelLine() {
        // increment segment
        var hasNext = this.getNextSegment();
        if (!hasNext) return false;

        // clone options
        var options = Object.create(this.options);
        options.segment_index = this.segment_index;
        options.placement = this.placement;

        // create new label
        var label = new LabelLine(this.size, this.lines, options);

        return (label.throw_away) ? false : label;
    }

    getNextSegment() {
        switch (this.placement) {
            case PLACEMENT.CORNER:
                this.placement = PLACEMENT.MID_POINT;
                this.kink_index = 0;
                this.pre_offset = [[0, 0], [0, 0]];
                break;
            case PLACEMENT.MID_POINT:
                if (this.segment_index >= this.lines.length - 2) return false;
                if (this.segment_size.length > 1) {
                    this.placement = PLACEMENT.CORNER;
                }
                this.segment_index++;
                break;
        }

        return this.getCurrentSegment();
    }

    getCurrentSegment() {
        let p1, p2, segment;
        switch (this.placement) {
            case PLACEMENT.CORNER:
                p1 = this.lines[this.segment_index - 1];
                p2 = this.lines[this.segment_index];
                let p3 = this.lines[this.segment_index + 1];
                segment = [ p1, p2, p3 ];
                break;
            case PLACEMENT.MID_POINT:
                p1 = this.lines[this.segment_index];
                p2 = this.lines[this.segment_index + 1];
                segment = [ p1, p2 ];
                break;
        }

        return segment;
    }

    getNextFittingSegment(segment) {
        segment = segment || this.getNextSegment();
        if (!segment) return false;

        if (this.doesSegmentFit(segment)) {
            this.update();
            if (this.inTileBounds())
                return segment;
        }

        return this.getNextFittingSegment();
    }

    doesSegmentFit(segment) {
        let does_fit = false;

        switch (this.placement) {
            case PLACEMENT.CORNER:
                does_fit = this.fitKinkedSegment(segment);
                break;
            case PLACEMENT.MID_POINT:
                let excess = 100 / (100 - this.options.line_exceed);
                let p0p1 = Vector.sub(segment[0], segment[1]);
                let line_length = Vector.length(p0p1);

                let label_length = this.options.collision_size[0] * this.options.units_per_pixel;
                does_fit = (label_length < excess * line_length)
                break;
        }

        return does_fit;
    }

    fitKinkedSegment(segment) {
        let excess = 100 / (100 - this.options.line_exceed);
        let opp = this.options.units_per_pixel;

        let does_fit = false;

        let p0p1 = Vector.sub(segment[0], segment[1]);
        let p1p2 = Vector.sub(segment[1], segment[2]);

        let line_length1 = Vector.length(p0p1);
        let line_length2 = Vector.length(p1p2);

        // break up multiple segments into two chunks (N-1 options)
        let label_length1 = this.options.collision_size[0];
        let label_length2 = 0;
        let width;

        this.kink_index = this.segment_size.length - 1;

        while (!does_fit && this.kink_index > 0) {
            width = this.segment_size[this.kink_index];

            label_length1 -= width;
            label_length2 += width;

            does_fit = (opp * label_length1 < excess * line_length1 && opp * label_length2 < excess * line_length2);
            if (!does_fit) this.kink_index--;
        }

        if (does_fit && this.kink_index > 0) {
            var width1 = 0;
            var width2 = this.size[0];
            for (var i = 0; i < this.kink_index; i++) {
                var segment_width = this.segment_size[i];
                width1 += segment_width;
                width2 -= segment_width;
            }
            this.collapsed_size[0] = width1;
            this.collapsed_size[1] = width2;
            return true;
        }
        else return false;
    }

    update() {
        this.angle = this.getCurrentAngle();
        this.position = this.getCurrentPosition();
        this.updateBBoxes();
    }

    getCurrentAngle() {
        var segment = this.getCurrentSegment();
        var angle;

        switch (this.placement) {
            case PLACEMENT.CORNER:
                var theta1 = getAngleFromSegment(segment[0], segment[1]);
                var theta2 = getAngleFromSegment(segment[1], segment[2]);

                var orientation1 = getOrientationFromSegment(segment[0], segment[1]);
                var orientation2 = getOrientationFromSegment(segment[1], segment[2]);

                if (orientation1 !== orientation2) {
                    theta2 -= Math.PI;
                }

                angle = (orientation1) ? [theta2, theta1] : [theta1, theta2];
                break;
            case PLACEMENT.MID_POINT:
                var theta = getAngleFromSegment(segment[0], segment[1]);
                angle = [theta];
                break;
        }

        return angle;
    }

    getCurrentPosition() {
        let segment = this.getCurrentSegment();
        let position;

        switch (this.placement) {
            case PLACEMENT.CORNER:
                position = segment[1].slice();
                break;
            case PLACEMENT.MID_POINT:
                position = [
                    (segment[0][0] + segment[1][0]) / 2,
                    (segment[0][1] + segment[1][1]) / 2
                ];
                break;
        }

        return position;
    }

    updateBBoxes() {
        let upp = this.options.units_per_pixel;
        let height = (this.options.collision_size[1] + this.options.buffer[1] * 2) * upp * Label.epsilon;

        this.obbs = [];
        this.aabbs = [];

        switch (this.placement) {
            case PLACEMENT.CORNER:
                var segment = this.getCurrentSegment();
                var orientation1 = getOrientationFromSegment(segment[0], segment[1]);
                var orientation2 = getOrientationFromSegment(segment[1], segment[2]);

                var angle0 = this.angle[0];
                if (angle0 < 0) angle0 += 2 * Math.PI;

                var angle1 = this.angle[1];
                if (angle1 < 0) angle1 += 2 * Math.PI;

                var theta = Math.PI - Math.abs(angle1 - angle0);

                var dx = Math.abs(0.5 * this.options.collision_size[1] / Math.tan(0.5 * theta));

                for (var i = 0; i < 2; i++){
                    var width_px = this.collapsed_size[i];
                    var angle = this.angle[i];

                    let width = width_px * upp * Label.epsilon;

                    var direction = (i == 0) ? -1 : 1;
                    var nudge = direction * (width/2 + dx);
                    var offset = Vector.rot([nudge, 0], -angle);
                    var position = Vector.add(this.position, offset);

                    var obb = getOBB(position, width, height, angle, this.offset, upp);
                    var aabb = obb.getExtent();

                    this.obbs.push(obb);
                    this.aabbs.push(aabb);

                    this.pre_offset[i][0] = direction * (this.collapsed_size[i]/2 + dx);
                }
                break;
            case PLACEMENT.MID_POINT:
                let width = (this.options.collision_size[0] + this.options.buffer[0] * 2) * upp * Label.epsilon;

                var angle = this.angle[0];
                var obb = getOBB(this.position, width, height, angle, this.offset, upp);
                var aabb = obb.getExtent();

                this.obbs.push(obb);
                this.aabbs.push(aabb);
                break;
        }
    }

    inTileBounds() {
        for (var i = 0; i < this.aabbs.length; i++) {
            var aabb = this.aabbs[i];
            var obj = { aabb };
            var in_bounds = super.inTileBounds.call(obj);
            if (!in_bounds) return false;
        }
        return true;
    }

    add(bboxes) {
        for (var i = 0; i < this.aabbs.length; i++) {
            var aabb = this.aabbs[i];
            var obb = this.obbs[i];
            var obj = { aabb, obb };
            super.add.call(obj, bboxes);
        }
    }

    discard(bboxes) {
        for (var i = 0; i < this.obbs.length; i++){
            var aabb = this.aabbs[i];
            var obb = this.obbs[i];
            var obj = { aabb, obb };

            var shouldDiscard = super.occluded.call(obj, bboxes);
            if (shouldDiscard) return true;
        }
        return false;
    }
}

function getOBB(position, width, height, angle, offset, upp) {
    let p0, p1;
    // apply offset, x positive, y pointing down
    if (offset[0] !== 0 || offset[1] !== 0) {
        offset = Vector.rot(offset, angle);
        p0 = position[0] + (offset[0] * upp);
        p1 = position[1] - (offset[1] * upp);
    }
    else {
        p0 = position[0];
        p1 = position[1];
    }

    // the angle of the obb is negative since it's the tile system y axis is pointing down
    return new OBB(p0, p1, -angle, width, height);
}

function getAngleFromSegment(pt1, pt2) {
    let PI = Math.PI;
    let PI_2 = PI / 2;
    let p1p2 = Vector.sub(pt1, pt2);
    let theta = Math.atan2(p1p2[0], p1p2[1]) + PI_2;

    if (theta >= PI_2) {
        // If in 2nd quadrant, move to 4th quadrant
        theta += PI;
        theta %= 2*Math.PI
    }
    else if (theta < 0) {
        // If in 4th quadrant, make a positive angle
        theta += 2 * PI
    }

    return theta;
}

function getOrientationFromSegment(pt1, pt2) {
    return pt1[0] >= pt2[0];
}
