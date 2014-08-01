uniform mat4 u_tile_view;
uniform mat4 u_meter_view;
uniform float u_num_layers;

attribute vec3 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_color;
attribute float a_layer;

varying vec3 v_color;
varying vec2 v_texcoord;

// Imported functions
#pragma glslify: calculateZ = require(./modules/depth_scale)

#pragma tangram: globals

void main() {
    vec4 position = u_meter_view * u_tile_view * vec4(a_position, 1.);

    #pragma tangram: vertex

    v_color = a_color;
    v_texcoord = a_texcoord;

    position.z = calculateZ(position.z, a_layer, u_num_layers, 256.);

    gl_Position = position;
}
