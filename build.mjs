import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("📦 Compilando TypeScript...");
try {
  execSync("npx tsc --noEmitOnError false", { stdio: "inherit" });
} catch (e) {
  console.log("⚠️ Compilación con errores, continuando...");
}

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