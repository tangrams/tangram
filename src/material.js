import GLSL from './gl/glsl';
import {StyleParser} from './styles/style_parser';

let fs = require('fs');
const shaderSrc_material = fs.readFileSync(__dirname + '/gl/shaders/material.glsl', 'utf8');

export default class Material {
    constructor (config) {

        config = config || {};

        // These properties all have the same defaults, so they can be set in bulk
        for (let prop of ['emission', 'ambient', 'diffuse', 'specular']) {
            const value = config[prop];
            if (value != null) {
                if (value.texture) {
                    this[prop] = {
                        texture: value.texture,
                        mapping: value.mapping || 'spheremap',
                        scale: GLSL.expandVec3(value.scale != null ? value.scale : 1),
                        amount: GLSL.expandVec4(value.amount != null ? value.amount : 1)
                    };
                }
                else if (typeof value === 'number' || Array.isArray(value)) {
                    this[prop] = { amount: GLSL.expandVec4(value) };
                }
                else if (typeof value === 'string') {
                    this[prop] = { amount: StyleParser.parseColor(value) };
                }
                else {
                    this[prop] = value;
                }
            }
        }

        // Extra specular props
        if (this.specular) {
            this.specular.shininess = config.shininess ? parseFloat(config.shininess) : 0.2;
        }

        // Normal mapping
        if (config.normal != null) {
            this.normal = {
                texture: config.normal.texture,
                mapping: config.normal.mapping || 'triplanar',
                scale: GLSL.expandVec3(config.normal.scale != null ? config.normal.scale : 1),
                amount: config.normal.amount != null ? config.normal.amount : 1
            };
        }
    }

    // Determine if a material config block has sufficient properties to create a material
    static isValid (config) {
        if (config == null) {
            return false;
        }

        if (config.emission == null &&
            config.ambient == null &&
            config.diffuse == null &&
            config.specular == null) {
            return false;
        }

        return true;
    }

    inject (style) {
        // For each property, sets defines to configure texture mapping, with a pattern like:
        //   TANGRAM_MATERIAL_DIFFUSE, TANGRAM_MATERIAL_DIFFUSE_TEXTURE, TANGRAM_MATERIAL_DIFFUSE_TEXTURE_SPHEREMAP
        // Also sets flags to keep track of each unique mapping type being used, e.g.:
        //   TANGRAM_MATERIAL_TEXTURE_SPHEREMAP
        // Enables texture coordinates if needed and not already on
        for (let prop of ['emission', 'ambient', 'diffuse', 'specular']) {
            let def = `TANGRAM_MATERIAL_${prop.toUpperCase()}`;
            let texdef = def + '_TEXTURE';
            style.defines[def] = (this[prop] != null);
            if (this[prop] && this[prop].texture) {
                style.defines[texdef] = true;
                style.defines[texdef + '_' + this[prop].mapping.toUpperCase()] = true;
                style.defines[`TANGRAM_MATERIAL_TEXTURE_${this[prop].mapping.toUpperCase()}`] = true;
                style.texcoords = style.texcoords || (this[prop].mapping === 'uv');
            }
        }

        // Normal mapping
        // As anove, sets flags to keep track of each unique mapping type being used, e.g.:
        //   TANGRAM_MATERIAL_TEXTURE_SPHEREMAP
        if (this.normal && this.normal.texture) {
            style.defines['TANGRAM_MATERIAL_NORMAL_TEXTURE'] = true;
            style.defines['TANGRAM_MATERIAL_NORMAL_TEXTURE_' + this.normal.mapping.toUpperCase()] = true;
            style.defines[`TANGRAM_MATERIAL_TEXTURE_${this.normal.mapping.toUpperCase()}`] = true;
            style.texcoords = style.texcoords || (this.normal.mapping === 'uv');
        }

        style.replaceShaderBlock(Material.block, shaderSrc_material, 'Material');
        style.addShaderBlock('setup', '\nmaterial = u_material;\n', 'Material');
    }

    setupProgram (_program) {
        // For each property, sets uniforms in the pattern:
        // u_material.diffuse, u_material.diffuseScale u_material_diffuse_texture
        for (let prop of ['emission', 'ambient', 'diffuse', 'specular']) {
            if (this[prop]) {
                if (this[prop].texture) {
                    _program.setTextureUniform(`u_material_${prop}_texture`, this[prop].texture);
                    _program.uniform('3fv', `u_material.${prop}Scale`, this[prop].scale);
                    _program.uniform('4fv', `u_material.${prop}`, this[prop].amount);
                } else if (this[prop].amount) {
                    _program.uniform('4fv', `u_material.${prop}`, this[prop].amount);
                }
            }
        }

        // Extra specular props
        if (this.specular) {
            _program.uniform('1f', 'u_material.shininess', this.specular.shininess);
        }

        // Normal mapping
        if (this.normal && this.normal.texture) {
            _program.setTextureUniform('u_material_normal_texture', this.normal.texture);
            _program.uniform('3fv', 'u_material.normalScale', this.normal.scale);
            _program.uniform('1f', 'u_material.normalAmount', this.normal.amount);
        }
    }
}

Material.block = 'material';
