// Spherical environment map
// Based on: http://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader

// view_pos: location of camera
// position: location of current point on surface
// normal: normal of current piont on surface
// envmap: spherical environment map texture

vec4 sphericalEnvironmentMap(vec3 view_pos, vec3 position, vec3 normal, sampler2D envmap) {
    // Normalized vector from camera to surface
    vec3 eye = normalize(position.xyz - view_pos.xyz);

    // Force surfaces to be in front of camera (safeguard that fixes fake camera optics)
    if (eye.z > 0.01) {
        eye.z = 0.01;
    }

    // Reflection of eye off of surface normal
    vec3 r = reflect(eye, normal);

    // Map reflected vector onto the surface of a sphere
    r.z += 1.;
    float m = 2. * length(r);

    // Adjust xy to account for spherical shape, and center in middle of texture
    vec2 uv = r.xy / m + .5;

    // Sample the environment map
    return texture2D(envmap, uv);
}

#pragma glslify: export(sphericalEnvironmentMap)
