uniform vec2 u_resolution;

varying vec3 v_color;
varying vec2 v_texcoord;

void main (void) {
    vec3 color = v_color;

    // Simple threshold at dot radius
    float len = length(v_texcoord);
    if (len > 1.) {
        discard;
    }
    color *= (1. - smoothstep(.25, 1., len)) + 0.5;

    #if defined(EFFECT_SCREEN_COLOR)
        // Mutate colors by screen position
        color += vec3(gl_FragCoord.x / u_resolution.x, 0.0, gl_FragCoord.y / u_resolution.y);
    #endif

    gl_FragColor = vec4(color, 1.);
}
