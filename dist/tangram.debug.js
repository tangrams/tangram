!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Tangram=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.2.1
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


(function(_global) {
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
      shim.exports = typeof(window) !== 'undefined' ? window : _global;
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

if(!GLMAT_RANDOM) {
    var GLMAT_RANDOM = Math.random;
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

var degree = Math.PI / 180;

/**
* Convert Degree To Radian
*
* @param {Number} Angle in Degrees
*/
glMatrix.toRadian = function(a){
     return a * degree;
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
 * Subtracts vector b from vector a
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
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
vec2.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
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
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */
vec2.random = function (out, scale) {
    scale = scale || 1.0;
    var r = GLMAT_RANDOM() * 2.0 * Math.PI;
    out[0] = Math.cos(r) * scale;
    out[1] = Math.sin(r) * scale;
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
 * Subtracts vector b from vector a
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
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
vec3.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
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
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
vec3.random = function (out, scale) {
    scale = scale || 1.0;

    var r = GLMAT_RANDOM() * 2.0 * Math.PI;
    var z = (GLMAT_RANDOM() * 2.0) - 1.0;
    var zScale = Math.sqrt(1.0-z*z) * scale;

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
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
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat3 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
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
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

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

/*
* Rotate a 3D vector around the x-axis
* @param {vec3} out The receiving vec3
* @param {vec3} a The vec3 point to rotate
* @param {vec3} b The origin of the rotation
* @param {Number} c The angle of rotation
* @returns {vec3} out
*/
vec3.rotateX = function(out, a, b, c){
   var p = [], r=[];
	  //Translate point to the origin
	  p[0] = a[0] - b[0];
	  p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];

	  //perform rotation
	  r[0] = p[0];
	  r[1] = p[1]*Math.cos(c) - p[2]*Math.sin(c);
	  r[2] = p[1]*Math.sin(c) + p[2]*Math.cos(c);

	  //translate to correct position
	  out[0] = r[0] + b[0];
	  out[1] = r[1] + b[1];
	  out[2] = r[2] + b[2];

  	return out;
};

/*
* Rotate a 3D vector around the y-axis
* @param {vec3} out The receiving vec3
* @param {vec3} a The vec3 point to rotate
* @param {vec3} b The origin of the rotation
* @param {Number} c The angle of rotation
* @returns {vec3} out
*/
vec3.rotateY = function(out, a, b, c){
  	var p = [], r=[];
  	//Translate point to the origin
  	p[0] = a[0] - b[0];
  	p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];
  
  	//perform rotation
  	r[0] = p[2]*Math.sin(c) + p[0]*Math.cos(c);
  	r[1] = p[1];
  	r[2] = p[2]*Math.cos(c) - p[0]*Math.sin(c);
  
  	//translate to correct position
  	out[0] = r[0] + b[0];
  	out[1] = r[1] + b[1];
  	out[2] = r[2] + b[2];
  
  	return out;
};

/*
* Rotate a 3D vector around the z-axis
* @param {vec3} out The receiving vec3
* @param {vec3} a The vec3 point to rotate
* @param {vec3} b The origin of the rotation
* @param {Number} c The angle of rotation
* @returns {vec3} out
*/
vec3.rotateZ = function(out, a, b, c){
  	var p = [], r=[];
  	//Translate point to the origin
  	p[0] = a[0] - b[0];
  	p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];
  
  	//perform rotation
  	r[0] = p[0]*Math.cos(c) - p[1]*Math.sin(c);
  	r[1] = p[0]*Math.sin(c) + p[1]*Math.cos(c);
  	r[2] = p[2];
  
  	//translate to correct position
  	out[0] = r[0] + b[0];
  	out[1] = r[1] + b[1];
  	out[2] = r[2] + b[2];
  
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
 * Subtracts vector b from vector a
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
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */
vec4.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
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
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */
vec4.random = function (out, scale) {
    scale = scale || 1.0;

    //TODO: This is a pretty awful way of doing this. Find something better.
    out[0] = GLMAT_RANDOM();
    out[1] = GLMAT_RANDOM();
    out[2] = GLMAT_RANDOM();
    out[3] = GLMAT_RANDOM();
    vec4.normalize(out, out);
    vec4.scale(out, out, scale);
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
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
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
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
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
    out[1] = a1 * v0;
    out[2] = a2 * v1;
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

/**
 * Returns Frobenius norm of a mat2
 *
 * @param {mat2} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat2.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2)))
};

/**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param {mat2} L the lower triangular matrix 
 * @param {mat2} D the diagonal matrix 
 * @param {mat2} U the upper triangular matrix 
 * @param {mat2} a the input matrix to factorize
 */

mat2.LDU = function (L, D, U, a) { 
    L[2] = a[2]/a[0]; 
    U[0] = a[0]; 
    U[1] = a[1]; 
    U[3] = a[3] - L[2] * U[1]; 
    return [L, D, U];       
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
 * [a, c, tx,
 *  b, d, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, c, tx,
 *  b, d, ty,
 *  0, 0, 1]
 * </pre>
 * The last row is ignored so the array is shorter and operations are faster.
 */

var mat2d = {};

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
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
    out[4] = a0 * b4 + a2 * b5 + a4;
    out[5] = a1 * b4 + a3 * b5 + a5;
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
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
    out[4] = a4;
    out[5] = a5;
    return out;
};

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
mat2d.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v0;
    out[2] = a2 * v1;
    out[3] = a3 * v1;
    out[4] = a4;
    out[5] = a5;
    return out;
};

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
mat2d.translate = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        v0 = v[0], v1 = v[1];
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = a0 * v0 + a2 * v1 + a4;
    out[5] = a1 * v0 + a3 * v1 + a5;
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

/**
 * Returns Frobenius norm of a mat2d
 *
 * @param {mat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat2d.frob = function (a) { 
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1))
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
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
mat3.fromMat4 = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
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
    var x = v[0], y = v[1];

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
 * @param {mat2d} a the matrix to copy
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
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[3] = yx - wz;
    out[6] = zx + wy;

    out[1] = yx + wz;
    out[4] = 1 - xx - zz;
    out[7] = zy - wx;

    out[2] = zx - wy;
    out[5] = zy + wx;
    out[8] = 1 - xx - yy;

    return out;
};

/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/
mat3.normalFromMat4 = function (out, a) {
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
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

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

/**
 * Returns Frobenius norm of a mat3
 *
 * @param {mat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat3.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2)))
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

mat4.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;

    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;

    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
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

/**
 * Returns Frobenius norm of a mat4
 *
 * @param {mat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat4.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2) ))
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
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */
quat.rotationTo = (function() {
    var tmpvec3 = vec3.create();
    var xUnitVec3 = vec3.fromValues(1,0,0);
    var yUnitVec3 = vec3.fromValues(0,1,0);

    return function(out, a, b) {
        var dot = vec3.dot(a, b);
        if (dot < -0.999999) {
            vec3.cross(tmpvec3, xUnitVec3, a);
            if (vec3.length(tmpvec3) < 0.000001)
                vec3.cross(tmpvec3, yUnitVec3, a);
            vec3.normalize(tmpvec3, tmpvec3);
            quat.setAxisAngle(out, tmpvec3, Math.PI);
            return out;
        } else if (dot > 0.999999) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        } else {
            vec3.cross(tmpvec3, a, b);
            out[0] = tmpvec3[0];
            out[1] = tmpvec3[1];
            out[2] = tmpvec3[2];
            out[3] = 1 + dot;
            return quat.normalize(out, out);
        }
    };
})();

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */
quat.setAxes = (function() {
    var matr = mat3.create();

    return function(out, view, right, up) {
        matr[0] = right[0];
        matr[3] = right[1];
        matr[6] = right[2];

        matr[1] = up[0];
        matr[4] = up[1];
        matr[7] = up[2];

        matr[2] = -view[0];
        matr[5] = -view[1];
        matr[8] = -view[2];

        return quat.normalize(out, quat.fromMat3(out, matr));
    };
})();

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
 * Rotates a quaternion by the given angle about the X axis
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
 * Rotates a quaternion by the given angle about the Y axis
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
 * Rotates a quaternion by the given angle about the Z axis
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
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    var        omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if ( cosom < 0.0 ) {
        cosom = -cosom;
        bx = - bx;
        by = - by;
        bz = - bz;
        bw = - bw;
    }
    // calculate coefficients
    if ( (1.0 - cosom) > 0.000001 ) {
        // standard case (slerp)
        omega  = Math.acos(cosom);
        sinom  = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {        
        // "from" and "to" quaternions are very close 
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
    }
    // calculate final values
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;
    
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
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat.fromMat3 = function(out, m) {
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
        var j = (i+1)%3;
        var k = (i+2)%3;
        
        fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[k*3+j] - m[j*3+k]) * fRoot;
        out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
        out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
    }
    
    return out;
};

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
})(this);

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

},{"./point.js":14}],4:[function(_dereq_,module,exports){
// WebGL management and rendering functions

var Utils = _dereq_('../utils.js');
// var GLVertexArrayObject = require('./gl_vao.js');

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

    var gl = canvas.getContext('experimental-webgl');
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

    // GLVertexArrayObject.init(gl); // TODO: this pattern doesn't support multiple active GL contexts, should that even be supported?

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

// Compile & link a WebGL program from provided vertex and fragment shader sources
// update a program if one is passed in. Create one if not. Alert and don't update anything if the shaders don't compile.
GL.updateProgram = function GLupdateProgram (gl, program, vertex_shader_source, fragment_shader_source)
{
    try {
        var vertex_shader = GL.createShader(gl, vertex_shader_source, gl.VERTEX_SHADER);
        var fragment_shader = GL.createShader(gl, '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment_shader_source, gl.FRAGMENT_SHADER);
    }
    catch(err) {
        // alert(err);
        console.log(err);
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
        console.log(program_error);
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

// Triangulation using libtess.js port of gluTesselator
// https://github.com/brendankenny/libtess.js
try {
    GL.tesselator = (function initTesselator() {
        var tesselator = new libtess.GluTesselator();

        // Called for each vertex of tesselator output
        function vertexCallback(data, polyVertArray) {
            if (tesselator.z != null) {
                polyVertArray.push([data[0], data[1], tesselator.z]);
            }
            else {
                polyVertArray.push([data[0], data[1]]);
            }
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

    GL.triangulatePolygon = function GLTriangulate (contours, z)
    {
        var triangleVerts = [];
        GL.tesselator.z = z;
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

// Add vertices to an array (destined to be used as a GL buffer), 'striping' each vertex with constant data
// Per-vertex attributes must be pre-packed into the vertices array
// Used for adding values that are often constant per geometry or polygon, like colors, normals (for polys sitting flat on map), layer and material info, etc.
GL.addVertices = function (vertices, vertex_constants, vertex_data)
{
    if (vertices == null) {
        return vertex_data;
    }
    vertex_constants = vertex_constants || [];

    for (var v=0, vlen = vertices.length; v < vlen; v++) {
        vertex_data.push.apply(vertex_data, vertices[v]);
        vertex_data.push.apply(vertex_data, vertex_constants);
    }

    return vertex_data;
};

// Add vertices to an array, 'striping' each vertex with constant data
// Multiple, un-packed attribute arrays can be provided
GL.addVerticesMultipleAttributes = function (dynamics, constants, vertex_data)
{
    var dlen = dynamics.length;
    var vlen = dynamics[0].length;
    constants = constants || [];

    for (var v=0; v < vlen; v++) {
        for (var d=0; d < dlen; d++) {
            vertex_data.push.apply(vertex_data, dynamics[d][v]);
        }
        vertex_data.push.apply(vertex_data, constants);
    }

    return vertex_data;
};

// Add vertices to an array, with a variable layout (both per-vertex dynamic and constant attribs)
// GL.addVerticesByAttributeLayout = function (attribs, vertex_data)
// {
//     var max_length = 0;
//     for (var a=0; a < attribs.length; a++) {
//         // console.log(attribs[a].name);
//         // console.log("a " + typeof attribs[a].data);
//         if (typeof attribs[a].data == 'object') {
//             // console.log("a[0] " + typeof attribs[a].data[0]);
//             // Per-vertex list - array of array
//             if (typeof attribs[a].data[0] == 'object') {
//                 attribs[a].cursor = 0;
//                 if (attribs[a].data.length > max_length) {
//                     max_length = attribs[a].data.length;
//                 }
//             }
//             // Static array for all vertices
//             else {
//                 attribs[a].next_vertex = attribs[a].data;
//             }
//         }
//         else {
//             // Static single value for all vertices, convert to array
//             attribs[a].next_vertex = [attribs[a].data];
//         }
//     }

//     for (var v=0; v < max_length; v++) {
//         for (var a=0; a < attribs.length; a++) {
//             if (attribs[a].cursor != null) {
//                 // Next value in list
//                 attribs[a].next_vertex = attribs[a].data[attribs[a].cursor];

//                 // TODO: repeats if one list is shorter than others - desired behavior, or enforce same length?
//                 if (attribs[a].cursor < attribs[a].data.length) {
//                     attribs[a].cursor++;
//                 }
//             }
//             vertex_data.push.apply(vertex_data, attribs[a].next_vertex);
//         }
//     }
//     return vertex_data;
// };

if (module !== undefined) {
    module.exports = GL;
}

},{"../utils.js":17}],5:[function(_dereq_,module,exports){
var Vector = _dereq_('../vector.js');
var Point = _dereq_('../point.js');
var GL = _dereq_('./gl.js');

var GLBuilders = {};

GLBuilders.debug = false;

// Tesselate a flat 2D polygon with fixed height and add to GL vertex buffer
GLBuilders.buildPolygons = function GLBuildersBuildPolygons (polygons, z, vertex_data, options)
{
    options = options || {};

    var vertex_constants = [];
    if (z != null) {
        vertex_constants.push(z); // provided z
    }
    if (options.normals) {
        vertex_constants.push(0, 0, 1); // upwards-facing normal
    }
    if (options.vertex_constants) {
        vertex_constants.push.apply(vertex_constants, options.vertex_constants);
    }
    if (vertex_constants.length == 0) {
        vertex_constants = null;
    }

    var num_polygons = polygons.length;
    for (var p=0; p < num_polygons; p++) {
        var vertices = GL.triangulatePolygon(polygons[p]);
        GL.addVertices(vertices, vertex_constants, vertex_data);
    }

    return vertex_data;
};

// Callback-base builder (for future exploration)
// Tesselate a flat 2D polygon with fixed height and add to GL vertex buffer
// GLBuilders.buildPolygons2 = function GLBuildersBuildPolygon2 (polygons, z, addGeometry, options)
// {
//     options = options || {};

//     var num_polygons = polygons.length;
//     for (var p=0; p < num_polygons; p++) {
//         var vertices = {
//             positions: GL.triangulatePolygon(polygons[p], z),
//             normals: (options.normals ? [0, 0, 1] : null)
//         };

//         addGeometry(vertices);
//     }
// };

// Tesselate and extrude a flat 2D polygon into a simple 3D model with fixed height and add to GL vertex buffer
GLBuilders.buildExtrudedPolygons = function GLBuildersBuildExtrudedPolygon (polygons, z, height, min_height, vertex_data, options)
{
    options = options || {};
    var min_z = z + (min_height || 0);
    var max_z = z + height;

    // Top
    GLBuilders.buildPolygons(polygons, max_z, vertex_data, { normals: true, vertex_constants: options.vertex_constants });
    // var top_vertex_constants = [0, 0, 1];
    // if (options.vertex_constants != null) {
    //     top_vertex_constants.push.apply(top_vertex_constants, options.vertex_constants);
    // }
    // GLBuilders.buildPolygons2(
    //     polygons,
    //     max_z,
    //     function (vertices) {
    //         GL.addVertices(vertices.positions, top_vertex_constants, vertex_data);
    //     }
    // );

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

                GL.addVertices(wall_vertices, wall_vertex_constants, vertex_data);
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

    GL.addVertices(vertices, vertex_constants, vertex_data);

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
// Z coord, normals, and texcoords are optional
// Layout order is:
//   position (2 or 3 components)
//   texcoord (optional, 2 components)
//   normal (optional, 3 components)
//   constants (optional)
GLBuilders.buildQuadsForPoints = function (points, width, height, z, vertex_data, options)
{
    var options = options || {};

    var vertex_constants = [];
    if (options.normals) {
        vertex_constants.push(0, 0, 1); // upwards-facing normal
    }
    if (options.vertex_constants) {
        vertex_constants.push.apply(vertex_constants, options.vertex_constants);
    }
    if (vertex_constants.length == 0) {
        vertex_constants = null;
    }

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

        // Add provided z
        if (z != null) {
            positions[0][2] = z;
            positions[1][2] = z;
            positions[2][2] = z;
            positions[3][2] = z;
            positions[4][2] = z;
            positions[5][2] = z;
        }

        if (options.texcoords == true) {
            var texcoords = [
                [-1, -1],
                [1, -1],
                [1, 1],

                [-1, -1],
                [1, 1],
                [-1, 1]
            ];

            GL.addVerticesMultipleAttributes([positions, texcoords], vertex_constants, vertex_data);
        }
        else {
            GL.addVertices(positions, vertex_constants, vertex_data);
        }
    }

    return vertex_data;
};

// Callback-base builder (for future exploration)
// GLBuilders.buildQuadsForPoints2 = function GLBuildersBuildQuadsForPoints (points, width, height, addGeometry, options)
// {
//     var options = options || {};

//     var num_points = points.length;
//     for (var p=0; p < num_points; p++) {
//         var point = points[p];

//         var positions = [
//             [point[0] - width/2, point[1] - height/2],
//             [point[0] + width/2, point[1] - height/2],
//             [point[0] + width/2, point[1] + height/2],

//             [point[0] - width/2, point[1] - height/2],
//             [point[0] + width/2, point[1] + height/2],
//             [point[0] - width/2, point[1] + height/2],
//         ];

//         if (options.texcoords == true) {
//             var texcoords = [
//                 [-1, -1],
//                 [1, -1],
//                 [1, 1],

//                 [-1, -1],
//                 [1, 1],
//                 [-1, 1]
//             ];
//         }

//         var vertices = {
//             positions: positions,
//             normals: (options.normals ? [0, 0, 1] : null),
//             texcoords: (options.texcoords && texcoords)
//         };
//         addGeometry(vertices);
//     }
// };

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

},{"../point.js":14,"../vector.js":18,"./gl.js":4}],6:[function(_dereq_,module,exports){
/*** Manage rendering for primitives ***/
var GL = _dereq_('./gl.js');
var GLVertexLayout = _dereq_('./gl_vertex_layout.js');
// var GLVertexArrayObject = require('./gl_vao.js');
var GLProgram = _dereq_('./gl_program.js');

// A single mesh/VBO, described by a vertex layout, that can be drawn with one or more programs
function GLGeometry (gl, vertex_data, vertex_layout, options)
{
    options = options || {};

    this.gl = gl;
    this.vertex_data = vertex_data; // Float32Array
    this.vertex_layout = vertex_layout;
    this.buffer = this.gl.createBuffer();
    this.draw_mode = options.draw_mode || this.gl.TRIANGLES;
    this.data_usage = options.data_usage || this.gl.STATIC_DRAW;
    this.vertices_per_geometry = 3; // TODO: support lines, strip, fan, etc.

    this.vertex_count = this.vertex_data.byteLength / this.vertex_layout.stride;
    this.geometry_count = this.vertex_count / this.vertices_per_geometry;

    // TODO: disabling VAOs for now because we need to support different vertex layout + program combinations,
    // where not all programs will recognize all attributes (e.g. feature selection shaders include extra attrib).
    // To support VAOs here, would need to support multiple per geometry, keyed by GL program?
    // this.vao = GLVertexArrayObject.create(function() {
    //     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    //     this.setup();
    // }.bind(this));

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertex_data, this.data_usage);
}

// Render, by default with currently bound program, or otherwise with optionally provided one
GLGeometry.prototype.render = function (options)
{
    options = options || {};

    // GLVertexArrayObject.bind(this.vao);

    if (typeof this._render_setup == 'function') {
        this._render_setup();
    }

    var gl_program = options.gl_program || GLProgram.current;
    gl_program.use();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.vertex_layout.enable(this.gl, gl_program);

    // TODO: support element array mode
    this.gl.drawArrays(this.draw_mode, 0, this.vertex_count);
    // GLVertexArrayObject.bind(null);
};

GLGeometry.prototype.destroy = function ()
{
    console.log("GLGeometry.destroy: delete buffer of size " + this.vertex_data.byteLength);
    this.gl.deleteBuffer(this.buffer);
    delete this.vertex_data;
};

if (module !== undefined) {
    module.exports = GLGeometry;
}

},{"./gl.js":4,"./gl_program.js":8,"./gl_vertex_layout.js":11}],7:[function(_dereq_,module,exports){
// Rendering modes

var GL = _dereq_('./gl.js');
var GLBuilders = _dereq_('./gl_builders.js');
var GLGeometry = _dereq_('./gl_geom.js');
var GLVertexLayout = _dereq_('./gl_vertex_layout.js');
var GLProgram = _dereq_('./gl_program.js');
var shader_sources = _dereq_('./gl_shaders.js'); // built-in shaders

var Queue = _dereq_('queue-async');

// Base

var RenderMode = {
    init: function (gl) {
        this.gl = gl;
        this.makeGLProgram();

        if (typeof this._init == 'function') {
            this._init();
        }
    },
    refresh: function () { // TODO: should this be async/non-blocking?
        this.makeGLProgram();
    },
    defines: {},
    selection: false,
    buildPolygons: function(){}, // build functions are no-ops until overriden
    buildLines: function(){},
    buildPoints: function(){},
    makeGLGeometry: function (vertex_data) {
        return new GLGeometry(this.gl, vertex_data, this.vertex_layout);
    }
};

RenderMode.makeGLProgram = function ()
{
    // console.log(this.name + ": " + "start building");
    var queue = Queue();

    // Build defines & for selection (need to create a new object since the first is stored as a reference by the program)
    var defines = this.buildDefineList();
    if (this.selection) {
        var selection_defines = Object.create(defines);
        selection_defines['FEATURE_SELECTION'] = true;
    }

    // Get any custom code transforms
    var transforms = (this.shaders && this.shaders.transforms);

    // Create shaders - programs may point to inherited parent properties, but should be replaced by subclass version
    var program = (this.hasOwnProperty('gl_program') && this.gl_program);
    var selection_program = (this.hasOwnProperty('selection_gl_program') && this.selection_gl_program);

    queue.defer(function(complete) {
        if (!program) {
            // console.log(this.name + ": " + "instantiate");
            program = new GLProgram(
                this.gl,
                shader_sources[this.vertex_shader_key],
                shader_sources[this.fragment_shader_key],
                {
                    defines: defines,
                    transforms: transforms,
                    name: this.name,
                    callback: complete
                }
            );
        }
        else {
            // console.log(this.name + ": " + "re-compile");
            program.defines = defines;
            program.transforms = transforms;
            program.compile(complete);
        }
    }.bind(this));

    if (this.selection) {
        queue.defer(function(complete) {
            if (!selection_program) {
                // console.log(this.name + ": " + "selection instantiate");
                selection_program = new GLProgram(
                    this.gl,
                    shader_sources[this.vertex_shader_key],
                    shader_sources['selection_fragment'],
                    {
                        defines: selection_defines,
                        transforms: transforms,
                        name: (this.name + ' (selection)'),
                        callback: complete
                    }
                );
            }
            else {
                // console.log(this.name + ": " + "selection re-compile");
                selection_program.defines = selection_defines;
                selection_program.transforms = transforms;
                selection_program.compile(complete);
            }
        }.bind(this));
    }

    // Wait for program(s) to compile before replacing them
    // TODO: should this entire method offer a callback for when compilation completes?
    queue.await(function() {
       if (program) {
           this.gl_program = program;
       }

       if (selection_program) {
           this.selection_gl_program = selection_program;
       }

       // console.log(this.name + ": " + "finished building");
    }.bind(this));
}

// TODO: could probably combine and generalize this with similar method in GLProgram
// (list of define objects that inherit from each other)
RenderMode.buildDefineList = function ()
{
    // Add any custom defines to built-in mode defines
    var defines = {}; // create a new object to avoid mutating a prototype value that may be shared with other modes
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

// Set mode uniforms on currently bound program
RenderMode.setUniforms = function ()
{
    var gl_program = GLProgram.current;
    if (gl_program != null && this.shaders != null && this.shaders.uniforms != null) {
        gl_program.setUniforms(this.shaders.uniforms);
    }
};

RenderMode.update = function ()
{
    // Mode-specific animation
    if (typeof this.animation == 'function') {
        this.animation();
    }
};


var Modes = {};
var ModeManager = {};

// Update built-in mode or create a new one
ModeManager.configureMode = function (name, settings)
{
    Modes[name] = Modes[name] || Object.create(Modes[settings.extends] || RenderMode);
    if (Modes[settings.extends]) {
        Modes[name].parent = Modes[settings.extends]; // explicit 'super' class access
    }

    for (var s in settings) {
        Modes[name][s] = settings[s];
    }

    Modes[name].name = name;
    return Modes[name];
};


// Built-in rendering modes

/*** Plain polygons ***/

Modes.polygons = Object.create(RenderMode);
Modes.polygons.name = 'polygons';

Modes.polygons.vertex_shader_key = 'polygon_vertex';
Modes.polygons.fragment_shader_key = 'polygon_fragment';

Modes.polygons.defines = {
    'WORLD_POSITION_WRAP': 100000 // default world coords to wrap every 100,000 meters, can turn off by setting this to 'false'
};

Modes.polygons.selection = true;

Modes.polygons._init = function () {
    this.vertex_layout = new GLVertexLayout(this.gl, [
        { name: 'a_position', size: 3, type: this.gl.FLOAT, normalized: false },
        { name: 'a_normal', size: 3, type: this.gl.FLOAT, normalized: false },
        { name: 'a_color', size: 3, type: this.gl.FLOAT, normalized: false },
        { name: 'a_selection_color', size: 4, type: this.gl.FLOAT, normalized: false },
        { name: 'a_layer', size: 1, type: this.gl.FLOAT, normalized: false }
    ]);
};

Modes.polygons.buildPolygons = function (polygons, style, vertex_data)
{
    // Color and layer number are currently constant across vertices
    var vertex_constants = [
        style.color[0], style.color[1], style.color[2],
        style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3],
        style.layer_num
    ];

    // Outlines have a slightly different set of constants, because the layer number is modified
    if (style.outline.color) {
        var outline_vertex_constants = [
            style.outline.color[0], style.outline.color[1], style.outline.color[2],
            style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3],
            style.layer_num - 0.5 // outlines sit between layers, underneath current layer but above the one below
        ];
    }

    // Extruded polygons (e.g. 3D buildings)
    if (style.extrude && style.height) {
        GLBuilders.buildExtrudedPolygons(
            polygons,
            style.z,
            style.height,
            style.min_height,
            vertex_data,
            {
                vertex_constants: vertex_constants
            }
        );
    }
    // Regular polygons
    else {
        GLBuilders.buildPolygons(
            polygons,
            style.z,
            vertex_data,
            {
                normals: true,
                vertex_constants: vertex_constants
            }
        );

        // Callback-base builder (for future exploration)
        // var normal_vertex_constants = [0, 0, 1].concat(vertex_constants);
        // GLBuilders.buildPolygons2(
        //     polygons,
        //     z,
        //     function (vertices) {
        //         // var vs = vertices.positions;
        //         // for (var v in vs) {
        //         //     // var bc = [(v % 3) ? 0 : 1, ((v + 1) % 3) ? 0 : 1, ((v + 2) % 3) ? 0 : 1];
        //         //     // var bc = [centroid.x, centroid.y, 0];
        //         //     // vs[v] = vertices.positions[v].concat(z, 0, 0, 1, bc);

        //         //     // vs[v] = vertices.positions[v].concat(z, 0, 0, 1);
        //         //     vs[v] = vertices.positions[v].concat(0, 0, 1);
        //         // }

        //         GL.addVertices(vertices.positions, normal_vertex_constants, vertex_data);

        //         // GL.addVerticesByAttributeLayout(
        //         //     [
        //         //         { name: 'a_position', data: vertices.positions },
        //         //         { name: 'a_normal', data: [0, 0, 1] },
        //         //         { name: 'a_color', data: [style.color[0], style.color[1], style.color[2]] },
        //         //         { name: 'a_layer', data: style.layer_num }
        //         //     ],
        //         //     vertex_data
        //         // );

        //         // GL.addVerticesMultipleAttributes([vertices.positions], normal_vertex_constants, vertex_data);
        //     }
        // );
    }

    // Polygon outlines
    if (style.outline.color && style.outline.width) {
        for (var mpc=0; mpc < polygons.length; mpc++) {
            GLBuilders.buildPolylines(
                polygons[mpc],
                style.z,
                style.outline.width,
                vertex_data,
                {
                    closed_polygon: true,
                    remove_tile_edges: true,
                    vertex_constants: outline_vertex_constants
                }
            );
        }
    }
};

Modes.polygons.buildLines = function (lines, style, vertex_data)
{
    // TOOD: reduce redundancy of constant calc between builders
    // Color and layer number are currently constant across vertices
    var vertex_constants = [
        style.color[0], style.color[1], style.color[2],
        style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3],
        style.layer_num
    ];

    // Outlines have a slightly different set of constants, because the layer number is modified
    if (style.outline.color) {
        var outline_vertex_constants = [
            style.outline.color[0], style.outline.color[1], style.outline.color[2],
            style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3],
            style.layer_num - 0.5 // outlines sit between layers, underneath current layer but above the one below
        ];
    }

    // Main lines
    GLBuilders.buildPolylines(
        lines,
        style.z,
        style.width,
        vertex_data,
        {
            vertex_constants: vertex_constants
        }
    );

    // Line outlines
    if (style.outline.color && style.outline.width) {
        GLBuilders.buildPolylines(
            lines,
            style.z,
            style.width + 2 * style.outline.width,
            vertex_data,
            {
                vertex_constants: outline_vertex_constants
            }
        );
    }
};

Modes.polygons.buildPoints = function (points, style, vertex_data)
{
    // TOOD: reduce redundancy of constant calc between builders
    // Color and layer number are currently constant across vertices
    var vertex_constants = [
        style.color[0], style.color[1], style.color[2],
        style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3],
        style.layer_num
    ];

    GLBuilders.buildQuadsForPoints(
        points,
        style.size * 2,
        style.size * 2,
        style.z,
        vertex_data,
        {
            normals: true,
            texcoords: false,
            vertex_constants: vertex_constants
        }
    );
};


/*** Points w/simple distance field rendering ***/

Modes.points = Object.create(RenderMode);
Modes.points.name = 'points';

Modes.points.vertex_shader_key = 'point_vertex';
Modes.points.fragment_shader_key = 'point_fragment';

Modes.points.defines = {
    'EFFECT_SCREEN_COLOR': true
};

Modes.points.selection = true;

Modes.points._init = function () {
    this.vertex_layout = new GLVertexLayout(this.gl, [
        { name: 'a_position', size: 3, type: this.gl.FLOAT, normalized: false },
        { name: 'a_texcoord', size: 2, type: this.gl.FLOAT, normalized: false },
        { name: 'a_color', size: 3, type: this.gl.FLOAT, normalized: false },
        { name: 'a_selection_color', size: 4, type: this.gl.FLOAT, normalized: false },
        { name: 'a_layer', size: 1, type: this.gl.FLOAT, normalized: false }
    ]);
};

Modes.points.buildPoints = function (points, style, vertex_data)
{
    // TOOD: reduce redundancy of constant calc between builders
    // Color and layer number are currently constant across vertices
    var vertex_constants = [
        style.color[0], style.color[1], style.color[2],
        style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3],
        style.layer_num
    ];

    GLBuilders.buildQuadsForPoints(
        points,
        style.size * 2,
        style.size * 2,
        style.z,
        vertex_data,
        {
            normals: false,
            texcoords: true,
            vertex_constants: vertex_constants
        }
    );
};

if (module !== undefined) {
    module.exports = {
        ModeManager: ModeManager,
        Modes: Modes
    };
}

},{"./gl.js":4,"./gl_builders.js":5,"./gl_geom.js":6,"./gl_program.js":8,"./gl_shaders.js":9,"./gl_vertex_layout.js":11,"queue-async":2}],8:[function(_dereq_,module,exports){
// Thin GL program wrapp to cache uniform locations/values, do compile-time pre-processing
// (injecting #defines and #pragma transforms into shaders), etc.

var GL = _dereq_('./gl.js');
var GLTexture = _dereq_('./gl_texture.js');
var Utils = _dereq_('../utils.js');
var Queue = _dereq_('queue-async');

GLProgram.id = 0; // assign each program a unique id
GLProgram.programs = {}; // programs, by id

function GLProgram (gl, vertex_shader, fragment_shader, options)
{
    options = options || {};

    this.gl = gl;
    this.program = null;
    this.compiled = false;
    this.defines = options.defines || {}; // key/values inserted as #defines into shaders at compile-time
    this.transforms = options.transforms; // key/values for URLs of blocks that can be injected into shaders at compile-time
    this.uniforms = {}; // program locations of uniforms, set/updated at compile-time
    this.attribs = {}; // program locations of vertex attributes

    this.vertex_shader = vertex_shader;
    this.fragment_shader = fragment_shader;

    this.id = GLProgram.id++;
    GLProgram.programs[this.id] = this;
    this.name = options.name; // can provide a program name (useful for debugging)

    this.compile(options.callback);
};

// Use program wrapper with simple state cache
GLProgram.prototype.use = function ()
{
    if (!this.compiled) {
        return;
    }

    if (GLProgram.current != this) {
        this.gl.useProgram(this.program);
    }
    GLProgram.current = this;
};
GLProgram.current = null;

// Global defines applied to all programs (duplicate properties for a specific program will take precedence)
GLProgram.defines = {};

GLProgram.prototype.compile = function (callback)
{
    var queue = Queue();

    // Copy sources from pre-modified template
    this.computed_vertex_shader = this.vertex_shader;
    this.computed_fragment_shader = this.fragment_shader;

    // Make list of defines to be injected later
    var defines = this.buildDefineList();

    // Inject user-defined transforms (arbitrary code points matching named #pragmas)
    // Replace according to this pattern:
    // #pragma tangram: [key]
    // e.g. #pragma tangram: globals

    // TODO: flag to avoid re-retrieving transform URLs over network when rebuilding?
    // TODO: support glslify #pragma export names for better compatibility? (e.g. rename main() functions)
    // TODO: auto-insert uniforms referenced in mode definition, but not in shader base or transforms? (problem: don't have access to uniform list/type here)

    // Gather all transform code snippets (can be either inline in the style file, or over the network via URL)
    // This is an async process, since code may be retrieved remotely
    var regexp;
    var loaded_transforms = {}; // master list of transforms, with an ordered list for each (since we want to guarantee order of transforms)
    if (this.transforms != null) {

        for (var key in this.transforms) {
            var transform = this.transforms[key];
            if (transform == null) {
                continue;
            }

            // Each code point can be a single item (string or hash object) or a list (array object with non-zero length)
            if (typeof transform == 'string' || (typeof transform == 'object' && transform.length == null)) {
                transform = [transform];
            }

            // First find code replace points in shaders
            var regexp = new RegExp('^\\s*#pragma\\s+tangram:\\s+' + key + '\\s*$', 'm');
            var inject_vertex = this.computed_vertex_shader.match(regexp);
            var inject_fragment = this.computed_fragment_shader.match(regexp);

            // Avoid network request if nothing to replace
            if (inject_vertex == null && inject_fragment == null) {
                continue;
            }

            // Collect all transforms for this type
            loaded_transforms[key] = {};
            loaded_transforms[key].regexp = new RegExp(regexp); // save regexp so we can inject later without having to recreate it
            loaded_transforms[key].inject_vertex = (inject_vertex != null); // save regexp code point matches so we don't have to do them again
            loaded_transforms[key].inject_fragment = (inject_fragment != null);
            loaded_transforms[key].list = [];

            // Get the code (possibly over the network, so needs to be async)
            for (var u=0; u < transform.length; u++) {
                queue.defer(GLProgram.loadTransform, loaded_transforms, transform[u], key, u);
            }

            // Add a #define for this injection point
            defines['TANGRAM_TRANSFORM_' + key.replace(' ', '_').toUpperCase()] = true;
        }
    }

    // When all transform code snippets are collected, combine and inject them
    queue.await(function(error) {
        if (error) {
            console.log("error loading transforms: " + error);
            return;
        }

        // Do the code injection with the collected sources
        for (var t in loaded_transforms) {
            // Concatenate
            var combined_source = "";
            for (var s=0; s < loaded_transforms[t].list.length; s++) {
                combined_source += loaded_transforms[t].list[s] + '\n';
            }

            // Inject
            if (loaded_transforms[t].inject_vertex != null) {
                this.computed_vertex_shader = this.computed_vertex_shader.replace(loaded_transforms[t].regexp, combined_source);
            }
            if (loaded_transforms[t].inject_fragment != null) {
                this.computed_fragment_shader = this.computed_fragment_shader.replace(loaded_transforms[t].regexp, combined_source);
            }
        }

        // Clean-up any #pragmas that weren't replaced (to prevent compiler warnings)
        var regexp = new RegExp('^\\s*#pragma\\s+tangram:\\s+\\w+\\s*$', 'gm');
        this.computed_vertex_shader = this.computed_vertex_shader.replace(regexp, '');
        this.computed_fragment_shader = this.computed_fragment_shader.replace(regexp, '');

        // Build & inject defines
        // This is done *after* code injection so that we can add defines for which code points were injected
        var define_str = GLProgram.buildDefineString(defines);
        this.computed_vertex_shader = define_str + this.computed_vertex_shader;
        this.computed_fragment_shader = define_str + this.computed_fragment_shader;

        // Include program info useful for debugging
        var info = (this.name ? (this.name + ' / id ' + this.id) : ('id ' + this.id));
        this.computed_vertex_shader = '// Program: ' + info + '\n' + this.computed_vertex_shader;
        this.computed_fragment_shader = '// Program: ' + info + '\n' + this.computed_fragment_shader;

        // Compile & set uniforms to cached values
        try {
            this.program = GL.updateProgram(this.gl, this.program, this.computed_vertex_shader, this.computed_fragment_shader);
            // this.program = GL.updateProgram(this.gl, null, this.computed_vertex_shader, this.computed_fragment_shader);
            this.compiled = true;
        }
        catch (e) {
            this.program = null;
            this.compiled = false;
        }

        this.use();
        this.refreshUniforms();
        this.refreshAttributes();

        // Notify caller
        if (typeof callback == 'function') {
            callback();
        }
    }.bind(this));
};

// Retrieve a single transform, for a given injection point, at a certain index (to preserve original order)
// Can be async, calls 'complete' callback when done
GLProgram.loadTransform = function (transforms, block, key, index, complete) {
    // Can be an inline block of GLSL, or a URL to retrieve GLSL block from
    var type, value, source;

    // Inline code
    if (typeof block == 'string') {
        transforms[key].list[index] = block;
        complete();
    }
    // Remote code
    else if (typeof block == 'object' && block.url) {
        var req = new XMLHttpRequest();

        req.onload = function () {
            source = req.response;
            transforms[key].list[index] = source;
            complete();
        };
        req.open('GET', Utils.urlForPath(block.url) + '?' + (+new Date()), true /* async flag */);
        req.responseType = 'text';
        req.send();
    }
};

// Make list of defines (global, then program-specific)
GLProgram.prototype.buildDefineList = function () {
    var defines = {};
    for (var d in GLProgram.defines) {
        defines[d] = GLProgram.defines[d];
    }
    for (var d in this.defines) {
        defines[d] = this.defines[d];
    }
    return defines;
};

// Turn #defines into a combined string
GLProgram.buildDefineString = function (defines) {
    var define_str = "";
    for (var d in defines) {
        if (defines[d] == false) {
            continue;
        }
        else if (typeof defines[d] == 'boolean' && defines[d] == true) { // booleans are simple defines with no value
            define_str += "#define " + d + "\n";
        }
        else if (typeof defines[d] == 'number' && Math.floor(defines[d]) == defines[d]) { // int to float conversion to satisfy GLSL floats
            define_str += "#define " + d + " " + defines[d].toFixed(1) + "\n";
        }
        else { // any other float or string value
            define_str += "#define " + d + " " + defines[d] + "\n";
        }
    }
    return define_str;
};

// Set uniforms from a JS object, with inferred types
GLProgram.prototype.setUniforms = function (uniforms)
{
    // TODO: only update uniforms when changed
    var texture_unit = 0;

    for (var u in uniforms) {
        var uniform = uniforms[u];

        // Single float
        if (typeof uniform == 'number') {
            this.uniform('1f', u, uniform);
        }
        // Multiple floats - vector or array
        else if (typeof uniform == 'object') {
            // float vectors (vec2, vec3, vec4)
            if (uniform.length >= 2 && uniform.length <= 4) {
                this.uniform(uniform.length + 'fv', u, uniform);
            }
            // float array
            else if (uniform.length > 4) {
                this.uniform('1fv', u + '[0]', uniform);
            }
            // TODO: assume matrix for (typeof == Float32Array && length == 16)?
        }
        // Boolean
        else if (typeof this.shaders.uniforms[u] == 'boolean') {
            this.uniform('1i', u, uniform);
        }
        // Texture
        else if (typeof uniform == 'string') {
            var texture = GLTexture.textures[uniform];
            if (texture == null) {
                texture = new GLTexture(this.gl, uniform);
                texture.load(uniform);
            }

            texture.bind(texture_unit);
            this.uniform('1i', u, texture_unit);
            texture_unit++;
        }
        // TODO: support other non-float types? (int, etc.)
    }
};

// ex: program.uniform('3f', 'position', x, y, z);
// TODO: only update uniforms when changed
GLProgram.prototype.uniform = function (method, name) // method-appropriate arguments follow
{
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

// Set a single uniform
GLProgram.prototype.updateUniform = function (name)
{
    if (!this.compiled) {
        return;
    }

    var uniform = this.uniforms[name];
    if (uniform == null || uniform.location == null) {
        return;
    }

    this.use();
    this.gl[uniform.method].apply(this.gl, [uniform.location].concat(uniform.values)); // call appropriate GL uniform method and pass through arguments
};

// Refresh uniform locations and set to last cached values
GLProgram.prototype.refreshUniforms = function ()
{
    if (!this.compiled) {
        return;
    }

    for (var u in this.uniforms) {
        this.uniforms[u].location = this.gl.getUniformLocation(this.program, u);
        this.updateUniform(u);
    }
};

GLProgram.prototype.refreshAttributes = function ()
{
    // var len = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
    // for (var i=0; i < len; i++) {
    //     var a = this.gl.getActiveAttrib(this.program, i);
    //     console.log(a);
    // }
    this.attribs = {};
};

// Get the location of a vertex attribute
GLProgram.prototype.attribute = function (name)
{
    if (!this.compiled) {
        return;
    }

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

if (module !== undefined) {
    module.exports = GLProgram;
}

},{"../utils.js":17,"./gl.js":4,"./gl_texture.js":10,"queue-async":2}],9:[function(_dereq_,module,exports){
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
"  vec3 lighting = vec3(1.);\n" +
"  float len = length(v_texcoord);\n" +
"  if(len > 1.) {\n" +
"    discard;\n" +
"  }\n" +
"  color *= (1. - smoothstep(.25, 1., len)) + 0.5;\n" +
"  #pragma tangram: fragment\n" +
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
"#if defined(FEATURE_SELECTION)\n" +
"\n" +
"attribute vec4 a_selection_color;\n" +
"varying vec4 v_selection_color;\n" +
"#endif\n" +
"\n" +
"float a_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" +
"  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" +
"  float z_layer = (layer + 1.) * z_layer_scale;\n" +
"  z = z_layer + clamp(z, 0., z_layer_scale);\n" +
"  z = (z_layer_range - z) / z_layer_range;\n" +
"  return z;\n" +
"}\n" +
"#pragma tangram: globals\n" +
"\n" +
"void main() {\n" +
"  \n" +
"  #if defined(FEATURE_SELECTION)\n" +
"  if(a_selection_color.xyz == vec3(0.)) {\n" +
"    gl_Position = vec4(0.);\n" +
"    return;\n" +
"  }\n" +
"  v_selection_color = a_selection_color;\n" +
"  #endif\n" +
"  vec4 position = u_meter_view * u_tile_view * vec4(a_position, 1.);\n" +
"  #pragma tangram: vertex\n" +
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
"uniform float u_map_zoom;\n" +
"uniform vec2 u_map_center;\n" +
"uniform vec2 u_tile_origin;\n" +
"uniform float u_test;\n" +
"uniform float u_test2;\n" +
"varying vec3 v_color;\n" +
"varying vec4 v_world_position;\n" +
"#if defined(WORLD_POSITION_WRAP)\n" +
"\n" +
"vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" +
"vec4 absoluteWorldPosition() {\n" +
"  return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" +
"}\n" +
"#else\n" +
"\n" +
"vec4 absoluteWorldPosition() {\n" +
"  return v_world_position;\n" +
"}\n" +
"#endif\n" +
"\n" +
"#if defined(LIGHTING_ENVIRONMENT)\n" +
"\n" +
"uniform sampler2D u_env_map;\n" +
"#endif\n" +
"\n" +
"#if !defined(LIGHTING_VERTEX)\n" +
"\n" +
"varying vec4 v_position;\n" +
"varying vec3 v_normal;\n" +
"#else\n" +
"\n" +
"varying vec3 v_lighting;\n" +
"#endif\n" +
"\n" +
"const float light_ambient = 0.5;\n" +
"vec3 b_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" +
"  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" +
"  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" +
"  return color;\n" +
"}\n" +
"vec3 c_x_specularLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" +
"  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" +
"  vec3 view_pos = vec3(0., 0., 500.);\n" +
"  vec3 view_dir = normalize(position.xyz - view_pos.xyz);\n" +
"  vec3 specularReflection;\n" +
"  if(dot(normal, -light_dir) < 0.0) {\n" +
"    specularReflection = vec3(0.0, 0.0, 0.0);\n" +
"  } else {\n" +
"    float attenuation = 1.0;\n" +
"    float lightSpecularTerm = 1.0;\n" +
"    float materialSpecularTerm = 10.0;\n" +
"    float materialShininessTerm = 10.0;\n" +
"    specularReflection = attenuation * vec3(lightSpecularTerm) * vec3(materialSpecularTerm) * pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);\n" +
"  }\n" +
"  float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));\n" +
"  color *= diffuse + specularReflection + light_ambient;\n" +
"  return color;\n" +
"}\n" +
"vec3 d_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" +
"  light_dir = normalize(light_dir);\n" +
"  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" +
"  return color;\n" +
"}\n" +
"vec3 a_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" +
"  \n" +
"  #if defined(LIGHTING_POINT)\n" +
"  color = b_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" +
"  #elif defined(LIGHTING_POINT_SPECULAR)\n" +
"  color = c_x_specularLight(position, normal, color, light_pos, light_ambient, true);\n" +
"  #elif defined(LIGHTING_NIGHT)\n" +
"  color = b_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" +
"  #elif defined(LIGHTING_DIRECTION)\n" +
"  color = d_x_directionalLight(normal, color, light_dir, light_ambient);\n" +
"  #else\n" +
"  color = color;\n" +
"  #endif\n" +
"  return color;\n" +
"}\n" +
"vec4 e_x_sphericalEnvironmentMap(vec3 view_pos, vec3 position, vec3 normal, sampler2D envmap) {\n" +
"  vec3 eye = normalize(position.xyz - view_pos.xyz);\n" +
"  if(eye.z > 0.01) {\n" +
"    eye.z = 0.01;\n" +
"  }\n" +
"  vec3 r = reflect(eye, normal);\n" +
"  float m = 2. * sqrt(pow(r.x, 2.) + pow(r.y, 2.) + pow(r.z + 1., 2.));\n" +
"  vec2 uv = r.xy / m + .5;\n" +
"  return texture2D(envmap, uv);\n" +
"}\n" +
"#pragma tangram: globals\n" +
"\n" +
"void main(void) {\n" +
"  vec3 color = v_color;\n" +
"  #if defined(LIGHTING_ENVIRONMENT)\n" +
"  vec3 view_pos = vec3(0., 0., 100. * u_meters_per_pixel);\n" +
"  color = e_x_sphericalEnvironmentMap(view_pos, v_position.xyz, v_normal, u_env_map).rgb;\n" +
"  #endif\n" +
"  \n" +
"  #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" +
"  vec3 lighting = a_x_lighting(v_position, v_normal, vec3(1.), vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" +
"  #else\n" +
"  vec3 lighting = v_lighting;\n" +
"  #endif\n" +
"  vec3 color_prelight = color;\n" +
"  color *= lighting;\n" +
"  #pragma tangram: fragment\n" +
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
"uniform float u_map_zoom;\n" +
"uniform vec2 u_map_center;\n" +
"uniform vec2 u_tile_origin;\n" +
"uniform mat4 u_tile_world;\n" +
"uniform mat4 u_tile_view;\n" +
"uniform mat4 u_meter_view;\n" +
"uniform float u_meters_per_pixel;\n" +
"uniform float u_num_layers;\n" +
"attribute vec3 a_position;\n" +
"attribute vec3 a_normal;\n" +
"attribute vec3 a_color;\n" +
"attribute float a_layer;\n" +
"varying vec4 v_world_position;\n" +
"varying vec3 v_color;\n" +
"#if defined(WORLD_POSITION_WRAP)\n" +
"\n" +
"vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" +
"vec4 absoluteWorldPosition() {\n" +
"  return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" +
"}\n" +
"#else\n" +
"\n" +
"vec4 absoluteWorldPosition() {\n" +
"  return v_world_position;\n" +
"}\n" +
"#endif\n" +
"\n" +
"#if defined(FEATURE_SELECTION)\n" +
"\n" +
"attribute vec4 a_selection_color;\n" +
"varying vec4 v_selection_color;\n" +
"#endif\n" +
"\n" +
"#if !defined(LIGHTING_VERTEX)\n" +
"\n" +
"varying vec4 v_position;\n" +
"varying vec3 v_normal;\n" +
"#else\n" +
"\n" +
"varying vec3 v_lighting;\n" +
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
"float c_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" +
"  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" +
"  float z_layer = (layer + 1.) * z_layer_scale;\n" +
"  z = z_layer + clamp(z, 0., z_layer_scale);\n" +
"  z = (z_layer_range - z) / z_layer_range;\n" +
"  return z;\n" +
"}\n" +
"vec3 e_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" +
"  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" +
"  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" +
"  return color;\n" +
"}\n" +
"vec3 f_x_specularLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" +
"  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" +
"  vec3 view_pos = vec3(0., 0., 500.);\n" +
"  vec3 view_dir = normalize(position.xyz - view_pos.xyz);\n" +
"  vec3 specularReflection;\n" +
"  if(dot(normal, -light_dir) < 0.0) {\n" +
"    specularReflection = vec3(0.0, 0.0, 0.0);\n" +
"  } else {\n" +
"    float attenuation = 1.0;\n" +
"    float lightSpecularTerm = 1.0;\n" +
"    float materialSpecularTerm = 10.0;\n" +
"    float materialShininessTerm = 10.0;\n" +
"    specularReflection = attenuation * vec3(lightSpecularTerm) * vec3(materialSpecularTerm) * pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);\n" +
"  }\n" +
"  float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));\n" +
"  color *= diffuse + specularReflection + light_ambient;\n" +
"  return color;\n" +
"}\n" +
"vec3 g_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" +
"  light_dir = normalize(light_dir);\n" +
"  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" +
"  return color;\n" +
"}\n" +
"vec3 d_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" +
"  \n" +
"  #if defined(LIGHTING_POINT)\n" +
"  color = e_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" +
"  #elif defined(LIGHTING_POINT_SPECULAR)\n" +
"  color = f_x_specularLight(position, normal, color, light_pos, light_ambient, true);\n" +
"  #elif defined(LIGHTING_NIGHT)\n" +
"  color = e_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" +
"  #elif defined(LIGHTING_DIRECTION)\n" +
"  color = g_x_directionalLight(normal, color, light_dir, light_ambient);\n" +
"  #else\n" +
"  color = color;\n" +
"  #endif\n" +
"  return color;\n" +
"}\n" +
"#pragma tangram: globals\n" +
"\n" +
"void main() {\n" +
"  \n" +
"  #if defined(FEATURE_SELECTION)\n" +
"  if(a_selection_color.xyz == vec3(0.)) {\n" +
"    gl_Position = vec4(0.);\n" +
"    return;\n" +
"  }\n" +
"  v_selection_color = a_selection_color;\n" +
"  #endif\n" +
"  vec4 position = u_tile_view * vec4(a_position, 1.);\n" +
"  v_world_position = u_tile_world * vec4(a_position, 1.);\n" +
"  #if defined(WORLD_POSITION_WRAP)\n" +
"  v_world_position.xy -= world_position_anchor;\n" +
"  #endif\n" +
"  \n" +
"  #pragma tangram: vertex\n" +
"  \n" +
"  #if defined(LIGHTING_VERTEX)\n" +
"  v_color = a_color;\n" +
"  v_lighting = d_x_lighting(position, a_normal, vec3(1.), vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" +
"  #else\n" +
"  v_position = position;\n" +
"  v_normal = a_normal;\n" +
"  v_color = a_color;\n" +
"  #endif\n" +
"  position = u_meter_view * position;\n" +
"  #if defined(PROJECTION_PERSPECTIVE)\n" +
"  position = a_x_perspective(position, vec2(0., 0.), vec2(0.6, 0.6));\n" +
"  #elif defined(PROJECTION_ISOMETRIC) // || defined(PROJECTION_POPUP)\n" +
"  position = b_x_isometric(position, vec2(0., 1.), 1.);\n" +
"  #endif\n" +
"  position.z = c_x_calculateZ(position.z, a_layer, u_num_layers, 4096.);\n" +
"  gl_Position = position;\n" +
"}\n" +
"";

shader_sources['selection_fragment'] =
"\n" +
"#define GLSLIFY 1\n" +
"\n" +
"#if defined(FEATURE_SELECTION)\n" +
"\n" +
"varying vec4 v_selection_color;\n" +
"#endif\n" +
"\n" +
"void main(void) {\n" +
"  \n" +
"  #if defined(FEATURE_SELECTION)\n" +
"  gl_FragColor = v_selection_color;\n" +
"  #else\n" +
"  gl_FragColor = vec3(0., 0., 0., 1.);\n" +
"  #endif\n" +
"  \n" +
"}\n" +
"";

shader_sources['simple_polygon_fragment'] =
"\n" +
"#define GLSLIFY 1\n" +
"\n" +
"uniform float u_meters_per_pixel;\n" +
"varying vec3 v_color;\n" +
"#if !defined(LIGHTING_VERTEX)\n" +
"\n" +
"varying vec4 v_position;\n" +
"varying vec3 v_normal;\n" +
"#endif\n" +
"\n" +
"vec3 a_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" +
"  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" +
"  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" +
"  return color;\n" +
"}\n" +
"#pragma tangram: globals\n" +
"\n" +
"void main(void) {\n" +
"  vec3 color;\n" +
"  #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" +
"  vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.);\n" +
"  const float light_ambient = 0.5;\n" +
"  const bool backlit = true;\n" +
"  color = a_x_pointLight(v_position, v_normal, v_color, light_pos, light_ambient, backlit);\n" +
"  #else\n" +
"  color = v_color;\n" +
"  #endif\n" +
"  \n" +
"  #pragma tangram: fragment\n" +
"  gl_FragColor = vec4(color, 1.0);\n" +
"}\n" +
"";

shader_sources['simple_polygon_vertex'] =
"\n" +
"#define GLSLIFY 1\n" +
"\n" +
"uniform vec2 u_aspect;\n" +
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
"vec4 a_x_perspective(vec4 position, const vec2 perspective_offset, const vec2 perspective_factor) {\n" +
"  position.xy += position.z * perspective_factor * (position.xy - perspective_offset);\n" +
"  return position;\n" +
"}\n" +
"vec4 b_x_isometric(vec4 position, const vec2 axis, const float multiplier) {\n" +
"  position.xy += position.z * axis * multiplier / u_aspect;\n" +
"  return position;\n" +
"}\n" +
"float c_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" +
"  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" +
"  float z_layer = (layer + 1.) * z_layer_scale;\n" +
"  z = z_layer + clamp(z, 0., z_layer_scale);\n" +
"  z = (z_layer_range - z) / z_layer_range;\n" +
"  return z;\n" +
"}\n" +
"vec3 d_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" +
"  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" +
"  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" +
"  return color;\n" +
"}\n" +
"#pragma tangram: globals\n" +
"\n" +
"void main() {\n" +
"  vec4 position = u_tile_view * vec4(a_position, 1.);\n" +
"  #pragma tangram: vertex\n" +
"  \n" +
"  #if defined(LIGHTING_VERTEX)\n" +
"  vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.);\n" +
"  const float light_ambient = 0.5;\n" +
"  const bool backlit = true;\n" +
"  v_color = d_x_pointLight(position, a_normal, a_color, light_pos, light_ambient, backlit);\n" +
"  #else\n" +
"  v_position = position;\n" +
"  v_normal = a_normal;\n" +
"  v_color = a_color;\n" +
"  #endif\n" +
"  position = u_meter_view * position;\n" +
"  #if defined(PROJECTION_PERSPECTIVE)\n" +
"  position = a_x_perspective(position, vec2(-0.25, -0.25), vec2(0.6, 0.6));\n" +
"  #elif defined(PROJECTION_ISOMETRIC)\n" +
"  position = b_x_isometric(position, vec2(0., 1.), 1.);\n" +
"  #endif\n" +
"  position.z = c_x_calculateZ(position.z, a_layer, u_num_layers, 4096.);\n" +
"  gl_Position = position;\n" +
"}\n" +
"";

if (module.exports !== undefined) { module.exports = shader_sources; }


},{}],10:[function(_dereq_,module,exports){
// Texture management

var GL = _dereq_('./gl.js');
var Utils = _dereq_('../utils.js');

// Global set of textures, by name
GLTexture.textures = {};

// GL texture wrapper object for keeping track of a global set of textures, keyed by an arbitrary name
function GLTexture (gl, name, options) {
    options = options || {};
    this.gl = gl;
    this.texture = gl.createTexture();
    this.bind(0);
    this.image = null;

    // Default to a 1-pixel black texture so we can safely render while we wait for an image to load
    // See: http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load
    this.setData(1, 1, new Uint8Array([0, 0, 0, 255]), { filtering: 'nearest' });

    // TODO: better support for non-URL sources: canvas/video elements, raw pixel buffers

    this.name = name;
    GLTexture.textures[this.name] = this;
};

GLTexture.prototype.bind = function (unit) {
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
};

// Loads a texture from a URL
GLTexture.prototype.load = function (url, options) {
    options = options || {};
    this.image = new Image();
    this.image.onload = function() {
        this.width = this.image.width;
        this.height = this.image.height;
        this.data = null; // mutually exclusive with direct data buffer textures
        this.update(options);
        this.setTextureFiltering(options);
    }.bind(this);
    this.image.src = url;
};

// Sets texture to a raw image buffer
GLTexture.prototype.setData = function (width, height, data, options) {
    this.width = width;
    this.height = height;
    this.data = data;
    this.image = null; // mutually exclusive with image element-based textures

    this.update(options);
    this.setTextureFiltering(options);
};

// Uploads current image or buffer to the GPU (can be used to update animated textures on the fly)
GLTexture.prototype.update = function (options) {
    options = options || {};

    this.bind(0);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, (options.UNPACK_FLIP_Y_WEBGL === false ? false : true));

    // Image element
    if (this.image && this.image.complete) {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
    }
    // Raw image buffer
    else if (this.width && this.height) { // NOTE: this.data can be null, to zero out texture
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.data);
    }
};

// Determines appropriate filtering mode
// Assumes texture to be operated on is already bound
GLTexture.prototype.setTextureFiltering = function (options) {
    options = options || {};
    options.filtering = options.filtering || 'mipmap'; // default to mipmaps for power-of-2 textures
    var gl = this.gl;

    // For power-of-2 textures, the following presets are available:
    // mipmap: linear blend from nearest mip
    // linear: linear blend from original image (no mips)
    // nearest: nearest pixel from original image (no mips, 'blocky' look)
    if (Utils.isPowerOf2(this.width) && Utils.isPowerOf2(this.height)) {
        this.power_of_2 = true;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.TEXTURE_WRAP_S || gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.TEXTURE_WRAP_T || gl.CLAMP_TO_EDGE);

        if (options.filtering == 'mipmap') {
            // console.log("power-of-2 MIPMAP");
            this.filtering = 'mipmap';
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST); // TODO: use trilinear filtering by defualt instead?
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        else if (options.filtering == 'linear') {
            // console.log("power-of-2 LINEAR");
            this.filtering = 'linear';
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
        else if (options.filtering == 'nearest') {
            // console.log("power-of-2 NEAREST");
            this.filtering = 'nearest';
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
    }
    else {
        // WebGL has strict requirements on non-power-of-2 textures:
        // No mipmaps and must clamp to edge
        this.power_of_2 = false;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        if (options.filtering == 'nearest') {
            // console.log("power-of-2 NEAREST");
            this.filtering = 'nearest';
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
        else { // default to linear for non-power-of-2 textures
            // console.log("power-of-2 LINEAR");
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
// Describes a vertex layout that can be used with many different GL programs.
// If a given program doesn't include all attributes, it can still use the vertex layout
// to read those attribs that it does recognize, using the attrib offsets to skip others.
// Attribs are an array, in layout order, of: name, size, type, normalized
// ex: { name: 'position', size: 3, type: gl.FLOAT, normalized: false }
function GLVertexLayout (gl, attribs)
{
    this.attribs = attribs;

    // Calc vertex stride
    this.stride = 0;
    for (var a=0; a < this.attribs.length; a++) {
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

// Track currently enabled attribs, by the program they are bound to
GLVertexLayout.enabled_attribs = {};

// Setup a vertex layout for a specific GL program
// Assumes that the desired vertex buffer (VBO) is already bound
GLVertexLayout.prototype.enable = function (gl, gl_program)
{
    // Enable all attributes for this layout
    for (var a=0; a < this.attribs.length; a++) {
        var attrib = this.attribs[a];
        var location = gl_program.attribute(attrib.name).location;

        if (location != -1) {
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, attrib.size, attrib.type, attrib.normalized, this.stride, attrib.offset);
            GLVertexLayout.enabled_attribs[location] = gl_program;
        }
    }

    // Disable any previously bound attributes that aren't for this layout
    var unusued_attribs = [];
    for (location in GLVertexLayout.enabled_attribs) {
        if (GLVertexLayout.enabled_attribs[location] != gl_program) {
            gl.disableVertexAttribArray(location);
            unusued_attribs.push(location);
        }
    }

    // Mark attribs as unused
    for (location in unusued_attribs) {
        delete GLVertexLayout.enabled_attribs[location];
    }
};

if (module !== undefined) {
    module.exports = GLVertexLayout;
}

},{}],12:[function(_dereq_,module,exports){
var Scene = _dereq_('./scene.js');

var LeafletLayer = L.GridLayer.extend({

    initialize: function (options) {
        L.setOptions(this, options);
        this.scene = new Scene(this.options.vectorTileSource, this.options.vectorLayers, this.options.vectorStyles, { num_workers: this.options.numWorkers });
        this.scene.debug = this.options.debug;
        this.scene.continuous_animation = false; // set to true for animatinos, etc. (eventually will be automated)
    },

    // Finish initializing scene and setup events when layer is added to map
    onAdd: function (map) {
        var layer = this;

        layer.on('tileunload', function (event) {
            var tile = event.tile;
            var key = tile.getAttribute('data-tile-key');
            layer.scene.removeTile(key);
        });

        layer._map.on('resize', function () {
            var size = layer._map.getSize();
            layer.scene.resizeMap(size.x, size.y);
            layer.updateBounds();
        });

        layer._map.on('move', function () {
            var center = layer._map.getCenter();
            layer.scene.setCenter(center.lng, center.lat);
            layer.updateBounds();
        });

        layer._map.on('zoomstart', function () {
            console.log("map.zoomstart " + layer._map.getZoom());
            layer.scene.startZoom();
        });

        layer._map.on('zoomend', function () {
            console.log("map.zoomend " + layer._map.getZoom());
            layer.scene.setZoom(layer._map.getZoom());
            layer.updateBounds();
        });

        layer._map.on('dragstart', function () {
            layer.scene.panning = true;
        });

        layer._map.on('dragend', function () {
            layer.scene.panning = false;
        });

        // Canvas element will be inserted after map container (leaflet transforms shouldn't be applied to the GL canvas)
        // TODO: find a better way to deal with this? right now GL map only renders correctly as the bottom layer
        layer.scene.container = layer._map.getContainer();

        var center = layer._map.getCenter();
        layer.scene.setCenter(center.lng, center.lat);
        console.log("zoom: " + layer._map.getZoom());
        layer.scene.setZoom(layer._map.getZoom());
        layer.updateBounds();

        L.GridLayer.prototype.onAdd.apply(this, arguments);

        // Use leaflet's existing event system as the callback mechanism
        layer.scene.init(function() {
            layer.fire('init');
        });
    },

    onRemove: function (map) {
        L.GridLayer.prototype.onRemove.apply(this, arguments);
        // TODO: remove event handlers, destroy map
    },

    createTile: function (coords, done) {
        var div = document.createElement('div');
        this.scene.loadTile(coords, div, done);
        return div;
    },

    updateBounds: function () {
        var layer = this;
        var bounds = layer._map.getBounds();
        layer.scene.setBounds(bounds.getSouthWest(), bounds.getNorthEast());
    },

    render: function () {
        this.scene.render();
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

},{"./scene.js":15}],13:[function(_dereq_,module,exports){
// Modules and dependencies to expose in the public Tangram module

// The leaflet layer plugin is currently the primary means of using the library
var Leaflet = _dereq_('./leaflet_layer.js');

// GL functions included for easier debugging / direct access to setting global defines, reloading programs, etc.
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

},{}],15:[function(_dereq_,module,exports){
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

// Setup that happens on main thread only (skip in web worker)
var yaml;
Utils.runIfInMainThread(function() {
    try {
        yaml = _dereq_('js-yaml');
    }
    catch (e) {
        console.log("no YAML support, js-yaml module not found");
    }

    findBaseLibraryURL();
});

// Global setup
Scene.tile_scale = 4096; // coordinates are locally scaled to the range [0, tile_scale]
Geo.setTileScale(Scene.tile_scale);
GLBuilders.setTileScale(Scene.tile_scale);
GLProgram.defines.TILE_SCALE = Scene.tile_scale;
Scene.debug = false;

// Layers & styles: pass an object directly, or a URL as string to load remotely
function Scene (tile_source, layers, styles, options)
{
    var options = options || {};
    this.initialized = false;

    this.tile_source = tile_source;
    this.tiles = {};
    this.queued_tiles = [];
    this.num_workers = options.num_workers || 1;
    this.allow_cross_domain_workers = (options.allow_cross_domain_workers === false ? false : true);

    this.layers = layers;
    this.styles = styles;

    this.dirty = true; // request a redraw
    this.animated = false; // request redraw every frame

    this.frame = 0;
    this.zoom = null;
    this.center = null;
    this.device_pixel_ratio = window.devicePixelRatio || 1;

    this.zooming = false;
    this.panning = false;

    this.container = options.container;

    this.resetTime();
}

Scene.prototype.init = function (callback)
{
    if (this.initialized) {
        return;
    }

    // Load scene definition (layers, styles, etc.), then create modes & workers
    this.loadScene(function() {
        var queue = Queue();

        // Create rendering modes
        queue.defer(function(complete) {
            this.modes = Scene.createModes(this.styles);
            this.updateActiveModes();
            complete();
        }.bind(this));

        // Create web workers
        queue.defer(function(complete) {
            this.createWorkers(complete);
        }.bind(this));

        // Then create GL context
        queue.await(function() {
            // Create canvas & GL
            this.container = this.container || document.body;
            this.canvas = document.createElement('canvas');
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = 0;
            this.canvas.style.left = 0;
            this.canvas.style.zIndex = -1;
            this.container.appendChild(this.canvas);

            this.gl = GL.getContext(this.canvas);
            this.resizeMap(this.container.clientWidth, this.container.clientHeight);

            this.initModes(); // TODO: remove gl context state from modes, and move init to create step above?
            this.initSelectionBuffer();

            // this.zoom_step = 0.02; // for fractional zoom user adjustment
            this.last_render_count = null;
            this.initInputHandlers();

            this.initialized = true;

            if (typeof callback == 'function') {
                callback();
            }
        }.bind(this));
    }.bind(this));
};

Scene.prototype.initModes = function ()
{
    // Init GL context for modes (compiles programs, etc.)
    for (var m in this.modes) {
        this.modes[m].init(this.gl);
    }
};

Scene.prototype.initSelectionBuffer = function ()
{
    // Selection state tracking
    this.pixel = new Uint8Array(4);
    this.pixel32 = new Float32Array(this.pixel.buffer);
    this.selection_point = Point(0, 0);
    this.selected_feature = null;
    this.selection_callback = null;
    this.selection_callback_timer = null;
    this.selection_frame_delay = 5; // delay from selection render to framebuffer sample, to avoid CPU/GPU sync lock
    this.update_selection = false;

    // Frame buffer for selection
    // TODO: initiate lazily in case we don't need to do any selection
    this.fbo = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
    this.fbo_size = { width: 256, height: 256 }; // TODO: make configurable / adaptive based on canvas size
    this.gl.viewport(0, 0, this.fbo_size.width, this.fbo_size.height);

    // Texture for the FBO color attachment
    this.fbo_texture = new GLTexture(this.gl, 'selection_fbo');
    this.fbo_texture.setData(this.fbo_size.width, this.fbo_size.height, null, { filtering: 'nearest' });
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.fbo_texture.texture, 0);

    // Renderbuffer for the FBO depth attachment
    this.fbo_depth_rb = this.gl.createRenderbuffer();
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.fbo_depth_rb);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.fbo_size.width, this.fbo_size.height);
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.fbo_depth_rb);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
};

// Web workers handle heavy duty tile construction: networking, geometry processing, etc.
Scene.prototype.createWorkers = function (callback)
{
    var queue = Queue();
    var worker_url = Scene.library_base_url + 'tangram-worker.min.js' + '?' + (+new Date());

    // Load & instantiate workers
    queue.defer(function(complete) {
        // Local object URLs supported?
        var createObjectURL = (window.URL && window.URL.createObjectURL) || (window.webkitURL && window.webkitURL.createObjectURL);
        if (createObjectURL && this.allow_cross_domain_workers) {
            // To allow workers to be loaded cross-domain, first load worker source via XHR, then create a local URL via a blob
            var req = new XMLHttpRequest();
            req.onload = function () {
                var worker_local_url = createObjectURL(new Blob([req.response], { type: 'application/javascript' }));
                this.makeWorkers(worker_local_url);
                complete();
            }.bind(this);
            req.open('GET', worker_url, true /* async flag */);
            req.responseType = 'text';
            req.send();
        }
        // Traditional load from remote URL
        else {
            console.log(this);
            this.makeWorkers(worker_url);
            complete();
        }
    }.bind(this));

    // Init workers
    queue.await(function() {
        this.workers.forEach(function(worker) {
            worker.addEventListener('message', this.workerBuildTileCompleted.bind(this));
            worker.addEventListener('message', this.workerGetFeatureSelection.bind(this));
            worker.addEventListener('message', this.workerLogMessage.bind(this));
        }.bind(this));

        this.next_worker = 0;
        this.selection_map_worker_size = {};

        if (typeof callback == 'function') {
            callback();
        }
    }.bind(this));
};

// Instantiate workers from URL
Scene.prototype.makeWorkers = function (url)
{
    this.workers = [];
    for (var w=0; w < this.num_workers; w++) {
        this.workers.push(new Worker(url));
        this.workers[w].postMessage({
            type: 'init',
            worker_id: w,
            num_workers: this.num_workers
        })
    }
};

// Post a message about a tile to the next worker (round robbin)
Scene.prototype.workerPostMessageForTile = function (tile, message)
{
    if (tile.worker == null) {
        tile.worker = this.next_worker;
        this.next_worker = (tile.worker + 1) % this.workers.length;
    }
    this.workers[tile.worker].postMessage(message);
};

Scene.prototype.setCenter = function (lng, lat)
{
    this.center = { lng: lng, lat: lat };
    this.dirty = true;
};

Scene.prototype.startZoom = function ()
{
    this.last_zoom = this.zoom;
    this.zooming = true;
};

Scene.prototype.preserve_tiles_within_zoom = 2;
Scene.prototype.setZoom = function (zoom)
{
    // Schedule GL tiles for removal on zoom
    var below = zoom;
    var above = zoom;
    if (this.last_zoom != null) {
        console.log("scene.last_zoom: " + this.last_zoom);
        if (Math.abs(zoom - this.last_zoom) <= this.preserve_tiles_within_zoom) {
            if (zoom > this.last_zoom) {
                below = zoom - this.preserve_tiles_within_zoom;
            }
            else {
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

Scene.prototype.removeTilesOutsideZoomRange = function (below, above)
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

Scene.prototype.setBounds = function (sw, ne)
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

    this.center_meters = Point(
        (this.buffered_meter_bounds.sw.x + this.buffered_meter_bounds.ne.x) / 2,
        (this.buffered_meter_bounds.sw.y + this.buffered_meter_bounds.ne.y) / 2
    );

    // console.log("set scene bounds to " + JSON.stringify(this.bounds));

    // Mark tiles as visible/invisible
    for (var t in this.tiles) {
        this.updateVisibilityForTile(this.tiles[t]);
    }

    this.dirty = true;
};

Scene.prototype.isTileInZoom = function (tile)
{
    return (Math.min(tile.coords.z, this.tile_source.max_zoom || tile.coords.z) == this.capped_zoom);
};

// Update visibility and return true if changed
Scene.prototype.updateVisibilityForTile = function (tile)
{
    var visible = tile.visible;
    tile.visible = this.isTileInZoom(tile) && Geo.boxIntersect(tile.bounds, this.buffered_meter_bounds);
    tile.center_dist = Math.abs(this.center_meters.x - tile.min.x) + Math.abs(this.center_meters.y - tile.min.y);
    return (visible != tile.visible);
};

Scene.prototype.resizeMap = function (width, height)
{
    this.dirty = true;

    this.css_size = { width: width, height: height };
    this.device_size = { width: Math.round(this.css_size.width * this.device_pixel_ratio), height: Math.round(this.css_size.height * this.device_pixel_ratio) };

    this.canvas.style.width = this.css_size.width + 'px';
    this.canvas.style.height = this.css_size.height + 'px';
    this.canvas.width = this.device_size.width;
    this.canvas.height = this.device_size.height;

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
};

Scene.prototype.requestRedraw = function ()
{
    this.dirty = true;
};

// Determine a Z value that will stack features in a "painter's algorithm" style, first by layer, then by draw order within layer
// Features are assumed to be already sorted in desired draw order by the layer pre-processor
Scene.calculateZ = function (layer, tile, layer_offset, feature_offset)
{
    // var layer_offset = layer_offset || 0;
    // var feature_offset = feature_offset || 0;
    var z = 0; // TODO: made this a no-op until revisiting where it should live - one-time calc here, in vertex layout/shader, etc.
    return z;
};

Scene.prototype.render = function ()
{
    this.loadQueuedTiles();

    // Render on demand
    if (this.dirty == false || this.initialized == false) {
        return false;
    }
    this.dirty = false; // subclasses can set this back to true when animation is needed

    this.renderGL();

    // Redraw every frame if animating
    if (this.animated == true) {
        this.dirty = true;
    }

    this.frame++;

    // console.log("render map");
    return true;
};

Scene.prototype.resetFrame = function ()
{
    if (!this.initialized) {
        return;
    }

    // Reset frame state
    var gl = this.gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // TODO: unnecessary repeat?
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
};

Scene.prototype.renderGL = function ()
{
    var gl = this.gl;

    this.input();
    this.resetFrame();

    // Map transforms
    var center = Geo.latLngToMeters(Point(this.center.lng, this.center.lat));
    var meters_per_pixel = Geo.min_zoom_meters_per_pixel / Math.pow(2, this.zoom);
    var meter_zoom = Point(this.css_size.width / 2 * meters_per_pixel, this.css_size.height / 2 * meters_per_pixel);

    // Matrices
    var tile_view_mat = mat4.create();
    var tile_world_mat = mat4.create();
    var meter_view_mat = mat4.create();

    // Convert mercator meters to screen space
    mat4.scale(meter_view_mat, meter_view_mat, vec3.fromValues(1 / meter_zoom.x, 1 / meter_zoom.y, 1 / meter_zoom.y));

    // Renderable tile list
    var renderable_tiles = [];
    for (var t in this.tiles) {
        var tile = this.tiles[t];
        if (tile.loaded == true && tile.visible == true) {
            renderable_tiles.push(tile);
        }
    }
    this.renderable_tiles_count = renderable_tiles.length;

    // Render main pass - tiles grouped by rendering mode (GL program)
    var render_count = 0;
    for (var mode in this.modes) {
        // Per-frame mode updates/animations
        // Called even if the mode isn't rendered by any current tiles, so time-based animations, etc. continue
        this.modes[mode].update();

        var gl_program = this.modes[mode].gl_program;
        if (gl_program == null || gl_program.compiled == false) {
            continue;
        }

        var first_for_mode = true;

        // Render tile GL geometries
        for (var t in renderable_tiles) {
            var tile = renderable_tiles[t];

            if (tile.gl_geometry[mode] != null) {
                // Setup mode if encountering for first time this frame
                // (lazy init, not all modes will be used in all screen views; some modes might be defined but never used)
                if (first_for_mode == true) {
                    first_for_mode = false;

                    gl_program.use();
                    this.modes[mode].setUniforms();

                    // TODO: don't set uniforms when they haven't changed
                    gl_program.uniform('2f', 'u_resolution', this.device_size.width, this.device_size.height);
                    gl_program.uniform('2f', 'u_aspect', this.device_size.width / this.device_size.height, 1.0);
                    gl_program.uniform('1f', 'u_time', ((+new Date()) - this.start_time) / 1000);
                    gl_program.uniform('1f', 'u_map_zoom', this.zoom); // Math.floor(this.zoom) + (Math.log((this.zoom % 1) + 1) / Math.LN2 // scale fractional zoom by log
                    gl_program.uniform('2f', 'u_map_center', center.x, center.y);
                    gl_program.uniform('1f', 'u_num_layers', this.layers.length);
                    gl_program.uniform('1f', 'u_meters_per_pixel', meters_per_pixel);
                    gl_program.uniform('Matrix4fv', 'u_meter_view', false, meter_view_mat);
                }

                // TODO: calc these once per tile (currently being needlessly re-calculated per-tile-per-mode)

                // Tile origin
                gl_program.uniform('2f', 'u_tile_origin', tile.min.x, tile.min.y);

                // Tile view matrix - transform tile space into view space (meters, relative to camera)
                mat4.identity(tile_view_mat);
                mat4.translate(tile_view_mat, tile_view_mat, vec3.fromValues(tile.min.x - center.x, tile.min.y - center.y, 0)); // adjust for tile origin & map center
                mat4.scale(tile_view_mat, tile_view_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1)); // scale tile local coords to meters
                gl_program.uniform('Matrix4fv', 'u_tile_view', false, tile_view_mat);

                // Tile world matrix - transform tile space into world space (meters, absolute mercator position)
                mat4.identity(tile_world_mat);
                mat4.translate(tile_world_mat, tile_world_mat, vec3.fromValues(tile.min.x, tile.min.y, 0));
                mat4.scale(tile_world_mat, tile_world_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1)); // scale tile local coords to meters
                gl_program.uniform('Matrix4fv', 'u_tile_world', false, tile_world_mat);

                // Render tile
                tile.gl_geometry[mode].render();
                render_count += tile.gl_geometry[mode].geometry_count;
            }
        }
    }

    // Render selection pass (if needed)
    // Slight variations on render pass code above - mostly because we're reusing uniforms from the main
    // mode program, for the selection program
    // TODO: reduce duplicated code w/main render pass above
    if (this.update_selection) {
        this.update_selection = false; // reset selection check

        // TODO: queue callback till panning is over? coords where selection was requested are out of date
        if (this.panning) {
            return;
        }

        // Switch to FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.viewport(0, 0, this.fbo_size.width, this.fbo_size.height);
        this.resetFrame();

        for (mode in this.modes) {
            gl_program = this.modes[mode].selection_gl_program;
            if (gl_program == null || gl_program.compiled == false) {
                continue;
            }

            first_for_mode = true;

            // Render tile GL geometries
            for (t in renderable_tiles) {
                tile = renderable_tiles[t];

                if (tile.gl_geometry[mode] != null) {
                    // Setup mode if encountering for first time this frame
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

                    // Tile origin
                    gl_program.uniform('2f', 'u_tile_origin', tile.min.x, tile.min.y);

                    // Tile view matrix - transform tile space into view space (meters, relative to camera)
                    mat4.identity(tile_view_mat);
                    mat4.translate(tile_view_mat, tile_view_mat, vec3.fromValues(tile.min.x - center.x, tile.min.y - center.y, 0)); // adjust for tile origin & map center
                    mat4.scale(tile_view_mat, tile_view_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1)); // scale tile local coords to meters
                    gl_program.uniform('Matrix4fv', 'u_tile_view', false, tile_view_mat);

                    // Tile world matrix - transform tile space into world space (meters, absolute mercator position)
                    mat4.identity(tile_world_mat);
                    mat4.translate(tile_world_mat, tile_world_mat, vec3.fromValues(tile.min.x, tile.min.y, 0));
                    mat4.scale(tile_world_mat, tile_world_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1)); // scale tile local coords to meters
                    gl_program.uniform('Matrix4fv', 'u_tile_world', false, tile_world_mat);

                    // Render tile
                    tile.gl_geometry[mode].render();
                }
            }
        }

        // Delay reading the pixel result from the selection buffer to avoid CPU/GPU sync lock.
        // Calling readPixels synchronously caused a massive performance hit, presumably since it
        // forced this function to wait for the GPU to finish rendering and retrieve the texture contents.
        if (this.selection_callback_timer != null) {
            clearTimeout(this.selection_callback_timer);
        }
        this.selection_callback_timer = setTimeout(
            this.readSelectionBuffer.bind(this),
            this.selection_frame_delay
        );

        // Reset to screen buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    if (render_count != this.last_render_count) {
        console.log("rendered " + render_count + " primitives");
    }
    this.last_render_count = render_count;

    return true;
};

// Request feature selection
// Runs asynchronously, schedules selection buffer to be updated
Scene.prototype.getFeatureAt = function (pixel, callback)
{
    if (!this.initialized) {
        return;
    }

    // TODO: queue callbacks while still performing only one selection render pass within X time interval?
    if (this.update_selection == true) {
        return;
    }

    this.selection_point = Point(
        pixel.x * this.device_pixel_ratio,
        this.device_size.height - (pixel.y * this.device_pixel_ratio)
    );
    this.selection_callback = callback;
    this.update_selection = true;
    this.dirty = true;
};

Scene.prototype.readSelectionBuffer = function ()
{
    var gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

    // Check selection map against FBO
    gl.readPixels(
        Math.floor(this.selection_point.x * this.fbo_size.width / this.device_size.width),
        Math.floor(this.selection_point.y * this.fbo_size.height / this.device_size.height),
        1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pixel);
    var feature_key = (this.pixel[0] + (this.pixel[1] << 8) + (this.pixel[2] << 16) + (this.pixel[3] << 24)) >>> 0;

    // console.log(
    //     Math.floor(this.selection_point.x * this.fbo_size.width / this.device_size.width) + ", " +
    //     Math.floor(this.selection_point.y * this.fbo_size.height / this.device_size.height) + ": (" +
    //     this.pixel[0] + ", " + this.pixel[1] + ", " + this.pixel[2] + ", " + this.pixel[3] + ")");

    // If feature found, ask appropriate web worker to lookup feature
    var worker_id = this.pixel[3];
    if (worker_id != 255) { // 255 indicates an empty selection buffer pixel
        // console.log("worker_id: " + worker_id);
        if (this.workers[worker_id] != null) {
            // console.log("post message");
            this.workers[worker_id].postMessage({
                type: 'getFeatureSelection',
                key: feature_key
            });
        }
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

// Called on main thread when a web worker finds a feature in the selection buffer
Scene.prototype.workerGetFeatureSelection = function (event)
{
    if (event.data.type != 'getFeatureSelection') {
        return;
    }

    var feature = event.data.feature;
    var changed = false;
    if ((feature != null && this.selected_feature == null) ||
        (feature == null && this.selected_feature != null) ||
        (feature != null && this.selected_feature != null && feature.id != this.selected_feature.id)) {
        changed = true;
    }

    this.selected_feature = feature;

    if (typeof this.selection_callback == 'function') {
        this.selection_callback({ feature: this.selected_feature, changed: changed });
    }
};

// Queue a tile for load
Scene.prototype.loadTile = function (coords, div, callback)
{
    this.queued_tiles[this.queued_tiles.length] = arguments;
};

// Load all queued tiles
Scene.prototype.loadQueuedTiles = function ()
{
    if (!this.initialized) {
        return;
    }

    if (this.queued_tiles.length == 0) {
        return;
    }

    for (var t=0; t < this.queued_tiles.length; t++) {
        this._loadTile.apply(this, this.queued_tiles[t]);
    }

    this.queued_tiles = [];
};

// Load a single tile
Scene.prototype._loadTile = function (coords, div, callback)
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
    tile.span = { x: (tile.max.x - tile.min.x), y: (tile.max.y - tile.min.y) };
    tile.bounds = { sw: { x: tile.min.x, y: tile.max.y }, ne: { x: tile.max.x, y: tile.min.y } };
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

// Rebuild all tiles
// TODO: also rebuild modes? (detect if changed)
Scene.prototype.rebuildTiles = function ()
{
    if (!this.initialized) {
        return;
    }

    // Update layers & styles
    this.layers_serialized = Utils.serializeWithFunctions(this.layers);
    this.styles_serialized = Utils.serializeWithFunctions(this.styles);
    this.selection_map = {};

    // Tell workers we're about to rebuild (so they can refresh styles, etc.)
    this.workers.forEach(function(worker) {
        worker.postMessage({
            type: 'prepareForRebuild',
            layers: this.layers_serialized,
            styles: this.styles_serialized
        });
    }.bind(this));

    // Rebuild visible tiles first, from center out
    // console.log("find visible");
    var visible = [], invisible = [];
    for (var t in this.tiles) {
        if (this.tiles[t].visible == true) {
            visible.push(t);
        }
        else {
            invisible.push(t);
        }
    }

    // console.log("sort visible distance");
    visible.sort(function(a, b) {
        // var ad = Math.abs(this.center_meters.x - this.tiles[b].min.x) + Math.abs(this.center_meters.y - this.tiles[b].min.y);
        // var bd = Math.abs(this.center_meters.x - this.tiles[a].min.x) + Math.abs(this.center_meters.y - this.tiles[a].min.y);
        var ad = this.tiles[a].center_dist;
        var bd = this.tiles[b].center_dist;
        return (bd > ad ? -1 : (bd == ad ? 0 : 1));
    }.bind(this));

    // console.log("build visible");
    for (var t in visible) {
        this.buildTile(visible[t]);
    }

    // console.log("build invisible");
    for (var t in invisible) {
        // Keep tiles in current zoom but out of visible range, but rebuild as lower priority
        if (this.isTileInZoom(this.tiles[invisible[t]]) == true) {
            this.buildTile(invisible[t]);
        }
        // Drop tiles outside current zoom
        else {
            this.removeTile(invisible[t]);
        }
    }

    this.updateActiveModes();
    this.resetTime();
};

Scene.prototype.buildTile = function(key)
{
    var tile = this.tiles[key];

    this.workerPostMessageForTile(tile, {
        type: 'buildTile',
        tile: {
            key: tile.key,
            coords: tile.coords, // used by style helpers
            min: tile.min, // used by TileSource to scale tile to local extents
            max: tile.max, // used by TileSource to scale tile to local extents
            debug: tile.debug
        },
        tile_source: this.tile_source,
        layers: this.layers_serialized,
        styles: this.styles_serialized
    });
};

// Process geometry for tile - called by web worker
// Returns a set of tile keys that should be sent to the main thread (so that we can minimize data exchange between worker and main thread)
Scene.addTile = function (tile, layers, styles, modes)
{
    var layer, style, feature, z, mode;
    var vertex_data = {};

    // Join line test pattern
    // if (Scene.debug) {
    //     tile.layers['roads'].features.push(Scene.buildZigzagLineTestPattern());
    // }

    // Build raw geometry arrays
    tile.debug.features = 0;
    for (var layer_num=0; layer_num < layers.length; layer_num++) {
        layer = layers[layer_num];

        // Skip layers with no styles defined, or layers set to not be visible
        if (styles.layers[layer.name] == null || styles.layers[layer.name].visible == false) {
            continue;
        }

        if (tile.layers[layer.name] != null) {
            var num_features = tile.layers[layer.name].features.length;

            // Rendering reverse order aka top to bottom
            for (var f = num_features-1; f >= 0; f--) {
                feature = tile.layers[layer.name].features[f];
                style = Style.parseStyleForFeature(feature, layer.name, styles.layers[layer.name], tile);

                // Skip feature?
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

                // First feature in this render mode?
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

    return {
        vertex_data: true
    };
};

// Called on main thread when a web worker completes processing for a single tile (initial load, or rebuild)
Scene.prototype.workerBuildTileCompleted = function (event)
{
    if (event.data.type != 'buildTileCompleted') {
        return;
    }

    // Track selection map size (for stats/debug) - update per worker and sum across workers
    this.selection_map_worker_size[event.data.worker_id] = event.data.selection_map_size;
    this.selection_map_size = 0;
    Object.keys(this.selection_map_worker_size).forEach(function(w) { this.selection_map_size += this.selection_map_worker_size[w]; }.bind(this));
    console.log("selection map: " + this.selection_map_size + " features");

    var tile = event.data.tile;

    // Removed this tile during load?
    if (this.tiles[tile.key] == null) {
        console.log("discarded tile " + tile.key + " in Scene.tileWorkerCompleted because previously removed");
        return;
    }

    // Update tile with properties from worker
    tile = this.mergeTile(tile.key, tile);

    this.buildGLGeometry(tile);

    this.dirty = true;
    this.trackTileSetLoadEnd();
    this.printDebugForTile(tile);
};

// Called on main thread when a web worker completes processing for a single tile
Scene.prototype.buildGLGeometry = function (tile)
{
    var vertex_data = tile.vertex_data;

    // Cleanup existing GL geometry objects
    this.freeTileResources(tile);
    tile.gl_geometry = {};

    // Create GL geometry objects
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

    delete tile.vertex_data; // TODO: might want to preserve this for rebuilding geometries when styles/etc. change?
};

Scene.prototype.removeTile = function (key)
{
    if (!this.initialized) {
        return;
    }

    console.log("tile unload for " + key);

    if (this.zooming == true) {
        return; // short circuit tile removal, will sweep out tiles by zoom level when zoom ends
    }

    var tile = this.tiles[key];

    if (tile != null) {
        this.freeTileResources(tile);

        // Web worker will cancel XHR requests
        this.workerPostMessageForTile(tile, {
            type: 'removeTile',
            key: tile.key
        });
    }

    delete this.tiles[key];
    this.dirty = true;
};

// Free any GL / owned resources
Scene.prototype.freeTileResources = function (tile)
{
    if (tile != null && tile.gl_geometry != null) {
        for (var p in tile.gl_geometry) {
            tile.gl_geometry[p].destroy();
        }
        tile.gl_geometry = null;
    }
};

// Attaches tracking and debug into to the provided tile DOM element
Scene.prototype.updateTileElement = function (tile, div)
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
Scene.prototype.mergeTile = function (key, source_tile)
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

// Load (or reload) the scene config
Scene.prototype.loadScene = function (callback)
{
    var queue = Queue();

    // If this is the first time we're loading the scene, copy any URLs
    if (!this.layer_source && typeof(this.layers) == 'string') {
        this.layer_source = Utils.urlForPath(this.layers);
    }

    if (!this.style_source && typeof(this.styles) == 'string') {
        this.style_source = Utils.urlForPath(this.styles);
    }

    // Layer by URL
    if (this.layer_source) {
        queue.defer(function(complete) {
            Scene.loadLayers(
                this.layer_source,
                function(layers) {
                    this.layers = layers;
                    this.layers_serialized = Utils.serializeWithFunctions(this.layers);
                    complete();
                }.bind(this)
            );
        }.bind(this));
    }

    // Style by URL
    if (this.style_source) {
        queue.defer(function(complete) {
            Scene.loadStyles(
                this.style_source,
                function(styles) {
                    this.styles = styles;
                    this.styles_serialized = Utils.serializeWithFunctions(this.styles);
                    complete();
                }.bind(this)
            );
        }.bind(this));
    }
    // Style object
    else {
        this.styles = Scene.postProcessStyles(this.styles);
    }

    // Everything is loaded
    queue.await(function() {
        if (typeof callback == 'function') {
            callback();
        }
    });
};

// Reload scene config and rebuild tiles
Scene.prototype.reloadScene = function ()
{
    if (!this.initialized) {
        return;
    }

    this.loadScene(function() {
        this.rebuildTiles();
    }.bind(this));
};

// Called (currently manually) after modes are updated in stylesheet
Scene.prototype.refreshModes = function ()
{
    if (!this.initialized) {
        return;
    }

    this.modes = Scene.refreshModes(this.modes, this.styles);
};

Scene.prototype.updateActiveModes = function ()
{
    // Make a set of currently active modes (used in a layer)
    this.active_modes = {};
    var animated = false; // is any active mode animated?
    for (var l in this.styles.layers) {
        var mode = this.styles.layers[l].mode.name;
        if (this.styles.layers[l].visible !== false) {
            this.active_modes[mode] = true;

            // Check if this mode is animated
            if (animated == false && this.modes[mode].animated == true) {
                animated = true;
            }
        }
    }
    this.animated = animated;
};

// Reset internal clock, mostly useful for consistent experience when changing modes/debugging
Scene.prototype.resetTime = function ()
{
    this.start_time = +new Date();
};

// User input
// TODO: restore fractional zoom support once leaflet animation refactor pull request is merged

Scene.prototype.initInputHandlers = function ()
{
    // this.key = null;

    // document.addEventListener('keydown', function (event) {
    //     if (event.keyCode == 37) {
    //         this.key = 'left';
    //     }
    //     else if (event.keyCode == 39) {
    //         this.key = 'right';
    //     }
    //     else if (event.keyCode == 38) {
    //         this.key = 'up';
    //     }
    //     else if (event.keyCode == 40) {
    //         this.key = 'down';
    //     }
    //     else if (event.keyCode == 83) { // s
    //         console.log("reloading shaders");
    //         for (var mode in this.modes) {
    //             this.modes[mode].gl_program.compile();
    //         }
    //         this.dirty = true;
    //     }
    // }.bind(this));

    // document.addEventListener('keyup', function (event) {
    //     this.key = null;
    // }.bind(this));
};

Scene.prototype.input = function ()
{
    // // Fractional zoom scaling
    // if (this.key == 'up') {
    //     this.setZoom(this.zoom + this.zoom_step);
    // }
    // else if (this.key == 'down') {
    //     this.setZoom(this.zoom - this.zoom_step);
    // }
};


// Stats/debug/profiling methods

// Profiling methods used to track when sets of tiles start/stop loading together
// e.g. initial page load is one set of tiles, new sets of tile loads are then initiated by a map pan or zoom
Scene.prototype.trackTileSetLoadStart = function ()
{
    // Start tracking new tile set if no other tiles already loading
    if (this.tile_set_loading == null) {
        this.tile_set_loading = +new Date();
        console.log("tile set load START");
    }
};

Scene.prototype.trackTileSetLoadEnd = function ()
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

Scene.prototype.printDebugForTile = function (tile)
{
    console.log(
        "debug for " + tile.key + ': [ ' +
        Object.keys(tile.debug).map(function (t) { return t + ': ' + tile.debug[t]; }).join(', ') + ' ]'
    );
};

// Recompile all shaders
Scene.prototype.compileShaders = function ()
{
    for (var m in this.modes) {
        this.modes[m].gl_program.compile();
    }
};

// Sum of a debug property across tiles
Scene.prototype.getDebugSum = function (prop, filter)
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
Scene.prototype.getDebugAverage = function (prop, filter)
{
    return this.getDebugSum(prop, filter) / Object.keys(this.tiles).length;
};

// Log messages pass through from web workers
Scene.prototype.workerLogMessage = function (event)
{
    if (event.data.type != 'log') {
        return;
    }

    console.log("worker " + event.data.worker_id + ": " + event.data.msg);
};


/*** Class methods (stateless) ***/

Scene.loadLayers = function (url, callback)
{
    var layers;
    var req = new XMLHttpRequest();
    req.onload = function () {
        eval('layers = ' + req.response); // TODO: security!

        if (typeof callback == 'function') {
            callback(layers);
        }
    };
    req.open('GET', url + '?' + (+new Date()), true /* async flag */);
    req.responseType = 'text';
    req.send();
};

Scene.loadStyles = function (url, callback)
{
    var styles;
    var req = new XMLHttpRequest();

    req.onload = function () {
        styles = req.response;

        // Try JSON first, then YAML (if available)
        try {
            eval('styles = ' + req.response);
        }
        catch (e) {
            try {
                styles = yaml.safeLoad(req.response);
            }
            catch (e) {
                console.log("failed to parse styles!");
                console.log(styles);
                styles = null;
            }
        }

        // Find generic functions & style macros
        Utils.stringsToFunctions(styles);
        Style.expandMacros(styles);
        Scene.postProcessStyles(styles);

        if (typeof callback == 'function') {
            callback(styles);
        }
    }

    req.open('GET', url + '?' + (+new Date()), true /* async flag */);
    req.responseType = 'text';
    req.send();
};

// Normalize some style settings that may not have been explicitly specified in the stylesheet
Scene.postProcessStyles = function (styles)
{
    // Post-process styles
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

// Processes the tile response to create layers as defined by the scene
// Can include post-processing to partially filter or re-arrange data, e.g. only including POIs that have names
Scene.processLayersForTile = function (layers, tile)
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

// Called once on instantiation
Scene.createModes = function (styles)
{
    var modes = {};

    // Built-in modes
    var built_ins = _dereq_('./gl/gl_modes').Modes;
    for (var m in built_ins) {
        modes[m] = built_ins[m];
    }

    // Stylesheet modes
    for (var m in styles.modes) {
        // if (m != 'all') {
            modes[m] = ModeManager.configureMode(m, styles.modes[m]);
        // }
    }

    return modes;
};

Scene.refreshModes = function (modes, styles)
{
    // Copy stylesheet modes
    // TODO: is this the best way to copy stylesheet changes to mode instances?
    for (var m in styles.modes) {
        // if (m != 'all') {
            modes[m] = ModeManager.configureMode(m, styles.modes[m]);
        // }
    }

    // Refresh all modes
    for (m in modes) {
        modes[m].refresh();
    }

    return modes;
};


// Private/internal

// Get base URL from which the library was loaded
// Used to load additional resources like shaders, textures, etc. in cases where library was loaded from a relative path
function findBaseLibraryURL ()
{
    Scene.library_base_url = '';
    var scripts = document.getElementsByTagName('script'); // document.querySelectorAll('script[src*=".js"]');
    for (var s=0; s < scripts.length; s++) {
        var match = scripts[s].src.indexOf('tangram.debug.js');
        if (match == -1) {
            match = scripts[s].src.indexOf('tangram.min.js');
        }
        if (match >= 0) {
            Scene.library_base_url = scripts[s].src.substr(0, match);
            break;
        }
    }
};

if (module !== undefined) {
    module.exports = Scene;
}

},{"./geo.js":3,"./gl/gl.js":4,"./gl/gl_builders.js":5,"./gl/gl_modes":7,"./gl/gl_program.js":8,"./gl/gl_texture.js":10,"./point.js":14,"./style.js":16,"./utils.js":17,"gl-matrix":1,"js-yaml":"jkXaKS","queue-async":2}],16:[function(_dereq_,module,exports){
/*** Style helpers ***/
var Geo = _dereq_('./geo.js');

var Style = {};

// Style helpers

Style.color = {
    pseudoRandomGrayscale: function (f) { var c = Math.max((parseInt(f.id, 16) % 100) / 100, 0.4); return [0.7 * c, 0.7 * c, 0.7 * c]; }, // pseudo-random grayscale by geometry id
    pseudoRandomColor: function (f) { return [0.7 * (parseInt(f.id, 16) / 100 % 1), 0.7 * (parseInt(f.id, 16) / 10000 % 1), 0.7 * (parseInt(f.id, 16) / 1000000 % 1)]; }, // pseudo-random color by geometry id
    randomColor: function (f) { return [0.7 * Math.random(), 0.7 * Math.random(), 0.7 * Math.random()]; } // random color
};

// Returns a function (that can be used as a dynamic style) that converts pixels to meters for the current zoom level.
// The provided pixel value ('p') can itself be a function, in which case it is wrapped by this one.
Style.pixels = function (p, z) {
    var f;
    eval('f = function(f, t, h) { return ' + (typeof p == 'function' ? '(' + (p.toString() + '(f, t, h))') : p) + ' * h.Geo.meters_per_pixel[h.zoom]; }');
    return f;
};

// Create a unique 32-bit color to identify a feature
// Workers independently create/modify selection colors in their own threads, but we also
// need the main thread to know where each feature color originated. To accomplish this,
// we partition the map by setting the 4th component (alpha channel) to the worker's id.
Style.selection_map = {}; // this will be unique per module instance (so unique per worker)
Style.selection_map_current = 1; // start at 1 since 1 will be divided by this
Style.selection_map_prefix = 0; // set by worker to worker id #
Style.generateSelection = function (color_map)
{
    // 32-bit color key
    Style.selection_map_current++;
    var ir = Style.selection_map_current & 255;
    var ig = (Style.selection_map_current >> 8) & 255;
    var ib = (Style.selection_map_current >> 16) & 255;
    var ia = Style.selection_map_prefix;
    var r = ir / 255;
    var g = ig / 255;
    var b = ib / 255;
    var a = ia / 255;
    var key = (ir + (ig << 8) + (ib << 16) + (ia << 24)) >>> 0; // need unsigned right shift to convert to positive #

    color_map[key] = {
        color: [r, g, b, a],
    };

    return color_map[key];
};

Style.resetSelectionMap = function ()
{
    Style.selection_map = {};
    Style.selection_map_current = 1;
};

// Find and expand style macros
Style.macros = [
    'Style.color.pseudoRandomColor',
    'Style.pixels'
];

Style.expandMacros = function expandMacros (obj) {
    for (var p in obj) {
        var val = obj[p];

        // Loop through object properties
        if (typeof val == 'object') {
            obj[p] = expandMacros(val);
        }
        // Convert strings back into functions
        else if (typeof val == 'string') {
            for (var m in Style.macros) {
                if (val.match(Style.macros[m])) {
                    var f;
                    try {
                        eval('f = ' + val);
                        obj[p] = f;
                        break;
                    }
                    catch (e) {
                        // fall-back to original value if parsing failed
                        obj[p] = val;
                    }
                }
            }
        }
    }

    return obj;
};


// Style defaults

// Determine final style properties (color, width, etc.)
Style.defaults = {
    color: [1.0, 0, 0],
    width: 1,
    size: 1,
    extrude: false,
    height: 20,
    min_height: 0,
    outline: {
        // color: [1.0, 0, 0],
        // width: 1,
        // dash: null
    },
    selection: {
        active: false,
        color: [0, 0, 0, 1]
    },
    mode: {
        name: 'polygons'
    }
};

// Style parsing

// Helper functions passed to dynamic style functions
Style.helpers = {
    Style: Style,
    Geo: Geo
};

Style.parseStyleForFeature = function (feature, layer_name, layer_style, tile)
{
    var layer_style = layer_style || {};
    var style = {};

    Style.helpers.zoom = tile.coords.z;

    // Test whether features should be rendered at all
    if (typeof layer_style.filter == 'function') {
        if (layer_style.filter(feature, tile, Style.helpers) == false) {
            return null;
        }
    }

    // Parse styles
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
        // returning a boolean will extrude with the feature's height, a number will override the feature height (see below)
        style.extrude = style.extrude(feature, tile, Style.helpers);
    }

    style.height = (feature.properties && feature.properties.height) || Style.defaults.height;
    style.min_height = (feature.properties && feature.properties.min_height) || Style.defaults.min_height;

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

    // Interactivity (selection map)
    var interactive = false;
    if (typeof layer_style.interactive == 'function') {
        interactive = layer_style.interactive(feature, tile, Style.helpers);
    }
    else {
        interactive = layer_style.interactive;
    }

    if (interactive == true) {
        var selector = Style.generateSelection(Style.selection_map);

        selector.feature = {
            id: feature.id,
            properties: feature.properties
        };
        selector.feature.properties.layer = layer_name; // add layer name to properties

        style.selection = {
            active: true,
            color: selector.color
        };
    }
    else {
        style.selection = Style.defaults.selection;
    }

    if (layer_style.mode != null && layer_style.mode.name != null) {
        style.mode = {};
        for (var m in layer_style.mode) {
            style.mode[m] = layer_style.mode[m];
        }
    }
    else {
        style.mode = Style.defaults.mode;
    }

    return style;
};

if (module !== undefined) {
    module.exports = Style;
}

},{"./geo.js":3}],17:[function(_dereq_,module,exports){
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

// Run a block if on the main thread (not in a web worker), with optional error (web worker) block
function runIfInMainThread (block, err) {
    try {
        if (window.document !== undefined) {
            block();
        }
    }
    catch (e) {
        if (typeof err == 'function') {
            err();
        }
    }
}

// Used for differentiating between power-of-2 and non-power-of-2 textures
// Via: http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load
function isPowerOf2 (value) {
    return (value & (value - 1)) == 0;
};

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

},{}]},{},[13])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvZGlzdC9nbC1tYXRyaXguanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvbm9kZV9tb2R1bGVzL3F1ZXVlLWFzeW5jL3F1ZXVlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nZW8uanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nbC9nbF9idWlsZGVycy5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfZ2VvbS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfbW9kZXMuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3Byb2dyYW0uanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3NoYWRlcnMuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3RleHR1cmUuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3ZlcnRleF9sYXlvdXQuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2xlYWZsZXRfbGF5ZXIuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL21vZHVsZS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvcG9pbnQuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL3NjZW5lLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9zdHlsZS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvdXRpbHMuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL3ZlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2phQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDemNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGdsLW1hdHJpeCAtIEhpZ2ggcGVyZm9ybWFuY2UgbWF0cml4IGFuZCB2ZWN0b3Igb3BlcmF0aW9uc1xuICogQGF1dGhvciBCcmFuZG9uIEpvbmVzXG4gKiBAYXV0aG9yIENvbGluIE1hY0tlbnppZSBJVlxuICogQHZlcnNpb24gMi4yLjFcbiAqL1xuXG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkVcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuXG4oZnVuY3Rpb24oX2dsb2JhbCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgc2hpbSA9IHt9O1xuICBpZiAodHlwZW9mKGV4cG9ydHMpID09PSAndW5kZWZpbmVkJykge1xuICAgIGlmKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICBzaGltLmV4cG9ydHMgPSB7fTtcbiAgICAgIGRlZmluZShmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHNoaW0uZXhwb3J0cztcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBnbC1tYXRyaXggbGl2ZXMgaW4gYSBicm93c2VyLCBkZWZpbmUgaXRzIG5hbWVzcGFjZXMgaW4gZ2xvYmFsXG4gICAgICBzaGltLmV4cG9ydHMgPSB0eXBlb2Yod2luZG93KSAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBfZ2xvYmFsO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICAvLyBnbC1tYXRyaXggbGl2ZXMgaW4gY29tbW9uanMsIGRlZmluZSBpdHMgbmFtZXNwYWNlcyBpbiBleHBvcnRzXG4gICAgc2hpbS5leHBvcnRzID0gZXhwb3J0cztcbiAgfVxuXG4gIChmdW5jdGlvbihleHBvcnRzKSB7XG4gICAgLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuXG5pZighR0xNQVRfRVBTSUxPTikge1xuICAgIHZhciBHTE1BVF9FUFNJTE9OID0gMC4wMDAwMDE7XG59XG5cbmlmKCFHTE1BVF9BUlJBWV9UWVBFKSB7XG4gICAgdmFyIEdMTUFUX0FSUkFZX1RZUEUgPSAodHlwZW9mIEZsb2F0MzJBcnJheSAhPT0gJ3VuZGVmaW5lZCcpID8gRmxvYXQzMkFycmF5IDogQXJyYXk7XG59XG5cbmlmKCFHTE1BVF9SQU5ET00pIHtcbiAgICB2YXIgR0xNQVRfUkFORE9NID0gTWF0aC5yYW5kb207XG59XG5cbi8qKlxuICogQGNsYXNzIENvbW1vbiB1dGlsaXRpZXNcbiAqIEBuYW1lIGdsTWF0cml4XG4gKi9cbnZhciBnbE1hdHJpeCA9IHt9O1xuXG4vKipcbiAqIFNldHMgdGhlIHR5cGUgb2YgYXJyYXkgdXNlZCB3aGVuIGNyZWF0aW5nIG5ldyB2ZWN0b3JzIGFuZCBtYXRyaWNpZXNcbiAqXG4gKiBAcGFyYW0ge1R5cGV9IHR5cGUgQXJyYXkgdHlwZSwgc3VjaCBhcyBGbG9hdDMyQXJyYXkgb3IgQXJyYXlcbiAqL1xuZ2xNYXRyaXguc2V0TWF0cml4QXJyYXlUeXBlID0gZnVuY3Rpb24odHlwZSkge1xuICAgIEdMTUFUX0FSUkFZX1RZUEUgPSB0eXBlO1xufVxuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5nbE1hdHJpeCA9IGdsTWF0cml4O1xufVxuXG52YXIgZGVncmVlID0gTWF0aC5QSSAvIDE4MDtcblxuLyoqXG4qIENvbnZlcnQgRGVncmVlIFRvIFJhZGlhblxuKlxuKiBAcGFyYW0ge051bWJlcn0gQW5nbGUgaW4gRGVncmVlc1xuKi9cbmdsTWF0cml4LnRvUmFkaWFuID0gZnVuY3Rpb24oYSl7XG4gICAgIHJldHVybiBhICogZGVncmVlO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgMiBEaW1lbnNpb25hbCBWZWN0b3JcbiAqIEBuYW1lIHZlYzJcbiAqL1xuXG52YXIgdmVjMiA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzJcbiAqXG4gKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXG4gKi9cbnZlYzIuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDIpO1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzIgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXG4gKi9cbnZlYzIuY2xvbmUgPSBmdW5jdGlvbihhKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDIpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzIgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXG4gKi9cbnZlYzIuZnJvbVZhbHVlcyA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMik7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMyIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIuc2V0ID0gZnVuY3Rpb24ob3V0LCB4LCB5KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5hZGQgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5zdWJ0cmFjdCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLnN1YiA9IHZlYzIuc3VidHJhY3Q7XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIubXVsID0gdmVjMi5tdWx0aXBseTtcblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIuZGl2aWRlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLmRpdiA9IHZlYzIuZGl2aWRlO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5taW4gPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubWF4ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjMiBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMyJ3MgYWZ0ZXIgc2NhbGluZyB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5zY2FsZUFuZEFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XG4gICAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMyLmRpc3RhbmNlID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLmRpc3QgPSB2ZWMyLmRpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjMi5zcXVhcmVkRGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdO1xuICAgIHJldHVybiB4KnggKyB5Knk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkRGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5zcXJEaXN0ID0gdmVjMi5zcXVhcmVkRGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xudmVjMi5sZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIubGVuID0gdmVjMi5sZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xudmVjMi5zcXVhcmVkTGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIHJldHVybiB4KnggKyB5Knk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuc3FyTGVuID0gdmVjMi5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubmVnYXRlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgdmFyIGxlbiA9IHgqeCArIHkqeTtcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xudmVjMi5kb3QgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdO1xufTtcblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMidzXG4gKiBOb3RlIHRoYXQgdGhlIGNyb3NzIHByb2R1Y3QgbXVzdCBieSBkZWZpbml0aW9uIHByb2R1Y2UgYSAzRCB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzIuY3Jvc3MgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICB2YXIgeiA9IGFbMF0gKiBiWzFdIC0gYVsxXSAqIGJbMF07XG4gICAgb3V0WzBdID0gb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSB6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLmxlcnAgPSBmdW5jdGlvbiAob3V0LCBhLCBiLCB0KSB7XG4gICAgdmFyIGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIucmFuZG9tID0gZnVuY3Rpb24gKG91dCwgc2NhbGUpIHtcbiAgICBzY2FsZSA9IHNjYWxlIHx8IDEuMDtcbiAgICB2YXIgciA9IEdMTUFUX1JBTkRPTSgpICogMi4wICogTWF0aC5QSTtcbiAgICBvdXRbMF0gPSBNYXRoLmNvcyhyKSAqIHNjYWxlO1xuICAgIG91dFsxXSA9IE1hdGguc2luKHIpICogc2NhbGU7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0Mn0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi50cmFuc2Zvcm1NYXQyID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bMl0gKiB5O1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVszXSAqIHk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDJkfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnRyYW5zZm9ybU1hdDJkID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bMl0gKiB5ICsgbVs0XTtcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5ICsgbVs1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQzXG4gKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0M30gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi50cmFuc2Zvcm1NYXQzID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bM10gKiB5ICsgbVs2XTtcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bNF0gKiB5ICsgbVs3XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQ0XG4gKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcwJ1xuICogNHRoIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIudHJhbnNmb3JtTWF0NCA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSwgXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzEyXTtcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVsxM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzJzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzIuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMycyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxuICogQHJldHVybnMge0FycmF5fSBhXG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5mb3JFYWNoID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ZWMgPSB2ZWMyLmNyZWF0ZSgpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xuICAgICAgICB2YXIgaSwgbDtcbiAgICAgICAgaWYoIXN0cmlkZSkge1xuICAgICAgICAgICAgc3RyaWRlID0gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFvZmZzZXQpIHtcbiAgICAgICAgICAgIG9mZnNldCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKGNvdW50KSB7XG4gICAgICAgICAgICBsID0gTWF0aC5taW4oKGNvdW50ICogc3RyaWRlKSArIG9mZnNldCwgYS5sZW5ndGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbCA9IGEubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xuICAgICAgICAgICAgdmVjWzBdID0gYVtpXTsgdmVjWzFdID0gYVtpKzFdO1xuICAgICAgICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XG4gICAgICAgICAgICBhW2ldID0gdmVjWzBdOyBhW2krMV0gPSB2ZWNbMV07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IHZlYyB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG52ZWMyLnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICd2ZWMyKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy52ZWMyID0gdmVjMjtcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDMgRGltZW5zaW9uYWwgVmVjdG9yXG4gKiBAbmFtZSB2ZWMzXG4gKi9cblxudmFyIHZlYzMgPSB7fTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMzXG4gKlxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG52ZWMzLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgzKTtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXG4gKi9cbnZlYzMuY2xvbmUgPSBmdW5jdGlvbihhKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDMpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXG4gKi9cbnZlYzMuZnJvbVZhbHVlcyA9IGZ1bmN0aW9uKHgsIHksIHopIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMyk7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzMgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMyB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5zZXQgPSBmdW5jdGlvbihvdXQsIHgsIHksIHopIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuYWRkID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuc3VidHJhY3QgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3VidHJhY3R9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5zdWIgPSB2ZWMzLnN1YnRyYWN0O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5tdWx0aXBseSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLm11bCA9IHZlYzMubXVsdGlwbHk7XG5cbi8qKlxuICogRGl2aWRlcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLmRpdmlkZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLyBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5kaXZpZGV9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5kaXYgPSB2ZWMzLmRpdmlkZTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubWluID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSk7XG4gICAgb3V0WzJdID0gTWF0aC5taW4oYVsyXSwgYlsyXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm1heCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pO1xuICAgIG91dFsyXSA9IE1hdGgubWF4KGFbMl0sIGJbMl0pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyBhIHZlYzMgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGI7XG4gICAgb3V0WzFdID0gYVsxXSAqIGI7XG4gICAgb3V0WzJdID0gYVsyXSAqIGI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMydzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuc2NhbGVBbmRBZGQgPSBmdW5jdGlvbihvdXQsIGEsIGIsIHNjYWxlKSB7XG4gICAgb3V0WzBdID0gYVswXSArIChiWzBdICogc2NhbGUpO1xuICAgIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcbiAgICBvdXRbMl0gPSBhWzJdICsgKGJbMl0gKiBzY2FsZSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbnZlYzMuZGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdLFxuICAgICAgICB6ID0gYlsyXSAtIGFbMl07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnopO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5kaXN0ID0gdmVjMy5kaXN0YW5jZTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbnZlYzMuc3F1YXJlZERpc3RhbmNlID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXSxcbiAgICAgICAgeiA9IGJbMl0gLSBhWzJdO1xuICAgIHJldHVybiB4KnggKyB5KnkgKyB6Kno7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zcXVhcmVkRGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5zcXJEaXN0ID0gdmVjMy5zcXVhcmVkRGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xudmVjMy5sZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLmxlbiA9IHZlYzMubGVuZ3RoO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKi9cbnZlYzMuc3F1YXJlZExlbmd0aCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl07XG4gICAgcmV0dXJuIHgqeCArIHkqeSArIHoqejtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5zcXJMZW4gPSB2ZWMzLnNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5uZWdhdGUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAtYVswXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICBvdXRbMl0gPSAtYVsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubm9ybWFsaXplID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl07XG4gICAgdmFyIGxlbiA9IHgqeCArIHkqeSArIHoqejtcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgICAgIG91dFsyXSA9IGFbMl0gKiBsZW47XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xudmVjMy5kb3QgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl07XG59O1xuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuY3Jvc3MgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICB2YXIgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSxcbiAgICAgICAgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXTtcblxuICAgIG91dFswXSA9IGF5ICogYnogLSBheiAqIGJ5O1xuICAgIG91dFsxXSA9IGF6ICogYnggLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF4ICogYnkgLSBheSAqIGJ4O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLmxlcnAgPSBmdW5jdGlvbiAob3V0LCBhLCBiLCB0KSB7XG4gICAgdmFyIGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdLFxuICAgICAgICBheiA9IGFbMl07XG4gICAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gICAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gICAgb3V0WzJdID0gYXogKyB0ICogKGJbMl0gLSBheik7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5yYW5kb20gPSBmdW5jdGlvbiAob3V0LCBzY2FsZSkge1xuICAgIHNjYWxlID0gc2NhbGUgfHwgMS4wO1xuXG4gICAgdmFyIHIgPSBHTE1BVF9SQU5ET00oKSAqIDIuMCAqIE1hdGguUEk7XG4gICAgdmFyIHogPSAoR0xNQVRfUkFORE9NKCkgKiAyLjApIC0gMS4wO1xuICAgIHZhciB6U2NhbGUgPSBNYXRoLnNxcnQoMS4wLXoqeikgKiBzY2FsZTtcblxuICAgIG91dFswXSA9IE1hdGguY29zKHIpICogelNjYWxlO1xuICAgIG91dFsxXSA9IE1hdGguc2luKHIpICogelNjYWxlO1xuICAgIG91dFsyXSA9IHogKiBzY2FsZTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQ0LlxuICogNHRoIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMudHJhbnNmb3JtTWF0NCA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdO1xuICAgIG91dFsyXSA9IG1bMl0gKiB4ICsgbVs2XSAqIHkgKyBtWzEwXSAqIHogKyBtWzE0XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQzLlxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSB0aGUgM3gzIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnRyYW5zZm9ybU1hdDMgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTtcbiAgICBvdXRbMF0gPSB4ICogbVswXSArIHkgKiBtWzNdICsgeiAqIG1bNl07XG4gICAgb3V0WzFdID0geCAqIG1bMV0gKyB5ICogbVs0XSArIHogKiBtWzddO1xuICAgIG91dFsyXSA9IHggKiBtWzJdICsgeSAqIG1bNV0gKyB6ICogbVs4XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBxdWF0XG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy50cmFuc2Zvcm1RdWF0ID0gZnVuY3Rpb24ob3V0LCBhLCBxKSB7XG4gICAgLy8gYmVuY2htYXJrczogaHR0cDovL2pzcGVyZi5jb20vcXVhdGVybmlvbi10cmFuc2Zvcm0tdmVjMy1pbXBsZW1lbnRhdGlvbnNcblxuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdLFxuICAgICAgICBxeCA9IHFbMF0sIHF5ID0gcVsxXSwgcXogPSBxWzJdLCBxdyA9IHFbM10sXG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHF1YXQgKiB2ZWNcbiAgICAgICAgaXggPSBxdyAqIHggKyBxeSAqIHogLSBxeiAqIHksXG4gICAgICAgIGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6LFxuICAgICAgICBpeiA9IHF3ICogeiArIHF4ICogeSAtIHF5ICogeCxcbiAgICAgICAgaXcgPSAtcXggKiB4IC0gcXkgKiB5IC0gcXogKiB6O1xuXG4gICAgLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuICAgIG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXk7XG4gICAgb3V0WzFdID0gaXkgKiBxdyArIGl3ICogLXF5ICsgaXogKiAtcXggLSBpeCAqIC1xejtcbiAgICBvdXRbMl0gPSBpeiAqIHF3ICsgaXcgKiAtcXogKyBpeCAqIC1xeSAtIGl5ICogLXF4O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKlxuKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB4LWF4aXNcbiogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXG4qIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcbiogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXG4qIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxuKiBAcmV0dXJucyB7dmVjM30gb3V0XG4qL1xudmVjMy5yb3RhdGVYID0gZnVuY3Rpb24ob3V0LCBhLCBiLCBjKXtcbiAgIHZhciBwID0gW10sIHI9W107XG5cdCAgLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxuXHQgIHBbMF0gPSBhWzBdIC0gYlswXTtcblx0ICBwWzFdID0gYVsxXSAtIGJbMV07XG4gIFx0cFsyXSA9IGFbMl0gLSBiWzJdO1xuXG5cdCAgLy9wZXJmb3JtIHJvdGF0aW9uXG5cdCAgclswXSA9IHBbMF07XG5cdCAgclsxXSA9IHBbMV0qTWF0aC5jb3MoYykgLSBwWzJdKk1hdGguc2luKGMpO1xuXHQgIHJbMl0gPSBwWzFdKk1hdGguc2luKGMpICsgcFsyXSpNYXRoLmNvcyhjKTtcblxuXHQgIC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cblx0ICBvdXRbMF0gPSByWzBdICsgYlswXTtcblx0ICBvdXRbMV0gPSByWzFdICsgYlsxXTtcblx0ICBvdXRbMl0gPSByWzJdICsgYlsyXTtcblxuICBcdHJldHVybiBvdXQ7XG59O1xuXG4vKlxuKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB5LWF4aXNcbiogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXG4qIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcbiogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXG4qIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxuKiBAcmV0dXJucyB7dmVjM30gb3V0XG4qL1xudmVjMy5yb3RhdGVZID0gZnVuY3Rpb24ob3V0LCBhLCBiLCBjKXtcbiAgXHR2YXIgcCA9IFtdLCByPVtdO1xuICBcdC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cbiAgXHRwWzBdID0gYVswXSAtIGJbMF07XG4gIFx0cFsxXSA9IGFbMV0gLSBiWzFdO1xuICBcdHBbMl0gPSBhWzJdIC0gYlsyXTtcbiAgXG4gIFx0Ly9wZXJmb3JtIHJvdGF0aW9uXG4gIFx0clswXSA9IHBbMl0qTWF0aC5zaW4oYykgKyBwWzBdKk1hdGguY29zKGMpO1xuICBcdHJbMV0gPSBwWzFdO1xuICBcdHJbMl0gPSBwWzJdKk1hdGguY29zKGMpIC0gcFswXSpNYXRoLnNpbihjKTtcbiAgXG4gIFx0Ly90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuICBcdG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBcdG91dFsxXSA9IHJbMV0gKyBiWzFdO1xuICBcdG91dFsyXSA9IHJbMl0gKyBiWzJdO1xuICBcbiAgXHRyZXR1cm4gb3V0O1xufTtcblxuLypcbiogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgei1heGlzXG4qIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xuKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXG4qIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxuKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cbiogQHJldHVybnMge3ZlYzN9IG91dFxuKi9cbnZlYzMucm90YXRlWiA9IGZ1bmN0aW9uKG91dCwgYSwgYiwgYyl7XG4gIFx0dmFyIHAgPSBbXSwgcj1bXTtcbiAgXHQvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG4gIFx0cFswXSA9IGFbMF0gLSBiWzBdO1xuICBcdHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgXHRwWzJdID0gYVsyXSAtIGJbMl07XG4gIFxuICBcdC8vcGVyZm9ybSByb3RhdGlvblxuICBcdHJbMF0gPSBwWzBdKk1hdGguY29zKGMpIC0gcFsxXSpNYXRoLnNpbihjKTtcbiAgXHRyWzFdID0gcFswXSpNYXRoLnNpbihjKSArIHBbMV0qTWF0aC5jb3MoYyk7XG4gIFx0clsyXSA9IHBbMl07XG4gIFxuICBcdC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cbiAgXHRvdXRbMF0gPSByWzBdICsgYlswXTtcbiAgXHRvdXRbMV0gPSByWzFdICsgYlsxXTtcbiAgXHRvdXRbMl0gPSByWzJdICsgYlsyXTtcbiAgXG4gIFx0cmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzNzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzMuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMzcyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxuICogQHJldHVybnMge0FycmF5fSBhXG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5mb3JFYWNoID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ZWMgPSB2ZWMzLmNyZWF0ZSgpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xuICAgICAgICB2YXIgaSwgbDtcbiAgICAgICAgaWYoIXN0cmlkZSkge1xuICAgICAgICAgICAgc3RyaWRlID0gMztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFvZmZzZXQpIHtcbiAgICAgICAgICAgIG9mZnNldCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKGNvdW50KSB7XG4gICAgICAgICAgICBsID0gTWF0aC5taW4oKGNvdW50ICogc3RyaWRlKSArIG9mZnNldCwgYS5sZW5ndGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbCA9IGEubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xuICAgICAgICAgICAgdmVjWzBdID0gYVtpXTsgdmVjWzFdID0gYVtpKzFdOyB2ZWNbMl0gPSBhW2krMl07XG4gICAgICAgICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgICAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTsgYVtpKzJdID0gdmVjWzJdO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMzfSB2ZWMgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xudmVjMy5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAndmVjMygnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy52ZWMzID0gdmVjMztcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDQgRGltZW5zaW9uYWwgVmVjdG9yXG4gKiBAbmFtZSB2ZWM0XG4gKi9cblxudmFyIHZlYzQgPSB7fTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWM0XG4gKlxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG52ZWM0LmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcbiAqL1xudmVjNC5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNCk7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcbiAqL1xudmVjNC5mcm9tVmFsdWVzID0gZnVuY3Rpb24oeCwgeSwgeiwgdykge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSB3O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWM0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuc2V0ID0gZnVuY3Rpb24ob3V0LCB4LCB5LCB6LCB3KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgb3V0WzNdID0gdztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBZGRzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuYWRkID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSArIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuc3VidHJhY3QgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3VidHJhY3R9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5zdWIgPSB2ZWM0LnN1YnRyYWN0O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5tdWx0aXBseSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gKiBiWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0Lm11bCA9IHZlYzQubXVsdGlwbHk7XG5cbi8qKlxuICogRGl2aWRlcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LmRpdmlkZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLyBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gLyBiWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5kaXZpZGV9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5kaXYgPSB2ZWM0LmRpdmlkZTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubWluID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSk7XG4gICAgb3V0WzJdID0gTWF0aC5taW4oYVsyXSwgYlsyXSk7XG4gICAgb3V0WzNdID0gTWF0aC5taW4oYVszXSwgYlszXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0Lm1heCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pO1xuICAgIG91dFsyXSA9IE1hdGgubWF4KGFbMl0sIGJbMl0pO1xuICAgIG91dFszXSA9IE1hdGgubWF4KGFbM10sIGJbM10pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyBhIHZlYzQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGI7XG4gICAgb3V0WzFdID0gYVsxXSAqIGI7XG4gICAgb3V0WzJdID0gYVsyXSAqIGI7XG4gICAgb3V0WzNdID0gYVszXSAqIGI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gdmVjNCdzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuc2NhbGVBbmRBZGQgPSBmdW5jdGlvbihvdXQsIGEsIGIsIHNjYWxlKSB7XG4gICAgb3V0WzBdID0gYVswXSArIChiWzBdICogc2NhbGUpO1xuICAgIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcbiAgICBvdXRbMl0gPSBhWzJdICsgKGJbMl0gKiBzY2FsZSk7XG4gICAgb3V0WzNdID0gYVszXSArIChiWzNdICogc2NhbGUpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWM0LmRpc3RhbmNlID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXSxcbiAgICAgICAgeiA9IGJbMl0gLSBhWzJdLFxuICAgICAgICB3ID0gYlszXSAtIGFbM107XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnogKyB3KncpO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuZGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5kaXN0ID0gdmVjNC5kaXN0YW5jZTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbnZlYzQuc3F1YXJlZERpc3RhbmNlID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXSxcbiAgICAgICAgeiA9IGJbMl0gLSBhWzJdLFxuICAgICAgICB3ID0gYlszXSAtIGFbM107XG4gICAgcmV0dXJuIHgqeCArIHkqeSArIHoqeiArIHcqdztcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LnNxckRpc3QgPSB2ZWM0LnNxdWFyZWREaXN0YW5jZTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG52ZWM0Lmxlbmd0aCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl0sXG4gICAgICAgIHcgPSBhWzNdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6ICsgdyp3KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LmxlbiA9IHZlYzQubGVuZ3RoO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKi9cbnZlYzQuc3F1YXJlZExlbmd0aCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl0sXG4gICAgICAgIHcgPSBhWzNdO1xuICAgIHJldHVybiB4KnggKyB5KnkgKyB6KnogKyB3Knc7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuc3FyTGVuID0gdmVjNC5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubmVnYXRlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgb3V0WzNdID0gLWFbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0Lm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdLFxuICAgICAgICB3ID0gYVszXTtcbiAgICB2YXIgbGVuID0geCp4ICsgeSp5ICsgeip6ICsgdyp3O1xuICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICAgICAgb3V0WzBdID0gYVswXSAqIGxlbjtcbiAgICAgICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcbiAgICAgICAgb3V0WzJdID0gYVsyXSAqIGxlbjtcbiAgICAgICAgb3V0WzNdID0gYVszXSAqIGxlbjtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG52ZWM0LmRvdCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXSArIGFbM10gKiBiWzNdO1xufTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5sZXJwID0gZnVuY3Rpb24gKG91dCwgYSwgYiwgdCkge1xuICAgIHZhciBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdLFxuICAgICAgICBhdyA9IGFbM107XG4gICAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gICAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gICAgb3V0WzJdID0gYXogKyB0ICogKGJbMl0gLSBheik7XG4gICAgb3V0WzNdID0gYXcgKyB0ICogKGJbM10gLSBhdyk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5yYW5kb20gPSBmdW5jdGlvbiAob3V0LCBzY2FsZSkge1xuICAgIHNjYWxlID0gc2NhbGUgfHwgMS4wO1xuXG4gICAgLy9UT0RPOiBUaGlzIGlzIGEgcHJldHR5IGF3ZnVsIHdheSBvZiBkb2luZyB0aGlzLiBGaW5kIHNvbWV0aGluZyBiZXR0ZXIuXG4gICAgb3V0WzBdID0gR0xNQVRfUkFORE9NKCk7XG4gICAgb3V0WzFdID0gR0xNQVRfUkFORE9NKCk7XG4gICAgb3V0WzJdID0gR0xNQVRfUkFORE9NKCk7XG4gICAgb3V0WzNdID0gR0xNQVRfUkFORE9NKCk7XG4gICAgdmVjNC5ub3JtYWxpemUob3V0LCBvdXQpO1xuICAgIHZlYzQuc2NhbGUob3V0LCBvdXQsIHNjYWxlKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWM0IHdpdGggYSBtYXQ0LlxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC50cmFuc2Zvcm1NYXQ0ID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl0sIHcgPSBhWzNdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdICogdztcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHogKyBtWzEzXSAqIHc7XG4gICAgb3V0WzJdID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdICogdztcbiAgICBvdXRbM10gPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV0gKiB3O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnRyYW5zZm9ybVF1YXQgPSBmdW5jdGlvbihvdXQsIGEsIHEpIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSxcbiAgICAgICAgcXggPSBxWzBdLCBxeSA9IHFbMV0sIHF6ID0gcVsyXSwgcXcgPSBxWzNdLFxuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjXG4gICAgICAgIGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5LFxuICAgICAgICBpeSA9IHF3ICogeSArIHF6ICogeCAtIHF4ICogeixcbiAgICAgICAgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHgsXG4gICAgICAgIGl3ID0gLXF4ICogeCAtIHF5ICogeSAtIHF6ICogejtcblxuICAgIC8vIGNhbGN1bGF0ZSByZXN1bHQgKiBpbnZlcnNlIHF1YXRcbiAgICBvdXRbMF0gPSBpeCAqIHF3ICsgaXcgKiAtcXggKyBpeSAqIC1xeiAtIGl6ICogLXF5O1xuICAgIG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXo7XG4gICAgb3V0WzJdID0gaXogKiBxdyArIGl3ICogLXF6ICsgaXggKiAtcXkgLSBpeSAqIC1xeDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjNHMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjNC4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzJzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LmZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZlYyA9IHZlYzQuY3JlYXRlKCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgICAgIHZhciBpLCBsO1xuICAgICAgICBpZighc3RyaWRlKSB7XG4gICAgICAgICAgICBzdHJpZGUgPSA0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIW9mZnNldCkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoY291bnQpIHtcbiAgICAgICAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsID0gYS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICAgICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07IHZlY1syXSA9IGFbaSsyXTsgdmVjWzNdID0gYVtpKzNdO1xuICAgICAgICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XG4gICAgICAgICAgICBhW2ldID0gdmVjWzBdOyBhW2krMV0gPSB2ZWNbMV07IGFbaSsyXSA9IHZlY1syXTsgYVtpKzNdID0gdmVjWzNdO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWM0fSB2ZWMgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xudmVjNC5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAndmVjNCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnZlYzQgPSB2ZWM0O1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgMngyIE1hdHJpeFxuICogQG5hbWUgbWF0MlxuICovXG5cbnZhciBtYXQyID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQyXG4gKlxuICogQHJldHVybnMge21hdDJ9IGEgbmV3IDJ4MiBtYXRyaXhcbiAqL1xubWF0Mi5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNCk7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDIgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IGEgbWF0cml4IHRvIGNsb25lXG4gKiBAcmV0dXJucyB7bWF0Mn0gYSBuZXcgMngyIG1hdHJpeFxuICovXG5tYXQyLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQyIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IGEgbWF0MiB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLnRyYW5zcG9zZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgICBpZiAob3V0ID09PSBhKSB7XG4gICAgICAgIHZhciBhMSA9IGFbMV07XG4gICAgICAgIG91dFsxXSA9IGFbMl07XG4gICAgICAgIG91dFsyXSA9IGExO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFswXSA9IGFbMF07XG4gICAgICAgIG91dFsxXSA9IGFbMl07XG4gICAgICAgIG91dFsyXSA9IGFbMV07XG4gICAgICAgIG91dFszXSA9IGFbM107XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEludmVydHMgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLmludmVydCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sXG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgICAgICBkZXQgPSBhMCAqIGEzIC0gYTIgKiBhMTtcblxuICAgIGlmICghZGV0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG4gICAgXG4gICAgb3V0WzBdID0gIGEzICogZGV0O1xuICAgIG91dFsxXSA9IC1hMSAqIGRldDtcbiAgICBvdXRbMl0gPSAtYTIgKiBkZXQ7XG4gICAgb3V0WzNdID0gIGEwICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLmFkam9pbnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICAvLyBDYWNoaW5nIHRoaXMgdmFsdWUgaXMgbmVzc2VjYXJ5IGlmIG91dCA9PSBhXG4gICAgdmFyIGEwID0gYVswXTtcbiAgICBvdXRbMF0gPSAgYVszXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICBvdXRbMl0gPSAtYVsyXTtcbiAgICBvdXRbM10gPSAgYTA7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xubWF0Mi5kZXRlcm1pbmFudCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBhWzNdIC0gYVsyXSAqIGFbMV07XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDInc1xuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5tdWx0aXBseSA9IGZ1bmN0aW9uIChvdXQsIGEsIGIpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdO1xuICAgIHZhciBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107XG4gICAgb3V0WzBdID0gYTAgKiBiMCArIGEyICogYjE7XG4gICAgb3V0WzFdID0gYTEgKiBiMCArIGEzICogYjE7XG4gICAgb3V0WzJdID0gYTAgKiBiMiArIGEyICogYjM7XG4gICAgb3V0WzNdID0gYTEgKiBiMiArIGEzICogYjM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQyLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDIubXVsID0gbWF0Mi5tdWx0aXBseTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0MiBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLnJvdGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sXG4gICAgICAgIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKTtcbiAgICBvdXRbMF0gPSBhMCAqICBjICsgYTIgKiBzO1xuICAgIG91dFsxXSA9IGExICogIGMgKyBhMyAqIHM7XG4gICAgb3V0WzJdID0gYTAgKiAtcyArIGEyICogYztcbiAgICBvdXRbM10gPSBhMSAqIC1zICsgYTMgKiBjO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0MiBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKiovXG5tYXQyLnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSxcbiAgICAgICAgdjAgPSB2WzBdLCB2MSA9IHZbMV07XG4gICAgb3V0WzBdID0gYTAgKiB2MDtcbiAgICBvdXRbMV0gPSBhMSAqIHYwO1xuICAgIG91dFsyXSA9IGEyICogdjE7XG4gICAgb3V0WzNdID0gYTMgKiB2MTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gbWF0IG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDIuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDIoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XG59O1xuXG4vKipcbiAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxuICovXG5tYXQyLmZyb2IgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybihNYXRoLnNxcnQoTWF0aC5wb3coYVswXSwgMikgKyBNYXRoLnBvdyhhWzFdLCAyKSArIE1hdGgucG93KGFbMl0sIDIpICsgTWF0aC5wb3coYVszXSwgMikpKVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIEwsIEQgYW5kIFUgbWF0cmljZXMgKExvd2VyIHRyaWFuZ3VsYXIsIERpYWdvbmFsIGFuZCBVcHBlciB0cmlhbmd1bGFyKSBieSBmYWN0b3JpemluZyB0aGUgaW5wdXQgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IEwgdGhlIGxvd2VyIHRyaWFuZ3VsYXIgbWF0cml4IFxuICogQHBhcmFtIHttYXQyfSBEIHRoZSBkaWFnb25hbCBtYXRyaXggXG4gKiBAcGFyYW0ge21hdDJ9IFUgdGhlIHVwcGVyIHRyaWFuZ3VsYXIgbWF0cml4IFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBpbnB1dCBtYXRyaXggdG8gZmFjdG9yaXplXG4gKi9cblxubWF0Mi5MRFUgPSBmdW5jdGlvbiAoTCwgRCwgVSwgYSkgeyBcbiAgICBMWzJdID0gYVsyXS9hWzBdOyBcbiAgICBVWzBdID0gYVswXTsgXG4gICAgVVsxXSA9IGFbMV07IFxuICAgIFVbM10gPSBhWzNdIC0gTFsyXSAqIFVbMV07IFxuICAgIHJldHVybiBbTCwgRCwgVV07ICAgICAgIFxufTsgXG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLm1hdDIgPSBtYXQyO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgMngzIE1hdHJpeFxuICogQG5hbWUgbWF0MmRcbiAqIFxuICogQGRlc2NyaXB0aW9uIFxuICogQSBtYXQyZCBjb250YWlucyBzaXggZWxlbWVudHMgZGVmaW5lZCBhczpcbiAqIDxwcmU+XG4gKiBbYSwgYywgdHgsXG4gKiAgYiwgZCwgdHldXG4gKiA8L3ByZT5cbiAqIFRoaXMgaXMgYSBzaG9ydCBmb3JtIGZvciB0aGUgM3gzIG1hdHJpeDpcbiAqIDxwcmU+XG4gKiBbYSwgYywgdHgsXG4gKiAgYiwgZCwgdHksXG4gKiAgMCwgMCwgMV1cbiAqIDwvcHJlPlxuICogVGhlIGxhc3Qgcm93IGlzIGlnbm9yZWQgc28gdGhlIGFycmF5IGlzIHNob3J0ZXIgYW5kIG9wZXJhdGlvbnMgYXJlIGZhc3Rlci5cbiAqL1xuXG52YXIgbWF0MmQgPSB7fTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDJkXG4gKlxuICogQHJldHVybnMge21hdDJkfSBhIG5ldyAyeDMgbWF0cml4XG4gKi9cbm1hdDJkLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg2KTtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDJkIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQyZH0gYSBtYXRyaXggdG8gY2xvbmVcbiAqIEByZXR1cm5zIHttYXQyZH0gYSBuZXcgMngzIG1hdHJpeFxuICovXG5tYXQyZC5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNik7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDJkIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLmNvcHkgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgYSBtYXQyZCB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5tYXQyZC5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEludmVydHMgYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xubWF0MmQuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGFhID0gYVswXSwgYWIgPSBhWzFdLCBhYyA9IGFbMl0sIGFkID0gYVszXSxcbiAgICAgICAgYXR4ID0gYVs0XSwgYXR5ID0gYVs1XTtcblxuICAgIHZhciBkZXQgPSBhYSAqIGFkIC0gYWIgKiBhYztcbiAgICBpZighZGV0KXtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IGFkICogZGV0O1xuICAgIG91dFsxXSA9IC1hYiAqIGRldDtcbiAgICBvdXRbMl0gPSAtYWMgKiBkZXQ7XG4gICAgb3V0WzNdID0gYWEgKiBkZXQ7XG4gICAgb3V0WzRdID0gKGFjICogYXR5IC0gYWQgKiBhdHgpICogZGV0O1xuICAgIG91dFs1XSA9IChhYiAqIGF0eCAtIGFhICogYXR5KSAqIGRldDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxuICovXG5tYXQyZC5kZXRlcm1pbmFudCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBhWzNdIC0gYVsxXSAqIGFbMl07XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDJkJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0MmR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5tYXQyZC5tdWx0aXBseSA9IGZ1bmN0aW9uIChvdXQsIGEsIGIpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLCBhNCA9IGFbNF0sIGE1ID0gYVs1XSxcbiAgICAgICAgYjAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdLCBiNCA9IGJbNF0sIGI1ID0gYls1XTtcbiAgICBvdXRbMF0gPSBhMCAqIGIwICsgYTIgKiBiMTtcbiAgICBvdXRbMV0gPSBhMSAqIGIwICsgYTMgKiBiMTtcbiAgICBvdXRbMl0gPSBhMCAqIGIyICsgYTIgKiBiMztcbiAgICBvdXRbM10gPSBhMSAqIGIyICsgYTMgKiBiMztcbiAgICBvdXRbNF0gPSBhMCAqIGI0ICsgYTIgKiBiNSArIGE0O1xuICAgIG91dFs1XSA9IGExICogYjQgKyBhMyAqIGI1ICsgYTU7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQyZC5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5tYXQyZC5tdWwgPSBtYXQyZC5tdWx0aXBseTtcblxuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQyZCBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5tYXQyZC5yb3RhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLCBhNCA9IGFbNF0sIGE1ID0gYVs1XSxcbiAgICAgICAgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpO1xuICAgIG91dFswXSA9IGEwICogIGMgKyBhMiAqIHM7XG4gICAgb3V0WzFdID0gYTEgKiAgYyArIGEzICogcztcbiAgICBvdXRbMl0gPSBhMCAqIC1zICsgYTIgKiBjO1xuICAgIG91dFszXSA9IGExICogLXMgKyBhMyAqIGM7XG4gICAgb3V0WzRdID0gYTQ7XG4gICAgb3V0WzVdID0gYTU7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQyZCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKiovXG5tYXQyZC5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sIGE0ID0gYVs0XSwgYTUgPSBhWzVdLFxuICAgICAgICB2MCA9IHZbMF0sIHYxID0gdlsxXTtcbiAgICBvdXRbMF0gPSBhMCAqIHYwO1xuICAgIG91dFsxXSA9IGExICogdjA7XG4gICAgb3V0WzJdID0gYTIgKiB2MTtcbiAgICBvdXRbM10gPSBhMyAqIHYxO1xuICAgIG91dFs0XSA9IGE0O1xuICAgIG91dFs1XSA9IGE1O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zbGF0ZXMgdGhlIG1hdDJkIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gdHJhbnNsYXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKiovXG5tYXQyZC50cmFuc2xhdGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLCBhNCA9IGFbNF0sIGE1ID0gYVs1XSxcbiAgICAgICAgdjAgPSB2WzBdLCB2MSA9IHZbMV07XG4gICAgb3V0WzBdID0gYTA7XG4gICAgb3V0WzFdID0gYTE7XG4gICAgb3V0WzJdID0gYTI7XG4gICAgb3V0WzNdID0gYTM7XG4gICAgb3V0WzRdID0gYTAgKiB2MCArIGEyICogdjEgKyBhNDtcbiAgICBvdXRbNV0gPSBhMSAqIHYwICsgYTMgKiB2MSArIGE1O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xubWF0MmQuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDJkKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVszXSArICcsICcgKyBhWzRdICsgJywgJyArIGFbNV0gKyAnKSc7XG59O1xuXG4vKipcbiAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXG4gKi9cbm1hdDJkLmZyb2IgPSBmdW5jdGlvbiAoYSkgeyBcbiAgICByZXR1cm4oTWF0aC5zcXJ0KE1hdGgucG93KGFbMF0sIDIpICsgTWF0aC5wb3coYVsxXSwgMikgKyBNYXRoLnBvdyhhWzJdLCAyKSArIE1hdGgucG93KGFbM10sIDIpICsgTWF0aC5wb3coYVs0XSwgMikgKyBNYXRoLnBvdyhhWzVdLCAyKSArIDEpKVxufTsgXG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLm1hdDJkID0gbWF0MmQ7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAzeDMgTWF0cml4XG4gKiBAbmFtZSBtYXQzXG4gKi9cblxudmFyIG1hdDMgPSB7fTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDNcbiAqXG4gKiBAcmV0dXJucyB7bWF0M30gYSBuZXcgM3gzIG1hdHJpeFxuICovXG5tYXQzLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg5KTtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDE7XG4gICAgb3V0WzVdID0gMDtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3BpZXMgdGhlIHVwcGVyLWxlZnQgM3gzIHZhbHVlcyBpbnRvIHRoZSBnaXZlbiBtYXQzLlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgM3gzIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhICAgdGhlIHNvdXJjZSA0eDQgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMuZnJvbU1hdDQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzRdO1xuICAgIG91dFs0XSA9IGFbNV07XG4gICAgb3V0WzVdID0gYVs2XTtcbiAgICBvdXRbNl0gPSBhWzhdO1xuICAgIG91dFs3XSA9IGFbOV07XG4gICAgb3V0WzhdID0gYVsxMF07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcbiAqL1xubWF0My5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoOSk7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDMgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IGEgbWF0MyB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMTtcbiAgICBvdXRbNV0gPSAwO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My50cmFuc3Bvc2UgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gICAgaWYgKG91dCA9PT0gYSkge1xuICAgICAgICB2YXIgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTEyID0gYVs1XTtcbiAgICAgICAgb3V0WzFdID0gYVszXTtcbiAgICAgICAgb3V0WzJdID0gYVs2XTtcbiAgICAgICAgb3V0WzNdID0gYTAxO1xuICAgICAgICBvdXRbNV0gPSBhWzddO1xuICAgICAgICBvdXRbNl0gPSBhMDI7XG4gICAgICAgIG91dFs3XSA9IGExMjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvdXRbMF0gPSBhWzBdO1xuICAgICAgICBvdXRbMV0gPSBhWzNdO1xuICAgICAgICBvdXRbMl0gPSBhWzZdO1xuICAgICAgICBvdXRbM10gPSBhWzFdO1xuICAgICAgICBvdXRbNF0gPSBhWzRdO1xuICAgICAgICBvdXRbNV0gPSBhWzddO1xuICAgICAgICBvdXRbNl0gPSBhWzJdO1xuICAgICAgICBvdXRbN10gPSBhWzVdO1xuICAgICAgICBvdXRbOF0gPSBhWzhdO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5pbnZlcnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcblxuICAgICAgICBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjEsXG4gICAgICAgIGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjAsXG4gICAgICAgIGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMCxcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMTtcblxuICAgIGlmICghZGV0KSB7IFxuICAgICAgICByZXR1cm4gbnVsbDsgXG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IGIwMSAqIGRldDtcbiAgICBvdXRbMV0gPSAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSkgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGExMiAqIGEwMSAtIGEwMiAqIGExMSkgKiBkZXQ7XG4gICAgb3V0WzNdID0gYjExICogZGV0O1xuICAgIG91dFs0XSA9IChhMjIgKiBhMDAgLSBhMDIgKiBhMjApICogZGV0O1xuICAgIG91dFs1XSA9ICgtYTEyICogYTAwICsgYTAyICogYTEwKSAqIGRldDtcbiAgICBvdXRbNl0gPSBiMjEgKiBkZXQ7XG4gICAgb3V0WzddID0gKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApICogZGV0O1xuICAgIG91dFs4XSA9IChhMTEgKiBhMDAgLSBhMDEgKiBhMTApICogZGV0O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5hZGpvaW50ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgICBvdXRbMF0gPSAoYTExICogYTIyIC0gYTEyICogYTIxKTtcbiAgICBvdXRbMV0gPSAoYTAyICogYTIxIC0gYTAxICogYTIyKTtcbiAgICBvdXRbMl0gPSAoYTAxICogYTEyIC0gYTAyICogYTExKTtcbiAgICBvdXRbM10gPSAoYTEyICogYTIwIC0gYTEwICogYTIyKTtcbiAgICBvdXRbNF0gPSAoYTAwICogYTIyIC0gYTAyICogYTIwKTtcbiAgICBvdXRbNV0gPSAoYTAyICogYTEwIC0gYTAwICogYTEyKTtcbiAgICBvdXRbNl0gPSAoYTEwICogYTIxIC0gYTExICogYTIwKTtcbiAgICBvdXRbN10gPSAoYTAxICogYTIwIC0gYTAwICogYTIxKTtcbiAgICBvdXRbOF0gPSAoYTAwICogYTExIC0gYTAxICogYTEwKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xubWF0My5kZXRlcm1pbmFudCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgICByZXR1cm4gYTAwICogKGEyMiAqIGExMSAtIGExMiAqIGEyMSkgKyBhMDEgKiAoLWEyMiAqIGExMCArIGExMiAqIGEyMCkgKyBhMDIgKiAoYTIxICogYTEwIC0gYTExICogYTIwKTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MydzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuXG4gICAgICAgIGIwMCA9IGJbMF0sIGIwMSA9IGJbMV0sIGIwMiA9IGJbMl0sXG4gICAgICAgIGIxMCA9IGJbM10sIGIxMSA9IGJbNF0sIGIxMiA9IGJbNV0sXG4gICAgICAgIGIyMCA9IGJbNl0sIGIyMSA9IGJbN10sIGIyMiA9IGJbOF07XG5cbiAgICBvdXRbMF0gPSBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjA7XG4gICAgb3V0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxO1xuICAgIG91dFsyXSA9IGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMjtcblxuICAgIG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMDtcbiAgICBvdXRbNF0gPSBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjE7XG4gICAgb3V0WzVdID0gYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyO1xuXG4gICAgb3V0WzZdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwO1xuICAgIG91dFs3XSA9IGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMTtcbiAgICBvdXRbOF0gPSBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQzLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDMubXVsID0gbWF0My5tdWx0aXBseTtcblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQzIGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuICAgICAgICB4ID0gdlswXSwgeSA9IHZbMV07XG5cbiAgICBvdXRbMF0gPSBhMDA7XG4gICAgb3V0WzFdID0gYTAxO1xuICAgIG91dFsyXSA9IGEwMjtcblxuICAgIG91dFszXSA9IGExMDtcbiAgICBvdXRbNF0gPSBhMTE7XG4gICAgb3V0WzVdID0gYTEyO1xuXG4gICAgb3V0WzZdID0geCAqIGEwMCArIHkgKiBhMTAgKyBhMjA7XG4gICAgb3V0WzddID0geCAqIGEwMSArIHkgKiBhMTEgKyBhMjE7XG4gICAgb3V0WzhdID0geCAqIGEwMiArIHkgKiBhMTIgKyBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDMgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5yb3RhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcblxuICAgICAgICBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBjICogYTAwICsgcyAqIGExMDtcbiAgICBvdXRbMV0gPSBjICogYTAxICsgcyAqIGExMTtcbiAgICBvdXRbMl0gPSBjICogYTAyICsgcyAqIGExMjtcblxuICAgIG91dFszXSA9IGMgKiBhMTAgLSBzICogYTAwO1xuICAgIG91dFs0XSA9IGMgKiBhMTEgLSBzICogYTAxO1xuICAgIG91dFs1XSA9IGMgKiBhMTIgLSBzICogYTAyO1xuXG4gICAgb3V0WzZdID0gYTIwO1xuICAgIG91dFs3XSA9IGEyMTtcbiAgICBvdXRbOF0gPSBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQzIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqKi9cbm1hdDMuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzFdO1xuXG4gICAgb3V0WzBdID0geCAqIGFbMF07XG4gICAgb3V0WzFdID0geCAqIGFbMV07XG4gICAgb3V0WzJdID0geCAqIGFbMl07XG5cbiAgICBvdXRbM10gPSB5ICogYVszXTtcbiAgICBvdXRbNF0gPSB5ICogYVs0XTtcbiAgICBvdXRbNV0gPSB5ICogYVs1XTtcblxuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcGllcyB0aGUgdmFsdWVzIGZyb20gYSBtYXQyZCBpbnRvIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gY29weVxuICogQHJldHVybnMge21hdDN9IG91dFxuICoqL1xubWF0My5mcm9tTWF0MmQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gMDtcblxuICAgIG91dFszXSA9IGFbMl07XG4gICAgb3V0WzRdID0gYVszXTtcbiAgICBvdXRbNV0gPSAwO1xuXG4gICAgb3V0WzZdID0gYVs0XTtcbiAgICBvdXRbN10gPSBhWzVdO1xuICAgIG91dFs4XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuKiBDYWxjdWxhdGVzIGEgM3gzIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXG4qXG4qIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXG4qXG4qIEByZXR1cm5zIHttYXQzfSBvdXRcbiovXG5tYXQzLmZyb21RdWF0ID0gZnVuY3Rpb24gKG91dCwgcSkge1xuICAgIHZhciB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXSxcbiAgICAgICAgeDIgPSB4ICsgeCxcbiAgICAgICAgeTIgPSB5ICsgeSxcbiAgICAgICAgejIgPSB6ICsgeixcblxuICAgICAgICB4eCA9IHggKiB4MixcbiAgICAgICAgeXggPSB5ICogeDIsXG4gICAgICAgIHl5ID0geSAqIHkyLFxuICAgICAgICB6eCA9IHogKiB4MixcbiAgICAgICAgenkgPSB6ICogeTIsXG4gICAgICAgIHp6ID0geiAqIHoyLFxuICAgICAgICB3eCA9IHcgKiB4MixcbiAgICAgICAgd3kgPSB3ICogeTIsXG4gICAgICAgIHd6ID0gdyAqIHoyO1xuXG4gICAgb3V0WzBdID0gMSAtIHl5IC0geno7XG4gICAgb3V0WzNdID0geXggLSB3ejtcbiAgICBvdXRbNl0gPSB6eCArIHd5O1xuXG4gICAgb3V0WzFdID0geXggKyB3ejtcbiAgICBvdXRbNF0gPSAxIC0geHggLSB6ejtcbiAgICBvdXRbN10gPSB6eSAtIHd4O1xuXG4gICAgb3V0WzJdID0genggLSB3eTtcbiAgICBvdXRbNV0gPSB6eSArIHd4O1xuICAgIG91dFs4XSA9IDEgLSB4eCAtIHl5O1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuKiBDYWxjdWxhdGVzIGEgM3gzIG5vcm1hbCBtYXRyaXggKHRyYW5zcG9zZSBpbnZlcnNlKSBmcm9tIHRoZSA0eDQgbWF0cml4XG4qXG4qIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiogQHBhcmFtIHttYXQ0fSBhIE1hdDQgdG8gZGVyaXZlIHRoZSBub3JtYWwgbWF0cml4IGZyb21cbipcbiogQHJldHVybnMge21hdDN9IG91dFxuKi9cbm1hdDMubm9ybWFsRnJvbU1hdDQgPSBmdW5jdGlvbiAob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbiAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV0sXG5cbiAgICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLFxuICAgICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCxcbiAgICAgICAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXG4gICAgICAgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLFxuICAgICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCxcbiAgICAgICAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXG4gICAgICAgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMixcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICghZGV0KSB7IFxuICAgICAgICByZXR1cm4gbnVsbDsgXG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICAgIG91dFsxXSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xuICAgIG91dFsyXSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuXG4gICAgb3V0WzNdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzRdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzVdID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG5cbiAgICBvdXRbNl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldDtcbiAgICBvdXRbN10gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcbiAgICBvdXRbOF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBtYXQgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xubWF0My5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAnbWF0MygnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgXG4gICAgICAgICAgICAgICAgICAgIGFbM10gKyAnLCAnICsgYVs0XSArICcsICcgKyBhWzVdICsgJywgJyArIFxuICAgICAgICAgICAgICAgICAgICBhWzZdICsgJywgJyArIGFbN10gKyAnLCAnICsgYVs4XSArICcpJztcbn07XG5cbi8qKlxuICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXG4gKi9cbm1hdDMuZnJvYiA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuKE1hdGguc3FydChNYXRoLnBvdyhhWzBdLCAyKSArIE1hdGgucG93KGFbMV0sIDIpICsgTWF0aC5wb3coYVsyXSwgMikgKyBNYXRoLnBvdyhhWzNdLCAyKSArIE1hdGgucG93KGFbNF0sIDIpICsgTWF0aC5wb3coYVs1XSwgMikgKyBNYXRoLnBvdyhhWzZdLCAyKSArIE1hdGgucG93KGFbN10sIDIpICsgTWF0aC5wb3coYVs4XSwgMikpKVxufTtcblxuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQzID0gbWF0Mztcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDR4NCBNYXRyaXhcbiAqIEBuYW1lIG1hdDRcbiAqL1xuXG52YXIgbWF0NCA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0NFxuICpcbiAqIEByZXR1cm5zIHttYXQ0fSBhIG5ldyA0eDQgbWF0cml4XG4gKi9cbm1hdDQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDE2KTtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gMTtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAxO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAwO1xuICAgIG91dFsxNV0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0NCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gYSBtYXRyaXggdG8gY2xvbmVcbiAqIEByZXR1cm5zIHttYXQ0fSBhIG5ldyA0eDQgbWF0cml4XG4gKi9cbm1hdDQuY2xvbmUgPSBmdW5jdGlvbihhKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDE2KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICBvdXRbOV0gPSBhWzldO1xuICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICBvdXRbMTFdID0gYVsxMV07XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQ0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIG91dFs5XSA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IGEgbWF0NCB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAxO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDE7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnRyYW5zcG9zZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgICBpZiAob3V0ID09PSBhKSB7XG4gICAgICAgIHZhciBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICAgICAgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgICAgIG91dFsxXSA9IGFbNF07XG4gICAgICAgIG91dFsyXSA9IGFbOF07XG4gICAgICAgIG91dFszXSA9IGFbMTJdO1xuICAgICAgICBvdXRbNF0gPSBhMDE7XG4gICAgICAgIG91dFs2XSA9IGFbOV07XG4gICAgICAgIG91dFs3XSA9IGFbMTNdO1xuICAgICAgICBvdXRbOF0gPSBhMDI7XG4gICAgICAgIG91dFs5XSA9IGExMjtcbiAgICAgICAgb3V0WzExXSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTJdID0gYTAzO1xuICAgICAgICBvdXRbMTNdID0gYTEzO1xuICAgICAgICBvdXRbMTRdID0gYTIzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFswXSA9IGFbMF07XG4gICAgICAgIG91dFsxXSA9IGFbNF07XG4gICAgICAgIG91dFsyXSA9IGFbOF07XG4gICAgICAgIG91dFszXSA9IGFbMTJdO1xuICAgICAgICBvdXRbNF0gPSBhWzFdO1xuICAgICAgICBvdXRbNV0gPSBhWzVdO1xuICAgICAgICBvdXRbNl0gPSBhWzldO1xuICAgICAgICBvdXRbN10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzhdID0gYVsyXTtcbiAgICAgICAgb3V0WzldID0gYVs2XTtcbiAgICAgICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgICAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgICAgIG91dFsxMl0gPSBhWzNdO1xuICAgICAgICBvdXRbMTNdID0gYVs3XTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTFdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEludmVydHMgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmludmVydCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdLFxuXG4gICAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcbiAgICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXG4gICAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxuICAgICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcbiAgICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXG4gICAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxuICAgICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzIsXG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgICAgICBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cbiAgICBpZiAoIWRldCkgeyBcbiAgICAgICAgcmV0dXJuIG51bGw7IFxuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcbiAgICBvdXRbMV0gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldDtcbiAgICBvdXRbMl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldDtcbiAgICBvdXRbM10gPSAoYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzKSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcbiAgICBvdXRbNV0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcbiAgICBvdXRbNl0gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcbiAgICBvdXRbN10gPSAoYTIwICogYjA1IC0gYTIyICogYjAyICsgYTIzICogYjAxKSAqIGRldDtcbiAgICBvdXRbOF0gPSAoYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2KSAqIGRldDtcbiAgICBvdXRbOV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTBdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzExXSA9IChhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDApICogZGV0O1xuICAgIG91dFsxMl0gPSAoYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTNdID0gKGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzE0XSA9IChhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDApICogZGV0O1xuICAgIG91dFsxNV0gPSAoYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwKSAqIGRldDtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5hZGpvaW50ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbiAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV07XG5cbiAgICBvdXRbMF0gID0gIChhMTEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMSAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpICsgYTMxICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikpO1xuICAgIG91dFsxXSAgPSAtKGEwMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzEgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSk7XG4gICAgb3V0WzJdICA9ICAoYTAxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgLSBhMTEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgICBvdXRbM10gID0gLShhMDEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSAtIGExMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpICsgYTIxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICAgIG91dFs0XSAgPSAtKGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzAgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gICAgb3V0WzVdICA9ICAoYTAwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMCAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcbiAgICBvdXRbNl0gID0gLShhMDAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICAgIG91dFs3XSAgPSAgKGEwMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTEwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzhdICA9ICAoYTEwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgLSBhMjAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSArIGEzMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpKTtcbiAgICBvdXRbOV0gID0gLShhMDAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMDEgKiBhMzMgLSBhMDMgKiBhMzEpICsgYTMwICogKGEwMSAqIGEyMyAtIGEwMyAqIGEyMSkpO1xuICAgIG91dFsxMF0gPSAgKGEwMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpIC0gYTEwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKSk7XG4gICAgb3V0WzExXSA9IC0oYTAwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkgLSBhMTAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSArIGEyMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcbiAgICBvdXRbMTJdID0gLShhMTAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkpO1xuICAgIG91dFsxM10gPSAgKGEwMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIyIC0gYTAyICogYTIxKSk7XG4gICAgb3V0WzE0XSA9IC0oYTAwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTIgLSBhMDIgKiBhMTEpKTtcbiAgICBvdXRbMTVdID0gIChhMDAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSkpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxuICovXG5tYXQ0LmRldGVybWluYW50ID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XSxcblxuICAgICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsXG4gICAgICAgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxuICAgICAgICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG4gICAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSxcbiAgICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsXG4gICAgICAgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxuICAgICAgICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG4gICAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSxcbiAgICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgIHJldHVybiBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDQnc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5tdWx0aXBseSA9IGZ1bmN0aW9uIChvdXQsIGEsIGIpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICAgIC8vIENhY2hlIG9ubHkgdGhlIGN1cnJlbnQgbGluZSBvZiB0aGUgc2Vjb25kIG1hdHJpeFxuICAgIHZhciBiMCAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdOyAgXG4gICAgb3V0WzBdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFsxXSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMl0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4gICAgb3V0WzNdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gICAgYjAgPSBiWzRdOyBiMSA9IGJbNV07IGIyID0gYls2XTsgYjMgPSBiWzddO1xuICAgIG91dFs0XSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcbiAgICBvdXRbNV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gICAgb3V0WzZdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFs3XSA9IGIwKmEwMyArIGIxKmExMyArIGIyKmEyMyArIGIzKmEzMztcblxuICAgIGIwID0gYls4XTsgYjEgPSBiWzldOyBiMiA9IGJbMTBdOyBiMyA9IGJbMTFdO1xuICAgIG91dFs4XSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcbiAgICBvdXRbOV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gICAgb3V0WzEwXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgICBvdXRbMTFdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gICAgYjAgPSBiWzEyXTsgYjEgPSBiWzEzXTsgYjIgPSBiWzE0XTsgYjMgPSBiWzE1XTtcbiAgICBvdXRbMTJdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFsxM10gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gICAgb3V0WzE0XSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgICBvdXRbMTVdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0NC5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5tYXQ0Lm11bCA9IG1hdDQubXVsdGlwbHk7XG5cbi8qKlxuICogVHJhbnNsYXRlIGEgbWF0NCBieSB0aGUgZ2l2ZW4gdmVjdG9yXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHt2ZWMzfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC50cmFuc2xhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCB2KSB7XG4gICAgdmFyIHggPSB2WzBdLCB5ID0gdlsxXSwgeiA9IHZbMl0sXG4gICAgICAgIGEwMCwgYTAxLCBhMDIsIGEwMyxcbiAgICAgICAgYTEwLCBhMTEsIGExMiwgYTEzLFxuICAgICAgICBhMjAsIGEyMSwgYTIyLCBhMjM7XG5cbiAgICBpZiAoYSA9PT0gb3V0KSB7XG4gICAgICAgIG91dFsxMl0gPSBhWzBdICogeCArIGFbNF0gKiB5ICsgYVs4XSAqIHogKyBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMV0gKiB4ICsgYVs1XSAqIHkgKyBhWzldICogeiArIGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsyXSAqIHggKyBhWzZdICogeSArIGFbMTBdICogeiArIGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVszXSAqIHggKyBhWzddICogeSArIGFbMTFdICogeiArIGFbMTVdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGEwMCA9IGFbMF07IGEwMSA9IGFbMV07IGEwMiA9IGFbMl07IGEwMyA9IGFbM107XG4gICAgICAgIGExMCA9IGFbNF07IGExMSA9IGFbNV07IGExMiA9IGFbNl07IGExMyA9IGFbN107XG4gICAgICAgIGEyMCA9IGFbOF07IGEyMSA9IGFbOV07IGEyMiA9IGFbMTBdOyBhMjMgPSBhWzExXTtcblxuICAgICAgICBvdXRbMF0gPSBhMDA7IG91dFsxXSA9IGEwMTsgb3V0WzJdID0gYTAyOyBvdXRbM10gPSBhMDM7XG4gICAgICAgIG91dFs0XSA9IGExMDsgb3V0WzVdID0gYTExOyBvdXRbNl0gPSBhMTI7IG91dFs3XSA9IGExMztcbiAgICAgICAgb3V0WzhdID0gYTIwOyBvdXRbOV0gPSBhMjE7IG91dFsxMF0gPSBhMjI7IG91dFsxMV0gPSBhMjM7XG5cbiAgICAgICAgb3V0WzEyXSA9IGEwMCAqIHggKyBhMTAgKiB5ICsgYTIwICogeiArIGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYTAxICogeCArIGExMSAqIHkgKyBhMjEgKiB6ICsgYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhMDIgKiB4ICsgYTEyICogeSArIGEyMiAqIHogKyBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGEwMyAqIHggKyBhMTMgKiB5ICsgYTIzICogeiArIGFbMTVdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0NCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjM1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxuICogQHBhcmFtIHt2ZWMzfSB2IHRoZSB2ZWMzIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqKi9cbm1hdDQuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXTtcblxuICAgIG91dFswXSA9IGFbMF0gKiB4O1xuICAgIG91dFsxXSA9IGFbMV0gKiB4O1xuICAgIG91dFsyXSA9IGFbMl0gKiB4O1xuICAgIG91dFszXSA9IGFbM10gKiB4O1xuICAgIG91dFs0XSA9IGFbNF0gKiB5O1xuICAgIG91dFs1XSA9IGFbNV0gKiB5O1xuICAgIG91dFs2XSA9IGFbNl0gKiB5O1xuICAgIG91dFs3XSA9IGFbN10gKiB5O1xuICAgIG91dFs4XSA9IGFbOF0gKiB6O1xuICAgIG91dFs5XSA9IGFbOV0gKiB6O1xuICAgIG91dFsxMF0gPSBhWzEwXSAqIHo7XG4gICAgb3V0WzExXSA9IGFbMTFdICogejtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDQgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQucm90YXRlID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkLCBheGlzKSB7XG4gICAgdmFyIHggPSBheGlzWzBdLCB5ID0gYXhpc1sxXSwgeiA9IGF4aXNbMl0sXG4gICAgICAgIGxlbiA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopLFxuICAgICAgICBzLCBjLCB0LFxuICAgICAgICBhMDAsIGEwMSwgYTAyLCBhMDMsXG4gICAgICAgIGExMCwgYTExLCBhMTIsIGExMyxcbiAgICAgICAgYTIwLCBhMjEsIGEyMiwgYTIzLFxuICAgICAgICBiMDAsIGIwMSwgYjAyLFxuICAgICAgICBiMTAsIGIxMSwgYjEyLFxuICAgICAgICBiMjAsIGIyMSwgYjIyO1xuXG4gICAgaWYgKE1hdGguYWJzKGxlbikgPCBHTE1BVF9FUFNJTE9OKSB7IHJldHVybiBudWxsOyB9XG4gICAgXG4gICAgbGVuID0gMSAvIGxlbjtcbiAgICB4ICo9IGxlbjtcbiAgICB5ICo9IGxlbjtcbiAgICB6ICo9IGxlbjtcblxuICAgIHMgPSBNYXRoLnNpbihyYWQpO1xuICAgIGMgPSBNYXRoLmNvcyhyYWQpO1xuICAgIHQgPSAxIC0gYztcblxuICAgIGEwMCA9IGFbMF07IGEwMSA9IGFbMV07IGEwMiA9IGFbMl07IGEwMyA9IGFbM107XG4gICAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcbiAgICBhMjAgPSBhWzhdOyBhMjEgPSBhWzldOyBhMjIgPSBhWzEwXTsgYTIzID0gYVsxMV07XG5cbiAgICAvLyBDb25zdHJ1Y3QgdGhlIGVsZW1lbnRzIG9mIHRoZSByb3RhdGlvbiBtYXRyaXhcbiAgICBiMDAgPSB4ICogeCAqIHQgKyBjOyBiMDEgPSB5ICogeCAqIHQgKyB6ICogczsgYjAyID0geiAqIHggKiB0IC0geSAqIHM7XG4gICAgYjEwID0geCAqIHkgKiB0IC0geiAqIHM7IGIxMSA9IHkgKiB5ICogdCArIGM7IGIxMiA9IHogKiB5ICogdCArIHggKiBzO1xuICAgIGIyMCA9IHggKiB6ICogdCArIHkgKiBzOyBiMjEgPSB5ICogeiAqIHQgLSB4ICogczsgYjIyID0geiAqIHogKiB0ICsgYztcblxuICAgIC8vIFBlcmZvcm0gcm90YXRpb24tc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyO1xuICAgIG91dFsxXSA9IGEwMSAqIGIwMCArIGExMSAqIGIwMSArIGEyMSAqIGIwMjtcbiAgICBvdXRbMl0gPSBhMDIgKiBiMDAgKyBhMTIgKiBiMDEgKyBhMjIgKiBiMDI7XG4gICAgb3V0WzNdID0gYTAzICogYjAwICsgYTEzICogYjAxICsgYTIzICogYjAyO1xuICAgIG91dFs0XSA9IGEwMCAqIGIxMCArIGExMCAqIGIxMSArIGEyMCAqIGIxMjtcbiAgICBvdXRbNV0gPSBhMDEgKiBiMTAgKyBhMTEgKiBiMTEgKyBhMjEgKiBiMTI7XG4gICAgb3V0WzZdID0gYTAyICogYjEwICsgYTEyICogYjExICsgYTIyICogYjEyO1xuICAgIG91dFs3XSA9IGEwMyAqIGIxMCArIGExMyAqIGIxMSArIGEyMyAqIGIxMjtcbiAgICBvdXRbOF0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjI7XG4gICAgb3V0WzldID0gYTAxICogYjIwICsgYTExICogYjIxICsgYTIxICogYjIyO1xuICAgIG91dFsxMF0gPSBhMDIgKiBiMjAgKyBhMTIgKiBiMjEgKyBhMjIgKiBiMjI7XG4gICAgb3V0WzExXSA9IGEwMyAqIGIyMCArIGExMyAqIGIyMSArIGEyMyAqIGIyMjtcblxuICAgIGlmIChhICE9PSBvdXQpIHsgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcbiAgICAgICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQucm90YXRlWCA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCksXG4gICAgICAgIGExMCA9IGFbNF0sXG4gICAgICAgIGExMSA9IGFbNV0sXG4gICAgICAgIGExMiA9IGFbNl0sXG4gICAgICAgIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sXG4gICAgICAgIGEyMSA9IGFbOV0sXG4gICAgICAgIGEyMiA9IGFbMTBdLFxuICAgICAgICBhMjMgPSBhWzExXTtcblxuICAgIGlmIChhICE9PSBvdXQpIHsgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgcm93c1xuICAgICAgICBvdXRbMF0gID0gYVswXTtcbiAgICAgICAgb3V0WzFdICA9IGFbMV07XG4gICAgICAgIG91dFsyXSAgPSBhWzJdO1xuICAgICAgICBvdXRbM10gID0gYVszXTtcbiAgICAgICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIH1cblxuICAgIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgICBvdXRbNF0gPSBhMTAgKiBjICsgYTIwICogcztcbiAgICBvdXRbNV0gPSBhMTEgKiBjICsgYTIxICogcztcbiAgICBvdXRbNl0gPSBhMTIgKiBjICsgYTIyICogcztcbiAgICBvdXRbN10gPSBhMTMgKiBjICsgYTIzICogcztcbiAgICBvdXRbOF0gPSBhMjAgKiBjIC0gYTEwICogcztcbiAgICBvdXRbOV0gPSBhMjEgKiBjIC0gYTExICogcztcbiAgICBvdXRbMTBdID0gYTIyICogYyAtIGExMiAqIHM7XG4gICAgb3V0WzExXSA9IGEyMyAqIGMgLSBhMTMgKiBzO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWSBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5yb3RhdGVZID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKSxcbiAgICAgICAgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXSxcbiAgICAgICAgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXG4gICAgICAgIG91dFs0XSAgPSBhWzRdO1xuICAgICAgICBvdXRbNV0gID0gYVs1XTtcbiAgICAgICAgb3V0WzZdICA9IGFbNl07XG4gICAgICAgIG91dFs3XSAgPSBhWzddO1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFswXSA9IGEwMCAqIGMgLSBhMjAgKiBzO1xuICAgIG91dFsxXSA9IGEwMSAqIGMgLSBhMjEgKiBzO1xuICAgIG91dFsyXSA9IGEwMiAqIGMgLSBhMjIgKiBzO1xuICAgIG91dFszXSA9IGEwMyAqIGMgLSBhMjMgKiBzO1xuICAgIG91dFs4XSA9IGEwMCAqIHMgKyBhMjAgKiBjO1xuICAgIG91dFs5XSA9IGEwMSAqIHMgKyBhMjEgKiBjO1xuICAgIG91dFsxMF0gPSBhMDIgKiBzICsgYTIyICogYztcbiAgICBvdXRbMTFdID0gYTAzICogcyArIGEyMyAqIGM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBaIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnJvdGF0ZVogPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpLFxuICAgICAgICBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLFxuICAgICAgICBhMTEgPSBhWzVdLFxuICAgICAgICBhMTIgPSBhWzZdLFxuICAgICAgICBhMTMgPSBhWzddO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xuICAgICAgICBvdXRbOF0gID0gYVs4XTtcbiAgICAgICAgb3V0WzldICA9IGFbOV07XG4gICAgICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICAgICAgb3V0WzExXSA9IGFbMTFdO1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFswXSA9IGEwMCAqIGMgKyBhMTAgKiBzO1xuICAgIG91dFsxXSA9IGEwMSAqIGMgKyBhMTEgKiBzO1xuICAgIG91dFsyXSA9IGEwMiAqIGMgKyBhMTIgKiBzO1xuICAgIG91dFszXSA9IGEwMyAqIGMgKyBhMTMgKiBzO1xuICAgIG91dFs0XSA9IGExMCAqIGMgLSBhMDAgKiBzO1xuICAgIG91dFs1XSA9IGExMSAqIGMgLSBhMDEgKiBzO1xuICAgIG91dFs2XSA9IGExMiAqIGMgLSBhMDIgKiBzO1xuICAgIG91dFs3XSA9IGExMyAqIGMgLSBhMDMgKiBzO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24gYW5kIHZlY3RvciB0cmFuc2xhdGlvblxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcbiAqICAgICB2YXIgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xuICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQuZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24gPSBmdW5jdGlvbiAob3V0LCBxLCB2KSB7XG4gICAgLy8gUXVhdGVybmlvbiBtYXRoXG4gICAgdmFyIHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdLFxuICAgICAgICB4MiA9IHggKyB4LFxuICAgICAgICB5MiA9IHkgKyB5LFxuICAgICAgICB6MiA9IHogKyB6LFxuXG4gICAgICAgIHh4ID0geCAqIHgyLFxuICAgICAgICB4eSA9IHggKiB5MixcbiAgICAgICAgeHogPSB4ICogejIsXG4gICAgICAgIHl5ID0geSAqIHkyLFxuICAgICAgICB5eiA9IHkgKiB6MixcbiAgICAgICAgenogPSB6ICogejIsXG4gICAgICAgIHd4ID0gdyAqIHgyLFxuICAgICAgICB3eSA9IHcgKiB5MixcbiAgICAgICAgd3ogPSB3ICogejI7XG5cbiAgICBvdXRbMF0gPSAxIC0gKHl5ICsgenopO1xuICAgIG91dFsxXSA9IHh5ICsgd3o7XG4gICAgb3V0WzJdID0geHogLSB3eTtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IHh5IC0gd3o7XG4gICAgb3V0WzVdID0gMSAtICh4eCArIHp6KTtcbiAgICBvdXRbNl0gPSB5eiArIHd4O1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0geHogKyB3eTtcbiAgICBvdXRbOV0gPSB5eiAtIHd4O1xuICAgIG91dFsxMF0gPSAxIC0gKHh4ICsgeXkpO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSB2WzBdO1xuICAgIG91dFsxM10gPSB2WzFdO1xuICAgIG91dFsxNF0gPSB2WzJdO1xuICAgIG91dFsxNV0gPSAxO1xuICAgIFxuICAgIHJldHVybiBvdXQ7XG59O1xuXG5tYXQ0LmZyb21RdWF0ID0gZnVuY3Rpb24gKG91dCwgcSkge1xuICAgIHZhciB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXSxcbiAgICAgICAgeDIgPSB4ICsgeCxcbiAgICAgICAgeTIgPSB5ICsgeSxcbiAgICAgICAgejIgPSB6ICsgeixcblxuICAgICAgICB4eCA9IHggKiB4MixcbiAgICAgICAgeXggPSB5ICogeDIsXG4gICAgICAgIHl5ID0geSAqIHkyLFxuICAgICAgICB6eCA9IHogKiB4MixcbiAgICAgICAgenkgPSB6ICogeTIsXG4gICAgICAgIHp6ID0geiAqIHoyLFxuICAgICAgICB3eCA9IHcgKiB4MixcbiAgICAgICAgd3kgPSB3ICogeTIsXG4gICAgICAgIHd6ID0gdyAqIHoyO1xuXG4gICAgb3V0WzBdID0gMSAtIHl5IC0geno7XG4gICAgb3V0WzFdID0geXggKyB3ejtcbiAgICBvdXRbMl0gPSB6eCAtIHd5O1xuICAgIG91dFszXSA9IDA7XG5cbiAgICBvdXRbNF0gPSB5eCAtIHd6O1xuICAgIG91dFs1XSA9IDEgLSB4eCAtIHp6O1xuICAgIG91dFs2XSA9IHp5ICsgd3g7XG4gICAgb3V0WzddID0gMDtcblxuICAgIG91dFs4XSA9IHp4ICsgd3k7XG4gICAgb3V0WzldID0genkgLSB3eDtcbiAgICBvdXRbMTBdID0gMSAtIHh4IC0geXk7XG4gICAgb3V0WzExXSA9IDA7XG5cbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGZydXN0dW0gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7TnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmZydXN0dW0gPSBmdW5jdGlvbiAob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICAgIHZhciBybCA9IDEgLyAocmlnaHQgLSBsZWZ0KSxcbiAgICAgICAgdGIgPSAxIC8gKHRvcCAtIGJvdHRvbSksXG4gICAgICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSAobmVhciAqIDIpICogcmw7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAobmVhciAqIDIpICogdGI7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IChyaWdodCArIGxlZnQpICogcmw7XG4gICAgb3V0WzldID0gKHRvcCArIGJvdHRvbSkgKiB0YjtcbiAgICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzExXSA9IC0xO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAoZmFyICogbmVhciAqIDIpICogbmY7XG4gICAgb3V0WzE1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGZvdnkgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IEFzcGVjdCByYXRpby4gdHlwaWNhbGx5IHZpZXdwb3J0IHdpZHRoL2hlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5wZXJzcGVjdGl2ZSA9IGZ1bmN0aW9uIChvdXQsIGZvdnksIGFzcGVjdCwgbmVhciwgZmFyKSB7XG4gICAgdmFyIGYgPSAxLjAgLyBNYXRoLnRhbihmb3Z5IC8gMiksXG4gICAgICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSBmIC8gYXNwZWN0O1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gZjtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTFdID0gLTE7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9ICgyICogZmFyICogbmVhcikgKiBuZjtcbiAgICBvdXRbMTVdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBvcnRob2dvbmFsIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0Lm9ydGhvID0gZnVuY3Rpb24gKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcbiAgICB2YXIgbHIgPSAxIC8gKGxlZnQgLSByaWdodCksXG4gICAgICAgIGJ0ID0gMSAvIChib3R0b20gLSB0b3ApLFxuICAgICAgICBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gLTIgKiBscjtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IC0yICogYnQ7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMiAqIG5mO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAobGVmdCArIHJpZ2h0KSAqIGxyO1xuICAgIG91dFsxM10gPSAodG9wICsgYm90dG9tKSAqIGJ0O1xuICAgIG91dFsxNF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBsb29rLWF0IG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBleWUgcG9zaXRpb24sIGZvY2FsIHBvaW50LCBhbmQgdXAgYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcbiAqIEBwYXJhbSB7dmVjM30gY2VudGVyIFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQubG9va0F0ID0gZnVuY3Rpb24gKG91dCwgZXllLCBjZW50ZXIsIHVwKSB7XG4gICAgdmFyIHgwLCB4MSwgeDIsIHkwLCB5MSwgeTIsIHowLCB6MSwgejIsIGxlbixcbiAgICAgICAgZXlleCA9IGV5ZVswXSxcbiAgICAgICAgZXlleSA9IGV5ZVsxXSxcbiAgICAgICAgZXlleiA9IGV5ZVsyXSxcbiAgICAgICAgdXB4ID0gdXBbMF0sXG4gICAgICAgIHVweSA9IHVwWzFdLFxuICAgICAgICB1cHogPSB1cFsyXSxcbiAgICAgICAgY2VudGVyeCA9IGNlbnRlclswXSxcbiAgICAgICAgY2VudGVyeSA9IGNlbnRlclsxXSxcbiAgICAgICAgY2VudGVyeiA9IGNlbnRlclsyXTtcblxuICAgIGlmIChNYXRoLmFicyhleWV4IC0gY2VudGVyeCkgPCBHTE1BVF9FUFNJTE9OICYmXG4gICAgICAgIE1hdGguYWJzKGV5ZXkgLSBjZW50ZXJ5KSA8IEdMTUFUX0VQU0lMT04gJiZcbiAgICAgICAgTWF0aC5hYnMoZXlleiAtIGNlbnRlcnopIDwgR0xNQVRfRVBTSUxPTikge1xuICAgICAgICByZXR1cm4gbWF0NC5pZGVudGl0eShvdXQpO1xuICAgIH1cblxuICAgIHowID0gZXlleCAtIGNlbnRlcng7XG4gICAgejEgPSBleWV5IC0gY2VudGVyeTtcbiAgICB6MiA9IGV5ZXogLSBjZW50ZXJ6O1xuXG4gICAgbGVuID0gMSAvIE1hdGguc3FydCh6MCAqIHowICsgejEgKiB6MSArIHoyICogejIpO1xuICAgIHowICo9IGxlbjtcbiAgICB6MSAqPSBsZW47XG4gICAgejIgKj0gbGVuO1xuXG4gICAgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxO1xuICAgIHgxID0gdXB6ICogejAgLSB1cHggKiB6MjtcbiAgICB4MiA9IHVweCAqIHoxIC0gdXB5ICogejA7XG4gICAgbGVuID0gTWF0aC5zcXJ0KHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4Mik7XG4gICAgaWYgKCFsZW4pIHtcbiAgICAgICAgeDAgPSAwO1xuICAgICAgICB4MSA9IDA7XG4gICAgICAgIHgyID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZW4gPSAxIC8gbGVuO1xuICAgICAgICB4MCAqPSBsZW47XG4gICAgICAgIHgxICo9IGxlbjtcbiAgICAgICAgeDIgKj0gbGVuO1xuICAgIH1cblxuICAgIHkwID0gejEgKiB4MiAtIHoyICogeDE7XG4gICAgeTEgPSB6MiAqIHgwIC0gejAgKiB4MjtcbiAgICB5MiA9IHowICogeDEgLSB6MSAqIHgwO1xuXG4gICAgbGVuID0gTWF0aC5zcXJ0KHkwICogeTAgKyB5MSAqIHkxICsgeTIgKiB5Mik7XG4gICAgaWYgKCFsZW4pIHtcbiAgICAgICAgeTAgPSAwO1xuICAgICAgICB5MSA9IDA7XG4gICAgICAgIHkyID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZW4gPSAxIC8gbGVuO1xuICAgICAgICB5MCAqPSBsZW47XG4gICAgICAgIHkxICo9IGxlbjtcbiAgICAgICAgeTIgKj0gbGVuO1xuICAgIH1cblxuICAgIG91dFswXSA9IHgwO1xuICAgIG91dFsxXSA9IHkwO1xuICAgIG91dFsyXSA9IHowO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0geDE7XG4gICAgb3V0WzVdID0geTE7XG4gICAgb3V0WzZdID0gejE7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSB4MjtcbiAgICBvdXRbOV0gPSB5MjtcbiAgICBvdXRbMTBdID0gejI7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IC0oeDAgKiBleWV4ICsgeDEgKiBleWV5ICsgeDIgKiBleWV6KTtcbiAgICBvdXRbMTNdID0gLSh5MCAqIGV5ZXggKyB5MSAqIGV5ZXkgKyB5MiAqIGV5ZXopO1xuICAgIG91dFsxNF0gPSAtKHowICogZXlleCArIHoxICogZXlleSArIHoyICogZXlleik7XG4gICAgb3V0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gbWF0IG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDQuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnLCAnICtcbiAgICAgICAgICAgICAgICAgICAgYVs0XSArICcsICcgKyBhWzVdICsgJywgJyArIGFbNl0gKyAnLCAnICsgYVs3XSArICcsICcgK1xuICAgICAgICAgICAgICAgICAgICBhWzhdICsgJywgJyArIGFbOV0gKyAnLCAnICsgYVsxMF0gKyAnLCAnICsgYVsxMV0gKyAnLCAnICsgXG4gICAgICAgICAgICAgICAgICAgIGFbMTJdICsgJywgJyArIGFbMTNdICsgJywgJyArIGFbMTRdICsgJywgJyArIGFbMTVdICsgJyknO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxuICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cbiAqL1xubWF0NC5mcm9iID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4oTWF0aC5zcXJ0KE1hdGgucG93KGFbMF0sIDIpICsgTWF0aC5wb3coYVsxXSwgMikgKyBNYXRoLnBvdyhhWzJdLCAyKSArIE1hdGgucG93KGFbM10sIDIpICsgTWF0aC5wb3coYVs0XSwgMikgKyBNYXRoLnBvdyhhWzVdLCAyKSArIE1hdGgucG93KGFbNl0sIDIpICsgTWF0aC5wb3coYVs2XSwgMikgKyBNYXRoLnBvdyhhWzddLCAyKSArIE1hdGgucG93KGFbOF0sIDIpICsgTWF0aC5wb3coYVs5XSwgMikgKyBNYXRoLnBvdyhhWzEwXSwgMikgKyBNYXRoLnBvdyhhWzExXSwgMikgKyBNYXRoLnBvdyhhWzEyXSwgMikgKyBNYXRoLnBvdyhhWzEzXSwgMikgKyBNYXRoLnBvdyhhWzE0XSwgMikgKyBNYXRoLnBvdyhhWzE1XSwgMikgKSlcbn07XG5cblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMubWF0NCA9IG1hdDQ7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyBRdWF0ZXJuaW9uXG4gKiBAbmFtZSBxdWF0XG4gKi9cblxudmFyIHF1YXQgPSB7fTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IHF1YXRcbiAqXG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxuICovXG5xdWF0LmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldHMgYSBxdWF0ZXJuaW9uIHRvIHJlcHJlc2VudCB0aGUgc2hvcnRlc3Qgcm90YXRpb24gZnJvbSBvbmVcbiAqIHZlY3RvciB0byBhbm90aGVyLlxuICpcbiAqIEJvdGggdmVjdG9ycyBhcmUgYXNzdW1lZCB0byBiZSB1bml0IGxlbmd0aC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb24uXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGluaXRpYWwgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIGRlc3RpbmF0aW9uIHZlY3RvclxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnJvdGF0aW9uVG8gPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRtcHZlYzMgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIHZhciB4VW5pdFZlYzMgPSB2ZWMzLmZyb21WYWx1ZXMoMSwwLDApO1xuICAgIHZhciB5VW5pdFZlYzMgPSB2ZWMzLmZyb21WYWx1ZXMoMCwxLDApO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgICAgICB2YXIgZG90ID0gdmVjMy5kb3QoYSwgYik7XG4gICAgICAgIGlmIChkb3QgPCAtMC45OTk5OTkpIHtcbiAgICAgICAgICAgIHZlYzMuY3Jvc3ModG1wdmVjMywgeFVuaXRWZWMzLCBhKTtcbiAgICAgICAgICAgIGlmICh2ZWMzLmxlbmd0aCh0bXB2ZWMzKSA8IDAuMDAwMDAxKVxuICAgICAgICAgICAgICAgIHZlYzMuY3Jvc3ModG1wdmVjMywgeVVuaXRWZWMzLCBhKTtcbiAgICAgICAgICAgIHZlYzMubm9ybWFsaXplKHRtcHZlYzMsIHRtcHZlYzMpO1xuICAgICAgICAgICAgcXVhdC5zZXRBeGlzQW5nbGUob3V0LCB0bXB2ZWMzLCBNYXRoLlBJKTtcbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH0gZWxzZSBpZiAoZG90ID4gMC45OTk5OTkpIHtcbiAgICAgICAgICAgIG91dFswXSA9IDA7XG4gICAgICAgICAgICBvdXRbMV0gPSAwO1xuICAgICAgICAgICAgb3V0WzJdID0gMDtcbiAgICAgICAgICAgIG91dFszXSA9IDE7XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmVjMy5jcm9zcyh0bXB2ZWMzLCBhLCBiKTtcbiAgICAgICAgICAgIG91dFswXSA9IHRtcHZlYzNbMF07XG4gICAgICAgICAgICBvdXRbMV0gPSB0bXB2ZWMzWzFdO1xuICAgICAgICAgICAgb3V0WzJdID0gdG1wdmVjM1syXTtcbiAgICAgICAgICAgIG91dFszXSA9IDEgKyBkb3Q7XG4gICAgICAgICAgICByZXR1cm4gcXVhdC5ub3JtYWxpemUob3V0LCBvdXQpO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbi8qKlxuICogU2V0cyB0aGUgc3BlY2lmaWVkIHF1YXRlcm5pb24gd2l0aCB2YWx1ZXMgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW5cbiAqIGF4ZXMuIEVhY2ggYXhpcyBpcyBhIHZlYzMgYW5kIGlzIGV4cGVjdGVkIHRvIGJlIHVuaXQgbGVuZ3RoIGFuZFxuICogcGVycGVuZGljdWxhciB0byBhbGwgb3RoZXIgc3BlY2lmaWVkIGF4ZXMuXG4gKlxuICogQHBhcmFtIHt2ZWMzfSB2aWV3ICB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgdmlld2luZyBkaXJlY3Rpb25cbiAqIEBwYXJhbSB7dmVjM30gcmlnaHQgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGxvY2FsIFwicmlnaHRcIiBkaXJlY3Rpb25cbiAqIEBwYXJhbSB7dmVjM30gdXAgICAgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGxvY2FsIFwidXBcIiBkaXJlY3Rpb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5zZXRBeGVzID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXRyID0gbWF0My5jcmVhdGUoKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihvdXQsIHZpZXcsIHJpZ2h0LCB1cCkge1xuICAgICAgICBtYXRyWzBdID0gcmlnaHRbMF07XG4gICAgICAgIG1hdHJbM10gPSByaWdodFsxXTtcbiAgICAgICAgbWF0cls2XSA9IHJpZ2h0WzJdO1xuXG4gICAgICAgIG1hdHJbMV0gPSB1cFswXTtcbiAgICAgICAgbWF0cls0XSA9IHVwWzFdO1xuICAgICAgICBtYXRyWzddID0gdXBbMl07XG5cbiAgICAgICAgbWF0clsyXSA9IC12aWV3WzBdO1xuICAgICAgICBtYXRyWzVdID0gLXZpZXdbMV07XG4gICAgICAgIG1hdHJbOF0gPSAtdmlld1syXTtcblxuICAgICAgICByZXR1cm4gcXVhdC5ub3JtYWxpemUob3V0LCBxdWF0LmZyb21NYXQzKG91dCwgbWF0cikpO1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBjbG9uZVxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmNsb25lID0gdmVjNC5jbG9uZTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5mcm9tVmFsdWVzID0gdmVjNC5mcm9tVmFsdWVzO1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBxdWF0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgc291cmNlIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmNvcHkgPSB2ZWM0LmNvcHk7XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgcXVhdCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc2V0ID0gdmVjNC5zZXQ7XG5cbi8qKlxuICogU2V0IGEgcXVhdCB0byB0aGUgaWRlbnRpdHkgcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXRzIGEgcXVhdCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhbmQgcm90YXRpb24gYXhpcyxcbiAqIHRoZW4gcmV0dXJucyBpdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyBhcm91bmQgd2hpY2ggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSBpbiByYWRpYW5zXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiovXG5xdWF0LnNldEF4aXNBbmdsZSA9IGZ1bmN0aW9uKG91dCwgYXhpcywgcmFkKSB7XG4gICAgcmFkID0gcmFkICogMC41O1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKTtcbiAgICBvdXRbMF0gPSBzICogYXhpc1swXTtcbiAgICBvdXRbMV0gPSBzICogYXhpc1sxXTtcbiAgICBvdXRbMl0gPSBzICogYXhpc1syXTtcbiAgICBvdXRbM10gPSBNYXRoLmNvcyhyYWQpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5hZGQgPSB2ZWM0LmFkZDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0Lm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXSxcbiAgICAgICAgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXSwgYncgPSBiWzNdO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieTtcbiAgICBvdXRbMV0gPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYng7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5tdWwgPSBxdWF0Lm11bHRpcGx5O1xuXG4vKipcbiAqIFNjYWxlcyBhIHF1YXQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc2NhbGUgPSB2ZWM0LnNjYWxlO1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWCBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5yb3RhdGVYID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgcmFkICo9IDAuNTsgXG5cbiAgICB2YXIgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdLFxuICAgICAgICBieCA9IE1hdGguc2luKHJhZCksIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4O1xuICAgIG91dFsxXSA9IGF5ICogYncgKyBheiAqIGJ4O1xuICAgIG91dFsyXSA9IGF6ICogYncgLSBheSAqIGJ4O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWSBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5yb3RhdGVZID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgcmFkICo9IDAuNTsgXG5cbiAgICB2YXIgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdLFxuICAgICAgICBieSA9IE1hdGguc2luKHJhZCksIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGF4ICogYncgLSBheiAqIGJ5O1xuICAgIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBheCAqIGJ5O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheSAqIGJ5O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWiBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5yb3RhdGVaID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgcmFkICo9IDAuNTsgXG5cbiAgICB2YXIgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdLFxuICAgICAgICBieiA9IE1hdGguc2luKHJhZCksIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGF4ICogYncgKyBheSAqIGJ6O1xuICAgIG91dFsxXSA9IGF5ICogYncgLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheiAqIGJ6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIFcgY29tcG9uZW50IG9mIGEgcXVhdCBmcm9tIHRoZSBYLCBZLCBhbmQgWiBjb21wb25lbnRzLlxuICogQXNzdW1lcyB0aGF0IHF1YXRlcm5pb24gaXMgMSB1bml0IGluIGxlbmd0aC5cbiAqIEFueSBleGlzdGluZyBXIGNvbXBvbmVudCB3aWxsIGJlIGlnbm9yZWQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgVyBjb21wb25lbnQgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5jYWxjdWxhdGVXID0gZnVuY3Rpb24gKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuXG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgb3V0WzNdID0gLU1hdGguc3FydChNYXRoLmFicygxLjAgLSB4ICogeCAtIHkgKiB5IC0geiAqIHopKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5kb3QgPSB2ZWM0LmRvdDtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5sZXJwID0gdmVjNC5sZXJwO1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnNsZXJwID0gZnVuY3Rpb24gKG91dCwgYSwgYiwgdCkge1xuICAgIC8vIGJlbmNobWFya3M6XG4gICAgLy8gICAgaHR0cDovL2pzcGVyZi5jb20vcXVhdGVybmlvbi1zbGVycC1pbXBsZW1lbnRhdGlvbnNcblxuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl0sIGJ3ID0gYlszXTtcblxuICAgIHZhciAgICAgICAgb21lZ2EsIGNvc29tLCBzaW5vbSwgc2NhbGUwLCBzY2FsZTE7XG5cbiAgICAvLyBjYWxjIGNvc2luZVxuICAgIGNvc29tID0gYXggKiBieCArIGF5ICogYnkgKyBheiAqIGJ6ICsgYXcgKiBidztcbiAgICAvLyBhZGp1c3Qgc2lnbnMgKGlmIG5lY2Vzc2FyeSlcbiAgICBpZiAoIGNvc29tIDwgMC4wICkge1xuICAgICAgICBjb3NvbSA9IC1jb3NvbTtcbiAgICAgICAgYnggPSAtIGJ4O1xuICAgICAgICBieSA9IC0gYnk7XG4gICAgICAgIGJ6ID0gLSBiejtcbiAgICAgICAgYncgPSAtIGJ3O1xuICAgIH1cbiAgICAvLyBjYWxjdWxhdGUgY29lZmZpY2llbnRzXG4gICAgaWYgKCAoMS4wIC0gY29zb20pID4gMC4wMDAwMDEgKSB7XG4gICAgICAgIC8vIHN0YW5kYXJkIGNhc2UgKHNsZXJwKVxuICAgICAgICBvbWVnYSAgPSBNYXRoLmFjb3MoY29zb20pO1xuICAgICAgICBzaW5vbSAgPSBNYXRoLnNpbihvbWVnYSk7XG4gICAgICAgIHNjYWxlMCA9IE1hdGguc2luKCgxLjAgLSB0KSAqIG9tZWdhKSAvIHNpbm9tO1xuICAgICAgICBzY2FsZTEgPSBNYXRoLnNpbih0ICogb21lZ2EpIC8gc2lub207XG4gICAgfSBlbHNlIHsgICAgICAgIFxuICAgICAgICAvLyBcImZyb21cIiBhbmQgXCJ0b1wiIHF1YXRlcm5pb25zIGFyZSB2ZXJ5IGNsb3NlIFxuICAgICAgICAvLyAgLi4uIHNvIHdlIGNhbiBkbyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uXG4gICAgICAgIHNjYWxlMCA9IDEuMCAtIHQ7XG4gICAgICAgIHNjYWxlMSA9IHQ7XG4gICAgfVxuICAgIC8vIGNhbGN1bGF0ZSBmaW5hbCB2YWx1ZXNcbiAgICBvdXRbMF0gPSBzY2FsZTAgKiBheCArIHNjYWxlMSAqIGJ4O1xuICAgIG91dFsxXSA9IHNjYWxlMCAqIGF5ICsgc2NhbGUxICogYnk7XG4gICAgb3V0WzJdID0gc2NhbGUwICogYXogKyBzY2FsZTEgKiBiejtcbiAgICBvdXRbM10gPSBzY2FsZTAgKiBhdyArIHNjYWxlMSAqIGJ3O1xuICAgIFxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGludmVyc2Ugb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgaW52ZXJzZSBvZlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LmludmVydCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sXG4gICAgICAgIGRvdCA9IGEwKmEwICsgYTEqYTEgKyBhMiphMiArIGEzKmEzLFxuICAgICAgICBpbnZEb3QgPSBkb3QgPyAxLjAvZG90IDogMDtcbiAgICBcbiAgICAvLyBUT0RPOiBXb3VsZCBiZSBmYXN0ZXIgdG8gcmV0dXJuIFswLDAsMCwwXSBpbW1lZGlhdGVseSBpZiBkb3QgPT0gMFxuXG4gICAgb3V0WzBdID0gLWEwKmludkRvdDtcbiAgICBvdXRbMV0gPSAtYTEqaW52RG90O1xuICAgIG91dFsyXSA9IC1hMippbnZEb3Q7XG4gICAgb3V0WzNdID0gYTMqaW52RG90O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGNvbmp1Z2F0ZSBvZiBhIHF1YXRcbiAqIElmIHRoZSBxdWF0ZXJuaW9uIGlzIG5vcm1hbGl6ZWQsIHRoaXMgZnVuY3Rpb24gaXMgZmFzdGVyIHRoYW4gcXVhdC5pbnZlcnNlIGFuZCBwcm9kdWNlcyB0aGUgc2FtZSByZXN1bHQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgY29uanVnYXRlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuY29uanVnYXRlID0gZnVuY3Rpb24gKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0Lmxlbmd0aCA9IHZlYzQubGVuZ3RoO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5sZW4gPSBxdWF0Lmxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc3F1YXJlZExlbmd0aCA9IHZlYzQuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LnNxckxlbiA9IHF1YXQuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBOb3JtYWxpemUgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0Lm5vcm1hbGl6ZSA9IHZlYzQubm9ybWFsaXplO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIDN4MyByb3RhdGlvbiBtYXRyaXguXG4gKlxuICogTk9URTogVGhlIHJlc3VsdGFudCBxdWF0ZXJuaW9uIGlzIG5vdCBub3JtYWxpemVkLCBzbyB5b3Ugc2hvdWxkIGJlIHN1cmVcbiAqIHRvIHJlbm9ybWFsaXplIHRoZSBxdWF0ZXJuaW9uIHlvdXJzZWxmIHdoZXJlIG5lY2Vzc2FyeS5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7bWF0M30gbSByb3RhdGlvbiBtYXRyaXhcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmZyb21NYXQzID0gZnVuY3Rpb24ob3V0LCBtKSB7XG4gICAgLy8gQWxnb3JpdGhtIGluIEtlbiBTaG9lbWFrZSdzIGFydGljbGUgaW4gMTk4NyBTSUdHUkFQSCBjb3Vyc2Ugbm90ZXNcbiAgICAvLyBhcnRpY2xlIFwiUXVhdGVybmlvbiBDYWxjdWx1cyBhbmQgRmFzdCBBbmltYXRpb25cIi5cbiAgICB2YXIgZlRyYWNlID0gbVswXSArIG1bNF0gKyBtWzhdO1xuICAgIHZhciBmUm9vdDtcblxuICAgIGlmICggZlRyYWNlID4gMC4wICkge1xuICAgICAgICAvLyB8d3wgPiAxLzIsIG1heSBhcyB3ZWxsIGNob29zZSB3ID4gMS8yXG4gICAgICAgIGZSb290ID0gTWF0aC5zcXJ0KGZUcmFjZSArIDEuMCk7ICAvLyAyd1xuICAgICAgICBvdXRbM10gPSAwLjUgKiBmUm9vdDtcbiAgICAgICAgZlJvb3QgPSAwLjUvZlJvb3Q7ICAvLyAxLyg0dylcbiAgICAgICAgb3V0WzBdID0gKG1bN10tbVs1XSkqZlJvb3Q7XG4gICAgICAgIG91dFsxXSA9IChtWzJdLW1bNl0pKmZSb290O1xuICAgICAgICBvdXRbMl0gPSAobVszXS1tWzFdKSpmUm9vdDtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyB8d3wgPD0gMS8yXG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgaWYgKCBtWzRdID4gbVswXSApXG4gICAgICAgICAgaSA9IDE7XG4gICAgICAgIGlmICggbVs4XSA+IG1baSozK2ldIClcbiAgICAgICAgICBpID0gMjtcbiAgICAgICAgdmFyIGogPSAoaSsxKSUzO1xuICAgICAgICB2YXIgayA9IChpKzIpJTM7XG4gICAgICAgIFxuICAgICAgICBmUm9vdCA9IE1hdGguc3FydChtW2kqMytpXS1tW2oqMytqXS1tW2sqMytrXSArIDEuMCk7XG4gICAgICAgIG91dFtpXSA9IDAuNSAqIGZSb290O1xuICAgICAgICBmUm9vdCA9IDAuNSAvIGZSb290O1xuICAgICAgICBvdXRbM10gPSAobVtrKjMral0gLSBtW2oqMytrXSkgKiBmUm9vdDtcbiAgICAgICAgb3V0W2pdID0gKG1baiozK2ldICsgbVtpKjMral0pICogZlJvb3Q7XG4gICAgICAgIG91dFtrXSA9IChtW2sqMytpXSArIG1baSozK2tdKSAqIGZSb290O1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgcXVhdGVuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSB2ZWMgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xucXVhdC5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAncXVhdCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnF1YXQgPSBxdWF0O1xufVxuO1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4gIH0pKHNoaW0uZXhwb3J0cyk7XG59KSh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIHNsaWNlID0gW10uc2xpY2U7XG5cbiAgZnVuY3Rpb24gcXVldWUocGFyYWxsZWxpc20pIHtcbiAgICB2YXIgcSxcbiAgICAgICAgdGFza3MgPSBbXSxcbiAgICAgICAgc3RhcnRlZCA9IDAsIC8vIG51bWJlciBvZiB0YXNrcyB0aGF0IGhhdmUgYmVlbiBzdGFydGVkIChhbmQgcGVyaGFwcyBmaW5pc2hlZClcbiAgICAgICAgYWN0aXZlID0gMCwgLy8gbnVtYmVyIG9mIHRhc2tzIGN1cnJlbnRseSBiZWluZyBleGVjdXRlZCAoc3RhcnRlZCBidXQgbm90IGZpbmlzaGVkKVxuICAgICAgICByZW1haW5pbmcgPSAwLCAvLyBudW1iZXIgb2YgdGFza3Mgbm90IHlldCBmaW5pc2hlZFxuICAgICAgICBwb3BwaW5nLCAvLyBpbnNpZGUgYSBzeW5jaHJvbm91cyB0YXNrIGNhbGxiYWNrP1xuICAgICAgICBlcnJvciA9IG51bGwsXG4gICAgICAgIGF3YWl0ID0gbm9vcCxcbiAgICAgICAgYWxsO1xuXG4gICAgaWYgKCFwYXJhbGxlbGlzbSkgcGFyYWxsZWxpc20gPSBJbmZpbml0eTtcblxuICAgIGZ1bmN0aW9uIHBvcCgpIHtcbiAgICAgIHdoaWxlIChwb3BwaW5nID0gc3RhcnRlZCA8IHRhc2tzLmxlbmd0aCAmJiBhY3RpdmUgPCBwYXJhbGxlbGlzbSkge1xuICAgICAgICB2YXIgaSA9IHN0YXJ0ZWQrKyxcbiAgICAgICAgICAgIHQgPSB0YXNrc1tpXSxcbiAgICAgICAgICAgIGEgPSBzbGljZS5jYWxsKHQsIDEpO1xuICAgICAgICBhLnB1c2goY2FsbGJhY2soaSkpO1xuICAgICAgICArK2FjdGl2ZTtcbiAgICAgICAgdFswXS5hcHBseShudWxsLCBhKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxsYmFjayhpKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSwgcikge1xuICAgICAgICAtLWFjdGl2ZTtcbiAgICAgICAgaWYgKGVycm9yICE9IG51bGwpIHJldHVybjtcbiAgICAgICAgaWYgKGUgIT0gbnVsbCkge1xuICAgICAgICAgIGVycm9yID0gZTsgLy8gaWdub3JlIG5ldyB0YXNrcyBhbmQgc3F1ZWxjaCBhY3RpdmUgY2FsbGJhY2tzXG4gICAgICAgICAgc3RhcnRlZCA9IHJlbWFpbmluZyA9IE5hTjsgLy8gc3RvcCBxdWV1ZWQgdGFza3MgZnJvbSBzdGFydGluZ1xuICAgICAgICAgIG5vdGlmeSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhc2tzW2ldID0gcjtcbiAgICAgICAgICBpZiAoLS1yZW1haW5pbmcpIHBvcHBpbmcgfHwgcG9wKCk7XG4gICAgICAgICAgZWxzZSBub3RpZnkoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3RpZnkoKSB7XG4gICAgICBpZiAoZXJyb3IgIT0gbnVsbCkgYXdhaXQoZXJyb3IpO1xuICAgICAgZWxzZSBpZiAoYWxsKSBhd2FpdChlcnJvciwgdGFza3MpO1xuICAgICAgZWxzZSBhd2FpdC5hcHBseShudWxsLCBbZXJyb3JdLmNvbmNhdCh0YXNrcykpO1xuICAgIH1cblxuICAgIHJldHVybiBxID0ge1xuICAgICAgZGVmZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIWVycm9yKSB7XG4gICAgICAgICAgdGFza3MucHVzaChhcmd1bWVudHMpO1xuICAgICAgICAgICsrcmVtYWluaW5nO1xuICAgICAgICAgIHBvcCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBxO1xuICAgICAgfSxcbiAgICAgIGF3YWl0OiBmdW5jdGlvbihmKSB7XG4gICAgICAgIGF3YWl0ID0gZjtcbiAgICAgICAgYWxsID0gZmFsc2U7XG4gICAgICAgIGlmICghcmVtYWluaW5nKSBub3RpZnkoKTtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgICB9LFxuICAgICAgYXdhaXRBbGw6IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgYXdhaXQgPSBmO1xuICAgICAgICBhbGwgPSB0cnVlO1xuICAgICAgICBpZiAoIXJlbWFpbmluZykgbm90aWZ5KCk7XG4gICAgICAgIHJldHVybiBxO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBub29wKCkge31cblxuICBxdWV1ZS52ZXJzaW9uID0gXCIxLjAuN1wiO1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIHF1ZXVlOyB9KTtcbiAgZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBxdWV1ZTtcbiAgZWxzZSB0aGlzLnF1ZXVlID0gcXVldWU7XG59KSgpO1xuIiwiLy8gTWlzY2VsbGFuZW91cyBnZW8gZnVuY3Rpb25zXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL3BvaW50LmpzJyk7XG5cbnZhciBHZW8gPSB7fTtcblxuLy8gUHJvamVjdGlvbiBjb25zdGFudHNcbkdlby50aWxlX3NpemUgPSAyNTY7XG5HZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyA9IDIwMDM3NTA4LjM0Mjc4OTI0NDtcbkdlby5tYXBfb3JpZ2luX21ldGVycyA9IFBvaW50KC1HZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycywgR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMpO1xuR2VvLm1pbl96b29tX21ldGVyc19wZXJfcGl4ZWwgPSBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAqIDIgLyBHZW8udGlsZV9zaXplOyAvLyBtaW4gem9vbSBkcmF3cyB3b3JsZCBhcyAyIHRpbGVzIHdpZGVcbkdlby5tZXRlcnNfcGVyX3BpeGVsID0gW107XG5HZW8ubWF4X3pvb20gPSAyMDtcbmZvciAodmFyIHo9MDsgeiA8PSBHZW8ubWF4X3pvb207IHorKykge1xuICAgIEdlby5tZXRlcnNfcGVyX3BpeGVsW3pdID0gR2VvLm1pbl96b29tX21ldGVyc19wZXJfcGl4ZWwgLyBNYXRoLnBvdygyLCB6KTtcbn1cblxuLy8gQ29udmVyc2lvbiBmdW5jdGlvbnMgYmFzZWQgb24gYW4gZGVmaW5lZCB0aWxlIHNjYWxlXG5HZW8udW5pdHNfcGVyX21ldGVyID0gW107XG5HZW8uc2V0VGlsZVNjYWxlID0gZnVuY3Rpb24oc2NhbGUpXG57XG4gICAgR2VvLnRpbGVfc2NhbGUgPSBzY2FsZTtcbiAgICBHZW8udW5pdHNfcGVyX3BpeGVsID0gR2VvLnRpbGVfc2NhbGUgLyBHZW8udGlsZV9zaXplO1xuXG4gICAgZm9yICh2YXIgej0wOyB6IDw9IEdlby5tYXhfem9vbTsgeisrKSB7XG4gICAgICAgIEdlby51bml0c19wZXJfbWV0ZXJbel0gPSBHZW8udGlsZV9zY2FsZSAvIChHZW8udGlsZV9zaXplICogR2VvLm1ldGVyc19wZXJfcGl4ZWxbel0pO1xuICAgIH1cbn07XG5cbi8vIENvbnZlcnQgdGlsZSBsb2NhdGlvbiB0byBtZXJjYXRvciBtZXRlcnMgLSBtdWx0aXBseSBieSBwaXhlbHMgcGVyIHRpbGUsIHRoZW4gYnkgbWV0ZXJzIHBlciBwaXhlbCwgYWRqdXN0IGZvciBtYXAgb3JpZ2luXG5HZW8ubWV0ZXJzRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIHJldHVybiBQb2ludChcbiAgICAgICAgKHRpbGUueCAqIEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt0aWxlLnpdKSArIEdlby5tYXBfb3JpZ2luX21ldGVycy54LFxuICAgICAgICAoKHRpbGUueSAqIEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt0aWxlLnpdKSAqIC0xKSArIEdlby5tYXBfb3JpZ2luX21ldGVycy55XG4gICAgKTtcbn07XG5cbi8vIENvbnZlcnQgbWVyY2F0b3IgbWV0ZXJzIHRvIGxhdC1sbmdcbkdlby5tZXRlcnNUb0xhdExuZyA9IGZ1bmN0aW9uIChtZXRlcnMpXG57XG4gICAgdmFyIGMgPSBQb2ludC5jb3B5KG1ldGVycyk7XG5cbiAgICBjLnggLz0gR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnM7XG4gICAgYy55IC89IEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzO1xuXG4gICAgYy55ID0gKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoYy55ICogTWF0aC5QSSkpIC0gKE1hdGguUEkgLyAyKSkgLyBNYXRoLlBJO1xuXG4gICAgYy54ICo9IDE4MDtcbiAgICBjLnkgKj0gMTgwO1xuXG4gICAgcmV0dXJuIGM7XG59O1xuXG4vLyBDb252ZXJ0IGxhdC1sbmcgdG8gbWVyY2F0b3IgbWV0ZXJzXG5HZW8ubGF0TG5nVG9NZXRlcnMgPSBmdW5jdGlvbihsYXRsbmcpXG57XG4gICAgdmFyIGMgPSBQb2ludC5jb3B5KGxhdGxuZyk7XG5cbiAgICAvLyBMYXRpdHVkZVxuICAgIGMueSA9IE1hdGgubG9nKE1hdGgudGFuKChjLnkgKyA5MCkgKiBNYXRoLlBJIC8gMzYwKSkgLyAoTWF0aC5QSSAvIDE4MCk7XG4gICAgYy55ID0gYy55ICogR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMgLyAxODA7XG5cbiAgICAvLyBMb25naXR1ZGVcbiAgICBjLnggPSBjLnggKiBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAvIDE4MDtcblxuICAgIHJldHVybiBjO1xufTtcblxuLy8gUnVuIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIG9uIGVhY2ggY29vb3JkaW5hdGUgaW4gYSBHZW9KU09OIGdlb21ldHJ5XG5HZW8udHJhbnNmb3JtR2VvbWV0cnkgPSBmdW5jdGlvbiAoZ2VvbWV0cnksIHRyYW5zZm9ybSlcbntcbiAgICBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm0oZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xuICAgIH1cbiAgICBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyB8fCBnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvaW50Jykge1xuICAgICAgICByZXR1cm4gZ2VvbWV0cnkuY29vcmRpbmF0ZXMubWFwKHRyYW5zZm9ybSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nIHx8IGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpTGluZVN0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicpIHtcbiAgICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbiAocG9seWdvbikge1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlnb24ubWFwKGZ1bmN0aW9uIChjb29yZGluYXRlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gVE9ETzogc3VwcG9ydCBHZW9tZXRyeUNvbGxlY3Rpb25cbiAgICByZXR1cm4ge307XG59O1xuXG5HZW8uYm94SW50ZXJzZWN0ID0gZnVuY3Rpb24gKGIxLCBiMilcbntcbiAgICByZXR1cm4gIShcbiAgICAgICAgYjIuc3cueCA+IGIxLm5lLnggfHxcbiAgICAgICAgYjIubmUueCA8IGIxLnN3LnggfHxcbiAgICAgICAgYjIuc3cueSA+IGIxLm5lLnkgfHxcbiAgICAgICAgYjIubmUueSA8IGIxLnN3LnlcbiAgICApO1xufTtcblxuLy8gU3BsaXQgdGhlIGxpbmVzIG9mIGEgZmVhdHVyZSB3aGVyZXZlciB0d28gcG9pbnRzIGFyZSBmYXJ0aGVyIGFwYXJ0IHRoYW4gYSBnaXZlbiB0b2xlcmFuY2Vcbkdlby5zcGxpdEZlYXR1cmVMaW5lcyAgPSBmdW5jdGlvbiAoZmVhdHVyZSwgdG9sZXJhbmNlKSB7XG4gICAgdmFyIHRvbGVyYW5jZSA9IHRvbGVyYW5jZSB8fCAwLjAwMTtcbiAgICB2YXIgdG9sZXJhbmNlX3NxID0gdG9sZXJhbmNlICogdG9sZXJhbmNlO1xuICAgIHZhciBnZW9tID0gZmVhdHVyZS5nZW9tZXRyeTtcbiAgICB2YXIgbGluZXM7XG5cbiAgICBpZiAoZ2VvbS50eXBlID09ICdNdWx0aUxpbmVTdHJpbmcnKSB7XG4gICAgICAgIGxpbmVzID0gZ2VvbS5jb29yZGluYXRlcztcbiAgICB9XG4gICAgZWxzZSBpZiAoZ2VvbS50eXBlID09J0xpbmVTdHJpbmcnKSB7XG4gICAgICAgIGxpbmVzID0gW2dlb20uY29vcmRpbmF0ZXNdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZlYXR1cmU7XG4gICAgfVxuXG4gICAgdmFyIHNwbGl0X2xpbmVzID0gW107XG5cbiAgICBmb3IgKHZhciBzPTA7IHMgPCBsaW5lcy5sZW5ndGg7IHMrKykge1xuICAgICAgICB2YXIgc2VnID0gbGluZXNbc107XG4gICAgICAgIHZhciBzcGxpdF9zZWcgPSBbXTtcbiAgICAgICAgdmFyIGxhc3RfY29vcmQgPSBudWxsO1xuICAgICAgICB2YXIga2VlcDtcblxuICAgICAgICBmb3IgKHZhciBjPTA7IGMgPCBzZWcubGVuZ3RoOyBjKyspIHtcbiAgICAgICAgICAgIHZhciBjb29yZCA9IHNlZ1tjXTtcbiAgICAgICAgICAgIGtlZXAgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAobGFzdF9jb29yZCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpc3QgPSAoY29vcmRbMF0gLSBsYXN0X2Nvb3JkWzBdKSAqIChjb29yZFswXSAtIGxhc3RfY29vcmRbMF0pICsgKGNvb3JkWzFdIC0gbGFzdF9jb29yZFsxXSkgKiAoY29vcmRbMV0gLSBsYXN0X2Nvb3JkWzFdKTtcbiAgICAgICAgICAgICAgICBpZiAoZGlzdCA+IHRvbGVyYW5jZV9zcSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInNwbGl0IGxpbmVzIGF0IChcIiArIGNvb3JkWzBdICsgXCIsIFwiICsgY29vcmRbMV0gKyBcIiksIFwiICsgTWF0aC5zcXJ0KGRpc3QpICsgXCIgYXBhcnRcIik7XG4gICAgICAgICAgICAgICAgICAgIGtlZXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZWVwID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgc3BsaXRfbGluZXMucHVzaChzcGxpdF9zZWcpO1xuICAgICAgICAgICAgICAgIHNwbGl0X3NlZyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3BsaXRfc2VnLnB1c2goY29vcmQpO1xuXG4gICAgICAgICAgICBsYXN0X2Nvb3JkID0gY29vcmQ7XG4gICAgICAgIH1cblxuICAgICAgICBzcGxpdF9saW5lcy5wdXNoKHNwbGl0X3NlZyk7XG4gICAgICAgIHNwbGl0X3NlZyA9IFtdO1xuICAgIH1cblxuICAgIGlmIChzcGxpdF9saW5lcy5sZW5ndGggPT0gMSkge1xuICAgICAgICBnZW9tLnR5cGUgPSAnTGluZVN0cmluZyc7XG4gICAgICAgIGdlb20uY29vcmRpbmF0ZXMgPSBzcGxpdF9saW5lc1swXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGdlb20udHlwZSA9ICdNdWx0aUxpbmVTdHJpbmcnO1xuICAgICAgICBnZW9tLmNvb3JkaW5hdGVzID0gc3BsaXRfbGluZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdlbztcbn1cbiIsIi8vIFdlYkdMIG1hbmFnZW1lbnQgYW5kIHJlbmRlcmluZyBmdW5jdGlvbnNcblxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcbi8vIHZhciBHTFZlcnRleEFycmF5T2JqZWN0ID0gcmVxdWlyZSgnLi9nbF92YW8uanMnKTtcblxudmFyIEdMID0ge307XG5cbi8vIFNldHVwIGEgV2ViR0wgY29udGV4dFxuLy8gSWYgbm8gY2FudmFzIGVsZW1lbnQgaXMgcHJvdmlkZWQsIG9uZSBpcyBjcmVhdGVkIGFuZCBhZGRlZCB0byB0aGUgZG9jdW1lbnQgYm9keVxuR0wuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uIGdldENvbnRleHQgKGNhbnZhcylcbntcbiAgICB2YXIgY2FudmFzID0gY2FudmFzO1xuICAgIHZhciBmdWxsc2NyZWVuID0gZmFsc2U7XG4gICAgaWYgKGNhbnZhcyA9PSBudWxsKSB7XG4gICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBjYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBjYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICAgICAgY2FudmFzLnN0eWxlLmxlZnQgPSAwO1xuICAgICAgICBjYW52YXMuc3R5bGUuekluZGV4ID0gLTE7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICAgICAgZnVsbHNjcmVlbiA9IHRydWU7XG4gICAgfVxuXG4gICAgdmFyIGdsID0gY2FudmFzLmdldENvbnRleHQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcpO1xuICAgIGlmICghZ2wpIHtcbiAgICAgICAgYWxlcnQoXCJDb3VsZG4ndCBjcmVhdGUgV2ViR0wgY29udGV4dC4gWW91ciBicm93c2VyIHByb2JhYmx5IGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTCBvciBpdCdzIHR1cm5lZCBvZmY/XCIpO1xuICAgICAgICB0aHJvdyBcIkNvdWxkbid0IGNyZWF0ZSBXZWJHTCBjb250ZXh0XCI7XG4gICAgfVxuXG4gICAgR0wucmVzaXplQ2FudmFzKGdsLCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICBpZiAoZnVsbHNjcmVlbiA9PSB0cnVlKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBHTC5yZXNpemVDYW52YXMoZ2wsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBHTFZlcnRleEFycmF5T2JqZWN0LmluaXQoZ2wpOyAvLyBUT0RPOiB0aGlzIHBhdHRlcm4gZG9lc24ndCBzdXBwb3J0IG11bHRpcGxlIGFjdGl2ZSBHTCBjb250ZXh0cywgc2hvdWxkIHRoYXQgZXZlbiBiZSBzdXBwb3J0ZWQ/XG5cbiAgICByZXR1cm4gZ2w7XG59O1xuXG5HTC5yZXNpemVDYW52YXMgPSBmdW5jdGlvbiAoZ2wsIHdpZHRoLCBoZWlnaHQpXG57XG4gICAgdmFyIGRldmljZV9waXhlbF9yYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgZ2wuY2FudmFzLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuICAgIGdsLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgIGdsLmNhbnZhcy53aWR0aCA9IE1hdGgucm91bmQoZ2wuY2FudmFzLnN0eWxlLndpZHRoICogZGV2aWNlX3BpeGVsX3JhdGlvKTtcbiAgICBnbC5jYW52YXMuaGVpZ2h0ID0gTWF0aC5yb3VuZChnbC5jYW52YXMuc3R5bGUud2lkdGggKiBkZXZpY2VfcGl4ZWxfcmF0aW8pO1xuICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdsLmNhbnZhcy53aWR0aCwgZ2wuY2FudmFzLmhlaWdodCk7XG59O1xuXG4vLyBDb21waWxlICYgbGluayBhIFdlYkdMIHByb2dyYW0gZnJvbSBwcm92aWRlZCB2ZXJ0ZXggYW5kIGZyYWdtZW50IHNoYWRlciBzb3VyY2VzXG4vLyB1cGRhdGUgYSBwcm9ncmFtIGlmIG9uZSBpcyBwYXNzZWQgaW4uIENyZWF0ZSBvbmUgaWYgbm90LiBBbGVydCBhbmQgZG9uJ3QgdXBkYXRlIGFueXRoaW5nIGlmIHRoZSBzaGFkZXJzIGRvbid0IGNvbXBpbGUuXG5HTC51cGRhdGVQcm9ncmFtID0gZnVuY3Rpb24gR0x1cGRhdGVQcm9ncmFtIChnbCwgcHJvZ3JhbSwgdmVydGV4X3NoYWRlcl9zb3VyY2UsIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UpXG57XG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIHZlcnRleF9zaGFkZXIgPSBHTC5jcmVhdGVTaGFkZXIoZ2wsIHZlcnRleF9zaGFkZXJfc291cmNlLCBnbC5WRVJURVhfU0hBREVSKTtcbiAgICAgICAgdmFyIGZyYWdtZW50X3NoYWRlciA9IEdMLmNyZWF0ZVNoYWRlcihnbCwgJyNpZmRlZiBHTF9FU1xcbnByZWNpc2lvbiBoaWdocCBmbG9hdDtcXG4jZW5kaWZcXG5cXG4nICsgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSwgZ2wuRlJBR01FTlRfU0hBREVSKTtcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIC8vIGFsZXJ0KGVycik7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cblxuICAgIGdsLnVzZVByb2dyYW0obnVsbCk7XG4gICAgaWYgKHByb2dyYW0gIT0gbnVsbCkge1xuICAgICAgICB2YXIgb2xkX3NoYWRlcnMgPSBnbC5nZXRBdHRhY2hlZFNoYWRlcnMocHJvZ3JhbSk7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBvbGRfc2hhZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZ2wuZGV0YWNoU2hhZGVyKHByb2dyYW0sIG9sZF9zaGFkZXJzW2ldKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG4gICAgfVxuXG4gICAgaWYgKHZlcnRleF9zaGFkZXIgPT0gbnVsbCB8fCBmcmFnbWVudF9zaGFkZXIgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG5cbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydGV4X3NoYWRlcik7XG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50X3NoYWRlcik7XG5cbiAgICBnbC5kZWxldGVTaGFkZXIodmVydGV4X3NoYWRlcik7XG4gICAgZ2wuZGVsZXRlU2hhZGVyKGZyYWdtZW50X3NoYWRlcik7XG5cbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcbiAgICAgICAgdmFyIHByb2dyYW1fZXJyb3IgPVxuICAgICAgICAgICAgXCJXZWJHTCBwcm9ncmFtIGVycm9yOlxcblwiICtcbiAgICAgICAgICAgIFwiVkFMSURBVEVfU1RBVFVTOiBcIiArIGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuVkFMSURBVEVfU1RBVFVTKSArIFwiXFxuXCIgK1xuICAgICAgICAgICAgXCJFUlJPUjogXCIgKyBnbC5nZXRFcnJvcigpICsgXCJcXG5cXG5cIiArXG4gICAgICAgICAgICBcIi0tLSBWZXJ0ZXggU2hhZGVyIC0tLVxcblwiICsgdmVydGV4X3NoYWRlcl9zb3VyY2UgKyBcIlxcblxcblwiICtcbiAgICAgICAgICAgIFwiLS0tIEZyYWdtZW50IFNoYWRlciAtLS1cXG5cIiArIGZyYWdtZW50X3NoYWRlcl9zb3VyY2U7XG4gICAgICAgIGNvbnNvbGUubG9nKHByb2dyYW1fZXJyb3IpO1xuICAgICAgICB0aHJvdyBwcm9ncmFtX2Vycm9yO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9ncmFtO1xufTtcblxuLy8gQ29tcGlsZSBhIHZlcnRleCBvciBmcmFnbWVudCBzaGFkZXIgZnJvbSBwcm92aWRlZCBzb3VyY2VcbkdMLmNyZWF0ZVNoYWRlciA9IGZ1bmN0aW9uIEdMY3JlYXRlU2hhZGVyIChnbCwgc291cmNlLCB0eXBlKVxue1xuICAgIHZhciBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIodHlwZSk7XG5cbiAgICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzb3VyY2UpO1xuICAgIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcblxuICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XG4gICAgICAgIHZhciBzaGFkZXJfZXJyb3IgPVxuICAgICAgICAgICAgXCJXZWJHTCBzaGFkZXIgZXJyb3I6XFxuXCIgK1xuICAgICAgICAgICAgKHR5cGUgPT0gZ2wuVkVSVEVYX1NIQURFUiA/IFwiVkVSVEVYXCIgOiBcIkZSQUdNRU5UXCIpICsgXCIgU0hBREVSOlxcblwiICtcbiAgICAgICAgICAgIGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKTtcbiAgICAgICAgdGhyb3cgc2hhZGVyX2Vycm9yO1xuICAgIH1cblxuICAgIHJldHVybiBzaGFkZXI7XG59O1xuXG4vLyBUcmlhbmd1bGF0aW9uIHVzaW5nIGxpYnRlc3MuanMgcG9ydCBvZiBnbHVUZXNzZWxhdG9yXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYnJlbmRhbmtlbm55L2xpYnRlc3MuanNcbnRyeSB7XG4gICAgR0wudGVzc2VsYXRvciA9IChmdW5jdGlvbiBpbml0VGVzc2VsYXRvcigpIHtcbiAgICAgICAgdmFyIHRlc3NlbGF0b3IgPSBuZXcgbGlidGVzcy5HbHVUZXNzZWxhdG9yKCk7XG5cbiAgICAgICAgLy8gQ2FsbGVkIGZvciBlYWNoIHZlcnRleCBvZiB0ZXNzZWxhdG9yIG91dHB1dFxuICAgICAgICBmdW5jdGlvbiB2ZXJ0ZXhDYWxsYmFjayhkYXRhLCBwb2x5VmVydEFycmF5KSB7XG4gICAgICAgICAgICBpZiAodGVzc2VsYXRvci56ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBwb2x5VmVydEFycmF5LnB1c2goW2RhdGFbMF0sIGRhdGFbMV0sIHRlc3NlbGF0b3Iuel0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcG9seVZlcnRBcnJheS5wdXNoKFtkYXRhWzBdLCBkYXRhWzFdXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxsZWQgd2hlbiBzZWdtZW50cyBpbnRlcnNlY3QgYW5kIG11c3QgYmUgc3BsaXRcbiAgICAgICAgZnVuY3Rpb24gY29tYmluZUNhbGxiYWNrKGNvb3JkcywgZGF0YSwgd2VpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm4gY29vcmRzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsbGVkIHdoZW4gYSB2ZXJ0ZXggc3RhcnRzIG9yIHN0b3BzIGEgYm91bmRhcnkgZWRnZSBvZiBhIHBvbHlnb25cbiAgICAgICAgZnVuY3Rpb24gZWRnZUNhbGxiYWNrKGZsYWcpIHtcbiAgICAgICAgICAgIC8vIE5vLW9wIGNhbGxiYWNrIHRvIGZvcmNlIHNpbXBsZSB0cmlhbmdsZSBwcmltaXRpdmVzIChubyB0cmlhbmdsZSBzdHJpcHMgb3IgZmFucykuXG4gICAgICAgICAgICAvLyBTZWU6IGh0dHA6Ly93d3cuZ2xwcm9ncmFtbWluZy5jb20vcmVkL2NoYXB0ZXIxMS5odG1sXG4gICAgICAgICAgICAvLyBcIlNpbmNlIGVkZ2UgZmxhZ3MgbWFrZSBubyBzZW5zZSBpbiBhIHRyaWFuZ2xlIGZhbiBvciB0cmlhbmdsZSBzdHJpcCwgaWYgdGhlcmUgaXMgYSBjYWxsYmFja1xuICAgICAgICAgICAgLy8gYXNzb2NpYXRlZCB3aXRoIEdMVV9URVNTX0VER0VfRkxBRyB0aGF0IGVuYWJsZXMgZWRnZSBmbGFncywgdGhlIEdMVV9URVNTX0JFR0lOIGNhbGxiYWNrIGlzXG4gICAgICAgICAgICAvLyBjYWxsZWQgb25seSB3aXRoIEdMX1RSSUFOR0xFUy5cIlxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0dMLnRlc3NlbGF0b3I6IGVkZ2UgZmxhZzogJyArIGZsYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGVzc2VsYXRvci5nbHVUZXNzQ2FsbGJhY2sobGlidGVzcy5nbHVFbnVtLkdMVV9URVNTX1ZFUlRFWF9EQVRBLCB2ZXJ0ZXhDYWxsYmFjayk7XG4gICAgICAgIHRlc3NlbGF0b3IuZ2x1VGVzc0NhbGxiYWNrKGxpYnRlc3MuZ2x1RW51bS5HTFVfVEVTU19DT01CSU5FLCBjb21iaW5lQ2FsbGJhY2spO1xuICAgICAgICB0ZXNzZWxhdG9yLmdsdVRlc3NDYWxsYmFjayhsaWJ0ZXNzLmdsdUVudW0uR0xVX1RFU1NfRURHRV9GTEFHLCBlZGdlQ2FsbGJhY2spO1xuXG4gICAgICAgIC8vIEJyZW5kYW4gS2Vubnk6XG4gICAgICAgIC8vIGxpYnRlc3Mgd2lsbCB0YWtlIDNkIHZlcnRzIGFuZCBmbGF0dGVuIHRvIGEgcGxhbmUgZm9yIHRlc3NlbGF0aW9uXG4gICAgICAgIC8vIHNpbmNlIG9ubHkgZG9pbmcgMmQgdGVzc2VsYXRpb24gaGVyZSwgcHJvdmlkZSB6PTEgbm9ybWFsIHRvIHNraXBcbiAgICAgICAgLy8gaXRlcmF0aW5nIG92ZXIgdmVydHMgb25seSB0byBnZXQgdGhlIHNhbWUgYW5zd2VyLlxuICAgICAgICAvLyBjb21tZW50IG91dCB0byB0ZXN0IG5vcm1hbC1nZW5lcmF0aW9uIGNvZGVcbiAgICAgICAgdGVzc2VsYXRvci5nbHVUZXNzTm9ybWFsKDAsIDAsIDEpO1xuXG4gICAgICAgIHJldHVybiB0ZXNzZWxhdG9yO1xuICAgIH0pKCk7XG5cbiAgICBHTC50cmlhbmd1bGF0ZVBvbHlnb24gPSBmdW5jdGlvbiBHTFRyaWFuZ3VsYXRlIChjb250b3VycywgeilcbiAgICB7XG4gICAgICAgIHZhciB0cmlhbmdsZVZlcnRzID0gW107XG4gICAgICAgIEdMLnRlc3NlbGF0b3IueiA9IHo7XG4gICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc0JlZ2luUG9seWdvbih0cmlhbmdsZVZlcnRzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnRvdXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NCZWdpbkNvbnRvdXIoKTtcbiAgICAgICAgICAgIHZhciBjb250b3VyID0gY29udG91cnNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvbnRvdXIubGVuZ3RoOyBqICsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvb3JkcyA9IFtjb250b3VyW2pdWzBdLCBjb250b3VyW2pdWzFdLCAwXTtcbiAgICAgICAgICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NWZXJ0ZXgoY29vcmRzLCBjb29yZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzRW5kQ29udG91cigpO1xuICAgICAgICB9XG5cbiAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzRW5kUG9seWdvbigpO1xuICAgICAgICByZXR1cm4gdHJpYW5nbGVWZXJ0cztcbiAgICB9O1xufVxuY2F0Y2ggKGUpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcImxpYnRlc3Mgbm90IGRlZmluZWQhXCIpO1xuICAgIC8vIHNraXAgaWYgbGlidGVzcyBub3QgZGVmaW5lZFxufVxuXG4vLyBBZGQgdmVydGljZXMgdG8gYW4gYXJyYXkgKGRlc3RpbmVkIHRvIGJlIHVzZWQgYXMgYSBHTCBidWZmZXIpLCAnc3RyaXBpbmcnIGVhY2ggdmVydGV4IHdpdGggY29uc3RhbnQgZGF0YVxuLy8gUGVyLXZlcnRleCBhdHRyaWJ1dGVzIG11c3QgYmUgcHJlLXBhY2tlZCBpbnRvIHRoZSB2ZXJ0aWNlcyBhcnJheVxuLy8gVXNlZCBmb3IgYWRkaW5nIHZhbHVlcyB0aGF0IGFyZSBvZnRlbiBjb25zdGFudCBwZXIgZ2VvbWV0cnkgb3IgcG9seWdvbiwgbGlrZSBjb2xvcnMsIG5vcm1hbHMgKGZvciBwb2x5cyBzaXR0aW5nIGZsYXQgb24gbWFwKSwgbGF5ZXIgYW5kIG1hdGVyaWFsIGluZm8sIGV0Yy5cbkdMLmFkZFZlcnRpY2VzID0gZnVuY3Rpb24gKHZlcnRpY2VzLCB2ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSlcbntcbiAgICBpZiAodmVydGljZXMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdmVydGV4X2RhdGE7XG4gICAgfVxuICAgIHZlcnRleF9jb25zdGFudHMgPSB2ZXJ0ZXhfY29uc3RhbnRzIHx8IFtdO1xuXG4gICAgZm9yICh2YXIgdj0wLCB2bGVuID0gdmVydGljZXMubGVuZ3RoOyB2IDwgdmxlbjsgdisrKSB7XG4gICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIHZlcnRpY2VzW3ZdKTtcbiAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgdmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQWRkIHZlcnRpY2VzIHRvIGFuIGFycmF5LCAnc3RyaXBpbmcnIGVhY2ggdmVydGV4IHdpdGggY29uc3RhbnQgZGF0YVxuLy8gTXVsdGlwbGUsIHVuLXBhY2tlZCBhdHRyaWJ1dGUgYXJyYXlzIGNhbiBiZSBwcm92aWRlZFxuR0wuYWRkVmVydGljZXNNdWx0aXBsZUF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoZHluYW1pY3MsIGNvbnN0YW50cywgdmVydGV4X2RhdGEpXG57XG4gICAgdmFyIGRsZW4gPSBkeW5hbWljcy5sZW5ndGg7XG4gICAgdmFyIHZsZW4gPSBkeW5hbWljc1swXS5sZW5ndGg7XG4gICAgY29uc3RhbnRzID0gY29uc3RhbnRzIHx8IFtdO1xuXG4gICAgZm9yICh2YXIgdj0wOyB2IDwgdmxlbjsgdisrKSB7XG4gICAgICAgIGZvciAodmFyIGQ9MDsgZCA8IGRsZW47IGQrKykge1xuICAgICAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgZHluYW1pY3NbZF1bdl0pO1xuICAgICAgICB9XG4gICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIGNvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQWRkIHZlcnRpY2VzIHRvIGFuIGFycmF5LCB3aXRoIGEgdmFyaWFibGUgbGF5b3V0IChib3RoIHBlci12ZXJ0ZXggZHluYW1pYyBhbmQgY29uc3RhbnQgYXR0cmlicylcbi8vIEdMLmFkZFZlcnRpY2VzQnlBdHRyaWJ1dGVMYXlvdXQgPSBmdW5jdGlvbiAoYXR0cmlicywgdmVydGV4X2RhdGEpXG4vLyB7XG4vLyAgICAgdmFyIG1heF9sZW5ndGggPSAwO1xuLy8gICAgIGZvciAodmFyIGE9MDsgYSA8IGF0dHJpYnMubGVuZ3RoOyBhKyspIHtcbi8vICAgICAgICAgLy8gY29uc29sZS5sb2coYXR0cmlic1thXS5uYW1lKTtcbi8vICAgICAgICAgLy8gY29uc29sZS5sb2coXCJhIFwiICsgdHlwZW9mIGF0dHJpYnNbYV0uZGF0YSk7XG4vLyAgICAgICAgIGlmICh0eXBlb2YgYXR0cmlic1thXS5kYXRhID09ICdvYmplY3QnKSB7XG4vLyAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImFbMF0gXCIgKyB0eXBlb2YgYXR0cmlic1thXS5kYXRhWzBdKTtcbi8vICAgICAgICAgICAgIC8vIFBlci12ZXJ0ZXggbGlzdCAtIGFycmF5IG9mIGFycmF5XG4vLyAgICAgICAgICAgICBpZiAodHlwZW9mIGF0dHJpYnNbYV0uZGF0YVswXSA9PSAnb2JqZWN0Jykge1xuLy8gICAgICAgICAgICAgICAgIGF0dHJpYnNbYV0uY3Vyc29yID0gMDtcbi8vICAgICAgICAgICAgICAgICBpZiAoYXR0cmlic1thXS5kYXRhLmxlbmd0aCA+IG1heF9sZW5ndGgpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgbWF4X2xlbmd0aCA9IGF0dHJpYnNbYV0uZGF0YS5sZW5ndGg7XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgLy8gU3RhdGljIGFycmF5IGZvciBhbGwgdmVydGljZXNcbi8vICAgICAgICAgICAgIGVsc2Uge1xuLy8gICAgICAgICAgICAgICAgIGF0dHJpYnNbYV0ubmV4dF92ZXJ0ZXggPSBhdHRyaWJzW2FdLmRhdGE7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vICAgICAgICAgZWxzZSB7XG4vLyAgICAgICAgICAgICAvLyBTdGF0aWMgc2luZ2xlIHZhbHVlIGZvciBhbGwgdmVydGljZXMsIGNvbnZlcnQgdG8gYXJyYXlcbi8vICAgICAgICAgICAgIGF0dHJpYnNbYV0ubmV4dF92ZXJ0ZXggPSBbYXR0cmlic1thXS5kYXRhXTtcbi8vICAgICAgICAgfVxuLy8gICAgIH1cblxuLy8gICAgIGZvciAodmFyIHY9MDsgdiA8IG1heF9sZW5ndGg7IHYrKykge1xuLy8gICAgICAgICBmb3IgKHZhciBhPTA7IGEgPCBhdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4vLyAgICAgICAgICAgICBpZiAoYXR0cmlic1thXS5jdXJzb3IgIT0gbnVsbCkge1xuLy8gICAgICAgICAgICAgICAgIC8vIE5leHQgdmFsdWUgaW4gbGlzdFxuLy8gICAgICAgICAgICAgICAgIGF0dHJpYnNbYV0ubmV4dF92ZXJ0ZXggPSBhdHRyaWJzW2FdLmRhdGFbYXR0cmlic1thXS5jdXJzb3JdO1xuXG4vLyAgICAgICAgICAgICAgICAgLy8gVE9ETzogcmVwZWF0cyBpZiBvbmUgbGlzdCBpcyBzaG9ydGVyIHRoYW4gb3RoZXJzIC0gZGVzaXJlZCBiZWhhdmlvciwgb3IgZW5mb3JjZSBzYW1lIGxlbmd0aD9cbi8vICAgICAgICAgICAgICAgICBpZiAoYXR0cmlic1thXS5jdXJzb3IgPCBhdHRyaWJzW2FdLmRhdGEubGVuZ3RoKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnNbYV0uY3Vyc29yKys7XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgYXR0cmlic1thXS5uZXh0X3ZlcnRleCk7XG4vLyAgICAgICAgIH1cbi8vICAgICB9XG4vLyAgICAgcmV0dXJuIHZlcnRleF9kYXRhO1xuLy8gfTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHTDtcbn1cbiIsInZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi92ZWN0b3IuanMnKTtcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uL3BvaW50LmpzJyk7XG52YXIgR0wgPSByZXF1aXJlKCcuL2dsLmpzJyk7XG5cbnZhciBHTEJ1aWxkZXJzID0ge307XG5cbkdMQnVpbGRlcnMuZGVidWcgPSBmYWxzZTtcblxuLy8gVGVzc2VsYXRlIGEgZmxhdCAyRCBwb2x5Z29uIHdpdGggZml4ZWQgaGVpZ2h0IGFuZCBhZGQgdG8gR0wgdmVydGV4IGJ1ZmZlclxuR0xCdWlsZGVycy5idWlsZFBvbHlnb25zID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUG9seWdvbnMgKHBvbHlnb25zLCB6LCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW107XG4gICAgaWYgKHogIT0gbnVsbCkge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2goeik7IC8vIHByb3ZpZGVkIHpcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMubm9ybWFscykge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2goMCwgMCwgMSk7IC8vIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgIH1cbiAgICBpZiAob3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh2ZXJ0ZXhfY29uc3RhbnRzLCBvcHRpb25zLnZlcnRleF9jb25zdGFudHMpO1xuICAgIH1cbiAgICBpZiAodmVydGV4X2NvbnN0YW50cy5sZW5ndGggPT0gMCkge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbnVtX3BvbHlnb25zID0gcG9seWdvbnMubGVuZ3RoO1xuICAgIGZvciAodmFyIHA9MDsgcCA8IG51bV9wb2x5Z29uczsgcCsrKSB7XG4gICAgICAgIHZhciB2ZXJ0aWNlcyA9IEdMLnRyaWFuZ3VsYXRlUG9seWdvbihwb2x5Z29uc1twXSk7XG4gICAgICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLCB2ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQ2FsbGJhY2stYmFzZSBidWlsZGVyIChmb3IgZnV0dXJlIGV4cGxvcmF0aW9uKVxuLy8gVGVzc2VsYXRlIGEgZmxhdCAyRCBwb2x5Z29uIHdpdGggZml4ZWQgaGVpZ2h0IGFuZCBhZGQgdG8gR0wgdmVydGV4IGJ1ZmZlclxuLy8gR0xCdWlsZGVycy5idWlsZFBvbHlnb25zMiA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZFBvbHlnb24yIChwb2x5Z29ucywgeiwgYWRkR2VvbWV0cnksIG9wdGlvbnMpXG4vLyB7XG4vLyAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbi8vICAgICB2YXIgbnVtX3BvbHlnb25zID0gcG9seWdvbnMubGVuZ3RoO1xuLy8gICAgIGZvciAodmFyIHA9MDsgcCA8IG51bV9wb2x5Z29uczsgcCsrKSB7XG4vLyAgICAgICAgIHZhciB2ZXJ0aWNlcyA9IHtcbi8vICAgICAgICAgICAgIHBvc2l0aW9uczogR0wudHJpYW5ndWxhdGVQb2x5Z29uKHBvbHlnb25zW3BdLCB6KSxcbi8vICAgICAgICAgICAgIG5vcm1hbHM6IChvcHRpb25zLm5vcm1hbHMgPyBbMCwgMCwgMV0gOiBudWxsKVxuLy8gICAgICAgICB9O1xuXG4vLyAgICAgICAgIGFkZEdlb21ldHJ5KHZlcnRpY2VzKTtcbi8vICAgICB9XG4vLyB9O1xuXG4vLyBUZXNzZWxhdGUgYW5kIGV4dHJ1ZGUgYSBmbGF0IDJEIHBvbHlnb24gaW50byBhIHNpbXBsZSAzRCBtb2RlbCB3aXRoIGZpeGVkIGhlaWdodCBhbmQgYWRkIHRvIEdMIHZlcnRleCBidWZmZXJcbkdMQnVpbGRlcnMuYnVpbGRFeHRydWRlZFBvbHlnb25zID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkRXh0cnVkZWRQb2x5Z29uIChwb2x5Z29ucywgeiwgaGVpZ2h0LCBtaW5faGVpZ2h0LCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgbWluX3ogPSB6ICsgKG1pbl9oZWlnaHQgfHwgMCk7XG4gICAgdmFyIG1heF96ID0geiArIGhlaWdodDtcblxuICAgIC8vIFRvcFxuICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5Z29ucyhwb2x5Z29ucywgbWF4X3osIHZlcnRleF9kYXRhLCB7IG5vcm1hbHM6IHRydWUsIHZlcnRleF9jb25zdGFudHM6IG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyB9KTtcbiAgICAvLyB2YXIgdG9wX3ZlcnRleF9jb25zdGFudHMgPSBbMCwgMCwgMV07XG4gICAgLy8gaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyAhPSBudWxsKSB7XG4gICAgLy8gICAgIHRvcF92ZXJ0ZXhfY29uc3RhbnRzLnB1c2guYXBwbHkodG9wX3ZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgLy8gfVxuICAgIC8vIEdMQnVpbGRlcnMuYnVpbGRQb2x5Z29uczIoXG4gICAgLy8gICAgIHBvbHlnb25zLFxuICAgIC8vICAgICBtYXhfeixcbiAgICAvLyAgICAgZnVuY3Rpb24gKHZlcnRpY2VzKSB7XG4gICAgLy8gICAgICAgICBHTC5hZGRWZXJ0aWNlcyh2ZXJ0aWNlcy5wb3NpdGlvbnMsIHRvcF92ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyApO1xuXG4gICAgLy8gV2FsbHNcbiAgICB2YXIgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzID0gW251bGwsIG51bGwsIG51bGxdOyAvLyBub3JtYWxzIHdpbGwgYmUgY2FsY3VsYXRlZCBiZWxvd1xuICAgIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzLnB1c2guYXBwbHkod2FsbF92ZXJ0ZXhfY29uc3RhbnRzLCBvcHRpb25zLnZlcnRleF9jb25zdGFudHMpO1xuICAgIH1cblxuICAgIHZhciBudW1fcG9seWdvbnMgPSBwb2x5Z29ucy5sZW5ndGg7XG4gICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvbHlnb25zOyBwKyspIHtcbiAgICAgICAgdmFyIHBvbHlnb24gPSBwb2x5Z29uc1twXTtcblxuICAgICAgICBmb3IgKHZhciBxPTA7IHEgPCBwb2x5Z29uLmxlbmd0aDsgcSsrKSB7XG4gICAgICAgICAgICB2YXIgY29udG91ciA9IHBvbHlnb25bcV07XG5cbiAgICAgICAgICAgIGZvciAodmFyIHc9MDsgdyA8IGNvbnRvdXIubGVuZ3RoIC0gMTsgdysrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdhbGxfdmVydGljZXMgPSBbXTtcblxuICAgICAgICAgICAgICAgIC8vIFR3byB0cmlhbmdsZXMgZm9yIHRoZSBxdWFkIGZvcm1lZCBieSBlYWNoIHZlcnRleCBwYWlyLCBnb2luZyBmcm9tIGJvdHRvbSB0byB0b3AgaGVpZ2h0XG4gICAgICAgICAgICAgICAgd2FsbF92ZXJ0aWNlcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAvLyBUcmlhbmdsZVxuICAgICAgICAgICAgICAgICAgICBbY29udG91clt3KzFdWzBdLCBjb250b3VyW3crMV1bMV0sIG1heF96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbdysxXVswXSwgY29udG91clt3KzFdWzFdLCBtaW5fel0sXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3ddWzBdLCBjb250b3VyW3ddWzFdLCBtaW5fel0sXG4gICAgICAgICAgICAgICAgICAgIC8vIFRyaWFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3ddWzBdLCBjb250b3VyW3ddWzFdLCBtaW5fel0sXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3ddWzBdLCBjb250b3VyW3ddWzFdLCBtYXhfel0sXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3crMV1bMF0sIGNvbnRvdXJbdysxXVsxXSwgbWF4X3pdXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIC8vIENhbGMgdGhlIG5vcm1hbCBvZiB0aGUgd2FsbCBmcm9tIHVwIHZlY3RvciBhbmQgb25lIHNlZ21lbnQgb2YgdGhlIHdhbGwgdHJpYW5nbGVzXG4gICAgICAgICAgICAgICAgdmFyIG5vcm1hbCA9IFZlY3Rvci5jcm9zcyhcbiAgICAgICAgICAgICAgICAgICAgWzAsIDAsIDFdLFxuICAgICAgICAgICAgICAgICAgICBWZWN0b3Iubm9ybWFsaXplKFtjb250b3VyW3crMV1bMF0gLSBjb250b3VyW3ddWzBdLCBjb250b3VyW3crMV1bMV0gLSBjb250b3VyW3ddWzFdLCAwXSlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzWzBdID0gbm9ybWFsWzBdO1xuICAgICAgICAgICAgICAgIHdhbGxfdmVydGV4X2NvbnN0YW50c1sxXSA9IG5vcm1hbFsxXTtcbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHNbMl0gPSBub3JtYWxbMl07XG5cbiAgICAgICAgICAgICAgICBHTC5hZGRWZXJ0aWNlcyh3YWxsX3ZlcnRpY2VzLCB3YWxsX3ZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIEJ1aWxkIHRlc3NlbGxhdGVkIHRyaWFuZ2xlcyBmb3IgYSBwb2x5bGluZVxuLy8gQmFzaWNhbGx5IGZvbGxvd2luZyB0aGUgbWV0aG9kIGRlc2NyaWJlZCBoZXJlIGZvciBtaXRlciBqb2ludHM6XG4vLyBodHRwOi8vYXJ0Z3JhbW1lci5ibG9nc3BvdC5jby51ay8yMDExLzA3L2RyYXdpbmctcG9seWxpbmVzLWJ5LXRlc3NlbGxhdGlvbi5odG1sXG5HTEJ1aWxkZXJzLmJ1aWxkUG9seWxpbmVzID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUG9seWxpbmVzIChsaW5lcywgeiwgd2lkdGgsIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gPSBvcHRpb25zLmNsb3NlZF9wb2x5Z29uIHx8IGZhbHNlO1xuICAgIG9wdGlvbnMucmVtb3ZlX3RpbGVfZWRnZXMgPSBvcHRpb25zLnJlbW92ZV90aWxlX2VkZ2VzIHx8IGZhbHNlO1xuXG4gICAgdmFyIHZlcnRleF9jb25zdGFudHMgPSBbeiwgMCwgMCwgMV07IC8vIHByb3ZpZGVkIHosIGFuZCB1cHdhcmRzLWZhY2luZyBub3JtYWxcbiAgICBpZiAob3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh2ZXJ0ZXhfY29uc3RhbnRzLCBvcHRpb25zLnZlcnRleF9jb25zdGFudHMpO1xuICAgIH1cblxuICAgIC8vIExpbmUgY2VudGVyIC0gZGVidWdnaW5nXG4gICAgaWYgKEdMQnVpbGRlcnMuZGVidWcgJiYgb3B0aW9ucy52ZXJ0ZXhfbGluZXMpIHtcbiAgICAgICAgdmFyIG51bV9saW5lcyA9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgbG49MDsgbG4gPCBudW1fbGluZXM7IGxuKyspIHtcbiAgICAgICAgICAgIHZhciBsaW5lID0gbGluZXNbbG5dO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBwPTA7IHAgPCBsaW5lLmxlbmd0aCAtIDE7IHArKykge1xuICAgICAgICAgICAgICAgIC8vIFBvaW50IEEgdG8gQlxuICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmVbcF07XG4gICAgICAgICAgICAgICAgdmFyIHBiID0gbGluZVtwKzFdO1xuXG4gICAgICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgcGFbMF0sIHBhWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDEuMCwgMCwgMCxcbiAgICAgICAgICAgICAgICAgICAgcGJbMF0sIHBiWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDEuMCwgMCwgMFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgdHJpYW5nbGVzXG4gICAgdmFyIHZlcnRpY2VzID0gW107XG4gICAgdmFyIG51bV9saW5lcyA9IGxpbmVzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBsbj0wOyBsbiA8IG51bV9saW5lczsgbG4rKykge1xuICAgICAgICB2YXIgbGluZSA9IGxpbmVzW2xuXTtcbiAgICAgICAgLy8gTXVsdGlwbGUgbGluZSBzZWdtZW50c1xuICAgICAgICBpZiAobGluZS5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAvLyBCdWlsZCBhbmNob3JzIGZvciBsaW5lIHNlZ21lbnRzOlxuICAgICAgICAgICAgLy8gYW5jaG9ycyBhcmUgMyBwb2ludHMsIGVhY2ggY29ubmVjdGluZyAyIGxpbmUgc2VnbWVudHMgdGhhdCBzaGFyZSBhIGpvaW50IChzdGFydCBwb2ludCwgam9pbnQgcG9pbnQsIGVuZCBwb2ludClcblxuICAgICAgICAgICAgdmFyIGFuY2hvcnMgPSBbXTtcblxuICAgICAgICAgICAgaWYgKGxpbmUubGVuZ3RoID4gMykge1xuICAgICAgICAgICAgICAgIC8vIEZpbmQgbWlkcG9pbnRzIG9mIGVhY2ggbGluZSBzZWdtZW50XG4gICAgICAgICAgICAgICAgLy8gRm9yIGNsb3NlZCBwb2x5Z29ucywgY2FsY3VsYXRlIGFsbCBtaWRwb2ludHMgc2luY2Ugc2VnbWVudHMgd2lsbCB3cmFwIGFyb3VuZCB0byBmaXJzdCBtaWRwb2ludFxuICAgICAgICAgICAgICAgIHZhciBtaWQgPSBbXTtcbiAgICAgICAgICAgICAgICB2YXIgcCwgcG1heDtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5jbG9zZWRfcG9seWdvbiA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHAgPSAwOyAvLyBzdGFydCBvbiBmaXJzdCBwb2ludFxuICAgICAgICAgICAgICAgICAgICBwbWF4ID0gbGluZS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBGb3Igb3BlbiBwb2x5Z29ucywgc2tpcCBmaXJzdCBtaWRwb2ludCBhbmQgdXNlIGxpbmUgc3RhcnQgaW5zdGVhZFxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwID0gMTsgLy8gc3RhcnQgb24gc2Vjb25kIHBvaW50XG4gICAgICAgICAgICAgICAgICAgIHBtYXggPSBsaW5lLmxlbmd0aCAtIDI7XG4gICAgICAgICAgICAgICAgICAgIG1pZC5wdXNoKGxpbmVbMF0pOyAvLyB1c2UgbGluZSBzdGFydCBpbnN0ZWFkIG9mIGZpcnN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ2FsYyBtaWRwb2ludHNcbiAgICAgICAgICAgICAgICBmb3IgKDsgcCA8IHBtYXg7IHArKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGEgPSBsaW5lW3BdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lW3ArMV07XG4gICAgICAgICAgICAgICAgICAgIG1pZC5wdXNoKFsocGFbMF0gKyBwYlswXSkgLyAyLCAocGFbMV0gKyBwYlsxXSkgLyAyXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gU2FtZSBjbG9zZWQvb3BlbiBwb2x5Z29uIGxvZ2ljIGFzIGFib3ZlOiBrZWVwIGxhc3QgbWlkcG9pbnQgZm9yIGNsb3NlZCwgc2tpcCBmb3Igb3BlblxuICAgICAgICAgICAgICAgIHZhciBtbWF4O1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmNsb3NlZF9wb2x5Z29uID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbW1heCA9IG1pZC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtaWQucHVzaChsaW5lW2xpbmUubGVuZ3RoLTFdKTsgLy8gdXNlIGxpbmUgZW5kIGluc3RlYWQgb2YgbGFzdCBtaWRwb2ludFxuICAgICAgICAgICAgICAgICAgICBtbWF4ID0gbWlkLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTWFrZSBhbmNob3JzIGJ5IGNvbm5lY3RpbmcgbWlkcG9pbnRzIHRvIGxpbmUgam9pbnRzXG4gICAgICAgICAgICAgICAgZm9yIChwPTA7IHAgPCBtbWF4OyBwKyspICB7XG4gICAgICAgICAgICAgICAgICAgIGFuY2hvcnMucHVzaChbbWlkW3BdLCBsaW5lWyhwKzEpICUgbGluZS5sZW5ndGhdLCBtaWRbKHArMSkgJSBtaWQubGVuZ3RoXV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIERlZ2VuZXJhdGUgY2FzZSwgYSAzLXBvaW50IGxpbmUgaXMganVzdCBhIHNpbmdsZSBhbmNob3JcbiAgICAgICAgICAgICAgICBhbmNob3JzID0gW1tsaW5lWzBdLCBsaW5lWzFdLCBsaW5lWzJdXV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIHA9MDsgcCA8IGFuY2hvcnMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMucmVtb3ZlX3RpbGVfZWRnZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRBbmNob3IoYW5jaG9yc1twXVswXSwgYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTsgLy8gdXNlIHRoZXNlIHRvIGRyYXcgZXh0cnVkZWQgc2VnbWVudHMgdy9vIGpvaW4sIGZvciBkZWJ1Z2dpbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGRTZWdtZW50KGFuY2hvcnNbcF1bMV0sIGFuY2hvcnNbcF1bMl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkZ2UxID0gR0xCdWlsZGVycy5pc09uVGlsZUVkZ2UoYW5jaG9yc1twXVswXSwgYW5jaG9yc1twXVsxXSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlZGdlMiA9IEdMQnVpbGRlcnMuaXNPblRpbGVFZGdlKGFuY2hvcnNbcF1bMV0sIGFuY2hvcnNbcF1bMl0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWVkZ2UxICYmICFlZGdlMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRBbmNob3IoYW5jaG9yc1twXVswXSwgYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIWVkZ2UxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZFNlZ21lbnQoYW5jaG9yc1twXVswXSwgYW5jaG9yc1twXVsxXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIWVkZ2UyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZFNlZ21lbnQoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2luZ2xlIDItcG9pbnQgc2VnbWVudFxuICAgICAgICBlbHNlIGlmIChsaW5lLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICBidWlsZFNlZ21lbnQobGluZVswXSwgbGluZVsxXSk7IC8vIFRPRE86IHJlcGxhY2UgYnVpbGRTZWdtZW50IHdpdGggYSBkZWdlbmVyYXRlIGZvcm0gb2YgYnVpbGRBbmNob3I/IGJ1aWxkU2VnbWVudCBpcyBzdGlsbCB1c2VmdWwgZm9yIGRlYnVnZ2luZ1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLCB2ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG5cbiAgICAvLyBCdWlsZCB0cmlhbmdsZXMgZm9yIGEgc2luZ2xlIGxpbmUgc2VnbWVudCwgZXh0cnVkZWQgYnkgdGhlIHByb3ZpZGVkIHdpZHRoXG4gICAgZnVuY3Rpb24gYnVpbGRTZWdtZW50IChwYSwgcGIpIHtcbiAgICAgICAgdmFyIHNsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKHBiWzFdIC0gcGFbMV0pICogLTEsIHBiWzBdIC0gcGFbMF1dKTtcblxuICAgICAgICB2YXIgcGFfb3V0ZXIgPSBbcGFbMF0gKyBzbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdICsgc2xvcGVbMV0gKiB3aWR0aC8yXTtcbiAgICAgICAgdmFyIHBhX2lubmVyID0gW3BhWzBdIC0gc2xvcGVbMF0gKiB3aWR0aC8yLCBwYVsxXSAtIHNsb3BlWzFdICogd2lkdGgvMl07XG5cbiAgICAgICAgdmFyIHBiX291dGVyID0gW3BiWzBdICsgc2xvcGVbMF0gKiB3aWR0aC8yLCBwYlsxXSArIHNsb3BlWzFdICogd2lkdGgvMl07XG4gICAgICAgIHZhciBwYl9pbm5lciA9IFtwYlswXSAtIHNsb3BlWzBdICogd2lkdGgvMiwgcGJbMV0gLSBzbG9wZVsxXSAqIHdpZHRoLzJdO1xuXG4gICAgICAgIHZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICBwYl9pbm5lciwgcGJfb3V0ZXIsIHBhX2lubmVyLFxuICAgICAgICAgICAgcGFfaW5uZXIsIHBiX291dGVyLCBwYV9vdXRlclxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIEJ1aWxkIHRyaWFuZ2xlcyBmb3IgYSAzLXBvaW50ICdhbmNob3InIHNoYXBlLCBjb25zaXN0aW5nIG9mIHR3byBsaW5lIHNlZ21lbnRzIHdpdGggYSBqb2ludFxuICAgIC8vIFRPRE86IG1vdmUgdGhlc2UgZnVuY3Rpb25zIG91dCBvZiBjbG9zdXJlcz9cbiAgICBmdW5jdGlvbiBidWlsZEFuY2hvciAocGEsIGpvaW50LCBwYikge1xuICAgICAgICAvLyBJbm5lciBhbmQgb3V0ZXIgbGluZSBzZWdtZW50cyBmb3IgW3BhLCBqb2ludF0gYW5kIFtqb2ludCwgcGJdXG4gICAgICAgIHZhciBwYV9zbG9wZSA9IFZlY3Rvci5ub3JtYWxpemUoWyhqb2ludFsxXSAtIHBhWzFdKSAqIC0xLCBqb2ludFswXSAtIHBhWzBdXSk7XG4gICAgICAgIHZhciBwYV9vdXRlciA9IFtcbiAgICAgICAgICAgIFtwYVswXSArIHBhX3Nsb3BlWzBdICogd2lkdGgvMiwgcGFbMV0gKyBwYV9zbG9wZVsxXSAqIHdpZHRoLzJdLFxuICAgICAgICAgICAgW2pvaW50WzBdICsgcGFfc2xvcGVbMF0gKiB3aWR0aC8yLCBqb2ludFsxXSArIHBhX3Nsb3BlWzFdICogd2lkdGgvMl1cbiAgICAgICAgXTtcbiAgICAgICAgdmFyIHBhX2lubmVyID0gW1xuICAgICAgICAgICAgW3BhWzBdIC0gcGFfc2xvcGVbMF0gKiB3aWR0aC8yLCBwYVsxXSAtIHBhX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbam9pbnRbMF0gLSBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdIC0gcGFfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuXG4gICAgICAgIHZhciBwYl9zbG9wZSA9IFZlY3Rvci5ub3JtYWxpemUoWyhwYlsxXSAtIGpvaW50WzFdKSAqIC0xLCBwYlswXSAtIGpvaW50WzBdXSk7XG4gICAgICAgIHZhciBwYl9vdXRlciA9IFtcbiAgICAgICAgICAgIFtqb2ludFswXSArIHBiX3Nsb3BlWzBdICogd2lkdGgvMiwgam9pbnRbMV0gKyBwYl9zbG9wZVsxXSAqIHdpZHRoLzJdLFxuICAgICAgICAgICAgW3BiWzBdICsgcGJfc2xvcGVbMF0gKiB3aWR0aC8yLCBwYlsxXSArIHBiX3Nsb3BlWzFdICogd2lkdGgvMl1cbiAgICAgICAgXTtcbiAgICAgICAgdmFyIHBiX2lubmVyID0gW1xuICAgICAgICAgICAgW2pvaW50WzBdIC0gcGJfc2xvcGVbMF0gKiB3aWR0aC8yLCBqb2ludFsxXSAtIHBiX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbcGJbMF0gLSBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdIC0gcGJfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIE1pdGVyIGpvaW4gLSBzb2x2ZSBmb3IgdGhlIGludGVyc2VjdGlvbiBiZXR3ZWVuIHRoZSB0d28gb3V0ZXIgbGluZSBzZWdtZW50c1xuICAgICAgICB2YXIgaW50ZXJzZWN0aW9uID0gVmVjdG9yLmxpbmVJbnRlcnNlY3Rpb24ocGFfb3V0ZXJbMF0sIHBhX291dGVyWzFdLCBwYl9vdXRlclswXSwgcGJfb3V0ZXJbMV0pO1xuICAgICAgICB2YXIgbGluZV9kZWJ1ZyA9IG51bGw7XG4gICAgICAgIGlmIChpbnRlcnNlY3Rpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGludGVyc2VjdF9vdXRlciA9IGludGVyc2VjdGlvbjtcblxuICAgICAgICAgICAgLy8gQ2FwIHRoZSBpbnRlcnNlY3Rpb24gcG9pbnQgdG8gYSByZWFzb25hYmxlIGRpc3RhbmNlIChhcyBqb2luIGFuZ2xlIGJlY29tZXMgc2hhcnBlciwgbWl0ZXIgam9pbnQgZGlzdGFuY2Ugd291bGQgYXBwcm9hY2ggaW5maW5pdHkpXG4gICAgICAgICAgICB2YXIgbGVuX3NxID0gVmVjdG9yLmxlbmd0aFNxKFtpbnRlcnNlY3Rfb3V0ZXJbMF0gLSBqb2ludFswXSwgaW50ZXJzZWN0X291dGVyWzFdIC0gam9pbnRbMV1dKTtcbiAgICAgICAgICAgIHZhciBtaXRlcl9sZW5fbWF4ID0gMzsgLy8gbXVsdGlwbGllciBvbiBsaW5lIHdpZHRoIGZvciBtYXggZGlzdGFuY2UgbWl0ZXIgam9pbiBjYW4gYmUgZnJvbSBqb2ludFxuICAgICAgICAgICAgaWYgKGxlbl9zcSA+ICh3aWR0aCAqIHdpZHRoICogbWl0ZXJfbGVuX21heCAqIG1pdGVyX2xlbl9tYXgpKSB7XG4gICAgICAgICAgICAgICAgbGluZV9kZWJ1ZyA9ICdkaXN0YW5jZSc7XG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X291dGVyID0gVmVjdG9yLm5vcm1hbGl6ZShbaW50ZXJzZWN0X291dGVyWzBdIC0gam9pbnRbMF0sIGludGVyc2VjdF9vdXRlclsxXSAtIGpvaW50WzFdXSk7XG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X291dGVyID0gW1xuICAgICAgICAgICAgICAgICAgICBqb2ludFswXSArIGludGVyc2VjdF9vdXRlclswXSAqIG1pdGVyX2xlbl9tYXgsXG4gICAgICAgICAgICAgICAgICAgIGpvaW50WzFdICsgaW50ZXJzZWN0X291dGVyWzFdICogbWl0ZXJfbGVuX21heFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGludGVyc2VjdF9pbm5lciA9IFtcbiAgICAgICAgICAgICAgICAoam9pbnRbMF0gLSBpbnRlcnNlY3Rfb3V0ZXJbMF0pICsgam9pbnRbMF0sXG4gICAgICAgICAgICAgICAgKGpvaW50WzFdIC0gaW50ZXJzZWN0X291dGVyWzFdKSArIGpvaW50WzFdXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICB2ZXJ0aWNlcy5wdXNoKFxuICAgICAgICAgICAgICAgIGludGVyc2VjdF9pbm5lciwgaW50ZXJzZWN0X291dGVyLCBwYV9pbm5lclswXSxcbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXSwgaW50ZXJzZWN0X291dGVyLCBwYV9vdXRlclswXSxcblxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzFdLCBwYl9vdXRlclsxXSwgaW50ZXJzZWN0X2lubmVyLFxuICAgICAgICAgICAgICAgIGludGVyc2VjdF9pbm5lciwgcGJfb3V0ZXJbMV0sIGludGVyc2VjdF9vdXRlclxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIExpbmUgc2VnbWVudHMgYXJlIHBhcmFsbGVsLCB1c2UgdGhlIGZpcnN0IG91dGVyIGxpbmUgc2VnbWVudCBhcyBqb2luIGluc3RlYWRcbiAgICAgICAgICAgIGxpbmVfZGVidWcgPSAncGFyYWxsZWwnO1xuICAgICAgICAgICAgcGFfaW5uZXJbMV0gPSBwYl9pbm5lclswXTtcbiAgICAgICAgICAgIHBhX291dGVyWzFdID0gcGJfb3V0ZXJbMF07XG5cbiAgICAgICAgICAgIHZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgcGFfaW5uZXJbMV0sIHBhX291dGVyWzFdLCBwYV9pbm5lclswXSxcbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXSwgcGFfb3V0ZXJbMV0sIHBhX291dGVyWzBdLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMV0sIHBiX291dGVyWzFdLCBwYl9pbm5lclswXSxcbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXSwgcGJfb3V0ZXJbMV0sIHBiX291dGVyWzBdXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXh0cnVkZWQgaW5uZXIvb3V0ZXIgZWRnZXMgLSBkZWJ1Z2dpbmdcbiAgICAgICAgaWYgKEdMQnVpbGRlcnMuZGVidWcgJiYgb3B0aW9ucy52ZXJ0ZXhfbGluZXMpIHtcbiAgICAgICAgICAgIG9wdGlvbnMudmVydGV4X2xpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgcGFfaW5uZXJbMF1bMF0sIHBhX2lubmVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXVswXSwgcGFfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMF1bMF0sIHBiX2lubmVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXVswXSwgcGJfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGFfb3V0ZXJbMF1bMF0sIHBhX291dGVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYV9vdXRlclsxXVswXSwgcGFfb3V0ZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGJfb3V0ZXJbMF1bMF0sIHBiX291dGVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYl9vdXRlclsxXVswXSwgcGJfb3V0ZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGFfaW5uZXJbMF1bMF0sIHBhX2lubmVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYV9vdXRlclswXVswXSwgcGFfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGFfaW5uZXJbMV1bMF0sIHBhX2lubmVyWzFdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYV9vdXRlclsxXVswXSwgcGFfb3V0ZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMF1bMF0sIHBiX2lubmVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYl9vdXRlclswXVswXSwgcGJfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMV1bMF0sIHBiX2lubmVyWzFdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYl9vdXRlclsxXVswXSwgcGJfb3V0ZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEdMQnVpbGRlcnMuZGVidWcgJiYgbGluZV9kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICAgICAgdmFyIGRjb2xvcjtcbiAgICAgICAgICAgIGlmIChsaW5lX2RlYnVnID09ICdwYXJhbGxlbCcpIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIiEhISBsaW5lcyBhcmUgcGFyYWxsZWwgISEhXCIpO1xuICAgICAgICAgICAgICAgIGRjb2xvciA9IFswLCAxLCAwXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGxpbmVfZGVidWcgPT0gJ2Rpc3RhbmNlJykge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiISEhIG1pdGVyIGludGVyc2VjdGlvbiBwb2ludCBleGNlZWRlZCBhbGxvd2VkIGRpc3RhbmNlIGZyb20gam9pbnQgISEhXCIpO1xuICAgICAgICAgICAgICAgIGRjb2xvciA9IFsxLCAwLCAwXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdPU00gaWQ6ICcgKyBmZWF0dXJlLmlkKTsgLy8gVE9ETzogaWYgdGhpcyBmdW5jdGlvbiBpcyBtb3ZlZCBvdXQgb2YgYSBjbG9zdXJlLCB0aGlzIGZlYXR1cmUgZGVidWcgaW5mbyB3b24ndCBiZSBhdmFpbGFibGVcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFtwYSwgam9pbnQsIHBiXSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhmZWF0dXJlKTtcbiAgICAgICAgICAgIG9wdGlvbnMudmVydGV4X2xpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgcGFbMF0sIHBhWzFdLCB6ICsgMC4wMDIsXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgZGNvbG9yWzBdLCBkY29sb3JbMV0sIGRjb2xvclsyXSxcbiAgICAgICAgICAgICAgICBqb2ludFswXSwgam9pbnRbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdLFxuICAgICAgICAgICAgICAgIGpvaW50WzBdLCBqb2ludFsxXSwgeiArIDAuMDAyLFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIGRjb2xvclswXSwgZGNvbG9yWzFdLCBkY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgcGJbMF0sIHBiWzFdLCB6ICsgMC4wMDIsXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgZGNvbG9yWzBdLCBkY29sb3JbMV0sIGRjb2xvclsyXVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgdmFyIG51bV9saW5lcyA9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAodmFyIGxuPTA7IGxuIDwgbnVtX2xpbmVzOyBsbisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmUyID0gbGluZXNbbG5dO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcD0wOyBwIDwgbGluZTIubGVuZ3RoIC0gMTsgcCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFBvaW50IEEgdG8gQlxuICAgICAgICAgICAgICAgICAgICB2YXIgcGEgPSBsaW5lMltwXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBiID0gbGluZTJbcCsxXTtcblxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnZlcnRleF9saW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFbMF0sIHBhWzFdLCB6ICsgMC4wMDA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgMCwgMCwgMSwgMCwgMCwgMS4wLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGJbMF0sIHBiWzFdLCB6ICsgMC4wMDA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgMCwgMCwgMSwgMCwgMCwgMS4wXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIEJ1aWxkIGEgcXVhZCBjZW50ZXJlZCBvbiBhIHBvaW50XG4vLyBaIGNvb3JkLCBub3JtYWxzLCBhbmQgdGV4Y29vcmRzIGFyZSBvcHRpb25hbFxuLy8gTGF5b3V0IG9yZGVyIGlzOlxuLy8gICBwb3NpdGlvbiAoMiBvciAzIGNvbXBvbmVudHMpXG4vLyAgIHRleGNvb3JkIChvcHRpb25hbCwgMiBjb21wb25lbnRzKVxuLy8gICBub3JtYWwgKG9wdGlvbmFsLCAzIGNvbXBvbmVudHMpXG4vLyAgIGNvbnN0YW50cyAob3B0aW9uYWwpXG5HTEJ1aWxkZXJzLmJ1aWxkUXVhZHNGb3JQb2ludHMgPSBmdW5jdGlvbiAocG9pbnRzLCB3aWR0aCwgaGVpZ2h0LCB6LCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtdO1xuICAgIGlmIChvcHRpb25zLm5vcm1hbHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoKDAsIDAsIDEpOyAvLyB1cHdhcmRzLWZhY2luZyBub3JtYWxcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2guYXBwbHkodmVydGV4X2NvbnN0YW50cywgb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICB9XG4gICAgaWYgKHZlcnRleF9jb25zdGFudHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cyA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIG51bV9wb2ludHMgPSBwb2ludHMubGVuZ3RoO1xuICAgIGZvciAodmFyIHA9MDsgcCA8IG51bV9wb2ludHM7IHArKykge1xuICAgICAgICB2YXIgcG9pbnQgPSBwb2ludHNbcF07XG5cbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IFtcbiAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4gICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcblxuICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4gICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcbiAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIEFkZCBwcm92aWRlZCB6XG4gICAgICAgIGlmICh6ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uc1swXVsyXSA9IHo7XG4gICAgICAgICAgICBwb3NpdGlvbnNbMV1bMl0gPSB6O1xuICAgICAgICAgICAgcG9zaXRpb25zWzJdWzJdID0gejtcbiAgICAgICAgICAgIHBvc2l0aW9uc1szXVsyXSA9IHo7XG4gICAgICAgICAgICBwb3NpdGlvbnNbNF1bMl0gPSB6O1xuICAgICAgICAgICAgcG9zaXRpb25zWzVdWzJdID0gejtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLnRleGNvb3JkcyA9PSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgdGV4Y29vcmRzID0gW1xuICAgICAgICAgICAgICAgIFstMSwgLTFdLFxuICAgICAgICAgICAgICAgIFsxLCAtMV0sXG4gICAgICAgICAgICAgICAgWzEsIDFdLFxuXG4gICAgICAgICAgICAgICAgWy0xLCAtMV0sXG4gICAgICAgICAgICAgICAgWzEsIDFdLFxuICAgICAgICAgICAgICAgIFstMSwgMV1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIEdMLmFkZFZlcnRpY2VzTXVsdGlwbGVBdHRyaWJ1dGVzKFtwb3NpdGlvbnMsIHRleGNvb3Jkc10sIHZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHBvc2l0aW9ucywgdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQ2FsbGJhY2stYmFzZSBidWlsZGVyIChmb3IgZnV0dXJlIGV4cGxvcmF0aW9uKVxuLy8gR0xCdWlsZGVycy5idWlsZFF1YWRzRm9yUG9pbnRzMiA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZFF1YWRzRm9yUG9pbnRzIChwb2ludHMsIHdpZHRoLCBoZWlnaHQsIGFkZEdlb21ldHJ5LCBvcHRpb25zKVxuLy8ge1xuLy8gICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuLy8gICAgIHZhciBudW1fcG9pbnRzID0gcG9pbnRzLmxlbmd0aDtcbi8vICAgICBmb3IgKHZhciBwPTA7IHAgPCBudW1fcG9pbnRzOyBwKyspIHtcbi8vICAgICAgICAgdmFyIHBvaW50ID0gcG9pbnRzW3BdO1xuXG4vLyAgICAgICAgIHZhciBwb3NpdGlvbnMgPSBbXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbi8vICAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuLy8gICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG5cbi8vICAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuLy8gICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcbi8vICAgICAgICAgXTtcblxuLy8gICAgICAgICBpZiAob3B0aW9ucy50ZXhjb29yZHMgPT0gdHJ1ZSkge1xuLy8gICAgICAgICAgICAgdmFyIHRleGNvb3JkcyA9IFtcbi8vICAgICAgICAgICAgICAgICBbLTEsIC0xXSxcbi8vICAgICAgICAgICAgICAgICBbMSwgLTFdLFxuLy8gICAgICAgICAgICAgICAgIFsxLCAxXSxcblxuLy8gICAgICAgICAgICAgICAgIFstMSwgLTFdLFxuLy8gICAgICAgICAgICAgICAgIFsxLCAxXSxcbi8vICAgICAgICAgICAgICAgICBbLTEsIDFdXG4vLyAgICAgICAgICAgICBdO1xuLy8gICAgICAgICB9XG5cbi8vICAgICAgICAgdmFyIHZlcnRpY2VzID0ge1xuLy8gICAgICAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXG4vLyAgICAgICAgICAgICBub3JtYWxzOiAob3B0aW9ucy5ub3JtYWxzID8gWzAsIDAsIDFdIDogbnVsbCksXG4vLyAgICAgICAgICAgICB0ZXhjb29yZHM6IChvcHRpb25zLnRleGNvb3JkcyAmJiB0ZXhjb29yZHMpXG4vLyAgICAgICAgIH07XG4vLyAgICAgICAgIGFkZEdlb21ldHJ5KHZlcnRpY2VzKTtcbi8vICAgICB9XG4vLyB9O1xuXG4vLyBCdWlsZCBuYXRpdmUgR0wgbGluZXMgZm9yIGEgcG9seWxpbmVcbkdMQnVpbGRlcnMuYnVpbGRMaW5lcyA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZExpbmVzIChsaW5lcywgZmVhdHVyZSwgbGF5ZXIsIHN0eWxlLCB0aWxlLCB6LCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBjb2xvciA9IHN0eWxlLmNvbG9yO1xuICAgIHZhciB3aWR0aCA9IHN0eWxlLndpZHRoO1xuXG4gICAgdmFyIG51bV9saW5lcyA9IGxpbmVzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBsbj0wOyBsbiA8IG51bV9saW5lczsgbG4rKykge1xuICAgICAgICB2YXIgbGluZSA9IGxpbmVzW2xuXTtcblxuICAgICAgICBmb3IgKHZhciBwPTA7IHAgPCBsaW5lLmxlbmd0aCAtIDE7IHArKykge1xuICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICB2YXIgcGEgPSBsaW5lW3BdO1xuICAgICAgICAgICAgdmFyIHBiID0gbGluZVtwKzFdO1xuXG4gICAgICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoKFxuICAgICAgICAgICAgICAgIC8vIFBvaW50IEFcbiAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHosXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgLy8gZmxhdCBzdXJmYWNlcyBwb2ludCBzdHJhaWdodCB1cFxuICAgICAgICAgICAgICAgIGNvbG9yWzBdLCBjb2xvclsxXSwgY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQlxuICAgICAgICAgICAgICAgIHBiWzBdLCBwYlsxXSwgeixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCAvLyBmbGF0IHN1cmZhY2VzIHBvaW50IHN0cmFpZ2h0IHVwXG4gICAgICAgICAgICAgICAgY29sb3JbMF0sIGNvbG9yWzFdLCBjb2xvclsyXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vKiBVdGlsaXR5IGZ1bmN0aW9ucyAqL1xuXG4vLyBUZXN0cyBpZiBhIGxpbmUgc2VnbWVudCAoZnJvbSBwb2ludCBBIHRvIEIpIGlzIG5lYXJseSBjb2luY2lkZW50IHdpdGggdGhlIGVkZ2Ugb2YgYSB0aWxlXG5HTEJ1aWxkZXJzLmlzT25UaWxlRWRnZSA9IGZ1bmN0aW9uIChwYSwgcGIsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgdG9sZXJhbmNlX2Z1bmN0aW9uID0gb3B0aW9ucy50b2xlcmFuY2VfZnVuY3Rpb24gfHwgR0xCdWlsZGVycy52YWx1ZXNXaXRoaW5Ub2xlcmFuY2U7XG4gICAgdmFyIHRvbGVyYW5jZSA9IG9wdGlvbnMudG9sZXJhbmNlIHx8IDE7IC8vIHR3ZWFrIHRoaXMgYWRqdXN0IGlmIGNhdGNoaW5nIHRvbyBmZXcvbWFueSBsaW5lIHNlZ21lbnRzIG5lYXIgdGlsZSBlZGdlc1xuICAgIHZhciB0aWxlX21pbiA9IEdMQnVpbGRlcnMudGlsZV9ib3VuZHNbMF07XG4gICAgdmFyIHRpbGVfbWF4ID0gR0xCdWlsZGVycy50aWxlX2JvdW5kc1sxXTtcbiAgICB2YXIgZWRnZSA9IG51bGw7XG5cbiAgICBpZiAodG9sZXJhbmNlX2Z1bmN0aW9uKHBhWzBdLCB0aWxlX21pbi54LCB0b2xlcmFuY2UpICYmIHRvbGVyYW5jZV9mdW5jdGlvbihwYlswXSwgdGlsZV9taW4ueCwgdG9sZXJhbmNlKSkge1xuICAgICAgICBlZGdlID0gJ2xlZnQnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMF0sIHRpbGVfbWF4LngsIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzBdLCB0aWxlX21heC54LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAncmlnaHQnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMV0sIHRpbGVfbWluLnksIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzFdLCB0aWxlX21pbi55LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAndG9wJztcbiAgICB9XG4gICAgZWxzZSBpZiAodG9sZXJhbmNlX2Z1bmN0aW9uKHBhWzFdLCB0aWxlX21heC55LCB0b2xlcmFuY2UpICYmIHRvbGVyYW5jZV9mdW5jdGlvbihwYlsxXSwgdGlsZV9tYXgueSwgdG9sZXJhbmNlKSkge1xuICAgICAgICBlZGdlID0gJ2JvdHRvbSc7XG4gICAgfVxuICAgIHJldHVybiBlZGdlO1xufTtcblxuR0xCdWlsZGVycy5zZXRUaWxlU2NhbGUgPSBmdW5jdGlvbiAoc2NhbGUpXG57XG4gICAgR0xCdWlsZGVycy50aWxlX2JvdW5kcyA9IFtcbiAgICAgICAgUG9pbnQoMCwgMCksXG4gICAgICAgIFBvaW50KHNjYWxlLCAtc2NhbGUpIC8vIFRPRE86IGNvcnJlY3QgZm9yIGZsaXBwZWQgeS1heGlzP1xuICAgIF07XG59O1xuXG5HTEJ1aWxkZXJzLnZhbHVlc1dpdGhpblRvbGVyYW5jZSA9IGZ1bmN0aW9uIChhLCBiLCB0b2xlcmFuY2UpXG57XG4gICAgdG9sZXJhbmNlID0gdG9sZXJhbmNlIHx8IDE7XG4gICAgcmV0dXJuIChNYXRoLmFicyhhIC0gYikgPCB0b2xlcmFuY2UpO1xufTtcblxuLy8gQnVpbGQgYSB6aWd6YWcgbGluZSBwYXR0ZXJuIGZvciB0ZXN0aW5nIGpvaW5zIGFuZCBjYXBzXG5HTEJ1aWxkZXJzLmJ1aWxkWmlnemFnTGluZVRlc3RQYXR0ZXJuID0gZnVuY3Rpb24gKClcbntcbiAgICB2YXIgbWluID0gUG9pbnQoMCwgMCk7IC8vIHRpbGUubWluO1xuICAgIHZhciBtYXggPSBQb2ludCg0MDk2LCA0MDk2KTsgLy8gdGlsZS5tYXg7XG4gICAgdmFyIGcgPSB7XG4gICAgICAgIGlkOiAxMjMsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgICB0eXBlOiAnTGluZVN0cmluZycsXG4gICAgICAgICAgICBjb29yZGluYXRlczogW1xuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNzUgKyBtYXgueCAqIDAuMjUsIG1pbi55ICogMC43NSArIG1heC55ICogMC4yNV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC43NSArIG1heC54ICogMC4yNSwgbWluLnkgKiAwLjUgKyBtYXgueSAqIDAuNV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC4yNSArIG1heC54ICogMC43NSwgbWluLnkgKiAwLjc1ICsgbWF4LnkgKiAwLjI1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjI1ICsgbWF4LnggKiAwLjc1LCBtaW4ueSAqIDAuMjUgKyBtYXgueSAqIDAuNzVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNCArIG1heC54ICogMC42LCBtaW4ueSAqIDAuNSArIG1heC55ICogMC41XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjUgKyBtYXgueCAqIDAuNSwgbWluLnkgKiAwLjI1ICsgbWF4LnkgKiAwLjc1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjc1ICsgbWF4LnggKiAwLjI1LCBtaW4ueSAqIDAuMjUgKyBtYXgueSAqIDAuNzVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNzUgKyBtYXgueCAqIDAuMjUsIG1pbi55ICogMC40ICsgbWF4LnkgKiAwLjZdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIGtpbmQ6ICdkZWJ1ZydcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gY29uc29sZS5sb2coZy5nZW9tZXRyeS5jb29yZGluYXRlcyk7XG4gICAgcmV0dXJuIGc7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdMQnVpbGRlcnM7XG59XG4iLCIvKioqIE1hbmFnZSByZW5kZXJpbmcgZm9yIHByaW1pdGl2ZXMgKioqL1xudmFyIEdMID0gcmVxdWlyZSgnLi9nbC5qcycpO1xudmFyIEdMVmVydGV4TGF5b3V0ID0gcmVxdWlyZSgnLi9nbF92ZXJ0ZXhfbGF5b3V0LmpzJyk7XG4vLyB2YXIgR0xWZXJ0ZXhBcnJheU9iamVjdCA9IHJlcXVpcmUoJy4vZ2xfdmFvLmpzJyk7XG52YXIgR0xQcm9ncmFtID0gcmVxdWlyZSgnLi9nbF9wcm9ncmFtLmpzJyk7XG5cbi8vIEEgc2luZ2xlIG1lc2gvVkJPLCBkZXNjcmliZWQgYnkgYSB2ZXJ0ZXggbGF5b3V0LCB0aGF0IGNhbiBiZSBkcmF3biB3aXRoIG9uZSBvciBtb3JlIHByb2dyYW1zXG5mdW5jdGlvbiBHTEdlb21ldHJ5IChnbCwgdmVydGV4X2RhdGEsIHZlcnRleF9sYXlvdXQsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB0aGlzLmdsID0gZ2w7XG4gICAgdGhpcy52ZXJ0ZXhfZGF0YSA9IHZlcnRleF9kYXRhOyAvLyBGbG9hdDMyQXJyYXlcbiAgICB0aGlzLnZlcnRleF9sYXlvdXQgPSB2ZXJ0ZXhfbGF5b3V0O1xuICAgIHRoaXMuYnVmZmVyID0gdGhpcy5nbC5jcmVhdGVCdWZmZXIoKTtcbiAgICB0aGlzLmRyYXdfbW9kZSA9IG9wdGlvbnMuZHJhd19tb2RlIHx8IHRoaXMuZ2wuVFJJQU5HTEVTO1xuICAgIHRoaXMuZGF0YV91c2FnZSA9IG9wdGlvbnMuZGF0YV91c2FnZSB8fCB0aGlzLmdsLlNUQVRJQ19EUkFXO1xuICAgIHRoaXMudmVydGljZXNfcGVyX2dlb21ldHJ5ID0gMzsgLy8gVE9ETzogc3VwcG9ydCBsaW5lcywgc3RyaXAsIGZhbiwgZXRjLlxuXG4gICAgdGhpcy52ZXJ0ZXhfY291bnQgPSB0aGlzLnZlcnRleF9kYXRhLmJ5dGVMZW5ndGggLyB0aGlzLnZlcnRleF9sYXlvdXQuc3RyaWRlO1xuICAgIHRoaXMuZ2VvbWV0cnlfY291bnQgPSB0aGlzLnZlcnRleF9jb3VudCAvIHRoaXMudmVydGljZXNfcGVyX2dlb21ldHJ5O1xuXG4gICAgLy8gVE9ETzogZGlzYWJsaW5nIFZBT3MgZm9yIG5vdyBiZWNhdXNlIHdlIG5lZWQgdG8gc3VwcG9ydCBkaWZmZXJlbnQgdmVydGV4IGxheW91dCArIHByb2dyYW0gY29tYmluYXRpb25zLFxuICAgIC8vIHdoZXJlIG5vdCBhbGwgcHJvZ3JhbXMgd2lsbCByZWNvZ25pemUgYWxsIGF0dHJpYnV0ZXMgKGUuZy4gZmVhdHVyZSBzZWxlY3Rpb24gc2hhZGVycyBpbmNsdWRlIGV4dHJhIGF0dHJpYikuXG4gICAgLy8gVG8gc3VwcG9ydCBWQU9zIGhlcmUsIHdvdWxkIG5lZWQgdG8gc3VwcG9ydCBtdWx0aXBsZSBwZXIgZ2VvbWV0cnksIGtleWVkIGJ5IEdMIHByb2dyYW0/XG4gICAgLy8gdGhpcy52YW8gPSBHTFZlcnRleEFycmF5T2JqZWN0LmNyZWF0ZShmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgLy8gICAgIHRoaXMuc2V0dXAoKTtcbiAgICAvLyB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgdGhpcy5nbC5idWZmZXJEYXRhKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLnZlcnRleF9kYXRhLCB0aGlzLmRhdGFfdXNhZ2UpO1xufVxuXG4vLyBSZW5kZXIsIGJ5IGRlZmF1bHQgd2l0aCBjdXJyZW50bHkgYm91bmQgcHJvZ3JhbSwgb3Igb3RoZXJ3aXNlIHdpdGggb3B0aW9uYWxseSBwcm92aWRlZCBvbmVcbkdMR2VvbWV0cnkucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgLy8gR0xWZXJ0ZXhBcnJheU9iamVjdC5iaW5kKHRoaXMudmFvKTtcblxuICAgIGlmICh0eXBlb2YgdGhpcy5fcmVuZGVyX3NldHVwID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyX3NldHVwKCk7XG4gICAgfVxuXG4gICAgdmFyIGdsX3Byb2dyYW0gPSBvcHRpb25zLmdsX3Byb2dyYW0gfHwgR0xQcm9ncmFtLmN1cnJlbnQ7XG4gICAgZ2xfcHJvZ3JhbS51c2UoKTtcblxuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXIpO1xuICAgIHRoaXMudmVydGV4X2xheW91dC5lbmFibGUodGhpcy5nbCwgZ2xfcHJvZ3JhbSk7XG5cbiAgICAvLyBUT0RPOiBzdXBwb3J0IGVsZW1lbnQgYXJyYXkgbW9kZVxuICAgIHRoaXMuZ2wuZHJhd0FycmF5cyh0aGlzLmRyYXdfbW9kZSwgMCwgdGhpcy52ZXJ0ZXhfY291bnQpO1xuICAgIC8vIEdMVmVydGV4QXJyYXlPYmplY3QuYmluZChudWxsKTtcbn07XG5cbkdMR2VvbWV0cnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKVxue1xuICAgIGNvbnNvbGUubG9nKFwiR0xHZW9tZXRyeS5kZXN0cm95OiBkZWxldGUgYnVmZmVyIG9mIHNpemUgXCIgKyB0aGlzLnZlcnRleF9kYXRhLmJ5dGVMZW5ndGgpO1xuICAgIHRoaXMuZ2wuZGVsZXRlQnVmZmVyKHRoaXMuYnVmZmVyKTtcbiAgICBkZWxldGUgdGhpcy52ZXJ0ZXhfZGF0YTtcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gR0xHZW9tZXRyeTtcbn1cbiIsIi8vIFJlbmRlcmluZyBtb2Rlc1xuXG52YXIgR0wgPSByZXF1aXJlKCcuL2dsLmpzJyk7XG52YXIgR0xCdWlsZGVycyA9IHJlcXVpcmUoJy4vZ2xfYnVpbGRlcnMuanMnKTtcbnZhciBHTEdlb21ldHJ5ID0gcmVxdWlyZSgnLi9nbF9nZW9tLmpzJyk7XG52YXIgR0xWZXJ0ZXhMYXlvdXQgPSByZXF1aXJlKCcuL2dsX3ZlcnRleF9sYXlvdXQuanMnKTtcbnZhciBHTFByb2dyYW0gPSByZXF1aXJlKCcuL2dsX3Byb2dyYW0uanMnKTtcbnZhciBzaGFkZXJfc291cmNlcyA9IHJlcXVpcmUoJy4vZ2xfc2hhZGVycy5qcycpOyAvLyBidWlsdC1pbiBzaGFkZXJzXG5cbnZhciBRdWV1ZSA9IHJlcXVpcmUoJ3F1ZXVlLWFzeW5jJyk7XG5cbi8vIEJhc2VcblxudmFyIFJlbmRlck1vZGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKGdsKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy5tYWtlR0xQcm9ncmFtKCk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9pbml0ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgcmVmcmVzaDogZnVuY3Rpb24gKCkgeyAvLyBUT0RPOiBzaG91bGQgdGhpcyBiZSBhc3luYy9ub24tYmxvY2tpbmc/XG4gICAgICAgIHRoaXMubWFrZUdMUHJvZ3JhbSgpO1xuICAgIH0sXG4gICAgZGVmaW5lczoge30sXG4gICAgc2VsZWN0aW9uOiBmYWxzZSxcbiAgICBidWlsZFBvbHlnb25zOiBmdW5jdGlvbigpe30sIC8vIGJ1aWxkIGZ1bmN0aW9ucyBhcmUgbm8tb3BzIHVudGlsIG92ZXJyaWRlblxuICAgIGJ1aWxkTGluZXM6IGZ1bmN0aW9uKCl7fSxcbiAgICBidWlsZFBvaW50czogZnVuY3Rpb24oKXt9LFxuICAgIG1ha2VHTEdlb21ldHJ5OiBmdW5jdGlvbiAodmVydGV4X2RhdGEpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBHTEdlb21ldHJ5KHRoaXMuZ2wsIHZlcnRleF9kYXRhLCB0aGlzLnZlcnRleF9sYXlvdXQpO1xuICAgIH1cbn07XG5cblJlbmRlck1vZGUubWFrZUdMUHJvZ3JhbSA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gY29uc29sZS5sb2codGhpcy5uYW1lICsgXCI6IFwiICsgXCJzdGFydCBidWlsZGluZ1wiKTtcbiAgICB2YXIgcXVldWUgPSBRdWV1ZSgpO1xuXG4gICAgLy8gQnVpbGQgZGVmaW5lcyAmIGZvciBzZWxlY3Rpb24gKG5lZWQgdG8gY3JlYXRlIGEgbmV3IG9iamVjdCBzaW5jZSB0aGUgZmlyc3QgaXMgc3RvcmVkIGFzIGEgcmVmZXJlbmNlIGJ5IHRoZSBwcm9ncmFtKVxuICAgIHZhciBkZWZpbmVzID0gdGhpcy5idWlsZERlZmluZUxpc3QoKTtcbiAgICBpZiAodGhpcy5zZWxlY3Rpb24pIHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbl9kZWZpbmVzID0gT2JqZWN0LmNyZWF0ZShkZWZpbmVzKTtcbiAgICAgICAgc2VsZWN0aW9uX2RlZmluZXNbJ0ZFQVRVUkVfU0VMRUNUSU9OJ10gPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIEdldCBhbnkgY3VzdG9tIGNvZGUgdHJhbnNmb3Jtc1xuICAgIHZhciB0cmFuc2Zvcm1zID0gKHRoaXMuc2hhZGVycyAmJiB0aGlzLnNoYWRlcnMudHJhbnNmb3Jtcyk7XG5cbiAgICAvLyBDcmVhdGUgc2hhZGVycyAtIHByb2dyYW1zIG1heSBwb2ludCB0byBpbmhlcml0ZWQgcGFyZW50IHByb3BlcnRpZXMsIGJ1dCBzaG91bGQgYmUgcmVwbGFjZWQgYnkgc3ViY2xhc3MgdmVyc2lvblxuICAgIHZhciBwcm9ncmFtID0gKHRoaXMuaGFzT3duUHJvcGVydHkoJ2dsX3Byb2dyYW0nKSAmJiB0aGlzLmdsX3Byb2dyYW0pO1xuICAgIHZhciBzZWxlY3Rpb25fcHJvZ3JhbSA9ICh0aGlzLmhhc093blByb3BlcnR5KCdzZWxlY3Rpb25fZ2xfcHJvZ3JhbScpICYmIHRoaXMuc2VsZWN0aW9uX2dsX3Byb2dyYW0pO1xuXG4gICAgcXVldWUuZGVmZXIoZnVuY3Rpb24oY29tcGxldGUpIHtcbiAgICAgICAgaWYgKCFwcm9ncmFtKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIjogXCIgKyBcImluc3RhbnRpYXRlXCIpO1xuICAgICAgICAgICAgcHJvZ3JhbSA9IG5ldyBHTFByb2dyYW0oXG4gICAgICAgICAgICAgICAgdGhpcy5nbCxcbiAgICAgICAgICAgICAgICBzaGFkZXJfc291cmNlc1t0aGlzLnZlcnRleF9zaGFkZXJfa2V5XSxcbiAgICAgICAgICAgICAgICBzaGFkZXJfc291cmNlc1t0aGlzLmZyYWdtZW50X3NoYWRlcl9rZXldLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmaW5lczogZGVmaW5lcyxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtczogdHJhbnNmb3JtcyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogY29tcGxldGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5uYW1lICsgXCI6IFwiICsgXCJyZS1jb21waWxlXCIpO1xuICAgICAgICAgICAgcHJvZ3JhbS5kZWZpbmVzID0gZGVmaW5lcztcbiAgICAgICAgICAgIHByb2dyYW0udHJhbnNmb3JtcyA9IHRyYW5zZm9ybXM7XG4gICAgICAgICAgICBwcm9ncmFtLmNvbXBpbGUoY29tcGxldGUpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIGlmICh0aGlzLnNlbGVjdGlvbikge1xuICAgICAgICBxdWV1ZS5kZWZlcihmdW5jdGlvbihjb21wbGV0ZSkge1xuICAgICAgICAgICAgaWYgKCFzZWxlY3Rpb25fcHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwic2VsZWN0aW9uIGluc3RhbnRpYXRlXCIpO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtID0gbmV3IEdMUHJvZ3JhbShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbCxcbiAgICAgICAgICAgICAgICAgICAgc2hhZGVyX3NvdXJjZXNbdGhpcy52ZXJ0ZXhfc2hhZGVyX2tleV0sXG4gICAgICAgICAgICAgICAgICAgIHNoYWRlcl9zb3VyY2VzWydzZWxlY3Rpb25fZnJhZ21lbnQnXSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5lczogc2VsZWN0aW9uX2RlZmluZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1zOiB0cmFuc2Zvcm1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogKHRoaXMubmFtZSArICcgKHNlbGVjdGlvbiknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwic2VsZWN0aW9uIHJlLWNvbXBpbGVcIik7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uX3Byb2dyYW0uZGVmaW5lcyA9IHNlbGVjdGlvbl9kZWZpbmVzO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtLnRyYW5zZm9ybXMgPSB0cmFuc2Zvcm1zO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtLmNvbXBpbGUoY29tcGxldGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8vIFdhaXQgZm9yIHByb2dyYW0ocykgdG8gY29tcGlsZSBiZWZvcmUgcmVwbGFjaW5nIHRoZW1cbiAgICAvLyBUT0RPOiBzaG91bGQgdGhpcyBlbnRpcmUgbWV0aG9kIG9mZmVyIGEgY2FsbGJhY2sgZm9yIHdoZW4gY29tcGlsYXRpb24gY29tcGxldGVzP1xuICAgIHF1ZXVlLmF3YWl0KGZ1bmN0aW9uKCkge1xuICAgICAgIGlmIChwcm9ncmFtKSB7XG4gICAgICAgICAgIHRoaXMuZ2xfcHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgfVxuXG4gICAgICAgaWYgKHNlbGVjdGlvbl9wcm9ncmFtKSB7XG4gICAgICAgICAgIHRoaXMuc2VsZWN0aW9uX2dsX3Byb2dyYW0gPSBzZWxlY3Rpb25fcHJvZ3JhbTtcbiAgICAgICB9XG5cbiAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIjogXCIgKyBcImZpbmlzaGVkIGJ1aWxkaW5nXCIpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59XG5cbi8vIFRPRE86IGNvdWxkIHByb2JhYmx5IGNvbWJpbmUgYW5kIGdlbmVyYWxpemUgdGhpcyB3aXRoIHNpbWlsYXIgbWV0aG9kIGluIEdMUHJvZ3JhbVxuLy8gKGxpc3Qgb2YgZGVmaW5lIG9iamVjdHMgdGhhdCBpbmhlcml0IGZyb20gZWFjaCBvdGhlcilcblJlbmRlck1vZGUuYnVpbGREZWZpbmVMaXN0ID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBBZGQgYW55IGN1c3RvbSBkZWZpbmVzIHRvIGJ1aWx0LWluIG1vZGUgZGVmaW5lc1xuICAgIHZhciBkZWZpbmVzID0ge307IC8vIGNyZWF0ZSBhIG5ldyBvYmplY3QgdG8gYXZvaWQgbXV0YXRpbmcgYSBwcm90b3R5cGUgdmFsdWUgdGhhdCBtYXkgYmUgc2hhcmVkIHdpdGggb3RoZXIgbW9kZXNcbiAgICBpZiAodGhpcy5kZWZpbmVzICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgZCBpbiB0aGlzLmRlZmluZXMpIHtcbiAgICAgICAgICAgIGRlZmluZXNbZF0gPSB0aGlzLmRlZmluZXNbZF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuc2hhZGVycyAhPSBudWxsICYmIHRoaXMuc2hhZGVycy5kZWZpbmVzICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgZCBpbiB0aGlzLnNoYWRlcnMuZGVmaW5lcykge1xuICAgICAgICAgICAgZGVmaW5lc1tkXSA9IHRoaXMuc2hhZGVycy5kZWZpbmVzW2RdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZWZpbmVzO1xufTtcblxuLy8gU2V0IG1vZGUgdW5pZm9ybXMgb24gY3VycmVudGx5IGJvdW5kIHByb2dyYW1cblJlbmRlck1vZGUuc2V0VW5pZm9ybXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBnbF9wcm9ncmFtID0gR0xQcm9ncmFtLmN1cnJlbnQ7XG4gICAgaWYgKGdsX3Byb2dyYW0gIT0gbnVsbCAmJiB0aGlzLnNoYWRlcnMgIT0gbnVsbCAmJiB0aGlzLnNoYWRlcnMudW5pZm9ybXMgIT0gbnVsbCkge1xuICAgICAgICBnbF9wcm9ncmFtLnNldFVuaWZvcm1zKHRoaXMuc2hhZGVycy51bmlmb3Jtcyk7XG4gICAgfVxufTtcblxuUmVuZGVyTW9kZS51cGRhdGUgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIE1vZGUtc3BlY2lmaWMgYW5pbWF0aW9uXG4gICAgaWYgKHR5cGVvZiB0aGlzLmFuaW1hdGlvbiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uKCk7XG4gICAgfVxufTtcblxuXG52YXIgTW9kZXMgPSB7fTtcbnZhciBNb2RlTWFuYWdlciA9IHt9O1xuXG4vLyBVcGRhdGUgYnVpbHQtaW4gbW9kZSBvciBjcmVhdGUgYSBuZXcgb25lXG5Nb2RlTWFuYWdlci5jb25maWd1cmVNb2RlID0gZnVuY3Rpb24gKG5hbWUsIHNldHRpbmdzKVxue1xuICAgIE1vZGVzW25hbWVdID0gTW9kZXNbbmFtZV0gfHwgT2JqZWN0LmNyZWF0ZShNb2Rlc1tzZXR0aW5ncy5leHRlbmRzXSB8fCBSZW5kZXJNb2RlKTtcbiAgICBpZiAoTW9kZXNbc2V0dGluZ3MuZXh0ZW5kc10pIHtcbiAgICAgICAgTW9kZXNbbmFtZV0ucGFyZW50ID0gTW9kZXNbc2V0dGluZ3MuZXh0ZW5kc107IC8vIGV4cGxpY2l0ICdzdXBlcicgY2xhc3MgYWNjZXNzXG4gICAgfVxuXG4gICAgZm9yICh2YXIgcyBpbiBzZXR0aW5ncykge1xuICAgICAgICBNb2Rlc1tuYW1lXVtzXSA9IHNldHRpbmdzW3NdO1xuICAgIH1cblxuICAgIE1vZGVzW25hbWVdLm5hbWUgPSBuYW1lO1xuICAgIHJldHVybiBNb2Rlc1tuYW1lXTtcbn07XG5cblxuLy8gQnVpbHQtaW4gcmVuZGVyaW5nIG1vZGVzXG5cbi8qKiogUGxhaW4gcG9seWdvbnMgKioqL1xuXG5Nb2Rlcy5wb2x5Z29ucyA9IE9iamVjdC5jcmVhdGUoUmVuZGVyTW9kZSk7XG5Nb2Rlcy5wb2x5Z29ucy5uYW1lID0gJ3BvbHlnb25zJztcblxuTW9kZXMucG9seWdvbnMudmVydGV4X3NoYWRlcl9rZXkgPSAncG9seWdvbl92ZXJ0ZXgnO1xuTW9kZXMucG9seWdvbnMuZnJhZ21lbnRfc2hhZGVyX2tleSA9ICdwb2x5Z29uX2ZyYWdtZW50JztcblxuTW9kZXMucG9seWdvbnMuZGVmaW5lcyA9IHtcbiAgICAnV09STERfUE9TSVRJT05fV1JBUCc6IDEwMDAwMCAvLyBkZWZhdWx0IHdvcmxkIGNvb3JkcyB0byB3cmFwIGV2ZXJ5IDEwMCwwMDAgbWV0ZXJzLCBjYW4gdHVybiBvZmYgYnkgc2V0dGluZyB0aGlzIHRvICdmYWxzZSdcbn07XG5cbk1vZGVzLnBvbHlnb25zLnNlbGVjdGlvbiA9IHRydWU7XG5cbk1vZGVzLnBvbHlnb25zLl9pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmVydGV4X2xheW91dCA9IG5ldyBHTFZlcnRleExheW91dCh0aGlzLmdsLCBbXG4gICAgICAgIHsgbmFtZTogJ2FfcG9zaXRpb24nLCBzaXplOiAzLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX25vcm1hbCcsIHNpemU6IDMsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2FfY29sb3InLCBzaXplOiAzLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX3NlbGVjdGlvbl9jb2xvcicsIHNpemU6IDQsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2FfbGF5ZXInLCBzaXplOiAxLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9XG4gICAgXSk7XG59O1xuXG5Nb2Rlcy5wb2x5Z29ucy5idWlsZFBvbHlnb25zID0gZnVuY3Rpb24gKHBvbHlnb25zLCBzdHlsZSwgdmVydGV4X2RhdGEpXG57XG4gICAgLy8gQ29sb3IgYW5kIGxheWVyIG51bWJlciBhcmUgY3VycmVudGx5IGNvbnN0YW50IGFjcm9zcyB2ZXJ0aWNlc1xuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICBzdHlsZS5jb2xvclswXSwgc3R5bGUuY29sb3JbMV0sIHN0eWxlLmNvbG9yWzJdLFxuICAgICAgICBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMF0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsxXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzJdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbM10sXG4gICAgICAgIHN0eWxlLmxheWVyX251bVxuICAgIF07XG5cbiAgICAvLyBPdXRsaW5lcyBoYXZlIGEgc2xpZ2h0bHkgZGlmZmVyZW50IHNldCBvZiBjb25zdGFudHMsIGJlY2F1c2UgdGhlIGxheWVyIG51bWJlciBpcyBtb2RpZmllZFxuICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yKSB7XG4gICAgICAgIHZhciBvdXRsaW5lX3ZlcnRleF9jb25zdGFudHMgPSBbXG4gICAgICAgICAgICBzdHlsZS5vdXRsaW5lLmNvbG9yWzBdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzFdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzJdLFxuICAgICAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICAgICAgc3R5bGUubGF5ZXJfbnVtIC0gMC41IC8vIG91dGxpbmVzIHNpdCBiZXR3ZWVuIGxheWVycywgdW5kZXJuZWF0aCBjdXJyZW50IGxheWVyIGJ1dCBhYm92ZSB0aGUgb25lIGJlbG93XG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgLy8gRXh0cnVkZWQgcG9seWdvbnMgKGUuZy4gM0QgYnVpbGRpbmdzKVxuICAgIGlmIChzdHlsZS5leHRydWRlICYmIHN0eWxlLmhlaWdodCkge1xuICAgICAgICBHTEJ1aWxkZXJzLmJ1aWxkRXh0cnVkZWRQb2x5Z29ucyhcbiAgICAgICAgICAgIHBvbHlnb25zLFxuICAgICAgICAgICAgc3R5bGUueixcbiAgICAgICAgICAgIHN0eWxlLmhlaWdodCxcbiAgICAgICAgICAgIHN0eWxlLm1pbl9oZWlnaHQsXG4gICAgICAgICAgICB2ZXJ0ZXhfZGF0YSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzOiB2ZXJ0ZXhfY29uc3RhbnRzXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuICAgIC8vIFJlZ3VsYXIgcG9seWdvbnNcbiAgICBlbHNlIHtcbiAgICAgICAgR0xCdWlsZGVycy5idWlsZFBvbHlnb25zKFxuICAgICAgICAgICAgcG9seWdvbnMsXG4gICAgICAgICAgICBzdHlsZS56LFxuICAgICAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbm9ybWFsczogdHJ1ZSxcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzOiB2ZXJ0ZXhfY29uc3RhbnRzXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gQ2FsbGJhY2stYmFzZSBidWlsZGVyIChmb3IgZnV0dXJlIGV4cGxvcmF0aW9uKVxuICAgICAgICAvLyB2YXIgbm9ybWFsX3ZlcnRleF9jb25zdGFudHMgPSBbMCwgMCwgMV0uY29uY2F0KHZlcnRleF9jb25zdGFudHMpO1xuICAgICAgICAvLyBHTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMyKFxuICAgICAgICAvLyAgICAgcG9seWdvbnMsXG4gICAgICAgIC8vICAgICB6LFxuICAgICAgICAvLyAgICAgZnVuY3Rpb24gKHZlcnRpY2VzKSB7XG4gICAgICAgIC8vICAgICAgICAgLy8gdmFyIHZzID0gdmVydGljZXMucG9zaXRpb25zO1xuICAgICAgICAvLyAgICAgICAgIC8vIGZvciAodmFyIHYgaW4gdnMpIHtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgLy8gdmFyIGJjID0gWyh2ICUgMykgPyAwIDogMSwgKCh2ICsgMSkgJSAzKSA/IDAgOiAxLCAoKHYgKyAyKSAlIDMpID8gMCA6IDFdO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAvLyB2YXIgYmMgPSBbY2VudHJvaWQueCwgY2VudHJvaWQueSwgMF07XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vIHZzW3ZdID0gdmVydGljZXMucG9zaXRpb25zW3ZdLmNvbmNhdCh6LCAwLCAwLCAxLCBiYyk7XG5cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgLy8gdnNbdl0gPSB2ZXJ0aWNlcy5wb3NpdGlvbnNbdl0uY29uY2F0KHosIDAsIDAsIDEpO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICB2c1t2XSA9IHZlcnRpY2VzLnBvc2l0aW9uc1t2XS5jb25jYXQoMCwgMCwgMSk7XG4gICAgICAgIC8vICAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vICAgICAgICAgR0wuYWRkVmVydGljZXModmVydGljZXMucG9zaXRpb25zLCBub3JtYWxfdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuXG4gICAgICAgIC8vICAgICAgICAgLy8gR0wuYWRkVmVydGljZXNCeUF0dHJpYnV0ZUxheW91dChcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgW1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgeyBuYW1lOiAnYV9wb3NpdGlvbicsIGRhdGE6IHZlcnRpY2VzLnBvc2l0aW9ucyB9LFxuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgeyBuYW1lOiAnYV9ub3JtYWwnLCBkYXRhOiBbMCwgMCwgMV0gfSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHsgbmFtZTogJ2FfY29sb3InLCBkYXRhOiBbc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXV0gfSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHsgbmFtZTogJ2FfbGF5ZXInLCBkYXRhOiBzdHlsZS5sYXllcl9udW0gfVxuICAgICAgICAvLyAgICAgICAgIC8vICAgICBdLFxuICAgICAgICAvLyAgICAgICAgIC8vICAgICB2ZXJ0ZXhfZGF0YVxuICAgICAgICAvLyAgICAgICAgIC8vICk7XG5cbiAgICAgICAgLy8gICAgICAgICAvLyBHTC5hZGRWZXJ0aWNlc011bHRpcGxlQXR0cmlidXRlcyhbdmVydGljZXMucG9zaXRpb25zXSwgbm9ybWFsX3ZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gKTtcbiAgICB9XG5cbiAgICAvLyBQb2x5Z29uIG91dGxpbmVzXG4gICAgaWYgKHN0eWxlLm91dGxpbmUuY29sb3IgJiYgc3R5bGUub3V0bGluZS53aWR0aCkge1xuICAgICAgICBmb3IgKHZhciBtcGM9MDsgbXBjIDwgcG9seWdvbnMubGVuZ3RoOyBtcGMrKykge1xuICAgICAgICAgICAgR0xCdWlsZGVycy5idWlsZFBvbHlsaW5lcyhcbiAgICAgICAgICAgICAgICBwb2x5Z29uc1ttcGNdLFxuICAgICAgICAgICAgICAgIHN0eWxlLnosXG4gICAgICAgICAgICAgICAgc3R5bGUub3V0bGluZS53aWR0aCxcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhfZGF0YSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNsb3NlZF9wb2x5Z29uOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICByZW1vdmVfdGlsZV9lZGdlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogb3V0bGluZV92ZXJ0ZXhfY29uc3RhbnRzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbk1vZGVzLnBvbHlnb25zLmJ1aWxkTGluZXMgPSBmdW5jdGlvbiAobGluZXMsIHN0eWxlLCB2ZXJ0ZXhfZGF0YSlcbntcbiAgICAvLyBUT09EOiByZWR1Y2UgcmVkdW5kYW5jeSBvZiBjb25zdGFudCBjYWxjIGJldHdlZW4gYnVpbGRlcnNcbiAgICAvLyBDb2xvciBhbmQgbGF5ZXIgbnVtYmVyIGFyZSBjdXJyZW50bHkgY29uc3RhbnQgYWNyb3NzIHZlcnRpY2VzXG4gICAgdmFyIHZlcnRleF9jb25zdGFudHMgPSBbXG4gICAgICAgIHN0eWxlLmNvbG9yWzBdLCBzdHlsZS5jb2xvclsxXSwgc3R5bGUuY29sb3JbMl0sXG4gICAgICAgIHN0eWxlLnNlbGVjdGlvbi5jb2xvclswXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzFdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMl0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclszXSxcbiAgICAgICAgc3R5bGUubGF5ZXJfbnVtXG4gICAgXTtcblxuICAgIC8vIE91dGxpbmVzIGhhdmUgYSBzbGlnaHRseSBkaWZmZXJlbnQgc2V0IG9mIGNvbnN0YW50cywgYmVjYXVzZSB0aGUgbGF5ZXIgbnVtYmVyIGlzIG1vZGlmaWVkXG4gICAgaWYgKHN0eWxlLm91dGxpbmUuY29sb3IpIHtcbiAgICAgICAgdmFyIG91dGxpbmVfdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgICAgIHN0eWxlLm91dGxpbmUuY29sb3JbMF0sIHN0eWxlLm91dGxpbmUuY29sb3JbMV0sIHN0eWxlLm91dGxpbmUuY29sb3JbMl0sXG4gICAgICAgICAgICBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMF0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsxXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzJdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbM10sXG4gICAgICAgICAgICBzdHlsZS5sYXllcl9udW0gLSAwLjUgLy8gb3V0bGluZXMgc2l0IGJldHdlZW4gbGF5ZXJzLCB1bmRlcm5lYXRoIGN1cnJlbnQgbGF5ZXIgYnV0IGFib3ZlIHRoZSBvbmUgYmVsb3dcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICAvLyBNYWluIGxpbmVzXG4gICAgR0xCdWlsZGVycy5idWlsZFBvbHlsaW5lcyhcbiAgICAgICAgbGluZXMsXG4gICAgICAgIHN0eWxlLnosXG4gICAgICAgIHN0eWxlLndpZHRoLFxuICAgICAgICB2ZXJ0ZXhfZGF0YSxcbiAgICAgICAge1xuICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIExpbmUgb3V0bGluZXNcbiAgICBpZiAoc3R5bGUub3V0bGluZS5jb2xvciAmJiBzdHlsZS5vdXRsaW5lLndpZHRoKSB7XG4gICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMoXG4gICAgICAgICAgICBsaW5lcyxcbiAgICAgICAgICAgIHN0eWxlLnosXG4gICAgICAgICAgICBzdHlsZS53aWR0aCArIDIgKiBzdHlsZS5vdXRsaW5lLndpZHRoLFxuICAgICAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogb3V0bGluZV92ZXJ0ZXhfY29uc3RhbnRzXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxufTtcblxuTW9kZXMucG9seWdvbnMuYnVpbGRQb2ludHMgPSBmdW5jdGlvbiAocG9pbnRzLCBzdHlsZSwgdmVydGV4X2RhdGEpXG57XG4gICAgLy8gVE9PRDogcmVkdWNlIHJlZHVuZGFuY3kgb2YgY29uc3RhbnQgY2FsYyBiZXR3ZWVuIGJ1aWxkZXJzXG4gICAgLy8gQ29sb3IgYW5kIGxheWVyIG51bWJlciBhcmUgY3VycmVudGx5IGNvbnN0YW50IGFjcm9zcyB2ZXJ0aWNlc1xuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICBzdHlsZS5jb2xvclswXSwgc3R5bGUuY29sb3JbMV0sIHN0eWxlLmNvbG9yWzJdLFxuICAgICAgICBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMF0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsxXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzJdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbM10sXG4gICAgICAgIHN0eWxlLmxheWVyX251bVxuICAgIF07XG5cbiAgICBHTEJ1aWxkZXJzLmJ1aWxkUXVhZHNGb3JQb2ludHMoXG4gICAgICAgIHBvaW50cyxcbiAgICAgICAgc3R5bGUuc2l6ZSAqIDIsXG4gICAgICAgIHN0eWxlLnNpemUgKiAyLFxuICAgICAgICBzdHlsZS56LFxuICAgICAgICB2ZXJ0ZXhfZGF0YSxcbiAgICAgICAge1xuICAgICAgICAgICAgbm9ybWFsczogdHJ1ZSxcbiAgICAgICAgICAgIHRleGNvb3JkczogZmFsc2UsXG4gICAgICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzOiB2ZXJ0ZXhfY29uc3RhbnRzXG4gICAgICAgIH1cbiAgICApO1xufTtcblxuXG4vKioqIFBvaW50cyB3L3NpbXBsZSBkaXN0YW5jZSBmaWVsZCByZW5kZXJpbmcgKioqL1xuXG5Nb2Rlcy5wb2ludHMgPSBPYmplY3QuY3JlYXRlKFJlbmRlck1vZGUpO1xuTW9kZXMucG9pbnRzLm5hbWUgPSAncG9pbnRzJztcblxuTW9kZXMucG9pbnRzLnZlcnRleF9zaGFkZXJfa2V5ID0gJ3BvaW50X3ZlcnRleCc7XG5Nb2Rlcy5wb2ludHMuZnJhZ21lbnRfc2hhZGVyX2tleSA9ICdwb2ludF9mcmFnbWVudCc7XG5cbk1vZGVzLnBvaW50cy5kZWZpbmVzID0ge1xuICAgICdFRkZFQ1RfU0NSRUVOX0NPTE9SJzogdHJ1ZVxufTtcblxuTW9kZXMucG9pbnRzLnNlbGVjdGlvbiA9IHRydWU7XG5cbk1vZGVzLnBvaW50cy5faW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZlcnRleF9sYXlvdXQgPSBuZXcgR0xWZXJ0ZXhMYXlvdXQodGhpcy5nbCwgW1xuICAgICAgICB7IG5hbWU6ICdhX3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV90ZXhjb29yZCcsIHNpemU6IDIsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2FfY29sb3InLCBzaXplOiAzLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX3NlbGVjdGlvbl9jb2xvcicsIHNpemU6IDQsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2FfbGF5ZXInLCBzaXplOiAxLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9XG4gICAgXSk7XG59O1xuXG5Nb2Rlcy5wb2ludHMuYnVpbGRQb2ludHMgPSBmdW5jdGlvbiAocG9pbnRzLCBzdHlsZSwgdmVydGV4X2RhdGEpXG57XG4gICAgLy8gVE9PRDogcmVkdWNlIHJlZHVuZGFuY3kgb2YgY29uc3RhbnQgY2FsYyBiZXR3ZWVuIGJ1aWxkZXJzXG4gICAgLy8gQ29sb3IgYW5kIGxheWVyIG51bWJlciBhcmUgY3VycmVudGx5IGNvbnN0YW50IGFjcm9zcyB2ZXJ0aWNlc1xuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICBzdHlsZS5jb2xvclswXSwgc3R5bGUuY29sb3JbMV0sIHN0eWxlLmNvbG9yWzJdLFxuICAgICAgICBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMF0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsxXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzJdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbM10sXG4gICAgICAgIHN0eWxlLmxheWVyX251bVxuICAgIF07XG5cbiAgICBHTEJ1aWxkZXJzLmJ1aWxkUXVhZHNGb3JQb2ludHMoXG4gICAgICAgIHBvaW50cyxcbiAgICAgICAgc3R5bGUuc2l6ZSAqIDIsXG4gICAgICAgIHN0eWxlLnNpemUgKiAyLFxuICAgICAgICBzdHlsZS56LFxuICAgICAgICB2ZXJ0ZXhfZGF0YSxcbiAgICAgICAge1xuICAgICAgICAgICAgbm9ybWFsczogZmFsc2UsXG4gICAgICAgICAgICB0ZXhjb29yZHM6IHRydWUsXG4gICAgICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzOiB2ZXJ0ZXhfY29uc3RhbnRzXG4gICAgICAgIH1cbiAgICApO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICAgIE1vZGVNYW5hZ2VyOiBNb2RlTWFuYWdlcixcbiAgICAgICAgTW9kZXM6IE1vZGVzXG4gICAgfTtcbn1cbiIsIi8vIFRoaW4gR0wgcHJvZ3JhbSB3cmFwcCB0byBjYWNoZSB1bmlmb3JtIGxvY2F0aW9ucy92YWx1ZXMsIGRvIGNvbXBpbGUtdGltZSBwcmUtcHJvY2Vzc2luZ1xuLy8gKGluamVjdGluZyAjZGVmaW5lcyBhbmQgI3ByYWdtYSB0cmFuc2Zvcm1zIGludG8gc2hhZGVycyksIGV0Yy5cblxudmFyIEdMID0gcmVxdWlyZSgnLi9nbC5qcycpO1xudmFyIEdMVGV4dHVyZSA9IHJlcXVpcmUoJy4vZ2xfdGV4dHVyZS5qcycpO1xudmFyIFV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcbnZhciBRdWV1ZSA9IHJlcXVpcmUoJ3F1ZXVlLWFzeW5jJyk7XG5cbkdMUHJvZ3JhbS5pZCA9IDA7IC8vIGFzc2lnbiBlYWNoIHByb2dyYW0gYSB1bmlxdWUgaWRcbkdMUHJvZ3JhbS5wcm9ncmFtcyA9IHt9OyAvLyBwcm9ncmFtcywgYnkgaWRcblxuZnVuY3Rpb24gR0xQcm9ncmFtIChnbCwgdmVydGV4X3NoYWRlciwgZnJhZ21lbnRfc2hhZGVyLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5nbCA9IGdsO1xuICAgIHRoaXMucHJvZ3JhbSA9IG51bGw7XG4gICAgdGhpcy5jb21waWxlZCA9IGZhbHNlO1xuICAgIHRoaXMuZGVmaW5lcyA9IG9wdGlvbnMuZGVmaW5lcyB8fCB7fTsgLy8ga2V5L3ZhbHVlcyBpbnNlcnRlZCBhcyAjZGVmaW5lcyBpbnRvIHNoYWRlcnMgYXQgY29tcGlsZS10aW1lXG4gICAgdGhpcy50cmFuc2Zvcm1zID0gb3B0aW9ucy50cmFuc2Zvcm1zOyAvLyBrZXkvdmFsdWVzIGZvciBVUkxzIG9mIGJsb2NrcyB0aGF0IGNhbiBiZSBpbmplY3RlZCBpbnRvIHNoYWRlcnMgYXQgY29tcGlsZS10aW1lXG4gICAgdGhpcy51bmlmb3JtcyA9IHt9OyAvLyBwcm9ncmFtIGxvY2F0aW9ucyBvZiB1bmlmb3Jtcywgc2V0L3VwZGF0ZWQgYXQgY29tcGlsZS10aW1lXG4gICAgdGhpcy5hdHRyaWJzID0ge307IC8vIHByb2dyYW0gbG9jYXRpb25zIG9mIHZlcnRleCBhdHRyaWJ1dGVzXG5cbiAgICB0aGlzLnZlcnRleF9zaGFkZXIgPSB2ZXJ0ZXhfc2hhZGVyO1xuICAgIHRoaXMuZnJhZ21lbnRfc2hhZGVyID0gZnJhZ21lbnRfc2hhZGVyO1xuXG4gICAgdGhpcy5pZCA9IEdMUHJvZ3JhbS5pZCsrO1xuICAgIEdMUHJvZ3JhbS5wcm9ncmFtc1t0aGlzLmlkXSA9IHRoaXM7XG4gICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lOyAvLyBjYW4gcHJvdmlkZSBhIHByb2dyYW0gbmFtZSAodXNlZnVsIGZvciBkZWJ1Z2dpbmcpXG5cbiAgICB0aGlzLmNvbXBpbGUob3B0aW9ucy5jYWxsYmFjayk7XG59O1xuXG4vLyBVc2UgcHJvZ3JhbSB3cmFwcGVyIHdpdGggc2ltcGxlIHN0YXRlIGNhY2hlXG5HTFByb2dyYW0ucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uICgpXG57XG4gICAgaWYgKCF0aGlzLmNvbXBpbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoR0xQcm9ncmFtLmN1cnJlbnQgIT0gdGhpcykge1xuICAgICAgICB0aGlzLmdsLnVzZVByb2dyYW0odGhpcy5wcm9ncmFtKTtcbiAgICB9XG4gICAgR0xQcm9ncmFtLmN1cnJlbnQgPSB0aGlzO1xufTtcbkdMUHJvZ3JhbS5jdXJyZW50ID0gbnVsbDtcblxuLy8gR2xvYmFsIGRlZmluZXMgYXBwbGllZCB0byBhbGwgcHJvZ3JhbXMgKGR1cGxpY2F0ZSBwcm9wZXJ0aWVzIGZvciBhIHNwZWNpZmljIHByb2dyYW0gd2lsbCB0YWtlIHByZWNlZGVuY2UpXG5HTFByb2dyYW0uZGVmaW5lcyA9IHt9O1xuXG5HTFByb2dyYW0ucHJvdG90eXBlLmNvbXBpbGUgPSBmdW5jdGlvbiAoY2FsbGJhY2spXG57XG4gICAgdmFyIHF1ZXVlID0gUXVldWUoKTtcblxuICAgIC8vIENvcHkgc291cmNlcyBmcm9tIHByZS1tb2RpZmllZCB0ZW1wbGF0ZVxuICAgIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciA9IHRoaXMudmVydGV4X3NoYWRlcjtcbiAgICB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlciA9IHRoaXMuZnJhZ21lbnRfc2hhZGVyO1xuXG4gICAgLy8gTWFrZSBsaXN0IG9mIGRlZmluZXMgdG8gYmUgaW5qZWN0ZWQgbGF0ZXJcbiAgICB2YXIgZGVmaW5lcyA9IHRoaXMuYnVpbGREZWZpbmVMaXN0KCk7XG5cbiAgICAvLyBJbmplY3QgdXNlci1kZWZpbmVkIHRyYW5zZm9ybXMgKGFyYml0cmFyeSBjb2RlIHBvaW50cyBtYXRjaGluZyBuYW1lZCAjcHJhZ21hcylcbiAgICAvLyBSZXBsYWNlIGFjY29yZGluZyB0byB0aGlzIHBhdHRlcm46XG4gICAgLy8gI3ByYWdtYSB0YW5ncmFtOiBba2V5XVxuICAgIC8vIGUuZy4gI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXG5cbiAgICAvLyBUT0RPOiBmbGFnIHRvIGF2b2lkIHJlLXJldHJpZXZpbmcgdHJhbnNmb3JtIFVSTHMgb3ZlciBuZXR3b3JrIHdoZW4gcmVidWlsZGluZz9cbiAgICAvLyBUT0RPOiBzdXBwb3J0IGdsc2xpZnkgI3ByYWdtYSBleHBvcnQgbmFtZXMgZm9yIGJldHRlciBjb21wYXRpYmlsaXR5PyAoZS5nLiByZW5hbWUgbWFpbigpIGZ1bmN0aW9ucylcbiAgICAvLyBUT0RPOiBhdXRvLWluc2VydCB1bmlmb3JtcyByZWZlcmVuY2VkIGluIG1vZGUgZGVmaW5pdGlvbiwgYnV0IG5vdCBpbiBzaGFkZXIgYmFzZSBvciB0cmFuc2Zvcm1zPyAocHJvYmxlbTogZG9uJ3QgaGF2ZSBhY2Nlc3MgdG8gdW5pZm9ybSBsaXN0L3R5cGUgaGVyZSlcblxuICAgIC8vIEdhdGhlciBhbGwgdHJhbnNmb3JtIGNvZGUgc25pcHBldHMgKGNhbiBiZSBlaXRoZXIgaW5saW5lIGluIHRoZSBzdHlsZSBmaWxlLCBvciBvdmVyIHRoZSBuZXR3b3JrIHZpYSBVUkwpXG4gICAgLy8gVGhpcyBpcyBhbiBhc3luYyBwcm9jZXNzLCBzaW5jZSBjb2RlIG1heSBiZSByZXRyaWV2ZWQgcmVtb3RlbHlcbiAgICB2YXIgcmVnZXhwO1xuICAgIHZhciBsb2FkZWRfdHJhbnNmb3JtcyA9IHt9OyAvLyBtYXN0ZXIgbGlzdCBvZiB0cmFuc2Zvcm1zLCB3aXRoIGFuIG9yZGVyZWQgbGlzdCBmb3IgZWFjaCAoc2luY2Ugd2Ugd2FudCB0byBndWFyYW50ZWUgb3JkZXIgb2YgdHJhbnNmb3JtcylcbiAgICBpZiAodGhpcy50cmFuc2Zvcm1zICE9IG51bGwpIHtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy50cmFuc2Zvcm1zKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNmb3JtID0gdGhpcy50cmFuc2Zvcm1zW2tleV07XG4gICAgICAgICAgICBpZiAodHJhbnNmb3JtID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRWFjaCBjb2RlIHBvaW50IGNhbiBiZSBhIHNpbmdsZSBpdGVtIChzdHJpbmcgb3IgaGFzaCBvYmplY3QpIG9yIGEgbGlzdCAoYXJyYXkgb2JqZWN0IHdpdGggbm9uLXplcm8gbGVuZ3RoKVxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0cmFuc2Zvcm0gPT0gJ3N0cmluZycgfHwgKHR5cGVvZiB0cmFuc2Zvcm0gPT0gJ29iamVjdCcgJiYgdHJhbnNmb3JtLmxlbmd0aCA9PSBudWxsKSkge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybSA9IFt0cmFuc2Zvcm1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGaXJzdCBmaW5kIGNvZGUgcmVwbGFjZSBwb2ludHMgaW4gc2hhZGVyc1xuICAgICAgICAgICAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoJ15cXFxccyojcHJhZ21hXFxcXHMrdGFuZ3JhbTpcXFxccysnICsga2V5ICsgJ1xcXFxzKiQnLCAnbScpO1xuICAgICAgICAgICAgdmFyIGluamVjdF92ZXJ0ZXggPSB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIubWF0Y2gocmVnZXhwKTtcbiAgICAgICAgICAgIHZhciBpbmplY3RfZnJhZ21lbnQgPSB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlci5tYXRjaChyZWdleHApO1xuXG4gICAgICAgICAgICAvLyBBdm9pZCBuZXR3b3JrIHJlcXVlc3QgaWYgbm90aGluZyB0byByZXBsYWNlXG4gICAgICAgICAgICBpZiAoaW5qZWN0X3ZlcnRleCA9PSBudWxsICYmIGluamVjdF9mcmFnbWVudCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENvbGxlY3QgYWxsIHRyYW5zZm9ybXMgZm9yIHRoaXMgdHlwZVxuICAgICAgICAgICAgbG9hZGVkX3RyYW5zZm9ybXNba2V5XSA9IHt9O1xuICAgICAgICAgICAgbG9hZGVkX3RyYW5zZm9ybXNba2V5XS5yZWdleHAgPSBuZXcgUmVnRXhwKHJlZ2V4cCk7IC8vIHNhdmUgcmVnZXhwIHNvIHdlIGNhbiBpbmplY3QgbGF0ZXIgd2l0aG91dCBoYXZpbmcgdG8gcmVjcmVhdGUgaXRcbiAgICAgICAgICAgIGxvYWRlZF90cmFuc2Zvcm1zW2tleV0uaW5qZWN0X3ZlcnRleCA9IChpbmplY3RfdmVydGV4ICE9IG51bGwpOyAvLyBzYXZlIHJlZ2V4cCBjb2RlIHBvaW50IG1hdGNoZXMgc28gd2UgZG9uJ3QgaGF2ZSB0byBkbyB0aGVtIGFnYWluXG4gICAgICAgICAgICBsb2FkZWRfdHJhbnNmb3Jtc1trZXldLmluamVjdF9mcmFnbWVudCA9IChpbmplY3RfZnJhZ21lbnQgIT0gbnVsbCk7XG4gICAgICAgICAgICBsb2FkZWRfdHJhbnNmb3Jtc1trZXldLmxpc3QgPSBbXTtcblxuICAgICAgICAgICAgLy8gR2V0IHRoZSBjb2RlIChwb3NzaWJseSBvdmVyIHRoZSBuZXR3b3JrLCBzbyBuZWVkcyB0byBiZSBhc3luYylcbiAgICAgICAgICAgIGZvciAodmFyIHU9MDsgdSA8IHRyYW5zZm9ybS5sZW5ndGg7IHUrKykge1xuICAgICAgICAgICAgICAgIHF1ZXVlLmRlZmVyKEdMUHJvZ3JhbS5sb2FkVHJhbnNmb3JtLCBsb2FkZWRfdHJhbnNmb3JtcywgdHJhbnNmb3JtW3VdLCBrZXksIHUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBZGQgYSAjZGVmaW5lIGZvciB0aGlzIGluamVjdGlvbiBwb2ludFxuICAgICAgICAgICAgZGVmaW5lc1snVEFOR1JBTV9UUkFOU0ZPUk1fJyArIGtleS5yZXBsYWNlKCcgJywgJ18nKS50b1VwcGVyQ2FzZSgpXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXaGVuIGFsbCB0cmFuc2Zvcm0gY29kZSBzbmlwcGV0cyBhcmUgY29sbGVjdGVkLCBjb21iaW5lIGFuZCBpbmplY3QgdGhlbVxuICAgIHF1ZXVlLmF3YWl0KGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJlcnJvciBsb2FkaW5nIHRyYW5zZm9ybXM6IFwiICsgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRG8gdGhlIGNvZGUgaW5qZWN0aW9uIHdpdGggdGhlIGNvbGxlY3RlZCBzb3VyY2VzXG4gICAgICAgIGZvciAodmFyIHQgaW4gbG9hZGVkX3RyYW5zZm9ybXMpIHtcbiAgICAgICAgICAgIC8vIENvbmNhdGVuYXRlXG4gICAgICAgICAgICB2YXIgY29tYmluZWRfc291cmNlID0gXCJcIjtcbiAgICAgICAgICAgIGZvciAodmFyIHM9MDsgcyA8IGxvYWRlZF90cmFuc2Zvcm1zW3RdLmxpc3QubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgICAgICBjb21iaW5lZF9zb3VyY2UgKz0gbG9hZGVkX3RyYW5zZm9ybXNbdF0ubGlzdFtzXSArICdcXG4nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJbmplY3RcbiAgICAgICAgICAgIGlmIChsb2FkZWRfdHJhbnNmb3Jtc1t0XS5pbmplY3RfdmVydGV4ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIgPSB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIucmVwbGFjZShsb2FkZWRfdHJhbnNmb3Jtc1t0XS5yZWdleHAsIGNvbWJpbmVkX3NvdXJjZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobG9hZGVkX3RyYW5zZm9ybXNbdF0uaW5qZWN0X2ZyYWdtZW50ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlciA9IHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyLnJlcGxhY2UobG9hZGVkX3RyYW5zZm9ybXNbdF0ucmVnZXhwLCBjb21iaW5lZF9zb3VyY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xlYW4tdXAgYW55ICNwcmFnbWFzIHRoYXQgd2VyZW4ndCByZXBsYWNlZCAodG8gcHJldmVudCBjb21waWxlciB3YXJuaW5ncylcbiAgICAgICAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoJ15cXFxccyojcHJhZ21hXFxcXHMrdGFuZ3JhbTpcXFxccytcXFxcdytcXFxccyokJywgJ2dtJyk7XG4gICAgICAgIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciA9IHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlci5yZXBsYWNlKHJlZ2V4cCwgJycpO1xuICAgICAgICB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlciA9IHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyLnJlcGxhY2UocmVnZXhwLCAnJyk7XG5cbiAgICAgICAgLy8gQnVpbGQgJiBpbmplY3QgZGVmaW5lc1xuICAgICAgICAvLyBUaGlzIGlzIGRvbmUgKmFmdGVyKiBjb2RlIGluamVjdGlvbiBzbyB0aGF0IHdlIGNhbiBhZGQgZGVmaW5lcyBmb3Igd2hpY2ggY29kZSBwb2ludHMgd2VyZSBpbmplY3RlZFxuICAgICAgICB2YXIgZGVmaW5lX3N0ciA9IEdMUHJvZ3JhbS5idWlsZERlZmluZVN0cmluZyhkZWZpbmVzKTtcbiAgICAgICAgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyID0gZGVmaW5lX3N0ciArIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlcjtcbiAgICAgICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSBkZWZpbmVfc3RyICsgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXI7XG5cbiAgICAgICAgLy8gSW5jbHVkZSBwcm9ncmFtIGluZm8gdXNlZnVsIGZvciBkZWJ1Z2dpbmdcbiAgICAgICAgdmFyIGluZm8gPSAodGhpcy5uYW1lID8gKHRoaXMubmFtZSArICcgLyBpZCAnICsgdGhpcy5pZCkgOiAoJ2lkICcgKyB0aGlzLmlkKSk7XG4gICAgICAgIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciA9ICcvLyBQcm9ncmFtOiAnICsgaW5mbyArICdcXG4nICsgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyO1xuICAgICAgICB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlciA9ICcvLyBQcm9ncmFtOiAnICsgaW5mbyArICdcXG4nICsgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXI7XG5cbiAgICAgICAgLy8gQ29tcGlsZSAmIHNldCB1bmlmb3JtcyB0byBjYWNoZWQgdmFsdWVzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnByb2dyYW0gPSBHTC51cGRhdGVQcm9ncmFtKHRoaXMuZ2wsIHRoaXMucHJvZ3JhbSwgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyLCB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlcik7XG4gICAgICAgICAgICAvLyB0aGlzLnByb2dyYW0gPSBHTC51cGRhdGVQcm9ncmFtKHRoaXMuZ2wsIG51bGwsIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciwgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIpO1xuICAgICAgICAgICAgdGhpcy5jb21waWxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMucHJvZ3JhbSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmNvbXBpbGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVzZSgpO1xuICAgICAgICB0aGlzLnJlZnJlc2hVbmlmb3JtcygpO1xuICAgICAgICB0aGlzLnJlZnJlc2hBdHRyaWJ1dGVzKCk7XG5cbiAgICAgICAgLy8gTm90aWZ5IGNhbGxlclxuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLy8gUmV0cmlldmUgYSBzaW5nbGUgdHJhbnNmb3JtLCBmb3IgYSBnaXZlbiBpbmplY3Rpb24gcG9pbnQsIGF0IGEgY2VydGFpbiBpbmRleCAodG8gcHJlc2VydmUgb3JpZ2luYWwgb3JkZXIpXG4vLyBDYW4gYmUgYXN5bmMsIGNhbGxzICdjb21wbGV0ZScgY2FsbGJhY2sgd2hlbiBkb25lXG5HTFByb2dyYW0ubG9hZFRyYW5zZm9ybSA9IGZ1bmN0aW9uICh0cmFuc2Zvcm1zLCBibG9jaywga2V5LCBpbmRleCwgY29tcGxldGUpIHtcbiAgICAvLyBDYW4gYmUgYW4gaW5saW5lIGJsb2NrIG9mIEdMU0wsIG9yIGEgVVJMIHRvIHJldHJpZXZlIEdMU0wgYmxvY2sgZnJvbVxuICAgIHZhciB0eXBlLCB2YWx1ZSwgc291cmNlO1xuXG4gICAgLy8gSW5saW5lIGNvZGVcbiAgICBpZiAodHlwZW9mIGJsb2NrID09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRyYW5zZm9ybXNba2V5XS5saXN0W2luZGV4XSA9IGJsb2NrO1xuICAgICAgICBjb21wbGV0ZSgpO1xuICAgIH1cbiAgICAvLyBSZW1vdGUgY29kZVxuICAgIGVsc2UgaWYgKHR5cGVvZiBibG9jayA9PSAnb2JqZWN0JyAmJiBibG9jay51cmwpIHtcbiAgICAgICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzb3VyY2UgPSByZXEucmVzcG9uc2U7XG4gICAgICAgICAgICB0cmFuc2Zvcm1zW2tleV0ubGlzdFtpbmRleF0gPSBzb3VyY2U7XG4gICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICB9O1xuICAgICAgICByZXEub3BlbignR0VUJywgVXRpbHMudXJsRm9yUGF0aChibG9jay51cmwpICsgJz8nICsgKCtuZXcgRGF0ZSgpKSwgdHJ1ZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICAgICAgcmVxLnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICAgICAgcmVxLnNlbmQoKTtcbiAgICB9XG59O1xuXG4vLyBNYWtlIGxpc3Qgb2YgZGVmaW5lcyAoZ2xvYmFsLCB0aGVuIHByb2dyYW0tc3BlY2lmaWMpXG5HTFByb2dyYW0ucHJvdG90eXBlLmJ1aWxkRGVmaW5lTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGVmaW5lcyA9IHt9O1xuICAgIGZvciAodmFyIGQgaW4gR0xQcm9ncmFtLmRlZmluZXMpIHtcbiAgICAgICAgZGVmaW5lc1tkXSA9IEdMUHJvZ3JhbS5kZWZpbmVzW2RdO1xuICAgIH1cbiAgICBmb3IgKHZhciBkIGluIHRoaXMuZGVmaW5lcykge1xuICAgICAgICBkZWZpbmVzW2RdID0gdGhpcy5kZWZpbmVzW2RdO1xuICAgIH1cbiAgICByZXR1cm4gZGVmaW5lcztcbn07XG5cbi8vIFR1cm4gI2RlZmluZXMgaW50byBhIGNvbWJpbmVkIHN0cmluZ1xuR0xQcm9ncmFtLmJ1aWxkRGVmaW5lU3RyaW5nID0gZnVuY3Rpb24gKGRlZmluZXMpIHtcbiAgICB2YXIgZGVmaW5lX3N0ciA9IFwiXCI7XG4gICAgZm9yICh2YXIgZCBpbiBkZWZpbmVzKSB7XG4gICAgICAgIGlmIChkZWZpbmVzW2RdID09IGZhbHNlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lc1tkXSA9PSAnYm9vbGVhbicgJiYgZGVmaW5lc1tkXSA9PSB0cnVlKSB7IC8vIGJvb2xlYW5zIGFyZSBzaW1wbGUgZGVmaW5lcyB3aXRoIG5vIHZhbHVlXG4gICAgICAgICAgICBkZWZpbmVfc3RyICs9IFwiI2RlZmluZSBcIiArIGQgKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmVzW2RdID09ICdudW1iZXInICYmIE1hdGguZmxvb3IoZGVmaW5lc1tkXSkgPT0gZGVmaW5lc1tkXSkgeyAvLyBpbnQgdG8gZmxvYXQgY29udmVyc2lvbiB0byBzYXRpc2Z5IEdMU0wgZmxvYXRzXG4gICAgICAgICAgICBkZWZpbmVfc3RyICs9IFwiI2RlZmluZSBcIiArIGQgKyBcIiBcIiArIGRlZmluZXNbZF0udG9GaXhlZCgxKSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vIGFueSBvdGhlciBmbG9hdCBvciBzdHJpbmcgdmFsdWVcbiAgICAgICAgICAgIGRlZmluZV9zdHIgKz0gXCIjZGVmaW5lIFwiICsgZCArIFwiIFwiICsgZGVmaW5lc1tkXSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlZmluZV9zdHI7XG59O1xuXG4vLyBTZXQgdW5pZm9ybXMgZnJvbSBhIEpTIG9iamVjdCwgd2l0aCBpbmZlcnJlZCB0eXBlc1xuR0xQcm9ncmFtLnByb3RvdHlwZS5zZXRVbmlmb3JtcyA9IGZ1bmN0aW9uICh1bmlmb3JtcylcbntcbiAgICAvLyBUT0RPOiBvbmx5IHVwZGF0ZSB1bmlmb3JtcyB3aGVuIGNoYW5nZWRcbiAgICB2YXIgdGV4dHVyZV91bml0ID0gMDtcblxuICAgIGZvciAodmFyIHUgaW4gdW5pZm9ybXMpIHtcbiAgICAgICAgdmFyIHVuaWZvcm0gPSB1bmlmb3Jtc1t1XTtcblxuICAgICAgICAvLyBTaW5nbGUgZmxvYXRcbiAgICAgICAgaWYgKHR5cGVvZiB1bmlmb3JtID09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm0oJzFmJywgdSwgdW5pZm9ybSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTXVsdGlwbGUgZmxvYXRzIC0gdmVjdG9yIG9yIGFycmF5XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB1bmlmb3JtID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAvLyBmbG9hdCB2ZWN0b3JzICh2ZWMyLCB2ZWMzLCB2ZWM0KVxuICAgICAgICAgICAgaWYgKHVuaWZvcm0ubGVuZ3RoID49IDIgJiYgdW5pZm9ybS5sZW5ndGggPD0gNCkge1xuICAgICAgICAgICAgICAgIHRoaXMudW5pZm9ybSh1bmlmb3JtLmxlbmd0aCArICdmdicsIHUsIHVuaWZvcm0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZmxvYXQgYXJyYXlcbiAgICAgICAgICAgIGVsc2UgaWYgKHVuaWZvcm0ubGVuZ3RoID4gNCkge1xuICAgICAgICAgICAgICAgIHRoaXMudW5pZm9ybSgnMWZ2JywgdSArICdbMF0nLCB1bmlmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRPRE86IGFzc3VtZSBtYXRyaXggZm9yICh0eXBlb2YgPT0gRmxvYXQzMkFycmF5ICYmIGxlbmd0aCA9PSAxNik/XG4gICAgICAgIH1cbiAgICAgICAgLy8gQm9vbGVhblxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdGhpcy5zaGFkZXJzLnVuaWZvcm1zW3VdID09ICdib29sZWFuJykge1xuICAgICAgICAgICAgdGhpcy51bmlmb3JtKCcxaScsIHUsIHVuaWZvcm0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRleHR1cmVcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHVuaWZvcm0gPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHZhciB0ZXh0dXJlID0gR0xUZXh0dXJlLnRleHR1cmVzW3VuaWZvcm1dO1xuICAgICAgICAgICAgaWYgKHRleHR1cmUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRleHR1cmUgPSBuZXcgR0xUZXh0dXJlKHRoaXMuZ2wsIHVuaWZvcm0pO1xuICAgICAgICAgICAgICAgIHRleHR1cmUubG9hZCh1bmlmb3JtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGV4dHVyZS5iaW5kKHRleHR1cmVfdW5pdCk7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm0oJzFpJywgdSwgdGV4dHVyZV91bml0KTtcbiAgICAgICAgICAgIHRleHR1cmVfdW5pdCsrO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE86IHN1cHBvcnQgb3RoZXIgbm9uLWZsb2F0IHR5cGVzPyAoaW50LCBldGMuKVxuICAgIH1cbn07XG5cbi8vIGV4OiBwcm9ncmFtLnVuaWZvcm0oJzNmJywgJ3Bvc2l0aW9uJywgeCwgeSwgeik7XG4vLyBUT0RPOiBvbmx5IHVwZGF0ZSB1bmlmb3JtcyB3aGVuIGNoYW5nZWRcbkdMUHJvZ3JhbS5wcm90b3R5cGUudW5pZm9ybSA9IGZ1bmN0aW9uIChtZXRob2QsIG5hbWUpIC8vIG1ldGhvZC1hcHByb3ByaWF0ZSBhcmd1bWVudHMgZm9sbG93XG57XG4gICAgaWYgKCF0aGlzLmNvbXBpbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdW5pZm9ybSA9ICh0aGlzLnVuaWZvcm1zW25hbWVdID0gdGhpcy51bmlmb3Jtc1tuYW1lXSB8fCB7fSk7XG4gICAgdW5pZm9ybS5uYW1lID0gbmFtZTtcbiAgICB1bmlmb3JtLmxvY2F0aW9uID0gdW5pZm9ybS5sb2NhdGlvbiB8fCB0aGlzLmdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnByb2dyYW0sIG5hbWUpO1xuICAgIHVuaWZvcm0ubWV0aG9kID0gJ3VuaWZvcm0nICsgbWV0aG9kO1xuICAgIHVuaWZvcm0udmFsdWVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB0aGlzLnVwZGF0ZVVuaWZvcm0obmFtZSk7XG59O1xuXG4vLyBTZXQgYSBzaW5nbGUgdW5pZm9ybVxuR0xQcm9ncmFtLnByb3RvdHlwZS51cGRhdGVVbmlmb3JtID0gZnVuY3Rpb24gKG5hbWUpXG57XG4gICAgaWYgKCF0aGlzLmNvbXBpbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdW5pZm9ybSA9IHRoaXMudW5pZm9ybXNbbmFtZV07XG4gICAgaWYgKHVuaWZvcm0gPT0gbnVsbCB8fCB1bmlmb3JtLmxvY2F0aW9uID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMudXNlKCk7XG4gICAgdGhpcy5nbFt1bmlmb3JtLm1ldGhvZF0uYXBwbHkodGhpcy5nbCwgW3VuaWZvcm0ubG9jYXRpb25dLmNvbmNhdCh1bmlmb3JtLnZhbHVlcykpOyAvLyBjYWxsIGFwcHJvcHJpYXRlIEdMIHVuaWZvcm0gbWV0aG9kIGFuZCBwYXNzIHRocm91Z2ggYXJndW1lbnRzXG59O1xuXG4vLyBSZWZyZXNoIHVuaWZvcm0gbG9jYXRpb25zIGFuZCBzZXQgdG8gbGFzdCBjYWNoZWQgdmFsdWVzXG5HTFByb2dyYW0ucHJvdG90eXBlLnJlZnJlc2hVbmlmb3JtcyA9IGZ1bmN0aW9uICgpXG57XG4gICAgaWYgKCF0aGlzLmNvbXBpbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKHZhciB1IGluIHRoaXMudW5pZm9ybXMpIHtcbiAgICAgICAgdGhpcy51bmlmb3Jtc1t1XS5sb2NhdGlvbiA9IHRoaXMuZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgdSk7XG4gICAgICAgIHRoaXMudXBkYXRlVW5pZm9ybSh1KTtcbiAgICB9XG59O1xuXG5HTFByb2dyYW0ucHJvdG90eXBlLnJlZnJlc2hBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyB2YXIgbGVuID0gdGhpcy5nbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMucHJvZ3JhbSwgdGhpcy5nbC5BQ1RJVkVfQVRUUklCVVRFUyk7XG4gICAgLy8gZm9yICh2YXIgaT0wOyBpIDwgbGVuOyBpKyspIHtcbiAgICAvLyAgICAgdmFyIGEgPSB0aGlzLmdsLmdldEFjdGl2ZUF0dHJpYih0aGlzLnByb2dyYW0sIGkpO1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhhKTtcbiAgICAvLyB9XG4gICAgdGhpcy5hdHRyaWJzID0ge307XG59O1xuXG4vLyBHZXQgdGhlIGxvY2F0aW9uIG9mIGEgdmVydGV4IGF0dHJpYnV0ZVxuR0xQcm9ncmFtLnByb3RvdHlwZS5hdHRyaWJ1dGUgPSBmdW5jdGlvbiAobmFtZSlcbntcbiAgICBpZiAoIXRoaXMuY29tcGlsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBhdHRyaWIgPSAodGhpcy5hdHRyaWJzW25hbWVdID0gdGhpcy5hdHRyaWJzW25hbWVdIHx8IHt9KTtcbiAgICBpZiAoYXR0cmliLmxvY2F0aW9uICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGF0dHJpYjtcbiAgICB9XG5cbiAgICBhdHRyaWIubmFtZSA9IG5hbWU7XG4gICAgYXR0cmliLmxvY2F0aW9uID0gdGhpcy5nbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLnByb2dyYW0sIG5hbWUpO1xuXG4gICAgLy8gdmFyIGluZm8gPSB0aGlzLmdsLmdldEFjdGl2ZUF0dHJpYih0aGlzLnByb2dyYW0sIGF0dHJpYi5sb2NhdGlvbik7XG4gICAgLy8gYXR0cmliLnR5cGUgPSBpbmZvLnR5cGU7XG4gICAgLy8gYXR0cmliLnNpemUgPSBpbmZvLnNpemU7XG5cbiAgICByZXR1cm4gYXR0cmliO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHTFByb2dyYW07XG59XG4iLCIvLyBHZW5lcmF0ZWQgZnJvbSBHTFNMIGZpbGVzLCBkb24ndCBlZGl0IVxudmFyIHNoYWRlcl9zb3VyY2VzID0ge307XG5cbnNoYWRlcl9zb3VyY2VzWydwb2ludF9mcmFnbWVudCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9yZXNvbHV0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzIgdl90ZXhjb29yZDtcXG5cIiArXG5cInZvaWQgbWFpbih2b2lkKSB7XFxuXCIgK1xuXCIgIHZlYzMgY29sb3IgPSB2X2NvbG9yO1xcblwiICtcblwiICB2ZWMzIGxpZ2h0aW5nID0gdmVjMygxLik7XFxuXCIgK1xuXCIgIGZsb2F0IGxlbiA9IGxlbmd0aCh2X3RleGNvb3JkKTtcXG5cIiArXG5cIiAgaWYobGVuID4gMS4pIHtcXG5cIiArXG5cIiAgICBkaXNjYXJkO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIGNvbG9yICo9ICgxLiAtIHNtb290aHN0ZXAoLjI1LCAxLiwgbGVuKSkgKyAwLjU7XFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogZnJhZ21lbnRcXG5cIiArXG5cIiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwgMS4pO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydwb2ludF92ZXJ0ZXgnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfdGlsZV92aWV3O1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfbWV0ZXJfdmlldztcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9udW1fbGF5ZXJzO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9wb3NpdGlvbjtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMyIGFfdGV4Y29vcmQ7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX2NvbG9yO1xcblwiICtcblwiYXR0cmlidXRlIGZsb2F0IGFfbGF5ZXI7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMiB2X3RleGNvb3JkO1xcblwiICtcblwiI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCJcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWM0IGFfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwidmFyeWluZyB2ZWM0IHZfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cImZsb2F0IGFfeF9jYWxjdWxhdGVaKGZsb2F0IHosIGZsb2F0IGxheWVyLCBjb25zdCBmbG9hdCBudW1fbGF5ZXJzLCBjb25zdCBmbG9hdCB6X2xheWVyX3NjYWxlKSB7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXJfcmFuZ2UgPSAobnVtX2xheWVycyArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXIgPSAobGF5ZXIgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICB6ID0gel9sYXllciArIGNsYW1wKHosIDAuLCB6X2xheWVyX3NjYWxlKTtcXG5cIiArXG5cIiAgeiA9ICh6X2xheWVyX3JhbmdlIC0geikgLyB6X2xheWVyX3JhbmdlO1xcblwiICtcblwiICByZXR1cm4gejtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4oKSB7XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIiAgaWYoYV9zZWxlY3Rpb25fY29sb3IueHl6ID09IHZlYzMoMC4pKSB7XFxuXCIgK1xuXCIgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KDAuKTtcXG5cIiArXG5cIiAgICByZXR1cm47XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgdl9zZWxlY3Rpb25fY29sb3IgPSBhX3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHZlYzQgcG9zaXRpb24gPSB1X21ldGVyX3ZpZXcgKiB1X3RpbGVfdmlldyAqIHZlYzQoYV9wb3NpdGlvbiwgMS4pO1xcblwiICtcblwiICAjcHJhZ21hIHRhbmdyYW06IHZlcnRleFxcblwiICtcblwiICB2X2NvbG9yID0gYV9jb2xvcjtcXG5cIiArXG5cIiAgdl90ZXhjb29yZCA9IGFfdGV4Y29vcmQ7XFxuXCIgK1xuXCIgIHBvc2l0aW9uLnogPSBhX3hfY2FsY3VsYXRlWihwb3NpdGlvbi56LCBhX2xheWVyLCB1X251bV9sYXllcnMsIDI1Ni4pO1xcblwiICtcblwiICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydwb2x5Z29uX2ZyYWdtZW50J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3Jlc29sdXRpb247XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9hc3BlY3Q7XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV9tZXRlcl92aWV3O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21ldGVyc19wZXJfcGl4ZWw7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfdGltZTtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9tYXBfem9vbTtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X21hcF9jZW50ZXI7XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV90aWxlX29yaWdpbjtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV90ZXN0O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X3Rlc3QyO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl93b3JsZF9wb3NpdGlvbjtcXG5cIiArXG5cIiNpZiBkZWZpbmVkKFdPUkxEX1BPU0lUSU9OX1dSQVApXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzIgd29ybGRfcG9zaXRpb25fYW5jaG9yID0gdmVjMihmbG9vcih1X3RpbGVfb3JpZ2luIC8gV09STERfUE9TSVRJT05fV1JBUCkgKiBXT1JMRF9QT1NJVElPTl9XUkFQKTtcXG5cIiArXG5cInZlYzQgYWJzb2x1dGVXb3JsZFBvc2l0aW9uKCkge1xcblwiICtcblwiICByZXR1cm4gdmVjNCh2X3dvcmxkX3Bvc2l0aW9uLnh5ICsgd29ybGRfcG9zaXRpb25fYW5jaG9yLCB2X3dvcmxkX3Bvc2l0aW9uLnosIHZfd29ybGRfcG9zaXRpb24udyk7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjZWxzZVxcblwiICtcblwiXFxuXCIgK1xuXCJ2ZWM0IGFic29sdXRlV29ybGRQb3NpdGlvbigpIHtcXG5cIiArXG5cIiAgcmV0dXJuIHZfd29ybGRfcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiI2lmIGRlZmluZWQoTElHSFRJTkdfRU5WSVJPTk1FTlQpXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gc2FtcGxlcjJEIHVfZW52X21hcDtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X25vcm1hbDtcXG5cIiArXG5cIiNlbHNlXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2xpZ2h0aW5nO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cImNvbnN0IGZsb2F0IGxpZ2h0X2FtYmllbnQgPSAwLjU7XFxuXCIgK1xuXCJ2ZWMzIGJfeF9wb2ludExpZ2h0KHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgZmxvYXQgbGlnaHRfYW1iaWVudCwgY29uc3QgYm9vbCBiYWNrbGlnaHQpIHtcXG5cIiArXG5cIiAgdmVjMyBsaWdodF9kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gbGlnaHRfcG9zLnh5eik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGFicyhtYXgoZmxvYXQoYmFja2xpZ2h0KSAqIC0xLiwgZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkpKSArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgY194X3NwZWN1bGFyTGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgdmVjMyB2aWV3X3BvcyA9IHZlYzMoMC4sIDAuLCA1MDAuKTtcXG5cIiArXG5cIiAgdmVjMyB2aWV3X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSB2aWV3X3Bvcy54eXopO1xcblwiICtcblwiICB2ZWMzIHNwZWN1bGFyUmVmbGVjdGlvbjtcXG5cIiArXG5cIiAgaWYoZG90KG5vcm1hbCwgLWxpZ2h0X2RpcikgPCAwLjApIHtcXG5cIiArXG5cIiAgICBzcGVjdWxhclJlZmxlY3Rpb24gPSB2ZWMzKDAuMCwgMC4wLCAwLjApO1xcblwiICtcblwiICB9IGVsc2Uge1xcblwiICtcblwiICAgIGZsb2F0IGF0dGVudWF0aW9uID0gMS4wO1xcblwiICtcblwiICAgIGZsb2F0IGxpZ2h0U3BlY3VsYXJUZXJtID0gMS4wO1xcblwiICtcblwiICAgIGZsb2F0IG1hdGVyaWFsU3BlY3VsYXJUZXJtID0gMTAuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBtYXRlcmlhbFNoaW5pbmVzc1Rlcm0gPSAxMC4wO1xcblwiICtcblwiICAgIHNwZWN1bGFyUmVmbGVjdGlvbiA9IGF0dGVudWF0aW9uICogdmVjMyhsaWdodFNwZWN1bGFyVGVybSkgKiB2ZWMzKG1hdGVyaWFsU3BlY3VsYXJUZXJtKSAqIHBvdyhtYXgoMC4wLCBkb3QocmVmbGVjdCgtbGlnaHRfZGlyLCBub3JtYWwpLCB2aWV3X2RpcikpLCBtYXRlcmlhbFNoaW5pbmVzc1Rlcm0pO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIGZsb2F0IGRpZmZ1c2UgPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSk7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGRpZmZ1c2UgKyBzcGVjdWxhclJlZmxlY3Rpb24gKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGRfeF9kaXJlY3Rpb25hbExpZ2h0KHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBsaWdodF9kaXIgPSBub3JtYWxpemUobGlnaHRfZGlyKTtcXG5cIiArXG5cIiAgY29sb3IgKj0gZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGFfeF9saWdodGluZyh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIHZlYzQgbmlnaHRfbGlnaHRfcG9zLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoTElHSFRJTkdfUE9JTlQpXFxuXCIgK1xuXCIgIGNvbG9yID0gYl94X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgdHJ1ZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfUE9JTlRfU1BFQ1VMQVIpXFxuXCIgK1xuXCIgIGNvbG9yID0gY194X3NwZWN1bGFyTGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgdHJ1ZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfTklHSFQpXFxuXCIgK1xuXCIgIGNvbG9yID0gYl94X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIG5pZ2h0X2xpZ2h0X3BvcywgMC4sIGZhbHNlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19ESVJFQ1RJT04pXFxuXCIgK1xuXCIgIGNvbG9yID0gZF94X2RpcmVjdGlvbmFsTGlnaHQobm9ybWFsLCBjb2xvciwgbGlnaHRfZGlyLCBsaWdodF9hbWJpZW50KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgY29sb3IgPSBjb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzQgZV94X3NwaGVyaWNhbEVudmlyb25tZW50TWFwKHZlYzMgdmlld19wb3MsIHZlYzMgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCBzYW1wbGVyMkQgZW52bWFwKSB7XFxuXCIgK1xuXCIgIHZlYzMgZXllID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIHZpZXdfcG9zLnh5eik7XFxuXCIgK1xuXCIgIGlmKGV5ZS56ID4gMC4wMSkge1xcblwiICtcblwiICAgIGV5ZS56ID0gMC4wMTtcXG5cIiArXG5cIiAgfVxcblwiICtcblwiICB2ZWMzIHIgPSByZWZsZWN0KGV5ZSwgbm9ybWFsKTtcXG5cIiArXG5cIiAgZmxvYXQgbSA9IDIuICogc3FydChwb3coci54LCAyLikgKyBwb3coci55LCAyLikgKyBwb3coci56ICsgMS4sIDIuKSk7XFxuXCIgK1xuXCIgIHZlYzIgdXYgPSByLnh5IC8gbSArIC41O1xcblwiICtcblwiICByZXR1cm4gdGV4dHVyZTJEKGVudm1hcCwgdXYpO1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbih2b2lkKSB7XFxuXCIgK1xuXCIgIHZlYzMgY29sb3IgPSB2X2NvbG9yO1xcblwiICtcblwiICAjaWYgZGVmaW5lZChMSUdIVElOR19FTlZJUk9OTUVOVClcXG5cIiArXG5cIiAgdmVjMyB2aWV3X3BvcyA9IHZlYzMoMC4sIDAuLCAxMDAuICogdV9tZXRlcnNfcGVyX3BpeGVsKTtcXG5cIiArXG5cIiAgY29sb3IgPSBlX3hfc3BoZXJpY2FsRW52aXJvbm1lbnRNYXAodmlld19wb3MsIHZfcG9zaXRpb24ueHl6LCB2X25vcm1hbCwgdV9lbnZfbWFwKS5yZ2I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWCkgLy8gZGVmYXVsdCB0byBwZXItcGl4ZWwgbGlnaHRpbmdcXG5cIiArXG5cIiAgdmVjMyBsaWdodGluZyA9IGFfeF9saWdodGluZyh2X3Bvc2l0aW9uLCB2X25vcm1hbCwgdmVjMygxLiksIHZlYzQoMC4sIDAuLCAxNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLiksIHZlYzQoMC4sIDAuLCA1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKSwgdmVjMygwLjIsIDAuNywgLTAuNSksIGxpZ2h0X2FtYmllbnQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICB2ZWMzIGxpZ2h0aW5nID0gdl9saWdodGluZztcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHZlYzMgY29sb3JfcHJlbGlnaHQgPSBjb2xvcjtcXG5cIiArXG5cIiAgY29sb3IgKj0gbGlnaHRpbmc7XFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogZnJhZ21lbnRcXG5cIiArXG5cIiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwgMS4wKTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1sncG9seWdvbl92ZXJ0ZXgnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfcmVzb2x1dGlvbjtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X2FzcGVjdDtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV90aW1lO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21hcF96b29tO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfbWFwX2NlbnRlcjtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3RpbGVfb3JpZ2luO1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfdGlsZV93b3JsZDtcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X3RpbGVfdmlldztcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X21ldGVyX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWV0ZXJzX3Blcl9waXhlbDtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9udW1fbGF5ZXJzO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9wb3NpdGlvbjtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfbm9ybWFsO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9jb2xvcjtcXG5cIiArXG5cImF0dHJpYnV0ZSBmbG9hdCBhX2xheWVyO1xcblwiICtcblwidmFyeWluZyB2ZWM0IHZfd29ybGRfcG9zaXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cIiNpZiBkZWZpbmVkKFdPUkxEX1BPU0lUSU9OX1dSQVApXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzIgd29ybGRfcG9zaXRpb25fYW5jaG9yID0gdmVjMihmbG9vcih1X3RpbGVfb3JpZ2luIC8gV09STERfUE9TSVRJT05fV1JBUCkgKiBXT1JMRF9QT1NJVElPTl9XUkFQKTtcXG5cIiArXG5cInZlYzQgYWJzb2x1dGVXb3JsZFBvc2l0aW9uKCkge1xcblwiICtcblwiICByZXR1cm4gdmVjNCh2X3dvcmxkX3Bvc2l0aW9uLnh5ICsgd29ybGRfcG9zaXRpb25fYW5jaG9yLCB2X3dvcmxkX3Bvc2l0aW9uLnosIHZfd29ybGRfcG9zaXRpb24udyk7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjZWxzZVxcblwiICtcblwiXFxuXCIgK1xuXCJ2ZWM0IGFic29sdXRlV29ybGRQb3NpdGlvbigpIHtcXG5cIiArXG5cIiAgcmV0dXJuIHZfd29ybGRfcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCJcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWM0IGFfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwidmFyeWluZyB2ZWM0IHZfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cIiNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3Bvc2l0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfbm9ybWFsO1xcblwiICtcblwiI2Vsc2VcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWMzIHZfbGlnaHRpbmc7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiY29uc3QgZmxvYXQgbGlnaHRfYW1iaWVudCA9IDAuNTtcXG5cIiArXG5cInZlYzQgYV94X3BlcnNwZWN0aXZlKHZlYzQgcG9zaXRpb24sIGNvbnN0IHZlYzIgcGVyc3BlY3RpdmVfb2Zmc2V0LCBjb25zdCB2ZWMyIHBlcnNwZWN0aXZlX2ZhY3Rvcikge1xcblwiICtcblwiICBwb3NpdGlvbi54eSArPSBwb3NpdGlvbi56ICogcGVyc3BlY3RpdmVfZmFjdG9yICogKHBvc2l0aW9uLnh5IC0gcGVyc3BlY3RpdmVfb2Zmc2V0KTtcXG5cIiArXG5cIiAgcmV0dXJuIHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwidmVjNCBiX3hfaXNvbWV0cmljKHZlYzQgcG9zaXRpb24sIGNvbnN0IHZlYzIgYXhpcywgY29uc3QgZmxvYXQgbXVsdGlwbGllcikge1xcblwiICtcblwiICBwb3NpdGlvbi54eSArPSBwb3NpdGlvbi56ICogYXhpcyAqIG11bHRpcGxpZXIgLyB1X2FzcGVjdDtcXG5cIiArXG5cIiAgcmV0dXJuIHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiZmxvYXQgY194X2NhbGN1bGF0ZVooZmxvYXQgeiwgZmxvYXQgbGF5ZXIsIGNvbnN0IGZsb2F0IG51bV9sYXllcnMsIGNvbnN0IGZsb2F0IHpfbGF5ZXJfc2NhbGUpIHtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllcl9yYW5nZSA9IChudW1fbGF5ZXJzICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllciA9IChsYXllciArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIHogPSB6X2xheWVyICsgY2xhbXAoeiwgMC4sIHpfbGF5ZXJfc2NhbGUpO1xcblwiICtcblwiICB6ID0gKHpfbGF5ZXJfcmFuZ2UgLSB6KSAvIHpfbGF5ZXJfcmFuZ2U7XFxuXCIgK1xuXCIgIHJldHVybiB6O1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBlX3hfcG9pbnRMaWdodCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIGZsb2F0IGxpZ2h0X2FtYmllbnQsIGNvbnN0IGJvb2wgYmFja2xpZ2h0KSB7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIGxpZ2h0X3Bvcy54eXopO1xcblwiICtcblwiICBjb2xvciAqPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGZfeF9zcGVjdWxhckxpZ2h0KHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgZmxvYXQgbGlnaHRfYW1iaWVudCwgY29uc3QgYm9vbCBiYWNrbGlnaHQpIHtcXG5cIiArXG5cIiAgdmVjMyBsaWdodF9kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gbGlnaHRfcG9zLnh5eik7XFxuXCIgK1xuXCIgIHZlYzMgdmlld19wb3MgPSB2ZWMzKDAuLCAwLiwgNTAwLik7XFxuXCIgK1xuXCIgIHZlYzMgdmlld19kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gdmlld19wb3MueHl6KTtcXG5cIiArXG5cIiAgdmVjMyBzcGVjdWxhclJlZmxlY3Rpb247XFxuXCIgK1xuXCIgIGlmKGRvdChub3JtYWwsIC1saWdodF9kaXIpIDwgMC4wKSB7XFxuXCIgK1xuXCIgICAgc3BlY3VsYXJSZWZsZWN0aW9uID0gdmVjMygwLjAsIDAuMCwgMC4wKTtcXG5cIiArXG5cIiAgfSBlbHNlIHtcXG5cIiArXG5cIiAgICBmbG9hdCBhdHRlbnVhdGlvbiA9IDEuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBsaWdodFNwZWN1bGFyVGVybSA9IDEuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBtYXRlcmlhbFNwZWN1bGFyVGVybSA9IDEwLjA7XFxuXCIgK1xuXCIgICAgZmxvYXQgbWF0ZXJpYWxTaGluaW5lc3NUZXJtID0gMTAuMDtcXG5cIiArXG5cIiAgICBzcGVjdWxhclJlZmxlY3Rpb24gPSBhdHRlbnVhdGlvbiAqIHZlYzMobGlnaHRTcGVjdWxhclRlcm0pICogdmVjMyhtYXRlcmlhbFNwZWN1bGFyVGVybSkgKiBwb3cobWF4KDAuMCwgZG90KHJlZmxlY3QoLWxpZ2h0X2Rpciwgbm9ybWFsKSwgdmlld19kaXIpKSwgbWF0ZXJpYWxTaGluaW5lc3NUZXJtKTtcXG5cIiArXG5cIiAgfVxcblwiICtcblwiICBmbG9hdCBkaWZmdXNlID0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpO1xcblwiICtcblwiICBjb2xvciAqPSBkaWZmdXNlICsgc3BlY3VsYXJSZWZsZWN0aW9uICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBnX3hfZGlyZWN0aW9uYWxMaWdodCh2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjMyBsaWdodF9kaXIsIGZsb2F0IGxpZ2h0X2FtYmllbnQpIHtcXG5cIiArXG5cIiAgbGlnaHRfZGlyID0gbm9ybWFsaXplKGxpZ2h0X2Rpcik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBkX3hfbGlnaHRpbmcodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCB2ZWM0IG5pZ2h0X2xpZ2h0X3BvcywgdmVjMyBsaWdodF9kaXIsIGZsb2F0IGxpZ2h0X2FtYmllbnQpIHtcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKExJR0hUSU5HX1BPSU5UKVxcblwiICtcblwiICBjb2xvciA9IGVfeF9wb2ludExpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBsaWdodF9wb3MsIGxpZ2h0X2FtYmllbnQsIHRydWUpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKExJR0hUSU5HX1BPSU5UX1NQRUNVTEFSKVxcblwiICtcblwiICBjb2xvciA9IGZfeF9zcGVjdWxhckxpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBsaWdodF9wb3MsIGxpZ2h0X2FtYmllbnQsIHRydWUpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKExJR0hUSU5HX05JR0hUKVxcblwiICtcblwiICBjb2xvciA9IGVfeF9wb2ludExpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBuaWdodF9saWdodF9wb3MsIDAuLCBmYWxzZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfRElSRUNUSU9OKVxcblwiICtcblwiICBjb2xvciA9IGdfeF9kaXJlY3Rpb25hbExpZ2h0KG5vcm1hbCwgY29sb3IsIGxpZ2h0X2RpciwgbGlnaHRfYW1iaWVudCk7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIGNvbG9yID0gY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjcHJhZ21hIHRhbmdyYW06IGdsb2JhbHNcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluKCkge1xcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCIgIGlmKGFfc2VsZWN0aW9uX2NvbG9yLnh5eiA9PSB2ZWMzKDAuKSkge1xcblwiICtcblwiICAgIGdsX1Bvc2l0aW9uID0gdmVjNCgwLik7XFxuXCIgK1xuXCIgICAgcmV0dXJuO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIHZfc2VsZWN0aW9uX2NvbG9yID0gYV9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICB2ZWM0IHBvc2l0aW9uID0gdV90aWxlX3ZpZXcgKiB2ZWM0KGFfcG9zaXRpb24sIDEuKTtcXG5cIiArXG5cIiAgdl93b3JsZF9wb3NpdGlvbiA9IHVfdGlsZV93b3JsZCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4pO1xcblwiICtcblwiICAjaWYgZGVmaW5lZChXT1JMRF9QT1NJVElPTl9XUkFQKVxcblwiICtcblwiICB2X3dvcmxkX3Bvc2l0aW9uLnh5IC09IHdvcmxkX3Bvc2l0aW9uX2FuY2hvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjcHJhZ21hIHRhbmdyYW06IHZlcnRleFxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiICB2X2NvbG9yID0gYV9jb2xvcjtcXG5cIiArXG5cIiAgdl9saWdodGluZyA9IGRfeF9saWdodGluZyhwb3NpdGlvbiwgYV9ub3JtYWwsIHZlYzMoMS4pLCB2ZWM0KDAuLCAwLiwgMTUwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCwgMS4pLCB2ZWM0KDAuLCAwLiwgNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLiksIHZlYzMoMC4yLCAwLjcsIC0wLjUpLCBsaWdodF9hbWJpZW50KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgdl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xcblwiICtcblwiICB2X25vcm1hbCA9IGFfbm9ybWFsO1xcblwiICtcblwiICB2X2NvbG9yID0gYV9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHBvc2l0aW9uID0gdV9tZXRlcl92aWV3ICogcG9zaXRpb247XFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKFBST0pFQ1RJT05fUEVSU1BFQ1RJVkUpXFxuXCIgK1xuXCIgIHBvc2l0aW9uID0gYV94X3BlcnNwZWN0aXZlKHBvc2l0aW9uLCB2ZWMyKDAuLCAwLiksIHZlYzIoMC42LCAwLjYpKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChQUk9KRUNUSU9OX0lTT01FVFJJQykgLy8gfHwgZGVmaW5lZChQUk9KRUNUSU9OX1BPUFVQKVxcblwiICtcblwiICBwb3NpdGlvbiA9IGJfeF9pc29tZXRyaWMocG9zaXRpb24sIHZlYzIoMC4sIDEuKSwgMS4pO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgcG9zaXRpb24ueiA9IGNfeF9jYWxjdWxhdGVaKHBvc2l0aW9uLnosIGFfbGF5ZXIsIHVfbnVtX2xheWVycywgNDA5Ni4pO1xcblwiICtcblwiICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydzZWxlY3Rpb25fZnJhZ21lbnQnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwiI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4odm9pZCkge1xcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCIgIGdsX0ZyYWdDb2xvciA9IHZfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICBnbF9GcmFnQ29sb3IgPSB2ZWMzKDAuLCAwLiwgMC4sIDEuKTtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIFxcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydzaW1wbGVfcG9seWdvbl9mcmFnbWVudCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWV0ZXJzX3Blcl9waXhlbDtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwiI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWM0IHZfcG9zaXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9ub3JtYWw7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwidmVjMyBhX3hfcG9pbnRMaWdodCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIGZsb2F0IGxpZ2h0X2FtYmllbnQsIGNvbnN0IGJvb2wgYmFja2xpZ2h0KSB7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIGxpZ2h0X3Bvcy54eXopO1xcblwiICtcblwiICBjb2xvciAqPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjcHJhZ21hIHRhbmdyYW06IGdsb2JhbHNcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluKHZvaWQpIHtcXG5cIiArXG5cIiAgdmVjMyBjb2xvcjtcXG5cIiArXG5cIiAgI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWCkgLy8gZGVmYXVsdCB0byBwZXItcGl4ZWwgbGlnaHRpbmdcXG5cIiArXG5cIiAgdmVjNCBsaWdodF9wb3MgPSB2ZWM0KDAuLCAwLiwgMTUwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCwgMS4pO1xcblwiICtcblwiICBjb25zdCBmbG9hdCBsaWdodF9hbWJpZW50ID0gMC41O1xcblwiICtcblwiICBjb25zdCBib29sIGJhY2tsaXQgPSB0cnVlO1xcblwiICtcblwiICBjb2xvciA9IGFfeF9wb2ludExpZ2h0KHZfcG9zaXRpb24sIHZfbm9ybWFsLCB2X2NvbG9yLCBsaWdodF9wb3MsIGxpZ2h0X2FtYmllbnQsIGJhY2tsaXQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICBjb2xvciA9IHZfY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI3ByYWdtYSB0YW5ncmFtOiBmcmFnbWVudFxcblwiICtcblwiICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yLCAxLjApO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydzaW1wbGVfcG9seWdvbl92ZXJ0ZXgnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfYXNwZWN0O1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfdGlsZV92aWV3O1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfbWV0ZXJfdmlldztcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9tZXRlcnNfcGVyX3BpeGVsO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X251bV9sYXllcnM7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX3Bvc2l0aW9uO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9ub3JtYWw7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX2NvbG9yO1xcblwiICtcblwiYXR0cmlidXRlIGZsb2F0IGFfbGF5ZXI7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cIiNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3Bvc2l0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfbm9ybWFsO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzQgYV94X3BlcnNwZWN0aXZlKHZlYzQgcG9zaXRpb24sIGNvbnN0IHZlYzIgcGVyc3BlY3RpdmVfb2Zmc2V0LCBjb25zdCB2ZWMyIHBlcnNwZWN0aXZlX2ZhY3Rvcikge1xcblwiICtcblwiICBwb3NpdGlvbi54eSArPSBwb3NpdGlvbi56ICogcGVyc3BlY3RpdmVfZmFjdG9yICogKHBvc2l0aW9uLnh5IC0gcGVyc3BlY3RpdmVfb2Zmc2V0KTtcXG5cIiArXG5cIiAgcmV0dXJuIHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwidmVjNCBiX3hfaXNvbWV0cmljKHZlYzQgcG9zaXRpb24sIGNvbnN0IHZlYzIgYXhpcywgY29uc3QgZmxvYXQgbXVsdGlwbGllcikge1xcblwiICtcblwiICBwb3NpdGlvbi54eSArPSBwb3NpdGlvbi56ICogYXhpcyAqIG11bHRpcGxpZXIgLyB1X2FzcGVjdDtcXG5cIiArXG5cIiAgcmV0dXJuIHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiZmxvYXQgY194X2NhbGN1bGF0ZVooZmxvYXQgeiwgZmxvYXQgbGF5ZXIsIGNvbnN0IGZsb2F0IG51bV9sYXllcnMsIGNvbnN0IGZsb2F0IHpfbGF5ZXJfc2NhbGUpIHtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllcl9yYW5nZSA9IChudW1fbGF5ZXJzICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllciA9IChsYXllciArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIHogPSB6X2xheWVyICsgY2xhbXAoeiwgMC4sIHpfbGF5ZXJfc2NhbGUpO1xcblwiICtcblwiICB6ID0gKHpfbGF5ZXJfcmFuZ2UgLSB6KSAvIHpfbGF5ZXJfcmFuZ2U7XFxuXCIgK1xuXCIgIHJldHVybiB6O1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBkX3hfcG9pbnRMaWdodCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIGZsb2F0IGxpZ2h0X2FtYmllbnQsIGNvbnN0IGJvb2wgYmFja2xpZ2h0KSB7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIGxpZ2h0X3Bvcy54eXopO1xcblwiICtcblwiICBjb2xvciAqPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjcHJhZ21hIHRhbmdyYW06IGdsb2JhbHNcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluKCkge1xcblwiICtcblwiICB2ZWM0IHBvc2l0aW9uID0gdV90aWxlX3ZpZXcgKiB2ZWM0KGFfcG9zaXRpb24sIDEuKTtcXG5cIiArXG5cIiAgI3ByYWdtYSB0YW5ncmFtOiB2ZXJ0ZXhcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIiAgdmVjNCBsaWdodF9wb3MgPSB2ZWM0KDAuLCAwLiwgMTUwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCwgMS4pO1xcblwiICtcblwiICBjb25zdCBmbG9hdCBsaWdodF9hbWJpZW50ID0gMC41O1xcblwiICtcblwiICBjb25zdCBib29sIGJhY2tsaXQgPSB0cnVlO1xcblwiICtcblwiICB2X2NvbG9yID0gZF94X3BvaW50TGlnaHQocG9zaXRpb24sIGFfbm9ybWFsLCBhX2NvbG9yLCBsaWdodF9wb3MsIGxpZ2h0X2FtYmllbnQsIGJhY2tsaXQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICB2X3Bvc2l0aW9uID0gcG9zaXRpb247XFxuXCIgK1xuXCIgIHZfbm9ybWFsID0gYV9ub3JtYWw7XFxuXCIgK1xuXCIgIHZfY29sb3IgPSBhX2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgcG9zaXRpb24gPSB1X21ldGVyX3ZpZXcgKiBwb3NpdGlvbjtcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoUFJPSkVDVElPTl9QRVJTUEVDVElWRSlcXG5cIiArXG5cIiAgcG9zaXRpb24gPSBhX3hfcGVyc3BlY3RpdmUocG9zaXRpb24sIHZlYzIoLTAuMjUsIC0wLjI1KSwgdmVjMigwLjYsIDAuNikpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKFBST0pFQ1RJT05fSVNPTUVUUklDKVxcblwiICtcblwiICBwb3NpdGlvbiA9IGJfeF9pc29tZXRyaWMocG9zaXRpb24sIHZlYzIoMC4sIDEuKSwgMS4pO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgcG9zaXRpb24ueiA9IGNfeF9jYWxjdWxhdGVaKHBvc2l0aW9uLnosIGFfbGF5ZXIsIHVfbnVtX2xheWVycywgNDA5Ni4pO1xcblwiICtcblwiICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbmlmIChtb2R1bGUuZXhwb3J0cyAhPT0gdW5kZWZpbmVkKSB7IG1vZHVsZS5leHBvcnRzID0gc2hhZGVyX3NvdXJjZXM7IH1cblxuIiwiLy8gVGV4dHVyZSBtYW5hZ2VtZW50XG5cbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wuanMnKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XG5cbi8vIEdsb2JhbCBzZXQgb2YgdGV4dHVyZXMsIGJ5IG5hbWVcbkdMVGV4dHVyZS50ZXh0dXJlcyA9IHt9O1xuXG4vLyBHTCB0ZXh0dXJlIHdyYXBwZXIgb2JqZWN0IGZvciBrZWVwaW5nIHRyYWNrIG9mIGEgZ2xvYmFsIHNldCBvZiB0ZXh0dXJlcywga2V5ZWQgYnkgYW4gYXJiaXRyYXJ5IG5hbWVcbmZ1bmN0aW9uIEdMVGV4dHVyZSAoZ2wsIG5hbWUsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmdsID0gZ2w7XG4gICAgdGhpcy50ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgIHRoaXMuYmluZCgwKTtcbiAgICB0aGlzLmltYWdlID0gbnVsbDtcblxuICAgIC8vIERlZmF1bHQgdG8gYSAxLXBpeGVsIGJsYWNrIHRleHR1cmUgc28gd2UgY2FuIHNhZmVseSByZW5kZXIgd2hpbGUgd2Ugd2FpdCBmb3IgYW4gaW1hZ2UgdG8gbG9hZFxuICAgIC8vIFNlZTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xOTcyMjI0Ny93ZWJnbC13YWl0LWZvci10ZXh0dXJlLXRvLWxvYWRcbiAgICB0aGlzLnNldERhdGEoMSwgMSwgbmV3IFVpbnQ4QXJyYXkoWzAsIDAsIDAsIDI1NV0pLCB7IGZpbHRlcmluZzogJ25lYXJlc3QnIH0pO1xuXG4gICAgLy8gVE9ETzogYmV0dGVyIHN1cHBvcnQgZm9yIG5vbi1VUkwgc291cmNlczogY2FudmFzL3ZpZGVvIGVsZW1lbnRzLCByYXcgcGl4ZWwgYnVmZmVyc1xuXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICBHTFRleHR1cmUudGV4dHVyZXNbdGhpcy5uYW1lXSA9IHRoaXM7XG59O1xuXG5HTFRleHR1cmUucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAodW5pdCkge1xuICAgIHRoaXMuZ2wuYWN0aXZlVGV4dHVyZSh0aGlzLmdsLlRFWFRVUkUwICsgdW5pdCk7XG4gICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0aGlzLmdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG59O1xuXG4vLyBMb2FkcyBhIHRleHR1cmUgZnJvbSBhIFVSTFxuR0xUZXh0dXJlLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLndpZHRoID0gdGhpcy5pbWFnZS53aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmltYWdlLmhlaWdodDtcbiAgICAgICAgdGhpcy5kYXRhID0gbnVsbDsgLy8gbXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggZGlyZWN0IGRhdGEgYnVmZmVyIHRleHR1cmVzXG4gICAgICAgIHRoaXMudXBkYXRlKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLnNldFRleHR1cmVGaWx0ZXJpbmcob3B0aW9ucyk7XG4gICAgfS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuaW1hZ2Uuc3JjID0gdXJsO1xufTtcblxuLy8gU2V0cyB0ZXh0dXJlIHRvIGEgcmF3IGltYWdlIGJ1ZmZlclxuR0xUZXh0dXJlLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLmltYWdlID0gbnVsbDsgLy8gbXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggaW1hZ2UgZWxlbWVudC1iYXNlZCB0ZXh0dXJlc1xuXG4gICAgdGhpcy51cGRhdGUob3B0aW9ucyk7XG4gICAgdGhpcy5zZXRUZXh0dXJlRmlsdGVyaW5nKG9wdGlvbnMpO1xufTtcblxuLy8gVXBsb2FkcyBjdXJyZW50IGltYWdlIG9yIGJ1ZmZlciB0byB0aGUgR1BVIChjYW4gYmUgdXNlZCB0byB1cGRhdGUgYW5pbWF0ZWQgdGV4dHVyZXMgb24gdGhlIGZseSlcbkdMVGV4dHVyZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuYmluZCgwKTtcbiAgICB0aGlzLmdsLnBpeGVsU3RvcmVpKHRoaXMuZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgKG9wdGlvbnMuVU5QQUNLX0ZMSVBfWV9XRUJHTCA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpKTtcblxuICAgIC8vIEltYWdlIGVsZW1lbnRcbiAgICBpZiAodGhpcy5pbWFnZSAmJiB0aGlzLmltYWdlLmNvbXBsZXRlKSB7XG4gICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRCh0aGlzLmdsLlRFWFRVUkVfMkQsIDAsIHRoaXMuZ2wuUkdCQSwgdGhpcy5nbC5SR0JBLCB0aGlzLmdsLlVOU0lHTkVEX0JZVEUsIHRoaXMuaW1hZ2UpO1xuICAgIH1cbiAgICAvLyBSYXcgaW1hZ2UgYnVmZmVyXG4gICAgZWxzZSBpZiAodGhpcy53aWR0aCAmJiB0aGlzLmhlaWdodCkgeyAvLyBOT1RFOiB0aGlzLmRhdGEgY2FuIGJlIG51bGwsIHRvIHplcm8gb3V0IHRleHR1cmVcbiAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMuZ2wuVEVYVFVSRV8yRCwgMCwgdGhpcy5nbC5SR0JBLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCwgdGhpcy5nbC5SR0JBLCB0aGlzLmdsLlVOU0lHTkVEX0JZVEUsIHRoaXMuZGF0YSk7XG4gICAgfVxufTtcblxuLy8gRGV0ZXJtaW5lcyBhcHByb3ByaWF0ZSBmaWx0ZXJpbmcgbW9kZVxuLy8gQXNzdW1lcyB0ZXh0dXJlIHRvIGJlIG9wZXJhdGVkIG9uIGlzIGFscmVhZHkgYm91bmRcbkdMVGV4dHVyZS5wcm90b3R5cGUuc2V0VGV4dHVyZUZpbHRlcmluZyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5maWx0ZXJpbmcgPSBvcHRpb25zLmZpbHRlcmluZyB8fCAnbWlwbWFwJzsgLy8gZGVmYXVsdCB0byBtaXBtYXBzIGZvciBwb3dlci1vZi0yIHRleHR1cmVzXG4gICAgdmFyIGdsID0gdGhpcy5nbDtcblxuICAgIC8vIEZvciBwb3dlci1vZi0yIHRleHR1cmVzLCB0aGUgZm9sbG93aW5nIHByZXNldHMgYXJlIGF2YWlsYWJsZTpcbiAgICAvLyBtaXBtYXA6IGxpbmVhciBibGVuZCBmcm9tIG5lYXJlc3QgbWlwXG4gICAgLy8gbGluZWFyOiBsaW5lYXIgYmxlbmQgZnJvbSBvcmlnaW5hbCBpbWFnZSAobm8gbWlwcylcbiAgICAvLyBuZWFyZXN0OiBuZWFyZXN0IHBpeGVsIGZyb20gb3JpZ2luYWwgaW1hZ2UgKG5vIG1pcHMsICdibG9ja3knIGxvb2spXG4gICAgaWYgKFV0aWxzLmlzUG93ZXJPZjIodGhpcy53aWR0aCkgJiYgVXRpbHMuaXNQb3dlck9mMih0aGlzLmhlaWdodCkpIHtcbiAgICAgICAgdGhpcy5wb3dlcl9vZl8yID0gdHJ1ZTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgb3B0aW9ucy5URVhUVVJFX1dSQVBfUyB8fCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgb3B0aW9ucy5URVhUVVJFX1dSQVBfVCB8fCBnbC5DTEFNUF9UT19FREdFKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5maWx0ZXJpbmcgPT0gJ21pcG1hcCcpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBNSVBNQVBcIik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmluZyA9ICdtaXBtYXAnO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCk7IC8vIFRPRE86IHVzZSB0cmlsaW5lYXIgZmlsdGVyaW5nIGJ5IGRlZnVhbHQgaW5zdGVhZD9cbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAoZ2wuVEVYVFVSRV8yRCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5maWx0ZXJpbmcgPT0gJ2xpbmVhcicpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBMSU5FQVJcIik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmluZyA9ICdsaW5lYXInO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmZpbHRlcmluZyA9PSAnbmVhcmVzdCcpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBORUFSRVNUXCIpO1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJpbmcgPSAnbmVhcmVzdCc7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIFdlYkdMIGhhcyBzdHJpY3QgcmVxdWlyZW1lbnRzIG9uIG5vbi1wb3dlci1vZi0yIHRleHR1cmVzOlxuICAgICAgICAvLyBObyBtaXBtYXBzIGFuZCBtdXN0IGNsYW1wIHRvIGVkZ2VcbiAgICAgICAgdGhpcy5wb3dlcl9vZl8yID0gZmFsc2U7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5maWx0ZXJpbmcgPT0gJ25lYXJlc3QnKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInBvd2VyLW9mLTIgTkVBUkVTVFwiKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyaW5nID0gJ25lYXJlc3QnO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvLyBkZWZhdWx0IHRvIGxpbmVhciBmb3Igbm9uLXBvd2VyLW9mLTIgdGV4dHVyZXNcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBMSU5FQVJcIik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmluZyA9ICdsaW5lYXInO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gR0xUZXh0dXJlO1xufVxuIiwiLy8gRGVzY3JpYmVzIGEgdmVydGV4IGxheW91dCB0aGF0IGNhbiBiZSB1c2VkIHdpdGggbWFueSBkaWZmZXJlbnQgR0wgcHJvZ3JhbXMuXG4vLyBJZiBhIGdpdmVuIHByb2dyYW0gZG9lc24ndCBpbmNsdWRlIGFsbCBhdHRyaWJ1dGVzLCBpdCBjYW4gc3RpbGwgdXNlIHRoZSB2ZXJ0ZXggbGF5b3V0XG4vLyB0byByZWFkIHRob3NlIGF0dHJpYnMgdGhhdCBpdCBkb2VzIHJlY29nbml6ZSwgdXNpbmcgdGhlIGF0dHJpYiBvZmZzZXRzIHRvIHNraXAgb3RoZXJzLlxuLy8gQXR0cmlicyBhcmUgYW4gYXJyYXksIGluIGxheW91dCBvcmRlciwgb2Y6IG5hbWUsIHNpemUsIHR5cGUsIG5vcm1hbGl6ZWRcbi8vIGV4OiB7IG5hbWU6ICdwb3NpdGlvbicsIHNpemU6IDMsIHR5cGU6IGdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9XG5mdW5jdGlvbiBHTFZlcnRleExheW91dCAoZ2wsIGF0dHJpYnMpXG57XG4gICAgdGhpcy5hdHRyaWJzID0gYXR0cmlicztcblxuICAgIC8vIENhbGMgdmVydGV4IHN0cmlkZVxuICAgIHRoaXMuc3RyaWRlID0gMDtcbiAgICBmb3IgKHZhciBhPTA7IGEgPCB0aGlzLmF0dHJpYnMubGVuZ3RoOyBhKyspIHtcbiAgICAgICAgdmFyIGF0dHJpYiA9IHRoaXMuYXR0cmlic1thXTtcblxuICAgICAgICBhdHRyaWIuYnl0ZV9zaXplID0gYXR0cmliLnNpemU7XG5cbiAgICAgICAgc3dpdGNoIChhdHRyaWIudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBnbC5GTE9BVDpcbiAgICAgICAgICAgIGNhc2UgZ2wuSU5UOlxuICAgICAgICAgICAgY2FzZSBnbC5VTlNJR05FRF9JTlQ6XG4gICAgICAgICAgICAgICAgYXR0cmliLmJ5dGVfc2l6ZSAqPSA0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBnbC5TSE9SVDpcbiAgICAgICAgICAgIGNhc2UgZ2wuVU5TSUdORURfU0hPUlQ6XG4gICAgICAgICAgICAgICAgYXR0cmliLmJ5dGVfc2l6ZSAqPSAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgYXR0cmliLm9mZnNldCA9IHRoaXMuc3RyaWRlO1xuICAgICAgICB0aGlzLnN0cmlkZSArPSBhdHRyaWIuYnl0ZV9zaXplO1xuICAgIH1cbn1cblxuLy8gVHJhY2sgY3VycmVudGx5IGVuYWJsZWQgYXR0cmlicywgYnkgdGhlIHByb2dyYW0gdGhleSBhcmUgYm91bmQgdG9cbkdMVmVydGV4TGF5b3V0LmVuYWJsZWRfYXR0cmlicyA9IHt9O1xuXG4vLyBTZXR1cCBhIHZlcnRleCBsYXlvdXQgZm9yIGEgc3BlY2lmaWMgR0wgcHJvZ3JhbVxuLy8gQXNzdW1lcyB0aGF0IHRoZSBkZXNpcmVkIHZlcnRleCBidWZmZXIgKFZCTykgaXMgYWxyZWFkeSBib3VuZFxuR0xWZXJ0ZXhMYXlvdXQucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uIChnbCwgZ2xfcHJvZ3JhbSlcbntcbiAgICAvLyBFbmFibGUgYWxsIGF0dHJpYnV0ZXMgZm9yIHRoaXMgbGF5b3V0XG4gICAgZm9yICh2YXIgYT0wOyBhIDwgdGhpcy5hdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIHZhciBhdHRyaWIgPSB0aGlzLmF0dHJpYnNbYV07XG4gICAgICAgIHZhciBsb2NhdGlvbiA9IGdsX3Byb2dyYW0uYXR0cmlidXRlKGF0dHJpYi5uYW1lKS5sb2NhdGlvbjtcblxuICAgICAgICBpZiAobG9jYXRpb24gIT0gLTEpIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcbiAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIobG9jYXRpb24sIGF0dHJpYi5zaXplLCBhdHRyaWIudHlwZSwgYXR0cmliLm5vcm1hbGl6ZWQsIHRoaXMuc3RyaWRlLCBhdHRyaWIub2Zmc2V0KTtcbiAgICAgICAgICAgIEdMVmVydGV4TGF5b3V0LmVuYWJsZWRfYXR0cmlic1tsb2NhdGlvbl0gPSBnbF9wcm9ncmFtO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGlzYWJsZSBhbnkgcHJldmlvdXNseSBib3VuZCBhdHRyaWJ1dGVzIHRoYXQgYXJlbid0IGZvciB0aGlzIGxheW91dFxuICAgIHZhciB1bnVzdWVkX2F0dHJpYnMgPSBbXTtcbiAgICBmb3IgKGxvY2F0aW9uIGluIEdMVmVydGV4TGF5b3V0LmVuYWJsZWRfYXR0cmlicykge1xuICAgICAgICBpZiAoR0xWZXJ0ZXhMYXlvdXQuZW5hYmxlZF9hdHRyaWJzW2xvY2F0aW9uXSAhPSBnbF9wcm9ncmFtKSB7XG4gICAgICAgICAgICBnbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkobG9jYXRpb24pO1xuICAgICAgICAgICAgdW51c3VlZF9hdHRyaWJzLnB1c2gobG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWFyayBhdHRyaWJzIGFzIHVudXNlZFxuICAgIGZvciAobG9jYXRpb24gaW4gdW51c3VlZF9hdHRyaWJzKSB7XG4gICAgICAgIGRlbGV0ZSBHTFZlcnRleExheW91dC5lbmFibGVkX2F0dHJpYnNbbG9jYXRpb25dO1xuICAgIH1cbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gR0xWZXJ0ZXhMYXlvdXQ7XG59XG4iLCJ2YXIgU2NlbmUgPSByZXF1aXJlKCcuL3NjZW5lLmpzJyk7XG5cbnZhciBMZWFmbGV0TGF5ZXIgPSBMLkdyaWRMYXllci5leHRlbmQoe1xuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgTC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLnNjZW5lID0gbmV3IFNjZW5lKHRoaXMub3B0aW9ucy52ZWN0b3JUaWxlU291cmNlLCB0aGlzLm9wdGlvbnMudmVjdG9yTGF5ZXJzLCB0aGlzLm9wdGlvbnMudmVjdG9yU3R5bGVzLCB7IG51bV93b3JrZXJzOiB0aGlzLm9wdGlvbnMubnVtV29ya2VycyB9KTtcbiAgICAgICAgdGhpcy5zY2VuZS5kZWJ1ZyA9IHRoaXMub3B0aW9ucy5kZWJ1ZztcbiAgICAgICAgdGhpcy5zY2VuZS5jb250aW51b3VzX2FuaW1hdGlvbiA9IGZhbHNlOyAvLyBzZXQgdG8gdHJ1ZSBmb3IgYW5pbWF0aW5vcywgZXRjLiAoZXZlbnR1YWxseSB3aWxsIGJlIGF1dG9tYXRlZClcbiAgICB9LFxuXG4gICAgLy8gRmluaXNoIGluaXRpYWxpemluZyBzY2VuZSBhbmQgc2V0dXAgZXZlbnRzIHdoZW4gbGF5ZXIgaXMgYWRkZWQgdG8gbWFwXG4gICAgb25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcbiAgICAgICAgdmFyIGxheWVyID0gdGhpcztcblxuICAgICAgICBsYXllci5vbigndGlsZXVubG9hZCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSBldmVudC50aWxlO1xuICAgICAgICAgICAgdmFyIGtleSA9IHRpbGUuZ2V0QXR0cmlidXRlKCdkYXRhLXRpbGUta2V5Jyk7XG4gICAgICAgICAgICBsYXllci5zY2VuZS5yZW1vdmVUaWxlKGtleSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxheWVyLl9tYXAub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBzaXplID0gbGF5ZXIuX21hcC5nZXRTaXplKCk7XG4gICAgICAgICAgICBsYXllci5zY2VuZS5yZXNpemVNYXAoc2l6ZS54LCBzaXplLnkpO1xuICAgICAgICAgICAgbGF5ZXIudXBkYXRlQm91bmRzKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxheWVyLl9tYXAub24oJ21vdmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY2VudGVyID0gbGF5ZXIuX21hcC5nZXRDZW50ZXIoKTtcbiAgICAgICAgICAgIGxheWVyLnNjZW5lLnNldENlbnRlcihjZW50ZXIubG5nLCBjZW50ZXIubGF0KTtcbiAgICAgICAgICAgIGxheWVyLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsYXllci5fbWFwLm9uKCd6b29tc3RhcnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1hcC56b29tc3RhcnQgXCIgKyBsYXllci5fbWFwLmdldFpvb20oKSk7XG4gICAgICAgICAgICBsYXllci5zY2VuZS5zdGFydFpvb20oKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF5ZXIuX21hcC5vbignem9vbWVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibWFwLnpvb21lbmQgXCIgKyBsYXllci5fbWFwLmdldFpvb20oKSk7XG4gICAgICAgICAgICBsYXllci5zY2VuZS5zZXRab29tKGxheWVyLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgICAgIGxheWVyLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsYXllci5fbWFwLm9uKCdkcmFnc3RhcnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsYXllci5zY2VuZS5wYW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF5ZXIuX21hcC5vbignZHJhZ2VuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxheWVyLnNjZW5lLnBhbm5pbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2FudmFzIGVsZW1lbnQgd2lsbCBiZSBpbnNlcnRlZCBhZnRlciBtYXAgY29udGFpbmVyIChsZWFmbGV0IHRyYW5zZm9ybXMgc2hvdWxkbid0IGJlIGFwcGxpZWQgdG8gdGhlIEdMIGNhbnZhcylcbiAgICAgICAgLy8gVE9ETzogZmluZCBhIGJldHRlciB3YXkgdG8gZGVhbCB3aXRoIHRoaXM/IHJpZ2h0IG5vdyBHTCBtYXAgb25seSByZW5kZXJzIGNvcnJlY3RseSBhcyB0aGUgYm90dG9tIGxheWVyXG4gICAgICAgIGxheWVyLnNjZW5lLmNvbnRhaW5lciA9IGxheWVyLl9tYXAuZ2V0Q29udGFpbmVyKCk7XG5cbiAgICAgICAgdmFyIGNlbnRlciA9IGxheWVyLl9tYXAuZ2V0Q2VudGVyKCk7XG4gICAgICAgIGxheWVyLnNjZW5lLnNldENlbnRlcihjZW50ZXIubG5nLCBjZW50ZXIubGF0KTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ6b29tOiBcIiArIGxheWVyLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgbGF5ZXIuc2NlbmUuc2V0Wm9vbShsYXllci5fbWFwLmdldFpvb20oKSk7XG4gICAgICAgIGxheWVyLnVwZGF0ZUJvdW5kcygpO1xuXG4gICAgICAgIEwuR3JpZExheWVyLnByb3RvdHlwZS5vbkFkZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgIC8vIFVzZSBsZWFmbGV0J3MgZXhpc3RpbmcgZXZlbnQgc3lzdGVtIGFzIHRoZSBjYWxsYmFjayBtZWNoYW5pc21cbiAgICAgICAgbGF5ZXIuc2NlbmUuaW5pdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxheWVyLmZpcmUoJ2luaXQnKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgICAgIEwuR3JpZExheWVyLnByb3RvdHlwZS5vblJlbW92ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAvLyBUT0RPOiByZW1vdmUgZXZlbnQgaGFuZGxlcnMsIGRlc3Ryb3kgbWFwXG4gICAgfSxcblxuICAgIGNyZWF0ZVRpbGU6IGZ1bmN0aW9uIChjb29yZHMsIGRvbmUpIHtcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aGlzLnNjZW5lLmxvYWRUaWxlKGNvb3JkcywgZGl2LCBkb25lKTtcbiAgICAgICAgcmV0dXJuIGRpdjtcbiAgICB9LFxuXG4gICAgdXBkYXRlQm91bmRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsYXllciA9IHRoaXM7XG4gICAgICAgIHZhciBib3VuZHMgPSBsYXllci5fbWFwLmdldEJvdW5kcygpO1xuICAgICAgICBsYXllci5zY2VuZS5zZXRCb3VuZHMoYm91bmRzLmdldFNvdXRoV2VzdCgpLCBib3VuZHMuZ2V0Tm9ydGhFYXN0KCkpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zY2VuZS5yZW5kZXIoKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgbGVhZmxldExheWVyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IExlYWZsZXRMYXllcihvcHRpb25zKTtcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBMZWFmbGV0TGF5ZXI6IExlYWZsZXRMYXllcixcbiAgICAgICAgbGVhZmxldExheWVyOiBsZWFmbGV0TGF5ZXJcbiAgICB9O1xufVxuIiwiLy8gTW9kdWxlcyBhbmQgZGVwZW5kZW5jaWVzIHRvIGV4cG9zZSBpbiB0aGUgcHVibGljIFRhbmdyYW0gbW9kdWxlXG5cbi8vIFRoZSBsZWFmbGV0IGxheWVyIHBsdWdpbiBpcyBjdXJyZW50bHkgdGhlIHByaW1hcnkgbWVhbnMgb2YgdXNpbmcgdGhlIGxpYnJhcnlcbnZhciBMZWFmbGV0ID0gcmVxdWlyZSgnLi9sZWFmbGV0X2xheWVyLmpzJyk7XG5cbi8vIEdMIGZ1bmN0aW9ucyBpbmNsdWRlZCBmb3IgZWFzaWVyIGRlYnVnZ2luZyAvIGRpcmVjdCBhY2Nlc3MgdG8gc2V0dGluZyBnbG9iYWwgZGVmaW5lcywgcmVsb2FkaW5nIHByb2dyYW1zLCBldGMuXG52YXIgR0wgPSByZXF1aXJlKCcuL2dsL2dsLmpzJyk7XG5HTC5Qcm9ncmFtID0gcmVxdWlyZSgnLi9nbC9nbF9wcm9ncmFtLmpzJyk7XG5HTC5UZXh0dXJlID0gcmVxdWlyZSgnLi9nbC9nbF90ZXh0dXJlLmpzJyk7XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBMZWFmbGV0TGF5ZXI6IExlYWZsZXQuTGVhZmxldExheWVyLFxuICAgICAgICBsZWFmbGV0TGF5ZXI6IExlYWZsZXQubGVhZmxldExheWVyLFxuICAgICAgICBHTDogR0xcbiAgICB9O1xufVxuIiwiLy8gUG9pbnRcbmZ1bmN0aW9uIFBvaW50ICh4LCB5KVxue1xuICAgIHJldHVybiB7IHg6IHgsIHk6IHkgfTtcbn1cblxuUG9pbnQuY29weSA9IGZ1bmN0aW9uIChwKVxue1xuICAgIGlmIChwID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7IHg6IHAueCwgeTogcC55IH07XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFBvaW50O1xufVxuIiwidmFyIFBvaW50ID0gcmVxdWlyZSgnLi9wb2ludC5qcycpO1xudmFyIEdlbyA9IHJlcXVpcmUoJy4vZ2VvLmpzJyk7XG52YXIgU3R5bGUgPSByZXF1aXJlKCcuL3N0eWxlLmpzJyk7XG52YXIgTW9kZU1hbmFnZXIgPSByZXF1aXJlKCcuL2dsL2dsX21vZGVzJykuTW9kZU1hbmFnZXI7XG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzLmpzJyk7XG52YXIgUXVldWUgPSByZXF1aXJlKCdxdWV1ZS1hc3luYycpO1xuXG52YXIgR0wgPSByZXF1aXJlKCcuL2dsL2dsLmpzJyk7XG52YXIgR0xQcm9ncmFtID0gcmVxdWlyZSgnLi9nbC9nbF9wcm9ncmFtLmpzJyk7XG52YXIgR0xCdWlsZGVycyA9IHJlcXVpcmUoJy4vZ2wvZ2xfYnVpbGRlcnMuanMnKTtcbnZhciBHTFRleHR1cmUgPSByZXF1aXJlKCcuL2dsL2dsX3RleHR1cmUuanMnKTtcblxudmFyIG1hdDQgPSByZXF1aXJlKCdnbC1tYXRyaXgnKS5tYXQ0O1xudmFyIHZlYzMgPSByZXF1aXJlKCdnbC1tYXRyaXgnKS52ZWMzO1xuXG4vLyBTZXR1cCB0aGF0IGhhcHBlbnMgb24gbWFpbiB0aHJlYWQgb25seSAoc2tpcCBpbiB3ZWIgd29ya2VyKVxudmFyIHlhbWw7XG5VdGlscy5ydW5JZkluTWFpblRocmVhZChmdW5jdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgICB5YW1sID0gcmVxdWlyZSgnanMteWFtbCcpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vIFlBTUwgc3VwcG9ydCwganMteWFtbCBtb2R1bGUgbm90IGZvdW5kXCIpO1xuICAgIH1cblxuICAgIGZpbmRCYXNlTGlicmFyeVVSTCgpO1xufSk7XG5cbi8vIEdsb2JhbCBzZXR1cFxuU2NlbmUudGlsZV9zY2FsZSA9IDQwOTY7IC8vIGNvb3JkaW5hdGVzIGFyZSBsb2NhbGx5IHNjYWxlZCB0byB0aGUgcmFuZ2UgWzAsIHRpbGVfc2NhbGVdXG5HZW8uc2V0VGlsZVNjYWxlKFNjZW5lLnRpbGVfc2NhbGUpO1xuR0xCdWlsZGVycy5zZXRUaWxlU2NhbGUoU2NlbmUudGlsZV9zY2FsZSk7XG5HTFByb2dyYW0uZGVmaW5lcy5USUxFX1NDQUxFID0gU2NlbmUudGlsZV9zY2FsZTtcblNjZW5lLmRlYnVnID0gZmFsc2U7XG5cbi8vIExheWVycyAmIHN0eWxlczogcGFzcyBhbiBvYmplY3QgZGlyZWN0bHksIG9yIGEgVVJMIGFzIHN0cmluZyB0byBsb2FkIHJlbW90ZWx5XG5mdW5jdGlvbiBTY2VuZSAodGlsZV9zb3VyY2UsIGxheWVycywgc3R5bGVzLCBvcHRpb25zKVxue1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgICB0aGlzLnRpbGVfc291cmNlID0gdGlsZV9zb3VyY2U7XG4gICAgdGhpcy50aWxlcyA9IHt9O1xuICAgIHRoaXMucXVldWVkX3RpbGVzID0gW107XG4gICAgdGhpcy5udW1fd29ya2VycyA9IG9wdGlvbnMubnVtX3dvcmtlcnMgfHwgMTtcbiAgICB0aGlzLmFsbG93X2Nyb3NzX2RvbWFpbl93b3JrZXJzID0gKG9wdGlvbnMuYWxsb3dfY3Jvc3NfZG9tYWluX3dvcmtlcnMgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlKTtcblxuICAgIHRoaXMubGF5ZXJzID0gbGF5ZXJzO1xuICAgIHRoaXMuc3R5bGVzID0gc3R5bGVzO1xuXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7IC8vIHJlcXVlc3QgYSByZWRyYXdcbiAgICB0aGlzLmFuaW1hdGVkID0gZmFsc2U7IC8vIHJlcXVlc3QgcmVkcmF3IGV2ZXJ5IGZyYW1lXG5cbiAgICB0aGlzLmZyYW1lID0gMDtcbiAgICB0aGlzLnpvb20gPSBudWxsO1xuICAgIHRoaXMuY2VudGVyID0gbnVsbDtcbiAgICB0aGlzLmRldmljZV9waXhlbF9yYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG5cbiAgICB0aGlzLnpvb21pbmcgPSBmYWxzZTtcbiAgICB0aGlzLnBhbm5pbmcgPSBmYWxzZTtcblxuICAgIHRoaXMuY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXI7XG5cbiAgICB0aGlzLnJlc2V0VGltZSgpO1xufVxuXG5TY2VuZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChjYWxsYmFjaylcbntcbiAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTG9hZCBzY2VuZSBkZWZpbml0aW9uIChsYXllcnMsIHN0eWxlcywgZXRjLiksIHRoZW4gY3JlYXRlIG1vZGVzICYgd29ya2Vyc1xuICAgIHRoaXMubG9hZFNjZW5lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcXVldWUgPSBRdWV1ZSgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSByZW5kZXJpbmcgbW9kZXNcbiAgICAgICAgcXVldWUuZGVmZXIoZnVuY3Rpb24oY29tcGxldGUpIHtcbiAgICAgICAgICAgIHRoaXMubW9kZXMgPSBTY2VuZS5jcmVhdGVNb2Rlcyh0aGlzLnN0eWxlcyk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUFjdGl2ZU1vZGVzKCk7XG4gICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8vIENyZWF0ZSB3ZWIgd29ya2Vyc1xuICAgICAgICBxdWV1ZS5kZWZlcihmdW5jdGlvbihjb21wbGV0ZSkge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVXb3JrZXJzKGNvbXBsZXRlKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvLyBUaGVuIGNyZWF0ZSBHTCBjb250ZXh0XG4gICAgICAgIHF1ZXVlLmF3YWl0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGNhbnZhcyAmIEdMXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyIHx8IGRvY3VtZW50LmJvZHk7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmxlZnQgPSAwO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuekluZGV4ID0gLTE7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG5cbiAgICAgICAgICAgIHRoaXMuZ2wgPSBHTC5nZXRDb250ZXh0KHRoaXMuY2FudmFzKTtcbiAgICAgICAgICAgIHRoaXMucmVzaXplTWFwKHRoaXMuY29udGFpbmVyLmNsaWVudFdpZHRoLCB0aGlzLmNvbnRhaW5lci5jbGllbnRIZWlnaHQpO1xuXG4gICAgICAgICAgICB0aGlzLmluaXRNb2RlcygpOyAvLyBUT0RPOiByZW1vdmUgZ2wgY29udGV4dCBzdGF0ZSBmcm9tIG1vZGVzLCBhbmQgbW92ZSBpbml0IHRvIGNyZWF0ZSBzdGVwIGFib3ZlP1xuICAgICAgICAgICAgdGhpcy5pbml0U2VsZWN0aW9uQnVmZmVyKCk7XG5cbiAgICAgICAgICAgIC8vIHRoaXMuem9vbV9zdGVwID0gMC4wMjsgLy8gZm9yIGZyYWN0aW9uYWwgem9vbSB1c2VyIGFkanVzdG1lbnRcbiAgICAgICAgICAgIHRoaXMubGFzdF9yZW5kZXJfY291bnQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5pbml0SW5wdXRIYW5kbGVycygpO1xuXG4gICAgICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLmluaXRNb2RlcyA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gSW5pdCBHTCBjb250ZXh0IGZvciBtb2RlcyAoY29tcGlsZXMgcHJvZ3JhbXMsIGV0Yy4pXG4gICAgZm9yICh2YXIgbSBpbiB0aGlzLm1vZGVzKSB7XG4gICAgICAgIHRoaXMubW9kZXNbbV0uaW5pdCh0aGlzLmdsKTtcbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuaW5pdFNlbGVjdGlvbkJ1ZmZlciA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gU2VsZWN0aW9uIHN0YXRlIHRyYWNraW5nXG4gICAgdGhpcy5waXhlbCA9IG5ldyBVaW50OEFycmF5KDQpO1xuICAgIHRoaXMucGl4ZWwzMiA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5waXhlbC5idWZmZXIpO1xuICAgIHRoaXMuc2VsZWN0aW9uX3BvaW50ID0gUG9pbnQoMCwgMCk7XG4gICAgdGhpcy5zZWxlY3RlZF9mZWF0dXJlID0gbnVsbDtcbiAgICB0aGlzLnNlbGVjdGlvbl9jYWxsYmFjayA9IG51bGw7XG4gICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2tfdGltZXIgPSBudWxsO1xuICAgIHRoaXMuc2VsZWN0aW9uX2ZyYW1lX2RlbGF5ID0gNTsgLy8gZGVsYXkgZnJvbSBzZWxlY3Rpb24gcmVuZGVyIHRvIGZyYW1lYnVmZmVyIHNhbXBsZSwgdG8gYXZvaWQgQ1BVL0dQVSBzeW5jIGxvY2tcbiAgICB0aGlzLnVwZGF0ZV9zZWxlY3Rpb24gPSBmYWxzZTtcblxuICAgIC8vIEZyYW1lIGJ1ZmZlciBmb3Igc2VsZWN0aW9uXG4gICAgLy8gVE9ETzogaW5pdGlhdGUgbGF6aWx5IGluIGNhc2Ugd2UgZG9uJ3QgbmVlZCB0byBkbyBhbnkgc2VsZWN0aW9uXG4gICAgdGhpcy5mYm8gPSB0aGlzLmdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgdGhpcy5mYm8pO1xuICAgIHRoaXMuZmJvX3NpemUgPSB7IHdpZHRoOiAyNTYsIGhlaWdodDogMjU2IH07IC8vIFRPRE86IG1ha2UgY29uZmlndXJhYmxlIC8gYWRhcHRpdmUgYmFzZWQgb24gY2FudmFzIHNpemVcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0KTtcblxuICAgIC8vIFRleHR1cmUgZm9yIHRoZSBGQk8gY29sb3IgYXR0YWNobWVudFxuICAgIHRoaXMuZmJvX3RleHR1cmUgPSBuZXcgR0xUZXh0dXJlKHRoaXMuZ2wsICdzZWxlY3Rpb25fZmJvJyk7XG4gICAgdGhpcy5mYm9fdGV4dHVyZS5zZXREYXRhKHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0LCBudWxsLCB7IGZpbHRlcmluZzogJ25lYXJlc3QnIH0pO1xuICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQodGhpcy5nbC5GUkFNRUJVRkZFUiwgdGhpcy5nbC5DT0xPUl9BVFRBQ0hNRU5UMCwgdGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLmZib190ZXh0dXJlLnRleHR1cmUsIDApO1xuXG4gICAgLy8gUmVuZGVyYnVmZmVyIGZvciB0aGUgRkJPIGRlcHRoIGF0dGFjaG1lbnRcbiAgICB0aGlzLmZib19kZXB0aF9yYiA9IHRoaXMuZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmZib19kZXB0aF9yYik7XG4gICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmdsLkRFUFRIX0NPTVBPTkVOVDE2LCB0aGlzLmZib19zaXplLndpZHRoLCB0aGlzLmZib19zaXplLmhlaWdodCk7XG4gICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCB0aGlzLmdsLkRFUFRIX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmZib19kZXB0aF9yYik7XG5cbiAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xufTtcblxuLy8gV2ViIHdvcmtlcnMgaGFuZGxlIGhlYXZ5IGR1dHkgdGlsZSBjb25zdHJ1Y3Rpb246IG5ldHdvcmtpbmcsIGdlb21ldHJ5IHByb2Nlc3NpbmcsIGV0Yy5cblNjZW5lLnByb3RvdHlwZS5jcmVhdGVXb3JrZXJzID0gZnVuY3Rpb24gKGNhbGxiYWNrKVxue1xuICAgIHZhciBxdWV1ZSA9IFF1ZXVlKCk7XG4gICAgdmFyIHdvcmtlcl91cmwgPSBTY2VuZS5saWJyYXJ5X2Jhc2VfdXJsICsgJ3RhbmdyYW0td29ya2VyLm1pbi5qcycgKyAnPycgKyAoK25ldyBEYXRlKCkpO1xuXG4gICAgLy8gTG9hZCAmIGluc3RhbnRpYXRlIHdvcmtlcnNcbiAgICBxdWV1ZS5kZWZlcihmdW5jdGlvbihjb21wbGV0ZSkge1xuICAgICAgICAvLyBMb2NhbCBvYmplY3QgVVJMcyBzdXBwb3J0ZWQ/XG4gICAgICAgIHZhciBjcmVhdGVPYmplY3RVUkwgPSAod2luZG93LlVSTCAmJiB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTCkgfHwgKHdpbmRvdy53ZWJraXRVUkwgJiYgd2luZG93LndlYmtpdFVSTC5jcmVhdGVPYmplY3RVUkwpO1xuICAgICAgICBpZiAoY3JlYXRlT2JqZWN0VVJMICYmIHRoaXMuYWxsb3dfY3Jvc3NfZG9tYWluX3dvcmtlcnMpIHtcbiAgICAgICAgICAgIC8vIFRvIGFsbG93IHdvcmtlcnMgdG8gYmUgbG9hZGVkIGNyb3NzLWRvbWFpbiwgZmlyc3QgbG9hZCB3b3JrZXIgc291cmNlIHZpYSBYSFIsIHRoZW4gY3JlYXRlIGEgbG9jYWwgVVJMIHZpYSBhIGJsb2JcbiAgICAgICAgICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdvcmtlcl9sb2NhbF91cmwgPSBjcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW3JlcS5yZXNwb25zZV0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnIH0pKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1ha2VXb3JrZXJzKHdvcmtlcl9sb2NhbF91cmwpO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgICAgICByZXEub3BlbignR0VUJywgd29ya2VyX3VybCwgdHJ1ZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICAgICAgICAgIHJlcS5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgICAgICAgICByZXEuc2VuZCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRyYWRpdGlvbmFsIGxvYWQgZnJvbSByZW1vdGUgVVJMXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG4gICAgICAgICAgICB0aGlzLm1ha2VXb3JrZXJzKHdvcmtlcl91cmwpO1xuICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAvLyBJbml0IHdvcmtlcnNcbiAgICBxdWV1ZS5hd2FpdChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy53b3JrZXJzLmZvckVhY2goZnVuY3Rpb24od29ya2VyKSB7XG4gICAgICAgICAgICB3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMud29ya2VyQnVpbGRUaWxlQ29tcGxldGVkLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgd29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLndvcmtlckdldEZlYXR1cmVTZWxlY3Rpb24uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMud29ya2VyTG9nTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLm5leHRfd29ya2VyID0gMDtcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fbWFwX3dvcmtlcl9zaXplID0ge307XG5cbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8vIEluc3RhbnRpYXRlIHdvcmtlcnMgZnJvbSBVUkxcblNjZW5lLnByb3RvdHlwZS5tYWtlV29ya2VycyA9IGZ1bmN0aW9uICh1cmwpXG57XG4gICAgdGhpcy53b3JrZXJzID0gW107XG4gICAgZm9yICh2YXIgdz0wOyB3IDwgdGhpcy5udW1fd29ya2VyczsgdysrKSB7XG4gICAgICAgIHRoaXMud29ya2Vycy5wdXNoKG5ldyBXb3JrZXIodXJsKSk7XG4gICAgICAgIHRoaXMud29ya2Vyc1t3XS5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICB0eXBlOiAnaW5pdCcsXG4gICAgICAgICAgICB3b3JrZXJfaWQ6IHcsXG4gICAgICAgICAgICBudW1fd29ya2VyczogdGhpcy5udW1fd29ya2Vyc1xuICAgICAgICB9KVxuICAgIH1cbn07XG5cbi8vIFBvc3QgYSBtZXNzYWdlIGFib3V0IGEgdGlsZSB0byB0aGUgbmV4dCB3b3JrZXIgKHJvdW5kIHJvYmJpbilcblNjZW5lLnByb3RvdHlwZS53b3JrZXJQb3N0TWVzc2FnZUZvclRpbGUgPSBmdW5jdGlvbiAodGlsZSwgbWVzc2FnZSlcbntcbiAgICBpZiAodGlsZS53b3JrZXIgPT0gbnVsbCkge1xuICAgICAgICB0aWxlLndvcmtlciA9IHRoaXMubmV4dF93b3JrZXI7XG4gICAgICAgIHRoaXMubmV4dF93b3JrZXIgPSAodGlsZS53b3JrZXIgKyAxKSAlIHRoaXMud29ya2Vycy5sZW5ndGg7XG4gICAgfVxuICAgIHRoaXMud29ya2Vyc1t0aWxlLndvcmtlcl0ucG9zdE1lc3NhZ2UobWVzc2FnZSk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuc2V0Q2VudGVyID0gZnVuY3Rpb24gKGxuZywgbGF0KVxue1xuICAgIHRoaXMuY2VudGVyID0geyBsbmc6IGxuZywgbGF0OiBsYXQgfTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5zdGFydFpvb20gPSBmdW5jdGlvbiAoKVxue1xuICAgIHRoaXMubGFzdF96b29tID0gdGhpcy56b29tO1xuICAgIHRoaXMuem9vbWluZyA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb20gPSAyO1xuU2NlbmUucHJvdG90eXBlLnNldFpvb20gPSBmdW5jdGlvbiAoem9vbSlcbntcbiAgICAvLyBTY2hlZHVsZSBHTCB0aWxlcyBmb3IgcmVtb3ZhbCBvbiB6b29tXG4gICAgdmFyIGJlbG93ID0gem9vbTtcbiAgICB2YXIgYWJvdmUgPSB6b29tO1xuICAgIGlmICh0aGlzLmxhc3Rfem9vbSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2NlbmUubGFzdF96b29tOiBcIiArIHRoaXMubGFzdF96b29tKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKHpvb20gLSB0aGlzLmxhc3Rfem9vbSkgPD0gdGhpcy5wcmVzZXJ2ZV90aWxlc193aXRoaW5fem9vbSkge1xuICAgICAgICAgICAgaWYgKHpvb20gPiB0aGlzLmxhc3Rfem9vbSkge1xuICAgICAgICAgICAgICAgIGJlbG93ID0gem9vbSAtIHRoaXMucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb207XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhYm92ZSA9IHpvb20gKyB0aGlzLnByZXNlcnZlX3RpbGVzX3dpdGhpbl96b29tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5sYXN0X3pvb20gPSB0aGlzLnpvb207XG4gICAgdGhpcy56b29tID0gem9vbTtcbiAgICB0aGlzLmNhcHBlZF96b29tID0gTWF0aC5taW4ofn50aGlzLnpvb20sIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgfn50aGlzLnpvb20pO1xuICAgIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5yZW1vdmVUaWxlc091dHNpZGVab29tUmFuZ2UoYmVsb3csIGFib3ZlKTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZW1vdmVUaWxlc091dHNpZGVab29tUmFuZ2UgPSBmdW5jdGlvbiAoYmVsb3csIGFib3ZlKVxue1xuICAgIGJlbG93ID0gTWF0aC5taW4oYmVsb3csIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgYmVsb3cpO1xuICAgIGFib3ZlID0gTWF0aC5taW4oYWJvdmUsIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgYWJvdmUpO1xuXG4gICAgY29uc29sZS5sb2coXCJyZW1vdmVUaWxlc091dHNpZGVab29tUmFuZ2UgW1wiICsgYmVsb3cgKyBcIiwgXCIgKyBhYm92ZSArIFwiXSlcIik7XG4gICAgdmFyIHJlbW92ZV90aWxlcyA9IFtdO1xuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNbdF07XG4gICAgICAgIGlmICh0aWxlLmNvb3Jkcy56IDwgYmVsb3cgfHwgdGlsZS5jb29yZHMueiA+IGFib3ZlKSB7XG4gICAgICAgICAgICByZW1vdmVfdGlsZXMucHVzaCh0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciByPTA7IHIgPCByZW1vdmVfdGlsZXMubGVuZ3RoOyByKyspIHtcbiAgICAgICAgdmFyIGtleSA9IHJlbW92ZV90aWxlc1tyXTtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZW1vdmVkIFwiICsga2V5ICsgXCIgKG91dHNpZGUgcmFuZ2UgW1wiICsgYmVsb3cgKyBcIiwgXCIgKyBhYm92ZSArIFwiXSlcIik7XG4gICAgICAgIHRoaXMucmVtb3ZlVGlsZShrZXkpO1xuICAgIH1cbn07XG5cblNjZW5lLnByb3RvdHlwZS5zZXRCb3VuZHMgPSBmdW5jdGlvbiAoc3csIG5lKVxue1xuICAgIHRoaXMuYm91bmRzID0ge1xuICAgICAgICBzdzogeyBsbmc6IHN3LmxuZywgbGF0OiBzdy5sYXQgfSxcbiAgICAgICAgbmU6IHsgbG5nOiBuZS5sbmcsIGxhdDogbmUubGF0IH1cbiAgICB9O1xuXG4gICAgdmFyIGJ1ZmZlciA9IDIwMCAqIEdlby5tZXRlcnNfcGVyX3BpeGVsW35+dGhpcy56b29tXTsgLy8gcGl4ZWxzIC0+IG1ldGVyc1xuICAgIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzID0ge1xuICAgICAgICBzdzogR2VvLmxhdExuZ1RvTWV0ZXJzKFBvaW50KHRoaXMuYm91bmRzLnN3LmxuZywgdGhpcy5ib3VuZHMuc3cubGF0KSksXG4gICAgICAgIG5lOiBHZW8ubGF0TG5nVG9NZXRlcnMoUG9pbnQodGhpcy5ib3VuZHMubmUubG5nLCB0aGlzLmJvdW5kcy5uZS5sYXQpKVxuICAgIH07XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueCAtPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueSAtPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueCArPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueSArPSBidWZmZXI7XG5cbiAgICB0aGlzLmNlbnRlcl9tZXRlcnMgPSBQb2ludChcbiAgICAgICAgKHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzLnN3LnggKyB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5uZS54KSAvIDIsXG4gICAgICAgICh0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5zdy55ICsgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueSkgLyAyXG4gICAgKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKFwic2V0IHNjZW5lIGJvdW5kcyB0byBcIiArIEpTT04uc3RyaW5naWZ5KHRoaXMuYm91bmRzKSk7XG5cbiAgICAvLyBNYXJrIHRpbGVzIGFzIHZpc2libGUvaW52aXNpYmxlXG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUodGhpcy50aWxlc1t0XSk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuaXNUaWxlSW5ab29tID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgcmV0dXJuIChNYXRoLm1pbih0aWxlLmNvb3Jkcy56LCB0aGlzLnRpbGVfc291cmNlLm1heF96b29tIHx8IHRpbGUuY29vcmRzLnopID09IHRoaXMuY2FwcGVkX3pvb20pO1xufTtcblxuLy8gVXBkYXRlIHZpc2liaWxpdHkgYW5kIHJldHVybiB0cnVlIGlmIGNoYW5nZWRcblNjZW5lLnByb3RvdHlwZS51cGRhdGVWaXNpYmlsaXR5Rm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIHZhciB2aXNpYmxlID0gdGlsZS52aXNpYmxlO1xuICAgIHRpbGUudmlzaWJsZSA9IHRoaXMuaXNUaWxlSW5ab29tKHRpbGUpICYmIEdlby5ib3hJbnRlcnNlY3QodGlsZS5ib3VuZHMsIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzKTtcbiAgICB0aWxlLmNlbnRlcl9kaXN0ID0gTWF0aC5hYnModGhpcy5jZW50ZXJfbWV0ZXJzLnggLSB0aWxlLm1pbi54KSArIE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy55IC0gdGlsZS5taW4ueSk7XG4gICAgcmV0dXJuICh2aXNpYmxlICE9IHRpbGUudmlzaWJsZSk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucmVzaXplTWFwID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpXG57XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG5cbiAgICB0aGlzLmNzc19zaXplID0geyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH07XG4gICAgdGhpcy5kZXZpY2Vfc2l6ZSA9IHsgd2lkdGg6IE1hdGgucm91bmQodGhpcy5jc3Nfc2l6ZS53aWR0aCAqIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvKSwgaGVpZ2h0OiBNYXRoLnJvdW5kKHRoaXMuY3NzX3NpemUuaGVpZ2h0ICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8pIH07XG5cbiAgICB0aGlzLmNhbnZhcy5zdHlsZS53aWR0aCA9IHRoaXMuY3NzX3NpemUud2lkdGggKyAncHgnO1xuICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IHRoaXMuY3NzX3NpemUuaGVpZ2h0ICsgJ3B4JztcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuZGV2aWNlX3NpemUud2lkdGg7XG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQ7XG5cbiAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlcXVlc3RSZWRyYXcgPSBmdW5jdGlvbiAoKVxue1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuLy8gRGV0ZXJtaW5lIGEgWiB2YWx1ZSB0aGF0IHdpbGwgc3RhY2sgZmVhdHVyZXMgaW4gYSBcInBhaW50ZXIncyBhbGdvcml0aG1cIiBzdHlsZSwgZmlyc3QgYnkgbGF5ZXIsIHRoZW4gYnkgZHJhdyBvcmRlciB3aXRoaW4gbGF5ZXJcbi8vIEZlYXR1cmVzIGFyZSBhc3N1bWVkIHRvIGJlIGFscmVhZHkgc29ydGVkIGluIGRlc2lyZWQgZHJhdyBvcmRlciBieSB0aGUgbGF5ZXIgcHJlLXByb2Nlc3NvclxuU2NlbmUuY2FsY3VsYXRlWiA9IGZ1bmN0aW9uIChsYXllciwgdGlsZSwgbGF5ZXJfb2Zmc2V0LCBmZWF0dXJlX29mZnNldClcbntcbiAgICAvLyB2YXIgbGF5ZXJfb2Zmc2V0ID0gbGF5ZXJfb2Zmc2V0IHx8IDA7XG4gICAgLy8gdmFyIGZlYXR1cmVfb2Zmc2V0ID0gZmVhdHVyZV9vZmZzZXQgfHwgMDtcbiAgICB2YXIgeiA9IDA7IC8vIFRPRE86IG1hZGUgdGhpcyBhIG5vLW9wIHVudGlsIHJldmlzaXRpbmcgd2hlcmUgaXQgc2hvdWxkIGxpdmUgLSBvbmUtdGltZSBjYWxjIGhlcmUsIGluIHZlcnRleCBsYXlvdXQvc2hhZGVyLCBldGMuXG4gICAgcmV0dXJuIHo7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKClcbntcbiAgICB0aGlzLmxvYWRRdWV1ZWRUaWxlcygpO1xuXG4gICAgLy8gUmVuZGVyIG9uIGRlbWFuZFxuICAgIGlmICh0aGlzLmRpcnR5ID09IGZhbHNlIHx8IHRoaXMuaW5pdGlhbGl6ZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7IC8vIHN1YmNsYXNzZXMgY2FuIHNldCB0aGlzIGJhY2sgdG8gdHJ1ZSB3aGVuIGFuaW1hdGlvbiBpcyBuZWVkZWRcblxuICAgIHRoaXMucmVuZGVyR0woKTtcblxuICAgIC8vIFJlZHJhdyBldmVyeSBmcmFtZSBpZiBhbmltYXRpbmdcbiAgICBpZiAodGhpcy5hbmltYXRlZCA9PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuZnJhbWUrKztcblxuICAgIC8vIGNvbnNvbGUubG9nKFwicmVuZGVyIG1hcFwiKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZXNldEZyYW1lID0gZnVuY3Rpb24gKClcbntcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IGZyYW1lIHN0YXRlXG4gICAgdmFyIGdsID0gdGhpcy5nbDtcbiAgICBnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMCk7XG4gICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuXG4gICAgLy8gVE9ETzogdW5uZWNlc3NhcnkgcmVwZWF0P1xuICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICBnbC5kZXB0aEZ1bmMoZ2wuTEVTUyk7XG4gICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgZ2wuY3VsbEZhY2UoZ2wuQkFDSyk7XG4gICAgLy8gZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICAvLyBnbC5ibGVuZEZ1bmMoZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZW5kZXJHTCA9IGZ1bmN0aW9uICgpXG57XG4gICAgdmFyIGdsID0gdGhpcy5nbDtcblxuICAgIHRoaXMuaW5wdXQoKTtcbiAgICB0aGlzLnJlc2V0RnJhbWUoKTtcblxuICAgIC8vIE1hcCB0cmFuc2Zvcm1zXG4gICAgdmFyIGNlbnRlciA9IEdlby5sYXRMbmdUb01ldGVycyhQb2ludCh0aGlzLmNlbnRlci5sbmcsIHRoaXMuY2VudGVyLmxhdCkpO1xuICAgIHZhciBtZXRlcnNfcGVyX3BpeGVsID0gR2VvLm1pbl96b29tX21ldGVyc19wZXJfcGl4ZWwgLyBNYXRoLnBvdygyLCB0aGlzLnpvb20pO1xuICAgIHZhciBtZXRlcl96b29tID0gUG9pbnQodGhpcy5jc3Nfc2l6ZS53aWR0aCAvIDIgKiBtZXRlcnNfcGVyX3BpeGVsLCB0aGlzLmNzc19zaXplLmhlaWdodCAvIDIgKiBtZXRlcnNfcGVyX3BpeGVsKTtcblxuICAgIC8vIE1hdHJpY2VzXG4gICAgdmFyIHRpbGVfdmlld19tYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuICAgIHZhciB0aWxlX3dvcmxkX21hdCA9IG1hdDQuY3JlYXRlKCk7XG4gICAgdmFyIG1ldGVyX3ZpZXdfbWF0ID0gbWF0NC5jcmVhdGUoKTtcblxuICAgIC8vIENvbnZlcnQgbWVyY2F0b3IgbWV0ZXJzIHRvIHNjcmVlbiBzcGFjZVxuICAgIG1hdDQuc2NhbGUobWV0ZXJfdmlld19tYXQsIG1ldGVyX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXMoMSAvIG1ldGVyX3pvb20ueCwgMSAvIG1ldGVyX3pvb20ueSwgMSAvIG1ldGVyX3pvb20ueSkpO1xuXG4gICAgLy8gUmVuZGVyYWJsZSB0aWxlIGxpc3RcbiAgICB2YXIgcmVuZGVyYWJsZV90aWxlcyA9IFtdO1xuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNbdF07XG4gICAgICAgIGlmICh0aWxlLmxvYWRlZCA9PSB0cnVlICYmIHRpbGUudmlzaWJsZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICByZW5kZXJhYmxlX3RpbGVzLnB1c2godGlsZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5yZW5kZXJhYmxlX3RpbGVzX2NvdW50ID0gcmVuZGVyYWJsZV90aWxlcy5sZW5ndGg7XG5cbiAgICAvLyBSZW5kZXIgbWFpbiBwYXNzIC0gdGlsZXMgZ3JvdXBlZCBieSByZW5kZXJpbmcgbW9kZSAoR0wgcHJvZ3JhbSlcbiAgICB2YXIgcmVuZGVyX2NvdW50ID0gMDtcbiAgICBmb3IgKHZhciBtb2RlIGluIHRoaXMubW9kZXMpIHtcbiAgICAgICAgLy8gUGVyLWZyYW1lIG1vZGUgdXBkYXRlcy9hbmltYXRpb25zXG4gICAgICAgIC8vIENhbGxlZCBldmVuIGlmIHRoZSBtb2RlIGlzbid0IHJlbmRlcmVkIGJ5IGFueSBjdXJyZW50IHRpbGVzLCBzbyB0aW1lLWJhc2VkIGFuaW1hdGlvbnMsIGV0Yy4gY29udGludWVcbiAgICAgICAgdGhpcy5tb2Rlc1ttb2RlXS51cGRhdGUoKTtcblxuICAgICAgICB2YXIgZ2xfcHJvZ3JhbSA9IHRoaXMubW9kZXNbbW9kZV0uZ2xfcHJvZ3JhbTtcbiAgICAgICAgaWYgKGdsX3Byb2dyYW0gPT0gbnVsbCB8fCBnbF9wcm9ncmFtLmNvbXBpbGVkID09IGZhbHNlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmaXJzdF9mb3JfbW9kZSA9IHRydWU7XG5cbiAgICAgICAgLy8gUmVuZGVyIHRpbGUgR0wgZ2VvbWV0cmllc1xuICAgICAgICBmb3IgKHZhciB0IGluIHJlbmRlcmFibGVfdGlsZXMpIHtcbiAgICAgICAgICAgIHZhciB0aWxlID0gcmVuZGVyYWJsZV90aWxlc1t0XTtcblxuICAgICAgICAgICAgaWYgKHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIFNldHVwIG1vZGUgaWYgZW5jb3VudGVyaW5nIGZvciBmaXJzdCB0aW1lIHRoaXMgZnJhbWVcbiAgICAgICAgICAgICAgICAvLyAobGF6eSBpbml0LCBub3QgYWxsIG1vZGVzIHdpbGwgYmUgdXNlZCBpbiBhbGwgc2NyZWVuIHZpZXdzOyBzb21lIG1vZGVzIG1pZ2h0IGJlIGRlZmluZWQgYnV0IG5ldmVyIHVzZWQpXG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0X2Zvcl9tb2RlID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RfZm9yX21vZGUgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVzZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVzW21vZGVdLnNldFVuaWZvcm1zKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogZG9uJ3Qgc2V0IHVuaWZvcm1zIHdoZW4gdGhleSBoYXZlbid0IGNoYW5nZWRcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X3Jlc29sdXRpb24nLCB0aGlzLmRldmljZV9zaXplLndpZHRoLCB0aGlzLmRldmljZV9zaXplLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9hc3BlY3QnLCB0aGlzLmRldmljZV9zaXplLndpZHRoIC8gdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQsIDEuMCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV90aW1lJywgKCgrbmV3IERhdGUoKSkgLSB0aGlzLnN0YXJ0X3RpbWUpIC8gMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9tYXBfem9vbScsIHRoaXMuem9vbSk7IC8vIE1hdGguZmxvb3IodGhpcy56b29tKSArIChNYXRoLmxvZygodGhpcy56b29tICUgMSkgKyAxKSAvIE1hdGguTE4yIC8vIHNjYWxlIGZyYWN0aW9uYWwgem9vbSBieSBsb2dcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X21hcF9jZW50ZXInLCBjZW50ZXIueCwgY2VudGVyLnkpO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbnVtX2xheWVycycsIHRoaXMubGF5ZXJzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9tZXRlcnNfcGVyX3BpeGVsJywgbWV0ZXJzX3Blcl9waXhlbCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfbWV0ZXJfdmlldycsIGZhbHNlLCBtZXRlcl92aWV3X21hdCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogY2FsYyB0aGVzZSBvbmNlIHBlciB0aWxlIChjdXJyZW50bHkgYmVpbmcgbmVlZGxlc3NseSByZS1jYWxjdWxhdGVkIHBlci10aWxlLXBlci1tb2RlKVxuXG4gICAgICAgICAgICAgICAgLy8gVGlsZSBvcmlnaW5cbiAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfdGlsZV9vcmlnaW4nLCB0aWxlLm1pbi54LCB0aWxlLm1pbi55KTtcblxuICAgICAgICAgICAgICAgIC8vIFRpbGUgdmlldyBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHZpZXcgc3BhY2UgKG1ldGVycywgcmVsYXRpdmUgdG8gY2FtZXJhKVxuICAgICAgICAgICAgICAgIG1hdDQuaWRlbnRpdHkodGlsZV92aWV3X21hdCk7XG4gICAgICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGlsZV92aWV3X21hdCwgdGlsZV92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUubWluLnggLSBjZW50ZXIueCwgdGlsZS5taW4ueSAtIGNlbnRlci55LCAwKSk7IC8vIGFkanVzdCBmb3IgdGlsZSBvcmlnaW4gJiBtYXAgY2VudGVyXG4gICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5zcGFuLnggLyBTY2VuZS50aWxlX3NjYWxlLCAtMSAqIHRpbGUuc3Bhbi55IC8gU2NlbmUudGlsZV9zY2FsZSwgMSkpOyAvLyBzY2FsZSB0aWxlIGxvY2FsIGNvb3JkcyB0byBtZXRlcnNcbiAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJ01hdHJpeDRmdicsICd1X3RpbGVfdmlldycsIGZhbHNlLCB0aWxlX3ZpZXdfbWF0KTtcblxuICAgICAgICAgICAgICAgIC8vIFRpbGUgd29ybGQgbWF0cml4IC0gdHJhbnNmb3JtIHRpbGUgc3BhY2UgaW50byB3b3JsZCBzcGFjZSAobWV0ZXJzLCBhYnNvbHV0ZSBtZXJjYXRvciBwb3NpdGlvbilcbiAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfd29ybGRfbWF0KTtcbiAgICAgICAgICAgICAgICBtYXQ0LnRyYW5zbGF0ZSh0aWxlX3dvcmxkX21hdCwgdGlsZV93b3JsZF9tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLm1pbi54LCB0aWxlLm1pbi55LCAwKSk7XG4gICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3dvcmxkX21hdCwgdGlsZV93b3JsZF9tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLnNwYW4ueCAvIFNjZW5lLnRpbGVfc2NhbGUsIC0xICogdGlsZS5zcGFuLnkgLyBTY2VuZS50aWxlX3NjYWxlLCAxKSk7IC8vIHNjYWxlIHRpbGUgbG9jYWwgY29vcmRzIHRvIG1ldGVyc1xuICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfdGlsZV93b3JsZCcsIGZhbHNlLCB0aWxlX3dvcmxkX21hdCk7XG5cbiAgICAgICAgICAgICAgICAvLyBSZW5kZXIgdGlsZVxuICAgICAgICAgICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0ucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgcmVuZGVyX2NvdW50ICs9IHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0uZ2VvbWV0cnlfY291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW5kZXIgc2VsZWN0aW9uIHBhc3MgKGlmIG5lZWRlZClcbiAgICAvLyBTbGlnaHQgdmFyaWF0aW9ucyBvbiByZW5kZXIgcGFzcyBjb2RlIGFib3ZlIC0gbW9zdGx5IGJlY2F1c2Ugd2UncmUgcmV1c2luZyB1bmlmb3JtcyBmcm9tIHRoZSBtYWluXG4gICAgLy8gbW9kZSBwcm9ncmFtLCBmb3IgdGhlIHNlbGVjdGlvbiBwcm9ncmFtXG4gICAgLy8gVE9ETzogcmVkdWNlIGR1cGxpY2F0ZWQgY29kZSB3L21haW4gcmVuZGVyIHBhc3MgYWJvdmVcbiAgICBpZiAodGhpcy51cGRhdGVfc2VsZWN0aW9uKSB7XG4gICAgICAgIHRoaXMudXBkYXRlX3NlbGVjdGlvbiA9IGZhbHNlOyAvLyByZXNldCBzZWxlY3Rpb24gY2hlY2tcblxuICAgICAgICAvLyBUT0RPOiBxdWV1ZSBjYWxsYmFjayB0aWxsIHBhbm5pbmcgaXMgb3Zlcj8gY29vcmRzIHdoZXJlIHNlbGVjdGlvbiB3YXMgcmVxdWVzdGVkIGFyZSBvdXQgb2YgZGF0ZVxuICAgICAgICBpZiAodGhpcy5wYW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTd2l0Y2ggdG8gRkJPXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGhpcy5mYm8pO1xuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCB0aGlzLmZib19zaXplLndpZHRoLCB0aGlzLmZib19zaXplLmhlaWdodCk7XG4gICAgICAgIHRoaXMucmVzZXRGcmFtZSgpO1xuXG4gICAgICAgIGZvciAobW9kZSBpbiB0aGlzLm1vZGVzKSB7XG4gICAgICAgICAgICBnbF9wcm9ncmFtID0gdGhpcy5tb2Rlc1ttb2RlXS5zZWxlY3Rpb25fZ2xfcHJvZ3JhbTtcbiAgICAgICAgICAgIGlmIChnbF9wcm9ncmFtID09IG51bGwgfHwgZ2xfcHJvZ3JhbS5jb21waWxlZCA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaXJzdF9mb3JfbW9kZSA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIFJlbmRlciB0aWxlIEdMIGdlb21ldHJpZXNcbiAgICAgICAgICAgIGZvciAodCBpbiByZW5kZXJhYmxlX3RpbGVzKSB7XG4gICAgICAgICAgICAgICAgdGlsZSA9IHJlbmRlcmFibGVfdGlsZXNbdF07XG5cbiAgICAgICAgICAgICAgICBpZiAodGlsZS5nbF9nZW9tZXRyeVttb2RlXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNldHVwIG1vZGUgaWYgZW5jb3VudGVyaW5nIGZvciBmaXJzdCB0aW1lIHRoaXMgZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0X2Zvcl9tb2RlID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0X2Zvcl9tb2RlID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udXNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVzW21vZGVdLnNldFVuaWZvcm1zKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9yZXNvbHV0aW9uJywgdGhpcy5mYm9fc2l6ZS53aWR0aCwgdGhpcy5mYm9fc2l6ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X2FzcGVjdCcsIHRoaXMuZmJvX3NpemUud2lkdGggLyB0aGlzLmZib19zaXplLmhlaWdodCwgMS4wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV90aW1lJywgKCgrbmV3IERhdGUoKSkgLSB0aGlzLnN0YXJ0X3RpbWUpIC8gMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbWFwX3pvb20nLCB0aGlzLnpvb20pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X21hcF9jZW50ZXInLCBjZW50ZXIueCwgY2VudGVyLnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X251bV9sYXllcnMnLCB0aGlzLmxheWVycy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X21ldGVyc19wZXJfcGl4ZWwnLCBtZXRlcnNfcGVyX3BpeGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfbWV0ZXJfdmlldycsIGZhbHNlLCBtZXRlcl92aWV3X21hdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBUaWxlIG9yaWdpblxuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfdGlsZV9vcmlnaW4nLCB0aWxlLm1pbi54LCB0aWxlLm1pbi55KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaWxlIHZpZXcgbWF0cml4IC0gdHJhbnNmb3JtIHRpbGUgc3BhY2UgaW50byB2aWV3IHNwYWNlIChtZXRlcnMsIHJlbGF0aXZlIHRvIGNhbWVyYSlcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5pZGVudGl0eSh0aWxlX3ZpZXdfbWF0KTtcbiAgICAgICAgICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGlsZV92aWV3X21hdCwgdGlsZV92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUubWluLnggLSBjZW50ZXIueCwgdGlsZS5taW4ueSAtIGNlbnRlci55LCAwKSk7IC8vIGFkanVzdCBmb3IgdGlsZSBvcmlnaW4gJiBtYXAgY2VudGVyXG4gICAgICAgICAgICAgICAgICAgIG1hdDQuc2NhbGUodGlsZV92aWV3X21hdCwgdGlsZV92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUuc3Bhbi54IC8gU2NlbmUudGlsZV9zY2FsZSwgLTEgKiB0aWxlLnNwYW4ueSAvIFNjZW5lLnRpbGVfc2NhbGUsIDEpKTsgLy8gc2NhbGUgdGlsZSBsb2NhbCBjb29yZHMgdG8gbWV0ZXJzXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfdGlsZV92aWV3JywgZmFsc2UsIHRpbGVfdmlld19tYXQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbGUgd29ybGQgbWF0cml4IC0gdHJhbnNmb3JtIHRpbGUgc3BhY2UgaW50byB3b3JsZCBzcGFjZSAobWV0ZXJzLCBhYnNvbHV0ZSBtZXJjYXRvciBwb3NpdGlvbilcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5pZGVudGl0eSh0aWxlX3dvcmxkX21hdCk7XG4gICAgICAgICAgICAgICAgICAgIG1hdDQudHJhbnNsYXRlKHRpbGVfd29ybGRfbWF0LCB0aWxlX3dvcmxkX21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUubWluLngsIHRpbGUubWluLnksIDApKTtcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3dvcmxkX21hdCwgdGlsZV93b3JsZF9tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLnNwYW4ueCAvIFNjZW5lLnRpbGVfc2NhbGUsIC0xICogdGlsZS5zcGFuLnkgLyBTY2VuZS50aWxlX3NjYWxlLCAxKSk7IC8vIHNjYWxlIHRpbGUgbG9jYWwgY29vcmRzIHRvIG1ldGVyc1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJ01hdHJpeDRmdicsICd1X3RpbGVfd29ybGQnLCBmYWxzZSwgdGlsZV93b3JsZF9tYXQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbmRlciB0aWxlXG4gICAgICAgICAgICAgICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0ucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVsYXkgcmVhZGluZyB0aGUgcGl4ZWwgcmVzdWx0IGZyb20gdGhlIHNlbGVjdGlvbiBidWZmZXIgdG8gYXZvaWQgQ1BVL0dQVSBzeW5jIGxvY2suXG4gICAgICAgIC8vIENhbGxpbmcgcmVhZFBpeGVscyBzeW5jaHJvbm91c2x5IGNhdXNlZCBhIG1hc3NpdmUgcGVyZm9ybWFuY2UgaGl0LCBwcmVzdW1hYmx5IHNpbmNlIGl0XG4gICAgICAgIC8vIGZvcmNlZCB0aGlzIGZ1bmN0aW9uIHRvIHdhaXQgZm9yIHRoZSBHUFUgdG8gZmluaXNoIHJlbmRlcmluZyBhbmQgcmV0cmlldmUgdGhlIHRleHR1cmUgY29udGVudHMuXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGlvbl9jYWxsYmFja190aW1lciAhPSBudWxsKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5zZWxlY3Rpb25fY2FsbGJhY2tfdGltZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrX3RpbWVyID0gc2V0VGltZW91dChcbiAgICAgICAgICAgIHRoaXMucmVhZFNlbGVjdGlvbkJ1ZmZlci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25fZnJhbWVfZGVsYXlcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBSZXNldCB0byBzY3JlZW4gYnVmZmVyXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgIH1cblxuICAgIGlmIChyZW5kZXJfY291bnQgIT0gdGhpcy5sYXN0X3JlbmRlcl9jb3VudCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlbmRlcmVkIFwiICsgcmVuZGVyX2NvdW50ICsgXCIgcHJpbWl0aXZlc1wiKTtcbiAgICB9XG4gICAgdGhpcy5sYXN0X3JlbmRlcl9jb3VudCA9IHJlbmRlcl9jb3VudDtcblxuICAgIHJldHVybiB0cnVlO1xufTtcblxuLy8gUmVxdWVzdCBmZWF0dXJlIHNlbGVjdGlvblxuLy8gUnVucyBhc3luY2hyb25vdXNseSwgc2NoZWR1bGVzIHNlbGVjdGlvbiBidWZmZXIgdG8gYmUgdXBkYXRlZFxuU2NlbmUucHJvdG90eXBlLmdldEZlYXR1cmVBdCA9IGZ1bmN0aW9uIChwaXhlbCwgY2FsbGJhY2spXG57XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBxdWV1ZSBjYWxsYmFja3Mgd2hpbGUgc3RpbGwgcGVyZm9ybWluZyBvbmx5IG9uZSBzZWxlY3Rpb24gcmVuZGVyIHBhc3Mgd2l0aGluIFggdGltZSBpbnRlcnZhbD9cbiAgICBpZiAodGhpcy51cGRhdGVfc2VsZWN0aW9uID09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZWN0aW9uX3BvaW50ID0gUG9pbnQoXG4gICAgICAgIHBpeGVsLnggKiB0aGlzLmRldmljZV9waXhlbF9yYXRpbyxcbiAgICAgICAgdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQgLSAocGl4ZWwueSAqIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvKVxuICAgICk7XG4gICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLnVwZGF0ZV9zZWxlY3Rpb24gPSB0cnVlO1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlYWRTZWxlY3Rpb25CdWZmZXIgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBnbCA9IHRoaXMuZ2w7XG5cbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHRoaXMuZmJvKTtcblxuICAgIC8vIENoZWNrIHNlbGVjdGlvbiBtYXAgYWdhaW5zdCBGQk9cbiAgICBnbC5yZWFkUGl4ZWxzKFxuICAgICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnggKiB0aGlzLmZib19zaXplLndpZHRoIC8gdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCksXG4gICAgICAgIE1hdGguZmxvb3IodGhpcy5zZWxlY3Rpb25fcG9pbnQueSAqIHRoaXMuZmJvX3NpemUuaGVpZ2h0IC8gdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQpLFxuICAgICAgICAxLCAxLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCB0aGlzLnBpeGVsKTtcbiAgICB2YXIgZmVhdHVyZV9rZXkgPSAodGhpcy5waXhlbFswXSArICh0aGlzLnBpeGVsWzFdIDw8IDgpICsgKHRoaXMucGl4ZWxbMl0gPDwgMTYpICsgKHRoaXMucGl4ZWxbM10gPDwgMjQpKSA+Pj4gMDtcblxuICAgIC8vIGNvbnNvbGUubG9nKFxuICAgIC8vICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnggKiB0aGlzLmZib19zaXplLndpZHRoIC8gdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCkgKyBcIiwgXCIgK1xuICAgIC8vICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnkgKiB0aGlzLmZib19zaXplLmhlaWdodCAvIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0KSArIFwiOiAoXCIgK1xuICAgIC8vICAgICB0aGlzLnBpeGVsWzBdICsgXCIsIFwiICsgdGhpcy5waXhlbFsxXSArIFwiLCBcIiArIHRoaXMucGl4ZWxbMl0gKyBcIiwgXCIgKyB0aGlzLnBpeGVsWzNdICsgXCIpXCIpO1xuXG4gICAgLy8gSWYgZmVhdHVyZSBmb3VuZCwgYXNrIGFwcHJvcHJpYXRlIHdlYiB3b3JrZXIgdG8gbG9va3VwIGZlYXR1cmVcbiAgICB2YXIgd29ya2VyX2lkID0gdGhpcy5waXhlbFszXTtcbiAgICBpZiAod29ya2VyX2lkICE9IDI1NSkgeyAvLyAyNTUgaW5kaWNhdGVzIGFuIGVtcHR5IHNlbGVjdGlvbiBidWZmZXIgcGl4ZWxcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJ3b3JrZXJfaWQ6IFwiICsgd29ya2VyX2lkKTtcbiAgICAgICAgaWYgKHRoaXMud29ya2Vyc1t3b3JrZXJfaWRdICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG9zdCBtZXNzYWdlXCIpO1xuICAgICAgICAgICAgdGhpcy53b3JrZXJzW3dvcmtlcl9pZF0ucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdnZXRGZWF0dXJlU2VsZWN0aW9uJyxcbiAgICAgICAgICAgICAgICBrZXk6IGZlYXR1cmVfa2V5XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG59O1xuXG4vLyBDYWxsZWQgb24gbWFpbiB0aHJlYWQgd2hlbiBhIHdlYiB3b3JrZXIgZmluZHMgYSBmZWF0dXJlIGluIHRoZSBzZWxlY3Rpb24gYnVmZmVyXG5TY2VuZS5wcm90b3R5cGUud29ya2VyR2V0RmVhdHVyZVNlbGVjdGlvbiA9IGZ1bmN0aW9uIChldmVudClcbntcbiAgICBpZiAoZXZlbnQuZGF0YS50eXBlICE9ICdnZXRGZWF0dXJlU2VsZWN0aW9uJykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGZlYXR1cmUgPSBldmVudC5kYXRhLmZlYXR1cmU7XG4gICAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgICBpZiAoKGZlYXR1cmUgIT0gbnVsbCAmJiB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUgPT0gbnVsbCkgfHxcbiAgICAgICAgKGZlYXR1cmUgPT0gbnVsbCAmJiB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUgIT0gbnVsbCkgfHxcbiAgICAgICAgKGZlYXR1cmUgIT0gbnVsbCAmJiB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUgIT0gbnVsbCAmJiBmZWF0dXJlLmlkICE9IHRoaXMuc2VsZWN0ZWRfZmVhdHVyZS5pZCkpIHtcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5zZWxlY3RlZF9mZWF0dXJlID0gZmVhdHVyZTtcblxuICAgIGlmICh0eXBlb2YgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnNlbGVjdGlvbl9jYWxsYmFjayh7IGZlYXR1cmU6IHRoaXMuc2VsZWN0ZWRfZmVhdHVyZSwgY2hhbmdlZDogY2hhbmdlZCB9KTtcbiAgICB9XG59O1xuXG4vLyBRdWV1ZSBhIHRpbGUgZm9yIGxvYWRcblNjZW5lLnByb3RvdHlwZS5sb2FkVGlsZSA9IGZ1bmN0aW9uIChjb29yZHMsIGRpdiwgY2FsbGJhY2spXG57XG4gICAgdGhpcy5xdWV1ZWRfdGlsZXNbdGhpcy5xdWV1ZWRfdGlsZXMubGVuZ3RoXSA9IGFyZ3VtZW50cztcbn07XG5cbi8vIExvYWQgYWxsIHF1ZXVlZCB0aWxlc1xuU2NlbmUucHJvdG90eXBlLmxvYWRRdWV1ZWRUaWxlcyA9IGZ1bmN0aW9uICgpXG57XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5xdWV1ZWRfdGlsZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAodmFyIHQ9MDsgdCA8IHRoaXMucXVldWVkX3RpbGVzLmxlbmd0aDsgdCsrKSB7XG4gICAgICAgIHRoaXMuX2xvYWRUaWxlLmFwcGx5KHRoaXMsIHRoaXMucXVldWVkX3RpbGVzW3RdKTtcbiAgICB9XG5cbiAgICB0aGlzLnF1ZXVlZF90aWxlcyA9IFtdO1xufTtcblxuLy8gTG9hZCBhIHNpbmdsZSB0aWxlXG5TY2VuZS5wcm90b3R5cGUuX2xvYWRUaWxlID0gZnVuY3Rpb24gKGNvb3JkcywgZGl2LCBjYWxsYmFjaylcbntcbiAgICAvLyBPdmVyem9vbT9cbiAgICBpZiAoY29vcmRzLnogPiB0aGlzLnRpbGVfc291cmNlLm1heF96b29tKSB7XG4gICAgICAgIHZhciB6Z2FwID0gY29vcmRzLnogLSB0aGlzLnRpbGVfc291cmNlLm1heF96b29tO1xuICAgICAgICAvLyB2YXIgb3JpZ2luYWxfdGlsZSA9IFtjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56XS5qb2luKCcvJyk7XG4gICAgICAgIGNvb3Jkcy54ID0gfn4oY29vcmRzLnggLyBNYXRoLnBvdygyLCB6Z2FwKSk7XG4gICAgICAgIGNvb3Jkcy55ID0gfn4oY29vcmRzLnkgLyBNYXRoLnBvdygyLCB6Z2FwKSk7XG4gICAgICAgIGNvb3Jkcy5kaXNwbGF5X3ogPSBjb29yZHMuejsgLy8geiB3aXRob3V0IG92ZXJ6b29tXG4gICAgICAgIGNvb3Jkcy56IC09IHpnYXA7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiYWRqdXN0ZWQgZm9yIG92ZXJ6b29tLCB0aWxlIFwiICsgb3JpZ2luYWxfdGlsZSArIFwiIC0+IFwiICsgW2Nvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnpdLmpvaW4oJy8nKSk7XG4gICAgfVxuXG4gICAgdGhpcy50cmFja1RpbGVTZXRMb2FkU3RhcnQoKTtcblxuICAgIHZhciBrZXkgPSBbY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMuel0uam9pbignLycpO1xuXG4gICAgLy8gQWxyZWFkeSBsb2FkaW5nL2xvYWRlZD9cbiAgICBpZiAodGhpcy50aWxlc1trZXldKSB7XG4gICAgICAgIC8vIGlmICh0aGlzLnRpbGVzW2tleV0ubG9hZGVkID09IHRydWUpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwidXNlIGxvYWRlZCB0aWxlIFwiICsga2V5ICsgXCIgZnJvbSBjYWNoZVwiKTtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBpZiAodGhpcy50aWxlc1trZXldLmxvYWRpbmcgPT0gdHJ1ZSkge1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJhbHJlYWR5IGxvYWRpbmcgdGlsZSBcIiArIGtleSArIFwiLCBza2lwXCIpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBkaXYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNba2V5XSA9IHt9O1xuICAgIHRpbGUua2V5ID0ga2V5O1xuICAgIHRpbGUuY29vcmRzID0gY29vcmRzO1xuICAgIHRpbGUubWluID0gR2VvLm1ldGVyc0ZvclRpbGUodGlsZS5jb29yZHMpO1xuICAgIHRpbGUubWF4ID0gR2VvLm1ldGVyc0ZvclRpbGUoeyB4OiB0aWxlLmNvb3Jkcy54ICsgMSwgeTogdGlsZS5jb29yZHMueSArIDEsIHo6IHRpbGUuY29vcmRzLnogfSk7XG4gICAgdGlsZS5zcGFuID0geyB4OiAodGlsZS5tYXgueCAtIHRpbGUubWluLngpLCB5OiAodGlsZS5tYXgueSAtIHRpbGUubWluLnkpIH07XG4gICAgdGlsZS5ib3VuZHMgPSB7IHN3OiB7IHg6IHRpbGUubWluLngsIHk6IHRpbGUubWF4LnkgfSwgbmU6IHsgeDogdGlsZS5tYXgueCwgeTogdGlsZS5taW4ueSB9IH07XG4gICAgdGlsZS5kZWJ1ZyA9IHt9O1xuICAgIHRpbGUubG9hZGluZyA9IHRydWU7XG4gICAgdGlsZS5sb2FkZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuYnVpbGRUaWxlKHRpbGUua2V5KTtcbiAgICB0aGlzLnVwZGF0ZVRpbGVFbGVtZW50KHRpbGUsIGRpdik7XG4gICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5Rm9yVGlsZSh0aWxlKTtcblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhudWxsLCBkaXYpO1xuICAgIH1cbn07XG5cbi8vIFJlYnVpbGQgYWxsIHRpbGVzXG4vLyBUT0RPOiBhbHNvIHJlYnVpbGQgbW9kZXM/IChkZXRlY3QgaWYgY2hhbmdlZClcblNjZW5lLnByb3RvdHlwZS5yZWJ1aWxkVGlsZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGxheWVycyAmIHN0eWxlc1xuICAgIHRoaXMubGF5ZXJzX3NlcmlhbGl6ZWQgPSBVdGlscy5zZXJpYWxpemVXaXRoRnVuY3Rpb25zKHRoaXMubGF5ZXJzKTtcbiAgICB0aGlzLnN0eWxlc19zZXJpYWxpemVkID0gVXRpbHMuc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyh0aGlzLnN0eWxlcyk7XG4gICAgdGhpcy5zZWxlY3Rpb25fbWFwID0ge307XG5cbiAgICAvLyBUZWxsIHdvcmtlcnMgd2UncmUgYWJvdXQgdG8gcmVidWlsZCAoc28gdGhleSBjYW4gcmVmcmVzaCBzdHlsZXMsIGV0Yy4pXG4gICAgdGhpcy53b3JrZXJzLmZvckVhY2goZnVuY3Rpb24od29ya2VyKSB7XG4gICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICB0eXBlOiAncHJlcGFyZUZvclJlYnVpbGQnLFxuICAgICAgICAgICAgbGF5ZXJzOiB0aGlzLmxheWVyc19zZXJpYWxpemVkLFxuICAgICAgICAgICAgc3R5bGVzOiB0aGlzLnN0eWxlc19zZXJpYWxpemVkXG4gICAgICAgIH0pO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAvLyBSZWJ1aWxkIHZpc2libGUgdGlsZXMgZmlyc3QsIGZyb20gY2VudGVyIG91dFxuICAgIC8vIGNvbnNvbGUubG9nKFwiZmluZCB2aXNpYmxlXCIpO1xuICAgIHZhciB2aXNpYmxlID0gW10sIGludmlzaWJsZSA9IFtdO1xuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICBpZiAodGhpcy50aWxlc1t0XS52aXNpYmxlID09IHRydWUpIHtcbiAgICAgICAgICAgIHZpc2libGUucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGludmlzaWJsZS5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5sb2coXCJzb3J0IHZpc2libGUgZGlzdGFuY2VcIik7XG4gICAgdmlzaWJsZS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgLy8gdmFyIGFkID0gTWF0aC5hYnModGhpcy5jZW50ZXJfbWV0ZXJzLnggLSB0aGlzLnRpbGVzW2JdLm1pbi54KSArIE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy55IC0gdGhpcy50aWxlc1tiXS5taW4ueSk7XG4gICAgICAgIC8vIHZhciBiZCA9IE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy54IC0gdGhpcy50aWxlc1thXS5taW4ueCkgKyBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueSAtIHRoaXMudGlsZXNbYV0ubWluLnkpO1xuICAgICAgICB2YXIgYWQgPSB0aGlzLnRpbGVzW2FdLmNlbnRlcl9kaXN0O1xuICAgICAgICB2YXIgYmQgPSB0aGlzLnRpbGVzW2JdLmNlbnRlcl9kaXN0O1xuICAgICAgICByZXR1cm4gKGJkID4gYWQgPyAtMSA6IChiZCA9PSBhZCA/IDAgOiAxKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKFwiYnVpbGQgdmlzaWJsZVwiKTtcbiAgICBmb3IgKHZhciB0IGluIHZpc2libGUpIHtcbiAgICAgICAgdGhpcy5idWlsZFRpbGUodmlzaWJsZVt0XSk7XG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZCBpbnZpc2libGVcIik7XG4gICAgZm9yICh2YXIgdCBpbiBpbnZpc2libGUpIHtcbiAgICAgICAgLy8gS2VlcCB0aWxlcyBpbiBjdXJyZW50IHpvb20gYnV0IG91dCBvZiB2aXNpYmxlIHJhbmdlLCBidXQgcmVidWlsZCBhcyBsb3dlciBwcmlvcml0eVxuICAgICAgICBpZiAodGhpcy5pc1RpbGVJblpvb20odGhpcy50aWxlc1tpbnZpc2libGVbdF1dKSA9PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLmJ1aWxkVGlsZShpbnZpc2libGVbdF0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIERyb3AgdGlsZXMgb3V0c2lkZSBjdXJyZW50IHpvb21cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZVRpbGUoaW52aXNpYmxlW3RdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlQWN0aXZlTW9kZXMoKTtcbiAgICB0aGlzLnJlc2V0VGltZSgpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLmJ1aWxkVGlsZSA9IGZ1bmN0aW9uKGtleSlcbntcbiAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNba2V5XTtcblxuICAgIHRoaXMud29ya2VyUG9zdE1lc3NhZ2VGb3JUaWxlKHRpbGUsIHtcbiAgICAgICAgdHlwZTogJ2J1aWxkVGlsZScsXG4gICAgICAgIHRpbGU6IHtcbiAgICAgICAgICAgIGtleTogdGlsZS5rZXksXG4gICAgICAgICAgICBjb29yZHM6IHRpbGUuY29vcmRzLCAvLyB1c2VkIGJ5IHN0eWxlIGhlbHBlcnNcbiAgICAgICAgICAgIG1pbjogdGlsZS5taW4sIC8vIHVzZWQgYnkgVGlsZVNvdXJjZSB0byBzY2FsZSB0aWxlIHRvIGxvY2FsIGV4dGVudHNcbiAgICAgICAgICAgIG1heDogdGlsZS5tYXgsIC8vIHVzZWQgYnkgVGlsZVNvdXJjZSB0byBzY2FsZSB0aWxlIHRvIGxvY2FsIGV4dGVudHNcbiAgICAgICAgICAgIGRlYnVnOiB0aWxlLmRlYnVnXG4gICAgICAgIH0sXG4gICAgICAgIHRpbGVfc291cmNlOiB0aGlzLnRpbGVfc291cmNlLFxuICAgICAgICBsYXllcnM6IHRoaXMubGF5ZXJzX3NlcmlhbGl6ZWQsXG4gICAgICAgIHN0eWxlczogdGhpcy5zdHlsZXNfc2VyaWFsaXplZFxuICAgIH0pO1xufTtcblxuLy8gUHJvY2VzcyBnZW9tZXRyeSBmb3IgdGlsZSAtIGNhbGxlZCBieSB3ZWIgd29ya2VyXG4vLyBSZXR1cm5zIGEgc2V0IG9mIHRpbGUga2V5cyB0aGF0IHNob3VsZCBiZSBzZW50IHRvIHRoZSBtYWluIHRocmVhZCAoc28gdGhhdCB3ZSBjYW4gbWluaW1pemUgZGF0YSBleGNoYW5nZSBiZXR3ZWVuIHdvcmtlciBhbmQgbWFpbiB0aHJlYWQpXG5TY2VuZS5hZGRUaWxlID0gZnVuY3Rpb24gKHRpbGUsIGxheWVycywgc3R5bGVzLCBtb2RlcylcbntcbiAgICB2YXIgbGF5ZXIsIHN0eWxlLCBmZWF0dXJlLCB6LCBtb2RlO1xuICAgIHZhciB2ZXJ0ZXhfZGF0YSA9IHt9O1xuXG4gICAgLy8gSm9pbiBsaW5lIHRlc3QgcGF0dGVyblxuICAgIC8vIGlmIChTY2VuZS5kZWJ1Zykge1xuICAgIC8vICAgICB0aWxlLmxheWVyc1sncm9hZHMnXS5mZWF0dXJlcy5wdXNoKFNjZW5lLmJ1aWxkWmlnemFnTGluZVRlc3RQYXR0ZXJuKCkpO1xuICAgIC8vIH1cblxuICAgIC8vIEJ1aWxkIHJhdyBnZW9tZXRyeSBhcnJheXNcbiAgICB0aWxlLmRlYnVnLmZlYXR1cmVzID0gMDtcbiAgICBmb3IgKHZhciBsYXllcl9udW09MDsgbGF5ZXJfbnVtIDwgbGF5ZXJzLmxlbmd0aDsgbGF5ZXJfbnVtKyspIHtcbiAgICAgICAgbGF5ZXIgPSBsYXllcnNbbGF5ZXJfbnVtXTtcblxuICAgICAgICAvLyBTa2lwIGxheWVycyB3aXRoIG5vIHN0eWxlcyBkZWZpbmVkLCBvciBsYXllcnMgc2V0IHRvIG5vdCBiZSB2aXNpYmxlXG4gICAgICAgIGlmIChzdHlsZXMubGF5ZXJzW2xheWVyLm5hbWVdID09IG51bGwgfHwgc3R5bGVzLmxheWVyc1tsYXllci5uYW1lXS52aXNpYmxlID09IGZhbHNlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aWxlLmxheWVyc1tsYXllci5uYW1lXSAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgbnVtX2ZlYXR1cmVzID0gdGlsZS5sYXllcnNbbGF5ZXIubmFtZV0uZmVhdHVyZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICAvLyBSZW5kZXJpbmcgcmV2ZXJzZSBvcmRlciBha2EgdG9wIHRvIGJvdHRvbVxuICAgICAgICAgICAgZm9yICh2YXIgZiA9IG51bV9mZWF0dXJlcy0xOyBmID49IDA7IGYtLSkge1xuICAgICAgICAgICAgICAgIGZlYXR1cmUgPSB0aWxlLmxheWVyc1tsYXllci5uYW1lXS5mZWF0dXJlc1tmXTtcbiAgICAgICAgICAgICAgICBzdHlsZSA9IFN0eWxlLnBhcnNlU3R5bGVGb3JGZWF0dXJlKGZlYXR1cmUsIGxheWVyLm5hbWUsIHN0eWxlcy5sYXllcnNbbGF5ZXIubmFtZV0sIHRpbGUpO1xuXG4gICAgICAgICAgICAgICAgLy8gU2tpcCBmZWF0dXJlP1xuICAgICAgICAgICAgICAgIGlmIChzdHlsZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN0eWxlLmxheWVyX251bSA9IGxheWVyX251bTtcbiAgICAgICAgICAgICAgICBzdHlsZS56ID0gU2NlbmUuY2FsY3VsYXRlWihsYXllciwgdGlsZSkgKyBzdHlsZS56O1xuXG4gICAgICAgICAgICAgICAgdmFyIHBvaW50cyA9IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGxpbmVzID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcG9seWdvbnMgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9seWdvbnMgPSBbZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2x5Z29uJykge1xuICAgICAgICAgICAgICAgICAgICBwb2x5Z29ucyA9IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXMgPSBbZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlMaW5lU3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvaW50cyA9IFtmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdNdWx0aVBvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICBwb2ludHMgPSBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEZpcnN0IGZlYXR1cmUgaW4gdGhpcyByZW5kZXIgbW9kZT9cbiAgICAgICAgICAgICAgICBtb2RlID0gc3R5bGUubW9kZS5uYW1lO1xuICAgICAgICAgICAgICAgIGlmICh2ZXJ0ZXhfZGF0YVttb2RlXSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRleF9kYXRhW21vZGVdID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBvbHlnb25zICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZXNbbW9kZV0uYnVpbGRQb2x5Z29ucyhwb2x5Z29ucywgc3R5bGUsIHZlcnRleF9kYXRhW21vZGVdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGluZXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBtb2Rlc1ttb2RlXS5idWlsZExpbmVzKGxpbmVzLCBzdHlsZSwgdmVydGV4X2RhdGFbbW9kZV0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwb2ludHMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBtb2Rlc1ttb2RlXS5idWlsZFBvaW50cyhwb2ludHMsIHN0eWxlLCB2ZXJ0ZXhfZGF0YVttb2RlXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGlsZS5kZWJ1Zy5mZWF0dXJlcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGlsZS52ZXJ0ZXhfZGF0YSA9IHt9O1xuICAgIGZvciAodmFyIHMgaW4gdmVydGV4X2RhdGEpIHtcbiAgICAgICAgdGlsZS52ZXJ0ZXhfZGF0YVtzXSA9IG5ldyBGbG9hdDMyQXJyYXkodmVydGV4X2RhdGFbc10pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHZlcnRleF9kYXRhOiB0cnVlXG4gICAgfTtcbn07XG5cbi8vIENhbGxlZCBvbiBtYWluIHRocmVhZCB3aGVuIGEgd2ViIHdvcmtlciBjb21wbGV0ZXMgcHJvY2Vzc2luZyBmb3IgYSBzaW5nbGUgdGlsZSAoaW5pdGlhbCBsb2FkLCBvciByZWJ1aWxkKVxuU2NlbmUucHJvdG90eXBlLndvcmtlckJ1aWxkVGlsZUNvbXBsZXRlZCA9IGZ1bmN0aW9uIChldmVudClcbntcbiAgICBpZiAoZXZlbnQuZGF0YS50eXBlICE9ICdidWlsZFRpbGVDb21wbGV0ZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUcmFjayBzZWxlY3Rpb24gbWFwIHNpemUgKGZvciBzdGF0cy9kZWJ1ZykgLSB1cGRhdGUgcGVyIHdvcmtlciBhbmQgc3VtIGFjcm9zcyB3b3JrZXJzXG4gICAgdGhpcy5zZWxlY3Rpb25fbWFwX3dvcmtlcl9zaXplW2V2ZW50LmRhdGEud29ya2VyX2lkXSA9IGV2ZW50LmRhdGEuc2VsZWN0aW9uX21hcF9zaXplO1xuICAgIHRoaXMuc2VsZWN0aW9uX21hcF9zaXplID0gMDtcbiAgICBPYmplY3Qua2V5cyh0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemUpLmZvckVhY2goZnVuY3Rpb24odykgeyB0aGlzLnNlbGVjdGlvbl9tYXBfc2l6ZSArPSB0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemVbd107IH0uYmluZCh0aGlzKSk7XG4gICAgY29uc29sZS5sb2coXCJzZWxlY3Rpb24gbWFwOiBcIiArIHRoaXMuc2VsZWN0aW9uX21hcF9zaXplICsgXCIgZmVhdHVyZXNcIik7XG5cbiAgICB2YXIgdGlsZSA9IGV2ZW50LmRhdGEudGlsZTtcblxuICAgIC8vIFJlbW92ZWQgdGhpcyB0aWxlIGR1cmluZyBsb2FkP1xuICAgIGlmICh0aGlzLnRpbGVzW3RpbGUua2V5XSA9PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGlzY2FyZGVkIHRpbGUgXCIgKyB0aWxlLmtleSArIFwiIGluIFNjZW5lLnRpbGVXb3JrZXJDb21wbGV0ZWQgYmVjYXVzZSBwcmV2aW91c2x5IHJlbW92ZWRcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGlsZSB3aXRoIHByb3BlcnRpZXMgZnJvbSB3b3JrZXJcbiAgICB0aWxlID0gdGhpcy5tZXJnZVRpbGUodGlsZS5rZXksIHRpbGUpO1xuXG4gICAgdGhpcy5idWlsZEdMR2VvbWV0cnkodGlsZSk7XG5cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLnRyYWNrVGlsZVNldExvYWRFbmQoKTtcbiAgICB0aGlzLnByaW50RGVidWdGb3JUaWxlKHRpbGUpO1xufTtcblxuLy8gQ2FsbGVkIG9uIG1haW4gdGhyZWFkIHdoZW4gYSB3ZWIgd29ya2VyIGNvbXBsZXRlcyBwcm9jZXNzaW5nIGZvciBhIHNpbmdsZSB0aWxlXG5TY2VuZS5wcm90b3R5cGUuYnVpbGRHTEdlb21ldHJ5ID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgdmFyIHZlcnRleF9kYXRhID0gdGlsZS52ZXJ0ZXhfZGF0YTtcblxuICAgIC8vIENsZWFudXAgZXhpc3RpbmcgR0wgZ2VvbWV0cnkgb2JqZWN0c1xuICAgIHRoaXMuZnJlZVRpbGVSZXNvdXJjZXModGlsZSk7XG4gICAgdGlsZS5nbF9nZW9tZXRyeSA9IHt9O1xuXG4gICAgLy8gQ3JlYXRlIEdMIGdlb21ldHJ5IG9iamVjdHNcbiAgICBmb3IgKHZhciBzIGluIHZlcnRleF9kYXRhKSB7XG4gICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbc10gPSB0aGlzLm1vZGVzW3NdLm1ha2VHTEdlb21ldHJ5KHZlcnRleF9kYXRhW3NdKTtcbiAgICB9XG5cbiAgICB0aWxlLmRlYnVnLmdlb21ldHJpZXMgPSAwO1xuICAgIHRpbGUuZGVidWcuYnVmZmVyX3NpemUgPSAwO1xuICAgIGZvciAodmFyIHAgaW4gdGlsZS5nbF9nZW9tZXRyeSkge1xuICAgICAgICB0aWxlLmRlYnVnLmdlb21ldHJpZXMgKz0gdGlsZS5nbF9nZW9tZXRyeVtwXS5nZW9tZXRyeV9jb3VudDtcbiAgICAgICAgdGlsZS5kZWJ1Zy5idWZmZXJfc2l6ZSArPSB0aWxlLmdsX2dlb21ldHJ5W3BdLnZlcnRleF9kYXRhLmJ5dGVMZW5ndGg7XG4gICAgfVxuICAgIHRpbGUuZGVidWcuZ2VvbV9yYXRpbyA9ICh0aWxlLmRlYnVnLmdlb21ldHJpZXMgLyB0aWxlLmRlYnVnLmZlYXR1cmVzKS50b0ZpeGVkKDEpO1xuXG4gICAgZGVsZXRlIHRpbGUudmVydGV4X2RhdGE7IC8vIFRPRE86IG1pZ2h0IHdhbnQgdG8gcHJlc2VydmUgdGhpcyBmb3IgcmVidWlsZGluZyBnZW9tZXRyaWVzIHdoZW4gc3R5bGVzL2V0Yy4gY2hhbmdlP1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlbW92ZVRpbGUgPSBmdW5jdGlvbiAoa2V5KVxue1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJ0aWxlIHVubG9hZCBmb3IgXCIgKyBrZXkpO1xuXG4gICAgaWYgKHRoaXMuem9vbWluZyA9PSB0cnVlKSB7XG4gICAgICAgIHJldHVybjsgLy8gc2hvcnQgY2lyY3VpdCB0aWxlIHJlbW92YWwsIHdpbGwgc3dlZXAgb3V0IHRpbGVzIGJ5IHpvb20gbGV2ZWwgd2hlbiB6b29tIGVuZHNcbiAgICB9XG5cbiAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNba2V5XTtcblxuICAgIGlmICh0aWxlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5mcmVlVGlsZVJlc291cmNlcyh0aWxlKTtcblxuICAgICAgICAvLyBXZWIgd29ya2VyIHdpbGwgY2FuY2VsIFhIUiByZXF1ZXN0c1xuICAgICAgICB0aGlzLndvcmtlclBvc3RNZXNzYWdlRm9yVGlsZSh0aWxlLCB7XG4gICAgICAgICAgICB0eXBlOiAncmVtb3ZlVGlsZScsXG4gICAgICAgICAgICBrZXk6IHRpbGUua2V5XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRlbGV0ZSB0aGlzLnRpbGVzW2tleV07XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG4vLyBGcmVlIGFueSBHTCAvIG93bmVkIHJlc291cmNlc1xuU2NlbmUucHJvdG90eXBlLmZyZWVUaWxlUmVzb3VyY2VzID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgaWYgKHRpbGUgIT0gbnVsbCAmJiB0aWxlLmdsX2dlb21ldHJ5ICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgcCBpbiB0aWxlLmdsX2dlb21ldHJ5KSB7XG4gICAgICAgICAgICB0aWxlLmdsX2dlb21ldHJ5W3BdLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICB0aWxlLmdsX2dlb21ldHJ5ID0gbnVsbDtcbiAgICB9XG59O1xuXG4vLyBBdHRhY2hlcyB0cmFja2luZyBhbmQgZGVidWcgaW50byB0byB0aGUgcHJvdmlkZWQgdGlsZSBET00gZWxlbWVudFxuU2NlbmUucHJvdG90eXBlLnVwZGF0ZVRpbGVFbGVtZW50ID0gZnVuY3Rpb24gKHRpbGUsIGRpdilcbntcbiAgICAvLyBEZWJ1ZyBpbmZvXG4gICAgZGl2LnNldEF0dHJpYnV0ZSgnZGF0YS10aWxlLWtleScsIHRpbGUua2V5KTtcbiAgICBkaXYuc3R5bGUud2lkdGggPSAnMjU2cHgnO1xuICAgIGRpdi5zdHlsZS5oZWlnaHQgPSAnMjU2cHgnO1xuXG4gICAgaWYgKHRoaXMuZGVidWcpIHtcbiAgICAgICAgdmFyIGRlYnVnX292ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGVidWdfb3ZlcmxheS50ZXh0Q29udGVudCA9IHRpbGUua2V5O1xuICAgICAgICBkZWJ1Z19vdmVybGF5LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5sZWZ0ID0gMDtcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS50b3AgPSAwO1xuICAgICAgICBkZWJ1Z19vdmVybGF5LnN0eWxlLmNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5mb250U2l6ZSA9ICcxNnB4JztcbiAgICAgICAgLy8gZGVidWdfb3ZlcmxheS5zdHlsZS50ZXh0T3V0bGluZSA9ICcxcHggIzAwMDAwMCc7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChkZWJ1Z19vdmVybGF5KTtcblxuICAgICAgICBkaXYuc3R5bGUuYm9yZGVyU3R5bGUgPSAnc29saWQnO1xuICAgICAgICBkaXYuc3R5bGUuYm9yZGVyQ29sb3IgPSAnd2hpdGUnO1xuICAgICAgICBkaXYuc3R5bGUuYm9yZGVyV2lkdGggPSAnMXB4JztcbiAgICB9XG59O1xuXG4vLyBNZXJnZSBwcm9wZXJ0aWVzIGZyb20gYSBwcm92aWRlZCB0aWxlIG9iamVjdCBpbnRvIHRoZSBtYWluIHRpbGUgc3RvcmUuIFNoYWxsb3cgbWVyZ2UgKGp1c3QgY29waWVzIHRvcC1sZXZlbCBwcm9wZXJ0aWVzKSFcbi8vIFVzZWQgZm9yIHNlbGVjdGl2ZWx5IHVwZGF0aW5nIHByb3BlcnRpZXMgb2YgdGlsZXMgcGFzc2VkIGJldHdlZW4gbWFpbiB0aHJlYWQgYW5kIHdvcmtlclxuLy8gKHNvIHdlIGRvbid0IGhhdmUgdG8gcGFzcyB0aGUgd2hvbGUgdGlsZSwgaW5jbHVkaW5nIHNvbWUgcHJvcGVydGllcyB3aGljaCBjYW5ub3QgYmUgY2xvbmVkIGZvciBhIHdvcmtlcikuXG5TY2VuZS5wcm90b3R5cGUubWVyZ2VUaWxlID0gZnVuY3Rpb24gKGtleSwgc291cmNlX3RpbGUpXG57XG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV07XG5cbiAgICBpZiAodGlsZSA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMudGlsZXNba2V5XSA9IHNvdXJjZV90aWxlO1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlc1trZXldO1xuICAgIH1cblxuICAgIGZvciAodmFyIHAgaW4gc291cmNlX3RpbGUpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJtZXJnaW5nIFwiICsgcCArIFwiOiBcIiArIHNvdXJjZV90aWxlW3BdKTtcbiAgICAgICAgdGlsZVtwXSA9IHNvdXJjZV90aWxlW3BdO1xuICAgIH1cblxuICAgIHJldHVybiB0aWxlO1xufTtcblxuLy8gTG9hZCAob3IgcmVsb2FkKSB0aGUgc2NlbmUgY29uZmlnXG5TY2VuZS5wcm90b3R5cGUubG9hZFNjZW5lID0gZnVuY3Rpb24gKGNhbGxiYWNrKVxue1xuICAgIHZhciBxdWV1ZSA9IFF1ZXVlKCk7XG5cbiAgICAvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCB0aW1lIHdlJ3JlIGxvYWRpbmcgdGhlIHNjZW5lLCBjb3B5IGFueSBVUkxzXG4gICAgaWYgKCF0aGlzLmxheWVyX3NvdXJjZSAmJiB0eXBlb2YodGhpcy5sYXllcnMpID09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMubGF5ZXJfc291cmNlID0gVXRpbHMudXJsRm9yUGF0aCh0aGlzLmxheWVycyk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnN0eWxlX3NvdXJjZSAmJiB0eXBlb2YodGhpcy5zdHlsZXMpID09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuc3R5bGVfc291cmNlID0gVXRpbHMudXJsRm9yUGF0aCh0aGlzLnN0eWxlcyk7XG4gICAgfVxuXG4gICAgLy8gTGF5ZXIgYnkgVVJMXG4gICAgaWYgKHRoaXMubGF5ZXJfc291cmNlKSB7XG4gICAgICAgIHF1ZXVlLmRlZmVyKGZ1bmN0aW9uKGNvbXBsZXRlKSB7XG4gICAgICAgICAgICBTY2VuZS5sb2FkTGF5ZXJzKFxuICAgICAgICAgICAgICAgIHRoaXMubGF5ZXJfc291cmNlLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGxheWVycykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxheWVycyA9IGxheWVycztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXllcnNfc2VyaWFsaXplZCA9IFV0aWxzLnNlcmlhbGl6ZVdpdGhGdW5jdGlvbnModGhpcy5sYXllcnMpO1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvLyBTdHlsZSBieSBVUkxcbiAgICBpZiAodGhpcy5zdHlsZV9zb3VyY2UpIHtcbiAgICAgICAgcXVldWUuZGVmZXIoZnVuY3Rpb24oY29tcGxldGUpIHtcbiAgICAgICAgICAgIFNjZW5lLmxvYWRTdHlsZXMoXG4gICAgICAgICAgICAgICAgdGhpcy5zdHlsZV9zb3VyY2UsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oc3R5bGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3R5bGVzID0gc3R5bGVzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0eWxlc19zZXJpYWxpemVkID0gVXRpbHMuc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyh0aGlzLnN0eWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cbiAgICAvLyBTdHlsZSBvYmplY3RcbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBTY2VuZS5wb3N0UHJvY2Vzc1N0eWxlcyh0aGlzLnN0eWxlcyk7XG4gICAgfVxuXG4gICAgLy8gRXZlcnl0aGluZyBpcyBsb2FkZWRcbiAgICBxdWV1ZS5hd2FpdChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vLyBSZWxvYWQgc2NlbmUgY29uZmlnIGFuZCByZWJ1aWxkIHRpbGVzXG5TY2VuZS5wcm90b3R5cGUucmVsb2FkU2NlbmUgPSBmdW5jdGlvbiAoKVxue1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5sb2FkU2NlbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVidWlsZFRpbGVzKCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8vIENhbGxlZCAoY3VycmVudGx5IG1hbnVhbGx5KSBhZnRlciBtb2RlcyBhcmUgdXBkYXRlZCBpbiBzdHlsZXNoZWV0XG5TY2VuZS5wcm90b3R5cGUucmVmcmVzaE1vZGVzID0gZnVuY3Rpb24gKClcbntcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubW9kZXMgPSBTY2VuZS5yZWZyZXNoTW9kZXModGhpcy5tb2RlcywgdGhpcy5zdHlsZXMpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnVwZGF0ZUFjdGl2ZU1vZGVzID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBNYWtlIGEgc2V0IG9mIGN1cnJlbnRseSBhY3RpdmUgbW9kZXMgKHVzZWQgaW4gYSBsYXllcilcbiAgICB0aGlzLmFjdGl2ZV9tb2RlcyA9IHt9O1xuICAgIHZhciBhbmltYXRlZCA9IGZhbHNlOyAvLyBpcyBhbnkgYWN0aXZlIG1vZGUgYW5pbWF0ZWQ/XG4gICAgZm9yICh2YXIgbCBpbiB0aGlzLnN0eWxlcy5sYXllcnMpIHtcbiAgICAgICAgdmFyIG1vZGUgPSB0aGlzLnN0eWxlcy5sYXllcnNbbF0ubW9kZS5uYW1lO1xuICAgICAgICBpZiAodGhpcy5zdHlsZXMubGF5ZXJzW2xdLnZpc2libGUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZV9tb2Rlc1ttb2RlXSA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgbW9kZSBpcyBhbmltYXRlZFxuICAgICAgICAgICAgaWYgKGFuaW1hdGVkID09IGZhbHNlICYmIHRoaXMubW9kZXNbbW9kZV0uYW5pbWF0ZWQgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGFuaW1hdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmFuaW1hdGVkID0gYW5pbWF0ZWQ7XG59O1xuXG4vLyBSZXNldCBpbnRlcm5hbCBjbG9jaywgbW9zdGx5IHVzZWZ1bCBmb3IgY29uc2lzdGVudCBleHBlcmllbmNlIHdoZW4gY2hhbmdpbmcgbW9kZXMvZGVidWdnaW5nXG5TY2VuZS5wcm90b3R5cGUucmVzZXRUaW1lID0gZnVuY3Rpb24gKClcbntcbiAgICB0aGlzLnN0YXJ0X3RpbWUgPSArbmV3IERhdGUoKTtcbn07XG5cbi8vIFVzZXIgaW5wdXRcbi8vIFRPRE86IHJlc3RvcmUgZnJhY3Rpb25hbCB6b29tIHN1cHBvcnQgb25jZSBsZWFmbGV0IGFuaW1hdGlvbiByZWZhY3RvciBwdWxsIHJlcXVlc3QgaXMgbWVyZ2VkXG5cblNjZW5lLnByb3RvdHlwZS5pbml0SW5wdXRIYW5kbGVycyA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gdGhpcy5rZXkgPSBudWxsO1xuXG4gICAgLy8gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIC8vICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PSAzNykge1xuICAgIC8vICAgICAgICAgdGhpcy5rZXkgPSAnbGVmdCc7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PSAzOSkge1xuICAgIC8vICAgICAgICAgdGhpcy5rZXkgPSAncmlnaHQnO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gMzgpIHtcbiAgICAvLyAgICAgICAgIHRoaXMua2V5ID0gJ3VwJztcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDQwKSB7XG4gICAgLy8gICAgICAgICB0aGlzLmtleSA9ICdkb3duJztcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDgzKSB7IC8vIHNcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKFwicmVsb2FkaW5nIHNoYWRlcnNcIik7XG4gICAgLy8gICAgICAgICBmb3IgKHZhciBtb2RlIGluIHRoaXMubW9kZXMpIHtcbiAgICAvLyAgICAgICAgICAgICB0aGlzLm1vZGVzW21vZGVdLmdsX3Byb2dyYW0uY29tcGlsZSgpO1xuICAgIC8vICAgICAgICAgfVxuICAgIC8vICAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9LmJpbmQodGhpcykpO1xuXG4gICAgLy8gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAvLyAgICAgdGhpcy5rZXkgPSBudWxsO1xuICAgIC8vIH0uYmluZCh0aGlzKSk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuaW5wdXQgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIC8vIEZyYWN0aW9uYWwgem9vbSBzY2FsaW5nXG4gICAgLy8gaWYgKHRoaXMua2V5ID09ICd1cCcpIHtcbiAgICAvLyAgICAgdGhpcy5zZXRab29tKHRoaXMuem9vbSArIHRoaXMuem9vbV9zdGVwKTtcbiAgICAvLyB9XG4gICAgLy8gZWxzZSBpZiAodGhpcy5rZXkgPT0gJ2Rvd24nKSB7XG4gICAgLy8gICAgIHRoaXMuc2V0Wm9vbSh0aGlzLnpvb20gLSB0aGlzLnpvb21fc3RlcCk7XG4gICAgLy8gfVxufTtcblxuXG4vLyBTdGF0cy9kZWJ1Zy9wcm9maWxpbmcgbWV0aG9kc1xuXG4vLyBQcm9maWxpbmcgbWV0aG9kcyB1c2VkIHRvIHRyYWNrIHdoZW4gc2V0cyBvZiB0aWxlcyBzdGFydC9zdG9wIGxvYWRpbmcgdG9nZXRoZXJcbi8vIGUuZy4gaW5pdGlhbCBwYWdlIGxvYWQgaXMgb25lIHNldCBvZiB0aWxlcywgbmV3IHNldHMgb2YgdGlsZSBsb2FkcyBhcmUgdGhlbiBpbml0aWF0ZWQgYnkgYSBtYXAgcGFuIG9yIHpvb21cblNjZW5lLnByb3RvdHlwZS50cmFja1RpbGVTZXRMb2FkU3RhcnQgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIFN0YXJ0IHRyYWNraW5nIG5ldyB0aWxlIHNldCBpZiBubyBvdGhlciB0aWxlcyBhbHJlYWR5IGxvYWRpbmdcbiAgICBpZiAodGhpcy50aWxlX3NldF9sb2FkaW5nID09IG51bGwpIHtcbiAgICAgICAgdGhpcy50aWxlX3NldF9sb2FkaW5nID0gK25ldyBEYXRlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidGlsZSBzZXQgbG9hZCBTVEFSVFwiKTtcbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUudHJhY2tUaWxlU2V0TG9hZEVuZCA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gTm8gbW9yZSB0aWxlcyBhY3RpdmVseSBsb2FkaW5nP1xuICAgIGlmICh0aGlzLnRpbGVfc2V0X2xvYWRpbmcgIT0gbnVsbCkge1xuICAgICAgICB2YXIgZW5kX3RpbGVfc2V0ID0gdHJ1ZTtcbiAgICAgICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50aWxlc1t0XS5sb2FkaW5nID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbmRfdGlsZV9zZXQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbmRfdGlsZV9zZXQgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5sYXN0X3RpbGVfc2V0X2xvYWQgPSAoK25ldyBEYXRlKCkpIC0gdGhpcy50aWxlX3NldF9sb2FkaW5nO1xuICAgICAgICAgICAgdGhpcy50aWxlX3NldF9sb2FkaW5nID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGlsZSBzZXQgbG9hZCBGSU5JU0hFRCBpbjogXCIgKyB0aGlzLmxhc3RfdGlsZV9zZXRfbG9hZCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucHJpbnREZWJ1Z0ZvclRpbGUgPSBmdW5jdGlvbiAodGlsZSlcbntcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgXCJkZWJ1ZyBmb3IgXCIgKyB0aWxlLmtleSArICc6IFsgJyArXG4gICAgICAgIE9iamVjdC5rZXlzKHRpbGUuZGVidWcpLm1hcChmdW5jdGlvbiAodCkgeyByZXR1cm4gdCArICc6ICcgKyB0aWxlLmRlYnVnW3RdOyB9KS5qb2luKCcsICcpICsgJyBdJ1xuICAgICk7XG59O1xuXG4vLyBSZWNvbXBpbGUgYWxsIHNoYWRlcnNcblNjZW5lLnByb3RvdHlwZS5jb21waWxlU2hhZGVycyA9IGZ1bmN0aW9uICgpXG57XG4gICAgZm9yICh2YXIgbSBpbiB0aGlzLm1vZGVzKSB7XG4gICAgICAgIHRoaXMubW9kZXNbbV0uZ2xfcHJvZ3JhbS5jb21waWxlKCk7XG4gICAgfVxufTtcblxuLy8gU3VtIG9mIGEgZGVidWcgcHJvcGVydHkgYWNyb3NzIHRpbGVzXG5TY2VuZS5wcm90b3R5cGUuZ2V0RGVidWdTdW0gPSBmdW5jdGlvbiAocHJvcCwgZmlsdGVyKVxue1xuICAgIHZhciBzdW0gPSAwO1xuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICBpZiAodGhpcy50aWxlc1t0XS5kZWJ1Z1twcm9wXSAhPSBudWxsICYmICh0eXBlb2YgZmlsdGVyICE9ICdmdW5jdGlvbicgfHwgZmlsdGVyKHRoaXMudGlsZXNbdF0pID09IHRydWUpKSB7XG4gICAgICAgICAgICBzdW0gKz0gdGhpcy50aWxlc1t0XS5kZWJ1Z1twcm9wXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3VtO1xufTtcblxuLy8gQXZlcmFnZSBvZiBhIGRlYnVnIHByb3BlcnR5IGFjcm9zcyB0aWxlc1xuU2NlbmUucHJvdG90eXBlLmdldERlYnVnQXZlcmFnZSA9IGZ1bmN0aW9uIChwcm9wLCBmaWx0ZXIpXG57XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGVidWdTdW0ocHJvcCwgZmlsdGVyKSAvIE9iamVjdC5rZXlzKHRoaXMudGlsZXMpLmxlbmd0aDtcbn07XG5cbi8vIExvZyBtZXNzYWdlcyBwYXNzIHRocm91Z2ggZnJvbSB3ZWIgd29ya2Vyc1xuU2NlbmUucHJvdG90eXBlLndvcmtlckxvZ01lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpXG57XG4gICAgaWYgKGV2ZW50LmRhdGEudHlwZSAhPSAnbG9nJykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJ3b3JrZXIgXCIgKyBldmVudC5kYXRhLndvcmtlcl9pZCArIFwiOiBcIiArIGV2ZW50LmRhdGEubXNnKTtcbn07XG5cblxuLyoqKiBDbGFzcyBtZXRob2RzIChzdGF0ZWxlc3MpICoqKi9cblxuU2NlbmUubG9hZExheWVycyA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKVxue1xuICAgIHZhciBsYXllcnM7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGV2YWwoJ2xheWVycyA9ICcgKyByZXEucmVzcG9uc2UpOyAvLyBUT0RPOiBzZWN1cml0eSFcblxuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGxheWVycyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJlcS5vcGVuKCdHRVQnLCB1cmwgKyAnPycgKyAoK25ldyBEYXRlKCkpLCB0cnVlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgIHJlcS5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgcmVxLnNlbmQoKTtcbn07XG5cblNjZW5lLmxvYWRTdHlsZXMgPSBmdW5jdGlvbiAodXJsLCBjYWxsYmFjaylcbntcbiAgICB2YXIgc3R5bGVzO1xuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0eWxlcyA9IHJlcS5yZXNwb25zZTtcblxuICAgICAgICAvLyBUcnkgSlNPTiBmaXJzdCwgdGhlbiBZQU1MIChpZiBhdmFpbGFibGUpXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBldmFsKCdzdHlsZXMgPSAnICsgcmVxLnJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBzdHlsZXMgPSB5YW1sLnNhZmVMb2FkKHJlcS5yZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmFpbGVkIHRvIHBhcnNlIHN0eWxlcyFcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc3R5bGVzKTtcbiAgICAgICAgICAgICAgICBzdHlsZXMgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluZCBnZW5lcmljIGZ1bmN0aW9ucyAmIHN0eWxlIG1hY3Jvc1xuICAgICAgICBVdGlscy5zdHJpbmdzVG9GdW5jdGlvbnMoc3R5bGVzKTtcbiAgICAgICAgU3R5bGUuZXhwYW5kTWFjcm9zKHN0eWxlcyk7XG4gICAgICAgIFNjZW5lLnBvc3RQcm9jZXNzU3R5bGVzKHN0eWxlcyk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhzdHlsZXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVxLm9wZW4oJ0dFVCcsIHVybCArICc/JyArICgrbmV3IERhdGUoKSksIHRydWUgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICByZXEuc2VuZCgpO1xufTtcblxuLy8gTm9ybWFsaXplIHNvbWUgc3R5bGUgc2V0dGluZ3MgdGhhdCBtYXkgbm90IGhhdmUgYmVlbiBleHBsaWNpdGx5IHNwZWNpZmllZCBpbiB0aGUgc3R5bGVzaGVldFxuU2NlbmUucG9zdFByb2Nlc3NTdHlsZXMgPSBmdW5jdGlvbiAoc3R5bGVzKVxue1xuICAgIC8vIFBvc3QtcHJvY2VzcyBzdHlsZXNcbiAgICBmb3IgKHZhciBtIGluIHN0eWxlcy5sYXllcnMpIHtcbiAgICAgICAgaWYgKHN0eWxlcy5sYXllcnNbbV0udmlzaWJsZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHN0eWxlcy5sYXllcnNbbV0udmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKHN0eWxlcy5sYXllcnNbbV0ubW9kZSAmJiBzdHlsZXMubGF5ZXJzW21dLm1vZGUubmFtZSkgPT0gbnVsbCkge1xuICAgICAgICAgICAgc3R5bGVzLmxheWVyc1ttXS5tb2RlID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIFN0eWxlLmRlZmF1bHRzLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMubGF5ZXJzW21dLm1vZGVbcF0gPSBTdHlsZS5kZWZhdWx0cy5tb2RlW3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlcztcbn07XG5cbi8vIFByb2Nlc3NlcyB0aGUgdGlsZSByZXNwb25zZSB0byBjcmVhdGUgbGF5ZXJzIGFzIGRlZmluZWQgYnkgdGhlIHNjZW5lXG4vLyBDYW4gaW5jbHVkZSBwb3N0LXByb2Nlc3NpbmcgdG8gcGFydGlhbGx5IGZpbHRlciBvciByZS1hcnJhbmdlIGRhdGEsIGUuZy4gb25seSBpbmNsdWRpbmcgUE9JcyB0aGF0IGhhdmUgbmFtZXNcblNjZW5lLnByb2Nlc3NMYXllcnNGb3JUaWxlID0gZnVuY3Rpb24gKGxheWVycywgdGlsZSlcbntcbiAgICB2YXIgdGlsZV9sYXllcnMgPSB7fTtcbiAgICBmb3IgKHZhciB0PTA7IHQgPCBsYXllcnMubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgbGF5ZXJzW3RdLm51bWJlciA9IHQ7XG5cbiAgICAgICAgaWYgKGxheWVyc1t0XSAhPSBudWxsKSB7XG4gICAgICAgICAgICAvLyBKdXN0IHBhc3MgdGhyb3VnaCBkYXRhIHVudG91Y2hlZCBpZiBubyBkYXRhIHRyYW5zZm9ybSBmdW5jdGlvbiBkZWZpbmVkXG4gICAgICAgICAgICBpZiAobGF5ZXJzW3RdLmRhdGEgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IHRpbGUubGF5ZXJzW2xheWVyc1t0XS5uYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFBhc3MgdGhyb3VnaCBkYXRhIGJ1dCB3aXRoIGRpZmZlcmVudCBsYXllciBuYW1lIGluIHRpbGUgc291cmNlIGRhdGFcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBsYXllcnNbdF0uZGF0YSA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IHRpbGUubGF5ZXJzW2xheWVyc1t0XS5kYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEFwcGx5IHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gZm9yIHBvc3QtcHJvY2Vzc2luZ1xuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGxheWVyc1t0XS5kYXRhID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aWxlX2xheWVyc1tsYXllcnNbdF0ubmFtZV0gPSBsYXllcnNbdF0uZGF0YSh0aWxlLmxheWVycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIYW5kbGUgY2FzZXMgd2hlcmUgbm8gZGF0YSB3YXMgZm91bmQgaW4gdGlsZSBvciByZXR1cm5lZCBieSBwb3N0LXByb2Nlc3NvclxuICAgICAgICB0aWxlX2xheWVyc1tsYXllcnNbdF0ubmFtZV0gPSB0aWxlX2xheWVyc1tsYXllcnNbdF0ubmFtZV0gfHwgeyB0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLCBmZWF0dXJlczogW10gfTtcbiAgICB9XG4gICAgdGlsZS5sYXllcnMgPSB0aWxlX2xheWVycztcbiAgICByZXR1cm4gdGlsZV9sYXllcnM7XG59O1xuXG4vLyBDYWxsZWQgb25jZSBvbiBpbnN0YW50aWF0aW9uXG5TY2VuZS5jcmVhdGVNb2RlcyA9IGZ1bmN0aW9uIChzdHlsZXMpXG57XG4gICAgdmFyIG1vZGVzID0ge307XG5cbiAgICAvLyBCdWlsdC1pbiBtb2Rlc1xuICAgIHZhciBidWlsdF9pbnMgPSByZXF1aXJlKCcuL2dsL2dsX21vZGVzJykuTW9kZXM7XG4gICAgZm9yICh2YXIgbSBpbiBidWlsdF9pbnMpIHtcbiAgICAgICAgbW9kZXNbbV0gPSBidWlsdF9pbnNbbV07XG4gICAgfVxuXG4gICAgLy8gU3R5bGVzaGVldCBtb2Rlc1xuICAgIGZvciAodmFyIG0gaW4gc3R5bGVzLm1vZGVzKSB7XG4gICAgICAgIC8vIGlmIChtICE9ICdhbGwnKSB7XG4gICAgICAgICAgICBtb2Rlc1ttXSA9IE1vZGVNYW5hZ2VyLmNvbmZpZ3VyZU1vZGUobSwgc3R5bGVzLm1vZGVzW21dKTtcbiAgICAgICAgLy8gfVxuICAgIH1cblxuICAgIHJldHVybiBtb2Rlcztcbn07XG5cblNjZW5lLnJlZnJlc2hNb2RlcyA9IGZ1bmN0aW9uIChtb2Rlcywgc3R5bGVzKVxue1xuICAgIC8vIENvcHkgc3R5bGVzaGVldCBtb2Rlc1xuICAgIC8vIFRPRE86IGlzIHRoaXMgdGhlIGJlc3Qgd2F5IHRvIGNvcHkgc3R5bGVzaGVldCBjaGFuZ2VzIHRvIG1vZGUgaW5zdGFuY2VzP1xuICAgIGZvciAodmFyIG0gaW4gc3R5bGVzLm1vZGVzKSB7XG4gICAgICAgIC8vIGlmIChtICE9ICdhbGwnKSB7XG4gICAgICAgICAgICBtb2Rlc1ttXSA9IE1vZGVNYW5hZ2VyLmNvbmZpZ3VyZU1vZGUobSwgc3R5bGVzLm1vZGVzW21dKTtcbiAgICAgICAgLy8gfVxuICAgIH1cblxuICAgIC8vIFJlZnJlc2ggYWxsIG1vZGVzXG4gICAgZm9yIChtIGluIG1vZGVzKSB7XG4gICAgICAgIG1vZGVzW21dLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbW9kZXM7XG59O1xuXG5cbi8vIFByaXZhdGUvaW50ZXJuYWxcblxuLy8gR2V0IGJhc2UgVVJMIGZyb20gd2hpY2ggdGhlIGxpYnJhcnkgd2FzIGxvYWRlZFxuLy8gVXNlZCB0byBsb2FkIGFkZGl0aW9uYWwgcmVzb3VyY2VzIGxpa2Ugc2hhZGVycywgdGV4dHVyZXMsIGV0Yy4gaW4gY2FzZXMgd2hlcmUgbGlicmFyeSB3YXMgbG9hZGVkIGZyb20gYSByZWxhdGl2ZSBwYXRoXG5mdW5jdGlvbiBmaW5kQmFzZUxpYnJhcnlVUkwgKClcbntcbiAgICBTY2VuZS5saWJyYXJ5X2Jhc2VfdXJsID0gJyc7XG4gICAgdmFyIHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0Jyk7IC8vIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFtzcmMqPVwiLmpzXCJdJyk7XG4gICAgZm9yICh2YXIgcz0wOyBzIDwgc2NyaXB0cy5sZW5ndGg7IHMrKykge1xuICAgICAgICB2YXIgbWF0Y2ggPSBzY3JpcHRzW3NdLnNyYy5pbmRleE9mKCd0YW5ncmFtLmRlYnVnLmpzJyk7XG4gICAgICAgIGlmIChtYXRjaCA9PSAtMSkge1xuICAgICAgICAgICAgbWF0Y2ggPSBzY3JpcHRzW3NdLnNyYy5pbmRleE9mKCd0YW5ncmFtLm1pbi5qcycpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtYXRjaCA+PSAwKSB7XG4gICAgICAgICAgICBTY2VuZS5saWJyYXJ5X2Jhc2VfdXJsID0gc2NyaXB0c1tzXS5zcmMuc3Vic3RyKDAsIG1hdGNoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTY2VuZTtcbn1cbiIsIi8qKiogU3R5bGUgaGVscGVycyAqKiovXG52YXIgR2VvID0gcmVxdWlyZSgnLi9nZW8uanMnKTtcblxudmFyIFN0eWxlID0ge307XG5cbi8vIFN0eWxlIGhlbHBlcnNcblxuU3R5bGUuY29sb3IgPSB7XG4gICAgcHNldWRvUmFuZG9tR3JheXNjYWxlOiBmdW5jdGlvbiAoZikgeyB2YXIgYyA9IE1hdGgubWF4KChwYXJzZUludChmLmlkLCAxNikgJSAxMDApIC8gMTAwLCAwLjQpOyByZXR1cm4gWzAuNyAqIGMsIDAuNyAqIGMsIDAuNyAqIGNdOyB9LCAvLyBwc2V1ZG8tcmFuZG9tIGdyYXlzY2FsZSBieSBnZW9tZXRyeSBpZFxuICAgIHBzZXVkb1JhbmRvbUNvbG9yOiBmdW5jdGlvbiAoZikgeyByZXR1cm4gWzAuNyAqIChwYXJzZUludChmLmlkLCAxNikgLyAxMDAgJSAxKSwgMC43ICogKHBhcnNlSW50KGYuaWQsIDE2KSAvIDEwMDAwICUgMSksIDAuNyAqIChwYXJzZUludChmLmlkLCAxNikgLyAxMDAwMDAwICUgMSldOyB9LCAvLyBwc2V1ZG8tcmFuZG9tIGNvbG9yIGJ5IGdlb21ldHJ5IGlkXG4gICAgcmFuZG9tQ29sb3I6IGZ1bmN0aW9uIChmKSB7IHJldHVybiBbMC43ICogTWF0aC5yYW5kb20oKSwgMC43ICogTWF0aC5yYW5kb20oKSwgMC43ICogTWF0aC5yYW5kb20oKV07IH0gLy8gcmFuZG9tIGNvbG9yXG59O1xuXG4vLyBSZXR1cm5zIGEgZnVuY3Rpb24gKHRoYXQgY2FuIGJlIHVzZWQgYXMgYSBkeW5hbWljIHN0eWxlKSB0aGF0IGNvbnZlcnRzIHBpeGVscyB0byBtZXRlcnMgZm9yIHRoZSBjdXJyZW50IHpvb20gbGV2ZWwuXG4vLyBUaGUgcHJvdmlkZWQgcGl4ZWwgdmFsdWUgKCdwJykgY2FuIGl0c2VsZiBiZSBhIGZ1bmN0aW9uLCBpbiB3aGljaCBjYXNlIGl0IGlzIHdyYXBwZWQgYnkgdGhpcyBvbmUuXG5TdHlsZS5waXhlbHMgPSBmdW5jdGlvbiAocCwgeikge1xuICAgIHZhciBmO1xuICAgIGV2YWwoJ2YgPSBmdW5jdGlvbihmLCB0LCBoKSB7IHJldHVybiAnICsgKHR5cGVvZiBwID09ICdmdW5jdGlvbicgPyAnKCcgKyAocC50b1N0cmluZygpICsgJyhmLCB0LCBoKSknKSA6IHApICsgJyAqIGguR2VvLm1ldGVyc19wZXJfcGl4ZWxbaC56b29tXTsgfScpO1xuICAgIHJldHVybiBmO1xufTtcblxuLy8gQ3JlYXRlIGEgdW5pcXVlIDMyLWJpdCBjb2xvciB0byBpZGVudGlmeSBhIGZlYXR1cmVcbi8vIFdvcmtlcnMgaW5kZXBlbmRlbnRseSBjcmVhdGUvbW9kaWZ5IHNlbGVjdGlvbiBjb2xvcnMgaW4gdGhlaXIgb3duIHRocmVhZHMsIGJ1dCB3ZSBhbHNvXG4vLyBuZWVkIHRoZSBtYWluIHRocmVhZCB0byBrbm93IHdoZXJlIGVhY2ggZmVhdHVyZSBjb2xvciBvcmlnaW5hdGVkLiBUbyBhY2NvbXBsaXNoIHRoaXMsXG4vLyB3ZSBwYXJ0aXRpb24gdGhlIG1hcCBieSBzZXR0aW5nIHRoZSA0dGggY29tcG9uZW50IChhbHBoYSBjaGFubmVsKSB0byB0aGUgd29ya2VyJ3MgaWQuXG5TdHlsZS5zZWxlY3Rpb25fbWFwID0ge307IC8vIHRoaXMgd2lsbCBiZSB1bmlxdWUgcGVyIG1vZHVsZSBpbnN0YW5jZSAoc28gdW5pcXVlIHBlciB3b3JrZXIpXG5TdHlsZS5zZWxlY3Rpb25fbWFwX2N1cnJlbnQgPSAxOyAvLyBzdGFydCBhdCAxIHNpbmNlIDEgd2lsbCBiZSBkaXZpZGVkIGJ5IHRoaXNcblN0eWxlLnNlbGVjdGlvbl9tYXBfcHJlZml4ID0gMDsgLy8gc2V0IGJ5IHdvcmtlciB0byB3b3JrZXIgaWQgI1xuU3R5bGUuZ2VuZXJhdGVTZWxlY3Rpb24gPSBmdW5jdGlvbiAoY29sb3JfbWFwKVxue1xuICAgIC8vIDMyLWJpdCBjb2xvciBrZXlcbiAgICBTdHlsZS5zZWxlY3Rpb25fbWFwX2N1cnJlbnQrKztcbiAgICB2YXIgaXIgPSBTdHlsZS5zZWxlY3Rpb25fbWFwX2N1cnJlbnQgJiAyNTU7XG4gICAgdmFyIGlnID0gKFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCA+PiA4KSAmIDI1NTtcbiAgICB2YXIgaWIgPSAoU3R5bGUuc2VsZWN0aW9uX21hcF9jdXJyZW50ID4+IDE2KSAmIDI1NTtcbiAgICB2YXIgaWEgPSBTdHlsZS5zZWxlY3Rpb25fbWFwX3ByZWZpeDtcbiAgICB2YXIgciA9IGlyIC8gMjU1O1xuICAgIHZhciBnID0gaWcgLyAyNTU7XG4gICAgdmFyIGIgPSBpYiAvIDI1NTtcbiAgICB2YXIgYSA9IGlhIC8gMjU1O1xuICAgIHZhciBrZXkgPSAoaXIgKyAoaWcgPDwgOCkgKyAoaWIgPDwgMTYpICsgKGlhIDw8IDI0KSkgPj4+IDA7IC8vIG5lZWQgdW5zaWduZWQgcmlnaHQgc2hpZnQgdG8gY29udmVydCB0byBwb3NpdGl2ZSAjXG5cbiAgICBjb2xvcl9tYXBba2V5XSA9IHtcbiAgICAgICAgY29sb3I6IFtyLCBnLCBiLCBhXSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGNvbG9yX21hcFtrZXldO1xufTtcblxuU3R5bGUucmVzZXRTZWxlY3Rpb25NYXAgPSBmdW5jdGlvbiAoKVxue1xuICAgIFN0eWxlLnNlbGVjdGlvbl9tYXAgPSB7fTtcbiAgICBTdHlsZS5zZWxlY3Rpb25fbWFwX2N1cnJlbnQgPSAxO1xufTtcblxuLy8gRmluZCBhbmQgZXhwYW5kIHN0eWxlIG1hY3Jvc1xuU3R5bGUubWFjcm9zID0gW1xuICAgICdTdHlsZS5jb2xvci5wc2V1ZG9SYW5kb21Db2xvcicsXG4gICAgJ1N0eWxlLnBpeGVscydcbl07XG5cblN0eWxlLmV4cGFuZE1hY3JvcyA9IGZ1bmN0aW9uIGV4cGFuZE1hY3JvcyAob2JqKSB7XG4gICAgZm9yICh2YXIgcCBpbiBvYmopIHtcbiAgICAgICAgdmFyIHZhbCA9IG9ialtwXTtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggb2JqZWN0IHByb3BlcnRpZXNcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIG9ialtwXSA9IGV4cGFuZE1hY3Jvcyh2YWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIENvbnZlcnQgc3RyaW5ncyBiYWNrIGludG8gZnVuY3Rpb25zXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWwgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGZvciAodmFyIG0gaW4gU3R5bGUubWFjcm9zKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbC5tYXRjaChTdHlsZS5tYWNyb3NbbV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZhbCgnZiA9ICcgKyB2YWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqW3BdID0gZjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmYWxsLWJhY2sgdG8gb3JpZ2luYWwgdmFsdWUgaWYgcGFyc2luZyBmYWlsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ialtwXSA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmo7XG59O1xuXG5cbi8vIFN0eWxlIGRlZmF1bHRzXG5cbi8vIERldGVybWluZSBmaW5hbCBzdHlsZSBwcm9wZXJ0aWVzIChjb2xvciwgd2lkdGgsIGV0Yy4pXG5TdHlsZS5kZWZhdWx0cyA9IHtcbiAgICBjb2xvcjogWzEuMCwgMCwgMF0sXG4gICAgd2lkdGg6IDEsXG4gICAgc2l6ZTogMSxcbiAgICBleHRydWRlOiBmYWxzZSxcbiAgICBoZWlnaHQ6IDIwLFxuICAgIG1pbl9oZWlnaHQ6IDAsXG4gICAgb3V0bGluZToge1xuICAgICAgICAvLyBjb2xvcjogWzEuMCwgMCwgMF0sXG4gICAgICAgIC8vIHdpZHRoOiAxLFxuICAgICAgICAvLyBkYXNoOiBudWxsXG4gICAgfSxcbiAgICBzZWxlY3Rpb246IHtcbiAgICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgY29sb3I6IFswLCAwLCAwLCAxXVxuICAgIH0sXG4gICAgbW9kZToge1xuICAgICAgICBuYW1lOiAncG9seWdvbnMnXG4gICAgfVxufTtcblxuLy8gU3R5bGUgcGFyc2luZ1xuXG4vLyBIZWxwZXIgZnVuY3Rpb25zIHBhc3NlZCB0byBkeW5hbWljIHN0eWxlIGZ1bmN0aW9uc1xuU3R5bGUuaGVscGVycyA9IHtcbiAgICBTdHlsZTogU3R5bGUsXG4gICAgR2VvOiBHZW9cbn07XG5cblN0eWxlLnBhcnNlU3R5bGVGb3JGZWF0dXJlID0gZnVuY3Rpb24gKGZlYXR1cmUsIGxheWVyX25hbWUsIGxheWVyX3N0eWxlLCB0aWxlKVxue1xuICAgIHZhciBsYXllcl9zdHlsZSA9IGxheWVyX3N0eWxlIHx8IHt9O1xuICAgIHZhciBzdHlsZSA9IHt9O1xuXG4gICAgU3R5bGUuaGVscGVycy56b29tID0gdGlsZS5jb29yZHMuejtcblxuICAgIC8vIFRlc3Qgd2hldGhlciBmZWF0dXJlcyBzaG91bGQgYmUgcmVuZGVyZWQgYXQgYWxsXG4gICAgaWYgKHR5cGVvZiBsYXllcl9zdHlsZS5maWx0ZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBpZiAobGF5ZXJfc3R5bGUuZmlsdGVyKGZlYXR1cmUsIHRpbGUsIFN0eWxlLmhlbHBlcnMpID09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFBhcnNlIHN0eWxlc1xuICAgIHN0eWxlLmNvbG9yID0gKGxheWVyX3N0eWxlLmNvbG9yICYmIChsYXllcl9zdHlsZS5jb2xvcltmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUuY29sb3IuZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLmNvbG9yO1xuICAgIGlmICh0eXBlb2Ygc3R5bGUuY29sb3IgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5jb2xvciA9IHN0eWxlLmNvbG9yKGZlYXR1cmUsIHRpbGUsIFN0eWxlLmhlbHBlcnMpO1xuICAgIH1cblxuICAgIHN0eWxlLndpZHRoID0gKGxheWVyX3N0eWxlLndpZHRoICYmIChsYXllcl9zdHlsZS53aWR0aFtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUud2lkdGguZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLndpZHRoO1xuICAgIGlmICh0eXBlb2Ygc3R5bGUud2lkdGggPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS53aWR0aCA9IHN0eWxlLndpZHRoKGZlYXR1cmUsIHRpbGUsIFN0eWxlLmhlbHBlcnMpO1xuICAgIH1cbiAgICBzdHlsZS53aWR0aCAqPSBHZW8udW5pdHNfcGVyX21ldGVyW3RpbGUuY29vcmRzLnpdO1xuXG4gICAgc3R5bGUuc2l6ZSA9IChsYXllcl9zdHlsZS5zaXplICYmIChsYXllcl9zdHlsZS5zaXplW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5zaXplLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy5zaXplO1xuICAgIGlmICh0eXBlb2Ygc3R5bGUuc2l6ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLnNpemUgPSBzdHlsZS5zaXplKGZlYXR1cmUsIHRpbGUsIFN0eWxlLmhlbHBlcnMpO1xuICAgIH1cbiAgICBzdHlsZS5zaXplICo9IEdlby51bml0c19wZXJfbWV0ZXJbdGlsZS5jb29yZHMuel07XG5cbiAgICBzdHlsZS5leHRydWRlID0gKGxheWVyX3N0eWxlLmV4dHJ1ZGUgJiYgKGxheWVyX3N0eWxlLmV4dHJ1ZGVbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLmV4dHJ1ZGUuZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLmV4dHJ1ZGU7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5leHRydWRlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gcmV0dXJuaW5nIGEgYm9vbGVhbiB3aWxsIGV4dHJ1ZGUgd2l0aCB0aGUgZmVhdHVyZSdzIGhlaWdodCwgYSBudW1iZXIgd2lsbCBvdmVycmlkZSB0aGUgZmVhdHVyZSBoZWlnaHQgKHNlZSBiZWxvdylcbiAgICAgICAgc3R5bGUuZXh0cnVkZSA9IHN0eWxlLmV4dHJ1ZGUoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgc3R5bGUuaGVpZ2h0ID0gKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMuaGVpZ2h0KSB8fCBTdHlsZS5kZWZhdWx0cy5oZWlnaHQ7XG4gICAgc3R5bGUubWluX2hlaWdodCA9IChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLm1pbl9oZWlnaHQpIHx8IFN0eWxlLmRlZmF1bHRzLm1pbl9oZWlnaHQ7XG5cbiAgICAvLyBoZWlnaHQgZGVmYXVsdHMgdG8gZmVhdHVyZSBoZWlnaHQsIGJ1dCBleHRydWRlIHN0eWxlIGNhbiBkeW5hbWljYWxseSBhZGp1c3QgaGVpZ2h0IGJ5IHJldHVybmluZyBhIG51bWJlciBvciBhcnJheSAoaW5zdGVhZCBvZiBhIGJvb2xlYW4pXG4gICAgaWYgKHN0eWxlLmV4dHJ1ZGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzdHlsZS5leHRydWRlID09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQgPSBzdHlsZS5leHRydWRlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBzdHlsZS5leHRydWRlID09ICdvYmplY3QnICYmIHN0eWxlLmV4dHJ1ZGUubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICAgIHN0eWxlLm1pbl9oZWlnaHQgPSBzdHlsZS5leHRydWRlWzBdO1xuICAgICAgICAgICAgc3R5bGUuaGVpZ2h0ID0gc3R5bGUuZXh0cnVkZVsxXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0eWxlLnogPSAobGF5ZXJfc3R5bGUueiAmJiAobGF5ZXJfc3R5bGUueltmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUuei5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMueiB8fCAwO1xuICAgIGlmICh0eXBlb2Ygc3R5bGUueiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLnogPSBzdHlsZS56KGZlYXR1cmUsIHRpbGUsIFN0eWxlLmhlbHBlcnMpO1xuICAgIH1cblxuICAgIHN0eWxlLm91dGxpbmUgPSB7fTtcbiAgICBsYXllcl9zdHlsZS5vdXRsaW5lID0gbGF5ZXJfc3R5bGUub3V0bGluZSB8fCB7fTtcbiAgICBzdHlsZS5vdXRsaW5lLmNvbG9yID0gKGxheWVyX3N0eWxlLm91dGxpbmUuY29sb3IgJiYgKGxheWVyX3N0eWxlLm91dGxpbmUuY29sb3JbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLm91dGxpbmUuY29sb3IuZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLm91dGxpbmUuY29sb3I7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5vdXRsaW5lLmNvbG9yID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUub3V0bGluZS5jb2xvciA9IHN0eWxlLm91dGxpbmUuY29sb3IoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgc3R5bGUub3V0bGluZS53aWR0aCA9IChsYXllcl9zdHlsZS5vdXRsaW5lLndpZHRoICYmIChsYXllcl9zdHlsZS5vdXRsaW5lLndpZHRoW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5vdXRsaW5lLndpZHRoLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy5vdXRsaW5lLndpZHRoO1xuICAgIGlmICh0eXBlb2Ygc3R5bGUub3V0bGluZS53aWR0aCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLm91dGxpbmUud2lkdGggPSBzdHlsZS5vdXRsaW5lLndpZHRoKGZlYXR1cmUsIHRpbGUsIFN0eWxlLmhlbHBlcnMpO1xuICAgIH1cbiAgICBzdHlsZS5vdXRsaW5lLndpZHRoICo9IEdlby51bml0c19wZXJfbWV0ZXJbdGlsZS5jb29yZHMuel07XG5cbiAgICBzdHlsZS5vdXRsaW5lLmRhc2ggPSAobGF5ZXJfc3R5bGUub3V0bGluZS5kYXNoICYmIChsYXllcl9zdHlsZS5vdXRsaW5lLmRhc2hbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLm91dGxpbmUuZGFzaC5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMub3V0bGluZS5kYXNoO1xuICAgIGlmICh0eXBlb2Ygc3R5bGUub3V0bGluZS5kYXNoID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUub3V0bGluZS5kYXNoID0gc3R5bGUub3V0bGluZS5kYXNoKGZlYXR1cmUsIHRpbGUsIFN0eWxlLmhlbHBlcnMpO1xuICAgIH1cblxuICAgIC8vIEludGVyYWN0aXZpdHkgKHNlbGVjdGlvbiBtYXApXG4gICAgdmFyIGludGVyYWN0aXZlID0gZmFsc2U7XG4gICAgaWYgKHR5cGVvZiBsYXllcl9zdHlsZS5pbnRlcmFjdGl2ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGludGVyYWN0aXZlID0gbGF5ZXJfc3R5bGUuaW50ZXJhY3RpdmUoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpbnRlcmFjdGl2ZSA9IGxheWVyX3N0eWxlLmludGVyYWN0aXZlO1xuICAgIH1cblxuICAgIGlmIChpbnRlcmFjdGl2ZSA9PSB0cnVlKSB7XG4gICAgICAgIHZhciBzZWxlY3RvciA9IFN0eWxlLmdlbmVyYXRlU2VsZWN0aW9uKFN0eWxlLnNlbGVjdGlvbl9tYXApO1xuXG4gICAgICAgIHNlbGVjdG9yLmZlYXR1cmUgPSB7XG4gICAgICAgICAgICBpZDogZmVhdHVyZS5pZCxcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IGZlYXR1cmUucHJvcGVydGllc1xuICAgICAgICB9O1xuICAgICAgICBzZWxlY3Rvci5mZWF0dXJlLnByb3BlcnRpZXMubGF5ZXIgPSBsYXllcl9uYW1lOyAvLyBhZGQgbGF5ZXIgbmFtZSB0byBwcm9wZXJ0aWVzXG5cbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uID0ge1xuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgY29sb3I6IHNlbGVjdG9yLmNvbG9yXG4gICAgICAgIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzdHlsZS5zZWxlY3Rpb24gPSBTdHlsZS5kZWZhdWx0cy5zZWxlY3Rpb247XG4gICAgfVxuXG4gICAgaWYgKGxheWVyX3N0eWxlLm1vZGUgIT0gbnVsbCAmJiBsYXllcl9zdHlsZS5tb2RlLm5hbWUgIT0gbnVsbCkge1xuICAgICAgICBzdHlsZS5tb2RlID0ge307XG4gICAgICAgIGZvciAodmFyIG0gaW4gbGF5ZXJfc3R5bGUubW9kZSkge1xuICAgICAgICAgICAgc3R5bGUubW9kZVttXSA9IGxheWVyX3N0eWxlLm1vZGVbbV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHN0eWxlLm1vZGUgPSBTdHlsZS5kZWZhdWx0cy5tb2RlO1xuICAgIH1cblxuICAgIHJldHVybiBzdHlsZTtcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gU3R5bGU7XG59XG4iLCIvLyBNaXNjZWxsYW5lb3VzIHV0aWxpdGllc1xuXG4vLyBTaW1wbGlzdGljIGRldGVjdGlvbiBvZiByZWxhdGl2ZSBwYXRocywgYXBwZW5kIGJhc2UgaWYgbmVjZXNzYXJ5XG5mdW5jdGlvbiB1cmxGb3JQYXRoIChwYXRoKSB7XG4gICAgaWYgKHBhdGggPT0gbnVsbCB8fCBwYXRoID09ICcnKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIENhbiBleHBhbmQgYSBzaW5nbGUgcGF0aCwgb3IgYW4gYXJyYXkgb2YgcGF0aHNcbiAgICBpZiAodHlwZW9mIHBhdGggPT0gJ29iamVjdCcgJiYgcGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIEFycmF5IG9mIHBhdGhzXG4gICAgICAgIGZvciAodmFyIHAgaW4gcGF0aCkge1xuICAgICAgICAgICAgdmFyIHByb3RvY29sID0gcGF0aFtwXS50b0xvd2VyQ2FzZSgpLnN1YnN0cigwLCA0KTtcbiAgICAgICAgICAgIGlmICghKHByb3RvY29sID09ICdodHRwJyB8fCBwcm90b2NvbCA9PSAnZmlsZScpKSB7XG4gICAgICAgICAgICAgICAgcGF0aFtwXSA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBwYXRoW3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBTaW5nbGUgcGF0aFxuICAgICAgICB2YXIgcHJvdG9jb2wgPSBwYXRoLnRvTG93ZXJDYXNlKCkuc3Vic3RyKDAsIDQpO1xuICAgICAgICBpZiAoIShwcm90b2NvbCA9PSAnaHR0cCcgfHwgcHJvdG9jb2wgPT0gJ2ZpbGUnKSkge1xuICAgICAgICAgICAgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBwYXRoO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwYXRoO1xufTtcblxuLy8gU3RyaW5naWZ5IGFuIG9iamVjdCBpbnRvIEpTT04sIGJ1dCBjb252ZXJ0IGZ1bmN0aW9ucyB0byBzdHJpbmdzXG5mdW5jdGlvbiBzZXJpYWxpemVXaXRoRnVuY3Rpb25zIChvYmopXG57XG4gICAgdmFyIHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeShvYmosIGZ1bmN0aW9uKGssIHYpIHtcbiAgICAgICAgLy8gQ29udmVydCBmdW5jdGlvbnMgdG8gc3RyaW5nc1xuICAgICAgICBpZiAodHlwZW9mIHYgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdjtcbiAgICB9KTtcblxuICAgIHJldHVybiBzZXJpYWxpemVkO1xufTtcblxuLy8gUGFyc2UgYSBKU09OIHN0cmluZywgYnV0IGNvbnZlcnQgZnVuY3Rpb24tbGlrZSBzdHJpbmdzIGJhY2sgaW50byBmdW5jdGlvbnNcbmZ1bmN0aW9uIGRlc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyAoc2VyaWFsaXplZCkge1xuICAgIHZhciBvYmogPSBKU09OLnBhcnNlKHNlcmlhbGl6ZWQpO1xuICAgIG9iaiA9IHN0cmluZ3NUb0Z1bmN0aW9ucyhvYmopO1xuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cbi8vIFJlY3Vyc2l2ZWx5IHBhcnNlIGFuIG9iamVjdCwgYXR0ZW1wdGluZyB0byBjb252ZXJ0IHN0cmluZyBwcm9wZXJ0aWVzIHRoYXQgbG9vayBsaWtlIGZ1bmN0aW9ucyBiYWNrIGludG8gZnVuY3Rpb25zXG5mdW5jdGlvbiBzdHJpbmdzVG9GdW5jdGlvbnMgKG9iaikge1xuICAgIGZvciAodmFyIHAgaW4gb2JqKSB7XG4gICAgICAgIHZhciB2YWwgPSBvYmpbcF07XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIG9iamVjdCBwcm9wZXJ0aWVzXG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBvYmpbcF0gPSBzdHJpbmdzVG9GdW5jdGlvbnModmFsKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDb252ZXJ0IHN0cmluZ3MgYmFjayBpbnRvIGZ1bmN0aW9uc1xuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsID09ICdzdHJpbmcnICYmIHZhbC5tYXRjaCgvXmZ1bmN0aW9uLipcXCguKlxcKS8pICE9IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBmO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBldmFsKCdmID0gJyArIHZhbCk7XG4gICAgICAgICAgICAgICAgb2JqW3BdID0gZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgLy8gZmFsbC1iYWNrIHRvIG9yaWdpbmFsIHZhbHVlIGlmIHBhcnNpbmcgZmFpbGVkXG4gICAgICAgICAgICAgICAgb2JqW3BdID0gdmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cbi8vIFJ1biBhIGJsb2NrIGlmIG9uIHRoZSBtYWluIHRocmVhZCAobm90IGluIGEgd2ViIHdvcmtlciksIHdpdGggb3B0aW9uYWwgZXJyb3IgKHdlYiB3b3JrZXIpIGJsb2NrXG5mdW5jdGlvbiBydW5JZkluTWFpblRocmVhZCAoYmxvY2ssIGVycikge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh3aW5kb3cuZG9jdW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgYmxvY2soKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBpZiAodHlwZW9mIGVyciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBlcnIoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy8gVXNlZCBmb3IgZGlmZmVyZW50aWF0aW5nIGJldHdlZW4gcG93ZXItb2YtMiBhbmQgbm9uLXBvd2VyLW9mLTIgdGV4dHVyZXNcbi8vIFZpYTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xOTcyMjI0Ny93ZWJnbC13YWl0LWZvci10ZXh0dXJlLXRvLWxvYWRcbmZ1bmN0aW9uIGlzUG93ZXJPZjIgKHZhbHVlKSB7XG4gICAgcmV0dXJuICh2YWx1ZSAmICh2YWx1ZSAtIDEpKSA9PSAwO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICAgIHVybEZvclBhdGg6IHVybEZvclBhdGgsXG4gICAgICAgIHNlcmlhbGl6ZVdpdGhGdW5jdGlvbnM6IHNlcmlhbGl6ZVdpdGhGdW5jdGlvbnMsXG4gICAgICAgIGRlc2VyaWFsaXplV2l0aEZ1bmN0aW9uczogZGVzZXJpYWxpemVXaXRoRnVuY3Rpb25zLFxuICAgICAgICBzdHJpbmdzVG9GdW5jdGlvbnM6IHN0cmluZ3NUb0Z1bmN0aW9ucyxcbiAgICAgICAgcnVuSWZJbk1haW5UaHJlYWQ6IHJ1bklmSW5NYWluVGhyZWFkLFxuICAgICAgICBpc1Bvd2VyT2YyOiBpc1Bvd2VyT2YyXG4gICAgfTtcbn1cbiIsIi8qKiogVmVjdG9yIGZ1bmN0aW9ucyAtIHZlY3RvcnMgcHJvdmlkZWQgYXMgW3gsIHksIHpdIGFycmF5cyAqKiovXG5cbnZhciBWZWN0b3IgPSB7fTtcblxuLy8gVmVjdG9yIGxlbmd0aCBzcXVhcmVkXG5WZWN0b3IubGVuZ3RoU3EgPSBmdW5jdGlvbiAodilcbntcbiAgICBpZiAodi5sZW5ndGggPT0gMikge1xuICAgICAgICByZXR1cm4gKHZbMF0qdlswXSArIHZbMV0qdlsxXSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gKHZbMF0qdlswXSArIHZbMV0qdlsxXSArIHZbMl0qdlsyXSk7XG4gICAgfVxufTtcblxuLy8gVmVjdG9yIGxlbmd0aFxuVmVjdG9yLmxlbmd0aCA9IGZ1bmN0aW9uICh2KVxue1xuICAgIHJldHVybiBNYXRoLnNxcnQoVmVjdG9yLmxlbmd0aFNxKHYpKTtcbn07XG5cbi8vIE5vcm1hbGl6ZSBhIHZlY3RvclxuVmVjdG9yLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uICh2KVxue1xuICAgIHZhciBkO1xuICAgIGlmICh2Lmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIGQgPSB2WzBdKnZbMF0gKyB2WzFdKnZbMV07XG4gICAgICAgIGQgPSBNYXRoLnNxcnQoZCk7XG5cbiAgICAgICAgaWYgKGQgIT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFt2WzBdIC8gZCwgdlsxXSAvIGRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbMCwgMF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgZCA9IHZbMF0qdlswXSArIHZbMV0qdlsxXSArIHZbMl0qdlsyXTtcbiAgICAgICAgZCA9IE1hdGguc3FydChkKTtcblxuICAgICAgICBpZiAoZCAhPSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW3ZbMF0gLyBkLCB2WzFdIC8gZCwgdlsyXSAvIGRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbMCwgMCwgMF07XG4gICAgfVxufTtcblxuLy8gQ3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjdG9yc1xuVmVjdG9yLmNyb3NzICA9IGZ1bmN0aW9uICh2MSwgdjIpXG57XG4gICAgcmV0dXJuIFtcbiAgICAgICAgKHYxWzFdICogdjJbMl0pIC0gKHYxWzJdICogdjJbMV0pLFxuICAgICAgICAodjFbMl0gKiB2MlswXSkgLSAodjFbMF0gKiB2MlsyXSksXG4gICAgICAgICh2MVswXSAqIHYyWzFdKSAtICh2MVsxXSAqIHYyWzBdKVxuICAgIF07XG59O1xuXG4vLyBGaW5kIHRoZSBpbnRlcnNlY3Rpb24gb2YgdHdvIGxpbmVzIHNwZWNpZmllZCBhcyBzZWdtZW50cyBmcm9tIHBvaW50cyAocDEsIHAyKSBhbmQgKHAzLCBwNClcbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGluZS1saW5lX2ludGVyc2VjdGlvblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DcmFtZXInc19ydWxlXG5WZWN0b3IubGluZUludGVyc2VjdGlvbiA9IGZ1bmN0aW9uIChwMSwgcDIsIHAzLCBwNCwgcGFyYWxsZWxfdG9sZXJhbmNlKVxue1xuICAgIHZhciBwYXJhbGxlbF90b2xlcmFuY2UgPSBwYXJhbGxlbF90b2xlcmFuY2UgfHwgMC4wMTtcblxuICAgIC8vIGExKnggKyBiMSp5ID0gYzEgZm9yIGxpbmUgKHgxLCB5MSkgdG8gKHgyLCB5MilcbiAgICAvLyBhMip4ICsgYjIqeSA9IGMyIGZvciBsaW5lICh4MywgeTMpIHRvICh4NCwgeTQpXG4gICAgdmFyIGExID0gcDFbMV0gLSBwMlsxXTsgLy8geTEgLSB5MlxuICAgIHZhciBiMSA9IHAxWzBdIC0gcDJbMF07IC8vIHgxIC0geDJcbiAgICB2YXIgYTIgPSBwM1sxXSAtIHA0WzFdOyAvLyB5MyAtIHk0XG4gICAgdmFyIGIyID0gcDNbMF0gLSBwNFswXTsgLy8geDMgLSB4NFxuICAgIHZhciBjMSA9IChwMVswXSAqIHAyWzFdKSAtIChwMVsxXSAqIHAyWzBdKTsgLy8geDEqeTIgLSB5MSp4MlxuICAgIHZhciBjMiA9IChwM1swXSAqIHA0WzFdKSAtIChwM1sxXSAqIHA0WzBdKTsgLy8geDMqeTQgLSB5Myp4NFxuICAgIHZhciBkZW5vbSA9IChiMSAqIGEyKSAtIChhMSAqIGIyKTtcblxuICAgIGlmIChNYXRoLmFicyhkZW5vbSkgPiBwYXJhbGxlbF90b2xlcmFuY2UpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICgoYzEgKiBiMikgLSAoYjEgKiBjMikpIC8gZGVub20sXG4gICAgICAgICAgICAoKGMxICogYTIpIC0gKGExICogYzIpKSAvIGRlbm9tXG4gICAgICAgIF07XG4gICAgfVxuICAgIHJldHVybiBudWxsOyAvLyByZXR1cm4gbnVsbCBpZiBsaW5lcyBhcmUgKGNsb3NlIHRvKSBwYXJhbGxlbFxufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBWZWN0b3I7XG59XG4iXX0=
(13)
});
