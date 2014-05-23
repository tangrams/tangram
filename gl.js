// WebGL management and rendering functions
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

    gl = canvas.getContext('experimental-webgl', { /*preserveDrawingBuffer: true*/ }); // preserveDrawingBuffer needed for gl.readPixels (could be used for feature selection)
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
    req.open('GET', vertex_shader_url + '?' + (+new Date()), false /* async flag */);
    req.send();

    req.onload = function () { fragment_shader_source = req.response; };
    req.open('GET', fragment_shader_url + '?' + (+new Date()), false /* async flag */);
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
    catch(err)
    {
        alert(err);
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

// Thin GL program layer to cache uniform locations/values, do compile-time pre-processing (injecting #defines into shaders), etc.
GL.Program = function (gl, vertex_shader_source, fragment_shader_source)
{
    this.gl = gl;
    this.program = null;
    this.defines = {}; // key/values inserted into shaders at compile-time
    this.uniforms = {}; // program locations of uniforms, set/updated at compile-time
    this.vertex_shader_source = vertex_shader_source;
    this.fragment_shader_source = fragment_shader_source;
    this.compile();
};

// Creates a program that will refresh from source URLs each time it is compiled
GL.Program.createProgramFromURLs = function (gl, vertex_shader_url, fragment_shader_url)
{
    var program = Object.create(GL.Program.prototype);

    program.vertex_shader_url = vertex_shader_url;
    program.fragment_shader_url = fragment_shader_url;

    program.updateVertexShaderSource = function () {
        var source;
        var req = new XMLHttpRequest();
        req.onload = function () { source = req.response; };
        req.open('GET', this.vertex_shader_url + '?' + (+new Date()), false /* async flag */);
        req.send();
        return source;
    };

    program.updateFragmentShaderSource = function () {
        var source;
        var req = new XMLHttpRequest();
        req.onload = function () { source = req.response; };
        req.open('GET', this.fragment_shader_url + '?' + (+new Date()), false /* async flag */);
        req.send();
        return source;
    };

    GL.Program.call(program, gl);
    return program;
};

GL.Program.prototype.compile = function ()
{
    // Optionally update sources
    if (typeof this.updateVertexShaderSource == 'function') {
        this.vertex_shader_source = this.updateVertexShaderSource();
    }
    if (typeof this.updateFragmentShaderSource == 'function') {
        this.fragment_shader_source = this.updateFragmentShaderSource();
    }

    // Inject defines
    var defines = "";
    for (var d in this.defines) {
        if (this.defines[d] == false) {
            continue;
        }
        else if (typeof this.defines[d] == 'boolean' && this.defines[d] == true) {
            defines += "#define " + d + "\n";
        }
        else {
            defines += "#define " + d + " (" + this.defines[d] + ")\n";
        }
    }
    this.processed_vertex_shader_source = defines + this.vertex_shader_source;
    this.processed_fragment_shader_source = defines + this.fragment_shader_source;

    // Compile & set uniforms to cached values
    this.program = GL.updateProgram(this.gl, this.program, this.processed_vertex_shader_source, this.processed_fragment_shader_source);
    this.gl.useProgram(this.program);
    this.refreshUniforms();
};

// ex: program.uniform('3f', 'position', x, y, z);
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

// Triangulation using libtess.js port of gluTesselator
// https://github.com/brendankenny/libtess.js
// if (this.libtess !== undefined) {
    GL.tesselator = (function initTesselator() {
        // function called for each vertex of tesselator output
        function vertexCallback(data, polyVertArray) {
            // polyVertArray[polyVertArray.length] = data[0];
            // polyVertArray[polyVertArray.length] = data[1];
            polyVertArray[polyVertArray.length] = [data[0], data[1]];
        }

        function begincallback(type) {
            if (type !== libtess.primitiveType.GL_TRIANGLES) {
                console.log('GL.tesselator: expected TRIANGLES but got type: ' + type);
            }
        }

        function errorcallback(errno) {
            console.log('GL.tesselator: error callback');
            console.log('GL.tesselator: error number: ' + errno);
        }

        // callback for when segments intersect and must be split
        function combinecallback(coords, data, weight) {
            // console.log('GL.tesselator: combine callback');
            return [coords[0], coords[1], coords[2]];
        }

        function edgeCallback(flag) {
            // don't really care about the flag, but need no-strip/no-fan behavior
            // console.log('GL.tesselator: edge flag: ' + flag);
        }

        var tesselator = new libtess.GluTesselator();
        // tesselator.gluTessProperty(libtess.gluEnum.GLU_TESS_WINDING_RULE, libtess.windingRule.GLU_TESS_WINDING_POSITIVE);
        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, vertexCallback);
        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_BEGIN, begincallback);
        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_ERROR, errorcallback);
        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE, combinecallback);
        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_EDGE_FLAG, edgeCallback);

        return tesselator;
    })();
