/**
 * @fileoverview Controlador para administración de roles
 * @en Controller for role management
 * @module controllers/adminRolesController
 */

import { Request, Response } from "express";
import Role from "../models/Role.js";
import Usuario from "../models/Usuarios.js";
import type { RoleName } from "../types/usuario.js";
import { sanitizeRoleName, sanitizeNewRoleName } from "../services/roles/mongodbController.js";

/**
 * Panel de administración de roles
 * @en Role management panel
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export const mostrarRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.find({ isActive: true }).lean();
    
    res.render("roles/index", {
      nombrePagina: "Gestión de Roles | Role Management",
      roles,
      mensajes: req.flash('mensaje'),
      errores: req.flash('error'),
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al cargar los roles');
    res.redirect('/administracion');
  }
};

/**
 * Mostrar formulario para crear nuevo rol
 * @en Show form to create new role
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export const formCrearRol = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get permissions structure from first active role
    const sampleRole = await Role.findOne({ isActive: true });
    const todosPermisos = sampleRole ? sampleRole.permissions : [];
    
    res.render("roles/crear", {
      nombrePagina: "Crear Nuevo Rol | Create New Role",
      todosPermisos,
      rol: req.body, // Re-populate form on error
      errores: req.flash('error'),
      mensajes: req.flash('mensaje'),
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al cargar permisos disponibles');
    res.redirect('/admin/roles');
  }
};

/**
 * Crear nuevo rol
 * @en Create new role
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export const crearRol = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, permissions } = req.body;
    
    // Validación básica
    if (!name || !description) {
      req.flash('error', 'El nombre y descripción del rol son requeridos');
      return res.redirect('/admin/roles/crear');
    }

    // Validate role name for new role
    const validatedName = sanitizeNewRoleName(name);
    if (!validatedName) {
      req.flash('error', 'Nombre de rol inválido. Use solo letras, números, guiones (2-30 caracteres)');
      return res.redirect('/admin/roles/crear');
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ name: validatedName });
    if (existingRole) {
      req.flash('error', 'El rol ya existe');
      return res.redirect('/admin/roles/crear');
    }

    // Create new role
    await Role.create({
      name,
      description,
      permissions: permissions || [],
      isSystemRole: false,
      isActive: true,
      userCount: 0,
    });

    req.flash('mensaje', 'Rol creado exitosamente');
    return res.redirect('/admin/roles');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al crear el rol');
    res.redirect('/admin/roles/crear');
  }
};

/**
 * Mostrar formulario para editar rol
 * @en Show form to edit role
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export const formEditarRol = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.params;
    const rol = await Role.findOne({ name: name as unknown as RoleName, isActive: true });
    
    if (!rol) {
      req.flash('error', 'Rol no encontrado');
      return res.redirect('/admin/roles');
    }

    // Get sample permissions for the form (permissions structure)
    const sampleRole = await Role.findOne({ isActive: true });
    const todosPermisos = sampleRole ? sampleRole.permissions : [];
    
    res.render("roles/editar", {
      nombrePagina: `Editar Rol: ${name}`,
      rol,
      todosPermisos,
      errores: req.flash('error'),
      mensajes: req.flash('mensaje'),
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al cargar el rol');
    res.redirect('/admin/roles');
  }
};

/**
 * Actualizar rol
 * @en Update role
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export const actualizarRol = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.params;
  const { description, permissions, isActive } = req.body;
  
  try {
    // Find the role
    const role = await Role.findOne({ name: name as unknown as RoleName });
    if (!role) {
      req.flash('error', 'Rol no encontrado');
      return res.redirect('/admin/roles');
    }
    
    // Prevent modifying system roles
    if (role.isSystemRole) {
      req.flash('error', 'No se puede modificar un rol del sistema');
      return res.redirect(`/admin/roles/editar/${name}`);
    }

    // Update fields
    if (description !== undefined) role.description = description;
    if (permissions !== undefined) role.permissions = permissions;
    if (isActive !== undefined) role.isActive = isActive === 'true'; // Handle string from form
    
    await role.save();
    
    req.flash('mensaje', 'Rol actualizado exitosamente');
    return res.redirect('/admin/roles');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al actualizar el rol');
    return res.redirect(`/admin/roles/editar/${name}`);
  }
};

/**
 * Eliminar rol (soft delete)
 * @en Delete role (soft delete)
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export const eliminarRol = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.params;
  
  try {
    // Find the role
    const role = await Role.findOne({ name: name as unknown as RoleName });
    if (!role) {
      req.flash('error', 'Rol no encontrado');
      return res.redirect('/admin/roles');
    }
    
    // Prevent deleting system roles
    if (role.isSystemRole) {
      req.flash('error', 'No se puede eliminar un rol del sistema');
      return res.redirect('/admin/roles');
    }

    // Soft delete
    role.isActive = false;
    await role.save();
    
    req.flash('mensaje', 'Rol eliminado exitosamente');
    res.redirect('/admin/roles');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al eliminar el rol');
    res.redirect('/admin/roles');
  }
};

/**
 * Mostrar asignación de roles a usuarios
 * @en Show role assignment to users
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export const asignarRol = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await Usuario.findById(userId);
    if (!user) {
      req.flash('error', 'Usuario no encontrado');
      return res.redirect('/administracion');
    }

    const roles = await Role.find({ isActive: true }).lean();
    
    res.render("roles/asignar", {
      nombrePagina: "Asignar Rol | Assign Role",
      userId,
      roles,
      errores: req.flash('error'),
      mensajes: req.flash('mensaje'),
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al cargar roles para asignación');
    res.redirect('/administracion');
  }
};

/**
 * Procesar asignación de rol a usuario
 * @en Process role assignment to user
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export const procesarAsignacion = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { roleName } = req.body;
  
  try {
    // Validate input
    if (!userId || !roleName) {
      req.flash('error', 'Datos incompletos');
      return res.redirect(`/admin/roles/asignar/${userId}`);
    }

    // Find the user
    const user = await Usuario.findById(userId);
    if (!user) {
      req.flash('error', 'Usuario no encontrado');
      return res.redirect(`/admin/roles/asignar/${userId}`);
    }

    // Find the role - validate first
    const validatedRoleName = sanitizeRoleName(roleName);
    if (!validatedRoleName) {
      req.flash('error', 'Nombre de rol inválido');
      return res.redirect(`/admin/roles/asignar/${userId}`);
    }
    
    const role = await Role.findOne({ name: validatedRoleName, isActive: true });
    if (!role) {
      req.flash('error', 'Rol no encontrado');
      return res.redirect(`/admin/roles/asignar/${userId}`);
    }

    // Check if user already has this role
    if (user.role === roleName) {
      req.flash('error', 'El usuario ya tiene este rol asignado');
      return res.redirect(`/admin/roles/asignar/${userId}`);
    }

    // Decrement previous role count if user had a role
    const previousRoleName = user.role;
    if (previousRoleName) {
      const validatedPreviousRole = sanitizeRoleName(previousRoleName);
      if (validatedPreviousRole) {
        const previousRole = await Role.findOne({ name: validatedPreviousRole });
        if (previousRole && previousRole.userCount > 0) {
          previousRole.userCount -= 1;
          await previousRole.save();
        }
      }
    }

    // Assign new role
    user.role = roleName;
    await user.save();

    // Increment new role count
    role.userCount = (role.userCount || 0) + 1;
    await role.save();

    req.flash('mensaje', 'Rol asignado exitosamente');
    res.redirect(`/admin/roles/asignar/${userId}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error al asignar el rol');
    res.redirect(`/admin/roles/asignar/${userId}`);
  }
};

export default {
  mostrarRoles,
  formCrearRol,
  crearRol,
  formEditarRol,
  actualizarRol,
  eliminarRol,
  asignarRol,
  procesarAsignacion,
};