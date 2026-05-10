/**
 * @fileoverview Índice del servicio de empleos
 * @fileoverview Jobs service index
 * @module services/jobs
 */

// Exportar tipos
export * from './types.js';

// Exportar controlador
export * from './controller.js';

// Exportar rutas
export { createJobsRouter, default as jobsRoutes } from './routes.js';

/**
 * @fileoverview Este módulo proporciona funcionalidad para gestión de empleos
 * @fileoverview This module provides jobs management functionality
 * 
 * Características | Features:
 * - CRUD de empleos | Jobs CRUD
 * - Sistema de postulaciones | Applications system
 * - Búsqueda y filtros | Search and filters
 * - Paginación | Pagination
 */
