/**
 * @fileoverview Middleware de Auditoría
 * @fileoverview Audit Middleware
 * @module middleware/auditMiddleware
 */

import type { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog.js';

/**
 * Acción de auditoría | Audit action type
 */
type AuditAction = 
  | 'role_changed' 
  | 'permission_changed' 
  | 'user_created' 
  | 'user_deleted' 
  | 'subscription_changed'
  | 'login_failed'
  | 'login_success'
  | 'password_changed'
  | 'profile_updated';

/**
 * Opciones del middleware | Middleware options
 */
interface AuditOptions {
  action: AuditAction;
  getTargetUserId?: (req: Request) => string | undefined;
  getTargetUserName?: (req: Request) => string | undefined;
  getPreviousValue?: (req: Request) => string | undefined;
  getNewValue?: (req: Request) => string | undefined;
  getDescription?: (req: Request) => string | undefined;
}

/**
 * Crear middleware de auditoría
 * @description Middleware para registrar automáticamente acciones en el log de auditoría
 * @en Middleware to automatically log actions to audit trail
 * @param {AuditOptions} options - Opciones de configuración
 */
export function auditMiddleware(options: AuditOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Solo ejecutar después de que la acción principal succeeded
    // Usamos afterware pattern: ejecutar después del handler
    const originalSend = res.send;
    
    res.send = function(body?: unknown): Response {
      // Solo registrar si fue exitoso (2xx)
      const statusCode = res.statusCode;
      if (statusCode >= 200 && statusCode < 300) {
        registrarAuditoria(req, options);
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}

/**
 * Registrar auditoría | Log audit entry
 */
async function registrarAuditoria(req: Request, options: AuditOptions): Promise<void> {
  try {
    const performedBy = (req as Request & { user?: { _id?: string; nombre?: string } }).user?._id;
    const performedByName = (req as Request & { user?: { _id?: string; nombre?: string } }).user?.nombre;
    
    if (!performedBy) return; // No registrar si no hay usuario

    const targetUserId = options.getTargetUserId?.(req);
    if (!targetUserId) return; // No registrar si no hay usuario objetivo

    await AuditLog.create({
      action: options.action,
      targetUserId,
      targetUserName: options.getTargetUserName?.(req),
      previousValue: options.getPreviousValue?.(req),
      newValue: options.getNewValue?.(req),
      performedBy: performedBy as string,
      performedByName,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('User-Agent'),
      description: options.getDescription?.(req),
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // No fallar la request por error de auditoría
  }
}

/**
 * Middleware predefinido para cambio de rol
 * @en Predefined middleware for role change
 */
export function auditRoleChange() {
  return auditMiddleware({
    action: 'role_changed',
    getTargetUserId: (req) => req.params.userId || req.body.userId,
    getTargetUserName: (req) => req.body.userName,
    getPreviousValue: (req) => req.body.previousRole,
    getNewValue: (req) => req.body.newRole,
    getDescription: (req) => `Role changed from ${req.body.previousRole} to ${req.body.newRole}`,
  });
}

/**
 * Middleware predefinido para cambio de suscripción
 * @en Predefined middleware for subscription change
 */
export function auditSubscriptionChange() {
  return auditMiddleware({
    action: 'subscription_changed',
    getTargetUserId: (req) => req.params.userId || req.body.userId,
    getPreviousValue: (req) => req.body.previousPlan,
    getNewValue: (req) => req.body.newPlan,
    getDescription: (req) => `Subscription changed from ${req.body.previousPlan} to ${req.body.newPlan}`,
  });
}

export default {
  auditMiddleware,
  auditRoleChange,
  auditSubscriptionChange,
};