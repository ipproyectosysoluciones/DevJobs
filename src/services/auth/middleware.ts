/**
 * @fileoverview Middleware de autenticación para rutas protegidas
 * @fileoverview Authentication middleware for protected routes
 * @module services/auth/middleware
 */

import type { Request, Response, NextFunction } from 'express';
import { getJWTService } from './jwt.js';
import type { TokenPayload, Permission } from '../../types/auth.types';

/**
 * Interfaz extendida de Request para incluir el usuario autenticado
 * @interface AuthenticatedRequest
 * @description Request con datos del usuario autenticado
 */
export interface AuthenticatedRequest extends Request {
  /** Usuario autenticado | Authenticated user */
  user: TokenPayload | null;
}

/**
 * Middleware para verificar autenticación JWT
 * @function authenticate
 * @description Verifica que el token JWT sea válido y attacha el usuario al request
 * @returns {Function} Función middleware de Express
 * 
 * @example
 * router.get('/profile', authenticate, (req, res) => {
 *   res.json({ user: req.user });
 * });
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: 'No se proporcionó token de autenticación',
      message: 'Authorization header missing',
    });
    return;
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    res.status(401).json({
      error: 'Formato de token inválido',
      message: 'Invalid token format. Use: Bearer <token>',
    });
    return;
  }

  const jwtService = getJWTService();
  const result = jwtService.validateToken(token);

  if (!result.valid) {
    res.status(401).json({
      error: 'Token inválido o expirado',
      message: result.error || 'Invalid or expired token',
    });
    return;
  }

  req.user = result.payload;
  next();
}

/**
 * Middleware para verificar roles específicos
 * @function authorize
 * @description Verifica que el usuario tenga el rol requerido
 * @param {string[]} roles - Roles permitidos
 * @returns {Function} Función middleware de Express
 * 
 * @example
 * router.delete('/users/:id', authenticate, authorize(['admin']), deleteUser);
 */
export function authorize(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'No autenticado',
        message: 'Not authenticated',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'No autorizado',
        message: `Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware para verificar permisos específicos
 * @function checkPermission
 * @description Verifica que el usuario tenga el permiso requerido
 * @param {Permission[]} permissions - Permisos requeridos
 * @returns {Function} Función middleware de Express
 * 
 * @example
 * router.post('/jobs', authenticate, checkPermission('jobs:create'), createJob);
 */
export function checkPermission(...permissions: Permission[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'No autenticado',
        message: 'Not authenticated',
      });
      return;
    }

    const hasPermission = permissions.every(permission => 
      req.user?.permissions.includes(permission)
    );

    if (!hasPermission) {
      res.status(403).json({
        error: 'Permisos insuficientes',
        message: `Required permissions: ${permissions.join(', ')}`,
      });
      return;
    }

    next();
  };
}

export default {
  authenticate,
  authorize,
  checkPermission,
};