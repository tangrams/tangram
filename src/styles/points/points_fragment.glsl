uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_map_position;
uniform vec3 u_tile_origin;
uniform float u_meters_per_pixel;
uniform float u_device_pixel_ratio;

uniform mat3 u_normalMatrix;
uniform mat3 u_inverseNormalMatrix;

uniform sampler2D u_texture;

varying vec4 v_color;
varying vec2 v_texcoord;
varying vec4 v_world_position;

#define TANGRAM_NORMAL vec3(0., 0., 1.)

// Alpha discard threshold (substitute for alpha blending)
#ifndef TANGRAM_ALPHA_DISCARD
#define TANGRAM_ALPHA_DISCARD 0.5
#endif

// Alpha fade range for edges of points
#ifndef TANGRAM_FADE_RANGE
#define TANGRAM_FADE_RANGE .15
#endif
#define TANGRAM_FADE_START (1. - TANGRAM_FADE_RANGE)

#pragma tangram: camera
#pragma tangram: material
#pragma tangram: lighting
#pragma tangram: global

void main (void) {
    // Initialize globals
    #pragma tangram: setup

    vec4 color = v_color;

    // Apply a texture
    #ifdef TANGRAM_POINT_TEXTURE
        color *= texture2D(u_texture, v_texcoord);
    // Draw a point
    #else
        // Fade alpha near circle edge
        vec2 uv = v_texcoord * 2. - 1.;
        float point_dist = length(uv);
        color.a = clamp(1. - (smoothstep(0., TANGRAM_FADE_RANGE, (point_dist - TANGRAM_FADE_START)) / TANGRAM_FADE_RANGE), 0., 1.);
    #endif

    // If blending is off, use alpha discard as a lower-quality substitute
    #if !defined(TANGRAM_BLEND_OVERLAY) && !defined(TANGRAM_BLEND_INLAY)
        if (color.a < TANGRAM_ALPHA_DISCARD) {
            discard;
        }
    #endif

    // Manually un-multiply alpha, for cases where texture has pre-multiplied alpha
    #ifdef TANGRAM_UNMULTIPLY_ALPHA
        color.rgb /= max(color.a, 0.001);
    #endif

    #pragma tangram: color
    #pragma tangram: filter

    gl_FragColor = color;
}
