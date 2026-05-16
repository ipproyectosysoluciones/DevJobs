/**
 * @fileoverview Controlador de Auditoría
 * @fileoverview Audit Controller
 * @module services/audit/controller
 */

import type { Request, Response } from 'express';
import AuditLog from '../../models/AuditLog.js';

/**
 * Validar action de auditoría
 */
function isValidAuditAction(action: string): boolean {
  const validActions = ['role_changed', 'permission_changed', 'user_created', 'user_deleted', 'subscription_changed', 'login_failed', 'login_success', 'password_changed', 'profile_updated'];
  return validActions.includes(action);
}

/**
 * Obtener logs de auditoría (admin)
 * @route GET /api/audit
 * @access Admin
 */
export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.min(Math.max(parseInt(req.query.page as string) || 1, 1), 100);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 100);
    const skip = (page - 1) * limit;

    let { action, targetUserId, startDate, endDate } = req.query;

    // Sanitizar action - solo permitir valores válidos
    if (action && typeof action === 'string' && !isValidAuditAction(action)) {
      action = undefined;
    }

    // Sanitizar targetUserId - validar formato ObjectId
    if (targetUserId && typeof targetUserId === 'string') {
      const objectIdRegex = /^[a-fA-F0-9]{24}$/;
      if (!objectIdRegex.test(targetUserId)) {
        targetUserId = undefined;
      }
    }

    const filter: Record<string, unknown> = {};
    if (action) filter.action = action;
    if (targetUserId) filter.targetUserId = targetUserId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) (filter.timestamp as Record<string, Date>).$gte = new Date(startDate as string);
      if (endDate) (filter.timestamp as Record<string, Date>).$lte = new Date(endDate as string);
    }

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('targetUserId', 'email nombre')
      .populate('performedBy', 'email nombre');

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al obtener logs de auditoría'
    });
  }
}

/**
 * Obtener historial de auditoría de un usuario
 * @route GET /api/audit/user/:userId
 * @access Admin
 */
export async function getUserAuditHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;
    // Validar userId como ObjectId de MongoDB
    const OBJECTID_REGEX = /^[a-f0-9]{24}$/i;
    if (!OBJECTID_REGEX.test(userId)) {
      res.status(400).json({ error: 'Invalid user ID format' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find({ targetUserId: userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('performedBy', 'email nombre');

    const total = await AuditLog.countDocuments({ targetUserId: userId });

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user audit history:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al obtener historial de auditoría'
    });
  }
}

/**
 * Crear log de auditoría (para uso interno/middleware)
 * @route POST /api/audit/log
 * @access Internal
 */
export async function createAuditLog(req: Request, res: Response): Promise<void> {
  try {
    const {
      action,
      targetUserId,
      targetUserName,
      previousValue,
      newValue,
      performedBy,
      performedByName,
      description,
    } = req.body;

    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    const log = await AuditLog.create({
      action,
      targetUserId,
      targetUserName,
      previousValue,
      newValue,
      performedBy,
      performedByName,
      ipAddress,
      userAgent,
      description,
      timestamp: new Date(),
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al crear log de auditoría'
    });
  }
}