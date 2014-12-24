/*jshint node: true */
'use strict';

var browserify = require('browserify'),
    yargs      = require('yargs'),
    glob       = require('glob'),
    es6ify     = require('es6ify');


var args = yargs.usage('Usage: $0 --debug --require --all').demand([]).argv;


function main() {

    if (args.includeLet) {
        es6ify.traceurOverrides = { blockBinding: true };
    }

    var bundle = browserify({ debug: true}).
        add(es6ify.runtime).
        transform(es6ify.configure(/^(?!.*node_modules)+.+\.js$/));

    if ((args.require !== undefined) && (args.all !== undefined)) {
        throw new Error('You must specify either the require or all option, not both.');
    }

    if (args.require !== undefined) {
        bundle.require(require.resolve(args.require), { entry: true});
    }

    if (args.all !== undefined) {
        glob.sync(args.all).forEach(function (file) {
            bundle.add(file);
        });
    }

    bundle.bundle().
        on('error', function (err) { console.error(err); }).
        pipe(process.stdout);

}

main();
