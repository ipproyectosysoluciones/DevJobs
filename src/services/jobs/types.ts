/**
 * @fileoverview Tipos e interfaces para el servicio de empleos
 * @fileoverview Types and interfaces for jobs service
 * @module services/jobs/types
 */

/**
 * Ubicación del empleo
 * @interface JobLocation
 */
export interface JobLocation {
  /** Ciudad | City */
  city: string;
  /** País | Country */
  country: string;
  /** Indica si es remoto | Whether remote */
  remote: boolean;
}

/**
 * Salario del empleo
 * @interface JobSalary
 */
export interface JobSalary {
  /** Salario mínimo | Minimum salary */
  min: number;
  /** Salario máximo | Maximum salary */
  max: number;
  /** Moneda | Currency */
  currency: string;
}

/**
 * Solicitud de empleo
 * @interface JobApplication
 */
export interface JobApplication {
  /** ID del aplicante | Applicant ID */
  userId: string;
  /** Estado de la postulación | Application status */
  status: ApplicationStatus;
  /** Carta de presentación | Cover letter */
  coverLetter: string;
  /** CV del candidato | Candidate CV */
  resume: string;
  /** Fecha de postulación | Application date */
  createdAt: Date;
}

/**
 * Estados de postulación
 * @typedef {('pending' | 'reviewing' | 'accepted' | 'rejected')} ApplicationStatus
 */
export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected';

/**
 * Empleo/Vacante
 * @interface Job
 */
export interface Job {
  /** ID único | Unique ID */
  _id: string;
  /** Título del empleo | Job title */
  title: string;
  /** Descripción del empleo | Job description */
  description: string;
  /** Requisitos del empleo | Job requirements */
  requirements: string[];
  /** ID del empleador | Employer ID */
  employerId: string;
  /** Ubicación | Location */
  location: JobLocation;
  /** Salario | Salary */
  salary?: JobSalary;
  /** Tipo de empleo | Job type */
  type: JobType;
  /** Estado del empleo | Job status */
  status: JobStatus;
  /** Postulaciones | Applications */
  applications: JobApplication[];
  /** Fecha de creación | Creation date */
  createdAt: Date;
  /** Fecha de actualización | Update date */
  updatedAt: Date;
}

/**
 * Tipos de empleo
 * @typedef {('full-time' | 'part-time' | 'contract' | 'internship' | 'freelance')} JobType
 */
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';

/**
 * Estados del empleo
 * @typedef {('active' | 'paused' | 'closed')} JobStatus
 */
export type JobStatus = 'active' | 'paused' | 'closed';

/**
 * Solicitud para crear un empleo
 * @interface CreateJobRequest
 */
export interface CreateJobRequest {
  /** Título | Title */
  title: string;
  /** Descripción | Description */
  description: string;
  /** Requisitos | Requirements */
  requirements: string[];
  /** Ubicación | Location */
  location: JobLocation;
  /** Salario (opcional) | Salary (optional) */
  salary?: JobSalary;
  /** Tipo de empleo | Job type */
  type: JobType;
}

/**
 * Solicitud para aplicar a un empleo
 * @interface ApplyJobRequest
 */
export interface ApplyJobRequest {
  /** Carta de presentación | Cover letter */
  coverLetter: string;
  /** URL del CV | CV URL */
  resume: string;
}

/**
 * Filtros para búsqueda de empleos
 * @interface JobFilters
 */
export interface JobFilters {
  /** Texto de búsqueda | Search text */
  search?: string;
  /** Ciudad | City */
  city?: string;
  /** País | Country */
  country?: string;
  /** Solo remotos | Remote only */
  remote?: boolean;
  /** Tipo de empleo | Job type */
  type?: JobType;
  /** Salario mínimo | Minimum salary */
  minSalary?: number;
  /** Estado | Status */
  status?: JobStatus;
}

/**
 * Respuesta paginada de empleos
 * @interface JobsResponse
 */
export interface JobsResponse {
  /** Lista de empleos | Jobs list */
  jobs: Job[];
  /** Total de empleos | Total jobs */
  total: number;
  /** Página actual | Current page */
  page: number;
  /** Límite por página | Limit per page */
  limit: number;
  /** Total de páginas | Total pages */
  totalPages: number;
}

/**
 * Respuesta de postulación
 * @interface ApplicationResponse
 */
export interface ApplicationResponse {
  /** ID del empleo | Job ID */
  jobId: string;
  /** ID del aplicante | Applicant ID */
  userId: string;
  /** Estado | Status */
  status: ApplicationStatus;
  /** Fecha de creación | Creation date */
  createdAt: Date;
}
