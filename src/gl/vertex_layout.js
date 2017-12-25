import gl from './constants'; // web workers don't have access to GL context, so import all GL constants
import VertexData from './vertex_data';
import hashString from '../utils/hash';

// Describes a vertex layout that can be used with many different GL programs.
export default class VertexLayout {
    // Attribs are an array, in layout order, of: name, size, type, normalized
    // ex: { name: 'position', size: 3, type: gl.FLOAT, normalized: false }
    constructor (attribs) {
        this.attribs = attribs; // array of attributes, specified as standard GL attrib options
        this.dynamic_attribs = this.attribs.filter(x => !x.static); // attributes with per-vertex values, used to build VBOs
        this.components = [];   // list of type and offset info about each attribute component
        this.index = {};        // JS buffer index of each attribute component, e.g. this.index.position
        this.offset = {};       // VBO buffer byte offset of each attribute component, e.g. this.offset.color
        this.stride = 0;        // byte stride of a single vertex

        let index = 0, count = 0;
        for (let a=0; a < this.attribs.length; a++) {
            let attrib = this.attribs[a];
            // Dynamic attribute
            if (attrib.static == null) {
                attrib.offset = this.stride;
                attrib.byte_size = attrib.size;
                let shift = 0;

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
                if (attrib.byte_size & 3) { // pad to multiple of 4 bytes
                    attrib.byte_size += 4 - (attrib.byte_size & 3);
                }
                this.stride += attrib.byte_size;

                // Add info to list of attribute components (e.g. float is 1 component, vec3 is 3 separate components)
                // Used to map plain JS array to typed arrays
                let offset_typed = attrib.offset >> shift;
                for (let s=0; s < attrib.size; s++) {
                    this.components.push({
                        type: attrib.type,
                        shift,
                        offset: offset_typed++,
                        index: count++
                    });
                }

                // Provide an index into the vertex data buffer for each attribute by name
                this.index[attrib.name] = index;
                index += attrib.size;

                // Store byte offset of each attribute by name
                this.offset[attrib.name] = attrib.offset;
            }
            // Static attribute
            else {
                attrib.static = Array.isArray(attrib.static) ? attrib.static : [attrib.static]; // convert single value to array
                attrib.method = `vertexAttrib${attrib.static.length}fv`;
            }
        }
    }

    // Setup a vertex layout for a specific GL program
    // Assumes that the desired vertex buffer (VBO) is already bound
    // If a given program doesn't include all attributes, it can still use the vertex layout
    // to read those attribs that it does recognize, using the attrib offsets to skip others.
    enable (gl, program, force) {
        let attrib, location;

        // Enable all attributes for this layout
        for (let a=0; a < this.attribs.length; a++) {
            attrib = this.attribs[a];
            location = program.attribute(attrib.name).location;

            if (location !== -1) {
                // Dynamic attribute
                if (attrib.static == null) {
                    if (!VertexLayout.enabled_attribs[location] || force) {
                        gl.enableVertexAttribArray(location);
                    }
                    gl.vertexAttribPointer(location, attrib.size, attrib.type, attrib.normalized, this.stride, attrib.offset);
                    VertexLayout.enabled_attribs[location] = program;
                }
                // Static attribute
                else {
                    if (gl[attrib.method] instanceof Function) {
                        // N.B.: Safari appears to require an explicit array enable to set vertex attribute as "active"
                        // (the static attribute value method does not work without it). So the attribute is temporarily
                        // enabled as an array, then disabled.
                        gl.enableVertexAttribArray(location);
                        gl[attrib.method](location, attrib.static);
                        gl.disableVertexAttribArray(location);
                        delete VertexLayout.enabled_attribs[location];
                    }
                }
            }
        }

        // Disable any previously bound attributes that aren't for this layout
        for (location in VertexLayout.enabled_attribs) {
            this.disableUnusedAttribute(gl, location, program);
        }
    }

    // Disable an attribute if it was not enabled for the specified program
    // NOTE: this was moved out of the inner loop in enable() to assist w/VM optimization
    disableUnusedAttribute (gl, location, program) {
        if (VertexLayout.enabled_attribs[location] !== program) {
            gl.disableVertexAttribArray(location);
            delete VertexLayout.enabled_attribs[location];
        }
    }

    createVertexData () {
        return new VertexData(this);
    }

    // Lazily create the add vertex function
    getAddVertexFunction () {
        if (this.addVertex == null) {
            this.createAddVertexFunction();
        }
        return this.addVertex;
    }

    // Dynamically compile a function to add a plain JS vertex array to this layout's typed VBO arrays
    createAddVertexFunction () {
        let key = hashString(JSON.stringify(this.attribs));
        if (VertexLayout.add_vertex_funcs[key] == null) {
            // `t` = current typed array to write to
            // `o` = current offset into VBO, in current type size (e.g. divide 2 for shorts, divide by 4 for floats, etc.)
            // `v` = plain JS array containing vertex data
            // `vs` = typed arrays (one per GL type needed for this vertex layout)
            // `off` = current offset into VBO, in bytes
            let src = [`var t, o;`];

            // Sort by array type to reduce redundant array look-up and offset calculation
            let last_type;
            let components = [...this.components];
            components.sort((a, b) => (a.type !== b.type) ? (a.type - b.type) : (a.index - b.index));

            for (let c=0; c < components.length; c++) {
                let component = components[c];

                if (last_type !== component.type) {
                    src.push(`t = vs[${component.type}];`);
                    src.push(`o = off${component.shift ? ' >> ' + component.shift : ''};`);
                    last_type = component.type;
                }

                src.push(`t[o + ${component.offset}] = v[${component.index}];`);
            }

            src = src.join('\n');
            let func = new Function('v', 'vs', 'off', src); // jshint ignore:line
            VertexLayout.add_vertex_funcs[key] = func;
        }

        this.addVertex = VertexLayout.add_vertex_funcs[key];
    }

}

// Track currently enabled attribs, by the program they are bound to
// Static class property to reflect global GL state
VertexLayout.enabled_attribs = {};

// Functions to add plain JS vertex array to typed VBO arrays
VertexLayout.add_vertex_funcs = {}; // keyed by unique set of attributes
