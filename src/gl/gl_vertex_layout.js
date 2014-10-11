/* global GLVertexLayout */

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
        // TODO: this is experimental, currently unused but interesting for debugging, may be removed
        if (attrib.size >= 3) {
            this.index[attrib.name] = {};

            this.index[attrib.name].x = count++;
            this.index[attrib.name].y = count++;
            this.index[attrib.name].z = count++;

            this.index[attrib.name].r = this.index[attrib.name].x;
            this.index[attrib.name].g = this.index[attrib.name].y;
            this.index[attrib.name].b = this.index[attrib.name].z;
            this.index[attrib.name].a = this.index[attrib.name].w;

            if (attrib.size >= 4) {
                this.index[attrib.name].w = count++;
                this.index[attrib.name].a = this.index[attrib.name].w;
            }
        }
        else if (attrib.size == 2) {
            this.index[attrib.name] = {};

            this.index[attrib.name].x = count++;
            this.index[attrib.name].y = count++;

            this.index[attrib.name].s = this.index[attrib.name].x;
            this.index[attrib.name].t = this.index[attrib.name].y;
        }
        else {
            this.index[attrib.name] = count++;
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

        if (location !== -1) {
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, attrib.size, attrib.type, attrib.normalized, this.stride, attrib.offset);
            GLVertexLayout.enabled_attribs[location] = gl_program;
        }
    }

    // Disable any previously bound attributes that aren't for this layout
    var unused_attribs = [];
    for (location in GLVertexLayout.enabled_attribs) {
        if (GLVertexLayout.enabled_attribs[location] !== gl_program) {
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

// TODO: each vertex data buffer should be a separate object, not internal to the layout instance

// Start a new vertex buffer for this layout
GLVertexLayout.prototype.beginBuffer = function () {
    this.block_size = 50000;     // block size in which to allocate
    this.block_num = 1;         // initial # of allocated blocks
    this.buffer_offset = 0;      // byte offset into currently allocated buffer
    this.buffer = new ArrayBuffer(this.stride * this.block_size * this.block_num);
    this.vertex_count = 0;

    this.setBufferViews();
};

GLVertexLayout.prototype.attrib_array_types = {
    [gl.FLOAT]: Float32Array,
    [gl.BYTE]: Int8Array,
    [gl.UNSIGNED_BYTE]: Uint8Array,
    [gl.INT]: Int32Array,
    [gl.UNSIGNED_INT]: Uint32Array,
    [gl.SHORT]: Int16Array,
    [gl.UNSIGNED_SHORT]: Uint16Array
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

    // Update component buffer pointers
    for (var component of this.components) {
        component[1] = this.buffer_views[component[0]];
    }
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
    num = 1; // num || 1;
    if ((this.buffer_offset + (num * this.stride)) > this.buffer.byteLength) {

        // this.block_num++;
        this.block_num += Math.ceil(num / this.block_size);

        var new_block = new ArrayBuffer(this.stride * this.block_size * this.block_num);
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

GLVertexLayout.prototype.addVertex = function (vertex) {
    this.checkBufferSize();

    for (var attrib of this.attribs) {
        var vertex_attrib = vertex[attrib.name];

        if (vertex_attrib) {
            var array_type = this.attrib_array_types[attrib.type];
            var view = this.buffer_views[attrib.type];
            var offset = (this.buffer_offset + attrib.offset) / array_type.BYTES_PER_ELEMENT;

            if (attrib.size > 1) {
                for (var e=0; e < Math.min(attrib.size, vertex_attrib.length); e++) {
                    view[offset++] = vertex_attrib[e];
                }
            }
            else {
                view[offset++] = vertex_attrib;
            }
        }
    }
    this.buffer_offset += this.stride;
    this.vertex_count++;
};

GLVertexLayout.prototype.addVertexFixed = function (vertex) {
    this.checkBufferSize();

    var floats = this.buffer_views[gl.FLOAT];
    var ubytes = this.buffer_views[gl.UNSIGNED_BYTE];

    // pos.x, pos.y, pos.z
    floats[this.buffer_offset >> 2] = vertex[0];
    floats[(this.buffer_offset >> 2) + 1] = vertex[1];
    floats[(this.buffer_offset >> 2) + 2] = vertex[2];
    this.buffer_offset += 3 << 2;

    // normal.x, normal.y, normal.z
    floats[(this.buffer_offset >> 2)] = vertex[3];
    floats[(this.buffer_offset >> 2) + 1] = vertex[4];
    floats[(this.buffer_offset >> 2) + 2] = vertex[5];
    this.buffer_offset += 3 << 2;

    // color.r, color.g, color.b, color.a
    ubytes[this.buffer_offset] = vertex[6];
    ubytes[this.buffer_offset + 1] = vertex[7];
    ubytes[this.buffer_offset + 2] = vertex[8];
    ubytes[this.buffer_offset + 3] = vertex[9];
    this.buffer_offset += 4;

    // selection.r, selection.g, seiection.b, selection.a
    ubytes[this.buffer_offset] = vertex[10];
    ubytes[this.buffer_offset + 1] = vertex[11];
    ubytes[this.buffer_offset + 2] = vertex[12];
    ubytes[this.buffer_offset + 3] = vertex[13];
    this.buffer_offset += 4;

    // layer
    floats[this.buffer_offset >> 2] = vertex[14];
    this.buffer_offset += 1 << 2;

    this.vertex_count++;
};

// TODO: auto-gen this based on layout, this is just a test
// pos.x, pos.y, pos.z, normal.x, normal.y, normal.z, color.r, color.g, color.b, color.a, selection.r, selection.g, seiection.b, selection.a, layer
GLVertexLayout.prototype.addVertexFixed2 = function (vertex) {
    this.checkBufferSize();

    var floats = this.buffer_views[gl.FLOAT];
    var ubytes = this.buffer_views[gl.UNSIGNED_BYTE];

    var offset_map = [
        [2, 0], [2, 1], [2, 2],
        [2, 3], [2, 4], [2, 5],
        [0, 24], [0, 25], [0, 26], [0, 27],
        [0, 28], [0, 29], [0, 30], [0, 31],
        [2, 8]
    ];

    var buffer_map = [
        floats, floats, floats,
        floats, floats, floats,
        ubytes, ubytes, ubytes, ubytes,
        ubytes, ubytes, ubytes, ubytes,
        floats
    ];

    for (var b=0; b < buffer_map.length; b++) {
        buffer_map[b][(this.buffer_offset >> offset_map[b][0]) + offset_map[b][1]] = vertex[b];
        buffer_map[b][(this.buffer_offset >> offset_map[b][0]) + offset_map[b][1]] = vertex[b];
    }

    this.buffer_offset += this.stride;
    this.vertex_count++;
};

GLVertexLayout.prototype.addVertexFixed3 = function (vertex) {
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

    this.buffer_offset += this.stride;
    this.vertex_count++;
};
