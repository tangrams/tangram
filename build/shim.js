// A Browserify plugin to save the source code of a standalone library
// in a property of the library

var through = require('through2');
var uglify = require("uglify-js");

var PROPERTY = '_worker_src'; // Property name of Tangram

// export a Browserify plugin
module.exports = function (browserify, opts) {

    // Intercept standalone UMD wrapper
    var first = true;
    var wrap = through.obj(function (row, enc, next) {
        if (first){
            // When Tangram is placed on the global object, create a property containing
            // its stringified source code
            var str = row.toString();
            var replaceStr = 'g.Tangram = f(); g.Tangram.' + PROPERTY + ' = f.toString()';
            str = str.replace('g.Tangram = f()', replaceStr);
            first = false;
            row = new Buffer(str);
        }

        this.push(row);
        next();
    });

    browserify.pipeline.get('wrap').push(wrap);

    // Allows live-reload by continually building Tangram
    browserify.on("reset", function () {
        first = true;
        browserify.pipeline.get("wrap").push(wrap);
    });
};