/*global Material */
import shaderSources from './gl/shader_sources'; // built-in shaders
import GLSL from './gl/glsl';

export default class Material {
    constructor (config) {
        config = config || {};
        this.emission = GLSL.expandVec4(config.emission);
        this.ambient = GLSL.expandVec4(config.ambient != null ? config.ambient : 1);
        this.diffuse = GLSL.expandVec4(config.diffuse != null ? config.diffuse : 1);
        this.specular = GLSL.expandVec4(config.specular);
        this.shininess = config.shininess ? parseFloat(config.shininess) : 0.2;
    }

    inject (style) {
        style.defines['TANGRAM_MATERIAL_EMISSION'] = (this.emission != null);
        style.defines['TANGRAM_MATERIAL_AMBIENT'] = (this.ambient != null);
        style.defines['TANGRAM_MATERIAL_DIFFUSE'] = (this.diffuse != null);
        style.defines['TANGRAM_MATERIAL_SPECULAR'] = (this.specular != null);

        style.replaceShaderTransform(Material.transform, shaderSources['gl/shaders/material']);
    }

    setupProgram (_program) {
        if (this.emission != null) {
            _program.uniform('4fv', 'u_material.emission', this.emission);
        }
        if (this.ambient != null) {
            _program.uniform('4fv', 'u_material.ambient', this.ambient);
        }
        if (this.diffuse != null) {
            _program.uniform('4fv', 'u_material.diffuse', this.diffuse);
        }
        if (this.specular != null) {
            _program.uniform('4fv', 'u_material.specular', this.specular);
            _program.uniform('1f', 'u_material.shininess', this.shininess);
        }
    }
}

Material.transform = 'material';
