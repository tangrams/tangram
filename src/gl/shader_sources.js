var fs = require('fs');

var shaderSources = {};

shaderSources['gl/shaders/accessors'] = fs.readFileSync(__dirname + '/shaders/accessors.glsl', 'utf8');
shaderSources['gl/shaders/unpack'] = fs.readFileSync(__dirname + '/shaders/unpack.glsl', 'utf8');
shaderSources['gl/shaders/layer_order'] = fs.readFileSync(__dirname + '/shaders/layer_order.glsl', 'utf8');

shaderSources['gl/shaders/material'] = fs.readFileSync(__dirname + '/shaders/material.glsl', 'utf8');
shaderSources['gl/shaders/ambientLight'] = fs.readFileSync(__dirname + '/shaders/ambientLight.glsl', 'utf8');
shaderSources['gl/shaders/directionalLight'] = fs.readFileSync(__dirname + '/shaders/directionalLight.glsl', 'utf8');
shaderSources['gl/shaders/pointLight'] = fs.readFileSync(__dirname + '/shaders/pointLight.glsl', 'utf8');
shaderSources['gl/shaders/spotLight'] = fs.readFileSync(__dirname + '/shaders/spotLight.glsl', 'utf8');
shaderSources['gl/shaders/spherical_environment_map'] = fs.readFileSync(__dirname + '/shaders/spherical_environment_map.glsl', 'utf8');

shaderSources['gl/shaders/selection_globals'] = fs.readFileSync(__dirname + '/shaders/selection_globals.glsl', 'utf8');
shaderSources['gl/shaders/selection_vertex'] = fs.readFileSync(__dirname + '/shaders/selection_vertex.glsl', 'utf8');
shaderSources['gl/shaders/selection_fragment'] = fs.readFileSync(__dirname + '/shaders/selection_fragment.glsl', 'utf8');

shaderSources['styles/polygons/polygons_vertex'] = fs.readFileSync(__dirname + '/../styles/polygons/polygons_vertex.glsl', 'utf8');
shaderSources['styles/polygons/polygons_fragment'] = fs.readFileSync(__dirname + '/../styles/polygons/polygons_fragment.glsl', 'utf8');

shaderSources['styles/points/points_vertex'] = fs.readFileSync(__dirname + '/../styles/points/points_vertex.glsl', 'utf8');
shaderSources['styles/points/points_fragment'] = fs.readFileSync(__dirname + '/../styles/points/points_fragment.glsl', 'utf8');

module.exports = shaderSources;
