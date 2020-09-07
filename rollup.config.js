import fs from 'fs';
import { execSync } from 'child_process';

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

const ESM = (process.env.ESM !== 'false'); // default to ESM on
const MINIFY = (process.env.MINIFY === 'true');
const SERVE = (process.env.SERVE === 'true');

const outputFile = `dist/tangram.${MINIFY ? 'min' : 'debug'}.${ESM ? 'm' : ''}js`;

// Use two pass code splitting and re-bundling technique, for another example see:
// https://github.com/mapbox/mapbox-gl-js/blob/master/rollup.config.js

const config = [{
    input: ['src/index.js', 'src/scene/scene_worker.js'],
    output: {
        dir: 'build',
        format: 'amd',
        sourcemap: 'inline',
        indent: false,
        chunkFileNames: 'shared.js',
    },
    plugins: [
        resolve({
            browser: true,
            preferBuiltins: false
        }),
        commonjs({
            // Avoids Webpack minification errors
            ignoreGlobal: true,
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

        babel({
            exclude: 'node_modules/**'
        }),

        // These are needed for jszip node-environment compatibility,
        // previously provided by browserify
        globals(),
        builtins(),

        MINIFY ? terser() : false
    ]
}, {
    // Second pass: combine the chunks from the first pass into a single bundle
    input: 'build/bundle.js',
    output: {
        name: 'Tangram',
        file: outputFile,
        format: ESM ? 'esm' : 'umd',
        sourcemap: MINIFY ? false : true,
        indent: false,
        intro: fs.readFileSync(require.resolve('./build/intro.js'), 'utf8')
    },
    treeshake: false,
    plugins: [
        replace({
            _ESM: ESM,
            _SHA: '\'' + String(execSync('git rev-parse HEAD')).trim(1) + '\''
        }),
        sourcemaps(), // use source maps produced in the first pass

        // optionally start server and watch for rebuild
        SERVE ? serve({
            port: 8000,
            contentBase: '',
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        }): false,
        SERVE ? livereload({
            watch: 'dist'
        }) : false
    ],
}];

export default config
