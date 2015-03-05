/*global Material */
import shaderSources from './gl/shader_sources'; // built-in shaders
import GLSL from './gl/glsl';

export default class Material {
    constructor (config) {

        config = config || {};

        if (config.normal != null) {
            this.normalTexture = config.normal.texture != null ? config.normal.texture : null;
            this.normalMapping = config.normal.mapping != null ? config.normal.mapping : 'triplanar';
            this.normalScale = GLSL.expandVec3(config.normal.scale != null ? config.normal.scale : 1.0);
            this.normalAmount = config.normal.amount != null ? config.normal.amount : 1.0;
        }
        
        this.emission = GLSL.expandVec4(config.emission);
        if (config.emission != null) {
            if (config.emission.texture != null) {
                this.emissionTexture = config.emission.texture != null ? config.emission.texture : null;
                this.emissionMapping = config.emission.mapping != null ? config.emission.mapping : 'spheremap';
                this.emissionScale = GLSL.expandVec4(config.emission.scale != null ? config.emission.scale : 1.0);
                this.emissionAmount = GLSL.expandVec4(config.emission.amount != null ? config.emission.amount : 1.0);
            }
        }
        
        this.ambient = GLSL.expandVec4(config.ambient != null ? config.ambient : 1);
        if (config.ambient != null) {
            if (config.ambient.texture != null) {
                this.ambientTexture = config.ambient.texture != null ? config.ambient.texture : null;
                this.ambientMapping = config.ambient.mapping != null ? config.ambient.mapping : 'spheremap';
                this.ambientScale = GLSL.expandVec4(config.ambient.scale != null ? config.ambient.scale : 1.0);
                this.ambientAmount = GLSL.expandVec4(config.ambient.amount != null ? config.ambient.amount : 1.0);
            }
        }

        this.diffuse = GLSL.expandVec4(config.diffuse != null ? config.diffuse : 1);
        if (config.diffuse != null) {
            if (config.diffuse.texture != null) {
                this.diffuseTexture = config.diffuse.texture != null ? config.diffuse.texture : null;
                this.diffuseMapping = config.diffuse.mapping != null ? config.diffuse.mapping : 'spheremap';
                this.diffuseScale = GLSL.expandVec4(config.diffuse.scale != null ? config.diffuse.scale : 1.0);
                this.diffuseAmount = GLSL.expandVec4(config.diffuse.amount != null ? config.diffuse.amount : 1.0);
            }
        }

        this.specular = GLSL.expandVec4(config.specular);
        if (config.specular != null) {
            if (config.specular.texture != null) {
                this.specularTexture = config.specular.texture != null ? config.specular.texture : null;
                this.specularMapping = config.specular.mapping != null ? config.specular.mapping : 'spheremap';
                this.specularScale = GLSL.expandVec4(config.specular.scale != null ? config.specular.scale : 1.0);
                this.specularAmount = GLSL.expandVec4(config.specular.amount != null ? config.specular.amount : 1.0);
            }
        }
        
        this.shininess = config.shininess ? parseFloat(config.shininess) : 0.2;
    }

