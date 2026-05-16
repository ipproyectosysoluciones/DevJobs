/**
 * @fileoverview Integración de Pagos con Suscripciones
 * @fileoverview Payment Integration with Subscriptions
 * @module services/subscription/paymentIntegration
 */

import type { Request, Response } from 'express';
import Subscription from '../../models/Subscription.js';

/**
 * Webhook de Stripe para suscripciones
 * @route POST /api/subscription/webhook/stripe
 * @access Webhook (external)
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  try {
    const { type, data } = req.body;

    switch (type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleStripeSubscriptionUpdate(data.object);
        break;
      case 'customer.subscription.deleted':
        await handleStripeSubscriptionCancelled(data.object);
        break;
      default:
        console.log(`Unhandled Stripe event: ${type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Sanitiza un valor asegurando que sea un string plano (previene query injection)
 */
function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') return '';
  // Eliminar caracteres que podrían interpretarse como operadores MongoDB ($)
  return value.replace(/^\$/, '').trim();
}

/**
 * Procesar actualización de suscripción Stripe
 */
async function handleStripeSubscriptionUpdate(subscription: {
  id: string;
  customer: string;
  status: string;
  current_period_end: number;
}): Promise<void> {
  const stripeCustomerId = sanitizeString(subscription.customer);
  const endDate = new Date(subscription.current_period_end * 1000);
  
  // Map Stripe status to our status
  let status: 'active' | 'cancelled' | 'expired' = 'active';
  if (subscription.status === 'active') status = 'active';
  else if (subscription.status === 'canceled') status = 'cancelled';

  await Subscription.findOneAndUpdate(
    { stripeCustomerId },
    {
      stripeSubscriptionId: sanitizeString(subscription.id),
      status,
      endDate,
      updatedAt: new Date(),
    }
  );
}

/**
 * Procesar cancelación de suscripción Stripe
 */
async function handleStripeSubscriptionCancelled(subscription: {
  id: string;
  customer: string;
}): Promise<void> {
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: sanitizeString(subscription.id) },
    {
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedAt: new Date(),
    }
  );
}

/**
 * Webhook de PayPal para suscripciones
 * @route POST /api/subscription/webhook/paypal
 * @access Webhook (external)
 */
export async function handlePayPalWebhook(req: Request, res: Response): Promise<void> {
  try {
    const { event_type, resource } = req.body;

    switch (event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.UPDATED':
        await handlePayPalSubscriptionUpdate(resource);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await handlePayPalSubscriptionCancelled(resource);
        break;
      default:
        console.log(`Unhandled PayPal event: ${event_type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling PayPal webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Procesar actualización de suscripción PayPal
 */
async function handlePayPalSubscriptionUpdate(subscription: {
  id: string;
  status: string;
}): Promise<void> {
  let status: 'active' | 'cancelled' | 'expired' = 'active';
  if (subscription.status === 'ACTIVE') status = 'active';
  else if (subscription.status === 'CANCELLED' || subscription.status === 'EXPIRED') status = 'cancelled';

  await Subscription.findOneAndUpdate(
    { paypalSubscriptionId: sanitizeString(subscription.id) },
    {
      status,
      updatedAt: new Date(),
    }
  );
}

/**
 * Procesar cancelación de suscripción PayPal
 */
async function handlePayPalSubscriptionCancelled(subscription: {
  id: string;
}): Promise<void> {
  await Subscription.findOneAndUpdate(
    { paypalSubscriptionId: sanitizeString(subscription.id) },
    {
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedAt: new Date(),
    }
  );
}

export default {
  handleStripeWebhook,
  handlePayPalWebhook,
};