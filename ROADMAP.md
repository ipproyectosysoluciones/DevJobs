# Roadmap

## Vision
Plataforma DevJobs - Portal de empleo con sistema de roles y permisos robusto.

## Próximas Funcionalidades

### Fase 1: Sistema de Roles ✅ COMPLETADO (Sprint 2)
- [x] Modelo Mongoose Role
- [x] Controlador de roles (MongoDB)
- [x] API routes básicas
- [x] Integración con usuario (asignar rol a usuario en DB)
- [x] Migración a MongoDB para roles (seed al startup, 19 tests)

### Fase 2: Middleware de Permisos ✅ COMPLETADO (Sprint 3 - WU1)
- [x] Middleware `verificarPermiso(permiso)` en Express (async)
- [x] Proteger rutas con permisos específicos (soloAdmin, soloGestorRoles)
- [x] getRolePermissions() consulta MongoDB como source of truth
- [x] Fallback local ROLE_PERMISSIONS_FALLBACK

### Fase 3: Panel de Administración ✅ COMPLETADO (Sprint 3 - WU2)
- [x] Página para gestionar roles desde UI (/admin/roles)
- [x] Asignar/remover roles a usuarios (/admin/roles/asignar/:userId)
- [x] CRUD completo de roles personalizados (crear/editar/eliminar)
- [x] 53 tests de integración

### Fase 4: Mejoras Premium
- [ ] Sistema de suscripciones
- [ ] Analíticas por rol
- [ ] Auditoría de cambios de permisos

---

## Sprints Completados

### Sprint 1: Strict Sub-checks ✅
- Habilitar todos los strict flags de TypeScript
- PRs: #30 noImplicitAny, #31 strictNullChecks, #32 noUnusedLocals/noUnusedParameters

### Sprint 2: Migración Roles a MongoDB ✅
- Seed system roles al startup
- Fix assignRole con validación y userCount
- 19 tests de integración

### Sprint 3: Middleware Permisos + Panel Admin ✅
- WU1: Middleware async con MongoDB
- WU2: Admin panel routes y vistas
- WU3: Tests (53 total)

---

## Estructura de Permisos

| Rol | Permisos |
|-----|---------|
| `admin` | `*` (todos) |
| `employer` | jobs:create/read/update/delete, applications:read/update, chat:* |
| `job_seeker` | jobs:read, applications:create/read, chat:create/read |
| `premium` | job_seeker + jobs:premium, analytics:read |
| `moderator` | users:read/manage, jobs:archive, applications:approve/reject, chat:moderate, content:moderate |

---

## Stack Tecnológico

- **Backend**: Express + Mongoose (MongoDB)
- **Auth**: Passport.js (local) + JWT
- **Frontend**: EJS templates
- **Testing**: Jest (próximo)