/**
 * @fileoverview Controlador de autenticación
 * @fileoverview Authentication controller
 * @module services/auth/controller
 */

import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getJWTService } from './jwt.js';
import type { 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse,
  AuthUser 
} from './types.js';
import type { TokenPayload, Permission } from '../../types/auth.types';

// Simulamos una base de datos de usuarios
// En producción, esto würde von MongoDB komen
const users: Map<string, AuthUser & { password: string }> = new Map();

/**
 * Registra un nuevo usuario en el sistema
 * @function register
 * @description Crea una nueva cuenta de usuario
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {Promise<void>}
 * 
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario en el sistema
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Contraseña del usuario
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               role:
 *                 type: string
 *                 enum: [admin, employer, job_seeker, premium, moderator]
 *                 description: Rol del usuario
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos o usuario ya existe
 *       500:
 *         description: Error interno del servidor
 * 
 * @example_es
 * // Solicitud: POST /api/auth/register
 * // Cuerpo: { email: "usuario@ejemplo.com", password: "miClave123", name: "Juan Pérez", role: "job_seeker" }
 * // Respuesta 201: { token: "jwt.token.here", user: { id: "123", email: "usuario@ejemplo.com", name: "Juan Pérez", role: "job_seeker" } }
 * 
 * @example_en
 * // Request: POST /api/auth/register
 * // Body: { email: "user@example.com", password: "myPassword123", name: "John Doe", role: "job_seeker" }
 * // Response 201: { token: "jwt.token.here", user: { id: "123", email: "user@example.com", name: "John Doe", role: "job_seeker" } }
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, role } = req.body as RegisterRequest;

    // Validar datos requeridos
    if (!email || !password || !name || !role) {
      res.status(400).json({
        error: 'Datos incompletos',
        message: 'Email, password, name and role are required',
      });
      return;
    }

    // Verificar si el usuario ya existe
    if (users.has(email)) {
      res.status(400).json({
        error: 'El usuario ya existe',
        message: 'User already exists',
      });
      return;
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user: AuthUser & { password: string } = {
      id: crypto.randomUUID(),
      email,
      name,
      role,
      isActive: true,
      createdAt: new Date(),
      password: hashedPassword,
    };

    users.set(email, user);

    // Generar token JWT
    const jwtService = getJWTService();
    const token = jwtService.generateToken({
      userId: user.id,
      _id: user.id, // Alias for compatibility
      email: user.email,
      nombre: user.name,
      role: user.role,
      permissions: getPermissionsByRole(user.role),
    });

    // Responder sin la contraseña
    const { password: _, ...userWithoutPassword } = user;

    const response: AuthResponse = {
      token,
      user: userWithoutPassword,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Inicia sesión de usuario
 * @function login
 * @description Autentica a un usuario y retorna token JWT
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {Promise<void>}
 * 
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica a un usuario y retorna token JWT
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 * 
 * @example_es
 * // Solicitud: POST /api/auth/login
 * // Cuerpo: { email: "usuario@ejemplo.com", password: "miClave123" }
 * // Respuesta 200: { token: "jwt.token.here", user: { id: "123", email: "usuario@ejemplo.com", name: "Juan Pérez", role: "job_seeker" } }
 * // Respuesta 401: { error: "Credenciales inválidas", message: "Invalid credentials" }
 * 
 * @example_en
 * // Request: POST /api/auth/login
 // Body: { email: "user@example.com", password: "myPassword123" }
 // Response 200: { token: "jwt.token.here", user: { id: "123", email: "user@example.com", name: "John Doe", role: "job_seeker" } }
 // Response 401: { error: "Invalid credentials", message: "Invalid credentials" }
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validar datos requeridos
    if (!email || !password) {
      res.status(400).json({
        error: 'Datos incompletos',
        message: 'Email and password are required',
      });
      return;
    }

    // Buscar usuario
    const user = users.get(email);
    if (!user) {
      res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Invalid credentials',
      });
      return;
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Invalid credentials',
      });
      return;
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      res.status(401).json({
        error: 'Usuario inactivo',
        message: 'User account is inactive',
      });
      return;
    }

    // Generar token JWT
    const jwtService = getJWTService();
    const token = jwtService.generateToken({
      userId: user.id,
      _id: user.id, // Alias for compatibility
      email: user.email,
      nombre: user.name,
      role: user.role,
      permissions: getPermissionsByRole(user.role),
    });

    // Responder sin la contraseña
    const { password: _, ...userWithoutPassword } = user;

    const response: AuthResponse = {
      token,
      user: userWithoutPassword,
    };

    res.json(response);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Obtiene el perfil del usuario autenticado
 * @function getProfile
 * @description Retorna los datos del usuario actual
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 * 
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil
 *     description: Retorna los datos del usuario autenticado
 *     tags:
 *       - Autenticación
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autenticado
 * 
 * @example_es
 * // Solicitud: GET /api/auth/profile (con header Authorization: Bearer jwt.token)
 * // Respuesta 200: { id: "123", email: "usuario@ejemplo.com", name: "Juan Pérez", role: "job_seeker", isActive: true, createdAt: "2026-05-10T..." }
 * // Respuesta 401: { error: "No autenticado", message: "Not authenticated" }
 * 
 * @example_en
 * // Request: GET /api/auth/profile (with header Authorization: Bearer jwt.token)
 * // Response 200: { id: "123", email: "user@example.com", name: "John Doe", role: "job_seeker", isActive: true, createdAt: "2026-05-10T..." }
 * // Response 401: { error: "Not authenticated", message: "Not authenticated" }
 */
export function getProfile(req: Request, res: Response): void {
  const authUser = (req as any).user;
  
  if (!authUser) {
    res.status(401).json({
      error: 'No autenticado',
      message: 'Not authenticated',
    });
    return;
  }

  const user = users.get(authUser.email);
  if (!user) {
    res.status(404).json({
      error: 'Usuario no encontrado',
      message: 'User not found',
    });
    return;
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
}

/**
 * Obtiene los permisos por defecto según el rol
 * @function getPermissionsByRole
 * @description Retorna los permisos asociados a un rol
 * @param {string} role - Rol del usuario
 * @returns {Permission[]} Array de permisos
 */
function getPermissionsByRole(role: string): Permission[] {
  const rolePermissions: Record<string, Permission[]> = {
    admin: ['*' as Permission],
    employer: [
      'jobs:create' as Permission, 
      'jobs:update' as Permission, 
      'jobs:read' as Permission, 
      'applications:read' as Permission
    ],
    job_seeker: [
      'jobs:read' as Permission, 
      'applications:create' as Permission
    ],
    premium: [
      'jobs:read' as Permission, 
      'jobs:premium' as Permission, 
      'applications:create' as Permission, 
      'analytics:read' as Permission
    ],
    moderator: [
      'users:manage' as Permission, 
      'content:moderate' as Permission, 
      'jobs:read' as Permission, 
      'applications:read' as Permission
    ],
  };

  return rolePermissions[role] || [];
}

export default {
  register,
  login,
  getProfile,
};