/**
 * @fileoverview Tipos e interfaces para el sistema de roles
 * @fileoverview Types and interfaces for roles system
 * @module services/roles/types
 */

/**
 * Rol del sistema
 * @interface Role
 */
export interface Role {
  /** ID único | Unique ID */
  _id: string;
  /** Nombre del rol | Role name */
  name: RoleName;
  /** Descripción del rol | Role description */
  description: string;
  /** Permisos del rol | Role permissions */
  permissions: Permission[];
  /** Indica si es un rol del sistema | Whether it's a system role */
  isSystemRole: boolean;
  /** Indica si está activo | Whether active */
  isActive: boolean;
  /** Conteo de usuarios con este rol | User count for this role */
  userCount?: number;
  /** Fecha de creación | Creation date */
  createdAt?: Date;
  /** Fecha de última actualización | Last update date */
  updatedAt?: Date;
}

/**
 * Nombres de roles disponibles
 * @typedef RoleName
 */
export type RoleName = 'admin' | 'employer' | 'job_seeker' | 'premium' | 'moderator';

/**
 * Permiso del sistema
 * @interface Permission
 */
export interface Permission {
  /** ID único | Unique ID */
  _id: string;
  /** Nombre del permiso | Permission name */
  name: PermissionName;
  /** Descripción del permiso | Permission description */
  description: string;
  /** Categoría del permiso | Permission category */
  category: PermissionCategory;
  /** Indica si está activo | Whether active */
  isActive: boolean;
}

/**
 * Categorías de permisos
 * @typedef PermissionCategory
 */
export type PermissionCategory = 
  | 'users' 
  | 'jobs' 
  | 'applications' 
  | 'chat' 
  | 'donations' 
  | 'analytics' 
  | 'admin' 
  | 'content';

/**
 * Nombres de permisos
 * @typedef PermissionName
 */
export type PermissionName = 
  // Admin - Super permissions
  | '*'
  // Users
  | 'users:create'
  | 'users:read'
  | 'users:update'
  | 'users:delete'
  | 'users:manage'
  | 'users:ban'
  // Jobs
  | 'jobs:create'
  | 'jobs:read'
  | 'jobs:update'
  | 'jobs:delete'
  | 'jobs:publish'
  | 'jobs:archive'
  | 'jobs:premium'
  // Applications
  | 'applications:create'
  | 'applications:read'
  | 'applications:update'
  | 'applications:delete'
  | 'applications:approve'
  | 'applications:reject'
  // Chat
  | 'chat:create'
  | 'chat:read'
  | 'chat:delete'
  | 'chat:moderate'
  // Donations
  | 'donations:read'
  | 'donations:manage'
  | 'donations:refund'
  // Analytics
  | 'analytics:read'
  | 'analytics:export'
  | 'analytics:manage'
  // Admin
  | 'admin:full'
  | 'admin:settings'
  | 'admin:roles'
  // Content
  | 'content:create'
  | 'content:read'
  | 'content:update'
  | 'content:delete'
  | 'content:moderate';

/**
 * Asignación de rol a usuario
 * @interface RoleAssignment
 */
export interface RoleAssignment {
  /** ID del usuario | User ID */
  userId: string;
  /** Nombre del rol | Role name */
  roleName: RoleName;
  /** Asignado por | Assigned by */
  assignedBy: string;
  /** Fecha de asignación | Assignment date */
  assignedAt: Date;
}

/**
 * Solicitud de cambio de rol
 * @interface RoleChangeRequest
 */
export interface RoleChangeRequest {
  /** ID del usuario | User ID */
  userId: string;
  /** Nombre del rol actual | Current role name */
  currentRole: RoleName;
  /** Nombre del rol solicitado | Requested role name */
  requestedRole: RoleName;
  /** Razón del cambio | Reason for change */
  reason: string;
  /** Estado de la solicitud | Request status */
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Solicitud de creación de rol
 * @interface CreateRoleRequest
 */
export interface CreateRoleRequest {
  /** Nombre del rol | Role name */
  name: RoleName;
  /** Descripción del rol | Role description */
  description: string;
  /** Lista de nombres de permisos | Permission names list */
  permissions: PermissionName[];
}

/**
 * Solicitud de actualización de rol
 * @interface UpdateRoleRequest
 */
export interface UpdateRoleRequest {
  /** Permisos a actualizar | Permissions to update */
  permissions?: PermissionName[];
  /** Descripción actualizada | Updated description */
  description?: string;
  /** Estado activo/inactivo | Active state */
  isActive?: boolean;
}

/**
 * Resultado de verificación de permisos
 * @interface PermissionCheckResult
 */
export interface PermissionCheckResult {
  /** Tiene el permiso solicitado | Has the requested permission */
  hasPermission: boolean;
  /** Permisos del usuario | User permissions */
  permissions: PermissionName[];
  /** Rol del usuario | User role */
  role: string;
  /** Lista de permisos faltantes | Missing permissions */
  missingPermissions: PermissionName[];
}

/**
 * Configuración de permisos por defecto
 * @interface DefaultPermissions
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, PermissionName[]> = {
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
    'chat:read', 'chat:moderate',
    'content:read', 'content:moderate',
  ],
};

