uniform vec2 u_resolution;
uniform float u_time;
// uniform vec2 u_map_center;
uniform float u_map_zoom;
// uniform vec2 u_meter_zoom;
// uniform vec2 u_tile_min;
// uniform vec2 u_tile_max;
uniform mat4 u_tile_view;
uniform mat4 u_tile_world;
uniform float u_num_layers;

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;
attribute float a_layer;

varying vec3 v_color;

#if defined(EFFECT_NOISE_TEXTURE)
    varying vec3 v_position;
#endif

// Imported functions
#pragma glslify: perspective = require(./modules/perspective, u_resolution=u_resolution, u_map_zoom=u_map_zoom)
#pragma glslify: calculateZ = require(./modules/depth_scale, u_num_layers=u_num_layers, z_layer_scale=256.)
#pragma glslify: pointLight = require(./modules/point_light)
#pragma glslify: directionalLight = require(./modules/directional_light)
#pragma glslify: heightBoostLight = require(./modules/height_light)

const float light_ambient = 0.45;

void main() {
    vec4 position = vec4(a_position, 1.);

    position = u_tile_view * position;

    // Vertex displacement effects
    vec3 position_world = (u_tile_world * vec4(a_position, 1.)).xyz;
    if (position_world.z > 0.) {
        #if defined(ANIMATION_ELEVATOR)
            position.z *= max((sin(position_world.z + u_time) + 1.0) / 2.0, 0.05); // evelator buildings
        #elif defined(ANIMATION_WAVE)
            position.z *= max((sin(position_world.x / 100.0 + u_time) + 1.0) / 2.0, 0.05); // wave
        #endif
    }

    // Interpolate world coordinates for 3d procedural textures
    #if defined(EFFECT_NOISE_TEXTURE)
        v_position = (u_tile_world * vec4(a_position, 1.)).xyz;
    #endif

    // Shading
    #if defined(LIGHTING_POINT)
        // Gouraud shading
        v_color = pointLight(position * vec4(1., 1., -1., 1.), a_normal, a_color, vec3(-0.25, -0.25, 0.50), light_ambient);
        v_color = heightBoostLight(position, v_color, 1.0, 0.5);
    #elif defined(LIGHTING_NIGHT)
        // "Night" effect shading
        v_color = pointLight(position, a_normal, a_color, vec3(-0.25, -0.25, 0.50), 0.);
    #elif defined(LIGHTING_DIRECTION)
        // Flat shading
        v_color = directionalLight(a_normal, a_color, vec3(0.2, 0.7, -0.5), light_ambient);
    #else
        v_color = a_color;
    #endif

    // Projection & z adjustment
    position = perspective(position, vec2(-0.25, -0.25), vec2(0.6, 0.6));
    position.z = calculateZ(position.z, a_layer);

    gl_Position = position;
}
