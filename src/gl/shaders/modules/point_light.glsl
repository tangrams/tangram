vec3 pointLight (
    vec3 position,
    vec3 normal,
    vec3 color,
    vec3 light_pos,
    float light_ambient,
    float light_height_gradient_factor,
    float light_height_gradient_max) {

    // Point light-based gradient
    vec3 light_dir = normalize(vec3(position.x, position.y, position.z) - light_pos); // from light point to vertex
    color *= dot(normal, light_dir * -1.0) + light_ambient + clamp(position.z * light_height_gradient_factor, 0.0, light_height_gradient_max);
    return color;
}

#pragma glslify: export(pointLight)
