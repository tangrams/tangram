// GL program wrapper to cache uniform locations/values, do compile-time pre-processing
// (injecting #defines and #pragma blocks into shaders), etc.

import log from '../utils/log';
import GLSL from './glsl';
import Texture from './texture';
import getExtension from './extensions';

import strip from 'strip-comments';
import { default as parseShaderErrors } from 'gl-shader-errors';

// Regex patterns
const re_pragma = /^\s*#pragma.*$/gm;   // for removing unused pragmas after shader block injection
const re_continue_line = /\\\s*\n/mg;   // for removing backslash line continuations

export default class ShaderProgram {

    constructor(gl, vertex_source, fragment_source, options) {
        options = options || {};

        this.gl = gl;
        this.program = null;
        this.compiled = false;
        this.compiling = false;
        this.error = null;

        // key/values inserted as #defines into shaders at compile-time
        this.defines = Object.assign({}, options.defines||{});

        // key/values for blocks that can be injected into shaders at compile-time
        this.blocks = Object.assign({}, options.blocks||{});
        this.block_scopes = Object.assign({}, options.block_scopes||{});

        // list of extensions to activate
        this.extensions = options.extensions || [];

        // JS-object uniforms that are expected by this program
        // If they are not found in the existing shader source, their types will be inferred and definitions
        // for each will be injected.
        this.dependent_uniforms = options.uniforms;

        this.uniforms = {}; // program locations of uniforms, lazily added as each uniform is set
        this.attribs = {}; // program locations of vertex attributes, lazily added as each attribute is accessed

        this.vertex_source = vertex_source;
        this.fragment_source = fragment_source;

        this.id = ShaderProgram.id++;
        ShaderProgram.programs[this.id] = this;
        this.name = options.name; // can provide a program name (useful for debugging)
    }

    destroy() {
        this.gl.useProgram(null);
        this.gl.deleteProgram(this.program);
        this.program = null;
        this.uniforms = {};
        this.attribs = {};
        delete ShaderProgram.programs[this.id];
        this.compiled = false;
    }

    // Use program wrapper with simple state cache
    use() {
        if (!this.compiled) {
            return;
        }

        if (ShaderProgram.current !== this) {
            this.gl.useProgram(this.program);
        }
        ShaderProgram.current = this;
    }

