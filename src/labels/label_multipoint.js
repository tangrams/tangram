import LabelPoint, {PLACEMENT} from './label_point';

const default_spacing = 50; // spacing of points along line in pixels

export default function placePointsOnLine (line, size, options) {
    let labels = [];
    let strategy = options.placement;

    switch (strategy){
        case PLACEMENT.SPACED:
            let result = getPositionsAndAngles(line, options);
            // false will be returned if line have no length
            if (!result) {
                return [];
            }

            let positions = result.positions;
            let angles = result.angles;
            for (let i = 0; i < positions.length; i++){
                let position = positions[i];
                let angle = angles[i];

                let label = new LabelPoint(position, size, options);
                label.angle = angle;
                labels.push(label);
            }
            break;
        case PLACEMENT.VERTEX:
            let p, q, label;
            for (let i = 0; i < line.length - 1; i++){
                p = line[i];
                q = line[i + 1];
                label = new LabelPoint(p, size, options);
                label.angle = getAngle(p, q, options.angle);
                labels.push(label);
            }

            // add last endpoint
            label = new LabelPoint(q, size, options);
            label.angle = getAngle(p, q, options.angle);
            labels.push(label);
            break;
        case PLACEMENT.MIDPOINT:
            for (let i = 0; i < line.length - 1; i++){
                let p = line[i];
                let q = line[i + 1];
                let position = [
                    0.5 * (p[0] + q[0]),
                    0.5 * (p[1] + q[1])
                ];
                let label = new LabelPoint(position, size, options);
                label.angle = getAngle(p, q, options.angle);
                labels.push(label);
            }
            break;
    }
    return labels;
}

function getPositionsAndAngles(line, options){
    let upp = options.units_per_pixel;
    let spacing = (options.placement_spacing || default_spacing) * upp;

    let length = getLineLength(line);

    if (length === 0){
        return false;
    }

    let num_labels = Math.max(Math.floor(length / spacing), 1);
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

function getAngle(p, q, angle = 0){
    return (angle === 'auto') ? Math.atan2(q[0] - p[0], q[1] - p[1]) : angle;
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
    let position, angle;
    for (let i = 0; i < line.length-1; i++){
        let p = line[i];
        let q = line[i+1];

        sum += norm(p, q);

        if (sum > distance){
            position = interpolateSegment(p, q, sum - distance);
            angle = getAngle(p, q, options.angle);
            break;
        }
    }
    return {position, angle};
}

function interpolateSegment(p, q, distance){
    let length = norm(p, q);
    let ratio = distance / length;
    return [
        ratio * p[0] + (1 - ratio) * q[0],
        ratio * p[1] + (1 - ratio) * q[1]
    ];
}
