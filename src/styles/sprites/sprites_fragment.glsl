uniform vec2 u_resolution;
uniform float u_meters_per_pixel;
uniform float u_device_pixel_ratio;
uniform float u_time;
uniform vec3 u_map_position;
uniform vec3 u_tile_origin;

uniform sampler2D u_texture;

varying vec2 v_texcoord;

#pragma tangram: globals

void main (void) {
    vec4 color = texture2D(u_texture, v_texcoord);

    #pragma tangram: color
    #pragma tangram: filter

    gl_FragColor = color;
}
