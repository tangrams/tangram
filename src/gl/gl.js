// WebGL management and rendering functions

var Utils = require('../utils.js');

var GL = {};

// Setup a WebGL context
// If no canvas element is provided, one is created and added to the document body
GL.getContext = function getContext (canvas)
{
    var canvas = canvas;
    var fullscreen = false;
    if (canvas == null) {
        canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.zIndex = -1;
        document.body.appendChild(canvas);
        fullscreen = true;
    }

    var gl = canvas.getContext('experimental-webgl');
    if (!gl) {
        alert("Couldn't create WebGL context. Your browser probably doesn't support WebGL or it's turned off?");
        throw "Couldn't create WebGL context";
    }

    GL.resizeCanvas(gl, window.innerWidth, window.innerHeight);
    if (fullscreen == true) {
        window.addEventListener('resize', function () {
            GL.resizeCanvas(gl, window.innerWidth, window.innerHeight);
        });
    }

    GL.VertexArrayObject.init(gl); // TODO: this pattern doesn't support multiple active GL contexts, should that even be supported?

    return gl;
};

GL.resizeCanvas = function (gl, width, height)
{
    var device_pixel_ratio = window.devicePixelRatio || 1;
    gl.canvas.style.width = width + 'px';
    gl.canvas.style.height = height + 'px';
    gl.canvas.width = Math.round(gl.canvas.style.width * device_pixel_ratio);
    gl.canvas.height = Math.round(gl.canvas.style.width * device_pixel_ratio);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
};

// Compile & link a WebGL program from provided vertex and shader source elements
GL.createProgramFromElements = function GLcreateProgramFromElements (gl, vertex_shader_id, fragment_shader_id)
{
    var vertex_shader_source = document.getElementById(vertex_shader_id).textContent;
    var fragment_shader_source = document.getElementById(fragment_shader_id).textContent;
    var program = gl.createProgram();
    return GL.updateProgram(gl, program, vertex_shader_source, fragment_shader_source);
};

// Compile & link a WebGL program from provided vertex and shader source URLs
// NOTE: loads via synchronous XHR for simplicity, could be made async
GL.createProgramFromURLs = function GLcreateProgramFromURLs (gl, vertex_shader_url, fragment_shader_url)
{
    var program = gl.createProgram();
    return GL.updateProgramFromURLs(gl, program, vertex_shader_url, fragment_shader_url);
};

GL.updateProgramFromURLs = function GLUpdateProgramFromURLs (gl, program, vertex_shader_url, fragment_shader_url)
{
    var vertex_shader_source, fragment_shader_source;
    var req = new XMLHttpRequest();

    req.onload = function () { vertex_shader_source = req.response; };
    req.open('GET', Utils.urlForPath(vertex_shader_url) + '?' + (+new Date()), false /* async flag */);
    req.send();

    req.onload = function () { fragment_shader_source = req.response; };
    req.open('GET', Utils.urlForPath(fragment_shader_url) + '?' + (+new Date()), false /* async flag */);
    req.send();

    return GL.updateProgram(gl, program, vertex_shader_source, fragment_shader_source);
};

