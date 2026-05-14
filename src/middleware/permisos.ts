/**
 * @fileoverview Middleware de verificación de permisos
 * @fileoverview Permission verification middleware
 * @module middleware/permisos
 */

import type { Request, Response, NextFunction } from 'express';
import type { PermissionName } from '../services/roles/types.js';
import { getRolePermissions } from '../services/roles/mongodbController.js';

/**
 * Tipos de error de permisos
 * @en Permission error types
 */
export enum PermissionError {
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  MISSING_PERMISSION = 'MISSING_PERMISSION',
}

/**
 * Resultado de verificación de permisos
 * @en Permission verification result
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  error?: PermissionError;
  missingPermission?: PermissionName;
}

/**
 * Mapeo de nombres de roles válidos (para fallback de permisos locales
 * cuando MongoDB no está disponible)
 * @en Mapping of valid role names (for local fallback when MongoDB is unavailable)
 */
const ROLE_PERMISSIONS_FALLBACK: Record<string, PermissionName[]> = {
  admin: ['*'],
  employer: [
    'jobs:create', 'jobs:read', 'jobs:update', 'jobs:delete',
    'applications:read', 'applications:update',
    'chat:create', 'chat:read', 'chat:delete',
  ],
  job_seeker: [
    'jobs:read',
    'applications:create', 'applications:read',
    'chat:create', 'chat:read',
  ],
  premium: [
    'jobs:read', 'jobs:premium',
    'applications:create', 'applications:read',
    'chat:create', 'chat:read',
    'analytics:read',
  ],
  moderator: [
    'users:read', 'users:manage',
    'jobs:read', 'jobs:archive',
    'applications:read', 'applications:approve', 'applications:reject',
    'chat:read', 'chat:delete', 'chat:moderate',
    'content:moderate',
  ],
};

/**
 * Obtiene los permisos de un usuario según su rol (MongoDB como source of truth)
 * @en Get user permissions by role (MongoDB as source of truth)
 * @param {string} roleName - Nombre del rol
 * @returns {Promise<PermissionName[]>} Lista de permisos
 */
export async function getUserPermissions(roleName: string): Promise<PermissionName[]> {
  try {
    const permissions = await getRolePermissions(roleName);
    // Si MongoDB devuelve vacío, usar fallback local
    if (permissions.length > 0) {
      return permissions;
    }
  } catch {
    // En caso de error de conexión, fallback local
  }
  return ROLE_PERMISSIONS_FALLBACK[roleName] || [];
}

/**
 * Verifica si un usuario tiene un permiso específico
 * @en Check if user has a specific permission
 * @param {string} roleName - Rol del usuario
 * @param {PermissionName} permission - Permiso a verificar
 * @returns {Promise<boolean>}
 */
export async function hasPermission(roleName: string, permission: PermissionName): Promise<boolean> {
  const userPermissions = await getUserPermissions(roleName);

  // Admin tiene acceso completo
  if (userPermissions.includes('*' as PermissionName)) {
    return true;
  }

  return userPermissions.includes(permission);
}

/**
 * Middleware para verificar un permiso específico
 * @en Middleware to verify a specific permission
 * @param {PermissionName} requiredPermission - Permiso requerido
 * @returns {Function} Middleware de Express (async, compatible con Express 5)
 */
export function verificarPermiso(requiredPermission: PermissionName) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const userRole = user?.role || 'job_seeker';

    // Verificar autenticación
    if (!user) {
      req.flash('error', 'Debes iniciar sesión | You must be logged in');
      res.redirect('/iniciar-sesion');
      return;
    }

    // Verificar permiso contra MongoDB
    const tienePermiso = await hasPermission(userRole, requiredPermission);

    if (!tienePermiso) {
      req.flash('error', 'No tienes permiso para esta acción | You do not have permission for this action');
      res.status(403).redirect('/administracion');
      return;
    }

    next();
  };
}

/**
 * Middleware para verificar uno de varios permisos
 * @en Middleware to verify one of multiple permissions
 * @param {PermissionName[]} requiredPermissions - Permisos requeridos (cualquiera de ellos)
 * @returns {Function} Middleware de Express (async, compatible con Express 5)
 */
export function verificarCualquierPermiso(requiredPermissions: PermissionName[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const userRole = user?.role || 'job_seeker';

    if (!user) {
      req.flash('error', 'Debes iniciar sesión | You must be logged in');
      res.redirect('/iniciar-sesion');
      return;
    }

    const tieneAlgunPermiso = await Promise.any(
      requiredPermissions.map(perm => hasPermission(userRole, perm))
    );

    if (!tieneAlgunPermiso) {
      req.flash('error', 'No tienes permiso para esta acción | You do not have permission for this action');
      res.status(403).redirect('/administracion');
      return;
    }

    next();
  };
}

/**
 * Middleware para verificar que el usuario es admin
 * @en Middleware to verify user is admin
 * @returns {Function} Middleware de Express (async, compatible con Express 5)
 */
export function soloAdmin() {
  return verificarPermiso('admin:full' as PermissionName);
}

/**
 * Middleware para verificar que el usuario puede gestionar roles
 * @en Middleware to verify user can manage roles
 * @returns {Function} Middleware de Express (async, compatible con Express 5)
 */
export function soloGestorRoles() {
  return verificarPermiso('admin:roles' as PermissionName);
}

export default {
  hasPermission,
  getUserPermissions,
  verificarPermiso,
  verificarCualquierPermiso,
  soloAdmin,
  soloGestorRoles,
  PermissionError,
};