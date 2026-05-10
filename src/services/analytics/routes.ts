/**
 * @fileoverview Rutas del servicio de analíticas
 * @fileoverview Analytics service routes
 * @module services/analytics/routes
 */

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import * as analyticsController from './controller.js';
import { authenticate, authorize } from '../auth/middleware.js';

/**
 * Crea el router de analíticas
 * @function createAnalyticsRouter
 * @description Factory function que crea las rutas de analíticas
 * @returns {Router} Router de Express configurado
 */
export function createAnalyticsRouter(): Router {
  const router = Router();

  /**
   * @swagger
   * /api/analytics/events:
   *   post:
   *     summary: Registrar evento
   *     description: Registra un evento de analítica
   *     tags:
   *       - Analíticas
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - eventType
   *             properties:
   *               eventType:
   *                 type: string
   *                 enum: [page_view, button_click, form_submit, search, job_view, job_apply, user_register, user_login, chat_message, donation, error]
   *               data:
   *                 type: object
   *               metadata:
   *                 type: object
   *     responses:
   *       201:
   *         description: Evento registrado
   */
  router.post(
    '/events',
    authenticate,
    [
      body('eventType').notEmpty().withMessage('Event type is required'),
    ],
    handleValidation,
    analyticsController.trackEvent
  );

  /**
   * @swagger
   * /api/analytics/dashboard:
   *   get:
   *     summary: Métricas del dashboard
   *     description: Retorna métricas para el dashboard
   *     tags:
   *       - Analíticas
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Métricas del dashboard
   */
  router.get('/dashboard', authenticate, analyticsController.getDashboard);

  /**
   * @swagger
   * /api/analytics/users:
   *   get:
   *     summary: Métricas de usuarios
   *     description: Retorna métricas de usuarios
   *     tags:
   *       - Analíticas
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Métricas de usuarios
   */
  router.get('/users', authenticate, authorize('admin', 'moderator'), analyticsController.getUserMetrics);

  /**
   * @swagger
   * /api/analytics/jobs:
   *   get:
   *     summary: Métricas de empleos
   *     description: Retorna métricas de empleos
   *     tags:
   *       - Analíticas
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Métricas de empleos
   */
  router.get('/jobs', authenticate, authorize('admin', 'moderator'), analyticsController.getJobMetrics);

  /**
   * @swagger
   * /api/analytics/trends:
   *   get:
   *     summary: Tendencias de visitas
   *     description: Retorna tendencias de visitas
   *     tags:
   *       - Analíticas
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: days
   *         schema:
   *           type: integer
   *           default: 30
   *     responses:
   *       200:
   *         description: Tendencias de visitas
   */
  router.get('/trends', authenticate, analyticsController.getVisitTrends);

  /**
   * @swagger
   * /api/analytics/report:
   *   get:
   *     summary: Reporte de analíticas
   *     description: Retorna un reporte completo de analíticas
   *     tags:
   *       - Analíticas
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: start
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: end
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         description: Reporte de analíticas
   */
  router.get('/report', authenticate, authorize('admin', 'moderator'), analyticsController.getReport);

  /**
   * @swagger
   * /api/analytics/events/recent:
   *   get:
   *     summary: Eventos recientes
   *     description: Retorna eventos recientes
   *     tags:
   *       - Analíticas
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *     responses:
   *       200:
   *         description: Lista de eventos recientes
   */
  router.get('/events/recent', authenticate, authorize('admin'), analyticsController.getRecentEvents);

  return router;
}

/**
 * Middleware para manejar errores de validación
 * @function handleValidation
 */
function handleValidation(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Error de validación',
      details: errors.array(),
    });
    return;
  }
  next();
}

export default createAnalyticsRouter;
