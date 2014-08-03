vec3 environmentMap(colorMap, envMap) {
  vec4 color = texture2D( colorMap, gl_TexCoord[0].st);
  vec4 env = texture2D( envMap, gl_TexCoord[1].st);

  color = color + env*0.4;
  color = vec3(1.0, .5, .5);
    
  return color;

}

#pragma glslify: export(environmentMap)
