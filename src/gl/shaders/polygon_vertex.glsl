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

varying vec3 v_color;

#pragma glslify: perspectiveTransform = require(./modules/perspective, u_resolution=u_resolution, u_meter_zoom=u_meter_zoom)
#pragma glslify: pointLight = require(./modules/point_light)
#pragma glslify: directionalLight = require(./modules/directional_light)

#if defined(EFFECT_NOISE_TEXTURE)
    varying vec3 v_position;
#endif

const float light_ambient = 0.45;

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

vec3 effects (vec3 position, vec3 vposition) {
    // Vertex displacement + procedural effects
    #if defined(ANIMATION_ELEVATOR) || defined(ANIMATION_WAVE) || defined(EFFECT_NOISE_TEXTURE)
        vec3 vposition_world = modelTransform(position) + vec3(u_tile_min, 0.); // need vertex in world coords (before map center transform), hack to get around precision issues (see below)

        #if defined(EFFECT_NOISE_TEXTURE)
            v_position = vposition_world;
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
    #if defined(LIGHTING_POINT)
        // Gouraud shading
        v_color = pointLight(vposition * vec3(1., 1., -1.), vnormal, a_color, vec3(-0.25, -0.25, 0.50), light_ambient, 2.0 / u_meter_zoom.x, 0.25);
    #elif defined(LIGHTING_NIGHT)
        // "Night" effect shading
        v_color = pointLight(vposition, vnormal, a_color, vec3(-0.25, -0.25, 0.50), 0., 0., 0.);
    #elif defined(LIGHTING_DIRECTION)
        // Flat shading
        v_color = directionalLight(vposition, vnormal, a_color, vec3(0.2, 0.7, -0.5), light_ambient);
    #else
        v_color = a_color;
    #endif

    // Perspective
    vposition = perspectiveTransform(vposition);
    vposition.z = calculateZ(vposition.z, a_layer);

    gl_Position = vec4(vposition, 1.0);
}
