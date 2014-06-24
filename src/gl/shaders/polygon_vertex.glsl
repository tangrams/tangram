uniform vec2 resolution;
uniform vec2 map_center;
uniform float map_zoom;
uniform vec2 meter_zoom;
uniform vec2 tile_min;
uniform vec2 tile_max;
uniform float num_layers;
uniform float time;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;
attribute float layer;

varying vec3 fcolor;

#if defined(EFFECT_NOISE_TEXTURE)
    varying vec3 fposition;
#endif

vec3 light;
const float ambient = 0.45;

vec3 modelTransform (vec3 position) {
    // Calc position of vertex in meters, relative to center of screen
    position.y *= -1.0; // adjust for flipped y-coords
    // position.y += TILE_SCALE; // alternate, to also adjust for force-positive y coords in tile
    position.xy *= (tile_max - tile_min) / TILE_SCALE; // adjust for vertex location within tile (scaled from local coords to meters)

    return position;
}

vec3 modelViewTransform (vec3 position) {
    position = modelTransform(position);

    // NOTE: due to unresolved floating point precision issues, tile and map center adjustment need to happen in ONE operation, or artifcats are introduced
    position.xy += tile_min.xy - map_center; // adjust for corner of tile relative to map center
    position.xy /= meter_zoom; // adjust for zoom in meters to get clip space coords

    return position;
}

vec3 perspectiveTransform (vec3 position) {
    #if defined(PROJECTION_PERSPECTIVE)
        // Perspective-style projection
        const vec2 perspective_offset = vec2(-0.25, -0.25);
        const vec2 perspective_factor = vec2(0.8, 0.8); // vec2(-0.25, 0.75);
        position.xy += position.z * perspective_factor * (position.xy - perspective_offset) / meter_zoom.xy; // perspective from offset center screen
    #elif defined(PROJECTION_ISOMETRIC) || defined(PROJECTION_POPUP)
        // Pop-up effect - 3d in center of viewport, fading to 2d at edges
        #if defined(PROJECTION_POPUP)
            if (position.z > 1.0) {
                float cd = distance(position.xy * (resolution.xy / resolution.yy), vec2(0.0, 0.0));
                const float popup_fade_inner = 0.5;
                const float popup_fade_outer = 0.75;
                if (cd > popup_fade_inner) {
                    position.z *= 1.0 - smoothstep(popup_fade_inner, popup_fade_outer, cd);
                }
                const float zoom_boost_start = 15.0;
                const float zoom_boost_end = 17.0;
                const float zoom_boost_magnitude = 0.75;
                position.z *= 1.0 + (1.0 - smoothstep(zoom_boost_start, zoom_boost_end, map_zoom)) * zoom_boost_magnitude;
            }
        #endif

        // Isometric-style projection
        position.y += position.z / meter_zoom.y; // z coordinate is a simple translation up along y axis, ala isometric
    #endif

    return position;
}

float calculateZ (float z, float layer) {
    // Reverse and scale to 0-1 for GL depth buffer
    // Layers are force-ordered (higher layers guaranteed to render on top of lower), then by height/depth
    float z_layer_scale = 4096.;
    float z_layer_range = (num_layers + 1.) * z_layer_scale;
    float z_layer = (layer + 1.) * z_layer_scale;

    z = z_layer + clamp(z, 1., z_layer_scale);
    z = (z_layer_range - z) / z_layer_range;

    return z;
}

vec3 lighting (vec3 position, vec3 normal, vec3 color) {
    // color += vec3(sin(position.z + time), 0.0, 0.0); // color change on height + time

    #if defined(LIGHTING_POINT) || defined(LIGHTING_NIGHT)
        // Gouraud shading
        light = vec3(-0.25, -0.25, 0.50); // vec3(0.1, 0.1, 0.35); // point light location

        #if defined(LIGHTING_NIGHT)
            // "Night" effect by flipping vertex z
            light = normalize(vec3(position.x, position.y, position.z) - light); // light angle from light point to vertex
            color *= dot(normal, light * -1.0); // + ambient + clamp(position.z * 2.0 / meter_zoom.x, 0.0, 0.25);
        #else
            // Point light-based gradient
            light = normalize(vec3(position.x, position.y, -position.z) - light); // light angle from light point to vertex
            color *= dot(normal, light * -1.0) + ambient + clamp(position.z * 2.0 / meter_zoom.x, 0.0, 0.25);
        #endif

    #elif defined(LIGHTING_DIRECTION)
        // Flat shading
        light = normalize(vec3(0.2, 0.7, -0.5));
        color *= dot(normal, light * -1.0) + ambient;
    #endif

    return color;
}

vec3 effects (vec3 position, vec3 vposition) {
    // Vertex displacement + procedural effects
    #if defined(ANIMATION_ELEVATOR) || defined(ANIMATION_WAVE) || defined(EFFECT_NOISE_TEXTURE)
        vec3 vposition_world = modelTransform(position) + vec3(tile_min, 0.); // need vertex in world coords (before map center transform), hack to get around precision issues (see below)

        #if defined(EFFECT_NOISE_TEXTURE)
            fposition = vposition_world;
        #endif

        if (vposition_world.z > 1.0) {
            #if defined(ANIMATION_ELEVATOR)
                vposition.z *= max((sin(vposition_world.z + time) + 1.0) / 2.0, 0.05); // evelator buildings
            #elif defined(ANIMATION_WAVE)
                vposition.z *= max((sin(vposition_world.x / 100.0 + time) + 1.0) / 2.0, 0.05); // wave
            #endif
        }
    #endif

    return vposition;
}

void main() {
    vec3 vposition = position;
    vec3 vnormal = normal;

    vposition = modelViewTransform(vposition);

    // Vertex displacement + procedural effects
    vposition = effects(position, vposition);

    // Shading
    fcolor = lighting(vposition, vnormal, color);

    // Perspective
    vposition = perspectiveTransform(vposition);
    vposition.z = calculateZ(vposition.z, layer);

    gl_Position = vec4(vposition, 1.0);
}
