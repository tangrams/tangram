import Label from './label';
import Vector from '../vector';
import OBB from '../utils/obb';

const stops = [0, 0.33, 0.66, 0.99];
const LINE_EXCEED_STRAIGHT = 1.3;           // minimal ratio for straight labels (label length) / (line length)
const LINE_EXCEED_STRAIGHT_NO_CURVE = 1.8;  // minimal ratio for straight labels that have no curved option
const CURVE_MIN_TOTAL_COST = 1.3;
const CURVE_MIN_AVG_COST = 0.4;
const CURVE_ANGLE_TOLERANCE = 0.02;

export default class LabelLine {
    constructor (size, lines, layout, total_size) {
        this.layout = layout;

        // try straight label
        var label = new LabelLineStraight(total_size, lines, layout);

        if (label.throw_away){
            // if cannot curve (due to text shaping, etc), or if line not curved, throw away
            if (layout.no_curving || lines.length <= 2){
                this.throw_away = true;
                return;
            }

            // else try curved label
            label = new LabelLineCurved(size, lines, layout);

            if (label.throw_away){
                this.throw_away = true;
                return;
            }
            else {
                this.throw_away = false;
                this.angles = label.angles;
                this.offsets = label.offsets;
                this.pre_angles = label.pre_angles;
            }
        }
        else {
            this.size = label.size;
        }

        this.angle = label.angle;
        this.num_segments = label.num_segments;
        this.offset = label.offset;
        this.position = label.position;
        this.obbs = label.obbs;
        this.aabbs = label.aabbs;
        this.type = label.type;
    }

    static splitLineByOrientation(line){
        let current_line = [line[0]];
        let current_length = 0;
        let max_length = 0;
        let orientation = 1;
        let longest_line = current_line;

        for (let i = 1; i < line.length; i++) {
            let pt = line[i];
            let prev_pt = line[i - 1];

            if (pt[0] >= prev_pt[0]){
                // positive orientation
                if (orientation === 1){
                    current_line.push(pt);
                    current_length += Vector.length(pt, prev_pt);

                    if (current_length > max_length){
                        longest_line = current_line;
                        max_length = current_length;
                    }
                }
                else {
                    current_line = [prev_pt, pt];
                    current_length = Vector.length(pt, prev_pt);
                    if (current_length > max_length){
                        longest_line = current_line;
                        max_length = current_length;
                    }
                    orientation = 1;
                }
            }
            else {
                // negative orientation
                if (orientation === -1){
                    current_line.unshift(pt);
                    current_length += Vector.length(pt, prev_pt);
                    if (current_length > max_length){
                        longest_line = current_line;
                        max_length = current_length;
                    }
                }
                else {
                    // add lines is reverse order
                    current_line = [pt, prev_pt];
                    current_length = Vector.length(pt, prev_pt);
                    if (current_length > max_length){
                        longest_line = current_line;
                        max_length = current_length;
                    }
                    orientation = -1;
                }
            }
        }

        return longest_line;
    }

    // Adds each segment to the collision pass as its own bounding box
    // TODO: label group
    add(bboxes) {
        this.placed = true;
        for (let i = 0; i < this.aabbs.length; i++) {
            let aabb = this.aabbs[i];
            let obb = this.obbs[i];
            let obj = { aabb, obb };
            Label.prototype.add.call(obj, bboxes);
        }
    }

    // Checks each segment to see if it should be discarded (via collision). If any segment fails this test, they all fail.
    // TODO: label group
    discard(bboxes, exclude = null) {
        if (this.throw_away) {
            return true;
        }

        for (let i = 0; i < this.obbs.length; i++){
            let aabb = this.aabbs[i];
            let obb = this.obbs[i];
            let obj = { aabb, obb };

            let shouldDiscard = Label.prototype.occluded.call(obj, bboxes, exclude);
            if (shouldDiscard) {
                return true;
            }
        }
        return false;
    }
}

