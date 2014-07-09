vec3 pointLight (
    vec4 position,
    vec3 normal,
    vec3 color,
    vec4 light_pos,
    float light_ambient,
    const bool backlight) {

    vec3 light_dir = normalize(position.xyz - light_pos.xyz); // from light point to vertex

    vec3 view_pos = vec3(0., 0., 500.);
    vec3 view_dir = normalize(position.xyz - view_pos.xyz);


    // color *= abs(max(float(backlight) * -1., dot(normal, -light_dir ))) + light_ambient;

	// color *= max(0., dot(normal, light_dir * -1.0)) + light_ambient;



    // vec3 viewDirection = normalize(vec3(v_inv * vec4(0.0, 0.0, 0.0, 1.0) - m * v_coord));
    // vec3 viewDirection = normalize(vec3(position * vec4(0.0, 0.0, 0.0, 1.0) * position));
    // vec3 lightDirection = normalize(light_pos.xyz);
    // vec3 normalDirection = normalize(normal);

    vec3 specularReflection;
    if (dot(normal, -light_dir) < 0.0) // light source on the wrong side?
    {
      specularReflection = vec3(0.0, 0.0, 0.0); // no specular reflection
    }
    else
    {
        float attenuation = 1.0;
        float lightSpecularTerm = 1.0;
        float materialSpecularTerm = 10.0;
        float materialShininessTerm = 10.0;

        specularReflection = attenuation * vec3(lightSpecularTerm) * vec3(materialSpecularTerm) * 
            pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);

        // specularReflection = attenuation * vec3(light0.specular) * vec3(mymaterial.specular) * pow(max(0.0, dot(reflect(-lightDirection, normalDirection), viewDirection)), mymaterial.shininess);
    }

    color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient + specularReflection;

    // return normalDirection;
    return color;
}

#pragma glslify: export(pointLight)
