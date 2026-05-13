/**
 * @fileoverview Controlador del servicio de roles
 * @fileoverview Roles service controller
 * @module services/roles/controller
 */

import type { Request, Response } from 'express';
import type { 
  Role, 
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleAssignment,
  PermissionCheckResult,
  RoleName,
  PermissionName,
} from './types.js';

// Base de datos en memoria (en producción, usar MongoDB)
const roles: Map<string, Role> = new Map();
const permissions: Map<string, Permission> = new Map();

// Inicializar roles y permisos
initializeRolesAndPermissions();

/**
 * Obtiene todos los roles
 * @function getRoles
 * @description Retorna lista de roles disponibles
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getRoles(_req: Request, res: Response): void {
  const allRoles = Array.from(roles.values()).filter(r => r.isActive);
  res.json(allRoles);
}

/**
 * Obtiene un rol por nombre
 * @function getRoleByName
 * @description Retorna un rol específico
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getRoleByName(req: Request, res: Response): void {
  const { name } = req.params;
  
  const role = Array.from(roles.values()).find(r => r.name === name);
  
  if (!role) {
    res.status(404).json({
      error: 'Rol no encontrado',
      message: 'Role not found',
    });
    return;
  }

  res.json(role);
}

/**
 * Crea un nuevo rol
 * @function createRole
 * @description Crea un nuevo rol con permisos
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function createRole(req: Request, res: Response): void {
  const roleData = req.body as CreateRoleRequest;
  const user = (req as any).user;

  // Solo admins pueden crear roles
  if (user?.role !== 'admin') {
    res.status(403).json({
      error: 'No autorizado',
      message: 'Only admins can create roles',
    });
    return;
  }

  // Verificar si el rol ya existe
  const existingRole = Array.from(roles.values()).find(r => r.name === roleData.name);
  if (existingRole) {
    res.status(400).json({
      error: 'El rol ya existe',
      message: 'Role already exists',
    });
    return;
  }

  const rolePermissions: Permission[] = roleData.permissions
    .map(p => permissions.get(p))
    .filter((p): p is Permission => p !== undefined);

  const role: Role = {
    _id: crypto.randomUUID(),
    name: roleData.name,
    description: roleData.description,
    permissions: rolePermissions,
    isSystemRole: false,
    isActive: true,
    userCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  roles.set(role._id, role);
  res.status(201).json(role);
}

/**
 * Actualiza un rol
 * @function updateRole
 * @description Actualiza los permisos de un rol
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function updateRole(req: Request, res: Response): void {
  const { name } = req.params;
  const updateData = req.body as UpdateRoleRequest;
  const user = (req as any).user;

  if (user?.role !== 'admin') {
    res.status(403).json({
      error: 'No autorizado',
      message: 'Only admins can update roles',
    });
    return;
  }

  const role = Array.from(roles.values()).find(r => r.name === name);
  
  if (!role) {
    res.status(404).json({
      error: 'Rol no encontrado',
      message: 'Role not found',
    });
    return;
  }

  if (role.isSystemRole) {
    res.status(400).json({
      error: 'No se puede modificar un rol del sistema',
      message: 'Cannot modify system role',
    });
    return;
  }

  // Actualizar permisos si se proporcionan
  if (updateData.permissions) {
    const rolePermissions: Permission[] = updateData.permissions
      .map(p => permissions.get(p))
      .filter((p): p is Permission => p !== undefined);
    role.permissions = rolePermissions;
  }

  if (updateData.description) {
    role.description = updateData.description;
  }

  if (updateData.isActive !== undefined) {
    role.isActive = updateData.isActive;
  }

  role.updatedAt = new Date();
  roles.set(role._id, role);

  res.json(role);
}

/**
 * Elimina un rol
 * @function deleteRole
 * @description Elimina un rol personalizado
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function deleteRole(req: Request, res: Response): void {
  const { name } = req.params;
  const user = (req as any).user;

  if (user?.role !== 'admin') {
    res.status(403).json({
      error: 'No autorizado',
      message: 'Only admins can delete roles',
    });
    return;
  }

  const role = Array.from(roles.values()).find(r => r.name === name);
  
  if (!role) {
    res.status(404).json({
      error: 'Rol no encontrado',
      message: 'Role not found',
    });
    return;
  }

  if (role.isSystemRole) {
    res.status(400).json({
      error: 'No se puede eliminar un rol del sistema',
      message: 'Cannot delete system role',
    });
    return;
  }

  roles.delete(role._id);
  res.json({ message: 'Rol eliminado', roleId: role._id });
}

/**
 * Obtiene todos los permisos
 * @function getPermissions
 * @description Retorna lista de permisos disponibles
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getPermissions(_req: Request, res: Response): void {
  const allPermissions = Array.from(permissions.values());
  res.json(allPermissions);
}

/**
 * Verifica permisos del usuario
 * @function checkPermission
 * @description Verifica si el usuario tiene un permiso específico
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function checkPermission(req: Request, res: Response): void {
  const { permission } = req.body;
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({
      error: 'No autenticado',
      message: 'Not authenticated',
    });
    return;
  }

  const userPermissions = getUserPermissions(user.role);
  
  const hasPermission = userPermissions.includes(permission as PermissionName) || 
                        userPermissions.includes('*' as PermissionName);

  const result: PermissionCheckResult = {
    hasPermission,
    permissions: userPermissions,
    role: user.role,
    missingPermissions: hasPermission ? [] : [permission as PermissionName],
  };

  res.json(result);
}

/**
 * Obtiene los permisos de un usuario según su rol
 * @function getUserPermissions
 * @description Retorna los permisos de un rol
 * @param {RoleName} roleName - Nombre del rol
 * @returns {PermissionName[]} Lista de permisos
 */
