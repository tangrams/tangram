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
    return GL.createProgram(gl, vertex_shader_source, fragment_shader_source);
};

// Compile & link a WebGL program from provided vertex and shader source URLs
// NOTE: loads via synchronous XHR for simplicity, could be made async
GL.createProgramFromURLs = function GLcreateProgramFromElements (gl, vertex_shader_url, fragment_shader_url)
{
    var vertex_shader_source, fragment_shader_source;
    var req = new XMLHttpRequest();

    req.onload = function () { vertex_shader_source = req.response; };
    req.open('GET', vertex_shader_url, false /* async flag */);
    req.send();

    req.onload = function () { fragment_shader_source = req.response; };
    req.open('GET', fragment_shader_url, false /* async flag */);
    req.send();

    return GL.createProgram(gl, vertex_shader_source, fragment_shader_source);
};

// Compile & link a WebGL program from provided vertex and fragment shader sources
GL.createProgram = function GLcreateProgram (gl, vertex_shader_source, fragment_shader_source)
{
    var program = gl.createProgram();

    var vertex_shader = GL.createShader(gl, vertex_shader_source, gl.VERTEX_SHADER);
    var fragment_shader = GL.createShader(gl, '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment_shader_source, gl.FRAGMENT_SHADER);

    if (vertex_shader == null || fragment_shader == null) {
        return null;
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
GL.makeProgramLayout = function (gl, program, program_layout)
{
    var p = program_layout;
    p.program = program;
    p.attrib_stride = 0;

    // Determine buffer layout
    for (var a in program_layout.attribs) {
        var attrib = program_layout.attribs[a];
        attrib.location = gl.getAttribLocation(p.program, attrib.name);

        var elem_size = 0;
        if (attrib.type == gl.FLOAT) {
            elem_size = Float32Array.BYTES_PER_ELEMENT;
        }
        // TODO: add other GL types

        attrib.size = attrib.components * elem_size;
        attrib.offset = p.attrib_stride;
        p.attrib_stride += attrib.size;
    }

    // TODO: support for uniforms?

    return p;
};

// Triangulation using libtess.js port of gluTesselator
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

// Draws a set of triangles, expects triangle vertex buffer defined by program_layout
function GLTriangles (gl, program_layout, vertex_data)
{
    this.gl = gl;
    this.program = program_layout.program;
    this.program_layout = program_layout;
    this.vertex_data = vertex_data; // Float32Array
    this.count = this.vertex_data.byteLength / this.program_layout.attrib_stride; // calc vertex count from buffer size and layout
    this.buffer = this.gl.createBuffer();

    // this.gl.useProgram(this.program);
    // this.vertex_position = this.gl.getAttribLocation(this.program, 'position');
    // this.vertex_normal = this.gl.getAttribLocation(this.program, 'normal');
    // this.vertex_color = this.gl.getAttribLocation(this.program, 'color');

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertex_data, this.gl.STATIC_DRAW);
}

GLTriangles.prototype.render = function ()
{
    this.gl.useProgram(this.program);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

    // this.gl.enableVertexAttribArray(this.vertex_position);
    // this.gl.vertexAttribPointer(this.vertex_position, 3, this.gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 0);

    // this.gl.enableVertexAttribArray(this.vertex_normal);
    // this.gl.vertexAttribPointer(this.vertex_normal, 3, this.gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    // this.gl.enableVertexAttribArray(this.vertex_color);
    // this.gl.vertexAttribPointer(this.vertex_color, 3, this.gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);

    for (var a in this.program_layout.attribs) {
        var attrib = this.program_layout.attribs[a];
        this.gl.enableVertexAttribArray(attrib.location);
        this.gl.vertexAttribPointer(attrib.location, attrib.components, attrib.type, attrib.normalized, this.program_layout.attrib_stride, attrib.offset);
    }

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.count);
};

GLTriangles.prototype.destroy = function ()
{
    console.log("glTriangles.destroy: delete buffer of size " + this.vertex_data.byteLength);
    this.gl.deleteBuffer(this.buffer);
    delete this.vertex_data;
};

// Draws a background via 2 triangles covering the whole viewport
// function GLBackground (gl, program)
// {
//     this.gl = gl;
//     this.program = program;
//     this.gl.useProgram(this.program);

//     // Create vertex buffer (2 triangles covering whole viewport)
//     this.buffer = this.gl.createBuffer();
//     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
//     this.gl.bufferData(this.gl.ARRAY_BUFFER,
//         new Float32Array([
//             -1.0, -1.0, 0.0, 1.0, 0.0, 0.0,
//              1.0, -1.0, 0.0, 1.0, 0.0, 0.0,
//             -1.0,  1.0, 0.0, 1.0, 0.0, 0.0,
//              1.0, -1.0, 0.0, 1.0, 0.0, 0.0,
//              1.0,  1.0, 0.0, 1.0, 0.0, 0.0,
//             -1.0,  1.0, 0.0, 1.0, 0.0, 0.0
//         ]),
//         this.gl.STATIC_DRAW
//     );
//     this.vertex_position = this.gl.getAttribLocation(this.program, 'position');
//     this.vertex_color = this.gl.getAttribLocation(this.program, 'color');
// }

// GLBackground.prototype.render = function ()
// {
//     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

//     this.gl.enableVertexAttribArray(this.vertex_position);
//     this.gl.vertexAttribPointer(this.vertex_position, 3, this.gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);

//     this.gl.enableVertexAttribArray(this.vertex_color);
//     this.gl.vertexAttribPointer(this.vertex_color, 3, this.gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

//     this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
// };

/*** Vector functions - vectors provided as [x, y, z] arrays ***/

var Vector = {};

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
