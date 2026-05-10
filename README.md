
![DevJobs](https://img.shields.io/badge/DevJobs-Portal%20de%20Empleo-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb)
![Node](https://img.shields.io/badge/Node-25-339933?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

# DevJobs 🚀

**Portal de empleo especializado para desarrolladores | Specialized job portal for developers**

DevJobs conecta reclutadores técnicos con desarrolladores. Publicá vacantes, recibí postulaciones con CV, buscá oportunidades por tecnología — todo en un portal web rápido, moderno y en TypeScript.

DevJobs connects tech recruiters with developers. Post vacancies, receive applications with CVs, search opportunities by technology — all in a fast, modern TypeScript web portal.

---

## Features | Funcionalidades

| ES | EN |
|----|----|
| 📋 Explorar vacantes de trabajo | Browse job vacancies |
| 🔍 Buscar ofertas por palabra clave | Search jobs by keyword |
| 📝 Postularse con envío de CV | Apply with CV upload |
| 🔐 Registro de reclutadores | Recruiter registration |
| 📊 Panel de administración de vacantes | Vacancy management dashboard |
| ✏️ Crear, editar y eliminar vacantes | CRUD operations for vacancies |
| 👥 Ver candidatos por vacante | View applicants per vacancy |
| 🔄 Recuperación de contraseña por email | Password reset via email |
| 👤 Edición de perfil con foto | Profile editing with photo |

---

## Tech Stack | Stack Tecnológico

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | [Node.js](https://nodejs.org/) | 25+ | ESM native, modern JS |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | 6.0 | Strict type safety |
| **Framework** | [Express](https://expressjs.com/) | 5.2 | Minimalist HTTP server |
| **Templates** | [Handlebars](https://handlebarsjs.com/) (express-handlebars) | 9.0 | Server-side rendering |
| **Database** | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | 7 / 9 | Document store |
| **Auth** | [Passport](http://www.passportjs.org/) (local strategy) | 0.7 | Session authentication |
| **Validation** | [express-validator](https://express-validator.github.io/) | 7.3 | Input sanitization |
| **Email** | [Nodemailer](https://nodemailer.com/) | 8.0 | Transactional emails |
| **Build** | [esbuild](https://esbuild.github.io/) | — | Fast bundling |
| **Testing** | [Vitest](https://vitest.dev/) | 4.1 | Unit tests |
| **Linting** | [ESLint](https://eslint.org/) | 10.3 | Flat config, TS rules |
| **Git hooks** | [husky](https://typicode.github.io/husky/) + [commitlint](https://commitlint.js.org/) | 9 / 21 | Conventional commits |
| **Container** | [Docker](https://www.docker.com/) (MongoDB) | 7.0 | Reproducible DB |
| **Package mgr** | [pnpm](https://pnpm.io/) | latest | Fast, disk-efficient |

---

## Project Structure | Estructura del Proyecto

```
devjobs-master/
├── src/
│   ├── config/              # Configuración (DB, Passport, Email)
│   │   ├── db.ts
│   │   ├── passport.ts
│   │   └── email.ts
│   ├── controllers/         # Route handlers
│   │   ├── authController.ts
│   │   ├── homeController.ts
│   │   ├── usuariosController.ts
│   │   └── vacantesController.ts
│   ├── handlers/            # Business logic (email)
│   │   └── email.ts
│   ├── helpers/             # Handlebars view helpers
│   │   └── handlebars.ts
│   ├── models/              # Mongoose schemas & models
│   │   ├── Usuarios.ts
│   │   └── Vacantes.ts
│   ├── public/              # Static assets (CSS, JS, images)
│   ├── routes/              # Express route definitions
│   │   └── index.ts
│   ├── types/               # TypeScript interfaces & types
│   │   ├── usuario.ts
│   │   ├── vacante.ts
│   │   └── express.d.ts
│   ├── views/               # Handlebars templates
│   │   ├── layouts/
│   │   ├── emails/
│   │   ├── home.handlebars
│   │   ├── vacante.handlebars
│   │   ├── administracion.handlebars
│   │   ├── iniciar-sesion.handlebars
│   │   ├── crear-cuenta.handlebars
│   │   ├── reestablecer-password.handlebars
│   │   ├── nuevo-password.handlebars
│   │   ├── editar-perfil.handlebars
│   │   ├── nueva-vacante.handlebars
│   │   ├── editar-vacante.handlebars
│   │   ├── candidatos.handlebars
│   │   └── error.handlebars
│   ├── index.ts             # App entry point
│   └── seed.ts              # Test data seeder
├── tests/
│   └── models.test.ts       # TypeScript type tests
├── dist/                    # Production build output
├── swagger.json             # OpenAPI 3.0 documentation
├── docker-compose.yml       # MongoDB container
├── commitlint.config.cjs    # Commit lint rules
├── eslint.config.js         # ESLint flat config
├── tsconfig.json            # TypeScript config
├── build.mjs                # esbuild build script
└── package.json
```

---

## Prerequisites | Prerrequisitos

- **Node.js** >= 25 (ESM native support)
- **pnpm** >= 9 (`npm i -g pnpm`)
- **Docker** + Docker Compose (for MongoDB)
- **Git**

---

## Quick Start | Inicio Rápido

```bash
# 1. Clone and install
git clone <repo-url>
cd devjobs-master
pnpm install

# 2. Start MongoDB
docker compose up -d

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Seed test data
pnpm seed

# 5. Start development server
pnpm dev
```

Open **http://localhost:3000** in your browser.

---

## Available Commands | Comandos Disponibles

| Command | Description | Descripción (ES) |
|---------|-------------|-------------------|
| `pnpm dev` | Dev server with hot reload | Servidor dev con recarga automática |
| `pnpm start:dev` | Dev server without watch | Servidor dev sin watch |
| `pnpm build` | Production build (esbuild) | Build de producción |
| `pnpm start` | Run production build | Ejecutar build de producción |
| `pnpm test` | Run Vitest tests | Ejecutar tests |
| `pnpm seed` | Seed test data | Sembrar datos de prueba |
| `pnpm commit` | Commit with commitizen | Commit con asistente |
| `pnpm lint` | Lint with ESLint | Lint con ESLint |

---

## Test Credentials | Credenciales de Prueba

| Email | Password | Role |
|-------|----------|------|
| juan@devjobs.com | password123 | Recruiter (Juan Desarrollador) |
| maria@devjobs.com | password123 | Recruiter (María Frontend) |
| carlos@devjobs.com | password123 | Recruiter (Carlos Backend) |
| ana@devjobs.com | password123 | Recruiter (Ana Fullstack) |

---

## Git Workflow | Flujo de Trabajo

```
feat/* ──────▶ dev ──────▶ staging ──────▶ main
     └─ Conventional commits ──▶ husky + commitlint
```

1. Create feature branch from `dev`: `feat/<short-description>`
2. Merge `feat/*` → `dev`
3. Merge `dev` → `staging` (pre-release verification)
4. Merge `staging` → `main` (production release)

**Commit convention**: [Conventional Commits](https://www.conventionalcommits.org/) enforced by husky + commitlint.

---

## API Documentation | Documentación de API

Full OpenAPI 3.0 specification covering all 14 route groups:

- Vacancies CRUD, Search, Detail
- Authentication (register, login, logout)
- Password reset flow (4 endpoints)
- Profile management
- Candidate management

See **[swagger.json](./swagger.json)** for the complete API reference.

---

## Environment Variables | Variables de Entorno

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `MONGODB_URI` | `mongodb://localhost:27017/devjobs` | MongoDB connection |
| `SECRETO` | — | Session secret |
| `KEY` | — | Encryption key |
| `EMAIL_HOST` | `smtp.mailtrap.io` | SMTP host (dev) |
| `EMAIL_PORT` | `2525` | SMTP port |
| `EMAIL_USER` | — | SMTP user |
| `EMAIL_PASS` | — | SMTP password |

---

## License | Licencia

[MIT](./LICENSE) © [Bladimir Gerson Parra Bermudez](mailto:bladi.mir@outlook.com)
