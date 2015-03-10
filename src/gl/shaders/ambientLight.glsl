struct AmbientLight {
    vec4 ambient;
};

void calculateLight(in AmbientLight _light, in vec3 _eyeToPoint, in vec3 _normal) {
    g_light_accumulator_ambient += _light.ambient;
}
