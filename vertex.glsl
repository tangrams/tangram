uniform vec2 resolution;
uniform vec2 map_center;
uniform float map_zoom;
// uniform float time;

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
//     const float half_circumference_meters = 20037508.34;
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

    // Scale mercator meters to viewport
    const float min_zoom_meters_per_pixel = 156543.0339;
    float meters_per_pixel = min_zoom_meters_per_pixel / pow(2.0, map_zoom);
    vec2 meter_zoom = vec2(resolution.x / 2.0 * meters_per_pixel, resolution.y / 2.0 * meters_per_pixel);

    vposition.xy -= map_center;

    vposition.y += vposition.z; // z coordinate is a simple translation up along y axis, ala isometric
    vposition.xy /= meter_zoom;

    // Rotation test
    // float theta = 0;
    // const float pi = 3.1415926;
    // vec2 pr;
    // pr.x = vposition.x * cos(theta * pi / 180.0) + vposition.y * -sin(theta * pi / 180.0);
    // pr.y = vposition.x * sin(theta * pi / 180.0) + vposition.y * cos(theta * pi / 180.0);
    // vposition.xy = pr;

    // vposition.y *= abs(sin(vposition.x)); // hourglass effect

    vposition.z = (-vposition.z + 32768.0) / 65536.0; // reverse and scale to 0-1 for GL depth buffer

    fcolor = color;

    // Flat shading between surface normal and light
    fcolor *= dot(vnormal, light * -1.0) + ambient;
    fcolor = min(fcolor, 1.0);

    gl_Position = vec4(vposition, 1.0);
}
