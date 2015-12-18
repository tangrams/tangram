// Manage rendering for primitives
import ShaderProgram from './shader_program';
import VertexArrayObject from './vao';
import log from 'loglevel';

// A single mesh/VBO, described by a vertex layout, that can be drawn with one or more programs
export default class VBOMesh  {

    constructor(gl, vertex_data, vertex_layout, options) {
        options = options || {};

        this.gl = gl;
        this.vertex_data = vertex_data; // typed array
        this.vertex_layout = vertex_layout;
        this.buffer = this.gl.createBuffer();
        this.draw_mode = options.draw_mode || this.gl.TRIANGLES;
        this.data_usage = options.data_usage || this.gl.STATIC_DRAW;
        this.vertices_per_geometry = 3; // TODO: support lines, strip, fan, etc.
        this.uniforms = options.uniforms;
        this.retain = options.retain || false; // whether to retain mesh data in CPU after uploading to GPU

        this.vertex_count = this.vertex_data.byteLength / this.vertex_layout.stride;
        this.geometry_count = this.vertex_count / this.vertices_per_geometry;
        this.vaos = new Map(); // map of VertexArrayObjects, keyed by program

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertex_data, this.data_usage);

        if (!this.retain) {
            delete this.vertex_data;
        }
        this.valid = true;
    }

    // Render, by default with currently bound program, or otherwise with optionally provided one
    render(options = {}) {
        if (!this.valid) {
            return false;
        }

        if (typeof this._render_setup === 'function') {
            this._render_setup();
        }

        var program = options.program || ShaderProgram.current;
        program.use();

        if (this.uniforms) {
            program.saveUniforms(this.uniforms);
            program.setUniforms(this.uniforms, false); // don't reset texture unit
        }

        this.bind(program);

        // TODO: support element array mode
        this.gl.drawArrays(this.draw_mode, 0, this.vertex_count);
        VertexArrayObject.bind(null);

        if (this.uniforms) {
            program.restoreUniforms(this.uniforms);
        }

        return true;
    }

    // Bind buffers and vertex attributes to prepare for rendering
    bind(program) {
        // Bind VAO for this progam, or create one
        let vao = this.vaos.get(program);
        if (vao) {
            VertexArrayObject.bind(vao);
        }
        else {
            this.vaos.set(program, VertexArrayObject.create((force) => {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
                this.vertex_layout.enable(this.gl, program, force);
            }));
        }
    }

    destroy() {
        if (!this.valid) {
            return false;
        }
        this.valid = false;

        log.trace('VBOMesh.destroy: delete buffer' + (this.vertex_data ? ` of size ${this.vertex_data.byteLength}` : ''));

        this.gl.deleteBuffer(this.buffer);
        this.buffer = null;
        delete this.vertex_data;

        return true;
    }

}
