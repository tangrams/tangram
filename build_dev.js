var fs = require('fs');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var brfs = require('brfs');

var source = './src/module.js';
var dest = 'dist/tangram.debug.js';

// Define Tangram as a UMD build
// Transform source with Babel and BRFS (for shaders)
// Watch for changes with watchify
var browserifyOpts = {
    standalone : 'Tangram',
    debug : true,
    entries : [source],
    transform : [babelify.configure({optional : ['runtime']}), brfs],
    cache : {},
    packageCache : {},
    plugin : [watchify]
};

var b = browserify(browserifyOpts);

// On changes, rebuild with watchify
b.on('update', bundle);

// Log change metadata (bytes written, time taken) to the console
b.on('log', function(msg) {
    console.log(msg);
});

// Bundle the library and write to `dest`
function bundle() {
    b.bundle().pipe(fs.createWriteStream(dest));
}

bundle();
