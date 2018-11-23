import hashString from './hash';

// cache of functions, keyed by unique source
const cache = {
    functions: {},
    num_functions: 0,
    num_cached: 0
};

export { cache as functionStringCache };

export function clearFunctionStringCache () {
    cache.functions = {};
    cache.num_functions = 0;
    cache.num_cached = 0;
}

// Recursively parse an object, compiling string properties that look like functions
export function compileFunctionStrings (obj, wrap) {
    // Convert string
    if (typeof obj === 'string') {
        obj = compileFunctionString(obj, wrap);
    }
    // Loop through object properties
    else if (obj != null && typeof obj === 'object') {
        for (let p in obj) {
            obj[p] = compileFunctionStrings(obj[p], wrap);
        }
    }
    return obj;
}

// Compile a string that looks like a function
export function compileFunctionString (val, wrap) {
    // Parse function signature and body
    let fmatch =
        (typeof val === 'string') &&
        val.match(/^\s*function[^(]*\(([^)]*)\)\s*?\{([\s\S]*)\}$/m);

    if (fmatch && fmatch.length > 2) {
        try {
            // function body
            const body = fmatch[2];
            const source = (typeof wrap === 'function') ? wrap(body) : body; // optionally wrap source

            // compile and cache by unique function source
            const key = hashString(source);
            if (cache.functions[key] === undefined) {
                // function arguments extracted from signature
                let args = fmatch[1].length > 0 && fmatch[1].split(',').map(x => x.trim()).filter(x => x);
                args = args.length > 0 ? args : ['context']; // default to single 'context' argument

                cache.functions[key] = new Function(args.toString(), source); // jshint ignore:line
                cache.functions[key].source = body; // save original, un-wrapped function body source
                cache.num_functions++;
            }
            else {
                cache.num_cached++;
            }

            return cache.functions[key];
        }
        catch (e) {
            // fall-back to original value if parsing failed
            return val;
        }
    }
    return val;
}
