!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Tangram=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.1.0
 */

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


(function() {
  "use strict";

  var shim = {};
  if (typeof(exports) === 'undefined') {
    if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      shim.exports = {};
      define(function() {
        return shim.exports;
      });
    } else {
      // gl-matrix lives in a browser, define its namespaces in global
      shim.exports = window;
    }    
  }
  else {
    // gl-matrix lives in commonjs, define its namespaces in exports
    shim.exports = exports;
  }

  (function(exports) {
    /* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

if(!GLMAT_ARRAY_TYPE) {
    var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
}

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix = {};

/**
 * Sets the type of array used when creating new vectors and matricies
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix.setMatrixArrayType = function(type) {
    GLMAT_ARRAY_TYPE = type;
}

if(typeof(exports) !== 'undefined') {
    exports.glMatrix = glMatrix;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */

var vec2 = {};

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
};

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2d = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat4 = function(out, a, m) {
    var x = a[0], 
        y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = (function() {
    var vec = vec2.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec2 = vec2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */

var vec3 = {};

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
vec3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
vec3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
vec3.fromValues = function(x, y, z) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
vec3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
vec3.set = function(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

/**
 * Subtracts two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
vec3.sub = vec3.subtract;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
vec3.mul = vec3.multiply;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};

/**
 * Alias for {@link vec3.divide}
 * @function
 */
vec3.div = vec3.divide;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
vec3.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
vec3.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.distance}
 * @function
 */
vec3.dist = vec3.distance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec3.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
vec3.sqrDist = vec3.squaredDistance;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
vec3.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.length}
 * @function
 */
vec3.len = vec3.length;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec3.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
vec3.sqrLen = vec3.squaredLength;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
vec3.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
vec3.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x*x + y*y + z*z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.cross = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    return out;
};

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
vec3.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec3.forEach = (function() {
    var vec = vec3.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 3;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec3.str = function (a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec3 = vec3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */

var vec4 = {};

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
vec4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
vec4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
vec4.fromValues = function(x, y, z, w) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
vec4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
vec4.set = function(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
vec4.sub = vec4.subtract;

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
vec4.mul = vec4.multiply;

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};

/**
 * Alias for {@link vec4.divide}
 * @function
 */
vec4.div = vec4.divide;

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
vec4.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
vec4.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.distance}
 * @function
 */
vec4.dist = vec4.distance;

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec4.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
vec4.sqrDist = vec4.squaredDistance;

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
vec4.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.length}
 * @function
 */
vec4.len = vec4.length;

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec4.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
vec4.sqrLen = vec4.squaredLength;

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
vec4.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x*x + y*y + z*z + w*w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
        out[3] = a[3] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
vec4.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
};

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
vec4.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec4.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec4.forEach = (function() {
    var vec = vec4.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 4;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec4} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec4.str = function (a) {
    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec4 = vec4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x2 Matrix
 * @name mat2
 */

var mat2 = {};

var mat2Identity = new Float32Array([
    1, 0,
    0, 1
]);

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
mat2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
mat2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
mat2.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a1 = a[1];
        out[1] = a[2];
        out[2] = a1;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }
    
    return out;
};

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

        // Calculate the determinant
        det = a0 * a3 - a2 * a1;

    if (!det) {
        return null;
    }
    det = 1.0 / det;
    
    out[0] =  a3 * det;
    out[1] = -a1 * det;
    out[2] = -a2 * det;
    out[3] =  a0 * det;

    return out;
};

/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.adjoint = function(out, a) {
    // Caching this value is nessecary if out == a
    var a0 = a[0];
    out[0] =  a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] =  a0;

    return out;
};

/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */
mat2.determinant = function (a) {
    return a[0] * a[3] - a[2] * a[1];
};

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = a0 * b0 + a1 * b2;
    out[1] = a0 * b1 + a1 * b3;
    out[2] = a2 * b0 + a3 * b2;
    out[3] = a2 * b1 + a3 * b3;
    return out;
};

/**
 * Alias for {@link mat2.multiply}
 * @function
 */
mat2.mul = mat2.multiply;

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a1 * s;
    out[1] = a0 * -s + a1 * c;
    out[2] = a2 *  c + a3 * s;
    out[3] = a2 * -s + a3 * c;
    return out;
};

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
mat2.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v1;
    out[2] = a2 * v0;
    out[3] = a3 * v1;
    return out;
};

/**
 * Returns a string representation of a mat2
 *
 * @param {mat2} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2.str = function (a) {
    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2 = mat2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x3 Matrix
 * @name mat2d
 * 
 * @description 
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, b,
 *  c, d,
 *  tx,ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, b, 0
 *  c, d, 0
 *  tx,ty,1]
 * </pre>
 * The last column is ignored so the array is shorter and operations are faster.
 */

var mat2d = {};

var mat2dIdentity = new Float32Array([
    1, 0,
    0, 1,
    0, 0
]);

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.create = function() {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {mat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */
mat2d.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.invert = function(out, a) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5];

    var det = aa * ad - ab * ac;
    if(!det){
        return null;
    }
    det = 1.0 / det;

    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
};

/**
 * Calculates the determinant of a mat2d
 *
 * @param {mat2d} a the source matrix
 * @returns {Number} determinant of a
 */
mat2d.determinant = function (a) {
    return a[0] * a[3] - a[1] * a[2];
};

/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.multiply = function (out, a, b) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5],
        ba = b[0], bb = b[1], bc = b[2], bd = b[3],
        btx = b[4], bty = b[5];

    out[0] = aa*ba + ab*bc;
    out[1] = aa*bb + ab*bd;
    out[2] = ac*ba + ad*bc;
    out[3] = ac*bb + ad*bd;
    out[4] = ba*atx + bc*aty + btx;
    out[5] = bb*atx + bd*aty + bty;
    return out;
};

/**
 * Alias for {@link mat2d.multiply}
 * @function
 */
mat2d.mul = mat2d.multiply;


/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
mat2d.rotate = function (out, a, rad) {
    var aa = a[0],
        ab = a[1],
        ac = a[2],
        ad = a[3],
        atx = a[4],
        aty = a[5],
        st = Math.sin(rad),
        ct = Math.cos(rad);

    out[0] = aa*ct + ab*st;
    out[1] = -aa*st + ab*ct;
    out[2] = ac*ct + ad*st;
    out[3] = -ac*st + ct*ad;
    out[4] = ct*atx + st*aty;
    out[5] = ct*aty - st*atx;
    return out;
};

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {mat2d} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
mat2d.scale = function(out, a, v) {
    var vx = v[0], vy = v[1];
    out[0] = a[0] * vx;
    out[1] = a[1] * vy;
    out[2] = a[2] * vx;
    out[3] = a[3] * vy;
    out[4] = a[4] * vx;
    out[5] = a[5] * vy;
    return out;
};

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {mat2d} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
mat2d.translate = function(out, a, v) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4] + v[0];
    out[5] = a[5] + v[1];
    return out;
};

/**
 * Returns a string representation of a mat2d
 *
 * @param {mat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2d.str = function (a) {
    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2d = mat2d;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3x3 Matrix
 * @name mat3
 */

var mat3 = {};

var mat3Identity = new Float32Array([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
]);

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
mat3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
mat3.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }
    
    return out;
};

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
        det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
mat3.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b00 = b[0], b01 = b[1], b02 = b[2],
        b10 = b[3], b11 = b[4], b12 = b[5],
        b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
mat3.mul = mat3.multiply;

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
mat3.translate = function(out, a, v) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],
        x = v[0], y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
};

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.rotate = function (out, a, rad) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.scale = function(out, a, v) {
    var x = v[0], y = v[2];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.fromMat2d = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = 0;

    out[3] = a[2];
    out[4] = a[3];
    out[5] = 0;

    out[6] = a[4];
    out[7] = a[5];
    out[8] = 1;
    return out;
};

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
mat3.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;

    out[3] = xy - wz;
    out[4] = 1 - (xx + zz);
    out[5] = yz + wx;

    out[6] = xz + wy;
    out[7] = yz - wx;
    out[8] = 1 - (xx + yy);

    return out;
};

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat3.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat3 = mat3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4x4 Matrix
 * @name mat4
 */

var mat4 = {};

var mat4Identity = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]);

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
mat4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
mat4.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
};

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
mat4.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
mat4.mul = mat4.multiply;

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.translate = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.scale = function(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < GLMAT_EPSILON) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateX = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateY = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateZ = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslation = function (out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};

/**
* Calculates a 4x4 matrix from the given quaternion
*
* @param {mat4} out mat4 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat4} out
*/
mat4.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;

    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;

    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.frustum = function (out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspective = function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
mat4.lookAt = function (out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < GLMAT_EPSILON &&
        Math.abs(eyey - centery) < GLMAT_EPSILON &&
        Math.abs(eyez - centerz) < GLMAT_EPSILON) {
        return mat4.identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat4.str = function (a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat4 = mat4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class Quaternion
 * @name quat
 */

var quat = {};

var quatIdentity = new Float32Array([0, 0, 0, 1]);

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
quat.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
quat.clone = vec4.clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
quat.fromValues = vec4.fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
quat.copy = vec4.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
quat.set = vec4.set;

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
quat.identity = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
quat.setAxisAngle = function(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
};

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
quat.add = vec4.add;

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat.multiply = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
};

/**
 * Alias for {@link quat.multiply}
 * @function
 */
quat.mul = quat.multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
quat.scale = vec4.scale;

/**
 * Rotates a quaternion by the given angle around the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateX = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
};

/**
 * Rotates a quaternion by the given angle around the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateY = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        by = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
};

/**
 * Rotates a quaternion by the given angle around the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateZ = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bz = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
quat.calculateW = function (out, a) {
    var x = a[0], y = a[1], z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
};

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
quat.dot = vec4.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
quat.lerp = vec4.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat.slerp = function (out, a, b, t) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    var cosHalfTheta = ax * bx + ay * by + az * bz + aw * bw,
        halfTheta,
        sinHalfTheta,
        ratioA,
        ratioB;

    if (Math.abs(cosHalfTheta) >= 1.0) {
        if (out !== a) {
            out[0] = ax;
            out[1] = ay;
            out[2] = az;
            out[3] = aw;
        }
        return out;
    }

    halfTheta = Math.acos(cosHalfTheta);
    sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

    if (Math.abs(sinHalfTheta) < 0.001) {
        out[0] = (ax * 0.5 + bx * 0.5);
        out[1] = (ay * 0.5 + by * 0.5);
        out[2] = (az * 0.5 + bz * 0.5);
        out[3] = (aw * 0.5 + bw * 0.5);
        return out;
    }

    ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    out[0] = (ax * ratioA + bx * ratioB);
    out[1] = (ay * ratioA + by * ratioB);
    out[2] = (az * ratioA + bz * ratioB);
    out[3] = (aw * ratioA + bw * ratioB);

    return out;
};

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
quat.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
        invDot = dot ? 1.0/dot : 0;
    
    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0*invDot;
    out[1] = -a1*invDot;
    out[2] = -a2*invDot;
    out[3] = a3*invDot;
    return out;
};

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
quat.conjugate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
};

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
quat.length = vec4.length;

/**
 * Alias for {@link quat.length}
 * @function
 */
quat.len = quat.length;

/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
quat.squaredLength = vec4.squaredLength;

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
quat.sqrLen = quat.squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
quat.normalize = vec4.normalize;

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat.fromMat3 = (function() {
    var s_iNext = [1,2,0];
    return function(out, m) {
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".
        var fTrace = m[0] + m[4] + m[8];
        var fRoot;

        if ( fTrace > 0.0 ) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0);  // 2w
            out[3] = 0.5 * fRoot;
            fRoot = 0.5/fRoot;  // 1/(4w)
            out[0] = (m[7]-m[5])*fRoot;
            out[1] = (m[2]-m[6])*fRoot;
            out[2] = (m[3]-m[1])*fRoot;
        } else {
            // |w| <= 1/2
            var i = 0;
            if ( m[4] > m[0] )
              i = 1;
            if ( m[8] > m[i*3+i] )
              i = 2;
            var j = s_iNext[i];
            var k = s_iNext[j];
            
            fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
            out[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            out[3] = (m[k*3+j] - m[j*3+k]) * fRoot;
            out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
            out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
        }
        
        return out;
    };
})();

/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
quat.str = function (a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.quat = quat;
}
;













  })(shim.exports);
})();

},{}],2:[function(_dereq_,module,exports){
(function() {
  var slice = [].slice;

  function queue(parallelism) {
    var q,
        tasks = [],
        started = 0, // number of tasks that have been started (and perhaps finished)
        active = 0, // number of tasks currently being executed (started but not finished)
        remaining = 0, // number of tasks not yet finished
        popping, // inside a synchronous task callback?
        error = null,
        await = noop,
        all;

    if (!parallelism) parallelism = Infinity;

    function pop() {
      while (popping = started < tasks.length && active < parallelism) {
        var i = started++,
            t = tasks[i],
            a = slice.call(t, 1);
        a.push(callback(i));
        ++active;
        t[0].apply(null, a);
      }
    }

    function callback(i) {
      return function(e, r) {
        --active;
        if (error != null) return;
        if (e != null) {
          error = e; // ignore new tasks and squelch active callbacks
          started = remaining = NaN; // stop queued tasks from starting
          notify();
        } else {
          tasks[i] = r;
          if (--remaining) popping || pop();
          else notify();
        }
      };
    }

    function notify() {
      if (error != null) await(error);
      else if (all) await(error, tasks);
      else await.apply(null, [error].concat(tasks));
    }

    return q = {
      defer: function() {
        if (!error) {
          tasks.push(arguments);
          ++remaining;
          pop();
        }
        return q;
      },
      await: function(f) {
        await = f;
        all = false;
        if (!remaining) notify();
        return q;
      },
      awaitAll: function(f) {
        await = f;
        all = true;
        if (!remaining) notify();
        return q;
      }
    };
  }

  function noop() {}

  queue.version = "1.0.7";
  if (typeof define === "function" && define.amd) define(function() { return queue; });
  else if (typeof module === "object" && module.exports) module.exports = queue;
  else this.queue = queue;
})();

},{}],3:[function(_dereq_,module,exports){
"use strict";
var Point = _dereq_('./point.js');
var Geo = {};
Geo.tile_size = 256;
Geo.half_circumference_meters = 20037508.342789244;
Geo.map_origin_meters = Point(-Geo.half_circumference_meters, Geo.half_circumference_meters);
Geo.min_zoom_meters_per_pixel = Geo.half_circumference_meters * 2 / Geo.tile_size;
Geo.meters_per_pixel = [];
Geo.max_zoom = 20;
for (var z = 0; z <= Geo.max_zoom; z++) {
  Geo.meters_per_pixel[z] = Geo.min_zoom_meters_per_pixel / Math.pow(2, z);
}
Geo.units_per_meter = [];
Geo.setTileScale = function(scale) {
  Geo.tile_scale = scale;
  Geo.units_per_pixel = Geo.tile_scale / Geo.tile_size;
  for (var z = 0; z <= Geo.max_zoom; z++) {
    Geo.units_per_meter[z] = Geo.tile_scale / (Geo.tile_size * Geo.meters_per_pixel[z]);
  }
};
Geo.metersForTile = function(tile) {
  return Point((tile.x * Geo.tile_size * Geo.meters_per_pixel[tile.z]) + Geo.map_origin_meters.x, ((tile.y * Geo.tile_size * Geo.meters_per_pixel[tile.z]) * -1) + Geo.map_origin_meters.y);
};
Geo.metersToLatLng = function(meters) {
  var c = Point.copy(meters);
  c.x /= Geo.half_circumference_meters;
  c.y /= Geo.half_circumference_meters;
  c.y = (2 * Math.atan(Math.exp(c.y * Math.PI)) - (Math.PI / 2)) / Math.PI;
  c.x *= 180;
  c.y *= 180;
  return c;
};
Geo.latLngToMeters = function(latlng) {
  var c = Point.copy(latlng);
  c.y = Math.log(Math.tan((c.y + 90) * Math.PI / 360)) / (Math.PI / 180);
  c.y = c.y * Geo.half_circumference_meters / 180;
  c.x = c.x * Geo.half_circumference_meters / 180;
  return c;
};
Geo.transformGeometry = function(geometry, transform) {
  if (geometry.type == 'Point') {
    return transform(geometry.coordinates);
  } else if (geometry.type == 'LineString' || geometry.type == 'MultiPoint') {
    return geometry.coordinates.map(transform);
  } else if (geometry.type == 'Polygon' || geometry.type == 'MultiLineString') {
    return geometry.coordinates.map(function(coordinates) {
      return coordinates.map(transform);
    });
  } else if (geometry.type == 'MultiPolygon') {
    return geometry.coordinates.map(function(polygon) {
      return polygon.map(function(coordinates) {
        return coordinates.map(transform);
      });
    });
  }
  return {};
};
Geo.boxIntersect = function(b1, b2) {
  return !(b2.sw.x > b1.ne.x || b2.ne.x < b1.sw.x || b2.sw.y > b1.ne.y || b2.ne.y < b1.sw.y);
};
Geo.splitFeatureLines = function(feature, tolerance) {
  var tolerance = tolerance || 0.001;
  var tolerance_sq = tolerance * tolerance;
  var geom = feature.geometry;
  var lines;
  if (geom.type == 'MultiLineString') {
    lines = geom.coordinates;
  } else if (geom.type == 'LineString') {
    lines = [geom.coordinates];
  } else {
    return feature;
  }
  var split_lines = [];
  for (var s = 0; s < lines.length; s++) {
    var seg = lines[s];
    var split_seg = [];
    var last_coord = null;
    var keep;
    for (var c = 0; c < seg.length; c++) {
      var coord = seg[c];
      keep = true;
      if (last_coord != null) {
        var dist = (coord[0] - last_coord[0]) * (coord[0] - last_coord[0]) + (coord[1] - last_coord[1]) * (coord[1] - last_coord[1]);
        if (dist > tolerance_sq) {
          keep = false;
        }
      }
      if (keep == false) {
        split_lines.push(split_seg);
        split_seg = [];
      }
      split_seg.push(coord);
      last_coord = coord;
    }
    split_lines.push(split_seg);
    split_seg = [];
  }
  if (split_lines.length == 1) {
    geom.type = 'LineString';
    geom.coordinates = split_lines[0];
  } else {
    geom.type = 'MultiLineString';
    geom.coordinates = split_lines;
  }
  return feature;
};
if (module !== undefined) {
  module.exports = Geo;
}


},{"./point.js":14}],4:[function(_dereq_,module,exports){
"use strict";
var Utils = _dereq_('../utils.js');
var GL = {};
GL.getContext = function getContext(canvas) {
  var fullscreen = false;
  if (canvas == null) {
    canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = -1;
    document.body.appendChild(canvas);
    fullscreen = true;
  }
  var gl = canvas.getContext('experimental-webgl');
  if (!gl) {
    alert("Couldn't create WebGL context. Your browser probably doesn't support WebGL or it's turned off?");
    throw "Couldn't create WebGL context";
  }
  GL.resizeCanvas(gl, window.innerWidth, window.innerHeight);
  if (fullscreen == true) {
    window.addEventListener('resize', function() {
      GL.resizeCanvas(gl, window.innerWidth, window.innerHeight);
    });
  }
  return gl;
};
GL.resizeCanvas = function(gl, width, height) {
  var device_pixel_ratio = window.devicePixelRatio || 1;
  gl.canvas.style.width = width + 'px';
  gl.canvas.style.height = height + 'px';
  gl.canvas.width = Math.round(gl.canvas.style.width * device_pixel_ratio);
  gl.canvas.height = Math.round(gl.canvas.style.width * device_pixel_ratio);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
};
GL.updateProgram = function GLupdateProgram(gl, program, vertex_shader_source, fragment_shader_source) {
  try {
    var vertex_shader = GL.createShader(gl, vertex_shader_source, gl.VERTEX_SHADER);
    var fragment_shader = GL.createShader(gl, '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment_shader_source, gl.FRAGMENT_SHADER);
  } catch (err) {
    console.log(err);
    return program;
  }
  gl.useProgram(null);
  if (program != null) {
    var old_shaders = gl.getAttachedShaders(program);
    for (var i = 0; i < old_shaders.length; i++) {
      gl.detachShader(program, old_shaders[i]);
    }
  } else {
    program = gl.createProgram();
  }
  if (vertex_shader == null || fragment_shader == null) {
    return program;
  }
  gl.attachShader(program, vertex_shader);
  gl.attachShader(program, fragment_shader);
  gl.deleteShader(vertex_shader);
  gl.deleteShader(fragment_shader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    var program_error = "WebGL program error:\n" + "VALIDATE_STATUS: " + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + "\n" + "ERROR: " + gl.getError() + "\n\n" + "--- Vertex Shader ---\n" + vertex_shader_source + "\n\n" + "--- Fragment Shader ---\n" + fragment_shader_source;
    console.log(program_error);
    throw program_error;
  }
  return program;
};
GL.createShader = function GLcreateShader(gl, source, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    var shader_error = "WebGL shader error:\n" + (type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") + " SHADER:\n" + gl.getShaderInfoLog(shader);
    throw shader_error;
  }
  return shader;
};
try {
  GL.tesselator = (function initTesselator() {
    var tesselator = new libtess.GluTesselator();
    function vertexCallback(data, polyVertArray) {
      if (tesselator.z != null) {
        polyVertArray.push([data[0], data[1], tesselator.z]);
      } else {
        polyVertArray.push([data[0], data[1]]);
      }
    }
    function combineCallback(coords, data, weight) {
      return coords;
    }
    function edgeCallback(flag) {}
    tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, vertexCallback);
    tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE, combineCallback);
    tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_EDGE_FLAG, edgeCallback);
    tesselator.gluTessNormal(0, 0, 1);
    return tesselator;
  })();
  GL.triangulatePolygon = function GLTriangulate(contours, z) {
    var triangleVerts = [];
    GL.tesselator.z = z;
    GL.tesselator.gluTessBeginPolygon(triangleVerts);
    for (var i = 0; i < contours.length; i++) {
      GL.tesselator.gluTessBeginContour();
      var contour = contours[i];
      for (var j = 0; j < contour.length; j++) {
        var coords = [contour[j][0], contour[j][1], 0];
        GL.tesselator.gluTessVertex(coords, coords);
      }
      GL.tesselator.gluTessEndContour();
    }
    GL.tesselator.gluTessEndPolygon();
    return triangleVerts;
  };
} catch (e) {}
GL.addVertices = function(vertices, vertex_constants, vertex_data) {
  if (vertices == null) {
    return vertex_data;
  }
  vertex_constants = vertex_constants || [];
  for (var v = 0,
      vlen = vertices.length; v < vlen; v++) {
    vertex_data.push.apply(vertex_data, vertices[v]);
    vertex_data.push.apply(vertex_data, vertex_constants);
  }
  return vertex_data;
};
GL.addVerticesMultipleAttributes = function(dynamics, constants, vertex_data) {
  var dlen = dynamics.length;
  var vlen = dynamics[0].length;
  constants = constants || [];
  for (var v = 0; v < vlen; v++) {
    for (var d = 0; d < dlen; d++) {
      vertex_data.push.apply(vertex_data, dynamics[d][v]);
    }
    vertex_data.push.apply(vertex_data, constants);
  }
  return vertex_data;
};
if (module !== undefined) {
  module.exports = GL;
}


},{"../utils.js":17}],5:[function(_dereq_,module,exports){
"use strict";
var Vector = _dereq_('../vector.js');
var Point = _dereq_('../point.js');
var GL = _dereq_('./gl.js');
var GLBuilders = {};
GLBuilders.debug = false;
GLBuilders.buildPolygons = function GLBuildersBuildPolygons(polygons, z, vertex_data, options) {
  options = options || {};
  var vertex_constants = [];
  if (z != null) {
    vertex_constants.push(z);
  }
  if (options.normals) {
    vertex_constants.push(0, 0, 1);
  }
  if (options.vertex_constants) {
    vertex_constants.push.apply(vertex_constants, options.vertex_constants);
  }
  if (vertex_constants.length == 0) {
    vertex_constants = null;
  }
  var num_polygons = polygons.length;
  for (var p = 0; p < num_polygons; p++) {
    var vertices = GL.triangulatePolygon(polygons[p]);
    GL.addVertices(vertices, vertex_constants, vertex_data);
  }
  return vertex_data;
};
GLBuilders.buildExtrudedPolygons = function GLBuildersBuildExtrudedPolygon(polygons, z, height, min_height, vertex_data, options) {
  options = options || {};
  var min_z = z + (min_height || 0);
  var max_z = z + height;
  GLBuilders.buildPolygons(polygons, max_z, vertex_data, {
    normals: true,
    vertex_constants: options.vertex_constants
  });
  var wall_vertex_constants = [null, null, null];
  if (options.vertex_constants) {
    wall_vertex_constants.push.apply(wall_vertex_constants, options.vertex_constants);
  }
  var num_polygons = polygons.length;
  for (var p = 0; p < num_polygons; p++) {
    var polygon = polygons[p];
    for (var q = 0; q < polygon.length; q++) {
      var contour = polygon[q];
      for (var w = 0; w < contour.length - 1; w++) {
        var wall_vertices = [];
        wall_vertices.push([contour[w + 1][0], contour[w + 1][1], max_z], [contour[w + 1][0], contour[w + 1][1], min_z], [contour[w][0], contour[w][1], min_z], [contour[w][0], contour[w][1], min_z], [contour[w][0], contour[w][1], max_z], [contour[w + 1][0], contour[w + 1][1], max_z]);
        var normal = Vector.cross([0, 0, 1], Vector.normalize([contour[w + 1][0] - contour[w][0], contour[w + 1][1] - contour[w][1], 0]));
        wall_vertex_constants[0] = normal[0];
        wall_vertex_constants[1] = normal[1];
        wall_vertex_constants[2] = normal[2];
        GL.addVertices(wall_vertices, wall_vertex_constants, vertex_data);
      }
    }
  }
  return vertex_data;
};
GLBuilders.buildPolylines = function GLBuildersBuildPolylines(lines, z, width, vertex_data, options) {
  options = options || {};
  options.closed_polygon = options.closed_polygon || false;
  options.remove_tile_edges = options.remove_tile_edges || false;
  var vertex_constants = [z, 0, 0, 1];
  if (options.vertex_constants) {
    vertex_constants.push.apply(vertex_constants, options.vertex_constants);
  }
  if (GLBuilders.debug && options.vertex_lines) {
    var num_lines = lines.length;
    for (var ln = 0; ln < num_lines; ln++) {
      var line = lines[ln];
      for (var p = 0; p < line.length - 1; p++) {
        var pa = line[p];
        var pb = line[p + 1];
        options.vertex_lines.push(pa[0], pa[1], z + 0.001, 0, 0, 1, 1.0, 0, 0, pb[0], pb[1], z + 0.001, 0, 0, 1, 1.0, 0, 0);
      }
    }
    ;
  }
  var vertices = [];
  var num_lines = lines.length;
  for (var ln = 0; ln < num_lines; ln++) {
    var line = lines[ln];
    if (line.length > 2) {
      var anchors = [];
      if (line.length > 3) {
        var mid = [];
        var p,
            pmax;
        if (options.closed_polygon == true) {
          p = 0;
          pmax = line.length - 1;
        } else {
          p = 1;
          pmax = line.length - 2;
          mid.push(line[0]);
        }
        for (; p < pmax; p++) {
          var pa = line[p];
          var pb = line[p + 1];
          mid.push([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2]);
        }
        var mmax;
        if (options.closed_polygon == true) {
          mmax = mid.length;
        } else {
          mid.push(line[line.length - 1]);
          mmax = mid.length - 1;
        }
        for (p = 0; p < mmax; p++) {
          anchors.push([mid[p], line[(p + 1) % line.length], mid[(p + 1) % mid.length]]);
        }
      } else {
        anchors = [[line[0], line[1], line[2]]];
      }
      for (var p = 0; p < anchors.length; p++) {
        if (!options.remove_tile_edges) {
          buildAnchor(anchors[p][0], anchors[p][1], anchors[p][2]);
        } else {
          var edge1 = GLBuilders.isOnTileEdge(anchors[p][0], anchors[p][1]);
          var edge2 = GLBuilders.isOnTileEdge(anchors[p][1], anchors[p][2]);
          if (!edge1 && !edge2) {
            buildAnchor(anchors[p][0], anchors[p][1], anchors[p][2]);
          } else if (!edge1) {
            buildSegment(anchors[p][0], anchors[p][1]);
          } else if (!edge2) {
            buildSegment(anchors[p][1], anchors[p][2]);
          }
        }
      }
    } else if (line.length == 2) {
      buildSegment(line[0], line[1]);
    }
  }
  ;
  GL.addVertices(vertices, vertex_constants, vertex_data);
  function buildSegment(pa, pb) {
    var slope = Vector.normalize([(pb[1] - pa[1]) * -1, pb[0] - pa[0]]);
    var pa_outer = [pa[0] + slope[0] * width / 2, pa[1] + slope[1] * width / 2];
    var pa_inner = [pa[0] - slope[0] * width / 2, pa[1] - slope[1] * width / 2];
    var pb_outer = [pb[0] + slope[0] * width / 2, pb[1] + slope[1] * width / 2];
    var pb_inner = [pb[0] - slope[0] * width / 2, pb[1] - slope[1] * width / 2];
    vertices.push(pb_inner, pb_outer, pa_inner, pa_inner, pb_outer, pa_outer);
  }
  function buildAnchor(pa, joint, pb) {
    var pa_slope = Vector.normalize([(joint[1] - pa[1]) * -1, joint[0] - pa[0]]);
    var pa_outer = [[pa[0] + pa_slope[0] * width / 2, pa[1] + pa_slope[1] * width / 2], [joint[0] + pa_slope[0] * width / 2, joint[1] + pa_slope[1] * width / 2]];
    var pa_inner = [[pa[0] - pa_slope[0] * width / 2, pa[1] - pa_slope[1] * width / 2], [joint[0] - pa_slope[0] * width / 2, joint[1] - pa_slope[1] * width / 2]];
    var pb_slope = Vector.normalize([(pb[1] - joint[1]) * -1, pb[0] - joint[0]]);
    var pb_outer = [[joint[0] + pb_slope[0] * width / 2, joint[1] + pb_slope[1] * width / 2], [pb[0] + pb_slope[0] * width / 2, pb[1] + pb_slope[1] * width / 2]];
    var pb_inner = [[joint[0] - pb_slope[0] * width / 2, joint[1] - pb_slope[1] * width / 2], [pb[0] - pb_slope[0] * width / 2, pb[1] - pb_slope[1] * width / 2]];
    var intersection = Vector.lineIntersection(pa_outer[0], pa_outer[1], pb_outer[0], pb_outer[1]);
    var line_debug = null;
    if (intersection != null) {
      var intersect_outer = intersection;
      var len_sq = Vector.lengthSq([intersect_outer[0] - joint[0], intersect_outer[1] - joint[1]]);
      var miter_len_max = 3;
      if (len_sq > (width * width * miter_len_max * miter_len_max)) {
        line_debug = 'distance';
        intersect_outer = Vector.normalize([intersect_outer[0] - joint[0], intersect_outer[1] - joint[1]]);
        intersect_outer = [joint[0] + intersect_outer[0] * miter_len_max, joint[1] + intersect_outer[1] * miter_len_max];
      }
      var intersect_inner = [(joint[0] - intersect_outer[0]) + joint[0], (joint[1] - intersect_outer[1]) + joint[1]];
      vertices.push(intersect_inner, intersect_outer, pa_inner[0], pa_inner[0], intersect_outer, pa_outer[0], pb_inner[1], pb_outer[1], intersect_inner, intersect_inner, pb_outer[1], intersect_outer);
    } else {
      line_debug = 'parallel';
      pa_inner[1] = pb_inner[0];
      pa_outer[1] = pb_outer[0];
      vertices.push(pa_inner[1], pa_outer[1], pa_inner[0], pa_inner[0], pa_outer[1], pa_outer[0], pb_inner[1], pb_outer[1], pb_inner[0], pb_inner[0], pb_outer[1], pb_outer[0]);
    }
    if (GLBuilders.debug && options.vertex_lines) {
      options.vertex_lines.push(pa_inner[0][0], pa_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_inner[1][0], pa_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_inner[0][0], pb_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_inner[1][0], pb_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_outer[0][0], pa_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_outer[1][0], pa_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_outer[0][0], pb_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_outer[1][0], pb_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_inner[0][0], pa_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_outer[0][0], pa_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_inner[1][0], pa_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_outer[1][0], pa_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_inner[0][0], pb_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_outer[0][0], pb_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_inner[1][0], pb_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_outer[1][0], pb_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0);
    }
    if (GLBuilders.debug && line_debug && options.vertex_lines) {
      var dcolor;
      if (line_debug == 'parallel') {
        dcolor = [0, 1, 0];
      } else if (line_debug == 'distance') {
        dcolor = [1, 0, 0];
      }
      options.vertex_lines.push(pa[0], pa[1], z + 0.002, 0, 0, 1, dcolor[0], dcolor[1], dcolor[2], joint[0], joint[1], z + 0.002, 0, 0, 1, dcolor[0], dcolor[1], dcolor[2], joint[0], joint[1], z + 0.002, 0, 0, 1, dcolor[0], dcolor[1], dcolor[2], pb[0], pb[1], z + 0.002, 0, 0, 1, dcolor[0], dcolor[1], dcolor[2]);
      var num_lines = lines.length;
      for (var ln = 0; ln < num_lines; ln++) {
        var line2 = lines[ln];
        for (var p = 0; p < line2.length - 1; p++) {
          var pa = line2[p];
          var pb = line2[p + 1];
          options.vertex_lines.push(pa[0], pa[1], z + 0.0005, 0, 0, 1, 0, 0, 1.0, pb[0], pb[1], z + 0.0005, 0, 0, 1, 0, 0, 1.0);
        }
      }
      ;
    }
  }
  return vertex_data;
};
GLBuilders.buildQuadsForPoints = function(points, width, height, z, vertex_data, options) {
  var options = options || {};
  var vertex_constants = [];
  if (options.normals) {
    vertex_constants.push(0, 0, 1);
  }
  if (options.vertex_constants) {
    vertex_constants.push.apply(vertex_constants, options.vertex_constants);
  }
  if (vertex_constants.length == 0) {
    vertex_constants = null;
  }
  var num_points = points.length;
  for (var p = 0; p < num_points; p++) {
    var point = points[p];
    var positions = [[point[0] - width / 2, point[1] - height / 2], [point[0] + width / 2, point[1] - height / 2], [point[0] + width / 2, point[1] + height / 2], [point[0] - width / 2, point[1] - height / 2], [point[0] + width / 2, point[1] + height / 2], [point[0] - width / 2, point[1] + height / 2]];
    if (z != null) {
      positions[0][2] = z;
      positions[1][2] = z;
      positions[2][2] = z;
      positions[3][2] = z;
      positions[4][2] = z;
      positions[5][2] = z;
    }
    if (options.texcoords == true) {
      var texcoords = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
      GL.addVerticesMultipleAttributes([positions, texcoords], vertex_constants, vertex_data);
    } else {
      GL.addVertices(positions, vertex_constants, vertex_data);
    }
  }
  return vertex_data;
};
GLBuilders.buildLines = function GLBuildersBuildLines(lines, feature, layer, style, tile, z, vertex_data, options) {
  options = options || {};
  var color = style.color;
  var width = style.width;
  var num_lines = lines.length;
  for (var ln = 0; ln < num_lines; ln++) {
    var line = lines[ln];
    for (var p = 0; p < line.length - 1; p++) {
      var pa = line[p];
      var pb = line[p + 1];
      vertex_data.push(pa[0], pa[1], z, 0, 0, 1, color[0], color[1], color[2], pb[0], pb[1], z, 0, 0, 1, color[0], color[1], color[2]);
    }
  }
  ;
  return vertex_data;
};
GLBuilders.isOnTileEdge = function(pa, pb, options) {
  options = options || {};
  var tolerance_function = options.tolerance_function || GLBuilders.valuesWithinTolerance;
  var tolerance = options.tolerance || 1;
  var tile_min = GLBuilders.tile_bounds[0];
  var tile_max = GLBuilders.tile_bounds[1];
  var edge = null;
  if (tolerance_function(pa[0], tile_min.x, tolerance) && tolerance_function(pb[0], tile_min.x, tolerance)) {
    edge = 'left';
  } else if (tolerance_function(pa[0], tile_max.x, tolerance) && tolerance_function(pb[0], tile_max.x, tolerance)) {
    edge = 'right';
  } else if (tolerance_function(pa[1], tile_min.y, tolerance) && tolerance_function(pb[1], tile_min.y, tolerance)) {
    edge = 'top';
  } else if (tolerance_function(pa[1], tile_max.y, tolerance) && tolerance_function(pb[1], tile_max.y, tolerance)) {
    edge = 'bottom';
  }
  return edge;
};
GLBuilders.setTileScale = function(scale) {
  GLBuilders.tile_bounds = [Point(0, 0), Point(scale, -scale)];
};
GLBuilders.valuesWithinTolerance = function(a, b, tolerance) {
  tolerance = tolerance || 1;
  return (Math.abs(a - b) < tolerance);
};
GLBuilders.buildZigzagLineTestPattern = function() {
  var min = Point(0, 0);
  var max = Point(4096, 4096);
  var g = {
    id: 123,
    geometry: {
      type: 'LineString',
      coordinates: [[min.x * 0.75 + max.x * 0.25, min.y * 0.75 + max.y * 0.25], [min.x * 0.75 + max.x * 0.25, min.y * 0.5 + max.y * 0.5], [min.x * 0.25 + max.x * 0.75, min.y * 0.75 + max.y * 0.25], [min.x * 0.25 + max.x * 0.75, min.y * 0.25 + max.y * 0.75], [min.x * 0.4 + max.x * 0.6, min.y * 0.5 + max.y * 0.5], [min.x * 0.5 + max.x * 0.5, min.y * 0.25 + max.y * 0.75], [min.x * 0.75 + max.x * 0.25, min.y * 0.25 + max.y * 0.75], [min.x * 0.75 + max.x * 0.25, min.y * 0.4 + max.y * 0.6]]
    },
    properties: {kind: 'debug'}
  };
  return g;
};
if (module !== undefined) {
  module.exports = GLBuilders;
}


},{"../point.js":14,"../vector.js":18,"./gl.js":4}],6:[function(_dereq_,module,exports){
"use strict";
var GL = _dereq_('./gl.js');
var GLVertexLayout = _dereq_('./gl_vertex_layout.js');
var GLProgram = _dereq_('./gl_program.js');
function GLGeometry(gl, vertex_data, vertex_layout, options) {
  options = options || {};
  this.gl = gl;
  this.vertex_data = vertex_data;
  this.vertex_layout = vertex_layout;
  this.buffer = this.gl.createBuffer();
  this.draw_mode = options.draw_mode || this.gl.TRIANGLES;
  this.data_usage = options.data_usage || this.gl.STATIC_DRAW;
  this.vertices_per_geometry = 3;
  this.vertex_count = this.vertex_data.byteLength / this.vertex_layout.stride;
  this.geometry_count = this.vertex_count / this.vertices_per_geometry;
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertex_data, this.data_usage);
}
GLGeometry.prototype.render = function(options) {
  options = options || {};
  if (typeof this._render_setup == 'function') {
    this._render_setup();
  }
  var gl_program = options.gl_program || GLProgram.current;
  gl_program.use();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  this.vertex_layout.enable(this.gl, gl_program);
  this.gl.drawArrays(this.draw_mode, 0, this.vertex_count);
};
GLGeometry.prototype.destroy = function() {
  console.log("GLGeometry.destroy: delete buffer of size " + this.vertex_data.byteLength);
  this.gl.deleteBuffer(this.buffer);
  delete this.vertex_data;
};
if (module !== undefined) {
  module.exports = GLGeometry;
}


},{"./gl.js":4,"./gl_program.js":8,"./gl_vertex_layout.js":11}],7:[function(_dereq_,module,exports){
"use strict";
var GL = _dereq_('./gl.js');
var GLBuilders = _dereq_('./gl_builders.js');
var GLGeometry = _dereq_('./gl_geom.js');
var GLVertexLayout = _dereq_('./gl_vertex_layout.js');
var GLProgram = _dereq_('./gl_program.js');
var shader_sources = _dereq_('./gl_shaders.js');
var Queue = _dereq_('queue-async');
var RenderMode = {
  init: function(gl) {
    this.gl = gl;
    this.makeGLProgram();
    if (typeof this._init == 'function') {
      this._init();
    }
  },
  refresh: function() {
    this.makeGLProgram();
  },
  defines: {},
  selection: false,
  buildPolygons: function() {},
  buildLines: function() {},
  buildPoints: function() {},
  makeGLGeometry: function(vertex_data) {
    return new GLGeometry(this.gl, vertex_data, this.vertex_layout);
  }
};
RenderMode.makeGLProgram = function() {
  var $__0 = this;
  var queue = Queue();
  var defines = this.buildDefineList();
  if (this.selection) {
    var selection_defines = Object.create(defines);
    selection_defines['FEATURE_SELECTION'] = true;
  }
  var transforms = (this.shaders && this.shaders.transforms);
  var program = (this.hasOwnProperty('gl_program') && this.gl_program);
  var selection_program = (this.hasOwnProperty('selection_gl_program') && this.selection_gl_program);
  queue.defer((function(complete) {
    if (!program) {
      program = new GLProgram($__0.gl, shader_sources[$__0.vertex_shader_key], shader_sources[$__0.fragment_shader_key], {
        defines: defines,
        transforms: transforms,
        name: $__0.name,
        callback: complete
      });
    } else {
      program.defines = defines;
      program.transforms = transforms;
      program.compile(complete);
    }
  }));
  if (this.selection) {
    queue.defer((function(complete) {
      if (!selection_program) {
        selection_program = new GLProgram($__0.gl, shader_sources[$__0.vertex_shader_key], shader_sources['selection_fragment'], {
          defines: selection_defines,
          transforms: transforms,
          name: ($__0.name + ' (selection)'),
          callback: complete
        });
      } else {
        selection_program.defines = selection_defines;
        selection_program.transforms = transforms;
        selection_program.compile(complete);
      }
    }));
  }
  queue.await((function() {
    if (program) {
      $__0.gl_program = program;
    }
    if (selection_program) {
      $__0.selection_gl_program = selection_program;
    }
  }));
};
RenderMode.buildDefineList = function() {
  var defines = {};
  if (this.defines != null) {
    for (var d in this.defines) {
      defines[d] = this.defines[d];
    }
  }
  if (this.shaders != null && this.shaders.defines != null) {
    for (var d in this.shaders.defines) {
      defines[d] = this.shaders.defines[d];
    }
  }
  return defines;
};
RenderMode.setUniforms = function() {
  var gl_program = GLProgram.current;
  if (gl_program != null && this.shaders != null && this.shaders.uniforms != null) {
    gl_program.setUniforms(this.shaders.uniforms);
  }
};
RenderMode.update = function() {
  if (typeof this.animation == 'function') {
    this.animation();
  }
};
var Modes = {};
var ModeManager = {};
ModeManager.configureMode = function(name, settings) {
  Modes[name] = Modes[name] || Object.create(Modes[settings.extends] || RenderMode);
  if (Modes[settings.extends]) {
    Modes[name].parent = Modes[settings.extends];
  }
  for (var s in settings) {
    Modes[name][s] = settings[s];
  }
  Modes[name].name = name;
  return Modes[name];
};
Modes.polygons = Object.create(RenderMode);
Modes.polygons.name = 'polygons';
Modes.polygons.vertex_shader_key = 'polygon_vertex';
Modes.polygons.fragment_shader_key = 'polygon_fragment';
Modes.polygons.defines = {'WORLD_POSITION_WRAP': 100000};
Modes.polygons.selection = true;
Modes.polygons._init = function() {
  this.vertex_layout = new GLVertexLayout(this.gl, [{
    name: 'a_position',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_normal',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_color',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_selection_color',
    size: 4,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_layer',
    size: 1,
    type: this.gl.FLOAT,
    normalized: false
  }]);
};
Modes.polygons.buildPolygons = function(polygons, style, vertex_data) {
  var vertex_constants = [style.color[0], style.color[1], style.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num];
  if (style.outline.color) {
    var outline_vertex_constants = [style.outline.color[0], style.outline.color[1], style.outline.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num - 0.5];
  }
  if (style.extrude && style.height) {
    GLBuilders.buildExtrudedPolygons(polygons, style.z, style.height, style.min_height, vertex_data, {vertex_constants: vertex_constants});
  } else {
    GLBuilders.buildPolygons(polygons, style.z, vertex_data, {
      normals: true,
      vertex_constants: vertex_constants
    });
  }
  if (style.outline.color && style.outline.width) {
    for (var mpc = 0; mpc < polygons.length; mpc++) {
      GLBuilders.buildPolylines(polygons[mpc], style.z, style.outline.width, vertex_data, {
        closed_polygon: true,
        remove_tile_edges: true,
        vertex_constants: outline_vertex_constants
      });
    }
  }
};
Modes.polygons.buildLines = function(lines, style, vertex_data) {
  var vertex_constants = [style.color[0], style.color[1], style.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num];
  if (style.outline.color) {
    var outline_vertex_constants = [style.outline.color[0], style.outline.color[1], style.outline.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num - 0.5];
  }
  GLBuilders.buildPolylines(lines, style.z, style.width, vertex_data, {vertex_constants: vertex_constants});
  if (style.outline.color && style.outline.width) {
    GLBuilders.buildPolylines(lines, style.z, style.width + 2 * style.outline.width, vertex_data, {vertex_constants: outline_vertex_constants});
  }
};
Modes.polygons.buildPoints = function(points, style, vertex_data) {
  var vertex_constants = [style.color[0], style.color[1], style.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num];
  GLBuilders.buildQuadsForPoints(points, style.size * 2, style.size * 2, style.z, vertex_data, {
    normals: true,
    texcoords: false,
    vertex_constants: vertex_constants
  });
};
Modes.points = Object.create(RenderMode);
Modes.points.name = 'points';
Modes.points.vertex_shader_key = 'point_vertex';
Modes.points.fragment_shader_key = 'point_fragment';
Modes.points.defines = {'EFFECT_SCREEN_COLOR': true};
Modes.points.selection = true;
Modes.points._init = function() {
  this.vertex_layout = new GLVertexLayout(this.gl, [{
    name: 'a_position',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_texcoord',
    size: 2,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_color',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_selection_color',
    size: 4,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_layer',
    size: 1,
    type: this.gl.FLOAT,
    normalized: false
  }]);
};
Modes.points.buildPoints = function(points, style, vertex_data) {
  var vertex_constants = [style.color[0], style.color[1], style.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num];
  GLBuilders.buildQuadsForPoints(points, style.size * 2, style.size * 2, style.z, vertex_data, {
    normals: false,
    texcoords: true,
    vertex_constants: vertex_constants
  });
};
if (module !== undefined) {
  module.exports = {
    ModeManager: ModeManager,
    Modes: Modes
  };
}


},{"./gl.js":4,"./gl_builders.js":5,"./gl_geom.js":6,"./gl_program.js":8,"./gl_shaders.js":9,"./gl_vertex_layout.js":11,"queue-async":2}],8:[function(_dereq_,module,exports){
"use strict";
var GL = _dereq_('./gl.js');
var GLTexture = _dereq_('./gl_texture.js');
var Utils = _dereq_('../utils.js');
var Queue = _dereq_('queue-async');
GLProgram.id = 0;
GLProgram.programs = {};
function GLProgram(gl, vertex_shader, fragment_shader, options) {
  options = options || {};
  this.gl = gl;
  this.program = null;
  this.compiled = false;
  this.defines = options.defines || {};
  this.transforms = options.transforms;
  this.uniforms = {};
  this.attribs = {};
  this.vertex_shader = vertex_shader;
  this.fragment_shader = fragment_shader;
  this.id = GLProgram.id++;
  GLProgram.programs[this.id] = this;
  this.name = options.name;
  this.compile(options.callback);
}
;
GLProgram.prototype.use = function() {
  if (!this.compiled) {
    return;
  }
  if (GLProgram.current != this) {
    this.gl.useProgram(this.program);
  }
  GLProgram.current = this;
};
GLProgram.current = null;
GLProgram.defines = {};
GLProgram.prototype.compile = function(callback) {
  var $__0 = this;
  var queue = Queue();
  this.computed_vertex_shader = this.vertex_shader;
  this.computed_fragment_shader = this.fragment_shader;
  var defines = this.buildDefineList();
  var regexp;
  var loaded_transforms = {};
  if (this.transforms != null) {
    for (var key in this.transforms) {
      var transform = this.transforms[key];
      if (transform == null) {
        continue;
      }
      if (typeof transform == 'string' || (typeof transform == 'object' && transform.length == null)) {
        transform = [transform];
      }
      var regexp = new RegExp('^\\s*#pragma\\s+tangram:\\s+' + key + '\\s*$', 'm');
      var inject_vertex = this.computed_vertex_shader.match(regexp);
      var inject_fragment = this.computed_fragment_shader.match(regexp);
      if (inject_vertex == null && inject_fragment == null) {
        continue;
      }
      loaded_transforms[key] = {};
      loaded_transforms[key].regexp = new RegExp(regexp);
      loaded_transforms[key].inject_vertex = (inject_vertex != null);
      loaded_transforms[key].inject_fragment = (inject_fragment != null);
      loaded_transforms[key].list = [];
      for (var u = 0; u < transform.length; u++) {
        queue.defer(GLProgram.loadTransform, loaded_transforms, transform[u], key, u);
      }
      defines['TANGRAM_TRANSFORM_' + key.replace(' ', '_').toUpperCase()] = true;
    }
  }
  queue.await((function(error) {
    if (error) {
      console.log("error loading transforms: " + error);
      return;
    }
    for (var t in loaded_transforms) {
      var combined_source = "";
      for (var s = 0; s < loaded_transforms[t].list.length; s++) {
        combined_source += loaded_transforms[t].list[s] + '\n';
      }
      if (loaded_transforms[t].inject_vertex != null) {
        $__0.computed_vertex_shader = $__0.computed_vertex_shader.replace(loaded_transforms[t].regexp, combined_source);
      }
      if (loaded_transforms[t].inject_fragment != null) {
        $__0.computed_fragment_shader = $__0.computed_fragment_shader.replace(loaded_transforms[t].regexp, combined_source);
      }
    }
    var regexp = new RegExp('^\\s*#pragma\\s+tangram:\\s+\\w+\\s*$', 'gm');
    $__0.computed_vertex_shader = $__0.computed_vertex_shader.replace(regexp, '');
    $__0.computed_fragment_shader = $__0.computed_fragment_shader.replace(regexp, '');
    var define_str = GLProgram.buildDefineString(defines);
    $__0.computed_vertex_shader = define_str + $__0.computed_vertex_shader;
    $__0.computed_fragment_shader = define_str + $__0.computed_fragment_shader;
    var info = ($__0.name ? ($__0.name + ' / id ' + $__0.id) : ('id ' + $__0.id));
    $__0.computed_vertex_shader = '// Program: ' + info + '\n' + $__0.computed_vertex_shader;
    $__0.computed_fragment_shader = '// Program: ' + info + '\n' + $__0.computed_fragment_shader;
    try {
      $__0.program = GL.updateProgram($__0.gl, $__0.program, $__0.computed_vertex_shader, $__0.computed_fragment_shader);
      $__0.compiled = true;
    } catch (e) {
      $__0.program = null;
      $__0.compiled = false;
    }
    $__0.use();
    $__0.refreshUniforms();
    $__0.refreshAttributes();
    if (typeof callback == 'function') {
      callback();
    }
  }));
};
GLProgram.loadTransform = function(transforms, block, key, index, complete) {
  var type,
      value,
      source;
  if (typeof block == 'string') {
    transforms[key].list[index] = block;
    complete();
  } else if (typeof block == 'object' && block.url) {
    var req = new XMLHttpRequest();
    req.onload = function() {
      source = req.response;
      transforms[key].list[index] = source;
      complete();
    };
    req.open('GET', Utils.urlForPath(block.url) + '?' + (+new Date()), true);
    req.responseType = 'text';
    req.send();
  }
};
GLProgram.prototype.buildDefineList = function() {
  var defines = {};
  for (var d in GLProgram.defines) {
    defines[d] = GLProgram.defines[d];
  }
  for (var d in this.defines) {
    defines[d] = this.defines[d];
  }
  return defines;
};
GLProgram.buildDefineString = function(defines) {
  var define_str = "";
  for (var d in defines) {
    if (defines[d] == false) {
      continue;
    } else if (typeof defines[d] == 'boolean' && defines[d] == true) {
      define_str += "#define " + d + "\n";
    } else if (typeof defines[d] == 'number' && Math.floor(defines[d]) == defines[d]) {
      define_str += "#define " + d + " " + defines[d].toFixed(1) + "\n";
    } else {
      define_str += "#define " + d + " " + defines[d] + "\n";
    }
  }
  return define_str;
};
GLProgram.prototype.setUniforms = function(uniforms) {
  var texture_unit = 0;
  for (var u in uniforms) {
    var uniform = uniforms[u];
    if (typeof uniform == 'number') {
      this.uniform('1f', u, uniform);
    } else if (typeof uniform == 'object') {
      if (uniform.length >= 2 && uniform.length <= 4) {
        this.uniform(uniform.length + 'fv', u, uniform);
      } else if (uniform.length > 4) {
        this.uniform('1fv', u + '[0]', uniform);
      }
    } else if (typeof uniform == 'boolean') {
      this.uniform('1i', u, uniform);
    } else if (typeof uniform == 'string') {
      var texture = GLTexture.textures[uniform];
      if (texture == null) {
        texture = new GLTexture(this.gl, uniform);
        texture.load(uniform);
      }
      texture.bind(texture_unit);
      this.uniform('1i', u, texture_unit);
      texture_unit++;
    }
  }
};
GLProgram.prototype.uniform = function(method, name) {
  if (!this.compiled) {
    return;
  }
  var uniform = (this.uniforms[name] = this.uniforms[name] || {});
  uniform.name = name;
  uniform.location = uniform.location || this.gl.getUniformLocation(this.program, name);
  uniform.method = 'uniform' + method;
  uniform.values = Array.prototype.slice.call(arguments, 2);
  this.updateUniform(name);
};
GLProgram.prototype.updateUniform = function(name) {
  if (!this.compiled) {
    return;
  }
  var uniform = this.uniforms[name];
  if (uniform == null || uniform.location == null) {
    return;
  }
  this.use();
  this.gl[uniform.method].apply(this.gl, [uniform.location].concat(uniform.values));
};
GLProgram.prototype.refreshUniforms = function() {
  if (!this.compiled) {
    return;
  }
  for (var u in this.uniforms) {
    this.uniforms[u].location = this.gl.getUniformLocation(this.program, u);
    this.updateUniform(u);
  }
};
GLProgram.prototype.refreshAttributes = function() {
  this.attribs = {};
};
GLProgram.prototype.attribute = function(name) {
  if (!this.compiled) {
    return;
  }
  var attrib = (this.attribs[name] = this.attribs[name] || {});
  if (attrib.location != null) {
    return attrib;
  }
  attrib.name = name;
  attrib.location = this.gl.getAttribLocation(this.program, name);
  return attrib;
};
if (module !== undefined) {
  module.exports = GLProgram;
}


},{"../utils.js":17,"./gl.js":4,"./gl_texture.js":10,"queue-async":2}],9:[function(_dereq_,module,exports){
"use strict";
var shader_sources = {};
shader_sources['point_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "varying vec3 v_color;\n" + "varying vec2 v_texcoord;\n" + "void main(void) {\n" + "  vec3 color = v_color;\n" + "  vec3 lighting = vec3(1.);\n" + "  float len = length(v_texcoord);\n" + "  if(len > 1.) {\n" + "    discard;\n" + "  }\n" + "  color *= (1. - smoothstep(.25, 1., len)) + 0.5;\n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.);\n" + "}\n" + "";
shader_sources['point_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform mat4 u_tile_view;\n" + "uniform mat4 u_meter_view;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec2 a_texcoord;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec3 v_color;\n" + "varying vec2 v_texcoord;\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "attribute vec4 a_selection_color;\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "float a_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" + "  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" + "  float z_layer = (layer + 1.) * z_layer_scale;\n" + "  z = z_layer + clamp(z, 0., z_layer_scale);\n" + "  z = (z_layer_range - z) / z_layer_range;\n" + "  return z;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main() {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  if(a_selection_color.xyz == vec3(0.)) {\n" + "    gl_Position = vec4(0.);\n" + "    return;\n" + "  }\n" + "  v_selection_color = a_selection_color;\n" + "  #endif\n" + "  vec4 position = u_meter_view * u_tile_view * vec4(a_position, 1.);\n" + "  #pragma tangram: vertex\n" + "  v_color = a_color;\n" + "  v_texcoord = a_texcoord;\n" + "  position.z = a_x_calculateZ(position.z, a_layer, u_num_layers, 256.);\n" + "  gl_Position = position;\n" + "}\n" + "";
shader_sources['polygon_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "uniform vec2 u_aspect;\n" + "uniform mat4 u_meter_view;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_time;\n" + "uniform float u_map_zoom;\n" + "uniform vec2 u_map_center;\n" + "uniform vec2 u_tile_origin;\n" + "uniform float u_test;\n" + "uniform float u_test2;\n" + "varying vec3 v_color;\n" + "varying vec4 v_world_position;\n" + "#if defined(WORLD_POSITION_WRAP)\n" + "\n" + "vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" + "vec4 absoluteWorldPosition() {\n" + "  return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" + "}\n" + "#else\n" + "\n" + "vec4 absoluteWorldPosition() {\n" + "  return v_world_position;\n" + "}\n" + "#endif\n" + "\n" + "#if defined(LIGHTING_ENVIRONMENT)\n" + "\n" + "uniform sampler2D u_env_map;\n" + "#endif\n" + "\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#else\n" + "\n" + "varying vec3 v_lighting;\n" + "#endif\n" + "\n" + "const float light_ambient = 0.5;\n" + "vec3 b_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 c_x_specularLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  vec3 view_pos = vec3(0., 0., 500.);\n" + "  vec3 view_dir = normalize(position.xyz - view_pos.xyz);\n" + "  vec3 specularReflection;\n" + "  if(dot(normal, -light_dir) < 0.0) {\n" + "    specularReflection = vec3(0.0, 0.0, 0.0);\n" + "  } else {\n" + "    float attenuation = 1.0;\n" + "    float lightSpecularTerm = 1.0;\n" + "    float materialSpecularTerm = 10.0;\n" + "    float materialShininessTerm = 10.0;\n" + "    specularReflection = attenuation * vec3(lightSpecularTerm) * vec3(materialSpecularTerm) * pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);\n" + "  }\n" + "  float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));\n" + "  color *= diffuse + specularReflection + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 d_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" + "  light_dir = normalize(light_dir);\n" + "  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 a_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" + "  \n" + "  #if defined(LIGHTING_POINT)\n" + "  color = b_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_POINT_SPECULAR)\n" + "  color = c_x_specularLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_NIGHT)\n" + "  color = b_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" + "  #elif defined(LIGHTING_DIRECTION)\n" + "  color = d_x_directionalLight(normal, color, light_dir, light_ambient);\n" + "  #else\n" + "  color = color;\n" + "  #endif\n" + "  return color;\n" + "}\n" + "vec4 e_x_sphericalEnvironmentMap(vec3 view_pos, vec3 position, vec3 normal, sampler2D envmap) {\n" + "  vec3 eye = normalize(position.xyz - view_pos.xyz);\n" + "  if(eye.z > 0.01) {\n" + "    eye.z = 0.01;\n" + "  }\n" + "  vec3 r = reflect(eye, normal);\n" + "  float m = 2. * sqrt(pow(r.x, 2.) + pow(r.y, 2.) + pow(r.z + 1., 2.));\n" + "  vec2 uv = r.xy / m + .5;\n" + "  return texture2D(envmap, uv);\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main(void) {\n" + "  vec3 color = v_color;\n" + "  #if defined(LIGHTING_ENVIRONMENT)\n" + "  vec3 view_pos = vec3(0., 0., 100. * u_meters_per_pixel);\n" + "  color = e_x_sphericalEnvironmentMap(view_pos, v_position.xyz, v_normal, u_env_map).rgb;\n" + "  #endif\n" + "  \n" + "  #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" + "  vec3 lighting = a_x_lighting(v_position, v_normal, vec3(1.), vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" + "  #else\n" + "  vec3 lighting = v_lighting;\n" + "  #endif\n" + "  vec3 color_prelight = color;\n" + "  color *= lighting;\n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.0);\n" + "}\n" + "";
shader_sources['polygon_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "uniform vec2 u_aspect;\n" + "uniform float u_time;\n" + "uniform float u_map_zoom;\n" + "uniform vec2 u_map_center;\n" + "uniform vec2 u_tile_origin;\n" + "uniform mat4 u_tile_world;\n" + "uniform mat4 u_tile_view;\n" + "uniform mat4 u_meter_view;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec3 a_normal;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec4 v_world_position;\n" + "varying vec3 v_color;\n" + "#if defined(WORLD_POSITION_WRAP)\n" + "\n" + "vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" + "vec4 absoluteWorldPosition() {\n" + "  return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" + "}\n" + "#else\n" + "\n" + "vec4 absoluteWorldPosition() {\n" + "  return v_world_position;\n" + "}\n" + "#endif\n" + "\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "attribute vec4 a_selection_color;\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#else\n" + "\n" + "varying vec3 v_lighting;\n" + "#endif\n" + "\n" + "const float light_ambient = 0.5;\n" + "vec4 a_x_perspective(vec4 position, const vec2 perspective_offset, const vec2 perspective_factor) {\n" + "  position.xy += position.z * perspective_factor * (position.xy - perspective_offset);\n" + "  return position;\n" + "}\n" + "vec4 b_x_isometric(vec4 position, const vec2 axis, const float multiplier) {\n" + "  position.xy += position.z * axis * multiplier / u_aspect;\n" + "  return position;\n" + "}\n" + "float c_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" + "  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" + "  float z_layer = (layer + 1.) * z_layer_scale;\n" + "  z = z_layer + clamp(z, 0., z_layer_scale);\n" + "  z = (z_layer_range - z) / z_layer_range;\n" + "  return z;\n" + "}\n" + "vec3 e_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 f_x_specularLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  vec3 view_pos = vec3(0., 0., 500.);\n" + "  vec3 view_dir = normalize(position.xyz - view_pos.xyz);\n" + "  vec3 specularReflection;\n" + "  if(dot(normal, -light_dir) < 0.0) {\n" + "    specularReflection = vec3(0.0, 0.0, 0.0);\n" + "  } else {\n" + "    float attenuation = 1.0;\n" + "    float lightSpecularTerm = 1.0;\n" + "    float materialSpecularTerm = 10.0;\n" + "    float materialShininessTerm = 10.0;\n" + "    specularReflection = attenuation * vec3(lightSpecularTerm) * vec3(materialSpecularTerm) * pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);\n" + "  }\n" + "  float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));\n" + "  color *= diffuse + specularReflection + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 g_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" + "  light_dir = normalize(light_dir);\n" + "  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 d_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" + "  \n" + "  #if defined(LIGHTING_POINT)\n" + "  color = e_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_POINT_SPECULAR)\n" + "  color = f_x_specularLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_NIGHT)\n" + "  color = e_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" + "  #elif defined(LIGHTING_DIRECTION)\n" + "  color = g_x_directionalLight(normal, color, light_dir, light_ambient);\n" + "  #else\n" + "  color = color;\n" + "  #endif\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main() {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  if(a_selection_color.xyz == vec3(0.)) {\n" + "    gl_Position = vec4(0.);\n" + "    return;\n" + "  }\n" + "  v_selection_color = a_selection_color;\n" + "  #endif\n" + "  vec4 position = u_tile_view * vec4(a_position, 1.);\n" + "  v_world_position = u_tile_world * vec4(a_position, 1.);\n" + "  #if defined(WORLD_POSITION_WRAP)\n" + "  v_world_position.xy -= world_position_anchor;\n" + "  #endif\n" + "  \n" + "  #pragma tangram: vertex\n" + "  \n" + "  #if defined(LIGHTING_VERTEX)\n" + "  v_color = a_color;\n" + "  v_lighting = d_x_lighting(position, a_normal, vec3(1.), vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" + "  #else\n" + "  v_position = position;\n" + "  v_normal = a_normal;\n" + "  v_color = a_color;\n" + "  #endif\n" + "  position = u_meter_view * position;\n" + "  #if defined(PROJECTION_PERSPECTIVE)\n" + "  position = a_x_perspective(position, vec2(0., 0.), vec2(0.6, 0.6));\n" + "  #elif defined(PROJECTION_ISOMETRIC) // || defined(PROJECTION_POPUP)\n" + "  position = b_x_isometric(position, vec2(0., 1.), 1.);\n" + "  #endif\n" + "  position.z = c_x_calculateZ(position.z, a_layer, u_num_layers, 4096.);\n" + "  gl_Position = position;\n" + "}\n" + "";
shader_sources['selection_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "void main(void) {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  gl_FragColor = v_selection_color;\n" + "  #else\n" + "  gl_FragColor = vec3(0., 0., 0., 1.);\n" + "  #endif\n" + "  \n" + "}\n" + "";
shader_sources['simple_polygon_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform float u_meters_per_pixel;\n" + "varying vec3 v_color;\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#endif\n" + "\n" + "vec3 a_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main(void) {\n" + "  vec3 color;\n" + "  #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" + "  vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.);\n" + "  const float light_ambient = 0.5;\n" + "  const bool backlit = true;\n" + "  color = a_x_pointLight(v_position, v_normal, v_color, light_pos, light_ambient, backlit);\n" + "  #else\n" + "  color = v_color;\n" + "  #endif\n" + "  \n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.0);\n" + "}\n" + "";
shader_sources['simple_polygon_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_aspect;\n" + "uniform mat4 u_tile_view;\n" + "uniform mat4 u_meter_view;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec3 a_normal;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec3 v_color;\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#endif\n" + "\n" + "vec4 a_x_perspective(vec4 position, const vec2 perspective_offset, const vec2 perspective_factor) {\n" + "  position.xy += position.z * perspective_factor * (position.xy - perspective_offset);\n" + "  return position;\n" + "}\n" + "vec4 b_x_isometric(vec4 position, const vec2 axis, const float multiplier) {\n" + "  position.xy += position.z * axis * multiplier / u_aspect;\n" + "  return position;\n" + "}\n" + "float c_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" + "  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" + "  float z_layer = (layer + 1.) * z_layer_scale;\n" + "  z = z_layer + clamp(z, 0., z_layer_scale);\n" + "  z = (z_layer_range - z) / z_layer_range;\n" + "  return z;\n" + "}\n" + "vec3 d_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main() {\n" + "  vec4 position = u_tile_view * vec4(a_position, 1.);\n" + "  #pragma tangram: vertex\n" + "  \n" + "  #if defined(LIGHTING_VERTEX)\n" + "  vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.);\n" + "  const float light_ambient = 0.5;\n" + "  const bool backlit = true;\n" + "  v_color = d_x_pointLight(position, a_normal, a_color, light_pos, light_ambient, backlit);\n" + "  #else\n" + "  v_position = position;\n" + "  v_normal = a_normal;\n" + "  v_color = a_color;\n" + "  #endif\n" + "  position = u_meter_view * position;\n" + "  #if defined(PROJECTION_PERSPECTIVE)\n" + "  position = a_x_perspective(position, vec2(-0.25, -0.25), vec2(0.6, 0.6));\n" + "  #elif defined(PROJECTION_ISOMETRIC)\n" + "  position = b_x_isometric(position, vec2(0., 1.), 1.);\n" + "  #endif\n" + "  position.z = c_x_calculateZ(position.z, a_layer, u_num_layers, 4096.);\n" + "  gl_Position = position;\n" + "}\n" + "";
if (module.exports !== undefined) {
  module.exports = shader_sources;
}


},{}],10:[function(_dereq_,module,exports){
"use strict";
var GL = _dereq_('./gl.js');
var Utils = _dereq_('../utils.js');
GLTexture.textures = {};
function GLTexture(gl, name, options) {
  options = options || {};
  this.gl = gl;
  this.texture = gl.createTexture();
  this.bind(0);
  this.image = null;
  this.setData(1, 1, new Uint8Array([0, 0, 0, 255]), {filtering: 'nearest'});
  this.name = name;
  GLTexture.textures[this.name] = this;
}
;
GLTexture.prototype.bind = function(unit) {
  this.gl.activeTexture(this.gl.TEXTURE0 + unit);
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
};
GLTexture.prototype.load = function(url, options) {
  var $__0 = this;
  options = options || {};
  this.image = new Image();
  this.image.onload = (function() {
    $__0.width = $__0.image.width;
    $__0.height = $__0.image.height;
    $__0.data = null;
    $__0.update(options);
    $__0.setTextureFiltering(options);
  });
  this.image.src = url;
};
GLTexture.prototype.setData = function(width, height, data, options) {
  this.width = width;
  this.height = height;
  this.data = data;
  this.image = null;
  this.update(options);
  this.setTextureFiltering(options);
};
GLTexture.prototype.update = function(options) {
  options = options || {};
  this.bind(0);
  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, (options.UNPACK_FLIP_Y_WEBGL === false ? false : true));
  if (this.image && this.image.complete) {
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
  } else if (this.width && this.height) {
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.data);
  }
};
GLTexture.prototype.setTextureFiltering = function(options) {
  options = options || {};
  options.filtering = options.filtering || 'mipmap';
  var gl = this.gl;
  if (Utils.isPowerOf2(this.width) && Utils.isPowerOf2(this.height)) {
    this.power_of_2 = true;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.TEXTURE_WRAP_S || gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.TEXTURE_WRAP_T || gl.CLAMP_TO_EDGE);
    if (options.filtering == 'mipmap') {
      this.filtering = 'mipmap';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    } else if (options.filtering == 'linear') {
      this.filtering = 'linear';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    } else if (options.filtering == 'nearest') {
      this.filtering = 'nearest';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
  } else {
    this.power_of_2 = false;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (options.filtering == 'nearest') {
      this.filtering = 'nearest';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    } else {
      this.filtering = 'linear';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
  }
};
if (module !== undefined) {
  module.exports = GLTexture;
}


},{"../utils.js":17,"./gl.js":4}],11:[function(_dereq_,module,exports){
"use strict";
function GLVertexLayout(gl, attribs) {
  this.attribs = attribs;
  this.stride = 0;
  for (var a = 0; a < this.attribs.length; a++) {
    var attrib = this.attribs[a];
    attrib.byte_size = attrib.size;
    switch (attrib.type) {
      case gl.FLOAT:
      case gl.INT:
      case gl.UNSIGNED_INT:
        attrib.byte_size *= 4;
        break;
      case gl.SHORT:
      case gl.UNSIGNED_SHORT:
        attrib.byte_size *= 2;
        break;
    }
    attrib.offset = this.stride;
    this.stride += attrib.byte_size;
  }
}
GLVertexLayout.enabled_attribs = {};
GLVertexLayout.prototype.enable = function(gl, gl_program) {
  for (var a = 0; a < this.attribs.length; a++) {
    var attrib = this.attribs[a];
    var location = gl_program.attribute(attrib.name).location;
    if (location != -1) {
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, attrib.size, attrib.type, attrib.normalized, this.stride, attrib.offset);
      GLVertexLayout.enabled_attribs[location] = gl_program;
    }
  }
  var unusued_attribs = [];
  for (location in GLVertexLayout.enabled_attribs) {
    if (GLVertexLayout.enabled_attribs[location] != gl_program) {
      gl.disableVertexAttribArray(location);
      unusued_attribs.push(location);
    }
  }
  for (location in unusued_attribs) {
    delete GLVertexLayout.enabled_attribs[location];
  }
};
if (module !== undefined) {
  module.exports = GLVertexLayout;
}


},{}],12:[function(_dereq_,module,exports){
"use strict";
var Scene = _dereq_('./scene.js');
var LeafletLayer = L.GridLayer.extend({
  initialize: function(options) {
    L.setOptions(this, options);
    this.scene = new Scene(this.options.vectorTileSource, this.options.vectorLayers, this.options.vectorStyles, {num_workers: this.options.numWorkers});
    this.scene.debug = this.options.debug;
    this.scene.continuous_animation = false;
  },
  onAdd: function(map) {
    var layer = this;
    layer.on('tileunload', function(event) {
      var tile = event.tile;
      var key = tile.getAttribute('data-tile-key');
      layer.scene.removeTile(key);
    });
    layer._map.on('resize', function() {
      var size = layer._map.getSize();
      layer.scene.resizeMap(size.x, size.y);
      layer.updateBounds();
    });
    layer._map.on('move', function() {
      var center = layer._map.getCenter();
      layer.scene.setCenter(center.lng, center.lat);
      layer.updateBounds();
    });
    layer._map.on('zoomstart', function() {
      console.log("map.zoomstart " + layer._map.getZoom());
      layer.scene.startZoom();
    });
    layer._map.on('zoomend', function() {
      console.log("map.zoomend " + layer._map.getZoom());
      layer.scene.setZoom(layer._map.getZoom());
      layer.updateBounds();
    });
    layer._map.on('dragstart', function() {
      layer.scene.panning = true;
    });
    layer._map.on('dragend', function() {
      layer.scene.panning = false;
    });
    layer.scene.container = layer._map.getContainer();
    var center = layer._map.getCenter();
    layer.scene.setCenter(center.lng, center.lat);
    console.log("zoom: " + layer._map.getZoom());
    layer.scene.setZoom(layer._map.getZoom());
    layer.updateBounds();
    L.GridLayer.prototype.onAdd.apply(this, arguments);
    layer.scene.init(function() {
      layer.fire('init');
    });
  },
  onRemove: function(map) {
    L.GridLayer.prototype.onRemove.apply(this, arguments);
  },
  createTile: function(coords, done) {
    var div = document.createElement('div');
    this.scene.loadTile(coords, div, done);
    return div;
  },
  updateBounds: function() {
    var layer = this;
    var bounds = layer._map.getBounds();
    layer.scene.setBounds(bounds.getSouthWest(), bounds.getNorthEast());
  },
  render: function() {
    this.scene.render();
  }
});
var leafletLayer = function(options) {
  return new LeafletLayer(options);
};
if (module !== undefined) {
  module.exports = {
    LeafletLayer: LeafletLayer,
    leafletLayer: leafletLayer
  };
}


},{"./scene.js":15}],13:[function(_dereq_,module,exports){
"use strict";
var Leaflet = _dereq_('./leaflet_layer.js');
var GL = _dereq_('./gl/gl.js');
GL.Program = _dereq_('./gl/gl_program.js');
GL.Texture = _dereq_('./gl/gl_texture.js');
if (module !== undefined) {
  module.exports = {
    LeafletLayer: Leaflet.LeafletLayer,
    leafletLayer: Leaflet.leafletLayer,
    GL: GL
  };
}


},{"./gl/gl.js":4,"./gl/gl_program.js":8,"./gl/gl_texture.js":10,"./leaflet_layer.js":12}],14:[function(_dereq_,module,exports){
"use strict";
function Point(x, y) {
  return {
    x: x,
    y: y
  };
}
Point.copy = function(p) {
  if (p == null) {
    return null;
  }
  return {
    x: p.x,
    y: p.y
  };
};
if (module !== undefined) {
  module.exports = Point;
}


},{}],15:[function(_dereq_,module,exports){
"use strict";
var Point = _dereq_('./point.js');
var Geo = _dereq_('./geo.js');
var Style = _dereq_('./style.js');
var ModeManager = _dereq_('./gl/gl_modes').ModeManager;
var Utils = _dereq_('./utils.js');
var Queue = _dereq_('queue-async');
var GL = _dereq_('./gl/gl.js');
var GLProgram = _dereq_('./gl/gl_program.js');
var GLBuilders = _dereq_('./gl/gl_builders.js');
var GLTexture = _dereq_('./gl/gl_texture.js');
var mat4 = _dereq_('gl-matrix').mat4;
var vec3 = _dereq_('gl-matrix').vec3;
var yaml;
Utils.runIfInMainThread(function() {
  try {
    yaml = _dereq_('js-yaml');
  } catch (e) {
    console.log("no YAML support, js-yaml module not found");
  }
  findBaseLibraryURL();
});
Scene.tile_scale = 4096;
Geo.setTileScale(Scene.tile_scale);
GLBuilders.setTileScale(Scene.tile_scale);
GLProgram.defines.TILE_SCALE = Scene.tile_scale;
Scene.debug = false;
function Scene(tile_source, layers, styles, options) {
  var options = options || {};
  this.initialized = false;
  this.tile_source = tile_source;
  this.tiles = {};
  this.queued_tiles = [];
  this.num_workers = options.num_workers || 1;
  this.allow_cross_domain_workers = (options.allow_cross_domain_workers === false ? false : true);
  this.layers = layers;
  this.styles = styles;
  this.dirty = true;
  this.animated = false;
  this.frame = 0;
  this.zoom = null;
  this.center = null;
  this.device_pixel_ratio = window.devicePixelRatio || 1;
  this.zooming = false;
  this.panning = false;
  this.container = options.container;
  this.resetTime();
}
Scene.prototype.init = function(callback) {
  var $__0 = this;
  if (this.initialized) {
    return;
  }
  this.loadScene((function() {
    var queue = Queue();
    queue.defer((function(complete) {
      $__0.modes = Scene.createModes($__0.styles);
      $__0.updateActiveModes();
      complete();
    }));
    queue.defer((function(complete) {
      $__0.createWorkers(complete);
    }));
    queue.await((function() {
      $__0.container = $__0.container || document.body;
      $__0.canvas = document.createElement('canvas');
      $__0.canvas.style.position = 'absolute';
      $__0.canvas.style.top = 0;
      $__0.canvas.style.left = 0;
      $__0.canvas.style.zIndex = -1;
      $__0.container.appendChild($__0.canvas);
      $__0.gl = GL.getContext($__0.canvas);
      $__0.resizeMap($__0.container.clientWidth, $__0.container.clientHeight);
      $__0.initModes();
      $__0.initSelectionBuffer();
      $__0.last_render_count = null;
      $__0.initInputHandlers();
      $__0.initialized = true;
      if (typeof callback == 'function') {
        callback();
      }
    }));
  }));
};
Scene.prototype.initModes = function() {
  for (var m in this.modes) {
    this.modes[m].init(this.gl);
  }
};
Scene.prototype.initSelectionBuffer = function() {
  this.pixel = new Uint8Array(4);
  this.pixel32 = new Float32Array(this.pixel.buffer);
  this.selection_point = Point(0, 0);
  this.selected_feature = null;
  this.selection_callback = null;
  this.selection_callback_timer = null;
  this.selection_frame_delay = 5;
  this.update_selection = false;
  this.fbo = this.gl.createFramebuffer();
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
  this.fbo_size = {
    width: 256,
    height: 256
  };
  this.gl.viewport(0, 0, this.fbo_size.width, this.fbo_size.height);
  this.fbo_texture = new GLTexture(this.gl, 'selection_fbo');
  this.fbo_texture.setData(this.fbo_size.width, this.fbo_size.height, null, {filtering: 'nearest'});
  this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.fbo_texture.texture, 0);
  this.fbo_depth_rb = this.gl.createRenderbuffer();
  this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.fbo_depth_rb);
  this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.fbo_size.width, this.fbo_size.height);
  this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.fbo_depth_rb);
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
};
Scene.prototype.createWorkers = function(callback) {
  var $__0 = this;
  var queue = Queue();
  var worker_url = Scene.library_base_url + 'tangram-worker.min.js' + '?' + (+new Date());
  queue.defer((function(complete) {
    var createObjectURL = (window.URL && window.URL.createObjectURL) || (window.webkitURL && window.webkitURL.createObjectURL);
    if (createObjectURL && $__0.allow_cross_domain_workers) {
      var req = new XMLHttpRequest();
      req.onload = (function() {
        var worker_local_url = createObjectURL(new Blob([req.response], {type: 'application/javascript'}));
        $__0.makeWorkers(worker_local_url);
        complete();
      });
      req.open('GET', worker_url, true);
      req.responseType = 'text';
      req.send();
    } else {
      console.log($__0);
      $__0.makeWorkers(worker_url);
      complete();
    }
  }));
  queue.await((function() {
    $__0.workers.forEach((function(worker) {
      worker.addEventListener('message', $__0.workerBuildTileCompleted.bind($__0));
      worker.addEventListener('message', $__0.workerGetFeatureSelection.bind($__0));
      worker.addEventListener('message', $__0.workerLogMessage.bind($__0));
    }));
    $__0.next_worker = 0;
    $__0.selection_map_worker_size = {};
    if (typeof callback == 'function') {
      callback();
    }
  }));
};
Scene.prototype.makeWorkers = function(url) {
  this.workers = [];
  for (var w = 0; w < this.num_workers; w++) {
    this.workers.push(new Worker(url));
    this.workers[w].postMessage({
      type: 'init',
      worker_id: w,
      num_workers: this.num_workers
    });
  }
};
Scene.prototype.workerPostMessageForTile = function(tile, message) {
  if (tile.worker == null) {
    tile.worker = this.next_worker;
    this.next_worker = (tile.worker + 1) % this.workers.length;
  }
  this.workers[tile.worker].postMessage(message);
};
Scene.prototype.setCenter = function(lng, lat) {
  this.center = {
    lng: lng,
    lat: lat
  };
  this.dirty = true;
};
Scene.prototype.startZoom = function() {
  this.last_zoom = this.zoom;
  this.zooming = true;
};
Scene.prototype.preserve_tiles_within_zoom = 2;
Scene.prototype.setZoom = function(zoom) {
  var below = zoom;
  var above = zoom;
  if (this.last_zoom != null) {
    console.log("scene.last_zoom: " + this.last_zoom);
    if (Math.abs(zoom - this.last_zoom) <= this.preserve_tiles_within_zoom) {
      if (zoom > this.last_zoom) {
        below = zoom - this.preserve_tiles_within_zoom;
      } else {
        above = zoom + this.preserve_tiles_within_zoom;
      }
    }
  }
  this.last_zoom = this.zoom;
  this.zoom = zoom;
  this.capped_zoom = Math.min(~~this.zoom, this.tile_source.max_zoom || ~~this.zoom);
  this.zooming = false;
  this.removeTilesOutsideZoomRange(below, above);
  this.dirty = true;
};
Scene.prototype.removeTilesOutsideZoomRange = function(below, above) {
  below = Math.min(below, this.tile_source.max_zoom || below);
  above = Math.min(above, this.tile_source.max_zoom || above);
  console.log("removeTilesOutsideZoomRange [" + below + ", " + above + "])");
  var remove_tiles = [];
  for (var t in this.tiles) {
    var tile = this.tiles[t];
    if (tile.coords.z < below || tile.coords.z > above) {
      remove_tiles.push(t);
    }
  }
  for (var r = 0; r < remove_tiles.length; r++) {
    var key = remove_tiles[r];
    console.log("removed " + key + " (outside range [" + below + ", " + above + "])");
    this.removeTile(key);
  }
};
Scene.prototype.setBounds = function(sw, ne) {
  this.bounds = {
    sw: {
      lng: sw.lng,
      lat: sw.lat
    },
    ne: {
      lng: ne.lng,
      lat: ne.lat
    }
  };
  var buffer = 200 * Geo.meters_per_pixel[~~this.zoom];
  this.buffered_meter_bounds = {
    sw: Geo.latLngToMeters(Point(this.bounds.sw.lng, this.bounds.sw.lat)),
    ne: Geo.latLngToMeters(Point(this.bounds.ne.lng, this.bounds.ne.lat))
  };
  this.buffered_meter_bounds.sw.x -= buffer;
  this.buffered_meter_bounds.sw.y -= buffer;
  this.buffered_meter_bounds.ne.x += buffer;
  this.buffered_meter_bounds.ne.y += buffer;
  this.center_meters = Point((this.buffered_meter_bounds.sw.x + this.buffered_meter_bounds.ne.x) / 2, (this.buffered_meter_bounds.sw.y + this.buffered_meter_bounds.ne.y) / 2);
  for (var t in this.tiles) {
    this.updateVisibilityForTile(this.tiles[t]);
  }
  this.dirty = true;
};
Scene.prototype.isTileInZoom = function(tile) {
  return (Math.min(tile.coords.z, this.tile_source.max_zoom || tile.coords.z) == this.capped_zoom);
};
Scene.prototype.updateVisibilityForTile = function(tile) {
  var visible = tile.visible;
  tile.visible = this.isTileInZoom(tile) && Geo.boxIntersect(tile.bounds, this.buffered_meter_bounds);
  tile.center_dist = Math.abs(this.center_meters.x - tile.min.x) + Math.abs(this.center_meters.y - tile.min.y);
  return (visible != tile.visible);
};
Scene.prototype.resizeMap = function(width, height) {
  this.dirty = true;
  this.css_size = {
    width: width,
    height: height
  };
  this.device_size = {
    width: Math.round(this.css_size.width * this.device_pixel_ratio),
    height: Math.round(this.css_size.height * this.device_pixel_ratio)
  };
  this.canvas.style.width = this.css_size.width + 'px';
  this.canvas.style.height = this.css_size.height + 'px';
  this.canvas.width = this.device_size.width;
  this.canvas.height = this.device_size.height;
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
};
Scene.prototype.requestRedraw = function() {
  this.dirty = true;
};
Scene.calculateZ = function(layer, tile, layer_offset, feature_offset) {
  var z = 0;
  return z;
};
Scene.prototype.render = function() {
  this.loadQueuedTiles();
  if (this.dirty == false || this.initialized == false) {
    return false;
  }
  this.dirty = false;
  this.renderGL();
  if (this.animated == true) {
    this.dirty = true;
  }
  this.frame++;
  return true;
};
Scene.prototype.resetFrame = function() {
  if (!this.initialized) {
    return;
  }
  var gl = this.gl;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
};
Scene.prototype.renderGL = function() {
  var gl = this.gl;
  this.input();
  this.resetFrame();
  var center = Geo.latLngToMeters(Point(this.center.lng, this.center.lat));
  var meters_per_pixel = Geo.min_zoom_meters_per_pixel / Math.pow(2, this.zoom);
  var meter_zoom = Point(this.css_size.width / 2 * meters_per_pixel, this.css_size.height / 2 * meters_per_pixel);
  var tile_view_mat = mat4.create();
  var tile_world_mat = mat4.create();
  var meter_view_mat = mat4.create();
  mat4.scale(meter_view_mat, meter_view_mat, vec3.fromValues(1 / meter_zoom.x, 1 / meter_zoom.y, 1 / meter_zoom.y));
  var renderable_tiles = [];
  for (var t in this.tiles) {
    var tile = this.tiles[t];
    if (tile.loaded == true && tile.visible == true) {
      renderable_tiles.push(tile);
    }
  }
  this.renderable_tiles_count = renderable_tiles.length;
  var render_count = 0;
  for (var mode in this.modes) {
    this.modes[mode].update();
    var gl_program = this.modes[mode].gl_program;
    if (gl_program == null || gl_program.compiled == false) {
      continue;
    }
    var first_for_mode = true;
    for (var t in renderable_tiles) {
      var tile = renderable_tiles[t];
      if (tile.gl_geometry[mode] != null) {
        if (first_for_mode == true) {
          first_for_mode = false;
          gl_program.use();
          this.modes[mode].setUniforms();
          gl_program.uniform('2f', 'u_resolution', this.device_size.width, this.device_size.height);
          gl_program.uniform('2f', 'u_aspect', this.device_size.width / this.device_size.height, 1.0);
          gl_program.uniform('1f', 'u_time', ((+new Date()) - this.start_time) / 1000);
          gl_program.uniform('1f', 'u_map_zoom', this.zoom);
          gl_program.uniform('2f', 'u_map_center', center.x, center.y);
          gl_program.uniform('1f', 'u_num_layers', this.layers.length);
          gl_program.uniform('1f', 'u_meters_per_pixel', meters_per_pixel);
          gl_program.uniform('Matrix4fv', 'u_meter_view', false, meter_view_mat);
        }
        gl_program.uniform('2f', 'u_tile_origin', tile.min.x, tile.min.y);
        mat4.identity(tile_view_mat);
        mat4.translate(tile_view_mat, tile_view_mat, vec3.fromValues(tile.min.x - center.x, tile.min.y - center.y, 0));
        mat4.scale(tile_view_mat, tile_view_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1));
        gl_program.uniform('Matrix4fv', 'u_tile_view', false, tile_view_mat);
        mat4.identity(tile_world_mat);
        mat4.translate(tile_world_mat, tile_world_mat, vec3.fromValues(tile.min.x, tile.min.y, 0));
        mat4.scale(tile_world_mat, tile_world_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1));
        gl_program.uniform('Matrix4fv', 'u_tile_world', false, tile_world_mat);
        tile.gl_geometry[mode].render();
        render_count += tile.gl_geometry[mode].geometry_count;
      }
    }
  }
  if (this.update_selection) {
    this.update_selection = false;
    if (this.panning) {
      return;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.fbo_size.width, this.fbo_size.height);
    this.resetFrame();
    for (mode in this.modes) {
      gl_program = this.modes[mode].selection_gl_program;
      if (gl_program == null || gl_program.compiled == false) {
        continue;
      }
      first_for_mode = true;
      for (t in renderable_tiles) {
        tile = renderable_tiles[t];
        if (tile.gl_geometry[mode] != null) {
          if (first_for_mode == true) {
            first_for_mode = false;
            gl_program.use();
            this.modes[mode].setUniforms();
            gl_program.uniform('2f', 'u_resolution', this.fbo_size.width, this.fbo_size.height);
            gl_program.uniform('2f', 'u_aspect', this.fbo_size.width / this.fbo_size.height, 1.0);
            gl_program.uniform('1f', 'u_time', ((+new Date()) - this.start_time) / 1000);
            gl_program.uniform('1f', 'u_map_zoom', this.zoom);
            gl_program.uniform('2f', 'u_map_center', center.x, center.y);
            gl_program.uniform('1f', 'u_num_layers', this.layers.length);
            gl_program.uniform('1f', 'u_meters_per_pixel', meters_per_pixel);
            gl_program.uniform('Matrix4fv', 'u_meter_view', false, meter_view_mat);
          }
          gl_program.uniform('2f', 'u_tile_origin', tile.min.x, tile.min.y);
          mat4.identity(tile_view_mat);
          mat4.translate(tile_view_mat, tile_view_mat, vec3.fromValues(tile.min.x - center.x, tile.min.y - center.y, 0));
          mat4.scale(tile_view_mat, tile_view_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1));
          gl_program.uniform('Matrix4fv', 'u_tile_view', false, tile_view_mat);
          mat4.identity(tile_world_mat);
          mat4.translate(tile_world_mat, tile_world_mat, vec3.fromValues(tile.min.x, tile.min.y, 0));
          mat4.scale(tile_world_mat, tile_world_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1));
          gl_program.uniform('Matrix4fv', 'u_tile_world', false, tile_world_mat);
          tile.gl_geometry[mode].render();
        }
      }
    }
    if (this.selection_callback_timer != null) {
      clearTimeout(this.selection_callback_timer);
    }
    this.selection_callback_timer = setTimeout(this.readSelectionBuffer.bind(this), this.selection_frame_delay);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  if (render_count != this.last_render_count) {
    console.log("rendered " + render_count + " primitives");
  }
  this.last_render_count = render_count;
  return true;
};
Scene.prototype.getFeatureAt = function(pixel, callback) {
  if (!this.initialized) {
    return;
  }
  if (this.update_selection == true) {
    return;
  }
  this.selection_point = Point(pixel.x * this.device_pixel_ratio, this.device_size.height - (pixel.y * this.device_pixel_ratio));
  this.selection_callback = callback;
  this.update_selection = true;
  this.dirty = true;
};
Scene.prototype.readSelectionBuffer = function() {
  var gl = this.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
  gl.readPixels(Math.floor(this.selection_point.x * this.fbo_size.width / this.device_size.width), Math.floor(this.selection_point.y * this.fbo_size.height / this.device_size.height), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pixel);
  var feature_key = (this.pixel[0] + (this.pixel[1] << 8) + (this.pixel[2] << 16) + (this.pixel[3] << 24)) >>> 0;
  var worker_id = this.pixel[3];
  if (worker_id != 255) {
    if (this.workers[worker_id] != null) {
      this.workers[worker_id].postMessage({
        type: 'getFeatureSelection',
        key: feature_key
      });
    }
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};
Scene.prototype.workerGetFeatureSelection = function(event) {
  if (event.data.type != 'getFeatureSelection') {
    return;
  }
  var feature = event.data.feature;
  var changed = false;
  if ((feature != null && this.selected_feature == null) || (feature == null && this.selected_feature != null) || (feature != null && this.selected_feature != null && feature.id != this.selected_feature.id)) {
    changed = true;
  }
  this.selected_feature = feature;
  if (typeof this.selection_callback == 'function') {
    this.selection_callback({
      feature: this.selected_feature,
      changed: changed
    });
  }
};
Scene.prototype.loadTile = function(coords, div, callback) {
  this.queued_tiles[this.queued_tiles.length] = arguments;
};
Scene.prototype.loadQueuedTiles = function() {
  if (!this.initialized) {
    return;
  }
  if (this.queued_tiles.length == 0) {
    return;
  }
  for (var t = 0; t < this.queued_tiles.length; t++) {
    this._loadTile.apply(this, this.queued_tiles[t]);
  }
  this.queued_tiles = [];
};
Scene.prototype._loadTile = function(coords, div, callback) {
  if (coords.z > this.tile_source.max_zoom) {
    var zgap = coords.z - this.tile_source.max_zoom;
    coords.x = ~~(coords.x / Math.pow(2, zgap));
    coords.y = ~~(coords.y / Math.pow(2, zgap));
    coords.display_z = coords.z;
    coords.z -= zgap;
  }
  this.trackTileSetLoadStart();
  var key = [coords.x, coords.y, coords.z].join('/');
  if (this.tiles[key]) {
    if (callback) {
      callback(null, div);
    }
    return;
  }
  var tile = this.tiles[key] = {};
  tile.key = key;
  tile.coords = coords;
  tile.min = Geo.metersForTile(tile.coords);
  tile.max = Geo.metersForTile({
    x: tile.coords.x + 1,
    y: tile.coords.y + 1,
    z: tile.coords.z
  });
  tile.span = {
    x: (tile.max.x - tile.min.x),
    y: (tile.max.y - tile.min.y)
  };
  tile.bounds = {
    sw: {
      x: tile.min.x,
      y: tile.max.y
    },
    ne: {
      x: tile.max.x,
      y: tile.min.y
    }
  };
  tile.debug = {};
  tile.loading = true;
  tile.loaded = false;
  this.buildTile(tile.key);
  this.updateTileElement(tile, div);
  this.updateVisibilityForTile(tile);
  if (callback) {
    callback(null, div);
  }
};
Scene.prototype.rebuildTiles = function() {
  var $__0 = this;
  if (!this.initialized) {
    return;
  }
  this.layers_serialized = Utils.serializeWithFunctions(this.layers);
  this.styles_serialized = Utils.serializeWithFunctions(this.styles);
  this.selection_map = {};
  this.workers.forEach((function(worker) {
    worker.postMessage({
      type: 'prepareForRebuild',
      layers: $__0.layers_serialized,
      styles: $__0.styles_serialized
    });
  }));
  var visible = [],
      invisible = [];
  for (var t in this.tiles) {
    if (this.tiles[t].visible == true) {
      visible.push(t);
    } else {
      invisible.push(t);
    }
  }
  visible.sort((function(a, b) {
    var ad = $__0.tiles[a].center_dist;
    var bd = $__0.tiles[b].center_dist;
    return (bd > ad ? -1 : (bd == ad ? 0 : 1));
  }));
  for (var t in visible) {
    this.buildTile(visible[t]);
  }
  for (var t in invisible) {
    if (this.isTileInZoom(this.tiles[invisible[t]]) == true) {
      this.buildTile(invisible[t]);
    } else {
      this.removeTile(invisible[t]);
    }
  }
  this.updateActiveModes();
  this.resetTime();
};
Scene.prototype.buildTile = function(key) {
  var tile = this.tiles[key];
  this.workerPostMessageForTile(tile, {
    type: 'buildTile',
    tile: {
      key: tile.key,
      coords: tile.coords,
      min: tile.min,
      max: tile.max,
      debug: tile.debug
    },
    tile_source: this.tile_source,
    layers: this.layers_serialized,
    styles: this.styles_serialized
  });
};
Scene.addTile = function(tile, layers, styles, modes) {
  var layer,
      style,
      feature,
      z,
      mode;
  var vertex_data = {};
  tile.debug.features = 0;
  for (var layer_num = 0; layer_num < layers.length; layer_num++) {
    layer = layers[layer_num];
    if (styles.layers[layer.name] == null || styles.layers[layer.name].visible == false) {
      continue;
    }
    if (tile.layers[layer.name] != null) {
      var num_features = tile.layers[layer.name].features.length;
      for (var f = num_features - 1; f >= 0; f--) {
        feature = tile.layers[layer.name].features[f];
        style = Style.parseStyleForFeature(feature, layer.name, styles.layers[layer.name], tile);
        if (style == null) {
          continue;
        }
        style.layer_num = layer_num;
        style.z = Scene.calculateZ(layer, tile) + style.z;
        var points = null,
            lines = null,
            polygons = null;
        if (feature.geometry.type == 'Polygon') {
          polygons = [feature.geometry.coordinates];
        } else if (feature.geometry.type == 'MultiPolygon') {
          polygons = feature.geometry.coordinates;
        } else if (feature.geometry.type == 'LineString') {
          lines = [feature.geometry.coordinates];
        } else if (feature.geometry.type == 'MultiLineString') {
          lines = feature.geometry.coordinates;
        } else if (feature.geometry.type == 'Point') {
          points = [feature.geometry.coordinates];
        } else if (feature.geometry.type == 'MultiPoint') {
          points = feature.geometry.coordinates;
        }
        mode = style.mode.name;
        if (vertex_data[mode] == null) {
          vertex_data[mode] = [];
        }
        if (polygons != null) {
          modes[mode].buildPolygons(polygons, style, vertex_data[mode]);
        }
        if (lines != null) {
          modes[mode].buildLines(lines, style, vertex_data[mode]);
        }
        if (points != null) {
          modes[mode].buildPoints(points, style, vertex_data[mode]);
        }
        tile.debug.features++;
      }
    }
  }
  tile.vertex_data = {};
  for (var s in vertex_data) {
    tile.vertex_data[s] = new Float32Array(vertex_data[s]);
  }
  return {vertex_data: true};
};
Scene.prototype.workerBuildTileCompleted = function(event) {
  var $__0 = this;
  if (event.data.type != 'buildTileCompleted') {
    return;
  }
  this.selection_map_worker_size[event.data.worker_id] = event.data.selection_map_size;
  this.selection_map_size = 0;
  Object.keys(this.selection_map_worker_size).forEach((function(worker) {
    $__0.selection_map_size += $__0.selection_map_worker_size[worker];
  }));
  console.log("selection map: " + this.selection_map_size + " features");
  var tile = event.data.tile;
  if (this.tiles[tile.key] == null) {
    console.log("discarded tile " + tile.key + " in Scene.tileWorkerCompleted because previously removed");
    return;
  }
  tile = this.mergeTile(tile.key, tile);
  this.buildGLGeometry(tile);
  this.dirty = true;
  this.trackTileSetLoadEnd();
  this.printDebugForTile(tile);
};
Scene.prototype.buildGLGeometry = function(tile) {
  var vertex_data = tile.vertex_data;
  this.freeTileResources(tile);
  tile.gl_geometry = {};
  for (var s in vertex_data) {
    tile.gl_geometry[s] = this.modes[s].makeGLGeometry(vertex_data[s]);
  }
  tile.debug.geometries = 0;
  tile.debug.buffer_size = 0;
  for (var p in tile.gl_geometry) {
    tile.debug.geometries += tile.gl_geometry[p].geometry_count;
    tile.debug.buffer_size += tile.gl_geometry[p].vertex_data.byteLength;
  }
  tile.debug.geom_ratio = (tile.debug.geometries / tile.debug.features).toFixed(1);
  delete tile.vertex_data;
};
Scene.prototype.removeTile = function(key) {
  if (!this.initialized) {
    return;
  }
  console.log("tile unload for " + key);
  if (this.zooming == true) {
    return;
  }
  var tile = this.tiles[key];
  if (tile != null) {
    this.freeTileResources(tile);
    this.workerPostMessageForTile(tile, {
      type: 'removeTile',
      key: tile.key
    });
  }
  delete this.tiles[key];
  this.dirty = true;
};
Scene.prototype.freeTileResources = function(tile) {
  if (tile != null && tile.gl_geometry != null) {
    for (var p in tile.gl_geometry) {
      tile.gl_geometry[p].destroy();
    }
    tile.gl_geometry = null;
  }
};
Scene.prototype.updateTileElement = function(tile, div) {
  div.setAttribute('data-tile-key', tile.key);
  div.style.width = '256px';
  div.style.height = '256px';
  if (this.debug) {
    var debug_overlay = document.createElement('div');
    debug_overlay.textContent = tile.key;
    debug_overlay.style.position = 'absolute';
    debug_overlay.style.left = 0;
    debug_overlay.style.top = 0;
    debug_overlay.style.color = 'white';
    debug_overlay.style.fontSize = '16px';
    div.appendChild(debug_overlay);
    div.style.borderStyle = 'solid';
    div.style.borderColor = 'white';
    div.style.borderWidth = '1px';
  }
};
Scene.prototype.mergeTile = function(key, source_tile) {
  var tile = this.tiles[key];
  if (tile == null) {
    this.tiles[key] = source_tile;
    return this.tiles[key];
  }
  for (var p in source_tile) {
    tile[p] = source_tile[p];
  }
  return tile;
};
Scene.prototype.loadScene = function(callback) {
  var $__0 = this;
  var queue = Queue();
  if (!this.layer_source && typeof(this.layers) == 'string') {
    this.layer_source = Utils.urlForPath(this.layers);
  }
  if (!this.style_source && typeof(this.styles) == 'string') {
    this.style_source = Utils.urlForPath(this.styles);
  }
  if (this.layer_source) {
    queue.defer((function(complete) {
      Scene.loadLayers($__0.layer_source, (function(layers) {
        $__0.layers = layers;
        $__0.layers_serialized = Utils.serializeWithFunctions($__0.layers);
        complete();
      }));
    }));
  }
  if (this.style_source) {
    queue.defer((function(complete) {
      Scene.loadStyles($__0.style_source, (function(styles) {
        $__0.styles = styles;
        $__0.styles_serialized = Utils.serializeWithFunctions($__0.styles);
        complete();
      }));
    }));
  } else {
    this.styles = Scene.postProcessStyles(this.styles);
  }
  queue.await(function() {
    if (typeof callback == 'function') {
      callback();
    }
  });
};
Scene.prototype.reloadScene = function() {
  var $__0 = this;
  if (!this.initialized) {
    return;
  }
  this.loadScene((function() {
    $__0.rebuildTiles();
  }));
};
Scene.prototype.refreshModes = function() {
  if (!this.initialized) {
    return;
  }
  this.modes = Scene.refreshModes(this.modes, this.styles);
};
Scene.prototype.updateActiveModes = function() {
  this.active_modes = {};
  var animated = false;
  for (var l in this.styles.layers) {
    var mode = this.styles.layers[l].mode.name;
    if (this.styles.layers[l].visible !== false) {
      this.active_modes[mode] = true;
      if (animated == false && this.modes[mode].animated == true) {
        animated = true;
      }
    }
  }
  this.animated = animated;
};
Scene.prototype.resetTime = function() {
  this.start_time = +new Date();
};
Scene.prototype.initInputHandlers = function() {};
Scene.prototype.input = function() {};
Scene.prototype.trackTileSetLoadStart = function() {
  if (this.tile_set_loading == null) {
    this.tile_set_loading = +new Date();
    console.log("tile set load START");
  }
};
Scene.prototype.trackTileSetLoadEnd = function() {
  if (this.tile_set_loading != null) {
    var end_tile_set = true;
    for (var t in this.tiles) {
      if (this.tiles[t].loading == true) {
        end_tile_set = false;
        break;
      }
    }
    if (end_tile_set == true) {
      this.last_tile_set_load = (+new Date()) - this.tile_set_loading;
      this.tile_set_loading = null;
      console.log("tile set load FINISHED in: " + this.last_tile_set_load);
    }
  }
};
Scene.prototype.printDebugForTile = function(tile) {
  console.log("debug for " + tile.key + ': [ ' + Object.keys(tile.debug).map(function(t) {
    return t + ': ' + tile.debug[t];
  }).join(', ') + ' ]');
};
Scene.prototype.compileShaders = function() {
  for (var m in this.modes) {
    this.modes[m].gl_program.compile();
  }
};
Scene.prototype.getDebugSum = function(prop, filter) {
  var sum = 0;
  for (var t in this.tiles) {
    if (this.tiles[t].debug[prop] != null && (typeof filter != 'function' || filter(this.tiles[t]) == true)) {
      sum += this.tiles[t].debug[prop];
    }
  }
  return sum;
};
Scene.prototype.getDebugAverage = function(prop, filter) {
  return this.getDebugSum(prop, filter) / Object.keys(this.tiles).length;
};
Scene.prototype.workerLogMessage = function(event) {
  if (event.data.type != 'log') {
    return;
  }
  console.log("worker " + event.data.worker_id + ": " + event.data.msg);
};
Scene.loadLayers = function(url, callback) {
  var layers;
  var req = new XMLHttpRequest();
  req.onload = function() {
    eval('layers = ' + req.response);
    if (typeof callback == 'function') {
      callback(layers);
    }
  };
  req.open('GET', url + '?' + (+new Date()), true);
  req.responseType = 'text';
  req.send();
};
Scene.loadStyles = function(url, callback) {
  var styles;
  var req = new XMLHttpRequest();
  req.onload = function() {
    styles = req.response;
    try {
      eval('styles = ' + req.response);
    } catch (e) {
      try {
        styles = yaml.safeLoad(req.response);
      } catch (e) {
        console.log("failed to parse styles!");
        console.log(styles);
        styles = null;
      }
    }
    Utils.stringsToFunctions(styles);
    Style.expandMacros(styles);
    Scene.postProcessStyles(styles);
    if (typeof callback == 'function') {
      callback(styles);
    }
  };
  req.open('GET', url + '?' + (+new Date()), true);
  req.responseType = 'text';
  req.send();
};
Scene.postProcessStyles = function(styles) {
  for (var m in styles.layers) {
    if (styles.layers[m].visible !== false) {
      styles.layers[m].visible = true;
    }
    if ((styles.layers[m].mode && styles.layers[m].mode.name) == null) {
      styles.layers[m].mode = {};
      for (var p in Style.defaults.mode) {
        styles.layers[m].mode[p] = Style.defaults.mode[p];
      }
    }
  }
  return styles;
};
Scene.processLayersForTile = function(layers, tile) {
  var tile_layers = {};
  for (var t = 0; t < layers.length; t++) {
    layers[t].number = t;
    if (layers[t] != null) {
      if (layers[t].data == null) {
        tile_layers[layers[t].name] = tile.layers[layers[t].name];
      } else if (typeof layers[t].data == 'string') {
        tile_layers[layers[t].name] = tile.layers[layers[t].data];
      } else if (typeof layers[t].data == 'function') {
        tile_layers[layers[t].name] = layers[t].data(tile.layers);
      }
    }
    tile_layers[layers[t].name] = tile_layers[layers[t].name] || {
      type: 'FeatureCollection',
      features: []
    };
  }
  tile.layers = tile_layers;
  return tile_layers;
};
Scene.createModes = function(styles) {
  var modes = {};
  var built_ins = _dereq_('./gl/gl_modes').Modes;
  for (var m in built_ins) {
    modes[m] = built_ins[m];
  }
  for (var m in styles.modes) {
    modes[m] = ModeManager.configureMode(m, styles.modes[m]);
  }
  return modes;
};
Scene.refreshModes = function(modes, styles) {
  for (var m in styles.modes) {
    modes[m] = ModeManager.configureMode(m, styles.modes[m]);
  }
  for (m in modes) {
    modes[m].refresh();
  }
  return modes;
};
function findBaseLibraryURL() {
  Scene.library_base_url = '';
  var scripts = document.getElementsByTagName('script');
  for (var s = 0; s < scripts.length; s++) {
    var match = scripts[s].src.indexOf('tangram.debug.js');
    if (match == -1) {
      match = scripts[s].src.indexOf('tangram.min.js');
    }
    if (match >= 0) {
      Scene.library_base_url = scripts[s].src.substr(0, match);
      break;
    }
  }
}
;
if (module !== undefined) {
  module.exports = Scene;
}


},{"./geo.js":3,"./gl/gl.js":4,"./gl/gl_builders.js":5,"./gl/gl_modes":7,"./gl/gl_program.js":8,"./gl/gl_texture.js":10,"./point.js":14,"./style.js":16,"./utils.js":17,"gl-matrix":1,"js-yaml":"jkXaKS","queue-async":2}],16:[function(_dereq_,module,exports){
"use strict";
var Geo = _dereq_('./geo.js');
var Style = {};
Style.color = {
  pseudoRandomGrayscale: function(f) {
    var c = Math.max((parseInt(f.id, 16) % 100) / 100, 0.4);
    return [0.7 * c, 0.7 * c, 0.7 * c];
  },
  pseudoRandomColor: function(f) {
    return [0.7 * (parseInt(f.id, 16) / 100 % 1), 0.7 * (parseInt(f.id, 16) / 10000 % 1), 0.7 * (parseInt(f.id, 16) / 1000000 % 1)];
  },
  randomColor: function(f) {
    return [0.7 * Math.random(), 0.7 * Math.random(), 0.7 * Math.random()];
  }
};
Style.pixels = function(p, z) {
  var f;
  eval('f = function(f, t, h) { return ' + (typeof p == 'function' ? '(' + (p.toString() + '(f, t, h))') : p) + ' * h.Geo.meters_per_pixel[h.zoom]; }');
  return f;
};
Style.selection_map = {};
Style.selection_map_current = 1;
Style.selection_map_prefix = 0;
Style.generateSelection = function(color_map) {
  Style.selection_map_current++;
  var ir = Style.selection_map_current & 255;
  var ig = (Style.selection_map_current >> 8) & 255;
  var ib = (Style.selection_map_current >> 16) & 255;
  var ia = Style.selection_map_prefix;
  var r = ir / 255;
  var g = ig / 255;
  var b = ib / 255;
  var a = ia / 255;
  var key = (ir + (ig << 8) + (ib << 16) + (ia << 24)) >>> 0;
  color_map[key] = {color: [r, g, b, a]};
  return color_map[key];
};
Style.resetSelectionMap = function() {
  Style.selection_map = {};
  Style.selection_map_current = 1;
};
Style.macros = ['Style.color.pseudoRandomColor', 'Style.pixels'];
Style.expandMacros = function expandMacros(obj) {
  for (var p in obj) {
    var val = obj[p];
    if (typeof val == 'object') {
      obj[p] = expandMacros(val);
    } else if (typeof val == 'string') {
      for (var m in Style.macros) {
        if (val.match(Style.macros[m])) {
          var f;
          try {
            eval('f = ' + val);
            obj[p] = f;
            break;
          } catch (e) {
            obj[p] = val;
          }
        }
      }
    }
  }
  return obj;
};
Style.defaults = {
  color: [1.0, 0, 0],
  width: 1,
  size: 1,
  extrude: false,
  height: 20,
  min_height: 0,
  outline: {},
  selection: {
    active: false,
    color: [0, 0, 0, 1]
  },
  mode: {name: 'polygons'}
};
Style.helpers = {
  Style: Style,
  Geo: Geo
};
Style.parseStyleForFeature = function(feature, layer_name, layer_style, tile) {
  var layer_style = layer_style || {};
  var style = {};
  Style.helpers.zoom = tile.coords.z;
  if (typeof layer_style.filter == 'function') {
    if (layer_style.filter(feature, tile, Style.helpers) == false) {
      return null;
    }
  }
  style.color = (layer_style.color && (layer_style.color[feature.properties.kind] || layer_style.color.default)) || Style.defaults.color;
  if (typeof style.color == 'function') {
    style.color = style.color(feature, tile, Style.helpers);
  }
  style.width = (layer_style.width && (layer_style.width[feature.properties.kind] || layer_style.width.default)) || Style.defaults.width;
  if (typeof style.width == 'function') {
    style.width = style.width(feature, tile, Style.helpers);
  }
  style.width *= Geo.units_per_meter[tile.coords.z];
  style.size = (layer_style.size && (layer_style.size[feature.properties.kind] || layer_style.size.default)) || Style.defaults.size;
  if (typeof style.size == 'function') {
    style.size = style.size(feature, tile, Style.helpers);
  }
  style.size *= Geo.units_per_meter[tile.coords.z];
  style.extrude = (layer_style.extrude && (layer_style.extrude[feature.properties.kind] || layer_style.extrude.default)) || Style.defaults.extrude;
  if (typeof style.extrude == 'function') {
    style.extrude = style.extrude(feature, tile, Style.helpers);
  }
  style.height = (feature.properties && feature.properties.height) || Style.defaults.height;
  style.min_height = (feature.properties && feature.properties.min_height) || Style.defaults.min_height;
  if (style.extrude) {
    if (typeof style.extrude == 'number') {
      style.height = style.extrude;
    } else if (typeof style.extrude == 'object' && style.extrude.length >= 2) {
      style.min_height = style.extrude[0];
      style.height = style.extrude[1];
    }
  }
  style.z = (layer_style.z && (layer_style.z[feature.properties.kind] || layer_style.z.default)) || Style.defaults.z || 0;
  if (typeof style.z == 'function') {
    style.z = style.z(feature, tile, Style.helpers);
  }
  style.outline = {};
  layer_style.outline = layer_style.outline || {};
  style.outline.color = (layer_style.outline.color && (layer_style.outline.color[feature.properties.kind] || layer_style.outline.color.default)) || Style.defaults.outline.color;
  if (typeof style.outline.color == 'function') {
    style.outline.color = style.outline.color(feature, tile, Style.helpers);
  }
  style.outline.width = (layer_style.outline.width && (layer_style.outline.width[feature.properties.kind] || layer_style.outline.width.default)) || Style.defaults.outline.width;
  if (typeof style.outline.width == 'function') {
    style.outline.width = style.outline.width(feature, tile, Style.helpers);
  }
  style.outline.width *= Geo.units_per_meter[tile.coords.z];
  style.outline.dash = (layer_style.outline.dash && (layer_style.outline.dash[feature.properties.kind] || layer_style.outline.dash.default)) || Style.defaults.outline.dash;
  if (typeof style.outline.dash == 'function') {
    style.outline.dash = style.outline.dash(feature, tile, Style.helpers);
  }
  var interactive = false;
  if (typeof layer_style.interactive == 'function') {
    interactive = layer_style.interactive(feature, tile, Style.helpers);
  } else {
    interactive = layer_style.interactive;
  }
  if (interactive == true) {
    var selector = Style.generateSelection(Style.selection_map);
    selector.feature = {
      id: feature.id,
      properties: feature.properties
    };
    selector.feature.properties.layer = layer_name;
    style.selection = {
      active: true,
      color: selector.color
    };
  } else {
    style.selection = Style.defaults.selection;
  }
  if (layer_style.mode != null && layer_style.mode.name != null) {
    style.mode = {};
    for (var m in layer_style.mode) {
      style.mode[m] = layer_style.mode[m];
    }
  } else {
    style.mode = Style.defaults.mode;
  }
  return style;
};
if (module !== undefined) {
  module.exports = Style;
}


},{"./geo.js":3}],17:[function(_dereq_,module,exports){
"use strict";
function urlForPath(path) {
  if (path == null || path == '') {
    return null;
  }
  if (typeof path == 'object' && path.length > 0) {
    for (var p in path) {
      var protocol = path[p].toLowerCase().substr(0, 4);
      if (!(protocol == 'http' || protocol == 'file')) {
        path[p] = window.location.origin + window.location.pathname + path[p];
      }
    }
  } else {
    var protocol = path.toLowerCase().substr(0, 4);
    if (!(protocol == 'http' || protocol == 'file')) {
      path = window.location.origin + window.location.pathname + path;
    }
  }
  return path;
}
;
function serializeWithFunctions(obj) {
  var serialized = JSON.stringify(obj, function(k, v) {
    if (typeof v == 'function') {
      return v.toString();
    }
    return v;
  });
  return serialized;
}
;
function deserializeWithFunctions(serialized) {
  var obj = JSON.parse(serialized);
  obj = stringsToFunctions(obj);
  return obj;
}
;
function stringsToFunctions(obj) {
  for (var p in obj) {
    var val = obj[p];
    if (typeof val == 'object') {
      obj[p] = stringsToFunctions(val);
    } else if (typeof val == 'string' && val.match(/^function.*\(.*\)/) != null) {
      var f;
      try {
        eval('f = ' + val);
        obj[p] = f;
      } catch (e) {
        obj[p] = val;
      }
    }
  }
  return obj;
}
;
function runIfInMainThread(block, err) {
  try {
    if (window.document !== undefined) {
      block();
    }
  } catch (e) {
    if (typeof err == 'function') {
      err();
    }
  }
}
function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
;
if (module !== undefined) {
  module.exports = {
    urlForPath: urlForPath,
    serializeWithFunctions: serializeWithFunctions,
    deserializeWithFunctions: deserializeWithFunctions,
    stringsToFunctions: stringsToFunctions,
    runIfInMainThread: runIfInMainThread,
    isPowerOf2: isPowerOf2
  };
}


},{}],18:[function(_dereq_,module,exports){
"use strict";
var Vector = {};
Vector.lengthSq = function(v) {
  if (v.length == 2) {
    return (v[0] * v[0] + v[1] * v[1]);
  } else {
    return (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }
};
Vector.length = function(v) {
  return Math.sqrt(Vector.lengthSq(v));
};
Vector.normalize = function(v) {
  var d;
  if (v.length == 2) {
    d = v[0] * v[0] + v[1] * v[1];
    d = Math.sqrt(d);
    if (d != 0) {
      return [v[0] / d, v[1] / d];
    }
    return [0, 0];
  } else {
    var d = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    d = Math.sqrt(d);
    if (d != 0) {
      return [v[0] / d, v[1] / d, v[2] / d];
    }
    return [0, 0, 0];
  }
};
Vector.cross = function(v1, v2) {
  return [(v1[1] * v2[2]) - (v1[2] * v2[1]), (v1[2] * v2[0]) - (v1[0] * v2[2]), (v1[0] * v2[1]) - (v1[1] * v2[0])];
};
Vector.lineIntersection = function(p1, p2, p3, p4, parallel_tolerance) {
  var parallel_tolerance = parallel_tolerance || 0.01;
  var a1 = p1[1] - p2[1];
  var b1 = p1[0] - p2[0];
  var a2 = p3[1] - p4[1];
  var b2 = p3[0] - p4[0];
  var c1 = (p1[0] * p2[1]) - (p1[1] * p2[0]);
  var c2 = (p3[0] * p4[1]) - (p3[1] * p4[0]);
  var denom = (b1 * a2) - (a1 * b2);
  if (Math.abs(denom) > parallel_tolerance) {
    return [((c1 * b2) - (b1 * c2)) / denom, ((c1 * a2) - (a1 * c2)) / denom];
  }
  return null;
};
if (module !== undefined) {
  module.exports = Vector;
}


},{}]},{},[13])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2l2YW4vZGV2L21hcHplbi90YW5ncmFtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9pdmFuL2Rldi9tYXB6ZW4vdGFuZ3JhbS9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L2Rpc3QvZ2wtbWF0cml4LmpzIiwiL2hvbWUvaXZhbi9kZXYvbWFwemVuL3RhbmdyYW0vbm9kZV9tb2R1bGVzL3F1ZXVlLWFzeW5jL3F1ZXVlLmpzIiwiL2hvbWUvaXZhbi9kZXYvbWFwemVuL3RhbmdyYW0vc3JjL2dlby5qcyIsIi9ob21lL2l2YW4vZGV2L21hcHplbi90YW5ncmFtL3NyYy9nbC9nbC5qcyIsIi9ob21lL2l2YW4vZGV2L21hcHplbi90YW5ncmFtL3NyYy9nbC9nbF9idWlsZGVycy5qcyIsIi9ob21lL2l2YW4vZGV2L21hcHplbi90YW5ncmFtL3NyYy9nbC9nbF9nZW9tLmpzIiwiL2hvbWUvaXZhbi9kZXYvbWFwemVuL3RhbmdyYW0vc3JjL2dsL2dsX21vZGVzLmpzIiwiL2hvbWUvaXZhbi9kZXYvbWFwemVuL3RhbmdyYW0vc3JjL2dsL2dsX3Byb2dyYW0uanMiLCIvaG9tZS9pdmFuL2Rldi9tYXB6ZW4vdGFuZ3JhbS9zcmMvZ2wvZ2xfc2hhZGVycy5qcyIsIi9ob21lL2l2YW4vZGV2L21hcHplbi90YW5ncmFtL3NyYy9nbC9nbF90ZXh0dXJlLmpzIiwiL2hvbWUvaXZhbi9kZXYvbWFwemVuL3RhbmdyYW0vc3JjL2dsL2dsX3ZlcnRleF9sYXlvdXQuanMiLCIvaG9tZS9pdmFuL2Rldi9tYXB6ZW4vdGFuZ3JhbS9zcmMvbGVhZmxldF9sYXllci5qcyIsIi9ob21lL2l2YW4vZGV2L21hcHplbi90YW5ncmFtL3NyYy9tb2R1bGUuanMiLCIvaG9tZS9pdmFuL2Rldi9tYXB6ZW4vdGFuZ3JhbS9zcmMvcG9pbnQuanMiLCIvaG9tZS9pdmFuL2Rldi9tYXB6ZW4vdGFuZ3JhbS9zcmMvc2NlbmUuanMiLCIvaG9tZS9pdmFuL2Rldi9tYXB6ZW4vdGFuZ3JhbS9zcmMvc3R5bGUuanMiLCIvaG9tZS9pdmFuL2Rldi9tYXB6ZW4vdGFuZ3JhbS9zcmMvdXRpbHMuanMiLCIvaG9tZS9pdmFuL2Rldi9tYXB6ZW4vdGFuZ3JhbS9zcmMvdmVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMveEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxPQUFNLENBQUUsQ0FBQSxFQUFFLEVBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLE1BQUksQ0FBQyxDQUN4QyxFQUFDLE9BQU0sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE9BQU0sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxNQUFJLENBQUMsQ0FFcEMsRUFBQyxPQUFNLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxPQUFNLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsTUFBSSxDQUFDLENBQ3BDLEVBQUMsT0FBTSxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsT0FBTSxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLE1BQUksQ0FBQyxDQUNwQyxFQUFDLE9BQU0sQ0FBRSxDQUFBLEVBQUUsRUFBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxPQUFNLENBQUUsQ0FBQSxFQUFFLEVBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLE1BQUksQ0FBQyxDQUM1QyxDQUFDO0FBR0QsQUFBSSxVQUFBLENBQUEsTUFBSyxFQUFJLENBQUEsTUFBSyxNQUFNLEFBQUMsQ0FDckIsQ0FBQyxDQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBQyxDQUNSLENBQUEsTUFBSyxVQUFVLEFBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBRSxDQUFBLEVBQUUsRUFBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxPQUFNLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxPQUFNLENBQUUsQ0FBQSxFQUFFLEVBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsT0FBTSxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLEVBQUEsQ0FBQyxDQUFDLENBQzFGLENBQUM7QUFFRCw0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Q0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUM3RCxFQUFDLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFDLENBQ3ZFLENBQUM7QUFDRCxBQUFJLE1BQUEsQ0FBQSxRQUFPLEVBQUksRUFDWCxDQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFDLENBQzdELEVBQUMsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBRyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUMsQ0FDdkUsQ0FBQztBQUVELEFBQUksTUFBQSxDQUFBLFFBQU8sRUFBSSxDQUFBLE1BQUssVUFBVSxBQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsQ0FBQyxFQUFJLEVBQUMsQ0FBQSxDQUFHLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RSxBQUFJLE1BQUEsQ0FBQSxRQUFPLEVBQUksRUFDWCxDQUFDLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFDLENBQ25FLEVBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBRyxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUMsQ0FDakUsQ0FBQztBQUNELEFBQUksTUFBQSxDQUFBLFFBQU8sRUFBSSxFQUNYLENBQUMsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBRyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUMsQ0FDbkUsRUFBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFHLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUNqRSxDQUFDO0FBR0QsQUFBSSxNQUFBLENBQUEsWUFBVyxFQUFJLENBQUEsTUFBSyxpQkFBaUIsQUFBQyxDQUFDLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBQyxDQUFDO0FBQzlGLEFBQUksTUFBQSxDQUFBLFVBQVMsRUFB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QUUsQ0FBQSxDQUFDLENBQ3hDLENBQUM7SUFDTDtBQUFBLEFBR0EsT0FBSSxVQUFTLE1BQU0sR0FBSyxDQUFBLE9BQU0sYUFBYSxDQUFHO0FBQzFDLFlBQU0sYUFBYSxLQUFLLEFBQUMsQ0FDckIsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FDNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUU1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBQzVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FFNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUM1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBRTVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FDNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUU1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBQzVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FFNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUM1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBRTVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FDNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUU1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBQzVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FDaEUsQ0FBQztJQUNMO0FBQUEsQUFFQSxPQUFJLFVBQVMsTUFBTSxHQUFLLFdBQVMsQ0FBQSxFQUFLLENBQUEsT0FBTSxhQUFhLENBQUc7QUFDeEQsQUFBSSxRQUFBLENBQUEsTUFBSyxDQUFDO0FBQ1YsU0FBSSxVQUFTLEdBQUssV0FBUyxDQUFHO0FBRTFCLGFBQUssRUFBSSxFQUFDLENBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFDLENBQUM7TUFDdEIsS0FDSyxLQUFJLFVBQVMsR0FBSyxXQUFTLENBQUc7QUFFL0IsYUFBSyxFQUFJLEVBQUMsQ0FBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUMsQ0FBQztNQUN0QjtBQUFBLEFBSUEsWUFBTSxhQUFhLEtBQUssQUFBQyxDQUNyQixFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUN0QixFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FDdkMsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUM1QixFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FDdkMsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUM1QixFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FDdkMsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUN0QixFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FDM0MsQ0FBQztBQUVELEFBQUksUUFBQSxDQUFBLFNBQVEsRUFBSSxDQUFBLEtBQUksT0FBTyxDQUFDO0FBQzVCLFVBQVMsR0FBQSxDQUFBLEVBQUMsRUFBRSxFQUFBLENBQUcsQ0FBQSxFQUFDLEVBQUksVUFBUSxDQUFHLENBQUEsRUFBQyxFQUFFLENBQUc7QUFDakMsQUFBSSxVQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsS0FBSSxDQUFFLEVBQUMsQ0FBQyxDQUFDO0FBRXJCLFlBQVMsR0FBQSxDQUFBLENBQUEsRUFBRSxFQUFBLENBQUcsQ0FBQSxDQUFBLEVBQUksQ0FBQSxLQUFJLE9BQU8sRUFBSSxFQUFBLENBQUcsQ0FBQSxDQUFBLEVBQUUsQ0FBRztBQUVyQyxBQUFJLFlBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDakIsQUFBSSxZQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsS0FBSSxDQUFFLENBQUEsRUFBRSxFQUFBLENBQUMsQ0FBQztBQUVuQixnQkFBTSxhQUFhLEtBQUssQUFBQyxDQUNyQixFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksT0FBSyxDQUN2QixFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FDakIsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksT0FBSyxDQUN2QixFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FDckIsQ0FBQztRQUNMO0FBQUEsTUFDSjtBQUFBLEFBQUMsTUFBQTtJQUNMO0FBQUEsRUFDSjtBQUFBLEFBRUEsT0FBTyxZQUFVLENBQUM7QUFDdEIsQ0FBQztBQVNELFNBQVMsb0JBQW9CLEVBQUksVUFBVSxNQUFLLENBQUcsQ0FBQSxLQUFJLENBQUcsQ0FBQSxNQUFLLENBQUcsQ0FBQSxDQUFBLENBQUcsQ0FBQSxXQUFVLENBQUcsQ0FBQSxPQUFNLENBQ3hGO0FBQ0ksQUFBSSxJQUFBLENBQUEsT0FBTSxFQUFJLENBQUEsT0FBTSxHQUFLLEdBQUMsQ0FBQztBQUUzQixBQUFJLElBQUEsQ0FBQSxnQkFBZSxFQUFJLEdBQUMsQ0FBQztBQUN6QixLQUFJLE9BQU0sUUFBUSxDQUFHO0FBQ2pCLG1CQUFlLEtBQUssQUFBQyxDQUFDLENBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFDLENBQUM7RUFDbEM7QUFBQSxBQUNBLEtBQUksT0FBTSxpQkFBaUIsQ0FBRztBQUMxQixtQkFBZSxLQUFLLE1BQU0sQUFBQyxDQUFDLGdCQUFlLENBQUcsQ0FBQSxPQUFNLGlCQUFpQixDQUFDLENBQUM7RUFDM0U7QUFBQSxBQUNBLEtBQUksZ0JBQWUsT0FBTyxHQUFLLEVBQUEsQ0FBRztBQUM5QixtQkFBZSxFQUFJLEtBQUcsQ0FBQztFQUMzQjtBQUFBLEFBRUksSUFBQSxDQUFBLFVBQVMsRUFBSSxDQUFBLE1BQUssT0FBTyxDQUFDO0FBQzlCLE1BQVMsR0FBQSxDQUFBLENBQUEsRUFBRSxFQUFBLENBQUcsQ0FBQSxDQUFBLEVBQUksV0FBUyxDQUFHLENBQUEsQ0FBQSxFQUFFLENBQUc7QUFDL0IsQUFBSSxNQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBRXJCLEFBQUksTUFBQSxDQUFBLFNBQVEsRUFBSSxFQUNaLENBQUMsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxFQUFFLEVBQUEsQ0FBRyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLE1BQUssRUFBRSxFQUFBLENBQUMsQ0FDeEMsRUFBQyxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLEVBQUUsRUFBQSxDQUFHLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsTUFBSyxFQUFFLEVBQUEsQ0FBQyxDQUN4QyxFQUFDLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksRUFBRSxFQUFBLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxNQUFLLEVBQUUsRUFBQSxDQUFDLENBRXhDLEVBQUMsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxFQUFFLEVBQUEsQ0FBRyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLE1BQUssRUFBRSxFQUFBLENBQUMsQ0FDeEMsRUFBQyxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLEVBQUUsRUFBQSxDQUFHLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsTUFBSyxFQUFFLEVBQUEsQ0FBQyxDQUN4QyxFQUFDLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksRUFBRSxFQUFBLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVB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VUFBTTtFQUNWO0FBQUEsQUFFQSxNQUFTLEdBQUEsQ0FBQSxDQUFBLEVBQUUsRUFBQSxDQUFHLENBQUEsQ0FBQSxFQUFJLENBQUEsSUFBRyxhQUFhLE9BQU8sQ0FBRyxDQUFBLENBQUEsRUFBRSxDQUFHO0FBQzdDLE9BQUcsVUFBVSxNQUFNLEFBQUMsQ0FBQyxJQUFHLENBQUcsQ0FBQSxJQUFHLGFBQWEsQ0FBRSxDQUFBLENBQUMsQ0FBQyxDQUFDO0VBQ3BEO0FBQUEsQUFFQSxLQUFHLGFBQWEsRUFBSSxHQUFDLENBQUM7QUFDMUIsQ0FBQztBQUdELElBQUksVUFBVSxVQUFVLEVBQUksVUFBVSxNQUFLLENBQUcsQ0FBQSxHQUFFLENBQUcsQ0FBQSxRQUFPLENBQzFEO0FBRUksS0FBSSxNQUFLLEVBQUUsRUFBSSxDQUFBLElBQUcsWUFBWSxTQUFTLENBQUc7QUFDdEMsQUFBSSxNQUFBLENBQUEsSUFBRyxFQUFJLENBQUEsTUFBSyxFQUFFLEVBQUksQ0FBQSxJQUFHLFlBQVksU0FBUyxDQUFDO0FBRS9DLFNBQUssRUFBRSxFQUFJLEVBQUMsQ0FBQyxDQUFDLE1BQUssRUFBRSxFQUFJLENBQUEsSUFBRyxJQUFJLEFBQUMsQ0FBQyxDQUFBLENBQUcsS0FBRyxDQUFDLENBQUMsQ0FBQztBQUMzQyxTQUFLLEVBQUUsRUFBSSxFQUFDLENBQUMsQ0FBQyxNQUFLLEVBQUUsRUFBSSxDQUFBLElBQUcsSUFBSSxBQUFDLENBQUMsQ0FBQSxDQUFHLEtBQUcsQ0FBQyxDQUFDLENBQUM7QUFDM0MsU0FBSyxVQUFVLEVBQUksQ0FBQSxNQUFLLEVBQUUsQ0FBQztBQUMzQixTQUFLLEVBQUUsR0FBSyxLQUFHLENBQUM7RUFFcEI7QUFBQSxBQUVBLEtBQUcsc0JBQXNCLEFBQUMsRUFBQyxDQUFDO0FBRTVCLEFBQUksSUFBQSxDQUFBLEdBQUUsRUFBSSxDQUFBLENBQUMsTUFBSyxFQUFFLENBQUcsQ0FBQSxNQUFLLEVBQUUsQ0FBRyxDQUFBLE1BQUssRUFBRSxDQUFDLEtBQUssQUFBQyxDQUFDLEdBQUUsQ0FBQyxDQUFDO0FB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QUFFLENBQUEsRUFBSyxFQUFBLENBQUM7QUFDdkgsS0FBSSxNQUFPLE1BQUksRUFBRSxDQUFBLEVBQUssV0FBUyxDQUFHO0FBQzlCLFFBQUksRUFBRSxFQUFJLENBQUEsS0FBSSxFQUFFLEFBQUMsQ0FBQyxPQUFNLENBQUcsS0FBRyxDQUFHLENBQUEsS0FBSSxRQUFRLENBQUMsQ0FBQztFQUNuRDtBQUFBLEFBRUEsTUFBSSxRQUFRLEVBQUksR0FBQyxDQUFDO0FBQ2xCLFlBQVUsUUFBUSxFQUFJLENBQUEsV0FBVSxRQUFRLEdBQUssR0FBQyxDQUFDO0FBQy9DLE1BQUksUUFBUSxNQUFNLEVBQUksQ0FBQSxDQUFDLFdBQVUsUUFBUSxNQUFNLEdBQUssRUFBQyxXQUFVLFFBQVEsTUFBTSxDQUFFLE9BQU0sV0FBVyxLQUFLLENBQUMsR0FBSyxDQUFBLFdBQVUsUUFBUSxNQUFNLFFBQVEsQ0FBQyxDQUFDLEdBQUssQ0FBQSxLQUFJLFNBQVMsUUFBUSxNQUFNLENBQUM7QUFDOUssS0FBSSxNQUFPLE1BQUksUUFBUSxNQUFNLENBQUEsRUFBSyxXQUFTLENBQUc7QUFDMUMsUUFBSSxRQUFRLE1BQU0sRUFBSSxDQUFBLEtBQUksUUFBUSxNQUFNLEFBQUMsQ0FBQyxPQUFNLENBQUcsS0FBRyxDQUFHLENBQUEsS0FBSSxRQUFRLENBQUMsQ0FBQztFQUMzRTtBQUFBLEFBRUEsTUFBSSxRQUFRLE1BQU0sRUFBSSxDQUFBLENBQUMsV0FBVSxRQUFRLE1BQU0sR0FBSyxFQUFDLFdBQVUsUUFBUSxNQUFNLENBQUUsT0FBTSxXQUFXLEtBQUssQ0FBQyxHQUFLLENBQUEsV0FBVSxRQUFRLE1BQU0sUUFBUSxDQUFDLENBQUMsR0FBSyxDQUFBLEtBQUksU0FBUyxRQUFRLE1BQU0sQ0FBQztBQUM5SyxLQUFJLE1BQU8sTUFBSSxRQUFRLE1BQU0sQ0FBQSxFQUFLLFdBQVMsQ0FBRztBQUMxQyxRQUFJLFFBQVEsTUFBTSxFQUFJLENBQUEsS0FBSSxRQUFRLE1BQU0sQUFBQyxDQUFDLE9BQU0sQ0FBRyxLQUFHLENBQUcsQ0FBQSxL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QUEsa0JBQWlCLEdBQUssS0FBRyxDQUFDO0FBSW5ELEFBQUksSUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUN0QixBQUFJLElBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDdEIsQUFBSSxJQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3RCLEFBQUksSUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUN0QixBQUFJLElBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxDQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQyxFQUFJLEVBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDLENBQUM7QUFDMUMsQUFBSSxJQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsQ0FBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsRUFBSSxFQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQyxDQUFDO0FBQzFDLEFBQUksSUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLENBQUMsRUFBQyxFQUFJLEdBQUMsQ0FBQyxFQUFJLEVBQUMsRUFBQyxFQUFJLEdBQUMsQ0FBQyxDQUFDO0FBRWpDLEtBQUksSUFBRyxJQUFJLEFBQUMsQ0FBQyxLQUFJLENBQUMsQ0FBQSxDQUFJLG1CQUFpQixDQUFHO0FBQ3RDLFNBQU8sRUFDSCxDQUFDLENBQUMsRUFBQyxFQUFJLEdBQUMsQ0FBQyxFQUFJLEVBQUMsRUFBQyxFQUFJLEdBQUMsQ0FBQyxDQUFDLEVBQUksTUFBSSxDQUM5QixDQUFBLENBQUMsQ0FBQyxFQUFDLEVBQUksR0FBQyxDQUFDLEVBQUksRUFBQyxFQUFDLEVBQUksR0FBQyxDQUFDLENBQUMsRUFBSSxNQUFJLENBQ2xDLENBQUM7RUFDTDtBQUFBLEFBQ0EsT0FBTyxLQUFHLENBQUM7QUFDZixDQUFDO0FBRUQsR0FBSSxNQUFLLElBQU0sVUFBUSxDQUFHO0FBQ3RCLE9BQUssUUFBUSxFQUFJLE9BQUssQ0FBQztBQUMzQjtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGZpbGVvdmVydmlldyBnbC1tYXRyaXggLSBIaWdoIHBlcmZvcm1hbmNlIG1hdHJpeCBhbmQgdmVjdG9yIG9wZXJhdGlvbnNcbiAqIEBhdXRob3IgQnJhbmRvbiBKb25lc1xuICogQGF1dGhvciBDb2xpbiBNYWNLZW56aWUgSVZcbiAqIEB2ZXJzaW9uIDIuMS4wXG4gKi9cblxuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBzaGltID0ge307XG4gIGlmICh0eXBlb2YoZXhwb3J0cykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcbiAgICAgIHNoaW0uZXhwb3J0cyA9IHt9O1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2hpbS5leHBvcnRzO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGdsLW1hdHJpeCBsaXZlcyBpbiBhIGJyb3dzZXIsIGRlZmluZSBpdHMgbmFtZXNwYWNlcyBpbiBnbG9iYWxcbiAgICAgIHNoaW0uZXhwb3J0cyA9IHdpbmRvdztcbiAgICB9ICAgIFxuICB9XG4gIGVsc2Uge1xuICAgIC8vIGdsLW1hdHJpeCBsaXZlcyBpbiBjb21tb25qcywgZGVmaW5lIGl0cyBuYW1lc3BhY2VzIGluIGV4cG9ydHNcbiAgICBzaGltLmV4cG9ydHMgPSBleHBvcnRzO1xuICB9XG5cbiAgKGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiAgICAvKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG5cbmlmKCFHTE1BVF9FUFNJTE9OKSB7XG4gICAgdmFyIEdMTUFUX0VQU0lMT04gPSAwLjAwMDAwMTtcbn1cblxuaWYoIUdMTUFUX0FSUkFZX1RZUEUpIHtcbiAgICB2YXIgR0xNQVRfQVJSQVlfVFlQRSA9ICh0eXBlb2YgRmxvYXQzMkFycmF5ICE9PSAndW5kZWZpbmVkJykgPyBGbG9hdDMyQXJyYXkgOiBBcnJheTtcbn1cblxuLyoqXG4gKiBAY2xhc3MgQ29tbW9uIHV0aWxpdGllc1xuICogQG5hbWUgZ2xNYXRyaXhcbiAqL1xudmFyIGdsTWF0cml4ID0ge307XG5cbi8qKlxuICogU2V0cyB0aGUgdHlwZSBvZiBhcnJheSB1c2VkIHdoZW4gY3JlYXRpbmcgbmV3IHZlY3RvcnMgYW5kIG1hdHJpY2llc1xuICpcbiAqIEBwYXJhbSB7VHlwZX0gdHlwZSBBcnJheSB0eXBlLCBzdWNoIGFzIEZsb2F0MzJBcnJheSBvciBBcnJheVxuICovXG5nbE1hdHJpeC5zZXRNYXRyaXhBcnJheVR5cGUgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgR0xNQVRfQVJSQVlfVFlQRSA9IHR5cGU7XG59XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLmdsTWF0cml4ID0gZ2xNYXRyaXg7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG5hbWUgdmVjMlxuICovXG5cbnZhciB2ZWMyID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjMlxuICpcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMik7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMik7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5mcm9tVmFsdWVzID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgyKTtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzIgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzIgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5zZXQgPSBmdW5jdGlvbihvdXQsIHgsIHkpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLmFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnN1YnRyYWN0ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuc3ViID0gdmVjMi5zdWJ0cmFjdDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubXVsdGlwbHkgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5tdWwgPSB2ZWMyLm11bHRpcGx5O1xuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5kaXZpZGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuZGl2ID0gdmVjMi5kaXZpZGU7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm1pbiA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5tYXggPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMyIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMyLmRpc3RhbmNlID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLmRpc3QgPSB2ZWMyLmRpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjMi5zcXVhcmVkRGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdO1xuICAgIHJldHVybiB4KnggKyB5Knk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkRGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5zcXJEaXN0ID0gdmVjMi5zcXVhcmVkRGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xudmVjMi5sZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIubGVuID0gdmVjMi5sZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xudmVjMi5zcXVhcmVkTGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIHJldHVybiB4KnggKyB5Knk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuc3FyTGVuID0gdmVjMi5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubmVnYXRlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgdmFyIGxlbiA9IHgqeCArIHkqeTtcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xudmVjMi5kb3QgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdO1xufTtcblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMidzXG4gKiBOb3RlIHRoYXQgdGhlIGNyb3NzIHByb2R1Y3QgbXVzdCBieSBkZWZpbml0aW9uIHByb2R1Y2UgYSAzRCB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzIuY3Jvc3MgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICB2YXIgeiA9IGFbMF0gKiBiWzFdIC0gYVsxXSAqIGJbMF07XG4gICAgb3V0WzBdID0gb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSB6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLmxlcnAgPSBmdW5jdGlvbiAob3V0LCBhLCBiLCB0KSB7XG4gICAgdmFyIGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDJ9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIudHJhbnNmb3JtTWF0MiA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeTtcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQyZH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi50cmFuc2Zvcm1NYXQyZCA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeSArIG1bNF07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeSArIG1bNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0M1xuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDN9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIudHJhbnNmb3JtTWF0MyA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzNdICogeSArIG1bNl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzRdICogeSArIG1bN107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0NFxuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMCdcbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnRyYW5zZm9ybU1hdDQgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sIFxuICAgICAgICB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVsxMl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bMTNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWMycy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWMyLiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjMnMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgdmVjID0gdmVjMi5jcmVhdGUoKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICAgICAgdmFyIGksIGw7XG4gICAgICAgIGlmKCFzdHJpZGUpIHtcbiAgICAgICAgICAgIHN0cmlkZSA9IDI7XG4gICAgICAgIH1cblxuICAgICAgICBpZighb2Zmc2V0KSB7XG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZihjb3VudCkge1xuICAgICAgICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgICAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTtcbiAgICAgICAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMyfSB2ZWMgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xudmVjMi5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAndmVjMignICsgYVswXSArICcsICcgKyBhWzFdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMudmVjMiA9IHZlYzI7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAzIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG5hbWUgdmVjM1xuICovXG5cbnZhciB2ZWMzID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjM1xuICpcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xudmVjMy5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMyk7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG52ZWMzLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgzKTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG52ZWMzLmZyb21WYWx1ZXMgPSBmdW5jdGlvbih4LCB5LCB6KSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDMpO1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMzIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuc2V0ID0gZnVuY3Rpb24ob3V0LCB4LCB5LCB6KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLmFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnN1YnRyYWN0ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuc3ViID0gdmVjMy5zdWJ0cmFjdDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubXVsdGlwbHkgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICogYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5tdWwgPSB2ZWMzLm11bHRpcGx5O1xuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5kaXZpZGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuZGl2ID0gdmVjMy5kaXZpZGU7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm1pbiA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICAgIG91dFsyXSA9IE1hdGgubWluKGFbMl0sIGJbMl0pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5tYXggPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgICBvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMzIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMzLmRpc3RhbmNlID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXSxcbiAgICAgICAgeiA9IGJbMl0gLSBhWzJdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuZGlzdCA9IHZlYzMuZGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMzLnNxdWFyZWREaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZERpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuc3FyRGlzdCA9IHZlYzMuc3F1YXJlZERpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbnZlYzMubGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeik7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5sZW4gPSB2ZWMzLmxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG52ZWMzLnNxdWFyZWRMZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIHJldHVybiB4KnggKyB5KnkgKyB6Kno7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuc3FyTGVuID0gdmVjMy5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubmVnYXRlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIHZhciBsZW4gPSB4KnggKyB5KnkgKyB6Kno7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgICAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgICAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICAgICAgICBvdXRbMl0gPSBhWzJdICogbGVuO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbnZlYzMuZG90ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdO1xufTtcblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLmNyb3NzID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sXG4gICAgICAgIGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl07XG5cbiAgICBvdXRbMF0gPSBheSAqIGJ6IC0gYXogKiBieTtcbiAgICBvdXRbMV0gPSBheiAqIGJ4IC0gYXggKiBiejtcbiAgICBvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5sZXJwID0gZnVuY3Rpb24gKG91dCwgYSwgYiwgdCkge1xuICAgIHZhciBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDQuXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy50cmFuc2Zvcm1NYXQ0ID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM107XG4gICAgb3V0WzJdID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnRyYW5zZm9ybVF1YXQgPSBmdW5jdGlvbihvdXQsIGEsIHEpIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSxcbiAgICAgICAgcXggPSBxWzBdLCBxeSA9IHFbMV0sIHF6ID0gcVsyXSwgcXcgPSBxWzNdLFxuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjXG4gICAgICAgIGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5LFxuICAgICAgICBpeSA9IHF3ICogeSArIHF6ICogeCAtIHF4ICogeixcbiAgICAgICAgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHgsXG4gICAgICAgIGl3ID0gLXF4ICogeCAtIHF5ICogeSAtIHF6ICogejtcblxuICAgIC8vIGNhbGN1bGF0ZSByZXN1bHQgKiBpbnZlcnNlIHF1YXRcbiAgICBvdXRbMF0gPSBpeCAqIHF3ICsgaXcgKiAtcXggKyBpeSAqIC1xeiAtIGl6ICogLXF5O1xuICAgIG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXo7XG4gICAgb3V0WzJdID0gaXogKiBxdyArIGl3ICogLXF6ICsgaXggKiAtcXkgLSBpeSAqIC1xeDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjM3MuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMy4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzNzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLmZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZlYyA9IHZlYzMuY3JlYXRlKCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgICAgIHZhciBpLCBsO1xuICAgICAgICBpZighc3RyaWRlKSB7XG4gICAgICAgICAgICBzdHJpZGUgPSAzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIW9mZnNldCkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoY291bnQpIHtcbiAgICAgICAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsID0gYS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICAgICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07IHZlY1syXSA9IGFbaSsyXTtcbiAgICAgICAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdOyBhW2krMl0gPSB2ZWNbMl07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IHZlYyB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG52ZWMzLnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICd2ZWMzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnZlYzMgPSB2ZWMzO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgNCBEaW1lbnNpb25hbCBWZWN0b3JcbiAqIEBuYW1lIHZlYzRcbiAqL1xuXG52YXIgdmVjNCA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzRcbiAqXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXG4gKi9cbnZlYzQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWM0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG52ZWM0LmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG52ZWM0LmZyb21WYWx1ZXMgPSBmdW5jdGlvbih4LCB5LCB6LCB3KSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIG91dFszXSA9IHc7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5zZXQgPSBmdW5jdGlvbihvdXQsIHgsIHksIHosIHcpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSB3O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5hZGQgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5zdWJ0cmFjdCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gLSBiWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LnN1YiA9IHZlYzQuc3VidHJhY3Q7XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0Lm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAqIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQubXVsID0gdmVjNC5tdWx0aXBseTtcblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuZGl2aWRlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAvIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LmRpdiA9IHZlYzQuZGl2aWRlO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5taW4gPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgICBvdXRbM10gPSBNYXRoLm1pbihhWzNdLCBiWzNdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubWF4ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gICAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XG4gICAgb3V0WzNdID0gTWF0aC5tYXgoYVszXSwgYlszXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjNCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICBvdXRbM10gPSBhWzNdICogYjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjNC5kaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXSxcbiAgICAgICAgdyA9IGJbM10gLSBhWzNdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6ICsgdyp3KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuZGlzdCA9IHZlYzQuZGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWM0LnNxdWFyZWREaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXSxcbiAgICAgICAgdyA9IGJbM10gLSBhWzNdO1xuICAgIHJldHVybiB4KnggKyB5KnkgKyB6KnogKyB3Knc7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zcXVhcmVkRGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5zcXJEaXN0ID0gdmVjNC5zcXVhcmVkRGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xudmVjNC5sZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdLFxuICAgICAgICB3ID0gYVszXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeiArIHcqdyk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5sZW4gPSB2ZWM0Lmxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG52ZWM0LnNxdWFyZWRMZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdLFxuICAgICAgICB3ID0gYVszXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6ICsgdyp3O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LnNxckxlbiA9IHZlYzQuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0Lm5lZ2F0ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIG91dFszXSA9IC1hWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5ub3JtYWxpemUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXSxcbiAgICAgICAgdyA9IGFbM107XG4gICAgdmFyIGxlbiA9IHgqeCArIHkqeSArIHoqeiArIHcqdztcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgICAgIG91dFsyXSA9IGFbMl0gKiBsZW47XG4gICAgICAgIG91dFszXSA9IGFbM10gKiBsZW47XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xudmVjNC5kb3QgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl0gKyBhWzNdICogYlszXTtcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubGVycCA9IGZ1bmN0aW9uIChvdXQsIGEsIGIsIHQpIHtcbiAgICB2YXIgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICAgIG91dFszXSA9IGF3ICsgdCAqIChiWzNdIC0gYXcpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIG1hdDQuXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnRyYW5zZm9ybU1hdDQgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSwgdyA9IGFbM107XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0gKiB3O1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdICogdztcbiAgICBvdXRbMl0gPSBtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0gKiB3O1xuICAgIG91dFszXSA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XSAqIHc7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQudHJhbnNmb3JtUXVhdCA9IGZ1bmN0aW9uKG91dCwgYSwgcSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdLFxuICAgICAgICBxeCA9IHFbMF0sIHF5ID0gcVsxXSwgcXogPSBxWzJdLCBxdyA9IHFbM10sXG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHF1YXQgKiB2ZWNcbiAgICAgICAgaXggPSBxdyAqIHggKyBxeSAqIHogLSBxeiAqIHksXG4gICAgICAgIGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6LFxuICAgICAgICBpeiA9IHF3ICogeiArIHF4ICogeSAtIHF5ICogeCxcbiAgICAgICAgaXcgPSAtcXggKiB4IC0gcXkgKiB5IC0gcXogKiB6O1xuXG4gICAgLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuICAgIG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXk7XG4gICAgb3V0WzFdID0gaXkgKiBxdyArIGl3ICogLXF5ICsgaXogKiAtcXggLSBpeCAqIC1xejtcbiAgICBvdXRbMl0gPSBpeiAqIHF3ICsgaXcgKiAtcXogKyBpeCAqIC1xeSAtIGl5ICogLXF4O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWM0cy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWM0LiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjMnMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgdmVjID0gdmVjNC5jcmVhdGUoKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICAgICAgdmFyIGksIGw7XG4gICAgICAgIGlmKCFzdHJpZGUpIHtcbiAgICAgICAgICAgIHN0cmlkZSA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZighb2Zmc2V0KSB7XG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZihjb3VudCkge1xuICAgICAgICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgICAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTsgdmVjWzJdID0gYVtpKzJdOyB2ZWNbM10gPSBhW2krM107XG4gICAgICAgICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgICAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTsgYVtpKzJdID0gdmVjWzJdOyBhW2krM10gPSB2ZWNbM107XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IHZlYyB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG52ZWM0LnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICd2ZWM0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMudmVjNCA9IHZlYzQ7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyeDIgTWF0cml4XG4gKiBAbmFtZSBtYXQyXG4gKi9cblxudmFyIG1hdDIgPSB7fTtcblxudmFyIG1hdDJJZGVudGl0eSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgIDEsIDAsXG4gICAgMCwgMVxuXSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQyXG4gKlxuICogQHJldHVybnMge21hdDJ9IGEgbmV3IDJ4MiBtYXRyaXhcbiAqL1xubWF0Mi5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNCk7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDIgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IGEgbWF0cml4IHRvIGNsb25lXG4gKiBAcmV0dXJucyB7bWF0Mn0gYSBuZXcgMngyIG1hdHJpeFxuICovXG5tYXQyLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQyIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IGEgbWF0MiB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLnRyYW5zcG9zZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgICBpZiAob3V0ID09PSBhKSB7XG4gICAgICAgIHZhciBhMSA9IGFbMV07XG4gICAgICAgIG91dFsxXSA9IGFbMl07XG4gICAgICAgIG91dFsyXSA9IGExO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFswXSA9IGFbMF07XG4gICAgICAgIG91dFsxXSA9IGFbMl07XG4gICAgICAgIG91dFsyXSA9IGFbMV07XG4gICAgICAgIG91dFszXSA9IGFbM107XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEludmVydHMgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLmludmVydCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sXG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgICAgICBkZXQgPSBhMCAqIGEzIC0gYTIgKiBhMTtcblxuICAgIGlmICghZGV0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG4gICAgXG4gICAgb3V0WzBdID0gIGEzICogZGV0O1xuICAgIG91dFsxXSA9IC1hMSAqIGRldDtcbiAgICBvdXRbMl0gPSAtYTIgKiBkZXQ7XG4gICAgb3V0WzNdID0gIGEwICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLmFkam9pbnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICAvLyBDYWNoaW5nIHRoaXMgdmFsdWUgaXMgbmVzc2VjYXJ5IGlmIG91dCA9PSBhXG4gICAgdmFyIGEwID0gYVswXTtcbiAgICBvdXRbMF0gPSAgYVszXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICBvdXRbMl0gPSAtYVsyXTtcbiAgICBvdXRbM10gPSAgYTA7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xubWF0Mi5kZXRlcm1pbmFudCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBhWzNdIC0gYVsyXSAqIGFbMV07XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDInc1xuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5tdWx0aXBseSA9IGZ1bmN0aW9uIChvdXQsIGEsIGIpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdO1xuICAgIHZhciBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107XG4gICAgb3V0WzBdID0gYTAgKiBiMCArIGExICogYjI7XG4gICAgb3V0WzFdID0gYTAgKiBiMSArIGExICogYjM7XG4gICAgb3V0WzJdID0gYTIgKiBiMCArIGEzICogYjI7XG4gICAgb3V0WzNdID0gYTIgKiBiMSArIGEzICogYjM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQyLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDIubXVsID0gbWF0Mi5tdWx0aXBseTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0MiBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLnJvdGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sXG4gICAgICAgIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKTtcbiAgICBvdXRbMF0gPSBhMCAqICBjICsgYTEgKiBzO1xuICAgIG91dFsxXSA9IGEwICogLXMgKyBhMSAqIGM7XG4gICAgb3V0WzJdID0gYTIgKiAgYyArIGEzICogcztcbiAgICBvdXRbM10gPSBhMiAqIC1zICsgYTMgKiBjO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0MiBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKiovXG5tYXQyLnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSxcbiAgICAgICAgdjAgPSB2WzBdLCB2MSA9IHZbMV07XG4gICAgb3V0WzBdID0gYTAgKiB2MDtcbiAgICBvdXRbMV0gPSBhMSAqIHYxO1xuICAgIG91dFsyXSA9IGEyICogdjA7XG4gICAgb3V0WzNdID0gYTMgKiB2MTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gbWF0IG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDIuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDIoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQyID0gbWF0Mjtcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDJ4MyBNYXRyaXhcbiAqIEBuYW1lIG1hdDJkXG4gKiBcbiAqIEBkZXNjcmlwdGlvbiBcbiAqIEEgbWF0MmQgY29udGFpbnMgc2l4IGVsZW1lbnRzIGRlZmluZWQgYXM6XG4gKiA8cHJlPlxuICogW2EsIGIsXG4gKiAgYywgZCxcbiAqICB0eCx0eV1cbiAqIDwvcHJlPlxuICogVGhpcyBpcyBhIHNob3J0IGZvcm0gZm9yIHRoZSAzeDMgbWF0cml4OlxuICogPHByZT5cbiAqIFthLCBiLCAwXG4gKiAgYywgZCwgMFxuICogIHR4LHR5LDFdXG4gKiA8L3ByZT5cbiAqIFRoZSBsYXN0IGNvbHVtbiBpcyBpZ25vcmVkIHNvIHRoZSBhcnJheSBpcyBzaG9ydGVyIGFuZCBvcGVyYXRpb25zIGFyZSBmYXN0ZXIuXG4gKi9cblxudmFyIG1hdDJkID0ge307XG5cbnZhciBtYXQyZElkZW50aXR5ID0gbmV3IEZsb2F0MzJBcnJheShbXG4gICAgMSwgMCxcbiAgICAwLCAxLFxuICAgIDAsIDBcbl0pO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0MmRcbiAqXG4gKiBAcmV0dXJucyB7bWF0MmR9IGEgbmV3IDJ4MyBtYXRyaXhcbiAqL1xubWF0MmQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDYpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MmQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDJkfSBhIG5ldyAyeDMgbWF0cml4XG4gKi9cbm1hdDJkLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg2KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MmQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xubWF0MmQuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCBhIG1hdDJkIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5tYXQyZC5pbnZlcnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYWEgPSBhWzBdLCBhYiA9IGFbMV0sIGFjID0gYVsyXSwgYWQgPSBhWzNdLFxuICAgICAgICBhdHggPSBhWzRdLCBhdHkgPSBhWzVdO1xuXG4gICAgdmFyIGRldCA9IGFhICogYWQgLSBhYiAqIGFjO1xuICAgIGlmKCFkZXQpe1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gYWQgKiBkZXQ7XG4gICAgb3V0WzFdID0gLWFiICogZGV0O1xuICAgIG91dFsyXSA9IC1hYyAqIGRldDtcbiAgICBvdXRbM10gPSBhYSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYWMgKiBhdHkgLSBhZCAqIGF0eCkgKiBkZXQ7XG4gICAgb3V0WzVdID0gKGFiICogYXR4IC0gYWEgKiBhdHkpICogZGV0O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDJkLmRldGVybWluYW50ID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gYVswXSAqIGFbM10gLSBhWzFdICogYVsyXTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MmQnc1xuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQyZH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhYSA9IGFbMF0sIGFiID0gYVsxXSwgYWMgPSBhWzJdLCBhZCA9IGFbM10sXG4gICAgICAgIGF0eCA9IGFbNF0sIGF0eSA9IGFbNV0sXG4gICAgICAgIGJhID0gYlswXSwgYmIgPSBiWzFdLCBiYyA9IGJbMl0sIGJkID0gYlszXSxcbiAgICAgICAgYnR4ID0gYls0XSwgYnR5ID0gYls1XTtcblxuICAgIG91dFswXSA9IGFhKmJhICsgYWIqYmM7XG4gICAgb3V0WzFdID0gYWEqYmIgKyBhYipiZDtcbiAgICBvdXRbMl0gPSBhYypiYSArIGFkKmJjO1xuICAgIG91dFszXSA9IGFjKmJiICsgYWQqYmQ7XG4gICAgb3V0WzRdID0gYmEqYXR4ICsgYmMqYXR5ICsgYnR4O1xuICAgIG91dFs1XSA9IGJiKmF0eCArIGJkKmF0eSArIGJ0eTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDJkLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDJkLm11bCA9IG1hdDJkLm11bHRpcGx5O1xuXG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDJkIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLnJvdGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBhYSA9IGFbMF0sXG4gICAgICAgIGFiID0gYVsxXSxcbiAgICAgICAgYWMgPSBhWzJdLFxuICAgICAgICBhZCA9IGFbM10sXG4gICAgICAgIGF0eCA9IGFbNF0sXG4gICAgICAgIGF0eSA9IGFbNV0sXG4gICAgICAgIHN0ID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgY3QgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYWEqY3QgKyBhYipzdDtcbiAgICBvdXRbMV0gPSAtYWEqc3QgKyBhYipjdDtcbiAgICBvdXRbMl0gPSBhYypjdCArIGFkKnN0O1xuICAgIG91dFszXSA9IC1hYypzdCArIGN0KmFkO1xuICAgIG91dFs0XSA9IGN0KmF0eCArIHN0KmF0eTtcbiAgICBvdXRbNV0gPSBjdCphdHkgLSBzdCphdHg7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQyZCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHttYXQyZH0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICoqL1xubWF0MmQuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgdnggPSB2WzBdLCB2eSA9IHZbMV07XG4gICAgb3V0WzBdID0gYVswXSAqIHZ4O1xuICAgIG91dFsxXSA9IGFbMV0gKiB2eTtcbiAgICBvdXRbMl0gPSBhWzJdICogdng7XG4gICAgb3V0WzNdID0gYVszXSAqIHZ5O1xuICAgIG91dFs0XSA9IGFbNF0gKiB2eDtcbiAgICBvdXRbNV0gPSBhWzVdICogdnk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNsYXRlcyB0aGUgbWF0MmQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7bWF0MmR9IHYgdGhlIHZlYzIgdG8gdHJhbnNsYXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKiovXG5tYXQyZC50cmFuc2xhdGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF0gKyB2WzBdO1xuICAgIG91dFs1XSA9IGFbNV0gKyB2WzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xubWF0MmQuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDJkKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVszXSArICcsICcgKyBhWzRdICsgJywgJyArIGFbNV0gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQyZCA9IG1hdDJkO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgM3gzIE1hdHJpeFxuICogQG5hbWUgbWF0M1xuICovXG5cbnZhciBtYXQzID0ge307XG5cbnZhciBtYXQzSWRlbnRpdHkgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAxLCAwLCAwLFxuICAgIDAsIDEsIDAsXG4gICAgMCwgMCwgMVxuXSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQzXG4gKlxuICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcbiAqL1xubWF0My5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoOSk7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAxO1xuICAgIG91dFs1XSA9IDA7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcbiAqL1xubWF0My5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoOSk7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDMgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IGEgbWF0MyB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMTtcbiAgICBvdXRbNV0gPSAwO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My50cmFuc3Bvc2UgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gICAgaWYgKG91dCA9PT0gYSkge1xuICAgICAgICB2YXIgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTEyID0gYVs1XTtcbiAgICAgICAgb3V0WzFdID0gYVszXTtcbiAgICAgICAgb3V0WzJdID0gYVs2XTtcbiAgICAgICAgb3V0WzNdID0gYTAxO1xuICAgICAgICBvdXRbNV0gPSBhWzddO1xuICAgICAgICBvdXRbNl0gPSBhMDI7XG4gICAgICAgIG91dFs3XSA9IGExMjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvdXRbMF0gPSBhWzBdO1xuICAgICAgICBvdXRbMV0gPSBhWzNdO1xuICAgICAgICBvdXRbMl0gPSBhWzZdO1xuICAgICAgICBvdXRbM10gPSBhWzFdO1xuICAgICAgICBvdXRbNF0gPSBhWzRdO1xuICAgICAgICBvdXRbNV0gPSBhWzddO1xuICAgICAgICBvdXRbNl0gPSBhWzJdO1xuICAgICAgICBvdXRbN10gPSBhWzVdO1xuICAgICAgICBvdXRbOF0gPSBhWzhdO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5pbnZlcnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcblxuICAgICAgICBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjEsXG4gICAgICAgIGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjAsXG4gICAgICAgIGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMCxcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMTtcblxuICAgIGlmICghZGV0KSB7IFxuICAgICAgICByZXR1cm4gbnVsbDsgXG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IGIwMSAqIGRldDtcbiAgICBvdXRbMV0gPSAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSkgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGExMiAqIGEwMSAtIGEwMiAqIGExMSkgKiBkZXQ7XG4gICAgb3V0WzNdID0gYjExICogZGV0O1xuICAgIG91dFs0XSA9IChhMjIgKiBhMDAgLSBhMDIgKiBhMjApICogZGV0O1xuICAgIG91dFs1XSA9ICgtYTEyICogYTAwICsgYTAyICogYTEwKSAqIGRldDtcbiAgICBvdXRbNl0gPSBiMjEgKiBkZXQ7XG4gICAgb3V0WzddID0gKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApICogZGV0O1xuICAgIG91dFs4XSA9IChhMTEgKiBhMDAgLSBhMDEgKiBhMTApICogZGV0O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5hZGpvaW50ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgICBvdXRbMF0gPSAoYTExICogYTIyIC0gYTEyICogYTIxKTtcbiAgICBvdXRbMV0gPSAoYTAyICogYTIxIC0gYTAxICogYTIyKTtcbiAgICBvdXRbMl0gPSAoYTAxICogYTEyIC0gYTAyICogYTExKTtcbiAgICBvdXRbM10gPSAoYTEyICogYTIwIC0gYTEwICogYTIyKTtcbiAgICBvdXRbNF0gPSAoYTAwICogYTIyIC0gYTAyICogYTIwKTtcbiAgICBvdXRbNV0gPSAoYTAyICogYTEwIC0gYTAwICogYTEyKTtcbiAgICBvdXRbNl0gPSAoYTEwICogYTIxIC0gYTExICogYTIwKTtcbiAgICBvdXRbN10gPSAoYTAxICogYTIwIC0gYTAwICogYTIxKTtcbiAgICBvdXRbOF0gPSAoYTAwICogYTExIC0gYTAxICogYTEwKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xubWF0My5kZXRlcm1pbmFudCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgICByZXR1cm4gYTAwICogKGEyMiAqIGExMSAtIGExMiAqIGEyMSkgKyBhMDEgKiAoLWEyMiAqIGExMCArIGExMiAqIGEyMCkgKyBhMDIgKiAoYTIxICogYTEwIC0gYTExICogYTIwKTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MydzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuXG4gICAgICAgIGIwMCA9IGJbMF0sIGIwMSA9IGJbMV0sIGIwMiA9IGJbMl0sXG4gICAgICAgIGIxMCA9IGJbM10sIGIxMSA9IGJbNF0sIGIxMiA9IGJbNV0sXG4gICAgICAgIGIyMCA9IGJbNl0sIGIyMSA9IGJbN10sIGIyMiA9IGJbOF07XG5cbiAgICBvdXRbMF0gPSBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjA7XG4gICAgb3V0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxO1xuICAgIG91dFsyXSA9IGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMjtcblxuICAgIG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMDtcbiAgICBvdXRbNF0gPSBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjE7XG4gICAgb3V0WzVdID0gYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyO1xuXG4gICAgb3V0WzZdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwO1xuICAgIG91dFs3XSA9IGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMTtcbiAgICBvdXRbOF0gPSBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQzLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDMubXVsID0gbWF0My5tdWx0aXBseTtcblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQzIGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuICAgICAgICB4ID0gdlswXSwgeSA9IHZbMV07XG5cbiAgICBvdXRbMF0gPSBhMDA7XG4gICAgb3V0WzFdID0gYTAxO1xuICAgIG91dFsyXSA9IGEwMjtcblxuICAgIG91dFszXSA9IGExMDtcbiAgICBvdXRbNF0gPSBhMTE7XG4gICAgb3V0WzVdID0gYTEyO1xuXG4gICAgb3V0WzZdID0geCAqIGEwMCArIHkgKiBhMTAgKyBhMjA7XG4gICAgb3V0WzddID0geCAqIGEwMSArIHkgKiBhMTEgKyBhMjE7XG4gICAgb3V0WzhdID0geCAqIGEwMiArIHkgKiBhMTIgKyBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDMgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5yb3RhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcblxuICAgICAgICBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBjICogYTAwICsgcyAqIGExMDtcbiAgICBvdXRbMV0gPSBjICogYTAxICsgcyAqIGExMTtcbiAgICBvdXRbMl0gPSBjICogYTAyICsgcyAqIGExMjtcblxuICAgIG91dFszXSA9IGMgKiBhMTAgLSBzICogYTAwO1xuICAgIG91dFs0XSA9IGMgKiBhMTEgLSBzICogYTAxO1xuICAgIG91dFs1XSA9IGMgKiBhMTIgLSBzICogYTAyO1xuXG4gICAgb3V0WzZdID0gYTIwO1xuICAgIG91dFs3XSA9IGEyMTtcbiAgICBvdXRbOF0gPSBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQzIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqKi9cbm1hdDMuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzJdO1xuXG4gICAgb3V0WzBdID0geCAqIGFbMF07XG4gICAgb3V0WzFdID0geCAqIGFbMV07XG4gICAgb3V0WzJdID0geCAqIGFbMl07XG5cbiAgICBvdXRbM10gPSB5ICogYVszXTtcbiAgICBvdXRbNF0gPSB5ICogYVs0XTtcbiAgICBvdXRbNV0gPSB5ICogYVs1XTtcblxuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcGllcyB0aGUgdmFsdWVzIGZyb20gYSBtYXQyZCBpbnRvIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5tYXQzLmZyb21NYXQyZCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSAwO1xuXG4gICAgb3V0WzNdID0gYVsyXTtcbiAgICBvdXRbNF0gPSBhWzNdO1xuICAgIG91dFs1XSA9IDA7XG5cbiAgICBvdXRbNl0gPSBhWzRdO1xuICAgIG91dFs3XSA9IGFbNV07XG4gICAgb3V0WzhdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4qIENhbGN1bGF0ZXMgYSAzeDMgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbipcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbipcbiogQHJldHVybnMge21hdDN9IG91dFxuKi9cbm1hdDMuZnJvbVF1YXQgPSBmdW5jdGlvbiAob3V0LCBxKSB7XG4gICAgdmFyIHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdLFxuICAgICAgICB4MiA9IHggKyB4LFxuICAgICAgICB5MiA9IHkgKyB5LFxuICAgICAgICB6MiA9IHogKyB6LFxuXG4gICAgICAgIHh4ID0geCAqIHgyLFxuICAgICAgICB4eSA9IHggKiB5MixcbiAgICAgICAgeHogPSB4ICogejIsXG4gICAgICAgIHl5ID0geSAqIHkyLFxuICAgICAgICB5eiA9IHkgKiB6MixcbiAgICAgICAgenogPSB6ICogejIsXG4gICAgICAgIHd4ID0gdyAqIHgyLFxuICAgICAgICB3eSA9IHcgKiB5MixcbiAgICAgICAgd3ogPSB3ICogejI7XG5cbiAgICBvdXRbMF0gPSAxIC0gKHl5ICsgenopO1xuICAgIG91dFsxXSA9IHh5ICsgd3o7XG4gICAgb3V0WzJdID0geHogLSB3eTtcblxuICAgIG91dFszXSA9IHh5IC0gd3o7XG4gICAgb3V0WzRdID0gMSAtICh4eCArIHp6KTtcbiAgICBvdXRbNV0gPSB5eiArIHd4O1xuXG4gICAgb3V0WzZdID0geHogKyB3eTtcbiAgICBvdXRbN10gPSB5eiAtIHd4O1xuICAgIG91dFs4XSA9IDEgLSAoeHggKyB5eSk7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gbWF0IG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDMuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDMoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIFxuICAgICAgICAgICAgICAgICAgICBhWzNdICsgJywgJyArIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVs2XSArICcsICcgKyBhWzddICsgJywgJyArIGFbOF0gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQzID0gbWF0Mztcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDR4NCBNYXRyaXhcbiAqIEBuYW1lIG1hdDRcbiAqL1xuXG52YXIgbWF0NCA9IHt9O1xuXG52YXIgbWF0NElkZW50aXR5ID0gbmV3IEZsb2F0MzJBcnJheShbXG4gICAgMSwgMCwgMCwgMCxcbiAgICAwLCAxLCAwLCAwLFxuICAgIDAsIDAsIDEsIDAsXG4gICAgMCwgMCwgMCwgMVxuXSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQ0XG4gKlxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xubWF0NC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMTYpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAxO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDE7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQ0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xubWF0NC5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMTYpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIG91dFs5XSA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgb3V0WzldID0gYVs5XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgYSBtYXQ0IHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDE7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMTtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQudHJhbnNwb3NlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICAgIGlmIChvdXQgPT09IGEpIHtcbiAgICAgICAgdmFyIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgICAgICBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGEwMTtcbiAgICAgICAgb3V0WzZdID0gYVs5XTtcbiAgICAgICAgb3V0WzddID0gYVsxM107XG4gICAgICAgIG91dFs4XSA9IGEwMjtcbiAgICAgICAgb3V0WzldID0gYTEyO1xuICAgICAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgICAgIG91dFsxMl0gPSBhMDM7XG4gICAgICAgIG91dFsxM10gPSBhMTM7XG4gICAgICAgIG91dFsxNF0gPSBhMjM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3V0WzBdID0gYVswXTtcbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGFbMV07XG4gICAgICAgIG91dFs1XSA9IGFbNV07XG4gICAgICAgIG91dFs2XSA9IGFbOV07XG4gICAgICAgIG91dFs3XSA9IGFbMTNdO1xuICAgICAgICBvdXRbOF0gPSBhWzJdO1xuICAgICAgICBvdXRbOV0gPSBhWzZdO1xuICAgICAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgICAgIG91dFsxMV0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzEyXSA9IGFbM107XG4gICAgICAgIG91dFsxM10gPSBhWzddO1xuICAgICAgICBvdXRbMTRdID0gYVsxMV07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbiAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV0sXG5cbiAgICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLFxuICAgICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCxcbiAgICAgICAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXG4gICAgICAgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLFxuICAgICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCxcbiAgICAgICAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXG4gICAgICAgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMixcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICghZGV0KSB7IFxuICAgICAgICByZXR1cm4gbnVsbDsgXG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICAgIG91dFsxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICAgIG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICAgIG91dFszXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0O1xuICAgIG91dFs0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xuICAgIG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICAgIG91dFs2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICAgIG91dFs3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0O1xuICAgIG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuICAgIG91dFs5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuICAgIG91dFsxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0O1xuICAgIG91dFsxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmFkam9pbnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICAgIG91dFswXSAgPSAgKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gICAgb3V0WzFdICA9IC0oYTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcbiAgICBvdXRbMl0gID0gIChhMDEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMSAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICAgIG91dFszXSAgPSAtKGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTExICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzRdICA9IC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEzMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpKTtcbiAgICBvdXRbNV0gID0gIChhMDAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikpO1xuICAgIG91dFs2XSAgPSAtKGEwMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTEwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzddICA9ICAoYTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgICBvdXRbOF0gID0gIChhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkpO1xuICAgIG91dFs5XSAgPSAtKGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSk7XG4gICAgb3V0WzEwXSA9ICAoYTAwICogKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMzIC0gYTAzICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcbiAgICBvdXRbMTFdID0gLShhMDAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjMgLSBhMDMgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSkpO1xuICAgIG91dFsxMl0gPSAtKGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSk7XG4gICAgb3V0WzEzXSA9ICAoYTAwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgLSBhMjAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpKTtcbiAgICBvdXRbMTRdID0gLShhMDAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSAtIGExMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICsgYTMwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSkpO1xuICAgIG91dFsxNV0gPSAgKGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDQuZGV0ZXJtaW5hbnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdLFxuXG4gICAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcbiAgICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXG4gICAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxuICAgICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcbiAgICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXG4gICAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxuICAgICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0NCdzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0Lm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gICAgLy8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XG4gICAgdmFyIGIwICA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107ICBcbiAgICBvdXRbMF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzFdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuICAgIG91dFsyXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgICBvdXRbM10gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgICBiMCA9IGJbNF07IGIxID0gYls1XTsgYjIgPSBiWzZdOyBiMyA9IGJbN107XG4gICAgb3V0WzRdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFs1XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbNl0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4gICAgb3V0WzddID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gICAgYjAgPSBiWzhdOyBiMSA9IGJbOV07IGIyID0gYlsxMF07IGIzID0gYlsxMV07XG4gICAgb3V0WzhdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFs5XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMTBdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFsxMV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgICBiMCA9IGJbMTJdOyBiMSA9IGJbMTNdOyBiMiA9IGJbMTRdOyBiMyA9IGJbMTVdO1xuICAgIG91dFsxMl0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzEzXSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMTRdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFsxNV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQ0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDQubXVsID0gbWF0NC5tdWx0aXBseTtcblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQ0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnRyYW5zbGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHYpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXSxcbiAgICAgICAgYTAwLCBhMDEsIGEwMiwgYTAzLFxuICAgICAgICBhMTAsIGExMSwgYTEyLCBhMTMsXG4gICAgICAgIGEyMCwgYTIxLCBhMjIsIGEyMztcblxuICAgIGlmIChhID09PSBvdXQpIHtcbiAgICAgICAgb3V0WzEyXSA9IGFbMF0gKiB4ICsgYVs0XSAqIHkgKyBhWzhdICogeiArIGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxXSAqIHggKyBhWzVdICogeSArIGFbOV0gKiB6ICsgYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzJdICogeCArIGFbNl0gKiB5ICsgYVsxMF0gKiB6ICsgYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzNdICogeCArIGFbN10gKiB5ICsgYVsxMV0gKiB6ICsgYVsxNV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgICAgICAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcbiAgICAgICAgYTIwID0gYVs4XTsgYTIxID0gYVs5XTsgYTIyID0gYVsxMF07IGEyMyA9IGFbMTFdO1xuXG4gICAgICAgIG91dFswXSA9IGEwMDsgb3V0WzFdID0gYTAxOyBvdXRbMl0gPSBhMDI7IG91dFszXSA9IGEwMztcbiAgICAgICAgb3V0WzRdID0gYTEwOyBvdXRbNV0gPSBhMTE7IG91dFs2XSA9IGExMjsgb3V0WzddID0gYTEzO1xuICAgICAgICBvdXRbOF0gPSBhMjA7IG91dFs5XSA9IGEyMTsgb3V0WzEwXSA9IGEyMjsgb3V0WzExXSA9IGEyMztcblxuICAgICAgICBvdXRbMTJdID0gYTAwICogeCArIGExMCAqIHkgKyBhMjAgKiB6ICsgYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhMDEgKiB4ICsgYTExICogeSArIGEyMSAqIHogKyBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGEwMiAqIHggKyBhMTIgKiB5ICsgYTIyICogeiArIGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYTAzICogeCArIGExMyAqIHkgKyBhMjMgKiB6ICsgYVsxNV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdGhlIHZlYzMgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICoqL1xubWF0NC5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciB4ID0gdlswXSwgeSA9IHZbMV0sIHogPSB2WzJdO1xuXG4gICAgb3V0WzBdID0gYVswXSAqIHg7XG4gICAgb3V0WzFdID0gYVsxXSAqIHg7XG4gICAgb3V0WzJdID0gYVsyXSAqIHg7XG4gICAgb3V0WzNdID0gYVszXSAqIHg7XG4gICAgb3V0WzRdID0gYVs0XSAqIHk7XG4gICAgb3V0WzVdID0gYVs1XSAqIHk7XG4gICAgb3V0WzZdID0gYVs2XSAqIHk7XG4gICAgb3V0WzddID0gYVs3XSAqIHk7XG4gICAgb3V0WzhdID0gYVs4XSAqIHo7XG4gICAgb3V0WzldID0gYVs5XSAqIHo7XG4gICAgb3V0WzEwXSA9IGFbMTBdICogejtcbiAgICBvdXRbMTFdID0gYVsxMV0gKiB6O1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0NCBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5yb3RhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQsIGF4aXMpIHtcbiAgICB2YXIgeCA9IGF4aXNbMF0sIHkgPSBheGlzWzFdLCB6ID0gYXhpc1syXSxcbiAgICAgICAgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeiksXG4gICAgICAgIHMsIGMsIHQsXG4gICAgICAgIGEwMCwgYTAxLCBhMDIsIGEwMyxcbiAgICAgICAgYTEwLCBhMTEsIGExMiwgYTEzLFxuICAgICAgICBhMjAsIGEyMSwgYTIyLCBhMjMsXG4gICAgICAgIGIwMCwgYjAxLCBiMDIsXG4gICAgICAgIGIxMCwgYjExLCBiMTIsXG4gICAgICAgIGIyMCwgYjIxLCBiMjI7XG5cbiAgICBpZiAoTWF0aC5hYnMobGVuKSA8IEdMTUFUX0VQU0lMT04pIHsgcmV0dXJuIG51bGw7IH1cbiAgICBcbiAgICBsZW4gPSAxIC8gbGVuO1xuICAgIHggKj0gbGVuO1xuICAgIHkgKj0gbGVuO1xuICAgIHogKj0gbGVuO1xuXG4gICAgcyA9IE1hdGguc2luKHJhZCk7XG4gICAgYyA9IE1hdGguY29zKHJhZCk7XG4gICAgdCA9IDEgLSBjO1xuXG4gICAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgICBhMTAgPSBhWzRdOyBhMTEgPSBhWzVdOyBhMTIgPSBhWzZdOyBhMTMgPSBhWzddO1xuICAgIGEyMCA9IGFbOF07IGEyMSA9IGFbOV07IGEyMiA9IGFbMTBdOyBhMjMgPSBhWzExXTtcblxuICAgIC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxuICAgIGIwMCA9IHggKiB4ICogdCArIGM7IGIwMSA9IHkgKiB4ICogdCArIHogKiBzOyBiMDIgPSB6ICogeCAqIHQgLSB5ICogcztcbiAgICBiMTAgPSB4ICogeSAqIHQgLSB6ICogczsgYjExID0geSAqIHkgKiB0ICsgYzsgYjEyID0geiAqIHkgKiB0ICsgeCAqIHM7XG4gICAgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7IGIyMSA9IHkgKiB6ICogdCAtIHggKiBzOyBiMjIgPSB6ICogeiAqIHQgKyBjO1xuXG4gICAgLy8gUGVyZm9ybSByb3RhdGlvbi1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgICBvdXRbMF0gPSBhMDAgKiBiMDAgKyBhMTAgKiBiMDEgKyBhMjAgKiBiMDI7XG4gICAgb3V0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyO1xuICAgIG91dFsyXSA9IGEwMiAqIGIwMCArIGExMiAqIGIwMSArIGEyMiAqIGIwMjtcbiAgICBvdXRbM10gPSBhMDMgKiBiMDAgKyBhMTMgKiBiMDEgKyBhMjMgKiBiMDI7XG4gICAgb3V0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyO1xuICAgIG91dFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMjtcbiAgICBvdXRbNl0gPSBhMDIgKiBiMTAgKyBhMTIgKiBiMTEgKyBhMjIgKiBiMTI7XG4gICAgb3V0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyO1xuICAgIG91dFs4XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMjtcbiAgICBvdXRbOV0gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjI7XG4gICAgb3V0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMjtcbiAgICBvdXRbMTFdID0gYTAzICogYjIwICsgYTEzICogYjIxICsgYTIzICogYjIyO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWCBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5yb3RhdGVYID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKSxcbiAgICAgICAgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXG4gICAgICAgIG91dFswXSAgPSBhWzBdO1xuICAgICAgICBvdXRbMV0gID0gYVsxXTtcbiAgICAgICAgb3V0WzJdICA9IGFbMl07XG4gICAgICAgIG91dFszXSAgPSBhWzNdO1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFs0XSA9IGExMCAqIGMgKyBhMjAgKiBzO1xuICAgIG91dFs1XSA9IGExMSAqIGMgKyBhMjEgKiBzO1xuICAgIG91dFs2XSA9IGExMiAqIGMgKyBhMjIgKiBzO1xuICAgIG91dFs3XSA9IGExMyAqIGMgKyBhMjMgKiBzO1xuICAgIG91dFs4XSA9IGEyMCAqIGMgLSBhMTAgKiBzO1xuICAgIG91dFs5XSA9IGEyMSAqIGMgLSBhMTEgKiBzO1xuICAgIG91dFsxMF0gPSBhMjIgKiBjIC0gYTEyICogcztcbiAgICBvdXRbMTFdID0gYTIzICogYyAtIGExMyAqIHM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnJvdGF0ZVkgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpLFxuICAgICAgICBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdLFxuICAgICAgICBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcbiAgICAgICAgb3V0WzRdICA9IGFbNF07XG4gICAgICAgIG91dFs1XSAgPSBhWzVdO1xuICAgICAgICBvdXRbNl0gID0gYVs2XTtcbiAgICAgICAgb3V0WzddICA9IGFbN107XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYyAtIGEyMCAqIHM7XG4gICAgb3V0WzFdID0gYTAxICogYyAtIGEyMSAqIHM7XG4gICAgb3V0WzJdID0gYTAyICogYyAtIGEyMiAqIHM7XG4gICAgb3V0WzNdID0gYTAzICogYyAtIGEyMyAqIHM7XG4gICAgb3V0WzhdID0gYTAwICogcyArIGEyMCAqIGM7XG4gICAgb3V0WzldID0gYTAxICogcyArIGEyMSAqIGM7XG4gICAgb3V0WzEwXSA9IGEwMiAqIHMgKyBhMjIgKiBjO1xuICAgIG91dFsxMV0gPSBhMDMgKiBzICsgYTIzICogYztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQucm90YXRlWiA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCksXG4gICAgICAgIGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sXG4gICAgICAgIGExMSA9IGFbNV0sXG4gICAgICAgIGExMiA9IGFbNl0sXG4gICAgICAgIGExMyA9IGFbN107XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgICAgIG91dFs4XSAgPSBhWzhdO1xuICAgICAgICBvdXRbOV0gID0gYVs5XTtcbiAgICAgICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgICAgICBvdXRbMTFdID0gYVsxMV07XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYyArIGExMCAqIHM7XG4gICAgb3V0WzFdID0gYTAxICogYyArIGExMSAqIHM7XG4gICAgb3V0WzJdID0gYTAyICogYyArIGExMiAqIHM7XG4gICAgb3V0WzNdID0gYTAzICogYyArIGExMyAqIHM7XG4gICAgb3V0WzRdID0gYTEwICogYyAtIGEwMCAqIHM7XG4gICAgb3V0WzVdID0gYTExICogYyAtIGEwMSAqIHM7XG4gICAgb3V0WzZdID0gYTEyICogYyAtIGEwMiAqIHM7XG4gICAgb3V0WzddID0gYTEzICogYyAtIGEwMyAqIHM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiBhbmQgdmVjdG9yIHRyYW5zbGF0aW9uXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xuICogICAgIHZhciBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5mcm9tUm90YXRpb25UcmFuc2xhdGlvbiA9IGZ1bmN0aW9uIChvdXQsIHEsIHYpIHtcbiAgICAvLyBRdWF0ZXJuaW9uIG1hdGhcbiAgICB2YXIgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM10sXG4gICAgICAgIHgyID0geCArIHgsXG4gICAgICAgIHkyID0geSArIHksXG4gICAgICAgIHoyID0geiArIHosXG5cbiAgICAgICAgeHggPSB4ICogeDIsXG4gICAgICAgIHh5ID0geCAqIHkyLFxuICAgICAgICB4eiA9IHggKiB6MixcbiAgICAgICAgeXkgPSB5ICogeTIsXG4gICAgICAgIHl6ID0geSAqIHoyLFxuICAgICAgICB6eiA9IHogKiB6MixcbiAgICAgICAgd3ggPSB3ICogeDIsXG4gICAgICAgIHd5ID0gdyAqIHkyLFxuICAgICAgICB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSAoeXkgKyB6eik7XG4gICAgb3V0WzFdID0geHkgKyB3ejtcbiAgICBvdXRbMl0gPSB4eiAtIHd5O1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0geHkgLSB3ejtcbiAgICBvdXRbNV0gPSAxIC0gKHh4ICsgenopO1xuICAgIG91dFs2XSA9IHl6ICsgd3g7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSB4eiArIHd5O1xuICAgIG91dFs5XSA9IHl6IC0gd3g7XG4gICAgb3V0WzEwXSA9IDEgLSAoeHggKyB5eSk7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IHZbMF07XG4gICAgb3V0WzEzXSA9IHZbMV07XG4gICAgb3V0WzE0XSA9IHZbMl07XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuKiBDYWxjdWxhdGVzIGEgNHg0IG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXG4qXG4qIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXG4qXG4qIEByZXR1cm5zIHttYXQ0fSBvdXRcbiovXG5tYXQ0LmZyb21RdWF0ID0gZnVuY3Rpb24gKG91dCwgcSkge1xuICAgIHZhciB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXSxcbiAgICAgICAgeDIgPSB4ICsgeCxcbiAgICAgICAgeTIgPSB5ICsgeSxcbiAgICAgICAgejIgPSB6ICsgeixcblxuICAgICAgICB4eCA9IHggKiB4MixcbiAgICAgICAgeHkgPSB4ICogeTIsXG4gICAgICAgIHh6ID0geCAqIHoyLFxuICAgICAgICB5eSA9IHkgKiB5MixcbiAgICAgICAgeXogPSB5ICogejIsXG4gICAgICAgIHp6ID0geiAqIHoyLFxuICAgICAgICB3eCA9IHcgKiB4MixcbiAgICAgICAgd3kgPSB3ICogeTIsXG4gICAgICAgIHd6ID0gdyAqIHoyO1xuXG4gICAgb3V0WzBdID0gMSAtICh5eSArIHp6KTtcbiAgICBvdXRbMV0gPSB4eSArIHd6O1xuICAgIG91dFsyXSA9IHh6IC0gd3k7XG4gICAgb3V0WzNdID0gMDtcblxuICAgIG91dFs0XSA9IHh5IC0gd3o7XG4gICAgb3V0WzVdID0gMSAtICh4eCArIHp6KTtcbiAgICBvdXRbNl0gPSB5eiArIHd4O1xuICAgIG91dFs3XSA9IDA7XG5cbiAgICBvdXRbOF0gPSB4eiArIHd5O1xuICAgIG91dFs5XSA9IHl6IC0gd3g7XG4gICAgb3V0WzEwXSA9IDEgLSAoeHggKyB5eSk7XG4gICAgb3V0WzExXSA9IDA7XG5cbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGZydXN0dW0gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7TnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmZydXN0dW0gPSBmdW5jdGlvbiAob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICAgIHZhciBybCA9IDEgLyAocmlnaHQgLSBsZWZ0KSxcbiAgICAgICAgdGIgPSAxIC8gKHRvcCAtIGJvdHRvbSksXG4gICAgICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSAobmVhciAqIDIpICogcmw7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAobmVhciAqIDIpICogdGI7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IChyaWdodCArIGxlZnQpICogcmw7XG4gICAgb3V0WzldID0gKHRvcCArIGJvdHRvbSkgKiB0YjtcbiAgICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzExXSA9IC0xO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAoZmFyICogbmVhciAqIDIpICogbmY7XG4gICAgb3V0WzE1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGZvdnkgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IEFzcGVjdCByYXRpby4gdHlwaWNhbGx5IHZpZXdwb3J0IHdpZHRoL2hlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5wZXJzcGVjdGl2ZSA9IGZ1bmN0aW9uIChvdXQsIGZvdnksIGFzcGVjdCwgbmVhciwgZmFyKSB7XG4gICAgdmFyIGYgPSAxLjAgLyBNYXRoLnRhbihmb3Z5IC8gMiksXG4gICAgICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSBmIC8gYXNwZWN0O1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gZjtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTFdID0gLTE7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9ICgyICogZmFyICogbmVhcikgKiBuZjtcbiAgICBvdXRbMTVdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBvcnRob2dvbmFsIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0Lm9ydGhvID0gZnVuY3Rpb24gKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcbiAgICB2YXIgbHIgPSAxIC8gKGxlZnQgLSByaWdodCksXG4gICAgICAgIGJ0ID0gMSAvIChib3R0b20gLSB0b3ApLFxuICAgICAgICBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gLTIgKiBscjtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IC0yICogYnQ7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMiAqIG5mO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAobGVmdCArIHJpZ2h0KSAqIGxyO1xuICAgIG91dFsxM10gPSAodG9wICsgYm90dG9tKSAqIGJ0O1xuICAgIG91dFsxNF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBsb29rLWF0IG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBleWUgcG9zaXRpb24sIGZvY2FsIHBvaW50LCBhbmQgdXAgYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcbiAqIEBwYXJhbSB7dmVjM30gY2VudGVyIFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQubG9va0F0ID0gZnVuY3Rpb24gKG91dCwgZXllLCBjZW50ZXIsIHVwKSB7XG4gICAgdmFyIHgwLCB4MSwgeDIsIHkwLCB5MSwgeTIsIHowLCB6MSwgejIsIGxlbixcbiAgICAgICAgZXlleCA9IGV5ZVswXSxcbiAgICAgICAgZXlleSA9IGV5ZVsxXSxcbiAgICAgICAgZXlleiA9IGV5ZVsyXSxcbiAgICAgICAgdXB4ID0gdXBbMF0sXG4gICAgICAgIHVweSA9IHVwWzFdLFxuICAgICAgICB1cHogPSB1cFsyXSxcbiAgICAgICAgY2VudGVyeCA9IGNlbnRlclswXSxcbiAgICAgICAgY2VudGVyeSA9IGNlbnRlclsxXSxcbiAgICAgICAgY2VudGVyeiA9IGNlbnRlclsyXTtcblxuICAgIGlmIChNYXRoLmFicyhleWV4IC0gY2VudGVyeCkgPCBHTE1BVF9FUFNJTE9OICYmXG4gICAgICAgIE1hdGguYWJzKGV5ZXkgLSBjZW50ZXJ5KSA8IEdMTUFUX0VQU0lMT04gJiZcbiAgICAgICAgTWF0aC5hYnMoZXlleiAtIGNlbnRlcnopIDwgR0xNQVRfRVBTSUxPTikge1xuICAgICAgICByZXR1cm4gbWF0NC5pZGVudGl0eShvdXQpO1xuICAgIH1cblxuICAgIHowID0gZXlleCAtIGNlbnRlcng7XG4gICAgejEgPSBleWV5IC0gY2VudGVyeTtcbiAgICB6MiA9IGV5ZXogLSBjZW50ZXJ6O1xuXG4gICAgbGVuID0gMSAvIE1hdGguc3FydCh6MCAqIHowICsgejEgKiB6MSArIHoyICogejIpO1xuICAgIHowICo9IGxlbjtcbiAgICB6MSAqPSBsZW47XG4gICAgejIgKj0gbGVuO1xuXG4gICAgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxO1xuICAgIHgxID0gdXB6ICogejAgLSB1cHggKiB6MjtcbiAgICB4MiA9IHVweCAqIHoxIC0gdXB5ICogejA7XG4gICAgbGVuID0gTWF0aC5zcXJ0KHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4Mik7XG4gICAgaWYgKCFsZW4pIHtcbiAgICAgICAgeDAgPSAwO1xuICAgICAgICB4MSA9IDA7XG4gICAgICAgIHgyID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZW4gPSAxIC8gbGVuO1xuICAgICAgICB4MCAqPSBsZW47XG4gICAgICAgIHgxICo9IGxlbjtcbiAgICAgICAgeDIgKj0gbGVuO1xuICAgIH1cblxuICAgIHkwID0gejEgKiB4MiAtIHoyICogeDE7XG4gICAgeTEgPSB6MiAqIHgwIC0gejAgKiB4MjtcbiAgICB5MiA9IHowICogeDEgLSB6MSAqIHgwO1xuXG4gICAgbGVuID0gTWF0aC5zcXJ0KHkwICogeTAgKyB5MSAqIHkxICsgeTIgKiB5Mik7XG4gICAgaWYgKCFsZW4pIHtcbiAgICAgICAgeTAgPSAwO1xuICAgICAgICB5MSA9IDA7XG4gICAgICAgIHkyID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZW4gPSAxIC8gbGVuO1xuICAgICAgICB5MCAqPSBsZW47XG4gICAgICAgIHkxICo9IGxlbjtcbiAgICAgICAgeTIgKj0gbGVuO1xuICAgIH1cblxuICAgIG91dFswXSA9IHgwO1xuICAgIG91dFsxXSA9IHkwO1xuICAgIG91dFsyXSA9IHowO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0geDE7XG4gICAgb3V0WzVdID0geTE7XG4gICAgb3V0WzZdID0gejE7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSB4MjtcbiAgICBvdXRbOV0gPSB5MjtcbiAgICBvdXRbMTBdID0gejI7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IC0oeDAgKiBleWV4ICsgeDEgKiBleWV5ICsgeDIgKiBleWV6KTtcbiAgICBvdXRbMTNdID0gLSh5MCAqIGV5ZXggKyB5MSAqIGV5ZXkgKyB5MiAqIGV5ZXopO1xuICAgIG91dFsxNF0gPSAtKHowICogZXlleCArIHoxICogZXlleSArIHoyICogZXlleik7XG4gICAgb3V0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gbWF0IG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDQuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnLCAnICtcbiAgICAgICAgICAgICAgICAgICAgYVs0XSArICcsICcgKyBhWzVdICsgJywgJyArIGFbNl0gKyAnLCAnICsgYVs3XSArICcsICcgK1xuICAgICAgICAgICAgICAgICAgICBhWzhdICsgJywgJyArIGFbOV0gKyAnLCAnICsgYVsxMF0gKyAnLCAnICsgYVsxMV0gKyAnLCAnICsgXG4gICAgICAgICAgICAgICAgICAgIGFbMTJdICsgJywgJyArIGFbMTNdICsgJywgJyArIGFbMTRdICsgJywgJyArIGFbMTVdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMubWF0NCA9IG1hdDQ7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyBRdWF0ZXJuaW9uXG4gKiBAbmFtZSBxdWF0XG4gKi9cblxudmFyIHF1YXQgPSB7fTtcblxudmFyIHF1YXRJZGVudGl0eSA9IG5ldyBGbG9hdDMyQXJyYXkoWzAsIDAsIDAsIDFdKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IHF1YXRcbiAqXG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxuICovXG5xdWF0LmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBjbG9uZVxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmNsb25lID0gdmVjNC5jbG9uZTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5mcm9tVmFsdWVzID0gdmVjNC5mcm9tVmFsdWVzO1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBxdWF0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgc291cmNlIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmNvcHkgPSB2ZWM0LmNvcHk7XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgcXVhdCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc2V0ID0gdmVjNC5zZXQ7XG5cbi8qKlxuICogU2V0IGEgcXVhdCB0byB0aGUgaWRlbnRpdHkgcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXRzIGEgcXVhdCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhbmQgcm90YXRpb24gYXhpcyxcbiAqIHRoZW4gcmV0dXJucyBpdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyBhcm91bmQgd2hpY2ggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSBpbiByYWRpYW5zXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiovXG5xdWF0LnNldEF4aXNBbmdsZSA9IGZ1bmN0aW9uKG91dCwgYXhpcywgcmFkKSB7XG4gICAgcmFkID0gcmFkICogMC41O1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKTtcbiAgICBvdXRbMF0gPSBzICogYXhpc1swXTtcbiAgICBvdXRbMV0gPSBzICogYXhpc1sxXTtcbiAgICBvdXRbMl0gPSBzICogYXhpc1syXTtcbiAgICBvdXRbM10gPSBNYXRoLmNvcyhyYWQpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5hZGQgPSB2ZWM0LmFkZDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0Lm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXSxcbiAgICAgICAgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXSwgYncgPSBiWzNdO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieTtcbiAgICBvdXRbMV0gPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYng7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5tdWwgPSBxdWF0Lm11bHRpcGx5O1xuXG4vKipcbiAqIFNjYWxlcyBhIHF1YXQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc2NhbGUgPSB2ZWM0LnNjYWxlO1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQucm90YXRlWCA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHJhZCAqPSAwLjU7IFxuXG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXSxcbiAgICAgICAgYnggPSBNYXRoLnNpbihyYWQpLCBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieDtcbiAgICBvdXRbMV0gPSBheSAqIGJ3ICsgYXogKiBieDtcbiAgICBvdXRbMl0gPSBheiAqIGJ3IC0gYXkgKiBieDtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnJvdGF0ZVkgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICByYWQgKj0gMC41OyBcblxuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ5ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnk7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF4ICogYnk7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF5ICogYnk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWiBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5yb3RhdGVaID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgcmFkICo9IDAuNTsgXG5cbiAgICB2YXIgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdLFxuICAgICAgICBieiA9IE1hdGguc2luKHJhZCksIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGF4ICogYncgKyBheSAqIGJ6O1xuICAgIG91dFsxXSA9IGF5ICogYncgLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheiAqIGJ6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIFcgY29tcG9uZW50IG9mIGEgcXVhdCBmcm9tIHRoZSBYLCBZLCBhbmQgWiBjb21wb25lbnRzLlxuICogQXNzdW1lcyB0aGF0IHF1YXRlcm5pb24gaXMgMSB1bml0IGluIGxlbmd0aC5cbiAqIEFueSBleGlzdGluZyBXIGNvbXBvbmVudCB3aWxsIGJlIGlnbm9yZWQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgVyBjb21wb25lbnQgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5jYWxjdWxhdGVXID0gZnVuY3Rpb24gKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuXG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgb3V0WzNdID0gLU1hdGguc3FydChNYXRoLmFicygxLjAgLSB4ICogeCAtIHkgKiB5IC0geiAqIHopKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5kb3QgPSB2ZWM0LmRvdDtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5sZXJwID0gdmVjNC5sZXJwO1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnNsZXJwID0gZnVuY3Rpb24gKG91dCwgYSwgYiwgdCkge1xuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl0sIGJ3ID0gYlszXTtcblxuICAgIHZhciBjb3NIYWxmVGhldGEgPSBheCAqIGJ4ICsgYXkgKiBieSArIGF6ICogYnogKyBhdyAqIGJ3LFxuICAgICAgICBoYWxmVGhldGEsXG4gICAgICAgIHNpbkhhbGZUaGV0YSxcbiAgICAgICAgcmF0aW9BLFxuICAgICAgICByYXRpb0I7XG5cbiAgICBpZiAoTWF0aC5hYnMoY29zSGFsZlRoZXRhKSA+PSAxLjApIHtcbiAgICAgICAgaWYgKG91dCAhPT0gYSkge1xuICAgICAgICAgICAgb3V0WzBdID0gYXg7XG4gICAgICAgICAgICBvdXRbMV0gPSBheTtcbiAgICAgICAgICAgIG91dFsyXSA9IGF6O1xuICAgICAgICAgICAgb3V0WzNdID0gYXc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG5cbiAgICBoYWxmVGhldGEgPSBNYXRoLmFjb3MoY29zSGFsZlRoZXRhKTtcbiAgICBzaW5IYWxmVGhldGEgPSBNYXRoLnNxcnQoMS4wIC0gY29zSGFsZlRoZXRhICogY29zSGFsZlRoZXRhKTtcblxuICAgIGlmIChNYXRoLmFicyhzaW5IYWxmVGhldGEpIDwgMC4wMDEpIHtcbiAgICAgICAgb3V0WzBdID0gKGF4ICogMC41ICsgYnggKiAwLjUpO1xuICAgICAgICBvdXRbMV0gPSAoYXkgKiAwLjUgKyBieSAqIDAuNSk7XG4gICAgICAgIG91dFsyXSA9IChheiAqIDAuNSArIGJ6ICogMC41KTtcbiAgICAgICAgb3V0WzNdID0gKGF3ICogMC41ICsgYncgKiAwLjUpO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICAgIHJhdGlvQSA9IE1hdGguc2luKCgxIC0gdCkgKiBoYWxmVGhldGEpIC8gc2luSGFsZlRoZXRhO1xuICAgIHJhdGlvQiA9IE1hdGguc2luKHQgKiBoYWxmVGhldGEpIC8gc2luSGFsZlRoZXRhO1xuXG4gICAgb3V0WzBdID0gKGF4ICogcmF0aW9BICsgYnggKiByYXRpb0IpO1xuICAgIG91dFsxXSA9IChheSAqIHJhdGlvQSArIGJ5ICogcmF0aW9CKTtcbiAgICBvdXRbMl0gPSAoYXogKiByYXRpb0EgKyBieiAqIHJhdGlvQik7XG4gICAgb3V0WzNdID0gKGF3ICogcmF0aW9BICsgYncgKiByYXRpb0IpO1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaW52ZXJzZSBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBpbnZlcnNlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSxcbiAgICAgICAgZG90ID0gYTAqYTAgKyBhMSphMSArIGEyKmEyICsgYTMqYTMsXG4gICAgICAgIGludkRvdCA9IGRvdCA/IDEuMC9kb3QgOiAwO1xuICAgIFxuICAgIC8vIFRPRE86IFdvdWxkIGJlIGZhc3RlciB0byByZXR1cm4gWzAsMCwwLDBdIGltbWVkaWF0ZWx5IGlmIGRvdCA9PSAwXG5cbiAgICBvdXRbMF0gPSAtYTAqaW52RG90O1xuICAgIG91dFsxXSA9IC1hMSppbnZEb3Q7XG4gICAgb3V0WzJdID0gLWEyKmludkRvdDtcbiAgICBvdXRbM10gPSBhMyppbnZEb3Q7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgY29uanVnYXRlIG9mIGEgcXVhdFxuICogSWYgdGhlIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0LmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5jb25qdWdhdGUgPSBmdW5jdGlvbiAob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubGVuZ3RoID0gdmVjNC5sZW5ndGg7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmxlbiA9IHF1YXQubGVuZ3RoO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5zcXVhcmVkTGVuZ3RoID0gdmVjNC5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc3FyTGVuID0gcXVhdC5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubm9ybWFsaXplID0gdmVjNC5ub3JtYWxpemU7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gM3gzIHJvdGF0aW9uIG1hdHJpeC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7bWF0M30gbSByb3RhdGlvbiBtYXRyaXhcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmZyb21NYXQzID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzX2lOZXh0ID0gWzEsMiwwXTtcbiAgICByZXR1cm4gZnVuY3Rpb24ob3V0LCBtKSB7XG4gICAgICAgIC8vIEFsZ29yaXRobSBpbiBLZW4gU2hvZW1ha2UncyBhcnRpY2xlIGluIDE5ODcgU0lHR1JBUEggY291cnNlIG5vdGVzXG4gICAgICAgIC8vIGFydGljbGUgXCJRdWF0ZXJuaW9uIENhbGN1bHVzIGFuZCBGYXN0IEFuaW1hdGlvblwiLlxuICAgICAgICB2YXIgZlRyYWNlID0gbVswXSArIG1bNF0gKyBtWzhdO1xuICAgICAgICB2YXIgZlJvb3Q7XG5cbiAgICAgICAgaWYgKCBmVHJhY2UgPiAwLjAgKSB7XG4gICAgICAgICAgICAvLyB8d3wgPiAxLzIsIG1heSBhcyB3ZWxsIGNob29zZSB3ID4gMS8yXG4gICAgICAgICAgICBmUm9vdCA9IE1hdGguc3FydChmVHJhY2UgKyAxLjApOyAgLy8gMndcbiAgICAgICAgICAgIG91dFszXSA9IDAuNSAqIGZSb290O1xuICAgICAgICAgICAgZlJvb3QgPSAwLjUvZlJvb3Q7ICAvLyAxLyg0dylcbiAgICAgICAgICAgIG91dFswXSA9IChtWzddLW1bNV0pKmZSb290O1xuICAgICAgICAgICAgb3V0WzFdID0gKG1bMl0tbVs2XSkqZlJvb3Q7XG4gICAgICAgICAgICBvdXRbMl0gPSAobVszXS1tWzFdKSpmUm9vdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHx3fCA8PSAxLzJcbiAgICAgICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgICAgIGlmICggbVs0XSA+IG1bMF0gKVxuICAgICAgICAgICAgICBpID0gMTtcbiAgICAgICAgICAgIGlmICggbVs4XSA+IG1baSozK2ldIClcbiAgICAgICAgICAgICAgaSA9IDI7XG4gICAgICAgICAgICB2YXIgaiA9IHNfaU5leHRbaV07XG4gICAgICAgICAgICB2YXIgayA9IHNfaU5leHRbal07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZSb290ID0gTWF0aC5zcXJ0KG1baSozK2ldLW1baiozK2pdLW1bayozK2tdICsgMS4wKTtcbiAgICAgICAgICAgIG91dFtpXSA9IDAuNSAqIGZSb290O1xuICAgICAgICAgICAgZlJvb3QgPSAwLjUgLyBmUm9vdDtcbiAgICAgICAgICAgIG91dFszXSA9IChtW2sqMytqXSAtIG1baiozK2tdKSAqIGZSb290O1xuICAgICAgICAgICAgb3V0W2pdID0gKG1baiozK2ldICsgbVtpKjMral0pICogZlJvb3Q7XG4gICAgICAgICAgICBvdXRba10gPSAobVtrKjMraV0gKyBtW2kqMytrXSkgKiBmUm9vdDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgcXVhdGVuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSB2ZWMgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xucXVhdC5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAncXVhdCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnF1YXQgPSBxdWF0O1xufVxuO1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4gIH0pKHNoaW0uZXhwb3J0cyk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgc2xpY2UgPSBbXS5zbGljZTtcblxuICBmdW5jdGlvbiBxdWV1ZShwYXJhbGxlbGlzbSkge1xuICAgIHZhciBxLFxuICAgICAgICB0YXNrcyA9IFtdLFxuICAgICAgICBzdGFydGVkID0gMCwgLy8gbnVtYmVyIG9mIHRhc2tzIHRoYXQgaGF2ZSBiZWVuIHN0YXJ0ZWQgKGFuZCBwZXJoYXBzIGZpbmlzaGVkKVxuICAgICAgICBhY3RpdmUgPSAwLCAvLyBudW1iZXIgb2YgdGFza3MgY3VycmVudGx5IGJlaW5nIGV4ZWN1dGVkIChzdGFydGVkIGJ1dCBub3QgZmluaXNoZWQpXG4gICAgICAgIHJlbWFpbmluZyA9IDAsIC8vIG51bWJlciBvZiB0YXNrcyBub3QgeWV0IGZpbmlzaGVkXG4gICAgICAgIHBvcHBpbmcsIC8vIGluc2lkZSBhIHN5bmNocm9ub3VzIHRhc2sgY2FsbGJhY2s/XG4gICAgICAgIGVycm9yID0gbnVsbCxcbiAgICAgICAgYXdhaXQgPSBub29wLFxuICAgICAgICBhbGw7XG5cbiAgICBpZiAoIXBhcmFsbGVsaXNtKSBwYXJhbGxlbGlzbSA9IEluZmluaXR5O1xuXG4gICAgZnVuY3Rpb24gcG9wKCkge1xuICAgICAgd2hpbGUgKHBvcHBpbmcgPSBzdGFydGVkIDwgdGFza3MubGVuZ3RoICYmIGFjdGl2ZSA8IHBhcmFsbGVsaXNtKSB7XG4gICAgICAgIHZhciBpID0gc3RhcnRlZCsrLFxuICAgICAgICAgICAgdCA9IHRhc2tzW2ldLFxuICAgICAgICAgICAgYSA9IHNsaWNlLmNhbGwodCwgMSk7XG4gICAgICAgIGEucHVzaChjYWxsYmFjayhpKSk7XG4gICAgICAgICsrYWN0aXZlO1xuICAgICAgICB0WzBdLmFwcGx5KG51bGwsIGEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGxiYWNrKGkpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlLCByKSB7XG4gICAgICAgIC0tYWN0aXZlO1xuICAgICAgICBpZiAoZXJyb3IgIT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICBpZiAoZSAhPSBudWxsKSB7XG4gICAgICAgICAgZXJyb3IgPSBlOyAvLyBpZ25vcmUgbmV3IHRhc2tzIGFuZCBzcXVlbGNoIGFjdGl2ZSBjYWxsYmFja3NcbiAgICAgICAgICBzdGFydGVkID0gcmVtYWluaW5nID0gTmFOOyAvLyBzdG9wIHF1ZXVlZCB0YXNrcyBmcm9tIHN0YXJ0aW5nXG4gICAgICAgICAgbm90aWZ5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFza3NbaV0gPSByO1xuICAgICAgICAgIGlmICgtLXJlbWFpbmluZykgcG9wcGluZyB8fCBwb3AoKTtcbiAgICAgICAgICBlbHNlIG5vdGlmeSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vdGlmeSgpIHtcbiAgICAgIGlmIChlcnJvciAhPSBudWxsKSBhd2FpdChlcnJvcik7XG4gICAgICBlbHNlIGlmIChhbGwpIGF3YWl0KGVycm9yLCB0YXNrcyk7XG4gICAgICBlbHNlIGF3YWl0LmFwcGx5KG51bGwsIFtlcnJvcl0uY29uY2F0KHRhc2tzKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHEgPSB7XG4gICAgICBkZWZlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgICB0YXNrcy5wdXNoKGFyZ3VtZW50cyk7XG4gICAgICAgICAgKytyZW1haW5pbmc7XG4gICAgICAgICAgcG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgICB9LFxuICAgICAgYXdhaXQ6IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgYXdhaXQgPSBmO1xuICAgICAgICBhbGwgPSBmYWxzZTtcbiAgICAgICAgaWYgKCFyZW1haW5pbmcpIG5vdGlmeSgpO1xuICAgICAgICByZXR1cm4gcTtcbiAgICAgIH0sXG4gICAgICBhd2FpdEFsbDogZnVuY3Rpb24oZikge1xuICAgICAgICBhd2FpdCA9IGY7XG4gICAgICAgIGFsbCA9IHRydWU7XG4gICAgICAgIGlmICghcmVtYWluaW5nKSBub3RpZnkoKTtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4gIHF1ZXVlLnZlcnNpb24gPSBcIjEuMC43XCI7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gcXVldWU7IH0pO1xuICBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IHF1ZXVlO1xuICBlbHNlIHRoaXMucXVldWUgPSBxdWV1ZTtcbn0pKCk7XG4iLCIvLyBNaXNjZWxsYW5lb3VzIGdlbyBmdW5jdGlvbnNcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vcG9pbnQuanMnKTtcblxudmFyIEdlbyA9IHt9O1xuXG4vLyBQcm9qZWN0aW9uIGNvbnN0YW50c1xuR2VvLnRpbGVfc2l6ZSA9IDI1Njtcbkdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzID0gMjAwMzc1MDguMzQyNzg5MjQ0O1xuR2VvLm1hcF9vcmlnaW5fbWV0ZXJzID0gUG9pbnQoLUdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzLCBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyk7XG5HZW8ubWluX3pvb21fbWV0ZXJzX3Blcl9waXhlbCA9IEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzICogMiAvIEdlby50aWxlX3NpemU7IC8vIG1pbiB6b29tIGRyYXdzIHdvcmxkIGFzIDIgdGlsZXMgd2lkZVxuR2VvLm1ldGVyc19wZXJfcGl4ZWwgPSBbXTtcbkdlby5tYXhfem9vbSA9IDIwO1xuZm9yICh2YXIgej0wOyB6IDw9IEdlby5tYXhfem9vbTsgeisrKSB7XG4gICAgR2VvLm1ldGVyc19wZXJfcGl4ZWxbel0gPSBHZW8ubWluX3pvb21fbWV0ZXJzX3Blcl9waXhlbCAvIE1hdGgucG93KDIsIHopO1xufVxuXG4vLyBDb252ZXJzaW9uIGZ1bmN0aW9ucyBiYXNlZCBvbiBhbiBkZWZpbmVkIHRpbGUgc2NhbGVcbkdlby51bml0c19wZXJfbWV0ZXIgPSBbXTtcbkdlby5zZXRUaWxlU2NhbGUgPSBmdW5jdGlvbihzY2FsZSlcbntcbiAgICBHZW8udGlsZV9zY2FsZSA9IHNjYWxlO1xuICAgIEdlby51bml0c19wZXJfcGl4ZWwgPSBHZW8udGlsZV9zY2FsZSAvIEdlby50aWxlX3NpemU7XG5cbiAgICBmb3IgKHZhciB6PTA7IHogPD0gR2VvLm1heF96b29tOyB6KyspIHtcbiAgICAgICAgR2VvLnVuaXRzX3Blcl9tZXRlclt6XSA9IEdlby50aWxlX3NjYWxlIC8gKEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt6XSk7XG4gICAgfVxufTtcblxuLy8gQ29udmVydCB0aWxlIGxvY2F0aW9uIHRvIG1lcmNhdG9yIG1ldGVycyAtIG11bHRpcGx5IGJ5IHBpeGVscyBwZXIgdGlsZSwgdGhlbiBieSBtZXRlcnMgcGVyIHBpeGVsLCBhZGp1c3QgZm9yIG1hcCBvcmlnaW5cbkdlby5tZXRlcnNGb3JUaWxlID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgcmV0dXJuIFBvaW50KFxuICAgICAgICAodGlsZS54ICogR2VvLnRpbGVfc2l6ZSAqIEdlby5tZXRlcnNfcGVyX3BpeGVsW3RpbGUuel0pICsgR2VvLm1hcF9vcmlnaW5fbWV0ZXJzLngsXG4gICAgICAgICgodGlsZS55ICogR2VvLnRpbGVfc2l6ZSAqIEdlby5tZXRlcnNfcGVyX3BpeGVsW3RpbGUuel0pICogLTEpICsgR2VvLm1hcF9vcmlnaW5fbWV0ZXJzLnlcbiAgICApO1xufTtcblxuLy8gQ29udmVydCBtZXJjYXRvciBtZXRlcnMgdG8gbGF0LWxuZ1xuR2VvLm1ldGVyc1RvTGF0TG5nID0gZnVuY3Rpb24gKG1ldGVycylcbntcbiAgICB2YXIgYyA9IFBvaW50LmNvcHkobWV0ZXJzKTtcblxuICAgIGMueCAvPSBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycztcbiAgICBjLnkgLz0gR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnM7XG5cbiAgICBjLnkgPSAoMiAqIE1hdGguYXRhbihNYXRoLmV4cChjLnkgKiBNYXRoLlBJKSkgLSAoTWF0aC5QSSAvIDIpKSAvIE1hdGguUEk7XG5cbiAgICBjLnggKj0gMTgwO1xuICAgIGMueSAqPSAxODA7XG5cbiAgICByZXR1cm4gYztcbn07XG5cbi8vIENvbnZlcnQgbGF0LWxuZyB0byBtZXJjYXRvciBtZXRlcnNcbkdlby5sYXRMbmdUb01ldGVycyA9IGZ1bmN0aW9uKGxhdGxuZylcbntcbiAgICB2YXIgYyA9IFBvaW50LmNvcHkobGF0bG5nKTtcblxuICAgIC8vIExhdGl0dWRlXG4gICAgYy55ID0gTWF0aC5sb2coTWF0aC50YW4oKGMueSArIDkwKSAqIE1hdGguUEkgLyAzNjApKSAvIChNYXRoLlBJIC8gMTgwKTtcbiAgICBjLnkgPSBjLnkgKiBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAvIDE4MDtcblxuICAgIC8vIExvbmdpdHVkZVxuICAgIGMueCA9IGMueCAqIEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzIC8gMTgwO1xuXG4gICAgcmV0dXJuIGM7XG59O1xuXG4vLyBSdW4gYSB0cmFuc2Zvcm0gZnVuY3Rpb24gb24gZWFjaCBjb29vcmRpbmF0ZSBpbiBhIEdlb0pTT04gZ2VvbWV0cnlcbkdlby50cmFuc2Zvcm1HZW9tZXRyeSA9IGZ1bmN0aW9uIChnZW9tZXRyeSwgdHJhbnNmb3JtKVxue1xuICAgIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2ludCcpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybShnZW9tZXRyeS5jb29yZGluYXRlcyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnIHx8IGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9pbnQnKSB7XG4gICAgICAgIHJldHVybiBnZW9tZXRyeS5jb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgfHwgZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlMaW5lU3RyaW5nJykge1xuICAgICAgICByZXR1cm4gZ2VvbWV0cnkuY29vcmRpbmF0ZXMubWFwKGZ1bmN0aW9uIChjb29yZGluYXRlcykge1xuICAgICAgICAgICAgcmV0dXJuIGNvb3JkaW5hdGVzLm1hcCh0cmFuc2Zvcm0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2x5Z29uJykge1xuICAgICAgICByZXR1cm4gZ2VvbWV0cnkuY29vcmRpbmF0ZXMubWFwKGZ1bmN0aW9uIChwb2x5Z29uKSB7XG4gICAgICAgICAgICByZXR1cm4gcG9seWdvbi5tYXAoZnVuY3Rpb24gKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvb3JkaW5hdGVzLm1hcCh0cmFuc2Zvcm0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBUT0RPOiBzdXBwb3J0IEdlb21ldHJ5Q29sbGVjdGlvblxuICAgIHJldHVybiB7fTtcbn07XG5cbkdlby5ib3hJbnRlcnNlY3QgPSBmdW5jdGlvbiAoYjEsIGIyKVxue1xuICAgIHJldHVybiAhKFxuICAgICAgICBiMi5zdy54ID4gYjEubmUueCB8fFxuICAgICAgICBiMi5uZS54IDwgYjEuc3cueCB8fFxuICAgICAgICBiMi5zdy55ID4gYjEubmUueSB8fFxuICAgICAgICBiMi5uZS55IDwgYjEuc3cueVxuICAgICk7XG59O1xuXG4vLyBTcGxpdCB0aGUgbGluZXMgb2YgYSBmZWF0dXJlIHdoZXJldmVyIHR3byBwb2ludHMgYXJlIGZhcnRoZXIgYXBhcnQgdGhhbiBhIGdpdmVuIHRvbGVyYW5jZVxuR2VvLnNwbGl0RmVhdHVyZUxpbmVzICA9IGZ1bmN0aW9uIChmZWF0dXJlLCB0b2xlcmFuY2UpIHtcbiAgICB2YXIgdG9sZXJhbmNlID0gdG9sZXJhbmNlIHx8IDAuMDAxO1xuICAgIHZhciB0b2xlcmFuY2Vfc3EgPSB0b2xlcmFuY2UgKiB0b2xlcmFuY2U7XG4gICAgdmFyIGdlb20gPSBmZWF0dXJlLmdlb21ldHJ5O1xuICAgIHZhciBsaW5lcztcblxuICAgIGlmIChnZW9tLnR5cGUgPT0gJ011bHRpTGluZVN0cmluZycpIHtcbiAgICAgICAgbGluZXMgPSBnZW9tLmNvb3JkaW5hdGVzO1xuICAgIH1cbiAgICBlbHNlIGlmIChnZW9tLnR5cGUgPT0nTGluZVN0cmluZycpIHtcbiAgICAgICAgbGluZXMgPSBbZ2VvbS5jb29yZGluYXRlc107XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gZmVhdHVyZTtcbiAgICB9XG5cbiAgICB2YXIgc3BsaXRfbGluZXMgPSBbXTtcblxuICAgIGZvciAodmFyIHM9MDsgcyA8IGxpbmVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgIHZhciBzZWcgPSBsaW5lc1tzXTtcbiAgICAgICAgdmFyIHNwbGl0X3NlZyA9IFtdO1xuICAgICAgICB2YXIgbGFzdF9jb29yZCA9IG51bGw7XG4gICAgICAgIHZhciBrZWVwO1xuXG4gICAgICAgIGZvciAodmFyIGM9MDsgYyA8IHNlZy5sZW5ndGg7IGMrKykge1xuICAgICAgICAgICAgdmFyIGNvb3JkID0gc2VnW2NdO1xuICAgICAgICAgICAga2VlcCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChsYXN0X2Nvb3JkICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlzdCA9IChjb29yZFswXSAtIGxhc3RfY29vcmRbMF0pICogKGNvb3JkWzBdIC0gbGFzdF9jb29yZFswXSkgKyAoY29vcmRbMV0gLSBsYXN0X2Nvb3JkWzFdKSAqIChjb29yZFsxXSAtIGxhc3RfY29vcmRbMV0pO1xuICAgICAgICAgICAgICAgIGlmIChkaXN0ID4gdG9sZXJhbmNlX3NxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwic3BsaXQgbGluZXMgYXQgKFwiICsgY29vcmRbMF0gKyBcIiwgXCIgKyBjb29yZFsxXSArIFwiKSwgXCIgKyBNYXRoLnNxcnQoZGlzdCkgKyBcIiBhcGFydFwiKTtcbiAgICAgICAgICAgICAgICAgICAga2VlcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGtlZXAgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBzcGxpdF9saW5lcy5wdXNoKHNwbGl0X3NlZyk7XG4gICAgICAgICAgICAgICAgc3BsaXRfc2VnID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzcGxpdF9zZWcucHVzaChjb29yZCk7XG5cbiAgICAgICAgICAgIGxhc3RfY29vcmQgPSBjb29yZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHNwbGl0X2xpbmVzLnB1c2goc3BsaXRfc2VnKTtcbiAgICAgICAgc3BsaXRfc2VnID0gW107XG4gICAgfVxuXG4gICAgaWYgKHNwbGl0X2xpbmVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIGdlb20udHlwZSA9ICdMaW5lU3RyaW5nJztcbiAgICAgICAgZ2VvbS5jb29yZGluYXRlcyA9IHNwbGl0X2xpbmVzWzBdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZ2VvbS50eXBlID0gJ011bHRpTGluZVN0cmluZyc7XG4gICAgICAgIGdlb20uY29vcmRpbmF0ZXMgPSBzcGxpdF9saW5lcztcbiAgICB9XG5cbiAgICByZXR1cm4gZmVhdHVyZTtcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gR2VvO1xufVxuIiwiLy8gV2ViR0wgbWFuYWdlbWVudCBhbmQgcmVuZGVyaW5nIGZ1bmN0aW9uc1xuXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xuLy8gdmFyIEdMVmVydGV4QXJyYXlPYmplY3QgPSByZXF1aXJlKCcuL2dsX3Zhby5qcycpO1xuXG52YXIgR0wgPSB7fTtcblxuLy8gU2V0dXAgYSBXZWJHTCBjb250ZXh0XG4vLyBJZiBubyBjYW52YXMgZWxlbWVudCBpcyBwcm92aWRlZCwgb25lIGlzIGNyZWF0ZWQgYW5kIGFkZGVkIHRvIHRoZSBkb2N1bWVudCBib2R5XG5HTC5nZXRDb250ZXh0ID0gZnVuY3Rpb24gZ2V0Q29udGV4dCAoY2FudmFzKVxue1xuXG4gICAgdmFyIGZ1bGxzY3JlZW4gPSBmYWxzZTtcbiAgICBpZiAoY2FudmFzID09IG51bGwpIHtcbiAgICAgICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIGNhbnZhcy5zdHlsZS50b3AgPSAwO1xuICAgICAgICBjYW52YXMuc3R5bGUubGVmdCA9IDA7XG4gICAgICAgIGNhbnZhcy5zdHlsZS56SW5kZXggPSAtMTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgICAgICBmdWxsc2NyZWVuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dCgnZXhwZXJpbWVudGFsLXdlYmdsJyk7XG4gICAgaWYgKCFnbCkge1xuICAgICAgICBhbGVydChcIkNvdWxkbid0IGNyZWF0ZSBXZWJHTCBjb250ZXh0LiBZb3VyIGJyb3dzZXIgcHJvYmFibHkgZG9lc24ndCBzdXBwb3J0IFdlYkdMIG9yIGl0J3MgdHVybmVkIG9mZj9cIik7XG4gICAgICAgIHRocm93IFwiQ291bGRuJ3QgY3JlYXRlIFdlYkdMIGNvbnRleHRcIjtcbiAgICB9XG5cbiAgICBHTC5yZXNpemVDYW52YXMoZ2wsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIGlmIChmdWxsc2NyZWVuID09IHRydWUpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIEdMLnJlc2l6ZUNhbnZhcyhnbCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEdMVmVydGV4QXJyYXlPYmplY3QuaW5pdChnbCk7IC8vIFRPRE86IHRoaXMgcGF0dGVybiBkb2Vzbid0IHN1cHBvcnQgbXVsdGlwbGUgYWN0aXZlIEdMIGNvbnRleHRzLCBzaG91bGQgdGhhdCBldmVuIGJlIHN1cHBvcnRlZD9cblxuICAgIHJldHVybiBnbDtcbn07XG5cbkdMLnJlc2l6ZUNhbnZhcyA9IGZ1bmN0aW9uIChnbCwgd2lkdGgsIGhlaWdodClcbntcbiAgICB2YXIgZGV2aWNlX3BpeGVsX3JhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICBnbC5jYW52YXMuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCc7XG4gICAgZ2wuY2FudmFzLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gICAgZ2wuY2FudmFzLndpZHRoID0gTWF0aC5yb3VuZChnbC5jYW52YXMuc3R5bGUud2lkdGggKiBkZXZpY2VfcGl4ZWxfcmF0aW8pO1xuICAgIGdsLmNhbnZhcy5oZWlnaHQgPSBNYXRoLnJvdW5kKGdsLmNhbnZhcy5zdHlsZS53aWR0aCAqIGRldmljZV9waXhlbF9yYXRpbyk7XG4gICAgZ2wudmlld3BvcnQoMCwgMCwgZ2wuY2FudmFzLndpZHRoLCBnbC5jYW52YXMuaGVpZ2h0KTtcbn07XG5cbi8vIENvbXBpbGUgJiBsaW5rIGEgV2ViR0wgcHJvZ3JhbSBmcm9tIHByb3ZpZGVkIHZlcnRleCBhbmQgZnJhZ21lbnQgc2hhZGVyIHNvdXJjZXNcbi8vIHVwZGF0ZSBhIHByb2dyYW0gaWYgb25lIGlzIHBhc3NlZCBpbi4gQ3JlYXRlIG9uZSBpZiBub3QuIEFsZXJ0IGFuZCBkb24ndCB1cGRhdGUgYW55dGhpbmcgaWYgdGhlIHNoYWRlcnMgZG9uJ3QgY29tcGlsZS5cbkdMLnVwZGF0ZVByb2dyYW0gPSBmdW5jdGlvbiBHTHVwZGF0ZVByb2dyYW0gKGdsLCBwcm9ncmFtLCB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSlcbntcbiAgICB0cnkge1xuICAgICAgICB2YXIgdmVydGV4X3NoYWRlciA9IEdMLmNyZWF0ZVNoYWRlcihnbCwgdmVydGV4X3NoYWRlcl9zb3VyY2UsIGdsLlZFUlRFWF9TSEFERVIpO1xuICAgICAgICB2YXIgZnJhZ21lbnRfc2hhZGVyID0gR0wuY3JlYXRlU2hhZGVyKGdsLCAnI2lmZGVmIEdMX0VTXFxucHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xcbiNlbmRpZlxcblxcbicgKyBmcmFnbWVudF9zaGFkZXJfc291cmNlLCBnbC5GUkFHTUVOVF9TSEFERVIpO1xuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgLy8gYWxlcnQoZXJyKTtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmV0dXJuIHByb2dyYW07XG4gICAgfVxuXG4gICAgZ2wudXNlUHJvZ3JhbShudWxsKTtcbiAgICBpZiAocHJvZ3JhbSAhPSBudWxsKSB7XG4gICAgICAgIHZhciBvbGRfc2hhZGVycyA9IGdsLmdldEF0dGFjaGVkU2hhZGVycyhwcm9ncmFtKTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IG9sZF9zaGFkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBnbC5kZXRhY2hTaGFkZXIocHJvZ3JhbSwgb2xkX3NoYWRlcnNbaV0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICB9XG5cbiAgICBpZiAodmVydGV4X3NoYWRlciA9PSBudWxsIHx8IGZyYWdtZW50X3NoYWRlciA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cblxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0ZXhfc2hhZGVyKTtcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnJhZ21lbnRfc2hhZGVyKTtcblxuICAgIGdsLmRlbGV0ZVNoYWRlcih2ZXJ0ZXhfc2hhZGVyKTtcbiAgICBnbC5kZWxldGVTaGFkZXIoZnJhZ21lbnRfc2hhZGVyKTtcblxuICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xuXG4gICAgaWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xuICAgICAgICB2YXIgcHJvZ3JhbV9lcnJvciA9XG4gICAgICAgICAgICBcIldlYkdMIHByb2dyYW0gZXJyb3I6XFxuXCIgK1xuICAgICAgICAgICAgXCJWQUxJREFURV9TVEFUVVM6IFwiICsgZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5WQUxJREFURV9TVEFUVVMpICsgXCJcXG5cIiArXG4gICAgICAgICAgICBcIkVSUk9SOiBcIiArIGdsLmdldEVycm9yKCkgKyBcIlxcblxcblwiICtcbiAgICAgICAgICAgIFwiLS0tIFZlcnRleCBTaGFkZXIgLS0tXFxuXCIgKyB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSArIFwiXFxuXFxuXCIgK1xuICAgICAgICAgICAgXCItLS0gRnJhZ21lbnQgU2hhZGVyIC0tLVxcblwiICsgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZTtcbiAgICAgICAgY29uc29sZS5sb2cocHJvZ3JhbV9lcnJvcik7XG4gICAgICAgIHRocm93IHByb2dyYW1fZXJyb3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2dyYW07XG59O1xuXG4vLyBDb21waWxlIGEgdmVydGV4IG9yIGZyYWdtZW50IHNoYWRlciBmcm9tIHByb3ZpZGVkIHNvdXJjZVxuR0wuY3JlYXRlU2hhZGVyID0gZnVuY3Rpb24gR0xjcmVhdGVTaGFkZXIgKGdsLCBzb3VyY2UsIHR5cGUpXG57XG4gICAgdmFyIHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcblxuICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNvdXJjZSk7XG4gICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuXG4gICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcbiAgICAgICAgdmFyIHNoYWRlcl9lcnJvciA9XG4gICAgICAgICAgICBcIldlYkdMIHNoYWRlciBlcnJvcjpcXG5cIiArXG4gICAgICAgICAgICAodHlwZSA9PSBnbC5WRVJURVhfU0hBREVSID8gXCJWRVJURVhcIiA6IFwiRlJBR01FTlRcIikgKyBcIiBTSEFERVI6XFxuXCIgK1xuICAgICAgICAgICAgZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpO1xuICAgICAgICB0aHJvdyBzaGFkZXJfZXJyb3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNoYWRlcjtcbn07XG5cbi8vIFRyaWFuZ3VsYXRpb24gdXNpbmcgbGlidGVzcy5qcyBwb3J0IG9mIGdsdVRlc3NlbGF0b3Jcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9icmVuZGFua2VubnkvbGlidGVzcy5qc1xudHJ5IHtcbiAgICBHTC50ZXNzZWxhdG9yID0gKGZ1bmN0aW9uIGluaXRUZXNzZWxhdG9yKCkge1xuICAgICAgICB2YXIgdGVzc2VsYXRvciA9IG5ldyBsaWJ0ZXNzLkdsdVRlc3NlbGF0b3IoKTtcblxuICAgICAgICAvLyBDYWxsZWQgZm9yIGVhY2ggdmVydGV4IG9mIHRlc3NlbGF0b3Igb3V0cHV0XG4gICAgICAgIGZ1bmN0aW9uIHZlcnRleENhbGxiYWNrKGRhdGEsIHBvbHlWZXJ0QXJyYXkpIHtcbiAgICAgICAgICAgIGlmICh0ZXNzZWxhdG9yLnogIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHBvbHlWZXJ0QXJyYXkucHVzaChbZGF0YVswXSwgZGF0YVsxXSwgdGVzc2VsYXRvci56XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBwb2x5VmVydEFycmF5LnB1c2goW2RhdGFbMF0sIGRhdGFbMV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbGxlZCB3aGVuIHNlZ21lbnRzIGludGVyc2VjdCBhbmQgbXVzdCBiZSBzcGxpdFxuICAgICAgICBmdW5jdGlvbiBjb21iaW5lQ2FsbGJhY2soY29vcmRzLCBkYXRhLCB3ZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZHM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxsZWQgd2hlbiBhIHZlcnRleCBzdGFydHMgb3Igc3RvcHMgYSBib3VuZGFyeSBlZGdlIG9mIGEgcG9seWdvblxuICAgICAgICBmdW5jdGlvbiBlZGdlQ2FsbGJhY2soZmxhZykge1xuICAgICAgICAgICAgLy8gTm8tb3AgY2FsbGJhY2sgdG8gZm9yY2Ugc2ltcGxlIHRyaWFuZ2xlIHByaW1pdGl2ZXMgKG5vIHRyaWFuZ2xlIHN0cmlwcyBvciBmYW5zKS5cbiAgICAgICAgICAgIC8vIFNlZTogaHR0cDovL3d3dy5nbHByb2dyYW1taW5nLmNvbS9yZWQvY2hhcHRlcjExLmh0bWxcbiAgICAgICAgICAgIC8vIFwiU2luY2UgZWRnZSBmbGFncyBtYWtlIG5vIHNlbnNlIGluIGEgdHJpYW5nbGUgZmFuIG9yIHRyaWFuZ2xlIHN0cmlwLCBpZiB0aGVyZSBpcyBhIGNhbGxiYWNrXG4gICAgICAgICAgICAvLyBhc3NvY2lhdGVkIHdpdGggR0xVX1RFU1NfRURHRV9GTEFHIHRoYXQgZW5hYmxlcyBlZGdlIGZsYWdzLCB0aGUgR0xVX1RFU1NfQkVHSU4gY2FsbGJhY2sgaXNcbiAgICAgICAgICAgIC8vIGNhbGxlZCBvbmx5IHdpdGggR0xfVFJJQU5HTEVTLlwiXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnR0wudGVzc2VsYXRvcjogZWRnZSBmbGFnOiAnICsgZmxhZyk7XG4gICAgICAgIH1cblxuICAgICAgICB0ZXNzZWxhdG9yLmdsdVRlc3NDYWxsYmFjayhsaWJ0ZXNzLmdsdUVudW0uR0xVX1RFU1NfVkVSVEVYX0RBVEEsIHZlcnRleENhbGxiYWNrKTtcbiAgICAgICAgdGVzc2VsYXRvci5nbHVUZXNzQ2FsbGJhY2sobGlidGVzcy5nbHVFbnVtLkdMVV9URVNTX0NPTUJJTkUsIGNvbWJpbmVDYWxsYmFjayk7XG4gICAgICAgIHRlc3NlbGF0b3IuZ2x1VGVzc0NhbGxiYWNrKGxpYnRlc3MuZ2x1RW51bS5HTFVfVEVTU19FREdFX0ZMQUcsIGVkZ2VDYWxsYmFjayk7XG5cbiAgICAgICAgLy8gQnJlbmRhbiBLZW5ueTpcbiAgICAgICAgLy8gbGlidGVzcyB3aWxsIHRha2UgM2QgdmVydHMgYW5kIGZsYXR0ZW4gdG8gYSBwbGFuZSBmb3IgdGVzc2VsYXRpb25cbiAgICAgICAgLy8gc2luY2Ugb25seSBkb2luZyAyZCB0ZXNzZWxhdGlvbiBoZXJlLCBwcm92aWRlIHo9MSBub3JtYWwgdG8gc2tpcFxuICAgICAgICAvLyBpdGVyYXRpbmcgb3ZlciB2ZXJ0cyBvbmx5IHRvIGdldCB0aGUgc2FtZSBhbnN3ZXIuXG4gICAgICAgIC8vIGNvbW1lbnQgb3V0IHRvIHRlc3Qgbm9ybWFsLWdlbmVyYXRpb24gY29kZVxuICAgICAgICB0ZXNzZWxhdG9yLmdsdVRlc3NOb3JtYWwoMCwgMCwgMSk7XG5cbiAgICAgICAgcmV0dXJuIHRlc3NlbGF0b3I7XG4gICAgfSkoKTtcblxuICAgIEdMLnRyaWFuZ3VsYXRlUG9seWdvbiA9IGZ1bmN0aW9uIEdMVHJpYW5ndWxhdGUgKGNvbnRvdXJzLCB6KVxuICAgIHtcbiAgICAgICAgdmFyIHRyaWFuZ2xlVmVydHMgPSBbXTtcbiAgICAgICAgR0wudGVzc2VsYXRvci56ID0gejtcbiAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzQmVnaW5Qb2x5Z29uKHRyaWFuZ2xlVmVydHMpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29udG91cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc0JlZ2luQ29udG91cigpO1xuICAgICAgICAgICAgdmFyIGNvbnRvdXIgPSBjb250b3Vyc1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29udG91ci5sZW5ndGg7IGogKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY29vcmRzID0gW2NvbnRvdXJbal1bMF0sIGNvbnRvdXJbal1bMV0sIDBdO1xuICAgICAgICAgICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc1ZlcnRleChjb29yZHMsIGNvb3Jkcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NFbmRDb250b3VyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NFbmRQb2x5Z29uKCk7XG4gICAgICAgIHJldHVybiB0cmlhbmdsZVZlcnRzO1xuICAgIH07XG59XG5jYXRjaCAoZSkge1xuICAgIC8vIGNvbnNvbGUubG9nKFwibGlidGVzcyBub3QgZGVmaW5lZCFcIik7XG4gICAgLy8gc2tpcCBpZiBsaWJ0ZXNzIG5vdCBkZWZpbmVkXG59XG5cbi8vIEFkZCB2ZXJ0aWNlcyB0byBhbiBhcnJheSAoZGVzdGluZWQgdG8gYmUgdXNlZCBhcyBhIEdMIGJ1ZmZlciksICdzdHJpcGluZycgZWFjaCB2ZXJ0ZXggd2l0aCBjb25zdGFudCBkYXRhXG4vLyBQZXItdmVydGV4IGF0dHJpYnV0ZXMgbXVzdCBiZSBwcmUtcGFja2VkIGludG8gdGhlIHZlcnRpY2VzIGFycmF5XG4vLyBVc2VkIGZvciBhZGRpbmcgdmFsdWVzIHRoYXQgYXJlIG9mdGVuIGNvbnN0YW50IHBlciBnZW9tZXRyeSBvciBwb2x5Z29uLCBsaWtlIGNvbG9ycywgbm9ybWFscyAoZm9yIHBvbHlzIHNpdHRpbmcgZmxhdCBvbiBtYXApLCBsYXllciBhbmQgbWF0ZXJpYWwgaW5mbywgZXRjLlxuR0wuYWRkVmVydGljZXMgPSBmdW5jdGlvbiAodmVydGljZXMsIHZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKVxue1xuICAgIGlmICh2ZXJ0aWNlcyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbiAgICB9XG4gICAgdmVydGV4X2NvbnN0YW50cyA9IHZlcnRleF9jb25zdGFudHMgfHwgW107XG5cbiAgICBmb3IgKHZhciB2PTAsIHZsZW4gPSB2ZXJ0aWNlcy5sZW5ndGg7IHYgPCB2bGVuOyB2KyspIHtcbiAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgdmVydGljZXNbdl0pO1xuICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCB2ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBBZGQgdmVydGljZXMgdG8gYW4gYXJyYXksICdzdHJpcGluZycgZWFjaCB2ZXJ0ZXggd2l0aCBjb25zdGFudCBkYXRhXG4vLyBNdWx0aXBsZSwgdW4tcGFja2VkIGF0dHJpYnV0ZSBhcnJheXMgY2FuIGJlIHByb3ZpZGVkXG5HTC5hZGRWZXJ0aWNlc011bHRpcGxlQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChkeW5hbWljcywgY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSlcbntcbiAgICB2YXIgZGxlbiA9IGR5bmFtaWNzLmxlbmd0aDtcbiAgICB2YXIgdmxlbiA9IGR5bmFtaWNzWzBdLmxlbmd0aDtcbiAgICBjb25zdGFudHMgPSBjb25zdGFudHMgfHwgW107XG5cbiAgICBmb3IgKHZhciB2PTA7IHYgPCB2bGVuOyB2KyspIHtcbiAgICAgICAgZm9yICh2YXIgZD0wOyBkIDwgZGxlbjsgZCsrKSB7XG4gICAgICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCBkeW5hbWljc1tkXVt2XSk7XG4gICAgICAgIH1cbiAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgY29uc3RhbnRzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBBZGQgdmVydGljZXMgdG8gYW4gYXJyYXksIHdpdGggYSB2YXJpYWJsZSBsYXlvdXQgKGJvdGggcGVyLXZlcnRleCBkeW5hbWljIGFuZCBjb25zdGFudCBhdHRyaWJzKVxuLy8gR0wuYWRkVmVydGljZXNCeUF0dHJpYnV0ZUxheW91dCA9IGZ1bmN0aW9uIChhdHRyaWJzLCB2ZXJ0ZXhfZGF0YSlcbi8vIHtcbi8vICAgICB2YXIgbWF4X2xlbmd0aCA9IDA7XG4vLyAgICAgZm9yICh2YXIgYT0wOyBhIDwgYXR0cmlicy5sZW5ndGg7IGErKykge1xuLy8gICAgICAgICAvLyBjb25zb2xlLmxvZyhhdHRyaWJzW2FdLm5hbWUpO1xuLy8gICAgICAgICAvLyBjb25zb2xlLmxvZyhcImEgXCIgKyB0eXBlb2YgYXR0cmlic1thXS5kYXRhKTtcbi8vICAgICAgICAgaWYgKHR5cGVvZiBhdHRyaWJzW2FdLmRhdGEgPT0gJ29iamVjdCcpIHtcbi8vICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiYVswXSBcIiArIHR5cGVvZiBhdHRyaWJzW2FdLmRhdGFbMF0pO1xuLy8gICAgICAgICAgICAgLy8gUGVyLXZlcnRleCBsaXN0IC0gYXJyYXkgb2YgYXJyYXlcbi8vICAgICAgICAgICAgIGlmICh0eXBlb2YgYXR0cmlic1thXS5kYXRhWzBdID09ICdvYmplY3QnKSB7XG4vLyAgICAgICAgICAgICAgICAgYXR0cmlic1thXS5jdXJzb3IgPSAwO1xuLy8gICAgICAgICAgICAgICAgIGlmIChhdHRyaWJzW2FdLmRhdGEubGVuZ3RoID4gbWF4X2xlbmd0aCkge1xuLy8gICAgICAgICAgICAgICAgICAgICBtYXhfbGVuZ3RoID0gYXR0cmlic1thXS5kYXRhLmxlbmd0aDtcbi8vICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICAvLyBTdGF0aWMgYXJyYXkgZm9yIGFsbCB2ZXJ0aWNlc1xuLy8gICAgICAgICAgICAgZWxzZSB7XG4vLyAgICAgICAgICAgICAgICAgYXR0cmlic1thXS5uZXh0X3ZlcnRleCA9IGF0dHJpYnNbYV0uZGF0YTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgICAgICBlbHNlIHtcbi8vICAgICAgICAgICAgIC8vIFN0YXRpYyBzaW5nbGUgdmFsdWUgZm9yIGFsbCB2ZXJ0aWNlcywgY29udmVydCB0byBhcnJheVxuLy8gICAgICAgICAgICAgYXR0cmlic1thXS5uZXh0X3ZlcnRleCA9IFthdHRyaWJzW2FdLmRhdGFdO1xuLy8gICAgICAgICB9XG4vLyAgICAgfVxuXG4vLyAgICAgZm9yICh2YXIgdj0wOyB2IDwgbWF4X2xlbmd0aDsgdisrKSB7XG4vLyAgICAgICAgIGZvciAodmFyIGE9MDsgYSA8IGF0dHJpYnMubGVuZ3RoOyBhKyspIHtcbi8vICAgICAgICAgICAgIGlmIChhdHRyaWJzW2FdLmN1cnNvciAhPSBudWxsKSB7XG4vLyAgICAgICAgICAgICAgICAgLy8gTmV4dCB2YWx1ZSBpbiBsaXN0XG4vLyAgICAgICAgICAgICAgICAgYXR0cmlic1thXS5uZXh0X3ZlcnRleCA9IGF0dHJpYnNbYV0uZGF0YVthdHRyaWJzW2FdLmN1cnNvcl07XG5cbi8vICAgICAgICAgICAgICAgICAvLyBUT0RPOiByZXBlYXRzIGlmIG9uZSBsaXN0IGlzIHNob3J0ZXIgdGhhbiBvdGhlcnMgLSBkZXNpcmVkIGJlaGF2aW9yLCBvciBlbmZvcmNlIHNhbWUgbGVuZ3RoP1xuLy8gICAgICAgICAgICAgICAgIGlmIChhdHRyaWJzW2FdLmN1cnNvciA8IGF0dHJpYnNbYV0uZGF0YS5sZW5ndGgpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgYXR0cmlic1thXS5jdXJzb3IrKztcbi8vICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCBhdHRyaWJzW2FdLm5leHRfdmVydGV4KTtcbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vICAgICByZXR1cm4gdmVydGV4X2RhdGE7XG4vLyB9O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdMO1xufVxuIiwidmFyIFZlY3RvciA9IHJlcXVpcmUoJy4uL3ZlY3Rvci5qcycpO1xudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vcG9pbnQuanMnKTtcbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wuanMnKTtcblxudmFyIEdMQnVpbGRlcnMgPSB7fTtcblxuR0xCdWlsZGVycy5kZWJ1ZyA9IGZhbHNlO1xuXG4vLyBUZXNzZWxhdGUgYSBmbGF0IDJEIHBvbHlnb24gd2l0aCBmaXhlZCBoZWlnaHQgYW5kIGFkZCB0byBHTCB2ZXJ0ZXggYnVmZmVyXG5HTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRQb2x5Z29ucyAocG9seWdvbnMsIHosIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIHZlcnRleF9jb25zdGFudHMgPSBbXTtcbiAgICBpZiAoeiAhPSBudWxsKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaCh6KTsgLy8gcHJvdmlkZWQgelxuICAgIH1cbiAgICBpZiAob3B0aW9ucy5ub3JtYWxzKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaCgwLCAwLCAxKTsgLy8gdXB3YXJkcy1mYWNpbmcgbm9ybWFsXG4gICAgfVxuICAgIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoLmFwcGx5KHZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuICAgIGlmICh2ZXJ0ZXhfY29uc3RhbnRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMgPSBudWxsO1xuICAgIH1cblxuICAgIHZhciBudW1fcG9seWdvbnMgPSBwb2x5Z29ucy5sZW5ndGg7XG4gICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvbHlnb25zOyBwKyspIHtcbiAgICAgICAgdmFyIHZlcnRpY2VzID0gR0wudHJpYW5ndWxhdGVQb2x5Z29uKHBvbHlnb25zW3BdKTtcbiAgICAgICAgR0wuYWRkVmVydGljZXModmVydGljZXMsIHZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBDYWxsYmFjay1iYXNlIGJ1aWxkZXIgKGZvciBmdXR1cmUgZXhwbG9yYXRpb24pXG4vLyBUZXNzZWxhdGUgYSBmbGF0IDJEIHBvbHlnb24gd2l0aCBmaXhlZCBoZWlnaHQgYW5kIGFkZCB0byBHTCB2ZXJ0ZXggYnVmZmVyXG4vLyBHTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMyID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUG9seWdvbjIgKHBvbHlnb25zLCB6LCBhZGRHZW9tZXRyeSwgb3B0aW9ucylcbi8vIHtcbi8vICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuLy8gICAgIHZhciBudW1fcG9seWdvbnMgPSBwb2x5Z29ucy5sZW5ndGg7XG4vLyAgICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvbHlnb25zOyBwKyspIHtcbi8vICAgICAgICAgdmFyIHZlcnRpY2VzID0ge1xuLy8gICAgICAgICAgICAgcG9zaXRpb25zOiBHTC50cmlhbmd1bGF0ZVBvbHlnb24ocG9seWdvbnNbcF0sIHopLFxuLy8gICAgICAgICAgICAgbm9ybWFsczogKG9wdGlvbnMubm9ybWFscyA/IFswLCAwLCAxXSA6IG51bGwpXG4vLyAgICAgICAgIH07XG5cbi8vICAgICAgICAgYWRkR2VvbWV0cnkodmVydGljZXMpO1xuLy8gICAgIH1cbi8vIH07XG5cbi8vIFRlc3NlbGF0ZSBhbmQgZXh0cnVkZSBhIGZsYXQgMkQgcG9seWdvbiBpbnRvIGEgc2ltcGxlIDNEIG1vZGVsIHdpdGggZml4ZWQgaGVpZ2h0IGFuZCBhZGQgdG8gR0wgdmVydGV4IGJ1ZmZlclxuR0xCdWlsZGVycy5idWlsZEV4dHJ1ZGVkUG9seWdvbnMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRFeHRydWRlZFBvbHlnb24gKHBvbHlnb25zLCB6LCBoZWlnaHQsIG1pbl9oZWlnaHQsIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBtaW5feiA9IHogKyAobWluX2hlaWdodCB8fCAwKTtcbiAgICB2YXIgbWF4X3ogPSB6ICsgaGVpZ2h0O1xuXG4gICAgLy8gVG9wXG4gICAgR0xCdWlsZGVycy5idWlsZFBvbHlnb25zKHBvbHlnb25zLCBtYXhfeiwgdmVydGV4X2RhdGEsIHsgbm9ybWFsczogdHJ1ZSwgdmVydGV4X2NvbnN0YW50czogb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzIH0pO1xuICAgIC8vIHZhciB0b3BfdmVydGV4X2NvbnN0YW50cyA9IFswLCAwLCAxXTtcbiAgICAvLyBpZiAob3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzICE9IG51bGwpIHtcbiAgICAvLyAgICAgdG9wX3ZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh0b3BfdmVydGV4X2NvbnN0YW50cywgb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICAvLyB9XG4gICAgLy8gR0xCdWlsZGVycy5idWlsZFBvbHlnb25zMihcbiAgICAvLyAgICAgcG9seWdvbnMsXG4gICAgLy8gICAgIG1heF96LFxuICAgIC8vICAgICBmdW5jdGlvbiAodmVydGljZXMpIHtcbiAgICAvLyAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLnBvc2l0aW9ucywgdG9wX3ZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICAvLyAgICAgfVxuICAgIC8vICk7XG5cbiAgICAvLyBXYWxsc1xuICAgIHZhciB3YWxsX3ZlcnRleF9jb25zdGFudHMgPSBbbnVsbCwgbnVsbCwgbnVsbF07IC8vIG5vcm1hbHMgd2lsbCBiZSBjYWxjdWxhdGVkIGJlbG93XG4gICAgaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh3YWxsX3ZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgdmFyIG51bV9wb2x5Z29ucyA9IHBvbHlnb25zLmxlbmd0aDtcbiAgICBmb3IgKHZhciBwPTA7IHAgPCBudW1fcG9seWdvbnM7IHArKykge1xuICAgICAgICB2YXIgcG9seWdvbiA9IHBvbHlnb25zW3BdO1xuXG4gICAgICAgIGZvciAodmFyIHE9MDsgcSA8IHBvbHlnb24ubGVuZ3RoOyBxKyspIHtcbiAgICAgICAgICAgIHZhciBjb250b3VyID0gcG9seWdvbltxXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgdz0wOyB3IDwgY29udG91ci5sZW5ndGggLSAxOyB3KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgd2FsbF92ZXJ0aWNlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgLy8gVHdvIHRyaWFuZ2xlcyBmb3IgdGhlIHF1YWQgZm9ybWVkIGJ5IGVhY2ggdmVydGV4IHBhaXIsIGdvaW5nIGZyb20gYm90dG9tIHRvIHRvcCBoZWlnaHRcbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIC8vIFRyaWFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3crMV1bMF0sIGNvbnRvdXJbdysxXVsxXSwgbWF4X3pdLFxuICAgICAgICAgICAgICAgICAgICBbY29udG91clt3KzFdWzBdLCBjb250b3VyW3crMV1bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJpYW5nbGVcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1heF96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbdysxXVswXSwgY29udG91clt3KzFdWzFdLCBtYXhfel1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FsYyB0aGUgbm9ybWFsIG9mIHRoZSB3YWxsIGZyb20gdXAgdmVjdG9yIGFuZCBvbmUgc2VnbWVudCBvZiB0aGUgd2FsbCB0cmlhbmdsZXNcbiAgICAgICAgICAgICAgICB2YXIgbm9ybWFsID0gVmVjdG9yLmNyb3NzKFxuICAgICAgICAgICAgICAgICAgICBbMCwgMCwgMV0sXG4gICAgICAgICAgICAgICAgICAgIFZlY3Rvci5ub3JtYWxpemUoW2NvbnRvdXJbdysxXVswXSAtIGNvbnRvdXJbd11bMF0sIGNvbnRvdXJbdysxXVsxXSAtIGNvbnRvdXJbd11bMV0sIDBdKVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHNbMF0gPSBub3JtYWxbMF07XG4gICAgICAgICAgICAgICAgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzWzFdID0gbm9ybWFsWzFdO1xuICAgICAgICAgICAgICAgIHdhbGxfdmVydGV4X2NvbnN0YW50c1syXSA9IG5vcm1hbFsyXTtcblxuICAgICAgICAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHdhbGxfdmVydGljZXMsIHdhbGxfdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQnVpbGQgdGVzc2VsbGF0ZWQgdHJpYW5nbGVzIGZvciBhIHBvbHlsaW5lXG4vLyBCYXNpY2FsbHkgZm9sbG93aW5nIHRoZSBtZXRob2QgZGVzY3JpYmVkIGhlcmUgZm9yIG1pdGVyIGpvaW50czpcbi8vIGh0dHA6Ly9hcnRncmFtbWVyLmJsb2dzcG90LmNvLnVrLzIwMTEvMDcvZHJhd2luZy1wb2x5bGluZXMtYnktdGVzc2VsbGF0aW9uLmh0bWxcbkdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRQb2x5bGluZXMgKGxpbmVzLCB6LCB3aWR0aCwgdmVydGV4X2RhdGEsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jbG9zZWRfcG9seWdvbiA9IG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gfHwgZmFsc2U7XG4gICAgb3B0aW9ucy5yZW1vdmVfdGlsZV9lZGdlcyA9IG9wdGlvbnMucmVtb3ZlX3RpbGVfZWRnZXMgfHwgZmFsc2U7XG5cbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFt6LCAwLCAwLCAxXTsgLy8gcHJvdmlkZWQgeiwgYW5kIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoLmFwcGx5KHZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgLy8gTGluZSBjZW50ZXIgLSBkZWJ1Z2dpbmdcbiAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBsbj0wOyBsbiA8IG51bV9saW5lczsgbG4rKykge1xuICAgICAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tsbl07XG5cbiAgICAgICAgICAgIGZvciAodmFyIHA9MDsgcCA8IGxpbmUubGVuZ3RoIC0gMTsgcCsrKSB7XG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICAgICAgdmFyIHBhID0gbGluZVtwXTtcbiAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lW3ArMV07XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLnZlcnRleF9saW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMS4wLCAwLCAwLFxuICAgICAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMS4wLCAwLCAwXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBCdWlsZCB0cmlhbmdsZXNcbiAgICB2YXIgdmVydGljZXMgPSBbXTtcbiAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgIGZvciAodmFyIGxuPTA7IGxuIDwgbnVtX2xpbmVzOyBsbisrKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbbG5dO1xuICAgICAgICAvLyBNdWx0aXBsZSBsaW5lIHNlZ21lbnRzXG4gICAgICAgIGlmIChsaW5lLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIC8vIEJ1aWxkIGFuY2hvcnMgZm9yIGxpbmUgc2VnbWVudHM6XG4gICAgICAgICAgICAvLyBhbmNob3JzIGFyZSAzIHBvaW50cywgZWFjaCBjb25uZWN0aW5nIDIgbGluZSBzZWdtZW50cyB0aGF0IHNoYXJlIGEgam9pbnQgKHN0YXJ0IHBvaW50LCBqb2ludCBwb2ludCwgZW5kIHBvaW50KVxuXG4gICAgICAgICAgICB2YXIgYW5jaG9ycyA9IFtdO1xuXG4gICAgICAgICAgICBpZiAobGluZS5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgLy8gRmluZCBtaWRwb2ludHMgb2YgZWFjaCBsaW5lIHNlZ21lbnRcbiAgICAgICAgICAgICAgICAvLyBGb3IgY2xvc2VkIHBvbHlnb25zLCBjYWxjdWxhdGUgYWxsIG1pZHBvaW50cyBzaW5jZSBzZWdtZW50cyB3aWxsIHdyYXAgYXJvdW5kIHRvIGZpcnN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgdmFyIG1pZCA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciBwLCBwbWF4O1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmNsb3NlZF9wb2x5Z29uID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcCA9IDA7IC8vIHN0YXJ0IG9uIGZpcnN0IHBvaW50XG4gICAgICAgICAgICAgICAgICAgIHBtYXggPSBsaW5lLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEZvciBvcGVuIHBvbHlnb25zLCBza2lwIGZpcnN0IG1pZHBvaW50IGFuZCB1c2UgbGluZSBzdGFydCBpbnN0ZWFkXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHAgPSAxOyAvLyBzdGFydCBvbiBzZWNvbmQgcG9pbnRcbiAgICAgICAgICAgICAgICAgICAgcG1heCA9IGxpbmUubGVuZ3RoIC0gMjtcbiAgICAgICAgICAgICAgICAgICAgbWlkLnB1c2gobGluZVswXSk7IC8vIHVzZSBsaW5lIHN0YXJ0IGluc3RlYWQgb2YgZmlyc3QgbWlkcG9pbnRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxjIG1pZHBvaW50c1xuICAgICAgICAgICAgICAgIGZvciAoOyBwIDwgcG1heDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmVbcF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYiA9IGxpbmVbcCsxXTtcbiAgICAgICAgICAgICAgICAgICAgbWlkLnB1c2goWyhwYVswXSArIHBiWzBdKSAvIDIsIChwYVsxXSArIHBiWzFdKSAvIDJdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBTYW1lIGNsb3NlZC9vcGVuIHBvbHlnb24gbG9naWMgYXMgYWJvdmU6IGtlZXAgbGFzdCBtaWRwb2ludCBmb3IgY2xvc2VkLCBza2lwIGZvciBvcGVuXG4gICAgICAgICAgICAgICAgdmFyIG1tYXg7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBtbWF4ID0gbWlkLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1pZC5wdXNoKGxpbmVbbGluZS5sZW5ndGgtMV0pOyAvLyB1c2UgbGluZSBlbmQgaW5zdGVhZCBvZiBsYXN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgICAgIG1tYXggPSBtaWQubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBNYWtlIGFuY2hvcnMgYnkgY29ubmVjdGluZyBtaWRwb2ludHMgdG8gbGluZSBqb2ludHNcbiAgICAgICAgICAgICAgICBmb3IgKHA9MDsgcCA8IG1tYXg7IHArKykgIHtcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9ycy5wdXNoKFttaWRbcF0sIGxpbmVbKHArMSkgJSBsaW5lLmxlbmd0aF0sIG1pZFsocCsxKSAlIG1pZC5sZW5ndGhdXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRGVnZW5lcmF0ZSBjYXNlLCBhIDMtcG9pbnQgbGluZSBpcyBqdXN0IGEgc2luZ2xlIGFuY2hvclxuICAgICAgICAgICAgICAgIGFuY2hvcnMgPSBbW2xpbmVbMF0sIGxpbmVbMV0sIGxpbmVbMl1dXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgcD0wOyBwIDwgYW5jaG9ycy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5yZW1vdmVfdGlsZV9lZGdlcykge1xuICAgICAgICAgICAgICAgICAgICBidWlsZEFuY2hvcihhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGRTZWdtZW50KGFuY2hvcnNbcF1bMF0sIGFuY2hvcnNbcF1bMV0pOyAvLyB1c2UgdGhlc2UgdG8gZHJhdyBleHRydWRlZCBzZWdtZW50cyB3L28gam9pbiwgZm9yIGRlYnVnZ2luZ1xuICAgICAgICAgICAgICAgICAgICAvLyBidWlsZFNlZ21lbnQoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWRnZTEgPSBHTEJ1aWxkZXJzLmlzT25UaWxlRWRnZShhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkZ2UyID0gR0xCdWlsZGVycy5pc09uVGlsZUVkZ2UoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZWRnZTEgJiYgIWVkZ2UyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZEFuY2hvcihhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZWRnZTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZWRnZTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBTaW5nbGUgMi1wb2ludCBzZWdtZW50XG4gICAgICAgIGVsc2UgaWYgKGxpbmUubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgIGJ1aWxkU2VnbWVudChsaW5lWzBdLCBsaW5lWzFdKTsgLy8gVE9ETzogcmVwbGFjZSBidWlsZFNlZ21lbnQgd2l0aCBhIGRlZ2VuZXJhdGUgZm9ybSBvZiBidWlsZEFuY2hvcj8gYnVpbGRTZWdtZW50IGlzIHN0aWxsIHVzZWZ1bCBmb3IgZGVidWdnaW5nXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgR0wuYWRkVmVydGljZXModmVydGljZXMsIHZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcblxuICAgIC8vIEJ1aWxkIHRyaWFuZ2xlcyBmb3IgYSBzaW5nbGUgbGluZSBzZWdtZW50LCBleHRydWRlZCBieSB0aGUgcHJvdmlkZWQgd2lkdGhcbiAgICBmdW5jdGlvbiBidWlsZFNlZ21lbnQgKHBhLCBwYikge1xuICAgICAgICB2YXIgc2xvcGUgPSBWZWN0b3Iubm9ybWFsaXplKFsocGJbMV0gLSBwYVsxXSkgKiAtMSwgcGJbMF0gLSBwYVswXV0pO1xuXG4gICAgICAgIHZhciBwYV9vdXRlciA9IFtwYVswXSArIHNsb3BlWzBdICogd2lkdGgvMiwgcGFbMV0gKyBzbG9wZVsxXSAqIHdpZHRoLzJdO1xuICAgICAgICB2YXIgcGFfaW5uZXIgPSBbcGFbMF0gLSBzbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdIC0gc2xvcGVbMV0gKiB3aWR0aC8yXTtcblxuICAgICAgICB2YXIgcGJfb3V0ZXIgPSBbcGJbMF0gKyBzbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdICsgc2xvcGVbMV0gKiB3aWR0aC8yXTtcbiAgICAgICAgdmFyIHBiX2lubmVyID0gW3BiWzBdIC0gc2xvcGVbMF0gKiB3aWR0aC8yLCBwYlsxXSAtIHNsb3BlWzFdICogd2lkdGgvMl07XG5cbiAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgIHBiX2lubmVyLCBwYl9vdXRlciwgcGFfaW5uZXIsXG4gICAgICAgICAgICBwYV9pbm5lciwgcGJfb3V0ZXIsIHBhX291dGVyXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgdHJpYW5nbGVzIGZvciBhIDMtcG9pbnQgJ2FuY2hvcicgc2hhcGUsIGNvbnNpc3Rpbmcgb2YgdHdvIGxpbmUgc2VnbWVudHMgd2l0aCBhIGpvaW50XG4gICAgLy8gVE9ETzogbW92ZSB0aGVzZSBmdW5jdGlvbnMgb3V0IG9mIGNsb3N1cmVzP1xuICAgIGZ1bmN0aW9uIGJ1aWxkQW5jaG9yIChwYSwgam9pbnQsIHBiKSB7XG4gICAgICAgIC8vIElubmVyIGFuZCBvdXRlciBsaW5lIHNlZ21lbnRzIGZvciBbcGEsIGpvaW50XSBhbmQgW2pvaW50LCBwYl1cbiAgICAgICAgdmFyIHBhX3Nsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKGpvaW50WzFdIC0gcGFbMV0pICogLTEsIGpvaW50WzBdIC0gcGFbMF1dKTtcbiAgICAgICAgdmFyIHBhX291dGVyID0gW1xuICAgICAgICAgICAgW3BhWzBdICsgcGFfc2xvcGVbMF0gKiB3aWR0aC8yLCBwYVsxXSArIHBhX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbam9pbnRbMF0gKyBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdICsgcGFfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuICAgICAgICB2YXIgcGFfaW5uZXIgPSBbXG4gICAgICAgICAgICBbcGFbMF0gLSBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdIC0gcGFfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtqb2ludFswXSAtIHBhX3Nsb3BlWzBdICogd2lkdGgvMiwgam9pbnRbMV0gLSBwYV9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG5cbiAgICAgICAgdmFyIHBiX3Nsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKHBiWzFdIC0gam9pbnRbMV0pICogLTEsIHBiWzBdIC0gam9pbnRbMF1dKTtcbiAgICAgICAgdmFyIHBiX291dGVyID0gW1xuICAgICAgICAgICAgW2pvaW50WzBdICsgcGJfc2xvcGVbMF0gKiB3aWR0aC8yLCBqb2ludFsxXSArIHBiX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbcGJbMF0gKyBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdICsgcGJfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuICAgICAgICB2YXIgcGJfaW5uZXIgPSBbXG4gICAgICAgICAgICBbam9pbnRbMF0gLSBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdIC0gcGJfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtwYlswXSAtIHBiX3Nsb3BlWzBdICogd2lkdGgvMiwgcGJbMV0gLSBwYl9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gTWl0ZXIgam9pbiAtIHNvbHZlIGZvciB0aGUgaW50ZXJzZWN0aW9uIGJldHdlZW4gdGhlIHR3byBvdXRlciBsaW5lIHNlZ21lbnRzXG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb24gPSBWZWN0b3IubGluZUludGVyc2VjdGlvbihwYV9vdXRlclswXSwgcGFfb3V0ZXJbMV0sIHBiX291dGVyWzBdLCBwYl9vdXRlclsxXSk7XG4gICAgICAgIHZhciBsaW5lX2RlYnVnID0gbnVsbDtcbiAgICAgICAgaWYgKGludGVyc2VjdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0X291dGVyID0gaW50ZXJzZWN0aW9uO1xuXG4gICAgICAgICAgICAvLyBDYXAgdGhlIGludGVyc2VjdGlvbiBwb2ludCB0byBhIHJlYXNvbmFibGUgZGlzdGFuY2UgKGFzIGpvaW4gYW5nbGUgYmVjb21lcyBzaGFycGVyLCBtaXRlciBqb2ludCBkaXN0YW5jZSB3b3VsZCBhcHByb2FjaCBpbmZpbml0eSlcbiAgICAgICAgICAgIHZhciBsZW5fc3EgPSBWZWN0b3IubGVuZ3RoU3EoW2ludGVyc2VjdF9vdXRlclswXSAtIGpvaW50WzBdLCBpbnRlcnNlY3Rfb3V0ZXJbMV0gLSBqb2ludFsxXV0pO1xuICAgICAgICAgICAgdmFyIG1pdGVyX2xlbl9tYXggPSAzOyAvLyBtdWx0aXBsaWVyIG9uIGxpbmUgd2lkdGggZm9yIG1heCBkaXN0YW5jZSBtaXRlciBqb2luIGNhbiBiZSBmcm9tIGpvaW50XG4gICAgICAgICAgICBpZiAobGVuX3NxID4gKHdpZHRoICogd2lkdGggKiBtaXRlcl9sZW5fbWF4ICogbWl0ZXJfbGVuX21heCkpIHtcbiAgICAgICAgICAgICAgICBsaW5lX2RlYnVnID0gJ2Rpc3RhbmNlJztcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3Rfb3V0ZXIgPSBWZWN0b3Iubm9ybWFsaXplKFtpbnRlcnNlY3Rfb3V0ZXJbMF0gLSBqb2ludFswXSwgaW50ZXJzZWN0X291dGVyWzFdIC0gam9pbnRbMV1dKTtcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3Rfb3V0ZXIgPSBbXG4gICAgICAgICAgICAgICAgICAgIGpvaW50WzBdICsgaW50ZXJzZWN0X291dGVyWzBdICogbWl0ZXJfbGVuX21heCxcbiAgICAgICAgICAgICAgICAgICAgam9pbnRbMV0gKyBpbnRlcnNlY3Rfb3V0ZXJbMV0gKiBtaXRlcl9sZW5fbWF4XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0X2lubmVyID0gW1xuICAgICAgICAgICAgICAgIChqb2ludFswXSAtIGludGVyc2VjdF9vdXRlclswXSkgKyBqb2ludFswXSxcbiAgICAgICAgICAgICAgICAoam9pbnRbMV0gLSBpbnRlcnNlY3Rfb3V0ZXJbMV0pICsgam9pbnRbMV1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X2lubmVyLCBpbnRlcnNlY3Rfb3V0ZXIsIHBhX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdLCBpbnRlcnNlY3Rfb3V0ZXIsIHBhX291dGVyWzBdLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMV0sIHBiX291dGVyWzFdLCBpbnRlcnNlY3RfaW5uZXIsXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X2lubmVyLCBwYl9vdXRlclsxXSwgaW50ZXJzZWN0X291dGVyXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gTGluZSBzZWdtZW50cyBhcmUgcGFyYWxsZWwsIHVzZSB0aGUgZmlyc3Qgb3V0ZXIgbGluZSBzZWdtZW50IGFzIGpvaW4gaW5zdGVhZFxuICAgICAgICAgICAgbGluZV9kZWJ1ZyA9ICdwYXJhbGxlbCc7XG4gICAgICAgICAgICBwYV9pbm5lclsxXSA9IHBiX2lubmVyWzBdO1xuICAgICAgICAgICAgcGFfb3V0ZXJbMV0gPSBwYl9vdXRlclswXTtcblxuICAgICAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXSwgcGFfb3V0ZXJbMV0sIHBhX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdLCBwYV9vdXRlclsxXSwgcGFfb3V0ZXJbMF0sXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXSwgcGJfb3V0ZXJbMV0sIHBiX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzBdLCBwYl9vdXRlclsxXSwgcGJfb3V0ZXJbMF1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeHRydWRlZCBpbm5lci9vdXRlciBlZGdlcyAtIGRlYnVnZ2luZ1xuICAgICAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXVswXSwgcGFfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzFdWzBdLCBwYV9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXVswXSwgcGJfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzFdWzBdLCBwYl9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9vdXRlclswXVswXSwgcGFfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzFdWzBdLCBwYV9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9vdXRlclswXVswXSwgcGJfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzFdWzBdLCBwYl9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXVswXSwgcGFfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzBdWzBdLCBwYV9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXVswXSwgcGFfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzFdWzBdLCBwYV9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXVswXSwgcGJfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzBdWzBdLCBwYl9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXVswXSwgcGJfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzFdWzBdLCBwYl9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBsaW5lX2RlYnVnICYmIG9wdGlvbnMudmVydGV4X2xpbmVzKSB7XG4gICAgICAgICAgICB2YXIgZGNvbG9yO1xuICAgICAgICAgICAgaWYgKGxpbmVfZGVidWcgPT0gJ3BhcmFsbGVsJykge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiISEhIGxpbmVzIGFyZSBwYXJhbGxlbCAhISFcIik7XG4gICAgICAgICAgICAgICAgZGNvbG9yID0gWzAsIDEsIDBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobGluZV9kZWJ1ZyA9PSAnZGlzdGFuY2UnKSB7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCIhISEgbWl0ZXIgaW50ZXJzZWN0aW9uIHBvaW50IGV4Y2VlZGVkIGFsbG93ZWQgZGlzdGFuY2UgZnJvbSBqb2ludCAhISFcIik7XG4gICAgICAgICAgICAgICAgZGNvbG9yID0gWzEsIDAsIDBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ09TTSBpZDogJyArIGZlYXR1cmUuaWQpOyAvLyBUT0RPOiBpZiB0aGlzIGZ1bmN0aW9uIGlzIG1vdmVkIG91dCBvZiBhIGNsb3N1cmUsIHRoaXMgZmVhdHVyZSBkZWJ1ZyBpbmZvIHdvbid0IGJlIGF2YWlsYWJsZVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coW3BhLCBqb2ludCwgcGJdKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGZlYXR1cmUpO1xuICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdLFxuICAgICAgICAgICAgICAgIGpvaW50WzBdLCBqb2ludFsxXSwgeiArIDAuMDAyLFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIGRjb2xvclswXSwgZGNvbG9yWzFdLCBkY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgam9pbnRbMF0sIGpvaW50WzFdLCB6ICsgMC4wMDIsXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgZGNvbG9yWzBdLCBkY29sb3JbMV0sIGRjb2xvclsyXSxcbiAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yICh2YXIgbG49MDsgbG4gPCBudW1fbGluZXM7IGxuKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbGluZTIgPSBsaW5lc1tsbl07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwPTA7IHAgPCBsaW5lMi5sZW5ndGggLSAxOyBwKyspIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmUyW3BdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lMltwKzFdO1xuXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudmVydGV4X2xpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLCAwLCAxLjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLCAwLCAxLjBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQnVpbGQgYSBxdWFkIGNlbnRlcmVkIG9uIGEgcG9pbnRcbi8vIFogY29vcmQsIG5vcm1hbHMsIGFuZCB0ZXhjb29yZHMgYXJlIG9wdGlvbmFsXG4vLyBMYXlvdXQgb3JkZXIgaXM6XG4vLyAgIHBvc2l0aW9uICgyIG9yIDMgY29tcG9uZW50cylcbi8vICAgdGV4Y29vcmQgKG9wdGlvbmFsLCAyIGNvbXBvbmVudHMpXG4vLyAgIG5vcm1hbCAob3B0aW9uYWwsIDMgY29tcG9uZW50cylcbi8vICAgY29uc3RhbnRzIChvcHRpb25hbClcbkdMQnVpbGRlcnMuYnVpbGRRdWFkc0ZvclBvaW50cyA9IGZ1bmN0aW9uIChwb2ludHMsIHdpZHRoLCBoZWlnaHQsIHosIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW107XG4gICAgaWYgKG9wdGlvbnMubm9ybWFscykge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2goMCwgMCwgMSk7IC8vIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgIH1cbiAgICBpZiAob3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh2ZXJ0ZXhfY29uc3RhbnRzLCBvcHRpb25zLnZlcnRleF9jb25zdGFudHMpO1xuICAgIH1cbiAgICBpZiAodmVydGV4X2NvbnN0YW50cy5sZW5ndGggPT0gMCkge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbnVtX3BvaW50cyA9IHBvaW50cy5sZW5ndGg7XG4gICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvaW50czsgcCsrKSB7XG4gICAgICAgIHZhciBwb2ludCA9IHBvaW50c1twXTtcblxuICAgICAgICB2YXIgcG9zaXRpb25zID0gW1xuICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4gICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbiAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuXG4gICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbiAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gQWRkIHByb3ZpZGVkIHpcbiAgICAgICAgaWYgKHogIT0gbnVsbCkge1xuICAgICAgICAgICAgcG9zaXRpb25zWzBdWzJdID0gejtcbiAgICAgICAgICAgIHBvc2l0aW9uc1sxXVsyXSA9IHo7XG4gICAgICAgICAgICBwb3NpdGlvbnNbMl1bMl0gPSB6O1xuICAgICAgICAgICAgcG9zaXRpb25zWzNdWzJdID0gejtcbiAgICAgICAgICAgIHBvc2l0aW9uc1s0XVsyXSA9IHo7XG4gICAgICAgICAgICBwb3NpdGlvbnNbNV1bMl0gPSB6O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMudGV4Y29vcmRzID09IHRydWUpIHtcbiAgICAgICAgICAgIHZhciB0ZXhjb29yZHMgPSBbXG4gICAgICAgICAgICAgICAgWy0xLCAtMV0sXG4gICAgICAgICAgICAgICAgWzEsIC0xXSxcbiAgICAgICAgICAgICAgICBbMSwgMV0sXG5cbiAgICAgICAgICAgICAgICBbLTEsIC0xXSxcbiAgICAgICAgICAgICAgICBbMSwgMV0sXG4gICAgICAgICAgICAgICAgWy0xLCAxXVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgR0wuYWRkVmVydGljZXNNdWx0aXBsZUF0dHJpYnV0ZXMoW3Bvc2l0aW9ucywgdGV4Y29vcmRzXSwgdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgR0wuYWRkVmVydGljZXMocG9zaXRpb25zLCB2ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBDYWxsYmFjay1iYXNlIGJ1aWxkZXIgKGZvciBmdXR1cmUgZXhwbG9yYXRpb24pXG4vLyBHTEJ1aWxkZXJzLmJ1aWxkUXVhZHNGb3JQb2ludHMyID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUXVhZHNGb3JQb2ludHMgKHBvaW50cywgd2lkdGgsIGhlaWdodCwgYWRkR2VvbWV0cnksIG9wdGlvbnMpXG4vLyB7XG4vLyAgICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4vLyAgICAgdmFyIG51bV9wb2ludHMgPSBwb2ludHMubGVuZ3RoO1xuLy8gICAgIGZvciAodmFyIHA9MDsgcCA8IG51bV9wb2ludHM7IHArKykge1xuLy8gICAgICAgICB2YXIgcG9pbnQgPSBwb2ludHNbcF07XG5cbi8vICAgICAgICAgdmFyIHBvc2l0aW9ucyA9IFtcbi8vICAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuLy8gICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcblxuLy8gICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcbi8vICAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuLy8gICAgICAgICBdO1xuXG4vLyAgICAgICAgIGlmIChvcHRpb25zLnRleGNvb3JkcyA9PSB0cnVlKSB7XG4vLyAgICAgICAgICAgICB2YXIgdGV4Y29vcmRzID0gW1xuLy8gICAgICAgICAgICAgICAgIFstMSwgLTFdLFxuLy8gICAgICAgICAgICAgICAgIFsxLCAtMV0sXG4vLyAgICAgICAgICAgICAgICAgWzEsIDFdLFxuXG4vLyAgICAgICAgICAgICAgICAgWy0xLCAtMV0sXG4vLyAgICAgICAgICAgICAgICAgWzEsIDFdLFxuLy8gICAgICAgICAgICAgICAgIFstMSwgMV1cbi8vICAgICAgICAgICAgIF07XG4vLyAgICAgICAgIH1cblxuLy8gICAgICAgICB2YXIgdmVydGljZXMgPSB7XG4vLyAgICAgICAgICAgICBwb3NpdGlvbnM6IHBvc2l0aW9ucyxcbi8vICAgICAgICAgICAgIG5vcm1hbHM6IChvcHRpb25zLm5vcm1hbHMgPyBbMCwgMCwgMV0gOiBudWxsKSxcbi8vICAgICAgICAgICAgIHRleGNvb3JkczogKG9wdGlvbnMudGV4Y29vcmRzICYmIHRleGNvb3Jkcylcbi8vICAgICAgICAgfTtcbi8vICAgICAgICAgYWRkR2VvbWV0cnkodmVydGljZXMpO1xuLy8gICAgIH1cbi8vIH07XG5cbi8vIEJ1aWxkIG5hdGl2ZSBHTCBsaW5lcyBmb3IgYSBwb2x5bGluZVxuR0xCdWlsZGVycy5idWlsZExpbmVzID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkTGluZXMgKGxpbmVzLCBmZWF0dXJlLCBsYXllciwgc3R5bGUsIHRpbGUsIHosIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIGNvbG9yID0gc3R5bGUuY29sb3I7XG4gICAgdmFyIHdpZHRoID0gc3R5bGUud2lkdGg7XG5cbiAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgIGZvciAodmFyIGxuPTA7IGxuIDwgbnVtX2xpbmVzOyBsbisrKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbbG5dO1xuXG4gICAgICAgIGZvciAodmFyIHA9MDsgcCA8IGxpbmUubGVuZ3RoIC0gMTsgcCsrKSB7XG4gICAgICAgICAgICAvLyBQb2ludCBBIHRvIEJcbiAgICAgICAgICAgIHZhciBwYSA9IGxpbmVbcF07XG4gICAgICAgICAgICB2YXIgcGIgPSBsaW5lW3ArMV07XG5cbiAgICAgICAgICAgIHZlcnRleF9kYXRhLnB1c2goXG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQVxuICAgICAgICAgICAgICAgIHBhWzBdLCBwYVsxXSwgeixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCAvLyBmbGF0IHN1cmZhY2VzIHBvaW50IHN0cmFpZ2h0IHVwXG4gICAgICAgICAgICAgICAgY29sb3JbMF0sIGNvbG9yWzFdLCBjb2xvclsyXSxcbiAgICAgICAgICAgICAgICAvLyBQb2ludCBCXG4gICAgICAgICAgICAgICAgcGJbMF0sIHBiWzFdLCB6LFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIC8vIGZsYXQgc3VyZmFjZXMgcG9pbnQgc3RyYWlnaHQgdXBcbiAgICAgICAgICAgICAgICBjb2xvclswXSwgY29sb3JbMV0sIGNvbG9yWzJdXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8qIFV0aWxpdHkgZnVuY3Rpb25zICovXG5cbi8vIFRlc3RzIGlmIGEgbGluZSBzZWdtZW50IChmcm9tIHBvaW50IEEgdG8gQikgaXMgbmVhcmx5IGNvaW5jaWRlbnQgd2l0aCB0aGUgZWRnZSBvZiBhIHRpbGVcbkdMQnVpbGRlcnMuaXNPblRpbGVFZGdlID0gZnVuY3Rpb24gKHBhLCBwYiwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciB0b2xlcmFuY2VfZnVuY3Rpb24gPSBvcHRpb25zLnRvbGVyYW5jZV9mdW5jdGlvbiB8fCBHTEJ1aWxkZXJzLnZhbHVlc1dpdGhpblRvbGVyYW5jZTtcbiAgICB2YXIgdG9sZXJhbmNlID0gb3B0aW9ucy50b2xlcmFuY2UgfHwgMTsgLy8gdHdlYWsgdGhpcyBhZGp1c3QgaWYgY2F0Y2hpbmcgdG9vIGZldy9tYW55IGxpbmUgc2VnbWVudHMgbmVhciB0aWxlIGVkZ2VzXG4gICAgdmFyIHRpbGVfbWluID0gR0xCdWlsZGVycy50aWxlX2JvdW5kc1swXTtcbiAgICB2YXIgdGlsZV9tYXggPSBHTEJ1aWxkZXJzLnRpbGVfYm91bmRzWzFdO1xuICAgIHZhciBlZGdlID0gbnVsbDtcblxuICAgIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMF0sIHRpbGVfbWluLngsIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzBdLCB0aWxlX21pbi54LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAnbGVmdCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRvbGVyYW5jZV9mdW5jdGlvbihwYVswXSwgdGlsZV9tYXgueCwgdG9sZXJhbmNlKSAmJiB0b2xlcmFuY2VfZnVuY3Rpb24ocGJbMF0sIHRpbGVfbWF4LngsIHRvbGVyYW5jZSkpIHtcbiAgICAgICAgZWRnZSA9ICdyaWdodCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRvbGVyYW5jZV9mdW5jdGlvbihwYVsxXSwgdGlsZV9taW4ueSwgdG9sZXJhbmNlKSAmJiB0b2xlcmFuY2VfZnVuY3Rpb24ocGJbMV0sIHRpbGVfbWluLnksIHRvbGVyYW5jZSkpIHtcbiAgICAgICAgZWRnZSA9ICd0b3AnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMV0sIHRpbGVfbWF4LnksIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzFdLCB0aWxlX21heC55LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAnYm90dG9tJztcbiAgICB9XG4gICAgcmV0dXJuIGVkZ2U7XG59O1xuXG5HTEJ1aWxkZXJzLnNldFRpbGVTY2FsZSA9IGZ1bmN0aW9uIChzY2FsZSlcbntcbiAgICBHTEJ1aWxkZXJzLnRpbGVfYm91bmRzID0gW1xuICAgICAgICBQb2ludCgwLCAwKSxcbiAgICAgICAgUG9pbnQoc2NhbGUsIC1zY2FsZSkgLy8gVE9ETzogY29ycmVjdCBmb3IgZmxpcHBlZCB5LWF4aXM/XG4gICAgXTtcbn07XG5cbkdMQnVpbGRlcnMudmFsdWVzV2l0aGluVG9sZXJhbmNlID0gZnVuY3Rpb24gKGEsIGIsIHRvbGVyYW5jZSlcbntcbiAgICB0b2xlcmFuY2UgPSB0b2xlcmFuY2UgfHwgMTtcbiAgICByZXR1cm4gKE1hdGguYWJzKGEgLSBiKSA8IHRvbGVyYW5jZSk7XG59O1xuXG4vLyBCdWlsZCBhIHppZ3phZyBsaW5lIHBhdHRlcm4gZm9yIHRlc3Rpbmcgam9pbnMgYW5kIGNhcHNcbkdMQnVpbGRlcnMuYnVpbGRaaWd6YWdMaW5lVGVzdFBhdHRlcm4gPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBtaW4gPSBQb2ludCgwLCAwKTsgLy8gdGlsZS5taW47XG4gICAgdmFyIG1heCA9IFBvaW50KDQwOTYsIDQwOTYpOyAvLyB0aWxlLm1heDtcbiAgICB2YXIgZyA9IHtcbiAgICAgICAgaWQ6IDEyMyxcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJyxcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC43NSArIG1heC54ICogMC4yNSwgbWluLnkgKiAwLjc1ICsgbWF4LnkgKiAwLjI1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjc1ICsgbWF4LnggKiAwLjI1LCBtaW4ueSAqIDAuNSArIG1heC55ICogMC41XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjI1ICsgbWF4LnggKiAwLjc1LCBtaW4ueSAqIDAuNzUgKyBtYXgueSAqIDAuMjVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuMjUgKyBtYXgueCAqIDAuNzUsIG1pbi55ICogMC4yNSArIG1heC55ICogMC43NV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC40ICsgbWF4LnggKiAwLjYsIG1pbi55ICogMC41ICsgbWF4LnkgKiAwLjVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNSArIG1heC54ICogMC41LCBtaW4ueSAqIDAuMjUgKyBtYXgueSAqIDAuNzVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNzUgKyBtYXgueCAqIDAuMjUsIG1pbi55ICogMC4yNSArIG1heC55ICogMC43NV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC43NSArIG1heC54ICogMC4yNSwgbWluLnkgKiAwLjQgKyBtYXgueSAqIDAuNl1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAga2luZDogJ2RlYnVnJ1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBjb25zb2xlLmxvZyhnLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcbiAgICByZXR1cm4gZztcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gR0xCdWlsZGVycztcbn1cbiIsIi8qKiogTWFuYWdlIHJlbmRlcmluZyBmb3IgcHJpbWl0aXZlcyAqKiovXG52YXIgR0wgPSByZXF1aXJlKCcuL2dsLmpzJyk7XG52YXIgR0xWZXJ0ZXhMYXlvdXQgPSByZXF1aXJlKCcuL2dsX3ZlcnRleF9sYXlvdXQuanMnKTtcbi8vIHZhciBHTFZlcnRleEFycmF5T2JqZWN0ID0gcmVxdWlyZSgnLi9nbF92YW8uanMnKTtcbnZhciBHTFByb2dyYW0gPSByZXF1aXJlKCcuL2dsX3Byb2dyYW0uanMnKTtcblxuLy8gQSBzaW5nbGUgbWVzaC9WQk8sIGRlc2NyaWJlZCBieSBhIHZlcnRleCBsYXlvdXQsIHRoYXQgY2FuIGJlIGRyYXduIHdpdGggb25lIG9yIG1vcmUgcHJvZ3JhbXNcbmZ1bmN0aW9uIEdMR2VvbWV0cnkgKGdsLCB2ZXJ0ZXhfZGF0YSwgdmVydGV4X2xheW91dCwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLnZlcnRleF9kYXRhID0gdmVydGV4X2RhdGE7IC8vIEZsb2F0MzJBcnJheVxuICAgIHRoaXMudmVydGV4X2xheW91dCA9IHZlcnRleF9sYXlvdXQ7XG4gICAgdGhpcy5idWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgIHRoaXMuZHJhd19tb2RlID0gb3B0aW9ucy5kcmF3X21vZGUgfHwgdGhpcy5nbC5UUklBTkdMRVM7XG4gICAgdGhpcy5kYXRhX3VzYWdlID0gb3B0aW9ucy5kYXRhX3VzYWdlIHx8IHRoaXMuZ2wuU1RBVElDX0RSQVc7XG4gICAgdGhpcy52ZXJ0aWNlc19wZXJfZ2VvbWV0cnkgPSAzOyAvLyBUT0RPOiBzdXBwb3J0IGxpbmVzLCBzdHJpcCwgZmFuLCBldGMuXG5cbiAgICB0aGlzLnZlcnRleF9jb3VudCA9IHRoaXMudmVydGV4X2RhdGEuYnl0ZUxlbmd0aCAvIHRoaXMudmVydGV4X2xheW91dC5zdHJpZGU7XG4gICAgdGhpcy5nZW9tZXRyeV9jb3VudCA9IHRoaXMudmVydGV4X2NvdW50IC8gdGhpcy52ZXJ0aWNlc19wZXJfZ2VvbWV0cnk7XG5cbiAgICAvLyBUT0RPOiBkaXNhYmxpbmcgVkFPcyBmb3Igbm93IGJlY2F1c2Ugd2UgbmVlZCB0byBzdXBwb3J0IGRpZmZlcmVudCB2ZXJ0ZXggbGF5b3V0ICsgcHJvZ3JhbSBjb21iaW5hdGlvbnMsXG4gICAgLy8gd2hlcmUgbm90IGFsbCBwcm9ncmFtcyB3aWxsIHJlY29nbml6ZSBhbGwgYXR0cmlidXRlcyAoZS5nLiBmZWF0dXJlIHNlbGVjdGlvbiBzaGFkZXJzIGluY2x1ZGUgZXh0cmEgYXR0cmliKS5cbiAgICAvLyBUbyBzdXBwb3J0IFZBT3MgaGVyZSwgd291bGQgbmVlZCB0byBzdXBwb3J0IG11bHRpcGxlIHBlciBnZW9tZXRyeSwga2V5ZWQgYnkgR0wgcHJvZ3JhbT9cbiAgICAvLyB0aGlzLnZhbyA9IEdMVmVydGV4QXJyYXlPYmplY3QuY3JlYXRlKGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICAvLyAgICAgdGhpcy5zZXR1cCgpO1xuICAgIC8vIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICB0aGlzLmdsLmJ1ZmZlckRhdGEodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4X2RhdGEsIHRoaXMuZGF0YV91c2FnZSk7XG59XG5cbi8vIFJlbmRlciwgYnkgZGVmYXVsdCB3aXRoIGN1cnJlbnRseSBib3VuZCBwcm9ncmFtLCBvciBvdGhlcndpc2Ugd2l0aCBvcHRpb25hbGx5IHByb3ZpZGVkIG9uZVxuR0xHZW9tZXRyeS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAvLyBHTFZlcnRleEFycmF5T2JqZWN0LmJpbmQodGhpcy52YW8pO1xuXG4gICAgaWYgKHR5cGVvZiB0aGlzLl9yZW5kZXJfc2V0dXAgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9yZW5kZXJfc2V0dXAoKTtcbiAgICB9XG5cbiAgICB2YXIgZ2xfcHJvZ3JhbSA9IG9wdGlvbnMuZ2xfcHJvZ3JhbSB8fCBHTFByb2dyYW0uY3VycmVudDtcbiAgICBnbF9wcm9ncmFtLnVzZSgpO1xuXG4gICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgdGhpcy52ZXJ0ZXhfbGF5b3V0LmVuYWJsZSh0aGlzLmdsLCBnbF9wcm9ncmFtKTtcblxuICAgIC8vIFRPRE86IHN1cHBvcnQgZWxlbWVudCBhcnJheSBtb2RlXG4gICAgdGhpcy5nbC5kcmF3QXJyYXlzKHRoaXMuZHJhd19tb2RlLCAwLCB0aGlzLnZlcnRleF9jb3VudCk7XG4gICAgLy8gR0xWZXJ0ZXhBcnJheU9iamVjdC5iaW5kKG51bGwpO1xufTtcblxuR0xHZW9tZXRyeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpXG57XG4gICAgY29uc29sZS5sb2coXCJHTEdlb21ldHJ5LmRlc3Ryb3k6IGRlbGV0ZSBidWZmZXIgb2Ygc2l6ZSBcIiArIHRoaXMudmVydGV4X2RhdGEuYnl0ZUxlbmd0aCk7XG4gICAgdGhpcy5nbC5kZWxldGVCdWZmZXIodGhpcy5idWZmZXIpO1xuICAgIGRlbGV0ZSB0aGlzLnZlcnRleF9kYXRhO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHTEdlb21ldHJ5O1xufVxuIiwiLy8gUmVuZGVyaW5nIG1vZGVzXG5cbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wuanMnKTtcbnZhciBHTEJ1aWxkZXJzID0gcmVxdWlyZSgnLi9nbF9idWlsZGVycy5qcycpO1xudmFyIEdMR2VvbWV0cnkgPSByZXF1aXJlKCcuL2dsX2dlb20uanMnKTtcbnZhciBHTFZlcnRleExheW91dCA9IHJlcXVpcmUoJy4vZ2xfdmVydGV4X2xheW91dC5qcycpO1xudmFyIEdMUHJvZ3JhbSA9IHJlcXVpcmUoJy4vZ2xfcHJvZ3JhbS5qcycpO1xudmFyIHNoYWRlcl9zb3VyY2VzID0gcmVxdWlyZSgnLi9nbF9zaGFkZXJzLmpzJyk7IC8vIGJ1aWx0LWluIHNoYWRlcnNcblxudmFyIFF1ZXVlID0gcmVxdWlyZSgncXVldWUtYXN5bmMnKTtcblxuLy8gQmFzZVxuXG52YXIgUmVuZGVyTW9kZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoZ2wpIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLm1ha2VHTFByb2dyYW0oKTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuX2luaXQgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZWZyZXNoOiBmdW5jdGlvbiAoKSB7IC8vIFRPRE86IHNob3VsZCB0aGlzIGJlIGFzeW5jL25vbi1ibG9ja2luZz9cbiAgICAgICAgdGhpcy5tYWtlR0xQcm9ncmFtKCk7XG4gICAgfSxcbiAgICBkZWZpbmVzOiB7fSxcbiAgICBzZWxlY3Rpb246IGZhbHNlLFxuICAgIGJ1aWxkUG9seWdvbnM6IGZ1bmN0aW9uKCl7fSwgLy8gYnVpbGQgZnVuY3Rpb25zIGFyZSBuby1vcHMgdW50aWwgb3ZlcnJpZGVuXG4gICAgYnVpbGRMaW5lczogZnVuY3Rpb24oKXt9LFxuICAgIGJ1aWxkUG9pbnRzOiBmdW5jdGlvbigpe30sXG4gICAgbWFrZUdMR2VvbWV0cnk6IGZ1bmN0aW9uICh2ZXJ0ZXhfZGF0YSkge1xuICAgICAgICByZXR1cm4gbmV3IEdMR2VvbWV0cnkodGhpcy5nbCwgdmVydGV4X2RhdGEsIHRoaXMudmVydGV4X2xheW91dCk7XG4gICAgfVxufTtcblxuUmVuZGVyTW9kZS5tYWtlR0xQcm9ncmFtID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIjogXCIgKyBcInN0YXJ0IGJ1aWxkaW5nXCIpO1xuICAgIHZhciBxdWV1ZSA9IFF1ZXVlKCk7XG5cbiAgICAvLyBCdWlsZCBkZWZpbmVzICYgZm9yIHNlbGVjdGlvbiAobmVlZCB0byBjcmVhdGUgYSBuZXcgb2JqZWN0IHNpbmNlIHRoZSBmaXJzdCBpcyBzdG9yZWQgYXMgYSByZWZlcmVuY2UgYnkgdGhlIHByb2dyYW0pXG4gICAgdmFyIGRlZmluZXMgPSB0aGlzLmJ1aWxkRGVmaW5lTGlzdCgpO1xuICAgIGlmICh0aGlzLnNlbGVjdGlvbikge1xuICAgICAgICB2YXIgc2VsZWN0aW9uX2RlZmluZXMgPSBPYmplY3QuY3JlYXRlKGRlZmluZXMpO1xuICAgICAgICBzZWxlY3Rpb25fZGVmaW5lc1snRkVBVFVSRV9TRUxFQ1RJT04nXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gR2V0IGFueSBjdXN0b20gY29kZSB0cmFuc2Zvcm1zXG4gICAgdmFyIHRyYW5zZm9ybXMgPSAodGhpcy5zaGFkZXJzICYmIHRoaXMuc2hhZGVycy50cmFuc2Zvcm1zKTtcblxuICAgIC8vIENyZWF0ZSBzaGFkZXJzIC0gcHJvZ3JhbXMgbWF5IHBvaW50IHRvIGluaGVyaXRlZCBwYXJlbnQgcHJvcGVydGllcywgYnV0IHNob3VsZCBiZSByZXBsYWNlZCBieSBzdWJjbGFzcyB2ZXJzaW9uXG4gICAgdmFyIHByb2dyYW0gPSAodGhpcy5oYXNPd25Qcm9wZXJ0eSgnZ2xfcHJvZ3JhbScpICYmIHRoaXMuZ2xfcHJvZ3JhbSk7XG4gICAgdmFyIHNlbGVjdGlvbl9wcm9ncmFtID0gKHRoaXMuaGFzT3duUHJvcGVydHkoJ3NlbGVjdGlvbl9nbF9wcm9ncmFtJykgJiYgdGhpcy5zZWxlY3Rpb25fZ2xfcHJvZ3JhbSk7XG5cbiAgICBxdWV1ZS5kZWZlcihjb21wbGV0ZSA9PiB7XG4gICAgICAgIGlmICghcHJvZ3JhbSkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5uYW1lICsgXCI6IFwiICsgXCJpbnN0YW50aWF0ZVwiKTtcbiAgICAgICAgICAgIHByb2dyYW0gPSBuZXcgR0xQcm9ncmFtKFxuICAgICAgICAgICAgICAgIHRoaXMuZ2wsXG4gICAgICAgICAgICAgICAgc2hhZGVyX3NvdXJjZXNbdGhpcy52ZXJ0ZXhfc2hhZGVyX2tleV0sXG4gICAgICAgICAgICAgICAgc2hhZGVyX3NvdXJjZXNbdGhpcy5mcmFnbWVudF9zaGFkZXJfa2V5XSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmluZXM6IGRlZmluZXMsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybXM6IHRyYW5zZm9ybXMsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNvbXBsZXRlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwicmUtY29tcGlsZVwiKTtcbiAgICAgICAgICAgIHByb2dyYW0uZGVmaW5lcyA9IGRlZmluZXM7XG4gICAgICAgICAgICBwcm9ncmFtLnRyYW5zZm9ybXMgPSB0cmFuc2Zvcm1zO1xuICAgICAgICAgICAgcHJvZ3JhbS5jb21waWxlKGNvbXBsZXRlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuc2VsZWN0aW9uKSB7XG4gICAgICAgIHF1ZXVlLmRlZmVyKGNvbXBsZXRlID0+IHtcbiAgICAgICAgICAgIGlmICghc2VsZWN0aW9uX3Byb2dyYW0pIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIjogXCIgKyBcInNlbGVjdGlvbiBpbnN0YW50aWF0ZVwiKTtcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25fcHJvZ3JhbSA9IG5ldyBHTFByb2dyYW0oXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wsXG4gICAgICAgICAgICAgICAgICAgIHNoYWRlcl9zb3VyY2VzW3RoaXMudmVydGV4X3NoYWRlcl9rZXldLFxuICAgICAgICAgICAgICAgICAgICBzaGFkZXJfc291cmNlc1snc2VsZWN0aW9uX2ZyYWdtZW50J10sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluZXM6IHNlbGVjdGlvbl9kZWZpbmVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtczogdHJhbnNmb3JtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICh0aGlzLm5hbWUgKyAnIChzZWxlY3Rpb24pJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogY29tcGxldGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIjogXCIgKyBcInNlbGVjdGlvbiByZS1jb21waWxlXCIpO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtLmRlZmluZXMgPSBzZWxlY3Rpb25fZGVmaW5lcztcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25fcHJvZ3JhbS50cmFuc2Zvcm1zID0gdHJhbnNmb3JtcztcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25fcHJvZ3JhbS5jb21waWxlKGNvbXBsZXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gV2FpdCBmb3IgcHJvZ3JhbShzKSB0byBjb21waWxlIGJlZm9yZSByZXBsYWNpbmcgdGhlbVxuICAgIC8vIFRPRE86IHNob3VsZCB0aGlzIGVudGlyZSBtZXRob2Qgb2ZmZXIgYSBjYWxsYmFjayBmb3Igd2hlbiBjb21waWxhdGlvbiBjb21wbGV0ZXM/XG4gICAgcXVldWUuYXdhaXQoKCkgPT4ge1xuICAgICAgIGlmIChwcm9ncmFtKSB7XG4gICAgICAgICAgIHRoaXMuZ2xfcHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgfVxuXG4gICAgICAgaWYgKHNlbGVjdGlvbl9wcm9ncmFtKSB7XG4gICAgICAgICAgIHRoaXMuc2VsZWN0aW9uX2dsX3Byb2dyYW0gPSBzZWxlY3Rpb25fcHJvZ3JhbTtcbiAgICAgICB9XG5cbiAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIjogXCIgKyBcImZpbmlzaGVkIGJ1aWxkaW5nXCIpO1xuICAgIH0pO1xufVxuXG4vLyBUT0RPOiBjb3VsZCBwcm9iYWJseSBjb21iaW5lIGFuZCBnZW5lcmFsaXplIHRoaXMgd2l0aCBzaW1pbGFyIG1ldGhvZCBpbiBHTFByb2dyYW1cbi8vIChsaXN0IG9mIGRlZmluZSBvYmplY3RzIHRoYXQgaW5oZXJpdCBmcm9tIGVhY2ggb3RoZXIpXG5SZW5kZXJNb2RlLmJ1aWxkRGVmaW5lTGlzdCA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gQWRkIGFueSBjdXN0b20gZGVmaW5lcyB0byBidWlsdC1pbiBtb2RlIGRlZmluZXNcbiAgICB2YXIgZGVmaW5lcyA9IHt9OyAvLyBjcmVhdGUgYSBuZXcgb2JqZWN0IHRvIGF2b2lkIG11dGF0aW5nIGEgcHJvdG90eXBlIHZhbHVlIHRoYXQgbWF5IGJlIHNoYXJlZCB3aXRoIG90aGVyIG1vZGVzXG4gICAgaWYgKHRoaXMuZGVmaW5lcyAhPSBudWxsKSB7XG4gICAgICAgIGZvciAodmFyIGQgaW4gdGhpcy5kZWZpbmVzKSB7XG4gICAgICAgICAgICBkZWZpbmVzW2RdID0gdGhpcy5kZWZpbmVzW2RdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnNoYWRlcnMgIT0gbnVsbCAmJiB0aGlzLnNoYWRlcnMuZGVmaW5lcyAhPSBudWxsKSB7XG4gICAgICAgIGZvciAodmFyIGQgaW4gdGhpcy5zaGFkZXJzLmRlZmluZXMpIHtcbiAgICAgICAgICAgIGRlZmluZXNbZF0gPSB0aGlzLnNoYWRlcnMuZGVmaW5lc1tkXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVmaW5lcztcbn07XG5cbi8vIFNldCBtb2RlIHVuaWZvcm1zIG9uIGN1cnJlbnRseSBib3VuZCBwcm9ncmFtXG5SZW5kZXJNb2RlLnNldFVuaWZvcm1zID0gZnVuY3Rpb24gKClcbntcbiAgICB2YXIgZ2xfcHJvZ3JhbSA9IEdMUHJvZ3JhbS5jdXJyZW50O1xuICAgIGlmIChnbF9wcm9ncmFtICE9IG51bGwgJiYgdGhpcy5zaGFkZXJzICE9IG51bGwgJiYgdGhpcy5zaGFkZXJzLnVuaWZvcm1zICE9IG51bGwpIHtcbiAgICAgICAgZ2xfcHJvZ3JhbS5zZXRVbmlmb3Jtcyh0aGlzLnNoYWRlcnMudW5pZm9ybXMpO1xuICAgIH1cbn07XG5cblJlbmRlck1vZGUudXBkYXRlID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBNb2RlLXNwZWNpZmljIGFuaW1hdGlvblxuICAgIGlmICh0eXBlb2YgdGhpcy5hbmltYXRpb24gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbigpO1xuICAgIH1cbn07XG5cblxudmFyIE1vZGVzID0ge307XG52YXIgTW9kZU1hbmFnZXIgPSB7fTtcblxuLy8gVXBkYXRlIGJ1aWx0LWluIG1vZGUgb3IgY3JlYXRlIGEgbmV3IG9uZVxuTW9kZU1hbmFnZXIuY29uZmlndXJlTW9kZSA9IGZ1bmN0aW9uIChuYW1lLCBzZXR0aW5ncylcbntcbiAgICBNb2Rlc1tuYW1lXSA9IE1vZGVzW25hbWVdIHx8IE9iamVjdC5jcmVhdGUoTW9kZXNbc2V0dGluZ3MuZXh0ZW5kc10gfHwgUmVuZGVyTW9kZSk7XG4gICAgaWYgKE1vZGVzW3NldHRpbmdzLmV4dGVuZHNdKSB7XG4gICAgICAgIE1vZGVzW25hbWVdLnBhcmVudCA9IE1vZGVzW3NldHRpbmdzLmV4dGVuZHNdOyAvLyBleHBsaWNpdCAnc3VwZXInIGNsYXNzIGFjY2Vzc1xuICAgIH1cblxuICAgIGZvciAodmFyIHMgaW4gc2V0dGluZ3MpIHtcbiAgICAgICAgTW9kZXNbbmFtZV1bc10gPSBzZXR0aW5nc1tzXTtcbiAgICB9XG5cbiAgICBNb2Rlc1tuYW1lXS5uYW1lID0gbmFtZTtcbiAgICByZXR1cm4gTW9kZXNbbmFtZV07XG59O1xuXG5cbi8vIEJ1aWx0LWluIHJlbmRlcmluZyBtb2Rlc1xuXG4vKioqIFBsYWluIHBvbHlnb25zICoqKi9cblxuTW9kZXMucG9seWdvbnMgPSBPYmplY3QuY3JlYXRlKFJlbmRlck1vZGUpO1xuTW9kZXMucG9seWdvbnMubmFtZSA9ICdwb2x5Z29ucyc7XG5cbk1vZGVzLnBvbHlnb25zLnZlcnRleF9zaGFkZXJfa2V5ID0gJ3BvbHlnb25fdmVydGV4Jztcbk1vZGVzLnBvbHlnb25zLmZyYWdtZW50X3NoYWRlcl9rZXkgPSAncG9seWdvbl9mcmFnbWVudCc7XG5cbk1vZGVzLnBvbHlnb25zLmRlZmluZXMgPSB7XG4gICAgJ1dPUkxEX1BPU0lUSU9OX1dSQVAnOiAxMDAwMDAgLy8gZGVmYXVsdCB3b3JsZCBjb29yZHMgdG8gd3JhcCBldmVyeSAxMDAsMDAwIG1ldGVycywgY2FuIHR1cm4gb2ZmIGJ5IHNldHRpbmcgdGhpcyB0byAnZmFsc2UnXG59O1xuXG5Nb2Rlcy5wb2x5Z29ucy5zZWxlY3Rpb24gPSB0cnVlO1xuXG5Nb2Rlcy5wb2x5Z29ucy5faW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZlcnRleF9sYXlvdXQgPSBuZXcgR0xWZXJ0ZXhMYXlvdXQodGhpcy5nbCwgW1xuICAgICAgICB7IG5hbWU6ICdhX3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9ub3JtYWwnLCBzaXplOiAzLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9zZWxlY3Rpb25fY29sb3InLCBzaXplOiA0LCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgc2l6ZTogMSwgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuICAgIF0pO1xufTtcblxuTW9kZXMucG9seWdvbnMuYnVpbGRQb2x5Z29ucyA9IGZ1bmN0aW9uIChwb2x5Z29ucywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgLy8gT3V0bGluZXMgaGF2ZSBhIHNsaWdodGx5IGRpZmZlcmVudCBzZXQgb2YgY29uc3RhbnRzLCBiZWNhdXNlIHRoZSBsYXllciBudW1iZXIgaXMgbW9kaWZpZWRcbiAgICBpZiAoc3R5bGUub3V0bGluZS5jb2xvcikge1xuICAgICAgICB2YXIgb3V0bGluZV92ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICAgICAgc3R5bGUub3V0bGluZS5jb2xvclswXSwgc3R5bGUub3V0bGluZS5jb2xvclsxXSwgc3R5bGUub3V0bGluZS5jb2xvclsyXSxcbiAgICAgICAgICAgIHN0eWxlLnNlbGVjdGlvbi5jb2xvclswXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzFdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMl0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclszXSxcbiAgICAgICAgICAgIHN0eWxlLmxheWVyX251bSAtIDAuNSAvLyBvdXRsaW5lcyBzaXQgYmV0d2VlbiBsYXllcnMsIHVuZGVybmVhdGggY3VycmVudCBsYXllciBidXQgYWJvdmUgdGhlIG9uZSBiZWxvd1xuICAgICAgICBdO1xuICAgIH1cblxuICAgIC8vIEV4dHJ1ZGVkIHBvbHlnb25zIChlLmcuIDNEIGJ1aWxkaW5ncylcbiAgICBpZiAoc3R5bGUuZXh0cnVkZSAmJiBzdHlsZS5oZWlnaHQpIHtcbiAgICAgICAgR0xCdWlsZGVycy5idWlsZEV4dHJ1ZGVkUG9seWdvbnMoXG4gICAgICAgICAgICBwb2x5Z29ucyxcbiAgICAgICAgICAgIHN0eWxlLnosXG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQsXG4gICAgICAgICAgICBzdHlsZS5taW5faGVpZ2h0LFxuICAgICAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbiAgICAvLyBSZWd1bGFyIHBvbHlnb25zXG4gICAgZWxzZSB7XG4gICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5Z29ucyhcbiAgICAgICAgICAgIHBvbHlnb25zLFxuICAgICAgICAgICAgc3R5bGUueixcbiAgICAgICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5vcm1hbHM6IHRydWUsXG4gICAgICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIENhbGxiYWNrLWJhc2UgYnVpbGRlciAoZm9yIGZ1dHVyZSBleHBsb3JhdGlvbilcbiAgICAgICAgLy8gdmFyIG5vcm1hbF92ZXJ0ZXhfY29uc3RhbnRzID0gWzAsIDAsIDFdLmNvbmNhdCh2ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICAgICAgLy8gR0xCdWlsZGVycy5idWlsZFBvbHlnb25zMihcbiAgICAgICAgLy8gICAgIHBvbHlnb25zLFxuICAgICAgICAvLyAgICAgeixcbiAgICAgICAgLy8gICAgIGZ1bmN0aW9uICh2ZXJ0aWNlcykge1xuICAgICAgICAvLyAgICAgICAgIC8vIHZhciB2cyA9IHZlcnRpY2VzLnBvc2l0aW9ucztcbiAgICAgICAgLy8gICAgICAgICAvLyBmb3IgKHZhciB2IGluIHZzKSB7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vIHZhciBiYyA9IFsodiAlIDMpID8gMCA6IDEsICgodiArIDEpICUgMykgPyAwIDogMSwgKCh2ICsgMikgJSAzKSA/IDAgOiAxXTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgLy8gdmFyIGJjID0gW2NlbnRyb2lkLngsIGNlbnRyb2lkLnksIDBdO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAvLyB2c1t2XSA9IHZlcnRpY2VzLnBvc2l0aW9uc1t2XS5jb25jYXQoeiwgMCwgMCwgMSwgYmMpO1xuXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vIHZzW3ZdID0gdmVydGljZXMucG9zaXRpb25zW3ZdLmNvbmNhdCh6LCAwLCAwLCAxKTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgdnNbdl0gPSB2ZXJ0aWNlcy5wb3NpdGlvbnNbdl0uY29uY2F0KDAsIDAsIDEpO1xuICAgICAgICAvLyAgICAgICAgIC8vIH1cblxuICAgICAgICAvLyAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLnBvc2l0aW9ucywgbm9ybWFsX3ZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcblxuICAgICAgICAvLyAgICAgICAgIC8vIEdMLmFkZFZlcnRpY2VzQnlBdHRyaWJ1dGVMYXlvdXQoXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIFtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHsgbmFtZTogJ2FfcG9zaXRpb24nLCBkYXRhOiB2ZXJ0aWNlcy5wb3NpdGlvbnMgfSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHsgbmFtZTogJ2Ffbm9ybWFsJywgZGF0YTogWzAsIDAsIDFdIH0sXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgZGF0YTogW3N0eWxlLmNvbG9yWzBdLCBzdHlsZS5jb2xvclsxXSwgc3R5bGUuY29sb3JbMl1dIH0sXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgZGF0YTogc3R5bGUubGF5ZXJfbnVtIH1cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgXSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgdmVydGV4X2RhdGFcbiAgICAgICAgLy8gICAgICAgICAvLyApO1xuXG4gICAgICAgIC8vICAgICAgICAgLy8gR0wuYWRkVmVydGljZXNNdWx0aXBsZUF0dHJpYnV0ZXMoW3ZlcnRpY2VzLnBvc2l0aW9uc10sIG5vcm1hbF92ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICk7XG4gICAgfVxuXG4gICAgLy8gUG9seWdvbiBvdXRsaW5lc1xuICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yICYmIHN0eWxlLm91dGxpbmUud2lkdGgpIHtcbiAgICAgICAgZm9yICh2YXIgbXBjPTA7IG1wYyA8IHBvbHlnb25zLmxlbmd0aDsgbXBjKyspIHtcbiAgICAgICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMoXG4gICAgICAgICAgICAgICAgcG9seWdvbnNbbXBjXSxcbiAgICAgICAgICAgICAgICBzdHlsZS56LFxuICAgICAgICAgICAgICAgIHN0eWxlLm91dGxpbmUud2lkdGgsXG4gICAgICAgICAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjbG9zZWRfcG9seWdvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlX3RpbGVfZWRnZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IG91dGxpbmVfdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5Nb2Rlcy5wb2x5Z29ucy5idWlsZExpbmVzID0gZnVuY3Rpb24gKGxpbmVzLCBzdHlsZSwgdmVydGV4X2RhdGEpXG57XG4gICAgLy8gVE9PRDogcmVkdWNlIHJlZHVuZGFuY3kgb2YgY29uc3RhbnQgY2FsYyBiZXR3ZWVuIGJ1aWxkZXJzXG4gICAgLy8gQ29sb3IgYW5kIGxheWVyIG51bWJlciBhcmUgY3VycmVudGx5IGNvbnN0YW50IGFjcm9zcyB2ZXJ0aWNlc1xuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICBzdHlsZS5jb2xvclswXSwgc3R5bGUuY29sb3JbMV0sIHN0eWxlLmNvbG9yWzJdLFxuICAgICAgICBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMF0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsxXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzJdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbM10sXG4gICAgICAgIHN0eWxlLmxheWVyX251bVxuICAgIF07XG5cbiAgICAvLyBPdXRsaW5lcyBoYXZlIGEgc2xpZ2h0bHkgZGlmZmVyZW50IHNldCBvZiBjb25zdGFudHMsIGJlY2F1c2UgdGhlIGxheWVyIG51bWJlciBpcyBtb2RpZmllZFxuICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yKSB7XG4gICAgICAgIHZhciBvdXRsaW5lX3ZlcnRleF9jb25zdGFudHMgPSBbXG4gICAgICAgICAgICBzdHlsZS5vdXRsaW5lLmNvbG9yWzBdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzFdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzJdLFxuICAgICAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICAgICAgc3R5bGUubGF5ZXJfbnVtIC0gMC41IC8vIG91dGxpbmVzIHNpdCBiZXR3ZWVuIGxheWVycywgdW5kZXJuZWF0aCBjdXJyZW50IGxheWVyIGJ1dCBhYm92ZSB0aGUgb25lIGJlbG93XG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgLy8gTWFpbiBsaW5lc1xuICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMoXG4gICAgICAgIGxpbmVzLFxuICAgICAgICBzdHlsZS56LFxuICAgICAgICBzdHlsZS53aWR0aCxcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IHZlcnRleF9jb25zdGFudHNcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBMaW5lIG91dGxpbmVzXG4gICAgaWYgKHN0eWxlLm91dGxpbmUuY29sb3IgJiYgc3R5bGUub3V0bGluZS53aWR0aCkge1xuICAgICAgICBHTEJ1aWxkZXJzLmJ1aWxkUG9seWxpbmVzKFxuICAgICAgICAgICAgbGluZXMsXG4gICAgICAgICAgICBzdHlsZS56LFxuICAgICAgICAgICAgc3R5bGUud2lkdGggKyAyICogc3R5bGUub3V0bGluZS53aWR0aCxcbiAgICAgICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IG91dGxpbmVfdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbn07XG5cbk1vZGVzLnBvbHlnb25zLmJ1aWxkUG9pbnRzID0gZnVuY3Rpb24gKHBvaW50cywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIFRPT0Q6IHJlZHVjZSByZWR1bmRhbmN5IG9mIGNvbnN0YW50IGNhbGMgYmV0d2VlbiBidWlsZGVyc1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgR0xCdWlsZGVycy5idWlsZFF1YWRzRm9yUG9pbnRzKFxuICAgICAgICBwb2ludHMsXG4gICAgICAgIHN0eWxlLnNpemUgKiAyLFxuICAgICAgICBzdHlsZS5zaXplICogMixcbiAgICAgICAgc3R5bGUueixcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5vcm1hbHM6IHRydWUsXG4gICAgICAgICAgICB0ZXhjb29yZHM6IGZhbHNlLFxuICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICB9XG4gICAgKTtcbn07XG5cblxuLyoqKiBQb2ludHMgdy9zaW1wbGUgZGlzdGFuY2UgZmllbGQgcmVuZGVyaW5nICoqKi9cblxuTW9kZXMucG9pbnRzID0gT2JqZWN0LmNyZWF0ZShSZW5kZXJNb2RlKTtcbk1vZGVzLnBvaW50cy5uYW1lID0gJ3BvaW50cyc7XG5cbk1vZGVzLnBvaW50cy52ZXJ0ZXhfc2hhZGVyX2tleSA9ICdwb2ludF92ZXJ0ZXgnO1xuTW9kZXMucG9pbnRzLmZyYWdtZW50X3NoYWRlcl9rZXkgPSAncG9pbnRfZnJhZ21lbnQnO1xuXG5Nb2Rlcy5wb2ludHMuZGVmaW5lcyA9IHtcbiAgICAnRUZGRUNUX1NDUkVFTl9DT0xPUic6IHRydWVcbn07XG5cbk1vZGVzLnBvaW50cy5zZWxlY3Rpb24gPSB0cnVlO1xuXG5Nb2Rlcy5wb2ludHMuX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52ZXJ0ZXhfbGF5b3V0ID0gbmV3IEdMVmVydGV4TGF5b3V0KHRoaXMuZ2wsIFtcbiAgICAgICAgeyBuYW1lOiAnYV9wb3NpdGlvbicsIHNpemU6IDMsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2FfdGV4Y29vcmQnLCBzaXplOiAyLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9zZWxlY3Rpb25fY29sb3InLCBzaXplOiA0LCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgc2l6ZTogMSwgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuICAgIF0pO1xufTtcblxuTW9kZXMucG9pbnRzLmJ1aWxkUG9pbnRzID0gZnVuY3Rpb24gKHBvaW50cywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIFRPT0Q6IHJlZHVjZSByZWR1bmRhbmN5IG9mIGNvbnN0YW50IGNhbGMgYmV0d2VlbiBidWlsZGVyc1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgR0xCdWlsZGVycy5idWlsZFF1YWRzRm9yUG9pbnRzKFxuICAgICAgICBwb2ludHMsXG4gICAgICAgIHN0eWxlLnNpemUgKiAyLFxuICAgICAgICBzdHlsZS5zaXplICogMixcbiAgICAgICAgc3R5bGUueixcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5vcm1hbHM6IGZhbHNlLFxuICAgICAgICAgICAgdGV4Y29vcmRzOiB0cnVlLFxuICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICB9XG4gICAgKTtcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBNb2RlTWFuYWdlcjogTW9kZU1hbmFnZXIsXG4gICAgICAgIE1vZGVzOiBNb2Rlc1xuICAgIH07XG59XG4iLCIvLyBUaGluIEdMIHByb2dyYW0gd3JhcHAgdG8gY2FjaGUgdW5pZm9ybSBsb2NhdGlvbnMvdmFsdWVzLCBkbyBjb21waWxlLXRpbWUgcHJlLXByb2Nlc3Npbmdcbi8vIChpbmplY3RpbmcgI2RlZmluZXMgYW5kICNwcmFnbWEgdHJhbnNmb3JtcyBpbnRvIHNoYWRlcnMpLCBldGMuXG5cbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wuanMnKTtcbnZhciBHTFRleHR1cmUgPSByZXF1aXJlKCcuL2dsX3RleHR1cmUuanMnKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XG52YXIgUXVldWUgPSByZXF1aXJlKCdxdWV1ZS1hc3luYycpO1xuXG5HTFByb2dyYW0uaWQgPSAwOyAvLyBhc3NpZ24gZWFjaCBwcm9ncmFtIGEgdW5pcXVlIGlkXG5HTFByb2dyYW0ucHJvZ3JhbXMgPSB7fTsgLy8gcHJvZ3JhbXMsIGJ5IGlkXG5cbmZ1bmN0aW9uIEdMUHJvZ3JhbSAoZ2wsIHZlcnRleF9zaGFkZXIsIGZyYWdtZW50X3NoYWRlciwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLnByb2dyYW0gPSBudWxsO1xuICAgIHRoaXMuY29tcGlsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmRlZmluZXMgPSBvcHRpb25zLmRlZmluZXMgfHwge307IC8vIGtleS92YWx1ZXMgaW5zZXJ0ZWQgYXMgI2RlZmluZXMgaW50byBzaGFkZXJzIGF0IGNvbXBpbGUtdGltZVxuICAgIHRoaXMudHJhbnNmb3JtcyA9IG9wdGlvbnMudHJhbnNmb3JtczsgLy8ga2V5L3ZhbHVlcyBmb3IgVVJMcyBvZiBibG9ja3MgdGhhdCBjYW4gYmUgaW5qZWN0ZWQgaW50byBzaGFkZXJzIGF0IGNvbXBpbGUtdGltZVxuICAgIHRoaXMudW5pZm9ybXMgPSB7fTsgLy8gcHJvZ3JhbSBsb2NhdGlvbnMgb2YgdW5pZm9ybXMsIHNldC91cGRhdGVkIGF0IGNvbXBpbGUtdGltZVxuICAgIHRoaXMuYXR0cmlicyA9IHt9OyAvLyBwcm9ncmFtIGxvY2F0aW9ucyBvZiB2ZXJ0ZXggYXR0cmlidXRlc1xuXG4gICAgdGhpcy52ZXJ0ZXhfc2hhZGVyID0gdmVydGV4X3NoYWRlcjtcbiAgICB0aGlzLmZyYWdtZW50X3NoYWRlciA9IGZyYWdtZW50X3NoYWRlcjtcblxuICAgIHRoaXMuaWQgPSBHTFByb2dyYW0uaWQrKztcbiAgICBHTFByb2dyYW0ucHJvZ3JhbXNbdGhpcy5pZF0gPSB0aGlzO1xuICAgIHRoaXMubmFtZSA9IG9wdGlvbnMubmFtZTsgLy8gY2FuIHByb3ZpZGUgYSBwcm9ncmFtIG5hbWUgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKVxuXG4gICAgdGhpcy5jb21waWxlKG9wdGlvbnMuY2FsbGJhY2spO1xufTtcblxuLy8gVXNlIHByb2dyYW0gd3JhcHBlciB3aXRoIHNpbXBsZSBzdGF0ZSBjYWNoZVxuR0xQcm9ncmFtLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiAoKVxue1xuICAgIGlmICghdGhpcy5jb21waWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKEdMUHJvZ3JhbS5jdXJyZW50ICE9IHRoaXMpIHtcbiAgICAgICAgdGhpcy5nbC51c2VQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG4gICAgfVxuICAgIEdMUHJvZ3JhbS5jdXJyZW50ID0gdGhpcztcbn07XG5HTFByb2dyYW0uY3VycmVudCA9IG51bGw7XG5cbi8vIEdsb2JhbCBkZWZpbmVzIGFwcGxpZWQgdG8gYWxsIHByb2dyYW1zIChkdXBsaWNhdGUgcHJvcGVydGllcyBmb3IgYSBzcGVjaWZpYyBwcm9ncmFtIHdpbGwgdGFrZSBwcmVjZWRlbmNlKVxuR0xQcm9ncmFtLmRlZmluZXMgPSB7fTtcblxuR0xQcm9ncmFtLnByb3RvdHlwZS5jb21waWxlID0gZnVuY3Rpb24gKGNhbGxiYWNrKVxue1xuICAgIHZhciBxdWV1ZSA9IFF1ZXVlKCk7XG5cbiAgICAvLyBDb3B5IHNvdXJjZXMgZnJvbSBwcmUtbW9kaWZpZWQgdGVtcGxhdGVcbiAgICB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIgPSB0aGlzLnZlcnRleF9zaGFkZXI7XG4gICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSB0aGlzLmZyYWdtZW50X3NoYWRlcjtcblxuICAgIC8vIE1ha2UgbGlzdCBvZiBkZWZpbmVzIHRvIGJlIGluamVjdGVkIGxhdGVyXG4gICAgdmFyIGRlZmluZXMgPSB0aGlzLmJ1aWxkRGVmaW5lTGlzdCgpO1xuXG4gICAgLy8gSW5qZWN0IHVzZXItZGVmaW5lZCB0cmFuc2Zvcm1zIChhcmJpdHJhcnkgY29kZSBwb2ludHMgbWF0Y2hpbmcgbmFtZWQgI3ByYWdtYXMpXG4gICAgLy8gUmVwbGFjZSBhY2NvcmRpbmcgdG8gdGhpcyBwYXR0ZXJuOlxuICAgIC8vICNwcmFnbWEgdGFuZ3JhbTogW2tleV1cbiAgICAvLyBlLmcuICNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xuXG4gICAgLy8gVE9ETzogZmxhZyB0byBhdm9pZCByZS1yZXRyaWV2aW5nIHRyYW5zZm9ybSBVUkxzIG92ZXIgbmV0d29yayB3aGVuIHJlYnVpbGRpbmc/XG4gICAgLy8gVE9ETzogc3VwcG9ydCBnbHNsaWZ5ICNwcmFnbWEgZXhwb3J0IG5hbWVzIGZvciBiZXR0ZXIgY29tcGF0aWJpbGl0eT8gKGUuZy4gcmVuYW1lIG1haW4oKSBmdW5jdGlvbnMpXG4gICAgLy8gVE9ETzogYXV0by1pbnNlcnQgdW5pZm9ybXMgcmVmZXJlbmNlZCBpbiBtb2RlIGRlZmluaXRpb24sIGJ1dCBub3QgaW4gc2hhZGVyIGJhc2Ugb3IgdHJhbnNmb3Jtcz8gKHByb2JsZW06IGRvbid0IGhhdmUgYWNjZXNzIHRvIHVuaWZvcm0gbGlzdC90eXBlIGhlcmUpXG5cbiAgICAvLyBHYXRoZXIgYWxsIHRyYW5zZm9ybSBjb2RlIHNuaXBwZXRzIChjYW4gYmUgZWl0aGVyIGlubGluZSBpbiB0aGUgc3R5bGUgZmlsZSwgb3Igb3ZlciB0aGUgbmV0d29yayB2aWEgVVJMKVxuICAgIC8vIFRoaXMgaXMgYW4gYXN5bmMgcHJvY2Vzcywgc2luY2UgY29kZSBtYXkgYmUgcmV0cmlldmVkIHJlbW90ZWx5XG4gICAgdmFyIHJlZ2V4cDtcbiAgICB2YXIgbG9hZGVkX3RyYW5zZm9ybXMgPSB7fTsgLy8gbWFzdGVyIGxpc3Qgb2YgdHJhbnNmb3Jtcywgd2l0aCBhbiBvcmRlcmVkIGxpc3QgZm9yIGVhY2ggKHNpbmNlIHdlIHdhbnQgdG8gZ3VhcmFudGVlIG9yZGVyIG9mIHRyYW5zZm9ybXMpXG4gICAgaWYgKHRoaXMudHJhbnNmb3JtcyAhPSBudWxsKSB7XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMudHJhbnNmb3Jtcykge1xuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybSA9IHRoaXMudHJhbnNmb3Jtc1trZXldO1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVhY2ggY29kZSBwb2ludCBjYW4gYmUgYSBzaW5nbGUgaXRlbSAoc3RyaW5nIG9yIGhhc2ggb2JqZWN0KSBvciBhIGxpc3QgKGFycmF5IG9iamVjdCB3aXRoIG5vbi16ZXJvIGxlbmd0aClcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdHJhbnNmb3JtID09ICdzdHJpbmcnIHx8ICh0eXBlb2YgdHJhbnNmb3JtID09ICdvYmplY3QnICYmIHRyYW5zZm9ybS5sZW5ndGggPT0gbnVsbCkpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm0gPSBbdHJhbnNmb3JtXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmlyc3QgZmluZCBjb2RlIHJlcGxhY2UgcG9pbnRzIGluIHNoYWRlcnNcbiAgICAgICAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCdeXFxcXHMqI3ByYWdtYVxcXFxzK3RhbmdyYW06XFxcXHMrJyArIGtleSArICdcXFxccyokJywgJ20nKTtcbiAgICAgICAgICAgIHZhciBpbmplY3RfdmVydGV4ID0gdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyLm1hdGNoKHJlZ2V4cCk7XG4gICAgICAgICAgICB2YXIgaW5qZWN0X2ZyYWdtZW50ID0gdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIubWF0Y2gocmVnZXhwKTtcblxuICAgICAgICAgICAgLy8gQXZvaWQgbmV0d29yayByZXF1ZXN0IGlmIG5vdGhpbmcgdG8gcmVwbGFjZVxuICAgICAgICAgICAgaWYgKGluamVjdF92ZXJ0ZXggPT0gbnVsbCAmJiBpbmplY3RfZnJhZ21lbnQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDb2xsZWN0IGFsbCB0cmFuc2Zvcm1zIGZvciB0aGlzIHR5cGVcbiAgICAgICAgICAgIGxvYWRlZF90cmFuc2Zvcm1zW2tleV0gPSB7fTtcbiAgICAgICAgICAgIGxvYWRlZF90cmFuc2Zvcm1zW2tleV0ucmVnZXhwID0gbmV3IFJlZ0V4cChyZWdleHApOyAvLyBzYXZlIHJlZ2V4cCBzbyB3ZSBjYW4gaW5qZWN0IGxhdGVyIHdpdGhvdXQgaGF2aW5nIHRvIHJlY3JlYXRlIGl0XG4gICAgICAgICAgICBsb2FkZWRfdHJhbnNmb3Jtc1trZXldLmluamVjdF92ZXJ0ZXggPSAoaW5qZWN0X3ZlcnRleCAhPSBudWxsKTsgLy8gc2F2ZSByZWdleHAgY29kZSBwb2ludCBtYXRjaGVzIHNvIHdlIGRvbid0IGhhdmUgdG8gZG8gdGhlbSBhZ2FpblxuICAgICAgICAgICAgbG9hZGVkX3RyYW5zZm9ybXNba2V5XS5pbmplY3RfZnJhZ21lbnQgPSAoaW5qZWN0X2ZyYWdtZW50ICE9IG51bGwpO1xuICAgICAgICAgICAgbG9hZGVkX3RyYW5zZm9ybXNba2V5XS5saXN0ID0gW107XG5cbiAgICAgICAgICAgIC8vIEdldCB0aGUgY29kZSAocG9zc2libHkgb3ZlciB0aGUgbmV0d29yaywgc28gbmVlZHMgdG8gYmUgYXN5bmMpXG4gICAgICAgICAgICBmb3IgKHZhciB1PTA7IHUgPCB0cmFuc2Zvcm0ubGVuZ3RoOyB1KyspIHtcbiAgICAgICAgICAgICAgICBxdWV1ZS5kZWZlcihHTFByb2dyYW0ubG9hZFRyYW5zZm9ybSwgbG9hZGVkX3RyYW5zZm9ybXMsIHRyYW5zZm9ybVt1XSwga2V5LCB1KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGEgI2RlZmluZSBmb3IgdGhpcyBpbmplY3Rpb24gcG9pbnRcbiAgICAgICAgICAgIGRlZmluZXNbJ1RBTkdSQU1fVFJBTlNGT1JNXycgKyBrZXkucmVwbGFjZSgnICcsICdfJykudG9VcHBlckNhc2UoKV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2hlbiBhbGwgdHJhbnNmb3JtIGNvZGUgc25pcHBldHMgYXJlIGNvbGxlY3RlZCwgY29tYmluZSBhbmQgaW5qZWN0IHRoZW1cbiAgICBxdWV1ZS5hd2FpdChlcnJvciA9PiB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJlcnJvciBsb2FkaW5nIHRyYW5zZm9ybXM6IFwiICsgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRG8gdGhlIGNvZGUgaW5qZWN0aW9uIHdpdGggdGhlIGNvbGxlY3RlZCBzb3VyY2VzXG4gICAgICAgIGZvciAodmFyIHQgaW4gbG9hZGVkX3RyYW5zZm9ybXMpIHtcbiAgICAgICAgICAgIC8vIENvbmNhdGVuYXRlXG4gICAgICAgICAgICB2YXIgY29tYmluZWRfc291cmNlID0gXCJcIjtcbiAgICAgICAgICAgIGZvciAodmFyIHM9MDsgcyA8IGxvYWRlZF90cmFuc2Zvcm1zW3RdLmxpc3QubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgICAgICBjb21iaW5lZF9zb3VyY2UgKz0gbG9hZGVkX3RyYW5zZm9ybXNbdF0ubGlzdFtzXSArICdcXG4nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJbmplY3RcbiAgICAgICAgICAgIGlmIChsb2FkZWRfdHJhbnNmb3Jtc1t0XS5pbmplY3RfdmVydGV4ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIgPSB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIucmVwbGFjZShsb2FkZWRfdHJhbnNmb3Jtc1t0XS5yZWdleHAsIGNvbWJpbmVkX3NvdXJjZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobG9hZGVkX3RyYW5zZm9ybXNbdF0uaW5qZWN0X2ZyYWdtZW50ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlciA9IHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyLnJlcGxhY2UobG9hZGVkX3RyYW5zZm9ybXNbdF0ucmVnZXhwLCBjb21iaW5lZF9zb3VyY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xlYW4tdXAgYW55ICNwcmFnbWFzIHRoYXQgd2VyZW4ndCByZXBsYWNlZCAodG8gcHJldmVudCBjb21waWxlciB3YXJuaW5ncylcbiAgICAgICAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoJ15cXFxccyojcHJhZ21hXFxcXHMrdGFuZ3JhbTpcXFxccytcXFxcdytcXFxccyokJywgJ2dtJyk7XG4gICAgICAgIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciA9IHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlci5yZXBsYWNlKHJlZ2V4cCwgJycpO1xuICAgICAgICB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlciA9IHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyLnJlcGxhY2UocmVnZXhwLCAnJyk7XG5cbiAgICAgICAgLy8gQnVpbGQgJiBpbmplY3QgZGVmaW5lc1xuICAgICAgICAvLyBUaGlzIGlzIGRvbmUgKmFmdGVyKiBjb2RlIGluamVjdGlvbiBzbyB0aGF0IHdlIGNhbiBhZGQgZGVmaW5lcyBmb3Igd2hpY2ggY29kZSBwb2ludHMgd2VyZSBpbmplY3RlZFxuICAgICAgICB2YXIgZGVmaW5lX3N0ciA9IEdMUHJvZ3JhbS5idWlsZERlZmluZVN0cmluZyhkZWZpbmVzKTtcbiAgICAgICAgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyID0gZGVmaW5lX3N0ciArIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlcjtcbiAgICAgICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSBkZWZpbmVfc3RyICsgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXI7XG5cbiAgICAgICAgLy8gSW5jbHVkZSBwcm9ncmFtIGluZm8gdXNlZnVsIGZvciBkZWJ1Z2dpbmdcbiAgICAgICAgdmFyIGluZm8gPSAodGhpcy5uYW1lID8gKHRoaXMubmFtZSArICcgLyBpZCAnICsgdGhpcy5pZCkgOiAoJ2lkICcgKyB0aGlzLmlkKSk7XG4gICAgICAgIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciA9ICcvLyBQcm9ncmFtOiAnICsgaW5mbyArICdcXG4nICsgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyO1xuICAgICAgICB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlciA9ICcvLyBQcm9ncmFtOiAnICsgaW5mbyArICdcXG4nICsgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXI7XG5cbiAgICAgICAgLy8gQ29tcGlsZSAmIHNldCB1bmlmb3JtcyB0byBjYWNoZWQgdmFsdWVzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnByb2dyYW0gPSBHTC51cGRhdGVQcm9ncmFtKHRoaXMuZ2wsIHRoaXMucHJvZ3JhbSwgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyLCB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlcik7XG4gICAgICAgICAgICAvLyB0aGlzLnByb2dyYW0gPSBHTC51cGRhdGVQcm9ncmFtKHRoaXMuZ2wsIG51bGwsIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciwgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIpO1xuICAgICAgICAgICAgdGhpcy5jb21waWxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMucHJvZ3JhbSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmNvbXBpbGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVzZSgpO1xuICAgICAgICB0aGlzLnJlZnJlc2hVbmlmb3JtcygpO1xuICAgICAgICB0aGlzLnJlZnJlc2hBdHRyaWJ1dGVzKCk7XG5cbiAgICAgICAgLy8gTm90aWZ5IGNhbGxlclxuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8vIFJldHJpZXZlIGEgc2luZ2xlIHRyYW5zZm9ybSwgZm9yIGEgZ2l2ZW4gaW5qZWN0aW9uIHBvaW50LCBhdCBhIGNlcnRhaW4gaW5kZXggKHRvIHByZXNlcnZlIG9yaWdpbmFsIG9yZGVyKVxuLy8gQ2FuIGJlIGFzeW5jLCBjYWxscyAnY29tcGxldGUnIGNhbGxiYWNrIHdoZW4gZG9uZVxuR0xQcm9ncmFtLmxvYWRUcmFuc2Zvcm0gPSBmdW5jdGlvbiAodHJhbnNmb3JtcywgYmxvY2ssIGtleSwgaW5kZXgsIGNvbXBsZXRlKSB7XG4gICAgLy8gQ2FuIGJlIGFuIGlubGluZSBibG9jayBvZiBHTFNMLCBvciBhIFVSTCB0byByZXRyaWV2ZSBHTFNMIGJsb2NrIGZyb21cbiAgICB2YXIgdHlwZSwgdmFsdWUsIHNvdXJjZTtcblxuICAgIC8vIElubGluZSBjb2RlXG4gICAgaWYgKHR5cGVvZiBibG9jayA9PSAnc3RyaW5nJykge1xuICAgICAgICB0cmFuc2Zvcm1zW2tleV0ubGlzdFtpbmRleF0gPSBibG9jaztcbiAgICAgICAgY29tcGxldGUoKTtcbiAgICB9XG4gICAgLy8gUmVtb3RlIGNvZGVcbiAgICBlbHNlIGlmICh0eXBlb2YgYmxvY2sgPT0gJ29iamVjdCcgJiYgYmxvY2sudXJsKSB7XG4gICAgICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc291cmNlID0gcmVxLnJlc3BvbnNlO1xuICAgICAgICAgICAgdHJhbnNmb3Jtc1trZXldLmxpc3RbaW5kZXhdID0gc291cmNlO1xuICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxLm9wZW4oJ0dFVCcsIFV0aWxzLnVybEZvclBhdGgoYmxvY2sudXJsKSArICc/JyArICgrbmV3IERhdGUoKSksIHRydWUgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgICAgIHJlcS5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgICAgIHJlcS5zZW5kKCk7XG4gICAgfVxufTtcblxuLy8gTWFrZSBsaXN0IG9mIGRlZmluZXMgKGdsb2JhbCwgdGhlbiBwcm9ncmFtLXNwZWNpZmljKVxuR0xQcm9ncmFtLnByb3RvdHlwZS5idWlsZERlZmluZUxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRlZmluZXMgPSB7fTtcbiAgICBmb3IgKHZhciBkIGluIEdMUHJvZ3JhbS5kZWZpbmVzKSB7XG4gICAgICAgIGRlZmluZXNbZF0gPSBHTFByb2dyYW0uZGVmaW5lc1tkXTtcbiAgICB9XG4gICAgZm9yICh2YXIgZCBpbiB0aGlzLmRlZmluZXMpIHtcbiAgICAgICAgZGVmaW5lc1tkXSA9IHRoaXMuZGVmaW5lc1tkXTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmluZXM7XG59O1xuXG4vLyBUdXJuICNkZWZpbmVzIGludG8gYSBjb21iaW5lZCBzdHJpbmdcbkdMUHJvZ3JhbS5idWlsZERlZmluZVN0cmluZyA9IGZ1bmN0aW9uIChkZWZpbmVzKSB7XG4gICAgdmFyIGRlZmluZV9zdHIgPSBcIlwiO1xuICAgIGZvciAodmFyIGQgaW4gZGVmaW5lcykge1xuICAgICAgICBpZiAoZGVmaW5lc1tkXSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZXNbZF0gPT0gJ2Jvb2xlYW4nICYmIGRlZmluZXNbZF0gPT0gdHJ1ZSkgeyAvLyBib29sZWFucyBhcmUgc2ltcGxlIGRlZmluZXMgd2l0aCBubyB2YWx1ZVxuICAgICAgICAgICAgZGVmaW5lX3N0ciArPSBcIiNkZWZpbmUgXCIgKyBkICsgXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lc1tkXSA9PSAnbnVtYmVyJyAmJiBNYXRoLmZsb29yKGRlZmluZXNbZF0pID09IGRlZmluZXNbZF0pIHsgLy8gaW50IHRvIGZsb2F0IGNvbnZlcnNpb24gdG8gc2F0aXNmeSBHTFNMIGZsb2F0c1xuICAgICAgICAgICAgZGVmaW5lX3N0ciArPSBcIiNkZWZpbmUgXCIgKyBkICsgXCIgXCIgKyBkZWZpbmVzW2RdLnRvRml4ZWQoMSkgKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvLyBhbnkgb3RoZXIgZmxvYXQgb3Igc3RyaW5nIHZhbHVlXG4gICAgICAgICAgICBkZWZpbmVfc3RyICs9IFwiI2RlZmluZSBcIiArIGQgKyBcIiBcIiArIGRlZmluZXNbZF0gKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZWZpbmVfc3RyO1xufTtcblxuLy8gU2V0IHVuaWZvcm1zIGZyb20gYSBKUyBvYmplY3QsIHdpdGggaW5mZXJyZWQgdHlwZXNcbkdMUHJvZ3JhbS5wcm90b3R5cGUuc2V0VW5pZm9ybXMgPSBmdW5jdGlvbiAodW5pZm9ybXMpXG57XG4gICAgLy8gVE9ETzogb25seSB1cGRhdGUgdW5pZm9ybXMgd2hlbiBjaGFuZ2VkXG4gICAgdmFyIHRleHR1cmVfdW5pdCA9IDA7XG5cbiAgICBmb3IgKHZhciB1IGluIHVuaWZvcm1zKSB7XG4gICAgICAgIHZhciB1bmlmb3JtID0gdW5pZm9ybXNbdV07XG5cbiAgICAgICAgLy8gU2luZ2xlIGZsb2F0XG4gICAgICAgIGlmICh0eXBlb2YgdW5pZm9ybSA9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhpcy51bmlmb3JtKCcxZicsIHUsIHVuaWZvcm0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIE11bHRpcGxlIGZsb2F0cyAtIHZlY3RvciBvciBhcnJheVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdW5pZm9ybSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgLy8gZmxvYXQgdmVjdG9ycyAodmVjMiwgdmVjMywgdmVjNClcbiAgICAgICAgICAgIGlmICh1bmlmb3JtLmxlbmd0aCA+PSAyICYmIHVuaWZvcm0ubGVuZ3RoIDw9IDQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVuaWZvcm0odW5pZm9ybS5sZW5ndGggKyAnZnYnLCB1LCB1bmlmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGZsb2F0IGFycmF5XG4gICAgICAgICAgICBlbHNlIGlmICh1bmlmb3JtLmxlbmd0aCA+IDQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVuaWZvcm0oJzFmdicsIHUgKyAnWzBdJywgdW5pZm9ybSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUT0RPOiBhc3N1bWUgbWF0cml4IGZvciAodHlwZW9mID09IEZsb2F0MzJBcnJheSAmJiBsZW5ndGggPT0gMTYpP1xuICAgICAgICB9XG4gICAgICAgIC8vIEJvb2xlYW5cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHVuaWZvcm0gPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm0oJzFpJywgdSwgdW5pZm9ybSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGV4dHVyZVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdW5pZm9ybSA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdmFyIHRleHR1cmUgPSBHTFRleHR1cmUudGV4dHVyZXNbdW5pZm9ybV07XG4gICAgICAgICAgICBpZiAodGV4dHVyZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGV4dHVyZSA9IG5ldyBHTFRleHR1cmUodGhpcy5nbCwgdW5pZm9ybSk7XG4gICAgICAgICAgICAgICAgdGV4dHVyZS5sb2FkKHVuaWZvcm0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0ZXh0dXJlLmJpbmQodGV4dHVyZV91bml0KTtcbiAgICAgICAgICAgIHRoaXMudW5pZm9ybSgnMWknLCB1LCB0ZXh0dXJlX3VuaXQpO1xuICAgICAgICAgICAgdGV4dHVyZV91bml0Kys7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogc3VwcG9ydCBvdGhlciBub24tZmxvYXQgdHlwZXM/IChpbnQsIGV0Yy4pXG4gICAgfVxufTtcblxuLy8gZXg6IHByb2dyYW0udW5pZm9ybSgnM2YnLCAncG9zaXRpb24nLCB4LCB5LCB6KTtcbi8vIFRPRE86IG9ubHkgdXBkYXRlIHVuaWZvcm1zIHdoZW4gY2hhbmdlZFxuR0xQcm9ncmFtLnByb3RvdHlwZS51bmlmb3JtID0gZnVuY3Rpb24gKG1ldGhvZCwgbmFtZSkgLy8gbWV0aG9kLWFwcHJvcHJpYXRlIGFyZ3VtZW50cyBmb2xsb3dcbntcbiAgICBpZiAoIXRoaXMuY29tcGlsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB1bmlmb3JtID0gKHRoaXMudW5pZm9ybXNbbmFtZV0gPSB0aGlzLnVuaWZvcm1zW25hbWVdIHx8IHt9KTtcbiAgICB1bmlmb3JtLm5hbWUgPSBuYW1lO1xuICAgIHVuaWZvcm0ubG9jYXRpb24gPSB1bmlmb3JtLmxvY2F0aW9uIHx8IHRoaXMuZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgbmFtZSk7XG4gICAgdW5pZm9ybS5tZXRob2QgPSAndW5pZm9ybScgKyBtZXRob2Q7XG4gICAgdW5pZm9ybS52YWx1ZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHRoaXMudXBkYXRlVW5pZm9ybShuYW1lKTtcbn07XG5cbi8vIFNldCBhIHNpbmdsZSB1bmlmb3JtXG5HTFByb2dyYW0ucHJvdG90eXBlLnVwZGF0ZVVuaWZvcm0gPSBmdW5jdGlvbiAobmFtZSlcbntcbiAgICBpZiAoIXRoaXMuY29tcGlsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB1bmlmb3JtID0gdGhpcy51bmlmb3Jtc1tuYW1lXTtcbiAgICBpZiAodW5pZm9ybSA9PSBudWxsIHx8IHVuaWZvcm0ubG9jYXRpb24gPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy51c2UoKTtcbiAgICB0aGlzLmdsW3VuaWZvcm0ubWV0aG9kXS5hcHBseSh0aGlzLmdsLCBbdW5pZm9ybS5sb2NhdGlvbl0uY29uY2F0KHVuaWZvcm0udmFsdWVzKSk7IC8vIGNhbGwgYXBwcm9wcmlhdGUgR0wgdW5pZm9ybSBtZXRob2QgYW5kIHBhc3MgdGhyb3VnaCBhcmd1bWVudHNcbn07XG5cbi8vIFJlZnJlc2ggdW5pZm9ybSBsb2NhdGlvbnMgYW5kIHNldCB0byBsYXN0IGNhY2hlZCB2YWx1ZXNcbkdMUHJvZ3JhbS5wcm90b3R5cGUucmVmcmVzaFVuaWZvcm1zID0gZnVuY3Rpb24gKClcbntcbiAgICBpZiAoIXRoaXMuY29tcGlsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAodmFyIHUgaW4gdGhpcy51bmlmb3Jtcykge1xuICAgICAgICB0aGlzLnVuaWZvcm1zW3VdLmxvY2F0aW9uID0gdGhpcy5nbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5wcm9ncmFtLCB1KTtcbiAgICAgICAgdGhpcy51cGRhdGVVbmlmb3JtKHUpO1xuICAgIH1cbn07XG5cbkdMUHJvZ3JhbS5wcm90b3R5cGUucmVmcmVzaEF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIHZhciBsZW4gPSB0aGlzLmdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5wcm9ncmFtLCB0aGlzLmdsLkFDVElWRV9BVFRSSUJVVEVTKTtcbiAgICAvLyBmb3IgKHZhciBpPTA7IGkgPCBsZW47IGkrKykge1xuICAgIC8vICAgICB2YXIgYSA9IHRoaXMuZ2wuZ2V0QWN0aXZlQXR0cmliKHRoaXMucHJvZ3JhbSwgaSk7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKGEpO1xuICAgIC8vIH1cbiAgICB0aGlzLmF0dHJpYnMgPSB7fTtcbn07XG5cbi8vIEdldCB0aGUgbG9jYXRpb24gb2YgYSB2ZXJ0ZXggYXR0cmlidXRlXG5HTFByb2dyYW0ucHJvdG90eXBlLmF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChuYW1lKVxue1xuICAgIGlmICghdGhpcy5jb21waWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGF0dHJpYiA9ICh0aGlzLmF0dHJpYnNbbmFtZV0gPSB0aGlzLmF0dHJpYnNbbmFtZV0gfHwge30pO1xuICAgIGlmIChhdHRyaWIubG9jYXRpb24gIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gYXR0cmliO1xuICAgIH1cblxuICAgIGF0dHJpYi5uYW1lID0gbmFtZTtcbiAgICBhdHRyaWIubG9jYXRpb24gPSB0aGlzLmdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgbmFtZSk7XG5cbiAgICAvLyB2YXIgaW5mbyA9IHRoaXMuZ2wuZ2V0QWN0aXZlQXR0cmliKHRoaXMucHJvZ3JhbSwgYXR0cmliLmxvY2F0aW9uKTtcbiAgICAvLyBhdHRyaWIudHlwZSA9IGluZm8udHlwZTtcbiAgICAvLyBhdHRyaWIuc2l6ZSA9IGluZm8uc2l6ZTtcblxuICAgIHJldHVybiBhdHRyaWI7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdMUHJvZ3JhbTtcbn1cbiIsIi8vIEdlbmVyYXRlZCBmcm9tIEdMU0wgZmlsZXMsIGRvbid0IGVkaXQhXG52YXIgc2hhZGVyX3NvdXJjZXMgPSB7fTtcblxuc2hhZGVyX3NvdXJjZXNbJ3BvaW50X2ZyYWdtZW50J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3Jlc29sdXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMiB2X3RleGNvb3JkO1xcblwiICtcblwidm9pZCBtYWluKHZvaWQpIHtcXG5cIiArXG5cIiAgdmVjMyBjb2xvciA9IHZfY29sb3I7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRpbmcgPSB2ZWMzKDEuKTtcXG5cIiArXG5cIiAgZmxvYXQgbGVuID0gbGVuZ3RoKHZfdGV4Y29vcmQpO1xcblwiICtcblwiICBpZihsZW4gPiAxLikge1xcblwiICtcblwiICAgIGRpc2NhcmQ7XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgY29sb3IgKj0gKDEuIC0gc21vb3Roc3RlcCguMjUsIDEuLCBsZW4pKSArIDAuNTtcXG5cIiArXG5cIiAgI3ByYWdtYSB0YW5ncmFtOiBmcmFnbWVudFxcblwiICtcblwiICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yLCAxLik7XFxuXCIgK1xuXCJ9XFxuXCIgK1wiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydwb2ludF92ZXJ0ZXgnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfdGlsZV92aWV3O1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfbWV0ZXJfdmlldztcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9udW1fbGF5ZXJzO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9wb3NpdGlvbjtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMyIGFfdGV4Y29vcmQ7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX2NvbG9yO1xcblwiICtcblwiYXR0cmlidXRlIGZsb2F0IGFfbGF5ZXI7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMiB2X3RleGNvb3JkO1xcblwiICtcblwiI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCJcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWM0IGFfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwidmFyeWluZyB2ZWM0IHZfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cImZsb2F0IGFfeF9jYWxjdWxhdGVaKGZsb2F0IHosIGZsb2F0IGxheWVyLCBjb25zdCBmbG9hdCBudW1fbGF5ZXJzLCBjb25zdCBmbG9hdCB6X2xheWVyX3NjYWxlKSB7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXJfcmFuZ2UgPSAobnVtX2xheWVycyArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXIgPSAobGF5ZXIgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICB6ID0gel9sYXllciArIGNsYW1wKHosIDAuLCB6X2xheWVyX3NjYWxlKTtcXG5cIiArXG5cIiAgeiA9ICh6X2xheWVyX3JhbmdlIC0geikgLyB6X2xheWVyX3JhbmdlO1xcblwiICtcblwiICByZXR1cm4gejtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4oKSB7XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIiAgaWYoYV9zZWxlY3Rpb25fY29sb3IueHl6ID09IHZlYzMoMC4pKSB7XFxuXCIgK1xuXCIgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KDAuKTtcXG5cIiArXG5cIiAgICByZXR1cm47XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgdl9zZWxlY3Rpb25fY29sb3IgPSBhX3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHZlYzQgcG9zaXRpb24gPSB1X21ldGVyX3ZpZXcgKiB1X3RpbGVfdmlldyAqIHZlYzQoYV9wb3NpdGlvbiwgMS4pO1xcblwiICtcblwiICAjcHJhZ21hIHRhbmdyYW06IHZlcnRleFxcblwiICtcblwiICB2X2NvbG9yID0gYV9jb2xvcjtcXG5cIiArXG5cIiAgdl90ZXhjb29yZCA9IGFfdGV4Y29vcmQ7XFxuXCIgK1xuXCIgIHBvc2l0aW9uLnogPSBhX3hfY2FsY3VsYXRlWihwb3NpdGlvbi56LCBhX2xheWVyLCB1X251bV9sYXllcnMsIDI1Ni4pO1xcblwiICtcblwiICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcIlwiO1xuXG5zaGFkZXJfc291cmNlc1sncG9seWdvbl9mcmFnbWVudCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9yZXNvbHV0aW9uO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfYXNwZWN0O1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfbWV0ZXJfdmlldztcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9tZXRlcnNfcGVyX3BpeGVsO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X3RpbWU7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWFwX3pvb207XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9tYXBfY2VudGVyO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfdGlsZV9vcmlnaW47XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfdGVzdDtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV90ZXN0MjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwidmFyeWluZyB2ZWM0IHZfd29ybGRfcG9zaXRpb247XFxuXCIgK1xuXCIjaWYgZGVmaW5lZChXT1JMRF9QT1NJVElPTl9XUkFQKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2ZWMyIHdvcmxkX3Bvc2l0aW9uX2FuY2hvciA9IHZlYzIoZmxvb3IodV90aWxlX29yaWdpbiAvIFdPUkxEX1BPU0lUSU9OX1dSQVApICogV09STERfUE9TSVRJT05fV1JBUCk7XFxuXCIgK1xuXCJ2ZWM0IGFic29sdXRlV29ybGRQb3NpdGlvbigpIHtcXG5cIiArXG5cIiAgcmV0dXJuIHZlYzQodl93b3JsZF9wb3NpdGlvbi54eSArIHdvcmxkX3Bvc2l0aW9uX2FuY2hvciwgdl93b3JsZF9wb3NpdGlvbi56LCB2X3dvcmxkX3Bvc2l0aW9uLncpO1xcblwiICtcblwifVxcblwiICtcblwiI2Vsc2VcXG5cIiArXG5cIlxcblwiICtcblwidmVjNCBhYnNvbHV0ZVdvcmxkUG9zaXRpb24oKSB7XFxuXCIgK1xuXCIgIHJldHVybiB2X3dvcmxkX3Bvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cIiNpZiBkZWZpbmVkKExJR0hUSU5HX0VOVklST05NRU5UKVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIHNhbXBsZXIyRCB1X2Vudl9tYXA7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWM0IHZfcG9zaXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9ub3JtYWw7XFxuXCIgK1xuXCIjZWxzZVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9saWdodGluZztcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCJjb25zdCBmbG9hdCBsaWdodF9hbWJpZW50ID0gMC41O1xcblwiICtcblwidmVjMyBiX3hfcG9pbnRMaWdodCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIGZsb2F0IGxpZ2h0X2FtYmllbnQsIGNvbnN0IGJvb2wgYmFja2xpZ2h0KSB7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIGxpZ2h0X3Bvcy54eXopO1xcblwiICtcblwiICBjb2xvciAqPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGNfeF9zcGVjdWxhckxpZ2h0KHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgZmxvYXQgbGlnaHRfYW1iaWVudCwgY29uc3QgYm9vbCBiYWNrbGlnaHQpIHtcXG5cIiArXG5cIiAgdmVjMyBsaWdodF9kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gbGlnaHRfcG9zLnh5eik7XFxuXCIgK1xuXCIgIHZlYzMgdmlld19wb3MgPSB2ZWMzKDAuLCAwLiwgNTAwLik7XFxuXCIgK1xuXCIgIHZlYzMgdmlld19kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gdmlld19wb3MueHl6KTtcXG5cIiArXG5cIiAgdmVjMyBzcGVjdWxhclJlZmxlY3Rpb247XFxuXCIgK1xuXCIgIGlmKGRvdChub3JtYWwsIC1saWdodF9kaXIpIDwgMC4wKSB7XFxuXCIgK1xuXCIgICAgc3BlY3VsYXJSZWZsZWN0aW9uID0gdmVjMygwLjAsIDAuMCwgMC4wKTtcXG5cIiArXG5cIiAgfSBlbHNlIHtcXG5cIiArXG5cIiAgICBmbG9hdCBhdHRlbnVhdGlvbiA9IDEuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBsaWdodFNwZWN1bGFyVGVybSA9IDEuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBtYXRlcmlhbFNwZWN1bGFyVGVybSA9IDEwLjA7XFxuXCIgK1xuXCIgICAgZmxvYXQgbWF0ZXJpYWxTaGluaW5lc3NUZXJtID0gMTAuMDtcXG5cIiArXG5cIiAgICBzcGVjdWxhclJlZmxlY3Rpb24gPSBhdHRlbnVhdGlvbiAqIHZlYzMobGlnaHRTcGVjdWxhclRlcm0pICogdmVjMyhtYXRlcmlhbFNwZWN1bGFyVGVybSkgKiBwb3cobWF4KDAuMCwgZG90KHJlZmxlY3QoLWxpZ2h0X2Rpciwgbm9ybWFsKSwgdmlld19kaXIpKSwgbWF0ZXJpYWxTaGluaW5lc3NUZXJtKTtcXG5cIiArXG5cIiAgfVxcblwiICtcblwiICBmbG9hdCBkaWZmdXNlID0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpO1xcblwiICtcblwiICBjb2xvciAqPSBkaWZmdXNlICsgc3BlY3VsYXJSZWZsZWN0aW9uICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBkX3hfZGlyZWN0aW9uYWxMaWdodCh2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjMyBsaWdodF9kaXIsIGZsb2F0IGxpZ2h0X2FtYmllbnQpIHtcXG5cIiArXG5cIiAgbGlnaHRfZGlyID0gbm9ybWFsaXplKGxpZ2h0X2Rpcik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBhX3hfbGlnaHRpbmcodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCB2ZWM0IG5pZ2h0X2xpZ2h0X3BvcywgdmVjMyBsaWdodF9kaXIsIGZsb2F0IGxpZ2h0X2FtYmllbnQpIHtcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKExJR0hUSU5HX1BPSU5UKVxcblwiICtcblwiICBjb2xvciA9IGJfeF9wb2ludExpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBsaWdodF9wb3MsIGxpZ2h0X2FtYmllbnQsIHRydWUpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKExJR0hUSU5HX1BPSU5UX1NQRUNVTEFSKVxcblwiICtcblwiICBjb2xvciA9IGNfeF9zcGVjdWxhckxpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBsaWdodF9wb3MsIGxpZ2h0X2FtYmllbnQsIHRydWUpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKExJR0hUSU5HX05JR0hUKVxcblwiICtcblwiICBjb2xvciA9IGJfeF9wb2ludExpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBuaWdodF9saWdodF9wb3MsIDAuLCBmYWxzZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfRElSRUNUSU9OKVxcblwiICtcblwiICBjb2xvciA9IGRfeF9kaXJlY3Rpb25hbExpZ2h0KG5vcm1hbCwgY29sb3IsIGxpZ2h0X2RpciwgbGlnaHRfYW1iaWVudCk7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIGNvbG9yID0gY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWM0IGVfeF9zcGhlcmljYWxFbnZpcm9ubWVudE1hcCh2ZWMzIHZpZXdfcG9zLCB2ZWMzIHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgc2FtcGxlcjJEIGVudm1hcCkge1xcblwiICtcblwiICB2ZWMzIGV5ZSA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSB2aWV3X3Bvcy54eXopO1xcblwiICtcblwiICBpZihleWUueiA+IDAuMDEpIHtcXG5cIiArXG5cIiAgICBleWUueiA9IDAuMDE7XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgdmVjMyByID0gcmVmbGVjdChleWUsIG5vcm1hbCk7XFxuXCIgK1xuXCIgIGZsb2F0IG0gPSAyLiAqIHNxcnQocG93KHIueCwgMi4pICsgcG93KHIueSwgMi4pICsgcG93KHIueiArIDEuLCAyLikpO1xcblwiICtcblwiICB2ZWMyIHV2ID0gci54eSAvIG0gKyAuNTtcXG5cIiArXG5cIiAgcmV0dXJuIHRleHR1cmUyRChlbnZtYXAsIHV2KTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4odm9pZCkge1xcblwiICtcblwiICB2ZWMzIGNvbG9yID0gdl9jb2xvcjtcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoTElHSFRJTkdfRU5WSVJPTk1FTlQpXFxuXCIgK1xuXCIgIHZlYzMgdmlld19wb3MgPSB2ZWMzKDAuLCAwLiwgMTAwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCk7XFxuXCIgK1xuXCIgIGNvbG9yID0gZV94X3NwaGVyaWNhbEVudmlyb25tZW50TWFwKHZpZXdfcG9zLCB2X3Bvc2l0aW9uLnh5eiwgdl9ub3JtYWwsIHVfZW52X21hcCkucmdiO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpIC8vIGRlZmF1bHQgdG8gcGVyLXBpeGVsIGxpZ2h0aW5nXFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRpbmcgPSBhX3hfbGlnaHRpbmcodl9wb3NpdGlvbiwgdl9ub3JtYWwsIHZlYzMoMS4pLCB2ZWM0KDAuLCAwLiwgMTUwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCwgMS4pLCB2ZWM0KDAuLCAwLiwgNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLiksIHZlYzMoMC4yLCAwLjcsIC0wLjUpLCBsaWdodF9hbWJpZW50KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgdmVjMyBsaWdodGluZyA9IHZfbGlnaHRpbmc7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICB2ZWMzIGNvbG9yX3ByZWxpZ2h0ID0gY29sb3I7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGxpZ2h0aW5nO1xcblwiICtcblwiICAjcHJhZ21hIHRhbmdyYW06IGZyYWdtZW50XFxuXCIgK1xuXCIgIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IsIDEuMCk7XFxuXCIgK1xuXCJ9XFxuXCIgK1wiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydwb2x5Z29uX3ZlcnRleCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9yZXNvbHV0aW9uO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfYXNwZWN0O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X3RpbWU7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWFwX3pvb207XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9tYXBfY2VudGVyO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfdGlsZV9vcmlnaW47XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV90aWxlX3dvcmxkO1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfdGlsZV92aWV3O1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfbWV0ZXJfdmlldztcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9tZXRlcnNfcGVyX3BpeGVsO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X251bV9sYXllcnM7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX3Bvc2l0aW9uO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9ub3JtYWw7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX2NvbG9yO1xcblwiICtcblwiYXR0cmlidXRlIGZsb2F0IGFfbGF5ZXI7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl93b3JsZF9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwiI2lmIGRlZmluZWQoV09STERfUE9TSVRJT05fV1JBUClcXG5cIiArXG5cIlxcblwiICtcblwidmVjMiB3b3JsZF9wb3NpdGlvbl9hbmNob3IgPSB2ZWMyKGZsb29yKHVfdGlsZV9vcmlnaW4gLyBXT1JMRF9QT1NJVElPTl9XUkFQKSAqIFdPUkxEX1BPU0lUSU9OX1dSQVApO1xcblwiICtcblwidmVjNCBhYnNvbHV0ZVdvcmxkUG9zaXRpb24oKSB7XFxuXCIgK1xuXCIgIHJldHVybiB2ZWM0KHZfd29ybGRfcG9zaXRpb24ueHkgKyB3b3JsZF9wb3NpdGlvbl9hbmNob3IsIHZfd29ybGRfcG9zaXRpb24ueiwgdl93b3JsZF9wb3NpdGlvbi53KTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNlbHNlXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzQgYWJzb2x1dGVXb3JsZFBvc2l0aW9uKCkge1xcblwiICtcblwiICByZXR1cm4gdl93b3JsZF9wb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIlxcblwiICtcblwiYXR0cmlidXRlIHZlYzQgYV9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWM0IHZfcG9zaXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9ub3JtYWw7XFxuXCIgK1xuXCIjZWxzZVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9saWdodGluZztcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCJjb25zdCBmbG9hdCBsaWdodF9hbWJpZW50ID0gMC41O1xcblwiICtcblwidmVjNCBhX3hfcGVyc3BlY3RpdmUodmVjNCBwb3NpdGlvbiwgY29uc3QgdmVjMiBwZXJzcGVjdGl2ZV9vZmZzZXQsIGNvbnN0IHZlYzIgcGVyc3BlY3RpdmVfZmFjdG9yKSB7XFxuXCIgK1xuXCIgIHBvc2l0aW9uLnh5ICs9IHBvc2l0aW9uLnogKiBwZXJzcGVjdGl2ZV9mYWN0b3IgKiAocG9zaXRpb24ueHkgLSBwZXJzcGVjdGl2ZV9vZmZzZXQpO1xcblwiICtcblwiICByZXR1cm4gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWM0IGJfeF9pc29tZXRyaWModmVjNCBwb3NpdGlvbiwgY29uc3QgdmVjMiBheGlzLCBjb25zdCBmbG9hdCBtdWx0aXBsaWVyKSB7XFxuXCIgK1xuXCIgIHBvc2l0aW9uLnh5ICs9IHBvc2l0aW9uLnogKiBheGlzICogbXVsdGlwbGllciAvIHVfYXNwZWN0O1xcblwiICtcblwiICByZXR1cm4gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJmbG9hdCBjX3hfY2FsY3VsYXRlWihmbG9hdCB6LCBmbG9hdCBsYXllciwgY29uc3QgZmxvYXQgbnVtX2xheWVycywgY29uc3QgZmxvYXQgel9sYXllcl9zY2FsZSkge1xcblwiICtcblwiICBmbG9hdCB6X2xheWVyX3JhbmdlID0gKG51bV9sYXllcnMgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICBmbG9hdCB6X2xheWVyID0gKGxheWVyICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgeiA9IHpfbGF5ZXIgKyBjbGFtcCh6LCAwLiwgel9sYXllcl9zY2FsZSk7XFxuXCIgK1xuXCIgIHogPSAoel9sYXllcl9yYW5nZSAtIHopIC8gel9sYXllcl9yYW5nZTtcXG5cIiArXG5cIiAgcmV0dXJuIHo7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGVfeF9wb2ludExpZ2h0KHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgZmxvYXQgbGlnaHRfYW1iaWVudCwgY29uc3QgYm9vbCBiYWNrbGlnaHQpIHtcXG5cIiArXG5cIiAgdmVjMyBsaWdodF9kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gbGlnaHRfcG9zLnh5eik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGFicyhtYXgoZmxvYXQoYmFja2xpZ2h0KSAqIC0xLiwgZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkpKSArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZl94X3NwZWN1bGFyTGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgdmVjMyB2aWV3X3BvcyA9IHZlYzMoMC4sIDAuLCA1MDAuKTtcXG5cIiArXG5cIiAgdmVjMyB2aWV3X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSB2aWV3X3Bvcy54eXopO1xcblwiICtcblwiICB2ZWMzIHNwZWN1bGFyUmVmbGVjdGlvbjtcXG5cIiArXG5cIiAgaWYoZG90KG5vcm1hbCwgLWxpZ2h0X2RpcikgPCAwLjApIHtcXG5cIiArXG5cIiAgICBzcGVjdWxhclJlZmxlY3Rpb24gPSB2ZWMzKDAuMCwgMC4wLCAwLjApO1xcblwiICtcblwiICB9IGVsc2Uge1xcblwiICtcblwiICAgIGZsb2F0IGF0dGVudWF0aW9uID0gMS4wO1xcblwiICtcblwiICAgIGZsb2F0IGxpZ2h0U3BlY3VsYXJUZXJtID0gMS4wO1xcblwiICtcblwiICAgIGZsb2F0IG1hdGVyaWFsU3BlY3VsYXJUZXJtID0gMTAuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBtYXRlcmlhbFNoaW5pbmVzc1Rlcm0gPSAxMC4wO1xcblwiICtcblwiICAgIHNwZWN1bGFyUmVmbGVjdGlvbiA9IGF0dGVudWF0aW9uICogdmVjMyhsaWdodFNwZWN1bGFyVGVybSkgKiB2ZWMzKG1hdGVyaWFsU3BlY3VsYXJUZXJtKSAqIHBvdyhtYXgoMC4wLCBkb3QocmVmbGVjdCgtbGlnaHRfZGlyLCBub3JtYWwpLCB2aWV3X2RpcikpLCBtYXRlcmlhbFNoaW5pbmVzc1Rlcm0pO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIGZsb2F0IGRpZmZ1c2UgPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSk7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGRpZmZ1c2UgKyBzcGVjdWxhclJlZmxlY3Rpb24gKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGdfeF9kaXJlY3Rpb25hbExpZ2h0KHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBsaWdodF9kaXIgPSBub3JtYWxpemUobGlnaHRfZGlyKTtcXG5cIiArXG5cIiAgY29sb3IgKj0gZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGRfeF9saWdodGluZyh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIHZlYzQgbmlnaHRfbGlnaHRfcG9zLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoTElHSFRJTkdfUE9JTlQpXFxuXCIgK1xuXCIgIGNvbG9yID0gZV94X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgdHJ1ZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfUE9JTlRfU1BFQ1VMQVIpXFxuXCIgK1xuXCIgIGNvbG9yID0gZl94X3NwZWN1bGFyTGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgdHJ1ZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfTklHSFQpXFxuXCIgK1xuXCIgIGNvbG9yID0gZV94X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIG5pZ2h0X2xpZ2h0X3BvcywgMC4sIGZhbHNlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19ESVJFQ1RJT04pXFxuXCIgK1xuXCIgIGNvbG9yID0gZ194X2RpcmVjdGlvbmFsTGlnaHQobm9ybWFsLCBjb2xvciwgbGlnaHRfZGlyLCBsaWdodF9hbWJpZW50KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgY29sb3IgPSBjb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4oKSB7XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIiAgaWYoYV9zZWxlY3Rpb25fY29sb3IueHl6ID09IHZlYzMoMC4pKSB7XFxuXCIgK1xuXCIgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KDAuKTtcXG5cIiArXG5cIiAgICByZXR1cm47XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgdl9zZWxlY3Rpb25fY29sb3IgPSBhX3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHZlYzQgcG9zaXRpb24gPSB1X3RpbGVfdmlldyAqIHZlYzQoYV9wb3NpdGlvbiwgMS4pO1xcblwiICtcblwiICB2X3dvcmxkX3Bvc2l0aW9uID0gdV90aWxlX3dvcmxkICogdmVjNChhX3Bvc2l0aW9uLCAxLik7XFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKFdPUkxEX1BPU0lUSU9OX1dSQVApXFxuXCIgK1xuXCIgIHZfd29ybGRfcG9zaXRpb24ueHkgLT0gd29ybGRfcG9zaXRpb25fYW5jaG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogdmVydGV4XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCIgIHZfY29sb3IgPSBhX2NvbG9yO1xcblwiICtcblwiICB2X2xpZ2h0aW5nID0gZF94X2xpZ2h0aW5nKHBvc2l0aW9uLCBhX25vcm1hbCwgdmVjMygxLiksIHZlYzQoMC4sIDAuLCAxNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLiksIHZlYzQoMC4sIDAuLCA1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKSwgdmVjMygwLjIsIDAuNywgLTAuNSksIGxpZ2h0X2FtYmllbnQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICB2X3Bvc2l0aW9uID0gcG9zaXRpb247XFxuXCIgK1xuXCIgIHZfbm9ybWFsID0gYV9ub3JtYWw7XFxuXCIgK1xuXCIgIHZfY29sb3IgPSBhX2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgcG9zaXRpb24gPSB1X21ldGVyX3ZpZXcgKiBwb3NpdGlvbjtcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoUFJPSkVDVElPTl9QRVJTUEVDVElWRSlcXG5cIiArXG5cIiAgcG9zaXRpb24gPSBhX3hfcGVyc3BlY3RpdmUocG9zaXRpb24sIHZlYzIoMC4sIDAuKSwgdmVjMigwLjYsIDAuNikpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKFBST0pFQ1RJT05fSVNPTUVUUklDKSAvLyB8fCBkZWZpbmVkKFBST0pFQ1RJT05fUE9QVVApXFxuXCIgK1xuXCIgIHBvc2l0aW9uID0gYl94X2lzb21ldHJpYyhwb3NpdGlvbiwgdmVjMigwLiwgMS4pLCAxLik7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBwb3NpdGlvbi56ID0gY194X2NhbGN1bGF0ZVoocG9zaXRpb24ueiwgYV9sYXllciwgdV9udW1fbGF5ZXJzLCA0MDk2Lik7XFxuXCIgK1xuXCIgIGdsX1Bvc2l0aW9uID0gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1wiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydzZWxlY3Rpb25fZnJhZ21lbnQnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwiI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4odm9pZCkge1xcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCIgIGdsX0ZyYWdDb2xvciA9IHZfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICBnbF9GcmFnQ29sb3IgPSB2ZWMzKDAuLCAwLiwgMC4sIDEuKTtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIFxcblwiICtcblwifVxcblwiICtcIlwiO1xuXG5zaGFkZXJfc291cmNlc1snc2ltcGxlX3BvbHlnb25fZnJhZ21lbnQnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21ldGVyc19wZXJfcGl4ZWw7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cIiNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3Bvc2l0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfbm9ybWFsO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzMgYV94X3BvaW50TGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgY29sb3IgKj0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbih2b2lkKSB7XFxuXCIgK1xuXCIgIHZlYzMgY29sb3I7XFxuXCIgK1xuXCIgICNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpIC8vIGRlZmF1bHQgdG8gcGVyLXBpeGVsIGxpZ2h0aW5nXFxuXCIgK1xuXCIgIHZlYzQgbGlnaHRfcG9zID0gdmVjNCgwLiwgMC4sIDE1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKTtcXG5cIiArXG5cIiAgY29uc3QgZmxvYXQgbGlnaHRfYW1iaWVudCA9IDAuNTtcXG5cIiArXG5cIiAgY29uc3QgYm9vbCBiYWNrbGl0ID0gdHJ1ZTtcXG5cIiArXG5cIiAgY29sb3IgPSBhX3hfcG9pbnRMaWdodCh2X3Bvc2l0aW9uLCB2X25vcm1hbCwgdl9jb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCBiYWNrbGl0KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgY29sb3IgPSB2X2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogZnJhZ21lbnRcXG5cIiArXG5cIiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwgMS4wKTtcXG5cIiArXG5cIn1cXG5cIiArXCJcIjtcblxuc2hhZGVyX3NvdXJjZXNbJ3NpbXBsZV9wb2x5Z29uX3ZlcnRleCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9hc3BlY3Q7XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV90aWxlX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV9tZXRlcl92aWV3O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21ldGVyc19wZXJfcGl4ZWw7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbnVtX2xheWVycztcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfcG9zaXRpb247XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX25vcm1hbDtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfY29sb3I7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgZmxvYXQgYV9sYXllcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwiI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWM0IHZfcG9zaXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9ub3JtYWw7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwidmVjNCBhX3hfcGVyc3BlY3RpdmUodmVjNCBwb3NpdGlvbiwgY29uc3QgdmVjMiBwZXJzcGVjdGl2ZV9vZmZzZXQsIGNvbnN0IHZlYzIgcGVyc3BlY3RpdmVfZmFjdG9yKSB7XFxuXCIgK1xuXCIgIHBvc2l0aW9uLnh5ICs9IHBvc2l0aW9uLnogKiBwZXJzcGVjdGl2ZV9mYWN0b3IgKiAocG9zaXRpb24ueHkgLSBwZXJzcGVjdGl2ZV9vZmZzZXQpO1xcblwiICtcblwiICByZXR1cm4gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWM0IGJfeF9pc29tZXRyaWModmVjNCBwb3NpdGlvbiwgY29uc3QgdmVjMiBheGlzLCBjb25zdCBmbG9hdCBtdWx0aXBsaWVyKSB7XFxuXCIgK1xuXCIgIHBvc2l0aW9uLnh5ICs9IHBvc2l0aW9uLnogKiBheGlzICogbXVsdGlwbGllciAvIHVfYXNwZWN0O1xcblwiICtcblwiICByZXR1cm4gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJmbG9hdCBjX3hfY2FsY3VsYXRlWihmbG9hdCB6LCBmbG9hdCBsYXllciwgY29uc3QgZmxvYXQgbnVtX2xheWVycywgY29uc3QgZmxvYXQgel9sYXllcl9zY2FsZSkge1xcblwiICtcblwiICBmbG9hdCB6X2xheWVyX3JhbmdlID0gKG51bV9sYXllcnMgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICBmbG9hdCB6X2xheWVyID0gKGxheWVyICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgeiA9IHpfbGF5ZXIgKyBjbGFtcCh6LCAwLiwgel9sYXllcl9zY2FsZSk7XFxuXCIgK1xuXCIgIHogPSAoel9sYXllcl9yYW5nZSAtIHopIC8gel9sYXllcl9yYW5nZTtcXG5cIiArXG5cIiAgcmV0dXJuIHo7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGRfeF9wb2ludExpZ2h0KHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgZmxvYXQgbGlnaHRfYW1iaWVudCwgY29uc3QgYm9vbCBiYWNrbGlnaHQpIHtcXG5cIiArXG5cIiAgdmVjMyBsaWdodF9kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gbGlnaHRfcG9zLnh5eik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGFicyhtYXgoZmxvYXQoYmFja2xpZ2h0KSAqIC0xLiwgZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkpKSArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4oKSB7XFxuXCIgK1xuXCIgIHZlYzQgcG9zaXRpb24gPSB1X3RpbGVfdmlldyAqIHZlYzQoYV9wb3NpdGlvbiwgMS4pO1xcblwiICtcblwiICAjcHJhZ21hIHRhbmdyYW06IHZlcnRleFxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiICB2ZWM0IGxpZ2h0X3BvcyA9IHZlYzQoMC4sIDAuLCAxNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLik7XFxuXCIgK1xuXCIgIGNvbnN0IGZsb2F0IGxpZ2h0X2FtYmllbnQgPSAwLjU7XFxuXCIgK1xuXCIgIGNvbnN0IGJvb2wgYmFja2xpdCA9IHRydWU7XFxuXCIgK1xuXCIgIHZfY29sb3IgPSBkX3hfcG9pbnRMaWdodChwb3NpdGlvbiwgYV9ub3JtYWwsIGFfY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgYmFja2xpdCk7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIHZfcG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIiAgdl9ub3JtYWwgPSBhX25vcm1hbDtcXG5cIiArXG5cIiAgdl9jb2xvciA9IGFfY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBwb3NpdGlvbiA9IHVfbWV0ZXJfdmlldyAqIHBvc2l0aW9uO1xcblwiICtcblwiICAjaWYgZGVmaW5lZChQUk9KRUNUSU9OX1BFUlNQRUNUSVZFKVxcblwiICtcblwiICBwb3NpdGlvbiA9IGFfeF9wZXJzcGVjdGl2ZShwb3NpdGlvbiwgdmVjMigtMC4yNSwgLTAuMjUpLCB2ZWMyKDAuNiwgMC42KSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoUFJPSkVDVElPTl9JU09NRVRSSUMpXFxuXCIgK1xuXCIgIHBvc2l0aW9uID0gYl94X2lzb21ldHJpYyhwb3NpdGlvbiwgdmVjMigwLiwgMS4pLCAxLik7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBwb3NpdGlvbi56ID0gY194X2NhbGN1bGF0ZVoocG9zaXRpb24ueiwgYV9sYXllciwgdV9udW1fbGF5ZXJzLCA0MDk2Lik7XFxuXCIgK1xuXCIgIGdsX1Bvc2l0aW9uID0gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1wiXCI7XG5cbmlmIChtb2R1bGUuZXhwb3J0cyAhPT0gdW5kZWZpbmVkKSB7IG1vZHVsZS5leHBvcnRzID0gc2hhZGVyX3NvdXJjZXM7IH1cblxuIiwiLy8gVGV4dHVyZSBtYW5hZ2VtZW50XG5cbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wuanMnKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XG5cbi8vIEdsb2JhbCBzZXQgb2YgdGV4dHVyZXMsIGJ5IG5hbWVcbkdMVGV4dHVyZS50ZXh0dXJlcyA9IHt9O1xuXG4vLyBHTCB0ZXh0dXJlIHdyYXBwZXIgb2JqZWN0IGZvciBrZWVwaW5nIHRyYWNrIG9mIGEgZ2xvYmFsIHNldCBvZiB0ZXh0dXJlcywga2V5ZWQgYnkgYW4gYXJiaXRyYXJ5IG5hbWVcbmZ1bmN0aW9uIEdMVGV4dHVyZSAoZ2wsIG5hbWUsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmdsID0gZ2w7XG4gICAgdGhpcy50ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgIHRoaXMuYmluZCgwKTtcbiAgICB0aGlzLmltYWdlID0gbnVsbDtcblxuICAgIC8vIERlZmF1bHQgdG8gYSAxLXBpeGVsIGJsYWNrIHRleHR1cmUgc28gd2UgY2FuIHNhZmVseSByZW5kZXIgd2hpbGUgd2Ugd2FpdCBmb3IgYW4gaW1hZ2UgdG8gbG9hZFxuICAgIC8vIFNlZTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xOTcyMjI0Ny93ZWJnbC13YWl0LWZvci10ZXh0dXJlLXRvLWxvYWRcbiAgICB0aGlzLnNldERhdGEoMSwgMSwgbmV3IFVpbnQ4QXJyYXkoWzAsIDAsIDAsIDI1NV0pLCB7IGZpbHRlcmluZzogJ25lYXJlc3QnIH0pO1xuXG4gICAgLy8gVE9ETzogYmV0dGVyIHN1cHBvcnQgZm9yIG5vbi1VUkwgc291cmNlczogY2FudmFzL3ZpZGVvIGVsZW1lbnRzLCByYXcgcGl4ZWwgYnVmZmVyc1xuXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICBHTFRleHR1cmUudGV4dHVyZXNbdGhpcy5uYW1lXSA9IHRoaXM7XG59O1xuXG5HTFRleHR1cmUucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAodW5pdCkge1xuICAgIHRoaXMuZ2wuYWN0aXZlVGV4dHVyZSh0aGlzLmdsLlRFWFRVUkUwICsgdW5pdCk7XG4gICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0aGlzLmdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG59O1xuXG4vLyBMb2FkcyBhIHRleHR1cmUgZnJvbSBhIFVSTFxuR0xUZXh0dXJlLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmltYWdlLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMuaW1hZ2Uud2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5pbWFnZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuZGF0YSA9IG51bGw7IC8vIG11dHVhbGx5IGV4Y2x1c2l2ZSB3aXRoIGRpcmVjdCBkYXRhIGJ1ZmZlciB0ZXh0dXJlc1xuICAgICAgICB0aGlzLnVwZGF0ZShvcHRpb25zKTtcbiAgICAgICAgdGhpcy5zZXRUZXh0dXJlRmlsdGVyaW5nKG9wdGlvbnMpO1xuICAgIH07XG4gICAgdGhpcy5pbWFnZS5zcmMgPSB1cmw7XG59O1xuXG4vLyBTZXRzIHRleHR1cmUgdG8gYSByYXcgaW1hZ2UgYnVmZmVyXG5HTFRleHR1cmUucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgZGF0YSwgb3B0aW9ucykge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMuaW1hZ2UgPSBudWxsOyAvLyBtdXR1YWxseSBleGNsdXNpdmUgd2l0aCBpbWFnZSBlbGVtZW50LWJhc2VkIHRleHR1cmVzXG5cbiAgICB0aGlzLnVwZGF0ZShvcHRpb25zKTtcbiAgICB0aGlzLnNldFRleHR1cmVGaWx0ZXJpbmcob3B0aW9ucyk7XG59O1xuXG4vLyBVcGxvYWRzIGN1cnJlbnQgaW1hZ2Ugb3IgYnVmZmVyIHRvIHRoZSBHUFUgKGNhbiBiZSB1c2VkIHRvIHVwZGF0ZSBhbmltYXRlZCB0ZXh0dXJlcyBvbiB0aGUgZmx5KVxuR0xUZXh0dXJlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5iaW5kKDApO1xuICAgIHRoaXMuZ2wucGl4ZWxTdG9yZWkodGhpcy5nbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCAob3B0aW9ucy5VTlBBQ0tfRkxJUF9ZX1dFQkdMID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSkpO1xuXG4gICAgLy8gSW1hZ2UgZWxlbWVudFxuICAgIGlmICh0aGlzLmltYWdlICYmIHRoaXMuaW1hZ2UuY29tcGxldGUpIHtcbiAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMuZ2wuVEVYVFVSRV8yRCwgMCwgdGhpcy5nbC5SR0JBLCB0aGlzLmdsLlJHQkEsIHRoaXMuZ2wuVU5TSUdORURfQllURSwgdGhpcy5pbWFnZSk7XG4gICAgfVxuICAgIC8vIFJhdyBpbWFnZSBidWZmZXJcbiAgICBlbHNlIGlmICh0aGlzLndpZHRoICYmIHRoaXMuaGVpZ2h0KSB7IC8vIE5PVEU6IHRoaXMuZGF0YSBjYW4gYmUgbnVsbCwgdG8gemVybyBvdXQgdGV4dHVyZVxuICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQodGhpcy5nbC5URVhUVVJFXzJELCAwLCB0aGlzLmdsLlJHQkEsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwLCB0aGlzLmdsLlJHQkEsIHRoaXMuZ2wuVU5TSUdORURfQllURSwgdGhpcy5kYXRhKTtcbiAgICB9XG59O1xuXG4vLyBEZXRlcm1pbmVzIGFwcHJvcHJpYXRlIGZpbHRlcmluZyBtb2RlXG4vLyBBc3N1bWVzIHRleHR1cmUgdG8gYmUgb3BlcmF0ZWQgb24gaXMgYWxyZWFkeSBib3VuZFxuR0xUZXh0dXJlLnByb3RvdHlwZS5zZXRUZXh0dXJlRmlsdGVyaW5nID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmZpbHRlcmluZyA9IG9wdGlvbnMuZmlsdGVyaW5nIHx8ICdtaXBtYXAnOyAvLyBkZWZhdWx0IHRvIG1pcG1hcHMgZm9yIHBvd2VyLW9mLTIgdGV4dHVyZXNcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuXG4gICAgLy8gRm9yIHBvd2VyLW9mLTIgdGV4dHVyZXMsIHRoZSBmb2xsb3dpbmcgcHJlc2V0cyBhcmUgYXZhaWxhYmxlOlxuICAgIC8vIG1pcG1hcDogbGluZWFyIGJsZW5kIGZyb20gbmVhcmVzdCBtaXBcbiAgICAvLyBsaW5lYXI6IGxpbmVhciBibGVuZCBmcm9tIG9yaWdpbmFsIGltYWdlIChubyBtaXBzKVxuICAgIC8vIG5lYXJlc3Q6IG5lYXJlc3QgcGl4ZWwgZnJvbSBvcmlnaW5hbCBpbWFnZSAobm8gbWlwcywgJ2Jsb2NreScgbG9vaylcbiAgICBpZiAoVXRpbHMuaXNQb3dlck9mMih0aGlzLndpZHRoKSAmJiBVdGlscy5pc1Bvd2VyT2YyKHRoaXMuaGVpZ2h0KSkge1xuICAgICAgICB0aGlzLnBvd2VyX29mXzIgPSB0cnVlO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBvcHRpb25zLlRFWFRVUkVfV1JBUF9TIHx8IGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBvcHRpb25zLlRFWFRVUkVfV1JBUF9UIHx8IGdsLkNMQU1QX1RPX0VER0UpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmZpbHRlcmluZyA9PSAnbWlwbWFwJykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3dlci1vZi0yIE1JUE1BUFwiKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyaW5nID0gJ21pcG1hcCc7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSX01JUE1BUF9ORUFSRVNUKTsgLy8gVE9ETzogdXNlIHRyaWxpbmVhciBmaWx0ZXJpbmcgYnkgZGVmdWFsdCBpbnN0ZWFkP1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgICAgICBnbC5nZW5lcmF0ZU1pcG1hcChnbC5URVhUVVJFXzJEKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmZpbHRlcmluZyA9PSAnbGluZWFyJykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3dlci1vZi0yIExJTkVBUlwiKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyaW5nID0gJ2xpbmVhcic7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuZmlsdGVyaW5nID09ICduZWFyZXN0Jykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3dlci1vZi0yIE5FQVJFU1RcIik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmluZyA9ICduZWFyZXN0JztcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gV2ViR0wgaGFzIHN0cmljdCByZXF1aXJlbWVudHMgb24gbm9uLXBvd2VyLW9mLTIgdGV4dHVyZXM6XG4gICAgICAgIC8vIE5vIG1pcG1hcHMgYW5kIG11c3QgY2xhbXAgdG8gZWRnZVxuICAgICAgICB0aGlzLnBvd2VyX29mXzIgPSBmYWxzZTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmZpbHRlcmluZyA9PSAnbmVhcmVzdCcpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBORUFSRVNUXCIpO1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJpbmcgPSAnbmVhcmVzdCc7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vIGRlZmF1bHQgdG8gbGluZWFyIGZvciBub24tcG93ZXItb2YtMiB0ZXh0dXJlc1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3dlci1vZi0yIExJTkVBUlwiKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyaW5nID0gJ2xpbmVhcic7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHTFRleHR1cmU7XG59XG4iLCIvLyBEZXNjcmliZXMgYSB2ZXJ0ZXggbGF5b3V0IHRoYXQgY2FuIGJlIHVzZWQgd2l0aCBtYW55IGRpZmZlcmVudCBHTCBwcm9ncmFtcy5cbi8vIElmIGEgZ2l2ZW4gcHJvZ3JhbSBkb2Vzbid0IGluY2x1ZGUgYWxsIGF0dHJpYnV0ZXMsIGl0IGNhbiBzdGlsbCB1c2UgdGhlIHZlcnRleCBsYXlvdXRcbi8vIHRvIHJlYWQgdGhvc2UgYXR0cmlicyB0aGF0IGl0IGRvZXMgcmVjb2duaXplLCB1c2luZyB0aGUgYXR0cmliIG9mZnNldHMgdG8gc2tpcCBvdGhlcnMuXG4vLyBBdHRyaWJzIGFyZSBhbiBhcnJheSwgaW4gbGF5b3V0IG9yZGVyLCBvZjogbmFtZSwgc2l6ZSwgdHlwZSwgbm9ybWFsaXplZFxuLy8gZXg6IHsgbmFtZTogJ3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH1cbmZ1bmN0aW9uIEdMVmVydGV4TGF5b3V0IChnbCwgYXR0cmlicylcbntcbiAgICB0aGlzLmF0dHJpYnMgPSBhdHRyaWJzO1xuXG4gICAgLy8gQ2FsYyB2ZXJ0ZXggc3RyaWRlXG4gICAgdGhpcy5zdHJpZGUgPSAwO1xuICAgIGZvciAodmFyIGE9MDsgYSA8IHRoaXMuYXR0cmlicy5sZW5ndGg7IGErKykge1xuICAgICAgICB2YXIgYXR0cmliID0gdGhpcy5hdHRyaWJzW2FdO1xuXG4gICAgICAgIGF0dHJpYi5ieXRlX3NpemUgPSBhdHRyaWIuc2l6ZTtcblxuICAgICAgICBzd2l0Y2ggKGF0dHJpYi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIGdsLkZMT0FUOlxuICAgICAgICAgICAgY2FzZSBnbC5JTlQ6XG4gICAgICAgICAgICBjYXNlIGdsLlVOU0lHTkVEX0lOVDpcbiAgICAgICAgICAgICAgICBhdHRyaWIuYnl0ZV9zaXplICo9IDQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGdsLlNIT1JUOlxuICAgICAgICAgICAgY2FzZSBnbC5VTlNJR05FRF9TSE9SVDpcbiAgICAgICAgICAgICAgICBhdHRyaWIuYnl0ZV9zaXplICo9IDI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBhdHRyaWIub2Zmc2V0ID0gdGhpcy5zdHJpZGU7XG4gICAgICAgIHRoaXMuc3RyaWRlICs9IGF0dHJpYi5ieXRlX3NpemU7XG4gICAgfVxufVxuXG4vLyBUcmFjayBjdXJyZW50bHkgZW5hYmxlZCBhdHRyaWJzLCBieSB0aGUgcHJvZ3JhbSB0aGV5IGFyZSBib3VuZCB0b1xuR0xWZXJ0ZXhMYXlvdXQuZW5hYmxlZF9hdHRyaWJzID0ge307XG5cbi8vIFNldHVwIGEgdmVydGV4IGxheW91dCBmb3IgYSBzcGVjaWZpYyBHTCBwcm9ncmFtXG4vLyBBc3N1bWVzIHRoYXQgdGhlIGRlc2lyZWQgdmVydGV4IGJ1ZmZlciAoVkJPKSBpcyBhbHJlYWR5IGJvdW5kXG5HTFZlcnRleExheW91dC5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24gKGdsLCBnbF9wcm9ncmFtKVxue1xuICAgIC8vIEVuYWJsZSBhbGwgYXR0cmlidXRlcyBmb3IgdGhpcyBsYXlvdXRcbiAgICBmb3IgKHZhciBhPTA7IGEgPCB0aGlzLmF0dHJpYnMubGVuZ3RoOyBhKyspIHtcbiAgICAgICAgdmFyIGF0dHJpYiA9IHRoaXMuYXR0cmlic1thXTtcbiAgICAgICAgdmFyIGxvY2F0aW9uID0gZ2xfcHJvZ3JhbS5hdHRyaWJ1dGUoYXR0cmliLm5hbWUpLmxvY2F0aW9uO1xuXG4gICAgICAgIGlmIChsb2NhdGlvbiAhPSAtMSkge1xuICAgICAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkobG9jYXRpb24pO1xuICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihsb2NhdGlvbiwgYXR0cmliLnNpemUsIGF0dHJpYi50eXBlLCBhdHRyaWIubm9ybWFsaXplZCwgdGhpcy5zdHJpZGUsIGF0dHJpYi5vZmZzZXQpO1xuICAgICAgICAgICAgR0xWZXJ0ZXhMYXlvdXQuZW5hYmxlZF9hdHRyaWJzW2xvY2F0aW9uXSA9IGdsX3Byb2dyYW07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEaXNhYmxlIGFueSBwcmV2aW91c2x5IGJvdW5kIGF0dHJpYnV0ZXMgdGhhdCBhcmVuJ3QgZm9yIHRoaXMgbGF5b3V0XG4gICAgdmFyIHVudXN1ZWRfYXR0cmlicyA9IFtdO1xuICAgIGZvciAobG9jYXRpb24gaW4gR0xWZXJ0ZXhMYXlvdXQuZW5hYmxlZF9hdHRyaWJzKSB7XG4gICAgICAgIGlmIChHTFZlcnRleExheW91dC5lbmFibGVkX2F0dHJpYnNbbG9jYXRpb25dICE9IGdsX3Byb2dyYW0pIHtcbiAgICAgICAgICAgIGdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbik7XG4gICAgICAgICAgICB1bnVzdWVkX2F0dHJpYnMucHVzaChsb2NhdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYXJrIGF0dHJpYnMgYXMgdW51c2VkXG4gICAgZm9yIChsb2NhdGlvbiBpbiB1bnVzdWVkX2F0dHJpYnMpIHtcbiAgICAgICAgZGVsZXRlIEdMVmVydGV4TGF5b3V0LmVuYWJsZWRfYXR0cmlic1tsb2NhdGlvbl07XG4gICAgfVxufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHTFZlcnRleExheW91dDtcbn1cbiIsInZhciBTY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmUuanMnKTtcblxudmFyIExlYWZsZXRMYXllciA9IEwuR3JpZExheWVyLmV4dGVuZCh7XG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICBMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgU2NlbmUodGhpcy5vcHRpb25zLnZlY3RvclRpbGVTb3VyY2UsIHRoaXMub3B0aW9ucy52ZWN0b3JMYXllcnMsIHRoaXMub3B0aW9ucy52ZWN0b3JTdHlsZXMsIHsgbnVtX3dvcmtlcnM6IHRoaXMub3B0aW9ucy5udW1Xb3JrZXJzIH0pO1xuICAgICAgICB0aGlzLnNjZW5lLmRlYnVnID0gdGhpcy5vcHRpb25zLmRlYnVnO1xuICAgICAgICB0aGlzLnNjZW5lLmNvbnRpbnVvdXNfYW5pbWF0aW9uID0gZmFsc2U7IC8vIHNldCB0byB0cnVlIGZvciBhbmltYXRpbm9zLCBldGMuIChldmVudHVhbGx5IHdpbGwgYmUgYXV0b21hdGVkKVxuICAgIH0sXG5cbiAgICAvLyBGaW5pc2ggaW5pdGlhbGl6aW5nIHNjZW5lIGFuZCBzZXR1cCBldmVudHMgd2hlbiBsYXllciBpcyBhZGRlZCB0byBtYXBcbiAgICBvbkFkZDogZnVuY3Rpb24gKG1hcCkge1xuICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzO1xuXG4gICAgICAgIGxheWVyLm9uKCd0aWxldW5sb2FkJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgdGlsZSA9IGV2ZW50LnRpbGU7XG4gICAgICAgICAgICB2YXIga2V5ID0gdGlsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGlsZS1rZXknKTtcbiAgICAgICAgICAgIGxheWVyLnNjZW5lLnJlbW92ZVRpbGUoa2V5KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF5ZXIuX21hcC5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHNpemUgPSBsYXllci5fbWFwLmdldFNpemUoKTtcbiAgICAgICAgICAgIGxheWVyLnNjZW5lLnJlc2l6ZU1hcChzaXplLngsIHNpemUueSk7XG4gICAgICAgICAgICBsYXllci51cGRhdGVCb3VuZHMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF5ZXIuX21hcC5vbignbW92ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjZW50ZXIgPSBsYXllci5fbWFwLmdldENlbnRlcigpO1xuICAgICAgICAgICAgbGF5ZXIuc2NlbmUuc2V0Q2VudGVyKGNlbnRlci5sbmcsIGNlbnRlci5sYXQpO1xuICAgICAgICAgICAgbGF5ZXIudXBkYXRlQm91bmRzKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxheWVyLl9tYXAub24oJ3pvb21zdGFydCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibWFwLnpvb21zdGFydCBcIiArIGxheWVyLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgICAgIGxheWVyLnNjZW5lLnN0YXJ0Wm9vbSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsYXllci5fbWFwLm9uKCd6b29tZW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJtYXAuem9vbWVuZCBcIiArIGxheWVyLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgICAgIGxheWVyLnNjZW5lLnNldFpvb20obGF5ZXIuX21hcC5nZXRab29tKCkpO1xuICAgICAgICAgICAgbGF5ZXIudXBkYXRlQm91bmRzKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxheWVyLl9tYXAub24oJ2RyYWdzdGFydCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxheWVyLnNjZW5lLnBhbm5pbmcgPSB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICBsYXllci5fbWFwLm9uKCdkcmFnZW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGF5ZXIuc2NlbmUucGFubmluZyA9IGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDYW52YXMgZWxlbWVudCB3aWxsIGJlIGluc2VydGVkIGFmdGVyIG1hcCBjb250YWluZXIgKGxlYWZsZXQgdHJhbnNmb3JtcyBzaG91bGRuJ3QgYmUgYXBwbGllZCB0byB0aGUgR0wgY2FudmFzKVxuICAgICAgICAvLyBUT0RPOiBmaW5kIGEgYmV0dGVyIHdheSB0byBkZWFsIHdpdGggdGhpcz8gcmlnaHQgbm93IEdMIG1hcCBvbmx5IHJlbmRlcnMgY29ycmVjdGx5IGFzIHRoZSBib3R0b20gbGF5ZXJcbiAgICAgICAgbGF5ZXIuc2NlbmUuY29udGFpbmVyID0gbGF5ZXIuX21hcC5nZXRDb250YWluZXIoKTtcblxuICAgICAgICB2YXIgY2VudGVyID0gbGF5ZXIuX21hcC5nZXRDZW50ZXIoKTtcbiAgICAgICAgbGF5ZXIuc2NlbmUuc2V0Q2VudGVyKGNlbnRlci5sbmcsIGNlbnRlci5sYXQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInpvb206IFwiICsgbGF5ZXIuX21hcC5nZXRab29tKCkpO1xuICAgICAgICBsYXllci5zY2VuZS5zZXRab29tKGxheWVyLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgbGF5ZXIudXBkYXRlQm91bmRzKCk7XG5cbiAgICAgICAgTC5HcmlkTGF5ZXIucHJvdG90eXBlLm9uQWRkLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgLy8gVXNlIGxlYWZsZXQncyBleGlzdGluZyBldmVudCBzeXN0ZW0gYXMgdGhlIGNhbGxiYWNrIG1lY2hhbmlzbVxuICAgICAgICBsYXllci5zY2VuZS5pbml0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGF5ZXIuZmlyZSgnaW5pdCcpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcbiAgICAgICAgTC5HcmlkTGF5ZXIucHJvdG90eXBlLm9uUmVtb3ZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIC8vIFRPRE86IHJlbW92ZSBldmVudCBoYW5kbGVycywgZGVzdHJveSBtYXBcbiAgICB9LFxuXG4gICAgY3JlYXRlVGlsZTogZnVuY3Rpb24gKGNvb3JkcywgZG9uZSkge1xuICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuc2NlbmUubG9hZFRpbGUoY29vcmRzLCBkaXYsIGRvbmUpO1xuICAgICAgICByZXR1cm4gZGl2O1xuICAgIH0sXG5cbiAgICB1cGRhdGVCb3VuZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGxheWVyID0gdGhpcztcbiAgICAgICAgdmFyIGJvdW5kcyA9IGxheWVyLl9tYXAuZ2V0Qm91bmRzKCk7XG4gICAgICAgIGxheWVyLnNjZW5lLnNldEJvdW5kcyhib3VuZHMuZ2V0U291dGhXZXN0KCksIGJvdW5kcy5nZXROb3J0aEVhc3QoKSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNjZW5lLnJlbmRlcigpO1xuICAgIH1cblxufSk7XG5cbnZhciBsZWFmbGV0TGF5ZXIgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgTGVhZmxldExheWVyKG9wdGlvbnMpO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICAgIExlYWZsZXRMYXllcjogTGVhZmxldExheWVyLFxuICAgICAgICBsZWFmbGV0TGF5ZXI6IGxlYWZsZXRMYXllclxuICAgIH07XG59XG4iLCIvLyBNb2R1bGVzIGFuZCBkZXBlbmRlbmNpZXMgdG8gZXhwb3NlIGluIHRoZSBwdWJsaWMgVGFuZ3JhbSBtb2R1bGVcblxuLy8gVGhlIGxlYWZsZXQgbGF5ZXIgcGx1Z2luIGlzIGN1cnJlbnRseSB0aGUgcHJpbWFyeSBtZWFucyBvZiB1c2luZyB0aGUgbGlicmFyeVxudmFyIExlYWZsZXQgPSByZXF1aXJlKCcuL2xlYWZsZXRfbGF5ZXIuanMnKTtcblxuLy8gR0wgZnVuY3Rpb25zIGluY2x1ZGVkIGZvciBlYXNpZXIgZGVidWdnaW5nIC8gZGlyZWN0IGFjY2VzcyB0byBzZXR0aW5nIGdsb2JhbCBkZWZpbmVzLCByZWxvYWRpbmcgcHJvZ3JhbXMsIGV0Yy5cbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wvZ2wuanMnKTtcbkdMLlByb2dyYW0gPSByZXF1aXJlKCcuL2dsL2dsX3Byb2dyYW0uanMnKTtcbkdMLlRleHR1cmUgPSByZXF1aXJlKCcuL2dsL2dsX3RleHR1cmUuanMnKTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICAgIExlYWZsZXRMYXllcjogTGVhZmxldC5MZWFmbGV0TGF5ZXIsXG4gICAgICAgIGxlYWZsZXRMYXllcjogTGVhZmxldC5sZWFmbGV0TGF5ZXIsXG4gICAgICAgIEdMOiBHTFxuICAgIH07XG59XG4iLCIvLyBQb2ludFxuZnVuY3Rpb24gUG9pbnQgKHgsIHkpXG57XG4gICAgcmV0dXJuIHsgeDogeCwgeTogeSB9O1xufVxuXG5Qb2ludC5jb3B5ID0gZnVuY3Rpb24gKHApXG57XG4gICAgaWYgKHAgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHsgeDogcC54LCB5OiBwLnkgfTtcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gUG9pbnQ7XG59XG4iLCJ2YXIgUG9pbnQgPSByZXF1aXJlKCcuL3BvaW50LmpzJyk7XG52YXIgR2VvID0gcmVxdWlyZSgnLi9nZW8uanMnKTtcbnZhciBTdHlsZSA9IHJlcXVpcmUoJy4vc3R5bGUuanMnKTtcbnZhciBNb2RlTWFuYWdlciA9IHJlcXVpcmUoJy4vZ2wvZ2xfbW9kZXMnKS5Nb2RlTWFuYWdlcjtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMuanMnKTtcbnZhciBRdWV1ZSA9IHJlcXVpcmUoJ3F1ZXVlLWFzeW5jJyk7XG5cbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wvZ2wuanMnKTtcbnZhciBHTFByb2dyYW0gPSByZXF1aXJlKCcuL2dsL2dsX3Byb2dyYW0uanMnKTtcbnZhciBHTEJ1aWxkZXJzID0gcmVxdWlyZSgnLi9nbC9nbF9idWlsZGVycy5qcycpO1xudmFyIEdMVGV4dHVyZSA9IHJlcXVpcmUoJy4vZ2wvZ2xfdGV4dHVyZS5qcycpO1xuXG52YXIgbWF0NCA9IHJlcXVpcmUoJ2dsLW1hdHJpeCcpLm1hdDQ7XG52YXIgdmVjMyA9IHJlcXVpcmUoJ2dsLW1hdHJpeCcpLnZlYzM7XG5cbi8vIFNldHVwIHRoYXQgaGFwcGVucyBvbiBtYWluIHRocmVhZCBvbmx5IChza2lwIGluIHdlYiB3b3JrZXIpXG52YXIgeWFtbDtcblV0aWxzLnJ1bklmSW5NYWluVGhyZWFkKGZ1bmN0aW9uKCkge1xuICAgIHRyeSB7XG4gICAgICAgIHlhbWwgPSByZXF1aXJlKCdqcy15YW1sJyk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm8gWUFNTCBzdXBwb3J0LCBqcy15YW1sIG1vZHVsZSBub3QgZm91bmRcIik7XG4gICAgfVxuXG4gICAgZmluZEJhc2VMaWJyYXJ5VVJMKCk7XG59KTtcblxuLy8gR2xvYmFsIHNldHVwXG5TY2VuZS50aWxlX3NjYWxlID0gNDA5NjsgLy8gY29vcmRpbmF0ZXMgYXJlIGxvY2FsbHkgc2NhbGVkIHRvIHRoZSByYW5nZSBbMCwgdGlsZV9zY2FsZV1cbkdlby5zZXRUaWxlU2NhbGUoU2NlbmUudGlsZV9zY2FsZSk7XG5HTEJ1aWxkZXJzLnNldFRpbGVTY2FsZShTY2VuZS50aWxlX3NjYWxlKTtcbkdMUHJvZ3JhbS5kZWZpbmVzLlRJTEVfU0NBTEUgPSBTY2VuZS50aWxlX3NjYWxlO1xuU2NlbmUuZGVidWcgPSBmYWxzZTtcblxuLy8gTGF5ZXJzICYgc3R5bGVzOiBwYXNzIGFuIG9iamVjdCBkaXJlY3RseSwgb3IgYSBVUkwgYXMgc3RyaW5nIHRvIGxvYWQgcmVtb3RlbHlcbmZ1bmN0aW9uIFNjZW5lICh0aWxlX3NvdXJjZSwgbGF5ZXJzLCBzdHlsZXMsIG9wdGlvbnMpXG57XG4gICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMudGlsZV9zb3VyY2UgPSB0aWxlX3NvdXJjZTtcbiAgICB0aGlzLnRpbGVzID0ge307XG4gICAgdGhpcy5xdWV1ZWRfdGlsZXMgPSBbXTtcbiAgICB0aGlzLm51bV93b3JrZXJzID0gb3B0aW9ucy5udW1fd29ya2VycyB8fCAxO1xuICAgIHRoaXMuYWxsb3dfY3Jvc3NfZG9tYWluX3dvcmtlcnMgPSAob3B0aW9ucy5hbGxvd19jcm9zc19kb21haW5fd29ya2VycyA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xuXG4gICAgdGhpcy5sYXllcnMgPSBsYXllcnM7XG4gICAgdGhpcy5zdHlsZXMgPSBzdHlsZXM7XG5cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTsgLy8gcmVxdWVzdCBhIHJlZHJhd1xuICAgIHRoaXMuYW5pbWF0ZWQgPSBmYWxzZTsgLy8gcmVxdWVzdCByZWRyYXcgZXZlcnkgZnJhbWVcblxuICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgIHRoaXMuem9vbSA9IG51bGw7XG4gICAgdGhpcy5jZW50ZXIgPSBudWxsO1xuICAgIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcblxuICAgIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuICAgIHRoaXMucGFubmluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lcjtcblxuICAgIHRoaXMucmVzZXRUaW1lKCk7XG59XG5cblNjZW5lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGNhbGxiYWNrKVxue1xuICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBMb2FkIHNjZW5lIGRlZmluaXRpb24gKGxheWVycywgc3R5bGVzLCBldGMuKSwgdGhlbiBjcmVhdGUgbW9kZXMgJiB3b3JrZXJzXG4gICAgdGhpcy5sb2FkU2NlbmUoKCkgPT4ge1xuICAgICAgICB2YXIgcXVldWUgPSBRdWV1ZSgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSByZW5kZXJpbmcgbW9kZXNcbiAgICAgICAgcXVldWUuZGVmZXIoY29tcGxldGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5tb2RlcyA9IFNjZW5lLmNyZWF0ZU1vZGVzKHRoaXMuc3R5bGVzKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQWN0aXZlTW9kZXMoKTtcbiAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENyZWF0ZSB3ZWIgd29ya2Vyc1xuICAgICAgICBxdWV1ZS5kZWZlcihjb21wbGV0ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVdvcmtlcnMoY29tcGxldGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUaGVuIGNyZWF0ZSBHTCBjb250ZXh0XG4gICAgICAgIHF1ZXVlLmF3YWl0KCgpID0+IHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBjYW52YXMgJiBHTFxuICAgICAgICAgICAgdGhpcy5jb250YWluZXIgPSB0aGlzLmNvbnRhaW5lciB8fCBkb2N1bWVudC5ib2R5O1xuICAgICAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnRvcCA9IDA7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5sZWZ0ID0gMDtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnpJbmRleCA9IC0xO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xuXG4gICAgICAgICAgICB0aGlzLmdsID0gR0wuZ2V0Q29udGV4dCh0aGlzLmNhbnZhcyk7XG4gICAgICAgICAgICB0aGlzLnJlc2l6ZU1hcCh0aGlzLmNvbnRhaW5lci5jbGllbnRXaWR0aCwgdGhpcy5jb250YWluZXIuY2xpZW50SGVpZ2h0KTtcblxuICAgICAgICAgICAgdGhpcy5pbml0TW9kZXMoKTsgLy8gVE9ETzogcmVtb3ZlIGdsIGNvbnRleHQgc3RhdGUgZnJvbSBtb2RlcywgYW5kIG1vdmUgaW5pdCB0byBjcmVhdGUgc3RlcCBhYm92ZT9cbiAgICAgICAgICAgIHRoaXMuaW5pdFNlbGVjdGlvbkJ1ZmZlcigpO1xuXG4gICAgICAgICAgICAvLyB0aGlzLnpvb21fc3RlcCA9IDAuMDI7IC8vIGZvciBmcmFjdGlvbmFsIHpvb20gdXNlciBhZGp1c3RtZW50XG4gICAgICAgICAgICB0aGlzLmxhc3RfcmVuZGVyX2NvdW50ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuaW5pdElucHV0SGFuZGxlcnMoKTtcblxuICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuU2NlbmUucHJvdG90eXBlLmluaXRNb2RlcyA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gSW5pdCBHTCBjb250ZXh0IGZvciBtb2RlcyAoY29tcGlsZXMgcHJvZ3JhbXMsIGV0Yy4pXG4gICAgZm9yICh2YXIgbSBpbiB0aGlzLm1vZGVzKSB7XG4gICAgICAgIHRoaXMubW9kZXNbbV0uaW5pdCh0aGlzLmdsKTtcbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuaW5pdFNlbGVjdGlvbkJ1ZmZlciA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gU2VsZWN0aW9uIHN0YXRlIHRyYWNraW5nXG4gICAgdGhpcy5waXhlbCA9IG5ldyBVaW50OEFycmF5KDQpO1xuICAgIHRoaXMucGl4ZWwzMiA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5waXhlbC5idWZmZXIpO1xuICAgIHRoaXMuc2VsZWN0aW9uX3BvaW50ID0gUG9pbnQoMCwgMCk7XG4gICAgdGhpcy5zZWxlY3RlZF9mZWF0dXJlID0gbnVsbDtcbiAgICB0aGlzLnNlbGVjdGlvbl9jYWxsYmFjayA9IG51bGw7XG4gICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2tfdGltZXIgPSBudWxsO1xuICAgIHRoaXMuc2VsZWN0aW9uX2ZyYW1lX2RlbGF5ID0gNTsgLy8gZGVsYXkgZnJvbSBzZWxlY3Rpb24gcmVuZGVyIHRvIGZyYW1lYnVmZmVyIHNhbXBsZSwgdG8gYXZvaWQgQ1BVL0dQVSBzeW5jIGxvY2tcbiAgICB0aGlzLnVwZGF0ZV9zZWxlY3Rpb24gPSBmYWxzZTtcblxuICAgIC8vIEZyYW1lIGJ1ZmZlciBmb3Igc2VsZWN0aW9uXG4gICAgLy8gVE9ETzogaW5pdGlhdGUgbGF6aWx5IGluIGNhc2Ugd2UgZG9uJ3QgbmVlZCB0byBkbyBhbnkgc2VsZWN0aW9uXG4gICAgdGhpcy5mYm8gPSB0aGlzLmdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgdGhpcy5mYm8pO1xuICAgIHRoaXMuZmJvX3NpemUgPSB7IHdpZHRoOiAyNTYsIGhlaWdodDogMjU2IH07IC8vIFRPRE86IG1ha2UgY29uZmlndXJhYmxlIC8gYWRhcHRpdmUgYmFzZWQgb24gY2FudmFzIHNpemVcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0KTtcblxuICAgIC8vIFRleHR1cmUgZm9yIHRoZSBGQk8gY29sb3IgYXR0YWNobWVudFxuICAgIHRoaXMuZmJvX3RleHR1cmUgPSBuZXcgR0xUZXh0dXJlKHRoaXMuZ2wsICdzZWxlY3Rpb25fZmJvJyk7XG4gICAgdGhpcy5mYm9fdGV4dHVyZS5zZXREYXRhKHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0LCBudWxsLCB7IGZpbHRlcmluZzogJ25lYXJlc3QnIH0pO1xuICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQodGhpcy5nbC5GUkFNRUJVRkZFUiwgdGhpcy5nbC5DT0xPUl9BVFRBQ0hNRU5UMCwgdGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLmZib190ZXh0dXJlLnRleHR1cmUsIDApO1xuXG4gICAgLy8gUmVuZGVyYnVmZmVyIGZvciB0aGUgRkJPIGRlcHRoIGF0dGFjaG1lbnRcbiAgICB0aGlzLmZib19kZXB0aF9yYiA9IHRoaXMuZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmZib19kZXB0aF9yYik7XG4gICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmdsLkRFUFRIX0NPTVBPTkVOVDE2LCB0aGlzLmZib19zaXplLndpZHRoLCB0aGlzLmZib19zaXplLmhlaWdodCk7XG4gICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCB0aGlzLmdsLkRFUFRIX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmZib19kZXB0aF9yYik7XG5cbiAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xufTtcblxuLy8gV2ViIHdvcmtlcnMgaGFuZGxlIGhlYXZ5IGR1dHkgdGlsZSBjb25zdHJ1Y3Rpb246IG5ldHdvcmtpbmcsIGdlb21ldHJ5IHByb2Nlc3NpbmcsIGV0Yy5cblNjZW5lLnByb3RvdHlwZS5jcmVhdGVXb3JrZXJzID0gZnVuY3Rpb24gKGNhbGxiYWNrKVxue1xuICAgIHZhciBxdWV1ZSA9IFF1ZXVlKCk7XG4gICAgdmFyIHdvcmtlcl91cmwgPSBTY2VuZS5saWJyYXJ5X2Jhc2VfdXJsICsgJ3RhbmdyYW0td29ya2VyLm1pbi5qcycgKyAnPycgKyAoK25ldyBEYXRlKCkpO1xuXG4gICAgLy8gTG9hZCAmIGluc3RhbnRpYXRlIHdvcmtlcnNcbiAgICBxdWV1ZS5kZWZlcihjb21wbGV0ZSA9PiB7XG4gICAgICAgIC8vIExvY2FsIG9iamVjdCBVUkxzIHN1cHBvcnRlZD9cbiAgICAgICAgdmFyIGNyZWF0ZU9iamVjdFVSTCA9ICh3aW5kb3cuVVJMICYmIHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKSB8fCAod2luZG93LndlYmtpdFVSTCAmJiB3aW5kb3cud2Via2l0VVJMLmNyZWF0ZU9iamVjdFVSTCk7XG4gICAgICAgIGlmIChjcmVhdGVPYmplY3RVUkwgJiYgdGhpcy5hbGxvd19jcm9zc19kb21haW5fd29ya2Vycykge1xuICAgICAgICAgICAgLy8gVG8gYWxsb3cgd29ya2VycyB0byBiZSBsb2FkZWQgY3Jvc3MtZG9tYWluLCBmaXJzdCBsb2FkIHdvcmtlciBzb3VyY2UgdmlhIFhIUiwgdGhlbiBjcmVhdGUgYSBsb2NhbCBVUkwgdmlhIGEgYmxvYlxuICAgICAgICAgICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgcmVxLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgd29ya2VyX2xvY2FsX3VybCA9IGNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbcmVxLnJlc3BvbnNlXSwgeyB0eXBlOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcgfSkpO1xuICAgICAgICAgICAgICAgIHRoaXMubWFrZVdvcmtlcnMod29ya2VyX2xvY2FsX3VybCk7XG4gICAgICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXEub3BlbignR0VUJywgd29ya2VyX3VybCwgdHJ1ZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICAgICAgICAgIHJlcS5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgICAgICAgICByZXEuc2VuZCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRyYWRpdGlvbmFsIGxvYWQgZnJvbSByZW1vdGUgVVJMXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG4gICAgICAgICAgICB0aGlzLm1ha2VXb3JrZXJzKHdvcmtlcl91cmwpO1xuICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gSW5pdCB3b3JrZXJzXG4gICAgcXVldWUuYXdhaXQoKCkgPT4ge1xuICAgICAgICB0aGlzLndvcmtlcnMuZm9yRWFjaCh3b3JrZXIgPT4ge1xuICAgICAgICAgICAgd29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLndvcmtlckJ1aWxkVGlsZUNvbXBsZXRlZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy53b3JrZXJHZXRGZWF0dXJlU2VsZWN0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgd29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLndvcmtlckxvZ01lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubmV4dF93b3JrZXIgPSAwO1xuICAgICAgICB0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemUgPSB7fTtcblxuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8vIEluc3RhbnRpYXRlIHdvcmtlcnMgZnJvbSBVUkxcblNjZW5lLnByb3RvdHlwZS5tYWtlV29ya2VycyA9IGZ1bmN0aW9uICh1cmwpXG57XG4gICAgdGhpcy53b3JrZXJzID0gW107XG4gICAgZm9yICh2YXIgdz0wOyB3IDwgdGhpcy5udW1fd29ya2VyczsgdysrKSB7XG4gICAgICAgIHRoaXMud29ya2Vycy5wdXNoKG5ldyBXb3JrZXIodXJsKSk7XG4gICAgICAgIHRoaXMud29ya2Vyc1t3XS5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICB0eXBlOiAnaW5pdCcsXG4gICAgICAgICAgICB3b3JrZXJfaWQ6IHcsXG4gICAgICAgICAgICBudW1fd29ya2VyczogdGhpcy5udW1fd29ya2Vyc1xuICAgICAgICB9KVxuICAgIH1cbn07XG5cbi8vIFBvc3QgYSBtZXNzYWdlIGFib3V0IGEgdGlsZSB0byB0aGUgbmV4dCB3b3JrZXIgKHJvdW5kIHJvYmJpbilcblNjZW5lLnByb3RvdHlwZS53b3JrZXJQb3N0TWVzc2FnZUZvclRpbGUgPSBmdW5jdGlvbiAodGlsZSwgbWVzc2FnZSlcbntcbiAgICBpZiAodGlsZS53b3JrZXIgPT0gbnVsbCkge1xuICAgICAgICB0aWxlLndvcmtlciA9IHRoaXMubmV4dF93b3JrZXI7XG4gICAgICAgIHRoaXMubmV4dF93b3JrZXIgPSAodGlsZS53b3JrZXIgKyAxKSAlIHRoaXMud29ya2Vycy5sZW5ndGg7XG4gICAgfVxuICAgIHRoaXMud29ya2Vyc1t0aWxlLndvcmtlcl0ucG9zdE1lc3NhZ2UobWVzc2FnZSk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuc2V0Q2VudGVyID0gZnVuY3Rpb24gKGxuZywgbGF0KVxue1xuICAgIHRoaXMuY2VudGVyID0geyBsbmc6IGxuZywgbGF0OiBsYXQgfTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5zdGFydFpvb20gPSBmdW5jdGlvbiAoKVxue1xuICAgIHRoaXMubGFzdF96b29tID0gdGhpcy56b29tO1xuICAgIHRoaXMuem9vbWluZyA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb20gPSAyO1xuU2NlbmUucHJvdG90eXBlLnNldFpvb20gPSBmdW5jdGlvbiAoem9vbSlcbntcbiAgICAvLyBTY2hlZHVsZSBHTCB0aWxlcyBmb3IgcmVtb3ZhbCBvbiB6b29tXG4gICAgdmFyIGJlbG93ID0gem9vbTtcbiAgICB2YXIgYWJvdmUgPSB6b29tO1xuICAgIGlmICh0aGlzLmxhc3Rfem9vbSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2NlbmUubGFzdF96b29tOiBcIiArIHRoaXMubGFzdF96b29tKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKHpvb20gLSB0aGlzLmxhc3Rfem9vbSkgPD0gdGhpcy5wcmVzZXJ2ZV90aWxlc193aXRoaW5fem9vbSkge1xuICAgICAgICAgICAgaWYgKHpvb20gPiB0aGlzLmxhc3Rfem9vbSkge1xuICAgICAgICAgICAgICAgIGJlbG93ID0gem9vbSAtIHRoaXMucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb207XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhYm92ZSA9IHpvb20gKyB0aGlzLnByZXNlcnZlX3RpbGVzX3dpdGhpbl96b29tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5sYXN0X3pvb20gPSB0aGlzLnpvb207XG4gICAgdGhpcy56b29tID0gem9vbTtcbiAgICB0aGlzLmNhcHBlZF96b29tID0gTWF0aC5taW4ofn50aGlzLnpvb20sIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgfn50aGlzLnpvb20pO1xuICAgIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5yZW1vdmVUaWxlc091dHNpZGVab29tUmFuZ2UoYmVsb3csIGFib3ZlKTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZW1vdmVUaWxlc091dHNpZGVab29tUmFuZ2UgPSBmdW5jdGlvbiAoYmVsb3csIGFib3ZlKVxue1xuICAgIGJlbG93ID0gTWF0aC5taW4oYmVsb3csIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgYmVsb3cpO1xuICAgIGFib3ZlID0gTWF0aC5taW4oYWJvdmUsIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgYWJvdmUpO1xuXG4gICAgY29uc29sZS5sb2coXCJyZW1vdmVUaWxlc091dHNpZGVab29tUmFuZ2UgW1wiICsgYmVsb3cgKyBcIiwgXCIgKyBhYm92ZSArIFwiXSlcIik7XG4gICAgdmFyIHJlbW92ZV90aWxlcyA9IFtdO1xuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNbdF07XG4gICAgICAgIGlmICh0aWxlLmNvb3Jkcy56IDwgYmVsb3cgfHwgdGlsZS5jb29yZHMueiA+IGFib3ZlKSB7XG4gICAgICAgICAgICByZW1vdmVfdGlsZXMucHVzaCh0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciByPTA7IHIgPCByZW1vdmVfdGlsZXMubGVuZ3RoOyByKyspIHtcbiAgICAgICAgdmFyIGtleSA9IHJlbW92ZV90aWxlc1tyXTtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZW1vdmVkIFwiICsga2V5ICsgXCIgKG91dHNpZGUgcmFuZ2UgW1wiICsgYmVsb3cgKyBcIiwgXCIgKyBhYm92ZSArIFwiXSlcIik7XG4gICAgICAgIHRoaXMucmVtb3ZlVGlsZShrZXkpO1xuICAgIH1cbn07XG5cblNjZW5lLnByb3RvdHlwZS5zZXRCb3VuZHMgPSBmdW5jdGlvbiAoc3csIG5lKVxue1xuICAgIHRoaXMuYm91bmRzID0ge1xuICAgICAgICBzdzogeyBsbmc6IHN3LmxuZywgbGF0OiBzdy5sYXQgfSxcbiAgICAgICAgbmU6IHsgbG5nOiBuZS5sbmcsIGxhdDogbmUubGF0IH1cbiAgICB9O1xuXG4gICAgdmFyIGJ1ZmZlciA9IDIwMCAqIEdlby5tZXRlcnNfcGVyX3BpeGVsW35+dGhpcy56b29tXTsgLy8gcGl4ZWxzIC0+IG1ldGVyc1xuICAgIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzID0ge1xuICAgICAgICBzdzogR2VvLmxhdExuZ1RvTWV0ZXJzKFBvaW50KHRoaXMuYm91bmRzLnN3LmxuZywgdGhpcy5ib3VuZHMuc3cubGF0KSksXG4gICAgICAgIG5lOiBHZW8ubGF0TG5nVG9NZXRlcnMoUG9pbnQodGhpcy5ib3VuZHMubmUubG5nLCB0aGlzLmJvdW5kcy5uZS5sYXQpKVxuICAgIH07XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueCAtPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueSAtPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueCArPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueSArPSBidWZmZXI7XG5cbiAgICB0aGlzLmNlbnRlcl9tZXRlcnMgPSBQb2ludChcbiAgICAgICAgKHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzLnN3LnggKyB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5uZS54KSAvIDIsXG4gICAgICAgICh0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5zdy55ICsgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueSkgLyAyXG4gICAgKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKFwic2V0IHNjZW5lIGJvdW5kcyB0byBcIiArIEpTT04uc3RyaW5naWZ5KHRoaXMuYm91bmRzKSk7XG5cbiAgICAvLyBNYXJrIHRpbGVzIGFzIHZpc2libGUvaW52aXNpYmxlXG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUodGhpcy50aWxlc1t0XSk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuaXNUaWxlSW5ab29tID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgcmV0dXJuIChNYXRoLm1pbih0aWxlLmNvb3Jkcy56LCB0aGlzLnRpbGVfc291cmNlLm1heF96b29tIHx8IHRpbGUuY29vcmRzLnopID09IHRoaXMuY2FwcGVkX3pvb20pO1xufTtcblxuLy8gVXBkYXRlIHZpc2liaWxpdHkgYW5kIHJldHVybiB0cnVlIGlmIGNoYW5nZWRcblNjZW5lLnByb3RvdHlwZS51cGRhdGVWaXNpYmlsaXR5Rm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIHZhciB2aXNpYmxlID0gdGlsZS52aXNpYmxlO1xuICAgIHRpbGUudmlzaWJsZSA9IHRoaXMuaXNUaWxlSW5ab29tKHRpbGUpICYmIEdlby5ib3hJbnRlcnNlY3QodGlsZS5ib3VuZHMsIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzKTtcbiAgICB0aWxlLmNlbnRlcl9kaXN0ID0gTWF0aC5hYnModGhpcy5jZW50ZXJfbWV0ZXJzLnggLSB0aWxlLm1pbi54KSArIE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy55IC0gdGlsZS5taW4ueSk7XG4gICAgcmV0dXJuICh2aXNpYmxlICE9IHRpbGUudmlzaWJsZSk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucmVzaXplTWFwID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpXG57XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG5cbiAgICB0aGlzLmNzc19zaXplID0geyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH07XG4gICAgdGhpcy5kZXZpY2Vfc2l6ZSA9IHsgd2lkdGg6IE1hdGgucm91bmQodGhpcy5jc3Nfc2l6ZS53aWR0aCAqIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvKSwgaGVpZ2h0OiBNYXRoLnJvdW5kKHRoaXMuY3NzX3NpemUuaGVpZ2h0ICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8pIH07XG5cbiAgICB0aGlzLmNhbnZhcy5zdHlsZS53aWR0aCA9IHRoaXMuY3NzX3NpemUud2lkdGggKyAncHgnO1xuICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IHRoaXMuY3NzX3NpemUuaGVpZ2h0ICsgJ3B4JztcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuZGV2aWNlX3NpemUud2lkdGg7XG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQ7XG5cbiAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlcXVlc3RSZWRyYXcgPSBmdW5jdGlvbiAoKVxue1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuLy8gRGV0ZXJtaW5lIGEgWiB2YWx1ZSB0aGF0IHdpbGwgc3RhY2sgZmVhdHVyZXMgaW4gYSBcInBhaW50ZXIncyBhbGdvcml0aG1cIiBzdHlsZSwgZmlyc3QgYnkgbGF5ZXIsIHRoZW4gYnkgZHJhdyBvcmRlciB3aXRoaW4gbGF5ZXJcbi8vIEZlYXR1cmVzIGFyZSBhc3N1bWVkIHRvIGJlIGFscmVhZHkgc29ydGVkIGluIGRlc2lyZWQgZHJhdyBvcmRlciBieSB0aGUgbGF5ZXIgcHJlLXByb2Nlc3NvclxuU2NlbmUuY2FsY3VsYXRlWiA9IGZ1bmN0aW9uIChsYXllciwgdGlsZSwgbGF5ZXJfb2Zmc2V0LCBmZWF0dXJlX29mZnNldClcbntcbiAgICAvLyB2YXIgbGF5ZXJfb2Zmc2V0ID0gbGF5ZXJfb2Zmc2V0IHx8IDA7XG4gICAgLy8gdmFyIGZlYXR1cmVfb2Zmc2V0ID0gZmVhdHVyZV9vZmZzZXQgfHwgMDtcbiAgICB2YXIgeiA9IDA7IC8vIFRPRE86IG1hZGUgdGhpcyBhIG5vLW9wIHVudGlsIHJldmlzaXRpbmcgd2hlcmUgaXQgc2hvdWxkIGxpdmUgLSBvbmUtdGltZSBjYWxjIGhlcmUsIGluIHZlcnRleCBsYXlvdXQvc2hhZGVyLCBldGMuXG4gICAgcmV0dXJuIHo7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKClcbntcbiAgICB0aGlzLmxvYWRRdWV1ZWRUaWxlcygpO1xuXG4gICAgLy8gUmVuZGVyIG9uIGRlbWFuZFxuICAgIGlmICh0aGlzLmRpcnR5ID09IGZhbHNlIHx8IHRoaXMuaW5pdGlhbGl6ZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7IC8vIHN1YmNsYXNzZXMgY2FuIHNldCB0aGlzIGJhY2sgdG8gdHJ1ZSB3aGVuIGFuaW1hdGlvbiBpcyBuZWVkZWRcblxuICAgIHRoaXMucmVuZGVyR0woKTtcblxuICAgIC8vIFJlZHJhdyBldmVyeSBmcmFtZSBpZiBhbmltYXRpbmdcbiAgICBpZiAodGhpcy5hbmltYXRlZCA9PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuZnJhbWUrKztcblxuICAgIC8vIGNvbnNvbGUubG9nKFwicmVuZGVyIG1hcFwiKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZXNldEZyYW1lID0gZnVuY3Rpb24gKClcbntcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IGZyYW1lIHN0YXRlXG4gICAgdmFyIGdsID0gdGhpcy5nbDtcbiAgICBnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMCk7XG4gICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuXG4gICAgLy8gVE9ETzogdW5uZWNlc3NhcnkgcmVwZWF0P1xuICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICBnbC5kZXB0aEZ1bmMoZ2wuTEVTUyk7XG4gICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgZ2wuY3VsbEZhY2UoZ2wuQkFDSyk7XG4gICAgLy8gZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICAvLyBnbC5ibGVuZEZ1bmMoZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZW5kZXJHTCA9IGZ1bmN0aW9uICgpXG57XG4gICAgdmFyIGdsID0gdGhpcy5nbDtcblxuICAgIHRoaXMuaW5wdXQoKTtcbiAgICB0aGlzLnJlc2V0RnJhbWUoKTtcblxuICAgIC8vIE1hcCB0cmFuc2Zvcm1zXG4gICAgdmFyIGNlbnRlciA9IEdlby5sYXRMbmdUb01ldGVycyhQb2ludCh0aGlzLmNlbnRlci5sbmcsIHRoaXMuY2VudGVyLmxhdCkpO1xuICAgIHZhciBtZXRlcnNfcGVyX3BpeGVsID0gR2VvLm1pbl96b29tX21ldGVyc19wZXJfcGl4ZWwgLyBNYXRoLnBvdygyLCB0aGlzLnpvb20pO1xuICAgIHZhciBtZXRlcl96b29tID0gUG9pbnQodGhpcy5jc3Nfc2l6ZS53aWR0aCAvIDIgKiBtZXRlcnNfcGVyX3BpeGVsLCB0aGlzLmNzc19zaXplLmhlaWdodCAvIDIgKiBtZXRlcnNfcGVyX3BpeGVsKTtcblxuICAgIC8vIE1hdHJpY2VzXG4gICAgdmFyIHRpbGVfdmlld19tYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuICAgIHZhciB0aWxlX3dvcmxkX21hdCA9IG1hdDQuY3JlYXRlKCk7XG4gICAgdmFyIG1ldGVyX3ZpZXdfbWF0ID0gbWF0NC5jcmVhdGUoKTtcblxuICAgIC8vIENvbnZlcnQgbWVyY2F0b3IgbWV0ZXJzIHRvIHNjcmVlbiBzcGFjZVxuICAgIG1hdDQuc2NhbGUobWV0ZXJfdmlld19tYXQsIG1ldGVyX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXMoMSAvIG1ldGVyX3pvb20ueCwgMSAvIG1ldGVyX3pvb20ueSwgMSAvIG1ldGVyX3pvb20ueSkpO1xuXG4gICAgLy8gUmVuZGVyYWJsZSB0aWxlIGxpc3RcbiAgICB2YXIgcmVuZGVyYWJsZV90aWxlcyA9IFtdO1xuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNbdF07XG4gICAgICAgIGlmICh0aWxlLmxvYWRlZCA9PSB0cnVlICYmIHRpbGUudmlzaWJsZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICByZW5kZXJhYmxlX3RpbGVzLnB1c2godGlsZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5yZW5kZXJhYmxlX3RpbGVzX2NvdW50ID0gcmVuZGVyYWJsZV90aWxlcy5sZW5ndGg7XG5cbiAgICAvLyBSZW5kZXIgbWFpbiBwYXNzIC0gdGlsZXMgZ3JvdXBlZCBieSByZW5kZXJpbmcgbW9kZSAoR0wgcHJvZ3JhbSlcbiAgICB2YXIgcmVuZGVyX2NvdW50ID0gMDtcbiAgICBmb3IgKHZhciBtb2RlIGluIHRoaXMubW9kZXMpIHtcbiAgICAgICAgLy8gUGVyLWZyYW1lIG1vZGUgdXBkYXRlcy9hbmltYXRpb25zXG4gICAgICAgIC8vIENhbGxlZCBldmVuIGlmIHRoZSBtb2RlIGlzbid0IHJlbmRlcmVkIGJ5IGFueSBjdXJyZW50IHRpbGVzLCBzbyB0aW1lLWJhc2VkIGFuaW1hdGlvbnMsIGV0Yy4gY29udGludWVcbiAgICAgICAgdGhpcy5tb2Rlc1ttb2RlXS51cGRhdGUoKTtcblxuICAgICAgICB2YXIgZ2xfcHJvZ3JhbSA9IHRoaXMubW9kZXNbbW9kZV0uZ2xfcHJvZ3JhbTtcbiAgICAgICAgaWYgKGdsX3Byb2dyYW0gPT0gbnVsbCB8fCBnbF9wcm9ncmFtLmNvbXBpbGVkID09IGZhbHNlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmaXJzdF9mb3JfbW9kZSA9IHRydWU7XG5cbiAgICAgICAgLy8gUmVuZGVyIHRpbGUgR0wgZ2VvbWV0cmllc1xuICAgICAgICBmb3IgKHZhciB0IGluIHJlbmRlcmFibGVfdGlsZXMpIHtcbiAgICAgICAgICAgIHZhciB0aWxlID0gcmVuZGVyYWJsZV90aWxlc1t0XTtcblxuICAgICAgICAgICAgaWYgKHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIFNldHVwIG1vZGUgaWYgZW5jb3VudGVyaW5nIGZvciBmaXJzdCB0aW1lIHRoaXMgZnJhbWVcbiAgICAgICAgICAgICAgICAvLyAobGF6eSBpbml0LCBub3QgYWxsIG1vZGVzIHdpbGwgYmUgdXNlZCBpbiBhbGwgc2NyZWVuIHZpZXdzOyBzb21lIG1vZGVzIG1pZ2h0IGJlIGRlZmluZWQgYnV0IG5ldmVyIHVzZWQpXG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0X2Zvcl9tb2RlID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RfZm9yX21vZGUgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVzZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVzW21vZGVdLnNldFVuaWZvcm1zKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogZG9uJ3Qgc2V0IHVuaWZvcm1zIHdoZW4gdGhleSBoYXZlbid0IGNoYW5nZWRcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X3Jlc29sdXRpb24nLCB0aGlzLmRldmljZV9zaXplLndpZHRoLCB0aGlzLmRldmljZV9zaXplLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9hc3BlY3QnLCB0aGlzLmRldmljZV9zaXplLndpZHRoIC8gdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQsIDEuMCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV90aW1lJywgKCgrbmV3IERhdGUoKSkgLSB0aGlzLnN0YXJ0X3RpbWUpIC8gMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9tYXBfem9vbScsIHRoaXMuem9vbSk7IC8vIE1hdGguZmxvb3IodGhpcy56b29tKSArIChNYXRoLmxvZygodGhpcy56b29tICUgMSkgKyAxKSAvIE1hdGguTE4yIC8vIHNjYWxlIGZyYWN0aW9uYWwgem9vbSBieSBsb2dcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X21hcF9jZW50ZXInLCBjZW50ZXIueCwgY2VudGVyLnkpO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbnVtX2xheWVycycsIHRoaXMubGF5ZXJzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9tZXRlcnNfcGVyX3BpeGVsJywgbWV0ZXJzX3Blcl9waXhlbCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfbWV0ZXJfdmlldycsIGZhbHNlLCBtZXRlcl92aWV3X21hdCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogY2FsYyB0aGVzZSBvbmNlIHBlciB0aWxlIChjdXJyZW50bHkgYmVpbmcgbmVlZGxlc3NseSByZS1jYWxjdWxhdGVkIHBlci10aWxlLXBlci1tb2RlKVxuXG4gICAgICAgICAgICAgICAgLy8gVGlsZSBvcmlnaW5cbiAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfdGlsZV9vcmlnaW4nLCB0aWxlLm1pbi54LCB0aWxlLm1pbi55KTtcblxuICAgICAgICAgICAgICAgIC8vIFRpbGUgdmlldyBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHZpZXcgc3BhY2UgKG1ldGVycywgcmVsYXRpdmUgdG8gY2FtZXJhKVxuICAgICAgICAgICAgICAgIG1hdDQuaWRlbnRpdHkodGlsZV92aWV3X21hdCk7XG4gICAgICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGlsZV92aWV3X21hdCwgdGlsZV92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUubWluLnggLSBjZW50ZXIueCwgdGlsZS5taW4ueSAtIGNlbnRlci55LCAwKSk7IC8vIGFkanVzdCBmb3IgdGlsZSBvcmlnaW4gJiBtYXAgY2VudGVyXG4gICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5zcGFuLnggLyBTY2VuZS50aWxlX3NjYWxlLCAtMSAqIHRpbGUuc3Bhbi55IC8gU2NlbmUudGlsZV9zY2FsZSwgMSkpOyAvLyBzY2FsZSB0aWxlIGxvY2FsIGNvb3JkcyB0byBtZXRlcnNcbiAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJ01hdHJpeDRmdicsICd1X3RpbGVfdmlldycsIGZhbHNlLCB0aWxlX3ZpZXdfbWF0KTtcblxuICAgICAgICAgICAgICAgIC8vIFRpbGUgd29ybGQgbWF0cml4IC0gdHJhbnNmb3JtIHRpbGUgc3BhY2UgaW50byB3b3JsZCBzcGFjZSAobWV0ZXJzLCBhYnNvbHV0ZSBtZXJjYXRvciBwb3NpdGlvbilcbiAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfd29ybGRfbWF0KTtcbiAgICAgICAgICAgICAgICBtYXQ0LnRyYW5zbGF0ZSh0aWxlX3dvcmxkX21hdCwgdGlsZV93b3JsZF9tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLm1pbi54LCB0aWxlLm1pbi55LCAwKSk7XG4gICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3dvcmxkX21hdCwgdGlsZV93b3JsZF9tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLnNwYW4ueCAvIFNjZW5lLnRpbGVfc2NhbGUsIC0xICogdGlsZS5zcGFuLnkgLyBTY2VuZS50aWxlX3NjYWxlLCAxKSk7IC8vIHNjYWxlIHRpbGUgbG9jYWwgY29vcmRzIHRvIG1ldGVyc1xuICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfdGlsZV93b3JsZCcsIGZhbHNlLCB0aWxlX3dvcmxkX21hdCk7XG5cbiAgICAgICAgICAgICAgICAvLyBSZW5kZXIgdGlsZVxuICAgICAgICAgICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0ucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgcmVuZGVyX2NvdW50ICs9IHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0uZ2VvbWV0cnlfY291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW5kZXIgc2VsZWN0aW9uIHBhc3MgKGlmIG5lZWRlZClcbiAgICAvLyBTbGlnaHQgdmFyaWF0aW9ucyBvbiByZW5kZXIgcGFzcyBjb2RlIGFib3ZlIC0gbW9zdGx5IGJlY2F1c2Ugd2UncmUgcmV1c2luZyB1bmlmb3JtcyBmcm9tIHRoZSBtYWluXG4gICAgLy8gbW9kZSBwcm9ncmFtLCBmb3IgdGhlIHNlbGVjdGlvbiBwcm9ncmFtXG4gICAgLy8gVE9ETzogcmVkdWNlIGR1cGxpY2F0ZWQgY29kZSB3L21haW4gcmVuZGVyIHBhc3MgYWJvdmVcbiAgICBpZiAodGhpcy51cGRhdGVfc2VsZWN0aW9uKSB7XG4gICAgICAgIHRoaXMudXBkYXRlX3NlbGVjdGlvbiA9IGZhbHNlOyAvLyByZXNldCBzZWxlY3Rpb24gY2hlY2tcblxuICAgICAgICAvLyBUT0RPOiBxdWV1ZSBjYWxsYmFjayB0aWxsIHBhbm5pbmcgaXMgb3Zlcj8gY29vcmRzIHdoZXJlIHNlbGVjdGlvbiB3YXMgcmVxdWVzdGVkIGFyZSBvdXQgb2YgZGF0ZVxuICAgICAgICBpZiAodGhpcy5wYW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTd2l0Y2ggdG8gRkJPXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGhpcy5mYm8pO1xuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCB0aGlzLmZib19zaXplLndpZHRoLCB0aGlzLmZib19zaXplLmhlaWdodCk7XG4gICAgICAgIHRoaXMucmVzZXRGcmFtZSgpO1xuXG4gICAgICAgIGZvciAobW9kZSBpbiB0aGlzLm1vZGVzKSB7XG4gICAgICAgICAgICBnbF9wcm9ncmFtID0gdGhpcy5tb2Rlc1ttb2RlXS5zZWxlY3Rpb25fZ2xfcHJvZ3JhbTtcbiAgICAgICAgICAgIGlmIChnbF9wcm9ncmFtID09IG51bGwgfHwgZ2xfcHJvZ3JhbS5jb21waWxlZCA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaXJzdF9mb3JfbW9kZSA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIFJlbmRlciB0aWxlIEdMIGdlb21ldHJpZXNcbiAgICAgICAgICAgIGZvciAodCBpbiByZW5kZXJhYmxlX3RpbGVzKSB7XG4gICAgICAgICAgICAgICAgdGlsZSA9IHJlbmRlcmFibGVfdGlsZXNbdF07XG5cbiAgICAgICAgICAgICAgICBpZiAodGlsZS5nbF9nZW9tZXRyeVttb2RlXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNldHVwIG1vZGUgaWYgZW5jb3VudGVyaW5nIGZvciBmaXJzdCB0aW1lIHRoaXMgZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0X2Zvcl9tb2RlID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0X2Zvcl9tb2RlID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udXNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVzW21vZGVdLnNldFVuaWZvcm1zKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9yZXNvbHV0aW9uJywgdGhpcy5mYm9fc2l6ZS53aWR0aCwgdGhpcy5mYm9fc2l6ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X2FzcGVjdCcsIHRoaXMuZmJvX3NpemUud2lkdGggLyB0aGlzLmZib19zaXplLmhlaWdodCwgMS4wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV90aW1lJywgKCgrbmV3IERhdGUoKSkgLSB0aGlzLnN0YXJ0X3RpbWUpIC8gMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbWFwX3pvb20nLCB0aGlzLnpvb20pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X21hcF9jZW50ZXInLCBjZW50ZXIueCwgY2VudGVyLnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X251bV9sYXllcnMnLCB0aGlzLmxheWVycy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X21ldGVyc19wZXJfcGl4ZWwnLCBtZXRlcnNfcGVyX3BpeGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfbWV0ZXJfdmlldycsIGZhbHNlLCBtZXRlcl92aWV3X21hdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBUaWxlIG9yaWdpblxuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfdGlsZV9vcmlnaW4nLCB0aWxlLm1pbi54LCB0aWxlLm1pbi55KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaWxlIHZpZXcgbWF0cml4IC0gdHJhbnNmb3JtIHRpbGUgc3BhY2UgaW50byB2aWV3IHNwYWNlIChtZXRlcnMsIHJlbGF0aXZlIHRvIGNhbWVyYSlcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5pZGVudGl0eSh0aWxlX3ZpZXdfbWF0KTtcbiAgICAgICAgICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGlsZV92aWV3X21hdCwgdGlsZV92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUubWluLnggLSBjZW50ZXIueCwgdGlsZS5taW4ueSAtIGNlbnRlci55LCAwKSk7IC8vIGFkanVzdCBmb3IgdGlsZSBvcmlnaW4gJiBtYXAgY2VudGVyXG4gICAgICAgICAgICAgICAgICAgIG1hdDQuc2NhbGUodGlsZV92aWV3X21hdCwgdGlsZV92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUuc3Bhbi54IC8gU2NlbmUudGlsZV9zY2FsZSwgLTEgKiB0aWxlLnNwYW4ueSAvIFNjZW5lLnRpbGVfc2NhbGUsIDEpKTsgLy8gc2NhbGUgdGlsZSBsb2NhbCBjb29yZHMgdG8gbWV0ZXJzXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfdGlsZV92aWV3JywgZmFsc2UsIHRpbGVfdmlld19tYXQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbGUgd29ybGQgbWF0cml4IC0gdHJhbnNmb3JtIHRpbGUgc3BhY2UgaW50byB3b3JsZCBzcGFjZSAobWV0ZXJzLCBhYnNvbHV0ZSBtZXJjYXRvciBwb3NpdGlvbilcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5pZGVudGl0eSh0aWxlX3dvcmxkX21hdCk7XG4gICAgICAgICAgICAgICAgICAgIG1hdDQudHJhbnNsYXRlKHRpbGVfd29ybGRfbWF0LCB0aWxlX3dvcmxkX21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUubWluLngsIHRpbGUubWluLnksIDApKTtcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3dvcmxkX21hdCwgdGlsZV93b3JsZF9tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLnNwYW4ueCAvIFNjZW5lLnRpbGVfc2NhbGUsIC0xICogdGlsZS5zcGFuLnkgLyBTY2VuZS50aWxlX3NjYWxlLCAxKSk7IC8vIHNjYWxlIHRpbGUgbG9jYWwgY29vcmRzIHRvIG1ldGVyc1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJ01hdHJpeDRmdicsICd1X3RpbGVfd29ybGQnLCBmYWxzZSwgdGlsZV93b3JsZF9tYXQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbmRlciB0aWxlXG4gICAgICAgICAgICAgICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0ucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVsYXkgcmVhZGluZyB0aGUgcGl4ZWwgcmVzdWx0IGZyb20gdGhlIHNlbGVjdGlvbiBidWZmZXIgdG8gYXZvaWQgQ1BVL0dQVSBzeW5jIGxvY2suXG4gICAgICAgIC8vIENhbGxpbmcgcmVhZFBpeGVscyBzeW5jaHJvbm91c2x5IGNhdXNlZCBhIG1hc3NpdmUgcGVyZm9ybWFuY2UgaGl0LCBwcmVzdW1hYmx5IHNpbmNlIGl0XG4gICAgICAgIC8vIGZvcmNlZCB0aGlzIGZ1bmN0aW9uIHRvIHdhaXQgZm9yIHRoZSBHUFUgdG8gZmluaXNoIHJlbmRlcmluZyBhbmQgcmV0cmlldmUgdGhlIHRleHR1cmUgY29udGVudHMuXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGlvbl9jYWxsYmFja190aW1lciAhPSBudWxsKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5zZWxlY3Rpb25fY2FsbGJhY2tfdGltZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrX3RpbWVyID0gc2V0VGltZW91dChcbiAgICAgICAgICAgIHRoaXMucmVhZFNlbGVjdGlvbkJ1ZmZlci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25fZnJhbWVfZGVsYXlcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBSZXNldCB0byBzY3JlZW4gYnVmZmVyXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgIH1cblxuICAgIGlmIChyZW5kZXJfY291bnQgIT0gdGhpcy5sYXN0X3JlbmRlcl9jb3VudCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlbmRlcmVkIFwiICsgcmVuZGVyX2NvdW50ICsgXCIgcHJpbWl0aXZlc1wiKTtcbiAgICB9XG4gICAgdGhpcy5sYXN0X3JlbmRlcl9jb3VudCA9IHJlbmRlcl9jb3VudDtcblxuICAgIHJldHVybiB0cnVlO1xufTtcblxuLy8gUmVxdWVzdCBmZWF0dXJlIHNlbGVjdGlvblxuLy8gUnVucyBhc3luY2hyb25vdXNseSwgc2NoZWR1bGVzIHNlbGVjdGlvbiBidWZmZXIgdG8gYmUgdXBkYXRlZFxuU2NlbmUucHJvdG90eXBlLmdldEZlYXR1cmVBdCA9IGZ1bmN0aW9uIChwaXhlbCwgY2FsbGJhY2spXG57XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBxdWV1ZSBjYWxsYmFja3Mgd2hpbGUgc3RpbGwgcGVyZm9ybWluZyBvbmx5IG9uZSBzZWxlY3Rpb24gcmVuZGVyIHBhc3Mgd2l0aGluIFggdGltZSBpbnRlcnZhbD9cbiAgICBpZiAodGhpcy51cGRhdGVfc2VsZWN0aW9uID09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZWN0aW9uX3BvaW50ID0gUG9pbnQoXG4gICAgICAgIHBpeGVsLnggKiB0aGlzLmRldmljZV9waXhlbF9yYXRpbyxcbiAgICAgICAgdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQgLSAocGl4ZWwueSAqIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvKVxuICAgICk7XG4gICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLnVwZGF0ZV9zZWxlY3Rpb24gPSB0cnVlO1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlYWRTZWxlY3Rpb25CdWZmZXIgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBnbCA9IHRoaXMuZ2w7XG5cbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHRoaXMuZmJvKTtcblxuICAgIC8vIENoZWNrIHNlbGVjdGlvbiBtYXAgYWdhaW5zdCBGQk9cbiAgICBnbC5yZWFkUGl4ZWxzKFxuICAgICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnggKiB0aGlzLmZib19zaXplLndpZHRoIC8gdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCksXG4gICAgICAgIE1hdGguZmxvb3IodGhpcy5zZWxlY3Rpb25fcG9pbnQueSAqIHRoaXMuZmJvX3NpemUuaGVpZ2h0IC8gdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQpLFxuICAgICAgICAxLCAxLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCB0aGlzLnBpeGVsKTtcbiAgICB2YXIgZmVhdHVyZV9rZXkgPSAodGhpcy5waXhlbFswXSArICh0aGlzLnBpeGVsWzFdIDw8IDgpICsgKHRoaXMucGl4ZWxbMl0gPDwgMTYpICsgKHRoaXMucGl4ZWxbM10gPDwgMjQpKSA+Pj4gMDtcblxuICAgIC8vIGNvbnNvbGUubG9nKFxuICAgIC8vICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnggKiB0aGlzLmZib19zaXplLndpZHRoIC8gdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCkgKyBcIiwgXCIgK1xuICAgIC8vICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnkgKiB0aGlzLmZib19zaXplLmhlaWdodCAvIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0KSArIFwiOiAoXCIgK1xuICAgIC8vICAgICB0aGlzLnBpeGVsWzBdICsgXCIsIFwiICsgdGhpcy5waXhlbFsxXSArIFwiLCBcIiArIHRoaXMucGl4ZWxbMl0gKyBcIiwgXCIgKyB0aGlzLnBpeGVsWzNdICsgXCIpXCIpO1xuXG4gICAgLy8gSWYgZmVhdHVyZSBmb3VuZCwgYXNrIGFwcHJvcHJpYXRlIHdlYiB3b3JrZXIgdG8gbG9va3VwIGZlYXR1cmVcbiAgICB2YXIgd29ya2VyX2lkID0gdGhpcy5waXhlbFszXTtcbiAgICBpZiAod29ya2VyX2lkICE9IDI1NSkgeyAvLyAyNTUgaW5kaWNhdGVzIGFuIGVtcHR5IHNlbGVjdGlvbiBidWZmZXIgcGl4ZWxcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJ3b3JrZXJfaWQ6IFwiICsgd29ya2VyX2lkKTtcbiAgICAgICAgaWYgKHRoaXMud29ya2Vyc1t3b3JrZXJfaWRdICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG9zdCBtZXNzYWdlXCIpO1xuICAgICAgICAgICAgdGhpcy53b3JrZXJzW3dvcmtlcl9pZF0ucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdnZXRGZWF0dXJlU2VsZWN0aW9uJyxcbiAgICAgICAgICAgICAgICBrZXk6IGZlYXR1cmVfa2V5XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG59O1xuXG4vLyBDYWxsZWQgb24gbWFpbiB0aHJlYWQgd2hlbiBhIHdlYiB3b3JrZXIgZmluZHMgYSBmZWF0dXJlIGluIHRoZSBzZWxlY3Rpb24gYnVmZmVyXG5TY2VuZS5wcm90b3R5cGUud29ya2VyR2V0RmVhdHVyZVNlbGVjdGlvbiA9IGZ1bmN0aW9uIChldmVudClcbntcbiAgICBpZiAoZXZlbnQuZGF0YS50eXBlICE9ICdnZXRGZWF0dXJlU2VsZWN0aW9uJykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGZlYXR1cmUgPSBldmVudC5kYXRhLmZlYXR1cmU7XG4gICAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgICBpZiAoKGZlYXR1cmUgIT0gbnVsbCAmJiB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUgPT0gbnVsbCkgfHxcbiAgICAgICAgKGZlYXR1cmUgPT0gbnVsbCAmJiB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUgIT0gbnVsbCkgfHxcbiAgICAgICAgKGZlYXR1cmUgIT0gbnVsbCAmJiB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUgIT0gbnVsbCAmJiBmZWF0dXJlLmlkICE9IHRoaXMuc2VsZWN0ZWRfZmVhdHVyZS5pZCkpIHtcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5zZWxlY3RlZF9mZWF0dXJlID0gZmVhdHVyZTtcblxuICAgIGlmICh0eXBlb2YgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnNlbGVjdGlvbl9jYWxsYmFjayh7IGZlYXR1cmU6IHRoaXMuc2VsZWN0ZWRfZmVhdHVyZSwgY2hhbmdlZDogY2hhbmdlZCB9KTtcbiAgICB9XG59O1xuXG4vLyBRdWV1ZSBhIHRpbGUgZm9yIGxvYWRcblNjZW5lLnByb3RvdHlwZS5sb2FkVGlsZSA9IGZ1bmN0aW9uIChjb29yZHMsIGRpdiwgY2FsbGJhY2spXG57XG4gICAgdGhpcy5xdWV1ZWRfdGlsZXNbdGhpcy5xdWV1ZWRfdGlsZXMubGVuZ3RoXSA9IGFyZ3VtZW50cztcbn07XG5cbi8vIExvYWQgYWxsIHF1ZXVlZCB0aWxlc1xuU2NlbmUucHJvdG90eXBlLmxvYWRRdWV1ZWRUaWxlcyA9IGZ1bmN0aW9uICgpXG57XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5xdWV1ZWRfdGlsZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAodmFyIHQ9MDsgdCA8IHRoaXMucXVldWVkX3RpbGVzLmxlbmd0aDsgdCsrKSB7XG4gICAgICAgIHRoaXMuX2xvYWRUaWxlLmFwcGx5KHRoaXMsIHRoaXMucXVldWVkX3RpbGVzW3RdKTtcbiAgICB9XG5cbiAgICB0aGlzLnF1ZXVlZF90aWxlcyA9IFtdO1xufTtcblxuLy8gTG9hZCBhIHNpbmdsZSB0aWxlXG5TY2VuZS5wcm90b3R5cGUuX2xvYWRUaWxlID0gZnVuY3Rpb24gKGNvb3JkcywgZGl2LCBjYWxsYmFjaylcbntcbiAgICAvLyBPdmVyem9vbT9cbiAgICBpZiAoY29vcmRzLnogPiB0aGlzLnRpbGVfc291cmNlLm1heF96b29tKSB7XG4gICAgICAgIHZhciB6Z2FwID0gY29vcmRzLnogLSB0aGlzLnRpbGVfc291cmNlLm1heF96b29tO1xuICAgICAgICAvLyB2YXIgb3JpZ2luYWxfdGlsZSA9IFtjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56XS5qb2luKCcvJyk7XG4gICAgICAgIGNvb3Jkcy54ID0gfn4oY29vcmRzLnggLyBNYXRoLnBvdygyLCB6Z2FwKSk7XG4gICAgICAgIGNvb3Jkcy55ID0gfn4oY29vcmRzLnkgLyBNYXRoLnBvdygyLCB6Z2FwKSk7XG4gICAgICAgIGNvb3Jkcy5kaXNwbGF5X3ogPSBjb29yZHMuejsgLy8geiB3aXRob3V0IG92ZXJ6b29tXG4gICAgICAgIGNvb3Jkcy56IC09IHpnYXA7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiYWRqdXN0ZWQgZm9yIG92ZXJ6b29tLCB0aWxlIFwiICsgb3JpZ2luYWxfdGlsZSArIFwiIC0+IFwiICsgW2Nvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnpdLmpvaW4oJy8nKSk7XG4gICAgfVxuXG4gICAgdGhpcy50cmFja1RpbGVTZXRMb2FkU3RhcnQoKTtcblxuICAgIHZhciBrZXkgPSBbY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMuel0uam9pbignLycpO1xuXG4gICAgLy8gQWxyZWFkeSBsb2FkaW5nL2xvYWRlZD9cbiAgICBpZiAodGhpcy50aWxlc1trZXldKSB7XG4gICAgICAgIC8vIGlmICh0aGlzLnRpbGVzW2tleV0ubG9hZGVkID09IHRydWUpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwidXNlIGxvYWRlZCB0aWxlIFwiICsga2V5ICsgXCIgZnJvbSBjYWNoZVwiKTtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBpZiAodGhpcy50aWxlc1trZXldLmxvYWRpbmcgPT0gdHJ1ZSkge1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJhbHJlYWR5IGxvYWRpbmcgdGlsZSBcIiArIGtleSArIFwiLCBza2lwXCIpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBkaXYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNba2V5XSA9IHt9O1xuICAgIHRpbGUua2V5ID0ga2V5O1xuICAgIHRpbGUuY29vcmRzID0gY29vcmRzO1xuICAgIHRpbGUubWluID0gR2VvLm1ldGVyc0ZvclRpbGUodGlsZS5jb29yZHMpO1xuICAgIHRpbGUubWF4ID0gR2VvLm1ldGVyc0ZvclRpbGUoeyB4OiB0aWxlLmNvb3Jkcy54ICsgMSwgeTogdGlsZS5jb29yZHMueSArIDEsIHo6IHRpbGUuY29vcmRzLnogfSk7XG4gICAgdGlsZS5zcGFuID0geyB4OiAodGlsZS5tYXgueCAtIHRpbGUubWluLngpLCB5OiAodGlsZS5tYXgueSAtIHRpbGUubWluLnkpIH07XG4gICAgdGlsZS5ib3VuZHMgPSB7IHN3OiB7IHg6IHRpbGUubWluLngsIHk6IHRpbGUubWF4LnkgfSwgbmU6IHsgeDogdGlsZS5tYXgueCwgeTogdGlsZS5taW4ueSB9IH07XG4gICAgdGlsZS5kZWJ1ZyA9IHt9O1xuICAgIHRpbGUubG9hZGluZyA9IHRydWU7XG4gICAgdGlsZS5sb2FkZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuYnVpbGRUaWxlKHRpbGUua2V5KTtcbiAgICB0aGlzLnVwZGF0ZVRpbGVFbGVtZW50KHRpbGUsIGRpdik7XG4gICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5Rm9yVGlsZSh0aWxlKTtcblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhudWxsLCBkaXYpO1xuICAgIH1cbn07XG5cbi8vIFJlYnVpbGQgYWxsIHRpbGVzXG4vLyBUT0RPOiBhbHNvIHJlYnVpbGQgbW9kZXM/IChkZXRlY3QgaWYgY2hhbmdlZClcblNjZW5lLnByb3RvdHlwZS5yZWJ1aWxkVGlsZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGxheWVycyAmIHN0eWxlc1xuICAgIHRoaXMubGF5ZXJzX3NlcmlhbGl6ZWQgPSBVdGlscy5zZXJpYWxpemVXaXRoRnVuY3Rpb25zKHRoaXMubGF5ZXJzKTtcbiAgICB0aGlzLnN0eWxlc19zZXJpYWxpemVkID0gVXRpbHMuc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyh0aGlzLnN0eWxlcyk7XG4gICAgdGhpcy5zZWxlY3Rpb25fbWFwID0ge307XG5cbiAgICAvLyBUZWxsIHdvcmtlcnMgd2UncmUgYWJvdXQgdG8gcmVidWlsZCAoc28gdGhleSBjYW4gcmVmcmVzaCBzdHlsZXMsIGV0Yy4pXG4gICAgdGhpcy53b3JrZXJzLmZvckVhY2god29ya2VyID0+IHtcbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6ICdwcmVwYXJlRm9yUmVidWlsZCcsXG4gICAgICAgICAgICBsYXllcnM6IHRoaXMubGF5ZXJzX3NlcmlhbGl6ZWQsXG4gICAgICAgICAgICBzdHlsZXM6IHRoaXMuc3R5bGVzX3NlcmlhbGl6ZWRcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBSZWJ1aWxkIHZpc2libGUgdGlsZXMgZmlyc3QsIGZyb20gY2VudGVyIG91dFxuICAgIC8vIGNvbnNvbGUubG9nKFwiZmluZCB2aXNpYmxlXCIpO1xuICAgIHZhciB2aXNpYmxlID0gW10sIGludmlzaWJsZSA9IFtdO1xuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICBpZiAodGhpcy50aWxlc1t0XS52aXNpYmxlID09IHRydWUpIHtcbiAgICAgICAgICAgIHZpc2libGUucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGludmlzaWJsZS5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5sb2coXCJzb3J0IHZpc2libGUgZGlzdGFuY2VcIik7XG4gICAgdmlzaWJsZS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIC8vIHZhciBhZCA9IE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy54IC0gdGhpcy50aWxlc1tiXS5taW4ueCkgKyBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueSAtIHRoaXMudGlsZXNbYl0ubWluLnkpO1xuICAgICAgICAvLyB2YXIgYmQgPSBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueCAtIHRoaXMudGlsZXNbYV0ubWluLngpICsgTWF0aC5hYnModGhpcy5jZW50ZXJfbWV0ZXJzLnkgLSB0aGlzLnRpbGVzW2FdLm1pbi55KTtcbiAgICAgICAgdmFyIGFkID0gdGhpcy50aWxlc1thXS5jZW50ZXJfZGlzdDtcbiAgICAgICAgdmFyIGJkID0gdGhpcy50aWxlc1tiXS5jZW50ZXJfZGlzdDtcbiAgICAgICAgcmV0dXJuIChiZCA+IGFkID8gLTEgOiAoYmQgPT0gYWQgPyAwIDogMSkpO1xuICAgIH0pO1xuXG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZCB2aXNpYmxlXCIpO1xuICAgIGZvciAodmFyIHQgaW4gdmlzaWJsZSkge1xuICAgICAgICB0aGlzLmJ1aWxkVGlsZSh2aXNpYmxlW3RdKTtcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkIGludmlzaWJsZVwiKTtcbiAgICBmb3IgKHZhciB0IGluIGludmlzaWJsZSkge1xuICAgICAgICAvLyBLZWVwIHRpbGVzIGluIGN1cnJlbnQgem9vbSBidXQgb3V0IG9mIHZpc2libGUgcmFuZ2UsIGJ1dCByZWJ1aWxkIGFzIGxvd2VyIHByaW9yaXR5XG4gICAgICAgIGlmICh0aGlzLmlzVGlsZUluWm9vbSh0aGlzLnRpbGVzW2ludmlzaWJsZVt0XV0pID09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuYnVpbGRUaWxlKGludmlzaWJsZVt0XSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRHJvcCB0aWxlcyBvdXRzaWRlIGN1cnJlbnQgem9vbVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlVGlsZShpbnZpc2libGVbdF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVBY3RpdmVNb2RlcygpO1xuICAgIHRoaXMucmVzZXRUaW1lKCk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuYnVpbGRUaWxlID0gZnVuY3Rpb24oa2V5KVxue1xuICAgIHZhciB0aWxlID0gdGhpcy50aWxlc1trZXldO1xuXG4gICAgdGhpcy53b3JrZXJQb3N0TWVzc2FnZUZvclRpbGUodGlsZSwge1xuICAgICAgICB0eXBlOiAnYnVpbGRUaWxlJyxcbiAgICAgICAgdGlsZToge1xuICAgICAgICAgICAga2V5OiB0aWxlLmtleSxcbiAgICAgICAgICAgIGNvb3JkczogdGlsZS5jb29yZHMsIC8vIHVzZWQgYnkgc3R5bGUgaGVscGVyc1xuICAgICAgICAgICAgbWluOiB0aWxlLm1pbiwgLy8gdXNlZCBieSBUaWxlU291cmNlIHRvIHNjYWxlIHRpbGUgdG8gbG9jYWwgZXh0ZW50c1xuICAgICAgICAgICAgbWF4OiB0aWxlLm1heCwgLy8gdXNlZCBieSBUaWxlU291cmNlIHRvIHNjYWxlIHRpbGUgdG8gbG9jYWwgZXh0ZW50c1xuICAgICAgICAgICAgZGVidWc6IHRpbGUuZGVidWdcbiAgICAgICAgfSxcbiAgICAgICAgdGlsZV9zb3VyY2U6IHRoaXMudGlsZV9zb3VyY2UsXG4gICAgICAgIGxheWVyczogdGhpcy5sYXllcnNfc2VyaWFsaXplZCxcbiAgICAgICAgc3R5bGVzOiB0aGlzLnN0eWxlc19zZXJpYWxpemVkXG4gICAgfSk7XG59O1xuXG4vLyBQcm9jZXNzIGdlb21ldHJ5IGZvciB0aWxlIC0gY2FsbGVkIGJ5IHdlYiB3b3JrZXJcbi8vIFJldHVybnMgYSBzZXQgb2YgdGlsZSBrZXlzIHRoYXQgc2hvdWxkIGJlIHNlbnQgdG8gdGhlIG1haW4gdGhyZWFkIChzbyB0aGF0IHdlIGNhbiBtaW5pbWl6ZSBkYXRhIGV4Y2hhbmdlIGJldHdlZW4gd29ya2VyIGFuZCBtYWluIHRocmVhZClcblNjZW5lLmFkZFRpbGUgPSBmdW5jdGlvbiAodGlsZSwgbGF5ZXJzLCBzdHlsZXMsIG1vZGVzKVxue1xuICAgIHZhciBsYXllciwgc3R5bGUsIGZlYXR1cmUsIHosIG1vZGU7XG4gICAgdmFyIHZlcnRleF9kYXRhID0ge307XG5cbiAgICAvLyBKb2luIGxpbmUgdGVzdCBwYXR0ZXJuXG4gICAgLy8gaWYgKFNjZW5lLmRlYnVnKSB7XG4gICAgLy8gICAgIHRpbGUubGF5ZXJzWydyb2FkcyddLmZlYXR1cmVzLnB1c2goU2NlbmUuYnVpbGRaaWd6YWdMaW5lVGVzdFBhdHRlcm4oKSk7XG4gICAgLy8gfVxuXG4gICAgLy8gQnVpbGQgcmF3IGdlb21ldHJ5IGFycmF5c1xuICAgIHRpbGUuZGVidWcuZmVhdHVyZXMgPSAwO1xuICAgIGZvciAodmFyIGxheWVyX251bT0wOyBsYXllcl9udW0gPCBsYXllcnMubGVuZ3RoOyBsYXllcl9udW0rKykge1xuICAgICAgICBsYXllciA9IGxheWVyc1tsYXllcl9udW1dO1xuXG4gICAgICAgIC8vIFNraXAgbGF5ZXJzIHdpdGggbm8gc3R5bGVzIGRlZmluZWQsIG9yIGxheWVycyBzZXQgdG8gbm90IGJlIHZpc2libGVcbiAgICAgICAgaWYgKHN0eWxlcy5sYXllcnNbbGF5ZXIubmFtZV0gPT0gbnVsbCB8fCBzdHlsZXMubGF5ZXJzW2xheWVyLm5hbWVdLnZpc2libGUgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRpbGUubGF5ZXJzW2xheWVyLm5hbWVdICE9IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBudW1fZmVhdHVyZXMgPSB0aWxlLmxheWVyc1tsYXllci5uYW1lXS5mZWF0dXJlcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIC8vIFJlbmRlcmluZyByZXZlcnNlIG9yZGVyIGFrYSB0b3AgdG8gYm90dG9tXG4gICAgICAgICAgICBmb3IgKHZhciBmID0gbnVtX2ZlYXR1cmVzLTE7IGYgPj0gMDsgZi0tKSB7XG4gICAgICAgICAgICAgICAgZmVhdHVyZSA9IHRpbGUubGF5ZXJzW2xheWVyLm5hbWVdLmZlYXR1cmVzW2ZdO1xuICAgICAgICAgICAgICAgIHN0eWxlID0gU3R5bGUucGFyc2VTdHlsZUZvckZlYXR1cmUoZmVhdHVyZSwgbGF5ZXIubmFtZSwgc3R5bGVzLmxheWVyc1tsYXllci5uYW1lXSwgdGlsZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBTa2lwIGZlYXR1cmU/XG4gICAgICAgICAgICAgICAgaWYgKHN0eWxlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3R5bGUubGF5ZXJfbnVtID0gbGF5ZXJfbnVtO1xuICAgICAgICAgICAgICAgIHN0eWxlLnogPSBTY2VuZS5jYWxjdWxhdGVaKGxheWVyLCB0aWxlKSArIHN0eWxlLno7XG5cbiAgICAgICAgICAgICAgICB2YXIgcG9pbnRzID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbGluZXMgPSBudWxsLFxuICAgICAgICAgICAgICAgICAgICBwb2x5Z29ucyA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJykge1xuICAgICAgICAgICAgICAgICAgICBwb2x5Z29ucyA9IFtmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvbHlnb25zID0gZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IFtmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdNdWx0aUxpbmVTdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzID0gZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdQb2ludCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRzID0gW2ZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvaW50cyA9IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRmlyc3QgZmVhdHVyZSBpbiB0aGlzIHJlbmRlciBtb2RlP1xuICAgICAgICAgICAgICAgIG1vZGUgPSBzdHlsZS5tb2RlLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKHZlcnRleF9kYXRhW21vZGVdID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4X2RhdGFbbW9kZV0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocG9seWdvbnMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBtb2Rlc1ttb2RlXS5idWlsZFBvbHlnb25zKHBvbHlnb25zLCBzdHlsZSwgdmVydGV4X2RhdGFbbW9kZV0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsaW5lcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVzW21vZGVdLmJ1aWxkTGluZXMobGluZXMsIHN0eWxlLCB2ZXJ0ZXhfZGF0YVttb2RlXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBvaW50cyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVzW21vZGVdLmJ1aWxkUG9pbnRzKHBvaW50cywgc3R5bGUsIHZlcnRleF9kYXRhW21vZGVdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aWxlLmRlYnVnLmZlYXR1cmVzKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aWxlLnZlcnRleF9kYXRhID0ge307XG4gICAgZm9yICh2YXIgcyBpbiB2ZXJ0ZXhfZGF0YSkge1xuICAgICAgICB0aWxlLnZlcnRleF9kYXRhW3NdID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXhfZGF0YVtzXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmVydGV4X2RhdGE6IHRydWVcbiAgICB9O1xufTtcblxuLy8gQ2FsbGVkIG9uIG1haW4gdGhyZWFkIHdoZW4gYSB3ZWIgd29ya2VyIGNvbXBsZXRlcyBwcm9jZXNzaW5nIGZvciBhIHNpbmdsZSB0aWxlIChpbml0aWFsIGxvYWQsIG9yIHJlYnVpbGQpXG5TY2VuZS5wcm90b3R5cGUud29ya2VyQnVpbGRUaWxlQ29tcGxldGVkID0gZnVuY3Rpb24gKGV2ZW50KVxue1xuICAgIGlmIChldmVudC5kYXRhLnR5cGUgIT0gJ2J1aWxkVGlsZUNvbXBsZXRlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRyYWNrIHNlbGVjdGlvbiBtYXAgc2l6ZSAoZm9yIHN0YXRzL2RlYnVnKSAtIHVwZGF0ZSBwZXIgd29ya2VyIGFuZCBzdW0gYWNyb3NzIHdvcmtlcnNcbiAgICB0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemVbZXZlbnQuZGF0YS53b3JrZXJfaWRdID0gZXZlbnQuZGF0YS5zZWxlY3Rpb25fbWFwX3NpemU7XG4gICAgdGhpcy5zZWxlY3Rpb25fbWFwX3NpemUgPSAwO1xuICAgIE9iamVjdFxuICAgICAgICAua2V5cyh0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemUpXG4gICAgICAgIC5mb3JFYWNoKHdvcmtlciA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGlvbl9tYXBfc2l6ZSArPSB0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemVbd29ya2VyXTtcbiAgICAgICAgfSk7XG4gICAgY29uc29sZS5sb2coXCJzZWxlY3Rpb24gbWFwOiBcIiArIHRoaXMuc2VsZWN0aW9uX21hcF9zaXplICsgXCIgZmVhdHVyZXNcIik7XG5cbiAgICB2YXIgdGlsZSA9IGV2ZW50LmRhdGEudGlsZTtcblxuICAgIC8vIFJlbW92ZWQgdGhpcyB0aWxlIGR1cmluZyBsb2FkP1xuICAgIGlmICh0aGlzLnRpbGVzW3RpbGUua2V5XSA9PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGlzY2FyZGVkIHRpbGUgXCIgKyB0aWxlLmtleSArIFwiIGluIFNjZW5lLnRpbGVXb3JrZXJDb21wbGV0ZWQgYmVjYXVzZSBwcmV2aW91c2x5IHJlbW92ZWRcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGlsZSB3aXRoIHByb3BlcnRpZXMgZnJvbSB3b3JrZXJcbiAgICB0aWxlID0gdGhpcy5tZXJnZVRpbGUodGlsZS5rZXksIHRpbGUpO1xuXG4gICAgdGhpcy5idWlsZEdMR2VvbWV0cnkodGlsZSk7XG5cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLnRyYWNrVGlsZVNldExvYWRFbmQoKTtcbiAgICB0aGlzLnByaW50RGVidWdGb3JUaWxlKHRpbGUpO1xufTtcblxuLy8gQ2FsbGVkIG9uIG1haW4gdGhyZWFkIHdoZW4gYSB3ZWIgd29ya2VyIGNvbXBsZXRlcyBwcm9jZXNzaW5nIGZvciBhIHNpbmdsZSB0aWxlXG5TY2VuZS5wcm90b3R5cGUuYnVpbGRHTEdlb21ldHJ5ID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgdmFyIHZlcnRleF9kYXRhID0gdGlsZS52ZXJ0ZXhfZGF0YTtcblxuICAgIC8vIENsZWFudXAgZXhpc3RpbmcgR0wgZ2VvbWV0cnkgb2JqZWN0c1xuICAgIHRoaXMuZnJlZVRpbGVSZXNvdXJjZXModGlsZSk7XG4gICAgdGlsZS5nbF9nZW9tZXRyeSA9IHt9O1xuXG4gICAgLy8gQ3JlYXRlIEdMIGdlb21ldHJ5IG9iamVjdHNcbiAgICBmb3IgKHZhciBzIGluIHZlcnRleF9kYXRhKSB7XG4gICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbc10gPSB0aGlzLm1vZGVzW3NdLm1ha2VHTEdlb21ldHJ5KHZlcnRleF9kYXRhW3NdKTtcbiAgICB9XG5cbiAgICB0aWxlLmRlYnVnLmdlb21ldHJpZXMgPSAwO1xuICAgIHRpbGUuZGVidWcuYnVmZmVyX3NpemUgPSAwO1xuICAgIGZvciAodmFyIHAgaW4gdGlsZS5nbF9nZW9tZXRyeSkge1xuICAgICAgICB0aWxlLmRlYnVnLmdlb21ldHJpZXMgKz0gdGlsZS5nbF9nZW9tZXRyeVtwXS5nZW9tZXRyeV9jb3VudDtcbiAgICAgICAgdGlsZS5kZWJ1Zy5idWZmZXJfc2l6ZSArPSB0aWxlLmdsX2dlb21ldHJ5W3BdLnZlcnRleF9kYXRhLmJ5dGVMZW5ndGg7XG4gICAgfVxuICAgIHRpbGUuZGVidWcuZ2VvbV9yYXRpbyA9ICh0aWxlLmRlYnVnLmdlb21ldHJpZXMgLyB0aWxlLmRlYnVnLmZlYXR1cmVzKS50b0ZpeGVkKDEpO1xuXG4gICAgZGVsZXRlIHRpbGUudmVydGV4X2RhdGE7IC8vIFRPRE86IG1pZ2h0IHdhbnQgdG8gcHJlc2VydmUgdGhpcyBmb3IgcmVidWlsZGluZyBnZW9tZXRyaWVzIHdoZW4gc3R5bGVzL2V0Yy4gY2hhbmdlP1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlbW92ZVRpbGUgPSBmdW5jdGlvbiAoa2V5KVxue1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJ0aWxlIHVubG9hZCBmb3IgXCIgKyBrZXkpO1xuXG4gICAgaWYgKHRoaXMuem9vbWluZyA9PSB0cnVlKSB7XG4gICAgICAgIHJldHVybjsgLy8gc2hvcnQgY2lyY3VpdCB0aWxlIHJlbW92YWwsIHdpbGwgc3dlZXAgb3V0IHRpbGVzIGJ5IHpvb20gbGV2ZWwgd2hlbiB6b29tIGVuZHNcbiAgICB9XG5cbiAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNba2V5XTtcblxuICAgIGlmICh0aWxlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5mcmVlVGlsZVJlc291cmNlcyh0aWxlKTtcblxuICAgICAgICAvLyBXZWIgd29ya2VyIHdpbGwgY2FuY2VsIFhIUiByZXF1ZXN0c1xuICAgICAgICB0aGlzLndvcmtlclBvc3RNZXNzYWdlRm9yVGlsZSh0aWxlLCB7XG4gICAgICAgICAgICB0eXBlOiAncmVtb3ZlVGlsZScsXG4gICAgICAgICAgICBrZXk6IHRpbGUua2V5XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRlbGV0ZSB0aGlzLnRpbGVzW2tleV07XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG4vLyBGcmVlIGFueSBHTCAvIG93bmVkIHJlc291cmNlc1xuU2NlbmUucHJvdG90eXBlLmZyZWVUaWxlUmVzb3VyY2VzID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgaWYgKHRpbGUgIT0gbnVsbCAmJiB0aWxlLmdsX2dlb21ldHJ5ICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgcCBpbiB0aWxlLmdsX2dlb21ldHJ5KSB7XG4gICAgICAgICAgICB0aWxlLmdsX2dlb21ldHJ5W3BdLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICB0aWxlLmdsX2dlb21ldHJ5ID0gbnVsbDtcbiAgICB9XG59O1xuXG4vLyBBdHRhY2hlcyB0cmFja2luZyBhbmQgZGVidWcgaW50byB0byB0aGUgcHJvdmlkZWQgdGlsZSBET00gZWxlbWVudFxuU2NlbmUucHJvdG90eXBlLnVwZGF0ZVRpbGVFbGVtZW50ID0gZnVuY3Rpb24gKHRpbGUsIGRpdilcbntcbiAgICAvLyBEZWJ1ZyBpbmZvXG4gICAgZGl2LnNldEF0dHJpYnV0ZSgnZGF0YS10aWxlLWtleScsIHRpbGUua2V5KTtcbiAgICBkaXYuc3R5bGUud2lkdGggPSAnMjU2cHgnO1xuICAgIGRpdi5zdHlsZS5oZWlnaHQgPSAnMjU2cHgnO1xuXG4gICAgaWYgKHRoaXMuZGVidWcpIHtcbiAgICAgICAgdmFyIGRlYnVnX292ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGVidWdfb3ZlcmxheS50ZXh0Q29udGVudCA9IHRpbGUua2V5O1xuICAgICAgICBkZWJ1Z19vdmVybGF5LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5sZWZ0ID0gMDtcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS50b3AgPSAwO1xuICAgICAgICBkZWJ1Z19vdmVybGF5LnN0eWxlLmNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5mb250U2l6ZSA9ICcxNnB4JztcbiAgICAgICAgLy8gZGVidWdfb3ZlcmxheS5zdHlsZS50ZXh0T3V0bGluZSA9ICcxcHggIzAwMDAwMCc7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChkZWJ1Z19vdmVybGF5KTtcblxuICAgICAgICBkaXYuc3R5bGUuYm9yZGVyU3R5bGUgPSAnc29saWQnO1xuICAgICAgICBkaXYuc3R5bGUuYm9yZGVyQ29sb3IgPSAnd2hpdGUnO1xuICAgICAgICBkaXYuc3R5bGUuYm9yZGVyV2lkdGggPSAnMXB4JztcbiAgICB9XG59O1xuXG4vLyBNZXJnZSBwcm9wZXJ0aWVzIGZyb20gYSBwcm92aWRlZCB0aWxlIG9iamVjdCBpbnRvIHRoZSBtYWluIHRpbGUgc3RvcmUuIFNoYWxsb3cgbWVyZ2UgKGp1c3QgY29waWVzIHRvcC1sZXZlbCBwcm9wZXJ0aWVzKSFcbi8vIFVzZWQgZm9yIHNlbGVjdGl2ZWx5IHVwZGF0aW5nIHByb3BlcnRpZXMgb2YgdGlsZXMgcGFzc2VkIGJldHdlZW4gbWFpbiB0aHJlYWQgYW5kIHdvcmtlclxuLy8gKHNvIHdlIGRvbid0IGhhdmUgdG8gcGFzcyB0aGUgd2hvbGUgdGlsZSwgaW5jbHVkaW5nIHNvbWUgcHJvcGVydGllcyB3aGljaCBjYW5ub3QgYmUgY2xvbmVkIGZvciBhIHdvcmtlcikuXG5TY2VuZS5wcm90b3R5cGUubWVyZ2VUaWxlID0gZnVuY3Rpb24gKGtleSwgc291cmNlX3RpbGUpXG57XG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV07XG5cbiAgICBpZiAodGlsZSA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMudGlsZXNba2V5XSA9IHNvdXJjZV90aWxlO1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlc1trZXldO1xuICAgIH1cblxuICAgIGZvciAodmFyIHAgaW4gc291cmNlX3RpbGUpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJtZXJnaW5nIFwiICsgcCArIFwiOiBcIiArIHNvdXJjZV90aWxlW3BdKTtcbiAgICAgICAgdGlsZVtwXSA9IHNvdXJjZV90aWxlW3BdO1xuICAgIH1cblxuICAgIHJldHVybiB0aWxlO1xufTtcblxuLy8gTG9hZCAob3IgcmVsb2FkKSB0aGUgc2NlbmUgY29uZmlnXG5TY2VuZS5wcm90b3R5cGUubG9hZFNjZW5lID0gZnVuY3Rpb24gKGNhbGxiYWNrKVxue1xuICAgIHZhciBxdWV1ZSA9IFF1ZXVlKCk7XG5cbiAgICAvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCB0aW1lIHdlJ3JlIGxvYWRpbmcgdGhlIHNjZW5lLCBjb3B5IGFueSBVUkxzXG4gICAgaWYgKCF0aGlzLmxheWVyX3NvdXJjZSAmJiB0eXBlb2YodGhpcy5sYXllcnMpID09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMubGF5ZXJfc291cmNlID0gVXRpbHMudXJsRm9yUGF0aCh0aGlzLmxheWVycyk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnN0eWxlX3NvdXJjZSAmJiB0eXBlb2YodGhpcy5zdHlsZXMpID09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuc3R5bGVfc291cmNlID0gVXRpbHMudXJsRm9yUGF0aCh0aGlzLnN0eWxlcyk7XG4gICAgfVxuXG4gICAgLy8gTGF5ZXIgYnkgVVJMXG4gICAgaWYgKHRoaXMubGF5ZXJfc291cmNlKSB7XG4gICAgICAgIHF1ZXVlLmRlZmVyKGNvbXBsZXRlID0+IHtcbiAgICAgICAgICAgIFNjZW5lLmxvYWRMYXllcnMoXG4gICAgICAgICAgICAgICAgdGhpcy5sYXllcl9zb3VyY2UsXG4gICAgICAgICAgICAgICAgbGF5ZXJzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXllcnMgPSBsYXllcnM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGF5ZXJzX3NlcmlhbGl6ZWQgPSBVdGlscy5zZXJpYWxpemVXaXRoRnVuY3Rpb25zKHRoaXMubGF5ZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBTdHlsZSBieSBVUkxcbiAgICBpZiAodGhpcy5zdHlsZV9zb3VyY2UpIHtcbiAgICAgICAgcXVldWUuZGVmZXIoY29tcGxldGUgPT4ge1xuICAgICAgICAgICAgU2NlbmUubG9hZFN0eWxlcyhcbiAgICAgICAgICAgICAgICB0aGlzLnN0eWxlX3NvdXJjZSxcbiAgICAgICAgICAgICAgICBzdHlsZXMgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0eWxlcyA9IHN0eWxlcztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHlsZXNfc2VyaWFsaXplZCA9IFV0aWxzLnNlcmlhbGl6ZVdpdGhGdW5jdGlvbnModGhpcy5zdHlsZXMpO1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBTdHlsZSBvYmplY3RcbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBTY2VuZS5wb3N0UHJvY2Vzc1N0eWxlcyh0aGlzLnN0eWxlcyk7XG4gICAgfVxuXG4gICAgLy8gRXZlcnl0aGluZyBpcyBsb2FkZWRcbiAgICBxdWV1ZS5hd2FpdChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vLyBSZWxvYWQgc2NlbmUgY29uZmlnIGFuZCByZWJ1aWxkIHRpbGVzXG5TY2VuZS5wcm90b3R5cGUucmVsb2FkU2NlbmUgPSBmdW5jdGlvbiAoKVxue1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5sb2FkU2NlbmUoKCkgPT4ge1xuICAgICAgICB0aGlzLnJlYnVpbGRUaWxlcygpO1xuICAgIH0pO1xufTtcblxuLy8gQ2FsbGVkIChjdXJyZW50bHkgbWFudWFsbHkpIGFmdGVyIG1vZGVzIGFyZSB1cGRhdGVkIGluIHN0eWxlc2hlZXRcblNjZW5lLnByb3RvdHlwZS5yZWZyZXNoTW9kZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tb2RlcyA9IFNjZW5lLnJlZnJlc2hNb2Rlcyh0aGlzLm1vZGVzLCB0aGlzLnN0eWxlcyk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUudXBkYXRlQWN0aXZlTW9kZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIE1ha2UgYSBzZXQgb2YgY3VycmVudGx5IGFjdGl2ZSBtb2RlcyAodXNlZCBpbiBhIGxheWVyKVxuICAgIHRoaXMuYWN0aXZlX21vZGVzID0ge307XG4gICAgdmFyIGFuaW1hdGVkID0gZmFsc2U7IC8vIGlzIGFueSBhY3RpdmUgbW9kZSBhbmltYXRlZD9cbiAgICBmb3IgKHZhciBsIGluIHRoaXMuc3R5bGVzLmxheWVycykge1xuICAgICAgICB2YXIgbW9kZSA9IHRoaXMuc3R5bGVzLmxheWVyc1tsXS5tb2RlLm5hbWU7XG4gICAgICAgIGlmICh0aGlzLnN0eWxlcy5sYXllcnNbbF0udmlzaWJsZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlX21vZGVzW21vZGVdID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBtb2RlIGlzIGFuaW1hdGVkXG4gICAgICAgICAgICBpZiAoYW5pbWF0ZWQgPT0gZmFsc2UgJiYgdGhpcy5tb2Rlc1ttb2RlXS5hbmltYXRlZCA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuYW5pbWF0ZWQgPSBhbmltYXRlZDtcbn07XG5cbi8vIFJlc2V0IGludGVybmFsIGNsb2NrLCBtb3N0bHkgdXNlZnVsIGZvciBjb25zaXN0ZW50IGV4cGVyaWVuY2Ugd2hlbiBjaGFuZ2luZyBtb2Rlcy9kZWJ1Z2dpbmdcblNjZW5lLnByb3RvdHlwZS5yZXNldFRpbWUgPSBmdW5jdGlvbiAoKVxue1xuICAgIHRoaXMuc3RhcnRfdGltZSA9ICtuZXcgRGF0ZSgpO1xufTtcblxuLy8gVXNlciBpbnB1dFxuLy8gVE9ETzogcmVzdG9yZSBmcmFjdGlvbmFsIHpvb20gc3VwcG9ydCBvbmNlIGxlYWZsZXQgYW5pbWF0aW9uIHJlZmFjdG9yIHB1bGwgcmVxdWVzdCBpcyBtZXJnZWRcblxuU2NlbmUucHJvdG90eXBlLmluaXRJbnB1dEhhbmRsZXJzID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyB0aGlzLmtleSA9IG51bGw7XG5cbiAgICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy8gICAgIGlmIChldmVudC5rZXlDb2RlID09IDM3KSB7XG4gICAgLy8gICAgICAgICB0aGlzLmtleSA9ICdsZWZ0JztcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDM5KSB7XG4gICAgLy8gICAgICAgICB0aGlzLmtleSA9ICdyaWdodCc7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PSAzOCkge1xuICAgIC8vICAgICAgICAgdGhpcy5rZXkgPSAndXAnO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gNDApIHtcbiAgICAvLyAgICAgICAgIHRoaXMua2V5ID0gJ2Rvd24nO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gODMpIHsgLy8gc1xuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coXCJyZWxvYWRpbmcgc2hhZGVyc1wiKTtcbiAgICAvLyAgICAgICAgIGZvciAodmFyIG1vZGUgaW4gdGhpcy5tb2Rlcykge1xuICAgIC8vICAgICAgICAgICAgIHRoaXMubW9kZXNbbW9kZV0uZ2xfcHJvZ3JhbS5jb21waWxlKCk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH0uYmluZCh0aGlzKSk7XG5cbiAgICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIC8vICAgICB0aGlzLmtleSA9IG51bGw7XG4gICAgLy8gfS5iaW5kKHRoaXMpKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5pbnB1dCA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gLy8gRnJhY3Rpb25hbCB6b29tIHNjYWxpbmdcbiAgICAvLyBpZiAodGhpcy5rZXkgPT0gJ3VwJykge1xuICAgIC8vICAgICB0aGlzLnNldFpvb20odGhpcy56b29tICsgdGhpcy56b29tX3N0ZXApO1xuICAgIC8vIH1cbiAgICAvLyBlbHNlIGlmICh0aGlzLmtleSA9PSAnZG93bicpIHtcbiAgICAvLyAgICAgdGhpcy5zZXRab29tKHRoaXMuem9vbSAtIHRoaXMuem9vbV9zdGVwKTtcbiAgICAvLyB9XG59O1xuXG5cbi8vIFN0YXRzL2RlYnVnL3Byb2ZpbGluZyBtZXRob2RzXG5cbi8vIFByb2ZpbGluZyBtZXRob2RzIHVzZWQgdG8gdHJhY2sgd2hlbiBzZXRzIG9mIHRpbGVzIHN0YXJ0L3N0b3AgbG9hZGluZyB0b2dldGhlclxuLy8gZS5nLiBpbml0aWFsIHBhZ2UgbG9hZCBpcyBvbmUgc2V0IG9mIHRpbGVzLCBuZXcgc2V0cyBvZiB0aWxlIGxvYWRzIGFyZSB0aGVuIGluaXRpYXRlZCBieSBhIG1hcCBwYW4gb3Igem9vbVxuU2NlbmUucHJvdG90eXBlLnRyYWNrVGlsZVNldExvYWRTdGFydCA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gU3RhcnQgdHJhY2tpbmcgbmV3IHRpbGUgc2V0IGlmIG5vIG90aGVyIHRpbGVzIGFscmVhZHkgbG9hZGluZ1xuICAgIGlmICh0aGlzLnRpbGVfc2V0X2xvYWRpbmcgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnRpbGVfc2V0X2xvYWRpbmcgPSArbmV3IERhdGUoKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ0aWxlIHNldCBsb2FkIFNUQVJUXCIpO1xuICAgIH1cbn07XG5cblNjZW5lLnByb3RvdHlwZS50cmFja1RpbGVTZXRMb2FkRW5kID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBObyBtb3JlIHRpbGVzIGFjdGl2ZWx5IGxvYWRpbmc/XG4gICAgaWYgKHRoaXMudGlsZV9zZXRfbG9hZGluZyAhPSBudWxsKSB7XG4gICAgICAgIHZhciBlbmRfdGlsZV9zZXQgPSB0cnVlO1xuICAgICAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbGVzW3RdLmxvYWRpbmcgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGVuZF90aWxlX3NldCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuZF90aWxlX3NldCA9PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RfdGlsZV9zZXRfbG9hZCA9ICgrbmV3IERhdGUoKSkgLSB0aGlzLnRpbGVfc2V0X2xvYWRpbmc7XG4gICAgICAgICAgICB0aGlzLnRpbGVfc2V0X2xvYWRpbmcgPSBudWxsO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0aWxlIHNldCBsb2FkIEZJTklTSEVEIGluOiBcIiArIHRoaXMubGFzdF90aWxlX3NldF9sb2FkKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblNjZW5lLnByb3RvdHlwZS5wcmludERlYnVnRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBcImRlYnVnIGZvciBcIiArIHRpbGUua2V5ICsgJzogWyAnICtcbiAgICAgICAgT2JqZWN0LmtleXModGlsZS5kZWJ1ZykubWFwKGZ1bmN0aW9uICh0KSB7IHJldHVybiB0ICsgJzogJyArIHRpbGUuZGVidWdbdF07IH0pLmpvaW4oJywgJykgKyAnIF0nXG4gICAgKTtcbn07XG5cbi8vIFJlY29tcGlsZSBhbGwgc2hhZGVyc1xuU2NlbmUucHJvdG90eXBlLmNvbXBpbGVTaGFkZXJzID0gZnVuY3Rpb24gKClcbntcbiAgICBmb3IgKHZhciBtIGluIHRoaXMubW9kZXMpIHtcbiAgICAgICAgdGhpcy5tb2Rlc1ttXS5nbF9wcm9ncmFtLmNvbXBpbGUoKTtcbiAgICB9XG59O1xuXG4vLyBTdW0gb2YgYSBkZWJ1ZyBwcm9wZXJ0eSBhY3Jvc3MgdGlsZXNcblNjZW5lLnByb3RvdHlwZS5nZXREZWJ1Z1N1bSA9IGZ1bmN0aW9uIChwcm9wLCBmaWx0ZXIpXG57XG4gICAgdmFyIHN1bSA9IDA7XG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbGVzW3RdLmRlYnVnW3Byb3BdICE9IG51bGwgJiYgKHR5cGVvZiBmaWx0ZXIgIT0gJ2Z1bmN0aW9uJyB8fCBmaWx0ZXIodGhpcy50aWxlc1t0XSkgPT0gdHJ1ZSkpIHtcbiAgICAgICAgICAgIHN1bSArPSB0aGlzLnRpbGVzW3RdLmRlYnVnW3Byb3BdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdW07XG59O1xuXG4vLyBBdmVyYWdlIG9mIGEgZGVidWcgcHJvcGVydHkgYWNyb3NzIHRpbGVzXG5TY2VuZS5wcm90b3R5cGUuZ2V0RGVidWdBdmVyYWdlID0gZnVuY3Rpb24gKHByb3AsIGZpbHRlcilcbntcbiAgICByZXR1cm4gdGhpcy5nZXREZWJ1Z1N1bShwcm9wLCBmaWx0ZXIpIC8gT2JqZWN0LmtleXModGhpcy50aWxlcykubGVuZ3RoO1xufTtcblxuLy8gTG9nIG1lc3NhZ2VzIHBhc3MgdGhyb3VnaCBmcm9tIHdlYiB3b3JrZXJzXG5TY2VuZS5wcm90b3R5cGUud29ya2VyTG9nTWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudClcbntcbiAgICBpZiAoZXZlbnQuZGF0YS50eXBlICE9ICdsb2cnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhcIndvcmtlciBcIiArIGV2ZW50LmRhdGEud29ya2VyX2lkICsgXCI6IFwiICsgZXZlbnQuZGF0YS5tc2cpO1xufTtcblxuXG4vKioqIENsYXNzIG1ldGhvZHMgKHN0YXRlbGVzcykgKioqL1xuXG5TY2VuZS5sb2FkTGF5ZXJzID0gZnVuY3Rpb24gKHVybCwgY2FsbGJhY2spXG57XG4gICAgdmFyIGxheWVycztcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZXZhbCgnbGF5ZXJzID0gJyArIHJlcS5yZXNwb25zZSk7IC8vIFRPRE86IHNlY3VyaXR5IVxuXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sobGF5ZXJzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmVxLm9wZW4oJ0dFVCcsIHVybCArICc/JyArICgrbmV3IERhdGUoKSksIHRydWUgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICByZXEuc2VuZCgpO1xufTtcblxuU2NlbmUubG9hZFN0eWxlcyA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKVxue1xuICAgIHZhciBzdHlsZXM7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3R5bGVzID0gcmVxLnJlc3BvbnNlO1xuXG4gICAgICAgIC8vIFRyeSBKU09OIGZpcnN0LCB0aGVuIFlBTUwgKGlmIGF2YWlsYWJsZSlcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGV2YWwoJ3N0eWxlcyA9ICcgKyByZXEucmVzcG9uc2UpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHN0eWxlcyA9IHlhbWwuc2FmZUxvYWQocmVxLnJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJmYWlsZWQgdG8gcGFyc2Ugc3R5bGVzIVwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzdHlsZXMpO1xuICAgICAgICAgICAgICAgIHN0eWxlcyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5kIGdlbmVyaWMgZnVuY3Rpb25zICYgc3R5bGUgbWFjcm9zXG4gICAgICAgIFV0aWxzLnN0cmluZ3NUb0Z1bmN0aW9ucyhzdHlsZXMpO1xuICAgICAgICBTdHlsZS5leHBhbmRNYWNyb3Moc3R5bGVzKTtcbiAgICAgICAgU2NlbmUucG9zdFByb2Nlc3NTdHlsZXMoc3R5bGVzKTtcblxuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHN0eWxlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXEub3BlbignR0VUJywgdXJsICsgJz8nICsgKCtuZXcgRGF0ZSgpKSwgdHJ1ZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICByZXEucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xuICAgIHJlcS5zZW5kKCk7XG59O1xuXG4vLyBOb3JtYWxpemUgc29tZSBzdHlsZSBzZXR0aW5ncyB0aGF0IG1heSBub3QgaGF2ZSBiZWVuIGV4cGxpY2l0bHkgc3BlY2lmaWVkIGluIHRoZSBzdHlsZXNoZWV0XG5TY2VuZS5wb3N0UHJvY2Vzc1N0eWxlcyA9IGZ1bmN0aW9uIChzdHlsZXMpXG57XG4gICAgLy8gUG9zdC1wcm9jZXNzIHN0eWxlc1xuICAgIGZvciAodmFyIG0gaW4gc3R5bGVzLmxheWVycykge1xuICAgICAgICBpZiAoc3R5bGVzLmxheWVyc1ttXS52aXNpYmxlICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgc3R5bGVzLmxheWVyc1ttXS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoc3R5bGVzLmxheWVyc1ttXS5tb2RlICYmIHN0eWxlcy5sYXllcnNbbV0ubW9kZS5uYW1lKSA9PSBudWxsKSB7XG4gICAgICAgICAgICBzdHlsZXMubGF5ZXJzW21dLm1vZGUgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gU3R5bGUuZGVmYXVsdHMubW9kZSkge1xuICAgICAgICAgICAgICAgIHN0eWxlcy5sYXllcnNbbV0ubW9kZVtwXSA9IFN0eWxlLmRlZmF1bHRzLm1vZGVbcF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3R5bGVzO1xufTtcblxuLy8gUHJvY2Vzc2VzIHRoZSB0aWxlIHJlc3BvbnNlIHRvIGNyZWF0ZSBsYXllcnMgYXMgZGVmaW5lZCBieSB0aGUgc2NlbmVcbi8vIENhbiBpbmNsdWRlIHBvc3QtcHJvY2Vzc2luZyB0byBwYXJ0aWFsbHkgZmlsdGVyIG9yIHJlLWFycmFuZ2UgZGF0YSwgZS5nLiBvbmx5IGluY2x1ZGluZyBQT0lzIHRoYXQgaGF2ZSBuYW1lc1xuU2NlbmUucHJvY2Vzc0xheWVyc0ZvclRpbGUgPSBmdW5jdGlvbiAobGF5ZXJzLCB0aWxlKVxue1xuICAgIHZhciB0aWxlX2xheWVycyA9IHt9O1xuICAgIGZvciAodmFyIHQ9MDsgdCA8IGxheWVycy5sZW5ndGg7IHQrKykge1xuICAgICAgICBsYXllcnNbdF0ubnVtYmVyID0gdDtcblxuICAgICAgICBpZiAobGF5ZXJzW3RdICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEp1c3QgcGFzcyB0aHJvdWdoIGRhdGEgdW50b3VjaGVkIGlmIG5vIGRhdGEgdHJhbnNmb3JtIGZ1bmN0aW9uIGRlZmluZWRcbiAgICAgICAgICAgIGlmIChsYXllcnNbdF0uZGF0YSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gdGlsZS5sYXllcnNbbGF5ZXJzW3RdLm5hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGFzcyB0aHJvdWdoIGRhdGEgYnV0IHdpdGggZGlmZmVyZW50IGxheWVyIG5hbWUgaW4gdGlsZSBzb3VyY2UgZGF0YVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGxheWVyc1t0XS5kYXRhID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gdGlsZS5sYXllcnNbbGF5ZXJzW3RdLmRhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQXBwbHkgdGhlIHRyYW5zZm9ybSBmdW5jdGlvbiBmb3IgcG9zdC1wcm9jZXNzaW5nXG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgbGF5ZXJzW3RdLmRhdGEgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IGxheWVyc1t0XS5kYXRhKHRpbGUubGF5ZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhhbmRsZSBjYXNlcyB3aGVyZSBubyBkYXRhIHdhcyBmb3VuZCBpbiB0aWxlIG9yIHJldHVybmVkIGJ5IHBvc3QtcHJvY2Vzc29yXG4gICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSB8fCB7IHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsIGZlYXR1cmVzOiBbXSB9O1xuICAgIH1cbiAgICB0aWxlLmxheWVycyA9IHRpbGVfbGF5ZXJzO1xuICAgIHJldHVybiB0aWxlX2xheWVycztcbn07XG5cbi8vIENhbGxlZCBvbmNlIG9uIGluc3RhbnRpYXRpb25cblNjZW5lLmNyZWF0ZU1vZGVzID0gZnVuY3Rpb24gKHN0eWxlcylcbntcbiAgICB2YXIgbW9kZXMgPSB7fTtcblxuICAgIC8vIEJ1aWx0LWluIG1vZGVzXG4gICAgdmFyIGJ1aWx0X2lucyA9IHJlcXVpcmUoJy4vZ2wvZ2xfbW9kZXMnKS5Nb2RlcztcbiAgICBmb3IgKHZhciBtIGluIGJ1aWx0X2lucykge1xuICAgICAgICBtb2Rlc1ttXSA9IGJ1aWx0X2luc1ttXTtcbiAgICB9XG5cbiAgICAvLyBTdHlsZXNoZWV0IG1vZGVzXG4gICAgZm9yICh2YXIgbSBpbiBzdHlsZXMubW9kZXMpIHtcbiAgICAgICAgLy8gaWYgKG0gIT0gJ2FsbCcpIHtcbiAgICAgICAgICAgIG1vZGVzW21dID0gTW9kZU1hbmFnZXIuY29uZmlndXJlTW9kZShtLCBzdHlsZXMubW9kZXNbbV0pO1xuICAgICAgICAvLyB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vZGVzO1xufTtcblxuU2NlbmUucmVmcmVzaE1vZGVzID0gZnVuY3Rpb24gKG1vZGVzLCBzdHlsZXMpXG57XG4gICAgLy8gQ29weSBzdHlsZXNoZWV0IG1vZGVzXG4gICAgLy8gVE9ETzogaXMgdGhpcyB0aGUgYmVzdCB3YXkgdG8gY29weSBzdHlsZXNoZWV0IGNoYW5nZXMgdG8gbW9kZSBpbnN0YW5jZXM/XG4gICAgZm9yICh2YXIgbSBpbiBzdHlsZXMubW9kZXMpIHtcbiAgICAgICAgLy8gaWYgKG0gIT0gJ2FsbCcpIHtcbiAgICAgICAgICAgIG1vZGVzW21dID0gTW9kZU1hbmFnZXIuY29uZmlndXJlTW9kZShtLCBzdHlsZXMubW9kZXNbbV0pO1xuICAgICAgICAvLyB9XG4gICAgfVxuXG4gICAgLy8gUmVmcmVzaCBhbGwgbW9kZXNcbiAgICBmb3IgKG0gaW4gbW9kZXMpIHtcbiAgICAgICAgbW9kZXNbbV0ucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJldHVybiBtb2Rlcztcbn07XG5cblxuLy8gUHJpdmF0ZS9pbnRlcm5hbFxuXG4vLyBHZXQgYmFzZSBVUkwgZnJvbSB3aGljaCB0aGUgbGlicmFyeSB3YXMgbG9hZGVkXG4vLyBVc2VkIHRvIGxvYWQgYWRkaXRpb25hbCByZXNvdXJjZXMgbGlrZSBzaGFkZXJzLCB0ZXh0dXJlcywgZXRjLiBpbiBjYXNlcyB3aGVyZSBsaWJyYXJ5IHdhcyBsb2FkZWQgZnJvbSBhIHJlbGF0aXZlIHBhdGhcbmZ1bmN0aW9uIGZpbmRCYXNlTGlicmFyeVVSTCAoKVxue1xuICAgIFNjZW5lLmxpYnJhcnlfYmFzZV91cmwgPSAnJztcbiAgICB2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKTsgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W3NyYyo9XCIuanNcIl0nKTtcbiAgICBmb3IgKHZhciBzPTA7IHMgPCBzY3JpcHRzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgIHZhciBtYXRjaCA9IHNjcmlwdHNbc10uc3JjLmluZGV4T2YoJ3RhbmdyYW0uZGVidWcuanMnKTtcbiAgICAgICAgaWYgKG1hdGNoID09IC0xKSB7XG4gICAgICAgICAgICBtYXRjaCA9IHNjcmlwdHNbc10uc3JjLmluZGV4T2YoJ3RhbmdyYW0ubWluLmpzJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hdGNoID49IDApIHtcbiAgICAgICAgICAgIFNjZW5lLmxpYnJhcnlfYmFzZV91cmwgPSBzY3JpcHRzW3NdLnNyYy5zdWJzdHIoMCwgbWF0Y2gpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNjZW5lO1xufVxuIiwiLyoqKiBTdHlsZSBoZWxwZXJzICoqKi9cbnZhciBHZW8gPSByZXF1aXJlKCcuL2dlby5qcycpO1xuXG52YXIgU3R5bGUgPSB7fTtcblxuLy8gU3R5bGUgaGVscGVyc1xuXG5TdHlsZS5jb2xvciA9IHtcbiAgICBwc2V1ZG9SYW5kb21HcmF5c2NhbGU6IGZ1bmN0aW9uIChmKSB7IHZhciBjID0gTWF0aC5tYXgoKHBhcnNlSW50KGYuaWQsIDE2KSAlIDEwMCkgLyAxMDAsIDAuNCk7IHJldHVybiBbMC43ICogYywgMC43ICogYywgMC43ICogY107IH0sIC8vIHBzZXVkby1yYW5kb20gZ3JheXNjYWxlIGJ5IGdlb21ldHJ5IGlkXG4gICAgcHNldWRvUmFuZG9tQ29sb3I6IGZ1bmN0aW9uIChmKSB7IHJldHVybiBbMC43ICogKHBhcnNlSW50KGYuaWQsIDE2KSAvIDEwMCAlIDEpLCAwLjcgKiAocGFyc2VJbnQoZi5pZCwgMTYpIC8gMTAwMDAgJSAxKSwgMC43ICogKHBhcnNlSW50KGYuaWQsIDE2KSAvIDEwMDAwMDAgJSAxKV07IH0sIC8vIHBzZXVkby1yYW5kb20gY29sb3IgYnkgZ2VvbWV0cnkgaWRcbiAgICByYW5kb21Db2xvcjogZnVuY3Rpb24gKGYpIHsgcmV0dXJuIFswLjcgKiBNYXRoLnJhbmRvbSgpLCAwLjcgKiBNYXRoLnJhbmRvbSgpLCAwLjcgKiBNYXRoLnJhbmRvbSgpXTsgfSAvLyByYW5kb20gY29sb3Jcbn07XG5cbi8vIFJldHVybnMgYSBmdW5jdGlvbiAodGhhdCBjYW4gYmUgdXNlZCBhcyBhIGR5bmFtaWMgc3R5bGUpIHRoYXQgY29udmVydHMgcGl4ZWxzIHRvIG1ldGVycyBmb3IgdGhlIGN1cnJlbnQgem9vbSBsZXZlbC5cbi8vIFRoZSBwcm92aWRlZCBwaXhlbCB2YWx1ZSAoJ3AnKSBjYW4gaXRzZWxmIGJlIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2UgaXQgaXMgd3JhcHBlZCBieSB0aGlzIG9uZS5cblN0eWxlLnBpeGVscyA9IGZ1bmN0aW9uIChwLCB6KSB7XG4gICAgdmFyIGY7XG4gICAgZXZhbCgnZiA9IGZ1bmN0aW9uKGYsIHQsIGgpIHsgcmV0dXJuICcgKyAodHlwZW9mIHAgPT0gJ2Z1bmN0aW9uJyA/ICcoJyArIChwLnRvU3RyaW5nKCkgKyAnKGYsIHQsIGgpKScpIDogcCkgKyAnICogaC5HZW8ubWV0ZXJzX3Blcl9waXhlbFtoLnpvb21dOyB9Jyk7XG4gICAgcmV0dXJuIGY7XG59O1xuXG4vLyBDcmVhdGUgYSB1bmlxdWUgMzItYml0IGNvbG9yIHRvIGlkZW50aWZ5IGEgZmVhdHVyZVxuLy8gV29ya2VycyBpbmRlcGVuZGVudGx5IGNyZWF0ZS9tb2RpZnkgc2VsZWN0aW9uIGNvbG9ycyBpbiB0aGVpciBvd24gdGhyZWFkcywgYnV0IHdlIGFsc29cbi8vIG5lZWQgdGhlIG1haW4gdGhyZWFkIHRvIGtub3cgd2hlcmUgZWFjaCBmZWF0dXJlIGNvbG9yIG9yaWdpbmF0ZWQuIFRvIGFjY29tcGxpc2ggdGhpcyxcbi8vIHdlIHBhcnRpdGlvbiB0aGUgbWFwIGJ5IHNldHRpbmcgdGhlIDR0aCBjb21wb25lbnQgKGFscGhhIGNoYW5uZWwpIHRvIHRoZSB3b3JrZXIncyBpZC5cblN0eWxlLnNlbGVjdGlvbl9tYXAgPSB7fTsgLy8gdGhpcyB3aWxsIGJlIHVuaXF1ZSBwZXIgbW9kdWxlIGluc3RhbmNlIChzbyB1bmlxdWUgcGVyIHdvcmtlcilcblN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCA9IDE7IC8vIHN0YXJ0IGF0IDEgc2luY2UgMSB3aWxsIGJlIGRpdmlkZWQgYnkgdGhpc1xuU3R5bGUuc2VsZWN0aW9uX21hcF9wcmVmaXggPSAwOyAvLyBzZXQgYnkgd29ya2VyIHRvIHdvcmtlciBpZCAjXG5TdHlsZS5nZW5lcmF0ZVNlbGVjdGlvbiA9IGZ1bmN0aW9uIChjb2xvcl9tYXApXG57XG4gICAgLy8gMzItYml0IGNvbG9yIGtleVxuICAgIFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCsrO1xuICAgIHZhciBpciA9IFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCAmIDI1NTtcbiAgICB2YXIgaWcgPSAoU3R5bGUuc2VsZWN0aW9uX21hcF9jdXJyZW50ID4+IDgpICYgMjU1O1xuICAgIHZhciBpYiA9IChTdHlsZS5zZWxlY3Rpb25fbWFwX2N1cnJlbnQgPj4gMTYpICYgMjU1O1xuICAgIHZhciBpYSA9IFN0eWxlLnNlbGVjdGlvbl9tYXBfcHJlZml4O1xuICAgIHZhciByID0gaXIgLyAyNTU7XG4gICAgdmFyIGcgPSBpZyAvIDI1NTtcbiAgICB2YXIgYiA9IGliIC8gMjU1O1xuICAgIHZhciBhID0gaWEgLyAyNTU7XG4gICAgdmFyIGtleSA9IChpciArIChpZyA8PCA4KSArIChpYiA8PCAxNikgKyAoaWEgPDwgMjQpKSA+Pj4gMDsgLy8gbmVlZCB1bnNpZ25lZCByaWdodCBzaGlmdCB0byBjb252ZXJ0IHRvIHBvc2l0aXZlICNcblxuICAgIGNvbG9yX21hcFtrZXldID0ge1xuICAgICAgICBjb2xvcjogW3IsIGcsIGIsIGFdLFxuICAgIH07XG5cbiAgICByZXR1cm4gY29sb3JfbWFwW2tleV07XG59O1xuXG5TdHlsZS5yZXNldFNlbGVjdGlvbk1hcCA9IGZ1bmN0aW9uICgpXG57XG4gICAgU3R5bGUuc2VsZWN0aW9uX21hcCA9IHt9O1xuICAgIFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCA9IDE7XG59O1xuXG4vLyBGaW5kIGFuZCBleHBhbmQgc3R5bGUgbWFjcm9zXG5TdHlsZS5tYWNyb3MgPSBbXG4gICAgJ1N0eWxlLmNvbG9yLnBzZXVkb1JhbmRvbUNvbG9yJyxcbiAgICAnU3R5bGUucGl4ZWxzJ1xuXTtcblxuU3R5bGUuZXhwYW5kTWFjcm9zID0gZnVuY3Rpb24gZXhwYW5kTWFjcm9zIChvYmopIHtcbiAgICBmb3IgKHZhciBwIGluIG9iaikge1xuICAgICAgICB2YXIgdmFsID0gb2JqW3BdO1xuXG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCBvYmplY3QgcHJvcGVydGllc1xuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgb2JqW3BdID0gZXhwYW5kTWFjcm9zKHZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ29udmVydCBzdHJpbmdzIGJhY2sgaW50byBmdW5jdGlvbnNcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbCA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZm9yICh2YXIgbSBpbiBTdHlsZS5tYWNyb3MpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsLm1hdGNoKFN0eWxlLm1hY3Jvc1ttXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGY7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmFsKCdmID0gJyArIHZhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpbcF0gPSBmO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbGwtYmFjayB0byBvcmlnaW5hbCB2YWx1ZSBpZiBwYXJzaW5nIGZhaWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqW3BdID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cblxuLy8gU3R5bGUgZGVmYXVsdHNcblxuLy8gRGV0ZXJtaW5lIGZpbmFsIHN0eWxlIHByb3BlcnRpZXMgKGNvbG9yLCB3aWR0aCwgZXRjLilcblN0eWxlLmRlZmF1bHRzID0ge1xuICAgIGNvbG9yOiBbMS4wLCAwLCAwXSxcbiAgICB3aWR0aDogMSxcbiAgICBzaXplOiAxLFxuICAgIGV4dHJ1ZGU6IGZhbHNlLFxuICAgIGhlaWdodDogMjAsXG4gICAgbWluX2hlaWdodDogMCxcbiAgICBvdXRsaW5lOiB7XG4gICAgICAgIC8vIGNvbG9yOiBbMS4wLCAwLCAwXSxcbiAgICAgICAgLy8gd2lkdGg6IDEsXG4gICAgICAgIC8vIGRhc2g6IG51bGxcbiAgICB9LFxuICAgIHNlbGVjdGlvbjoge1xuICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICBjb2xvcjogWzAsIDAsIDAsIDFdXG4gICAgfSxcbiAgICBtb2RlOiB7XG4gICAgICAgIG5hbWU6ICdwb2x5Z29ucydcbiAgICB9XG59O1xuXG4vLyBTdHlsZSBwYXJzaW5nXG5cbi8vIEhlbHBlciBmdW5jdGlvbnMgcGFzc2VkIHRvIGR5bmFtaWMgc3R5bGUgZnVuY3Rpb25zXG5TdHlsZS5oZWxwZXJzID0ge1xuICAgIFN0eWxlOiBTdHlsZSxcbiAgICBHZW86IEdlb1xufTtcblxuU3R5bGUucGFyc2VTdHlsZUZvckZlYXR1cmUgPSBmdW5jdGlvbiAoZmVhdHVyZSwgbGF5ZXJfbmFtZSwgbGF5ZXJfc3R5bGUsIHRpbGUpXG57XG4gICAgdmFyIGxheWVyX3N0eWxlID0gbGF5ZXJfc3R5bGUgfHwge307XG4gICAgdmFyIHN0eWxlID0ge307XG5cbiAgICBTdHlsZS5oZWxwZXJzLnpvb20gPSB0aWxlLmNvb3Jkcy56O1xuXG4gICAgLy8gVGVzdCB3aGV0aGVyIGZlYXR1cmVzIHNob3VsZCBiZSByZW5kZXJlZCBhdCBhbGxcbiAgICBpZiAodHlwZW9mIGxheWVyX3N0eWxlLmZpbHRlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChsYXllcl9zdHlsZS5maWx0ZXIoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycykgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUGFyc2Ugc3R5bGVzXG4gICAgc3R5bGUuY29sb3IgPSAobGF5ZXJfc3R5bGUuY29sb3IgJiYgKGxheWVyX3N0eWxlLmNvbG9yW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5jb2xvci5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMuY29sb3I7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5jb2xvciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLmNvbG9yID0gc3R5bGUuY29sb3IoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgc3R5bGUud2lkdGggPSAobGF5ZXJfc3R5bGUud2lkdGggJiYgKGxheWVyX3N0eWxlLndpZHRoW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS53aWR0aC5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMud2lkdGg7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS53aWR0aCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLndpZHRoID0gc3R5bGUud2lkdGgoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuICAgIHN0eWxlLndpZHRoICo9IEdlby51bml0c19wZXJfbWV0ZXJbdGlsZS5jb29yZHMuel07XG5cbiAgICBzdHlsZS5zaXplID0gKGxheWVyX3N0eWxlLnNpemUgJiYgKGxheWVyX3N0eWxlLnNpemVbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLnNpemUuZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLnNpemU7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5zaXplID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUuc2l6ZSA9IHN0eWxlLnNpemUoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuICAgIHN0eWxlLnNpemUgKj0gR2VvLnVuaXRzX3Blcl9tZXRlclt0aWxlLmNvb3Jkcy56XTtcblxuICAgIHN0eWxlLmV4dHJ1ZGUgPSAobGF5ZXJfc3R5bGUuZXh0cnVkZSAmJiAobGF5ZXJfc3R5bGUuZXh0cnVkZVtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUuZXh0cnVkZS5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMuZXh0cnVkZTtcbiAgICBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyByZXR1cm5pbmcgYSBib29sZWFuIHdpbGwgZXh0cnVkZSB3aXRoIHRoZSBmZWF0dXJlJ3MgaGVpZ2h0LCBhIG51bWJlciB3aWxsIG92ZXJyaWRlIHRoZSBmZWF0dXJlIGhlaWdodCAoc2VlIGJlbG93KVxuICAgICAgICBzdHlsZS5leHRydWRlID0gc3R5bGUuZXh0cnVkZShmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICBzdHlsZS5oZWlnaHQgPSAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5oZWlnaHQpIHx8IFN0eWxlLmRlZmF1bHRzLmhlaWdodDtcbiAgICBzdHlsZS5taW5faGVpZ2h0ID0gKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMubWluX2hlaWdodCkgfHwgU3R5bGUuZGVmYXVsdHMubWluX2hlaWdodDtcblxuICAgIC8vIGhlaWdodCBkZWZhdWx0cyB0byBmZWF0dXJlIGhlaWdodCwgYnV0IGV4dHJ1ZGUgc3R5bGUgY2FuIGR5bmFtaWNhbGx5IGFkanVzdCBoZWlnaHQgYnkgcmV0dXJuaW5nIGEgbnVtYmVyIG9yIGFycmF5IChpbnN0ZWFkIG9mIGEgYm9vbGVhbilcbiAgICBpZiAoc3R5bGUuZXh0cnVkZSkge1xuICAgICAgICBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHN0eWxlLmhlaWdodCA9IHN0eWxlLmV4dHJ1ZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ29iamVjdCcgJiYgc3R5bGUuZXh0cnVkZS5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgc3R5bGUubWluX2hlaWdodCA9IHN0eWxlLmV4dHJ1ZGVbMF07XG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQgPSBzdHlsZS5leHRydWRlWzFdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3R5bGUueiA9IChsYXllcl9zdHlsZS56ICYmIChsYXllcl9zdHlsZS56W2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS56LmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy56IHx8IDA7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS56ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUueiA9IHN0eWxlLnooZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgc3R5bGUub3V0bGluZSA9IHt9O1xuICAgIGxheWVyX3N0eWxlLm91dGxpbmUgPSBsYXllcl9zdHlsZS5vdXRsaW5lIHx8IHt9O1xuICAgIHN0eWxlLm91dGxpbmUuY29sb3IgPSAobGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvciAmJiAobGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvcltmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvci5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMub3V0bGluZS5jb2xvcjtcbiAgICBpZiAodHlwZW9mIHN0eWxlLm91dGxpbmUuY29sb3IgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5vdXRsaW5lLmNvbG9yID0gc3R5bGUub3V0bGluZS5jb2xvcihmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICBzdHlsZS5vdXRsaW5lLndpZHRoID0gKGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGggJiYgKGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGhbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGguZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLm91dGxpbmUud2lkdGg7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5vdXRsaW5lLndpZHRoID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUub3V0bGluZS53aWR0aCA9IHN0eWxlLm91dGxpbmUud2lkdGgoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuICAgIHN0eWxlLm91dGxpbmUud2lkdGggKj0gR2VvLnVuaXRzX3Blcl9tZXRlclt0aWxlLmNvb3Jkcy56XTtcblxuICAgIHN0eWxlLm91dGxpbmUuZGFzaCA9IChsYXllcl9zdHlsZS5vdXRsaW5lLmRhc2ggJiYgKGxheWVyX3N0eWxlLm91dGxpbmUuZGFzaFtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUub3V0bGluZS5kYXNoLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy5vdXRsaW5lLmRhc2g7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5vdXRsaW5lLmRhc2ggPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5vdXRsaW5lLmRhc2ggPSBzdHlsZS5vdXRsaW5lLmRhc2goZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgLy8gSW50ZXJhY3Rpdml0eSAoc2VsZWN0aW9uIG1hcClcbiAgICB2YXIgaW50ZXJhY3RpdmUgPSBmYWxzZTtcbiAgICBpZiAodHlwZW9mIGxheWVyX3N0eWxlLmludGVyYWN0aXZlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaW50ZXJhY3RpdmUgPSBsYXllcl9zdHlsZS5pbnRlcmFjdGl2ZShmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGludGVyYWN0aXZlID0gbGF5ZXJfc3R5bGUuaW50ZXJhY3RpdmU7XG4gICAgfVxuXG4gICAgaWYgKGludGVyYWN0aXZlID09IHRydWUpIHtcbiAgICAgICAgdmFyIHNlbGVjdG9yID0gU3R5bGUuZ2VuZXJhdGVTZWxlY3Rpb24oU3R5bGUuc2VsZWN0aW9uX21hcCk7XG5cbiAgICAgICAgc2VsZWN0b3IuZmVhdHVyZSA9IHtcbiAgICAgICAgICAgIGlkOiBmZWF0dXJlLmlkLFxuICAgICAgICAgICAgcHJvcGVydGllczogZmVhdHVyZS5wcm9wZXJ0aWVzXG4gICAgICAgIH07XG4gICAgICAgIHNlbGVjdG9yLmZlYXR1cmUucHJvcGVydGllcy5sYXllciA9IGxheWVyX25hbWU7IC8vIGFkZCBsYXllciBuYW1lIHRvIHByb3BlcnRpZXNcblxuICAgICAgICBzdHlsZS5zZWxlY3Rpb24gPSB7XG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICBjb2xvcjogc2VsZWN0b3IuY29sb3JcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHN0eWxlLnNlbGVjdGlvbiA9IFN0eWxlLmRlZmF1bHRzLnNlbGVjdGlvbjtcbiAgICB9XG5cbiAgICBpZiAobGF5ZXJfc3R5bGUubW9kZSAhPSBudWxsICYmIGxheWVyX3N0eWxlLm1vZGUubmFtZSAhPSBudWxsKSB7XG4gICAgICAgIHN0eWxlLm1vZGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgbSBpbiBsYXllcl9zdHlsZS5tb2RlKSB7XG4gICAgICAgICAgICBzdHlsZS5tb2RlW21dID0gbGF5ZXJfc3R5bGUubW9kZVttXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3R5bGUubW9kZSA9IFN0eWxlLmRlZmF1bHRzLm1vZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTdHlsZTtcbn1cbiIsIi8vIE1pc2NlbGxhbmVvdXMgdXRpbGl0aWVzXG5cbi8vIFNpbXBsaXN0aWMgZGV0ZWN0aW9uIG9mIHJlbGF0aXZlIHBhdGhzLCBhcHBlbmQgYmFzZSBpZiBuZWNlc3NhcnlcbmZ1bmN0aW9uIHVybEZvclBhdGggKHBhdGgpIHtcbiAgICBpZiAocGF0aCA9PSBudWxsIHx8IHBhdGggPT0gJycpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gQ2FuIGV4cGFuZCBhIHNpbmdsZSBwYXRoLCBvciBhbiBhcnJheSBvZiBwYXRoc1xuICAgIGlmICh0eXBlb2YgcGF0aCA9PSAnb2JqZWN0JyAmJiBwYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gQXJyYXkgb2YgcGF0aHNcbiAgICAgICAgZm9yICh2YXIgcCBpbiBwYXRoKSB7XG4gICAgICAgICAgICB2YXIgcHJvdG9jb2wgPSBwYXRoW3BdLnRvTG93ZXJDYXNlKCkuc3Vic3RyKDAsIDQpO1xuICAgICAgICAgICAgaWYgKCEocHJvdG9jb2wgPT0gJ2h0dHAnIHx8IHByb3RvY29sID09ICdmaWxlJykpIHtcbiAgICAgICAgICAgICAgICBwYXRoW3BdID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHBhdGhbcF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIFNpbmdsZSBwYXRoXG4gICAgICAgIHZhciBwcm90b2NvbCA9IHBhdGgudG9Mb3dlckNhc2UoKS5zdWJzdHIoMCwgNCk7XG4gICAgICAgIGlmICghKHByb3RvY29sID09ICdodHRwJyB8fCBwcm90b2NvbCA9PSAnZmlsZScpKSB7XG4gICAgICAgICAgICBwYXRoID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHBhdGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhdGg7XG59O1xuXG4vLyBTdHJpbmdpZnkgYW4gb2JqZWN0IGludG8gSlNPTiwgYnV0IGNvbnZlcnQgZnVuY3Rpb25zIHRvIHN0cmluZ3NcbmZ1bmN0aW9uIHNlcmlhbGl6ZVdpdGhGdW5jdGlvbnMgKG9iailcbntcbiAgICB2YXIgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KG9iaiwgZnVuY3Rpb24oaywgdikge1xuICAgICAgICAvLyBDb252ZXJ0IGZ1bmN0aW9ucyB0byBzdHJpbmdzXG4gICAgICAgIGlmICh0eXBlb2YgdiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gdi50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNlcmlhbGl6ZWQ7XG59O1xuXG4vLyBQYXJzZSBhIEpTT04gc3RyaW5nLCBidXQgY29udmVydCBmdW5jdGlvbi1saWtlIHN0cmluZ3MgYmFjayBpbnRvIGZ1bmN0aW9uc1xuZnVuY3Rpb24gZGVzZXJpYWxpemVXaXRoRnVuY3Rpb25zIChzZXJpYWxpemVkKSB7XG4gICAgdmFyIG9iaiA9IEpTT04ucGFyc2Uoc2VyaWFsaXplZCk7XG4gICAgb2JqID0gc3RyaW5nc1RvRnVuY3Rpb25zKG9iaik7XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLy8gUmVjdXJzaXZlbHkgcGFyc2UgYW4gb2JqZWN0LCBhdHRlbXB0aW5nIHRvIGNvbnZlcnQgc3RyaW5nIHByb3BlcnRpZXMgdGhhdCBsb29rIGxpa2UgZnVuY3Rpb25zIGJhY2sgaW50byBmdW5jdGlvbnNcbmZ1bmN0aW9uIHN0cmluZ3NUb0Z1bmN0aW9ucyAob2JqKSB7XG4gICAgZm9yICh2YXIgcCBpbiBvYmopIHtcbiAgICAgICAgdmFyIHZhbCA9IG9ialtwXTtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggb2JqZWN0IHByb3BlcnRpZXNcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIG9ialtwXSA9IHN0cmluZ3NUb0Z1bmN0aW9ucyh2YWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIENvbnZlcnQgc3RyaW5ncyBiYWNrIGludG8gZnVuY3Rpb25zXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWwgPT0gJ3N0cmluZycgJiYgdmFsLm1hdGNoKC9eZnVuY3Rpb24uKlxcKC4qXFwpLykgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGY7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGV2YWwoJ2YgPSAnICsgdmFsKTtcbiAgICAgICAgICAgICAgICBvYmpbcF0gPSBmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBmYWxsLWJhY2sgdG8gb3JpZ2luYWwgdmFsdWUgaWYgcGFyc2luZyBmYWlsZWRcbiAgICAgICAgICAgICAgICBvYmpbcF0gPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLy8gUnVuIGEgYmxvY2sgaWYgb24gdGhlIG1haW4gdGhyZWFkIChub3QgaW4gYSB3ZWIgd29ya2VyKSwgd2l0aCBvcHRpb25hbCBlcnJvciAod2ViIHdvcmtlcikgYmxvY2tcbmZ1bmN0aW9uIHJ1bklmSW5NYWluVGhyZWFkIChibG9jaywgZXJyKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHdpbmRvdy5kb2N1bWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBibG9jaygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZXJyID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGVycigpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBVc2VkIGZvciBkaWZmZXJlbnRpYXRpbmcgYmV0d2VlbiBwb3dlci1vZi0yIGFuZCBub24tcG93ZXItb2YtMiB0ZXh0dXJlc1xuLy8gVmlhOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE5NzIyMjQ3L3dlYmdsLXdhaXQtZm9yLXRleHR1cmUtdG8tbG9hZFxuZnVuY3Rpb24gaXNQb3dlck9mMiAodmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlICYgKHZhbHVlIC0gMSkpID09IDA7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgdXJsRm9yUGF0aDogdXJsRm9yUGF0aCxcbiAgICAgICAgc2VyaWFsaXplV2l0aEZ1bmN0aW9uczogc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyxcbiAgICAgICAgZGVzZXJpYWxpemVXaXRoRnVuY3Rpb25zOiBkZXNlcmlhbGl6ZVdpdGhGdW5jdGlvbnMsXG4gICAgICAgIHN0cmluZ3NUb0Z1bmN0aW9uczogc3RyaW5nc1RvRnVuY3Rpb25zLFxuICAgICAgICBydW5JZkluTWFpblRocmVhZDogcnVuSWZJbk1haW5UaHJlYWQsXG4gICAgICAgIGlzUG93ZXJPZjI6IGlzUG93ZXJPZjJcbiAgICB9O1xufVxuIiwiLyoqKiBWZWN0b3IgZnVuY3Rpb25zIC0gdmVjdG9ycyBwcm92aWRlZCBhcyBbeCwgeSwgel0gYXJyYXlzICoqKi9cblxudmFyIFZlY3RvciA9IHt9O1xuXG4vLyBWZWN0b3IgbGVuZ3RoIHNxdWFyZWRcblZlY3Rvci5sZW5ndGhTcSA9IGZ1bmN0aW9uICh2KVxue1xuICAgIGlmICh2Lmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIHJldHVybiAodlswXSp2WzBdICsgdlsxXSp2WzFdKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiAodlswXSp2WzBdICsgdlsxXSp2WzFdICsgdlsyXSp2WzJdKTtcbiAgICB9XG59O1xuXG4vLyBWZWN0b3IgbGVuZ3RoXG5WZWN0b3IubGVuZ3RoID0gZnVuY3Rpb24gKHYpXG57XG4gICAgcmV0dXJuIE1hdGguc3FydChWZWN0b3IubGVuZ3RoU3EodikpO1xufTtcblxuLy8gTm9ybWFsaXplIGEgdmVjdG9yXG5WZWN0b3Iubm9ybWFsaXplID0gZnVuY3Rpb24gKHYpXG57XG4gICAgdmFyIGQ7XG4gICAgaWYgKHYubGVuZ3RoID09IDIpIHtcbiAgICAgICAgZCA9IHZbMF0qdlswXSArIHZbMV0qdlsxXTtcbiAgICAgICAgZCA9IE1hdGguc3FydChkKTtcblxuICAgICAgICBpZiAoZCAhPSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW3ZbMF0gLyBkLCB2WzFdIC8gZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFswLCAwXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBkID0gdlswXSp2WzBdICsgdlsxXSp2WzFdICsgdlsyXSp2WzJdO1xuICAgICAgICBkID0gTWF0aC5zcXJ0KGQpO1xuXG4gICAgICAgIGlmIChkICE9IDApIHtcbiAgICAgICAgICAgIHJldHVybiBbdlswXSAvIGQsIHZbMV0gLyBkLCB2WzJdIC8gZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFswLCAwLCAwXTtcbiAgICB9XG59O1xuXG4vLyBDcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWN0b3JzXG5WZWN0b3IuY3Jvc3MgID0gZnVuY3Rpb24gKHYxLCB2MilcbntcbiAgICByZXR1cm4gW1xuICAgICAgICAodjFbMV0gKiB2MlsyXSkgLSAodjFbMl0gKiB2MlsxXSksXG4gICAgICAgICh2MVsyXSAqIHYyWzBdKSAtICh2MVswXSAqIHYyWzJdKSxcbiAgICAgICAgKHYxWzBdICogdjJbMV0pIC0gKHYxWzFdICogdjJbMF0pXG4gICAgXTtcbn07XG5cbi8vIEZpbmQgdGhlIGludGVyc2VjdGlvbiBvZiB0d28gbGluZXMgc3BlY2lmaWVkIGFzIHNlZ21lbnRzIGZyb20gcG9pbnRzIChwMSwgcDIpIGFuZCAocDMsIHA0KVxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaW5lLWxpbmVfaW50ZXJzZWN0aW9uXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NyYW1lcidzX3J1bGVcblZlY3Rvci5saW5lSW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKHAxLCBwMiwgcDMsIHA0LCBwYXJhbGxlbF90b2xlcmFuY2UpXG57XG4gICAgdmFyIHBhcmFsbGVsX3RvbGVyYW5jZSA9IHBhcmFsbGVsX3RvbGVyYW5jZSB8fCAwLjAxO1xuXG4gICAgLy8gYTEqeCArIGIxKnkgPSBjMSBmb3IgbGluZSAoeDEsIHkxKSB0byAoeDIsIHkyKVxuICAgIC8vIGEyKnggKyBiMip5ID0gYzIgZm9yIGxpbmUgKHgzLCB5MykgdG8gKHg0LCB5NClcbiAgICB2YXIgYTEgPSBwMVsxXSAtIHAyWzFdOyAvLyB5MSAtIHkyXG4gICAgdmFyIGIxID0gcDFbMF0gLSBwMlswXTsgLy8geDEgLSB4MlxuICAgIHZhciBhMiA9IHAzWzFdIC0gcDRbMV07IC8vIHkzIC0geTRcbiAgICB2YXIgYjIgPSBwM1swXSAtIHA0WzBdOyAvLyB4MyAtIHg0XG4gICAgdmFyIGMxID0gKHAxWzBdICogcDJbMV0pIC0gKHAxWzFdICogcDJbMF0pOyAvLyB4MSp5MiAtIHkxKngyXG4gICAgdmFyIGMyID0gKHAzWzBdICogcDRbMV0pIC0gKHAzWzFdICogcDRbMF0pOyAvLyB4Myp5NCAtIHkzKng0XG4gICAgdmFyIGRlbm9tID0gKGIxICogYTIpIC0gKGExICogYjIpO1xuXG4gICAgaWYgKE1hdGguYWJzKGRlbm9tKSA+IHBhcmFsbGVsX3RvbGVyYW5jZSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgKChjMSAqIGIyKSAtIChiMSAqIGMyKSkgLyBkZW5vbSxcbiAgICAgICAgICAgICgoYzEgKiBhMikgLSAoYTEgKiBjMikpIC8gZGVub21cbiAgICAgICAgXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7IC8vIHJldHVybiBudWxsIGlmIGxpbmVzIGFyZSAoY2xvc2UgdG8pIHBhcmFsbGVsXG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFZlY3Rvcjtcbn1cbiJdfQ==
(13)
});