    compile() {
        if (this.compiling) {
            throw(new Error(`ShaderProgram.compile(): skipping for ${this.id} (${this.name}) because already compiling`));
        }
        this.compiling = true;
        this.compiled = false;
        this.error = null;

        // Copy sources from pre-modified template
        this.computed_vertex_source = this.vertex_source;
        this.computed_fragment_source = this.fragment_source;

        // Check for extension availability
        let extensions = this.checkExtensions();

        // Make list of defines to be injected later
        var defines = this.buildDefineList();

        // Inject user-defined blocks (arbitrary code points matching named #pragmas)
        // Replace according to this pattern:
        // #pragma tangram: [key]
        // e.g. #pragma tangram: global

        // Gather all block code snippets
        var blocks = this.buildShaderBlockList();
        var regexp;

        for (var key in blocks) {
            var block = blocks[key];
            if (!block || (Array.isArray(block) && block.length === 0)) {
                continue;
            }

            // First find code replace points in shaders
            regexp = new RegExp('^\\s*#pragma\\s+tangram:\\s+' + key + '\\s*$', 'm');
            var inject_vertex = this.computed_vertex_source.match(regexp);
            var inject_fragment = this.computed_fragment_source.match(regexp);

            // Avoid network request if nothing to replace
            if (inject_vertex == null && inject_fragment == null) {
                continue;
            }

            // Combine all blocks into one string
            var source = '';
            block.forEach(val => {
                // Mark start and end of each block with metadata (which can be extracted from
                // final source for error handling, debugging, etc.)
                let mark = `${val.scope}, ${val.key}, ${val.num}`;
                source += `\n// tangram-block-start: ${mark}\n`;
                source += val.source;
                source += `\n// tangram-block-end: ${mark}\n`;
            });

            // Inject
            if (inject_vertex != null) {
                this.computed_vertex_source = this.computed_vertex_source.replace(regexp, source);
            }
            if (inject_fragment != null) {
                this.computed_fragment_source = this.computed_fragment_source.replace(regexp, source);
            }

            // Add a #define for this injection point
            defines['TANGRAM_BLOCK_' + key.replace(/[\s-]+/g, '_').toUpperCase()] = true;
        }

        // Clean-up any #pragmas that weren't replaced (to prevent compiler warnings)
        this.computed_vertex_source = this.computed_vertex_source.replace(re_pragma, '');
        this.computed_fragment_source = this.computed_fragment_source.replace(re_pragma, '');

        // Detect uniform definitions, inject any missing ones
        this.ensureUniforms(this.dependent_uniforms);

        // Build & inject extensions & defines
        // This is done *after* code injection so that we can add defines for which code points were injected
        let info = (this.name ? (this.name + ' / id ' + this.id) : ('id ' + this.id));
        let header = `// Program: ${info}\n`;
        let precision = '';
        let high = this.gl.getShaderPrecisionFormat(this.gl.FRAGMENT_SHADER, this.gl.HIGH_FLOAT);
        if (high && high.precision > 0) {
            precision = 'precision highp float;\n';
        }
        else {
            precision = 'precision mediump float;\n';
        }

        defines['TANGRAM_VERTEX_SHADER'] = true;
        defines['TANGRAM_FRAGMENT_SHADER'] = false;
        this.computed_vertex_source =
            header +
            precision +
            ShaderProgram.buildDefineString(defines) +
            this.computed_vertex_source;

        // Precision qualifier only valid in fragment shader
        // NB: '#extension' statements added to fragment shader only, as IE11 throws error when they appear in
        // vertex shader (even when guarded by #ifdef), and no WebGL extensions require '#extension' in vertex shaders
        defines['TANGRAM_VERTEX_SHADER'] = false;
        defines['TANGRAM_FRAGMENT_SHADER'] = true;
        this.computed_fragment_source =
            ShaderProgram.buildExtensionString(extensions) +
            header +
            precision +
            ShaderProgram.buildDefineString(defines) +
            this.computed_fragment_source;

        // Replace multi-line backslashes
        this.computed_vertex_source = this.computed_vertex_source.replace(re_continue_line, '');
        this.computed_fragment_source = this.computed_fragment_source.replace(re_continue_line, '');

        // Compile & set uniforms to cached values
        try {
            this.program = ShaderProgram.updateProgram(this.gl, this.program, this.computed_vertex_source, this.computed_fragment_source);
            this.compiled = true;
            this.compiling = false;
        }
        catch(error) {
            this.program = null;
            this.compiled = false;
            this.compiling = false;
            this.error = error;

            // shader error info
            if (error.type === 'vertex' || error.type === 'fragment') {
                this.shader_errors = error.errors;
                for (let e of this.shader_errors) {
                    e.type = error.type;
                    e.block = this.block(error.type, e.line);
                }
            }

            throw(new Error(`ShaderProgram.compile(): program ${this.id} (${this.name}) error:`, error));
        }

        this.use();
        this.refreshUniforms();
        this.refreshAttributes();
    }

    // Make list of defines (global, then program-specific)
    buildDefineList() {
        var d, defines = {};
        for (d in ShaderProgram.defines) {
            defines[d] = ShaderProgram.defines[d];
        }
        for (d in this.defines) {
            defines[d] = this.defines[d];
        }
        return defines;
    }

    // Make list of shader blocks (global, then program-specific)
    buildShaderBlockList() {
        let key, blocks = {};

        // Global blocks
        for (key in ShaderProgram.blocks) {
            blocks[key] = [];

            if (Array.isArray(ShaderProgram.blocks[key])) {
                blocks[key].push(
                    ...ShaderProgram.blocks[key].map((source, num) => {
                        return { key, source, num, scope: 'ShaderProgram' };
                    })
                );
            }
            else {
                blocks[key] = [{ key, source: ShaderProgram.blocks[key], num: 0, scope: 'ShaderProgram' }];
            }
        }

        // Program-specific blocks
        for (key in this.blocks) {
            blocks[key] = blocks[key] || [];

            if (Array.isArray(this.blocks[key])) {
                let scopes = (this.block_scopes && this.block_scopes[key]) || [];
                let cur_scope = null, num = 0;

                for (let b=0; b < this.blocks[key].length; b++) {
                    // Count blocks relative to current scope
                    if (scopes[b] !== cur_scope) {
                        cur_scope = scopes[b];
                        num = 0;
                    }

                    blocks[key].push({
                        key,
                        source: this.blocks[key][b],
                        num,
                        scope: cur_scope || this.name
                    });

                    num++;
                }
            }
            else {
                // TODO: address discrepancy in array vs. single-value blocks
                // styles assume array when tracking block scopes
                blocks[key].push({ key, source: this.blocks[key], num: 0, scope: this.name });
            }
        }
        return blocks;
    }

