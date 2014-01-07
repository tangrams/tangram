// WebGL management and rendering functions
var GL = {};

GL.getContext = function getContext (canvas)
{
    canvas = canvas || document.getElementById('webgl-canvas');
    if (canvas == null) {
        canvas = document.createElement('canvas');
        canvas.id = 'webgl-canvas';
        document.body.appendChild(canvas);
    }

    gl = canvas.getContext('experimental-webgl', { /*preserveDrawingBuffer: true*/ }); // preserveDrawingBuffer needed for gl.readPixels (could be used for feature selection)
    if (!gl) {
        alert("Couldn't create WebGL context. Your browser probably doesn't support WebGL or it's turned off?");
        throw "Couldn't create WebGL context";
    }

    function GLonWindowResize (event)
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', GLonWindowResize);
    GLonWindowResize();

    return gl;
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
    req.open('GET', vertex_shader_url, false /* async flag */);
    req.send();

    req.onload = function () { fragment_shader_source = req.response; };
    req.open('GET', fragment_shader_url, false /* async flag */);
    req.send();    
    return GL.updateProgram(gl, program, vertex_shader_source, fragment_shader_source);
}


// Compile & link a WebGL program from provided vertex and fragment shader sources
// update a program if one is passed in. Create one if not. Alert and don't update anything if the shaders don't compile.
GL.updateProgram = function GLupdateProgram(gl, program, vertex_shader_source, fragment_shader_source) 
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
    if(program != null) {
        var oldShaders = gl.getAttachedShaders(program);
        for(var i = 0; i < oldShaders.length; i++) {
            console.log('Detaching old shader ' + i)
            gl.detachShader(program, oldShaders[i]);
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
}

// Determine layout for vertex data
// GL.makeProgramLayout = function (gl, program, program_layout)
// {
//     var p = program_layout;
//     p.program = program;
//     p.attrib_stride = 0;

//     // Determine buffer layout
//     for (var a in program_layout.attribs) {
//         var attrib = program_layout.attribs[a];
//         attrib.location = gl.getAttribLocation(p.program, attrib.name);

//         var elem_size = 0;
//         if (attrib.type == gl.FLOAT) {
//             elem_size = Float32Array.BYTES_PER_ELEMENT;
//         }
//         // TODO: add other GL types

//         attrib.size = attrib.components * elem_size;
//         attrib.offset = p.attrib_stride;
//         p.attrib_stride += attrib.size;
//     }

//     // TODO: support for uniforms?

//     return p;
// };

// Triangulation using libtess.js port of gluTesselator
// https://github.com/brendankenny/libtess.js
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

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertex_data, this.data_usage);
}

GLGeometry.prototype.render = function ()
{
    this.gl.useProgram(this.program);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

    this._render();

    this.gl.drawArrays(this.draw_mode, 0, this.vertex_count);
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
    GLGeometry.call(this, gl, program, vertex_data, 9 * Float32Array.BYTES_PER_ELEMENT);
    this.geometry_count = this.vertex_count / 3;

    this.gl.useProgram(this.program);
    this.vertex_position = this.gl.getAttribLocation(this.program, 'position');
    this.vertex_normal = this.gl.getAttribLocation(this.program, 'normal');
    this.vertex_color = this.gl.getAttribLocation(this.program, 'color');
}

GLTriangles.prototype._render = function ()
{
    this.gl.enableVertexAttribArray(this.vertex_position);
    this.gl.vertexAttribPointer(this.vertex_position, 3, this.gl.FLOAT, false, this.vertex_stride, 0);

    this.gl.enableVertexAttribArray(this.vertex_normal);
    this.gl.vertexAttribPointer(this.vertex_normal, 3, this.gl.FLOAT, false, this.vertex_stride, 3 * Float32Array.BYTES_PER_ELEMENT);

    this.gl.enableVertexAttribArray(this.vertex_color);
    this.gl.vertexAttribPointer(this.vertex_color, 3, this.gl.FLOAT, false, this.vertex_stride, 6 * Float32Array.BYTES_PER_ELEMENT);
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
    return (v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
};

// Vector length
Vector.length = function (v)
{
    var d = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
    return Math.sqrt(d);
};

// Normalize a vector
Vector.normalize = function (v)
{
    var d = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
    d = Math.sqrt(d);

    if (d != 0) {
        return [v[0] / d, v[1] / d, v[2] / d];
    }
    return [0, 0, 0];
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
