// Partial import of gl-matrix via modularized stack-gl forks
// https://github.com/toji/gl-matrix
// https://github.com/stackgl

// vec3

// Substitute 64-bit version
// We need the extra precision when multiplying matrices w/mercator projected values
const vec3 = {
    fromValues (x, y, z) {
        var out = new Float64Array(3);
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    }
};


// mat3

import {default as mat3_normalFromMat4} from 'gl-mat3/normal-from-mat4';
import {default as mat3_invert} from 'gl-mat3/invert';

const mat3 = {
    normalFromMat4: mat3_normalFromMat4,
    invert: mat3_invert
};


// mat4

import {default as mat4_multiply} from 'gl-mat4/multiply';
import {default as mat4_translate} from 'gl-mat4/translate';
import {default as mat4_scale} from 'gl-mat4/scale';
import {default as mat4_perspective} from 'gl-mat4/perspective';
import {default as mat4_lookAt} from 'gl-mat4/lookAt';
import {default as mat4_identity} from 'gl-mat4/identity';
import {default as mat4_copy} from 'gl-mat4/copy';

const mat4 = {
    multiply: mat4_multiply,
    translate: mat4_translate,
    scale: mat4_scale,
    perspective: mat4_perspective,
    lookAt: mat4_lookAt,
    identity: mat4_identity,
    copy: mat4_copy
};


export {vec3, mat3, mat4};
