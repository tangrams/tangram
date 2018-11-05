import fs from 'fs';

import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import replace from 'rollup-plugin-replace';
import sourcemaps from 'rollup-plugin-sourcemaps';
import {terser} from 'rollup-plugin-terser';
import string from 'rollup-plugin-string';

import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const es5 = (process.env.ES5 === 'true');
const minify = (process.env.MINIFY === 'true');
const server = (process.env.SERVER === 'true');

const outputFile = 'dist/tangram.' + (es5 ? 'es5.' : '') + (minify ? 'min' : 'debug') + '.js';

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
        string({
            include: ['**/*.json', '**/*.glsl'] // inline imported JSON and shader files
        }),

        // These are needed for jszip node-environment compatibility,
        // previously provided by browserify
        globals(),
        builtins(),

        minify ? terser() : false,
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
        format: es5 ? 'umd' : 'esm',
        sourcemap: minify ? false : true,
        indent: false,
        intro: fs.readFileSync(require.resolve('./build/intro.js'), 'utf8')
    },
    treeshake: false,
    plugins: [
        replace({
            ESMODULE: !es5
        }),
        sourcemaps(), // use source maps produced in the first pass

        // optionally start server and watch for rebuild
        server ? serve({
            port: 8000,
            contentBase: ''
        }): false,
        server ? livereload({
            watch: 'dist'
        }) : false
    ],
}];

export default config
