/* global GLGeometry */
/*** Manage rendering for primitives ***/
import GLProgram from './gl_program';
import log from 'loglevel';

// A single mesh/VBO, described by a vertex layout, that can be drawn with one or more programs
export default function GLGeometry (gl, vertex_data, vertex_layout, options)
{
    options = options || {};

    this.gl = gl;
    this.vertex_data = vertex_data; // typed array
    this.vertex_layout = vertex_layout;
    this.buffer = this.gl.createBuffer();
    this.draw_mode = options.draw_mode || this.gl.TRIANGLES;
    this.data_usage = options.data_usage || this.gl.STATIC_DRAW;
    this.vertices_per_geometry = 3; // TODO: support lines, strip, fan, etc.

    this.vertex_count = this.vertex_data.byteLength / this.vertex_layout.stride;
    this.geometry_count = this.vertex_count / this.vertices_per_geometry;

    // TODO: disabling VAOs for now because we need to support different vertex layout + program combinations,
    // where not all programs will recognize all attributes (e.g. feature selection shaders include extra attrib).
    // To support VAOs here, would need to support multiple per geometry, keyed by GL program?
    // this.vao = GLVertexArrayObject.create(function() {
    //     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    //     this.setup();
    // }.bind(this));

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertex_data, this.data_usage);
    this.valid = true;
}

// Render, by default with currently bound program, or otherwise with optionally provided one
GLGeometry.prototype.render = function (options = {})
{
    if (!this.valid) {
        return false;
    }

    // GLVertexArrayObject.bind(this.vao);

    if (typeof this._render_setup === 'function') {
        this._render_setup();
    }

    var program = options.program || GLProgram.current;
    program.use();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.vertex_layout.enable(this.gl, program);

    // TODO: support element array mode
    this.gl.drawArrays(this.draw_mode, 0, this.vertex_count);
    // GLVertexArrayObject.bind(null);
    return true;
};

GLGeometry.prototype.destroy = function ()
{
    if (!this.valid) {
        return false;
    }
    log.trace('GLGeometry.destroy: delete buffer of size ' + this.vertex_data.byteLength);
    this.gl.deleteBuffer(this.buffer);
    this.buffer = null;
    delete this.vertex_data;
    this.valid = false;
    return true;
};
