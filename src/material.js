/*global Material */
import shaderSources from './gl/shader_sources'; // built-in shaders
import GLSL from './gl/glsl';
import {StyleParser} from './styles/style_parser';

export default class Material {
    constructor (config) {
        config = config || {};

        if (config.emission == null || typeof config.emission === 'number') {
            this.emission = GLSL.expandVec4(config.emission || 0);
        }
        else {
            this.emission = StyleParser.parseColor(config.emission);
        }

        if (config.ambient == null || typeof config.ambient === 'number') {
            this.ambient = GLSL.expandVec4(config.ambient != null ? config.ambient : 1);
        }
        else {
            this.ambient = StyleParser.parseColor(config.ambient);
        }

        if (config.diffuse == null || typeof config.diffuse === 'number') {
            this.diffuse = GLSL.expandVec4(config.diffuse != null ? config.diffuse : 1);
        }
        else {
            this.diffuse = StyleParser.parseColor(config.diffuse);
        }

        if (config.specular == null || typeof config.specular === 'number') {
            this.specular = GLSL.expandVec4(config.specular || 0);
        }
        else {
            this.specular = StyleParser.parseColor(config.specular);
        }

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
