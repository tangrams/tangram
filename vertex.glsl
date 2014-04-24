uniform vec2 resolution;
uniform vec2 map_center;
uniform float map_zoom;
uniform vec2 meter_zoom;
uniform vec2 tile_min;
uniform vec2 tile_max;
uniform float tile_scale; // geometries are scaled to this range within each tile
uniform float time;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;

varying vec3 fcolor;

// const vec3 light = vec3(0.2, 0.7, -0.5); // vec3(0.1, 0.2, -0.4)
vec3 light = normalize(vec3(0.2, 0.7, -0.5)); // vec3(0.1, 0.2, -0.4)
const float ambient = 0.45;

// Project lat-lng to mercator
// vec2 latLngToMeters (vec2 coordinate) {
//     const float pi = 3.1415926;
//     const float half_circumference_meters = 20037508.342789244;
//     vec2 projected;

//     // Latitude
//     projected.y = log(tan((coordinate.y + 90.0) * pi / 360.0)) / (pi / 180.0);
//     projected.y = projected.y * half_circumference_meters / 180.0;

//     // Longitude
//     projected.x = coordinate.x * half_circumference_meters / 180.0;

//     return projected;
// }

void main() {
    vec3 vposition = position;
    vec3 vnormal = normal;

    // Calc position of vertex in meters, relative to center of screen
    vposition.y *= -1.0; // adjust for flipped y-coords
    // vposition.y += tile_scale; // alternate, to also adjust for force-positive y coords in tile
    vposition.xy *= (tile_max - tile_min) / tile_scale; // adjust for vertex location within tile (scaled from local coords to meters)

    // Vertex displacement tests
    // if (vposition.z > 1.0) {
    //     // vposition.x += sin(vposition.z + time) * 10.0 * sin(position.x); // swaying buildings
    //     // vposition.y += cos(vposition.z + time) * 10.0;

    //     // vposition.z *= (sin(vposition.z / 25.0 * time) + 1.0) / 2.0 + 0.1; // evelator buildings
    //     // vposition.z *= (sin(vposition.x / 100.0 + time) + 1.01); // wave
    // }

    vposition.xy += tile_min.xy - map_center; // adjust for corner of tile relative to map center

    // Isometric-style projections
    // vposition.y += vposition.z; // z coordinate is a simple translation up along y axis, ala isometric
    // vposition.y += vposition.z * 0.5; // closer to Ultima 7-style axonometric
    // vposition.x -= vposition.z * 0.5;

    // Adjust for zoom in meters to get clip space coords
    vposition.xy /= meter_zoom;

    // Flat shading between surface normal and light
    fcolor = color;
    // fcolor += vec3(sin(position.z + time), 0.0, 0.0); // color change on height + time
    light = vec3(-0.25, -0.25, 0.35); // vec3(0.1, 0.1, 0.35); // point light location
    light = normalize(vec3(vposition.x, vposition.y, -vposition.z) - light); // light angle from light point to vertex
    fcolor *= dot(vnormal, light * -1.0) + ambient + clamp(vposition.z * 2.0 / meter_zoom.x, 0.0, 0.25);
    fcolor = min(fcolor, 1.0);

    // Perspective-style projections
    vec2 perspective_offset = vec2(-0.25, -0.25);
    vec2 perspective_factor = vec2(0.8, 0.8); // vec2(-0.25, 0.75);
    vposition.xy += vposition.z * perspective_factor * (vposition.xy - perspective_offset) / meter_zoom.xy; // perspective from offset center screen

    // Rotation test
    // float theta = 0;
    // const float pi = 3.1415926;
    // vec2 pr;
    // pr.x = vposition.x * cos(theta * pi / 180.0) + vposition.y * -sin(theta * pi / 180.0);
    // pr.y = vposition.x * sin(theta * pi / 180.0) + vposition.y * cos(theta * pi / 180.0);
    // vposition.xy = pr;

    // vposition.y *= abs(sin(vposition.x)); // hourglass effect

    vposition.z = (-vposition.z + 2048.0) / 4096.0; // reverse and scale to 0-1 for GL depth buffer

    gl_Position = vec4(vposition, 1.0);
}
