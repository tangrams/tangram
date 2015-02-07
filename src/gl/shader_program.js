/* global ShaderProgram */
// GL program wrapper to cache uniform locations/values, do compile-time pre-processing
// (injecting #defines and #pragma transforms into shaders), etc.

import GLSL from './glsl';
import Texture from './texture';

import log from 'loglevel';
import strip from 'strip-comments';

ShaderProgram.id = 0; // assign each program a unique id
ShaderProgram.programs = {}; // programs, by id

export default function ShaderProgram (gl, vertex_source, fragment_source, options)
{
    options = options || {};

    this.gl = gl;
    this.program = null;
    this.compiled = false;
    this.compiling = false;

    // key/values inserted as #defines into shaders at compile-time
    this.defines = Object.assign({}, options.defines||{});

    // key/values for blocks that can be injected into shaders at compile-time
    this.transforms = Object.assign({}, options.transforms||{});

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

    this.compile();
}

ShaderProgram.prototype.destroy = function () {
    this.gl.useProgram(null);
    this.gl.deleteProgram(this.program);
    this.program = null;
    this.uniforms = {};
    this.attribs = {};
    delete ShaderProgram.programs[this.id];
    this.compiled = false;
};

// Use program wrapper with simple state cache
ShaderProgram.prototype.use = function ()
{
    if (!this.compiled) {
        return;
    }

    if (ShaderProgram.current !== this) {
        this.gl.useProgram(this.program);
    }
    ShaderProgram.current = this;
};
ShaderProgram.current = null;

// Global config applied to all programs (duplicate properties for a specific program will take precedence)
ShaderProgram.defines = {};
ShaderProgram.transforms = {};

ShaderProgram.addTransform = function (key, ...transforms) {
    ShaderProgram.transforms[key] = ShaderProgram.transforms[key] || [];
    ShaderProgram.transforms[key].push(...transforms);
};

// Remove all global shader transforms for a given key
ShaderProgram.removeTransform = function (key) {
    ShaderProgram.transforms[key] = [];
};

ShaderProgram.prototype.compile = function () {

    if (this.compiling) {
        throw(new Error(`ShaderProgram.compile(): skipping for ${this.id} (${this.name}) because already compiling`));
    }
    this.compiling = true;
    this.compiled = false;

    // Copy sources from pre-modified template
    this.computed_vertex_source = this.vertex_source;
    this.computed_fragment_source = this.fragment_source;

    // Make list of defines to be injected later
    var defines = this.buildDefineList();

    // Inject user-defined transforms (arbitrary code points matching named #pragmas)
    // Replace according to this pattern:
    // #pragma tangram: [key]
    // e.g. #pragma tangram: globals

    // TODO: support glslify #pragma export names for better compatibility? (e.g. rename main() functions)
    // TODO: auto-insert uniforms referenced in mode definition, but not in shader base or transforms? (problem: don't have access to uniform list/type here)

    // Gather all transform code snippets
    var transforms = this.buildShaderTransformList();
    var regexp;

    for (var key in transforms) {
        var transform = transforms[key];
        if (!transform) {
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

        // Each key can be a single string or array of strings
        var source = transform;
        if (Array.isArray(transform)) {
            // Combine all transforms into one string
            source = transform.reduce((prev, cur) => `${prev}\n${cur}`);
        }

        // Inject
        if (inject_vertex != null) {
            this.computed_vertex_source = this.computed_vertex_source.replace(regexp, source);
        }
        if (inject_fragment != null) {
            this.computed_fragment_source = this.computed_fragment_source.replace(regexp, source);
        }

        // Add a #define for this injection point
        defines['TANGRAM_TRANSFORM_' + key.replace(' ', '_').toUpperCase()] = true;
    }

    // Clean-up any #pragmas that weren't replaced (to prevent compiler warnings)
    regexp = new RegExp('^\\s*#pragma\\s+tangram:\\s+\\w+\\s*$', 'gm');
    this.computed_vertex_source = this.computed_vertex_source.replace(regexp, '');
    this.computed_fragment_source = this.computed_fragment_source.replace(regexp, '');

    // Build & inject defines
    // This is done *after* code injection so that we can add defines for which code points were injected
    var define_str = ShaderProgram.buildDefineString(defines);
    this.computed_vertex_source = define_str + this.computed_vertex_source;
    this.computed_fragment_source = define_str + this.computed_fragment_source;

    // Detect uniform definitions, inject any missing ones
    this.ensureUniforms(this.dependent_uniforms);

    // Include program info useful for debugging
    var info = (this.name ? (this.name + ' / id ' + this.id) : ('id ' + this.id));
    this.computed_vertex_source = '// Program: ' + info + '\n' + this.computed_vertex_source;
    this.computed_fragment_source = '// Program: ' + info + '\n' + this.computed_fragment_source;

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
        throw(new Error(`ShaderProgram.compile(): program ${this.id} (${this.name}) error:`, error));
    }

    this.use();
    this.refreshUniforms();
    this.refreshAttributes();
};

