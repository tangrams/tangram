struct SpotLight {
    vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    vec4 position;
    
    float radius;
    float cutoff;

    vec3 direction;
    float spotCosCutoff;
    float spotExponent;
};

void calculateLight(in SpotLight _light, in vec3 _eyeToPoint, in vec3 _normal) {

    float dist = length(_light.position.xyz - _eyeToPoint);

    // Compute vector from surface to light position
    vec3 VP = (_light.position.xyz - _eyeToPoint) / dist;

    // normal . light direction
    float nDotVP = clamp(dot(_normal, VP), 0.0, 1.0);

    //  Calculate Spherical attenuation based on:
    //  https://imdoingitwrong.wordpress.com/2011/01/31/light-attenuation/
    float d = max(dist - _light.radius, 0.0);
    float denom = d/_light.radius + 1.0;
    float attenuation = 1.0 / (denom*denom);
    attenuation = max((attenuation - _light.cutoff) / (1.0 - _light.cutoff), 0.0);

    // spotlight attenuation factor
    float spotAttenuation = 0.0;

    // See if point on surface is inside cone of illumination
    float spotDot = clamp(dot(-VP, normalize(_light.direction)), 0.0, 1.0);
    
    if (spotDot >= _light.spotCosCutoff) {
        spotAttenuation = pow(spotDot, _light.spotExponent);
    }

    #ifdef TANGRAM_MATERIAL_AMBIENT
        g_light_accumulator_ambient += _light.ambient * attenuation * spotAttenuation;
    #endif

    #ifdef TANGRAM_MATERIAL_DIFFUSE 
        g_light_accumulator_diffuse += _light.diffuse * nDotVP * attenuation * spotAttenuation;
    #endif

    #ifdef TANGRAM_MATERIAL_SPECULAR
        // Power factor for shiny speculars
        float pf = 0.0;
        if (nDotVP > 0.0) {
            vec3 reflectVector = reflect(-VP, _normal);
            float eyeDotR = max(dot(-normalize(_eyeToPoint), reflectVector), 0.0);
            pf = pow(eyeDotR, g_material.shininess);
        }
        g_light_accumulator_specular += _light.specular * pf * attenuation * spotAttenuation;
    #endif
}
