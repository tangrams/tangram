uniform vec2 u_resolution;
uniform vec2 u_aspect;
uniform float u_meters_per_pixel;
uniform float u_time;
uniform float u_map_zoom;
uniform vec2 u_map_center;
uniform vec2 u_tile_origin;

varying vec4 v_color;
varying vec2 v_texcoord;

#pragma tangram: globals

void main (void) {
    vec4 color;

    color = texture2D(label_atlas, v_texcoord);

    // if (color.a < u_alpha_discard) {
    //     discard;
    // }

    #pragma tangram: fragment

    gl_FragColor = color;
}