// }

GL.triangulate = function GLTriangulate (contours)
{
    // libtess will take 3d verts and flatten to a plane for tesselation
    // since only doing 2d tesselation here, provide z=1 normal to skip
    // iterating over verts only to get the same answer.
    // comment out to test normal-generation code
    GL.tesselator.gluTessNormal(0, 0, 1);

    var triangleVerts = [];
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

// Add one or more vertices to an array (destined to be used as a GL buffer), 'striping' each vertex with constant data
// Used for adding values that are often constant per geometry or polygon, like colors, normals (for polys sitting flat on map), layer and material info, etc.
GL.addVertices = function (vertices, vertex_data, vertex_constants)
{
    if (vertices != null && vertices.length > 0) {
        // Array of vertices
        if (typeof vertices[0] == 'object') {
            for (var v=0; v < vertices.length; v++) {
                vertex_data.push.apply(vertex_data, vertices[v]);
                if (vertex_constants) {
                    vertex_data.push.apply(vertex_data, vertex_constants);
                }
            }
        }
        // Single vertex
        else {
            vertex_data.push.apply(vertex_data, vertices);
            if (vertex_constants) {
                vertex_data.push.apply(vertex_data, vertex_constants);
            }
        }
    }
    return vertex_data;
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


/*** Manage rendering for primitives ***/

function GLGeometry (gl, program, vertex_data, vertex_stride, options)
{
    options = options || {};

    this.gl = gl;
    this.program = program;
    this.vertex_data = vertex_data; // Float32Array
    this.vertex_stride = vertex_stride;
    this.vertex_count = this.vertex_data.byteLength / this.vertex_stride;
    this.buffer = this.gl.createBuffer();
    this.draw_mode = options.draw_mode || this.gl.TRIANGLES;
    this.data_usage = options.data_usage || this.gl.STATIC_DRAW;

    this.vao = GL.VertexArrayObject.create(function() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        if (typeof this._setup == 'function') {
            this._setup();
        }
    }.bind(this));

    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertex_data, this.data_usage);
}

GLGeometry.prototype.render = function ()
{
    this.gl.useProgram(this.program);
    GL.VertexArrayObject.bind(this.vao);

    if (typeof this._render == 'function') {
        this._render();
    }

    this.gl.drawArrays(this.draw_mode, 0, this.vertex_count);
    GL.VertexArrayObject.bind(null);
};

GLGeometry.prototype.destroy = function ()
{
    console.log("GLGeometry.destroy: delete buffer of size " + this.vertex_data.byteLength);
    this.gl.deleteBuffer(this.buffer);
    delete this.vertex_data;
};

// Draws a set of triangles
GLTriangles.prototype = Object.create(GLGeometry.prototype);

function GLTriangles (gl, program, vertex_data)
{
    // Set program attributes before calling parent constructor because they're needed to setup the VAO
    gl.useProgram(program);
    this.vertex_position = gl.getAttribLocation(program, 'position');
    this.vertex_normal = gl.getAttribLocation(program, 'normal');
    this.vertex_color = gl.getAttribLocation(program, 'color');
    this.vertex_layer = gl.getAttribLocation(program, 'layer');

    // Base class
    GLGeometry.call(this, gl, program, vertex_data, 10 * Float32Array.BYTES_PER_ELEMENT);
    this.geometry_count = this.vertex_count / 3;
}

GLTriangles.prototype._setup = function ()
{
    this.gl.enableVertexAttribArray(this.vertex_position);
    this.gl.vertexAttribPointer(this.vertex_position, 3, this.gl.FLOAT, false, this.vertex_stride, 0);

    this.gl.enableVertexAttribArray(this.vertex_normal);
    this.gl.vertexAttribPointer(this.vertex_normal, 3, this.gl.FLOAT, false, this.vertex_stride, 3 * Float32Array.BYTES_PER_ELEMENT);

    this.gl.enableVertexAttribArray(this.vertex_color);
    this.gl.vertexAttribPointer(this.vertex_color, 3, this.gl.FLOAT, false, this.vertex_stride, 6 * Float32Array.BYTES_PER_ELEMENT);

    this.gl.enableVertexAttribArray(this.vertex_layer);
    this.gl.vertexAttribPointer(this.vertex_layer, 1, this.gl.FLOAT, false, this.vertex_stride, 9 * Float32Array.BYTES_PER_ELEMENT);
};

// Draws a set of points as quads, intended to be rendered as distance fields
GLPolyPoints.prototype = Object.create(GLGeometry.prototype);

