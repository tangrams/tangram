// Generated from fragment.glsl, don't edit
GLRenderer.fragment_shader_source = 
"uniform vec2 resolution;\n" +
"uniform float time;\n" +
"\n" +
"varying vec3 fcolor;\n" +
"\n" +
"// http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl\n" +
"// float rand (vec2 co) {\n" +
"//    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n" +
"// }\n" +
"\n" +
"void main (void) {\n" +
"    vec2 position = gl_FragCoord.xy / resolution.xy;    // scale coords to [0.0, 1.0]\n" +
"    position = position * 2.0 - 1.0;                    // scale coords to [-1.0, 1.0]\n" +
"    position.y *= resolution.y / resolution.x;          // correct aspect ratio\n" +
"\n" +
"    vec3 color = fcolor;\n" +
"    // vec3 color = fcolor * max(1.0 - distance(position, vec2(0.0, 0.0)), 0.15);\n" +
"    // vec3 color = fcolor * (1.0 - dot(normalize(vec3(rand(gl_FragCoord.xy * 0.01) * 10.0, 0.0, -1.0)), vec3(0, 0, 1.0)));\n" +
"\n" +
"    // Mutate colors by screen position or time\n" +
"    // color += vec3(gl_FragCoord.x / resolution.x, 0.0, gl_FragCoord.y / resolution.y);\n" +
"    // color.r += sin(time);\n" +
"\n" +
"    gl_FragColor = vec4(color, 1.0);\n" +
"    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n" +
"}\n" +
"";
