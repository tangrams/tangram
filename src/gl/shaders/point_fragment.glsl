uniform vec2 u_resolution;

varying vec3 fcolor;
varying vec2 ftexcoord;

void main (void) {
    vec4 color = vec4(fcolor, 1.);

    // if (length(ftexcoord.xy) > 10.) {
    //     // color = vec4(0., 0., 0., 0.);
    //     discard;
    // }

    float len = length(ftexcoord);
    if (len > 1.) {
        discard;
    }
    color.rgb *= (1. - smoothstep(.25, 1., len)) + 0.5;
    // color.a = (1. - smoothstep(2.5, 10., len)) + 0.25;

    #if defined(EFFECT_SCREEN_COLOR)
        // Mutate colors by screen position
        color.rgb += vec3(gl_FragCoord.x / u_resolution.x, 0.0, gl_FragCoord.y / u_resolution.y);
    #endif

    gl_FragColor = color;
}
