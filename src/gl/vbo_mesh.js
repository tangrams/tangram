// Manage rendering for primitives
import log from '../utils/log';
import ShaderProgram from './shader_program';
import VertexArrayObject from './vao';

// A single mesh/VBO, described by a vertex layout, that can be drawn with one or more programs
export default class VBOMesh  {

    constructor(gl, vertex_data, element_data, vertex_layout, options) {
        options = options || {};

        this.gl = gl;
        this.vertex_data = vertex_data; // typed array
        this.element_data = element_data; // typed array
        this.vertex_layout = vertex_layout;
        this.vertex_buffer = this.gl.createBuffer();
        this.draw_mode = options.draw_mode || this.gl.TRIANGLES;
        this.data_usage = options.data_usage || this.gl.STATIC_DRAW;
        this.vertices_per_geometry = 3; // TODO: support lines, strip, fan, etc.
        this.uniforms = options.uniforms;
        this.retain = options.retain || false; // whether to retain mesh data in CPU after uploading to GPU

        this.vertex_count = this.vertex_data.byteLength / this.vertex_layout.stride;
        this.vaos = new Map(); // map of VertexArrayObjects, keyed by program

        this.toggle_element_array = false;
        if (this.element_data){
            this.toggle_element_array = true;
            this.element_count = this.element_data.length;
            this.geometry_count = this.element_count / this.vertices_per_geometry;
            this.element_type = (this.element_data.constructor === Uint16Array) ? this.gl.UNSIGNED_SHORT: this.gl.UNSIGNED_INT;
            this.element_buffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.element_buffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.element_data, this.data_usage);
        }
        else {
            this.geometry_count = this.vertex_count / this.vertices_per_geometry;
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertex_data, this.data_usage);

        if (!this.retain) {
            delete this.vertex_data;
            delete this.element_data;
        }
        this.valid = true;
    }

    // Render, by default with currently bound program, or otherwise with optionally provided one
    render(options = {}) {
        if (!this.valid) {
            return false;
        }

        var program = options.program || ShaderProgram.current;
        program.use();

        if (this.uniforms) {
            program.saveUniforms(this.uniforms);
            program.setUniforms(this.uniforms, false); // don't reset texture unit
        }

        this.bind(program);

        if (this.toggle_element_array){
            this.gl.drawElements(this.draw_mode, this.element_count, this.element_type, 0);
        }
        else {
            this.gl.drawArrays(this.draw_mode, 0, this.vertex_count);
        }

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
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);
                if (this.toggle_element_array) {
                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.element_buffer);
                }
                this.vertex_layout.enable(this.gl, program, force);
            }));
        }
    }

    destroy() {
        if (!this.valid) {
            return false;
        }
        this.valid = false;

        for (let vao of this.vaos.values()) {
            VertexArrayObject.destroy(vao);
        }

        log('trace', 'VBOMesh.destroy: delete buffer' + (this.vertex_data ? ` of size ${this.vertex_data.byteLength}` : ''));

        this.gl.deleteBuffer(this.vertex_buffer);
        this.vertex_buffer = null;

        if (this.element_buffer) {
            this.gl.deleteBuffer(this.element_buffer);
            this.element_buffer = null;
        }

        delete this.vertex_data;
        delete this.element_data;

        return true;
    }

}
