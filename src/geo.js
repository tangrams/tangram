// Miscellaneous geo functions

var Geo;
export default Geo = {};

// Projection constants
Geo.tile_size = 256;
Geo.half_circumference_meters = 20037508.342789244;
Geo.min_zoom_meters_per_pixel = Geo.half_circumference_meters * 2 / Geo.tile_size; // min zoom draws world as 2 tiles wide
Geo.meters_per_pixel = [];
Geo.max_zoom = 20;
for (var z=0; z <= Geo.max_zoom; z++) {
    Geo.meters_per_pixel[z] = Geo.min_zoom_meters_per_pixel / Math.pow(2, z);
}

Geo.metersPerPixel = function (zoom) {
    return Geo.min_zoom_meters_per_pixel / Math.pow(2, zoom);
};

// Conversion functions based on an defined tile scale
Geo.units_per_meter = [];
Geo.setTileScale = function(scale) {
    Geo.tile_scale = scale;
    Geo.units_per_pixel = Geo.tile_scale / Geo.tile_size;

    for (var z=0; z <= Geo.max_zoom; z++) {
        Geo.units_per_meter[z] = Geo.tile_scale / (Geo.tile_size * Geo.meters_per_pixel[z]);
    }
};

// Convert tile location to mercator meters - multiply by pixels per tile, then by meters per pixel, adjust for map origin
Geo.metersForTile = function (tile) {
    return {
        x: tile.x * Geo.half_circumference_meters * 2 / Math.pow(2, tile.z) - Geo.half_circumference_meters,
        y: -(tile.y * Geo.half_circumference_meters * 2 / Math.pow(2, tile.z) - Geo.half_circumference_meters)
    };
};

/**
   Given a point in mercator meters and a zoom level, return the tile X/Y/Z that the point lies in
*/
Geo.tileForMeters = function ([x, y], zoom) {
    return {
        x: Math.floor((x + Geo.half_circumference_meters) / (Geo.half_circumference_meters * 2 / Math.pow(2, zoom))),
        y: Math.floor((-y + Geo.half_circumference_meters) / (Geo.half_circumference_meters * 2 / Math.pow(2, zoom))),
        z: zoom
    };
};

/**
   Convert mercator meters to lat-lng
*/
Geo.metersToLatLng = function ([x, y]) {

    x /= Geo.half_circumference_meters;
    y /= Geo.half_circumference_meters;

    y = (2 * Math.atan(Math.exp(y * Math.PI)) - (Math.PI / 2)) / Math.PI;

    x *= 180;
    y *= 180;

    return [x, y];
};

/**
  Convert lat-lng to mercator meters
*/
Geo.latLngToMeters = function([x, y]) {

    // Latitude
    y = Math.log(Math.tan(y*Math.PI/360 + Math.PI/4)) / Math.PI;
    y *= Geo.half_circumference_meters;

    // Longitude
    x *= Geo.half_circumference_meters / 180;

    return [x, y];
};

// Run an in-place transform function on each cooordinate in a GeoJSON geometry
Geo.transformGeometry = function (geometry, transform) {
    if (geometry.type === 'Point') {
        transform(geometry.coordinates);
    }
    else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
        geometry.coordinates.forEach(transform);
    }
    else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
        geometry.coordinates.forEach(coordinates => coordinates.forEach(transform));
    }
    else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(polygon => {
            polygon.forEach(coordinates => coordinates.forEach(transform));
        });
    }
    // TODO: support GeometryCollection
};

Geo.boxIntersect = function (b1, b2) {
    return !(
        b2.sw.x > b1.ne.x ||
        b2.ne.x < b1.sw.x ||
        b2.sw.y > b1.ne.y ||
        b2.ne.y < b1.sw.y
    );
};

// Finds the axis-aligned bounding box for a polygon
Geo.findBoundingBox = function (polygon) {
    var min_x = Infinity,
        max_x = -Infinity,
        min_y = Infinity,
        max_y = -Infinity;

    // Only need to examine outer ring (polygon[0])
    var num_coords = polygon[0].length;
    for (var c=0; c < num_coords; c++) {
        var coord = polygon[0][c];

        if (coord[0] < min_x) {
            min_x = coord[0];
        }
        if (coord[1] < min_y) {
            min_y = coord[1];
        }
        if (coord[0] > max_x) {
            max_x = coord[0];
        }
        if (coord[1] > max_y) {
            max_y = coord[1];
        }
    }

    return [min_x, min_y, max_x, max_y];
};
