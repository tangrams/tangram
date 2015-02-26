// MATERIALS
//
struct Material {
    #ifdef TANGRAM_MATERIAL_EMISSION
        vec4 emission;
    #endif

    #ifdef TANGRAM_MATERIAL_AMBIENT
        vec4 ambient;
    #endif 

    #ifdef TANGRAM_MATERIAL_DIFFUSE
        vec4 diffuse;
    #endif

    #ifdef TANGRAM_MATERIAL_SPECULAR
        vec4 specular;
        float shininess;
    #endif
};

// Note: uniforms (u_[name]) and varyings (v_[name]) are 
//      copy to global instances ( g_[name] ) to allow 
//      modifications
//
uniform Material u_material;
Material g_material = u_material;

// GLOBAL LIGHTS ACCUMULATORS for each enable MATERIAL property
//
#ifdef TANGRAM_MATERIAL_AMBIENT
    vec4 g_light_accumulator_ambient = vec4(0.0);
#endif
#ifdef TANGRAM_MATERIAL_DIFFUSE
    vec4 g_light_accumulator_diffuse = vec4(0.0);
#endif
#ifdef TANGRAM_MATERIAL_SPECULAR
    vec4 g_light_accumulator_specular = vec4(0.0);
#endif
