/* global GLProgram */
// Thin GL program wrapp to cache uniform locations/values, do compile-time pre-processing
// (injecting #defines and #pragma transforms into shaders), etc.
import {GL} from './gl';
import GLTexture from './gl_texture';

GLProgram.id = 0; // assign each program a unique id
GLProgram.programs = {}; // programs, by id

export default function GLProgram (gl, vertex_shader, fragment_shader, options)
{
    options = options || {};

    this.gl = gl;
    this.program = null;
    this.compiled = false;
    this.compiling = false;
    this.defines = Object.assign({}, options.defines||{}); // key/values inserted as #defines into shaders at compile-time
    this.transforms = Object.assign({}, options.transforms||{}); // key/values for URLs of blocks that can be injected into shaders at compile-time
    this.uniforms = {}; // program locations of uniforms, set/updated at compile-time
    this.attribs = {}; // program locations of vertex attributes

    this.vertex_shader = vertex_shader;
    this.fragment_shader = fragment_shader;

    this.id = GLProgram.id++;
    GLProgram.programs[this.id] = this;
    this.name = options.name; // can provide a program name (useful for debugging)

    this.compile();
}

GLProgram.prototype.destroy = function () {
    this.gl.useProgram(null);
    this.gl.deleteProgram(this.program);
    this.program = null;
    this.uniforms = {};
    this.attribs = {};
    delete GLProgram.programs[this.id];
    this.compiled = false;
};

// Use program wrapper with simple state cache
GLProgram.prototype.use = function ()
{
    if (!this.compiled) {
        return;
    }

    if (GLProgram.current !== this) {
        this.gl.useProgram(this.program);
    }
    GLProgram.current = this;
};
GLProgram.current = null;

// Global config applied to all programs (duplicate properties for a specific program will take precedence)
GLProgram.defines = {};
GLProgram.transforms = {};

GLProgram.addTransform = function (key, ...transforms) {
    GLProgram.transforms[key] = GLProgram.transforms[key] || [];
    GLProgram.transforms[key].push(...transforms);
};

// Remove all global shader transforms for a given key
GLProgram.removeTransform = function (key) {
    GLProgram.transforms[key] = [];
};

GLProgram.prototype.compile = function () {

    if (this.compiling) {
        throw(new Error(`GLProgram.compile(): skipping for ${this.id} (${this.name}) because already compiling`));
    }
    this.compiling = true;
    this.compiled = false;

    // Copy sources from pre-modified template
    this.computed_vertex_shader = this.vertex_shader;
    this.computed_fragment_shader = this.fragment_shader;

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
        var inject_vertex = this.computed_vertex_shader.match(regexp);
        var inject_fragment = this.computed_fragment_shader.match(regexp);

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
            this.computed_vertex_shader = this.computed_vertex_shader.replace(regexp, source);
        }
        if (inject_fragment != null) {
            this.computed_fragment_shader = this.computed_fragment_shader.replace(regexp, source);
        }

        // Add a #define for this injection point
        defines['TANGRAM_TRANSFORM_' + key.replace(' ', '_').toUpperCase()] = true;
    }

    // Clean-up any #pragmas that weren't replaced (to prevent compiler warnings)
    regexp = new RegExp('^\\s*#pragma\\s+tangram:\\s+\\w+\\s*$', 'gm');
    this.computed_vertex_shader = this.computed_vertex_shader.replace(regexp, '');
    this.computed_fragment_shader = this.computed_fragment_shader.replace(regexp, '');

    // Build & inject defines
    // This is done *after* code injection so that we can add defines for which code points were injected
    var define_str = GLProgram.buildDefineString(defines);
    this.computed_vertex_shader = define_str + this.computed_vertex_shader;
    this.computed_fragment_shader = define_str + this.computed_fragment_shader;

    // Include program info useful for debugging
    var info = (this.name ? (this.name + ' / id ' + this.id) : ('id ' + this.id));
    this.computed_vertex_shader = '// Program: ' + info + '\n' + this.computed_vertex_shader;
    this.computed_fragment_shader = '// Program: ' + info + '\n' + this.computed_fragment_shader;

    // Compile & set uniforms to cached values
    try {
        this.program = GL.updateProgram(this.gl, this.program, this.computed_vertex_shader, this.computed_fragment_shader);
        this.compiled = true;
        this.compiling = false;
    }
    catch(error) {
        this.program = null;
        this.compiled = false;
        this.compiling = false;
        throw(new Error(`GLProgram.compile(): program ${this.id} (${this.name}) error:`, error));
    }

    this.use();
    this.refreshUniforms();
    this.refreshAttributes();
};

