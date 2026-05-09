import { defineConfig } from "vitest/config";
import { resolve } from "path";

/**
 * Configuración de Vitest para testing
 * @en Vitest configuration for testing
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.config.ts",
        "**/*.d.ts",
        "tests/",
      ],
    },
  },
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
});