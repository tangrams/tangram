// try {
//     var gl = WebGLRenderingContext;
// }
// catch(e) {
    // TODO: copy just the values we need here (types)
    var gl = require('./gl_constants.js'); // for accessing GL constants
// }

// Describes a vertex layout that can be used with many different GL programs.
// If a given program doesn't include all attributes, it can still use the vertex layout
// to read those attribs that it does recognize, using the attrib offsets to skip others.
// Attribs are an array, in layout order, of: name, size, type, normalized
// ex: { name: 'position', size: 3, type: gl.FLOAT, normalized: false }
export default function GLVertexLayout (attribs)
{
    this.attribs = attribs;
    this.repeating_attribs = {};

    // Calc vertex stride
    this.stride = 0;
    this.stride_padded = 0;
    for (var a=0; a < this.attribs.length; a++) {
        var attrib = this.attribs[a];

        attrib.byte_size = attrib.size;

        switch (attrib.type) {
            case gl.FLOAT:
            case gl.INT:
            case gl.UNSIGNED_INT:
                attrib.byte_size *= 4;
                break;
            case gl.SHORT:
            case gl.UNSIGNED_SHORT:
                attrib.byte_size *= 2;
                break;
        }

        attrib.offset = this.stride;
        this.stride += attrib.byte_size;

        // Force 4-byte padding
        // TODO: make this an option?
        attrib.offset_padded = this.stride_padded;
        this.stride_padded += attrib.byte_size;
        if (this.stride_padded & 3) { // pad to multiple of 4 bytes
            this.stride_padded += 4 - (this.stride_padded & 3);
        }
    }
}

// Track currently enabled attribs, by the program they are bound to
GLVertexLayout.enabled_attribs = {};

// Setup a vertex layout for a specific GL program
// Assumes that the desired vertex buffer (VBO) is already bound
GLVertexLayout.prototype.enable = function (gl, gl_program)
{
    // Enable all attributes for this layout
    for (var a=0; a < this.attribs.length; a++) {
        var attrib = this.attribs[a];
        var location = gl_program.attribute(attrib.name).location;

        if (location != -1) {
            gl.enableVertexAttribArray(location);
            // gl.vertexAttribPointer(location, attrib.size, attrib.type, attrib.normalized, this.stride, attrib.offset);
            gl.vertexAttribPointer(location, attrib.size, attrib.type, attrib.normalized, this.stride_padded, attrib.offset_padded);
            GLVertexLayout.enabled_attribs[location] = gl_program;
        }
    }

    // Disable any previously bound attributes that aren't for this layout
    var unused_attribs = [];
    for (location in GLVertexLayout.enabled_attribs) {
        if (GLVertexLayout.enabled_attribs[location] != gl_program) {
            gl.disableVertexAttribArray(location);
            unused_attribs.push(location);
        }
    }

    // Mark attribs as unused
    for (location in unused_attribs) {
        delete GLVertexLayout.enabled_attribs[location];
    }
};



// Typed array packing

var array_types = GLVertexLayout.prototype.attrib_array_types = {};
array_types[gl.FLOAT] = Float32Array;
array_types[gl.BYTE] = Int8Array;
array_types[gl.UNSIGNED_BYTE] = Uint8Array;
array_types[gl.INT] = Int32Array;
array_types[gl.UNSIGNED_INT] = Uint32Array;
array_types[gl.SHORT] = Int16Array;
array_types[gl.UNSIGNED_SHORT] = Uint16Array;

// Start a new vertex buffer for this layout
GLVertexLayout.prototype.beginBuffer = function () {
    this.block_size = 50000;     // block size in which to allocate
    this.block_num = 1;         // initial # of allocated blocks
    this.buffer_offset = 0;      // byte offset into currently allocated buffer
    this.buffer = new ArrayBuffer(this.stride * this.block_size * this.block_num);
    this.vertex_count = 0;
    this.repeating_attribs = {};

    this.setBufferViews();
};

// Typed views into the main buffer - only create the types we need for this layout
GLVertexLayout.prototype.setBufferViews = function () {
    this.buffer_views = {};
    for (var a=0; a < this.attribs.length; a++) {
        var attrib = this.attribs[a];

        // Need view for this type?
        if (this.buffer_views[attrib.type] == null) {
            var array_type = this.attrib_array_types[attrib.type];
            this.buffer_views[attrib.type] = new array_type(this.buffer);
        }
    }

    this.repeating_attribs = {};
};

