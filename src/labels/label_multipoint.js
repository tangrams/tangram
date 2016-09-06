import LabelPoint from './label_point';

let spacing = 50;
let angled = false;

export default function fit(line, size, options) {
    let labels = [];
    let positions = getPositions(line, options);

    for (let i = 0; i < positions.length; i++){
        let position = positions[i];
        let angle = Math.random() * Math.PI;

        let label = new LabelPoint(position, size, options);
        label.angle = angle;

        labels.push(label);
    }
    return labels;
}

function getPositions(line, options){
    let length = getLineLength(line);
    let num_labels = Math.floor(length / spacing);
    let remainder = length - (num_labels - 1) * spacing;

    let positions = [];

    let distance = 0.5 * remainder;
    for (let i = 0; i < num_labels; i++){
        let position = interpolateLine(line, distance);
        positions.push(position);
        distance += spacing;
    }

    return positions;
}

function getAngles(options){
    return 0;
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

function interpolateLine(line, distance){
    let sum = 0;
    for (let i = 0; i < line.length-1; i++){
        sum += norm(line[i], line[i+1]);

        if (sum > distance){
            return interpolateSegment(line[i], line[i+1], sum - distance);
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