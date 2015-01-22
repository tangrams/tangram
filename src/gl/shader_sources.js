// Generated from GLSL files, don't edit!
var shaderSources = {};

shaderSources['modules/directional_light'] =
"vec3 directionalLight (\n" +
"    vec3 normal,\n" +
"    vec3 color,\n" +
"    vec3 light_dir,\n" +
"    float light_ambient) {\n" +
"\n" +
"    // Flat shading\n" +
"    light_dir = normalize(light_dir);\n" +
"    color *= dot(normal, light_dir * -1.0) + light_ambient;\n" +
"    return color;\n" +
"}\n" +
"\n" +
"#pragma glslify: export(directionalLight)\n" +
"";

shaderSources['modules/point_light'] =
"vec3 pointLight (\n" +
"    vec4 position,\n" +
"    vec3 normal,\n" +
"    vec3 color,\n" +
"    vec4 light_pos,\n" +
"    float light_ambient,\n" +
"    const bool backlight) {\n" +
"\n" +
"    vec3 light_dir = normalize(position.xyz - light_pos.xyz); // from light point to vertex\n" +
"    color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" +
"    return color;\n" +
"}\n" +
"\n" +
"#pragma glslify: export(pointLight)\n" +
"";

shaderSources['modules/popup'] =
"// Pop-up effect - 3d in center of viewport, fading to 2d at edges\n" +
"vec4 popup (vec4 position, const vec2 center, const float radius) {\n" +
"    if (position.z > 0.) {\n" +
"        float cd = distance(position.xy, center);\n" +
"        float popup_fade_inner = radius * 2. / 3.; // 0.5\n" +
"        float popup_fade_outer = radius; // 0.75\n" +
"        if (cd > popup_fade_inner) {\n" +
"            position.z *= 1.0 - smoothstep(popup_fade_inner, popup_fade_outer, cd);\n" +
"        }\n" +
"        // const float zoom_boost_start = 15.0;\n" +
"        // const float zoom_boost_end = 17.0;\n" +
"        // const float zoom_boost_magnitude = 0.75;\n" +
"        // position.z *= 1.0 + (1.0 - smoothstep(zoom_boost_start, zoom_boost_end, u_map_zoom)) * zoom_boost_magnitude;\n" +
"    }\n" +
"\n" +
"    return position;\n" +
"}\n" +
"\n" +
"#pragma glslify: export(popup)\n" +
"";

shaderSources['modules/reorder_layers'] =
"// Re-orders depth so that higher numbered layers are \"force\"-drawn over lower ones\n" +
"\n" +
"void reorderLayers (float layer, float num_layers, inout vec4 position) {\n" +
"    float layer_order = ((layer + 1.) / (num_layers + 1.)) + 1.;\n" +
"    position.z /= layer_order;\n" +
"}\n" +
"\n" +
"#pragma glslify: export(reorderLayers)\n" +
"";

shaderSources['modules/specular_point_light'] =
"vec3 specularLight (\n" +
"    vec4 position,\n" +
"    vec3 normal,\n" +
"    vec3 color,\n" +
"    vec4 light_pos,\n" +
"    float light_ambient,\n" +
"    const bool backlight) {\n" +
"\n" +
"    vec3 light_dir = normalize(position.xyz - light_pos.xyz); // direction from the light to the model\n" +
"    vec3 view_pos = vec3(0., 0., 500.); // approximate location of eye (TODO: make this configurable and calculated based on proper FOV/perspective calc)\n" +
"    vec3 view_dir = normalize(position.xyz - view_pos.xyz); // direction from eye to model\n" +
"\n" +
"    vec3 specularReflection;\n" +
"\n" +
"    if (dot(normal, -light_dir) < 0.0) { // light source on the wrong side?\n" +
"      specularReflection = vec3(0.0, 0.0, 0.0); // no specular reflection\n" +
"    }\n" +
"    else {\n" +
"        // TODO: make configurable / part of material + light definitions\n" +
"        float attenuation = 1.0;\n" +
"        float lightSpecularTerm = 1.0;\n" +
"        float materialSpecularTerm = 10.0;\n" +
"        float materialShininessTerm = 10.0;\n" +
"\n" +
"        specularReflection =\n" +
"            attenuation *\n" +
"            vec3(lightSpecularTerm) *\n" +
"            vec3(materialSpecularTerm) *\n" +
"            pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);\n" +
"    }\n" +
"\n" +
"    // specularReflection *= vec3(1., 0., 0.); // test specular color (TODO: add support in light definition)\n" +
"\n" +
"    float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));\n" +
"\n" +
"    // Diffuse + specular + ambient\n" +
"    color *=\n" +
"        diffuse +\n" +
"        specularReflection +\n" +
"        light_ambient;\n" +
"\n" +
"    return color;\n" +
"}\n" +
"\n" +
"#pragma glslify: export(specularLight)\n" +
"";

