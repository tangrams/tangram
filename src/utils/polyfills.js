/* global self, WorkerGlobalScope */

// Only apply polyfills when building for ES5 browsers (via envify plugin)
// Note: this only saves space in the minified bundle, which will strip out the whole section on the ES6 build
if (process.env.TANGRAM_BUILD_ENV === 'es5') {

    // Promises polyfill
    require('core-js/es6/promise');

    // Object.assign polyfill
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    if (typeof Object.assign !== 'function') {
        (function () {
            Object.assign = function (target) {
                'use strict';
                // We must check against these specific cases.
                if (target === undefined || target === null) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var output = Object(target);
                for (var index = 1; index < arguments.length; index++) {
                    var source = arguments[index];
                    if (source !== undefined && source !== null) {
                        for (var nextKey in source) {
                            if (source.hasOwnProperty(nextKey)) {
                                output[nextKey] = source[nextKey];
                            }
                        }
                    }
                }
                return output;
            };
        })();
    }

    // Math.hypot polyfill
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot
    Math.hypot = Math.hypot || function() {
        var y = 0;
        var length = arguments.length;

        for (var i = 0; i < length; i++) {
            if (arguments[i] === Infinity || arguments[i] === -Infinity) {
                return Infinity;
            }
            y += arguments[i] * arguments[i];
        }
        return Math.sqrt(y);
    };

    // Math.log2 polyfill
    Math.log2 = Math.log2 || function(x) { return Math.log(x) * Math.LOG2E; };

    // performance.now() polyfill
    let perf;
    if (typeof window !== 'undefined') {
        if ('performance' in window === false) {
            window.performance = {};
        }
        perf = window.performance;
    }
    else if (typeof self !== 'undefined' && typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
        if ('performance' in self === false) {
            self.performance = {};
        }
        perf = self.performance;
    }

    if (perf && typeof perf.now !== 'function') {
        let start = +new Date();
        perf.now = function() { return +new Date() - start; };
    }

}
