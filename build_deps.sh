#!/bin/bash
# Generate list of module dependencies

BROWSERIFY=node_modules/.bin/browserify

if [ ! -f src/gl/shader_sources.js ];
then
    # keep browserify from bombing by creating a temporary fake file
    touch src/gl/shader_sources.js
    $BROWSERIFY --list -t babelify src/module.js | sed 's/\([[:space:]]\)/\\\1/g'
    rm src/gl/shader_sources.js
else
    $BROWSERIFY --list -t babelify src/module.js | sed 's/\([[:space:]]\)/\\\1/g'
fi
