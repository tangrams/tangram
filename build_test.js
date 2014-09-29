/*jshint node: true */
'use strict';

var browserify = require('browserify'),
    es6ify     = require('es6ify'),
    glob       = require('glob');

es6ify.traceurOverrides = { blockBinding: true };

var pipeline = browserify()
    .add(es6ify.runtime)
    .transform(es6ify);

// once we switch to a modern version of browserify, add takes an
// array as an argument
glob.sync('./test/*.js').forEach(function (file) {
    pipeline.add(file);
});

pipeline.bundle({ debug: true })
    .on('error', function (err) { console.error(err); console.log(err.stack); })
    .pipe(process.stdout);