// Compile & link a WebGL program from provided vertex and fragment shader sources
// update a program if one is passed in. Create one if not. Alert and don't update anything if the shaders don't compile.
GL.updateProgram = function GLupdateProgram (gl, program, vertex_shader_source, fragment_shader_source)
{
    try {
        var vertex_shader = GL.createShader(gl, vertex_shader_source, gl.VERTEX_SHADER);
        var fragment_shader = GL.createShader(gl, '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment_shader_source, gl.FRAGMENT_SHADER);
    }
    catch(err) {
        // alert(err);
        console.log(err);
        return program;
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
        var program_error =
            "WebGL program error:\n" +
            "VALIDATE_STATUS: " + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + "\n" +
            "ERROR: " + gl.getError() + "\n\n" +
            "--- Vertex Shader ---\n" + vertex_shader_source + "\n\n" +
            "--- Fragment Shader ---\n" + fragment_shader_source;
        console.log(program_error);
        throw program_error;
    }

    return program;
};

// Compile a vertex or fragment shader from provided source
GL.createShader = function GLcreateShader (gl, source, type)
{
    var shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var shader_error =
            "WebGL shader error:\n" +
            (type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") + " SHADER:\n" +
            gl.getShaderInfoLog(shader);
        throw shader_error;
    }

    return shader;
};

// Thin GL program layer to cache uniform locations/values, do compile-time pre-processing
// (injecting #defines and #pragma transforms into shaders), etc.
GL.Program = function (gl, vertex_shader_source, fragment_shader_source, options)
{
    options = options || {};

    this.gl = gl;
    this.program = null;
    this.defines = options.defines || {}; // key/values inserted as #defines into shaders at compile-time
    this.transforms = options.transforms; // key/values for URLs of blocks that can be injected into shaders at compile-time
    this.uniforms = {}; // program locations of uniforms, set/updated at compile-time
    this.attribs = {}; // program locations of vertex attributes
    this.vertex_shader_source = vertex_shader_source;
    this.fragment_shader_source = fragment_shader_source;
    this.compile();
};

// Creates a program that will refresh from source URLs each time it is compiled
GL.Program.createProgramFromURLs = function (gl, vertex_shader_url, fragment_shader_url, options)
{
    var program = Object.create(GL.Program.prototype);

    program.vertex_shader_url = vertex_shader_url;
    program.fragment_shader_url = fragment_shader_url;

    program.updateVertexShaderSource = function () {
        var source;
        var req = new XMLHttpRequest();
        req.onload = function () { source = req.response; };
        req.open('GET', Utils.urlForPath(this.vertex_shader_url) + '?' + (+new Date()), false /* async flag */);
        req.send();
        return source;
    };

    program.updateFragmentShaderSource = function () {
        var source;
        var req = new XMLHttpRequest();
        req.onload = function () { source = req.response; };
        req.open('GET', Utils.urlForPath(this.fragment_shader_url) + '?' + (+new Date()), false /* async flag */);
        req.send();
        return source;
    };

    GL.Program.call(program, gl, null, null, options);
    return program;
};

// Use program wrapper with simple state cache
GL.Program.prototype.use = function ()
{
    if (GL.Program.current != this) {
        this.gl.useProgram(this.program);
    }
    GL.Program.current = this;
};
GL.Program.current = null;

// Global defines applied to all programs (duplicate properties for a specific program will take precedence)
GL.Program.defines = {};

GL.Program.prototype.compile = function ()
{
    // Optionally update sources
    if (typeof this.updateVertexShaderSource == 'function') {
        this.vertex_shader_source = this.updateVertexShaderSource();
    }
    if (typeof this.updateFragmentShaderSource == 'function') {
        this.fragment_shader_source = this.updateFragmentShaderSource();
    }

    // Inject defines (global, then program-specific)
    var defines = {};
    for (var d in GL.Program.defines) {
        defines[d] = GL.Program.defines[d];
    }
    for (var d in this.defines) {
        defines[d] = this.defines[d];
    }

    var define_str = "";
    for (var d in defines) {
        if (defines[d] == false) {
            continue;
        }
        else if (typeof defines[d] == 'boolean' && defines[d] == true) { // booleans are simple defines with no value
            define_str += "#define " + d + "\n";
        }
        else if (typeof defines[d] == 'number' && Math.floor(defines[d]) == defines[d]) { // int to float conversion to satisfy GLSL floats
            define_str += "#define " + d + " " + defines[d].toFixed(1) + "\n";
        }
        else { // any other float or string value
            define_str += "#define " + d + " " + defines[d] + "\n";
        }
    }
    this.processed_vertex_shader_source = define_str + this.vertex_shader_source;
    this.processed_fragment_shader_source = define_str + this.fragment_shader_source;

    // Inject user-defined transforms (arbitrary code blocks matching named #pragmas)
    // TODO: flag to avoid re-retrieving transform URLs over network when rebuilding?
    // TODO: support glslify #pragma export names for better compatibility? (e.g. rename main() functions)
    // TODO: auto-insert uniforms referenced in mode definition, but not in shader base or transforms? (problem: don't have access to uniform list/type here)
    var re;
    if (this.transforms != null) {
        // Replace according to this pattern:
        // #pragma tangram: [key]
        // e.g. #pragma tangram: globals
        var source;
        var req = new XMLHttpRequest();
        req.onload = function () { source = req.response; };

        for (var key in this.transforms) {
            var transform = this.transforms[key];
            if (transform == null) {
                continue;
            }

            // Can be a single item (string or object) or a list
            if (typeof transform == 'string' || (typeof transform == 'object' && transform.length == null)) {
                transform = [transform];
            }

            // First find code replace points in shaders
            // var re = new RegExp('^\\s*#pragma\\s+tangram:\\s+' + key + '\\s*$', 'g');
            re = new RegExp('#pragma\\s+tangram:\\s+' + key, 'g');
            var inject_vertex = this.processed_vertex_shader_source.match(re);
            var inject_fragment = this.processed_fragment_shader_source.match(re);

            // Avoid network request if nothing to replace
            if (inject_vertex == null && inject_fragment == null) {
                continue;
            }

            // Get the code over the network
            // TODO: use of synchronous XHR may be a speed issue
            var combined_source = "";
            for (var u in transform) {
                // Can be an inline block of GLSL, or a URL to retrieve GLSL block from
                var type, value;
                if (typeof transform[u] == 'object') {
                    if (transform[u].url != null) {
                        type = 'url';
                        value = transform[u].url;
                    }
                    if (transform[u].inline != null) {
                        type = 'inline';
                        value = transform[u].inline;
                    }
                }
                else {
                    // Default to inline GLSL
                    type = 'inline';
                    value = transform[u];
                }

                if (type == 'inline') {
                    source = value;
                }
                else if (type == 'url') {
                    req.open('GET', Utils.urlForPath(value) + '?' + (+new Date()), false /* async flag */);
                    req.send();
                }

                combined_source += source + '\n';
            }

            // Inject the code
            if (inject_vertex != null) {
                this.processed_vertex_shader_source = this.processed_vertex_shader_source.replace(re, combined_source);
            }
            if (inject_fragment != null) {
                this.processed_fragment_shader_source = this.processed_fragment_shader_source.replace(re, combined_source);
            }
        }
    }

    // Clean-up any #pragmas that weren't replaced (to prevent compiler warnings)
    re = new RegExp('#pragma\\s+tangram:\\s+\\w+', 'g');
    this.processed_vertex_shader_source = this.processed_vertex_shader_source.replace(re, '');
    this.processed_fragment_shader_source = this.processed_fragment_shader_source.replace(re, '');

    // Compile & set uniforms to cached values
    this.program = GL.updateProgram(this.gl, this.program, this.processed_vertex_shader_source, this.processed_fragment_shader_source);
    this.use();
    this.refreshUniforms();
    this.refreshAttributes();
};

// ex: program.uniform('3f', 'position', x, y, z);
// TODO: only update uniforms when changed
GL.Program.prototype.uniform = function (method, name) // method-appropriate arguments follow
{
    var uniform = (this.uniforms[name] = this.uniforms[name] || {});
    uniform.name = name;
    uniform.location = uniform.location || this.gl.getUniformLocation(this.program, name);
    uniform.method = 'uniform' + method;
    uniform.values = Array.prototype.slice.call(arguments, 2);
    this.updateUniform(name);
};

// Set a single uniform
GL.Program.prototype.updateUniform = function (name)
{
    var uniform = this.uniforms[name];
    if (uniform == null || uniform.location == null) {
        return;
    }
    this.gl[uniform.method].apply(this.gl, [uniform.location].concat(uniform.values)); // call appropriate GL uniform method and pass through arguments
};

// Refresh uniform locations and set to last cached values
GL.Program.prototype.refreshUniforms = function ()
{
    for (var u in this.uniforms) {
        this.uniforms[u].location = this.gl.getUniformLocation(this.program, u);
        this.updateUniform(u);
    }
};

GL.Program.prototype.refreshAttributes = function ()
{
    // var len = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
    // for (var i=0; i < len; i++) {
    //     var a = this.gl.getActiveAttrib(this.program, i);
    //     console.log(a);
    // }
    this.attribs = {};
};

// Get the location of a vertex attribute
GL.Program.prototype.attribute = function (name)
{
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

// Triangulation using libtess.js port of gluTesselator
// https://github.com/brendankenny/libtess.js
try {
    GL.tesselator = (function initTesselator() {
        var tesselator = new libtess.GluTesselator();

        // Called for each vertex of tesselator output
        function vertexCallback(data, polyVertArray) {
            if (tesselator.z != null) {
                polyVertArray.push([data[0], data[1], tesselator.z]);
            }
            else {
                polyVertArray.push([data[0], data[1]]);
            }
        }

        // Called when segments intersect and must be split
        function combineCallback(coords, data, weight) {
            return coords;
        }

        // Called when a vertex starts or stops a boundary edge of a polygon
        function edgeCallback(flag) {
            // No-op callback to force simple triangle primitives (no triangle strips or fans).
            // See: http://www.glprogramming.com/red/chapter11.html
            // "Since edge flags make no sense in a triangle fan or triangle strip, if there is a callback
            // associated with GLU_TESS_EDGE_FLAG that enables edge flags, the GLU_TESS_BEGIN callback is
            // called only with GL_TRIANGLES."
            // console.log('GL.tesselator: edge flag: ' + flag);
        }

        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, vertexCallback);
        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE, combineCallback);
        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_EDGE_FLAG, edgeCallback);

        // Brendan Kenny:
        // libtess will take 3d verts and flatten to a plane for tesselation
        // since only doing 2d tesselation here, provide z=1 normal to skip
        // iterating over verts only to get the same answer.
        // comment out to test normal-generation code
        tesselator.gluTessNormal(0, 0, 1);

        return tesselator;
    })();

    GL.triangulatePolygon = function GLTriangulate (contours, z)
    {
        var triangleVerts = [];
        GL.tesselator.z = z;
        GL.tesselator.gluTessBeginPolygon(triangleVerts);

        for (var i = 0; i < contours.length; i++) {
            GL.tesselator.gluTessBeginContour();
            var contour = contours[i];
            for (var j = 0; j < contour.length; j ++) {
                var coords = [contour[j][0], contour[j][1], 0];
                GL.tesselator.gluTessVertex(coords, coords);
            }
            GL.tesselator.gluTessEndContour();
        }

        GL.tesselator.gluTessEndPolygon();
        return triangleVerts;
    };
}
catch (e) {
    // console.log("libtess not defined!");
    // skip if libtess not defined
}

