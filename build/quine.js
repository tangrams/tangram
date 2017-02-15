var through = require('through2');

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
};