function GLPolyPoints (gl, program, vertex_data)
{
    // Set program attributes before calling parent constructor because they're needed to setup the VAO
    gl.useProgram(program);
    this.vertex_position = gl.getAttribLocation(program, 'position');
    this.vertex_texcoord = gl.getAttribLocation(program, 'texcoord');
    this.vertex_color = gl.getAttribLocation(program, 'color');
    this.vertex_layer = gl.getAttribLocation(program, 'layer');

    // Base class
    GLGeometry.call(this, gl, program, vertex_data, 9 * Float32Array.BYTES_PER_ELEMENT);
    this.geometry_count = this.vertex_count / 3;
}

GLPolyPoints.prototype._setup = function ()
{
    this.gl.enableVertexAttribArray(this.vertex_position);
    this.gl.vertexAttribPointer(this.vertex_position, 3, this.gl.FLOAT, false, this.vertex_stride, 0);

    this.gl.enableVertexAttribArray(this.vertex_texcoord);
    this.gl.vertexAttribPointer(this.vertex_texcoord, 2, this.gl.FLOAT, false, this.vertex_stride, 3 * Float32Array.BYTES_PER_ELEMENT);

    this.gl.enableVertexAttribArray(this.vertex_color);
    this.gl.vertexAttribPointer(this.vertex_color, 3, this.gl.FLOAT, false, this.vertex_stride, 5 * Float32Array.BYTES_PER_ELEMENT);

    this.gl.enableVertexAttribArray(this.vertex_layer);
    this.gl.vertexAttribPointer(this.vertex_layer, 1, this.gl.FLOAT, false, this.vertex_stride, 8 * Float32Array.BYTES_PER_ELEMENT);
};

// Draws a set of lines
// Shares all characteristics with triangles except for draw mode
GLLines.prototype = Object.create(GLTriangles.prototype);

function GLLines (gl, program, vertex_data, options)
{
    options = options || {};
    GLTriangles.call(this, gl, program, vertex_data, 9 * Float32Array.BYTES_PER_ELEMENT);
    this.draw_mode = this.gl.LINES;
    this.line_width = options.line_width || 2;
    this.geometry_count = this.vertex_count / 2;
}

GLLines.prototype._render = function ()
{
    this.gl.lineWidth(this.line_width);
    GLTriangles.prototype._render.call(this);
};


/*** Vector functions - vectors provided as [x, y, z] arrays ***/

var Vector = {};

// Vector length squared
Vector.lengthSq = function (v)
{
    if (v.length == 2) {
        return (v[0]*v[0] + v[1]*v[1]);
    }
    else {
        return (v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    }
};

// Vector length
Vector.length = function (v)
{
    return Math.sqrt(Vector.lengthSq(v));
};

// Normalize a vector
Vector.normalize = function (v)
{
    var d;
    if (v.length == 2) {
        d = v[0]*v[0] + v[1]*v[1];
        d = Math.sqrt(d);

        if (d != 0) {
            return [v[0] / d, v[1] / d];
        }
        return [0, 0];
    }
    else {
        var d = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
        d = Math.sqrt(d);

        if (d != 0) {
            return [v[0] / d, v[1] / d, v[2] / d];
        }
        return [0, 0, 0];
    }
};

// Cross product of two vectors
Vector.cross  = function (v1, v2)
{
    return [
        (v1[1] * v2[2]) - (v1[2] * v2[1]),
        (v1[2] * v2[0]) - (v1[0] * v2[2]),
        (v1[0] * v2[1]) - (v1[1] * v2[0])
    ];
};

// Find the intersection of two lines specified as segments from points (p1, p2) and (p3, p4)
// http://en.wikipedia.org/wiki/Line-line_intersection
// http://en.wikipedia.org/wiki/Cramer's_rule
Vector.lineIntersection = function (p1, p2, p3, p4, parallel_tolerance)
{
    var parallel_tolerance = parallel_tolerance || 0.01;

    // a1*x + b1*y = c1 for line (x1, y1) to (x2, y2)
    // a2*x + b2*y = c2 for line (x3, y3) to (x4, y4)
    var a1 = p1[1] - p2[1]; // y1 - y2
    var b1 = p1[0] - p2[0]; // x1 - x2
    var a2 = p3[1] - p4[1]; // y3 - y4
    var b2 = p3[0] - p4[0]; // x3 - x4
    var c1 = (p1[0] * p2[1]) - (p1[1] * p2[0]); // x1*y2 - y1*x2
    var c2 = (p3[0] * p4[1]) - (p3[1] * p4[0]); // x3*y4 - y3*x4
    var denom = (b1 * a2) - (a1 * b2);

    if (Math.abs(denom) > parallel_tolerance) {
        return [
            ((c1 * b2) - (b1 * c2)) / denom,
            ((c1 * a2) - (a1 * c2)) / denom
        ];
    }
    return null; // return null if lines are (close to) parallel
};
