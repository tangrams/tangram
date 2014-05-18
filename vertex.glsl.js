// Generated from vertex.glsl, don't edit
GLRenderer.vertex_shader_source = 
"// #define PROJECTION_PERSPECTIVE\n" +
"// #define PROJECTION_ISOMETRIC\n" +
"// #define PROJECTION_POPUP\n" +
"\n" +
"// #define LIGHTING_POINT\n" +
"// #define LIGHTING_DIRECTION\n" +
"\n" +
"// #define ANIMATION_ELEVATOR\n" +
"// #define ANIMATION_WAVE\n" +
"\n" +
"uniform vec2 resolution;\n" +
"uniform vec2 map_center;\n" +
"uniform float map_zoom;\n" +
"uniform vec2 meter_zoom;\n" +
"uniform vec2 tile_min;\n" +
"uniform vec2 tile_max;\n" +
"uniform float tile_scale; // geometries are scaled to this range within each tile\n" +
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
"vec3 light = normalize(vec3(0.2, 0.7, -0.5)); // vec3(0.1, 0.2, -0.4)\n" +
"const float ambient = 0.45;\n" +
"\n" +
"// Project lat-lng to mercator\n" +
"// vec2 latLngToMeters (vec2 coordinate) {\n" +
"//     const float pi = 3.1415926;\n" +
"//     const float half_circumference_meters = 20037508.342789244;\n" +
"//     vec2 projected;\n" +
"\n" +
"//     // Latitude\n" +
"//     projected.y = log(tan((coordinate.y + 90.0) * pi / 360.0)) / (pi / 180.0);\n" +
"//     projected.y = projected.y * half_circumference_meters / 180.0;\n" +
"\n" +
"//     // Longitude\n" +
"//     projected.x = coordinate.x * half_circumference_meters / 180.0;\n" +
"\n" +
"//     return projected;\n" +
"// }\n" +
"\n" +
"void main() {\n" +
"    vec3 vposition = position;\n" +
"    vec3 vnormal = normal;\n" +
"\n" +
"    // Calc position of vertex in meters, relative to center of screen\n" +
"    vposition.y *= -1.0; // adjust for flipped y-coords\n" +
"    // vposition.y += tile_scale; // alternate, to also adjust for force-positive y coords in tile\n" +
"    vposition.xy *= (tile_max - tile_min) / tile_scale; // adjust for vertex location within tile (scaled from local coords to meters)\n" +
"\n" +
"    #if defined(EFFECT_NOISE_TEXTURE)\n" +
"        fposition = vposition + vec3(tile_min.xy, 0.0);\n" +
"    #endif\n" +
"\n" +
"    // vposition.xy += tile_min.xy - map_center; // adjust for corner of tile relative to map center\n" +
"    vposition.xy += tile_min.xy;\n" +
"\n" +
"    // Vertex displacement tests\n" +
"    if (vposition.z > 1.0) {\n" +
"        // vposition.x += sin(vposition.z + time) * 10.0 * sin(position.x); // swaying buildings\n" +
"        // vposition.y += cos(vposition.z + time) * 10.0;\n" +
"\n" +
"        #if defined(ANIMATION_ELEVATOR)\n" +
"            // vposition.z *= (sin(vposition.z / 25.0 * time) + 1.0) / 2.0 + 0.1; // evelator buildings\n" +
"            vposition.z *= max((sin(vposition.z + time) + 1.0) / 2.0, 0.05); // evelator buildings\n" +
"        #elif defined(ANIMATION_WAVE)\n" +
"            vposition.z *= max((sin(vposition.x / 100.0 + time) + 1.0) / 2.0, 0.05); // wave\n" +
"        #endif\n" +
"    }\n" +
"\n" +
"    vposition.xy -= map_center;\n" +
"    vposition.xy /= meter_zoom; // adjust for zoom in meters to get clip space coords\n" +
"\n" +
"    // Shading\n" +
"    fcolor = color;\n" +
"    // fcolor += vec3(sin(position.z + time), 0.0, 0.0); // color change on height + time\n" +
"\n" +
"    #if defined(LIGHTING_POINT)\n" +
"        // Gouraud shading\n" +
"        light = vec3(-0.25, -0.25, 0.50); // vec3(0.1, 0.1, 0.35); // point light location\n" +
"        light = normalize(vec3(vposition.x, vposition.y, -vposition.z) - light); // light angle from light point to vertex\n" +
"        fcolor *= dot(vnormal, light * -1.0) + ambient + clamp(vposition.z * 2.0 / meter_zoom.x, 0.0, 0.25);\n" +
"    #elif defined(LIGHTING_DIRECTION)\n" +
"        // Flat shading\n" +
"        light = normalize(vec3(0.2, 0.7, -0.5));\n" +
"        // light = normalize(vec3(-1., 0.7, -.0));\n" +
"        // light = normalize(vec3(-1., 0.7, -.75));\n" +
"        // fcolor *= max(dot(vnormal, light * -1.0), 0.1) + ambient;\n" +
"        fcolor *= dot(vnormal, light * -1.0) + ambient;\n" +
"    #endif\n" +
"\n" +
"    #if defined(PROJECTION_PERSPECTIVE)\n" +
"        // Perspective-style projection\n" +
"        vec2 perspective_offset = vec2(-0.25, -0.25);\n" +
"        vec2 perspective_factor = vec2(0.8, 0.8); // vec2(-0.25, 0.75);\n" +
"        vposition.xy += vposition.z * perspective_factor * (vposition.xy - perspective_offset) / meter_zoom.xy; // perspective from offset center screen\n" +
"    #elif defined(PROJECTION_ISOMETRIC) || defined(PROJECTION_POPUP)\n" +
"        // Pop-up effect - 3d in center of viewport, fading to 2d at edges\n" +
"        #if defined(PROJECTION_POPUP)\n" +
"            if (vposition.z > 1.0) {\n" +
"                float cd = distance(vposition.xy * (resolution.xy / resolution.yy), vec2(0.0, 0.0));\n" +
"                const float popup_fade_inner = 0.5;\n" +
"                const float popup_fade_outer = 0.75;\n" +
"                if (cd > popup_fade_inner) {\n" +
"                    vposition.z *= 1.0 - smoothstep(popup_fade_inner, popup_fade_outer, cd);\n" +
"                }\n" +
"                const float zoom_boost_start = 15.0;\n" +
"                const float zoom_boost_end = 17.0;\n" +
"                const float zoom_boost_magnitude = 0.75;\n" +
"                vposition.z *= 1.0 + (1.0 - smoothstep(zoom_boost_start, zoom_boost_end, map_zoom)) * zoom_boost_magnitude;\n" +
"            }\n" +
"        #endif\n" +
"\n" +
"        // Isometric-style projection\n" +
"        vposition.y += vposition.z / meter_zoom.y; // z coordinate is a simple translation up along y axis, ala isometric\n" +
"        // vposition.y += vposition.z * 0.5; // closer to Ultima 7-style axonometric\n" +
"        // vposition.x -= vposition.z * 0.5;\n" +
"    #endif\n" +
"\n" +
"    // Rotation test\n" +
"    // float theta = 0;\n" +
"    // const float pi = 3.1415926;\n" +
"    // vec2 pr;\n" +
"    // pr.x = vposition.x * cos(theta * pi / 180.0) + vposition.y * -sin(theta * pi / 180.0);\n" +
"    // pr.y = vposition.x * sin(theta * pi / 180.0) + vposition.y * cos(theta * pi / 180.0);\n" +
"    // vposition.xy = pr;\n" +
"\n" +
"    // vposition.y *= max(abs(sin(vposition.x)), 0.1); // hourglass effect\n" +
"    // vposition.y *= abs(max(sin(vposition.x), 0.1)); // funnel effect\n" +
"\n" +
"    // Reverse and scale to 0-1 for GL depth buffer\n" +
"    // Layers are force-ordered (higher layers guaranteed to render on top of lower), then by height/depth\n" +
"    float z_layer_scale = 4096.;\n" +
"    float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" +
"    float z_layer = (layer + 1.) * z_layer_scale;\n" +
"\n" +
"    vposition.z = z_layer + clamp(vposition.z, 1., z_layer_scale);\n" +
"    vposition.z = (z_layer_range - vposition.z) / z_layer_range;\n" +
"\n" +
"    gl_Position = vec4(vposition, 1.0);\n" +
"}\n" +
"";
