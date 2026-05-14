/**
 * @fileoverview Modelo de Mongoose para Registro de Auditoría
 * @fileoverview Mongoose model for Audit Logs
 * @module models/AuditLog
 */

import mongoose, { Schema, type Document } from 'mongoose';

/**
 * Tipo de acción de auditoría | Audit action type
 * @typedef {'role_changed' | 'permission_changed' | 'user_created' | 'user_deleted' | 'subscription_changed' | 'login_failed' | 'login_success' | 'password_changed' | 'profile_updated'} AuditAction
 */
export type AuditAction = 
  | 'role_changed' 
  | 'permission_changed' 
  | 'user_created' 
  | 'user_deleted' 
  | 'subscription_changed'
  | 'login_failed'
  | 'login_success'
  | 'password_changed'
  | 'profile_updated';

/**
 * Interfaz del documento de registro de auditoría
 * @interface IAuditLogDocument
 */
export interface IAuditLogDocument extends Document {
  /** Tipo de acción | Action type */
  action: AuditAction;
  /** ID del usuario afectado | Target user ID */
  targetUserId: mongoose.Types.ObjectId;
  /** Nombre del usuario afectado | Target user name */
  targetUserName?: string;
  /** Valor anterior (serializado) | Previous value (serialized) */
  previousValue?: string;
  /** Nuevo valor (serializado) | New value (serialized) */
  newValue?: string;
  /** ID del usuario que realizó la acción | Performed by user ID */
  performedBy: mongoose.Types.ObjectId;
  /** Nombre del usuario que realizó la acción | Performed by user name */
  performedByName?: string;
  /** Dirección IP | IP address */
  ipAddress?: string;
  /** User agent | User agent */
  userAgent?: string;
  /** Descripción adicional | Additional description */
  description?: string;
  /** Marca de tiempo | Timestamp */
  timestamp: Date;
}

/**
 * Esquema de registro de auditoría | Audit log schema
 */
const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    action: {
      type: String,
      enum: [
        'role_changed',
        'permission_changed',
        'user_created',
        'user_deleted',
        'subscription_changed',
        'login_failed',
        'login_success',
        'password_changed',
        'profile_updated',
      ],
      required: true,
      index: true,
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true,
    },
    targetUserName: {
      type: String,
    },
    previousValue: {
      type: String,
    },
    newValue: {
      type: String,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true,
    },
    performedByName: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    description: {
      type: String,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

/**
 * Índices para optimizar queries de auditoría | Indexes for audit query optimization
 */
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ targetUserId: 1, timestamp: -1 });
AuditLogSchema.index({ performedBy: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });

/**
 * Modelo de Registro de Auditoría | Audit Log model
 */
const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

export default AuditLog;