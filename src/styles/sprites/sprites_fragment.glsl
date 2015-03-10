uniform vec2 u_resolution;
uniform vec2 u_aspect;
uniform float u_meters_per_pixel;
uniform float u_time;
uniform float u_map_zoom;
uniform vec2 u_map_center;
uniform vec2 u_tile_origin;

uniform sampler2D u_texture;

varying vec2 v_texcoord;

#pragma tangram: globals

void main (void) {
    vec4 color = texture2D(u_texture, v_texcoord);

    #pragma tangram: color
    #pragma tangram: filter

    gl_FragColor = color;
}
