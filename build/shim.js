// A Browserify plugin to save the source code of a standalone library
// in a property of the library
var through = require('through2');

var PROPERTY = '_worker_src'; // Property name of Tangram

// export a Browserify plugin
module.exports = function (browserify, opts) {
    browserify.on("bundle", function(){
        var first = true;

        // Intercept standalone UMD wrapper
        var wrap = through.obj(function (row, enc, next) {
            if (first){
                var searchStr = replaceStr = '';

                // When Tangram is placed on the global object, create a property containing
                // its stringified source code
                var str = row.toString();

                // for attaching to window Tangram object
                searchStr = 'g.Tangram = f()';
                replaceStr = searchStr + '; g.Tangram.source.' + PROPERTY + ' = f.toString()';
                str = str.replace(searchStr, replaceStr);

                // for attaching to CommonJS required-in Tangram (with a blank source field)
                searchStr = 'module.exports=f()';
                replaceStr = searchStr + '; if (module.exports.source !== undefined){ module.exports.source.' + PROPERTY + ' = f.toString()}';
                str = str.replace(searchStr, replaceStr);

                first = false;
                row = new Buffer(str);
            }

            this.push(row);
            next();
        });

        browserify.pipeline.get('wrap').unshift(wrap);
    });
};
