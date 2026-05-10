import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import slug from "slug";
import shortid from "shortid";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: ".env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Modelos
const usuarioSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true, trim: true },
  nombre: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  imagen: { type: String },
  token: { type: String },
  expira: { type: Date },
});

const vacanteSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  empresa: { type: String, trim: true },
  ubicacion: { type: String, required: true, trim: true },
  salario: { type: String, trim: true },
  contrato: { type: String, trim: true },
  descripcion: { type: String, trim: true },
  url: { type: String, lowercase: true },
  skills: [{ type: String }],
  candidatos: [{
    nombre: String,
    email: String,
    cv: String,
  }],
  autor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuarios" },
}, { timestamps: true, versionKey: false });

const Usuario = mongoose.model("Usuarios", usuarioSchema);
const Vacante = mongoose.model("Vacantes", vacanteSchema);

// Datos de prueba
const perfiles = [
  { nombre: "Juan Desarrollador", email: "juan@devjobs.com", imagen: "PLE85YLBD.jpeg" },
  { nombre: "María Frontend", email: "maria@devjobs.com", imagen: "H1dH8Wm0x.jpeg" },
  { nombre: "Carlos Backend", email: "carlos@devjobs.com", imagen: "7zezTqIV5.jpeg" },
  { nombre: "Ana Fullstack", email: "ana@devjobs.com", imagen: "MRSSkmSvB.jpeg" },
];

const vacantes = [
  {
    titulo: "Desarrollador React Junior",
    empresa: "TechStartup",
    ubicacion: "Remoto",
    salario: "$800 - $1200",
    contrato: "Freelance",
    descripcion: "Buscamos desarrollador React con conocimientos básicos de TypeScript para proyecto de larga duración.",
    skills: ["React", "TypeScript", "JavaScript", "CSS"],
  },
  {
    titulo: "Frontend Developer Senior",
    empresa: "DigitalAgency",
    ubicacion: "Buenos Aires, Argentina",
    salario: "$2000 - $3000",
    contrato: "Full-time",
    descripcion: "Agencia digital busca Frontend Senior con experiencia en Next.js y Tailwind CSS.",
    skills: ["Next.js", "Tailwind", "TypeScript", "React"],
  },
  {
    titulo: "Backend Node.js Developer",
    empresa: "ApiHub",
    ubicacion: "Madrid, España",
    salario: "$2500 - $3500",
    contrato: "Full-time",
    descripcion: "Buscamos Backend Developer con experiencia en Express, MongoDB y arquitectura de APIs.",
    skills: ["Node.js", "Express", "MongoDB", "TypeScript"],
  },
  {
    titulo: "Fullstack Developer",
    empresa: "Innovatech",
    ubicacion: "Ciudad de México",
    salario: "$1800 - $2500",
    contrato: "Contrato",
    descripcion: "Empresa de innovación busca Fullstack Developer para desarrollo de plataformas SaaS.",
    skills: ["React", "Node.js", "PostgreSQL", "AWS"],
  },
  {
    titulo: "Desarrollador Vue.js",
    empresa: "WebStudio",
    ubicacion: "Remoto",
    salario: "$1500 - $2000",
    contrato: "Freelance",
    descripcion: "Studio de diseño web busca desarrollador Vue.js para proyectos de e-commerce.",
    skills: ["Vue.js", "Nuxt", "JavaScript", "SCSS"],
  },
  {
    titulo: "DevOps Engineer",
    empresa: "CloudTech",
    ubicacion: "Bogotá, Colombia",
    salario: "$2200 - $2800",
    contrato: "Full-time",
    descripcion: "Buscamos DevOps con experiencia en Docker, Kubernetes y CI/CD.",
    skills: ["Docker", "Kubernetes", "AWS", "GitHub Actions"],
  },
];

// URLs de CVs
const cvs = ["Kw9w8GWrW.pdf", "nfQGmfN5x.pdf", "EXipPan5c.pdf", "q_m-TrPXY.pdf"];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/devjobs";
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB");

    // Limpiar datos existentes
    await Usuario.deleteMany({});
    await Vacante.deleteMany({});
    console.log("🗑️ Datos anteriores eliminados");

    // Crear usuarios
    const usuariosCreados = [];
    for (const perfil of perfiles) {
      const password = await bcrypt.hash("password123", 10);
      const usuario = await Usuario.create({
        nombre: perfil.nombre,
        email: perfil.email,
        password,
        imagen: perfil.imagen,
      });
      usuariosCreados.push(usuario);
      console.log(`✅ Usuario creado: ${perfil.email}`);
    }

    // Crear vacantes con candidatos
    let cvIndex = 0;
    for (let i = 0; i < vacantes.length; i++) {
      const vacanteData = vacantes[i];
      const autor = usuariosCreados[i % usuariosCreados.length];
      
      // Agregar 1-2 candidatos random a cada vacante
      const numCandidatos = Math.floor(Math.random() * 2) + 1;
      const candidatos = [];
      for (let j = 0; j < numCandidatos; j++) {
        candidatos.push({
          nombre: `Candidato ${cvIndex + 1}`,
          email: `candidato${cvIndex + 1}@email.com`,
          cv: cvs[cvIndex % cvs.length],
        });
        cvIndex++;
      }

      await Vacante.create({
        ...vacanteData,
        url: `${slug(vacanteData.titulo)}-${shortid.generate()}`,
        candidatos,
        autor: autor._id,
      });
      console.log(`✅ Vacante creada: ${vacanteData.titulo}`);
    }

    console.log("\n🎉 Seed completado exitosamente!");
    console.log(`   - ${usuariosCreados.length} usuarios`);
    console.log(`   - ${vacantes.length} vacantes`);
    console.log("\n📧 Credenciales de prueba:");
    console.log("   juan@devjobs.com / password123");
    console.log("   maria@devjobs.com / password123");
    console.log("   carlos@devjobs.com / password123");
    console.log("   ana@devjobs.com / password123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
}

seed();