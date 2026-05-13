/**
 * @fileoverview Controlador del servicio de roles con MongoDB
 * @fileoverview Roles service controller with MongoDB
 * @module services/roles/mongodbController
 */

import type { Request, Response } from 'express';
import type { RoleName, PermissionName } from './types.js';
import Role from '../../models/Role.js';

/**
 * Obtiene todos los roles desde MongoDB
 * @function getRoles
 */
export async function getRoles(req: Request, res: Response): Promise<void> {
  try {
    const allRoles = await Role.find({ isActive: true }).lean();
    res.json(allRoles);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener roles',
      message: 'Error getting roles',
    });
  }
}

/**
 * Obtiene un rol por nombre desde MongoDB
 * @function getRoleByName
 */
export async function getRoleByName(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.params;
    const role = await Role.findOne({ name: name as RoleName, isActive: true }).lean();
    
    if (!role) {
      res.status(404).json({
        error: 'Rol no encontrado',
        message: 'Role not found',
      });
      return;
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener rol',
      message: 'Error getting role',
    });
  }
}

/**
 * Crea un nuevo rol en MongoDB
 * @function createRole
 */
export async function createRole(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, permissions } = req.body;
    const user = (req as any).user;

    // Solo admins pueden crear roles
    if (user?.role !== 'admin') {
      res.status(403).json({
        error: 'No autorizado',
        message: 'Only admins can create roles',
      });
      return;
    }

    const existingRole = await Role.findOne({ name: name as RoleName });
    if (existingRole) {
      res.status(400).json({
        error: 'El rol ya existe',
        message: 'Role already exists',
      });
      return;
    }

    const newRole = await Role.create({
      name,
      description,
      permissions: permissions || [],
      isSystemRole: false,
      isActive: true,
      userCount: 0,
    });

    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({
      error: 'Error al crear rol',
      message: 'Error creating role',
    });
  }
}

/**
 * Actualiza un rol en MongoDB
 * @function updateRole
 */
export async function updateRole(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.params;
    const { description, permissions, isActive } = req.body;
    const user = (req as any).user;

    if (user?.role !== 'admin') {
      res.status(403).json({
        error: 'No autorizado',
        message: 'Only admins can update roles',
      });
      return;
    }

    const role = await Role.findOne({ name: name as RoleName });
    
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

    // Actualizar campos
    if (description) role.description = description;
    if (permissions) role.permissions = permissions;
    if (isActive !== undefined) role.isActive = isActive;

    await role.save();
    res.json(role);
  } catch (error) {
    res.status(500).json({
      error: 'Error al actualizar rol',
      message: 'Error updating role',
    });
  }
}

/**
 * Elimina un rol en MongoDB
 * @function deleteRole
 */
export async function deleteRole(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.params;
    const user = (req as any).user;

    if (user?.role !== 'admin') {
      res.status(403).json({
        error: 'No autorizado',
        message: 'Only admins can delete roles',
      });
      return;
    }

    const role = await Role.findOne({ name: name as RoleName });
    
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

    // Soft delete - marcar como inactivo
    role.isActive = false;
    await role.save();

    res.json({ message: 'Rol eliminado', roleId: role._id });
  } catch (error) {
    res.status(500).json({
      error: 'Error al eliminar rol',
      message: 'Error deleting role',
    });
  }
}

/**
 * Obtiene los permisos de un rol desde MongoDB
 * @function getRolePermissions
 */
export async function getRolePermissions(roleName: string): Promise<PermissionName[]> {
  const role = await Role.findOne({ name: roleName as RoleName, isActive: true }).lean();
  
  if (!role) {
    return [];
  }
  
  return role.permissions as PermissionName[];
}

/**
 * Obtiene todos los permisos disponibles (lista estática)
 * @function getPermissions
 */
export async function getPermissions(_req: Request, res: Response): Promise<void> {
  const allPermissions = [
    // Users
    { name: 'users:create', description: 'Crear usuarios', category: 'users' },
    { name: 'users:read', description: 'Ver usuarios', category: 'users' },
    { name: 'users:update', description: 'Actualizar usuarios', category: 'users' },
    { name: 'users:delete', description: 'Eliminar usuarios', category: 'users' },
    { name: 'users:manage', description: 'Gestionar usuarios', category: 'users' },
    { name: 'users:ban', description: 'Banear usuarios', category: 'users' },
    // Jobs
    { name: 'jobs:create', description: 'Crear empleos', category: 'jobs' },
    { name: 'jobs:read', description: 'Ver empleos', category: 'jobs' },
    { name: 'jobs:update', description: 'Actualizar empleos', category: 'jobs' },
    { name: 'jobs:delete', description: 'Eliminar empleos', category: 'jobs' },
    { name: 'jobs:publish', description: 'Publicar empleos', category: 'jobs' },
    { name: 'jobs:archive', description: 'Archivar empleos', category: 'jobs' },
    { name: 'jobs:premium', description: 'Empleos premium', category: 'jobs' },
    // Applications
    { name: 'applications:create', description: 'Crear postulaciones', category: 'applications' },
    { name: 'applications:read', description: 'Ver postulaciones', category: 'applications' },
    { name: 'applications:update', description: 'Actualizar postulaciones', category: 'applications' },
    { name: 'applications:delete', description: 'Eliminar postulaciones', category: 'applications' },
    { name: 'applications:approve', description: 'Aprobar postulaciones', category: 'applications' },
    { name: 'applications:reject', description: 'Rechazar postulaciones', category: 'applications' },
    // Chat
    { name: 'chat:create', description: 'Crear chats', category: 'chat' },
    { name: 'chat:read', description: 'Ver chats', category: 'chat' },
    { name: 'chat:delete', description: 'Eliminar chats', category: 'chat' },
    { name: 'chat:moderate', description: 'Moderar chats', category: 'chat' },
    // Analytics
    { name: 'analytics:read', description: 'Ver analíticas', category: 'analytics' },
    { name: 'analytics:export', description: 'Exportar analíticas', category: 'analytics' },
    { name: 'analytics:manage', description: 'Gestionar analíticas', category: 'analytics' },
    // Admin
    { name: 'admin:full', description: 'Acceso completo de admin', category: 'admin' },
    { name: 'admin:settings', description: 'Configuración de admin', category: 'admin' },
    { name: 'admin:roles', description: 'Gestionar roles', category: 'admin' },
    // Content
    { name: 'content:create', description: 'Crear contenido', category: 'content' },
    { name: 'content:read', description: 'Ver contenido', category: 'content' },
    { name: 'content:update', description: 'Actualizar contenido', category: 'content' },
    { name: 'content:delete', description: 'Eliminar contenido', category: 'content' },
    { name: 'content:moderate', description: 'Moderar contenido', category: 'content' },
    // Wildcard
    { name: '*', description: 'Acceso completo', category: 'admin' },
  ];
  
  res.json(allPermissions);
}

