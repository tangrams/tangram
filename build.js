/*jshint node: true */
'use strict';

var browserify = require('browserify'),
    es6ify     = require('es6ify');

browserify({ debug: true, standalone: 'Tangram'})
    .add(es6ify.runtime)
    .transform(es6ify)
    .require(require.resolve('./src/module'), { entry: true })
    .bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(process.stdout);