// Add vertices to an array (destined to be used as a GL buffer), 'striping' each vertex with constant data
// Per-vertex attributes must be pre-packed into the vertices array
// Used for adding values that are often constant per geometry or polygon, like colors, normals (for polys sitting flat on map), layer and material info, etc.
GL.addVertices = function (vertices, vertex_constants, vertex_data)
{
    if (vertices == null) {
        return vertex_data;
    }
    vertex_constants = vertex_constants || [];

    for (var v=0, vlen = vertices.length; v < vlen; v++) {
        vertex_data.push.apply(vertex_data, vertices[v]);
        vertex_data.push.apply(vertex_data, vertex_constants);
    }

    return vertex_data;
};

// Add vertices to an array, 'striping' each vertex with constant data
// Multiple, un-packed attribute arrays can be provided
GL.addVerticesMultipleAttributes = function (dynamics, constants, vertex_data)
{
    var dlen = dynamics.length;
    var vlen = dynamics[0].length;
    constants = constants || [];

    for (var v=0; v < vlen; v++) {
        for (var d=0; d < dlen; d++) {
            vertex_data.push.apply(vertex_data, dynamics[d][v]);
        }
        vertex_data.push.apply(vertex_data, constants);
    }

    return vertex_data;
};

// Add vertices to an array, with a variable layout (both per-vertex dynamic and constant attribs)
// GL.addVerticesByAttributeLayout = function (attribs, vertex_data)
// {
//     var max_length = 0;
//     for (var a=0; a < attribs.length; a++) {
//         // console.log(attribs[a].name);
//         // console.log("a " + typeof attribs[a].data);
//         if (typeof attribs[a].data == 'object') {
//             // console.log("a[0] " + typeof attribs[a].data[0]);
//             // Per-vertex list - array of array
//             if (typeof attribs[a].data[0] == 'object') {
//                 attribs[a].cursor = 0;
//                 if (attribs[a].data.length > max_length) {
//                     max_length = attribs[a].data.length;
//                 }
//             }
//             // Static array for all vertices
//             else {
//                 attribs[a].next_vertex = attribs[a].data;
//             }
//         }
//         else {
//             // Static single value for all vertices, convert to array
//             attribs[a].next_vertex = [attribs[a].data];
//         }
//     }

