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
uniform float u_point_type;
uniform bool u_apply_color_blocks;

varying vec4 v_color;
varying vec2 v_texcoord;
varying vec4 v_world_position;
varying float v_alpha_factor;

#ifdef TANGRAM_SHADER_POINT
    varying vec4 v_outline_color;
    varying float v_outline_edge;
    varying float v_aa_factor;
#endif

#define TANGRAM_NORMAL vec3(0., 0., 1.)

#pragma tangram: camera
#pragma tangram: material
#pragma tangram: lighting
#pragma tangram: raster
#pragma tangram: global

#ifdef TANGRAM_SHADER_POINT
    // Draw an SDF-style point
    void drawPoint (inout vec4 color) {
        vec2 uv = v_texcoord * 2. - 1.; // fade alpha near circle edge
        float point_dist = length(uv);
        color = mix(
            color,
            v_outline_color,
            (1. - smoothstep(v_outline_edge - v_aa_factor, v_outline_edge + v_aa_factor, 1.-point_dist)) * step(.000001, v_outline_edge)
        );
        color.a = mix(color.a, 0., (smoothstep(1. - v_aa_factor, 1., point_dist)));
    }
#endif

void main (void) {
    // Initialize globals
    #pragma tangram: setup

    vec4 color = v_color;

    if (u_point_type == TANGRAM_POINT_TYPE_TEXTURE) { // sprite texture
        color *= texture2D(u_texture, v_texcoord);
    }
    else if (u_point_type == TANGRAM_POINT_TYPE_LABEL) { // label texture
        color = texture2D(u_texture, v_texcoord);
        color.rgb /= max(color.a, 0.001); // un-multiply canvas texture
    }
    #ifdef TANGRAM_SHADER_POINT
        else if (u_point_type == TANGRAM_POINT_TYPE_SHADER) { // shader point
            drawPoint(color); // draw a point
        }
    #endif

    // Shader blocks for color/filter are only applied for sprites, shader points, and standalone text,
    // NOT for text attached to a point (N.B.: for compatibility with ES)
    if (u_apply_color_blocks) {
        #pragma tangram: color
        #pragma tangram: filter
    }

    color.a *= v_alpha_factor;

    // If blending is off, use alpha discard as a lower-quality substitute
    #if !defined(TANGRAM_BLEND_OVERLAY) && !defined(TANGRAM_BLEND_INLAY)
        if (color.a < TANGRAM_ALPHA_TEST) {
            discard;
        }
    #endif

    gl_FragColor = color;
}
