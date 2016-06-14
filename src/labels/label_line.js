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

        // debugger
        this.segment_size = options.segment_size
        this.segment_texture_size = options.segment_texture_size;

        this.segment_index = 0;

        this.placement = PLACEMENT.MID_POINT;

        this.position = null;
        this.multiPosition = null;
        this.kink_index = 0;

        // optionally limit the line segments that the label may be placed in, by specifying a segment index range
        // used as a coarse subdivide for placing multiple labels per line geometry
        this.segment_index = options.segment_start || 0;
        this.segment_max = options.segment_end || this.lines.length;

        // get first good segment
        var segment = this.getNextFittingSegment();

        if (!segment) {
            this.throw_away = true;
        }
        else {
            this.update();
        }
    }

    next() {
        switch (this.placement) {
            case PLACEMENT.CORNER:
                this.placement = PLACEMENT.MID_POINT;
                break;
            case PLACEMENT.MID_POINT:
                if (this.segment_index >= this.lines.length - 2) return false;
                this.placement = PLACEMENT.CORNER;
                this.segment_index++;
                break;
        }

        return true;
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

    getNextSegment() {
        var hasNext = this.next();
        return (!hasNext) ? false : this.getCurrentSegment();
    }

    getNextFittingSegment() {
        var segment = this.getCurrentSegment();
        while (!this.doesSegmentFit(segment)) {
            segment = this.getNextSegment();
            if (!segment) return false;
        }
        return segment;
    }

    doesSegmentFit(segment) {
        let excess = 1 + this.options.line_exceed / 100;
        let does_fit = false;
        let p0p1

        switch (this.placement) {
            case PLACEMENT.CORNER:
                p0p1 = Vector.sub(segment[0], segment[1]);
                let p1p2 = Vector.sub(segment[1], segment[2]);

                let line_length1 = Vector.length(p0p1);
                let line_length2 = Vector.length(p1p2);

                // break up multiple segments into two chunks (N-1 options)
                var label_length1 = this.size[0];
                var label_length2 = 0;
                var width2, index;
                var index = 0;
                while (!does_fit && index < this.segment_size.length - 1) {
                    width2 = this.segment_size[this.segment_size.length - index - 1];

                    label_length1 -= width2 * this.options.units_per_pixel;
                    label_length2 += width2 * this.options.units_per_pixel;

                    does_fit = (label_length1 < excess * line_length1 && label_length2 < excess * line_length2);
                    index++;
                }
                this.kink_index = this.segment_size.length - index;

                // var width1 = this.segment_size[0];
                // while (this.segment_size.length - 1) {
                //     width1 += this.segment_size.shift();
                // }

                // this.segment_size[0] = width1;
                // this.segment_size[1] = width2;
                break;
            case PLACEMENT.MID_POINT:
                p0p1 = Vector.sub(segment[0], segment[1]);
                let line_length = Vector.length(p0p1);

                let label_length = this.size[0] * this.options.units_per_pixel;
                does_fit = (label_length < excess * line_length)
                break;
        }

        return does_fit;
    }

    update() {
        let segment = this.getCurrentSegment();

        switch (this.placement) {
            case PLACEMENT.CORNER:
                this.position = segment[1].slice();

                this.angle = [];
                this.multiPosition = [];
                var upp = Geo.units_per_pixel;

                // backwards
                var width = 0;
                var angle = this.getAngleAtIndex(this.segment_index - 1);
                for (var i = this.kink_index - 1; i >= 0; i--){
                    width += this.segment_size[i];

                    var offset = Vector.rot([-upp * .5 * width, 0], -angle);
                    var pt = Vector.add(segment[1], offset);

                    this.angle.unshift(angle);
                    this.multiPosition.unshift(pt);

                    width += width;
                }

                // forwards
                var width = 0;
                angle = this.getAngleAtIndex(this.segment_index);
                for (i = this.kink_index; i < this.segment_size.length; i++){
                    width += this.segment_size[i];

                    var offset = Vector.rot([upp * .5 * width, 0], -angle);
                    var pt = Vector.add(segment[1], offset);

                    this.angle.push(angle);
                    this.multiPosition.push(pt);
                }

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
        let segment = this.getSegmentByIndex(index);
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

    getSegmentByIndex(index){
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

    // Try to move the label into the tile bounds
    // Returns true if label was moved into tile, false if it couldn't be moved
    moveIntoTile () {
        let in_tile = false;
        let fits_to_segment = false;

        while (!in_tile) {
            let segment = this.getNextFittingSegment();
            if (segment) {
                this.update();
                in_tile = this.inTileBounds();
                if (!in_tile) {
                    segment = this.getNextSegment();
                    if (!segment) return false;
                }
            }
            else {
                return false;
            }
        }

        return true;
    }
}
