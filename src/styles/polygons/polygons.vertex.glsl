uniform vec2 u_resolution;
uniform vec2 u_aspect;
uniform float u_time;
uniform float u_map_zoom;
uniform vec2 u_map_center;
uniform vec2 u_tile_origin;
uniform float u_meters_per_pixel;
uniform float u_order_min;
uniform float u_order_range;

uniform mat4 u_model;
uniform mat4 u_modelView;

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec4 a_color;
attribute float a_layer;

varying vec4 v_color;
varying vec4 v_world_position;

// Optional texture UVs
#if defined(TEXTURE_COORDS)
    attribute vec2 a_texcoord;
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

#if defined(FEATURE_SELECTION)
    attribute vec4 a_selection_color;
    varying vec4 v_selection_color;
#endif

#if !defined(LIGHTING_VERTEX)
    varying vec4 v_position;
    varying vec3 v_normal;
#else
    varying vec3 v_lighting;
#endif

#pragma tangram: globals
#pragma tangram: camera
#pragma tangram: lighting

void main() {
    // Selection pass-specific rendering
    #if defined(FEATURE_SELECTION)
        if (a_selection_color.rgb == vec3(0.)) {
            // Discard by forcing invalid triangle if we're in the feature
            // selection pass but have no selection info
            // TODO: in some cases we may actually want non-selectable features to occlude selectable ones?
            gl_Position = vec4(0., 0., 0., 1.);
            return;
        }
        v_selection_color = a_selection_color;
    #endif

    // Position
    vec4 position = u_modelView * vec4(a_position, 1.);

    // Texture UVs
    #if defined(TEXTURE_COORDS)
        v_texcoord = a_texcoord;
    #endif

    // World coordinates for 3d procedural textures
    v_world_position = u_model * vec4(a_position, 1.);
    #if defined(WORLD_POSITION_WRAP)
        v_world_position.xy -= world_position_anchor;
    #endif

    // Style-specific vertex transformations
    #pragma tangram: vertex

    // Shading
    #if defined(LIGHTING_VERTEX)
        v_color = a_color;
        v_lighting = calculateLighting(position, a_normal, vec3(1.));
    #else
        // Send to fragment shader for per-pixel lighting
        v_position = position;
        v_normal = a_normal;
        v_color = a_color;
    #endif

    // Camera
    cameraProjection(position);

    // Re-orders depth so that higher numbered layers are "force"-drawn over lower ones
    reorderLayers(a_layer + u_order_min, u_order_range, position);

    gl_Position = position;
}