shaderSources['modules/spherical_environment_map'] =
"// Spherical environment map\n" +
"// Based on: http://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader\n" +
"\n" +
"// view_pos: location of camera\n" +
"// position: location of current point on surface\n" +
"// normal: normal of current piont on surface\n" +
"// envmap: spherical environment map texture\n" +
"\n" +
"vec4 sphericalEnvironmentMap(vec3 view_pos, vec3 position, vec3 normal, sampler2D envmap) {\n" +
"    // Normalized vector from camera to surface\n" +
"    vec3 eye = normalize(position.xyz - view_pos.xyz);\n" +
"\n" +
"    // Force surfaces to be in front of camera (safeguard that fixes fake camera optics)\n" +
"    if (eye.z > 0.01) {\n" +
"        eye.z = 0.01;\n" +
"    }\n" +
"\n" +
"    // Reflection of eye off of surface normal\n" +
"    vec3 r = reflect(eye, normal);\n" +
"\n" +
"    // Map reflected vector onto the surface of a sphere\n" +
"    r.z += 1.;\n" +
"    float m = 2. * length(r);\n" +
"\n" +
"    // Adjust xy to account for spherical shape, and center in middle of texture\n" +
"    vec2 uv = r.xy / m + .5;\n" +
"\n" +
"    // Sample the environment map\n" +
"    return texture2D(envmap, uv);\n" +
"}\n" +
"\n" +
"#pragma glslify: export(sphericalEnvironmentMap)\n" +
"";

shaderSources['point_fragment'] =
"uniform vec2 u_resolution;\n" +
"\n" +
"varying vec4 v_color;\n" +
"varying vec2 v_texcoord;\n" +
"\n" +
"void main (void) {\n" +
"    vec4 color = v_color;\n" +
"    vec3 lighting = vec3(1.);\n" +
"\n" +
"    // Simple threshold at dot radius\n" +
"    vec2 uv = v_texcoord * 2. - 1.;\n" +
"    float len = length(uv);\n" +
"    if (len > 1.) {\n" +
"        discard;\n" +
"    }\n" +
"    color.rgb *= (1. - smoothstep(.25, 1., len)) + 0.5;\n" +
"\n" +
"    #pragma tangram: fragment\n" +
"\n" +
"    gl_FragColor = color;\n" +
"}\n" +
"";

shaderSources['point_vertex'] =
"uniform mat4 u_tile_view;\n" +
"uniform float u_num_layers;\n" +
"\n" +
"attribute vec3 a_position;\n" +
"attribute vec2 a_texcoord;\n" +
"attribute vec4 a_color;\n" +
"attribute float a_layer;\n" +
"\n" +
"varying vec4 v_color;\n" +
"varying vec2 v_texcoord;\n" +
"\n" +
"#if defined(FEATURE_SELECTION)\n" +
"    attribute vec4 a_selection_color;\n" +
"    varying vec4 v_selection_color;\n" +
"#endif\n" +
"\n" +
"#pragma tangram: globals\n" +
"#pragma tangram: camera\n" +
"\n" +
"void main() {\n" +
"    #if defined(FEATURE_SELECTION)\n" +
"        if (a_selection_color.rgb == vec3(0.)) {\n" +
"            // Discard by forcing invalid triangle if we\'re in the feature\n" +
"            // selection pass but have no selection info\n" +
"            // TODO: in some cases we may actually want non-selectable features to occlude selectable ones?\n" +
"            gl_Position = vec4(0., 0., 0., 1.);\n" +
"            return;\n" +
"        }\n" +
"        v_selection_color = a_selection_color;\n" +
"    #endif\n" +
"\n" +
"    // vec4 position = u_perspective * u_tile_view * vec4(a_position, 1.);\n" +
"    vec4 position = u_tile_view * vec4(a_position, 1.);\n" +
"\n" +
"    #pragma tangram: vertex\n" +
"\n" +
"    v_color = a_color;\n" +
"    v_texcoord = a_texcoord;\n" +
"\n" +
"    cameraProjection(position);\n" +
"\n" +
"    // Re-orders depth so that higher numbered layers are \"force\"-drawn over lower ones\n" +
"    reorderLayers(a_layer, u_num_layers, position);\n" +
"\n" +
"    gl_Position = position;\n" +
"}\n" +
"";

