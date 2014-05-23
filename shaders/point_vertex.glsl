uniform vec2 map_center;
uniform float map_zoom;
uniform vec2 meter_zoom;
uniform vec2 tile_min;
uniform vec2 tile_max;
uniform float tile_scale; // geometries are scaled to this range within each tile
uniform float num_layers;
// uniform float time;

attribute vec3 position;
// attribute vec3 normal;
attribute vec2 texcoord;
attribute vec3 color;
attribute float layer;

varying vec3 fcolor;
varying vec2 ftexcoord;

// vec3 light = normalize(vec3(0.2, 0.7, -0.5)); // vec3(0.1, 0.2, -0.4)
// const float ambient = 0.45;

void main() {
    vec3 vposition = position;
    // vec3 vnormal = normal;
    // vec2 vtexcoord = texcoord;

    // Calc position of vertex in meters, relative to center of screen
    vposition.y *= -1.0; // adjust for flipped y-coords
    vposition.xy *= (tile_max - tile_min) / tile_scale; // adjust for vertex location within tile (scaled from local coords to meters)
    vposition.xy += tile_min.xy - map_center; // adjust for corner of tile relative to map center
    vposition.xy /= meter_zoom; // adjust for zoom in meters to get clip space coords

    // Shading & texture
    fcolor = color;
    ftexcoord = texcoord;

    // #if defined(PROJECTION_PERSPECTIVE)
    //     // Perspective-style projection
    //     vec2 perspective_offset = vec2(-0.25, -0.25);
    //     vec2 perspective_factor = vec2(0.8, 0.8); // vec2(-0.25, 0.75);
    //     vposition.xy += vposition.z * perspective_factor * (vposition.xy - perspective_offset) / meter_zoom.xy; // perspective from offset center screen
    // #elif defined(PROJECTION_ISOMETRIC) || defined(PROJECTION_POPUP)
    //     // Pop-up effect - 3d in center of viewport, fading to 2d at edges
    //     #if defined(PROJECTION_POPUP)
    //         if (vposition.z > 1.0) {
    //             float cd = distance(vposition.xy * (resolution.xy / resolution.yy), vec2(0.0, 0.0));
    //             const float popup_fade_inner = 0.5;
    //             const float popup_fade_outer = 0.75;
    //             if (cd > popup_fade_inner) {
    //                 vposition.z *= 1.0 - smoothstep(popup_fade_inner, popup_fade_outer, cd);
    //             }
    //             const float zoom_boost_start = 15.0;
    //             const float zoom_boost_end = 17.0;
    //             const float zoom_boost_magnitude = 0.75;
    //             vposition.z *= 1.0 + (1.0 - smoothstep(zoom_boost_start, zoom_boost_end, map_zoom)) * zoom_boost_magnitude;
    //         }
    //     #endif

    //     // Isometric-style projection
    //     vposition.y += vposition.z / meter_zoom.y; // z coordinate is a simple translation up along y axis, ala isometric
    //     // vposition.y += vposition.z * 0.5; // closer to Ultima 7-style axonometric
    //     // vposition.x -= vposition.z * 0.5;
    // #endif

    // Reverse and scale to 0-1 for GL depth buffer
    // Layers are force-ordered (higher layers guaranteed to render on top of lower), then by height/depth
    float z_layer_scale = 4096.;
    float z_layer_range = (num_layers + 1.) * z_layer_scale;
    float z_layer = (layer + 1.) * z_layer_scale;
    // float z_layer = (layer + 1.);

    vposition.z = z_layer + clamp(vposition.z, 1., z_layer_scale);
    vposition.z = (z_layer_range - vposition.z) / z_layer_range;

    gl_Position = vec4(vposition, 1.0);
}
