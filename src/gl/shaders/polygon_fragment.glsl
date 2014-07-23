uniform vec2 u_resolution;
uniform vec2 u_aspect;
uniform mat4 u_meter_view;
uniform float u_meters_per_pixel;
uniform float u_time;

varying vec3 v_color;
varying vec4 v_position_world;

#if !defined(LIGHTING_VERTEX)
    varying vec4 v_position;
    varying vec3 v_normal;
#endif

const float light_ambient = 0.5;

// Imported functions
#pragma glslify: lighting = require(./modules/lighting)

#pragma tangram: globals

void main (void) {
    vec3 color = v_color;

    #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting
        color = lighting(
            v_position, v_normal, color,
            vec4(0., 0., 150. * u_meters_per_pixel, 1.), // location of point light (in pixels above ground)
            vec4(0., 0., 50. * u_meters_per_pixel, 1.), // location of point light for 'night' mode (in pixels above ground)
            vec3(0.2, 0.7, -0.5), // direction of light for flat shading
            light_ambient);
    #endif

    #pragma tangram: fragment

    gl_FragColor = vec4(color, 1.0);
}
