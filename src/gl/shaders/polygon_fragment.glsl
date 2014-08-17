uniform vec2 u_resolution;
uniform vec2 u_aspect;
uniform mat4 u_meter_view;
uniform float u_meters_per_pixel;
uniform float u_time;
uniform vec2 u_tile_origin;

varying vec3 v_color;
varying vec4 v_world_position;

// Define a wrap value for world coordinates (allows more precision at higher zooms)
// e.g. at wrap 1000, the world space will wrap every 1000 meters
#if defined(WORLD_POSITION_WRAP)
    vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);

    // Convert back to absolute world position if needed
    vec4 absoluteWorldPosition () {
        return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);
    }
#else
    vec4 absoluteWorldPosition () {
        return v_world_position;
    }
#endif

#if !defined(LIGHTING_VERTEX)
    varying vec4 v_position;
    varying vec3 v_normal;
#else
    varying vec3 v_lighting;
#endif

const float light_ambient = 0.5;

// Imported functions
#pragma glslify: calculateLighting = require(./modules/lighting)

#pragma tangram: globals

void main (void) {
    vec3 color = v_color;

    #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting
        vec3 lighting = calculateLighting(
            v_position, v_normal, /*color*/ vec3(1.),
            vec4(0., 0., 150. * u_meters_per_pixel, 1.), // location of point light (in pixels above ground)
            vec4(0., 0., 50. * u_meters_per_pixel, 1.), // location of point light for 'night' mode (in pixels above ground)
            vec3(0.2, 0.7, -0.5), // direction of light for flat shading
            light_ambient);
    #else
        vec3 lighting = v_lighting;
    #endif

    // Apply lighting to color (can be overriden by transforms)
    color *= lighting;

    #pragma tangram: fragment

    gl_FragColor = vec4(color, 1.0);
}
