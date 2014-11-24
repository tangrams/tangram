// Miscellaneous utilities
/*jshint worker: true*/

var Utils;
export default Utils = {};

/**
 * Funtion that is able to return nested objects. Similar to a normal
 * property based lookup, but accepts an array of properties.
 *
 * var obj = {a: {b: {c: 10}}};
 * getIn(obj, ['a', 'b', 'c']); // 10
 */
Utils.getIn = function (obj, key) {
    function walk(obj, keys) {
        var key = keys[0];
        if (keys.length === 0) {
            return obj;
        } else if (!obj.hasOwnProperty(key)) {
            return;
        }
        return walk(obj[key], keys.slice(1));
    }
    return walk(obj, key);
};


Utils.cacheBusterForUrl = function (url) {
    return url + '?' + (+new Date());
};

Utils.io = function (url, timeout = 1000, responseType = 'text', method = 'GET', headers = {}) {
    var request = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
        request.timeout = timeout;
        request.onload = () => {
            if (request.status === 200) {
                if (['text', 'json'].indexOf(request.responseType) > -1) {
                    resolve(request.responseText);
                }
                else {
                    resolve(request.response);
                }
            } else {
                reject(Error('Request error with a status of ' + request.statusText));
            }
        };
        request.onerror = (evt) => {
            reject(Error('There was a network error' + evt.toString()));
        };
        request.ontimeout = (evt) => {
            reject(Error('timeout '+ evt.toString()));
        };
        request.open(method, url, true);
        request.responseType = responseType;
        request.send();
    });
};


// Needed for older browsers that still support WebGL (Safari 6 etc.)
Utils.requestAnimationFramePolyfill = function () {
    if (typeof window.requestAnimationFrame !== 'function') {
        window.requestAnimationFrame =
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (cb) {
                setTimeout(cb, 1000 /60);
            };
    }
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
                if (typeof wrap === 'function') {
                    eval('f = ' + wrap(val)); // jshint ignore:line
                }
                else {
                    eval('f = ' + val); // jshint ignore:line
                }
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

// Run a block of code only if in the main thread
Utils.inMainThread = function(block) {
    try {
        if (window.document !== undefined) {
            block();
        }
    }
    catch (e) {
    }
};

// Run a block of code only if in a web worker thread
Utils.inWorkerThread = function(block) {
    try {
        if (window.document !== undefined) {
        }
    } // jshint ignore:line
    catch (e) {
        if (self !== undefined) {
            block();
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