shaderSources['polygon_fragment'] =
"uniform vec2 u_resolution;\n" +
"uniform vec2 u_aspect;\n" +
"uniform float u_meters_per_pixel;\n" +
"uniform float u_time;\n" +
"uniform float u_map_zoom;\n" +
"uniform vec2 u_map_center;\n" +
"uniform vec2 u_tile_origin;\n" +
"\n" +
"varying vec4 v_color;\n" +
"varying vec4 v_world_position;\n" +
"\n" +
"// built-in uniforms for texture maps\n" +
"#if defined(NUM_TEXTURES)\n" +
"    uniform sampler2D u_textures[NUM_TEXTURES];\n" +
"#endif\n" +
"\n" +
"#if defined(TEXTURE_COORDS)\n" +
"    varying vec2 v_texcoord;\n" +
"#endif\n" +
"\n" +
"// Define a wrap value for world coordinates (allows more precision at higher zooms)\n" +
"// e.g. at wrap 1000, the world space will wrap every 1000 meters\n" +
"#if defined(WORLD_POSITION_WRAP)\n" +
"    vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" +
"\n" +
"    // Convert back to absolute world position if needed\n" +
"    vec4 absoluteWorldPosition () {\n" +
"        return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" +
"    }\n" +
"#else\n" +
"    vec4 absoluteWorldPosition () {\n" +
"        return v_world_position;\n" +
"    }\n" +
"#endif\n" +
"\n" +
"#if defined(LIGHTING_ENVIRONMENT)\n" +
"    uniform sampler2D u_env_map;\n" +
"#endif\n" +
"\n" +
"#if !defined(LIGHTING_VERTEX)\n" +
"    varying vec4 v_position;\n" +
"    varying vec3 v_normal;\n" +
"#else\n" +
"    varying vec3 v_lighting;\n" +
"#endif\n" +
"\n" +
"#pragma tangram: globals\n" +
"#pragma tangram: lighting\n" +
"\n" +
"void main (void) {\n" +
"    vec4 color;\n" +
"\n" +
"    #if defined(TEXTURE_COORDS) && defined(HAS_DEFAULT_TEXTURE)\n" +
"        color = texture2D(texture_default, v_texcoord);\n" +
"    #else\n" +
"        color = v_color;\n" +
"    #endif\n" +
"\n" +
"    #if defined(LIGHTING_ENVIRONMENT)\n" +
"        // Approximate location of eye (TODO: make this configurable)\n" +
"        vec3 view_pos = vec3(0., 0., 100. * u_meters_per_pixel);\n" +
"\n" +
"        // Replace object color with environment map\n" +
"        color.rgb = sphericalEnvironmentMap(view_pos, v_position.xyz, v_normal, u_env_map).rgb;\n" +
"    #endif\n" +
"\n" +
"    #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" +
"        vec3 lighting = calculateLighting(v_position, v_normal, vec3(1.));\n" +
"    #else\n" +
"        vec3 lighting = v_lighting;\n" +
"    #endif\n" +
"\n" +
"    // Apply lighting to color\n" +
"    // TODO: add transformation points to give more control to style-specific shaders\n" +
"    color.rgb *= lighting;\n" +
"\n" +
"    // Style-specific vertex transformations\n" +
"    #pragma tangram: fragment\n" +
"\n" +
"    gl_FragColor = color;\n" +
"}\n" +
"";

