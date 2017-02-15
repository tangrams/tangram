var browserify = require('browserify');
var exorcist = require('exorcist');
var fs = require('fs');
var quine = require('./quine');

module.exports = function (browserify, opts) {
    var output = browserify
        .transform("babelify", {presets: ["es2015"]})
        .transform("brfs")
        .plugin(quine)
        .bundle()
        .pipe(exorcist('dist/tangram.debug.js.map'))

    if (typeof opts.output === 'string'){
        output.pipe(fs.createWriteStream(opts.output, 'utf8'));
    }
};
