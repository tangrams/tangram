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

// Compile & link a WebGL program from provided vertex and shader source
GL.createProgramFromElements = function GLcreateProgramFromElements (gl, vertex_shader_id, fragment_shader_id)
{
    var vertex_shader_source = document.getElementById(vertex_shader_id).textContent;
    var fragment_shader_source = document.getElementById(fragment_shader_id).textContent;
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

/*** Manage rendering for a set of triangles triangles ***/

function GLTriangles (gl, program, data, count)
{
    this.gl = gl;
    this.program = program;
    this.data = data; // Float32Array
    this.count = count; // TODO: calc count from buffer size/attributes/buffer layout?
    this.buffer = this.gl.createBuffer();

    this.gl.useProgram(this.program);
    this.vertex_position = this.gl.getAttribLocation(this.program, 'position');
    this.vertex_color = this.gl.getAttribLocation(this.program, 'color'); // TODO: colors/other props configurable?

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.data, this.gl.STATIC_DRAW);
}

GLTriangles.prototype.render = function ()
{
    this.gl.useProgram(this.program);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

    this.gl.enableVertexAttribArray(this.vertex_position);
    this.gl.vertexAttribPointer(this.vertex_position, 3, this.gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);

    this.gl.enableVertexAttribArray(this.vertex_color);
    this.gl.vertexAttribPointer(this.vertex_color, 3, this.gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.count);
};

GLTriangles.prototype.destroy = function ()
{
    console.log("glTriangles.destroy: delete buffer of size " + this.data.byteLength);
    this.gl.deleteBuffer(this.buffer);
    delete this.data;
};

function GLBackground (gl, program)
{
    this.gl = gl;
    this.program = program;
    this.gl.useProgram(this.program);

    // Create vertex buffer (2 triangles covering whole viewport)
    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER,
        new Float32Array([
            -1.0, -1.0, 0.0, 1.0, 0.0, 0.0,
             1.0, -1.0, 0.0, 1.0, 0.0, 0.0,
            -1.0,  1.0, 0.0, 1.0, 0.0, 0.0,
             1.0, -1.0, 0.0, 1.0, 0.0, 0.0,
             1.0,  1.0, 0.0, 1.0, 0.0, 0.0,
            -1.0,  1.0, 0.0, 1.0, 0.0, 0.0
        ]),
        this.gl.STATIC_DRAW
    );
    this.vertex_position = this.gl.getAttribLocation(this.program, 'position');
    this.vertex_color = this.gl.getAttribLocation(this.program, 'color');
}

GLBackground.prototype.render = function ()
{
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

    this.gl.enableVertexAttribArray(this.vertex_position);
    this.gl.vertexAttribPointer(this.vertex_position, 3, this.gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);

    this.gl.enableVertexAttribArray(this.vertex_color);
    this.gl.vertexAttribPointer(this.vertex_color, 3, this.gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
};