//     for (var v=0; v < max_length; v++) {
//         for (var a=0; a < attribs.length; a++) {
//             if (attribs[a].cursor != null) {
//                 // Next value in list
//                 attribs[a].next_vertex = attribs[a].data[attribs[a].cursor];

//                 // TODO: repeats if one list is shorter than others - desired behavior, or enforce same length?
//                 if (attribs[a].cursor < attribs[a].data.length) {
//                     attribs[a].cursor++;
//                 }
//             }
//             vertex_data.push.apply(vertex_data, attribs[a].next_vertex);
//         }
//     }
//     return vertex_data;
// };

// Texture management

// Create & bind a texture
GL.createTexture = function (gl, options) {
    options = options || {};
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    return texture;
};

// Determines appropriate filtering mode
// Assumes texture to be operated on is already bound
GL.setTextureFiltering = function (gl, width, height, options) {
    options = options || {};
    options.filtering = options.filtering || 'mipmap'; // default to mipmaps for power-of-2 textures

    // For power-of-2 textures, the following presets are available:
    // mipmap: linear blend from nearest mip
    // linear: linear blend from original image (no mips)
    // nearest: nearest pixel from original image (no mips, 'blocky' look)
    if (Utils.isPowerOf2(width) && Utils.isPowerOf2(height)) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.TEXTURE_WRAP_S || gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.TEXTURE_WRAP_T || gl.CLAMP_TO_EDGE);

        if (options.filtering == 'mipmap') {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST); // TODO: use trilinear filtering by defualt instead?
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        else if (options.filtering == 'linear') {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
        else if (options.filtering == 'nearest') {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
    }
    else {
        // WebGL has strict requirements on non-power-of-2 textures:
        // No mipmaps and must clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        if (options.filtering == 'nearest') {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
        else { // default to linear for non-power-of-2 textures
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
    }
};

// GL texture wrapper object for keeping track of a global set of textures, keyed by an arbitrary name
GL.Texture = function (gl, name, options) {
    options = options || {};
    this.gl = gl;
    this.texture = gl.createTexture();
    this.bind(0);

    // Default to a 1-pixel black texture so we can safely render while we wait for an image to load
    // See: http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    GL.setTextureFiltering(gl, 1, 1, { filtering: 'nearest' });

    // TODO: support non-URL sources: canvas objects, raw pixel buffers

    this.name = name;
    GL.Texture.textures[this.name] = this;
};

GL.Texture.textures = {}; // global set of textures, by name

GL.Texture.prototype.bind = function (unit) {
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
};

GL.Texture.prototype.load = function (url, options) {
    options = options || {};
    this.image = new Image();
    this.image.onload = function() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, (options.UNPACK_FLIP_Y_WEBGL === false ? false : true));
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
        GL.setTextureFiltering(this.gl, this.image.width, this.image.height, options);
    }.bind(this);
    this.image.src = url;
};

