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

#ifdef TANGRAM_HAS_SHADER_POINTS
    varying vec4 v_outline_color;
    varying float v_outline_edge;
    varying float v_aa_offset;
#endif

#define TANGRAM_NORMAL vec3(0., 0., 1.)

#pragma tangram: camera
#pragma tangram: material
#pragma tangram: lighting
#pragma tangram: raster
#pragma tangram: global

#ifdef TANGRAM_HAS_SHADER_POINTS
    //l is the distance from the center to the fragment, R is the radius of the drawn point
    float _tangram_antialias(float l, float R){
        float low  = R - v_aa_offset;
        float high = R + v_aa_offset;
        return 1. - smoothstep(low, high, l);
    }
#endif

varying float hide;

void main (void) {
    // Initialize globals
    #pragma tangram: setup

    vec4 color = v_color;

    #ifdef TANGRAM_HAS_SHADER_POINTS
        // Only apply shader blocks to point, not to attached text (N.B.: for compatibility with ES)
        if (u_point_type == TANGRAM_POINT_TYPE_TEXTURE) { // sprite texture
            color *= texture2D(u_texture, v_texcoord);
        }
        else if (u_point_type == TANGRAM_POINT_TYPE_LABEL) { // label texture
            color = texture2D(u_texture, v_texcoord);
            color.rgb /= max(color.a, 0.001); // un-multiply canvas texture
        }
        else if (u_point_type == TANGRAM_POINT_TYPE_SHADER) { // shader point
            float outline_edge = v_outline_edge;
            vec4 outlineColor  = v_outline_color;
            // Distance to this fragment from the center.
            float l = length(v_texcoord);
            // Mask of outermost circle, either outline or point boundary.
            float outer_alpha  = _tangram_antialias(l, 1.);
            float fill_alpha   = _tangram_antialias(l, 1.-v_outline_edge*0.5) * color.a;
            float stroke_alpha = (outer_alpha - _tangram_antialias(l, 1.-v_outline_edge)) * outlineColor.a;

            // Apply alpha compositing with stroke 'over' fill.
            #ifdef TANGRAM_BLEND_ADD
                color.a = stroke_alpha + fill_alpha;
                color.rgb = color.rgb * fill_alpha + outlineColor.rgb * stroke_alpha;
            #else // TANGRAM_BLEND_OVERLAY (and fallback for not implemented blending modes)
                color.a = stroke_alpha + fill_alpha * (1. - stroke_alpha);
                color.rgb = mix(color.rgb * fill_alpha, outlineColor.rgb, stroke_alpha) / max(color.a, 0.001); // avoid divide by zero
            #endif
        }
    #else
        // If shader points not supported, assume label texture
        color = texture2D(u_texture, v_texcoord);
        color.rgb /= max(color.a, 0.001); // un-multiply canvas texture
    #endif

    // Shader blocks for color/filter are only applied for sprites, shader points, and standalone text,
    // NOT for text attached to a point (N.B.: for compatibility with ES)
    if (u_apply_color_blocks) {
        #pragma tangram: color
        #pragma tangram: filter
    }

    color.a *= v_alpha_factor;

    if (hide > 0.) {
        color.a *= 0.5;
        color.rgb = vec3(1., 0., 0.);
    }

    // If blending is off, use alpha discard as a lower-quality substitute
    #if !defined(TANGRAM_BLEND_OVERLAY) && !defined(TANGRAM_BLEND_INLAY) && !defined(TANGRAM_BLEND_ADD)
        if (color.a < TANGRAM_ALPHA_TEST) {
            discard;
        }
    #endif

    gl_FragColor = color;
}
