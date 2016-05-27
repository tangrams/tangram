uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_map_position;
uniform vec4 u_tile_origin;
uniform float u_meters_per_pixel;
uniform float u_device_pixel_ratio;

uniform mat3 u_normalMatrix;
uniform mat3 u_inverseNormalMatrix;

uniform sampler2D u_texture;

#ifdef TANGRAM_MULTI_SAMPLER
uniform sampler2D u_label_texture;
varying float v_sampler;
#endif

varying vec4 v_color;
varying vec2 v_texcoord;
varying vec4 v_world_position;

#define TANGRAM_NORMAL vec3(0., 0., 1.)

// Alpha discard threshold (substitute for alpha blending)
#ifndef TANGRAM_ALPHA_TEST
#define TANGRAM_ALPHA_TEST 0.5
#endif

// Alpha fade range for edges of points
#ifndef TANGRAM_FADE_RANGE
#define TANGRAM_FADE_RANGE .15
#endif
#define TANGRAM_FADE_START (1. - TANGRAM_FADE_RANGE)

#pragma tangram: camera
#pragma tangram: material
#pragma tangram: lighting
#pragma tangram: raster
#pragma tangram: global

void main (void) {
    // Initialize globals
    #pragma tangram: setup

    vec4 color = v_color;

    #ifdef TANGRAM_MULTI_SAMPLER
    if (v_sampler == 0.) { // sprite sampler
    #endif
        #ifdef TANGRAM_POINT_TEXTURE
            // Draw sprite
            color *= texture2D(u_texture, v_texcoord);
        #else
            // Draw a point
            vec2 uv = v_texcoord * 2. - 1.; // fade alpha near circle edge
            float point_dist = length(uv);
            color.a = clamp(color.a - (smoothstep(0., TANGRAM_FADE_RANGE, (point_dist - TANGRAM_FADE_START)) / TANGRAM_FADE_RANGE), 0., color.a);
        #endif
    #ifdef TANGRAM_MULTI_SAMPLER
    }
    else { // label sampler
        color = texture2D(u_label_texture, v_texcoord);
        color.rgb /= max(color.a, 0.001); // un-multiply canvas texture
    }
    #endif

    // Manually un-multiply alpha, for cases where texture has pre-multiplied alpha
    #ifdef TANGRAM_UNMULTIPLY_ALPHA
        color.rgb /= max(color.a, 0.001);
    #endif

    // If blending is off, use alpha discard as a lower-quality substitute
    #if !defined(TANGRAM_BLEND_OVERLAY) && !defined(TANGRAM_BLEND_INLAY)
        if (color.a < TANGRAM_ALPHA_TEST) {
            discard;
        }
    #endif

    #pragma tangram: color

    // Fade out when tile is zooming out, e.g. acting as proxy tiles
    // NB: this is mostly done to compensate for text label collision happening at the label's 1x zoom. As labels
    // in proxy tiles are scaled down, they begin to overlap, and the fade is a simple way to ease the transition.
    #ifdef TANGRAM_FADE_ON_ZOOM_OUT
        color.a *= clamp(1. - TANGRAM_FADE_ON_ZOOM_OUT_RATE * (u_tile_origin.z - u_map_position.z), 0., 1.);
    #endif

    #pragma tangram: filter

    gl_FragColor = color;
}
