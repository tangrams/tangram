var browserify = require('browserify');
var through = require('through2');
var exorcist = require('exorcist');
var path = require('path');
var fs = require('fs');

var mapfile = path.join(__dirname, 'dist/tangram.debug.js.map');

var source_variable = '__worker_src__';
var source_origin = '__worker_src_origin__';

var prefix = '(function(){';
    prefix += 'var target = (typeof module !== "undefined" && module.exports) || (typeof window !== "undefined");';
    prefix += 'if (target) {';
    prefix += 'var ' + source_variable + ' = arguments.callee.toString();';
    prefix += 'var ' + source_origin + ' = document.currentScript.src;';
    prefix += '};';

var postfix = '})();';

module.exports = function (browserify, opts) {
    // export a Browserify plugin
    function source_map_plugin (browserify, opts) {
        browserify.on("bundle", function(){
            var prefixed = false;
            var sourceMap = '';

            var wrap = through.obj(function(buf, enc, next) {
                if(!prefixed) {
                    this.push(prefix);
                    prefixed = true;
                }

                var str = buf.toString();
                var match = str.match('\n//# sourceMappingURL=.*');
                if (match && match.length > 0) {
                    sourceMap = match[0];
                }
                else {
                    this.push(buf);
                }

                next();
            }, function(next){
                this.push(postfix);
                this.push(sourceMap);
                next();
            });

            browserify.pipeline.get('wrap').unshift(wrap);
        });
    };

    var output = browserify
        .transform("babelify", {presets: ["es2015"]})
        .transform("brfs")
        .plugin(source_map_plugin)
        .bundle()
        .pipe(exorcist('dist/tangram.debug.js.map'))

    // if (typeof opts.output === 'string'){
    //     output.pipe(fs.createWriteStream(opts.output, 'utf8'));
    // }

    // browserify('src/module.js', {standalone : 'Tangram', debug : true})
    // .transform("babelify", {presets: ["es2015"]})
    // .transform("brfs")
    // .plugin(source_map_plugin)
    // .bundle()
    // .pipe(exorcist('dist/tangram.debug.js.map'))
    // .pipe(fs.createWriteStream('dist/tangram.debug.js', 'utf8'))
};
