// Miscellaneous utilities
/*jshint worker: true*/

import log from 'loglevel';
import yaml from 'js-yaml';

var Utils;
export default Utils = {};

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

Utils.parseResource = function (body) {
    var data = null;
    try {
        eval('data = ' + body); // jshint ignore:line
    } catch (e) {
        try {
            data = yaml.safeLoad(body);
        } catch (e) {
            log.error('Utils.parseResource: failed to parse', body, e);
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
    if (!Array.isArray(points)) {
        return points;
    }
    else if (points.length < 1) {
        return null;
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
                // Boolean? Just treat each control point as a threshold, no interpolation
                if (typeof points[i][1] === 'boolean') {
                    y = points[i][1];
                    break;
                }

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