    // Detect uniform definitions, inject any missing ones
    ensureUniforms(uniforms) {
        if (!uniforms) {
            return;
        }

        var vs = strip(this.computed_vertex_source);
        var fs = strip(this.computed_fragment_source);
        var inject, vs_injections = [], fs_injections = [];

        // Check for missing uniform definitions
        for (var name in uniforms) {
            inject = null;

            // Check vertex shader
            if (!GLSL.isUniformDefined(name, vs)) {
                if (!inject) {
                    inject = GLSL.defineUniform(name, uniforms[name]);
                }
                log('trace', `Program ${this.name}: ${name} not defined in vertex shader, injecting: '${inject}'`);
                vs_injections.push(inject);

            }
            // Check fragment shader
            if (!GLSL.isUniformDefined(name, fs)) {
                if (!inject) {
                    inject = GLSL.defineUniform(name, uniforms[name]);
                }
                log('trace', `Program ${this.name}: ${name} not defined in fragment shader, injecting: '${inject}'`);
                fs_injections.push(inject);
            }
        }

        // Inject missing uniforms
        // NOTE: these are injected at the very top of the shaders, even before any #defines or #pragmas are added
        // this could cause some issues with certain #pragmas, or other functions that might expect #defines
        if (vs_injections.length > 0) {
            this.computed_vertex_source = vs_injections.join('\n') + this.computed_vertex_source;
        }

        if (fs_injections.length > 0) {
            this.computed_fragment_source = fs_injections.join('\n') + this.computed_fragment_source;
        }
    }

    // Set uniforms from a JS object, with inferred types
    setUniforms(uniforms, reset_texture_unit = true) {
        if (!this.compiled) {
            return;
        }

        // TODO: only update uniforms when changed

        // Texture units must be tracked and incremented each time a texture sampler uniform is set.
        // By default, the texture unit is reset to 0 each time setUniforms is called, but they can
        // also be preserved, for example in cases where multiple calls to setUniforms are expected
        // (e.g. program-specific uniforms followed by mesh-specific ones).
        if (reset_texture_unit) {
            this.texture_unit = 0;
        }

        // Parse uniform types and values from the JS object
        const parsed = GLSL.parseUniforms(uniforms);

        // Set each uniform
        for (let u=0; u < parsed.length; u++) {
            const uniform = parsed[u];
            if (uniform.type === 'sampler2D') {
                // For textures, we need to track texture units, so we have a special setter
                this.setTextureUniform(uniform.name, uniform.value);
            }
            else {
                this.uniform(uniform.method, uniform.name, uniform.value);
            }
        }
    }

    // Cache some or all uniform values so they can be restored
    saveUniforms(subset) {
        let uniforms = subset || this.uniforms;
        for (let u in uniforms) {
            let uniform = this.uniforms[u];
            if (uniform) {
                uniform.saved_value = uniform.value;
            }
        }
        this.saved_texture_unit = this.texture_unit || 0;
    }

    // Restore some or all uniforms to saved values
    restoreUniforms(subset) {
        let uniforms = subset || this.uniforms;
        for (let u in uniforms) {
            let uniform = this.uniforms[u];
            if (uniform && uniform.saved_value) {
                uniform.value = uniform.saved_value;
                this.updateUniform(uniform);
            }
        }
        this.texture_unit = this.saved_texture_unit || 0;
    }

    // Set a texture uniform, finds texture by name or creates a new one
    setTextureUniform(uniform_name, texture_name) {
        var texture = Texture.textures[texture_name];
        if (texture == null) {
            log('warn', `Cannot find texture '${texture_name}'`);
            return;
        }

        texture.bind(this.texture_unit);
        this.uniform('1i', uniform_name, this.texture_unit);
        this.texture_unit++; // TODO: track max texture units and log/throw errors
    }

    // ex: program.uniform('3fv', 'position', [x, y, z]);
    // TODO: only update uniforms when changed
    uniform(method, name, value) { // 'value' is a method-appropriate arguments list
        if (!this.compiled) {
            return;
        }

        this.uniforms[name] = this.uniforms[name] || {};
        let uniform = this.uniforms[name];
        uniform.name = name;
        if (uniform.location === undefined) {
            uniform.location = this.gl.getUniformLocation(this.program, name);
        }
        uniform.method = method;
        uniform.value = value;
        this.updateUniform(uniform);
    }

