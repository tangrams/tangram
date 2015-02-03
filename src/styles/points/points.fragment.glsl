uniform vec2 u_resolution;

varying vec4 v_color;
varying vec2 v_texcoord;

void main (void) {
    vec4 color = v_color;
    vec3 lighting = vec3(1.);

    // Simple threshold at dot radius
    vec2 uv = v_texcoord * 2. - 1.;
    float len = length(uv);
    if (len > 1.) {
        discard;
    }
    color.rgb *= (1. - smoothstep(.25, 1., len)) + 0.5;

    #pragma tangram: fragment

    gl_FragColor = color;
}
