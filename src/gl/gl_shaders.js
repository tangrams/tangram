// Generated from GLSL files, don't edit!
var shader_sources = {};

shader_sources['point_fragment'] =
"uniform vec2 resolution;\n" +
"\n" +
"varying vec3 fcolor;\n" +
"varying vec2 ftexcoord;\n" +
"\n" +
"void main (void) {\n" +
"    vec4 color = vec4(fcolor, 1.);\n" +
"\n" +
"    // if (length(ftexcoord.xy) > 10.) {\n" +
"    //     // color = vec4(0., 0., 0., 0.);\n" +
"    //     discard;\n" +
"    // }\n" +
"\n" +
"    float len = length(ftexcoord);\n" +
"    if (len > 1.) {\n" +
"        discard;\n" +
"    }\n" +
"    color.rgb *= (1. - smoothstep(.25, 1., len)) + 0.5;\n" +
"    // color.a = (1. - smoothstep(2.5, 10., len)) + 0.25;\n" +
"\n" +
"    #if defined(EFFECT_SCREEN_COLOR)\n" +
"        // Mutate colors by screen position\n" +
"        color.rgb += vec3(gl_FragCoord.x / resolution.x, 0.0, gl_FragCoord.y / resolution.y);\n" +
"    #endif\n" +
"\n" +
"    gl_FragColor = color;\n" +
"}\n" +
"";

shader_sources['point_vertex'] =
"uniform vec2 map_center;\n" +
"uniform float map_zoom;\n" +
"uniform vec2 meter_zoom;\n" +
"uniform vec2 tile_min;\n" +
"uniform vec2 tile_max;\n" +
"uniform float num_layers;\n" +
"// uniform float time;\n" +
"\n" +
"attribute vec3 position;\n" +
"// attribute vec3 normal;\n" +
"attribute vec2 texcoord;\n" +
"attribute vec3 color;\n" +
"attribute float layer;\n" +
"\n" +
"varying vec3 fcolor;\n" +
"varying vec2 ftexcoord;\n" +
"\n" +
"// vec3 light = normalize(vec3(0.2, 0.7, -0.5)); // vec3(0.1, 0.2, -0.4)\n" +
"// const float ambient = 0.45;\n" +
"\n" +
"void main() {\n" +
"    vec3 vposition = position;\n" +
"    // vec3 vnormal = normal;\n" +
"    // vec2 vtexcoord = texcoord;\n" +
"\n" +
"    // Calc position of vertex in meters, relative to center of screen\n" +
"    vposition.y *= -1.0; // adjust for flipped y-coords\n" +
"    vposition.xy *= (tile_max - tile_min) / TILE_SCALE; // adjust for vertex location within tile (scaled from local coords to meters)\n" +
"    vposition.xy += tile_min.xy - map_center; // adjust for corner of tile relative to map center\n" +
"    vposition.xy /= meter_zoom; // adjust for zoom in meters to get clip space coords\n" +
"\n" +
"    // Shading & texture\n" +
"    fcolor = color;\n" +
"    ftexcoord = texcoord;\n" +
"\n" +
"    // #if defined(PROJECTION_PERSPECTIVE)\n" +
"    //     // Perspective-style projection\n" +
"    //     vec2 perspective_offset = vec2(-0.25, -0.25);\n" +
"    //     vec2 perspective_factor = vec2(0.8, 0.8); // vec2(-0.25, 0.75);\n" +
"    //     vposition.xy += vposition.z * perspective_factor * (vposition.xy - perspective_offset) / meter_zoom.xy; // perspective from offset center screen\n" +
"    // #elif defined(PROJECTION_ISOMETRIC) || defined(PROJECTION_POPUP)\n" +
"    //     // Pop-up effect - 3d in center of viewport, fading to 2d at edges\n" +
"    //     #if defined(PROJECTION_POPUP)\n" +
"    //         if (vposition.z > 1.0) {\n" +
"    //             float cd = distance(vposition.xy * (resolution.xy / resolution.yy), vec2(0.0, 0.0));\n" +
"    //             const float popup_fade_inner = 0.5;\n" +
"    //             const float popup_fade_outer = 0.75;\n" +
"    //             if (cd > popup_fade_inner) {\n" +
"    //                 vposition.z *= 1.0 - smoothstep(popup_fade_inner, popup_fade_outer, cd);\n" +
"    //             }\n" +
"    //             const float zoom_boost_start = 15.0;\n" +
"    //             const float zoom_boost_end = 17.0;\n" +
"    //             const float zoom_boost_magnitude = 0.75;\n" +
"    //             vposition.z *= 1.0 + (1.0 - smoothstep(zoom_boost_start, zoom_boost_end, map_zoom)) * zoom_boost_magnitude;\n" +
"    //         }\n" +
"    //     #endif\n" +
"\n" +
"    //     // Isometric-style projection\n" +
"    //     vposition.y += vposition.z / meter_zoom.y; // z coordinate is a simple translation up along y axis, ala isometric\n" +
"    //     // vposition.y += vposition.z * 0.5; // closer to Ultima 7-style axonometric\n" +
"    //     // vposition.x -= vposition.z * 0.5;\n" +
"    // #endif\n" +
"\n" +
"    // Reverse and scale to 0-1 for GL depth buffer\n" +
"    // Layers are force-ordered (higher layers guaranteed to render on top of lower), then by height/depth\n" +
"    float z_layer_scale = 4096.;\n" +
"    float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" +
"    float z_layer = (layer + 1.) * z_layer_scale;\n" +
"    // float z_layer = (layer + 1.);\n" +
"\n" +
"    vposition.z = z_layer + clamp(vposition.z, 1., z_layer_scale);\n" +
"    vposition.z = (z_layer_range - vposition.z) / z_layer_range;\n" +
"\n" +
"    gl_Position = vec4(vposition, 1.0);\n" +
"}\n" +
"";

