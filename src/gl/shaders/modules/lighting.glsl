// Wrapper for the various lighting modes used in the demo

#pragma glslify: pointLight = require(./point_light)
#pragma glslify: directionalLight = require(./directional_light)
#pragma glslify: heightBoostLight = require(./height_light)

vec3 lighting (
    vec4 position,
    vec3 normal,
    vec3 color,
    vec4 light_pos,
    vec4 night_light_pos,
    vec3 light_dir,
    float light_ambient) {

    #if defined(LIGHTING_POINT)
        // Point light - angle varies
        color = pointLight(position * vec4(1., 1., -1., 1.), normal, color, light_pos, light_ambient);
        // color = heightBoostLight(position, color, 1.0, 0.5);
    #elif defined(LIGHTING_NIGHT)
        // "Night" effect shading - variant on point light
        color = pointLight(position, normal, color, night_light_pos, 0.);
    #elif defined(LIGHTING_DIRECTION)
        // Light at infinite distance - angle is static
        color = directionalLight(normal, color, light_dir, light_ambient);
    #else
        color = color;
    #endif

    return color;
}

#pragma glslify: export(lighting)
