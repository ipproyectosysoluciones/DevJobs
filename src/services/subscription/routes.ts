/**
 * @fileoverview Rutas de Suscripciones
 * @fileoverview Subscriptions Routes
 * @module services/subscription/routes
 */

import { Router } from 'express';
import * as subscriptionController from './controller.js';

const router = Router();

/**
 * @route GET /api/subscription/:userId
 * @desc Obtener suscripción por userId
 * @access User/Admin
 */
router.get('/:userId', subscriptionController.getSubscription);

/**
 * @route POST /api/subscription
 * @desc Crear nueva suscripción
 * @access User
 */
router.post('/', subscriptionController.createSubscription);

/**
 * @route PUT /api/subscription/:id
 * @desc Actualizar suscripción
 * @access User/Admin
 */
router.put('/:id', subscriptionController.updateSubscription);

/**
 * @route DELETE /api/subscription/:id
 * @desc Cancelar suscripción
 * @access User/Admin
 */
router.delete('/:id', subscriptionController.cancelSubscription);

/**
 * @route GET /api/subscription/admin/all
 * @desc Obtener todas las suscripciones (admin)
 * @access Admin
 */
router.get('/admin/all', subscriptionController.getAllSubscriptions);

export default router;