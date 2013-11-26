// Miscellaneous geo functions

// Point
function Point (x, y)
{
    return { x: x, y: y };
}

Point.copy = function (p)
{
    if (p == null) {
        return null;
    }
    return { x: p.x, y: p.y };
};

var Geo = {};

(function () {

// Projection constants
Geo.tile_size = Point(256, 256);
Geo.half_circumference_meters = 20037508.342789244;
Geo.map_origin_meters = Point(-Geo.half_circumference_meters, Geo.half_circumference_meters);
Geo.min_zoom_meters_per_pixel = Geo.half_circumference_meters * 2 / Geo.tile_size.x; // min zoom draws world as 2 tiles wide
Geo.meters_per_pixel = [];
Geo.max_zoom = 20;
for (var z=1; z <= Geo.max_zoom; z++) {
    Geo.meters_per_pixel[z] = Geo.min_zoom_meters_per_pixel / Math.pow(2, z);
}

// Convert tile location to mercator meters - multiply by pixels per tile, then by meters per pixel, adjust for map origin
Geo.metersForTile = function (tile)
{
    return Point(
        (tile.x * Geo.tile_size.x * Geo.meters_per_pixel[tile.z]) + Geo.map_origin_meters.x,
        ((tile.y * Geo.tile_size.y * Geo.meters_per_pixel[tile.z]) * -1) + Geo.map_origin_meters.y
    );
};

// Convert mercator meters to lat-lng
Geo.metersToLatLng = function (meters)
{
    var c = Point.copy(meters);

    c.x /= Geo.half_circumference_meters;
    c.y /= Geo.half_circumference_meters;

    c.y = (2 * Math.atan(Math.exp(c.y * Math.PI)) - (Math.PI / 2)) / Math.PI;

    c.x *= 180;
    c.y *= 180;

    return c;
};

// Convert lat-lng to mercator meters
Geo.latLngToMeters = function(latlng)
{
    var c = Point.copy(latlng);

    // Latitude
    c.y = Math.log(Math.tan((c.y + 90) * Math.PI / 360)) / (Math.PI / 180);
    c.y = c.y * Geo.half_circumference_meters / 180;

    // Longitude
    c.x = c.x * Geo.half_circumference_meters / 180;

    return c;
};

// Run a transform function on each cooordinate in a GeoJSON geometry
Geo.transformGeometry = function (geometry, transform)
{
    if (geometry.type == 'Point') {
        return transform(geometry.coordinates);
    }
    else if (geometry.type == 'LineString' || geometry.type == 'MultiPoint') {
        return geometry.coordinates.map(transform);
    }
    else if (geometry.type == 'Polygon' || geometry.type == 'MultiLineString') {
        return geometry.coordinates.map(function (coordinates) {
            return coordinates.map(transform);
        });
    }
    else if (geometry.type == 'MultiPolygon') {
        return geometry.coordinates.map(function (polygon) {
            return polygon.map(function (coordinates) {
                return coordinates.map(transform);
            });
        });
    }
    // TODO: support GeometryCollection
    return {};
};

}());
