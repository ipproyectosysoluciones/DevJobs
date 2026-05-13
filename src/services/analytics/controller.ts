/**
 * @fileoverview Controlador del servicio de analíticas
 * @fileoverview Analytics service controller
 * @module services/analytics/controller
 */

import type { Request, Response } from 'express';
import type { 
  AnalyticsEvent, 
  DashboardMetrics,
  UserMetrics,
  JobMetrics,
  AnalyticsReport,
  TrackEventRequest,
  TrendData
} from './types.js';

// Base de datos en memoria (en producción, usar MongoDB con aggregations)
const events: AnalyticsEvent[] = [];

// Semilla de datos de ejemplo
seedAnalytics();

/**
 * Registra un evento de analítica
 * @function trackEvent
 * @description Registra un evento de analítica
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function trackEvent(req: Request, res: Response): void {
  const eventData = req.body as TrackEventRequest;
  const user = (req as any).user;

  // Validar tipo de evento
  const validEventTypes = [
    'page_view', 'button_click', 'form_submit', 'search',
    'job_view', 'job_apply', 'user_register', 'user_login',
    'chat_message', 'donation', 'error'
  ];

  if (!eventData.eventType || !validEventTypes.includes(eventData.eventType)) {
    res.status(400).json({
      error: 'Tipo de evento inválido',
      message: 'Invalid event type',
    });
    return;
  }

  const event: AnalyticsEvent = {
    _id: crypto.randomUUID(),
    userId: user?.userId,
    eventType: eventData.eventType,
    data: eventData.data || {},
    metadata: eventData.metadata || {},
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date(),
  };

  events.push(event);

  res.status(201).json({ message: 'Evento registrado', eventId: event._id });
}

/**
 * Obtiene métricas del dashboard
 * @function getDashboard
 * @description Retorna métricas para el dashboard
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getDashboard(req: Request, res: Response): void {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEvents = events.filter(e => new Date(e.timestamp) >= today);

  const metrics: DashboardMetrics = {
    totalUsers: countUniqueUsers(),
    newUsersToday: todayEvents.filter(e => e.eventType === 'user_register').length,
    totalJobs: 150, // Simulado
    activeJobs: 89, // Simulado
    totalApplications: 423, // Simulado
    applicationsToday: todayEvents.filter(e => e.eventType === 'job_apply').length,
    totalVisits: events.filter(e => e.eventType === 'page_view').length,
    visitsToday: todayEvents.filter(e => e.eventType === 'page_view').length,
    totalDonations: 47, // Simulado
    donationRevenue: 1250, // Simulado
  };

  res.json(metrics);
}

/**
 * Obtiene métricas de usuarios
 * @function getUserMetrics
 * @description Retorna métricas de usuarios
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getUserMetrics(req: Request, res: Response): void {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const userEvents = events.filter(e => 
    e.eventType === 'user_register' || e.eventType === 'user_login'
  );

  const last30DaysEvents = userEvents.filter(e => new Date(e.timestamp) >= thirtyDaysAgo);
  const uniqueUsersLast30 = new Set(last30DaysEvents.map(e => e.userId).filter(Boolean));

  const metrics: UserMetrics = {
    total: 1250, // Simulado
    byRole: {
      job_seeker: 780,
      employer: 320,
      admin: 15,
      premium: 95,
      moderator: 40,
    },
    activeLast30Days: uniqueUsersLast30.size,
    newLast30Days: last30DaysEvents.filter(e => e.eventType === 'user_register').length,
    retentionRate: 72.5,
  };

  res.json(metrics);
}

/**
 * Obtiene métricas de empleos
 * @function getJobMetrics
 * @description Retorna métricas de empleos
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getJobMetrics(req: Request, res: Response): void {
  const jobViewEvents = events.filter(e => e.eventType === 'job_view');
  const jobApplyEvents = events.filter(e => e.eventType === 'job_apply');

  const jobViewsByJob: Record<string, number> = {};
  jobViewEvents.forEach(e => {
    const jobId = e.data.jobId as string;
    if (jobId) {
      jobViewsByJob[jobId] = (jobViewsByJob[jobId] || 0) + 1;
    }
  });

  const popularJobs = Object.entries(jobViewsByJob)
    .map(([jobId, views]) => ({
      jobId,
      title: `Job ${jobId}`,
      views,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const metrics: JobMetrics = {
    total: 150,
    active: 89,
    byType: {
      'full-time': 95,
      'part-time': 25,
      'contract': 20,
      'internship': 8,
      'freelance': 12,
    },
    byLocation: {
      'Madrid': 35,
      'Barcelona': 28,
      'Buenos Aires': 42,
      'Remote': 55,
    },
    applicationsPerJob: jobApplyEvents.length / 150,
    popularJobs,
  };

  res.json(metrics);
}

/**
 * Obtiene tendencias de visitas
 * @function getVisitTrends
 * @description Retorna tendencias de visitas
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getVisitTrends(req: Request, res: Response): void {
  const { days = 30 } = req.query;
  const numDays = parseInt(days as string) || 30;

  const trends: TrendData[] = [];
  
  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayVisits = events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return e.eventType === 'page_view' && 
             eventDate >= date && 
             eventDate < nextDate;
    }).length;

    trends.push({
      label: date.toISOString().split('T')[0],
      value: dayVisits || Math.floor(Math.random() * 100) + 50,
    });
  }

  res.json(trends);
}

/**
 * Obtiene reporte completo de analíticas
 * @function getReport
 * @description Retorna un reporte completo de analíticas
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getReport(req: Request, res: Response): void {
  const { start, end } = req.query;

  const startDate = start ? new Date(start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end ? new Date(end as string) : new Date();

  const report: AnalyticsReport = {
    period: {
      start: startDate,
      end: endDate,
    },
    dashboard: {
      totalUsers: 1250,
      newUsersToday: Math.floor(Math.random() * 20) + 5,
      totalJobs: 150,
      activeJobs: 89,
      totalApplications: 423,
      applicationsToday: Math.floor(Math.random() * 30) + 10,
      totalVisits: 15680,
      visitsToday: Math.floor(Math.random() * 500) + 200,
      totalDonations: 47,
      donationRevenue: 1250,
    },
    users: {
      total: 1250,
      byRole: {
        job_seeker: 780,
        employer: 320,
        admin: 15,
        premium: 95,
        moderator: 40,
      },
      activeLast30Days: 890,
      newLast30Days: 145,
      retentionRate: 72.5,
    },
    jobs: {
      total: 150,
      active: 89,
      byType: {
        'full-time': 95,
        'part-time': 25,
        'contract': 20,
        'internship': 8,
        'freelance': 12,
      },
      byLocation: {
        'Madrid': 35,
        'Barcelona': 28,
        'Buenos Aires': 42,
        'Remote': 55,
      },
      applicationsPerJob: 2.82,
      popularJobs: [
        { jobId: '1', title: 'Frontend Developer', views: 234 },
        { jobId: '2', title: 'Backend Developer', views: 189 },
        { jobId: '3', title: 'Full Stack Developer', views: 167 },
      ],
    },
    visitTrends: generateTrendData(30),
    registrationTrends: generateTrendData(30),
  };

  res.json(report);
}

/**
 * Obtiene eventos recientes
 * @function getRecentEvents
 * @description Retorna eventos recientes
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getRecentEvents(req: Request, res: Response): void {
  const { limit = 50 } = req.query;
  const numLimit = parseInt(limit as string) || 50;

  const recentEvents = events
    .slice(-numLimit)
    .reverse();

  res.json(recentEvents);
}

/**
 * Cuenta usuarios únicos
 * @function countUniqueUsers
 * @description Retorna el número de usuarios únicos
 * @returns {number} Número de usuarios únicos
 */
function countUniqueUsers(): number {
  const userIds = events
    .map(e => e.userId)
    .filter(Boolean) as string[];
  return new Set(userIds).size;
}

/**
 * Genera datos de tendencia
 * @function generateTrendData
 * @description Genera datos de tendencia aleatorios
 * @param {number} days - Número de días
 * @returns {TrendData[]} Datos de tendencia
 */
function generateTrendData(days: number): TrendData[] {
  const trends: TrendData[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    trends.push({
      label: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 50) + 10,
    });
  }
  
  return trends;
}

/**
 * Inicializa datos de ejemplo
 * @function seedAnalytics
 */
function seedAnalytics(): void {
  // Generar eventos de ejemplo
  const eventTypes = ['page_view', 'job_view', 'job_apply', 'user_register', 'user_login'];
  
  for (let i = 0; i < 100; i++) {
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
    
    events.push({
      _id: crypto.randomUUID(),
      userId: `user_${Math.floor(Math.random() * 100)}`,
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      data: {},
      timestamp: randomDate,
    });
  }
}

export default {
  trackEvent,
  getDashboard,
  getUserMetrics,
  getJobMetrics,
  getVisitTrends,
  getReport,
  getRecentEvents,
};
