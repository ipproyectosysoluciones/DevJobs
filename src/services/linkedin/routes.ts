/**
 * @fileoverview Rutas del servicio de LinkedIn
 * @fileoverview LinkedIn service routes
 * @module services/linkedin/routes
 */

import { Router } from 'express';
import * as linkedinController from './controller.js';
import { authenticate } from '../auth/middleware.js';

/**
 * Crea el router de LinkedIn
 * @function createLinkedInRouter
 * @description Factory function que crea las rutas de LinkedIn
 * @returns {Router} Router de Express configurado
 */
export function createLinkedInRouter(): Router {
  const router = Router();

  /**
   * @swagger
   * /api/linkedin/auth:
   *   get:
   *     summary: Iniciar OAuth de LinkedIn
   *     description: Genera la URL de autorización de LinkedIn
   *     tags:
   *       - LinkedIn
   *     responses:
   *       200:
   *         description: URL de autorización
   */
  router.get('/auth', linkedinController.getAuthorizationUrl);

  /**
   * @swagger
   * /api/linkedin/callback:
   *   get:
   *     summary: Callback de OAuth
   *     description: Maneja el callback de LinkedIn OAuth
   *     tags:
   *       - LinkedIn
   *     parameters:
   *       - in: query
   *         name: code
   *         schema:
   *           type: string
   *       - in: query
   *         name: state
   *         schema:
   *           type: string
   *     responses:
   *       302:
   *         description: Redirección al frontend
   */
  router.get('/callback', linkedinController.handleCallback);

  /**
   * @swagger
   * /api/linkedin/profile:
   *   get:
   *     summary: Obtener perfil de LinkedIn
   *     description: Retorna el perfil de LinkedIn vinculado
   *     tags:
   *       - LinkedIn
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil de LinkedIn
   *       404:
   *         description: Perfil no encontrado
   */
  router.get('/profile', authenticate, linkedinController.getProfile);

  /**
   * @swagger
   * /api/linkedin/sync:
   *   post:
   *     summary: Sincronizar perfil
   *     description: Sincroniza los datos del perfil de LinkedIn
   *     tags:
   *       - LinkedIn
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil sincronizado
   */
  router.post('/sync', authenticate, linkedinController.syncProfile);

  /**
   * @swagger
   * /api/linkedin/disconnect:
   *   post:
   *     summary: Desvincular LinkedIn
   *     description: Desvincula la cuenta de LinkedIn
   *     tags:
   *       - LinkedIn
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Cuenta desvinculada
   */
  router.post('/disconnect', authenticate, linkedinController.disconnect);

  /**
   * @swagger
   * /api/linkedin/jobs:
   *   get:
   *     summary: Buscar empleos en LinkedIn
   *     description: Busca empleos en LinkedIn
   *     tags:
   *       - LinkedIn
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: keyword
   *         schema:
   *           type: string
   *       - in: query
   *         name: location
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *     responses:
   *       200:
   *         description: Lista de empleos
   */
  router.get('/jobs', authenticate, linkedinController.searchJobs);

  /**
   * @swagger
   * /api/linkedin/jobs/{jobId}:
   *   get:
   *     summary: Obtener empleo de LinkedIn
   *     description: Retorna detalles de un empleo específico
   *     tags:
   *       - LinkedIn
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: jobId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Detalles del empleo
   */
  router.get('/jobs/:jobId', authenticate, linkedinController.getJobDetails);

  return router;
}

export default createLinkedInRouter;
