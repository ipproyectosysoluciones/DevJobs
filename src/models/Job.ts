/**
 * @fileoverview Modelo de Mongoose para Empleos (Jobs API)
 * @fileoverview Mongoose model for Jobs (Jobs API)
 * @module models/Job
 */

import mongoose, { Schema, type Document } from 'mongoose';

/**
 * Tipos de empleo | Job types
 */
type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';

/**
 * Estados del empleo | Job status
 */
type JobStatus = 'active' | 'paused' | 'closed';

/**
 * Estados de postulación | Application status
 */
type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected';

/**
 * Interfaz del documento de empleo
 * @interface IJobDocument
 */
export interface IJobDocument extends Document {
  title: string;
  description: string;
  requirements: string[];
  employerId: mongoose.Types.ObjectId;
  location: {
    city: string;
    country: string;
    remote: boolean;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  type: JobType;
  status: JobStatus;
  applications: Array<{
    userId: mongoose.Types.ObjectId;
    status: ApplicationStatus;
    coverLetter: string;
    resume: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Esquema de empleo | Job schema
 */
const JobSchema = new Schema<IJobDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: [String],
      required: true,
    },
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true,
    },
    location: {
      city: { type: String, required: true },
      country: { type: String, required: true },
      remote: { type: Boolean, default: false },
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' },
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'closed'],
      default: 'active',
      index: true,
    },
    applications: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'Usuario' },
        status: {
          type: String,
          enum: ['pending', 'reviewing', 'accepted', 'rejected'],
          default: 'pending',
        },
        coverLetter: { type: String },
        resume: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Índices para optimizar búsquedas
 */
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ title: 'text', description: 'text' });
JobSchema.index({ 'location.city': 1, 'location.country': 1 });
JobSchema.index({ employerId: 1, status: 1 });

/**
 * Modelo de Empleo | Job model
 */
const Job = mongoose.model<IJobDocument>('Job', JobSchema);

export default Job;
export type { JobType, JobStatus, ApplicationStatus };
