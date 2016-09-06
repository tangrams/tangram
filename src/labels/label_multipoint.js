import LabelPoint from './label_point';
import Vector from '../vector';

let spacing_px = 40;
let angled = true;

export default function fit(line, size, options) {
    let labels = [];
    let {positions, angles} = getPositionsAndAngles(line, options);

    for (let i = 0; i < positions.length; i++){
        let position = positions[i];
        let angle = angles[i];

        let label = new LabelPoint(position, size, options);
        label.angle = angle;

        labels.push(label);
    }
    return labels;
}

function getPositionsAndAngles(line, options){
    let upp = options.units_per_pixel;
    let spacing = spacing_px * upp;

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

function getAngle(p, q, options){
    return (angled) ? Math.atan2(q[0] - p[0], q[1] - p[1]) + Math.PI/2: 0;
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