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

},{"./point.js":13}],3:[function(_dereq_,module,exports){
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
    req.open('GET', Utils.urlForPath(vertex_shader_url) + '?' + (+new Date()), false /* async flag */);
    req.send();

    req.onload = function () { fragment_shader_source = req.response; };
    req.open('GET', Utils.urlForPath(fragment_shader_url) + '?' + (+new Date()), false /* async flag */);
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

},{"../utils.js":16}],4:[function(_dereq_,module,exports){
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

},{"../point.js":13,"../vector.js":17,"./gl.js":3}],5:[function(_dereq_,module,exports){
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

},{"./gl.js":3,"./gl_program.js":7,"./gl_vertex_layout.js":10}],6:[function(_dereq_,module,exports){
// Rendering modes

var GL = _dereq_('./gl.js');
var GLBuilders = _dereq_('./gl_builders.js');
var GLGeometry = _dereq_('./gl_geom.js');
var GLVertexLayout = _dereq_('./gl_vertex_layout.js');
var GLProgram = _dereq_('./gl_program.js');
var GLTexture = _dereq_('./gl_texture.js');
var shader_sources = _dereq_('./gl_shaders.js'); // built-in shaders

// Base

var RenderMode = {
    init: function (gl) {
        this.gl = gl;
        this.makeGLProgram();

        if (typeof this._init == 'function') {
            this._init();
        }
    },
    refresh: function () {
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

    // Alter defines for selection (need to create a new object since the first is stored as a reference by the program)
    if (this.selection) {
        var selection_defines = Object.create(defines);
        selection_defines['FEATURE_SELECTION'] = true;
    }

    // Get any custom code transforms
    var transforms = (this.shaders && this.shaders.transforms);

    // Create shader from custom URLs
    if (this.shaders && this.shaders.vertex_url && this.shaders.fragment_url) {
        this.gl_program = GLProgram.createProgramFromURLs(
            this.gl,
            this.shaders.vertex_url,
            this.shaders.fragment_url,
            { defines: defines, transforms: transforms, name: this.name }
        );

        if (this.selection) {
            this.selection_gl_program = new GLProgram(
                this.gl,
                this.gl_program.vertex_shader_source,
                shader_sources['selection_fragment'],
                { defines: selection_defines, transforms: transforms, name: (this.name + ' (selection)') }
            );
        }
    }
    // Create shader from built-in source
    else {
        this.gl_program = new GLProgram(
            this.gl,
            shader_sources[this.vertex_shader_key],
            shader_sources[this.fragment_shader_key],
            { defines: defines, transforms: transforms, name: this.name }
        );

        if (this.selection) {
            this.selection_gl_program = new GLProgram(
                this.gl,
                shader_sources[this.vertex_shader_key],
                shader_sources['selection_fragment'],
                { defines: selection_defines, transforms: transforms, name: (this.name + ' (selection)') }
            );
       }
    }
};

// TODO: make this a generic ORM-like feature for setting uniforms via JS objects on GLProgram
RenderMode.setUniforms = function (options)
{
    options = options || {};
    var gl_program = GLProgram.current; // operate on currently bound program

    // TODO: only update uniforms when changed
    if (this.shaders != null && this.shaders.uniforms != null) {
        var texture_unit = 0;

        for (var u in this.shaders.uniforms) {
            var uniform = this.shaders.uniforms[u];

            // Single float
            if (typeof uniform == 'number') {
                gl_program.uniform('1f', u, uniform);
            }
            // Multiple floats - vector or array
            else if (typeof uniform == 'object') {
                // float vectors (vec2, vec3, vec4)
                if (uniform.length >= 2 && uniform.length <= 4) {
                    gl_program.uniform(uniform.length + 'fv', u, uniform);
                }
                // float array
                else if (uniform.length > 4) {
                    gl_program.uniform('1fv', u + '[0]', uniform);
                }
                // TODO: assume matrix for (typeof == Float32Array && length == 16)?
            }
            // Boolean
            else if (typeof this.shaders.uniforms[u] == 'boolean') {
                gl_program.uniform('1i', u, uniform);
            }
            // Texture
            else if (typeof uniform == 'string') {
                var texture = GLTexture.textures[uniform];
                if (texture == null) {
                    texture = new GLTexture(this.gl, uniform);
                    texture.load(uniform);
                }

                texture.bind(texture_unit);
                gl_program.uniform('1i', u, texture_unit);
                texture_unit++;
            }
            // TODO: support other non-float types? (int, etc.)
        }
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

},{"./gl.js":3,"./gl_builders.js":4,"./gl_geom.js":5,"./gl_program.js":7,"./gl_shaders.js":8,"./gl_texture.js":9,"./gl_vertex_layout.js":10}],7:[function(_dereq_,module,exports){
// Thin GL program wrapp to cache uniform locations/values, do compile-time pre-processing
// (injecting #defines and #pragma transforms into shaders), etc.

var GL = _dereq_('./gl.js');
var Utils = _dereq_('../utils.js');

GLProgram.id = 0; // assign each program a unique id
GLProgram.programs = {}; // programs, by id

function GLProgram (gl, vertex_shader_source, fragment_shader_source, options)
{
    options = options || {};

    this.gl = gl;
    this.program = null;
    this.defines = options.defines || {}; // key/values inserted as #defines into shaders at compile-time
    this.transforms = options.transforms; // key/values for URLs of blocks that can be injected into shaders at compile-time
    this.uniforms = {}; // program locations of uniforms, set/updated at compile-time
    this.attribs = {}; // program locations of vertex attributes
    this.vertex_shader_source = vertex_shader_source;
    this.fragment_shader_source = fragment_shader_source;

    this.id = GLProgram.id++;
    GLProgram.programs[this.id] = this;
    this.name = options.name; // can provide a program name (useful for debugging)

    this.compile();
};

// Creates a program that will refresh from source URLs each time it is compiled
GLProgram.createProgramFromURLs = function (gl, vertex_shader_url, fragment_shader_url, options)
{
    var program = Object.create(GLProgram.prototype);

    program.vertex_shader_url = vertex_shader_url;
    program.fragment_shader_url = fragment_shader_url;

    program.updateVertexShaderSource = function () {
        var source;
        var req = new XMLHttpRequest();
        req.onload = function () { source = req.response; };
        req.open('GET', Utils.urlForPath(this.vertex_shader_url) + '?' + (+new Date()), false /* async flag */);
        req.send();
        return source;
    };

    program.updateFragmentShaderSource = function () {
        var source;
        var req = new XMLHttpRequest();
        req.onload = function () { source = req.response; };
        req.open('GET', Utils.urlForPath(this.fragment_shader_url) + '?' + (+new Date()), false /* async flag */);
        req.send();
        return source;
    };

    GLProgram.call(program, gl, null, null, options);
    return program;
};

// Use program wrapper with simple state cache
GLProgram.prototype.use = function ()
{
    if (GLProgram.current != this) {
        this.gl.useProgram(this.program);
    }
    GLProgram.current = this;
};
GLProgram.current = null;

// Global defines applied to all programs (duplicate properties for a specific program will take precedence)
GLProgram.defines = {};

GLProgram.prototype.compile = function ()
{
    // Optionally update sources
    if (typeof this.updateVertexShaderSource == 'function') {
        this.vertex_shader_source = this.updateVertexShaderSource();
    }
    if (typeof this.updateFragmentShaderSource == 'function') {
        this.fragment_shader_source = this.updateFragmentShaderSource();
    }

    // Copy sources to be modified
    this.processed_vertex_shader_source = this.vertex_shader_source;
    this.processed_fragment_shader_source = this.fragment_shader_source;

    // Make list of defines (global, then program-specific)
    var defines = {};
    for (var d in GLProgram.defines) {
        defines[d] = GLProgram.defines[d];
    }
    for (var d in this.defines) {
        defines[d] = this.defines[d];
    }

    // Inject user-defined transforms (arbitrary code blocks matching named #pragmas)
    // TODO: flag to avoid re-retrieving transform URLs over network when rebuilding?
    // TODO: support glslify #pragma export names for better compatibility? (e.g. rename main() functions)
    // TODO: auto-insert uniforms referenced in mode definition, but not in shader base or transforms? (problem: don't have access to uniform list/type here)
    var re;
    if (this.transforms != null) {
        // Replace according to this pattern:
        // #pragma tangram: [key]
        // e.g. #pragma tangram: globals
        var source;
        var req = new XMLHttpRequest();
        req.onload = function () { source = req.response; };

        for (var key in this.transforms) {
            var transform = this.transforms[key];
            if (transform == null) {
                continue;
            }

            // Can be a single item (string or object) or a list
            if (typeof transform == 'string' || (typeof transform == 'object' && transform.length == null)) {
                transform = [transform];
            }

            // First find code replace points in shaders
            var re = new RegExp('^\\s*#pragma\\s+tangram:\\s+' + key + '\\s*$', 'm');
            var inject_vertex = this.processed_vertex_shader_source.match(re);
            var inject_fragment = this.processed_fragment_shader_source.match(re);

            // Avoid network request if nothing to replace
            if (inject_vertex == null && inject_fragment == null) {
                continue;
            }

            // Get the code over the network
            // TODO: use of synchronous XHR may be a speed issue
            var combined_source = "";
            for (var u in transform) {
                // Can be an inline block of GLSL, or a URL to retrieve GLSL block from
                var type, value;
                if (typeof transform[u] == 'object') {
                    if (transform[u].url != null) {
                        type = 'url';
                        value = transform[u].url;
                    }
                    if (transform[u].inline != null) {
                        type = 'inline';
                        value = transform[u].inline;
                    }
                }
                else {
                    // Default to inline GLSL
                    type = 'inline';
                    value = transform[u];
                }

                if (type == 'inline') {
                    source = value;
                }
                else if (type == 'url') {
                    req.open('GET', Utils.urlForPath(value) + '?' + (+new Date()), false /* async flag */);
                    req.send();
                }

                combined_source += source + '\n';
            }

            // Inject the code
            if (inject_vertex != null) {
                this.processed_vertex_shader_source = this.processed_vertex_shader_source.replace(re, combined_source);
            }
            if (inject_fragment != null) {
                this.processed_fragment_shader_source = this.processed_fragment_shader_source.replace(re, combined_source);
            }

            // Add a #define for this injection point
            defines['TANGRAM_TRANSFORM_' + key.replace(' ', '_').toUpperCase()] = true;
        }
    }

    // Clean-up any #pragmas that weren't replaced (to prevent compiler warnings)
    re = new RegExp('^\\s*#pragma\\s+tangram:\\s+\\w+\\s*$', 'gm');
    this.processed_vertex_shader_source = this.processed_vertex_shader_source.replace(re, '');
    this.processed_fragment_shader_source = this.processed_fragment_shader_source.replace(re, '');

    // Build & inject defines
    // This is done *after* code injection so that we can add defines for which code points were injected
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
    this.processed_vertex_shader_source = define_str + this.processed_vertex_shader_source;
    this.processed_fragment_shader_source = define_str + this.processed_fragment_shader_source;

    // Include program info useful for debugging
    var info = (this.name ? (this.name + ' / id ' + this.id) : ('id ' + this.id));
    this.processed_vertex_shader_source = '// Program: ' + info + '\n' + this.processed_vertex_shader_source;
    this.processed_fragment_shader_source = '// Program: ' + info + '\n' + this.processed_fragment_shader_source;

    // Compile & set uniforms to cached values
    this.program = GL.updateProgram(this.gl, this.program, this.processed_vertex_shader_source, this.processed_fragment_shader_source);
    this.use();
    this.refreshUniforms();
    this.refreshAttributes();
};

// ex: program.uniform('3f', 'position', x, y, z);
// TODO: only update uniforms when changed
GLProgram.prototype.uniform = function (method, name) // method-appropriate arguments follow
{
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

},{"../utils.js":16,"./gl.js":3}],8:[function(_dereq_,module,exports){
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


},{}],9:[function(_dereq_,module,exports){
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

},{"../utils.js":16,"./gl.js":3}],10:[function(_dereq_,module,exports){
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

},{}],11:[function(_dereq_,module,exports){
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
        layer.scene.init();
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

},{"./scene.js":14}],12:[function(_dereq_,module,exports){
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

},{"./gl/gl.js":3,"./gl/gl_program.js":7,"./gl/gl_texture.js":9,"./leaflet_layer.js":11}],13:[function(_dereq_,module,exports){
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

},{}],14:[function(_dereq_,module,exports){
var Point = _dereq_('./point.js');
var Geo = _dereq_('./geo.js');
var Style = _dereq_('./style.js');
var ModeManager = _dereq_('./gl/gl_modes').ModeManager;
var Utils = _dereq_('./utils.js');

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
    this.tile_source = tile_source;
    this.tiles = {};
    this.num_workers = options.num_workers || 1;
    this.allow_cross_domain_workers = (options.allow_cross_domain_workers === false ? false : true);

    if (typeof layers === 'string') {
        this.layer_source = Utils.urlForPath(layers);
        this.layers = Scene.loadLayers(this.layer_source);
    }
    else {
        this.layers = layers;
    }
    this.layers_serialized = Utils.serializeWithFunctions(this.layers);

    if (typeof styles === 'string') {
        this.style_source = Utils.urlForPath(styles);
        this.styles = Scene.loadStyles(this.style_source);
    }
    else {
        this.styles = Scene.postProcessStyles(styles);
    }
    this.styles_serialized = Utils.serializeWithFunctions(this.styles);

    this.dirty = true; // request a redraw
    this.animated = false; // request redraw every frame
    this.initialized = false;

    this.modes = Scene.createModes({}, this.styles);
    this.updateActiveModes();

    this.createWorkers();
    this.selection_map_worker_size = {};

    this.frame = 0;
    this.zoom = null;
    this.center = null;
    this.device_pixel_ratio = window.devicePixelRatio || 1;

    this.zooming = false;
    this.panning = false;

    this.container = options.container;

    this.resetTime();
}

Scene.prototype.init = function ()
{
    this.container = this.container || document.body;
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = 0;
    this.canvas.style.left = 0;
    this.canvas.style.zIndex = -1;
    this.container.appendChild(this.canvas);

    this.gl = GL.getContext(this.canvas);
    this.resizeMap(this.container.clientWidth, this.container.clientHeight);

    this.initModes();
    this.initSelectionBuffer();

    // this.zoom_step = 0.02; // for fractional zoom user adjustment
    this.last_render_count = null;
    this.initInputHandlers();

    // Init workers
    this.workers.forEach(function(worker) {
        worker.addEventListener('message', scene.workerBuildTileCompleted.bind(this));
        worker.addEventListener('message', scene.workerGetFeatureSelection.bind(this));
        worker.addEventListener('message', scene.workerLogMessage.bind(this));
    }.bind(this));

    this.initialized = true;
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

// Web workers handle heavy duty geometry processing
Scene.prototype.createWorkers = function ()
{
    var worker_url = Scene.library_base_url + 'tangram-worker.min.js' + '?' + (+new Date());

    // Instantiate workers from URL
    var makeWorkers = function (url) {
        this.workers = [];
        for (var w=0; w < this.num_workers; w++) {
            this.workers.push(new Worker(url));
            this.workers[w].postMessage({
                type: 'init',
                worker_id: w,
                num_workers: this.num_workers
            })
        }
    }.bind(this);

    // Local object URLs supported?
    var createObjectURL = (window.URL && window.URL.createObjectURL) || (window.webkitURL && window.webkitURL.createObjectURL);
    if (createObjectURL && this.allow_cross_domain_workers) {
        // To allow workers to be loaded cross-domain, first load worker source via XHR, then create a local URL via a blob
        var req = new XMLHttpRequest();
        req.onload = function () {
            var worker_local_url = createObjectURL(new Blob([req.response], { type: 'application/javascript' }));
            makeWorkers(worker_local_url);
        }.bind(this);
        req.open('GET', worker_url, false /* async flag */);
        req.send();
    }
    // Traditional load from remote URL
    else {
        makeWorkers(worker_url);
    }

    this.next_worker = 0;
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
    for (var mode in this.active_modes) {
        // Per-frame mode updates/animations
        // Called even if the mode isn't rendered by any current tiles, so time-based animations, etc. continue
        this.modes[mode].update();

        var gl_program = this.modes[mode].gl_program;
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
            if (gl_program == null) {
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
            function() {
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
            }.bind(this),
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

// Load a single tile
Scene.prototype.loadTile = function (coords, div, callback)
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

// Reload layers and styles (only if they were originally loaded by URL). Mostly useful for testing.
Scene.prototype.reloadConfig = function ()
{
    if (this.layer_source != null) {
        this.layers = Scene.loadLayers(this.layer_source);
        this.layers_serialized = Utils.serializeWithFunctions(this.layers);
    }

    if (this.style_source != null) {
        this.styles = Scene.loadStyles(this.style_source);
        this.styles_serialized = Utils.serializeWithFunctions(this.styles);
    }

    if (this.layer_source != null || this.style_source != null) {
        this.rebuildTiles();
    }
};

// Called (currently manually) after modes are updated in stylesheet
Scene.prototype.refreshModes = function ()
{
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

Scene.loadLayers = function (url)
{
    var layers;
    var req = new XMLHttpRequest();
    req.onload = function () { eval('layers = ' + req.response); }; // TODO: security!
    req.open('GET', url + '?' + (+new Date()), false /* async flag */);
    req.send();
    return layers;
};

Scene.loadStyles = function (url)
{
    var styles;
    var req = new XMLHttpRequest();
    req.onload = function () { styles = req.response; };
    req.open('GET', url + '?' + (+new Date()), false /* async flag */);
    req.send();

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
            styles = null;
        }
    }

    // Find generic functions & style macros
    Utils.stringsToFunctions(styles);
    Style.expandMacros(styles);
    Scene.postProcessStyles(styles);

    return styles;
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
Scene.createModes = function (modes, styles)
{
    // Built-in modes
    var built_ins = _dereq_('./gl/gl_modes').Modes; // TODO: make this non-GL specific
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
            ModeManager.configureMode(m, styles.modes[m]);
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

},{"./geo.js":2,"./gl/gl.js":3,"./gl/gl_builders.js":4,"./gl/gl_modes":6,"./gl/gl_program.js":7,"./gl/gl_texture.js":9,"./point.js":13,"./style.js":15,"./utils.js":16,"gl-matrix":1,"js-yaml":"jkXaKS"}],15:[function(_dereq_,module,exports){
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

},{"./geo.js":2}],16:[function(_dereq_,module,exports){
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

},{}],17:[function(_dereq_,module,exports){
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

},{}]},{},[12])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvZGlzdC9nbC1tYXRyaXguanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dlby5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2wuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX2J1aWxkZXJzLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nbC9nbF9nZW9tLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nbC9nbF9tb2Rlcy5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfcHJvZ3JhbS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfc2hhZGVycy5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfdGV4dHVyZS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfdmVydGV4X2xheW91dC5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvbGVhZmxldF9sYXllci5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvbW9kdWxlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9wb2ludC5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvc2NlbmUuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL3N0eWxlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy91dGlscy5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvdmVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeHBJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2p5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgZ2wtbWF0cml4IC0gSGlnaCBwZXJmb3JtYW5jZSBtYXRyaXggYW5kIHZlY3RvciBvcGVyYXRpb25zXG4gKiBAYXV0aG9yIEJyYW5kb24gSm9uZXNcbiAqIEBhdXRob3IgQ29saW4gTWFjS2VuemllIElWXG4gKiBAdmVyc2lvbiAyLjIuMVxuICovXG5cbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb25cbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRVxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG5cbihmdW5jdGlvbihfZ2xvYmFsKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBzaGltID0ge307XG4gIGlmICh0eXBlb2YoZXhwb3J0cykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcbiAgICAgIHNoaW0uZXhwb3J0cyA9IHt9O1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2hpbS5leHBvcnRzO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGdsLW1hdHJpeCBsaXZlcyBpbiBhIGJyb3dzZXIsIGRlZmluZSBpdHMgbmFtZXNwYWNlcyBpbiBnbG9iYWxcbiAgICAgIHNoaW0uZXhwb3J0cyA9IHR5cGVvZih3aW5kb3cpICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IF9nbG9iYWw7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIC8vIGdsLW1hdHJpeCBsaXZlcyBpbiBjb21tb25qcywgZGVmaW5lIGl0cyBuYW1lc3BhY2VzIGluIGV4cG9ydHNcbiAgICBzaGltLmV4cG9ydHMgPSBleHBvcnRzO1xuICB9XG5cbiAgKGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiAgICAvKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG5cbmlmKCFHTE1BVF9FUFNJTE9OKSB7XG4gICAgdmFyIEdMTUFUX0VQU0lMT04gPSAwLjAwMDAwMTtcbn1cblxuaWYoIUdMTUFUX0FSUkFZX1RZUEUpIHtcbiAgICB2YXIgR0xNQVRfQVJSQVlfVFlQRSA9ICh0eXBlb2YgRmxvYXQzMkFycmF5ICE9PSAndW5kZWZpbmVkJykgPyBGbG9hdDMyQXJyYXkgOiBBcnJheTtcbn1cblxuaWYoIUdMTUFUX1JBTkRPTSkge1xuICAgIHZhciBHTE1BVF9SQU5ET00gPSBNYXRoLnJhbmRvbTtcbn1cblxuLyoqXG4gKiBAY2xhc3MgQ29tbW9uIHV0aWxpdGllc1xuICogQG5hbWUgZ2xNYXRyaXhcbiAqL1xudmFyIGdsTWF0cml4ID0ge307XG5cbi8qKlxuICogU2V0cyB0aGUgdHlwZSBvZiBhcnJheSB1c2VkIHdoZW4gY3JlYXRpbmcgbmV3IHZlY3RvcnMgYW5kIG1hdHJpY2llc1xuICpcbiAqIEBwYXJhbSB7VHlwZX0gdHlwZSBBcnJheSB0eXBlLCBzdWNoIGFzIEZsb2F0MzJBcnJheSBvciBBcnJheVxuICovXG5nbE1hdHJpeC5zZXRNYXRyaXhBcnJheVR5cGUgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgR0xNQVRfQVJSQVlfVFlQRSA9IHR5cGU7XG59XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLmdsTWF0cml4ID0gZ2xNYXRyaXg7XG59XG5cbnZhciBkZWdyZWUgPSBNYXRoLlBJIC8gMTgwO1xuXG4vKipcbiogQ29udmVydCBEZWdyZWUgVG8gUmFkaWFuXG4qXG4qIEBwYXJhbSB7TnVtYmVyfSBBbmdsZSBpbiBEZWdyZWVzXG4qL1xuZ2xNYXRyaXgudG9SYWRpYW4gPSBmdW5jdGlvbihhKXtcbiAgICAgcmV0dXJuIGEgKiBkZWdyZWU7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG5hbWUgdmVjMlxuICovXG5cbnZhciB2ZWMyID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjMlxuICpcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMik7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMik7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5mcm9tVmFsdWVzID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgyKTtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzIgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzIgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5zZXQgPSBmdW5jdGlvbihvdXQsIHgsIHkpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLmFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnN1YnRyYWN0ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuc3ViID0gdmVjMi5zdWJ0cmFjdDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubXVsdGlwbHkgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5tdWwgPSB2ZWMyLm11bHRpcGx5O1xuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5kaXZpZGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuZGl2ID0gdmVjMi5kaXZpZGU7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm1pbiA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5tYXggPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMyIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzIncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnNjYWxlQW5kQWRkID0gZnVuY3Rpb24ob3V0LCBhLCBiLCBzY2FsZSkge1xuICAgIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcbiAgICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbnZlYzIuZGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuZGlzdCA9IHZlYzIuZGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMyLnNxdWFyZWREaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV07XG4gICAgcmV0dXJuIHgqeCArIHkqeTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLnNxckRpc3QgPSB2ZWMyLnNxdWFyZWREaXN0YW5jZTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG52ZWMyLmxlbmd0aCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5sZW4gPSB2ZWMyLmxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG52ZWMyLnNxdWFyZWRMZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgcmV0dXJuIHgqeCArIHkqeTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5zcXJMZW4gPSB2ZWMyLnNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5uZWdhdGUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAtYVswXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubm9ybWFsaXplID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICB2YXIgbGVuID0geCp4ICsgeSp5O1xuICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICAgICAgb3V0WzBdID0gYVswXSAqIGxlbjtcbiAgICAgICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG52ZWMyLmRvdCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV07XG59O1xuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqIE5vdGUgdGhhdCB0aGUgY3Jvc3MgcHJvZHVjdCBtdXN0IGJ5IGRlZmluaXRpb24gcHJvZHVjZSBhIDNEIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMi5jcm9zcyA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIHZhciB6ID0gYVswXSAqIGJbMV0gLSBhWzFdICogYlswXTtcbiAgICBvdXRbMF0gPSBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IHo7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubGVycCA9IGZ1bmN0aW9uIChvdXQsIGEsIGIsIHQpIHtcbiAgICB2YXIgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV07XG4gICAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gICAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5yYW5kb20gPSBmdW5jdGlvbiAob3V0LCBzY2FsZSkge1xuICAgIHNjYWxlID0gc2NhbGUgfHwgMS4wO1xuICAgIHZhciByID0gR0xNQVRfUkFORE9NKCkgKiAyLjAgKiBNYXRoLlBJO1xuICAgIG91dFswXSA9IE1hdGguY29zKHIpICogc2NhbGU7XG4gICAgb3V0WzFdID0gTWF0aC5zaW4ocikgKiBzY2FsZTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQyfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnRyYW5zZm9ybU1hdDIgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHk7XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0MmR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIudHJhbnNmb3JtTWF0MmQgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHkgKyBtWzRdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVszXSAqIHkgKyBtWzVdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDNcbiAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQzfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnRyYW5zZm9ybU1hdDMgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVszXSAqIHkgKyBtWzZdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs0XSAqIHkgKyBtWzddO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDRcbiAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzAnXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi50cmFuc2Zvcm1NYXQ0ID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLCBcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bMTJdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzEzXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjMnMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMi4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzJzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLmZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZlYyA9IHZlYzIuY3JlYXRlKCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgICAgIHZhciBpLCBsO1xuICAgICAgICBpZighc3RyaWRlKSB7XG4gICAgICAgICAgICBzdHJpZGUgPSAyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIW9mZnNldCkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoY291bnQpIHtcbiAgICAgICAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsID0gYS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICAgICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07XG4gICAgICAgICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgICAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfTtcbn0pKCk7XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gdmVjIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKi9cbnZlYzIuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ3ZlYzIoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnZlYzIgPSB2ZWMyO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgMyBEaW1lbnNpb25hbCBWZWN0b3JcbiAqIEBuYW1lIHZlYzNcbiAqL1xuXG52YXIgdmVjMyA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzNcbiAqXG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXG4gKi9cbnZlYzMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDMpO1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xudmVjMy5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMyk7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xudmVjMy5mcm9tVmFsdWVzID0gZnVuY3Rpb24oeCwgeSwgeikge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgzKTtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLmNvcHkgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnNldCA9IGZ1bmN0aW9uKG91dCwgeCwgeSwgeikge1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5hZGQgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5zdWJ0cmFjdCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLnN1YiA9IHZlYzMuc3VidHJhY3Q7XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMubXVsID0gdmVjMy5tdWx0aXBseTtcblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuZGl2aWRlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLmRpdiA9IHZlYzMuZGl2aWRlO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5taW4gPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubWF4ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gICAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjMyBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMzJ3MgYWZ0ZXIgc2NhbGluZyB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5zY2FsZUFuZEFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XG4gICAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xuICAgIG91dFsyXSA9IGFbMl0gKyAoYlsyXSAqIHNjYWxlKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjMy5kaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeik7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLmRpc3QgPSB2ZWMzLmRpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjMy5zcXVhcmVkRGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdLFxuICAgICAgICB6ID0gYlsyXSAtIGFbMl07XG4gICAgcmV0dXJuIHgqeCArIHkqeSArIHoqejtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLnNxckRpc3QgPSB2ZWMzLnNxdWFyZWREaXN0YW5jZTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG52ZWMzLmxlbmd0aCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnopO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMubGVuID0gdmVjMy5sZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xudmVjMy5zcXVhcmVkTGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLnNxckxlbiA9IHZlYzMuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm5lZ2F0ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5ub3JtYWxpemUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICB2YXIgbGVuID0geCp4ICsgeSp5ICsgeip6O1xuICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICAgICAgb3V0WzBdID0gYVswXSAqIGxlbjtcbiAgICAgICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcbiAgICAgICAgb3V0WzJdID0gYVsyXSAqIGxlbjtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG52ZWMzLmRvdCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXTtcbn07XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5jcm9zcyA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLFxuICAgICAgICBieCA9IGJbMF0sIGJ5ID0gYlsxXSwgYnogPSBiWzJdO1xuXG4gICAgb3V0WzBdID0gYXkgKiBieiAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXogKiBieCAtIGF4ICogYno7XG4gICAgb3V0WzJdID0gYXggKiBieSAtIGF5ICogYng7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubGVycCA9IGZ1bmN0aW9uIChvdXQsIGEsIGIsIHQpIHtcbiAgICB2YXIgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXTtcbiAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnJhbmRvbSA9IGZ1bmN0aW9uIChvdXQsIHNjYWxlKSB7XG4gICAgc2NhbGUgPSBzY2FsZSB8fCAxLjA7XG5cbiAgICB2YXIgciA9IEdMTUFUX1JBTkRPTSgpICogMi4wICogTWF0aC5QSTtcbiAgICB2YXIgeiA9IChHTE1BVF9SQU5ET00oKSAqIDIuMCkgLSAxLjA7XG4gICAgdmFyIHpTY2FsZSA9IE1hdGguc3FydCgxLjAteip6KSAqIHNjYWxlO1xuXG4gICAgb3V0WzBdID0gTWF0aC5jb3MocikgKiB6U2NhbGU7XG4gICAgb3V0WzFdID0gTWF0aC5zaW4ocikgKiB6U2NhbGU7XG4gICAgb3V0WzJdID0geiAqIHNjYWxlO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDQuXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy50cmFuc2Zvcm1NYXQ0ID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM107XG4gICAgb3V0WzJdID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDMuXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIHRoZSAzeDMgbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMudHJhbnNmb3JtTWF0MyA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuICAgIG91dFswXSA9IHggKiBtWzBdICsgeSAqIG1bM10gKyB6ICogbVs2XTtcbiAgICBvdXRbMV0gPSB4ICogbVsxXSArIHkgKiBtWzRdICsgeiAqIG1bN107XG4gICAgb3V0WzJdID0geCAqIG1bMl0gKyB5ICogbVs1XSArIHogKiBtWzhdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnRyYW5zZm9ybVF1YXQgPSBmdW5jdGlvbihvdXQsIGEsIHEpIHtcbiAgICAvLyBiZW5jaG1hcmtzOiBodHRwOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXRyYW5zZm9ybS12ZWMzLWltcGxlbWVudGF0aW9uc1xuXG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl0sXG4gICAgICAgIHF4ID0gcVswXSwgcXkgPSBxWzFdLCBxeiA9IHFbMl0sIHF3ID0gcVszXSxcblxuICAgICAgICAvLyBjYWxjdWxhdGUgcXVhdCAqIHZlY1xuICAgICAgICBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeSxcbiAgICAgICAgaXkgPSBxdyAqIHkgKyBxeiAqIHggLSBxeCAqIHosXG4gICAgICAgIGl6ID0gcXcgKiB6ICsgcXggKiB5IC0gcXkgKiB4LFxuICAgICAgICBpdyA9IC1xeCAqIHggLSBxeSAqIHkgLSBxeiAqIHo7XG5cbiAgICAvLyBjYWxjdWxhdGUgcmVzdWx0ICogaW52ZXJzZSBxdWF0XG4gICAgb3V0WzBdID0gaXggKiBxdyArIGl3ICogLXF4ICsgaXkgKiAtcXogLSBpeiAqIC1xeTtcbiAgICBvdXRbMV0gPSBpeSAqIHF3ICsgaXcgKiAtcXkgKyBpeiAqIC1xeCAtIGl4ICogLXF6O1xuICAgIG91dFsyXSA9IGl6ICogcXcgKyBpdyAqIC1xeiArIGl4ICogLXF5IC0gaXkgKiAtcXg7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qXG4qIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHgtYXhpc1xuKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcbiogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxuKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cbiogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXG4qIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiovXG52ZWMzLnJvdGF0ZVggPSBmdW5jdGlvbihvdXQsIGEsIGIsIGMpe1xuICAgdmFyIHAgPSBbXSwgcj1bXTtcblx0ICAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG5cdCAgcFswXSA9IGFbMF0gLSBiWzBdO1xuXHQgIHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgXHRwWzJdID0gYVsyXSAtIGJbMl07XG5cblx0ICAvL3BlcmZvcm0gcm90YXRpb25cblx0ICByWzBdID0gcFswXTtcblx0ICByWzFdID0gcFsxXSpNYXRoLmNvcyhjKSAtIHBbMl0qTWF0aC5zaW4oYyk7XG5cdCAgclsyXSA9IHBbMV0qTWF0aC5zaW4oYykgKyBwWzJdKk1hdGguY29zKGMpO1xuXG5cdCAgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuXHQgIG91dFswXSA9IHJbMF0gKyBiWzBdO1xuXHQgIG91dFsxXSA9IHJbMV0gKyBiWzFdO1xuXHQgIG91dFsyXSA9IHJbMl0gKyBiWzJdO1xuXG4gIFx0cmV0dXJuIG91dDtcbn07XG5cbi8qXG4qIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHktYXhpc1xuKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcbiogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxuKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cbiogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXG4qIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiovXG52ZWMzLnJvdGF0ZVkgPSBmdW5jdGlvbihvdXQsIGEsIGIsIGMpe1xuICBcdHZhciBwID0gW10sIHI9W107XG4gIFx0Ly9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxuICBcdHBbMF0gPSBhWzBdIC0gYlswXTtcbiAgXHRwWzFdID0gYVsxXSAtIGJbMV07XG4gIFx0cFsyXSA9IGFbMl0gLSBiWzJdO1xuICBcbiAgXHQvL3BlcmZvcm0gcm90YXRpb25cbiAgXHRyWzBdID0gcFsyXSpNYXRoLnNpbihjKSArIHBbMF0qTWF0aC5jb3MoYyk7XG4gIFx0clsxXSA9IHBbMV07XG4gIFx0clsyXSA9IHBbMl0qTWF0aC5jb3MoYykgLSBwWzBdKk1hdGguc2luKGMpO1xuICBcbiAgXHQvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXG4gIFx0b3V0WzBdID0gclswXSArIGJbMF07XG4gIFx0b3V0WzFdID0gclsxXSArIGJbMV07XG4gIFx0b3V0WzJdID0gclsyXSArIGJbMl07XG4gIFxuICBcdHJldHVybiBvdXQ7XG59O1xuXG4vKlxuKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB6LWF4aXNcbiogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXG4qIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcbiogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXG4qIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxuKiBAcmV0dXJucyB7dmVjM30gb3V0XG4qL1xudmVjMy5yb3RhdGVaID0gZnVuY3Rpb24ob3V0LCBhLCBiLCBjKXtcbiAgXHR2YXIgcCA9IFtdLCByPVtdO1xuICBcdC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cbiAgXHRwWzBdID0gYVswXSAtIGJbMF07XG4gIFx0cFsxXSA9IGFbMV0gLSBiWzFdO1xuICBcdHBbMl0gPSBhWzJdIC0gYlsyXTtcbiAgXG4gIFx0Ly9wZXJmb3JtIHJvdGF0aW9uXG4gIFx0clswXSA9IHBbMF0qTWF0aC5jb3MoYykgLSBwWzFdKk1hdGguc2luKGMpO1xuICBcdHJbMV0gPSBwWzBdKk1hdGguc2luKGMpICsgcFsxXSpNYXRoLmNvcyhjKTtcbiAgXHRyWzJdID0gcFsyXTtcbiAgXG4gIFx0Ly90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuICBcdG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBcdG91dFsxXSA9IHJbMV0gKyBiWzFdO1xuICBcdG91dFsyXSA9IHJbMl0gKyBiWzJdO1xuICBcbiAgXHRyZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjM3MuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMy4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzNzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLmZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZlYyA9IHZlYzMuY3JlYXRlKCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgICAgIHZhciBpLCBsO1xuICAgICAgICBpZighc3RyaWRlKSB7XG4gICAgICAgICAgICBzdHJpZGUgPSAzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIW9mZnNldCkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoY291bnQpIHtcbiAgICAgICAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsID0gYS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICAgICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07IHZlY1syXSA9IGFbaSsyXTtcbiAgICAgICAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdOyBhW2krMl0gPSB2ZWNbMl07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IHZlYyB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG52ZWMzLnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICd2ZWMzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnZlYzMgPSB2ZWMzO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgNCBEaW1lbnNpb25hbCBWZWN0b3JcbiAqIEBuYW1lIHZlYzRcbiAqL1xuXG52YXIgdmVjNCA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzRcbiAqXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXG4gKi9cbnZlYzQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWM0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG52ZWM0LmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG52ZWM0LmZyb21WYWx1ZXMgPSBmdW5jdGlvbih4LCB5LCB6LCB3KSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIG91dFszXSA9IHc7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5zZXQgPSBmdW5jdGlvbihvdXQsIHgsIHksIHosIHcpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSB3O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5hZGQgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5zdWJ0cmFjdCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gLSBiWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LnN1YiA9IHZlYzQuc3VidHJhY3Q7XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0Lm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAqIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQubXVsID0gdmVjNC5tdWx0aXBseTtcblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuZGl2aWRlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAvIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LmRpdiA9IHZlYzQuZGl2aWRlO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5taW4gPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgICBvdXRbM10gPSBNYXRoLm1pbihhWzNdLCBiWzNdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubWF4ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gICAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XG4gICAgb3V0WzNdID0gTWF0aC5tYXgoYVszXSwgYlszXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjNCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICBvdXRbM10gPSBhWzNdICogYjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBZGRzIHR3byB2ZWM0J3MgYWZ0ZXIgc2NhbGluZyB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5zY2FsZUFuZEFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XG4gICAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xuICAgIG91dFsyXSA9IGFbMl0gKyAoYlsyXSAqIHNjYWxlKTtcbiAgICBvdXRbM10gPSBhWzNdICsgKGJbM10gKiBzY2FsZSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbnZlYzQuZGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdLFxuICAgICAgICB6ID0gYlsyXSAtIGFbMl0sXG4gICAgICAgIHcgPSBiWzNdIC0gYVszXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeiArIHcqdyk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LmRpc3QgPSB2ZWM0LmRpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjNC5zcXVhcmVkRGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdLFxuICAgICAgICB6ID0gYlsyXSAtIGFbMl0sXG4gICAgICAgIHcgPSBiWzNdIC0gYVszXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6ICsgdyp3O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3F1YXJlZERpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuc3FyRGlzdCA9IHZlYzQuc3F1YXJlZERpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbnZlYzQubGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXSxcbiAgICAgICAgdyA9IGFbM107XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnogKyB3KncpO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQubGVuID0gdmVjNC5sZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xudmVjNC5zcXVhcmVkTGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXSxcbiAgICAgICAgdyA9IGFbM107XG4gICAgcmV0dXJuIHgqeCArIHkqeSArIHoqeiArIHcqdztcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5zcXJMZW4gPSB2ZWM0LnNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5uZWdhdGUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAtYVswXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICBvdXRbMl0gPSAtYVsyXTtcbiAgICBvdXRbM10gPSAtYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubm9ybWFsaXplID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl0sXG4gICAgICAgIHcgPSBhWzNdO1xuICAgIHZhciBsZW4gPSB4KnggKyB5KnkgKyB6KnogKyB3Knc7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgICAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgICAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICAgICAgICBvdXRbMl0gPSBhWzJdICogbGVuO1xuICAgICAgICBvdXRbM10gPSBhWzNdICogbGVuO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbnZlYzQuZG90ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdICsgYVszXSAqIGJbM107XG59O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LmxlcnAgPSBmdW5jdGlvbiAob3V0LCBhLCBiLCB0KSB7XG4gICAgdmFyIGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdLFxuICAgICAgICBheiA9IGFbMl0sXG4gICAgICAgIGF3ID0gYVszXTtcbiAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgICBvdXRbM10gPSBhdyArIHQgKiAoYlszXSAtIGF3KTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnJhbmRvbSA9IGZ1bmN0aW9uIChvdXQsIHNjYWxlKSB7XG4gICAgc2NhbGUgPSBzY2FsZSB8fCAxLjA7XG5cbiAgICAvL1RPRE86IFRoaXMgaXMgYSBwcmV0dHkgYXdmdWwgd2F5IG9mIGRvaW5nIHRoaXMuIEZpbmQgc29tZXRoaW5nIGJldHRlci5cbiAgICBvdXRbMF0gPSBHTE1BVF9SQU5ET00oKTtcbiAgICBvdXRbMV0gPSBHTE1BVF9SQU5ET00oKTtcbiAgICBvdXRbMl0gPSBHTE1BVF9SQU5ET00oKTtcbiAgICBvdXRbM10gPSBHTE1BVF9SQU5ET00oKTtcbiAgICB2ZWM0Lm5vcm1hbGl6ZShvdXQsIG91dCk7XG4gICAgdmVjNC5zY2FsZShvdXQsIG91dCwgc2NhbGUpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIG1hdDQuXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnRyYW5zZm9ybU1hdDQgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSwgdyA9IGFbM107XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0gKiB3O1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdICogdztcbiAgICBvdXRbMl0gPSBtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0gKiB3O1xuICAgIG91dFszXSA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XSAqIHc7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQudHJhbnNmb3JtUXVhdCA9IGZ1bmN0aW9uKG91dCwgYSwgcSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdLFxuICAgICAgICBxeCA9IHFbMF0sIHF5ID0gcVsxXSwgcXogPSBxWzJdLCBxdyA9IHFbM10sXG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHF1YXQgKiB2ZWNcbiAgICAgICAgaXggPSBxdyAqIHggKyBxeSAqIHogLSBxeiAqIHksXG4gICAgICAgIGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6LFxuICAgICAgICBpeiA9IHF3ICogeiArIHF4ICogeSAtIHF5ICogeCxcbiAgICAgICAgaXcgPSAtcXggKiB4IC0gcXkgKiB5IC0gcXogKiB6O1xuXG4gICAgLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuICAgIG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXk7XG4gICAgb3V0WzFdID0gaXkgKiBxdyArIGl3ICogLXF5ICsgaXogKiAtcXggLSBpeCAqIC1xejtcbiAgICBvdXRbMl0gPSBpeiAqIHF3ICsgaXcgKiAtcXogKyBpeCAqIC1xeSAtIGl5ICogLXF4O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWM0cy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWM0LiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjMnMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgdmVjID0gdmVjNC5jcmVhdGUoKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICAgICAgdmFyIGksIGw7XG4gICAgICAgIGlmKCFzdHJpZGUpIHtcbiAgICAgICAgICAgIHN0cmlkZSA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZighb2Zmc2V0KSB7XG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZihjb3VudCkge1xuICAgICAgICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgICAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTsgdmVjWzJdID0gYVtpKzJdOyB2ZWNbM10gPSBhW2krM107XG4gICAgICAgICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgICAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTsgYVtpKzJdID0gdmVjWzJdOyBhW2krM10gPSB2ZWNbM107XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IHZlYyB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG52ZWM0LnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICd2ZWM0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMudmVjNCA9IHZlYzQ7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyeDIgTWF0cml4XG4gKiBAbmFtZSBtYXQyXG4gKi9cblxudmFyIG1hdDIgPSB7fTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDJcbiAqXG4gKiBAcmV0dXJucyB7bWF0Mn0gYSBuZXcgMngyIG1hdHJpeFxuICovXG5tYXQyLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MiBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gYSBtYXRyaXggdG8gY2xvbmVcbiAqIEByZXR1cm5zIHttYXQyfSBhIG5ldyAyeDIgbWF0cml4XG4gKi9cbm1hdDIuY2xvbmUgPSBmdW5jdGlvbihhKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDIgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgYSBtYXQyIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIudHJhbnNwb3NlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICAgIGlmIChvdXQgPT09IGEpIHtcbiAgICAgICAgdmFyIGExID0gYVsxXTtcbiAgICAgICAgb3V0WzFdID0gYVsyXTtcbiAgICAgICAgb3V0WzJdID0gYTE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3V0WzBdID0gYVswXTtcbiAgICAgICAgb3V0WzFdID0gYVsyXTtcbiAgICAgICAgb3V0WzJdID0gYVsxXTtcbiAgICAgICAgb3V0WzNdID0gYVszXTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSxcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGEwICogYTMgLSBhMiAqIGExO1xuXG4gICAgaWYgKCFkZXQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcbiAgICBcbiAgICBvdXRbMF0gPSAgYTMgKiBkZXQ7XG4gICAgb3V0WzFdID0gLWExICogZGV0O1xuICAgIG91dFsyXSA9IC1hMiAqIGRldDtcbiAgICBvdXRbM10gPSAgYTAgKiBkZXQ7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIuYWRqb2ludCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIC8vIENhY2hpbmcgdGhpcyB2YWx1ZSBpcyBuZXNzZWNhcnkgaWYgb3V0ID09IGFcbiAgICB2YXIgYTAgPSBhWzBdO1xuICAgIG91dFswXSA9ICBhWzNdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIG91dFszXSA9ICBhMDtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxuICovXG5tYXQyLmRldGVybWluYW50ID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gYVswXSAqIGFbM10gLSBhWzJdICogYVsxXTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MidzXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM107XG4gICAgdmFyIGIwID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl0sIGIzID0gYlszXTtcbiAgICBvdXRbMF0gPSBhMCAqIGIwICsgYTIgKiBiMTtcbiAgICBvdXRbMV0gPSBhMSAqIGIwICsgYTMgKiBiMTtcbiAgICBvdXRbMl0gPSBhMCAqIGIyICsgYTIgKiBiMztcbiAgICBvdXRbM10gPSBhMSAqIGIyICsgYTMgKiBiMztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDIubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xubWF0Mi5tdWwgPSBtYXQyLm11bHRpcGx5O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQyIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIucm90YXRlID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSxcbiAgICAgICAgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpO1xuICAgIG91dFswXSA9IGEwICogIGMgKyBhMiAqIHM7XG4gICAgb3V0WzFdID0gYTEgKiAgYyArIGEzICogcztcbiAgICBvdXRbMl0gPSBhMCAqIC1zICsgYTIgKiBjO1xuICAgIG91dFszXSA9IGExICogLXMgKyBhMyAqIGM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQyIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqKi9cbm1hdDIuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLFxuICAgICAgICB2MCA9IHZbMF0sIHYxID0gdlsxXTtcbiAgICBvdXRbMF0gPSBhMCAqIHYwO1xuICAgIG91dFsxXSA9IGExICogdjA7XG4gICAgb3V0WzJdID0gYTIgKiB2MTtcbiAgICBvdXRbM10gPSBhMyAqIHYxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBtYXQgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xubWF0Mi5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAnbWF0MignICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJztcbn07XG5cbi8qKlxuICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXG4gKi9cbm1hdDIuZnJvYiA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuKE1hdGguc3FydChNYXRoLnBvdyhhWzBdLCAyKSArIE1hdGgucG93KGFbMV0sIDIpICsgTWF0aC5wb3coYVsyXSwgMikgKyBNYXRoLnBvdyhhWzNdLCAyKSkpXG59O1xuXG4vKipcbiAqIFJldHVybnMgTCwgRCBhbmQgVSBtYXRyaWNlcyAoTG93ZXIgdHJpYW5ndWxhciwgRGlhZ29uYWwgYW5kIFVwcGVyIHRyaWFuZ3VsYXIpIGJ5IGZhY3Rvcml6aW5nIHRoZSBpbnB1dCBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gTCB0aGUgbG93ZXIgdHJpYW5ndWxhciBtYXRyaXggXG4gKiBAcGFyYW0ge21hdDJ9IEQgdGhlIGRpYWdvbmFsIG1hdHJpeCBcbiAqIEBwYXJhbSB7bWF0Mn0gVSB0aGUgdXBwZXIgdHJpYW5ndWxhciBtYXRyaXggXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGlucHV0IG1hdHJpeCB0byBmYWN0b3JpemVcbiAqL1xuXG5tYXQyLkxEVSA9IGZ1bmN0aW9uIChMLCBELCBVLCBhKSB7IFxuICAgIExbMl0gPSBhWzJdL2FbMF07IFxuICAgIFVbMF0gPSBhWzBdOyBcbiAgICBVWzFdID0gYVsxXTsgXG4gICAgVVszXSA9IGFbM10gLSBMWzJdICogVVsxXTsgXG4gICAgcmV0dXJuIFtMLCBELCBVXTsgICAgICAgXG59OyBcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMubWF0MiA9IG1hdDI7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyeDMgTWF0cml4XG4gKiBAbmFtZSBtYXQyZFxuICogXG4gKiBAZGVzY3JpcHRpb24gXG4gKiBBIG1hdDJkIGNvbnRhaW5zIHNpeCBlbGVtZW50cyBkZWZpbmVkIGFzOlxuICogPHByZT5cbiAqIFthLCBjLCB0eCxcbiAqICBiLCBkLCB0eV1cbiAqIDwvcHJlPlxuICogVGhpcyBpcyBhIHNob3J0IGZvcm0gZm9yIHRoZSAzeDMgbWF0cml4OlxuICogPHByZT5cbiAqIFthLCBjLCB0eCxcbiAqICBiLCBkLCB0eSxcbiAqICAwLCAwLCAxXVxuICogPC9wcmU+XG4gKiBUaGUgbGFzdCByb3cgaXMgaWdub3JlZCBzbyB0aGUgYXJyYXkgaXMgc2hvcnRlciBhbmQgb3BlcmF0aW9ucyBhcmUgZmFzdGVyLlxuICovXG5cbnZhciBtYXQyZCA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0MmRcbiAqXG4gKiBAcmV0dXJucyB7bWF0MmR9IGEgbmV3IDJ4MyBtYXRyaXhcbiAqL1xubWF0MmQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDYpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MmQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDJkfSBhIG5ldyAyeDMgbWF0cml4XG4gKi9cbm1hdDJkLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg2KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MmQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xubWF0MmQuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCBhIG1hdDJkIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5tYXQyZC5pbnZlcnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYWEgPSBhWzBdLCBhYiA9IGFbMV0sIGFjID0gYVsyXSwgYWQgPSBhWzNdLFxuICAgICAgICBhdHggPSBhWzRdLCBhdHkgPSBhWzVdO1xuXG4gICAgdmFyIGRldCA9IGFhICogYWQgLSBhYiAqIGFjO1xuICAgIGlmKCFkZXQpe1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gYWQgKiBkZXQ7XG4gICAgb3V0WzFdID0gLWFiICogZGV0O1xuICAgIG91dFsyXSA9IC1hYyAqIGRldDtcbiAgICBvdXRbM10gPSBhYSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYWMgKiBhdHkgLSBhZCAqIGF0eCkgKiBkZXQ7XG4gICAgb3V0WzVdID0gKGFiICogYXR4IC0gYWEgKiBhdHkpICogZGV0O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDJkLmRldGVybWluYW50ID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gYVswXSAqIGFbM10gLSBhWzFdICogYVsyXTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MmQnc1xuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQyZH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sIGE0ID0gYVs0XSwgYTUgPSBhWzVdLFxuICAgICAgICBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM10sIGI0ID0gYls0XSwgYjUgPSBiWzVdO1xuICAgIG91dFswXSA9IGEwICogYjAgKyBhMiAqIGIxO1xuICAgIG91dFsxXSA9IGExICogYjAgKyBhMyAqIGIxO1xuICAgIG91dFsyXSA9IGEwICogYjIgKyBhMiAqIGIzO1xuICAgIG91dFszXSA9IGExICogYjIgKyBhMyAqIGIzO1xuICAgIG91dFs0XSA9IGEwICogYjQgKyBhMiAqIGI1ICsgYTQ7XG4gICAgb3V0WzVdID0gYTEgKiBiNCArIGEzICogYjUgKyBhNTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDJkLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDJkLm11bCA9IG1hdDJkLm11bHRpcGx5O1xuXG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDJkIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLnJvdGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sIGE0ID0gYVs0XSwgYTUgPSBhWzVdLFxuICAgICAgICBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCk7XG4gICAgb3V0WzBdID0gYTAgKiAgYyArIGEyICogcztcbiAgICBvdXRbMV0gPSBhMSAqICBjICsgYTMgKiBzO1xuICAgIG91dFsyXSA9IGEwICogLXMgKyBhMiAqIGM7XG4gICAgb3V0WzNdID0gYTEgKiAtcyArIGEzICogYztcbiAgICBvdXRbNF0gPSBhNDtcbiAgICBvdXRbNV0gPSBhNTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDJkIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqKi9cbm1hdDJkLnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSwgYTQgPSBhWzRdLCBhNSA9IGFbNV0sXG4gICAgICAgIHYwID0gdlswXSwgdjEgPSB2WzFdO1xuICAgIG91dFswXSA9IGEwICogdjA7XG4gICAgb3V0WzFdID0gYTEgKiB2MDtcbiAgICBvdXRbMl0gPSBhMiAqIHYxO1xuICAgIG91dFszXSA9IGEzICogdjE7XG4gICAgb3V0WzRdID0gYTQ7XG4gICAgb3V0WzVdID0gYTU7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNsYXRlcyB0aGUgbWF0MmQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byB0cmFuc2xhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqKi9cbm1hdDJkLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sIGE0ID0gYVs0XSwgYTUgPSBhWzVdLFxuICAgICAgICB2MCA9IHZbMF0sIHYxID0gdlsxXTtcbiAgICBvdXRbMF0gPSBhMDtcbiAgICBvdXRbMV0gPSBhMTtcbiAgICBvdXRbMl0gPSBhMjtcbiAgICBvdXRbM10gPSBhMztcbiAgICBvdXRbNF0gPSBhMCAqIHYwICsgYTIgKiB2MSArIGE0O1xuICAgIG91dFs1XSA9IGExICogdjAgKyBhMyAqIHYxICsgYTU7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHttYXQyZH0gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxuICovXG5tYXQyZC5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAnbWF0MmQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIFxuICAgICAgICAgICAgICAgICAgICBhWzNdICsgJywgJyArIGFbNF0gKyAnLCAnICsgYVs1XSArICcpJztcbn07XG5cbi8qKlxuICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxuICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cbiAqL1xubWF0MmQuZnJvYiA9IGZ1bmN0aW9uIChhKSB7IFxuICAgIHJldHVybihNYXRoLnNxcnQoTWF0aC5wb3coYVswXSwgMikgKyBNYXRoLnBvdyhhWzFdLCAyKSArIE1hdGgucG93KGFbMl0sIDIpICsgTWF0aC5wb3coYVszXSwgMikgKyBNYXRoLnBvdyhhWzRdLCAyKSArIE1hdGgucG93KGFbNV0sIDIpICsgMSkpXG59OyBcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMubWF0MmQgPSBtYXQyZDtcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDN4MyBNYXRyaXhcbiAqIEBuYW1lIG1hdDNcbiAqL1xuXG52YXIgbWF0MyA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0M1xuICpcbiAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XG4gKi9cbm1hdDMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDkpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMTtcbiAgICBvdXRbNV0gPSAwO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcGllcyB0aGUgdXBwZXItbGVmdCAzeDMgdmFsdWVzIGludG8gdGhlIGdpdmVuIG1hdDMuXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyAzeDMgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgICB0aGUgc291cmNlIDR4NCBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5mcm9tTWF0NCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbNF07XG4gICAgb3V0WzRdID0gYVs1XTtcbiAgICBvdXRbNV0gPSBhWzZdO1xuICAgIG91dFs2XSA9IGFbOF07XG4gICAgb3V0WzddID0gYVs5XTtcbiAgICBvdXRbOF0gPSBhWzEwXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDMgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgbWF0cml4IHRvIGNsb25lXG4gKiBAcmV0dXJucyB7bWF0M30gYSBuZXcgM3gzIG1hdHJpeFxuICovXG5tYXQzLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg5KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLmNvcHkgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgYSBtYXQzIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAxO1xuICAgIG91dFs1XSA9IDA7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLnRyYW5zcG9zZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgICBpZiAob3V0ID09PSBhKSB7XG4gICAgICAgIHZhciBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMTIgPSBhWzVdO1xuICAgICAgICBvdXRbMV0gPSBhWzNdO1xuICAgICAgICBvdXRbMl0gPSBhWzZdO1xuICAgICAgICBvdXRbM10gPSBhMDE7XG4gICAgICAgIG91dFs1XSA9IGFbN107XG4gICAgICAgIG91dFs2XSA9IGEwMjtcbiAgICAgICAgb3V0WzddID0gYTEyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFswXSA9IGFbMF07XG4gICAgICAgIG91dFsxXSA9IGFbM107XG4gICAgICAgIG91dFsyXSA9IGFbNl07XG4gICAgICAgIG91dFszXSA9IGFbMV07XG4gICAgICAgIG91dFs0XSA9IGFbNF07XG4gICAgICAgIG91dFs1XSA9IGFbN107XG4gICAgICAgIG91dFs2XSA9IGFbMl07XG4gICAgICAgIG91dFs3XSA9IGFbNV07XG4gICAgICAgIG91dFs4XSA9IGFbOF07XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEludmVydHMgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLmludmVydCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuXG4gICAgICAgIGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMSxcbiAgICAgICAgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMCxcbiAgICAgICAgYjIxID0gYTIxICogYTEwIC0gYTExICogYTIwLFxuXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICAgICAgZGV0ID0gYTAwICogYjAxICsgYTAxICogYjExICsgYTAyICogYjIxO1xuXG4gICAgaWYgKCFkZXQpIHsgXG4gICAgICAgIHJldHVybiBudWxsOyBcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gYjAxICogZGV0O1xuICAgIG91dFsxXSA9ICgtYTIyICogYTAxICsgYTAyICogYTIxKSAqIGRldDtcbiAgICBvdXRbMl0gPSAoYTEyICogYTAxIC0gYTAyICogYTExKSAqIGRldDtcbiAgICBvdXRbM10gPSBiMTEgKiBkZXQ7XG4gICAgb3V0WzRdID0gKGEyMiAqIGEwMCAtIGEwMiAqIGEyMCkgKiBkZXQ7XG4gICAgb3V0WzVdID0gKC1hMTIgKiBhMDAgKyBhMDIgKiBhMTApICogZGV0O1xuICAgIG91dFs2XSA9IGIyMSAqIGRldDtcbiAgICBvdXRbN10gPSAoLWEyMSAqIGEwMCArIGEwMSAqIGEyMCkgKiBkZXQ7XG4gICAgb3V0WzhdID0gKGExMSAqIGEwMCAtIGEwMSAqIGExMCkgKiBkZXQ7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLmFkam9pbnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XTtcblxuICAgIG91dFswXSA9IChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpO1xuICAgIG91dFsxXSA9IChhMDIgKiBhMjEgLSBhMDEgKiBhMjIpO1xuICAgIG91dFsyXSA9IChhMDEgKiBhMTIgLSBhMDIgKiBhMTEpO1xuICAgIG91dFszXSA9IChhMTIgKiBhMjAgLSBhMTAgKiBhMjIpO1xuICAgIG91dFs0XSA9IChhMDAgKiBhMjIgLSBhMDIgKiBhMjApO1xuICAgIG91dFs1XSA9IChhMDIgKiBhMTAgLSBhMDAgKiBhMTIpO1xuICAgIG91dFs2XSA9IChhMTAgKiBhMjEgLSBhMTEgKiBhMjApO1xuICAgIG91dFs3XSA9IChhMDEgKiBhMjAgLSBhMDAgKiBhMjEpO1xuICAgIG91dFs4XSA9IChhMDAgKiBhMTEgLSBhMDEgKiBhMTApO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxuICovXG5tYXQzLmRldGVybWluYW50ID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XTtcblxuICAgIHJldHVybiBhMDAgKiAoYTIyICogYTExIC0gYTEyICogYTIxKSArIGEwMSAqICgtYTIyICogYTEwICsgYTEyICogYTIwKSArIGEwMiAqIChhMjEgKiBhMTAgLSBhMTEgKiBhMjApO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQzJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMubXVsdGlwbHkgPSBmdW5jdGlvbiAob3V0LCBhLCBiKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXG5cbiAgICAgICAgYjAwID0gYlswXSwgYjAxID0gYlsxXSwgYjAyID0gYlsyXSxcbiAgICAgICAgYjEwID0gYlszXSwgYjExID0gYls0XSwgYjEyID0gYls1XSxcbiAgICAgICAgYjIwID0gYls2XSwgYjIxID0gYls3XSwgYjIyID0gYls4XTtcblxuICAgIG91dFswXSA9IGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMDtcbiAgICBvdXRbMV0gPSBiMDAgKiBhMDEgKyBiMDEgKiBhMTEgKyBiMDIgKiBhMjE7XG4gICAgb3V0WzJdID0gYjAwICogYTAyICsgYjAxICogYTEyICsgYjAyICogYTIyO1xuXG4gICAgb3V0WzNdID0gYjEwICogYTAwICsgYjExICogYTEwICsgYjEyICogYTIwO1xuICAgIG91dFs0XSA9IGIxMCAqIGEwMSArIGIxMSAqIGExMSArIGIxMiAqIGEyMTtcbiAgICBvdXRbNV0gPSBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjI7XG5cbiAgICBvdXRbNl0gPSBiMjAgKiBhMDAgKyBiMjEgKiBhMTAgKyBiMjIgKiBhMjA7XG4gICAgb3V0WzddID0gYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxO1xuICAgIG91dFs4XSA9IGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDMubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xubWF0My5tdWwgPSBtYXQzLm11bHRpcGx5O1xuXG4vKipcbiAqIFRyYW5zbGF0ZSBhIG1hdDMgYnkgdGhlIGdpdmVuIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMudHJhbnNsYXRlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXG4gICAgICAgIHggPSB2WzBdLCB5ID0gdlsxXTtcblxuICAgIG91dFswXSA9IGEwMDtcbiAgICBvdXRbMV0gPSBhMDE7XG4gICAgb3V0WzJdID0gYTAyO1xuXG4gICAgb3V0WzNdID0gYTEwO1xuICAgIG91dFs0XSA9IGExMTtcbiAgICBvdXRbNV0gPSBhMTI7XG5cbiAgICBvdXRbNl0gPSB4ICogYTAwICsgeSAqIGExMCArIGEyMDtcbiAgICBvdXRbN10gPSB4ICogYTAxICsgeSAqIGExMSArIGEyMTtcbiAgICBvdXRbOF0gPSB4ICogYTAyICsgeSAqIGExMiArIGEyMjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0MyBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLnJvdGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuXG4gICAgICAgIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGMgKiBhMDAgKyBzICogYTEwO1xuICAgIG91dFsxXSA9IGMgKiBhMDEgKyBzICogYTExO1xuICAgIG91dFsyXSA9IGMgKiBhMDIgKyBzICogYTEyO1xuXG4gICAgb3V0WzNdID0gYyAqIGExMCAtIHMgKiBhMDA7XG4gICAgb3V0WzRdID0gYyAqIGExMSAtIHMgKiBhMDE7XG4gICAgb3V0WzVdID0gYyAqIGExMiAtIHMgKiBhMDI7XG5cbiAgICBvdXRbNl0gPSBhMjA7XG4gICAgb3V0WzddID0gYTIxO1xuICAgIG91dFs4XSA9IGEyMjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDMgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICoqL1xubWF0My5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciB4ID0gdlswXSwgeSA9IHZbMV07XG5cbiAgICBvdXRbMF0gPSB4ICogYVswXTtcbiAgICBvdXRbMV0gPSB4ICogYVsxXTtcbiAgICBvdXRbMl0gPSB4ICogYVsyXTtcblxuICAgIG91dFszXSA9IHkgKiBhWzNdO1xuICAgIG91dFs0XSA9IHkgKiBhWzRdO1xuICAgIG91dFs1XSA9IHkgKiBhWzVdO1xuXG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29waWVzIHRoZSB2YWx1ZXMgZnJvbSBhIG1hdDJkIGludG8gYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byBjb3B5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5tYXQzLmZyb21NYXQyZCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSAwO1xuXG4gICAgb3V0WzNdID0gYVsyXTtcbiAgICBvdXRbNF0gPSBhWzNdO1xuICAgIG91dFs1XSA9IDA7XG5cbiAgICBvdXRbNl0gPSBhWzRdO1xuICAgIG91dFs3XSA9IGFbNV07XG4gICAgb3V0WzhdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4qIENhbGN1bGF0ZXMgYSAzeDMgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbipcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbipcbiogQHJldHVybnMge21hdDN9IG91dFxuKi9cbm1hdDMuZnJvbVF1YXQgPSBmdW5jdGlvbiAob3V0LCBxKSB7XG4gICAgdmFyIHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdLFxuICAgICAgICB4MiA9IHggKyB4LFxuICAgICAgICB5MiA9IHkgKyB5LFxuICAgICAgICB6MiA9IHogKyB6LFxuXG4gICAgICAgIHh4ID0geCAqIHgyLFxuICAgICAgICB5eCA9IHkgKiB4MixcbiAgICAgICAgeXkgPSB5ICogeTIsXG4gICAgICAgIHp4ID0geiAqIHgyLFxuICAgICAgICB6eSA9IHogKiB5MixcbiAgICAgICAgenogPSB6ICogejIsXG4gICAgICAgIHd4ID0gdyAqIHgyLFxuICAgICAgICB3eSA9IHcgKiB5MixcbiAgICAgICAgd3ogPSB3ICogejI7XG5cbiAgICBvdXRbMF0gPSAxIC0geXkgLSB6ejtcbiAgICBvdXRbM10gPSB5eCAtIHd6O1xuICAgIG91dFs2XSA9IHp4ICsgd3k7XG5cbiAgICBvdXRbMV0gPSB5eCArIHd6O1xuICAgIG91dFs0XSA9IDEgLSB4eCAtIHp6O1xuICAgIG91dFs3XSA9IHp5IC0gd3g7XG5cbiAgICBvdXRbMl0gPSB6eCAtIHd5O1xuICAgIG91dFs1XSA9IHp5ICsgd3g7XG4gICAgb3V0WzhdID0gMSAtIHh4IC0geXk7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4qIENhbGN1bGF0ZXMgYSAzeDMgbm9ybWFsIG1hdHJpeCAodHJhbnNwb3NlIGludmVyc2UpIGZyb20gdGhlIDR4NCBtYXRyaXhcbipcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuKiBAcGFyYW0ge21hdDR9IGEgTWF0NCB0byBkZXJpdmUgdGhlIG5vcm1hbCBtYXRyaXggZnJvbVxuKlxuKiBAcmV0dXJucyB7bWF0M30gb3V0XG4qL1xubWF0My5ub3JtYWxGcm9tTWF0NCA9IGZ1bmN0aW9uIChvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XSxcblxuICAgICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsXG4gICAgICAgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxuICAgICAgICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG4gICAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSxcbiAgICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsXG4gICAgICAgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxuICAgICAgICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG4gICAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSxcbiAgICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyLFxuXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICAgICAgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gICAgaWYgKCFkZXQpIHsgXG4gICAgICAgIHJldHVybiBudWxsOyBcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzFdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG5cbiAgICBvdXRbM10gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcbiAgICBvdXRbNV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcblxuICAgIG91dFs2XSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICAgIG91dFs3XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICAgIG91dFs4XSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG1hdCBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxuICovXG5tYXQzLnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICdtYXQzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVszXSArICcsICcgKyBhWzRdICsgJywgJyArIGFbNV0gKyAnLCAnICsgXG4gICAgICAgICAgICAgICAgICAgIGFbNl0gKyAnLCAnICsgYVs3XSArICcsICcgKyBhWzhdICsgJyknO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxuICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cbiAqL1xubWF0My5mcm9iID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4oTWF0aC5zcXJ0KE1hdGgucG93KGFbMF0sIDIpICsgTWF0aC5wb3coYVsxXSwgMikgKyBNYXRoLnBvdyhhWzJdLCAyKSArIE1hdGgucG93KGFbM10sIDIpICsgTWF0aC5wb3coYVs0XSwgMikgKyBNYXRoLnBvdyhhWzVdLCAyKSArIE1hdGgucG93KGFbNl0sIDIpICsgTWF0aC5wb3coYVs3XSwgMikgKyBNYXRoLnBvdyhhWzhdLCAyKSkpXG59O1xuXG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLm1hdDMgPSBtYXQzO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgNHg0IE1hdHJpeFxuICogQG5hbWUgbWF0NFxuICovXG5cbnZhciBtYXQ0ID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQ0XG4gKlxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xubWF0NC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMTYpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAxO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDE7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQ0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xubWF0NC5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMTYpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIG91dFs5XSA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgb3V0WzldID0gYVs5XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgYSBtYXQ0IHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDE7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMTtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQudHJhbnNwb3NlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICAgIGlmIChvdXQgPT09IGEpIHtcbiAgICAgICAgdmFyIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgICAgICBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGEwMTtcbiAgICAgICAgb3V0WzZdID0gYVs5XTtcbiAgICAgICAgb3V0WzddID0gYVsxM107XG4gICAgICAgIG91dFs4XSA9IGEwMjtcbiAgICAgICAgb3V0WzldID0gYTEyO1xuICAgICAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgICAgIG91dFsxMl0gPSBhMDM7XG4gICAgICAgIG91dFsxM10gPSBhMTM7XG4gICAgICAgIG91dFsxNF0gPSBhMjM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3V0WzBdID0gYVswXTtcbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGFbMV07XG4gICAgICAgIG91dFs1XSA9IGFbNV07XG4gICAgICAgIG91dFs2XSA9IGFbOV07XG4gICAgICAgIG91dFs3XSA9IGFbMTNdO1xuICAgICAgICBvdXRbOF0gPSBhWzJdO1xuICAgICAgICBvdXRbOV0gPSBhWzZdO1xuICAgICAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgICAgIG91dFsxMV0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzEyXSA9IGFbM107XG4gICAgICAgIG91dFsxM10gPSBhWzddO1xuICAgICAgICBvdXRbMTRdID0gYVsxMV07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbiAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV0sXG5cbiAgICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLFxuICAgICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCxcbiAgICAgICAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXG4gICAgICAgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLFxuICAgICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCxcbiAgICAgICAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXG4gICAgICAgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMixcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICghZGV0KSB7IFxuICAgICAgICByZXR1cm4gbnVsbDsgXG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICAgIG91dFsxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICAgIG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICAgIG91dFszXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0O1xuICAgIG91dFs0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xuICAgIG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICAgIG91dFs2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICAgIG91dFs3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0O1xuICAgIG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuICAgIG91dFs5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuICAgIG91dFsxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0O1xuICAgIG91dFsxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmFkam9pbnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICAgIG91dFswXSAgPSAgKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gICAgb3V0WzFdICA9IC0oYTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcbiAgICBvdXRbMl0gID0gIChhMDEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMSAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICAgIG91dFszXSAgPSAtKGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTExICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzRdICA9IC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEzMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpKTtcbiAgICBvdXRbNV0gID0gIChhMDAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikpO1xuICAgIG91dFs2XSAgPSAtKGEwMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTEwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzddICA9ICAoYTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgICBvdXRbOF0gID0gIChhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkpO1xuICAgIG91dFs5XSAgPSAtKGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSk7XG4gICAgb3V0WzEwXSA9ICAoYTAwICogKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMzIC0gYTAzICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcbiAgICBvdXRbMTFdID0gLShhMDAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjMgLSBhMDMgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSkpO1xuICAgIG91dFsxMl0gPSAtKGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSk7XG4gICAgb3V0WzEzXSA9ICAoYTAwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgLSBhMjAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpKTtcbiAgICBvdXRbMTRdID0gLShhMDAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSAtIGExMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICsgYTMwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSkpO1xuICAgIG91dFsxNV0gPSAgKGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDQuZGV0ZXJtaW5hbnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdLFxuXG4gICAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcbiAgICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXG4gICAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxuICAgICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcbiAgICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXG4gICAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxuICAgICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0NCdzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0Lm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gICAgLy8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XG4gICAgdmFyIGIwICA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107ICBcbiAgICBvdXRbMF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzFdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuICAgIG91dFsyXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgICBvdXRbM10gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgICBiMCA9IGJbNF07IGIxID0gYls1XTsgYjIgPSBiWzZdOyBiMyA9IGJbN107XG4gICAgb3V0WzRdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFs1XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbNl0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4gICAgb3V0WzddID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gICAgYjAgPSBiWzhdOyBiMSA9IGJbOV07IGIyID0gYlsxMF07IGIzID0gYlsxMV07XG4gICAgb3V0WzhdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFs5XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMTBdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFsxMV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgICBiMCA9IGJbMTJdOyBiMSA9IGJbMTNdOyBiMiA9IGJbMTRdOyBiMyA9IGJbMTVdO1xuICAgIG91dFsxMl0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzEzXSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMTRdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFsxNV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQ0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDQubXVsID0gbWF0NC5tdWx0aXBseTtcblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQ0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnRyYW5zbGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHYpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXSxcbiAgICAgICAgYTAwLCBhMDEsIGEwMiwgYTAzLFxuICAgICAgICBhMTAsIGExMSwgYTEyLCBhMTMsXG4gICAgICAgIGEyMCwgYTIxLCBhMjIsIGEyMztcblxuICAgIGlmIChhID09PSBvdXQpIHtcbiAgICAgICAgb3V0WzEyXSA9IGFbMF0gKiB4ICsgYVs0XSAqIHkgKyBhWzhdICogeiArIGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxXSAqIHggKyBhWzVdICogeSArIGFbOV0gKiB6ICsgYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzJdICogeCArIGFbNl0gKiB5ICsgYVsxMF0gKiB6ICsgYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzNdICogeCArIGFbN10gKiB5ICsgYVsxMV0gKiB6ICsgYVsxNV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgICAgICAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcbiAgICAgICAgYTIwID0gYVs4XTsgYTIxID0gYVs5XTsgYTIyID0gYVsxMF07IGEyMyA9IGFbMTFdO1xuXG4gICAgICAgIG91dFswXSA9IGEwMDsgb3V0WzFdID0gYTAxOyBvdXRbMl0gPSBhMDI7IG91dFszXSA9IGEwMztcbiAgICAgICAgb3V0WzRdID0gYTEwOyBvdXRbNV0gPSBhMTE7IG91dFs2XSA9IGExMjsgb3V0WzddID0gYTEzO1xuICAgICAgICBvdXRbOF0gPSBhMjA7IG91dFs5XSA9IGEyMTsgb3V0WzEwXSA9IGEyMjsgb3V0WzExXSA9IGEyMztcblxuICAgICAgICBvdXRbMTJdID0gYTAwICogeCArIGExMCAqIHkgKyBhMjAgKiB6ICsgYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhMDEgKiB4ICsgYTExICogeSArIGEyMSAqIHogKyBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGEwMiAqIHggKyBhMTIgKiB5ICsgYTIyICogeiArIGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYTAzICogeCArIGExMyAqIHkgKyBhMjMgKiB6ICsgYVsxNV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdGhlIHZlYzMgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICoqL1xubWF0NC5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciB4ID0gdlswXSwgeSA9IHZbMV0sIHogPSB2WzJdO1xuXG4gICAgb3V0WzBdID0gYVswXSAqIHg7XG4gICAgb3V0WzFdID0gYVsxXSAqIHg7XG4gICAgb3V0WzJdID0gYVsyXSAqIHg7XG4gICAgb3V0WzNdID0gYVszXSAqIHg7XG4gICAgb3V0WzRdID0gYVs0XSAqIHk7XG4gICAgb3V0WzVdID0gYVs1XSAqIHk7XG4gICAgb3V0WzZdID0gYVs2XSAqIHk7XG4gICAgb3V0WzddID0gYVs3XSAqIHk7XG4gICAgb3V0WzhdID0gYVs4XSAqIHo7XG4gICAgb3V0WzldID0gYVs5XSAqIHo7XG4gICAgb3V0WzEwXSA9IGFbMTBdICogejtcbiAgICBvdXRbMTFdID0gYVsxMV0gKiB6O1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0NCBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5yb3RhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQsIGF4aXMpIHtcbiAgICB2YXIgeCA9IGF4aXNbMF0sIHkgPSBheGlzWzFdLCB6ID0gYXhpc1syXSxcbiAgICAgICAgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeiksXG4gICAgICAgIHMsIGMsIHQsXG4gICAgICAgIGEwMCwgYTAxLCBhMDIsIGEwMyxcbiAgICAgICAgYTEwLCBhMTEsIGExMiwgYTEzLFxuICAgICAgICBhMjAsIGEyMSwgYTIyLCBhMjMsXG4gICAgICAgIGIwMCwgYjAxLCBiMDIsXG4gICAgICAgIGIxMCwgYjExLCBiMTIsXG4gICAgICAgIGIyMCwgYjIxLCBiMjI7XG5cbiAgICBpZiAoTWF0aC5hYnMobGVuKSA8IEdMTUFUX0VQU0lMT04pIHsgcmV0dXJuIG51bGw7IH1cbiAgICBcbiAgICBsZW4gPSAxIC8gbGVuO1xuICAgIHggKj0gbGVuO1xuICAgIHkgKj0gbGVuO1xuICAgIHogKj0gbGVuO1xuXG4gICAgcyA9IE1hdGguc2luKHJhZCk7XG4gICAgYyA9IE1hdGguY29zKHJhZCk7XG4gICAgdCA9IDEgLSBjO1xuXG4gICAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgICBhMTAgPSBhWzRdOyBhMTEgPSBhWzVdOyBhMTIgPSBhWzZdOyBhMTMgPSBhWzddO1xuICAgIGEyMCA9IGFbOF07IGEyMSA9IGFbOV07IGEyMiA9IGFbMTBdOyBhMjMgPSBhWzExXTtcblxuICAgIC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxuICAgIGIwMCA9IHggKiB4ICogdCArIGM7IGIwMSA9IHkgKiB4ICogdCArIHogKiBzOyBiMDIgPSB6ICogeCAqIHQgLSB5ICogcztcbiAgICBiMTAgPSB4ICogeSAqIHQgLSB6ICogczsgYjExID0geSAqIHkgKiB0ICsgYzsgYjEyID0geiAqIHkgKiB0ICsgeCAqIHM7XG4gICAgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7IGIyMSA9IHkgKiB6ICogdCAtIHggKiBzOyBiMjIgPSB6ICogeiAqIHQgKyBjO1xuXG4gICAgLy8gUGVyZm9ybSByb3RhdGlvbi1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgICBvdXRbMF0gPSBhMDAgKiBiMDAgKyBhMTAgKiBiMDEgKyBhMjAgKiBiMDI7XG4gICAgb3V0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyO1xuICAgIG91dFsyXSA9IGEwMiAqIGIwMCArIGExMiAqIGIwMSArIGEyMiAqIGIwMjtcbiAgICBvdXRbM10gPSBhMDMgKiBiMDAgKyBhMTMgKiBiMDEgKyBhMjMgKiBiMDI7XG4gICAgb3V0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyO1xuICAgIG91dFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMjtcbiAgICBvdXRbNl0gPSBhMDIgKiBiMTAgKyBhMTIgKiBiMTEgKyBhMjIgKiBiMTI7XG4gICAgb3V0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyO1xuICAgIG91dFs4XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMjtcbiAgICBvdXRbOV0gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjI7XG4gICAgb3V0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMjtcbiAgICBvdXRbMTFdID0gYTAzICogYjIwICsgYTEzICogYjIxICsgYTIzICogYjIyO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWCBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5yb3RhdGVYID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKSxcbiAgICAgICAgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXG4gICAgICAgIG91dFswXSAgPSBhWzBdO1xuICAgICAgICBvdXRbMV0gID0gYVsxXTtcbiAgICAgICAgb3V0WzJdICA9IGFbMl07XG4gICAgICAgIG91dFszXSAgPSBhWzNdO1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFs0XSA9IGExMCAqIGMgKyBhMjAgKiBzO1xuICAgIG91dFs1XSA9IGExMSAqIGMgKyBhMjEgKiBzO1xuICAgIG91dFs2XSA9IGExMiAqIGMgKyBhMjIgKiBzO1xuICAgIG91dFs3XSA9IGExMyAqIGMgKyBhMjMgKiBzO1xuICAgIG91dFs4XSA9IGEyMCAqIGMgLSBhMTAgKiBzO1xuICAgIG91dFs5XSA9IGEyMSAqIGMgLSBhMTEgKiBzO1xuICAgIG91dFsxMF0gPSBhMjIgKiBjIC0gYTEyICogcztcbiAgICBvdXRbMTFdID0gYTIzICogYyAtIGExMyAqIHM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnJvdGF0ZVkgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpLFxuICAgICAgICBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdLFxuICAgICAgICBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcbiAgICAgICAgb3V0WzRdICA9IGFbNF07XG4gICAgICAgIG91dFs1XSAgPSBhWzVdO1xuICAgICAgICBvdXRbNl0gID0gYVs2XTtcbiAgICAgICAgb3V0WzddICA9IGFbN107XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYyAtIGEyMCAqIHM7XG4gICAgb3V0WzFdID0gYTAxICogYyAtIGEyMSAqIHM7XG4gICAgb3V0WzJdID0gYTAyICogYyAtIGEyMiAqIHM7XG4gICAgb3V0WzNdID0gYTAzICogYyAtIGEyMyAqIHM7XG4gICAgb3V0WzhdID0gYTAwICogcyArIGEyMCAqIGM7XG4gICAgb3V0WzldID0gYTAxICogcyArIGEyMSAqIGM7XG4gICAgb3V0WzEwXSA9IGEwMiAqIHMgKyBhMjIgKiBjO1xuICAgIG91dFsxMV0gPSBhMDMgKiBzICsgYTIzICogYztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQucm90YXRlWiA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCksXG4gICAgICAgIGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sXG4gICAgICAgIGExMSA9IGFbNV0sXG4gICAgICAgIGExMiA9IGFbNl0sXG4gICAgICAgIGExMyA9IGFbN107XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgICAgIG91dFs4XSAgPSBhWzhdO1xuICAgICAgICBvdXRbOV0gID0gYVs5XTtcbiAgICAgICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgICAgICBvdXRbMTFdID0gYVsxMV07XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYyArIGExMCAqIHM7XG4gICAgb3V0WzFdID0gYTAxICogYyArIGExMSAqIHM7XG4gICAgb3V0WzJdID0gYTAyICogYyArIGExMiAqIHM7XG4gICAgb3V0WzNdID0gYTAzICogYyArIGExMyAqIHM7XG4gICAgb3V0WzRdID0gYTEwICogYyAtIGEwMCAqIHM7XG4gICAgb3V0WzVdID0gYTExICogYyAtIGEwMSAqIHM7XG4gICAgb3V0WzZdID0gYTEyICogYyAtIGEwMiAqIHM7XG4gICAgb3V0WzddID0gYTEzICogYyAtIGEwMyAqIHM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiBhbmQgdmVjdG9yIHRyYW5zbGF0aW9uXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xuICogICAgIHZhciBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5mcm9tUm90YXRpb25UcmFuc2xhdGlvbiA9IGZ1bmN0aW9uIChvdXQsIHEsIHYpIHtcbiAgICAvLyBRdWF0ZXJuaW9uIG1hdGhcbiAgICB2YXIgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM10sXG4gICAgICAgIHgyID0geCArIHgsXG4gICAgICAgIHkyID0geSArIHksXG4gICAgICAgIHoyID0geiArIHosXG5cbiAgICAgICAgeHggPSB4ICogeDIsXG4gICAgICAgIHh5ID0geCAqIHkyLFxuICAgICAgICB4eiA9IHggKiB6MixcbiAgICAgICAgeXkgPSB5ICogeTIsXG4gICAgICAgIHl6ID0geSAqIHoyLFxuICAgICAgICB6eiA9IHogKiB6MixcbiAgICAgICAgd3ggPSB3ICogeDIsXG4gICAgICAgIHd5ID0gdyAqIHkyLFxuICAgICAgICB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSAoeXkgKyB6eik7XG4gICAgb3V0WzFdID0geHkgKyB3ejtcbiAgICBvdXRbMl0gPSB4eiAtIHd5O1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0geHkgLSB3ejtcbiAgICBvdXRbNV0gPSAxIC0gKHh4ICsgenopO1xuICAgIG91dFs2XSA9IHl6ICsgd3g7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSB4eiArIHd5O1xuICAgIG91dFs5XSA9IHl6IC0gd3g7XG4gICAgb3V0WzEwXSA9IDEgLSAoeHggKyB5eSk7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IHZbMF07XG4gICAgb3V0WzEzXSA9IHZbMV07XG4gICAgb3V0WzE0XSA9IHZbMl07XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbm1hdDQuZnJvbVF1YXQgPSBmdW5jdGlvbiAob3V0LCBxKSB7XG4gICAgdmFyIHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdLFxuICAgICAgICB4MiA9IHggKyB4LFxuICAgICAgICB5MiA9IHkgKyB5LFxuICAgICAgICB6MiA9IHogKyB6LFxuXG4gICAgICAgIHh4ID0geCAqIHgyLFxuICAgICAgICB5eCA9IHkgKiB4MixcbiAgICAgICAgeXkgPSB5ICogeTIsXG4gICAgICAgIHp4ID0geiAqIHgyLFxuICAgICAgICB6eSA9IHogKiB5MixcbiAgICAgICAgenogPSB6ICogejIsXG4gICAgICAgIHd4ID0gdyAqIHgyLFxuICAgICAgICB3eSA9IHcgKiB5MixcbiAgICAgICAgd3ogPSB3ICogejI7XG5cbiAgICBvdXRbMF0gPSAxIC0geXkgLSB6ejtcbiAgICBvdXRbMV0gPSB5eCArIHd6O1xuICAgIG91dFsyXSA9IHp4IC0gd3k7XG4gICAgb3V0WzNdID0gMDtcblxuICAgIG91dFs0XSA9IHl4IC0gd3o7XG4gICAgb3V0WzVdID0gMSAtIHh4IC0geno7XG4gICAgb3V0WzZdID0genkgKyB3eDtcbiAgICBvdXRbN10gPSAwO1xuXG4gICAgb3V0WzhdID0genggKyB3eTtcbiAgICBvdXRbOV0gPSB6eSAtIHd4O1xuICAgIG91dFsxMF0gPSAxIC0geHggLSB5eTtcbiAgICBvdXRbMTFdID0gMDtcblxuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAwO1xuICAgIG91dFsxNV0gPSAxO1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgZnJ1c3R1bSBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtOdW1iZXJ9IGxlZnQgTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gYm90dG9tIEJvdHRvbSBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IHRvcCBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQuZnJ1c3R1bSA9IGZ1bmN0aW9uIChvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XG4gICAgdmFyIHJsID0gMSAvIChyaWdodCAtIGxlZnQpLFxuICAgICAgICB0YiA9IDEgLyAodG9wIC0gYm90dG9tKSxcbiAgICAgICAgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFswXSA9IChuZWFyICogMikgKiBybDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IChuZWFyICogMikgKiB0YjtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gKHJpZ2h0ICsgbGVmdCkgKiBybDtcbiAgICBvdXRbOV0gPSAodG9wICsgYm90dG9tKSAqIHRiO1xuICAgIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTFdID0gLTE7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IChmYXIgKiBuZWFyICogMikgKiBuZjtcbiAgICBvdXRbMTVdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gZm92eSBWZXJ0aWNhbCBmaWVsZCBvZiB2aWV3IGluIHJhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBhc3BlY3QgQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnBlcnNwZWN0aXZlID0gZnVuY3Rpb24gKG91dCwgZm92eSwgYXNwZWN0LCBuZWFyLCBmYXIpIHtcbiAgICB2YXIgZiA9IDEuMCAvIE1hdGgudGFuKGZvdnkgLyAyKSxcbiAgICAgICAgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFswXSA9IGYgLyBhc3BlY3Q7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSBmO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgIG91dFsxMV0gPSAtMTtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gKDIgKiBmYXIgKiBuZWFyKSAqIG5mO1xuICAgIG91dFsxNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIG9ydGhvZ29uYWwgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gYm90dG9tIEJvdHRvbSBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IHRvcCBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQub3J0aG8gPSBmdW5jdGlvbiAob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICAgIHZhciBsciA9IDEgLyAobGVmdCAtIHJpZ2h0KSxcbiAgICAgICAgYnQgPSAxIC8gKGJvdHRvbSAtIHRvcCksXG4gICAgICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSAtMiAqIGxyO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gLTIgKiBidDtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAyICogbmY7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IChsZWZ0ICsgcmlnaHQpICogbHI7XG4gICAgb3V0WzEzXSA9ICh0b3AgKyBib3R0b20pICogYnQ7XG4gICAgb3V0WzE0XSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgIG91dFsxNV0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGxvb2stYXQgbWF0cml4IHdpdGggdGhlIGdpdmVuIGV5ZSBwb3NpdGlvbiwgZm9jYWwgcG9pbnQsIGFuZCB1cCBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHt2ZWMzfSBleWUgUG9zaXRpb24gb2YgdGhlIHZpZXdlclxuICogQHBhcmFtIHt2ZWMzfSBjZW50ZXIgUG9pbnQgdGhlIHZpZXdlciBpcyBsb29raW5nIGF0XG4gKiBAcGFyYW0ge3ZlYzN9IHVwIHZlYzMgcG9pbnRpbmcgdXBcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5sb29rQXQgPSBmdW5jdGlvbiAob3V0LCBleWUsIGNlbnRlciwgdXApIHtcbiAgICB2YXIgeDAsIHgxLCB4MiwgeTAsIHkxLCB5MiwgejAsIHoxLCB6MiwgbGVuLFxuICAgICAgICBleWV4ID0gZXllWzBdLFxuICAgICAgICBleWV5ID0gZXllWzFdLFxuICAgICAgICBleWV6ID0gZXllWzJdLFxuICAgICAgICB1cHggPSB1cFswXSxcbiAgICAgICAgdXB5ID0gdXBbMV0sXG4gICAgICAgIHVweiA9IHVwWzJdLFxuICAgICAgICBjZW50ZXJ4ID0gY2VudGVyWzBdLFxuICAgICAgICBjZW50ZXJ5ID0gY2VudGVyWzFdLFxuICAgICAgICBjZW50ZXJ6ID0gY2VudGVyWzJdO1xuXG4gICAgaWYgKE1hdGguYWJzKGV5ZXggLSBjZW50ZXJ4KSA8IEdMTUFUX0VQU0lMT04gJiZcbiAgICAgICAgTWF0aC5hYnMoZXlleSAtIGNlbnRlcnkpIDwgR0xNQVRfRVBTSUxPTiAmJlxuICAgICAgICBNYXRoLmFicyhleWV6IC0gY2VudGVyeikgPCBHTE1BVF9FUFNJTE9OKSB7XG4gICAgICAgIHJldHVybiBtYXQ0LmlkZW50aXR5KG91dCk7XG4gICAgfVxuXG4gICAgejAgPSBleWV4IC0gY2VudGVyeDtcbiAgICB6MSA9IGV5ZXkgLSBjZW50ZXJ5O1xuICAgIHoyID0gZXlleiAtIGNlbnRlcno7XG5cbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KHowICogejAgKyB6MSAqIHoxICsgejIgKiB6Mik7XG4gICAgejAgKj0gbGVuO1xuICAgIHoxICo9IGxlbjtcbiAgICB6MiAqPSBsZW47XG5cbiAgICB4MCA9IHVweSAqIHoyIC0gdXB6ICogejE7XG4gICAgeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyO1xuICAgIHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcbiAgICBsZW4gPSBNYXRoLnNxcnQoeDAgKiB4MCArIHgxICogeDEgKyB4MiAqIHgyKTtcbiAgICBpZiAoIWxlbikge1xuICAgICAgICB4MCA9IDA7XG4gICAgICAgIHgxID0gMDtcbiAgICAgICAgeDIgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxlbiA9IDEgLyBsZW47XG4gICAgICAgIHgwICo9IGxlbjtcbiAgICAgICAgeDEgKj0gbGVuO1xuICAgICAgICB4MiAqPSBsZW47XG4gICAgfVxuXG4gICAgeTAgPSB6MSAqIHgyIC0gejIgKiB4MTtcbiAgICB5MSA9IHoyICogeDAgLSB6MCAqIHgyO1xuICAgIHkyID0gejAgKiB4MSAtIHoxICogeDA7XG5cbiAgICBsZW4gPSBNYXRoLnNxcnQoeTAgKiB5MCArIHkxICogeTEgKyB5MiAqIHkyKTtcbiAgICBpZiAoIWxlbikge1xuICAgICAgICB5MCA9IDA7XG4gICAgICAgIHkxID0gMDtcbiAgICAgICAgeTIgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxlbiA9IDEgLyBsZW47XG4gICAgICAgIHkwICo9IGxlbjtcbiAgICAgICAgeTEgKj0gbGVuO1xuICAgICAgICB5MiAqPSBsZW47XG4gICAgfVxuXG4gICAgb3V0WzBdID0geDA7XG4gICAgb3V0WzFdID0geTA7XG4gICAgb3V0WzJdID0gejA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSB4MTtcbiAgICBvdXRbNV0gPSB5MTtcbiAgICBvdXRbNl0gPSB6MTtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IHgyO1xuICAgIG91dFs5XSA9IHkyO1xuICAgIG91dFsxMF0gPSB6MjtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gLSh4MCAqIGV5ZXggKyB4MSAqIGV5ZXkgKyB4MiAqIGV5ZXopO1xuICAgIG91dFsxM10gPSAtKHkwICogZXlleCArIHkxICogZXlleSArIHkyICogZXlleik7XG4gICAgb3V0WzE0XSA9IC0oejAgKiBleWV4ICsgejEgKiBleWV5ICsgejIgKiBleWV6KTtcbiAgICBvdXRbMTVdID0gMTtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBtYXQgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xubWF0NC5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAnbWF0NCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcsICcgK1xuICAgICAgICAgICAgICAgICAgICBhWzRdICsgJywgJyArIGFbNV0gKyAnLCAnICsgYVs2XSArICcsICcgKyBhWzddICsgJywgJyArXG4gICAgICAgICAgICAgICAgICAgIGFbOF0gKyAnLCAnICsgYVs5XSArICcsICcgKyBhWzEwXSArICcsICcgKyBhWzExXSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVsxMl0gKyAnLCAnICsgYVsxM10gKyAnLCAnICsgYVsxNF0gKyAnLCAnICsgYVsxNV0gKyAnKSc7XG59O1xuXG4vKipcbiAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxuICovXG5tYXQ0LmZyb2IgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybihNYXRoLnNxcnQoTWF0aC5wb3coYVswXSwgMikgKyBNYXRoLnBvdyhhWzFdLCAyKSArIE1hdGgucG93KGFbMl0sIDIpICsgTWF0aC5wb3coYVszXSwgMikgKyBNYXRoLnBvdyhhWzRdLCAyKSArIE1hdGgucG93KGFbNV0sIDIpICsgTWF0aC5wb3coYVs2XSwgMikgKyBNYXRoLnBvdyhhWzZdLCAyKSArIE1hdGgucG93KGFbN10sIDIpICsgTWF0aC5wb3coYVs4XSwgMikgKyBNYXRoLnBvdyhhWzldLCAyKSArIE1hdGgucG93KGFbMTBdLCAyKSArIE1hdGgucG93KGFbMTFdLCAyKSArIE1hdGgucG93KGFbMTJdLCAyKSArIE1hdGgucG93KGFbMTNdLCAyKSArIE1hdGgucG93KGFbMTRdLCAyKSArIE1hdGgucG93KGFbMTVdLCAyKSApKVxufTtcblxuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQ0ID0gbWF0NDtcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIFF1YXRlcm5pb25cbiAqIEBuYW1lIHF1YXRcbiAqL1xuXG52YXIgcXVhdCA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgcXVhdFxuICpcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKi9cbnF1YXQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0cyBhIHF1YXRlcm5pb24gdG8gcmVwcmVzZW50IHRoZSBzaG9ydGVzdCByb3RhdGlvbiBmcm9tIG9uZVxuICogdmVjdG9yIHRvIGFub3RoZXIuXG4gKlxuICogQm90aCB2ZWN0b3JzIGFyZSBhc3N1bWVkIHRvIGJlIHVuaXQgbGVuZ3RoLlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgaW5pdGlhbCB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgZGVzdGluYXRpb24gdmVjdG9yXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQucm90YXRpb25UbyA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgdG1wdmVjMyA9IHZlYzMuY3JlYXRlKCk7XG4gICAgdmFyIHhVbml0VmVjMyA9IHZlYzMuZnJvbVZhbHVlcygxLDAsMCk7XG4gICAgdmFyIHlVbml0VmVjMyA9IHZlYzMuZnJvbVZhbHVlcygwLDEsMCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgICAgIHZhciBkb3QgPSB2ZWMzLmRvdChhLCBiKTtcbiAgICAgICAgaWYgKGRvdCA8IC0wLjk5OTk5OSkge1xuICAgICAgICAgICAgdmVjMy5jcm9zcyh0bXB2ZWMzLCB4VW5pdFZlYzMsIGEpO1xuICAgICAgICAgICAgaWYgKHZlYzMubGVuZ3RoKHRtcHZlYzMpIDwgMC4wMDAwMDEpXG4gICAgICAgICAgICAgICAgdmVjMy5jcm9zcyh0bXB2ZWMzLCB5VW5pdFZlYzMsIGEpO1xuICAgICAgICAgICAgdmVjMy5ub3JtYWxpemUodG1wdmVjMywgdG1wdmVjMyk7XG4gICAgICAgICAgICBxdWF0LnNldEF4aXNBbmdsZShvdXQsIHRtcHZlYzMsIE1hdGguUEkpO1xuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfSBlbHNlIGlmIChkb3QgPiAwLjk5OTk5OSkge1xuICAgICAgICAgICAgb3V0WzBdID0gMDtcbiAgICAgICAgICAgIG91dFsxXSA9IDA7XG4gICAgICAgICAgICBvdXRbMl0gPSAwO1xuICAgICAgICAgICAgb3V0WzNdID0gMTtcbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2ZWMzLmNyb3NzKHRtcHZlYzMsIGEsIGIpO1xuICAgICAgICAgICAgb3V0WzBdID0gdG1wdmVjM1swXTtcbiAgICAgICAgICAgIG91dFsxXSA9IHRtcHZlYzNbMV07XG4gICAgICAgICAgICBvdXRbMl0gPSB0bXB2ZWMzWzJdO1xuICAgICAgICAgICAgb3V0WzNdID0gMSArIGRvdDtcbiAgICAgICAgICAgIHJldHVybiBxdWF0Lm5vcm1hbGl6ZShvdXQsIG91dCk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBzcGVjaWZpZWQgcXVhdGVybmlvbiB3aXRoIHZhbHVlcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlblxuICogYXhlcy4gRWFjaCBheGlzIGlzIGEgdmVjMyBhbmQgaXMgZXhwZWN0ZWQgdG8gYmUgdW5pdCBsZW5ndGggYW5kXG4gKiBwZXJwZW5kaWN1bGFyIHRvIGFsbCBvdGhlciBzcGVjaWZpZWQgYXhlcy5cbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IHZpZXcgIHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSB2aWV3aW5nIGRpcmVjdGlvblxuICogQHBhcmFtIHt2ZWMzfSByaWdodCB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJyaWdodFwiIGRpcmVjdGlvblxuICogQHBhcmFtIHt2ZWMzfSB1cCAgICB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJ1cFwiIGRpcmVjdGlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnNldEF4ZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1hdHIgPSBtYXQzLmNyZWF0ZSgpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG91dCwgdmlldywgcmlnaHQsIHVwKSB7XG4gICAgICAgIG1hdHJbMF0gPSByaWdodFswXTtcbiAgICAgICAgbWF0clszXSA9IHJpZ2h0WzFdO1xuICAgICAgICBtYXRyWzZdID0gcmlnaHRbMl07XG5cbiAgICAgICAgbWF0clsxXSA9IHVwWzBdO1xuICAgICAgICBtYXRyWzRdID0gdXBbMV07XG4gICAgICAgIG1hdHJbN10gPSB1cFsyXTtcblxuICAgICAgICBtYXRyWzJdID0gLXZpZXdbMF07XG4gICAgICAgIG1hdHJbNV0gPSAtdmlld1sxXTtcbiAgICAgICAgbWF0cls4XSA9IC12aWV3WzJdO1xuXG4gICAgICAgIHJldHVybiBxdWF0Lm5vcm1hbGl6ZShvdXQsIHF1YXQuZnJvbU1hdDMob3V0LCBtYXRyKSk7XG4gICAgfTtcbn0pKCk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBxdWF0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuY2xvbmUgPSB2ZWM0LmNsb25lO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmZyb21WYWx1ZXMgPSB2ZWM0LmZyb21WYWx1ZXM7XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHF1YXQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBzb3VyY2UgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuY29weSA9IHZlYzQuY29weTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBxdWF0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5zZXQgPSB2ZWM0LnNldDtcblxuLyoqXG4gKiBTZXQgYSBxdWF0IHRvIHRoZSBpZGVudGl0eSBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuaWRlbnRpdHkgPSBmdW5jdGlvbihvdXQpIHtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldHMgYSBxdWF0IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFuZCByb3RhdGlvbiBheGlzLFxuICogdGhlbiByZXR1cm5zIGl0LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIGFyb3VuZCB3aGljaCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIGluIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqKi9cbnF1YXQuc2V0QXhpc0FuZ2xlID0gZnVuY3Rpb24ob3V0LCBheGlzLCByYWQpIHtcbiAgICByYWQgPSByYWQgKiAwLjU7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpO1xuICAgIG91dFswXSA9IHMgKiBheGlzWzBdO1xuICAgIG91dFsxXSA9IHMgKiBheGlzWzFdO1xuICAgIG91dFsyXSA9IHMgKiBheGlzWzJdO1xuICAgIG91dFszXSA9IE1hdGguY29zKHJhZCk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmFkZCA9IHZlYzQuYWRkO1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQubXVsdGlwbHkgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICB2YXIgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdLFxuICAgICAgICBieCA9IGJbMF0sIGJ5ID0gYlsxXSwgYnogPSBiWzJdLCBidyA9IGJbM107XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5O1xuICAgIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYno7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieDtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0Lm11bCA9IHF1YXQubXVsdGlwbHk7XG5cbi8qKlxuICogU2NhbGVzIGEgcXVhdCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5zY2FsZSA9IHZlYzQuc2NhbGU7XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBYIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnJvdGF0ZVggPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICByYWQgKj0gMC41OyBcblxuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ4ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYng7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF6ICogYng7XG4gICAgb3V0WzJdID0gYXogKiBidyAtIGF5ICogYng7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYng7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnJvdGF0ZVkgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICByYWQgKj0gMC41OyBcblxuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ5ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnk7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF4ICogYnk7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF5ICogYnk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBaIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnJvdGF0ZVogPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICByYWQgKj0gMC41OyBcblxuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ6ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF5ICogYno7XG4gICAgb3V0WzFdID0gYXkgKiBidyAtIGF4ICogYno7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF3ICogYno7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF6ICogYno7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgVyBjb21wb25lbnQgb2YgYSBxdWF0IGZyb20gdGhlIFgsIFksIGFuZCBaIGNvbXBvbmVudHMuXG4gKiBBc3N1bWVzIHRoYXQgcXVhdGVybmlvbiBpcyAxIHVuaXQgaW4gbGVuZ3RoLlxuICogQW55IGV4aXN0aW5nIFcgY29tcG9uZW50IHdpbGwgYmUgaWdub3JlZC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBXIGNvbXBvbmVudCBvZlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LmNhbGN1bGF0ZVcgPSBmdW5jdGlvbiAob3V0LCBhKSB7XG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG5cbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSAtTWF0aC5zcXJ0KE1hdGguYWJzKDEuMCAtIHggKiB4IC0geSAqIHkgLSB6ICogeikpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmRvdCA9IHZlYzQuZG90O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmxlcnAgPSB2ZWM0LmxlcnA7XG5cbi8qKlxuICogUGVyZm9ybXMgYSBzcGhlcmljYWwgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuc2xlcnAgPSBmdW5jdGlvbiAob3V0LCBhLCBiLCB0KSB7XG4gICAgLy8gYmVuY2htYXJrczpcbiAgICAvLyAgICBodHRwOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXNsZXJwLWltcGxlbWVudGF0aW9uc1xuXG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXSxcbiAgICAgICAgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXSwgYncgPSBiWzNdO1xuXG4gICAgdmFyICAgICAgICBvbWVnYSwgY29zb20sIHNpbm9tLCBzY2FsZTAsIHNjYWxlMTtcblxuICAgIC8vIGNhbGMgY29zaW5lXG4gICAgY29zb20gPSBheCAqIGJ4ICsgYXkgKiBieSArIGF6ICogYnogKyBhdyAqIGJ3O1xuICAgIC8vIGFkanVzdCBzaWducyAoaWYgbmVjZXNzYXJ5KVxuICAgIGlmICggY29zb20gPCAwLjAgKSB7XG4gICAgICAgIGNvc29tID0gLWNvc29tO1xuICAgICAgICBieCA9IC0gYng7XG4gICAgICAgIGJ5ID0gLSBieTtcbiAgICAgICAgYnogPSAtIGJ6O1xuICAgICAgICBidyA9IC0gYnc7XG4gICAgfVxuICAgIC8vIGNhbGN1bGF0ZSBjb2VmZmljaWVudHNcbiAgICBpZiAoICgxLjAgLSBjb3NvbSkgPiAwLjAwMDAwMSApIHtcbiAgICAgICAgLy8gc3RhbmRhcmQgY2FzZSAoc2xlcnApXG4gICAgICAgIG9tZWdhICA9IE1hdGguYWNvcyhjb3NvbSk7XG4gICAgICAgIHNpbm9tICA9IE1hdGguc2luKG9tZWdhKTtcbiAgICAgICAgc2NhbGUwID0gTWF0aC5zaW4oKDEuMCAtIHQpICogb21lZ2EpIC8gc2lub207XG4gICAgICAgIHNjYWxlMSA9IE1hdGguc2luKHQgKiBvbWVnYSkgLyBzaW5vbTtcbiAgICB9IGVsc2UgeyAgICAgICAgXG4gICAgICAgIC8vIFwiZnJvbVwiIGFuZCBcInRvXCIgcXVhdGVybmlvbnMgYXJlIHZlcnkgY2xvc2UgXG4gICAgICAgIC8vICAuLi4gc28gd2UgY2FuIGRvIGEgbGluZWFyIGludGVycG9sYXRpb25cbiAgICAgICAgc2NhbGUwID0gMS4wIC0gdDtcbiAgICAgICAgc2NhbGUxID0gdDtcbiAgICB9XG4gICAgLy8gY2FsY3VsYXRlIGZpbmFsIHZhbHVlc1xuICAgIG91dFswXSA9IHNjYWxlMCAqIGF4ICsgc2NhbGUxICogYng7XG4gICAgb3V0WzFdID0gc2NhbGUwICogYXkgKyBzY2FsZTEgKiBieTtcbiAgICBvdXRbMl0gPSBzY2FsZTAgKiBheiArIHNjYWxlMSAqIGJ6O1xuICAgIG91dFszXSA9IHNjYWxlMCAqIGF3ICsgc2NhbGUxICogYnc7XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaW52ZXJzZSBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBpbnZlcnNlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSxcbiAgICAgICAgZG90ID0gYTAqYTAgKyBhMSphMSArIGEyKmEyICsgYTMqYTMsXG4gICAgICAgIGludkRvdCA9IGRvdCA/IDEuMC9kb3QgOiAwO1xuICAgIFxuICAgIC8vIFRPRE86IFdvdWxkIGJlIGZhc3RlciB0byByZXR1cm4gWzAsMCwwLDBdIGltbWVkaWF0ZWx5IGlmIGRvdCA9PSAwXG5cbiAgICBvdXRbMF0gPSAtYTAqaW52RG90O1xuICAgIG91dFsxXSA9IC1hMSppbnZEb3Q7XG4gICAgb3V0WzJdID0gLWEyKmludkRvdDtcbiAgICBvdXRbM10gPSBhMyppbnZEb3Q7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgY29uanVnYXRlIG9mIGEgcXVhdFxuICogSWYgdGhlIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0LmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5jb25qdWdhdGUgPSBmdW5jdGlvbiAob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubGVuZ3RoID0gdmVjNC5sZW5ndGg7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmxlbiA9IHF1YXQubGVuZ3RoO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5zcXVhcmVkTGVuZ3RoID0gdmVjNC5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc3FyTGVuID0gcXVhdC5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubm9ybWFsaXplID0gdmVjNC5ub3JtYWxpemU7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gM3gzIHJvdGF0aW9uIG1hdHJpeC5cbiAqXG4gKiBOT1RFOiBUaGUgcmVzdWx0YW50IHF1YXRlcm5pb24gaXMgbm90IG5vcm1hbGl6ZWQsIHNvIHlvdSBzaG91bGQgYmUgc3VyZVxuICogdG8gcmVub3JtYWxpemUgdGhlIHF1YXRlcm5pb24geW91cnNlbGYgd2hlcmUgbmVjZXNzYXJ5LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHttYXQzfSBtIHJvdGF0aW9uIG1hdHJpeFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuZnJvbU1hdDMgPSBmdW5jdGlvbihvdXQsIG0pIHtcbiAgICAvLyBBbGdvcml0aG0gaW4gS2VuIFNob2VtYWtlJ3MgYXJ0aWNsZSBpbiAxOTg3IFNJR0dSQVBIIGNvdXJzZSBub3Rlc1xuICAgIC8vIGFydGljbGUgXCJRdWF0ZXJuaW9uIENhbGN1bHVzIGFuZCBGYXN0IEFuaW1hdGlvblwiLlxuICAgIHZhciBmVHJhY2UgPSBtWzBdICsgbVs0XSArIG1bOF07XG4gICAgdmFyIGZSb290O1xuXG4gICAgaWYgKCBmVHJhY2UgPiAwLjAgKSB7XG4gICAgICAgIC8vIHx3fCA+IDEvMiwgbWF5IGFzIHdlbGwgY2hvb3NlIHcgPiAxLzJcbiAgICAgICAgZlJvb3QgPSBNYXRoLnNxcnQoZlRyYWNlICsgMS4wKTsgIC8vIDJ3XG4gICAgICAgIG91dFszXSA9IDAuNSAqIGZSb290O1xuICAgICAgICBmUm9vdCA9IDAuNS9mUm9vdDsgIC8vIDEvKDR3KVxuICAgICAgICBvdXRbMF0gPSAobVs3XS1tWzVdKSpmUm9vdDtcbiAgICAgICAgb3V0WzFdID0gKG1bMl0tbVs2XSkqZlJvb3Q7XG4gICAgICAgIG91dFsyXSA9IChtWzNdLW1bMV0pKmZSb290O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHx3fCA8PSAxLzJcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICBpZiAoIG1bNF0gPiBtWzBdIClcbiAgICAgICAgICBpID0gMTtcbiAgICAgICAgaWYgKCBtWzhdID4gbVtpKjMraV0gKVxuICAgICAgICAgIGkgPSAyO1xuICAgICAgICB2YXIgaiA9IChpKzEpJTM7XG4gICAgICAgIHZhciBrID0gKGkrMiklMztcbiAgICAgICAgXG4gICAgICAgIGZSb290ID0gTWF0aC5zcXJ0KG1baSozK2ldLW1baiozK2pdLW1bayozK2tdICsgMS4wKTtcbiAgICAgICAgb3V0W2ldID0gMC41ICogZlJvb3Q7XG4gICAgICAgIGZSb290ID0gMC41IC8gZlJvb3Q7XG4gICAgICAgIG91dFszXSA9IChtW2sqMytqXSAtIG1baiozK2tdKSAqIGZSb290O1xuICAgICAgICBvdXRbal0gPSAobVtqKjMraV0gKyBtW2kqMytqXSkgKiBmUm9vdDtcbiAgICAgICAgb3V0W2tdID0gKG1bayozK2ldICsgbVtpKjMra10pICogZlJvb3Q7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBxdWF0ZW5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IHZlYyB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG5xdWF0LnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICdxdWF0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMucXVhdCA9IHF1YXQ7XG59XG47XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiAgfSkoc2hpbS5leHBvcnRzKTtcbn0pKHRoaXMpO1xuIiwiLy8gTWlzY2VsbGFuZW91cyBnZW8gZnVuY3Rpb25zXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL3BvaW50LmpzJyk7XG5cbnZhciBHZW8gPSB7fTtcblxuLy8gUHJvamVjdGlvbiBjb25zdGFudHNcbkdlby50aWxlX3NpemUgPSAyNTY7XG5HZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyA9IDIwMDM3NTA4LjM0Mjc4OTI0NDtcbkdlby5tYXBfb3JpZ2luX21ldGVycyA9IFBvaW50KC1HZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycywgR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMpO1xuR2VvLm1pbl96b29tX21ldGVyc19wZXJfcGl4ZWwgPSBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAqIDIgLyBHZW8udGlsZV9zaXplOyAvLyBtaW4gem9vbSBkcmF3cyB3b3JsZCBhcyAyIHRpbGVzIHdpZGVcbkdlby5tZXRlcnNfcGVyX3BpeGVsID0gW107XG5HZW8ubWF4X3pvb20gPSAyMDtcbmZvciAodmFyIHo9MDsgeiA8PSBHZW8ubWF4X3pvb207IHorKykge1xuICAgIEdlby5tZXRlcnNfcGVyX3BpeGVsW3pdID0gR2VvLm1pbl96b29tX21ldGVyc19wZXJfcGl4ZWwgLyBNYXRoLnBvdygyLCB6KTtcbn1cblxuLy8gQ29udmVyc2lvbiBmdW5jdGlvbnMgYmFzZWQgb24gYW4gZGVmaW5lZCB0aWxlIHNjYWxlXG5HZW8udW5pdHNfcGVyX21ldGVyID0gW107XG5HZW8uc2V0VGlsZVNjYWxlID0gZnVuY3Rpb24oc2NhbGUpXG57XG4gICAgR2VvLnRpbGVfc2NhbGUgPSBzY2FsZTtcbiAgICBHZW8udW5pdHNfcGVyX3BpeGVsID0gR2VvLnRpbGVfc2NhbGUgLyBHZW8udGlsZV9zaXplO1xuXG4gICAgZm9yICh2YXIgej0wOyB6IDw9IEdlby5tYXhfem9vbTsgeisrKSB7XG4gICAgICAgIEdlby51bml0c19wZXJfbWV0ZXJbel0gPSBHZW8udGlsZV9zY2FsZSAvIChHZW8udGlsZV9zaXplICogR2VvLm1ldGVyc19wZXJfcGl4ZWxbel0pO1xuICAgIH1cbn07XG5cbi8vIENvbnZlcnQgdGlsZSBsb2NhdGlvbiB0byBtZXJjYXRvciBtZXRlcnMgLSBtdWx0aXBseSBieSBwaXhlbHMgcGVyIHRpbGUsIHRoZW4gYnkgbWV0ZXJzIHBlciBwaXhlbCwgYWRqdXN0IGZvciBtYXAgb3JpZ2luXG5HZW8ubWV0ZXJzRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIHJldHVybiBQb2ludChcbiAgICAgICAgKHRpbGUueCAqIEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt0aWxlLnpdKSArIEdlby5tYXBfb3JpZ2luX21ldGVycy54LFxuICAgICAgICAoKHRpbGUueSAqIEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt0aWxlLnpdKSAqIC0xKSArIEdlby5tYXBfb3JpZ2luX21ldGVycy55XG4gICAgKTtcbn07XG5cbi8vIENvbnZlcnQgbWVyY2F0b3IgbWV0ZXJzIHRvIGxhdC1sbmdcbkdlby5tZXRlcnNUb0xhdExuZyA9IGZ1bmN0aW9uIChtZXRlcnMpXG57XG4gICAgdmFyIGMgPSBQb2ludC5jb3B5KG1ldGVycyk7XG5cbiAgICBjLnggLz0gR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnM7XG4gICAgYy55IC89IEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzO1xuXG4gICAgYy55ID0gKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoYy55ICogTWF0aC5QSSkpIC0gKE1hdGguUEkgLyAyKSkgLyBNYXRoLlBJO1xuXG4gICAgYy54ICo9IDE4MDtcbiAgICBjLnkgKj0gMTgwO1xuXG4gICAgcmV0dXJuIGM7XG59O1xuXG4vLyBDb252ZXJ0IGxhdC1sbmcgdG8gbWVyY2F0b3IgbWV0ZXJzXG5HZW8ubGF0TG5nVG9NZXRlcnMgPSBmdW5jdGlvbihsYXRsbmcpXG57XG4gICAgdmFyIGMgPSBQb2ludC5jb3B5KGxhdGxuZyk7XG5cbiAgICAvLyBMYXRpdHVkZVxuICAgIGMueSA9IE1hdGgubG9nKE1hdGgudGFuKChjLnkgKyA5MCkgKiBNYXRoLlBJIC8gMzYwKSkgLyAoTWF0aC5QSSAvIDE4MCk7XG4gICAgYy55ID0gYy55ICogR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMgLyAxODA7XG5cbiAgICAvLyBMb25naXR1ZGVcbiAgICBjLnggPSBjLnggKiBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAvIDE4MDtcblxuICAgIHJldHVybiBjO1xufTtcblxuLy8gUnVuIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIG9uIGVhY2ggY29vb3JkaW5hdGUgaW4gYSBHZW9KU09OIGdlb21ldHJ5XG5HZW8udHJhbnNmb3JtR2VvbWV0cnkgPSBmdW5jdGlvbiAoZ2VvbWV0cnksIHRyYW5zZm9ybSlcbntcbiAgICBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm0oZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xuICAgIH1cbiAgICBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyB8fCBnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvaW50Jykge1xuICAgICAgICByZXR1cm4gZ2VvbWV0cnkuY29vcmRpbmF0ZXMubWFwKHRyYW5zZm9ybSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nIHx8IGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpTGluZVN0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicpIHtcbiAgICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbiAocG9seWdvbikge1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlnb24ubWFwKGZ1bmN0aW9uIChjb29yZGluYXRlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gVE9ETzogc3VwcG9ydCBHZW9tZXRyeUNvbGxlY3Rpb25cbiAgICByZXR1cm4ge307XG59O1xuXG5HZW8uYm94SW50ZXJzZWN0ID0gZnVuY3Rpb24gKGIxLCBiMilcbntcbiAgICByZXR1cm4gIShcbiAgICAgICAgYjIuc3cueCA+IGIxLm5lLnggfHxcbiAgICAgICAgYjIubmUueCA8IGIxLnN3LnggfHxcbiAgICAgICAgYjIuc3cueSA+IGIxLm5lLnkgfHxcbiAgICAgICAgYjIubmUueSA8IGIxLnN3LnlcbiAgICApO1xufTtcblxuLy8gU3BsaXQgdGhlIGxpbmVzIG9mIGEgZmVhdHVyZSB3aGVyZXZlciB0d28gcG9pbnRzIGFyZSBmYXJ0aGVyIGFwYXJ0IHRoYW4gYSBnaXZlbiB0b2xlcmFuY2Vcbkdlby5zcGxpdEZlYXR1cmVMaW5lcyAgPSBmdW5jdGlvbiAoZmVhdHVyZSwgdG9sZXJhbmNlKSB7XG4gICAgdmFyIHRvbGVyYW5jZSA9IHRvbGVyYW5jZSB8fCAwLjAwMTtcbiAgICB2YXIgdG9sZXJhbmNlX3NxID0gdG9sZXJhbmNlICogdG9sZXJhbmNlO1xuICAgIHZhciBnZW9tID0gZmVhdHVyZS5nZW9tZXRyeTtcbiAgICB2YXIgbGluZXM7XG5cbiAgICBpZiAoZ2VvbS50eXBlID09ICdNdWx0aUxpbmVTdHJpbmcnKSB7XG4gICAgICAgIGxpbmVzID0gZ2VvbS5jb29yZGluYXRlcztcbiAgICB9XG4gICAgZWxzZSBpZiAoZ2VvbS50eXBlID09J0xpbmVTdHJpbmcnKSB7XG4gICAgICAgIGxpbmVzID0gW2dlb20uY29vcmRpbmF0ZXNdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZlYXR1cmU7XG4gICAgfVxuXG4gICAgdmFyIHNwbGl0X2xpbmVzID0gW107XG5cbiAgICBmb3IgKHZhciBzPTA7IHMgPCBsaW5lcy5sZW5ndGg7IHMrKykge1xuICAgICAgICB2YXIgc2VnID0gbGluZXNbc107XG4gICAgICAgIHZhciBzcGxpdF9zZWcgPSBbXTtcbiAgICAgICAgdmFyIGxhc3RfY29vcmQgPSBudWxsO1xuICAgICAgICB2YXIga2VlcDtcblxuICAgICAgICBmb3IgKHZhciBjPTA7IGMgPCBzZWcubGVuZ3RoOyBjKyspIHtcbiAgICAgICAgICAgIHZhciBjb29yZCA9IHNlZ1tjXTtcbiAgICAgICAgICAgIGtlZXAgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAobGFzdF9jb29yZCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpc3QgPSAoY29vcmRbMF0gLSBsYXN0X2Nvb3JkWzBdKSAqIChjb29yZFswXSAtIGxhc3RfY29vcmRbMF0pICsgKGNvb3JkWzFdIC0gbGFzdF9jb29yZFsxXSkgKiAoY29vcmRbMV0gLSBsYXN0X2Nvb3JkWzFdKTtcbiAgICAgICAgICAgICAgICBpZiAoZGlzdCA+IHRvbGVyYW5jZV9zcSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInNwbGl0IGxpbmVzIGF0IChcIiArIGNvb3JkWzBdICsgXCIsIFwiICsgY29vcmRbMV0gKyBcIiksIFwiICsgTWF0aC5zcXJ0KGRpc3QpICsgXCIgYXBhcnRcIik7XG4gICAgICAgICAgICAgICAgICAgIGtlZXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZWVwID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgc3BsaXRfbGluZXMucHVzaChzcGxpdF9zZWcpO1xuICAgICAgICAgICAgICAgIHNwbGl0X3NlZyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3BsaXRfc2VnLnB1c2goY29vcmQpO1xuXG4gICAgICAgICAgICBsYXN0X2Nvb3JkID0gY29vcmQ7XG4gICAgICAgIH1cblxuICAgICAgICBzcGxpdF9saW5lcy5wdXNoKHNwbGl0X3NlZyk7XG4gICAgICAgIHNwbGl0X3NlZyA9IFtdO1xuICAgIH1cblxuICAgIGlmIChzcGxpdF9saW5lcy5sZW5ndGggPT0gMSkge1xuICAgICAgICBnZW9tLnR5cGUgPSAnTGluZVN0cmluZyc7XG4gICAgICAgIGdlb20uY29vcmRpbmF0ZXMgPSBzcGxpdF9saW5lc1swXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGdlb20udHlwZSA9ICdNdWx0aUxpbmVTdHJpbmcnO1xuICAgICAgICBnZW9tLmNvb3JkaW5hdGVzID0gc3BsaXRfbGluZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdlbztcbn1cbiIsIi8vIFdlYkdMIG1hbmFnZW1lbnQgYW5kIHJlbmRlcmluZyBmdW5jdGlvbnNcblxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcbi8vIHZhciBHTFZlcnRleEFycmF5T2JqZWN0ID0gcmVxdWlyZSgnLi9nbF92YW8uanMnKTtcblxudmFyIEdMID0ge307XG5cbi8vIFNldHVwIGEgV2ViR0wgY29udGV4dFxuLy8gSWYgbm8gY2FudmFzIGVsZW1lbnQgaXMgcHJvdmlkZWQsIG9uZSBpcyBjcmVhdGVkIGFuZCBhZGRlZCB0byB0aGUgZG9jdW1lbnQgYm9keVxuR0wuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uIGdldENvbnRleHQgKGNhbnZhcylcbntcbiAgICB2YXIgY2FudmFzID0gY2FudmFzO1xuICAgIHZhciBmdWxsc2NyZWVuID0gZmFsc2U7XG4gICAgaWYgKGNhbnZhcyA9PSBudWxsKSB7XG4gICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBjYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBjYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICAgICAgY2FudmFzLnN0eWxlLmxlZnQgPSAwO1xuICAgICAgICBjYW52YXMuc3R5bGUuekluZGV4ID0gLTE7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICAgICAgZnVsbHNjcmVlbiA9IHRydWU7XG4gICAgfVxuXG4gICAgdmFyIGdsID0gY2FudmFzLmdldENvbnRleHQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcpO1xuICAgIGlmICghZ2wpIHtcbiAgICAgICAgYWxlcnQoXCJDb3VsZG4ndCBjcmVhdGUgV2ViR0wgY29udGV4dC4gWW91ciBicm93c2VyIHByb2JhYmx5IGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTCBvciBpdCdzIHR1cm5lZCBvZmY/XCIpO1xuICAgICAgICB0aHJvdyBcIkNvdWxkbid0IGNyZWF0ZSBXZWJHTCBjb250ZXh0XCI7XG4gICAgfVxuXG4gICAgR0wucmVzaXplQ2FudmFzKGdsLCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICBpZiAoZnVsbHNjcmVlbiA9PSB0cnVlKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBHTC5yZXNpemVDYW52YXMoZ2wsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBHTFZlcnRleEFycmF5T2JqZWN0LmluaXQoZ2wpOyAvLyBUT0RPOiB0aGlzIHBhdHRlcm4gZG9lc24ndCBzdXBwb3J0IG11bHRpcGxlIGFjdGl2ZSBHTCBjb250ZXh0cywgc2hvdWxkIHRoYXQgZXZlbiBiZSBzdXBwb3J0ZWQ/XG5cbiAgICByZXR1cm4gZ2w7XG59O1xuXG5HTC5yZXNpemVDYW52YXMgPSBmdW5jdGlvbiAoZ2wsIHdpZHRoLCBoZWlnaHQpXG57XG4gICAgdmFyIGRldmljZV9waXhlbF9yYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgZ2wuY2FudmFzLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuICAgIGdsLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgIGdsLmNhbnZhcy53aWR0aCA9IE1hdGgucm91bmQoZ2wuY2FudmFzLnN0eWxlLndpZHRoICogZGV2aWNlX3BpeGVsX3JhdGlvKTtcbiAgICBnbC5jYW52YXMuaGVpZ2h0ID0gTWF0aC5yb3VuZChnbC5jYW52YXMuc3R5bGUud2lkdGggKiBkZXZpY2VfcGl4ZWxfcmF0aW8pO1xuICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdsLmNhbnZhcy53aWR0aCwgZ2wuY2FudmFzLmhlaWdodCk7XG59O1xuXG4vLyBDb21waWxlICYgbGluayBhIFdlYkdMIHByb2dyYW0gZnJvbSBwcm92aWRlZCB2ZXJ0ZXggYW5kIHNoYWRlciBzb3VyY2UgZWxlbWVudHNcbkdMLmNyZWF0ZVByb2dyYW1Gcm9tRWxlbWVudHMgPSBmdW5jdGlvbiBHTGNyZWF0ZVByb2dyYW1Gcm9tRWxlbWVudHMgKGdsLCB2ZXJ0ZXhfc2hhZGVyX2lkLCBmcmFnbWVudF9zaGFkZXJfaWQpXG57XG4gICAgdmFyIHZlcnRleF9zaGFkZXJfc291cmNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodmVydGV4X3NoYWRlcl9pZCkudGV4dENvbnRlbnQ7XG4gICAgdmFyIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChmcmFnbWVudF9zaGFkZXJfaWQpLnRleHRDb250ZW50O1xuICAgIHZhciBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgIHJldHVybiBHTC51cGRhdGVQcm9ncmFtKGdsLCBwcm9ncmFtLCB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSk7XG59O1xuXG4vLyBDb21waWxlICYgbGluayBhIFdlYkdMIHByb2dyYW0gZnJvbSBwcm92aWRlZCB2ZXJ0ZXggYW5kIHNoYWRlciBzb3VyY2UgVVJMc1xuLy8gTk9URTogbG9hZHMgdmlhIHN5bmNocm9ub3VzIFhIUiBmb3Igc2ltcGxpY2l0eSwgY291bGQgYmUgbWFkZSBhc3luY1xuR0wuY3JlYXRlUHJvZ3JhbUZyb21VUkxzID0gZnVuY3Rpb24gR0xjcmVhdGVQcm9ncmFtRnJvbVVSTHMgKGdsLCB2ZXJ0ZXhfc2hhZGVyX3VybCwgZnJhZ21lbnRfc2hhZGVyX3VybClcbntcbiAgICB2YXIgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICByZXR1cm4gR0wudXBkYXRlUHJvZ3JhbUZyb21VUkxzKGdsLCBwcm9ncmFtLCB2ZXJ0ZXhfc2hhZGVyX3VybCwgZnJhZ21lbnRfc2hhZGVyX3VybCk7XG59O1xuXG5HTC51cGRhdGVQcm9ncmFtRnJvbVVSTHMgPSBmdW5jdGlvbiBHTFVwZGF0ZVByb2dyYW1Gcm9tVVJMcyAoZ2wsIHByb2dyYW0sIHZlcnRleF9zaGFkZXJfdXJsLCBmcmFnbWVudF9zaGFkZXJfdXJsKVxue1xuICAgIHZhciB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZTtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkgeyB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSA9IHJlcS5yZXNwb25zZTsgfTtcbiAgICByZXEub3BlbignR0VUJywgVXRpbHMudXJsRm9yUGF0aCh2ZXJ0ZXhfc2hhZGVyX3VybCkgKyAnPycgKyAoK25ldyBEYXRlKCkpLCBmYWxzZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICByZXEuc2VuZCgpO1xuXG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHsgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSA9IHJlcS5yZXNwb25zZTsgfTtcbiAgICByZXEub3BlbignR0VUJywgVXRpbHMudXJsRm9yUGF0aChmcmFnbWVudF9zaGFkZXJfdXJsKSArICc/JyArICgrbmV3IERhdGUoKSksIGZhbHNlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgIHJlcS5zZW5kKCk7XG5cbiAgICByZXR1cm4gR0wudXBkYXRlUHJvZ3JhbShnbCwgcHJvZ3JhbSwgdmVydGV4X3NoYWRlcl9zb3VyY2UsIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UpO1xufTtcblxuLy8gQ29tcGlsZSAmIGxpbmsgYSBXZWJHTCBwcm9ncmFtIGZyb20gcHJvdmlkZWQgdmVydGV4IGFuZCBmcmFnbWVudCBzaGFkZXIgc291cmNlc1xuLy8gdXBkYXRlIGEgcHJvZ3JhbSBpZiBvbmUgaXMgcGFzc2VkIGluLiBDcmVhdGUgb25lIGlmIG5vdC4gQWxlcnQgYW5kIGRvbid0IHVwZGF0ZSBhbnl0aGluZyBpZiB0aGUgc2hhZGVycyBkb24ndCBjb21waWxlLlxuR0wudXBkYXRlUHJvZ3JhbSA9IGZ1bmN0aW9uIEdMdXBkYXRlUHJvZ3JhbSAoZ2wsIHByb2dyYW0sIHZlcnRleF9zaGFkZXJfc291cmNlLCBmcmFnbWVudF9zaGFkZXJfc291cmNlKVxue1xuICAgIHRyeSB7XG4gICAgICAgIHZhciB2ZXJ0ZXhfc2hhZGVyID0gR0wuY3JlYXRlU2hhZGVyKGdsLCB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgZ2wuVkVSVEVYX1NIQURFUik7XG4gICAgICAgIHZhciBmcmFnbWVudF9zaGFkZXIgPSBHTC5jcmVhdGVTaGFkZXIoZ2wsICcjaWZkZWYgR0xfRVNcXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XFxuI2VuZGlmXFxuXFxuJyArIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UsIGdsLkZSQUdNRU5UX1NIQURFUik7XG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgICAvLyBhbGVydChlcnIpO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG5cbiAgICBnbC51c2VQcm9ncmFtKG51bGwpO1xuICAgIGlmIChwcm9ncmFtICE9IG51bGwpIHtcbiAgICAgICAgdmFyIG9sZF9zaGFkZXJzID0gZ2wuZ2V0QXR0YWNoZWRTaGFkZXJzKHByb2dyYW0pO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgb2xkX3NoYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGdsLmRldGFjaFNoYWRlcihwcm9ncmFtLCBvbGRfc2hhZGVyc1tpXSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgIH1cblxuICAgIGlmICh2ZXJ0ZXhfc2hhZGVyID09IG51bGwgfHwgZnJhZ21lbnRfc2hhZGVyID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHByb2dyYW07XG4gICAgfVxuXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZlcnRleF9zaGFkZXIpO1xuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnbWVudF9zaGFkZXIpO1xuXG4gICAgZ2wuZGVsZXRlU2hhZGVyKHZlcnRleF9zaGFkZXIpO1xuICAgIGdsLmRlbGV0ZVNoYWRlcihmcmFnbWVudF9zaGFkZXIpO1xuXG4gICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XG5cbiAgICBpZiAoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XG4gICAgICAgIHZhciBwcm9ncmFtX2Vycm9yID1cbiAgICAgICAgICAgIFwiV2ViR0wgcHJvZ3JhbSBlcnJvcjpcXG5cIiArXG4gICAgICAgICAgICBcIlZBTElEQVRFX1NUQVRVUzogXCIgKyBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLlZBTElEQVRFX1NUQVRVUykgKyBcIlxcblwiICtcbiAgICAgICAgICAgIFwiRVJST1I6IFwiICsgZ2wuZ2V0RXJyb3IoKSArIFwiXFxuXFxuXCIgK1xuICAgICAgICAgICAgXCItLS0gVmVydGV4IFNoYWRlciAtLS1cXG5cIiArIHZlcnRleF9zaGFkZXJfc291cmNlICsgXCJcXG5cXG5cIiArXG4gICAgICAgICAgICBcIi0tLSBGcmFnbWVudCBTaGFkZXIgLS0tXFxuXCIgKyBmcmFnbWVudF9zaGFkZXJfc291cmNlO1xuICAgICAgICBjb25zb2xlLmxvZyhwcm9ncmFtX2Vycm9yKTtcbiAgICAgICAgdGhyb3cgcHJvZ3JhbV9lcnJvcjtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvZ3JhbTtcbn07XG5cbi8vIENvbXBpbGUgYSB2ZXJ0ZXggb3IgZnJhZ21lbnQgc2hhZGVyIGZyb20gcHJvdmlkZWQgc291cmNlXG5HTC5jcmVhdGVTaGFkZXIgPSBmdW5jdGlvbiBHTGNyZWF0ZVNoYWRlciAoZ2wsIHNvdXJjZSwgdHlwZSlcbntcbiAgICB2YXIgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKHR5cGUpO1xuXG4gICAgZ2wuc2hhZGVyU291cmNlKHNoYWRlciwgc291cmNlKTtcbiAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG5cbiAgICBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xuICAgICAgICB2YXIgc2hhZGVyX2Vycm9yID1cbiAgICAgICAgICAgIFwiV2ViR0wgc2hhZGVyIGVycm9yOlxcblwiICtcbiAgICAgICAgICAgICh0eXBlID09IGdsLlZFUlRFWF9TSEFERVIgPyBcIlZFUlRFWFwiIDogXCJGUkFHTUVOVFwiKSArIFwiIFNIQURFUjpcXG5cIiArXG4gICAgICAgICAgICBnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcik7XG4gICAgICAgIHRocm93IHNoYWRlcl9lcnJvcjtcbiAgICB9XG5cbiAgICByZXR1cm4gc2hhZGVyO1xufTtcblxuLy8gVHJpYW5ndWxhdGlvbiB1c2luZyBsaWJ0ZXNzLmpzIHBvcnQgb2YgZ2x1VGVzc2VsYXRvclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2JyZW5kYW5rZW5ueS9saWJ0ZXNzLmpzXG50cnkge1xuICAgIEdMLnRlc3NlbGF0b3IgPSAoZnVuY3Rpb24gaW5pdFRlc3NlbGF0b3IoKSB7XG4gICAgICAgIHZhciB0ZXNzZWxhdG9yID0gbmV3IGxpYnRlc3MuR2x1VGVzc2VsYXRvcigpO1xuXG4gICAgICAgIC8vIENhbGxlZCBmb3IgZWFjaCB2ZXJ0ZXggb2YgdGVzc2VsYXRvciBvdXRwdXRcbiAgICAgICAgZnVuY3Rpb24gdmVydGV4Q2FsbGJhY2soZGF0YSwgcG9seVZlcnRBcnJheSkge1xuICAgICAgICAgICAgaWYgKHRlc3NlbGF0b3IueiAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcG9seVZlcnRBcnJheS5wdXNoKFtkYXRhWzBdLCBkYXRhWzFdLCB0ZXNzZWxhdG9yLnpdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvbHlWZXJ0QXJyYXkucHVzaChbZGF0YVswXSwgZGF0YVsxXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsbGVkIHdoZW4gc2VnbWVudHMgaW50ZXJzZWN0IGFuZCBtdXN0IGJlIHNwbGl0XG4gICAgICAgIGZ1bmN0aW9uIGNvbWJpbmVDYWxsYmFjayhjb29yZHMsIGRhdGEsIHdlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvb3JkcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbGxlZCB3aGVuIGEgdmVydGV4IHN0YXJ0cyBvciBzdG9wcyBhIGJvdW5kYXJ5IGVkZ2Ugb2YgYSBwb2x5Z29uXG4gICAgICAgIGZ1bmN0aW9uIGVkZ2VDYWxsYmFjayhmbGFnKSB7XG4gICAgICAgICAgICAvLyBOby1vcCBjYWxsYmFjayB0byBmb3JjZSBzaW1wbGUgdHJpYW5nbGUgcHJpbWl0aXZlcyAobm8gdHJpYW5nbGUgc3RyaXBzIG9yIGZhbnMpLlxuICAgICAgICAgICAgLy8gU2VlOiBodHRwOi8vd3d3LmdscHJvZ3JhbW1pbmcuY29tL3JlZC9jaGFwdGVyMTEuaHRtbFxuICAgICAgICAgICAgLy8gXCJTaW5jZSBlZGdlIGZsYWdzIG1ha2Ugbm8gc2Vuc2UgaW4gYSB0cmlhbmdsZSBmYW4gb3IgdHJpYW5nbGUgc3RyaXAsIGlmIHRoZXJlIGlzIGEgY2FsbGJhY2tcbiAgICAgICAgICAgIC8vIGFzc29jaWF0ZWQgd2l0aCBHTFVfVEVTU19FREdFX0ZMQUcgdGhhdCBlbmFibGVzIGVkZ2UgZmxhZ3MsIHRoZSBHTFVfVEVTU19CRUdJTiBjYWxsYmFjayBpc1xuICAgICAgICAgICAgLy8gY2FsbGVkIG9ubHkgd2l0aCBHTF9UUklBTkdMRVMuXCJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdHTC50ZXNzZWxhdG9yOiBlZGdlIGZsYWc6ICcgKyBmbGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRlc3NlbGF0b3IuZ2x1VGVzc0NhbGxiYWNrKGxpYnRlc3MuZ2x1RW51bS5HTFVfVEVTU19WRVJURVhfREFUQSwgdmVydGV4Q2FsbGJhY2spO1xuICAgICAgICB0ZXNzZWxhdG9yLmdsdVRlc3NDYWxsYmFjayhsaWJ0ZXNzLmdsdUVudW0uR0xVX1RFU1NfQ09NQklORSwgY29tYmluZUNhbGxiYWNrKTtcbiAgICAgICAgdGVzc2VsYXRvci5nbHVUZXNzQ2FsbGJhY2sobGlidGVzcy5nbHVFbnVtLkdMVV9URVNTX0VER0VfRkxBRywgZWRnZUNhbGxiYWNrKTtcblxuICAgICAgICAvLyBCcmVuZGFuIEtlbm55OlxuICAgICAgICAvLyBsaWJ0ZXNzIHdpbGwgdGFrZSAzZCB2ZXJ0cyBhbmQgZmxhdHRlbiB0byBhIHBsYW5lIGZvciB0ZXNzZWxhdGlvblxuICAgICAgICAvLyBzaW5jZSBvbmx5IGRvaW5nIDJkIHRlc3NlbGF0aW9uIGhlcmUsIHByb3ZpZGUgej0xIG5vcm1hbCB0byBza2lwXG4gICAgICAgIC8vIGl0ZXJhdGluZyBvdmVyIHZlcnRzIG9ubHkgdG8gZ2V0IHRoZSBzYW1lIGFuc3dlci5cbiAgICAgICAgLy8gY29tbWVudCBvdXQgdG8gdGVzdCBub3JtYWwtZ2VuZXJhdGlvbiBjb2RlXG4gICAgICAgIHRlc3NlbGF0b3IuZ2x1VGVzc05vcm1hbCgwLCAwLCAxKTtcblxuICAgICAgICByZXR1cm4gdGVzc2VsYXRvcjtcbiAgICB9KSgpO1xuXG4gICAgR0wudHJpYW5ndWxhdGVQb2x5Z29uID0gZnVuY3Rpb24gR0xUcmlhbmd1bGF0ZSAoY29udG91cnMsIHopXG4gICAge1xuICAgICAgICB2YXIgdHJpYW5nbGVWZXJ0cyA9IFtdO1xuICAgICAgICBHTC50ZXNzZWxhdG9yLnogPSB6O1xuICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NCZWdpblBvbHlnb24odHJpYW5nbGVWZXJ0cyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb250b3Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzQmVnaW5Db250b3VyKCk7XG4gICAgICAgICAgICB2YXIgY29udG91ciA9IGNvbnRvdXJzW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjb250b3VyLmxlbmd0aDsgaiArKykge1xuICAgICAgICAgICAgICAgIHZhciBjb29yZHMgPSBbY29udG91cltqXVswXSwgY29udG91cltqXVsxXSwgMF07XG4gICAgICAgICAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzVmVydGV4KGNvb3JkcywgY29vcmRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc0VuZENvbnRvdXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc0VuZFBvbHlnb24oKTtcbiAgICAgICAgcmV0dXJuIHRyaWFuZ2xlVmVydHM7XG4gICAgfTtcbn1cbmNhdGNoIChlKSB7XG4gICAgLy8gY29uc29sZS5sb2coXCJsaWJ0ZXNzIG5vdCBkZWZpbmVkIVwiKTtcbiAgICAvLyBza2lwIGlmIGxpYnRlc3Mgbm90IGRlZmluZWRcbn1cblxuLy8gQWRkIHZlcnRpY2VzIHRvIGFuIGFycmF5IChkZXN0aW5lZCB0byBiZSB1c2VkIGFzIGEgR0wgYnVmZmVyKSwgJ3N0cmlwaW5nJyBlYWNoIHZlcnRleCB3aXRoIGNvbnN0YW50IGRhdGFcbi8vIFBlci12ZXJ0ZXggYXR0cmlidXRlcyBtdXN0IGJlIHByZS1wYWNrZWQgaW50byB0aGUgdmVydGljZXMgYXJyYXlcbi8vIFVzZWQgZm9yIGFkZGluZyB2YWx1ZXMgdGhhdCBhcmUgb2Z0ZW4gY29uc3RhbnQgcGVyIGdlb21ldHJ5IG9yIHBvbHlnb24sIGxpa2UgY29sb3JzLCBub3JtYWxzIChmb3IgcG9seXMgc2l0dGluZyBmbGF0IG9uIG1hcCksIGxheWVyIGFuZCBtYXRlcmlhbCBpbmZvLCBldGMuXG5HTC5hZGRWZXJ0aWNlcyA9IGZ1bmN0aW9uICh2ZXJ0aWNlcywgdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpXG57XG4gICAgaWYgKHZlcnRpY2VzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHZlcnRleF9kYXRhO1xuICAgIH1cbiAgICB2ZXJ0ZXhfY29uc3RhbnRzID0gdmVydGV4X2NvbnN0YW50cyB8fCBbXTtcblxuICAgIGZvciAodmFyIHY9MCwgdmxlbiA9IHZlcnRpY2VzLmxlbmd0aDsgdiA8IHZsZW47IHYrKykge1xuICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCB2ZXJ0aWNlc1t2XSk7XG4gICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIHZlcnRleF9jb25zdGFudHMpO1xuICAgIH1cblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIEFkZCB2ZXJ0aWNlcyB0byBhbiBhcnJheSwgJ3N0cmlwaW5nJyBlYWNoIHZlcnRleCB3aXRoIGNvbnN0YW50IGRhdGFcbi8vIE11bHRpcGxlLCB1bi1wYWNrZWQgYXR0cmlidXRlIGFycmF5cyBjYW4gYmUgcHJvdmlkZWRcbkdMLmFkZFZlcnRpY2VzTXVsdGlwbGVBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGR5bmFtaWNzLCBjb25zdGFudHMsIHZlcnRleF9kYXRhKVxue1xuICAgIHZhciBkbGVuID0gZHluYW1pY3MubGVuZ3RoO1xuICAgIHZhciB2bGVuID0gZHluYW1pY3NbMF0ubGVuZ3RoO1xuICAgIGNvbnN0YW50cyA9IGNvbnN0YW50cyB8fCBbXTtcblxuICAgIGZvciAodmFyIHY9MDsgdiA8IHZsZW47IHYrKykge1xuICAgICAgICBmb3IgKHZhciBkPTA7IGQgPCBkbGVuOyBkKyspIHtcbiAgICAgICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIGR5bmFtaWNzW2RdW3ZdKTtcbiAgICAgICAgfVxuICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCBjb25zdGFudHMpO1xuICAgIH1cblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIEFkZCB2ZXJ0aWNlcyB0byBhbiBhcnJheSwgd2l0aCBhIHZhcmlhYmxlIGxheW91dCAoYm90aCBwZXItdmVydGV4IGR5bmFtaWMgYW5kIGNvbnN0YW50IGF0dHJpYnMpXG4vLyBHTC5hZGRWZXJ0aWNlc0J5QXR0cmlidXRlTGF5b3V0ID0gZnVuY3Rpb24gKGF0dHJpYnMsIHZlcnRleF9kYXRhKVxuLy8ge1xuLy8gICAgIHZhciBtYXhfbGVuZ3RoID0gMDtcbi8vICAgICBmb3IgKHZhciBhPTA7IGEgPCBhdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4vLyAgICAgICAgIC8vIGNvbnNvbGUubG9nKGF0dHJpYnNbYV0ubmFtZSk7XG4vLyAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiYSBcIiArIHR5cGVvZiBhdHRyaWJzW2FdLmRhdGEpO1xuLy8gICAgICAgICBpZiAodHlwZW9mIGF0dHJpYnNbYV0uZGF0YSA9PSAnb2JqZWN0Jykge1xuLy8gICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJhWzBdIFwiICsgdHlwZW9mIGF0dHJpYnNbYV0uZGF0YVswXSk7XG4vLyAgICAgICAgICAgICAvLyBQZXItdmVydGV4IGxpc3QgLSBhcnJheSBvZiBhcnJheVxuLy8gICAgICAgICAgICAgaWYgKHR5cGVvZiBhdHRyaWJzW2FdLmRhdGFbMF0gPT0gJ29iamVjdCcpIHtcbi8vICAgICAgICAgICAgICAgICBhdHRyaWJzW2FdLmN1cnNvciA9IDA7XG4vLyAgICAgICAgICAgICAgICAgaWYgKGF0dHJpYnNbYV0uZGF0YS5sZW5ndGggPiBtYXhfbGVuZ3RoKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIG1heF9sZW5ndGggPSBhdHRyaWJzW2FdLmRhdGEubGVuZ3RoO1xuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIC8vIFN0YXRpYyBhcnJheSBmb3IgYWxsIHZlcnRpY2VzXG4vLyAgICAgICAgICAgICBlbHNlIHtcbi8vICAgICAgICAgICAgICAgICBhdHRyaWJzW2FdLm5leHRfdmVydGV4ID0gYXR0cmlic1thXS5kYXRhO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgICAgIGVsc2Uge1xuLy8gICAgICAgICAgICAgLy8gU3RhdGljIHNpbmdsZSB2YWx1ZSBmb3IgYWxsIHZlcnRpY2VzLCBjb252ZXJ0IHRvIGFycmF5XG4vLyAgICAgICAgICAgICBhdHRyaWJzW2FdLm5leHRfdmVydGV4ID0gW2F0dHJpYnNbYV0uZGF0YV07XG4vLyAgICAgICAgIH1cbi8vICAgICB9XG5cbi8vICAgICBmb3IgKHZhciB2PTA7IHYgPCBtYXhfbGVuZ3RoOyB2KyspIHtcbi8vICAgICAgICAgZm9yICh2YXIgYT0wOyBhIDwgYXR0cmlicy5sZW5ndGg7IGErKykge1xuLy8gICAgICAgICAgICAgaWYgKGF0dHJpYnNbYV0uY3Vyc29yICE9IG51bGwpIHtcbi8vICAgICAgICAgICAgICAgICAvLyBOZXh0IHZhbHVlIGluIGxpc3Rcbi8vICAgICAgICAgICAgICAgICBhdHRyaWJzW2FdLm5leHRfdmVydGV4ID0gYXR0cmlic1thXS5kYXRhW2F0dHJpYnNbYV0uY3Vyc29yXTtcblxuLy8gICAgICAgICAgICAgICAgIC8vIFRPRE86IHJlcGVhdHMgaWYgb25lIGxpc3QgaXMgc2hvcnRlciB0aGFuIG90aGVycyAtIGRlc2lyZWQgYmVoYXZpb3IsIG9yIGVuZm9yY2Ugc2FtZSBsZW5ndGg/XG4vLyAgICAgICAgICAgICAgICAgaWYgKGF0dHJpYnNbYV0uY3Vyc29yIDwgYXR0cmlic1thXS5kYXRhLmxlbmd0aCkge1xuLy8gICAgICAgICAgICAgICAgICAgICBhdHRyaWJzW2FdLmN1cnNvcisrO1xuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIGF0dHJpYnNbYV0ubmV4dF92ZXJ0ZXgpO1xuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbi8vIH07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gR0w7XG59XG4iLCJ2YXIgVmVjdG9yID0gcmVxdWlyZSgnLi4vdmVjdG9yLmpzJyk7XG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9wb2ludC5qcycpO1xudmFyIEdMID0gcmVxdWlyZSgnLi9nbC5qcycpO1xuXG52YXIgR0xCdWlsZGVycyA9IHt9O1xuXG5HTEJ1aWxkZXJzLmRlYnVnID0gZmFsc2U7XG5cbi8vIFRlc3NlbGF0ZSBhIGZsYXQgMkQgcG9seWdvbiB3aXRoIGZpeGVkIGhlaWdodCBhbmQgYWRkIHRvIEdMIHZlcnRleCBidWZmZXJcbkdMQnVpbGRlcnMuYnVpbGRQb2x5Z29ucyA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZFBvbHlnb25zIChwb2x5Z29ucywgeiwgdmVydGV4X2RhdGEsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtdO1xuICAgIGlmICh6ICE9IG51bGwpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoKHopOyAvLyBwcm92aWRlZCB6XG4gICAgfVxuICAgIGlmIChvcHRpb25zLm5vcm1hbHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoKDAsIDAsIDEpOyAvLyB1cHdhcmRzLWZhY2luZyBub3JtYWxcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2guYXBwbHkodmVydGV4X2NvbnN0YW50cywgb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICB9XG4gICAgaWYgKHZlcnRleF9jb25zdGFudHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cyA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIG51bV9wb2x5Z29ucyA9IHBvbHlnb25zLmxlbmd0aDtcbiAgICBmb3IgKHZhciBwPTA7IHAgPCBudW1fcG9seWdvbnM7IHArKykge1xuICAgICAgICB2YXIgdmVydGljZXMgPSBHTC50cmlhbmd1bGF0ZVBvbHlnb24ocG9seWdvbnNbcF0pO1xuICAgICAgICBHTC5hZGRWZXJ0aWNlcyh2ZXJ0aWNlcywgdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIENhbGxiYWNrLWJhc2UgYnVpbGRlciAoZm9yIGZ1dHVyZSBleHBsb3JhdGlvbilcbi8vIFRlc3NlbGF0ZSBhIGZsYXQgMkQgcG9seWdvbiB3aXRoIGZpeGVkIGhlaWdodCBhbmQgYWRkIHRvIEdMIHZlcnRleCBidWZmZXJcbi8vIEdMQnVpbGRlcnMuYnVpbGRQb2x5Z29uczIgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRQb2x5Z29uMiAocG9seWdvbnMsIHosIGFkZEdlb21ldHJ5LCBvcHRpb25zKVxuLy8ge1xuLy8gICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4vLyAgICAgdmFyIG51bV9wb2x5Z29ucyA9IHBvbHlnb25zLmxlbmd0aDtcbi8vICAgICBmb3IgKHZhciBwPTA7IHAgPCBudW1fcG9seWdvbnM7IHArKykge1xuLy8gICAgICAgICB2YXIgdmVydGljZXMgPSB7XG4vLyAgICAgICAgICAgICBwb3NpdGlvbnM6IEdMLnRyaWFuZ3VsYXRlUG9seWdvbihwb2x5Z29uc1twXSwgeiksXG4vLyAgICAgICAgICAgICBub3JtYWxzOiAob3B0aW9ucy5ub3JtYWxzID8gWzAsIDAsIDFdIDogbnVsbClcbi8vICAgICAgICAgfTtcblxuLy8gICAgICAgICBhZGRHZW9tZXRyeSh2ZXJ0aWNlcyk7XG4vLyAgICAgfVxuLy8gfTtcblxuLy8gVGVzc2VsYXRlIGFuZCBleHRydWRlIGEgZmxhdCAyRCBwb2x5Z29uIGludG8gYSBzaW1wbGUgM0QgbW9kZWwgd2l0aCBmaXhlZCBoZWlnaHQgYW5kIGFkZCB0byBHTCB2ZXJ0ZXggYnVmZmVyXG5HTEJ1aWxkZXJzLmJ1aWxkRXh0cnVkZWRQb2x5Z29ucyA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZEV4dHJ1ZGVkUG9seWdvbiAocG9seWdvbnMsIHosIGhlaWdodCwgbWluX2hlaWdodCwgdmVydGV4X2RhdGEsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIG1pbl96ID0geiArIChtaW5faGVpZ2h0IHx8IDApO1xuICAgIHZhciBtYXhfeiA9IHogKyBoZWlnaHQ7XG5cbiAgICAvLyBUb3BcbiAgICBHTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMocG9seWdvbnMsIG1heF96LCB2ZXJ0ZXhfZGF0YSwgeyBub3JtYWxzOiB0cnVlLCB2ZXJ0ZXhfY29uc3RhbnRzOiBvcHRpb25zLnZlcnRleF9jb25zdGFudHMgfSk7XG4gICAgLy8gdmFyIHRvcF92ZXJ0ZXhfY29uc3RhbnRzID0gWzAsIDAsIDFdO1xuICAgIC8vIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMgIT0gbnVsbCkge1xuICAgIC8vICAgICB0b3BfdmVydGV4X2NvbnN0YW50cy5wdXNoLmFwcGx5KHRvcF92ZXJ0ZXhfY29uc3RhbnRzLCBvcHRpb25zLnZlcnRleF9jb25zdGFudHMpO1xuICAgIC8vIH1cbiAgICAvLyBHTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMyKFxuICAgIC8vICAgICBwb2x5Z29ucyxcbiAgICAvLyAgICAgbWF4X3osXG4gICAgLy8gICAgIGZ1bmN0aW9uICh2ZXJ0aWNlcykge1xuICAgIC8vICAgICAgICAgR0wuYWRkVmVydGljZXModmVydGljZXMucG9zaXRpb25zLCB0b3BfdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuICAgIC8vICAgICB9XG4gICAgLy8gKTtcblxuICAgIC8vIFdhbGxzXG4gICAgdmFyIHdhbGxfdmVydGV4X2NvbnN0YW50cyA9IFtudWxsLCBudWxsLCBudWxsXTsgLy8gbm9ybWFscyB3aWxsIGJlIGNhbGN1bGF0ZWQgYmVsb3dcbiAgICBpZiAob3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKSB7XG4gICAgICAgIHdhbGxfdmVydGV4X2NvbnN0YW50cy5wdXNoLmFwcGx5KHdhbGxfdmVydGV4X2NvbnN0YW50cywgb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICB9XG5cbiAgICB2YXIgbnVtX3BvbHlnb25zID0gcG9seWdvbnMubGVuZ3RoO1xuICAgIGZvciAodmFyIHA9MDsgcCA8IG51bV9wb2x5Z29uczsgcCsrKSB7XG4gICAgICAgIHZhciBwb2x5Z29uID0gcG9seWdvbnNbcF07XG5cbiAgICAgICAgZm9yICh2YXIgcT0wOyBxIDwgcG9seWdvbi5sZW5ndGg7IHErKykge1xuICAgICAgICAgICAgdmFyIGNvbnRvdXIgPSBwb2x5Z29uW3FdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciB3PTA7IHcgPCBjb250b3VyLmxlbmd0aCAtIDE7IHcrKykge1xuICAgICAgICAgICAgICAgIHZhciB3YWxsX3ZlcnRpY2VzID0gW107XG5cbiAgICAgICAgICAgICAgICAvLyBUd28gdHJpYW5nbGVzIGZvciB0aGUgcXVhZCBmb3JtZWQgYnkgZWFjaCB2ZXJ0ZXggcGFpciwgZ29pbmcgZnJvbSBib3R0b20gdG8gdG9wIGhlaWdodFxuICAgICAgICAgICAgICAgIHdhbGxfdmVydGljZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJpYW5nbGVcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbdysxXVswXSwgY29udG91clt3KzFdWzFdLCBtYXhfel0sXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3crMV1bMF0sIGNvbnRvdXJbdysxXVsxXSwgbWluX3pdLFxuICAgICAgICAgICAgICAgICAgICBbY29udG91clt3XVswXSwgY29udG91clt3XVsxXSwgbWluX3pdLFxuICAgICAgICAgICAgICAgICAgICAvLyBUcmlhbmdsZVxuICAgICAgICAgICAgICAgICAgICBbY29udG91clt3XVswXSwgY29udG91clt3XVsxXSwgbWluX3pdLFxuICAgICAgICAgICAgICAgICAgICBbY29udG91clt3XVswXSwgY29udG91clt3XVsxXSwgbWF4X3pdLFxuICAgICAgICAgICAgICAgICAgICBbY29udG91clt3KzFdWzBdLCBjb250b3VyW3crMV1bMV0sIG1heF96XVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxjIHRoZSBub3JtYWwgb2YgdGhlIHdhbGwgZnJvbSB1cCB2ZWN0b3IgYW5kIG9uZSBzZWdtZW50IG9mIHRoZSB3YWxsIHRyaWFuZ2xlc1xuICAgICAgICAgICAgICAgIHZhciBub3JtYWwgPSBWZWN0b3IuY3Jvc3MoXG4gICAgICAgICAgICAgICAgICAgIFswLCAwLCAxXSxcbiAgICAgICAgICAgICAgICAgICAgVmVjdG9yLm5vcm1hbGl6ZShbY29udG91clt3KzFdWzBdIC0gY29udG91clt3XVswXSwgY29udG91clt3KzFdWzFdIC0gY29udG91clt3XVsxXSwgMF0pXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIHdhbGxfdmVydGV4X2NvbnN0YW50c1swXSA9IG5vcm1hbFswXTtcbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHNbMV0gPSBub3JtYWxbMV07XG4gICAgICAgICAgICAgICAgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzWzJdID0gbm9ybWFsWzJdO1xuXG4gICAgICAgICAgICAgICAgR0wuYWRkVmVydGljZXMod2FsbF92ZXJ0aWNlcywgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBCdWlsZCB0ZXNzZWxsYXRlZCB0cmlhbmdsZXMgZm9yIGEgcG9seWxpbmVcbi8vIEJhc2ljYWxseSBmb2xsb3dpbmcgdGhlIG1ldGhvZCBkZXNjcmliZWQgaGVyZSBmb3IgbWl0ZXIgam9pbnRzOlxuLy8gaHR0cDovL2FydGdyYW1tZXIuYmxvZ3Nwb3QuY28udWsvMjAxMS8wNy9kcmF3aW5nLXBvbHlsaW5lcy1ieS10ZXNzZWxsYXRpb24uaHRtbFxuR0xCdWlsZGVycy5idWlsZFBvbHlsaW5lcyA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZFBvbHlsaW5lcyAobGluZXMsIHosIHdpZHRoLCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmNsb3NlZF9wb2x5Z29uID0gb3B0aW9ucy5jbG9zZWRfcG9seWdvbiB8fCBmYWxzZTtcbiAgICBvcHRpb25zLnJlbW92ZV90aWxlX2VkZ2VzID0gb3B0aW9ucy5yZW1vdmVfdGlsZV9lZGdlcyB8fCBmYWxzZTtcblxuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW3osIDAsIDAsIDFdOyAvLyBwcm92aWRlZCB6LCBhbmQgdXB3YXJkcy1mYWNpbmcgbm9ybWFsXG4gICAgaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2guYXBwbHkodmVydGV4X2NvbnN0YW50cywgb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICB9XG5cbiAgICAvLyBMaW5lIGNlbnRlciAtIGRlYnVnZ2luZ1xuICAgIGlmIChHTEJ1aWxkZXJzLmRlYnVnICYmIG9wdGlvbnMudmVydGV4X2xpbmVzKSB7XG4gICAgICAgIHZhciBudW1fbGluZXMgPSBsaW5lcy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGxuPTA7IGxuIDwgbnVtX2xpbmVzOyBsbisrKSB7XG4gICAgICAgICAgICB2YXIgbGluZSA9IGxpbmVzW2xuXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgcD0wOyBwIDwgbGluZS5sZW5ndGggLSAxOyBwKyspIHtcbiAgICAgICAgICAgICAgICAvLyBQb2ludCBBIHRvIEJcbiAgICAgICAgICAgICAgICB2YXIgcGEgPSBsaW5lW3BdO1xuICAgICAgICAgICAgICAgIHZhciBwYiA9IGxpbmVbcCsxXTtcblxuICAgICAgICAgICAgICAgIG9wdGlvbnMudmVydGV4X2xpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIHBhWzBdLCBwYVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAxLjAsIDAsIDAsXG4gICAgICAgICAgICAgICAgICAgIHBiWzBdLCBwYlsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAxLjAsIDAsIDBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIEJ1aWxkIHRyaWFuZ2xlc1xuICAgIHZhciB2ZXJ0aWNlcyA9IFtdO1xuICAgIHZhciBudW1fbGluZXMgPSBsaW5lcy5sZW5ndGg7XG4gICAgZm9yICh2YXIgbG49MDsgbG4gPCBudW1fbGluZXM7IGxuKyspIHtcbiAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tsbl07XG4gICAgICAgIC8vIE11bHRpcGxlIGxpbmUgc2VnbWVudHNcbiAgICAgICAgaWYgKGxpbmUubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgLy8gQnVpbGQgYW5jaG9ycyBmb3IgbGluZSBzZWdtZW50czpcbiAgICAgICAgICAgIC8vIGFuY2hvcnMgYXJlIDMgcG9pbnRzLCBlYWNoIGNvbm5lY3RpbmcgMiBsaW5lIHNlZ21lbnRzIHRoYXQgc2hhcmUgYSBqb2ludCAoc3RhcnQgcG9pbnQsIGpvaW50IHBvaW50LCBlbmQgcG9pbnQpXG5cbiAgICAgICAgICAgIHZhciBhbmNob3JzID0gW107XG5cbiAgICAgICAgICAgIGlmIChsaW5lLmxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgICAgICAvLyBGaW5kIG1pZHBvaW50cyBvZiBlYWNoIGxpbmUgc2VnbWVudFxuICAgICAgICAgICAgICAgIC8vIEZvciBjbG9zZWQgcG9seWdvbnMsIGNhbGN1bGF0ZSBhbGwgbWlkcG9pbnRzIHNpbmNlIHNlZ21lbnRzIHdpbGwgd3JhcCBhcm91bmQgdG8gZmlyc3QgbWlkcG9pbnRcbiAgICAgICAgICAgICAgICB2YXIgbWlkID0gW107XG4gICAgICAgICAgICAgICAgdmFyIHAsIHBtYXg7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBwID0gMDsgLy8gc3RhcnQgb24gZmlyc3QgcG9pbnRcbiAgICAgICAgICAgICAgICAgICAgcG1heCA9IGxpbmUubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRm9yIG9wZW4gcG9seWdvbnMsIHNraXAgZmlyc3QgbWlkcG9pbnQgYW5kIHVzZSBsaW5lIHN0YXJ0IGluc3RlYWRcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcCA9IDE7IC8vIHN0YXJ0IG9uIHNlY29uZCBwb2ludFxuICAgICAgICAgICAgICAgICAgICBwbWF4ID0gbGluZS5sZW5ndGggLSAyO1xuICAgICAgICAgICAgICAgICAgICBtaWQucHVzaChsaW5lWzBdKTsgLy8gdXNlIGxpbmUgc3RhcnQgaW5zdGVhZCBvZiBmaXJzdCBtaWRwb2ludFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIENhbGMgbWlkcG9pbnRzXG4gICAgICAgICAgICAgICAgZm9yICg7IHAgPCBwbWF4OyBwKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhID0gbGluZVtwXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBiID0gbGluZVtwKzFdO1xuICAgICAgICAgICAgICAgICAgICBtaWQucHVzaChbKHBhWzBdICsgcGJbMF0pIC8gMiwgKHBhWzFdICsgcGJbMV0pIC8gMl0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFNhbWUgY2xvc2VkL29wZW4gcG9seWdvbiBsb2dpYyBhcyBhYm92ZToga2VlcCBsYXN0IG1pZHBvaW50IGZvciBjbG9zZWQsIHNraXAgZm9yIG9wZW5cbiAgICAgICAgICAgICAgICB2YXIgbW1heDtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5jbG9zZWRfcG9seWdvbiA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1tYXggPSBtaWQubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWlkLnB1c2gobGluZVtsaW5lLmxlbmd0aC0xXSk7IC8vIHVzZSBsaW5lIGVuZCBpbnN0ZWFkIG9mIGxhc3QgbWlkcG9pbnRcbiAgICAgICAgICAgICAgICAgICAgbW1heCA9IG1pZC5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE1ha2UgYW5jaG9ycyBieSBjb25uZWN0aW5nIG1pZHBvaW50cyB0byBsaW5lIGpvaW50c1xuICAgICAgICAgICAgICAgIGZvciAocD0wOyBwIDwgbW1heDsgcCsrKSAge1xuICAgICAgICAgICAgICAgICAgICBhbmNob3JzLnB1c2goW21pZFtwXSwgbGluZVsocCsxKSAlIGxpbmUubGVuZ3RoXSwgbWlkWyhwKzEpICUgbWlkLmxlbmd0aF1dKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBEZWdlbmVyYXRlIGNhc2UsIGEgMy1wb2ludCBsaW5lIGlzIGp1c3QgYSBzaW5nbGUgYW5jaG9yXG4gICAgICAgICAgICAgICAgYW5jaG9ycyA9IFtbbGluZVswXSwgbGluZVsxXSwgbGluZVsyXV1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBwPTA7IHAgPCBhbmNob3JzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLnJlbW92ZV90aWxlX2VkZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkQW5jaG9yKGFuY2hvcnNbcF1bMF0sIGFuY2hvcnNbcF1bMV0sIGFuY2hvcnNbcF1bMl0pO1xuICAgICAgICAgICAgICAgICAgICAvLyBidWlsZFNlZ21lbnQoYW5jaG9yc1twXVswXSwgYW5jaG9yc1twXVsxXSk7IC8vIHVzZSB0aGVzZSB0byBkcmF3IGV4dHJ1ZGVkIHNlZ21lbnRzIHcvbyBqb2luLCBmb3IgZGVidWdnaW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlZGdlMSA9IEdMQnVpbGRlcnMuaXNPblRpbGVFZGdlKGFuY2hvcnNbcF1bMF0sIGFuY2hvcnNbcF1bMV0pO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWRnZTIgPSBHTEJ1aWxkZXJzLmlzT25UaWxlRWRnZShhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlZGdlMSAmJiAhZWRnZTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQW5jaG9yKGFuY2hvcnNbcF1bMF0sIGFuY2hvcnNbcF1bMV0sIGFuY2hvcnNbcF1bMl0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFlZGdlMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRTZWdtZW50KGFuY2hvcnNbcF1bMF0sIGFuY2hvcnNbcF1bMV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFlZGdlMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRTZWdtZW50KGFuY2hvcnNbcF1bMV0sIGFuY2hvcnNbcF1bMl0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFNpbmdsZSAyLXBvaW50IHNlZ21lbnRcbiAgICAgICAgZWxzZSBpZiAobGluZS5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAgYnVpbGRTZWdtZW50KGxpbmVbMF0sIGxpbmVbMV0pOyAvLyBUT0RPOiByZXBsYWNlIGJ1aWxkU2VnbWVudCB3aXRoIGEgZGVnZW5lcmF0ZSBmb3JtIG9mIGJ1aWxkQW5jaG9yPyBidWlsZFNlZ21lbnQgaXMgc3RpbGwgdXNlZnVsIGZvciBkZWJ1Z2dpbmdcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBHTC5hZGRWZXJ0aWNlcyh2ZXJ0aWNlcywgdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuXG4gICAgLy8gQnVpbGQgdHJpYW5nbGVzIGZvciBhIHNpbmdsZSBsaW5lIHNlZ21lbnQsIGV4dHJ1ZGVkIGJ5IHRoZSBwcm92aWRlZCB3aWR0aFxuICAgIGZ1bmN0aW9uIGJ1aWxkU2VnbWVudCAocGEsIHBiKSB7XG4gICAgICAgIHZhciBzbG9wZSA9IFZlY3Rvci5ub3JtYWxpemUoWyhwYlsxXSAtIHBhWzFdKSAqIC0xLCBwYlswXSAtIHBhWzBdXSk7XG5cbiAgICAgICAgdmFyIHBhX291dGVyID0gW3BhWzBdICsgc2xvcGVbMF0gKiB3aWR0aC8yLCBwYVsxXSArIHNsb3BlWzFdICogd2lkdGgvMl07XG4gICAgICAgIHZhciBwYV9pbm5lciA9IFtwYVswXSAtIHNsb3BlWzBdICogd2lkdGgvMiwgcGFbMV0gLSBzbG9wZVsxXSAqIHdpZHRoLzJdO1xuXG4gICAgICAgIHZhciBwYl9vdXRlciA9IFtwYlswXSArIHNsb3BlWzBdICogd2lkdGgvMiwgcGJbMV0gKyBzbG9wZVsxXSAqIHdpZHRoLzJdO1xuICAgICAgICB2YXIgcGJfaW5uZXIgPSBbcGJbMF0gLSBzbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdIC0gc2xvcGVbMV0gKiB3aWR0aC8yXTtcblxuICAgICAgICB2ZXJ0aWNlcy5wdXNoKFxuICAgICAgICAgICAgcGJfaW5uZXIsIHBiX291dGVyLCBwYV9pbm5lcixcbiAgICAgICAgICAgIHBhX2lubmVyLCBwYl9vdXRlciwgcGFfb3V0ZXJcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBCdWlsZCB0cmlhbmdsZXMgZm9yIGEgMy1wb2ludCAnYW5jaG9yJyBzaGFwZSwgY29uc2lzdGluZyBvZiB0d28gbGluZSBzZWdtZW50cyB3aXRoIGEgam9pbnRcbiAgICAvLyBUT0RPOiBtb3ZlIHRoZXNlIGZ1bmN0aW9ucyBvdXQgb2YgY2xvc3VyZXM/XG4gICAgZnVuY3Rpb24gYnVpbGRBbmNob3IgKHBhLCBqb2ludCwgcGIpIHtcbiAgICAgICAgLy8gSW5uZXIgYW5kIG91dGVyIGxpbmUgc2VnbWVudHMgZm9yIFtwYSwgam9pbnRdIGFuZCBbam9pbnQsIHBiXVxuICAgICAgICB2YXIgcGFfc2xvcGUgPSBWZWN0b3Iubm9ybWFsaXplKFsoam9pbnRbMV0gLSBwYVsxXSkgKiAtMSwgam9pbnRbMF0gLSBwYVswXV0pO1xuICAgICAgICB2YXIgcGFfb3V0ZXIgPSBbXG4gICAgICAgICAgICBbcGFbMF0gKyBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdICsgcGFfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtqb2ludFswXSArIHBhX3Nsb3BlWzBdICogd2lkdGgvMiwgam9pbnRbMV0gKyBwYV9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG4gICAgICAgIHZhciBwYV9pbm5lciA9IFtcbiAgICAgICAgICAgIFtwYVswXSAtIHBhX3Nsb3BlWzBdICogd2lkdGgvMiwgcGFbMV0gLSBwYV9zbG9wZVsxXSAqIHdpZHRoLzJdLFxuICAgICAgICAgICAgW2pvaW50WzBdIC0gcGFfc2xvcGVbMF0gKiB3aWR0aC8yLCBqb2ludFsxXSAtIHBhX3Nsb3BlWzFdICogd2lkdGgvMl1cbiAgICAgICAgXTtcblxuICAgICAgICB2YXIgcGJfc2xvcGUgPSBWZWN0b3Iubm9ybWFsaXplKFsocGJbMV0gLSBqb2ludFsxXSkgKiAtMSwgcGJbMF0gLSBqb2ludFswXV0pO1xuICAgICAgICB2YXIgcGJfb3V0ZXIgPSBbXG4gICAgICAgICAgICBbam9pbnRbMF0gKyBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdICsgcGJfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtwYlswXSArIHBiX3Nsb3BlWzBdICogd2lkdGgvMiwgcGJbMV0gKyBwYl9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG4gICAgICAgIHZhciBwYl9pbm5lciA9IFtcbiAgICAgICAgICAgIFtqb2ludFswXSAtIHBiX3Nsb3BlWzBdICogd2lkdGgvMiwgam9pbnRbMV0gLSBwYl9zbG9wZVsxXSAqIHdpZHRoLzJdLFxuICAgICAgICAgICAgW3BiWzBdIC0gcGJfc2xvcGVbMF0gKiB3aWR0aC8yLCBwYlsxXSAtIHBiX3Nsb3BlWzFdICogd2lkdGgvMl1cbiAgICAgICAgXTtcblxuICAgICAgICAvLyBNaXRlciBqb2luIC0gc29sdmUgZm9yIHRoZSBpbnRlcnNlY3Rpb24gYmV0d2VlbiB0aGUgdHdvIG91dGVyIGxpbmUgc2VnbWVudHNcbiAgICAgICAgdmFyIGludGVyc2VjdGlvbiA9IFZlY3Rvci5saW5lSW50ZXJzZWN0aW9uKHBhX291dGVyWzBdLCBwYV9vdXRlclsxXSwgcGJfb3V0ZXJbMF0sIHBiX291dGVyWzFdKTtcbiAgICAgICAgdmFyIGxpbmVfZGVidWcgPSBudWxsO1xuICAgICAgICBpZiAoaW50ZXJzZWN0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBpbnRlcnNlY3Rfb3V0ZXIgPSBpbnRlcnNlY3Rpb247XG5cbiAgICAgICAgICAgIC8vIENhcCB0aGUgaW50ZXJzZWN0aW9uIHBvaW50IHRvIGEgcmVhc29uYWJsZSBkaXN0YW5jZSAoYXMgam9pbiBhbmdsZSBiZWNvbWVzIHNoYXJwZXIsIG1pdGVyIGpvaW50IGRpc3RhbmNlIHdvdWxkIGFwcHJvYWNoIGluZmluaXR5KVxuICAgICAgICAgICAgdmFyIGxlbl9zcSA9IFZlY3Rvci5sZW5ndGhTcShbaW50ZXJzZWN0X291dGVyWzBdIC0gam9pbnRbMF0sIGludGVyc2VjdF9vdXRlclsxXSAtIGpvaW50WzFdXSk7XG4gICAgICAgICAgICB2YXIgbWl0ZXJfbGVuX21heCA9IDM7IC8vIG11bHRpcGxpZXIgb24gbGluZSB3aWR0aCBmb3IgbWF4IGRpc3RhbmNlIG1pdGVyIGpvaW4gY2FuIGJlIGZyb20gam9pbnRcbiAgICAgICAgICAgIGlmIChsZW5fc3EgPiAod2lkdGggKiB3aWR0aCAqIG1pdGVyX2xlbl9tYXggKiBtaXRlcl9sZW5fbWF4KSkge1xuICAgICAgICAgICAgICAgIGxpbmVfZGVidWcgPSAnZGlzdGFuY2UnO1xuICAgICAgICAgICAgICAgIGludGVyc2VjdF9vdXRlciA9IFZlY3Rvci5ub3JtYWxpemUoW2ludGVyc2VjdF9vdXRlclswXSAtIGpvaW50WzBdLCBpbnRlcnNlY3Rfb3V0ZXJbMV0gLSBqb2ludFsxXV0pO1xuICAgICAgICAgICAgICAgIGludGVyc2VjdF9vdXRlciA9IFtcbiAgICAgICAgICAgICAgICAgICAgam9pbnRbMF0gKyBpbnRlcnNlY3Rfb3V0ZXJbMF0gKiBtaXRlcl9sZW5fbWF4LFxuICAgICAgICAgICAgICAgICAgICBqb2ludFsxXSArIGludGVyc2VjdF9vdXRlclsxXSAqIG1pdGVyX2xlbl9tYXhcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBpbnRlcnNlY3RfaW5uZXIgPSBbXG4gICAgICAgICAgICAgICAgKGpvaW50WzBdIC0gaW50ZXJzZWN0X291dGVyWzBdKSArIGpvaW50WzBdLFxuICAgICAgICAgICAgICAgIChqb2ludFsxXSAtIGludGVyc2VjdF9vdXRlclsxXSkgKyBqb2ludFsxXVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3RfaW5uZXIsIGludGVyc2VjdF9vdXRlciwgcGFfaW5uZXJbMF0sXG4gICAgICAgICAgICAgICAgcGFfaW5uZXJbMF0sIGludGVyc2VjdF9vdXRlciwgcGFfb3V0ZXJbMF0sXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXSwgcGJfb3V0ZXJbMV0sIGludGVyc2VjdF9pbm5lcixcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3RfaW5uZXIsIHBiX291dGVyWzFdLCBpbnRlcnNlY3Rfb3V0ZXJcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBMaW5lIHNlZ21lbnRzIGFyZSBwYXJhbGxlbCwgdXNlIHRoZSBmaXJzdCBvdXRlciBsaW5lIHNlZ21lbnQgYXMgam9pbiBpbnN0ZWFkXG4gICAgICAgICAgICBsaW5lX2RlYnVnID0gJ3BhcmFsbGVsJztcbiAgICAgICAgICAgIHBhX2lubmVyWzFdID0gcGJfaW5uZXJbMF07XG4gICAgICAgICAgICBwYV9vdXRlclsxXSA9IHBiX291dGVyWzBdO1xuXG4gICAgICAgICAgICB2ZXJ0aWNlcy5wdXNoKFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzFdLCBwYV9vdXRlclsxXSwgcGFfaW5uZXJbMF0sXG4gICAgICAgICAgICAgICAgcGFfaW5uZXJbMF0sIHBhX291dGVyWzFdLCBwYV9vdXRlclswXSxcblxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzFdLCBwYl9vdXRlclsxXSwgcGJfaW5uZXJbMF0sXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMF0sIHBiX291dGVyWzFdLCBwYl9vdXRlclswXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEV4dHJ1ZGVkIGlubmVyL291dGVyIGVkZ2VzIC0gZGVidWdnaW5nXG4gICAgICAgIGlmIChHTEJ1aWxkZXJzLmRlYnVnICYmIG9wdGlvbnMudmVydGV4X2xpbmVzKSB7XG4gICAgICAgICAgICBvcHRpb25zLnZlcnRleF9saW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdWzBdLCBwYV9pbm5lclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG4gICAgICAgICAgICAgICAgcGFfaW5uZXJbMV1bMF0sIHBhX2lubmVyWzFdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcblxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzBdWzBdLCBwYl9pbm5lclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMV1bMF0sIHBiX2lubmVyWzFdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcblxuICAgICAgICAgICAgICAgIHBhX291dGVyWzBdWzBdLCBwYV9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG4gICAgICAgICAgICAgICAgcGFfb3V0ZXJbMV1bMF0sIHBhX291dGVyWzFdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcblxuICAgICAgICAgICAgICAgIHBiX291dGVyWzBdWzBdLCBwYl9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG4gICAgICAgICAgICAgICAgcGJfb3V0ZXJbMV1bMF0sIHBiX291dGVyWzFdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcblxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdWzBdLCBwYV9pbm5lclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG4gICAgICAgICAgICAgICAgcGFfb3V0ZXJbMF1bMF0sIHBhX291dGVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcblxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzFdWzBdLCBwYV9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG4gICAgICAgICAgICAgICAgcGFfb3V0ZXJbMV1bMF0sIHBhX291dGVyWzFdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcblxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzBdWzBdLCBwYl9pbm5lclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG4gICAgICAgICAgICAgICAgcGJfb3V0ZXJbMF1bMF0sIHBiX291dGVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcblxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzFdWzBdLCBwYl9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG4gICAgICAgICAgICAgICAgcGJfb3V0ZXJbMV1bMF0sIHBiX291dGVyWzFdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChHTEJ1aWxkZXJzLmRlYnVnICYmIGxpbmVfZGVidWcgJiYgb3B0aW9ucy52ZXJ0ZXhfbGluZXMpIHtcbiAgICAgICAgICAgIHZhciBkY29sb3I7XG4gICAgICAgICAgICBpZiAobGluZV9kZWJ1ZyA9PSAncGFyYWxsZWwnKSB7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCIhISEgbGluZXMgYXJlIHBhcmFsbGVsICEhIVwiKTtcbiAgICAgICAgICAgICAgICBkY29sb3IgPSBbMCwgMSwgMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChsaW5lX2RlYnVnID09ICdkaXN0YW5jZScpIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIiEhISBtaXRlciBpbnRlcnNlY3Rpb24gcG9pbnQgZXhjZWVkZWQgYWxsb3dlZCBkaXN0YW5jZSBmcm9tIGpvaW50ICEhIVwiKTtcbiAgICAgICAgICAgICAgICBkY29sb3IgPSBbMSwgMCwgMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnT1NNIGlkOiAnICsgZmVhdHVyZS5pZCk7IC8vIFRPRE86IGlmIHRoaXMgZnVuY3Rpb24gaXMgbW92ZWQgb3V0IG9mIGEgY2xvc3VyZSwgdGhpcyBmZWF0dXJlIGRlYnVnIGluZm8gd29uJ3QgYmUgYXZhaWxhYmxlXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhbcGEsIGpvaW50LCBwYl0pO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZmVhdHVyZSk7XG4gICAgICAgICAgICBvcHRpb25zLnZlcnRleF9saW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgIHBhWzBdLCBwYVsxXSwgeiArIDAuMDAyLFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIGRjb2xvclswXSwgZGNvbG9yWzFdLCBkY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgam9pbnRbMF0sIGpvaW50WzFdLCB6ICsgMC4wMDIsXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgZGNvbG9yWzBdLCBkY29sb3JbMV0sIGRjb2xvclsyXSxcbiAgICAgICAgICAgICAgICBqb2ludFswXSwgam9pbnRbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdLFxuICAgICAgICAgICAgICAgIHBiWzBdLCBwYlsxXSwgeiArIDAuMDAyLFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIGRjb2xvclswXSwgZGNvbG9yWzFdLCBkY29sb3JbMl1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHZhciBudW1fbGluZXMgPSBsaW5lcy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKHZhciBsbj0wOyBsbiA8IG51bV9saW5lczsgbG4rKykge1xuICAgICAgICAgICAgICAgIHZhciBsaW5lMiA9IGxpbmVzW2xuXTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIHA9MDsgcCA8IGxpbmUyLmxlbmd0aCAtIDE7IHArKykge1xuICAgICAgICAgICAgICAgICAgICAvLyBQb2ludCBBIHRvIEJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhID0gbGluZTJbcF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYiA9IGxpbmUyW3ArMV07XG5cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhWzBdLCBwYVsxXSwgeiArIDAuMDAwNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsIDAsIDEsIDAsIDAsIDEuMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBiWzBdLCBwYlsxXSwgeiArIDAuMDAwNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsIDAsIDEsIDAsIDAsIDEuMFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBCdWlsZCBhIHF1YWQgY2VudGVyZWQgb24gYSBwb2ludFxuLy8gWiBjb29yZCwgbm9ybWFscywgYW5kIHRleGNvb3JkcyBhcmUgb3B0aW9uYWxcbi8vIExheW91dCBvcmRlciBpczpcbi8vICAgcG9zaXRpb24gKDIgb3IgMyBjb21wb25lbnRzKVxuLy8gICB0ZXhjb29yZCAob3B0aW9uYWwsIDIgY29tcG9uZW50cylcbi8vICAgbm9ybWFsIChvcHRpb25hbCwgMyBjb21wb25lbnRzKVxuLy8gICBjb25zdGFudHMgKG9wdGlvbmFsKVxuR0xCdWlsZGVycy5idWlsZFF1YWRzRm9yUG9pbnRzID0gZnVuY3Rpb24gKHBvaW50cywgd2lkdGgsIGhlaWdodCwgeiwgdmVydGV4X2RhdGEsIG9wdGlvbnMpXG57XG4gICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIHZlcnRleF9jb25zdGFudHMgPSBbXTtcbiAgICBpZiAob3B0aW9ucy5ub3JtYWxzKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaCgwLCAwLCAxKTsgLy8gdXB3YXJkcy1mYWNpbmcgbm9ybWFsXG4gICAgfVxuICAgIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoLmFwcGx5KHZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuICAgIGlmICh2ZXJ0ZXhfY29uc3RhbnRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMgPSBudWxsO1xuICAgIH1cblxuICAgIHZhciBudW1fcG9pbnRzID0gcG9pbnRzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBwPTA7IHAgPCBudW1fcG9pbnRzOyBwKyspIHtcbiAgICAgICAgdmFyIHBvaW50ID0gcG9pbnRzW3BdO1xuXG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBbXG4gICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbiAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG5cbiAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG4gICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBBZGQgcHJvdmlkZWQgelxuICAgICAgICBpZiAoeiAhPSBudWxsKSB7XG4gICAgICAgICAgICBwb3NpdGlvbnNbMF1bMl0gPSB6O1xuICAgICAgICAgICAgcG9zaXRpb25zWzFdWzJdID0gejtcbiAgICAgICAgICAgIHBvc2l0aW9uc1syXVsyXSA9IHo7XG4gICAgICAgICAgICBwb3NpdGlvbnNbM11bMl0gPSB6O1xuICAgICAgICAgICAgcG9zaXRpb25zWzRdWzJdID0gejtcbiAgICAgICAgICAgIHBvc2l0aW9uc1s1XVsyXSA9IHo7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy50ZXhjb29yZHMgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIHRleGNvb3JkcyA9IFtcbiAgICAgICAgICAgICAgICBbLTEsIC0xXSxcbiAgICAgICAgICAgICAgICBbMSwgLTFdLFxuICAgICAgICAgICAgICAgIFsxLCAxXSxcblxuICAgICAgICAgICAgICAgIFstMSwgLTFdLFxuICAgICAgICAgICAgICAgIFsxLCAxXSxcbiAgICAgICAgICAgICAgICBbLTEsIDFdXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBHTC5hZGRWZXJ0aWNlc011bHRpcGxlQXR0cmlidXRlcyhbcG9zaXRpb25zLCB0ZXhjb29yZHNdLCB2ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBHTC5hZGRWZXJ0aWNlcyhwb3NpdGlvbnMsIHZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIENhbGxiYWNrLWJhc2UgYnVpbGRlciAoZm9yIGZ1dHVyZSBleHBsb3JhdGlvbilcbi8vIEdMQnVpbGRlcnMuYnVpbGRRdWFkc0ZvclBvaW50czIgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRRdWFkc0ZvclBvaW50cyAocG9pbnRzLCB3aWR0aCwgaGVpZ2h0LCBhZGRHZW9tZXRyeSwgb3B0aW9ucylcbi8vIHtcbi8vICAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbi8vICAgICB2YXIgbnVtX3BvaW50cyA9IHBvaW50cy5sZW5ndGg7XG4vLyAgICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvaW50czsgcCsrKSB7XG4vLyAgICAgICAgIHZhciBwb2ludCA9IHBvaW50c1twXTtcblxuLy8gICAgICAgICB2YXIgcG9zaXRpb25zID0gW1xuLy8gICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbi8vICAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbi8vICAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuLy8gICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG4vLyAgICAgICAgIF07XG5cbi8vICAgICAgICAgaWYgKG9wdGlvbnMudGV4Y29vcmRzID09IHRydWUpIHtcbi8vICAgICAgICAgICAgIHZhciB0ZXhjb29yZHMgPSBbXG4vLyAgICAgICAgICAgICAgICAgWy0xLCAtMV0sXG4vLyAgICAgICAgICAgICAgICAgWzEsIC0xXSxcbi8vICAgICAgICAgICAgICAgICBbMSwgMV0sXG5cbi8vICAgICAgICAgICAgICAgICBbLTEsIC0xXSxcbi8vICAgICAgICAgICAgICAgICBbMSwgMV0sXG4vLyAgICAgICAgICAgICAgICAgWy0xLCAxXVxuLy8gICAgICAgICAgICAgXTtcbi8vICAgICAgICAgfVxuXG4vLyAgICAgICAgIHZhciB2ZXJ0aWNlcyA9IHtcbi8vICAgICAgICAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxuLy8gICAgICAgICAgICAgbm9ybWFsczogKG9wdGlvbnMubm9ybWFscyA/IFswLCAwLCAxXSA6IG51bGwpLFxuLy8gICAgICAgICAgICAgdGV4Y29vcmRzOiAob3B0aW9ucy50ZXhjb29yZHMgJiYgdGV4Y29vcmRzKVxuLy8gICAgICAgICB9O1xuLy8gICAgICAgICBhZGRHZW9tZXRyeSh2ZXJ0aWNlcyk7XG4vLyAgICAgfVxuLy8gfTtcblxuLy8gQnVpbGQgbmF0aXZlIEdMIGxpbmVzIGZvciBhIHBvbHlsaW5lXG5HTEJ1aWxkZXJzLmJ1aWxkTGluZXMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRMaW5lcyAobGluZXMsIGZlYXR1cmUsIGxheWVyLCBzdHlsZSwgdGlsZSwgeiwgdmVydGV4X2RhdGEsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgY29sb3IgPSBzdHlsZS5jb2xvcjtcbiAgICB2YXIgd2lkdGggPSBzdHlsZS53aWR0aDtcblxuICAgIHZhciBudW1fbGluZXMgPSBsaW5lcy5sZW5ndGg7XG4gICAgZm9yICh2YXIgbG49MDsgbG4gPCBudW1fbGluZXM7IGxuKyspIHtcbiAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tsbl07XG5cbiAgICAgICAgZm9yICh2YXIgcD0wOyBwIDwgbGluZS5sZW5ndGggLSAxOyBwKyspIHtcbiAgICAgICAgICAgIC8vIFBvaW50IEEgdG8gQlxuICAgICAgICAgICAgdmFyIHBhID0gbGluZVtwXTtcbiAgICAgICAgICAgIHZhciBwYiA9IGxpbmVbcCsxXTtcblxuICAgICAgICAgICAgdmVydGV4X2RhdGEucHVzaChcbiAgICAgICAgICAgICAgICAvLyBQb2ludCBBXG4gICAgICAgICAgICAgICAgcGFbMF0sIHBhWzFdLCB6LFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIC8vIGZsYXQgc3VyZmFjZXMgcG9pbnQgc3RyYWlnaHQgdXBcbiAgICAgICAgICAgICAgICBjb2xvclswXSwgY29sb3JbMV0sIGNvbG9yWzJdLFxuICAgICAgICAgICAgICAgIC8vIFBvaW50IEJcbiAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHosXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgLy8gZmxhdCBzdXJmYWNlcyBwb2ludCBzdHJhaWdodCB1cFxuICAgICAgICAgICAgICAgIGNvbG9yWzBdLCBjb2xvclsxXSwgY29sb3JbMl1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLyogVXRpbGl0eSBmdW5jdGlvbnMgKi9cblxuLy8gVGVzdHMgaWYgYSBsaW5lIHNlZ21lbnQgKGZyb20gcG9pbnQgQSB0byBCKSBpcyBuZWFybHkgY29pbmNpZGVudCB3aXRoIHRoZSBlZGdlIG9mIGEgdGlsZVxuR0xCdWlsZGVycy5pc09uVGlsZUVkZ2UgPSBmdW5jdGlvbiAocGEsIHBiLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIHRvbGVyYW5jZV9mdW5jdGlvbiA9IG9wdGlvbnMudG9sZXJhbmNlX2Z1bmN0aW9uIHx8IEdMQnVpbGRlcnMudmFsdWVzV2l0aGluVG9sZXJhbmNlO1xuICAgIHZhciB0b2xlcmFuY2UgPSBvcHRpb25zLnRvbGVyYW5jZSB8fCAxOyAvLyB0d2VhayB0aGlzIGFkanVzdCBpZiBjYXRjaGluZyB0b28gZmV3L21hbnkgbGluZSBzZWdtZW50cyBuZWFyIHRpbGUgZWRnZXNcbiAgICB2YXIgdGlsZV9taW4gPSBHTEJ1aWxkZXJzLnRpbGVfYm91bmRzWzBdO1xuICAgIHZhciB0aWxlX21heCA9IEdMQnVpbGRlcnMudGlsZV9ib3VuZHNbMV07XG4gICAgdmFyIGVkZ2UgPSBudWxsO1xuXG4gICAgaWYgKHRvbGVyYW5jZV9mdW5jdGlvbihwYVswXSwgdGlsZV9taW4ueCwgdG9sZXJhbmNlKSAmJiB0b2xlcmFuY2VfZnVuY3Rpb24ocGJbMF0sIHRpbGVfbWluLngsIHRvbGVyYW5jZSkpIHtcbiAgICAgICAgZWRnZSA9ICdsZWZ0JztcbiAgICB9XG4gICAgZWxzZSBpZiAodG9sZXJhbmNlX2Z1bmN0aW9uKHBhWzBdLCB0aWxlX21heC54LCB0b2xlcmFuY2UpICYmIHRvbGVyYW5jZV9mdW5jdGlvbihwYlswXSwgdGlsZV9tYXgueCwgdG9sZXJhbmNlKSkge1xuICAgICAgICBlZGdlID0gJ3JpZ2h0JztcbiAgICB9XG4gICAgZWxzZSBpZiAodG9sZXJhbmNlX2Z1bmN0aW9uKHBhWzFdLCB0aWxlX21pbi55LCB0b2xlcmFuY2UpICYmIHRvbGVyYW5jZV9mdW5jdGlvbihwYlsxXSwgdGlsZV9taW4ueSwgdG9sZXJhbmNlKSkge1xuICAgICAgICBlZGdlID0gJ3RvcCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRvbGVyYW5jZV9mdW5jdGlvbihwYVsxXSwgdGlsZV9tYXgueSwgdG9sZXJhbmNlKSAmJiB0b2xlcmFuY2VfZnVuY3Rpb24ocGJbMV0sIHRpbGVfbWF4LnksIHRvbGVyYW5jZSkpIHtcbiAgICAgICAgZWRnZSA9ICdib3R0b20nO1xuICAgIH1cbiAgICByZXR1cm4gZWRnZTtcbn07XG5cbkdMQnVpbGRlcnMuc2V0VGlsZVNjYWxlID0gZnVuY3Rpb24gKHNjYWxlKVxue1xuICAgIEdMQnVpbGRlcnMudGlsZV9ib3VuZHMgPSBbXG4gICAgICAgIFBvaW50KDAsIDApLFxuICAgICAgICBQb2ludChzY2FsZSwgLXNjYWxlKSAvLyBUT0RPOiBjb3JyZWN0IGZvciBmbGlwcGVkIHktYXhpcz9cbiAgICBdO1xufTtcblxuR0xCdWlsZGVycy52YWx1ZXNXaXRoaW5Ub2xlcmFuY2UgPSBmdW5jdGlvbiAoYSwgYiwgdG9sZXJhbmNlKVxue1xuICAgIHRvbGVyYW5jZSA9IHRvbGVyYW5jZSB8fCAxO1xuICAgIHJldHVybiAoTWF0aC5hYnMoYSAtIGIpIDwgdG9sZXJhbmNlKTtcbn07XG5cbi8vIEJ1aWxkIGEgemlnemFnIGxpbmUgcGF0dGVybiBmb3IgdGVzdGluZyBqb2lucyBhbmQgY2Fwc1xuR0xCdWlsZGVycy5idWlsZFppZ3phZ0xpbmVUZXN0UGF0dGVybiA9IGZ1bmN0aW9uICgpXG57XG4gICAgdmFyIG1pbiA9IFBvaW50KDAsIDApOyAvLyB0aWxlLm1pbjtcbiAgICB2YXIgbWF4ID0gUG9pbnQoNDA5NiwgNDA5Nik7IC8vIHRpbGUubWF4O1xuICAgIHZhciBnID0ge1xuICAgICAgICBpZDogMTIzLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgICAgdHlwZTogJ0xpbmVTdHJpbmcnLFxuICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjc1ICsgbWF4LnggKiAwLjI1LCBtaW4ueSAqIDAuNzUgKyBtYXgueSAqIDAuMjVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNzUgKyBtYXgueCAqIDAuMjUsIG1pbi55ICogMC41ICsgbWF4LnkgKiAwLjVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuMjUgKyBtYXgueCAqIDAuNzUsIG1pbi55ICogMC43NSArIG1heC55ICogMC4yNV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC4yNSArIG1heC54ICogMC43NSwgbWluLnkgKiAwLjI1ICsgbWF4LnkgKiAwLjc1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjQgKyBtYXgueCAqIDAuNiwgbWluLnkgKiAwLjUgKyBtYXgueSAqIDAuNV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC41ICsgbWF4LnggKiAwLjUsIG1pbi55ICogMC4yNSArIG1heC55ICogMC43NV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC43NSArIG1heC54ICogMC4yNSwgbWluLnkgKiAwLjI1ICsgbWF4LnkgKiAwLjc1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjc1ICsgbWF4LnggKiAwLjI1LCBtaW4ueSAqIDAuNCArIG1heC55ICogMC42XVxuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBraW5kOiAnZGVidWcnXG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIGNvbnNvbGUubG9nKGcuZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xuICAgIHJldHVybiBnO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHTEJ1aWxkZXJzO1xufVxuIiwiLyoqKiBNYW5hZ2UgcmVuZGVyaW5nIGZvciBwcmltaXRpdmVzICoqKi9cbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wuanMnKTtcbnZhciBHTFZlcnRleExheW91dCA9IHJlcXVpcmUoJy4vZ2xfdmVydGV4X2xheW91dC5qcycpO1xuLy8gdmFyIEdMVmVydGV4QXJyYXlPYmplY3QgPSByZXF1aXJlKCcuL2dsX3Zhby5qcycpO1xudmFyIEdMUHJvZ3JhbSA9IHJlcXVpcmUoJy4vZ2xfcHJvZ3JhbS5qcycpO1xuXG4vLyBBIHNpbmdsZSBtZXNoL1ZCTywgZGVzY3JpYmVkIGJ5IGEgdmVydGV4IGxheW91dCwgdGhhdCBjYW4gYmUgZHJhd24gd2l0aCBvbmUgb3IgbW9yZSBwcm9ncmFtc1xuZnVuY3Rpb24gR0xHZW9tZXRyeSAoZ2wsIHZlcnRleF9kYXRhLCB2ZXJ0ZXhfbGF5b3V0LCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5nbCA9IGdsO1xuICAgIHRoaXMudmVydGV4X2RhdGEgPSB2ZXJ0ZXhfZGF0YTsgLy8gRmxvYXQzMkFycmF5XG4gICAgdGhpcy52ZXJ0ZXhfbGF5b3V0ID0gdmVydGV4X2xheW91dDtcbiAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgdGhpcy5kcmF3X21vZGUgPSBvcHRpb25zLmRyYXdfbW9kZSB8fCB0aGlzLmdsLlRSSUFOR0xFUztcbiAgICB0aGlzLmRhdGFfdXNhZ2UgPSBvcHRpb25zLmRhdGFfdXNhZ2UgfHwgdGhpcy5nbC5TVEFUSUNfRFJBVztcbiAgICB0aGlzLnZlcnRpY2VzX3Blcl9nZW9tZXRyeSA9IDM7IC8vIFRPRE86IHN1cHBvcnQgbGluZXMsIHN0cmlwLCBmYW4sIGV0Yy5cblxuICAgIHRoaXMudmVydGV4X2NvdW50ID0gdGhpcy52ZXJ0ZXhfZGF0YS5ieXRlTGVuZ3RoIC8gdGhpcy52ZXJ0ZXhfbGF5b3V0LnN0cmlkZTtcbiAgICB0aGlzLmdlb21ldHJ5X2NvdW50ID0gdGhpcy52ZXJ0ZXhfY291bnQgLyB0aGlzLnZlcnRpY2VzX3Blcl9nZW9tZXRyeTtcblxuICAgIC8vIFRPRE86IGRpc2FibGluZyBWQU9zIGZvciBub3cgYmVjYXVzZSB3ZSBuZWVkIHRvIHN1cHBvcnQgZGlmZmVyZW50IHZlcnRleCBsYXlvdXQgKyBwcm9ncmFtIGNvbWJpbmF0aW9ucyxcbiAgICAvLyB3aGVyZSBub3QgYWxsIHByb2dyYW1zIHdpbGwgcmVjb2duaXplIGFsbCBhdHRyaWJ1dGVzIChlLmcuIGZlYXR1cmUgc2VsZWN0aW9uIHNoYWRlcnMgaW5jbHVkZSBleHRyYSBhdHRyaWIpLlxuICAgIC8vIFRvIHN1cHBvcnQgVkFPcyBoZXJlLCB3b3VsZCBuZWVkIHRvIHN1cHBvcnQgbXVsdGlwbGUgcGVyIGdlb21ldHJ5LCBrZXllZCBieSBHTCBwcm9ncmFtP1xuICAgIC8vIHRoaXMudmFvID0gR0xWZXJ0ZXhBcnJheU9iamVjdC5jcmVhdGUoZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXIpO1xuICAgIC8vICAgICB0aGlzLnNldHVwKCk7XG4gICAgLy8gfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXIpO1xuICAgIHRoaXMuZ2wuYnVmZmVyRGF0YSh0aGlzLmdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhfZGF0YSwgdGhpcy5kYXRhX3VzYWdlKTtcbn1cblxuLy8gUmVuZGVyLCBieSBkZWZhdWx0IHdpdGggY3VycmVudGx5IGJvdW5kIHByb2dyYW0sIG9yIG90aGVyd2lzZSB3aXRoIG9wdGlvbmFsbHkgcHJvdmlkZWQgb25lXG5HTEdlb21ldHJ5LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAob3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIC8vIEdMVmVydGV4QXJyYXlPYmplY3QuYmluZCh0aGlzLnZhbyk7XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuX3JlbmRlcl9zZXR1cCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX3JlbmRlcl9zZXR1cCgpO1xuICAgIH1cblxuICAgIHZhciBnbF9wcm9ncmFtID0gb3B0aW9ucy5nbF9wcm9ncmFtIHx8IEdMUHJvZ3JhbS5jdXJyZW50O1xuICAgIGdsX3Byb2dyYW0udXNlKCk7XG5cbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICB0aGlzLnZlcnRleF9sYXlvdXQuZW5hYmxlKHRoaXMuZ2wsIGdsX3Byb2dyYW0pO1xuXG4gICAgLy8gVE9ETzogc3VwcG9ydCBlbGVtZW50IGFycmF5IG1vZGVcbiAgICB0aGlzLmdsLmRyYXdBcnJheXModGhpcy5kcmF3X21vZGUsIDAsIHRoaXMudmVydGV4X2NvdW50KTtcbiAgICAvLyBHTFZlcnRleEFycmF5T2JqZWN0LmJpbmQobnVsbCk7XG59O1xuXG5HTEdlb21ldHJ5LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKClcbntcbiAgICBjb25zb2xlLmxvZyhcIkdMR2VvbWV0cnkuZGVzdHJveTogZGVsZXRlIGJ1ZmZlciBvZiBzaXplIFwiICsgdGhpcy52ZXJ0ZXhfZGF0YS5ieXRlTGVuZ3RoKTtcbiAgICB0aGlzLmdsLmRlbGV0ZUJ1ZmZlcih0aGlzLmJ1ZmZlcik7XG4gICAgZGVsZXRlIHRoaXMudmVydGV4X2RhdGE7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdMR2VvbWV0cnk7XG59XG4iLCIvLyBSZW5kZXJpbmcgbW9kZXNcblxudmFyIEdMID0gcmVxdWlyZSgnLi9nbC5qcycpO1xudmFyIEdMQnVpbGRlcnMgPSByZXF1aXJlKCcuL2dsX2J1aWxkZXJzLmpzJyk7XG52YXIgR0xHZW9tZXRyeSA9IHJlcXVpcmUoJy4vZ2xfZ2VvbS5qcycpO1xudmFyIEdMVmVydGV4TGF5b3V0ID0gcmVxdWlyZSgnLi9nbF92ZXJ0ZXhfbGF5b3V0LmpzJyk7XG52YXIgR0xQcm9ncmFtID0gcmVxdWlyZSgnLi9nbF9wcm9ncmFtLmpzJyk7XG52YXIgR0xUZXh0dXJlID0gcmVxdWlyZSgnLi9nbF90ZXh0dXJlLmpzJyk7XG52YXIgc2hhZGVyX3NvdXJjZXMgPSByZXF1aXJlKCcuL2dsX3NoYWRlcnMuanMnKTsgLy8gYnVpbHQtaW4gc2hhZGVyc1xuXG4vLyBCYXNlXG5cbnZhciBSZW5kZXJNb2RlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uIChnbCkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMubWFrZUdMUHJvZ3JhbSgpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5faW5pdCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5tYWtlR0xQcm9ncmFtKCk7XG4gICAgfSxcbiAgICBkZWZpbmVzOiB7fSxcbiAgICBzZWxlY3Rpb246IGZhbHNlLFxuICAgIGJ1aWxkUG9seWdvbnM6IGZ1bmN0aW9uKCl7fSwgLy8gYnVpbGQgZnVuY3Rpb25zIGFyZSBuby1vcHMgdW50aWwgb3ZlcnJpZGVuXG4gICAgYnVpbGRMaW5lczogZnVuY3Rpb24oKXt9LFxuICAgIGJ1aWxkUG9pbnRzOiBmdW5jdGlvbigpe30sXG4gICAgbWFrZUdMR2VvbWV0cnk6IGZ1bmN0aW9uICh2ZXJ0ZXhfZGF0YSkge1xuICAgICAgICByZXR1cm4gbmV3IEdMR2VvbWV0cnkodGhpcy5nbCwgdmVydGV4X2RhdGEsIHRoaXMudmVydGV4X2xheW91dCk7XG4gICAgfVxufTtcblxuUmVuZGVyTW9kZS5tYWtlR0xQcm9ncmFtID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBBZGQgYW55IGN1c3RvbSBkZWZpbmVzIHRvIGJ1aWx0LWluIG1vZGUgZGVmaW5lc1xuICAgIHZhciBkZWZpbmVzID0ge307IC8vIGNyZWF0ZSBhIG5ldyBvYmplY3QgdG8gYXZvaWQgbXV0YXRpbmcgYSBwcm90b3R5cGUgdmFsdWUgdGhhdCBtYXkgYmUgc2hhcmVkIHdpdGggb3RoZXIgbW9kZXNcbiAgICBpZiAodGhpcy5kZWZpbmVzICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgZCBpbiB0aGlzLmRlZmluZXMpIHtcbiAgICAgICAgICAgIGRlZmluZXNbZF0gPSB0aGlzLmRlZmluZXNbZF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuc2hhZGVycyAhPSBudWxsICYmIHRoaXMuc2hhZGVycy5kZWZpbmVzICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgZCBpbiB0aGlzLnNoYWRlcnMuZGVmaW5lcykge1xuICAgICAgICAgICAgZGVmaW5lc1tkXSA9IHRoaXMuc2hhZGVycy5kZWZpbmVzW2RdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWx0ZXIgZGVmaW5lcyBmb3Igc2VsZWN0aW9uIChuZWVkIHRvIGNyZWF0ZSBhIG5ldyBvYmplY3Qgc2luY2UgdGhlIGZpcnN0IGlzIHN0b3JlZCBhcyBhIHJlZmVyZW5jZSBieSB0aGUgcHJvZ3JhbSlcbiAgICBpZiAodGhpcy5zZWxlY3Rpb24pIHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbl9kZWZpbmVzID0gT2JqZWN0LmNyZWF0ZShkZWZpbmVzKTtcbiAgICAgICAgc2VsZWN0aW9uX2RlZmluZXNbJ0ZFQVRVUkVfU0VMRUNUSU9OJ10gPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIEdldCBhbnkgY3VzdG9tIGNvZGUgdHJhbnNmb3Jtc1xuICAgIHZhciB0cmFuc2Zvcm1zID0gKHRoaXMuc2hhZGVycyAmJiB0aGlzLnNoYWRlcnMudHJhbnNmb3Jtcyk7XG5cbiAgICAvLyBDcmVhdGUgc2hhZGVyIGZyb20gY3VzdG9tIFVSTHNcbiAgICBpZiAodGhpcy5zaGFkZXJzICYmIHRoaXMuc2hhZGVycy52ZXJ0ZXhfdXJsICYmIHRoaXMuc2hhZGVycy5mcmFnbWVudF91cmwpIHtcbiAgICAgICAgdGhpcy5nbF9wcm9ncmFtID0gR0xQcm9ncmFtLmNyZWF0ZVByb2dyYW1Gcm9tVVJMcyhcbiAgICAgICAgICAgIHRoaXMuZ2wsXG4gICAgICAgICAgICB0aGlzLnNoYWRlcnMudmVydGV4X3VybCxcbiAgICAgICAgICAgIHRoaXMuc2hhZGVycy5mcmFnbWVudF91cmwsXG4gICAgICAgICAgICB7IGRlZmluZXM6IGRlZmluZXMsIHRyYW5zZm9ybXM6IHRyYW5zZm9ybXMsIG5hbWU6IHRoaXMubmFtZSB9XG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGlvbl9nbF9wcm9ncmFtID0gbmV3IEdMUHJvZ3JhbShcbiAgICAgICAgICAgICAgICB0aGlzLmdsLFxuICAgICAgICAgICAgICAgIHRoaXMuZ2xfcHJvZ3JhbS52ZXJ0ZXhfc2hhZGVyX3NvdXJjZSxcbiAgICAgICAgICAgICAgICBzaGFkZXJfc291cmNlc1snc2VsZWN0aW9uX2ZyYWdtZW50J10sXG4gICAgICAgICAgICAgICAgeyBkZWZpbmVzOiBzZWxlY3Rpb25fZGVmaW5lcywgdHJhbnNmb3JtczogdHJhbnNmb3JtcywgbmFtZTogKHRoaXMubmFtZSArICcgKHNlbGVjdGlvbiknKSB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIENyZWF0ZSBzaGFkZXIgZnJvbSBidWlsdC1pbiBzb3VyY2VcbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5nbF9wcm9ncmFtID0gbmV3IEdMUHJvZ3JhbShcbiAgICAgICAgICAgIHRoaXMuZ2wsXG4gICAgICAgICAgICBzaGFkZXJfc291cmNlc1t0aGlzLnZlcnRleF9zaGFkZXJfa2V5XSxcbiAgICAgICAgICAgIHNoYWRlcl9zb3VyY2VzW3RoaXMuZnJhZ21lbnRfc2hhZGVyX2tleV0sXG4gICAgICAgICAgICB7IGRlZmluZXM6IGRlZmluZXMsIHRyYW5zZm9ybXM6IHRyYW5zZm9ybXMsIG5hbWU6IHRoaXMubmFtZSB9XG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGlvbl9nbF9wcm9ncmFtID0gbmV3IEdMUHJvZ3JhbShcbiAgICAgICAgICAgICAgICB0aGlzLmdsLFxuICAgICAgICAgICAgICAgIHNoYWRlcl9zb3VyY2VzW3RoaXMudmVydGV4X3NoYWRlcl9rZXldLFxuICAgICAgICAgICAgICAgIHNoYWRlcl9zb3VyY2VzWydzZWxlY3Rpb25fZnJhZ21lbnQnXSxcbiAgICAgICAgICAgICAgICB7IGRlZmluZXM6IHNlbGVjdGlvbl9kZWZpbmVzLCB0cmFuc2Zvcm1zOiB0cmFuc2Zvcm1zLCBuYW1lOiAodGhpcy5uYW1lICsgJyAoc2VsZWN0aW9uKScpIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgfVxuICAgIH1cbn07XG5cbi8vIFRPRE86IG1ha2UgdGhpcyBhIGdlbmVyaWMgT1JNLWxpa2UgZmVhdHVyZSBmb3Igc2V0dGluZyB1bmlmb3JtcyB2aWEgSlMgb2JqZWN0cyBvbiBHTFByb2dyYW1cblJlbmRlck1vZGUuc2V0VW5pZm9ybXMgPSBmdW5jdGlvbiAob3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgZ2xfcHJvZ3JhbSA9IEdMUHJvZ3JhbS5jdXJyZW50OyAvLyBvcGVyYXRlIG9uIGN1cnJlbnRseSBib3VuZCBwcm9ncmFtXG5cbiAgICAvLyBUT0RPOiBvbmx5IHVwZGF0ZSB1bmlmb3JtcyB3aGVuIGNoYW5nZWRcbiAgICBpZiAodGhpcy5zaGFkZXJzICE9IG51bGwgJiYgdGhpcy5zaGFkZXJzLnVuaWZvcm1zICE9IG51bGwpIHtcbiAgICAgICAgdmFyIHRleHR1cmVfdW5pdCA9IDA7XG5cbiAgICAgICAgZm9yICh2YXIgdSBpbiB0aGlzLnNoYWRlcnMudW5pZm9ybXMpIHtcbiAgICAgICAgICAgIHZhciB1bmlmb3JtID0gdGhpcy5zaGFkZXJzLnVuaWZvcm1zW3VdO1xuXG4gICAgICAgICAgICAvLyBTaW5nbGUgZmxvYXRcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdW5pZm9ybSA9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCB1LCB1bmlmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE11bHRpcGxlIGZsb2F0cyAtIHZlY3RvciBvciBhcnJheVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHVuaWZvcm0gPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAvLyBmbG9hdCB2ZWN0b3JzICh2ZWMyLCB2ZWMzLCB2ZWM0KVxuICAgICAgICAgICAgICAgIGlmICh1bmlmb3JtLmxlbmd0aCA+PSAyICYmIHVuaWZvcm0ubGVuZ3RoIDw9IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKHVuaWZvcm0ubGVuZ3RoICsgJ2Z2JywgdSwgdW5pZm9ybSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGZsb2F0IGFycmF5XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodW5pZm9ybS5sZW5ndGggPiA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWZ2JywgdSArICdbMF0nLCB1bmlmb3JtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogYXNzdW1lIG1hdHJpeCBmb3IgKHR5cGVvZiA9PSBGbG9hdDMyQXJyYXkgJiYgbGVuZ3RoID09IDE2KT9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEJvb2xlYW5cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiB0aGlzLnNoYWRlcnMudW5pZm9ybXNbdV0gPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxaScsIHUsIHVuaWZvcm0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGV4dHVyZVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHVuaWZvcm0gPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGV4dHVyZSA9IEdMVGV4dHVyZS50ZXh0dXJlc1t1bmlmb3JtXTtcbiAgICAgICAgICAgICAgICBpZiAodGV4dHVyZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRleHR1cmUgPSBuZXcgR0xUZXh0dXJlKHRoaXMuZ2wsIHVuaWZvcm0pO1xuICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmxvYWQodW5pZm9ybSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGV4dHVyZS5iaW5kKHRleHR1cmVfdW5pdCk7XG4gICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxaScsIHUsIHRleHR1cmVfdW5pdCk7XG4gICAgICAgICAgICAgICAgdGV4dHVyZV91bml0Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUT0RPOiBzdXBwb3J0IG90aGVyIG5vbi1mbG9hdCB0eXBlcz8gKGludCwgZXRjLilcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblJlbmRlck1vZGUudXBkYXRlID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBNb2RlLXNwZWNpZmljIGFuaW1hdGlvblxuICAgIGlmICh0eXBlb2YgdGhpcy5hbmltYXRpb24gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbigpO1xuICAgIH1cbn07XG5cblxudmFyIE1vZGVzID0ge307XG52YXIgTW9kZU1hbmFnZXIgPSB7fTtcblxuLy8gVXBkYXRlIGJ1aWx0LWluIG1vZGUgb3IgY3JlYXRlIGEgbmV3IG9uZVxuTW9kZU1hbmFnZXIuY29uZmlndXJlTW9kZSA9IGZ1bmN0aW9uIChuYW1lLCBzZXR0aW5ncylcbntcbiAgICBNb2Rlc1tuYW1lXSA9IE1vZGVzW25hbWVdIHx8IE9iamVjdC5jcmVhdGUoTW9kZXNbc2V0dGluZ3MuZXh0ZW5kc10gfHwgUmVuZGVyTW9kZSk7XG4gICAgaWYgKE1vZGVzW3NldHRpbmdzLmV4dGVuZHNdKSB7XG4gICAgICAgIE1vZGVzW25hbWVdLnBhcmVudCA9IE1vZGVzW3NldHRpbmdzLmV4dGVuZHNdOyAvLyBleHBsaWNpdCAnc3VwZXInIGNsYXNzIGFjY2Vzc1xuICAgIH1cblxuICAgIGZvciAodmFyIHMgaW4gc2V0dGluZ3MpIHtcbiAgICAgICAgTW9kZXNbbmFtZV1bc10gPSBzZXR0aW5nc1tzXTtcbiAgICB9XG5cbiAgICBNb2Rlc1tuYW1lXS5uYW1lID0gbmFtZTtcbiAgICByZXR1cm4gTW9kZXNbbmFtZV07XG59O1xuXG5cbi8vIEJ1aWx0LWluIHJlbmRlcmluZyBtb2Rlc1xuXG4vKioqIFBsYWluIHBvbHlnb25zICoqKi9cblxuTW9kZXMucG9seWdvbnMgPSBPYmplY3QuY3JlYXRlKFJlbmRlck1vZGUpO1xuTW9kZXMucG9seWdvbnMubmFtZSA9ICdwb2x5Z29ucyc7XG5cbk1vZGVzLnBvbHlnb25zLnZlcnRleF9zaGFkZXJfa2V5ID0gJ3BvbHlnb25fdmVydGV4Jztcbk1vZGVzLnBvbHlnb25zLmZyYWdtZW50X3NoYWRlcl9rZXkgPSAncG9seWdvbl9mcmFnbWVudCc7XG5cbk1vZGVzLnBvbHlnb25zLmRlZmluZXMgPSB7XG4gICAgJ1dPUkxEX1BPU0lUSU9OX1dSQVAnOiAxMDAwMDAgLy8gZGVmYXVsdCB3b3JsZCBjb29yZHMgdG8gd3JhcCBldmVyeSAxMDAsMDAwIG1ldGVycywgY2FuIHR1cm4gb2ZmIGJ5IHNldHRpbmcgdGhpcyB0byAnZmFsc2UnXG59O1xuXG5Nb2Rlcy5wb2x5Z29ucy5zZWxlY3Rpb24gPSB0cnVlO1xuXG5Nb2Rlcy5wb2x5Z29ucy5faW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZlcnRleF9sYXlvdXQgPSBuZXcgR0xWZXJ0ZXhMYXlvdXQodGhpcy5nbCwgW1xuICAgICAgICB7IG5hbWU6ICdhX3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9ub3JtYWwnLCBzaXplOiAzLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9zZWxlY3Rpb25fY29sb3InLCBzaXplOiA0LCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgc2l6ZTogMSwgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuICAgIF0pO1xufTtcblxuTW9kZXMucG9seWdvbnMuYnVpbGRQb2x5Z29ucyA9IGZ1bmN0aW9uIChwb2x5Z29ucywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgLy8gT3V0bGluZXMgaGF2ZSBhIHNsaWdodGx5IGRpZmZlcmVudCBzZXQgb2YgY29uc3RhbnRzLCBiZWNhdXNlIHRoZSBsYXllciBudW1iZXIgaXMgbW9kaWZpZWRcbiAgICBpZiAoc3R5bGUub3V0bGluZS5jb2xvcikge1xuICAgICAgICB2YXIgb3V0bGluZV92ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICAgICAgc3R5bGUub3V0bGluZS5jb2xvclswXSwgc3R5bGUub3V0bGluZS5jb2xvclsxXSwgc3R5bGUub3V0bGluZS5jb2xvclsyXSxcbiAgICAgICAgICAgIHN0eWxlLnNlbGVjdGlvbi5jb2xvclswXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzFdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMl0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclszXSxcbiAgICAgICAgICAgIHN0eWxlLmxheWVyX251bSAtIDAuNSAvLyBvdXRsaW5lcyBzaXQgYmV0d2VlbiBsYXllcnMsIHVuZGVybmVhdGggY3VycmVudCBsYXllciBidXQgYWJvdmUgdGhlIG9uZSBiZWxvd1xuICAgICAgICBdO1xuICAgIH1cblxuICAgIC8vIEV4dHJ1ZGVkIHBvbHlnb25zIChlLmcuIDNEIGJ1aWxkaW5ncylcbiAgICBpZiAoc3R5bGUuZXh0cnVkZSAmJiBzdHlsZS5oZWlnaHQpIHtcbiAgICAgICAgR0xCdWlsZGVycy5idWlsZEV4dHJ1ZGVkUG9seWdvbnMoXG4gICAgICAgICAgICBwb2x5Z29ucyxcbiAgICAgICAgICAgIHN0eWxlLnosXG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQsXG4gICAgICAgICAgICBzdHlsZS5taW5faGVpZ2h0LFxuICAgICAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbiAgICAvLyBSZWd1bGFyIHBvbHlnb25zXG4gICAgZWxzZSB7XG4gICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5Z29ucyhcbiAgICAgICAgICAgIHBvbHlnb25zLFxuICAgICAgICAgICAgc3R5bGUueixcbiAgICAgICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5vcm1hbHM6IHRydWUsXG4gICAgICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIENhbGxiYWNrLWJhc2UgYnVpbGRlciAoZm9yIGZ1dHVyZSBleHBsb3JhdGlvbilcbiAgICAgICAgLy8gdmFyIG5vcm1hbF92ZXJ0ZXhfY29uc3RhbnRzID0gWzAsIDAsIDFdLmNvbmNhdCh2ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICAgICAgLy8gR0xCdWlsZGVycy5idWlsZFBvbHlnb25zMihcbiAgICAgICAgLy8gICAgIHBvbHlnb25zLFxuICAgICAgICAvLyAgICAgeixcbiAgICAgICAgLy8gICAgIGZ1bmN0aW9uICh2ZXJ0aWNlcykge1xuICAgICAgICAvLyAgICAgICAgIC8vIHZhciB2cyA9IHZlcnRpY2VzLnBvc2l0aW9ucztcbiAgICAgICAgLy8gICAgICAgICAvLyBmb3IgKHZhciB2IGluIHZzKSB7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vIHZhciBiYyA9IFsodiAlIDMpID8gMCA6IDEsICgodiArIDEpICUgMykgPyAwIDogMSwgKCh2ICsgMikgJSAzKSA/IDAgOiAxXTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgLy8gdmFyIGJjID0gW2NlbnRyb2lkLngsIGNlbnRyb2lkLnksIDBdO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAvLyB2c1t2XSA9IHZlcnRpY2VzLnBvc2l0aW9uc1t2XS5jb25jYXQoeiwgMCwgMCwgMSwgYmMpO1xuXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vIHZzW3ZdID0gdmVydGljZXMucG9zaXRpb25zW3ZdLmNvbmNhdCh6LCAwLCAwLCAxKTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgdnNbdl0gPSB2ZXJ0aWNlcy5wb3NpdGlvbnNbdl0uY29uY2F0KDAsIDAsIDEpO1xuICAgICAgICAvLyAgICAgICAgIC8vIH1cblxuICAgICAgICAvLyAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLnBvc2l0aW9ucywgbm9ybWFsX3ZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcblxuICAgICAgICAvLyAgICAgICAgIC8vIEdMLmFkZFZlcnRpY2VzQnlBdHRyaWJ1dGVMYXlvdXQoXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIFtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHsgbmFtZTogJ2FfcG9zaXRpb24nLCBkYXRhOiB2ZXJ0aWNlcy5wb3NpdGlvbnMgfSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHsgbmFtZTogJ2Ffbm9ybWFsJywgZGF0YTogWzAsIDAsIDFdIH0sXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgZGF0YTogW3N0eWxlLmNvbG9yWzBdLCBzdHlsZS5jb2xvclsxXSwgc3R5bGUuY29sb3JbMl1dIH0sXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgZGF0YTogc3R5bGUubGF5ZXJfbnVtIH1cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgXSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgdmVydGV4X2RhdGFcbiAgICAgICAgLy8gICAgICAgICAvLyApO1xuXG4gICAgICAgIC8vICAgICAgICAgLy8gR0wuYWRkVmVydGljZXNNdWx0aXBsZUF0dHJpYnV0ZXMoW3ZlcnRpY2VzLnBvc2l0aW9uc10sIG5vcm1hbF92ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICk7XG4gICAgfVxuXG4gICAgLy8gUG9seWdvbiBvdXRsaW5lc1xuICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yICYmIHN0eWxlLm91dGxpbmUud2lkdGgpIHtcbiAgICAgICAgZm9yICh2YXIgbXBjPTA7IG1wYyA8IHBvbHlnb25zLmxlbmd0aDsgbXBjKyspIHtcbiAgICAgICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMoXG4gICAgICAgICAgICAgICAgcG9seWdvbnNbbXBjXSxcbiAgICAgICAgICAgICAgICBzdHlsZS56LFxuICAgICAgICAgICAgICAgIHN0eWxlLm91dGxpbmUud2lkdGgsXG4gICAgICAgICAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjbG9zZWRfcG9seWdvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlX3RpbGVfZWRnZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IG91dGxpbmVfdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5Nb2Rlcy5wb2x5Z29ucy5idWlsZExpbmVzID0gZnVuY3Rpb24gKGxpbmVzLCBzdHlsZSwgdmVydGV4X2RhdGEpXG57XG4gICAgLy8gVE9PRDogcmVkdWNlIHJlZHVuZGFuY3kgb2YgY29uc3RhbnQgY2FsYyBiZXR3ZWVuIGJ1aWxkZXJzXG4gICAgLy8gQ29sb3IgYW5kIGxheWVyIG51bWJlciBhcmUgY3VycmVudGx5IGNvbnN0YW50IGFjcm9zcyB2ZXJ0aWNlc1xuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICBzdHlsZS5jb2xvclswXSwgc3R5bGUuY29sb3JbMV0sIHN0eWxlLmNvbG9yWzJdLFxuICAgICAgICBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMF0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsxXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzJdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbM10sXG4gICAgICAgIHN0eWxlLmxheWVyX251bVxuICAgIF07XG5cbiAgICAvLyBPdXRsaW5lcyBoYXZlIGEgc2xpZ2h0bHkgZGlmZmVyZW50IHNldCBvZiBjb25zdGFudHMsIGJlY2F1c2UgdGhlIGxheWVyIG51bWJlciBpcyBtb2RpZmllZFxuICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yKSB7XG4gICAgICAgIHZhciBvdXRsaW5lX3ZlcnRleF9jb25zdGFudHMgPSBbXG4gICAgICAgICAgICBzdHlsZS5vdXRsaW5lLmNvbG9yWzBdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzFdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzJdLFxuICAgICAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICAgICAgc3R5bGUubGF5ZXJfbnVtIC0gMC41IC8vIG91dGxpbmVzIHNpdCBiZXR3ZWVuIGxheWVycywgdW5kZXJuZWF0aCBjdXJyZW50IGxheWVyIGJ1dCBhYm92ZSB0aGUgb25lIGJlbG93XG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgLy8gTWFpbiBsaW5lc1xuICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMoXG4gICAgICAgIGxpbmVzLFxuICAgICAgICBzdHlsZS56LFxuICAgICAgICBzdHlsZS53aWR0aCxcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IHZlcnRleF9jb25zdGFudHNcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBMaW5lIG91dGxpbmVzXG4gICAgaWYgKHN0eWxlLm91dGxpbmUuY29sb3IgJiYgc3R5bGUub3V0bGluZS53aWR0aCkge1xuICAgICAgICBHTEJ1aWxkZXJzLmJ1aWxkUG9seWxpbmVzKFxuICAgICAgICAgICAgbGluZXMsXG4gICAgICAgICAgICBzdHlsZS56LFxuICAgICAgICAgICAgc3R5bGUud2lkdGggKyAyICogc3R5bGUub3V0bGluZS53aWR0aCxcbiAgICAgICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IG91dGxpbmVfdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbn07XG5cbk1vZGVzLnBvbHlnb25zLmJ1aWxkUG9pbnRzID0gZnVuY3Rpb24gKHBvaW50cywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIFRPT0Q6IHJlZHVjZSByZWR1bmRhbmN5IG9mIGNvbnN0YW50IGNhbGMgYmV0d2VlbiBidWlsZGVyc1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgR0xCdWlsZGVycy5idWlsZFF1YWRzRm9yUG9pbnRzKFxuICAgICAgICBwb2ludHMsXG4gICAgICAgIHN0eWxlLnNpemUgKiAyLFxuICAgICAgICBzdHlsZS5zaXplICogMixcbiAgICAgICAgc3R5bGUueixcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5vcm1hbHM6IHRydWUsXG4gICAgICAgICAgICB0ZXhjb29yZHM6IGZhbHNlLFxuICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICB9XG4gICAgKTtcbn07XG5cblxuLyoqKiBQb2ludHMgdy9zaW1wbGUgZGlzdGFuY2UgZmllbGQgcmVuZGVyaW5nICoqKi9cblxuTW9kZXMucG9pbnRzID0gT2JqZWN0LmNyZWF0ZShSZW5kZXJNb2RlKTtcbk1vZGVzLnBvaW50cy5uYW1lID0gJ3BvaW50cyc7XG5cbk1vZGVzLnBvaW50cy52ZXJ0ZXhfc2hhZGVyX2tleSA9ICdwb2ludF92ZXJ0ZXgnO1xuTW9kZXMucG9pbnRzLmZyYWdtZW50X3NoYWRlcl9rZXkgPSAncG9pbnRfZnJhZ21lbnQnO1xuXG5Nb2Rlcy5wb2ludHMuZGVmaW5lcyA9IHtcbiAgICAnRUZGRUNUX1NDUkVFTl9DT0xPUic6IHRydWVcbn07XG5cbk1vZGVzLnBvaW50cy5zZWxlY3Rpb24gPSB0cnVlO1xuXG5Nb2Rlcy5wb2ludHMuX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52ZXJ0ZXhfbGF5b3V0ID0gbmV3IEdMVmVydGV4TGF5b3V0KHRoaXMuZ2wsIFtcbiAgICAgICAgeyBuYW1lOiAnYV9wb3NpdGlvbicsIHNpemU6IDMsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2FfdGV4Y29vcmQnLCBzaXplOiAyLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9zZWxlY3Rpb25fY29sb3InLCBzaXplOiA0LCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgc2l6ZTogMSwgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuICAgIF0pO1xufTtcblxuTW9kZXMucG9pbnRzLmJ1aWxkUG9pbnRzID0gZnVuY3Rpb24gKHBvaW50cywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIFRPT0Q6IHJlZHVjZSByZWR1bmRhbmN5IG9mIGNvbnN0YW50IGNhbGMgYmV0d2VlbiBidWlsZGVyc1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgR0xCdWlsZGVycy5idWlsZFF1YWRzRm9yUG9pbnRzKFxuICAgICAgICBwb2ludHMsXG4gICAgICAgIHN0eWxlLnNpemUgKiAyLFxuICAgICAgICBzdHlsZS5zaXplICogMixcbiAgICAgICAgc3R5bGUueixcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5vcm1hbHM6IGZhbHNlLFxuICAgICAgICAgICAgdGV4Y29vcmRzOiB0cnVlLFxuICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICB9XG4gICAgKTtcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBNb2RlTWFuYWdlcjogTW9kZU1hbmFnZXIsXG4gICAgICAgIE1vZGVzOiBNb2Rlc1xuICAgIH07XG59XG4iLCIvLyBUaGluIEdMIHByb2dyYW0gd3JhcHAgdG8gY2FjaGUgdW5pZm9ybSBsb2NhdGlvbnMvdmFsdWVzLCBkbyBjb21waWxlLXRpbWUgcHJlLXByb2Nlc3Npbmdcbi8vIChpbmplY3RpbmcgI2RlZmluZXMgYW5kICNwcmFnbWEgdHJhbnNmb3JtcyBpbnRvIHNoYWRlcnMpLCBldGMuXG5cbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wuanMnKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XG5cbkdMUHJvZ3JhbS5pZCA9IDA7IC8vIGFzc2lnbiBlYWNoIHByb2dyYW0gYSB1bmlxdWUgaWRcbkdMUHJvZ3JhbS5wcm9ncmFtcyA9IHt9OyAvLyBwcm9ncmFtcywgYnkgaWRcblxuZnVuY3Rpb24gR0xQcm9ncmFtIChnbCwgdmVydGV4X3NoYWRlcl9zb3VyY2UsIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB0aGlzLmdsID0gZ2w7XG4gICAgdGhpcy5wcm9ncmFtID0gbnVsbDtcbiAgICB0aGlzLmRlZmluZXMgPSBvcHRpb25zLmRlZmluZXMgfHwge307IC8vIGtleS92YWx1ZXMgaW5zZXJ0ZWQgYXMgI2RlZmluZXMgaW50byBzaGFkZXJzIGF0IGNvbXBpbGUtdGltZVxuICAgIHRoaXMudHJhbnNmb3JtcyA9IG9wdGlvbnMudHJhbnNmb3JtczsgLy8ga2V5L3ZhbHVlcyBmb3IgVVJMcyBvZiBibG9ja3MgdGhhdCBjYW4gYmUgaW5qZWN0ZWQgaW50byBzaGFkZXJzIGF0IGNvbXBpbGUtdGltZVxuICAgIHRoaXMudW5pZm9ybXMgPSB7fTsgLy8gcHJvZ3JhbSBsb2NhdGlvbnMgb2YgdW5pZm9ybXMsIHNldC91cGRhdGVkIGF0IGNvbXBpbGUtdGltZVxuICAgIHRoaXMuYXR0cmlicyA9IHt9OyAvLyBwcm9ncmFtIGxvY2F0aW9ucyBvZiB2ZXJ0ZXggYXR0cmlidXRlc1xuICAgIHRoaXMudmVydGV4X3NoYWRlcl9zb3VyY2UgPSB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZTtcbiAgICB0aGlzLmZyYWdtZW50X3NoYWRlcl9zb3VyY2UgPSBmcmFnbWVudF9zaGFkZXJfc291cmNlO1xuXG4gICAgdGhpcy5pZCA9IEdMUHJvZ3JhbS5pZCsrO1xuICAgIEdMUHJvZ3JhbS5wcm9ncmFtc1t0aGlzLmlkXSA9IHRoaXM7XG4gICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lOyAvLyBjYW4gcHJvdmlkZSBhIHByb2dyYW0gbmFtZSAodXNlZnVsIGZvciBkZWJ1Z2dpbmcpXG5cbiAgICB0aGlzLmNvbXBpbGUoKTtcbn07XG5cbi8vIENyZWF0ZXMgYSBwcm9ncmFtIHRoYXQgd2lsbCByZWZyZXNoIGZyb20gc291cmNlIFVSTHMgZWFjaCB0aW1lIGl0IGlzIGNvbXBpbGVkXG5HTFByb2dyYW0uY3JlYXRlUHJvZ3JhbUZyb21VUkxzID0gZnVuY3Rpb24gKGdsLCB2ZXJ0ZXhfc2hhZGVyX3VybCwgZnJhZ21lbnRfc2hhZGVyX3VybCwgb3B0aW9ucylcbntcbiAgICB2YXIgcHJvZ3JhbSA9IE9iamVjdC5jcmVhdGUoR0xQcm9ncmFtLnByb3RvdHlwZSk7XG5cbiAgICBwcm9ncmFtLnZlcnRleF9zaGFkZXJfdXJsID0gdmVydGV4X3NoYWRlcl91cmw7XG4gICAgcHJvZ3JhbS5mcmFnbWVudF9zaGFkZXJfdXJsID0gZnJhZ21lbnRfc2hhZGVyX3VybDtcblxuICAgIHByb2dyYW0udXBkYXRlVmVydGV4U2hhZGVyU291cmNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc291cmNlO1xuICAgICAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7IHNvdXJjZSA9IHJlcS5yZXNwb25zZTsgfTtcbiAgICAgICAgcmVxLm9wZW4oJ0dFVCcsIFV0aWxzLnVybEZvclBhdGgodGhpcy52ZXJ0ZXhfc2hhZGVyX3VybCkgKyAnPycgKyAoK25ldyBEYXRlKCkpLCBmYWxzZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICAgICAgcmVxLnNlbmQoKTtcbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9O1xuXG4gICAgcHJvZ3JhbS51cGRhdGVGcmFnbWVudFNoYWRlclNvdXJjZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNvdXJjZTtcbiAgICAgICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkgeyBzb3VyY2UgPSByZXEucmVzcG9uc2U7IH07XG4gICAgICAgIHJlcS5vcGVuKCdHRVQnLCBVdGlscy51cmxGb3JQYXRoKHRoaXMuZnJhZ21lbnRfc2hhZGVyX3VybCkgKyAnPycgKyAoK25ldyBEYXRlKCkpLCBmYWxzZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICAgICAgcmVxLnNlbmQoKTtcbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9O1xuXG4gICAgR0xQcm9ncmFtLmNhbGwocHJvZ3JhbSwgZ2wsIG51bGwsIG51bGwsIG9wdGlvbnMpO1xuICAgIHJldHVybiBwcm9ncmFtO1xufTtcblxuLy8gVXNlIHByb2dyYW0gd3JhcHBlciB3aXRoIHNpbXBsZSBzdGF0ZSBjYWNoZVxuR0xQcm9ncmFtLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiAoKVxue1xuICAgIGlmIChHTFByb2dyYW0uY3VycmVudCAhPSB0aGlzKSB7XG4gICAgICAgIHRoaXMuZ2wudXNlUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xuICAgIH1cbiAgICBHTFByb2dyYW0uY3VycmVudCA9IHRoaXM7XG59O1xuR0xQcm9ncmFtLmN1cnJlbnQgPSBudWxsO1xuXG4vLyBHbG9iYWwgZGVmaW5lcyBhcHBsaWVkIHRvIGFsbCBwcm9ncmFtcyAoZHVwbGljYXRlIHByb3BlcnRpZXMgZm9yIGEgc3BlY2lmaWMgcHJvZ3JhbSB3aWxsIHRha2UgcHJlY2VkZW5jZSlcbkdMUHJvZ3JhbS5kZWZpbmVzID0ge307XG5cbkdMUHJvZ3JhbS5wcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gT3B0aW9uYWxseSB1cGRhdGUgc291cmNlc1xuICAgIGlmICh0eXBlb2YgdGhpcy51cGRhdGVWZXJ0ZXhTaGFkZXJTb3VyY2UgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnZlcnRleF9zaGFkZXJfc291cmNlID0gdGhpcy51cGRhdGVWZXJ0ZXhTaGFkZXJTb3VyY2UoKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLnVwZGF0ZUZyYWdtZW50U2hhZGVyU291cmNlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5mcmFnbWVudF9zaGFkZXJfc291cmNlID0gdGhpcy51cGRhdGVGcmFnbWVudFNoYWRlclNvdXJjZSgpO1xuICAgIH1cblxuICAgIC8vIENvcHkgc291cmNlcyB0byBiZSBtb2RpZmllZFxuICAgIHRoaXMucHJvY2Vzc2VkX3ZlcnRleF9zaGFkZXJfc291cmNlID0gdGhpcy52ZXJ0ZXhfc2hhZGVyX3NvdXJjZTtcbiAgICB0aGlzLnByb2Nlc3NlZF9mcmFnbWVudF9zaGFkZXJfc291cmNlID0gdGhpcy5mcmFnbWVudF9zaGFkZXJfc291cmNlO1xuXG4gICAgLy8gTWFrZSBsaXN0IG9mIGRlZmluZXMgKGdsb2JhbCwgdGhlbiBwcm9ncmFtLXNwZWNpZmljKVxuICAgIHZhciBkZWZpbmVzID0ge307XG4gICAgZm9yICh2YXIgZCBpbiBHTFByb2dyYW0uZGVmaW5lcykge1xuICAgICAgICBkZWZpbmVzW2RdID0gR0xQcm9ncmFtLmRlZmluZXNbZF07XG4gICAgfVxuICAgIGZvciAodmFyIGQgaW4gdGhpcy5kZWZpbmVzKSB7XG4gICAgICAgIGRlZmluZXNbZF0gPSB0aGlzLmRlZmluZXNbZF07XG4gICAgfVxuXG4gICAgLy8gSW5qZWN0IHVzZXItZGVmaW5lZCB0cmFuc2Zvcm1zIChhcmJpdHJhcnkgY29kZSBibG9ja3MgbWF0Y2hpbmcgbmFtZWQgI3ByYWdtYXMpXG4gICAgLy8gVE9ETzogZmxhZyB0byBhdm9pZCByZS1yZXRyaWV2aW5nIHRyYW5zZm9ybSBVUkxzIG92ZXIgbmV0d29yayB3aGVuIHJlYnVpbGRpbmc/XG4gICAgLy8gVE9ETzogc3VwcG9ydCBnbHNsaWZ5ICNwcmFnbWEgZXhwb3J0IG5hbWVzIGZvciBiZXR0ZXIgY29tcGF0aWJpbGl0eT8gKGUuZy4gcmVuYW1lIG1haW4oKSBmdW5jdGlvbnMpXG4gICAgLy8gVE9ETzogYXV0by1pbnNlcnQgdW5pZm9ybXMgcmVmZXJlbmNlZCBpbiBtb2RlIGRlZmluaXRpb24sIGJ1dCBub3QgaW4gc2hhZGVyIGJhc2Ugb3IgdHJhbnNmb3Jtcz8gKHByb2JsZW06IGRvbid0IGhhdmUgYWNjZXNzIHRvIHVuaWZvcm0gbGlzdC90eXBlIGhlcmUpXG4gICAgdmFyIHJlO1xuICAgIGlmICh0aGlzLnRyYW5zZm9ybXMgIT0gbnVsbCkge1xuICAgICAgICAvLyBSZXBsYWNlIGFjY29yZGluZyB0byB0aGlzIHBhdHRlcm46XG4gICAgICAgIC8vICNwcmFnbWEgdGFuZ3JhbTogW2tleV1cbiAgICAgICAgLy8gZS5nLiAjcHJhZ21hIHRhbmdyYW06IGdsb2JhbHNcbiAgICAgICAgdmFyIHNvdXJjZTtcbiAgICAgICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkgeyBzb3VyY2UgPSByZXEucmVzcG9uc2U7IH07XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMudHJhbnNmb3Jtcykge1xuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybSA9IHRoaXMudHJhbnNmb3Jtc1trZXldO1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENhbiBiZSBhIHNpbmdsZSBpdGVtIChzdHJpbmcgb3Igb2JqZWN0KSBvciBhIGxpc3RcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdHJhbnNmb3JtID09ICdzdHJpbmcnIHx8ICh0eXBlb2YgdHJhbnNmb3JtID09ICdvYmplY3QnICYmIHRyYW5zZm9ybS5sZW5ndGggPT0gbnVsbCkpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm0gPSBbdHJhbnNmb3JtXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmlyc3QgZmluZCBjb2RlIHJlcGxhY2UgcG9pbnRzIGluIHNoYWRlcnNcbiAgICAgICAgICAgIHZhciByZSA9IG5ldyBSZWdFeHAoJ15cXFxccyojcHJhZ21hXFxcXHMrdGFuZ3JhbTpcXFxccysnICsga2V5ICsgJ1xcXFxzKiQnLCAnbScpO1xuICAgICAgICAgICAgdmFyIGluamVjdF92ZXJ0ZXggPSB0aGlzLnByb2Nlc3NlZF92ZXJ0ZXhfc2hhZGVyX3NvdXJjZS5tYXRjaChyZSk7XG4gICAgICAgICAgICB2YXIgaW5qZWN0X2ZyYWdtZW50ID0gdGhpcy5wcm9jZXNzZWRfZnJhZ21lbnRfc2hhZGVyX3NvdXJjZS5tYXRjaChyZSk7XG5cbiAgICAgICAgICAgIC8vIEF2b2lkIG5ldHdvcmsgcmVxdWVzdCBpZiBub3RoaW5nIHRvIHJlcGxhY2VcbiAgICAgICAgICAgIGlmIChpbmplY3RfdmVydGV4ID09IG51bGwgJiYgaW5qZWN0X2ZyYWdtZW50ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gR2V0IHRoZSBjb2RlIG92ZXIgdGhlIG5ldHdvcmtcbiAgICAgICAgICAgIC8vIFRPRE86IHVzZSBvZiBzeW5jaHJvbm91cyBYSFIgbWF5IGJlIGEgc3BlZWQgaXNzdWVcbiAgICAgICAgICAgIHZhciBjb21iaW5lZF9zb3VyY2UgPSBcIlwiO1xuICAgICAgICAgICAgZm9yICh2YXIgdSBpbiB0cmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAvLyBDYW4gYmUgYW4gaW5saW5lIGJsb2NrIG9mIEdMU0wsIG9yIGEgVVJMIHRvIHJldHJpZXZlIEdMU0wgYmxvY2sgZnJvbVxuICAgICAgICAgICAgICAgIHZhciB0eXBlLCB2YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRyYW5zZm9ybVt1XSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNmb3JtW3VdLnVybCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlID0gJ3VybCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHRyYW5zZm9ybVt1XS51cmw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zZm9ybVt1XS5pbmxpbmUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9ICdpbmxpbmUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB0cmFuc2Zvcm1bdV0uaW5saW5lO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBEZWZhdWx0IHRvIGlubGluZSBHTFNMXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSAnaW5saW5lJztcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB0cmFuc2Zvcm1bdV07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gJ2lubGluZScpIHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT0gJ3VybCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9wZW4oJ0dFVCcsIFV0aWxzLnVybEZvclBhdGgodmFsdWUpICsgJz8nICsgKCtuZXcgRGF0ZSgpKSwgZmFsc2UgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZW5kKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29tYmluZWRfc291cmNlICs9IHNvdXJjZSArICdcXG4nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJbmplY3QgdGhlIGNvZGVcbiAgICAgICAgICAgIGlmIChpbmplY3RfdmVydGV4ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NlZF92ZXJ0ZXhfc2hhZGVyX3NvdXJjZSA9IHRoaXMucHJvY2Vzc2VkX3ZlcnRleF9zaGFkZXJfc291cmNlLnJlcGxhY2UocmUsIGNvbWJpbmVkX3NvdXJjZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5qZWN0X2ZyYWdtZW50ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NlZF9mcmFnbWVudF9zaGFkZXJfc291cmNlID0gdGhpcy5wcm9jZXNzZWRfZnJhZ21lbnRfc2hhZGVyX3NvdXJjZS5yZXBsYWNlKHJlLCBjb21iaW5lZF9zb3VyY2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBZGQgYSAjZGVmaW5lIGZvciB0aGlzIGluamVjdGlvbiBwb2ludFxuICAgICAgICAgICAgZGVmaW5lc1snVEFOR1JBTV9UUkFOU0ZPUk1fJyArIGtleS5yZXBsYWNlKCcgJywgJ18nKS50b1VwcGVyQ2FzZSgpXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDbGVhbi11cCBhbnkgI3ByYWdtYXMgdGhhdCB3ZXJlbid0IHJlcGxhY2VkICh0byBwcmV2ZW50IGNvbXBpbGVyIHdhcm5pbmdzKVxuICAgIHJlID0gbmV3IFJlZ0V4cCgnXlxcXFxzKiNwcmFnbWFcXFxccyt0YW5ncmFtOlxcXFxzK1xcXFx3K1xcXFxzKiQnLCAnZ20nKTtcbiAgICB0aGlzLnByb2Nlc3NlZF92ZXJ0ZXhfc2hhZGVyX3NvdXJjZSA9IHRoaXMucHJvY2Vzc2VkX3ZlcnRleF9zaGFkZXJfc291cmNlLnJlcGxhY2UocmUsICcnKTtcbiAgICB0aGlzLnByb2Nlc3NlZF9mcmFnbWVudF9zaGFkZXJfc291cmNlID0gdGhpcy5wcm9jZXNzZWRfZnJhZ21lbnRfc2hhZGVyX3NvdXJjZS5yZXBsYWNlKHJlLCAnJyk7XG5cbiAgICAvLyBCdWlsZCAmIGluamVjdCBkZWZpbmVzXG4gICAgLy8gVGhpcyBpcyBkb25lICphZnRlciogY29kZSBpbmplY3Rpb24gc28gdGhhdCB3ZSBjYW4gYWRkIGRlZmluZXMgZm9yIHdoaWNoIGNvZGUgcG9pbnRzIHdlcmUgaW5qZWN0ZWRcbiAgICB2YXIgZGVmaW5lX3N0ciA9IFwiXCI7XG4gICAgZm9yICh2YXIgZCBpbiBkZWZpbmVzKSB7XG4gICAgICAgIGlmIChkZWZpbmVzW2RdID09IGZhbHNlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lc1tkXSA9PSAnYm9vbGVhbicgJiYgZGVmaW5lc1tkXSA9PSB0cnVlKSB7IC8vIGJvb2xlYW5zIGFyZSBzaW1wbGUgZGVmaW5lcyB3aXRoIG5vIHZhbHVlXG4gICAgICAgICAgICBkZWZpbmVfc3RyICs9IFwiI2RlZmluZSBcIiArIGQgKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmVzW2RdID09ICdudW1iZXInICYmIE1hdGguZmxvb3IoZGVmaW5lc1tkXSkgPT0gZGVmaW5lc1tkXSkgeyAvLyBpbnQgdG8gZmxvYXQgY29udmVyc2lvbiB0byBzYXRpc2Z5IEdMU0wgZmxvYXRzXG4gICAgICAgICAgICBkZWZpbmVfc3RyICs9IFwiI2RlZmluZSBcIiArIGQgKyBcIiBcIiArIGRlZmluZXNbZF0udG9GaXhlZCgxKSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vIGFueSBvdGhlciBmbG9hdCBvciBzdHJpbmcgdmFsdWVcbiAgICAgICAgICAgIGRlZmluZV9zdHIgKz0gXCIjZGVmaW5lIFwiICsgZCArIFwiIFwiICsgZGVmaW5lc1tkXSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5wcm9jZXNzZWRfdmVydGV4X3NoYWRlcl9zb3VyY2UgPSBkZWZpbmVfc3RyICsgdGhpcy5wcm9jZXNzZWRfdmVydGV4X3NoYWRlcl9zb3VyY2U7XG4gICAgdGhpcy5wcm9jZXNzZWRfZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSA9IGRlZmluZV9zdHIgKyB0aGlzLnByb2Nlc3NlZF9mcmFnbWVudF9zaGFkZXJfc291cmNlO1xuXG4gICAgLy8gSW5jbHVkZSBwcm9ncmFtIGluZm8gdXNlZnVsIGZvciBkZWJ1Z2dpbmdcbiAgICB2YXIgaW5mbyA9ICh0aGlzLm5hbWUgPyAodGhpcy5uYW1lICsgJyAvIGlkICcgKyB0aGlzLmlkKSA6ICgnaWQgJyArIHRoaXMuaWQpKTtcbiAgICB0aGlzLnByb2Nlc3NlZF92ZXJ0ZXhfc2hhZGVyX3NvdXJjZSA9ICcvLyBQcm9ncmFtOiAnICsgaW5mbyArICdcXG4nICsgdGhpcy5wcm9jZXNzZWRfdmVydGV4X3NoYWRlcl9zb3VyY2U7XG4gICAgdGhpcy5wcm9jZXNzZWRfZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSA9ICcvLyBQcm9ncmFtOiAnICsgaW5mbyArICdcXG4nICsgdGhpcy5wcm9jZXNzZWRfZnJhZ21lbnRfc2hhZGVyX3NvdXJjZTtcblxuICAgIC8vIENvbXBpbGUgJiBzZXQgdW5pZm9ybXMgdG8gY2FjaGVkIHZhbHVlc1xuICAgIHRoaXMucHJvZ3JhbSA9IEdMLnVwZGF0ZVByb2dyYW0odGhpcy5nbCwgdGhpcy5wcm9ncmFtLCB0aGlzLnByb2Nlc3NlZF92ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgdGhpcy5wcm9jZXNzZWRfZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSk7XG4gICAgdGhpcy51c2UoKTtcbiAgICB0aGlzLnJlZnJlc2hVbmlmb3JtcygpO1xuICAgIHRoaXMucmVmcmVzaEF0dHJpYnV0ZXMoKTtcbn07XG5cbi8vIGV4OiBwcm9ncmFtLnVuaWZvcm0oJzNmJywgJ3Bvc2l0aW9uJywgeCwgeSwgeik7XG4vLyBUT0RPOiBvbmx5IHVwZGF0ZSB1bmlmb3JtcyB3aGVuIGNoYW5nZWRcbkdMUHJvZ3JhbS5wcm90b3R5cGUudW5pZm9ybSA9IGZ1bmN0aW9uIChtZXRob2QsIG5hbWUpIC8vIG1ldGhvZC1hcHByb3ByaWF0ZSBhcmd1bWVudHMgZm9sbG93XG57XG4gICAgdmFyIHVuaWZvcm0gPSAodGhpcy51bmlmb3Jtc1tuYW1lXSA9IHRoaXMudW5pZm9ybXNbbmFtZV0gfHwge30pO1xuICAgIHVuaWZvcm0ubmFtZSA9IG5hbWU7XG4gICAgdW5pZm9ybS5sb2NhdGlvbiA9IHVuaWZvcm0ubG9jYXRpb24gfHwgdGhpcy5nbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5wcm9ncmFtLCBuYW1lKTtcbiAgICB1bmlmb3JtLm1ldGhvZCA9ICd1bmlmb3JtJyArIG1ldGhvZDtcbiAgICB1bmlmb3JtLnZhbHVlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdGhpcy51cGRhdGVVbmlmb3JtKG5hbWUpO1xufTtcblxuLy8gU2V0IGEgc2luZ2xlIHVuaWZvcm1cbkdMUHJvZ3JhbS5wcm90b3R5cGUudXBkYXRlVW5pZm9ybSA9IGZ1bmN0aW9uIChuYW1lKVxue1xuICAgIHZhciB1bmlmb3JtID0gdGhpcy51bmlmb3Jtc1tuYW1lXTtcbiAgICBpZiAodW5pZm9ybSA9PSBudWxsIHx8IHVuaWZvcm0ubG9jYXRpb24gPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy51c2UoKTtcbiAgICB0aGlzLmdsW3VuaWZvcm0ubWV0aG9kXS5hcHBseSh0aGlzLmdsLCBbdW5pZm9ybS5sb2NhdGlvbl0uY29uY2F0KHVuaWZvcm0udmFsdWVzKSk7IC8vIGNhbGwgYXBwcm9wcmlhdGUgR0wgdW5pZm9ybSBtZXRob2QgYW5kIHBhc3MgdGhyb3VnaCBhcmd1bWVudHNcbn07XG5cbi8vIFJlZnJlc2ggdW5pZm9ybSBsb2NhdGlvbnMgYW5kIHNldCB0byBsYXN0IGNhY2hlZCB2YWx1ZXNcbkdMUHJvZ3JhbS5wcm90b3R5cGUucmVmcmVzaFVuaWZvcm1zID0gZnVuY3Rpb24gKClcbntcbiAgICBmb3IgKHZhciB1IGluIHRoaXMudW5pZm9ybXMpIHtcbiAgICAgICAgdGhpcy51bmlmb3Jtc1t1XS5sb2NhdGlvbiA9IHRoaXMuZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgdSk7XG4gICAgICAgIHRoaXMudXBkYXRlVW5pZm9ybSh1KTtcbiAgICB9XG59O1xuXG5HTFByb2dyYW0ucHJvdG90eXBlLnJlZnJlc2hBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyB2YXIgbGVuID0gdGhpcy5nbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMucHJvZ3JhbSwgdGhpcy5nbC5BQ1RJVkVfQVRUUklCVVRFUyk7XG4gICAgLy8gZm9yICh2YXIgaT0wOyBpIDwgbGVuOyBpKyspIHtcbiAgICAvLyAgICAgdmFyIGEgPSB0aGlzLmdsLmdldEFjdGl2ZUF0dHJpYih0aGlzLnByb2dyYW0sIGkpO1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhhKTtcbiAgICAvLyB9XG4gICAgdGhpcy5hdHRyaWJzID0ge307XG59O1xuXG4vLyBHZXQgdGhlIGxvY2F0aW9uIG9mIGEgdmVydGV4IGF0dHJpYnV0ZVxuR0xQcm9ncmFtLnByb3RvdHlwZS5hdHRyaWJ1dGUgPSBmdW5jdGlvbiAobmFtZSlcbntcbiAgICB2YXIgYXR0cmliID0gKHRoaXMuYXR0cmlic1tuYW1lXSA9IHRoaXMuYXR0cmlic1tuYW1lXSB8fCB7fSk7XG4gICAgaWYgKGF0dHJpYi5sb2NhdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhdHRyaWI7XG4gICAgfVxuXG4gICAgYXR0cmliLm5hbWUgPSBuYW1lO1xuICAgIGF0dHJpYi5sb2NhdGlvbiA9IHRoaXMuZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5wcm9ncmFtLCBuYW1lKTtcblxuICAgIC8vIHZhciBpbmZvID0gdGhpcy5nbC5nZXRBY3RpdmVBdHRyaWIodGhpcy5wcm9ncmFtLCBhdHRyaWIubG9jYXRpb24pO1xuICAgIC8vIGF0dHJpYi50eXBlID0gaW5mby50eXBlO1xuICAgIC8vIGF0dHJpYi5zaXplID0gaW5mby5zaXplO1xuXG4gICAgcmV0dXJuIGF0dHJpYjtcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gR0xQcm9ncmFtO1xufVxuIiwiLy8gR2VuZXJhdGVkIGZyb20gR0xTTCBmaWxlcywgZG9uJ3QgZWRpdCFcbnZhciBzaGFkZXJfc291cmNlcyA9IHt9O1xuXG5zaGFkZXJfc291cmNlc1sncG9pbnRfZnJhZ21lbnQnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfcmVzb2x1dGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwidmFyeWluZyB2ZWMyIHZfdGV4Y29vcmQ7XFxuXCIgK1xuXCJ2b2lkIG1haW4odm9pZCkge1xcblwiICtcblwiICB2ZWMzIGNvbG9yID0gdl9jb2xvcjtcXG5cIiArXG5cIiAgdmVjMyBsaWdodGluZyA9IHZlYzMoMS4pO1xcblwiICtcblwiICBmbG9hdCBsZW4gPSBsZW5ndGgodl90ZXhjb29yZCk7XFxuXCIgK1xuXCIgIGlmKGxlbiA+IDEuKSB7XFxuXCIgK1xuXCIgICAgZGlzY2FyZDtcXG5cIiArXG5cIiAgfVxcblwiICtcblwiICBjb2xvciAqPSAoMS4gLSBzbW9vdGhzdGVwKC4yNSwgMS4sIGxlbikpICsgMC41O1xcblwiICtcblwiICAjcHJhZ21hIHRhbmdyYW06IGZyYWdtZW50XFxuXCIgK1xuXCIgIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IsIDEuKTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1sncG9pbnRfdmVydGV4J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X3RpbGVfdmlldztcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X21ldGVyX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbnVtX2xheWVycztcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfcG9zaXRpb247XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMiBhX3RleGNvb3JkO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9jb2xvcjtcXG5cIiArXG5cImF0dHJpYnV0ZSBmbG9hdCBhX2xheWVyO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzIgdl90ZXhjb29yZDtcXG5cIiArXG5cIiNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiXFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjNCBhX3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCJmbG9hdCBhX3hfY2FsY3VsYXRlWihmbG9hdCB6LCBmbG9hdCBsYXllciwgY29uc3QgZmxvYXQgbnVtX2xheWVycywgY29uc3QgZmxvYXQgel9sYXllcl9zY2FsZSkge1xcblwiICtcblwiICBmbG9hdCB6X2xheWVyX3JhbmdlID0gKG51bV9sYXllcnMgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICBmbG9hdCB6X2xheWVyID0gKGxheWVyICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgeiA9IHpfbGF5ZXIgKyBjbGFtcCh6LCAwLiwgel9sYXllcl9zY2FsZSk7XFxuXCIgK1xuXCIgIHogPSAoel9sYXllcl9yYW5nZSAtIHopIC8gel9sYXllcl9yYW5nZTtcXG5cIiArXG5cIiAgcmV0dXJuIHo7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjcHJhZ21hIHRhbmdyYW06IGdsb2JhbHNcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluKCkge1xcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCIgIGlmKGFfc2VsZWN0aW9uX2NvbG9yLnh5eiA9PSB2ZWMzKDAuKSkge1xcblwiICtcblwiICAgIGdsX1Bvc2l0aW9uID0gdmVjNCgwLik7XFxuXCIgK1xuXCIgICAgcmV0dXJuO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIHZfc2VsZWN0aW9uX2NvbG9yID0gYV9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICB2ZWM0IHBvc2l0aW9uID0gdV9tZXRlcl92aWV3ICogdV90aWxlX3ZpZXcgKiB2ZWM0KGFfcG9zaXRpb24sIDEuKTtcXG5cIiArXG5cIiAgI3ByYWdtYSB0YW5ncmFtOiB2ZXJ0ZXhcXG5cIiArXG5cIiAgdl9jb2xvciA9IGFfY29sb3I7XFxuXCIgK1xuXCIgIHZfdGV4Y29vcmQgPSBhX3RleGNvb3JkO1xcblwiICtcblwiICBwb3NpdGlvbi56ID0gYV94X2NhbGN1bGF0ZVoocG9zaXRpb24ueiwgYV9sYXllciwgdV9udW1fbGF5ZXJzLCAyNTYuKTtcXG5cIiArXG5cIiAgZ2xfUG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1sncG9seWdvbl9mcmFnbWVudCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9yZXNvbHV0aW9uO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfYXNwZWN0O1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfbWV0ZXJfdmlldztcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9tZXRlcnNfcGVyX3BpeGVsO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X3RpbWU7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWFwX3pvb207XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9tYXBfY2VudGVyO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfdGlsZV9vcmlnaW47XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfdGVzdDtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV90ZXN0MjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwidmFyeWluZyB2ZWM0IHZfd29ybGRfcG9zaXRpb247XFxuXCIgK1xuXCIjaWYgZGVmaW5lZChXT1JMRF9QT1NJVElPTl9XUkFQKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2ZWMyIHdvcmxkX3Bvc2l0aW9uX2FuY2hvciA9IHZlYzIoZmxvb3IodV90aWxlX29yaWdpbiAvIFdPUkxEX1BPU0lUSU9OX1dSQVApICogV09STERfUE9TSVRJT05fV1JBUCk7XFxuXCIgK1xuXCJ2ZWM0IGFic29sdXRlV29ybGRQb3NpdGlvbigpIHtcXG5cIiArXG5cIiAgcmV0dXJuIHZlYzQodl93b3JsZF9wb3NpdGlvbi54eSArIHdvcmxkX3Bvc2l0aW9uX2FuY2hvciwgdl93b3JsZF9wb3NpdGlvbi56LCB2X3dvcmxkX3Bvc2l0aW9uLncpO1xcblwiICtcblwifVxcblwiICtcblwiI2Vsc2VcXG5cIiArXG5cIlxcblwiICtcblwidmVjNCBhYnNvbHV0ZVdvcmxkUG9zaXRpb24oKSB7XFxuXCIgK1xuXCIgIHJldHVybiB2X3dvcmxkX3Bvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cIiNpZiBkZWZpbmVkKExJR0hUSU5HX0VOVklST05NRU5UKVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIHNhbXBsZXIyRCB1X2Vudl9tYXA7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWM0IHZfcG9zaXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9ub3JtYWw7XFxuXCIgK1xuXCIjZWxzZVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9saWdodGluZztcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCJjb25zdCBmbG9hdCBsaWdodF9hbWJpZW50ID0gMC41O1xcblwiICtcblwidmVjMyBiX3hfcG9pbnRMaWdodCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIGZsb2F0IGxpZ2h0X2FtYmllbnQsIGNvbnN0IGJvb2wgYmFja2xpZ2h0KSB7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIGxpZ2h0X3Bvcy54eXopO1xcblwiICtcblwiICBjb2xvciAqPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGNfeF9zcGVjdWxhckxpZ2h0KHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgZmxvYXQgbGlnaHRfYW1iaWVudCwgY29uc3QgYm9vbCBiYWNrbGlnaHQpIHtcXG5cIiArXG5cIiAgdmVjMyBsaWdodF9kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gbGlnaHRfcG9zLnh5eik7XFxuXCIgK1xuXCIgIHZlYzMgdmlld19wb3MgPSB2ZWMzKDAuLCAwLiwgNTAwLik7XFxuXCIgK1xuXCIgIHZlYzMgdmlld19kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gdmlld19wb3MueHl6KTtcXG5cIiArXG5cIiAgdmVjMyBzcGVjdWxhclJlZmxlY3Rpb247XFxuXCIgK1xuXCIgIGlmKGRvdChub3JtYWwsIC1saWdodF9kaXIpIDwgMC4wKSB7XFxuXCIgK1xuXCIgICAgc3BlY3VsYXJSZWZsZWN0aW9uID0gdmVjMygwLjAsIDAuMCwgMC4wKTtcXG5cIiArXG5cIiAgfSBlbHNlIHtcXG5cIiArXG5cIiAgICBmbG9hdCBhdHRlbnVhdGlvbiA9IDEuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBsaWdodFNwZWN1bGFyVGVybSA9IDEuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBtYXRlcmlhbFNwZWN1bGFyVGVybSA9IDEwLjA7XFxuXCIgK1xuXCIgICAgZmxvYXQgbWF0ZXJpYWxTaGluaW5lc3NUZXJtID0gMTAuMDtcXG5cIiArXG5cIiAgICBzcGVjdWxhclJlZmxlY3Rpb24gPSBhdHRlbnVhdGlvbiAqIHZlYzMobGlnaHRTcGVjdWxhclRlcm0pICogdmVjMyhtYXRlcmlhbFNwZWN1bGFyVGVybSkgKiBwb3cobWF4KDAuMCwgZG90KHJlZmxlY3QoLWxpZ2h0X2Rpciwgbm9ybWFsKSwgdmlld19kaXIpKSwgbWF0ZXJpYWxTaGluaW5lc3NUZXJtKTtcXG5cIiArXG5cIiAgfVxcblwiICtcblwiICBmbG9hdCBkaWZmdXNlID0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpO1xcblwiICtcblwiICBjb2xvciAqPSBkaWZmdXNlICsgc3BlY3VsYXJSZWZsZWN0aW9uICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBkX3hfZGlyZWN0aW9uYWxMaWdodCh2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjMyBsaWdodF9kaXIsIGZsb2F0IGxpZ2h0X2FtYmllbnQpIHtcXG5cIiArXG5cIiAgbGlnaHRfZGlyID0gbm9ybWFsaXplKGxpZ2h0X2Rpcik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBhX3hfbGlnaHRpbmcodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCB2ZWM0IG5pZ2h0X2xpZ2h0X3BvcywgdmVjMyBsaWdodF9kaXIsIGZsb2F0IGxpZ2h0X2FtYmllbnQpIHtcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKExJR0hUSU5HX1BPSU5UKVxcblwiICtcblwiICBjb2xvciA9IGJfeF9wb2ludExpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBsaWdodF9wb3MsIGxpZ2h0X2FtYmllbnQsIHRydWUpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKExJR0hUSU5HX1BPSU5UX1NQRUNVTEFSKVxcblwiICtcblwiICBjb2xvciA9IGNfeF9zcGVjdWxhckxpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBsaWdodF9wb3MsIGxpZ2h0X2FtYmllbnQsIHRydWUpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKExJR0hUSU5HX05JR0hUKVxcblwiICtcblwiICBjb2xvciA9IGJfeF9wb2ludExpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBuaWdodF9saWdodF9wb3MsIDAuLCBmYWxzZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfRElSRUNUSU9OKVxcblwiICtcblwiICBjb2xvciA9IGRfeF9kaXJlY3Rpb25hbExpZ2h0KG5vcm1hbCwgY29sb3IsIGxpZ2h0X2RpciwgbGlnaHRfYW1iaWVudCk7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIGNvbG9yID0gY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWM0IGVfeF9zcGhlcmljYWxFbnZpcm9ubWVudE1hcCh2ZWMzIHZpZXdfcG9zLCB2ZWMzIHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgc2FtcGxlcjJEIGVudm1hcCkge1xcblwiICtcblwiICB2ZWMzIGV5ZSA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSB2aWV3X3Bvcy54eXopO1xcblwiICtcblwiICBpZihleWUueiA+IDAuMDEpIHtcXG5cIiArXG5cIiAgICBleWUueiA9IDAuMDE7XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgdmVjMyByID0gcmVmbGVjdChleWUsIG5vcm1hbCk7XFxuXCIgK1xuXCIgIGZsb2F0IG0gPSAyLiAqIHNxcnQocG93KHIueCwgMi4pICsgcG93KHIueSwgMi4pICsgcG93KHIueiArIDEuLCAyLikpO1xcblwiICtcblwiICB2ZWMyIHV2ID0gci54eSAvIG0gKyAuNTtcXG5cIiArXG5cIiAgcmV0dXJuIHRleHR1cmUyRChlbnZtYXAsIHV2KTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4odm9pZCkge1xcblwiICtcblwiICB2ZWMzIGNvbG9yID0gdl9jb2xvcjtcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoTElHSFRJTkdfRU5WSVJPTk1FTlQpXFxuXCIgK1xuXCIgIHZlYzMgdmlld19wb3MgPSB2ZWMzKDAuLCAwLiwgMTAwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCk7XFxuXCIgK1xuXCIgIGNvbG9yID0gZV94X3NwaGVyaWNhbEVudmlyb25tZW50TWFwKHZpZXdfcG9zLCB2X3Bvc2l0aW9uLnh5eiwgdl9ub3JtYWwsIHVfZW52X21hcCkucmdiO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpIC8vIGRlZmF1bHQgdG8gcGVyLXBpeGVsIGxpZ2h0aW5nXFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRpbmcgPSBhX3hfbGlnaHRpbmcodl9wb3NpdGlvbiwgdl9ub3JtYWwsIHZlYzMoMS4pLCB2ZWM0KDAuLCAwLiwgMTUwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCwgMS4pLCB2ZWM0KDAuLCAwLiwgNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLiksIHZlYzMoMC4yLCAwLjcsIC0wLjUpLCBsaWdodF9hbWJpZW50KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgdmVjMyBsaWdodGluZyA9IHZfbGlnaHRpbmc7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICB2ZWMzIGNvbG9yX3ByZWxpZ2h0ID0gY29sb3I7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGxpZ2h0aW5nO1xcblwiICtcblwiICAjcHJhZ21hIHRhbmdyYW06IGZyYWdtZW50XFxuXCIgK1xuXCIgIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IsIDEuMCk7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fdmVydGV4J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3Jlc29sdXRpb247XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9hc3BlY3Q7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfdGltZTtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9tYXBfem9vbTtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X21hcF9jZW50ZXI7XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV90aWxlX29yaWdpbjtcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X3RpbGVfd29ybGQ7XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV90aWxlX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV9tZXRlcl92aWV3O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21ldGVyc19wZXJfcGl4ZWw7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbnVtX2xheWVycztcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfcG9zaXRpb247XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX25vcm1hbDtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfY29sb3I7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgZmxvYXQgYV9sYXllcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3dvcmxkX3Bvc2l0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCIjaWYgZGVmaW5lZChXT1JMRF9QT1NJVElPTl9XUkFQKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2ZWMyIHdvcmxkX3Bvc2l0aW9uX2FuY2hvciA9IHZlYzIoZmxvb3IodV90aWxlX29yaWdpbiAvIFdPUkxEX1BPU0lUSU9OX1dSQVApICogV09STERfUE9TSVRJT05fV1JBUCk7XFxuXCIgK1xuXCJ2ZWM0IGFic29sdXRlV29ybGRQb3NpdGlvbigpIHtcXG5cIiArXG5cIiAgcmV0dXJuIHZlYzQodl93b3JsZF9wb3NpdGlvbi54eSArIHdvcmxkX3Bvc2l0aW9uX2FuY2hvciwgdl93b3JsZF9wb3NpdGlvbi56LCB2X3dvcmxkX3Bvc2l0aW9uLncpO1xcblwiICtcblwifVxcblwiICtcblwiI2Vsc2VcXG5cIiArXG5cIlxcblwiICtcblwidmVjNCBhYnNvbHV0ZVdvcmxkUG9zaXRpb24oKSB7XFxuXCIgK1xuXCIgIHJldHVybiB2X3dvcmxkX3Bvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cIiNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiXFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjNCBhX3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X25vcm1hbDtcXG5cIiArXG5cIiNlbHNlXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2xpZ2h0aW5nO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cImNvbnN0IGZsb2F0IGxpZ2h0X2FtYmllbnQgPSAwLjU7XFxuXCIgK1xuXCJ2ZWM0IGFfeF9wZXJzcGVjdGl2ZSh2ZWM0IHBvc2l0aW9uLCBjb25zdCB2ZWMyIHBlcnNwZWN0aXZlX29mZnNldCwgY29uc3QgdmVjMiBwZXJzcGVjdGl2ZV9mYWN0b3IpIHtcXG5cIiArXG5cIiAgcG9zaXRpb24ueHkgKz0gcG9zaXRpb24ueiAqIHBlcnNwZWN0aXZlX2ZhY3RvciAqIChwb3NpdGlvbi54eSAtIHBlcnNwZWN0aXZlX29mZnNldCk7XFxuXCIgK1xuXCIgIHJldHVybiBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzQgYl94X2lzb21ldHJpYyh2ZWM0IHBvc2l0aW9uLCBjb25zdCB2ZWMyIGF4aXMsIGNvbnN0IGZsb2F0IG11bHRpcGxpZXIpIHtcXG5cIiArXG5cIiAgcG9zaXRpb24ueHkgKz0gcG9zaXRpb24ueiAqIGF4aXMgKiBtdWx0aXBsaWVyIC8gdV9hc3BlY3Q7XFxuXCIgK1xuXCIgIHJldHVybiBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cImZsb2F0IGNfeF9jYWxjdWxhdGVaKGZsb2F0IHosIGZsb2F0IGxheWVyLCBjb25zdCBmbG9hdCBudW1fbGF5ZXJzLCBjb25zdCBmbG9hdCB6X2xheWVyX3NjYWxlKSB7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXJfcmFuZ2UgPSAobnVtX2xheWVycyArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXIgPSAobGF5ZXIgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICB6ID0gel9sYXllciArIGNsYW1wKHosIDAuLCB6X2xheWVyX3NjYWxlKTtcXG5cIiArXG5cIiAgeiA9ICh6X2xheWVyX3JhbmdlIC0geikgLyB6X2xheWVyX3JhbmdlO1xcblwiICtcblwiICByZXR1cm4gejtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZV94X3BvaW50TGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgY29sb3IgKj0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBmX3hfc3BlY3VsYXJMaWdodCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIGZsb2F0IGxpZ2h0X2FtYmllbnQsIGNvbnN0IGJvb2wgYmFja2xpZ2h0KSB7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIGxpZ2h0X3Bvcy54eXopO1xcblwiICtcblwiICB2ZWMzIHZpZXdfcG9zID0gdmVjMygwLiwgMC4sIDUwMC4pO1xcblwiICtcblwiICB2ZWMzIHZpZXdfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIHZpZXdfcG9zLnh5eik7XFxuXCIgK1xuXCIgIHZlYzMgc3BlY3VsYXJSZWZsZWN0aW9uO1xcblwiICtcblwiICBpZihkb3Qobm9ybWFsLCAtbGlnaHRfZGlyKSA8IDAuMCkge1xcblwiICtcblwiICAgIHNwZWN1bGFyUmVmbGVjdGlvbiA9IHZlYzMoMC4wLCAwLjAsIDAuMCk7XFxuXCIgK1xuXCIgIH0gZWxzZSB7XFxuXCIgK1xuXCIgICAgZmxvYXQgYXR0ZW51YXRpb24gPSAxLjA7XFxuXCIgK1xuXCIgICAgZmxvYXQgbGlnaHRTcGVjdWxhclRlcm0gPSAxLjA7XFxuXCIgK1xuXCIgICAgZmxvYXQgbWF0ZXJpYWxTcGVjdWxhclRlcm0gPSAxMC4wO1xcblwiICtcblwiICAgIGZsb2F0IG1hdGVyaWFsU2hpbmluZXNzVGVybSA9IDEwLjA7XFxuXCIgK1xuXCIgICAgc3BlY3VsYXJSZWZsZWN0aW9uID0gYXR0ZW51YXRpb24gKiB2ZWMzKGxpZ2h0U3BlY3VsYXJUZXJtKSAqIHZlYzMobWF0ZXJpYWxTcGVjdWxhclRlcm0pICogcG93KG1heCgwLjAsIGRvdChyZWZsZWN0KC1saWdodF9kaXIsIG5vcm1hbCksIHZpZXdfZGlyKSksIG1hdGVyaWFsU2hpbmluZXNzVGVybSk7XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgZmxvYXQgZGlmZnVzZSA9IGFicyhtYXgoZmxvYXQoYmFja2xpZ2h0KSAqIC0xLiwgZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkpKTtcXG5cIiArXG5cIiAgY29sb3IgKj0gZGlmZnVzZSArIHNwZWN1bGFyUmVmbGVjdGlvbiArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZ194X2RpcmVjdGlvbmFsTGlnaHQodmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzMgbGlnaHRfZGlyLCBmbG9hdCBsaWdodF9hbWJpZW50KSB7XFxuXCIgK1xuXCIgIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShsaWdodF9kaXIpO1xcblwiICtcblwiICBjb2xvciAqPSBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZF94X2xpZ2h0aW5nKHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgdmVjNCBuaWdodF9saWdodF9wb3MsIHZlYzMgbGlnaHRfZGlyLCBmbG9hdCBsaWdodF9hbWJpZW50KSB7XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChMSUdIVElOR19QT0lOVClcXG5cIiArXG5cIiAgY29sb3IgPSBlX3hfcG9pbnRMaWdodChwb3NpdGlvbiwgbm9ybWFsLCBjb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCB0cnVlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19QT0lOVF9TUEVDVUxBUilcXG5cIiArXG5cIiAgY29sb3IgPSBmX3hfc3BlY3VsYXJMaWdodChwb3NpdGlvbiwgbm9ybWFsLCBjb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCB0cnVlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19OSUdIVClcXG5cIiArXG5cIiAgY29sb3IgPSBlX3hfcG9pbnRMaWdodChwb3NpdGlvbiwgbm9ybWFsLCBjb2xvciwgbmlnaHRfbGlnaHRfcG9zLCAwLiwgZmFsc2UpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKExJR0hUSU5HX0RJUkVDVElPTilcXG5cIiArXG5cIiAgY29sb3IgPSBnX3hfZGlyZWN0aW9uYWxMaWdodChub3JtYWwsIGNvbG9yLCBsaWdodF9kaXIsIGxpZ2h0X2FtYmllbnQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICBjb2xvciA9IGNvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbigpIHtcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiICBpZihhX3NlbGVjdGlvbl9jb2xvci54eXogPT0gdmVjMygwLikpIHtcXG5cIiArXG5cIiAgICBnbF9Qb3NpdGlvbiA9IHZlYzQoMC4pO1xcblwiICtcblwiICAgIHJldHVybjtcXG5cIiArXG5cIiAgfVxcblwiICtcblwiICB2X3NlbGVjdGlvbl9jb2xvciA9IGFfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgdmVjNCBwb3NpdGlvbiA9IHVfdGlsZV92aWV3ICogdmVjNChhX3Bvc2l0aW9uLCAxLik7XFxuXCIgK1xuXCIgIHZfd29ybGRfcG9zaXRpb24gPSB1X3RpbGVfd29ybGQgKiB2ZWM0KGFfcG9zaXRpb24sIDEuKTtcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoV09STERfUE9TSVRJT05fV1JBUClcXG5cIiArXG5cIiAgdl93b3JsZF9wb3NpdGlvbi54eSAtPSB3b3JsZF9wb3NpdGlvbl9hbmNob3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI3ByYWdtYSB0YW5ncmFtOiB2ZXJ0ZXhcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIiAgdl9jb2xvciA9IGFfY29sb3I7XFxuXCIgK1xuXCIgIHZfbGlnaHRpbmcgPSBkX3hfbGlnaHRpbmcocG9zaXRpb24sIGFfbm9ybWFsLCB2ZWMzKDEuKSwgdmVjNCgwLiwgMC4sIDE1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKSwgdmVjNCgwLiwgMC4sIDUwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCwgMS4pLCB2ZWMzKDAuMiwgMC43LCAtMC41KSwgbGlnaHRfYW1iaWVudCk7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIHZfcG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIiAgdl9ub3JtYWwgPSBhX25vcm1hbDtcXG5cIiArXG5cIiAgdl9jb2xvciA9IGFfY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBwb3NpdGlvbiA9IHVfbWV0ZXJfdmlldyAqIHBvc2l0aW9uO1xcblwiICtcblwiICAjaWYgZGVmaW5lZChQUk9KRUNUSU9OX1BFUlNQRUNUSVZFKVxcblwiICtcblwiICBwb3NpdGlvbiA9IGFfeF9wZXJzcGVjdGl2ZShwb3NpdGlvbiwgdmVjMigwLiwgMC4pLCB2ZWMyKDAuNiwgMC42KSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoUFJPSkVDVElPTl9JU09NRVRSSUMpIC8vIHx8IGRlZmluZWQoUFJPSkVDVElPTl9QT1BVUClcXG5cIiArXG5cIiAgcG9zaXRpb24gPSBiX3hfaXNvbWV0cmljKHBvc2l0aW9uLCB2ZWMyKDAuLCAxLiksIDEuKTtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHBvc2l0aW9uLnogPSBjX3hfY2FsY3VsYXRlWihwb3NpdGlvbi56LCBhX2xheWVyLCB1X251bV9sYXllcnMsIDQwOTYuKTtcXG5cIiArXG5cIiAgZ2xfUG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1snc2VsZWN0aW9uX2ZyYWdtZW50J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cIiNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluKHZvaWQpIHtcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiICBnbF9GcmFnQ29sb3IgPSB2X3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgZ2xfRnJhZ0NvbG9yID0gdmVjMygwLiwgMC4sIDAuLCAxLik7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1snc2ltcGxlX3BvbHlnb25fZnJhZ21lbnQnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21ldGVyc19wZXJfcGl4ZWw7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cIiNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3Bvc2l0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfbm9ybWFsO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzMgYV94X3BvaW50TGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgY29sb3IgKj0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbih2b2lkKSB7XFxuXCIgK1xuXCIgIHZlYzMgY29sb3I7XFxuXCIgK1xuXCIgICNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpIC8vIGRlZmF1bHQgdG8gcGVyLXBpeGVsIGxpZ2h0aW5nXFxuXCIgK1xuXCIgIHZlYzQgbGlnaHRfcG9zID0gdmVjNCgwLiwgMC4sIDE1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKTtcXG5cIiArXG5cIiAgY29uc3QgZmxvYXQgbGlnaHRfYW1iaWVudCA9IDAuNTtcXG5cIiArXG5cIiAgY29uc3QgYm9vbCBiYWNrbGl0ID0gdHJ1ZTtcXG5cIiArXG5cIiAgY29sb3IgPSBhX3hfcG9pbnRMaWdodCh2X3Bvc2l0aW9uLCB2X25vcm1hbCwgdl9jb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCBiYWNrbGl0KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgY29sb3IgPSB2X2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogZnJhZ21lbnRcXG5cIiArXG5cIiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwgMS4wKTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1snc2ltcGxlX3BvbHlnb25fdmVydGV4J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X2FzcGVjdDtcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X3RpbGVfdmlldztcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X21ldGVyX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWV0ZXJzX3Blcl9waXhlbDtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9udW1fbGF5ZXJzO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9wb3NpdGlvbjtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfbm9ybWFsO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9jb2xvcjtcXG5cIiArXG5cImF0dHJpYnV0ZSBmbG9hdCBhX2xheWVyO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCIjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X25vcm1hbDtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCJ2ZWM0IGFfeF9wZXJzcGVjdGl2ZSh2ZWM0IHBvc2l0aW9uLCBjb25zdCB2ZWMyIHBlcnNwZWN0aXZlX29mZnNldCwgY29uc3QgdmVjMiBwZXJzcGVjdGl2ZV9mYWN0b3IpIHtcXG5cIiArXG5cIiAgcG9zaXRpb24ueHkgKz0gcG9zaXRpb24ueiAqIHBlcnNwZWN0aXZlX2ZhY3RvciAqIChwb3NpdGlvbi54eSAtIHBlcnNwZWN0aXZlX29mZnNldCk7XFxuXCIgK1xuXCIgIHJldHVybiBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzQgYl94X2lzb21ldHJpYyh2ZWM0IHBvc2l0aW9uLCBjb25zdCB2ZWMyIGF4aXMsIGNvbnN0IGZsb2F0IG11bHRpcGxpZXIpIHtcXG5cIiArXG5cIiAgcG9zaXRpb24ueHkgKz0gcG9zaXRpb24ueiAqIGF4aXMgKiBtdWx0aXBsaWVyIC8gdV9hc3BlY3Q7XFxuXCIgK1xuXCIgIHJldHVybiBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cImZsb2F0IGNfeF9jYWxjdWxhdGVaKGZsb2F0IHosIGZsb2F0IGxheWVyLCBjb25zdCBmbG9hdCBudW1fbGF5ZXJzLCBjb25zdCBmbG9hdCB6X2xheWVyX3NjYWxlKSB7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXJfcmFuZ2UgPSAobnVtX2xheWVycyArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXIgPSAobGF5ZXIgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICB6ID0gel9sYXllciArIGNsYW1wKHosIDAuLCB6X2xheWVyX3NjYWxlKTtcXG5cIiArXG5cIiAgeiA9ICh6X2xheWVyX3JhbmdlIC0geikgLyB6X2xheWVyX3JhbmdlO1xcblwiICtcblwiICByZXR1cm4gejtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZF94X3BvaW50TGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgY29sb3IgKj0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbigpIHtcXG5cIiArXG5cIiAgdmVjNCBwb3NpdGlvbiA9IHVfdGlsZV92aWV3ICogdmVjNChhX3Bvc2l0aW9uLCAxLik7XFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogdmVydGV4XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCIgIHZlYzQgbGlnaHRfcG9zID0gdmVjNCgwLiwgMC4sIDE1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKTtcXG5cIiArXG5cIiAgY29uc3QgZmxvYXQgbGlnaHRfYW1iaWVudCA9IDAuNTtcXG5cIiArXG5cIiAgY29uc3QgYm9vbCBiYWNrbGl0ID0gdHJ1ZTtcXG5cIiArXG5cIiAgdl9jb2xvciA9IGRfeF9wb2ludExpZ2h0KHBvc2l0aW9uLCBhX25vcm1hbCwgYV9jb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCBiYWNrbGl0KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgdl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xcblwiICtcblwiICB2X25vcm1hbCA9IGFfbm9ybWFsO1xcblwiICtcblwiICB2X2NvbG9yID0gYV9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHBvc2l0aW9uID0gdV9tZXRlcl92aWV3ICogcG9zaXRpb247XFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKFBST0pFQ1RJT05fUEVSU1BFQ1RJVkUpXFxuXCIgK1xuXCIgIHBvc2l0aW9uID0gYV94X3BlcnNwZWN0aXZlKHBvc2l0aW9uLCB2ZWMyKC0wLjI1LCAtMC4yNSksIHZlYzIoMC42LCAwLjYpKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChQUk9KRUNUSU9OX0lTT01FVFJJQylcXG5cIiArXG5cIiAgcG9zaXRpb24gPSBiX3hfaXNvbWV0cmljKHBvc2l0aW9uLCB2ZWMyKDAuLCAxLiksIDEuKTtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHBvc2l0aW9uLnogPSBjX3hfY2FsY3VsYXRlWihwb3NpdGlvbi56LCBhX2xheWVyLCB1X251bV9sYXllcnMsIDQwOTYuKTtcXG5cIiArXG5cIiAgZ2xfUG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5pZiAobW9kdWxlLmV4cG9ydHMgIT09IHVuZGVmaW5lZCkgeyBtb2R1bGUuZXhwb3J0cyA9IHNoYWRlcl9zb3VyY2VzOyB9XG5cbiIsIi8vIFRleHR1cmUgbWFuYWdlbWVudFxuXG52YXIgR0wgPSByZXF1aXJlKCcuL2dsLmpzJyk7XG52YXIgVXRpbHMgPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xuXG4vLyBHbG9iYWwgc2V0IG9mIHRleHR1cmVzLCBieSBuYW1lXG5HTFRleHR1cmUudGV4dHVyZXMgPSB7fTtcblxuLy8gR0wgdGV4dHVyZSB3cmFwcGVyIG9iamVjdCBmb3Iga2VlcGluZyB0cmFjayBvZiBhIGdsb2JhbCBzZXQgb2YgdGV4dHVyZXMsIGtleWVkIGJ5IGFuIGFyYml0cmFyeSBuYW1lXG5mdW5jdGlvbiBHTFRleHR1cmUgKGdsLCBuYW1lLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5nbCA9IGdsO1xuICAgIHRoaXMudGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICB0aGlzLmJpbmQoMCk7XG4gICAgdGhpcy5pbWFnZSA9IG51bGw7XG5cbiAgICAvLyBEZWZhdWx0IHRvIGEgMS1waXhlbCBibGFjayB0ZXh0dXJlIHNvIHdlIGNhbiBzYWZlbHkgcmVuZGVyIHdoaWxlIHdlIHdhaXQgZm9yIGFuIGltYWdlIHRvIGxvYWRcbiAgICAvLyBTZWU6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTk3MjIyNDcvd2ViZ2wtd2FpdC1mb3ItdGV4dHVyZS10by1sb2FkXG4gICAgdGhpcy5zZXREYXRhKDEsIDEsIG5ldyBVaW50OEFycmF5KFswLCAwLCAwLCAyNTVdKSwgeyBmaWx0ZXJpbmc6ICduZWFyZXN0JyB9KTtcblxuICAgIC8vIFRPRE86IGJldHRlciBzdXBwb3J0IGZvciBub24tVVJMIHNvdXJjZXM6IGNhbnZhcy92aWRlbyBlbGVtZW50cywgcmF3IHBpeGVsIGJ1ZmZlcnNcblxuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgR0xUZXh0dXJlLnRleHR1cmVzW3RoaXMubmFtZV0gPSB0aGlzO1xufTtcblxuR0xUZXh0dXJlLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKHVuaXQpIHtcbiAgICB0aGlzLmdsLmFjdGl2ZVRleHR1cmUodGhpcy5nbC5URVhUVVJFMCArIHVuaXQpO1xuICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUpO1xufTtcblxuLy8gTG9hZHMgYSB0ZXh0dXJlIGZyb20gYSBVUkxcbkdMVGV4dHVyZS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy5pbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMuaW1hZ2Uud2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5pbWFnZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuZGF0YSA9IG51bGw7IC8vIG11dHVhbGx5IGV4Y2x1c2l2ZSB3aXRoIGRpcmVjdCBkYXRhIGJ1ZmZlciB0ZXh0dXJlc1xuICAgICAgICB0aGlzLnVwZGF0ZShvcHRpb25zKTtcbiAgICAgICAgdGhpcy5zZXRUZXh0dXJlRmlsdGVyaW5nKG9wdGlvbnMpO1xuICAgIH0uYmluZCh0aGlzKTtcbiAgICB0aGlzLmltYWdlLnNyYyA9IHVybDtcbn07XG5cbi8vIFNldHMgdGV4dHVyZSB0byBhIHJhdyBpbWFnZSBidWZmZXJcbkdMVGV4dHVyZS5wcm90b3R5cGUuc2V0RGF0YSA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0LCBkYXRhLCBvcHRpb25zKSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgdGhpcy5pbWFnZSA9IG51bGw7IC8vIG11dHVhbGx5IGV4Y2x1c2l2ZSB3aXRoIGltYWdlIGVsZW1lbnQtYmFzZWQgdGV4dHVyZXNcblxuICAgIHRoaXMudXBkYXRlKG9wdGlvbnMpO1xuICAgIHRoaXMuc2V0VGV4dHVyZUZpbHRlcmluZyhvcHRpb25zKTtcbn07XG5cbi8vIFVwbG9hZHMgY3VycmVudCBpbWFnZSBvciBidWZmZXIgdG8gdGhlIEdQVSAoY2FuIGJlIHVzZWQgdG8gdXBkYXRlIGFuaW1hdGVkIHRleHR1cmVzIG9uIHRoZSBmbHkpXG5HTFRleHR1cmUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB0aGlzLmJpbmQoMCk7XG4gICAgdGhpcy5nbC5waXhlbFN0b3JlaSh0aGlzLmdsLlVOUEFDS19GTElQX1lfV0VCR0wsIChvcHRpb25zLlVOUEFDS19GTElQX1lfV0VCR0wgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlKSk7XG5cbiAgICAvLyBJbWFnZSBlbGVtZW50XG4gICAgaWYgKHRoaXMuaW1hZ2UgJiYgdGhpcy5pbWFnZS5jb21wbGV0ZSkge1xuICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQodGhpcy5nbC5URVhUVVJFXzJELCAwLCB0aGlzLmdsLlJHQkEsIHRoaXMuZ2wuUkdCQSwgdGhpcy5nbC5VTlNJR05FRF9CWVRFLCB0aGlzLmltYWdlKTtcbiAgICB9XG4gICAgLy8gUmF3IGltYWdlIGJ1ZmZlclxuICAgIGVsc2UgaWYgKHRoaXMud2lkdGggJiYgdGhpcy5oZWlnaHQpIHsgLy8gTk9URTogdGhpcy5kYXRhIGNhbiBiZSBudWxsLCB0byB6ZXJvIG91dCB0ZXh0dXJlXG4gICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRCh0aGlzLmdsLlRFWFRVUkVfMkQsIDAsIHRoaXMuZ2wuUkdCQSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDAsIHRoaXMuZ2wuUkdCQSwgdGhpcy5nbC5VTlNJR05FRF9CWVRFLCB0aGlzLmRhdGEpO1xuICAgIH1cbn07XG5cbi8vIERldGVybWluZXMgYXBwcm9wcmlhdGUgZmlsdGVyaW5nIG1vZGVcbi8vIEFzc3VtZXMgdGV4dHVyZSB0byBiZSBvcGVyYXRlZCBvbiBpcyBhbHJlYWR5IGJvdW5kXG5HTFRleHR1cmUucHJvdG90eXBlLnNldFRleHR1cmVGaWx0ZXJpbmcgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuZmlsdGVyaW5nID0gb3B0aW9ucy5maWx0ZXJpbmcgfHwgJ21pcG1hcCc7IC8vIGRlZmF1bHQgdG8gbWlwbWFwcyBmb3IgcG93ZXItb2YtMiB0ZXh0dXJlc1xuICAgIHZhciBnbCA9IHRoaXMuZ2w7XG5cbiAgICAvLyBGb3IgcG93ZXItb2YtMiB0ZXh0dXJlcywgdGhlIGZvbGxvd2luZyBwcmVzZXRzIGFyZSBhdmFpbGFibGU6XG4gICAgLy8gbWlwbWFwOiBsaW5lYXIgYmxlbmQgZnJvbSBuZWFyZXN0IG1pcFxuICAgIC8vIGxpbmVhcjogbGluZWFyIGJsZW5kIGZyb20gb3JpZ2luYWwgaW1hZ2UgKG5vIG1pcHMpXG4gICAgLy8gbmVhcmVzdDogbmVhcmVzdCBwaXhlbCBmcm9tIG9yaWdpbmFsIGltYWdlIChubyBtaXBzLCAnYmxvY2t5JyBsb29rKVxuICAgIGlmIChVdGlscy5pc1Bvd2VyT2YyKHRoaXMud2lkdGgpICYmIFV0aWxzLmlzUG93ZXJPZjIodGhpcy5oZWlnaHQpKSB7XG4gICAgICAgIHRoaXMucG93ZXJfb2ZfMiA9IHRydWU7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIG9wdGlvbnMuVEVYVFVSRV9XUkFQX1MgfHwgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIG9wdGlvbnMuVEVYVFVSRV9XUkFQX1QgfHwgZ2wuQ0xBTVBfVE9fRURHRSk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZmlsdGVyaW5nID09ICdtaXBtYXAnKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInBvd2VyLW9mLTIgTUlQTUFQXCIpO1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJpbmcgPSAnbWlwbWFwJztcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5MSU5FQVJfTUlQTUFQX05FQVJFU1QpOyAvLyBUT0RPOiB1c2UgdHJpbGluZWFyIGZpbHRlcmluZyBieSBkZWZ1YWx0IGluc3RlYWQ/XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgICAgIGdsLmdlbmVyYXRlTWlwbWFwKGdsLlRFWFRVUkVfMkQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuZmlsdGVyaW5nID09ICdsaW5lYXInKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInBvd2VyLW9mLTIgTElORUFSXCIpO1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJpbmcgPSAnbGluZWFyJztcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5maWx0ZXJpbmcgPT0gJ25lYXJlc3QnKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInBvd2VyLW9mLTIgTkVBUkVTVFwiKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyaW5nID0gJ25lYXJlc3QnO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBXZWJHTCBoYXMgc3RyaWN0IHJlcXVpcmVtZW50cyBvbiBub24tcG93ZXItb2YtMiB0ZXh0dXJlczpcbiAgICAgICAgLy8gTm8gbWlwbWFwcyBhbmQgbXVzdCBjbGFtcCB0byBlZGdlXG4gICAgICAgIHRoaXMucG93ZXJfb2ZfMiA9IGZhbHNlO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZmlsdGVyaW5nID09ICduZWFyZXN0Jykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3dlci1vZi0yIE5FQVJFU1RcIik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmluZyA9ICduZWFyZXN0JztcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgLy8gZGVmYXVsdCB0byBsaW5lYXIgZm9yIG5vbi1wb3dlci1vZi0yIHRleHR1cmVzXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInBvd2VyLW9mLTIgTElORUFSXCIpO1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJpbmcgPSAnbGluZWFyJztcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdMVGV4dHVyZTtcbn1cbiIsIi8vIERlc2NyaWJlcyBhIHZlcnRleCBsYXlvdXQgdGhhdCBjYW4gYmUgdXNlZCB3aXRoIG1hbnkgZGlmZmVyZW50IEdMIHByb2dyYW1zLlxuLy8gSWYgYSBnaXZlbiBwcm9ncmFtIGRvZXNuJ3QgaW5jbHVkZSBhbGwgYXR0cmlidXRlcywgaXQgY2FuIHN0aWxsIHVzZSB0aGUgdmVydGV4IGxheW91dFxuLy8gdG8gcmVhZCB0aG9zZSBhdHRyaWJzIHRoYXQgaXQgZG9lcyByZWNvZ25pemUsIHVzaW5nIHRoZSBhdHRyaWIgb2Zmc2V0cyB0byBza2lwIG90aGVycy5cbi8vIEF0dHJpYnMgYXJlIGFuIGFycmF5LCBpbiBsYXlvdXQgb3JkZXIsIG9mOiBuYW1lLCBzaXplLCB0eXBlLCBub3JtYWxpemVkXG4vLyBleDogeyBuYW1lOiAncG9zaXRpb24nLCBzaXplOiAzLCB0eXBlOiBnbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuZnVuY3Rpb24gR0xWZXJ0ZXhMYXlvdXQgKGdsLCBhdHRyaWJzKVxue1xuICAgIHRoaXMuYXR0cmlicyA9IGF0dHJpYnM7XG5cbiAgICAvLyBDYWxjIHZlcnRleCBzdHJpZGVcbiAgICB0aGlzLnN0cmlkZSA9IDA7XG4gICAgZm9yICh2YXIgYT0wOyBhIDwgdGhpcy5hdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIHZhciBhdHRyaWIgPSB0aGlzLmF0dHJpYnNbYV07XG5cbiAgICAgICAgYXR0cmliLmJ5dGVfc2l6ZSA9IGF0dHJpYi5zaXplO1xuXG4gICAgICAgIHN3aXRjaCAoYXR0cmliLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgZ2wuRkxPQVQ6XG4gICAgICAgICAgICBjYXNlIGdsLklOVDpcbiAgICAgICAgICAgIGNhc2UgZ2wuVU5TSUdORURfSU5UOlxuICAgICAgICAgICAgICAgIGF0dHJpYi5ieXRlX3NpemUgKj0gNDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgZ2wuU0hPUlQ6XG4gICAgICAgICAgICBjYXNlIGdsLlVOU0lHTkVEX1NIT1JUOlxuICAgICAgICAgICAgICAgIGF0dHJpYi5ieXRlX3NpemUgKj0gMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGF0dHJpYi5vZmZzZXQgPSB0aGlzLnN0cmlkZTtcbiAgICAgICAgdGhpcy5zdHJpZGUgKz0gYXR0cmliLmJ5dGVfc2l6ZTtcbiAgICB9XG59XG5cbi8vIFRyYWNrIGN1cnJlbnRseSBlbmFibGVkIGF0dHJpYnMsIGJ5IHRoZSBwcm9ncmFtIHRoZXkgYXJlIGJvdW5kIHRvXG5HTFZlcnRleExheW91dC5lbmFibGVkX2F0dHJpYnMgPSB7fTtcblxuLy8gU2V0dXAgYSB2ZXJ0ZXggbGF5b3V0IGZvciBhIHNwZWNpZmljIEdMIHByb2dyYW1cbi8vIEFzc3VtZXMgdGhhdCB0aGUgZGVzaXJlZCB2ZXJ0ZXggYnVmZmVyIChWQk8pIGlzIGFscmVhZHkgYm91bmRcbkdMVmVydGV4TGF5b3V0LnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbiAoZ2wsIGdsX3Byb2dyYW0pXG57XG4gICAgLy8gRW5hYmxlIGFsbCBhdHRyaWJ1dGVzIGZvciB0aGlzIGxheW91dFxuICAgIGZvciAodmFyIGE9MDsgYSA8IHRoaXMuYXR0cmlicy5sZW5ndGg7IGErKykge1xuICAgICAgICB2YXIgYXR0cmliID0gdGhpcy5hdHRyaWJzW2FdO1xuICAgICAgICB2YXIgbG9jYXRpb24gPSBnbF9wcm9ncmFtLmF0dHJpYnV0ZShhdHRyaWIubmFtZSkubG9jYXRpb247XG5cbiAgICAgICAgaWYgKGxvY2F0aW9uICE9IC0xKSB7XG4gICAgICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbik7XG4gICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGxvY2F0aW9uLCBhdHRyaWIuc2l6ZSwgYXR0cmliLnR5cGUsIGF0dHJpYi5ub3JtYWxpemVkLCB0aGlzLnN0cmlkZSwgYXR0cmliLm9mZnNldCk7XG4gICAgICAgICAgICBHTFZlcnRleExheW91dC5lbmFibGVkX2F0dHJpYnNbbG9jYXRpb25dID0gZ2xfcHJvZ3JhbTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIERpc2FibGUgYW55IHByZXZpb3VzbHkgYm91bmQgYXR0cmlidXRlcyB0aGF0IGFyZW4ndCBmb3IgdGhpcyBsYXlvdXRcbiAgICB2YXIgdW51c3VlZF9hdHRyaWJzID0gW107XG4gICAgZm9yIChsb2NhdGlvbiBpbiBHTFZlcnRleExheW91dC5lbmFibGVkX2F0dHJpYnMpIHtcbiAgICAgICAgaWYgKEdMVmVydGV4TGF5b3V0LmVuYWJsZWRfYXR0cmlic1tsb2NhdGlvbl0gIT0gZ2xfcHJvZ3JhbSkge1xuICAgICAgICAgICAgZ2wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcbiAgICAgICAgICAgIHVudXN1ZWRfYXR0cmlicy5wdXNoKGxvY2F0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1hcmsgYXR0cmlicyBhcyB1bnVzZWRcbiAgICBmb3IgKGxvY2F0aW9uIGluIHVudXN1ZWRfYXR0cmlicykge1xuICAgICAgICBkZWxldGUgR0xWZXJ0ZXhMYXlvdXQuZW5hYmxlZF9hdHRyaWJzW2xvY2F0aW9uXTtcbiAgICB9XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdMVmVydGV4TGF5b3V0O1xufVxuIiwidmFyIFNjZW5lID0gcmVxdWlyZSgnLi9zY2VuZS5qcycpO1xuXG52YXIgTGVhZmxldExheWVyID0gTC5HcmlkTGF5ZXIuZXh0ZW5kKHtcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5zY2VuZSA9IG5ldyBTY2VuZSh0aGlzLm9wdGlvbnMudmVjdG9yVGlsZVNvdXJjZSwgdGhpcy5vcHRpb25zLnZlY3RvckxheWVycywgdGhpcy5vcHRpb25zLnZlY3RvclN0eWxlcywgeyBudW1fd29ya2VyczogdGhpcy5vcHRpb25zLm51bVdvcmtlcnMgfSk7XG4gICAgICAgIHRoaXMuc2NlbmUuZGVidWcgPSB0aGlzLm9wdGlvbnMuZGVidWc7XG4gICAgICAgIHRoaXMuc2NlbmUuY29udGludW91c19hbmltYXRpb24gPSBmYWxzZTsgLy8gc2V0IHRvIHRydWUgZm9yIGFuaW1hdGlub3MsIGV0Yy4gKGV2ZW50dWFsbHkgd2lsbCBiZSBhdXRvbWF0ZWQpXG4gICAgfSxcblxuICAgIC8vIEZpbmlzaCBpbml0aWFsaXppbmcgc2NlbmUgYW5kIHNldHVwIGV2ZW50cyB3aGVuIGxheWVyIGlzIGFkZGVkIHRvIG1hcFxuICAgIG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgICAgIHZhciBsYXllciA9IHRoaXM7XG5cbiAgICAgICAgbGF5ZXIub24oJ3RpbGV1bmxvYWQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciB0aWxlID0gZXZlbnQudGlsZTtcbiAgICAgICAgICAgIHZhciBrZXkgPSB0aWxlLmdldEF0dHJpYnV0ZSgnZGF0YS10aWxlLWtleScpO1xuICAgICAgICAgICAgbGF5ZXIuc2NlbmUucmVtb3ZlVGlsZShrZXkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsYXllci5fbWFwLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IGxheWVyLl9tYXAuZ2V0U2l6ZSgpO1xuICAgICAgICAgICAgbGF5ZXIuc2NlbmUucmVzaXplTWFwKHNpemUueCwgc2l6ZS55KTtcbiAgICAgICAgICAgIGxheWVyLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsYXllci5fbWFwLm9uKCdtb3ZlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGNlbnRlciA9IGxheWVyLl9tYXAuZ2V0Q2VudGVyKCk7XG4gICAgICAgICAgICBsYXllci5zY2VuZS5zZXRDZW50ZXIoY2VudGVyLmxuZywgY2VudGVyLmxhdCk7XG4gICAgICAgICAgICBsYXllci51cGRhdGVCb3VuZHMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF5ZXIuX21hcC5vbignem9vbXN0YXJ0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJtYXAuem9vbXN0YXJ0IFwiICsgbGF5ZXIuX21hcC5nZXRab29tKCkpO1xuICAgICAgICAgICAgbGF5ZXIuc2NlbmUuc3RhcnRab29tKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxheWVyLl9tYXAub24oJ3pvb21lbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1hcC56b29tZW5kIFwiICsgbGF5ZXIuX21hcC5nZXRab29tKCkpO1xuICAgICAgICAgICAgbGF5ZXIuc2NlbmUuc2V0Wm9vbShsYXllci5fbWFwLmdldFpvb20oKSk7XG4gICAgICAgICAgICBsYXllci51cGRhdGVCb3VuZHMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF5ZXIuX21hcC5vbignZHJhZ3N0YXJ0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGF5ZXIuc2NlbmUucGFubmluZyA9IHRydWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxheWVyLl9tYXAub24oJ2RyYWdlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsYXllci5zY2VuZS5wYW5uaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENhbnZhcyBlbGVtZW50IHdpbGwgYmUgaW5zZXJ0ZWQgYWZ0ZXIgbWFwIGNvbnRhaW5lciAobGVhZmxldCB0cmFuc2Zvcm1zIHNob3VsZG4ndCBiZSBhcHBsaWVkIHRvIHRoZSBHTCBjYW52YXMpXG4gICAgICAgIC8vIFRPRE86IGZpbmQgYSBiZXR0ZXIgd2F5IHRvIGRlYWwgd2l0aCB0aGlzPyByaWdodCBub3cgR0wgbWFwIG9ubHkgcmVuZGVycyBjb3JyZWN0bHkgYXMgdGhlIGJvdHRvbSBsYXllclxuICAgICAgICBsYXllci5zY2VuZS5jb250YWluZXIgPSBsYXllci5fbWFwLmdldENvbnRhaW5lcigpO1xuXG4gICAgICAgIHZhciBjZW50ZXIgPSBsYXllci5fbWFwLmdldENlbnRlcigpO1xuICAgICAgICBsYXllci5zY2VuZS5zZXRDZW50ZXIoY2VudGVyLmxuZywgY2VudGVyLmxhdCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiem9vbTogXCIgKyBsYXllci5fbWFwLmdldFpvb20oKSk7XG4gICAgICAgIGxheWVyLnNjZW5lLnNldFpvb20obGF5ZXIuX21hcC5nZXRab29tKCkpO1xuICAgICAgICBsYXllci51cGRhdGVCb3VuZHMoKTtcblxuICAgICAgICBMLkdyaWRMYXllci5wcm90b3R5cGUub25BZGQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgbGF5ZXIuc2NlbmUuaW5pdCgpO1xuICAgIH0sXG5cbiAgICBvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xuICAgICAgICBMLkdyaWRMYXllci5wcm90b3R5cGUub25SZW1vdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgLy8gVE9ETzogcmVtb3ZlIGV2ZW50IGhhbmRsZXJzLCBkZXN0cm95IG1hcFxuICAgIH0sXG5cbiAgICBjcmVhdGVUaWxlOiBmdW5jdGlvbiAoY29vcmRzLCBkb25lKSB7XG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGhpcy5zY2VuZS5sb2FkVGlsZShjb29yZHMsIGRpdiwgZG9uZSk7XG4gICAgICAgIHJldHVybiBkaXY7XG4gICAgfSxcblxuICAgIHVwZGF0ZUJvdW5kczogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzO1xuICAgICAgICB2YXIgYm91bmRzID0gbGF5ZXIuX21hcC5nZXRCb3VuZHMoKTtcbiAgICAgICAgbGF5ZXIuc2NlbmUuc2V0Qm91bmRzKGJvdW5kcy5nZXRTb3V0aFdlc3QoKSwgYm91bmRzLmdldE5vcnRoRWFzdCgpKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2NlbmUucmVuZGVyKCk7XG4gICAgfVxuXG59KTtcblxudmFyIGxlYWZsZXRMYXllciA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBMZWFmbGV0TGF5ZXIob3B0aW9ucyk7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgTGVhZmxldExheWVyOiBMZWFmbGV0TGF5ZXIsXG4gICAgICAgIGxlYWZsZXRMYXllcjogbGVhZmxldExheWVyXG4gICAgfTtcbn1cbiIsIi8vIE1vZHVsZXMgYW5kIGRlcGVuZGVuY2llcyB0byBleHBvc2UgaW4gdGhlIHB1YmxpYyBUYW5ncmFtIG1vZHVsZVxuXG4vLyBUaGUgbGVhZmxldCBsYXllciBwbHVnaW4gaXMgY3VycmVudGx5IHRoZSBwcmltYXJ5IG1lYW5zIG9mIHVzaW5nIHRoZSBsaWJyYXJ5XG52YXIgTGVhZmxldCA9IHJlcXVpcmUoJy4vbGVhZmxldF9sYXllci5qcycpO1xuXG4vLyBHTCBmdW5jdGlvbnMgaW5jbHVkZWQgZm9yIGVhc2llciBkZWJ1Z2dpbmcgLyBkaXJlY3QgYWNjZXNzIHRvIHNldHRpbmcgZ2xvYmFsIGRlZmluZXMsIHJlbG9hZGluZyBwcm9ncmFtcywgZXRjLlxudmFyIEdMID0gcmVxdWlyZSgnLi9nbC9nbC5qcycpO1xuR0wuUHJvZ3JhbSA9IHJlcXVpcmUoJy4vZ2wvZ2xfcHJvZ3JhbS5qcycpO1xuR0wuVGV4dHVyZSA9IHJlcXVpcmUoJy4vZ2wvZ2xfdGV4dHVyZS5qcycpO1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgTGVhZmxldExheWVyOiBMZWFmbGV0LkxlYWZsZXRMYXllcixcbiAgICAgICAgbGVhZmxldExheWVyOiBMZWFmbGV0LmxlYWZsZXRMYXllcixcbiAgICAgICAgR0w6IEdMXG4gICAgfTtcbn1cbiIsIi8vIFBvaW50XG5mdW5jdGlvbiBQb2ludCAoeCwgeSlcbntcbiAgICByZXR1cm4geyB4OiB4LCB5OiB5IH07XG59XG5cblBvaW50LmNvcHkgPSBmdW5jdGlvbiAocClcbntcbiAgICBpZiAocCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4geyB4OiBwLngsIHk6IHAueSB9O1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQb2ludDtcbn1cbiIsInZhciBQb2ludCA9IHJlcXVpcmUoJy4vcG9pbnQuanMnKTtcbnZhciBHZW8gPSByZXF1aXJlKCcuL2dlby5qcycpO1xudmFyIFN0eWxlID0gcmVxdWlyZSgnLi9zdHlsZS5qcycpO1xudmFyIE1vZGVNYW5hZ2VyID0gcmVxdWlyZSgnLi9nbC9nbF9tb2RlcycpLk1vZGVNYW5hZ2VyO1xudmFyIFV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcycpO1xuXG52YXIgR0wgPSByZXF1aXJlKCcuL2dsL2dsLmpzJyk7XG52YXIgR0xQcm9ncmFtID0gcmVxdWlyZSgnLi9nbC9nbF9wcm9ncmFtLmpzJyk7XG52YXIgR0xCdWlsZGVycyA9IHJlcXVpcmUoJy4vZ2wvZ2xfYnVpbGRlcnMuanMnKTtcbnZhciBHTFRleHR1cmUgPSByZXF1aXJlKCcuL2dsL2dsX3RleHR1cmUuanMnKTtcblxudmFyIG1hdDQgPSByZXF1aXJlKCdnbC1tYXRyaXgnKS5tYXQ0O1xudmFyIHZlYzMgPSByZXF1aXJlKCdnbC1tYXRyaXgnKS52ZWMzO1xuXG4vLyBTZXR1cCB0aGF0IGhhcHBlbnMgb24gbWFpbiB0aHJlYWQgb25seSAoc2tpcCBpbiB3ZWIgd29ya2VyKVxudmFyIHlhbWw7XG5VdGlscy5ydW5JZkluTWFpblRocmVhZChmdW5jdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgICB5YW1sID0gcmVxdWlyZSgnanMteWFtbCcpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vIFlBTUwgc3VwcG9ydCwganMteWFtbCBtb2R1bGUgbm90IGZvdW5kXCIpO1xuICAgIH1cblxuICAgIGZpbmRCYXNlTGlicmFyeVVSTCgpO1xufSk7XG5cbi8vIEdsb2JhbCBzZXR1cFxuU2NlbmUudGlsZV9zY2FsZSA9IDQwOTY7IC8vIGNvb3JkaW5hdGVzIGFyZSBsb2NhbGx5IHNjYWxlZCB0byB0aGUgcmFuZ2UgWzAsIHRpbGVfc2NhbGVdXG5HZW8uc2V0VGlsZVNjYWxlKFNjZW5lLnRpbGVfc2NhbGUpO1xuR0xCdWlsZGVycy5zZXRUaWxlU2NhbGUoU2NlbmUudGlsZV9zY2FsZSk7XG5HTFByb2dyYW0uZGVmaW5lcy5USUxFX1NDQUxFID0gU2NlbmUudGlsZV9zY2FsZTtcblNjZW5lLmRlYnVnID0gZmFsc2U7XG5cbi8vIExheWVycyAmIHN0eWxlczogcGFzcyBhbiBvYmplY3QgZGlyZWN0bHksIG9yIGEgVVJMIGFzIHN0cmluZyB0byBsb2FkIHJlbW90ZWx5XG5mdW5jdGlvbiBTY2VuZSAodGlsZV9zb3VyY2UsIGxheWVycywgc3R5bGVzLCBvcHRpb25zKVxue1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLnRpbGVfc291cmNlID0gdGlsZV9zb3VyY2U7XG4gICAgdGhpcy50aWxlcyA9IHt9O1xuICAgIHRoaXMubnVtX3dvcmtlcnMgPSBvcHRpb25zLm51bV93b3JrZXJzIHx8IDE7XG4gICAgdGhpcy5hbGxvd19jcm9zc19kb21haW5fd29ya2VycyA9IChvcHRpb25zLmFsbG93X2Nyb3NzX2RvbWFpbl93b3JrZXJzID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSk7XG5cbiAgICBpZiAodHlwZW9mIGxheWVycyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5sYXllcl9zb3VyY2UgPSBVdGlscy51cmxGb3JQYXRoKGxheWVycyk7XG4gICAgICAgIHRoaXMubGF5ZXJzID0gU2NlbmUubG9hZExheWVycyh0aGlzLmxheWVyX3NvdXJjZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmxheWVycyA9IGxheWVycztcbiAgICB9XG4gICAgdGhpcy5sYXllcnNfc2VyaWFsaXplZCA9IFV0aWxzLnNlcmlhbGl6ZVdpdGhGdW5jdGlvbnModGhpcy5sYXllcnMpO1xuXG4gICAgaWYgKHR5cGVvZiBzdHlsZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuc3R5bGVfc291cmNlID0gVXRpbHMudXJsRm9yUGF0aChzdHlsZXMpO1xuICAgICAgICB0aGlzLnN0eWxlcyA9IFNjZW5lLmxvYWRTdHlsZXModGhpcy5zdHlsZV9zb3VyY2UpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBTY2VuZS5wb3N0UHJvY2Vzc1N0eWxlcyhzdHlsZXMpO1xuICAgIH1cbiAgICB0aGlzLnN0eWxlc19zZXJpYWxpemVkID0gVXRpbHMuc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyh0aGlzLnN0eWxlcyk7XG5cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTsgLy8gcmVxdWVzdCBhIHJlZHJhd1xuICAgIHRoaXMuYW5pbWF0ZWQgPSBmYWxzZTsgLy8gcmVxdWVzdCByZWRyYXcgZXZlcnkgZnJhbWVcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgICB0aGlzLm1vZGVzID0gU2NlbmUuY3JlYXRlTW9kZXMoe30sIHRoaXMuc3R5bGVzKTtcbiAgICB0aGlzLnVwZGF0ZUFjdGl2ZU1vZGVzKCk7XG5cbiAgICB0aGlzLmNyZWF0ZVdvcmtlcnMoKTtcbiAgICB0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemUgPSB7fTtcblxuICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgIHRoaXMuem9vbSA9IG51bGw7XG4gICAgdGhpcy5jZW50ZXIgPSBudWxsO1xuICAgIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcblxuICAgIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuICAgIHRoaXMucGFubmluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lcjtcblxuICAgIHRoaXMucmVzZXRUaW1lKCk7XG59XG5cblNjZW5lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKClcbntcbiAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyIHx8IGRvY3VtZW50LmJvZHk7XG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgdGhpcy5jYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5sZWZ0ID0gMDtcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS56SW5kZXggPSAtMTtcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG5cbiAgICB0aGlzLmdsID0gR0wuZ2V0Q29udGV4dCh0aGlzLmNhbnZhcyk7XG4gICAgdGhpcy5yZXNpemVNYXAodGhpcy5jb250YWluZXIuY2xpZW50V2lkdGgsIHRoaXMuY29udGFpbmVyLmNsaWVudEhlaWdodCk7XG5cbiAgICB0aGlzLmluaXRNb2RlcygpO1xuICAgIHRoaXMuaW5pdFNlbGVjdGlvbkJ1ZmZlcigpO1xuXG4gICAgLy8gdGhpcy56b29tX3N0ZXAgPSAwLjAyOyAvLyBmb3IgZnJhY3Rpb25hbCB6b29tIHVzZXIgYWRqdXN0bWVudFxuICAgIHRoaXMubGFzdF9yZW5kZXJfY291bnQgPSBudWxsO1xuICAgIHRoaXMuaW5pdElucHV0SGFuZGxlcnMoKTtcblxuICAgIC8vIEluaXQgd29ya2Vyc1xuICAgIHRoaXMud29ya2Vycy5mb3JFYWNoKGZ1bmN0aW9uKHdvcmtlcikge1xuICAgICAgICB3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHNjZW5lLndvcmtlckJ1aWxkVGlsZUNvbXBsZXRlZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgd29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBzY2VuZS53b3JrZXJHZXRGZWF0dXJlU2VsZWN0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICB3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHNjZW5lLndvcmtlckxvZ01lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xufTtcblxuU2NlbmUucHJvdG90eXBlLmluaXRNb2RlcyA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gSW5pdCBHTCBjb250ZXh0IGZvciBtb2RlcyAoY29tcGlsZXMgcHJvZ3JhbXMsIGV0Yy4pXG4gICAgZm9yICh2YXIgbSBpbiB0aGlzLm1vZGVzKSB7XG4gICAgICAgIHRoaXMubW9kZXNbbV0uaW5pdCh0aGlzLmdsKTtcbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuaW5pdFNlbGVjdGlvbkJ1ZmZlciA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gU2VsZWN0aW9uIHN0YXRlIHRyYWNraW5nXG4gICAgdGhpcy5waXhlbCA9IG5ldyBVaW50OEFycmF5KDQpO1xuICAgIHRoaXMucGl4ZWwzMiA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5waXhlbC5idWZmZXIpO1xuICAgIHRoaXMuc2VsZWN0aW9uX3BvaW50ID0gUG9pbnQoMCwgMCk7XG4gICAgdGhpcy5zZWxlY3RlZF9mZWF0dXJlID0gbnVsbDtcbiAgICB0aGlzLnNlbGVjdGlvbl9jYWxsYmFjayA9IG51bGw7XG4gICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2tfdGltZXIgPSBudWxsO1xuICAgIHRoaXMuc2VsZWN0aW9uX2ZyYW1lX2RlbGF5ID0gNTsgLy8gZGVsYXkgZnJvbSBzZWxlY3Rpb24gcmVuZGVyIHRvIGZyYW1lYnVmZmVyIHNhbXBsZSwgdG8gYXZvaWQgQ1BVL0dQVSBzeW5jIGxvY2tcbiAgICB0aGlzLnVwZGF0ZV9zZWxlY3Rpb24gPSBmYWxzZTtcblxuICAgIC8vIEZyYW1lIGJ1ZmZlciBmb3Igc2VsZWN0aW9uXG4gICAgLy8gVE9ETzogaW5pdGlhdGUgbGF6aWx5IGluIGNhc2Ugd2UgZG9uJ3QgbmVlZCB0byBkbyBhbnkgc2VsZWN0aW9uXG4gICAgdGhpcy5mYm8gPSB0aGlzLmdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgdGhpcy5mYm8pO1xuICAgIHRoaXMuZmJvX3NpemUgPSB7IHdpZHRoOiAyNTYsIGhlaWdodDogMjU2IH07IC8vIFRPRE86IG1ha2UgY29uZmlndXJhYmxlIC8gYWRhcHRpdmUgYmFzZWQgb24gY2FudmFzIHNpemVcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0KTtcblxuICAgIC8vIFRleHR1cmUgZm9yIHRoZSBGQk8gY29sb3IgYXR0YWNobWVudFxuICAgIHRoaXMuZmJvX3RleHR1cmUgPSBuZXcgR0xUZXh0dXJlKHRoaXMuZ2wsICdzZWxlY3Rpb25fZmJvJyk7XG4gICAgdGhpcy5mYm9fdGV4dHVyZS5zZXREYXRhKHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0LCBudWxsLCB7IGZpbHRlcmluZzogJ25lYXJlc3QnIH0pO1xuICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQodGhpcy5nbC5GUkFNRUJVRkZFUiwgdGhpcy5nbC5DT0xPUl9BVFRBQ0hNRU5UMCwgdGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLmZib190ZXh0dXJlLnRleHR1cmUsIDApO1xuXG4gICAgLy8gUmVuZGVyYnVmZmVyIGZvciB0aGUgRkJPIGRlcHRoIGF0dGFjaG1lbnRcbiAgICB0aGlzLmZib19kZXB0aF9yYiA9IHRoaXMuZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmZib19kZXB0aF9yYik7XG4gICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmdsLkRFUFRIX0NPTVBPTkVOVDE2LCB0aGlzLmZib19zaXplLndpZHRoLCB0aGlzLmZib19zaXplLmhlaWdodCk7XG4gICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCB0aGlzLmdsLkRFUFRIX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmZib19kZXB0aF9yYik7XG5cbiAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xufTtcblxuLy8gV2ViIHdvcmtlcnMgaGFuZGxlIGhlYXZ5IGR1dHkgZ2VvbWV0cnkgcHJvY2Vzc2luZ1xuU2NlbmUucHJvdG90eXBlLmNyZWF0ZVdvcmtlcnMgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciB3b3JrZXJfdXJsID0gU2NlbmUubGlicmFyeV9iYXNlX3VybCArICd0YW5ncmFtLXdvcmtlci5taW4uanMnICsgJz8nICsgKCtuZXcgRGF0ZSgpKTtcblxuICAgIC8vIEluc3RhbnRpYXRlIHdvcmtlcnMgZnJvbSBVUkxcbiAgICB2YXIgbWFrZVdvcmtlcnMgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgIHRoaXMud29ya2VycyA9IFtdO1xuICAgICAgICBmb3IgKHZhciB3PTA7IHcgPCB0aGlzLm51bV93b3JrZXJzOyB3KyspIHtcbiAgICAgICAgICAgIHRoaXMud29ya2Vycy5wdXNoKG5ldyBXb3JrZXIodXJsKSk7XG4gICAgICAgICAgICB0aGlzLndvcmtlcnNbd10ucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdpbml0JyxcbiAgICAgICAgICAgICAgICB3b3JrZXJfaWQ6IHcsXG4gICAgICAgICAgICAgICAgbnVtX3dvcmtlcnM6IHRoaXMubnVtX3dvcmtlcnNcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAvLyBMb2NhbCBvYmplY3QgVVJMcyBzdXBwb3J0ZWQ/XG4gICAgdmFyIGNyZWF0ZU9iamVjdFVSTCA9ICh3aW5kb3cuVVJMICYmIHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKSB8fCAod2luZG93LndlYmtpdFVSTCAmJiB3aW5kb3cud2Via2l0VVJMLmNyZWF0ZU9iamVjdFVSTCk7XG4gICAgaWYgKGNyZWF0ZU9iamVjdFVSTCAmJiB0aGlzLmFsbG93X2Nyb3NzX2RvbWFpbl93b3JrZXJzKSB7XG4gICAgICAgIC8vIFRvIGFsbG93IHdvcmtlcnMgdG8gYmUgbG9hZGVkIGNyb3NzLWRvbWFpbiwgZmlyc3QgbG9hZCB3b3JrZXIgc291cmNlIHZpYSBYSFIsIHRoZW4gY3JlYXRlIGEgbG9jYWwgVVJMIHZpYSBhIGJsb2JcbiAgICAgICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHdvcmtlcl9sb2NhbF91cmwgPSBjcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW3JlcS5yZXNwb25zZV0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnIH0pKTtcbiAgICAgICAgICAgIG1ha2VXb3JrZXJzKHdvcmtlcl9sb2NhbF91cmwpO1xuICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgIHJlcS5vcGVuKCdHRVQnLCB3b3JrZXJfdXJsLCBmYWxzZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICAgICAgcmVxLnNlbmQoKTtcbiAgICB9XG4gICAgLy8gVHJhZGl0aW9uYWwgbG9hZCBmcm9tIHJlbW90ZSBVUkxcbiAgICBlbHNlIHtcbiAgICAgICAgbWFrZVdvcmtlcnMod29ya2VyX3VybCk7XG4gICAgfVxuXG4gICAgdGhpcy5uZXh0X3dvcmtlciA9IDA7XG59O1xuXG4vLyBQb3N0IGEgbWVzc2FnZSBhYm91dCBhIHRpbGUgdG8gdGhlIG5leHQgd29ya2VyIChyb3VuZCByb2JiaW4pXG5TY2VuZS5wcm90b3R5cGUud29ya2VyUG9zdE1lc3NhZ2VGb3JUaWxlID0gZnVuY3Rpb24gKHRpbGUsIG1lc3NhZ2UpXG57XG4gICAgaWYgKHRpbGUud29ya2VyID09IG51bGwpIHtcbiAgICAgICAgdGlsZS53b3JrZXIgPSB0aGlzLm5leHRfd29ya2VyO1xuICAgICAgICB0aGlzLm5leHRfd29ya2VyID0gKHRpbGUud29ya2VyICsgMSkgJSB0aGlzLndvcmtlcnMubGVuZ3RoO1xuICAgIH1cbiAgICB0aGlzLndvcmtlcnNbdGlsZS53b3JrZXJdLnBvc3RNZXNzYWdlKG1lc3NhZ2UpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnNldENlbnRlciA9IGZ1bmN0aW9uIChsbmcsIGxhdClcbntcbiAgICB0aGlzLmNlbnRlciA9IHsgbG5nOiBsbmcsIGxhdDogbGF0IH07XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuc3RhcnRab29tID0gZnVuY3Rpb24gKClcbntcbiAgICB0aGlzLmxhc3Rfem9vbSA9IHRoaXMuem9vbTtcbiAgICB0aGlzLnpvb21pbmcgPSB0cnVlO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnByZXNlcnZlX3RpbGVzX3dpdGhpbl96b29tID0gMjtcblNjZW5lLnByb3RvdHlwZS5zZXRab29tID0gZnVuY3Rpb24gKHpvb20pXG57XG4gICAgLy8gU2NoZWR1bGUgR0wgdGlsZXMgZm9yIHJlbW92YWwgb24gem9vbVxuICAgIHZhciBiZWxvdyA9IHpvb207XG4gICAgdmFyIGFib3ZlID0gem9vbTtcbiAgICBpZiAodGhpcy5sYXN0X3pvb20gIT0gbnVsbCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNjZW5lLmxhc3Rfem9vbTogXCIgKyB0aGlzLmxhc3Rfem9vbSk7XG4gICAgICAgIGlmIChNYXRoLmFicyh6b29tIC0gdGhpcy5sYXN0X3pvb20pIDw9IHRoaXMucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb20pIHtcbiAgICAgICAgICAgIGlmICh6b29tID4gdGhpcy5sYXN0X3pvb20pIHtcbiAgICAgICAgICAgICAgICBiZWxvdyA9IHpvb20gLSB0aGlzLnByZXNlcnZlX3RpbGVzX3dpdGhpbl96b29tO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYWJvdmUgPSB6b29tICsgdGhpcy5wcmVzZXJ2ZV90aWxlc193aXRoaW5fem9vbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGFzdF96b29tID0gdGhpcy56b29tO1xuICAgIHRoaXMuem9vbSA9IHpvb207XG4gICAgdGhpcy5jYXBwZWRfem9vbSA9IE1hdGgubWluKH5+dGhpcy56b29tLCB0aGlzLnRpbGVfc291cmNlLm1heF96b29tIHx8IH5+dGhpcy56b29tKTtcbiAgICB0aGlzLnpvb21pbmcgPSBmYWxzZTtcblxuICAgIHRoaXMucmVtb3ZlVGlsZXNPdXRzaWRlWm9vbVJhbmdlKGJlbG93LCBhYm92ZSk7XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucmVtb3ZlVGlsZXNPdXRzaWRlWm9vbVJhbmdlID0gZnVuY3Rpb24gKGJlbG93LCBhYm92ZSlcbntcbiAgICBiZWxvdyA9IE1hdGgubWluKGJlbG93LCB0aGlzLnRpbGVfc291cmNlLm1heF96b29tIHx8IGJlbG93KTtcbiAgICBhYm92ZSA9IE1hdGgubWluKGFib3ZlLCB0aGlzLnRpbGVfc291cmNlLm1heF96b29tIHx8IGFib3ZlKTtcblxuICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlVGlsZXNPdXRzaWRlWm9vbVJhbmdlIFtcIiArIGJlbG93ICsgXCIsIFwiICsgYWJvdmUgKyBcIl0pXCIpO1xuICAgIHZhciByZW1vdmVfdGlsZXMgPSBbXTtcbiAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW3RdO1xuICAgICAgICBpZiAodGlsZS5jb29yZHMueiA8IGJlbG93IHx8IHRpbGUuY29vcmRzLnogPiBhYm92ZSkge1xuICAgICAgICAgICAgcmVtb3ZlX3RpbGVzLnB1c2godCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgcj0wOyByIDwgcmVtb3ZlX3RpbGVzLmxlbmd0aDsgcisrKSB7XG4gICAgICAgIHZhciBrZXkgPSByZW1vdmVfdGlsZXNbcl07XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCBcIiArIGtleSArIFwiIChvdXRzaWRlIHJhbmdlIFtcIiArIGJlbG93ICsgXCIsIFwiICsgYWJvdmUgKyBcIl0pXCIpO1xuICAgICAgICB0aGlzLnJlbW92ZVRpbGUoa2V5KTtcbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKHN3LCBuZSlcbntcbiAgICB0aGlzLmJvdW5kcyA9IHtcbiAgICAgICAgc3c6IHsgbG5nOiBzdy5sbmcsIGxhdDogc3cubGF0IH0sXG4gICAgICAgIG5lOiB7IGxuZzogbmUubG5nLCBsYXQ6IG5lLmxhdCB9XG4gICAgfTtcblxuICAgIHZhciBidWZmZXIgPSAyMDAgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt+fnRoaXMuem9vbV07IC8vIHBpeGVscyAtPiBtZXRlcnNcbiAgICB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcyA9IHtcbiAgICAgICAgc3c6IEdlby5sYXRMbmdUb01ldGVycyhQb2ludCh0aGlzLmJvdW5kcy5zdy5sbmcsIHRoaXMuYm91bmRzLnN3LmxhdCkpLFxuICAgICAgICBuZTogR2VvLmxhdExuZ1RvTWV0ZXJzKFBvaW50KHRoaXMuYm91bmRzLm5lLmxuZywgdGhpcy5ib3VuZHMubmUubGF0KSlcbiAgICB9O1xuICAgIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzLnN3LnggLT0gYnVmZmVyO1xuICAgIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzLnN3LnkgLT0gYnVmZmVyO1xuICAgIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzLm5lLnggKz0gYnVmZmVyO1xuICAgIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzLm5lLnkgKz0gYnVmZmVyO1xuXG4gICAgdGhpcy5jZW50ZXJfbWV0ZXJzID0gUG9pbnQoXG4gICAgICAgICh0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5zdy54ICsgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueCkgLyAyLFxuICAgICAgICAodGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueSArIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzLm5lLnkpIC8gMlxuICAgICk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyhcInNldCBzY2VuZSBib3VuZHMgdG8gXCIgKyBKU09OLnN0cmluZ2lmeSh0aGlzLmJvdW5kcykpO1xuXG4gICAgLy8gTWFyayB0aWxlcyBhcyB2aXNpYmxlL2ludmlzaWJsZVxuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHlGb3JUaWxlKHRoaXMudGlsZXNbdF0pO1xuICAgIH1cblxuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuU2NlbmUucHJvdG90eXBlLmlzVGlsZUluWm9vbSA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIHJldHVybiAoTWF0aC5taW4odGlsZS5jb29yZHMueiwgdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSB8fCB0aWxlLmNvb3Jkcy56KSA9PSB0aGlzLmNhcHBlZF96b29tKTtcbn07XG5cbi8vIFVwZGF0ZSB2aXNpYmlsaXR5IGFuZCByZXR1cm4gdHJ1ZSBpZiBjaGFuZ2VkXG5TY2VuZS5wcm90b3R5cGUudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUgPSBmdW5jdGlvbiAodGlsZSlcbntcbiAgICB2YXIgdmlzaWJsZSA9IHRpbGUudmlzaWJsZTtcbiAgICB0aWxlLnZpc2libGUgPSB0aGlzLmlzVGlsZUluWm9vbSh0aWxlKSAmJiBHZW8uYm94SW50ZXJzZWN0KHRpbGUuYm91bmRzLCB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcyk7XG4gICAgdGlsZS5jZW50ZXJfZGlzdCA9IE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy54IC0gdGlsZS5taW4ueCkgKyBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueSAtIHRpbGUubWluLnkpO1xuICAgIHJldHVybiAodmlzaWJsZSAhPSB0aWxlLnZpc2libGUpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlc2l6ZU1hcCA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KVxue1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuXG4gICAgdGhpcy5jc3Nfc2l6ZSA9IHsgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCB9O1xuICAgIHRoaXMuZGV2aWNlX3NpemUgPSB7IHdpZHRoOiBNYXRoLnJvdW5kKHRoaXMuY3NzX3NpemUud2lkdGggKiB0aGlzLmRldmljZV9waXhlbF9yYXRpbyksIGhlaWdodDogTWF0aC5yb3VuZCh0aGlzLmNzc19zaXplLmhlaWdodCAqIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvKSB9O1xuXG4gICAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSB0aGlzLmNzc19zaXplLndpZHRoICsgJ3B4JztcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSB0aGlzLmNzc19zaXplLmhlaWdodCArICdweCc7XG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmRldmljZV9zaXplLndpZHRoO1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0O1xuXG4gICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZXF1ZXN0UmVkcmF3ID0gZnVuY3Rpb24gKClcbntcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cbi8vIERldGVybWluZSBhIFogdmFsdWUgdGhhdCB3aWxsIHN0YWNrIGZlYXR1cmVzIGluIGEgXCJwYWludGVyJ3MgYWxnb3JpdGhtXCIgc3R5bGUsIGZpcnN0IGJ5IGxheWVyLCB0aGVuIGJ5IGRyYXcgb3JkZXIgd2l0aGluIGxheWVyXG4vLyBGZWF0dXJlcyBhcmUgYXNzdW1lZCB0byBiZSBhbHJlYWR5IHNvcnRlZCBpbiBkZXNpcmVkIGRyYXcgb3JkZXIgYnkgdGhlIGxheWVyIHByZS1wcm9jZXNzb3JcblNjZW5lLmNhbGN1bGF0ZVogPSBmdW5jdGlvbiAobGF5ZXIsIHRpbGUsIGxheWVyX29mZnNldCwgZmVhdHVyZV9vZmZzZXQpXG57XG4gICAgLy8gdmFyIGxheWVyX29mZnNldCA9IGxheWVyX29mZnNldCB8fCAwO1xuICAgIC8vIHZhciBmZWF0dXJlX29mZnNldCA9IGZlYXR1cmVfb2Zmc2V0IHx8IDA7XG4gICAgdmFyIHogPSAwOyAvLyBUT0RPOiBtYWRlIHRoaXMgYSBuby1vcCB1bnRpbCByZXZpc2l0aW5nIHdoZXJlIGl0IHNob3VsZCBsaXZlIC0gb25lLXRpbWUgY2FsYyBoZXJlLCBpbiB2ZXJ0ZXggbGF5b3V0L3NoYWRlciwgZXRjLlxuICAgIHJldHVybiB6O1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gUmVuZGVyIG9uIGRlbWFuZFxuICAgIGlmICh0aGlzLmRpcnR5ID09IGZhbHNlIHx8IHRoaXMuaW5pdGlhbGl6ZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7IC8vIHN1YmNsYXNzZXMgY2FuIHNldCB0aGlzIGJhY2sgdG8gdHJ1ZSB3aGVuIGFuaW1hdGlvbiBpcyBuZWVkZWRcblxuICAgIHRoaXMucmVuZGVyR0woKTtcblxuICAgIC8vIFJlZHJhdyBldmVyeSBmcmFtZSBpZiBhbmltYXRpbmdcbiAgICBpZiAodGhpcy5hbmltYXRlZCA9PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuZnJhbWUrKztcblxuICAgIC8vIGNvbnNvbGUubG9nKFwicmVuZGVyIG1hcFwiKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZXNldEZyYW1lID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBSZXNldCBmcmFtZSBzdGF0ZVxuICAgIHZhciBnbCA9IHRoaXMuZ2w7XG4gICAgZ2wuY2xlYXJDb2xvcigwLjAsIDAuMCwgMC4wLCAxLjApO1xuICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcblxuICAgIC8vIFRPRE86IHVubmVjZXNzYXJ5IHJlcGVhdD9cbiAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgZ2wuZGVwdGhGdW5jKGdsLkxFU1MpO1xuICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgIGdsLmN1bGxGYWNlKGdsLkJBQ0spO1xuICAgIC8vIGdsLmVuYWJsZShnbC5CTEVORCk7XG4gICAgLy8gZ2wuYmxlbmRGdW5jKGdsLlNSQ19BTFBIQSwgZ2wuT05FX01JTlVTX1NSQ19BTFBIQSk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucmVuZGVyR0wgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBnbCA9IHRoaXMuZ2w7XG5cbiAgICB0aGlzLmlucHV0KCk7XG4gICAgdGhpcy5yZXNldEZyYW1lKCk7XG5cbiAgICAvLyBNYXAgdHJhbnNmb3Jtc1xuICAgIHZhciBjZW50ZXIgPSBHZW8ubGF0TG5nVG9NZXRlcnMoUG9pbnQodGhpcy5jZW50ZXIubG5nLCB0aGlzLmNlbnRlci5sYXQpKTtcbiAgICB2YXIgbWV0ZXJzX3Blcl9waXhlbCA9IEdlby5taW5fem9vbV9tZXRlcnNfcGVyX3BpeGVsIC8gTWF0aC5wb3coMiwgdGhpcy56b29tKTtcbiAgICB2YXIgbWV0ZXJfem9vbSA9IFBvaW50KHRoaXMuY3NzX3NpemUud2lkdGggLyAyICogbWV0ZXJzX3Blcl9waXhlbCwgdGhpcy5jc3Nfc2l6ZS5oZWlnaHQgLyAyICogbWV0ZXJzX3Blcl9waXhlbCk7XG5cbiAgICAvLyBNYXRyaWNlc1xuICAgIHZhciB0aWxlX3ZpZXdfbWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAgICB2YXIgdGlsZV93b3JsZF9tYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuICAgIHZhciBtZXRlcl92aWV3X21hdCA9IG1hdDQuY3JlYXRlKCk7XG5cbiAgICAvLyBDb252ZXJ0IG1lcmNhdG9yIG1ldGVycyB0byBzY3JlZW4gc3BhY2VcbiAgICBtYXQ0LnNjYWxlKG1ldGVyX3ZpZXdfbWF0LCBtZXRlcl92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKDEgLyBtZXRlcl96b29tLngsIDEgLyBtZXRlcl96b29tLnksIDEgLyBtZXRlcl96b29tLnkpKTtcblxuICAgIC8vIFJlbmRlcmFibGUgdGlsZSBsaXN0XG4gICAgdmFyIHJlbmRlcmFibGVfdGlsZXMgPSBbXTtcbiAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW3RdO1xuICAgICAgICBpZiAodGlsZS5sb2FkZWQgPT0gdHJ1ZSAmJiB0aWxlLnZpc2libGUgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmVuZGVyYWJsZV90aWxlcy5wdXNoKHRpbGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMucmVuZGVyYWJsZV90aWxlc19jb3VudCA9IHJlbmRlcmFibGVfdGlsZXMubGVuZ3RoO1xuXG4gICAgLy8gUmVuZGVyIG1haW4gcGFzcyAtIHRpbGVzIGdyb3VwZWQgYnkgcmVuZGVyaW5nIG1vZGUgKEdMIHByb2dyYW0pXG4gICAgdmFyIHJlbmRlcl9jb3VudCA9IDA7XG4gICAgZm9yICh2YXIgbW9kZSBpbiB0aGlzLmFjdGl2ZV9tb2Rlcykge1xuICAgICAgICAvLyBQZXItZnJhbWUgbW9kZSB1cGRhdGVzL2FuaW1hdGlvbnNcbiAgICAgICAgLy8gQ2FsbGVkIGV2ZW4gaWYgdGhlIG1vZGUgaXNuJ3QgcmVuZGVyZWQgYnkgYW55IGN1cnJlbnQgdGlsZXMsIHNvIHRpbWUtYmFzZWQgYW5pbWF0aW9ucywgZXRjLiBjb250aW51ZVxuICAgICAgICB0aGlzLm1vZGVzW21vZGVdLnVwZGF0ZSgpO1xuXG4gICAgICAgIHZhciBnbF9wcm9ncmFtID0gdGhpcy5tb2Rlc1ttb2RlXS5nbF9wcm9ncmFtO1xuICAgICAgICB2YXIgZmlyc3RfZm9yX21vZGUgPSB0cnVlO1xuXG4gICAgICAgIC8vIFJlbmRlciB0aWxlIEdMIGdlb21ldHJpZXNcbiAgICAgICAgZm9yICh2YXIgdCBpbiByZW5kZXJhYmxlX3RpbGVzKSB7XG4gICAgICAgICAgICB2YXIgdGlsZSA9IHJlbmRlcmFibGVfdGlsZXNbdF07XG5cbiAgICAgICAgICAgIGlmICh0aWxlLmdsX2dlb21ldHJ5W21vZGVdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBTZXR1cCBtb2RlIGlmIGVuY291bnRlcmluZyBmb3IgZmlyc3QgdGltZSB0aGlzIGZyYW1lXG4gICAgICAgICAgICAgICAgLy8gKGxhenkgaW5pdCwgbm90IGFsbCBtb2RlcyB3aWxsIGJlIHVzZWQgaW4gYWxsIHNjcmVlbiB2aWV3czsgc29tZSBtb2RlcyBtaWdodCBiZSBkZWZpbmVkIGJ1dCBuZXZlciB1c2VkKVxuICAgICAgICAgICAgICAgIGlmIChmaXJzdF9mb3JfbW9kZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0X2Zvcl9tb2RlID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51c2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2Rlc1ttb2RlXS5zZXRVbmlmb3JtcygpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGRvbid0IHNldCB1bmlmb3JtcyB3aGVuIHRoZXkgaGF2ZW4ndCBjaGFuZ2VkXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9yZXNvbHV0aW9uJywgdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCwgdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfYXNwZWN0JywgdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCAvIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0LCAxLjApO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfdGltZScsICgoK25ldyBEYXRlKCkpIC0gdGhpcy5zdGFydF90aW1lKSAvIDEwMDApO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbWFwX3pvb20nLCB0aGlzLnpvb20pOyAvLyBNYXRoLmZsb29yKHRoaXMuem9vbSkgKyAoTWF0aC5sb2coKHRoaXMuem9vbSAlIDEpICsgMSkgLyBNYXRoLkxOMiAvLyBzY2FsZSBmcmFjdGlvbmFsIHpvb20gYnkgbG9nXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9tYXBfY2VudGVyJywgY2VudGVyLngsIGNlbnRlci55KTtcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X251bV9sYXllcnMnLCB0aGlzLmxheWVycy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbWV0ZXJzX3Blcl9waXhlbCcsIG1ldGVyc19wZXJfcGl4ZWwpO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJ01hdHJpeDRmdicsICd1X21ldGVyX3ZpZXcnLCBmYWxzZSwgbWV0ZXJfdmlld19tYXQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGNhbGMgdGhlc2Ugb25jZSBwZXIgdGlsZSAoY3VycmVudGx5IGJlaW5nIG5lZWRsZXNzbHkgcmUtY2FsY3VsYXRlZCBwZXItdGlsZS1wZXItbW9kZSlcblxuICAgICAgICAgICAgICAgIC8vIFRpbGUgb3JpZ2luXG4gICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X3RpbGVfb3JpZ2luJywgdGlsZS5taW4ueCwgdGlsZS5taW4ueSk7XG5cbiAgICAgICAgICAgICAgICAvLyBUaWxlIHZpZXcgbWF0cml4IC0gdHJhbnNmb3JtIHRpbGUgc3BhY2UgaW50byB2aWV3IHNwYWNlIChtZXRlcnMsIHJlbGF0aXZlIHRvIGNhbWVyYSlcbiAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfdmlld19tYXQpO1xuICAgICAgICAgICAgICAgIG1hdDQudHJhbnNsYXRlKHRpbGVfdmlld19tYXQsIHRpbGVfdmlld19tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLm1pbi54IC0gY2VudGVyLngsIHRpbGUubWluLnkgLSBjZW50ZXIueSwgMCkpOyAvLyBhZGp1c3QgZm9yIHRpbGUgb3JpZ2luICYgbWFwIGNlbnRlclxuICAgICAgICAgICAgICAgIG1hdDQuc2NhbGUodGlsZV92aWV3X21hdCwgdGlsZV92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUuc3Bhbi54IC8gU2NlbmUudGlsZV9zY2FsZSwgLTEgKiB0aWxlLnNwYW4ueSAvIFNjZW5lLnRpbGVfc2NhbGUsIDEpKTsgLy8gc2NhbGUgdGlsZSBsb2NhbCBjb29yZHMgdG8gbWV0ZXJzXG4gICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCdNYXRyaXg0ZnYnLCAndV90aWxlX3ZpZXcnLCBmYWxzZSwgdGlsZV92aWV3X21hdCk7XG5cbiAgICAgICAgICAgICAgICAvLyBUaWxlIHdvcmxkIG1hdHJpeCAtIHRyYW5zZm9ybSB0aWxlIHNwYWNlIGludG8gd29ybGQgc3BhY2UgKG1ldGVycywgYWJzb2x1dGUgbWVyY2F0b3IgcG9zaXRpb24pXG4gICAgICAgICAgICAgICAgbWF0NC5pZGVudGl0eSh0aWxlX3dvcmxkX21hdCk7XG4gICAgICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGlsZV93b3JsZF9tYXQsIHRpbGVfd29ybGRfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5taW4ueCwgdGlsZS5taW4ueSwgMCkpO1xuICAgICAgICAgICAgICAgIG1hdDQuc2NhbGUodGlsZV93b3JsZF9tYXQsIHRpbGVfd29ybGRfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5zcGFuLnggLyBTY2VuZS50aWxlX3NjYWxlLCAtMSAqIHRpbGUuc3Bhbi55IC8gU2NlbmUudGlsZV9zY2FsZSwgMSkpOyAvLyBzY2FsZSB0aWxlIGxvY2FsIGNvb3JkcyB0byBtZXRlcnNcbiAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJ01hdHJpeDRmdicsICd1X3RpbGVfd29ybGQnLCBmYWxzZSwgdGlsZV93b3JsZF9tYXQpO1xuXG4gICAgICAgICAgICAgICAgLy8gUmVuZGVyIHRpbGVcbiAgICAgICAgICAgICAgICB0aWxlLmdsX2dlb21ldHJ5W21vZGVdLnJlbmRlcigpO1xuICAgICAgICAgICAgICAgIHJlbmRlcl9jb3VudCArPSB0aWxlLmdsX2dlb21ldHJ5W21vZGVdLmdlb21ldHJ5X2NvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVuZGVyIHNlbGVjdGlvbiBwYXNzIChpZiBuZWVkZWQpXG4gICAgLy8gU2xpZ2h0IHZhcmlhdGlvbnMgb24gcmVuZGVyIHBhc3MgY29kZSBhYm92ZSAtIG1vc3RseSBiZWNhdXNlIHdlJ3JlIHJldXNpbmcgdW5pZm9ybXMgZnJvbSB0aGUgbWFpblxuICAgIC8vIG1vZGUgcHJvZ3JhbSwgZm9yIHRoZSBzZWxlY3Rpb24gcHJvZ3JhbVxuICAgIC8vIFRPRE86IHJlZHVjZSBkdXBsaWNhdGVkIGNvZGUgdy9tYWluIHJlbmRlciBwYXNzIGFib3ZlXG4gICAgaWYgKHRoaXMudXBkYXRlX3NlbGVjdGlvbikge1xuICAgICAgICB0aGlzLnVwZGF0ZV9zZWxlY3Rpb24gPSBmYWxzZTsgLy8gcmVzZXQgc2VsZWN0aW9uIGNoZWNrXG5cbiAgICAgICAgLy8gVE9ETzogcXVldWUgY2FsbGJhY2sgdGlsbCBwYW5uaW5nIGlzIG92ZXI/IGNvb3JkcyB3aGVyZSBzZWxlY3Rpb24gd2FzIHJlcXVlc3RlZCBhcmUgb3V0IG9mIGRhdGVcbiAgICAgICAgaWYgKHRoaXMucGFubmluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3dpdGNoIHRvIEZCT1xuICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHRoaXMuZmJvKTtcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgdGhpcy5mYm9fc2l6ZS53aWR0aCwgdGhpcy5mYm9fc2l6ZS5oZWlnaHQpO1xuICAgICAgICB0aGlzLnJlc2V0RnJhbWUoKTtcblxuICAgICAgICBmb3IgKG1vZGUgaW4gdGhpcy5tb2Rlcykge1xuICAgICAgICAgICAgZ2xfcHJvZ3JhbSA9IHRoaXMubW9kZXNbbW9kZV0uc2VsZWN0aW9uX2dsX3Byb2dyYW07XG4gICAgICAgICAgICBpZiAoZ2xfcHJvZ3JhbSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaXJzdF9mb3JfbW9kZSA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIFJlbmRlciB0aWxlIEdMIGdlb21ldHJpZXNcbiAgICAgICAgICAgIGZvciAodCBpbiByZW5kZXJhYmxlX3RpbGVzKSB7XG4gICAgICAgICAgICAgICAgdGlsZSA9IHJlbmRlcmFibGVfdGlsZXNbdF07XG5cbiAgICAgICAgICAgICAgICBpZiAodGlsZS5nbF9nZW9tZXRyeVttb2RlXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNldHVwIG1vZGUgaWYgZW5jb3VudGVyaW5nIGZvciBmaXJzdCB0aW1lIHRoaXMgZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0X2Zvcl9tb2RlID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0X2Zvcl9tb2RlID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udXNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVzW21vZGVdLnNldFVuaWZvcm1zKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9yZXNvbHV0aW9uJywgdGhpcy5mYm9fc2l6ZS53aWR0aCwgdGhpcy5mYm9fc2l6ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X2FzcGVjdCcsIHRoaXMuZmJvX3NpemUud2lkdGggLyB0aGlzLmZib19zaXplLmhlaWdodCwgMS4wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV90aW1lJywgKCgrbmV3IERhdGUoKSkgLSB0aGlzLnN0YXJ0X3RpbWUpIC8gMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbWFwX3pvb20nLCB0aGlzLnpvb20pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X21hcF9jZW50ZXInLCBjZW50ZXIueCwgY2VudGVyLnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X251bV9sYXllcnMnLCB0aGlzLmxheWVycy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X21ldGVyc19wZXJfcGl4ZWwnLCBtZXRlcnNfcGVyX3BpeGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfbWV0ZXJfdmlldycsIGZhbHNlLCBtZXRlcl92aWV3X21hdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBUaWxlIG9yaWdpblxuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfdGlsZV9vcmlnaW4nLCB0aWxlLm1pbi54LCB0aWxlLm1pbi55KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaWxlIHZpZXcgbWF0cml4IC0gdHJhbnNmb3JtIHRpbGUgc3BhY2UgaW50byB2aWV3IHNwYWNlIChtZXRlcnMsIHJlbGF0aXZlIHRvIGNhbWVyYSlcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5pZGVudGl0eSh0aWxlX3ZpZXdfbWF0KTtcbiAgICAgICAgICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGlsZV92aWV3X21hdCwgdGlsZV92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUubWluLnggLSBjZW50ZXIueCwgdGlsZS5taW4ueSAtIGNlbnRlci55LCAwKSk7IC8vIGFkanVzdCBmb3IgdGlsZSBvcmlnaW4gJiBtYXAgY2VudGVyXG4gICAgICAgICAgICAgICAgICAgIG1hdDQuc2NhbGUodGlsZV92aWV3X21hdCwgdGlsZV92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUuc3Bhbi54IC8gU2NlbmUudGlsZV9zY2FsZSwgLTEgKiB0aWxlLnNwYW4ueSAvIFNjZW5lLnRpbGVfc2NhbGUsIDEpKTsgLy8gc2NhbGUgdGlsZSBsb2NhbCBjb29yZHMgdG8gbWV0ZXJzXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfdGlsZV92aWV3JywgZmFsc2UsIHRpbGVfdmlld19tYXQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbGUgd29ybGQgbWF0cml4IC0gdHJhbnNmb3JtIHRpbGUgc3BhY2UgaW50byB3b3JsZCBzcGFjZSAobWV0ZXJzLCBhYnNvbHV0ZSBtZXJjYXRvciBwb3NpdGlvbilcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5pZGVudGl0eSh0aWxlX3dvcmxkX21hdCk7XG4gICAgICAgICAgICAgICAgICAgIG1hdDQudHJhbnNsYXRlKHRpbGVfd29ybGRfbWF0LCB0aWxlX3dvcmxkX21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUubWluLngsIHRpbGUubWluLnksIDApKTtcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3dvcmxkX21hdCwgdGlsZV93b3JsZF9tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLnNwYW4ueCAvIFNjZW5lLnRpbGVfc2NhbGUsIC0xICogdGlsZS5zcGFuLnkgLyBTY2VuZS50aWxlX3NjYWxlLCAxKSk7IC8vIHNjYWxlIHRpbGUgbG9jYWwgY29vcmRzIHRvIG1ldGVyc1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJ01hdHJpeDRmdicsICd1X3RpbGVfd29ybGQnLCBmYWxzZSwgdGlsZV93b3JsZF9tYXQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbmRlciB0aWxlXG4gICAgICAgICAgICAgICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0ucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVsYXkgcmVhZGluZyB0aGUgcGl4ZWwgcmVzdWx0IGZyb20gdGhlIHNlbGVjdGlvbiBidWZmZXIgdG8gYXZvaWQgQ1BVL0dQVSBzeW5jIGxvY2suXG4gICAgICAgIC8vIENhbGxpbmcgcmVhZFBpeGVscyBzeW5jaHJvbm91c2x5IGNhdXNlZCBhIG1hc3NpdmUgcGVyZm9ybWFuY2UgaGl0LCBwcmVzdW1hYmx5IHNpbmNlIGl0XG4gICAgICAgIC8vIGZvcmNlZCB0aGlzIGZ1bmN0aW9uIHRvIHdhaXQgZm9yIHRoZSBHUFUgdG8gZmluaXNoIHJlbmRlcmluZyBhbmQgcmV0cmlldmUgdGhlIHRleHR1cmUgY29udGVudHMuXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGlvbl9jYWxsYmFja190aW1lciAhPSBudWxsKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5zZWxlY3Rpb25fY2FsbGJhY2tfdGltZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrX3RpbWVyID0gc2V0VGltZW91dChcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGhpcy5mYm8pO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgc2VsZWN0aW9uIG1hcCBhZ2FpbnN0IEZCT1xuICAgICAgICAgICAgICAgIGdsLnJlYWRQaXhlbHMoXG4gICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IodGhpcy5zZWxlY3Rpb25fcG9pbnQueCAqIHRoaXMuZmJvX3NpemUud2lkdGggLyB0aGlzLmRldmljZV9zaXplLndpZHRoKSxcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5mbG9vcih0aGlzLnNlbGVjdGlvbl9wb2ludC55ICogdGhpcy5mYm9fc2l6ZS5oZWlnaHQgLyB0aGlzLmRldmljZV9zaXplLmhlaWdodCksXG4gICAgICAgICAgICAgICAgICAgIDEsIDEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIHRoaXMucGl4ZWwpO1xuICAgICAgICAgICAgICAgIHZhciBmZWF0dXJlX2tleSA9ICh0aGlzLnBpeGVsWzBdICsgKHRoaXMucGl4ZWxbMV0gPDwgOCkgKyAodGhpcy5waXhlbFsyXSA8PCAxNikgKyAodGhpcy5waXhlbFszXSA8PCAyNCkpID4+PiAwO1xuXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgLy8gICAgIE1hdGguZmxvb3IodGhpcy5zZWxlY3Rpb25fcG9pbnQueCAqIHRoaXMuZmJvX3NpemUud2lkdGggLyB0aGlzLmRldmljZV9zaXplLndpZHRoKSArIFwiLCBcIiArXG4gICAgICAgICAgICAgICAgLy8gICAgIE1hdGguZmxvb3IodGhpcy5zZWxlY3Rpb25fcG9pbnQueSAqIHRoaXMuZmJvX3NpemUuaGVpZ2h0IC8gdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQpICsgXCI6IChcIiArXG4gICAgICAgICAgICAgICAgLy8gICAgIHRoaXMucGl4ZWxbMF0gKyBcIiwgXCIgKyB0aGlzLnBpeGVsWzFdICsgXCIsIFwiICsgdGhpcy5waXhlbFsyXSArIFwiLCBcIiArIHRoaXMucGl4ZWxbM10gKyBcIilcIik7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiBmZWF0dXJlIGZvdW5kLCBhc2sgYXBwcm9wcmlhdGUgd2ViIHdvcmtlciB0byBsb29rdXAgZmVhdHVyZVxuICAgICAgICAgICAgICAgIHZhciB3b3JrZXJfaWQgPSB0aGlzLnBpeGVsWzNdO1xuICAgICAgICAgICAgICAgIGlmICh3b3JrZXJfaWQgIT0gMjU1KSB7IC8vIDI1NSBpbmRpY2F0ZXMgYW4gZW1wdHkgc2VsZWN0aW9uIGJ1ZmZlciBwaXhlbFxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIndvcmtlcl9pZDogXCIgKyB3b3JrZXJfaWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy53b3JrZXJzW3dvcmtlcl9pZF0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3N0IG1lc3NhZ2VcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndvcmtlcnNbd29ya2VyX2lkXS5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2dldEZlYXR1cmVTZWxlY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogZmVhdHVyZV9rZXlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uX2ZyYW1lX2RlbGF5XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gUmVzZXQgdG8gc2NyZWVuIGJ1ZmZlclxuICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBpZiAocmVuZGVyX2NvdW50ICE9IHRoaXMubGFzdF9yZW5kZXJfY291bnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZW5kZXJlZCBcIiArIHJlbmRlcl9jb3VudCArIFwiIHByaW1pdGl2ZXNcIik7XG4gICAgfVxuICAgIHRoaXMubGFzdF9yZW5kZXJfY291bnQgPSByZW5kZXJfY291bnQ7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8vIFJlcXVlc3QgZmVhdHVyZSBzZWxlY3Rpb25cbi8vIFJ1bnMgYXN5bmNocm9ub3VzbHksIHNjaGVkdWxlcyBzZWxlY3Rpb24gYnVmZmVyIHRvIGJlIHVwZGF0ZWRcblNjZW5lLnByb3RvdHlwZS5nZXRGZWF0dXJlQXQgPSBmdW5jdGlvbiAocGl4ZWwsIGNhbGxiYWNrKVxue1xuICAgIC8vIFRPRE86IHF1ZXVlIGNhbGxiYWNrcyB3aGlsZSBzdGlsbCBwZXJmb3JtaW5nIG9ubHkgb25lIHNlbGVjdGlvbiByZW5kZXIgcGFzcyB3aXRoaW4gWCB0aW1lIGludGVydmFsP1xuICAgIGlmICh0aGlzLnVwZGF0ZV9zZWxlY3Rpb24gPT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zZWxlY3Rpb25fcG9pbnQgPSBQb2ludChcbiAgICAgICAgcGl4ZWwueCAqIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvLFxuICAgICAgICB0aGlzLmRldmljZV9zaXplLmhlaWdodCAtIChwaXhlbC55ICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8pXG4gICAgKTtcbiAgICB0aGlzLnNlbGVjdGlvbl9jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMudXBkYXRlX3NlbGVjdGlvbiA9IHRydWU7XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG4vLyBMb2FkIGEgc2luZ2xlIHRpbGVcblNjZW5lLnByb3RvdHlwZS5sb2FkVGlsZSA9IGZ1bmN0aW9uIChjb29yZHMsIGRpdiwgY2FsbGJhY2spXG57XG4gICAgLy8gT3Zlcnpvb20/XG4gICAgaWYgKGNvb3Jkcy56ID4gdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSkge1xuICAgICAgICB2YXIgemdhcCA9IGNvb3Jkcy56IC0gdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbTtcbiAgICAgICAgLy8gdmFyIG9yaWdpbmFsX3RpbGUgPSBbY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMuel0uam9pbignLycpO1xuICAgICAgICBjb29yZHMueCA9IH5+KGNvb3Jkcy54IC8gTWF0aC5wb3coMiwgemdhcCkpO1xuICAgICAgICBjb29yZHMueSA9IH5+KGNvb3Jkcy55IC8gTWF0aC5wb3coMiwgemdhcCkpO1xuICAgICAgICBjb29yZHMuZGlzcGxheV96ID0gY29vcmRzLno7IC8vIHogd2l0aG91dCBvdmVyem9vbVxuICAgICAgICBjb29yZHMueiAtPSB6Z2FwO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImFkanVzdGVkIGZvciBvdmVyem9vbSwgdGlsZSBcIiArIG9yaWdpbmFsX3RpbGUgKyBcIiAtPiBcIiArIFtjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56XS5qb2luKCcvJykpO1xuICAgIH1cblxuICAgIHRoaXMudHJhY2tUaWxlU2V0TG9hZFN0YXJ0KCk7XG5cbiAgICB2YXIga2V5ID0gW2Nvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnpdLmpvaW4oJy8nKTtcblxuICAgIC8vIEFscmVhZHkgbG9hZGluZy9sb2FkZWQ/XG4gICAgaWYgKHRoaXMudGlsZXNba2V5XSkge1xuICAgICAgICAvLyBpZiAodGhpcy50aWxlc1trZXldLmxvYWRlZCA9PSB0cnVlKSB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcInVzZSBsb2FkZWQgdGlsZSBcIiArIGtleSArIFwiIGZyb20gY2FjaGVcIik7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gaWYgKHRoaXMudGlsZXNba2V5XS5sb2FkaW5nID09IHRydWUpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiYWxyZWFkeSBsb2FkaW5nIHRpbGUgXCIgKyBrZXkgKyBcIiwgc2tpcFwiKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGl2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV0gPSB7fTtcbiAgICB0aWxlLmtleSA9IGtleTtcbiAgICB0aWxlLmNvb3JkcyA9IGNvb3JkcztcbiAgICB0aWxlLm1pbiA9IEdlby5tZXRlcnNGb3JUaWxlKHRpbGUuY29vcmRzKTtcbiAgICB0aWxlLm1heCA9IEdlby5tZXRlcnNGb3JUaWxlKHsgeDogdGlsZS5jb29yZHMueCArIDEsIHk6IHRpbGUuY29vcmRzLnkgKyAxLCB6OiB0aWxlLmNvb3Jkcy56IH0pO1xuICAgIHRpbGUuc3BhbiA9IHsgeDogKHRpbGUubWF4LnggLSB0aWxlLm1pbi54KSwgeTogKHRpbGUubWF4LnkgLSB0aWxlLm1pbi55KSB9O1xuICAgIHRpbGUuYm91bmRzID0geyBzdzogeyB4OiB0aWxlLm1pbi54LCB5OiB0aWxlLm1heC55IH0sIG5lOiB7IHg6IHRpbGUubWF4LngsIHk6IHRpbGUubWluLnkgfSB9O1xuICAgIHRpbGUuZGVidWcgPSB7fTtcbiAgICB0aWxlLmxvYWRpbmcgPSB0cnVlO1xuICAgIHRpbGUubG9hZGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLmJ1aWxkVGlsZSh0aWxlLmtleSk7XG4gICAgdGhpcy51cGRhdGVUaWxlRWxlbWVudCh0aWxlLCBkaXYpO1xuICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUodGlsZSk7XG5cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgZGl2KTtcbiAgICB9XG59O1xuXG4vLyBSZWJ1aWxkIGFsbCB0aWxlc1xuLy8gVE9ETzogYWxzbyByZWJ1aWxkIG1vZGVzPyAoZGV0ZWN0IGlmIGNoYW5nZWQpXG5TY2VuZS5wcm90b3R5cGUucmVidWlsZFRpbGVzID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBVcGRhdGUgbGF5ZXJzICYgc3R5bGVzXG4gICAgdGhpcy5sYXllcnNfc2VyaWFsaXplZCA9IFV0aWxzLnNlcmlhbGl6ZVdpdGhGdW5jdGlvbnModGhpcy5sYXllcnMpO1xuICAgIHRoaXMuc3R5bGVzX3NlcmlhbGl6ZWQgPSBVdGlscy5zZXJpYWxpemVXaXRoRnVuY3Rpb25zKHRoaXMuc3R5bGVzKTtcbiAgICB0aGlzLnNlbGVjdGlvbl9tYXAgPSB7fTtcblxuICAgIC8vIFRlbGwgd29ya2VycyB3ZSdyZSBhYm91dCB0byByZWJ1aWxkIChzbyB0aGV5IGNhbiByZWZyZXNoIHN0eWxlcywgZXRjLilcbiAgICB0aGlzLndvcmtlcnMuZm9yRWFjaChmdW5jdGlvbih3b3JrZXIpIHtcbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6ICdwcmVwYXJlRm9yUmVidWlsZCcsXG4gICAgICAgICAgICBsYXllcnM6IHRoaXMubGF5ZXJzX3NlcmlhbGl6ZWQsXG4gICAgICAgICAgICBzdHlsZXM6IHRoaXMuc3R5bGVzX3NlcmlhbGl6ZWRcbiAgICAgICAgfSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIC8vIFJlYnVpbGQgdmlzaWJsZSB0aWxlcyBmaXJzdCwgZnJvbSBjZW50ZXIgb3V0XG4gICAgLy8gY29uc29sZS5sb2coXCJmaW5kIHZpc2libGVcIik7XG4gICAgdmFyIHZpc2libGUgPSBbXSwgaW52aXNpYmxlID0gW107XG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbGVzW3RdLnZpc2libGUgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdmlzaWJsZS5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW52aXNpYmxlLnB1c2godCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhcInNvcnQgdmlzaWJsZSBkaXN0YW5jZVwiKTtcbiAgICB2aXNpYmxlLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAvLyB2YXIgYWQgPSBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueCAtIHRoaXMudGlsZXNbYl0ubWluLngpICsgTWF0aC5hYnModGhpcy5jZW50ZXJfbWV0ZXJzLnkgLSB0aGlzLnRpbGVzW2JdLm1pbi55KTtcbiAgICAgICAgLy8gdmFyIGJkID0gTWF0aC5hYnModGhpcy5jZW50ZXJfbWV0ZXJzLnggLSB0aGlzLnRpbGVzW2FdLm1pbi54KSArIE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy55IC0gdGhpcy50aWxlc1thXS5taW4ueSk7XG4gICAgICAgIHZhciBhZCA9IHRoaXMudGlsZXNbYV0uY2VudGVyX2Rpc3Q7XG4gICAgICAgIHZhciBiZCA9IHRoaXMudGlsZXNbYl0uY2VudGVyX2Rpc3Q7XG4gICAgICAgIHJldHVybiAoYmQgPiBhZCA/IC0xIDogKGJkID09IGFkID8gMCA6IDEpKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZCB2aXNpYmxlXCIpO1xuICAgIGZvciAodmFyIHQgaW4gdmlzaWJsZSkge1xuICAgICAgICB0aGlzLmJ1aWxkVGlsZSh2aXNpYmxlW3RdKTtcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkIGludmlzaWJsZVwiKTtcbiAgICBmb3IgKHZhciB0IGluIGludmlzaWJsZSkge1xuICAgICAgICAvLyBLZWVwIHRpbGVzIGluIGN1cnJlbnQgem9vbSBidXQgb3V0IG9mIHZpc2libGUgcmFuZ2UsIGJ1dCByZWJ1aWxkIGFzIGxvd2VyIHByaW9yaXR5XG4gICAgICAgIGlmICh0aGlzLmlzVGlsZUluWm9vbSh0aGlzLnRpbGVzW2ludmlzaWJsZVt0XV0pID09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuYnVpbGRUaWxlKGludmlzaWJsZVt0XSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRHJvcCB0aWxlcyBvdXRzaWRlIGN1cnJlbnQgem9vbVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlVGlsZShpbnZpc2libGVbdF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVBY3RpdmVNb2RlcygpO1xuICAgIHRoaXMucmVzZXRUaW1lKCk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuYnVpbGRUaWxlID0gZnVuY3Rpb24oa2V5KVxue1xuICAgIHZhciB0aWxlID0gdGhpcy50aWxlc1trZXldO1xuXG4gICAgdGhpcy53b3JrZXJQb3N0TWVzc2FnZUZvclRpbGUodGlsZSwge1xuICAgICAgICB0eXBlOiAnYnVpbGRUaWxlJyxcbiAgICAgICAgdGlsZToge1xuICAgICAgICAgICAga2V5OiB0aWxlLmtleSxcbiAgICAgICAgICAgIGNvb3JkczogdGlsZS5jb29yZHMsIC8vIHVzZWQgYnkgc3R5bGUgaGVscGVyc1xuICAgICAgICAgICAgbWluOiB0aWxlLm1pbiwgLy8gdXNlZCBieSBUaWxlU291cmNlIHRvIHNjYWxlIHRpbGUgdG8gbG9jYWwgZXh0ZW50c1xuICAgICAgICAgICAgbWF4OiB0aWxlLm1heCwgLy8gdXNlZCBieSBUaWxlU291cmNlIHRvIHNjYWxlIHRpbGUgdG8gbG9jYWwgZXh0ZW50c1xuICAgICAgICAgICAgZGVidWc6IHRpbGUuZGVidWdcbiAgICAgICAgfSxcbiAgICAgICAgdGlsZV9zb3VyY2U6IHRoaXMudGlsZV9zb3VyY2UsXG4gICAgICAgIGxheWVyczogdGhpcy5sYXllcnNfc2VyaWFsaXplZCxcbiAgICAgICAgc3R5bGVzOiB0aGlzLnN0eWxlc19zZXJpYWxpemVkXG4gICAgfSk7XG59O1xuXG4vLyBQcm9jZXNzIGdlb21ldHJ5IGZvciB0aWxlIC0gY2FsbGVkIGJ5IHdlYiB3b3JrZXJcbi8vIFJldHVybnMgYSBzZXQgb2YgdGlsZSBrZXlzIHRoYXQgc2hvdWxkIGJlIHNlbnQgdG8gdGhlIG1haW4gdGhyZWFkIChzbyB0aGF0IHdlIGNhbiBtaW5pbWl6ZSBkYXRhIGV4Y2hhbmdlIGJldHdlZW4gd29ya2VyIGFuZCBtYWluIHRocmVhZClcblNjZW5lLmFkZFRpbGUgPSBmdW5jdGlvbiAodGlsZSwgbGF5ZXJzLCBzdHlsZXMsIG1vZGVzKVxue1xuICAgIHZhciBsYXllciwgc3R5bGUsIGZlYXR1cmUsIHosIG1vZGU7XG4gICAgdmFyIHZlcnRleF9kYXRhID0ge307XG5cbiAgICAvLyBKb2luIGxpbmUgdGVzdCBwYXR0ZXJuXG4gICAgLy8gaWYgKFNjZW5lLmRlYnVnKSB7XG4gICAgLy8gICAgIHRpbGUubGF5ZXJzWydyb2FkcyddLmZlYXR1cmVzLnB1c2goU2NlbmUuYnVpbGRaaWd6YWdMaW5lVGVzdFBhdHRlcm4oKSk7XG4gICAgLy8gfVxuXG4gICAgLy8gQnVpbGQgcmF3IGdlb21ldHJ5IGFycmF5c1xuICAgIHRpbGUuZGVidWcuZmVhdHVyZXMgPSAwO1xuICAgIGZvciAodmFyIGxheWVyX251bT0wOyBsYXllcl9udW0gPCBsYXllcnMubGVuZ3RoOyBsYXllcl9udW0rKykge1xuICAgICAgICBsYXllciA9IGxheWVyc1tsYXllcl9udW1dO1xuXG4gICAgICAgIC8vIFNraXAgbGF5ZXJzIHdpdGggbm8gc3R5bGVzIGRlZmluZWQsIG9yIGxheWVycyBzZXQgdG8gbm90IGJlIHZpc2libGVcbiAgICAgICAgaWYgKHN0eWxlcy5sYXllcnNbbGF5ZXIubmFtZV0gPT0gbnVsbCB8fCBzdHlsZXMubGF5ZXJzW2xheWVyLm5hbWVdLnZpc2libGUgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRpbGUubGF5ZXJzW2xheWVyLm5hbWVdICE9IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBudW1fZmVhdHVyZXMgPSB0aWxlLmxheWVyc1tsYXllci5uYW1lXS5mZWF0dXJlcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIC8vIFJlbmRlcmluZyByZXZlcnNlIG9yZGVyIGFrYSB0b3AgdG8gYm90dG9tXG4gICAgICAgICAgICBmb3IgKHZhciBmID0gbnVtX2ZlYXR1cmVzLTE7IGYgPj0gMDsgZi0tKSB7XG4gICAgICAgICAgICAgICAgZmVhdHVyZSA9IHRpbGUubGF5ZXJzW2xheWVyLm5hbWVdLmZlYXR1cmVzW2ZdO1xuICAgICAgICAgICAgICAgIHN0eWxlID0gU3R5bGUucGFyc2VTdHlsZUZvckZlYXR1cmUoZmVhdHVyZSwgbGF5ZXIubmFtZSwgc3R5bGVzLmxheWVyc1tsYXllci5uYW1lXSwgdGlsZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBTa2lwIGZlYXR1cmU/XG4gICAgICAgICAgICAgICAgaWYgKHN0eWxlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3R5bGUubGF5ZXJfbnVtID0gbGF5ZXJfbnVtO1xuICAgICAgICAgICAgICAgIHN0eWxlLnogPSBTY2VuZS5jYWxjdWxhdGVaKGxheWVyLCB0aWxlKSArIHN0eWxlLno7XG5cbiAgICAgICAgICAgICAgICB2YXIgcG9pbnRzID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbGluZXMgPSBudWxsLFxuICAgICAgICAgICAgICAgICAgICBwb2x5Z29ucyA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJykge1xuICAgICAgICAgICAgICAgICAgICBwb2x5Z29ucyA9IFtmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvbHlnb25zID0gZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IFtmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdNdWx0aUxpbmVTdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzID0gZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdQb2ludCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRzID0gW2ZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvaW50cyA9IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRmlyc3QgZmVhdHVyZSBpbiB0aGlzIHJlbmRlciBtb2RlP1xuICAgICAgICAgICAgICAgIG1vZGUgPSBzdHlsZS5tb2RlLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKHZlcnRleF9kYXRhW21vZGVdID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4X2RhdGFbbW9kZV0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocG9seWdvbnMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBtb2Rlc1ttb2RlXS5idWlsZFBvbHlnb25zKHBvbHlnb25zLCBzdHlsZSwgdmVydGV4X2RhdGFbbW9kZV0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChsaW5lcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVzW21vZGVdLmJ1aWxkTGluZXMobGluZXMsIHN0eWxlLCB2ZXJ0ZXhfZGF0YVttb2RlXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBvaW50cyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVzW21vZGVdLmJ1aWxkUG9pbnRzKHBvaW50cywgc3R5bGUsIHZlcnRleF9kYXRhW21vZGVdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aWxlLmRlYnVnLmZlYXR1cmVzKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aWxlLnZlcnRleF9kYXRhID0ge307XG4gICAgZm9yICh2YXIgcyBpbiB2ZXJ0ZXhfZGF0YSkge1xuICAgICAgICB0aWxlLnZlcnRleF9kYXRhW3NdID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXhfZGF0YVtzXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmVydGV4X2RhdGE6IHRydWVcbiAgICB9O1xufTtcblxuLy8gQ2FsbGVkIG9uIG1haW4gdGhyZWFkIHdoZW4gYSB3ZWIgd29ya2VyIGNvbXBsZXRlcyBwcm9jZXNzaW5nIGZvciBhIHNpbmdsZSB0aWxlIChpbml0aWFsIGxvYWQsIG9yIHJlYnVpbGQpXG5TY2VuZS5wcm90b3R5cGUud29ya2VyQnVpbGRUaWxlQ29tcGxldGVkID0gZnVuY3Rpb24gKGV2ZW50KVxue1xuICAgIGlmIChldmVudC5kYXRhLnR5cGUgIT0gJ2J1aWxkVGlsZUNvbXBsZXRlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRyYWNrIHNlbGVjdGlvbiBtYXAgc2l6ZSAoZm9yIHN0YXRzL2RlYnVnKSAtIHVwZGF0ZSBwZXIgd29ya2VyIGFuZCBzdW0gYWNyb3NzIHdvcmtlcnNcbiAgICB0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemVbZXZlbnQuZGF0YS53b3JrZXJfaWRdID0gZXZlbnQuZGF0YS5zZWxlY3Rpb25fbWFwX3NpemU7XG4gICAgdGhpcy5zZWxlY3Rpb25fbWFwX3NpemUgPSAwO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuc2VsZWN0aW9uX21hcF93b3JrZXJfc2l6ZSkuZm9yRWFjaChmdW5jdGlvbih3KSB7IHRoaXMuc2VsZWN0aW9uX21hcF9zaXplICs9IHRoaXMuc2VsZWN0aW9uX21hcF93b3JrZXJfc2l6ZVt3XTsgfS5iaW5kKHRoaXMpKTtcbiAgICBjb25zb2xlLmxvZyhcInNlbGVjdGlvbiBtYXA6IFwiICsgdGhpcy5zZWxlY3Rpb25fbWFwX3NpemUgKyBcIiBmZWF0dXJlc1wiKTtcblxuICAgIHZhciB0aWxlID0gZXZlbnQuZGF0YS50aWxlO1xuXG4gICAgLy8gUmVtb3ZlZCB0aGlzIHRpbGUgZHVyaW5nIGxvYWQ/XG4gICAgaWYgKHRoaXMudGlsZXNbdGlsZS5rZXldID09IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJkaXNjYXJkZWQgdGlsZSBcIiArIHRpbGUua2V5ICsgXCIgaW4gU2NlbmUudGlsZVdvcmtlckNvbXBsZXRlZCBiZWNhdXNlIHByZXZpb3VzbHkgcmVtb3ZlZFwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aWxlIHdpdGggcHJvcGVydGllcyBmcm9tIHdvcmtlclxuICAgIHRpbGUgPSB0aGlzLm1lcmdlVGlsZSh0aWxlLmtleSwgdGlsZSk7XG5cbiAgICB0aGlzLmJ1aWxkR0xHZW9tZXRyeSh0aWxlKTtcblxuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgIHRoaXMudHJhY2tUaWxlU2V0TG9hZEVuZCgpO1xuICAgIHRoaXMucHJpbnREZWJ1Z0ZvclRpbGUodGlsZSk7XG59O1xuXG4vLyBDYWxsZWQgb24gbWFpbiB0aHJlYWQgd2hlbiBhIHdlYiB3b3JrZXIgY29tcGxldGVzIHByb2Nlc3NpbmcgZm9yIGEgc2luZ2xlIHRpbGVcblNjZW5lLnByb3RvdHlwZS5idWlsZEdMR2VvbWV0cnkgPSBmdW5jdGlvbiAodGlsZSlcbntcbiAgICB2YXIgdmVydGV4X2RhdGEgPSB0aWxlLnZlcnRleF9kYXRhO1xuXG4gICAgLy8gQ2xlYW51cCBleGlzdGluZyBHTCBnZW9tZXRyeSBvYmplY3RzXG4gICAgdGhpcy5mcmVlVGlsZVJlc291cmNlcyh0aWxlKTtcbiAgICB0aWxlLmdsX2dlb21ldHJ5ID0ge307XG5cbiAgICAvLyBDcmVhdGUgR0wgZ2VvbWV0cnkgb2JqZWN0c1xuICAgIGZvciAodmFyIHMgaW4gdmVydGV4X2RhdGEpIHtcbiAgICAgICAgdGlsZS5nbF9nZW9tZXRyeVtzXSA9IHRoaXMubW9kZXNbc10ubWFrZUdMR2VvbWV0cnkodmVydGV4X2RhdGFbc10pO1xuICAgIH1cblxuICAgIHRpbGUuZGVidWcuZ2VvbWV0cmllcyA9IDA7XG4gICAgdGlsZS5kZWJ1Zy5idWZmZXJfc2l6ZSA9IDA7XG4gICAgZm9yICh2YXIgcCBpbiB0aWxlLmdsX2dlb21ldHJ5KSB7XG4gICAgICAgIHRpbGUuZGVidWcuZ2VvbWV0cmllcyArPSB0aWxlLmdsX2dlb21ldHJ5W3BdLmdlb21ldHJ5X2NvdW50O1xuICAgICAgICB0aWxlLmRlYnVnLmJ1ZmZlcl9zaXplICs9IHRpbGUuZ2xfZ2VvbWV0cnlbcF0udmVydGV4X2RhdGEuYnl0ZUxlbmd0aDtcbiAgICB9XG4gICAgdGlsZS5kZWJ1Zy5nZW9tX3JhdGlvID0gKHRpbGUuZGVidWcuZ2VvbWV0cmllcyAvIHRpbGUuZGVidWcuZmVhdHVyZXMpLnRvRml4ZWQoMSk7XG5cbiAgICBkZWxldGUgdGlsZS52ZXJ0ZXhfZGF0YTsgLy8gVE9ETzogbWlnaHQgd2FudCB0byBwcmVzZXJ2ZSB0aGlzIGZvciByZWJ1aWxkaW5nIGdlb21ldHJpZXMgd2hlbiBzdHlsZXMvZXRjLiBjaGFuZ2U/XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucmVtb3ZlVGlsZSA9IGZ1bmN0aW9uIChrZXkpXG57XG4gICAgY29uc29sZS5sb2coXCJ0aWxlIHVubG9hZCBmb3IgXCIgKyBrZXkpO1xuXG4gICAgaWYgKHRoaXMuem9vbWluZyA9PSB0cnVlKSB7XG4gICAgICAgIHJldHVybjsgLy8gc2hvcnQgY2lyY3VpdCB0aWxlIHJlbW92YWwsIHdpbGwgc3dlZXAgb3V0IHRpbGVzIGJ5IHpvb20gbGV2ZWwgd2hlbiB6b29tIGVuZHNcbiAgICB9XG5cbiAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNba2V5XTtcblxuICAgIGlmICh0aWxlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5mcmVlVGlsZVJlc291cmNlcyh0aWxlKTtcblxuICAgICAgICAvLyBXZWIgd29ya2VyIHdpbGwgY2FuY2VsIFhIUiByZXF1ZXN0c1xuICAgICAgICB0aGlzLndvcmtlclBvc3RNZXNzYWdlRm9yVGlsZSh0aWxlLCB7XG4gICAgICAgICAgICB0eXBlOiAncmVtb3ZlVGlsZScsXG4gICAgICAgICAgICBrZXk6IHRpbGUua2V5XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRlbGV0ZSB0aGlzLnRpbGVzW2tleV07XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG4vLyBGcmVlIGFueSBHTCAvIG93bmVkIHJlc291cmNlc1xuU2NlbmUucHJvdG90eXBlLmZyZWVUaWxlUmVzb3VyY2VzID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgaWYgKHRpbGUgIT0gbnVsbCAmJiB0aWxlLmdsX2dlb21ldHJ5ICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgcCBpbiB0aWxlLmdsX2dlb21ldHJ5KSB7XG4gICAgICAgICAgICB0aWxlLmdsX2dlb21ldHJ5W3BdLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICB0aWxlLmdsX2dlb21ldHJ5ID0gbnVsbDtcbiAgICB9XG59O1xuXG4vLyBBdHRhY2hlcyB0cmFja2luZyBhbmQgZGVidWcgaW50byB0byB0aGUgcHJvdmlkZWQgdGlsZSBET00gZWxlbWVudFxuU2NlbmUucHJvdG90eXBlLnVwZGF0ZVRpbGVFbGVtZW50ID0gZnVuY3Rpb24gKHRpbGUsIGRpdilcbntcbiAgICAvLyBEZWJ1ZyBpbmZvXG4gICAgZGl2LnNldEF0dHJpYnV0ZSgnZGF0YS10aWxlLWtleScsIHRpbGUua2V5KTtcbiAgICBkaXYuc3R5bGUud2lkdGggPSAnMjU2cHgnO1xuICAgIGRpdi5zdHlsZS5oZWlnaHQgPSAnMjU2cHgnO1xuXG4gICAgaWYgKHRoaXMuZGVidWcpIHtcbiAgICAgICAgdmFyIGRlYnVnX292ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGVidWdfb3ZlcmxheS50ZXh0Q29udGVudCA9IHRpbGUua2V5O1xuICAgICAgICBkZWJ1Z19vdmVybGF5LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5sZWZ0ID0gMDtcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS50b3AgPSAwO1xuICAgICAgICBkZWJ1Z19vdmVybGF5LnN0eWxlLmNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5mb250U2l6ZSA9ICcxNnB4JztcbiAgICAgICAgLy8gZGVidWdfb3ZlcmxheS5zdHlsZS50ZXh0T3V0bGluZSA9ICcxcHggIzAwMDAwMCc7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChkZWJ1Z19vdmVybGF5KTtcblxuICAgICAgICBkaXYuc3R5bGUuYm9yZGVyU3R5bGUgPSAnc29saWQnO1xuICAgICAgICBkaXYuc3R5bGUuYm9yZGVyQ29sb3IgPSAnd2hpdGUnO1xuICAgICAgICBkaXYuc3R5bGUuYm9yZGVyV2lkdGggPSAnMXB4JztcbiAgICB9XG59O1xuXG4vLyBNZXJnZSBwcm9wZXJ0aWVzIGZyb20gYSBwcm92aWRlZCB0aWxlIG9iamVjdCBpbnRvIHRoZSBtYWluIHRpbGUgc3RvcmUuIFNoYWxsb3cgbWVyZ2UgKGp1c3QgY29waWVzIHRvcC1sZXZlbCBwcm9wZXJ0aWVzKSFcbi8vIFVzZWQgZm9yIHNlbGVjdGl2ZWx5IHVwZGF0aW5nIHByb3BlcnRpZXMgb2YgdGlsZXMgcGFzc2VkIGJldHdlZW4gbWFpbiB0aHJlYWQgYW5kIHdvcmtlclxuLy8gKHNvIHdlIGRvbid0IGhhdmUgdG8gcGFzcyB0aGUgd2hvbGUgdGlsZSwgaW5jbHVkaW5nIHNvbWUgcHJvcGVydGllcyB3aGljaCBjYW5ub3QgYmUgY2xvbmVkIGZvciBhIHdvcmtlcikuXG5TY2VuZS5wcm90b3R5cGUubWVyZ2VUaWxlID0gZnVuY3Rpb24gKGtleSwgc291cmNlX3RpbGUpXG57XG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV07XG5cbiAgICBpZiAodGlsZSA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMudGlsZXNba2V5XSA9IHNvdXJjZV90aWxlO1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlc1trZXldO1xuICAgIH1cblxuICAgIGZvciAodmFyIHAgaW4gc291cmNlX3RpbGUpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJtZXJnaW5nIFwiICsgcCArIFwiOiBcIiArIHNvdXJjZV90aWxlW3BdKTtcbiAgICAgICAgdGlsZVtwXSA9IHNvdXJjZV90aWxlW3BdO1xuICAgIH1cblxuICAgIHJldHVybiB0aWxlO1xufTtcblxuLy8gQ2FsbGVkIG9uIG1haW4gdGhyZWFkIHdoZW4gYSB3ZWIgd29ya2VyIGZpbmRzIGEgZmVhdHVyZSBpbiB0aGUgc2VsZWN0aW9uIGJ1ZmZlclxuU2NlbmUucHJvdG90eXBlLndvcmtlckdldEZlYXR1cmVTZWxlY3Rpb24gPSBmdW5jdGlvbiAoZXZlbnQpXG57XG4gICAgaWYgKGV2ZW50LmRhdGEudHlwZSAhPSAnZ2V0RmVhdHVyZVNlbGVjdGlvbicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBmZWF0dXJlID0gZXZlbnQuZGF0YS5mZWF0dXJlO1xuICAgIHZhciBjaGFuZ2VkID0gZmFsc2U7XG4gICAgaWYgKChmZWF0dXJlICE9IG51bGwgJiYgdGhpcy5zZWxlY3RlZF9mZWF0dXJlID09IG51bGwpIHx8XG4gICAgICAgIChmZWF0dXJlID09IG51bGwgJiYgdGhpcy5zZWxlY3RlZF9mZWF0dXJlICE9IG51bGwpIHx8XG4gICAgICAgIChmZWF0dXJlICE9IG51bGwgJiYgdGhpcy5zZWxlY3RlZF9mZWF0dXJlICE9IG51bGwgJiYgZmVhdHVyZS5pZCAhPSB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUuaWQpKSB7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZWN0ZWRfZmVhdHVyZSA9IGZlYXR1cmU7XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2soeyBmZWF0dXJlOiB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUsIGNoYW5nZWQ6IGNoYW5nZWQgfSk7XG4gICAgfVxufTtcblxuLy8gUmVsb2FkIGxheWVycyBhbmQgc3R5bGVzIChvbmx5IGlmIHRoZXkgd2VyZSBvcmlnaW5hbGx5IGxvYWRlZCBieSBVUkwpLiBNb3N0bHkgdXNlZnVsIGZvciB0ZXN0aW5nLlxuU2NlbmUucHJvdG90eXBlLnJlbG9hZENvbmZpZyA9IGZ1bmN0aW9uICgpXG57XG4gICAgaWYgKHRoaXMubGF5ZXJfc291cmNlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5sYXllcnMgPSBTY2VuZS5sb2FkTGF5ZXJzKHRoaXMubGF5ZXJfc291cmNlKTtcbiAgICAgICAgdGhpcy5sYXllcnNfc2VyaWFsaXplZCA9IFV0aWxzLnNlcmlhbGl6ZVdpdGhGdW5jdGlvbnModGhpcy5sYXllcnMpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0eWxlX3NvdXJjZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzID0gU2NlbmUubG9hZFN0eWxlcyh0aGlzLnN0eWxlX3NvdXJjZSk7XG4gICAgICAgIHRoaXMuc3R5bGVzX3NlcmlhbGl6ZWQgPSBVdGlscy5zZXJpYWxpemVXaXRoRnVuY3Rpb25zKHRoaXMuc3R5bGVzKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5sYXllcl9zb3VyY2UgIT0gbnVsbCB8fCB0aGlzLnN0eWxlX3NvdXJjZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVidWlsZFRpbGVzKCk7XG4gICAgfVxufTtcblxuLy8gQ2FsbGVkIChjdXJyZW50bHkgbWFudWFsbHkpIGFmdGVyIG1vZGVzIGFyZSB1cGRhdGVkIGluIHN0eWxlc2hlZXRcblNjZW5lLnByb3RvdHlwZS5yZWZyZXNoTW9kZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIHRoaXMubW9kZXMgPSBTY2VuZS5yZWZyZXNoTW9kZXModGhpcy5tb2RlcywgdGhpcy5zdHlsZXMpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnVwZGF0ZUFjdGl2ZU1vZGVzID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBNYWtlIGEgc2V0IG9mIGN1cnJlbnRseSBhY3RpdmUgbW9kZXMgKHVzZWQgaW4gYSBsYXllcilcbiAgICB0aGlzLmFjdGl2ZV9tb2RlcyA9IHt9O1xuICAgIHZhciBhbmltYXRlZCA9IGZhbHNlOyAvLyBpcyBhbnkgYWN0aXZlIG1vZGUgYW5pbWF0ZWQ/XG4gICAgZm9yICh2YXIgbCBpbiB0aGlzLnN0eWxlcy5sYXllcnMpIHtcbiAgICAgICAgdmFyIG1vZGUgPSB0aGlzLnN0eWxlcy5sYXllcnNbbF0ubW9kZS5uYW1lO1xuICAgICAgICBpZiAodGhpcy5zdHlsZXMubGF5ZXJzW2xdLnZpc2libGUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZV9tb2Rlc1ttb2RlXSA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgbW9kZSBpcyBhbmltYXRlZFxuICAgICAgICAgICAgaWYgKGFuaW1hdGVkID09IGZhbHNlICYmIHRoaXMubW9kZXNbbW9kZV0uYW5pbWF0ZWQgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGFuaW1hdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmFuaW1hdGVkID0gYW5pbWF0ZWQ7XG59O1xuXG4vLyBSZXNldCBpbnRlcm5hbCBjbG9jaywgbW9zdGx5IHVzZWZ1bCBmb3IgY29uc2lzdGVudCBleHBlcmllbmNlIHdoZW4gY2hhbmdpbmcgbW9kZXMvZGVidWdnaW5nXG5TY2VuZS5wcm90b3R5cGUucmVzZXRUaW1lID0gZnVuY3Rpb24gKClcbntcbiAgICB0aGlzLnN0YXJ0X3RpbWUgPSArbmV3IERhdGUoKTtcbn07XG5cbi8vIFVzZXIgaW5wdXRcbi8vIFRPRE86IHJlc3RvcmUgZnJhY3Rpb25hbCB6b29tIHN1cHBvcnQgb25jZSBsZWFmbGV0IGFuaW1hdGlvbiByZWZhY3RvciBwdWxsIHJlcXVlc3QgaXMgbWVyZ2VkXG5cblNjZW5lLnByb3RvdHlwZS5pbml0SW5wdXRIYW5kbGVycyA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gdGhpcy5rZXkgPSBudWxsO1xuXG4gICAgLy8gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIC8vICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PSAzNykge1xuICAgIC8vICAgICAgICAgdGhpcy5rZXkgPSAnbGVmdCc7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PSAzOSkge1xuICAgIC8vICAgICAgICAgdGhpcy5rZXkgPSAncmlnaHQnO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gMzgpIHtcbiAgICAvLyAgICAgICAgIHRoaXMua2V5ID0gJ3VwJztcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDQwKSB7XG4gICAgLy8gICAgICAgICB0aGlzLmtleSA9ICdkb3duJztcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDgzKSB7IC8vIHNcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKFwicmVsb2FkaW5nIHNoYWRlcnNcIik7XG4gICAgLy8gICAgICAgICBmb3IgKHZhciBtb2RlIGluIHRoaXMubW9kZXMpIHtcbiAgICAvLyAgICAgICAgICAgICB0aGlzLm1vZGVzW21vZGVdLmdsX3Byb2dyYW0uY29tcGlsZSgpO1xuICAgIC8vICAgICAgICAgfVxuICAgIC8vICAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9LmJpbmQodGhpcykpO1xuXG4gICAgLy8gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAvLyAgICAgdGhpcy5rZXkgPSBudWxsO1xuICAgIC8vIH0uYmluZCh0aGlzKSk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuaW5wdXQgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIC8vIEZyYWN0aW9uYWwgem9vbSBzY2FsaW5nXG4gICAgLy8gaWYgKHRoaXMua2V5ID09ICd1cCcpIHtcbiAgICAvLyAgICAgdGhpcy5zZXRab29tKHRoaXMuem9vbSArIHRoaXMuem9vbV9zdGVwKTtcbiAgICAvLyB9XG4gICAgLy8gZWxzZSBpZiAodGhpcy5rZXkgPT0gJ2Rvd24nKSB7XG4gICAgLy8gICAgIHRoaXMuc2V0Wm9vbSh0aGlzLnpvb20gLSB0aGlzLnpvb21fc3RlcCk7XG4gICAgLy8gfVxufTtcblxuXG4vLyBTdGF0cy9kZWJ1Zy9wcm9maWxpbmcgbWV0aG9kc1xuXG4vLyBQcm9maWxpbmcgbWV0aG9kcyB1c2VkIHRvIHRyYWNrIHdoZW4gc2V0cyBvZiB0aWxlcyBzdGFydC9zdG9wIGxvYWRpbmcgdG9nZXRoZXJcbi8vIGUuZy4gaW5pdGlhbCBwYWdlIGxvYWQgaXMgb25lIHNldCBvZiB0aWxlcywgbmV3IHNldHMgb2YgdGlsZSBsb2FkcyBhcmUgdGhlbiBpbml0aWF0ZWQgYnkgYSBtYXAgcGFuIG9yIHpvb21cblNjZW5lLnByb3RvdHlwZS50cmFja1RpbGVTZXRMb2FkU3RhcnQgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIFN0YXJ0IHRyYWNraW5nIG5ldyB0aWxlIHNldCBpZiBubyBvdGhlciB0aWxlcyBhbHJlYWR5IGxvYWRpbmdcbiAgICBpZiAodGhpcy50aWxlX3NldF9sb2FkaW5nID09IG51bGwpIHtcbiAgICAgICAgdGhpcy50aWxlX3NldF9sb2FkaW5nID0gK25ldyBEYXRlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidGlsZSBzZXQgbG9hZCBTVEFSVFwiKTtcbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUudHJhY2tUaWxlU2V0TG9hZEVuZCA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gTm8gbW9yZSB0aWxlcyBhY3RpdmVseSBsb2FkaW5nP1xuICAgIGlmICh0aGlzLnRpbGVfc2V0X2xvYWRpbmcgIT0gbnVsbCkge1xuICAgICAgICB2YXIgZW5kX3RpbGVfc2V0ID0gdHJ1ZTtcbiAgICAgICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50aWxlc1t0XS5sb2FkaW5nID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbmRfdGlsZV9zZXQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbmRfdGlsZV9zZXQgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5sYXN0X3RpbGVfc2V0X2xvYWQgPSAoK25ldyBEYXRlKCkpIC0gdGhpcy50aWxlX3NldF9sb2FkaW5nO1xuICAgICAgICAgICAgdGhpcy50aWxlX3NldF9sb2FkaW5nID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGlsZSBzZXQgbG9hZCBGSU5JU0hFRCBpbjogXCIgKyB0aGlzLmxhc3RfdGlsZV9zZXRfbG9hZCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucHJpbnREZWJ1Z0ZvclRpbGUgPSBmdW5jdGlvbiAodGlsZSlcbntcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgXCJkZWJ1ZyBmb3IgXCIgKyB0aWxlLmtleSArICc6IFsgJyArXG4gICAgICAgIE9iamVjdC5rZXlzKHRpbGUuZGVidWcpLm1hcChmdW5jdGlvbiAodCkgeyByZXR1cm4gdCArICc6ICcgKyB0aWxlLmRlYnVnW3RdOyB9KS5qb2luKCcsICcpICsgJyBdJ1xuICAgICk7XG59O1xuXG4vLyBSZWNvbXBpbGUgYWxsIHNoYWRlcnNcblNjZW5lLnByb3RvdHlwZS5jb21waWxlU2hhZGVycyA9IGZ1bmN0aW9uICgpXG57XG4gICAgZm9yICh2YXIgbSBpbiB0aGlzLm1vZGVzKSB7XG4gICAgICAgIHRoaXMubW9kZXNbbV0uZ2xfcHJvZ3JhbS5jb21waWxlKCk7XG4gICAgfVxufTtcblxuLy8gU3VtIG9mIGEgZGVidWcgcHJvcGVydHkgYWNyb3NzIHRpbGVzXG5TY2VuZS5wcm90b3R5cGUuZ2V0RGVidWdTdW0gPSBmdW5jdGlvbiAocHJvcCwgZmlsdGVyKVxue1xuICAgIHZhciBzdW0gPSAwO1xuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICBpZiAodGhpcy50aWxlc1t0XS5kZWJ1Z1twcm9wXSAhPSBudWxsICYmICh0eXBlb2YgZmlsdGVyICE9ICdmdW5jdGlvbicgfHwgZmlsdGVyKHRoaXMudGlsZXNbdF0pID09IHRydWUpKSB7XG4gICAgICAgICAgICBzdW0gKz0gdGhpcy50aWxlc1t0XS5kZWJ1Z1twcm9wXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3VtO1xufTtcblxuLy8gQXZlcmFnZSBvZiBhIGRlYnVnIHByb3BlcnR5IGFjcm9zcyB0aWxlc1xuU2NlbmUucHJvdG90eXBlLmdldERlYnVnQXZlcmFnZSA9IGZ1bmN0aW9uIChwcm9wLCBmaWx0ZXIpXG57XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGVidWdTdW0ocHJvcCwgZmlsdGVyKSAvIE9iamVjdC5rZXlzKHRoaXMudGlsZXMpLmxlbmd0aDtcbn07XG5cbi8vIExvZyBtZXNzYWdlcyBwYXNzIHRocm91Z2ggZnJvbSB3ZWIgd29ya2Vyc1xuU2NlbmUucHJvdG90eXBlLndvcmtlckxvZ01lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpXG57XG4gICAgaWYgKGV2ZW50LmRhdGEudHlwZSAhPSAnbG9nJykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJ3b3JrZXIgXCIgKyBldmVudC5kYXRhLndvcmtlcl9pZCArIFwiOiBcIiArIGV2ZW50LmRhdGEubXNnKTtcbn07XG5cblxuLyoqKiBDbGFzcyBtZXRob2RzIChzdGF0ZWxlc3MpICoqKi9cblxuU2NlbmUubG9hZExheWVycyA9IGZ1bmN0aW9uICh1cmwpXG57XG4gICAgdmFyIGxheWVycztcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHsgZXZhbCgnbGF5ZXJzID0gJyArIHJlcS5yZXNwb25zZSk7IH07IC8vIFRPRE86IHNlY3VyaXR5IVxuICAgIHJlcS5vcGVuKCdHRVQnLCB1cmwgKyAnPycgKyAoK25ldyBEYXRlKCkpLCBmYWxzZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICByZXEuc2VuZCgpO1xuICAgIHJldHVybiBsYXllcnM7XG59O1xuXG5TY2VuZS5sb2FkU3R5bGVzID0gZnVuY3Rpb24gKHVybClcbntcbiAgICB2YXIgc3R5bGVzO1xuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkgeyBzdHlsZXMgPSByZXEucmVzcG9uc2U7IH07XG4gICAgcmVxLm9wZW4oJ0dFVCcsIHVybCArICc/JyArICgrbmV3IERhdGUoKSksIGZhbHNlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgIHJlcS5zZW5kKCk7XG5cbiAgICAvLyBUcnkgSlNPTiBmaXJzdCwgdGhlbiBZQU1MIChpZiBhdmFpbGFibGUpXG4gICAgdHJ5IHtcbiAgICAgICAgZXZhbCgnc3R5bGVzID0gJyArIHJlcS5yZXNwb25zZSk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzdHlsZXMgPSB5YW1sLnNhZmVMb2FkKHJlcS5yZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmFpbGVkIHRvIHBhcnNlIHN0eWxlcyFcIik7XG4gICAgICAgICAgICBzdHlsZXMgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRmluZCBnZW5lcmljIGZ1bmN0aW9ucyAmIHN0eWxlIG1hY3Jvc1xuICAgIFV0aWxzLnN0cmluZ3NUb0Z1bmN0aW9ucyhzdHlsZXMpO1xuICAgIFN0eWxlLmV4cGFuZE1hY3JvcyhzdHlsZXMpO1xuICAgIFNjZW5lLnBvc3RQcm9jZXNzU3R5bGVzKHN0eWxlcyk7XG5cbiAgICByZXR1cm4gc3R5bGVzO1xufTtcblxuLy8gTm9ybWFsaXplIHNvbWUgc3R5bGUgc2V0dGluZ3MgdGhhdCBtYXkgbm90IGhhdmUgYmVlbiBleHBsaWNpdGx5IHNwZWNpZmllZCBpbiB0aGUgc3R5bGVzaGVldFxuU2NlbmUucG9zdFByb2Nlc3NTdHlsZXMgPSBmdW5jdGlvbiAoc3R5bGVzKVxue1xuICAgIC8vIFBvc3QtcHJvY2VzcyBzdHlsZXNcbiAgICBmb3IgKHZhciBtIGluIHN0eWxlcy5sYXllcnMpIHtcbiAgICAgICAgaWYgKHN0eWxlcy5sYXllcnNbbV0udmlzaWJsZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHN0eWxlcy5sYXllcnNbbV0udmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKHN0eWxlcy5sYXllcnNbbV0ubW9kZSAmJiBzdHlsZXMubGF5ZXJzW21dLm1vZGUubmFtZSkgPT0gbnVsbCkge1xuICAgICAgICAgICAgc3R5bGVzLmxheWVyc1ttXS5tb2RlID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIFN0eWxlLmRlZmF1bHRzLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMubGF5ZXJzW21dLm1vZGVbcF0gPSBTdHlsZS5kZWZhdWx0cy5tb2RlW3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlcztcbn07XG5cbi8vIFByb2Nlc3NlcyB0aGUgdGlsZSByZXNwb25zZSB0byBjcmVhdGUgbGF5ZXJzIGFzIGRlZmluZWQgYnkgdGhlIHNjZW5lXG4vLyBDYW4gaW5jbHVkZSBwb3N0LXByb2Nlc3NpbmcgdG8gcGFydGlhbGx5IGZpbHRlciBvciByZS1hcnJhbmdlIGRhdGEsIGUuZy4gb25seSBpbmNsdWRpbmcgUE9JcyB0aGF0IGhhdmUgbmFtZXNcblNjZW5lLnByb2Nlc3NMYXllcnNGb3JUaWxlID0gZnVuY3Rpb24gKGxheWVycywgdGlsZSlcbntcbiAgICB2YXIgdGlsZV9sYXllcnMgPSB7fTtcbiAgICBmb3IgKHZhciB0PTA7IHQgPCBsYXllcnMubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgbGF5ZXJzW3RdLm51bWJlciA9IHQ7XG5cbiAgICAgICAgaWYgKGxheWVyc1t0XSAhPSBudWxsKSB7XG4gICAgICAgICAgICAvLyBKdXN0IHBhc3MgdGhyb3VnaCBkYXRhIHVudG91Y2hlZCBpZiBubyBkYXRhIHRyYW5zZm9ybSBmdW5jdGlvbiBkZWZpbmVkXG4gICAgICAgICAgICBpZiAobGF5ZXJzW3RdLmRhdGEgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IHRpbGUubGF5ZXJzW2xheWVyc1t0XS5uYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFBhc3MgdGhyb3VnaCBkYXRhIGJ1dCB3aXRoIGRpZmZlcmVudCBsYXllciBuYW1lIGluIHRpbGUgc291cmNlIGRhdGFcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBsYXllcnNbdF0uZGF0YSA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IHRpbGUubGF5ZXJzW2xheWVyc1t0XS5kYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEFwcGx5IHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gZm9yIHBvc3QtcHJvY2Vzc2luZ1xuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGxheWVyc1t0XS5kYXRhID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aWxlX2xheWVyc1tsYXllcnNbdF0ubmFtZV0gPSBsYXllcnNbdF0uZGF0YSh0aWxlLmxheWVycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIYW5kbGUgY2FzZXMgd2hlcmUgbm8gZGF0YSB3YXMgZm91bmQgaW4gdGlsZSBvciByZXR1cm5lZCBieSBwb3N0LXByb2Nlc3NvclxuICAgICAgICB0aWxlX2xheWVyc1tsYXllcnNbdF0ubmFtZV0gPSB0aWxlX2xheWVyc1tsYXllcnNbdF0ubmFtZV0gfHwgeyB0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLCBmZWF0dXJlczogW10gfTtcbiAgICB9XG4gICAgdGlsZS5sYXllcnMgPSB0aWxlX2xheWVycztcbiAgICByZXR1cm4gdGlsZV9sYXllcnM7XG59O1xuXG4vLyBDYWxsZWQgb25jZSBvbiBpbnN0YW50aWF0aW9uXG5TY2VuZS5jcmVhdGVNb2RlcyA9IGZ1bmN0aW9uIChtb2Rlcywgc3R5bGVzKVxue1xuICAgIC8vIEJ1aWx0LWluIG1vZGVzXG4gICAgdmFyIGJ1aWx0X2lucyA9IHJlcXVpcmUoJy4vZ2wvZ2xfbW9kZXMnKS5Nb2RlczsgLy8gVE9ETzogbWFrZSB0aGlzIG5vbi1HTCBzcGVjaWZpY1xuICAgIGZvciAodmFyIG0gaW4gYnVpbHRfaW5zKSB7XG4gICAgICAgIG1vZGVzW21dID0gYnVpbHRfaW5zW21dO1xuICAgIH1cblxuICAgIC8vIFN0eWxlc2hlZXQgbW9kZXNcbiAgICBmb3IgKHZhciBtIGluIHN0eWxlcy5tb2Rlcykge1xuICAgICAgICAvLyBpZiAobSAhPSAnYWxsJykge1xuICAgICAgICAgICAgbW9kZXNbbV0gPSBNb2RlTWFuYWdlci5jb25maWd1cmVNb2RlKG0sIHN0eWxlcy5tb2Rlc1ttXSk7XG4gICAgICAgIC8vIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbW9kZXM7XG59O1xuXG5TY2VuZS5yZWZyZXNoTW9kZXMgPSBmdW5jdGlvbiAobW9kZXMsIHN0eWxlcylcbntcbiAgICAvLyBDb3B5IHN0eWxlc2hlZXQgbW9kZXNcbiAgICAvLyBUT0RPOiBpcyB0aGlzIHRoZSBiZXN0IHdheSB0byBjb3B5IHN0eWxlc2hlZXQgY2hhbmdlcyB0byBtb2RlIGluc3RhbmNlcz9cbiAgICBmb3IgKHZhciBtIGluIHN0eWxlcy5tb2Rlcykge1xuICAgICAgICAvLyBpZiAobSAhPSAnYWxsJykge1xuICAgICAgICAgICAgTW9kZU1hbmFnZXIuY29uZmlndXJlTW9kZShtLCBzdHlsZXMubW9kZXNbbV0pO1xuICAgICAgICAvLyB9XG4gICAgfVxuXG4gICAgLy8gUmVmcmVzaCBhbGwgbW9kZXNcbiAgICBmb3IgKG0gaW4gbW9kZXMpIHtcbiAgICAgICAgbW9kZXNbbV0ucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJldHVybiBtb2Rlcztcbn07XG5cblxuLy8gUHJpdmF0ZS9pbnRlcm5hbFxuXG4vLyBHZXQgYmFzZSBVUkwgZnJvbSB3aGljaCB0aGUgbGlicmFyeSB3YXMgbG9hZGVkXG4vLyBVc2VkIHRvIGxvYWQgYWRkaXRpb25hbCByZXNvdXJjZXMgbGlrZSBzaGFkZXJzLCB0ZXh0dXJlcywgZXRjLiBpbiBjYXNlcyB3aGVyZSBsaWJyYXJ5IHdhcyBsb2FkZWQgZnJvbSBhIHJlbGF0aXZlIHBhdGhcbmZ1bmN0aW9uIGZpbmRCYXNlTGlicmFyeVVSTCAoKVxue1xuICAgIFNjZW5lLmxpYnJhcnlfYmFzZV91cmwgPSAnJztcbiAgICB2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKTsgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W3NyYyo9XCIuanNcIl0nKTtcbiAgICBmb3IgKHZhciBzPTA7IHMgPCBzY3JpcHRzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgIHZhciBtYXRjaCA9IHNjcmlwdHNbc10uc3JjLmluZGV4T2YoJ3RhbmdyYW0uZGVidWcuanMnKTtcbiAgICAgICAgaWYgKG1hdGNoID09IC0xKSB7XG4gICAgICAgICAgICBtYXRjaCA9IHNjcmlwdHNbc10uc3JjLmluZGV4T2YoJ3RhbmdyYW0ubWluLmpzJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hdGNoID49IDApIHtcbiAgICAgICAgICAgIFNjZW5lLmxpYnJhcnlfYmFzZV91cmwgPSBzY3JpcHRzW3NdLnNyYy5zdWJzdHIoMCwgbWF0Y2gpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNjZW5lO1xufVxuIiwiLyoqKiBTdHlsZSBoZWxwZXJzICoqKi9cbnZhciBHZW8gPSByZXF1aXJlKCcuL2dlby5qcycpO1xuXG52YXIgU3R5bGUgPSB7fTtcblxuLy8gU3R5bGUgaGVscGVyc1xuXG5TdHlsZS5jb2xvciA9IHtcbiAgICBwc2V1ZG9SYW5kb21HcmF5c2NhbGU6IGZ1bmN0aW9uIChmKSB7IHZhciBjID0gTWF0aC5tYXgoKHBhcnNlSW50KGYuaWQsIDE2KSAlIDEwMCkgLyAxMDAsIDAuNCk7IHJldHVybiBbMC43ICogYywgMC43ICogYywgMC43ICogY107IH0sIC8vIHBzZXVkby1yYW5kb20gZ3JheXNjYWxlIGJ5IGdlb21ldHJ5IGlkXG4gICAgcHNldWRvUmFuZG9tQ29sb3I6IGZ1bmN0aW9uIChmKSB7IHJldHVybiBbMC43ICogKHBhcnNlSW50KGYuaWQsIDE2KSAvIDEwMCAlIDEpLCAwLjcgKiAocGFyc2VJbnQoZi5pZCwgMTYpIC8gMTAwMDAgJSAxKSwgMC43ICogKHBhcnNlSW50KGYuaWQsIDE2KSAvIDEwMDAwMDAgJSAxKV07IH0sIC8vIHBzZXVkby1yYW5kb20gY29sb3IgYnkgZ2VvbWV0cnkgaWRcbiAgICByYW5kb21Db2xvcjogZnVuY3Rpb24gKGYpIHsgcmV0dXJuIFswLjcgKiBNYXRoLnJhbmRvbSgpLCAwLjcgKiBNYXRoLnJhbmRvbSgpLCAwLjcgKiBNYXRoLnJhbmRvbSgpXTsgfSAvLyByYW5kb20gY29sb3Jcbn07XG5cbi8vIFJldHVybnMgYSBmdW5jdGlvbiAodGhhdCBjYW4gYmUgdXNlZCBhcyBhIGR5bmFtaWMgc3R5bGUpIHRoYXQgY29udmVydHMgcGl4ZWxzIHRvIG1ldGVycyBmb3IgdGhlIGN1cnJlbnQgem9vbSBsZXZlbC5cbi8vIFRoZSBwcm92aWRlZCBwaXhlbCB2YWx1ZSAoJ3AnKSBjYW4gaXRzZWxmIGJlIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2UgaXQgaXMgd3JhcHBlZCBieSB0aGlzIG9uZS5cblN0eWxlLnBpeGVscyA9IGZ1bmN0aW9uIChwLCB6KSB7XG4gICAgdmFyIGY7XG4gICAgZXZhbCgnZiA9IGZ1bmN0aW9uKGYsIHQsIGgpIHsgcmV0dXJuICcgKyAodHlwZW9mIHAgPT0gJ2Z1bmN0aW9uJyA/ICcoJyArIChwLnRvU3RyaW5nKCkgKyAnKGYsIHQsIGgpKScpIDogcCkgKyAnICogaC5HZW8ubWV0ZXJzX3Blcl9waXhlbFtoLnpvb21dOyB9Jyk7XG4gICAgcmV0dXJuIGY7XG59O1xuXG4vLyBDcmVhdGUgYSB1bmlxdWUgMzItYml0IGNvbG9yIHRvIGlkZW50aWZ5IGEgZmVhdHVyZVxuLy8gV29ya2VycyBpbmRlcGVuZGVudGx5IGNyZWF0ZS9tb2RpZnkgc2VsZWN0aW9uIGNvbG9ycyBpbiB0aGVpciBvd24gdGhyZWFkcywgYnV0IHdlIGFsc29cbi8vIG5lZWQgdGhlIG1haW4gdGhyZWFkIHRvIGtub3cgd2hlcmUgZWFjaCBmZWF0dXJlIGNvbG9yIG9yaWdpbmF0ZWQuIFRvIGFjY29tcGxpc2ggdGhpcyxcbi8vIHdlIHBhcnRpdGlvbiB0aGUgbWFwIGJ5IHNldHRpbmcgdGhlIDR0aCBjb21wb25lbnQgKGFscGhhIGNoYW5uZWwpIHRvIHRoZSB3b3JrZXIncyBpZC5cblN0eWxlLnNlbGVjdGlvbl9tYXAgPSB7fTsgLy8gdGhpcyB3aWxsIGJlIHVuaXF1ZSBwZXIgbW9kdWxlIGluc3RhbmNlIChzbyB1bmlxdWUgcGVyIHdvcmtlcilcblN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCA9IDE7IC8vIHN0YXJ0IGF0IDEgc2luY2UgMSB3aWxsIGJlIGRpdmlkZWQgYnkgdGhpc1xuU3R5bGUuc2VsZWN0aW9uX21hcF9wcmVmaXggPSAwOyAvLyBzZXQgYnkgd29ya2VyIHRvIHdvcmtlciBpZCAjXG5TdHlsZS5nZW5lcmF0ZVNlbGVjdGlvbiA9IGZ1bmN0aW9uIChjb2xvcl9tYXApXG57XG4gICAgLy8gMzItYml0IGNvbG9yIGtleVxuICAgIFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCsrO1xuICAgIHZhciBpciA9IFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCAmIDI1NTtcbiAgICB2YXIgaWcgPSAoU3R5bGUuc2VsZWN0aW9uX21hcF9jdXJyZW50ID4+IDgpICYgMjU1O1xuICAgIHZhciBpYiA9IChTdHlsZS5zZWxlY3Rpb25fbWFwX2N1cnJlbnQgPj4gMTYpICYgMjU1O1xuICAgIHZhciBpYSA9IFN0eWxlLnNlbGVjdGlvbl9tYXBfcHJlZml4O1xuICAgIHZhciByID0gaXIgLyAyNTU7XG4gICAgdmFyIGcgPSBpZyAvIDI1NTtcbiAgICB2YXIgYiA9IGliIC8gMjU1O1xuICAgIHZhciBhID0gaWEgLyAyNTU7XG4gICAgdmFyIGtleSA9IChpciArIChpZyA8PCA4KSArIChpYiA8PCAxNikgKyAoaWEgPDwgMjQpKSA+Pj4gMDsgLy8gbmVlZCB1bnNpZ25lZCByaWdodCBzaGlmdCB0byBjb252ZXJ0IHRvIHBvc2l0aXZlICNcblxuICAgIGNvbG9yX21hcFtrZXldID0ge1xuICAgICAgICBjb2xvcjogW3IsIGcsIGIsIGFdLFxuICAgIH07XG5cbiAgICByZXR1cm4gY29sb3JfbWFwW2tleV07XG59O1xuXG5TdHlsZS5yZXNldFNlbGVjdGlvbk1hcCA9IGZ1bmN0aW9uICgpXG57XG4gICAgU3R5bGUuc2VsZWN0aW9uX21hcCA9IHt9O1xuICAgIFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCA9IDE7XG59O1xuXG4vLyBGaW5kIGFuZCBleHBhbmQgc3R5bGUgbWFjcm9zXG5TdHlsZS5tYWNyb3MgPSBbXG4gICAgJ1N0eWxlLmNvbG9yLnBzZXVkb1JhbmRvbUNvbG9yJyxcbiAgICAnU3R5bGUucGl4ZWxzJ1xuXTtcblxuU3R5bGUuZXhwYW5kTWFjcm9zID0gZnVuY3Rpb24gZXhwYW5kTWFjcm9zIChvYmopIHtcbiAgICBmb3IgKHZhciBwIGluIG9iaikge1xuICAgICAgICB2YXIgdmFsID0gb2JqW3BdO1xuXG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCBvYmplY3QgcHJvcGVydGllc1xuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgb2JqW3BdID0gZXhwYW5kTWFjcm9zKHZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ29udmVydCBzdHJpbmdzIGJhY2sgaW50byBmdW5jdGlvbnNcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbCA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZm9yICh2YXIgbSBpbiBTdHlsZS5tYWNyb3MpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsLm1hdGNoKFN0eWxlLm1hY3Jvc1ttXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGY7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmFsKCdmID0gJyArIHZhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpbcF0gPSBmO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbGwtYmFjayB0byBvcmlnaW5hbCB2YWx1ZSBpZiBwYXJzaW5nIGZhaWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqW3BdID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cblxuLy8gU3R5bGUgZGVmYXVsdHNcblxuLy8gRGV0ZXJtaW5lIGZpbmFsIHN0eWxlIHByb3BlcnRpZXMgKGNvbG9yLCB3aWR0aCwgZXRjLilcblN0eWxlLmRlZmF1bHRzID0ge1xuICAgIGNvbG9yOiBbMS4wLCAwLCAwXSxcbiAgICB3aWR0aDogMSxcbiAgICBzaXplOiAxLFxuICAgIGV4dHJ1ZGU6IGZhbHNlLFxuICAgIGhlaWdodDogMjAsXG4gICAgbWluX2hlaWdodDogMCxcbiAgICBvdXRsaW5lOiB7XG4gICAgICAgIC8vIGNvbG9yOiBbMS4wLCAwLCAwXSxcbiAgICAgICAgLy8gd2lkdGg6IDEsXG4gICAgICAgIC8vIGRhc2g6IG51bGxcbiAgICB9LFxuICAgIHNlbGVjdGlvbjoge1xuICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICBjb2xvcjogWzAsIDAsIDAsIDFdXG4gICAgfSxcbiAgICBtb2RlOiB7XG4gICAgICAgIG5hbWU6ICdwb2x5Z29ucydcbiAgICB9XG59O1xuXG4vLyBTdHlsZSBwYXJzaW5nXG5cbi8vIEhlbHBlciBmdW5jdGlvbnMgcGFzc2VkIHRvIGR5bmFtaWMgc3R5bGUgZnVuY3Rpb25zXG5TdHlsZS5oZWxwZXJzID0ge1xuICAgIFN0eWxlOiBTdHlsZSxcbiAgICBHZW86IEdlb1xufTtcblxuU3R5bGUucGFyc2VTdHlsZUZvckZlYXR1cmUgPSBmdW5jdGlvbiAoZmVhdHVyZSwgbGF5ZXJfbmFtZSwgbGF5ZXJfc3R5bGUsIHRpbGUpXG57XG4gICAgdmFyIGxheWVyX3N0eWxlID0gbGF5ZXJfc3R5bGUgfHwge307XG4gICAgdmFyIHN0eWxlID0ge307XG5cbiAgICBTdHlsZS5oZWxwZXJzLnpvb20gPSB0aWxlLmNvb3Jkcy56O1xuXG4gICAgLy8gVGVzdCB3aGV0aGVyIGZlYXR1cmVzIHNob3VsZCBiZSByZW5kZXJlZCBhdCBhbGxcbiAgICBpZiAodHlwZW9mIGxheWVyX3N0eWxlLmZpbHRlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChsYXllcl9zdHlsZS5maWx0ZXIoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycykgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUGFyc2Ugc3R5bGVzXG4gICAgc3R5bGUuY29sb3IgPSAobGF5ZXJfc3R5bGUuY29sb3IgJiYgKGxheWVyX3N0eWxlLmNvbG9yW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5jb2xvci5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMuY29sb3I7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5jb2xvciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLmNvbG9yID0gc3R5bGUuY29sb3IoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgc3R5bGUud2lkdGggPSAobGF5ZXJfc3R5bGUud2lkdGggJiYgKGxheWVyX3N0eWxlLndpZHRoW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS53aWR0aC5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMud2lkdGg7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS53aWR0aCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLndpZHRoID0gc3R5bGUud2lkdGgoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuICAgIHN0eWxlLndpZHRoICo9IEdlby51bml0c19wZXJfbWV0ZXJbdGlsZS5jb29yZHMuel07XG5cbiAgICBzdHlsZS5zaXplID0gKGxheWVyX3N0eWxlLnNpemUgJiYgKGxheWVyX3N0eWxlLnNpemVbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLnNpemUuZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLnNpemU7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5zaXplID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUuc2l6ZSA9IHN0eWxlLnNpemUoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuICAgIHN0eWxlLnNpemUgKj0gR2VvLnVuaXRzX3Blcl9tZXRlclt0aWxlLmNvb3Jkcy56XTtcblxuICAgIHN0eWxlLmV4dHJ1ZGUgPSAobGF5ZXJfc3R5bGUuZXh0cnVkZSAmJiAobGF5ZXJfc3R5bGUuZXh0cnVkZVtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUuZXh0cnVkZS5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMuZXh0cnVkZTtcbiAgICBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyByZXR1cm5pbmcgYSBib29sZWFuIHdpbGwgZXh0cnVkZSB3aXRoIHRoZSBmZWF0dXJlJ3MgaGVpZ2h0LCBhIG51bWJlciB3aWxsIG92ZXJyaWRlIHRoZSBmZWF0dXJlIGhlaWdodCAoc2VlIGJlbG93KVxuICAgICAgICBzdHlsZS5leHRydWRlID0gc3R5bGUuZXh0cnVkZShmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICBzdHlsZS5oZWlnaHQgPSAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5oZWlnaHQpIHx8IFN0eWxlLmRlZmF1bHRzLmhlaWdodDtcbiAgICBzdHlsZS5taW5faGVpZ2h0ID0gKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMubWluX2hlaWdodCkgfHwgU3R5bGUuZGVmYXVsdHMubWluX2hlaWdodDtcblxuICAgIC8vIGhlaWdodCBkZWZhdWx0cyB0byBmZWF0dXJlIGhlaWdodCwgYnV0IGV4dHJ1ZGUgc3R5bGUgY2FuIGR5bmFtaWNhbGx5IGFkanVzdCBoZWlnaHQgYnkgcmV0dXJuaW5nIGEgbnVtYmVyIG9yIGFycmF5IChpbnN0ZWFkIG9mIGEgYm9vbGVhbilcbiAgICBpZiAoc3R5bGUuZXh0cnVkZSkge1xuICAgICAgICBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHN0eWxlLmhlaWdodCA9IHN0eWxlLmV4dHJ1ZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ29iamVjdCcgJiYgc3R5bGUuZXh0cnVkZS5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgc3R5bGUubWluX2hlaWdodCA9IHN0eWxlLmV4dHJ1ZGVbMF07XG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQgPSBzdHlsZS5leHRydWRlWzFdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3R5bGUueiA9IChsYXllcl9zdHlsZS56ICYmIChsYXllcl9zdHlsZS56W2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS56LmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy56IHx8IDA7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS56ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUueiA9IHN0eWxlLnooZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgc3R5bGUub3V0bGluZSA9IHt9O1xuICAgIGxheWVyX3N0eWxlLm91dGxpbmUgPSBsYXllcl9zdHlsZS5vdXRsaW5lIHx8IHt9O1xuICAgIHN0eWxlLm91dGxpbmUuY29sb3IgPSAobGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvciAmJiAobGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvcltmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvci5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMub3V0bGluZS5jb2xvcjtcbiAgICBpZiAodHlwZW9mIHN0eWxlLm91dGxpbmUuY29sb3IgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5vdXRsaW5lLmNvbG9yID0gc3R5bGUub3V0bGluZS5jb2xvcihmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICBzdHlsZS5vdXRsaW5lLndpZHRoID0gKGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGggJiYgKGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGhbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGguZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLm91dGxpbmUud2lkdGg7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5vdXRsaW5lLndpZHRoID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUub3V0bGluZS53aWR0aCA9IHN0eWxlLm91dGxpbmUud2lkdGgoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuICAgIHN0eWxlLm91dGxpbmUud2lkdGggKj0gR2VvLnVuaXRzX3Blcl9tZXRlclt0aWxlLmNvb3Jkcy56XTtcblxuICAgIHN0eWxlLm91dGxpbmUuZGFzaCA9IChsYXllcl9zdHlsZS5vdXRsaW5lLmRhc2ggJiYgKGxheWVyX3N0eWxlLm91dGxpbmUuZGFzaFtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUub3V0bGluZS5kYXNoLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy5vdXRsaW5lLmRhc2g7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5vdXRsaW5lLmRhc2ggPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5vdXRsaW5lLmRhc2ggPSBzdHlsZS5vdXRsaW5lLmRhc2goZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgLy8gSW50ZXJhY3Rpdml0eSAoc2VsZWN0aW9uIG1hcClcbiAgICB2YXIgaW50ZXJhY3RpdmUgPSBmYWxzZTtcbiAgICBpZiAodHlwZW9mIGxheWVyX3N0eWxlLmludGVyYWN0aXZlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaW50ZXJhY3RpdmUgPSBsYXllcl9zdHlsZS5pbnRlcmFjdGl2ZShmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGludGVyYWN0aXZlID0gbGF5ZXJfc3R5bGUuaW50ZXJhY3RpdmU7XG4gICAgfVxuXG4gICAgaWYgKGludGVyYWN0aXZlID09IHRydWUpIHtcbiAgICAgICAgdmFyIHNlbGVjdG9yID0gU3R5bGUuZ2VuZXJhdGVTZWxlY3Rpb24oU3R5bGUuc2VsZWN0aW9uX21hcCk7XG5cbiAgICAgICAgc2VsZWN0b3IuZmVhdHVyZSA9IHtcbiAgICAgICAgICAgIGlkOiBmZWF0dXJlLmlkLFxuICAgICAgICAgICAgcHJvcGVydGllczogZmVhdHVyZS5wcm9wZXJ0aWVzXG4gICAgICAgIH07XG4gICAgICAgIHNlbGVjdG9yLmZlYXR1cmUucHJvcGVydGllcy5sYXllciA9IGxheWVyX25hbWU7IC8vIGFkZCBsYXllciBuYW1lIHRvIHByb3BlcnRpZXNcblxuICAgICAgICBzdHlsZS5zZWxlY3Rpb24gPSB7XG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICBjb2xvcjogc2VsZWN0b3IuY29sb3JcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHN0eWxlLnNlbGVjdGlvbiA9IFN0eWxlLmRlZmF1bHRzLnNlbGVjdGlvbjtcbiAgICB9XG5cbiAgICBpZiAobGF5ZXJfc3R5bGUubW9kZSAhPSBudWxsICYmIGxheWVyX3N0eWxlLm1vZGUubmFtZSAhPSBudWxsKSB7XG4gICAgICAgIHN0eWxlLm1vZGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgbSBpbiBsYXllcl9zdHlsZS5tb2RlKSB7XG4gICAgICAgICAgICBzdHlsZS5tb2RlW21dID0gbGF5ZXJfc3R5bGUubW9kZVttXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3R5bGUubW9kZSA9IFN0eWxlLmRlZmF1bHRzLm1vZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTdHlsZTtcbn1cbiIsIi8vIE1pc2NlbGxhbmVvdXMgdXRpbGl0aWVzXG5cbi8vIFNpbXBsaXN0aWMgZGV0ZWN0aW9uIG9mIHJlbGF0aXZlIHBhdGhzLCBhcHBlbmQgYmFzZSBpZiBuZWNlc3NhcnlcbmZ1bmN0aW9uIHVybEZvclBhdGggKHBhdGgpIHtcbiAgICBpZiAocGF0aCA9PSBudWxsIHx8IHBhdGggPT0gJycpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gQ2FuIGV4cGFuZCBhIHNpbmdsZSBwYXRoLCBvciBhbiBhcnJheSBvZiBwYXRoc1xuICAgIGlmICh0eXBlb2YgcGF0aCA9PSAnb2JqZWN0JyAmJiBwYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gQXJyYXkgb2YgcGF0aHNcbiAgICAgICAgZm9yICh2YXIgcCBpbiBwYXRoKSB7XG4gICAgICAgICAgICB2YXIgcHJvdG9jb2wgPSBwYXRoW3BdLnRvTG93ZXJDYXNlKCkuc3Vic3RyKDAsIDQpO1xuICAgICAgICAgICAgaWYgKCEocHJvdG9jb2wgPT0gJ2h0dHAnIHx8IHByb3RvY29sID09ICdmaWxlJykpIHtcbiAgICAgICAgICAgICAgICBwYXRoW3BdID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHBhdGhbcF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIFNpbmdsZSBwYXRoXG4gICAgICAgIHZhciBwcm90b2NvbCA9IHBhdGgudG9Mb3dlckNhc2UoKS5zdWJzdHIoMCwgNCk7XG4gICAgICAgIGlmICghKHByb3RvY29sID09ICdodHRwJyB8fCBwcm90b2NvbCA9PSAnZmlsZScpKSB7XG4gICAgICAgICAgICBwYXRoID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHBhdGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhdGg7XG59O1xuXG4vLyBTdHJpbmdpZnkgYW4gb2JqZWN0IGludG8gSlNPTiwgYnV0IGNvbnZlcnQgZnVuY3Rpb25zIHRvIHN0cmluZ3NcbmZ1bmN0aW9uIHNlcmlhbGl6ZVdpdGhGdW5jdGlvbnMgKG9iailcbntcbiAgICB2YXIgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KG9iaiwgZnVuY3Rpb24oaywgdikge1xuICAgICAgICAvLyBDb252ZXJ0IGZ1bmN0aW9ucyB0byBzdHJpbmdzXG4gICAgICAgIGlmICh0eXBlb2YgdiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gdi50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNlcmlhbGl6ZWQ7XG59O1xuXG4vLyBQYXJzZSBhIEpTT04gc3RyaW5nLCBidXQgY29udmVydCBmdW5jdGlvbi1saWtlIHN0cmluZ3MgYmFjayBpbnRvIGZ1bmN0aW9uc1xuZnVuY3Rpb24gZGVzZXJpYWxpemVXaXRoRnVuY3Rpb25zIChzZXJpYWxpemVkKSB7XG4gICAgdmFyIG9iaiA9IEpTT04ucGFyc2Uoc2VyaWFsaXplZCk7XG4gICAgb2JqID0gc3RyaW5nc1RvRnVuY3Rpb25zKG9iaik7XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLy8gUmVjdXJzaXZlbHkgcGFyc2UgYW4gb2JqZWN0LCBhdHRlbXB0aW5nIHRvIGNvbnZlcnQgc3RyaW5nIHByb3BlcnRpZXMgdGhhdCBsb29rIGxpa2UgZnVuY3Rpb25zIGJhY2sgaW50byBmdW5jdGlvbnNcbmZ1bmN0aW9uIHN0cmluZ3NUb0Z1bmN0aW9ucyAob2JqKSB7XG4gICAgZm9yICh2YXIgcCBpbiBvYmopIHtcbiAgICAgICAgdmFyIHZhbCA9IG9ialtwXTtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggb2JqZWN0IHByb3BlcnRpZXNcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIG9ialtwXSA9IHN0cmluZ3NUb0Z1bmN0aW9ucyh2YWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIENvbnZlcnQgc3RyaW5ncyBiYWNrIGludG8gZnVuY3Rpb25zXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWwgPT0gJ3N0cmluZycgJiYgdmFsLm1hdGNoKC9eZnVuY3Rpb24uKlxcKC4qXFwpLykgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGY7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGV2YWwoJ2YgPSAnICsgdmFsKTtcbiAgICAgICAgICAgICAgICBvYmpbcF0gPSBmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBmYWxsLWJhY2sgdG8gb3JpZ2luYWwgdmFsdWUgaWYgcGFyc2luZyBmYWlsZWRcbiAgICAgICAgICAgICAgICBvYmpbcF0gPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLy8gUnVuIGEgYmxvY2sgaWYgb24gdGhlIG1haW4gdGhyZWFkIChub3QgaW4gYSB3ZWIgd29ya2VyKSwgd2l0aCBvcHRpb25hbCBlcnJvciAod2ViIHdvcmtlcikgYmxvY2tcbmZ1bmN0aW9uIHJ1bklmSW5NYWluVGhyZWFkIChibG9jaywgZXJyKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHdpbmRvdy5kb2N1bWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBibG9jaygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZXJyID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGVycigpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBVc2VkIGZvciBkaWZmZXJlbnRpYXRpbmcgYmV0d2VlbiBwb3dlci1vZi0yIGFuZCBub24tcG93ZXItb2YtMiB0ZXh0dXJlc1xuLy8gVmlhOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE5NzIyMjQ3L3dlYmdsLXdhaXQtZm9yLXRleHR1cmUtdG8tbG9hZFxuZnVuY3Rpb24gaXNQb3dlck9mMiAodmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlICYgKHZhbHVlIC0gMSkpID09IDA7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgdXJsRm9yUGF0aDogdXJsRm9yUGF0aCxcbiAgICAgICAgc2VyaWFsaXplV2l0aEZ1bmN0aW9uczogc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyxcbiAgICAgICAgZGVzZXJpYWxpemVXaXRoRnVuY3Rpb25zOiBkZXNlcmlhbGl6ZVdpdGhGdW5jdGlvbnMsXG4gICAgICAgIHN0cmluZ3NUb0Z1bmN0aW9uczogc3RyaW5nc1RvRnVuY3Rpb25zLFxuICAgICAgICBydW5JZkluTWFpblRocmVhZDogcnVuSWZJbk1haW5UaHJlYWQsXG4gICAgICAgIGlzUG93ZXJPZjI6IGlzUG93ZXJPZjJcbiAgICB9O1xufVxuIiwiLyoqKiBWZWN0b3IgZnVuY3Rpb25zIC0gdmVjdG9ycyBwcm92aWRlZCBhcyBbeCwgeSwgel0gYXJyYXlzICoqKi9cblxudmFyIFZlY3RvciA9IHt9O1xuXG4vLyBWZWN0b3IgbGVuZ3RoIHNxdWFyZWRcblZlY3Rvci5sZW5ndGhTcSA9IGZ1bmN0aW9uICh2KVxue1xuICAgIGlmICh2Lmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIHJldHVybiAodlswXSp2WzBdICsgdlsxXSp2WzFdKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiAodlswXSp2WzBdICsgdlsxXSp2WzFdICsgdlsyXSp2WzJdKTtcbiAgICB9XG59O1xuXG4vLyBWZWN0b3IgbGVuZ3RoXG5WZWN0b3IubGVuZ3RoID0gZnVuY3Rpb24gKHYpXG57XG4gICAgcmV0dXJuIE1hdGguc3FydChWZWN0b3IubGVuZ3RoU3EodikpO1xufTtcblxuLy8gTm9ybWFsaXplIGEgdmVjdG9yXG5WZWN0b3Iubm9ybWFsaXplID0gZnVuY3Rpb24gKHYpXG57XG4gICAgdmFyIGQ7XG4gICAgaWYgKHYubGVuZ3RoID09IDIpIHtcbiAgICAgICAgZCA9IHZbMF0qdlswXSArIHZbMV0qdlsxXTtcbiAgICAgICAgZCA9IE1hdGguc3FydChkKTtcblxuICAgICAgICBpZiAoZCAhPSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW3ZbMF0gLyBkLCB2WzFdIC8gZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFswLCAwXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBkID0gdlswXSp2WzBdICsgdlsxXSp2WzFdICsgdlsyXSp2WzJdO1xuICAgICAgICBkID0gTWF0aC5zcXJ0KGQpO1xuXG4gICAgICAgIGlmIChkICE9IDApIHtcbiAgICAgICAgICAgIHJldHVybiBbdlswXSAvIGQsIHZbMV0gLyBkLCB2WzJdIC8gZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFswLCAwLCAwXTtcbiAgICB9XG59O1xuXG4vLyBDcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWN0b3JzXG5WZWN0b3IuY3Jvc3MgID0gZnVuY3Rpb24gKHYxLCB2MilcbntcbiAgICByZXR1cm4gW1xuICAgICAgICAodjFbMV0gKiB2MlsyXSkgLSAodjFbMl0gKiB2MlsxXSksXG4gICAgICAgICh2MVsyXSAqIHYyWzBdKSAtICh2MVswXSAqIHYyWzJdKSxcbiAgICAgICAgKHYxWzBdICogdjJbMV0pIC0gKHYxWzFdICogdjJbMF0pXG4gICAgXTtcbn07XG5cbi8vIEZpbmQgdGhlIGludGVyc2VjdGlvbiBvZiB0d28gbGluZXMgc3BlY2lmaWVkIGFzIHNlZ21lbnRzIGZyb20gcG9pbnRzIChwMSwgcDIpIGFuZCAocDMsIHA0KVxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaW5lLWxpbmVfaW50ZXJzZWN0aW9uXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NyYW1lcidzX3J1bGVcblZlY3Rvci5saW5lSW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKHAxLCBwMiwgcDMsIHA0LCBwYXJhbGxlbF90b2xlcmFuY2UpXG57XG4gICAgdmFyIHBhcmFsbGVsX3RvbGVyYW5jZSA9IHBhcmFsbGVsX3RvbGVyYW5jZSB8fCAwLjAxO1xuXG4gICAgLy8gYTEqeCArIGIxKnkgPSBjMSBmb3IgbGluZSAoeDEsIHkxKSB0byAoeDIsIHkyKVxuICAgIC8vIGEyKnggKyBiMip5ID0gYzIgZm9yIGxpbmUgKHgzLCB5MykgdG8gKHg0LCB5NClcbiAgICB2YXIgYTEgPSBwMVsxXSAtIHAyWzFdOyAvLyB5MSAtIHkyXG4gICAgdmFyIGIxID0gcDFbMF0gLSBwMlswXTsgLy8geDEgLSB4MlxuICAgIHZhciBhMiA9IHAzWzFdIC0gcDRbMV07IC8vIHkzIC0geTRcbiAgICB2YXIgYjIgPSBwM1swXSAtIHA0WzBdOyAvLyB4MyAtIHg0XG4gICAgdmFyIGMxID0gKHAxWzBdICogcDJbMV0pIC0gKHAxWzFdICogcDJbMF0pOyAvLyB4MSp5MiAtIHkxKngyXG4gICAgdmFyIGMyID0gKHAzWzBdICogcDRbMV0pIC0gKHAzWzFdICogcDRbMF0pOyAvLyB4Myp5NCAtIHkzKng0XG4gICAgdmFyIGRlbm9tID0gKGIxICogYTIpIC0gKGExICogYjIpO1xuXG4gICAgaWYgKE1hdGguYWJzKGRlbm9tKSA+IHBhcmFsbGVsX3RvbGVyYW5jZSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgKChjMSAqIGIyKSAtIChiMSAqIGMyKSkgLyBkZW5vbSxcbiAgICAgICAgICAgICgoYzEgKiBhMikgLSAoYTEgKiBjMikpIC8gZGVub21cbiAgICAgICAgXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7IC8vIHJldHVybiBudWxsIGlmIGxpbmVzIGFyZSAoY2xvc2UgdG8pIHBhcmFsbGVsXG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFZlY3Rvcjtcbn1cbiJdfQ==
(12)
});
