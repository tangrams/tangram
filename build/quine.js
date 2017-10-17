var through = require('through2');

function makePrefix(sourceMapFile) {
    var source_var = '__worker_src__';               // variable name used to refer to the Tangram source code
    var source_origin_var = '__worker_src_origin__'; // variable name used to refer to URL origin of source code (e.g., "http://localhost:8000/dist/tangram.debug.js")
    var source_map_var = '__worker_src_map__';       // variable name used to refer to the filename of the source map (e.g. "tangram.debug.js.map")

    // prepend this code - wraps Tangram source in a function and later calls arguments.callee.toString to get source
    var prefix = '(function(){';
        prefix += 'var target = (typeof self === "undefined" || !(typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope)) && ((typeof module !== "undefined" && module.exports) || (typeof window !== "undefined"));';
        prefix += 'if (target) {';
        prefix += 'var ' + source_var + ' = arguments.callee.toString();';
        prefix += 'var ' + source_origin_var + ' = typeof document !== "undefined" && document.currentScript !== undefined ? document.currentScript.src : \'\';';
        prefix += 'var ' + source_map_var + ' = \'' + sourceMapFile + '\';';
        prefix += '};';
    return prefix;
}

// append the function closing
var postfix = '})();';

// export a Browserify plugin
module.exports = function (browserify, opts) {
    browserify.on("bundle", function(){
        var prefixed = false;
        var sourceMap = '';
        var sourceMapFile = opts._ ? opts._[0] : '';

        var wrap = through.obj(function(buf, enc, next) {
            if(!prefixed) {
                this.push(makePrefix(sourceMapFile));
                prefixed = true;
            }

            var str = buf.toString();

            // find the source map to push to the end of the file, rather than appearing within the function
            var match = str.match('\n//# sourceMappingURL=.*');
            if (match && match.length > 0) {
                sourceMap = match[0];
            }
            else {
                this.push(buf);
            }

            next();
        }, function(next){
            this.push(postfix); // push the function closing
            this.push(sourceMap); // push the source map comment
            next();
        });

        browserify.pipeline.get('wrap').unshift(wrap);
    });
};