class LabelLineCurved {
    constructor (size, lines, layout) {
        lines = LabelLine.splitLineByOrientation(lines);

        let line_lengths = getLineLengths(lines);
        let line_angles_segments = getLineAnglesForSegments(lines);

        // Arrays for Label properties. TODO: create array of Label types, where LabelLine acts as a "grouped label"
        this.num_segments = size.length;
        this.position = [];
        this.offset = layout.offset.slice();
        this.obbs = [];
        this.aabbs = [];
        this.type = 'curved';

        this.angle = 0; // for global offset
        this.angles = [];
        this.pre_angles = [];
        this.offsets = [];

        let upp = layout.units_per_pixel;

        let label_lengths = size.map(function(size){ return size[0] * upp; });

        let total_line_length = line_lengths.reduce(function(prev, next){ return prev + next; }, 0);
        let total_label_length = label_lengths.reduce(function(prev, next){ return prev + next; }, 0);

        if (total_label_length > total_line_length){
            this.throw_away = true;
            return;
        }

        // starting position
        let height = size[0][1] * upp;
        let [start_index, end_index] = LabelLineCurved.checkTileBoundary(lines, line_lengths, height, line_angles_segments, this.offset, upp);

        // need two line segments for a curved label
        if (end_index - start_index < 2){
            this.throw_away = true;
            return;
        }

        let anchor_index = LabelLineCurved.curvaturePlacement(lines, total_line_length, line_lengths, total_label_length, start_index, end_index);

        if (anchor_index === -1 || end_index - anchor_index < 2){
            this.throw_away = true;
            return;
        }

        let anchor = lines[anchor_index];
        this.position = anchor;

        for (var i = 0; i < label_lengths.length; i++){
            this.offsets[i] = [];
            this.angles[i] = [];
            this.pre_angles[i] = [];

            for (var j = 0; j < stops.length; j++){
                let stop = stops[j];

                let [new_lines, line_lengths] = LabelLineCurved.scaleLine(stop, lines);
                anchor = new_lines[anchor_index];

                let {positions, offsets, angles, pre_angles} = LabelLineCurved.placeAtPosition(anchor, anchor_index, new_lines, line_lengths, line_angles_segments, label_lengths);

                let offsets1d = offsets.map(function(offset){
                    return Math.sqrt(offset[0] * offset[0] + offset[1] * offset[1]) / upp;
                });

                // use average angle
                this.angle = 1 / angles.length * angles.reduce(function(prev, next){ return prev + next; });

                if (stop === 0){
                    for (let i = 0; i < positions.length; i++){
                        let position = positions[i];
                        let offset_angle = angles[i];
                        let pre_angle = pre_angles[i];
                        let width = label_lengths[i];
                        let angle_curve = pre_angle + offset_angle;

                        let obb = getOBBCurved(position, width, height, this.offset, this.angle, angle_curve, upp);
                        let aabb = obb.getExtent();

                        this.obbs.push(obb);
                        this.aabbs.push(aabb);
                    }
                }

                this.offsets[i].push(offsets1d[i]);
                this.angles[i].push(angles[i]);
                this.pre_angles[i].push(pre_angles[i]);
            }
        }
    }

    static checkTileBoundary(lines, widths, height, angles, offset, upp){
        let start = 0;
        let end = lines.length - 1;

        height *= Label.epsilon;

        let start_width = widths[start] * Label.epsilon;
        let end_width = widths[widths.length - 1] * Label.epsilon;

        while (start < end){
            let position = Vector.add(Vector.rot([start_width/2, 0], angles[start]), lines[start]);
            let obb = getOBB(position, start_width, height, -angles[start], offset, upp);
            let aabb = obb.getExtent();
            let in_tile = Label.prototype.inTileBounds.call({ aabb });
            if (in_tile) {
                break;
            }
            else {
                start++;
            }
        }

        while (end > start){
            let position = Vector.add(Vector.rot([-end_width/2, 0], angles[end]), lines[end]);
            let obb = getOBB(position, end_width, height, -angles[end], offset, upp);
            let aabb = obb.getExtent();
            let in_tile = Label.prototype.inTileBounds.call({ aabb });
            if (in_tile) {
                break;
            }
            else {
                end--;
            }
        }

        return [start, end];
    }

