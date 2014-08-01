// Spotlight effect
vec2 pixel_position = gl_FragCoord.xy / u_resolution.xy;  // scale coords to [0.0, 1.0]
pixel_position = pixel_position * 2.0 - 1.0;                    // scale coords to [-1.0, 1.0]
pixel_position *= u_aspect;                               // correct aspect ratio

color *= max(1.0 - distance(pixel_position, vec2(0.0, 0.0)), 0.2);
