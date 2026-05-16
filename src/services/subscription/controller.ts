/**
 * @fileoverview Controlador de Suscripciones
 * @fileoverview Subscriptions Controller
 * @module services/subscription/controller
 */

import type { Request, Response } from 'express';
import Subscription, { type ISubscriptionDocument } from '../../models/Subscription.js';

/**
 * Obtener suscripción por userId
 * @route GET /api/subscription/:userId
 * @access User/Admin
 */
export async function getSubscription(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    
    const subscriptionQuery = Subscription.findOne({ 
      userId, 
      status: 'active' 
    });
    
    const subscription = await subscriptionQuery.sort({ createdAt: -1 });

    if (!subscription) {
      res.status(404).json({ 
        error: 'No active subscription found',
        message: 'No se encontró suscripción activa'
      });
      return;
    }

    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al obtener suscripción'
    });
  }
}

/**
 * Crear nueva suscripción
 * @route POST /api/subscription
 * @access User
 */
export async function createSubscription(req: Request, res: Response): Promise<void> {
  try {
    const { userId, plan, paymentMethod, stripeCustomerId, endDate } = req.body;

    const subscription = await Subscription.create({
      userId,
      plan: plan || 'free',
      status: 'active',
      startDate: new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentMethod,
      stripeCustomerId,
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al crear suscripción'
    });
  }
}

/**
 * Actualizar suscripción
 * @route PUT /api/subscription/:id
 * @access User/Admin
 */
export async function updateSubscription(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const subscription = await Subscription.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!subscription) {
      res.status(404).json({ 
        error: 'Subscription not found',
        message: 'Suscripción no encontrada'
      });
      return;
    }

    res.json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al actualizar suscripción'
    });
  }
}

/**
 * Cancelar suscripción
 * @route DELETE /api/subscription/:id
 * @access User/Admin
 */
export async function cancelSubscription(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByIdAndUpdate(
      id,
      { 
        status: 'cancelled',
        cancelledAt: new Date()
      },
      { new: true }
    );

    if (!subscription) {
      res.status(404).json({ 
        error: 'Subscription not found',
        message: 'Suscripción no encontrada'
      });
      return;
    }

    res.json({ 
      message: 'Subscription cancelled successfully',
      subscription 
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al cancelar suscripción'
    });
  }
}

/**
 * Obtener todas las suscripciones (admin)
 * @route GET /api/subscription/admin/all
 * @access Admin
 */
export async function getAllSubscriptions(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const subscriptionQuery = Subscription.find();
    
    const subscriptions = await subscriptionQuery
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email nombre');

    const total = await Subscription.countDocuments();

    res.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al obtener suscripciones'
    });
  }
}