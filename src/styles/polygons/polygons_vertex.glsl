uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_map_position;
uniform vec4 u_tile_origin;
uniform float u_tile_proxy_depth;
uniform float u_meters_per_pixel;
uniform float u_device_pixel_ratio;

uniform mat4 u_model;
uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat3 u_inverseNormalMatrix;

attribute vec4 a_position;
attribute vec4 a_color;

// Optional normal attribute, otherwise default to up
#ifdef TANGRAM_NORMAL_ATTRIBUTE
    attribute vec3 a_normal;
    #define TANGRAM_NORMAL a_normal
#else
    #define TANGRAM_NORMAL vec3(0., 0., 1.)
#endif

// Optional dynamic line extrusion
#ifdef TANGRAM_EXTRUDE_LINES
    // xy: extrusion direction in xy plane
    // z:  half-width of line (amount to extrude)
    // w:  scaling factor for interpolating width between zooms
    attribute vec4 a_extrude;
    // xy: direction of line, for getting perpendicular offset
    attribute vec3 a_offset;
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

// Optional model position varying for tile coordinate zoom
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

void main() {
    // Initialize globals
    #pragma tangram: setup

    // Texture UVs
    #ifdef TANGRAM_TEXTURE_COORDS
        v_texcoord = a_texcoord;
        #ifdef TANGRAM_EXTRUDE_LINES
            v_texcoord.y *= TANGRAM_V_SCALE_ADJUST;
        #endif
    #endif

    // Pass model position to fragment shader
    #ifdef TANGRAM_MODEL_POSITION_BASE_ZOOM_VARYING
        v_modelpos_base_zoom = modelPositionBaseZoom();
    #endif

    // Position
    vec4 position = vec4(a_position.xy, a_position.z / TANGRAM_HEIGHT_SCALE, 1.); // convert height back to meters

    #ifdef TANGRAM_EXTRUDE_LINES
        vec2 extrude = a_extrude.xy;
        float dwdz = a_extrude.w / 1024.;
        vec2 offset = a_offset.xy;
        float offset_dwdz = a_offset.z / 1024.;

        // Adjust line width based on zoom level, to prevent proxied lines
        // from being either too small or too big.
        // "Flattens" the zoom between 1-2 to peg it to 1 (keeps lines from
        // prematurely shrinking), then interpolate and clamp to 4 (keeps lines
        // from becoming too small when far away).
        float dz = clamp(u_map_position.z - u_tile_origin.z, 0., 4.);
        dz += step(1., dz) * (1. - dz) + mix(0., 2., clamp((dz - 2.) / 2., 0., 1.));

        // Interpolate line width between zoom levels
        // extrude *= dwdz * dz;
        float sdwdz = sign(dwdz);
        extrude += extrude * dwdz * ((1.-step(0., sdwdz)) - (dz * -sdwdz));

        // Scale line width to be consistent in screen space
        // Scale from style zoom units back to tile zoom
        extrude *= exp2(-dz - (u_tile_origin.z - u_tile_origin.w));

        // Interpolate line width between zoom levels
        // offset += offset * offset_dwdz * dz;
        float osdwdz = sign(offset_dwdz);
        offset += offset * offset_dwdz * ((1.-step(0., osdwdz)) - (dz * -osdwdz));

        // Scale pixel dimensions to be consistent in screen space
        // Scale from style zoom units back to tile zoom
        offset *= exp2(-dz - (u_tile_origin.z - u_tile_origin.w));

        // Modify line width before extrusion
        #pragma tangram: width

        position.xy += extrude + offset;
    #endif

    // World coordinates for 3d procedural textures
    v_world_position = wrapWorldPosition(u_model * position);

    // Adjust for tile and view position
    position = u_modelView * position;

    // Modify position before camera projection
    #pragma tangram: position

    // Setup varyings
    v_position = position;
    v_normal = normalize(u_normalMatrix * TANGRAM_NORMAL);
    v_color = a_color;

    #if defined(TANGRAM_LIGHTING_VERTEX)
        // Vertex lighting
        vec3 normal = v_normal;

        // Modify normal before lighting
        #pragma tangram: normal

        // Pass lighting intensity to fragment shader
        v_lighting = calculateLighting(position.xyz - u_eye, normal, vec4(1.));
    #endif

    // Camera
    cameraProjection(position);

    // +1 is to keep all layers including proxies > 0
    applyLayerOrder(a_position.w + u_tile_proxy_depth + 1., position);

    gl_Position = position;
}