    // Set a single uniform
    updateUniform(uniform) {
        if (!this.compiled) {
            return;
        }

        if (!uniform || uniform.location == null) {
            return;
        }

        this.use();
        this.commitUniform(uniform);
    }

    // Commits the uniform to the GPU
    commitUniform(uniform){
        let location = uniform.location;
        let value = uniform.value;

        switch (uniform.method) {
            case '1i':
                this.gl.uniform1i(location, value);
                break;
            case '1f':
                this.gl.uniform1f(location, value);
                break;
            case '2f':
                this.gl.uniform2f(location, value[0], value[1]);
                break;
            case '3f':
                this.gl.uniform3f(location, value[0], value[1], value[2]);
                break;
            case '4f':
                this.gl.uniform4f(location, value[0], value[1], value[2], value[3]);
                break;
            case '1iv':
                this.gl.uniform1iv(location, value);
                break;
            case '3iv':
                this.gl.uniform3iv(location, value);
                break;
            case '1fv':
                this.gl.uniform1fv(location, value);
                break;
            case '2fv':
                this.gl.uniform2fv(location, value);
                break;
            case '3fv':
                this.gl.uniform3fv(location, value);
                break;
            case '4fv':
                this.gl.uniform4fv(location, value);
                break;
            case 'Matrix3fv':
                this.gl.uniformMatrix3fv(location, false, value);
                break;
            case 'Matrix4fv':
                this.gl.uniformMatrix4fv(location, false, value);
                break;
        }
    }

    // Refresh uniform locations and set to last cached values
    refreshUniforms() {
        if (!this.compiled) {
            return;
        }

        for (var u in this.uniforms) {
            let uniform = this.uniforms[u];
            uniform.location = this.gl.getUniformLocation(this.program, u);
            this.updateUniform(uniform);
        }
    }

    refreshAttributes() {
        // var len = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
        // for (var i=0; i < len; i++) {
        //     var a = this.gl.getActiveAttrib(this.program, i);
        // }
        this.attribs = {};
    }

    // Get the location of a vertex attribute
    attribute(name) {
        if (!this.compiled) {
            return;
        }

        var attrib = (this.attribs[name] = this.attribs[name] || {});
        if (attrib.location != null) {
            return attrib;
        }

        attrib.name = name;
        attrib.location = this.gl.getAttribLocation(this.program, name);

        // var info = this.gl.getActiveAttrib(this.program, attrib.location);
        // attrib.type = info.type;
        // attrib.size = info.size;

        return attrib;
    }

    // Get shader source as string
    source(type) {
        if (type === 'vertex') {
            return this.computed_vertex_source;
        }
        else if (type === 'fragment') {
            return this.computed_fragment_source;
        }
    }

    // Get shader source as array of line strings
    lines(type) {
        let source = this.source(type);
        if (source) {
            return source.split('\n');
        }
        return [];
    }

    // Get a specific line from shader source
    line(type, num) {
        let source = this.lines(type);
        if (source) {
            return source[num];
        }
    }

    // Get info on which shader block (if any) a particular line number in a shader is in
    // Returns an object with the following info if a block is found: { name, line, source }
    //  scope: where the shader block originated, either a style name, or global such as ShaderProgram
    //  name: shader block name (e.g. 'color', 'position', 'global')
    //  num: the block number *within* local scope (e.g. if a style has multiple 'color' blocks)
    //  line: line number *within* the shader block (not the whole shader program), useful for error highlighting
    //  source: the code for the line
    // NOTE: this does a bruteforce loop over the shader source and looks for shader block start/end markers
    // We could track line ranges for shader blocks as they are inserted, but as this code is only used for
    // error handling on compilation failure, it was simpler to keep it separate than to burden the core
    // compilation path.
    block(type, num) {
        let lines = this.lines(type);
        let block;
        for (let i=0; i < num && i < lines.length; i++) {
            let line = lines[i];
            let match = line.match(/\/\/ tangram-block-start: ([A-Za-z0-9_-]+), ([A-Za-z0-9_-]+), (\d+)/);
            if (match && match.length > 1) {
                // mark current block
                block = {
                    scope: match[1],
                    name: match[2],
                    num: match[3]
                };
            }
            else {
                match = line.match(/\/\/ tangram-block-end: ([A-Za-z0-9_-]+), ([A-Za-z0-9_-]+), (\d+)/);
                if (match && match.length > 1) {
                    block = null; // clear current block
                }
            }

            // update line # and content
            if (block) {
                // init to -1 so that line 0 is first actual line of block code, after comment marker
                block.line = (block.line == null) ? -1 : block.line + 1;
                block.source = line;
            }
        }
        return block;
    }

