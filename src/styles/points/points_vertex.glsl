uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_map_position;
uniform vec4 u_tile_origin;
uniform float u_tile_proxy_order_offset;
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

#ifdef TANGRAM_SHOW_HIDDEN_LABELS
    varying float v_label_hidden;
#endif

#define TANGRAM_PI 3.14159265359
#define TANGRAM_NORMAL vec3(0., 0., 1.)

#pragma tangram: attributes
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
    float mix4linear(vec4 v, float x) {
        x = clamp(x, 0., 1.);
        return mix(mix(v[0], v[1], 3. * x),
                   mix(v[1],
                       mix(v[2], v[3], 3. * (max(x, .66) - .66)),
                       3. * (clamp(x, .33, .66) - .33)),
                   step(0.33, x)
                );
    }
#endif

void main() {
    // Initialize globals
    #pragma tangram: setup

    // discard hidden labels by collapsing into degenerate triangle
    #ifndef TANGRAM_SHOW_HIDDEN_LABELS
        if (a_shape.w == 0.) {
            gl_Position = vec4(0., 0., 0., 1.);
            return;
        }
    #else
        // highlight hidden label in fragment shader for debugging
        if (a_shape.w == 0.) {
            v_label_hidden = 1.; // label debug testing
        }
        else {
            v_label_hidden = 0.;
        }
    #endif

    v_alpha_factor = 1.0;
    v_color = a_color;
    v_texcoord = a_texcoord; // UV from vertex attribute

    #ifdef TANGRAM_HAS_SHADER_POINTS
        v_outline_color = a_outline_color;
        v_outline_edge = a_outline_edge;

        if (u_point_type == TANGRAM_POINT_TYPE_SHADER) { // shader point
            // use point dimensions for UVs instead (ignore attribute), add antialiasing info for fragment shader
            float _size = abs(a_shape.x / 128.); // radius in pixels
            v_texcoord = sign(a_shape.xy) * (_size + 1.) / _size;
            _size += 2.;
            v_aa_offset = 2. / _size;
        }
    #endif

    // Position
    vec4 position = u_modelView * vec4(a_position.xyz, 1.);

    // Apply positioning and scaling in screen space
    vec2 _shape = a_shape.xy / 256.;                 // values have an 8-bit fraction
    vec2 _offset = vec2(a_offset.x, -a_offset.y);    // flip y to make it point down
    float _theta = a_shape.z / 4096.;

    #ifdef TANGRAM_CURVED_LABEL
        //TODO: potential bug? null is passed in for non-curved labels, otherwise the first offset will be 0
        if (a_offsets[0] != 0.){
            vec4 _angles_scaled = (TANGRAM_PI / 16384.) * a_angles;
            vec4 _pre_angles_scaled = (TANGRAM_PI / 128.) * a_pre_angles;
            vec4 _offsets_scaled = (1. / 64.) * a_offsets;

            float _zoom = clamp(u_map_position.z - u_tile_origin.z, 0., 1.); //fract(u_map_position.z);
            float _pre_angle = mix4linear(_pre_angles_scaled, _zoom);
            float _angle = mix4linear(_angles_scaled, _zoom);
            float _offset_curve = mix4linear(_offsets_scaled, _zoom);

            _shape = rotate2D(_shape, _pre_angle); // rotate in place
            _shape.x += _offset_curve;            // offset for curved label segment
            _shape = rotate2D(_shape, _angle);     // rotate relative to curved label anchor
            _shape += rotate2D(_offset, _theta);   // offset if specified in the scene file
        }
        else {
            _shape = rotate2D(_shape + _offset, _theta);
        }
    #else
        _shape = rotate2D(_shape + _offset, _theta);
    #endif

    // Fade in (if requested) based on time mesh has been visible.
    // Value passed to fragment shader in the v_alpha_factor varying
    #ifdef TANGRAM_FADE_IN_RATE
        if (u_tile_fade_in) {
            v_alpha_factor *= clamp(u_visible_time * TANGRAM_FADE_IN_RATE, 0., 1.);
        }
    #endif

    // World coordinates for 3d procedural textures
    v_world_position = u_model * position;
    v_world_position.xy += _shape * u_meters_per_pixel;
    v_world_position = wrapWorldPosition(v_world_position);

    // Modify position before camera projection
    #pragma tangram: position

    cameraProjection(position);

    #ifdef TANGRAM_LAYER_ORDER
        // +1 is to keep all layers including proxies > 0
        applyLayerOrder(a_position.w + u_tile_proxy_order_offset + 1., position);
    #endif

    // Apply pixel offset in screen-space
    // Multiply by 2 is because screen is 2 units wide Normalized Device Coords (and u_resolution device pixels wide)
    // Device pixel ratio adjustment is because shape is in logical pixels
    position.xy += _shape * position.w * 2. * u_device_pixel_ratio / u_resolution;
    #ifdef TANGRAM_HAS_SHADER_POINTS
        if (u_point_type == TANGRAM_POINT_TYPE_SHADER) { // shader point
            // enlarge by 1px to catch missed MSAA fragments
            position.xy += sign(_shape) * position.w * u_device_pixel_ratio / u_resolution;
        }
    #endif

    // Snap to pixel grid
    // Only applied to fully upright sprites/labels (not shader-drawn points), while panning is not active
    #ifdef TANGRAM_HAS_SHADER_POINTS
    if (!u_view_panning && (abs(_theta) < TANGRAM_EPSILON) && u_point_type != TANGRAM_POINT_TYPE_SHADER) {
    #else
    if (!u_view_panning && (abs(_theta) < TANGRAM_EPSILON)) {
    #endif
        vec2 _position_fract = fract((((position.xy / position.w) + 1.) * .5) * u_resolution);
        vec2 _position_snap = position.xy + ((step(0.5, _position_fract) - _position_fract) * position.w * 2. / u_resolution);

        // Animate the snapping to smooth the transition and make it less noticeable
        #ifdef TANGRAM_VIEW_PAN_SNAP_RATE
            position.xy = mix(position.xy, _position_snap, clamp(u_view_pan_snap_timer * TANGRAM_VIEW_PAN_SNAP_RATE, 0., 1.));
        #else
            position.xy = _position_snap;
        #endif
    }

    gl_Position = position;
}
