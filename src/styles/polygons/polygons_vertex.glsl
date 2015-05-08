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
attribute vec4 a_color;
attribute float a_layer;

// Optional normal attribute, otherwise default to up
#ifdef TANGRAM_NORMAL_ATTRIBUTE
    attribute vec3 a_normal;
    #define TANGRAM_NORMAL a_normal
#else
    #define TANGRAM_NORMAL vec3(0., 0., 1.)
#endif

// Optional dynamic line extrusion
#ifdef TANGRAM_EXTRUDE_LINES
    attribute vec3 a_extrude;
    attribute float a_scale;
#endif

varying vec4 v_position;
varying vec3 v_normal;
varying vec4 v_color;
varying vec4 v_world_position;

// Optional texture UVs
#ifdef TANGRAM_TEXTURE_COORDS
    attribute vec2 a_texcoord;
    varying vec2 v_texcoord;
#endif

#if defined(TANGRAM_LIGHTING_VERTEX)
    varying vec4 v_lighting;
#endif

#pragma tangram: camera
#pragma tangram: material
#pragma tangram: lighting
#pragma tangram: global

void main() {
    // Adds vertex shader support for feature selection
    #pragma tangram: feature-selection-vertex

    // Texture UVs
    #ifdef TANGRAM_TEXTURE_COORDS
        v_texcoord = a_texcoord;
    #endif

    // Position
    vec4 position = vec4(a_position, 1.);

    #ifdef TANGRAM_EXTRUDE_LINES
        vec2 extrude = a_extrude.xy;
        float width = a_extrude.z;

        // Keep line width constant in screen-space
        float zscale = u_tile_origin.z - u_map_position.z;
        width *= pow(2., zscale);

        // Smoothly interpolate line width between zooms
        width = mix(width, width * a_scale * 256., -zscale);

        // Modify line width before extrusion
        #pragma tangram: width

        position.xy += extrude * width;
    #endif

    // World coordinates for 3d procedural textures
    v_world_position = u_model * position;
    #if defined(TANGRAM_WORLD_POSITION_WRAP)
        v_world_position.xy -= world_position_anchor;
    #endif

    // Adjust for tile and view position
    position = u_modelView * position;

    // Modify position before camera projection
    #pragma tangram: position

    // Setup varyings
    v_position = position;
    v_normal = normalize(u_normalMatrix * TANGRAM_NORMAL);
    v_color = a_color;

    // Vertex lighting
    #if defined(TANGRAM_LIGHTING_VERTEX)
        vec4 color = a_color;
        vec3 normal = TANGRAM_NORMAL;

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
