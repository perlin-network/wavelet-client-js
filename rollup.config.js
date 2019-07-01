import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';

export default [
    {
        input: 'src/main.js',
        output: {
            name: 'wavelet-client',
            file: pkg.browser,
            format: 'umd'
        },
        plugins: [
            babel({
                exclude: 'node_modules/**',
                plugins: [
                    "babel-plugin-transform-bigint"
                ]
            })
        ]
    },
    {
        input: 'src/main.js',
        output: [
            {file: pkg.main, format: 'cjs'},
            {file: pkg.module, format: 'es'}
        ]
    }
]