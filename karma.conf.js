/*jshint node: true*/

var babel = require('rollup-plugin-babel');
var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var globals = require('rollup-plugin-node-globals');
var builtins = require('rollup-plugin-node-builtins');
var json = require('rollup-plugin-json');
var string = require('rollup-plugin-string');

module.exports = function (config) {

    var customLaunchers = {
        'SL_Firefox': {
            base: 'SauceLabs',
            platform: 'Windows 2012',
            browserName: 'firefox',
            version: '34',
            firefox_profile: {
                'webgl.force-enabled': true,
                'webgl.disable': false,
                'webgl.msaa-force': true
            }
        }
    };

    var browserList = Object.keys(customLaunchers);
    browserList.push('Chrome');

    config.set({
        basePath: '',
        frameworks: ['mocha', 'sinon'],
        files: [
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/leaflet.js',
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

                // These are needed for jszip node-environment compatibility,
                // previously provided by browserify
                globals(),
                builtins(),

                babel({
                  exclude: ['node_modules/**', '*.json']
                })
            ]
        },

        plugins: [
            'karma-rollup-preprocessor',
            'karma-mocha',
            'karma-sinon',
            'karma-chrome-launcher',
            'karma-sauce-launcher',
            'karma-mocha-reporter'
        ],
        reporters: ['mocha'],

        port: 9876,
        colors: true,

        sauceLabs: {
            testName: 'Tangram test Suite',
            recordScreenshots: true,
            connectOptions: {
                logfile: 'sauce_connect.log'
            }
        },

        logLevel: config.LOG_INFO,
        autoWatch: false,
        customLaunchers: customLaunchers,
        browsers: browserList,

        singleRun: false

    });


};
