// Generated from GLSL files, don't edit!
var shader_sources = {};

shader_sources['point_fragment'] =
"\n" +
"#define GLSLIFY 1\n" +
"\n" +
"uniform vec2 u_resolution;\n" +
"varying vec3 fcolor;\n" +
"varying vec2 ftexcoord;\n" +
"void main(void) {\n" +
"  vec4 color = vec4(fcolor, 1.);\n" +
"  float len = length(ftexcoord);\n" +
"  if(len > 1.) {\n" +
"    discard;\n" +
"  }\n" +
"  color.rgb *= (1. - smoothstep(.25, 1., len)) + 0.5;\n" +
"  #if defined(EFFECT_SCREEN_COLOR)\n" +
"  color.rgb += vec3(gl_FragCoord.x / u_resolution.x, 0.0, gl_FragCoord.y / u_resolution.y);\n" +
"  #endif\n" +
"  gl_FragColor = color;\n" +
"}\n" +
"";

shader_sources['point_vertex'] =
"\n" +
"#define GLSLIFY 1\n" +
"\n" +
"uniform vec2 u_map_center;\n" +
"uniform float u_map_zoom;\n" +
"uniform vec2 u_meter_zoom;\n" +
"uniform vec2 u_tile_min;\n" +
"uniform vec2 u_tile_max;\n" +
"uniform float u_num_layers;\n" +
"attribute vec3 a_position;\n" +
"attribute vec2 a_texcoord;\n" +
"attribute vec3 a_color;\n" +
"attribute float a_layer;\n" +
"varying vec3 fcolor;\n" +
"varying vec2 ftexcoord;\n" +
"void main() {\n" +
"  vec3 vposition = a_position;\n" +
"  vposition.y *= -1.0;\n" +
"  vposition.xy *= (u_tile_max - u_tile_min) / TILE_SCALE;\n" +
"  vposition.xy += u_tile_min.xy - u_map_center;\n" +
"  vposition.xy /= u_meter_zoom;\n" +
"  fcolor = a_color;\n" +
"  ftexcoord = a_texcoord;\n" +
"  float z_layer_scale = 4096.;\n" +
"  float z_layer_range = (u_num_layers + 1.) * z_layer_scale;\n" +
"  float z_layer = (a_layer + 1.) * z_layer_scale;\n" +
"  vposition.z = z_layer + clamp(vposition.z, 1., z_layer_scale);\n" +
"  vposition.z = (z_layer_range - vposition.z) / z_layer_range;\n" +
"  gl_Position = vec4(vposition, 1.0);\n" +
"}\n" +
"";

