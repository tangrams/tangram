vec3 directionalLight (
    vec3 normal,
    vec3 color,
    vec3 light_dir,
    float light_ambient) {

    // Flat shading
    light_dir = normalize(light_dir);
    color *= dot(normal, light_dir * -1.0) + light_ambient;
    return color;
}

#pragma glslify: export(directionalLight)
