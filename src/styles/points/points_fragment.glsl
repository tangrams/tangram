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

#ifdef TANGRAM_SHOW_HIDDEN_LABELS
    varying float v_label_hidden;
#endif

#define TANGRAM_NORMAL vec3(0., 0., 1.)

#pragma tangram: attributes
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
            // Mask of outermost circle, either outline or point boundary
            float _d = length(v_texcoord); // distance to this fragment from the point center
            float _outer_alpha = _tangram_antialias(_d, 1.);
            float _fill_alpha = _tangram_antialias(_d, 1. - (v_outline_edge * 0.5)) * color.a;
            float _stroke_alpha = (_outer_alpha - _tangram_antialias(_d, 1. - v_outline_edge)) * v_outline_color.a;

            // Apply alpha compositing with stroke 'over' fill.
            #ifdef TANGRAM_BLEND_ADD
                color.a = _stroke_alpha + _fill_alpha;
                color.rgb = color.rgb * _fill_alpha + v_outline_color.rgb * _stroke_alpha;
            #else // TANGRAM_BLEND_OVERLAY (and fallback for not implemented blending modes)
                color.a = _stroke_alpha + _fill_alpha * (1. - _stroke_alpha);
                color.rgb = mix(color.rgb * _fill_alpha, v_outline_color.rgb, _stroke_alpha) / max(color.a, 0.001); // avoid divide by zero
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

    // highlight hidden label in fragment shader for debugging
    #ifdef TANGRAM_SHOW_HIDDEN_LABELS
        if (v_label_hidden > 0.) {
            color.a *= 0.5;
            color.rgb = vec3(1., 0., 0.);
        }
    #endif

    // Use alpha test as a lower-quality substitute
    // For opaque and translucent: avoid transparent pixels writing to depth buffer, obscuring geometry underneath
    // For multiply: avoid transparent pixels multiplying geometry underneath to zero/full black
    #if defined(TANGRAM_BLEND_OPAQUE) || defined(TANGRAM_BLEND_TRANSLUCENT) || defined(TANGRAM_BLEND_MULTIPLY)
        if (color.a < TANGRAM_ALPHA_TEST) {
            discard;
        }
    #endif

    // Make points more visible in wireframe debug mode
    #ifdef TANGRAM_WIREFRAME
        color = vec4(vec3(0.5), 1.); // use gray outline for textured points
        #ifdef TANGRAM_HAS_SHADER_POINTS
            if (u_point_type == TANGRAM_POINT_TYPE_SHADER) {
                color = vec4(v_color.rgb, 1.); // use original vertex color outline for shader points
            }
        #endif
    #endif

    gl_FragColor = color;
}
