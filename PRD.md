# PRD: DevJobs — Portal de Empleo para Desarrolladores

> **Product Requirements Document** v1.0
> **Project**: DevJobs
> **Author**: Bladimir Gerson Parra Bermudez
> **Status**: MVP — Implementado y en producción (dev/staging/main)

---

## 1. Executive Summary | Resumen Ejecutivo

### Problem Statement | Problema

Los desarrolladores (tanto juniors como seniors) pierden tiempo buscando ofertas laborales dispersas en múltiples plataformas no especializadas. Del otro lado, reclutadores técnicos necesitan un canal directo para publicar vacantes y recibir candidaturas sin fricción.

### Proposed Solution | Solución

DevJobs es un portal web especializado que conecta reclutadores con desarrolladores. Ofrece publicación de vacantes con búsqueda por texto, postulación con CV, gestión de candidatos y recuperación de contraseña — todo en una experiencia monolítica pero moderna con TypeScript, Express y MongoDB.

### Success Criteria | Criterios de Éxito

| KPI | Target | Medición |
|-----|--------|----------|
| Tiempo para publicar una vacante | < 2 minutos desde login | Time-to-complete test |
| Búsqueda de vacantes | Resultados en < 200ms | Benchmark de rendering |
| Postulación con CV | < 30 segundos | Test de flujo completo |
| Tests | 100% de los tests existentes pasando | `pnpm test` |
| Build | 0 errores de TypeScript | `pnpm build` |

---

## 2. User Experience & Functionality | Experiencia de Usuario

### 2.1 User Personas | Personas de Usuario

| Persona | Descripción | Objetivo |
|---------|-------------|----------|
| **Dev Explorer** | Desarrollador buscando trabajo | Buscar vacantes, ver detalles, postularse |
| **Tech Recruiter** | Reclutador/CTO publicando ofertas | Crear vacantes, gestionar candidatos |
| **Candidate** | Postulante que envía su CV | Aplicar a vacantes rápidamente |

### 2.2 User Stories | Historias de Usuario

#### Público General | Public Users

- **US-01**: Como visitante, quiero ver todas las vacantes en la home para explorar oportunidades disponibles.
  - **AC**: Muestra lista de vacantes con título, empresa, ubicación y skills.
  - **AC**: La home carga en < 1 segundo.
- **US-02**: Como visitante, quiero buscar vacantes por palabra clave para encontrar ofertas relevantes.
  - **AC**: Búsqueda por texto sobre el título de la vacante.
  - **AC**: Resultados filtrados en tiempo real.
- **US-03**: Como visitante, quiero ver el detalle completo de una vacante para decidir si postularme.
  - **AC**: Muestra título, empresa, ubicación, salario, contrato, descripción, skills.
  - **AC**: Botón para postularse con formulario de CV.
- **US-04**: Como usuario, quiero registrarme con email y contraseña para publicar vacantes.
  - **AC**: Validación de email único.
  - **AC**: Contraseña hasheada con bcrypt (12 rondas).
- **US-05**: Como usuario, quiero iniciar sesión para acceder al panel de administración.
- **US-06**: Como usuario, quiero poder reestablecer mi contraseña si la olvido.
  - **AC**: Envío de token por email.
  - **AC**: Token expira en 1 hora.
  - **AC**: Formulario para nuevo password.

#### Usuarios Autenticados (Reclutadores) | Authenticated Recruiters

- **US-07**: Como reclutador, quiero un panel de administración para ver y gestionar mis vacantes.
  - **AC**: Lista de vacantes propias con acciones (editar/eliminar).
- **US-08**: Como reclutador, quiero crear nuevas vacantes para atraer candidatos.
  - **AC**: Formulario con título, empresa, ubicación, salario, contrato, descripción, skills.
  - **AC**: Validación de campos requeridos.
  - **AC**: URL única generada automáticamente (slug + shortid).
