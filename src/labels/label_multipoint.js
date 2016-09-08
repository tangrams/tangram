import LabelPoint from './label_point';
import Vector from '../vector';

const default_spacing = 50; // spacing of points along line in pixels

let FIT_STRATEGY = {
    ENDPOINTS: 0,       // place labels at endpoints of lines
    SPACED: 1           // place labels equally spaced along line
};

export default function fitToLine (line, size, options) {
    let labels = [];
    let strategy = options.spacing ? FIT_STRATEGY.SPACED : FIT_STRATEGY.ENDPOINTS;

    switch (strategy){
        case FIT_STRATEGY.SPACED:
            let {positions, angles} = getPositionsAndAngles(line, options);
            for (let i = 0; i < positions.length; i++){
                let position = positions[i];
                let angle = angles[i];

                let label = new LabelPoint(position, size, options);
                label.angle = angle;
                labels.push(label);
            }
            break;
        case FIT_STRATEGY.ENDPOINTS:
            for (let i = 0; i < line.length; i++){
                let position = line[i];
                let label = new LabelPoint(position, size, options);
                label.angle = 0;
                labels.push(label);
            }
            break;
    }
    return labels;
}

function getPositionsAndAngles(line, options){
    let upp = options.units_per_pixel;
    let spacing = (options.spacing || default_spacing) * upp;

    let length = getLineLength(line);
    let num_labels = Math.floor(length / spacing);
    let remainder = length - (num_labels - 1) * spacing;

    let positions = [];
    let angles = [];

    let distance = 0.5 * remainder;
    for (let i = 0; i < num_labels; i++){
        let {position, angle} = interpolateLine(line, distance, options);
        positions.push(position);
        angles.push(angle);
        distance += spacing;
    }

    return {positions, angles};
}

function getAngle(p, q, {angle = 0}){
    return (angle === 'auto') ? Math.atan2(q[0] - p[0], q[1] - p[1]) + Math.PI/2 : angle;
}

function getLineLength(line){
    let distance = 0;
    for (let i = 0; i < line.length - 1; i++){
        distance += norm(line[i], line[i+1]);
    }
    return distance;
}

function norm(p, q){
    return Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2));
}

function interpolateLine(line, distance, options){
    let sum = 0;
    for (let i = 0; i < line.length-1; i++){
        let p = line[i];
        let q = line[i+1];

        sum += norm(p, q);

        if (sum > distance){
            let position = interpolateSegment(p, q, sum - distance);
            let angle = getAngle(p, q, options);
            return {position, angle};
        }
    }
}

function interpolateSegment(p, q, distance){
    let length = norm(p, q);
    let ratio = distance / length;
    return [
        ratio * p[0] + (1 - ratio) * q[0],
        ratio * p[1] + (1 - ratio) * q[1]
    ];
}