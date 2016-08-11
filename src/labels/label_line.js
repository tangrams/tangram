import Label from './label';
import Vector from '../vector';
import OBB from '../utils/obb';

const PLACEMENT = {
    MID_POINT: 0,
    CORNER: 1
};

const MAX_ANGLE = Math.PI / 2;

export default class LabelLine extends Label {

    constructor (size, lines, layout) {
        super(size, layout);

        this.lines = lines;

        this.total_length = layout.segment_size.reduce(function(prev, next){ return prev[0] + next[0]; });
        this.total_height = size[0][1];
        this.num_segments = size.length;
        this.segment_size = layout.segment_size;

        this.placement = (layout.placement === undefined) ? PLACEMENT.MID_POINT : layout.placement;

        this.position = null;
        this.kink_index = 0;
        this.angle = [];
        this.spread_factor = (layout.spread_factor !== undefined) ? layout.spread_factor : 0.5;
        this.should_articulate = (layout.articulated === false) ? false : true;
        this.offsets = [layout.offset.slice(), layout.offset.slice()];

        this.isArticulated = false;
        this.can_articulate = true;

        // optionally limit the line segments that the label may be placed in, by specifying a segment index range
        // used as a coarse subdivide for placing multiple labels per line geometry
        this.segment_index = layout.segment_index || layout.segment_start || 0;
        this.segment_max = layout.segment_end || this.lines.length;

        // get first good segment
        let segment = this.getNextFittingSegment(this.getCurrentSegment());

        if (!segment) {
            this.throw_away = true;
        }
    }

    static nextLabel(label) {
        // increment segment
        let hasNext = label.getNextSegment();
        if (!hasNext) {
            return false;
        }

        // clone options
        let layout = JSON.parse(JSON.stringify(label.layout));
        layout.segment_index = label.segment_index;
        layout.placement = label.placement;

        // create new label
        let nextLabel = new LabelLine(label.size, label.lines, layout);

        return (nextLabel.throw_away) ? false : nextLabel;
    }

