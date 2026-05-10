/**
 * @fileoverview Tipos e interfaces para el servicio de donaciones
 * @fileoverview Types and interfaces for donations service
 * @module services/donations/types
 */

/**
 * Donation/Donación
 * @interface Donation
 */
export interface Donation {
  /** ID único | Unique ID */
  _id: string;
  /** ID del donante | Donor ID */
  donorId: string;
  /** Nombre del donante | Donor name */
  donorName: string;
  /** Correo del donante | Donor email */
  donorEmail: string;
  /** Monto donado | Donated amount */
  amount: number;
  /** Moneda | Currency */
  currency: string;
  /** Método de pago | Payment method */
  paymentMethod: PaymentMethod;
  /** Estado de la donación | Donation status */
  status: DonationStatus;
  /** ID del plan de patrocinio | Sponsorship plan ID */
  planId?: string;
  /** ID de transacción del pago | Payment transaction ID */
  transactionId?: string;
  /** ID del pago en el proveedor | Provider payment ID */
  providerPaymentId?: string;
  /** URL de checkout | Checkout URL */
  checkoutUrl?: string;
  /** Metadata adicional | Additional metadata */
  metadata?: Record<string, unknown>;
  /** Fecha de creación | Creation date */
  createdAt: Date;
  /** Fecha de actualización | Update date */
  updatedAt: Date;
}

/**
 * Métodos de pago
 * @typedef {('stripe' | 'paypal')} PaymentMethod
 */
export type PaymentMethod = 'stripe' | 'paypal';

/**
 * Estados de donación
 * @typedef {('pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled')} DonationStatus
 */
export type DonationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

/**
 * Plan de patrocinio
 * @interface DonationPlan
 */
export interface DonationPlan {
  /** ID único | Unique ID */
  _id: string;
  /** Nombre del plan | Plan name */
  name: string;
  /** Descripción | Description */
  description: string;
  /** Precio mensual | Monthly price */
  price: number;
  /** Moneda | Currency */
  currency: string;
  /** Características incluidas | Included features */
  features: string[];
  /** Indica si está activo | Whether active */
  isActive: boolean;
  /** Orden de visualización | Display order */
  order: number;
}

/**
 * Solicitud para crear una donación
 * @interface CreateDonationRequest
 */
export interface CreateDonationRequest {
  /** Monto a donate | Amount to donate */
  amount: number;
  /** Moneda | Currency */
  currency: string;
  /** Método de pago | Payment method */
  paymentMethod: PaymentMethod;
  /** ID del plan (si es suscripción) | Plan ID (if subscription) */
  planId?: string;
  /** URL de retorno | Return URL */
  returnUrl?: string;
  /** URL de cancel | Cancel URL */
  cancelUrl?: string;
}

/**
 * Solicitud de webhook
 * @interface WebhookRequest
 */
export interface WebhookRequest {
  /** Tipo de evento | Event type */
  eventType: string;
  /** Datos del evento | Event data */
  data: Record<string, unknown>;
  /** Firma del webhook | Webhook signature */
  signature?: string;
}

/**
 * Estadísticas de donaciones
 * @interface DonationStats
 */
export interface DonationStats {
  /** Total donado | Total donated */
  totalAmount: number;
  /** Número de donaciones | Number of donations */
  totalDonations: number;
  /** Número de donors únicos | Unique donors count */
  uniqueDonors: number;
  /** Donación promedio | Average donation */
  averageDonation: number;
  /** Mayor donación | Largest donation */
  largestDonation: number;
  /** Donación menor | Smallest donation */
  smallestDonation: number;
  /** Donaciones por mes (últimos 12 meses) | Monthly donations (last 12 months) */
  monthlyDonations: MonthlyStats[];
  /** Top donors | Top donors */
  topDonors: TopDonor[];
}

/**
 * Estadísticas mensuales
 * @interface MonthlyStats
 */
export interface MonthlyStats {
  /** Mes/Año | Month/Year */
  month: string;
  /** Total donado | Total amount */
  total: number;
  /** Número de donaciones | Number of donations */
  count: number;
}

/**
 * Top donante
 * @interface TopDonor
 */
export interface TopDonor {
  /** ID del donante | Donor ID */
  donorId: string;
  /** Nombre del donante | Donor name */
  donorName: string;
  /** Total donado | Total donated */
  totalAmount: number;
}

/**
 * Respuesta de checkout
 * @interface CheckoutResponse
 */
export interface CheckoutResponse {
  /** ID de la sesión de checkout | Checkout session ID */
  sessionId: string;
  /** URL de checkout | Checkout URL */
  checkoutUrl: string;
  /** ID de la donación | Donation ID */
  donationId: string;
}
