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
        this.offset = [this.options.offset[0], this.options.offset[1]];

        this.segment_size = options.segment_size;
        this.segment_texture_size = options.segment_texture_size;

        this.placement = (options.placement === undefined) ? PLACEMENT.MID_POINT : options.placement;

        this.position = null;
        this.multiPosition = null;
        this.pre_offset = [[0,0], [0,0]];
        this.kink_index = 0;

        // optionally limit the line segments that the label may be placed in, by specifying a segment index range
        // used as a coarse subdivide for placing multiple labels per line geometry
        this.segment_index = options.segment_index || 0;
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
                break;
            case PLACEMENT.MID_POINT:
                if (this.segment_index >= this.lines.length - 2) return false;
                if (this.segment_size.length > 1) this.placement = PLACEMENT.CORNER;
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
                let excess = 1 + this.options.line_exceed / 100;
                let p0p1 = Vector.sub(segment[0], segment[1]);
                let line_length = Vector.length(p0p1);

                let label_length = this.size[0] * this.options.units_per_pixel;
                does_fit = (label_length < excess * line_length)
                break;
        }

        return does_fit;
    }

    fitKinkedSegment(segment) {
        let excess = 1 + this.options.line_exceed / 100;
        let opp = this.options.units_per_pixel;

        let does_fit = false;

        let p0p1 = Vector.sub(segment[0], segment[1]);
        let p1p2 = Vector.sub(segment[1], segment[2]);

        let line_length1 = Vector.length(p0p1);
        let line_length2 = Vector.length(p1p2);

        // break up multiple segments into two chunks (N-1 options)
        let label_length1 = this.size[0];
        let label_length2 = 0;
        let width;

        this.kink_index = this.segment_size.length - 1;

        while (!does_fit && this.kink_index > 0) {
            width = this.segment_size[this.kink_index];

            label_length1 -= width;
            label_length2 += width;

            does_fit = (opp * label_length1 < excess * line_length1 && opp * label_length2 < excess * line_length2);
            this.kink_index--;
        }

        this.kink_index++;

        if (does_fit && this.kink_index > 0) {
            var collapsed_size = [0, 0];
            for (var i = 0; i < this.kink_index; i++) {
                collapsed_size[0] += this.segment_size[i];
            }
            collapsed_size[1] = this.size[0] - collapsed_size[0] + 16;

            this.segment_size = collapsed_size;

            this.pre_offset[0][0] = -collapsed_size[0]/2;
            this.pre_offset[1][0] = collapsed_size[1]/2;

            return true;
        }
        else return false;
    }

    update() {
        let segment = this.getCurrentSegment();

        switch (this.placement) {
            case PLACEMENT.CORNER:
                this.position = segment[1].slice();
                var upp = Geo.units_per_pixel;

                var angle_left = this.getAngleAtIndex(this.segment_index - 1);
                var offset_left = Vector.rot([-upp * 0.5 * this.segment_size[0], 0], -angle_left);
                var position_left = Vector.add(segment[1], offset_left);

                var angle_right = this.getAngleAtIndex(this.segment_index);
                var offset_right = Vector.rot([upp * .5 * this.segment_size[1], 0], -angle_right);
                var position_right = Vector.add(segment[1], offset_right);

                this.angle = [angle_left, angle_right];
                // this.multiPosition = [position_left, position_right];
                this.multiPosition = [this.position, this.position];
                break;
            case PLACEMENT.MID_POINT:
                this.multiPosition = null;
                this.position = [
                    (segment[0][0] + segment[1][0]) / 2,
                    (segment[0][1] + segment[1][1]) / 2
                ];

                this.angle = [this.getAngleAtIndex(this.segment_index)];
                break;
        }

        this.updateBBoxes();
    }

    getAngleAtIndex (index) {
        let segment = this.getSegmentAtIndex(index);
        if (!segment) return;

        let p0p1 = Vector.sub(segment[0], segment[1]);

        p0p1 = Vector.normalize(p0p1);

        let PI_2 = Math.PI / 2;
        let theta = Math.atan2(p0p1[0], p0p1[1]) + PI_2;

        // if (theta > PI_2 || theta < -PI_2) {
        //     theta += Math.PI;
        // }
        // theta %= Math.PI * 2;

        return theta;
    }

    getSegmentAtIndex(index){
        let p1 = this.lines[index];
        let p2 = this.lines[index + 1];
        return [ p1, p2 ];
    }

    updateBBoxes () {
        let upp = this.options.units_per_pixel;
        let width = (this.size[0] + this.options.buffer[0] * 2) * upp * Label.epsilon;
        let height = (this.size[1] + this.options.buffer[1] * 2) * upp * Label.epsilon;

        // apply offset, x positive, y pointing down
        let offset = Vector.rot(this.offset, this.angle[0]);
        let p = [
            this.position[0] + (offset[0] * upp),
            this.position[1] - (offset[1] * upp)
        ];

        // the angle of the obb is negative since it's the tile system y axis is pointing down
        this.obb = new OBB(p[0], p[1], -this.angle[0], width, height);
        this.aabb = this.obb.getExtent();
    }
}
