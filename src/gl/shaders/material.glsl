/*

Defines globals:
material
light_accumulator_*

*/


// MATERIALS
//
struct Material {
    #ifdef TANGRAM_MATERIAL_EMISSION
        vec4 emission;
        #ifdef TANGRAM_MATERIAL_EMISSION_TEXTURE
            vec3 emissionScale;
        #endif
    #endif

    #ifdef TANGRAM_MATERIAL_AMBIENT
        vec4 ambient;
        #ifdef TANGRAM_MATERIAL_AMBIENT_TEXTURE
            vec3 ambientScale;
        #endif
    #endif

    #ifdef TANGRAM_MATERIAL_DIFFUSE
        vec4 diffuse;
        #ifdef TANGRAM_MATERIAL_DIFFUSE_TEXTURE
            vec3 diffuseScale;
        #endif
    #endif

    #ifdef TANGRAM_MATERIAL_SPECULAR
        vec4 specular;
        float shininess;
        #ifdef TANGRAM_MATERIAL_SPECULAR_TEXTURE
            vec3 specularScale;
        #endif
    #endif


    #ifdef TANGRAM_MATERIAL_NORMAL_TEXTURE
        vec3 normalScale;
        float normalAmount;
    #endif
};

// Note: uniform is copied to a global instance to allow modification
uniform Material u_material;
Material material;

#ifdef TANGRAM_MATERIAL_EMISSION_TEXTURE
uniform sampler2D u_material_emission_texture;
#endif

#ifdef TANGRAM_MATERIAL_AMBIENT_TEXTURE
uniform sampler2D u_material_ambient_texture;
#endif

#ifdef TANGRAM_MATERIAL_DIFFUSE_TEXTURE
uniform sampler2D u_material_diffuse_texture;
#endif

#ifdef TANGRAM_MATERIAL_SPECULAR_TEXTURE
uniform sampler2D u_material_specular_texture;
#endif

#ifdef TANGRAM_MATERIAL_NORMAL_TEXTURE
uniform sampler2D u_material_normal_texture;
#endif

// Global light accumulators for each property
vec4 light_accumulator_ambient = vec4(0.0);
vec4 light_accumulator_diffuse = vec4(0.0);
#ifdef TANGRAM_MATERIAL_SPECULAR
    vec4 light_accumulator_specular = vec4(0.0);
#endif


#ifdef TANGRAM_MATERIAL_TEXTURE_SPHEREMAP
vec4 getSphereMap (in sampler2D _tex, in vec3 _eyeToPoint, in vec3 _normal, in vec2 _skew) {
    vec3 eye = normalize(_eyeToPoint);
    eye.xy -= _skew;
    eye = normalize(eye);

    vec3 r = reflect(eye, _normal);
    r.z += 1.0;
    float m = 2. * length(r);
    vec2 uv = r.xy / m + .5;
    return texture2D(_tex, uv);
}
#endif


#ifdef TANGRAM_MATERIAL_TEXTURE_TRIPLANAR
vec3 getTriPlanarBlend (in vec3 _normal) {
    vec3 blending = abs(_normal);
    blending = normalize(max(blending, 0.00001));
    float b = (blending.x + blending.y + blending.z);
    return blending / b;
}

vec4 getTriPlanar (in sampler2D _tex, in vec3 _pos, in vec3 _normal, in vec3 _scale) {
    vec3 blending = getTriPlanarBlend(_normal);
    vec4 xaxis = texture2D(_tex, fract(_pos.yz * _scale.x));
    vec4 yaxis = texture2D(_tex, fract(_pos.xz * _scale.y));
    vec4 zaxis = texture2D(_tex, fract(_pos.xy * _scale.z));
    return  xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;
}
#endif


#ifdef TANGRAM_MATERIAL_TEXTURE_PLANAR
vec4 getPlanar (in sampler2D _tex, in vec3 _pos, in vec2 _scale) {
    return texture2D( _tex, fract(_pos.xy * _scale.x) );
}
#endif


#ifdef TANGRAM_MATERIAL_NORMAL_TEXTURE
void calculateNormal (inout vec3 _normal) {
    // Get NORMALMAP
    //------------------------------------------------
    #ifdef TANGRAM_MATERIAL_NORMAL_TEXTURE_UV
    _normal += texture2D(u_material_normal_texture, fract(v_texcoord*material.normalScale.xy)).rgb*2.0-1.0;
    #endif

    #ifdef TANGRAM_MATERIAL_NORMAL_TEXTURE_PLANAR
    vec3 normalTex = getPlanar(u_material_normal_texture, v_world_position.xyz, material.normalScale.xy).rgb*2.0-1.0;
    _normal += normalTex;
    #endif

    #ifdef TANGRAM_MATERIAL_NORMAL_TEXTURE_TRIPLANAR
    vec3 normalTex = getTriPlanar(u_material_normal_texture, v_world_position.xyz, _normal, material.normalScale).rgb*2.0-1.0;
    _normal += normalTex;
    #endif

    _normal = normalize(_normal);
}
#endif

