uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_map_position;
uniform vec4 u_tile_origin;
uniform float u_meters_per_pixel;
uniform float u_device_pixel_ratio;

uniform mat3 u_normalMatrix;
uniform mat3 u_inverseNormalMatrix;

varying vec4 v_position;
varying vec3 v_normal;
varying vec4 v_color;
varying vec4 v_world_position;

#define TANGRAM_NORMAL v_normal

#ifdef TANGRAM_TEXTURE_COORDS
    varying vec2 v_texcoord;
#endif

#ifdef TANGRAM_MODEL_POSITION_BASE_ZOOM_VARYING
    varying vec4 v_modelpos_base_zoom;
#endif

#if defined(TANGRAM_LIGHTING_VERTEX)
    varying vec4 v_lighting;
#endif

#pragma tangram: camera
#pragma tangram: material
#pragma tangram: lighting
#pragma tangram: raster
#pragma tangram: global

void main (void) {
    // Initialize globals
    #pragma tangram: setup

    vec4 color = v_color;
    vec3 normal = TANGRAM_NORMAL;

    // Apply raster to vertex color
    #ifdef TANGRAM_RASTER_TEXTURE_COLOR
        color *= sampleRaster(0); // multiplied to tint texture color
    #endif

    // Apply normal from raster tile
    #ifdef TANGRAM_RASTER_TEXTURE_NORMAL
        normal = normalize(sampleRaster(0).rgb * 2. - 1.);
    #endif

    // Normal modification applied here for fragment lighting or no lighting,
    // and in vertex shader for vertex lighting
    #if !defined(TANGRAM_LIGHTING_VERTEX)
        #pragma tangram: normal
    #endif

    // Color modification before lighting is applied
    #pragma tangram: color

    #if defined(TANGRAM_LIGHTING_FRAGMENT)
        // Calculate per-fragment lighting
        color = calculateLighting(v_position.xyz - u_eye, normal, color);
    #elif defined(TANGRAM_LIGHTING_VERTEX)
        // Apply lighting intensity interpolated from vertex shader
        color *= v_lighting;
    #endif

    // Post-processing effects (modify color after lighting)
    #pragma tangram: filter

    gl_FragColor = color;
}
