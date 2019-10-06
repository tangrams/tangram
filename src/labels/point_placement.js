// Logic for placing point labels along a line geometry

import LabelPoint from './label_point';
import {isCoordOutsideTile} from '../builders/common';

const PLACEMENT = LabelPoint.PLACEMENT;
const default_spacing = 80; // spacing of points along line in pixels

export default function placePointsOnLine (line, size, layout) {
    const labels = [];
    const strategy = layout.placement;
    const min_length = Math.max(size[0], size[1]) * layout.placement_min_length_ratio * layout.units_per_pixel;

    if (strategy === PLACEMENT.SPACED) {
        let result = getPositionsAndAngles(line, min_length, layout);
        // false will be returned if line have no length
        if (!result) {
            return [];
        }

        let positions = result.positions;
        let angles = result.angles;
        for (let i = 0; i < positions.length; i++) {
            let position = positions[i];
            let angle = angles[i];
            if (layout.tile_edges === true || !isCoordOutsideTile(position)) {
                labels.push(new LabelPoint(position, size, layout, angle));
            }
        }
    }
    else if (strategy === PLACEMENT.VERTEX) {
        let p, q;
        for (let i = 0; i < line.length - 1; i++) {
            p = line[i];
            q = line[i + 1];
            if (layout.tile_edges === true || !isCoordOutsideTile(p)) {
                const angle = getAngle(p, q, layout.angle);
                labels.push(new LabelPoint(p, size, layout, angle));
            }
        }

        // add last endpoint
        const angle = getAngle(p, q, layout.angle);
        labels.push(new LabelPoint(q, size, layout, angle));
    }
    else if (strategy === PLACEMENT.MIDPOINT) {
        for (let i = 0; i < line.length - 1; i++) {
            let p = line[i];
            let q = line[i + 1];
            let position = [
                0.5 * (p[0] + q[0]),
                0.5 * (p[1] + q[1])
            ];
            if (layout.tile_edges === true || !isCoordOutsideTile(position)) {
                if (!min_length || norm(p, q) > min_length) {
                    const angle = getAngle(p, q, layout.angle);
                    labels.push(new LabelPoint(position, size, layout, angle));
                }
            }
        }
    }
    return labels;
}

function getPositionsAndAngles(line, min_length, layout) {
    let upp = layout.units_per_pixel;
    let spacing = (layout.placement_spacing || default_spacing) * upp;

    let length = getLineLength(line);
    if (length <= min_length) {
        return false;
    }

    let num_labels = Math.max(Math.floor(length / spacing), 1);
    let remainder = length - (num_labels - 1) * spacing;
    let positions = [];
    let angles = [];

    let distance = 0.5 * remainder;
    for (let i = 0; i < num_labels; i++) {
        let {position, angle} = interpolateLine(line, distance, min_length, layout);
        if (position != null && angle != null) {
            positions.push(position);
            angles.push(angle);
        }
        distance += spacing;
    }

    return {positions, angles};
}

function getAngle(p, q, angle = 0) {
    return (angle === 'auto') ? Math.atan2(q[0] - p[0], q[1] - p[1]) : angle;
}

function getLineLength(line) {
    let distance = 0;
    for (let i = 0; i < line.length - 1; i++) {
        distance += norm(line[i], line[i+1]);
    }
    return distance;
}

function norm(p, q) {
    return Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2));
}

// TODO: can be optimized.
// you don't have to start from the first index every time for placement
function interpolateLine(line, distance, min_length, layout) {
    let sum = 0;
    let position, angle;
    for (let i = 0; i < line.length-1; i++) {
        let p = line[i];
        let q = line[i+1];

        const length = norm(p, q);
        if (length <= min_length) {
            continue;
        }

        sum += length;

        if (sum > distance) {
            position = interpolateSegment(p, q, sum - distance);
            angle = getAngle(p, q, layout.angle);
            break;
        }
    }
    return {position, angle};
}

function interpolateSegment(p, q, distance) {
    let length = norm(p, q);
    let ratio = distance / length;
    return [
        ratio * p[0] + (1 - ratio) * q[0],
        ratio * p[1] + (1 - ratio) * q[1]
    ];
}
