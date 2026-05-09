import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

/**
 * Configuración de Rollup para producción
 * @en Rollup configuration for production builds
 * @es Configuración de Rollup para compilación de producción
 */
export default defineConfig({
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
    entryFileNames: "[name].js",
    chunkFileNames: "[name]-[hash].js",
  },
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "./dist/types",
    }),
    terser(),
  ],
  external: [
    "express",
    "mongoose",
    "passport",
    "connect-mongo",
    "cookie-parser",
    "express-session",
    "body-parser",
    "express-validator",
    "connect-flash",
    "http-errors",
    "nodemailer",
    "dotenv",
  ],
});