// Handle clipping of allocated block to free unused memory
GLVertexLayout.prototype.endBuffer = function () {
    if (this.buffer_offset < this.buffer.byteLength) {
        var new_block = new ArrayBuffer(this.buffer_offset);
        var new_view = new Uint8Array(new_block);
        new_view.set(new Uint8Array(this.buffer, 0, this.buffer_offset));
        this.buffer = new_block;
    }
};

// Check allocated buffer size, expand/realloc buffer if needed
GLVertexLayout.prototype.checkBufferSize = function (num) {
    num = num || 1;
    // console.log([this.buffer_offset, this.stride, this.buffer.byteLength].join(', '));
    if ((this.buffer_offset + (num * this.stride_padded)) > this.buffer.byteLength) {

        // this.block_num++;
        this.block_num += Math.ceil(num / this.block_size);

        var new_block = new ArrayBuffer(this.stride_padded * this.block_size * this.block_num);
        var new_view = new Uint8Array(new_block);

        // don't copy old buffer if this is the first vertex add
        // if (this.vertex_count > 0) {
            new_view.set(new Uint8Array(this.buffer));
        // }

        this.buffer = new_block;
        this.setBufferViews();

        // console.log("expanded vertex block from " + (this.block_size * (this.block_num-1)) + " to " + (this.block_size * this.block_num) + " vertices");
        console.log("expanded vertex block to " + (this.block_size * this.block_num) + " vertices");
    }
};

// TODO: constant/repeating attribs
GLVertexLayout.prototype.setRepeatingAttributes = function (attribs) {
    for (var name in attribs) {
        // if (!this.attribs[name]) {
        //     continue;
        // }
        this.repeating_attribs[name] = attribs[name];
    }
};

var first = true;
GLVertexLayout.prototype.addVertex = function (vertices) {
    // TODO: still support single vertex

    this.checkBufferSize(vertices.length);

    var vlen = vertices.length;
    for (var v=0; v < vlen; v++) {
    var obj = vertices[v];

    // var view;
    var len = this.attribs.length;
    // var arg = 0;
    for (var a=0; a < len; a++) {
        var attrib = this.attribs[a];
        var obj_attrib = obj[attrib.name] || this.repeating_attribs[attrib.name];
        // console.log(obj_attrib);

        if (obj_attrib) {
            var array_type = this.attrib_array_types[attrib.type];
            // view = new array_type(this.buffer, this.buffer_offset, attrib.size);
            // view.set(obj_attrib);

            var view = this.buffer_views[attrib.type];
            // var off = this.buffer_offset / array_type.BYTES_PER_ELEMENT;
            var off = (this.buffer_offset + attrib.offset_padded) / array_type.BYTES_PER_ELEMENT;

            if (attrib.size > 1) {
                for (var e=0; e < Math.min(attrib.size, obj_attrib.length); e++) {
                    view[off++] = obj_attrib[e];
                }
            }
            else {
                view[off++] = obj_attrib;
            }

            if (first) {
                console.log(JSON.stringify(attrib));
                console.log(JSON.stringify(obj_attrib));
            }

            // switch (attrib.type) {
            //     case gl.FLOAT:
            //     // case gl.INT:
            //     // case gl.UNSIGNED_INT:
            //         view = new Float32Array(this.buffer, this.buffer_offset, attrib.size);

            //         // for (var e=0; e < attrib.size; e++, arg++) {
            //         //     view[e] = obj_attrib[e]; //arguments[arg];
            //         // }
            //         view.set(obj_attrib);
            //         break;
            //     // case gl.UNSIGNED_BYTE:
            //     //     view =
            //     // case gl.SHORT:
            //     // case gl.UNSIGNED_SHORT:
            //     //     attrib.byte_size *= 2;
            //     //     break;
            // }
        }
        // this.buffer_offset += attrib.byte_size;
    }
    this.buffer_offset += this.stride_padded;
    first = false;

    }

    this.vertex_count += vlen;
};