- **US-09**: Como reclutador, quiero editar vacantes existentes para mantener la info actualizada.
- **US-10**: Como reclutador, quiero eliminar vacantes que ya no están vigentes.
- **US-11**: Como reclutador, quiero ver los candidatos que aplicaron a cada vacante.
  - **AC**: Lista con nombre, email y enlace al CV subido.
- **US-12**: Como reclutador, quiero editar mi perfil (incluyendo foto) para que los candidatos me conozcan.
  - **AC**: Subida de imagen de perfil.

#### Postulantes | Applicants

- **US-13**: Como candidato, quiero postularme a una vacante enviando mi CV para ser considerado.
  - **AC**: Formulario con nombre, email y archivo CV.
  - **AC**: Archivo CV subido via multer y almacenado en el servidor.

### 2.3 Non-Goals | Fuera de Alcance

- ❌ Aplicación móvil nativa (el portal es web responsive con Handlebars)
- ❌ Sistema de chat entre reclutador y candidato
- ❌ Pagos ni suscripciones (es gratis)
- ❌ Panel de analytics o estadísticas de vacantes
- ❌ Integración con LinkedIn ni otras plataformas
- ❌ Notificaciones en tiempo real (WebSockets)
- ❌ Roles de usuario más allá de "autenticado / no autenticado"

---

## 3. Technical Specifications | Especificaciones Técnicas

### 3.1 Architecture Overview | Arquitectura

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser   │────▶│  Express 5   │────▶│   MongoDB 7  │
│ (Handlebars)│     │  TypeScript  │     │   (Docker)   │
└─────────────┘     │  ESM / pnpm  │     └──────────────┘
                    │  Passport.js │
                    │  express-    │
                    │  validator   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Mailtrap   │
                    │  (dev email) │
                    └──────────────┘
```

- **Server-side rendering**: Handlebars con layouts y partials
- **Sesiones**: express-session + connect-mongo (persistencia en MongoDB)
- **Auth**: Passport.js con estrategia local
- **Flash messages**: connect-flash para feedback al usuario

### 3.2 Technology Stack | Stack Tecnológico

| Capa | Tecnología | Versión | Razón |
|------|-----------|---------|-------|
| **Runtime** | Node.js | 25+ | ESM nativo, performance |
| **Lenguaje** | TypeScript | 6.0 | Strict mode, types seguros |
| **Framework** | Express | 5.2 | Minimalista, maduro, tipado |
| **Templates** | express-handlebars | 9.0 | SSR simple, helpers custom |
| **DB** | MongoDB + Mongoose | 7 / 9 | Documental, flexible, esquemas |
| **Auth** | Passport (local) | 0.7 | Estrategia local simple |
| **Validación** | express-validator | 7.3 | Schema validation, sanitize |
| **Email** | Nodemailer | 8.0 | Envío de emails programático |
| **Build** | esbuild | — | Build rápido en segundos |
| **Tests** | Vitest | 4.1 | Rápido, compatible Jest |
| **Lint** | ESLint | 10.3 | Flat config, TS rules |
| **Git hooks** | husky + commitlint | 9 / 21 | Conventional commits |
| **Docker** | MongoDB image | 7.0 | Contenedor DB reproducible |

### 3.3 Data Model | Modelo de Datos

```
Usuarios {
  email:    String (unique, lowercase)
  nombre:   String
  password: String (bcrypt hasheado)
  token:    String? (reset password)
  expira:   Date?   (token expiry)
  imagen:   String? (profile pic filename)
}

