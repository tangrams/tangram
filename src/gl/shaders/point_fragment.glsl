uniform vec2 u_resolution;

varying vec3 v_color;
varying vec2 v_texcoord;

#pragma tangram: globals

void main (void) {
    vec3 color = v_color;
    vec3 lighting = vec3(1.);

    // Simple threshold at dot radius
    // float len = length(v_texcoord);
    // if (len > 1.) {
    //     discard;
    // }
    // color *= (1. - smoothstep(.25, 1., len)) + 0.5;

    vec2 texcoord = v_texcoord;
    
    #pragma tangram: fragment

    gl_FragColor = vec4(color, 1.);
}
