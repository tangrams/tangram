import Label from './label';
import Vector from '../vector';
import OBB from '../utils/obb';

const STOPS = [0, 0.33, 0.66, 0.99];        // zoom levels for curved label snapshot data (offsets and angles)
const LINE_EXCEED_STRAIGHT = 1.5;           // minimal ratio for straight labels (label length) / (line length)
const LINE_EXCEED_STRAIGHT_NO_CURVE = 1.8;  // minimal ratio for straight labels that have no curved option (like Arabic)
const LINE_EXCEED_STAIGHT_LOOSE = 2.3;      // 2nd pass minimal ratio for straight labels
const STRAIGHT_ANGLE_TOLERANCE = 0.1;       // multiple "almost straight" segments within this angle tolerance can be considered one straight segment (in radians)
const CURVE_MIN_TOTAL_COST = 1.3;           // curved line total curvature tolerance (sum in radians)
const CURVE_MIN_AVG_COST = 0.4;             // curved line average curvature tolerance (mean)
const CURVE_MAX_ANGLE = 1;                  // curved line singular curvature tolerance (value in radians)
const ORIENTED_LABEL_OFFSET_FACTOR = 1.2;   // multiply offset by this amount to avoid linked label collision
const VERTICAL_ANGLE_TOLERANCE = 0.01;      // nearly vertical lines considered vertical within this angle tolerance

let LabelLine = {
    // Given a label's bounding box size and size of broken up individual segments
    // return a label that fits along the line geometry that is either straight (preferred) or curved (if straight tolerances aren't met)
    create : function(segment_sizes, total_size, line, layout){
        // The passes done for fitting a label, and provided tolerances for each pass
        // First straight is chosen with a low tolerance. Then curved. Then straight with a higher tolerance.
        const passes = [
            { type: 'straight', tolerance : (layout.no_curving) ? LINE_EXCEED_STRAIGHT_NO_CURVE : LINE_EXCEED_STRAIGHT },
            { type: 'curved' },
            { type: 'straight', tolerance : LINE_EXCEED_STAIGHT_LOOSE }
        ];

        // loop through passes. first label found wins.
        for (let i = 0; i < passes.length; i++){
            let check = passes[i];
            let label;
            if (check.type === 'straight'){
                label = new LabelLineStraight(total_size, line, layout, check.tolerance);
            }
            else if (check.type === 'curved' && !layout.no_curving && line.length > 2){
                label = new LabelLineCurved(segment_sizes, line, layout);
            }

            if (label && !label.throw_away) {
                return label;
            }
        }

        return false;
    }
};

export default LabelLine;

// Base class for a labels.
class LabelLineBase {
    constructor (layout) {
        this.id = Label.nextLabelId();
        this.layout = layout;
        this.position = [];
        this.angle = 0;
        this.offset = layout.offset.slice();
        this.obbs = [];
        this.aabbs = [];
        this.type = ''; // "curved" or "straight" to be set by child class
        this.throw_away = false; // boolean that determines if label should be discarded
    }

    // Minimal representation of label
    toJSON () {
        return {
            id: this.id,
            type: this.type,
            obbs: this.obbs.map(o => o.toJSON()),
            layout: {
                priority: this.layout.priority,
                collide: this.layout.collide
            }
        };
    }

