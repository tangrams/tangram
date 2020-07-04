// Miscellaneous utilities
/*jshint worker: true*/

import log from './log';
import Thread from './thread';
import WorkerBroker from './worker_broker';

export default Utils;

const Utils = {};

WorkerBroker.addTarget('Utils', Utils);

// Basic Safari detection
// http://stackoverflow.com/questions/7944460/detect-safari-browser
Utils.isSafari = function () {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// Basic IE11 or Edge detection
Utils.isMicrosoft = function () {
    return /(Trident\/7.0|Edge[ /](\d+[.\d]+))/i.test(navigator.userAgent);
};

Utils._requests = {};       // XHR requests on current thread
Utils._proxy_requests = {}; // XHR requests proxied to main thread

// `request_key` is a user-provided key that can be later used to cancel the request
Utils.io = function (url, timeout = 60000, responseType = 'text', method = 'GET', headers = {}, request_key = null, proxy = false) {
    if (Thread.is_worker && Utils.isMicrosoft()) {
        // Some versions of IE11 and Edge will hang web workers when performing XHR requests
        // These requests can be proxied through the main thread
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/9545866/
        log('debug', 'Proxying request for URL to worker', url);

        if (request_key) {
            Utils._proxy_requests[request_key] = true; // mark as proxied
        }
        return WorkerBroker.postMessage('Utils.io', url, timeout, responseType, method, headers, request_key, true);
    }
    else {
        var request = new XMLHttpRequest();
        var promise = new Promise((resolve, reject) => {
            request.open(method, url, true);
            request.timeout = timeout;
            request.responseType = responseType;

            // Attach optional request headers
            if (headers && typeof headers === 'object') {
                for (let key in headers) {
                    request.setRequestHeader(key, headers[key]);
                }
            }

            request.onload = () => {
                if (request.status === 200) {
                    if (['text', 'json'].indexOf(request.responseType) > -1) {
                        resolve({ body: request.responseText, status: request.status });
                    }
                    else {
                        resolve({ body: request.response, status: request.status });
                    }
                }
                else if (request.status === 204) { // No Content
                    resolve({ body: null, status: request.status });
                }
                else {
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

        promise = promise.then(response => {
            if (request_key) {
                delete Utils._requests[request_key];
            }

            if (proxy) {
                return WorkerBroker.withTransferables(response);
            }
            return response;
        });

        if (request_key) {
            Utils._requests[request_key] = request;
        }

        return promise;
    }
};

// Çancel a pending network request by user-provided request key
Utils.cancelRequest = function (key) {
    // Check for a request that was proxied to the main thread
    if (Thread.is_worker && Utils._proxy_requests[key]) {
        return WorkerBroker.postMessage('Utils.cancelRequest', key); // forward to main thread
    }

    let req = Utils._requests[key];
    if (req) {
        log('trace', `Cancelling network request key '${key}'`);
        Utils._requests[key].abort();
        delete Utils._requests[key];
    }
    else {
        log('trace', `Could not find network request key '${key}'`);
    }
};

// Stringify an object into JSON, but convert functions to strings
Utils.serializeWithFunctions = function (obj) {
    if (typeof obj === 'function') {
        return obj.toString();
    }

    let serialized = JSON.stringify(obj, function(k, v) {
        // Convert functions to strings
        if (typeof v === 'function') {
            return v.toString();
        }
        return v;
    });

    return serialized;
};

// Default to allowing high pixel density
// Returns true if display density changed
Utils.use_high_density_display = true;
Utils.updateDevicePixelRatio = function () {
    let prev = Utils.device_pixel_ratio;
    Utils.device_pixel_ratio = (Utils.use_high_density_display && window.devicePixelRatio) || 1;
    return Utils.device_pixel_ratio !== prev;
};

if (Thread.is_main) {
    Utils.updateDevicePixelRatio();
}

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
Utils.interpolate = function(x, points, transform) {
    // If this doesn't resemble a list of control points, just return the original value
    if (!Array.isArray(points) || !Array.isArray(points[0])) {
        return points;
    }
    else if (points.length < 1) {
        return points;
    }

    var x1, x2, d, y, y1, y2;

    // Min bounds
    if (x <= points[0][0]) {
        y = points[0][1];
        if (typeof transform === 'function') {
            y = transform(y);
        }
    }
    // Max bounds
    else if (x >= points[points.length-1][0]) {
        y = points[points.length-1][1];
        if (typeof transform === 'function') {
            y = transform(y);
        }
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
                        if (typeof transform === 'function') {
                            y1 = transform(points[i][1][c]);
                            y2 = transform(points[i+1][1][c]);
                            d = y2 - y1;
                            y[c] = d * (x - x1) / (x2 - x1) + y1;
                        }
                        else {
                            d = points[i+1][1][c] - points[i][1][c];
                            y[c] = d * (x - x1) / (x2 - x1) + points[i][1][c];
                        }
                    }
                }
                // Single value
                else {
                    if (typeof transform === 'function') {
                        y1 = transform(points[i][1]);
                        y2 = transform(points[i+1][1]);
                        d = y2 - y1;
                        y = d * (x - x1) / (x2 - x1) + y1;
                    }
                    else {
                        d = points[i+1][1] - points[i][1];
                        y = d * (x - x1) / (x2 - x1) + points[i][1];
                    }
                }
                break;
            }
        }
    }
    return y;
};

Utils.toCSSColor = function (color) {
    if (color != null) {
        if (color[3] === 1) { // full opacity
            return `rgb(${color.slice(0, 3).map(c => Math.round(c * 255)).join(', ')})`;
        }
        // RGB is between [0, 255] opacity is between [0, 1]
        return `rgba(${color.map((c, i) => (i < 3 && Math.round(c * 255)) || c).join(', ')})`;
    }
};
