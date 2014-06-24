uniform vec2 resolution;
uniform float time;

varying vec3 fcolor;

#if defined(EFFECT_NOISE_TEXTURE)
    varying vec3 fposition;

    #pragma glslify: cnoise = require(glsl-noise/classic/3d)
#endif

void main (void) {

    #if defined(EFFECT_SPOTLIGHT)
    // Spotlight effect
        vec2 position = gl_FragCoord.xy / resolution.xy;    // scale coords to [0.0, 1.0]
        position = position * 2.0 - 1.0;                    // scale coords to [-1.0, 1.0]
        position.y *= resolution.y / resolution.x;          // correct aspect ratio

        vec3 color = fcolor * max(1.0 - distance(position, vec2(0.0, 0.0)), 0.2);
    #else
        vec3 color = fcolor;
    #endif

    #if defined(EFFECT_COLOR_BLEED)
        // Mutate colors by screen position or time
        color += vec3(gl_FragCoord.x / resolution.x, 0.0, gl_FragCoord.y / resolution.y);
        color.r += sin(time / 3.0);
    #endif

    // Mutate color by 3d noise
    #if defined (EFFECT_NOISE_TEXTURE)
        #if defined(EFFECT_NOISE_ANIMATABLE) && defined(EFFECT_NOISE_ANIMATED)
            color *= (abs(cnoise((fposition + vec3(time * 5., time * 7.5, time * 10.)) / 10.0)) / 4.0) + 0.75;
        #endif
        #ifndef EFFECT_NOISE_ANIMATABLE
            color *= (abs(cnoise(fposition / 10.0)) / 4.0) + 0.75;
        #endif
    #endif

    gl_FragColor = vec4(color, 1.0);
}
