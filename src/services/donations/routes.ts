/**
 * @fileoverview Rutas del servicio de donaciones
 * @fileoverview Donations service routes
 * @module services/donations/routes
 */

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import * as donationsController from './controller.js';
import { authenticate, authorize } from '../auth/middleware.js';

/**
 * Crea el router de donaciones
 * @function createDonationsRouter
 * @description Factory function que crea las rutas de donaciones
 * @returns {Router} Router de Express configurado
 */
export function createDonationsRouter(): Router {
  const router = Router();

  /**
   * @swagger
   * /api/donations/plans:
   *   get:
   *     summary: Obtener planes de patrocinio
   *     description: Retorna los planes de donación disponibles
   *     tags:
   *       - Donaciones
   *     responses:
   *       200:
   *         description: Lista de planes
   */
  router.get('/plans', donationsController.getPlans);

  /**
   * @swagger
   * /api/donations:
   *   post:
   *     summary: Crear donación
   *     description: Inicia el proceso de donación
   *     tags:
   *       - Donaciones
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *               - paymentMethod
   *             properties:
   *               amount:
   *                 type: number
   *                 minimum: 1
   *               currency:
   *                 type: string
   *                 default: USD
   *               paymentMethod:
   *                 type: string
   *                 enum: [stripe, paypal]
   *               planId:
   *                 type: string
   *               returnUrl:
   *                 type: string
   *               cancelUrl:
   *                 type: string
   *     responses:
   *       201:
   *         description: Sesión de checkout creada
   */
  router.post(
    '/',
    authenticate,
    [
      body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
      body('currency').optional().isString().default('USD'),
      body('paymentMethod').isIn(['stripe', 'paypal']).withMessage('Invalid payment method'),
      body('planId').optional().isString(),
    ],
    handleValidation,
    donationsController.createDonation
  );

  /**
   * @swagger
   * /api/donations/{donationId}/confirm:
   *   post:
   *     summary: Confirmar donación
   *     description: Confirma una donación después del pago
   *     tags:
   *       - Donaciones
   *     parameters:
   *       - in: path
   *         name: donationId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               transactionId:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       200:
   *         description: Donación confirmada
   */
  router.post('/:donationId/confirm', donationsController.confirmDonation);

  /**
   * @swagger
   * /api/donations/me:
   *   get:
   *     summary: Mis donaciones
   *     description: Retorna las donaciones del usuario actual
   *     tags:
   *       - Donaciones
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de donaciones
   */
  router.get('/me', authenticate, donationsController.getMyDonations);

  /**
   * @swagger
   * /api/donations/stats:
   *   get:
   *     summary: Estadísticas de donaciones
   *     description: Retorna estadísticas de donaciones (admin)
   *     tags:
   *       - Donaciones
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Estadísticas
   */
  router.get('/stats', authenticate, authorize('admin', 'moderator'), donationsController.getStats);

  /**
   * @swagger
   * /api/donations/webhooks/stripe:
   *   post:
   *     summary: Webhook de Stripe
   *     description: Procesa eventos de Stripe
   *     tags:
   *       - Donaciones
   *     responses:
   *       200:
   *         description: Webhook procesado
   */
  router.post('/webhooks/stripe', donationsController.handleStripeWebhook);

  /**
   * @swagger
   * /api/donations/webhooks/paypal:
   *   post:
   *     summary: Webhook de PayPal
   *     description: Procesa eventos de PayPal
   *     tags:
   *       - Donaciones
   *     responses:
   *       200:
   *         description: Webhook procesado
   */
  router.post('/webhooks/paypal', donationsController.handlePayPalWebhook);

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

export default createDonationsRouter;