    static curvaturePlacement(line, total_line_length, line_lengths, label_length, start_index, end_index){
        start_index = start_index || 0;
        end_index = end_index || line.length - 1;

        var curvatures = []; // array of curvature values per line vertex

        // calculate curvature values
        for (let i = start_index + 1; i < end_index - 1; i++){
            var prev = line[i - 1];
            var curr = line[i];
            var next = line[i + 1];

            var norm_1 = Vector.perp(curr, prev);
            var norm_2 = Vector.perp(next, curr);

            var curvature = Vector.angleBetween(norm_1, norm_2);
            if (curvature > 1) {
                curvature = Infinity;
            }

            curvatures.push(curvature);
        }

        curvatures.push(Infinity); // Infinite penalty for going off end of line

        // calculate curvature costs
        var total_costs = [];
        var avg_costs = [];
        var line_index = start_index;
        var position = 0;

        // move window along line, starting at first vertex
        while (position + label_length < total_line_length){
            // define window breadth
            var window_start = position;
            var window_end = window_start + label_length;

            var line_position = window_start;
            var ahead_index = line_index;
            var cost = 0;

            // iterate through points on line intersecting window
            while (ahead_index < end_index && line_position + line_lengths[ahead_index] < window_end){
                cost += curvatures[ahead_index];
                if (cost === Infinity) {
                    break; // no further progress can be made
                }

                line_position += line_lengths[ahead_index];
                ahead_index++;
            }

            // if optimal cost, break out
            if (cost === 0) {
                return line_index;
            }

            var avg_cost = cost / (ahead_index - line_index);

            total_costs.push(cost);
            avg_costs.push(avg_cost);

            position += line_lengths[line_index];
            line_index++;
        }

        var min_total_cost = Math.min.apply(null, total_costs);
        var min_index = total_costs.indexOf(min_total_cost);
        var min_avg_cost = avg_costs[min_index];

        if (min_total_cost < CURVE_MIN_TOTAL_COST && min_avg_cost < CURVE_MIN_AVG_COST){
            // return index with best placement (least curvature)
            return total_costs.indexOf(min_total_cost);
        }
        else {
            // if tolerances aren't satisfied, throw away tile
            return -1;
        }
    }

    static scaleLine(scale, line){
        var new_line = [line[0]];
        var line_lengths = [];

        line.forEach(function(pt, i){
            if (i === line.length - 1) {
                return;
            }
            var v = Vector.sub(line[i+1], line[i]);
            var delta = Vector.mult(v, 1 + scale);

            new_line.push(Vector.add(new_line[i], delta));
            line_lengths.push(Vector.length(delta));
        });

        return [new_line, line_lengths];
    }

    static placeAtPosition(anchor, anchor_index, line, line_lengths, line_angles_segments, label_lengths){
        // Use flat coordinates. Get nearest line vertex index, and offset from the vertex for all labels.
        let [indices, relative_offsets] = LabelLineCurved.getIndicesAndOffsets(anchor_index, line_lengths, label_lengths);

        // get 2D positions based on "flat" indices and offsets
        let positions = LabelLineCurved.getPositionsFromIndicesAndOffsets(line, indices, relative_offsets);

        // get 2d offsets, angles and pre_angles relative to anchor
        let [offsets, angles, pre_angles] = LabelLineCurved.getAnglesFromIndicesAndOffsets(anchor, indices, line, positions);

        return {positions, offsets, angles, pre_angles};
    }

    static getIndicesAndOffsets(line_index, line_lengths, label_lengths){
        let num_labels = label_lengths.length;

        let indices = [];
        let offsets = [];

        let label_index = 0;
        let label_offset = 0;
        let line_offset = 0;

        // iterate along line
        while (label_index < num_labels){
            let label_length = label_lengths[label_index];

            // iterate along labels within the line segment
            while (label_index < num_labels && label_offset + 0.5 * label_length <= line_offset + line_lengths[line_index]){
                let offset = label_offset - line_offset + 0.5 * label_length;
                offsets.push(offset);
                indices.push(line_index);

                label_offset += label_length;
                label_index++;
                label_length = label_lengths[label_index];
            }

            line_offset += line_lengths[line_index];
            line_index++;
        }

        return [indices, offsets];
    }

    static getPositionsFromIndicesAndOffsets(line, indices, offsets){
        let positions = [];
        for (let i = 0; i < indices.length; i++){
            let index = indices[i];
            let offset = offsets[i];

            let angle = getAngleForSegment(line[index], line[index + 1]);

            let offset2d = Vector.rot([offset, 0], angle);
            let position = Vector.add(line[index], offset2d);

            positions.push(position);
        }

        return positions;
    }

