vec3 pointLight (
    vec4 position,
    vec3 normal,
    vec3 color,
    vec3 light_pos,
    float light_ambient) {

    vec3 light_dir = normalize(position.xyz - light_pos); // from light point to vertex
    color *= dot(normal, light_dir * -1.0) + light_ambient;
    return color;
}

#pragma glslify: export(pointLight)
