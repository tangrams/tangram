/*

Expected globals:
light_accumulator_*

*/

struct AmbientLight {
    vec3 ambient;
};

void calculateLight(in AmbientLight _light, in vec3 _eyeToPoint, in vec3 _normal) {
    light_accumulator_ambient.rgb += _light.ambient;
}
