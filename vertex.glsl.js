// Generated from vertex.glsl, don't edit
GLRenderer.vertex_shader_source = 
"uniform vec2 resolution;\n" +
"uniform vec2 map_center;\n" +
"uniform float map_zoom;\n" +
"uniform vec2 meter_zoom;\n" +
"uniform vec2 tile_min;\n" +
"uniform vec2 tile_max;\n" +
"uniform float tile_scale; // geometries are scaled to this range within each tile\n" +
"uniform float time;\n" +
"\n" +
"attribute vec3 position;\n" +
"attribute vec3 normal;\n" +
"attribute vec3 color;\n" +
"\n" +
"varying vec3 fcolor;\n" +
"\n" +
"// const vec3 light = vec3(0.2, 0.7, -0.5); // vec3(0.1, 0.2, -0.4)\n" +
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
"    // Vertex displacement tests\n" +
"    // if (vposition.z > 1.0) {\n" +
"    //     // vposition.x += sin(vposition.z + time) * 10.0 * sin(position.x); // swaying buildings\n" +
"    //     // vposition.y += cos(vposition.z + time) * 10.0;\n" +
"\n" +
"    //     // vposition.z *= (sin(vposition.z / 25.0 * time) + 1.0) / 2.0 + 0.1; // evelator buildings\n" +
"    //     // vposition.z *= (sin(vposition.x / 100.0 + time) + 1.01); // wave\n" +
"    // }\n" +
"\n" +
"    vposition.xy += tile_min.xy - map_center; // adjust for corner of tile relative to map center\n" +
"\n" +
"    // Isometric-style projections\n" +
"    // vposition.y += vposition.z; // z coordinate is a simple translation up along y axis, ala isometric\n" +
"    // vposition.y += vposition.z * 0.5; // closer to Ultima 7-style axonometric\n" +
"    // vposition.x -= vposition.z * 0.5;\n" +
"\n" +
"    // Adjust for zoom in meters to get clip space coords\n" +
"    vposition.xy /= meter_zoom;\n" +
"\n" +
"    // Flat shading between surface normal and light\n" +
"    fcolor = color;\n" +
"    // fcolor += vec3(sin(position.z + time), 0.0, 0.0); // color change on height + time\n" +
"    light = vec3(-0.25, -0.25, 0.35); // vec3(0.1, 0.1, 0.35); // point light location\n" +
"    light = normalize(vec3(vposition.x, vposition.y, -vposition.z) - light); // light angle from light point to vertex\n" +
"    fcolor *= dot(vnormal, light * -1.0) + ambient + clamp(vposition.z * 2.0 / meter_zoom.x, 0.0, 0.25);\n" +
"    fcolor = min(fcolor, 1.0);\n" +
"\n" +
"    // Perspective-style projections\n" +
"    vec2 perspective_offset = vec2(-0.25, -0.25);\n" +
"    vec2 perspective_factor = vec2(0.8, 0.8); // vec2(-0.25, 0.75);\n" +
"    vposition.xy += vposition.z * perspective_factor * (vposition.xy - perspective_offset) / meter_zoom.xy; // perspective from offset center screen\n" +
"\n" +
"    // Rotation test\n" +
"    // float theta = 0;\n" +
"    // const float pi = 3.1415926;\n" +
"    // vec2 pr;\n" +
"    // pr.x = vposition.x * cos(theta * pi / 180.0) + vposition.y * -sin(theta * pi / 180.0);\n" +
"    // pr.y = vposition.x * sin(theta * pi / 180.0) + vposition.y * cos(theta * pi / 180.0);\n" +
"    // vposition.xy = pr;\n" +
"\n" +
"    // vposition.y *= abs(sin(vposition.x)); // hourglass effect\n" +
"\n" +
"    vposition.z = (-vposition.z + 2048.0) / 4096.0; // reverse and scale to 0-1 for GL depth buffer\n" +
"\n" +
"    gl_Position = vec4(vposition, 1.0);\n" +
"}\n" +
"";