/**
 * Asigna un rol a un usuario
 * @function assignRole
 */
export async function assignRole(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { roleName } = req.body;
    const adminUser = (req as any).user;

    if (adminUser?.role !== 'admin') {
      res.status(403).json({
        error: 'No autorizado',
        message: 'Only admins can assign roles',
      });
      return;
    }

    const role = await Role.findOne({ name: roleName as RoleName, isActive: true });
    
    if (!role) {
      res.status(404).json({
        error: 'Rol no encontrado',
        message: 'Role not found',
      });
      return;
    }
    
    // Importar modelo de usuario dinámicamente
    const Usuario = (await import('../../models/Usuarios.js')).default;
    const usuario = await Usuario.findById(userId);
    
    if (!usuario) {
      res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'User not found',
      });
      return;
    }

    // Actualizar rol del usuario
    usuario.role = roleName;
    await usuario.save();

    // Incrementar contador del rol
    role.userCount += 1;
    await role.save();

    res.status(201).json({
      message: 'Rol asignado correctamente',
      userId,
      roleName,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al asignar rol',
      message: 'Error assigning role',
    });
  }
}

/**
 * Verifica permisos del usuario actual
 * @function checkPermission
 */
export async function checkPermission(req: Request, res: Response): Promise<void> {
  try {
    const { permission } = req.body;
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        error: 'No autenticado',
        message: 'Not authenticated',
      });
      return;
    }

    const userPermissions = await getRolePermissions(user.role);
    
    const hasPermissionResult = userPermissions.includes(permission as PermissionName) || 
                          userPermissions.includes('*' as PermissionName);

    res.json({
      hasPermission: hasPermissionResult,
      permissions: userPermissions,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al verificar permiso',
      message: 'Error checking permission',
    });
  }
}

/**
 * Inicializa roles del sistema en MongoDB si no existen
 * @function initializeSystemRoles
 */
export async function initializeSystemRoles(): Promise<void> {
  const systemRoles = [
    {
      name: 'admin' as RoleName,
      description: 'Administrador del sistema con acceso completo',
      permissions: ['*'] as PermissionName[],
      isSystemRole: true,
    },
    {
      name: 'employer' as RoleName,
      description: 'Empleador que puede publicar empleos',
      permissions: [
        'jobs:create', 'jobs:read', 'jobs:update', 'jobs:delete',
        'applications:read', 'applications:update',
        'chat:create', 'chat:read', 'chat:delete',
      ] as PermissionName[],
      isSystemRole: true,
    },
    {
      name: 'job_seeker' as RoleName,
      description: 'Buscador de empleo',
      permissions: [
        'jobs:read',
        'applications:create', 'applications:read',
        'chat:create', 'chat:read',
      ] as PermissionName[],
      isSystemRole: true,
    },
    {
      name: 'premium' as RoleName,
      description: 'Usuario premium con beneficios adicionales',
      permissions: [
        'jobs:read', 'jobs:premium',
        'applications:create', 'applications:read',
        'chat:create', 'chat:read',
        'analytics:read',
      ] as PermissionName[],
      isSystemRole: true,
    },
    {
      name: 'moderator' as RoleName,
      description: 'Moderador del sistema',
      permissions: [
        'users:read', 'users:manage',
        'jobs:read', 'jobs:archive',
        'applications:read', 'applications:approve', 'applications:reject',
        'chat:read', 'chat:delete', 'chat:moderate',
        'content:moderate',
      ] as PermissionName[],
      isSystemRole: true,
    },
  ];

  for (const roleData of systemRoles) {
    const existing = await Role.findOne({ name: roleData.name as RoleName });
    
    if (!existing) {
      await Role.create({
        ...roleData,
        isActive: true,
        userCount: 0,
      });
    }
  }
}

export default {
  getRoles,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  initializeSystemRoles,
  getPermissions,
  assignRole,
  checkPermission,
};