shader_sources['polygon_fragment'] =
"uniform vec2 resolution;\n" +
"uniform float time;\n" +
"\n" +
"varying vec3 fcolor;\n" +
"\n" +
"#if defined(EFFECT_NOISE_TEXTURE)\n" +
"    varying vec3 fposition;\n" +
"\n" +
"    // http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl\n" +
"    // float rand (vec2 co) {\n" +
"    //    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n" +
"    // }\n" +
"\n" +
"    // Noise functions from: https://github.com/ashima/webgl-noise\n" +
"    vec3 mod289(vec3 x) {\n" +
"        return x - floor(x * (1.0 / 289.0)) * 289.0;\n" +
"    }\n" +
"\n" +
"    vec4 mod289(vec4 x) {\n" +
"        return x - floor(x * (1.0 / 289.0)) * 289.0;\n" +
"    }\n" +
"\n" +
"    vec4 permute(vec4 x) {\n" +
"        return mod289(((x*34.0)+1.0)*x);\n" +
"    }\n" +
"\n" +
"    vec4 taylorInvSqrt(vec4 r) {\n" +
"        return 1.79284291400159 - 0.85373472095314 * r;\n" +
"    }\n" +
"\n" +
"    vec3 fade(vec3 t) {\n" +
"        return t*t*t*(t*(t*6.0-15.0)+10.0);\n" +
"    }\n" +
"\n" +
"    float snoise(vec3 v) {\n" +
"        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n" +
"        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n" +
"\n" +
"        // First corner\n" +
"        vec3 i  = floor(v + dot(v, C.yyy) );\n" +
"        vec3 x0 =   v - i + dot(i, C.xxx) ;\n" +
"\n" +
"        // Other corners\n" +
"        vec3 g = step(x0.yzx, x0.xyz);\n" +
"        vec3 l = 1.0 - g;\n" +
"        vec3 i1 = min( g.xyz, l.zxy );\n" +
"        vec3 i2 = max( g.xyz, l.zxy );\n" +
"\n" +
"        //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n" +
"        //   x1 = x0 - i1  + 1.0 * C.xxx;\n" +
"        //   x2 = x0 - i2  + 2.0 * C.xxx;\n" +
"        //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n" +
"        vec3 x1 = x0 - i1 + C.xxx;\n" +
"        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n" +
"        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n" +
"\n" +
"        // Permutations\n" +
"        i = mod289(i);\n" +
"        vec4 p = permute( permute( permute(\n" +
"        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n" +
"        + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n" +
"        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n" +
"\n" +
"        // Gradients: 7x7 points over a square, mapped onto an octahedron.\n" +
"        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n" +
"        float n_ = 0.142857142857; // 1.0/7.0\n" +
"        vec3  ns = n_ * D.wyz - D.xzx;\n" +
"\n" +
"        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n" +
"\n" +
"        vec4 x_ = floor(j * ns.z);\n" +
"        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n" +
"\n" +
"        vec4 x = x_ *ns.x + ns.yyyy;\n" +
"        vec4 y = y_ *ns.x + ns.yyyy;\n" +
"        vec4 h = 1.0 - abs(x) - abs(y);\n" +
"\n" +
"        vec4 b0 = vec4( x.xy, y.xy );\n" +
"        vec4 b1 = vec4( x.zw, y.zw );\n" +
"\n" +
"        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n" +
"        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n" +
"        vec4 s0 = floor(b0)*2.0 + 1.0;\n" +
"        vec4 s1 = floor(b1)*2.0 + 1.0;\n" +
"        vec4 sh = -step(h, vec4(0.0));\n" +
"\n" +
"        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n" +
"        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n" +
"\n" +
"        vec3 p0 = vec3(a0.xy,h.x);\n" +
"        vec3 p1 = vec3(a0.zw,h.y);\n" +
"        vec3 p2 = vec3(a1.xy,h.z);\n" +
"        vec3 p3 = vec3(a1.zw,h.w);\n" +
"\n" +
"        //Normalise gradients\n" +
"        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n" +
"        p0 *= norm.x;\n" +
"        p1 *= norm.y;\n" +
"        p2 *= norm.z;\n" +
"        p3 *= norm.w;\n" +
"\n" +
"        // Mix final noise value\n" +
"        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n" +
"        m = m * m;\n" +
"        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );\n" +
"    }\n" +
"\n" +
"    // Classic Perlin noise\n" +
"    float cnoise(vec3 P) {\n" +
"        vec3 Pi0 = floor(P); // Integer part for indexing\n" +
"        vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1\n" +
"        Pi0 = mod289(Pi0);\n" +
"        Pi1 = mod289(Pi1);\n" +
"        vec3 Pf0 = fract(P); // Fractional part for interpolation\n" +
"        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n" +
"        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n" +
"        vec4 iy = vec4(Pi0.yy, Pi1.yy);\n" +
"        vec4 iz0 = Pi0.zzzz;\n" +
"        vec4 iz1 = Pi1.zzzz;\n" +
"\n" +
"        vec4 ixy = permute(permute(ix) + iy);\n" +
"        vec4 ixy0 = permute(ixy + iz0);\n" +
"        vec4 ixy1 = permute(ixy + iz1);\n" +
"\n" +
"        vec4 gx0 = ixy0 * (1.0 / 7.0);\n" +
"        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n" +
"        gx0 = fract(gx0);\n" +
"        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n" +
"        vec4 sz0 = step(gz0, vec4(0.0));\n" +
"        gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n" +
"        gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n" +
"\n" +
"        vec4 gx1 = ixy1 * (1.0 / 7.0);\n" +
"        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n" +
"        gx1 = fract(gx1);\n" +
"        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n" +
"        vec4 sz1 = step(gz1, vec4(0.0));\n" +
"        gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n" +
"        gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n" +
"\n" +
"        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n" +
"        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n" +
"        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n" +
"        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n" +
"        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n" +
"        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n" +
"        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n" +
"        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n" +
"\n" +
"        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n" +
"        g000 *= norm0.x;\n" +
"        g010 *= norm0.y;\n" +
"        g100 *= norm0.z;\n" +
"        g110 *= norm0.w;\n" +
"        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n" +
"        g001 *= norm1.x;\n" +
"        g011 *= norm1.y;\n" +
"        g101 *= norm1.z;\n" +
"        g111 *= norm1.w;\n" +
"\n" +
"        float n000 = dot(g000, Pf0);\n" +
"        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n" +
"        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n" +
"        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n" +
"        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n" +
"        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n" +
"        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n" +
"        float n111 = dot(g111, Pf1);\n" +
"\n" +
"        vec3 fade_xyz = fade(Pf0);\n" +
"        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n" +
"        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n" +
"        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n" +
"        return 2.2 * n_xyz;\n" +
"    }\n" +
"\n" +
"    // Classic Perlin noise, periodic variant\n" +
"    float pnoise(vec3 P, vec3 rep) {\n" +
"        vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period\n" +
"        vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period\n" +
"        Pi0 = mod289(Pi0);\n" +
"        Pi1 = mod289(Pi1);\n" +
"        vec3 Pf0 = fract(P); // Fractional part for interpolation\n" +
"        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n" +
"        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n" +
"        vec4 iy = vec4(Pi0.yy, Pi1.yy);\n" +
"        vec4 iz0 = Pi0.zzzz;\n" +
"        vec4 iz1 = Pi1.zzzz;\n" +
"\n" +
"        vec4 ixy = permute(permute(ix) + iy);\n" +
"        vec4 ixy0 = permute(ixy + iz0);\n" +
"        vec4 ixy1 = permute(ixy + iz1);\n" +
"\n" +
"        vec4 gx0 = ixy0 * (1.0 / 7.0);\n" +
"        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n" +
"        gx0 = fract(gx0);\n" +
"        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n" +
"        vec4 sz0 = step(gz0, vec4(0.0));\n" +
"        gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n" +
"        gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n" +
"\n" +
"        vec4 gx1 = ixy1 * (1.0 / 7.0);\n" +
"        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n" +
"        gx1 = fract(gx1);\n" +
"        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n" +
"        vec4 sz1 = step(gz1, vec4(0.0));\n" +
"        gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n" +
"        gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n" +
"\n" +
"        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n" +
"        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n" +
"        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n" +
"        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n" +
"        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n" +
"        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n" +
"        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n" +
"        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n" +
"\n" +
"        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n" +
"        g000 *= norm0.x;\n" +
"        g010 *= norm0.y;\n" +
"        g100 *= norm0.z;\n" +
"        g110 *= norm0.w;\n" +
"        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n" +
"        g001 *= norm1.x;\n" +
"        g011 *= norm1.y;\n" +
"        g101 *= norm1.z;\n" +
"        g111 *= norm1.w;\n" +
"\n" +
"        float n000 = dot(g000, Pf0);\n" +
"        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n" +
"        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n" +
"        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n" +
"        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n" +
"        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n" +
"        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n" +
"        float n111 = dot(g111, Pf1);\n" +
"\n" +
"        vec3 fade_xyz = fade(Pf0);\n" +
"        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n" +
"        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n" +
"        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n" +
"        return 2.2 * n_xyz;\n" +
"    }\n" +
"#endif\n" +
"\n" +
"void main (void) {\n" +
"\n" +
"    #if defined(EFFECT_SPOTLIGHT)\n" +
"    // Spotlight effect\n" +
"        vec2 position = gl_FragCoord.xy / resolution.xy;    // scale coords to [0.0, 1.0]\n" +
"        position = position * 2.0 - 1.0;                    // scale coords to [-1.0, 1.0]\n" +
"        position.y *= resolution.y / resolution.x;          // correct aspect ratio\n" +
"\n" +
"        vec3 color = fcolor * max(1.0 - distance(position, vec2(0.0, 0.0)), 0.2);\n" +
"    #else\n" +
"        vec3 color = fcolor;\n" +
"    #endif\n" +
"\n" +
"    #if defined(EFFECT_COLOR_BLEED)\n" +
"        // Mutate colors by screen position or time\n" +
"        color += vec3(gl_FragCoord.x / resolution.x, 0.0, gl_FragCoord.y / resolution.y);\n" +
"        color.r += sin(time / 3.0);\n" +
"    #endif\n" +
"\n" +
"    // Mutate color by 3d noise\n" +
"    #if defined (EFFECT_NOISE_TEXTURE)\n" +
"        #if defined(EFFECT_NOISE_ANIMATABLE) && defined(EFFECT_NOISE_ANIMATED)\n" +
"            color *= (abs(cnoise((fposition + vec3(time * 5., time * 7.5, time * 10.)) / 10.0)) / 4.0) + 0.75;\n" +
"        #endif\n" +
"        #ifndef EFFECT_NOISE_ANIMATABLE\n" +
"            color *= (abs(cnoise(fposition / 10.0)) / 4.0) + 0.75;\n" +
"        #endif\n" +
"    #endif\n" +
"\n" +
"    gl_FragColor = vec4(color, 1.0);\n" +
"}\n" +
"";

