/**
 * @fileoverview Índice del servicio de donaciones
 * @fileoverview Donations service index
 * @module services/donations
 */

// Exportar tipos
export * from './types.js';

// Exportar controlador
export * from './controller.js';

// Exportar rutas
export { createDonationsRouter, default as donationsRoutes } from './routes.js';

/**
 * @fileoverview Este módulo proporciona funcionalidad para el sistema de donaciones
 * @fileoverview This module provides donations system functionality
 * 
 * Características | Features:
 * - Planes de patrocinio | Sponsorship plans
 * - Integración con Stripe | Stripe integration
 * - Integración con PayPal | PayPal integration
 * - Webhooks para confirmación | Webhooks for confirmation
 * - Estadísticas de donaciones | Donations statistics
 */
