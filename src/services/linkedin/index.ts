/**
 * @fileoverview Índice del servicio de LinkedIn
 * @fileoverview LinkedIn service index
 * @module services/linkedin
 */

// Exportar tipos
export * from './types.js';

// Exportar controlador
export * from './controller.js';

// Exportar rutas
export { createLinkedInRouter, default as linkedinRoutes } from './routes.js';

/**
 * @fileoverview Este módulo proporciona integración con LinkedIn
 * @fileoverview This module provides LinkedIn integration
 * 
 * Características | Features:
 * - OAuth2 con LinkedIn | LinkedIn OAuth2
 * - Sincronización de perfil | Profile synchronization
 * - Búsqueda de empleos | Jobs search
 * - Integración con LinkedIn Jobs API | LinkedIn Jobs API integration
 */
