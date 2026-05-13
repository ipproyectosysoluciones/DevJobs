/**
 * @fileoverview Tipos e interfaces para el servicio de autenticación
 * @fileoverview Types and interfaces for authentication service
 * @module services/auth/types
 */

/**
 * Interfaz de datos del usuario autenticado
 * @interface AuthUser
 * @description Interfaz que representa un usuario autenticado en el sistema
 */
export interface AuthUser {
  /** ID único del usuario | User unique identifier */
  id: string;
  /** Correo electrónico del usuario | User email address */
  email: string;
  /** Nombre completo del usuario | User full name */
  name: string;
  /** Rol del usuario en el sistema | User role in the system */
  role: UserRole;
  /** Indica si el usuario está activo | Whether user is active */
  isActive: boolean;
  /** Fecha de creación | Creation date */
  createdAt: Date;
}

/**
 * Roles disponibles en el sistema
 * @typedef {('admin' | 'employer' | 'job_seeker' | 'premium' | 'moderator')} UserRole
 */
export type UserRole = 'admin' | 'employer' | 'job_seeker' | 'premium' | 'moderator';

/**
 * Permisos del sistema
 * @typedef {('jobs:create' | 'jobs:read' | 'jobs:update' | 'jobs:delete' | 'applications:create' | 'applications:read' | 'users:manage' | 'content:moderate' | 'analytics:read' | 'donations:manage')} Permission
 */
export type Permission = 
  | 'jobs:create' 
  | 'jobs:read' 
  | 'jobs:update' 
  | 'jobs:delete' 
  | 'applications:create' 
  | 'applications:read' 
  | 'users:manage' 
  | 'content:moderate' 
  | 'analytics:read' 
  | 'donations:manage';

/**
 * Payload del token JWT
 * @interface TokenPayload
 * @description Payload contenido en el token JWT
 * 
 * @note Este payload es un subconjunto de AuthUser (sin información sensible)
 *       y incluye campos adicionales necesarios para la autorización.
 */
export interface TokenPayload {
  /** ID del usuario | User ID */
  userId: string;
  /** Alias para compatibilidad con Express.User._id | Alias for Express.User._id compatibility */
  _id: string;
  /** Correo electrónico | Email address */
  email: string;
  /** Nombre completo del usuario | User full name */
  nombre: string;
  /** Rol del usuario | User role */
  role: UserRole;
  /** Permisos del usuario | User permissions */
  permissions: Permission[];
  /** Fecha de emisión | Issue date */
  iat: number;
  /** Fecha de expiración | Expiration date */
  exp: number;
}

/**
 * Solicitud de registro de usuario
 * @interface RegisterRequest
 * @description Datos requeridos para registrar un nuevo usuario
 */
export interface RegisterRequest {
  /** Correo electrónico | Email address */
  email: string;
  /** Contraseña del usuario | User password */
  password: string;
  /** Nombre completo | Full name */
  name: string;
  /** Rol del usuario | User role */
  role: UserRole;
}

/**
 * Solicitud de inicio de sesión
 * @interface LoginRequest
 * @description Datos requeridos para iniciar sesión
 */
export interface LoginRequest {
  /** Correo electrónico | Email address */
  email: string;
  /** Contraseña del usuario | User password */
  password: string;
}

/**
 * Respuesta de autenticación
 * @interface AuthResponse
 * @description Respuesta después de una autenticación exitosa
 */
export interface AuthResponse {
  /** Token de acceso JWT | JWT access token */
  token: string;
  /** Datos del usuario | User data */
  user: AuthUser;
  /** Token de refresco | Refresh token */
  refreshToken?: string;
}

/**
 * Configuración de JWT
 * @interface JWTConfig
 * @description Configuración para los tokens JWT
 */
export interface JWTConfig {
  /** Algoritmo de firma | Signing algorithm */
  algorithm: 'RS256' | 'HS256';
  /** Tiempo de expiración | Expiration time (must be string like "24h") */
  expiresIn: string;
  /** Emisor del token | Token issuer */
  issuer: string;
  /** Audiencia del token | Token audience */
  audience: string;
}

/**
 * Resultado de validación de token
 * @interface TokenValidationResult
 * @description Resultado de la validación de un token JWT
 */
export interface TokenValidationResult {
  /** Indica si el token es válido | Whether token is valid */
  valid: boolean;
  /** Datos del payload si es válido | Payload data if valid */
  payload?: TokenPayload;
  /** Mensaje de error si es inválido | Error message if invalid */
  error?: string;
}