shaderSources['polygon_vertex'] =
"uniform vec2 u_resolution;\n" +
"uniform vec2 u_aspect;\n" +
"uniform float u_time;\n" +
"uniform float u_map_zoom;\n" +
"uniform vec2 u_map_center;\n" +
"uniform vec2 u_tile_origin;\n" +
"uniform mat4 u_tile_world;\n" +
"uniform mat4 u_tile_view;\n" +
"uniform float u_meters_per_pixel;\n" +
"uniform float u_order_min;\n" +
"uniform float u_order_range;\n" +
"\n" +
"attribute vec3 a_position;\n" +
"attribute vec3 a_normal;\n" +
"attribute vec4 a_color;\n" +
"attribute float a_layer;\n" +
"\n" +
"varying vec4 v_color;\n" +
"varying vec4 v_world_position;\n" +
"\n" +
"// Optional texture UVs\n" +
"#if defined(TEXTURE_COORDS)\n" +
"    attribute vec2 a_texcoord;\n" +
"    varying vec2 v_texcoord;\n" +
"#endif\n" +
"\n" +
"// Define a wrap value for world coordinates (allows more precision at higher zooms)\n" +
"// e.g. at wrap 1000, the world space will wrap every 1000 meters\n" +
"#if defined(WORLD_POSITION_WRAP)\n" +
"    vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" +
"\n" +
"    // Convert back to absolute world position if needed\n" +
"    vec4 absoluteWorldPosition () {\n" +
"        return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" +
"    }\n" +
"#else\n" +
"    vec4 absoluteWorldPosition () {\n" +
"        return v_world_position;\n" +
"    }\n" +
"#endif\n" +
"\n" +
"#if defined(FEATURE_SELECTION)\n" +
"    attribute vec4 a_selection_color;\n" +
"    varying vec4 v_selection_color;\n" +
"#endif\n" +
"\n" +
"#if !defined(LIGHTING_VERTEX)\n" +
"    varying vec4 v_position;\n" +
"    varying vec3 v_normal;\n" +
"#else\n" +
"    varying vec3 v_lighting;\n" +
"#endif\n" +
"\n" +
"#pragma tangram: globals\n" +
"#pragma tangram: camera\n" +
"#pragma tangram: lighting\n" +
"\n" +
"void main() {\n" +
"    // Selection pass-specific rendering\n" +
"    #if defined(FEATURE_SELECTION)\n" +
"        if (a_selection_color.rgb == vec3(0.)) {\n" +
"            // Discard by forcing invalid triangle if we\'re in the feature\n" +
"            // selection pass but have no selection info\n" +
"            // TODO: in some cases we may actually want non-selectable features to occlude selectable ones?\n" +
"            gl_Position = vec4(0., 0., 0., 1.);\n" +
"            return;\n" +
"        }\n" +
"        v_selection_color = a_selection_color;\n" +
"    #endif\n" +
"\n" +
"    // Position\n" +
"    vec4 position = u_tile_view * vec4(a_position, 1.);\n" +
"\n" +
"    // Texture UVs\n" +
"    #if defined(TEXTURE_COORDS)\n" +
"        v_texcoord = a_texcoord;\n" +
"    #endif\n" +
"\n" +
"    // World coordinates for 3d procedural textures\n" +
"    v_world_position = u_tile_world * vec4(a_position, 1.);\n" +
"    #if defined(WORLD_POSITION_WRAP)\n" +
"        v_world_position.xy -= world_position_anchor;\n" +
"    #endif\n" +
"\n" +
"    // Style-specific vertex transformations\n" +
"    #pragma tangram: vertex\n" +
"\n" +
"    // Shading\n" +
"    #if defined(LIGHTING_VERTEX)\n" +
"        v_color = a_color;\n" +
"        v_lighting = calculateLighting(position, a_normal, vec3(1.));\n" +
"    #else\n" +
"        // Send to fragment shader for per-pixel lighting\n" +
"        v_position = position;\n" +
"        v_normal = a_normal;\n" +
"        v_color = a_color;\n" +
"    #endif\n" +
"\n" +
"    // Camera\n" +
"    cameraProjection(position);\n" +
"\n" +
"    // Re-orders depth so that higher numbered layers are \"force\"-drawn over lower ones\n" +
"    reorderLayers(a_layer + u_order_min, u_order_range, position);\n" +
"\n" +
"    gl_Position = position;\n" +
"}\n" +
"";

shaderSources['selection_fragment'] =
"#if defined(FEATURE_SELECTION)\n" +
"    varying vec4 v_selection_color;\n" +
"#endif\n" +
"\n" +
"void main (void) {\n" +
"    #if defined(FEATURE_SELECTION)\n" +
"        gl_FragColor = v_selection_color;\n" +
"    #else\n" +
"        gl_FragColor = vec4(0., 0., 0., 1.);\n" +
"    #endif\n" +
"}\n" +
"";

module.exports = shaderSources;
