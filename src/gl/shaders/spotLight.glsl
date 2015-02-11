struct SpotLight {
    vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    vec4 position;
    vec3 direction;
    float spotCosCutoff;
    float spotExponent;

    #ifdef TANGRAM_SPOTLIGHT_CONSTANT_ATTENUATION
        #define TANGRAM_SPOTLIGHT_ATTENUATION
        float constantAttenuation;
    #endif

    #ifdef TANGRAM_SPOTLIGHT_LINEAR_ATTENUATION
        #ifndef TANGRAM_SPOTLIGHT_ATTENUATION
            #define TANGRAM_SPOTLIGHT_ATTENUATION
        #endif
        float linearAttenuation;
    #endif

    #ifdef TANGRAM_SPOTLIGHT_QUADRATIC_ATTENUATION
        #ifndef TANGRAM_SPOTLIGHT_ATTENUATION
            #define TANGRAM_SPOTLIGHT_ATTENUATION
        #endif
        float quadraticAttenuation;
    #endif
};

void calculateLight(in SpotLight _light, in vec3 _eyeToPoint, in vec3 _normal) {

    float dist = length(_light.position.xyz - _eyeToPoint);

    // Compute vector from surface to light position
    vec3 VP = (_light.position.xyz - _eyeToPoint) / dist;

    // spotlight attenuation factor
    float spotAttenuation = 0.0;

    // See if point on surface is inside cone of illumination
    float spotDot = clamp(dot(-VP, normalize(_light.direction)), 0.0, 1.0);

    
    if (spotDot >= _light.spotCosCutoff) {
        spotAttenuation = pow(spotDot, _light.spotExponent);
    }

    #ifdef TANGRAM_SPOTLIGHT_ATTENUATION
        float atFactor = 0.0;
        #ifdef TANGRAM_SPOTLIGHT_CONSTANT_ATTENUATION
            atFactor += _light.constantAttenuation;
        #endif

        #ifdef TANGRAM_SPOTLIGHT_LINEAR_ATTENUATION
            atFactor += _light.linearAttenuation * dist;
        #endif
            
        #ifdef TANGRAM_SPOTLIGHT_QUADRATIC_ATTENUATION
            atFactor += _light.quadraticAttenuation * dist * dist;
        #endif
        spotAttenuation /= atFactor;
    #endif

    // normal . light direction
    float nDotVP = clamp(dot(_normal, VP), 0.0, 1.0);

    #ifdef TANGRAM_MATERIAL_AMBIENT
        g_light_accumulator_ambient += _light.ambient * spotAttenuation;
    #endif

    #ifdef TANGRAM_MATERIAL_DIFFUSE 
        g_light_accumulator_diffuse += _light.diffuse * nDotVP * spotAttenuation;
    #endif

    #ifdef TANGRAM_MATERIAL_SPECULAR
        // Power factor for shiny speculars
        float pf = 0.0;
        if (nDotVP > 0.0) {
            vec3 reflectVector = reflect(-VP, _normal);
            float eyeDotR = max(dot(-normalize(_eyeToPoint), reflectVector), 0.0);
            pf = pow(eyeDotR, g_material.shininess);
        }
        g_light_accumulator_specular += _light.specular * pf * spotAttenuation;
    #endif
}
