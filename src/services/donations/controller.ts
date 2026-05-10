/**
 * @fileoverview Controlador del servicio de donaciones
 * @fileoverview Donations service controller
 * @module services/donations/controller
 */

import type { Request, Response } from 'express';
import type { 
  Donation, 
  CreateDonationRequest, 
  DonationStats,
  DonationPlan,
  CheckoutResponse 
} from './types.js';

// Base de datos en memoria (en producción, usar MongoDB + Stripe/PayPal)
const donations: Map<string, Donation> = new Map();
const donationPlans: Map<string, DonationPlan> = new Map();

// Inicializar planes de donación
seedDonationPlans();

/**
 * Obtiene los planes de patrocinio disponibles
 * @function getPlans
 * @description Retorna los planes de donación disponibles
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getPlans(req: Request, res: Response): void {
  const activePlans = Array.from(donationPlans.values())
    .filter(plan => plan.isActive)
    .sort((a, b) => a.order - b.order);

  res.json(activePlans);
}

/**
 * Crea una nueva sesión de donación
 * @function createDonation
 * @description Inicia el proceso de donación
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {Promise<void>}
 */
export async function createDonation(req: Request, res: Response): Promise<void> {
  try {
    const donationData = req.body as CreateDonationRequest;
    const user = (req as any).user;

    if (!donationData.amount || donationData.amount <= 0) {
      res.status(400).json({
        error: 'Monto inválido',
        message: 'Invalid amount',
      });
      return;
    }

    const donation: Donation = {
      _id: crypto.randomUUID(),
      donorId: user?.userId || 'anonymous',
      donorName: user?.name || 'Anonymous',
      donorEmail: user?.email || 'anonymous@example.com',
      amount: donationData.amount,
      currency: donationData.currency || 'USD',
      paymentMethod: donationData.paymentMethod,
      status: 'pending',
      planId: donationData.planId,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // En producción, aquí se integraría con Stripe/PayPal
    // Por ahora, simulamos el proceso
    if (donationData.paymentMethod === 'stripe') {
      donation.checkoutUrl = `https://checkout.stripe.com/pay/${donation._id}`;
      donation.transactionId = `stripe_${crypto.randomUUID()}`;
    } else if (donationData.paymentMethod === 'paypal') {
      donation.checkoutUrl = `https://www.paypal.com/checkoutnow?token=${donation._id}`;
      donation.transactionId = `paypal_${crypto.randomUUID()}`;
    }

    donations.set(donation._id, donation);

    const response: CheckoutResponse = {
      sessionId: donation._id,
      checkoutUrl: donation.checkoutUrl || '',
      donationId: donation._id,
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
 * @function confirmDonation
 * @description Confirma una donación después del pago
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function confirmDonation(req: Request, res: Response): void {
  const { donationId } = req.params;
  const { transactionId, status } = req.body;

  const donation = donations.get(donationId);

  if (!donation) {
    res.status(404).json({
      error: 'Donación no encontrada',
      message: 'Donation not found',
    });
    return;
  }

  donation.status = status === 'completed' ? 'completed' : 'failed';
  donation.transactionId = transactionId;
  donation.updatedAt = new Date();

  donations.set(donationId, donation);

  res.json({ message: 'Donación confirmada', donation });
}

/**
 * Obtiene las donaciones del usuario
 * @function getMyDonations
 * @description Retorna las donaciones del usuario actual
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getMyDonations(req: Request, res: Response): void {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({
      error: 'No autenticado',
      message: 'Not authenticated',
    });
    return;
  }

  const userDonations = Array.from(donations.values())
    .filter(d => d.donorId === user.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(userDonations);
}

/**
 * Obtiene estadísticas de donaciones (admin)
 * @function getStats
 * @description Retorna estadísticas de todas las donaciones
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getStats(req: Request, res: Response): void {
  const allDonations = Array.from(donations.values())
    .filter(d => d.status === 'completed');

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

  // Calcular estadísticas
  const totalAmount = allDonations.reduce((sum, d) => sum + d.amount, 0);
  const uniqueDonors = new Set(allDonations.map(d => d.donorId)).size;
  const amounts = allDonations.map(d => d.amount);
  const largestDonation = Math.max(...amounts);
  const smallestDonation = Math.min(...amounts);

  // Obtener top donors
  const donorTotals: Record<string, { name: string; total: number }> = {};
  allDonations.forEach(d => {
    if (!donorTotals[d.donorId]) {
      donorTotals[d.donorId] = { name: d.donorName, total: 0 };
    }
    donorTotals[d.donorId].total += d.amount;
  });

  const topDonors = Object.entries(donorTotals)
    .map(([donorId, data]) => ({
      donorId,
      donorName: data.name,
      totalAmount: data.total,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  // Estadísticas mensuales
  const monthlyMap: Record<string, { total: number; count: number }> = {};
  allDonations.forEach(d => {
    const month = new Date(d.createdAt).toISOString().slice(0, 7);
    if (!monthlyMap[month]) {
      monthlyMap[month] = { total: 0, count: 0 };
    }
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
    uniqueDonors,
    averageDonation: totalAmount / allDonations.length,
    largestDonation,
    smallestDonation,
    monthlyDonations,
    topDonors,
  };

  res.json(stats);
}

/**
 * Procesa webhook de Stripe
 * @function handleStripeWebhook
 * @description Procesa eventos de Stripe
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function handleStripeWebhook(req: Request, res: Response): void {
  const event = req.body;

  // En producción, verificar la firma del webhook
  // const signature = req.headers['stripe-signature'];

  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', event.data.object);
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }

  res.json({ received: true });
}

/**
 * Procesa webhook de PayPal
 * @function handlePayPalWebhook
 * @description Procesa eventos de PayPal
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function handlePayPalWebhook(req: Request, res: Response): void {
  const event = req.body;

  switch (event.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      console.log('Payment completed:', event);
      break;
    case 'PAYMENT.CAPTURE.DENIED':
      console.log('Payment denied:', event);
      break;
    default:
      console.log('Unhandled PayPal event:', event.event_type);
  }

  res.json({ received: true });
}

/**
 * Inicializa planes de donación
 * @function seedDonationPlans
 */
function seedDonationPlans(): void {
  const plans: DonationPlan[] = [
    {
      _id: 'plan_1',
      name: 'Supporter',
      description: 'Apoya el proyecto con una donación mensual',
      price: 5,
      currency: 'USD',
      features: [
        'Badge de supporter en tu perfil',
        'Acceso anticipado a nuevas funcionalidades',
        'Gracias en nuestro README',
      ],
      isActive: true,
      order: 1,
    },
    {
      _id: 'plan_2',
      name: 'Sponsor',
      description: 'Patrocinio mensual para ayudar a mantener el proyecto',
      price: 15,
      currency: 'USD',
      features: [
        'Todas las ventajas de Supporter',
        'Tu logo en el sitio web',
        'Soporte prioritario por email',
        'Invitación al Discord de patrocinadores',
      ],
      isActive: true,
      order: 2,
    },
    {
      _id: 'plan_3',
      name: 'Patron',
      description: 'Patrocinio premium para contribuidores activos',
      price: 50,
      currency: 'USD',
      features: [
        'Todas las ventajas de Sponsor',
        'Tu nombre en los créditos del proyecto',
        'Acceso a funcionalidades beta',
        'Votación en decisiones del roadmap',
        'Sesión mensual de feedback',
      ],
      isActive: true,
      order: 3,
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
