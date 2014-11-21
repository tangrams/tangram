uniform vec2 u_resolution;
uniform vec2 u_aspect;
uniform float u_meters_per_pixel;
uniform float u_time;
uniform float u_map_zoom;
uniform vec2 u_map_center;
uniform vec2 u_tile_origin;
uniform sampler2D u_texture; // built-in uniform for texture maps

varying vec3 v_color;
varying vec4 v_world_position;

#if defined(TEXTURE_COORDS)
    varying vec2 v_texcoord;
#endif

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

#if defined(LIGHTING_ENVIRONMENT)
    uniform sampler2D u_env_map;
#endif

#if !defined(LIGHTING_VERTEX)
    varying vec4 v_position;
    varying vec3 v_normal;
#else
    varying vec3 v_lighting;
#endif

// Imported functions
#pragma glslify: sphericalEnvironmentMap = require(./modules/spherical_environment_map)

#pragma tangram: globals
#pragma tangram: lighting

void main (void) {
    vec3 color = v_color;

    #if defined(LIGHTING_ENVIRONMENT)
        // Approximate location of eye (TODO: make this configurable)
        vec3 view_pos = vec3(0., 0., 100. * u_meters_per_pixel);

        // Replace object color with environment map
        color = sphericalEnvironmentMap(view_pos, v_position.xyz, v_normal, u_env_map).rgb;
    #endif

    #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting
        vec3 lighting = calculateLighting(v_position, v_normal, vec3(1.));
    #else
        vec3 lighting = v_lighting;
    #endif

    // Apply lighting to color
    // TODO: add transformation points to give more control to style-specific shaders
    color *= lighting;

    // Style-specific vertex transformations
    #pragma tangram: fragment

    gl_FragColor = vec4(color, 1.0);
}