    static getAnglesFromIndicesAndOffsets(anchor, indices, line, positions){
        let angles = [];
        let pre_angles = [];
        let offsets2d = [];

        for (let i = 0; i < positions.length; i++){
            let position = positions[i];
            let index = indices[i];

            let offset2d = Vector.sub(position, anchor);
            let offset2d_angle = -Vector.angle(offset2d);

            let angle = getTextAngleForSegment(line[index], line[index + 1]);
            let pre_angle = angle - offset2d_angle;

            if (i > 0){
                let prev_angle = angles[i - 1];
                let prev_pre_angle = pre_angles[i - 1];
                if (Math.abs(offset2d_angle - prev_angle) > Math.PI) {
                    if (offset2d_angle > prev_angle) {
                        offset2d_angle -= 2 * Math.PI;
                    }
                    else {
                        offset2d_angle += 2 * Math.PI;
                    }
                }
                if (Math.abs(prev_pre_angle - pre_angle) > Math.PI) {
                    if (pre_angle > prev_pre_angle) {
                        pre_angle -= 2 * Math.PI;
                    }
                    else {
                        pre_angle += 2 * Math.PI;
                    }
                }
            }

            angles.push(offset2d_angle);
            pre_angles.push(pre_angle);
            offsets2d.push(offset2d);
        }

        return [offsets2d, angles, pre_angles];
    }
}

// Private method to calculate oriented bounding box
function getOBB(position, width, height, angle, offset, upp) {
    let p0 = position[0];
    let p1 = position[1];

    // apply offset, x positive, y pointing down
    if (offset && (offset[0] !== 0 || offset[1] !== 0)) {
        offset = Vector.rot(offset, angle);
        p0 += offset[0] * upp;
        p1 -= offset[1] * upp;
    }

    // the angle of the obb is negative since it's the tile system y axis is pointing down
    return new OBB(p0, p1, -angle, width, height);
}

function getOBBCurved(position, width, height, offset, angle, angle_curve, upp) {
    let p0 = position[0];
    let p1 = position[1];

    // apply offset, x positive, y pointing down
    if (offset && (offset[0] !== 0 || offset[1] !== 0)) {
        offset = Vector.rot(offset, angle);
        p0 += offset[0] * upp;
        p1 -= offset[1] * upp;
    }

    // the angle of the obb is negative since it's the tile system y axis is pointing down
    return new OBB(p0, p1, -angle_curve, width, height);
}

function calcFitness(line_length, label_length) {
    return label_length / line_length;
}

function norm(p, q){
    return Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2));
}

function getLineAnglesForSegments(line){
    let angles = [];
    for (let i = 0; i < line.length - 1; i++){
        let p = line[i];
        let q = line[i+1];
        let angle = getAngleForSegment(p, q);
        angles.push(angle);
    }
    return angles;
}

function getAngleForSegment(p, q){
    let pq = Vector.sub(q,p);
    return Vector.angle(pq);
}

function getTextAngleForSegment(pt1, pt2) {
    return -getAngleForSegment(pt1, pt2);
}

function getLineLengths(line){
    let lengths = [];
    for (let i = 0; i < line.length - 1; i++){
        let p = line[i];
        let q = line[i+1];
        let length = norm(p,q);
        lengths.push(length);
    }
    return lengths;
}

class LabelLineStraight {
    constructor (size, lines, layout){
        this.size = size;
        this.layout = layout;
        this.num_segments = 0; // number of label segments
        this.total_length = size[0];
        this.total_height = size[1];
        this.fitness = 0; // measure of quality of fit
        this.segment_index = 0;
        this.tolerance = (layout.no_curving) ? LINE_EXCEED_STRAIGHT_NO_CURVE : LINE_EXCEED_STRAIGHT;
        this.type = 'straight';

        lines = LabelLine.splitLineByOrientation(lines);
        this.lines = lines;

        // Arrays for Label properties. TODO: create array of Label types, where LabelLine acts as a "grouped label"
        this.position = [];
        this.angle = 0;
        this.offset = layout.offset.slice();
        this.obbs = [];
        this.aabbs = [];

        // First fitting segment
        let label_length = size[0] * layout.units_per_pixel;
        this.throw_away = !this.fit(lines, label_length);

        // let segment = this.getNextFittingSegment(this.getCurrentSegment());
        // this.throw_away = (!segment);
    }

