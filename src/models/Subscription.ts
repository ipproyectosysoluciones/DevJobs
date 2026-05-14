/**
 * @fileoverview Modelo de Mongoose para Suscripciones
 * @fileoverview Mongoose model for Subscriptions
 * @module models/Subscription
 */

import mongoose, { Schema, type Document } from 'mongoose';

/**
 * Plan de suscripción | Subscription plan
 * @typedef {'free' | 'basic' | 'premium'} SubscriptionPlan
 */
export type SubscriptionPlan = 'free' | 'basic' | 'premium';

/**
 * Estado de la suscripción | Subscription status
 * @typedef {'active' | 'cancelled' | 'expired' | 'pending'} SubscriptionStatus
 */
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

/**
 * Método de pago | Payment method
 * @typedef {'stripe' | 'paypal'} PaymentMethod
 */
export type PaymentMethod = 'stripe' | 'paypal';

/**
 * Interfaz del documento de suscripción
 * @interface ISubscriptionDocument
 */
export interface ISubscriptionDocument extends Document {
  /** ID del usuario | User ID */
  userId: mongoose.Types.ObjectId;
  /** Plan de suscripción | Subscription plan */
  plan: SubscriptionPlan;
  /** Estado de la suscripción | Subscription status */
  status: SubscriptionStatus;
  /** Fecha de inicio | Start date */
  startDate: Date;
  /** Fecha de fin | End date */
  endDate: Date;
  /** Método de pago | Payment method */
  paymentMethod?: PaymentMethod;
  /** ID de cliente en Stripe | Stripe customer ID */
  stripeCustomerId?: string;
  /** ID de suscripción en Stripe | Stripe subscription ID */
  stripeSubscriptionId?: string;
  /** ID de subscription en PayPal | PayPal subscription ID */
  paypalSubscriptionId?: string;
  /** Fecha de cancelación | Cancellation date */
  cancelledAt?: Date;
  /** Fechas | Dates */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Esquema de suscripción | Subscription schema
 */
const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      required: true,
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'pending'],
      required: true,
      default: 'pending',
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal'],
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true,
    },
    paypalSubscriptionId: {
      type: String,
      sparse: true,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Índices para optimizar queries | Indexes for query optimization
 */
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ endDate: 1 });

/**
 * Modelo de Suscripción | Subscription model
 */
const Subscription = mongoose.model<ISubscriptionDocument>('Subscription', SubscriptionSchema);

export default Subscription;