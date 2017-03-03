uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_map_position;
uniform vec4 u_tile_origin;
uniform float u_meters_per_pixel;
uniform float u_device_pixel_ratio;
uniform float u_visible_time;

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
varying float v_alpha_factor;
varying float v_aa_factor;

#ifdef TANGRAM_SHADER_POINT
    varying vec4 v_outline_color;
    varying float v_outline_edge;
#endif

#define TANGRAM_NORMAL vec3(0., 0., 1.)

// Alpha discard threshold (substitute for alpha blending)
#ifndef TANGRAM_ALPHA_TEST
#define TANGRAM_ALPHA_TEST 0.5
#endif

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
        #ifdef TANGRAM_TEXTURE_POINT
            // Draw sprite
            color *= texture2D(u_texture, v_texcoord);
        #else
            // Draw a point
            vec2 uv = v_texcoord * 2. - 1.; // fade alpha near circle edge
            float point_dist = length(uv);
            color = mix(
                color,
                v_outline_color,
                (1. - smoothstep(v_outline_edge - v_aa_factor, v_outline_edge + v_aa_factor, 1.-point_dist)) * step(.000001, v_outline_edge)
            );
            color.a = mix(color.a, 0., (smoothstep(1. - v_aa_factor, 1., point_dist)));

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

    color.a *= v_alpha_factor;

    #pragma tangram: filter

    gl_FragColor = color;
}
