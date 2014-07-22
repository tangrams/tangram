// Miscellaneous utilities

// Simplistic detection of relative paths, append base if necessary
function urlForPath (path) {
    if (path == null || path == '') {
        return null;
    }

    // Can expand a single path, or an array of paths
    if (typeof path == 'object' && path.length > 0) {
        // Array of paths
        for (var p in path) {
            var protocol = path[p].toLowerCase().substr(0, 4);
            if (!(protocol == 'http' || protocol == 'file')) {
                path[p] = window.location.origin + window.location.pathname + path[p];
            }
        }
    }
    else {
        // Single path
        var protocol = path.toLowerCase().substr(0, 4);
        if (!(protocol == 'http' || protocol == 'file')) {
            path = window.location.origin + window.location.pathname + path;
        }
    }
    return path;
};

// Stringify an object into JSON, but convert functions to strings
function serializeWithFunctions (obj)
{
    var serialized = JSON.stringify(obj, function(k, v) {
        // Convert functions to strings
        if (typeof v == 'function') {
            return v.toString();
        }
        return v;
    });

    return serialized;
};

// Parse a JSON string, but convert function-like strings back into functions
function deserializeWithFunctions (serialized) {
    var obj = JSON.parse(serialized);
    obj = stringsToFunctions(obj);

    return obj;
};

// Recursively parse an object, attempting to convert string properties that look like functions back into functions
function stringsToFunctions (obj) {
    for (var p in obj) {
        var val = obj[p];

        // Loop through object properties
        if (typeof val == 'object') {
            obj[p] = stringsToFunctions(val);
        }
        // Convert strings back into functions
        else if (typeof val == 'string' && val.match(/^function.*\(.*\)/) != null) {
            var f;
            try {
                eval('f = ' + val);
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

if (module !== undefined) {
    module.exports = {
        urlForPath: urlForPath,
        serializeWithFunctions: serializeWithFunctions,
        deserializeWithFunctions: deserializeWithFunctions,
        stringsToFunctions: stringsToFunctions
    };
}
