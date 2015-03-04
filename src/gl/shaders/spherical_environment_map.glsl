// Spherical environment map
// Based on: http://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader

// view: location of camera
// position: location of current point on surface
// normal: normal of current point on surface
// skew: skewing factor (used to compensate for altered vanishing point)
// envmap: spherical environment map texture

vec4 sphericalEnvironmentMap(vec3 view, vec3 position, vec3 normal, vec2 skew, sampler2D envmap) {
    // Normalized vector from camera to surface
    vec3 eye = normalize(position.xyz - view.xyz);

    // Skew
    eye.xy -= skew;
    eye = normalize(eye);

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
