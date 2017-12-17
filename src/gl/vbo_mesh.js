// Manage rendering for primitives
import ShaderProgram from './shader_program';
import VertexArrayObject from './vao';
import Texture from './texture';

// A single mesh/VBO, described by a vertex layout, that can be drawn with one or more programs
export default class VBOMesh  {

    constructor(gl, vertex_data, element_data, vertex_layout, options) {
        options = options || {};

        this.gl = gl;
        this.vertex_data = vertex_data; // typed array
        this.element_data = element_data; // typed array
        this.vertex_layout = vertex_layout;
        this.vertex_buffer = this.gl.createBuffer();
        this.buffer_size = this.vertex_data.byteLength;
        this.draw_mode = options.draw_mode || this.gl.TRIANGLES;
        this.data_usage = options.data_usage || this.gl.STATIC_DRAW;
        this.vertices_per_geometry = 3; // TODO: support lines, strip, fan, etc.
        this.uniforms = options.uniforms;
        this.textures = options.textures; // any textures owned by this mesh
        this.retain = options.retain || false; // whether to retain mesh data in CPU after uploading to GPU
        this.created_at = +new Date();
        this.fade_in_time = options.fade_in_time || 0; // optional time to fade in mesh

        this.vertex_count = this.vertex_data.byteLength / this.vertex_layout.stride;
        this.element_count = 0;
        this.vaos = {}; // map of VertexArrayObjects, keyed by program

        this.toggle_element_array = false;
        if (this.element_data) {
            this.toggle_element_array = true;
            this.element_count = this.element_data.length;
            this.geometry_count = this.element_count / this.vertices_per_geometry;
            this.element_type = (this.element_data.constructor === Uint16Array) ? this.gl.UNSIGNED_SHORT: this.gl.UNSIGNED_INT;
            this.element_buffer = this.gl.createBuffer();
            this.buffer_size += this.element_data.byteLength;
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.element_buffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.element_data, this.data_usage);
        }
        else {
            this.geometry_count = this.vertex_count / this.vertices_per_geometry;
        }

        this.upload();

        if (!this.retain) {
            delete this.vertex_data;
            delete this.element_data;
        }
        this.valid = true;
    }

    // Render, by default with currently bound program, or otherwise with optionally provided one
    // Returns true if mesh requests a render on next frame (e.g. for fade animations)
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

        let visible_time = (+new Date() - this.created_at) / 1000;
        program.uniform('1f', 'u_visible_time', visible_time);

        this.bind(program);

        if (this.toggle_element_array){
            this.gl.drawElements(this.draw_mode, this.element_count, this.element_type, 0);
        }
        else {
            this.gl.drawArrays(this.draw_mode, 0, this.vertex_count);
        }

        VertexArrayObject.bind(this.gl, null);

        if (this.uniforms) {
            program.restoreUniforms(this.uniforms);
        }

        // Request next render if mesh is fading in
        return (visible_time < this.fade_in_time);
    }

    // Bind buffers and vertex attributes to prepare for rendering
    bind(program) {
        // Bind VAO for this progam, or create one
        let vao = this.vaos[program.id];
        if (vao) {
            VertexArrayObject.bind(this.gl, vao);
        }
        else {
            this.vaos[program.id] = VertexArrayObject.create(this.gl, (force) => {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);
                if (this.toggle_element_array) {
                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.element_buffer);
                }
                this.vertex_layout.enable(this.gl, program, force);
            });
        }
    }

    // Upload buffer data to GPU
    upload() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertex_data, this.data_usage);
    }

    destroy() {
        if (!this.valid) {
            return false;
        }
        this.valid = false;

        for (let v in this.vaos) {
            VertexArrayObject.destroy(this.gl, this.vaos[v]);
        }

        this.gl.deleteBuffer(this.vertex_buffer);
        this.vertex_buffer = null;

        if (this.element_buffer) {
            this.gl.deleteBuffer(this.element_buffer);
            this.element_buffer = null;
        }

        delete this.vertex_data;
        delete this.element_data;

        if (this.textures) {
            this.textures.forEach(t => Texture.release(t));
        }

        return true;
    }

}
