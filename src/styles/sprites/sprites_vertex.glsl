uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_map_position;
uniform vec3 u_tile_origin;
uniform float u_meters_per_pixel;

uniform mat4 u_model;
uniform mat4 u_modelView;

attribute vec3 a_position;
attribute vec4 a_shape;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

#pragma tangram: globals
#pragma tangram: camera

vec2 rotate2D(vec2 _st, float _angle) {
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
}

void main() {
    // Adds vertex shader support for feature selection
    #pragma tangram: feature-selection-vertex

    v_texcoord = a_texcoord;

    // Position
    vec4 position = u_modelView * vec4(a_position, 1.);
    vec4 shape = a_shape;

    #pragma tangram: position

    cameraProjection(position);

    // Apply scaling in screen space
    float zscale = fract(u_map_position.z) * (shape.w * 256. - 1.) + 1.;
    // float zscale = log(fract(u_map_position.z) + 1.) / log(2.) * (shape.w - 1.) + 1.;
    position.xy += rotate2D(shape.xy * 256. * zscale, radians(shape.z * 360.)) * 2. * position.w / u_resolution;

    gl_Position = position;
}
