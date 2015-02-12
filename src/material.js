/*global Material */
import ShaderProgram from './gl/shader_program';
import shaderSources from './gl/shader_sources'; // built-in shaders

export default class Material {
    constructor (_style, _options = {}) {
        this.style = _style;
        this.emission = (_options.emission || [0,0,0]).map(parseFloat);
        this.ambient = (_options.ambient || [0,0,0]).map(parseFloat);
        this.diffuse = (_options.diffuse || [1,1,1]).map(parseFloat);
        this.specular = (_options.specular ||[0,0,0]).map(parseFloat);
        this.shininess = !isNaN(parseFloat(options.shininess)) ? parseFloat(options.shininess) : 0.2;
    }

    inject () {
        if (this.emission !== [0,0,0]) {
            this.style.defines['TANGRAM_MATERIAL_EMISSION'] = true;
        }
        if (this.ambient !== [0,0,0]) {
            this.style.defines['TANGRAM_MATERIAL_AMBIENT'] = true;
        }
        if (this.diffuse !== [0,0,0]) {
            this.style.defines['TANGRAM_MATERIAL_DIFFUSE'] = true;
        }
        if (this.specular !== [0,0,0]) {
            this.style.defines['TANGRAM_MATERIAL_SPECULAR'] = true;
        }

        this.style.addShaderTransform(Material.transform, shaderSources['gl/shaders/material']);
    }

    setupProgram (_program) {
        if (this.emission !== [0,0,0]) {
            _program.uniform('3fv', 'u_material.emission', this.emission);
        }
        if (this.ambient !== [0,0,0]) {
            _program.uniform('3fv', 'u_material.ambient', this.ambient);
        }
        if (this.diffuse !== [0,0,0]) {
            _program.uniform('3fv', 'u_material.diffuse', this.diffuse);
        }
        if (this.specular !== [0,0,0]) {
            _program.uniform('3fv', 'u_material.specular', this.specular);
            _program.uniform('1f', 'u_material.shininess', this.shininess);
        }
    }
}

Material.transform = 'material';
