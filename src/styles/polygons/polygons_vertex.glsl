uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_map_position;
uniform vec4 u_tile_origin;
uniform float u_tile_proxy_order_offset;
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
    attribute vec2 a_extrude; // extrusion direction in xy plane
    attribute vec2 a_offset;  // offset direction in xy plane

    // Polygon and line styles have slightly different VBO layouts, saving memory by optimizing vertex packing.
    // All lines have a width scaling factor, but only some have a height (position.z) or offset.
    // The vertex height is stored in different attributes to account for this.
    attribute vec2 a_z_and_offset_scale; // stores vertex height in x, and offset scaling factor in y
    #define TANGRAM_POSITION_Z a_z_and_offset_scale.x // vertex height is stored in separate line-specific attrib
    #define TANGRAM_OFFSET_SCALING a_z_and_offset_scale.y // zoom scaling factor for line offset
    #define TANGRAM_WIDTH_SCALING a_position.z // zoom scaling factor for line width (stored in position attrib)

    uniform float u_v_scale_adjust; // scales texture UVs for line dash patterns w/fractional pixel width
#else
    #define TANGRAM_POSITION_Z a_position.z // vertex height
#endif

varying vec4 v_position;
varying vec3 v_normal;
varying vec4 v_color;
varying vec4 v_world_position;

// Optional texture UVs
#if defined(TANGRAM_TEXTURE_COORDS) || defined(TANGRAM_EXTRUDE_LINES)
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

#define TANGRAM_UNPACK_SCALING(x) (x / 1024.)

#pragma tangram: attributes
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
            v_texcoord.y *= u_v_scale_adjust;
        #endif
    #endif

    // Pass model position to fragment shader
    #ifdef TANGRAM_MODEL_POSITION_BASE_ZOOM_VARYING
        v_modelpos_base_zoom = modelPositionBaseZoom();
    #endif

    // Position
    vec4 position = vec4(a_position.xy, TANGRAM_POSITION_Z / TANGRAM_HEIGHT_SCALE, 1.); // convert height back to meters

    #ifdef TANGRAM_EXTRUDE_LINES
        vec2 _extrude = a_extrude.xy;
        vec2 _offset = a_offset.xy;

        // Adjust line width based on zoom level, to prevent proxied lines
        // from being either too small or too big.
        // "Flattens" the zoom between 1-2 to peg it to 1 (keeps lines from
        // prematurely shrinking), then interpolate and clamp to 4 (keeps lines
        // from becoming too small when far away).
        float _dz = clamp(u_map_position.z - u_tile_origin.z, 0., 4.);
        _dz += step(1., _dz) * (1. - _dz) + mix(0., 2., clamp((_dz - 2.) / 2., 0., 1.));

        // Interpolate line width between zooms
        float _mdz = (_dz - 0.5) * 2.; // zoom from mid-point
        _extrude -= _extrude * TANGRAM_UNPACK_SCALING(TANGRAM_WIDTH_SCALING) * _mdz;

        // Interpolate line offset between zooms
        // Scales from the larger value to the smaller one
        float _dwdz = TANGRAM_UNPACK_SCALING(TANGRAM_OFFSET_SCALING);
        float _sdwdz = sign(step(0., _dwdz) - 0.5); // sign indicates "direction" of scaling
        _offset -= _offset * abs(_dwdz) * ((1.-step(0., _sdwdz)) - (_dz * -_sdwdz)); // scale "up" or "down"

        // Scale line width and offset to be consistent in screen space
        float _ssz = exp2(-_dz - (u_tile_origin.z - u_tile_origin.w));
        _extrude *= _ssz;
        _offset *= _ssz;

        // Modify line width before extrusion
        #ifdef TANGRAM_BLOCK_WIDTH
            float width = 1.;
            #pragma tangram: width
            _extrude *= width;
        #endif

        position.xy += _extrude + _offset;
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
    applyLayerOrder(a_position.w + u_tile_proxy_order_offset + 1., position);

    gl_Position = position;
}
