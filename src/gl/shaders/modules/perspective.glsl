uniform vec2 u_resolution;
uniform vec2 u_map_zoom;

vec4 perspective (vec4 position, const vec2 perspective_offset, const vec2 perspective_factor) {
    #if defined(PROJECTION_PERSPECTIVE)
        // Perspective-style projection
        position.xy += position.z * perspective_factor * (position.xy - perspective_offset);
    #elif defined(PROJECTION_ISOMETRIC) || defined(PROJECTION_POPUP)
        // Pop-up effect - 3d in center of viewport, fading to 2d at edges
        #if defined(PROJECTION_POPUP)
            if (position.z > 0.) {
                float cd = distance(position.xy * (u_resolution.xy / u_resolution.yy), vec2(0.0, 0.0));
                const float popup_fade_inner = 0.5;
                const float popup_fade_outer = 0.75;
                if (cd > popup_fade_inner) {
                    position.z *= 1.0 - smoothstep(popup_fade_inner, popup_fade_outer, cd);
                }
                const float zoom_boost_start = 15.0;
                const float zoom_boost_end = 17.0;
                const float zoom_boost_magnitude = 0.75;
                position.z *= 1.0 + (1.0 - smoothstep(zoom_boost_start, zoom_boost_end, u_map_zoom)) * zoom_boost_magnitude;
            }
        #endif

        // Isometric-style projection
        position.y += position.z; // z coordinate is a simple translation up along y axis, ala isometric
    #endif

    return position;
}

#pragma glslify: export(perspective)
