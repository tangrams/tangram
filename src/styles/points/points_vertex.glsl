uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_map_position;
uniform vec4 u_tile_origin;
uniform float u_tile_proxy_depth;
uniform bool u_tile_fade_in;
uniform float u_meters_per_pixel;
uniform float u_device_pixel_ratio;
uniform float u_visible_time;
uniform bool u_view_panning;
uniform float u_view_pan_snap_timer;

uniform mat4 u_model;
uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat3 u_inverseNormalMatrix;

attribute vec4 a_position;
attribute vec4 a_shape;
attribute vec4 a_color;
attribute vec2 a_texcoord;
attribute vec2 a_offset;

uniform float u_point_type;

#ifdef TANGRAM_CURVED_LABEL
    attribute vec4 a_offsets;
    attribute vec4 a_pre_angles;
    attribute vec4 a_angles;
#endif

varying vec4 v_color;
varying vec2 v_texcoord;
varying vec4 v_world_position;
varying float v_alpha_factor;

#ifdef TANGRAM_HAS_SHADER_POINTS
    attribute float a_outline_edge;
    attribute vec4 a_outline_color;

    varying float v_outline_edge;
    varying vec4 v_outline_color;
    varying float v_aa_offset;
#endif

#define PI 3.14159265359
#define TANGRAM_NORMAL vec3(0., 0., 1.)

#pragma tangram: camera
#pragma tangram: material
#pragma tangram: lighting
#pragma tangram: raster
#pragma tangram: global

vec2 rotate2D(vec2 _st, float _angle) {
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
}

#ifdef TANGRAM_CURVED_LABEL
    // Assumes stops are [0, 0.33, 0.66, 0.99];
    float mix4linear(float a, float b, float c, float d, float x) {
        return mix(mix(a, b, 3. * x),
                   mix(b,
                       mix(c, d, 3. * (max(x, .66) - .66)),
                       3. * (clamp(x, .33, .66) - .33)),
                   step(0.33, x)
                );
    }
#endif

varying float hide;

