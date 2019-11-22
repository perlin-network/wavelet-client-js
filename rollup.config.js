import pkg from "./package.json";
import typescript from "rollup-plugin-typescript";
import commonjs from 'rollup-plugin-commonjs';

export default [
  {
    input: "src/main.ts",
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" }
    ],
    plugins: [
      typescript(),
      commonjs({
        namedExports: {
          // left-hand side can be an absolute path, a path
          // relative to the current directory, or the name
          // of a module in node_modules
          blake2b: ["blakejs"]
        }
      })
    ]
  }
];
