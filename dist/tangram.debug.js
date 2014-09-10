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
var GLTexture = _dereq_('./gl_texture.js');
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

// TODO: don't re-create GLProgram instance every time, just update existing one
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

},{"./gl.js":4,"./gl_builders.js":5,"./gl_geom.js":6,"./gl_program.js":8,"./gl_shaders.js":9,"./gl_texture.js":10,"./gl_vertex_layout.js":11,"queue-async":2}],8:[function(_dereq_,module,exports){
// Thin GL program wrapp to cache uniform locations/values, do compile-time pre-processing
// (injecting #defines and #pragma transforms into shaders), etc.

var GL = _dereq_('./gl.js');
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

},{"../utils.js":17,"./gl.js":4,"queue-async":2}],9:[function(_dereq_,module,exports){
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
    var scene = this;

    // Load scene definition (layers, styles, etc.), then create modes & workers
    this.loadScene(function() {
        var queue = Queue();

        // Create rendering modes
        queue.defer(function(complete) {
            this.modes = Scene.createModes(this.styles);
            this.updateActiveModes();
            complete();
        }.bind(scene));

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
        }.bind(scene));
    }.bind(scene));
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

// Web workers handle heavey duty tile construction: networking, geometry processing, etc.
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
                }.bind(scene)
            );
        }.bind(scene));
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
                }.bind(scene)
            );
        }.bind(scene));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvZGlzdC9nbC1tYXRyaXguanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvbm9kZV9tb2R1bGVzL3F1ZXVlLWFzeW5jL3F1ZXVlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nZW8uanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nbC9nbF9idWlsZGVycy5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfZ2VvbS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfbW9kZXMuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3Byb2dyYW0uanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3NoYWRlcnMuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3RleHR1cmUuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3ZlcnRleF9sYXlvdXQuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2xlYWZsZXRfbGF5ZXIuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL21vZHVsZS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvcG9pbnQuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL3NjZW5lLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9zdHlsZS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvdXRpbHMuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL3ZlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2g3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgZ2wtbWF0cml4IC0gSGlnaCBwZXJmb3JtYW5jZSBtYXRyaXggYW5kIHZlY3RvciBvcGVyYXRpb25zXG4gKiBAYXV0aG9yIEJyYW5kb24gSm9uZXNcbiAqIEBhdXRob3IgQ29saW4gTWFjS2VuemllIElWXG4gKiBAdmVyc2lvbiAyLjIuMVxuICovXG5cbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb25cbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRVxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG5cbihmdW5jdGlvbihfZ2xvYmFsKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBzaGltID0ge307XG4gIGlmICh0eXBlb2YoZXhwb3J0cykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcbiAgICAgIHNoaW0uZXhwb3J0cyA9IHt9O1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2hpbS5leHBvcnRzO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGdsLW1hdHJpeCBsaXZlcyBpbiBhIGJyb3dzZXIsIGRlZmluZSBpdHMgbmFtZXNwYWNlcyBpbiBnbG9iYWxcbiAgICAgIHNoaW0uZXhwb3J0cyA9IHR5cGVvZih3aW5kb3cpICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IF9nbG9iYWw7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIC8vIGdsLW1hdHJpeCBsaXZlcyBpbiBjb21tb25qcywgZGVmaW5lIGl0cyBuYW1lc3BhY2VzIGluIGV4cG9ydHNcbiAgICBzaGltLmV4cG9ydHMgPSBleHBvcnRzO1xuICB9XG5cbiAgKGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiAgICAvKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG5cbmlmKCFHTE1BVF9FUFNJTE9OKSB7XG4gICAgdmFyIEdMTUFUX0VQU0lMT04gPSAwLjAwMDAwMTtcbn1cblxuaWYoIUdMTUFUX0FSUkFZX1RZUEUpIHtcbiAgICB2YXIgR0xNQVRfQVJSQVlfVFlQRSA9ICh0eXBlb2YgRmxvYXQzMkFycmF5ICE9PSAndW5kZWZpbmVkJykgPyBGbG9hdDMyQXJyYXkgOiBBcnJheTtcbn1cblxuaWYoIUdMTUFUX1JBTkRPTSkge1xuICAgIHZhciBHTE1BVF9SQU5ET00gPSBNYXRoLnJhbmRvbTtcbn1cblxuLyoqXG4gKiBAY2xhc3MgQ29tbW9uIHV0aWxpdGllc1xuICogQG5hbWUgZ2xNYXRyaXhcbiAqL1xudmFyIGdsTWF0cml4ID0ge307XG5cbi8qKlxuICogU2V0cyB0aGUgdHlwZSBvZiBhcnJheSB1c2VkIHdoZW4gY3JlYXRpbmcgbmV3IHZlY3RvcnMgYW5kIG1hdHJpY2llc1xuICpcbiAqIEBwYXJhbSB7VHlwZX0gdHlwZSBBcnJheSB0eXBlLCBzdWNoIGFzIEZsb2F0MzJBcnJheSBvciBBcnJheVxuICovXG5nbE1hdHJpeC5zZXRNYXRyaXhBcnJheVR5cGUgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgR0xNQVRfQVJSQVlfVFlQRSA9IHR5cGU7XG59XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLmdsTWF0cml4ID0gZ2xNYXRyaXg7XG59XG5cbnZhciBkZWdyZWUgPSBNYXRoLlBJIC8gMTgwO1xuXG4vKipcbiogQ29udmVydCBEZWdyZWUgVG8gUmFkaWFuXG4qXG4qIEBwYXJhbSB7TnVtYmVyfSBBbmdsZSBpbiBEZWdyZWVzXG4qL1xuZ2xNYXRyaXgudG9SYWRpYW4gPSBmdW5jdGlvbihhKXtcbiAgICAgcmV0dXJuIGEgKiBkZWdyZWU7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG5hbWUgdmVjMlxuICovXG5cbnZhciB2ZWMyID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjMlxuICpcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMik7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMik7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5mcm9tVmFsdWVzID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgyKTtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzIgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzIgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5zZXQgPSBmdW5jdGlvbihvdXQsIHgsIHkpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLmFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnN1YnRyYWN0ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuc3ViID0gdmVjMi5zdWJ0cmFjdDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubXVsdGlwbHkgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5tdWwgPSB2ZWMyLm11bHRpcGx5O1xuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5kaXZpZGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuZGl2ID0gdmVjMi5kaXZpZGU7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm1pbiA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5tYXggPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMyIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzIncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnNjYWxlQW5kQWRkID0gZnVuY3Rpb24ob3V0LCBhLCBiLCBzY2FsZSkge1xuICAgIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcbiAgICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbnZlYzIuZGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuZGlzdCA9IHZlYzIuZGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMyLnNxdWFyZWREaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV07XG4gICAgcmV0dXJuIHgqeCArIHkqeTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLnNxckRpc3QgPSB2ZWMyLnNxdWFyZWREaXN0YW5jZTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG52ZWMyLmxlbmd0aCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5sZW4gPSB2ZWMyLmxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG52ZWMyLnNxdWFyZWRMZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgcmV0dXJuIHgqeCArIHkqeTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5zcXJMZW4gPSB2ZWMyLnNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5uZWdhdGUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAtYVswXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubm9ybWFsaXplID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICB2YXIgbGVuID0geCp4ICsgeSp5O1xuICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICAgICAgb3V0WzBdID0gYVswXSAqIGxlbjtcbiAgICAgICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG52ZWMyLmRvdCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV07XG59O1xuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqIE5vdGUgdGhhdCB0aGUgY3Jvc3MgcHJvZHVjdCBtdXN0IGJ5IGRlZmluaXRpb24gcHJvZHVjZSBhIDNEIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMi5jcm9zcyA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIHZhciB6ID0gYVswXSAqIGJbMV0gLSBhWzFdICogYlswXTtcbiAgICBvdXRbMF0gPSBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IHo7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubGVycCA9IGZ1bmN0aW9uIChvdXQsIGEsIGIsIHQpIHtcbiAgICB2YXIgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV07XG4gICAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gICAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5yYW5kb20gPSBmdW5jdGlvbiAob3V0LCBzY2FsZSkge1xuICAgIHNjYWxlID0gc2NhbGUgfHwgMS4wO1xuICAgIHZhciByID0gR0xNQVRfUkFORE9NKCkgKiAyLjAgKiBNYXRoLlBJO1xuICAgIG91dFswXSA9IE1hdGguY29zKHIpICogc2NhbGU7XG4gICAgb3V0WzFdID0gTWF0aC5zaW4ocikgKiBzY2FsZTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQyfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnRyYW5zZm9ybU1hdDIgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHk7XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0MmR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIudHJhbnNmb3JtTWF0MmQgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHkgKyBtWzRdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVszXSAqIHkgKyBtWzVdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDNcbiAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQzfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnRyYW5zZm9ybU1hdDMgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVszXSAqIHkgKyBtWzZdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs0XSAqIHkgKyBtWzddO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDRcbiAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzAnXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi50cmFuc2Zvcm1NYXQ0ID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLCBcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bMTJdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzEzXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjMnMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMi4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzJzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLmZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZlYyA9IHZlYzIuY3JlYXRlKCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgICAgIHZhciBpLCBsO1xuICAgICAgICBpZighc3RyaWRlKSB7XG4gICAgICAgICAgICBzdHJpZGUgPSAyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIW9mZnNldCkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoY291bnQpIHtcbiAgICAgICAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsID0gYS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICAgICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07XG4gICAgICAgICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgICAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfTtcbn0pKCk7XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gdmVjIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKi9cbnZlYzIuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ3ZlYzIoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnZlYzIgPSB2ZWMyO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgMyBEaW1lbnNpb25hbCBWZWN0b3JcbiAqIEBuYW1lIHZlYzNcbiAqL1xuXG52YXIgdmVjMyA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzNcbiAqXG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXG4gKi9cbnZlYzMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDMpO1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xudmVjMy5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMyk7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xudmVjMy5mcm9tVmFsdWVzID0gZnVuY3Rpb24oeCwgeSwgeikge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgzKTtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLmNvcHkgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnNldCA9IGZ1bmN0aW9uKG91dCwgeCwgeSwgeikge1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5hZGQgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5zdWJ0cmFjdCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLnN1YiA9IHZlYzMuc3VidHJhY3Q7XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMubXVsID0gdmVjMy5tdWx0aXBseTtcblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuZGl2aWRlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLmRpdiA9IHZlYzMuZGl2aWRlO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5taW4gPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubWF4ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gICAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjMyBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMzJ3MgYWZ0ZXIgc2NhbGluZyB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5zY2FsZUFuZEFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XG4gICAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xuICAgIG91dFsyXSA9IGFbMl0gKyAoYlsyXSAqIHNjYWxlKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjMy5kaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeik7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLmRpc3QgPSB2ZWMzLmRpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjMy5zcXVhcmVkRGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdLFxuICAgICAgICB6ID0gYlsyXSAtIGFbMl07XG4gICAgcmV0dXJuIHgqeCArIHkqeSArIHoqejtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLnNxckRpc3QgPSB2ZWMzLnNxdWFyZWREaXN0YW5jZTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG52ZWMzLmxlbmd0aCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnopO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMubGVuID0gdmVjMy5sZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xudmVjMy5zcXVhcmVkTGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLnNxckxlbiA9IHZlYzMuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm5lZ2F0ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5ub3JtYWxpemUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICB2YXIgbGVuID0geCp4ICsgeSp5ICsgeip6O1xuICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICAgICAgb3V0WzBdID0gYVswXSAqIGxlbjtcbiAgICAgICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcbiAgICAgICAgb3V0WzJdID0gYVsyXSAqIGxlbjtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG52ZWMzLmRvdCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXTtcbn07XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5jcm9zcyA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLFxuICAgICAgICBieCA9IGJbMF0sIGJ5ID0gYlsxXSwgYnogPSBiWzJdO1xuXG4gICAgb3V0WzBdID0gYXkgKiBieiAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXogKiBieCAtIGF4ICogYno7XG4gICAgb3V0WzJdID0gYXggKiBieSAtIGF5ICogYng7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubGVycCA9IGZ1bmN0aW9uIChvdXQsIGEsIGIsIHQpIHtcbiAgICB2YXIgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXTtcbiAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnJhbmRvbSA9IGZ1bmN0aW9uIChvdXQsIHNjYWxlKSB7XG4gICAgc2NhbGUgPSBzY2FsZSB8fCAxLjA7XG5cbiAgICB2YXIgciA9IEdMTUFUX1JBTkRPTSgpICogMi4wICogTWF0aC5QSTtcbiAgICB2YXIgeiA9IChHTE1BVF9SQU5ET00oKSAqIDIuMCkgLSAxLjA7XG4gICAgdmFyIHpTY2FsZSA9IE1hdGguc3FydCgxLjAteip6KSAqIHNjYWxlO1xuXG4gICAgb3V0WzBdID0gTWF0aC5jb3MocikgKiB6U2NhbGU7XG4gICAgb3V0WzFdID0gTWF0aC5zaW4ocikgKiB6U2NhbGU7XG4gICAgb3V0WzJdID0geiAqIHNjYWxlO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDQuXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy50cmFuc2Zvcm1NYXQ0ID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM107XG4gICAgb3V0WzJdID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDMuXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIHRoZSAzeDMgbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMudHJhbnNmb3JtTWF0MyA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuICAgIG91dFswXSA9IHggKiBtWzBdICsgeSAqIG1bM10gKyB6ICogbVs2XTtcbiAgICBvdXRbMV0gPSB4ICogbVsxXSArIHkgKiBtWzRdICsgeiAqIG1bN107XG4gICAgb3V0WzJdID0geCAqIG1bMl0gKyB5ICogbVs1XSArIHogKiBtWzhdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnRyYW5zZm9ybVF1YXQgPSBmdW5jdGlvbihvdXQsIGEsIHEpIHtcbiAgICAvLyBiZW5jaG1hcmtzOiBodHRwOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXRyYW5zZm9ybS12ZWMzLWltcGxlbWVudGF0aW9uc1xuXG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl0sXG4gICAgICAgIHF4ID0gcVswXSwgcXkgPSBxWzFdLCBxeiA9IHFbMl0sIHF3ID0gcVszXSxcblxuICAgICAgICAvLyBjYWxjdWxhdGUgcXVhdCAqIHZlY1xuICAgICAgICBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeSxcbiAgICAgICAgaXkgPSBxdyAqIHkgKyBxeiAqIHggLSBxeCAqIHosXG4gICAgICAgIGl6ID0gcXcgKiB6ICsgcXggKiB5IC0gcXkgKiB4LFxuICAgICAgICBpdyA9IC1xeCAqIHggLSBxeSAqIHkgLSBxeiAqIHo7XG5cbiAgICAvLyBjYWxjdWxhdGUgcmVzdWx0ICogaW52ZXJzZSBxdWF0XG4gICAgb3V0WzBdID0gaXggKiBxdyArIGl3ICogLXF4ICsgaXkgKiAtcXogLSBpeiAqIC1xeTtcbiAgICBvdXRbMV0gPSBpeSAqIHF3ICsgaXcgKiAtcXkgKyBpeiAqIC1xeCAtIGl4ICogLXF6O1xuICAgIG91dFsyXSA9IGl6ICogcXcgKyBpdyAqIC1xeiArIGl4ICogLXF5IC0gaXkgKiAtcXg7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qXG4qIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHgtYXhpc1xuKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcbiogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxuKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cbiogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXG4qIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiovXG52ZWMzLnJvdGF0ZVggPSBmdW5jdGlvbihvdXQsIGEsIGIsIGMpe1xuICAgdmFyIHAgPSBbXSwgcj1bXTtcblx0ICAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG5cdCAgcFswXSA9IGFbMF0gLSBiWzBdO1xuXHQgIHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgXHRwWzJdID0gYVsyXSAtIGJbMl07XG5cblx0ICAvL3BlcmZvcm0gcm90YXRpb25cblx0ICByWzBdID0gcFswXTtcblx0ICByWzFdID0gcFsxXSpNYXRoLmNvcyhjKSAtIHBbMl0qTWF0aC5zaW4oYyk7XG5cdCAgclsyXSA9IHBbMV0qTWF0aC5zaW4oYykgKyBwWzJdKk1hdGguY29zKGMpO1xuXG5cdCAgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuXHQgIG91dFswXSA9IHJbMF0gKyBiWzBdO1xuXHQgIG91dFsxXSA9IHJbMV0gKyBiWzFdO1xuXHQgIG91dFsyXSA9IHJbMl0gKyBiWzJdO1xuXG4gIFx0cmV0dXJuIG91dDtcbn07XG5cbi8qXG4qIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHktYXhpc1xuKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcbiogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxuKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cbiogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXG4qIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiovXG52ZWMzLnJvdGF0ZVkgPSBmdW5jdGlvbihvdXQsIGEsIGIsIGMpe1xuICBcdHZhciBwID0gW10sIHI9W107XG4gIFx0Ly9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxuICBcdHBbMF0gPSBhWzBdIC0gYlswXTtcbiAgXHRwWzFdID0gYVsxXSAtIGJbMV07XG4gIFx0cFsyXSA9IGFbMl0gLSBiWzJdO1xuICBcbiAgXHQvL3BlcmZvcm0gcm90YXRpb25cbiAgXHRyWzBdID0gcFsyXSpNYXRoLnNpbihjKSArIHBbMF0qTWF0aC5jb3MoYyk7XG4gIFx0clsxXSA9IHBbMV07XG4gIFx0clsyXSA9IHBbMl0qTWF0aC5jb3MoYykgLSBwWzBdKk1hdGguc2luKGMpO1xuICBcbiAgXHQvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXG4gIFx0b3V0WzBdID0gclswXSArIGJbMF07XG4gIFx0b3V0WzFdID0gclsxXSArIGJbMV07XG4gIFx0b3V0WzJdID0gclsyXSArIGJbMl07XG4gIFxuICBcdHJldHVybiBvdXQ7XG59O1xuXG4vKlxuKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB6LWF4aXNcbiogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXG4qIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcbiogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXG4qIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxuKiBAcmV0dXJucyB7dmVjM30gb3V0XG4qL1xudmVjMy5yb3RhdGVaID0gZnVuY3Rpb24ob3V0LCBhLCBiLCBjKXtcbiAgXHR2YXIgcCA9IFtdLCByPVtdO1xuICBcdC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cbiAgXHRwWzBdID0gYVswXSAtIGJbMF07XG4gIFx0cFsxXSA9IGFbMV0gLSBiWzFdO1xuICBcdHBbMl0gPSBhWzJdIC0gYlsyXTtcbiAgXG4gIFx0Ly9wZXJmb3JtIHJvdGF0aW9uXG4gIFx0clswXSA9IHBbMF0qTWF0aC5jb3MoYykgLSBwWzFdKk1hdGguc2luKGMpO1xuICBcdHJbMV0gPSBwWzBdKk1hdGguc2luKGMpICsgcFsxXSpNYXRoLmNvcyhjKTtcbiAgXHRyWzJdID0gcFsyXTtcbiAgXG4gIFx0Ly90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuICBcdG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBcdG91dFsxXSA9IHJbMV0gKyBiWzFdO1xuICBcdG91dFsyXSA9IHJbMl0gKyBiWzJdO1xuICBcbiAgXHRyZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjM3MuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMy4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzNzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLmZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZlYyA9IHZlYzMuY3JlYXRlKCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgICAgIHZhciBpLCBsO1xuICAgICAgICBpZighc3RyaWRlKSB7XG4gICAgICAgICAgICBzdHJpZGUgPSAzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIW9mZnNldCkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoY291bnQpIHtcbiAgICAgICAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsID0gYS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICAgICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07IHZlY1syXSA9IGFbaSsyXTtcbiAgICAgICAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdOyBhW2krMl0gPSB2ZWNbMl07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IHZlYyB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG52ZWMzLnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICd2ZWMzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnZlYzMgPSB2ZWMzO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgNCBEaW1lbnNpb25hbCBWZWN0b3JcbiAqIEBuYW1lIHZlYzRcbiAqL1xuXG52YXIgdmVjNCA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzRcbiAqXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXG4gKi9cbnZlYzQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWM0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG52ZWM0LmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG52ZWM0LmZyb21WYWx1ZXMgPSBmdW5jdGlvbih4LCB5LCB6LCB3KSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIG91dFszXSA9IHc7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5zZXQgPSBmdW5jdGlvbihvdXQsIHgsIHksIHosIHcpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSB3O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5hZGQgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5zdWJ0cmFjdCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gLSBiWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LnN1YiA9IHZlYzQuc3VidHJhY3Q7XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0Lm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAqIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQubXVsID0gdmVjNC5tdWx0aXBseTtcblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuZGl2aWRlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAvIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LmRpdiA9IHZlYzQuZGl2aWRlO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5taW4gPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgICBvdXRbM10gPSBNYXRoLm1pbihhWzNdLCBiWzNdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubWF4ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gICAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XG4gICAgb3V0WzNdID0gTWF0aC5tYXgoYVszXSwgYlszXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjNCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICBvdXRbM10gPSBhWzNdICogYjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBZGRzIHR3byB2ZWM0J3MgYWZ0ZXIgc2NhbGluZyB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5zY2FsZUFuZEFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XG4gICAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xuICAgIG91dFsyXSA9IGFbMl0gKyAoYlsyXSAqIHNjYWxlKTtcbiAgICBvdXRbM10gPSBhWzNdICsgKGJbM10gKiBzY2FsZSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbnZlYzQuZGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdLFxuICAgICAgICB6ID0gYlsyXSAtIGFbMl0sXG4gICAgICAgIHcgPSBiWzNdIC0gYVszXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeiArIHcqdyk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LmRpc3QgPSB2ZWM0LmRpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjNC5zcXVhcmVkRGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdLFxuICAgICAgICB6ID0gYlsyXSAtIGFbMl0sXG4gICAgICAgIHcgPSBiWzNdIC0gYVszXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6ICsgdyp3O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3F1YXJlZERpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuc3FyRGlzdCA9IHZlYzQuc3F1YXJlZERpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbnZlYzQubGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXSxcbiAgICAgICAgdyA9IGFbM107XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnogKyB3KncpO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQubGVuID0gdmVjNC5sZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xudmVjNC5zcXVhcmVkTGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXSxcbiAgICAgICAgdyA9IGFbM107XG4gICAgcmV0dXJuIHgqeCArIHkqeSArIHoqeiArIHcqdztcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5zcXJMZW4gPSB2ZWM0LnNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5uZWdhdGUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAtYVswXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICBvdXRbMl0gPSAtYVsyXTtcbiAgICBvdXRbM10gPSAtYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubm9ybWFsaXplID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl0sXG4gICAgICAgIHcgPSBhWzNdO1xuICAgIHZhciBsZW4gPSB4KnggKyB5KnkgKyB6KnogKyB3Knc7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgICAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgICAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICAgICAgICBvdXRbMl0gPSBhWzJdICogbGVuO1xuICAgICAgICBvdXRbM10gPSBhWzNdICogbGVuO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbnZlYzQuZG90ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdICsgYVszXSAqIGJbM107XG59O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LmxlcnAgPSBmdW5jdGlvbiAob3V0LCBhLCBiLCB0KSB7XG4gICAgdmFyIGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdLFxuICAgICAgICBheiA9IGFbMl0sXG4gICAgICAgIGF3ID0gYVszXTtcbiAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgICBvdXRbM10gPSBhdyArIHQgKiAoYlszXSAtIGF3KTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnJhbmRvbSA9IGZ1bmN0aW9uIChvdXQsIHNjYWxlKSB7XG4gICAgc2NhbGUgPSBzY2FsZSB8fCAxLjA7XG5cbiAgICAvL1RPRE86IFRoaXMgaXMgYSBwcmV0dHkgYXdmdWwgd2F5IG9mIGRvaW5nIHRoaXMuIEZpbmQgc29tZXRoaW5nIGJldHRlci5cbiAgICBvdXRbMF0gPSBHTE1BVF9SQU5ET00oKTtcbiAgICBvdXRbMV0gPSBHTE1BVF9SQU5ET00oKTtcbiAgICBvdXRbMl0gPSBHTE1BVF9SQU5ET00oKTtcbiAgICBvdXRbM10gPSBHTE1BVF9SQU5ET00oKTtcbiAgICB2ZWM0Lm5vcm1hbGl6ZShvdXQsIG91dCk7XG4gICAgdmVjNC5zY2FsZShvdXQsIG91dCwgc2NhbGUpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIG1hdDQuXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnRyYW5zZm9ybU1hdDQgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSwgdyA9IGFbM107XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0gKiB3O1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdICogdztcbiAgICBvdXRbMl0gPSBtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0gKiB3O1xuICAgIG91dFszXSA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XSAqIHc7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQudHJhbnNmb3JtUXVhdCA9IGZ1bmN0aW9uKG91dCwgYSwgcSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdLFxuICAgICAgICBxeCA9IHFbMF0sIHF5ID0gcVsxXSwgcXogPSBxWzJdLCBxdyA9IHFbM10sXG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHF1YXQgKiB2ZWNcbiAgICAgICAgaXggPSBxdyAqIHggKyBxeSAqIHogLSBxeiAqIHksXG4gICAgICAgIGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6LFxuICAgICAgICBpeiA9IHF3ICogeiArIHF4ICogeSAtIHF5ICogeCxcbiAgICAgICAgaXcgPSAtcXggKiB4IC0gcXkgKiB5IC0gcXogKiB6O1xuXG4gICAgLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuICAgIG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXk7XG4gICAgb3V0WzFdID0gaXkgKiBxdyArIGl3ICogLXF5ICsgaXogKiAtcXggLSBpeCAqIC1xejtcbiAgICBvdXRbMl0gPSBpeiAqIHF3ICsgaXcgKiAtcXogKyBpeCAqIC1xeSAtIGl5ICogLXF4O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWM0cy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWM0LiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjMnMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgdmVjID0gdmVjNC5jcmVhdGUoKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICAgICAgdmFyIGksIGw7XG4gICAgICAgIGlmKCFzdHJpZGUpIHtcbiAgICAgICAgICAgIHN0cmlkZSA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZighb2Zmc2V0KSB7XG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZihjb3VudCkge1xuICAgICAgICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgICAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTsgdmVjWzJdID0gYVtpKzJdOyB2ZWNbM10gPSBhW2krM107XG4gICAgICAgICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgICAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTsgYVtpKzJdID0gdmVjWzJdOyBhW2krM10gPSB2ZWNbM107XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IHZlYyB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG52ZWM0LnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICd2ZWM0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMudmVjNCA9IHZlYzQ7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyeDIgTWF0cml4XG4gKiBAbmFtZSBtYXQyXG4gKi9cblxudmFyIG1hdDIgPSB7fTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDJcbiAqXG4gKiBAcmV0dXJucyB7bWF0Mn0gYSBuZXcgMngyIG1hdHJpeFxuICovXG5tYXQyLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MiBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gYSBtYXRyaXggdG8gY2xvbmVcbiAqIEByZXR1cm5zIHttYXQyfSBhIG5ldyAyeDIgbWF0cml4XG4gKi9cbm1hdDIuY2xvbmUgPSBmdW5jdGlvbihhKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDIgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgYSBtYXQyIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIudHJhbnNwb3NlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICAgIGlmIChvdXQgPT09IGEpIHtcbiAgICAgICAgdmFyIGExID0gYVsxXTtcbiAgICAgICAgb3V0WzFdID0gYVsyXTtcbiAgICAgICAgb3V0WzJdID0gYTE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3V0WzBdID0gYVswXTtcbiAgICAgICAgb3V0WzFdID0gYVsyXTtcbiAgICAgICAgb3V0WzJdID0gYVsxXTtcbiAgICAgICAgb3V0WzNdID0gYVszXTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSxcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGEwICogYTMgLSBhMiAqIGExO1xuXG4gICAgaWYgKCFkZXQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcbiAgICBcbiAgICBvdXRbMF0gPSAgYTMgKiBkZXQ7XG4gICAgb3V0WzFdID0gLWExICogZGV0O1xuICAgIG91dFsyXSA9IC1hMiAqIGRldDtcbiAgICBvdXRbM10gPSAgYTAgKiBkZXQ7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIuYWRqb2ludCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIC8vIENhY2hpbmcgdGhpcyB2YWx1ZSBpcyBuZXNzZWNhcnkgaWYgb3V0ID09IGFcbiAgICB2YXIgYTAgPSBhWzBdO1xuICAgIG91dFswXSA9ICBhWzNdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIG91dFszXSA9ICBhMDtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxuICovXG5tYXQyLmRldGVybWluYW50ID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gYVswXSAqIGFbM10gLSBhWzJdICogYVsxXTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MidzXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM107XG4gICAgdmFyIGIwID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl0sIGIzID0gYlszXTtcbiAgICBvdXRbMF0gPSBhMCAqIGIwICsgYTIgKiBiMTtcbiAgICBvdXRbMV0gPSBhMSAqIGIwICsgYTMgKiBiMTtcbiAgICBvdXRbMl0gPSBhMCAqIGIyICsgYTIgKiBiMztcbiAgICBvdXRbM10gPSBhMSAqIGIyICsgYTMgKiBiMztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDIubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xubWF0Mi5tdWwgPSBtYXQyLm11bHRpcGx5O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQyIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIucm90YXRlID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSxcbiAgICAgICAgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpO1xuICAgIG91dFswXSA9IGEwICogIGMgKyBhMiAqIHM7XG4gICAgb3V0WzFdID0gYTEgKiAgYyArIGEzICogcztcbiAgICBvdXRbMl0gPSBhMCAqIC1zICsgYTIgKiBjO1xuICAgIG91dFszXSA9IGExICogLXMgKyBhMyAqIGM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQyIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqKi9cbm1hdDIuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLFxuICAgICAgICB2MCA9IHZbMF0sIHYxID0gdlsxXTtcbiAgICBvdXRbMF0gPSBhMCAqIHYwO1xuICAgIG91dFsxXSA9IGExICogdjA7XG4gICAgb3V0WzJdID0gYTIgKiB2MTtcbiAgICBvdXRbM10gPSBhMyAqIHYxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBtYXQgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xubWF0Mi5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAnbWF0MignICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJztcbn07XG5cbi8qKlxuICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXG4gKi9cbm1hdDIuZnJvYiA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuKE1hdGguc3FydChNYXRoLnBvdyhhWzBdLCAyKSArIE1hdGgucG93KGFbMV0sIDIpICsgTWF0aC5wb3coYVsyXSwgMikgKyBNYXRoLnBvdyhhWzNdLCAyKSkpXG59O1xuXG4vKipcbiAqIFJldHVybnMgTCwgRCBhbmQgVSBtYXRyaWNlcyAoTG93ZXIgdHJpYW5ndWxhciwgRGlhZ29uYWwgYW5kIFVwcGVyIHRyaWFuZ3VsYXIpIGJ5IGZhY3Rvcml6aW5nIHRoZSBpbnB1dCBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gTCB0aGUgbG93ZXIgdHJpYW5ndWxhciBtYXRyaXggXG4gKiBAcGFyYW0ge21hdDJ9IEQgdGhlIGRpYWdvbmFsIG1hdHJpeCBcbiAqIEBwYXJhbSB7bWF0Mn0gVSB0aGUgdXBwZXIgdHJpYW5ndWxhciBtYXRyaXggXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGlucHV0IG1hdHJpeCB0byBmYWN0b3JpemVcbiAqL1xuXG5tYXQyLkxEVSA9IGZ1bmN0aW9uIChMLCBELCBVLCBhKSB7IFxuICAgIExbMl0gPSBhWzJdL2FbMF07IFxuICAgIFVbMF0gPSBhWzBdOyBcbiAgICBVWzFdID0gYVsxXTsgXG4gICAgVVszXSA9IGFbM10gLSBMWzJdICogVVsxXTsgXG4gICAgcmV0dXJuIFtMLCBELCBVXTsgICAgICAgXG59OyBcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMubWF0MiA9IG1hdDI7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyeDMgTWF0cml4XG4gKiBAbmFtZSBtYXQyZFxuICogXG4gKiBAZGVzY3JpcHRpb24gXG4gKiBBIG1hdDJkIGNvbnRhaW5zIHNpeCBlbGVtZW50cyBkZWZpbmVkIGFzOlxuICogPHByZT5cbiAqIFthLCBjLCB0eCxcbiAqICBiLCBkLCB0eV1cbiAqIDwvcHJlPlxuICogVGhpcyBpcyBhIHNob3J0IGZvcm0gZm9yIHRoZSAzeDMgbWF0cml4OlxuICogPHByZT5cbiAqIFthLCBjLCB0eCxcbiAqICBiLCBkLCB0eSxcbiAqICAwLCAwLCAxXVxuICogPC9wcmU+XG4gKiBUaGUgbGFzdCByb3cgaXMgaWdub3JlZCBzbyB0aGUgYXJyYXkgaXMgc2hvcnRlciBhbmQgb3BlcmF0aW9ucyBhcmUgZmFzdGVyLlxuICovXG5cbnZhciBtYXQyZCA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0MmRcbiAqXG4gKiBAcmV0dXJucyB7bWF0MmR9IGEgbmV3IDJ4MyBtYXRyaXhcbiAqL1xubWF0MmQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDYpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MmQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDJkfSBhIG5ldyAyeDMgbWF0cml4XG4gKi9cbm1hdDJkLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg2KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MmQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xubWF0MmQuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCBhIG1hdDJkIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5tYXQyZC5pbnZlcnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYWEgPSBhWzBdLCBhYiA9IGFbMV0sIGFjID0gYVsyXSwgYWQgPSBhWzNdLFxuICAgICAgICBhdHggPSBhWzRdLCBhdHkgPSBhWzVdO1xuXG4gICAgdmFyIGRldCA9IGFhICogYWQgLSBhYiAqIGFjO1xuICAgIGlmKCFkZXQpe1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gYWQgKiBkZXQ7XG4gICAgb3V0WzFdID0gLWFiICogZGV0O1xuICAgIG91dFsyXSA9IC1hYyAqIGRldDtcbiAgICBvdXRbM10gPSBhYSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYWMgKiBhdHkgLSBhZCAqIGF0eCkgKiBkZXQ7XG4gICAgb3V0WzVdID0gKGFiICogYXR4IC0gYWEgKiBhdHkpICogZGV0O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDJkLmRldGVybWluYW50ID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gYVswXSAqIGFbM10gLSBhWzFdICogYVsyXTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MmQnc1xuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQyZH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sIGE0ID0gYVs0XSwgYTUgPSBhWzVdLFxuICAgICAgICBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM10sIGI0ID0gYls0XSwgYjUgPSBiWzVdO1xuICAgIG91dFswXSA9IGEwICogYjAgKyBhMiAqIGIxO1xuICAgIG91dFsxXSA9IGExICogYjAgKyBhMyAqIGIxO1xuICAgIG91dFsyXSA9IGEwICogYjIgKyBhMiAqIGIzO1xuICAgIG91dFszXSA9IGExICogYjIgKyBhMyAqIGIzO1xuICAgIG91dFs0XSA9IGEwICogYjQgKyBhMiAqIGI1ICsgYTQ7XG4gICAgb3V0WzVdID0gYTEgKiBiNCArIGEzICogYjUgKyBhNTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDJkLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDJkLm11bCA9IG1hdDJkLm11bHRpcGx5O1xuXG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDJkIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLnJvdGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sIGE0ID0gYVs0XSwgYTUgPSBhWzVdLFxuICAgICAgICBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCk7XG4gICAgb3V0WzBdID0gYTAgKiAgYyArIGEyICogcztcbiAgICBvdXRbMV0gPSBhMSAqICBjICsgYTMgKiBzO1xuICAgIG91dFsyXSA9IGEwICogLXMgKyBhMiAqIGM7XG4gICAgb3V0WzNdID0gYTEgKiAtcyArIGEzICogYztcbiAgICBvdXRbNF0gPSBhNDtcbiAgICBvdXRbNV0gPSBhNTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDJkIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqKi9cbm1hdDJkLnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSwgYTQgPSBhWzRdLCBhNSA9IGFbNV0sXG4gICAgICAgIHYwID0gdlswXSwgdjEgPSB2WzFdO1xuICAgIG91dFswXSA9IGEwICogdjA7XG4gICAgb3V0WzFdID0gYTEgKiB2MDtcbiAgICBvdXRbMl0gPSBhMiAqIHYxO1xuICAgIG91dFszXSA9IGEzICogdjE7XG4gICAgb3V0WzRdID0gYTQ7XG4gICAgb3V0WzVdID0gYTU7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNsYXRlcyB0aGUgbWF0MmQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byB0cmFuc2xhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqKi9cbm1hdDJkLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sIGE0ID0gYVs0XSwgYTUgPSBhWzVdLFxuICAgICAgICB2MCA9IHZbMF0sIHYxID0gdlsxXTtcbiAgICBvdXRbMF0gPSBhMDtcbiAgICBvdXRbMV0gPSBhMTtcbiAgICBvdXRbMl0gPSBhMjtcbiAgICBvdXRbM10gPSBhMztcbiAgICBvdXRbNF0gPSBhMCAqIHYwICsgYTIgKiB2MSArIGE0O1xuICAgIG91dFs1XSA9IGExICogdjAgKyBhMyAqIHYxICsgYTU7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHttYXQyZH0gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxuICovXG5tYXQyZC5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAnbWF0MmQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIFxuICAgICAgICAgICAgICAgICAgICBhWzNdICsgJywgJyArIGFbNF0gKyAnLCAnICsgYVs1XSArICcpJztcbn07XG5cbi8qKlxuICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxuICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cbiAqL1xubWF0MmQuZnJvYiA9IGZ1bmN0aW9uIChhKSB7IFxuICAgIHJldHVybihNYXRoLnNxcnQoTWF0aC5wb3coYVswXSwgMikgKyBNYXRoLnBvdyhhWzFdLCAyKSArIE1hdGgucG93KGFbMl0sIDIpICsgTWF0aC5wb3coYVszXSwgMikgKyBNYXRoLnBvdyhhWzRdLCAyKSArIE1hdGgucG93KGFbNV0sIDIpICsgMSkpXG59OyBcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMubWF0MmQgPSBtYXQyZDtcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDN4MyBNYXRyaXhcbiAqIEBuYW1lIG1hdDNcbiAqL1xuXG52YXIgbWF0MyA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0M1xuICpcbiAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XG4gKi9cbm1hdDMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDkpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMTtcbiAgICBvdXRbNV0gPSAwO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcGllcyB0aGUgdXBwZXItbGVmdCAzeDMgdmFsdWVzIGludG8gdGhlIGdpdmVuIG1hdDMuXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyAzeDMgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgICB0aGUgc291cmNlIDR4NCBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5mcm9tTWF0NCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbNF07XG4gICAgb3V0WzRdID0gYVs1XTtcbiAgICBvdXRbNV0gPSBhWzZdO1xuICAgIG91dFs2XSA9IGFbOF07XG4gICAgb3V0WzddID0gYVs5XTtcbiAgICBvdXRbOF0gPSBhWzEwXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDMgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgbWF0cml4IHRvIGNsb25lXG4gKiBAcmV0dXJucyB7bWF0M30gYSBuZXcgM3gzIG1hdHJpeFxuICovXG5tYXQzLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg5KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLmNvcHkgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgYSBtYXQzIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAxO1xuICAgIG91dFs1XSA9IDA7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLnRyYW5zcG9zZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgICBpZiAob3V0ID09PSBhKSB7XG4gICAgICAgIHZhciBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMTIgPSBhWzVdO1xuICAgICAgICBvdXRbMV0gPSBhWzNdO1xuICAgICAgICBvdXRbMl0gPSBhWzZdO1xuICAgICAgICBvdXRbM10gPSBhMDE7XG4gICAgICAgIG91dFs1XSA9IGFbN107XG4gICAgICAgIG91dFs2XSA9IGEwMjtcbiAgICAgICAgb3V0WzddID0gYTEyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFswXSA9IGFbMF07XG4gICAgICAgIG91dFsxXSA9IGFbM107XG4gICAgICAgIG91dFsyXSA9IGFbNl07XG4gICAgICAgIG91dFszXSA9IGFbMV07XG4gICAgICAgIG91dFs0XSA9IGFbNF07XG4gICAgICAgIG91dFs1XSA9IGFbN107XG4gICAgICAgIG91dFs2XSA9IGFbMl07XG4gICAgICAgIG91dFs3XSA9IGFbNV07XG4gICAgICAgIG91dFs4XSA9IGFbOF07XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEludmVydHMgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLmludmVydCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuXG4gICAgICAgIGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMSxcbiAgICAgICAgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMCxcbiAgICAgICAgYjIxID0gYTIxICogYTEwIC0gYTExICogYTIwLFxuXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICAgICAgZGV0ID0gYTAwICogYjAxICsgYTAxICogYjExICsgYTAyICogYjIxO1xuXG4gICAgaWYgKCFkZXQpIHsgXG4gICAgICAgIHJldHVybiBudWxsOyBcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gYjAxICogZGV0O1xuICAgIG91dFsxXSA9ICgtYTIyICogYTAxICsgYTAyICogYTIxKSAqIGRldDtcbiAgICBvdXRbMl0gPSAoYTEyICogYTAxIC0gYTAyICogYTExKSAqIGRldDtcbiAgICBvdXRbM10gPSBiMTEgKiBkZXQ7XG4gICAgb3V0WzRdID0gKGEyMiAqIGEwMCAtIGEwMiAqIGEyMCkgKiBkZXQ7XG4gICAgb3V0WzVdID0gKC1hMTIgKiBhMDAgKyBhMDIgKiBhMTApICogZGV0O1xuICAgIG91dFs2XSA9IGIyMSAqIGRldDtcbiAgICBvdXRbN10gPSAoLWEyMSAqIGEwMCArIGEwMSAqIGEyMCkgKiBkZXQ7XG4gICAgb3V0WzhdID0gKGExMSAqIGEwMCAtIGEwMSAqIGExMCkgKiBkZXQ7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLmFkam9pbnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XTtcblxuICAgIG91dFswXSA9IChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpO1xuICAgIG91dFsxXSA9IChhMDIgKiBhMjEgLSBhMDEgKiBhMjIpO1xuICAgIG91dFsyXSA9IChhMDEgKiBhMTIgLSBhMDIgKiBhMTEpO1xuICAgIG91dFszXSA9IChhMTIgKiBhMjAgLSBhMTAgKiBhMjIpO1xuICAgIG91dFs0XSA9IChhMDAgKiBhMjIgLSBhMDIgKiBhMjApO1xuICAgIG91dFs1XSA9IChhMDIgKiBhMTAgLSBhMDAgKiBhMTIpO1xuICAgIG91dFs2XSA9IChhMTAgKiBhMjEgLSBhMTEgKiBhMjApO1xuICAgIG91dFs3XSA9IChhMDEgKiBhMjAgLSBhMDAgKiBhMjEpO1xuICAgIG91dFs4XSA9IChhMDAgKiBhMTEgLSBhMDEgKiBhMTApO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxuICovXG5tYXQzLmRldGVybWluYW50ID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XTtcblxuICAgIHJldHVybiBhMDAgKiAoYTIyICogYTExIC0gYTEyICogYTIxKSArIGEwMSAqICgtYTIyICogYTEwICsgYTEyICogYTIwKSArIGEwMiAqIChhMjEgKiBhMTAgLSBhMTEgKiBhMjApO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQzJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMubXVsdGlwbHkgPSBmdW5jdGlvbiAob3V0LCBhLCBiKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXG5cbiAgICAgICAgYjAwID0gYlswXSwgYjAxID0gYlsxXSwgYjAyID0gYlsyXSxcbiAgICAgICAgYjEwID0gYlszXSwgYjExID0gYls0XSwgYjEyID0gYls1XSxcbiAgICAgICAgYjIwID0gYls2XSwgYjIxID0gYls3XSwgYjIyID0gYls4XTtcblxuICAgIG91dFswXSA9IGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMDtcbiAgICBvdXRbMV0gPSBiMDAgKiBhMDEgKyBiMDEgKiBhMTEgKyBiMDIgKiBhMjE7XG4gICAgb3V0WzJdID0gYjAwICogYTAyICsgYjAxICogYTEyICsgYjAyICogYTIyO1xuXG4gICAgb3V0WzNdID0gYjEwICogYTAwICsgYjExICogYTEwICsgYjEyICogYTIwO1xuICAgIG91dFs0XSA9IGIxMCAqIGEwMSArIGIxMSAqIGExMSArIGIxMiAqIGEyMTtcbiAgICBvdXRbNV0gPSBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjI7XG5cbiAgICBvdXRbNl0gPSBiMjAgKiBhMDAgKyBiMjEgKiBhMTAgKyBiMjIgKiBhMjA7XG4gICAgb3V0WzddID0gYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxO1xuICAgIG91dFs4XSA9IGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDMubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xubWF0My5tdWwgPSBtYXQzLm11bHRpcGx5O1xuXG4vKipcbiAqIFRyYW5zbGF0ZSBhIG1hdDMgYnkgdGhlIGdpdmVuIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMudHJhbnNsYXRlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXG4gICAgICAgIHggPSB2WzBdLCB5ID0gdlsxXTtcblxuICAgIG91dFswXSA9IGEwMDtcbiAgICBvdXRbMV0gPSBhMDE7XG4gICAgb3V0WzJdID0gYTAyO1xuXG4gICAgb3V0WzNdID0gYTEwO1xuICAgIG91dFs0XSA9IGExMTtcbiAgICBvdXRbNV0gPSBhMTI7XG5cbiAgICBvdXRbNl0gPSB4ICogYTAwICsgeSAqIGExMCArIGEyMDtcbiAgICBvdXRbN10gPSB4ICogYTAxICsgeSAqIGExMSArIGEyMTtcbiAgICBvdXRbOF0gPSB4ICogYTAyICsgeSAqIGExMiArIGEyMjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0MyBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLnJvdGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuXG4gICAgICAgIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGMgKiBhMDAgKyBzICogYTEwO1xuICAgIG91dFsxXSA9IGMgKiBhMDEgKyBzICogYTExO1xuICAgIG91dFsyXSA9IGMgKiBhMDIgKyBzICogYTEyO1xuXG4gICAgb3V0WzNdID0gYyAqIGExMCAtIHMgKiBhMDA7XG4gICAgb3V0WzRdID0gYyAqIGExMSAtIHMgKiBhMDE7XG4gICAgb3V0WzVdID0gYyAqIGExMiAtIHMgKiBhMDI7XG5cbiAgICBvdXRbNl0gPSBhMjA7XG4gICAgb3V0WzddID0gYTIxO1xuICAgIG91dFs4XSA9IGEyMjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDMgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICoqL1xubWF0My5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciB4ID0gdlswXSwgeSA9IHZbMV07XG5cbiAgICBvdXRbMF0gPSB4ICogYVswXTtcbiAgICBvdXRbMV0gPSB4ICogYVsxXTtcbiAgICBvdXRbMl0gPSB4ICogYVsyXTtcblxuICAgIG91dFszXSA9IHkgKiBhWzNdO1xuICAgIG91dFs0XSA9IHkgKiBhWzRdO1xuICAgIG91dFs1XSA9IHkgKiBhWzVdO1xuXG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29waWVzIHRoZSB2YWx1ZXMgZnJvbSBhIG1hdDJkIGludG8gYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byBjb3B5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5tYXQzLmZyb21NYXQyZCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSAwO1xuXG4gICAgb3V0WzNdID0gYVsyXTtcbiAgICBvdXRbNF0gPSBhWzNdO1xuICAgIG91dFs1XSA9IDA7XG5cbiAgICBvdXRbNl0gPSBhWzRdO1xuICAgIG91dFs3XSA9IGFbNV07XG4gICAgb3V0WzhdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4qIENhbGN1bGF0ZXMgYSAzeDMgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbipcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbipcbiogQHJldHVybnMge21hdDN9IG91dFxuKi9cbm1hdDMuZnJvbVF1YXQgPSBmdW5jdGlvbiAob3V0LCBxKSB7XG4gICAgdmFyIHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdLFxuICAgICAgICB4MiA9IHggKyB4LFxuICAgICAgICB5MiA9IHkgKyB5LFxuICAgICAgICB6MiA9IHogKyB6LFxuXG4gICAgICAgIHh4ID0geCAqIHgyLFxuICAgICAgICB5eCA9IHkgKiB4MixcbiAgICAgICAgeXkgPSB5ICogeTIsXG4gICAgICAgIHp4ID0geiAqIHgyLFxuICAgICAgICB6eSA9IHogKiB5MixcbiAgICAgICAgenogPSB6ICogejIsXG4gICAgICAgIHd4ID0gdyAqIHgyLFxuICAgICAgICB3eSA9IHcgKiB5MixcbiAgICAgICAgd3ogPSB3ICogejI7XG5cbiAgICBvdXRbMF0gPSAxIC0geXkgLSB6ejtcbiAgICBvdXRbM10gPSB5eCAtIHd6O1xuICAgIG91dFs2XSA9IHp4ICsgd3k7XG5cbiAgICBvdXRbMV0gPSB5eCArIHd6O1xuICAgIG91dFs0XSA9IDEgLSB4eCAtIHp6O1xuICAgIG91dFs3XSA9IHp5IC0gd3g7XG5cbiAgICBvdXRbMl0gPSB6eCAtIHd5O1xuICAgIG91dFs1XSA9IHp5ICsgd3g7XG4gICAgb3V0WzhdID0gMSAtIHh4IC0geXk7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4qIENhbGN1bGF0ZXMgYSAzeDMgbm9ybWFsIG1hdHJpeCAodHJhbnNwb3NlIGludmVyc2UpIGZyb20gdGhlIDR4NCBtYXRyaXhcbipcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuKiBAcGFyYW0ge21hdDR9IGEgTWF0NCB0byBkZXJpdmUgdGhlIG5vcm1hbCBtYXRyaXggZnJvbVxuKlxuKiBAcmV0dXJucyB7bWF0M30gb3V0XG4qL1xubWF0My5ub3JtYWxGcm9tTWF0NCA9IGZ1bmN0aW9uIChvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XSxcblxuICAgICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsXG4gICAgICAgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxuICAgICAgICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG4gICAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSxcbiAgICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsXG4gICAgICAgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxuICAgICAgICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG4gICAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSxcbiAgICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyLFxuXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICAgICAgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gICAgaWYgKCFkZXQpIHsgXG4gICAgICAgIHJldHVybiBudWxsOyBcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzFdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG5cbiAgICBvdXRbM10gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcbiAgICBvdXRbNV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcblxuICAgIG91dFs2XSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICAgIG91dFs3XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICAgIG91dFs4XSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG1hdCBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxuICovXG5tYXQzLnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICdtYXQzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVszXSArICcsICcgKyBhWzRdICsgJywgJyArIGFbNV0gKyAnLCAnICsgXG4gICAgICAgICAgICAgICAgICAgIGFbNl0gKyAnLCAnICsgYVs3XSArICcsICcgKyBhWzhdICsgJyknO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxuICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cbiAqL1xubWF0My5mcm9iID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4oTWF0aC5zcXJ0KE1hdGgucG93KGFbMF0sIDIpICsgTWF0aC5wb3coYVsxXSwgMikgKyBNYXRoLnBvdyhhWzJdLCAyKSArIE1hdGgucG93KGFbM10sIDIpICsgTWF0aC5wb3coYVs0XSwgMikgKyBNYXRoLnBvdyhhWzVdLCAyKSArIE1hdGgucG93KGFbNl0sIDIpICsgTWF0aC5wb3coYVs3XSwgMikgKyBNYXRoLnBvdyhhWzhdLCAyKSkpXG59O1xuXG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLm1hdDMgPSBtYXQzO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgNHg0IE1hdHJpeFxuICogQG5hbWUgbWF0NFxuICovXG5cbnZhciBtYXQ0ID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQ0XG4gKlxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xubWF0NC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMTYpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAxO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDE7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQ0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xubWF0NC5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMTYpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIG91dFs5XSA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgb3V0WzldID0gYVs5XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgYSBtYXQ0IHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDE7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMTtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQudHJhbnNwb3NlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICAgIGlmIChvdXQgPT09IGEpIHtcbiAgICAgICAgdmFyIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgICAgICBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGEwMTtcbiAgICAgICAgb3V0WzZdID0gYVs5XTtcbiAgICAgICAgb3V0WzddID0gYVsxM107XG4gICAgICAgIG91dFs4XSA9IGEwMjtcbiAgICAgICAgb3V0WzldID0gYTEyO1xuICAgICAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgICAgIG91dFsxMl0gPSBhMDM7XG4gICAgICAgIG91dFsxM10gPSBhMTM7XG4gICAgICAgIG91dFsxNF0gPSBhMjM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3V0WzBdID0gYVswXTtcbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGFbMV07XG4gICAgICAgIG91dFs1XSA9IGFbNV07XG4gICAgICAgIG91dFs2XSA9IGFbOV07XG4gICAgICAgIG91dFs3XSA9IGFbMTNdO1xuICAgICAgICBvdXRbOF0gPSBhWzJdO1xuICAgICAgICBvdXRbOV0gPSBhWzZdO1xuICAgICAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgICAgIG91dFsxMV0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzEyXSA9IGFbM107XG4gICAgICAgIG91dFsxM10gPSBhWzddO1xuICAgICAgICBvdXRbMTRdID0gYVsxMV07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbiAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV0sXG5cbiAgICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLFxuICAgICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCxcbiAgICAgICAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXG4gICAgICAgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLFxuICAgICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCxcbiAgICAgICAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXG4gICAgICAgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMixcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICghZGV0KSB7IFxuICAgICAgICByZXR1cm4gbnVsbDsgXG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICAgIG91dFsxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICAgIG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICAgIG91dFszXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0O1xuICAgIG91dFs0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xuICAgIG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICAgIG91dFs2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICAgIG91dFs3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0O1xuICAgIG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuICAgIG91dFs5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuICAgIG91dFsxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0O1xuICAgIG91dFsxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmFkam9pbnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICAgIG91dFswXSAgPSAgKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gICAgb3V0WzFdICA9IC0oYTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcbiAgICBvdXRbMl0gID0gIChhMDEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMSAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICAgIG91dFszXSAgPSAtKGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTExICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzRdICA9IC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEzMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpKTtcbiAgICBvdXRbNV0gID0gIChhMDAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikpO1xuICAgIG91dFs2XSAgPSAtKGEwMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTEwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzddICA9ICAoYTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgICBvdXRbOF0gID0gIChhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkpO1xuICAgIG91dFs5XSAgPSAtKGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSk7XG4gICAgb3V0WzEwXSA9ICAoYTAwICogKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMzIC0gYTAzICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcbiAgICBvdXRbMTFdID0gLShhMDAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjMgLSBhMDMgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSkpO1xuICAgIG91dFsxMl0gPSAtKGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSk7XG4gICAgb3V0WzEzXSA9ICAoYTAwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgLSBhMjAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpKTtcbiAgICBvdXRbMTRdID0gLShhMDAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSAtIGExMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICsgYTMwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSkpO1xuICAgIG91dFsxNV0gPSAgKGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDQuZGV0ZXJtaW5hbnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdLFxuXG4gICAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcbiAgICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXG4gICAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxuICAgICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcbiAgICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXG4gICAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxuICAgICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0NCdzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0Lm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gICAgLy8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XG4gICAgdmFyIGIwICA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107ICBcbiAgICBvdXRbMF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzFdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuICAgIG91dFsyXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgICBvdXRbM10gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgICBiMCA9IGJbNF07IGIxID0gYls1XTsgYjIgPSBiWzZdOyBiMyA9IGJbN107XG4gICAgb3V0WzRdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFs1XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbNl0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4gICAgb3V0WzddID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gICAgYjAgPSBiWzhdOyBiMSA9IGJbOV07IGIyID0gYlsxMF07IGIzID0gYlsxMV07XG4gICAgb3V0WzhdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFs5XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMTBdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFsxMV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgICBiMCA9IGJbMTJdOyBiMSA9IGJbMTNdOyBiMiA9IGJbMTRdOyBiMyA9IGJbMTVdO1xuICAgIG91dFsxMl0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzEzXSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMTRdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFsxNV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQ0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDQubXVsID0gbWF0NC5tdWx0aXBseTtcblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQ0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnRyYW5zbGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHYpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXSxcbiAgICAgICAgYTAwLCBhMDEsIGEwMiwgYTAzLFxuICAgICAgICBhMTAsIGExMSwgYTEyLCBhMTMsXG4gICAgICAgIGEyMCwgYTIxLCBhMjIsIGEyMztcblxuICAgIGlmIChhID09PSBvdXQpIHtcbiAgICAgICAgb3V0WzEyXSA9IGFbMF0gKiB4ICsgYVs0XSAqIHkgKyBhWzhdICogeiArIGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxXSAqIHggKyBhWzVdICogeSArIGFbOV0gKiB6ICsgYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzJdICogeCArIGFbNl0gKiB5ICsgYVsxMF0gKiB6ICsgYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzNdICogeCArIGFbN10gKiB5ICsgYVsxMV0gKiB6ICsgYVsxNV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgICAgICAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcbiAgICAgICAgYTIwID0gYVs4XTsgYTIxID0gYVs5XTsgYTIyID0gYVsxMF07IGEyMyA9IGFbMTFdO1xuXG4gICAgICAgIG91dFswXSA9IGEwMDsgb3V0WzFdID0gYTAxOyBvdXRbMl0gPSBhMDI7IG91dFszXSA9IGEwMztcbiAgICAgICAgb3V0WzRdID0gYTEwOyBvdXRbNV0gPSBhMTE7IG91dFs2XSA9IGExMjsgb3V0WzddID0gYTEzO1xuICAgICAgICBvdXRbOF0gPSBhMjA7IG91dFs5XSA9IGEyMTsgb3V0WzEwXSA9IGEyMjsgb3V0WzExXSA9IGEyMztcblxuICAgICAgICBvdXRbMTJdID0gYTAwICogeCArIGExMCAqIHkgKyBhMjAgKiB6ICsgYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhMDEgKiB4ICsgYTExICogeSArIGEyMSAqIHogKyBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGEwMiAqIHggKyBhMTIgKiB5ICsgYTIyICogeiArIGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYTAzICogeCArIGExMyAqIHkgKyBhMjMgKiB6ICsgYVsxNV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdGhlIHZlYzMgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICoqL1xubWF0NC5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciB4ID0gdlswXSwgeSA9IHZbMV0sIHogPSB2WzJdO1xuXG4gICAgb3V0WzBdID0gYVswXSAqIHg7XG4gICAgb3V0WzFdID0gYVsxXSAqIHg7XG4gICAgb3V0WzJdID0gYVsyXSAqIHg7XG4gICAgb3V0WzNdID0gYVszXSAqIHg7XG4gICAgb3V0WzRdID0gYVs0XSAqIHk7XG4gICAgb3V0WzVdID0gYVs1XSAqIHk7XG4gICAgb3V0WzZdID0gYVs2XSAqIHk7XG4gICAgb3V0WzddID0gYVs3XSAqIHk7XG4gICAgb3V0WzhdID0gYVs4XSAqIHo7XG4gICAgb3V0WzldID0gYVs5XSAqIHo7XG4gICAgb3V0WzEwXSA9IGFbMTBdICogejtcbiAgICBvdXRbMTFdID0gYVsxMV0gKiB6O1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0NCBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5yb3RhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQsIGF4aXMpIHtcbiAgICB2YXIgeCA9IGF4aXNbMF0sIHkgPSBheGlzWzFdLCB6ID0gYXhpc1syXSxcbiAgICAgICAgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeiksXG4gICAgICAgIHMsIGMsIHQsXG4gICAgICAgIGEwMCwgYTAxLCBhMDIsIGEwMyxcbiAgICAgICAgYTEwLCBhMTEsIGExMiwgYTEzLFxuICAgICAgICBhMjAsIGEyMSwgYTIyLCBhMjMsXG4gICAgICAgIGIwMCwgYjAxLCBiMDIsXG4gICAgICAgIGIxMCwgYjExLCBiMTIsXG4gICAgICAgIGIyMCwgYjIxLCBiMjI7XG5cbiAgICBpZiAoTWF0aC5hYnMobGVuKSA8IEdMTUFUX0VQU0lMT04pIHsgcmV0dXJuIG51bGw7IH1cbiAgICBcbiAgICBsZW4gPSAxIC8gbGVuO1xuICAgIHggKj0gbGVuO1xuICAgIHkgKj0gbGVuO1xuICAgIHogKj0gbGVuO1xuXG4gICAgcyA9IE1hdGguc2luKHJhZCk7XG4gICAgYyA9IE1hdGguY29zKHJhZCk7XG4gICAgdCA9IDEgLSBjO1xuXG4gICAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgICBhMTAgPSBhWzRdOyBhMTEgPSBhWzVdOyBhMTIgPSBhWzZdOyBhMTMgPSBhWzddO1xuICAgIGEyMCA9IGFbOF07IGEyMSA9IGFbOV07IGEyMiA9IGFbMTBdOyBhMjMgPSBhWzExXTtcblxuICAgIC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxuICAgIGIwMCA9IHggKiB4ICogdCArIGM7IGIwMSA9IHkgKiB4ICogdCArIHogKiBzOyBiMDIgPSB6ICogeCAqIHQgLSB5ICogcztcbiAgICBiMTAgPSB4ICogeSAqIHQgLSB6ICogczsgYjExID0geSAqIHkgKiB0ICsgYzsgYjEyID0geiAqIHkgKiB0ICsgeCAqIHM7XG4gICAgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7IGIyMSA9IHkgKiB6ICogdCAtIHggKiBzOyBiMjIgPSB6ICogeiAqIHQgKyBjO1xuXG4gICAgLy8gUGVyZm9ybSByb3RhdGlvbi1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgICBvdXRbMF0gPSBhMDAgKiBiMDAgKyBhMTAgKiBiMDEgKyBhMjAgKiBiMDI7XG4gICAgb3V0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyO1xuICAgIG91dFsyXSA9IGEwMiAqIGIwMCArIGExMiAqIGIwMSArIGEyMiAqIGIwMjtcbiAgICBvdXRbM10gPSBhMDMgKiBiMDAgKyBhMTMgKiBiMDEgKyBhMjMgKiBiMDI7XG4gICAgb3V0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyO1xuICAgIG91dFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMjtcbiAgICBvdXRbNl0gPSBhMDIgKiBiMTAgKyBhMTIgKiBiMTEgKyBhMjIgKiBiMTI7XG4gICAgb3V0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyO1xuICAgIG91dFs4XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMjtcbiAgICBvdXRbOV0gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjI7XG4gICAgb3V0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMjtcbiAgICBvdXRbMTFdID0gYTAzICogYjIwICsgYTEzICogYjIxICsgYTIzICogYjIyO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWCBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5yb3RhdGVYID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKSxcbiAgICAgICAgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXG4gICAgICAgIG91dFswXSAgPSBhWzBdO1xuICAgICAgICBvdXRbMV0gID0gYVsxXTtcbiAgICAgICAgb3V0WzJdICA9IGFbMl07XG4gICAgICAgIG91dFszXSAgPSBhWzNdO1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFs0XSA9IGExMCAqIGMgKyBhMjAgKiBzO1xuICAgIG91dFs1XSA9IGExMSAqIGMgKyBhMjEgKiBzO1xuICAgIG91dFs2XSA9IGExMiAqIGMgKyBhMjIgKiBzO1xuICAgIG91dFs3XSA9IGExMyAqIGMgKyBhMjMgKiBzO1xuICAgIG91dFs4XSA9IGEyMCAqIGMgLSBhMTAgKiBzO1xuICAgIG91dFs5XSA9IGEyMSAqIGMgLSBhMTEgKiBzO1xuICAgIG91dFsxMF0gPSBhMjIgKiBjIC0gYTEyICogcztcbiAgICBvdXRbMTFdID0gYTIzICogYyAtIGExMyAqIHM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnJvdGF0ZVkgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpLFxuICAgICAgICBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdLFxuICAgICAgICBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcbiAgICAgICAgb3V0WzRdICA9IGFbNF07XG4gICAgICAgIG91dFs1XSAgPSBhWzVdO1xuICAgICAgICBvdXRbNl0gID0gYVs2XTtcbiAgICAgICAgb3V0WzddICA9IGFbN107XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYyAtIGEyMCAqIHM7XG4gICAgb3V0WzFdID0gYTAxICogYyAtIGEyMSAqIHM7XG4gICAgb3V0WzJdID0gYTAyICogYyAtIGEyMiAqIHM7XG4gICAgb3V0WzNdID0gYTAzICogYyAtIGEyMyAqIHM7XG4gICAgb3V0WzhdID0gYTAwICogcyArIGEyMCAqIGM7XG4gICAgb3V0WzldID0gYTAxICogcyArIGEyMSAqIGM7XG4gICAgb3V0WzEwXSA9IGEwMiAqIHMgKyBhMjIgKiBjO1xuICAgIG91dFsxMV0gPSBhMDMgKiBzICsgYTIzICogYztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQucm90YXRlWiA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCksXG4gICAgICAgIGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sXG4gICAgICAgIGExMSA9IGFbNV0sXG4gICAgICAgIGExMiA9IGFbNl0sXG4gICAgICAgIGExMyA9IGFbN107XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgICAgIG91dFs4XSAgPSBhWzhdO1xuICAgICAgICBvdXRbOV0gID0gYVs5XTtcbiAgICAgICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgICAgICBvdXRbMTFdID0gYVsxMV07XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYyArIGExMCAqIHM7XG4gICAgb3V0WzFdID0gYTAxICogYyArIGExMSAqIHM7XG4gICAgb3V0WzJdID0gYTAyICogYyArIGExMiAqIHM7XG4gICAgb3V0WzNdID0gYTAzICogYyArIGExMyAqIHM7XG4gICAgb3V0WzRdID0gYTEwICogYyAtIGEwMCAqIHM7XG4gICAgb3V0WzVdID0gYTExICogYyAtIGEwMSAqIHM7XG4gICAgb3V0WzZdID0gYTEyICogYyAtIGEwMiAqIHM7XG4gICAgb3V0WzddID0gYTEzICogYyAtIGEwMyAqIHM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiBhbmQgdmVjdG9yIHRyYW5zbGF0aW9uXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xuICogICAgIHZhciBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5mcm9tUm90YXRpb25UcmFuc2xhdGlvbiA9IGZ1bmN0aW9uIChvdXQsIHEsIHYpIHtcbiAgICAvLyBRdWF0ZXJuaW9uIG1hdGhcbiAgICB2YXIgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM10sXG4gICAgICAgIHgyID0geCArIHgsXG4gICAgICAgIHkyID0geSArIHksXG4gICAgICAgIHoyID0geiArIHosXG5cbiAgICAgICAgeHggPSB4ICogeDIsXG4gICAgICAgIHh5ID0geCAqIHkyLFxuICAgICAgICB4eiA9IHggKiB6MixcbiAgICAgICAgeXkgPSB5ICogeTIsXG4gICAgICAgIHl6ID0geSAqIHoyLFxuICAgICAgICB6eiA9IHogKiB6MixcbiAgICAgICAgd3ggPSB3ICogeDIsXG4gICAgICAgIHd5ID0gdyAqIHkyLFxuICAgICAgICB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSAoeXkgKyB6eik7XG4gICAgb3V0WzFdID0geHkgKyB3ejtcbiAgICBvdXRbMl0gPSB4eiAtIHd5O1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0geHkgLSB3ejtcbiAgICBvdXRbNV0gPSAxIC0gKHh4ICsgenopO1xuICAgIG91dFs2XSA9IHl6ICsgd3g7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSB4eiArIHd5O1xuICAgIG91dFs5XSA9IHl6IC0gd3g7XG4gICAgb3V0WzEwXSA9IDEgLSAoeHggKyB5eSk7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IHZbMF07XG4gICAgb3V0WzEzXSA9IHZbMV07XG4gICAgb3V0WzE0XSA9IHZbMl07XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbm1hdDQuZnJvbVF1YXQgPSBmdW5jdGlvbiAob3V0LCBxKSB7XG4gICAgdmFyIHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdLFxuICAgICAgICB4MiA9IHggKyB4LFxuICAgICAgICB5MiA9IHkgKyB5LFxuICAgICAgICB6MiA9IHogKyB6LFxuXG4gICAgICAgIHh4ID0geCAqIHgyLFxuICAgICAgICB5eCA9IHkgKiB4MixcbiAgICAgICAgeXkgPSB5ICogeTIsXG4gICAgICAgIHp4ID0geiAqIHgyLFxuICAgICAgICB6eSA9IHogKiB5MixcbiAgICAgICAgenogPSB6ICogejIsXG4gICAgICAgIHd4ID0gdyAqIHgyLFxuICAgICAgICB3eSA9IHcgKiB5MixcbiAgICAgICAgd3ogPSB3ICogejI7XG5cbiAgICBvdXRbMF0gPSAxIC0geXkgLSB6ejtcbiAgICBvdXRbMV0gPSB5eCArIHd6O1xuICAgIG91dFsyXSA9IHp4IC0gd3k7XG4gICAgb3V0WzNdID0gMDtcblxuICAgIG91dFs0XSA9IHl4IC0gd3o7XG4gICAgb3V0WzVdID0gMSAtIHh4IC0geno7XG4gICAgb3V0WzZdID0genkgKyB3eDtcbiAgICBvdXRbN10gPSAwO1xuXG4gICAgb3V0WzhdID0genggKyB3eTtcbiAgICBvdXRbOV0gPSB6eSAtIHd4O1xuICAgIG91dFsxMF0gPSAxIC0geHggLSB5eTtcbiAgICBvdXRbMTFdID0gMDtcblxuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAwO1xuICAgIG91dFsxNV0gPSAxO1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgZnJ1c3R1bSBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtOdW1iZXJ9IGxlZnQgTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gYm90dG9tIEJvdHRvbSBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IHRvcCBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQuZnJ1c3R1bSA9IGZ1bmN0aW9uIChvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XG4gICAgdmFyIHJsID0gMSAvIChyaWdodCAtIGxlZnQpLFxuICAgICAgICB0YiA9IDEgLyAodG9wIC0gYm90dG9tKSxcbiAgICAgICAgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFswXSA9IChuZWFyICogMikgKiBybDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IChuZWFyICogMikgKiB0YjtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gKHJpZ2h0ICsgbGVmdCkgKiBybDtcbiAgICBvdXRbOV0gPSAodG9wICsgYm90dG9tKSAqIHRiO1xuICAgIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTFdID0gLTE7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IChmYXIgKiBuZWFyICogMikgKiBuZjtcbiAgICBvdXRbMTVdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gZm92eSBWZXJ0aWNhbCBmaWVsZCBvZiB2aWV3IGluIHJhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBhc3BlY3QgQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnBlcnNwZWN0aXZlID0gZnVuY3Rpb24gKG91dCwgZm92eSwgYXNwZWN0LCBuZWFyLCBmYXIpIHtcbiAgICB2YXIgZiA9IDEuMCAvIE1hdGgudGFuKGZvdnkgLyAyKSxcbiAgICAgICAgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFswXSA9IGYgLyBhc3BlY3Q7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSBmO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgIG91dFsxMV0gPSAtMTtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gKDIgKiBmYXIgKiBuZWFyKSAqIG5mO1xuICAgIG91dFsxNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIG9ydGhvZ29uYWwgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gYm90dG9tIEJvdHRvbSBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IHRvcCBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQub3J0aG8gPSBmdW5jdGlvbiAob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICAgIHZhciBsciA9IDEgLyAobGVmdCAtIHJpZ2h0KSxcbiAgICAgICAgYnQgPSAxIC8gKGJvdHRvbSAtIHRvcCksXG4gICAgICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSAtMiAqIGxyO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gLTIgKiBidDtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAyICogbmY7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IChsZWZ0ICsgcmlnaHQpICogbHI7XG4gICAgb3V0WzEzXSA9ICh0b3AgKyBib3R0b20pICogYnQ7XG4gICAgb3V0WzE0XSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgIG91dFsxNV0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGxvb2stYXQgbWF0cml4IHdpdGggdGhlIGdpdmVuIGV5ZSBwb3NpdGlvbiwgZm9jYWwgcG9pbnQsIGFuZCB1cCBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHt2ZWMzfSBleWUgUG9zaXRpb24gb2YgdGhlIHZpZXdlclxuICogQHBhcmFtIHt2ZWMzfSBjZW50ZXIgUG9pbnQgdGhlIHZpZXdlciBpcyBsb29raW5nIGF0XG4gKiBAcGFyYW0ge3ZlYzN9IHVwIHZlYzMgcG9pbnRpbmcgdXBcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5sb29rQXQgPSBmdW5jdGlvbiAob3V0LCBleWUsIGNlbnRlciwgdXApIHtcbiAgICB2YXIgeDAsIHgxLCB4MiwgeTAsIHkxLCB5MiwgejAsIHoxLCB6MiwgbGVuLFxuICAgICAgICBleWV4ID0gZXllWzBdLFxuICAgICAgICBleWV5ID0gZXllWzFdLFxuICAgICAgICBleWV6ID0gZXllWzJdLFxuICAgICAgICB1cHggPSB1cFswXSxcbiAgICAgICAgdXB5ID0gdXBbMV0sXG4gICAgICAgIHVweiA9IHVwWzJdLFxuICAgICAgICBjZW50ZXJ4ID0gY2VudGVyWzBdLFxuICAgICAgICBjZW50ZXJ5ID0gY2VudGVyWzFdLFxuICAgICAgICBjZW50ZXJ6ID0gY2VudGVyWzJdO1xuXG4gICAgaWYgKE1hdGguYWJzKGV5ZXggLSBjZW50ZXJ4KSA8IEdMTUFUX0VQU0lMT04gJiZcbiAgICAgICAgTWF0aC5hYnMoZXlleSAtIGNlbnRlcnkpIDwgR0xNQVRfRVBTSUxPTiAmJlxuICAgICAgICBNYXRoLmFicyhleWV6IC0gY2VudGVyeikgPCBHTE1BVF9FUFNJTE9OKSB7XG4gICAgICAgIHJldHVybiBtYXQ0LmlkZW50aXR5KG91dCk7XG4gICAgfVxuXG4gICAgejAgPSBleWV4IC0gY2VudGVyeDtcbiAgICB6MSA9IGV5ZXkgLSBjZW50ZXJ5O1xuICAgIHoyID0gZXlleiAtIGNlbnRlcno7XG5cbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KHowICogejAgKyB6MSAqIHoxICsgejIgKiB6Mik7XG4gICAgejAgKj0gbGVuO1xuICAgIHoxICo9IGxlbjtcbiAgICB6MiAqPSBsZW47XG5cbiAgICB4MCA9IHVweSAqIHoyIC0gdXB6ICogejE7XG4gICAgeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyO1xuICAgIHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcbiAgICBsZW4gPSBNYXRoLnNxcnQoeDAgKiB4MCArIHgxICogeDEgKyB4MiAqIHgyKTtcbiAgICBpZiAoIWxlbikge1xuICAgICAgICB4MCA9IDA7XG4gICAgICAgIHgxID0gMDtcbiAgICAgICAgeDIgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxlbiA9IDEgLyBsZW47XG4gICAgICAgIHgwICo9IGxlbjtcbiAgICAgICAgeDEgKj0gbGVuO1xuICAgICAgICB4MiAqPSBsZW47XG4gICAgfVxuXG4gICAgeTAgPSB6MSAqIHgyIC0gejIgKiB4MTtcbiAgICB5MSA9IHoyICogeDAgLSB6MCAqIHgyO1xuICAgIHkyID0gejAgKiB4MSAtIHoxICogeDA7XG5cbiAgICBsZW4gPSBNYXRoLnNxcnQoeTAgKiB5MCArIHkxICogeTEgKyB5MiAqIHkyKTtcbiAgICBpZiAoIWxlbikge1xuICAgICAgICB5MCA9IDA7XG4gICAgICAgIHkxID0gMDtcbiAgICAgICAgeTIgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxlbiA9IDEgLyBsZW47XG4gICAgICAgIHkwICo9IGxlbjtcbiAgICAgICAgeTEgKj0gbGVuO1xuICAgICAgICB5MiAqPSBsZW47XG4gICAgfVxuXG4gICAgb3V0WzBdID0geDA7XG4gICAgb3V0WzFdID0geTA7XG4gICAgb3V0WzJdID0gejA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSB4MTtcbiAgICBvdXRbNV0gPSB5MTtcbiAgICBvdXRbNl0gPSB6MTtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IHgyO1xuICAgIG91dFs5XSA9IHkyO1xuICAgIG91dFsxMF0gPSB6MjtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gLSh4MCAqIGV5ZXggKyB4MSAqIGV5ZXkgKyB4MiAqIGV5ZXopO1xuICAgIG91dFsxM10gPSAtKHkwICogZXlleCArIHkxICogZXlleSArIHkyICogZXlleik7XG4gICAgb3V0WzE0XSA9IC0oejAgKiBleWV4ICsgejEgKiBleWV5ICsgejIgKiBleWV6KTtcbiAgICBvdXRbMTVdID0gMTtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBtYXQgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xubWF0NC5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAnbWF0NCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcsICcgK1xuICAgICAgICAgICAgICAgICAgICBhWzRdICsgJywgJyArIGFbNV0gKyAnLCAnICsgYVs2XSArICcsICcgKyBhWzddICsgJywgJyArXG4gICAgICAgICAgICAgICAgICAgIGFbOF0gKyAnLCAnICsgYVs5XSArICcsICcgKyBhWzEwXSArICcsICcgKyBhWzExXSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVsxMl0gKyAnLCAnICsgYVsxM10gKyAnLCAnICsgYVsxNF0gKyAnLCAnICsgYVsxNV0gKyAnKSc7XG59O1xuXG4vKipcbiAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxuICovXG5tYXQ0LmZyb2IgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybihNYXRoLnNxcnQoTWF0aC5wb3coYVswXSwgMikgKyBNYXRoLnBvdyhhWzFdLCAyKSArIE1hdGgucG93KGFbMl0sIDIpICsgTWF0aC5wb3coYVszXSwgMikgKyBNYXRoLnBvdyhhWzRdLCAyKSArIE1hdGgucG93KGFbNV0sIDIpICsgTWF0aC5wb3coYVs2XSwgMikgKyBNYXRoLnBvdyhhWzZdLCAyKSArIE1hdGgucG93KGFbN10sIDIpICsgTWF0aC5wb3coYVs4XSwgMikgKyBNYXRoLnBvdyhhWzldLCAyKSArIE1hdGgucG93KGFbMTBdLCAyKSArIE1hdGgucG93KGFbMTFdLCAyKSArIE1hdGgucG93KGFbMTJdLCAyKSArIE1hdGgucG93KGFbMTNdLCAyKSArIE1hdGgucG93KGFbMTRdLCAyKSArIE1hdGgucG93KGFbMTVdLCAyKSApKVxufTtcblxuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQ0ID0gbWF0NDtcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIFF1YXRlcm5pb25cbiAqIEBuYW1lIHF1YXRcbiAqL1xuXG52YXIgcXVhdCA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgcXVhdFxuICpcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKi9cbnF1YXQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0cyBhIHF1YXRlcm5pb24gdG8gcmVwcmVzZW50IHRoZSBzaG9ydGVzdCByb3RhdGlvbiBmcm9tIG9uZVxuICogdmVjdG9yIHRvIGFub3RoZXIuXG4gKlxuICogQm90aCB2ZWN0b3JzIGFyZSBhc3N1bWVkIHRvIGJlIHVuaXQgbGVuZ3RoLlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgaW5pdGlhbCB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgZGVzdGluYXRpb24gdmVjdG9yXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQucm90YXRpb25UbyA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgdG1wdmVjMyA9IHZlYzMuY3JlYXRlKCk7XG4gICAgdmFyIHhVbml0VmVjMyA9IHZlYzMuZnJvbVZhbHVlcygxLDAsMCk7XG4gICAgdmFyIHlVbml0VmVjMyA9IHZlYzMuZnJvbVZhbHVlcygwLDEsMCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgICAgIHZhciBkb3QgPSB2ZWMzLmRvdChhLCBiKTtcbiAgICAgICAgaWYgKGRvdCA8IC0wLjk5OTk5OSkge1xuICAgICAgICAgICAgdmVjMy5jcm9zcyh0bXB2ZWMzLCB4VW5pdFZlYzMsIGEpO1xuICAgICAgICAgICAgaWYgKHZlYzMubGVuZ3RoKHRtcHZlYzMpIDwgMC4wMDAwMDEpXG4gICAgICAgICAgICAgICAgdmVjMy5jcm9zcyh0bXB2ZWMzLCB5VW5pdFZlYzMsIGEpO1xuICAgICAgICAgICAgdmVjMy5ub3JtYWxpemUodG1wdmVjMywgdG1wdmVjMyk7XG4gICAgICAgICAgICBxdWF0LnNldEF4aXNBbmdsZShvdXQsIHRtcHZlYzMsIE1hdGguUEkpO1xuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfSBlbHNlIGlmIChkb3QgPiAwLjk5OTk5OSkge1xuICAgICAgICAgICAgb3V0WzBdID0gMDtcbiAgICAgICAgICAgIG91dFsxXSA9IDA7XG4gICAgICAgICAgICBvdXRbMl0gPSAwO1xuICAgICAgICAgICAgb3V0WzNdID0gMTtcbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2ZWMzLmNyb3NzKHRtcHZlYzMsIGEsIGIpO1xuICAgICAgICAgICAgb3V0WzBdID0gdG1wdmVjM1swXTtcbiAgICAgICAgICAgIG91dFsxXSA9IHRtcHZlYzNbMV07XG4gICAgICAgICAgICBvdXRbMl0gPSB0bXB2ZWMzWzJdO1xuICAgICAgICAgICAgb3V0WzNdID0gMSArIGRvdDtcbiAgICAgICAgICAgIHJldHVybiBxdWF0Lm5vcm1hbGl6ZShvdXQsIG91dCk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBzcGVjaWZpZWQgcXVhdGVybmlvbiB3aXRoIHZhbHVlcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlblxuICogYXhlcy4gRWFjaCBheGlzIGlzIGEgdmVjMyBhbmQgaXMgZXhwZWN0ZWQgdG8gYmUgdW5pdCBsZW5ndGggYW5kXG4gKiBwZXJwZW5kaWN1bGFyIHRvIGFsbCBvdGhlciBzcGVjaWZpZWQgYXhlcy5cbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IHZpZXcgIHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSB2aWV3aW5nIGRpcmVjdGlvblxuICogQHBhcmFtIHt2ZWMzfSByaWdodCB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJyaWdodFwiIGRpcmVjdGlvblxuICogQHBhcmFtIHt2ZWMzfSB1cCAgICB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJ1cFwiIGRpcmVjdGlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnNldEF4ZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1hdHIgPSBtYXQzLmNyZWF0ZSgpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG91dCwgdmlldywgcmlnaHQsIHVwKSB7XG4gICAgICAgIG1hdHJbMF0gPSByaWdodFswXTtcbiAgICAgICAgbWF0clszXSA9IHJpZ2h0WzFdO1xuICAgICAgICBtYXRyWzZdID0gcmlnaHRbMl07XG5cbiAgICAgICAgbWF0clsxXSA9IHVwWzBdO1xuICAgICAgICBtYXRyWzRdID0gdXBbMV07XG4gICAgICAgIG1hdHJbN10gPSB1cFsyXTtcblxuICAgICAgICBtYXRyWzJdID0gLXZpZXdbMF07XG4gICAgICAgIG1hdHJbNV0gPSAtdmlld1sxXTtcbiAgICAgICAgbWF0cls4XSA9IC12aWV3WzJdO1xuXG4gICAgICAgIHJldHVybiBxdWF0Lm5vcm1hbGl6ZShvdXQsIHF1YXQuZnJvbU1hdDMob3V0LCBtYXRyKSk7XG4gICAgfTtcbn0pKCk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBxdWF0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuY2xvbmUgPSB2ZWM0LmNsb25lO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmZyb21WYWx1ZXMgPSB2ZWM0LmZyb21WYWx1ZXM7XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHF1YXQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBzb3VyY2UgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuY29weSA9IHZlYzQuY29weTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBxdWF0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5zZXQgPSB2ZWM0LnNldDtcblxuLyoqXG4gKiBTZXQgYSBxdWF0IHRvIHRoZSBpZGVudGl0eSBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuaWRlbnRpdHkgPSBmdW5jdGlvbihvdXQpIHtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldHMgYSBxdWF0IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFuZCByb3RhdGlvbiBheGlzLFxuICogdGhlbiByZXR1cm5zIGl0LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIGFyb3VuZCB3aGljaCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIGluIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqKi9cbnF1YXQuc2V0QXhpc0FuZ2xlID0gZnVuY3Rpb24ob3V0LCBheGlzLCByYWQpIHtcbiAgICByYWQgPSByYWQgKiAwLjU7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpO1xuICAgIG91dFswXSA9IHMgKiBheGlzWzBdO1xuICAgIG91dFsxXSA9IHMgKiBheGlzWzFdO1xuICAgIG91dFsyXSA9IHMgKiBheGlzWzJdO1xuICAgIG91dFszXSA9IE1hdGguY29zKHJhZCk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmFkZCA9IHZlYzQuYWRkO1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQubXVsdGlwbHkgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICB2YXIgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdLFxuICAgICAgICBieCA9IGJbMF0sIGJ5ID0gYlsxXSwgYnogPSBiWzJdLCBidyA9IGJbM107XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5O1xuICAgIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYno7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieDtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0Lm11bCA9IHF1YXQubXVsdGlwbHk7XG5cbi8qKlxuICogU2NhbGVzIGEgcXVhdCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5zY2FsZSA9IHZlYzQuc2NhbGU7XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBYIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnJvdGF0ZVggPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICByYWQgKj0gMC41OyBcblxuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ4ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYng7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF6ICogYng7XG4gICAgb3V0WzJdID0gYXogKiBidyAtIGF5ICogYng7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYng7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnJvdGF0ZVkgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICByYWQgKj0gMC41OyBcblxuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ5ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnk7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF4ICogYnk7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF5ICogYnk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBaIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnJvdGF0ZVogPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICByYWQgKj0gMC41OyBcblxuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ6ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF5ICogYno7XG4gICAgb3V0WzFdID0gYXkgKiBidyAtIGF4ICogYno7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF3ICogYno7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF6ICogYno7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgVyBjb21wb25lbnQgb2YgYSBxdWF0IGZyb20gdGhlIFgsIFksIGFuZCBaIGNvbXBvbmVudHMuXG4gKiBBc3N1bWVzIHRoYXQgcXVhdGVybmlvbiBpcyAxIHVuaXQgaW4gbGVuZ3RoLlxuICogQW55IGV4aXN0aW5nIFcgY29tcG9uZW50IHdpbGwgYmUgaWdub3JlZC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBXIGNvbXBvbmVudCBvZlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LmNhbGN1bGF0ZVcgPSBmdW5jdGlvbiAob3V0LCBhKSB7XG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG5cbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSAtTWF0aC5zcXJ0KE1hdGguYWJzKDEuMCAtIHggKiB4IC0geSAqIHkgLSB6ICogeikpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmRvdCA9IHZlYzQuZG90O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmxlcnAgPSB2ZWM0LmxlcnA7XG5cbi8qKlxuICogUGVyZm9ybXMgYSBzcGhlcmljYWwgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuc2xlcnAgPSBmdW5jdGlvbiAob3V0LCBhLCBiLCB0KSB7XG4gICAgLy8gYmVuY2htYXJrczpcbiAgICAvLyAgICBodHRwOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXNsZXJwLWltcGxlbWVudGF0aW9uc1xuXG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXSxcbiAgICAgICAgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXSwgYncgPSBiWzNdO1xuXG4gICAgdmFyICAgICAgICBvbWVnYSwgY29zb20sIHNpbm9tLCBzY2FsZTAsIHNjYWxlMTtcblxuICAgIC8vIGNhbGMgY29zaW5lXG4gICAgY29zb20gPSBheCAqIGJ4ICsgYXkgKiBieSArIGF6ICogYnogKyBhdyAqIGJ3O1xuICAgIC8vIGFkanVzdCBzaWducyAoaWYgbmVjZXNzYXJ5KVxuICAgIGlmICggY29zb20gPCAwLjAgKSB7XG4gICAgICAgIGNvc29tID0gLWNvc29tO1xuICAgICAgICBieCA9IC0gYng7XG4gICAgICAgIGJ5ID0gLSBieTtcbiAgICAgICAgYnogPSAtIGJ6O1xuICAgICAgICBidyA9IC0gYnc7XG4gICAgfVxuICAgIC8vIGNhbGN1bGF0ZSBjb2VmZmljaWVudHNcbiAgICBpZiAoICgxLjAgLSBjb3NvbSkgPiAwLjAwMDAwMSApIHtcbiAgICAgICAgLy8gc3RhbmRhcmQgY2FzZSAoc2xlcnApXG4gICAgICAgIG9tZWdhICA9IE1hdGguYWNvcyhjb3NvbSk7XG4gICAgICAgIHNpbm9tICA9IE1hdGguc2luKG9tZWdhKTtcbiAgICAgICAgc2NhbGUwID0gTWF0aC5zaW4oKDEuMCAtIHQpICogb21lZ2EpIC8gc2lub207XG4gICAgICAgIHNjYWxlMSA9IE1hdGguc2luKHQgKiBvbWVnYSkgLyBzaW5vbTtcbiAgICB9IGVsc2UgeyAgICAgICAgXG4gICAgICAgIC8vIFwiZnJvbVwiIGFuZCBcInRvXCIgcXVhdGVybmlvbnMgYXJlIHZlcnkgY2xvc2UgXG4gICAgICAgIC8vICAuLi4gc28gd2UgY2FuIGRvIGEgbGluZWFyIGludGVycG9sYXRpb25cbiAgICAgICAgc2NhbGUwID0gMS4wIC0gdDtcbiAgICAgICAgc2NhbGUxID0gdDtcbiAgICB9XG4gICAgLy8gY2FsY3VsYXRlIGZpbmFsIHZhbHVlc1xuICAgIG91dFswXSA9IHNjYWxlMCAqIGF4ICsgc2NhbGUxICogYng7XG4gICAgb3V0WzFdID0gc2NhbGUwICogYXkgKyBzY2FsZTEgKiBieTtcbiAgICBvdXRbMl0gPSBzY2FsZTAgKiBheiArIHNjYWxlMSAqIGJ6O1xuICAgIG91dFszXSA9IHNjYWxlMCAqIGF3ICsgc2NhbGUxICogYnc7XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaW52ZXJzZSBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBpbnZlcnNlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSxcbiAgICAgICAgZG90ID0gYTAqYTAgKyBhMSphMSArIGEyKmEyICsgYTMqYTMsXG4gICAgICAgIGludkRvdCA9IGRvdCA/IDEuMC9kb3QgOiAwO1xuICAgIFxuICAgIC8vIFRPRE86IFdvdWxkIGJlIGZhc3RlciB0byByZXR1cm4gWzAsMCwwLDBdIGltbWVkaWF0ZWx5IGlmIGRvdCA9PSAwXG5cbiAgICBvdXRbMF0gPSAtYTAqaW52RG90O1xuICAgIG91dFsxXSA9IC1hMSppbnZEb3Q7XG4gICAgb3V0WzJdID0gLWEyKmludkRvdDtcbiAgICBvdXRbM10gPSBhMyppbnZEb3Q7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgY29uanVnYXRlIG9mIGEgcXVhdFxuICogSWYgdGhlIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0LmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5jb25qdWdhdGUgPSBmdW5jdGlvbiAob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubGVuZ3RoID0gdmVjNC5sZW5ndGg7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmxlbiA9IHF1YXQubGVuZ3RoO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5zcXVhcmVkTGVuZ3RoID0gdmVjNC5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc3FyTGVuID0gcXVhdC5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubm9ybWFsaXplID0gdmVjNC5ub3JtYWxpemU7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gM3gzIHJvdGF0aW9uIG1hdHJpeC5cbiAqXG4gKiBOT1RFOiBUaGUgcmVzdWx0YW50IHF1YXRlcm5pb24gaXMgbm90IG5vcm1hbGl6ZWQsIHNvIHlvdSBzaG91bGQgYmUgc3VyZVxuICogdG8gcmVub3JtYWxpemUgdGhlIHF1YXRlcm5pb24geW91cnNlbGYgd2hlcmUgbmVjZXNzYXJ5LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHttYXQzfSBtIHJvdGF0aW9uIG1hdHJpeFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuZnJvbU1hdDMgPSBmdW5jdGlvbihvdXQsIG0pIHtcbiAgICAvLyBBbGdvcml0aG0gaW4gS2VuIFNob2VtYWtlJ3MgYXJ0aWNsZSBpbiAxOTg3IFNJR0dSQVBIIGNvdXJzZSBub3Rlc1xuICAgIC8vIGFydGljbGUgXCJRdWF0ZXJuaW9uIENhbGN1bHVzIGFuZCBGYXN0IEFuaW1hdGlvblwiLlxuICAgIHZhciBmVHJhY2UgPSBtWzBdICsgbVs0XSArIG1bOF07XG4gICAgdmFyIGZSb290O1xuXG4gICAgaWYgKCBmVHJhY2UgPiAwLjAgKSB7XG4gICAgICAgIC8vIHx3fCA+IDEvMiwgbWF5IGFzIHdlbGwgY2hvb3NlIHcgPiAxLzJcbiAgICAgICAgZlJvb3QgPSBNYXRoLnNxcnQoZlRyYWNlICsgMS4wKTsgIC8vIDJ3XG4gICAgICAgIG91dFszXSA9IDAuNSAqIGZSb290O1xuICAgICAgICBmUm9vdCA9IDAuNS9mUm9vdDsgIC8vIDEvKDR3KVxuICAgICAgICBvdXRbMF0gPSAobVs3XS1tWzVdKSpmUm9vdDtcbiAgICAgICAgb3V0WzFdID0gKG1bMl0tbVs2XSkqZlJvb3Q7XG4gICAgICAgIG91dFsyXSA9IChtWzNdLW1bMV0pKmZSb290O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHx3fCA8PSAxLzJcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICBpZiAoIG1bNF0gPiBtWzBdIClcbiAgICAgICAgICBpID0gMTtcbiAgICAgICAgaWYgKCBtWzhdID4gbVtpKjMraV0gKVxuICAgICAgICAgIGkgPSAyO1xuICAgICAgICB2YXIgaiA9IChpKzEpJTM7XG4gICAgICAgIHZhciBrID0gKGkrMiklMztcbiAgICAgICAgXG4gICAgICAgIGZSb290ID0gTWF0aC5zcXJ0KG1baSozK2ldLW1baiozK2pdLW1bayozK2tdICsgMS4wKTtcbiAgICAgICAgb3V0W2ldID0gMC41ICogZlJvb3Q7XG4gICAgICAgIGZSb290ID0gMC41IC8gZlJvb3Q7XG4gICAgICAgIG91dFszXSA9IChtW2sqMytqXSAtIG1baiozK2tdKSAqIGZSb290O1xuICAgICAgICBvdXRbal0gPSAobVtqKjMraV0gKyBtW2kqMytqXSkgKiBmUm9vdDtcbiAgICAgICAgb3V0W2tdID0gKG1bayozK2ldICsgbVtpKjMra10pICogZlJvb3Q7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBxdWF0ZW5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IHZlYyB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG5xdWF0LnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICdxdWF0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMucXVhdCA9IHF1YXQ7XG59XG47XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiAgfSkoc2hpbS5leHBvcnRzKTtcbn0pKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgc2xpY2UgPSBbXS5zbGljZTtcblxuICBmdW5jdGlvbiBxdWV1ZShwYXJhbGxlbGlzbSkge1xuICAgIHZhciBxLFxuICAgICAgICB0YXNrcyA9IFtdLFxuICAgICAgICBzdGFydGVkID0gMCwgLy8gbnVtYmVyIG9mIHRhc2tzIHRoYXQgaGF2ZSBiZWVuIHN0YXJ0ZWQgKGFuZCBwZXJoYXBzIGZpbmlzaGVkKVxuICAgICAgICBhY3RpdmUgPSAwLCAvLyBudW1iZXIgb2YgdGFza3MgY3VycmVudGx5IGJlaW5nIGV4ZWN1dGVkIChzdGFydGVkIGJ1dCBub3QgZmluaXNoZWQpXG4gICAgICAgIHJlbWFpbmluZyA9IDAsIC8vIG51bWJlciBvZiB0YXNrcyBub3QgeWV0IGZpbmlzaGVkXG4gICAgICAgIHBvcHBpbmcsIC8vIGluc2lkZSBhIHN5bmNocm9ub3VzIHRhc2sgY2FsbGJhY2s/XG4gICAgICAgIGVycm9yID0gbnVsbCxcbiAgICAgICAgYXdhaXQgPSBub29wLFxuICAgICAgICBhbGw7XG5cbiAgICBpZiAoIXBhcmFsbGVsaXNtKSBwYXJhbGxlbGlzbSA9IEluZmluaXR5O1xuXG4gICAgZnVuY3Rpb24gcG9wKCkge1xuICAgICAgd2hpbGUgKHBvcHBpbmcgPSBzdGFydGVkIDwgdGFza3MubGVuZ3RoICYmIGFjdGl2ZSA8IHBhcmFsbGVsaXNtKSB7XG4gICAgICAgIHZhciBpID0gc3RhcnRlZCsrLFxuICAgICAgICAgICAgdCA9IHRhc2tzW2ldLFxuICAgICAgICAgICAgYSA9IHNsaWNlLmNhbGwodCwgMSk7XG4gICAgICAgIGEucHVzaChjYWxsYmFjayhpKSk7XG4gICAgICAgICsrYWN0aXZlO1xuICAgICAgICB0WzBdLmFwcGx5KG51bGwsIGEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGxiYWNrKGkpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlLCByKSB7XG4gICAgICAgIC0tYWN0aXZlO1xuICAgICAgICBpZiAoZXJyb3IgIT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICBpZiAoZSAhPSBudWxsKSB7XG4gICAgICAgICAgZXJyb3IgPSBlOyAvLyBpZ25vcmUgbmV3IHRhc2tzIGFuZCBzcXVlbGNoIGFjdGl2ZSBjYWxsYmFja3NcbiAgICAgICAgICBzdGFydGVkID0gcmVtYWluaW5nID0gTmFOOyAvLyBzdG9wIHF1ZXVlZCB0YXNrcyBmcm9tIHN0YXJ0aW5nXG4gICAgICAgICAgbm90aWZ5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFza3NbaV0gPSByO1xuICAgICAgICAgIGlmICgtLXJlbWFpbmluZykgcG9wcGluZyB8fCBwb3AoKTtcbiAgICAgICAgICBlbHNlIG5vdGlmeSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vdGlmeSgpIHtcbiAgICAgIGlmIChlcnJvciAhPSBudWxsKSBhd2FpdChlcnJvcik7XG4gICAgICBlbHNlIGlmIChhbGwpIGF3YWl0KGVycm9yLCB0YXNrcyk7XG4gICAgICBlbHNlIGF3YWl0LmFwcGx5KG51bGwsIFtlcnJvcl0uY29uY2F0KHRhc2tzKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHEgPSB7XG4gICAgICBkZWZlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgICB0YXNrcy5wdXNoKGFyZ3VtZW50cyk7XG4gICAgICAgICAgKytyZW1haW5pbmc7XG4gICAgICAgICAgcG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgICB9LFxuICAgICAgYXdhaXQ6IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgYXdhaXQgPSBmO1xuICAgICAgICBhbGwgPSBmYWxzZTtcbiAgICAgICAgaWYgKCFyZW1haW5pbmcpIG5vdGlmeSgpO1xuICAgICAgICByZXR1cm4gcTtcbiAgICAgIH0sXG4gICAgICBhd2FpdEFsbDogZnVuY3Rpb24oZikge1xuICAgICAgICBhd2FpdCA9IGY7XG4gICAgICAgIGFsbCA9IHRydWU7XG4gICAgICAgIGlmICghcmVtYWluaW5nKSBub3RpZnkoKTtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4gIHF1ZXVlLnZlcnNpb24gPSBcIjEuMC43XCI7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gcXVldWU7IH0pO1xuICBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IHF1ZXVlO1xuICBlbHNlIHRoaXMucXVldWUgPSBxdWV1ZTtcbn0pKCk7XG4iLCIvLyBNaXNjZWxsYW5lb3VzIGdlbyBmdW5jdGlvbnNcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vcG9pbnQuanMnKTtcblxudmFyIEdlbyA9IHt9O1xuXG4vLyBQcm9qZWN0aW9uIGNvbnN0YW50c1xuR2VvLnRpbGVfc2l6ZSA9IDI1Njtcbkdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzID0gMjAwMzc1MDguMzQyNzg5MjQ0O1xuR2VvLm1hcF9vcmlnaW5fbWV0ZXJzID0gUG9pbnQoLUdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzLCBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyk7XG5HZW8ubWluX3pvb21fbWV0ZXJzX3Blcl9waXhlbCA9IEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzICogMiAvIEdlby50aWxlX3NpemU7IC8vIG1pbiB6b29tIGRyYXdzIHdvcmxkIGFzIDIgdGlsZXMgd2lkZVxuR2VvLm1ldGVyc19wZXJfcGl4ZWwgPSBbXTtcbkdlby5tYXhfem9vbSA9IDIwO1xuZm9yICh2YXIgej0wOyB6IDw9IEdlby5tYXhfem9vbTsgeisrKSB7XG4gICAgR2VvLm1ldGVyc19wZXJfcGl4ZWxbel0gPSBHZW8ubWluX3pvb21fbWV0ZXJzX3Blcl9waXhlbCAvIE1hdGgucG93KDIsIHopO1xufVxuXG4vLyBDb252ZXJzaW9uIGZ1bmN0aW9ucyBiYXNlZCBvbiBhbiBkZWZpbmVkIHRpbGUgc2NhbGVcbkdlby51bml0c19wZXJfbWV0ZXIgPSBbXTtcbkdlby5zZXRUaWxlU2NhbGUgPSBmdW5jdGlvbihzY2FsZSlcbntcbiAgICBHZW8udGlsZV9zY2FsZSA9IHNjYWxlO1xuICAgIEdlby51bml0c19wZXJfcGl4ZWwgPSBHZW8udGlsZV9zY2FsZSAvIEdlby50aWxlX3NpemU7XG5cbiAgICBmb3IgKHZhciB6PTA7IHogPD0gR2VvLm1heF96b29tOyB6KyspIHtcbiAgICAgICAgR2VvLnVuaXRzX3Blcl9tZXRlclt6XSA9IEdlby50aWxlX3NjYWxlIC8gKEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt6XSk7XG4gICAgfVxufTtcblxuLy8gQ29udmVydCB0aWxlIGxvY2F0aW9uIHRvIG1lcmNhdG9yIG1ldGVycyAtIG11bHRpcGx5IGJ5IHBpeGVscyBwZXIgdGlsZSwgdGhlbiBieSBtZXRlcnMgcGVyIHBpeGVsLCBhZGp1c3QgZm9yIG1hcCBvcmlnaW5cbkdlby5tZXRlcnNGb3JUaWxlID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgcmV0dXJuIFBvaW50KFxuICAgICAgICAodGlsZS54ICogR2VvLnRpbGVfc2l6ZSAqIEdlby5tZXRlcnNfcGVyX3BpeGVsW3RpbGUuel0pICsgR2VvLm1hcF9vcmlnaW5fbWV0ZXJzLngsXG4gICAgICAgICgodGlsZS55ICogR2VvLnRpbGVfc2l6ZSAqIEdlby5tZXRlcnNfcGVyX3BpeGVsW3RpbGUuel0pICogLTEpICsgR2VvLm1hcF9vcmlnaW5fbWV0ZXJzLnlcbiAgICApO1xufTtcblxuLy8gQ29udmVydCBtZXJjYXRvciBtZXRlcnMgdG8gbGF0LWxuZ1xuR2VvLm1ldGVyc1RvTGF0TG5nID0gZnVuY3Rpb24gKG1ldGVycylcbntcbiAgICB2YXIgYyA9IFBvaW50LmNvcHkobWV0ZXJzKTtcblxuICAgIGMueCAvPSBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycztcbiAgICBjLnkgLz0gR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnM7XG5cbiAgICBjLnkgPSAoMiAqIE1hdGguYXRhbihNYXRoLmV4cChjLnkgKiBNYXRoLlBJKSkgLSAoTWF0aC5QSSAvIDIpKSAvIE1hdGguUEk7XG5cbiAgICBjLnggKj0gMTgwO1xuICAgIGMueSAqPSAxODA7XG5cbiAgICByZXR1cm4gYztcbn07XG5cbi8vIENvbnZlcnQgbGF0LWxuZyB0byBtZXJjYXRvciBtZXRlcnNcbkdlby5sYXRMbmdUb01ldGVycyA9IGZ1bmN0aW9uKGxhdGxuZylcbntcbiAgICB2YXIgYyA9IFBvaW50LmNvcHkobGF0bG5nKTtcblxuICAgIC8vIExhdGl0dWRlXG4gICAgYy55ID0gTWF0aC5sb2coTWF0aC50YW4oKGMueSArIDkwKSAqIE1hdGguUEkgLyAzNjApKSAvIChNYXRoLlBJIC8gMTgwKTtcbiAgICBjLnkgPSBjLnkgKiBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAvIDE4MDtcblxuICAgIC8vIExvbmdpdHVkZVxuICAgIGMueCA9IGMueCAqIEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzIC8gMTgwO1xuXG4gICAgcmV0dXJuIGM7XG59O1xuXG4vLyBSdW4gYSB0cmFuc2Zvcm0gZnVuY3Rpb24gb24gZWFjaCBjb29vcmRpbmF0ZSBpbiBhIEdlb0pTT04gZ2VvbWV0cnlcbkdlby50cmFuc2Zvcm1HZW9tZXRyeSA9IGZ1bmN0aW9uIChnZW9tZXRyeSwgdHJhbnNmb3JtKVxue1xuICAgIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2ludCcpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybShnZW9tZXRyeS5jb29yZGluYXRlcyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnIHx8IGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9pbnQnKSB7XG4gICAgICAgIHJldHVybiBnZW9tZXRyeS5jb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgfHwgZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlMaW5lU3RyaW5nJykge1xuICAgICAgICByZXR1cm4gZ2VvbWV0cnkuY29vcmRpbmF0ZXMubWFwKGZ1bmN0aW9uIChjb29yZGluYXRlcykge1xuICAgICAgICAgICAgcmV0dXJuIGNvb3JkaW5hdGVzLm1hcCh0cmFuc2Zvcm0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2x5Z29uJykge1xuICAgICAgICByZXR1cm4gZ2VvbWV0cnkuY29vcmRpbmF0ZXMubWFwKGZ1bmN0aW9uIChwb2x5Z29uKSB7XG4gICAgICAgICAgICByZXR1cm4gcG9seWdvbi5tYXAoZnVuY3Rpb24gKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvb3JkaW5hdGVzLm1hcCh0cmFuc2Zvcm0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBUT0RPOiBzdXBwb3J0IEdlb21ldHJ5Q29sbGVjdGlvblxuICAgIHJldHVybiB7fTtcbn07XG5cbkdlby5ib3hJbnRlcnNlY3QgPSBmdW5jdGlvbiAoYjEsIGIyKVxue1xuICAgIHJldHVybiAhKFxuICAgICAgICBiMi5zdy54ID4gYjEubmUueCB8fFxuICAgICAgICBiMi5uZS54IDwgYjEuc3cueCB8fFxuICAgICAgICBiMi5zdy55ID4gYjEubmUueSB8fFxuICAgICAgICBiMi5uZS55IDwgYjEuc3cueVxuICAgICk7XG59O1xuXG4vLyBTcGxpdCB0aGUgbGluZXMgb2YgYSBmZWF0dXJlIHdoZXJldmVyIHR3byBwb2ludHMgYXJlIGZhcnRoZXIgYXBhcnQgdGhhbiBhIGdpdmVuIHRvbGVyYW5jZVxuR2VvLnNwbGl0RmVhdHVyZUxpbmVzICA9IGZ1bmN0aW9uIChmZWF0dXJlLCB0b2xlcmFuY2UpIHtcbiAgICB2YXIgdG9sZXJhbmNlID0gdG9sZXJhbmNlIHx8IDAuMDAxO1xuICAgIHZhciB0b2xlcmFuY2Vfc3EgPSB0b2xlcmFuY2UgKiB0b2xlcmFuY2U7XG4gICAgdmFyIGdlb20gPSBmZWF0dXJlLmdlb21ldHJ5O1xuICAgIHZhciBsaW5lcztcblxuICAgIGlmIChnZW9tLnR5cGUgPT0gJ011bHRpTGluZVN0cmluZycpIHtcbiAgICAgICAgbGluZXMgPSBnZW9tLmNvb3JkaW5hdGVzO1xuICAgIH1cbiAgICBlbHNlIGlmIChnZW9tLnR5cGUgPT0nTGluZVN0cmluZycpIHtcbiAgICAgICAgbGluZXMgPSBbZ2VvbS5jb29yZGluYXRlc107XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gZmVhdHVyZTtcbiAgICB9XG5cbiAgICB2YXIgc3BsaXRfbGluZXMgPSBbXTtcblxuICAgIGZvciAodmFyIHM9MDsgcyA8IGxpbmVzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgIHZhciBzZWcgPSBsaW5lc1tzXTtcbiAgICAgICAgdmFyIHNwbGl0X3NlZyA9IFtdO1xuICAgICAgICB2YXIgbGFzdF9jb29yZCA9IG51bGw7XG4gICAgICAgIHZhciBrZWVwO1xuXG4gICAgICAgIGZvciAodmFyIGM9MDsgYyA8IHNlZy5sZW5ndGg7IGMrKykge1xuICAgICAgICAgICAgdmFyIGNvb3JkID0gc2VnW2NdO1xuICAgICAgICAgICAga2VlcCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChsYXN0X2Nvb3JkICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlzdCA9IChjb29yZFswXSAtIGxhc3RfY29vcmRbMF0pICogKGNvb3JkWzBdIC0gbGFzdF9jb29yZFswXSkgKyAoY29vcmRbMV0gLSBsYXN0X2Nvb3JkWzFdKSAqIChjb29yZFsxXSAtIGxhc3RfY29vcmRbMV0pO1xuICAgICAgICAgICAgICAgIGlmIChkaXN0ID4gdG9sZXJhbmNlX3NxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwic3BsaXQgbGluZXMgYXQgKFwiICsgY29vcmRbMF0gKyBcIiwgXCIgKyBjb29yZFsxXSArIFwiKSwgXCIgKyBNYXRoLnNxcnQoZGlzdCkgKyBcIiBhcGFydFwiKTtcbiAgICAgICAgICAgICAgICAgICAga2VlcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGtlZXAgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBzcGxpdF9saW5lcy5wdXNoKHNwbGl0X3NlZyk7XG4gICAgICAgICAgICAgICAgc3BsaXRfc2VnID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzcGxpdF9zZWcucHVzaChjb29yZCk7XG5cbiAgICAgICAgICAgIGxhc3RfY29vcmQgPSBjb29yZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHNwbGl0X2xpbmVzLnB1c2goc3BsaXRfc2VnKTtcbiAgICAgICAgc3BsaXRfc2VnID0gW107XG4gICAgfVxuXG4gICAgaWYgKHNwbGl0X2xpbmVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIGdlb20udHlwZSA9ICdMaW5lU3RyaW5nJztcbiAgICAgICAgZ2VvbS5jb29yZGluYXRlcyA9IHNwbGl0X2xpbmVzWzBdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZ2VvbS50eXBlID0gJ011bHRpTGluZVN0cmluZyc7XG4gICAgICAgIGdlb20uY29vcmRpbmF0ZXMgPSBzcGxpdF9saW5lcztcbiAgICB9XG5cbiAgICByZXR1cm4gZmVhdHVyZTtcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gR2VvO1xufVxuIiwiLy8gV2ViR0wgbWFuYWdlbWVudCBhbmQgcmVuZGVyaW5nIGZ1bmN0aW9uc1xuXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xuLy8gdmFyIEdMVmVydGV4QXJyYXlPYmplY3QgPSByZXF1aXJlKCcuL2dsX3Zhby5qcycpO1xuXG52YXIgR0wgPSB7fTtcblxuLy8gU2V0dXAgYSBXZWJHTCBjb250ZXh0XG4vLyBJZiBubyBjYW52YXMgZWxlbWVudCBpcyBwcm92aWRlZCwgb25lIGlzIGNyZWF0ZWQgYW5kIGFkZGVkIHRvIHRoZSBkb2N1bWVudCBib2R5XG5HTC5nZXRDb250ZXh0ID0gZnVuY3Rpb24gZ2V0Q29udGV4dCAoY2FudmFzKVxue1xuICAgIHZhciBjYW52YXMgPSBjYW52YXM7XG4gICAgdmFyIGZ1bGxzY3JlZW4gPSBmYWxzZTtcbiAgICBpZiAoY2FudmFzID09IG51bGwpIHtcbiAgICAgICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIGNhbnZhcy5zdHlsZS50b3AgPSAwO1xuICAgICAgICBjYW52YXMuc3R5bGUubGVmdCA9IDA7XG4gICAgICAgIGNhbnZhcy5zdHlsZS56SW5kZXggPSAtMTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgICAgICBmdWxsc2NyZWVuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dCgnZXhwZXJpbWVudGFsLXdlYmdsJyk7XG4gICAgaWYgKCFnbCkge1xuICAgICAgICBhbGVydChcIkNvdWxkbid0IGNyZWF0ZSBXZWJHTCBjb250ZXh0LiBZb3VyIGJyb3dzZXIgcHJvYmFibHkgZG9lc24ndCBzdXBwb3J0IFdlYkdMIG9yIGl0J3MgdHVybmVkIG9mZj9cIik7XG4gICAgICAgIHRocm93IFwiQ291bGRuJ3QgY3JlYXRlIFdlYkdMIGNvbnRleHRcIjtcbiAgICB9XG5cbiAgICBHTC5yZXNpemVDYW52YXMoZ2wsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIGlmIChmdWxsc2NyZWVuID09IHRydWUpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIEdMLnJlc2l6ZUNhbnZhcyhnbCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEdMVmVydGV4QXJyYXlPYmplY3QuaW5pdChnbCk7IC8vIFRPRE86IHRoaXMgcGF0dGVybiBkb2Vzbid0IHN1cHBvcnQgbXVsdGlwbGUgYWN0aXZlIEdMIGNvbnRleHRzLCBzaG91bGQgdGhhdCBldmVuIGJlIHN1cHBvcnRlZD9cblxuICAgIHJldHVybiBnbDtcbn07XG5cbkdMLnJlc2l6ZUNhbnZhcyA9IGZ1bmN0aW9uIChnbCwgd2lkdGgsIGhlaWdodClcbntcbiAgICB2YXIgZGV2aWNlX3BpeGVsX3JhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICBnbC5jYW52YXMuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCc7XG4gICAgZ2wuY2FudmFzLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gICAgZ2wuY2FudmFzLndpZHRoID0gTWF0aC5yb3VuZChnbC5jYW52YXMuc3R5bGUud2lkdGggKiBkZXZpY2VfcGl4ZWxfcmF0aW8pO1xuICAgIGdsLmNhbnZhcy5oZWlnaHQgPSBNYXRoLnJvdW5kKGdsLmNhbnZhcy5zdHlsZS53aWR0aCAqIGRldmljZV9waXhlbF9yYXRpbyk7XG4gICAgZ2wudmlld3BvcnQoMCwgMCwgZ2wuY2FudmFzLndpZHRoLCBnbC5jYW52YXMuaGVpZ2h0KTtcbn07XG5cbi8vIENvbXBpbGUgJiBsaW5rIGEgV2ViR0wgcHJvZ3JhbSBmcm9tIHByb3ZpZGVkIHZlcnRleCBhbmQgZnJhZ21lbnQgc2hhZGVyIHNvdXJjZXNcbi8vIHVwZGF0ZSBhIHByb2dyYW0gaWYgb25lIGlzIHBhc3NlZCBpbi4gQ3JlYXRlIG9uZSBpZiBub3QuIEFsZXJ0IGFuZCBkb24ndCB1cGRhdGUgYW55dGhpbmcgaWYgdGhlIHNoYWRlcnMgZG9uJ3QgY29tcGlsZS5cbkdMLnVwZGF0ZVByb2dyYW0gPSBmdW5jdGlvbiBHTHVwZGF0ZVByb2dyYW0gKGdsLCBwcm9ncmFtLCB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSlcbntcbiAgICB0cnkge1xuICAgICAgICB2YXIgdmVydGV4X3NoYWRlciA9IEdMLmNyZWF0ZVNoYWRlcihnbCwgdmVydGV4X3NoYWRlcl9zb3VyY2UsIGdsLlZFUlRFWF9TSEFERVIpO1xuICAgICAgICB2YXIgZnJhZ21lbnRfc2hhZGVyID0gR0wuY3JlYXRlU2hhZGVyKGdsLCAnI2lmZGVmIEdMX0VTXFxucHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xcbiNlbmRpZlxcblxcbicgKyBmcmFnbWVudF9zaGFkZXJfc291cmNlLCBnbC5GUkFHTUVOVF9TSEFERVIpO1xuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgLy8gYWxlcnQoZXJyKTtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmV0dXJuIHByb2dyYW07XG4gICAgfVxuXG4gICAgZ2wudXNlUHJvZ3JhbShudWxsKTtcbiAgICBpZiAocHJvZ3JhbSAhPSBudWxsKSB7XG4gICAgICAgIHZhciBvbGRfc2hhZGVycyA9IGdsLmdldEF0dGFjaGVkU2hhZGVycyhwcm9ncmFtKTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IG9sZF9zaGFkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBnbC5kZXRhY2hTaGFkZXIocHJvZ3JhbSwgb2xkX3NoYWRlcnNbaV0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICB9XG5cbiAgICBpZiAodmVydGV4X3NoYWRlciA9PSBudWxsIHx8IGZyYWdtZW50X3NoYWRlciA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cblxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0ZXhfc2hhZGVyKTtcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnJhZ21lbnRfc2hhZGVyKTtcblxuICAgIGdsLmRlbGV0ZVNoYWRlcih2ZXJ0ZXhfc2hhZGVyKTtcbiAgICBnbC5kZWxldGVTaGFkZXIoZnJhZ21lbnRfc2hhZGVyKTtcblxuICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xuXG4gICAgaWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xuICAgICAgICB2YXIgcHJvZ3JhbV9lcnJvciA9XG4gICAgICAgICAgICBcIldlYkdMIHByb2dyYW0gZXJyb3I6XFxuXCIgK1xuICAgICAgICAgICAgXCJWQUxJREFURV9TVEFUVVM6IFwiICsgZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5WQUxJREFURV9TVEFUVVMpICsgXCJcXG5cIiArXG4gICAgICAgICAgICBcIkVSUk9SOiBcIiArIGdsLmdldEVycm9yKCkgKyBcIlxcblxcblwiICtcbiAgICAgICAgICAgIFwiLS0tIFZlcnRleCBTaGFkZXIgLS0tXFxuXCIgKyB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSArIFwiXFxuXFxuXCIgK1xuICAgICAgICAgICAgXCItLS0gRnJhZ21lbnQgU2hhZGVyIC0tLVxcblwiICsgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZTtcbiAgICAgICAgY29uc29sZS5sb2cocHJvZ3JhbV9lcnJvcik7XG4gICAgICAgIHRocm93IHByb2dyYW1fZXJyb3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2dyYW07XG59O1xuXG4vLyBDb21waWxlIGEgdmVydGV4IG9yIGZyYWdtZW50IHNoYWRlciBmcm9tIHByb3ZpZGVkIHNvdXJjZVxuR0wuY3JlYXRlU2hhZGVyID0gZnVuY3Rpb24gR0xjcmVhdGVTaGFkZXIgKGdsLCBzb3VyY2UsIHR5cGUpXG57XG4gICAgdmFyIHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcblxuICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNvdXJjZSk7XG4gICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuXG4gICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcbiAgICAgICAgdmFyIHNoYWRlcl9lcnJvciA9XG4gICAgICAgICAgICBcIldlYkdMIHNoYWRlciBlcnJvcjpcXG5cIiArXG4gICAgICAgICAgICAodHlwZSA9PSBnbC5WRVJURVhfU0hBREVSID8gXCJWRVJURVhcIiA6IFwiRlJBR01FTlRcIikgKyBcIiBTSEFERVI6XFxuXCIgK1xuICAgICAgICAgICAgZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpO1xuICAgICAgICB0aHJvdyBzaGFkZXJfZXJyb3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNoYWRlcjtcbn07XG5cbi8vIFRyaWFuZ3VsYXRpb24gdXNpbmcgbGlidGVzcy5qcyBwb3J0IG9mIGdsdVRlc3NlbGF0b3Jcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9icmVuZGFua2VubnkvbGlidGVzcy5qc1xudHJ5IHtcbiAgICBHTC50ZXNzZWxhdG9yID0gKGZ1bmN0aW9uIGluaXRUZXNzZWxhdG9yKCkge1xuICAgICAgICB2YXIgdGVzc2VsYXRvciA9IG5ldyBsaWJ0ZXNzLkdsdVRlc3NlbGF0b3IoKTtcblxuICAgICAgICAvLyBDYWxsZWQgZm9yIGVhY2ggdmVydGV4IG9mIHRlc3NlbGF0b3Igb3V0cHV0XG4gICAgICAgIGZ1bmN0aW9uIHZlcnRleENhbGxiYWNrKGRhdGEsIHBvbHlWZXJ0QXJyYXkpIHtcbiAgICAgICAgICAgIGlmICh0ZXNzZWxhdG9yLnogIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHBvbHlWZXJ0QXJyYXkucHVzaChbZGF0YVswXSwgZGF0YVsxXSwgdGVzc2VsYXRvci56XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBwb2x5VmVydEFycmF5LnB1c2goW2RhdGFbMF0sIGRhdGFbMV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbGxlZCB3aGVuIHNlZ21lbnRzIGludGVyc2VjdCBhbmQgbXVzdCBiZSBzcGxpdFxuICAgICAgICBmdW5jdGlvbiBjb21iaW5lQ2FsbGJhY2soY29vcmRzLCBkYXRhLCB3ZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZHM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxsZWQgd2hlbiBhIHZlcnRleCBzdGFydHMgb3Igc3RvcHMgYSBib3VuZGFyeSBlZGdlIG9mIGEgcG9seWdvblxuICAgICAgICBmdW5jdGlvbiBlZGdlQ2FsbGJhY2soZmxhZykge1xuICAgICAgICAgICAgLy8gTm8tb3AgY2FsbGJhY2sgdG8gZm9yY2Ugc2ltcGxlIHRyaWFuZ2xlIHByaW1pdGl2ZXMgKG5vIHRyaWFuZ2xlIHN0cmlwcyBvciBmYW5zKS5cbiAgICAgICAgICAgIC8vIFNlZTogaHR0cDovL3d3dy5nbHByb2dyYW1taW5nLmNvbS9yZWQvY2hhcHRlcjExLmh0bWxcbiAgICAgICAgICAgIC8vIFwiU2luY2UgZWRnZSBmbGFncyBtYWtlIG5vIHNlbnNlIGluIGEgdHJpYW5nbGUgZmFuIG9yIHRyaWFuZ2xlIHN0cmlwLCBpZiB0aGVyZSBpcyBhIGNhbGxiYWNrXG4gICAgICAgICAgICAvLyBhc3NvY2lhdGVkIHdpdGggR0xVX1RFU1NfRURHRV9GTEFHIHRoYXQgZW5hYmxlcyBlZGdlIGZsYWdzLCB0aGUgR0xVX1RFU1NfQkVHSU4gY2FsbGJhY2sgaXNcbiAgICAgICAgICAgIC8vIGNhbGxlZCBvbmx5IHdpdGggR0xfVFJJQU5HTEVTLlwiXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnR0wudGVzc2VsYXRvcjogZWRnZSBmbGFnOiAnICsgZmxhZyk7XG4gICAgICAgIH1cblxuICAgICAgICB0ZXNzZWxhdG9yLmdsdVRlc3NDYWxsYmFjayhsaWJ0ZXNzLmdsdUVudW0uR0xVX1RFU1NfVkVSVEVYX0RBVEEsIHZlcnRleENhbGxiYWNrKTtcbiAgICAgICAgdGVzc2VsYXRvci5nbHVUZXNzQ2FsbGJhY2sobGlidGVzcy5nbHVFbnVtLkdMVV9URVNTX0NPTUJJTkUsIGNvbWJpbmVDYWxsYmFjayk7XG4gICAgICAgIHRlc3NlbGF0b3IuZ2x1VGVzc0NhbGxiYWNrKGxpYnRlc3MuZ2x1RW51bS5HTFVfVEVTU19FREdFX0ZMQUcsIGVkZ2VDYWxsYmFjayk7XG5cbiAgICAgICAgLy8gQnJlbmRhbiBLZW5ueTpcbiAgICAgICAgLy8gbGlidGVzcyB3aWxsIHRha2UgM2QgdmVydHMgYW5kIGZsYXR0ZW4gdG8gYSBwbGFuZSBmb3IgdGVzc2VsYXRpb25cbiAgICAgICAgLy8gc2luY2Ugb25seSBkb2luZyAyZCB0ZXNzZWxhdGlvbiBoZXJlLCBwcm92aWRlIHo9MSBub3JtYWwgdG8gc2tpcFxuICAgICAgICAvLyBpdGVyYXRpbmcgb3ZlciB2ZXJ0cyBvbmx5IHRvIGdldCB0aGUgc2FtZSBhbnN3ZXIuXG4gICAgICAgIC8vIGNvbW1lbnQgb3V0IHRvIHRlc3Qgbm9ybWFsLWdlbmVyYXRpb24gY29kZVxuICAgICAgICB0ZXNzZWxhdG9yLmdsdVRlc3NOb3JtYWwoMCwgMCwgMSk7XG5cbiAgICAgICAgcmV0dXJuIHRlc3NlbGF0b3I7XG4gICAgfSkoKTtcblxuICAgIEdMLnRyaWFuZ3VsYXRlUG9seWdvbiA9IGZ1bmN0aW9uIEdMVHJpYW5ndWxhdGUgKGNvbnRvdXJzLCB6KVxuICAgIHtcbiAgICAgICAgdmFyIHRyaWFuZ2xlVmVydHMgPSBbXTtcbiAgICAgICAgR0wudGVzc2VsYXRvci56ID0gejtcbiAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzQmVnaW5Qb2x5Z29uKHRyaWFuZ2xlVmVydHMpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29udG91cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc0JlZ2luQ29udG91cigpO1xuICAgICAgICAgICAgdmFyIGNvbnRvdXIgPSBjb250b3Vyc1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29udG91ci5sZW5ndGg7IGogKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY29vcmRzID0gW2NvbnRvdXJbal1bMF0sIGNvbnRvdXJbal1bMV0sIDBdO1xuICAgICAgICAgICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc1ZlcnRleChjb29yZHMsIGNvb3Jkcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NFbmRDb250b3VyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NFbmRQb2x5Z29uKCk7XG4gICAgICAgIHJldHVybiB0cmlhbmdsZVZlcnRzO1xuICAgIH07XG59XG5jYXRjaCAoZSkge1xuICAgIC8vIGNvbnNvbGUubG9nKFwibGlidGVzcyBub3QgZGVmaW5lZCFcIik7XG4gICAgLy8gc2tpcCBpZiBsaWJ0ZXNzIG5vdCBkZWZpbmVkXG59XG5cbi8vIEFkZCB2ZXJ0aWNlcyB0byBhbiBhcnJheSAoZGVzdGluZWQgdG8gYmUgdXNlZCBhcyBhIEdMIGJ1ZmZlciksICdzdHJpcGluZycgZWFjaCB2ZXJ0ZXggd2l0aCBjb25zdGFudCBkYXRhXG4vLyBQZXItdmVydGV4IGF0dHJpYnV0ZXMgbXVzdCBiZSBwcmUtcGFja2VkIGludG8gdGhlIHZlcnRpY2VzIGFycmF5XG4vLyBVc2VkIGZvciBhZGRpbmcgdmFsdWVzIHRoYXQgYXJlIG9mdGVuIGNvbnN0YW50IHBlciBnZW9tZXRyeSBvciBwb2x5Z29uLCBsaWtlIGNvbG9ycywgbm9ybWFscyAoZm9yIHBvbHlzIHNpdHRpbmcgZmxhdCBvbiBtYXApLCBsYXllciBhbmQgbWF0ZXJpYWwgaW5mbywgZXRjLlxuR0wuYWRkVmVydGljZXMgPSBmdW5jdGlvbiAodmVydGljZXMsIHZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKVxue1xuICAgIGlmICh2ZXJ0aWNlcyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbiAgICB9XG4gICAgdmVydGV4X2NvbnN0YW50cyA9IHZlcnRleF9jb25zdGFudHMgfHwgW107XG5cbiAgICBmb3IgKHZhciB2PTAsIHZsZW4gPSB2ZXJ0aWNlcy5sZW5ndGg7IHYgPCB2bGVuOyB2KyspIHtcbiAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgdmVydGljZXNbdl0pO1xuICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCB2ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBBZGQgdmVydGljZXMgdG8gYW4gYXJyYXksICdzdHJpcGluZycgZWFjaCB2ZXJ0ZXggd2l0aCBjb25zdGFudCBkYXRhXG4vLyBNdWx0aXBsZSwgdW4tcGFja2VkIGF0dHJpYnV0ZSBhcnJheXMgY2FuIGJlIHByb3ZpZGVkXG5HTC5hZGRWZXJ0aWNlc011bHRpcGxlQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChkeW5hbWljcywgY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSlcbntcbiAgICB2YXIgZGxlbiA9IGR5bmFtaWNzLmxlbmd0aDtcbiAgICB2YXIgdmxlbiA9IGR5bmFtaWNzWzBdLmxlbmd0aDtcbiAgICBjb25zdGFudHMgPSBjb25zdGFudHMgfHwgW107XG5cbiAgICBmb3IgKHZhciB2PTA7IHYgPCB2bGVuOyB2KyspIHtcbiAgICAgICAgZm9yICh2YXIgZD0wOyBkIDwgZGxlbjsgZCsrKSB7XG4gICAgICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCBkeW5hbWljc1tkXVt2XSk7XG4gICAgICAgIH1cbiAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgY29uc3RhbnRzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBBZGQgdmVydGljZXMgdG8gYW4gYXJyYXksIHdpdGggYSB2YXJpYWJsZSBsYXlvdXQgKGJvdGggcGVyLXZlcnRleCBkeW5hbWljIGFuZCBjb25zdGFudCBhdHRyaWJzKVxuLy8gR0wuYWRkVmVydGljZXNCeUF0dHJpYnV0ZUxheW91dCA9IGZ1bmN0aW9uIChhdHRyaWJzLCB2ZXJ0ZXhfZGF0YSlcbi8vIHtcbi8vICAgICB2YXIgbWF4X2xlbmd0aCA9IDA7XG4vLyAgICAgZm9yICh2YXIgYT0wOyBhIDwgYXR0cmlicy5sZW5ndGg7IGErKykge1xuLy8gICAgICAgICAvLyBjb25zb2xlLmxvZyhhdHRyaWJzW2FdLm5hbWUpO1xuLy8gICAgICAgICAvLyBjb25zb2xlLmxvZyhcImEgXCIgKyB0eXBlb2YgYXR0cmlic1thXS5kYXRhKTtcbi8vICAgICAgICAgaWYgKHR5cGVvZiBhdHRyaWJzW2FdLmRhdGEgPT0gJ29iamVjdCcpIHtcbi8vICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiYVswXSBcIiArIHR5cGVvZiBhdHRyaWJzW2FdLmRhdGFbMF0pO1xuLy8gICAgICAgICAgICAgLy8gUGVyLXZlcnRleCBsaXN0IC0gYXJyYXkgb2YgYXJyYXlcbi8vICAgICAgICAgICAgIGlmICh0eXBlb2YgYXR0cmlic1thXS5kYXRhWzBdID09ICdvYmplY3QnKSB7XG4vLyAgICAgICAgICAgICAgICAgYXR0cmlic1thXS5jdXJzb3IgPSAwO1xuLy8gICAgICAgICAgICAgICAgIGlmIChhdHRyaWJzW2FdLmRhdGEubGVuZ3RoID4gbWF4X2xlbmd0aCkge1xuLy8gICAgICAgICAgICAgICAgICAgICBtYXhfbGVuZ3RoID0gYXR0cmlic1thXS5kYXRhLmxlbmd0aDtcbi8vICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICAvLyBTdGF0aWMgYXJyYXkgZm9yIGFsbCB2ZXJ0aWNlc1xuLy8gICAgICAgICAgICAgZWxzZSB7XG4vLyAgICAgICAgICAgICAgICAgYXR0cmlic1thXS5uZXh0X3ZlcnRleCA9IGF0dHJpYnNbYV0uZGF0YTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgICAgICBlbHNlIHtcbi8vICAgICAgICAgICAgIC8vIFN0YXRpYyBzaW5nbGUgdmFsdWUgZm9yIGFsbCB2ZXJ0aWNlcywgY29udmVydCB0byBhcnJheVxuLy8gICAgICAgICAgICAgYXR0cmlic1thXS5uZXh0X3ZlcnRleCA9IFthdHRyaWJzW2FdLmRhdGFdO1xuLy8gICAgICAgICB9XG4vLyAgICAgfVxuXG4vLyAgICAgZm9yICh2YXIgdj0wOyB2IDwgbWF4X2xlbmd0aDsgdisrKSB7XG4vLyAgICAgICAgIGZvciAodmFyIGE9MDsgYSA8IGF0dHJpYnMubGVuZ3RoOyBhKyspIHtcbi8vICAgICAgICAgICAgIGlmIChhdHRyaWJzW2FdLmN1cnNvciAhPSBudWxsKSB7XG4vLyAgICAgICAgICAgICAgICAgLy8gTmV4dCB2YWx1ZSBpbiBsaXN0XG4vLyAgICAgICAgICAgICAgICAgYXR0cmlic1thXS5uZXh0X3ZlcnRleCA9IGF0dHJpYnNbYV0uZGF0YVthdHRyaWJzW2FdLmN1cnNvcl07XG5cbi8vICAgICAgICAgICAgICAgICAvLyBUT0RPOiByZXBlYXRzIGlmIG9uZSBsaXN0IGlzIHNob3J0ZXIgdGhhbiBvdGhlcnMgLSBkZXNpcmVkIGJlaGF2aW9yLCBvciBlbmZvcmNlIHNhbWUgbGVuZ3RoP1xuLy8gICAgICAgICAgICAgICAgIGlmIChhdHRyaWJzW2FdLmN1cnNvciA8IGF0dHJpYnNbYV0uZGF0YS5sZW5ndGgpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgYXR0cmlic1thXS5jdXJzb3IrKztcbi8vICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCBhdHRyaWJzW2FdLm5leHRfdmVydGV4KTtcbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vICAgICByZXR1cm4gdmVydGV4X2RhdGE7XG4vLyB9O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdMO1xufVxuIiwidmFyIFZlY3RvciA9IHJlcXVpcmUoJy4uL3ZlY3Rvci5qcycpO1xudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vcG9pbnQuanMnKTtcbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wuanMnKTtcblxudmFyIEdMQnVpbGRlcnMgPSB7fTtcblxuR0xCdWlsZGVycy5kZWJ1ZyA9IGZhbHNlO1xuXG4vLyBUZXNzZWxhdGUgYSBmbGF0IDJEIHBvbHlnb24gd2l0aCBmaXhlZCBoZWlnaHQgYW5kIGFkZCB0byBHTCB2ZXJ0ZXggYnVmZmVyXG5HTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRQb2x5Z29ucyAocG9seWdvbnMsIHosIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIHZlcnRleF9jb25zdGFudHMgPSBbXTtcbiAgICBpZiAoeiAhPSBudWxsKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaCh6KTsgLy8gcHJvdmlkZWQgelxuICAgIH1cbiAgICBpZiAob3B0aW9ucy5ub3JtYWxzKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaCgwLCAwLCAxKTsgLy8gdXB3YXJkcy1mYWNpbmcgbm9ybWFsXG4gICAgfVxuICAgIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoLmFwcGx5KHZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuICAgIGlmICh2ZXJ0ZXhfY29uc3RhbnRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMgPSBudWxsO1xuICAgIH1cblxuICAgIHZhciBudW1fcG9seWdvbnMgPSBwb2x5Z29ucy5sZW5ndGg7XG4gICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvbHlnb25zOyBwKyspIHtcbiAgICAgICAgdmFyIHZlcnRpY2VzID0gR0wudHJpYW5ndWxhdGVQb2x5Z29uKHBvbHlnb25zW3BdKTtcbiAgICAgICAgR0wuYWRkVmVydGljZXModmVydGljZXMsIHZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBDYWxsYmFjay1iYXNlIGJ1aWxkZXIgKGZvciBmdXR1cmUgZXhwbG9yYXRpb24pXG4vLyBUZXNzZWxhdGUgYSBmbGF0IDJEIHBvbHlnb24gd2l0aCBmaXhlZCBoZWlnaHQgYW5kIGFkZCB0byBHTCB2ZXJ0ZXggYnVmZmVyXG4vLyBHTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMyID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUG9seWdvbjIgKHBvbHlnb25zLCB6LCBhZGRHZW9tZXRyeSwgb3B0aW9ucylcbi8vIHtcbi8vICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuLy8gICAgIHZhciBudW1fcG9seWdvbnMgPSBwb2x5Z29ucy5sZW5ndGg7XG4vLyAgICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvbHlnb25zOyBwKyspIHtcbi8vICAgICAgICAgdmFyIHZlcnRpY2VzID0ge1xuLy8gICAgICAgICAgICAgcG9zaXRpb25zOiBHTC50cmlhbmd1bGF0ZVBvbHlnb24ocG9seWdvbnNbcF0sIHopLFxuLy8gICAgICAgICAgICAgbm9ybWFsczogKG9wdGlvbnMubm9ybWFscyA/IFswLCAwLCAxXSA6IG51bGwpXG4vLyAgICAgICAgIH07XG5cbi8vICAgICAgICAgYWRkR2VvbWV0cnkodmVydGljZXMpO1xuLy8gICAgIH1cbi8vIH07XG5cbi8vIFRlc3NlbGF0ZSBhbmQgZXh0cnVkZSBhIGZsYXQgMkQgcG9seWdvbiBpbnRvIGEgc2ltcGxlIDNEIG1vZGVsIHdpdGggZml4ZWQgaGVpZ2h0IGFuZCBhZGQgdG8gR0wgdmVydGV4IGJ1ZmZlclxuR0xCdWlsZGVycy5idWlsZEV4dHJ1ZGVkUG9seWdvbnMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRFeHRydWRlZFBvbHlnb24gKHBvbHlnb25zLCB6LCBoZWlnaHQsIG1pbl9oZWlnaHQsIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBtaW5feiA9IHogKyAobWluX2hlaWdodCB8fCAwKTtcbiAgICB2YXIgbWF4X3ogPSB6ICsgaGVpZ2h0O1xuXG4gICAgLy8gVG9wXG4gICAgR0xCdWlsZGVycy5idWlsZFBvbHlnb25zKHBvbHlnb25zLCBtYXhfeiwgdmVydGV4X2RhdGEsIHsgbm9ybWFsczogdHJ1ZSwgdmVydGV4X2NvbnN0YW50czogb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzIH0pO1xuICAgIC8vIHZhciB0b3BfdmVydGV4X2NvbnN0YW50cyA9IFswLCAwLCAxXTtcbiAgICAvLyBpZiAob3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzICE9IG51bGwpIHtcbiAgICAvLyAgICAgdG9wX3ZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh0b3BfdmVydGV4X2NvbnN0YW50cywgb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICAvLyB9XG4gICAgLy8gR0xCdWlsZGVycy5idWlsZFBvbHlnb25zMihcbiAgICAvLyAgICAgcG9seWdvbnMsXG4gICAgLy8gICAgIG1heF96LFxuICAgIC8vICAgICBmdW5jdGlvbiAodmVydGljZXMpIHtcbiAgICAvLyAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLnBvc2l0aW9ucywgdG9wX3ZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICAvLyAgICAgfVxuICAgIC8vICk7XG5cbiAgICAvLyBXYWxsc1xuICAgIHZhciB3YWxsX3ZlcnRleF9jb25zdGFudHMgPSBbbnVsbCwgbnVsbCwgbnVsbF07IC8vIG5vcm1hbHMgd2lsbCBiZSBjYWxjdWxhdGVkIGJlbG93XG4gICAgaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh3YWxsX3ZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgdmFyIG51bV9wb2x5Z29ucyA9IHBvbHlnb25zLmxlbmd0aDtcbiAgICBmb3IgKHZhciBwPTA7IHAgPCBudW1fcG9seWdvbnM7IHArKykge1xuICAgICAgICB2YXIgcG9seWdvbiA9IHBvbHlnb25zW3BdO1xuXG4gICAgICAgIGZvciAodmFyIHE9MDsgcSA8IHBvbHlnb24ubGVuZ3RoOyBxKyspIHtcbiAgICAgICAgICAgIHZhciBjb250b3VyID0gcG9seWdvbltxXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgdz0wOyB3IDwgY29udG91ci5sZW5ndGggLSAxOyB3KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgd2FsbF92ZXJ0aWNlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgLy8gVHdvIHRyaWFuZ2xlcyBmb3IgdGhlIHF1YWQgZm9ybWVkIGJ5IGVhY2ggdmVydGV4IHBhaXIsIGdvaW5nIGZyb20gYm90dG9tIHRvIHRvcCBoZWlnaHRcbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIC8vIFRyaWFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3crMV1bMF0sIGNvbnRvdXJbdysxXVsxXSwgbWF4X3pdLFxuICAgICAgICAgICAgICAgICAgICBbY29udG91clt3KzFdWzBdLCBjb250b3VyW3crMV1bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJpYW5nbGVcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1heF96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbdysxXVswXSwgY29udG91clt3KzFdWzFdLCBtYXhfel1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FsYyB0aGUgbm9ybWFsIG9mIHRoZSB3YWxsIGZyb20gdXAgdmVjdG9yIGFuZCBvbmUgc2VnbWVudCBvZiB0aGUgd2FsbCB0cmlhbmdsZXNcbiAgICAgICAgICAgICAgICB2YXIgbm9ybWFsID0gVmVjdG9yLmNyb3NzKFxuICAgICAgICAgICAgICAgICAgICBbMCwgMCwgMV0sXG4gICAgICAgICAgICAgICAgICAgIFZlY3Rvci5ub3JtYWxpemUoW2NvbnRvdXJbdysxXVswXSAtIGNvbnRvdXJbd11bMF0sIGNvbnRvdXJbdysxXVsxXSAtIGNvbnRvdXJbd11bMV0sIDBdKVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHNbMF0gPSBub3JtYWxbMF07XG4gICAgICAgICAgICAgICAgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzWzFdID0gbm9ybWFsWzFdO1xuICAgICAgICAgICAgICAgIHdhbGxfdmVydGV4X2NvbnN0YW50c1syXSA9IG5vcm1hbFsyXTtcblxuICAgICAgICAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHdhbGxfdmVydGljZXMsIHdhbGxfdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQnVpbGQgdGVzc2VsbGF0ZWQgdHJpYW5nbGVzIGZvciBhIHBvbHlsaW5lXG4vLyBCYXNpY2FsbHkgZm9sbG93aW5nIHRoZSBtZXRob2QgZGVzY3JpYmVkIGhlcmUgZm9yIG1pdGVyIGpvaW50czpcbi8vIGh0dHA6Ly9hcnRncmFtbWVyLmJsb2dzcG90LmNvLnVrLzIwMTEvMDcvZHJhd2luZy1wb2x5bGluZXMtYnktdGVzc2VsbGF0aW9uLmh0bWxcbkdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRQb2x5bGluZXMgKGxpbmVzLCB6LCB3aWR0aCwgdmVydGV4X2RhdGEsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jbG9zZWRfcG9seWdvbiA9IG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gfHwgZmFsc2U7XG4gICAgb3B0aW9ucy5yZW1vdmVfdGlsZV9lZGdlcyA9IG9wdGlvbnMucmVtb3ZlX3RpbGVfZWRnZXMgfHwgZmFsc2U7XG5cbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFt6LCAwLCAwLCAxXTsgLy8gcHJvdmlkZWQgeiwgYW5kIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoLmFwcGx5KHZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgLy8gTGluZSBjZW50ZXIgLSBkZWJ1Z2dpbmdcbiAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBsbj0wOyBsbiA8IG51bV9saW5lczsgbG4rKykge1xuICAgICAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tsbl07XG5cbiAgICAgICAgICAgIGZvciAodmFyIHA9MDsgcCA8IGxpbmUubGVuZ3RoIC0gMTsgcCsrKSB7XG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICAgICAgdmFyIHBhID0gbGluZVtwXTtcbiAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lW3ArMV07XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLnZlcnRleF9saW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMS4wLCAwLCAwLFxuICAgICAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMS4wLCAwLCAwXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBCdWlsZCB0cmlhbmdsZXNcbiAgICB2YXIgdmVydGljZXMgPSBbXTtcbiAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgIGZvciAodmFyIGxuPTA7IGxuIDwgbnVtX2xpbmVzOyBsbisrKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbbG5dO1xuICAgICAgICAvLyBNdWx0aXBsZSBsaW5lIHNlZ21lbnRzXG4gICAgICAgIGlmIChsaW5lLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIC8vIEJ1aWxkIGFuY2hvcnMgZm9yIGxpbmUgc2VnbWVudHM6XG4gICAgICAgICAgICAvLyBhbmNob3JzIGFyZSAzIHBvaW50cywgZWFjaCBjb25uZWN0aW5nIDIgbGluZSBzZWdtZW50cyB0aGF0IHNoYXJlIGEgam9pbnQgKHN0YXJ0IHBvaW50LCBqb2ludCBwb2ludCwgZW5kIHBvaW50KVxuXG4gICAgICAgICAgICB2YXIgYW5jaG9ycyA9IFtdO1xuXG4gICAgICAgICAgICBpZiAobGluZS5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgLy8gRmluZCBtaWRwb2ludHMgb2YgZWFjaCBsaW5lIHNlZ21lbnRcbiAgICAgICAgICAgICAgICAvLyBGb3IgY2xvc2VkIHBvbHlnb25zLCBjYWxjdWxhdGUgYWxsIG1pZHBvaW50cyBzaW5jZSBzZWdtZW50cyB3aWxsIHdyYXAgYXJvdW5kIHRvIGZpcnN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgdmFyIG1pZCA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciBwLCBwbWF4O1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmNsb3NlZF9wb2x5Z29uID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcCA9IDA7IC8vIHN0YXJ0IG9uIGZpcnN0IHBvaW50XG4gICAgICAgICAgICAgICAgICAgIHBtYXggPSBsaW5lLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEZvciBvcGVuIHBvbHlnb25zLCBza2lwIGZpcnN0IG1pZHBvaW50IGFuZCB1c2UgbGluZSBzdGFydCBpbnN0ZWFkXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHAgPSAxOyAvLyBzdGFydCBvbiBzZWNvbmQgcG9pbnRcbiAgICAgICAgICAgICAgICAgICAgcG1heCA9IGxpbmUubGVuZ3RoIC0gMjtcbiAgICAgICAgICAgICAgICAgICAgbWlkLnB1c2gobGluZVswXSk7IC8vIHVzZSBsaW5lIHN0YXJ0IGluc3RlYWQgb2YgZmlyc3QgbWlkcG9pbnRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxjIG1pZHBvaW50c1xuICAgICAgICAgICAgICAgIGZvciAoOyBwIDwgcG1heDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmVbcF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYiA9IGxpbmVbcCsxXTtcbiAgICAgICAgICAgICAgICAgICAgbWlkLnB1c2goWyhwYVswXSArIHBiWzBdKSAvIDIsIChwYVsxXSArIHBiWzFdKSAvIDJdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBTYW1lIGNsb3NlZC9vcGVuIHBvbHlnb24gbG9naWMgYXMgYWJvdmU6IGtlZXAgbGFzdCBtaWRwb2ludCBmb3IgY2xvc2VkLCBza2lwIGZvciBvcGVuXG4gICAgICAgICAgICAgICAgdmFyIG1tYXg7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBtbWF4ID0gbWlkLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1pZC5wdXNoKGxpbmVbbGluZS5sZW5ndGgtMV0pOyAvLyB1c2UgbGluZSBlbmQgaW5zdGVhZCBvZiBsYXN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgICAgIG1tYXggPSBtaWQubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBNYWtlIGFuY2hvcnMgYnkgY29ubmVjdGluZyBtaWRwb2ludHMgdG8gbGluZSBqb2ludHNcbiAgICAgICAgICAgICAgICBmb3IgKHA9MDsgcCA8IG1tYXg7IHArKykgIHtcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9ycy5wdXNoKFttaWRbcF0sIGxpbmVbKHArMSkgJSBsaW5lLmxlbmd0aF0sIG1pZFsocCsxKSAlIG1pZC5sZW5ndGhdXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRGVnZW5lcmF0ZSBjYXNlLCBhIDMtcG9pbnQgbGluZSBpcyBqdXN0IGEgc2luZ2xlIGFuY2hvclxuICAgICAgICAgICAgICAgIGFuY2hvcnMgPSBbW2xpbmVbMF0sIGxpbmVbMV0sIGxpbmVbMl1dXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgcD0wOyBwIDwgYW5jaG9ycy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5yZW1vdmVfdGlsZV9lZGdlcykge1xuICAgICAgICAgICAgICAgICAgICBidWlsZEFuY2hvcihhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGRTZWdtZW50KGFuY2hvcnNbcF1bMF0sIGFuY2hvcnNbcF1bMV0pOyAvLyB1c2UgdGhlc2UgdG8gZHJhdyBleHRydWRlZCBzZWdtZW50cyB3L28gam9pbiwgZm9yIGRlYnVnZ2luZ1xuICAgICAgICAgICAgICAgICAgICAvLyBidWlsZFNlZ21lbnQoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWRnZTEgPSBHTEJ1aWxkZXJzLmlzT25UaWxlRWRnZShhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkZ2UyID0gR0xCdWlsZGVycy5pc09uVGlsZUVkZ2UoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZWRnZTEgJiYgIWVkZ2UyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZEFuY2hvcihhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZWRnZTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZWRnZTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBTaW5nbGUgMi1wb2ludCBzZWdtZW50XG4gICAgICAgIGVsc2UgaWYgKGxpbmUubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgIGJ1aWxkU2VnbWVudChsaW5lWzBdLCBsaW5lWzFdKTsgLy8gVE9ETzogcmVwbGFjZSBidWlsZFNlZ21lbnQgd2l0aCBhIGRlZ2VuZXJhdGUgZm9ybSBvZiBidWlsZEFuY2hvcj8gYnVpbGRTZWdtZW50IGlzIHN0aWxsIHVzZWZ1bCBmb3IgZGVidWdnaW5nXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgR0wuYWRkVmVydGljZXModmVydGljZXMsIHZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcblxuICAgIC8vIEJ1aWxkIHRyaWFuZ2xlcyBmb3IgYSBzaW5nbGUgbGluZSBzZWdtZW50LCBleHRydWRlZCBieSB0aGUgcHJvdmlkZWQgd2lkdGhcbiAgICBmdW5jdGlvbiBidWlsZFNlZ21lbnQgKHBhLCBwYikge1xuICAgICAgICB2YXIgc2xvcGUgPSBWZWN0b3Iubm9ybWFsaXplKFsocGJbMV0gLSBwYVsxXSkgKiAtMSwgcGJbMF0gLSBwYVswXV0pO1xuXG4gICAgICAgIHZhciBwYV9vdXRlciA9IFtwYVswXSArIHNsb3BlWzBdICogd2lkdGgvMiwgcGFbMV0gKyBzbG9wZVsxXSAqIHdpZHRoLzJdO1xuICAgICAgICB2YXIgcGFfaW5uZXIgPSBbcGFbMF0gLSBzbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdIC0gc2xvcGVbMV0gKiB3aWR0aC8yXTtcblxuICAgICAgICB2YXIgcGJfb3V0ZXIgPSBbcGJbMF0gKyBzbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdICsgc2xvcGVbMV0gKiB3aWR0aC8yXTtcbiAgICAgICAgdmFyIHBiX2lubmVyID0gW3BiWzBdIC0gc2xvcGVbMF0gKiB3aWR0aC8yLCBwYlsxXSAtIHNsb3BlWzFdICogd2lkdGgvMl07XG5cbiAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgIHBiX2lubmVyLCBwYl9vdXRlciwgcGFfaW5uZXIsXG4gICAgICAgICAgICBwYV9pbm5lciwgcGJfb3V0ZXIsIHBhX291dGVyXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgdHJpYW5nbGVzIGZvciBhIDMtcG9pbnQgJ2FuY2hvcicgc2hhcGUsIGNvbnNpc3Rpbmcgb2YgdHdvIGxpbmUgc2VnbWVudHMgd2l0aCBhIGpvaW50XG4gICAgLy8gVE9ETzogbW92ZSB0aGVzZSBmdW5jdGlvbnMgb3V0IG9mIGNsb3N1cmVzP1xuICAgIGZ1bmN0aW9uIGJ1aWxkQW5jaG9yIChwYSwgam9pbnQsIHBiKSB7XG4gICAgICAgIC8vIElubmVyIGFuZCBvdXRlciBsaW5lIHNlZ21lbnRzIGZvciBbcGEsIGpvaW50XSBhbmQgW2pvaW50LCBwYl1cbiAgICAgICAgdmFyIHBhX3Nsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKGpvaW50WzFdIC0gcGFbMV0pICogLTEsIGpvaW50WzBdIC0gcGFbMF1dKTtcbiAgICAgICAgdmFyIHBhX291dGVyID0gW1xuICAgICAgICAgICAgW3BhWzBdICsgcGFfc2xvcGVbMF0gKiB3aWR0aC8yLCBwYVsxXSArIHBhX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbam9pbnRbMF0gKyBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdICsgcGFfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuICAgICAgICB2YXIgcGFfaW5uZXIgPSBbXG4gICAgICAgICAgICBbcGFbMF0gLSBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdIC0gcGFfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtqb2ludFswXSAtIHBhX3Nsb3BlWzBdICogd2lkdGgvMiwgam9pbnRbMV0gLSBwYV9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG5cbiAgICAgICAgdmFyIHBiX3Nsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKHBiWzFdIC0gam9pbnRbMV0pICogLTEsIHBiWzBdIC0gam9pbnRbMF1dKTtcbiAgICAgICAgdmFyIHBiX291dGVyID0gW1xuICAgICAgICAgICAgW2pvaW50WzBdICsgcGJfc2xvcGVbMF0gKiB3aWR0aC8yLCBqb2ludFsxXSArIHBiX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbcGJbMF0gKyBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdICsgcGJfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuICAgICAgICB2YXIgcGJfaW5uZXIgPSBbXG4gICAgICAgICAgICBbam9pbnRbMF0gLSBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdIC0gcGJfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtwYlswXSAtIHBiX3Nsb3BlWzBdICogd2lkdGgvMiwgcGJbMV0gLSBwYl9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gTWl0ZXIgam9pbiAtIHNvbHZlIGZvciB0aGUgaW50ZXJzZWN0aW9uIGJldHdlZW4gdGhlIHR3byBvdXRlciBsaW5lIHNlZ21lbnRzXG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb24gPSBWZWN0b3IubGluZUludGVyc2VjdGlvbihwYV9vdXRlclswXSwgcGFfb3V0ZXJbMV0sIHBiX291dGVyWzBdLCBwYl9vdXRlclsxXSk7XG4gICAgICAgIHZhciBsaW5lX2RlYnVnID0gbnVsbDtcbiAgICAgICAgaWYgKGludGVyc2VjdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0X291dGVyID0gaW50ZXJzZWN0aW9uO1xuXG4gICAgICAgICAgICAvLyBDYXAgdGhlIGludGVyc2VjdGlvbiBwb2ludCB0byBhIHJlYXNvbmFibGUgZGlzdGFuY2UgKGFzIGpvaW4gYW5nbGUgYmVjb21lcyBzaGFycGVyLCBtaXRlciBqb2ludCBkaXN0YW5jZSB3b3VsZCBhcHByb2FjaCBpbmZpbml0eSlcbiAgICAgICAgICAgIHZhciBsZW5fc3EgPSBWZWN0b3IubGVuZ3RoU3EoW2ludGVyc2VjdF9vdXRlclswXSAtIGpvaW50WzBdLCBpbnRlcnNlY3Rfb3V0ZXJbMV0gLSBqb2ludFsxXV0pO1xuICAgICAgICAgICAgdmFyIG1pdGVyX2xlbl9tYXggPSAzOyAvLyBtdWx0aXBsaWVyIG9uIGxpbmUgd2lkdGggZm9yIG1heCBkaXN0YW5jZSBtaXRlciBqb2luIGNhbiBiZSBmcm9tIGpvaW50XG4gICAgICAgICAgICBpZiAobGVuX3NxID4gKHdpZHRoICogd2lkdGggKiBtaXRlcl9sZW5fbWF4ICogbWl0ZXJfbGVuX21heCkpIHtcbiAgICAgICAgICAgICAgICBsaW5lX2RlYnVnID0gJ2Rpc3RhbmNlJztcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3Rfb3V0ZXIgPSBWZWN0b3Iubm9ybWFsaXplKFtpbnRlcnNlY3Rfb3V0ZXJbMF0gLSBqb2ludFswXSwgaW50ZXJzZWN0X291dGVyWzFdIC0gam9pbnRbMV1dKTtcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3Rfb3V0ZXIgPSBbXG4gICAgICAgICAgICAgICAgICAgIGpvaW50WzBdICsgaW50ZXJzZWN0X291dGVyWzBdICogbWl0ZXJfbGVuX21heCxcbiAgICAgICAgICAgICAgICAgICAgam9pbnRbMV0gKyBpbnRlcnNlY3Rfb3V0ZXJbMV0gKiBtaXRlcl9sZW5fbWF4XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0X2lubmVyID0gW1xuICAgICAgICAgICAgICAgIChqb2ludFswXSAtIGludGVyc2VjdF9vdXRlclswXSkgKyBqb2ludFswXSxcbiAgICAgICAgICAgICAgICAoam9pbnRbMV0gLSBpbnRlcnNlY3Rfb3V0ZXJbMV0pICsgam9pbnRbMV1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X2lubmVyLCBpbnRlcnNlY3Rfb3V0ZXIsIHBhX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdLCBpbnRlcnNlY3Rfb3V0ZXIsIHBhX291dGVyWzBdLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMV0sIHBiX291dGVyWzFdLCBpbnRlcnNlY3RfaW5uZXIsXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X2lubmVyLCBwYl9vdXRlclsxXSwgaW50ZXJzZWN0X291dGVyXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gTGluZSBzZWdtZW50cyBhcmUgcGFyYWxsZWwsIHVzZSB0aGUgZmlyc3Qgb3V0ZXIgbGluZSBzZWdtZW50IGFzIGpvaW4gaW5zdGVhZFxuICAgICAgICAgICAgbGluZV9kZWJ1ZyA9ICdwYXJhbGxlbCc7XG4gICAgICAgICAgICBwYV9pbm5lclsxXSA9IHBiX2lubmVyWzBdO1xuICAgICAgICAgICAgcGFfb3V0ZXJbMV0gPSBwYl9vdXRlclswXTtcblxuICAgICAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXSwgcGFfb3V0ZXJbMV0sIHBhX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdLCBwYV9vdXRlclsxXSwgcGFfb3V0ZXJbMF0sXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXSwgcGJfb3V0ZXJbMV0sIHBiX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzBdLCBwYl9vdXRlclsxXSwgcGJfb3V0ZXJbMF1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeHRydWRlZCBpbm5lci9vdXRlciBlZGdlcyAtIGRlYnVnZ2luZ1xuICAgICAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXVswXSwgcGFfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzFdWzBdLCBwYV9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXVswXSwgcGJfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzFdWzBdLCBwYl9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9vdXRlclswXVswXSwgcGFfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzFdWzBdLCBwYV9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9vdXRlclswXVswXSwgcGJfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzFdWzBdLCBwYl9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXVswXSwgcGFfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzBdWzBdLCBwYV9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXVswXSwgcGFfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzFdWzBdLCBwYV9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXVswXSwgcGJfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzBdWzBdLCBwYl9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXVswXSwgcGJfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzFdWzBdLCBwYl9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBsaW5lX2RlYnVnICYmIG9wdGlvbnMudmVydGV4X2xpbmVzKSB7XG4gICAgICAgICAgICB2YXIgZGNvbG9yO1xuICAgICAgICAgICAgaWYgKGxpbmVfZGVidWcgPT0gJ3BhcmFsbGVsJykge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiISEhIGxpbmVzIGFyZSBwYXJhbGxlbCAhISFcIik7XG4gICAgICAgICAgICAgICAgZGNvbG9yID0gWzAsIDEsIDBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobGluZV9kZWJ1ZyA9PSAnZGlzdGFuY2UnKSB7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCIhISEgbWl0ZXIgaW50ZXJzZWN0aW9uIHBvaW50IGV4Y2VlZGVkIGFsbG93ZWQgZGlzdGFuY2UgZnJvbSBqb2ludCAhISFcIik7XG4gICAgICAgICAgICAgICAgZGNvbG9yID0gWzEsIDAsIDBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ09TTSBpZDogJyArIGZlYXR1cmUuaWQpOyAvLyBUT0RPOiBpZiB0aGlzIGZ1bmN0aW9uIGlzIG1vdmVkIG91dCBvZiBhIGNsb3N1cmUsIHRoaXMgZmVhdHVyZSBkZWJ1ZyBpbmZvIHdvbid0IGJlIGF2YWlsYWJsZVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coW3BhLCBqb2ludCwgcGJdKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGZlYXR1cmUpO1xuICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdLFxuICAgICAgICAgICAgICAgIGpvaW50WzBdLCBqb2ludFsxXSwgeiArIDAuMDAyLFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIGRjb2xvclswXSwgZGNvbG9yWzFdLCBkY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgam9pbnRbMF0sIGpvaW50WzFdLCB6ICsgMC4wMDIsXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgZGNvbG9yWzBdLCBkY29sb3JbMV0sIGRjb2xvclsyXSxcbiAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yICh2YXIgbG49MDsgbG4gPCBudW1fbGluZXM7IGxuKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbGluZTIgPSBsaW5lc1tsbl07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwPTA7IHAgPCBsaW5lMi5sZW5ndGggLSAxOyBwKyspIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmUyW3BdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lMltwKzFdO1xuXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudmVydGV4X2xpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLCAwLCAxLjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLCAwLCAxLjBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQnVpbGQgYSBxdWFkIGNlbnRlcmVkIG9uIGEgcG9pbnRcbi8vIFogY29vcmQsIG5vcm1hbHMsIGFuZCB0ZXhjb29yZHMgYXJlIG9wdGlvbmFsXG4vLyBMYXlvdXQgb3JkZXIgaXM6XG4vLyAgIHBvc2l0aW9uICgyIG9yIDMgY29tcG9uZW50cylcbi8vICAgdGV4Y29vcmQgKG9wdGlvbmFsLCAyIGNvbXBvbmVudHMpXG4vLyAgIG5vcm1hbCAob3B0aW9uYWwsIDMgY29tcG9uZW50cylcbi8vICAgY29uc3RhbnRzIChvcHRpb25hbClcbkdMQnVpbGRlcnMuYnVpbGRRdWFkc0ZvclBvaW50cyA9IGZ1bmN0aW9uIChwb2ludHMsIHdpZHRoLCBoZWlnaHQsIHosIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW107XG4gICAgaWYgKG9wdGlvbnMubm9ybWFscykge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2goMCwgMCwgMSk7IC8vIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgIH1cbiAgICBpZiAob3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh2ZXJ0ZXhfY29uc3RhbnRzLCBvcHRpb25zLnZlcnRleF9jb25zdGFudHMpO1xuICAgIH1cbiAgICBpZiAodmVydGV4X2NvbnN0YW50cy5sZW5ndGggPT0gMCkge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbnVtX3BvaW50cyA9IHBvaW50cy5sZW5ndGg7XG4gICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvaW50czsgcCsrKSB7XG4gICAgICAgIHZhciBwb2ludCA9IHBvaW50c1twXTtcblxuICAgICAgICB2YXIgcG9zaXRpb25zID0gW1xuICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4gICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbiAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuXG4gICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbiAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gQWRkIHByb3ZpZGVkIHpcbiAgICAgICAgaWYgKHogIT0gbnVsbCkge1xuICAgICAgICAgICAgcG9zaXRpb25zWzBdWzJdID0gejtcbiAgICAgICAgICAgIHBvc2l0aW9uc1sxXVsyXSA9IHo7XG4gICAgICAgICAgICBwb3NpdGlvbnNbMl1bMl0gPSB6O1xuICAgICAgICAgICAgcG9zaXRpb25zWzNdWzJdID0gejtcbiAgICAgICAgICAgIHBvc2l0aW9uc1s0XVsyXSA9IHo7XG4gICAgICAgICAgICBwb3NpdGlvbnNbNV1bMl0gPSB6O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMudGV4Y29vcmRzID09IHRydWUpIHtcbiAgICAgICAgICAgIHZhciB0ZXhjb29yZHMgPSBbXG4gICAgICAgICAgICAgICAgWy0xLCAtMV0sXG4gICAgICAgICAgICAgICAgWzEsIC0xXSxcbiAgICAgICAgICAgICAgICBbMSwgMV0sXG5cbiAgICAgICAgICAgICAgICBbLTEsIC0xXSxcbiAgICAgICAgICAgICAgICBbMSwgMV0sXG4gICAgICAgICAgICAgICAgWy0xLCAxXVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgR0wuYWRkVmVydGljZXNNdWx0aXBsZUF0dHJpYnV0ZXMoW3Bvc2l0aW9ucywgdGV4Y29vcmRzXSwgdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgR0wuYWRkVmVydGljZXMocG9zaXRpb25zLCB2ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBDYWxsYmFjay1iYXNlIGJ1aWxkZXIgKGZvciBmdXR1cmUgZXhwbG9yYXRpb24pXG4vLyBHTEJ1aWxkZXJzLmJ1aWxkUXVhZHNGb3JQb2ludHMyID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUXVhZHNGb3JQb2ludHMgKHBvaW50cywgd2lkdGgsIGhlaWdodCwgYWRkR2VvbWV0cnksIG9wdGlvbnMpXG4vLyB7XG4vLyAgICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4vLyAgICAgdmFyIG51bV9wb2ludHMgPSBwb2ludHMubGVuZ3RoO1xuLy8gICAgIGZvciAodmFyIHA9MDsgcCA8IG51bV9wb2ludHM7IHArKykge1xuLy8gICAgICAgICB2YXIgcG9pbnQgPSBwb2ludHNbcF07XG5cbi8vICAgICAgICAgdmFyIHBvc2l0aW9ucyA9IFtcbi8vICAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuLy8gICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcblxuLy8gICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcbi8vICAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuLy8gICAgICAgICBdO1xuXG4vLyAgICAgICAgIGlmIChvcHRpb25zLnRleGNvb3JkcyA9PSB0cnVlKSB7XG4vLyAgICAgICAgICAgICB2YXIgdGV4Y29vcmRzID0gW1xuLy8gICAgICAgICAgICAgICAgIFstMSwgLTFdLFxuLy8gICAgICAgICAgICAgICAgIFsxLCAtMV0sXG4vLyAgICAgICAgICAgICAgICAgWzEsIDFdLFxuXG4vLyAgICAgICAgICAgICAgICAgWy0xLCAtMV0sXG4vLyAgICAgICAgICAgICAgICAgWzEsIDFdLFxuLy8gICAgICAgICAgICAgICAgIFstMSwgMV1cbi8vICAgICAgICAgICAgIF07XG4vLyAgICAgICAgIH1cblxuLy8gICAgICAgICB2YXIgdmVydGljZXMgPSB7XG4vLyAgICAgICAgICAgICBwb3NpdGlvbnM6IHBvc2l0aW9ucyxcbi8vICAgICAgICAgICAgIG5vcm1hbHM6IChvcHRpb25zLm5vcm1hbHMgPyBbMCwgMCwgMV0gOiBudWxsKSxcbi8vICAgICAgICAgICAgIHRleGNvb3JkczogKG9wdGlvbnMudGV4Y29vcmRzICYmIHRleGNvb3Jkcylcbi8vICAgICAgICAgfTtcbi8vICAgICAgICAgYWRkR2VvbWV0cnkodmVydGljZXMpO1xuLy8gICAgIH1cbi8vIH07XG5cbi8vIEJ1aWxkIG5hdGl2ZSBHTCBsaW5lcyBmb3IgYSBwb2x5bGluZVxuR0xCdWlsZGVycy5idWlsZExpbmVzID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkTGluZXMgKGxpbmVzLCBmZWF0dXJlLCBsYXllciwgc3R5bGUsIHRpbGUsIHosIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIGNvbG9yID0gc3R5bGUuY29sb3I7XG4gICAgdmFyIHdpZHRoID0gc3R5bGUud2lkdGg7XG5cbiAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgIGZvciAodmFyIGxuPTA7IGxuIDwgbnVtX2xpbmVzOyBsbisrKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbbG5dO1xuXG4gICAgICAgIGZvciAodmFyIHA9MDsgcCA8IGxpbmUubGVuZ3RoIC0gMTsgcCsrKSB7XG4gICAgICAgICAgICAvLyBQb2ludCBBIHRvIEJcbiAgICAgICAgICAgIHZhciBwYSA9IGxpbmVbcF07XG4gICAgICAgICAgICB2YXIgcGIgPSBsaW5lW3ArMV07XG5cbiAgICAgICAgICAgIHZlcnRleF9kYXRhLnB1c2goXG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQVxuICAgICAgICAgICAgICAgIHBhWzBdLCBwYVsxXSwgeixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCAvLyBmbGF0IHN1cmZhY2VzIHBvaW50IHN0cmFpZ2h0IHVwXG4gICAgICAgICAgICAgICAgY29sb3JbMF0sIGNvbG9yWzFdLCBjb2xvclsyXSxcbiAgICAgICAgICAgICAgICAvLyBQb2ludCBCXG4gICAgICAgICAgICAgICAgcGJbMF0sIHBiWzFdLCB6LFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIC8vIGZsYXQgc3VyZmFjZXMgcG9pbnQgc3RyYWlnaHQgdXBcbiAgICAgICAgICAgICAgICBjb2xvclswXSwgY29sb3JbMV0sIGNvbG9yWzJdXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8qIFV0aWxpdHkgZnVuY3Rpb25zICovXG5cbi8vIFRlc3RzIGlmIGEgbGluZSBzZWdtZW50IChmcm9tIHBvaW50IEEgdG8gQikgaXMgbmVhcmx5IGNvaW5jaWRlbnQgd2l0aCB0aGUgZWRnZSBvZiBhIHRpbGVcbkdMQnVpbGRlcnMuaXNPblRpbGVFZGdlID0gZnVuY3Rpb24gKHBhLCBwYiwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciB0b2xlcmFuY2VfZnVuY3Rpb24gPSBvcHRpb25zLnRvbGVyYW5jZV9mdW5jdGlvbiB8fCBHTEJ1aWxkZXJzLnZhbHVlc1dpdGhpblRvbGVyYW5jZTtcbiAgICB2YXIgdG9sZXJhbmNlID0gb3B0aW9ucy50b2xlcmFuY2UgfHwgMTsgLy8gdHdlYWsgdGhpcyBhZGp1c3QgaWYgY2F0Y2hpbmcgdG9vIGZldy9tYW55IGxpbmUgc2VnbWVudHMgbmVhciB0aWxlIGVkZ2VzXG4gICAgdmFyIHRpbGVfbWluID0gR0xCdWlsZGVycy50aWxlX2JvdW5kc1swXTtcbiAgICB2YXIgdGlsZV9tYXggPSBHTEJ1aWxkZXJzLnRpbGVfYm91bmRzWzFdO1xuICAgIHZhciBlZGdlID0gbnVsbDtcblxuICAgIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMF0sIHRpbGVfbWluLngsIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzBdLCB0aWxlX21pbi54LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAnbGVmdCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRvbGVyYW5jZV9mdW5jdGlvbihwYVswXSwgdGlsZV9tYXgueCwgdG9sZXJhbmNlKSAmJiB0b2xlcmFuY2VfZnVuY3Rpb24ocGJbMF0sIHRpbGVfbWF4LngsIHRvbGVyYW5jZSkpIHtcbiAgICAgICAgZWRnZSA9ICdyaWdodCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRvbGVyYW5jZV9mdW5jdGlvbihwYVsxXSwgdGlsZV9taW4ueSwgdG9sZXJhbmNlKSAmJiB0b2xlcmFuY2VfZnVuY3Rpb24ocGJbMV0sIHRpbGVfbWluLnksIHRvbGVyYW5jZSkpIHtcbiAgICAgICAgZWRnZSA9ICd0b3AnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMV0sIHRpbGVfbWF4LnksIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzFdLCB0aWxlX21heC55LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAnYm90dG9tJztcbiAgICB9XG4gICAgcmV0dXJuIGVkZ2U7XG59O1xuXG5HTEJ1aWxkZXJzLnNldFRpbGVTY2FsZSA9IGZ1bmN0aW9uIChzY2FsZSlcbntcbiAgICBHTEJ1aWxkZXJzLnRpbGVfYm91bmRzID0gW1xuICAgICAgICBQb2ludCgwLCAwKSxcbiAgICAgICAgUG9pbnQoc2NhbGUsIC1zY2FsZSkgLy8gVE9ETzogY29ycmVjdCBmb3IgZmxpcHBlZCB5LWF4aXM/XG4gICAgXTtcbn07XG5cbkdMQnVpbGRlcnMudmFsdWVzV2l0aGluVG9sZXJhbmNlID0gZnVuY3Rpb24gKGEsIGIsIHRvbGVyYW5jZSlcbntcbiAgICB0b2xlcmFuY2UgPSB0b2xlcmFuY2UgfHwgMTtcbiAgICByZXR1cm4gKE1hdGguYWJzKGEgLSBiKSA8IHRvbGVyYW5jZSk7XG59O1xuXG4vLyBCdWlsZCBhIHppZ3phZyBsaW5lIHBhdHRlcm4gZm9yIHRlc3Rpbmcgam9pbnMgYW5kIGNhcHNcbkdMQnVpbGRlcnMuYnVpbGRaaWd6YWdMaW5lVGVzdFBhdHRlcm4gPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBtaW4gPSBQb2ludCgwLCAwKTsgLy8gdGlsZS5taW47XG4gICAgdmFyIG1heCA9IFBvaW50KDQwOTYsIDQwOTYpOyAvLyB0aWxlLm1heDtcbiAgICB2YXIgZyA9IHtcbiAgICAgICAgaWQ6IDEyMyxcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJyxcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC43NSArIG1heC54ICogMC4yNSwgbWluLnkgKiAwLjc1ICsgbWF4LnkgKiAwLjI1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjc1ICsgbWF4LnggKiAwLjI1LCBtaW4ueSAqIDAuNSArIG1heC55ICogMC41XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjI1ICsgbWF4LnggKiAwLjc1LCBtaW4ueSAqIDAuNzUgKyBtYXgueSAqIDAuMjVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuMjUgKyBtYXgueCAqIDAuNzUsIG1pbi55ICogMC4yNSArIG1heC55ICogMC43NV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC40ICsgbWF4LnggKiAwLjYsIG1pbi55ICogMC41ICsgbWF4LnkgKiAwLjVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNSArIG1heC54ICogMC41LCBtaW4ueSAqIDAuMjUgKyBtYXgueSAqIDAuNzVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNzUgKyBtYXgueCAqIDAuMjUsIG1pbi55ICogMC4yNSArIG1heC55ICogMC43NV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC43NSArIG1heC54ICogMC4yNSwgbWluLnkgKiAwLjQgKyBtYXgueSAqIDAuNl1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAga2luZDogJ2RlYnVnJ1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBjb25zb2xlLmxvZyhnLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcbiAgICByZXR1cm4gZztcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gR0xCdWlsZGVycztcbn1cbiIsIi8qKiogTWFuYWdlIHJlbmRlcmluZyBmb3IgcHJpbWl0aXZlcyAqKiovXG52YXIgR0wgPSByZXF1aXJlKCcuL2dsLmpzJyk7XG52YXIgR0xWZXJ0ZXhMYXlvdXQgPSByZXF1aXJlKCcuL2dsX3ZlcnRleF9sYXlvdXQuanMnKTtcbi8vIHZhciBHTFZlcnRleEFycmF5T2JqZWN0ID0gcmVxdWlyZSgnLi9nbF92YW8uanMnKTtcbnZhciBHTFByb2dyYW0gPSByZXF1aXJlKCcuL2dsX3Byb2dyYW0uanMnKTtcblxuLy8gQSBzaW5nbGUgbWVzaC9WQk8sIGRlc2NyaWJlZCBieSBhIHZlcnRleCBsYXlvdXQsIHRoYXQgY2FuIGJlIGRyYXduIHdpdGggb25lIG9yIG1vcmUgcHJvZ3JhbXNcbmZ1bmN0aW9uIEdMR2VvbWV0cnkgKGdsLCB2ZXJ0ZXhfZGF0YSwgdmVydGV4X2xheW91dCwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLnZlcnRleF9kYXRhID0gdmVydGV4X2RhdGE7IC8vIEZsb2F0MzJBcnJheVxuICAgIHRoaXMudmVydGV4X2xheW91dCA9IHZlcnRleF9sYXlvdXQ7XG4gICAgdGhpcy5idWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgIHRoaXMuZHJhd19tb2RlID0gb3B0aW9ucy5kcmF3X21vZGUgfHwgdGhpcy5nbC5UUklBTkdMRVM7XG4gICAgdGhpcy5kYXRhX3VzYWdlID0gb3B0aW9ucy5kYXRhX3VzYWdlIHx8IHRoaXMuZ2wuU1RBVElDX0RSQVc7XG4gICAgdGhpcy52ZXJ0aWNlc19wZXJfZ2VvbWV0cnkgPSAzOyAvLyBUT0RPOiBzdXBwb3J0IGxpbmVzLCBzdHJpcCwgZmFuLCBldGMuXG5cbiAgICB0aGlzLnZlcnRleF9jb3VudCA9IHRoaXMudmVydGV4X2RhdGEuYnl0ZUxlbmd0aCAvIHRoaXMudmVydGV4X2xheW91dC5zdHJpZGU7XG4gICAgdGhpcy5nZW9tZXRyeV9jb3VudCA9IHRoaXMudmVydGV4X2NvdW50IC8gdGhpcy52ZXJ0aWNlc19wZXJfZ2VvbWV0cnk7XG5cbiAgICAvLyBUT0RPOiBkaXNhYmxpbmcgVkFPcyBmb3Igbm93IGJlY2F1c2Ugd2UgbmVlZCB0byBzdXBwb3J0IGRpZmZlcmVudCB2ZXJ0ZXggbGF5b3V0ICsgcHJvZ3JhbSBjb21iaW5hdGlvbnMsXG4gICAgLy8gd2hlcmUgbm90IGFsbCBwcm9ncmFtcyB3aWxsIHJlY29nbml6ZSBhbGwgYXR0cmlidXRlcyAoZS5nLiBmZWF0dXJlIHNlbGVjdGlvbiBzaGFkZXJzIGluY2x1ZGUgZXh0cmEgYXR0cmliKS5cbiAgICAvLyBUbyBzdXBwb3J0IFZBT3MgaGVyZSwgd291bGQgbmVlZCB0byBzdXBwb3J0IG11bHRpcGxlIHBlciBnZW9tZXRyeSwga2V5ZWQgYnkgR0wgcHJvZ3JhbT9cbiAgICAvLyB0aGlzLnZhbyA9IEdMVmVydGV4QXJyYXlPYmplY3QuY3JlYXRlKGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICAvLyAgICAgdGhpcy5zZXR1cCgpO1xuICAgIC8vIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICB0aGlzLmdsLmJ1ZmZlckRhdGEodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4X2RhdGEsIHRoaXMuZGF0YV91c2FnZSk7XG59XG5cbi8vIFJlbmRlciwgYnkgZGVmYXVsdCB3aXRoIGN1cnJlbnRseSBib3VuZCBwcm9ncmFtLCBvciBvdGhlcndpc2Ugd2l0aCBvcHRpb25hbGx5IHByb3ZpZGVkIG9uZVxuR0xHZW9tZXRyeS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAvLyBHTFZlcnRleEFycmF5T2JqZWN0LmJpbmQodGhpcy52YW8pO1xuXG4gICAgaWYgKHR5cGVvZiB0aGlzLl9yZW5kZXJfc2V0dXAgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9yZW5kZXJfc2V0dXAoKTtcbiAgICB9XG5cbiAgICB2YXIgZ2xfcHJvZ3JhbSA9IG9wdGlvbnMuZ2xfcHJvZ3JhbSB8fCBHTFByb2dyYW0uY3VycmVudDtcbiAgICBnbF9wcm9ncmFtLnVzZSgpO1xuXG4gICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgdGhpcy52ZXJ0ZXhfbGF5b3V0LmVuYWJsZSh0aGlzLmdsLCBnbF9wcm9ncmFtKTtcblxuICAgIC8vIFRPRE86IHN1cHBvcnQgZWxlbWVudCBhcnJheSBtb2RlXG4gICAgdGhpcy5nbC5kcmF3QXJyYXlzKHRoaXMuZHJhd19tb2RlLCAwLCB0aGlzLnZlcnRleF9jb3VudCk7XG4gICAgLy8gR0xWZXJ0ZXhBcnJheU9iamVjdC5iaW5kKG51bGwpO1xufTtcblxuR0xHZW9tZXRyeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpXG57XG4gICAgY29uc29sZS5sb2coXCJHTEdlb21ldHJ5LmRlc3Ryb3k6IGRlbGV0ZSBidWZmZXIgb2Ygc2l6ZSBcIiArIHRoaXMudmVydGV4X2RhdGEuYnl0ZUxlbmd0aCk7XG4gICAgdGhpcy5nbC5kZWxldGVCdWZmZXIodGhpcy5idWZmZXIpO1xuICAgIGRlbGV0ZSB0aGlzLnZlcnRleF9kYXRhO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHTEdlb21ldHJ5O1xufVxuIiwiLy8gUmVuZGVyaW5nIG1vZGVzXG5cbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wuanMnKTtcbnZhciBHTEJ1aWxkZXJzID0gcmVxdWlyZSgnLi9nbF9idWlsZGVycy5qcycpO1xudmFyIEdMR2VvbWV0cnkgPSByZXF1aXJlKCcuL2dsX2dlb20uanMnKTtcbnZhciBHTFZlcnRleExheW91dCA9IHJlcXVpcmUoJy4vZ2xfdmVydGV4X2xheW91dC5qcycpO1xudmFyIEdMUHJvZ3JhbSA9IHJlcXVpcmUoJy4vZ2xfcHJvZ3JhbS5qcycpO1xudmFyIEdMVGV4dHVyZSA9IHJlcXVpcmUoJy4vZ2xfdGV4dHVyZS5qcycpO1xudmFyIHNoYWRlcl9zb3VyY2VzID0gcmVxdWlyZSgnLi9nbF9zaGFkZXJzLmpzJyk7IC8vIGJ1aWx0LWluIHNoYWRlcnNcblxudmFyIFF1ZXVlID0gcmVxdWlyZSgncXVldWUtYXN5bmMnKTtcblxuLy8gQmFzZVxuXG52YXIgUmVuZGVyTW9kZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoZ2wpIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLm1ha2VHTFByb2dyYW0oKTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuX2luaXQgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZWZyZXNoOiBmdW5jdGlvbiAoKSB7IC8vIFRPRE86IHNob3VsZCB0aGlzIGJlIGFzeW5jL25vbi1ibG9ja2luZz9cbiAgICAgICAgdGhpcy5tYWtlR0xQcm9ncmFtKCk7XG4gICAgfSxcbiAgICBkZWZpbmVzOiB7fSxcbiAgICBzZWxlY3Rpb246IGZhbHNlLFxuICAgIGJ1aWxkUG9seWdvbnM6IGZ1bmN0aW9uKCl7fSwgLy8gYnVpbGQgZnVuY3Rpb25zIGFyZSBuby1vcHMgdW50aWwgb3ZlcnJpZGVuXG4gICAgYnVpbGRMaW5lczogZnVuY3Rpb24oKXt9LFxuICAgIGJ1aWxkUG9pbnRzOiBmdW5jdGlvbigpe30sXG4gICAgbWFrZUdMR2VvbWV0cnk6IGZ1bmN0aW9uICh2ZXJ0ZXhfZGF0YSkge1xuICAgICAgICByZXR1cm4gbmV3IEdMR2VvbWV0cnkodGhpcy5nbCwgdmVydGV4X2RhdGEsIHRoaXMudmVydGV4X2xheW91dCk7XG4gICAgfVxufTtcblxuLy8gVE9ETzogZG9uJ3QgcmUtY3JlYXRlIEdMUHJvZ3JhbSBpbnN0YW5jZSBldmVyeSB0aW1lLCBqdXN0IHVwZGF0ZSBleGlzdGluZyBvbmVcblJlbmRlck1vZGUubWFrZUdMUHJvZ3JhbSA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gY29uc29sZS5sb2codGhpcy5uYW1lICsgXCI6IFwiICsgXCJzdGFydCBidWlsZGluZ1wiKTtcbiAgICB2YXIgcXVldWUgPSBRdWV1ZSgpO1xuXG4gICAgLy8gQnVpbGQgZGVmaW5lcyAmIGZvciBzZWxlY3Rpb24gKG5lZWQgdG8gY3JlYXRlIGEgbmV3IG9iamVjdCBzaW5jZSB0aGUgZmlyc3QgaXMgc3RvcmVkIGFzIGEgcmVmZXJlbmNlIGJ5IHRoZSBwcm9ncmFtKVxuICAgIHZhciBkZWZpbmVzID0gdGhpcy5idWlsZERlZmluZUxpc3QoKTtcbiAgICBpZiAodGhpcy5zZWxlY3Rpb24pIHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbl9kZWZpbmVzID0gT2JqZWN0LmNyZWF0ZShkZWZpbmVzKTtcbiAgICAgICAgc2VsZWN0aW9uX2RlZmluZXNbJ0ZFQVRVUkVfU0VMRUNUSU9OJ10gPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIEdldCBhbnkgY3VzdG9tIGNvZGUgdHJhbnNmb3Jtc1xuICAgIHZhciB0cmFuc2Zvcm1zID0gKHRoaXMuc2hhZGVycyAmJiB0aGlzLnNoYWRlcnMudHJhbnNmb3Jtcyk7XG5cbiAgICAvLyBDcmVhdGUgc2hhZGVycyAtIHByb2dyYW1zIG1heSBwb2ludCB0byBpbmhlcml0ZWQgcGFyZW50IHByb3BlcnRpZXMsIGJ1dCBzaG91bGQgYmUgcmVwbGFjZWQgYnkgc3ViY2xhc3MgdmVyc2lvblxuICAgIHZhciBwcm9ncmFtID0gKHRoaXMuaGFzT3duUHJvcGVydHkoJ2dsX3Byb2dyYW0nKSAmJiB0aGlzLmdsX3Byb2dyYW0pO1xuICAgIHZhciBzZWxlY3Rpb25fcHJvZ3JhbSA9ICh0aGlzLmhhc093blByb3BlcnR5KCdzZWxlY3Rpb25fZ2xfcHJvZ3JhbScpICYmIHRoaXMuc2VsZWN0aW9uX2dsX3Byb2dyYW0pO1xuXG4gICAgcXVldWUuZGVmZXIoZnVuY3Rpb24oY29tcGxldGUpIHtcbiAgICAgICAgaWYgKCFwcm9ncmFtKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIjogXCIgKyBcImluc3RhbnRpYXRlXCIpO1xuICAgICAgICAgICAgcHJvZ3JhbSA9IG5ldyBHTFByb2dyYW0oXG4gICAgICAgICAgICAgICAgdGhpcy5nbCxcbiAgICAgICAgICAgICAgICBzaGFkZXJfc291cmNlc1t0aGlzLnZlcnRleF9zaGFkZXJfa2V5XSxcbiAgICAgICAgICAgICAgICBzaGFkZXJfc291cmNlc1t0aGlzLmZyYWdtZW50X3NoYWRlcl9rZXldLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmaW5lczogZGVmaW5lcyxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtczogdHJhbnNmb3JtcyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogY29tcGxldGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5uYW1lICsgXCI6IFwiICsgXCJyZS1jb21waWxlXCIpO1xuICAgICAgICAgICAgcHJvZ3JhbS5kZWZpbmVzID0gZGVmaW5lcztcbiAgICAgICAgICAgIHByb2dyYW0udHJhbnNmb3JtcyA9IHRyYW5zZm9ybXM7XG4gICAgICAgICAgICBwcm9ncmFtLmNvbXBpbGUoY29tcGxldGUpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIGlmICh0aGlzLnNlbGVjdGlvbikge1xuICAgICAgICBxdWV1ZS5kZWZlcihmdW5jdGlvbihjb21wbGV0ZSkge1xuICAgICAgICAgICAgaWYgKCFzZWxlY3Rpb25fcHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwic2VsZWN0aW9uIGluc3RhbnRpYXRlXCIpO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtID0gbmV3IEdMUHJvZ3JhbShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbCxcbiAgICAgICAgICAgICAgICAgICAgc2hhZGVyX3NvdXJjZXNbdGhpcy52ZXJ0ZXhfc2hhZGVyX2tleV0sXG4gICAgICAgICAgICAgICAgICAgIHNoYWRlcl9zb3VyY2VzWydzZWxlY3Rpb25fZnJhZ21lbnQnXSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5lczogc2VsZWN0aW9uX2RlZmluZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1zOiB0cmFuc2Zvcm1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogKHRoaXMubmFtZSArICcgKHNlbGVjdGlvbiknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwic2VsZWN0aW9uIHJlLWNvbXBpbGVcIik7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uX3Byb2dyYW0uZGVmaW5lcyA9IHNlbGVjdGlvbl9kZWZpbmVzO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtLnRyYW5zZm9ybXMgPSB0cmFuc2Zvcm1zO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtLmNvbXBpbGUoY29tcGxldGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8vIFdhaXQgZm9yIHByb2dyYW0ocykgdG8gY29tcGlsZSBiZWZvcmUgcmVwbGFjaW5nIHRoZW1cbiAgICBxdWV1ZS5hd2FpdChmdW5jdGlvbigpIHtcbiAgICAgICBpZiAocHJvZ3JhbSkge1xuICAgICAgICAgICB0aGlzLmdsX3Byb2dyYW0gPSBwcm9ncmFtO1xuICAgICAgIH1cblxuICAgICAgIGlmIChzZWxlY3Rpb25fcHJvZ3JhbSkge1xuICAgICAgICAgICB0aGlzLnNlbGVjdGlvbl9nbF9wcm9ncmFtID0gc2VsZWN0aW9uX3Byb2dyYW07XG4gICAgICAgfVxuXG4gICAgICAgLy8gY29uc29sZS5sb2codGhpcy5uYW1lICsgXCI6IFwiICsgXCJmaW5pc2hlZCBidWlsZGluZ1wiKTtcbiAgICB9LmJpbmQodGhpcykpO1xufVxuXG4vLyBUT0RPOiBjb3VsZCBwcm9iYWJseSBjb21iaW5lIGFuZCBnZW5lcmFsaXplIHRoaXMgd2l0aCBzaW1pbGFyIG1ldGhvZCBpbiBHTFByb2dyYW1cbi8vIChsaXN0IG9mIGRlZmluZSBvYmplY3RzIHRoYXQgaW5oZXJpdCBmcm9tIGVhY2ggb3RoZXIpXG5SZW5kZXJNb2RlLmJ1aWxkRGVmaW5lTGlzdCA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gQWRkIGFueSBjdXN0b20gZGVmaW5lcyB0byBidWlsdC1pbiBtb2RlIGRlZmluZXNcbiAgICB2YXIgZGVmaW5lcyA9IHt9OyAvLyBjcmVhdGUgYSBuZXcgb2JqZWN0IHRvIGF2b2lkIG11dGF0aW5nIGEgcHJvdG90eXBlIHZhbHVlIHRoYXQgbWF5IGJlIHNoYXJlZCB3aXRoIG90aGVyIG1vZGVzXG4gICAgaWYgKHRoaXMuZGVmaW5lcyAhPSBudWxsKSB7XG4gICAgICAgIGZvciAodmFyIGQgaW4gdGhpcy5kZWZpbmVzKSB7XG4gICAgICAgICAgICBkZWZpbmVzW2RdID0gdGhpcy5kZWZpbmVzW2RdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnNoYWRlcnMgIT0gbnVsbCAmJiB0aGlzLnNoYWRlcnMuZGVmaW5lcyAhPSBudWxsKSB7XG4gICAgICAgIGZvciAodmFyIGQgaW4gdGhpcy5zaGFkZXJzLmRlZmluZXMpIHtcbiAgICAgICAgICAgIGRlZmluZXNbZF0gPSB0aGlzLnNoYWRlcnMuZGVmaW5lc1tkXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVmaW5lcztcbn07XG5cbi8vIFRPRE86IG1ha2UgdGhpcyBhIGdlbmVyaWMgT1JNLWxpa2UgZmVhdHVyZSBmb3Igc2V0dGluZyB1bmlmb3JtcyB2aWEgSlMgb2JqZWN0cyBvbiBHTFByb2dyYW1cblJlbmRlck1vZGUuc2V0VW5pZm9ybXMgPSBmdW5jdGlvbiAob3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgZ2xfcHJvZ3JhbSA9IEdMUHJvZ3JhbS5jdXJyZW50OyAvLyBvcGVyYXRlIG9uIGN1cnJlbnRseSBib3VuZCBwcm9ncmFtXG5cbiAgICAvLyBUT0RPOiBvbmx5IHVwZGF0ZSB1bmlmb3JtcyB3aGVuIGNoYW5nZWRcbiAgICBpZiAodGhpcy5zaGFkZXJzICE9IG51bGwgJiYgdGhpcy5zaGFkZXJzLnVuaWZvcm1zICE9IG51bGwpIHtcbiAgICAgICAgdmFyIHRleHR1cmVfdW5pdCA9IDA7XG5cbiAgICAgICAgZm9yICh2YXIgdSBpbiB0aGlzLnNoYWRlcnMudW5pZm9ybXMpIHtcbiAgICAgICAgICAgIHZhciB1bmlmb3JtID0gdGhpcy5zaGFkZXJzLnVuaWZvcm1zW3VdO1xuXG4gICAgICAgICAgICAvLyBTaW5nbGUgZmxvYXRcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdW5pZm9ybSA9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCB1LCB1bmlmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE11bHRpcGxlIGZsb2F0cyAtIHZlY3RvciBvciBhcnJheVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHVuaWZvcm0gPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAvLyBmbG9hdCB2ZWN0b3JzICh2ZWMyLCB2ZWMzLCB2ZWM0KVxuICAgICAgICAgICAgICAgIGlmICh1bmlmb3JtLmxlbmd0aCA+PSAyICYmIHVuaWZvcm0ubGVuZ3RoIDw9IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKHVuaWZvcm0ubGVuZ3RoICsgJ2Z2JywgdSwgdW5pZm9ybSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGZsb2F0IGFycmF5XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodW5pZm9ybS5sZW5ndGggPiA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWZ2JywgdSArICdbMF0nLCB1bmlmb3JtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogYXNzdW1lIG1hdHJpeCBmb3IgKHR5cGVvZiA9PSBGbG9hdDMyQXJyYXkgJiYgbGVuZ3RoID09IDE2KT9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEJvb2xlYW5cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiB0aGlzLnNoYWRlcnMudW5pZm9ybXNbdV0gPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxaScsIHUsIHVuaWZvcm0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGV4dHVyZVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHVuaWZvcm0gPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGV4dHVyZSA9IEdMVGV4dHVyZS50ZXh0dXJlc1t1bmlmb3JtXTtcbiAgICAgICAgICAgICAgICBpZiAodGV4dHVyZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRleHR1cmUgPSBuZXcgR0xUZXh0dXJlKHRoaXMuZ2wsIHVuaWZvcm0pO1xuICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmxvYWQodW5pZm9ybSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGV4dHVyZS5iaW5kKHRleHR1cmVfdW5pdCk7XG4gICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxaScsIHUsIHRleHR1cmVfdW5pdCk7XG4gICAgICAgICAgICAgICAgdGV4dHVyZV91bml0Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUT0RPOiBzdXBwb3J0IG90aGVyIG5vbi1mbG9hdCB0eXBlcz8gKGludCwgZXRjLilcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblJlbmRlck1vZGUudXBkYXRlID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBNb2RlLXNwZWNpZmljIGFuaW1hdGlvblxuICAgIGlmICh0eXBlb2YgdGhpcy5hbmltYXRpb24gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbigpO1xuICAgIH1cbn07XG5cblxudmFyIE1vZGVzID0ge307XG52YXIgTW9kZU1hbmFnZXIgPSB7fTtcblxuLy8gVXBkYXRlIGJ1aWx0LWluIG1vZGUgb3IgY3JlYXRlIGEgbmV3IG9uZVxuTW9kZU1hbmFnZXIuY29uZmlndXJlTW9kZSA9IGZ1bmN0aW9uIChuYW1lLCBzZXR0aW5ncylcbntcbiAgICBNb2Rlc1tuYW1lXSA9IE1vZGVzW25hbWVdIHx8IE9iamVjdC5jcmVhdGUoTW9kZXNbc2V0dGluZ3MuZXh0ZW5kc10gfHwgUmVuZGVyTW9kZSk7XG4gICAgaWYgKE1vZGVzW3NldHRpbmdzLmV4dGVuZHNdKSB7XG4gICAgICAgIE1vZGVzW25hbWVdLnBhcmVudCA9IE1vZGVzW3NldHRpbmdzLmV4dGVuZHNdOyAvLyBleHBsaWNpdCAnc3VwZXInIGNsYXNzIGFjY2Vzc1xuICAgIH1cblxuICAgIGZvciAodmFyIHMgaW4gc2V0dGluZ3MpIHtcbiAgICAgICAgTW9kZXNbbmFtZV1bc10gPSBzZXR0aW5nc1tzXTtcbiAgICB9XG5cbiAgICBNb2Rlc1tuYW1lXS5uYW1lID0gbmFtZTtcbiAgICByZXR1cm4gTW9kZXNbbmFtZV07XG59O1xuXG5cbi8vIEJ1aWx0LWluIHJlbmRlcmluZyBtb2Rlc1xuXG4vKioqIFBsYWluIHBvbHlnb25zICoqKi9cblxuTW9kZXMucG9seWdvbnMgPSBPYmplY3QuY3JlYXRlKFJlbmRlck1vZGUpO1xuTW9kZXMucG9seWdvbnMubmFtZSA9ICdwb2x5Z29ucyc7XG5cbk1vZGVzLnBvbHlnb25zLnZlcnRleF9zaGFkZXJfa2V5ID0gJ3BvbHlnb25fdmVydGV4Jztcbk1vZGVzLnBvbHlnb25zLmZyYWdtZW50X3NoYWRlcl9rZXkgPSAncG9seWdvbl9mcmFnbWVudCc7XG5cbk1vZGVzLnBvbHlnb25zLmRlZmluZXMgPSB7XG4gICAgJ1dPUkxEX1BPU0lUSU9OX1dSQVAnOiAxMDAwMDAgLy8gZGVmYXVsdCB3b3JsZCBjb29yZHMgdG8gd3JhcCBldmVyeSAxMDAsMDAwIG1ldGVycywgY2FuIHR1cm4gb2ZmIGJ5IHNldHRpbmcgdGhpcyB0byAnZmFsc2UnXG59O1xuXG5Nb2Rlcy5wb2x5Z29ucy5zZWxlY3Rpb24gPSB0cnVlO1xuXG5Nb2Rlcy5wb2x5Z29ucy5faW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZlcnRleF9sYXlvdXQgPSBuZXcgR0xWZXJ0ZXhMYXlvdXQodGhpcy5nbCwgW1xuICAgICAgICB7IG5hbWU6ICdhX3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9ub3JtYWwnLCBzaXplOiAzLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9zZWxlY3Rpb25fY29sb3InLCBzaXplOiA0LCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgc2l6ZTogMSwgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuICAgIF0pO1xufTtcblxuTW9kZXMucG9seWdvbnMuYnVpbGRQb2x5Z29ucyA9IGZ1bmN0aW9uIChwb2x5Z29ucywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgLy8gT3V0bGluZXMgaGF2ZSBhIHNsaWdodGx5IGRpZmZlcmVudCBzZXQgb2YgY29uc3RhbnRzLCBiZWNhdXNlIHRoZSBsYXllciBudW1iZXIgaXMgbW9kaWZpZWRcbiAgICBpZiAoc3R5bGUub3V0bGluZS5jb2xvcikge1xuICAgICAgICB2YXIgb3V0bGluZV92ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICAgICAgc3R5bGUub3V0bGluZS5jb2xvclswXSwgc3R5bGUub3V0bGluZS5jb2xvclsxXSwgc3R5bGUub3V0bGluZS5jb2xvclsyXSxcbiAgICAgICAgICAgIHN0eWxlLnNlbGVjdGlvbi5jb2xvclswXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzFdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMl0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclszXSxcbiAgICAgICAgICAgIHN0eWxlLmxheWVyX251bSAtIDAuNSAvLyBvdXRsaW5lcyBzaXQgYmV0d2VlbiBsYXllcnMsIHVuZGVybmVhdGggY3VycmVudCBsYXllciBidXQgYWJvdmUgdGhlIG9uZSBiZWxvd1xuICAgICAgICBdO1xuICAgIH1cblxuICAgIC8vIEV4dHJ1ZGVkIHBvbHlnb25zIChlLmcuIDNEIGJ1aWxkaW5ncylcbiAgICBpZiAoc3R5bGUuZXh0cnVkZSAmJiBzdHlsZS5oZWlnaHQpIHtcbiAgICAgICAgR0xCdWlsZGVycy5idWlsZEV4dHJ1ZGVkUG9seWdvbnMoXG4gICAgICAgICAgICBwb2x5Z29ucyxcbiAgICAgICAgICAgIHN0eWxlLnosXG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQsXG4gICAgICAgICAgICBzdHlsZS5taW5faGVpZ2h0LFxuICAgICAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbiAgICAvLyBSZWd1bGFyIHBvbHlnb25zXG4gICAgZWxzZSB7XG4gICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5Z29ucyhcbiAgICAgICAgICAgIHBvbHlnb25zLFxuICAgICAgICAgICAgc3R5bGUueixcbiAgICAgICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5vcm1hbHM6IHRydWUsXG4gICAgICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIENhbGxiYWNrLWJhc2UgYnVpbGRlciAoZm9yIGZ1dHVyZSBleHBsb3JhdGlvbilcbiAgICAgICAgLy8gdmFyIG5vcm1hbF92ZXJ0ZXhfY29uc3RhbnRzID0gWzAsIDAsIDFdLmNvbmNhdCh2ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICAgICAgLy8gR0xCdWlsZGVycy5idWlsZFBvbHlnb25zMihcbiAgICAgICAgLy8gICAgIHBvbHlnb25zLFxuICAgICAgICAvLyAgICAgeixcbiAgICAgICAgLy8gICAgIGZ1bmN0aW9uICh2ZXJ0aWNlcykge1xuICAgICAgICAvLyAgICAgICAgIC8vIHZhciB2cyA9IHZlcnRpY2VzLnBvc2l0aW9ucztcbiAgICAgICAgLy8gICAgICAgICAvLyBmb3IgKHZhciB2IGluIHZzKSB7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vIHZhciBiYyA9IFsodiAlIDMpID8gMCA6IDEsICgodiArIDEpICUgMykgPyAwIDogMSwgKCh2ICsgMikgJSAzKSA/IDAgOiAxXTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgLy8gdmFyIGJjID0gW2NlbnRyb2lkLngsIGNlbnRyb2lkLnksIDBdO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAvLyB2c1t2XSA9IHZlcnRpY2VzLnBvc2l0aW9uc1t2XS5jb25jYXQoeiwgMCwgMCwgMSwgYmMpO1xuXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vIHZzW3ZdID0gdmVydGljZXMucG9zaXRpb25zW3ZdLmNvbmNhdCh6LCAwLCAwLCAxKTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgdnNbdl0gPSB2ZXJ0aWNlcy5wb3NpdGlvbnNbdl0uY29uY2F0KDAsIDAsIDEpO1xuICAgICAgICAvLyAgICAgICAgIC8vIH1cblxuICAgICAgICAvLyAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLnBvc2l0aW9ucywgbm9ybWFsX3ZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcblxuICAgICAgICAvLyAgICAgICAgIC8vIEdMLmFkZFZlcnRpY2VzQnlBdHRyaWJ1dGVMYXlvdXQoXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIFtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHsgbmFtZTogJ2FfcG9zaXRpb24nLCBkYXRhOiB2ZXJ0aWNlcy5wb3NpdGlvbnMgfSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHsgbmFtZTogJ2Ffbm9ybWFsJywgZGF0YTogWzAsIDAsIDFdIH0sXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgZGF0YTogW3N0eWxlLmNvbG9yWzBdLCBzdHlsZS5jb2xvclsxXSwgc3R5bGUuY29sb3JbMl1dIH0sXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgZGF0YTogc3R5bGUubGF5ZXJfbnVtIH1cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgXSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgdmVydGV4X2RhdGFcbiAgICAgICAgLy8gICAgICAgICAvLyApO1xuXG4gICAgICAgIC8vICAgICAgICAgLy8gR0wuYWRkVmVydGljZXNNdWx0aXBsZUF0dHJpYnV0ZXMoW3ZlcnRpY2VzLnBvc2l0aW9uc10sIG5vcm1hbF92ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICk7XG4gICAgfVxuXG4gICAgLy8gUG9seWdvbiBvdXRsaW5lc1xuICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yICYmIHN0eWxlLm91dGxpbmUud2lkdGgpIHtcbiAgICAgICAgZm9yICh2YXIgbXBjPTA7IG1wYyA8IHBvbHlnb25zLmxlbmd0aDsgbXBjKyspIHtcbiAgICAgICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMoXG4gICAgICAgICAgICAgICAgcG9seWdvbnNbbXBjXSxcbiAgICAgICAgICAgICAgICBzdHlsZS56LFxuICAgICAgICAgICAgICAgIHN0eWxlLm91dGxpbmUud2lkdGgsXG4gICAgICAgICAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjbG9zZWRfcG9seWdvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlX3RpbGVfZWRnZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IG91dGxpbmVfdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5Nb2Rlcy5wb2x5Z29ucy5idWlsZExpbmVzID0gZnVuY3Rpb24gKGxpbmVzLCBzdHlsZSwgdmVydGV4X2RhdGEpXG57XG4gICAgLy8gVE9PRDogcmVkdWNlIHJlZHVuZGFuY3kgb2YgY29uc3RhbnQgY2FsYyBiZXR3ZWVuIGJ1aWxkZXJzXG4gICAgLy8gQ29sb3IgYW5kIGxheWVyIG51bWJlciBhcmUgY3VycmVudGx5IGNvbnN0YW50IGFjcm9zcyB2ZXJ0aWNlc1xuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICBzdHlsZS5jb2xvclswXSwgc3R5bGUuY29sb3JbMV0sIHN0eWxlLmNvbG9yWzJdLFxuICAgICAgICBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMF0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsxXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzJdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbM10sXG4gICAgICAgIHN0eWxlLmxheWVyX251bVxuICAgIF07XG5cbiAgICAvLyBPdXRsaW5lcyBoYXZlIGEgc2xpZ2h0bHkgZGlmZmVyZW50IHNldCBvZiBjb25zdGFudHMsIGJlY2F1c2UgdGhlIGxheWVyIG51bWJlciBpcyBtb2RpZmllZFxuICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yKSB7XG4gICAgICAgIHZhciBvdXRsaW5lX3ZlcnRleF9jb25zdGFudHMgPSBbXG4gICAgICAgICAgICBzdHlsZS5vdXRsaW5lLmNvbG9yWzBdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzFdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzJdLFxuICAgICAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICAgICAgc3R5bGUubGF5ZXJfbnVtIC0gMC41IC8vIG91dGxpbmVzIHNpdCBiZXR3ZWVuIGxheWVycywgdW5kZXJuZWF0aCBjdXJyZW50IGxheWVyIGJ1dCBhYm92ZSB0aGUgb25lIGJlbG93XG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgLy8gTWFpbiBsaW5lc1xuICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMoXG4gICAgICAgIGxpbmVzLFxuICAgICAgICBzdHlsZS56LFxuICAgICAgICBzdHlsZS53aWR0aCxcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IHZlcnRleF9jb25zdGFudHNcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBMaW5lIG91dGxpbmVzXG4gICAgaWYgKHN0eWxlLm91dGxpbmUuY29sb3IgJiYgc3R5bGUub3V0bGluZS53aWR0aCkge1xuICAgICAgICBHTEJ1aWxkZXJzLmJ1aWxkUG9seWxpbmVzKFxuICAgICAgICAgICAgbGluZXMsXG4gICAgICAgICAgICBzdHlsZS56LFxuICAgICAgICAgICAgc3R5bGUud2lkdGggKyAyICogc3R5bGUub3V0bGluZS53aWR0aCxcbiAgICAgICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IG91dGxpbmVfdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbn07XG5cbk1vZGVzLnBvbHlnb25zLmJ1aWxkUG9pbnRzID0gZnVuY3Rpb24gKHBvaW50cywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIFRPT0Q6IHJlZHVjZSByZWR1bmRhbmN5IG9mIGNvbnN0YW50IGNhbGMgYmV0d2VlbiBidWlsZGVyc1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgR0xCdWlsZGVycy5idWlsZFF1YWRzRm9yUG9pbnRzKFxuICAgICAgICBwb2ludHMsXG4gICAgICAgIHN0eWxlLnNpemUgKiAyLFxuICAgICAgICBzdHlsZS5zaXplICogMixcbiAgICAgICAgc3R5bGUueixcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5vcm1hbHM6IHRydWUsXG4gICAgICAgICAgICB0ZXhjb29yZHM6IGZhbHNlLFxuICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICB9XG4gICAgKTtcbn07XG5cblxuLyoqKiBQb2ludHMgdy9zaW1wbGUgZGlzdGFuY2UgZmllbGQgcmVuZGVyaW5nICoqKi9cblxuTW9kZXMucG9pbnRzID0gT2JqZWN0LmNyZWF0ZShSZW5kZXJNb2RlKTtcbk1vZGVzLnBvaW50cy5uYW1lID0gJ3BvaW50cyc7XG5cbk1vZGVzLnBvaW50cy52ZXJ0ZXhfc2hhZGVyX2tleSA9ICdwb2ludF92ZXJ0ZXgnO1xuTW9kZXMucG9pbnRzLmZyYWdtZW50X3NoYWRlcl9rZXkgPSAncG9pbnRfZnJhZ21lbnQnO1xuXG5Nb2Rlcy5wb2ludHMuZGVmaW5lcyA9IHtcbiAgICAnRUZGRUNUX1NDUkVFTl9DT0xPUic6IHRydWVcbn07XG5cbk1vZGVzLnBvaW50cy5zZWxlY3Rpb24gPSB0cnVlO1xuXG5Nb2Rlcy5wb2ludHMuX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52ZXJ0ZXhfbGF5b3V0ID0gbmV3IEdMVmVydGV4TGF5b3V0KHRoaXMuZ2wsIFtcbiAgICAgICAgeyBuYW1lOiAnYV9wb3NpdGlvbicsIHNpemU6IDMsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2FfdGV4Y29vcmQnLCBzaXplOiAyLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9zZWxlY3Rpb25fY29sb3InLCBzaXplOiA0LCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgc2l6ZTogMSwgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuICAgIF0pO1xufTtcblxuTW9kZXMucG9pbnRzLmJ1aWxkUG9pbnRzID0gZnVuY3Rpb24gKHBvaW50cywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIFRPT0Q6IHJlZHVjZSByZWR1bmRhbmN5IG9mIGNvbnN0YW50IGNhbGMgYmV0d2VlbiBidWlsZGVyc1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgR0xCdWlsZGVycy5idWlsZFF1YWRzRm9yUG9pbnRzKFxuICAgICAgICBwb2ludHMsXG4gICAgICAgIHN0eWxlLnNpemUgKiAyLFxuICAgICAgICBzdHlsZS5zaXplICogMixcbiAgICAgICAgc3R5bGUueixcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5vcm1hbHM6IGZhbHNlLFxuICAgICAgICAgICAgdGV4Y29vcmRzOiB0cnVlLFxuICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICB9XG4gICAgKTtcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBNb2RlTWFuYWdlcjogTW9kZU1hbmFnZXIsXG4gICAgICAgIE1vZGVzOiBNb2Rlc1xuICAgIH07XG59XG4iLCIvLyBUaGluIEdMIHByb2dyYW0gd3JhcHAgdG8gY2FjaGUgdW5pZm9ybSBsb2NhdGlvbnMvdmFsdWVzLCBkbyBjb21waWxlLXRpbWUgcHJlLXByb2Nlc3Npbmdcbi8vIChpbmplY3RpbmcgI2RlZmluZXMgYW5kICNwcmFnbWEgdHJhbnNmb3JtcyBpbnRvIHNoYWRlcnMpLCBldGMuXG5cbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wuanMnKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XG52YXIgUXVldWUgPSByZXF1aXJlKCdxdWV1ZS1hc3luYycpO1xuXG5HTFByb2dyYW0uaWQgPSAwOyAvLyBhc3NpZ24gZWFjaCBwcm9ncmFtIGEgdW5pcXVlIGlkXG5HTFByb2dyYW0ucHJvZ3JhbXMgPSB7fTsgLy8gcHJvZ3JhbXMsIGJ5IGlkXG5cbmZ1bmN0aW9uIEdMUHJvZ3JhbSAoZ2wsIHZlcnRleF9zaGFkZXIsIGZyYWdtZW50X3NoYWRlciwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLnByb2dyYW0gPSBudWxsO1xuICAgIHRoaXMuY29tcGlsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmRlZmluZXMgPSBvcHRpb25zLmRlZmluZXMgfHwge307IC8vIGtleS92YWx1ZXMgaW5zZXJ0ZWQgYXMgI2RlZmluZXMgaW50byBzaGFkZXJzIGF0IGNvbXBpbGUtdGltZVxuICAgIHRoaXMudHJhbnNmb3JtcyA9IG9wdGlvbnMudHJhbnNmb3JtczsgLy8ga2V5L3ZhbHVlcyBmb3IgVVJMcyBvZiBibG9ja3MgdGhhdCBjYW4gYmUgaW5qZWN0ZWQgaW50byBzaGFkZXJzIGF0IGNvbXBpbGUtdGltZVxuICAgIHRoaXMudW5pZm9ybXMgPSB7fTsgLy8gcHJvZ3JhbSBsb2NhdGlvbnMgb2YgdW5pZm9ybXMsIHNldC91cGRhdGVkIGF0IGNvbXBpbGUtdGltZVxuICAgIHRoaXMuYXR0cmlicyA9IHt9OyAvLyBwcm9ncmFtIGxvY2F0aW9ucyBvZiB2ZXJ0ZXggYXR0cmlidXRlc1xuXG4gICAgdGhpcy52ZXJ0ZXhfc2hhZGVyID0gdmVydGV4X3NoYWRlcjtcbiAgICB0aGlzLmZyYWdtZW50X3NoYWRlciA9IGZyYWdtZW50X3NoYWRlcjtcblxuICAgIHRoaXMuaWQgPSBHTFByb2dyYW0uaWQrKztcbiAgICBHTFByb2dyYW0ucHJvZ3JhbXNbdGhpcy5pZF0gPSB0aGlzO1xuICAgIHRoaXMubmFtZSA9IG9wdGlvbnMubmFtZTsgLy8gY2FuIHByb3ZpZGUgYSBwcm9ncmFtIG5hbWUgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKVxuXG4gICAgdGhpcy5jb21waWxlKG9wdGlvbnMuY2FsbGJhY2spO1xufTtcblxuLy8gVXNlIHByb2dyYW0gd3JhcHBlciB3aXRoIHNpbXBsZSBzdGF0ZSBjYWNoZVxuR0xQcm9ncmFtLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiAoKVxue1xuICAgIGlmICghdGhpcy5jb21waWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKEdMUHJvZ3JhbS5jdXJyZW50ICE9IHRoaXMpIHtcbiAgICAgICAgdGhpcy5nbC51c2VQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG4gICAgfVxuICAgIEdMUHJvZ3JhbS5jdXJyZW50ID0gdGhpcztcbn07XG5HTFByb2dyYW0uY3VycmVudCA9IG51bGw7XG5cbi8vIEdsb2JhbCBkZWZpbmVzIGFwcGxpZWQgdG8gYWxsIHByb2dyYW1zIChkdXBsaWNhdGUgcHJvcGVydGllcyBmb3IgYSBzcGVjaWZpYyBwcm9ncmFtIHdpbGwgdGFrZSBwcmVjZWRlbmNlKVxuR0xQcm9ncmFtLmRlZmluZXMgPSB7fTtcblxuR0xQcm9ncmFtLnByb3RvdHlwZS5jb21waWxlID0gZnVuY3Rpb24gKGNhbGxiYWNrKVxue1xuICAgIHZhciBxdWV1ZSA9IFF1ZXVlKCk7XG5cbiAgICAvLyBDb3B5IHNvdXJjZXMgZnJvbSBwcmUtbW9kaWZpZWQgdGVtcGxhdGVcbiAgICB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIgPSB0aGlzLnZlcnRleF9zaGFkZXI7XG4gICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSB0aGlzLmZyYWdtZW50X3NoYWRlcjtcblxuICAgIC8vIE1ha2UgbGlzdCBvZiBkZWZpbmVzIHRvIGJlIGluamVjdGVkIGxhdGVyXG4gICAgdmFyIGRlZmluZXMgPSB0aGlzLmJ1aWxkRGVmaW5lTGlzdCgpO1xuXG4gICAgLy8gSW5qZWN0IHVzZXItZGVmaW5lZCB0cmFuc2Zvcm1zIChhcmJpdHJhcnkgY29kZSBwb2ludHMgbWF0Y2hpbmcgbmFtZWQgI3ByYWdtYXMpXG4gICAgLy8gUmVwbGFjZSBhY2NvcmRpbmcgdG8gdGhpcyBwYXR0ZXJuOlxuICAgIC8vICNwcmFnbWEgdGFuZ3JhbTogW2tleV1cbiAgICAvLyBlLmcuICNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xuXG4gICAgLy8gVE9ETzogZmxhZyB0byBhdm9pZCByZS1yZXRyaWV2aW5nIHRyYW5zZm9ybSBVUkxzIG92ZXIgbmV0d29yayB3aGVuIHJlYnVpbGRpbmc/XG4gICAgLy8gVE9ETzogc3VwcG9ydCBnbHNsaWZ5ICNwcmFnbWEgZXhwb3J0IG5hbWVzIGZvciBiZXR0ZXIgY29tcGF0aWJpbGl0eT8gKGUuZy4gcmVuYW1lIG1haW4oKSBmdW5jdGlvbnMpXG4gICAgLy8gVE9ETzogYXV0by1pbnNlcnQgdW5pZm9ybXMgcmVmZXJlbmNlZCBpbiBtb2RlIGRlZmluaXRpb24sIGJ1dCBub3QgaW4gc2hhZGVyIGJhc2Ugb3IgdHJhbnNmb3Jtcz8gKHByb2JsZW06IGRvbid0IGhhdmUgYWNjZXNzIHRvIHVuaWZvcm0gbGlzdC90eXBlIGhlcmUpXG5cbiAgICAvLyBHYXRoZXIgYWxsIHRyYW5zZm9ybSBjb2RlIHNuaXBwZXRzIChjYW4gYmUgZWl0aGVyIGlubGluZSBpbiB0aGUgc3R5bGUgZmlsZSwgb3Igb3ZlciB0aGUgbmV0d29yayB2aWEgVVJMKVxuICAgIC8vIFRoaXMgaXMgYW4gYXN5bmMgcHJvY2Vzcywgc2luY2UgY29kZSBtYXkgYmUgcmV0cmlldmVkIHJlbW90ZWx5XG4gICAgdmFyIHJlZ2V4cDtcbiAgICB2YXIgbG9hZGVkX3RyYW5zZm9ybXMgPSB7fTsgLy8gbWFzdGVyIGxpc3Qgb2YgdHJhbnNmb3Jtcywgd2l0aCBhbiBvcmRlcmVkIGxpc3QgZm9yIGVhY2ggKHNpbmNlIHdlIHdhbnQgdG8gZ3VhcmFudGVlIG9yZGVyIG9mIHRyYW5zZm9ybXMpXG4gICAgaWYgKHRoaXMudHJhbnNmb3JtcyAhPSBudWxsKSB7XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMudHJhbnNmb3Jtcykge1xuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybSA9IHRoaXMudHJhbnNmb3Jtc1trZXldO1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVhY2ggY29kZSBwb2ludCBjYW4gYmUgYSBzaW5nbGUgaXRlbSAoc3RyaW5nIG9yIGhhc2ggb2JqZWN0KSBvciBhIGxpc3QgKGFycmF5IG9iamVjdCB3aXRoIG5vbi16ZXJvIGxlbmd0aClcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdHJhbnNmb3JtID09ICdzdHJpbmcnIHx8ICh0eXBlb2YgdHJhbnNmb3JtID09ICdvYmplY3QnICYmIHRyYW5zZm9ybS5sZW5ndGggPT0gbnVsbCkpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm0gPSBbdHJhbnNmb3JtXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmlyc3QgZmluZCBjb2RlIHJlcGxhY2UgcG9pbnRzIGluIHNoYWRlcnNcbiAgICAgICAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCdeXFxcXHMqI3ByYWdtYVxcXFxzK3RhbmdyYW06XFxcXHMrJyArIGtleSArICdcXFxccyokJywgJ20nKTtcbiAgICAgICAgICAgIHZhciBpbmplY3RfdmVydGV4ID0gdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyLm1hdGNoKHJlZ2V4cCk7XG4gICAgICAgICAgICB2YXIgaW5qZWN0X2ZyYWdtZW50ID0gdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIubWF0Y2gocmVnZXhwKTtcblxuICAgICAgICAgICAgLy8gQXZvaWQgbmV0d29yayByZXF1ZXN0IGlmIG5vdGhpbmcgdG8gcmVwbGFjZVxuICAgICAgICAgICAgaWYgKGluamVjdF92ZXJ0ZXggPT0gbnVsbCAmJiBpbmplY3RfZnJhZ21lbnQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDb2xsZWN0IGFsbCB0cmFuc2Zvcm1zIGZvciB0aGlzIHR5cGVcbiAgICAgICAgICAgIGxvYWRlZF90cmFuc2Zvcm1zW2tleV0gPSB7fTtcbiAgICAgICAgICAgIGxvYWRlZF90cmFuc2Zvcm1zW2tleV0ucmVnZXhwID0gbmV3IFJlZ0V4cChyZWdleHApOyAvLyBzYXZlIHJlZ2V4cCBzbyB3ZSBjYW4gaW5qZWN0IGxhdGVyIHdpdGhvdXQgaGF2aW5nIHRvIHJlY3JlYXRlIGl0XG4gICAgICAgICAgICBsb2FkZWRfdHJhbnNmb3Jtc1trZXldLmluamVjdF92ZXJ0ZXggPSAoaW5qZWN0X3ZlcnRleCAhPSBudWxsKTsgLy8gc2F2ZSByZWdleHAgY29kZSBwb2ludCBtYXRjaGVzIHNvIHdlIGRvbid0IGhhdmUgdG8gZG8gdGhlbSBhZ2FpblxuICAgICAgICAgICAgbG9hZGVkX3RyYW5zZm9ybXNba2V5XS5pbmplY3RfZnJhZ21lbnQgPSAoaW5qZWN0X2ZyYWdtZW50ICE9IG51bGwpO1xuICAgICAgICAgICAgbG9hZGVkX3RyYW5zZm9ybXNba2V5XS5saXN0ID0gW107XG5cbiAgICAgICAgICAgIC8vIEdldCB0aGUgY29kZSAocG9zc2libHkgb3ZlciB0aGUgbmV0d29yaywgc28gbmVlZHMgdG8gYmUgYXN5bmMpXG4gICAgICAgICAgICBmb3IgKHZhciB1PTA7IHUgPCB0cmFuc2Zvcm0ubGVuZ3RoOyB1KyspIHtcbiAgICAgICAgICAgICAgICBxdWV1ZS5kZWZlcihHTFByb2dyYW0ubG9hZFRyYW5zZm9ybSwgbG9hZGVkX3RyYW5zZm9ybXMsIHRyYW5zZm9ybVt1XSwga2V5LCB1KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGEgI2RlZmluZSBmb3IgdGhpcyBpbmplY3Rpb24gcG9pbnRcbiAgICAgICAgICAgIGRlZmluZXNbJ1RBTkdSQU1fVFJBTlNGT1JNXycgKyBrZXkucmVwbGFjZSgnICcsICdfJykudG9VcHBlckNhc2UoKV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2hlbiBhbGwgdHJhbnNmb3JtIGNvZGUgc25pcHBldHMgYXJlIGNvbGxlY3RlZCwgY29tYmluZSBhbmQgaW5qZWN0IHRoZW1cbiAgICBxdWV1ZS5hd2FpdChmdW5jdGlvbihlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3IgbG9hZGluZyB0cmFuc2Zvcm1zOiBcIiArIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERvIHRoZSBjb2RlIGluamVjdGlvbiB3aXRoIHRoZSBjb2xsZWN0ZWQgc291cmNlc1xuICAgICAgICBmb3IgKHZhciB0IGluIGxvYWRlZF90cmFuc2Zvcm1zKSB7XG4gICAgICAgICAgICAvLyBDb25jYXRlbmF0ZVxuICAgICAgICAgICAgdmFyIGNvbWJpbmVkX3NvdXJjZSA9IFwiXCI7XG4gICAgICAgICAgICBmb3IgKHZhciBzPTA7IHMgPCBsb2FkZWRfdHJhbnNmb3Jtc1t0XS5saXN0Lmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICAgICAgY29tYmluZWRfc291cmNlICs9IGxvYWRlZF90cmFuc2Zvcm1zW3RdLmxpc3Rbc10gKyAnXFxuJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSW5qZWN0XG4gICAgICAgICAgICBpZiAobG9hZGVkX3RyYW5zZm9ybXNbdF0uaW5qZWN0X3ZlcnRleCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyID0gdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyLnJlcGxhY2UobG9hZGVkX3RyYW5zZm9ybXNbdF0ucmVnZXhwLCBjb21iaW5lZF9zb3VyY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxvYWRlZF90cmFuc2Zvcm1zW3RdLmluamVjdF9mcmFnbWVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlci5yZXBsYWNlKGxvYWRlZF90cmFuc2Zvcm1zW3RdLnJlZ2V4cCwgY29tYmluZWRfc291cmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsZWFuLXVwIGFueSAjcHJhZ21hcyB0aGF0IHdlcmVuJ3QgcmVwbGFjZWQgKHRvIHByZXZlbnQgY29tcGlsZXIgd2FybmluZ3MpXG4gICAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCdeXFxcXHMqI3ByYWdtYVxcXFxzK3RhbmdyYW06XFxcXHMrXFxcXHcrXFxcXHMqJCcsICdnbScpO1xuICAgICAgICB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIgPSB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIucmVwbGFjZShyZWdleHAsICcnKTtcbiAgICAgICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlci5yZXBsYWNlKHJlZ2V4cCwgJycpO1xuXG4gICAgICAgIC8vIEJ1aWxkICYgaW5qZWN0IGRlZmluZXNcbiAgICAgICAgLy8gVGhpcyBpcyBkb25lICphZnRlciogY29kZSBpbmplY3Rpb24gc28gdGhhdCB3ZSBjYW4gYWRkIGRlZmluZXMgZm9yIHdoaWNoIGNvZGUgcG9pbnRzIHdlcmUgaW5qZWN0ZWRcbiAgICAgICAgdmFyIGRlZmluZV9zdHIgPSBHTFByb2dyYW0uYnVpbGREZWZpbmVTdHJpbmcoZGVmaW5lcyk7XG4gICAgICAgIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciA9IGRlZmluZV9zdHIgKyB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXI7XG4gICAgICAgIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyID0gZGVmaW5lX3N0ciArIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyO1xuXG4gICAgICAgIC8vIEluY2x1ZGUgcHJvZ3JhbSBpbmZvIHVzZWZ1bCBmb3IgZGVidWdnaW5nXG4gICAgICAgIHZhciBpbmZvID0gKHRoaXMubmFtZSA/ICh0aGlzLm5hbWUgKyAnIC8gaWQgJyArIHRoaXMuaWQpIDogKCdpZCAnICsgdGhpcy5pZCkpO1xuICAgICAgICB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIgPSAnLy8gUHJvZ3JhbTogJyArIGluZm8gKyAnXFxuJyArIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlcjtcbiAgICAgICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSAnLy8gUHJvZ3JhbTogJyArIGluZm8gKyAnXFxuJyArIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyO1xuXG4gICAgICAgIC8vIENvbXBpbGUgJiBzZXQgdW5pZm9ybXMgdG8gY2FjaGVkIHZhbHVlc1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5wcm9ncmFtID0gR0wudXBkYXRlUHJvZ3JhbSh0aGlzLmdsLCB0aGlzLnByb2dyYW0sIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciwgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIpO1xuICAgICAgICAgICAgLy8gdGhpcy5wcm9ncmFtID0gR0wudXBkYXRlUHJvZ3JhbSh0aGlzLmdsLCBudWxsLCB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIsIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyKTtcbiAgICAgICAgICAgIHRoaXMuY29tcGlsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLnByb2dyYW0gPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5jb21waWxlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51c2UoKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoVW5pZm9ybXMoKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoQXR0cmlidXRlcygpO1xuXG4gICAgICAgIC8vIE5vdGlmeSBjYWxsZXJcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbi8vIFJldHJpZXZlIGEgc2luZ2xlIHRyYW5zZm9ybSwgZm9yIGEgZ2l2ZW4gaW5qZWN0aW9uIHBvaW50LCBhdCBhIGNlcnRhaW4gaW5kZXggKHRvIHByZXNlcnZlIG9yaWdpbmFsIG9yZGVyKVxuLy8gQ2FuIGJlIGFzeW5jLCBjYWxscyAnY29tcGxldGUnIGNhbGxiYWNrIHdoZW4gZG9uZVxuR0xQcm9ncmFtLmxvYWRUcmFuc2Zvcm0gPSBmdW5jdGlvbiAodHJhbnNmb3JtcywgYmxvY2ssIGtleSwgaW5kZXgsIGNvbXBsZXRlKSB7XG4gICAgLy8gQ2FuIGJlIGFuIGlubGluZSBibG9jayBvZiBHTFNMLCBvciBhIFVSTCB0byByZXRyaWV2ZSBHTFNMIGJsb2NrIGZyb21cbiAgICB2YXIgdHlwZSwgdmFsdWUsIHNvdXJjZTtcblxuICAgIC8vIElubGluZSBjb2RlXG4gICAgaWYgKHR5cGVvZiBibG9jayA9PSAnc3RyaW5nJykge1xuICAgICAgICB0cmFuc2Zvcm1zW2tleV0ubGlzdFtpbmRleF0gPSBibG9jaztcbiAgICAgICAgY29tcGxldGUoKTtcbiAgICB9XG4gICAgLy8gUmVtb3RlIGNvZGVcbiAgICBlbHNlIGlmICh0eXBlb2YgYmxvY2sgPT0gJ29iamVjdCcgJiYgYmxvY2sudXJsKSB7XG4gICAgICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc291cmNlID0gcmVxLnJlc3BvbnNlO1xuICAgICAgICAgICAgdHJhbnNmb3Jtc1trZXldLmxpc3RbaW5kZXhdID0gc291cmNlO1xuICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxLm9wZW4oJ0dFVCcsIFV0aWxzLnVybEZvclBhdGgoYmxvY2sudXJsKSArICc/JyArICgrbmV3IERhdGUoKSksIHRydWUgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgICAgIHJlcS5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgICAgIHJlcS5zZW5kKCk7XG4gICAgfVxufTtcblxuLy8gTWFrZSBsaXN0IG9mIGRlZmluZXMgKGdsb2JhbCwgdGhlbiBwcm9ncmFtLXNwZWNpZmljKVxuR0xQcm9ncmFtLnByb3RvdHlwZS5idWlsZERlZmluZUxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRlZmluZXMgPSB7fTtcbiAgICBmb3IgKHZhciBkIGluIEdMUHJvZ3JhbS5kZWZpbmVzKSB7XG4gICAgICAgIGRlZmluZXNbZF0gPSBHTFByb2dyYW0uZGVmaW5lc1tkXTtcbiAgICB9XG4gICAgZm9yICh2YXIgZCBpbiB0aGlzLmRlZmluZXMpIHtcbiAgICAgICAgZGVmaW5lc1tkXSA9IHRoaXMuZGVmaW5lc1tkXTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmluZXM7XG59O1xuXG4vLyBUdXJuICNkZWZpbmVzIGludG8gYSBjb21iaW5lZCBzdHJpbmdcbkdMUHJvZ3JhbS5idWlsZERlZmluZVN0cmluZyA9IGZ1bmN0aW9uIChkZWZpbmVzKSB7XG4gICAgdmFyIGRlZmluZV9zdHIgPSBcIlwiO1xuICAgIGZvciAodmFyIGQgaW4gZGVmaW5lcykge1xuICAgICAgICBpZiAoZGVmaW5lc1tkXSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZXNbZF0gPT0gJ2Jvb2xlYW4nICYmIGRlZmluZXNbZF0gPT0gdHJ1ZSkgeyAvLyBib29sZWFucyBhcmUgc2ltcGxlIGRlZmluZXMgd2l0aCBubyB2YWx1ZVxuICAgICAgICAgICAgZGVmaW5lX3N0ciArPSBcIiNkZWZpbmUgXCIgKyBkICsgXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lc1tkXSA9PSAnbnVtYmVyJyAmJiBNYXRoLmZsb29yKGRlZmluZXNbZF0pID09IGRlZmluZXNbZF0pIHsgLy8gaW50IHRvIGZsb2F0IGNvbnZlcnNpb24gdG8gc2F0aXNmeSBHTFNMIGZsb2F0c1xuICAgICAgICAgICAgZGVmaW5lX3N0ciArPSBcIiNkZWZpbmUgXCIgKyBkICsgXCIgXCIgKyBkZWZpbmVzW2RdLnRvRml4ZWQoMSkgKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvLyBhbnkgb3RoZXIgZmxvYXQgb3Igc3RyaW5nIHZhbHVlXG4gICAgICAgICAgICBkZWZpbmVfc3RyICs9IFwiI2RlZmluZSBcIiArIGQgKyBcIiBcIiArIGRlZmluZXNbZF0gKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZWZpbmVfc3RyO1xufTtcblxuLy8gZXg6IHByb2dyYW0udW5pZm9ybSgnM2YnLCAncG9zaXRpb24nLCB4LCB5LCB6KTtcbi8vIFRPRE86IG9ubHkgdXBkYXRlIHVuaWZvcm1zIHdoZW4gY2hhbmdlZFxuR0xQcm9ncmFtLnByb3RvdHlwZS51bmlmb3JtID0gZnVuY3Rpb24gKG1ldGhvZCwgbmFtZSkgLy8gbWV0aG9kLWFwcHJvcHJpYXRlIGFyZ3VtZW50cyBmb2xsb3dcbntcbiAgICBpZiAoIXRoaXMuY29tcGlsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB1bmlmb3JtID0gKHRoaXMudW5pZm9ybXNbbmFtZV0gPSB0aGlzLnVuaWZvcm1zW25hbWVdIHx8IHt9KTtcbiAgICB1bmlmb3JtLm5hbWUgPSBuYW1lO1xuICAgIHVuaWZvcm0ubG9jYXRpb24gPSB1bmlmb3JtLmxvY2F0aW9uIHx8IHRoaXMuZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgbmFtZSk7XG4gICAgdW5pZm9ybS5tZXRob2QgPSAndW5pZm9ybScgKyBtZXRob2Q7XG4gICAgdW5pZm9ybS52YWx1ZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHRoaXMudXBkYXRlVW5pZm9ybShuYW1lKTtcbn07XG5cbi8vIFNldCBhIHNpbmdsZSB1bmlmb3JtXG5HTFByb2dyYW0ucHJvdG90eXBlLnVwZGF0ZVVuaWZvcm0gPSBmdW5jdGlvbiAobmFtZSlcbntcbiAgICBpZiAoIXRoaXMuY29tcGlsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB1bmlmb3JtID0gdGhpcy51bmlmb3Jtc1tuYW1lXTtcbiAgICBpZiAodW5pZm9ybSA9PSBudWxsIHx8IHVuaWZvcm0ubG9jYXRpb24gPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy51c2UoKTtcbiAgICB0aGlzLmdsW3VuaWZvcm0ubWV0aG9kXS5hcHBseSh0aGlzLmdsLCBbdW5pZm9ybS5sb2NhdGlvbl0uY29uY2F0KHVuaWZvcm0udmFsdWVzKSk7IC8vIGNhbGwgYXBwcm9wcmlhdGUgR0wgdW5pZm9ybSBtZXRob2QgYW5kIHBhc3MgdGhyb3VnaCBhcmd1bWVudHNcbn07XG5cbi8vIFJlZnJlc2ggdW5pZm9ybSBsb2NhdGlvbnMgYW5kIHNldCB0byBsYXN0IGNhY2hlZCB2YWx1ZXNcbkdMUHJvZ3JhbS5wcm90b3R5cGUucmVmcmVzaFVuaWZvcm1zID0gZnVuY3Rpb24gKClcbntcbiAgICBpZiAoIXRoaXMuY29tcGlsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAodmFyIHUgaW4gdGhpcy51bmlmb3Jtcykge1xuICAgICAgICB0aGlzLnVuaWZvcm1zW3VdLmxvY2F0aW9uID0gdGhpcy5nbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5wcm9ncmFtLCB1KTtcbiAgICAgICAgdGhpcy51cGRhdGVVbmlmb3JtKHUpO1xuICAgIH1cbn07XG5cbkdMUHJvZ3JhbS5wcm90b3R5cGUucmVmcmVzaEF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIHZhciBsZW4gPSB0aGlzLmdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5wcm9ncmFtLCB0aGlzLmdsLkFDVElWRV9BVFRSSUJVVEVTKTtcbiAgICAvLyBmb3IgKHZhciBpPTA7IGkgPCBsZW47IGkrKykge1xuICAgIC8vICAgICB2YXIgYSA9IHRoaXMuZ2wuZ2V0QWN0aXZlQXR0cmliKHRoaXMucHJvZ3JhbSwgaSk7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKGEpO1xuICAgIC8vIH1cbiAgICB0aGlzLmF0dHJpYnMgPSB7fTtcbn07XG5cbi8vIEdldCB0aGUgbG9jYXRpb24gb2YgYSB2ZXJ0ZXggYXR0cmlidXRlXG5HTFByb2dyYW0ucHJvdG90eXBlLmF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChuYW1lKVxue1xuICAgIGlmICghdGhpcy5jb21waWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGF0dHJpYiA9ICh0aGlzLmF0dHJpYnNbbmFtZV0gPSB0aGlzLmF0dHJpYnNbbmFtZV0gfHwge30pO1xuICAgIGlmIChhdHRyaWIubG9jYXRpb24gIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gYXR0cmliO1xuICAgIH1cblxuICAgIGF0dHJpYi5uYW1lID0gbmFtZTtcbiAgICBhdHRyaWIubG9jYXRpb24gPSB0aGlzLmdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgbmFtZSk7XG5cbiAgICAvLyB2YXIgaW5mbyA9IHRoaXMuZ2wuZ2V0QWN0aXZlQXR0cmliKHRoaXMucHJvZ3JhbSwgYXR0cmliLmxvY2F0aW9uKTtcbiAgICAvLyBhdHRyaWIudHlwZSA9IGluZm8udHlwZTtcbiAgICAvLyBhdHRyaWIuc2l6ZSA9IGluZm8uc2l6ZTtcblxuICAgIHJldHVybiBhdHRyaWI7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdMUHJvZ3JhbTtcbn1cbiIsIi8vIEdlbmVyYXRlZCBmcm9tIEdMU0wgZmlsZXMsIGRvbid0IGVkaXQhXG52YXIgc2hhZGVyX3NvdXJjZXMgPSB7fTtcblxuc2hhZGVyX3NvdXJjZXNbJ3BvaW50X2ZyYWdtZW50J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3Jlc29sdXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMiB2X3RleGNvb3JkO1xcblwiICtcblwidm9pZCBtYWluKHZvaWQpIHtcXG5cIiArXG5cIiAgdmVjMyBjb2xvciA9IHZfY29sb3I7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRpbmcgPSB2ZWMzKDEuKTtcXG5cIiArXG5cIiAgZmxvYXQgbGVuID0gbGVuZ3RoKHZfdGV4Y29vcmQpO1xcblwiICtcblwiICBpZihsZW4gPiAxLikge1xcblwiICtcblwiICAgIGRpc2NhcmQ7XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgY29sb3IgKj0gKDEuIC0gc21vb3Roc3RlcCguMjUsIDEuLCBsZW4pKSArIDAuNTtcXG5cIiArXG5cIiAgI3ByYWdtYSB0YW5ncmFtOiBmcmFnbWVudFxcblwiICtcblwiICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yLCAxLik7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuc2hhZGVyX3NvdXJjZXNbJ3BvaW50X3ZlcnRleCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV90aWxlX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV9tZXRlcl92aWV3O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X251bV9sYXllcnM7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX3Bvc2l0aW9uO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzIgYV90ZXhjb29yZDtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfY29sb3I7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgZmxvYXQgYV9sYXllcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwidmFyeWluZyB2ZWMyIHZfdGV4Y29vcmQ7XFxuXCIgK1xuXCIjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIlxcblwiICtcblwiYXR0cmlidXRlIHZlYzQgYV9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiZmxvYXQgYV94X2NhbGN1bGF0ZVooZmxvYXQgeiwgZmxvYXQgbGF5ZXIsIGNvbnN0IGZsb2F0IG51bV9sYXllcnMsIGNvbnN0IGZsb2F0IHpfbGF5ZXJfc2NhbGUpIHtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllcl9yYW5nZSA9IChudW1fbGF5ZXJzICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllciA9IChsYXllciArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIHogPSB6X2xheWVyICsgY2xhbXAoeiwgMC4sIHpfbGF5ZXJfc2NhbGUpO1xcblwiICtcblwiICB6ID0gKHpfbGF5ZXJfcmFuZ2UgLSB6KSAvIHpfbGF5ZXJfcmFuZ2U7XFxuXCIgK1xuXCIgIHJldHVybiB6O1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbigpIHtcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiICBpZihhX3NlbGVjdGlvbl9jb2xvci54eXogPT0gdmVjMygwLikpIHtcXG5cIiArXG5cIiAgICBnbF9Qb3NpdGlvbiA9IHZlYzQoMC4pO1xcblwiICtcblwiICAgIHJldHVybjtcXG5cIiArXG5cIiAgfVxcblwiICtcblwiICB2X3NlbGVjdGlvbl9jb2xvciA9IGFfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgdmVjNCBwb3NpdGlvbiA9IHVfbWV0ZXJfdmlldyAqIHVfdGlsZV92aWV3ICogdmVjNChhX3Bvc2l0aW9uLCAxLik7XFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogdmVydGV4XFxuXCIgK1xuXCIgIHZfY29sb3IgPSBhX2NvbG9yO1xcblwiICtcblwiICB2X3RleGNvb3JkID0gYV90ZXhjb29yZDtcXG5cIiArXG5cIiAgcG9zaXRpb24ueiA9IGFfeF9jYWxjdWxhdGVaKHBvc2l0aW9uLnosIGFfbGF5ZXIsIHVfbnVtX2xheWVycywgMjU2Lik7XFxuXCIgK1xuXCIgIGdsX1Bvc2l0aW9uID0gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fZnJhZ21lbnQnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfcmVzb2x1dGlvbjtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X2FzcGVjdDtcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X21ldGVyX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWV0ZXJzX3Blcl9waXhlbDtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV90aW1lO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21hcF96b29tO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfbWFwX2NlbnRlcjtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3RpbGVfb3JpZ2luO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X3Rlc3Q7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfdGVzdDI7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3dvcmxkX3Bvc2l0aW9uO1xcblwiICtcblwiI2lmIGRlZmluZWQoV09STERfUE9TSVRJT05fV1JBUClcXG5cIiArXG5cIlxcblwiICtcblwidmVjMiB3b3JsZF9wb3NpdGlvbl9hbmNob3IgPSB2ZWMyKGZsb29yKHVfdGlsZV9vcmlnaW4gLyBXT1JMRF9QT1NJVElPTl9XUkFQKSAqIFdPUkxEX1BPU0lUSU9OX1dSQVApO1xcblwiICtcblwidmVjNCBhYnNvbHV0ZVdvcmxkUG9zaXRpb24oKSB7XFxuXCIgK1xuXCIgIHJldHVybiB2ZWM0KHZfd29ybGRfcG9zaXRpb24ueHkgKyB3b3JsZF9wb3NpdGlvbl9hbmNob3IsIHZfd29ybGRfcG9zaXRpb24ueiwgdl93b3JsZF9wb3NpdGlvbi53KTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNlbHNlXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzQgYWJzb2x1dGVXb3JsZFBvc2l0aW9uKCkge1xcblwiICtcblwiICByZXR1cm4gdl93b3JsZF9wb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgZGVmaW5lZChMSUdIVElOR19FTlZJUk9OTUVOVClcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSBzYW1wbGVyMkQgdV9lbnZfbWFwO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cIiNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3Bvc2l0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfbm9ybWFsO1xcblwiICtcblwiI2Vsc2VcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWMzIHZfbGlnaHRpbmc7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiY29uc3QgZmxvYXQgbGlnaHRfYW1iaWVudCA9IDAuNTtcXG5cIiArXG5cInZlYzMgYl94X3BvaW50TGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgY29sb3IgKj0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBjX3hfc3BlY3VsYXJMaWdodCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIGZsb2F0IGxpZ2h0X2FtYmllbnQsIGNvbnN0IGJvb2wgYmFja2xpZ2h0KSB7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIGxpZ2h0X3Bvcy54eXopO1xcblwiICtcblwiICB2ZWMzIHZpZXdfcG9zID0gdmVjMygwLiwgMC4sIDUwMC4pO1xcblwiICtcblwiICB2ZWMzIHZpZXdfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIHZpZXdfcG9zLnh5eik7XFxuXCIgK1xuXCIgIHZlYzMgc3BlY3VsYXJSZWZsZWN0aW9uO1xcblwiICtcblwiICBpZihkb3Qobm9ybWFsLCAtbGlnaHRfZGlyKSA8IDAuMCkge1xcblwiICtcblwiICAgIHNwZWN1bGFyUmVmbGVjdGlvbiA9IHZlYzMoMC4wLCAwLjAsIDAuMCk7XFxuXCIgK1xuXCIgIH0gZWxzZSB7XFxuXCIgK1xuXCIgICAgZmxvYXQgYXR0ZW51YXRpb24gPSAxLjA7XFxuXCIgK1xuXCIgICAgZmxvYXQgbGlnaHRTcGVjdWxhclRlcm0gPSAxLjA7XFxuXCIgK1xuXCIgICAgZmxvYXQgbWF0ZXJpYWxTcGVjdWxhclRlcm0gPSAxMC4wO1xcblwiICtcblwiICAgIGZsb2F0IG1hdGVyaWFsU2hpbmluZXNzVGVybSA9IDEwLjA7XFxuXCIgK1xuXCIgICAgc3BlY3VsYXJSZWZsZWN0aW9uID0gYXR0ZW51YXRpb24gKiB2ZWMzKGxpZ2h0U3BlY3VsYXJUZXJtKSAqIHZlYzMobWF0ZXJpYWxTcGVjdWxhclRlcm0pICogcG93KG1heCgwLjAsIGRvdChyZWZsZWN0KC1saWdodF9kaXIsIG5vcm1hbCksIHZpZXdfZGlyKSksIG1hdGVyaWFsU2hpbmluZXNzVGVybSk7XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgZmxvYXQgZGlmZnVzZSA9IGFicyhtYXgoZmxvYXQoYmFja2xpZ2h0KSAqIC0xLiwgZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkpKTtcXG5cIiArXG5cIiAgY29sb3IgKj0gZGlmZnVzZSArIHNwZWN1bGFyUmVmbGVjdGlvbiArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZF94X2RpcmVjdGlvbmFsTGlnaHQodmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzMgbGlnaHRfZGlyLCBmbG9hdCBsaWdodF9hbWJpZW50KSB7XFxuXCIgK1xuXCIgIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShsaWdodF9kaXIpO1xcblwiICtcblwiICBjb2xvciAqPSBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgYV94X2xpZ2h0aW5nKHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgdmVjNCBuaWdodF9saWdodF9wb3MsIHZlYzMgbGlnaHRfZGlyLCBmbG9hdCBsaWdodF9hbWJpZW50KSB7XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChMSUdIVElOR19QT0lOVClcXG5cIiArXG5cIiAgY29sb3IgPSBiX3hfcG9pbnRMaWdodChwb3NpdGlvbiwgbm9ybWFsLCBjb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCB0cnVlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19QT0lOVF9TUEVDVUxBUilcXG5cIiArXG5cIiAgY29sb3IgPSBjX3hfc3BlY3VsYXJMaWdodChwb3NpdGlvbiwgbm9ybWFsLCBjb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCB0cnVlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19OSUdIVClcXG5cIiArXG5cIiAgY29sb3IgPSBiX3hfcG9pbnRMaWdodChwb3NpdGlvbiwgbm9ybWFsLCBjb2xvciwgbmlnaHRfbGlnaHRfcG9zLCAwLiwgZmFsc2UpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKExJR0hUSU5HX0RJUkVDVElPTilcXG5cIiArXG5cIiAgY29sb3IgPSBkX3hfZGlyZWN0aW9uYWxMaWdodChub3JtYWwsIGNvbG9yLCBsaWdodF9kaXIsIGxpZ2h0X2FtYmllbnQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICBjb2xvciA9IGNvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjNCBlX3hfc3BoZXJpY2FsRW52aXJvbm1lbnRNYXAodmVjMyB2aWV3X3BvcywgdmVjMyBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHNhbXBsZXIyRCBlbnZtYXApIHtcXG5cIiArXG5cIiAgdmVjMyBleWUgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gdmlld19wb3MueHl6KTtcXG5cIiArXG5cIiAgaWYoZXllLnogPiAwLjAxKSB7XFxuXCIgK1xuXCIgICAgZXllLnogPSAwLjAxO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIHZlYzMgciA9IHJlZmxlY3QoZXllLCBub3JtYWwpO1xcblwiICtcblwiICBmbG9hdCBtID0gMi4gKiBzcXJ0KHBvdyhyLngsIDIuKSArIHBvdyhyLnksIDIuKSArIHBvdyhyLnogKyAxLiwgMi4pKTtcXG5cIiArXG5cIiAgdmVjMiB1diA9IHIueHkgLyBtICsgLjU7XFxuXCIgK1xuXCIgIHJldHVybiB0ZXh0dXJlMkQoZW52bWFwLCB1dik7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjcHJhZ21hIHRhbmdyYW06IGdsb2JhbHNcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluKHZvaWQpIHtcXG5cIiArXG5cIiAgdmVjMyBjb2xvciA9IHZfY29sb3I7XFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKExJR0hUSU5HX0VOVklST05NRU5UKVxcblwiICtcblwiICB2ZWMzIHZpZXdfcG9zID0gdmVjMygwLiwgMC4sIDEwMC4gKiB1X21ldGVyc19wZXJfcGl4ZWwpO1xcblwiICtcblwiICBjb2xvciA9IGVfeF9zcGhlcmljYWxFbnZpcm9ubWVudE1hcCh2aWV3X3Bvcywgdl9wb3NpdGlvbi54eXosIHZfbm9ybWFsLCB1X2Vudl9tYXApLnJnYjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKSAvLyBkZWZhdWx0IHRvIHBlci1waXhlbCBsaWdodGluZ1xcblwiICtcblwiICB2ZWMzIGxpZ2h0aW5nID0gYV94X2xpZ2h0aW5nKHZfcG9zaXRpb24sIHZfbm9ybWFsLCB2ZWMzKDEuKSwgdmVjNCgwLiwgMC4sIDE1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKSwgdmVjNCgwLiwgMC4sIDUwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCwgMS4pLCB2ZWMzKDAuMiwgMC43LCAtMC41KSwgbGlnaHRfYW1iaWVudCk7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRpbmcgPSB2X2xpZ2h0aW5nO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgdmVjMyBjb2xvcl9wcmVsaWdodCA9IGNvbG9yO1xcblwiICtcblwiICBjb2xvciAqPSBsaWdodGluZztcXG5cIiArXG5cIiAgI3ByYWdtYSB0YW5ncmFtOiBmcmFnbWVudFxcblwiICtcblwiICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yLCAxLjApO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydwb2x5Z29uX3ZlcnRleCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9yZXNvbHV0aW9uO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfYXNwZWN0O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X3RpbWU7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWFwX3pvb207XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9tYXBfY2VudGVyO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfdGlsZV9vcmlnaW47XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV90aWxlX3dvcmxkO1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfdGlsZV92aWV3O1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfbWV0ZXJfdmlldztcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9tZXRlcnNfcGVyX3BpeGVsO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X251bV9sYXllcnM7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX3Bvc2l0aW9uO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9ub3JtYWw7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX2NvbG9yO1xcblwiICtcblwiYXR0cmlidXRlIGZsb2F0IGFfbGF5ZXI7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl93b3JsZF9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwiI2lmIGRlZmluZWQoV09STERfUE9TSVRJT05fV1JBUClcXG5cIiArXG5cIlxcblwiICtcblwidmVjMiB3b3JsZF9wb3NpdGlvbl9hbmNob3IgPSB2ZWMyKGZsb29yKHVfdGlsZV9vcmlnaW4gLyBXT1JMRF9QT1NJVElPTl9XUkFQKSAqIFdPUkxEX1BPU0lUSU9OX1dSQVApO1xcblwiICtcblwidmVjNCBhYnNvbHV0ZVdvcmxkUG9zaXRpb24oKSB7XFxuXCIgK1xuXCIgIHJldHVybiB2ZWM0KHZfd29ybGRfcG9zaXRpb24ueHkgKyB3b3JsZF9wb3NpdGlvbl9hbmNob3IsIHZfd29ybGRfcG9zaXRpb24ueiwgdl93b3JsZF9wb3NpdGlvbi53KTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNlbHNlXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzQgYWJzb2x1dGVXb3JsZFBvc2l0aW9uKCkge1xcblwiICtcblwiICByZXR1cm4gdl93b3JsZF9wb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIlxcblwiICtcblwiYXR0cmlidXRlIHZlYzQgYV9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWM0IHZfcG9zaXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9ub3JtYWw7XFxuXCIgK1xuXCIjZWxzZVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9saWdodGluZztcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCJjb25zdCBmbG9hdCBsaWdodF9hbWJpZW50ID0gMC41O1xcblwiICtcblwidmVjNCBhX3hfcGVyc3BlY3RpdmUodmVjNCBwb3NpdGlvbiwgY29uc3QgdmVjMiBwZXJzcGVjdGl2ZV9vZmZzZXQsIGNvbnN0IHZlYzIgcGVyc3BlY3RpdmVfZmFjdG9yKSB7XFxuXCIgK1xuXCIgIHBvc2l0aW9uLnh5ICs9IHBvc2l0aW9uLnogKiBwZXJzcGVjdGl2ZV9mYWN0b3IgKiAocG9zaXRpb24ueHkgLSBwZXJzcGVjdGl2ZV9vZmZzZXQpO1xcblwiICtcblwiICByZXR1cm4gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWM0IGJfeF9pc29tZXRyaWModmVjNCBwb3NpdGlvbiwgY29uc3QgdmVjMiBheGlzLCBjb25zdCBmbG9hdCBtdWx0aXBsaWVyKSB7XFxuXCIgK1xuXCIgIHBvc2l0aW9uLnh5ICs9IHBvc2l0aW9uLnogKiBheGlzICogbXVsdGlwbGllciAvIHVfYXNwZWN0O1xcblwiICtcblwiICByZXR1cm4gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJmbG9hdCBjX3hfY2FsY3VsYXRlWihmbG9hdCB6LCBmbG9hdCBsYXllciwgY29uc3QgZmxvYXQgbnVtX2xheWVycywgY29uc3QgZmxvYXQgel9sYXllcl9zY2FsZSkge1xcblwiICtcblwiICBmbG9hdCB6X2xheWVyX3JhbmdlID0gKG51bV9sYXllcnMgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICBmbG9hdCB6X2xheWVyID0gKGxheWVyICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgeiA9IHpfbGF5ZXIgKyBjbGFtcCh6LCAwLiwgel9sYXllcl9zY2FsZSk7XFxuXCIgK1xuXCIgIHogPSAoel9sYXllcl9yYW5nZSAtIHopIC8gel9sYXllcl9yYW5nZTtcXG5cIiArXG5cIiAgcmV0dXJuIHo7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGVfeF9wb2ludExpZ2h0KHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgZmxvYXQgbGlnaHRfYW1iaWVudCwgY29uc3QgYm9vbCBiYWNrbGlnaHQpIHtcXG5cIiArXG5cIiAgdmVjMyBsaWdodF9kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gbGlnaHRfcG9zLnh5eik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGFicyhtYXgoZmxvYXQoYmFja2xpZ2h0KSAqIC0xLiwgZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkpKSArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZl94X3NwZWN1bGFyTGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgdmVjMyB2aWV3X3BvcyA9IHZlYzMoMC4sIDAuLCA1MDAuKTtcXG5cIiArXG5cIiAgdmVjMyB2aWV3X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSB2aWV3X3Bvcy54eXopO1xcblwiICtcblwiICB2ZWMzIHNwZWN1bGFyUmVmbGVjdGlvbjtcXG5cIiArXG5cIiAgaWYoZG90KG5vcm1hbCwgLWxpZ2h0X2RpcikgPCAwLjApIHtcXG5cIiArXG5cIiAgICBzcGVjdWxhclJlZmxlY3Rpb24gPSB2ZWMzKDAuMCwgMC4wLCAwLjApO1xcblwiICtcblwiICB9IGVsc2Uge1xcblwiICtcblwiICAgIGZsb2F0IGF0dGVudWF0aW9uID0gMS4wO1xcblwiICtcblwiICAgIGZsb2F0IGxpZ2h0U3BlY3VsYXJUZXJtID0gMS4wO1xcblwiICtcblwiICAgIGZsb2F0IG1hdGVyaWFsU3BlY3VsYXJUZXJtID0gMTAuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBtYXRlcmlhbFNoaW5pbmVzc1Rlcm0gPSAxMC4wO1xcblwiICtcblwiICAgIHNwZWN1bGFyUmVmbGVjdGlvbiA9IGF0dGVudWF0aW9uICogdmVjMyhsaWdodFNwZWN1bGFyVGVybSkgKiB2ZWMzKG1hdGVyaWFsU3BlY3VsYXJUZXJtKSAqIHBvdyhtYXgoMC4wLCBkb3QocmVmbGVjdCgtbGlnaHRfZGlyLCBub3JtYWwpLCB2aWV3X2RpcikpLCBtYXRlcmlhbFNoaW5pbmVzc1Rlcm0pO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIGZsb2F0IGRpZmZ1c2UgPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSk7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGRpZmZ1c2UgKyBzcGVjdWxhclJlZmxlY3Rpb24gKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGdfeF9kaXJlY3Rpb25hbExpZ2h0KHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBsaWdodF9kaXIgPSBub3JtYWxpemUobGlnaHRfZGlyKTtcXG5cIiArXG5cIiAgY29sb3IgKj0gZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGRfeF9saWdodGluZyh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIHZlYzQgbmlnaHRfbGlnaHRfcG9zLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoTElHSFRJTkdfUE9JTlQpXFxuXCIgK1xuXCIgIGNvbG9yID0gZV94X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgdHJ1ZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfUE9JTlRfU1BFQ1VMQVIpXFxuXCIgK1xuXCIgIGNvbG9yID0gZl94X3NwZWN1bGFyTGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgdHJ1ZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfTklHSFQpXFxuXCIgK1xuXCIgIGNvbG9yID0gZV94X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIG5pZ2h0X2xpZ2h0X3BvcywgMC4sIGZhbHNlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19ESVJFQ1RJT04pXFxuXCIgK1xuXCIgIGNvbG9yID0gZ194X2RpcmVjdGlvbmFsTGlnaHQobm9ybWFsLCBjb2xvciwgbGlnaHRfZGlyLCBsaWdodF9hbWJpZW50KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgY29sb3IgPSBjb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4oKSB7XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIiAgaWYoYV9zZWxlY3Rpb25fY29sb3IueHl6ID09IHZlYzMoMC4pKSB7XFxuXCIgK1xuXCIgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KDAuKTtcXG5cIiArXG5cIiAgICByZXR1cm47XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgdl9zZWxlY3Rpb25fY29sb3IgPSBhX3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHZlYzQgcG9zaXRpb24gPSB1X3RpbGVfdmlldyAqIHZlYzQoYV9wb3NpdGlvbiwgMS4pO1xcblwiICtcblwiICB2X3dvcmxkX3Bvc2l0aW9uID0gdV90aWxlX3dvcmxkICogdmVjNChhX3Bvc2l0aW9uLCAxLik7XFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKFdPUkxEX1BPU0lUSU9OX1dSQVApXFxuXCIgK1xuXCIgIHZfd29ybGRfcG9zaXRpb24ueHkgLT0gd29ybGRfcG9zaXRpb25fYW5jaG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogdmVydGV4XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCIgIHZfY29sb3IgPSBhX2NvbG9yO1xcblwiICtcblwiICB2X2xpZ2h0aW5nID0gZF94X2xpZ2h0aW5nKHBvc2l0aW9uLCBhX25vcm1hbCwgdmVjMygxLiksIHZlYzQoMC4sIDAuLCAxNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLiksIHZlYzQoMC4sIDAuLCA1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKSwgdmVjMygwLjIsIDAuNywgLTAuNSksIGxpZ2h0X2FtYmllbnQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICB2X3Bvc2l0aW9uID0gcG9zaXRpb247XFxuXCIgK1xuXCIgIHZfbm9ybWFsID0gYV9ub3JtYWw7XFxuXCIgK1xuXCIgIHZfY29sb3IgPSBhX2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgcG9zaXRpb24gPSB1X21ldGVyX3ZpZXcgKiBwb3NpdGlvbjtcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoUFJPSkVDVElPTl9QRVJTUEVDVElWRSlcXG5cIiArXG5cIiAgcG9zaXRpb24gPSBhX3hfcGVyc3BlY3RpdmUocG9zaXRpb24sIHZlYzIoMC4sIDAuKSwgdmVjMigwLjYsIDAuNikpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKFBST0pFQ1RJT05fSVNPTUVUUklDKSAvLyB8fCBkZWZpbmVkKFBST0pFQ1RJT05fUE9QVVApXFxuXCIgK1xuXCIgIHBvc2l0aW9uID0gYl94X2lzb21ldHJpYyhwb3NpdGlvbiwgdmVjMigwLiwgMS4pLCAxLik7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBwb3NpdGlvbi56ID0gY194X2NhbGN1bGF0ZVoocG9zaXRpb24ueiwgYV9sYXllciwgdV9udW1fbGF5ZXJzLCA0MDk2Lik7XFxuXCIgK1xuXCIgIGdsX1Bvc2l0aW9uID0gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuc2hhZGVyX3NvdXJjZXNbJ3NlbGVjdGlvbl9mcmFnbWVudCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWM0IHZfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbih2b2lkKSB7XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIiAgZ2xfRnJhZ0NvbG9yID0gdl9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIGdsX0ZyYWdDb2xvciA9IHZlYzMoMC4sIDAuLCAwLiwgMS4pO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuc2hhZGVyX3NvdXJjZXNbJ3NpbXBsZV9wb2x5Z29uX2ZyYWdtZW50J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9tZXRlcnNfcGVyX3BpeGVsO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCIjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X25vcm1hbDtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCJ2ZWMzIGFfeF9wb2ludExpZ2h0KHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgZmxvYXQgbGlnaHRfYW1iaWVudCwgY29uc3QgYm9vbCBiYWNrbGlnaHQpIHtcXG5cIiArXG5cIiAgdmVjMyBsaWdodF9kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gbGlnaHRfcG9zLnh5eik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGFicyhtYXgoZmxvYXQoYmFja2xpZ2h0KSAqIC0xLiwgZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkpKSArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4odm9pZCkge1xcblwiICtcblwiICB2ZWMzIGNvbG9yO1xcblwiICtcblwiICAjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKSAvLyBkZWZhdWx0IHRvIHBlci1waXhlbCBsaWdodGluZ1xcblwiICtcblwiICB2ZWM0IGxpZ2h0X3BvcyA9IHZlYzQoMC4sIDAuLCAxNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLik7XFxuXCIgK1xuXCIgIGNvbnN0IGZsb2F0IGxpZ2h0X2FtYmllbnQgPSAwLjU7XFxuXCIgK1xuXCIgIGNvbnN0IGJvb2wgYmFja2xpdCA9IHRydWU7XFxuXCIgK1xuXCIgIGNvbG9yID0gYV94X3BvaW50TGlnaHQodl9wb3NpdGlvbiwgdl9ub3JtYWwsIHZfY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgYmFja2xpdCk7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIGNvbG9yID0gdl9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjcHJhZ21hIHRhbmdyYW06IGZyYWdtZW50XFxuXCIgK1xuXCIgIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IsIDEuMCk7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuc2hhZGVyX3NvdXJjZXNbJ3NpbXBsZV9wb2x5Z29uX3ZlcnRleCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9hc3BlY3Q7XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV90aWxlX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV9tZXRlcl92aWV3O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21ldGVyc19wZXJfcGl4ZWw7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbnVtX2xheWVycztcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfcG9zaXRpb247XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX25vcm1hbDtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfY29sb3I7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgZmxvYXQgYV9sYXllcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwiI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWM0IHZfcG9zaXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9ub3JtYWw7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwidmVjNCBhX3hfcGVyc3BlY3RpdmUodmVjNCBwb3NpdGlvbiwgY29uc3QgdmVjMiBwZXJzcGVjdGl2ZV9vZmZzZXQsIGNvbnN0IHZlYzIgcGVyc3BlY3RpdmVfZmFjdG9yKSB7XFxuXCIgK1xuXCIgIHBvc2l0aW9uLnh5ICs9IHBvc2l0aW9uLnogKiBwZXJzcGVjdGl2ZV9mYWN0b3IgKiAocG9zaXRpb24ueHkgLSBwZXJzcGVjdGl2ZV9vZmZzZXQpO1xcblwiICtcblwiICByZXR1cm4gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWM0IGJfeF9pc29tZXRyaWModmVjNCBwb3NpdGlvbiwgY29uc3QgdmVjMiBheGlzLCBjb25zdCBmbG9hdCBtdWx0aXBsaWVyKSB7XFxuXCIgK1xuXCIgIHBvc2l0aW9uLnh5ICs9IHBvc2l0aW9uLnogKiBheGlzICogbXVsdGlwbGllciAvIHVfYXNwZWN0O1xcblwiICtcblwiICByZXR1cm4gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJmbG9hdCBjX3hfY2FsY3VsYXRlWihmbG9hdCB6LCBmbG9hdCBsYXllciwgY29uc3QgZmxvYXQgbnVtX2xheWVycywgY29uc3QgZmxvYXQgel9sYXllcl9zY2FsZSkge1xcblwiICtcblwiICBmbG9hdCB6X2xheWVyX3JhbmdlID0gKG51bV9sYXllcnMgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICBmbG9hdCB6X2xheWVyID0gKGxheWVyICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgeiA9IHpfbGF5ZXIgKyBjbGFtcCh6LCAwLiwgel9sYXllcl9zY2FsZSk7XFxuXCIgK1xuXCIgIHogPSAoel9sYXllcl9yYW5nZSAtIHopIC8gel9sYXllcl9yYW5nZTtcXG5cIiArXG5cIiAgcmV0dXJuIHo7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGRfeF9wb2ludExpZ2h0KHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgZmxvYXQgbGlnaHRfYW1iaWVudCwgY29uc3QgYm9vbCBiYWNrbGlnaHQpIHtcXG5cIiArXG5cIiAgdmVjMyBsaWdodF9kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gbGlnaHRfcG9zLnh5eik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGFicyhtYXgoZmxvYXQoYmFja2xpZ2h0KSAqIC0xLiwgZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkpKSArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4oKSB7XFxuXCIgK1xuXCIgIHZlYzQgcG9zaXRpb24gPSB1X3RpbGVfdmlldyAqIHZlYzQoYV9wb3NpdGlvbiwgMS4pO1xcblwiICtcblwiICAjcHJhZ21hIHRhbmdyYW06IHZlcnRleFxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiICB2ZWM0IGxpZ2h0X3BvcyA9IHZlYzQoMC4sIDAuLCAxNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLik7XFxuXCIgK1xuXCIgIGNvbnN0IGZsb2F0IGxpZ2h0X2FtYmllbnQgPSAwLjU7XFxuXCIgK1xuXCIgIGNvbnN0IGJvb2wgYmFja2xpdCA9IHRydWU7XFxuXCIgK1xuXCIgIHZfY29sb3IgPSBkX3hfcG9pbnRMaWdodChwb3NpdGlvbiwgYV9ub3JtYWwsIGFfY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgYmFja2xpdCk7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIHZfcG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIiAgdl9ub3JtYWwgPSBhX25vcm1hbDtcXG5cIiArXG5cIiAgdl9jb2xvciA9IGFfY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBwb3NpdGlvbiA9IHVfbWV0ZXJfdmlldyAqIHBvc2l0aW9uO1xcblwiICtcblwiICAjaWYgZGVmaW5lZChQUk9KRUNUSU9OX1BFUlNQRUNUSVZFKVxcblwiICtcblwiICBwb3NpdGlvbiA9IGFfeF9wZXJzcGVjdGl2ZShwb3NpdGlvbiwgdmVjMigtMC4yNSwgLTAuMjUpLCB2ZWMyKDAuNiwgMC42KSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoUFJPSkVDVElPTl9JU09NRVRSSUMpXFxuXCIgK1xuXCIgIHBvc2l0aW9uID0gYl94X2lzb21ldHJpYyhwb3NpdGlvbiwgdmVjMigwLiwgMS4pLCAxLik7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBwb3NpdGlvbi56ID0gY194X2NhbGN1bGF0ZVoocG9zaXRpb24ueiwgYV9sYXllciwgdV9udW1fbGF5ZXJzLCA0MDk2Lik7XFxuXCIgK1xuXCIgIGdsX1Bvc2l0aW9uID0gcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuaWYgKG1vZHVsZS5leHBvcnRzICE9PSB1bmRlZmluZWQpIHsgbW9kdWxlLmV4cG9ydHMgPSBzaGFkZXJfc291cmNlczsgfVxuXG4iLCIvLyBUZXh0dXJlIG1hbmFnZW1lbnRcblxudmFyIEdMID0gcmVxdWlyZSgnLi9nbC5qcycpO1xudmFyIFV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcblxuLy8gR2xvYmFsIHNldCBvZiB0ZXh0dXJlcywgYnkgbmFtZVxuR0xUZXh0dXJlLnRleHR1cmVzID0ge307XG5cbi8vIEdMIHRleHR1cmUgd3JhcHBlciBvYmplY3QgZm9yIGtlZXBpbmcgdHJhY2sgb2YgYSBnbG9iYWwgc2V0IG9mIHRleHR1cmVzLCBrZXllZCBieSBhbiBhcmJpdHJhcnkgbmFtZVxuZnVuY3Rpb24gR0xUZXh0dXJlIChnbCwgbmFtZSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLnRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgdGhpcy5iaW5kKDApO1xuICAgIHRoaXMuaW1hZ2UgPSBudWxsO1xuXG4gICAgLy8gRGVmYXVsdCB0byBhIDEtcGl4ZWwgYmxhY2sgdGV4dHVyZSBzbyB3ZSBjYW4gc2FmZWx5IHJlbmRlciB3aGlsZSB3ZSB3YWl0IGZvciBhbiBpbWFnZSB0byBsb2FkXG4gICAgLy8gU2VlOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE5NzIyMjQ3L3dlYmdsLXdhaXQtZm9yLXRleHR1cmUtdG8tbG9hZFxuICAgIHRoaXMuc2V0RGF0YSgxLCAxLCBuZXcgVWludDhBcnJheShbMCwgMCwgMCwgMjU1XSksIHsgZmlsdGVyaW5nOiAnbmVhcmVzdCcgfSk7XG5cbiAgICAvLyBUT0RPOiBiZXR0ZXIgc3VwcG9ydCBmb3Igbm9uLVVSTCBzb3VyY2VzOiBjYW52YXMvdmlkZW8gZWxlbWVudHMsIHJhdyBwaXhlbCBidWZmZXJzXG5cbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIEdMVGV4dHVyZS50ZXh0dXJlc1t0aGlzLm5hbWVdID0gdGhpcztcbn07XG5cbkdMVGV4dHVyZS5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uICh1bml0KSB7XG4gICAgdGhpcy5nbC5hY3RpdmVUZXh0dXJlKHRoaXMuZ2wuVEVYVFVSRTAgKyB1bml0KTtcbiAgICB0aGlzLmdsLmJpbmRUZXh0dXJlKHRoaXMuZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcbn07XG5cbi8vIExvYWRzIGEgdGV4dHVyZSBmcm9tIGEgVVJMXG5HTFRleHR1cmUucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5pbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgIHRoaXMuaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLmltYWdlLndpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuaW1hZ2UuaGVpZ2h0O1xuICAgICAgICB0aGlzLmRhdGEgPSBudWxsOyAvLyBtdXR1YWxseSBleGNsdXNpdmUgd2l0aCBkaXJlY3QgZGF0YSBidWZmZXIgdGV4dHVyZXNcbiAgICAgICAgdGhpcy51cGRhdGUob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuc2V0VGV4dHVyZUZpbHRlcmluZyhvcHRpb25zKTtcbiAgICB9LmJpbmQodGhpcyk7XG4gICAgdGhpcy5pbWFnZS5zcmMgPSB1cmw7XG59O1xuXG4vLyBTZXRzIHRleHR1cmUgdG8gYSByYXcgaW1hZ2UgYnVmZmVyXG5HTFRleHR1cmUucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgZGF0YSwgb3B0aW9ucykge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMuaW1hZ2UgPSBudWxsOyAvLyBtdXR1YWxseSBleGNsdXNpdmUgd2l0aCBpbWFnZSBlbGVtZW50LWJhc2VkIHRleHR1cmVzXG5cbiAgICB0aGlzLnVwZGF0ZShvcHRpb25zKTtcbiAgICB0aGlzLnNldFRleHR1cmVGaWx0ZXJpbmcob3B0aW9ucyk7XG59O1xuXG4vLyBVcGxvYWRzIGN1cnJlbnQgaW1hZ2Ugb3IgYnVmZmVyIHRvIHRoZSBHUFUgKGNhbiBiZSB1c2VkIHRvIHVwZGF0ZSBhbmltYXRlZCB0ZXh0dXJlcyBvbiB0aGUgZmx5KVxuR0xUZXh0dXJlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5iaW5kKDApO1xuICAgIHRoaXMuZ2wucGl4ZWxTdG9yZWkodGhpcy5nbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCAob3B0aW9ucy5VTlBBQ0tfRkxJUF9ZX1dFQkdMID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSkpO1xuXG4gICAgLy8gSW1hZ2UgZWxlbWVudFxuICAgIGlmICh0aGlzLmltYWdlICYmIHRoaXMuaW1hZ2UuY29tcGxldGUpIHtcbiAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMuZ2wuVEVYVFVSRV8yRCwgMCwgdGhpcy5nbC5SR0JBLCB0aGlzLmdsLlJHQkEsIHRoaXMuZ2wuVU5TSUdORURfQllURSwgdGhpcy5pbWFnZSk7XG4gICAgfVxuICAgIC8vIFJhdyBpbWFnZSBidWZmZXJcbiAgICBlbHNlIGlmICh0aGlzLndpZHRoICYmIHRoaXMuaGVpZ2h0KSB7IC8vIE5PVEU6IHRoaXMuZGF0YSBjYW4gYmUgbnVsbCwgdG8gemVybyBvdXQgdGV4dHVyZVxuICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQodGhpcy5nbC5URVhUVVJFXzJELCAwLCB0aGlzLmdsLlJHQkEsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwLCB0aGlzLmdsLlJHQkEsIHRoaXMuZ2wuVU5TSUdORURfQllURSwgdGhpcy5kYXRhKTtcbiAgICB9XG59O1xuXG4vLyBEZXRlcm1pbmVzIGFwcHJvcHJpYXRlIGZpbHRlcmluZyBtb2RlXG4vLyBBc3N1bWVzIHRleHR1cmUgdG8gYmUgb3BlcmF0ZWQgb24gaXMgYWxyZWFkeSBib3VuZFxuR0xUZXh0dXJlLnByb3RvdHlwZS5zZXRUZXh0dXJlRmlsdGVyaW5nID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmZpbHRlcmluZyA9IG9wdGlvbnMuZmlsdGVyaW5nIHx8ICdtaXBtYXAnOyAvLyBkZWZhdWx0IHRvIG1pcG1hcHMgZm9yIHBvd2VyLW9mLTIgdGV4dHVyZXNcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuXG4gICAgLy8gRm9yIHBvd2VyLW9mLTIgdGV4dHVyZXMsIHRoZSBmb2xsb3dpbmcgcHJlc2V0cyBhcmUgYXZhaWxhYmxlOlxuICAgIC8vIG1pcG1hcDogbGluZWFyIGJsZW5kIGZyb20gbmVhcmVzdCBtaXBcbiAgICAvLyBsaW5lYXI6IGxpbmVhciBibGVuZCBmcm9tIG9yaWdpbmFsIGltYWdlIChubyBtaXBzKVxuICAgIC8vIG5lYXJlc3Q6IG5lYXJlc3QgcGl4ZWwgZnJvbSBvcmlnaW5hbCBpbWFnZSAobm8gbWlwcywgJ2Jsb2NreScgbG9vaylcbiAgICBpZiAoVXRpbHMuaXNQb3dlck9mMih0aGlzLndpZHRoKSAmJiBVdGlscy5pc1Bvd2VyT2YyKHRoaXMuaGVpZ2h0KSkge1xuICAgICAgICB0aGlzLnBvd2VyX29mXzIgPSB0cnVlO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBvcHRpb25zLlRFWFRVUkVfV1JBUF9TIHx8IGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBvcHRpb25zLlRFWFRVUkVfV1JBUF9UIHx8IGdsLkNMQU1QX1RPX0VER0UpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmZpbHRlcmluZyA9PSAnbWlwbWFwJykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3dlci1vZi0yIE1JUE1BUFwiKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyaW5nID0gJ21pcG1hcCc7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSX01JUE1BUF9ORUFSRVNUKTsgLy8gVE9ETzogdXNlIHRyaWxpbmVhciBmaWx0ZXJpbmcgYnkgZGVmdWFsdCBpbnN0ZWFkP1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgICAgICBnbC5nZW5lcmF0ZU1pcG1hcChnbC5URVhUVVJFXzJEKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmZpbHRlcmluZyA9PSAnbGluZWFyJykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3dlci1vZi0yIExJTkVBUlwiKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyaW5nID0gJ2xpbmVhcic7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuZmlsdGVyaW5nID09ICduZWFyZXN0Jykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3dlci1vZi0yIE5FQVJFU1RcIik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmluZyA9ICduZWFyZXN0JztcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gV2ViR0wgaGFzIHN0cmljdCByZXF1aXJlbWVudHMgb24gbm9uLXBvd2VyLW9mLTIgdGV4dHVyZXM6XG4gICAgICAgIC8vIE5vIG1pcG1hcHMgYW5kIG11c3QgY2xhbXAgdG8gZWRnZVxuICAgICAgICB0aGlzLnBvd2VyX29mXzIgPSBmYWxzZTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmZpbHRlcmluZyA9PSAnbmVhcmVzdCcpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBORUFSRVNUXCIpO1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJpbmcgPSAnbmVhcmVzdCc7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vIGRlZmF1bHQgdG8gbGluZWFyIGZvciBub24tcG93ZXItb2YtMiB0ZXh0dXJlc1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3dlci1vZi0yIExJTkVBUlwiKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyaW5nID0gJ2xpbmVhcic7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHTFRleHR1cmU7XG59XG4iLCIvLyBEZXNjcmliZXMgYSB2ZXJ0ZXggbGF5b3V0IHRoYXQgY2FuIGJlIHVzZWQgd2l0aCBtYW55IGRpZmZlcmVudCBHTCBwcm9ncmFtcy5cbi8vIElmIGEgZ2l2ZW4gcHJvZ3JhbSBkb2Vzbid0IGluY2x1ZGUgYWxsIGF0dHJpYnV0ZXMsIGl0IGNhbiBzdGlsbCB1c2UgdGhlIHZlcnRleCBsYXlvdXRcbi8vIHRvIHJlYWQgdGhvc2UgYXR0cmlicyB0aGF0IGl0IGRvZXMgcmVjb2duaXplLCB1c2luZyB0aGUgYXR0cmliIG9mZnNldHMgdG8gc2tpcCBvdGhlcnMuXG4vLyBBdHRyaWJzIGFyZSBhbiBhcnJheSwgaW4gbGF5b3V0IG9yZGVyLCBvZjogbmFtZSwgc2l6ZSwgdHlwZSwgbm9ybWFsaXplZFxuLy8gZXg6IHsgbmFtZTogJ3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH1cbmZ1bmN0aW9uIEdMVmVydGV4TGF5b3V0IChnbCwgYXR0cmlicylcbntcbiAgICB0aGlzLmF0dHJpYnMgPSBhdHRyaWJzO1xuXG4gICAgLy8gQ2FsYyB2ZXJ0ZXggc3RyaWRlXG4gICAgdGhpcy5zdHJpZGUgPSAwO1xuICAgIGZvciAodmFyIGE9MDsgYSA8IHRoaXMuYXR0cmlicy5sZW5ndGg7IGErKykge1xuICAgICAgICB2YXIgYXR0cmliID0gdGhpcy5hdHRyaWJzW2FdO1xuXG4gICAgICAgIGF0dHJpYi5ieXRlX3NpemUgPSBhdHRyaWIuc2l6ZTtcblxuICAgICAgICBzd2l0Y2ggKGF0dHJpYi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIGdsLkZMT0FUOlxuICAgICAgICAgICAgY2FzZSBnbC5JTlQ6XG4gICAgICAgICAgICBjYXNlIGdsLlVOU0lHTkVEX0lOVDpcbiAgICAgICAgICAgICAgICBhdHRyaWIuYnl0ZV9zaXplICo9IDQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGdsLlNIT1JUOlxuICAgICAgICAgICAgY2FzZSBnbC5VTlNJR05FRF9TSE9SVDpcbiAgICAgICAgICAgICAgICBhdHRyaWIuYnl0ZV9zaXplICo9IDI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBhdHRyaWIub2Zmc2V0ID0gdGhpcy5zdHJpZGU7XG4gICAgICAgIHRoaXMuc3RyaWRlICs9IGF0dHJpYi5ieXRlX3NpemU7XG4gICAgfVxufVxuXG4vLyBUcmFjayBjdXJyZW50bHkgZW5hYmxlZCBhdHRyaWJzLCBieSB0aGUgcHJvZ3JhbSB0aGV5IGFyZSBib3VuZCB0b1xuR0xWZXJ0ZXhMYXlvdXQuZW5hYmxlZF9hdHRyaWJzID0ge307XG5cbi8vIFNldHVwIGEgdmVydGV4IGxheW91dCBmb3IgYSBzcGVjaWZpYyBHTCBwcm9ncmFtXG4vLyBBc3N1bWVzIHRoYXQgdGhlIGRlc2lyZWQgdmVydGV4IGJ1ZmZlciAoVkJPKSBpcyBhbHJlYWR5IGJvdW5kXG5HTFZlcnRleExheW91dC5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24gKGdsLCBnbF9wcm9ncmFtKVxue1xuICAgIC8vIEVuYWJsZSBhbGwgYXR0cmlidXRlcyBmb3IgdGhpcyBsYXlvdXRcbiAgICBmb3IgKHZhciBhPTA7IGEgPCB0aGlzLmF0dHJpYnMubGVuZ3RoOyBhKyspIHtcbiAgICAgICAgdmFyIGF0dHJpYiA9IHRoaXMuYXR0cmlic1thXTtcbiAgICAgICAgdmFyIGxvY2F0aW9uID0gZ2xfcHJvZ3JhbS5hdHRyaWJ1dGUoYXR0cmliLm5hbWUpLmxvY2F0aW9uO1xuXG4gICAgICAgIGlmIChsb2NhdGlvbiAhPSAtMSkge1xuICAgICAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkobG9jYXRpb24pO1xuICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihsb2NhdGlvbiwgYXR0cmliLnNpemUsIGF0dHJpYi50eXBlLCBhdHRyaWIubm9ybWFsaXplZCwgdGhpcy5zdHJpZGUsIGF0dHJpYi5vZmZzZXQpO1xuICAgICAgICAgICAgR0xWZXJ0ZXhMYXlvdXQuZW5hYmxlZF9hdHRyaWJzW2xvY2F0aW9uXSA9IGdsX3Byb2dyYW07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEaXNhYmxlIGFueSBwcmV2aW91c2x5IGJvdW5kIGF0dHJpYnV0ZXMgdGhhdCBhcmVuJ3QgZm9yIHRoaXMgbGF5b3V0XG4gICAgdmFyIHVudXN1ZWRfYXR0cmlicyA9IFtdO1xuICAgIGZvciAobG9jYXRpb24gaW4gR0xWZXJ0ZXhMYXlvdXQuZW5hYmxlZF9hdHRyaWJzKSB7XG4gICAgICAgIGlmIChHTFZlcnRleExheW91dC5lbmFibGVkX2F0dHJpYnNbbG9jYXRpb25dICE9IGdsX3Byb2dyYW0pIHtcbiAgICAgICAgICAgIGdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbik7XG4gICAgICAgICAgICB1bnVzdWVkX2F0dHJpYnMucHVzaChsb2NhdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYXJrIGF0dHJpYnMgYXMgdW51c2VkXG4gICAgZm9yIChsb2NhdGlvbiBpbiB1bnVzdWVkX2F0dHJpYnMpIHtcbiAgICAgICAgZGVsZXRlIEdMVmVydGV4TGF5b3V0LmVuYWJsZWRfYXR0cmlic1tsb2NhdGlvbl07XG4gICAgfVxufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHTFZlcnRleExheW91dDtcbn1cbiIsInZhciBTY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmUuanMnKTtcblxudmFyIExlYWZsZXRMYXllciA9IEwuR3JpZExheWVyLmV4dGVuZCh7XG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICBMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgU2NlbmUodGhpcy5vcHRpb25zLnZlY3RvclRpbGVTb3VyY2UsIHRoaXMub3B0aW9ucy52ZWN0b3JMYXllcnMsIHRoaXMub3B0aW9ucy52ZWN0b3JTdHlsZXMsIHsgbnVtX3dvcmtlcnM6IHRoaXMub3B0aW9ucy5udW1Xb3JrZXJzIH0pO1xuICAgICAgICB0aGlzLnNjZW5lLmRlYnVnID0gdGhpcy5vcHRpb25zLmRlYnVnO1xuICAgICAgICB0aGlzLnNjZW5lLmNvbnRpbnVvdXNfYW5pbWF0aW9uID0gZmFsc2U7IC8vIHNldCB0byB0cnVlIGZvciBhbmltYXRpbm9zLCBldGMuIChldmVudHVhbGx5IHdpbGwgYmUgYXV0b21hdGVkKVxuICAgIH0sXG5cbiAgICAvLyBGaW5pc2ggaW5pdGlhbGl6aW5nIHNjZW5lIGFuZCBzZXR1cCBldmVudHMgd2hlbiBsYXllciBpcyBhZGRlZCB0byBtYXBcbiAgICBvbkFkZDogZnVuY3Rpb24gKG1hcCkge1xuICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzO1xuXG4gICAgICAgIGxheWVyLm9uKCd0aWxldW5sb2FkJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgdGlsZSA9IGV2ZW50LnRpbGU7XG4gICAgICAgICAgICB2YXIga2V5ID0gdGlsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGlsZS1rZXknKTtcbiAgICAgICAgICAgIGxheWVyLnNjZW5lLnJlbW92ZVRpbGUoa2V5KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF5ZXIuX21hcC5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHNpemUgPSBsYXllci5fbWFwLmdldFNpemUoKTtcbiAgICAgICAgICAgIGxheWVyLnNjZW5lLnJlc2l6ZU1hcChzaXplLngsIHNpemUueSk7XG4gICAgICAgICAgICBsYXllci51cGRhdGVCb3VuZHMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF5ZXIuX21hcC5vbignbW92ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjZW50ZXIgPSBsYXllci5fbWFwLmdldENlbnRlcigpO1xuICAgICAgICAgICAgbGF5ZXIuc2NlbmUuc2V0Q2VudGVyKGNlbnRlci5sbmcsIGNlbnRlci5sYXQpO1xuICAgICAgICAgICAgbGF5ZXIudXBkYXRlQm91bmRzKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxheWVyLl9tYXAub24oJ3pvb21zdGFydCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibWFwLnpvb21zdGFydCBcIiArIGxheWVyLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgICAgIGxheWVyLnNjZW5lLnN0YXJ0Wm9vbSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsYXllci5fbWFwLm9uKCd6b29tZW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJtYXAuem9vbWVuZCBcIiArIGxheWVyLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgICAgIGxheWVyLnNjZW5lLnNldFpvb20obGF5ZXIuX21hcC5nZXRab29tKCkpO1xuICAgICAgICAgICAgbGF5ZXIudXBkYXRlQm91bmRzKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxheWVyLl9tYXAub24oJ2RyYWdzdGFydCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxheWVyLnNjZW5lLnBhbm5pbmcgPSB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICBsYXllci5fbWFwLm9uKCdkcmFnZW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGF5ZXIuc2NlbmUucGFubmluZyA9IGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDYW52YXMgZWxlbWVudCB3aWxsIGJlIGluc2VydGVkIGFmdGVyIG1hcCBjb250YWluZXIgKGxlYWZsZXQgdHJhbnNmb3JtcyBzaG91bGRuJ3QgYmUgYXBwbGllZCB0byB0aGUgR0wgY2FudmFzKVxuICAgICAgICAvLyBUT0RPOiBmaW5kIGEgYmV0dGVyIHdheSB0byBkZWFsIHdpdGggdGhpcz8gcmlnaHQgbm93IEdMIG1hcCBvbmx5IHJlbmRlcnMgY29ycmVjdGx5IGFzIHRoZSBib3R0b20gbGF5ZXJcbiAgICAgICAgbGF5ZXIuc2NlbmUuY29udGFpbmVyID0gbGF5ZXIuX21hcC5nZXRDb250YWluZXIoKTtcblxuICAgICAgICB2YXIgY2VudGVyID0gbGF5ZXIuX21hcC5nZXRDZW50ZXIoKTtcbiAgICAgICAgbGF5ZXIuc2NlbmUuc2V0Q2VudGVyKGNlbnRlci5sbmcsIGNlbnRlci5sYXQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInpvb206IFwiICsgbGF5ZXIuX21hcC5nZXRab29tKCkpO1xuICAgICAgICBsYXllci5zY2VuZS5zZXRab29tKGxheWVyLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgbGF5ZXIudXBkYXRlQm91bmRzKCk7XG5cbiAgICAgICAgTC5HcmlkTGF5ZXIucHJvdG90eXBlLm9uQWRkLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgLy8gVXNlIGxlYWZsZXQncyBleGlzdGluZyBldmVudCBzeXN0ZW0gYXMgdGhlIGNhbGxiYWNrIG1lY2hhbmlzbVxuICAgICAgICBsYXllci5zY2VuZS5pbml0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGF5ZXIuZmlyZSgnaW5pdCcpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcbiAgICAgICAgTC5HcmlkTGF5ZXIucHJvdG90eXBlLm9uUmVtb3ZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIC8vIFRPRE86IHJlbW92ZSBldmVudCBoYW5kbGVycywgZGVzdHJveSBtYXBcbiAgICB9LFxuXG4gICAgY3JlYXRlVGlsZTogZnVuY3Rpb24gKGNvb3JkcywgZG9uZSkge1xuICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuc2NlbmUubG9hZFRpbGUoY29vcmRzLCBkaXYsIGRvbmUpO1xuICAgICAgICByZXR1cm4gZGl2O1xuICAgIH0sXG5cbiAgICB1cGRhdGVCb3VuZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGxheWVyID0gdGhpcztcbiAgICAgICAgdmFyIGJvdW5kcyA9IGxheWVyLl9tYXAuZ2V0Qm91bmRzKCk7XG4gICAgICAgIGxheWVyLnNjZW5lLnNldEJvdW5kcyhib3VuZHMuZ2V0U291dGhXZXN0KCksIGJvdW5kcy5nZXROb3J0aEVhc3QoKSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNjZW5lLnJlbmRlcigpO1xuICAgIH1cblxufSk7XG5cbnZhciBsZWFmbGV0TGF5ZXIgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgTGVhZmxldExheWVyKG9wdGlvbnMpO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICAgIExlYWZsZXRMYXllcjogTGVhZmxldExheWVyLFxuICAgICAgICBsZWFmbGV0TGF5ZXI6IGxlYWZsZXRMYXllclxuICAgIH07XG59XG4iLCIvLyBNb2R1bGVzIGFuZCBkZXBlbmRlbmNpZXMgdG8gZXhwb3NlIGluIHRoZSBwdWJsaWMgVGFuZ3JhbSBtb2R1bGVcblxuLy8gVGhlIGxlYWZsZXQgbGF5ZXIgcGx1Z2luIGlzIGN1cnJlbnRseSB0aGUgcHJpbWFyeSBtZWFucyBvZiB1c2luZyB0aGUgbGlicmFyeVxudmFyIExlYWZsZXQgPSByZXF1aXJlKCcuL2xlYWZsZXRfbGF5ZXIuanMnKTtcblxuLy8gR0wgZnVuY3Rpb25zIGluY2x1ZGVkIGZvciBlYXNpZXIgZGVidWdnaW5nIC8gZGlyZWN0IGFjY2VzcyB0byBzZXR0aW5nIGdsb2JhbCBkZWZpbmVzLCByZWxvYWRpbmcgcHJvZ3JhbXMsIGV0Yy5cbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wvZ2wuanMnKTtcbkdMLlByb2dyYW0gPSByZXF1aXJlKCcuL2dsL2dsX3Byb2dyYW0uanMnKTtcbkdMLlRleHR1cmUgPSByZXF1aXJlKCcuL2dsL2dsX3RleHR1cmUuanMnKTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICAgIExlYWZsZXRMYXllcjogTGVhZmxldC5MZWFmbGV0TGF5ZXIsXG4gICAgICAgIGxlYWZsZXRMYXllcjogTGVhZmxldC5sZWFmbGV0TGF5ZXIsXG4gICAgICAgIEdMOiBHTFxuICAgIH07XG59XG4iLCIvLyBQb2ludFxuZnVuY3Rpb24gUG9pbnQgKHgsIHkpXG57XG4gICAgcmV0dXJuIHsgeDogeCwgeTogeSB9O1xufVxuXG5Qb2ludC5jb3B5ID0gZnVuY3Rpb24gKHApXG57XG4gICAgaWYgKHAgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHsgeDogcC54LCB5OiBwLnkgfTtcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gUG9pbnQ7XG59XG4iLCJ2YXIgUG9pbnQgPSByZXF1aXJlKCcuL3BvaW50LmpzJyk7XG52YXIgR2VvID0gcmVxdWlyZSgnLi9nZW8uanMnKTtcbnZhciBTdHlsZSA9IHJlcXVpcmUoJy4vc3R5bGUuanMnKTtcbnZhciBNb2RlTWFuYWdlciA9IHJlcXVpcmUoJy4vZ2wvZ2xfbW9kZXMnKS5Nb2RlTWFuYWdlcjtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMuanMnKTtcbnZhciBRdWV1ZSA9IHJlcXVpcmUoJ3F1ZXVlLWFzeW5jJyk7XG5cbnZhciBHTCA9IHJlcXVpcmUoJy4vZ2wvZ2wuanMnKTtcbnZhciBHTFByb2dyYW0gPSByZXF1aXJlKCcuL2dsL2dsX3Byb2dyYW0uanMnKTtcbnZhciBHTEJ1aWxkZXJzID0gcmVxdWlyZSgnLi9nbC9nbF9idWlsZGVycy5qcycpO1xudmFyIEdMVGV4dHVyZSA9IHJlcXVpcmUoJy4vZ2wvZ2xfdGV4dHVyZS5qcycpO1xuXG52YXIgbWF0NCA9IHJlcXVpcmUoJ2dsLW1hdHJpeCcpLm1hdDQ7XG52YXIgdmVjMyA9IHJlcXVpcmUoJ2dsLW1hdHJpeCcpLnZlYzM7XG5cbi8vIFNldHVwIHRoYXQgaGFwcGVucyBvbiBtYWluIHRocmVhZCBvbmx5IChza2lwIGluIHdlYiB3b3JrZXIpXG52YXIgeWFtbDtcblV0aWxzLnJ1bklmSW5NYWluVGhyZWFkKGZ1bmN0aW9uKCkge1xuICAgIHRyeSB7XG4gICAgICAgIHlhbWwgPSByZXF1aXJlKCdqcy15YW1sJyk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm8gWUFNTCBzdXBwb3J0LCBqcy15YW1sIG1vZHVsZSBub3QgZm91bmRcIik7XG4gICAgfVxuXG4gICAgZmluZEJhc2VMaWJyYXJ5VVJMKCk7XG59KTtcblxuLy8gR2xvYmFsIHNldHVwXG5TY2VuZS50aWxlX3NjYWxlID0gNDA5NjsgLy8gY29vcmRpbmF0ZXMgYXJlIGxvY2FsbHkgc2NhbGVkIHRvIHRoZSByYW5nZSBbMCwgdGlsZV9zY2FsZV1cbkdlby5zZXRUaWxlU2NhbGUoU2NlbmUudGlsZV9zY2FsZSk7XG5HTEJ1aWxkZXJzLnNldFRpbGVTY2FsZShTY2VuZS50aWxlX3NjYWxlKTtcbkdMUHJvZ3JhbS5kZWZpbmVzLlRJTEVfU0NBTEUgPSBTY2VuZS50aWxlX3NjYWxlO1xuU2NlbmUuZGVidWcgPSBmYWxzZTtcblxuLy8gTGF5ZXJzICYgc3R5bGVzOiBwYXNzIGFuIG9iamVjdCBkaXJlY3RseSwgb3IgYSBVUkwgYXMgc3RyaW5nIHRvIGxvYWQgcmVtb3RlbHlcbmZ1bmN0aW9uIFNjZW5lICh0aWxlX3NvdXJjZSwgbGF5ZXJzLCBzdHlsZXMsIG9wdGlvbnMpXG57XG4gICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMudGlsZV9zb3VyY2UgPSB0aWxlX3NvdXJjZTtcbiAgICB0aGlzLnRpbGVzID0ge307XG4gICAgdGhpcy5xdWV1ZWRfdGlsZXMgPSBbXTtcbiAgICB0aGlzLm51bV93b3JrZXJzID0gb3B0aW9ucy5udW1fd29ya2VycyB8fCAxO1xuICAgIHRoaXMuYWxsb3dfY3Jvc3NfZG9tYWluX3dvcmtlcnMgPSAob3B0aW9ucy5hbGxvd19jcm9zc19kb21haW5fd29ya2VycyA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xuXG4gICAgdGhpcy5sYXllcnMgPSBsYXllcnM7XG4gICAgdGhpcy5zdHlsZXMgPSBzdHlsZXM7XG5cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTsgLy8gcmVxdWVzdCBhIHJlZHJhd1xuICAgIHRoaXMuYW5pbWF0ZWQgPSBmYWxzZTsgLy8gcmVxdWVzdCByZWRyYXcgZXZlcnkgZnJhbWVcblxuICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgIHRoaXMuem9vbSA9IG51bGw7XG4gICAgdGhpcy5jZW50ZXIgPSBudWxsO1xuICAgIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcblxuICAgIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuICAgIHRoaXMucGFubmluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lcjtcblxuICAgIHRoaXMucmVzZXRUaW1lKCk7XG59XG5cblNjZW5lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGNhbGxiYWNrKVxue1xuICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHNjZW5lID0gdGhpcztcblxuICAgIC8vIExvYWQgc2NlbmUgZGVmaW5pdGlvbiAobGF5ZXJzLCBzdHlsZXMsIGV0Yy4pLCB0aGVuIGNyZWF0ZSBtb2RlcyAmIHdvcmtlcnNcbiAgICB0aGlzLmxvYWRTY2VuZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gUXVldWUoKTtcblxuICAgICAgICAvLyBDcmVhdGUgcmVuZGVyaW5nIG1vZGVzXG4gICAgICAgIHF1ZXVlLmRlZmVyKGZ1bmN0aW9uKGNvbXBsZXRlKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGVzID0gU2NlbmUuY3JlYXRlTW9kZXModGhpcy5zdHlsZXMpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVBY3RpdmVNb2RlcygpO1xuICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgfS5iaW5kKHNjZW5lKSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHdlYiB3b3JrZXJzXG4gICAgICAgIHF1ZXVlLmRlZmVyKGZ1bmN0aW9uKGNvbXBsZXRlKSB7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVdvcmtlcnMoY29tcGxldGUpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8vIFRoZW4gY3JlYXRlIEdMIGNvbnRleHRcbiAgICAgICAgcXVldWUuYXdhaXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgY2FudmFzICYgR0xcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gdGhpcy5jb250YWluZXIgfHwgZG9jdW1lbnQuYm9keTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS50b3AgPSAwO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUubGVmdCA9IDA7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS56SW5kZXggPSAtMTtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcblxuICAgICAgICAgICAgdGhpcy5nbCA9IEdMLmdldENvbnRleHQodGhpcy5jYW52YXMpO1xuICAgICAgICAgICAgdGhpcy5yZXNpemVNYXAodGhpcy5jb250YWluZXIuY2xpZW50V2lkdGgsIHRoaXMuY29udGFpbmVyLmNsaWVudEhlaWdodCk7XG5cbiAgICAgICAgICAgIHRoaXMuaW5pdE1vZGVzKCk7IC8vIFRPRE86IHJlbW92ZSBnbCBjb250ZXh0IHN0YXRlIGZyb20gbW9kZXMsIGFuZCBtb3ZlIGluaXQgdG8gY3JlYXRlIHN0ZXAgYWJvdmU/XG4gICAgICAgICAgICB0aGlzLmluaXRTZWxlY3Rpb25CdWZmZXIoKTtcblxuICAgICAgICAgICAgLy8gdGhpcy56b29tX3N0ZXAgPSAwLjAyOyAvLyBmb3IgZnJhY3Rpb25hbCB6b29tIHVzZXIgYWRqdXN0bWVudFxuICAgICAgICAgICAgdGhpcy5sYXN0X3JlbmRlcl9jb3VudCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmluaXRJbnB1dEhhbmRsZXJzKCk7XG5cbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQoc2NlbmUpKTtcbiAgICB9LmJpbmQoc2NlbmUpKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5pbml0TW9kZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIEluaXQgR0wgY29udGV4dCBmb3IgbW9kZXMgKGNvbXBpbGVzIHByb2dyYW1zLCBldGMuKVxuICAgIGZvciAodmFyIG0gaW4gdGhpcy5tb2Rlcykge1xuICAgICAgICB0aGlzLm1vZGVzW21dLmluaXQodGhpcy5nbCk7XG4gICAgfVxufTtcblxuU2NlbmUucHJvdG90eXBlLmluaXRTZWxlY3Rpb25CdWZmZXIgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIFNlbGVjdGlvbiBzdGF0ZSB0cmFja2luZ1xuICAgIHRoaXMucGl4ZWwgPSBuZXcgVWludDhBcnJheSg0KTtcbiAgICB0aGlzLnBpeGVsMzIgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMucGl4ZWwuYnVmZmVyKTtcbiAgICB0aGlzLnNlbGVjdGlvbl9wb2ludCA9IFBvaW50KDAsIDApO1xuICAgIHRoaXMuc2VsZWN0ZWRfZmVhdHVyZSA9IG51bGw7XG4gICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2sgPSBudWxsO1xuICAgIHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrX3RpbWVyID0gbnVsbDtcbiAgICB0aGlzLnNlbGVjdGlvbl9mcmFtZV9kZWxheSA9IDU7IC8vIGRlbGF5IGZyb20gc2VsZWN0aW9uIHJlbmRlciB0byBmcmFtZWJ1ZmZlciBzYW1wbGUsIHRvIGF2b2lkIENQVS9HUFUgc3luYyBsb2NrXG4gICAgdGhpcy51cGRhdGVfc2VsZWN0aW9uID0gZmFsc2U7XG5cbiAgICAvLyBGcmFtZSBidWZmZXIgZm9yIHNlbGVjdGlvblxuICAgIC8vIFRPRE86IGluaXRpYXRlIGxhemlseSBpbiBjYXNlIHdlIGRvbid0IG5lZWQgdG8gZG8gYW55IHNlbGVjdGlvblxuICAgIHRoaXMuZmJvID0gdGhpcy5nbC5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xuICAgIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKHRoaXMuZ2wuRlJBTUVCVUZGRVIsIHRoaXMuZmJvKTtcbiAgICB0aGlzLmZib19zaXplID0geyB3aWR0aDogMjU2LCBoZWlnaHQ6IDI1NiB9OyAvLyBUT0RPOiBtYWtlIGNvbmZpZ3VyYWJsZSAvIGFkYXB0aXZlIGJhc2VkIG9uIGNhbnZhcyBzaXplXG4gICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCB0aGlzLmZib19zaXplLndpZHRoLCB0aGlzLmZib19zaXplLmhlaWdodCk7XG5cbiAgICAvLyBUZXh0dXJlIGZvciB0aGUgRkJPIGNvbG9yIGF0dGFjaG1lbnRcbiAgICB0aGlzLmZib190ZXh0dXJlID0gbmV3IEdMVGV4dHVyZSh0aGlzLmdsLCAnc2VsZWN0aW9uX2ZibycpO1xuICAgIHRoaXMuZmJvX3RleHR1cmUuc2V0RGF0YSh0aGlzLmZib19zaXplLndpZHRoLCB0aGlzLmZib19zaXplLmhlaWdodCwgbnVsbCwgeyBmaWx0ZXJpbmc6ICduZWFyZXN0JyB9KTtcbiAgICB0aGlzLmdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKHRoaXMuZ2wuRlJBTUVCVUZGRVIsIHRoaXMuZ2wuQ09MT1JfQVRUQUNITUVOVDAsIHRoaXMuZ2wuVEVYVFVSRV8yRCwgdGhpcy5mYm9fdGV4dHVyZS50ZXh0dXJlLCAwKTtcblxuICAgIC8vIFJlbmRlcmJ1ZmZlciBmb3IgdGhlIEZCTyBkZXB0aCBhdHRhY2htZW50XG4gICAgdGhpcy5mYm9fZGVwdGhfcmIgPSB0aGlzLmdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpO1xuICAgIHRoaXMuZ2wuYmluZFJlbmRlcmJ1ZmZlcih0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5mYm9fZGVwdGhfcmIpO1xuICAgIHRoaXMuZ2wucmVuZGVyYnVmZmVyU3RvcmFnZSh0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5nbC5ERVBUSF9DT01QT05FTlQxNiwgdGhpcy5mYm9fc2l6ZS53aWR0aCwgdGhpcy5mYm9fc2l6ZS5oZWlnaHQpO1xuICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgdGhpcy5nbC5ERVBUSF9BVFRBQ0hNRU5ULCB0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5mYm9fZGVwdGhfcmIpO1xuXG4gICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbn07XG5cbi8vIFdlYiB3b3JrZXJzIGhhbmRsZSBoZWF2ZXkgZHV0eSB0aWxlIGNvbnN0cnVjdGlvbjogbmV0d29ya2luZywgZ2VvbWV0cnkgcHJvY2Vzc2luZywgZXRjLlxuU2NlbmUucHJvdG90eXBlLmNyZWF0ZVdvcmtlcnMgPSBmdW5jdGlvbiAoY2FsbGJhY2spXG57XG4gICAgdmFyIHF1ZXVlID0gUXVldWUoKTtcbiAgICB2YXIgd29ya2VyX3VybCA9IFNjZW5lLmxpYnJhcnlfYmFzZV91cmwgKyAndGFuZ3JhbS13b3JrZXIubWluLmpzJyArICc/JyArICgrbmV3IERhdGUoKSk7XG5cbiAgICAvLyBMb2FkICYgaW5zdGFudGlhdGUgd29ya2Vyc1xuICAgIHF1ZXVlLmRlZmVyKGZ1bmN0aW9uKGNvbXBsZXRlKSB7XG4gICAgICAgIC8vIExvY2FsIG9iamVjdCBVUkxzIHN1cHBvcnRlZD9cbiAgICAgICAgdmFyIGNyZWF0ZU9iamVjdFVSTCA9ICh3aW5kb3cuVVJMICYmIHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKSB8fCAod2luZG93LndlYmtpdFVSTCAmJiB3aW5kb3cud2Via2l0VVJMLmNyZWF0ZU9iamVjdFVSTCk7XG4gICAgICAgIGlmIChjcmVhdGVPYmplY3RVUkwgJiYgdGhpcy5hbGxvd19jcm9zc19kb21haW5fd29ya2Vycykge1xuICAgICAgICAgICAgLy8gVG8gYWxsb3cgd29ya2VycyB0byBiZSBsb2FkZWQgY3Jvc3MtZG9tYWluLCBmaXJzdCBsb2FkIHdvcmtlciBzb3VyY2UgdmlhIFhIUiwgdGhlbiBjcmVhdGUgYSBsb2NhbCBVUkwgdmlhIGEgYmxvYlxuICAgICAgICAgICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgd29ya2VyX2xvY2FsX3VybCA9IGNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbcmVxLnJlc3BvbnNlXSwgeyB0eXBlOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcgfSkpO1xuICAgICAgICAgICAgICAgIHRoaXMubWFrZVdvcmtlcnMod29ya2VyX2xvY2FsX3VybCk7XG4gICAgICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHJlcS5vcGVuKCdHRVQnLCB3b3JrZXJfdXJsLCB0cnVlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgICAgICAgICAgcmVxLnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICAgICAgICAgIHJlcS5zZW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJhZGl0aW9uYWwgbG9hZCBmcm9tIHJlbW90ZSBVUkxcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubWFrZVdvcmtlcnMod29ya2VyX3VybCk7XG4gICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIC8vIEluaXQgd29ya2Vyc1xuICAgIHF1ZXVlLmF3YWl0KGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLndvcmtlcnMuZm9yRWFjaChmdW5jdGlvbih3b3JrZXIpIHtcbiAgICAgICAgICAgIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy53b3JrZXJCdWlsZFRpbGVDb21wbGV0ZWQuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMud29ya2VyR2V0RmVhdHVyZVNlbGVjdGlvbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy53b3JrZXJMb2dNZXNzYWdlLmJpbmQodGhpcykpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMubmV4dF93b3JrZXIgPSAwO1xuICAgICAgICB0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemUgPSB7fTtcblxuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLy8gSW5zdGFudGlhdGUgd29ya2VycyBmcm9tIFVSTFxuU2NlbmUucHJvdG90eXBlLm1ha2VXb3JrZXJzID0gZnVuY3Rpb24gKHVybClcbntcbiAgICB0aGlzLndvcmtlcnMgPSBbXTtcbiAgICBmb3IgKHZhciB3PTA7IHcgPCB0aGlzLm51bV93b3JrZXJzOyB3KyspIHtcbiAgICAgICAgdGhpcy53b3JrZXJzLnB1c2gobmV3IFdvcmtlcih1cmwpKTtcbiAgICAgICAgdGhpcy53b3JrZXJzW3ddLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6ICdpbml0JyxcbiAgICAgICAgICAgIHdvcmtlcl9pZDogdyxcbiAgICAgICAgICAgIG51bV93b3JrZXJzOiB0aGlzLm51bV93b3JrZXJzXG4gICAgICAgIH0pXG4gICAgfVxufTtcblxuLy8gUG9zdCBhIG1lc3NhZ2UgYWJvdXQgYSB0aWxlIHRvIHRoZSBuZXh0IHdvcmtlciAocm91bmQgcm9iYmluKVxuU2NlbmUucHJvdG90eXBlLndvcmtlclBvc3RNZXNzYWdlRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlLCBtZXNzYWdlKVxue1xuICAgIGlmICh0aWxlLndvcmtlciA9PSBudWxsKSB7XG4gICAgICAgIHRpbGUud29ya2VyID0gdGhpcy5uZXh0X3dvcmtlcjtcbiAgICAgICAgdGhpcy5uZXh0X3dvcmtlciA9ICh0aWxlLndvcmtlciArIDEpICUgdGhpcy53b3JrZXJzLmxlbmd0aDtcbiAgICB9XG4gICAgdGhpcy53b3JrZXJzW3RpbGUud29ya2VyXS5wb3N0TWVzc2FnZShtZXNzYWdlKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbiAobG5nLCBsYXQpXG57XG4gICAgdGhpcy5jZW50ZXIgPSB7IGxuZzogbG5nLCBsYXQ6IGxhdCB9O1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnN0YXJ0Wm9vbSA9IGZ1bmN0aW9uICgpXG57XG4gICAgdGhpcy5sYXN0X3pvb20gPSB0aGlzLnpvb207XG4gICAgdGhpcy56b29taW5nID0gdHJ1ZTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5wcmVzZXJ2ZV90aWxlc193aXRoaW5fem9vbSA9IDI7XG5TY2VuZS5wcm90b3R5cGUuc2V0Wm9vbSA9IGZ1bmN0aW9uICh6b29tKVxue1xuICAgIC8vIFNjaGVkdWxlIEdMIHRpbGVzIGZvciByZW1vdmFsIG9uIHpvb21cbiAgICB2YXIgYmVsb3cgPSB6b29tO1xuICAgIHZhciBhYm92ZSA9IHpvb207XG4gICAgaWYgKHRoaXMubGFzdF96b29tICE9IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzY2VuZS5sYXN0X3pvb206IFwiICsgdGhpcy5sYXN0X3pvb20pO1xuICAgICAgICBpZiAoTWF0aC5hYnMoem9vbSAtIHRoaXMubGFzdF96b29tKSA8PSB0aGlzLnByZXNlcnZlX3RpbGVzX3dpdGhpbl96b29tKSB7XG4gICAgICAgICAgICBpZiAoem9vbSA+IHRoaXMubGFzdF96b29tKSB7XG4gICAgICAgICAgICAgICAgYmVsb3cgPSB6b29tIC0gdGhpcy5wcmVzZXJ2ZV90aWxlc193aXRoaW5fem9vbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFib3ZlID0gem9vbSArIHRoaXMucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb207XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxhc3Rfem9vbSA9IHRoaXMuem9vbTtcbiAgICB0aGlzLnpvb20gPSB6b29tO1xuICAgIHRoaXMuY2FwcGVkX3pvb20gPSBNYXRoLm1pbih+fnRoaXMuem9vbSwgdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSB8fCB+fnRoaXMuem9vbSk7XG4gICAgdGhpcy56b29taW5nID0gZmFsc2U7XG5cbiAgICB0aGlzLnJlbW92ZVRpbGVzT3V0c2lkZVpvb21SYW5nZShiZWxvdywgYWJvdmUpO1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlbW92ZVRpbGVzT3V0c2lkZVpvb21SYW5nZSA9IGZ1bmN0aW9uIChiZWxvdywgYWJvdmUpXG57XG4gICAgYmVsb3cgPSBNYXRoLm1pbihiZWxvdywgdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSB8fCBiZWxvdyk7XG4gICAgYWJvdmUgPSBNYXRoLm1pbihhYm92ZSwgdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSB8fCBhYm92ZSk7XG5cbiAgICBjb25zb2xlLmxvZyhcInJlbW92ZVRpbGVzT3V0c2lkZVpvb21SYW5nZSBbXCIgKyBiZWxvdyArIFwiLCBcIiArIGFib3ZlICsgXCJdKVwiKTtcbiAgICB2YXIgcmVtb3ZlX3RpbGVzID0gW107XG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIHZhciB0aWxlID0gdGhpcy50aWxlc1t0XTtcbiAgICAgICAgaWYgKHRpbGUuY29vcmRzLnogPCBiZWxvdyB8fCB0aWxlLmNvb3Jkcy56ID4gYWJvdmUpIHtcbiAgICAgICAgICAgIHJlbW92ZV90aWxlcy5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIHI9MDsgciA8IHJlbW92ZV90aWxlcy5sZW5ndGg7IHIrKykge1xuICAgICAgICB2YXIga2V5ID0gcmVtb3ZlX3RpbGVzW3JdO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlbW92ZWQgXCIgKyBrZXkgKyBcIiAob3V0c2lkZSByYW5nZSBbXCIgKyBiZWxvdyArIFwiLCBcIiArIGFib3ZlICsgXCJdKVwiKTtcbiAgICAgICAgdGhpcy5yZW1vdmVUaWxlKGtleSk7XG4gICAgfVxufTtcblxuU2NlbmUucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uIChzdywgbmUpXG57XG4gICAgdGhpcy5ib3VuZHMgPSB7XG4gICAgICAgIHN3OiB7IGxuZzogc3cubG5nLCBsYXQ6IHN3LmxhdCB9LFxuICAgICAgICBuZTogeyBsbmc6IG5lLmxuZywgbGF0OiBuZS5sYXQgfVxuICAgIH07XG5cbiAgICB2YXIgYnVmZmVyID0gMjAwICogR2VvLm1ldGVyc19wZXJfcGl4ZWxbfn50aGlzLnpvb21dOyAvLyBwaXhlbHMgLT4gbWV0ZXJzXG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMgPSB7XG4gICAgICAgIHN3OiBHZW8ubGF0TG5nVG9NZXRlcnMoUG9pbnQodGhpcy5ib3VuZHMuc3cubG5nLCB0aGlzLmJvdW5kcy5zdy5sYXQpKSxcbiAgICAgICAgbmU6IEdlby5sYXRMbmdUb01ldGVycyhQb2ludCh0aGlzLmJvdW5kcy5uZS5sbmcsIHRoaXMuYm91bmRzLm5lLmxhdCkpXG4gICAgfTtcbiAgICB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5zdy54IC09IGJ1ZmZlcjtcbiAgICB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5zdy55IC09IGJ1ZmZlcjtcbiAgICB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5uZS54ICs9IGJ1ZmZlcjtcbiAgICB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5uZS55ICs9IGJ1ZmZlcjtcblxuICAgIHRoaXMuY2VudGVyX21ldGVycyA9IFBvaW50KFxuICAgICAgICAodGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueCArIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzLm5lLngpIC8gMixcbiAgICAgICAgKHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzLnN3LnkgKyB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5uZS55KSAvIDJcbiAgICApO1xuXG4gICAgLy8gY29uc29sZS5sb2coXCJzZXQgc2NlbmUgYm91bmRzIHRvIFwiICsgSlNPTi5zdHJpbmdpZnkodGhpcy5ib3VuZHMpKTtcblxuICAgIC8vIE1hcmsgdGlsZXMgYXMgdmlzaWJsZS9pbnZpc2libGVcbiAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5Rm9yVGlsZSh0aGlzLnRpbGVzW3RdKTtcbiAgICB9XG5cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5pc1RpbGVJblpvb20gPSBmdW5jdGlvbiAodGlsZSlcbntcbiAgICByZXR1cm4gKE1hdGgubWluKHRpbGUuY29vcmRzLnosIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgdGlsZS5jb29yZHMueikgPT0gdGhpcy5jYXBwZWRfem9vbSk7XG59O1xuXG4vLyBVcGRhdGUgdmlzaWJpbGl0eSBhbmQgcmV0dXJuIHRydWUgaWYgY2hhbmdlZFxuU2NlbmUucHJvdG90eXBlLnVwZGF0ZVZpc2liaWxpdHlGb3JUaWxlID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgdmFyIHZpc2libGUgPSB0aWxlLnZpc2libGU7XG4gICAgdGlsZS52aXNpYmxlID0gdGhpcy5pc1RpbGVJblpvb20odGlsZSkgJiYgR2VvLmJveEludGVyc2VjdCh0aWxlLmJvdW5kcywgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMpO1xuICAgIHRpbGUuY2VudGVyX2Rpc3QgPSBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueCAtIHRpbGUubWluLngpICsgTWF0aC5hYnModGhpcy5jZW50ZXJfbWV0ZXJzLnkgLSB0aWxlLm1pbi55KTtcbiAgICByZXR1cm4gKHZpc2libGUgIT0gdGlsZS52aXNpYmxlKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZXNpemVNYXAgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodClcbntcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcblxuICAgIHRoaXMuY3NzX3NpemUgPSB7IHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQgfTtcbiAgICB0aGlzLmRldmljZV9zaXplID0geyB3aWR0aDogTWF0aC5yb3VuZCh0aGlzLmNzc19zaXplLndpZHRoICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8pLCBoZWlnaHQ6IE1hdGgucm91bmQodGhpcy5jc3Nfc2l6ZS5oZWlnaHQgKiB0aGlzLmRldmljZV9waXhlbF9yYXRpbykgfTtcblxuICAgIHRoaXMuY2FudmFzLnN0eWxlLndpZHRoID0gdGhpcy5jc3Nfc2l6ZS53aWR0aCArICdweCc7XG4gICAgdGhpcy5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gdGhpcy5jc3Nfc2l6ZS5oZWlnaHQgKyAncHgnO1xuICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aDtcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmRldmljZV9zaXplLmhlaWdodDtcblxuICAgIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKHRoaXMuZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgIHRoaXMuZ2wudmlld3BvcnQoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucmVxdWVzdFJlZHJhdyA9IGZ1bmN0aW9uICgpXG57XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG4vLyBEZXRlcm1pbmUgYSBaIHZhbHVlIHRoYXQgd2lsbCBzdGFjayBmZWF0dXJlcyBpbiBhIFwicGFpbnRlcidzIGFsZ29yaXRobVwiIHN0eWxlLCBmaXJzdCBieSBsYXllciwgdGhlbiBieSBkcmF3IG9yZGVyIHdpdGhpbiBsYXllclxuLy8gRmVhdHVyZXMgYXJlIGFzc3VtZWQgdG8gYmUgYWxyZWFkeSBzb3J0ZWQgaW4gZGVzaXJlZCBkcmF3IG9yZGVyIGJ5IHRoZSBsYXllciBwcmUtcHJvY2Vzc29yXG5TY2VuZS5jYWxjdWxhdGVaID0gZnVuY3Rpb24gKGxheWVyLCB0aWxlLCBsYXllcl9vZmZzZXQsIGZlYXR1cmVfb2Zmc2V0KVxue1xuICAgIC8vIHZhciBsYXllcl9vZmZzZXQgPSBsYXllcl9vZmZzZXQgfHwgMDtcbiAgICAvLyB2YXIgZmVhdHVyZV9vZmZzZXQgPSBmZWF0dXJlX29mZnNldCB8fCAwO1xuICAgIHZhciB6ID0gMDsgLy8gVE9ETzogbWFkZSB0aGlzIGEgbm8tb3AgdW50aWwgcmV2aXNpdGluZyB3aGVyZSBpdCBzaG91bGQgbGl2ZSAtIG9uZS10aW1lIGNhbGMgaGVyZSwgaW4gdmVydGV4IGxheW91dC9zaGFkZXIsIGV0Yy5cbiAgICByZXR1cm4gejtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKVxue1xuICAgIHRoaXMubG9hZFF1ZXVlZFRpbGVzKCk7XG5cbiAgICAvLyBSZW5kZXIgb24gZGVtYW5kXG4gICAgaWYgKHRoaXMuZGlydHkgPT0gZmFsc2UgfHwgdGhpcy5pbml0aWFsaXplZCA9PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuZGlydHkgPSBmYWxzZTsgLy8gc3ViY2xhc3NlcyBjYW4gc2V0IHRoaXMgYmFjayB0byB0cnVlIHdoZW4gYW5pbWF0aW9uIGlzIG5lZWRlZFxuXG4gICAgdGhpcy5yZW5kZXJHTCgpO1xuXG4gICAgLy8gUmVkcmF3IGV2ZXJ5IGZyYW1lIGlmIGFuaW1hdGluZ1xuICAgIGlmICh0aGlzLmFuaW1hdGVkID09IHRydWUpIHtcbiAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5mcmFtZSsrO1xuXG4gICAgLy8gY29uc29sZS5sb2coXCJyZW5kZXIgbWFwXCIpO1xuICAgIHJldHVybiB0cnVlO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlc2V0RnJhbWUgPSBmdW5jdGlvbiAoKVxue1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgZnJhbWUgc3RhdGVcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuICAgIGdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKTtcbiAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG5cbiAgICAvLyBUT0RPOiB1bm5lY2Vzc2FyeSByZXBlYXQ/XG4gICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgIGdsLmRlcHRoRnVuYyhnbC5MRVNTKTtcbiAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICBnbC5jdWxsRmFjZShnbC5CQUNLKTtcbiAgICAvLyBnbC5lbmFibGUoZ2wuQkxFTkQpO1xuICAgIC8vIGdsLmJsZW5kRnVuYyhnbC5TUkNfQUxQSEEsIGdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlbmRlckdMID0gZnVuY3Rpb24gKClcbntcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuXG4gICAgdGhpcy5pbnB1dCgpO1xuICAgIHRoaXMucmVzZXRGcmFtZSgpO1xuXG4gICAgLy8gTWFwIHRyYW5zZm9ybXNcbiAgICB2YXIgY2VudGVyID0gR2VvLmxhdExuZ1RvTWV0ZXJzKFBvaW50KHRoaXMuY2VudGVyLmxuZywgdGhpcy5jZW50ZXIubGF0KSk7XG4gICAgdmFyIG1ldGVyc19wZXJfcGl4ZWwgPSBHZW8ubWluX3pvb21fbWV0ZXJzX3Blcl9waXhlbCAvIE1hdGgucG93KDIsIHRoaXMuem9vbSk7XG4gICAgdmFyIG1ldGVyX3pvb20gPSBQb2ludCh0aGlzLmNzc19zaXplLndpZHRoIC8gMiAqIG1ldGVyc19wZXJfcGl4ZWwsIHRoaXMuY3NzX3NpemUuaGVpZ2h0IC8gMiAqIG1ldGVyc19wZXJfcGl4ZWwpO1xuXG4gICAgLy8gTWF0cmljZXNcbiAgICB2YXIgdGlsZV92aWV3X21hdCA9IG1hdDQuY3JlYXRlKCk7XG4gICAgdmFyIHRpbGVfd29ybGRfbWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAgICB2YXIgbWV0ZXJfdmlld19tYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuXG4gICAgLy8gQ29udmVydCBtZXJjYXRvciBtZXRlcnMgdG8gc2NyZWVuIHNwYWNlXG4gICAgbWF0NC5zY2FsZShtZXRlcl92aWV3X21hdCwgbWV0ZXJfdmlld19tYXQsIHZlYzMuZnJvbVZhbHVlcygxIC8gbWV0ZXJfem9vbS54LCAxIC8gbWV0ZXJfem9vbS55LCAxIC8gbWV0ZXJfem9vbS55KSk7XG5cbiAgICAvLyBSZW5kZXJhYmxlIHRpbGUgbGlzdFxuICAgIHZhciByZW5kZXJhYmxlX3RpbGVzID0gW107XG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIHZhciB0aWxlID0gdGhpcy50aWxlc1t0XTtcbiAgICAgICAgaWYgKHRpbGUubG9hZGVkID09IHRydWUgJiYgdGlsZS52aXNpYmxlID09IHRydWUpIHtcbiAgICAgICAgICAgIHJlbmRlcmFibGVfdGlsZXMucHVzaCh0aWxlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlbmRlcmFibGVfdGlsZXNfY291bnQgPSByZW5kZXJhYmxlX3RpbGVzLmxlbmd0aDtcblxuICAgIC8vIFJlbmRlciBtYWluIHBhc3MgLSB0aWxlcyBncm91cGVkIGJ5IHJlbmRlcmluZyBtb2RlIChHTCBwcm9ncmFtKVxuICAgIHZhciByZW5kZXJfY291bnQgPSAwO1xuICAgIGZvciAodmFyIG1vZGUgaW4gdGhpcy5tb2Rlcykge1xuICAgICAgICAvLyBQZXItZnJhbWUgbW9kZSB1cGRhdGVzL2FuaW1hdGlvbnNcbiAgICAgICAgLy8gQ2FsbGVkIGV2ZW4gaWYgdGhlIG1vZGUgaXNuJ3QgcmVuZGVyZWQgYnkgYW55IGN1cnJlbnQgdGlsZXMsIHNvIHRpbWUtYmFzZWQgYW5pbWF0aW9ucywgZXRjLiBjb250aW51ZVxuICAgICAgICB0aGlzLm1vZGVzW21vZGVdLnVwZGF0ZSgpO1xuXG4gICAgICAgIHZhciBnbF9wcm9ncmFtID0gdGhpcy5tb2Rlc1ttb2RlXS5nbF9wcm9ncmFtO1xuICAgICAgICBpZiAoZ2xfcHJvZ3JhbSA9PSBudWxsIHx8IGdsX3Byb2dyYW0uY29tcGlsZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpcnN0X2Zvcl9tb2RlID0gdHJ1ZTtcblxuICAgICAgICAvLyBSZW5kZXIgdGlsZSBHTCBnZW9tZXRyaWVzXG4gICAgICAgIGZvciAodmFyIHQgaW4gcmVuZGVyYWJsZV90aWxlcykge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSByZW5kZXJhYmxlX3RpbGVzW3RdO1xuXG4gICAgICAgICAgICBpZiAodGlsZS5nbF9nZW9tZXRyeVttb2RlXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gU2V0dXAgbW9kZSBpZiBlbmNvdW50ZXJpbmcgZm9yIGZpcnN0IHRpbWUgdGhpcyBmcmFtZVxuICAgICAgICAgICAgICAgIC8vIChsYXp5IGluaXQsIG5vdCBhbGwgbW9kZXMgd2lsbCBiZSB1c2VkIGluIGFsbCBzY3JlZW4gdmlld3M7IHNvbWUgbW9kZXMgbWlnaHQgYmUgZGVmaW5lZCBidXQgbmV2ZXIgdXNlZClcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RfZm9yX21vZGUgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBmaXJzdF9mb3JfbW9kZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZXNbbW9kZV0uc2V0VW5pZm9ybXMoKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBkb24ndCBzZXQgdW5pZm9ybXMgd2hlbiB0aGV5IGhhdmVuJ3QgY2hhbmdlZFxuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfcmVzb2x1dGlvbicsIHRoaXMuZGV2aWNlX3NpemUud2lkdGgsIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X2FzcGVjdCcsIHRoaXMuZGV2aWNlX3NpemUud2lkdGggLyB0aGlzLmRldmljZV9zaXplLmhlaWdodCwgMS4wKTtcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X3RpbWUnLCAoKCtuZXcgRGF0ZSgpKSAtIHRoaXMuc3RhcnRfdGltZSkgLyAxMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X21hcF96b29tJywgdGhpcy56b29tKTsgLy8gTWF0aC5mbG9vcih0aGlzLnpvb20pICsgKE1hdGgubG9nKCh0aGlzLnpvb20gJSAxKSArIDEpIC8gTWF0aC5MTjIgLy8gc2NhbGUgZnJhY3Rpb25hbCB6b29tIGJ5IGxvZ1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfbWFwX2NlbnRlcicsIGNlbnRlci54LCBjZW50ZXIueSk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9udW1fbGF5ZXJzJywgdGhpcy5sYXllcnMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X21ldGVyc19wZXJfcGl4ZWwnLCBtZXRlcnNfcGVyX3BpeGVsKTtcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCdNYXRyaXg0ZnYnLCAndV9tZXRlcl92aWV3JywgZmFsc2UsIG1ldGVyX3ZpZXdfbWF0KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBjYWxjIHRoZXNlIG9uY2UgcGVyIHRpbGUgKGN1cnJlbnRseSBiZWluZyBuZWVkbGVzc2x5IHJlLWNhbGN1bGF0ZWQgcGVyLXRpbGUtcGVyLW1vZGUpXG5cbiAgICAgICAgICAgICAgICAvLyBUaWxlIG9yaWdpblxuICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV90aWxlX29yaWdpbicsIHRpbGUubWluLngsIHRpbGUubWluLnkpO1xuXG4gICAgICAgICAgICAgICAgLy8gVGlsZSB2aWV3IG1hdHJpeCAtIHRyYW5zZm9ybSB0aWxlIHNwYWNlIGludG8gdmlldyBzcGFjZSAobWV0ZXJzLCByZWxhdGl2ZSB0byBjYW1lcmEpXG4gICAgICAgICAgICAgICAgbWF0NC5pZGVudGl0eSh0aWxlX3ZpZXdfbWF0KTtcbiAgICAgICAgICAgICAgICBtYXQ0LnRyYW5zbGF0ZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5taW4ueCAtIGNlbnRlci54LCB0aWxlLm1pbi55IC0gY2VudGVyLnksIDApKTsgLy8gYWRqdXN0IGZvciB0aWxlIG9yaWdpbiAmIG1hcCBjZW50ZXJcbiAgICAgICAgICAgICAgICBtYXQ0LnNjYWxlKHRpbGVfdmlld19tYXQsIHRpbGVfdmlld19tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLnNwYW4ueCAvIFNjZW5lLnRpbGVfc2NhbGUsIC0xICogdGlsZS5zcGFuLnkgLyBTY2VuZS50aWxlX3NjYWxlLCAxKSk7IC8vIHNjYWxlIHRpbGUgbG9jYWwgY29vcmRzIHRvIG1ldGVyc1xuICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfdGlsZV92aWV3JywgZmFsc2UsIHRpbGVfdmlld19tYXQpO1xuXG4gICAgICAgICAgICAgICAgLy8gVGlsZSB3b3JsZCBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHdvcmxkIHNwYWNlIChtZXRlcnMsIGFic29sdXRlIG1lcmNhdG9yIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIG1hdDQuaWRlbnRpdHkodGlsZV93b3JsZF9tYXQpO1xuICAgICAgICAgICAgICAgIG1hdDQudHJhbnNsYXRlKHRpbGVfd29ybGRfbWF0LCB0aWxlX3dvcmxkX21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUubWluLngsIHRpbGUubWluLnksIDApKTtcbiAgICAgICAgICAgICAgICBtYXQ0LnNjYWxlKHRpbGVfd29ybGRfbWF0LCB0aWxlX3dvcmxkX21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUuc3Bhbi54IC8gU2NlbmUudGlsZV9zY2FsZSwgLTEgKiB0aWxlLnNwYW4ueSAvIFNjZW5lLnRpbGVfc2NhbGUsIDEpKTsgLy8gc2NhbGUgdGlsZSBsb2NhbCBjb29yZHMgdG8gbWV0ZXJzXG4gICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCdNYXRyaXg0ZnYnLCAndV90aWxlX3dvcmxkJywgZmFsc2UsIHRpbGVfd29ybGRfbWF0KTtcblxuICAgICAgICAgICAgICAgIC8vIFJlbmRlciB0aWxlXG4gICAgICAgICAgICAgICAgdGlsZS5nbF9nZW9tZXRyeVttb2RlXS5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICByZW5kZXJfY291bnQgKz0gdGlsZS5nbF9nZW9tZXRyeVttb2RlXS5nZW9tZXRyeV9jb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlbmRlciBzZWxlY3Rpb24gcGFzcyAoaWYgbmVlZGVkKVxuICAgIC8vIFNsaWdodCB2YXJpYXRpb25zIG9uIHJlbmRlciBwYXNzIGNvZGUgYWJvdmUgLSBtb3N0bHkgYmVjYXVzZSB3ZSdyZSByZXVzaW5nIHVuaWZvcm1zIGZyb20gdGhlIG1haW5cbiAgICAvLyBtb2RlIHByb2dyYW0sIGZvciB0aGUgc2VsZWN0aW9uIHByb2dyYW1cbiAgICAvLyBUT0RPOiByZWR1Y2UgZHVwbGljYXRlZCBjb2RlIHcvbWFpbiByZW5kZXIgcGFzcyBhYm92ZVxuICAgIGlmICh0aGlzLnVwZGF0ZV9zZWxlY3Rpb24pIHtcbiAgICAgICAgdGhpcy51cGRhdGVfc2VsZWN0aW9uID0gZmFsc2U7IC8vIHJlc2V0IHNlbGVjdGlvbiBjaGVja1xuXG4gICAgICAgIC8vIFRPRE86IHF1ZXVlIGNhbGxiYWNrIHRpbGwgcGFubmluZyBpcyBvdmVyPyBjb29yZHMgd2hlcmUgc2VsZWN0aW9uIHdhcyByZXF1ZXN0ZWQgYXJlIG91dCBvZiBkYXRlXG4gICAgICAgIGlmICh0aGlzLnBhbm5pbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN3aXRjaCB0byBGQk9cbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCB0aGlzLmZibyk7XG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5yZXNldEZyYW1lKCk7XG5cbiAgICAgICAgZm9yIChtb2RlIGluIHRoaXMubW9kZXMpIHtcbiAgICAgICAgICAgIGdsX3Byb2dyYW0gPSB0aGlzLm1vZGVzW21vZGVdLnNlbGVjdGlvbl9nbF9wcm9ncmFtO1xuICAgICAgICAgICAgaWYgKGdsX3Byb2dyYW0gPT0gbnVsbCB8fCBnbF9wcm9ncmFtLmNvbXBpbGVkID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZpcnN0X2Zvcl9tb2RlID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gUmVuZGVyIHRpbGUgR0wgZ2VvbWV0cmllc1xuICAgICAgICAgICAgZm9yICh0IGluIHJlbmRlcmFibGVfdGlsZXMpIHtcbiAgICAgICAgICAgICAgICB0aWxlID0gcmVuZGVyYWJsZV90aWxlc1t0XTtcblxuICAgICAgICAgICAgICAgIGlmICh0aWxlLmdsX2dlb21ldHJ5W21vZGVdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0dXAgbW9kZSBpZiBlbmNvdW50ZXJpbmcgZm9yIGZpcnN0IHRpbWUgdGhpcyBmcmFtZVxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3RfZm9yX21vZGUgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RfZm9yX21vZGUgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51c2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZXNbbW9kZV0uc2V0VW5pZm9ybXMoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X3Jlc29sdXRpb24nLCB0aGlzLmZib19zaXplLndpZHRoLCB0aGlzLmZib19zaXplLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfYXNwZWN0JywgdGhpcy5mYm9fc2l6ZS53aWR0aCAvIHRoaXMuZmJvX3NpemUuaGVpZ2h0LCAxLjApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X3RpbWUnLCAoKCtuZXcgRGF0ZSgpKSAtIHRoaXMuc3RhcnRfdGltZSkgLyAxMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9tYXBfem9vbScsIHRoaXMuem9vbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfbWFwX2NlbnRlcicsIGNlbnRlci54LCBjZW50ZXIueSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbnVtX2xheWVycycsIHRoaXMubGF5ZXJzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbWV0ZXJzX3Blcl9waXhlbCcsIG1ldGVyc19wZXJfcGl4ZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCdNYXRyaXg0ZnYnLCAndV9tZXRlcl92aWV3JywgZmFsc2UsIG1ldGVyX3ZpZXdfbWF0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbGUgb3JpZ2luXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV90aWxlX29yaWdpbicsIHRpbGUubWluLngsIHRpbGUubWluLnkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbGUgdmlldyBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHZpZXcgc3BhY2UgKG1ldGVycywgcmVsYXRpdmUgdG8gY2FtZXJhKVxuICAgICAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfdmlld19tYXQpO1xuICAgICAgICAgICAgICAgICAgICBtYXQ0LnRyYW5zbGF0ZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5taW4ueCAtIGNlbnRlci54LCB0aWxlLm1pbi55IC0gY2VudGVyLnksIDApKTsgLy8gYWRqdXN0IGZvciB0aWxlIG9yaWdpbiAmIG1hcCBjZW50ZXJcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5zcGFuLnggLyBTY2VuZS50aWxlX3NjYWxlLCAtMSAqIHRpbGUuc3Bhbi55IC8gU2NlbmUudGlsZV9zY2FsZSwgMSkpOyAvLyBzY2FsZSB0aWxlIGxvY2FsIGNvb3JkcyB0byBtZXRlcnNcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCdNYXRyaXg0ZnYnLCAndV90aWxlX3ZpZXcnLCBmYWxzZSwgdGlsZV92aWV3X21hdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGlsZSB3b3JsZCBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHdvcmxkIHNwYWNlIChtZXRlcnMsIGFic29sdXRlIG1lcmNhdG9yIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfd29ybGRfbWF0KTtcbiAgICAgICAgICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGlsZV93b3JsZF9tYXQsIHRpbGVfd29ybGRfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5taW4ueCwgdGlsZS5taW4ueSwgMCkpO1xuICAgICAgICAgICAgICAgICAgICBtYXQ0LnNjYWxlKHRpbGVfd29ybGRfbWF0LCB0aWxlX3dvcmxkX21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUuc3Bhbi54IC8gU2NlbmUudGlsZV9zY2FsZSwgLTEgKiB0aWxlLnNwYW4ueSAvIFNjZW5lLnRpbGVfc2NhbGUsIDEpKTsgLy8gc2NhbGUgdGlsZSBsb2NhbCBjb29yZHMgdG8gbWV0ZXJzXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfdGlsZV93b3JsZCcsIGZhbHNlLCB0aWxlX3dvcmxkX21hdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVuZGVyIHRpbGVcbiAgICAgICAgICAgICAgICAgICAgdGlsZS5nbF9nZW9tZXRyeVttb2RlXS5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWxheSByZWFkaW5nIHRoZSBwaXhlbCByZXN1bHQgZnJvbSB0aGUgc2VsZWN0aW9uIGJ1ZmZlciB0byBhdm9pZCBDUFUvR1BVIHN5bmMgbG9jay5cbiAgICAgICAgLy8gQ2FsbGluZyByZWFkUGl4ZWxzIHN5bmNocm9ub3VzbHkgY2F1c2VkIGEgbWFzc2l2ZSBwZXJmb3JtYW5jZSBoaXQsIHByZXN1bWFibHkgc2luY2UgaXRcbiAgICAgICAgLy8gZm9yY2VkIHRoaXMgZnVuY3Rpb24gdG8gd2FpdCBmb3IgdGhlIEdQVSB0byBmaW5pc2ggcmVuZGVyaW5nIGFuZCByZXRyaWV2ZSB0aGUgdGV4dHVyZSBjb250ZW50cy5cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrX3RpbWVyICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNlbGVjdGlvbl9jYWxsYmFja190aW1lcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2tfdGltZXIgPSBzZXRUaW1lb3V0KFxuICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCB0aGlzLmZibyk7XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBzZWxlY3Rpb24gbWFwIGFnYWluc3QgRkJPXG4gICAgICAgICAgICAgICAgZ2wucmVhZFBpeGVscyhcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5mbG9vcih0aGlzLnNlbGVjdGlvbl9wb2ludC54ICogdGhpcy5mYm9fc2l6ZS53aWR0aCAvIHRoaXMuZGV2aWNlX3NpemUud2lkdGgpLFxuICAgICAgICAgICAgICAgICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnkgKiB0aGlzLmZib19zaXplLmhlaWdodCAvIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0KSxcbiAgICAgICAgICAgICAgICAgICAgMSwgMSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgdGhpcy5waXhlbCk7XG4gICAgICAgICAgICAgICAgdmFyIGZlYXR1cmVfa2V5ID0gKHRoaXMucGl4ZWxbMF0gKyAodGhpcy5waXhlbFsxXSA8PCA4KSArICh0aGlzLnBpeGVsWzJdIDw8IDE2KSArICh0aGlzLnBpeGVsWzNdIDw8IDI0KSkgPj4+IDA7XG5cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAvLyAgICAgTWF0aC5mbG9vcih0aGlzLnNlbGVjdGlvbl9wb2ludC54ICogdGhpcy5mYm9fc2l6ZS53aWR0aCAvIHRoaXMuZGV2aWNlX3NpemUud2lkdGgpICsgXCIsIFwiICtcbiAgICAgICAgICAgICAgICAvLyAgICAgTWF0aC5mbG9vcih0aGlzLnNlbGVjdGlvbl9wb2ludC55ICogdGhpcy5mYm9fc2l6ZS5oZWlnaHQgLyB0aGlzLmRldmljZV9zaXplLmhlaWdodCkgKyBcIjogKFwiICtcbiAgICAgICAgICAgICAgICAvLyAgICAgdGhpcy5waXhlbFswXSArIFwiLCBcIiArIHRoaXMucGl4ZWxbMV0gKyBcIiwgXCIgKyB0aGlzLnBpeGVsWzJdICsgXCIsIFwiICsgdGhpcy5waXhlbFszXSArIFwiKVwiKTtcblxuICAgICAgICAgICAgICAgIC8vIElmIGZlYXR1cmUgZm91bmQsIGFzayBhcHByb3ByaWF0ZSB3ZWIgd29ya2VyIHRvIGxvb2t1cCBmZWF0dXJlXG4gICAgICAgICAgICAgICAgdmFyIHdvcmtlcl9pZCA9IHRoaXMucGl4ZWxbM107XG4gICAgICAgICAgICAgICAgaWYgKHdvcmtlcl9pZCAhPSAyNTUpIHsgLy8gMjU1IGluZGljYXRlcyBhbiBlbXB0eSBzZWxlY3Rpb24gYnVmZmVyIHBpeGVsXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwid29ya2VyX2lkOiBcIiArIHdvcmtlcl9pZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLndvcmtlcnNbd29ya2VyX2lkXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInBvc3QgbWVzc2FnZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud29ya2Vyc1t3b3JrZXJfaWRdLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZ2V0RmVhdHVyZVNlbGVjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBmZWF0dXJlX2tleVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25fZnJhbWVfZGVsYXlcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBSZXNldCB0byBzY3JlZW4gYnVmZmVyXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgIH1cblxuICAgIGlmIChyZW5kZXJfY291bnQgIT0gdGhpcy5sYXN0X3JlbmRlcl9jb3VudCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInJlbmRlcmVkIFwiICsgcmVuZGVyX2NvdW50ICsgXCIgcHJpbWl0aXZlc1wiKTtcbiAgICB9XG4gICAgdGhpcy5sYXN0X3JlbmRlcl9jb3VudCA9IHJlbmRlcl9jb3VudDtcblxuICAgIHJldHVybiB0cnVlO1xufTtcblxuLy8gUmVxdWVzdCBmZWF0dXJlIHNlbGVjdGlvblxuLy8gUnVucyBhc3luY2hyb25vdXNseSwgc2NoZWR1bGVzIHNlbGVjdGlvbiBidWZmZXIgdG8gYmUgdXBkYXRlZFxuU2NlbmUucHJvdG90eXBlLmdldEZlYXR1cmVBdCA9IGZ1bmN0aW9uIChwaXhlbCwgY2FsbGJhY2spXG57XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBxdWV1ZSBjYWxsYmFja3Mgd2hpbGUgc3RpbGwgcGVyZm9ybWluZyBvbmx5IG9uZSBzZWxlY3Rpb24gcmVuZGVyIHBhc3Mgd2l0aGluIFggdGltZSBpbnRlcnZhbD9cbiAgICBpZiAodGhpcy51cGRhdGVfc2VsZWN0aW9uID09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZWN0aW9uX3BvaW50ID0gUG9pbnQoXG4gICAgICAgIHBpeGVsLnggKiB0aGlzLmRldmljZV9waXhlbF9yYXRpbyxcbiAgICAgICAgdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQgLSAocGl4ZWwueSAqIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvKVxuICAgICk7XG4gICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLnVwZGF0ZV9zZWxlY3Rpb24gPSB0cnVlO1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuLy8gUXVldWUgYSB0aWxlIGZvciBsb2FkXG5TY2VuZS5wcm90b3R5cGUubG9hZFRpbGUgPSBmdW5jdGlvbiAoY29vcmRzLCBkaXYsIGNhbGxiYWNrKVxue1xuICAgIHRoaXMucXVldWVkX3RpbGVzW3RoaXMucXVldWVkX3RpbGVzLmxlbmd0aF0gPSBhcmd1bWVudHM7XG59O1xuXG4vLyBMb2FkIGFsbCBxdWV1ZWQgdGlsZXNcblNjZW5lLnByb3RvdHlwZS5sb2FkUXVldWVkVGlsZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucXVldWVkX3RpbGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKHZhciB0PTA7IHQgPCB0aGlzLnF1ZXVlZF90aWxlcy5sZW5ndGg7IHQrKykge1xuICAgICAgICB0aGlzLl9sb2FkVGlsZS5hcHBseSh0aGlzLCB0aGlzLnF1ZXVlZF90aWxlc1t0XSk7XG4gICAgfVxuXG4gICAgdGhpcy5xdWV1ZWRfdGlsZXMgPSBbXTtcbn07XG5cbi8vIExvYWQgYSBzaW5nbGUgdGlsZVxuU2NlbmUucHJvdG90eXBlLl9sb2FkVGlsZSA9IGZ1bmN0aW9uIChjb29yZHMsIGRpdiwgY2FsbGJhY2spXG57XG4gICAgLy8gT3Zlcnpvb20/XG4gICAgaWYgKGNvb3Jkcy56ID4gdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSkge1xuICAgICAgICB2YXIgemdhcCA9IGNvb3Jkcy56IC0gdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbTtcbiAgICAgICAgLy8gdmFyIG9yaWdpbmFsX3RpbGUgPSBbY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMuel0uam9pbignLycpO1xuICAgICAgICBjb29yZHMueCA9IH5+KGNvb3Jkcy54IC8gTWF0aC5wb3coMiwgemdhcCkpO1xuICAgICAgICBjb29yZHMueSA9IH5+KGNvb3Jkcy55IC8gTWF0aC5wb3coMiwgemdhcCkpO1xuICAgICAgICBjb29yZHMuZGlzcGxheV96ID0gY29vcmRzLno7IC8vIHogd2l0aG91dCBvdmVyem9vbVxuICAgICAgICBjb29yZHMueiAtPSB6Z2FwO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImFkanVzdGVkIGZvciBvdmVyem9vbSwgdGlsZSBcIiArIG9yaWdpbmFsX3RpbGUgKyBcIiAtPiBcIiArIFtjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56XS5qb2luKCcvJykpO1xuICAgIH1cblxuICAgIHRoaXMudHJhY2tUaWxlU2V0TG9hZFN0YXJ0KCk7XG5cbiAgICB2YXIga2V5ID0gW2Nvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnpdLmpvaW4oJy8nKTtcblxuICAgIC8vIEFscmVhZHkgbG9hZGluZy9sb2FkZWQ/XG4gICAgaWYgKHRoaXMudGlsZXNba2V5XSkge1xuICAgICAgICAvLyBpZiAodGhpcy50aWxlc1trZXldLmxvYWRlZCA9PSB0cnVlKSB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcInVzZSBsb2FkZWQgdGlsZSBcIiArIGtleSArIFwiIGZyb20gY2FjaGVcIik7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gaWYgKHRoaXMudGlsZXNba2V5XS5sb2FkaW5nID09IHRydWUpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiYWxyZWFkeSBsb2FkaW5nIHRpbGUgXCIgKyBrZXkgKyBcIiwgc2tpcFwiKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGl2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV0gPSB7fTtcbiAgICB0aWxlLmtleSA9IGtleTtcbiAgICB0aWxlLmNvb3JkcyA9IGNvb3JkcztcbiAgICB0aWxlLm1pbiA9IEdlby5tZXRlcnNGb3JUaWxlKHRpbGUuY29vcmRzKTtcbiAgICB0aWxlLm1heCA9IEdlby5tZXRlcnNGb3JUaWxlKHsgeDogdGlsZS5jb29yZHMueCArIDEsIHk6IHRpbGUuY29vcmRzLnkgKyAxLCB6OiB0aWxlLmNvb3Jkcy56IH0pO1xuICAgIHRpbGUuc3BhbiA9IHsgeDogKHRpbGUubWF4LnggLSB0aWxlLm1pbi54KSwgeTogKHRpbGUubWF4LnkgLSB0aWxlLm1pbi55KSB9O1xuICAgIHRpbGUuYm91bmRzID0geyBzdzogeyB4OiB0aWxlLm1pbi54LCB5OiB0aWxlLm1heC55IH0sIG5lOiB7IHg6IHRpbGUubWF4LngsIHk6IHRpbGUubWluLnkgfSB9O1xuICAgIHRpbGUuZGVidWcgPSB7fTtcbiAgICB0aWxlLmxvYWRpbmcgPSB0cnVlO1xuICAgIHRpbGUubG9hZGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLmJ1aWxkVGlsZSh0aWxlLmtleSk7XG4gICAgdGhpcy51cGRhdGVUaWxlRWxlbWVudCh0aWxlLCBkaXYpO1xuICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUodGlsZSk7XG5cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgZGl2KTtcbiAgICB9XG59O1xuXG4vLyBSZWJ1aWxkIGFsbCB0aWxlc1xuLy8gVE9ETzogYWxzbyByZWJ1aWxkIG1vZGVzPyAoZGV0ZWN0IGlmIGNoYW5nZWQpXG5TY2VuZS5wcm90b3R5cGUucmVidWlsZFRpbGVzID0gZnVuY3Rpb24gKClcbntcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBsYXllcnMgJiBzdHlsZXNcbiAgICB0aGlzLmxheWVyc19zZXJpYWxpemVkID0gVXRpbHMuc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyh0aGlzLmxheWVycyk7XG4gICAgdGhpcy5zdHlsZXNfc2VyaWFsaXplZCA9IFV0aWxzLnNlcmlhbGl6ZVdpdGhGdW5jdGlvbnModGhpcy5zdHlsZXMpO1xuICAgIHRoaXMuc2VsZWN0aW9uX21hcCA9IHt9O1xuXG4gICAgLy8gVGVsbCB3b3JrZXJzIHdlJ3JlIGFib3V0IHRvIHJlYnVpbGQgKHNvIHRoZXkgY2FuIHJlZnJlc2ggc3R5bGVzLCBldGMuKVxuICAgIHRoaXMud29ya2Vycy5mb3JFYWNoKGZ1bmN0aW9uKHdvcmtlcikge1xuICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgdHlwZTogJ3ByZXBhcmVGb3JSZWJ1aWxkJyxcbiAgICAgICAgICAgIGxheWVyczogdGhpcy5sYXllcnNfc2VyaWFsaXplZCxcbiAgICAgICAgICAgIHN0eWxlczogdGhpcy5zdHlsZXNfc2VyaWFsaXplZFxuICAgICAgICB9KTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgLy8gUmVidWlsZCB2aXNpYmxlIHRpbGVzIGZpcnN0LCBmcm9tIGNlbnRlciBvdXRcbiAgICAvLyBjb25zb2xlLmxvZyhcImZpbmQgdmlzaWJsZVwiKTtcbiAgICB2YXIgdmlzaWJsZSA9IFtdLCBpbnZpc2libGUgPSBbXTtcbiAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgaWYgKHRoaXMudGlsZXNbdF0udmlzaWJsZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICB2aXNpYmxlLnB1c2godCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpbnZpc2libGUucHVzaCh0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvbnNvbGUubG9nKFwic29ydCB2aXNpYmxlIGRpc3RhbmNlXCIpO1xuICAgIHZpc2libGUuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIC8vIHZhciBhZCA9IE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy54IC0gdGhpcy50aWxlc1tiXS5taW4ueCkgKyBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueSAtIHRoaXMudGlsZXNbYl0ubWluLnkpO1xuICAgICAgICAvLyB2YXIgYmQgPSBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueCAtIHRoaXMudGlsZXNbYV0ubWluLngpICsgTWF0aC5hYnModGhpcy5jZW50ZXJfbWV0ZXJzLnkgLSB0aGlzLnRpbGVzW2FdLm1pbi55KTtcbiAgICAgICAgdmFyIGFkID0gdGhpcy50aWxlc1thXS5jZW50ZXJfZGlzdDtcbiAgICAgICAgdmFyIGJkID0gdGhpcy50aWxlc1tiXS5jZW50ZXJfZGlzdDtcbiAgICAgICAgcmV0dXJuIChiZCA+IGFkID8gLTEgOiAoYmQgPT0gYWQgPyAwIDogMSkpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkIHZpc2libGVcIik7XG4gICAgZm9yICh2YXIgdCBpbiB2aXNpYmxlKSB7XG4gICAgICAgIHRoaXMuYnVpbGRUaWxlKHZpc2libGVbdF0pO1xuICAgIH1cblxuICAgIC8vIGNvbnNvbGUubG9nKFwiYnVpbGQgaW52aXNpYmxlXCIpO1xuICAgIGZvciAodmFyIHQgaW4gaW52aXNpYmxlKSB7XG4gICAgICAgIC8vIEtlZXAgdGlsZXMgaW4gY3VycmVudCB6b29tIGJ1dCBvdXQgb2YgdmlzaWJsZSByYW5nZSwgYnV0IHJlYnVpbGQgYXMgbG93ZXIgcHJpb3JpdHlcbiAgICAgICAgaWYgKHRoaXMuaXNUaWxlSW5ab29tKHRoaXMudGlsZXNbaW52aXNpYmxlW3RdXSkgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5idWlsZFRpbGUoaW52aXNpYmxlW3RdKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBEcm9wIHRpbGVzIG91dHNpZGUgY3VycmVudCB6b29tXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVUaWxlKGludmlzaWJsZVt0XSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUFjdGl2ZU1vZGVzKCk7XG4gICAgdGhpcy5yZXNldFRpbWUoKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5idWlsZFRpbGUgPSBmdW5jdGlvbihrZXkpXG57XG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV07XG5cbiAgICB0aGlzLndvcmtlclBvc3RNZXNzYWdlRm9yVGlsZSh0aWxlLCB7XG4gICAgICAgIHR5cGU6ICdidWlsZFRpbGUnLFxuICAgICAgICB0aWxlOiB7XG4gICAgICAgICAgICBrZXk6IHRpbGUua2V5LFxuICAgICAgICAgICAgY29vcmRzOiB0aWxlLmNvb3JkcywgLy8gdXNlZCBieSBzdHlsZSBoZWxwZXJzXG4gICAgICAgICAgICBtaW46IHRpbGUubWluLCAvLyB1c2VkIGJ5IFRpbGVTb3VyY2UgdG8gc2NhbGUgdGlsZSB0byBsb2NhbCBleHRlbnRzXG4gICAgICAgICAgICBtYXg6IHRpbGUubWF4LCAvLyB1c2VkIGJ5IFRpbGVTb3VyY2UgdG8gc2NhbGUgdGlsZSB0byBsb2NhbCBleHRlbnRzXG4gICAgICAgICAgICBkZWJ1ZzogdGlsZS5kZWJ1Z1xuICAgICAgICB9LFxuICAgICAgICB0aWxlX3NvdXJjZTogdGhpcy50aWxlX3NvdXJjZSxcbiAgICAgICAgbGF5ZXJzOiB0aGlzLmxheWVyc19zZXJpYWxpemVkLFxuICAgICAgICBzdHlsZXM6IHRoaXMuc3R5bGVzX3NlcmlhbGl6ZWRcbiAgICB9KTtcbn07XG5cbi8vIFByb2Nlc3MgZ2VvbWV0cnkgZm9yIHRpbGUgLSBjYWxsZWQgYnkgd2ViIHdvcmtlclxuLy8gUmV0dXJucyBhIHNldCBvZiB0aWxlIGtleXMgdGhhdCBzaG91bGQgYmUgc2VudCB0byB0aGUgbWFpbiB0aHJlYWQgKHNvIHRoYXQgd2UgY2FuIG1pbmltaXplIGRhdGEgZXhjaGFuZ2UgYmV0d2VlbiB3b3JrZXIgYW5kIG1haW4gdGhyZWFkKVxuU2NlbmUuYWRkVGlsZSA9IGZ1bmN0aW9uICh0aWxlLCBsYXllcnMsIHN0eWxlcywgbW9kZXMpXG57XG4gICAgdmFyIGxheWVyLCBzdHlsZSwgZmVhdHVyZSwgeiwgbW9kZTtcbiAgICB2YXIgdmVydGV4X2RhdGEgPSB7fTtcblxuICAgIC8vIEpvaW4gbGluZSB0ZXN0IHBhdHRlcm5cbiAgICAvLyBpZiAoU2NlbmUuZGVidWcpIHtcbiAgICAvLyAgICAgdGlsZS5sYXllcnNbJ3JvYWRzJ10uZmVhdHVyZXMucHVzaChTY2VuZS5idWlsZFppZ3phZ0xpbmVUZXN0UGF0dGVybigpKTtcbiAgICAvLyB9XG5cbiAgICAvLyBCdWlsZCByYXcgZ2VvbWV0cnkgYXJyYXlzXG4gICAgdGlsZS5kZWJ1Zy5mZWF0dXJlcyA9IDA7XG4gICAgZm9yICh2YXIgbGF5ZXJfbnVtPTA7IGxheWVyX251bSA8IGxheWVycy5sZW5ndGg7IGxheWVyX251bSsrKSB7XG4gICAgICAgIGxheWVyID0gbGF5ZXJzW2xheWVyX251bV07XG5cbiAgICAgICAgLy8gU2tpcCBsYXllcnMgd2l0aCBubyBzdHlsZXMgZGVmaW5lZCwgb3IgbGF5ZXJzIHNldCB0byBub3QgYmUgdmlzaWJsZVxuICAgICAgICBpZiAoc3R5bGVzLmxheWVyc1tsYXllci5uYW1lXSA9PSBudWxsIHx8IHN0eWxlcy5sYXllcnNbbGF5ZXIubmFtZV0udmlzaWJsZSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGlsZS5sYXllcnNbbGF5ZXIubmFtZV0gIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIG51bV9mZWF0dXJlcyA9IHRpbGUubGF5ZXJzW2xheWVyLm5hbWVdLmZlYXR1cmVzLmxlbmd0aDtcblxuICAgICAgICAgICAgLy8gUmVuZGVyaW5nIHJldmVyc2Ugb3JkZXIgYWthIHRvcCB0byBib3R0b21cbiAgICAgICAgICAgIGZvciAodmFyIGYgPSBudW1fZmVhdHVyZXMtMTsgZiA+PSAwOyBmLS0pIHtcbiAgICAgICAgICAgICAgICBmZWF0dXJlID0gdGlsZS5sYXllcnNbbGF5ZXIubmFtZV0uZmVhdHVyZXNbZl07XG4gICAgICAgICAgICAgICAgc3R5bGUgPSBTdHlsZS5wYXJzZVN0eWxlRm9yRmVhdHVyZShmZWF0dXJlLCBsYXllci5uYW1lLCBzdHlsZXMubGF5ZXJzW2xheWVyLm5hbWVdLCB0aWxlKTtcblxuICAgICAgICAgICAgICAgIC8vIFNraXAgZmVhdHVyZT9cbiAgICAgICAgICAgICAgICBpZiAoc3R5bGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdHlsZS5sYXllcl9udW0gPSBsYXllcl9udW07XG4gICAgICAgICAgICAgICAgc3R5bGUueiA9IFNjZW5lLmNhbGN1bGF0ZVoobGF5ZXIsIHRpbGUpICsgc3R5bGUuejtcblxuICAgICAgICAgICAgICAgIHZhciBwb2ludHMgPSBudWxsLFxuICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHBvbHlnb25zID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIGlmIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvbHlnb25zID0gW2ZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9seWdvbnMgPSBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzID0gW2ZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ011bHRpTGluZVN0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXMgPSBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICBwb2ludHMgPSBbZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2ludCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRzID0gZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBGaXJzdCBmZWF0dXJlIGluIHRoaXMgcmVuZGVyIG1vZGU/XG4gICAgICAgICAgICAgICAgbW9kZSA9IHN0eWxlLm1vZGUubmFtZTtcbiAgICAgICAgICAgICAgICBpZiAodmVydGV4X2RhdGFbbW9kZV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB2ZXJ0ZXhfZGF0YVttb2RlXSA9IFtdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwb2x5Z29ucyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVzW21vZGVdLmJ1aWxkUG9seWdvbnMocG9seWdvbnMsIHN0eWxlLCB2ZXJ0ZXhfZGF0YVttb2RlXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxpbmVzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZXNbbW9kZV0uYnVpbGRMaW5lcyhsaW5lcywgc3R5bGUsIHZlcnRleF9kYXRhW21vZGVdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocG9pbnRzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZXNbbW9kZV0uYnVpbGRQb2ludHMocG9pbnRzLCBzdHlsZSwgdmVydGV4X2RhdGFbbW9kZV0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRpbGUuZGVidWcuZmVhdHVyZXMrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRpbGUudmVydGV4X2RhdGEgPSB7fTtcbiAgICBmb3IgKHZhciBzIGluIHZlcnRleF9kYXRhKSB7XG4gICAgICAgIHRpbGUudmVydGV4X2RhdGFbc10gPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRleF9kYXRhW3NdKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB2ZXJ0ZXhfZGF0YTogdHJ1ZVxuICAgIH07XG59O1xuXG4vLyBDYWxsZWQgb24gbWFpbiB0aHJlYWQgd2hlbiBhIHdlYiB3b3JrZXIgY29tcGxldGVzIHByb2Nlc3NpbmcgZm9yIGEgc2luZ2xlIHRpbGUgKGluaXRpYWwgbG9hZCwgb3IgcmVidWlsZClcblNjZW5lLnByb3RvdHlwZS53b3JrZXJCdWlsZFRpbGVDb21wbGV0ZWQgPSBmdW5jdGlvbiAoZXZlbnQpXG57XG4gICAgaWYgKGV2ZW50LmRhdGEudHlwZSAhPSAnYnVpbGRUaWxlQ29tcGxldGVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVHJhY2sgc2VsZWN0aW9uIG1hcCBzaXplIChmb3Igc3RhdHMvZGVidWcpIC0gdXBkYXRlIHBlciB3b3JrZXIgYW5kIHN1bSBhY3Jvc3Mgd29ya2Vyc1xuICAgIHRoaXMuc2VsZWN0aW9uX21hcF93b3JrZXJfc2l6ZVtldmVudC5kYXRhLndvcmtlcl9pZF0gPSBldmVudC5kYXRhLnNlbGVjdGlvbl9tYXBfc2l6ZTtcbiAgICB0aGlzLnNlbGVjdGlvbl9tYXBfc2l6ZSA9IDA7XG4gICAgT2JqZWN0LmtleXModGhpcy5zZWxlY3Rpb25fbWFwX3dvcmtlcl9zaXplKS5mb3JFYWNoKGZ1bmN0aW9uKHcpIHsgdGhpcy5zZWxlY3Rpb25fbWFwX3NpemUgKz0gdGhpcy5zZWxlY3Rpb25fbWFwX3dvcmtlcl9zaXplW3ddOyB9LmJpbmQodGhpcykpO1xuICAgIGNvbnNvbGUubG9nKFwic2VsZWN0aW9uIG1hcDogXCIgKyB0aGlzLnNlbGVjdGlvbl9tYXBfc2l6ZSArIFwiIGZlYXR1cmVzXCIpO1xuXG4gICAgdmFyIHRpbGUgPSBldmVudC5kYXRhLnRpbGU7XG5cbiAgICAvLyBSZW1vdmVkIHRoaXMgdGlsZSBkdXJpbmcgbG9hZD9cbiAgICBpZiAodGhpcy50aWxlc1t0aWxlLmtleV0gPT0gbnVsbCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImRpc2NhcmRlZCB0aWxlIFwiICsgdGlsZS5rZXkgKyBcIiBpbiBTY2VuZS50aWxlV29ya2VyQ29tcGxldGVkIGJlY2F1c2UgcHJldmlvdXNseSByZW1vdmVkXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRpbGUgd2l0aCBwcm9wZXJ0aWVzIGZyb20gd29ya2VyXG4gICAgdGlsZSA9IHRoaXMubWVyZ2VUaWxlKHRpbGUua2V5LCB0aWxlKTtcblxuICAgIHRoaXMuYnVpbGRHTEdlb21ldHJ5KHRpbGUpO1xuXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gICAgdGhpcy50cmFja1RpbGVTZXRMb2FkRW5kKCk7XG4gICAgdGhpcy5wcmludERlYnVnRm9yVGlsZSh0aWxlKTtcbn07XG5cbi8vIENhbGxlZCBvbiBtYWluIHRocmVhZCB3aGVuIGEgd2ViIHdvcmtlciBjb21wbGV0ZXMgcHJvY2Vzc2luZyBmb3IgYSBzaW5nbGUgdGlsZVxuU2NlbmUucHJvdG90eXBlLmJ1aWxkR0xHZW9tZXRyeSA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIHZhciB2ZXJ0ZXhfZGF0YSA9IHRpbGUudmVydGV4X2RhdGE7XG5cbiAgICAvLyBDbGVhbnVwIGV4aXN0aW5nIEdMIGdlb21ldHJ5IG9iamVjdHNcbiAgICB0aGlzLmZyZWVUaWxlUmVzb3VyY2VzKHRpbGUpO1xuICAgIHRpbGUuZ2xfZ2VvbWV0cnkgPSB7fTtcblxuICAgIC8vIENyZWF0ZSBHTCBnZW9tZXRyeSBvYmplY3RzXG4gICAgZm9yICh2YXIgcyBpbiB2ZXJ0ZXhfZGF0YSkge1xuICAgICAgICB0aWxlLmdsX2dlb21ldHJ5W3NdID0gdGhpcy5tb2Rlc1tzXS5tYWtlR0xHZW9tZXRyeSh2ZXJ0ZXhfZGF0YVtzXSk7XG4gICAgfVxuXG4gICAgdGlsZS5kZWJ1Zy5nZW9tZXRyaWVzID0gMDtcbiAgICB0aWxlLmRlYnVnLmJ1ZmZlcl9zaXplID0gMDtcbiAgICBmb3IgKHZhciBwIGluIHRpbGUuZ2xfZ2VvbWV0cnkpIHtcbiAgICAgICAgdGlsZS5kZWJ1Zy5nZW9tZXRyaWVzICs9IHRpbGUuZ2xfZ2VvbWV0cnlbcF0uZ2VvbWV0cnlfY291bnQ7XG4gICAgICAgIHRpbGUuZGVidWcuYnVmZmVyX3NpemUgKz0gdGlsZS5nbF9nZW9tZXRyeVtwXS52ZXJ0ZXhfZGF0YS5ieXRlTGVuZ3RoO1xuICAgIH1cbiAgICB0aWxlLmRlYnVnLmdlb21fcmF0aW8gPSAodGlsZS5kZWJ1Zy5nZW9tZXRyaWVzIC8gdGlsZS5kZWJ1Zy5mZWF0dXJlcykudG9GaXhlZCgxKTtcblxuICAgIGRlbGV0ZSB0aWxlLnZlcnRleF9kYXRhOyAvLyBUT0RPOiBtaWdodCB3YW50IHRvIHByZXNlcnZlIHRoaXMgZm9yIHJlYnVpbGRpbmcgZ2VvbWV0cmllcyB3aGVuIHN0eWxlcy9ldGMuIGNoYW5nZT9cbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZW1vdmVUaWxlID0gZnVuY3Rpb24gKGtleSlcbntcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKFwidGlsZSB1bmxvYWQgZm9yIFwiICsga2V5KTtcblxuICAgIGlmICh0aGlzLnpvb21pbmcgPT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm47IC8vIHNob3J0IGNpcmN1aXQgdGlsZSByZW1vdmFsLCB3aWxsIHN3ZWVwIG91dCB0aWxlcyBieSB6b29tIGxldmVsIHdoZW4gem9vbSBlbmRzXG4gICAgfVxuXG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV07XG5cbiAgICBpZiAodGlsZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuZnJlZVRpbGVSZXNvdXJjZXModGlsZSk7XG5cbiAgICAgICAgLy8gV2ViIHdvcmtlciB3aWxsIGNhbmNlbCBYSFIgcmVxdWVzdHNcbiAgICAgICAgdGhpcy53b3JrZXJQb3N0TWVzc2FnZUZvclRpbGUodGlsZSwge1xuICAgICAgICAgICAgdHlwZTogJ3JlbW92ZVRpbGUnLFxuICAgICAgICAgICAga2V5OiB0aWxlLmtleVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkZWxldGUgdGhpcy50aWxlc1trZXldO1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuLy8gRnJlZSBhbnkgR0wgLyBvd25lZCByZXNvdXJjZXNcblNjZW5lLnByb3RvdHlwZS5mcmVlVGlsZVJlc291cmNlcyA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIGlmICh0aWxlICE9IG51bGwgJiYgdGlsZS5nbF9nZW9tZXRyeSAhPSBudWxsKSB7XG4gICAgICAgIGZvciAodmFyIHAgaW4gdGlsZS5nbF9nZW9tZXRyeSkge1xuICAgICAgICAgICAgdGlsZS5nbF9nZW9tZXRyeVtwXS5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGlsZS5nbF9nZW9tZXRyeSA9IG51bGw7XG4gICAgfVxufTtcblxuLy8gQXR0YWNoZXMgdHJhY2tpbmcgYW5kIGRlYnVnIGludG8gdG8gdGhlIHByb3ZpZGVkIHRpbGUgRE9NIGVsZW1lbnRcblNjZW5lLnByb3RvdHlwZS51cGRhdGVUaWxlRWxlbWVudCA9IGZ1bmN0aW9uICh0aWxlLCBkaXYpXG57XG4gICAgLy8gRGVidWcgaW5mb1xuICAgIGRpdi5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGlsZS1rZXknLCB0aWxlLmtleSk7XG4gICAgZGl2LnN0eWxlLndpZHRoID0gJzI1NnB4JztcbiAgICBkaXYuc3R5bGUuaGVpZ2h0ID0gJzI1NnB4JztcblxuICAgIGlmICh0aGlzLmRlYnVnKSB7XG4gICAgICAgIHZhciBkZWJ1Z19vdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRlYnVnX292ZXJsYXkudGV4dENvbnRlbnQgPSB0aWxlLmtleTtcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUubGVmdCA9IDA7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUudG9wID0gMDtcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5jb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUuZm9udFNpemUgPSAnMTZweCc7XG4gICAgICAgIC8vIGRlYnVnX292ZXJsYXkuc3R5bGUudGV4dE91dGxpbmUgPSAnMXB4ICMwMDAwMDAnO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZGVidWdfb3ZlcmxheSk7XG5cbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlclN0eWxlID0gJ3NvbGlkJztcbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlckNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlcldpZHRoID0gJzFweCc7XG4gICAgfVxufTtcblxuLy8gTWVyZ2UgcHJvcGVydGllcyBmcm9tIGEgcHJvdmlkZWQgdGlsZSBvYmplY3QgaW50byB0aGUgbWFpbiB0aWxlIHN0b3JlLiBTaGFsbG93IG1lcmdlIChqdXN0IGNvcGllcyB0b3AtbGV2ZWwgcHJvcGVydGllcykhXG4vLyBVc2VkIGZvciBzZWxlY3RpdmVseSB1cGRhdGluZyBwcm9wZXJ0aWVzIG9mIHRpbGVzIHBhc3NlZCBiZXR3ZWVuIG1haW4gdGhyZWFkIGFuZCB3b3JrZXJcbi8vIChzbyB3ZSBkb24ndCBoYXZlIHRvIHBhc3MgdGhlIHdob2xlIHRpbGUsIGluY2x1ZGluZyBzb21lIHByb3BlcnRpZXMgd2hpY2ggY2Fubm90IGJlIGNsb25lZCBmb3IgYSB3b3JrZXIpLlxuU2NlbmUucHJvdG90eXBlLm1lcmdlVGlsZSA9IGZ1bmN0aW9uIChrZXksIHNvdXJjZV90aWxlKVxue1xuICAgIHZhciB0aWxlID0gdGhpcy50aWxlc1trZXldO1xuXG4gICAgaWYgKHRpbGUgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnRpbGVzW2tleV0gPSBzb3VyY2VfdGlsZTtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXNba2V5XTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBwIGluIHNvdXJjZV90aWxlKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwibWVyZ2luZyBcIiArIHAgKyBcIjogXCIgKyBzb3VyY2VfdGlsZVtwXSk7XG4gICAgICAgIHRpbGVbcF0gPSBzb3VyY2VfdGlsZVtwXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGlsZTtcbn07XG5cbi8vIENhbGxlZCBvbiBtYWluIHRocmVhZCB3aGVuIGEgd2ViIHdvcmtlciBmaW5kcyBhIGZlYXR1cmUgaW4gdGhlIHNlbGVjdGlvbiBidWZmZXJcblNjZW5lLnByb3RvdHlwZS53b3JrZXJHZXRGZWF0dXJlU2VsZWN0aW9uID0gZnVuY3Rpb24gKGV2ZW50KVxue1xuICAgIGlmIChldmVudC5kYXRhLnR5cGUgIT0gJ2dldEZlYXR1cmVTZWxlY3Rpb24nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZmVhdHVyZSA9IGV2ZW50LmRhdGEuZmVhdHVyZTtcbiAgICB2YXIgY2hhbmdlZCA9IGZhbHNlO1xuICAgIGlmICgoZmVhdHVyZSAhPSBudWxsICYmIHRoaXMuc2VsZWN0ZWRfZmVhdHVyZSA9PSBudWxsKSB8fFxuICAgICAgICAoZmVhdHVyZSA9PSBudWxsICYmIHRoaXMuc2VsZWN0ZWRfZmVhdHVyZSAhPSBudWxsKSB8fFxuICAgICAgICAoZmVhdHVyZSAhPSBudWxsICYmIHRoaXMuc2VsZWN0ZWRfZmVhdHVyZSAhPSBudWxsICYmIGZlYXR1cmUuaWQgIT0gdGhpcy5zZWxlY3RlZF9mZWF0dXJlLmlkKSkge1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUgPSBmZWF0dXJlO1xuXG4gICAgaWYgKHR5cGVvZiB0aGlzLnNlbGVjdGlvbl9jYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrKHsgZmVhdHVyZTogdGhpcy5zZWxlY3RlZF9mZWF0dXJlLCBjaGFuZ2VkOiBjaGFuZ2VkIH0pO1xuICAgIH1cbn07XG5cbi8vIExvYWQgKG9yIHJlbG9hZCkgdGhlIHNjZW5lIGNvbmZpZ1xuU2NlbmUucHJvdG90eXBlLmxvYWRTY2VuZSA9IGZ1bmN0aW9uIChjYWxsYmFjaylcbntcbiAgICB2YXIgcXVldWUgPSBRdWV1ZSgpO1xuXG4gICAgLy8gSWYgdGhpcyBpcyB0aGUgZmlyc3QgdGltZSB3ZSdyZSBsb2FkaW5nIHRoZSBzY2VuZSwgY29weSBhbnkgVVJMc1xuICAgIGlmICghdGhpcy5sYXllcl9zb3VyY2UgJiYgdHlwZW9mKHRoaXMubGF5ZXJzKSA9PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLmxheWVyX3NvdXJjZSA9IFV0aWxzLnVybEZvclBhdGgodGhpcy5sYXllcnMpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5zdHlsZV9zb3VyY2UgJiYgdHlwZW9mKHRoaXMuc3R5bGVzKSA9PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLnN0eWxlX3NvdXJjZSA9IFV0aWxzLnVybEZvclBhdGgodGhpcy5zdHlsZXMpO1xuICAgIH1cblxuICAgIC8vIExheWVyIGJ5IFVSTFxuICAgIGlmICh0aGlzLmxheWVyX3NvdXJjZSkge1xuICAgICAgICBxdWV1ZS5kZWZlcihmdW5jdGlvbihjb21wbGV0ZSkge1xuICAgICAgICAgICAgU2NlbmUubG9hZExheWVycyhcbiAgICAgICAgICAgICAgICB0aGlzLmxheWVyX3NvdXJjZSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihsYXllcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXllcnMgPSBsYXllcnM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGF5ZXJzX3NlcmlhbGl6ZWQgPSBVdGlscy5zZXJpYWxpemVXaXRoRnVuY3Rpb25zKHRoaXMubGF5ZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQoc2NlbmUpXG4gICAgICAgICAgICApO1xuICAgICAgICB9LmJpbmQoc2NlbmUpKTtcbiAgICB9XG5cbiAgICAvLyBTdHlsZSBieSBVUkxcbiAgICBpZiAodGhpcy5zdHlsZV9zb3VyY2UpIHtcbiAgICAgICAgcXVldWUuZGVmZXIoZnVuY3Rpb24oY29tcGxldGUpIHtcbiAgICAgICAgICAgIFNjZW5lLmxvYWRTdHlsZXMoXG4gICAgICAgICAgICAgICAgdGhpcy5zdHlsZV9zb3VyY2UsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oc3R5bGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3R5bGVzID0gc3R5bGVzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0eWxlc19zZXJpYWxpemVkID0gVXRpbHMuc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyh0aGlzLnN0eWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHNjZW5lKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfS5iaW5kKHNjZW5lKSk7XG4gICAgfVxuICAgIC8vIFN0eWxlIG9iamVjdFxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnN0eWxlcyA9IFNjZW5lLnBvc3RQcm9jZXNzU3R5bGVzKHRoaXMuc3R5bGVzKTtcbiAgICB9XG5cbiAgICAvLyBFdmVyeXRoaW5nIGlzIGxvYWRlZFxuICAgIHF1ZXVlLmF3YWl0KGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8vIFJlbG9hZCBzY2VuZSBjb25maWcgYW5kIHJlYnVpbGQgdGlsZXNcblNjZW5lLnByb3RvdHlwZS5yZWxvYWRTY2VuZSA9IGZ1bmN0aW9uICgpXG57XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmxvYWRTY2VuZShmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZWJ1aWxkVGlsZXMoKTtcbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLy8gQ2FsbGVkIChjdXJyZW50bHkgbWFudWFsbHkpIGFmdGVyIG1vZGVzIGFyZSB1cGRhdGVkIGluIHN0eWxlc2hlZXRcblNjZW5lLnByb3RvdHlwZS5yZWZyZXNoTW9kZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tb2RlcyA9IFNjZW5lLnJlZnJlc2hNb2Rlcyh0aGlzLm1vZGVzLCB0aGlzLnN0eWxlcyk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUudXBkYXRlQWN0aXZlTW9kZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIE1ha2UgYSBzZXQgb2YgY3VycmVudGx5IGFjdGl2ZSBtb2RlcyAodXNlZCBpbiBhIGxheWVyKVxuICAgIHRoaXMuYWN0aXZlX21vZGVzID0ge307XG4gICAgdmFyIGFuaW1hdGVkID0gZmFsc2U7IC8vIGlzIGFueSBhY3RpdmUgbW9kZSBhbmltYXRlZD9cbiAgICBmb3IgKHZhciBsIGluIHRoaXMuc3R5bGVzLmxheWVycykge1xuICAgICAgICB2YXIgbW9kZSA9IHRoaXMuc3R5bGVzLmxheWVyc1tsXS5tb2RlLm5hbWU7XG4gICAgICAgIGlmICh0aGlzLnN0eWxlcy5sYXllcnNbbF0udmlzaWJsZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlX21vZGVzW21vZGVdID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBtb2RlIGlzIGFuaW1hdGVkXG4gICAgICAgICAgICBpZiAoYW5pbWF0ZWQgPT0gZmFsc2UgJiYgdGhpcy5tb2Rlc1ttb2RlXS5hbmltYXRlZCA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuYW5pbWF0ZWQgPSBhbmltYXRlZDtcbn07XG5cbi8vIFJlc2V0IGludGVybmFsIGNsb2NrLCBtb3N0bHkgdXNlZnVsIGZvciBjb25zaXN0ZW50IGV4cGVyaWVuY2Ugd2hlbiBjaGFuZ2luZyBtb2Rlcy9kZWJ1Z2dpbmdcblNjZW5lLnByb3RvdHlwZS5yZXNldFRpbWUgPSBmdW5jdGlvbiAoKVxue1xuICAgIHRoaXMuc3RhcnRfdGltZSA9ICtuZXcgRGF0ZSgpO1xufTtcblxuLy8gVXNlciBpbnB1dFxuLy8gVE9ETzogcmVzdG9yZSBmcmFjdGlvbmFsIHpvb20gc3VwcG9ydCBvbmNlIGxlYWZsZXQgYW5pbWF0aW9uIHJlZmFjdG9yIHB1bGwgcmVxdWVzdCBpcyBtZXJnZWRcblxuU2NlbmUucHJvdG90eXBlLmluaXRJbnB1dEhhbmRsZXJzID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyB0aGlzLmtleSA9IG51bGw7XG5cbiAgICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy8gICAgIGlmIChldmVudC5rZXlDb2RlID09IDM3KSB7XG4gICAgLy8gICAgICAgICB0aGlzLmtleSA9ICdsZWZ0JztcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDM5KSB7XG4gICAgLy8gICAgICAgICB0aGlzLmtleSA9ICdyaWdodCc7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PSAzOCkge1xuICAgIC8vICAgICAgICAgdGhpcy5rZXkgPSAndXAnO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gNDApIHtcbiAgICAvLyAgICAgICAgIHRoaXMua2V5ID0gJ2Rvd24nO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gODMpIHsgLy8gc1xuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coXCJyZWxvYWRpbmcgc2hhZGVyc1wiKTtcbiAgICAvLyAgICAgICAgIGZvciAodmFyIG1vZGUgaW4gdGhpcy5tb2Rlcykge1xuICAgIC8vICAgICAgICAgICAgIHRoaXMubW9kZXNbbW9kZV0uZ2xfcHJvZ3JhbS5jb21waWxlKCk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH0uYmluZCh0aGlzKSk7XG5cbiAgICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIC8vICAgICB0aGlzLmtleSA9IG51bGw7XG4gICAgLy8gfS5iaW5kKHRoaXMpKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5pbnB1dCA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gLy8gRnJhY3Rpb25hbCB6b29tIHNjYWxpbmdcbiAgICAvLyBpZiAodGhpcy5rZXkgPT0gJ3VwJykge1xuICAgIC8vICAgICB0aGlzLnNldFpvb20odGhpcy56b29tICsgdGhpcy56b29tX3N0ZXApO1xuICAgIC8vIH1cbiAgICAvLyBlbHNlIGlmICh0aGlzLmtleSA9PSAnZG93bicpIHtcbiAgICAvLyAgICAgdGhpcy5zZXRab29tKHRoaXMuem9vbSAtIHRoaXMuem9vbV9zdGVwKTtcbiAgICAvLyB9XG59O1xuXG5cbi8vIFN0YXRzL2RlYnVnL3Byb2ZpbGluZyBtZXRob2RzXG5cbi8vIFByb2ZpbGluZyBtZXRob2RzIHVzZWQgdG8gdHJhY2sgd2hlbiBzZXRzIG9mIHRpbGVzIHN0YXJ0L3N0b3AgbG9hZGluZyB0b2dldGhlclxuLy8gZS5nLiBpbml0aWFsIHBhZ2UgbG9hZCBpcyBvbmUgc2V0IG9mIHRpbGVzLCBuZXcgc2V0cyBvZiB0aWxlIGxvYWRzIGFyZSB0aGVuIGluaXRpYXRlZCBieSBhIG1hcCBwYW4gb3Igem9vbVxuU2NlbmUucHJvdG90eXBlLnRyYWNrVGlsZVNldExvYWRTdGFydCA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gU3RhcnQgdHJhY2tpbmcgbmV3IHRpbGUgc2V0IGlmIG5vIG90aGVyIHRpbGVzIGFscmVhZHkgbG9hZGluZ1xuICAgIGlmICh0aGlzLnRpbGVfc2V0X2xvYWRpbmcgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnRpbGVfc2V0X2xvYWRpbmcgPSArbmV3IERhdGUoKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ0aWxlIHNldCBsb2FkIFNUQVJUXCIpO1xuICAgIH1cbn07XG5cblNjZW5lLnByb3RvdHlwZS50cmFja1RpbGVTZXRMb2FkRW5kID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBObyBtb3JlIHRpbGVzIGFjdGl2ZWx5IGxvYWRpbmc/XG4gICAgaWYgKHRoaXMudGlsZV9zZXRfbG9hZGluZyAhPSBudWxsKSB7XG4gICAgICAgIHZhciBlbmRfdGlsZV9zZXQgPSB0cnVlO1xuICAgICAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbGVzW3RdLmxvYWRpbmcgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGVuZF90aWxlX3NldCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuZF90aWxlX3NldCA9PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RfdGlsZV9zZXRfbG9hZCA9ICgrbmV3IERhdGUoKSkgLSB0aGlzLnRpbGVfc2V0X2xvYWRpbmc7XG4gICAgICAgICAgICB0aGlzLnRpbGVfc2V0X2xvYWRpbmcgPSBudWxsO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0aWxlIHNldCBsb2FkIEZJTklTSEVEIGluOiBcIiArIHRoaXMubGFzdF90aWxlX3NldF9sb2FkKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblNjZW5lLnByb3RvdHlwZS5wcmludERlYnVnRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBcImRlYnVnIGZvciBcIiArIHRpbGUua2V5ICsgJzogWyAnICtcbiAgICAgICAgT2JqZWN0LmtleXModGlsZS5kZWJ1ZykubWFwKGZ1bmN0aW9uICh0KSB7IHJldHVybiB0ICsgJzogJyArIHRpbGUuZGVidWdbdF07IH0pLmpvaW4oJywgJykgKyAnIF0nXG4gICAgKTtcbn07XG5cbi8vIFJlY29tcGlsZSBhbGwgc2hhZGVyc1xuU2NlbmUucHJvdG90eXBlLmNvbXBpbGVTaGFkZXJzID0gZnVuY3Rpb24gKClcbntcbiAgICBmb3IgKHZhciBtIGluIHRoaXMubW9kZXMpIHtcbiAgICAgICAgdGhpcy5tb2Rlc1ttXS5nbF9wcm9ncmFtLmNvbXBpbGUoKTtcbiAgICB9XG59O1xuXG4vLyBTdW0gb2YgYSBkZWJ1ZyBwcm9wZXJ0eSBhY3Jvc3MgdGlsZXNcblNjZW5lLnByb3RvdHlwZS5nZXREZWJ1Z1N1bSA9IGZ1bmN0aW9uIChwcm9wLCBmaWx0ZXIpXG57XG4gICAgdmFyIHN1bSA9IDA7XG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbGVzW3RdLmRlYnVnW3Byb3BdICE9IG51bGwgJiYgKHR5cGVvZiBmaWx0ZXIgIT0gJ2Z1bmN0aW9uJyB8fCBmaWx0ZXIodGhpcy50aWxlc1t0XSkgPT0gdHJ1ZSkpIHtcbiAgICAgICAgICAgIHN1bSArPSB0aGlzLnRpbGVzW3RdLmRlYnVnW3Byb3BdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdW07XG59O1xuXG4vLyBBdmVyYWdlIG9mIGEgZGVidWcgcHJvcGVydHkgYWNyb3NzIHRpbGVzXG5TY2VuZS5wcm90b3R5cGUuZ2V0RGVidWdBdmVyYWdlID0gZnVuY3Rpb24gKHByb3AsIGZpbHRlcilcbntcbiAgICByZXR1cm4gdGhpcy5nZXREZWJ1Z1N1bShwcm9wLCBmaWx0ZXIpIC8gT2JqZWN0LmtleXModGhpcy50aWxlcykubGVuZ3RoO1xufTtcblxuLy8gTG9nIG1lc3NhZ2VzIHBhc3MgdGhyb3VnaCBmcm9tIHdlYiB3b3JrZXJzXG5TY2VuZS5wcm90b3R5cGUud29ya2VyTG9nTWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudClcbntcbiAgICBpZiAoZXZlbnQuZGF0YS50eXBlICE9ICdsb2cnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhcIndvcmtlciBcIiArIGV2ZW50LmRhdGEud29ya2VyX2lkICsgXCI6IFwiICsgZXZlbnQuZGF0YS5tc2cpO1xufTtcblxuXG4vKioqIENsYXNzIG1ldGhvZHMgKHN0YXRlbGVzcykgKioqL1xuXG5TY2VuZS5sb2FkTGF5ZXJzID0gZnVuY3Rpb24gKHVybCwgY2FsbGJhY2spXG57XG4gICAgdmFyIGxheWVycztcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZXZhbCgnbGF5ZXJzID0gJyArIHJlcS5yZXNwb25zZSk7IC8vIFRPRE86IHNlY3VyaXR5IVxuXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sobGF5ZXJzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmVxLm9wZW4oJ0dFVCcsIHVybCArICc/JyArICgrbmV3IERhdGUoKSksIHRydWUgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICByZXEuc2VuZCgpO1xufTtcblxuU2NlbmUubG9hZFN0eWxlcyA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKVxue1xuICAgIHZhciBzdHlsZXM7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3R5bGVzID0gcmVxLnJlc3BvbnNlO1xuXG4gICAgICAgIC8vIFRyeSBKU09OIGZpcnN0LCB0aGVuIFlBTUwgKGlmIGF2YWlsYWJsZSlcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGV2YWwoJ3N0eWxlcyA9ICcgKyByZXEucmVzcG9uc2UpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHN0eWxlcyA9IHlhbWwuc2FmZUxvYWQocmVxLnJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJmYWlsZWQgdG8gcGFyc2Ugc3R5bGVzIVwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzdHlsZXMpO1xuICAgICAgICAgICAgICAgIHN0eWxlcyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5kIGdlbmVyaWMgZnVuY3Rpb25zICYgc3R5bGUgbWFjcm9zXG4gICAgICAgIFV0aWxzLnN0cmluZ3NUb0Z1bmN0aW9ucyhzdHlsZXMpO1xuICAgICAgICBTdHlsZS5leHBhbmRNYWNyb3Moc3R5bGVzKTtcbiAgICAgICAgU2NlbmUucG9zdFByb2Nlc3NTdHlsZXMoc3R5bGVzKTtcblxuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHN0eWxlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXEub3BlbignR0VUJywgdXJsICsgJz8nICsgKCtuZXcgRGF0ZSgpKSwgdHJ1ZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICByZXEucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xuICAgIHJlcS5zZW5kKCk7XG59O1xuXG4vLyBOb3JtYWxpemUgc29tZSBzdHlsZSBzZXR0aW5ncyB0aGF0IG1heSBub3QgaGF2ZSBiZWVuIGV4cGxpY2l0bHkgc3BlY2lmaWVkIGluIHRoZSBzdHlsZXNoZWV0XG5TY2VuZS5wb3N0UHJvY2Vzc1N0eWxlcyA9IGZ1bmN0aW9uIChzdHlsZXMpXG57XG4gICAgLy8gUG9zdC1wcm9jZXNzIHN0eWxlc1xuICAgIGZvciAodmFyIG0gaW4gc3R5bGVzLmxheWVycykge1xuICAgICAgICBpZiAoc3R5bGVzLmxheWVyc1ttXS52aXNpYmxlICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgc3R5bGVzLmxheWVyc1ttXS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoc3R5bGVzLmxheWVyc1ttXS5tb2RlICYmIHN0eWxlcy5sYXllcnNbbV0ubW9kZS5uYW1lKSA9PSBudWxsKSB7XG4gICAgICAgICAgICBzdHlsZXMubGF5ZXJzW21dLm1vZGUgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gU3R5bGUuZGVmYXVsdHMubW9kZSkge1xuICAgICAgICAgICAgICAgIHN0eWxlcy5sYXllcnNbbV0ubW9kZVtwXSA9IFN0eWxlLmRlZmF1bHRzLm1vZGVbcF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3R5bGVzO1xufTtcblxuLy8gUHJvY2Vzc2VzIHRoZSB0aWxlIHJlc3BvbnNlIHRvIGNyZWF0ZSBsYXllcnMgYXMgZGVmaW5lZCBieSB0aGUgc2NlbmVcbi8vIENhbiBpbmNsdWRlIHBvc3QtcHJvY2Vzc2luZyB0byBwYXJ0aWFsbHkgZmlsdGVyIG9yIHJlLWFycmFuZ2UgZGF0YSwgZS5nLiBvbmx5IGluY2x1ZGluZyBQT0lzIHRoYXQgaGF2ZSBuYW1lc1xuU2NlbmUucHJvY2Vzc0xheWVyc0ZvclRpbGUgPSBmdW5jdGlvbiAobGF5ZXJzLCB0aWxlKVxue1xuICAgIHZhciB0aWxlX2xheWVycyA9IHt9O1xuICAgIGZvciAodmFyIHQ9MDsgdCA8IGxheWVycy5sZW5ndGg7IHQrKykge1xuICAgICAgICBsYXllcnNbdF0ubnVtYmVyID0gdDtcblxuICAgICAgICBpZiAobGF5ZXJzW3RdICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEp1c3QgcGFzcyB0aHJvdWdoIGRhdGEgdW50b3VjaGVkIGlmIG5vIGRhdGEgdHJhbnNmb3JtIGZ1bmN0aW9uIGRlZmluZWRcbiAgICAgICAgICAgIGlmIChsYXllcnNbdF0uZGF0YSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gdGlsZS5sYXllcnNbbGF5ZXJzW3RdLm5hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGFzcyB0aHJvdWdoIGRhdGEgYnV0IHdpdGggZGlmZmVyZW50IGxheWVyIG5hbWUgaW4gdGlsZSBzb3VyY2UgZGF0YVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGxheWVyc1t0XS5kYXRhID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gdGlsZS5sYXllcnNbbGF5ZXJzW3RdLmRhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQXBwbHkgdGhlIHRyYW5zZm9ybSBmdW5jdGlvbiBmb3IgcG9zdC1wcm9jZXNzaW5nXG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgbGF5ZXJzW3RdLmRhdGEgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IGxheWVyc1t0XS5kYXRhKHRpbGUubGF5ZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhhbmRsZSBjYXNlcyB3aGVyZSBubyBkYXRhIHdhcyBmb3VuZCBpbiB0aWxlIG9yIHJldHVybmVkIGJ5IHBvc3QtcHJvY2Vzc29yXG4gICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSB8fCB7IHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsIGZlYXR1cmVzOiBbXSB9O1xuICAgIH1cbiAgICB0aWxlLmxheWVycyA9IHRpbGVfbGF5ZXJzO1xuICAgIHJldHVybiB0aWxlX2xheWVycztcbn07XG5cbi8vIENhbGxlZCBvbmNlIG9uIGluc3RhbnRpYXRpb25cblNjZW5lLmNyZWF0ZU1vZGVzID0gZnVuY3Rpb24gKHN0eWxlcylcbntcbiAgICB2YXIgbW9kZXMgPSB7fTtcblxuICAgIC8vIEJ1aWx0LWluIG1vZGVzXG4gICAgdmFyIGJ1aWx0X2lucyA9IHJlcXVpcmUoJy4vZ2wvZ2xfbW9kZXMnKS5Nb2RlcztcbiAgICBmb3IgKHZhciBtIGluIGJ1aWx0X2lucykge1xuICAgICAgICBtb2Rlc1ttXSA9IGJ1aWx0X2luc1ttXTtcbiAgICB9XG5cbiAgICAvLyBTdHlsZXNoZWV0IG1vZGVzXG4gICAgZm9yICh2YXIgbSBpbiBzdHlsZXMubW9kZXMpIHtcbiAgICAgICAgLy8gaWYgKG0gIT0gJ2FsbCcpIHtcbiAgICAgICAgICAgIG1vZGVzW21dID0gTW9kZU1hbmFnZXIuY29uZmlndXJlTW9kZShtLCBzdHlsZXMubW9kZXNbbV0pO1xuICAgICAgICAvLyB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vZGVzO1xufTtcblxuU2NlbmUucmVmcmVzaE1vZGVzID0gZnVuY3Rpb24gKG1vZGVzLCBzdHlsZXMpXG57XG4gICAgLy8gQ29weSBzdHlsZXNoZWV0IG1vZGVzXG4gICAgLy8gVE9ETzogaXMgdGhpcyB0aGUgYmVzdCB3YXkgdG8gY29weSBzdHlsZXNoZWV0IGNoYW5nZXMgdG8gbW9kZSBpbnN0YW5jZXM/XG4gICAgZm9yICh2YXIgbSBpbiBzdHlsZXMubW9kZXMpIHtcbiAgICAgICAgLy8gaWYgKG0gIT0gJ2FsbCcpIHtcbiAgICAgICAgICAgIG1vZGVzW21dID0gTW9kZU1hbmFnZXIuY29uZmlndXJlTW9kZShtLCBzdHlsZXMubW9kZXNbbV0pO1xuICAgICAgICAvLyB9XG4gICAgfVxuXG4gICAgLy8gUmVmcmVzaCBhbGwgbW9kZXNcbiAgICBmb3IgKG0gaW4gbW9kZXMpIHtcbiAgICAgICAgbW9kZXNbbV0ucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJldHVybiBtb2Rlcztcbn07XG5cblxuLy8gUHJpdmF0ZS9pbnRlcm5hbFxuXG4vLyBHZXQgYmFzZSBVUkwgZnJvbSB3aGljaCB0aGUgbGlicmFyeSB3YXMgbG9hZGVkXG4vLyBVc2VkIHRvIGxvYWQgYWRkaXRpb25hbCByZXNvdXJjZXMgbGlrZSBzaGFkZXJzLCB0ZXh0dXJlcywgZXRjLiBpbiBjYXNlcyB3aGVyZSBsaWJyYXJ5IHdhcyBsb2FkZWQgZnJvbSBhIHJlbGF0aXZlIHBhdGhcbmZ1bmN0aW9uIGZpbmRCYXNlTGlicmFyeVVSTCAoKVxue1xuICAgIFNjZW5lLmxpYnJhcnlfYmFzZV91cmwgPSAnJztcbiAgICB2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKTsgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W3NyYyo9XCIuanNcIl0nKTtcbiAgICBmb3IgKHZhciBzPTA7IHMgPCBzY3JpcHRzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgIHZhciBtYXRjaCA9IHNjcmlwdHNbc10uc3JjLmluZGV4T2YoJ3RhbmdyYW0uZGVidWcuanMnKTtcbiAgICAgICAgaWYgKG1hdGNoID09IC0xKSB7XG4gICAgICAgICAgICBtYXRjaCA9IHNjcmlwdHNbc10uc3JjLmluZGV4T2YoJ3RhbmdyYW0ubWluLmpzJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hdGNoID49IDApIHtcbiAgICAgICAgICAgIFNjZW5lLmxpYnJhcnlfYmFzZV91cmwgPSBzY3JpcHRzW3NdLnNyYy5zdWJzdHIoMCwgbWF0Y2gpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNjZW5lO1xufVxuIiwiLyoqKiBTdHlsZSBoZWxwZXJzICoqKi9cbnZhciBHZW8gPSByZXF1aXJlKCcuL2dlby5qcycpO1xuXG52YXIgU3R5bGUgPSB7fTtcblxuLy8gU3R5bGUgaGVscGVyc1xuXG5TdHlsZS5jb2xvciA9IHtcbiAgICBwc2V1ZG9SYW5kb21HcmF5c2NhbGU6IGZ1bmN0aW9uIChmKSB7IHZhciBjID0gTWF0aC5tYXgoKHBhcnNlSW50KGYuaWQsIDE2KSAlIDEwMCkgLyAxMDAsIDAuNCk7IHJldHVybiBbMC43ICogYywgMC43ICogYywgMC43ICogY107IH0sIC8vIHBzZXVkby1yYW5kb20gZ3JheXNjYWxlIGJ5IGdlb21ldHJ5IGlkXG4gICAgcHNldWRvUmFuZG9tQ29sb3I6IGZ1bmN0aW9uIChmKSB7IHJldHVybiBbMC43ICogKHBhcnNlSW50KGYuaWQsIDE2KSAvIDEwMCAlIDEpLCAwLjcgKiAocGFyc2VJbnQoZi5pZCwgMTYpIC8gMTAwMDAgJSAxKSwgMC43ICogKHBhcnNlSW50KGYuaWQsIDE2KSAvIDEwMDAwMDAgJSAxKV07IH0sIC8vIHBzZXVkby1yYW5kb20gY29sb3IgYnkgZ2VvbWV0cnkgaWRcbiAgICByYW5kb21Db2xvcjogZnVuY3Rpb24gKGYpIHsgcmV0dXJuIFswLjcgKiBNYXRoLnJhbmRvbSgpLCAwLjcgKiBNYXRoLnJhbmRvbSgpLCAwLjcgKiBNYXRoLnJhbmRvbSgpXTsgfSAvLyByYW5kb20gY29sb3Jcbn07XG5cbi8vIFJldHVybnMgYSBmdW5jdGlvbiAodGhhdCBjYW4gYmUgdXNlZCBhcyBhIGR5bmFtaWMgc3R5bGUpIHRoYXQgY29udmVydHMgcGl4ZWxzIHRvIG1ldGVycyBmb3IgdGhlIGN1cnJlbnQgem9vbSBsZXZlbC5cbi8vIFRoZSBwcm92aWRlZCBwaXhlbCB2YWx1ZSAoJ3AnKSBjYW4gaXRzZWxmIGJlIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2UgaXQgaXMgd3JhcHBlZCBieSB0aGlzIG9uZS5cblN0eWxlLnBpeGVscyA9IGZ1bmN0aW9uIChwLCB6KSB7XG4gICAgdmFyIGY7XG4gICAgZXZhbCgnZiA9IGZ1bmN0aW9uKGYsIHQsIGgpIHsgcmV0dXJuICcgKyAodHlwZW9mIHAgPT0gJ2Z1bmN0aW9uJyA/ICcoJyArIChwLnRvU3RyaW5nKCkgKyAnKGYsIHQsIGgpKScpIDogcCkgKyAnICogaC5HZW8ubWV0ZXJzX3Blcl9waXhlbFtoLnpvb21dOyB9Jyk7XG4gICAgcmV0dXJuIGY7XG59O1xuXG4vLyBDcmVhdGUgYSB1bmlxdWUgMzItYml0IGNvbG9yIHRvIGlkZW50aWZ5IGEgZmVhdHVyZVxuLy8gV29ya2VycyBpbmRlcGVuZGVudGx5IGNyZWF0ZS9tb2RpZnkgc2VsZWN0aW9uIGNvbG9ycyBpbiB0aGVpciBvd24gdGhyZWFkcywgYnV0IHdlIGFsc29cbi8vIG5lZWQgdGhlIG1haW4gdGhyZWFkIHRvIGtub3cgd2hlcmUgZWFjaCBmZWF0dXJlIGNvbG9yIG9yaWdpbmF0ZWQuIFRvIGFjY29tcGxpc2ggdGhpcyxcbi8vIHdlIHBhcnRpdGlvbiB0aGUgbWFwIGJ5IHNldHRpbmcgdGhlIDR0aCBjb21wb25lbnQgKGFscGhhIGNoYW5uZWwpIHRvIHRoZSB3b3JrZXIncyBpZC5cblN0eWxlLnNlbGVjdGlvbl9tYXAgPSB7fTsgLy8gdGhpcyB3aWxsIGJlIHVuaXF1ZSBwZXIgbW9kdWxlIGluc3RhbmNlIChzbyB1bmlxdWUgcGVyIHdvcmtlcilcblN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCA9IDE7IC8vIHN0YXJ0IGF0IDEgc2luY2UgMSB3aWxsIGJlIGRpdmlkZWQgYnkgdGhpc1xuU3R5bGUuc2VsZWN0aW9uX21hcF9wcmVmaXggPSAwOyAvLyBzZXQgYnkgd29ya2VyIHRvIHdvcmtlciBpZCAjXG5TdHlsZS5nZW5lcmF0ZVNlbGVjdGlvbiA9IGZ1bmN0aW9uIChjb2xvcl9tYXApXG57XG4gICAgLy8gMzItYml0IGNvbG9yIGtleVxuICAgIFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCsrO1xuICAgIHZhciBpciA9IFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCAmIDI1NTtcbiAgICB2YXIgaWcgPSAoU3R5bGUuc2VsZWN0aW9uX21hcF9jdXJyZW50ID4+IDgpICYgMjU1O1xuICAgIHZhciBpYiA9IChTdHlsZS5zZWxlY3Rpb25fbWFwX2N1cnJlbnQgPj4gMTYpICYgMjU1O1xuICAgIHZhciBpYSA9IFN0eWxlLnNlbGVjdGlvbl9tYXBfcHJlZml4O1xuICAgIHZhciByID0gaXIgLyAyNTU7XG4gICAgdmFyIGcgPSBpZyAvIDI1NTtcbiAgICB2YXIgYiA9IGliIC8gMjU1O1xuICAgIHZhciBhID0gaWEgLyAyNTU7XG4gICAgdmFyIGtleSA9IChpciArIChpZyA8PCA4KSArIChpYiA8PCAxNikgKyAoaWEgPDwgMjQpKSA+Pj4gMDsgLy8gbmVlZCB1bnNpZ25lZCByaWdodCBzaGlmdCB0byBjb252ZXJ0IHRvIHBvc2l0aXZlICNcblxuICAgIGNvbG9yX21hcFtrZXldID0ge1xuICAgICAgICBjb2xvcjogW3IsIGcsIGIsIGFdLFxuICAgIH07XG5cbiAgICByZXR1cm4gY29sb3JfbWFwW2tleV07XG59O1xuXG5TdHlsZS5yZXNldFNlbGVjdGlvbk1hcCA9IGZ1bmN0aW9uICgpXG57XG4gICAgU3R5bGUuc2VsZWN0aW9uX21hcCA9IHt9O1xuICAgIFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCA9IDE7XG59O1xuXG4vLyBGaW5kIGFuZCBleHBhbmQgc3R5bGUgbWFjcm9zXG5TdHlsZS5tYWNyb3MgPSBbXG4gICAgJ1N0eWxlLmNvbG9yLnBzZXVkb1JhbmRvbUNvbG9yJyxcbiAgICAnU3R5bGUucGl4ZWxzJ1xuXTtcblxuU3R5bGUuZXhwYW5kTWFjcm9zID0gZnVuY3Rpb24gZXhwYW5kTWFjcm9zIChvYmopIHtcbiAgICBmb3IgKHZhciBwIGluIG9iaikge1xuICAgICAgICB2YXIgdmFsID0gb2JqW3BdO1xuXG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCBvYmplY3QgcHJvcGVydGllc1xuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgb2JqW3BdID0gZXhwYW5kTWFjcm9zKHZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ29udmVydCBzdHJpbmdzIGJhY2sgaW50byBmdW5jdGlvbnNcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbCA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZm9yICh2YXIgbSBpbiBTdHlsZS5tYWNyb3MpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsLm1hdGNoKFN0eWxlLm1hY3Jvc1ttXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGY7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmFsKCdmID0gJyArIHZhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpbcF0gPSBmO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbGwtYmFjayB0byBvcmlnaW5hbCB2YWx1ZSBpZiBwYXJzaW5nIGZhaWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqW3BdID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cblxuLy8gU3R5bGUgZGVmYXVsdHNcblxuLy8gRGV0ZXJtaW5lIGZpbmFsIHN0eWxlIHByb3BlcnRpZXMgKGNvbG9yLCB3aWR0aCwgZXRjLilcblN0eWxlLmRlZmF1bHRzID0ge1xuICAgIGNvbG9yOiBbMS4wLCAwLCAwXSxcbiAgICB3aWR0aDogMSxcbiAgICBzaXplOiAxLFxuICAgIGV4dHJ1ZGU6IGZhbHNlLFxuICAgIGhlaWdodDogMjAsXG4gICAgbWluX2hlaWdodDogMCxcbiAgICBvdXRsaW5lOiB7XG4gICAgICAgIC8vIGNvbG9yOiBbMS4wLCAwLCAwXSxcbiAgICAgICAgLy8gd2lkdGg6IDEsXG4gICAgICAgIC8vIGRhc2g6IG51bGxcbiAgICB9LFxuICAgIHNlbGVjdGlvbjoge1xuICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICBjb2xvcjogWzAsIDAsIDAsIDFdXG4gICAgfSxcbiAgICBtb2RlOiB7XG4gICAgICAgIG5hbWU6ICdwb2x5Z29ucydcbiAgICB9XG59O1xuXG4vLyBTdHlsZSBwYXJzaW5nXG5cbi8vIEhlbHBlciBmdW5jdGlvbnMgcGFzc2VkIHRvIGR5bmFtaWMgc3R5bGUgZnVuY3Rpb25zXG5TdHlsZS5oZWxwZXJzID0ge1xuICAgIFN0eWxlOiBTdHlsZSxcbiAgICBHZW86IEdlb1xufTtcblxuU3R5bGUucGFyc2VTdHlsZUZvckZlYXR1cmUgPSBmdW5jdGlvbiAoZmVhdHVyZSwgbGF5ZXJfbmFtZSwgbGF5ZXJfc3R5bGUsIHRpbGUpXG57XG4gICAgdmFyIGxheWVyX3N0eWxlID0gbGF5ZXJfc3R5bGUgfHwge307XG4gICAgdmFyIHN0eWxlID0ge307XG5cbiAgICBTdHlsZS5oZWxwZXJzLnpvb20gPSB0aWxlLmNvb3Jkcy56O1xuXG4gICAgLy8gVGVzdCB3aGV0aGVyIGZlYXR1cmVzIHNob3VsZCBiZSByZW5kZXJlZCBhdCBhbGxcbiAgICBpZiAodHlwZW9mIGxheWVyX3N0eWxlLmZpbHRlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChsYXllcl9zdHlsZS5maWx0ZXIoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycykgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUGFyc2Ugc3R5bGVzXG4gICAgc3R5bGUuY29sb3IgPSAobGF5ZXJfc3R5bGUuY29sb3IgJiYgKGxheWVyX3N0eWxlLmNvbG9yW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5jb2xvci5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMuY29sb3I7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5jb2xvciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLmNvbG9yID0gc3R5bGUuY29sb3IoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgc3R5bGUud2lkdGggPSAobGF5ZXJfc3R5bGUud2lkdGggJiYgKGxheWVyX3N0eWxlLndpZHRoW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS53aWR0aC5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMud2lkdGg7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS53aWR0aCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLndpZHRoID0gc3R5bGUud2lkdGgoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuICAgIHN0eWxlLndpZHRoICo9IEdlby51bml0c19wZXJfbWV0ZXJbdGlsZS5jb29yZHMuel07XG5cbiAgICBzdHlsZS5zaXplID0gKGxheWVyX3N0eWxlLnNpemUgJiYgKGxheWVyX3N0eWxlLnNpemVbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLnNpemUuZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLnNpemU7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5zaXplID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUuc2l6ZSA9IHN0eWxlLnNpemUoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuICAgIHN0eWxlLnNpemUgKj0gR2VvLnVuaXRzX3Blcl9tZXRlclt0aWxlLmNvb3Jkcy56XTtcblxuICAgIHN0eWxlLmV4dHJ1ZGUgPSAobGF5ZXJfc3R5bGUuZXh0cnVkZSAmJiAobGF5ZXJfc3R5bGUuZXh0cnVkZVtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUuZXh0cnVkZS5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMuZXh0cnVkZTtcbiAgICBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyByZXR1cm5pbmcgYSBib29sZWFuIHdpbGwgZXh0cnVkZSB3aXRoIHRoZSBmZWF0dXJlJ3MgaGVpZ2h0LCBhIG51bWJlciB3aWxsIG92ZXJyaWRlIHRoZSBmZWF0dXJlIGhlaWdodCAoc2VlIGJlbG93KVxuICAgICAgICBzdHlsZS5leHRydWRlID0gc3R5bGUuZXh0cnVkZShmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICBzdHlsZS5oZWlnaHQgPSAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5oZWlnaHQpIHx8IFN0eWxlLmRlZmF1bHRzLmhlaWdodDtcbiAgICBzdHlsZS5taW5faGVpZ2h0ID0gKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMubWluX2hlaWdodCkgfHwgU3R5bGUuZGVmYXVsdHMubWluX2hlaWdodDtcblxuICAgIC8vIGhlaWdodCBkZWZhdWx0cyB0byBmZWF0dXJlIGhlaWdodCwgYnV0IGV4dHJ1ZGUgc3R5bGUgY2FuIGR5bmFtaWNhbGx5IGFkanVzdCBoZWlnaHQgYnkgcmV0dXJuaW5nIGEgbnVtYmVyIG9yIGFycmF5IChpbnN0ZWFkIG9mIGEgYm9vbGVhbilcbiAgICBpZiAoc3R5bGUuZXh0cnVkZSkge1xuICAgICAgICBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHN0eWxlLmhlaWdodCA9IHN0eWxlLmV4dHJ1ZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ29iamVjdCcgJiYgc3R5bGUuZXh0cnVkZS5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgc3R5bGUubWluX2hlaWdodCA9IHN0eWxlLmV4dHJ1ZGVbMF07XG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQgPSBzdHlsZS5leHRydWRlWzFdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3R5bGUueiA9IChsYXllcl9zdHlsZS56ICYmIChsYXllcl9zdHlsZS56W2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS56LmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy56IHx8IDA7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS56ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUueiA9IHN0eWxlLnooZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgc3R5bGUub3V0bGluZSA9IHt9O1xuICAgIGxheWVyX3N0eWxlLm91dGxpbmUgPSBsYXllcl9zdHlsZS5vdXRsaW5lIHx8IHt9O1xuICAgIHN0eWxlLm91dGxpbmUuY29sb3IgPSAobGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvciAmJiAobGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvcltmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvci5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMub3V0bGluZS5jb2xvcjtcbiAgICBpZiAodHlwZW9mIHN0eWxlLm91dGxpbmUuY29sb3IgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5vdXRsaW5lLmNvbG9yID0gc3R5bGUub3V0bGluZS5jb2xvcihmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICBzdHlsZS5vdXRsaW5lLndpZHRoID0gKGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGggJiYgKGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGhbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGguZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLm91dGxpbmUud2lkdGg7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5vdXRsaW5lLndpZHRoID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUub3V0bGluZS53aWR0aCA9IHN0eWxlLm91dGxpbmUud2lkdGgoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuICAgIHN0eWxlLm91dGxpbmUud2lkdGggKj0gR2VvLnVuaXRzX3Blcl9tZXRlclt0aWxlLmNvb3Jkcy56XTtcblxuICAgIHN0eWxlLm91dGxpbmUuZGFzaCA9IChsYXllcl9zdHlsZS5vdXRsaW5lLmRhc2ggJiYgKGxheWVyX3N0eWxlLm91dGxpbmUuZGFzaFtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUub3V0bGluZS5kYXNoLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy5vdXRsaW5lLmRhc2g7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5vdXRsaW5lLmRhc2ggPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5vdXRsaW5lLmRhc2ggPSBzdHlsZS5vdXRsaW5lLmRhc2goZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgLy8gSW50ZXJhY3Rpdml0eSAoc2VsZWN0aW9uIG1hcClcbiAgICB2YXIgaW50ZXJhY3RpdmUgPSBmYWxzZTtcbiAgICBpZiAodHlwZW9mIGxheWVyX3N0eWxlLmludGVyYWN0aXZlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaW50ZXJhY3RpdmUgPSBsYXllcl9zdHlsZS5pbnRlcmFjdGl2ZShmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGludGVyYWN0aXZlID0gbGF5ZXJfc3R5bGUuaW50ZXJhY3RpdmU7XG4gICAgfVxuXG4gICAgaWYgKGludGVyYWN0aXZlID09IHRydWUpIHtcbiAgICAgICAgdmFyIHNlbGVjdG9yID0gU3R5bGUuZ2VuZXJhdGVTZWxlY3Rpb24oU3R5bGUuc2VsZWN0aW9uX21hcCk7XG5cbiAgICAgICAgc2VsZWN0b3IuZmVhdHVyZSA9IHtcbiAgICAgICAgICAgIGlkOiBmZWF0dXJlLmlkLFxuICAgICAgICAgICAgcHJvcGVydGllczogZmVhdHVyZS5wcm9wZXJ0aWVzXG4gICAgICAgIH07XG4gICAgICAgIHNlbGVjdG9yLmZlYXR1cmUucHJvcGVydGllcy5sYXllciA9IGxheWVyX25hbWU7IC8vIGFkZCBsYXllciBuYW1lIHRvIHByb3BlcnRpZXNcblxuICAgICAgICBzdHlsZS5zZWxlY3Rpb24gPSB7XG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICBjb2xvcjogc2VsZWN0b3IuY29sb3JcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHN0eWxlLnNlbGVjdGlvbiA9IFN0eWxlLmRlZmF1bHRzLnNlbGVjdGlvbjtcbiAgICB9XG5cbiAgICBpZiAobGF5ZXJfc3R5bGUubW9kZSAhPSBudWxsICYmIGxheWVyX3N0eWxlLm1vZGUubmFtZSAhPSBudWxsKSB7XG4gICAgICAgIHN0eWxlLm1vZGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgbSBpbiBsYXllcl9zdHlsZS5tb2RlKSB7XG4gICAgICAgICAgICBzdHlsZS5tb2RlW21dID0gbGF5ZXJfc3R5bGUubW9kZVttXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3R5bGUubW9kZSA9IFN0eWxlLmRlZmF1bHRzLm1vZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTdHlsZTtcbn1cbiIsIi8vIE1pc2NlbGxhbmVvdXMgdXRpbGl0aWVzXG5cbi8vIFNpbXBsaXN0aWMgZGV0ZWN0aW9uIG9mIHJlbGF0aXZlIHBhdGhzLCBhcHBlbmQgYmFzZSBpZiBuZWNlc3NhcnlcbmZ1bmN0aW9uIHVybEZvclBhdGggKHBhdGgpIHtcbiAgICBpZiAocGF0aCA9PSBudWxsIHx8IHBhdGggPT0gJycpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gQ2FuIGV4cGFuZCBhIHNpbmdsZSBwYXRoLCBvciBhbiBhcnJheSBvZiBwYXRoc1xuICAgIGlmICh0eXBlb2YgcGF0aCA9PSAnb2JqZWN0JyAmJiBwYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gQXJyYXkgb2YgcGF0aHNcbiAgICAgICAgZm9yICh2YXIgcCBpbiBwYXRoKSB7XG4gICAgICAgICAgICB2YXIgcHJvdG9jb2wgPSBwYXRoW3BdLnRvTG93ZXJDYXNlKCkuc3Vic3RyKDAsIDQpO1xuICAgICAgICAgICAgaWYgKCEocHJvdG9jb2wgPT0gJ2h0dHAnIHx8IHByb3RvY29sID09ICdmaWxlJykpIHtcbiAgICAgICAgICAgICAgICBwYXRoW3BdID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHBhdGhbcF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIFNpbmdsZSBwYXRoXG4gICAgICAgIHZhciBwcm90b2NvbCA9IHBhdGgudG9Mb3dlckNhc2UoKS5zdWJzdHIoMCwgNCk7XG4gICAgICAgIGlmICghKHByb3RvY29sID09ICdodHRwJyB8fCBwcm90b2NvbCA9PSAnZmlsZScpKSB7XG4gICAgICAgICAgICBwYXRoID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHBhdGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhdGg7XG59O1xuXG4vLyBTdHJpbmdpZnkgYW4gb2JqZWN0IGludG8gSlNPTiwgYnV0IGNvbnZlcnQgZnVuY3Rpb25zIHRvIHN0cmluZ3NcbmZ1bmN0aW9uIHNlcmlhbGl6ZVdpdGhGdW5jdGlvbnMgKG9iailcbntcbiAgICB2YXIgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KG9iaiwgZnVuY3Rpb24oaywgdikge1xuICAgICAgICAvLyBDb252ZXJ0IGZ1bmN0aW9ucyB0byBzdHJpbmdzXG4gICAgICAgIGlmICh0eXBlb2YgdiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gdi50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNlcmlhbGl6ZWQ7XG59O1xuXG4vLyBQYXJzZSBhIEpTT04gc3RyaW5nLCBidXQgY29udmVydCBmdW5jdGlvbi1saWtlIHN0cmluZ3MgYmFjayBpbnRvIGZ1bmN0aW9uc1xuZnVuY3Rpb24gZGVzZXJpYWxpemVXaXRoRnVuY3Rpb25zIChzZXJpYWxpemVkKSB7XG4gICAgdmFyIG9iaiA9IEpTT04ucGFyc2Uoc2VyaWFsaXplZCk7XG4gICAgb2JqID0gc3RyaW5nc1RvRnVuY3Rpb25zKG9iaik7XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLy8gUmVjdXJzaXZlbHkgcGFyc2UgYW4gb2JqZWN0LCBhdHRlbXB0aW5nIHRvIGNvbnZlcnQgc3RyaW5nIHByb3BlcnRpZXMgdGhhdCBsb29rIGxpa2UgZnVuY3Rpb25zIGJhY2sgaW50byBmdW5jdGlvbnNcbmZ1bmN0aW9uIHN0cmluZ3NUb0Z1bmN0aW9ucyAob2JqKSB7XG4gICAgZm9yICh2YXIgcCBpbiBvYmopIHtcbiAgICAgICAgdmFyIHZhbCA9IG9ialtwXTtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggb2JqZWN0IHByb3BlcnRpZXNcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIG9ialtwXSA9IHN0cmluZ3NUb0Z1bmN0aW9ucyh2YWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIENvbnZlcnQgc3RyaW5ncyBiYWNrIGludG8gZnVuY3Rpb25zXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWwgPT0gJ3N0cmluZycgJiYgdmFsLm1hdGNoKC9eZnVuY3Rpb24uKlxcKC4qXFwpLykgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGY7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGV2YWwoJ2YgPSAnICsgdmFsKTtcbiAgICAgICAgICAgICAgICBvYmpbcF0gPSBmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBmYWxsLWJhY2sgdG8gb3JpZ2luYWwgdmFsdWUgaWYgcGFyc2luZyBmYWlsZWRcbiAgICAgICAgICAgICAgICBvYmpbcF0gPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLy8gUnVuIGEgYmxvY2sgaWYgb24gdGhlIG1haW4gdGhyZWFkIChub3QgaW4gYSB3ZWIgd29ya2VyKSwgd2l0aCBvcHRpb25hbCBlcnJvciAod2ViIHdvcmtlcikgYmxvY2tcbmZ1bmN0aW9uIHJ1bklmSW5NYWluVGhyZWFkIChibG9jaywgZXJyKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHdpbmRvdy5kb2N1bWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBibG9jaygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZXJyID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGVycigpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBVc2VkIGZvciBkaWZmZXJlbnRpYXRpbmcgYmV0d2VlbiBwb3dlci1vZi0yIGFuZCBub24tcG93ZXItb2YtMiB0ZXh0dXJlc1xuLy8gVmlhOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE5NzIyMjQ3L3dlYmdsLXdhaXQtZm9yLXRleHR1cmUtdG8tbG9hZFxuZnVuY3Rpb24gaXNQb3dlck9mMiAodmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlICYgKHZhbHVlIC0gMSkpID09IDA7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgdXJsRm9yUGF0aDogdXJsRm9yUGF0aCxcbiAgICAgICAgc2VyaWFsaXplV2l0aEZ1bmN0aW9uczogc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyxcbiAgICAgICAgZGVzZXJpYWxpemVXaXRoRnVuY3Rpb25zOiBkZXNlcmlhbGl6ZVdpdGhGdW5jdGlvbnMsXG4gICAgICAgIHN0cmluZ3NUb0Z1bmN0aW9uczogc3RyaW5nc1RvRnVuY3Rpb25zLFxuICAgICAgICBydW5JZkluTWFpblRocmVhZDogcnVuSWZJbk1haW5UaHJlYWQsXG4gICAgICAgIGlzUG93ZXJPZjI6IGlzUG93ZXJPZjJcbiAgICB9O1xufVxuIiwiLyoqKiBWZWN0b3IgZnVuY3Rpb25zIC0gdmVjdG9ycyBwcm92aWRlZCBhcyBbeCwgeSwgel0gYXJyYXlzICoqKi9cblxudmFyIFZlY3RvciA9IHt9O1xuXG4vLyBWZWN0b3IgbGVuZ3RoIHNxdWFyZWRcblZlY3Rvci5sZW5ndGhTcSA9IGZ1bmN0aW9uICh2KVxue1xuICAgIGlmICh2Lmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIHJldHVybiAodlswXSp2WzBdICsgdlsxXSp2WzFdKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiAodlswXSp2WzBdICsgdlsxXSp2WzFdICsgdlsyXSp2WzJdKTtcbiAgICB9XG59O1xuXG4vLyBWZWN0b3IgbGVuZ3RoXG5WZWN0b3IubGVuZ3RoID0gZnVuY3Rpb24gKHYpXG57XG4gICAgcmV0dXJuIE1hdGguc3FydChWZWN0b3IubGVuZ3RoU3EodikpO1xufTtcblxuLy8gTm9ybWFsaXplIGEgdmVjdG9yXG5WZWN0b3Iubm9ybWFsaXplID0gZnVuY3Rpb24gKHYpXG57XG4gICAgdmFyIGQ7XG4gICAgaWYgKHYubGVuZ3RoID09IDIpIHtcbiAgICAgICAgZCA9IHZbMF0qdlswXSArIHZbMV0qdlsxXTtcbiAgICAgICAgZCA9IE1hdGguc3FydChkKTtcblxuICAgICAgICBpZiAoZCAhPSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW3ZbMF0gLyBkLCB2WzFdIC8gZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFswLCAwXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBkID0gdlswXSp2WzBdICsgdlsxXSp2WzFdICsgdlsyXSp2WzJdO1xuICAgICAgICBkID0gTWF0aC5zcXJ0KGQpO1xuXG4gICAgICAgIGlmIChkICE9IDApIHtcbiAgICAgICAgICAgIHJldHVybiBbdlswXSAvIGQsIHZbMV0gLyBkLCB2WzJdIC8gZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFswLCAwLCAwXTtcbiAgICB9XG59O1xuXG4vLyBDcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWN0b3JzXG5WZWN0b3IuY3Jvc3MgID0gZnVuY3Rpb24gKHYxLCB2MilcbntcbiAgICByZXR1cm4gW1xuICAgICAgICAodjFbMV0gKiB2MlsyXSkgLSAodjFbMl0gKiB2MlsxXSksXG4gICAgICAgICh2MVsyXSAqIHYyWzBdKSAtICh2MVswXSAqIHYyWzJdKSxcbiAgICAgICAgKHYxWzBdICogdjJbMV0pIC0gKHYxWzFdICogdjJbMF0pXG4gICAgXTtcbn07XG5cbi8vIEZpbmQgdGhlIGludGVyc2VjdGlvbiBvZiB0d28gbGluZXMgc3BlY2lmaWVkIGFzIHNlZ21lbnRzIGZyb20gcG9pbnRzIChwMSwgcDIpIGFuZCAocDMsIHA0KVxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaW5lLWxpbmVfaW50ZXJzZWN0aW9uXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NyYW1lcidzX3J1bGVcblZlY3Rvci5saW5lSW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKHAxLCBwMiwgcDMsIHA0LCBwYXJhbGxlbF90b2xlcmFuY2UpXG57XG4gICAgdmFyIHBhcmFsbGVsX3RvbGVyYW5jZSA9IHBhcmFsbGVsX3RvbGVyYW5jZSB8fCAwLjAxO1xuXG4gICAgLy8gYTEqeCArIGIxKnkgPSBjMSBmb3IgbGluZSAoeDEsIHkxKSB0byAoeDIsIHkyKVxuICAgIC8vIGEyKnggKyBiMip5ID0gYzIgZm9yIGxpbmUgKHgzLCB5MykgdG8gKHg0LCB5NClcbiAgICB2YXIgYTEgPSBwMVsxXSAtIHAyWzFdOyAvLyB5MSAtIHkyXG4gICAgdmFyIGIxID0gcDFbMF0gLSBwMlswXTsgLy8geDEgLSB4MlxuICAgIHZhciBhMiA9IHAzWzFdIC0gcDRbMV07IC8vIHkzIC0geTRcbiAgICB2YXIgYjIgPSBwM1swXSAtIHA0WzBdOyAvLyB4MyAtIHg0XG4gICAgdmFyIGMxID0gKHAxWzBdICogcDJbMV0pIC0gKHAxWzFdICogcDJbMF0pOyAvLyB4MSp5MiAtIHkxKngyXG4gICAgdmFyIGMyID0gKHAzWzBdICogcDRbMV0pIC0gKHAzWzFdICogcDRbMF0pOyAvLyB4Myp5NCAtIHkzKng0XG4gICAgdmFyIGRlbm9tID0gKGIxICogYTIpIC0gKGExICogYjIpO1xuXG4gICAgaWYgKE1hdGguYWJzKGRlbm9tKSA+IHBhcmFsbGVsX3RvbGVyYW5jZSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgKChjMSAqIGIyKSAtIChiMSAqIGMyKSkgLyBkZW5vbSxcbiAgICAgICAgICAgICgoYzEgKiBhMikgLSAoYTEgKiBjMikpIC8gZGVub21cbiAgICAgICAgXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7IC8vIHJldHVybiBudWxsIGlmIGxpbmVzIGFyZSAoY2xvc2UgdG8pIHBhcmFsbGVsXG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFZlY3Rvcjtcbn1cbiJdfQ==
(13)
});
