// Isometric-style projection

uniform vec2 u_aspect;

vec4 isometric (vec4 position, const vec2 axis, const float multiplier) {
    position.xy += position.z * axis * multiplier / u_aspect;
    return position;
}

#pragma glslify: export(isometric)
