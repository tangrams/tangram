/*** Vector functions - vectors provided as [x, y, z] arrays ***/

var Vector;
export default Vector = {};

Vector.set = function (v) {
    var V = [];
    var lim = v.length;
    for (var i = 0; i < lim; i++) {
        V[i] = v[i];
    }
    return V;
};

Vector.neg = function (v) {
    var V = [];
    var lim = v.length;
    for (var i = 0; i < lim; i++) {
        V[i] = v[i] * -1;
    }
    return V;
};

// Addition of two vectors
Vector.add = function (v1, v2) {
    var v = [];
    var lim = Math.min(v1.length,v2.length);
    for (var i = 0; i < lim; i++) {
        v[i] = v1[i] + v2[i];
    }
    return v;
};

// Substraction of two vectors
Vector.sub = function (v1, v2) {
    var v = [];
    var lim = Math.min(v1.length,v2.length);

    for (var i = 0; i < lim; i++) {
        v[i] = v1[i] - v2[i];
    }
    return v;
};

Vector.signed_area = function (v1, v2, v3) {
    return (v2[0]-v1[0])*(v3[1]-v1[1]) - (v3[0]-v1[0])*(v2[1]-v1[1]);
};

// Multiplication of two vectors
Vector.mult = function (v1, v2) {
    var v = [],
        len = v1.length,
        i;

    if (typeof v2 === 'number') {
        // Mulitply by scalar
        for (i = 0; i < len; i++) {
            v[i] = v1[i] * v2;
        }
    }
    else {
        // Multiply two vectors
        len = Math.min(v1.length,v2.length);
        for (i = 0; i < len; i++) {
            v[i] = v1[i] * v2[i];
        }
    }
    return v;
};

// Division of two vectors
Vector.div = function (v1, v2) {
    var v = [],
        i;
    if(typeof v2 === 'number'){
        // Divide by scalar
        for (i = 0; i < v1.length; i++){
            v[i] = v1[i] / v2;
        }
    } else {
        // Divide to vectors
        var len = Math.min(v1.length,v2.length);
        for (i = 0; i < len; i++) {
            v[i] = v1[i] / v2[i];
        }
    }
    return v;
};

// Get 2D perpendicular
Vector.perp = function (v1, v2) {
    return [ v2[1] - v1[1],
             v1[0] - v2[0] ];
};

// Get 2D vector rotated
Vector.rot = function (v, a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return [v[0] * c - v[1] * s,
            v[0] * s + v[1] * c];
};

// Get 2D heading angle
Vector.angle = function ([x, y]) {
    return Math.atan2(y,x);
};

// Get angle between two vectors
Vector.angleBetween = function(A, B){
    var delta = Vector.dot(A, B);
    if (delta < -1) {
        delta = -1;
    }
    return Math.acos(delta);
};

// Compare two points
Vector.isEqual = function (v1, v2) {
    var len = v1.length;
    for (var i = 0; i < len; i++) {
        if (v1[i] !== v2[i]){
            return false;
        }
    }
    return true;
};

// Vector length squared
Vector.lengthSq = function (v)
{
    if (v.length === 2) {
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
    if (v.length === 2) {
        d = v[0]*v[0] + v[1]*v[1];
        d = Math.sqrt(d);

        if (d !== 0) {
            return [v[0] / d, v[1] / d];
        }
        return [0, 0];
    } else {
        d = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
        d = Math.sqrt(d);

        if (d !== 0) {
            return [v[0] / d, v[1] / d, v[2] / d];
        }
        return [0, 0, 0];
    }
};

// Cross product of two vectors
Vector.cross  = function (v1, v2) {
    return [
        (v1[1] * v2[2]) - (v1[2] * v2[1]),
        (v1[2] * v2[0]) - (v1[0] * v2[2]),
        (v1[0] * v2[1]) - (v1[1] * v2[0])
    ];
};

// Dot product of two vectors
Vector.dot = function (v1, v2) {
    var n = 0;
    var lim = Math.min(v1.length, v2.length);
    for (var i = 0; i < lim; i++) {
        n += v1[i] * v2[i];
    }
    return n;
};
