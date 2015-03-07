uniform vec2 u_resolution;
uniform vec2 u_aspect;
uniform float u_time;
uniform float u_map_zoom;
uniform vec2 u_map_center;
uniform vec2 u_tile_origin;
uniform float u_meters_per_pixel;
uniform float u_order_min;
uniform float u_order_range;

uniform mat4 u_model;
uniform mat4 u_modelView;

attribute vec3 a_position;
attribute vec4 a_shape;
attribute vec2 a_texcoord;
attribute float a_layer;

varying vec2 v_texcoord;

#if defined(FEATURE_SELECTION)
    attribute vec4 a_selection_color;
    varying vec4 v_selection_color;
#endif

#pragma tangram: globals
#pragma tangram: camera

vec2 rotate2D(vec2 _st, float _angle) {
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
}

void main() {
    // Selection pass-specific rendering
    #if defined(FEATURE_SELECTION)
        if (a_selection_color.rgb == vec3(0.)) {
            // Discard by forcing invalid triangle if we're in the feature
            // selection pass but have no selection info
            // TODO: in some cases we may actually want non-selectable features to occlude selectable ones?
            gl_Position = vec4(0., 0., 0., 1.);
            return;
        }
        v_selection_color = a_selection_color;
    #endif

    v_texcoord = a_texcoord;

    // Position
    vec4 position = u_modelView * vec4(a_position, 1.);
    vec4 shape = a_shape;

    // TODO: legacy, replace in existing styles
    // #pragma tangram: vertex
    #pragma tangram: position

    cameraProjection(position);

    // Apply scaling in screen space
    float zscale = fract(u_map_zoom) * (shape.w * 256. - 1.) + 1.;
    // float zscale = log(fract(u_map_zoom) + 1.) / log(2.) * (shape.w - 1.) + 1.;
    position.xy += rotate2D(shape.xy * 128. * zscale, radians(shape.z * 360.)) * 2. * position.w / u_resolution;

    // Re-orders depth so that higher numbered layers are "force"-drawn over lower ones
    reorderLayers(a_layer + u_order_min, u_order_range, position);

    gl_Position = position;
}
