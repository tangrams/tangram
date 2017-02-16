var exorcist = require('exorcist');
var quine = require('./quine');

module.exports = function (browserify, opts) {
    browserify
        .transform("babelify", {presets: ["es2015"]})
        .transform("brfs")
        .plugin(quine)
        .bundle()
        .pipe(exorcist('dist/tangram.debug.js.map'))
};
