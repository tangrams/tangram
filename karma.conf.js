/*jshint node: true*/

var babel = require('rollup-plugin-babel');
var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var globals = require('rollup-plugin-node-globals');
var builtins = require('rollup-plugin-node-builtins');
var json = require('rollup-plugin-json');
var string = require('rollup-plugin-string');

module.exports = function (config) {

    config.set({
        basePath: '',
        frameworks: ['mocha', 'sinon'],
        files: [
            'https://unpkg.com/leaflet@1.3.4/dist/leaflet.js',
            {
                pattern : 'test/fixtures/*',
                watched : false,
                included : false,
                served : true
            },
            {
                pattern: 'build/worker.test.js',
                watched : false,
                included: false,
                served: true
            },
            {
                pattern: 'test/**/*.js'
            }
        ],

        exclude: ['test/rollup.config.worker.js'], // skip rollup config for building worker
        preprocessors: {
            'test/**/*.js' : ['rollup']
        },

        rollupPreprocessor: {
            output: {
                format: 'umd',
                sourcemap: 'inline',
            },
            treeshake: false, // treeshaking can remove test code we need!
            plugins: [
                resolve({
                    browser: true,
                    preferBuiltins: false
                }),
                commonjs({
                    // There hints are required for importing jszip
                    // See https://rollupjs.org/guide/en#error-name-is-not-exported-by-module-
                    namedExports: {
                        'node_modules/process/browser.js': ['nextTick'],
                        'node_modules/events/events.js': ['EventEmitter']
                    }
                }),

                json({
                    exclude: ['node_modules/**', 'src/**'] // import JSON files
                }),
                string({
                    include: ['**/*.glsl'] // inline shader files
                }),

                babel({
                    exclude: ['node_modules/**', '*.json']
                }),

                // These are needed for jszip node-environment compatibility,
                // previously provided by browserify
                globals(),
                builtins()
            ]
        },

        plugins: [
            'karma-rollup-preprocessor',
            'karma-mocha',
            'karma-sinon',
            'karma-chrome-launcher',
            'karma-mocha-reporter'
        ],
        reporters: ['mocha'],

        port: 9876,
        colors: true,

        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['Chrome'],

        singleRun: false

    });


};
