var exorcist = require('exorcist');
var quine = require('./quine');

var default_map = "dist/tangram.debug.js.map";

module.exports = function (browserify, opts) {
    browserify
        .transform("babelify", {presets: ["es2015"]})
        .transform("brfs")
        .plugin(quine)
        .bundle()
        .pipe(exorcist(opts.output_map || default_map));
};
