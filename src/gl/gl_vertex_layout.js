/* global GLVertexLayout */

import gl from './gl_constants'; // web workers don't have access to GL context, so import all GL constants

import log from 'loglevel';

// Describes a vertex layout that can be used with many different GL programs.
export default class GLVertexLayout {
    // Attribs are an array, in layout order, of: name, size, type, normalized
    // ex: { name: 'position', size: 3, type: gl.FLOAT, normalized: false }
    constructor (attribs) {
        this.attribs = attribs; // dictionary of attributes, specified as standard GL attrib options
        this.components = [];   // list of type and offset info about each attribute component
        this.index = {};        // linear buffer index of each attribute component, e.g. this.index.position.x

        // Calc vertex stride
        this.stride = 0;

        var count = 0;
        for (var attrib of this.attribs) {
            attrib.offset = this.stride;
            attrib.byte_size = attrib.size;
            var shift = 0;

            switch (attrib.type) {
                case gl.FLOAT:
                case gl.INT:
                case gl.UNSIGNED_INT:
                    attrib.byte_size *= 4;
                    shift = 2;
                    break;
                case gl.SHORT:
                case gl.UNSIGNED_SHORT:
                    attrib.byte_size *= 2;
                    shift = 1;
                    break;
            }

            // Force 4-byte alignment on attributes
            this.stride += attrib.byte_size;
            if (this.stride & 3) { // pad to multiple of 4 bytes
                this.stride += 4 - (this.stride & 3);
            }

            // Add info to list of attribute components
            // Used to build the vertex data, provides pointers and offsets into each typed array view
            // Each component is an array of:
            // [GL attrib type, pointer to typed array view, bits to shift right to determine buffer offset, additional buffer offset for the component]
            var offset_typed = attrib.offset >> shift;
            if (attrib.size > 1) {
                for (var a=0; a < attrib.size; a++) {
                    this.components.push([attrib.type, null, shift, offset_typed++]);
                }
            }
            else {
                this.components.push([attrib.type, null, shift, offset_typed]);
            }

            // Provide an index into the vertex data buffer for each attribute component
            this.index[attrib.name] = count;
            count += attrib.size;
        }
    }

    // Setup a vertex layout for a specific GL program
    // Assumes that the desired vertex buffer (VBO) is already bound
    // If a given program doesn't include all attributes, it can still use the vertex layout
    // to read those attribs that it does recognize, using the attrib offsets to skip others.
    enable (gl, program)
    {
        // Enable all attributes for this layout
        for (var a=0; a < this.attribs.length; a++) {
            var attrib = this.attribs[a];
            var location = program.attribute(attrib.name).location;

            if (location !== -1) {
                gl.enableVertexAttribArray(location);
                gl.vertexAttribPointer(location, attrib.size, attrib.type, attrib.normalized, this.stride, attrib.offset);
                GLVertexLayout.enabled_attribs[location] = program;
            }
        }

        // Disable any previously bound attributes that aren't for this layout
        var unused_attribs = [];
        for (location in GLVertexLayout.enabled_attribs) {
            if (GLVertexLayout.enabled_attribs[location] !== program) {
                gl.disableVertexAttribArray(location);
                unused_attribs.push(location);
            }
        }

        // Mark attribs as unused
        for (location in unused_attribs) {
            delete GLVertexLayout.enabled_attribs[location];
        }
    }

    createVertexData () {
        return new GLVertexData(this);
    }

}

// Track currently enabled attribs, by the program they are bound to
// Static class property to reflect global GL state
GLVertexLayout.enabled_attribs = {};


// An intermediary object that holds vertex data in typed arrays, according to a given vertex layout
// Used to construct a mesh/VBO for rendering
export class GLVertexData {

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
            log.info(`GLVertexData: expanded vertex block to ${this.block_size * this.block_num} vertices`);
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
        }
        return this;
    }

}

// Maps GL types to JS array types
GLVertexData.prototype.array_types = {
    [gl.FLOAT]: Float32Array,
    [gl.BYTE]: Int8Array,
    [gl.UNSIGNED_BYTE]: Uint8Array,
    [gl.INT]: Int32Array,
    [gl.UNSIGNED_INT]: Uint32Array,
    [gl.SHORT]: Int16Array,
    [gl.UNSIGNED_SHORT]: Uint16Array
};
