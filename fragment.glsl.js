// Generated from fragment.glsl, don't edit
GLRenderer.fragment_shader_source = 
"uniform vec2 resolution;\n" +
"uniform float time;\n" +
"uniform vec2 tile_min;\n" +
"\n" +
"varying vec3 fposition;\n" +
"varying vec3 fcolor;\n" +
"\n" +
"// http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl\n" +
"// float rand (vec2 co) {\n" +
"//    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n" +
"// }\n" +
"\n" +
"// Noise functions from: https://github.com/ashima/webgl-noise\n" +
"vec3 mod289(vec3 x) {\n" +
"    return x - floor(x * (1.0 / 289.0)) * 289.0;\n" +
"}\n" +
"\n" +
"vec4 mod289(vec4 x) {\n" +
"    return x - floor(x * (1.0 / 289.0)) * 289.0;\n" +
"}\n" +
"\n" +
"vec4 permute(vec4 x) {\n" +
"    return mod289(((x*34.0)+1.0)*x);\n" +
"}\n" +
"\n" +
"vec4 taylorInvSqrt(vec4 r) {\n" +
"    return 1.79284291400159 - 0.85373472095314 * r;\n" +
"}\n" +
"\n" +
"vec3 fade(vec3 t) {\n" +
"    return t*t*t*(t*(t*6.0-15.0)+10.0);\n" +
"}\n" +
"\n" +
"float snoise(vec3 v) {\n" +
"    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n" +
"    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n" +
"\n" +
"    // First corner\n" +
"    vec3 i  = floor(v + dot(v, C.yyy) );\n" +
"    vec3 x0 =   v - i + dot(i, C.xxx) ;\n" +
"\n" +
"    // Other corners\n" +
"    vec3 g = step(x0.yzx, x0.xyz);\n" +
"    vec3 l = 1.0 - g;\n" +
"    vec3 i1 = min( g.xyz, l.zxy );\n" +
"    vec3 i2 = max( g.xyz, l.zxy );\n" +
"\n" +
"    //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n" +
"    //   x1 = x0 - i1  + 1.0 * C.xxx;\n" +
"    //   x2 = x0 - i2  + 2.0 * C.xxx;\n" +
"    //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n" +
"    vec3 x1 = x0 - i1 + C.xxx;\n" +
"    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n" +
"    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n" +
"\n" +
"    // Permutations\n" +
"    i = mod289(i);\n" +
"    vec4 p = permute( permute( permute(\n" +
"    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n" +
"    + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n" +
"    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n" +
"\n" +
"    // Gradients: 7x7 points over a square, mapped onto an octahedron.\n" +
"    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n" +
"    float n_ = 0.142857142857; // 1.0/7.0\n" +
"    vec3  ns = n_ * D.wyz - D.xzx;\n" +
"\n" +
"    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n" +
"\n" +
"    vec4 x_ = floor(j * ns.z);\n" +
"    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n" +
"\n" +
"    vec4 x = x_ *ns.x + ns.yyyy;\n" +
"    vec4 y = y_ *ns.x + ns.yyyy;\n" +
"    vec4 h = 1.0 - abs(x) - abs(y);\n" +
"\n" +
"    vec4 b0 = vec4( x.xy, y.xy );\n" +
"    vec4 b1 = vec4( x.zw, y.zw );\n" +
"\n" +
"    //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n" +
"    //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n" +
"    vec4 s0 = floor(b0)*2.0 + 1.0;\n" +
"    vec4 s1 = floor(b1)*2.0 + 1.0;\n" +
"    vec4 sh = -step(h, vec4(0.0));\n" +
"\n" +
"    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n" +
"    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n" +
"\n" +
"    vec3 p0 = vec3(a0.xy,h.x);\n" +
"    vec3 p1 = vec3(a0.zw,h.y);\n" +
"    vec3 p2 = vec3(a1.xy,h.z);\n" +
"    vec3 p3 = vec3(a1.zw,h.w);\n" +
"\n" +
"    //Normalise gradients\n" +
"    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n" +
"    p0 *= norm.x;\n" +
"    p1 *= norm.y;\n" +
"    p2 *= norm.z;\n" +
"    p3 *= norm.w;\n" +
"\n" +
"    // Mix final noise value\n" +
"    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n" +
"    m = m * m;\n" +
"    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );\n" +
"}\n" +
"\n" +
"// Classic Perlin noise\n" +
"float cnoise(vec3 P) {\n" +
"    vec3 Pi0 = floor(P); // Integer part for indexing\n" +
"    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1\n" +
"    Pi0 = mod289(Pi0);\n" +
"    Pi1 = mod289(Pi1);\n" +
"    vec3 Pf0 = fract(P); // Fractional part for interpolation\n" +
"    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n" +
"    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n" +
"    vec4 iy = vec4(Pi0.yy, Pi1.yy);\n" +
"    vec4 iz0 = Pi0.zzzz;\n" +
"    vec4 iz1 = Pi1.zzzz;\n" +
"\n" +
"    vec4 ixy = permute(permute(ix) + iy);\n" +
"    vec4 ixy0 = permute(ixy + iz0);\n" +
"    vec4 ixy1 = permute(ixy + iz1);\n" +
"\n" +
"    vec4 gx0 = ixy0 * (1.0 / 7.0);\n" +
"    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n" +
"    gx0 = fract(gx0);\n" +
"    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n" +
"    vec4 sz0 = step(gz0, vec4(0.0));\n" +
"    gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n" +
"    gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n" +
"\n" +
"    vec4 gx1 = ixy1 * (1.0 / 7.0);\n" +
"    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n" +
"    gx1 = fract(gx1);\n" +
"    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n" +
"    vec4 sz1 = step(gz1, vec4(0.0));\n" +
"    gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n" +
"    gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n" +
"\n" +
"    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n" +
"    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n" +
"    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n" +
"    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n" +
"    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n" +
"    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n" +
"    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n" +
"    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n" +
"\n" +
"    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n" +
"    g000 *= norm0.x;\n" +
"    g010 *= norm0.y;\n" +
"    g100 *= norm0.z;\n" +
"    g110 *= norm0.w;\n" +
"    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n" +
"    g001 *= norm1.x;\n" +
"    g011 *= norm1.y;\n" +
"    g101 *= norm1.z;\n" +
"    g111 *= norm1.w;\n" +
"\n" +
"    float n000 = dot(g000, Pf0);\n" +
"    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n" +
"    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n" +
"    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n" +
"    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n" +
"    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n" +
"    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n" +
"    float n111 = dot(g111, Pf1);\n" +
"\n" +
"    vec3 fade_xyz = fade(Pf0);\n" +
"    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n" +
"    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n" +
"    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n" +
"    return 2.2 * n_xyz;\n" +
"}\n" +
"\n" +
"// Classic Perlin noise, periodic variant\n" +
"float pnoise(vec3 P, vec3 rep) {\n" +
"    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period\n" +
"    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period\n" +
"    Pi0 = mod289(Pi0);\n" +
"    Pi1 = mod289(Pi1);\n" +
"    vec3 Pf0 = fract(P); // Fractional part for interpolation\n" +
"    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n" +
"    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n" +
"    vec4 iy = vec4(Pi0.yy, Pi1.yy);\n" +
"    vec4 iz0 = Pi0.zzzz;\n" +
"    vec4 iz1 = Pi1.zzzz;\n" +
"\n" +
"    vec4 ixy = permute(permute(ix) + iy);\n" +
"    vec4 ixy0 = permute(ixy + iz0);\n" +
"    vec4 ixy1 = permute(ixy + iz1);\n" +
"\n" +
"    vec4 gx0 = ixy0 * (1.0 / 7.0);\n" +
"    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n" +
"    gx0 = fract(gx0);\n" +
"    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n" +
"    vec4 sz0 = step(gz0, vec4(0.0));\n" +
"    gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n" +
"    gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n" +
"\n" +
"    vec4 gx1 = ixy1 * (1.0 / 7.0);\n" +
"    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n" +
"    gx1 = fract(gx1);\n" +
"    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n" +
"    vec4 sz1 = step(gz1, vec4(0.0));\n" +
"    gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n" +
"    gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n" +
"\n" +
"    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n" +
"    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n" +
"    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n" +
"    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n" +
"    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n" +
"    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n" +
"    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n" +
"    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n" +
"\n" +
"    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n" +
"    g000 *= norm0.x;\n" +
"    g010 *= norm0.y;\n" +
"    g100 *= norm0.z;\n" +
"    g110 *= norm0.w;\n" +
"    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n" +
"    g001 *= norm1.x;\n" +
"    g011 *= norm1.y;\n" +
"    g101 *= norm1.z;\n" +
"    g111 *= norm1.w;\n" +
"\n" +
"    float n000 = dot(g000, Pf0);\n" +
"    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n" +
"    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n" +
"    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n" +
"    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n" +
"    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n" +
"    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n" +
"    float n111 = dot(g111, Pf1);\n" +
"\n" +
"    vec3 fade_xyz = fade(Pf0);\n" +
"    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n" +
"    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n" +
"    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n" +
"    return 2.2 * n_xyz;\n" +
"}\n" +
"\n" +
"void main (void) {\n" +
"    // vec2 position = gl_FragCoord.xy / resolution.xy;    // scale coords to [0.0, 1.0]\n" +
"    // position = position * 2.0 - 1.0;                    // scale coords to [-1.0, 1.0]\n" +
"    // position.y *= resolution.y / resolution.x;          // correct aspect ratio\n" +
"\n" +
"    vec3 color = fcolor;\n" +
"    // vec3 color = fcolor * max(1.0 - distance(position, vec2(0.0, 0.0)), 0.15);\n" +
"    // vec3 color = fcolor * (1.0 - dot(normalize(vec3(rand(gl_FragCoord.xy * 0.01) * 10.0, 0.0, -1.0)), vec3(0, 0, 1.0)));\n" +
"\n" +
"    // Mutate colors by screen position or time\n" +
"    // color += vec3(gl_FragCoord.x / resolution.x, 0.0, gl_FragCoord.y / resolution.y);\n" +
"    // color.r += sin(time);\n" +
"\n" +
"    // Mutate color by 3d noise\n" +
"    color *= (abs(cnoise(fposition / 10.0)) / 4.0) + 0.75;\n" +
"    // color *= (abs(pnoise(fposition / 10.0, vec3(500.0))) / 4.0) + 0.75;\n" +
"\n" +
"    gl_FragColor = vec4(color, 1.0);\n" +
"    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n" +
"}\n" +
"";
