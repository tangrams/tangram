// Perspective-style projection

vec4 perspective (vec4 position, const vec2 perspective_offset, const vec2 perspective_factor) {
    position.xy += position.z * perspective_factor * (position.xy - perspective_offset);
    return position;
}

#pragma glslify: export(perspective)