    fit (lines, label_length){
        let currAngle = getAngleForSegment(lines[0], lines[1]);
        let length = 0;
        let placement = lines[0];

        for (let i = 0; i < lines.length - 1; i++){
            let curr = lines[i];
            let next = lines[i+1];

            let nextAngle = getAngleForSegment(curr, next);

            if (Math.abs(currAngle - nextAngle) > CURVE_ANGLE_TOLERANCE){
                length = 0;
                placement = curr;
            }

            length += Vector.length(Vector.sub(next, curr));

            if (calcFitness(length, label_length) < this.tolerance){
                let currMid = Vector.mult(Vector.add(placement, next), 0.5);

                this.angle = -nextAngle;
                this.position = currMid;
                this.updateBBoxes();
                if (this.inTileBounds()) {
                    return true;
                }
            }

            currAngle = nextAngle;
        }

        return false;
    }

    // Iterate through the line geometry creating the next valid label.
    static nextLabel(label) {
        // increment segment
        let hasNext = label.getNextSegment();
        if (!hasNext) {
            return false;
        }

        // clone options
        let layout = Object.create(label.layout);
        layout.segment_index = label.segment_index;

        // create new label
        let nextLabel = new LabelLine(label.size, label.lines, layout);

        return (nextLabel.throw_away) ? false : nextLabel;
    }

    // Strategy for returning the next segment. Assumes an "ordering" of possible segments
    // taking into account both straight and articulated segments. Returns false if all possibilities
    // have been exhausted
    getNextSegment() {
        if (this.segment_index >= this.lines.length - 2) {
            return false;
        }
        this.segment_index++;
        return this.getCurrentSegment();
    }

    // Returns the line segments necessary for other calculations at the current line segment index.
    // This is the current and next segment for a straight line, and the previous, current and next
    // for an articulated segment.
    getCurrentSegment() {
        return [
            this.lines[this.segment_index],
            this.lines[this.segment_index + 1]
        ];
    }

    // Returns next segment that is valid (within tile, inside angle requirements and within line geometry).
    getNextFittingSegment(segment) {
        segment = segment || this.getNextSegment();
        if (!segment) {
            return false;
        }

        if (this.doesSegmentFit(segment)) {
            this.update();
            if (this.inTileBounds()) {
                return segment;
            }
        }

        return this.getNextFittingSegment();
    }

    // Returns boolean indicating whether current segment is valid
    doesSegmentFit(segment) {
        let upp = this.layout.units_per_pixel;
        let line_length = Vector.length(Vector.sub(segment[0], segment[1])) / upp;
        let fitness = calcFitness(line_length, this.total_length);

        return (fitness < this.tolerance);
    }

    // Once a fitting segment is found, determine its angles, positions and bounding boxes
    update() {
        this.angle = this.getCurrentAngle();
        this.position = this.getCurrentPosition();
        this.updateBBoxes();
    }

    getCurrentAngle() {
        let segment = this.getCurrentSegment();
        return getTextAngleForSegment(segment[0], segment[1]);
    }

    // Return the position of the center of the label
    getCurrentPosition() {
        let segment = this.getCurrentSegment();
        return [
            0.5 * (segment[0][0] + segment[1][0]),
            0.5 * (segment[0][1] + segment[1][1])
        ];
    }

    // Calculate bounding boxes
    updateBBoxes() {
        let upp = this.layout.units_per_pixel;

        // reset bounding boxes
        this.obbs = [];
        this.aabbs = [];

        let width = (this.size[0] + 2 * this.layout.buffer[0]) * upp * Label.epsilon;
        let height = (this.size[1] + 2 * this.layout.buffer[1]) * upp * Label.epsilon;

        let obb = getOBB(this.position, width, height, this.angle, this.offset, upp);
        let aabb = obb.getExtent();

        this.obbs.push(obb);
        this.aabbs.push(aabb);
    }

    // Checks each segment to see if it is within the tile. If any segment fails this test, they all fail.
    // TODO: label group
    inTileBounds() {
        for (let i = 0; i < this.aabbs.length; i++) {
            let aabb = this.aabbs[i];
            let obj = { aabb };
            let in_bounds = Label.prototype.inTileBounds.call(obj);
            if (!in_bounds) {
                return false;
            }
        }
        return true;
    }
}
