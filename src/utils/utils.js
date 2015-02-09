// Miscellaneous utilities
/*jshint worker: true*/

import log from 'loglevel';
import yaml from 'js-yaml';

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

// Add the current base URL for schemeless or protocol-less URLs
// Maybe use https://github.com/medialize/URI.js if more robust functionality is needed
Utils.addBaseURL = function (url) {
    if (!url) {
        return;
    }

    // Schemeless, add protocol
    if (url.substr(0, 2) === '//') {
        url = window.location.protocol + url;
    }
    // No http(s) or data, add base
    else if (url.search(/(http|https|data):\/\//) < 0) {
        url = window.location.origin + window.location.pathname + url;
    }
    return url;
};

Utils.cacheBusterForUrl = function (url) {
    return url + '?' + (+new Date());
};

Utils.io = function (url, timeout = 60000, responseType = 'text', method = 'GET', headers = {}) {
    var request = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
        request.open(method, url, true);
        request.timeout = timeout;
        request.responseType = responseType;
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
        request.send();
    });
};

Utils.parseResource = function (body) {
    var data = null;
    try {
        eval('data = ' + body); // jshint ignore:line
    } catch (e) {
        try {
            data = yaml.safeLoad(body);
        } catch (e) {
            log.error('Utils.parseResource: failed to parse', e);
            throw e;
        }
    }
    return data;
};

Utils.loadResource = function (source) {
    return new Promise((resolve, reject) => {
        if (typeof source === 'string') {
            Utils.io(Utils.cacheBusterForUrl(source)).then((body) => {
                var data = Utils.parseResource(body);
                resolve(data);
            }, reject);
        } else {
            resolve(source);
        }
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
        // TODO: make function matching tolerant of whitespace and multilines
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

// Mark thread as main or worker
(function() {
    try {
        if (window.document !== undefined) {
            Utils.isWorkerThread = false;
            Utils.isMainThread   = true;
        }
    }
    catch (e) {
        if (self !== undefined) {
            Utils.isWorkerThread = true;
            Utils.isMainThread   = false;
        }
    }
})();

// Get URL that the current script was loaded from
// If currentScript is not available, loops through <script> elements searching for a list of provided paths
// e.g. Utils.findCurrentURL('tangram.debug.js', 'tangram.min.js');
Utils.findCurrentURL = function (...paths) {
    // Find currently executing script
    var script = document.currentScript;
    if (script) {
        return script.src;
    }
    else if (Array.isArray(paths)) {
        // Fallback on looping through <script> elements if document.currentScript is not supported
        var scripts = document.getElementsByTagName('script');
        for (var s=0; s < scripts.length; s++) {
            for (var path of paths) {
                if (scripts[s].src.indexOf(path) > -1) {
                   return scripts[s].src;
                }
            }
        }
    }
};

// Used for differentiating between power-of-2 and non-power-of-2 textures
// Via: http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load
Utils.isPowerOf2 = function(value) {
    return (value & (value - 1)) === 0;
};

// Interpolate 'x' along a series of control points
// 'points' is an array of control points in the form [x, y]
//
// Example:
//     Control points:
//         [0, 5]:  when x=0, y=5
//         [4, 10]: when x=4, y=10
//
//     Utils.interpolate(2, [[0, 5], [4, 10]]);
//     -> computes x=2, halfway between x=0 and x=4: (10 - 5) / 2 +5
//     -> returns 7.5
//
// TODO: add other interpolation methods besides linear
//
Utils.interpolate = function(x, points) {
    // If this doesn't resemble a list of control points, just return the original value
    if (!Array.isArray(points) || points.some(v => { return !Array.isArray(v); })) {
        return points;
    }
    else if (points.length < 1) {
        return points;
    }

    var x1, x2, d, y;

    // Min bounds
    if (x <= points[0][0]) {
        y = points[0][1];
    }
    // Max bounds
    else if (x >= points[points.length-1][0]) {
        y = points[points.length-1][1];
    }
    // Find which control points x is between
    else {
        for (var i=0; i < points.length - 1; i++) {
            if (x >= points[i][0] && x < points[i+1][0]) {
                // Linear interpolation
                x1 = points[i][0];
                x2 = points[i+1][0];

                // Multiple values
                if (Array.isArray(points[i][1])) {
                    y = [];
                    for (var c=0; c < points[i][1].length; c++) {
                        d = points[i+1][1][c] - points[i][1][c];
                        y[c] = d * (x - x1) / (x2 - x1) + points[i][1][c];
                    }
                }
                // Single value
                else {
                    d = points[i+1][1] - points[i][1];
                    y = d * (x - x1) / (x2 - x1) + points[i][1];
                }
                break;
            }
        }
    }
    return y;
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

// Recursive iterators for all properties of an object, no matter how deeply nested
// TODO: fix for circular structures
Utils.recurseEntries = function* (obj) {
    if (!obj) {
        return;
    }
    for (var key of Object.keys(obj)) {
        if (obj[key]) {
            yield [key, obj[key]];
            if (typeof obj[key] === 'object') {
                yield* Utils.recurseEntries(obj[key]);
            }
        }
    }
};

Utils.recurseValues = function* (obj) {
    if (!obj) {
        return;
    }
    for (var key of Object.keys(obj)) {
        if (obj[key]) {
            yield obj[key];
            if (typeof obj[key] === 'object') {
                yield* Utils.recurseValues(obj[key]);
            }
        }
    }
};
