import gl from './constants'; // web workers don't have access to GL context, so import all GL constants
import {log} from '../utils/utils';

// Maps GL types to JS array types
let array_types = {
    [gl.FLOAT]: Float32Array,
    [gl.BYTE]: Int8Array,
    [gl.UNSIGNED_BYTE]: Uint8Array,
    [gl.INT]: Int32Array,
    [gl.UNSIGNED_INT]: Uint32Array,
    [gl.SHORT]: Int16Array,
    [gl.UNSIGNED_SHORT]: Uint16Array
};

// An intermediary object that holds vertex data in typed arrays, according to a given vertex layout
// Used to construct a mesh/VBO for rendering
export default class VertexData {

    constructor (vertex_layout, { prealloc } = {}) {
        this.vertex_layout = vertex_layout;

        if (VertexData.array_pool.length > 0) {
            this.buffer = VertexData.array_pool.pop();
            this.buffer_length = this.buffer.byteLength;
            this.buffer_size = Math.floor(this.buffer_length / this.vertex_layout.stride);
            log('trace', `VertexData: reused buffer of bytes ${this.buffer_length}, ${this.buffer_size} vertices`);
        }
        else {
            this.buffer_size = prealloc || 500; // # of vertices to allocate
            this.buffer_length = this.vertex_layout.stride * this.buffer_size;
            this.buffer = new Uint8Array(this.buffer_length);
        }
        this.buffer_offset = 0;             // byte offset into currently allocated buffer

        this.components = [];
        for (var component of this.vertex_layout.components) {
            this.components.push([...component]);
        }
        this.vertex_count = 0;
        this.realloc_count = 0;
        this.setBufferViews();
    }

    // (Re-)allocate typed views into the main buffer - only create the types we need for this layout
    setBufferViews () {
        this.buffer_views = {};
        this.buffer_views[gl.UNSIGNED_BYTE] = this.buffer;
        for (var attrib of this.vertex_layout.attribs) {
            // Need view for this type?
            if (this.buffer_views[attrib.type] == null) {
                var array_type = array_types[attrib.type];
                this.buffer_views[attrib.type] = new array_type(this.buffer.buffer);
            }
        }

        // Update component buffer pointers
        for (var component of this.components) {
            component[1] = this.buffer_views[component[0]];
        }
    }

    // Check allocated buffer size, expand/realloc buffer if needed
    checkBufferSize () {
        if ((this.buffer_offset + this.vertex_layout.stride) > this.buffer_length) {
            this.buffer_size = Math.floor(this.buffer_size * 1.5);
            this.buffer_size -= this.buffer_size % 4;
            this.buffer_length = this.vertex_layout.stride * this.buffer_size;
            var new_view = new Uint8Array(this.buffer_length);
            new_view.set(this.buffer); // copy existing data to new buffer
            VertexData.array_pool.push(this.buffer); // save previous buffer for use by next tile
            this.buffer = new_view;
            this.setBufferViews();
            this.realloc_count++;
            // log.info(`VertexData: expanded vertex block to ${this.buffer_size} vertices`);
        }
    }

    // Add a vertex, copied from a plain JS array of elements matching the order of the vertex layout.
    // Note: uses pre-calculated info about each attribute, including pointer to appropriate typed array
    // view and offset into it. This was the fastest method profiled so far for filling a mixed-type
    // vertex layout (though still slower than the previous method that only supported Float32Array attributes).
    addVertex (vertex) {
        this.checkBufferSize();
        var i=0;

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
        // Clip the buffer to size used for this VBO
        this.buffer = this.buffer.subarray(0, this.buffer_offset);
        log('trace', `VertexData: ${this.buffer_size} vertices total, realloc count ${this.realloc_count}`);
        return this;
    }

}

VertexData.array_pool = []; // pool of currently available (previously used) buffers (uint8)