shader_sources['polygon_fragment'] =
"\n" +
"#define GLSLIFY 1\n" +
"\n" +
"uniform vec2 u_resolution;\n" +
"uniform float u_time;\n" +
"varying vec3 fcolor;\n" +
"#if defined(EFFECT_NOISE_TEXTURE)\n" +
"\n" +
"varying vec3 fposition;\n" +
"vec3 a_x_mod289(vec3 x) {\n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0;\n" +
"}\n" +
"vec4 a_x_mod289(vec4 x) {\n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0;\n" +
"}\n" +
"vec4 a_x_permute(vec4 x) {\n" +
"  return a_x_mod289(((x * 34.0) + 1.0) * x);\n" +
"}\n" +
"vec4 a_x_taylorInvSqrt(vec4 r) {\n" +
"  return 1.79284291400159 - 0.85373472095314 * r;\n" +
"}\n" +
"vec3 a_x_fade(vec3 t) {\n" +
"  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\n" +
"}\n" +
"float a_x_cnoise(vec3 P) {\n" +
"  vec3 Pi0 = floor(P);\n" +
"  vec3 Pi1 = Pi0 + vec3(1.0);\n" +
"  Pi0 = a_x_mod289(Pi0);\n" +
"  Pi1 = a_x_mod289(Pi1);\n" +
"  vec3 Pf0 = fract(P);\n" +
"  vec3 Pf1 = Pf0 - vec3(1.0);\n" +
"  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n" +
"  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n" +
"  vec4 iz0 = Pi0.zzzz;\n" +
"  vec4 iz1 = Pi1.zzzz;\n" +
"  vec4 ixy = a_x_permute(a_x_permute(ix) + iy);\n" +
"  vec4 ixy0 = a_x_permute(ixy + iz0);\n" +
"  vec4 ixy1 = a_x_permute(ixy + iz1);\n" +
"  vec4 gx0 = ixy0 * (1.0 / 7.0);\n" +
"  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n" +
"  gx0 = fract(gx0);\n" +
"  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n" +
"  vec4 sz0 = step(gz0, vec4(0.0));\n" +
"  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n" +
"  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n" +
"  vec4 gx1 = ixy1 * (1.0 / 7.0);\n" +
"  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n" +
"  gx1 = fract(gx1);\n" +
"  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n" +
"  vec4 sz1 = step(gz1, vec4(0.0));\n" +
"  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n" +
"  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n" +
"  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\n" +
"  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\n" +
"  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\n" +
"  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\n" +
"  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\n" +
"  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\n" +
"  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\n" +
"  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\n" +
"  vec4 norm0 = a_x_taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n" +
"  g000 *= norm0.x;\n" +
"  g010 *= norm0.y;\n" +
"  g100 *= norm0.z;\n" +
"  g110 *= norm0.w;\n" +
"  vec4 norm1 = a_x_taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n" +
"  g001 *= norm1.x;\n" +
"  g011 *= norm1.y;\n" +
"  g101 *= norm1.z;\n" +
"  g111 *= norm1.w;\n" +
"  float n000 = dot(g000, Pf0);\n" +
"  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n" +
"  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n" +
"  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n" +
"  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n" +
"  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n" +
"  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n" +
"  float n111 = dot(g111, Pf1);\n" +
"  vec3 fade_xyz = a_x_fade(Pf0);\n" +
"  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n" +
"  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n" +
"  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n" +
"  return 2.2 * n_xyz;\n" +
"}\n" +
"#endif\n" +
"\n" +
"void main(void) {\n" +
"  \n" +
"  #if defined(EFFECT_SPOTLIGHT)\n" +
"  vec2 position = gl_FragCoord.xy / u_resolution.xy;\n" +
"  position = position * 2.0 - 1.0;\n" +
"  position.y *= u_resolution.y / u_resolution.x;\n" +
"  vec3 color = fcolor * max(1.0 - distance(position, vec2(0.0, 0.0)), 0.2);\n" +
"  #else\n" +
"  vec3 color = fcolor;\n" +
"  #endif\n" +
"  \n" +
"  #if defined(EFFECT_COLOR_BLEED)\n" +
"  color += vec3(gl_FragCoord.x / u_resolution.x, 0.0, gl_FragCoord.y / u_resolution.y);\n" +
"  color.r += sin(u_time / 3.0);\n" +
"  #endif\n" +
"  \n" +
"  #if defined (EFFECT_NOISE_TEXTURE)\n" +
"  \n" +
"  #if defined(EFFECT_NOISE_ANIMATABLE) && defined(EFFECT_NOISE_ANIMATED)\n" +
"  color *= (abs(a_x_cnoise((fposition + vec3(u_time * 5., u_time * 7.5, u_time * 10.)) / 10.0)) / 4.0) + 0.75;\n" +
"  #endif\n" +
"  \n" +
"  #ifndef EFFECT_NOISE_ANIMATABLE\n" +
"  color *= (abs(a_x_cnoise(fposition / 10.0)) / 4.0) + 0.75;\n" +
"  #endif\n" +
"  \n" +
"  #endif\n" +
"  gl_FragColor = vec4(color, 1.0);\n" +
"}\n" +
"";

