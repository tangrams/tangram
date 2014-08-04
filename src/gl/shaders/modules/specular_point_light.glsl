vec3 specularLight (
    vec4 position,
    vec3 normal,
    vec3 color,
    vec4 light_pos,
    float light_ambient,
    const bool backlight) {

    vec3 light_dir = normalize(position.xyz - light_pos.xyz); // direction from the light to the model
    vec3 view_pos = vec3(0., 0., 500.); // approximate location of eye (TODO: make this configurable and calculated based on proper FOV/perspective calc)
    vec3 view_dir = normalize(position.xyz - view_pos.xyz); // direction from eye to model

    vec3 specularReflection;

    if (dot(normal, -light_dir) < 0.0) { // light source on the wrong side?
      specularReflection = vec3(0.0, 0.0, 0.0); // no specular reflection
    }
    else {
        // TODO: make configurable / part of material + light definitions
        float attenuation = 1.0;
        float lightSpecularTerm = 1.0;
        float materialSpecularTerm = 10.0;
        float materialShininessTerm = 10.0;

        specularReflection =
            attenuation *
            vec3(lightSpecularTerm) *
            vec3(materialSpecularTerm) *
            pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);
    }

    // specularReflection *= vec3(1., 0., 0.); // test specular color (TODO: add support in light definition)

    float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));

    // Diffuse + specular + ambient
    color *=
        diffuse +
        specularReflection +
        light_ambient;

    return color;
}

#pragma glslify: export(specularLight)
