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
attribute vec4 a_shape;
attribute vec4 a_color;
attribute vec2 a_texcoord;
attribute vec2 a_offset;

#define TANGRAM_NORMAL vec3(0., 0., 1.)

varying vec4 v_color;
varying vec2 v_texcoord;
varying vec4 v_world_position;

#ifdef TANGRAM_MULTI_SAMPLER
varying float v_sampler;
#endif

#pragma tangram: camera
#pragma tangram: material
#pragma tangram: lighting
#pragma tangram: raster
#pragma tangram: global

vec2 rotate2D(vec2 _st, float _angle) {
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
}

void main() {
    // Initialize globals
    #pragma tangram: setup

    v_color = a_color;
    v_texcoord = a_texcoord;

    // Position
    vec4 position = u_modelView * vec4(a_position.xyz, 1.);

    // Apply positioning and scaling in screen space
    vec2 shape = a_shape.xy / 256.;                 // values have an 8-bit fraction
    vec2 offset = vec2(a_offset.x, -a_offset.y);    // flip y to make it point down
    float theta = a_shape.z / 4096.;                // values have a 12-bit fraction

    #ifdef TANGRAM_MULTI_SAMPLER
    v_sampler = a_shape.w; // texture sampler
    #endif

    shape = rotate2D(shape, theta);     // apply rotation to vertex
    shape += rotate2D(offset, theta);   // apply offset on rotated axis (e.g. so line labels follow text axis)

    // World coordinates for 3d procedural textures
    v_world_position = u_model * position;
    v_world_position.xy += shape * u_meters_per_pixel;
    v_world_position = wrapWorldPosition(v_world_position);

    // Modify position before camera projection
    #pragma tangram: position

    cameraProjection(position);

    #ifdef TANGRAM_LAYER_ORDER
        // +1 is to keep all layers including proxies > 0
        applyLayerOrder(a_position.w + u_tile_proxy_depth + 1., position);
    #endif

    // Apply pixel offset in screen-space
    // Multiply by 2 is because screen is 2 units wide Normalized Device Coords (and u_resolution device pixels wide)
    // Device pixel ratio adjustment is because shape is in logical pixels
    position.xy += shape * position.w * 2. * u_device_pixel_ratio / u_resolution;

    gl_Position = position;
}
