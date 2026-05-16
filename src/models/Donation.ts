/**
 * @fileoverview Modelo de Mongoose para Donaciones
 * @module models/Donation
 */

import mongoose, { Schema, type Document } from 'mongoose';

type PaymentMethod = 'stripe' | 'paypal';
type DonationStatus = 'pending' | 'completed' | 'failed';

export interface IDonationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  planId?: string;
  status: DonationStatus;
  transactionId?: string;
  createdAt: Date;
}

const DonationSchema = new Schema<IDonationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'USD' },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal'],
      required: true,
    },
    planId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    transactionId: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

DonationSchema.index({ userId: 1, createdAt: -1 });
DonationSchema.index({ status: 1 });

const Donation = mongoose.model<IDonationDocument>('Donation', DonationSchema);

export default Donation;
