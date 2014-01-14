uniform vec2 resolution;
// uniform vec2 map_center;

varying vec3 fcolor;

// http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
// float rand (vec2 co) {
//    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
// }

void main (void) {
    vec2 position = gl_FragCoord.xy / resolution.xy;    // scale coords to [0.0, 1.0]
    position = position * 2.0 - 1.0;                    // scale coords to [-1.0, 1.0]
    position.y *= resolution.y / resolution.x;          // correct aspect ratio

    vec3 color = fcolor;
    // vec3 color = fcolor * max(1.0 - distance(position, vec2(0.0, 0.0)), 0.15);
    // vec3 color = fcolor * (1.0 - dot(normalize(vec3(rand(gl_FragCoord.xy * 0.01) * 10.0, 0.0, -1.0)), vec3(0, 0, 1.0)));

    // Mutate colors by screen position
    // color += vec3(gl_FragCoord.x / resolution.x, 0.0, gl_FragCoord.y / resolution.y);

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
