uniform vec2 u_resolution;

varying vec4 v_color;
varying vec2 v_texcoord;

#ifndef FADE_RANGE
#define FADE_RANGE .15
#endif
#define FADE_START (1. - FADE_RANGE)

void main (void) {
    vec4 color = v_color;
    vec3 lighting = vec3(1.);

    // Fade alpha near circle edge
    vec2 uv = v_texcoord * 2. - 1.;
    float dist = length(uv);
    color.a = clamp(1. - (smoothstep(0., FADE_RANGE, (dist - FADE_START)) / FADE_RANGE), 0., 1.);

    #pragma tangram: color
    #pragma tangram: filter

    gl_FragColor = color;
}