    // Given a line, find the longest series of segments that maintains a constant orientation in the x-direction.
    // This assures us that the line has no orientation flip, so text would not appear upside-down.
    // If the line's orientation is reversed, the flip return value will be true, otherwise false
    static splitLineByOrientation(line){
        let current_line = [line[0]];
        let current_length = 0;
        let max_length = 0;
        let orientation = 0;
        let longest_line = current_line;
        let flip = false;

        for (let i = 1; i < line.length; i++) {
            let pt = line[i];
            let prev_pt = line[i - 1];
            let length = Vector.length(Vector.sub(pt, prev_pt));

            if (pt[0] > prev_pt[0]){
                // positive orientation
                if (orientation === 1){
                    current_line.push(pt);
                    current_length += length;
                    if (current_length > max_length){
                        longest_line = current_line;
                        max_length = current_length;
                        flip = false;
                    }
                }
                else {
                    current_line = [prev_pt, pt];
                    current_length = length;
                    if (current_length > max_length){
                        longest_line = current_line;
                        max_length = current_length;
                        flip = false;
                    }
                    orientation = 1;
                }
            }
            else if (pt[0] < prev_pt[0]) {
                // negative orientation
                if (orientation === -1){
                    current_line.unshift(pt);
                    current_length += length;
                    if (current_length > max_length){
                        longest_line = current_line;
                        max_length = current_length;
                        flip = true;
                    }
                }
                else {
                    // prepend points (reverse order)
                    current_line = [pt, prev_pt];
                    current_length = length;
                    if (current_length > max_length){
                        longest_line = current_line;
                        max_length = current_length;
                        flip = true;
                    }
                    orientation = -1;
                }
            }
            else {
                // vertical line (doesn't change previous orientation)
                if (orientation === -1){
                    current_line.unshift(pt);
                }
                else {
                    current_line.push(pt);
                    orientation = 1;
                }

                current_length += length;
                if (current_length > max_length){
                    longest_line = current_line;
                    max_length = current_length;

                    flip = (orientation === -1);
                }
            }
        }

        return [longest_line, flip];
    }

    // Checks each segment to see if it should be discarded (via collision). If any segment fails this test, they all fail.
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

    // Checks each segment to see if it is within the tile. If any segment fails this test, they all fail.
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

    // Method to calculate oriented bounding box
    // "angle" is the angle of the text segment, "angle_offset" is the angle applied to the offset.
    // Offset angle is constant for the entire label, while segment angles are not.
    static createOBB (position, width, height, angle, angle_offset, offset, upp) {
        let p0 = position[0];
        let p1 = position[1];

        // apply offset, x positive, y pointing down
        if (offset && (offset[0] !== 0 || offset[1] !== 0)) {
            offset = Vector.rot(offset, angle_offset);
            p0 += offset[0] * upp;
            p1 -= offset[1] * upp;
        }

        // the angle of the obb is negative since it's the tile system y axis is pointing down
        return new OBB(p0, p1, -angle, width, height);
    }
}

// Class for straight labels.
// Extends base LabelLine class.
class LabelLineStraight extends LabelLineBase {
    constructor (size, line, layout, tolerance){
        super(layout);
        this.type = 'straight';
        this.throw_away = !this.fit(size, line, layout, tolerance);
    }

    // Determine if the label can fit the geometry within provided tolerance
    // A straight label is generally placed at segment midpoints, but can "look ahead" to further segments
    // if they are within an angle bound given by STRAIGHT_ANGLE_TOLERANCE and place at the midpoint between non-consecutive segments
    fit (size, line, layout, tolerance){
        let upp = layout.units_per_pixel;
        let flipped; // boolean indicating if orientation of line is changed

        // Make new copy of line, with consistent orientation
        [line, flipped] = LabelLineBase.splitLineByOrientation(line);

        // matches for "left" or "right" labels where the offset angle is dependent on the geometry
        if (typeof layout.orientation === 'number'){
            this.offset[1] += ORIENTED_LABEL_OFFSET_FACTOR * (size[1] - layout.vertical_buffer);

            // if line is flipped, or the orientation is "left" (-1), flip the offset's y-axis
            if (flipped){
                this.offset[1] *= -1;
            }

            if (layout.orientation === -1){
                this.offset[1] *= -1;
            }
        }

        let line_lengths = getLineLengths(line);
        let label_length = size[0] * upp;

        // loop through line looking for a placement for the label
        for (let i = 0; i < line.length - 1; i++){
            let curr = line[i];

            let curve_tolerance = 0;
            let length = 0;
            let ahead_index = i + 1;
            let prev_angle;

            // look ahead to further line segments within an angle tolerance
            while (ahead_index < line.length){
                let ahead_curr = line[ahead_index - 1];
                let ahead_next = line[ahead_index];

                let next_angle = getAngleForSegment(ahead_curr, ahead_next);

                if (ahead_index !== i + 1){
                    curve_tolerance += getAbsAngleDiff(next_angle, prev_angle);
                }

                // if curve tolerance is exceeded, break out of loop
                if (Math.abs(curve_tolerance) > STRAIGHT_ANGLE_TOLERANCE){
                    break;
                }

                length += line_lengths[ahead_index - 1];

                // check if label fits geometry
                if (calcFitness(length, label_length) < tolerance){
                    let curr_midpt = Vector.mult(Vector.add(curr, ahead_next), 0.5);

                    // TODO: modify angle if line chosen within curve_angle_tolerance
                    // Currently line angle is the same as the starting angle, perhaps it should average across segments?
                    this.angle = -next_angle;
                    let angle_offset = this.angle;

                    // if line is flipped, or the orientation is "left" (-1), rotate the angle of the offset 180 deg
                    if (typeof layout.orientation === 'number'){
                        if (flipped){
                            angle_offset += Math.PI;
                        }

                        if (layout.orientation === -1){
                            angle_offset += Math.PI;
                        }
                    }

                    // ensure that all vertical labels point up (not down) by snapping angles close to pi/2 to -pi/2
                    if (Math.abs(this.angle - Math.PI/2) < VERTICAL_ANGLE_TOLERANCE) {
                        // flip angle and offset
                        this.angle = -Math.PI/2;

                        if (typeof layout.orientation === 'number'){
                            this.offset[1] *= -1;
                        }
                    }

                    this.position = curr_midpt;

                    this.updateBBoxes(this.position, size, this.angle, this.angle, this.offset);

                    // if (this.inTileBounds()) {
                        return true;
                    // }
                }

                prev_angle = next_angle;
                ahead_index++;
            }
        }

        return false;
    }

