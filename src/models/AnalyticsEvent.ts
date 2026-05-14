/**
 * @fileoverview Modelo de Mongoose para Eventos de Analítica
 * @fileoverview Mongoose model for Analytics Events
 * @module models/AnalyticsEvent
 */

import mongoose, { Schema, type Document } from 'mongoose';

/**
 * Tipo de evento analítico | Analytics event type
 */
type EventType = 
  | 'view' 
  | 'click' 
  | 'search' 
  | 'apply' 
  | 'publish' 
  | 'download' 
  | 'share' 
  | 'login' 
  | 'register';

/**
 * Tipo de entidad | Entity type
 */
type EntityType = 
  | 'vacante' 
  | 'usuario' 
  | 'busqueda' 
  | 'empresa' 
  | 'candidato';

/**
 * Interfaz del documento de evento analítico
 * @interface IAnalyticsEventDocument
 */
interface IAnalyticsEventDocument extends Document {
  /** ID del usuario (opcional) | User ID (optional) */
  userId?: mongoose.Types.ObjectId;
  /** Tipo de evento | Event type */
  eventType: EventType;
  /** Tipo de entidad | Entity type */
  entityType: EntityType;
  /** ID de la entidad | Entity ID */
  entityId?: string;
  /** Metadata adicional | Additional metadata */
  metadata?: Record<string, unknown>;
  /** IP del cliente | Client IP */
  ipAddress?: string;
  /** User agent del cliente | Client user agent */
  userAgent?: string;
  /** Rol del usuario | User role */
  userRole?: string;
  /** Marca de tiempo | Timestamp */
  timestamp: Date;
}

/**
 * Esquema de evento analítico | Analytics event schema
 */
const AnalyticsEventSchema = new Schema<IAnalyticsEventDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      index: true,
    },
    eventType: {
      type: String,
      enum: ['view', 'click', 'search', 'apply', 'publish', 'download', 'share', 'login', 'register'],
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['vacante', 'usuario', 'busqueda', 'empresa', 'candidato'],
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    userRole: {
      type: String,
      enum: ['admin', 'employer', 'job_seeker', 'premium', 'moderator'],
      index: true,
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
 * Índices para optimizar queries de analítica | Indexes for analytics query optimization
 */
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ userRole: 1, eventType: 1, timestamp: -1 });

/**
 * Modelo de Evento Analítico | Analytics Event model
 */
const AnalyticsEvent = mongoose.model<IAnalyticsEventDocument>('AnalyticsEvent', AnalyticsEventSchema);

export default AnalyticsEvent;
export type { IAnalyticsEventDocument };