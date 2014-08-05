vec3 environmentMap(sampler2D u_envMap, vec2 v_texCoord) {
  vec4 env = texture2D( u_envMap, v_texCoord);
  color = vec3(1.0, .5, .5, .0);    
  // return env.rgb;
  return color;

}

#pragma glslify: export(environmentMap)
