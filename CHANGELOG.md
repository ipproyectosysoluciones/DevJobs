# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-13

### Added
- Sistema de Roles (Roles System)
  - Modelo Mongoose `Role` en `src/models/Role.ts`
  - Controlador de roles en `src/services/roles/controller.ts`
  - API routes para gestión de roles y permisos
  - Rutas endpoints:
    - `GET /api/roles` - Listar roles
    - `GET /api/roles/:name` - Obtener rol por nombre
    - `GET /api/permisos` - Listar permisos
    - `POST /api/roles` - Crear rol (admin)
    - `PUT /api/roles/:name` - Actualizar rol (admin)
    - `DELETE /api/roles/:name` - Eliminar rol (admin)
    - `POST /api/roles/:userId/assign` - Asignar rol a usuario
    - `POST /api/permisos/verificar` - Verificar permisos

### Fixed
- Import de PermissionName en `src/models/Role.ts` (ahora importa desde `services/roles/types.ts`)