void main() {
    // Initialize globals
    #pragma tangram: setup

    // discard hidden labels by collapsing into degenerate triangle
    if (a_shape.w == 0.) {
        gl_Position = vec4(0., 0., 0., 1.);
        return;
        // hide = 1.; // label debug testing
    }
    // else {
    //     hide = 0.;
    // }

    v_alpha_factor = 1.0;
    v_color = a_color;
    v_texcoord = a_texcoord; // UV from vertex

    #ifdef TANGRAM_HAS_SHADER_POINTS
        v_outline_color = a_outline_color;
        v_outline_edge = a_outline_edge;
        if (u_point_type == TANGRAM_POINT_TYPE_SHADER) { // shader point
            v_outline_color = a_outline_color;
            v_outline_edge = a_outline_edge;
            float size = abs(a_shape.x/128.); // radius in pixels
            v_texcoord = sign(a_shape.xy)*(size+1.)/(size);
            size+=2.;
            v_aa_offset=2./size;
        }
    #endif

    // Position
    vec4 position = u_modelView * vec4(a_position.xyz, 1.);

    // Apply positioning and scaling in screen space
    vec2 shape = a_shape.xy / 256.;                 // values have an 8-bit fraction
    vec2 offset = vec2(a_offset.x, -a_offset.y);    // flip y to make it point down

    float zoom = clamp(u_map_position.z - u_tile_origin.z, 0., 1.); //fract(u_map_position.z);
    float theta = a_shape.z / 4096.;

    #ifdef TANGRAM_CURVED_LABEL
        //TODO: potential bug? null is passed in for non-curved labels, otherwise the first offset will be 0
        if (a_offsets[0] != 0.){
            #ifdef TANGRAM_FADE_ON_ZOOM_IN
                v_alpha_factor *= clamp(1. + TANGRAM_FADE_ON_ZOOM_IN_RATE - TANGRAM_FADE_ON_ZOOM_IN_RATE * (u_map_position.z - u_tile_origin.z), 0., 1.);
            #endif

            vec4 angles_scaled = (PI / 16384.) * a_angles;
            vec4 pre_angles_scaled = (PI / 128.) * a_pre_angles;
            vec4 offsets_scaled = (1. / 64.) * a_offsets;

            float pre_angle = mix4linear(pre_angles_scaled[0], pre_angles_scaled[1], pre_angles_scaled[2], pre_angles_scaled[3], zoom);
            float angle = mix4linear(angles_scaled[0], angles_scaled[1], angles_scaled[2], angles_scaled[3], zoom);
            float offset_curve = mix4linear(offsets_scaled[0], offsets_scaled[1], offsets_scaled[2], offsets_scaled[3], zoom);

            shape = rotate2D(shape, pre_angle); // rotate in place
            shape.x += offset_curve;            // offset for curved label segment
            shape = rotate2D(shape, angle);     // rotate relative to curved label anchor
            shape += rotate2D(offset, theta);   // offset if specified in the scene file
        }
        else {
            shape = rotate2D(shape + offset, theta);
        }
    #else
        shape = rotate2D(shape + offset, theta);
    #endif

    // Fade in (if requested) based on time mesh has been visible.
    // Value passed to fragment shader in the v_alpha_factor varying
    #ifdef TANGRAM_FADE_IN_RATE
        if (u_tile_fade_in) {
            v_alpha_factor *= clamp(u_visible_time * TANGRAM_FADE_IN_RATE, 0., 1.);
        }
    #endif

    // Fade out when tile is zooming out, e.g. acting as proxy tiles
    // NB: this is mostly done to compensate for text label collision happening at the label's 1x zoom. As labels
    // in proxy tiles are scaled down, they begin to overlap, and the fade is a simple way to ease the transition.
    // Value passed to fragment shader in the v_alpha_factor varying
    #ifdef TANGRAM_FADE_ON_ZOOM_OUT
        v_alpha_factor *= clamp(1. + TANGRAM_FADE_ON_ZOOM_OUT_RATE * (u_map_position.z - u_tile_origin.z), 0., 1.);
    #endif

    // World coordinates for 3d procedural textures
    v_world_position = u_model * position;
    v_world_position.xy += shape * u_meters_per_pixel;
    v_world_position = wrapWorldPosition(v_world_position);

    // Modify position before camera projection
    #pragma tangram: position

    cameraProjection(position);

    #ifdef TANGRAM_LAYER_ORDER
        // +1 is to keep all layers including proxies > 0
        applyLayerOrder(a_position.w + u_tile_proxy_depth + 1., position);
    #endif

    // Apply pixel offset in screen-space
    // Multiply by 2 is because screen is 2 units wide Normalized Device Coords (and u_resolution device pixels wide)
    // Device pixel ratio adjustment is because shape is in logical pixels
    position.xy += shape * position.w * 2. * u_device_pixel_ratio / u_resolution;
    #ifdef TANGRAM_HAS_SHADER_POINTS
        if (u_point_type == TANGRAM_POINT_TYPE_SHADER) { // shader point
            // enlarge by 1px to catch missed MSAA fragments
            position.xy += sign(shape) * position.w * u_device_pixel_ratio / u_resolution;
        }
    #endif

    // Snap to pixel grid
    // Only applied to fully upright sprites/labels (not shader-drawn points), while panning is not active
    #ifdef TANGRAM_HAS_SHADER_POINTS
    if (!u_view_panning && (abs(theta) < TANGRAM_EPSILON) && u_point_type != TANGRAM_POINT_TYPE_SHADER) {
    #else
    if (!u_view_panning && (abs(theta) < TANGRAM_EPSILON)) {
    #endif
        vec2 position_fract = fract((((position.xy / position.w) + 1.) * .5) * u_resolution);
        vec2 position_snap = position.xy + ((step(0.5, position_fract) - position_fract) * position.w * 2. / u_resolution);

        // Animate the snapping to smooth the transition and make it less noticeable
        #ifdef TANGRAM_VIEW_PAN_SNAP_RATE
            position.xy = mix(position.xy, position_snap, clamp(u_view_pan_snap_timer * TANGRAM_VIEW_PAN_SNAP_RATE, 0., 1.));
        #else
            position.xy = position_snap;
        #endif
    }

    gl_Position = position;
}
