/*jshint node: true */
'use strict';

var browserify = require('browserify'),
    es6ify     = require('es6ify');

browserify()
    .add(es6ify.runtime)
    .require(require.resolve('./src/scene_worker'), { entry: true })
    .transform(es6ify)
    .bundle({ debug: true })
    .on('error', function (err) { console.error(err); console.log(err.stack); })
    .pipe(process.stdout);