// Make list of defines (global, then program-specific)
GLProgram.prototype.buildDefineList = function () {
    var d, defines = {};
    for (d in GLProgram.defines) {
        defines[d] = GLProgram.defines[d];
    }
    for (d in this.defines) {
        defines[d] = this.defines[d];
    }
    return defines;
};

// Make list of shader transforms (global, then program-specific)
GLProgram.prototype.buildShaderTransformList = function () {
    var d, transforms = {};
    for (d in GLProgram.transforms) {
        transforms[d] = [];

        if (typeof GLProgram.transforms[d] === 'object' && GLProgram.transforms[d].length >= 0) {
            transforms[d].push(...GLProgram.transforms[d]);
        }
        else {
            transforms[d] = [GLProgram.transforms[d]];
        }
    }
    for (d in this.transforms) {
        transforms[d] = transforms[d] || [];

        if (typeof this.transforms[d] === 'object' && this.transforms[d].length >= 0) {
            transforms[d].push(...this.transforms[d]);
        }
        else {
            transforms[d].push(this.transforms[d]);
        }
    }
    return transforms;
};

// Turn #defines into a combined string
GLProgram.buildDefineString = function (defines) {
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

// Set uniforms from a JS object, with inferred types
GLProgram.prototype.setUniforms = function (uniforms)
{
    if (!this.compiled) {
        return;
    }

    // TODO: only update uniforms when changed
    var texture_unit = 0;

    for (var u in uniforms) {
        var uniform = uniforms[u];

        // Single float
        if (typeof uniform === 'number') {
            this.uniform('1f', u, uniform);
        }
        // Multiple floats - vector or array
        else if (typeof uniform === 'object') {
            // float vectors (vec2, vec3, vec4)
            if (uniform.length >= 2 && uniform.length <= 4) {
                this.uniform(uniform.length + 'fv', u, uniform);
            }
            // float array
            else if (uniform.length > 4) {
                this.uniform('1fv', u + '[0]', uniform);
            }
            // TODO: assume matrix for (typeof == Float32Array && length == 16)?
        }
        // Boolean
        else if (typeof uniform === 'boolean') {
            this.uniform('1i', u, uniform);
        }
        // Texture
        else if (typeof uniform === 'string') {
            var texture = GLTexture.textures[uniform];
            if (texture == null) {
                texture = new GLTexture(this.gl, uniform);
                texture.load(uniform);
            }

            texture.bind(texture_unit);
            this.uniform('1i', u, texture_unit);
            texture_unit++;
        }
        // TODO: support other non-float types? (int, etc.)
    }
};

// ex: program.uniform('3f', 'position', x, y, z);
// TODO: only update uniforms when changed
GLProgram.prototype.uniform = function (method, name, ...values) // 'values' is a method-appropriate arguments list
{
    if (!this.compiled) {
        return;
    }

    var uniform = (this.uniforms[name] = this.uniforms[name] || {});
    uniform.name = name;
    uniform.location = uniform.location || this.gl.getUniformLocation(this.program, name);
    uniform.method = 'uniform' + method;
    uniform.values = values;
    this.updateUniform(name);
};

// Set a single uniform
GLProgram.prototype.updateUniform = function (name)
{
    if (!this.compiled) {
        return;
    }

    var uniform = this.uniforms[name];
    if (uniform == null || uniform.location == null) {
        return;
    }

    this.use();
    this.gl[uniform.method].apply(this.gl, [uniform.location].concat(uniform.values)); // call appropriate GL uniform method and pass through arguments
};

// Refresh uniform locations and set to last cached values
GLProgram.prototype.refreshUniforms = function ()
{
    if (!this.compiled) {
        return;
    }

    for (var u in this.uniforms) {
        this.uniforms[u].location = this.gl.getUniformLocation(this.program, u);
        this.updateUniform(u);
    }
};

GLProgram.prototype.refreshAttributes = function ()
{
    // var len = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
    // for (var i=0; i < len; i++) {
    //     var a = this.gl.getActiveAttrib(this.program, i);
    // }
    this.attribs = {};
};

// Get the location of a vertex attribute
GLProgram.prototype.attribute = function (name)
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
