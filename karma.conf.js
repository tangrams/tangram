const babel = require('@rollup/plugin-babel').default;
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const globals = require('rollup-plugin-node-globals');
const builtins = require('rollup-plugin-node-builtins');
const json = require('@rollup/plugin-json');
const string = require('rollup-plugin-string').string;

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
                commonjs(),

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
