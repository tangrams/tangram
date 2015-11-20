// Vertex position in model space: [0, 1] range over the local tile
// Note positions can be outside that range due to unclipped geometry, geometry higher than a unit cube, etc.
#ifdef TANGRAM_VERTEX_SHADER

vec4 modelPosition() {
    return vec4(SHORT(a_position.xyz) / TANGRAM_TILE_SCALE, 1.);
}

#endif

// Vertex position in world coordinates, useful for 3d procedural textures, etc.
vec4 worldPosition() {
    return v_world_position;
}

// Optionally wrap world coordinates (allows more precision at higher zooms)
// e.g. at wrap 1000, the world space will wrap every 1000 meters
#ifdef TANGRAM_VERTEX_SHADER

vec4 wrapWorldPosition(vec4 world_position) {
    #if defined(TANGRAM_WORLD_POSITION_WRAP)
    vec2 anchor = u_tile_origin.xy - mod(u_tile_origin.xy, TANGRAM_WORLD_POSITION_WRAP);
        world_position.xy -= anchor;
    #endif
    return world_position;
}

#endif

// Normal in world space
#if defined(TANGRAM_VERTEX_SHADER)

vec3 worldNormal() {
    return TANGRAM_NORMAL;
}

#elif defined(TANGRAM_FRAGMENT_SHADER)

vec3 worldNormal() {
    return u_inverseNormalMatrix * TANGRAM_NORMAL;
}

#endif
