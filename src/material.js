/*global Material */
import ShaderProgram from './gl/shader_program';
import shaderSources from './gl/shader_sources'; // built-in shaders
import GLSL from './gl/glsl';

export default class Material {
    constructor (config) {
        config = config || {};
        this.emission = GLSL.expandVec4(config.emission);
        this.ambient = GLSL.expandVec4(config.ambient != null ? config.ambient : 1);
        this.diffuse = GLSL.expandVec4(config.diffuse != null ? config.diffuse : 1);
        this.specular = GLSL.expandVec4(config.specular)
        this.shininess = config.shininess ? parseFloat(config.shininess) : 0.2;
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

        style.replaceShaderTransform(Material.transform, shaderSources['gl/shaders/material']);
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
