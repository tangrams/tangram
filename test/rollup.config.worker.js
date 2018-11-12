// Create a standalone worker bundle, to allow the Karma suite to load the web worker
// (regular two-pass code-splitting build process is not easily adaptable to Karma)

import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import string from 'rollup-plugin-string';

const config = {
    input: 'src/scene_worker.js',
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
        string({
            include: ['**/*.json', '**/*.glsl'] // inline imported JSON and shader files
        }),
        babel({
          exclude: 'node_modules/**'
        })
    ]
};

export default config
