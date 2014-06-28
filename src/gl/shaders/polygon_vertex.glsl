uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_map_center;
uniform float u_map_zoom;
uniform vec2 u_meter_zoom;
uniform vec2 u_tile_min;
uniform vec2 u_tile_max;
uniform float u_num_layers;

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;
attribute float a_layer;

varying vec3 fcolor;

#pragma glslify: perspectiveTransform = require(./modules/perspective, u_resolution=u_resolution, u_meter_zoom=u_meter_zoom)

#if defined(EFFECT_NOISE_TEXTURE)
    varying vec3 fposition;
#endif

vec3 light;
const float ambient = 0.45;

vec3 modelTransform (vec3 position) {
    // Calc position of vertex in meters, relative to center of screen
    position.y *= -1.0; // adjust for flipped y-coords
    // position.y += TILE_SCALE; // alternate, to also adjust for force-positive y coords in tile
    position.xy *= (u_tile_max - u_tile_min) / TILE_SCALE; // adjust for vertex location within tile (scaled from local coords to meters)

    return position;
}

vec3 modelViewTransform (vec3 position) {
    position = modelTransform(position);

    // NOTE: due to unresolved floating point precision issues, tile and map center adjustment need to happen in ONE operation, or artifcats are introduced
    position.xy += u_tile_min.xy - u_map_center; // adjust for corner of tile relative to map center
    position.xy /= u_meter_zoom; // adjust for zoom in meters to get clip space coords

    return position;
}

float calculateZ (float z, float layer) {
    // Reverse and scale to 0-1 for GL depth buffer
    // Layers are force-ordered (higher layers guaranteed to render on top of lower), then by height/depth
    float z_layer_scale = 4096.;
    float z_layer_range = (u_num_layers + 1.) * z_layer_scale;
    float z_layer = (layer + 1.) * z_layer_scale;

    z = z_layer + clamp(z, 1., z_layer_scale);
    z = (z_layer_range - z) / z_layer_range;

    return z;
}

vec3 lighting (vec3 position, vec3 normal, vec3 color) {
    // color += vec3(sin(position.z + u_time), 0.0, 0.0); // color change on height + u_time

    #if defined(LIGHTING_POINT) || defined(LIGHTING_NIGHT)
        // Gouraud shading
        light = vec3(-0.25, -0.25, 0.50); // vec3(0.1, 0.1, 0.35); // point light location

        #if defined(LIGHTING_NIGHT)
            // "Night" effect by flipping vertex z
            light = normalize(vec3(position.x, position.y, position.z) - light); // light angle from light point to vertex
            color *= dot(normal, light * -1.0); // + ambient + clamp(position.z * 2.0 / u_meter_zoom.x, 0.0, 0.25);
        #else
            // Point light-based gradient
            light = normalize(vec3(position.x, position.y, -position.z) - light); // light angle from light point to vertex
            color *= dot(normal, light * -1.0) + ambient + clamp(position.z * 2.0 / u_meter_zoom.x, 0.0, 0.25);
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
        vec3 vposition_world = modelTransform(position) + vec3(u_tile_min, 0.); // need vertex in world coords (before map center transform), hack to get around precision issues (see below)

        #if defined(EFFECT_NOISE_TEXTURE)
            fposition = vposition_world;
        #endif

        if (vposition_world.z > 1.0) {
            #if defined(ANIMATION_ELEVATOR)
                vposition.z *= max((sin(vposition_world.z + u_time) + 1.0) / 2.0, 0.05); // evelator buildings
            #elif defined(ANIMATION_WAVE)
                vposition.z *= max((sin(vposition_world.x / 100.0 + u_time) + 1.0) / 2.0, 0.05); // wave
            #endif
        }
    #endif

    return vposition;
}

void main() {
    vec3 vposition = a_position;
    vec3 vnormal = a_normal;

    vposition = modelViewTransform(vposition);

    // Vertex displacement + procedural effects
    vposition = effects(a_position, vposition);

    // Shading
    fcolor = lighting(vposition, vnormal, a_color);

    // Perspective
    vposition = perspectiveTransform(vposition);
    vposition.z = calculateZ(vposition.z, a_layer);

    gl_Position = vec4(vposition, 1.0);
}
