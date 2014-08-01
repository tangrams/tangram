uniform vec3 u_wood_color1; // = .1;
uniform vec3 u_wood_color2; // = .1;
uniform float u_wood_eccentricity; // = .07;
uniform float u_wood_twist; // = .07;
uniform float u_wood_scale; // = .07;
uniform float u_wood_spacing; // = .07;

vec3 wood( vec3 pos ) {

    float r = length(pos.xy);
    float phi = atan(pos.y, pos.x);

    phi += u_wood_twist * pos.z;
    // phi += u_test * pos.z;

    r *= 1.0 + u_wood_eccentricity * cos(phi);
    // r *= 1.0 + u_test3 * cos(phi);

    float k = u_wood_spacing / u_wood_scale;
    // float k = TAU / u_test2;

    float density = 1. + sin(k * r);

    return vec3(mix(
        u_wood_color1,
        u_wood_color2,
        density)
    );
}

#pragma glslify: export(wood)