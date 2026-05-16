/**
 * @fileoverview Controlador del servicio de donaciones
 * @module services/donations/controller
 */

import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Donation from '../../models/Donation.js';
import type { 
  CreateDonationRequest, 
  DonationStats,
  DonationPlan,
  CheckoutResponse 
} from './types.js';
import type { AuthenticatedRequest } from '../auth/middleware.js';

// Los planes de donación son datos estáticos, se mantienen en memoria
const donationPlans: Map<string, DonationPlan> = new Map();
seedDonationPlans();

/**
 * Obtiene los planes de patrocinio disponibles
 */
export function getPlans(_req: Request, res: Response): void {
  const activePlans = Array.from(donationPlans.values())
    .filter(plan => plan.isActive)
    .sort((a, b) => a.order - b.order);

  res.json(activePlans);
}

/**
 * Crea una nueva sesión de donación
 */
export async function createDonation(req: Request, res: Response): Promise<void> {
  try {
    const donationData = req.body as CreateDonationRequest;
    const user = (req as unknown as AuthenticatedRequest).user;

    if (!donationData.amount || donationData.amount <= 0) {
      res.status(400).json({
        error: 'Monto inválido',
        message: 'Invalid amount',
      });
      return;
    }

    let checkoutUrl = '';
    let transactionId = '';

    if (donationData.paymentMethod === 'stripe') {
      transactionId = `stripe_${new mongoose.Types.ObjectId()}`;
      checkoutUrl = `https://checkout.stripe.com/pay/${transactionId}`;
    } else if (donationData.paymentMethod === 'paypal') {
      transactionId = `paypal_${new mongoose.Types.ObjectId()}`;
      checkoutUrl = `https://www.paypal.com/checkoutnow?token=${transactionId}`;
    }

    const donation = await Donation.create({
      userId: user?.userId || 'anonymous',
      amount: donationData.amount,
      currency: donationData.currency || 'USD',
      paymentMethod: donationData.paymentMethod,
      status: 'pending',
      planId: donationData.planId,
      transactionId,
    });

    const response: CheckoutResponse = {
      sessionId: donation._id.toString(),
      checkoutUrl,
      donationId: donation._id.toString(),
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error en createDonation:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Confirma una donación (webhook del proveedor)
 */
export async function confirmDonation(req: Request, res: Response): Promise<void> {
  try {
    const donationId = req.params.donationId as string;
    const { transactionId, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(donationId)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const donation = await Donation.findById(donationId);

    if (!donation) {
      res.status(404).json({
        error: 'Donación no encontrada',
        message: 'Donation not found',
      });
      return;
    }

    donation.status = status === 'completed' ? 'completed' : 'failed';
    if (transactionId) donation.transactionId = transactionId;
    await donation.save();

    res.json({ message: 'Donación confirmada', donation: donation.toObject() });
  } catch (error) {
    console.error('Error en confirmDonation:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Obtiene las donaciones del usuario
 */
export async function getMyDonations(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;

    if (!user) {
      res.status(401).json({
        error: 'No autenticado',
        message: 'Not authenticated',
      });
      return;
    }

    const userDonations = await Donation.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(userDonations);
  } catch (error) {
    console.error('Error en getMyDonations:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Obtiene estadísticas de donaciones (admin)
 */
export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const allDonations = await Donation.find({ status: 'completed' }).lean();

    if (allDonations.length === 0) {
      res.json({
        totalAmount: 0,
        totalDonations: 0,
        uniqueDonors: 0,
        averageDonation: 0,
        largestDonation: 0,
        smallestDonation: 0,
        monthlyDonations: [],
        topDonors: [],
      });
      return;
    }

    const totalAmount = allDonations.reduce((sum, d) => sum + d.amount, 0);
    const donorIds = [...new Set(allDonations.map(d => d.userId.toString()))];
    const amounts = allDonations.map(d => d.amount);
    const largestDonation = Math.max(...amounts);
    const smallestDonation = Math.min(...amounts);

    const donorTotals: Record<string, number> = {};
    allDonations.forEach(d => {
      const uid = d.userId.toString();
      donorTotals[uid] = (donorTotals[uid] || 0) + d.amount;
    });

    const topDonors = Object.entries(donorTotals)
      .map(([donorId, total]) => ({ donorId, donorName: `User ${donorId.slice(-4)}`, totalAmount: total }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);

    const monthlyMap: Record<string, { total: number; count: number }> = {};
    allDonations.forEach(d => {
      const month = new Date(d.createdAt).toISOString().slice(0, 7);
      if (!monthlyMap[month]) monthlyMap[month] = { total: 0, count: 0 };
      monthlyMap[month].total += d.amount;
      monthlyMap[month].count++;
    });

    const monthlyDonations = Object.entries(monthlyMap)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12);

    const stats: DonationStats = {
      totalAmount,
      totalDonations: allDonations.length,
      uniqueDonors: donorIds.length,
      averageDonation: totalAmount / allDonations.length,
      largestDonation,
      smallestDonation,
      monthlyDonations,
      topDonors,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error en getStats:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Procesa webhook de Stripe
 */
export function handleStripeWebhook(req: Request, res: Response): void {
  const event = req.body;
  switch (event.type) {
    case 'payment_intent.succeeded':
    case 'payment_intent.payment_failed':
      break;
  }
  res.json({ received: true });
}

/**
 * Procesa webhook de PayPal
 */
export function handlePayPalWebhook(_req: Request, res: Response): void {
  res.json({ received: true });
}

function seedDonationPlans(): void {
  const plans: DonationPlan[] = [
    {
      _id: 'plan_1', name: 'Supporter', description: 'Apoya el proyecto con una donación mensual',
      price: 5, currency: 'USD',
      features: ['Badge de supporter', 'Acceso anticipado', 'Gracias en README'],
      isActive: true, order: 1,
    },
    {
      _id: 'plan_2', name: 'Sponsor', description: 'Patrocinio mensual',
      price: 15, currency: 'USD',
      features: ['Todo Supporter', 'Logo en el sitio', 'Soporte prioritario', 'Discord sponsors'],
      isActive: true, order: 2,
    },
    {
      _id: 'plan_3', name: 'Patron', description: 'Patrocinio premium',
      price: 50, currency: 'USD',
      features: ['Todo Sponsor', 'Nombre en créditos', 'Funcionalidades beta', 'Votación roadmap', 'Feedback mensual'],
      isActive: true, order: 3,
    },
  ];
  plans.forEach(plan => donationPlans.set(plan._id, plan));
}

export default {
  getPlans,
  createDonation,
  confirmDonation,
  getMyDonations,
  getStats,
  handleStripeWebhook,
  handlePayPalWebhook,
};
