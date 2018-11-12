import fs from 'fs';

import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import replace from 'rollup-plugin-replace';
import sourcemaps from 'rollup-plugin-sourcemaps';
import {terser} from 'rollup-plugin-terser';
import json from 'rollup-plugin-json';
import string from 'rollup-plugin-string';

import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const ES5 = (process.env.ES5 === 'true');
const MINIFY = (process.env.MINIFY === 'true');
const SERVE = (process.env.SERVE === 'true');

const outputFile = 'dist/tangram.' + (ES5 ? 'ES5.' : '') + (MINIFY ? 'min' : 'debug') + '.js';

// Use two pass code splitting and re-bundling technique, for another example see:
// https://github.com/mapbox/mapbox-gl-js/blob/master/rollup.config.js

const config = [{
    input: ['src/module.js', 'src/scene_worker.js'],
    output: {
        dir: 'build',
        format: 'amd',
        sourcemap: 'inline',
        indent: false,
        chunkFileNames: 'shared.js',
    },
    experimentalCodeSplitting: true,
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
                'node_modules/events/events.js': ['EventEmitter'],
            }
        }),
        json(), // load JSON files
        string({
            include: ['**/*.glsl'] // inline shader files
        }),

        // These are needed for jszip node-environment compatibility,
        // previously provided by browserify
        globals(),
        builtins(),

        MINIFY ? terser() : false,
        babel({
          exclude: 'node_modules/**'
        })
    ]
}, {
    // Second pass: combine the chunks from the first pass into a single bundle
    input: 'build/bundle.js',
    output: {
        name: 'Tangram',
        file: outputFile,
        format: ES5 ? 'umd' : 'esm',
        sourcemap: MINIFY ? false : true,
        indent: false,
        intro: fs.readFileSync(require.resolve('./build/intro.js'), 'utf8')
    },
    treeshake: false,
    plugins: [
        replace({
            ESMODULE: !ES5
        }),
        sourcemaps(), // use source maps produced in the first pass

        // optionally start server and watch for rebuild
        SERVE ? serve({
            port: 8000,
            contentBase: ''
        }): false,
        SERVE ? livereload({
            watch: 'dist'
        }) : false
    ],
}];

export default config
