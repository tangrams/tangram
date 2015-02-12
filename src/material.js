/*global Material */
import ShaderProgram from './gl/shader_program';
import shaderSources from './gl/shader_sources'; // built-in shaders
import GLSL from './gl/glsl';

export default class Material {
    constructor (config = {}) {
        this.emission = config.emission && config.emission.map(parseFloat);
        this.ambient = config.ambient && config.ambient.map(parseFloat);
        this.diffuse = config.diffuse ? config.diffuse.map(parseFloat) : [1,1,1];
        this.specular = config.specular && config.specular.map(parseFloat);
        this.shininess = config.shininess ? parseFloat(config.shininess) : 0.2;

        this.emission = GLSL.expandVec4(this.emission);
        this.ambient = GLSL.expandVec4(this.ambient);
        this.diffuse = GLSL.expandVec4(this.diffuse);
        this.specular = GLSL.expandVec4(this.specular);
    }

    inject (style) {
        if (this.emission) {
            style.defines['TANGRAM_MATERIAL_EMISSION'] = true;
        }
        if (this.ambient) {
            style.defines['TANGRAM_MATERIAL_AMBIENT'] = true;
        }
        if (this.diffuse) {
            style.defines['TANGRAM_MATERIAL_DIFFUSE'] = true;
        }
        if (this.specular) {
            style.defines['TANGRAM_MATERIAL_SPECULAR'] = true;
        }

        style.addShaderTransform(Material.transform, shaderSources['gl/shaders/material']);
    }

    setupProgram (_program) {
        if (this.emission) {
            _program.uniform('4fv', 'u_material.emission', this.emission);
        }
        if (this.ambient) {
            _program.uniform('4fv', 'u_material.ambient', this.ambient);
        }
        if (this.diffuse) {
            _program.uniform('4fv', 'u_material.diffuse', this.diffuse);
        }
        if (this.specular) {
            _program.uniform('4fv', 'u_material.specular', this.specular);
            _program.uniform('1f', 'u_material.shininess', this.shininess);
        }
    }
}

Material.transform = 'material';
