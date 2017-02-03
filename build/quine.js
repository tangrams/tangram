var browserify = require('browserify');
var through = require('through2');

var source_variable = '__worker_src__';

var prefix = '(function(){';
    prefix += 'var target = (typeof module !== "undefined" && module.exports) || (typeof window !== "undefined" && window.Tangram);';
    prefix += 'if (target) { var ' + source_variable + ' = arguments.callee.toString() };';

var postfix = '})();\n';

// export a Browserify plugin
module.exports = function (browserify, opts) {
    browserify.on("bundle", function(){
        var prefixed = false;
        var wrap = through.obj(function(buf, enc, next) {
            if(!prefixed) {
                this.push(prefix);
                prefixed = true;
            }

            this.push(buf);
            next();
        }, function(next){
            this.push(postfix);
            next();
        });

        browserify.pipeline.get('wrap').unshift(wrap);
    });
};