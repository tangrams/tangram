#!/bin/bash
# Generate list of module dependencies

BROWSERIFY=node_modules/.bin/browserify

if [ ! -f src/gl/shader_sources.js ];
then
    # keep browserify from bombing by creating a temporary fake file
    touch src/gl/shader_sources.js
    $BROWSERIFY --list -t es6ify src/module.js
    rm src/gl/shader_sources.js
else
    $BROWSERIFY --list -t es6ify src/module.js
fi
