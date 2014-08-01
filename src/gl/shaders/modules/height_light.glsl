vec3 heightBoostLight (
    vec4 position,
    vec3 color,
    float light_height_max,
    float light_factor) {

    color += color * mix(0., light_factor, smoothstep(0., light_height_max, position.z));
    return color;
}

#pragma glslify: export(heightBoostLight)
