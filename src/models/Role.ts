/**
 * @fileoverview Modelo de Mongoose para Roles
 * @fileoverview Mongoose model for Roles
 * @module models/Role
 */

import mongoose, { Schema, type Document } from 'mongoose';
import type { RoleName } from '../types/usuario.js';
import type { PermissionName } from '../services/roles/types.js';

/**
 * Interfaz del documento Role
 * @interface IRoleDocument
 */
export interface IRoleDocument extends Document {
  /** Nombre del rol | Role name */
  name: RoleName;
  /** Descripción del rol | Role description */
  description: string;
  /** Permisos del rol | Role permissions */
  permissions: PermissionName[];
  /** Indica si es un rol del sistema | Whether it's a system role */
  isSystemRole: boolean;
  /** Indica si está activo | Whether active */
  isActive: boolean;
  /** Cantidad de usuarios con este rol | User count with this role */
  userCount: number;
  /** Fechas | Dates */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Esquema de Mongoose para Roles
 * @en Mongoose schema for Roles
 */
const roleSchema = new Schema<IRoleDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['admin', 'employer', 'job_seeker', 'premium', 'moderator'],
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    permissions: [{
      type: String,
      enum: [
        // Admin
        '*',
        // Users
        'users:create', 'users:read', 'users:update', 'users:delete', 'users:manage', 'users:ban',
        // Jobs
        'jobs:create', 'jobs:read', 'jobs:update', 'jobs:delete', 'jobs:publish', 'jobs:archive', 'jobs:premium',
        // Applications
        'applications:create', 'applications:read', 'applications:update', 'applications:delete', 'applications:approve', 'applications:reject',
        // Chat
        'chat:create', 'chat:read', 'chat:delete', 'chat:moderate',
        // Donations
        'donations:read', 'donations:manage', 'donations:refund',
        // Analytics
        'analytics:read', 'analytics:export', 'analytics:manage',
        // Admin
        'admin:full', 'admin:settings', 'admin:roles',
        // Content
        'content:create', 'content:read', 'content:update', 'content:delete', 'content:moderate',
      ],
    }],
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Índice para búsquedas rápidas
 * @en Index for fast queries
 */
roleSchema.index({ isActive: 1, isSystemRole: 1 });

/**
 * Modelo de Role
 * @en Role model
 */
const Role = mongoose.model<IRoleDocument>('Role', roleSchema);

export default Role;
