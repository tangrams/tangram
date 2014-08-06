uniform vec2 u_resolution;
uniform vec2 u_aspect;
uniform mat4 u_meter_view;
uniform float u_meters_per_pixel;
uniform float u_time;

varying vec3 v_color;
varying vec4 v_position_world;

#if defined(LIGHTING_ENVIRONMENT)
    uniform sampler2D u_envMap;
    // varying vec2 texCoord;
#endif

#if !defined(LIGHTING_VERTEX)
    varying vec4 v_position;
    varying vec3 v_normal;
#else
    varying vec3 v_lighting;
#endif

const float light_ambient = 0.5;

// Imported functions
#pragma glslify: calculateLighting = require(./modules/lighting)
// #pragma glslify: environmentMap = require(./modules/environment_map)

#pragma tangram: globals

void main (void) {
    vec3 color = v_color;

    #if defined(LIGHTING_ENVIRONMENT)

        // approximate location of eye (TODO: make this configurable)
        vec3 view_pos = vec3(0., 0., 300. * u_meters_per_pixel); 
        // e = normalized vector from eye to vertex
        vec3 e = normalize(v_position.xyz - view_pos.xyz);
        // e.z = -abs(e.z);
        // if (e.z > 0.) {
        //     e.z = 0.;
        // }

        vec3 r = reflect( e, v_normal );
        float m = 2. * sqrt( 
            pow( r.x, 2. ) + 
            pow( r.y, 2. ) + 
            pow( r.z + 1., 2. ) 
        );

        vec2 texCoord = r.xy / m + .5;

        color = texture2D( u_envMap, texCoord).rgb;

    #endif

    #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting
        vec3 lighting = calculateLighting(
            v_position, v_normal, /*color*/ vec3(1.),
            vec4(0., 0., 150. * u_meters_per_pixel, 1.), // location of point light (in pixels above ground)
            vec4(0., 0., 50. * u_meters_per_pixel, 1.), // location of point light for 'night' mode (in pixels above ground)
            vec3(0.2, 0.7, -0.5), // direction of light for flat shading
            light_ambient);
    #else
        vec3 lighting = v_lighting;
    #endif

    // Apply lighting to color (can be overriden by transforms)
    // color *= lighting;

    #pragma tangram: fragment

    gl_FragColor = vec4(color, 1.0);
}