// Creates a Vertex Array Object if the extension is available, or falls back on standard attribute calls
GL.VertexArrayObject = {};
GL.VertexArrayObject.disabled = false; // set to true to disable VAOs even if extension is available
GL.VertexArrayObject.bound_vao = null; // currently bound VAO

GL.VertexArrayObject.init = function (gl)
{
    if (GL.VertexArrayObject.ext == null) {
        if (GL.VertexArrayObject.disabled != true) {
            GL.VertexArrayObject.ext = gl.getExtension("OES_vertex_array_object");
        }

        if (GL.VertexArrayObject.ext != null) {
            console.log("Vertex Array Object extension available");
        }
        else if (GL.VertexArrayObject.disabled != true) {
            console.log("Vertex Array Object extension NOT available");
        }
        else {
            console.log("Vertex Array Object extension force disabled");
        }
    }
};

GL.VertexArrayObject.create = function (setup, teardown)
{
    var vao = {};
    vao.setup = setup;
    vao.teardown = teardown;

    var ext = GL.VertexArrayObject.ext;
    if (ext != null) {
        vao._vao = ext.createVertexArrayOES();
        ext.bindVertexArrayOES(vao._vao);
        vao.setup();
        ext.bindVertexArrayOES(null);
        if (typeof vao.teardown == 'function') {
            vao.teardown();
        }
    }
    else {
        vao.setup();
    }

    return vao;
};

GL.VertexArrayObject.bind = function (vao)
{
    var ext = GL.VertexArrayObject.ext;
    if (vao != null) {
        if (ext != null && vao._vao != null) {
            ext.bindVertexArrayOES(vao._vao);
            GL.VertexArrayObject.bound_vao = vao;
        }
        else {
            vao.setup();
        }
    }
    else {
        if (ext != null) {
            ext.bindVertexArrayOES(null);
        }
        else if (GL.VertexArrayObject.bound_vao != null && typeof GL.VertexArrayObject.bound_vao.teardown == 'function') {
            GL.VertexArrayObject.bound_vao.teardown();
        }
        GL.VertexArrayObject.bound_vao = null;
    }
};

if (module !== undefined) {
    module.exports = GL;
}
