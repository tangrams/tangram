uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_map_position;
uniform vec3 u_tile_origin;
uniform float u_meters_per_pixel;
uniform float u_device_pixel_ratio;
// uniform float u_order_min;
// uniform float u_order_range;

uniform mat4 u_model;
uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec4 a_color;
attribute float a_layer;

varying vec4 v_position;
varying vec3 v_normal;
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

#if defined(TANGRAM_LIGHTING_VERTEX)
    varying vec4 v_lighting;
#endif

#pragma tangram: globals
#pragma tangram: camera
#pragma tangram: material
#pragma tangram: lighting

void main() {
    // Adds vertex shader support for feature selection
    #pragma tangram: feature-selection-vertex

    // Texture UVs
    #if defined(TEXTURE_COORDS)
        v_texcoord = a_texcoord;
    #endif

    // World coordinates for 3d procedural textures
    v_world_position = u_model * vec4(a_position, 1.);
    #if defined(WORLD_POSITION_WRAP)
        v_world_position.xy -= world_position_anchor;
    #endif

    // Position
    vec4 position = u_modelView * vec4(a_position, 1.);

    // Modify position before camera projection
    #pragma tangram: position

    // Setup varyings
    v_position = position;
    v_normal = normalize(u_normalMatrix * a_normal);
    v_color = a_color;

    // Vertex lighting
    #if defined(TANGRAM_LIGHTING_VERTEX)
        vec4 color = a_color;
        vec3 normal = a_normal;

        // Modify normal before lighting
        #pragma tangram: normal

        // Modify color and material properties before lighting
        #pragma tangram: color

        v_lighting = calculateLighting(position.xyz, normal, color);
        v_color = color;
    #endif

    // Camera
    cameraProjection(position);
    applyLayerOrder(a_layer, position);

    gl_Position = position;
}
