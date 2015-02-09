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
GLSL.parseUniforms = function (uniforms, prefix = null) {
    var parsed = [];

    for (var name in uniforms) {
        var uniform = uniforms[name];
        var u;

        if (prefix) {
            name = prefix + '.' + name;
        }

        // Single float
        if (typeof uniform === 'number') {
            parsed.push({
                type: 'float',
                method: '1f',
                name, value:
                uniform
            });
        }
        // Array: vector, array of floats, array of textures, or array of structs
        else if (Array.isArray(uniform)) {
            // Numeric values
            if (typeof uniform[0] === 'number') {
                // float vectors (vec2, vec3, vec4)
                if (uniform.length >= 2 && uniform.length <= 4) {
                    parsed.push({
                        type: 'vec' + uniform.length,
                        method: uniform.length + 'fv',
                        name,
                        value: uniform
                    });
                }
                // float array
                else if (uniform.length > 4) {
                    parsed.push({
                        type: 'float[]',
                        method: '1fv',
                        name: name + '[0]',
                        value: uniform
                    });
                }
                // TODO: assume matrix for (typeof == Float32Array && length == 16)?
            }
            // Array of textures
            else if (typeof uniform[0] === 'string') {
                for (u=0; u < uniform.length; u++) {
                    parsed.push({
                        type: 'sampler2D',
                        method: '1i',
                        name: name + '[' + u + ']',
                        value: uniform[u]
                    });
                }
            }
            // Array of arrays - but only arrays of vectors are allowed in this case
            else if (Array.isArray(uniform[0]) && typeof uniform[0][0] === 'number') {
                // float vectors (vec2, vec3, vec4)
                if (uniform[0].length >= 2 && uniform[0].length <= 4) {
                    // Set each vector in the array
                    for (u=0; u < uniform.length; u++) {
                        parsed.push({
                            type: 'vec' + uniform[0].length,
                            method: uniform[u].length + 'fv',
                            name: name + '[' + u + ']',
                            value: uniform[u]
                        });
                    }
                }
                // else error?
            }
            // Array of structures
            else if (typeof uniform[0] === 'object') {
                for (u=0; u < uniform.length; u++) {
                    // Set each struct in the array
                    parsed.push(...GLSL.parseUniforms(uniform[u], name + '[' + u + ']'));
                }
            }
        }
        // Boolean
        else if (typeof uniform === 'boolean') {
            parsed.push({
                type: 'bool',
                method: '1i',
                name,
                value: uniform
            });
        }
        // Texture
        else if (typeof uniform === 'string') {
            parsed.push({
                type: 'sampler2D',
                method: '1i',
                name,
                value: uniform
            });
        }
        // Structure
        else if (typeof uniform === 'object') {
            // Set each field in the struct
            parsed.push(...GLSL.parseUniforms(uniform, name));
        }

        // TODO: support other non-float types? (int, etc.)
    }

    return parsed;
};

/**
    Generate a GLSL variable definition from a JS object
*/
GLSL.defineVariable = function (name, value, prefix = null) {
    var type, array;
    var structs = '';
    prefix = prefix ? prefix + '_' + name : name;

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
            }
            // else error?
            array = value[0].length;
        }
        // Array of structures
        else if (typeof value[0] === 'object') {
            type = '_type_' + prefix; // custom struct name
            array = value.length;
            structs += GLSL.defineStruct(type, value[0], prefix) + '\n'; // build & add to list of dependent structs
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
    // Structure
    else if (typeof value === 'object') {
        type = '_type_' + prefix; // custom struct name
        structs += GLSL.defineStruct(type, value, prefix) + '\n'; // build & add to list of dependent structs
    }

    // Construct variable definition
    var variable = '';
    variable += `${type} ${name}`;
    if (array) {
        variable += `[${array}]`;
    }
    variable += ';\n';

    // Return the variable definition itself, and any dependent struct definitions
    return { variable, structs };
};

/**
    Generate a GLSL structure definition from a JS object
*/
GLSL.defineStruct = function (type, value, prefix = null) {
    var struct = `struct ${type} {\n`;
    var dependents = '';
    for (var field in value) {
        var subvar = GLSL.defineVariable(field, value[field], prefix);
        struct += '    ' + subvar.variable;
        dependents += subvar.structs;
    }
    struct += '};\n';
    struct = dependents + struct;
    return struct;
};

/**
    Generate a GLSL uniform definition from a JS object
*/
GLSL.defineUniform = function (name, value) {
    var def = GLSL.defineVariable(name, value);
    def = def.structs + 'uniform ' + def.variable;
    return def;
};

/**
    Check for a uniform definition of 'name' in the provided GLSL source
    Simple regex check for 'uniform' keyword and var name, does not attempt to parse/extract GLSL
    NOTE: assumes comments have been stripped from source
*/
GLSL.isUniformDefined = function (name, source) {
    // Match, in order:
    // - the keyword 'uniform'
    // - at least one character that is anything except a semicolon, ;
    // - optionally, anything enclosed in curly braces, { ... } (an inline structure definition can go here)
    // - optionally, any # of characters that is not a semicolon, ;
    // - the name of the uniform

    var re = new RegExp('uniform[^;]+(?:{[\\s\\S]*})?[^;]*\\b' + name + '\\b', 'g');
    if (source.match(re)) {
        return true;
    }
    return false;
};

/**
    Check that a symbol is referenced in the GLSL source
    NOTE: assumes comments have been stripped from source
*/
GLSL.isSymbolReferenced = function (name, source) {
    var re = new RegExp('\\b' + name + '\\b', 'g');
    if (source.search(re) >= 0) {
        return true;
    }
    return false;
};
