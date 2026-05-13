# Roadmap

## Vision
Plataforma DevJobs - Portal de empleo con sistema de roles y permisos robusto.

## Próximas Funcionalidades

### Fase 1: Sistema de Roles (en progreso)
- [x] Modelo Mongoose Role
- [x] Controlador de roles (in-memory)
- [x] API routes básicas
- [ ] Integración con usuario (asignar rol a usuario en DB)
- [ ]迁移 a MongoDB para roles (actual vs in-memory)

### Fase 2: Middleware de Permisos
- [ ] Middleware `verificarPermiso(permiso)` en Express
- [ ] Proteger rutas con permisos específicos
- [ ] Helper `hasPermission(user, permission)` para templates

### Fase 3: Panel de Administración
- [ ] Página para gestionar roles desde UI
- [ ] Asignar/remover roles a usuarios
- [ ] CRUD completo de roles personalizados

### Fase 4: Mejoras Premium
- [ ] Sistema de suscripciones
- [ ] Analíticas por rol
- [ ] Auditoría de cambios de permisos

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