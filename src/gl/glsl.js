var GLSL = {};
export default GLSL;

/**
    Parse uniforms from a JS object, infers types and returns an array of objects with the
    necessary information to set uniform values on a GL program. Each object in the returned
    array has the form:
    { type, method, name, value }

    type: the GL uniform type, such as 'vec3', 'float', etc.
    method: the GL uniform setter method to use, such as '1f', '3fv', etc.
    name: the fully qualified name of the GL uniform location, e.g. 'array[0].field', etc.
    value: the value to be passed to the GL uniform setter for that type, e.g. [1, 2, 3] for a vec3

    Textures have special behavior: uniforms with string values are treated as textures, and
    the string is used as a unique texture 'key' to be interpreted by the caller (which is responsible
    for actually setting the uniforms). For example, this could be used as a key into a dictionary of
    known texture names, or it could simply be used as a URL to dynamically load the texture from.
*/
GLSL.parseUniforms = function (uniforms = {}) {
    var parsed = [];

    for (const [name, uniform] of Object.entries(uniforms)) {
        // Single float
        if (typeof uniform === 'number') {
            parsed.push({
                type: 'float',
                method: '1f',
                name,
                value: uniform,
                path: [name]
            });
        }
        // Array: vector, array of floats, array of textures
        else if (Array.isArray(uniform)) {
            // Numeric values
            if (typeof uniform[0] === 'number') {
                // float vectors (vec2, vec3, vec4)
                if (uniform.length >= 2 && uniform.length <= 4) {
                    parsed.push({
                        type: 'vec' + uniform.length,
                        method: uniform.length + 'fv',
                        name,
                        value: uniform,
                        path: [name]
                    });
                }
                // float array
                else if (uniform.length > 4) {
                    parsed.push({
                        type: 'float[]',
                        method: '1fv',
                        name: name + '[0]',
                        value: uniform,
                        path: [name]
                    });
                }
                // TODO: assume matrix for (typeof == Float32Array && length == 16)?
            }
            // Array of textures
            else if (typeof uniform[0] === 'string') {
                for (let u = 0; u < uniform.length; u++) {
                    parsed.push({
                        type: 'sampler2D',
                        method: '1i',
                        name: name + '[' + u + ']',
                        value: uniform[u],
                        path: [name, u]
                    });
                }
            }
            // Array of arrays - but only arrays of vectors are allowed in this case
            else if (Array.isArray(uniform[0]) && typeof uniform[0][0] === 'number') {
                // float vectors (vec2, vec3, vec4)
                if (uniform[0].length >= 2 && uniform[0].length <= 4) {
                    // Set each vector in the array
                    for (let u = 0; u < uniform.length; u++) {
                        parsed.push({
                            type: 'vec' + uniform[0].length,
                            method: uniform[0].length + 'fv',
                            name: name + '[' + u + ']',
                            value: uniform[u],
                            path: [name, u]
                        });
                    }
                }
            }
            // TODO: else warning
        }
        // Boolean
        else if (typeof uniform === 'boolean') {
            parsed.push({
                type: 'bool',
                method: '1i',
                name,
                value: uniform,
                path: [name]
            });
        }
        // Texture
        else if (typeof uniform === 'string') {
            parsed.push({
                type: 'sampler2D',
                method: '1i',
                name,
                value: uniform,
                path: [name]
            });
        }
    }

    return parsed;
};

/**
    Generate a GLSL variable definition from a JS object
*/
GLSL.defineVariable = function (name, value) {
    var type, array;

    // Single float
    if (typeof value === 'number') {
        type = 'float';
    }
    // Multiple floats - vector or array
    else if (Array.isArray(value)) {
        // Numeric values
        if (typeof value[0] === 'number') {
            // float vectors (vec2, vec3, vec4)
            if (value.length >= 2 && value.length <= 4) {
                type = 'vec' + value.length;
            }
            // float array
            else { //if (value.length > 4) {
                type = 'float';
                array = value.length;
            }
            // TODO: assume matrix for (typeof == Float32Array && length == 16)?
        }
        // Array of textures
        else if (typeof value[0] === 'string') {
            type = 'sampler2D';
            array = value.length;
        }
        // Array of arrays - but only arrays of vectors are allowed in this case
        else if (Array.isArray(value[0]) && typeof value[0][0] === 'number') {
            // float vectors (vec2, vec3, vec4)
            if (value[0].length >= 2 && value[0].length <= 4) {
                type = 'vec' + value[0].length;
                array = value.length;
            }
        }
    }
    // Boolean
    else if (typeof value === 'boolean') {
        type = 'bool';
    }
    // Texture
    else if (typeof value === 'string') {
        type = 'sampler2D';
    }
    else {
        return; // no valid type found
    }

    // Construct variable definition
    var variable = '';
    variable += `${type} ${name}`;
    if (array) {
        variable += `[${array}]`;
    }
    variable += ';\n';

    return variable;
};

/**
    Generate a GLSL uniform definition from a JS object
*/
GLSL.defineUniform = function (name, value) {
    var def = GLSL.defineVariable(name, value);
    if (!def) {
        return;
    }
    return 'uniform ' + def;
};

/**
    Expand a single value or 2-element array into a 3-element array, with the last ( z )
    coordinate defaulting to 1 (with option to specify). Also runs parseFloat to try to maintain
    data integrity. Returns null if input couldn't be parsed.
*/
GLSL.expandVec3 = function (v, z = 1) {
    let x;
    if (Array.isArray(v)) {
        if (v.length === 2) {
            x = [...v, z].map(parseFloat);
        }
        else {
            return v;
        }
    }
    else {
        x = [v, v, v].map(parseFloat);
    }

    if (x && x.every(n => typeof n === 'number' && !isNaN(n))) {
        return x;
    }
};

/**
    Expand a single value or 3-element array into a 4-element array, with the last (e.g. w or a)
    coordinate defaulting to 1 (with option to specify). Also runs parseFloat to try to maintain
    data integrity. Returns null if input couldn't be parsed.
*/
GLSL.expandVec4 = function (v, w = 1) {
    let x;
    if (Array.isArray(v)) {
        if (v.length === 3) {
            x = [...v, w].map(parseFloat);
        }
        else {
            return v;
        }
    }
    else {
        x = [v, v, v, w].map(parseFloat);
    }

    if (x && x.every(n => typeof n === 'number' && !isNaN(n))) {
        return x;
    }
};