shader_sources['polygon_vertex'] =
"\n" +
"#define GLSLIFY 1\n" +
"\n" +
"uniform vec2 u_resolution;\n" +
"uniform float u_time;\n" +
"uniform vec2 u_map_center;\n" +
"uniform float u_map_zoom;\n" +
"uniform vec2 u_meter_zoom;\n" +
"uniform vec2 u_tile_min;\n" +
"uniform vec2 u_tile_max;\n" +
"uniform float u_num_layers;\n" +
"attribute vec3 a_position;\n" +
"attribute vec3 a_normal;\n" +
"attribute vec3 a_color;\n" +
"attribute float a_layer;\n" +
"varying vec3 fcolor;\n" +
"vec3 a_x_perspectiveTransform(vec3 position) {\n" +
"  \n" +
"  #if defined(PROJECTION_PERSPECTIVE)\n" +
"  const vec2 perspective_offset = vec2(-0.25, -0.25);\n" +
"  const vec2 perspective_factor = vec2(0.8, 0.8);\n" +
"  position.xy += position.z * perspective_factor * (position.xy - perspective_offset) / u_meter_zoom.xy;\n" +
"  #elif defined(PROJECTION_ISOMETRIC) || defined(PROJECTION_POPUP)\n" +
"  \n" +
"  #if defined(PROJECTION_POPUP)\n" +
"  if(position.z > 1.0) {\n" +
"    float cd = distance(position.xy * (u_resolution.xy / u_resolution.yy), vec2(0.0, 0.0));\n" +
"    const float popup_fade_inner = 0.5;\n" +
"    const float popup_fade_outer = 0.75;\n" +
"    if(cd > popup_fade_inner) {\n" +
"      position.z *= 1.0 - smoothstep(popup_fade_inner, popup_fade_outer, cd);\n" +
"    }\n" +
"    const float zoom_boost_start = 15.0;\n" +
"    const float zoom_boost_end = 17.0;\n" +
"    const float zoom_boost_magnitude = 0.75;\n" +
"    position.z *= 1.0 + (1.0 - smoothstep(zoom_boost_start, zoom_boost_end, map_zoom)) * zoom_boost_magnitude;\n" +
"  }\n" +
"  #endif\n" +
"  position.y += position.z / u_meter_zoom.y;\n" +
"  #endif\n" +
"  return position;\n" +
"}\n" +
"#if defined(EFFECT_NOISE_TEXTURE)\n" +
"\n" +
"varying vec3 fposition;\n" +
"#endif\n" +
"\n" +
"vec3 light;\n" +
"const float ambient = 0.45;\n" +
"vec3 modelTransform(vec3 position) {\n" +
"  position.y *= -1.0;\n" +
"  position.xy *= (u_tile_max - u_tile_min) / TILE_SCALE;\n" +
"  return position;\n" +
"}\n" +
"vec3 modelViewTransform(vec3 position) {\n" +
"  position = modelTransform(position);\n" +
"  position.xy += u_tile_min.xy - u_map_center;\n" +
"  position.xy /= u_meter_zoom;\n" +
"  return position;\n" +
"}\n" +
"float calculateZ(float z, float layer) {\n" +
"  float z_layer_scale = 4096.;\n" +
"  float z_layer_range = (u_num_layers + 1.) * z_layer_scale;\n" +
"  float z_layer = (layer + 1.) * z_layer_scale;\n" +
"  z = z_layer + clamp(z, 1., z_layer_scale);\n" +
"  z = (z_layer_range - z) / z_layer_range;\n" +
"  return z;\n" +
"}\n" +
"vec3 lighting(vec3 position, vec3 normal, vec3 color) {\n" +
"  \n" +
"  #if defined(LIGHTING_POINT) || defined(LIGHTING_NIGHT)\n" +
"  light = vec3(-0.25, -0.25, 0.50);\n" +
"  #if defined(LIGHTING_NIGHT)\n" +
"  light = normalize(vec3(position.x, position.y, position.z) - light);\n" +
"  color *= dot(normal, light * -1.0);\n" +
"  #else\n" +
"  light = normalize(vec3(position.x, position.y, -position.z) - light);\n" +
"  color *= dot(normal, light * -1.0) + ambient + clamp(position.z * 2.0 / u_meter_zoom.x, 0.0, 0.25);\n" +
"  #endif\n" +
"  \n" +
"  #elif defined(LIGHTING_DIRECTION)\n" +
"  light = normalize(vec3(0.2, 0.7, -0.5));\n" +
"  color *= dot(normal, light * -1.0) + ambient;\n" +
"  #endif\n" +
"  return color;\n" +
"}\n" +
"vec3 effects(vec3 position, vec3 vposition) {\n" +
"  \n" +
"  #if defined(ANIMATION_ELEVATOR) || defined(ANIMATION_WAVE) || defined(EFFECT_NOISE_TEXTURE)\n" +
"  vec3 vposition_world = modelTransform(position) + vec3(u_tile_min, 0.);\n" +
"  #if defined(EFFECT_NOISE_TEXTURE)\n" +
"  fposition = vposition_world;\n" +
"  #endif\n" +
"  if(vposition_world.z > 1.0) {\n" +
"    \n" +
"    #if defined(ANIMATION_ELEVATOR)\n" +
"    vposition.z *= max((sin(vposition_world.z + u_time) + 1.0) / 2.0, 0.05);\n" +
"    #elif defined(ANIMATION_WAVE)\n" +
"    vposition.z *= max((sin(vposition_world.x / 100.0 + u_time) + 1.0) / 2.0, 0.05);\n" +
"    #endif\n" +
"    \n" +
"  }\n" +
"  #endif\n" +
"  return vposition;\n" +
"}\n" +
"void main() {\n" +
"  vec3 vposition = a_position;\n" +
"  vec3 vnormal = a_normal;\n" +
"  vposition = modelViewTransform(vposition);\n" +
"  vposition = effects(a_position, vposition);\n" +
"  fcolor = lighting(vposition, vnormal, a_color);\n" +
"  vposition = a_x_perspectiveTransform(vposition);\n" +
"  vposition.z = calculateZ(vposition.z, a_layer);\n" +
"  gl_Position = vec4(vposition, 1.0);\n" +
"}\n" +
"";

if (module.exports !== undefined) { module.exports = shader_sources; }

