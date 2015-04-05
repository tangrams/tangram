/*

Expected globals:
material
light_accumulator_*

*/

struct DirectionalLight {
    vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    vec3 direction;
};

void calculateLight(in DirectionalLight _light, in vec3 _eyeToPoint, in vec3 _normal) {

    light_accumulator_ambient += _light.ambient;

    float nDotVP = clamp(dot(_normal, -normalize(_light.direction)), 0.0, 1.0);

    #ifdef TANGRAM_MATERIAL_DIFFUSE
        light_accumulator_diffuse += _light.diffuse * nDotVP;
    #endif

    #ifdef TANGRAM_MATERIAL_SPECULAR
        float pf = 0.0;
        if (nDotVP > 0.0) {
            vec3 reflectVector = reflect(normalize(_light.direction), _normal);
            float eyeDotR = max(dot(normalize(_eyeToPoint), reflectVector), 0.0);
            pf = pow(eyeDotR, material.shininess);
        }
        light_accumulator_specular += _light.specular * pf;
    #endif
}
