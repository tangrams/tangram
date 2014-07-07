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
var Point = _dereq_('../point.js');
var Geo = _dereq_('../geo.js');
var VectorRenderer = _dereq_('../vector_renderer.js');

VectorRenderer.CanvasRenderer = CanvasRenderer;
CanvasRenderer.prototype = Object.create(VectorRenderer.prototype);

function CanvasRenderer (tile_source, layers, styles, options)
{
    VectorRenderer.call(this, 'CanvasRenderer', tile_source, layers, styles, options);

    // Selection info shown on hover
    this.selection_info = document.createElement('div');
    this.selection_info.setAttribute('class', 'label');
    this.selection_info.style.display = 'none';

    // For drawing multipolygons w/canvas composite operations
    this.cutout_context = document.createElement('canvas').getContext('2d');
}

CanvasRenderer.prototype._tileWorkerCompleted = function (tile)
{
    // Use existing canvas or create new one
    if (tile.canvas == null) {
        tile.canvas = document.createElement('canvas');
        tile.context = tile.canvas.getContext('2d');

        tile.canvas.style.width = Geo.tile_size + 'px';
        tile.canvas.style.width = Geo.tile_size + 'px';
        tile.canvas.width = Math.round(Geo.tile_size * this.device_pixel_ratio);
        tile.canvas.height = Math.round(Geo.tile_size * this.device_pixel_ratio);
        tile.canvas.style.background = this.colorToString(this.styles.default);
    }
    else {
        tile.context.clearRect(0, 0, tile.canvas.width, tile.canvas.height);
    }

    this.renderTile(tile, tile.context);

    if (tile.canvas.parentNode == null) {
        var tileDiv = document.querySelector("div[data-tile-key='" + tile.key + "']");
        tileDiv.appendChild(tile.canvas);
    }
};

// Scale a GeoJSON coordinate (2-element array) from [min, max] to tile pixels
// returns a copy of geometry.coordinates transformed into Points
CanvasRenderer.prototype.scaleGeometryToPixels = function scaleGeometryToPixels (geometry)
{
    var renderer = this;
    return Geo.transformGeometry(geometry, function (coordinates) {
        return Point(
            // Math.round((coordinates[0] - min.x) * Geo.tile_size / (max.x - min.x)), // rounding removes seams but causes aliasing
            // Math.round((coordinates[1] - min.y) * Geo.tile_size / (max.y - min.y))
            coordinates[0] * Geo.tile_size * renderer.device_pixel_ratio / VectorRenderer.tile_scale,
            coordinates[1] * Geo.tile_size * renderer.device_pixel_ratio / VectorRenderer.tile_scale * -1 // adjust for flipped y-coord
        );
    });
};

// Renders a line given as an array of Points
// line = [Point, Point, ...]
CanvasRenderer.prototype.renderLine = function renderLine (line, style, context)
{
    var segments = line;
    var color = style.color;
    var width = style.width;
    var dash = style.dash;

    var c = context;
    c.beginPath();
    c.strokeStyle = this.colorToString(color);
    c.lineCap = 'round';
    c.lineWidth = width;
    if (c.setLineDash) {
        if (dash) {
            c.setLineDash(dash.map(function (d) { return d * width; }));
        }
        else {
            c.setLineDash([]);
        }
    }

    for (var r=0; r < segments.length - 1; r ++) {
        var segment = [
            segments[r].x, segments[r].y,
            segments[r + 1].x, segments[r + 1].y
        ];

        c.moveTo(segment[0], segment[1]);
        c.lineTo(segment[2], segment[3]);
    };

    c.closePath();
    c.stroke();
};

// Renders a polygon given as an array of Points
// polygon = [Point, Point, ...]
CanvasRenderer.prototype.renderPolygon = function renderPolygon (polygon, style, context)
{
    var segments = polygon;
    var color = style.color;
    var width = style.width;
    var outline_color = style.outline && style.outline.color;
    var outline_width = style.outline && style.outline.width;
    var outline_dash = style.outline && style.outline.dash;

    var c = context;
    c.beginPath();
    c.fillStyle = this.colorToString(color);
    c.moveTo(segments[0].x, segments[0].y);

    for (var r=1; r < segments.length; r ++) {
        c.lineTo(segments[r].x, segments[r].y);
    };

    c.closePath();
    c.fill();

    // Outline
    if (outline_color && outline_width) {
        c.strokeStyle = this.colorToString(outline_color);
        c.lineCap = 'round';
        c.lineWidth = outline_width;
        if (c.setLineDash) {
            if (outline_dash) {
                c.setLineDash(outline_dash.map(function (d) { return d * outline_width; }));
            }
            else {
                c.setLineDash([]);
            }
        }
        c.stroke();
    }
};

// Renders a point given as a Point object
CanvasRenderer.prototype.renderPoint = function renderPoint (point, style, context)
{
    var color = style.color;
    var size = style.size;
    var outline_color = style.outline && style.outline.color;
    var outline_width = style.outline && style.outline.width;
    var outline_dash = style.outline && style.outline.dash;

    var c = context;
    c.fillStyle = this.colorToString(color);

    c.beginPath();
    c.arc(point.x, point.y, size, 0, 2 * Math.PI);
    c.closePath();
    c.fill();

    // Outline
    if (outline_color && outline_width) {
        c.strokeStyle = this.colorToString(outline_color);
        c.lineWidth = outline_width;
        if (c.setLineDash) {
            if (outline_dash) {
                c.setLineDash(outline_dash.map(function (d) { return d * outline_width; }));
            }
            else {
                c.setLineDash([]);
            }
        }
        c.stroke();
    }
};

CanvasRenderer.prototype.renderFeature = function renderFeature (feature, style, context)
{
    var g, h, polys;
    var geometry = feature.geometry;

    if (geometry.type == 'LineString') {
        this.renderLine(geometry.pixels, style, context);
    }
    else if (geometry.type == 'MultiLineString') {
        for (g=0; g < geometry.pixels.length; g++) {
            this.renderLine(geometry.pixels[g], style, context);
        }
    }
    else if (geometry.type == 'Polygon' || geometry.type == 'MultiPolygon') {
        if (geometry.type == 'Polygon') {
            polys = [geometry.pixels]; // treat Polygon as a degenerate MultiPolygon to avoid duplicating code
        }
        else {
            polys = geometry.pixels;
        }

        for (g=0; g < polys.length; g++) {
            // Polygons with holes:
            // Render to a separate canvas, using composite operations to cut holes out of polygon, then copy back to the main canvas
            if (polys[g].length > 1) {
                if (this.cutout_context.canvas.width != context.canvas.width || this.cutout_context.canvas.height != context.canvas.height) {
                    this.cutout_context.canvas.width = context.canvas.width;
                    this.cutout_context.canvas.height = context.canvas.height;
                }
                this.cutout_context.clearRect(0, 0, this.cutout_context.canvas.width, this.cutout_context.canvas.height);

                this.cutout_context.globalCompositeOperation = 'source-over';
                this.renderPolygon(polys[g][0], style, this.cutout_context);

                this.cutout_context.globalCompositeOperation = 'destination-out';
                for (h=1; h < polys[g].length; h++) {
                    this.renderPolygon(polys[g][h], style, this.cutout_context);
                }
                context.drawImage(this.cutout_context.canvas, 0, 0);

                // After compositing back to main canvas, draw outlines on holes
                if (style.outline && style.outline.color) {
                    for (h=1; h < polys[g].length; h++) {
                        this.renderLine(polys[g][h], style.outline, context);
                    }
                }
            }
            // Regular closed polygons
            else {
                this.renderPolygon(polys[g][0], style, context);
            }
        }
    }
    else if (geometry.type == 'Point') {
        this.renderPoint(geometry.pixels, style, context);
    }
    else if (geometry.type == 'MultiPoint') {
        for (g=0; g < geometry.pixels.length; g++) {
            this.renderPoint(geometry.pixels[g], style, context);
        }
    }
};

// Render a GeoJSON tile onto canvas
CanvasRenderer.prototype.renderTile = function renderTile (tile, context)
{
    var renderer = this;
    var style;

    // Selection rendering - off-screen canvas to render a collision map for feature selection
    if (tile.selection_canvas == null) {
        tile.selection_canvas = document.createElement('canvas');
        tile.selection_context = tile.selection_canvas.getContext('2d');

        tile.selection_canvas.style.width = Geo.tile_size + 'px';
        tile.selection_canvas.style.width = Geo.tile_size + 'px';
        tile.selection_canvas.width = Math.round(Geo.tile_size * this.device_pixel_ratio);
        tile.selection_canvas.height = Math.round(Geo.tile_size * this.device_pixel_ratio);
    }

    var selection = { colors: {} };
    var selection_color;
    var selection_count = 0;

    // Render layers
    for (var t in renderer.layers) {
        var layer = renderer.layers[t];

        // Skip layers with no styles defined, or layers set to not be visible
        if (this.styles[layer.name] == null || !this.styles[layer.name].visible) {
            continue;
        }

        tile.layers[layer.name].features.forEach(function(feature) {
            // Scale local coords to tile pixels
            feature.geometry.pixels = this.scaleGeometryToPixels(feature.geometry);
            style = VectorRenderer.parseStyleForFeature(feature, this.styles[layer.name], tile);

            // Draw visible geometry
            this.renderFeature(feature, style, context);

            // Draw mask for interactivity
            // TODO: move selection filter logic to stylesheet
            // TODO: only alter styles that are explicitly different, don't manually copy style values by property name
            if (layer.selection == true && feature.properties.name != null && feature.properties.name != '') {
                selection_color = this.generateColor(selection.colors);
                selection_color.properties = feature.properties;
                selection_count++;
                this.renderFeature(feature, { color: selection_color.color, width: style.width, size: style.size }, tile.selection_context);
            }
            else {
                // If this geometry isn't interactive, mask it out so geometry under it doesn't appear to pop through
                this.renderFeature(feature, { color: [0, 0, 0], width: style.width, size: style.size }, tile.selection_context);
            }

        }, this);
    }

    // Selection events
    var selection_info = this.selection_info;
    if (selection_count > 0) {
        this.tiles[tile.key].selection = selection;

        selection.pixels = new Uint32Array(tile.selection_context.getImageData(0, 0, tile.selection_canvas.width, tile.selection_canvas.height).data.buffer);

        // TODO: fire events on selection to enable custom behavior
        context.canvas.onmousemove = function (event) {
            var hit = { x: event.offsetX, y: event.offsetY }; // layerX/Y
            var off = (hit.y * renderer.device_pixel_ratio) * (Geo.tile_size * renderer.device_pixel_ratio) + (hit.x * renderer.device_pixel_ratio);
            var color = selection.pixels[off];
            var feature = selection.colors[color];
            if (feature != null) {
                context.canvas.style.cursor = 'crosshair';
                selection_info.style.left = (hit.x + 5) + 'px';
                selection_info.style.top = (hit.y + 5) + 'px';
                selection_info.innerHTML = '<span class="labelInner">' + feature.properties.name + /*' [' + feature.properties.kind + ']*/'</span>';
                selection_info.style.display = 'block';
                context.canvas.parentNode.appendChild(selection_info);
            }
            else {
                context.canvas.style.cursor = null;
                selection_info.style.display = 'none';
                if (selection_info.parentNode == context.canvas.parentNode) {
                    context.canvas.parentNode.removeChild(selection_info);
                }
            }
        };
    }
    else {
        context.canvas.onmousemove = function (event) {
            context.canvas.style.cursor = null;
            selection_info.style.display = 'none';
            if (selection_info.parentNode == context.canvas.parentNode) {
                context.canvas.parentNode.removeChild(selection_info);
            }
        };
    }
};

/* Color helpers */

// Transform color components in 0-1 range to html RGB string for canvas
CanvasRenderer.prototype.colorToString = function (color)
{
    return 'rgb(' + color.map(function(c) { return ~~(c * 256); }).join(',') + ')';
};

// Generates a random color not yet present in the provided hash of colors
CanvasRenderer.prototype.generateColor = function generateColor (color_map)
{
    var r, g, b, ir, ig, ib, key;
    color_map = color_map || {};
    while (true) {
        r = Math.random();
        g = Math.random();
        b = Math.random();

        ir = ~~(r * 256);
        ig = ~~(g * 256);
        ib = ~~(b * 256);
        key = (ir + (ig << 8) + (ib << 16) + (255 << 24)) >>> 0; // need unsigned right shift to convert to positive #

        if (color_map[key] === undefined) {
            color_map[key] = { color: [r, g, b] };
            break;
        }
    }
    return color_map[key];
};

if (module !== undefined) {
    module.exports = CanvasRenderer;
}

},{"../geo.js":3,"../point.js":11,"../vector_renderer.js":14}],3:[function(_dereq_,module,exports){
// Miscellaneous geo functions
var Point = _dereq_('./point.js');

var Geo = {};

// Projection constants
Geo.tile_size = 256;
Geo.half_circumference_meters = 20037508.342789244;
Geo.map_origin_meters = Point(-Geo.half_circumference_meters, Geo.half_circumference_meters);
Geo.min_zoom_meters_per_pixel = Geo.half_circumference_meters * 2 / Geo.tile_size; // min zoom draws world as 2 tiles wide
Geo.meters_per_pixel = [];
Geo.max_zoom = 20;
for (var z=0; z <= Geo.max_zoom; z++) {
    Geo.meters_per_pixel[z] = Geo.min_zoom_meters_per_pixel / Math.pow(2, z);
}

// Conversion functions based on an defined tile scale
Geo.units_per_meter = [];
Geo.setTileScale = function(scale)
{
    Geo.tile_scale = scale;
    Geo.units_per_pixel = Geo.tile_scale / Geo.tile_size;

    for (var z=0; z <= Geo.max_zoom; z++) {
        Geo.units_per_meter[z] = Geo.tile_scale / (Geo.tile_size * Geo.meters_per_pixel[z]);
    }
};

// Convert tile location to mercator meters - multiply by pixels per tile, then by meters per pixel, adjust for map origin
Geo.metersForTile = function (tile)
{
    return Point(
        (tile.x * Geo.tile_size * Geo.meters_per_pixel[tile.z]) + Geo.map_origin_meters.x,
        ((tile.y * Geo.tile_size * Geo.meters_per_pixel[tile.z]) * -1) + Geo.map_origin_meters.y
    );
};

// Convert mercator meters to lat-lng
Geo.metersToLatLng = function (meters)
{
    var c = Point.copy(meters);

    c.x /= Geo.half_circumference_meters;
    c.y /= Geo.half_circumference_meters;

    c.y = (2 * Math.atan(Math.exp(c.y * Math.PI)) - (Math.PI / 2)) / Math.PI;

    c.x *= 180;
    c.y *= 180;

    return c;
};

// Convert lat-lng to mercator meters
Geo.latLngToMeters = function(latlng)
{
    var c = Point.copy(latlng);

    // Latitude
    c.y = Math.log(Math.tan((c.y + 90) * Math.PI / 360)) / (Math.PI / 180);
    c.y = c.y * Geo.half_circumference_meters / 180;

    // Longitude
    c.x = c.x * Geo.half_circumference_meters / 180;

    return c;
};

// Run a transform function on each cooordinate in a GeoJSON geometry
Geo.transformGeometry = function (geometry, transform)
{
    if (geometry.type == 'Point') {
        return transform(geometry.coordinates);
    }
    else if (geometry.type == 'LineString' || geometry.type == 'MultiPoint') {
        return geometry.coordinates.map(transform);
    }
    else if (geometry.type == 'Polygon' || geometry.type == 'MultiLineString') {
        return geometry.coordinates.map(function (coordinates) {
            return coordinates.map(transform);
        });
    }
    else if (geometry.type == 'MultiPolygon') {
        return geometry.coordinates.map(function (polygon) {
            return polygon.map(function (coordinates) {
                return coordinates.map(transform);
            });
        });
    }
    // TODO: support GeometryCollection
    return {};
};

Geo.boxIntersect = function (b1, b2)
{
    return !(
        b2.sw.x > b1.ne.x ||
        b2.ne.x < b1.sw.x ||
        b2.sw.y > b1.ne.y ||
        b2.ne.y < b1.sw.y
    );
};

// Split the lines of a feature wherever two points are farther apart than a given tolerance
Geo.splitFeatureLines  = function (feature, tolerance) {
    var tolerance = tolerance || 0.001;
    var tolerance_sq = tolerance * tolerance;
    var geom = feature.geometry;
    var lines;

    if (geom.type == 'MultiLineString') {
        lines = geom.coordinates;
    }
    else if (geom.type =='LineString') {
        lines = [geom.coordinates];
    }
    else {
        return feature;
    }

    var split_lines = [];

    for (var s=0; s < lines.length; s++) {
        var seg = lines[s];
        var split_seg = [];
        var last_coord = null;
        var keep;

        for (var c=0; c < seg.length; c++) {
            var coord = seg[c];
            keep = true;

            if (last_coord != null) {
                var dist = (coord[0] - last_coord[0]) * (coord[0] - last_coord[0]) + (coord[1] - last_coord[1]) * (coord[1] - last_coord[1]);
                if (dist > tolerance_sq) {
                    // console.log("split lines at (" + coord[0] + ", " + coord[1] + "), " + Math.sqrt(dist) + " apart");
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
    }
    else {
        geom.type = 'MultiLineString';
        geom.coordinates = split_lines;
    }

    return feature;
};

if (module !== undefined) {
    module.exports = Geo;
}

},{"./point.js":11}],4:[function(_dereq_,module,exports){
// WebGL management and rendering functions
var GL = {};

// Setup a WebGL context
// If no canvas element is provided, one is created and added to the document body
GL.getContext = function getContext (canvas)
{
    var canvas = canvas;
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

    gl = canvas.getContext('experimental-webgl', { /*preserveDrawingBuffer: true*/ }); // preserveDrawingBuffer needed for gl.readPixels (could be used for feature selection)
    if (!gl) {
        alert("Couldn't create WebGL context. Your browser probably doesn't support WebGL or it's turned off?");
        throw "Couldn't create WebGL context";
    }

    GL.resizeCanvas(gl, window.innerWidth, window.innerHeight);
    if (fullscreen == true) {
        window.addEventListener('resize', function () {
            GL.resizeCanvas(gl, window.innerWidth, window.innerHeight);
        });
    }

    GL.VertexArrayObject.init(gl); // TODO: this pattern doesn't support multiple active GL contexts, should that even be supported?

    return gl;
};

GL.resizeCanvas = function (gl, width, height)
{
    var device_pixel_ratio = window.devicePixelRatio || 1;
    gl.canvas.style.width = width + 'px';
    gl.canvas.style.height = height + 'px';
    gl.canvas.width = Math.round(gl.canvas.style.width * device_pixel_ratio);
    gl.canvas.height = Math.round(gl.canvas.style.width * device_pixel_ratio);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
};

// Compile & link a WebGL program from provided vertex and shader source elements
GL.createProgramFromElements = function GLcreateProgramFromElements (gl, vertex_shader_id, fragment_shader_id)
{
    var vertex_shader_source = document.getElementById(vertex_shader_id).textContent;
    var fragment_shader_source = document.getElementById(fragment_shader_id).textContent;
    var program = gl.createProgram();
    return GL.updateProgram(gl, program, vertex_shader_source, fragment_shader_source);
};

// Compile & link a WebGL program from provided vertex and shader source URLs
// NOTE: loads via synchronous XHR for simplicity, could be made async
GL.createProgramFromURLs = function GLcreateProgramFromURLs (gl, vertex_shader_url, fragment_shader_url)
{
    var program = gl.createProgram();
    return GL.updateProgramFromURLs(gl, program, vertex_shader_url, fragment_shader_url);
};

GL.updateProgramFromURLs = function GLUpdateProgramFromURLs (gl, program, vertex_shader_url, fragment_shader_url)
{
    var vertex_shader_source, fragment_shader_source;
    var req = new XMLHttpRequest();

    req.onload = function () { vertex_shader_source = req.response; };
    req.open('GET', vertex_shader_url + '?' + (+new Date()), false /* async flag */);
    req.send();

    req.onload = function () { fragment_shader_source = req.response; };
    req.open('GET', fragment_shader_url + '?' + (+new Date()), false /* async flag */);
    req.send();

    return GL.updateProgram(gl, program, vertex_shader_source, fragment_shader_source);
};

// Compile & link a WebGL program from provided vertex and fragment shader sources
// update a program if one is passed in. Create one if not. Alert and don't update anything if the shaders don't compile.
GL.updateProgram = function GLupdateProgram (gl, program, vertex_shader_source, fragment_shader_source)
{
    try {
        var vertex_shader = GL.createShader(gl, vertex_shader_source, gl.VERTEX_SHADER);
        var fragment_shader = GL.createShader(gl, '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment_shader_source, gl.FRAGMENT_SHADER);
    }
    catch(err)
    {
        alert(err);
        return program;
    }

    gl.useProgram(null);
    if (program != null) {
        var old_shaders = gl.getAttachedShaders(program);
        for(var i = 0; i < old_shaders.length; i++) {
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
        var program_error =
            "WebGL program error:\n" +
            "VALIDATE_STATUS: " + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + "\n" +
            "ERROR: " + gl.getError() + "\n\n" +
            "--- Vertex Shader ---\n" + vertex_shader_source + "\n\n" +
            "--- Fragment Shader ---\n" + fragment_shader_source;
        throw program_error;
    }

    return program;
};

// Compile a vertex or fragment shader from provided source
GL.createShader = function GLcreateShader (gl, source, type)
{
    var shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var shader_error =
            "WebGL shader error:\n" +
            (type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") + " SHADER:\n" +
            gl.getShaderInfoLog(shader);
        throw shader_error;
    }

    return shader;
};

// Thin GL program layer to cache uniform locations/values, do compile-time pre-processing (injecting #defines into shaders), etc.
GL.Program = function (gl, vertex_shader_source, fragment_shader_source, options)
{
    options = options || {};

    this.gl = gl;
    this.program = null;
    this.defines = options.defines || {}; // key/values inserted into shaders at compile-time
    this.uniforms = {}; // program locations of uniforms, set/updated at compile-time
    this.attribs = {}; // program locations of vertex attributes
    this.vertex_shader_source = vertex_shader_source;
    this.fragment_shader_source = fragment_shader_source;
    this.compile();
};

// Creates a program that will refresh from source URLs each time it is compiled
GL.Program.createProgramFromURLs = function (gl, vertex_shader_url, fragment_shader_url, options)
{
    var program = Object.create(GL.Program.prototype);

    program.vertex_shader_url = vertex_shader_url;
    program.fragment_shader_url = fragment_shader_url;

    program.updateVertexShaderSource = function () {
        var source;
        var req = new XMLHttpRequest();
        req.onload = function () { source = req.response; };
        req.open('GET', this.vertex_shader_url + '?' + (+new Date()), false /* async flag */);
        req.send();
        return source;
    };

    program.updateFragmentShaderSource = function () {
        var source;
        var req = new XMLHttpRequest();
        req.onload = function () { source = req.response; };
        req.open('GET', this.fragment_shader_url + '?' + (+new Date()), false /* async flag */);
        req.send();
        return source;
    };

    GL.Program.call(program, gl, null, null, options);
    return program;
};

// Global defines applied to all programs (duplicate properties for a specific program will take precedence)
GL.Program.defines = {};

GL.Program.prototype.compile = function ()
{
    // Optionally update sources
    if (typeof this.updateVertexShaderSource == 'function') {
        this.vertex_shader_source = this.updateVertexShaderSource();
    }
    if (typeof this.updateFragmentShaderSource == 'function') {
        this.fragment_shader_source = this.updateFragmentShaderSource();
    }

    // Inject defines (global, then program-specific)
    var defines = {};
    for (var d in GL.Program.defines) {
        defines[d] = GL.Program.defines[d];
    }
    for (var d in this.defines) {
        defines[d] = this.defines[d];
    }

    var define_str = "";
    for (var d in defines) {
        if (defines[d] == false) {
            continue;
        }
        else if (typeof defines[d] == 'boolean' && defines[d] == true) {
            define_str += "#define " + d + "\n";
        }
        else {
            define_str += "#define " + d + " " + defines[d] + "\n";
        }
    }
    this.processed_vertex_shader_source = define_str + this.vertex_shader_source;
    this.processed_fragment_shader_source = define_str + this.fragment_shader_source;

    // Compile & set uniforms to cached values
    this.program = GL.updateProgram(this.gl, this.program, this.processed_vertex_shader_source, this.processed_fragment_shader_source);
    this.gl.useProgram(this.program);
    this.refreshUniforms();
    this.refreshAttributes();
};

// ex: program.uniform('3f', 'position', x, y, z);
GL.Program.prototype.uniform = function (method, name) // method-appropriate arguments follow
{
    var uniform = (this.uniforms[name] = this.uniforms[name] || {});
    uniform.name = name;
    uniform.location = uniform.location || this.gl.getUniformLocation(this.program, name);
    uniform.method = 'uniform' + method;
    uniform.values = Array.prototype.slice.call(arguments, 2);
    this.updateUniform(name);
};

// Set a single uniform
GL.Program.prototype.updateUniform = function (name)
{
    var uniform = this.uniforms[name];
    if (uniform == null || uniform.location == null) {
        return;
    }
    this.gl[uniform.method].apply(this.gl, [uniform.location].concat(uniform.values)); // call appropriate GL uniform method and pass through arguments
};

// Refresh uniform locations and set to last cached values
GL.Program.prototype.refreshUniforms = function ()
{
    for (var u in this.uniforms) {
        this.uniforms[u].location = this.gl.getUniformLocation(this.program, u);
        this.updateUniform(u);
    }
};

GL.Program.prototype.refreshAttributes = function ()
{
    // var len = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
    // for (var i=0; i < len; i++) {
    //     var a = this.gl.getActiveAttrib(this.program, i);
    //     console.log(a);
    // }
    this.attribs = {};
};

// Get the location of a vertex attribute
GL.Program.prototype.attribute = function (name)
{
    var attrib = (this.attribs[name] = this.attribs[name] || {});
    if (attrib.location != null) {
        return attrib;
    }

    attrib.name = name;
    attrib.location = this.gl.getAttribLocation(this.program, name);

    // var info = this.gl.getActiveAttrib(this.program, attrib.location);
    // attrib.type = info.type;
    // attrib.size = info.size;

    return attrib;
};

// Triangulation using libtess.js port of gluTesselator
// https://github.com/brendankenny/libtess.js
try {
    GL.tesselator = (function initTesselator() {
        // Called for each vertex of tesselator output
        function vertexCallback(data, polyVertArray) {
            polyVertArray.push([data[0], data[1]]);
        }

        // Called when segments intersect and must be split
        function combineCallback(coords, data, weight) {
            return coords;
        }

        // Called when a vertex starts or stops a boundary edge of a polygon
        function edgeCallback(flag) {
            // No-op callback to force simple triangle primitives (no triangle strips or fans).
            // See: http://www.glprogramming.com/red/chapter11.html
            // "Since edge flags make no sense in a triangle fan or triangle strip, if there is a callback
            // associated with GLU_TESS_EDGE_FLAG that enables edge flags, the GLU_TESS_BEGIN callback is
            // called only with GL_TRIANGLES."
            // console.log('GL.tesselator: edge flag: ' + flag);
        }

        var tesselator = new libtess.GluTesselator();
        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, vertexCallback);
        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE, combineCallback);
        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_EDGE_FLAG, edgeCallback);

        // Brendan Kenny:
        // libtess will take 3d verts and flatten to a plane for tesselation
        // since only doing 2d tesselation here, provide z=1 normal to skip
        // iterating over verts only to get the same answer.
        // comment out to test normal-generation code
        tesselator.gluTessNormal(0, 0, 1);

        return tesselator;
    })();

    GL.triangulatePolygon = function GLTriangulate (contours)
    {
        var triangleVerts = [];
        GL.tesselator.gluTessBeginPolygon(triangleVerts);

        for (var i = 0; i < contours.length; i++) {
            GL.tesselator.gluTessBeginContour();
            var contour = contours[i];
            for (var j = 0; j < contour.length; j ++) {
                var coords = [contour[j][0], contour[j][1], 0];
                GL.tesselator.gluTessVertex(coords, coords);
            }
            GL.tesselator.gluTessEndContour();
        }

        GL.tesselator.gluTessEndPolygon();
        return triangleVerts;
    };
}
catch (e) {
    // console.log("libtess not defined!");
    // skip if libtess not defined
}

// Add one or more vertices to an array (destined to be used as a GL buffer), 'striping' each vertex with constant data
// Used for adding values that are often constant per geometry or polygon, like colors, normals (for polys sitting flat on map), layer and material info, etc.
GL.addVertices = function (vertices, vertex_data, vertex_constants)
{
    if (vertices != null && vertices.length > 0) {
        // Array of vertices
        if (typeof vertices[0] == 'object') {
            for (var v=0; v < vertices.length; v++) {
                vertex_data.push.apply(vertex_data, vertices[v]);
                if (vertex_constants) {
                    vertex_data.push.apply(vertex_data, vertex_constants);
                }
            }
        }
        // Single vertex
        else {
            vertex_data.push.apply(vertex_data, vertices);
            if (vertex_constants) {
                vertex_data.push.apply(vertex_data, vertex_constants);
            }
        }
    }
    return vertex_data;
};

// Creates a Vertex Array Object if the extension is available, or falls back on standard attribute calls
GL.VertexArrayObject = {};
GL.VertexArrayObject.disabled = false; // set to true to disable VAOs even if extension is available
GL.VertexArrayObject.bound_vao = null; // currently bound VAO

GL.VertexArrayObject.init = function (gl)
{
    if (GL.VertexArrayObject.ext == null) {
        if (GL.VertexArrayObject.disabled != true) {
            GL.VertexArrayObject.ext = gl.getExtension("OES_vertex_array_object");
        }

        if (GL.VertexArrayObject.ext != null) {
            console.log("Vertex Array Object extension available");
        }
        else if (GL.VertexArrayObject.disabled != true) {
            console.log("Vertex Array Object extension NOT available");
        }
        else {
            console.log("Vertex Array Object extension force disabled");
        }
    }
};

GL.VertexArrayObject.create = function (setup, teardown)
{
    var vao = {};
    vao.setup = setup;
    vao.teardown = teardown;

    var ext = GL.VertexArrayObject.ext;
    if (ext != null) {
        vao._vao = ext.createVertexArrayOES();
        ext.bindVertexArrayOES(vao._vao);
        vao.setup();
        ext.bindVertexArrayOES(null);
        if (typeof vao.teardown == 'function') {
            vao.teardown();
        }
    }
    else {
        vao.setup();
    }

    return vao;
};

GL.VertexArrayObject.bind = function (vao)
{
    var ext = GL.VertexArrayObject.ext;
    if (vao != null) {
        if (ext != null && vao._vao != null) {
            ext.bindVertexArrayOES(vao._vao);
            GL.VertexArrayObject.bound_vao = vao;
        }
        else {
            vao.setup();
        }
    }
    else {
        if (ext != null) {
            ext.bindVertexArrayOES(null);
        }
        else if (GL.VertexArrayObject.bound_vao != null && typeof GL.VertexArrayObject.bound_vao.teardown == 'function') {
            GL.VertexArrayObject.bound_vao.teardown();
        }
        GL.VertexArrayObject.bound_vao = null;
    }
};

if (module !== undefined) {
    module.exports = GL;
}

},{}],5:[function(_dereq_,module,exports){
var Vector = _dereq_('../vector.js');
var Point = _dereq_('../point.js');
var GL = _dereq_('./gl.js');

var GLBuilders = {};

GLBuilders.debug = false;

// Tesselate a flat 2D polygon with fixed height and add to GL vertex buffer
GLBuilders.buildPolygons = function GLBuildersBuildPolygons (polygons, z, vertex_data, options)
{
    options = options || {};

    var vertex_constants = [z, 0, 0, 1]; // provided z, and upwards-facing normal
    if (options.vertex_constants) {
        vertex_constants.push.apply(vertex_constants, options.vertex_constants);
    }

    var num_polygons = polygons.length;
    for (var p=0; p < num_polygons; p++) {
        var vertices = GL.triangulatePolygon(polygons[p]);
        GL.addVertices(vertices, vertex_data, vertex_constants);
    }

    return vertex_data;
};

// Tesselate and extrude a flat 2D polygon into a simple 3D model with fixed height and add to GL vertex buffer
GLBuilders.buildExtrudedPolygons = function GLBuildersBuildExtrudedPolygon (polygons, z, height, min_height, vertex_data, options)
{
    options = options || {};
    var min_z = z + (min_height || 0);
    var max_z = z + height;

    // Top
    GLBuilders.buildPolygons(polygons, max_z, vertex_data, { vertex_constants: options.vertex_constants });

    // Walls
    var wall_vertex_constants = [null, null, null]; // normals will be calculated below
    if (options.vertex_constants) {
        wall_vertex_constants.push.apply(wall_vertex_constants, options.vertex_constants);
    }

    var num_polygons = polygons.length;
    for (var p=0; p < num_polygons; p++) {
        var polygon = polygons[p];

        for (var q=0; q < polygon.length; q++) {
            var contour = polygon[q];

            for (var w=0; w < contour.length - 1; w++) {
                var wall_vertices = [];

                // Two triangles for the quad formed by each vertex pair, going from bottom to top height
                wall_vertices.push(
                    // Triangle
                    [contour[w+1][0], contour[w+1][1], max_z],
                    [contour[w+1][0], contour[w+1][1], min_z],
                    [contour[w][0], contour[w][1], min_z],
                    // Triangle
                    [contour[w][0], contour[w][1], min_z],
                    [contour[w][0], contour[w][1], max_z],
                    [contour[w+1][0], contour[w+1][1], max_z]
                );

                // Calc the normal of the wall from up vector and one segment of the wall triangles
                var normal = Vector.cross(
                    [0, 0, 1],
                    Vector.normalize([contour[w+1][0] - contour[w][0], contour[w+1][1] - contour[w][1], 0])
                );

                wall_vertex_constants[0] = normal[0];
                wall_vertex_constants[1] = normal[1];
                wall_vertex_constants[2] = normal[2];

                GL.addVertices(wall_vertices, vertex_data, wall_vertex_constants);
            }
        }
    }

    return vertex_data;
};

// Build tessellated triangles for a polyline
// Basically following the method described here for miter joints:
// http://artgrammer.blogspot.co.uk/2011/07/drawing-polylines-by-tessellation.html
GLBuilders.buildPolylines = function GLBuildersBuildPolylines (lines, z, width, vertex_data, options)
{
    options = options || {};
    options.closed_polygon = options.closed_polygon || false;
    options.remove_tile_edges = options.remove_tile_edges || false;

    var vertex_constants = [z, 0, 0, 1]; // provided z, and upwards-facing normal
    if (options.vertex_constants) {
        vertex_constants.push.apply(vertex_constants, options.vertex_constants);
    }

    // Line center - debugging
    if (GLBuilders.debug && options.vertex_lines) {
        var num_lines = lines.length;
        for (var ln=0; ln < num_lines; ln++) {
            var line = lines[ln];

            for (var p=0; p < line.length - 1; p++) {
                // Point A to B
                var pa = line[p];
                var pb = line[p+1];

                options.vertex_lines.push(
                    pa[0], pa[1], z + 0.001, 0, 0, 1, 1.0, 0, 0,
                    pb[0], pb[1], z + 0.001, 0, 0, 1, 1.0, 0, 0
                );
            }
        };
    }

    // Build triangles
    var vertices = [];
    var num_lines = lines.length;
    for (var ln=0; ln < num_lines; ln++) {
        var line = lines[ln];
        // Multiple line segments
        if (line.length > 2) {
            // Build anchors for line segments:
            // anchors are 3 points, each connecting 2 line segments that share a joint (start point, joint point, end point)

            var anchors = [];

            if (line.length > 3) {
                // Find midpoints of each line segment
                // For closed polygons, calculate all midpoints since segments will wrap around to first midpoint
                var mid = [];
                var p, pmax;
                if (options.closed_polygon == true) {
                    p = 0; // start on first point
                    pmax = line.length - 1;
                }
                // For open polygons, skip first midpoint and use line start instead
                else {
                    p = 1; // start on second point
                    pmax = line.length - 2;
                    mid.push(line[0]); // use line start instead of first midpoint
                }

                // Calc midpoints
                for (; p < pmax; p++) {
                    var pa = line[p];
                    var pb = line[p+1];
                    mid.push([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2]);
                }

                // Same closed/open polygon logic as above: keep last midpoint for closed, skip for open
                var mmax;
                if (options.closed_polygon == true) {
                    mmax = mid.length;
                }
                else {
                    mid.push(line[line.length-1]); // use line end instead of last midpoint
                    mmax = mid.length - 1;
                }

                // Make anchors by connecting midpoints to line joints
                for (p=0; p < mmax; p++)  {
                    anchors.push([mid[p], line[(p+1) % line.length], mid[(p+1) % mid.length]]);
                }
            }
            else {
                // Degenerate case, a 3-point line is just a single anchor
                anchors = [[line[0], line[1], line[2]]];
            }

            for (var p=0; p < anchors.length; p++) {
                if (!options.remove_tile_edges) {
                    buildAnchor(anchors[p][0], anchors[p][1], anchors[p][2]);
                    // buildSegment(anchors[p][0], anchors[p][1]); // use these to draw extruded segments w/o join, for debugging
                    // buildSegment(anchors[p][1], anchors[p][2]);
                }
                else {
                    var edge1 = GLBuilders.isOnTileEdge(anchors[p][0], anchors[p][1]);
                    var edge2 = GLBuilders.isOnTileEdge(anchors[p][1], anchors[p][2]);
                    if (!edge1 && !edge2) {
                        buildAnchor(anchors[p][0], anchors[p][1], anchors[p][2]);
                    }
                    else if (!edge1) {
                        buildSegment(anchors[p][0], anchors[p][1]);
                    }
                    else if (!edge2) {
                        buildSegment(anchors[p][1], anchors[p][2]);
                    }
                }
            }
        }
        // Single 2-point segment
        else if (line.length == 2) {
            buildSegment(line[0], line[1]); // TODO: replace buildSegment with a degenerate form of buildAnchor? buildSegment is still useful for debugging
        }
    };

    GL.addVertices(vertices, vertex_data, vertex_constants);

    // Build triangles for a single line segment, extruded by the provided width
    function buildSegment (pa, pb) {
        var slope = Vector.normalize([(pb[1] - pa[1]) * -1, pb[0] - pa[0]]);

        var pa_outer = [pa[0] + slope[0] * width/2, pa[1] + slope[1] * width/2];
        var pa_inner = [pa[0] - slope[0] * width/2, pa[1] - slope[1] * width/2];

        var pb_outer = [pb[0] + slope[0] * width/2, pb[1] + slope[1] * width/2];
        var pb_inner = [pb[0] - slope[0] * width/2, pb[1] - slope[1] * width/2];

        vertices.push(
            pb_inner, pb_outer, pa_inner,
            pa_inner, pb_outer, pa_outer
        );
    }

    // Build triangles for a 3-point 'anchor' shape, consisting of two line segments with a joint
    // TODO: move these functions out of closures?
    function buildAnchor (pa, joint, pb) {
        // Inner and outer line segments for [pa, joint] and [joint, pb]
        var pa_slope = Vector.normalize([(joint[1] - pa[1]) * -1, joint[0] - pa[0]]);
        var pa_outer = [
            [pa[0] + pa_slope[0] * width/2, pa[1] + pa_slope[1] * width/2],
            [joint[0] + pa_slope[0] * width/2, joint[1] + pa_slope[1] * width/2]
        ];
        var pa_inner = [
            [pa[0] - pa_slope[0] * width/2, pa[1] - pa_slope[1] * width/2],
            [joint[0] - pa_slope[0] * width/2, joint[1] - pa_slope[1] * width/2]
        ];

        var pb_slope = Vector.normalize([(pb[1] - joint[1]) * -1, pb[0] - joint[0]]);
        var pb_outer = [
            [joint[0] + pb_slope[0] * width/2, joint[1] + pb_slope[1] * width/2],
            [pb[0] + pb_slope[0] * width/2, pb[1] + pb_slope[1] * width/2]
        ];
        var pb_inner = [
            [joint[0] - pb_slope[0] * width/2, joint[1] - pb_slope[1] * width/2],
            [pb[0] - pb_slope[0] * width/2, pb[1] - pb_slope[1] * width/2]
        ];

        // Miter join - solve for the intersection between the two outer line segments
        var intersection = Vector.lineIntersection(pa_outer[0], pa_outer[1], pb_outer[0], pb_outer[1]);
        var line_debug = null;
        if (intersection != null) {
            var intersect_outer = intersection;

            // Cap the intersection point to a reasonable distance (as join angle becomes sharper, miter joint distance would approach infinity)
            var len_sq = Vector.lengthSq([intersect_outer[0] - joint[0], intersect_outer[1] - joint[1]]);
            var miter_len_max = 3; // multiplier on line width for max distance miter join can be from joint
            if (len_sq > (width * width * miter_len_max * miter_len_max)) {
                line_debug = 'distance';
                intersect_outer = Vector.normalize([intersect_outer[0] - joint[0], intersect_outer[1] - joint[1]]);
                intersect_outer = [
                    joint[0] + intersect_outer[0] * miter_len_max,
                    joint[1] + intersect_outer[1] * miter_len_max
                ]
            }

            var intersect_inner = [
                (joint[0] - intersect_outer[0]) + joint[0],
                (joint[1] - intersect_outer[1]) + joint[1]
            ];

            vertices.push(
                intersect_inner, intersect_outer, pa_inner[0],
                pa_inner[0], intersect_outer, pa_outer[0],

                pb_inner[1], pb_outer[1], intersect_inner,
                intersect_inner, pb_outer[1], intersect_outer
            );
        }
        else {
            // Line segments are parallel, use the first outer line segment as join instead
            line_debug = 'parallel';
            pa_inner[1] = pb_inner[0];
            pa_outer[1] = pb_outer[0];

            vertices.push(
                pa_inner[1], pa_outer[1], pa_inner[0],
                pa_inner[0], pa_outer[1], pa_outer[0],

                pb_inner[1], pb_outer[1], pb_inner[0],
                pb_inner[0], pb_outer[1], pb_outer[0]
            );
        }

        // Extruded inner/outer edges - debugging
        if (GLBuilders.debug && options.vertex_lines) {
            options.vertex_lines.push(
                pa_inner[0][0], pa_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pa_inner[1][0], pa_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pb_inner[0][0], pb_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pb_inner[1][0], pb_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pa_outer[0][0], pa_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pa_outer[1][0], pa_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pb_outer[0][0], pb_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pb_outer[1][0], pb_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pa_inner[0][0], pa_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pa_outer[0][0], pa_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pa_inner[1][0], pa_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pa_outer[1][0], pa_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pb_inner[0][0], pb_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pb_outer[0][0], pb_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pb_inner[1][0], pb_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pb_outer[1][0], pb_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0
            );
        }

        if (GLBuilders.debug && line_debug && options.vertex_lines) {
            var dcolor;
            if (line_debug == 'parallel') {
                // console.log("!!! lines are parallel !!!");
                dcolor = [0, 1, 0];
            }
            else if (line_debug == 'distance') {
                // console.log("!!! miter intersection point exceeded allowed distance from joint !!!");
                dcolor = [1, 0, 0];
            }
            // console.log('OSM id: ' + feature.id); // TODO: if this function is moved out of a closure, this feature debug info won't be available
            // console.log([pa, joint, pb]);
            // console.log(feature);
            options.vertex_lines.push(
                pa[0], pa[1], z + 0.002,
                0, 0, 1, dcolor[0], dcolor[1], dcolor[2],
                joint[0], joint[1], z + 0.002,
                0, 0, 1, dcolor[0], dcolor[1], dcolor[2],
                joint[0], joint[1], z + 0.002,
                0, 0, 1, dcolor[0], dcolor[1], dcolor[2],
                pb[0], pb[1], z + 0.002,
                0, 0, 1, dcolor[0], dcolor[1], dcolor[2]
            );

            var num_lines = lines.length;
            for (var ln=0; ln < num_lines; ln++) {
                var line2 = lines[ln];

                for (var p=0; p < line2.length - 1; p++) {
                    // Point A to B
                    var pa = line2[p];
                    var pb = line2[p+1];

                    options.vertex_lines.push(
                        pa[0], pa[1], z + 0.0005,
                        0, 0, 1, 0, 0, 1.0,
                        pb[0], pb[1], z + 0.0005,
                        0, 0, 1, 0, 0, 1.0
                    );
                }
            };
        }
    }

    return vertex_data;
};

// Build a quad centered on a point
GLBuilders.buildQuads = function GLBuildersBuildQuads (points, width, height, addGeometry, options)
{
    var options = options || {};

    var num_points = points.length;
    for (var p=0; p < num_points; p++) {
        var point = points[p];

        var positions = [
            [point[0] - width/2, point[1] - height/2],
            [point[0] + width/2, point[1] - height/2],
            [point[0] + width/2, point[1] + height/2],

            [point[0] - width/2, point[1] - height/2],
            [point[0] + width/2, point[1] + height/2],
            [point[0] - width/2, point[1] + height/2],
        ];

        if (options.texcoords == true) {
            var texcoords = [
                [-1, -1],
                [1, -1],
                [1, 1],

                [-1, -1],
                [1, 1],
                [-1, 1]
            ];
        }

        var vertices = {
            positions: positions,
            texcoords: (options.texcoords && texcoords)
        };
        addGeometry(vertices);
    }
};

// Build native GL lines for a polyline
GLBuilders.buildLines = function GLBuildersBuildLines (lines, feature, layer, style, tile, z, vertex_data, options)
{
    options = options || {};

    var color = style.color;
    var width = style.width;

    var num_lines = lines.length;
    for (var ln=0; ln < num_lines; ln++) {
        var line = lines[ln];

        for (var p=0; p < line.length - 1; p++) {
            // Point A to B
            var pa = line[p];
            var pb = line[p+1];

            vertex_data.push(
                // Point A
                pa[0], pa[1], z,
                0, 0, 1, // flat surfaces point straight up
                color[0], color[1], color[2],
                // Point B
                pb[0], pb[1], z,
                0, 0, 1, // flat surfaces point straight up
                color[0], color[1], color[2]
            );
        }
    };

    return vertex_data;
};

/* Utility functions */

// Tests if a line segment (from point A to B) is nearly coincident with the edge of a tile
GLBuilders.isOnTileEdge = function (pa, pb, options)
{
    options = options || {};

    var tolerance_function = options.tolerance_function || GLBuilders.valuesWithinTolerance;
    var tolerance = options.tolerance || 1; // tweak this adjust if catching too few/many line segments near tile edges
    var tile_min = GLBuilders.tile_bounds[0];
    var tile_max = GLBuilders.tile_bounds[1];
    var edge = null;

    if (tolerance_function(pa[0], tile_min.x, tolerance) && tolerance_function(pb[0], tile_min.x, tolerance)) {
        edge = 'left';
    }
    else if (tolerance_function(pa[0], tile_max.x, tolerance) && tolerance_function(pb[0], tile_max.x, tolerance)) {
        edge = 'right';
    }
    else if (tolerance_function(pa[1], tile_min.y, tolerance) && tolerance_function(pb[1], tile_min.y, tolerance)) {
        edge = 'top';
    }
    else if (tolerance_function(pa[1], tile_max.y, tolerance) && tolerance_function(pb[1], tile_max.y, tolerance)) {
        edge = 'bottom';
    }
    return edge;
};

GLBuilders.setTileScale = function (scale)
{
    GLBuilders.tile_bounds = [
        Point(0, 0),
        Point(scale, -scale) // TODO: correct for flipped y-axis?
    ];
};

GLBuilders.valuesWithinTolerance = function (a, b, tolerance)
{
    tolerance = tolerance || 1;
    return (Math.abs(a - b) < tolerance);
};

// Build a zigzag line pattern for testing joins and caps
GLBuilders.buildZigzagLineTestPattern = function ()
{
    var min = Point(0, 0); // tile.min;
    var max = Point(4096, 4096); // tile.max;
    var g = {
        id: 123,
        geometry: {
            type: 'LineString',
            coordinates: [
                [min.x * 0.75 + max.x * 0.25, min.y * 0.75 + max.y * 0.25],
                [min.x * 0.75 + max.x * 0.25, min.y * 0.5 + max.y * 0.5],
                [min.x * 0.25 + max.x * 0.75, min.y * 0.75 + max.y * 0.25],
                [min.x * 0.25 + max.x * 0.75, min.y * 0.25 + max.y * 0.75],
                [min.x * 0.4 + max.x * 0.6, min.y * 0.5 + max.y * 0.5],
                [min.x * 0.5 + max.x * 0.5, min.y * 0.25 + max.y * 0.75],
                [min.x * 0.75 + max.x * 0.25, min.y * 0.25 + max.y * 0.75],
                [min.x * 0.75 + max.x * 0.25, min.y * 0.4 + max.y * 0.6]
            ]
        },
        properties: {
            kind: 'debug'
        }
    };
    // console.log(g.geometry.coordinates);
    return g;
};

if (module !== undefined) {
    module.exports = GLBuilders;
}

},{"../point.js":11,"../vector.js":13,"./gl.js":4}],6:[function(_dereq_,module,exports){
/*** Manage rendering for primitives ***/
var GL = _dereq_('./gl.js');

// Attribs are an array, in layout order, of: name, size, type, normalized
// ex: { name: 'position', size: 3, type: gl.FLOAT, normalized: false }
function GLGeometry (gl, gl_program, vertex_data, attribs, options)
{
    options = options || {};

    this.gl = gl;
    this.gl_program = gl_program;
    this.attribs = attribs;
    this.vertex_data = vertex_data; // Float32Array
    this.buffer = this.gl.createBuffer();
    this.draw_mode = options.draw_mode || this.gl.TRIANGLES;
    this.data_usage = options.data_usage || this.gl.STATIC_DRAW;

    // Calc vertex stride
    this.vertex_stride = 0;
    for (var a=0; a < this.attribs.length; a++) {
        var attrib = this.attribs[a];

        attrib.location = this.gl_program.attribute(attrib.name).location;
        attrib.byte_size = attrib.size;

        switch (attrib.type) {
            case this.gl.FLOAT:
            case this.gl.INT:
            case this.gl.UNSIGNED_INT:
                attrib.byte_size *= 4;
                break;
            case this.gl.SHORT:
            case this.gl.UNSIGNED_SHORT:
                attrib.byte_size *= 2;
                break;
        }

        attrib.offset = this.vertex_stride;
        this.vertex_stride += attrib.byte_size;
    }

    this.vertex_count = this.vertex_data.byteLength / this.vertex_stride;

    this.vao = GL.VertexArrayObject.create(function() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.setup();
    }.bind(this));

    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertex_data, this.data_usage);
}

GLGeometry.prototype.setup = function ()
{
    for (var a=0; a < this.attribs.length; a++) {
        var attrib = this.attribs[a];
        this.gl.enableVertexAttribArray(attrib.location);
        this.gl.vertexAttribPointer(attrib.location, attrib.size, attrib.type, attrib.normalized, this.vertex_stride, attrib.offset);
    }
};

GLGeometry.prototype.render = function ()
{
    this.gl.useProgram(this.gl_program.program);
    GL.VertexArrayObject.bind(this.vao);

    if (typeof this._render == 'function') {
        this._render();
    }

    // TODO: support element array mode
    this.gl.drawArrays(this.draw_mode, 0, this.vertex_count);
    GL.VertexArrayObject.bind(null);
};

GLGeometry.prototype.destroy = function ()
{
    console.log("GLGeometry.destroy: delete buffer of size " + this.vertex_data.byteLength);
    this.gl.deleteBuffer(this.buffer);
    delete this.vertex_data;
};

// Draws a set of triangles
GLTriangles.prototype = Object.create(GLGeometry.prototype);

function GLTriangles (gl, gl_program, vertex_data)
{
    GLGeometry.call(this, gl, gl_program, vertex_data, [
        { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'a_normal', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'a_color', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false }
    ]);
    this.geometry_count = this.vertex_count / 3;
}

// Draws a set of points as quads, intended to be rendered as distance fields
GLPolyPoints.prototype = Object.create(GLGeometry.prototype);

function GLPolyPoints (gl, gl_program, vertex_data)
{
    GLGeometry.call(this, gl, gl_program, vertex_data, [
        { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'a_texcoord', size: 2, type: gl.FLOAT, normalized: false },
        { name: 'a_color', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false }
    ]);
    this.geometry_count = this.vertex_count / 3;
}

// Draws a set of lines
// Shares all characteristics with triangles except for draw mode
GLLines.prototype = Object.create(GLTriangles.prototype);

function GLLines (gl, gl_program, vertex_data, options)
{
    options = options || {};
    GLTriangles.call(this, gl, program, vertex_data);
    this.draw_mode = this.gl.LINES;
    this.line_width = options.line_width || 2;
    this.geometry_count = this.vertex_count / 2;
}

GLLines.prototype._render = function ()
{
    this.gl.lineWidth(this.line_width);
    if (typeof GLTriangles.prototype._render == 'function') {
        GLTriangles.prototype._render.call(this);
    }
};

if (module !== undefined) {
    module.exports = {
        GLGeometry: GLGeometry,
        GLTriangles: GLTriangles,
        GLPolyPoints: GLPolyPoints,
        GLLines: GLLines
    };
}

},{"./gl.js":4}],7:[function(_dereq_,module,exports){
var Point = _dereq_('../point.js');
var Geo = _dereq_('../geo.js');
var VectorRenderer = _dereq_('../vector_renderer.js');

var GL = _dereq_('./gl.js');
var GLBuilders = _dereq_('./gl_builders.js');
var GLGeometry = _dereq_('./gl_geom.js').GLGeometry;
var GLTriangles = _dereq_('./gl_geom.js').GLTriangles;
var GLPolyPoints = _dereq_('./gl_geom.js').GLPolyPoints;
var GLLines = _dereq_('./gl_geom.js').GLLines;

var mat4 = _dereq_('gl-matrix').mat4;
var vec3 = _dereq_('gl-matrix').vec3;

VectorRenderer.GLRenderer = GLRenderer;
GLRenderer.prototype = Object.create(VectorRenderer.prototype);
GLRenderer.debug = false;

GLRenderer.shader_sources = _dereq_('./gl_shaders.js');

function GLRenderer (tile_source, layers, styles, options)
{
    var options = options || {};

    VectorRenderer.call(this, 'GLRenderer', tile_source, layers, styles, options);

    GLBuilders.setTileScale(VectorRenderer.tile_scale);
    GL.Program.defines.TILE_SCALE = VectorRenderer.tile_scale + '.0';

    this.container = options.container;
    this.continuous_animation = false; // request redraw every frame
}

GLRenderer.prototype._init = function GLRendererInit ()
{
    this.container = this.container || document.body;
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = 0;
    this.canvas.style.left = 0;
    this.canvas.style.zIndex = -1;
    this.container.appendChild(this.canvas);

    this.gl = GL.getContext(this.canvas);

    var renderer = this;

    this.render_modes = {
        'polygons': {
            gl_program: new GL.Program(this.gl, GLRenderer.shader_sources['polygon_vertex'], GLRenderer.shader_sources['polygon_fragment']),
            makeGLGeometry: function (vertex_data) {
                return new GLTriangles(renderer.gl, this.gl_program, vertex_data);
            }
        },
        'polygons_noise': {
            gl_program: new GL.Program(this.gl, GLRenderer.shader_sources['polygon_vertex'], GLRenderer.shader_sources['polygon_fragment'], { defines: { 'EFFECT_NOISE_TEXTURE': true, 'EFFECT_NOISE_ANIMATABLE': true } }),
            makeGLGeometry: function (vertex_data) {
                return new GLTriangles(renderer.gl, this.gl_program, vertex_data);
            }
        },
        'points': {
            // TODO: replace relative shader paths with a better auto-pathing system
            // gl_program: new GL.Program.createProgramFromURLs(this.gl, VectorRenderer.library_base_url + '../shaders/point_vertex.glsl', VectorRenderer.library_base_url + '../shaders/point_fragment.glsl', { defines: { 'EFFECT_SCREEN_COLOR': true } }),
            gl_program: new GL.Program(this.gl, GLRenderer.shader_sources['point_vertex'], GLRenderer.shader_sources['point_fragment'], { defines: { 'EFFECT_SCREEN_COLOR': true } }),
            makeGLGeometry: function (vertex_data) {
                return new GLPolyPoints(renderer.gl, this.gl_program, vertex_data);
            }
        }
    };

    this.resizeMap(this.container.clientWidth, this.container.clientHeight);

    // this.zoom_step = 0.02; // for fractional zoom user adjustment
    this.start_time = +new Date();
    this.last_render_count = null;
    this.initInputHandlers();
};

// Determine a Z value that will stack features in a "painter's algorithm" style, first by layer, then by draw order within layer
// Features are assumed to be already sorted in desired draw order by the layer pre-processor
GLRenderer.calculateZ = function (layer, tile, layer_offset, feature_offset)
{
    // var layer_offset = layer_offset || 0;
    // var feature_offset = feature_offset || 0;
    var z = 0; // TODO: made this a no-op until revisiting where it should live - one-time calc here, in vertex layout/shader, etc.
    return z;
};

// Process geometry for tile - called by web worker
GLRenderer.addTile = function (tile, layers, styles)
{
    var layer, style, feature, z, mode;
    var vertex_data = {};

    // Join line test pattern
    // if (GLRenderer.debug) {
    //     tile.layers['roads'].features.push(GLRenderer.buildZigzagLineTestPattern());
    // }

    // Build raw geometry arrays
    tile.debug.features = 0;
    for (var ln=0; ln < layers.length; ln++) {
        layer = layers[ln];

        // Skip layers with no styles defined, or layers set to not be visible
        if (styles[layer.name] == null || !styles[layer.name].visible) {
            continue;
        }

        if (tile.layers[layer.name] != null) {
            var num_features = tile.layers[layer.name].features.length;

            // Rendering reverse order aka top to bottom
            for (var f = num_features-1; f >= 0; f--) {
                feature = tile.layers[layer.name].features[f];
                style = VectorRenderer.parseStyleForFeature(feature, styles[layer.name], tile);
                z = GLRenderer.calculateZ(layer, tile) + style.z;

                // Skip feature?
                if (style == null) {
                    continue;
                }

                // First feature in this render mode?
                mode = style.render_mode;
                if (vertex_data[mode] == null) {
                    vertex_data[mode] = [];
                }

                // DEBUGGING line/tile intersections returned as points
                // #mapzen,40.74733011589617,-73.97535145282747,17
                // if (feature.id == 157964813 && feature.geometry.type == 'Point') {
                //     style.color = [1, 1, 0];
                //     style.size = Style.width.pixels(10, tile);
                // }

                var vertex_constants = [
                    style.color[0], style.color[1], style.color[2],
                    ln
                    // TODO: add material info, etc.
                ];

                if (style.outline.color) {
                    var outline_vertex_constants = [
                        style.outline.color[0], style.outline.color[1], style.outline.color[2],
                        ln - 0.5 // outlines sit between layers, underneath current layer but above the one below
                    ];
                }

                var points = null,
                    lines = null,
                    polygons = null;

                if (feature.geometry.type == 'Polygon') {
                    polygons = [feature.geometry.coordinates];
                }
                else if (feature.geometry.type == 'MultiPolygon') {
                    polygons = feature.geometry.coordinates;
                }
                else if (feature.geometry.type == 'LineString') {
                    lines = [feature.geometry.coordinates];
                }
                else if (feature.geometry.type == 'MultiLineString') {
                    lines = feature.geometry.coordinates;
                }
                else if (feature.geometry.type == 'Point') {
                    points = [feature.geometry.coordinates];
                }
                else if (feature.geometry.type == 'MultiPoint') {
                    points = feature.geometry.coordinates;
                }

                if (polygons != null) {
                    // Extruded polygons (e.g. 3D buildings)
                    if (style.extrude && style.height) {
                        GLBuilders.buildExtrudedPolygons(polygons, z, style.height, style.min_height, vertex_data[mode], { vertex_constants: vertex_constants });
                    }
                    // Regular polygons
                    else {
                        GLBuilders.buildPolygons(polygons, z, vertex_data[mode], { vertex_constants: vertex_constants });

                        // var polygon_vertex_constants = [z, 0, 0, 1].concat(vertex_constants); // upwards-facing normal
                        // GLBuilders.buildPolygons2(
                        //     polygons,
                        //     function (vertices) {
                        //         GL.addVertices(vertices.positions, vertex_data[mode], polygon_vertex_constants);
                        //     }
                        // );
                    }

                    // Polygon outlines
                    if (style.outline.color && style.outline.width) {
                        for (var mpc=0; mpc < polygons.length; mpc++) {
                            GLBuilders.buildPolylines(polygons[mpc], GLRenderer.calculateZ(layer, tile, -0.5), style.outline.width, vertex_data[mode], { closed_polygon: true, remove_tile_edges: true, vertex_constants: outline_vertex_constants });
                        }
                    }
                }

                if (lines != null) {
                    GLBuilders.buildPolylines(lines, z, style.width, vertex_data[mode], { vertex_constants: vertex_constants });

                    // Line outlines
                    if (style.outline.color && style.outline.width) {
                        GLBuilders.buildPolylines(lines, GLRenderer.calculateZ(layer, tile, -0.5), style.width + 2 * style.outline.width, vertex_data[mode], { vertex_constants: outline_vertex_constants });
                    }
                }

                if (points != null) {
                    // console.log(JSON.stringify(feature));
                    // NOTE: adding to z to experiment with "floating" POIs
                    var point_vertex_constants = [z + 1, 0, 0, 1].concat(vertex_constants); // upwards-facing normal
                    GLBuilders.buildQuads(
                        points, style.size * 2, style.size * 2,
                        function (vertices) {
                            var vs = vertices.positions;

                            // Alternate vertex layout for 'points' shader
                            if (mode == 'points') {
                                point_vertex_constants = vertex_constants;

                                for (var v in vertices.positions) {
                                    vs[v] = vertices.positions[v].concat(z+ 1, vertices.texcoords[v]);
                                }
                            }

                            // GL.addVertices(vertices.positions, vertex_data[mode], point_vertex_constants);
                            GL.addVertices(vs, vertex_data[mode], point_vertex_constants);
                        },
                        { texcoords: (mode == 'points') }
                    );
                }

                tile.debug.features++;
            }
        }
    }

    tile.vertex_data = {};
    for (var s in vertex_data) {
        tile.vertex_data[s] = new Float32Array(vertex_data[s]);
    }

    return tile;
};

// Called on main thread when a web worker completes processing for a single tile
GLRenderer.prototype._tileWorkerCompleted = function (tile)
{
    var vertex_data = tile.vertex_data;

    // Cleanup existing GL geometry objects
    this.freeTileResources(tile);
    tile.gl_geometry = {};

    // Create GL geometry objects
    for (var s in vertex_data) {
        tile.gl_geometry[s] = this.render_modes[s].makeGLGeometry(vertex_data[s]);
    }

    tile.debug.geometries = 0;
    tile.debug.buffer_size = 0;
    for (var p in tile.gl_geometry) {
        tile.debug.geometries += tile.gl_geometry[p].geometry_count;
        tile.debug.buffer_size += tile.gl_geometry[p].vertex_data.byteLength;
    }

    tile.debug.geom_ratio = (tile.debug.geometries / tile.debug.features).toFixed(1);

    // Selection - experimental/future
    // var gl_renderer = this;
    // var pixel = new Uint8Array(4);
    // tileDiv.onmousemove = function (event) {
    //     // console.log(event.offsetX + ', ' + event.offsetY + ' | ' + parseInt(tileDiv.style.left) + ', ' + parseInt
    //     var p = Point(
    //         event.offsetX + parseInt(tileDiv.style.left),
    //         event.offsetY + parseInt(tileDiv.style.top)
    //     );
    //     gl_renderer.gl.readPixels(p.x, p.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    //     console.log(p.x + ', ' + p.y + ': (' + pixel[0] + ', ' + pixel[1] + ', ' + pixel[2] + ', ' + pixel[3] + ')')
    // };

    delete tile.vertex_data; // TODO: might want to preserve this for rebuilding geometries when styles/etc. change?
};

GLRenderer.prototype.removeTile = function GLRendererRemoveTile (key)
{
    if (this.map_zooming == true) {
        return; // short circuit tile removal, GL renderer will sweep out tiles by zoom level when zoom ends
    }

    this.freeTileResources(this.tiles[key]);
    VectorRenderer.prototype.removeTile.apply(this, arguments);
};

// Free any GL / owned resources
GLRenderer.prototype.freeTileResources = function (tile)
{
    if (tile != null && tile.gl_geometry != null) {
        for (var p in tile.gl_geometry) {
            tile.gl_geometry[p].destroy();
        }
        tile.gl_geometry = null;
    }
};

GLRenderer.prototype.preserve_tiles_within_zoom = 2;
GLRenderer.prototype.setZoom = function (zoom)
{
    // Schedule GL tiles for removal on zoom
    console.log("renderer.map_last_zoom: " + this.map_last_zoom);

    this.map_zooming = false;
    this.zoom = zoom;
    var below = this.zoom;
    var above = this.zoom;
    if (Math.abs(this.zoom - this.map_last_zoom) <= this.preserve_tiles_within_zoom) {
        if (this.zoom > this.map_last_zoom) {
            below = this.zoom - this.preserve_tiles_within_zoom;
        }
        else {
            above = this.zoom + this.preserve_tiles_within_zoom;
        }
    }
    this.removeTilesOutsideZoomRange(below, above);
    this.map_last_zoom = this.zoom;
    this.dirty = true; // calling because this is a full override of the parent class
};

GLRenderer.prototype.removeTilesOutsideZoomRange = function (below, above)
{
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
    for (var r=0; r < remove_tiles.length; r++) {
        var key = remove_tiles[r];
        console.log("removed " + key + " (outside range [" + below + ", " + above + "])");
        this.removeTile(key);
    }
};

// Overrides base class method (a no op)
GLRenderer.prototype.resizeMap = function (width, height)
{
    VectorRenderer.prototype.resizeMap.apply(this, arguments);

    this.css_size = { width: width, height: height };
    this.device_size = { width: Math.round(this.css_size.width * this.device_pixel_ratio), height: Math.round(this.css_size.height * this.device_pixel_ratio) };

    this.canvas.style.width = this.css_size.width + 'px';
    this.canvas.style.height = this.css_size.height + 'px';
    this.canvas.width = this.device_size.width;
    this.canvas.height = this.device_size.height;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
};

GLRenderer.prototype._render = function GLRendererRender ()
{
    var gl = this.gl;

    this.input();

    // Reset frame state
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Render tiles grouped by renderg mode (GL program)
    var render_count = 0;
    for (var mode in this.render_modes) {
        var gl_program = this.render_modes[mode].gl_program;

        gl.useProgram(gl_program.program);

        // TODO: set these once per program, don't set when they haven't changed
        gl_program.uniform('2f', 'u_resolution', this.device_size.width, this.device_size.height);
        gl_program.uniform('2f', 'u_aspect', this.device_size.width / this.device_size.height, 1.0);
        gl_program.uniform('1f', 'u_time', ((+new Date()) - this.start_time) / 1000);

        var center = Geo.latLngToMeters(Point(this.center.lng, this.center.lat));
        // gl_program.uniform('2f', 'u_map_center', center.x, center.y);
        gl_program.uniform('1f', 'u_map_zoom', this.zoom); // Math.floor(this.zoom) + (Math.log((this.zoom % 1) + 1) / Math.LN2 // scale fractional zoom by log
        gl_program.uniform('1f', 'u_num_layers', this.layers.length);

        var meters_per_pixel = Geo.min_zoom_meters_per_pixel / Math.pow(2, this.zoom);
        gl_program.uniform('1f', 'u_meters_per_pixel', meters_per_pixel);

        var meter_zoom = Point(this.css_size.width / 2 * meters_per_pixel, this.css_size.height / 2 * meters_per_pixel);
        // gl_program.uniform('2f', 'u_meter_zoom', meter_zoom.x, meter_zoom.y);

        // Matrix transforms
        var tile_view_mat = mat4.create();
        var tile_world_mat = mat4.create();
        var meter_view_mat = mat4.create();

        // Convert mercator meters to screen space
        mat4.scale(meter_view_mat, meter_view_mat, vec3.fromValues(1 / meter_zoom.x, 1 / meter_zoom.y, 1 / meter_zoom.y));
        gl_program.uniform('Matrix4fv', 'u_meter_view', gl.FALSE, meter_view_mat);

        // TODO: make a list of renderable tiles once per frame, outside this loop
        // Render tile GL geometries
        var capped_zoom = Math.min(~~this.zoom, this.tile_source.max_zoom || ~~this.zoom);
        for (var t in this.tiles) {
            var tile = this.tiles[t];
            if (tile.loaded == true &&
                tile.visible == true &&
                Math.min(tile.coords.z, this.tile_source.max_zoom || tile.coords.z) == capped_zoom) {

                if (tile.gl_geometry[mode] != null) {
                    // gl_program.uniform('2f', 'u_tile_min', tile.min.x, tile.min.y);
                    // gl_program.uniform('2f', 'u_tile_max', tile.max.x, tile.max.y);

                    // Tile view matrix - transform tile space into view space (meters, relative to camera)
                    mat4.identity(tile_view_mat);
                    mat4.translate(tile_view_mat, tile_view_mat, vec3.fromValues(tile.min.x - center.x, tile.min.y - center.y, 0)); // adjust for tile origin & map center
                    mat4.scale(tile_view_mat, tile_view_mat, vec3.fromValues((tile.max.x - tile.min.x) / VectorRenderer.tile_scale, -1 * (tile.max.y - tile.min.y) / VectorRenderer.tile_scale, 1)); // scale tile local coords to meters
                    gl_program.uniform('Matrix4fv', 'u_tile_view', gl.FALSE, tile_view_mat);

                    // Tile world matrix - transform tile space into world space (meters, absolute mercator position)
                    mat4.identity(tile_world_mat);
                    mat4.translate(tile_world_mat, tile_world_mat, vec3.fromValues(tile.min.x, tile.min.y, 0));
                    mat4.scale(tile_world_mat, tile_world_mat, vec3.fromValues((tile.max.x - tile.min.x) / VectorRenderer.tile_scale, -1 * (tile.max.y - tile.min.y) / VectorRenderer.tile_scale, 1)); // scale tile local coords to meters
                    gl_program.uniform('Matrix4fv', 'u_tile_world', gl.FALSE, tile_world_mat);


                    tile.gl_geometry[mode].render();
                    render_count += tile.gl_geometry[mode].geometry_count;
                }
            }
        }
    }

    if (render_count != this.last_render_count) {
        console.log("rendered " + render_count + " primitives");
    }
    this.last_render_count = render_count;

    if (this.continuous_animation == true) {
        this.dirty = true;
    }

    return true;
};

// Sum of a debug property across tiles
GLRenderer.prototype.getDebugSum = function (prop, filter)
{
    var sum = 0;
    for (var t in this.tiles) {
        if (this.tiles[t].debug[prop] != null && (typeof filter != 'function' || filter(this.tiles[t]) == true)) {
            sum += this.tiles[t].debug[prop];
        }
    }
    return sum;
};

// Average of a debug property across tiles
GLRenderer.prototype.getDebugAverage = function (prop, filter)
{
    return this.getDebugSum(prop, filter) / Object.keys(this.tiles).length;
};

// User input
// TODO: restore fractional zoom support once leaflet animation refactor pull request is merged

GLRenderer.prototype.initInputHandlers = function GLRendererInitInputHandlers ()
{
    var gl_renderer = this;
    gl_renderer.key = null;

    document.addEventListener('keydown', function (event) {
        if (event.keyCode == 37) {
            gl_renderer.key = 'left';
        }
        else if (event.keyCode == 39) {
            gl_renderer.key = 'right';
        }
        else if (event.keyCode == 38) {
            gl_renderer.key = 'up';
        }
        else if (event.keyCode == 40) {
            gl_renderer.key = 'down';
        }
        else if (event.keyCode == 83) { // s
            console.log("reloading shaders");
            for (var mode in this.render_modes) {
                this.render_modes[mode].gl_program.compile();
            }
            gl_renderer.dirty = true;
        }
    });

    document.addEventListener('keyup', function (event) {
        gl_renderer.key = null;
    });
};

GLRenderer.prototype.input = function GLRendererInput ()
{
    // // Fractional zoom scaling
    // if (this.key == 'up') {
    //     this.setZoom(this.zoom + this.zoom_step);
    // }
    // else if (this.key == 'down') {
    //     this.setZoom(this.zoom - this.zoom_step);
    // }
};

if (module !== undefined) {
    module.exports = GLRenderer;
}

},{"../geo.js":3,"../point.js":11,"../vector_renderer.js":14,"./gl.js":4,"./gl_builders.js":5,"./gl_geom.js":6,"./gl_shaders.js":8,"gl-matrix":1}],8:[function(_dereq_,module,exports){
// Generated from GLSL files, don't edit!
var shader_sources = {};

shader_sources['point_fragment'] =
"\n" +
"#define GLSLIFY 1\n" +
"\n" +
"uniform vec2 u_resolution;\n" +
"varying vec3 v_color;\n" +
"varying vec2 v_texcoord;\n" +
"void main(void) {\n" +
"  vec3 color = v_color;\n" +
"  float len = length(v_texcoord);\n" +
"  if(len > 1.) {\n" +
"    discard;\n" +
"  }\n" +
"  color *= (1. - smoothstep(.25, 1., len)) + 0.5;\n" +
"  #if defined(EFFECT_SCREEN_COLOR)\n" +
"  color += vec3(gl_FragCoord.x / u_resolution.x, 0.0, gl_FragCoord.y / u_resolution.y);\n" +
"  #endif\n" +
"  gl_FragColor = vec4(color, 1.);\n" +
"}\n" +
"";

shader_sources['point_vertex'] =
"\n" +
"#define GLSLIFY 1\n" +
"\n" +
"uniform mat4 u_tile_view;\n" +
"uniform mat4 u_meter_view;\n" +
"uniform float u_num_layers;\n" +
"attribute vec3 a_position;\n" +
"attribute vec2 a_texcoord;\n" +
"attribute vec3 a_color;\n" +
"attribute float a_layer;\n" +
"varying vec3 v_color;\n" +
"varying vec2 v_texcoord;\n" +
"float a_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" +
"  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" +
"  float z_layer = (layer + 1.) * z_layer_scale;\n" +
"  z = z_layer + clamp(z, 0., z_layer_scale);\n" +
"  z = (z_layer_range - z) / z_layer_range;\n" +
"  return z;\n" +
"}\n" +
"void main() {\n" +
"  vec4 position = u_meter_view * u_tile_view * vec4(a_position, 1.);\n" +
"  v_color = a_color;\n" +
"  v_texcoord = a_texcoord;\n" +
"  position.z = a_x_calculateZ(position.z, a_layer, u_num_layers, 256.);\n" +
"  gl_Position = position;\n" +
"}\n" +
"";

shader_sources['polygon_fragment'] =
"\n" +
"#define GLSLIFY 1\n" +
"\n" +
"uniform vec2 u_resolution;\n" +
"uniform vec2 u_aspect;\n" +
"uniform mat4 u_meter_view;\n" +
"uniform float u_meters_per_pixel;\n" +
"uniform float u_time;\n" +
"varying vec3 v_color;\n" +
"#if !defined(LIGHTING_VERTEX)\n" +
"\n" +
"varying vec4 v_position;\n" +
"varying vec3 v_normal;\n" +
"#endif\n" +
"\n" +
"#if defined(EFFECT_NOISE_TEXTURE)\n" +
"\n" +
"varying vec4 v_position_world;\n" +
"vec3 a_x_mod289(vec3 x) {\n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0;\n" +
"}\n" +
"vec4 a_x_mod289(vec4 x) {\n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0;\n" +
"}\n" +
"vec4 a_x_permute(vec4 x) {\n" +
"  return a_x_mod289(((x * 34.0) + 1.0) * x);\n" +
"}\n" +
"vec4 a_x_taylorInvSqrt(vec4 r) {\n" +
"  return 1.79284291400159 - 0.85373472095314 * r;\n" +
"}\n" +
"vec3 a_x_fade(vec3 t) {\n" +
"  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\n" +
"}\n" +
"float a_x_cnoise(vec3 P) {\n" +
"  vec3 Pi0 = floor(P);\n" +
"  vec3 Pi1 = Pi0 + vec3(1.0);\n" +
"  Pi0 = a_x_mod289(Pi0);\n" +
"  Pi1 = a_x_mod289(Pi1);\n" +
"  vec3 Pf0 = fract(P);\n" +
"  vec3 Pf1 = Pf0 - vec3(1.0);\n" +
"  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n" +
"  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n" +
"  vec4 iz0 = Pi0.zzzz;\n" +
"  vec4 iz1 = Pi1.zzzz;\n" +
"  vec4 ixy = a_x_permute(a_x_permute(ix) + iy);\n" +
"  vec4 ixy0 = a_x_permute(ixy + iz0);\n" +
"  vec4 ixy1 = a_x_permute(ixy + iz1);\n" +
"  vec4 gx0 = ixy0 * (1.0 / 7.0);\n" +
"  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n" +
"  gx0 = fract(gx0);\n" +
"  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n" +
"  vec4 sz0 = step(gz0, vec4(0.0));\n" +
"  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n" +
"  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n" +
"  vec4 gx1 = ixy1 * (1.0 / 7.0);\n" +
"  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n" +
"  gx1 = fract(gx1);\n" +
"  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n" +
"  vec4 sz1 = step(gz1, vec4(0.0));\n" +
"  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n" +
"  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n" +
"  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\n" +
"  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\n" +
"  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\n" +
"  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\n" +
"  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\n" +
"  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\n" +
"  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\n" +
"  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\n" +
"  vec4 norm0 = a_x_taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n" +
"  g000 *= norm0.x;\n" +
"  g010 *= norm0.y;\n" +
"  g100 *= norm0.z;\n" +
"  g110 *= norm0.w;\n" +
"  vec4 norm1 = a_x_taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n" +
"  g001 *= norm1.x;\n" +
"  g011 *= norm1.y;\n" +
"  g101 *= norm1.z;\n" +
"  g111 *= norm1.w;\n" +
"  float n000 = dot(g000, Pf0);\n" +
"  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n" +
"  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n" +
"  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n" +
"  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n" +
"  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n" +
"  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n" +
"  float n111 = dot(g111, Pf1);\n" +
"  vec3 fade_xyz = a_x_fade(Pf0);\n" +
"  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n" +
"  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n" +
"  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n" +
"  return 2.2 * n_xyz;\n" +
"}\n" +
"#endif\n" +
"\n" +
"const float light_ambient = 0.5;\n" +
"vec3 c_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" +
"  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" +
"  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" +
"  return color;\n" +
"}\n" +
"vec3 d_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" +
"  light_dir = normalize(light_dir);\n" +
"  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" +
"  return color;\n" +
"}\n" +
"vec3 b_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" +
"  \n" +
"  #if defined(LIGHTING_POINT)\n" +
"  color = c_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" +
"  #elif defined(LIGHTING_NIGHT)\n" +
"  color = c_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" +
"  #elif defined(LIGHTING_DIRECTION)\n" +
"  color = d_x_directionalLight(normal, color, light_dir, light_ambient);\n" +
"  #else\n" +
"  color = color;\n" +
"  #endif\n" +
"  return color;\n" +
"}\n" +
"void main(void) {\n" +
"  vec3 color;\n" +
"  #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" +
"  color = b_x_lighting(v_position, v_normal, v_color, vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" +
"  #else\n" +
"  color = v_color;\n" +
"  #endif\n" +
"  \n" +
"  #if defined(EFFECT_SPOTLIGHT)\n" +
"  vec2 position = gl_FragCoord.xy / u_resolution.xy;\n" +
"  position = position * 2.0 - 1.0;\n" +
"  position *= u_aspect;\n" +
"  color *= max(1.0 - distance(position, vec2(0.0, 0.0)), 0.2);\n" +
"  #endif\n" +
"  \n" +
"  #if defined(EFFECT_COLOR_BLEED)\n" +
"  color += vec3(gl_FragCoord.x / u_resolution.x, 0.0, gl_FragCoord.y / u_resolution.y);\n" +
"  color.r += sin(u_time / 3.0);\n" +
"  #endif\n" +
"  \n" +
"  #if defined (EFFECT_NOISE_TEXTURE)\n" +
"  \n" +
"  #if defined(EFFECT_NOISE_ANIMATABLE) && defined(EFFECT_NOISE_ANIMATED)\n" +
"  color *= (abs(a_x_cnoise((v_position_world.xyz + vec3(u_time * 5., u_time * 7.5, u_time * 10.)) / 10.0)) / 4.0) + 0.75;\n" +
"  #endif\n" +
"  \n" +
"  #ifndef EFFECT_NOISE_ANIMATABLE\n" +
"  color *= (abs(a_x_cnoise(v_position_world.xyz / 10.0)) / 4.0) + 0.75;\n" +
"  #endif\n" +
"  \n" +
"  #endif\n" +
"  gl_FragColor = vec4(color, 1.0);\n" +
"}\n" +
"";

shader_sources['polygon_vertex'] =
"\n" +
"#define GLSLIFY 1\n" +
"\n" +
"uniform vec2 u_resolution;\n" +
"uniform vec2 u_aspect;\n" +
"uniform float u_time;\n" +
"uniform mat4 u_tile_world;\n" +
"uniform mat4 u_tile_view;\n" +
"uniform mat4 u_meter_view;\n" +
"uniform float u_meters_per_pixel;\n" +
"uniform float u_num_layers;\n" +
"attribute vec3 a_position;\n" +
"attribute vec3 a_normal;\n" +
"attribute vec3 a_color;\n" +
"attribute float a_layer;\n" +
"varying vec3 v_color;\n" +
"#if !defined(LIGHTING_VERTEX)\n" +
"\n" +
"varying vec4 v_position;\n" +
"varying vec3 v_normal;\n" +
"#endif\n" +
"\n" +
"#if defined(EFFECT_NOISE_TEXTURE)\n" +
"\n" +
"varying vec4 v_position_world;\n" +
"#endif\n" +
"\n" +
"const float light_ambient = 0.5;\n" +
"vec4 a_x_perspective(vec4 position, const vec2 perspective_offset, const vec2 perspective_factor) {\n" +
"  position.xy += position.z * perspective_factor * (position.xy - perspective_offset);\n" +
"  return position;\n" +
"}\n" +
"vec4 b_x_isometric(vec4 position, const vec2 axis, const float multiplier) {\n" +
"  position.xy += position.z * axis * multiplier / u_aspect;\n" +
"  return position;\n" +
"}\n" +
"vec4 c_x_popup(vec4 position, const vec2 center, const float radius) {\n" +
"  if(position.z > 0.) {\n" +
"    float cd = distance(position.xy, center);\n" +
"    float popup_fade_inner = radius * 2. / 3.;\n" +
"    float popup_fade_outer = radius;\n" +
"    if(cd > popup_fade_inner) {\n" +
"      position.z *= 1.0 - smoothstep(popup_fade_inner, popup_fade_outer, cd);\n" +
"    }\n" +
"  }\n" +
"  return position;\n" +
"}\n" +
"float d_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" +
"  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" +
"  float z_layer = (layer + 1.) * z_layer_scale;\n" +
"  z = z_layer + clamp(z, 0., z_layer_scale);\n" +
"  z = (z_layer_range - z) / z_layer_range;\n" +
"  return z;\n" +
"}\n" +
"vec3 f_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" +
"  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" +
"  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" +
"  return color;\n" +
"}\n" +
"vec3 g_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" +
"  light_dir = normalize(light_dir);\n" +
"  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" +
"  return color;\n" +
"}\n" +
"vec3 e_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" +
"  \n" +
"  #if defined(LIGHTING_POINT)\n" +
"  color = f_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" +
"  #elif defined(LIGHTING_NIGHT)\n" +
"  color = f_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" +
"  #elif defined(LIGHTING_DIRECTION)\n" +
"  color = g_x_directionalLight(normal, color, light_dir, light_ambient);\n" +
"  #else\n" +
"  color = color;\n" +
"  #endif\n" +
"  return color;\n" +
"}\n" +
"void main() {\n" +
"  vec4 position = u_tile_view * vec4(a_position, 1.);\n" +
"  vec4 position_world = u_tile_world * vec4(a_position, 1.);\n" +
"  if(position_world.z > 0.) {\n" +
"    \n" +
"    #if defined(ANIMATION_ELEVATOR)\n" +
"    position.z *= max((sin(position_world.z + u_time) + 1.0) / 2.0, 0.05);\n" +
"    #elif defined(ANIMATION_WAVE)\n" +
"    position.z *= max((sin(position_world.x / 100.0 + u_time) + 1.0) / 2.0, 0.05);\n" +
"    #endif\n" +
"    \n" +
"  }\n" +
"  #if defined(PROJECTION_POPUP)\n" +
"  position.z *= 1.1;\n" +
"  position = c_x_popup(position, vec2(0., 0.), 225. * u_meters_per_pixel);\n" +
"  #endif\n" +
"  \n" +
"  #if defined(EFFECT_NOISE_TEXTURE)\n" +
"  v_position_world = position_world;\n" +
"  #endif\n" +
"  \n" +
"  #if defined(LIGHTING_VERTEX)\n" +
"  v_color = e_x_lighting(position, a_normal, a_color, vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" +
"  #else\n" +
"  v_position = position;\n" +
"  v_normal = a_normal;\n" +
"  v_color = a_color;\n" +
"  #endif\n" +
"  position = u_meter_view * position;\n" +
"  #if defined(PROJECTION_PERSPECTIVE)\n" +
"  position = a_x_perspective(position, vec2(-0.25, -0.25), vec2(0.6, 0.6));\n" +
"  #elif defined(PROJECTION_ISOMETRIC) || defined(PROJECTION_POPUP)\n" +
"  position = b_x_isometric(position, vec2(0., 1.), 1.);\n" +
"  #endif\n" +
"  position.z = d_x_calculateZ(position.z, a_layer, u_num_layers, 4096.);\n" +
"  gl_Position = position;\n" +
"}\n" +
"";

if (module.exports !== undefined) { module.exports = shader_sources; }


},{}],9:[function(_dereq_,module,exports){
var VectorRenderer = _dereq_('./vector_renderer.js');

var LeafletLayer = L.GridLayer.extend({

    options: {
        vectorRenderer: 'canvas'
    },

    initialize: function (options) {
        L.setOptions(this, options);
        this.options.vectorRenderer = this.options.vectorRenderer || 'GLRenderer';
        this._renderer = VectorRenderer.create(this.options.vectorRenderer, this.options.vectorTileSource, this.options.vectorLayers, this.options.vectorStyles, { num_workers: this.options.numWorkers });
        this._renderer.debug = this.options.debug;
        this._renderer.continuous_animation = false; // set to true for animatinos, etc. (eventually will be automated)
    },

    // Finish initializing renderer and setup events when layer is added to map
    onAdd: function (map) {
        var layer = this;

        layer.on('tileunload', function (event) {
            var tile = event.tile;
            var key = tile.getAttribute('data-tile-key');
            layer._renderer.removeTile(key);
        });

        layer._map.on('resize', function () {
            var size = layer._map.getSize();
            layer._renderer.resizeMap(size.x, size.y);
            layer.updateBounds();
        });

        layer._map.on('move', function () {
            var center = layer._map.getCenter();
            layer._renderer.setCenter(center.lng, center.lat);
            layer.updateBounds();
        });

        layer._map.on('zoomstart', function () {
            console.log("map.zoomstart " + layer._map.getZoom());
            layer._renderer.startZoom();
        });

        layer._map.on('zoomend', function () {
            console.log("map.zoomend " + layer._map.getZoom());
            layer._renderer.setZoom(layer._map.getZoom());
        });

        // Canvas element will be inserted after map container (leaflet transforms shouldn't be applied to the GL canvas)
        // TODO: find a better way to deal with this? right now GL map only renders correctly as the bottom layer
        layer._renderer.container = layer._map.getContainer();

        var center = layer._map.getCenter();
        layer._renderer.setCenter(center.lng, center.lat);
        layer._renderer.setZoom(layer._map.getZoom());
        layer.updateBounds();

        L.GridLayer.prototype.onAdd.apply(this, arguments);
        layer._renderer.init();
    },

    onRemove: function (map) {
        L.GridLayer.prototype.onRemove.apply(this, arguments);
        // TODO: remove event handlers, destroy map
    },

    createTile: function (coords, done) {
        var div = document.createElement('div');
        this._renderer.loadTile(coords, div, done);
        return div;
    },

    updateBounds: function () {
        var layer = this;
        var bounds = layer._map.getBounds();
        layer._renderer.setBounds(bounds.getSouthWest(), bounds.getNorthEast());
    },

    render: function () {
        this._renderer.render();
    }

});

var leafletLayer = function (options) {
    return new LeafletLayer(options);
};

if (module !== undefined) {
    module.exports = {
        LeafletLayer: LeafletLayer,
        leafletLayer: leafletLayer
    };
}

},{"./vector_renderer.js":14}],10:[function(_dereq_,module,exports){
// Modules and dependencies to expose in the public Tangram module

// The leaflet layer plugin is currently the primary means of using the library
var Leaflet = _dereq_('./leaflet_layer.js');

// Renderer modules need to be explicitly included since they are not otherwise referenced
_dereq_('./gl/gl_renderer.js');
_dereq_('./canvas/canvas_renderer.js');

// GL functions included for easier debugging / direct access to setting global defines, reloading programs, etc.
var GL = _dereq_('./gl/gl.js');

if (module !== undefined) {
    module.exports = {
        LeafletLayer: Leaflet.LeafletLayer,
        leafletLayer: Leaflet.leafletLayer,
        GL: GL
    };
}

},{"./canvas/canvas_renderer.js":2,"./gl/gl.js":4,"./gl/gl_renderer.js":7,"./leaflet_layer.js":9}],11:[function(_dereq_,module,exports){
// Point
function Point (x, y)
{
    return { x: x, y: y };
}

Point.copy = function (p)
{
    if (p == null) {
        return null;
    }
    return { x: p.x, y: p.y };
};

if (module !== undefined) {
    module.exports = Point;
}

},{}],12:[function(_dereq_,module,exports){
/*** Style helpers ***/
var Geo = _dereq_('./geo.js');

var Style = {};

Style.color = {
    pseudoRandomGrayscale: function (f) { var c = Math.max((parseInt(f.id, 16) % 100) / 100, 0.4); return [0.7 * c, 0.7 * c, 0.7 * c]; }, // pseudo-random grayscale by geometry id
    pseudoRandomColor: function (f) { return [0.7 * (parseInt(f.id, 16) / 100 % 1), 0.7 * (parseInt(f.id, 16) / 10000 % 1), 0.7 * (parseInt(f.id, 16) / 1000000 % 1)]; }, // pseudo-random color by geometry id
    randomColor: function (f) { return [0.7 * Math.random(), 0.7 * Math.random(), 0.7 * Math.random()]; } // random color
};

Style.width = {
    pixels: function (p) { return function (f, t) { return (typeof p == 'function' ? p(f, t) : p) * Geo.units_per_pixel; }; }, // local tile units for a given pixel width
    meters: function (p) { return function (f, t) { return (typeof p == 'function' ? p(f, t) : p) * Geo.units_per_meter[t.coords.z]; }; }  // local tile units for a given meter width
};

Style.units_per_meter = function (t) {
    return Geo.units_per_meter[t.coords.z];
};

Style.units_per_pixel = function() {
    return Geo.units_per_pixel;
};

if (module !== undefined) {
    module.exports = Style;
}

},{"./geo.js":3}],13:[function(_dereq_,module,exports){
/*** Vector functions - vectors provided as [x, y, z] arrays ***/

var Vector = {};

// Vector length squared
Vector.lengthSq = function (v)
{
    if (v.length == 2) {
        return (v[0]*v[0] + v[1]*v[1]);
    }
    else {
        return (v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    }
};

// Vector length
Vector.length = function (v)
{
    return Math.sqrt(Vector.lengthSq(v));
};

// Normalize a vector
Vector.normalize = function (v)
{
    var d;
    if (v.length == 2) {
        d = v[0]*v[0] + v[1]*v[1];
        d = Math.sqrt(d);

        if (d != 0) {
            return [v[0] / d, v[1] / d];
        }
        return [0, 0];
    }
    else {
        var d = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
        d = Math.sqrt(d);

        if (d != 0) {
            return [v[0] / d, v[1] / d, v[2] / d];
        }
        return [0, 0, 0];
    }
};

// Cross product of two vectors
Vector.cross  = function (v1, v2)
{
    return [
        (v1[1] * v2[2]) - (v1[2] * v2[1]),
        (v1[2] * v2[0]) - (v1[0] * v2[2]),
        (v1[0] * v2[1]) - (v1[1] * v2[0])
    ];
};

// Find the intersection of two lines specified as segments from points (p1, p2) and (p3, p4)
// http://en.wikipedia.org/wiki/Line-line_intersection
// http://en.wikipedia.org/wiki/Cramer's_rule
Vector.lineIntersection = function (p1, p2, p3, p4, parallel_tolerance)
{
    var parallel_tolerance = parallel_tolerance || 0.01;

    // a1*x + b1*y = c1 for line (x1, y1) to (x2, y2)
    // a2*x + b2*y = c2 for line (x3, y3) to (x4, y4)
    var a1 = p1[1] - p2[1]; // y1 - y2
    var b1 = p1[0] - p2[0]; // x1 - x2
    var a2 = p3[1] - p4[1]; // y3 - y4
    var b2 = p3[0] - p4[0]; // x3 - x4
    var c1 = (p1[0] * p2[1]) - (p1[1] * p2[0]); // x1*y2 - y1*x2
    var c2 = (p3[0] * p4[1]) - (p3[1] * p4[0]); // x3*y4 - y3*x4
    var denom = (b1 * a2) - (a1 * b2);

    if (Math.abs(denom) > parallel_tolerance) {
        return [
            ((c1 * b2) - (b1 * c2)) / denom,
            ((c1 * a2) - (a1 * c2)) / denom
        ];
    }
    return null; // return null if lines are (close to) parallel
};

if (module !== undefined) {
    module.exports = Vector;
}

},{}],14:[function(_dereq_,module,exports){
var Point = _dereq_('./point.js');
var Geo = _dereq_('./geo.js');
var Style = _dereq_('./style.js');

// Global setup
findBaseLibraryURL();
VectorRenderer.tile_scale = 4096; // coordinates are locally scaled to the range [0, tile_scale]
Geo.setTileScale(VectorRenderer.tile_scale);

// Layers & styles: pass an object directly, or a URL as string to load remotely
function VectorRenderer (type, tile_source, layers, styles, options)
{
    var options = options || {};
    this.type = type;
    this.tile_source = tile_source;
    this.tiles = {};
    this.num_workers = options.num_workers || 1;

    this.layer_source = VectorRenderer.urlForPath(layers); // TODO: fix this for layers provided as objects, this assumes a URL is passed
    if (typeof(layers) == 'string') {
        this.layers = VectorRenderer.loadLayers(layers);
    }
    else {
        this.layers = layers;
    }

    this.style_source = VectorRenderer.urlForPath(styles); // TODO: fix this for styles provided as objects, this assumes a URL is passed
    if (typeof(styles) == 'string') {
        this.styles = VectorRenderer.loadStyles(styles);
    }
    else {
        this.styles = styles;
    }

    this.createWorkers();

    this.zoom = null;
    this.center = null;
    this.device_pixel_ratio = window.devicePixelRatio || 1;
    this.dirty = true; // request a redraw
    this.initialized = false;
}

VectorRenderer.create = function (type, tile_source, layers, styles, options)
{
    return new VectorRenderer[type](tile_source, layers, styles, options);
};

VectorRenderer.prototype.init = function ()
{
    // Child class-specific initialization (e.g. GL context creation)
    if (typeof(this._init) == 'function') {
        this._init.apply(this, arguments);
    }

    var renderer = this;
    this.workers.forEach(function(worker) {
        worker.addEventListener('message', renderer.workerBuildTileCompleted.bind(renderer));
    });

    this.initialized = true;
};

// Web workers handle heavy duty geometry processing
VectorRenderer.prototype.createWorkers = function ()
{
    var renderer = this;
    var url = VectorRenderer.library_base_url + 'vector-map-worker.min.js' + '?' + (+new Date());

    // To allow workers to be loaded cross-domain, first load worker source via XHR, then create a local URL via a blob
    var req = new XMLHttpRequest();
    req.onload = function () {
        var worker_local_url = window.URL.createObjectURL(new Blob([req.response], { type: 'application/javascript' }));

        renderer.workers = [];
        for (var w=0; w < renderer.num_workers; w++) {
            renderer.workers.push(new Worker(worker_local_url));
        }
    };
    req.open('GET', url, false /* async flag */);
    req.send();

    // Alternate for debugging - tradtional method of loading from remote URL instead of XHR-to-local-blob
    // renderer.workers = [];
    // for (var w=0; w < renderer.num_workers; w++) {
    //     renderer.workers.push(new Worker(url));
    // }

    this.next_worker = 0;
};

// Post a message about a tile to the next worker (round robbin)
VectorRenderer.prototype.workerPostMessageForTile = function (tile, message)
{
    tile.worker = this.next_worker;
    this.workers[tile.worker].postMessage(message);
    this.next_worker = (tile.worker + 1) % this.workers.length;
};

VectorRenderer.prototype.setCenter = function (lng, lat)
{
    this.center = { lng: lng, lat: lat };
    this.dirty = true;
};

VectorRenderer.prototype.setZoom = function (zoom)
{
    this.map_last_zoom = this.zoom;
    this.zoom = zoom;
    this.map_zooming = false;
    this.dirty = true;
};

VectorRenderer.prototype.startZoom = function ()
{
    this.map_last_zoom = this.zoom;
    this.map_zooming = true;
};

VectorRenderer.prototype.setBounds = function (sw, ne)
{
    this.bounds = {
        sw: { lng: sw.lng, lat: sw.lat },
        ne: { lng: ne.lng, lat: ne.lat }
    };

    var buffer = 200 * Geo.meters_per_pixel[~~this.zoom]; // pixels -> meters
    this.buffered_meter_bounds = {
        sw: Geo.latLngToMeters(Point(this.bounds.sw.lng, this.bounds.sw.lat)),
        ne: Geo.latLngToMeters(Point(this.bounds.ne.lng, this.bounds.ne.lat))
    };
    this.buffered_meter_bounds.sw.x -= buffer;
    this.buffered_meter_bounds.sw.y -= buffer;
    this.buffered_meter_bounds.ne.x += buffer;
    this.buffered_meter_bounds.ne.y += buffer;

    // console.log("set renderer bounds to " + JSON.stringify(this.bounds));

    // Mark tiles as visible/invisible
    for (var t in this.tiles) {
        this.updateVisibilityForTile(this.tiles[t]);
    }

    this.dirty = true;
};

VectorRenderer.prototype.updateVisibilityForTile = function (tile)
{
    tile.visible = Geo.boxIntersect(tile.bounds, this.buffered_meter_bounds);
    return tile.visible;
};

VectorRenderer.prototype.resizeMap = function (width, height)
{
    this.dirty = true;
};

VectorRenderer.prototype.requestRedraw = function ()
{
    this.dirty = true;
};

VectorRenderer.prototype.render = function ()
{
    if (this.dirty == false || this.initialized == false) {
        return false;
    }
    this.dirty = false; // subclasses can set this back to true when animation is needed

    // Child class-specific rendering (e.g. GL draw calls)
    if (typeof(this._render) == 'function') {
        this._render.apply(this, arguments);
    }

    // console.log("render map");
    return true;
};

// Load a single tile
VectorRenderer.prototype.loadTile = function (coords, div, callback)
{
    // Overzoom?
    if (coords.z > this.tile_source.max_zoom) {
        var zgap = coords.z - this.tile_source.max_zoom;
        // var original_tile = [coords.x, coords.y, coords.z].join('/');
        coords.x = ~~(coords.x / Math.pow(2, zgap));
        coords.y = ~~(coords.y / Math.pow(2, zgap));
        coords.display_z = coords.z; // z without overzoom
        coords.z -= zgap;
        // console.log("adjusted for overzoom, tile " + original_tile + " -> " + [coords.x, coords.y, coords.z].join('/'));
    }

    this.trackTileSetLoadStart();

    var key = [coords.x, coords.y, coords.z].join('/');

    // Already loading/loaded?
    if (this.tiles[key]) {
        // if (this.tiles[key].loaded == true) {
        //     console.log("use loaded tile " + key + " from cache");
        // }
        // if (this.tiles[key].loading == true) {
        //     console.log("already loading tile " + key + ", skip");
        // }

        if (callback) {
            callback(null, div);
        }
        return;
    }

    var tile = this.tiles[key] = {};
    tile.key = key;
    tile.coords = coords;
    tile.min = Geo.metersForTile(tile.coords);
    tile.max = Geo.metersForTile({ x: tile.coords.x + 1, y: tile.coords.y + 1, z: tile.coords.z });
    tile.bounds = { sw: { x: tile.min.x, y: tile.max.y }, ne: { x: tile.max.x, y: tile.min.y } };
    tile.debug = {};
    tile.loading = true;
    tile.loaded = false;
    this.updateVisibilityForTile(tile);

    this.workerPostMessageForTile(tile, {
        type: 'buildTile',
        tile: {
            key: tile.key,
            coords: tile.coords, // used by style helpers
            min: tile.min, // used by TileSource to scale tile to local extents
            max: tile.max, // used by TileSource to scale tile to local extents
            debug: tile.debug
        },
        renderer_type: this.type,
        tile_source: this.tile_source,
        layer_source: this.layer_source,
        style_source: this.style_source
    });

    this.updateTileElement(tile, div);

    if (callback) {
        callback(null, div);
    }
};

// Rebuild all tiles
// TODO: only rebuild certain layers?
VectorRenderer.prototype.rebuildTiles = function ()
{
    // Tell workers we're about to rebuild (so they can refresh styles, etc.)
    this.workers.forEach(function(worker) {
        worker.postMessage({
            type: 'markForRebuild'
        });
    });

    // Reload on main thread
    this.layers = VectorRenderer.loadLayers(this.layer_source);
    this.styles = VectorRenderer.loadStyles(this.style_source);

    // TODO: rebuild visible tiles first, from center out
    for (var t in this.tiles) {
        var tile = this.tiles[t];

        this.workerPostMessageForTile(tile, {
            type: 'buildTile',
            tile: {
                key: tile.key,
                coords: tile.coords, // used by style helpers
                layers: tile.layers,
                debug: tile.debug
            },
            renderer_type: this.type,
            layer_source: this.layer_source,
            style_source: this.style_source
        });
    }
};

// Called on main thread when a web worker completes processing for a single tile (initial load, or rebuild)
VectorRenderer.prototype.workerBuildTileCompleted = function (event)
{
    if (event.data.type != 'buildTileCompleted') {
        return;
    }

    var tile = event.data.tile;

    // Removed this tile during load?
    if (this.tiles[tile.key] == null) {
        console.log("discarded tile " + tile.key + " in VectorRenderer.tileWorkerCompleted because previously removed");
        return;
    }

    // Update tile with properties from worker
    tile = this.mergeTile(tile.key, tile);

    // Child class-specific tile processing
    if (typeof(this._tileWorkerCompleted) == 'function') {
        this._tileWorkerCompleted(tile);
    }

    // NOTE: was previously deleting source data to save memory, but now need to save for re-building geometry
    // delete tile.layers;

    this.dirty = true;
    this.trackTileSetLoadEnd();
    this.printDebugForTile(tile);
};

VectorRenderer.prototype.removeTile = function (key)
{
    console.log("tile unload for " + key);
    var tile = this.tiles[key];
    if (tile != null && tile.loading == true) {
        console.log("cancel tile load for " + key);

        // Web worker will cancel XHR requests
        if (tile.worker != null) {
            this.workers[tile.worker].postMessage({
                type: 'removeTile',
                key: tile.key
            });
        }
    }

    delete this.tiles[key];
    this.dirty = true;
};

// Attaches tracking and debug into to the provided tile DOM element
VectorRenderer.prototype.updateTileElement = function (tile, div)
{
    // Debug info
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
        // debug_overlay.style.textOutline = '1px #000000';
        div.appendChild(debug_overlay);

        div.style.borderStyle = 'solid';
        div.style.borderColor = 'white';
        div.style.borderWidth = '1px';
    }
};

// Merge properties from a provided tile object into the main tile store. Shallow merge (just copies top-level properties)!
// Used for selectively updating properties of tiles passed between main thread and worker
// (so we don't have to pass the whole tile, including some properties which cannot be cloned for a worker).
VectorRenderer.prototype.mergeTile = function (key, source_tile)
{
    var tile = this.tiles[key];

    if (tile == null) {
        this.tiles[key] = source_tile;
        return this.tiles[key];
    }

    for (var p in source_tile) {
        // console.log("merging " + p + ": " + source_tile[p]);
        tile[p] = source_tile[p];
    }

    return tile;
};

// Profiling methods used to track when sets of tiles start/stop loading together
// e.g. initial page load is one set of tiles, new sets of tile loads are then initiated by a map pan or zoom
VectorRenderer.prototype.trackTileSetLoadStart = function ()
{
    // Start tracking new tile set if no other tiles already loading
    if (this.tile_set_loading == null) {
        this.tile_set_loading = +new Date();
        console.log("tile set load START");
    }
};

VectorRenderer.prototype.trackTileSetLoadEnd = function ()
{
    // No more tiles actively loading?
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

VectorRenderer.prototype.printDebugForTile = function (tile)
{
    console.log(
        "debug for " + tile.key + ': [ ' +
        Object.keys(tile.debug).map(function (t) { return t + ': ' + tile.debug[t]; }).join(', ') + ' ]'
    );
};


/*** Class methods (stateless) ***/

// Simplistic detection of relative paths, append base if necessary
VectorRenderer.urlForPath = function (path) {
    var protocol = path.toLowerCase().substr(0, 4);
    if (!(protocol == 'http' || protocol == 'file')) {
        path = window.location.origin + window.location.pathname + path;
    }
    return path;
};

VectorRenderer.loadLayers = function (url)
{
    var layers;
    var req = new XMLHttpRequest();
    req.onload = function () { eval('layers = ' + req.response); }; // TODO: security!
    req.open('GET', url + '?' + (+new Date()), false /* async flag */);
    req.send();
    return layers;
};

VectorRenderer.loadStyles = function (url)
{
    var styles;
    var req = new XMLHttpRequest();
    req.onload = function () { eval('styles = ' + req.response); }; // TODO: security!
    req.open('GET', url + '?' + (+new Date()), false /* async flag */);
    req.send();

    // Process styles to prepare for renderer
    for (var layer in styles) {
        styles[layer].visible = !(styles[layer].visible === false); // layers are visible unless explicitly set to false
    }

    return styles;
};

// Processes the tile response to create layers as defined by this renderer
// Can include post-processing to partially filter or re-arrange data, e.g. only including POIs that have names
VectorRenderer.processLayersForTile = function (layers, tile)
{
    var tile_layers = {};
    for (var t=0; t < layers.length; t++) {
        layers[t].number = t;

        if (layers[t] != null) {
            // Just pass through data untouched if no data transform function defined
            if (layers[t].data == null) {
                tile_layers[layers[t].name] = tile.layers[layers[t].name];
            }
            // Pass through data but with different layer name in tile source data
            else if (typeof layers[t].data == 'string') {
                tile_layers[layers[t].name] = tile.layers[layers[t].data];
            }
            // Apply the transform function for post-processing
            else if (typeof layers[t].data == 'function') {
                tile_layers[layers[t].name] = layers[t].data(tile.layers);
            }
        }

        // Handle cases where no data was found in tile or returned by post-processor
        tile_layers[layers[t].name] = tile_layers[layers[t].name] || { type: 'FeatureCollection', features: [] };
    }
    tile.layers = tile_layers;
    return tile_layers;
};


/*** Style parsing & defaults ***/

// Determine final style properties (color, width, etc.)
VectorRenderer.style_defaults = {
    color: [1.0, 0, 0],
    width: Style.width.pixels(5),
    size: Style.width.pixels(5),
    extrude: false,
    height: 20,
    min_height: 0,
    outline: {
        // color: [1.0, 0, 0],
        // width: 1,
        // dash: null
    },
    // render_mode: {
    //     name: 'polygons'
    // }
    render_mode: 'polygons'
};

VectorRenderer.parseStyleForFeature = function (feature, layer_style, tile)
{
    var layer_style = layer_style || {};
    var style = {};

    // Test whether features should be rendered at all
    if (typeof layer_style.filter == 'function') {
        if (layer_style.filter(feature, tile) == false) {
            return null;
        }
    }

    // Parse styles
    style.color = (layer_style.color && (layer_style.color[feature.properties.kind] || layer_style.color.default)) || VectorRenderer.style_defaults.color;
    if (typeof style.color == 'function') {
        style.color = style.color(feature, tile);
    }

    style.width = (layer_style.width && (layer_style.width[feature.properties.kind] || layer_style.width.default)) || VectorRenderer.style_defaults.width;
    if (typeof style.width == 'function') {
        style.width = style.width(feature, tile);
    }

    style.size = (layer_style.size && (layer_style.size[feature.properties.kind] || layer_style.size.default)) || VectorRenderer.style_defaults.size;
    if (typeof style.size == 'function') {
        style.size = style.size(feature, tile);
    }

    style.extrude = (layer_style.extrude && (layer_style.extrude[feature.properties.kind] || layer_style.extrude.default)) || VectorRenderer.style_defaults.extrude;
    if (typeof style.extrude == 'function') {
        style.extrude = style.extrude(feature, tile); // returning a boolean will extrude with the feature's height, a number will override the feature height (see below)
    }

    style.height = (feature.properties && feature.properties.height) || VectorRenderer.style_defaults.height;
    style.min_height = (feature.properties && feature.properties.min_height) || VectorRenderer.style_defaults.min_height;

    // height defaults to feature height, but extrude style can dynamically adjust height by returning a number or array (instead of a boolean)
    if (style.extrude) {
        if (typeof style.extrude == 'number') {
            style.height = style.extrude;
        }
        else if (typeof style.extrude == 'object' && style.extrude.length >= 2) {
            style.min_height = style.extrude[0];
            style.height = style.extrude[1];
        }
    }

    style.z = (layer_style.z && (layer_style.z[feature.properties.kind] || layer_style.z.default)) || VectorRenderer.style_defaults.z || 0;
    if (typeof style.z == 'function') {
        style.z = style.z(feature, tile);
    }

    style.outline = {};
    layer_style.outline = layer_style.outline || {};
    style.outline.color = (layer_style.outline.color && (layer_style.outline.color[feature.properties.kind] || layer_style.outline.color.default)) || VectorRenderer.style_defaults.outline.color;
    if (typeof style.outline.color == 'function') {
        style.outline.color = style.outline.color(feature, tile);
    }

    style.outline.width = (layer_style.outline.width && (layer_style.outline.width[feature.properties.kind] || layer_style.outline.width.default)) || VectorRenderer.style_defaults.outline.width;
    if (typeof style.outline.width == 'function') {
        style.outline.width = style.outline.width(feature, tile);
    }

    style.outline.dash = (layer_style.outline.dash && (layer_style.outline.dash[feature.properties.kind] || layer_style.outline.dash.default)) || VectorRenderer.style_defaults.outline.dash;
    if (typeof style.outline.dash == 'function') {
        style.outline.dash = style.outline.dash(feature, tile);
    }

    style.render_mode = layer_style.render_mode || VectorRenderer.style_defaults.render_mode;
    // style.render_mode = {};
    // style.render_mode.name = (layer_style.render_mode && layer_style.render_mode.name) || VectorRenderer.style_defaults.render_mode.name;

    return style;
};

// Private/internal
// Get base URL from which the library was loaded
// Used to load additional resources like shaders, textures, etc. in cases where library was loaded from a relative path
function findBaseLibraryURL ()
{
    try {
        VectorRenderer.library_base_url = '';
        var scripts = document.getElementsByTagName('script'); // document.querySelectorAll('script[src*=".js"]');
        for (var s=0; s < scripts.length; s++) {
            var match = scripts[s].src.indexOf('vector-map.debug.js');
            if (match == -1) {
                match = scripts[s].src.indexOf('vector-map.min.js');
            }
            if (match >= 0) {
                VectorRenderer.library_base_url = scripts[s].src.substr(0, match);
                break;
            }
        }
    }
    catch (e) {
        // skip in web worker
    }
};

if (module !== undefined) {
    module.exports = VectorRenderer;
}

},{"./geo.js":3,"./point.js":11,"./style.js":12}]},{},[10])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L2Rpc3QvZ2wtbWF0cml4LmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9jYW52YXMvY2FudmFzX3JlbmRlcmVyLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nZW8uanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nbC9nbF9idWlsZGVycy5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfZ2VvbS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfcmVuZGVyZXIuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3NoYWRlcnMuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2xlYWZsZXRfbGF5ZXIuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL21vZHVsZS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvcG9pbnQuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL3N0eWxlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy92ZWN0b3IuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL3ZlY3Rvcl9yZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Z0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGZpbGVvdmVydmlldyBnbC1tYXRyaXggLSBIaWdoIHBlcmZvcm1hbmNlIG1hdHJpeCBhbmQgdmVjdG9yIG9wZXJhdGlvbnNcbiAqIEBhdXRob3IgQnJhbmRvbiBKb25lc1xuICogQGF1dGhvciBDb2xpbiBNYWNLZW56aWUgSVZcbiAqIEB2ZXJzaW9uIDIuMS4wXG4gKi9cblxuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBzaGltID0ge307XG4gIGlmICh0eXBlb2YoZXhwb3J0cykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcbiAgICAgIHNoaW0uZXhwb3J0cyA9IHt9O1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2hpbS5leHBvcnRzO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGdsLW1hdHJpeCBsaXZlcyBpbiBhIGJyb3dzZXIsIGRlZmluZSBpdHMgbmFtZXNwYWNlcyBpbiBnbG9iYWxcbiAgICAgIHNoaW0uZXhwb3J0cyA9IHdpbmRvdztcbiAgICB9ICAgIFxuICB9XG4gIGVsc2Uge1xuICAgIC8vIGdsLW1hdHJpeCBsaXZlcyBpbiBjb21tb25qcywgZGVmaW5lIGl0cyBuYW1lc3BhY2VzIGluIGV4cG9ydHNcbiAgICBzaGltLmV4cG9ydHMgPSBleHBvcnRzO1xuICB9XG5cbiAgKGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiAgICAvKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG5cbmlmKCFHTE1BVF9FUFNJTE9OKSB7XG4gICAgdmFyIEdMTUFUX0VQU0lMT04gPSAwLjAwMDAwMTtcbn1cblxuaWYoIUdMTUFUX0FSUkFZX1RZUEUpIHtcbiAgICB2YXIgR0xNQVRfQVJSQVlfVFlQRSA9ICh0eXBlb2YgRmxvYXQzMkFycmF5ICE9PSAndW5kZWZpbmVkJykgPyBGbG9hdDMyQXJyYXkgOiBBcnJheTtcbn1cblxuLyoqXG4gKiBAY2xhc3MgQ29tbW9uIHV0aWxpdGllc1xuICogQG5hbWUgZ2xNYXRyaXhcbiAqL1xudmFyIGdsTWF0cml4ID0ge307XG5cbi8qKlxuICogU2V0cyB0aGUgdHlwZSBvZiBhcnJheSB1c2VkIHdoZW4gY3JlYXRpbmcgbmV3IHZlY3RvcnMgYW5kIG1hdHJpY2llc1xuICpcbiAqIEBwYXJhbSB7VHlwZX0gdHlwZSBBcnJheSB0eXBlLCBzdWNoIGFzIEZsb2F0MzJBcnJheSBvciBBcnJheVxuICovXG5nbE1hdHJpeC5zZXRNYXRyaXhBcnJheVR5cGUgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgR0xNQVRfQVJSQVlfVFlQRSA9IHR5cGU7XG59XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLmdsTWF0cml4ID0gZ2xNYXRyaXg7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG5hbWUgdmVjMlxuICovXG5cbnZhciB2ZWMyID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjMlxuICpcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMik7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMik7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5mcm9tVmFsdWVzID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgyKTtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzIgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzIgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5zZXQgPSBmdW5jdGlvbihvdXQsIHgsIHkpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLmFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnN1YnRyYWN0ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuc3ViID0gdmVjMi5zdWJ0cmFjdDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubXVsdGlwbHkgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5tdWwgPSB2ZWMyLm11bHRpcGx5O1xuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5kaXZpZGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuZGl2ID0gdmVjMi5kaXZpZGU7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm1pbiA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5tYXggPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMyIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMyLmRpc3RhbmNlID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLmRpc3QgPSB2ZWMyLmRpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjMi5zcXVhcmVkRGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdO1xuICAgIHJldHVybiB4KnggKyB5Knk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkRGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5zcXJEaXN0ID0gdmVjMi5zcXVhcmVkRGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xudmVjMi5sZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIubGVuID0gdmVjMi5sZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xudmVjMi5zcXVhcmVkTGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIHJldHVybiB4KnggKyB5Knk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuc3FyTGVuID0gdmVjMi5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubmVnYXRlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgdmFyIGxlbiA9IHgqeCArIHkqeTtcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xudmVjMi5kb3QgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdO1xufTtcblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMidzXG4gKiBOb3RlIHRoYXQgdGhlIGNyb3NzIHByb2R1Y3QgbXVzdCBieSBkZWZpbml0aW9uIHByb2R1Y2UgYSAzRCB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzIuY3Jvc3MgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICB2YXIgeiA9IGFbMF0gKiBiWzFdIC0gYVsxXSAqIGJbMF07XG4gICAgb3V0WzBdID0gb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSB6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLmxlcnAgPSBmdW5jdGlvbiAob3V0LCBhLCBiLCB0KSB7XG4gICAgdmFyIGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDJ9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIudHJhbnNmb3JtTWF0MiA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeTtcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQyZH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi50cmFuc2Zvcm1NYXQyZCA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeSArIG1bNF07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeSArIG1bNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0M1xuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDN9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIudHJhbnNmb3JtTWF0MyA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzNdICogeSArIG1bNl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzRdICogeSArIG1bN107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0NFxuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMCdcbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnRyYW5zZm9ybU1hdDQgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sIFxuICAgICAgICB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVsxMl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bMTNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWMycy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWMyLiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjMnMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgdmVjID0gdmVjMi5jcmVhdGUoKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICAgICAgdmFyIGksIGw7XG4gICAgICAgIGlmKCFzdHJpZGUpIHtcbiAgICAgICAgICAgIHN0cmlkZSA9IDI7XG4gICAgICAgIH1cblxuICAgICAgICBpZighb2Zmc2V0KSB7XG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZihjb3VudCkge1xuICAgICAgICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgICAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTtcbiAgICAgICAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMyfSB2ZWMgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xudmVjMi5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAndmVjMignICsgYVswXSArICcsICcgKyBhWzFdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMudmVjMiA9IHZlYzI7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAzIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG5hbWUgdmVjM1xuICovXG5cbnZhciB2ZWMzID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjM1xuICpcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xudmVjMy5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMyk7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG52ZWMzLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgzKTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG52ZWMzLmZyb21WYWx1ZXMgPSBmdW5jdGlvbih4LCB5LCB6KSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDMpO1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMzIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuc2V0ID0gZnVuY3Rpb24ob3V0LCB4LCB5LCB6KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLmFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnN1YnRyYWN0ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuc3ViID0gdmVjMy5zdWJ0cmFjdDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubXVsdGlwbHkgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICogYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5tdWwgPSB2ZWMzLm11bHRpcGx5O1xuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5kaXZpZGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuZGl2ID0gdmVjMy5kaXZpZGU7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm1pbiA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICAgIG91dFsyXSA9IE1hdGgubWluKGFbMl0sIGJbMl0pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5tYXggPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgICBvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMzIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMzLmRpc3RhbmNlID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXSxcbiAgICAgICAgeiA9IGJbMl0gLSBhWzJdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuZGlzdCA9IHZlYzMuZGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMzLnNxdWFyZWREaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZERpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuc3FyRGlzdCA9IHZlYzMuc3F1YXJlZERpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbnZlYzMubGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeik7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5sZW4gPSB2ZWMzLmxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG52ZWMzLnNxdWFyZWRMZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIHJldHVybiB4KnggKyB5KnkgKyB6Kno7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuc3FyTGVuID0gdmVjMy5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubmVnYXRlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIHZhciBsZW4gPSB4KnggKyB5KnkgKyB6Kno7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgICAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgICAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICAgICAgICBvdXRbMl0gPSBhWzJdICogbGVuO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbnZlYzMuZG90ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdO1xufTtcblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLmNyb3NzID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sXG4gICAgICAgIGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl07XG5cbiAgICBvdXRbMF0gPSBheSAqIGJ6IC0gYXogKiBieTtcbiAgICBvdXRbMV0gPSBheiAqIGJ4IC0gYXggKiBiejtcbiAgICBvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5sZXJwID0gZnVuY3Rpb24gKG91dCwgYSwgYiwgdCkge1xuICAgIHZhciBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDQuXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy50cmFuc2Zvcm1NYXQ0ID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM107XG4gICAgb3V0WzJdID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnRyYW5zZm9ybVF1YXQgPSBmdW5jdGlvbihvdXQsIGEsIHEpIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSxcbiAgICAgICAgcXggPSBxWzBdLCBxeSA9IHFbMV0sIHF6ID0gcVsyXSwgcXcgPSBxWzNdLFxuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjXG4gICAgICAgIGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5LFxuICAgICAgICBpeSA9IHF3ICogeSArIHF6ICogeCAtIHF4ICogeixcbiAgICAgICAgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHgsXG4gICAgICAgIGl3ID0gLXF4ICogeCAtIHF5ICogeSAtIHF6ICogejtcblxuICAgIC8vIGNhbGN1bGF0ZSByZXN1bHQgKiBpbnZlcnNlIHF1YXRcbiAgICBvdXRbMF0gPSBpeCAqIHF3ICsgaXcgKiAtcXggKyBpeSAqIC1xeiAtIGl6ICogLXF5O1xuICAgIG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXo7XG4gICAgb3V0WzJdID0gaXogKiBxdyArIGl3ICogLXF6ICsgaXggKiAtcXkgLSBpeSAqIC1xeDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjM3MuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMy4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzNzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLmZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZlYyA9IHZlYzMuY3JlYXRlKCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgICAgIHZhciBpLCBsO1xuICAgICAgICBpZighc3RyaWRlKSB7XG4gICAgICAgICAgICBzdHJpZGUgPSAzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIW9mZnNldCkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoY291bnQpIHtcbiAgICAgICAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsID0gYS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICAgICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07IHZlY1syXSA9IGFbaSsyXTtcbiAgICAgICAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdOyBhW2krMl0gPSB2ZWNbMl07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IHZlYyB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG52ZWMzLnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICd2ZWMzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnZlYzMgPSB2ZWMzO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgNCBEaW1lbnNpb25hbCBWZWN0b3JcbiAqIEBuYW1lIHZlYzRcbiAqL1xuXG52YXIgdmVjNCA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzRcbiAqXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXG4gKi9cbnZlYzQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWM0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG52ZWM0LmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG52ZWM0LmZyb21WYWx1ZXMgPSBmdW5jdGlvbih4LCB5LCB6LCB3KSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIG91dFszXSA9IHc7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5zZXQgPSBmdW5jdGlvbihvdXQsIHgsIHksIHosIHcpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSB3O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5hZGQgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5zdWJ0cmFjdCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gLSBiWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LnN1YiA9IHZlYzQuc3VidHJhY3Q7XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0Lm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAqIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQubXVsID0gdmVjNC5tdWx0aXBseTtcblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuZGl2aWRlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAvIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LmRpdiA9IHZlYzQuZGl2aWRlO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5taW4gPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgICBvdXRbM10gPSBNYXRoLm1pbihhWzNdLCBiWzNdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubWF4ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gICAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XG4gICAgb3V0WzNdID0gTWF0aC5tYXgoYVszXSwgYlszXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjNCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICBvdXRbM10gPSBhWzNdICogYjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjNC5kaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXSxcbiAgICAgICAgdyA9IGJbM10gLSBhWzNdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6ICsgdyp3KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuZGlzdCA9IHZlYzQuZGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWM0LnNxdWFyZWREaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXSxcbiAgICAgICAgdyA9IGJbM10gLSBhWzNdO1xuICAgIHJldHVybiB4KnggKyB5KnkgKyB6KnogKyB3Knc7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zcXVhcmVkRGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5zcXJEaXN0ID0gdmVjNC5zcXVhcmVkRGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xudmVjNC5sZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdLFxuICAgICAgICB3ID0gYVszXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeiArIHcqdyk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5sZW4gPSB2ZWM0Lmxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG52ZWM0LnNxdWFyZWRMZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdLFxuICAgICAgICB3ID0gYVszXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6ICsgdyp3O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LnNxckxlbiA9IHZlYzQuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0Lm5lZ2F0ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIG91dFszXSA9IC1hWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5ub3JtYWxpemUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXSxcbiAgICAgICAgdyA9IGFbM107XG4gICAgdmFyIGxlbiA9IHgqeCArIHkqeSArIHoqeiArIHcqdztcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgICAgIG91dFsyXSA9IGFbMl0gKiBsZW47XG4gICAgICAgIG91dFszXSA9IGFbM10gKiBsZW47XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xudmVjNC5kb3QgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl0gKyBhWzNdICogYlszXTtcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubGVycCA9IGZ1bmN0aW9uIChvdXQsIGEsIGIsIHQpIHtcbiAgICB2YXIgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICAgIG91dFszXSA9IGF3ICsgdCAqIChiWzNdIC0gYXcpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIG1hdDQuXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnRyYW5zZm9ybU1hdDQgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSwgdyA9IGFbM107XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0gKiB3O1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdICogdztcbiAgICBvdXRbMl0gPSBtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0gKiB3O1xuICAgIG91dFszXSA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XSAqIHc7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQudHJhbnNmb3JtUXVhdCA9IGZ1bmN0aW9uKG91dCwgYSwgcSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdLFxuICAgICAgICBxeCA9IHFbMF0sIHF5ID0gcVsxXSwgcXogPSBxWzJdLCBxdyA9IHFbM10sXG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHF1YXQgKiB2ZWNcbiAgICAgICAgaXggPSBxdyAqIHggKyBxeSAqIHogLSBxeiAqIHksXG4gICAgICAgIGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6LFxuICAgICAgICBpeiA9IHF3ICogeiArIHF4ICogeSAtIHF5ICogeCxcbiAgICAgICAgaXcgPSAtcXggKiB4IC0gcXkgKiB5IC0gcXogKiB6O1xuXG4gICAgLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuICAgIG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXk7XG4gICAgb3V0WzFdID0gaXkgKiBxdyArIGl3ICogLXF5ICsgaXogKiAtcXggLSBpeCAqIC1xejtcbiAgICBvdXRbMl0gPSBpeiAqIHF3ICsgaXcgKiAtcXogKyBpeCAqIC1xeSAtIGl5ICogLXF4O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWM0cy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWM0LiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjMnMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgdmVjID0gdmVjNC5jcmVhdGUoKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICAgICAgdmFyIGksIGw7XG4gICAgICAgIGlmKCFzdHJpZGUpIHtcbiAgICAgICAgICAgIHN0cmlkZSA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZighb2Zmc2V0KSB7XG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZihjb3VudCkge1xuICAgICAgICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgICAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTsgdmVjWzJdID0gYVtpKzJdOyB2ZWNbM10gPSBhW2krM107XG4gICAgICAgICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgICAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTsgYVtpKzJdID0gdmVjWzJdOyBhW2krM10gPSB2ZWNbM107XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IHZlYyB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG52ZWM0LnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICd2ZWM0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMudmVjNCA9IHZlYzQ7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyeDIgTWF0cml4XG4gKiBAbmFtZSBtYXQyXG4gKi9cblxudmFyIG1hdDIgPSB7fTtcblxudmFyIG1hdDJJZGVudGl0eSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgIDEsIDAsXG4gICAgMCwgMVxuXSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQyXG4gKlxuICogQHJldHVybnMge21hdDJ9IGEgbmV3IDJ4MiBtYXRyaXhcbiAqL1xubWF0Mi5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNCk7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDIgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IGEgbWF0cml4IHRvIGNsb25lXG4gKiBAcmV0dXJucyB7bWF0Mn0gYSBuZXcgMngyIG1hdHJpeFxuICovXG5tYXQyLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQyIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IGEgbWF0MiB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLnRyYW5zcG9zZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgICBpZiAob3V0ID09PSBhKSB7XG4gICAgICAgIHZhciBhMSA9IGFbMV07XG4gICAgICAgIG91dFsxXSA9IGFbMl07XG4gICAgICAgIG91dFsyXSA9IGExO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFswXSA9IGFbMF07XG4gICAgICAgIG91dFsxXSA9IGFbMl07XG4gICAgICAgIG91dFsyXSA9IGFbMV07XG4gICAgICAgIG91dFszXSA9IGFbM107XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEludmVydHMgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLmludmVydCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sXG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgICAgICBkZXQgPSBhMCAqIGEzIC0gYTIgKiBhMTtcblxuICAgIGlmICghZGV0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG4gICAgXG4gICAgb3V0WzBdID0gIGEzICogZGV0O1xuICAgIG91dFsxXSA9IC1hMSAqIGRldDtcbiAgICBvdXRbMl0gPSAtYTIgKiBkZXQ7XG4gICAgb3V0WzNdID0gIGEwICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLmFkam9pbnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICAvLyBDYWNoaW5nIHRoaXMgdmFsdWUgaXMgbmVzc2VjYXJ5IGlmIG91dCA9PSBhXG4gICAgdmFyIGEwID0gYVswXTtcbiAgICBvdXRbMF0gPSAgYVszXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICBvdXRbMl0gPSAtYVsyXTtcbiAgICBvdXRbM10gPSAgYTA7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xubWF0Mi5kZXRlcm1pbmFudCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBhWzNdIC0gYVsyXSAqIGFbMV07XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDInc1xuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5tdWx0aXBseSA9IGZ1bmN0aW9uIChvdXQsIGEsIGIpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdO1xuICAgIHZhciBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107XG4gICAgb3V0WzBdID0gYTAgKiBiMCArIGExICogYjI7XG4gICAgb3V0WzFdID0gYTAgKiBiMSArIGExICogYjM7XG4gICAgb3V0WzJdID0gYTIgKiBiMCArIGEzICogYjI7XG4gICAgb3V0WzNdID0gYTIgKiBiMSArIGEzICogYjM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQyLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDIubXVsID0gbWF0Mi5tdWx0aXBseTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0MiBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLnJvdGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sXG4gICAgICAgIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKTtcbiAgICBvdXRbMF0gPSBhMCAqICBjICsgYTEgKiBzO1xuICAgIG91dFsxXSA9IGEwICogLXMgKyBhMSAqIGM7XG4gICAgb3V0WzJdID0gYTIgKiAgYyArIGEzICogcztcbiAgICBvdXRbM10gPSBhMiAqIC1zICsgYTMgKiBjO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0MiBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKiovXG5tYXQyLnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSxcbiAgICAgICAgdjAgPSB2WzBdLCB2MSA9IHZbMV07XG4gICAgb3V0WzBdID0gYTAgKiB2MDtcbiAgICBvdXRbMV0gPSBhMSAqIHYxO1xuICAgIG91dFsyXSA9IGEyICogdjA7XG4gICAgb3V0WzNdID0gYTMgKiB2MTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gbWF0IG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDIuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDIoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQyID0gbWF0Mjtcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDJ4MyBNYXRyaXhcbiAqIEBuYW1lIG1hdDJkXG4gKiBcbiAqIEBkZXNjcmlwdGlvbiBcbiAqIEEgbWF0MmQgY29udGFpbnMgc2l4IGVsZW1lbnRzIGRlZmluZWQgYXM6XG4gKiA8cHJlPlxuICogW2EsIGIsXG4gKiAgYywgZCxcbiAqICB0eCx0eV1cbiAqIDwvcHJlPlxuICogVGhpcyBpcyBhIHNob3J0IGZvcm0gZm9yIHRoZSAzeDMgbWF0cml4OlxuICogPHByZT5cbiAqIFthLCBiLCAwXG4gKiAgYywgZCwgMFxuICogIHR4LHR5LDFdXG4gKiA8L3ByZT5cbiAqIFRoZSBsYXN0IGNvbHVtbiBpcyBpZ25vcmVkIHNvIHRoZSBhcnJheSBpcyBzaG9ydGVyIGFuZCBvcGVyYXRpb25zIGFyZSBmYXN0ZXIuXG4gKi9cblxudmFyIG1hdDJkID0ge307XG5cbnZhciBtYXQyZElkZW50aXR5ID0gbmV3IEZsb2F0MzJBcnJheShbXG4gICAgMSwgMCxcbiAgICAwLCAxLFxuICAgIDAsIDBcbl0pO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0MmRcbiAqXG4gKiBAcmV0dXJucyB7bWF0MmR9IGEgbmV3IDJ4MyBtYXRyaXhcbiAqL1xubWF0MmQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDYpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MmQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDJkfSBhIG5ldyAyeDMgbWF0cml4XG4gKi9cbm1hdDJkLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg2KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MmQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xubWF0MmQuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCBhIG1hdDJkIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5tYXQyZC5pbnZlcnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYWEgPSBhWzBdLCBhYiA9IGFbMV0sIGFjID0gYVsyXSwgYWQgPSBhWzNdLFxuICAgICAgICBhdHggPSBhWzRdLCBhdHkgPSBhWzVdO1xuXG4gICAgdmFyIGRldCA9IGFhICogYWQgLSBhYiAqIGFjO1xuICAgIGlmKCFkZXQpe1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gYWQgKiBkZXQ7XG4gICAgb3V0WzFdID0gLWFiICogZGV0O1xuICAgIG91dFsyXSA9IC1hYyAqIGRldDtcbiAgICBvdXRbM10gPSBhYSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYWMgKiBhdHkgLSBhZCAqIGF0eCkgKiBkZXQ7XG4gICAgb3V0WzVdID0gKGFiICogYXR4IC0gYWEgKiBhdHkpICogZGV0O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDJkLmRldGVybWluYW50ID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gYVswXSAqIGFbM10gLSBhWzFdICogYVsyXTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MmQnc1xuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQyZH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhYSA9IGFbMF0sIGFiID0gYVsxXSwgYWMgPSBhWzJdLCBhZCA9IGFbM10sXG4gICAgICAgIGF0eCA9IGFbNF0sIGF0eSA9IGFbNV0sXG4gICAgICAgIGJhID0gYlswXSwgYmIgPSBiWzFdLCBiYyA9IGJbMl0sIGJkID0gYlszXSxcbiAgICAgICAgYnR4ID0gYls0XSwgYnR5ID0gYls1XTtcblxuICAgIG91dFswXSA9IGFhKmJhICsgYWIqYmM7XG4gICAgb3V0WzFdID0gYWEqYmIgKyBhYipiZDtcbiAgICBvdXRbMl0gPSBhYypiYSArIGFkKmJjO1xuICAgIG91dFszXSA9IGFjKmJiICsgYWQqYmQ7XG4gICAgb3V0WzRdID0gYmEqYXR4ICsgYmMqYXR5ICsgYnR4O1xuICAgIG91dFs1XSA9IGJiKmF0eCArIGJkKmF0eSArIGJ0eTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDJkLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDJkLm11bCA9IG1hdDJkLm11bHRpcGx5O1xuXG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDJkIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLnJvdGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBhYSA9IGFbMF0sXG4gICAgICAgIGFiID0gYVsxXSxcbiAgICAgICAgYWMgPSBhWzJdLFxuICAgICAgICBhZCA9IGFbM10sXG4gICAgICAgIGF0eCA9IGFbNF0sXG4gICAgICAgIGF0eSA9IGFbNV0sXG4gICAgICAgIHN0ID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgY3QgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYWEqY3QgKyBhYipzdDtcbiAgICBvdXRbMV0gPSAtYWEqc3QgKyBhYipjdDtcbiAgICBvdXRbMl0gPSBhYypjdCArIGFkKnN0O1xuICAgIG91dFszXSA9IC1hYypzdCArIGN0KmFkO1xuICAgIG91dFs0XSA9IGN0KmF0eCArIHN0KmF0eTtcbiAgICBvdXRbNV0gPSBjdCphdHkgLSBzdCphdHg7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQyZCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHttYXQyZH0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICoqL1xubWF0MmQuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgdnggPSB2WzBdLCB2eSA9IHZbMV07XG4gICAgb3V0WzBdID0gYVswXSAqIHZ4O1xuICAgIG91dFsxXSA9IGFbMV0gKiB2eTtcbiAgICBvdXRbMl0gPSBhWzJdICogdng7XG4gICAgb3V0WzNdID0gYVszXSAqIHZ5O1xuICAgIG91dFs0XSA9IGFbNF0gKiB2eDtcbiAgICBvdXRbNV0gPSBhWzVdICogdnk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNsYXRlcyB0aGUgbWF0MmQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7bWF0MmR9IHYgdGhlIHZlYzIgdG8gdHJhbnNsYXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKiovXG5tYXQyZC50cmFuc2xhdGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF0gKyB2WzBdO1xuICAgIG91dFs1XSA9IGFbNV0gKyB2WzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xubWF0MmQuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDJkKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVszXSArICcsICcgKyBhWzRdICsgJywgJyArIGFbNV0gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQyZCA9IG1hdDJkO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgM3gzIE1hdHJpeFxuICogQG5hbWUgbWF0M1xuICovXG5cbnZhciBtYXQzID0ge307XG5cbnZhciBtYXQzSWRlbnRpdHkgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAxLCAwLCAwLFxuICAgIDAsIDEsIDAsXG4gICAgMCwgMCwgMVxuXSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQzXG4gKlxuICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcbiAqL1xubWF0My5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoOSk7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAxO1xuICAgIG91dFs1XSA9IDA7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcbiAqL1xubWF0My5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoOSk7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDMgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IGEgbWF0MyB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMTtcbiAgICBvdXRbNV0gPSAwO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My50cmFuc3Bvc2UgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gICAgaWYgKG91dCA9PT0gYSkge1xuICAgICAgICB2YXIgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTEyID0gYVs1XTtcbiAgICAgICAgb3V0WzFdID0gYVszXTtcbiAgICAgICAgb3V0WzJdID0gYVs2XTtcbiAgICAgICAgb3V0WzNdID0gYTAxO1xuICAgICAgICBvdXRbNV0gPSBhWzddO1xuICAgICAgICBvdXRbNl0gPSBhMDI7XG4gICAgICAgIG91dFs3XSA9IGExMjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvdXRbMF0gPSBhWzBdO1xuICAgICAgICBvdXRbMV0gPSBhWzNdO1xuICAgICAgICBvdXRbMl0gPSBhWzZdO1xuICAgICAgICBvdXRbM10gPSBhWzFdO1xuICAgICAgICBvdXRbNF0gPSBhWzRdO1xuICAgICAgICBvdXRbNV0gPSBhWzddO1xuICAgICAgICBvdXRbNl0gPSBhWzJdO1xuICAgICAgICBvdXRbN10gPSBhWzVdO1xuICAgICAgICBvdXRbOF0gPSBhWzhdO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5pbnZlcnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcblxuICAgICAgICBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjEsXG4gICAgICAgIGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjAsXG4gICAgICAgIGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMCxcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMTtcblxuICAgIGlmICghZGV0KSB7IFxuICAgICAgICByZXR1cm4gbnVsbDsgXG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IGIwMSAqIGRldDtcbiAgICBvdXRbMV0gPSAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSkgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGExMiAqIGEwMSAtIGEwMiAqIGExMSkgKiBkZXQ7XG4gICAgb3V0WzNdID0gYjExICogZGV0O1xuICAgIG91dFs0XSA9IChhMjIgKiBhMDAgLSBhMDIgKiBhMjApICogZGV0O1xuICAgIG91dFs1XSA9ICgtYTEyICogYTAwICsgYTAyICogYTEwKSAqIGRldDtcbiAgICBvdXRbNl0gPSBiMjEgKiBkZXQ7XG4gICAgb3V0WzddID0gKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApICogZGV0O1xuICAgIG91dFs4XSA9IChhMTEgKiBhMDAgLSBhMDEgKiBhMTApICogZGV0O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5hZGpvaW50ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgICBvdXRbMF0gPSAoYTExICogYTIyIC0gYTEyICogYTIxKTtcbiAgICBvdXRbMV0gPSAoYTAyICogYTIxIC0gYTAxICogYTIyKTtcbiAgICBvdXRbMl0gPSAoYTAxICogYTEyIC0gYTAyICogYTExKTtcbiAgICBvdXRbM10gPSAoYTEyICogYTIwIC0gYTEwICogYTIyKTtcbiAgICBvdXRbNF0gPSAoYTAwICogYTIyIC0gYTAyICogYTIwKTtcbiAgICBvdXRbNV0gPSAoYTAyICogYTEwIC0gYTAwICogYTEyKTtcbiAgICBvdXRbNl0gPSAoYTEwICogYTIxIC0gYTExICogYTIwKTtcbiAgICBvdXRbN10gPSAoYTAxICogYTIwIC0gYTAwICogYTIxKTtcbiAgICBvdXRbOF0gPSAoYTAwICogYTExIC0gYTAxICogYTEwKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xubWF0My5kZXRlcm1pbmFudCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgICByZXR1cm4gYTAwICogKGEyMiAqIGExMSAtIGExMiAqIGEyMSkgKyBhMDEgKiAoLWEyMiAqIGExMCArIGExMiAqIGEyMCkgKyBhMDIgKiAoYTIxICogYTEwIC0gYTExICogYTIwKTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MydzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuXG4gICAgICAgIGIwMCA9IGJbMF0sIGIwMSA9IGJbMV0sIGIwMiA9IGJbMl0sXG4gICAgICAgIGIxMCA9IGJbM10sIGIxMSA9IGJbNF0sIGIxMiA9IGJbNV0sXG4gICAgICAgIGIyMCA9IGJbNl0sIGIyMSA9IGJbN10sIGIyMiA9IGJbOF07XG5cbiAgICBvdXRbMF0gPSBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjA7XG4gICAgb3V0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxO1xuICAgIG91dFsyXSA9IGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMjtcblxuICAgIG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMDtcbiAgICBvdXRbNF0gPSBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjE7XG4gICAgb3V0WzVdID0gYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyO1xuXG4gICAgb3V0WzZdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwO1xuICAgIG91dFs3XSA9IGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMTtcbiAgICBvdXRbOF0gPSBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQzLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDMubXVsID0gbWF0My5tdWx0aXBseTtcblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQzIGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuICAgICAgICB4ID0gdlswXSwgeSA9IHZbMV07XG5cbiAgICBvdXRbMF0gPSBhMDA7XG4gICAgb3V0WzFdID0gYTAxO1xuICAgIG91dFsyXSA9IGEwMjtcblxuICAgIG91dFszXSA9IGExMDtcbiAgICBvdXRbNF0gPSBhMTE7XG4gICAgb3V0WzVdID0gYTEyO1xuXG4gICAgb3V0WzZdID0geCAqIGEwMCArIHkgKiBhMTAgKyBhMjA7XG4gICAgb3V0WzddID0geCAqIGEwMSArIHkgKiBhMTEgKyBhMjE7XG4gICAgb3V0WzhdID0geCAqIGEwMiArIHkgKiBhMTIgKyBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDMgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5yb3RhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcblxuICAgICAgICBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBjICogYTAwICsgcyAqIGExMDtcbiAgICBvdXRbMV0gPSBjICogYTAxICsgcyAqIGExMTtcbiAgICBvdXRbMl0gPSBjICogYTAyICsgcyAqIGExMjtcblxuICAgIG91dFszXSA9IGMgKiBhMTAgLSBzICogYTAwO1xuICAgIG91dFs0XSA9IGMgKiBhMTEgLSBzICogYTAxO1xuICAgIG91dFs1XSA9IGMgKiBhMTIgLSBzICogYTAyO1xuXG4gICAgb3V0WzZdID0gYTIwO1xuICAgIG91dFs3XSA9IGEyMTtcbiAgICBvdXRbOF0gPSBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQzIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqKi9cbm1hdDMuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzJdO1xuXG4gICAgb3V0WzBdID0geCAqIGFbMF07XG4gICAgb3V0WzFdID0geCAqIGFbMV07XG4gICAgb3V0WzJdID0geCAqIGFbMl07XG5cbiAgICBvdXRbM10gPSB5ICogYVszXTtcbiAgICBvdXRbNF0gPSB5ICogYVs0XTtcbiAgICBvdXRbNV0gPSB5ICogYVs1XTtcblxuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcGllcyB0aGUgdmFsdWVzIGZyb20gYSBtYXQyZCBpbnRvIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5tYXQzLmZyb21NYXQyZCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSAwO1xuXG4gICAgb3V0WzNdID0gYVsyXTtcbiAgICBvdXRbNF0gPSBhWzNdO1xuICAgIG91dFs1XSA9IDA7XG5cbiAgICBvdXRbNl0gPSBhWzRdO1xuICAgIG91dFs3XSA9IGFbNV07XG4gICAgb3V0WzhdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4qIENhbGN1bGF0ZXMgYSAzeDMgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbipcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbipcbiogQHJldHVybnMge21hdDN9IG91dFxuKi9cbm1hdDMuZnJvbVF1YXQgPSBmdW5jdGlvbiAob3V0LCBxKSB7XG4gICAgdmFyIHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdLFxuICAgICAgICB4MiA9IHggKyB4LFxuICAgICAgICB5MiA9IHkgKyB5LFxuICAgICAgICB6MiA9IHogKyB6LFxuXG4gICAgICAgIHh4ID0geCAqIHgyLFxuICAgICAgICB4eSA9IHggKiB5MixcbiAgICAgICAgeHogPSB4ICogejIsXG4gICAgICAgIHl5ID0geSAqIHkyLFxuICAgICAgICB5eiA9IHkgKiB6MixcbiAgICAgICAgenogPSB6ICogejIsXG4gICAgICAgIHd4ID0gdyAqIHgyLFxuICAgICAgICB3eSA9IHcgKiB5MixcbiAgICAgICAgd3ogPSB3ICogejI7XG5cbiAgICBvdXRbMF0gPSAxIC0gKHl5ICsgenopO1xuICAgIG91dFsxXSA9IHh5ICsgd3o7XG4gICAgb3V0WzJdID0geHogLSB3eTtcblxuICAgIG91dFszXSA9IHh5IC0gd3o7XG4gICAgb3V0WzRdID0gMSAtICh4eCArIHp6KTtcbiAgICBvdXRbNV0gPSB5eiArIHd4O1xuXG4gICAgb3V0WzZdID0geHogKyB3eTtcbiAgICBvdXRbN10gPSB5eiAtIHd4O1xuICAgIG91dFs4XSA9IDEgLSAoeHggKyB5eSk7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gbWF0IG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDMuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDMoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIFxuICAgICAgICAgICAgICAgICAgICBhWzNdICsgJywgJyArIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVs2XSArICcsICcgKyBhWzddICsgJywgJyArIGFbOF0gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQzID0gbWF0Mztcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDR4NCBNYXRyaXhcbiAqIEBuYW1lIG1hdDRcbiAqL1xuXG52YXIgbWF0NCA9IHt9O1xuXG52YXIgbWF0NElkZW50aXR5ID0gbmV3IEZsb2F0MzJBcnJheShbXG4gICAgMSwgMCwgMCwgMCxcbiAgICAwLCAxLCAwLCAwLFxuICAgIDAsIDAsIDEsIDAsXG4gICAgMCwgMCwgMCwgMVxuXSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQ0XG4gKlxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xubWF0NC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMTYpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAxO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDE7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQ0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xubWF0NC5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMTYpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIG91dFs5XSA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgb3V0WzldID0gYVs5XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgYSBtYXQ0IHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDE7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMTtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQudHJhbnNwb3NlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICAgIGlmIChvdXQgPT09IGEpIHtcbiAgICAgICAgdmFyIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgICAgICBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGEwMTtcbiAgICAgICAgb3V0WzZdID0gYVs5XTtcbiAgICAgICAgb3V0WzddID0gYVsxM107XG4gICAgICAgIG91dFs4XSA9IGEwMjtcbiAgICAgICAgb3V0WzldID0gYTEyO1xuICAgICAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgICAgIG91dFsxMl0gPSBhMDM7XG4gICAgICAgIG91dFsxM10gPSBhMTM7XG4gICAgICAgIG91dFsxNF0gPSBhMjM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3V0WzBdID0gYVswXTtcbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGFbMV07XG4gICAgICAgIG91dFs1XSA9IGFbNV07XG4gICAgICAgIG91dFs2XSA9IGFbOV07XG4gICAgICAgIG91dFs3XSA9IGFbMTNdO1xuICAgICAgICBvdXRbOF0gPSBhWzJdO1xuICAgICAgICBvdXRbOV0gPSBhWzZdO1xuICAgICAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgICAgIG91dFsxMV0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzEyXSA9IGFbM107XG4gICAgICAgIG91dFsxM10gPSBhWzddO1xuICAgICAgICBvdXRbMTRdID0gYVsxMV07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbiAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV0sXG5cbiAgICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLFxuICAgICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCxcbiAgICAgICAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXG4gICAgICAgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLFxuICAgICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCxcbiAgICAgICAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXG4gICAgICAgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMixcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICghZGV0KSB7IFxuICAgICAgICByZXR1cm4gbnVsbDsgXG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICAgIG91dFsxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICAgIG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICAgIG91dFszXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0O1xuICAgIG91dFs0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xuICAgIG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICAgIG91dFs2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICAgIG91dFs3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0O1xuICAgIG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuICAgIG91dFs5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuICAgIG91dFsxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0O1xuICAgIG91dFsxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmFkam9pbnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICAgIG91dFswXSAgPSAgKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gICAgb3V0WzFdICA9IC0oYTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcbiAgICBvdXRbMl0gID0gIChhMDEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMSAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICAgIG91dFszXSAgPSAtKGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTExICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzRdICA9IC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEzMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpKTtcbiAgICBvdXRbNV0gID0gIChhMDAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikpO1xuICAgIG91dFs2XSAgPSAtKGEwMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTEwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzddICA9ICAoYTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgICBvdXRbOF0gID0gIChhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkpO1xuICAgIG91dFs5XSAgPSAtKGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSk7XG4gICAgb3V0WzEwXSA9ICAoYTAwICogKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMzIC0gYTAzICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcbiAgICBvdXRbMTFdID0gLShhMDAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjMgLSBhMDMgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSkpO1xuICAgIG91dFsxMl0gPSAtKGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSk7XG4gICAgb3V0WzEzXSA9ICAoYTAwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgLSBhMjAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpKTtcbiAgICBvdXRbMTRdID0gLShhMDAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSAtIGExMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICsgYTMwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSkpO1xuICAgIG91dFsxNV0gPSAgKGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDQuZGV0ZXJtaW5hbnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdLFxuXG4gICAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcbiAgICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXG4gICAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxuICAgICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcbiAgICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXG4gICAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxuICAgICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0NCdzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0Lm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gICAgLy8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XG4gICAgdmFyIGIwICA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107ICBcbiAgICBvdXRbMF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzFdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuICAgIG91dFsyXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgICBvdXRbM10gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgICBiMCA9IGJbNF07IGIxID0gYls1XTsgYjIgPSBiWzZdOyBiMyA9IGJbN107XG4gICAgb3V0WzRdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFs1XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbNl0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4gICAgb3V0WzddID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gICAgYjAgPSBiWzhdOyBiMSA9IGJbOV07IGIyID0gYlsxMF07IGIzID0gYlsxMV07XG4gICAgb3V0WzhdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFs5XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMTBdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFsxMV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgICBiMCA9IGJbMTJdOyBiMSA9IGJbMTNdOyBiMiA9IGJbMTRdOyBiMyA9IGJbMTVdO1xuICAgIG91dFsxMl0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzEzXSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMTRdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFsxNV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQ0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDQubXVsID0gbWF0NC5tdWx0aXBseTtcblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQ0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnRyYW5zbGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHYpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXSxcbiAgICAgICAgYTAwLCBhMDEsIGEwMiwgYTAzLFxuICAgICAgICBhMTAsIGExMSwgYTEyLCBhMTMsXG4gICAgICAgIGEyMCwgYTIxLCBhMjIsIGEyMztcblxuICAgIGlmIChhID09PSBvdXQpIHtcbiAgICAgICAgb3V0WzEyXSA9IGFbMF0gKiB4ICsgYVs0XSAqIHkgKyBhWzhdICogeiArIGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxXSAqIHggKyBhWzVdICogeSArIGFbOV0gKiB6ICsgYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzJdICogeCArIGFbNl0gKiB5ICsgYVsxMF0gKiB6ICsgYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzNdICogeCArIGFbN10gKiB5ICsgYVsxMV0gKiB6ICsgYVsxNV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgICAgICAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcbiAgICAgICAgYTIwID0gYVs4XTsgYTIxID0gYVs5XTsgYTIyID0gYVsxMF07IGEyMyA9IGFbMTFdO1xuXG4gICAgICAgIG91dFswXSA9IGEwMDsgb3V0WzFdID0gYTAxOyBvdXRbMl0gPSBhMDI7IG91dFszXSA9IGEwMztcbiAgICAgICAgb3V0WzRdID0gYTEwOyBvdXRbNV0gPSBhMTE7IG91dFs2XSA9IGExMjsgb3V0WzddID0gYTEzO1xuICAgICAgICBvdXRbOF0gPSBhMjA7IG91dFs5XSA9IGEyMTsgb3V0WzEwXSA9IGEyMjsgb3V0WzExXSA9IGEyMztcblxuICAgICAgICBvdXRbMTJdID0gYTAwICogeCArIGExMCAqIHkgKyBhMjAgKiB6ICsgYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhMDEgKiB4ICsgYTExICogeSArIGEyMSAqIHogKyBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGEwMiAqIHggKyBhMTIgKiB5ICsgYTIyICogeiArIGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYTAzICogeCArIGExMyAqIHkgKyBhMjMgKiB6ICsgYVsxNV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdGhlIHZlYzMgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICoqL1xubWF0NC5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciB4ID0gdlswXSwgeSA9IHZbMV0sIHogPSB2WzJdO1xuXG4gICAgb3V0WzBdID0gYVswXSAqIHg7XG4gICAgb3V0WzFdID0gYVsxXSAqIHg7XG4gICAgb3V0WzJdID0gYVsyXSAqIHg7XG4gICAgb3V0WzNdID0gYVszXSAqIHg7XG4gICAgb3V0WzRdID0gYVs0XSAqIHk7XG4gICAgb3V0WzVdID0gYVs1XSAqIHk7XG4gICAgb3V0WzZdID0gYVs2XSAqIHk7XG4gICAgb3V0WzddID0gYVs3XSAqIHk7XG4gICAgb3V0WzhdID0gYVs4XSAqIHo7XG4gICAgb3V0WzldID0gYVs5XSAqIHo7XG4gICAgb3V0WzEwXSA9IGFbMTBdICogejtcbiAgICBvdXRbMTFdID0gYVsxMV0gKiB6O1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0NCBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5yb3RhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQsIGF4aXMpIHtcbiAgICB2YXIgeCA9IGF4aXNbMF0sIHkgPSBheGlzWzFdLCB6ID0gYXhpc1syXSxcbiAgICAgICAgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeiksXG4gICAgICAgIHMsIGMsIHQsXG4gICAgICAgIGEwMCwgYTAxLCBhMDIsIGEwMyxcbiAgICAgICAgYTEwLCBhMTEsIGExMiwgYTEzLFxuICAgICAgICBhMjAsIGEyMSwgYTIyLCBhMjMsXG4gICAgICAgIGIwMCwgYjAxLCBiMDIsXG4gICAgICAgIGIxMCwgYjExLCBiMTIsXG4gICAgICAgIGIyMCwgYjIxLCBiMjI7XG5cbiAgICBpZiAoTWF0aC5hYnMobGVuKSA8IEdMTUFUX0VQU0lMT04pIHsgcmV0dXJuIG51bGw7IH1cbiAgICBcbiAgICBsZW4gPSAxIC8gbGVuO1xuICAgIHggKj0gbGVuO1xuICAgIHkgKj0gbGVuO1xuICAgIHogKj0gbGVuO1xuXG4gICAgcyA9IE1hdGguc2luKHJhZCk7XG4gICAgYyA9IE1hdGguY29zKHJhZCk7XG4gICAgdCA9IDEgLSBjO1xuXG4gICAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgICBhMTAgPSBhWzRdOyBhMTEgPSBhWzVdOyBhMTIgPSBhWzZdOyBhMTMgPSBhWzddO1xuICAgIGEyMCA9IGFbOF07IGEyMSA9IGFbOV07IGEyMiA9IGFbMTBdOyBhMjMgPSBhWzExXTtcblxuICAgIC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxuICAgIGIwMCA9IHggKiB4ICogdCArIGM7IGIwMSA9IHkgKiB4ICogdCArIHogKiBzOyBiMDIgPSB6ICogeCAqIHQgLSB5ICogcztcbiAgICBiMTAgPSB4ICogeSAqIHQgLSB6ICogczsgYjExID0geSAqIHkgKiB0ICsgYzsgYjEyID0geiAqIHkgKiB0ICsgeCAqIHM7XG4gICAgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7IGIyMSA9IHkgKiB6ICogdCAtIHggKiBzOyBiMjIgPSB6ICogeiAqIHQgKyBjO1xuXG4gICAgLy8gUGVyZm9ybSByb3RhdGlvbi1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgICBvdXRbMF0gPSBhMDAgKiBiMDAgKyBhMTAgKiBiMDEgKyBhMjAgKiBiMDI7XG4gICAgb3V0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyO1xuICAgIG91dFsyXSA9IGEwMiAqIGIwMCArIGExMiAqIGIwMSArIGEyMiAqIGIwMjtcbiAgICBvdXRbM10gPSBhMDMgKiBiMDAgKyBhMTMgKiBiMDEgKyBhMjMgKiBiMDI7XG4gICAgb3V0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyO1xuICAgIG91dFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMjtcbiAgICBvdXRbNl0gPSBhMDIgKiBiMTAgKyBhMTIgKiBiMTEgKyBhMjIgKiBiMTI7XG4gICAgb3V0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyO1xuICAgIG91dFs4XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMjtcbiAgICBvdXRbOV0gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjI7XG4gICAgb3V0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMjtcbiAgICBvdXRbMTFdID0gYTAzICogYjIwICsgYTEzICogYjIxICsgYTIzICogYjIyO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWCBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5yb3RhdGVYID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKSxcbiAgICAgICAgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXG4gICAgICAgIG91dFswXSAgPSBhWzBdO1xuICAgICAgICBvdXRbMV0gID0gYVsxXTtcbiAgICAgICAgb3V0WzJdICA9IGFbMl07XG4gICAgICAgIG91dFszXSAgPSBhWzNdO1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFs0XSA9IGExMCAqIGMgKyBhMjAgKiBzO1xuICAgIG91dFs1XSA9IGExMSAqIGMgKyBhMjEgKiBzO1xuICAgIG91dFs2XSA9IGExMiAqIGMgKyBhMjIgKiBzO1xuICAgIG91dFs3XSA9IGExMyAqIGMgKyBhMjMgKiBzO1xuICAgIG91dFs4XSA9IGEyMCAqIGMgLSBhMTAgKiBzO1xuICAgIG91dFs5XSA9IGEyMSAqIGMgLSBhMTEgKiBzO1xuICAgIG91dFsxMF0gPSBhMjIgKiBjIC0gYTEyICogcztcbiAgICBvdXRbMTFdID0gYTIzICogYyAtIGExMyAqIHM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnJvdGF0ZVkgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpLFxuICAgICAgICBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdLFxuICAgICAgICBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcbiAgICAgICAgb3V0WzRdICA9IGFbNF07XG4gICAgICAgIG91dFs1XSAgPSBhWzVdO1xuICAgICAgICBvdXRbNl0gID0gYVs2XTtcbiAgICAgICAgb3V0WzddICA9IGFbN107XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYyAtIGEyMCAqIHM7XG4gICAgb3V0WzFdID0gYTAxICogYyAtIGEyMSAqIHM7XG4gICAgb3V0WzJdID0gYTAyICogYyAtIGEyMiAqIHM7XG4gICAgb3V0WzNdID0gYTAzICogYyAtIGEyMyAqIHM7XG4gICAgb3V0WzhdID0gYTAwICogcyArIGEyMCAqIGM7XG4gICAgb3V0WzldID0gYTAxICogcyArIGEyMSAqIGM7XG4gICAgb3V0WzEwXSA9IGEwMiAqIHMgKyBhMjIgKiBjO1xuICAgIG91dFsxMV0gPSBhMDMgKiBzICsgYTIzICogYztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQucm90YXRlWiA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCksXG4gICAgICAgIGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sXG4gICAgICAgIGExMSA9IGFbNV0sXG4gICAgICAgIGExMiA9IGFbNl0sXG4gICAgICAgIGExMyA9IGFbN107XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgICAgIG91dFs4XSAgPSBhWzhdO1xuICAgICAgICBvdXRbOV0gID0gYVs5XTtcbiAgICAgICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgICAgICBvdXRbMTFdID0gYVsxMV07XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYyArIGExMCAqIHM7XG4gICAgb3V0WzFdID0gYTAxICogYyArIGExMSAqIHM7XG4gICAgb3V0WzJdID0gYTAyICogYyArIGExMiAqIHM7XG4gICAgb3V0WzNdID0gYTAzICogYyArIGExMyAqIHM7XG4gICAgb3V0WzRdID0gYTEwICogYyAtIGEwMCAqIHM7XG4gICAgb3V0WzVdID0gYTExICogYyAtIGEwMSAqIHM7XG4gICAgb3V0WzZdID0gYTEyICogYyAtIGEwMiAqIHM7XG4gICAgb3V0WzddID0gYTEzICogYyAtIGEwMyAqIHM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiBhbmQgdmVjdG9yIHRyYW5zbGF0aW9uXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xuICogICAgIHZhciBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5mcm9tUm90YXRpb25UcmFuc2xhdGlvbiA9IGZ1bmN0aW9uIChvdXQsIHEsIHYpIHtcbiAgICAvLyBRdWF0ZXJuaW9uIG1hdGhcbiAgICB2YXIgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM10sXG4gICAgICAgIHgyID0geCArIHgsXG4gICAgICAgIHkyID0geSArIHksXG4gICAgICAgIHoyID0geiArIHosXG5cbiAgICAgICAgeHggPSB4ICogeDIsXG4gICAgICAgIHh5ID0geCAqIHkyLFxuICAgICAgICB4eiA9IHggKiB6MixcbiAgICAgICAgeXkgPSB5ICogeTIsXG4gICAgICAgIHl6ID0geSAqIHoyLFxuICAgICAgICB6eiA9IHogKiB6MixcbiAgICAgICAgd3ggPSB3ICogeDIsXG4gICAgICAgIHd5ID0gdyAqIHkyLFxuICAgICAgICB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSAoeXkgKyB6eik7XG4gICAgb3V0WzFdID0geHkgKyB3ejtcbiAgICBvdXRbMl0gPSB4eiAtIHd5O1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0geHkgLSB3ejtcbiAgICBvdXRbNV0gPSAxIC0gKHh4ICsgenopO1xuICAgIG91dFs2XSA9IHl6ICsgd3g7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSB4eiArIHd5O1xuICAgIG91dFs5XSA9IHl6IC0gd3g7XG4gICAgb3V0WzEwXSA9IDEgLSAoeHggKyB5eSk7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IHZbMF07XG4gICAgb3V0WzEzXSA9IHZbMV07XG4gICAgb3V0WzE0XSA9IHZbMl07XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuKiBDYWxjdWxhdGVzIGEgNHg0IG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXG4qXG4qIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXG4qXG4qIEByZXR1cm5zIHttYXQ0fSBvdXRcbiovXG5tYXQ0LmZyb21RdWF0ID0gZnVuY3Rpb24gKG91dCwgcSkge1xuICAgIHZhciB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXSxcbiAgICAgICAgeDIgPSB4ICsgeCxcbiAgICAgICAgeTIgPSB5ICsgeSxcbiAgICAgICAgejIgPSB6ICsgeixcblxuICAgICAgICB4eCA9IHggKiB4MixcbiAgICAgICAgeHkgPSB4ICogeTIsXG4gICAgICAgIHh6ID0geCAqIHoyLFxuICAgICAgICB5eSA9IHkgKiB5MixcbiAgICAgICAgeXogPSB5ICogejIsXG4gICAgICAgIHp6ID0geiAqIHoyLFxuICAgICAgICB3eCA9IHcgKiB4MixcbiAgICAgICAgd3kgPSB3ICogeTIsXG4gICAgICAgIHd6ID0gdyAqIHoyO1xuXG4gICAgb3V0WzBdID0gMSAtICh5eSArIHp6KTtcbiAgICBvdXRbMV0gPSB4eSArIHd6O1xuICAgIG91dFsyXSA9IHh6IC0gd3k7XG4gICAgb3V0WzNdID0gMDtcblxuICAgIG91dFs0XSA9IHh5IC0gd3o7XG4gICAgb3V0WzVdID0gMSAtICh4eCArIHp6KTtcbiAgICBvdXRbNl0gPSB5eiArIHd4O1xuICAgIG91dFs3XSA9IDA7XG5cbiAgICBvdXRbOF0gPSB4eiArIHd5O1xuICAgIG91dFs5XSA9IHl6IC0gd3g7XG4gICAgb3V0WzEwXSA9IDEgLSAoeHggKyB5eSk7XG4gICAgb3V0WzExXSA9IDA7XG5cbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGZydXN0dW0gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7TnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmZydXN0dW0gPSBmdW5jdGlvbiAob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICAgIHZhciBybCA9IDEgLyAocmlnaHQgLSBsZWZ0KSxcbiAgICAgICAgdGIgPSAxIC8gKHRvcCAtIGJvdHRvbSksXG4gICAgICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSAobmVhciAqIDIpICogcmw7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAobmVhciAqIDIpICogdGI7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IChyaWdodCArIGxlZnQpICogcmw7XG4gICAgb3V0WzldID0gKHRvcCArIGJvdHRvbSkgKiB0YjtcbiAgICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzExXSA9IC0xO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAoZmFyICogbmVhciAqIDIpICogbmY7XG4gICAgb3V0WzE1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGZvdnkgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IEFzcGVjdCByYXRpby4gdHlwaWNhbGx5IHZpZXdwb3J0IHdpZHRoL2hlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5wZXJzcGVjdGl2ZSA9IGZ1bmN0aW9uIChvdXQsIGZvdnksIGFzcGVjdCwgbmVhciwgZmFyKSB7XG4gICAgdmFyIGYgPSAxLjAgLyBNYXRoLnRhbihmb3Z5IC8gMiksXG4gICAgICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSBmIC8gYXNwZWN0O1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gZjtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTFdID0gLTE7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9ICgyICogZmFyICogbmVhcikgKiBuZjtcbiAgICBvdXRbMTVdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBvcnRob2dvbmFsIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0Lm9ydGhvID0gZnVuY3Rpb24gKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcbiAgICB2YXIgbHIgPSAxIC8gKGxlZnQgLSByaWdodCksXG4gICAgICAgIGJ0ID0gMSAvIChib3R0b20gLSB0b3ApLFxuICAgICAgICBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gLTIgKiBscjtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IC0yICogYnQ7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMiAqIG5mO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAobGVmdCArIHJpZ2h0KSAqIGxyO1xuICAgIG91dFsxM10gPSAodG9wICsgYm90dG9tKSAqIGJ0O1xuICAgIG91dFsxNF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBsb29rLWF0IG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBleWUgcG9zaXRpb24sIGZvY2FsIHBvaW50LCBhbmQgdXAgYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcbiAqIEBwYXJhbSB7dmVjM30gY2VudGVyIFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQubG9va0F0ID0gZnVuY3Rpb24gKG91dCwgZXllLCBjZW50ZXIsIHVwKSB7XG4gICAgdmFyIHgwLCB4MSwgeDIsIHkwLCB5MSwgeTIsIHowLCB6MSwgejIsIGxlbixcbiAgICAgICAgZXlleCA9IGV5ZVswXSxcbiAgICAgICAgZXlleSA9IGV5ZVsxXSxcbiAgICAgICAgZXlleiA9IGV5ZVsyXSxcbiAgICAgICAgdXB4ID0gdXBbMF0sXG4gICAgICAgIHVweSA9IHVwWzFdLFxuICAgICAgICB1cHogPSB1cFsyXSxcbiAgICAgICAgY2VudGVyeCA9IGNlbnRlclswXSxcbiAgICAgICAgY2VudGVyeSA9IGNlbnRlclsxXSxcbiAgICAgICAgY2VudGVyeiA9IGNlbnRlclsyXTtcblxuICAgIGlmIChNYXRoLmFicyhleWV4IC0gY2VudGVyeCkgPCBHTE1BVF9FUFNJTE9OICYmXG4gICAgICAgIE1hdGguYWJzKGV5ZXkgLSBjZW50ZXJ5KSA8IEdMTUFUX0VQU0lMT04gJiZcbiAgICAgICAgTWF0aC5hYnMoZXlleiAtIGNlbnRlcnopIDwgR0xNQVRfRVBTSUxPTikge1xuICAgICAgICByZXR1cm4gbWF0NC5pZGVudGl0eShvdXQpO1xuICAgIH1cblxuICAgIHowID0gZXlleCAtIGNlbnRlcng7XG4gICAgejEgPSBleWV5IC0gY2VudGVyeTtcbiAgICB6MiA9IGV5ZXogLSBjZW50ZXJ6O1xuXG4gICAgbGVuID0gMSAvIE1hdGguc3FydCh6MCAqIHowICsgejEgKiB6MSArIHoyICogejIpO1xuICAgIHowICo9IGxlbjtcbiAgICB6MSAqPSBsZW47XG4gICAgejIgKj0gbGVuO1xuXG4gICAgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxO1xuICAgIHgxID0gdXB6ICogejAgLSB1cHggKiB6MjtcbiAgICB4MiA9IHVweCAqIHoxIC0gdXB5ICogejA7XG4gICAgbGVuID0gTWF0aC5zcXJ0KHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4Mik7XG4gICAgaWYgKCFsZW4pIHtcbiAgICAgICAgeDAgPSAwO1xuICAgICAgICB4MSA9IDA7XG4gICAgICAgIHgyID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZW4gPSAxIC8gbGVuO1xuICAgICAgICB4MCAqPSBsZW47XG4gICAgICAgIHgxICo9IGxlbjtcbiAgICAgICAgeDIgKj0gbGVuO1xuICAgIH1cblxuICAgIHkwID0gejEgKiB4MiAtIHoyICogeDE7XG4gICAgeTEgPSB6MiAqIHgwIC0gejAgKiB4MjtcbiAgICB5MiA9IHowICogeDEgLSB6MSAqIHgwO1xuXG4gICAgbGVuID0gTWF0aC5zcXJ0KHkwICogeTAgKyB5MSAqIHkxICsgeTIgKiB5Mik7XG4gICAgaWYgKCFsZW4pIHtcbiAgICAgICAgeTAgPSAwO1xuICAgICAgICB5MSA9IDA7XG4gICAgICAgIHkyID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZW4gPSAxIC8gbGVuO1xuICAgICAgICB5MCAqPSBsZW47XG4gICAgICAgIHkxICo9IGxlbjtcbiAgICAgICAgeTIgKj0gbGVuO1xuICAgIH1cblxuICAgIG91dFswXSA9IHgwO1xuICAgIG91dFsxXSA9IHkwO1xuICAgIG91dFsyXSA9IHowO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0geDE7XG4gICAgb3V0WzVdID0geTE7XG4gICAgb3V0WzZdID0gejE7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSB4MjtcbiAgICBvdXRbOV0gPSB5MjtcbiAgICBvdXRbMTBdID0gejI7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IC0oeDAgKiBleWV4ICsgeDEgKiBleWV5ICsgeDIgKiBleWV6KTtcbiAgICBvdXRbMTNdID0gLSh5MCAqIGV5ZXggKyB5MSAqIGV5ZXkgKyB5MiAqIGV5ZXopO1xuICAgIG91dFsxNF0gPSAtKHowICogZXlleCArIHoxICogZXlleSArIHoyICogZXlleik7XG4gICAgb3V0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gbWF0IG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDQuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnLCAnICtcbiAgICAgICAgICAgICAgICAgICAgYVs0XSArICcsICcgKyBhWzVdICsgJywgJyArIGFbNl0gKyAnLCAnICsgYVs3XSArICcsICcgK1xuICAgICAgICAgICAgICAgICAgICBhWzhdICsgJywgJyArIGFbOV0gKyAnLCAnICsgYVsxMF0gKyAnLCAnICsgYVsxMV0gKyAnLCAnICsgXG4gICAgICAgICAgICAgICAgICAgIGFbMTJdICsgJywgJyArIGFbMTNdICsgJywgJyArIGFbMTRdICsgJywgJyArIGFbMTVdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMubWF0NCA9IG1hdDQ7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyBRdWF0ZXJuaW9uXG4gKiBAbmFtZSBxdWF0XG4gKi9cblxudmFyIHF1YXQgPSB7fTtcblxudmFyIHF1YXRJZGVudGl0eSA9IG5ldyBGbG9hdDMyQXJyYXkoWzAsIDAsIDAsIDFdKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IHF1YXRcbiAqXG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxuICovXG5xdWF0LmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBjbG9uZVxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmNsb25lID0gdmVjNC5jbG9uZTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5mcm9tVmFsdWVzID0gdmVjNC5mcm9tVmFsdWVzO1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBxdWF0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgc291cmNlIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmNvcHkgPSB2ZWM0LmNvcHk7XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgcXVhdCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc2V0ID0gdmVjNC5zZXQ7XG5cbi8qKlxuICogU2V0IGEgcXVhdCB0byB0aGUgaWRlbnRpdHkgcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXRzIGEgcXVhdCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhbmQgcm90YXRpb24gYXhpcyxcbiAqIHRoZW4gcmV0dXJucyBpdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyBhcm91bmQgd2hpY2ggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSBpbiByYWRpYW5zXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiovXG5xdWF0LnNldEF4aXNBbmdsZSA9IGZ1bmN0aW9uKG91dCwgYXhpcywgcmFkKSB7XG4gICAgcmFkID0gcmFkICogMC41O1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKTtcbiAgICBvdXRbMF0gPSBzICogYXhpc1swXTtcbiAgICBvdXRbMV0gPSBzICogYXhpc1sxXTtcbiAgICBvdXRbMl0gPSBzICogYXhpc1syXTtcbiAgICBvdXRbM10gPSBNYXRoLmNvcyhyYWQpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5hZGQgPSB2ZWM0LmFkZDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0Lm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXSxcbiAgICAgICAgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXSwgYncgPSBiWzNdO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieTtcbiAgICBvdXRbMV0gPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYng7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5tdWwgPSBxdWF0Lm11bHRpcGx5O1xuXG4vKipcbiAqIFNjYWxlcyBhIHF1YXQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc2NhbGUgPSB2ZWM0LnNjYWxlO1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQucm90YXRlWCA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHJhZCAqPSAwLjU7IFxuXG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXSxcbiAgICAgICAgYnggPSBNYXRoLnNpbihyYWQpLCBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieDtcbiAgICBvdXRbMV0gPSBheSAqIGJ3ICsgYXogKiBieDtcbiAgICBvdXRbMl0gPSBheiAqIGJ3IC0gYXkgKiBieDtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnJvdGF0ZVkgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICByYWQgKj0gMC41OyBcblxuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ5ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnk7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF4ICogYnk7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF5ICogYnk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWiBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5yb3RhdGVaID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgcmFkICo9IDAuNTsgXG5cbiAgICB2YXIgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdLFxuICAgICAgICBieiA9IE1hdGguc2luKHJhZCksIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGF4ICogYncgKyBheSAqIGJ6O1xuICAgIG91dFsxXSA9IGF5ICogYncgLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheiAqIGJ6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIFcgY29tcG9uZW50IG9mIGEgcXVhdCBmcm9tIHRoZSBYLCBZLCBhbmQgWiBjb21wb25lbnRzLlxuICogQXNzdW1lcyB0aGF0IHF1YXRlcm5pb24gaXMgMSB1bml0IGluIGxlbmd0aC5cbiAqIEFueSBleGlzdGluZyBXIGNvbXBvbmVudCB3aWxsIGJlIGlnbm9yZWQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgVyBjb21wb25lbnQgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5jYWxjdWxhdGVXID0gZnVuY3Rpb24gKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuXG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgb3V0WzNdID0gLU1hdGguc3FydChNYXRoLmFicygxLjAgLSB4ICogeCAtIHkgKiB5IC0geiAqIHopKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5kb3QgPSB2ZWM0LmRvdDtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5sZXJwID0gdmVjNC5sZXJwO1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnNsZXJwID0gZnVuY3Rpb24gKG91dCwgYSwgYiwgdCkge1xuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl0sIGJ3ID0gYlszXTtcblxuICAgIHZhciBjb3NIYWxmVGhldGEgPSBheCAqIGJ4ICsgYXkgKiBieSArIGF6ICogYnogKyBhdyAqIGJ3LFxuICAgICAgICBoYWxmVGhldGEsXG4gICAgICAgIHNpbkhhbGZUaGV0YSxcbiAgICAgICAgcmF0aW9BLFxuICAgICAgICByYXRpb0I7XG5cbiAgICBpZiAoTWF0aC5hYnMoY29zSGFsZlRoZXRhKSA+PSAxLjApIHtcbiAgICAgICAgaWYgKG91dCAhPT0gYSkge1xuICAgICAgICAgICAgb3V0WzBdID0gYXg7XG4gICAgICAgICAgICBvdXRbMV0gPSBheTtcbiAgICAgICAgICAgIG91dFsyXSA9IGF6O1xuICAgICAgICAgICAgb3V0WzNdID0gYXc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG5cbiAgICBoYWxmVGhldGEgPSBNYXRoLmFjb3MoY29zSGFsZlRoZXRhKTtcbiAgICBzaW5IYWxmVGhldGEgPSBNYXRoLnNxcnQoMS4wIC0gY29zSGFsZlRoZXRhICogY29zSGFsZlRoZXRhKTtcblxuICAgIGlmIChNYXRoLmFicyhzaW5IYWxmVGhldGEpIDwgMC4wMDEpIHtcbiAgICAgICAgb3V0WzBdID0gKGF4ICogMC41ICsgYnggKiAwLjUpO1xuICAgICAgICBvdXRbMV0gPSAoYXkgKiAwLjUgKyBieSAqIDAuNSk7XG4gICAgICAgIG91dFsyXSA9IChheiAqIDAuNSArIGJ6ICogMC41KTtcbiAgICAgICAgb3V0WzNdID0gKGF3ICogMC41ICsgYncgKiAwLjUpO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICAgIHJhdGlvQSA9IE1hdGguc2luKCgxIC0gdCkgKiBoYWxmVGhldGEpIC8gc2luSGFsZlRoZXRhO1xuICAgIHJhdGlvQiA9IE1hdGguc2luKHQgKiBoYWxmVGhldGEpIC8gc2luSGFsZlRoZXRhO1xuXG4gICAgb3V0WzBdID0gKGF4ICogcmF0aW9BICsgYnggKiByYXRpb0IpO1xuICAgIG91dFsxXSA9IChheSAqIHJhdGlvQSArIGJ5ICogcmF0aW9CKTtcbiAgICBvdXRbMl0gPSAoYXogKiByYXRpb0EgKyBieiAqIHJhdGlvQik7XG4gICAgb3V0WzNdID0gKGF3ICogcmF0aW9BICsgYncgKiByYXRpb0IpO1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaW52ZXJzZSBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBpbnZlcnNlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSxcbiAgICAgICAgZG90ID0gYTAqYTAgKyBhMSphMSArIGEyKmEyICsgYTMqYTMsXG4gICAgICAgIGludkRvdCA9IGRvdCA/IDEuMC9kb3QgOiAwO1xuICAgIFxuICAgIC8vIFRPRE86IFdvdWxkIGJlIGZhc3RlciB0byByZXR1cm4gWzAsMCwwLDBdIGltbWVkaWF0ZWx5IGlmIGRvdCA9PSAwXG5cbiAgICBvdXRbMF0gPSAtYTAqaW52RG90O1xuICAgIG91dFsxXSA9IC1hMSppbnZEb3Q7XG4gICAgb3V0WzJdID0gLWEyKmludkRvdDtcbiAgICBvdXRbM10gPSBhMyppbnZEb3Q7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgY29uanVnYXRlIG9mIGEgcXVhdFxuICogSWYgdGhlIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0LmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5jb25qdWdhdGUgPSBmdW5jdGlvbiAob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubGVuZ3RoID0gdmVjNC5sZW5ndGg7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmxlbiA9IHF1YXQubGVuZ3RoO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5zcXVhcmVkTGVuZ3RoID0gdmVjNC5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc3FyTGVuID0gcXVhdC5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubm9ybWFsaXplID0gdmVjNC5ub3JtYWxpemU7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gM3gzIHJvdGF0aW9uIG1hdHJpeC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7bWF0M30gbSByb3RhdGlvbiBtYXRyaXhcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmZyb21NYXQzID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzX2lOZXh0ID0gWzEsMiwwXTtcbiAgICByZXR1cm4gZnVuY3Rpb24ob3V0LCBtKSB7XG4gICAgICAgIC8vIEFsZ29yaXRobSBpbiBLZW4gU2hvZW1ha2UncyBhcnRpY2xlIGluIDE5ODcgU0lHR1JBUEggY291cnNlIG5vdGVzXG4gICAgICAgIC8vIGFydGljbGUgXCJRdWF0ZXJuaW9uIENhbGN1bHVzIGFuZCBGYXN0IEFuaW1hdGlvblwiLlxuICAgICAgICB2YXIgZlRyYWNlID0gbVswXSArIG1bNF0gKyBtWzhdO1xuICAgICAgICB2YXIgZlJvb3Q7XG5cbiAgICAgICAgaWYgKCBmVHJhY2UgPiAwLjAgKSB7XG4gICAgICAgICAgICAvLyB8d3wgPiAxLzIsIG1heSBhcyB3ZWxsIGNob29zZSB3ID4gMS8yXG4gICAgICAgICAgICBmUm9vdCA9IE1hdGguc3FydChmVHJhY2UgKyAxLjApOyAgLy8gMndcbiAgICAgICAgICAgIG91dFszXSA9IDAuNSAqIGZSb290O1xuICAgICAgICAgICAgZlJvb3QgPSAwLjUvZlJvb3Q7ICAvLyAxLyg0dylcbiAgICAgICAgICAgIG91dFswXSA9IChtWzddLW1bNV0pKmZSb290O1xuICAgICAgICAgICAgb3V0WzFdID0gKG1bMl0tbVs2XSkqZlJvb3Q7XG4gICAgICAgICAgICBvdXRbMl0gPSAobVszXS1tWzFdKSpmUm9vdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHx3fCA8PSAxLzJcbiAgICAgICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgICAgIGlmICggbVs0XSA+IG1bMF0gKVxuICAgICAgICAgICAgICBpID0gMTtcbiAgICAgICAgICAgIGlmICggbVs4XSA+IG1baSozK2ldIClcbiAgICAgICAgICAgICAgaSA9IDI7XG4gICAgICAgICAgICB2YXIgaiA9IHNfaU5leHRbaV07XG4gICAgICAgICAgICB2YXIgayA9IHNfaU5leHRbal07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZSb290ID0gTWF0aC5zcXJ0KG1baSozK2ldLW1baiozK2pdLW1bayozK2tdICsgMS4wKTtcbiAgICAgICAgICAgIG91dFtpXSA9IDAuNSAqIGZSb290O1xuICAgICAgICAgICAgZlJvb3QgPSAwLjUgLyBmUm9vdDtcbiAgICAgICAgICAgIG91dFszXSA9IChtW2sqMytqXSAtIG1baiozK2tdKSAqIGZSb290O1xuICAgICAgICAgICAgb3V0W2pdID0gKG1baiozK2ldICsgbVtpKjMral0pICogZlJvb3Q7XG4gICAgICAgICAgICBvdXRba10gPSAobVtrKjMraV0gKyBtW2kqMytrXSkgKiBmUm9vdDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgcXVhdGVuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSB2ZWMgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xucXVhdC5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAncXVhdCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnF1YXQgPSBxdWF0O1xufVxuO1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4gIH0pKHNoaW0uZXhwb3J0cyk7XG59KSgpO1xuIiwidmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vcG9pbnQuanMnKTtcbnZhciBHZW8gPSByZXF1aXJlKCcuLi9nZW8uanMnKTtcbnZhciBWZWN0b3JSZW5kZXJlciA9IHJlcXVpcmUoJy4uL3ZlY3Rvcl9yZW5kZXJlci5qcycpO1xuXG5WZWN0b3JSZW5kZXJlci5DYW52YXNSZW5kZXJlciA9IENhbnZhc1JlbmRlcmVyO1xuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWZWN0b3JSZW5kZXJlci5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBDYW52YXNSZW5kZXJlciAodGlsZV9zb3VyY2UsIGxheWVycywgc3R5bGVzLCBvcHRpb25zKVxue1xuICAgIFZlY3RvclJlbmRlcmVyLmNhbGwodGhpcywgJ0NhbnZhc1JlbmRlcmVyJywgdGlsZV9zb3VyY2UsIGxheWVycywgc3R5bGVzLCBvcHRpb25zKTtcblxuICAgIC8vIFNlbGVjdGlvbiBpbmZvIHNob3duIG9uIGhvdmVyXG4gICAgdGhpcy5zZWxlY3Rpb25faW5mbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuc2VsZWN0aW9uX2luZm8uc2V0QXR0cmlidXRlKCdjbGFzcycsICdsYWJlbCcpO1xuICAgIHRoaXMuc2VsZWN0aW9uX2luZm8uc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgIC8vIEZvciBkcmF3aW5nIG11bHRpcG9seWdvbnMgdy9jYW52YXMgY29tcG9zaXRlIG9wZXJhdGlvbnNcbiAgICB0aGlzLmN1dG91dF9jb250ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykuZ2V0Q29udGV4dCgnMmQnKTtcbn1cblxuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLl90aWxlV29ya2VyQ29tcGxldGVkID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgLy8gVXNlIGV4aXN0aW5nIGNhbnZhcyBvciBjcmVhdGUgbmV3IG9uZVxuICAgIGlmICh0aWxlLmNhbnZhcyA9PSBudWxsKSB7XG4gICAgICAgIHRpbGUuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHRpbGUuY29udGV4dCA9IHRpbGUuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgdGlsZS5jYW52YXMuc3R5bGUud2lkdGggPSBHZW8udGlsZV9zaXplICsgJ3B4JztcbiAgICAgICAgdGlsZS5jYW52YXMuc3R5bGUud2lkdGggPSBHZW8udGlsZV9zaXplICsgJ3B4JztcbiAgICAgICAgdGlsZS5jYW52YXMud2lkdGggPSBNYXRoLnJvdW5kKEdlby50aWxlX3NpemUgKiB0aGlzLmRldmljZV9waXhlbF9yYXRpbyk7XG4gICAgICAgIHRpbGUuY2FudmFzLmhlaWdodCA9IE1hdGgucm91bmQoR2VvLnRpbGVfc2l6ZSAqIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvKTtcbiAgICAgICAgdGlsZS5jYW52YXMuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JUb1N0cmluZyh0aGlzLnN0eWxlcy5kZWZhdWx0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRpbGUuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGlsZS5jYW52YXMud2lkdGgsIHRpbGUuY2FudmFzLmhlaWdodCk7XG4gICAgfVxuXG4gICAgdGhpcy5yZW5kZXJUaWxlKHRpbGUsIHRpbGUuY29udGV4dCk7XG5cbiAgICBpZiAodGlsZS5jYW52YXMucGFyZW50Tm9kZSA9PSBudWxsKSB7XG4gICAgICAgIHZhciB0aWxlRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdltkYXRhLXRpbGUta2V5PSdcIiArIHRpbGUua2V5ICsgXCInXVwiKTtcbiAgICAgICAgdGlsZURpdi5hcHBlbmRDaGlsZCh0aWxlLmNhbnZhcyk7XG4gICAgfVxufTtcblxuLy8gU2NhbGUgYSBHZW9KU09OIGNvb3JkaW5hdGUgKDItZWxlbWVudCBhcnJheSkgZnJvbSBbbWluLCBtYXhdIHRvIHRpbGUgcGl4ZWxzXG4vLyByZXR1cm5zIGEgY29weSBvZiBnZW9tZXRyeS5jb29yZGluYXRlcyB0cmFuc2Zvcm1lZCBpbnRvIFBvaW50c1xuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnNjYWxlR2VvbWV0cnlUb1BpeGVscyA9IGZ1bmN0aW9uIHNjYWxlR2VvbWV0cnlUb1BpeGVscyAoZ2VvbWV0cnkpXG57XG4gICAgdmFyIHJlbmRlcmVyID0gdGhpcztcbiAgICByZXR1cm4gR2VvLnRyYW5zZm9ybUdlb21ldHJ5KGdlb21ldHJ5LCBmdW5jdGlvbiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgcmV0dXJuIFBvaW50KFxuICAgICAgICAgICAgLy8gTWF0aC5yb3VuZCgoY29vcmRpbmF0ZXNbMF0gLSBtaW4ueCkgKiBHZW8udGlsZV9zaXplIC8gKG1heC54IC0gbWluLngpKSwgLy8gcm91bmRpbmcgcmVtb3ZlcyBzZWFtcyBidXQgY2F1c2VzIGFsaWFzaW5nXG4gICAgICAgICAgICAvLyBNYXRoLnJvdW5kKChjb29yZGluYXRlc1sxXSAtIG1pbi55KSAqIEdlby50aWxlX3NpemUgLyAobWF4LnkgLSBtaW4ueSkpXG4gICAgICAgICAgICBjb29yZGluYXRlc1swXSAqIEdlby50aWxlX3NpemUgKiByZW5kZXJlci5kZXZpY2VfcGl4ZWxfcmF0aW8gLyBWZWN0b3JSZW5kZXJlci50aWxlX3NjYWxlLFxuICAgICAgICAgICAgY29vcmRpbmF0ZXNbMV0gKiBHZW8udGlsZV9zaXplICogcmVuZGVyZXIuZGV2aWNlX3BpeGVsX3JhdGlvIC8gVmVjdG9yUmVuZGVyZXIudGlsZV9zY2FsZSAqIC0xIC8vIGFkanVzdCBmb3IgZmxpcHBlZCB5LWNvb3JkXG4gICAgICAgICk7XG4gICAgfSk7XG59O1xuXG4vLyBSZW5kZXJzIGEgbGluZSBnaXZlbiBhcyBhbiBhcnJheSBvZiBQb2ludHNcbi8vIGxpbmUgPSBbUG9pbnQsIFBvaW50LCAuLi5dXG5DYW52YXNSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyTGluZSA9IGZ1bmN0aW9uIHJlbmRlckxpbmUgKGxpbmUsIHN0eWxlLCBjb250ZXh0KVxue1xuICAgIHZhciBzZWdtZW50cyA9IGxpbmU7XG4gICAgdmFyIGNvbG9yID0gc3R5bGUuY29sb3I7XG4gICAgdmFyIHdpZHRoID0gc3R5bGUud2lkdGg7XG4gICAgdmFyIGRhc2ggPSBzdHlsZS5kYXNoO1xuXG4gICAgdmFyIGMgPSBjb250ZXh0O1xuICAgIGMuYmVnaW5QYXRoKCk7XG4gICAgYy5zdHJva2VTdHlsZSA9IHRoaXMuY29sb3JUb1N0cmluZyhjb2xvcik7XG4gICAgYy5saW5lQ2FwID0gJ3JvdW5kJztcbiAgICBjLmxpbmVXaWR0aCA9IHdpZHRoO1xuICAgIGlmIChjLnNldExpbmVEYXNoKSB7XG4gICAgICAgIGlmIChkYXNoKSB7XG4gICAgICAgICAgICBjLnNldExpbmVEYXNoKGRhc2gubWFwKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkICogd2lkdGg7IH0pKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGMuc2V0TGluZURhc2goW10pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgcj0wOyByIDwgc2VnbWVudHMubGVuZ3RoIC0gMTsgciArKykge1xuICAgICAgICB2YXIgc2VnbWVudCA9IFtcbiAgICAgICAgICAgIHNlZ21lbnRzW3JdLngsIHNlZ21lbnRzW3JdLnksXG4gICAgICAgICAgICBzZWdtZW50c1tyICsgMV0ueCwgc2VnbWVudHNbciArIDFdLnlcbiAgICAgICAgXTtcblxuICAgICAgICBjLm1vdmVUbyhzZWdtZW50WzBdLCBzZWdtZW50WzFdKTtcbiAgICAgICAgYy5saW5lVG8oc2VnbWVudFsyXSwgc2VnbWVudFszXSk7XG4gICAgfTtcblxuICAgIGMuY2xvc2VQYXRoKCk7XG4gICAgYy5zdHJva2UoKTtcbn07XG5cbi8vIFJlbmRlcnMgYSBwb2x5Z29uIGdpdmVuIGFzIGFuIGFycmF5IG9mIFBvaW50c1xuLy8gcG9seWdvbiA9IFtQb2ludCwgUG9pbnQsIC4uLl1cbkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXJQb2x5Z29uID0gZnVuY3Rpb24gcmVuZGVyUG9seWdvbiAocG9seWdvbiwgc3R5bGUsIGNvbnRleHQpXG57XG4gICAgdmFyIHNlZ21lbnRzID0gcG9seWdvbjtcbiAgICB2YXIgY29sb3IgPSBzdHlsZS5jb2xvcjtcbiAgICB2YXIgd2lkdGggPSBzdHlsZS53aWR0aDtcbiAgICB2YXIgb3V0bGluZV9jb2xvciA9IHN0eWxlLm91dGxpbmUgJiYgc3R5bGUub3V0bGluZS5jb2xvcjtcbiAgICB2YXIgb3V0bGluZV93aWR0aCA9IHN0eWxlLm91dGxpbmUgJiYgc3R5bGUub3V0bGluZS53aWR0aDtcbiAgICB2YXIgb3V0bGluZV9kYXNoID0gc3R5bGUub3V0bGluZSAmJiBzdHlsZS5vdXRsaW5lLmRhc2g7XG5cbiAgICB2YXIgYyA9IGNvbnRleHQ7XG4gICAgYy5iZWdpblBhdGgoKTtcbiAgICBjLmZpbGxTdHlsZSA9IHRoaXMuY29sb3JUb1N0cmluZyhjb2xvcik7XG4gICAgYy5tb3ZlVG8oc2VnbWVudHNbMF0ueCwgc2VnbWVudHNbMF0ueSk7XG5cbiAgICBmb3IgKHZhciByPTE7IHIgPCBzZWdtZW50cy5sZW5ndGg7IHIgKyspIHtcbiAgICAgICAgYy5saW5lVG8oc2VnbWVudHNbcl0ueCwgc2VnbWVudHNbcl0ueSk7XG4gICAgfTtcblxuICAgIGMuY2xvc2VQYXRoKCk7XG4gICAgYy5maWxsKCk7XG5cbiAgICAvLyBPdXRsaW5lXG4gICAgaWYgKG91dGxpbmVfY29sb3IgJiYgb3V0bGluZV93aWR0aCkge1xuICAgICAgICBjLnN0cm9rZVN0eWxlID0gdGhpcy5jb2xvclRvU3RyaW5nKG91dGxpbmVfY29sb3IpO1xuICAgICAgICBjLmxpbmVDYXAgPSAncm91bmQnO1xuICAgICAgICBjLmxpbmVXaWR0aCA9IG91dGxpbmVfd2lkdGg7XG4gICAgICAgIGlmIChjLnNldExpbmVEYXNoKSB7XG4gICAgICAgICAgICBpZiAob3V0bGluZV9kYXNoKSB7XG4gICAgICAgICAgICAgICAgYy5zZXRMaW5lRGFzaChvdXRsaW5lX2Rhc2gubWFwKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkICogb3V0bGluZV93aWR0aDsgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYy5zZXRMaW5lRGFzaChbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYy5zdHJva2UoKTtcbiAgICB9XG59O1xuXG4vLyBSZW5kZXJzIGEgcG9pbnQgZ2l2ZW4gYXMgYSBQb2ludCBvYmplY3RcbkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXJQb2ludCA9IGZ1bmN0aW9uIHJlbmRlclBvaW50IChwb2ludCwgc3R5bGUsIGNvbnRleHQpXG57XG4gICAgdmFyIGNvbG9yID0gc3R5bGUuY29sb3I7XG4gICAgdmFyIHNpemUgPSBzdHlsZS5zaXplO1xuICAgIHZhciBvdXRsaW5lX2NvbG9yID0gc3R5bGUub3V0bGluZSAmJiBzdHlsZS5vdXRsaW5lLmNvbG9yO1xuICAgIHZhciBvdXRsaW5lX3dpZHRoID0gc3R5bGUub3V0bGluZSAmJiBzdHlsZS5vdXRsaW5lLndpZHRoO1xuICAgIHZhciBvdXRsaW5lX2Rhc2ggPSBzdHlsZS5vdXRsaW5lICYmIHN0eWxlLm91dGxpbmUuZGFzaDtcblxuICAgIHZhciBjID0gY29udGV4dDtcbiAgICBjLmZpbGxTdHlsZSA9IHRoaXMuY29sb3JUb1N0cmluZyhjb2xvcik7XG5cbiAgICBjLmJlZ2luUGF0aCgpO1xuICAgIGMuYXJjKHBvaW50LngsIHBvaW50LnksIHNpemUsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICBjLmNsb3NlUGF0aCgpO1xuICAgIGMuZmlsbCgpO1xuXG4gICAgLy8gT3V0bGluZVxuICAgIGlmIChvdXRsaW5lX2NvbG9yICYmIG91dGxpbmVfd2lkdGgpIHtcbiAgICAgICAgYy5zdHJva2VTdHlsZSA9IHRoaXMuY29sb3JUb1N0cmluZyhvdXRsaW5lX2NvbG9yKTtcbiAgICAgICAgYy5saW5lV2lkdGggPSBvdXRsaW5lX3dpZHRoO1xuICAgICAgICBpZiAoYy5zZXRMaW5lRGFzaCkge1xuICAgICAgICAgICAgaWYgKG91dGxpbmVfZGFzaCkge1xuICAgICAgICAgICAgICAgIGMuc2V0TGluZURhc2gob3V0bGluZV9kYXNoLm1hcChmdW5jdGlvbiAoZCkgeyByZXR1cm4gZCAqIG91dGxpbmVfd2lkdGg7IH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGMuc2V0TGluZURhc2goW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGMuc3Ryb2tlKCk7XG4gICAgfVxufTtcblxuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlckZlYXR1cmUgPSBmdW5jdGlvbiByZW5kZXJGZWF0dXJlIChmZWF0dXJlLCBzdHlsZSwgY29udGV4dClcbntcbiAgICB2YXIgZywgaCwgcG9seXM7XG4gICAgdmFyIGdlb21ldHJ5ID0gZmVhdHVyZS5nZW9tZXRyeTtcblxuICAgIGlmIChnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJykge1xuICAgICAgICB0aGlzLnJlbmRlckxpbmUoZ2VvbWV0cnkucGl4ZWxzLCBzdHlsZSwgY29udGV4dCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpTGluZVN0cmluZycpIHtcbiAgICAgICAgZm9yIChnPTA7IGcgPCBnZW9tZXRyeS5waXhlbHMubGVuZ3RoOyBnKyspIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyTGluZShnZW9tZXRyeS5waXhlbHNbZ10sIHN0eWxlLCBjb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJyB8fCBnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICAgIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJykge1xuICAgICAgICAgICAgcG9seXMgPSBbZ2VvbWV0cnkucGl4ZWxzXTsgLy8gdHJlYXQgUG9seWdvbiBhcyBhIGRlZ2VuZXJhdGUgTXVsdGlQb2x5Z29uIHRvIGF2b2lkIGR1cGxpY2F0aW5nIGNvZGVcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHBvbHlzID0gZ2VvbWV0cnkucGl4ZWxzO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChnPTA7IGcgPCBwb2x5cy5sZW5ndGg7IGcrKykge1xuICAgICAgICAgICAgLy8gUG9seWdvbnMgd2l0aCBob2xlczpcbiAgICAgICAgICAgIC8vIFJlbmRlciB0byBhIHNlcGFyYXRlIGNhbnZhcywgdXNpbmcgY29tcG9zaXRlIG9wZXJhdGlvbnMgdG8gY3V0IGhvbGVzIG91dCBvZiBwb2x5Z29uLCB0aGVuIGNvcHkgYmFjayB0byB0aGUgbWFpbiBjYW52YXNcbiAgICAgICAgICAgIGlmIChwb2x5c1tnXS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3V0b3V0X2NvbnRleHQuY2FudmFzLndpZHRoICE9IGNvbnRleHQuY2FudmFzLndpZHRoIHx8IHRoaXMuY3V0b3V0X2NvbnRleHQuY2FudmFzLmhlaWdodCAhPSBjb250ZXh0LmNhbnZhcy5oZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXRvdXRfY29udGV4dC5jYW52YXMud2lkdGggPSBjb250ZXh0LmNhbnZhcy53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXRvdXRfY29udGV4dC5jYW52YXMuaGVpZ2h0ID0gY29udGV4dC5jYW52YXMuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmN1dG91dF9jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmN1dG91dF9jb250ZXh0LmNhbnZhcy53aWR0aCwgdGhpcy5jdXRvdXRfY29udGV4dC5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY3V0b3V0X2NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclBvbHlnb24ocG9seXNbZ11bMF0sIHN0eWxlLCB0aGlzLmN1dG91dF9jb250ZXh0KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY3V0b3V0X2NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLW91dCc7XG4gICAgICAgICAgICAgICAgZm9yIChoPTE7IGggPCBwb2x5c1tnXS5sZW5ndGg7IGgrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclBvbHlnb24ocG9seXNbZ11baF0sIHN0eWxlLCB0aGlzLmN1dG91dF9jb250ZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UodGhpcy5jdXRvdXRfY29udGV4dC5jYW52YXMsIDAsIDApO1xuXG4gICAgICAgICAgICAgICAgLy8gQWZ0ZXIgY29tcG9zaXRpbmcgYmFjayB0byBtYWluIGNhbnZhcywgZHJhdyBvdXRsaW5lcyBvbiBob2xlc1xuICAgICAgICAgICAgICAgIGlmIChzdHlsZS5vdXRsaW5lICYmIHN0eWxlLm91dGxpbmUuY29sb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChoPTE7IGggPCBwb2x5c1tnXS5sZW5ndGg7IGgrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJMaW5lKHBvbHlzW2ddW2hdLCBzdHlsZS5vdXRsaW5lLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJlZ3VsYXIgY2xvc2VkIHBvbHlnb25zXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclBvbHlnb24ocG9seXNbZ11bMF0sIHN0eWxlLCBjb250ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2ludCcpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJQb2ludChnZW9tZXRyeS5waXhlbHMsIHN0eWxlLCBjb250ZXh0KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2ludCcpIHtcbiAgICAgICAgZm9yIChnPTA7IGcgPCBnZW9tZXRyeS5waXhlbHMubGVuZ3RoOyBnKyspIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyUG9pbnQoZ2VvbWV0cnkucGl4ZWxzW2ddLCBzdHlsZSwgY29udGV4dCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vLyBSZW5kZXIgYSBHZW9KU09OIHRpbGUgb250byBjYW52YXNcbkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXJUaWxlID0gZnVuY3Rpb24gcmVuZGVyVGlsZSAodGlsZSwgY29udGV4dClcbntcbiAgICB2YXIgcmVuZGVyZXIgPSB0aGlzO1xuICAgIHZhciBzdHlsZTtcblxuICAgIC8vIFNlbGVjdGlvbiByZW5kZXJpbmcgLSBvZmYtc2NyZWVuIGNhbnZhcyB0byByZW5kZXIgYSBjb2xsaXNpb24gbWFwIGZvciBmZWF0dXJlIHNlbGVjdGlvblxuICAgIGlmICh0aWxlLnNlbGVjdGlvbl9jYW52YXMgPT0gbnVsbCkge1xuICAgICAgICB0aWxlLnNlbGVjdGlvbl9jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGlsZS5zZWxlY3Rpb25fY29udGV4dCA9IHRpbGUuc2VsZWN0aW9uX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIHRpbGUuc2VsZWN0aW9uX2NhbnZhcy5zdHlsZS53aWR0aCA9IEdlby50aWxlX3NpemUgKyAncHgnO1xuICAgICAgICB0aWxlLnNlbGVjdGlvbl9jYW52YXMuc3R5bGUud2lkdGggPSBHZW8udGlsZV9zaXplICsgJ3B4JztcbiAgICAgICAgdGlsZS5zZWxlY3Rpb25fY2FudmFzLndpZHRoID0gTWF0aC5yb3VuZChHZW8udGlsZV9zaXplICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8pO1xuICAgICAgICB0aWxlLnNlbGVjdGlvbl9jYW52YXMuaGVpZ2h0ID0gTWF0aC5yb3VuZChHZW8udGlsZV9zaXplICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8pO1xuICAgIH1cblxuICAgIHZhciBzZWxlY3Rpb24gPSB7IGNvbG9yczoge30gfTtcbiAgICB2YXIgc2VsZWN0aW9uX2NvbG9yO1xuICAgIHZhciBzZWxlY3Rpb25fY291bnQgPSAwO1xuXG4gICAgLy8gUmVuZGVyIGxheWVyc1xuICAgIGZvciAodmFyIHQgaW4gcmVuZGVyZXIubGF5ZXJzKSB7XG4gICAgICAgIHZhciBsYXllciA9IHJlbmRlcmVyLmxheWVyc1t0XTtcblxuICAgICAgICAvLyBTa2lwIGxheWVycyB3aXRoIG5vIHN0eWxlcyBkZWZpbmVkLCBvciBsYXllcnMgc2V0IHRvIG5vdCBiZSB2aXNpYmxlXG4gICAgICAgIGlmICh0aGlzLnN0eWxlc1tsYXllci5uYW1lXSA9PSBudWxsIHx8ICF0aGlzLnN0eWxlc1tsYXllci5uYW1lXS52aXNpYmxlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRpbGUubGF5ZXJzW2xheWVyLm5hbWVdLmZlYXR1cmVzLmZvckVhY2goZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgICAgICAgICAgLy8gU2NhbGUgbG9jYWwgY29vcmRzIHRvIHRpbGUgcGl4ZWxzXG4gICAgICAgICAgICBmZWF0dXJlLmdlb21ldHJ5LnBpeGVscyA9IHRoaXMuc2NhbGVHZW9tZXRyeVRvUGl4ZWxzKGZlYXR1cmUuZ2VvbWV0cnkpO1xuICAgICAgICAgICAgc3R5bGUgPSBWZWN0b3JSZW5kZXJlci5wYXJzZVN0eWxlRm9yRmVhdHVyZShmZWF0dXJlLCB0aGlzLnN0eWxlc1tsYXllci5uYW1lXSwgdGlsZSk7XG5cbiAgICAgICAgICAgIC8vIERyYXcgdmlzaWJsZSBnZW9tZXRyeVxuICAgICAgICAgICAgdGhpcy5yZW5kZXJGZWF0dXJlKGZlYXR1cmUsIHN0eWxlLCBjb250ZXh0KTtcblxuICAgICAgICAgICAgLy8gRHJhdyBtYXNrIGZvciBpbnRlcmFjdGl2aXR5XG4gICAgICAgICAgICAvLyBUT0RPOiBtb3ZlIHNlbGVjdGlvbiBmaWx0ZXIgbG9naWMgdG8gc3R5bGVzaGVldFxuICAgICAgICAgICAgLy8gVE9ETzogb25seSBhbHRlciBzdHlsZXMgdGhhdCBhcmUgZXhwbGljaXRseSBkaWZmZXJlbnQsIGRvbid0IG1hbnVhbGx5IGNvcHkgc3R5bGUgdmFsdWVzIGJ5IHByb3BlcnR5IG5hbWVcbiAgICAgICAgICAgIGlmIChsYXllci5zZWxlY3Rpb24gPT0gdHJ1ZSAmJiBmZWF0dXJlLnByb3BlcnRpZXMubmFtZSAhPSBudWxsICYmIGZlYXR1cmUucHJvcGVydGllcy5uYW1lICE9ICcnKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uX2NvbG9yID0gdGhpcy5nZW5lcmF0ZUNvbG9yKHNlbGVjdGlvbi5jb2xvcnMpO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9jb2xvci5wcm9wZXJ0aWVzID0gZmVhdHVyZS5wcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9jb3VudCsrO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRmVhdHVyZShmZWF0dXJlLCB7IGNvbG9yOiBzZWxlY3Rpb25fY29sb3IuY29sb3IsIHdpZHRoOiBzdHlsZS53aWR0aCwgc2l6ZTogc3R5bGUuc2l6ZSB9LCB0aWxlLnNlbGVjdGlvbl9jb250ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgZ2VvbWV0cnkgaXNuJ3QgaW50ZXJhY3RpdmUsIG1hc2sgaXQgb3V0IHNvIGdlb21ldHJ5IHVuZGVyIGl0IGRvZXNuJ3QgYXBwZWFyIHRvIHBvcCB0aHJvdWdoXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJGZWF0dXJlKGZlYXR1cmUsIHsgY29sb3I6IFswLCAwLCAwXSwgd2lkdGg6IHN0eWxlLndpZHRoLCBzaXplOiBzdHlsZS5zaXplIH0sIHRpbGUuc2VsZWN0aW9uX2NvbnRleHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cblxuICAgIC8vIFNlbGVjdGlvbiBldmVudHNcbiAgICB2YXIgc2VsZWN0aW9uX2luZm8gPSB0aGlzLnNlbGVjdGlvbl9pbmZvO1xuICAgIGlmIChzZWxlY3Rpb25fY291bnQgPiAwKSB7XG4gICAgICAgIHRoaXMudGlsZXNbdGlsZS5rZXldLnNlbGVjdGlvbiA9IHNlbGVjdGlvbjtcblxuICAgICAgICBzZWxlY3Rpb24ucGl4ZWxzID0gbmV3IFVpbnQzMkFycmF5KHRpbGUuc2VsZWN0aW9uX2NvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIHRpbGUuc2VsZWN0aW9uX2NhbnZhcy53aWR0aCwgdGlsZS5zZWxlY3Rpb25fY2FudmFzLmhlaWdodCkuZGF0YS5idWZmZXIpO1xuXG4gICAgICAgIC8vIFRPRE86IGZpcmUgZXZlbnRzIG9uIHNlbGVjdGlvbiB0byBlbmFibGUgY3VzdG9tIGJlaGF2aW9yXG4gICAgICAgIGNvbnRleHQuY2FudmFzLm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgaGl0ID0geyB4OiBldmVudC5vZmZzZXRYLCB5OiBldmVudC5vZmZzZXRZIH07IC8vIGxheWVyWC9ZXG4gICAgICAgICAgICB2YXIgb2ZmID0gKGhpdC55ICogcmVuZGVyZXIuZGV2aWNlX3BpeGVsX3JhdGlvKSAqIChHZW8udGlsZV9zaXplICogcmVuZGVyZXIuZGV2aWNlX3BpeGVsX3JhdGlvKSArIChoaXQueCAqIHJlbmRlcmVyLmRldmljZV9waXhlbF9yYXRpbyk7XG4gICAgICAgICAgICB2YXIgY29sb3IgPSBzZWxlY3Rpb24ucGl4ZWxzW29mZl07XG4gICAgICAgICAgICB2YXIgZmVhdHVyZSA9IHNlbGVjdGlvbi5jb2xvcnNbY29sb3JdO1xuICAgICAgICAgICAgaWYgKGZlYXR1cmUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQuY2FudmFzLnN0eWxlLmN1cnNvciA9ICdjcm9zc2hhaXInO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9pbmZvLnN0eWxlLmxlZnQgPSAoaGl0LnggKyA1KSArICdweCc7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uX2luZm8uc3R5bGUudG9wID0gKGhpdC55ICsgNSkgKyAncHgnO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9pbmZvLmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cImxhYmVsSW5uZXJcIj4nICsgZmVhdHVyZS5wcm9wZXJ0aWVzLm5hbWUgKyAvKicgWycgKyBmZWF0dXJlLnByb3BlcnRpZXMua2luZCArICddKi8nPC9zcGFuPic7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uX2luZm8uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgY29udGV4dC5jYW52YXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChzZWxlY3Rpb25faW5mbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmNhbnZhcy5zdHlsZS5jdXJzb3IgPSBudWxsO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9pbmZvLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGlvbl9pbmZvLnBhcmVudE5vZGUgPT0gY29udGV4dC5jYW52YXMucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmNhbnZhcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNlbGVjdGlvbl9pbmZvKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb250ZXh0LmNhbnZhcy5vbm1vdXNlbW92ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgY29udGV4dC5jYW52YXMuc3R5bGUuY3Vyc29yID0gbnVsbDtcbiAgICAgICAgICAgIHNlbGVjdGlvbl9pbmZvLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBpZiAoc2VsZWN0aW9uX2luZm8ucGFyZW50Tm9kZSA9PSBjb250ZXh0LmNhbnZhcy5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5jYW52YXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzZWxlY3Rpb25faW5mbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxufTtcblxuLyogQ29sb3IgaGVscGVycyAqL1xuXG4vLyBUcmFuc2Zvcm0gY29sb3IgY29tcG9uZW50cyBpbiAwLTEgcmFuZ2UgdG8gaHRtbCBSR0Igc3RyaW5nIGZvciBjYW52YXNcbkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5jb2xvclRvU3RyaW5nID0gZnVuY3Rpb24gKGNvbG9yKVxue1xuICAgIHJldHVybiAncmdiKCcgKyBjb2xvci5tYXAoZnVuY3Rpb24oYykgeyByZXR1cm4gfn4oYyAqIDI1Nik7IH0pLmpvaW4oJywnKSArICcpJztcbn07XG5cbi8vIEdlbmVyYXRlcyBhIHJhbmRvbSBjb2xvciBub3QgeWV0IHByZXNlbnQgaW4gdGhlIHByb3ZpZGVkIGhhc2ggb2YgY29sb3JzXG5DYW52YXNSZW5kZXJlci5wcm90b3R5cGUuZ2VuZXJhdGVDb2xvciA9IGZ1bmN0aW9uIGdlbmVyYXRlQ29sb3IgKGNvbG9yX21hcClcbntcbiAgICB2YXIgciwgZywgYiwgaXIsIGlnLCBpYiwga2V5O1xuICAgIGNvbG9yX21hcCA9IGNvbG9yX21hcCB8fCB7fTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICByID0gTWF0aC5yYW5kb20oKTtcbiAgICAgICAgZyA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgIGIgPSBNYXRoLnJhbmRvbSgpO1xuXG4gICAgICAgIGlyID0gfn4ociAqIDI1Nik7XG4gICAgICAgIGlnID0gfn4oZyAqIDI1Nik7XG4gICAgICAgIGliID0gfn4oYiAqIDI1Nik7XG4gICAgICAgIGtleSA9IChpciArIChpZyA8PCA4KSArIChpYiA8PCAxNikgKyAoMjU1IDw8IDI0KSkgPj4+IDA7IC8vIG5lZWQgdW5zaWduZWQgcmlnaHQgc2hpZnQgdG8gY29udmVydCB0byBwb3NpdGl2ZSAjXG5cbiAgICAgICAgaWYgKGNvbG9yX21hcFtrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbG9yX21hcFtrZXldID0geyBjb2xvcjogW3IsIGcsIGJdIH07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29sb3JfbWFwW2tleV07XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IENhbnZhc1JlbmRlcmVyO1xufVxuIiwiLy8gTWlzY2VsbGFuZW91cyBnZW8gZnVuY3Rpb25zXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL3BvaW50LmpzJyk7XG5cbnZhciBHZW8gPSB7fTtcblxuLy8gUHJvamVjdGlvbiBjb25zdGFudHNcbkdlby50aWxlX3NpemUgPSAyNTY7XG5HZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyA9IDIwMDM3NTA4LjM0Mjc4OTI0NDtcbkdlby5tYXBfb3JpZ2luX21ldGVycyA9IFBvaW50KC1HZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycywgR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMpO1xuR2VvLm1pbl96b29tX21ldGVyc19wZXJfcGl4ZWwgPSBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAqIDIgLyBHZW8udGlsZV9zaXplOyAvLyBtaW4gem9vbSBkcmF3cyB3b3JsZCBhcyAyIHRpbGVzIHdpZGVcbkdlby5tZXRlcnNfcGVyX3BpeGVsID0gW107XG5HZW8ubWF4X3pvb20gPSAyMDtcbmZvciAodmFyIHo9MDsgeiA8PSBHZW8ubWF4X3pvb207IHorKykge1xuICAgIEdlby5tZXRlcnNfcGVyX3BpeGVsW3pdID0gR2VvLm1pbl96b29tX21ldGVyc19wZXJfcGl4ZWwgLyBNYXRoLnBvdygyLCB6KTtcbn1cblxuLy8gQ29udmVyc2lvbiBmdW5jdGlvbnMgYmFzZWQgb24gYW4gZGVmaW5lZCB0aWxlIHNjYWxlXG5HZW8udW5pdHNfcGVyX21ldGVyID0gW107XG5HZW8uc2V0VGlsZVNjYWxlID0gZnVuY3Rpb24oc2NhbGUpXG57XG4gICAgR2VvLnRpbGVfc2NhbGUgPSBzY2FsZTtcbiAgICBHZW8udW5pdHNfcGVyX3BpeGVsID0gR2VvLnRpbGVfc2NhbGUgLyBHZW8udGlsZV9zaXplO1xuXG4gICAgZm9yICh2YXIgej0wOyB6IDw9IEdlby5tYXhfem9vbTsgeisrKSB7XG4gICAgICAgIEdlby51bml0c19wZXJfbWV0ZXJbel0gPSBHZW8udGlsZV9zY2FsZSAvIChHZW8udGlsZV9zaXplICogR2VvLm1ldGVyc19wZXJfcGl4ZWxbel0pO1xuICAgIH1cbn07XG5cbi8vIENvbnZlcnQgdGlsZSBsb2NhdGlvbiB0byBtZXJjYXRvciBtZXRlcnMgLSBtdWx0aXBseSBieSBwaXhlbHMgcGVyIHRpbGUsIHRoZW4gYnkgbWV0ZXJzIHBlciBwaXhlbCwgYWRqdXN0IGZvciBtYXAgb3JpZ2luXG5HZW8ubWV0ZXJzRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIHJldHVybiBQb2ludChcbiAgICAgICAgKHRpbGUueCAqIEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt0aWxlLnpdKSArIEdlby5tYXBfb3JpZ2luX21ldGVycy54LFxuICAgICAgICAoKHRpbGUueSAqIEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt0aWxlLnpdKSAqIC0xKSArIEdlby5tYXBfb3JpZ2luX21ldGVycy55XG4gICAgKTtcbn07XG5cbi8vIENvbnZlcnQgbWVyY2F0b3IgbWV0ZXJzIHRvIGxhdC1sbmdcbkdlby5tZXRlcnNUb0xhdExuZyA9IGZ1bmN0aW9uIChtZXRlcnMpXG57XG4gICAgdmFyIGMgPSBQb2ludC5jb3B5KG1ldGVycyk7XG5cbiAgICBjLnggLz0gR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnM7XG4gICAgYy55IC89IEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzO1xuXG4gICAgYy55ID0gKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoYy55ICogTWF0aC5QSSkpIC0gKE1hdGguUEkgLyAyKSkgLyBNYXRoLlBJO1xuXG4gICAgYy54ICo9IDE4MDtcbiAgICBjLnkgKj0gMTgwO1xuXG4gICAgcmV0dXJuIGM7XG59O1xuXG4vLyBDb252ZXJ0IGxhdC1sbmcgdG8gbWVyY2F0b3IgbWV0ZXJzXG5HZW8ubGF0TG5nVG9NZXRlcnMgPSBmdW5jdGlvbihsYXRsbmcpXG57XG4gICAgdmFyIGMgPSBQb2ludC5jb3B5KGxhdGxuZyk7XG5cbiAgICAvLyBMYXRpdHVkZVxuICAgIGMueSA9IE1hdGgubG9nKE1hdGgudGFuKChjLnkgKyA5MCkgKiBNYXRoLlBJIC8gMzYwKSkgLyAoTWF0aC5QSSAvIDE4MCk7XG4gICAgYy55ID0gYy55ICogR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMgLyAxODA7XG5cbiAgICAvLyBMb25naXR1ZGVcbiAgICBjLnggPSBjLnggKiBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAvIDE4MDtcblxuICAgIHJldHVybiBjO1xufTtcblxuLy8gUnVuIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIG9uIGVhY2ggY29vb3JkaW5hdGUgaW4gYSBHZW9KU09OIGdlb21ldHJ5XG5HZW8udHJhbnNmb3JtR2VvbWV0cnkgPSBmdW5jdGlvbiAoZ2VvbWV0cnksIHRyYW5zZm9ybSlcbntcbiAgICBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm0oZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xuICAgIH1cbiAgICBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyB8fCBnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvaW50Jykge1xuICAgICAgICByZXR1cm4gZ2VvbWV0cnkuY29vcmRpbmF0ZXMubWFwKHRyYW5zZm9ybSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nIHx8IGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpTGluZVN0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicpIHtcbiAgICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbiAocG9seWdvbikge1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlnb24ubWFwKGZ1bmN0aW9uIChjb29yZGluYXRlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gVE9ETzogc3VwcG9ydCBHZW9tZXRyeUNvbGxlY3Rpb25cbiAgICByZXR1cm4ge307XG59O1xuXG5HZW8uYm94SW50ZXJzZWN0ID0gZnVuY3Rpb24gKGIxLCBiMilcbntcbiAgICByZXR1cm4gIShcbiAgICAgICAgYjIuc3cueCA+IGIxLm5lLnggfHxcbiAgICAgICAgYjIubmUueCA8IGIxLnN3LnggfHxcbiAgICAgICAgYjIuc3cueSA+IGIxLm5lLnkgfHxcbiAgICAgICAgYjIubmUueSA8IGIxLnN3LnlcbiAgICApO1xufTtcblxuLy8gU3BsaXQgdGhlIGxpbmVzIG9mIGEgZmVhdHVyZSB3aGVyZXZlciB0d28gcG9pbnRzIGFyZSBmYXJ0aGVyIGFwYXJ0IHRoYW4gYSBnaXZlbiB0b2xlcmFuY2Vcbkdlby5zcGxpdEZlYXR1cmVMaW5lcyAgPSBmdW5jdGlvbiAoZmVhdHVyZSwgdG9sZXJhbmNlKSB7XG4gICAgdmFyIHRvbGVyYW5jZSA9IHRvbGVyYW5jZSB8fCAwLjAwMTtcbiAgICB2YXIgdG9sZXJhbmNlX3NxID0gdG9sZXJhbmNlICogdG9sZXJhbmNlO1xuICAgIHZhciBnZW9tID0gZmVhdHVyZS5nZW9tZXRyeTtcbiAgICB2YXIgbGluZXM7XG5cbiAgICBpZiAoZ2VvbS50eXBlID09ICdNdWx0aUxpbmVTdHJpbmcnKSB7XG4gICAgICAgIGxpbmVzID0gZ2VvbS5jb29yZGluYXRlcztcbiAgICB9XG4gICAgZWxzZSBpZiAoZ2VvbS50eXBlID09J0xpbmVTdHJpbmcnKSB7XG4gICAgICAgIGxpbmVzID0gW2dlb20uY29vcmRpbmF0ZXNdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZlYXR1cmU7XG4gICAgfVxuXG4gICAgdmFyIHNwbGl0X2xpbmVzID0gW107XG5cbiAgICBmb3IgKHZhciBzPTA7IHMgPCBsaW5lcy5sZW5ndGg7IHMrKykge1xuICAgICAgICB2YXIgc2VnID0gbGluZXNbc107XG4gICAgICAgIHZhciBzcGxpdF9zZWcgPSBbXTtcbiAgICAgICAgdmFyIGxhc3RfY29vcmQgPSBudWxsO1xuICAgICAgICB2YXIga2VlcDtcblxuICAgICAgICBmb3IgKHZhciBjPTA7IGMgPCBzZWcubGVuZ3RoOyBjKyspIHtcbiAgICAgICAgICAgIHZhciBjb29yZCA9IHNlZ1tjXTtcbiAgICAgICAgICAgIGtlZXAgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAobGFzdF9jb29yZCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpc3QgPSAoY29vcmRbMF0gLSBsYXN0X2Nvb3JkWzBdKSAqIChjb29yZFswXSAtIGxhc3RfY29vcmRbMF0pICsgKGNvb3JkWzFdIC0gbGFzdF9jb29yZFsxXSkgKiAoY29vcmRbMV0gLSBsYXN0X2Nvb3JkWzFdKTtcbiAgICAgICAgICAgICAgICBpZiAoZGlzdCA+IHRvbGVyYW5jZV9zcSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInNwbGl0IGxpbmVzIGF0IChcIiArIGNvb3JkWzBdICsgXCIsIFwiICsgY29vcmRbMV0gKyBcIiksIFwiICsgTWF0aC5zcXJ0KGRpc3QpICsgXCIgYXBhcnRcIik7XG4gICAgICAgICAgICAgICAgICAgIGtlZXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZWVwID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgc3BsaXRfbGluZXMucHVzaChzcGxpdF9zZWcpO1xuICAgICAgICAgICAgICAgIHNwbGl0X3NlZyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3BsaXRfc2VnLnB1c2goY29vcmQpO1xuXG4gICAgICAgICAgICBsYXN0X2Nvb3JkID0gY29vcmQ7XG4gICAgICAgIH1cblxuICAgICAgICBzcGxpdF9saW5lcy5wdXNoKHNwbGl0X3NlZyk7XG4gICAgICAgIHNwbGl0X3NlZyA9IFtdO1xuICAgIH1cblxuICAgIGlmIChzcGxpdF9saW5lcy5sZW5ndGggPT0gMSkge1xuICAgICAgICBnZW9tLnR5cGUgPSAnTGluZVN0cmluZyc7XG4gICAgICAgIGdlb20uY29vcmRpbmF0ZXMgPSBzcGxpdF9saW5lc1swXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGdlb20udHlwZSA9ICdNdWx0aUxpbmVTdHJpbmcnO1xuICAgICAgICBnZW9tLmNvb3JkaW5hdGVzID0gc3BsaXRfbGluZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdlbztcbn1cbiIsIi8vIFdlYkdMIG1hbmFnZW1lbnQgYW5kIHJlbmRlcmluZyBmdW5jdGlvbnNcbnZhciBHTCA9IHt9O1xuXG4vLyBTZXR1cCBhIFdlYkdMIGNvbnRleHRcbi8vIElmIG5vIGNhbnZhcyBlbGVtZW50IGlzIHByb3ZpZGVkLCBvbmUgaXMgY3JlYXRlZCBhbmQgYWRkZWQgdG8gdGhlIGRvY3VtZW50IGJvZHlcbkdMLmdldENvbnRleHQgPSBmdW5jdGlvbiBnZXRDb250ZXh0IChjYW52YXMpXG57XG4gICAgdmFyIGNhbnZhcyA9IGNhbnZhcztcbiAgICB2YXIgZnVsbHNjcmVlbiA9IGZhbHNlO1xuICAgIGlmIChjYW52YXMgPT0gbnVsbCkge1xuICAgICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgY2FudmFzLnN0eWxlLnRvcCA9IDA7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5sZWZ0ID0gMDtcbiAgICAgICAgY2FudmFzLnN0eWxlLnpJbmRleCA9IC0xO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgICAgIGZ1bGxzY3JlZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIGdsID0gY2FudmFzLmdldENvbnRleHQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcsIHsgLypwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRydWUqLyB9KTsgLy8gcHJlc2VydmVEcmF3aW5nQnVmZmVyIG5lZWRlZCBmb3IgZ2wucmVhZFBpeGVscyAoY291bGQgYmUgdXNlZCBmb3IgZmVhdHVyZSBzZWxlY3Rpb24pXG4gICAgaWYgKCFnbCkge1xuICAgICAgICBhbGVydChcIkNvdWxkbid0IGNyZWF0ZSBXZWJHTCBjb250ZXh0LiBZb3VyIGJyb3dzZXIgcHJvYmFibHkgZG9lc24ndCBzdXBwb3J0IFdlYkdMIG9yIGl0J3MgdHVybmVkIG9mZj9cIik7XG4gICAgICAgIHRocm93IFwiQ291bGRuJ3QgY3JlYXRlIFdlYkdMIGNvbnRleHRcIjtcbiAgICB9XG5cbiAgICBHTC5yZXNpemVDYW52YXMoZ2wsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIGlmIChmdWxsc2NyZWVuID09IHRydWUpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIEdMLnJlc2l6ZUNhbnZhcyhnbCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIEdMLlZlcnRleEFycmF5T2JqZWN0LmluaXQoZ2wpOyAvLyBUT0RPOiB0aGlzIHBhdHRlcm4gZG9lc24ndCBzdXBwb3J0IG11bHRpcGxlIGFjdGl2ZSBHTCBjb250ZXh0cywgc2hvdWxkIHRoYXQgZXZlbiBiZSBzdXBwb3J0ZWQ/XG5cbiAgICByZXR1cm4gZ2w7XG59O1xuXG5HTC5yZXNpemVDYW52YXMgPSBmdW5jdGlvbiAoZ2wsIHdpZHRoLCBoZWlnaHQpXG57XG4gICAgdmFyIGRldmljZV9waXhlbF9yYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgZ2wuY2FudmFzLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuICAgIGdsLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgIGdsLmNhbnZhcy53aWR0aCA9IE1hdGgucm91bmQoZ2wuY2FudmFzLnN0eWxlLndpZHRoICogZGV2aWNlX3BpeGVsX3JhdGlvKTtcbiAgICBnbC5jYW52YXMuaGVpZ2h0ID0gTWF0aC5yb3VuZChnbC5jYW52YXMuc3R5bGUud2lkdGggKiBkZXZpY2VfcGl4ZWxfcmF0aW8pO1xuICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdsLmNhbnZhcy53aWR0aCwgZ2wuY2FudmFzLmhlaWdodCk7XG59O1xuXG4vLyBDb21waWxlICYgbGluayBhIFdlYkdMIHByb2dyYW0gZnJvbSBwcm92aWRlZCB2ZXJ0ZXggYW5kIHNoYWRlciBzb3VyY2UgZWxlbWVudHNcbkdMLmNyZWF0ZVByb2dyYW1Gcm9tRWxlbWVudHMgPSBmdW5jdGlvbiBHTGNyZWF0ZVByb2dyYW1Gcm9tRWxlbWVudHMgKGdsLCB2ZXJ0ZXhfc2hhZGVyX2lkLCBmcmFnbWVudF9zaGFkZXJfaWQpXG57XG4gICAgdmFyIHZlcnRleF9zaGFkZXJfc291cmNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodmVydGV4X3NoYWRlcl9pZCkudGV4dENvbnRlbnQ7XG4gICAgdmFyIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChmcmFnbWVudF9zaGFkZXJfaWQpLnRleHRDb250ZW50O1xuICAgIHZhciBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgIHJldHVybiBHTC51cGRhdGVQcm9ncmFtKGdsLCBwcm9ncmFtLCB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSk7XG59O1xuXG4vLyBDb21waWxlICYgbGluayBhIFdlYkdMIHByb2dyYW0gZnJvbSBwcm92aWRlZCB2ZXJ0ZXggYW5kIHNoYWRlciBzb3VyY2UgVVJMc1xuLy8gTk9URTogbG9hZHMgdmlhIHN5bmNocm9ub3VzIFhIUiBmb3Igc2ltcGxpY2l0eSwgY291bGQgYmUgbWFkZSBhc3luY1xuR0wuY3JlYXRlUHJvZ3JhbUZyb21VUkxzID0gZnVuY3Rpb24gR0xjcmVhdGVQcm9ncmFtRnJvbVVSTHMgKGdsLCB2ZXJ0ZXhfc2hhZGVyX3VybCwgZnJhZ21lbnRfc2hhZGVyX3VybClcbntcbiAgICB2YXIgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICByZXR1cm4gR0wudXBkYXRlUHJvZ3JhbUZyb21VUkxzKGdsLCBwcm9ncmFtLCB2ZXJ0ZXhfc2hhZGVyX3VybCwgZnJhZ21lbnRfc2hhZGVyX3VybCk7XG59O1xuXG5HTC51cGRhdGVQcm9ncmFtRnJvbVVSTHMgPSBmdW5jdGlvbiBHTFVwZGF0ZVByb2dyYW1Gcm9tVVJMcyAoZ2wsIHByb2dyYW0sIHZlcnRleF9zaGFkZXJfdXJsLCBmcmFnbWVudF9zaGFkZXJfdXJsKVxue1xuICAgIHZhciB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZTtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkgeyB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSA9IHJlcS5yZXNwb25zZTsgfTtcbiAgICByZXEub3BlbignR0VUJywgdmVydGV4X3NoYWRlcl91cmwgKyAnPycgKyAoK25ldyBEYXRlKCkpLCBmYWxzZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICByZXEuc2VuZCgpO1xuXG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHsgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSA9IHJlcS5yZXNwb25zZTsgfTtcbiAgICByZXEub3BlbignR0VUJywgZnJhZ21lbnRfc2hhZGVyX3VybCArICc/JyArICgrbmV3IERhdGUoKSksIGZhbHNlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgIHJlcS5zZW5kKCk7XG5cbiAgICByZXR1cm4gR0wudXBkYXRlUHJvZ3JhbShnbCwgcHJvZ3JhbSwgdmVydGV4X3NoYWRlcl9zb3VyY2UsIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UpO1xufTtcblxuLy8gQ29tcGlsZSAmIGxpbmsgYSBXZWJHTCBwcm9ncmFtIGZyb20gcHJvdmlkZWQgdmVydGV4IGFuZCBmcmFnbWVudCBzaGFkZXIgc291cmNlc1xuLy8gdXBkYXRlIGEgcHJvZ3JhbSBpZiBvbmUgaXMgcGFzc2VkIGluLiBDcmVhdGUgb25lIGlmIG5vdC4gQWxlcnQgYW5kIGRvbid0IHVwZGF0ZSBhbnl0aGluZyBpZiB0aGUgc2hhZGVycyBkb24ndCBjb21waWxlLlxuR0wudXBkYXRlUHJvZ3JhbSA9IGZ1bmN0aW9uIEdMdXBkYXRlUHJvZ3JhbSAoZ2wsIHByb2dyYW0sIHZlcnRleF9zaGFkZXJfc291cmNlLCBmcmFnbWVudF9zaGFkZXJfc291cmNlKVxue1xuICAgIHRyeSB7XG4gICAgICAgIHZhciB2ZXJ0ZXhfc2hhZGVyID0gR0wuY3JlYXRlU2hhZGVyKGdsLCB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgZ2wuVkVSVEVYX1NIQURFUik7XG4gICAgICAgIHZhciBmcmFnbWVudF9zaGFkZXIgPSBHTC5jcmVhdGVTaGFkZXIoZ2wsICcjaWZkZWYgR0xfRVNcXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XFxuI2VuZGlmXFxuXFxuJyArIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UsIGdsLkZSQUdNRU5UX1NIQURFUik7XG4gICAgfVxuICAgIGNhdGNoKGVycilcbiAgICB7XG4gICAgICAgIGFsZXJ0KGVycik7XG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cblxuICAgIGdsLnVzZVByb2dyYW0obnVsbCk7XG4gICAgaWYgKHByb2dyYW0gIT0gbnVsbCkge1xuICAgICAgICB2YXIgb2xkX3NoYWRlcnMgPSBnbC5nZXRBdHRhY2hlZFNoYWRlcnMocHJvZ3JhbSk7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBvbGRfc2hhZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZ2wuZGV0YWNoU2hhZGVyKHByb2dyYW0sIG9sZF9zaGFkZXJzW2ldKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG4gICAgfVxuXG4gICAgaWYgKHZlcnRleF9zaGFkZXIgPT0gbnVsbCB8fCBmcmFnbWVudF9zaGFkZXIgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG5cbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydGV4X3NoYWRlcik7XG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50X3NoYWRlcik7XG5cbiAgICBnbC5kZWxldGVTaGFkZXIodmVydGV4X3NoYWRlcik7XG4gICAgZ2wuZGVsZXRlU2hhZGVyKGZyYWdtZW50X3NoYWRlcik7XG5cbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcbiAgICAgICAgdmFyIHByb2dyYW1fZXJyb3IgPVxuICAgICAgICAgICAgXCJXZWJHTCBwcm9ncmFtIGVycm9yOlxcblwiICtcbiAgICAgICAgICAgIFwiVkFMSURBVEVfU1RBVFVTOiBcIiArIGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuVkFMSURBVEVfU1RBVFVTKSArIFwiXFxuXCIgK1xuICAgICAgICAgICAgXCJFUlJPUjogXCIgKyBnbC5nZXRFcnJvcigpICsgXCJcXG5cXG5cIiArXG4gICAgICAgICAgICBcIi0tLSBWZXJ0ZXggU2hhZGVyIC0tLVxcblwiICsgdmVydGV4X3NoYWRlcl9zb3VyY2UgKyBcIlxcblxcblwiICtcbiAgICAgICAgICAgIFwiLS0tIEZyYWdtZW50IFNoYWRlciAtLS1cXG5cIiArIGZyYWdtZW50X3NoYWRlcl9zb3VyY2U7XG4gICAgICAgIHRocm93IHByb2dyYW1fZXJyb3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2dyYW07XG59O1xuXG4vLyBDb21waWxlIGEgdmVydGV4IG9yIGZyYWdtZW50IHNoYWRlciBmcm9tIHByb3ZpZGVkIHNvdXJjZVxuR0wuY3JlYXRlU2hhZGVyID0gZnVuY3Rpb24gR0xjcmVhdGVTaGFkZXIgKGdsLCBzb3VyY2UsIHR5cGUpXG57XG4gICAgdmFyIHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcblxuICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNvdXJjZSk7XG4gICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuXG4gICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcbiAgICAgICAgdmFyIHNoYWRlcl9lcnJvciA9XG4gICAgICAgICAgICBcIldlYkdMIHNoYWRlciBlcnJvcjpcXG5cIiArXG4gICAgICAgICAgICAodHlwZSA9PSBnbC5WRVJURVhfU0hBREVSID8gXCJWRVJURVhcIiA6IFwiRlJBR01FTlRcIikgKyBcIiBTSEFERVI6XFxuXCIgK1xuICAgICAgICAgICAgZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpO1xuICAgICAgICB0aHJvdyBzaGFkZXJfZXJyb3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNoYWRlcjtcbn07XG5cbi8vIFRoaW4gR0wgcHJvZ3JhbSBsYXllciB0byBjYWNoZSB1bmlmb3JtIGxvY2F0aW9ucy92YWx1ZXMsIGRvIGNvbXBpbGUtdGltZSBwcmUtcHJvY2Vzc2luZyAoaW5qZWN0aW5nICNkZWZpbmVzIGludG8gc2hhZGVycyksIGV0Yy5cbkdMLlByb2dyYW0gPSBmdW5jdGlvbiAoZ2wsIHZlcnRleF9zaGFkZXJfc291cmNlLCBmcmFnbWVudF9zaGFkZXJfc291cmNlLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5nbCA9IGdsO1xuICAgIHRoaXMucHJvZ3JhbSA9IG51bGw7XG4gICAgdGhpcy5kZWZpbmVzID0gb3B0aW9ucy5kZWZpbmVzIHx8IHt9OyAvLyBrZXkvdmFsdWVzIGluc2VydGVkIGludG8gc2hhZGVycyBhdCBjb21waWxlLXRpbWVcbiAgICB0aGlzLnVuaWZvcm1zID0ge307IC8vIHByb2dyYW0gbG9jYXRpb25zIG9mIHVuaWZvcm1zLCBzZXQvdXBkYXRlZCBhdCBjb21waWxlLXRpbWVcbiAgICB0aGlzLmF0dHJpYnMgPSB7fTsgLy8gcHJvZ3JhbSBsb2NhdGlvbnMgb2YgdmVydGV4IGF0dHJpYnV0ZXNcbiAgICB0aGlzLnZlcnRleF9zaGFkZXJfc291cmNlID0gdmVydGV4X3NoYWRlcl9zb3VyY2U7XG4gICAgdGhpcy5mcmFnbWVudF9zaGFkZXJfc291cmNlID0gZnJhZ21lbnRfc2hhZGVyX3NvdXJjZTtcbiAgICB0aGlzLmNvbXBpbGUoKTtcbn07XG5cbi8vIENyZWF0ZXMgYSBwcm9ncmFtIHRoYXQgd2lsbCByZWZyZXNoIGZyb20gc291cmNlIFVSTHMgZWFjaCB0aW1lIGl0IGlzIGNvbXBpbGVkXG5HTC5Qcm9ncmFtLmNyZWF0ZVByb2dyYW1Gcm9tVVJMcyA9IGZ1bmN0aW9uIChnbCwgdmVydGV4X3NoYWRlcl91cmwsIGZyYWdtZW50X3NoYWRlcl91cmwsIG9wdGlvbnMpXG57XG4gICAgdmFyIHByb2dyYW0gPSBPYmplY3QuY3JlYXRlKEdMLlByb2dyYW0ucHJvdG90eXBlKTtcblxuICAgIHByb2dyYW0udmVydGV4X3NoYWRlcl91cmwgPSB2ZXJ0ZXhfc2hhZGVyX3VybDtcbiAgICBwcm9ncmFtLmZyYWdtZW50X3NoYWRlcl91cmwgPSBmcmFnbWVudF9zaGFkZXJfdXJsO1xuXG4gICAgcHJvZ3JhbS51cGRhdGVWZXJ0ZXhTaGFkZXJTb3VyY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzb3VyY2U7XG4gICAgICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHsgc291cmNlID0gcmVxLnJlc3BvbnNlOyB9O1xuICAgICAgICByZXEub3BlbignR0VUJywgdGhpcy52ZXJ0ZXhfc2hhZGVyX3VybCArICc/JyArICgrbmV3IERhdGUoKSksIGZhbHNlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgICAgICByZXEuc2VuZCgpO1xuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG5cbiAgICBwcm9ncmFtLnVwZGF0ZUZyYWdtZW50U2hhZGVyU291cmNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc291cmNlO1xuICAgICAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7IHNvdXJjZSA9IHJlcS5yZXNwb25zZTsgfTtcbiAgICAgICAgcmVxLm9wZW4oJ0dFVCcsIHRoaXMuZnJhZ21lbnRfc2hhZGVyX3VybCArICc/JyArICgrbmV3IERhdGUoKSksIGZhbHNlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgICAgICByZXEuc2VuZCgpO1xuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG5cbiAgICBHTC5Qcm9ncmFtLmNhbGwocHJvZ3JhbSwgZ2wsIG51bGwsIG51bGwsIG9wdGlvbnMpO1xuICAgIHJldHVybiBwcm9ncmFtO1xufTtcblxuLy8gR2xvYmFsIGRlZmluZXMgYXBwbGllZCB0byBhbGwgcHJvZ3JhbXMgKGR1cGxpY2F0ZSBwcm9wZXJ0aWVzIGZvciBhIHNwZWNpZmljIHByb2dyYW0gd2lsbCB0YWtlIHByZWNlZGVuY2UpXG5HTC5Qcm9ncmFtLmRlZmluZXMgPSB7fTtcblxuR0wuUHJvZ3JhbS5wcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gT3B0aW9uYWxseSB1cGRhdGUgc291cmNlc1xuICAgIGlmICh0eXBlb2YgdGhpcy51cGRhdGVWZXJ0ZXhTaGFkZXJTb3VyY2UgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnZlcnRleF9zaGFkZXJfc291cmNlID0gdGhpcy51cGRhdGVWZXJ0ZXhTaGFkZXJTb3VyY2UoKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLnVwZGF0ZUZyYWdtZW50U2hhZGVyU291cmNlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5mcmFnbWVudF9zaGFkZXJfc291cmNlID0gdGhpcy51cGRhdGVGcmFnbWVudFNoYWRlclNvdXJjZSgpO1xuICAgIH1cblxuICAgIC8vIEluamVjdCBkZWZpbmVzIChnbG9iYWwsIHRoZW4gcHJvZ3JhbS1zcGVjaWZpYylcbiAgICB2YXIgZGVmaW5lcyA9IHt9O1xuICAgIGZvciAodmFyIGQgaW4gR0wuUHJvZ3JhbS5kZWZpbmVzKSB7XG4gICAgICAgIGRlZmluZXNbZF0gPSBHTC5Qcm9ncmFtLmRlZmluZXNbZF07XG4gICAgfVxuICAgIGZvciAodmFyIGQgaW4gdGhpcy5kZWZpbmVzKSB7XG4gICAgICAgIGRlZmluZXNbZF0gPSB0aGlzLmRlZmluZXNbZF07XG4gICAgfVxuXG4gICAgdmFyIGRlZmluZV9zdHIgPSBcIlwiO1xuICAgIGZvciAodmFyIGQgaW4gZGVmaW5lcykge1xuICAgICAgICBpZiAoZGVmaW5lc1tkXSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZXNbZF0gPT0gJ2Jvb2xlYW4nICYmIGRlZmluZXNbZF0gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgZGVmaW5lX3N0ciArPSBcIiNkZWZpbmUgXCIgKyBkICsgXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlZmluZV9zdHIgKz0gXCIjZGVmaW5lIFwiICsgZCArIFwiIFwiICsgZGVmaW5lc1tkXSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5wcm9jZXNzZWRfdmVydGV4X3NoYWRlcl9zb3VyY2UgPSBkZWZpbmVfc3RyICsgdGhpcy52ZXJ0ZXhfc2hhZGVyX3NvdXJjZTtcbiAgICB0aGlzLnByb2Nlc3NlZF9mcmFnbWVudF9zaGFkZXJfc291cmNlID0gZGVmaW5lX3N0ciArIHRoaXMuZnJhZ21lbnRfc2hhZGVyX3NvdXJjZTtcblxuICAgIC8vIENvbXBpbGUgJiBzZXQgdW5pZm9ybXMgdG8gY2FjaGVkIHZhbHVlc1xuICAgIHRoaXMucHJvZ3JhbSA9IEdMLnVwZGF0ZVByb2dyYW0odGhpcy5nbCwgdGhpcy5wcm9ncmFtLCB0aGlzLnByb2Nlc3NlZF92ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgdGhpcy5wcm9jZXNzZWRfZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSk7XG4gICAgdGhpcy5nbC51c2VQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG4gICAgdGhpcy5yZWZyZXNoVW5pZm9ybXMoKTtcbiAgICB0aGlzLnJlZnJlc2hBdHRyaWJ1dGVzKCk7XG59O1xuXG4vLyBleDogcHJvZ3JhbS51bmlmb3JtKCczZicsICdwb3NpdGlvbicsIHgsIHksIHopO1xuR0wuUHJvZ3JhbS5wcm90b3R5cGUudW5pZm9ybSA9IGZ1bmN0aW9uIChtZXRob2QsIG5hbWUpIC8vIG1ldGhvZC1hcHByb3ByaWF0ZSBhcmd1bWVudHMgZm9sbG93XG57XG4gICAgdmFyIHVuaWZvcm0gPSAodGhpcy51bmlmb3Jtc1tuYW1lXSA9IHRoaXMudW5pZm9ybXNbbmFtZV0gfHwge30pO1xuICAgIHVuaWZvcm0ubmFtZSA9IG5hbWU7XG4gICAgdW5pZm9ybS5sb2NhdGlvbiA9IHVuaWZvcm0ubG9jYXRpb24gfHwgdGhpcy5nbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5wcm9ncmFtLCBuYW1lKTtcbiAgICB1bmlmb3JtLm1ldGhvZCA9ICd1bmlmb3JtJyArIG1ldGhvZDtcbiAgICB1bmlmb3JtLnZhbHVlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdGhpcy51cGRhdGVVbmlmb3JtKG5hbWUpO1xufTtcblxuLy8gU2V0IGEgc2luZ2xlIHVuaWZvcm1cbkdMLlByb2dyYW0ucHJvdG90eXBlLnVwZGF0ZVVuaWZvcm0gPSBmdW5jdGlvbiAobmFtZSlcbntcbiAgICB2YXIgdW5pZm9ybSA9IHRoaXMudW5pZm9ybXNbbmFtZV07XG4gICAgaWYgKHVuaWZvcm0gPT0gbnVsbCB8fCB1bmlmb3JtLmxvY2F0aW9uID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmdsW3VuaWZvcm0ubWV0aG9kXS5hcHBseSh0aGlzLmdsLCBbdW5pZm9ybS5sb2NhdGlvbl0uY29uY2F0KHVuaWZvcm0udmFsdWVzKSk7IC8vIGNhbGwgYXBwcm9wcmlhdGUgR0wgdW5pZm9ybSBtZXRob2QgYW5kIHBhc3MgdGhyb3VnaCBhcmd1bWVudHNcbn07XG5cbi8vIFJlZnJlc2ggdW5pZm9ybSBsb2NhdGlvbnMgYW5kIHNldCB0byBsYXN0IGNhY2hlZCB2YWx1ZXNcbkdMLlByb2dyYW0ucHJvdG90eXBlLnJlZnJlc2hVbmlmb3JtcyA9IGZ1bmN0aW9uICgpXG57XG4gICAgZm9yICh2YXIgdSBpbiB0aGlzLnVuaWZvcm1zKSB7XG4gICAgICAgIHRoaXMudW5pZm9ybXNbdV0ubG9jYXRpb24gPSB0aGlzLmdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnByb2dyYW0sIHUpO1xuICAgICAgICB0aGlzLnVwZGF0ZVVuaWZvcm0odSk7XG4gICAgfVxufTtcblxuR0wuUHJvZ3JhbS5wcm90b3R5cGUucmVmcmVzaEF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIHZhciBsZW4gPSB0aGlzLmdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5wcm9ncmFtLCB0aGlzLmdsLkFDVElWRV9BVFRSSUJVVEVTKTtcbiAgICAvLyBmb3IgKHZhciBpPTA7IGkgPCBsZW47IGkrKykge1xuICAgIC8vICAgICB2YXIgYSA9IHRoaXMuZ2wuZ2V0QWN0aXZlQXR0cmliKHRoaXMucHJvZ3JhbSwgaSk7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKGEpO1xuICAgIC8vIH1cbiAgICB0aGlzLmF0dHJpYnMgPSB7fTtcbn07XG5cbi8vIEdldCB0aGUgbG9jYXRpb24gb2YgYSB2ZXJ0ZXggYXR0cmlidXRlXG5HTC5Qcm9ncmFtLnByb3RvdHlwZS5hdHRyaWJ1dGUgPSBmdW5jdGlvbiAobmFtZSlcbntcbiAgICB2YXIgYXR0cmliID0gKHRoaXMuYXR0cmlic1tuYW1lXSA9IHRoaXMuYXR0cmlic1tuYW1lXSB8fCB7fSk7XG4gICAgaWYgKGF0dHJpYi5sb2NhdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhdHRyaWI7XG4gICAgfVxuXG4gICAgYXR0cmliLm5hbWUgPSBuYW1lO1xuICAgIGF0dHJpYi5sb2NhdGlvbiA9IHRoaXMuZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5wcm9ncmFtLCBuYW1lKTtcblxuICAgIC8vIHZhciBpbmZvID0gdGhpcy5nbC5nZXRBY3RpdmVBdHRyaWIodGhpcy5wcm9ncmFtLCBhdHRyaWIubG9jYXRpb24pO1xuICAgIC8vIGF0dHJpYi50eXBlID0gaW5mby50eXBlO1xuICAgIC8vIGF0dHJpYi5zaXplID0gaW5mby5zaXplO1xuXG4gICAgcmV0dXJuIGF0dHJpYjtcbn07XG5cbi8vIFRyaWFuZ3VsYXRpb24gdXNpbmcgbGlidGVzcy5qcyBwb3J0IG9mIGdsdVRlc3NlbGF0b3Jcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9icmVuZGFua2VubnkvbGlidGVzcy5qc1xudHJ5IHtcbiAgICBHTC50ZXNzZWxhdG9yID0gKGZ1bmN0aW9uIGluaXRUZXNzZWxhdG9yKCkge1xuICAgICAgICAvLyBDYWxsZWQgZm9yIGVhY2ggdmVydGV4IG9mIHRlc3NlbGF0b3Igb3V0cHV0XG4gICAgICAgIGZ1bmN0aW9uIHZlcnRleENhbGxiYWNrKGRhdGEsIHBvbHlWZXJ0QXJyYXkpIHtcbiAgICAgICAgICAgIHBvbHlWZXJ0QXJyYXkucHVzaChbZGF0YVswXSwgZGF0YVsxXV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsbGVkIHdoZW4gc2VnbWVudHMgaW50ZXJzZWN0IGFuZCBtdXN0IGJlIHNwbGl0XG4gICAgICAgIGZ1bmN0aW9uIGNvbWJpbmVDYWxsYmFjayhjb29yZHMsIGRhdGEsIHdlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvb3JkcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbGxlZCB3aGVuIGEgdmVydGV4IHN0YXJ0cyBvciBzdG9wcyBhIGJvdW5kYXJ5IGVkZ2Ugb2YgYSBwb2x5Z29uXG4gICAgICAgIGZ1bmN0aW9uIGVkZ2VDYWxsYmFjayhmbGFnKSB7XG4gICAgICAgICAgICAvLyBOby1vcCBjYWxsYmFjayB0byBmb3JjZSBzaW1wbGUgdHJpYW5nbGUgcHJpbWl0aXZlcyAobm8gdHJpYW5nbGUgc3RyaXBzIG9yIGZhbnMpLlxuICAgICAgICAgICAgLy8gU2VlOiBodHRwOi8vd3d3LmdscHJvZ3JhbW1pbmcuY29tL3JlZC9jaGFwdGVyMTEuaHRtbFxuICAgICAgICAgICAgLy8gXCJTaW5jZSBlZGdlIGZsYWdzIG1ha2Ugbm8gc2Vuc2UgaW4gYSB0cmlhbmdsZSBmYW4gb3IgdHJpYW5nbGUgc3RyaXAsIGlmIHRoZXJlIGlzIGEgY2FsbGJhY2tcbiAgICAgICAgICAgIC8vIGFzc29jaWF0ZWQgd2l0aCBHTFVfVEVTU19FREdFX0ZMQUcgdGhhdCBlbmFibGVzIGVkZ2UgZmxhZ3MsIHRoZSBHTFVfVEVTU19CRUdJTiBjYWxsYmFjayBpc1xuICAgICAgICAgICAgLy8gY2FsbGVkIG9ubHkgd2l0aCBHTF9UUklBTkdMRVMuXCJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdHTC50ZXNzZWxhdG9yOiBlZGdlIGZsYWc6ICcgKyBmbGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZXNzZWxhdG9yID0gbmV3IGxpYnRlc3MuR2x1VGVzc2VsYXRvcigpO1xuICAgICAgICB0ZXNzZWxhdG9yLmdsdVRlc3NDYWxsYmFjayhsaWJ0ZXNzLmdsdUVudW0uR0xVX1RFU1NfVkVSVEVYX0RBVEEsIHZlcnRleENhbGxiYWNrKTtcbiAgICAgICAgdGVzc2VsYXRvci5nbHVUZXNzQ2FsbGJhY2sobGlidGVzcy5nbHVFbnVtLkdMVV9URVNTX0NPTUJJTkUsIGNvbWJpbmVDYWxsYmFjayk7XG4gICAgICAgIHRlc3NlbGF0b3IuZ2x1VGVzc0NhbGxiYWNrKGxpYnRlc3MuZ2x1RW51bS5HTFVfVEVTU19FREdFX0ZMQUcsIGVkZ2VDYWxsYmFjayk7XG5cbiAgICAgICAgLy8gQnJlbmRhbiBLZW5ueTpcbiAgICAgICAgLy8gbGlidGVzcyB3aWxsIHRha2UgM2QgdmVydHMgYW5kIGZsYXR0ZW4gdG8gYSBwbGFuZSBmb3IgdGVzc2VsYXRpb25cbiAgICAgICAgLy8gc2luY2Ugb25seSBkb2luZyAyZCB0ZXNzZWxhdGlvbiBoZXJlLCBwcm92aWRlIHo9MSBub3JtYWwgdG8gc2tpcFxuICAgICAgICAvLyBpdGVyYXRpbmcgb3ZlciB2ZXJ0cyBvbmx5IHRvIGdldCB0aGUgc2FtZSBhbnN3ZXIuXG4gICAgICAgIC8vIGNvbW1lbnQgb3V0IHRvIHRlc3Qgbm9ybWFsLWdlbmVyYXRpb24gY29kZVxuICAgICAgICB0ZXNzZWxhdG9yLmdsdVRlc3NOb3JtYWwoMCwgMCwgMSk7XG5cbiAgICAgICAgcmV0dXJuIHRlc3NlbGF0b3I7XG4gICAgfSkoKTtcblxuICAgIEdMLnRyaWFuZ3VsYXRlUG9seWdvbiA9IGZ1bmN0aW9uIEdMVHJpYW5ndWxhdGUgKGNvbnRvdXJzKVxuICAgIHtcbiAgICAgICAgdmFyIHRyaWFuZ2xlVmVydHMgPSBbXTtcbiAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzQmVnaW5Qb2x5Z29uKHRyaWFuZ2xlVmVydHMpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29udG91cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc0JlZ2luQ29udG91cigpO1xuICAgICAgICAgICAgdmFyIGNvbnRvdXIgPSBjb250b3Vyc1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29udG91ci5sZW5ndGg7IGogKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY29vcmRzID0gW2NvbnRvdXJbal1bMF0sIGNvbnRvdXJbal1bMV0sIDBdO1xuICAgICAgICAgICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc1ZlcnRleChjb29yZHMsIGNvb3Jkcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NFbmRDb250b3VyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NFbmRQb2x5Z29uKCk7XG4gICAgICAgIHJldHVybiB0cmlhbmdsZVZlcnRzO1xuICAgIH07XG59XG5jYXRjaCAoZSkge1xuICAgIC8vIGNvbnNvbGUubG9nKFwibGlidGVzcyBub3QgZGVmaW5lZCFcIik7XG4gICAgLy8gc2tpcCBpZiBsaWJ0ZXNzIG5vdCBkZWZpbmVkXG59XG5cbi8vIEFkZCBvbmUgb3IgbW9yZSB2ZXJ0aWNlcyB0byBhbiBhcnJheSAoZGVzdGluZWQgdG8gYmUgdXNlZCBhcyBhIEdMIGJ1ZmZlciksICdzdHJpcGluZycgZWFjaCB2ZXJ0ZXggd2l0aCBjb25zdGFudCBkYXRhXG4vLyBVc2VkIGZvciBhZGRpbmcgdmFsdWVzIHRoYXQgYXJlIG9mdGVuIGNvbnN0YW50IHBlciBnZW9tZXRyeSBvciBwb2x5Z29uLCBsaWtlIGNvbG9ycywgbm9ybWFscyAoZm9yIHBvbHlzIHNpdHRpbmcgZmxhdCBvbiBtYXApLCBsYXllciBhbmQgbWF0ZXJpYWwgaW5mbywgZXRjLlxuR0wuYWRkVmVydGljZXMgPSBmdW5jdGlvbiAodmVydGljZXMsIHZlcnRleF9kYXRhLCB2ZXJ0ZXhfY29uc3RhbnRzKVxue1xuICAgIGlmICh2ZXJ0aWNlcyAhPSBudWxsICYmIHZlcnRpY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gQXJyYXkgb2YgdmVydGljZXNcbiAgICAgICAgaWYgKHR5cGVvZiB2ZXJ0aWNlc1swXSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgZm9yICh2YXIgdj0wOyB2IDwgdmVydGljZXMubGVuZ3RoOyB2KyspIHtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCB2ZXJ0aWNlc1t2XSk7XG4gICAgICAgICAgICAgICAgaWYgKHZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgdmVydGV4X2NvbnN0YW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFNpbmdsZSB2ZXJ0ZXhcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCB2ZXJ0aWNlcyk7XG4gICAgICAgICAgICBpZiAodmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICAgICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIHZlcnRleF9jb25zdGFudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIENyZWF0ZXMgYSBWZXJ0ZXggQXJyYXkgT2JqZWN0IGlmIHRoZSBleHRlbnNpb24gaXMgYXZhaWxhYmxlLCBvciBmYWxscyBiYWNrIG9uIHN0YW5kYXJkIGF0dHJpYnV0ZSBjYWxsc1xuR0wuVmVydGV4QXJyYXlPYmplY3QgPSB7fTtcbkdMLlZlcnRleEFycmF5T2JqZWN0LmRpc2FibGVkID0gZmFsc2U7IC8vIHNldCB0byB0cnVlIHRvIGRpc2FibGUgVkFPcyBldmVuIGlmIGV4dGVuc2lvbiBpcyBhdmFpbGFibGVcbkdMLlZlcnRleEFycmF5T2JqZWN0LmJvdW5kX3ZhbyA9IG51bGw7IC8vIGN1cnJlbnRseSBib3VuZCBWQU9cblxuR0wuVmVydGV4QXJyYXlPYmplY3QuaW5pdCA9IGZ1bmN0aW9uIChnbClcbntcbiAgICBpZiAoR0wuVmVydGV4QXJyYXlPYmplY3QuZXh0ID09IG51bGwpIHtcbiAgICAgICAgaWYgKEdMLlZlcnRleEFycmF5T2JqZWN0LmRpc2FibGVkICE9IHRydWUpIHtcbiAgICAgICAgICAgIEdMLlZlcnRleEFycmF5T2JqZWN0LmV4dCA9IGdsLmdldEV4dGVuc2lvbihcIk9FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEdMLlZlcnRleEFycmF5T2JqZWN0LmV4dCAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlZlcnRleCBBcnJheSBPYmplY3QgZXh0ZW5zaW9uIGF2YWlsYWJsZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChHTC5WZXJ0ZXhBcnJheU9iamVjdC5kaXNhYmxlZCAhPSB0cnVlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlZlcnRleCBBcnJheSBPYmplY3QgZXh0ZW5zaW9uIE5PVCBhdmFpbGFibGVcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlZlcnRleCBBcnJheSBPYmplY3QgZXh0ZW5zaW9uIGZvcmNlIGRpc2FibGVkXCIpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuR0wuVmVydGV4QXJyYXlPYmplY3QuY3JlYXRlID0gZnVuY3Rpb24gKHNldHVwLCB0ZWFyZG93bilcbntcbiAgICB2YXIgdmFvID0ge307XG4gICAgdmFvLnNldHVwID0gc2V0dXA7XG4gICAgdmFvLnRlYXJkb3duID0gdGVhcmRvd247XG5cbiAgICB2YXIgZXh0ID0gR0wuVmVydGV4QXJyYXlPYmplY3QuZXh0O1xuICAgIGlmIChleHQgIT0gbnVsbCkge1xuICAgICAgICB2YW8uX3ZhbyA9IGV4dC5jcmVhdGVWZXJ0ZXhBcnJheU9FUygpO1xuICAgICAgICBleHQuYmluZFZlcnRleEFycmF5T0VTKHZhby5fdmFvKTtcbiAgICAgICAgdmFvLnNldHVwKCk7XG4gICAgICAgIGV4dC5iaW5kVmVydGV4QXJyYXlPRVMobnVsbCk7XG4gICAgICAgIGlmICh0eXBlb2YgdmFvLnRlYXJkb3duID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHZhby50ZWFyZG93bigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YW8uc2V0dXAoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFvO1xufTtcblxuR0wuVmVydGV4QXJyYXlPYmplY3QuYmluZCA9IGZ1bmN0aW9uICh2YW8pXG57XG4gICAgdmFyIGV4dCA9IEdMLlZlcnRleEFycmF5T2JqZWN0LmV4dDtcbiAgICBpZiAodmFvICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGV4dCAhPSBudWxsICYmIHZhby5fdmFvICE9IG51bGwpIHtcbiAgICAgICAgICAgIGV4dC5iaW5kVmVydGV4QXJyYXlPRVModmFvLl92YW8pO1xuICAgICAgICAgICAgR0wuVmVydGV4QXJyYXlPYmplY3QuYm91bmRfdmFvID0gdmFvO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFvLnNldHVwKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChleHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgZXh0LmJpbmRWZXJ0ZXhBcnJheU9FUyhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChHTC5WZXJ0ZXhBcnJheU9iamVjdC5ib3VuZF92YW8gIT0gbnVsbCAmJiB0eXBlb2YgR0wuVmVydGV4QXJyYXlPYmplY3QuYm91bmRfdmFvLnRlYXJkb3duID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIEdMLlZlcnRleEFycmF5T2JqZWN0LmJvdW5kX3Zhby50ZWFyZG93bigpO1xuICAgICAgICB9XG4gICAgICAgIEdMLlZlcnRleEFycmF5T2JqZWN0LmJvdW5kX3ZhbyA9IG51bGw7XG4gICAgfVxufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHTDtcbn1cbiIsInZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi92ZWN0b3IuanMnKTtcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uL3BvaW50LmpzJyk7XG52YXIgR0wgPSByZXF1aXJlKCcuL2dsLmpzJyk7XG5cbnZhciBHTEJ1aWxkZXJzID0ge307XG5cbkdMQnVpbGRlcnMuZGVidWcgPSBmYWxzZTtcblxuLy8gVGVzc2VsYXRlIGEgZmxhdCAyRCBwb2x5Z29uIHdpdGggZml4ZWQgaGVpZ2h0IGFuZCBhZGQgdG8gR0wgdmVydGV4IGJ1ZmZlclxuR0xCdWlsZGVycy5idWlsZFBvbHlnb25zID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUG9seWdvbnMgKHBvbHlnb25zLCB6LCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW3osIDAsIDAsIDFdOyAvLyBwcm92aWRlZCB6LCBhbmQgdXB3YXJkcy1mYWNpbmcgbm9ybWFsXG4gICAgaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2guYXBwbHkodmVydGV4X2NvbnN0YW50cywgb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICB9XG5cbiAgICB2YXIgbnVtX3BvbHlnb25zID0gcG9seWdvbnMubGVuZ3RoO1xuICAgIGZvciAodmFyIHA9MDsgcCA8IG51bV9wb2x5Z29uczsgcCsrKSB7XG4gICAgICAgIHZhciB2ZXJ0aWNlcyA9IEdMLnRyaWFuZ3VsYXRlUG9seWdvbihwb2x5Z29uc1twXSk7XG4gICAgICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLCB2ZXJ0ZXhfZGF0YSwgdmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gVGVzc2VsYXRlIGFuZCBleHRydWRlIGEgZmxhdCAyRCBwb2x5Z29uIGludG8gYSBzaW1wbGUgM0QgbW9kZWwgd2l0aCBmaXhlZCBoZWlnaHQgYW5kIGFkZCB0byBHTCB2ZXJ0ZXggYnVmZmVyXG5HTEJ1aWxkZXJzLmJ1aWxkRXh0cnVkZWRQb2x5Z29ucyA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZEV4dHJ1ZGVkUG9seWdvbiAocG9seWdvbnMsIHosIGhlaWdodCwgbWluX2hlaWdodCwgdmVydGV4X2RhdGEsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIG1pbl96ID0geiArIChtaW5faGVpZ2h0IHx8IDApO1xuICAgIHZhciBtYXhfeiA9IHogKyBoZWlnaHQ7XG5cbiAgICAvLyBUb3BcbiAgICBHTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMocG9seWdvbnMsIG1heF96LCB2ZXJ0ZXhfZGF0YSwgeyB2ZXJ0ZXhfY29uc3RhbnRzOiBvcHRpb25zLnZlcnRleF9jb25zdGFudHMgfSk7XG5cbiAgICAvLyBXYWxsc1xuICAgIHZhciB3YWxsX3ZlcnRleF9jb25zdGFudHMgPSBbbnVsbCwgbnVsbCwgbnVsbF07IC8vIG5vcm1hbHMgd2lsbCBiZSBjYWxjdWxhdGVkIGJlbG93XG4gICAgaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh3YWxsX3ZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgdmFyIG51bV9wb2x5Z29ucyA9IHBvbHlnb25zLmxlbmd0aDtcbiAgICBmb3IgKHZhciBwPTA7IHAgPCBudW1fcG9seWdvbnM7IHArKykge1xuICAgICAgICB2YXIgcG9seWdvbiA9IHBvbHlnb25zW3BdO1xuXG4gICAgICAgIGZvciAodmFyIHE9MDsgcSA8IHBvbHlnb24ubGVuZ3RoOyBxKyspIHtcbiAgICAgICAgICAgIHZhciBjb250b3VyID0gcG9seWdvbltxXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgdz0wOyB3IDwgY29udG91ci5sZW5ndGggLSAxOyB3KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgd2FsbF92ZXJ0aWNlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgLy8gVHdvIHRyaWFuZ2xlcyBmb3IgdGhlIHF1YWQgZm9ybWVkIGJ5IGVhY2ggdmVydGV4IHBhaXIsIGdvaW5nIGZyb20gYm90dG9tIHRvIHRvcCBoZWlnaHRcbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIC8vIFRyaWFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3crMV1bMF0sIGNvbnRvdXJbdysxXVsxXSwgbWF4X3pdLFxuICAgICAgICAgICAgICAgICAgICBbY29udG91clt3KzFdWzBdLCBjb250b3VyW3crMV1bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJpYW5nbGVcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1heF96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbdysxXVswXSwgY29udG91clt3KzFdWzFdLCBtYXhfel1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FsYyB0aGUgbm9ybWFsIG9mIHRoZSB3YWxsIGZyb20gdXAgdmVjdG9yIGFuZCBvbmUgc2VnbWVudCBvZiB0aGUgd2FsbCB0cmlhbmdsZXNcbiAgICAgICAgICAgICAgICB2YXIgbm9ybWFsID0gVmVjdG9yLmNyb3NzKFxuICAgICAgICAgICAgICAgICAgICBbMCwgMCwgMV0sXG4gICAgICAgICAgICAgICAgICAgIFZlY3Rvci5ub3JtYWxpemUoW2NvbnRvdXJbdysxXVswXSAtIGNvbnRvdXJbd11bMF0sIGNvbnRvdXJbdysxXVsxXSAtIGNvbnRvdXJbd11bMV0sIDBdKVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHNbMF0gPSBub3JtYWxbMF07XG4gICAgICAgICAgICAgICAgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzWzFdID0gbm9ybWFsWzFdO1xuICAgICAgICAgICAgICAgIHdhbGxfdmVydGV4X2NvbnN0YW50c1syXSA9IG5vcm1hbFsyXTtcblxuICAgICAgICAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHdhbGxfdmVydGljZXMsIHZlcnRleF9kYXRhLCB3YWxsX3ZlcnRleF9jb25zdGFudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQnVpbGQgdGVzc2VsbGF0ZWQgdHJpYW5nbGVzIGZvciBhIHBvbHlsaW5lXG4vLyBCYXNpY2FsbHkgZm9sbG93aW5nIHRoZSBtZXRob2QgZGVzY3JpYmVkIGhlcmUgZm9yIG1pdGVyIGpvaW50czpcbi8vIGh0dHA6Ly9hcnRncmFtbWVyLmJsb2dzcG90LmNvLnVrLzIwMTEvMDcvZHJhd2luZy1wb2x5bGluZXMtYnktdGVzc2VsbGF0aW9uLmh0bWxcbkdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRQb2x5bGluZXMgKGxpbmVzLCB6LCB3aWR0aCwgdmVydGV4X2RhdGEsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jbG9zZWRfcG9seWdvbiA9IG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gfHwgZmFsc2U7XG4gICAgb3B0aW9ucy5yZW1vdmVfdGlsZV9lZGdlcyA9IG9wdGlvbnMucmVtb3ZlX3RpbGVfZWRnZXMgfHwgZmFsc2U7XG5cbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFt6LCAwLCAwLCAxXTsgLy8gcHJvdmlkZWQgeiwgYW5kIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoLmFwcGx5KHZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgLy8gTGluZSBjZW50ZXIgLSBkZWJ1Z2dpbmdcbiAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBsbj0wOyBsbiA8IG51bV9saW5lczsgbG4rKykge1xuICAgICAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tsbl07XG5cbiAgICAgICAgICAgIGZvciAodmFyIHA9MDsgcCA8IGxpbmUubGVuZ3RoIC0gMTsgcCsrKSB7XG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICAgICAgdmFyIHBhID0gbGluZVtwXTtcbiAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lW3ArMV07XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLnZlcnRleF9saW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMS4wLCAwLCAwLFxuICAgICAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMS4wLCAwLCAwXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBCdWlsZCB0cmlhbmdsZXNcbiAgICB2YXIgdmVydGljZXMgPSBbXTtcbiAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgIGZvciAodmFyIGxuPTA7IGxuIDwgbnVtX2xpbmVzOyBsbisrKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbbG5dO1xuICAgICAgICAvLyBNdWx0aXBsZSBsaW5lIHNlZ21lbnRzXG4gICAgICAgIGlmIChsaW5lLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIC8vIEJ1aWxkIGFuY2hvcnMgZm9yIGxpbmUgc2VnbWVudHM6XG4gICAgICAgICAgICAvLyBhbmNob3JzIGFyZSAzIHBvaW50cywgZWFjaCBjb25uZWN0aW5nIDIgbGluZSBzZWdtZW50cyB0aGF0IHNoYXJlIGEgam9pbnQgKHN0YXJ0IHBvaW50LCBqb2ludCBwb2ludCwgZW5kIHBvaW50KVxuXG4gICAgICAgICAgICB2YXIgYW5jaG9ycyA9IFtdO1xuXG4gICAgICAgICAgICBpZiAobGluZS5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgLy8gRmluZCBtaWRwb2ludHMgb2YgZWFjaCBsaW5lIHNlZ21lbnRcbiAgICAgICAgICAgICAgICAvLyBGb3IgY2xvc2VkIHBvbHlnb25zLCBjYWxjdWxhdGUgYWxsIG1pZHBvaW50cyBzaW5jZSBzZWdtZW50cyB3aWxsIHdyYXAgYXJvdW5kIHRvIGZpcnN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgdmFyIG1pZCA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciBwLCBwbWF4O1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmNsb3NlZF9wb2x5Z29uID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcCA9IDA7IC8vIHN0YXJ0IG9uIGZpcnN0IHBvaW50XG4gICAgICAgICAgICAgICAgICAgIHBtYXggPSBsaW5lLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEZvciBvcGVuIHBvbHlnb25zLCBza2lwIGZpcnN0IG1pZHBvaW50IGFuZCB1c2UgbGluZSBzdGFydCBpbnN0ZWFkXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHAgPSAxOyAvLyBzdGFydCBvbiBzZWNvbmQgcG9pbnRcbiAgICAgICAgICAgICAgICAgICAgcG1heCA9IGxpbmUubGVuZ3RoIC0gMjtcbiAgICAgICAgICAgICAgICAgICAgbWlkLnB1c2gobGluZVswXSk7IC8vIHVzZSBsaW5lIHN0YXJ0IGluc3RlYWQgb2YgZmlyc3QgbWlkcG9pbnRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxjIG1pZHBvaW50c1xuICAgICAgICAgICAgICAgIGZvciAoOyBwIDwgcG1heDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmVbcF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYiA9IGxpbmVbcCsxXTtcbiAgICAgICAgICAgICAgICAgICAgbWlkLnB1c2goWyhwYVswXSArIHBiWzBdKSAvIDIsIChwYVsxXSArIHBiWzFdKSAvIDJdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBTYW1lIGNsb3NlZC9vcGVuIHBvbHlnb24gbG9naWMgYXMgYWJvdmU6IGtlZXAgbGFzdCBtaWRwb2ludCBmb3IgY2xvc2VkLCBza2lwIGZvciBvcGVuXG4gICAgICAgICAgICAgICAgdmFyIG1tYXg7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBtbWF4ID0gbWlkLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1pZC5wdXNoKGxpbmVbbGluZS5sZW5ndGgtMV0pOyAvLyB1c2UgbGluZSBlbmQgaW5zdGVhZCBvZiBsYXN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgICAgIG1tYXggPSBtaWQubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBNYWtlIGFuY2hvcnMgYnkgY29ubmVjdGluZyBtaWRwb2ludHMgdG8gbGluZSBqb2ludHNcbiAgICAgICAgICAgICAgICBmb3IgKHA9MDsgcCA8IG1tYXg7IHArKykgIHtcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9ycy5wdXNoKFttaWRbcF0sIGxpbmVbKHArMSkgJSBsaW5lLmxlbmd0aF0sIG1pZFsocCsxKSAlIG1pZC5sZW5ndGhdXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRGVnZW5lcmF0ZSBjYXNlLCBhIDMtcG9pbnQgbGluZSBpcyBqdXN0IGEgc2luZ2xlIGFuY2hvclxuICAgICAgICAgICAgICAgIGFuY2hvcnMgPSBbW2xpbmVbMF0sIGxpbmVbMV0sIGxpbmVbMl1dXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgcD0wOyBwIDwgYW5jaG9ycy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5yZW1vdmVfdGlsZV9lZGdlcykge1xuICAgICAgICAgICAgICAgICAgICBidWlsZEFuY2hvcihhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGRTZWdtZW50KGFuY2hvcnNbcF1bMF0sIGFuY2hvcnNbcF1bMV0pOyAvLyB1c2UgdGhlc2UgdG8gZHJhdyBleHRydWRlZCBzZWdtZW50cyB3L28gam9pbiwgZm9yIGRlYnVnZ2luZ1xuICAgICAgICAgICAgICAgICAgICAvLyBidWlsZFNlZ21lbnQoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWRnZTEgPSBHTEJ1aWxkZXJzLmlzT25UaWxlRWRnZShhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkZ2UyID0gR0xCdWlsZGVycy5pc09uVGlsZUVkZ2UoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZWRnZTEgJiYgIWVkZ2UyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZEFuY2hvcihhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZWRnZTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZWRnZTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBTaW5nbGUgMi1wb2ludCBzZWdtZW50XG4gICAgICAgIGVsc2UgaWYgKGxpbmUubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgIGJ1aWxkU2VnbWVudChsaW5lWzBdLCBsaW5lWzFdKTsgLy8gVE9ETzogcmVwbGFjZSBidWlsZFNlZ21lbnQgd2l0aCBhIGRlZ2VuZXJhdGUgZm9ybSBvZiBidWlsZEFuY2hvcj8gYnVpbGRTZWdtZW50IGlzIHN0aWxsIHVzZWZ1bCBmb3IgZGVidWdnaW5nXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgR0wuYWRkVmVydGljZXModmVydGljZXMsIHZlcnRleF9kYXRhLCB2ZXJ0ZXhfY29uc3RhbnRzKTtcblxuICAgIC8vIEJ1aWxkIHRyaWFuZ2xlcyBmb3IgYSBzaW5nbGUgbGluZSBzZWdtZW50LCBleHRydWRlZCBieSB0aGUgcHJvdmlkZWQgd2lkdGhcbiAgICBmdW5jdGlvbiBidWlsZFNlZ21lbnQgKHBhLCBwYikge1xuICAgICAgICB2YXIgc2xvcGUgPSBWZWN0b3Iubm9ybWFsaXplKFsocGJbMV0gLSBwYVsxXSkgKiAtMSwgcGJbMF0gLSBwYVswXV0pO1xuXG4gICAgICAgIHZhciBwYV9vdXRlciA9IFtwYVswXSArIHNsb3BlWzBdICogd2lkdGgvMiwgcGFbMV0gKyBzbG9wZVsxXSAqIHdpZHRoLzJdO1xuICAgICAgICB2YXIgcGFfaW5uZXIgPSBbcGFbMF0gLSBzbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdIC0gc2xvcGVbMV0gKiB3aWR0aC8yXTtcblxuICAgICAgICB2YXIgcGJfb3V0ZXIgPSBbcGJbMF0gKyBzbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdICsgc2xvcGVbMV0gKiB3aWR0aC8yXTtcbiAgICAgICAgdmFyIHBiX2lubmVyID0gW3BiWzBdIC0gc2xvcGVbMF0gKiB3aWR0aC8yLCBwYlsxXSAtIHNsb3BlWzFdICogd2lkdGgvMl07XG5cbiAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgIHBiX2lubmVyLCBwYl9vdXRlciwgcGFfaW5uZXIsXG4gICAgICAgICAgICBwYV9pbm5lciwgcGJfb3V0ZXIsIHBhX291dGVyXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgdHJpYW5nbGVzIGZvciBhIDMtcG9pbnQgJ2FuY2hvcicgc2hhcGUsIGNvbnNpc3Rpbmcgb2YgdHdvIGxpbmUgc2VnbWVudHMgd2l0aCBhIGpvaW50XG4gICAgLy8gVE9ETzogbW92ZSB0aGVzZSBmdW5jdGlvbnMgb3V0IG9mIGNsb3N1cmVzP1xuICAgIGZ1bmN0aW9uIGJ1aWxkQW5jaG9yIChwYSwgam9pbnQsIHBiKSB7XG4gICAgICAgIC8vIElubmVyIGFuZCBvdXRlciBsaW5lIHNlZ21lbnRzIGZvciBbcGEsIGpvaW50XSBhbmQgW2pvaW50LCBwYl1cbiAgICAgICAgdmFyIHBhX3Nsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKGpvaW50WzFdIC0gcGFbMV0pICogLTEsIGpvaW50WzBdIC0gcGFbMF1dKTtcbiAgICAgICAgdmFyIHBhX291dGVyID0gW1xuICAgICAgICAgICAgW3BhWzBdICsgcGFfc2xvcGVbMF0gKiB3aWR0aC8yLCBwYVsxXSArIHBhX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbam9pbnRbMF0gKyBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdICsgcGFfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuICAgICAgICB2YXIgcGFfaW5uZXIgPSBbXG4gICAgICAgICAgICBbcGFbMF0gLSBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdIC0gcGFfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtqb2ludFswXSAtIHBhX3Nsb3BlWzBdICogd2lkdGgvMiwgam9pbnRbMV0gLSBwYV9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG5cbiAgICAgICAgdmFyIHBiX3Nsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKHBiWzFdIC0gam9pbnRbMV0pICogLTEsIHBiWzBdIC0gam9pbnRbMF1dKTtcbiAgICAgICAgdmFyIHBiX291dGVyID0gW1xuICAgICAgICAgICAgW2pvaW50WzBdICsgcGJfc2xvcGVbMF0gKiB3aWR0aC8yLCBqb2ludFsxXSArIHBiX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbcGJbMF0gKyBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdICsgcGJfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuICAgICAgICB2YXIgcGJfaW5uZXIgPSBbXG4gICAgICAgICAgICBbam9pbnRbMF0gLSBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdIC0gcGJfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtwYlswXSAtIHBiX3Nsb3BlWzBdICogd2lkdGgvMiwgcGJbMV0gLSBwYl9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gTWl0ZXIgam9pbiAtIHNvbHZlIGZvciB0aGUgaW50ZXJzZWN0aW9uIGJldHdlZW4gdGhlIHR3byBvdXRlciBsaW5lIHNlZ21lbnRzXG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb24gPSBWZWN0b3IubGluZUludGVyc2VjdGlvbihwYV9vdXRlclswXSwgcGFfb3V0ZXJbMV0sIHBiX291dGVyWzBdLCBwYl9vdXRlclsxXSk7XG4gICAgICAgIHZhciBsaW5lX2RlYnVnID0gbnVsbDtcbiAgICAgICAgaWYgKGludGVyc2VjdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0X291dGVyID0gaW50ZXJzZWN0aW9uO1xuXG4gICAgICAgICAgICAvLyBDYXAgdGhlIGludGVyc2VjdGlvbiBwb2ludCB0byBhIHJlYXNvbmFibGUgZGlzdGFuY2UgKGFzIGpvaW4gYW5nbGUgYmVjb21lcyBzaGFycGVyLCBtaXRlciBqb2ludCBkaXN0YW5jZSB3b3VsZCBhcHByb2FjaCBpbmZpbml0eSlcbiAgICAgICAgICAgIHZhciBsZW5fc3EgPSBWZWN0b3IubGVuZ3RoU3EoW2ludGVyc2VjdF9vdXRlclswXSAtIGpvaW50WzBdLCBpbnRlcnNlY3Rfb3V0ZXJbMV0gLSBqb2ludFsxXV0pO1xuICAgICAgICAgICAgdmFyIG1pdGVyX2xlbl9tYXggPSAzOyAvLyBtdWx0aXBsaWVyIG9uIGxpbmUgd2lkdGggZm9yIG1heCBkaXN0YW5jZSBtaXRlciBqb2luIGNhbiBiZSBmcm9tIGpvaW50XG4gICAgICAgICAgICBpZiAobGVuX3NxID4gKHdpZHRoICogd2lkdGggKiBtaXRlcl9sZW5fbWF4ICogbWl0ZXJfbGVuX21heCkpIHtcbiAgICAgICAgICAgICAgICBsaW5lX2RlYnVnID0gJ2Rpc3RhbmNlJztcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3Rfb3V0ZXIgPSBWZWN0b3Iubm9ybWFsaXplKFtpbnRlcnNlY3Rfb3V0ZXJbMF0gLSBqb2ludFswXSwgaW50ZXJzZWN0X291dGVyWzFdIC0gam9pbnRbMV1dKTtcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3Rfb3V0ZXIgPSBbXG4gICAgICAgICAgICAgICAgICAgIGpvaW50WzBdICsgaW50ZXJzZWN0X291dGVyWzBdICogbWl0ZXJfbGVuX21heCxcbiAgICAgICAgICAgICAgICAgICAgam9pbnRbMV0gKyBpbnRlcnNlY3Rfb3V0ZXJbMV0gKiBtaXRlcl9sZW5fbWF4XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0X2lubmVyID0gW1xuICAgICAgICAgICAgICAgIChqb2ludFswXSAtIGludGVyc2VjdF9vdXRlclswXSkgKyBqb2ludFswXSxcbiAgICAgICAgICAgICAgICAoam9pbnRbMV0gLSBpbnRlcnNlY3Rfb3V0ZXJbMV0pICsgam9pbnRbMV1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X2lubmVyLCBpbnRlcnNlY3Rfb3V0ZXIsIHBhX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdLCBpbnRlcnNlY3Rfb3V0ZXIsIHBhX291dGVyWzBdLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMV0sIHBiX291dGVyWzFdLCBpbnRlcnNlY3RfaW5uZXIsXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X2lubmVyLCBwYl9vdXRlclsxXSwgaW50ZXJzZWN0X291dGVyXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gTGluZSBzZWdtZW50cyBhcmUgcGFyYWxsZWwsIHVzZSB0aGUgZmlyc3Qgb3V0ZXIgbGluZSBzZWdtZW50IGFzIGpvaW4gaW5zdGVhZFxuICAgICAgICAgICAgbGluZV9kZWJ1ZyA9ICdwYXJhbGxlbCc7XG4gICAgICAgICAgICBwYV9pbm5lclsxXSA9IHBiX2lubmVyWzBdO1xuICAgICAgICAgICAgcGFfb3V0ZXJbMV0gPSBwYl9vdXRlclswXTtcblxuICAgICAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXSwgcGFfb3V0ZXJbMV0sIHBhX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdLCBwYV9vdXRlclsxXSwgcGFfb3V0ZXJbMF0sXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXSwgcGJfb3V0ZXJbMV0sIHBiX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzBdLCBwYl9vdXRlclsxXSwgcGJfb3V0ZXJbMF1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeHRydWRlZCBpbm5lci9vdXRlciBlZGdlcyAtIGRlYnVnZ2luZ1xuICAgICAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXVswXSwgcGFfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzFdWzBdLCBwYV9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXVswXSwgcGJfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzFdWzBdLCBwYl9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9vdXRlclswXVswXSwgcGFfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzFdWzBdLCBwYV9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9vdXRlclswXVswXSwgcGJfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzFdWzBdLCBwYl9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXVswXSwgcGFfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzBdWzBdLCBwYV9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXVswXSwgcGFfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzFdWzBdLCBwYV9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXVswXSwgcGJfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzBdWzBdLCBwYl9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXVswXSwgcGJfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzFdWzBdLCBwYl9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBsaW5lX2RlYnVnICYmIG9wdGlvbnMudmVydGV4X2xpbmVzKSB7XG4gICAgICAgICAgICB2YXIgZGNvbG9yO1xuICAgICAgICAgICAgaWYgKGxpbmVfZGVidWcgPT0gJ3BhcmFsbGVsJykge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiISEhIGxpbmVzIGFyZSBwYXJhbGxlbCAhISFcIik7XG4gICAgICAgICAgICAgICAgZGNvbG9yID0gWzAsIDEsIDBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobGluZV9kZWJ1ZyA9PSAnZGlzdGFuY2UnKSB7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCIhISEgbWl0ZXIgaW50ZXJzZWN0aW9uIHBvaW50IGV4Y2VlZGVkIGFsbG93ZWQgZGlzdGFuY2UgZnJvbSBqb2ludCAhISFcIik7XG4gICAgICAgICAgICAgICAgZGNvbG9yID0gWzEsIDAsIDBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ09TTSBpZDogJyArIGZlYXR1cmUuaWQpOyAvLyBUT0RPOiBpZiB0aGlzIGZ1bmN0aW9uIGlzIG1vdmVkIG91dCBvZiBhIGNsb3N1cmUsIHRoaXMgZmVhdHVyZSBkZWJ1ZyBpbmZvIHdvbid0IGJlIGF2YWlsYWJsZVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coW3BhLCBqb2ludCwgcGJdKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGZlYXR1cmUpO1xuICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdLFxuICAgICAgICAgICAgICAgIGpvaW50WzBdLCBqb2ludFsxXSwgeiArIDAuMDAyLFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIGRjb2xvclswXSwgZGNvbG9yWzFdLCBkY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgam9pbnRbMF0sIGpvaW50WzFdLCB6ICsgMC4wMDIsXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgZGNvbG9yWzBdLCBkY29sb3JbMV0sIGRjb2xvclsyXSxcbiAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yICh2YXIgbG49MDsgbG4gPCBudW1fbGluZXM7IGxuKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbGluZTIgPSBsaW5lc1tsbl07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwPTA7IHAgPCBsaW5lMi5sZW5ndGggLSAxOyBwKyspIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmUyW3BdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lMltwKzFdO1xuXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudmVydGV4X2xpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLCAwLCAxLjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLCAwLCAxLjBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQnVpbGQgYSBxdWFkIGNlbnRlcmVkIG9uIGEgcG9pbnRcbkdMQnVpbGRlcnMuYnVpbGRRdWFkcyA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZFF1YWRzIChwb2ludHMsIHdpZHRoLCBoZWlnaHQsIGFkZEdlb21ldHJ5LCBvcHRpb25zKVxue1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBudW1fcG9pbnRzID0gcG9pbnRzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBwPTA7IHAgPCBudW1fcG9pbnRzOyBwKyspIHtcbiAgICAgICAgdmFyIHBvaW50ID0gcG9pbnRzW3BdO1xuXG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBbXG4gICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbiAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG5cbiAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG4gICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcbiAgICAgICAgXTtcblxuICAgICAgICBpZiAob3B0aW9ucy50ZXhjb29yZHMgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIHRleGNvb3JkcyA9IFtcbiAgICAgICAgICAgICAgICBbLTEsIC0xXSxcbiAgICAgICAgICAgICAgICBbMSwgLTFdLFxuICAgICAgICAgICAgICAgIFsxLCAxXSxcblxuICAgICAgICAgICAgICAgIFstMSwgLTFdLFxuICAgICAgICAgICAgICAgIFsxLCAxXSxcbiAgICAgICAgICAgICAgICBbLTEsIDFdXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHZlcnRpY2VzID0ge1xuICAgICAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXG4gICAgICAgICAgICB0ZXhjb29yZHM6IChvcHRpb25zLnRleGNvb3JkcyAmJiB0ZXhjb29yZHMpXG4gICAgICAgIH07XG4gICAgICAgIGFkZEdlb21ldHJ5KHZlcnRpY2VzKTtcbiAgICB9XG59O1xuXG4vLyBCdWlsZCBuYXRpdmUgR0wgbGluZXMgZm9yIGEgcG9seWxpbmVcbkdMQnVpbGRlcnMuYnVpbGRMaW5lcyA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZExpbmVzIChsaW5lcywgZmVhdHVyZSwgbGF5ZXIsIHN0eWxlLCB0aWxlLCB6LCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBjb2xvciA9IHN0eWxlLmNvbG9yO1xuICAgIHZhciB3aWR0aCA9IHN0eWxlLndpZHRoO1xuXG4gICAgdmFyIG51bV9saW5lcyA9IGxpbmVzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBsbj0wOyBsbiA8IG51bV9saW5lczsgbG4rKykge1xuICAgICAgICB2YXIgbGluZSA9IGxpbmVzW2xuXTtcblxuICAgICAgICBmb3IgKHZhciBwPTA7IHAgPCBsaW5lLmxlbmd0aCAtIDE7IHArKykge1xuICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICB2YXIgcGEgPSBsaW5lW3BdO1xuICAgICAgICAgICAgdmFyIHBiID0gbGluZVtwKzFdO1xuXG4gICAgICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoKFxuICAgICAgICAgICAgICAgIC8vIFBvaW50IEFcbiAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHosXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgLy8gZmxhdCBzdXJmYWNlcyBwb2ludCBzdHJhaWdodCB1cFxuICAgICAgICAgICAgICAgIGNvbG9yWzBdLCBjb2xvclsxXSwgY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQlxuICAgICAgICAgICAgICAgIHBiWzBdLCBwYlsxXSwgeixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCAvLyBmbGF0IHN1cmZhY2VzIHBvaW50IHN0cmFpZ2h0IHVwXG4gICAgICAgICAgICAgICAgY29sb3JbMF0sIGNvbG9yWzFdLCBjb2xvclsyXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vKiBVdGlsaXR5IGZ1bmN0aW9ucyAqL1xuXG4vLyBUZXN0cyBpZiBhIGxpbmUgc2VnbWVudCAoZnJvbSBwb2ludCBBIHRvIEIpIGlzIG5lYXJseSBjb2luY2lkZW50IHdpdGggdGhlIGVkZ2Ugb2YgYSB0aWxlXG5HTEJ1aWxkZXJzLmlzT25UaWxlRWRnZSA9IGZ1bmN0aW9uIChwYSwgcGIsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgdG9sZXJhbmNlX2Z1bmN0aW9uID0gb3B0aW9ucy50b2xlcmFuY2VfZnVuY3Rpb24gfHwgR0xCdWlsZGVycy52YWx1ZXNXaXRoaW5Ub2xlcmFuY2U7XG4gICAgdmFyIHRvbGVyYW5jZSA9IG9wdGlvbnMudG9sZXJhbmNlIHx8IDE7IC8vIHR3ZWFrIHRoaXMgYWRqdXN0IGlmIGNhdGNoaW5nIHRvbyBmZXcvbWFueSBsaW5lIHNlZ21lbnRzIG5lYXIgdGlsZSBlZGdlc1xuICAgIHZhciB0aWxlX21pbiA9IEdMQnVpbGRlcnMudGlsZV9ib3VuZHNbMF07XG4gICAgdmFyIHRpbGVfbWF4ID0gR0xCdWlsZGVycy50aWxlX2JvdW5kc1sxXTtcbiAgICB2YXIgZWRnZSA9IG51bGw7XG5cbiAgICBpZiAodG9sZXJhbmNlX2Z1bmN0aW9uKHBhWzBdLCB0aWxlX21pbi54LCB0b2xlcmFuY2UpICYmIHRvbGVyYW5jZV9mdW5jdGlvbihwYlswXSwgdGlsZV9taW4ueCwgdG9sZXJhbmNlKSkge1xuICAgICAgICBlZGdlID0gJ2xlZnQnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMF0sIHRpbGVfbWF4LngsIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzBdLCB0aWxlX21heC54LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAncmlnaHQnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMV0sIHRpbGVfbWluLnksIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzFdLCB0aWxlX21pbi55LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAndG9wJztcbiAgICB9XG4gICAgZWxzZSBpZiAodG9sZXJhbmNlX2Z1bmN0aW9uKHBhWzFdLCB0aWxlX21heC55LCB0b2xlcmFuY2UpICYmIHRvbGVyYW5jZV9mdW5jdGlvbihwYlsxXSwgdGlsZV9tYXgueSwgdG9sZXJhbmNlKSkge1xuICAgICAgICBlZGdlID0gJ2JvdHRvbSc7XG4gICAgfVxuICAgIHJldHVybiBlZGdlO1xufTtcblxuR0xCdWlsZGVycy5zZXRUaWxlU2NhbGUgPSBmdW5jdGlvbiAoc2NhbGUpXG57XG4gICAgR0xCdWlsZGVycy50aWxlX2JvdW5kcyA9IFtcbiAgICAgICAgUG9pbnQoMCwgMCksXG4gICAgICAgIFBvaW50KHNjYWxlLCAtc2NhbGUpIC8vIFRPRE86IGNvcnJlY3QgZm9yIGZsaXBwZWQgeS1heGlzP1xuICAgIF07XG59O1xuXG5HTEJ1aWxkZXJzLnZhbHVlc1dpdGhpblRvbGVyYW5jZSA9IGZ1bmN0aW9uIChhLCBiLCB0b2xlcmFuY2UpXG57XG4gICAgdG9sZXJhbmNlID0gdG9sZXJhbmNlIHx8IDE7XG4gICAgcmV0dXJuIChNYXRoLmFicyhhIC0gYikgPCB0b2xlcmFuY2UpO1xufTtcblxuLy8gQnVpbGQgYSB6aWd6YWcgbGluZSBwYXR0ZXJuIGZvciB0ZXN0aW5nIGpvaW5zIGFuZCBjYXBzXG5HTEJ1aWxkZXJzLmJ1aWxkWmlnemFnTGluZVRlc3RQYXR0ZXJuID0gZnVuY3Rpb24gKClcbntcbiAgICB2YXIgbWluID0gUG9pbnQoMCwgMCk7IC8vIHRpbGUubWluO1xuICAgIHZhciBtYXggPSBQb2ludCg0MDk2LCA0MDk2KTsgLy8gdGlsZS5tYXg7XG4gICAgdmFyIGcgPSB7XG4gICAgICAgIGlkOiAxMjMsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgICB0eXBlOiAnTGluZVN0cmluZycsXG4gICAgICAgICAgICBjb29yZGluYXRlczogW1xuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNzUgKyBtYXgueCAqIDAuMjUsIG1pbi55ICogMC43NSArIG1heC55ICogMC4yNV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC43NSArIG1heC54ICogMC4yNSwgbWluLnkgKiAwLjUgKyBtYXgueSAqIDAuNV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC4yNSArIG1heC54ICogMC43NSwgbWluLnkgKiAwLjc1ICsgbWF4LnkgKiAwLjI1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjI1ICsgbWF4LnggKiAwLjc1LCBtaW4ueSAqIDAuMjUgKyBtYXgueSAqIDAuNzVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNCArIG1heC54ICogMC42LCBtaW4ueSAqIDAuNSArIG1heC55ICogMC41XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjUgKyBtYXgueCAqIDAuNSwgbWluLnkgKiAwLjI1ICsgbWF4LnkgKiAwLjc1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjc1ICsgbWF4LnggKiAwLjI1LCBtaW4ueSAqIDAuMjUgKyBtYXgueSAqIDAuNzVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNzUgKyBtYXgueCAqIDAuMjUsIG1pbi55ICogMC40ICsgbWF4LnkgKiAwLjZdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIGtpbmQ6ICdkZWJ1ZydcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gY29uc29sZS5sb2coZy5nZW9tZXRyeS5jb29yZGluYXRlcyk7XG4gICAgcmV0dXJuIGc7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdMQnVpbGRlcnM7XG59XG4iLCIvKioqIE1hbmFnZSByZW5kZXJpbmcgZm9yIHByaW1pdGl2ZXMgKioqL1xudmFyIEdMID0gcmVxdWlyZSgnLi9nbC5qcycpO1xuXG4vLyBBdHRyaWJzIGFyZSBhbiBhcnJheSwgaW4gbGF5b3V0IG9yZGVyLCBvZjogbmFtZSwgc2l6ZSwgdHlwZSwgbm9ybWFsaXplZFxuLy8gZXg6IHsgbmFtZTogJ3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH1cbmZ1bmN0aW9uIEdMR2VvbWV0cnkgKGdsLCBnbF9wcm9ncmFtLCB2ZXJ0ZXhfZGF0YSwgYXR0cmlicywgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLmdsX3Byb2dyYW0gPSBnbF9wcm9ncmFtO1xuICAgIHRoaXMuYXR0cmlicyA9IGF0dHJpYnM7XG4gICAgdGhpcy52ZXJ0ZXhfZGF0YSA9IHZlcnRleF9kYXRhOyAvLyBGbG9hdDMyQXJyYXlcbiAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgdGhpcy5kcmF3X21vZGUgPSBvcHRpb25zLmRyYXdfbW9kZSB8fCB0aGlzLmdsLlRSSUFOR0xFUztcbiAgICB0aGlzLmRhdGFfdXNhZ2UgPSBvcHRpb25zLmRhdGFfdXNhZ2UgfHwgdGhpcy5nbC5TVEFUSUNfRFJBVztcblxuICAgIC8vIENhbGMgdmVydGV4IHN0cmlkZVxuICAgIHRoaXMudmVydGV4X3N0cmlkZSA9IDA7XG4gICAgZm9yICh2YXIgYT0wOyBhIDwgdGhpcy5hdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIHZhciBhdHRyaWIgPSB0aGlzLmF0dHJpYnNbYV07XG5cbiAgICAgICAgYXR0cmliLmxvY2F0aW9uID0gdGhpcy5nbF9wcm9ncmFtLmF0dHJpYnV0ZShhdHRyaWIubmFtZSkubG9jYXRpb247XG4gICAgICAgIGF0dHJpYi5ieXRlX3NpemUgPSBhdHRyaWIuc2l6ZTtcblxuICAgICAgICBzd2l0Y2ggKGF0dHJpYi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuRkxPQVQ6XG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuSU5UOlxuICAgICAgICAgICAgY2FzZSB0aGlzLmdsLlVOU0lHTkVEX0lOVDpcbiAgICAgICAgICAgICAgICBhdHRyaWIuYnl0ZV9zaXplICo9IDQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuU0hPUlQ6XG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuVU5TSUdORURfU0hPUlQ6XG4gICAgICAgICAgICAgICAgYXR0cmliLmJ5dGVfc2l6ZSAqPSAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgYXR0cmliLm9mZnNldCA9IHRoaXMudmVydGV4X3N0cmlkZTtcbiAgICAgICAgdGhpcy52ZXJ0ZXhfc3RyaWRlICs9IGF0dHJpYi5ieXRlX3NpemU7XG4gICAgfVxuXG4gICAgdGhpcy52ZXJ0ZXhfY291bnQgPSB0aGlzLnZlcnRleF9kYXRhLmJ5dGVMZW5ndGggLyB0aGlzLnZlcnRleF9zdHJpZGU7XG5cbiAgICB0aGlzLnZhbyA9IEdMLlZlcnRleEFycmF5T2JqZWN0LmNyZWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgICAgIHRoaXMuc2V0dXAoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5nbC5idWZmZXJEYXRhKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLnZlcnRleF9kYXRhLCB0aGlzLmRhdGFfdXNhZ2UpO1xufVxuXG5HTEdlb21ldHJ5LnByb3RvdHlwZS5zZXR1cCA9IGZ1bmN0aW9uICgpXG57XG4gICAgZm9yICh2YXIgYT0wOyBhIDwgdGhpcy5hdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIHZhciBhdHRyaWIgPSB0aGlzLmF0dHJpYnNbYV07XG4gICAgICAgIHRoaXMuZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoYXR0cmliLmxvY2F0aW9uKTtcbiAgICAgICAgdGhpcy5nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGF0dHJpYi5sb2NhdGlvbiwgYXR0cmliLnNpemUsIGF0dHJpYi50eXBlLCBhdHRyaWIubm9ybWFsaXplZCwgdGhpcy52ZXJ0ZXhfc3RyaWRlLCBhdHRyaWIub2Zmc2V0KTtcbiAgICB9XG59O1xuXG5HTEdlb21ldHJ5LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKVxue1xuICAgIHRoaXMuZ2wudXNlUHJvZ3JhbSh0aGlzLmdsX3Byb2dyYW0ucHJvZ3JhbSk7XG4gICAgR0wuVmVydGV4QXJyYXlPYmplY3QuYmluZCh0aGlzLnZhbyk7XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuX3JlbmRlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX3JlbmRlcigpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHN1cHBvcnQgZWxlbWVudCBhcnJheSBtb2RlXG4gICAgdGhpcy5nbC5kcmF3QXJyYXlzKHRoaXMuZHJhd19tb2RlLCAwLCB0aGlzLnZlcnRleF9jb3VudCk7XG4gICAgR0wuVmVydGV4QXJyYXlPYmplY3QuYmluZChudWxsKTtcbn07XG5cbkdMR2VvbWV0cnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKVxue1xuICAgIGNvbnNvbGUubG9nKFwiR0xHZW9tZXRyeS5kZXN0cm95OiBkZWxldGUgYnVmZmVyIG9mIHNpemUgXCIgKyB0aGlzLnZlcnRleF9kYXRhLmJ5dGVMZW5ndGgpO1xuICAgIHRoaXMuZ2wuZGVsZXRlQnVmZmVyKHRoaXMuYnVmZmVyKTtcbiAgICBkZWxldGUgdGhpcy52ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIERyYXdzIGEgc2V0IG9mIHRyaWFuZ2xlc1xuR0xUcmlhbmdsZXMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHTEdlb21ldHJ5LnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIEdMVHJpYW5nbGVzIChnbCwgZ2xfcHJvZ3JhbSwgdmVydGV4X2RhdGEpXG57XG4gICAgR0xHZW9tZXRyeS5jYWxsKHRoaXMsIGdsLCBnbF9wcm9ncmFtLCB2ZXJ0ZXhfZGF0YSwgW1xuICAgICAgICB7IG5hbWU6ICdhX3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2Ffbm9ybWFsJywgc2l6ZTogMywgdHlwZTogZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2FfY29sb3InLCBzaXplOiAzLCB0eXBlOiBnbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9sYXllcicsIHNpemU6IDEsIHR5cGU6IGdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9XG4gICAgXSk7XG4gICAgdGhpcy5nZW9tZXRyeV9jb3VudCA9IHRoaXMudmVydGV4X2NvdW50IC8gMztcbn1cblxuLy8gRHJhd3MgYSBzZXQgb2YgcG9pbnRzIGFzIHF1YWRzLCBpbnRlbmRlZCB0byBiZSByZW5kZXJlZCBhcyBkaXN0YW5jZSBmaWVsZHNcbkdMUG9seVBvaW50cy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdMR2VvbWV0cnkucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gR0xQb2x5UG9pbnRzIChnbCwgZ2xfcHJvZ3JhbSwgdmVydGV4X2RhdGEpXG57XG4gICAgR0xHZW9tZXRyeS5jYWxsKHRoaXMsIGdsLCBnbF9wcm9ncmFtLCB2ZXJ0ZXhfZGF0YSwgW1xuICAgICAgICB7IG5hbWU6ICdhX3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2FfdGV4Y29vcmQnLCBzaXplOiAyLCB0eXBlOiBnbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9jb2xvcicsIHNpemU6IDMsIHR5cGU6IGdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgc2l6ZTogMSwgdHlwZTogZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH1cbiAgICBdKTtcbiAgICB0aGlzLmdlb21ldHJ5X2NvdW50ID0gdGhpcy52ZXJ0ZXhfY291bnQgLyAzO1xufVxuXG4vLyBEcmF3cyBhIHNldCBvZiBsaW5lc1xuLy8gU2hhcmVzIGFsbCBjaGFyYWN0ZXJpc3RpY3Mgd2l0aCB0cmlhbmdsZXMgZXhjZXB0IGZvciBkcmF3IG1vZGVcbkdMTGluZXMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHTFRyaWFuZ2xlcy5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBHTExpbmVzIChnbCwgZ2xfcHJvZ3JhbSwgdmVydGV4X2RhdGEsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgR0xUcmlhbmdsZXMuY2FsbCh0aGlzLCBnbCwgcHJvZ3JhbSwgdmVydGV4X2RhdGEpO1xuICAgIHRoaXMuZHJhd19tb2RlID0gdGhpcy5nbC5MSU5FUztcbiAgICB0aGlzLmxpbmVfd2lkdGggPSBvcHRpb25zLmxpbmVfd2lkdGggfHwgMjtcbiAgICB0aGlzLmdlb21ldHJ5X2NvdW50ID0gdGhpcy52ZXJ0ZXhfY291bnQgLyAyO1xufVxuXG5HTExpbmVzLnByb3RvdHlwZS5fcmVuZGVyID0gZnVuY3Rpb24gKClcbntcbiAgICB0aGlzLmdsLmxpbmVXaWR0aCh0aGlzLmxpbmVfd2lkdGgpO1xuICAgIGlmICh0eXBlb2YgR0xUcmlhbmdsZXMucHJvdG90eXBlLl9yZW5kZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBHTFRyaWFuZ2xlcy5wcm90b3R5cGUuX3JlbmRlci5jYWxsKHRoaXMpO1xuICAgIH1cbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBHTEdlb21ldHJ5OiBHTEdlb21ldHJ5LFxuICAgICAgICBHTFRyaWFuZ2xlczogR0xUcmlhbmdsZXMsXG4gICAgICAgIEdMUG9seVBvaW50czogR0xQb2x5UG9pbnRzLFxuICAgICAgICBHTExpbmVzOiBHTExpbmVzXG4gICAgfTtcbn1cbiIsInZhciBQb2ludCA9IHJlcXVpcmUoJy4uL3BvaW50LmpzJyk7XG52YXIgR2VvID0gcmVxdWlyZSgnLi4vZ2VvLmpzJyk7XG52YXIgVmVjdG9yUmVuZGVyZXIgPSByZXF1aXJlKCcuLi92ZWN0b3JfcmVuZGVyZXIuanMnKTtcblxudmFyIEdMID0gcmVxdWlyZSgnLi9nbC5qcycpO1xudmFyIEdMQnVpbGRlcnMgPSByZXF1aXJlKCcuL2dsX2J1aWxkZXJzLmpzJyk7XG52YXIgR0xHZW9tZXRyeSA9IHJlcXVpcmUoJy4vZ2xfZ2VvbS5qcycpLkdMR2VvbWV0cnk7XG52YXIgR0xUcmlhbmdsZXMgPSByZXF1aXJlKCcuL2dsX2dlb20uanMnKS5HTFRyaWFuZ2xlcztcbnZhciBHTFBvbHlQb2ludHMgPSByZXF1aXJlKCcuL2dsX2dlb20uanMnKS5HTFBvbHlQb2ludHM7XG52YXIgR0xMaW5lcyA9IHJlcXVpcmUoJy4vZ2xfZ2VvbS5qcycpLkdMTGluZXM7XG5cbnZhciBtYXQ0ID0gcmVxdWlyZSgnZ2wtbWF0cml4JykubWF0NDtcbnZhciB2ZWMzID0gcmVxdWlyZSgnZ2wtbWF0cml4JykudmVjMztcblxuVmVjdG9yUmVuZGVyZXIuR0xSZW5kZXJlciA9IEdMUmVuZGVyZXI7XG5HTFJlbmRlcmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yUmVuZGVyZXIucHJvdG90eXBlKTtcbkdMUmVuZGVyZXIuZGVidWcgPSBmYWxzZTtcblxuR0xSZW5kZXJlci5zaGFkZXJfc291cmNlcyA9IHJlcXVpcmUoJy4vZ2xfc2hhZGVycy5qcycpO1xuXG5mdW5jdGlvbiBHTFJlbmRlcmVyICh0aWxlX3NvdXJjZSwgbGF5ZXJzLCBzdHlsZXMsIG9wdGlvbnMpXG57XG4gICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgVmVjdG9yUmVuZGVyZXIuY2FsbCh0aGlzLCAnR0xSZW5kZXJlcicsIHRpbGVfc291cmNlLCBsYXllcnMsIHN0eWxlcywgb3B0aW9ucyk7XG5cbiAgICBHTEJ1aWxkZXJzLnNldFRpbGVTY2FsZShWZWN0b3JSZW5kZXJlci50aWxlX3NjYWxlKTtcbiAgICBHTC5Qcm9ncmFtLmRlZmluZXMuVElMRV9TQ0FMRSA9IFZlY3RvclJlbmRlcmVyLnRpbGVfc2NhbGUgKyAnLjAnO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lcjtcbiAgICB0aGlzLmNvbnRpbnVvdXNfYW5pbWF0aW9uID0gZmFsc2U7IC8vIHJlcXVlc3QgcmVkcmF3IGV2ZXJ5IGZyYW1lXG59XG5cbkdMUmVuZGVyZXIucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gR0xSZW5kZXJlckluaXQgKClcbntcbiAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyIHx8IGRvY3VtZW50LmJvZHk7XG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgdGhpcy5jYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5sZWZ0ID0gMDtcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS56SW5kZXggPSAtMTtcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG5cbiAgICB0aGlzLmdsID0gR0wuZ2V0Q29udGV4dCh0aGlzLmNhbnZhcyk7XG5cbiAgICB2YXIgcmVuZGVyZXIgPSB0aGlzO1xuXG4gICAgdGhpcy5yZW5kZXJfbW9kZXMgPSB7XG4gICAgICAgICdwb2x5Z29ucyc6IHtcbiAgICAgICAgICAgIGdsX3Byb2dyYW06IG5ldyBHTC5Qcm9ncmFtKHRoaXMuZ2wsIEdMUmVuZGVyZXIuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fdmVydGV4J10sIEdMUmVuZGVyZXIuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fZnJhZ21lbnQnXSksXG4gICAgICAgICAgICBtYWtlR0xHZW9tZXRyeTogZnVuY3Rpb24gKHZlcnRleF9kYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBHTFRyaWFuZ2xlcyhyZW5kZXJlci5nbCwgdGhpcy5nbF9wcm9ncmFtLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgICdwb2x5Z29uc19ub2lzZSc6IHtcbiAgICAgICAgICAgIGdsX3Byb2dyYW06IG5ldyBHTC5Qcm9ncmFtKHRoaXMuZ2wsIEdMUmVuZGVyZXIuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fdmVydGV4J10sIEdMUmVuZGVyZXIuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fZnJhZ21lbnQnXSwgeyBkZWZpbmVzOiB7ICdFRkZFQ1RfTk9JU0VfVEVYVFVSRSc6IHRydWUsICdFRkZFQ1RfTk9JU0VfQU5JTUFUQUJMRSc6IHRydWUgfSB9KSxcbiAgICAgICAgICAgIG1ha2VHTEdlb21ldHJ5OiBmdW5jdGlvbiAodmVydGV4X2RhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdMVHJpYW5nbGVzKHJlbmRlcmVyLmdsLCB0aGlzLmdsX3Byb2dyYW0sIHZlcnRleF9kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgJ3BvaW50cyc6IHtcbiAgICAgICAgICAgIC8vIFRPRE86IHJlcGxhY2UgcmVsYXRpdmUgc2hhZGVyIHBhdGhzIHdpdGggYSBiZXR0ZXIgYXV0by1wYXRoaW5nIHN5c3RlbVxuICAgICAgICAgICAgLy8gZ2xfcHJvZ3JhbTogbmV3IEdMLlByb2dyYW0uY3JlYXRlUHJvZ3JhbUZyb21VUkxzKHRoaXMuZ2wsIFZlY3RvclJlbmRlcmVyLmxpYnJhcnlfYmFzZV91cmwgKyAnLi4vc2hhZGVycy9wb2ludF92ZXJ0ZXguZ2xzbCcsIFZlY3RvclJlbmRlcmVyLmxpYnJhcnlfYmFzZV91cmwgKyAnLi4vc2hhZGVycy9wb2ludF9mcmFnbWVudC5nbHNsJywgeyBkZWZpbmVzOiB7ICdFRkZFQ1RfU0NSRUVOX0NPTE9SJzogdHJ1ZSB9IH0pLFxuICAgICAgICAgICAgZ2xfcHJvZ3JhbTogbmV3IEdMLlByb2dyYW0odGhpcy5nbCwgR0xSZW5kZXJlci5zaGFkZXJfc291cmNlc1sncG9pbnRfdmVydGV4J10sIEdMUmVuZGVyZXIuc2hhZGVyX3NvdXJjZXNbJ3BvaW50X2ZyYWdtZW50J10sIHsgZGVmaW5lczogeyAnRUZGRUNUX1NDUkVFTl9DT0xPUic6IHRydWUgfSB9KSxcbiAgICAgICAgICAgIG1ha2VHTEdlb21ldHJ5OiBmdW5jdGlvbiAodmVydGV4X2RhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdMUG9seVBvaW50cyhyZW5kZXJlci5nbCwgdGhpcy5nbF9wcm9ncmFtLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5yZXNpemVNYXAodGhpcy5jb250YWluZXIuY2xpZW50V2lkdGgsIHRoaXMuY29udGFpbmVyLmNsaWVudEhlaWdodCk7XG5cbiAgICAvLyB0aGlzLnpvb21fc3RlcCA9IDAuMDI7IC8vIGZvciBmcmFjdGlvbmFsIHpvb20gdXNlciBhZGp1c3RtZW50XG4gICAgdGhpcy5zdGFydF90aW1lID0gK25ldyBEYXRlKCk7XG4gICAgdGhpcy5sYXN0X3JlbmRlcl9jb3VudCA9IG51bGw7XG4gICAgdGhpcy5pbml0SW5wdXRIYW5kbGVycygpO1xufTtcblxuLy8gRGV0ZXJtaW5lIGEgWiB2YWx1ZSB0aGF0IHdpbGwgc3RhY2sgZmVhdHVyZXMgaW4gYSBcInBhaW50ZXIncyBhbGdvcml0aG1cIiBzdHlsZSwgZmlyc3QgYnkgbGF5ZXIsIHRoZW4gYnkgZHJhdyBvcmRlciB3aXRoaW4gbGF5ZXJcbi8vIEZlYXR1cmVzIGFyZSBhc3N1bWVkIHRvIGJlIGFscmVhZHkgc29ydGVkIGluIGRlc2lyZWQgZHJhdyBvcmRlciBieSB0aGUgbGF5ZXIgcHJlLXByb2Nlc3NvclxuR0xSZW5kZXJlci5jYWxjdWxhdGVaID0gZnVuY3Rpb24gKGxheWVyLCB0aWxlLCBsYXllcl9vZmZzZXQsIGZlYXR1cmVfb2Zmc2V0KVxue1xuICAgIC8vIHZhciBsYXllcl9vZmZzZXQgPSBsYXllcl9vZmZzZXQgfHwgMDtcbiAgICAvLyB2YXIgZmVhdHVyZV9vZmZzZXQgPSBmZWF0dXJlX29mZnNldCB8fCAwO1xuICAgIHZhciB6ID0gMDsgLy8gVE9ETzogbWFkZSB0aGlzIGEgbm8tb3AgdW50aWwgcmV2aXNpdGluZyB3aGVyZSBpdCBzaG91bGQgbGl2ZSAtIG9uZS10aW1lIGNhbGMgaGVyZSwgaW4gdmVydGV4IGxheW91dC9zaGFkZXIsIGV0Yy5cbiAgICByZXR1cm4gejtcbn07XG5cbi8vIFByb2Nlc3MgZ2VvbWV0cnkgZm9yIHRpbGUgLSBjYWxsZWQgYnkgd2ViIHdvcmtlclxuR0xSZW5kZXJlci5hZGRUaWxlID0gZnVuY3Rpb24gKHRpbGUsIGxheWVycywgc3R5bGVzKVxue1xuICAgIHZhciBsYXllciwgc3R5bGUsIGZlYXR1cmUsIHosIG1vZGU7XG4gICAgdmFyIHZlcnRleF9kYXRhID0ge307XG5cbiAgICAvLyBKb2luIGxpbmUgdGVzdCBwYXR0ZXJuXG4gICAgLy8gaWYgKEdMUmVuZGVyZXIuZGVidWcpIHtcbiAgICAvLyAgICAgdGlsZS5sYXllcnNbJ3JvYWRzJ10uZmVhdHVyZXMucHVzaChHTFJlbmRlcmVyLmJ1aWxkWmlnemFnTGluZVRlc3RQYXR0ZXJuKCkpO1xuICAgIC8vIH1cblxuICAgIC8vIEJ1aWxkIHJhdyBnZW9tZXRyeSBhcnJheXNcbiAgICB0aWxlLmRlYnVnLmZlYXR1cmVzID0gMDtcbiAgICBmb3IgKHZhciBsbj0wOyBsbiA8IGxheWVycy5sZW5ndGg7IGxuKyspIHtcbiAgICAgICAgbGF5ZXIgPSBsYXllcnNbbG5dO1xuXG4gICAgICAgIC8vIFNraXAgbGF5ZXJzIHdpdGggbm8gc3R5bGVzIGRlZmluZWQsIG9yIGxheWVycyBzZXQgdG8gbm90IGJlIHZpc2libGVcbiAgICAgICAgaWYgKHN0eWxlc1tsYXllci5uYW1lXSA9PSBudWxsIHx8ICFzdHlsZXNbbGF5ZXIubmFtZV0udmlzaWJsZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGlsZS5sYXllcnNbbGF5ZXIubmFtZV0gIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIG51bV9mZWF0dXJlcyA9IHRpbGUubGF5ZXJzW2xheWVyLm5hbWVdLmZlYXR1cmVzLmxlbmd0aDtcblxuICAgICAgICAgICAgLy8gUmVuZGVyaW5nIHJldmVyc2Ugb3JkZXIgYWthIHRvcCB0byBib3R0b21cbiAgICAgICAgICAgIGZvciAodmFyIGYgPSBudW1fZmVhdHVyZXMtMTsgZiA+PSAwOyBmLS0pIHtcbiAgICAgICAgICAgICAgICBmZWF0dXJlID0gdGlsZS5sYXllcnNbbGF5ZXIubmFtZV0uZmVhdHVyZXNbZl07XG4gICAgICAgICAgICAgICAgc3R5bGUgPSBWZWN0b3JSZW5kZXJlci5wYXJzZVN0eWxlRm9yRmVhdHVyZShmZWF0dXJlLCBzdHlsZXNbbGF5ZXIubmFtZV0sIHRpbGUpO1xuICAgICAgICAgICAgICAgIHogPSBHTFJlbmRlcmVyLmNhbGN1bGF0ZVoobGF5ZXIsIHRpbGUpICsgc3R5bGUuejtcblxuICAgICAgICAgICAgICAgIC8vIFNraXAgZmVhdHVyZT9cbiAgICAgICAgICAgICAgICBpZiAoc3R5bGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBGaXJzdCBmZWF0dXJlIGluIHRoaXMgcmVuZGVyIG1vZGU/XG4gICAgICAgICAgICAgICAgbW9kZSA9IHN0eWxlLnJlbmRlcl9tb2RlO1xuICAgICAgICAgICAgICAgIGlmICh2ZXJ0ZXhfZGF0YVttb2RlXSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRleF9kYXRhW21vZGVdID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gREVCVUdHSU5HIGxpbmUvdGlsZSBpbnRlcnNlY3Rpb25zIHJldHVybmVkIGFzIHBvaW50c1xuICAgICAgICAgICAgICAgIC8vICNtYXB6ZW4sNDAuNzQ3MzMwMTE1ODk2MTcsLTczLjk3NTM1MTQ1MjgyNzQ3LDE3XG4gICAgICAgICAgICAgICAgLy8gaWYgKGZlYXR1cmUuaWQgPT0gMTU3OTY0ODEzICYmIGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHN0eWxlLmNvbG9yID0gWzEsIDEsIDBdO1xuICAgICAgICAgICAgICAgIC8vICAgICBzdHlsZS5zaXplID0gU3R5bGUud2lkdGgucGl4ZWxzKDEwLCB0aWxlKTtcbiAgICAgICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgICAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgICAgICAgICAgICAgbG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogYWRkIG1hdGVyaWFsIGluZm8sIGV0Yy5cbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHN0eWxlLm91dGxpbmUuY29sb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG91dGxpbmVfdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlLm91dGxpbmUuY29sb3JbMF0sIHN0eWxlLm91dGxpbmUuY29sb3JbMV0sIHN0eWxlLm91dGxpbmUuY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBsbiAtIDAuNSAvLyBvdXRsaW5lcyBzaXQgYmV0d2VlbiBsYXllcnMsIHVuZGVybmVhdGggY3VycmVudCBsYXllciBidXQgYWJvdmUgdGhlIG9uZSBiZWxvd1xuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBwb2ludHMgPSBudWxsLFxuICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHBvbHlnb25zID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIGlmIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvbHlnb25zID0gW2ZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9seWdvbnMgPSBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzID0gW2ZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ011bHRpTGluZVN0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXMgPSBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICBwb2ludHMgPSBbZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2ludCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRzID0gZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocG9seWdvbnMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBFeHRydWRlZCBwb2x5Z29ucyAoZS5nLiAzRCBidWlsZGluZ3MpXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHlsZS5leHRydWRlICYmIHN0eWxlLmhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgR0xCdWlsZGVycy5idWlsZEV4dHJ1ZGVkUG9seWdvbnMocG9seWdvbnMsIHosIHN0eWxlLmhlaWdodCwgc3R5bGUubWluX2hlaWdodCwgdmVydGV4X2RhdGFbbW9kZV0sIHsgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50cyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBSZWd1bGFyIHBvbHlnb25zXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgR0xCdWlsZGVycy5idWlsZFBvbHlnb25zKHBvbHlnb25zLCB6LCB2ZXJ0ZXhfZGF0YVttb2RlXSwgeyB2ZXJ0ZXhfY29uc3RhbnRzOiB2ZXJ0ZXhfY29uc3RhbnRzIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB2YXIgcG9seWdvbl92ZXJ0ZXhfY29uc3RhbnRzID0gW3osIDAsIDAsIDFdLmNvbmNhdCh2ZXJ0ZXhfY29uc3RhbnRzKTsgLy8gdXB3YXJkcy1mYWNpbmcgbm9ybWFsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMyKFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIHBvbHlnb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIGZ1bmN0aW9uICh2ZXJ0aWNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBHTC5hZGRWZXJ0aWNlcyh2ZXJ0aWNlcy5wb3NpdGlvbnMsIHZlcnRleF9kYXRhW21vZGVdLCBwb2x5Z29uX3ZlcnRleF9jb25zdGFudHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBQb2x5Z29uIG91dGxpbmVzXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yICYmIHN0eWxlLm91dGxpbmUud2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIG1wYz0wOyBtcGMgPCBwb2x5Z29ucy5sZW5ndGg7IG1wYysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR0xCdWlsZGVycy5idWlsZFBvbHlsaW5lcyhwb2x5Z29uc1ttcGNdLCBHTFJlbmRlcmVyLmNhbGN1bGF0ZVoobGF5ZXIsIHRpbGUsIC0wLjUpLCBzdHlsZS5vdXRsaW5lLndpZHRoLCB2ZXJ0ZXhfZGF0YVttb2RlXSwgeyBjbG9zZWRfcG9seWdvbjogdHJ1ZSwgcmVtb3ZlX3RpbGVfZWRnZXM6IHRydWUsIHZlcnRleF9jb25zdGFudHM6IG91dGxpbmVfdmVydGV4X2NvbnN0YW50cyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsaW5lcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMobGluZXMsIHosIHN0eWxlLndpZHRoLCB2ZXJ0ZXhfZGF0YVttb2RlXSwgeyB2ZXJ0ZXhfY29uc3RhbnRzOiB2ZXJ0ZXhfY29uc3RhbnRzIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIExpbmUgb3V0bGluZXNcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0eWxlLm91dGxpbmUuY29sb3IgJiYgc3R5bGUub3V0bGluZS53aWR0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgR0xCdWlsZGVycy5idWlsZFBvbHlsaW5lcyhsaW5lcywgR0xSZW5kZXJlci5jYWxjdWxhdGVaKGxheWVyLCB0aWxlLCAtMC41KSwgc3R5bGUud2lkdGggKyAyICogc3R5bGUub3V0bGluZS53aWR0aCwgdmVydGV4X2RhdGFbbW9kZV0sIHsgdmVydGV4X2NvbnN0YW50czogb3V0bGluZV92ZXJ0ZXhfY29uc3RhbnRzIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBvaW50cyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGZlYXR1cmUpKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogYWRkaW5nIHRvIHogdG8gZXhwZXJpbWVudCB3aXRoIFwiZmxvYXRpbmdcIiBQT0lzXG4gICAgICAgICAgICAgICAgICAgIHZhciBwb2ludF92ZXJ0ZXhfY29uc3RhbnRzID0gW3ogKyAxLCAwLCAwLCAxXS5jb25jYXQodmVydGV4X2NvbnN0YW50cyk7IC8vIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgICAgICAgICAgICAgICAgICBHTEJ1aWxkZXJzLmJ1aWxkUXVhZHMoXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludHMsIHN0eWxlLnNpemUgKiAyLCBzdHlsZS5zaXplICogMixcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICh2ZXJ0aWNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2cyA9IHZlcnRpY2VzLnBvc2l0aW9ucztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsdGVybmF0ZSB2ZXJ0ZXggbGF5b3V0IGZvciAncG9pbnRzJyBzaGFkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kZSA9PSAncG9pbnRzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludF92ZXJ0ZXhfY29uc3RhbnRzID0gdmVydGV4X2NvbnN0YW50cztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciB2IGluIHZlcnRpY2VzLnBvc2l0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdnNbdl0gPSB2ZXJ0aWNlcy5wb3NpdGlvbnNbdl0uY29uY2F0KHorIDEsIHZlcnRpY2VzLnRleGNvb3Jkc1t2XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHTC5hZGRWZXJ0aWNlcyh2ZXJ0aWNlcy5wb3NpdGlvbnMsIHZlcnRleF9kYXRhW21vZGVdLCBwb2ludF92ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTC5hZGRWZXJ0aWNlcyh2cywgdmVydGV4X2RhdGFbbW9kZV0sIHBvaW50X3ZlcnRleF9jb25zdGFudHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGV4Y29vcmRzOiAobW9kZSA9PSAncG9pbnRzJykgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRpbGUuZGVidWcuZmVhdHVyZXMrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRpbGUudmVydGV4X2RhdGEgPSB7fTtcbiAgICBmb3IgKHZhciBzIGluIHZlcnRleF9kYXRhKSB7XG4gICAgICAgIHRpbGUudmVydGV4X2RhdGFbc10gPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRleF9kYXRhW3NdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGlsZTtcbn07XG5cbi8vIENhbGxlZCBvbiBtYWluIHRocmVhZCB3aGVuIGEgd2ViIHdvcmtlciBjb21wbGV0ZXMgcHJvY2Vzc2luZyBmb3IgYSBzaW5nbGUgdGlsZVxuR0xSZW5kZXJlci5wcm90b3R5cGUuX3RpbGVXb3JrZXJDb21wbGV0ZWQgPSBmdW5jdGlvbiAodGlsZSlcbntcbiAgICB2YXIgdmVydGV4X2RhdGEgPSB0aWxlLnZlcnRleF9kYXRhO1xuXG4gICAgLy8gQ2xlYW51cCBleGlzdGluZyBHTCBnZW9tZXRyeSBvYmplY3RzXG4gICAgdGhpcy5mcmVlVGlsZVJlc291cmNlcyh0aWxlKTtcbiAgICB0aWxlLmdsX2dlb21ldHJ5ID0ge307XG5cbiAgICAvLyBDcmVhdGUgR0wgZ2VvbWV0cnkgb2JqZWN0c1xuICAgIGZvciAodmFyIHMgaW4gdmVydGV4X2RhdGEpIHtcbiAgICAgICAgdGlsZS5nbF9nZW9tZXRyeVtzXSA9IHRoaXMucmVuZGVyX21vZGVzW3NdLm1ha2VHTEdlb21ldHJ5KHZlcnRleF9kYXRhW3NdKTtcbiAgICB9XG5cbiAgICB0aWxlLmRlYnVnLmdlb21ldHJpZXMgPSAwO1xuICAgIHRpbGUuZGVidWcuYnVmZmVyX3NpemUgPSAwO1xuICAgIGZvciAodmFyIHAgaW4gdGlsZS5nbF9nZW9tZXRyeSkge1xuICAgICAgICB0aWxlLmRlYnVnLmdlb21ldHJpZXMgKz0gdGlsZS5nbF9nZW9tZXRyeVtwXS5nZW9tZXRyeV9jb3VudDtcbiAgICAgICAgdGlsZS5kZWJ1Zy5idWZmZXJfc2l6ZSArPSB0aWxlLmdsX2dlb21ldHJ5W3BdLnZlcnRleF9kYXRhLmJ5dGVMZW5ndGg7XG4gICAgfVxuXG4gICAgdGlsZS5kZWJ1Zy5nZW9tX3JhdGlvID0gKHRpbGUuZGVidWcuZ2VvbWV0cmllcyAvIHRpbGUuZGVidWcuZmVhdHVyZXMpLnRvRml4ZWQoMSk7XG5cbiAgICAvLyBTZWxlY3Rpb24gLSBleHBlcmltZW50YWwvZnV0dXJlXG4gICAgLy8gdmFyIGdsX3JlbmRlcmVyID0gdGhpcztcbiAgICAvLyB2YXIgcGl4ZWwgPSBuZXcgVWludDhBcnJheSg0KTtcbiAgICAvLyB0aWxlRGl2Lm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy8gICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50Lm9mZnNldFggKyAnLCAnICsgZXZlbnQub2Zmc2V0WSArICcgfCAnICsgcGFyc2VJbnQodGlsZURpdi5zdHlsZS5sZWZ0KSArICcsICcgKyBwYXJzZUludFxuICAgIC8vICAgICB2YXIgcCA9IFBvaW50KFxuICAgIC8vICAgICAgICAgZXZlbnQub2Zmc2V0WCArIHBhcnNlSW50KHRpbGVEaXYuc3R5bGUubGVmdCksXG4gICAgLy8gICAgICAgICBldmVudC5vZmZzZXRZICsgcGFyc2VJbnQodGlsZURpdi5zdHlsZS50b3ApXG4gICAgLy8gICAgICk7XG4gICAgLy8gICAgIGdsX3JlbmRlcmVyLmdsLnJlYWRQaXhlbHMocC54LCBwLnksIDEsIDEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIHBpeGVsKTtcbiAgICAvLyAgICAgY29uc29sZS5sb2cocC54ICsgJywgJyArIHAueSArICc6ICgnICsgcGl4ZWxbMF0gKyAnLCAnICsgcGl4ZWxbMV0gKyAnLCAnICsgcGl4ZWxbMl0gKyAnLCAnICsgcGl4ZWxbM10gKyAnKScpXG4gICAgLy8gfTtcblxuICAgIGRlbGV0ZSB0aWxlLnZlcnRleF9kYXRhOyAvLyBUT0RPOiBtaWdodCB3YW50IHRvIHByZXNlcnZlIHRoaXMgZm9yIHJlYnVpbGRpbmcgZ2VvbWV0cmllcyB3aGVuIHN0eWxlcy9ldGMuIGNoYW5nZT9cbn07XG5cbkdMUmVuZGVyZXIucHJvdG90eXBlLnJlbW92ZVRpbGUgPSBmdW5jdGlvbiBHTFJlbmRlcmVyUmVtb3ZlVGlsZSAoa2V5KVxue1xuICAgIGlmICh0aGlzLm1hcF96b29taW5nID09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuOyAvLyBzaG9ydCBjaXJjdWl0IHRpbGUgcmVtb3ZhbCwgR0wgcmVuZGVyZXIgd2lsbCBzd2VlcCBvdXQgdGlsZXMgYnkgem9vbSBsZXZlbCB3aGVuIHpvb20gZW5kc1xuICAgIH1cblxuICAgIHRoaXMuZnJlZVRpbGVSZXNvdXJjZXModGhpcy50aWxlc1trZXldKTtcbiAgICBWZWN0b3JSZW5kZXJlci5wcm90b3R5cGUucmVtb3ZlVGlsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuLy8gRnJlZSBhbnkgR0wgLyBvd25lZCByZXNvdXJjZXNcbkdMUmVuZGVyZXIucHJvdG90eXBlLmZyZWVUaWxlUmVzb3VyY2VzID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgaWYgKHRpbGUgIT0gbnVsbCAmJiB0aWxlLmdsX2dlb21ldHJ5ICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgcCBpbiB0aWxlLmdsX2dlb21ldHJ5KSB7XG4gICAgICAgICAgICB0aWxlLmdsX2dlb21ldHJ5W3BdLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICB0aWxlLmdsX2dlb21ldHJ5ID0gbnVsbDtcbiAgICB9XG59O1xuXG5HTFJlbmRlcmVyLnByb3RvdHlwZS5wcmVzZXJ2ZV90aWxlc193aXRoaW5fem9vbSA9IDI7XG5HTFJlbmRlcmVyLnByb3RvdHlwZS5zZXRab29tID0gZnVuY3Rpb24gKHpvb20pXG57XG4gICAgLy8gU2NoZWR1bGUgR0wgdGlsZXMgZm9yIHJlbW92YWwgb24gem9vbVxuICAgIGNvbnNvbGUubG9nKFwicmVuZGVyZXIubWFwX2xhc3Rfem9vbTogXCIgKyB0aGlzLm1hcF9sYXN0X3pvb20pO1xuXG4gICAgdGhpcy5tYXBfem9vbWluZyA9IGZhbHNlO1xuICAgIHRoaXMuem9vbSA9IHpvb207XG4gICAgdmFyIGJlbG93ID0gdGhpcy56b29tO1xuICAgIHZhciBhYm92ZSA9IHRoaXMuem9vbTtcbiAgICBpZiAoTWF0aC5hYnModGhpcy56b29tIC0gdGhpcy5tYXBfbGFzdF96b29tKSA8PSB0aGlzLnByZXNlcnZlX3RpbGVzX3dpdGhpbl96b29tKSB7XG4gICAgICAgIGlmICh0aGlzLnpvb20gPiB0aGlzLm1hcF9sYXN0X3pvb20pIHtcbiAgICAgICAgICAgIGJlbG93ID0gdGhpcy56b29tIC0gdGhpcy5wcmVzZXJ2ZV90aWxlc193aXRoaW5fem9vbTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFib3ZlID0gdGhpcy56b29tICsgdGhpcy5wcmVzZXJ2ZV90aWxlc193aXRoaW5fem9vbTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlbW92ZVRpbGVzT3V0c2lkZVpvb21SYW5nZShiZWxvdywgYWJvdmUpO1xuICAgIHRoaXMubWFwX2xhc3Rfem9vbSA9IHRoaXMuem9vbTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTsgLy8gY2FsbGluZyBiZWNhdXNlIHRoaXMgaXMgYSBmdWxsIG92ZXJyaWRlIG9mIHRoZSBwYXJlbnQgY2xhc3Ncbn07XG5cbkdMUmVuZGVyZXIucHJvdG90eXBlLnJlbW92ZVRpbGVzT3V0c2lkZVpvb21SYW5nZSA9IGZ1bmN0aW9uIChiZWxvdywgYWJvdmUpXG57XG4gICAgYmVsb3cgPSBNYXRoLm1pbihiZWxvdywgdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSB8fCBiZWxvdyk7XG4gICAgYWJvdmUgPSBNYXRoLm1pbihhYm92ZSwgdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSB8fCBhYm92ZSk7XG5cbiAgICBjb25zb2xlLmxvZyhcInJlbW92ZVRpbGVzT3V0c2lkZVpvb21SYW5nZSBbXCIgKyBiZWxvdyArIFwiLCBcIiArIGFib3ZlICsgXCJdKVwiKTtcbiAgICB2YXIgcmVtb3ZlX3RpbGVzID0gW107XG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIHZhciB0aWxlID0gdGhpcy50aWxlc1t0XTtcbiAgICAgICAgaWYgKHRpbGUuY29vcmRzLnogPCBiZWxvdyB8fCB0aWxlLmNvb3Jkcy56ID4gYWJvdmUpIHtcbiAgICAgICAgICAgIHJlbW92ZV90aWxlcy5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIHI9MDsgciA8IHJlbW92ZV90aWxlcy5sZW5ndGg7IHIrKykge1xuICAgICAgICB2YXIga2V5ID0gcmVtb3ZlX3RpbGVzW3JdO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlbW92ZWQgXCIgKyBrZXkgKyBcIiAob3V0c2lkZSByYW5nZSBbXCIgKyBiZWxvdyArIFwiLCBcIiArIGFib3ZlICsgXCJdKVwiKTtcbiAgICAgICAgdGhpcy5yZW1vdmVUaWxlKGtleSk7XG4gICAgfVxufTtcblxuLy8gT3ZlcnJpZGVzIGJhc2UgY2xhc3MgbWV0aG9kIChhIG5vIG9wKVxuR0xSZW5kZXJlci5wcm90b3R5cGUucmVzaXplTWFwID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpXG57XG4gICAgVmVjdG9yUmVuZGVyZXIucHJvdG90eXBlLnJlc2l6ZU1hcC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdGhpcy5jc3Nfc2l6ZSA9IHsgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCB9O1xuICAgIHRoaXMuZGV2aWNlX3NpemUgPSB7IHdpZHRoOiBNYXRoLnJvdW5kKHRoaXMuY3NzX3NpemUud2lkdGggKiB0aGlzLmRldmljZV9waXhlbF9yYXRpbyksIGhlaWdodDogTWF0aC5yb3VuZCh0aGlzLmNzc19zaXplLmhlaWdodCAqIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvKSB9O1xuXG4gICAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSB0aGlzLmNzc19zaXplLndpZHRoICsgJ3B4JztcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSB0aGlzLmNzc19zaXplLmhlaWdodCArICdweCc7XG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmRldmljZV9zaXplLndpZHRoO1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0O1xuICAgIHRoaXMuZ2wudmlld3BvcnQoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG59O1xuXG5HTFJlbmRlcmVyLnByb3RvdHlwZS5fcmVuZGVyID0gZnVuY3Rpb24gR0xSZW5kZXJlclJlbmRlciAoKVxue1xuICAgIHZhciBnbCA9IHRoaXMuZ2w7XG5cbiAgICB0aGlzLmlucHV0KCk7XG5cbiAgICAvLyBSZXNldCBmcmFtZSBzdGF0ZVxuICAgIGdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKTtcbiAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG4gICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgIGdsLmRlcHRoRnVuYyhnbC5MRVNTKTtcbiAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICBnbC5jdWxsRmFjZShnbC5CQUNLKTtcblxuICAgIC8vIFJlbmRlciB0aWxlcyBncm91cGVkIGJ5IHJlbmRlcmcgbW9kZSAoR0wgcHJvZ3JhbSlcbiAgICB2YXIgcmVuZGVyX2NvdW50ID0gMDtcbiAgICBmb3IgKHZhciBtb2RlIGluIHRoaXMucmVuZGVyX21vZGVzKSB7XG4gICAgICAgIHZhciBnbF9wcm9ncmFtID0gdGhpcy5yZW5kZXJfbW9kZXNbbW9kZV0uZ2xfcHJvZ3JhbTtcblxuICAgICAgICBnbC51c2VQcm9ncmFtKGdsX3Byb2dyYW0ucHJvZ3JhbSk7XG5cbiAgICAgICAgLy8gVE9ETzogc2V0IHRoZXNlIG9uY2UgcGVyIHByb2dyYW0sIGRvbid0IHNldCB3aGVuIHRoZXkgaGF2ZW4ndCBjaGFuZ2VkXG4gICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9yZXNvbHV0aW9uJywgdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCwgdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQpO1xuICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfYXNwZWN0JywgdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCAvIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0LCAxLjApO1xuICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfdGltZScsICgoK25ldyBEYXRlKCkpIC0gdGhpcy5zdGFydF90aW1lKSAvIDEwMDApO1xuXG4gICAgICAgIHZhciBjZW50ZXIgPSBHZW8ubGF0TG5nVG9NZXRlcnMoUG9pbnQodGhpcy5jZW50ZXIubG5nLCB0aGlzLmNlbnRlci5sYXQpKTtcbiAgICAgICAgLy8gZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X21hcF9jZW50ZXInLCBjZW50ZXIueCwgY2VudGVyLnkpO1xuICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbWFwX3pvb20nLCB0aGlzLnpvb20pOyAvLyBNYXRoLmZsb29yKHRoaXMuem9vbSkgKyAoTWF0aC5sb2coKHRoaXMuem9vbSAlIDEpICsgMSkgLyBNYXRoLkxOMiAvLyBzY2FsZSBmcmFjdGlvbmFsIHpvb20gYnkgbG9nXG4gICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9udW1fbGF5ZXJzJywgdGhpcy5sYXllcnMubGVuZ3RoKTtcblxuICAgICAgICB2YXIgbWV0ZXJzX3Blcl9waXhlbCA9IEdlby5taW5fem9vbV9tZXRlcnNfcGVyX3BpeGVsIC8gTWF0aC5wb3coMiwgdGhpcy56b29tKTtcbiAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X21ldGVyc19wZXJfcGl4ZWwnLCBtZXRlcnNfcGVyX3BpeGVsKTtcblxuICAgICAgICB2YXIgbWV0ZXJfem9vbSA9IFBvaW50KHRoaXMuY3NzX3NpemUud2lkdGggLyAyICogbWV0ZXJzX3Blcl9waXhlbCwgdGhpcy5jc3Nfc2l6ZS5oZWlnaHQgLyAyICogbWV0ZXJzX3Blcl9waXhlbCk7XG4gICAgICAgIC8vIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9tZXRlcl96b29tJywgbWV0ZXJfem9vbS54LCBtZXRlcl96b29tLnkpO1xuXG4gICAgICAgIC8vIE1hdHJpeCB0cmFuc2Zvcm1zXG4gICAgICAgIHZhciB0aWxlX3ZpZXdfbWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAgICAgICAgdmFyIHRpbGVfd29ybGRfbWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAgICAgICAgdmFyIG1ldGVyX3ZpZXdfbWF0ID0gbWF0NC5jcmVhdGUoKTtcblxuICAgICAgICAvLyBDb252ZXJ0IG1lcmNhdG9yIG1ldGVycyB0byBzY3JlZW4gc3BhY2VcbiAgICAgICAgbWF0NC5zY2FsZShtZXRlcl92aWV3X21hdCwgbWV0ZXJfdmlld19tYXQsIHZlYzMuZnJvbVZhbHVlcygxIC8gbWV0ZXJfem9vbS54LCAxIC8gbWV0ZXJfem9vbS55LCAxIC8gbWV0ZXJfem9vbS55KSk7XG4gICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfbWV0ZXJfdmlldycsIGdsLkZBTFNFLCBtZXRlcl92aWV3X21hdCk7XG5cbiAgICAgICAgLy8gVE9ETzogbWFrZSBhIGxpc3Qgb2YgcmVuZGVyYWJsZSB0aWxlcyBvbmNlIHBlciBmcmFtZSwgb3V0c2lkZSB0aGlzIGxvb3BcbiAgICAgICAgLy8gUmVuZGVyIHRpbGUgR0wgZ2VvbWV0cmllc1xuICAgICAgICB2YXIgY2FwcGVkX3pvb20gPSBNYXRoLm1pbih+fnRoaXMuem9vbSwgdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSB8fCB+fnRoaXMuem9vbSk7XG4gICAgICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW3RdO1xuICAgICAgICAgICAgaWYgKHRpbGUubG9hZGVkID09IHRydWUgJiZcbiAgICAgICAgICAgICAgICB0aWxlLnZpc2libGUgPT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgIE1hdGgubWluKHRpbGUuY29vcmRzLnosIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgdGlsZS5jb29yZHMueikgPT0gY2FwcGVkX3pvb20pIHtcblxuICAgICAgICAgICAgICAgIGlmICh0aWxlLmdsX2dlb21ldHJ5W21vZGVdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X3RpbGVfbWluJywgdGlsZS5taW4ueCwgdGlsZS5taW4ueSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV90aWxlX21heCcsIHRpbGUubWF4LngsIHRpbGUubWF4LnkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbGUgdmlldyBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHZpZXcgc3BhY2UgKG1ldGVycywgcmVsYXRpdmUgdG8gY2FtZXJhKVxuICAgICAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfdmlld19tYXQpO1xuICAgICAgICAgICAgICAgICAgICBtYXQ0LnRyYW5zbGF0ZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5taW4ueCAtIGNlbnRlci54LCB0aWxlLm1pbi55IC0gY2VudGVyLnksIDApKTsgLy8gYWRqdXN0IGZvciB0aWxlIG9yaWdpbiAmIG1hcCBjZW50ZXJcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXMoKHRpbGUubWF4LnggLSB0aWxlLm1pbi54KSAvIFZlY3RvclJlbmRlcmVyLnRpbGVfc2NhbGUsIC0xICogKHRpbGUubWF4LnkgLSB0aWxlLm1pbi55KSAvIFZlY3RvclJlbmRlcmVyLnRpbGVfc2NhbGUsIDEpKTsgLy8gc2NhbGUgdGlsZSBsb2NhbCBjb29yZHMgdG8gbWV0ZXJzXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfdGlsZV92aWV3JywgZ2wuRkFMU0UsIHRpbGVfdmlld19tYXQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbGUgd29ybGQgbWF0cml4IC0gdHJhbnNmb3JtIHRpbGUgc3BhY2UgaW50byB3b3JsZCBzcGFjZSAobWV0ZXJzLCBhYnNvbHV0ZSBtZXJjYXRvciBwb3NpdGlvbilcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5pZGVudGl0eSh0aWxlX3dvcmxkX21hdCk7XG4gICAgICAgICAgICAgICAgICAgIG1hdDQudHJhbnNsYXRlKHRpbGVfd29ybGRfbWF0LCB0aWxlX3dvcmxkX21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUubWluLngsIHRpbGUubWluLnksIDApKTtcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3dvcmxkX21hdCwgdGlsZV93b3JsZF9tYXQsIHZlYzMuZnJvbVZhbHVlcygodGlsZS5tYXgueCAtIHRpbGUubWluLngpIC8gVmVjdG9yUmVuZGVyZXIudGlsZV9zY2FsZSwgLTEgKiAodGlsZS5tYXgueSAtIHRpbGUubWluLnkpIC8gVmVjdG9yUmVuZGVyZXIudGlsZV9zY2FsZSwgMSkpOyAvLyBzY2FsZSB0aWxlIGxvY2FsIGNvb3JkcyB0byBtZXRlcnNcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCdNYXRyaXg0ZnYnLCAndV90aWxlX3dvcmxkJywgZ2wuRkFMU0UsIHRpbGVfd29ybGRfbWF0KTtcblxuXG4gICAgICAgICAgICAgICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0ucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcl9jb3VudCArPSB0aWxlLmdsX2dlb21ldHJ5W21vZGVdLmdlb21ldHJ5X2NvdW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyZW5kZXJfY291bnQgIT0gdGhpcy5sYXN0X3JlbmRlcl9jb3VudCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlbmRlcmVkIFwiICsgcmVuZGVyX2NvdW50ICsgXCIgcHJpbWl0aXZlc1wiKTtcbiAgICB9XG4gICAgdGhpcy5sYXN0X3JlbmRlcl9jb3VudCA9IHJlbmRlcl9jb3VudDtcblxuICAgIGlmICh0aGlzLmNvbnRpbnVvdXNfYW5pbWF0aW9uID09IHRydWUpIHtcbiAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG4vLyBTdW0gb2YgYSBkZWJ1ZyBwcm9wZXJ0eSBhY3Jvc3MgdGlsZXNcbkdMUmVuZGVyZXIucHJvdG90eXBlLmdldERlYnVnU3VtID0gZnVuY3Rpb24gKHByb3AsIGZpbHRlcilcbntcbiAgICB2YXIgc3VtID0gMDtcbiAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgaWYgKHRoaXMudGlsZXNbdF0uZGVidWdbcHJvcF0gIT0gbnVsbCAmJiAodHlwZW9mIGZpbHRlciAhPSAnZnVuY3Rpb24nIHx8IGZpbHRlcih0aGlzLnRpbGVzW3RdKSA9PSB0cnVlKSkge1xuICAgICAgICAgICAgc3VtICs9IHRoaXMudGlsZXNbdF0uZGVidWdbcHJvcF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN1bTtcbn07XG5cbi8vIEF2ZXJhZ2Ugb2YgYSBkZWJ1ZyBwcm9wZXJ0eSBhY3Jvc3MgdGlsZXNcbkdMUmVuZGVyZXIucHJvdG90eXBlLmdldERlYnVnQXZlcmFnZSA9IGZ1bmN0aW9uIChwcm9wLCBmaWx0ZXIpXG57XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGVidWdTdW0ocHJvcCwgZmlsdGVyKSAvIE9iamVjdC5rZXlzKHRoaXMudGlsZXMpLmxlbmd0aDtcbn07XG5cbi8vIFVzZXIgaW5wdXRcbi8vIFRPRE86IHJlc3RvcmUgZnJhY3Rpb25hbCB6b29tIHN1cHBvcnQgb25jZSBsZWFmbGV0IGFuaW1hdGlvbiByZWZhY3RvciBwdWxsIHJlcXVlc3QgaXMgbWVyZ2VkXG5cbkdMUmVuZGVyZXIucHJvdG90eXBlLmluaXRJbnB1dEhhbmRsZXJzID0gZnVuY3Rpb24gR0xSZW5kZXJlckluaXRJbnB1dEhhbmRsZXJzICgpXG57XG4gICAgdmFyIGdsX3JlbmRlcmVyID0gdGhpcztcbiAgICBnbF9yZW5kZXJlci5rZXkgPSBudWxsO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PSAzNykge1xuICAgICAgICAgICAgZ2xfcmVuZGVyZXIua2V5ID0gJ2xlZnQnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gMzkpIHtcbiAgICAgICAgICAgIGdsX3JlbmRlcmVyLmtleSA9ICdyaWdodCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PSAzOCkge1xuICAgICAgICAgICAgZ2xfcmVuZGVyZXIua2V5ID0gJ3VwJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDQwKSB7XG4gICAgICAgICAgICBnbF9yZW5kZXJlci5rZXkgPSAnZG93bic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PSA4MykgeyAvLyBzXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlbG9hZGluZyBzaGFkZXJzXCIpO1xuICAgICAgICAgICAgZm9yICh2YXIgbW9kZSBpbiB0aGlzLnJlbmRlcl9tb2Rlcykge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyX21vZGVzW21vZGVdLmdsX3Byb2dyYW0uY29tcGlsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ2xfcmVuZGVyZXIuZGlydHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBnbF9yZW5kZXJlci5rZXkgPSBudWxsO1xuICAgIH0pO1xufTtcblxuR0xSZW5kZXJlci5wcm90b3R5cGUuaW5wdXQgPSBmdW5jdGlvbiBHTFJlbmRlcmVySW5wdXQgKClcbntcbiAgICAvLyAvLyBGcmFjdGlvbmFsIHpvb20gc2NhbGluZ1xuICAgIC8vIGlmICh0aGlzLmtleSA9PSAndXAnKSB7XG4gICAgLy8gICAgIHRoaXMuc2V0Wm9vbSh0aGlzLnpvb20gKyB0aGlzLnpvb21fc3RlcCk7XG4gICAgLy8gfVxuICAgIC8vIGVsc2UgaWYgKHRoaXMua2V5ID09ICdkb3duJykge1xuICAgIC8vICAgICB0aGlzLnNldFpvb20odGhpcy56b29tIC0gdGhpcy56b29tX3N0ZXApO1xuICAgIC8vIH1cbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gR0xSZW5kZXJlcjtcbn1cbiIsIi8vIEdlbmVyYXRlZCBmcm9tIEdMU0wgZmlsZXMsIGRvbid0IGVkaXQhXG52YXIgc2hhZGVyX3NvdXJjZXMgPSB7fTtcblxuc2hhZGVyX3NvdXJjZXNbJ3BvaW50X2ZyYWdtZW50J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3Jlc29sdXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMiB2X3RleGNvb3JkO1xcblwiICtcblwidm9pZCBtYWluKHZvaWQpIHtcXG5cIiArXG5cIiAgdmVjMyBjb2xvciA9IHZfY29sb3I7XFxuXCIgK1xuXCIgIGZsb2F0IGxlbiA9IGxlbmd0aCh2X3RleGNvb3JkKTtcXG5cIiArXG5cIiAgaWYobGVuID4gMS4pIHtcXG5cIiArXG5cIiAgICBkaXNjYXJkO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIGNvbG9yICo9ICgxLiAtIHNtb290aHN0ZXAoLjI1LCAxLiwgbGVuKSkgKyAwLjU7XFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKEVGRkVDVF9TQ1JFRU5fQ09MT1IpXFxuXCIgK1xuXCIgIGNvbG9yICs9IHZlYzMoZ2xfRnJhZ0Nvb3JkLnggLyB1X3Jlc29sdXRpb24ueCwgMC4wLCBnbF9GcmFnQ29vcmQueSAvIHVfcmVzb2x1dGlvbi55KTtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IsIDEuKTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1sncG9pbnRfdmVydGV4J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X3RpbGVfdmlldztcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X21ldGVyX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbnVtX2xheWVycztcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfcG9zaXRpb247XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMiBhX3RleGNvb3JkO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9jb2xvcjtcXG5cIiArXG5cImF0dHJpYnV0ZSBmbG9hdCBhX2xheWVyO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzIgdl90ZXhjb29yZDtcXG5cIiArXG5cImZsb2F0IGFfeF9jYWxjdWxhdGVaKGZsb2F0IHosIGZsb2F0IGxheWVyLCBjb25zdCBmbG9hdCBudW1fbGF5ZXJzLCBjb25zdCBmbG9hdCB6X2xheWVyX3NjYWxlKSB7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXJfcmFuZ2UgPSAobnVtX2xheWVycyArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXIgPSAobGF5ZXIgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICB6ID0gel9sYXllciArIGNsYW1wKHosIDAuLCB6X2xheWVyX3NjYWxlKTtcXG5cIiArXG5cIiAgeiA9ICh6X2xheWVyX3JhbmdlIC0geikgLyB6X2xheWVyX3JhbmdlO1xcblwiICtcblwiICByZXR1cm4gejtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZvaWQgbWFpbigpIHtcXG5cIiArXG5cIiAgdmVjNCBwb3NpdGlvbiA9IHVfbWV0ZXJfdmlldyAqIHVfdGlsZV92aWV3ICogdmVjNChhX3Bvc2l0aW9uLCAxLik7XFxuXCIgK1xuXCIgIHZfY29sb3IgPSBhX2NvbG9yO1xcblwiICtcblwiICB2X3RleGNvb3JkID0gYV90ZXhjb29yZDtcXG5cIiArXG5cIiAgcG9zaXRpb24ueiA9IGFfeF9jYWxjdWxhdGVaKHBvc2l0aW9uLnosIGFfbGF5ZXIsIHVfbnVtX2xheWVycywgMjU2Lik7XFxuXCIgK1xuXCIgIGdsX1Bvc2l0aW9uID0gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fZnJhZ21lbnQnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfcmVzb2x1dGlvbjtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X2FzcGVjdDtcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X21ldGVyX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWV0ZXJzX3Blcl9waXhlbDtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV90aW1lO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCIjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X25vcm1hbDtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgZGVmaW5lZChFRkZFQ1RfTk9JU0VfVEVYVFVSRSlcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWM0IHZfcG9zaXRpb25fd29ybGQ7XFxuXCIgK1xuXCJ2ZWMzIGFfeF9tb2QyODkodmVjMyB4KSB7XFxuXCIgK1xuXCIgIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWM0IGFfeF9tb2QyODkodmVjNCB4KSB7XFxuXCIgK1xuXCIgIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWM0IGFfeF9wZXJtdXRlKHZlYzQgeCkge1xcblwiICtcblwiICByZXR1cm4gYV94X21vZDI4OSgoKHggKiAzNC4wKSArIDEuMCkgKiB4KTtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzQgYV94X3RheWxvckludlNxcnQodmVjNCByKSB7XFxuXCIgK1xuXCIgIHJldHVybiAxLjc5Mjg0MjkxNDAwMTU5IC0gMC44NTM3MzQ3MjA5NTMxNCAqIHI7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGFfeF9mYWRlKHZlYzMgdCkge1xcblwiICtcblwiICByZXR1cm4gdCAqIHQgKiB0ICogKHQgKiAodCAqIDYuMCAtIDE1LjApICsgMTAuMCk7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJmbG9hdCBhX3hfY25vaXNlKHZlYzMgUCkge1xcblwiICtcblwiICB2ZWMzIFBpMCA9IGZsb29yKFApO1xcblwiICtcblwiICB2ZWMzIFBpMSA9IFBpMCArIHZlYzMoMS4wKTtcXG5cIiArXG5cIiAgUGkwID0gYV94X21vZDI4OShQaTApO1xcblwiICtcblwiICBQaTEgPSBhX3hfbW9kMjg5KFBpMSk7XFxuXCIgK1xuXCIgIHZlYzMgUGYwID0gZnJhY3QoUCk7XFxuXCIgK1xuXCIgIHZlYzMgUGYxID0gUGYwIC0gdmVjMygxLjApO1xcblwiICtcblwiICB2ZWM0IGl4ID0gdmVjNChQaTAueCwgUGkxLngsIFBpMC54LCBQaTEueCk7XFxuXCIgK1xuXCIgIHZlYzQgaXkgPSB2ZWM0KFBpMC55eSwgUGkxLnl5KTtcXG5cIiArXG5cIiAgdmVjNCBpejAgPSBQaTAuenp6ejtcXG5cIiArXG5cIiAgdmVjNCBpejEgPSBQaTEuenp6ejtcXG5cIiArXG5cIiAgdmVjNCBpeHkgPSBhX3hfcGVybXV0ZShhX3hfcGVybXV0ZShpeCkgKyBpeSk7XFxuXCIgK1xuXCIgIHZlYzQgaXh5MCA9IGFfeF9wZXJtdXRlKGl4eSArIGl6MCk7XFxuXCIgK1xuXCIgIHZlYzQgaXh5MSA9IGFfeF9wZXJtdXRlKGl4eSArIGl6MSk7XFxuXCIgK1xuXCIgIHZlYzQgZ3gwID0gaXh5MCAqICgxLjAgLyA3LjApO1xcblwiICtcblwiICB2ZWM0IGd5MCA9IGZyYWN0KGZsb29yKGd4MCkgKiAoMS4wIC8gNy4wKSkgLSAwLjU7XFxuXCIgK1xuXCIgIGd4MCA9IGZyYWN0KGd4MCk7XFxuXCIgK1xuXCIgIHZlYzQgZ3owID0gdmVjNCgwLjUpIC0gYWJzKGd4MCkgLSBhYnMoZ3kwKTtcXG5cIiArXG5cIiAgdmVjNCBzejAgPSBzdGVwKGd6MCwgdmVjNCgwLjApKTtcXG5cIiArXG5cIiAgZ3gwIC09IHN6MCAqIChzdGVwKDAuMCwgZ3gwKSAtIDAuNSk7XFxuXCIgK1xuXCIgIGd5MCAtPSBzejAgKiAoc3RlcCgwLjAsIGd5MCkgLSAwLjUpO1xcblwiICtcblwiICB2ZWM0IGd4MSA9IGl4eTEgKiAoMS4wIC8gNy4wKTtcXG5cIiArXG5cIiAgdmVjNCBneTEgPSBmcmFjdChmbG9vcihneDEpICogKDEuMCAvIDcuMCkpIC0gMC41O1xcblwiICtcblwiICBneDEgPSBmcmFjdChneDEpO1xcblwiICtcblwiICB2ZWM0IGd6MSA9IHZlYzQoMC41KSAtIGFicyhneDEpIC0gYWJzKGd5MSk7XFxuXCIgK1xuXCIgIHZlYzQgc3oxID0gc3RlcChnejEsIHZlYzQoMC4wKSk7XFxuXCIgK1xuXCIgIGd4MSAtPSBzejEgKiAoc3RlcCgwLjAsIGd4MSkgLSAwLjUpO1xcblwiICtcblwiICBneTEgLT0gc3oxICogKHN0ZXAoMC4wLCBneTEpIC0gMC41KTtcXG5cIiArXG5cIiAgdmVjMyBnMDAwID0gdmVjMyhneDAueCwgZ3kwLngsIGd6MC54KTtcXG5cIiArXG5cIiAgdmVjMyBnMTAwID0gdmVjMyhneDAueSwgZ3kwLnksIGd6MC55KTtcXG5cIiArXG5cIiAgdmVjMyBnMDEwID0gdmVjMyhneDAueiwgZ3kwLnosIGd6MC56KTtcXG5cIiArXG5cIiAgdmVjMyBnMTEwID0gdmVjMyhneDAudywgZ3kwLncsIGd6MC53KTtcXG5cIiArXG5cIiAgdmVjMyBnMDAxID0gdmVjMyhneDEueCwgZ3kxLngsIGd6MS54KTtcXG5cIiArXG5cIiAgdmVjMyBnMTAxID0gdmVjMyhneDEueSwgZ3kxLnksIGd6MS55KTtcXG5cIiArXG5cIiAgdmVjMyBnMDExID0gdmVjMyhneDEueiwgZ3kxLnosIGd6MS56KTtcXG5cIiArXG5cIiAgdmVjMyBnMTExID0gdmVjMyhneDEudywgZ3kxLncsIGd6MS53KTtcXG5cIiArXG5cIiAgdmVjNCBub3JtMCA9IGFfeF90YXlsb3JJbnZTcXJ0KHZlYzQoZG90KGcwMDAsIGcwMDApLCBkb3QoZzAxMCwgZzAxMCksIGRvdChnMTAwLCBnMTAwKSwgZG90KGcxMTAsIGcxMTApKSk7XFxuXCIgK1xuXCIgIGcwMDAgKj0gbm9ybTAueDtcXG5cIiArXG5cIiAgZzAxMCAqPSBub3JtMC55O1xcblwiICtcblwiICBnMTAwICo9IG5vcm0wLno7XFxuXCIgK1xuXCIgIGcxMTAgKj0gbm9ybTAudztcXG5cIiArXG5cIiAgdmVjNCBub3JtMSA9IGFfeF90YXlsb3JJbnZTcXJ0KHZlYzQoZG90KGcwMDEsIGcwMDEpLCBkb3QoZzAxMSwgZzAxMSksIGRvdChnMTAxLCBnMTAxKSwgZG90KGcxMTEsIGcxMTEpKSk7XFxuXCIgK1xuXCIgIGcwMDEgKj0gbm9ybTEueDtcXG5cIiArXG5cIiAgZzAxMSAqPSBub3JtMS55O1xcblwiICtcblwiICBnMTAxICo9IG5vcm0xLno7XFxuXCIgK1xuXCIgIGcxMTEgKj0gbm9ybTEudztcXG5cIiArXG5cIiAgZmxvYXQgbjAwMCA9IGRvdChnMDAwLCBQZjApO1xcblwiICtcblwiICBmbG9hdCBuMTAwID0gZG90KGcxMDAsIHZlYzMoUGYxLngsIFBmMC55eikpO1xcblwiICtcblwiICBmbG9hdCBuMDEwID0gZG90KGcwMTAsIHZlYzMoUGYwLngsIFBmMS55LCBQZjAueikpO1xcblwiICtcblwiICBmbG9hdCBuMTEwID0gZG90KGcxMTAsIHZlYzMoUGYxLnh5LCBQZjAueikpO1xcblwiICtcblwiICBmbG9hdCBuMDAxID0gZG90KGcwMDEsIHZlYzMoUGYwLnh5LCBQZjEueikpO1xcblwiICtcblwiICBmbG9hdCBuMTAxID0gZG90KGcxMDEsIHZlYzMoUGYxLngsIFBmMC55LCBQZjEueikpO1xcblwiICtcblwiICBmbG9hdCBuMDExID0gZG90KGcwMTEsIHZlYzMoUGYwLngsIFBmMS55eikpO1xcblwiICtcblwiICBmbG9hdCBuMTExID0gZG90KGcxMTEsIFBmMSk7XFxuXCIgK1xuXCIgIHZlYzMgZmFkZV94eXogPSBhX3hfZmFkZShQZjApO1xcblwiICtcblwiICB2ZWM0IG5feiA9IG1peCh2ZWM0KG4wMDAsIG4xMDAsIG4wMTAsIG4xMTApLCB2ZWM0KG4wMDEsIG4xMDEsIG4wMTEsIG4xMTEpLCBmYWRlX3h5ei56KTtcXG5cIiArXG5cIiAgdmVjMiBuX3l6ID0gbWl4KG5fei54eSwgbl96Lnp3LCBmYWRlX3h5ei55KTtcXG5cIiArXG5cIiAgZmxvYXQgbl94eXogPSBtaXgobl95ei54LCBuX3l6LnksIGZhZGVfeHl6LngpO1xcblwiICtcblwiICByZXR1cm4gMi4yICogbl94eXo7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiY29uc3QgZmxvYXQgbGlnaHRfYW1iaWVudCA9IDAuNTtcXG5cIiArXG5cInZlYzMgY194X3BvaW50TGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgY29sb3IgKj0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBkX3hfZGlyZWN0aW9uYWxMaWdodCh2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjMyBsaWdodF9kaXIsIGZsb2F0IGxpZ2h0X2FtYmllbnQpIHtcXG5cIiArXG5cIiAgbGlnaHRfZGlyID0gbm9ybWFsaXplKGxpZ2h0X2Rpcik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBiX3hfbGlnaHRpbmcodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCB2ZWM0IG5pZ2h0X2xpZ2h0X3BvcywgdmVjMyBsaWdodF9kaXIsIGZsb2F0IGxpZ2h0X2FtYmllbnQpIHtcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKExJR0hUSU5HX1BPSU5UKVxcblwiICtcblwiICBjb2xvciA9IGNfeF9wb2ludExpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBsaWdodF9wb3MsIGxpZ2h0X2FtYmllbnQsIHRydWUpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKExJR0hUSU5HX05JR0hUKVxcblwiICtcblwiICBjb2xvciA9IGNfeF9wb2ludExpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBuaWdodF9saWdodF9wb3MsIDAuLCBmYWxzZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfRElSRUNUSU9OKVxcblwiICtcblwiICBjb2xvciA9IGRfeF9kaXJlY3Rpb25hbExpZ2h0KG5vcm1hbCwgY29sb3IsIGxpZ2h0X2RpciwgbGlnaHRfYW1iaWVudCk7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIGNvbG9yID0gY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2b2lkIG1haW4odm9pZCkge1xcblwiICtcblwiICB2ZWMzIGNvbG9yO1xcblwiICtcblwiICAjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKSAvLyBkZWZhdWx0IHRvIHBlci1waXhlbCBsaWdodGluZ1xcblwiICtcblwiICBjb2xvciA9IGJfeF9saWdodGluZyh2X3Bvc2l0aW9uLCB2X25vcm1hbCwgdl9jb2xvciwgdmVjNCgwLiwgMC4sIDE1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKSwgdmVjNCgwLiwgMC4sIDUwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCwgMS4pLCB2ZWMzKDAuMiwgMC43LCAtMC41KSwgbGlnaHRfYW1iaWVudCk7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIGNvbG9yID0gdl9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChFRkZFQ1RfU1BPVExJR0hUKVxcblwiICtcblwiICB2ZWMyIHBvc2l0aW9uID0gZ2xfRnJhZ0Nvb3JkLnh5IC8gdV9yZXNvbHV0aW9uLnh5O1xcblwiICtcblwiICBwb3NpdGlvbiA9IHBvc2l0aW9uICogMi4wIC0gMS4wO1xcblwiICtcblwiICBwb3NpdGlvbiAqPSB1X2FzcGVjdDtcXG5cIiArXG5cIiAgY29sb3IgKj0gbWF4KDEuMCAtIGRpc3RhbmNlKHBvc2l0aW9uLCB2ZWMyKDAuMCwgMC4wKSksIDAuMik7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoRUZGRUNUX0NPTE9SX0JMRUVEKVxcblwiICtcblwiICBjb2xvciArPSB2ZWMzKGdsX0ZyYWdDb29yZC54IC8gdV9yZXNvbHV0aW9uLngsIDAuMCwgZ2xfRnJhZ0Nvb3JkLnkgLyB1X3Jlc29sdXRpb24ueSk7XFxuXCIgK1xuXCIgIGNvbG9yLnIgKz0gc2luKHVfdGltZSAvIDMuMCk7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQgKEVGRkVDVF9OT0lTRV9URVhUVVJFKVxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoRUZGRUNUX05PSVNFX0FOSU1BVEFCTEUpICYmIGRlZmluZWQoRUZGRUNUX05PSVNFX0FOSU1BVEVEKVxcblwiICtcblwiICBjb2xvciAqPSAoYWJzKGFfeF9jbm9pc2UoKHZfcG9zaXRpb25fd29ybGQueHl6ICsgdmVjMyh1X3RpbWUgKiA1LiwgdV90aW1lICogNy41LCB1X3RpbWUgKiAxMC4pKSAvIDEwLjApKSAvIDQuMCkgKyAwLjc1O1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZm5kZWYgRUZGRUNUX05PSVNFX0FOSU1BVEFCTEVcXG5cIiArXG5cIiAgY29sb3IgKj0gKGFicyhhX3hfY25vaXNlKHZfcG9zaXRpb25fd29ybGQueHl6IC8gMTAuMCkpIC8gNC4wKSArIDAuNzU7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IsIDEuMCk7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fdmVydGV4J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3Jlc29sdXRpb247XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9hc3BlY3Q7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfdGltZTtcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X3RpbGVfd29ybGQ7XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV90aWxlX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV9tZXRlcl92aWV3O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21ldGVyc19wZXJfcGl4ZWw7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbnVtX2xheWVycztcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfcG9zaXRpb247XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX25vcm1hbDtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfY29sb3I7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgZmxvYXQgYV9sYXllcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwiI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWM0IHZfcG9zaXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9ub3JtYWw7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiI2lmIGRlZmluZWQoRUZGRUNUX05PSVNFX1RFWFRVUkUpXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3Bvc2l0aW9uX3dvcmxkO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cImNvbnN0IGZsb2F0IGxpZ2h0X2FtYmllbnQgPSAwLjU7XFxuXCIgK1xuXCJ2ZWM0IGFfeF9wZXJzcGVjdGl2ZSh2ZWM0IHBvc2l0aW9uLCBjb25zdCB2ZWMyIHBlcnNwZWN0aXZlX29mZnNldCwgY29uc3QgdmVjMiBwZXJzcGVjdGl2ZV9mYWN0b3IpIHtcXG5cIiArXG5cIiAgcG9zaXRpb24ueHkgKz0gcG9zaXRpb24ueiAqIHBlcnNwZWN0aXZlX2ZhY3RvciAqIChwb3NpdGlvbi54eSAtIHBlcnNwZWN0aXZlX29mZnNldCk7XFxuXCIgK1xuXCIgIHJldHVybiBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzQgYl94X2lzb21ldHJpYyh2ZWM0IHBvc2l0aW9uLCBjb25zdCB2ZWMyIGF4aXMsIGNvbnN0IGZsb2F0IG11bHRpcGxpZXIpIHtcXG5cIiArXG5cIiAgcG9zaXRpb24ueHkgKz0gcG9zaXRpb24ueiAqIGF4aXMgKiBtdWx0aXBsaWVyIC8gdV9hc3BlY3Q7XFxuXCIgK1xuXCIgIHJldHVybiBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzQgY194X3BvcHVwKHZlYzQgcG9zaXRpb24sIGNvbnN0IHZlYzIgY2VudGVyLCBjb25zdCBmbG9hdCByYWRpdXMpIHtcXG5cIiArXG5cIiAgaWYocG9zaXRpb24ueiA+IDAuKSB7XFxuXCIgK1xuXCIgICAgZmxvYXQgY2QgPSBkaXN0YW5jZShwb3NpdGlvbi54eSwgY2VudGVyKTtcXG5cIiArXG5cIiAgICBmbG9hdCBwb3B1cF9mYWRlX2lubmVyID0gcmFkaXVzICogMi4gLyAzLjtcXG5cIiArXG5cIiAgICBmbG9hdCBwb3B1cF9mYWRlX291dGVyID0gcmFkaXVzO1xcblwiICtcblwiICAgIGlmKGNkID4gcG9wdXBfZmFkZV9pbm5lcikge1xcblwiICtcblwiICAgICAgcG9zaXRpb24ueiAqPSAxLjAgLSBzbW9vdGhzdGVwKHBvcHVwX2ZhZGVfaW5uZXIsIHBvcHVwX2ZhZGVfb3V0ZXIsIGNkKTtcXG5cIiArXG5cIiAgICB9XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgcmV0dXJuIHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiZmxvYXQgZF94X2NhbGN1bGF0ZVooZmxvYXQgeiwgZmxvYXQgbGF5ZXIsIGNvbnN0IGZsb2F0IG51bV9sYXllcnMsIGNvbnN0IGZsb2F0IHpfbGF5ZXJfc2NhbGUpIHtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllcl9yYW5nZSA9IChudW1fbGF5ZXJzICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllciA9IChsYXllciArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIHogPSB6X2xheWVyICsgY2xhbXAoeiwgMC4sIHpfbGF5ZXJfc2NhbGUpO1xcblwiICtcblwiICB6ID0gKHpfbGF5ZXJfcmFuZ2UgLSB6KSAvIHpfbGF5ZXJfcmFuZ2U7XFxuXCIgK1xuXCIgIHJldHVybiB6O1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBmX3hfcG9pbnRMaWdodCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIGZsb2F0IGxpZ2h0X2FtYmllbnQsIGNvbnN0IGJvb2wgYmFja2xpZ2h0KSB7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIGxpZ2h0X3Bvcy54eXopO1xcblwiICtcblwiICBjb2xvciAqPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGdfeF9kaXJlY3Rpb25hbExpZ2h0KHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBsaWdodF9kaXIgPSBub3JtYWxpemUobGlnaHRfZGlyKTtcXG5cIiArXG5cIiAgY29sb3IgKj0gZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGVfeF9saWdodGluZyh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIHZlYzQgbmlnaHRfbGlnaHRfcG9zLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoTElHSFRJTkdfUE9JTlQpXFxuXCIgK1xuXCIgIGNvbG9yID0gZl94X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgdHJ1ZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfTklHSFQpXFxuXCIgK1xuXCIgIGNvbG9yID0gZl94X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIG5pZ2h0X2xpZ2h0X3BvcywgMC4sIGZhbHNlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19ESVJFQ1RJT04pXFxuXCIgK1xuXCIgIGNvbG9yID0gZ194X2RpcmVjdGlvbmFsTGlnaHQobm9ybWFsLCBjb2xvciwgbGlnaHRfZGlyLCBsaWdodF9hbWJpZW50KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgY29sb3IgPSBjb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZvaWQgbWFpbigpIHtcXG5cIiArXG5cIiAgdmVjNCBwb3NpdGlvbiA9IHVfdGlsZV92aWV3ICogdmVjNChhX3Bvc2l0aW9uLCAxLik7XFxuXCIgK1xuXCIgIHZlYzQgcG9zaXRpb25fd29ybGQgPSB1X3RpbGVfd29ybGQgKiB2ZWM0KGFfcG9zaXRpb24sIDEuKTtcXG5cIiArXG5cIiAgaWYocG9zaXRpb25fd29ybGQueiA+IDAuKSB7XFxuXCIgK1xuXCIgICAgXFxuXCIgK1xuXCIgICAgI2lmIGRlZmluZWQoQU5JTUFUSU9OX0VMRVZBVE9SKVxcblwiICtcblwiICAgIHBvc2l0aW9uLnogKj0gbWF4KChzaW4ocG9zaXRpb25fd29ybGQueiArIHVfdGltZSkgKyAxLjApIC8gMi4wLCAwLjA1KTtcXG5cIiArXG5cIiAgICAjZWxpZiBkZWZpbmVkKEFOSU1BVElPTl9XQVZFKVxcblwiICtcblwiICAgIHBvc2l0aW9uLnogKj0gbWF4KChzaW4ocG9zaXRpb25fd29ybGQueCAvIDEwMC4wICsgdV90aW1lKSArIDEuMCkgLyAyLjAsIDAuMDUpO1xcblwiICtcblwiICAgICNlbmRpZlxcblwiICtcblwiICAgIFxcblwiICtcblwiICB9XFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKFBST0pFQ1RJT05fUE9QVVApXFxuXCIgK1xuXCIgIHBvc2l0aW9uLnogKj0gMS4xO1xcblwiICtcblwiICBwb3NpdGlvbiA9IGNfeF9wb3B1cChwb3NpdGlvbiwgdmVjMigwLiwgMC4pLCAyMjUuICogdV9tZXRlcnNfcGVyX3BpeGVsKTtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChFRkZFQ1RfTk9JU0VfVEVYVFVSRSlcXG5cIiArXG5cIiAgdl9wb3NpdGlvbl93b3JsZCA9IHBvc2l0aW9uX3dvcmxkO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIiAgdl9jb2xvciA9IGVfeF9saWdodGluZyhwb3NpdGlvbiwgYV9ub3JtYWwsIGFfY29sb3IsIHZlYzQoMC4sIDAuLCAxNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLiksIHZlYzQoMC4sIDAuLCA1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKSwgdmVjMygwLjIsIDAuNywgLTAuNSksIGxpZ2h0X2FtYmllbnQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICB2X3Bvc2l0aW9uID0gcG9zaXRpb247XFxuXCIgK1xuXCIgIHZfbm9ybWFsID0gYV9ub3JtYWw7XFxuXCIgK1xuXCIgIHZfY29sb3IgPSBhX2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgcG9zaXRpb24gPSB1X21ldGVyX3ZpZXcgKiBwb3NpdGlvbjtcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoUFJPSkVDVElPTl9QRVJTUEVDVElWRSlcXG5cIiArXG5cIiAgcG9zaXRpb24gPSBhX3hfcGVyc3BlY3RpdmUocG9zaXRpb24sIHZlYzIoLTAuMjUsIC0wLjI1KSwgdmVjMigwLjYsIDAuNikpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKFBST0pFQ1RJT05fSVNPTUVUUklDKSB8fCBkZWZpbmVkKFBST0pFQ1RJT05fUE9QVVApXFxuXCIgK1xuXCIgIHBvc2l0aW9uID0gYl94X2lzb21ldHJpYyhwb3NpdGlvbiwgdmVjMigwLiwgMS4pLCAxLik7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBwb3NpdGlvbi56ID0gZF94X2NhbGN1bGF0ZVoocG9zaXRpb24ueiwgYV9sYXllciwgdV9udW1fbGF5ZXJzLCA0MDk2Lik7XFxuXCIgK1xuXCIgIGdsX1Bvc2l0aW9uID0gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuaWYgKG1vZHVsZS5leHBvcnRzICE9PSB1bmRlZmluZWQpIHsgbW9kdWxlLmV4cG9ydHMgPSBzaGFkZXJfc291cmNlczsgfVxuXG4iLCJ2YXIgVmVjdG9yUmVuZGVyZXIgPSByZXF1aXJlKCcuL3ZlY3Rvcl9yZW5kZXJlci5qcycpO1xuXG52YXIgTGVhZmxldExheWVyID0gTC5HcmlkTGF5ZXIuZXh0ZW5kKHtcblxuICAgIG9wdGlvbnM6IHtcbiAgICAgICAgdmVjdG9yUmVuZGVyZXI6ICdjYW52YXMnXG4gICAgfSxcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vcHRpb25zLnZlY3RvclJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnZlY3RvclJlbmRlcmVyIHx8ICdHTFJlbmRlcmVyJztcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSBWZWN0b3JSZW5kZXJlci5jcmVhdGUodGhpcy5vcHRpb25zLnZlY3RvclJlbmRlcmVyLCB0aGlzLm9wdGlvbnMudmVjdG9yVGlsZVNvdXJjZSwgdGhpcy5vcHRpb25zLnZlY3RvckxheWVycywgdGhpcy5vcHRpb25zLnZlY3RvclN0eWxlcywgeyBudW1fd29ya2VyczogdGhpcy5vcHRpb25zLm51bVdvcmtlcnMgfSk7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLmRlYnVnID0gdGhpcy5vcHRpb25zLmRlYnVnO1xuICAgICAgICB0aGlzLl9yZW5kZXJlci5jb250aW51b3VzX2FuaW1hdGlvbiA9IGZhbHNlOyAvLyBzZXQgdG8gdHJ1ZSBmb3IgYW5pbWF0aW5vcywgZXRjLiAoZXZlbnR1YWxseSB3aWxsIGJlIGF1dG9tYXRlZClcbiAgICB9LFxuXG4gICAgLy8gRmluaXNoIGluaXRpYWxpemluZyByZW5kZXJlciBhbmQgc2V0dXAgZXZlbnRzIHdoZW4gbGF5ZXIgaXMgYWRkZWQgdG8gbWFwXG4gICAgb25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcbiAgICAgICAgdmFyIGxheWVyID0gdGhpcztcblxuICAgICAgICBsYXllci5vbigndGlsZXVubG9hZCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSBldmVudC50aWxlO1xuICAgICAgICAgICAgdmFyIGtleSA9IHRpbGUuZ2V0QXR0cmlidXRlKCdkYXRhLXRpbGUta2V5Jyk7XG4gICAgICAgICAgICBsYXllci5fcmVuZGVyZXIucmVtb3ZlVGlsZShrZXkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsYXllci5fbWFwLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IGxheWVyLl9tYXAuZ2V0U2l6ZSgpO1xuICAgICAgICAgICAgbGF5ZXIuX3JlbmRlcmVyLnJlc2l6ZU1hcChzaXplLngsIHNpemUueSk7XG4gICAgICAgICAgICBsYXllci51cGRhdGVCb3VuZHMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF5ZXIuX21hcC5vbignbW92ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjZW50ZXIgPSBsYXllci5fbWFwLmdldENlbnRlcigpO1xuICAgICAgICAgICAgbGF5ZXIuX3JlbmRlcmVyLnNldENlbnRlcihjZW50ZXIubG5nLCBjZW50ZXIubGF0KTtcbiAgICAgICAgICAgIGxheWVyLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsYXllci5fbWFwLm9uKCd6b29tc3RhcnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1hcC56b29tc3RhcnQgXCIgKyBsYXllci5fbWFwLmdldFpvb20oKSk7XG4gICAgICAgICAgICBsYXllci5fcmVuZGVyZXIuc3RhcnRab29tKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxheWVyLl9tYXAub24oJ3pvb21lbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1hcC56b29tZW5kIFwiICsgbGF5ZXIuX21hcC5nZXRab29tKCkpO1xuICAgICAgICAgICAgbGF5ZXIuX3JlbmRlcmVyLnNldFpvb20obGF5ZXIuX21hcC5nZXRab29tKCkpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDYW52YXMgZWxlbWVudCB3aWxsIGJlIGluc2VydGVkIGFmdGVyIG1hcCBjb250YWluZXIgKGxlYWZsZXQgdHJhbnNmb3JtcyBzaG91bGRuJ3QgYmUgYXBwbGllZCB0byB0aGUgR0wgY2FudmFzKVxuICAgICAgICAvLyBUT0RPOiBmaW5kIGEgYmV0dGVyIHdheSB0byBkZWFsIHdpdGggdGhpcz8gcmlnaHQgbm93IEdMIG1hcCBvbmx5IHJlbmRlcnMgY29ycmVjdGx5IGFzIHRoZSBib3R0b20gbGF5ZXJcbiAgICAgICAgbGF5ZXIuX3JlbmRlcmVyLmNvbnRhaW5lciA9IGxheWVyLl9tYXAuZ2V0Q29udGFpbmVyKCk7XG5cbiAgICAgICAgdmFyIGNlbnRlciA9IGxheWVyLl9tYXAuZ2V0Q2VudGVyKCk7XG4gICAgICAgIGxheWVyLl9yZW5kZXJlci5zZXRDZW50ZXIoY2VudGVyLmxuZywgY2VudGVyLmxhdCk7XG4gICAgICAgIGxheWVyLl9yZW5kZXJlci5zZXRab29tKGxheWVyLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgbGF5ZXIudXBkYXRlQm91bmRzKCk7XG5cbiAgICAgICAgTC5HcmlkTGF5ZXIucHJvdG90eXBlLm9uQWRkLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGxheWVyLl9yZW5kZXJlci5pbml0KCk7XG4gICAgfSxcblxuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgICAgIEwuR3JpZExheWVyLnByb3RvdHlwZS5vblJlbW92ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAvLyBUT0RPOiByZW1vdmUgZXZlbnQgaGFuZGxlcnMsIGRlc3Ryb3kgbWFwXG4gICAgfSxcblxuICAgIGNyZWF0ZVRpbGU6IGZ1bmN0aW9uIChjb29yZHMsIGRvbmUpIHtcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aGlzLl9yZW5kZXJlci5sb2FkVGlsZShjb29yZHMsIGRpdiwgZG9uZSk7XG4gICAgICAgIHJldHVybiBkaXY7XG4gICAgfSxcblxuICAgIHVwZGF0ZUJvdW5kczogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzO1xuICAgICAgICB2YXIgYm91bmRzID0gbGF5ZXIuX21hcC5nZXRCb3VuZHMoKTtcbiAgICAgICAgbGF5ZXIuX3JlbmRlcmVyLnNldEJvdW5kcyhib3VuZHMuZ2V0U291dGhXZXN0KCksIGJvdW5kcy5nZXROb3J0aEVhc3QoKSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW5kZXIoKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgbGVhZmxldExheWVyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IExlYWZsZXRMYXllcihvcHRpb25zKTtcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBMZWFmbGV0TGF5ZXI6IExlYWZsZXRMYXllcixcbiAgICAgICAgbGVhZmxldExheWVyOiBsZWFmbGV0TGF5ZXJcbiAgICB9O1xufVxuIiwiLy8gTW9kdWxlcyBhbmQgZGVwZW5kZW5jaWVzIHRvIGV4cG9zZSBpbiB0aGUgcHVibGljIFRhbmdyYW0gbW9kdWxlXG5cbi8vIFRoZSBsZWFmbGV0IGxheWVyIHBsdWdpbiBpcyBjdXJyZW50bHkgdGhlIHByaW1hcnkgbWVhbnMgb2YgdXNpbmcgdGhlIGxpYnJhcnlcbnZhciBMZWFmbGV0ID0gcmVxdWlyZSgnLi9sZWFmbGV0X2xheWVyLmpzJyk7XG5cbi8vIFJlbmRlcmVyIG1vZHVsZXMgbmVlZCB0byBiZSBleHBsaWNpdGx5IGluY2x1ZGVkIHNpbmNlIHRoZXkgYXJlIG5vdCBvdGhlcndpc2UgcmVmZXJlbmNlZFxucmVxdWlyZSgnLi9nbC9nbF9yZW5kZXJlci5qcycpO1xucmVxdWlyZSgnLi9jYW52YXMvY2FudmFzX3JlbmRlcmVyLmpzJyk7XG5cbi8vIEdMIGZ1bmN0aW9ucyBpbmNsdWRlZCBmb3IgZWFzaWVyIGRlYnVnZ2luZyAvIGRpcmVjdCBhY2Nlc3MgdG8gc2V0dGluZyBnbG9iYWwgZGVmaW5lcywgcmVsb2FkaW5nIHByb2dyYW1zLCBldGMuXG52YXIgR0wgPSByZXF1aXJlKCcuL2dsL2dsLmpzJyk7XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBMZWFmbGV0TGF5ZXI6IExlYWZsZXQuTGVhZmxldExheWVyLFxuICAgICAgICBsZWFmbGV0TGF5ZXI6IExlYWZsZXQubGVhZmxldExheWVyLFxuICAgICAgICBHTDogR0xcbiAgICB9O1xufVxuIiwiLy8gUG9pbnRcbmZ1bmN0aW9uIFBvaW50ICh4LCB5KVxue1xuICAgIHJldHVybiB7IHg6IHgsIHk6IHkgfTtcbn1cblxuUG9pbnQuY29weSA9IGZ1bmN0aW9uIChwKVxue1xuICAgIGlmIChwID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7IHg6IHAueCwgeTogcC55IH07XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFBvaW50O1xufVxuIiwiLyoqKiBTdHlsZSBoZWxwZXJzICoqKi9cbnZhciBHZW8gPSByZXF1aXJlKCcuL2dlby5qcycpO1xuXG52YXIgU3R5bGUgPSB7fTtcblxuU3R5bGUuY29sb3IgPSB7XG4gICAgcHNldWRvUmFuZG9tR3JheXNjYWxlOiBmdW5jdGlvbiAoZikgeyB2YXIgYyA9IE1hdGgubWF4KChwYXJzZUludChmLmlkLCAxNikgJSAxMDApIC8gMTAwLCAwLjQpOyByZXR1cm4gWzAuNyAqIGMsIDAuNyAqIGMsIDAuNyAqIGNdOyB9LCAvLyBwc2V1ZG8tcmFuZG9tIGdyYXlzY2FsZSBieSBnZW9tZXRyeSBpZFxuICAgIHBzZXVkb1JhbmRvbUNvbG9yOiBmdW5jdGlvbiAoZikgeyByZXR1cm4gWzAuNyAqIChwYXJzZUludChmLmlkLCAxNikgLyAxMDAgJSAxKSwgMC43ICogKHBhcnNlSW50KGYuaWQsIDE2KSAvIDEwMDAwICUgMSksIDAuNyAqIChwYXJzZUludChmLmlkLCAxNikgLyAxMDAwMDAwICUgMSldOyB9LCAvLyBwc2V1ZG8tcmFuZG9tIGNvbG9yIGJ5IGdlb21ldHJ5IGlkXG4gICAgcmFuZG9tQ29sb3I6IGZ1bmN0aW9uIChmKSB7IHJldHVybiBbMC43ICogTWF0aC5yYW5kb20oKSwgMC43ICogTWF0aC5yYW5kb20oKSwgMC43ICogTWF0aC5yYW5kb20oKV07IH0gLy8gcmFuZG9tIGNvbG9yXG59O1xuXG5TdHlsZS53aWR0aCA9IHtcbiAgICBwaXhlbHM6IGZ1bmN0aW9uIChwKSB7IHJldHVybiBmdW5jdGlvbiAoZiwgdCkgeyByZXR1cm4gKHR5cGVvZiBwID09ICdmdW5jdGlvbicgPyBwKGYsIHQpIDogcCkgKiBHZW8udW5pdHNfcGVyX3BpeGVsOyB9OyB9LCAvLyBsb2NhbCB0aWxlIHVuaXRzIGZvciBhIGdpdmVuIHBpeGVsIHdpZHRoXG4gICAgbWV0ZXJzOiBmdW5jdGlvbiAocCkgeyByZXR1cm4gZnVuY3Rpb24gKGYsIHQpIHsgcmV0dXJuICh0eXBlb2YgcCA9PSAnZnVuY3Rpb24nID8gcChmLCB0KSA6IHApICogR2VvLnVuaXRzX3Blcl9tZXRlclt0LmNvb3Jkcy56XTsgfTsgfSAgLy8gbG9jYWwgdGlsZSB1bml0cyBmb3IgYSBnaXZlbiBtZXRlciB3aWR0aFxufTtcblxuU3R5bGUudW5pdHNfcGVyX21ldGVyID0gZnVuY3Rpb24gKHQpIHtcbiAgICByZXR1cm4gR2VvLnVuaXRzX3Blcl9tZXRlclt0LmNvb3Jkcy56XTtcbn07XG5cblN0eWxlLnVuaXRzX3Blcl9waXhlbCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBHZW8udW5pdHNfcGVyX3BpeGVsO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTdHlsZTtcbn1cbiIsIi8qKiogVmVjdG9yIGZ1bmN0aW9ucyAtIHZlY3RvcnMgcHJvdmlkZWQgYXMgW3gsIHksIHpdIGFycmF5cyAqKiovXG5cbnZhciBWZWN0b3IgPSB7fTtcblxuLy8gVmVjdG9yIGxlbmd0aCBzcXVhcmVkXG5WZWN0b3IubGVuZ3RoU3EgPSBmdW5jdGlvbiAodilcbntcbiAgICBpZiAodi5sZW5ndGggPT0gMikge1xuICAgICAgICByZXR1cm4gKHZbMF0qdlswXSArIHZbMV0qdlsxXSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gKHZbMF0qdlswXSArIHZbMV0qdlsxXSArIHZbMl0qdlsyXSk7XG4gICAgfVxufTtcblxuLy8gVmVjdG9yIGxlbmd0aFxuVmVjdG9yLmxlbmd0aCA9IGZ1bmN0aW9uICh2KVxue1xuICAgIHJldHVybiBNYXRoLnNxcnQoVmVjdG9yLmxlbmd0aFNxKHYpKTtcbn07XG5cbi8vIE5vcm1hbGl6ZSBhIHZlY3RvclxuVmVjdG9yLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uICh2KVxue1xuICAgIHZhciBkO1xuICAgIGlmICh2Lmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIGQgPSB2WzBdKnZbMF0gKyB2WzFdKnZbMV07XG4gICAgICAgIGQgPSBNYXRoLnNxcnQoZCk7XG5cbiAgICAgICAgaWYgKGQgIT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFt2WzBdIC8gZCwgdlsxXSAvIGRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbMCwgMF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgZCA9IHZbMF0qdlswXSArIHZbMV0qdlsxXSArIHZbMl0qdlsyXTtcbiAgICAgICAgZCA9IE1hdGguc3FydChkKTtcblxuICAgICAgICBpZiAoZCAhPSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW3ZbMF0gLyBkLCB2WzFdIC8gZCwgdlsyXSAvIGRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbMCwgMCwgMF07XG4gICAgfVxufTtcblxuLy8gQ3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjdG9yc1xuVmVjdG9yLmNyb3NzICA9IGZ1bmN0aW9uICh2MSwgdjIpXG57XG4gICAgcmV0dXJuIFtcbiAgICAgICAgKHYxWzFdICogdjJbMl0pIC0gKHYxWzJdICogdjJbMV0pLFxuICAgICAgICAodjFbMl0gKiB2MlswXSkgLSAodjFbMF0gKiB2MlsyXSksXG4gICAgICAgICh2MVswXSAqIHYyWzFdKSAtICh2MVsxXSAqIHYyWzBdKVxuICAgIF07XG59O1xuXG4vLyBGaW5kIHRoZSBpbnRlcnNlY3Rpb24gb2YgdHdvIGxpbmVzIHNwZWNpZmllZCBhcyBzZWdtZW50cyBmcm9tIHBvaW50cyAocDEsIHAyKSBhbmQgKHAzLCBwNClcbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGluZS1saW5lX2ludGVyc2VjdGlvblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DcmFtZXInc19ydWxlXG5WZWN0b3IubGluZUludGVyc2VjdGlvbiA9IGZ1bmN0aW9uIChwMSwgcDIsIHAzLCBwNCwgcGFyYWxsZWxfdG9sZXJhbmNlKVxue1xuICAgIHZhciBwYXJhbGxlbF90b2xlcmFuY2UgPSBwYXJhbGxlbF90b2xlcmFuY2UgfHwgMC4wMTtcblxuICAgIC8vIGExKnggKyBiMSp5ID0gYzEgZm9yIGxpbmUgKHgxLCB5MSkgdG8gKHgyLCB5MilcbiAgICAvLyBhMip4ICsgYjIqeSA9IGMyIGZvciBsaW5lICh4MywgeTMpIHRvICh4NCwgeTQpXG4gICAgdmFyIGExID0gcDFbMV0gLSBwMlsxXTsgLy8geTEgLSB5MlxuICAgIHZhciBiMSA9IHAxWzBdIC0gcDJbMF07IC8vIHgxIC0geDJcbiAgICB2YXIgYTIgPSBwM1sxXSAtIHA0WzFdOyAvLyB5MyAtIHk0XG4gICAgdmFyIGIyID0gcDNbMF0gLSBwNFswXTsgLy8geDMgLSB4NFxuICAgIHZhciBjMSA9IChwMVswXSAqIHAyWzFdKSAtIChwMVsxXSAqIHAyWzBdKTsgLy8geDEqeTIgLSB5MSp4MlxuICAgIHZhciBjMiA9IChwM1swXSAqIHA0WzFdKSAtIChwM1sxXSAqIHA0WzBdKTsgLy8geDMqeTQgLSB5Myp4NFxuICAgIHZhciBkZW5vbSA9IChiMSAqIGEyKSAtIChhMSAqIGIyKTtcblxuICAgIGlmIChNYXRoLmFicyhkZW5vbSkgPiBwYXJhbGxlbF90b2xlcmFuY2UpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICgoYzEgKiBiMikgLSAoYjEgKiBjMikpIC8gZGVub20sXG4gICAgICAgICAgICAoKGMxICogYTIpIC0gKGExICogYzIpKSAvIGRlbm9tXG4gICAgICAgIF07XG4gICAgfVxuICAgIHJldHVybiBudWxsOyAvLyByZXR1cm4gbnVsbCBpZiBsaW5lcyBhcmUgKGNsb3NlIHRvKSBwYXJhbGxlbFxufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBWZWN0b3I7XG59XG4iLCJ2YXIgUG9pbnQgPSByZXF1aXJlKCcuL3BvaW50LmpzJyk7XG52YXIgR2VvID0gcmVxdWlyZSgnLi9nZW8uanMnKTtcbnZhciBTdHlsZSA9IHJlcXVpcmUoJy4vc3R5bGUuanMnKTtcblxuLy8gR2xvYmFsIHNldHVwXG5maW5kQmFzZUxpYnJhcnlVUkwoKTtcblZlY3RvclJlbmRlcmVyLnRpbGVfc2NhbGUgPSA0MDk2OyAvLyBjb29yZGluYXRlcyBhcmUgbG9jYWxseSBzY2FsZWQgdG8gdGhlIHJhbmdlIFswLCB0aWxlX3NjYWxlXVxuR2VvLnNldFRpbGVTY2FsZShWZWN0b3JSZW5kZXJlci50aWxlX3NjYWxlKTtcblxuLy8gTGF5ZXJzICYgc3R5bGVzOiBwYXNzIGFuIG9iamVjdCBkaXJlY3RseSwgb3IgYSBVUkwgYXMgc3RyaW5nIHRvIGxvYWQgcmVtb3RlbHlcbmZ1bmN0aW9uIFZlY3RvclJlbmRlcmVyICh0eXBlLCB0aWxlX3NvdXJjZSwgbGF5ZXJzLCBzdHlsZXMsIG9wdGlvbnMpXG57XG4gICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy50aWxlX3NvdXJjZSA9IHRpbGVfc291cmNlO1xuICAgIHRoaXMudGlsZXMgPSB7fTtcbiAgICB0aGlzLm51bV93b3JrZXJzID0gb3B0aW9ucy5udW1fd29ya2VycyB8fCAxO1xuXG4gICAgdGhpcy5sYXllcl9zb3VyY2UgPSBWZWN0b3JSZW5kZXJlci51cmxGb3JQYXRoKGxheWVycyk7IC8vIFRPRE86IGZpeCB0aGlzIGZvciBsYXllcnMgcHJvdmlkZWQgYXMgb2JqZWN0cywgdGhpcyBhc3N1bWVzIGEgVVJMIGlzIHBhc3NlZFxuICAgIGlmICh0eXBlb2YobGF5ZXJzKSA9PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLmxheWVycyA9IFZlY3RvclJlbmRlcmVyLmxvYWRMYXllcnMobGF5ZXJzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMubGF5ZXJzID0gbGF5ZXJzO1xuICAgIH1cblxuICAgIHRoaXMuc3R5bGVfc291cmNlID0gVmVjdG9yUmVuZGVyZXIudXJsRm9yUGF0aChzdHlsZXMpOyAvLyBUT0RPOiBmaXggdGhpcyBmb3Igc3R5bGVzIHByb3ZpZGVkIGFzIG9iamVjdHMsIHRoaXMgYXNzdW1lcyBhIFVSTCBpcyBwYXNzZWRcbiAgICBpZiAodHlwZW9mKHN0eWxlcykgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBWZWN0b3JSZW5kZXJlci5sb2FkU3R5bGVzKHN0eWxlcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnN0eWxlcyA9IHN0eWxlcztcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZVdvcmtlcnMoKTtcblxuICAgIHRoaXMuem9vbSA9IG51bGw7XG4gICAgdGhpcy5jZW50ZXIgPSBudWxsO1xuICAgIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTsgLy8gcmVxdWVzdCBhIHJlZHJhd1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbn1cblxuVmVjdG9yUmVuZGVyZXIuY3JlYXRlID0gZnVuY3Rpb24gKHR5cGUsIHRpbGVfc291cmNlLCBsYXllcnMsIHN0eWxlcywgb3B0aW9ucylcbntcbiAgICByZXR1cm4gbmV3IFZlY3RvclJlbmRlcmVyW3R5cGVdKHRpbGVfc291cmNlLCBsYXllcnMsIHN0eWxlcywgb3B0aW9ucyk7XG59O1xuXG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gQ2hpbGQgY2xhc3Mtc3BlY2lmaWMgaW5pdGlhbGl6YXRpb24gKGUuZy4gR0wgY29udGV4dCBjcmVhdGlvbilcbiAgICBpZiAodHlwZW9mKHRoaXMuX2luaXQpID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5faW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIHZhciByZW5kZXJlciA9IHRoaXM7XG4gICAgdGhpcy53b3JrZXJzLmZvckVhY2goZnVuY3Rpb24od29ya2VyKSB7XG4gICAgICAgIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgcmVuZGVyZXIud29ya2VyQnVpbGRUaWxlQ29tcGxldGVkLmJpbmQocmVuZGVyZXIpKTtcbiAgICB9KTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xufTtcblxuLy8gV2ViIHdvcmtlcnMgaGFuZGxlIGhlYXZ5IGR1dHkgZ2VvbWV0cnkgcHJvY2Vzc2luZ1xuVmVjdG9yUmVuZGVyZXIucHJvdG90eXBlLmNyZWF0ZVdvcmtlcnMgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciByZW5kZXJlciA9IHRoaXM7XG4gICAgdmFyIHVybCA9IFZlY3RvclJlbmRlcmVyLmxpYnJhcnlfYmFzZV91cmwgKyAndmVjdG9yLW1hcC13b3JrZXIubWluLmpzJyArICc/JyArICgrbmV3IERhdGUoKSk7XG5cbiAgICAvLyBUbyBhbGxvdyB3b3JrZXJzIHRvIGJlIGxvYWRlZCBjcm9zcy1kb21haW4sIGZpcnN0IGxvYWQgd29ya2VyIHNvdXJjZSB2aWEgWEhSLCB0aGVuIGNyZWF0ZSBhIGxvY2FsIFVSTCB2aWEgYSBibG9iXG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3b3JrZXJfbG9jYWxfdXJsID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW3JlcS5yZXNwb25zZV0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnIH0pKTtcblxuICAgICAgICByZW5kZXJlci53b3JrZXJzID0gW107XG4gICAgICAgIGZvciAodmFyIHc9MDsgdyA8IHJlbmRlcmVyLm51bV93b3JrZXJzOyB3KyspIHtcbiAgICAgICAgICAgIHJlbmRlcmVyLndvcmtlcnMucHVzaChuZXcgV29ya2VyKHdvcmtlcl9sb2NhbF91cmwpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmVxLm9wZW4oJ0dFVCcsIHVybCwgZmFsc2UgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgcmVxLnNlbmQoKTtcblxuICAgIC8vIEFsdGVybmF0ZSBmb3IgZGVidWdnaW5nIC0gdHJhZHRpb25hbCBtZXRob2Qgb2YgbG9hZGluZyBmcm9tIHJlbW90ZSBVUkwgaW5zdGVhZCBvZiBYSFItdG8tbG9jYWwtYmxvYlxuICAgIC8vIHJlbmRlcmVyLndvcmtlcnMgPSBbXTtcbiAgICAvLyBmb3IgKHZhciB3PTA7IHcgPCByZW5kZXJlci5udW1fd29ya2VyczsgdysrKSB7XG4gICAgLy8gICAgIHJlbmRlcmVyLndvcmtlcnMucHVzaChuZXcgV29ya2VyKHVybCkpO1xuICAgIC8vIH1cblxuICAgIHRoaXMubmV4dF93b3JrZXIgPSAwO1xufTtcblxuLy8gUG9zdCBhIG1lc3NhZ2UgYWJvdXQgYSB0aWxlIHRvIHRoZSBuZXh0IHdvcmtlciAocm91bmQgcm9iYmluKVxuVmVjdG9yUmVuZGVyZXIucHJvdG90eXBlLndvcmtlclBvc3RNZXNzYWdlRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlLCBtZXNzYWdlKVxue1xuICAgIHRpbGUud29ya2VyID0gdGhpcy5uZXh0X3dvcmtlcjtcbiAgICB0aGlzLndvcmtlcnNbdGlsZS53b3JrZXJdLnBvc3RNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIHRoaXMubmV4dF93b3JrZXIgPSAodGlsZS53b3JrZXIgKyAxKSAlIHRoaXMud29ya2Vycy5sZW5ndGg7XG59O1xuXG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUuc2V0Q2VudGVyID0gZnVuY3Rpb24gKGxuZywgbGF0KVxue1xuICAgIHRoaXMuY2VudGVyID0geyBsbmc6IGxuZywgbGF0OiBsYXQgfTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cblZlY3RvclJlbmRlcmVyLnByb3RvdHlwZS5zZXRab29tID0gZnVuY3Rpb24gKHpvb20pXG57XG4gICAgdGhpcy5tYXBfbGFzdF96b29tID0gdGhpcy56b29tO1xuICAgIHRoaXMuem9vbSA9IHpvb207XG4gICAgdGhpcy5tYXBfem9vbWluZyA9IGZhbHNlO1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuVmVjdG9yUmVuZGVyZXIucHJvdG90eXBlLnN0YXJ0Wm9vbSA9IGZ1bmN0aW9uICgpXG57XG4gICAgdGhpcy5tYXBfbGFzdF96b29tID0gdGhpcy56b29tO1xuICAgIHRoaXMubWFwX3pvb21pbmcgPSB0cnVlO1xufTtcblxuVmVjdG9yUmVuZGVyZXIucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uIChzdywgbmUpXG57XG4gICAgdGhpcy5ib3VuZHMgPSB7XG4gICAgICAgIHN3OiB7IGxuZzogc3cubG5nLCBsYXQ6IHN3LmxhdCB9LFxuICAgICAgICBuZTogeyBsbmc6IG5lLmxuZywgbGF0OiBuZS5sYXQgfVxuICAgIH07XG5cbiAgICB2YXIgYnVmZmVyID0gMjAwICogR2VvLm1ldGVyc19wZXJfcGl4ZWxbfn50aGlzLnpvb21dOyAvLyBwaXhlbHMgLT4gbWV0ZXJzXG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMgPSB7XG4gICAgICAgIHN3OiBHZW8ubGF0TG5nVG9NZXRlcnMoUG9pbnQodGhpcy5ib3VuZHMuc3cubG5nLCB0aGlzLmJvdW5kcy5zdy5sYXQpKSxcbiAgICAgICAgbmU6IEdlby5sYXRMbmdUb01ldGVycyhQb2ludCh0aGlzLmJvdW5kcy5uZS5sbmcsIHRoaXMuYm91bmRzLm5lLmxhdCkpXG4gICAgfTtcbiAgICB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5zdy54IC09IGJ1ZmZlcjtcbiAgICB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5zdy55IC09IGJ1ZmZlcjtcbiAgICB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5uZS54ICs9IGJ1ZmZlcjtcbiAgICB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5uZS55ICs9IGJ1ZmZlcjtcblxuICAgIC8vIGNvbnNvbGUubG9nKFwic2V0IHJlbmRlcmVyIGJvdW5kcyB0byBcIiArIEpTT04uc3RyaW5naWZ5KHRoaXMuYm91bmRzKSk7XG5cbiAgICAvLyBNYXJrIHRpbGVzIGFzIHZpc2libGUvaW52aXNpYmxlXG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUodGhpcy50aWxlc1t0XSk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUgPSBmdW5jdGlvbiAodGlsZSlcbntcbiAgICB0aWxlLnZpc2libGUgPSBHZW8uYm94SW50ZXJzZWN0KHRpbGUuYm91bmRzLCB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcyk7XG4gICAgcmV0dXJuIHRpbGUudmlzaWJsZTtcbn07XG5cblZlY3RvclJlbmRlcmVyLnByb3RvdHlwZS5yZXNpemVNYXAgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodClcbntcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cblZlY3RvclJlbmRlcmVyLnByb3RvdHlwZS5yZXF1ZXN0UmVkcmF3ID0gZnVuY3Rpb24gKClcbntcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cblZlY3RvclJlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKVxue1xuICAgIGlmICh0aGlzLmRpcnR5ID09IGZhbHNlIHx8IHRoaXMuaW5pdGlhbGl6ZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7IC8vIHN1YmNsYXNzZXMgY2FuIHNldCB0aGlzIGJhY2sgdG8gdHJ1ZSB3aGVuIGFuaW1hdGlvbiBpcyBuZWVkZWRcblxuICAgIC8vIENoaWxkIGNsYXNzLXNwZWNpZmljIHJlbmRlcmluZyAoZS5nLiBHTCBkcmF3IGNhbGxzKVxuICAgIGlmICh0eXBlb2YodGhpcy5fcmVuZGVyKSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX3JlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIC8vIGNvbnNvbGUubG9nKFwicmVuZGVyIG1hcFwiKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8vIExvYWQgYSBzaW5nbGUgdGlsZVxuVmVjdG9yUmVuZGVyZXIucHJvdG90eXBlLmxvYWRUaWxlID0gZnVuY3Rpb24gKGNvb3JkcywgZGl2LCBjYWxsYmFjaylcbntcbiAgICAvLyBPdmVyem9vbT9cbiAgICBpZiAoY29vcmRzLnogPiB0aGlzLnRpbGVfc291cmNlLm1heF96b29tKSB7XG4gICAgICAgIHZhciB6Z2FwID0gY29vcmRzLnogLSB0aGlzLnRpbGVfc291cmNlLm1heF96b29tO1xuICAgICAgICAvLyB2YXIgb3JpZ2luYWxfdGlsZSA9IFtjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56XS5qb2luKCcvJyk7XG4gICAgICAgIGNvb3Jkcy54ID0gfn4oY29vcmRzLnggLyBNYXRoLnBvdygyLCB6Z2FwKSk7XG4gICAgICAgIGNvb3Jkcy55ID0gfn4oY29vcmRzLnkgLyBNYXRoLnBvdygyLCB6Z2FwKSk7XG4gICAgICAgIGNvb3Jkcy5kaXNwbGF5X3ogPSBjb29yZHMuejsgLy8geiB3aXRob3V0IG92ZXJ6b29tXG4gICAgICAgIGNvb3Jkcy56IC09IHpnYXA7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiYWRqdXN0ZWQgZm9yIG92ZXJ6b29tLCB0aWxlIFwiICsgb3JpZ2luYWxfdGlsZSArIFwiIC0+IFwiICsgW2Nvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnpdLmpvaW4oJy8nKSk7XG4gICAgfVxuXG4gICAgdGhpcy50cmFja1RpbGVTZXRMb2FkU3RhcnQoKTtcblxuICAgIHZhciBrZXkgPSBbY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMuel0uam9pbignLycpO1xuXG4gICAgLy8gQWxyZWFkeSBsb2FkaW5nL2xvYWRlZD9cbiAgICBpZiAodGhpcy50aWxlc1trZXldKSB7XG4gICAgICAgIC8vIGlmICh0aGlzLnRpbGVzW2tleV0ubG9hZGVkID09IHRydWUpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwidXNlIGxvYWRlZCB0aWxlIFwiICsga2V5ICsgXCIgZnJvbSBjYWNoZVwiKTtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBpZiAodGhpcy50aWxlc1trZXldLmxvYWRpbmcgPT0gdHJ1ZSkge1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJhbHJlYWR5IGxvYWRpbmcgdGlsZSBcIiArIGtleSArIFwiLCBza2lwXCIpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBkaXYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNba2V5XSA9IHt9O1xuICAgIHRpbGUua2V5ID0ga2V5O1xuICAgIHRpbGUuY29vcmRzID0gY29vcmRzO1xuICAgIHRpbGUubWluID0gR2VvLm1ldGVyc0ZvclRpbGUodGlsZS5jb29yZHMpO1xuICAgIHRpbGUubWF4ID0gR2VvLm1ldGVyc0ZvclRpbGUoeyB4OiB0aWxlLmNvb3Jkcy54ICsgMSwgeTogdGlsZS5jb29yZHMueSArIDEsIHo6IHRpbGUuY29vcmRzLnogfSk7XG4gICAgdGlsZS5ib3VuZHMgPSB7IHN3OiB7IHg6IHRpbGUubWluLngsIHk6IHRpbGUubWF4LnkgfSwgbmU6IHsgeDogdGlsZS5tYXgueCwgeTogdGlsZS5taW4ueSB9IH07XG4gICAgdGlsZS5kZWJ1ZyA9IHt9O1xuICAgIHRpbGUubG9hZGluZyA9IHRydWU7XG4gICAgdGlsZS5sb2FkZWQgPSBmYWxzZTtcbiAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHlGb3JUaWxlKHRpbGUpO1xuXG4gICAgdGhpcy53b3JrZXJQb3N0TWVzc2FnZUZvclRpbGUodGlsZSwge1xuICAgICAgICB0eXBlOiAnYnVpbGRUaWxlJyxcbiAgICAgICAgdGlsZToge1xuICAgICAgICAgICAga2V5OiB0aWxlLmtleSxcbiAgICAgICAgICAgIGNvb3JkczogdGlsZS5jb29yZHMsIC8vIHVzZWQgYnkgc3R5bGUgaGVscGVyc1xuICAgICAgICAgICAgbWluOiB0aWxlLm1pbiwgLy8gdXNlZCBieSBUaWxlU291cmNlIHRvIHNjYWxlIHRpbGUgdG8gbG9jYWwgZXh0ZW50c1xuICAgICAgICAgICAgbWF4OiB0aWxlLm1heCwgLy8gdXNlZCBieSBUaWxlU291cmNlIHRvIHNjYWxlIHRpbGUgdG8gbG9jYWwgZXh0ZW50c1xuICAgICAgICAgICAgZGVidWc6IHRpbGUuZGVidWdcbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyZXJfdHlwZTogdGhpcy50eXBlLFxuICAgICAgICB0aWxlX3NvdXJjZTogdGhpcy50aWxlX3NvdXJjZSxcbiAgICAgICAgbGF5ZXJfc291cmNlOiB0aGlzLmxheWVyX3NvdXJjZSxcbiAgICAgICAgc3R5bGVfc291cmNlOiB0aGlzLnN0eWxlX3NvdXJjZVxuICAgIH0pO1xuXG4gICAgdGhpcy51cGRhdGVUaWxlRWxlbWVudCh0aWxlLCBkaXYpO1xuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIGRpdik7XG4gICAgfVxufTtcblxuLy8gUmVidWlsZCBhbGwgdGlsZXNcbi8vIFRPRE86IG9ubHkgcmVidWlsZCBjZXJ0YWluIGxheWVycz9cblZlY3RvclJlbmRlcmVyLnByb3RvdHlwZS5yZWJ1aWxkVGlsZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIFRlbGwgd29ya2VycyB3ZSdyZSBhYm91dCB0byByZWJ1aWxkIChzbyB0aGV5IGNhbiByZWZyZXNoIHN0eWxlcywgZXRjLilcbiAgICB0aGlzLndvcmtlcnMuZm9yRWFjaChmdW5jdGlvbih3b3JrZXIpIHtcbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6ICdtYXJrRm9yUmVidWlsZCdcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBSZWxvYWQgb24gbWFpbiB0aHJlYWRcbiAgICB0aGlzLmxheWVycyA9IFZlY3RvclJlbmRlcmVyLmxvYWRMYXllcnModGhpcy5sYXllcl9zb3VyY2UpO1xuICAgIHRoaXMuc3R5bGVzID0gVmVjdG9yUmVuZGVyZXIubG9hZFN0eWxlcyh0aGlzLnN0eWxlX3NvdXJjZSk7XG5cbiAgICAvLyBUT0RPOiByZWJ1aWxkIHZpc2libGUgdGlsZXMgZmlyc3QsIGZyb20gY2VudGVyIG91dFxuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNbdF07XG5cbiAgICAgICAgdGhpcy53b3JrZXJQb3N0TWVzc2FnZUZvclRpbGUodGlsZSwge1xuICAgICAgICAgICAgdHlwZTogJ2J1aWxkVGlsZScsXG4gICAgICAgICAgICB0aWxlOiB7XG4gICAgICAgICAgICAgICAga2V5OiB0aWxlLmtleSxcbiAgICAgICAgICAgICAgICBjb29yZHM6IHRpbGUuY29vcmRzLCAvLyB1c2VkIGJ5IHN0eWxlIGhlbHBlcnNcbiAgICAgICAgICAgICAgICBsYXllcnM6IHRpbGUubGF5ZXJzLFxuICAgICAgICAgICAgICAgIGRlYnVnOiB0aWxlLmRlYnVnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVuZGVyZXJfdHlwZTogdGhpcy50eXBlLFxuICAgICAgICAgICAgbGF5ZXJfc291cmNlOiB0aGlzLmxheWVyX3NvdXJjZSxcbiAgICAgICAgICAgIHN0eWxlX3NvdXJjZTogdGhpcy5zdHlsZV9zb3VyY2VcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuLy8gQ2FsbGVkIG9uIG1haW4gdGhyZWFkIHdoZW4gYSB3ZWIgd29ya2VyIGNvbXBsZXRlcyBwcm9jZXNzaW5nIGZvciBhIHNpbmdsZSB0aWxlIChpbml0aWFsIGxvYWQsIG9yIHJlYnVpbGQpXG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUud29ya2VyQnVpbGRUaWxlQ29tcGxldGVkID0gZnVuY3Rpb24gKGV2ZW50KVxue1xuICAgIGlmIChldmVudC5kYXRhLnR5cGUgIT0gJ2J1aWxkVGlsZUNvbXBsZXRlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0aWxlID0gZXZlbnQuZGF0YS50aWxlO1xuXG4gICAgLy8gUmVtb3ZlZCB0aGlzIHRpbGUgZHVyaW5nIGxvYWQ/XG4gICAgaWYgKHRoaXMudGlsZXNbdGlsZS5rZXldID09IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJkaXNjYXJkZWQgdGlsZSBcIiArIHRpbGUua2V5ICsgXCIgaW4gVmVjdG9yUmVuZGVyZXIudGlsZVdvcmtlckNvbXBsZXRlZCBiZWNhdXNlIHByZXZpb3VzbHkgcmVtb3ZlZFwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aWxlIHdpdGggcHJvcGVydGllcyBmcm9tIHdvcmtlclxuICAgIHRpbGUgPSB0aGlzLm1lcmdlVGlsZSh0aWxlLmtleSwgdGlsZSk7XG5cbiAgICAvLyBDaGlsZCBjbGFzcy1zcGVjaWZpYyB0aWxlIHByb2Nlc3NpbmdcbiAgICBpZiAodHlwZW9mKHRoaXMuX3RpbGVXb3JrZXJDb21wbGV0ZWQpID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5fdGlsZVdvcmtlckNvbXBsZXRlZCh0aWxlKTtcbiAgICB9XG5cbiAgICAvLyBOT1RFOiB3YXMgcHJldmlvdXNseSBkZWxldGluZyBzb3VyY2UgZGF0YSB0byBzYXZlIG1lbW9yeSwgYnV0IG5vdyBuZWVkIHRvIHNhdmUgZm9yIHJlLWJ1aWxkaW5nIGdlb21ldHJ5XG4gICAgLy8gZGVsZXRlIHRpbGUubGF5ZXJzO1xuXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gICAgdGhpcy50cmFja1RpbGVTZXRMb2FkRW5kKCk7XG4gICAgdGhpcy5wcmludERlYnVnRm9yVGlsZSh0aWxlKTtcbn07XG5cblZlY3RvclJlbmRlcmVyLnByb3RvdHlwZS5yZW1vdmVUaWxlID0gZnVuY3Rpb24gKGtleSlcbntcbiAgICBjb25zb2xlLmxvZyhcInRpbGUgdW5sb2FkIGZvciBcIiArIGtleSk7XG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV07XG4gICAgaWYgKHRpbGUgIT0gbnVsbCAmJiB0aWxlLmxvYWRpbmcgPT0gdHJ1ZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImNhbmNlbCB0aWxlIGxvYWQgZm9yIFwiICsga2V5KTtcblxuICAgICAgICAvLyBXZWIgd29ya2VyIHdpbGwgY2FuY2VsIFhIUiByZXF1ZXN0c1xuICAgICAgICBpZiAodGlsZS53b3JrZXIgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy53b3JrZXJzW3RpbGUud29ya2VyXS5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3JlbW92ZVRpbGUnLFxuICAgICAgICAgICAgICAgIGtleTogdGlsZS5rZXlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVsZXRlIHRoaXMudGlsZXNba2V5XTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cbi8vIEF0dGFjaGVzIHRyYWNraW5nIGFuZCBkZWJ1ZyBpbnRvIHRvIHRoZSBwcm92aWRlZCB0aWxlIERPTSBlbGVtZW50XG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUudXBkYXRlVGlsZUVsZW1lbnQgPSBmdW5jdGlvbiAodGlsZSwgZGl2KVxue1xuICAgIC8vIERlYnVnIGluZm9cbiAgICBkaXYuc2V0QXR0cmlidXRlKCdkYXRhLXRpbGUta2V5JywgdGlsZS5rZXkpO1xuICAgIGRpdi5zdHlsZS53aWR0aCA9ICcyNTZweCc7XG4gICAgZGl2LnN0eWxlLmhlaWdodCA9ICcyNTZweCc7XG5cbiAgICBpZiAodGhpcy5kZWJ1Zykge1xuICAgICAgICB2YXIgZGVidWdfb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkZWJ1Z19vdmVybGF5LnRleHRDb250ZW50ID0gdGlsZS5rZXk7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBkZWJ1Z19vdmVybGF5LnN0eWxlLmxlZnQgPSAwO1xuICAgICAgICBkZWJ1Z19vdmVybGF5LnN0eWxlLnRvcCA9IDA7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUuY29sb3IgPSAnd2hpdGUnO1xuICAgICAgICBkZWJ1Z19vdmVybGF5LnN0eWxlLmZvbnRTaXplID0gJzE2cHgnO1xuICAgICAgICAvLyBkZWJ1Z19vdmVybGF5LnN0eWxlLnRleHRPdXRsaW5lID0gJzFweCAjMDAwMDAwJztcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRlYnVnX292ZXJsYXkpO1xuXG4gICAgICAgIGRpdi5zdHlsZS5ib3JkZXJTdHlsZSA9ICdzb2xpZCc7XG4gICAgICAgIGRpdi5zdHlsZS5ib3JkZXJDb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIGRpdi5zdHlsZS5ib3JkZXJXaWR0aCA9ICcxcHgnO1xuICAgIH1cbn07XG5cbi8vIE1lcmdlIHByb3BlcnRpZXMgZnJvbSBhIHByb3ZpZGVkIHRpbGUgb2JqZWN0IGludG8gdGhlIG1haW4gdGlsZSBzdG9yZS4gU2hhbGxvdyBtZXJnZSAoanVzdCBjb3BpZXMgdG9wLWxldmVsIHByb3BlcnRpZXMpIVxuLy8gVXNlZCBmb3Igc2VsZWN0aXZlbHkgdXBkYXRpbmcgcHJvcGVydGllcyBvZiB0aWxlcyBwYXNzZWQgYmV0d2VlbiBtYWluIHRocmVhZCBhbmQgd29ya2VyXG4vLyAoc28gd2UgZG9uJ3QgaGF2ZSB0byBwYXNzIHRoZSB3aG9sZSB0aWxlLCBpbmNsdWRpbmcgc29tZSBwcm9wZXJ0aWVzIHdoaWNoIGNhbm5vdCBiZSBjbG9uZWQgZm9yIGEgd29ya2VyKS5cblZlY3RvclJlbmRlcmVyLnByb3RvdHlwZS5tZXJnZVRpbGUgPSBmdW5jdGlvbiAoa2V5LCBzb3VyY2VfdGlsZSlcbntcbiAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNba2V5XTtcblxuICAgIGlmICh0aWxlID09IG51bGwpIHtcbiAgICAgICAgdGhpcy50aWxlc1trZXldID0gc291cmNlX3RpbGU7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzW2tleV07XG4gICAgfVxuXG4gICAgZm9yICh2YXIgcCBpbiBzb3VyY2VfdGlsZSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm1lcmdpbmcgXCIgKyBwICsgXCI6IFwiICsgc291cmNlX3RpbGVbcF0pO1xuICAgICAgICB0aWxlW3BdID0gc291cmNlX3RpbGVbcF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRpbGU7XG59O1xuXG4vLyBQcm9maWxpbmcgbWV0aG9kcyB1c2VkIHRvIHRyYWNrIHdoZW4gc2V0cyBvZiB0aWxlcyBzdGFydC9zdG9wIGxvYWRpbmcgdG9nZXRoZXJcbi8vIGUuZy4gaW5pdGlhbCBwYWdlIGxvYWQgaXMgb25lIHNldCBvZiB0aWxlcywgbmV3IHNldHMgb2YgdGlsZSBsb2FkcyBhcmUgdGhlbiBpbml0aWF0ZWQgYnkgYSBtYXAgcGFuIG9yIHpvb21cblZlY3RvclJlbmRlcmVyLnByb3RvdHlwZS50cmFja1RpbGVTZXRMb2FkU3RhcnQgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIFN0YXJ0IHRyYWNraW5nIG5ldyB0aWxlIHNldCBpZiBubyBvdGhlciB0aWxlcyBhbHJlYWR5IGxvYWRpbmdcbiAgICBpZiAodGhpcy50aWxlX3NldF9sb2FkaW5nID09IG51bGwpIHtcbiAgICAgICAgdGhpcy50aWxlX3NldF9sb2FkaW5nID0gK25ldyBEYXRlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidGlsZSBzZXQgbG9hZCBTVEFSVFwiKTtcbiAgICB9XG59O1xuXG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUudHJhY2tUaWxlU2V0TG9hZEVuZCA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gTm8gbW9yZSB0aWxlcyBhY3RpdmVseSBsb2FkaW5nP1xuICAgIGlmICh0aGlzLnRpbGVfc2V0X2xvYWRpbmcgIT0gbnVsbCkge1xuICAgICAgICB2YXIgZW5kX3RpbGVfc2V0ID0gdHJ1ZTtcbiAgICAgICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50aWxlc1t0XS5sb2FkaW5nID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbmRfdGlsZV9zZXQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbmRfdGlsZV9zZXQgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5sYXN0X3RpbGVfc2V0X2xvYWQgPSAoK25ldyBEYXRlKCkpIC0gdGhpcy50aWxlX3NldF9sb2FkaW5nO1xuICAgICAgICAgICAgdGhpcy50aWxlX3NldF9sb2FkaW5nID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGlsZSBzZXQgbG9hZCBGSU5JU0hFRCBpbjogXCIgKyB0aGlzLmxhc3RfdGlsZV9zZXRfbG9hZCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUucHJpbnREZWJ1Z0ZvclRpbGUgPSBmdW5jdGlvbiAodGlsZSlcbntcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgXCJkZWJ1ZyBmb3IgXCIgKyB0aWxlLmtleSArICc6IFsgJyArXG4gICAgICAgIE9iamVjdC5rZXlzKHRpbGUuZGVidWcpLm1hcChmdW5jdGlvbiAodCkgeyByZXR1cm4gdCArICc6ICcgKyB0aWxlLmRlYnVnW3RdOyB9KS5qb2luKCcsICcpICsgJyBdJ1xuICAgICk7XG59O1xuXG5cbi8qKiogQ2xhc3MgbWV0aG9kcyAoc3RhdGVsZXNzKSAqKiovXG5cbi8vIFNpbXBsaXN0aWMgZGV0ZWN0aW9uIG9mIHJlbGF0aXZlIHBhdGhzLCBhcHBlbmQgYmFzZSBpZiBuZWNlc3NhcnlcblZlY3RvclJlbmRlcmVyLnVybEZvclBhdGggPSBmdW5jdGlvbiAocGF0aCkge1xuICAgIHZhciBwcm90b2NvbCA9IHBhdGgudG9Mb3dlckNhc2UoKS5zdWJzdHIoMCwgNCk7XG4gICAgaWYgKCEocHJvdG9jb2wgPT0gJ2h0dHAnIHx8IHByb3RvY29sID09ICdmaWxlJykpIHtcbiAgICAgICAgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBwYXRoO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aDtcbn07XG5cblZlY3RvclJlbmRlcmVyLmxvYWRMYXllcnMgPSBmdW5jdGlvbiAodXJsKVxue1xuICAgIHZhciBsYXllcnM7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7IGV2YWwoJ2xheWVycyA9ICcgKyByZXEucmVzcG9uc2UpOyB9OyAvLyBUT0RPOiBzZWN1cml0eSFcbiAgICByZXEub3BlbignR0VUJywgdXJsICsgJz8nICsgKCtuZXcgRGF0ZSgpKSwgZmFsc2UgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgcmVxLnNlbmQoKTtcbiAgICByZXR1cm4gbGF5ZXJzO1xufTtcblxuVmVjdG9yUmVuZGVyZXIubG9hZFN0eWxlcyA9IGZ1bmN0aW9uICh1cmwpXG57XG4gICAgdmFyIHN0eWxlcztcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHsgZXZhbCgnc3R5bGVzID0gJyArIHJlcS5yZXNwb25zZSk7IH07IC8vIFRPRE86IHNlY3VyaXR5IVxuICAgIHJlcS5vcGVuKCdHRVQnLCB1cmwgKyAnPycgKyAoK25ldyBEYXRlKCkpLCBmYWxzZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICByZXEuc2VuZCgpO1xuXG4gICAgLy8gUHJvY2VzcyBzdHlsZXMgdG8gcHJlcGFyZSBmb3IgcmVuZGVyZXJcbiAgICBmb3IgKHZhciBsYXllciBpbiBzdHlsZXMpIHtcbiAgICAgICAgc3R5bGVzW2xheWVyXS52aXNpYmxlID0gIShzdHlsZXNbbGF5ZXJdLnZpc2libGUgPT09IGZhbHNlKTsgLy8gbGF5ZXJzIGFyZSB2aXNpYmxlIHVubGVzcyBleHBsaWNpdGx5IHNldCB0byBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiBzdHlsZXM7XG59O1xuXG4vLyBQcm9jZXNzZXMgdGhlIHRpbGUgcmVzcG9uc2UgdG8gY3JlYXRlIGxheWVycyBhcyBkZWZpbmVkIGJ5IHRoaXMgcmVuZGVyZXJcbi8vIENhbiBpbmNsdWRlIHBvc3QtcHJvY2Vzc2luZyB0byBwYXJ0aWFsbHkgZmlsdGVyIG9yIHJlLWFycmFuZ2UgZGF0YSwgZS5nLiBvbmx5IGluY2x1ZGluZyBQT0lzIHRoYXQgaGF2ZSBuYW1lc1xuVmVjdG9yUmVuZGVyZXIucHJvY2Vzc0xheWVyc0ZvclRpbGUgPSBmdW5jdGlvbiAobGF5ZXJzLCB0aWxlKVxue1xuICAgIHZhciB0aWxlX2xheWVycyA9IHt9O1xuICAgIGZvciAodmFyIHQ9MDsgdCA8IGxheWVycy5sZW5ndGg7IHQrKykge1xuICAgICAgICBsYXllcnNbdF0ubnVtYmVyID0gdDtcblxuICAgICAgICBpZiAobGF5ZXJzW3RdICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEp1c3QgcGFzcyB0aHJvdWdoIGRhdGEgdW50b3VjaGVkIGlmIG5vIGRhdGEgdHJhbnNmb3JtIGZ1bmN0aW9uIGRlZmluZWRcbiAgICAgICAgICAgIGlmIChsYXllcnNbdF0uZGF0YSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gdGlsZS5sYXllcnNbbGF5ZXJzW3RdLm5hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGFzcyB0aHJvdWdoIGRhdGEgYnV0IHdpdGggZGlmZmVyZW50IGxheWVyIG5hbWUgaW4gdGlsZSBzb3VyY2UgZGF0YVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGxheWVyc1t0XS5kYXRhID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gdGlsZS5sYXllcnNbbGF5ZXJzW3RdLmRhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQXBwbHkgdGhlIHRyYW5zZm9ybSBmdW5jdGlvbiBmb3IgcG9zdC1wcm9jZXNzaW5nXG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgbGF5ZXJzW3RdLmRhdGEgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IGxheWVyc1t0XS5kYXRhKHRpbGUubGF5ZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhhbmRsZSBjYXNlcyB3aGVyZSBubyBkYXRhIHdhcyBmb3VuZCBpbiB0aWxlIG9yIHJldHVybmVkIGJ5IHBvc3QtcHJvY2Vzc29yXG4gICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSB8fCB7IHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsIGZlYXR1cmVzOiBbXSB9O1xuICAgIH1cbiAgICB0aWxlLmxheWVycyA9IHRpbGVfbGF5ZXJzO1xuICAgIHJldHVybiB0aWxlX2xheWVycztcbn07XG5cblxuLyoqKiBTdHlsZSBwYXJzaW5nICYgZGVmYXVsdHMgKioqL1xuXG4vLyBEZXRlcm1pbmUgZmluYWwgc3R5bGUgcHJvcGVydGllcyAoY29sb3IsIHdpZHRoLCBldGMuKVxuVmVjdG9yUmVuZGVyZXIuc3R5bGVfZGVmYXVsdHMgPSB7XG4gICAgY29sb3I6IFsxLjAsIDAsIDBdLFxuICAgIHdpZHRoOiBTdHlsZS53aWR0aC5waXhlbHMoNSksXG4gICAgc2l6ZTogU3R5bGUud2lkdGgucGl4ZWxzKDUpLFxuICAgIGV4dHJ1ZGU6IGZhbHNlLFxuICAgIGhlaWdodDogMjAsXG4gICAgbWluX2hlaWdodDogMCxcbiAgICBvdXRsaW5lOiB7XG4gICAgICAgIC8vIGNvbG9yOiBbMS4wLCAwLCAwXSxcbiAgICAgICAgLy8gd2lkdGg6IDEsXG4gICAgICAgIC8vIGRhc2g6IG51bGxcbiAgICB9LFxuICAgIC8vIHJlbmRlcl9tb2RlOiB7XG4gICAgLy8gICAgIG5hbWU6ICdwb2x5Z29ucydcbiAgICAvLyB9XG4gICAgcmVuZGVyX21vZGU6ICdwb2x5Z29ucydcbn07XG5cblZlY3RvclJlbmRlcmVyLnBhcnNlU3R5bGVGb3JGZWF0dXJlID0gZnVuY3Rpb24gKGZlYXR1cmUsIGxheWVyX3N0eWxlLCB0aWxlKVxue1xuICAgIHZhciBsYXllcl9zdHlsZSA9IGxheWVyX3N0eWxlIHx8IHt9O1xuICAgIHZhciBzdHlsZSA9IHt9O1xuXG4gICAgLy8gVGVzdCB3aGV0aGVyIGZlYXR1cmVzIHNob3VsZCBiZSByZW5kZXJlZCBhdCBhbGxcbiAgICBpZiAodHlwZW9mIGxheWVyX3N0eWxlLmZpbHRlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChsYXllcl9zdHlsZS5maWx0ZXIoZmVhdHVyZSwgdGlsZSkgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUGFyc2Ugc3R5bGVzXG4gICAgc3R5bGUuY29sb3IgPSAobGF5ZXJfc3R5bGUuY29sb3IgJiYgKGxheWVyX3N0eWxlLmNvbG9yW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5jb2xvci5kZWZhdWx0KSkgfHwgVmVjdG9yUmVuZGVyZXIuc3R5bGVfZGVmYXVsdHMuY29sb3I7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5jb2xvciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLmNvbG9yID0gc3R5bGUuY29sb3IoZmVhdHVyZSwgdGlsZSk7XG4gICAgfVxuXG4gICAgc3R5bGUud2lkdGggPSAobGF5ZXJfc3R5bGUud2lkdGggJiYgKGxheWVyX3N0eWxlLndpZHRoW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS53aWR0aC5kZWZhdWx0KSkgfHwgVmVjdG9yUmVuZGVyZXIuc3R5bGVfZGVmYXVsdHMud2lkdGg7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS53aWR0aCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLndpZHRoID0gc3R5bGUud2lkdGgoZmVhdHVyZSwgdGlsZSk7XG4gICAgfVxuXG4gICAgc3R5bGUuc2l6ZSA9IChsYXllcl9zdHlsZS5zaXplICYmIChsYXllcl9zdHlsZS5zaXplW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5zaXplLmRlZmF1bHQpKSB8fCBWZWN0b3JSZW5kZXJlci5zdHlsZV9kZWZhdWx0cy5zaXplO1xuICAgIGlmICh0eXBlb2Ygc3R5bGUuc2l6ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLnNpemUgPSBzdHlsZS5zaXplKGZlYXR1cmUsIHRpbGUpO1xuICAgIH1cblxuICAgIHN0eWxlLmV4dHJ1ZGUgPSAobGF5ZXJfc3R5bGUuZXh0cnVkZSAmJiAobGF5ZXJfc3R5bGUuZXh0cnVkZVtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUuZXh0cnVkZS5kZWZhdWx0KSkgfHwgVmVjdG9yUmVuZGVyZXIuc3R5bGVfZGVmYXVsdHMuZXh0cnVkZTtcbiAgICBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5leHRydWRlID0gc3R5bGUuZXh0cnVkZShmZWF0dXJlLCB0aWxlKTsgLy8gcmV0dXJuaW5nIGEgYm9vbGVhbiB3aWxsIGV4dHJ1ZGUgd2l0aCB0aGUgZmVhdHVyZSdzIGhlaWdodCwgYSBudW1iZXIgd2lsbCBvdmVycmlkZSB0aGUgZmVhdHVyZSBoZWlnaHQgKHNlZSBiZWxvdylcbiAgICB9XG5cbiAgICBzdHlsZS5oZWlnaHQgPSAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5oZWlnaHQpIHx8IFZlY3RvclJlbmRlcmVyLnN0eWxlX2RlZmF1bHRzLmhlaWdodDtcbiAgICBzdHlsZS5taW5faGVpZ2h0ID0gKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMubWluX2hlaWdodCkgfHwgVmVjdG9yUmVuZGVyZXIuc3R5bGVfZGVmYXVsdHMubWluX2hlaWdodDtcblxuICAgIC8vIGhlaWdodCBkZWZhdWx0cyB0byBmZWF0dXJlIGhlaWdodCwgYnV0IGV4dHJ1ZGUgc3R5bGUgY2FuIGR5bmFtaWNhbGx5IGFkanVzdCBoZWlnaHQgYnkgcmV0dXJuaW5nIGEgbnVtYmVyIG9yIGFycmF5IChpbnN0ZWFkIG9mIGEgYm9vbGVhbilcbiAgICBpZiAoc3R5bGUuZXh0cnVkZSkge1xuICAgICAgICBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHN0eWxlLmhlaWdodCA9IHN0eWxlLmV4dHJ1ZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ29iamVjdCcgJiYgc3R5bGUuZXh0cnVkZS5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgc3R5bGUubWluX2hlaWdodCA9IHN0eWxlLmV4dHJ1ZGVbMF07XG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQgPSBzdHlsZS5leHRydWRlWzFdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3R5bGUueiA9IChsYXllcl9zdHlsZS56ICYmIChsYXllcl9zdHlsZS56W2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS56LmRlZmF1bHQpKSB8fCBWZWN0b3JSZW5kZXJlci5zdHlsZV9kZWZhdWx0cy56IHx8IDA7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS56ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUueiA9IHN0eWxlLnooZmVhdHVyZSwgdGlsZSk7XG4gICAgfVxuXG4gICAgc3R5bGUub3V0bGluZSA9IHt9O1xuICAgIGxheWVyX3N0eWxlLm91dGxpbmUgPSBsYXllcl9zdHlsZS5vdXRsaW5lIHx8IHt9O1xuICAgIHN0eWxlLm91dGxpbmUuY29sb3IgPSAobGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvciAmJiAobGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvcltmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvci5kZWZhdWx0KSkgfHwgVmVjdG9yUmVuZGVyZXIuc3R5bGVfZGVmYXVsdHMub3V0bGluZS5jb2xvcjtcbiAgICBpZiAodHlwZW9mIHN0eWxlLm91dGxpbmUuY29sb3IgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5vdXRsaW5lLmNvbG9yID0gc3R5bGUub3V0bGluZS5jb2xvcihmZWF0dXJlLCB0aWxlKTtcbiAgICB9XG5cbiAgICBzdHlsZS5vdXRsaW5lLndpZHRoID0gKGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGggJiYgKGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGhbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGguZGVmYXVsdCkpIHx8IFZlY3RvclJlbmRlcmVyLnN0eWxlX2RlZmF1bHRzLm91dGxpbmUud2lkdGg7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5vdXRsaW5lLndpZHRoID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUub3V0bGluZS53aWR0aCA9IHN0eWxlLm91dGxpbmUud2lkdGgoZmVhdHVyZSwgdGlsZSk7XG4gICAgfVxuXG4gICAgc3R5bGUub3V0bGluZS5kYXNoID0gKGxheWVyX3N0eWxlLm91dGxpbmUuZGFzaCAmJiAobGF5ZXJfc3R5bGUub3V0bGluZS5kYXNoW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5vdXRsaW5lLmRhc2guZGVmYXVsdCkpIHx8IFZlY3RvclJlbmRlcmVyLnN0eWxlX2RlZmF1bHRzLm91dGxpbmUuZGFzaDtcbiAgICBpZiAodHlwZW9mIHN0eWxlLm91dGxpbmUuZGFzaCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLm91dGxpbmUuZGFzaCA9IHN0eWxlLm91dGxpbmUuZGFzaChmZWF0dXJlLCB0aWxlKTtcbiAgICB9XG5cbiAgICBzdHlsZS5yZW5kZXJfbW9kZSA9IGxheWVyX3N0eWxlLnJlbmRlcl9tb2RlIHx8IFZlY3RvclJlbmRlcmVyLnN0eWxlX2RlZmF1bHRzLnJlbmRlcl9tb2RlO1xuICAgIC8vIHN0eWxlLnJlbmRlcl9tb2RlID0ge307XG4gICAgLy8gc3R5bGUucmVuZGVyX21vZGUubmFtZSA9IChsYXllcl9zdHlsZS5yZW5kZXJfbW9kZSAmJiBsYXllcl9zdHlsZS5yZW5kZXJfbW9kZS5uYW1lKSB8fCBWZWN0b3JSZW5kZXJlci5zdHlsZV9kZWZhdWx0cy5yZW5kZXJfbW9kZS5uYW1lO1xuXG4gICAgcmV0dXJuIHN0eWxlO1xufTtcblxuLy8gUHJpdmF0ZS9pbnRlcm5hbFxuLy8gR2V0IGJhc2UgVVJMIGZyb20gd2hpY2ggdGhlIGxpYnJhcnkgd2FzIGxvYWRlZFxuLy8gVXNlZCB0byBsb2FkIGFkZGl0aW9uYWwgcmVzb3VyY2VzIGxpa2Ugc2hhZGVycywgdGV4dHVyZXMsIGV0Yy4gaW4gY2FzZXMgd2hlcmUgbGlicmFyeSB3YXMgbG9hZGVkIGZyb20gYSByZWxhdGl2ZSBwYXRoXG5mdW5jdGlvbiBmaW5kQmFzZUxpYnJhcnlVUkwgKClcbntcbiAgICB0cnkge1xuICAgICAgICBWZWN0b3JSZW5kZXJlci5saWJyYXJ5X2Jhc2VfdXJsID0gJyc7XG4gICAgICAgIHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpOyAvLyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbc3JjKj1cIi5qc1wiXScpO1xuICAgICAgICBmb3IgKHZhciBzPTA7IHMgPCBzY3JpcHRzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICB2YXIgbWF0Y2ggPSBzY3JpcHRzW3NdLnNyYy5pbmRleE9mKCd2ZWN0b3ItbWFwLmRlYnVnLmpzJyk7XG4gICAgICAgICAgICBpZiAobWF0Y2ggPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBtYXRjaCA9IHNjcmlwdHNbc10uc3JjLmluZGV4T2YoJ3ZlY3Rvci1tYXAubWluLmpzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWF0Y2ggPj0gMCkge1xuICAgICAgICAgICAgICAgIFZlY3RvclJlbmRlcmVyLmxpYnJhcnlfYmFzZV91cmwgPSBzY3JpcHRzW3NdLnNyYy5zdWJzdHIoMCwgbWF0Y2gpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIC8vIHNraXAgaW4gd2ViIHdvcmtlclxuICAgIH1cbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gVmVjdG9yUmVuZGVyZXI7XG59XG4iXX0=
(10)
});
