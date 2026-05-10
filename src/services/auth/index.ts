/**
 * @fileoverview Índice del servicio de autenticación
 * @fileoverview Authentication service index
 * @module services/auth
 */

// Exportar tipos
export * from './types.js';

// Exportar servicios
export { getJWTService, default as JWTService } from './jwt.js';

// Exportar middleware
export { 
  authenticate, 
  authorize, 
  checkPermission,
  type AuthenticatedRequest 
} from './middleware.js';

// Exportar controlador
export * from './controller.js';

// Exportar rutas
export { createAuthRouter, default as authRoutes } from './routes.js';

/**
 * @fileoverview Este módulo proporciona funcionalidad de autenticación completa
 * @fileoverview This module provides complete authentication functionality
 * 
 * Características | Features:
 * - Registro de usuarios | User registration
 * - Inicio de sesión con JWT | JWT login
 * - Middleware de autenticación | Authentication middleware
 * - Autorización basada en roles | Role-based authorization
 * - Permisos granulares | Granular permissions
 * 
 * @example
 * import { createAuthRouter, authenticate } from './services/auth/index.js';
 * 
 * const router = createAuthRouter();
 * router.get('/protected', authenticate, handler);
 */
