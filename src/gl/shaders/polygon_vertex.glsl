uniform vec2 u_resolution;
uniform vec2 u_aspect;
uniform float u_time;
// uniform vec2 u_map_center;
// uniform float u_map_zoom;
// uniform vec2 u_meter_zoom;
// uniform vec2 u_tile_min;
// uniform vec2 u_tile_max;
uniform mat4 u_tile_world;
uniform mat4 u_tile_view;
uniform mat4 u_meter_view;
uniform float u_meters_per_pixel;
uniform float u_num_layers;

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;
attribute float a_layer;

varying vec4 v_position_world;
varying vec3 v_color;

// attribute float a_selection_color;
attribute vec4 a_selection_color;
#if defined(FEATURE_SELECTION)
    varying vec4 v_selection_color;

    // // Encode a float into an RGBA vec4, via:
    // // http://stackoverflow.com/questions/17981163/webgl-read-pixels-from-floating-point-render-target
    // float shift_right (float v, float amt) {
    //     v = floor(v) + 0.5;
    //     return floor(v / exp2(amt));
    // }
    // float shift_left (float v, float amt) {
    //     return floor(v * exp2(amt) + 0.5);
    // }
    // float mask_last (float v, float bits) {
    //     return mod(v, shift_left(1.0, bits));
    // }
    // float extract_bits (float num, float from, float to) {
    //     from = floor(from + 0.5); to = floor(to + 0.5);
    //     return mask_last(shift_right(num, from), to - from);
    // }
    // vec4 encode_float (float val) {
    //     if (val == 0.0) return vec4(0, 0, 0, 0);
    //     float vsign = val > 0.0 ? 0.0 : 1.0;
    //     val = abs(val);
    //     float exponent = floor(log2(val));
    //     float biased_exponent = exponent + 127.0;
    //     float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0;
    //     float t = biased_exponent / 2.0;
    //     float last_bit_of_biased_exponent = fract(t) * 2.0;
    //     float remaining_bits_of_biased_exponent = floor(t);
    //     float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0;
    //     float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0;
    //     float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0;
    //     float byte1 = (vsign * 128.0 + remaining_bits_of_biased_exponent) / 255.0;
    //     return vec4(byte4, byte3, byte2, byte1);
    // }
#endif

#if !defined(LIGHTING_VERTEX)
    varying vec4 v_position;
    varying vec3 v_normal;
#else
    varying vec3 v_lighting;
#endif

const float light_ambient = 0.5;

// Imported functions
#pragma glslify: perspective = require(./modules/perspective)
#pragma glslify: isometric = require(./modules/isometric, u_aspect = u_aspect)
#pragma glslify: calculateZ = require(./modules/depth_scale)
#pragma glslify: calculateLighting = require(./modules/lighting)

#pragma tangram: globals

void main() {
    #if defined(FEATURE_SELECTION)
        // if (a_selection_color == 0.) {
        if (a_selection_color == vec4(0.)) {
            // Discard by forcing invalid triangle if we're in the feature
            // selection pass but have no selection info
            // TODO: in some cases we may actually want non-selectable features to occlude selectable ones?
            gl_Position = vec4(0.);
            return;
        }
        // v_selection_color = encode_float(a_selection_color);
        v_selection_color = a_selection_color;
    #else
        // This is here to prevent the attribute from being optimized out, thus changing the program's vertex layout :(
        // float selection_color = a_selection_color;
        vec4 selection_color = a_selection_color;
    #endif

    vec4 position = u_tile_view * vec4(a_position, 1.);

    // World coordinates for 3d procedural textures
    vec4 position_world = u_tile_world * vec4(a_position, 1.);
    v_position_world = position_world;

    #pragma tangram: vertex

    // Shading
    #if defined(LIGHTING_VERTEX)
        v_color = a_color;
        v_lighting = calculateLighting(
            position, a_normal, /*a_color*/ vec3(1.),
            vec4(0., 0., 150. * u_meters_per_pixel, 1.), // location of point light (in pixels above ground)
            vec4(0., 0., 50. * u_meters_per_pixel, 1.), // location of point light for 'night' mode (in pixels above ground)
            vec3(0.2, 0.7, -0.5), // direction of light for flat shading
            light_ambient);
    #else
        // Send to fragment shader for per-pixel lighting
        v_position = position;
        v_normal = a_normal;
        v_color = a_color;
    #endif

    // Projection
    position = u_meter_view * position; // convert meters to screen space (0-1)

    #if defined(PROJECTION_PERSPECTIVE)
        position = perspective(position, vec2(-0.25, -0.25), vec2(0.6, 0.6));
    #elif defined(PROJECTION_ISOMETRIC) // || defined(PROJECTION_POPUP)
        position = isometric(position, vec2(0., 1.), 1.);
        // position = isometric(position, vec2(sin(u_time), cos(u_time)), 1.);
    #endif

    position.z = calculateZ(position.z, a_layer, u_num_layers, 4096.);

    gl_Position = position;
}
