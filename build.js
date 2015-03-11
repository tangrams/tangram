/*jshint node: true */
'use strict';

var browserify = require('browserify'),
    yargs      = require('yargs'),
    glob       = require('glob'),
    babelify   = require("babelify"),
    babel   = require("babel");

var args = yargs.usage('Usage: $0 --debug --require --all').demand([]).argv;


function main() {

    var bundle = browserify({ debug: true});

    // Use either Babel polyfill or runtime
    if (args.polyfill) {
        bundle.add('babel/polyfill');
        bundle.transform(babelify);
    }
    else if (args.runtime) {
        bundle.transform(babelify.configure({
            optional: ['runtime']
        }));
    }

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
