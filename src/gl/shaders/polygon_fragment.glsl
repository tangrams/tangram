uniform vec2 u_resolution;
uniform vec2 u_aspect;
uniform float u_time;

varying vec3 v_color;

#if defined(EFFECT_NOISE_TEXTURE)
    varying vec3 v_position;

    #pragma glslify: cnoise = require(glsl-noise/classic/3d)
#endif

void main (void) {

    // Spotlight effect
    #if defined(EFFECT_SPOTLIGHT)
        vec2 position = gl_FragCoord.xy / u_resolution.xy;  // scale coords to [0.0, 1.0]
        position = position * 2.0 - 1.0;                    // scale coords to [-1.0, 1.0]
        position *= u_aspect;                               // correct aspect ratio

        vec3 color = v_color * max(1.0 - distance(position, vec2(0.0, 0.0)), 0.2);
    #else
        vec3 color = v_color;
    #endif

    // Mutate colors by screen position or time
    #if defined(EFFECT_COLOR_BLEED)
        color += vec3(gl_FragCoord.x / u_resolution.x, 0.0, gl_FragCoord.y / u_resolution.y);
        color.r += sin(u_time / 3.0);
    #endif

    // Mutate color by 3d noise
    #if defined (EFFECT_NOISE_TEXTURE)
        #if defined(EFFECT_NOISE_ANIMATABLE) && defined(EFFECT_NOISE_ANIMATED)
            color *= (abs(cnoise((v_position + vec3(u_time * 5., u_time * 7.5, u_time * 10.)) / 10.0)) / 4.0) + 0.75;
        #endif
        #ifndef EFFECT_NOISE_ANIMATABLE
            color *= (abs(cnoise(v_position / 10.0)) / 4.0) + 0.75;
        #endif
    #endif

    gl_FragColor = vec4(color, 1.0);
}
