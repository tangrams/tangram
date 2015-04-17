uniform mat4 u_modelView;

attribute vec3 a_position;
attribute vec2 a_texcoord;
attribute vec4 a_color;

varying vec4 v_color;
varying vec2 v_texcoord;

#pragma tangram: globals
#pragma tangram: camera

void main() {
    // Adds vertex shader support for feature selection
    #pragma tangram: feature-selection-vertex

    vec4 position = u_modelView * vec4(a_position, 1.);

    #pragma tangram: position

    v_color = a_color;
    v_texcoord = a_texcoord;

    cameraProjection(position);

    gl_Position = position;
}
