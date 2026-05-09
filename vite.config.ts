import { defineConfig } from "vite";
import { resolve } from "path";

/**
 * Configuración de Vite para DevJobs
 * @en Vite configuration for DevJobs project
 * @es Configuración de Vite para el proyecto DevJobs
 */
export default defineConfig({
  root: ".",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@config": resolve(__dirname, "src/config"),
      "@controllers": resolve(__dirname, "src/controllers"),
      "@models": resolve(__dirname, "src/models"),
      "@types": resolve(__dirname, "src/types"),
      "@helpers": resolve(__dirname, "src/helpers"),
      "@handlers": resolve(__dirname, "src/handlers"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        manualChunks: undefined,
      },
    },
    target: "es2022",
    minify: "esbuild",
    sourcemap: true,
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: true,
  },
  optimizeDeps: {
    include: ["express", "mongoose", "passport"],
  },
});