uniform vec2 u_resolution;
uniform vec2 u_meter_zoom;
uniform vec2 u_map_zoom;

vec3 perspectiveTransform (vec3 position) {
    #if defined(PROJECTION_PERSPECTIVE)
        // Perspective-style projection
        const vec2 perspective_offset = vec2(-0.25, -0.25);
        const vec2 perspective_factor = vec2(0.8, 0.8); // vec2(-0.25, 0.75);
        position.xy += position.z * perspective_factor * (position.xy - perspective_offset) / u_meter_zoom.xy; // perspective from offset center screen
    #elif defined(PROJECTION_ISOMETRIC) || defined(PROJECTION_POPUP)
        // Pop-up effect - 3d in center of viewport, fading to 2d at edges
        #if defined(PROJECTION_POPUP)
            if (position.z > 1.0) {
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
        position.y += position.z / u_meter_zoom.y; // z coordinate is a simple translation up along y axis, ala isometric
    #endif

    return position;
}

#pragma glslify: export(perspectiveTransform)
