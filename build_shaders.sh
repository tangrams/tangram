#!/bin/bash
cd src;
echo "// Generated from GLSL files, don't edit!";
echo "var shaderSources = {};";
echo;
for f in `find . -name '*.glsl'`; do
    shader_name=`echo "$f" | sed -e "s/\.\/\(.*\)\.glsl/\1/"`;
    echo "shaderSources['$shader_name'] =";
    sed -e "s/'/\\\'/g" -e 's/"/\\\"/g' -e 's/^\(.*\)/"\1\\n" +/g' $f;
    echo '"";';
    echo;
done;
echo "module.exports = shaderSources;";
