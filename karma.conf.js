import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import json from '@rollup/plugin-json';
import { importAsString } from 'rollup-plugin-string-import';

export default {

    config.set({
        basePath: '',
        frameworks: ['mocha', 'sinon'],
        files: [
            'https://unpkg.com/leaflet@1.3.4/dist/leaflet.js', // TODO: update leaflet version
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
                importAsString({
                    include: ['**/*.glsl'] // inline shader files
                }),

                babel({
                    exclude: ['node_modules/**', '*.json'],
                    babelHelpers: "runtime"
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

}