    // Calculate bounding boxes
    updateBBoxes(position, size, angle, angle_offset, offset) {
        let upp = this.layout.units_per_pixel;

        // reset bounding boxes
        this.obbs = [];
        this.aabbs = [];

        let width = (size[0] + 2 * this.layout.buffer[0]) * upp * Label.epsilon;
        let height = (size[1] + 2 * this.layout.buffer[1]) * upp * Label.epsilon;

        let obb = LabelLineBase.createOBB(position, width, height, angle, angle_offset, offset, upp);
        let aabb = obb.getExtent();

        this.obbs.push(obb);
        this.aabbs.push(aabb);
    }
}

// Class for curved labels
// Extends base LabelLine class to support angles, pre_angles, offsets as arrays for each segment
class LabelLineCurved extends LabelLineBase {
    constructor (segment_sizes, line, layout) {
        super(layout);
        this.type = 'curved';

        // extra data for curved labels
        this.angles = [];
        this.pre_angles = [];
        this.offsets = [];
        this.num_segments = segment_sizes.length;

        this.throw_away = !this.fit(segment_sizes, line, layout);
    }

    // Determine if the curved label can fit the geometry.
    // No tolerance is provided because the label must fit entirely within the line geometry.
    fit (size, line, layout){
        let upp = layout.units_per_pixel;
        let flipped; // boolean determining if the line orientation is reversed

        let height_px = Math.max(...size.map(s => s[1])); // use max segment height
        let height = height_px * upp;

        // Make new copy of line, with consistent orientation
        [line, flipped] = LabelLineBase.splitLineByOrientation(line);

        // matches for "left" or "right" labels where the offset angle is dependent on the geometry
        if (typeof layout.orientation === 'number'){
            this.offset[1] += ORIENTED_LABEL_OFFSET_FACTOR * (height_px - layout.vertical_buffer);

            // if line is flipped, or the orientation is "left" (-1), flip the offset's y-axis
            if (flipped){
                this.offset[1] *= -1;
            }

            if (layout.orientation === -1){
                this.offset[1] *= -1;
            }
        }

        let line_lengths = getLineLengths(line);
        let label_lengths = size.map(size => size[0] * upp);

        let total_line_length = line_lengths.reduce((prev, next) => prev + next, 0);
        let total_label_length = label_lengths.reduce((prev, next) => prev + next, 0);

        // if label displacement is longer than the line, no fit can be possible
        if (total_label_length > total_line_length){
            return false;
        }

        // find start and end indices that the label can fit on without overlapping tile boundaries
        // TODO: there is a small probability of a tile boundary crossing on an internal line segment
        // another option is to create a buffer around the line and check if it overlaps a tile boundary
        let [start_index, end_index] = LabelLineCurved.checkTileBoundary(line, line_lengths, height, this.offset, upp);

        // need two line segments for a curved label
        if (end_index - start_index < 2){
            return false;
        }

        // all positional offsets of the label are relative to the anchor
        let anchor_index = LabelLineCurved.curvaturePlacement(line, total_line_length, line_lengths, total_label_length, start_index, end_index);
        let anchor = line[anchor_index];

        // if anchor not found, or greater than the end_index, no fit possible
        if (anchor_index === -1 || end_index - anchor_index < 2){
            return false;
        }

        // set start position at anchor position
        this.position = anchor;

        // Loop through labels at each zoom level stop
        // TODO: Can be made faster since we are computing every segment for every zoom stop
        // We can skip a segment's calculation once a segment's angle equals its fully zoomed angle
        for (var i = 0; i < label_lengths.length; i++){
            this.offsets[i] = [];
            this.angles[i] = [];
            this.pre_angles[i] = [];

            // loop through stops (z = [0, .33, .66, .99] + base zoom)
            for (var j = 0; j < STOPS.length; j++){
                let stop = STOPS[j];

                // scale the line geometry by the zoom magnification
                let [new_line, line_lengths] = LabelLineCurved.scaleLine(stop, line);
                anchor = new_line[anchor_index];

                // calculate label data relative to anchor position
                let {positions, offsets, angles, pre_angles} = LabelLineCurved.placeAtIndex(anchor_index, new_line, line_lengths, label_lengths);

                // translate 2D offsets into "polar coordinates"" (1D distances with angles)
                let offsets1d = offsets.map(offset => {
                    return Math.sqrt(offset[0] * offset[0] + offset[1] * offset[1]) / upp;
                });

                // Calculate everything that is independent of zoom level (angle for offset, bounding boxes, etc)
                if (stop === 0){
                    // use average angle for a global label offset (if offset is specified)
                    this.angle = 1 / angles.length * angles.reduce((prev, next) => prev + next);

                    // calculate bounding boxes for collision at zoom level 0
                    for (let i = 0; i < positions.length; i++){
                        let position = positions[i];
                        let pre_angle = pre_angles[i];
                        let width = label_lengths[i];
                        let angle_segment = pre_angle + angles[i];
                        let angle_offset = this.angle;

                        let obb = LabelLineBase.createOBB(position, width, height, angle_segment, angle_offset, this.offset, upp);
                        let aabb = obb.getExtent();

                        this.obbs.push(obb);
                        this.aabbs.push(aabb);
                    }
                }

                // push offsets/angles/pre_angles for each zoom and for each label segment
                this.offsets[i].push(offsets1d[i]);
                this.angles[i].push(angles[i]);
                this.pre_angles[i].push(pre_angles[i]);
            }
        }

        return true;
    }

