import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("📦 Compilando TypeScript...");

// Build de producción - falla si hay errores de TypeScript
try {
  execSync("npx tsc", { stdio: "inherit", encoding: "utf-8" });
  console.log("✅ TypeScript compilado sin errores");
} catch (error) {
  console.error("❌ Error en compilación de TypeScript");
  process.exit(1);
}

// Copiar archivos estáticos
const dirs = ["views", "public"];
const srcDir = "src";
const distDir = "dist";

dirs.forEach(dir => {
  const srcPath = path.join(srcDir, dir);
  const distPath = path.join(distDir, dir);
  if (fs.existsSync(srcPath)) {
    console.log(`📁 Copiando ${dir}/`);
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }
    execSync(`cp -r ${srcPath}/* ${distPath}/`, { stdio: "ignore" });
  }
});

console.log("✅ Build completo!");