void calculateMaterial (in vec3 _eyeToPoint, inout vec3 _normal) {
    // get EMISSION TEXTUREMAP
    //------------------------------------------------
    #ifdef TANGRAM_MATERIAL_EMISSION_TEXTURE
        #ifdef TANGRAM_MATERIAL_EMISSION_TEXTURE_UV
        material.emission *= texture2D(u_material_emission_texture,v_texcoord);
        #endif

        #ifdef TANGRAM_MATERIAL_EMISSION_TEXTURE_PLANAR
        material.emission *= getPlanar(u_material_emission_texture, v_world_position.xyz, material.emissionScale.xy);
        #endif

        #ifdef TANGRAM_MATERIAL_EMISSION_TEXTURE_TRIPLANAR
        material.emission *= getTriPlanar(u_material_emission_texture, v_world_position.xyz, _normal, material.emissionScale);
        #endif

        #ifdef TANGRAM_MATERIAL_EMISSION_TEXTURE_SPHEREMAP
        material.emission *= getSphereMap(u_material_emission_texture, _eyeToPoint, _normal, u_vanishing_point);
        #endif
    #endif

    // get AMBIENT TEXTUREMAP
    //------------------------------------------------
    #ifdef TANGRAM_MATERIAL_AMBIENT_TEXTURE
        #ifdef TANGRAM_MATERIAL_AMBIENT_TEXTURE_UV
        material.ambient *= texture2D(u_material_ambient_texture,v_texcoord);
        #endif

        #ifdef TANGRAM_MATERIAL_AMBIENT_TEXTURE_PLANAR
        material.ambient *= getPlanar(u_material_ambient_texture, v_world_position.xyz, material.ambientScale.xy);
        #endif

        #ifdef TANGRAM_MATERIAL_AMBIENT_TEXTURE_TRIPLANAR
        material.ambient *= getTriPlanar(u_material_ambient_texture, v_world_position.xyz, _normal, material.ambientScale);
        #endif

        #ifdef TANGRAM_MATERIAL_AMBIENT_TEXTURE_SPHEREMAP
        material.ambient *= getSphereMap(u_material_ambient_texture, _eyeToPoint, _normal, u_vanishing_point);
        #endif
    #endif

    // get DIFFUSE TEXTUREMAP
    //------------------------------------------------
    #ifdef TANGRAM_MATERIAL_DIFFUSE_TEXTURE
        #ifdef TANGRAM_MATERIAL_DIFFUSE_TEXTURE_UV
        material.diffuse *= texture2D(u_material_diffuse_texture,v_texcoord);
        #endif

        #ifdef TANGRAM_MATERIAL_DIFFUSE_TEXTURE_PLANAR
        material.diffuse *= getPlanar(u_material_diffuse_texture, v_world_position.xyz, material.diffuseScale.xy);
        #endif

        #ifdef TANGRAM_MATERIAL_DIFFUSE_TEXTURE_TRIPLANAR
        material.diffuse *= getTriPlanar(u_material_diffuse_texture, v_world_position.xyz, _normal, material.diffuseScale);
        #endif

        #ifdef TANGRAM_MATERIAL_DIFFUSE_TEXTURE_SPHEREMAP
        material.diffuse *= getSphereMap(u_material_diffuse_texture, _eyeToPoint, _normal, u_vanishing_point);
        #endif
    #endif

    // get SPECULAR TEXTUREMAP
    //------------------------------------------------
    #ifdef TANGRAM_MATERIAL_SPECULAR_TEXTURE
        #ifdef TANGRAM_MATERIAL_SPECULAR_TEXTURE_UV
        material.specular *= texture2D(u_material_specular_texture,v_texcoord);
        #endif

        #ifdef TANGRAM_MATERIAL_SPECULAR_TEXTURE_PLANAR
        material.specular *= getPlanar(u_material_specular_texture, v_world_position.xyz, material.specularScale.xy);
        #endif

        #ifdef TANGRAM_MATERIAL_SPECULAR_TEXTURE_TRIPLANAR
        material.specular *= getTriPlanar(u_material_specular_texture, v_world_position.xyz, _normal, material.specularScale);
        #endif

        #ifdef TANGRAM_MATERIAL_SPECULAR_TEXTURE_SPHEREMAP
        material.specular *= getSphereMap(u_material_specular_texture, _eyeToPoint, _normal, u_vanishing_point);
        #endif
    #endif
}
