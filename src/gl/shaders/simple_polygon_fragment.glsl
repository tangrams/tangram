uniform float u_meters_per_pixel;

varying vec3 v_color;

#if !defined(LIGHTING_VERTEX)
    varying vec4 v_position;
    varying vec3 v_normal;
#endif

// Imported functions
#pragma glslify: pointLight = require(./modules/point_light)

#pragma tangram: globals

void main (void) {
    vec3 color;

    #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting
        vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.); // location of point light (in pixels above ground)
        const float light_ambient = 0.5;
        const bool backlit = true;
        color = pointLight(v_position, v_normal, v_color, light_pos, light_ambient, backlit);
    #else
        color = v_color;
    #endif

    #pragma tangram: fragment

    gl_FragColor = vec4(color, 1.0);
}
