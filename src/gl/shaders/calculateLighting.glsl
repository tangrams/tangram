
vec3 lightFragment(in vec3 _eyeToPoint, in vec3 _normal, inout vec4 _colorOut) {

    #pragma tangram: fragment_lights_to_compute

    //  Final light intensity calculation
    //
    vec4 color = vec4(0.0);
  
    #ifdef TANGRAM_MATERIAL_EMISSION
        color = g_material.emission;
    #endif

    #ifdef TANGRAM_MATERIAL_AMBIENT
        color += g_light_accumulator_ambient * g_material.ambient;
    #endif

    #ifdef TANGRAM_MATERIAL_DIFFUSE
        color += g_light_accumulator_diffuse * g_material.diffuse;
    #endif

    #ifdef TANGRAM_MATERIAL_SPECULAR
        color += g_light_accumulator_specular * g_material.specular;
    #endif

    color = clamp(color, 0.0, 1.0);

    return color.rgb;
}
