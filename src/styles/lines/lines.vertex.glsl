uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_map_position;
uniform vec3 u_tile_origin;
uniform float u_meters_per_pixel;
uniform float u_device_pixel_ratio;

uniform mat4 u_model;
uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;

attribute vec3 a_position;
attribute vec3 a_extrude;
attribute vec2 a_scale;
// attribute vec3 a_normal;
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
    // vec4 position = u_modelView * vec4(a_position, 1.);
    vec4 position = vec4(a_position, 1.);
    vec2 extrude = a_extrude.xy;
    float width = a_extrude.z;

    // Keep line width constant in screen-space
    float zscale = u_tile_origin.z - u_map_position.z;
    width *= pow(2., zscale);

    // Smoothly interpolate line width between zooms
    if (zscale >= 0.) {
        width = mix(width, width * a_scale.x * 256., zscale);
    }
    else {
        width = mix(width, width * a_scale.y * 256., -zscale);
    }

    // Modify line width before extrusion
    #pragma tangram: width

    position.xy += extrude * width;
    position = u_modelView * position;

    // Modify position before camera projection
    #pragma tangram: position

    // Setup varyings
    v_position = position;
    v_normal = normalize(u_normalMatrix * vec3(0., 0., 1.));
    v_color = a_color;

    // Vertex lighting
    #if defined(TANGRAM_LIGHTING_VERTEX)
        vec4 color = a_color;
        vec3 normal = vec3(0., 0., 1.);

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