// Make list of defines (global, then program-specific)
ShaderProgram.prototype.buildDefineList = function () {
    var d, defines = {};
    for (d in ShaderProgram.defines) {
        defines[d] = ShaderProgram.defines[d];
    }
    for (d in this.defines) {
        defines[d] = this.defines[d];
    }
    return defines;
};

// Make list of shader transforms (global, then program-specific)
ShaderProgram.prototype.buildShaderTransformList = function () {
    var d, transforms = {};
    for (d in ShaderProgram.transforms) {
        transforms[d] = [];

        if (Array.isArray(ShaderProgram.transforms[d])) {
            transforms[d].push(...ShaderProgram.transforms[d]);
        }
        else {
            transforms[d] = [ShaderProgram.transforms[d]];
        }
    }
    for (d in this.transforms) {
        transforms[d] = transforms[d] || [];

        if (Array.isArray(this.transforms[d])) {
            transforms[d].push(...this.transforms[d]);
        }
        else {
            transforms[d].push(this.transforms[d]);
        }
    }
    return transforms;
};

// Turn #defines into a combined string
ShaderProgram.buildDefineString = function (defines) {
    var define_str = "";
    for (var d in defines) {
        if (defines[d] === false) {
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

// Detect uniform definitions, inject any missing ones
ShaderProgram.prototype.ensureUniforms = function (uniforms) {
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
        if (!GLSL.isUniformDefined(name, vs) && GLSL.isSymbolReferenced(name, vs)) {
            if (!inject) {
                inject = GLSL.defineUniform(name, uniforms[name]);
            }
            log.trace(`Program ${this.name}: ${name} not defined in vertex shader, injecting: '${inject}'`);
            vs_injections.push(inject);

        }
        // Check fragment shader
        if (!GLSL.isUniformDefined(name, fs) && GLSL.isSymbolReferenced(name, fs)) {
            if (!inject) {
                inject = GLSL.defineUniform(name, uniforms[name]);
            }
            log.trace(`Program ${this.name}: ${name} not defined in fragment shader, injecting: '${inject}'`);
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
};

// Set uniforms from a JS object, with inferred types
ShaderProgram.prototype.setUniforms = function (uniforms, reset_texture_unit = true) {
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
    var parsed = GLSL.parseUniforms(uniforms);

    // Set each uniform
    for (var uniform of parsed) {
        if (uniform.type === 'sampler2D') {
            // For textures, we need to track texture units, so we have a special setter
            this.setTextureUniform(uniform.name, uniform.value);
        }
        else {
            this.uniform(uniform.method, uniform.name, uniform.value);
        }
    }
};

// Cache some or all uniform values so they can be restored
ShaderProgram.prototype.saveUniforms = function (subset) {
    let uniforms = subset || this.uniforms;
    for (let u in uniforms) {
        let uniform = this.uniforms[u];
        if (uniform) {
            uniform.saved_value = uniform.value;
        }
    }
    this.saved_texture_unit = this.texture_unit || 0;
};

// Restore some or all uniforms to saved values
ShaderProgram.prototype.restoreUniforms = function (subset) {
    let uniforms = subset || this.uniforms;
    for (let u in uniforms) {
        let uniform = this.uniforms[u];
        if (uniform && uniform.saved_value) {
            uniform.value = uniform.saved_value;
            this.updateUniform(u);
        }
    }
    this.texture_unit = this.saved_texture_unit || 0;
};

// Set a texture uniform, finds texture by name or creates a new one
ShaderProgram.prototype.setTextureUniform = function (uniform_name, texture_name) {
    var texture = Texture.textures[texture_name];
    if (texture == null) {
        texture = new Texture(this.gl, texture_name);
        texture.load(texture_name);
    }

    texture.bind(this.texture_unit);
    this.uniform('1i', uniform_name, this.texture_unit);
    this.texture_unit++; // TODO: track max texture units and log/throw errors
};

// ex: program.uniform('3f', 'position', x, y, z);
// TODO: only update uniforms when changed
ShaderProgram.prototype.uniform = function (method, name, ...value) // 'value' is a method-appropriate arguments list
{
    if (!this.compiled) {
        return;
    }

    this.uniforms[name] = this.uniforms[name] || {};
    let uniform = this.uniforms[name];
    uniform.name = name;
    if (uniform.location === undefined) {
        uniform.location = this.gl.getUniformLocation(this.program, name);
    }
    uniform.method = 'uniform' + method;
    uniform.value = value;
    this.updateUniform(name);
};

// Set a single uniform
ShaderProgram.prototype.updateUniform = function (name)
{
    if (!this.compiled) {
        return;
    }

    var uniform = this.uniforms[name];
    if (!uniform || uniform.location == null) {
        return;
    }

    this.use();
    this.gl[uniform.method].apply(this.gl, [uniform.location].concat(uniform.value)); // call appropriate GL uniform method and pass through arguments
};

// Refresh uniform locations and set to last cached values
ShaderProgram.prototype.refreshUniforms = function ()
{
    if (!this.compiled) {
        return;
    }

    for (var u in this.uniforms) {
        this.uniforms[u].location = this.gl.getUniformLocation(this.program, u);
        this.updateUniform(u);
    }
};

ShaderProgram.prototype.refreshAttributes = function ()
{
    // var len = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
    // for (var i=0; i < len; i++) {
    //     var a = this.gl.getActiveAttrib(this.program, i);
    // }
    this.attribs = {};
};

// Get the location of a vertex attribute
ShaderProgram.prototype.attribute = function (name)
{
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
};

// Compile & link a WebGL program from provided vertex and fragment shader sources
// update a program if one is passed in. Create one if not. Alert and don't update anything if the shaders don't compile.
ShaderProgram.updateProgram = function (gl, program, vertex_shader_source, fragment_shader_source) {
    try {
        var vertex_shader = ShaderProgram.createShader(gl, vertex_shader_source, gl.VERTEX_SHADER);
        var fragment_shader = ShaderProgram.createShader(gl, '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment_shader_source, gl.FRAGMENT_SHADER);
    }
    catch(err) {
        log.error(err);
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
        var program_error = new Error(
            `WebGL program error:
            VALIDATE_STATUS: ${gl.getProgramParameter(program, gl.VALIDATE_STATUS)}
            ERROR: ${gl.getError()}
            --- Vertex Shader ---
            ${vertex_shader_source}
            --- Fragment Shader ---
            ${fragment_shader_source}`);
        log.error(program_error);
        throw program_error;
    }

    return program;
};

// Compile a vertex or fragment shader from provided source
ShaderProgram.createShader = function (gl, source, type) {
    var shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var shader_error =
            "WebGL shader error:\n" +
            (type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") + " SHADER:\n" +
            gl.getShaderInfoLog(shader);
        throw shader_error;
    }

    return shader;
};