function getUserPermissions(roleName: RoleName): PermissionName[] {
  const defaultPermissions: Record<RoleName, PermissionName[]> = {
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

  return defaultPermissions[roleName] || [];
}

/**
 * Asigna un rol a un usuario
 * @function assignRole
 * @description Asigna un rol a un usuario
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function assignRole(req: Request, res: Response): void {
  const userId = req.params.userId as string;
  const { roleName } = req.body;
  const adminUser = (req as any).user;

  if (adminUser?.role !== 'admin') {
    res.status(403).json({
      error: 'No autorizado',
      message: 'Only admins can assign roles',
    });
    return;
  }

  const role = Array.from(roles.values()).find(r => r.name === roleName);
  
  if (!role) {
    res.status(404).json({
      error: 'Rol no encontrado',
      message: 'Role not found',
    });
    return;
  }

  const assignment: RoleAssignment = {
    userId,
    roleName: roleName as RoleName,
    assignedBy: adminUser.userId,
    assignedAt: new Date(),
  };

  // Actualizar contador de usuarios del rol
  role.userCount = (role.userCount ?? 0) + 1;
  roles.set(role._id, role);

  res.status(201).json({
    message: 'Rol asignado correctamente',
    assignment,
  });
}

/**
 * Inicializa roles y permisos del sistema
 * @function initializeRolesAndPermissions
 */
function initializeRolesAndPermissions(): void {
  // Inicializar permisos
  const allPermissions: Permission[] = [
    // Users
    { _id: 'users:create', name: 'users:create', description: 'Crear usuarios', category: 'users', isActive: true },
    { _id: 'users:read', name: 'users:read', description: 'Ver usuarios', category: 'users', isActive: true },
    { _id: 'users:update', name: 'users:update', description: 'Actualizar usuarios', category: 'users', isActive: true },
    { _id: 'users:delete', name: 'users:delete', description: 'Eliminar usuarios', category: 'users', isActive: true },
    { _id: 'users:manage', name: 'users:manage', description: 'Gestionar usuarios', category: 'users', isActive: true },
    { _id: 'users:ban', name: 'users:ban', description: 'Banear usuarios', category: 'users', isActive: true },
    // Jobs
    { _id: 'jobs:create', name: 'jobs:create', description: 'Crear empleos', category: 'jobs', isActive: true },
    { _id: 'jobs:read', name: 'jobs:read', description: 'Ver empleos', category: 'jobs', isActive: true },
    { _id: 'jobs:update', name: 'jobs:update', description: 'Actualizar empleos', category: 'jobs', isActive: true },
    { _id: 'jobs:delete', name: 'jobs:delete', description: 'Eliminar empleos', category: 'jobs', isActive: true },
    { _id: 'jobs:publish', name: 'jobs:publish', description: 'Publicar empleos', category: 'jobs', isActive: true },
    { _id: 'jobs:archive', name: 'jobs:archive', description: 'Archivar empleos', category: 'jobs', isActive: true },
    // Applications
    { _id: 'applications:create', name: 'applications:create', description: 'Crear postulaciones', category: 'applications', isActive: true },
    { _id: 'applications:read', name: 'applications:read', description: 'Ver postulaciones', category: 'applications', isActive: true },
    { _id: 'applications:update', name: 'applications:update', description: 'Actualizar postulaciones', category: 'applications', isActive: true },
    { _id: 'applications:delete', name: 'applications:delete', description: 'Eliminar postulaciones', category: 'applications', isActive: true },
    { _id: 'applications:approve', name: 'applications:approve', description: 'Aprobar postulaciones', category: 'applications', isActive: true },
    { _id: 'applications:reject', name: 'applications:reject', description: 'Rechazar postulaciones', category: 'applications', isActive: true },
    // Chat
    { _id: 'chat:create', name: 'chat:create', description: 'Crear chats', category: 'chat', isActive: true },
    { _id: 'chat:read', name: 'chat:read', description: 'Ver chats', category: 'chat', isActive: true },
    { _id: 'chat:delete', name: 'chat:delete', description: 'Eliminar chats', category: 'chat', isActive: true },
    { _id: 'chat:moderate', name: 'chat:moderate', description: 'Moderar chats', category: 'chat', isActive: true },
    // Donations
    { _id: 'donations:read', name: 'donations:read', description: 'Ver donaciones', category: 'donations', isActive: true },
    { _id: 'donations:manage', name: 'donations:manage', description: 'Gestionar donaciones', category: 'donations', isActive: true },
    { _id: 'donations:refund', name: 'donations:refund', description: 'Reembolsar donaciones', category: 'donations', isActive: true },
    // Analytics
    { _id: 'analytics:read', name: 'analytics:read', description: 'Ver analíticas', category: 'analytics', isActive: true },
    { _id: 'analytics:export', name: 'analytics:export', description: 'Exportar analíticas', category: 'analytics', isActive: true },
    { _id: 'analytics:manage', name: 'analytics:manage', description: 'Gestionar analíticas', category: 'analytics', isActive: true },
    // Admin
    { _id: 'admin:full', name: 'admin:full', description: 'Acceso completo de admin', category: 'admin', isActive: true },
    { _id: 'admin:settings', name: 'admin:settings', description: 'Configuración de admin', category: 'admin', isActive: true },
    { _id: 'admin:roles', name: 'admin:roles', description: 'Gestionar roles', category: 'admin', isActive: true },
    // Content
    { _id: 'content:create', name: 'content:create', description: 'Crear contenido', category: 'content', isActive: true },
    { _id: 'content:read', name: 'content:read', description: 'Ver contenido', category: 'content', isActive: true },
    { _id: 'content:update', name: 'content:update', description: 'Actualizar contenido', category: 'content', isActive: true },
    { _id: 'content:delete', name: 'content:delete', description: 'Eliminar contenido', category: 'content', isActive: true },
    { _id: 'content:moderate', name: 'content:moderate', description: 'Moderar contenido', category: 'content', isActive: true },
  ];

  allPermissions.forEach(p => permissions.set(p.name, p));

  // Inicializar roles del sistema
  const systemRoles: Role[] = [
    {
      _id: 'role_admin',
      name: 'admin',
      description: 'Administrador del sistema con acceso completo',
      permissions: allPermissions,
      isSystemRole: true,
      isActive: true,
      userCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'role_employer',
      name: 'employer',
      description: 'Empleador que puede publicar empleos',
      permissions: allPermissions.filter(p => 
        ['jobs:create', 'jobs:read', 'jobs:update', 'jobs:delete',
        'applications:read', 'applications:update',
        'chat:create', 'chat:read', 'chat:delete',
      ].includes(p.name)
      ),
      isSystemRole: true,
      isActive: true,
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'role_job_seeker',
      name: 'job_seeker',
      description: 'Buscador de empleo',
      permissions: allPermissions.filter(p => 
        ['jobs:read', 'applications:create', 'applications:read', 'chat:create', 'chat:read'].includes(p.name)
      ),
      isSystemRole: true,
      isActive: true,
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'role_premium',
      name: 'premium',
      description: 'Usuario premium con beneficios adicionales',
      permissions: allPermissions.filter(p => 
        ['jobs:read', 'jobs:premium', 'applications:create', 'applications:read', 'chat:create', 'chat:read', 'analytics:read'].includes(p.name)
      ),
      isSystemRole: true,
      isActive: true,
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'role_moderator',
      name: 'moderator',
      description: 'Moderador del sistema',
      permissions: allPermissions.filter(p => 
        ['users:read', 'users:manage', 'jobs:read', 'jobs:archive',
        'applications:read', 'applications:approve', 'applications:reject',
        'chat:read', 'chat:delete', 'chat:moderate', 'content:moderate',
      ].includes(p.name)
      ),
      isSystemRole: true,
      isActive: true,
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  systemRoles.forEach(r => roles.set(r._id, r));
}

export default {
  getRoles,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  checkPermission,
  assignRole,
};
