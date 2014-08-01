// Pop-up effect - 3d in center of viewport, fading to 2d at edges
vec4 popup (vec4 position, const vec2 center, const float radius) {
    if (position.z > 0.) {
        float cd = distance(position.xy, center);
        float popup_fade_inner = radius * 2. / 3.; // 0.5
        float popup_fade_outer = radius; // 0.75
        if (cd > popup_fade_inner) {
            position.z *= 1.0 - smoothstep(popup_fade_inner, popup_fade_outer, cd);
        }
        // const float zoom_boost_start = 15.0;
        // const float zoom_boost_end = 17.0;
        // const float zoom_boost_magnitude = 0.75;
        // position.z *= 1.0 + (1.0 - smoothstep(zoom_boost_start, zoom_boost_end, u_map_zoom)) * zoom_boost_magnitude;
    }

    return position;
}

#pragma glslify: export(popup)
