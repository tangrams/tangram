import LabelPoint from './label_point';
import LabelLine from './label_line';
import Geo from '../../geo';

var LabelBuilder;
export default LabelBuilder = {};

LabelBuilder.buildFromGeometry = function (size, geometry, options) {
    let labels = [];

    if (geometry.type === "LineString") {
        let lines = geometry.coordinates;

        labels.push(new LabelLine(size, lines, options));
    } else if (geometry.type === "MultiLineString") {
        let lines = geometry.coordinates;

        for (let i = 0; i < lines.length; ++i) {
            let line = lines[i];
            labels.push(new LabelLine(size, line, options));
        }
    } else if (geometry.type === "Point") {
        labels.push(new LabelPoint(geometry.coordinates, size, options));
    } else if (geometry.type === "MultiPoint") {
        let points = geometry.coordinates;

        for (let i = 0; i < points.length; ++i) {
            let point = points[i];
            labels.push(new LabelPoint(point, size, options));
        }
    } else if (geometry.type === "Polygon") {
        let centroid = Geo.centroid(geometry.coordinates[0]);
        labels.push(new LabelPoint(centroid, size, options));
    } else if (geometry.type === "MultiPolygon") {
        let centroid = Geo.multiCentroid(geometry.coordinates);
        labels.push(new LabelPoint(centroid, size, options));
    }

    return labels;
};
