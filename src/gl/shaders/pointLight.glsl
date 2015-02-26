struct PointLight {
    vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    vec4 position;

    float attExp;
    float innerR;
    float outerR;
};

void calculateLight(in PointLight _light, in vec3 _eyeToPoint, in vec3 _normal) {

    float dist = length(_light.position.xyz - _eyeToPoint);

    // Compute vector from surface to light position
    vec3 VP = (_light.position.xyz - _eyeToPoint) / dist;

    // Normalize the vector from surface to light position
    float nDotVP = clamp(dot(VP, _normal), 0.0, 1.0);

    // Compute Attenuation
    float attenuation = 1.0;

    float Rin = 0.0;
    float Rdiff = 1.0;
    float e = 1.0;

    // If there is inner radius
    if (_light.innerR > 0.0) {
        Rin = _light.innerR;
    }

    // If there is an outer radius
    if (_light.outerR >= _light.innerR) {
        float Rout = _light.outerR;
        Rdiff = Rout-Rin;   
    }

    float d = clamp( max(0.0,dist-Rin)/Rdiff ,0.0,1.0);

    // If there is an exp to shape the interpolation
    if ( _light.attExp > 0.0) {
        e = _light.attExp;
    }

    attenuation = 1.0-pow(d,e);    

    #ifdef TANGRAM_MATERIAL_AMBIENT
        g_light_accumulator_ambient += _light.ambient * attenuation;
    #endif
    
    #ifdef TANGRAM_MATERIAL_DIFFUSE 
        g_light_accumulator_diffuse += _light.diffuse * nDotVP * attenuation;
    #endif

    #ifdef TANGRAM_MATERIAL_SPECULAR
        float pf = 0.0; // power factor for shiny speculars
        if (nDotVP > 0.0) {
            vec3 reflectVector = reflect(-VP, _normal);
            float eyeDotR = max(0.0, dot(-normalize(_eyeToPoint), reflectVector));
            pf = pow(eyeDotR, g_material.shininess);
        }

        g_light_accumulator_specular += _light.specular * pf * attenuation;
    #endif
}
