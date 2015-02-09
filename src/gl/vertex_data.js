/* global VertexData */

import gl from './constants'; // web workers don't have access to GL context, so import all GL constants
import log from 'loglevel';

// An intermediary object that holds vertex data in typed arrays, according to a given vertex layout
// Used to construct a mesh/VBO for rendering
export default class VertexData {

    constructor (vertex_layout) {
        this.vertex_layout = vertex_layout;
        this.block_size = 50000;     // block size in which to allocate
        this.block_num = 1;         // initial # of allocated blocks
        this.buffer_offset = 0;      // byte offset into currently allocated buffer
        this.buffer = new ArrayBuffer(this.vertex_layout.stride * this.block_size * this.block_num);
        // this.components = [for (component of this.vertex_layout.components) [...component]]; // TODO: turn on array comprehension in traceur?
        this.components = [];
        for (var component of this.vertex_layout.components) {
            this.components.push([...component]);
        }
        this.vertex_count = 0;
        this.setBufferViews();
    }

    // (Re-)allocate typed views into the main buffer - only create the types we need for this layout
    setBufferViews () {
        this.buffer_views = {};
        for (var attrib of this.vertex_layout.attribs) {
            // Need view for this type?
            if (this.buffer_views[attrib.type] == null) {
                var array_type = this.array_types[attrib.type];
                this.buffer_views[attrib.type] = new array_type(this.buffer);
            }
        }

        // Update component buffer pointers
        for (var component of this.components) {
            component[1] = this.buffer_views[component[0]];
        }
    }

    // Check allocated buffer size, expand/realloc buffer if needed
    // checkBufferSize (num = 1) {
    //     if ((this.buffer_offset + (num * this.vertex_layout.stride)) > this.buffer.byteLength) {
    //         this.block_num += Math.ceil(num / this.block_size);
    checkBufferSize () {
        if ((this.buffer_offset + this.vertex_layout.stride) > this.buffer.byteLength) {
            this.block_num++;
            var new_block = new ArrayBuffer(this.vertex_layout.stride * this.block_size * this.block_num);
            var new_view = new Uint8Array(new_block);
            new_view.set(new Uint8Array(this.buffer)); // copy existing data to new buffer

            this.buffer = new_block;
            this.setBufferViews();
            log.info(`VertexData: expanded vertex block to ${this.block_size * this.block_num} vertices`);
        }
    }

    // Add a vertex, copied from a plain JS array of elements matching the order of the vertex layout.
    // Note: uses pre-calculated info about each attribute, including pointer to appropriate typed array
    // view and offset into it. This was the fastest method profiled so far for filling a mixed-type
    // vertex layout (though still slower than the previous method that only supported Float32Array attributes).
    addVertex (vertex) {
        this.checkBufferSize();
        var i=0;

        // ES6-style destructuring and iteration - cool but noticeably slower (at least w/traceur compiled code)
        // for (var [, buffer, shift, offset] of this.components) {
        //     buffer[(this.buffer_offset >> shift) + offset] = vertex[i++];

        var clen = this.components.length;
        for (var c=0; c < clen; c++) {
            var component = this.components[c];
            component[1][(this.buffer_offset >> component[2]) + component[3]] = vertex[i++];
        }

        this.buffer_offset += this.vertex_layout.stride;
        this.vertex_count++;
    }

    // Finalize vertex buffer for use in constructing a mesh
    end () {
        // Clip the allocated block to free unused memory
        if (this.buffer_offset < this.buffer.byteLength) {
            var new_block = new ArrayBuffer(this.buffer_offset);
            var new_view = new Uint8Array(new_block);
            new_view.set(new Uint8Array(this.buffer, 0, this.buffer_offset));
            this.buffer = new_block;
            this.buffer_views = null;
            this.components = null;
        }
        return this;
    }

}

// Maps GL types to JS array types
VertexData.prototype.array_types = {
    [gl.FLOAT]: Float32Array,
    [gl.BYTE]: Int8Array,
    [gl.UNSIGNED_BYTE]: Uint8Array,
    [gl.INT]: Int32Array,
    [gl.UNSIGNED_INT]: Uint32Array,
    [gl.SHORT]: Int16Array,
    [gl.UNSIGNED_SHORT]: Uint16Array
};
