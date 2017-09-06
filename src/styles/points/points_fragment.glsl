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

uniform sampler2D u_label_texture;
varying float v_sampler;

varying vec4 v_color;
varying vec2 v_texcoord;
varying vec4 v_world_position;
varying float v_alpha_factor;

#ifdef TANGRAM_SHADER_POINT
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

#ifdef TANGRAM_SHADER_POINT
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

    if (v_sampler == 0.) { // sprite sampler
        #ifdef TANGRAM_TEXTURE_POINT
            color *= texture2D(u_texture, v_texcoord); // draw sprite
        #else
            {//Avoid name clashing with user-provided code
                float outline_edge = v_outline_edge;
                vec4 outlineColor  = v_outline_color;
                // Distance to this fragment from the center.
                float l = length(v_texcoord);
                // Mask of outermost circle, either outline or point boundary.
                float outer_alpha  = _tangram_antialias(l, 1.);
                float fill_alpha   = _tangram_antialias(l, 1.-v_outline_edge*0.5) * color.a;
                float stroke_alpha = (outer_alpha - _tangram_antialias(l, 1.-v_outline_edge)) * outlineColor.a;
                // Apply alpha compositing with stroke 'over' fill.
                color.a = stroke_alpha + fill_alpha * (1. - stroke_alpha);
                color.rgb = mix(color.rgb * fill_alpha, outlineColor.rgb, stroke_alpha) / color.a;
            }
        #endif

        // Only apply shader blocks to point, not to attached text (N.B.: for compatibility with ES)
        #pragma tangram: color
        #pragma tangram: filter
    }
    else { // label sampler
        color = texture2D(u_label_texture, v_texcoord);
        color.rgb /= max(color.a, 0.001); // un-multiply canvas texture
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
