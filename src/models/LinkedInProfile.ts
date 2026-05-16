/**
 * @fileoverview Modelo de Mongoose para Perfiles de LinkedIn
 * @module models/LinkedInProfile
 */

import mongoose, { Schema, type Document } from 'mongoose';

export interface ILinkedInProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  linkedInId: string;
  accessToken: string;
  refreshToken?: string;
  profile: Record<string, unknown>;
  connectedAt: Date;
  lastSyncedAt?: Date;
}

const LinkedInProfileSchema = new Schema<ILinkedInProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      unique: true,
    },
    linkedInId: {
      type: String,
      required: true,
      unique: true,
    },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    profile: { type: Schema.Types.Mixed, default: {} },
    connectedAt: { type: Date, default: Date.now },
    lastSyncedAt: { type: Date },
  },
  { timestamps: false, versionKey: false }
);

const LinkedInProfile = mongoose.model<ILinkedInProfileDocument>(
  'LinkedInProfile',
  LinkedInProfileSchema
);

export default LinkedInProfile;
