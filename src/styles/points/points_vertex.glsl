uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_map_position;
uniform vec3 u_tile_origin;
uniform float u_meters_per_pixel;

uniform mat4 u_model;
uniform mat4 u_modelView;

attribute vec3 a_position;
attribute vec4 a_shape;
attribute vec4 a_color;
attribute vec2 a_texcoord;
#ifdef TANGRAM_ORDER_ATTRIBUTE
    attribute float a_layer;
#endif

varying vec4 v_color;
varying vec2 v_texcoord;
varying vec4 v_world_position;

#pragma tangram: camera
#pragma tangram: global

vec2 rotate2D(vec2 _st, float _angle) {
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
}

void main() {
    // Adds vertex shader support for feature selection
    #pragma tangram: feature-selection-vertex

    v_color = a_color;
    v_texcoord = a_texcoord;

    // Apply scaling in screen space
    vec4 shape = a_shape;
    float zscale = fract(u_map_position.z) * (shape.w * 256. - 1.) + 1.;
    // float zscale = log(fract(u_map_position.z) + 1.) / log(2.) * (shape.w - 1.) + 1.;
    vec2 shape_offset = shape.xy * 256. * zscale;

    // Position
    vec4 position = u_modelView * vec4(a_position, 1.);

    // World coordinates for 3d procedural textures
    v_world_position = u_model * vec4(a_position, 1.);
    v_world_position.xy += shape_offset * u_meters_per_pixel;
    #if defined(TANGRAM_WORLD_POSITION_WRAP)
        v_world_position.xy -= world_position_anchor;
    #endif

    // Modify position before camera projection
    #pragma tangram: position

    cameraProjection(position);

    #ifdef TANGRAM_ORDER_ATTRIBUTE
        applyLayerOrder(a_layer, position);
    #endif

    position.xy += rotate2D(shape_offset, radians(shape.z * 360.)) * 2. * position.w / u_resolution;

    gl_Position = position;
}
