/**
 * @fileoverview Middleware de verificación de permisos
 * @fileoverview Permission verification middleware
 * @module middleware/permisos
 */

import type { Request, Response, NextFunction } from 'express';
import type { PermissionName } from '../services/roles/types.js';

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
 * Mapeo de roles a permisos por defecto
 * @en Default role to permission mapping
 */
const ROLE_PERMISSIONS: Record<string, PermissionName[]> = {
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
 * Obtiene los permisos de un usuario según su rol
 * @en Get user permissions by role
 * @param {string} roleName - Nombre del rol
 * @returns {PermissionName[]} Lista de permisos
 */
export function getUserPermissions(roleName: string): PermissionName[] {
  return ROLE_PERMISSIONS[roleName] || [];
}

/**
 * Verifica si un usuario tiene un permiso específico
 * @en Check if user has a specific permission
 * @param {string} roleName - Rol del usuario
 * @param {PermissionName} permission - Permiso a verificar
 * @returns {boolean}
 */
export function hasPermission(roleName: string, permission: PermissionName): boolean {
  const userPermissions = getUserPermissions(roleName);
  
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
 * @returns {Function} Middleware de Express
 */
export function verificarPermiso(requiredPermission: PermissionName) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user;
    const userRole = user?.role || 'job_seeker';

    // Verificar autenticación
    if (!user) {
      req.flash('error', 'Debes iniciar sesión | You must be logged in');
      res.redirect('/iniciar-sesion');
      return;
    }

    // Verificar permiso
    if (!hasPermission(userRole, requiredPermission)) {
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
 * @returns {Function} Middleware de Express
 */
export function verificarCualquierPermiso(requiredPermissions: PermissionName[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user;
    const userRole = user?.role || 'job_seeker';

    if (!user) {
      req.flash('error', 'Debes iniciar sesión | You must be logged in');
      res.redirect('/iniciar-sesion');
      return;
    }

    const tieneAlgunPermiso = requiredPermissions.some(perm => 
      hasPermission(userRole, perm)
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
 * @returns {Function} Middleware de Express
 */
export function soloAdmin() {
  return verificarPermiso('admin:full' as PermissionName);
}

/**
 * Middleware para verificar que el usuario puede gestionar roles
 * @en Middleware to verify user can manage roles
 * @returns {Function} Middleware de Express
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