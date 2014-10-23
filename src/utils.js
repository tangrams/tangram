// Miscellaneous utilities

var Utils;
export default Utils = {};
import xhr from 'xhr';

// allow for easier testing
Utils.xhr = function (...args) {
    xhr(...args);
};

// Simplistic detection of relative paths, append base if necessary
Utils.urlForPath = function(path) {
    var protocol;
    if (path == null || path === '') {
        return null;
    }

    var base = window.location.origin + window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/')) + '/';

    // Can expand a single path, or an array of paths
    if (typeof path === 'object' && path.length > 0) {
        // Array of paths
        for (var p in path) {
            protocol = path[p].toLowerCase().substr(0, 4);
            if (!(protocol === 'http' || protocol === 'file')) {
                path[p] = base + path[p];
            }
        }
    }
    else {
        // Single path
        protocol = path.toLowerCase().substr(0, 4);
        if (!(protocol === 'http' || protocol === 'file')) {
            path = base + path;
        }
    }
    return path;
};

// Stringify an object into JSON, but convert functions to strings
Utils.serializeWithFunctions = function (obj) {
    var serialized = JSON.stringify(obj, function(k, v) {
        // Convert functions to strings
        if (typeof v === 'function') {
            return v.toString();
        }
        return v;
    });

    return serialized;
};

// Parse a JSON string, but convert function-like strings back into functions
Utils.deserializeWithFunctions = function(serialized, wrap) {
    var obj = JSON.parse(serialized);
    obj = Utils.stringsToFunctions(obj, wrap);
    return obj;
};

// Recursively parse an object, attempting to convert string properties that look like functions back into functions
Utils.stringsToFunctions = function(obj, wrap) {
    for (var p in obj) {
        var val = obj[p];

        // Loop through object properties
        if (typeof val === 'object') {
            obj[p] = Utils.stringsToFunctions(val, wrap);
        }
        // Convert strings back into functions
        else if (typeof val === 'string' && val.match(/^function.*\(.*\)/) != null) {
            var f;
            try {
                /*jshint ignore:start*/
                if (typeof wrap === 'function') {
                    // console.log(`wrapped function: ${wrap(val)}`);
                    eval('f = ' + wrap(val));
                }
                else {
                    eval('f = ' + val);
                }
                /*jshint ignore:end*/
                obj[p] = f;
            }
            catch (e) {
                // fall-back to original value if parsing failed
                obj[p] = val;
            }
        }
    }

    return obj;
};

// Run a block if on the main thread (not in a web worker), with optional error (web worker) block
Utils.runIfInMainThread = function(block, err) {
    try {
        if (window.document !== undefined) {
            block();
        }
    }
    catch (e) {
        if (typeof err === 'function') {
            err();
        }
    }
};


// Used for differentiating between power-of-2 and non-power-of-2 textures
// Via: http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load
Utils.isPowerOf2 = function(value) {
    return (value & (value - 1)) === 0;
};

// Iterators (ES6 generators)

// Iterator for key/value pairs of an object
Utils.entries = function* (obj) {
    for (var key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
};

// Iterator for values of an object
Utils.values = function* (obj) {
    for (var key of Object.keys(obj)) {
        yield obj[key];
    }
};
