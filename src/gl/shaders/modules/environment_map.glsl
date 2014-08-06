vec3 environmentMap(sampler2D envMap, vec2 texCoord) {
  vec4 env = texture2D( envMap, texCoord);
  // vec3 color = vec3(1.0, .5, .5);    
  return env.rgb;
  // return color;

}

#pragma glslify: export(environmentMap)
