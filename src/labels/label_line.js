import Vector from '../vector';
import Label from './label';
import OBB from '../utils/obb';
import Geo from '../geo';

export default class LabelLine extends Label {

    constructor (size, lines, options) {
        super(size, options);

        this.lines = lines;
        this.offset = [this.options.offset[0], this.options.offset[1]];

        // debugger
        this.segment_size = options.segment_size
        this.segment_texture_size = options.segment_texture_size;

        // optionally limit the line segments that the label may be placed in, by specifying a segment index range
        // used as a coarse subdivide for placing multiple labels per line geometry
        this.segment_index = options.segment_start || 0;
        this.segment_max = options.segment_end || this.lines.length;
        this.update();
    }

    update () {
        let segment = this.currentSegment();

        this.angle = [
            this.getAngle(this.segment_index),
            this.getAngle(this.segment_index + 1)
        ];

        this.position = [(segment[0][0] + segment[1][0]) / 2, (segment[0][1] + segment[1][1]) / 2];

        // kink on join if two works and there are at least 3 line segments
        var onJoin = (this.segment_size.length === 2) && this.lines.length >= 3;
        this.multiPosition = [];

        if (onJoin){
            this.position = segment[1].slice();
            var num_segments = this.segment_size.length;

            var upp = Geo.units_per_pixel;

            for (var i = 0; i < num_segments; i++){
                var direction = (i === 0) ? -1 : 1;
                var offset = Vector.rot([upp * direction * .5 * this.segment_size[i], 0], -this.angle[i]);
                var pt = Vector.add(segment[1], offset);

                this.multiPosition.push(pt);
            }
        }
        else {
            var num_segments = this.segment_size.length;
            var dw = 1 / (num_segments + 1);
            var w = dw;

            for (var i = 0; i < num_segments; i++){
                var pt = [
                    (1 - w) * segment[0][0] + w * segment[1][0],
                    (1 - w) * segment[0][1] + w * segment[1][1]
                ];

                this.multiPosition.push(pt);

                w += dw;
            }
        }


        this.updateBBoxes();
    }

    moveNextSegment () {
        if (this.segment_index + 1 >= this.segment_max - 1) {
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

        // if (theta > PI_2 || theta < -PI_2) {
        //     theta += Math.PI;
        // }
        // theta %= Math.PI * 2;

        return theta;
    }

    getAngle (index) {
        let segment = this.getSegment(index);
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

    fitToSegment () {
        let segment = this.currentSegment();
        let p0p1 = Vector.sub(segment[0], segment[1]);
        let length = Vector.length(p0p1);

        let label_length = this.size[0] * this.options.units_per_pixel;

        if (label_length > length) {
            // an exceed heurestic of 100% would let the label fit in any cases
            let exceed = (1 - (length / label_length)) * 100;
            return exceed < this.options.line_exceed;
        }

        return label_length <= length;
    }

    getSegment(index){
        if (index > this.lines.length - 2) return;
        let p1 = this.lines[index];
        let p2 = this.lines[index + 1];
        return [ p1, p2 ];
    }

    currentSegment () {
        let p1 = this.lines[this.segment_index];
        let p2 = this.lines[this.segment_index + 1];
        return [ p1, p2 ];
    }

    nextSegment () {
        let p1 = this.lines[this.segment_index + 1];
        let p2 = this.lines[this.segment_index + 2];
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

    discard (bboxes) {
        // First find a line segment that fits the label
        if (this.lines && !this.fitToSegment()) {
            while (!this.fitToSegment()) {
                if (!this.moveNextSegment()) {
                    return true;
                }
            }
        }

        // If label fits in line, run standard discard tests
        return super.discard(bboxes);
    }

}
