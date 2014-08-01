uniform vec2 u_aspect;
uniform mat4 u_tile_view;
uniform mat4 u_meter_view;
uniform float u_meters_per_pixel;
uniform float u_num_layers;

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;
attribute float a_layer;

varying vec3 v_color;

#if !defined(LIGHTING_VERTEX)
    varying vec4 v_position;
    varying vec3 v_normal;
#endif

// Imported functions
#pragma glslify: perspective = require(./modules/perspective)
#pragma glslify: isometric = require(./modules/isometric, u_aspect = u_aspect)
#pragma glslify: calculateZ = require(./modules/depth_scale)
#pragma glslify: pointLight = require(./modules/point_light)

#pragma tangram: globals

void main() {
    vec4 position = u_tile_view * vec4(a_position, 1.);

    #pragma tangram: vertex

    // Shading
    #if defined(LIGHTING_VERTEX)
        vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.); // location of point light (in pixels above ground)
        const float light_ambient = 0.5;
        const bool backlit = true;
        v_color = pointLight(position, a_normal, a_color, light_pos, light_ambient, backlit);
    #else
        // Send to fragment shader for per-pixel lighting
        v_position = position;
        v_normal = a_normal;
        v_color = a_color;
    #endif

    // Projection
    position = u_meter_view * position; // convert meters to screen space (0-1)

    #if defined(PROJECTION_PERSPECTIVE)
        position = perspective(position, vec2(-0.25, -0.25), vec2(0.6, 0.6));
    #elif defined(PROJECTION_ISOMETRIC)
        position = isometric(position, vec2(0., 1.), 1.);
    #endif

    position.z = calculateZ(position.z, a_layer, u_num_layers, 4096.);

    gl_Position = position;
}