    // Test if line intersects tile boundary. Return indices at beginning and end of line that are within tile.
    // Burn candle from both ends strategy - meaning shift and pop until vertices are within tile, but an interior vertex
    // may still be outside of tile (can potentially result in label collision across tiles).
    static checkTileBoundary(line, widths, height, offset, upp){
        let start = 0;
        let end = line.length - 1;

        height *= Label.epsilon;

        let start_width = widths[start] * Label.epsilon;
        let end_width = widths[widths.length - 1] * Label.epsilon;

        // Burn candle from start
        while (start < end){
            let angle = getAngleForSegment(line[start], line[start + 1]);
            let position = Vector.add(Vector.rot([start_width/2, 0], angle), line[start]);
            let obb = LabelLineBase.createOBB(position, start_width, height, -angle, -angle, offset, upp);
            let aabb = obb.getExtent();
            let in_tile = Label.prototype.inTileBounds.call({ aabb });
            if (in_tile) {
                break;
            }
            else {
                start++;
            }
        }

        // Burn candle from end
        while (end > start){
            let angle = getAngleForSegment(line[end - 1], line[end]);
            let position = Vector.add(Vector.rot([-end_width/2, 0], angle), line[end]);
            let obb = LabelLineBase.createOBB(position, end_width, height, -angle, -angle, offset, upp);
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

    // Find optimal starting segment for placing a curved label along a line within provided tolerances
    // This is determined by calculating the curvature at each interior vertex of a line
    // then construct a "window" whose breadth is the length of the label. Place this label at each vertex
    // and add the curvatures of each vertex within the window. The vertex mimimizing this value is the "best" placement.
    // Return -1 is no placement found.
    static curvaturePlacement(line, total_line_length, line_lengths, label_length, start_index, end_index){
        start_index = start_index || 0;
        end_index = end_index || line.length - 1;

        var curvatures = []; // array of curvature values per line vertex

        // calculate curvature values
        for (let i = start_index + 1; i < end_index; i++){
            var prev = line[i - 1];
            var curr = line[i];
            var next = line[i + 1];

            var norm_1 = Vector.perp(curr, prev);
            var norm_2 = Vector.perp(next, curr);

            var curvature = Vector.angleBetween(norm_1, norm_2);

            // If curvature at a vertex is greater than the tolerance, remove it from consideration
            // by giving it an infinite penalty
            if (curvature > CURVE_MAX_ANGLE) {
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

        for (let i = 0; i < start_index; i++){
            position += line_lengths[i];
        }

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

        if (total_costs.length === 0) {
            return -1;
        }

        // calculate min cost and avg cost to determine if label can fit within curvatures tolerances
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

    // Scale the line by a scale factor (used for computing the angles and offsets at fractional zoom levels)
    // Return the new line positions and their lengths
    static scaleLine(scale, line){
        var new_line = [line[0]];
        var line_lengths = [];

        line.forEach((pt, i) => {
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

    // Place a label at a given line index
    static placeAtIndex(anchor_index, line, line_lengths, label_lengths){
        let anchor = line[anchor_index];

        // Use flat coordinates. Get nearest line vertex index, and offset from the vertex for all labels.
        let [indices, relative_offsets] = LabelLineCurved.getIndicesAndOffsets(anchor_index, line_lengths, label_lengths);

        // get 2D positions based on "flat" indices and offsets
        let positions = LabelLineCurved.getPositionsFromIndicesAndOffsets(line, indices, relative_offsets);

        // get 2d offsets, angles and pre_angles relative to anchor
        let [offsets, angles, pre_angles] = LabelLineCurved.getAnglesFromIndicesAndOffsets(anchor, indices, line, positions);

        return {positions, offsets, angles, pre_angles};
    }

    // Given label lengths to place along a line broken into several lengths, computer what indices and at which offsets
    // the labels will appear on the line. Assume the line is straight, as it is not necessary to consider angles.
    //
    // Label lengths:
    // |-----|----|-----|-----------------|-------------|
    //
    // Line Lengths;
    // |---------|---------|-------------|------------|----------|-------|
    //
    // Result: indices: [0,0,1,1,3,4]
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

    // Given indices and 1D offsets on a line, compute their 2D positions
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

    // Given indices and 1D offsets on a line, compute their angles and pre-angles from a reference anchor point
    static getAnglesFromIndicesAndOffsets(anchor, indices, line, positions){
        let angles = [];
        let pre_angles = [];
        let offsets = [];

        for (let i = 0; i < positions.length; i++){
            let position = positions[i];
            let index = indices[i];

            let offset = Vector.sub(position, anchor);
            let offset_angle = -Vector.angle(offset);

            let angle = getTextAngleForSegment(line[index], line[index + 1]);
            let pre_angle = angle - offset_angle;

            if (i > 0){
                let prev_angle = angles[i - 1];
                let prev_pre_angle = pre_angles[i - 1];
                if (Math.abs(offset_angle - prev_angle) > Math.PI) {
                    offset_angle += (offset_angle > prev_angle) ? -2 * Math.PI : 2 * Math.PI;
                }
                if (Math.abs(prev_pre_angle - pre_angle) > Math.PI) {
                    pre_angle += (pre_angle > prev_pre_angle) ? -2 * Math.PI : 2 * Math.PI;
                }
            }

            angles.push(offset_angle);
            pre_angles.push(pre_angle);
            offsets.push(offset);
        }

        return [offsets, angles, pre_angles];
    }
}

// Fitness function (label length / line length)
function calcFitness(line_length, label_length) {
    return label_length / line_length;
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
        let length = Math.hypot(p[0] - q[0], p[1] - q[1]);
        lengths.push(length);
    }
    return lengths;
}

function getAbsAngleDiff(angle1, angle2){
    let small, big;
    if (angle1 > angle2){
        small = angle2;
        big = angle1;
    }
    else {
        small = angle1;
        big = angle2;
    }

    while (big - small > Math.PI){
        small += 2 * Math.PI;
    }

    return Math.abs(big - small);
}
