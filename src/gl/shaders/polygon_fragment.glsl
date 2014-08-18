uniform vec2 u_resolution;
uniform vec2 u_aspect;
uniform mat4 u_meter_view;
uniform float u_meters_per_pixel;
uniform float u_time;
uniform vec2 u_tile_origin;
uniform float u_test;
uniform float u_test2;

varying vec3 v_color;
varying vec4 v_world_position;

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
        vec3 view_pos = vec3(0., 0., 100. * u_meters_per_pixel);
        // vec3 view_pos = vec3(- u_resolution.x / 2., - u_resolution.y / 2., 1300. * u_meters_per_pixel);
        // e = normalized vector from eye to vertex

        // vec3 e = v_position.xyz - view_pos.xyz; // unnormalized - bright green yellow red black quadrants
				vec3 e = normalize(v_position.xyz - view_pos.xyz); // original
					// dark green, red, black, with a crossing in the middle
					// i suspect this - can this be offset to start in the lower left?
					// the trouble seems to be with v_position.xyz;
					// view_pos.xyz is just an offset - moves the center left-down or up-right
				// vec3 e = normalize(v_position.xyz - (v_position.xyz / u_test)); // doesn't help
				// vec3 e = view_pos;

        // e.z = -abs(e.z);

        // Force surfaces to be in front of camera (due to fake camera optics)
        if (e.z > 0.01) {
            e.z = 0.01;
        }


        vec3 r = reflect( e, v_normal ); // original
        // vec3 r = reflect( e, normalize(v_normal) );
				// 2. = scale modifier
        float m = 2. * sqrt(
            pow( r.x, 2. ) +
            pow( r.y, 2. ) +
            pow( r.z + 1., 2. )
        );
        // float m = 2. * sqrt(
        //     pow( r.x, 2. ) +
        //     pow( r.y, 2. ) +
        //     pow( r.z + 1., u_test2 )
        // );

				// m is, roughly, scale - the +.5 is an offset
				// if m is 1, the texture stretches the whole width of the sceen
				// the + .5 seems to be in units of texure width - so .5 is half the width of the texture at its current scale
        vec2 texCoord = r.xy / m + .5; // original
        // vec2 texCoord = r.xy / u_test;
        // vec2 texCoord = r.xy / u_test + u_test2;

        color = texture2D( u_envMap, texCoord).rgb; // original
        // color = vec3(.0, texCoord); // light blues and greens - visible problem
        // color = vec3(.0, r.xy); // dark blues and greens - no visible problem
        // color = vec3(m); // black and white - no visible problem
        // color = e;
				// color = v_position.xyz; // cmyk quadrants
				// color = normalize(v_position.xyz); // green/red/black circluar fade
				// color = view_pos.xyz; // solid blue
				// color = normalize(view_pos.xyz); // still solid blue
				// color = v_normal; //


        // color = r;

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
    vec3 color_prelight = color;
    color *= lighting;

    #pragma tangram: fragment

    gl_FragColor = vec4(color, 1.0);
}