    getNextSegment() {
        switch (this.placement) {
            case PLACEMENT.CORNER:
                this.placement = PLACEMENT.MID_POINT;
                break;
            case PLACEMENT.MID_POINT:
                if (this.segment_index >= this.lines.length - 2) {
                    return false;
                }
                if (this.should_articulate && this.segment_size.length > 1) {
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
        if (!segment) {
            return false;
        }

        if (this.doesSegmentFit(segment)) {
            this.update();
            if (this.inTileBounds() && this.inAngleBounds()) {
                this.isArticulated = (this.placement === PLACEMENT.CORNER) ? true : false;
                return segment;
            }
        }

        return this.getNextFittingSegment();
    }

    doesSegmentFit(segment) {
        switch (this.placement) {
            case PLACEMENT.CORNER:
                return this.fitKinkedSegment(segment);
            case PLACEMENT.MID_POINT:
                return this.fitStraightSegment(segment);
        }
    }

    fitKinkedSegment(segment) {
        let excess = 100 / (100 - this.layout.line_exceed);
        let upp = this.layout.units_per_pixel;

        let does_fit = false;

        let p0p1 = Vector.sub(segment[0], segment[1]);
        let p1p2 = Vector.sub(segment[1], segment[2]);

        // Don't fit if segment doesn't pass the vertical line test, resulting in upside-down labels
        if (p0p1[0] * p1p2[0] < 0 && p0p1[1] * p1p2[1] > 0) {
            return false;
        }

        let line_length1 = Vector.length(p0p1) / upp;
        let line_length2 = Vector.length(p1p2) / upp;

        // break up multiple segments into two chunks (N-1 options)
        let label_length1 = this.total_length;
        let label_length2 = 0;
        let width;

        this.kink_index = this.num_segments - 1;

        while (!does_fit && this.kink_index > 0) {
            width = this.segment_size[this.kink_index][0];

            label_length1 -= width;
            label_length2 += width;

            does_fit = (label_length1 < excess * line_length1 && label_length2 < excess * line_length2);
            if (!does_fit) {
                this.kink_index--;
            }
        }

        return (does_fit && this.kink_index > 0);
    }

    fitStraightSegment(segment) {
        let excess = 100 / (100 - this.layout.line_exceed);
        let upp = this.layout.units_per_pixel;

        let does_fit = false;
        let midpoint = Vector.mult(Vector.add(segment[0], segment[1]), 0.5);

        let line_length1 = Vector.length(Vector.sub(midpoint, segment[0])) / upp;
        let line_length2 = Vector.length(Vector.sub(midpoint, segment[1])) / upp;

        // break up multiple segments into two chunks (N-1 options)
        let label_length1 = this.total_length;
        let label_length2 = 0;
        let width;

        this.kink_index = this.num_segments - 1;

        while (!does_fit && this.kink_index > 0) {
            width = this.segment_size[this.kink_index][0];

            label_length1 -= width;
            label_length2 += width;

            does_fit = (label_length1 < excess * line_length1 && label_length2 < excess * line_length2);
            if (!does_fit) {
                this.kink_index--;
            }
        }

        return does_fit;
    }

    update() {
        this.angle = this.getCurrentAngle();
        this.position = this.getCurrentPosition();
        this.updateBBoxes();
    }

    getCurrentAngle() {
        let segment = this.getCurrentSegment();
        let angles = [];

        switch (this.placement) {
            case PLACEMENT.CORNER:
                let theta1 = getAngleFromSegment(segment[0], segment[1]);
                let theta2 = getAngleFromSegment(segment[1], segment[2]);

                let p0p1 = Vector.sub(segment[0], segment[1]);
                let p1p2 = Vector.sub(segment[1], segment[2]);

                let orientation = (p0p1[0] >= 0 && p1p2[0] >= 0) ? 1 : -1;
                let angle;

                for (let i = 0; i < this.num_segments; i++){
                    if (i < this.kink_index){
                        angle = (orientation > 0) ? theta2 : theta1;
                    }
                    else {
                        angle = (orientation > 0) ? theta1 : theta2;
                    }
                    angles.push(angle);
                }
                break;
            case PLACEMENT.MID_POINT:
                let theta = getAngleFromSegment(segment[0], segment[1]);
                for (let i = 0; i < this.num_segments; i++){
                    angles.push(theta);
                }
                break;
        }

        return angles;
    }

    getCurrentPosition() {
        let segment = this.getCurrentSegment();
        let position;

        switch (this.placement) {
            case PLACEMENT.CORNER:
                position = segment[1].slice();
                break;
            case PLACEMENT.MID_POINT:
                //TODO: position depends on placement
                position = [
                    (segment[0][0] + segment[1][0]) / 2,
                    (segment[0][1] + segment[1][1]) / 2
                ];
                break;
        }

        return position;
    }

    inAngleBounds() {
        switch (this.placement) {
            case PLACEMENT.CORNER:
                let angle0 = this.angle[0];
                if (angle0 < 0) {
                    angle0 += 2 * Math.PI;
                }

                let angle1 = this.angle[1];
                if (angle1 < 0) {
                    angle1 += 2 * Math.PI;
                }

                let theta = Math.abs(angle1 - angle0);

                theta = Math.min(2 * Math.PI - theta, theta);

                return theta <= MAX_ANGLE;
            case PLACEMENT.MID_POINT:
                return true;
        }
    }

    updateBBoxes() {
        let upp = this.layout.units_per_pixel;
        let height = (this.total_height + this.layout.buffer[1] * 2) * upp * Label.epsilon;

        this.obbs = [];
        this.aabbs = [];

        switch (this.placement) {
            case PLACEMENT.CORNER:
                let angle0 = this.angle[0];
                if (angle0 < 0) {
                    angle0 += 2 * Math.PI;
                }

                let angle1 = this.angle[1];
                if (angle1 < 0) {
                    angle1 += 2 * Math.PI;
                }

                let theta = Math.PI - Math.abs(angle1 - angle0);

                let dx = this.spread_factor * Math.abs(this.total_height / Math.tan(0.5 * theta));

                for (let i = 0; i < this.num_segments; i++){
                    let width_px = this.segment_size[i][0];
                    let angle = this.angle[i];

                    let width = width_px * upp * Label.epsilon;

                    let direction = (i < this.kink_index) ? -1 : 1;
                    let nudge = direction * (width/2 + dx);
                    let offset = Vector.rot([nudge, 0], -angle);
                    let position = Vector.add(this.position, offset);

                    let obb = getOBB(position, width, height, angle, this.offset, upp);
                    let aabb = obb.getExtent();

                    this.obbs.push(obb);
                    this.aabbs.push(aabb);

                    this.offsets[i][0] = this.layout.offset[0] + direction * (0.5 * width_px + dx);
                    this.offsets[i][1] = this.layout.offset[1];
                }
                break;
            case PLACEMENT.MID_POINT:
                let nudge = 0;
                // backwards
                for (let i = this.kink_index - 1; i >= 0; i--){
                    let width_px = this.segment_size[i][0];
                    let width = width_px * upp;
                    let angle = this.angle[i];

                    nudge -= 0.5 * width_px;

                    let position = [
                        this.position[0] + nudge * upp,
                        this.position[1]
                    ];

                    let obb = getOBB(position, width, height, angle, this.offset, upp);
                    let aabb = obb.getExtent();

                    this.obbs.push(obb);
                    this.aabbs.push(aabb);

                    this.offsets[i][0] = this.layout.offset[0] + nudge;
                    this.offsets[i][1] = this.layout.offset[1];
                }

                nudge = 0

                // forwards
                for (let i = this.kink_index; i < this.num_segments; i++){
                    let width_px = this.segment_size[i][0];
                    let angle = this.angle[i];
                    let width = width_px * upp;

                    nudge += 0.5 * width_px;

                    let position = [
                        this.position[0] + nudge * upp,
                        this.position[1]
                    ];

                    let obb = getOBB(position, width, height, angle, this.offset, upp);
                    let aabb = obb.getExtent();

                    this.obbs.push(obb);
                    this.aabbs.push(aabb);

                    this.offsets[i][0] = this.layout.offset[0] + nudge;
                    this.offsets[i][1] = this.layout.offset[1];
                }
                break;
        }
    }

    inTileBounds() {
        for (let i = 0; i < this.aabbs.length; i++) {
            let aabb = this.aabbs[i];
            let obj = { aabb };
            let in_bounds = super.inTileBounds.call(obj);
            if (!in_bounds) {
                return false;
            }
        }
        return true;
    }

    add(bboxes) {
        for (let i = 0; i < this.aabbs.length; i++) {
            let aabb = this.aabbs[i];
            let obb = this.obbs[i];
            let obj = { aabb, obb };
            super.add.call(obj, bboxes);
        }
    }

    discard(bboxes, exclude) {
        if (this.throw_away) {
            return true;
        }

        for (let i = 0; i < this.obbs.length; i++){
            let aabb = this.aabbs[i];
            let obb = this.obbs[i];
            let obj = { aabb, obb };

            let shouldDiscard = super.occluded.call(obj, bboxes, exclude);
            if (shouldDiscard) {
                return true;
            }
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
        theta %= 2 * Math.PI;
    }
    else if (theta < 0) {
        // If in 4th quadrant, make a positive angle
        theta += 2 * PI;
    }

    return theta;
}
