/**
 * @fileoverview Rutas de Auditoría
 * @fileoverview Audit Routes
 * @module services/audit/routes
 */

import { Router } from 'express';
import * as auditController from './controller.js';

const router = Router();

/**
 * @route GET /api/audit
 * @desc Obtener logs de auditoría (admin)
 * @access Admin
 */
router.get('/', auditController.getAuditLogs);

/**
 * @route GET /api/audit/user/:userId
 * @desc Obtener historial de auditoría de un usuario
 * @access Admin
 */
router.get('/user/:userId', auditController.getUserAuditHistory);

/**
 * @route POST /api/audit/log
 * @desc Crear log de auditoría (uso interno)
 * @access Internal
 */
router.post('/log', auditController.createAuditLog);

export default router;