shader_sources['polygon_vertex'] =
"uniform vec2 resolution;\n" +
"uniform vec2 map_center;\n" +
"uniform float map_zoom;\n" +
"uniform vec2 meter_zoom;\n" +
"uniform vec2 tile_min;\n" +
"uniform vec2 tile_max;\n" +
"uniform float num_layers;\n" +
"uniform float time;\n" +
"\n" +
"attribute vec3 position;\n" +
"attribute vec3 normal;\n" +
"attribute vec3 color;\n" +
"attribute float layer;\n" +
"\n" +
"varying vec3 fcolor;\n" +
"\n" +
"#if defined(EFFECT_NOISE_TEXTURE)\n" +
"    varying vec3 fposition;\n" +
"#endif\n" +
"\n" +
"vec3 light;\n" +
"const float ambient = 0.45;\n" +
"\n" +
"vec3 modelTransform (vec3 position) {\n" +
"    // Calc position of vertex in meters, relative to center of screen\n" +
"    position.y *= -1.0; // adjust for flipped y-coords\n" +
"    // position.y += TILE_SCALE; // alternate, to also adjust for force-positive y coords in tile\n" +
"    position.xy *= (tile_max - tile_min) / TILE_SCALE; // adjust for vertex location within tile (scaled from local coords to meters)\n" +
"\n" +
"    return position;\n" +
"}\n" +
"\n" +
"vec3 modelViewTransform (vec3 position) {\n" +
"    position = modelTransform(position);\n" +
"\n" +
"    // NOTE: due to unresolved floating point precision issues, tile and map center adjustment need to happen in ONE operation, or artifcats are introduced\n" +
"    position.xy += tile_min.xy - map_center; // adjust for corner of tile relative to map center\n" +
"    position.xy /= meter_zoom; // adjust for zoom in meters to get clip space coords\n" +
"\n" +
"    return position;\n" +
"}\n" +
"\n" +
"vec3 perspectiveTransform (vec3 position) {\n" +
"    #if defined(PROJECTION_PERSPECTIVE)\n" +
"        // Perspective-style projection\n" +
"        const vec2 perspective_offset = vec2(-0.25, -0.25);\n" +
"        const vec2 perspective_factor = vec2(0.8, 0.8); // vec2(-0.25, 0.75);\n" +
"        position.xy += position.z * perspective_factor * (position.xy - perspective_offset) / meter_zoom.xy; // perspective from offset center screen\n" +
"    #elif defined(PROJECTION_ISOMETRIC) || defined(PROJECTION_POPUP)\n" +
"        // Pop-up effect - 3d in center of viewport, fading to 2d at edges\n" +
"        #if defined(PROJECTION_POPUP)\n" +
"            if (position.z > 1.0) {\n" +
"                float cd = distance(position.xy * (resolution.xy / resolution.yy), vec2(0.0, 0.0));\n" +
"                const float popup_fade_inner = 0.5;\n" +
"                const float popup_fade_outer = 0.75;\n" +
"                if (cd > popup_fade_inner) {\n" +
"                    position.z *= 1.0 - smoothstep(popup_fade_inner, popup_fade_outer, cd);\n" +
"                }\n" +
"                const float zoom_boost_start = 15.0;\n" +
"                const float zoom_boost_end = 17.0;\n" +
"                const float zoom_boost_magnitude = 0.75;\n" +
"                position.z *= 1.0 + (1.0 - smoothstep(zoom_boost_start, zoom_boost_end, map_zoom)) * zoom_boost_magnitude;\n" +
"            }\n" +
"        #endif\n" +
"\n" +
"        // Isometric-style projection\n" +
"        position.y += position.z / meter_zoom.y; // z coordinate is a simple translation up along y axis, ala isometric\n" +
"    #endif\n" +
"\n" +
"    return position;\n" +
"}\n" +
"\n" +
"float calculateZ (float z, float layer) {\n" +
"    // Reverse and scale to 0-1 for GL depth buffer\n" +
"    // Layers are force-ordered (higher layers guaranteed to render on top of lower), then by height/depth\n" +
"    float z_layer_scale = 4096.;\n" +
"    float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" +
"    float z_layer = (layer + 1.) * z_layer_scale;\n" +
"\n" +
"    z = z_layer + clamp(z, 1., z_layer_scale);\n" +
"    z = (z_layer_range - z) / z_layer_range;\n" +
"\n" +
"    return z;\n" +
"}\n" +
"\n" +
"vec3 lighting (vec3 position, vec3 normal, vec3 color) {\n" +
"    // color += vec3(sin(position.z + time), 0.0, 0.0); // color change on height + time\n" +
"\n" +
"    #if defined(LIGHTING_POINT) || defined(LIGHTING_NIGHT)\n" +
"        // Gouraud shading\n" +
"        light = vec3(-0.25, -0.25, 0.50); // vec3(0.1, 0.1, 0.35); // point light location\n" +
"\n" +
"        #if defined(LIGHTING_NIGHT)\n" +
"            // \"Night\" effect by flipping vertex z\n" +
"            light = normalize(vec3(position.x, position.y, position.z) - light); // light angle from light point to vertex\n" +
"            color *= dot(normal, light * -1.0); // + ambient + clamp(position.z * 2.0 / meter_zoom.x, 0.0, 0.25);\n" +
"        #else\n" +
"            // Point light-based gradient\n" +
"            light = normalize(vec3(position.x, position.y, -position.z) - light); // light angle from light point to vertex\n" +
"            color *= dot(normal, light * -1.0) + ambient + clamp(position.z * 2.0 / meter_zoom.x, 0.0, 0.25);\n" +
"        #endif\n" +
"\n" +
"    #elif defined(LIGHTING_DIRECTION)\n" +
"        // Flat shading\n" +
"        light = normalize(vec3(0.2, 0.7, -0.5));\n" +
"        color *= dot(normal, light * -1.0) + ambient;\n" +
"    #endif\n" +
"\n" +
"    return color;\n" +
"}\n" +
"\n" +
"vec3 effects (vec3 position, vec3 vposition) {\n" +
"    // Vertex displacement + procedural effects\n" +
"    #if defined(ANIMATION_ELEVATOR) || defined(ANIMATION_WAVE) || defined(EFFECT_NOISE_TEXTURE)\n" +
"        vec3 vposition_world = modelTransform(position) + vec3(tile_min, 0.); // need vertex in world coords (before map center transform), hack to get around precision issues (see below)\n" +
"\n" +
"        #if defined(EFFECT_NOISE_TEXTURE)\n" +
"            fposition = vposition_world;\n" +
"        #endif\n" +
"\n" +
"        if (vposition_world.z > 1.0) {\n" +
"            #if defined(ANIMATION_ELEVATOR)\n" +
"                vposition.z *= max((sin(vposition_world.z + time) + 1.0) / 2.0, 0.05); // evelator buildings\n" +
"            #elif defined(ANIMATION_WAVE)\n" +
"                vposition.z *= max((sin(vposition_world.x / 100.0 + time) + 1.0) / 2.0, 0.05); // wave\n" +
"            #endif\n" +
"        }\n" +
"    #endif\n" +
"\n" +
"    return vposition;\n" +
"}\n" +
"\n" +
"void main() {\n" +
"    vec3 vposition = position;\n" +
"    vec3 vnormal = normal;\n" +
"\n" +
"    vposition = modelViewTransform(vposition);\n" +
"\n" +
"    // Vertex displacement + procedural effects\n" +
"    vposition = effects(position, vposition);\n" +
"\n" +
"    // Shading\n" +
"    fcolor = lighting(vposition, vnormal, color);\n" +
"\n" +
"    // Perspective\n" +
"    vposition = perspectiveTransform(vposition);\n" +
"    vposition.z = calculateZ(vposition.z, layer);\n" +
"\n" +
"    gl_Position = vec4(vposition, 1.0);\n" +
"}\n" +
"";

if (module.exports !== undefined) { module.exports = shader_sources; }