Vacantes {
  titulo:     String (requerido)
  empresa:    String
  ubicacion:  String (requerido)
  salario:    String?
  contrato:   String?
  descripcion:String?
  url:        String (auto: slug + shortid)
  skills:     String[]
  candidatos: [{ nombre, email, cv }]
  autor:      ObjectId (ref: Usuarios)
}
```

### 3.4 Security & Privacy | Seguridad

- **Passwords**: Hasheados con bcryptjs (12 rondas de salt)
- **Sesiones**: express-session con MongoStore, cookie httpOnly
- **Validación**: express-validator para sanitizar inputs
- **Archivos**: Multer para CV uploads con almacenamiento local
- **Errores**: Middleware centralizado con http-errors
- **Tokens de reset**: UUID + expiración de 1 hora

### 3.5 Test Data | Datos de Prueba

El seed crea:
- 4 usuarios de prueba (password: `password123`):
  - juan@devjobs.com (Juan Desarrollador)
  - maria@devjobs.com (María Frontend)
  - carlos@devjobs.com (Carlos Backend)
  - ana@devjobs.com (Ana Fullstack)
- 6 vacantes con diferentes skills (React, Node.js, DevOps, etc.)
- Candidatos de muestra con CVs vinculados

---

## 4. Risks & Roadmap | Riesgos y Roadmap

### 4.1 Phased Rollout | Roadmap por Fases

| Fase | Estado | Funcionalidades |
|------|--------|-----------------|
| **MVP** ✅ | Completado | CRUD vacantes, auth, búsqueda, postulación, perfil, reset password |
| **v1.1** 🚧 | Preparación | Pruebas E2E con Playwright, CI/CD con GitHub Actions |
| **v1.2** 📋 | Planificado | Internacionalización (i18n), mejora de UX responsive |
| **v2.0** 🔮 | Futuro | API REST pública, versionado, dashboard con analytics |

### 4.2 Technical Risks | Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Escalabilidad MongoDB | Baja | Medio | Índices en campos de búsqueda, `.lean()` en queries read-only |
| Deliverabilidad de emails | Media | Alto | Usar servicio transaccional (SendGrid, SES) en producción |
| Subida de archivos maliciosos | Baja | Alto | Validar tipo MIME y tamaño máximo en multer |
| Sesiones en producción | Media | Medio | Configurar MongoStore con TTL, secrets robustos |
| Breaking changes en Mongoose/Express | Baja | Medio | TypeScript strict, tests, versión fija en package.json |

### 4.3 Known Technical Debt | Deuda Técnica Conocida

- 127 errores de lint preexistentes (reglas `recommended-requiring-type-checking`) — husky hooks non-blocking
- Static `swagger.json` (no autogenerado) — suggestion: implementar con `swagger-autogen` o `@fastify/swagger`
- Las imágenes de perfil y CVs se almacenan localmente (no S3/cloud storage)

---

## 5. Development Setup | Configuración de Desarrollo

### Prerequisites | Prerrequisitos

- **Node.js** >= 25 (ESM nativo requerido)
- **pnpm** >= 9 (`npm i -g pnpm`)
- **Docker** + Docker Compose (para MongoDB)
- **Git**

### Quick Start | Inicio Rápido

```bash
# 1. Clonar e instalar
pnpm install

# 2. Iniciar MongoDB
docker compose up -d

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env según sea necesario

# 4. Sembrar datos de prueba
pnpm seed

# 5. Iniciar servidor de desarrollo
pnpm dev
# Servidor en http://localhost:3000
```

### Available Commands | Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor dev con hot reload |
| `pnpm start:dev` | Servidor dev sin watch |
| `pnpm build` | Build producción con esbuild |
| `pnpm start` | Ejecutar build de producción |
| `pnpm test` | Ejecutar tests (Vitest) |
| `pnpm seed` | Sembrar datos de prueba |
| `pnpm commit` | Commit con commitizen |
| `pnpm lint` | Lint con ESLint |

### Git Workflow | Flujo de Trabajo

```
feat/* ──▶ dev ──▶ staging ──▶ main
```

1. Crear branch desde `dev`: `feat/<nombre>`
2. Merge feat → `dev`
3. Merge `dev` → `staging` (pre-release)
4. Merge `staging` → `main` (producción)

Conventional commits obligatorios via husky + commitlint.

---

## API Documentation | Documentación de API

Ver [`swagger.json`](./swagger.json) — OpenAPI 3.0 con todos los 14 grupos de rutas documentados, incluyendo esquemas de request/response y multipart/form-data para subida de archivos.

---

## License | Licencia

MIT © [Bladimir Gerson Parra Bermudez](mailto:bladi.mir@outlook.com)
