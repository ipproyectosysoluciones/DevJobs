import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default defineConfig({
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: "[name].js",
    sourcemap: false,
  },
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      noEmit: false,
      outDir: "dist",
    }),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
      format: {
        comments: false,
      },
    }),
  ],
  external: [],
  onwarn(warning, warn) {
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    if (warning.code === "THIS_IS_UNDEFINED") return;
    warn(warning);
  },
});