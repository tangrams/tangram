// Create a standalone worker bundle, to allow the Karma suite to load the web worker
// (regular two-pass code-splitting build process is not easily adaptable to Karma)

import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { string } from 'rollup-plugin-string';

const config = {
    input: 'src/scene/scene_worker.js',
    output: {
        file: 'build/worker.test.js',
        format: 'umd',
        sourcemap: 'inline',
        indent: false,
    },
    plugins: [
        resolve({
            browser: true,
            preferBuiltins: false
        }),
        commonjs(),
        json(), // load JSON files
        string({
            include: ['**/*.glsl'] // inline imported JSON and shader files
        }),
        babel({
          exclude: 'node_modules/**'
        })
    ]
};

export default config;