    // Returns list of available extensions from those requested
    // Sets internal #defines indicating availability of each requested extension
    checkExtensions() {
        let exts = [];
        for (let name of this.extensions) {
            let ext = getExtension(this.gl, name);
            let def = `TANGRAM_EXTENSION_${name}`;

            this.defines[def] = (ext != null);

            if (ext) {
                exts.push(name);
            }
            else {
                log('debug', `Could not enable extension '${name}'`);
            }
        }
        return exts;
    }

}


// Static methods and state

ShaderProgram.id = 0;           // assign each program a unique id
ShaderProgram.programs = {};    // programs, by id
ShaderProgram.current = null;   // currently bound program

// Global config applied to all programs (duplicate properties for a specific program will take precedence)
ShaderProgram.defines = {};
ShaderProgram.blocks = {};

// Turn an object of key/value pairs into single string of #define statements
ShaderProgram.buildDefineString = function (defines) {
    var define_str = "";
    for (var d in defines) {
        if (defines[d] == null || defines[d] === false) {
            continue;
        }
        else if (typeof defines[d] === 'boolean' && defines[d] === true) { // booleans are simple defines with no value
            define_str += "#define " + d + "\n";
        }
        else if (typeof defines[d] === 'number' && Math.floor(defines[d]) === defines[d]) { // int to float conversion to satisfy GLSL floats
            define_str += "#define " + d + " " + defines[d].toFixed(1) + "\n";
        }
        else { // any other float or string value
            define_str += "#define " + d + " " + defines[d] + "\n";
        }
    }
    return define_str;
};

// Turn a list of extension names into single string of #extension statements
ShaderProgram.buildExtensionString = function (extensions) {
    extensions = extensions || [];
    let str = "";
    for (let ext of extensions) {
        str += `#ifdef GL_${ext}\n#extension GL_${ext} : enable\n#endif\n`;
    }
    return str;
};

ShaderProgram.addBlock = function (key, ...blocks) {
    ShaderProgram.blocks[key] = ShaderProgram.blocks[key] || [];
    ShaderProgram.blocks[key].push(...blocks);
};

// Remove all global shader blocks for a given key
ShaderProgram.removeBlock = function (key) {
    ShaderProgram.blocks[key] = [];
};

ShaderProgram.replaceBlock = function (key, ...blocks) {
    ShaderProgram.removeBlock(key);
    ShaderProgram.addBlock(key, ...blocks);
};

// Compile & link a WebGL program from provided vertex and fragment shader sources
// update a program if one is passed in. Create one if not. Alert and don't update anything if the shaders don't compile.
ShaderProgram.updateProgram = function (gl, program, vertex_shader_source, fragment_shader_source) {
    try {
        var vertex_shader = ShaderProgram.createShader(gl, vertex_shader_source, gl.VERTEX_SHADER);
        var fragment_shader = ShaderProgram.createShader(gl, fragment_shader_source, gl.FRAGMENT_SHADER);
    }
    catch(err) {
        log('error', err.message);
        throw err;
    }

    gl.useProgram(null);
    if (program != null) {
        var old_shaders = gl.getAttachedShaders(program);
        for(var i = 0; i < old_shaders.length; i++) {
            gl.detachShader(program, old_shaders[i]);
        }
    } else {
        program = gl.createProgram();
    }

    if (vertex_shader == null || fragment_shader == null) {
        return program;
    }

    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, fragment_shader);

    gl.deleteShader(vertex_shader);
    gl.deleteShader(fragment_shader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        let message = new Error(
            `WebGL program error:
            VALIDATE_STATUS: ${gl.getProgramParameter(program, gl.VALIDATE_STATUS)}
            ERROR: ${gl.getError()}
            --- Vertex Shader ---
            ${vertex_shader_source}
            --- Fragment Shader ---
            ${fragment_shader_source}`);

        let error = { type: 'program', message };
        log('error', error.message);
        throw error;
    }

    return program;
};

// Compile a vertex or fragment shader from provided source
ShaderProgram.createShader = function (gl, source, stype) {
    let shader = gl.createShader(stype);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        let type = (stype === gl.VERTEX_SHADER ? 'vertex' : 'fragment');
        let message = gl.getShaderInfoLog(shader);
        let errors = parseShaderErrors(message);
        throw { type, message, errors };
    }

    return shader;
};
