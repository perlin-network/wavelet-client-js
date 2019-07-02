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
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**',
                presets: [
                    [
                        "@babel/preset-env",
                        {
                            "useBuiltIns": "usage",
                            "targets": {
                                "browsers": "> 0.25%",
                            },
                            "corejs": 2
                        }
                    ]
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