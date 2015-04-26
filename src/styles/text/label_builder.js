import LabelPoint from './label_point';
import LabelLine from './label_line';
import Utils from '../../utils/utils';

var LabelBuilder;
export default LabelBuilder = {};

LabelBuilder.labelsFromGeometry = function (geometry, { text, size }, label_style) {
    let labels = [];

    if (geometry.type === "LineString") {
        let lines = geometry.coordinates;

        labels.push(new LabelLine(text, size, lines, label_style.lines, { move_in_tile: true, keep_in_tile: true }));
    } else if (geometry.type === "MultiLineString") {
        let lines = geometry.coordinates;

        for (let i = 0; i < lines.length; ++i) {
            let line = lines[i];

            labels.push(new LabelLine(text, size, line, label_style.lines, { move_in_tile: true, keep_in_tile: true }));
        }
    } else if (geometry.type === "Point") {
        let width = label_style.points.max_width;

        if (width && size.text_size[0] > width) {
            let line_height = (size.px_logical_size / 100) * label_style.points.line_height;
            line_height = Utils.pixelToMercator(line_height);
            let label = LabelPoint.explode(text, geometry.coordinates, size, width, line_height, { move_in_tile: true, keep_in_tile: true });

            labels.push(label);
        } else {
            labels.push(new LabelPoint(text, geometry.coordinates, size, null, { move_in_tile: true, keep_in_tile: true }));
        }
    } else if (geometry.type === "MultiPoint") {
        let points = geometry.coordinates;

        for (let i = 0; i < points.length; ++i) {
            let point = points[i];
            labels.push(new LabelPoint(text, point, size, null, { move_in_tile: true, keep_in_tile: true }));
        }
    } else if (geometry.type === "Polygon") {
        let centroid = Utils.centroid(geometry.coordinates[0]);
        let area = Utils.polygonArea(geometry.coordinates[0]);

        labels.push(new LabelPoint(text, centroid, size, area, { move_in_tile: true, keep_in_tile: true }));
    } else if (geometry.type === "MultiPolygon") {
        let centroid = Utils.multiCentroid(geometry.coordinates);
        let area = Utils.multiPolygonArea(geometry.coordinates);

        labels.push(new LabelPoint(text, centroid, size, area, { move_in_tile: true, keep_in_tile: true }));
    }

    return labels;
};


