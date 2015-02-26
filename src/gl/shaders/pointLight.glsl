struct PointLight {
    vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    vec4 position;

    float radius;
    float cutoff;
};

void calculateLight(in PointLight _light, in vec3 _eyeToPoint, in vec3 _normal) {

    float dist = length(_light.position.xyz - _eyeToPoint);

    // Compute vector from surface to light position
    vec3 VP = (_light.position.xyz - _eyeToPoint) / dist;

    // Normalize the vector from surface to light position
    float nDotVP = clamp(dot(VP, _normal), 0.0, 1.0);

    //  Calculate Spherical attenuation based on:
    //  https://imdoingitwrong.wordpress.com/2011/01/31/light-attenuation/
    float d = max(dist - _light.radius, 0.0);
    float denom = d/_light.radius + 1.0;
    float attenuation = 1.0 / (denom*denom);
    attenuation = max((attenuation - _light.cutoff) / (1.0 - _light.cutoff), 0.0);

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
