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
attribute vec3 a_normal;
attribute vec4 a_color;
attribute float a_layer;
attribute vec2 a_texcoord;

varying vec4 v_color;
varying vec2 v_texcoord;

#pragma tangram: globals
#pragma tangram: camera

void main() {
    // Position
    vec4 position = u_modelView * vec4(a_position, 1.);

    v_color = a_color;
    v_texcoord = a_texcoord;

    // Style-specific vertex transformations
    #pragma tangram: vertex

    // Camera
    cameraProjection(position);

    // Re-orders depth so that higher numbered layers are "force"-drawn over lower ones
    reorderLayers(a_layer + u_order_min, u_order_range, position);

    gl_Position = position;
}
