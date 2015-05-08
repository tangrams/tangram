// Define a wrap value for world coordinates (allows more precision at higher zooms)
// e.g. at wrap 1000, the world space will wrap every 1000 meters
#if defined(TANGRAM_WORLD_POSITION_WRAP)
    vec2 world_position_anchor = vec2(floor(u_tile_origin / TANGRAM_WORLD_POSITION_WRAP) * TANGRAM_WORLD_POSITION_WRAP);

    // Convert back to absolute world position if needed
    vec4 absoluteWorldPosition () {
        return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);
    }
#else
    vec4 absoluteWorldPosition () {
        return v_world_position;
    }
#endif