    inject (style) {

        if (this.normalTexture != null) {
            style.defines['TANGRAM_MATERIAL_NORMAL_TEXTURE'] = true;
            if (this.normalMapping === 'uv'){
                style.defines['TANGRAM_MATERIAL_NORMAL_TEXTURE_UV'] = true;
                style.texcoords = true;
            } else if (this.normalMapping === 'triplanar') {
                style.defines['TANGRAM_MATERIAL_NORMAL_TEXTURE_TRIPLANAR'] = true;
            }
        }
        
        style.defines['TANGRAM_MATERIAL_EMISSION'] = (this.emission != null) || (this.emissionTexture != null);
        if ( this.emissionTexture != null ) {
            style.defines['TANGRAM_MATERIAL_EMISSION_TEXTURE'] = true;
            if (this.emissionMapping === 'uv'){
                style.defines['TANGRAM_MATERIAL_EMISSION_TEXTURE_UV'] = true;
                style.texcoords = true;
            } else if (this.emissionMapping === 'triplanar') {
                style.defines['TANGRAM_MATERIAL_EMISSION_TEXTURE_TRIPLANAR'] = true;
            } else if (this.emissionMapping === 'spheremap') {
                style.defines['TANGRAM_MATERIAL_EMISSION_TEXTURE_SPHEREMAP'] = true;
            }
        }

        style.defines['TANGRAM_MATERIAL_AMBIENT'] = (this.ambient != null) || (this.ambientTexture != null);
        if ( this.ambientTexture != null ) {
            style.defines['TANGRAM_MATERIAL_AMBIENT_TEXTURE'] = true;
            if (this.ambientMapping === 'uv'){
                style.defines['TANGRAM_MATERIAL_AMBIENT_TEXTURE_UV'] = true;
                style.texcoords = true;
            } else if (this.ambientMapping === 'triplanar') {
                style.defines['TANGRAM_MATERIAL_AMBIENT_TEXTURE_TRIPLANAR'] = true;
            } else if (this.ambientMapping === 'spheremap') {
                style.defines['TANGRAM_MATERIAL_AMBIENT_TEXTURE_SPHEREMAP'] = true;
            }
        }

        style.defines['TANGRAM_MATERIAL_DIFFUSE'] = (this.diffuse != null) || (this.diffuseTexture != null);
        if ( this.diffuseTexture != null ) {
            style.defines['TANGRAM_MATERIAL_DIFFUSE_TEXTURE'] = true;
            if (this.diffuseMapping === 'uv'){
                style.defines['TANGRAM_MATERIAL_DIFFUSE_TEXTURE_UV'] = true;
                style.texcoords = true;
            } else if (this.diffuseMapping === 'triplanar') {
                style.defines['TANGRAM_MATERIAL_DIFFUSE_TEXTURE_TRIPLANAR'] = true;
            } else if (this.diffuseMapping === 'spheremap') {
                style.defines['TANGRAM_MATERIAL_DIFFUSE_TEXTURE_SPHEREMAP'] = true;
            }
        }

        style.defines['TANGRAM_MATERIAL_SPECULAR'] = (this.specular != null) || (this.specularTexture != null);
        if ( this.specularTexture != null ) {
            style.defines['TANGRAM_MATERIAL_SPECULAR_TEXTURE'] = true;
            if (this.specularMapping === 'uv'){
                style.defines['TANGRAM_MATERIAL_SPECULAR_TEXTURE_UV'] = true;
                style.texcoords = true;
            } else if (this.specularMapping === 'triplanar') {
                style.defines['TANGRAM_MATERIAL_SPECULAR_TEXTURE_TRIPLANAR'] = true;
            } else if (this.specularMapping === 'spheremap') {
                style.defines['TANGRAM_MATERIAL_SPECULAR_TEXTURE_SPHEREMAP'] = true;
            }
        }

        style.replaceShaderTransform(Material.transform, shaderSources['gl/shaders/material']);
    }

    setupProgram (_program) {

        if (this.normalTexture != null ){
            _program.setTextureUniform('u_material_normal_texture', this.normalTexture);
            _program.uniform('3fv', 'u_material.normalScale', this.normalScale);
            _program.uniform('1f', 'u_material.normalAmount', this.normalAmount);
        }

        if (this.emissionTexture != null ){
            _program.setTextureUniform('u_material_emission_texture', this.emissionTexture);
            _program.uniform('4fv', 'u_material.emissionScale', this.emissionScale);
            _program.uniform('4fv', 'u_material.emission', this.emissionAmount);
        } else if (this.emission != null) {
            _program.uniform('4fv', 'u_material.emission', this.emission);
        }

        if (this.ambientTexture != null ){
            _program.setTextureUniform('u_material_ambient_texture', this.ambientTexture);
            _program.uniform('4fv', 'u_material.ambientScale', this.ambientScale);
            _program.uniform('4fv', 'u_material.ambient', this.ambientAmount);
        } else if (this.ambient != null) {
            _program.uniform('4fv', 'u_material.ambient', this.ambient);
        }

        if (this.diffuseTexture != null ){
            _program.setTextureUniform('u_material_diffuse_texture', this.diffuseTexture);
            _program.uniform('4fv', 'u_material.diffuseScale', this.diffuseScale);
            _program.uniform('4fv', 'u_material.diffuse', this.diffuseAmount);
        } else if (this.diffuse != null) {
            _program.uniform('4fv', 'u_material.diffuse', this.diffuse);
        }

        if (this.specularTexture != null ){
            _program.setTextureUniform('u_material_specular_texture', this.specularTexture);
            _program.uniform('4fv', 'u_material.specularScale', this.specularScale);
            _program.uniform('4fv', 'u_material.specular', this.specularAmount);
            _program.uniform('1f', 'u_material.shininess', this.shininess);
        } else if (this.specular != null) {
            _program.uniform('4fv', 'u_material.specular', this.specular);
            _program.uniform('1f', 'u_material.shininess', this.shininess);
        }
    }
}

Material.transform = 'material';
