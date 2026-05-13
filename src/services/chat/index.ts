/**
 * @fileoverview Índice del servicio de chat
 * @fileoverview Chat service index
 * @module services/chat
 */

// Exportar tipos
export * from './types.js';

// Exportar controlador
export * from './controller.js';

// Exportar rutas
export { createChatRouter, default as chatRoutes } from './routes.js';

// Exportar WebSocket
export { ChatWebSocketServer, default as chatWebSocket } from './websocket.js';

/**
 * @fileoverview Este módulo proporciona funcionalidad de chat en tiempo real
 * @fileoverview This module provides real-time chat functionality
 * 
 * Características | Features:
 * - Chat en tiempo real con WebSocket | Real-time chat with WebSocket
 * - Sistema de conversaciones | Conversations system
 * - Indicadores de escritura | Typing indicators
 * - Notificaciones | Notifications
 * - Integración con BuilderBot | BuilderBot integration
 */
