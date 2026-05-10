/**
 * @fileoverview Tipos e interfaces para el servicio de analíticas
 * @fileoverview Types and interfaces for analytics service
 * @module services/analytics/types
 */

/**
 * Evento de analítica
 * @interface AnalyticsEvent
 */
export interface AnalyticsEvent {
  /** ID único | Unique ID */
  _id: string;
  /** ID del usuario (si autenticado) | User ID (if authenticated) */
  userId?: string;
  /** Tipo de evento | Event type */
  eventType: string;
  /** Datos del evento | Event data */
  data: Record<string, unknown>;
  /** Metadata adicional | Additional metadata */
  metadata?: Record<string, unknown>;
  /** Dirección IP | IP address */
  ipAddress?: string;
  /** Agente de usuario | User agent */
  userAgent?: string;
  /** Fecha del evento | Event timestamp */
  timestamp: Date;
}

/**
 * Tipos de eventos
 * @typedef EventType
 */
export type EventType = 
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'search'
  | 'job_view'
  | 'job_apply'
  | 'user_register'
  | 'user_login'
  | 'chat_message'
  | 'donation'
  | 'error';

/**
 * Métricas del dashboard
 * @interface DashboardMetrics
 */
export interface DashboardMetrics {
  /** Usuarios totales | Total users */
  totalUsers: number;
  /** Usuarios nuevos hoy | New users today */
  newUsersToday: number;
  /** Empleos publicados | Jobs posted */
  totalJobs: number;
  /** Empleos activos | Active jobs */
  activeJobs: number;
  /** Postulaciones totales | Total applications */
  totalApplications: number;
  /** Postulaciones hoy | Applications today */
  applicationsToday: number;
  /** Visitas totales | Total visits */
  totalVisits: number;
  /** Visitas hoy | Visits today */
  visitsToday: number;
  /** Donaciones totales | Total donations */
  totalDonations: number;
  /** Ingresos por donaciones | Donation revenue */
  donationRevenue: number;
}

/**
 * Métricas de usuarios
 * @interface UserMetrics
 */
export interface UserMetrics {
  /** Total de usuarios | Total users */
  total: number;
  /** Usuarios por rol | Users by role */
  byRole: Record<string, number>;
  /** Usuarios activos (últimos 30 días) | Active users (last 30 days) */
  activeLast30Days: number;
  /** Nuevos usuarios (últimos 30 días) | New users (last 30 days) */
  newLast30Days: number;
  /** Tasa de retención | Retention rate */
  retentionRate: number;
}

/**
 * Métricas de empleos
 * @interface JobMetrics
 */
export interface JobMetrics {
  /** Total de empleos | Total jobs */
  total: number;
  /** Empleos activos | Active jobs */
  active: number;
  /** Empleos por tipo | Jobs by type */
  byType: Record<string, number>;
  /** Empleos por ubicación | Jobs by location */
  byLocation: Record<string, number>;
  /** Postulaciones por empleo | Applications per job */
  applicationsPerJob: number;
  /** Empleos más populares | Most popular jobs */
  popularJobs: Array<{ jobId: string; title: string; views: number }>;
}

/**
 * Métricas de rendimiento
 * @interface PerformanceMetrics
 */
export interface PerformanceMetrics {
  /** Tiempo de respuesta promedio | Average response time */
  avgResponseTime: number;
  /** Tiempo de carga de página | Page load time */
  pageLoadTime: number;
  /** Tasa de error | Error rate */
  errorRate: number;
  /** Solicitudes por minuto | Requests per minute */
  requestsPerMinute: number;
}

/**
 * Datos para gráfico de tendencias
 * @interface TrendData
 */
export interface TrendData {
  /** Etiqueta (fecha/período) | Label (date/period) */
  label: string;
  /** Valor | Value */
  value: number;
}

/**
 * Reporte de analíticas
 * @interface AnalyticsReport
 */
export interface AnalyticsReport {
  /** Período del reporte | Report period */
  period: {
    start: Date;
    end: Date;
  };
  /** Métricas del dashboard | Dashboard metrics */
  dashboard: DashboardMetrics;
  /** Métricas de usuarios | User metrics */
  users: UserMetrics;
  /** Métricas de empleos | Job metrics */
  jobs: JobMetrics;
  /** Tendencias de visitas | Visit trends */
  visitTrends: TrendData[];
  /** Tendencias de registros | Registration trends */
  registrationTrends: TrendData[];
}

/**
 * Solicitud de tracking de evento
 * @interface TrackEventRequest
 */
export interface TrackEventRequest {
  /** Tipo de evento | Event type */
  eventType: string;
  /** Datos del evento | Event data */
  data?: Record<string, unknown>;
  /** Metadata adicional | Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Configuración de analytics
 * @interface AnalyticsConfig
 */
export interface AnalyticsConfig {
  /** Habilitar tracking | Enable tracking */
  enabled: boolean;
  /** Intervalo de muestreo | Sampling interval */
  samplingRate: number;
  /** Eventos a ignorar | Events to ignore */
  ignoredEvents: string[];
  /** IP anonymization | IP anonymization */
  anonymizeIp: boolean;
}
