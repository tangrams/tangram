uniform vec2 u_resolution;
uniform vec2 u_aspect;
uniform float u_meters_per_pixel;
uniform float u_time;
uniform float u_map_zoom;
uniform vec2 u_map_center;
uniform vec2 u_tile_origin;

varying vec2 v_texcoord;

// built-in uniforms for texture maps
#if defined(NUM_TEXTURES)
    uniform sampler2D u_textures[NUM_TEXTURES];
#else
    uniform sampler2D u_textures[1];
#endif

#pragma tangram: globals

void main (void) {
    vec4 color = texture2D(u_textures[0], v_texcoord);

    #pragma tangram: color
    #pragma tangram: filter

    // TODO: legacy, replace in existing styles
    // #pragma tangram: fragment

    gl_FragColor = color;
}
