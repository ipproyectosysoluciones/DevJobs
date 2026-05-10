/**
 * @fileoverview Rutas del servicio de empleos
 * @fileoverview Jobs service routes
 * @module services/jobs/routes
 */

import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import * as jobsController from './controller.js';
import { authenticate, checkPermission } from '../auth/middleware.js';

/**
 * Crea el router de empleos
 * @function createJobsRouter
 * @description Factory function que crea las rutas de empleos
 * @returns {Router} Router de Express configurado
 */
export function createJobsRouter(): Router {
  const router = Router();

  /**
   * @swagger
   * /api/jobs:
   *   get:
   *     summary: Obtener lista de empleos
   *     description: Retorna lista de empleos con filtros y paginación
   *     tags:
   *       - Empleos
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Texto de búsqueda
   *       - in: query
   *         name: city
   *         schema:
   *           type: string
   *       - in: query
   *         name: country
   *         schema:
   *           type: string
   *       - in: query
   *         name: remote
   *         schema:
   *           type: boolean
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [full-time, part-time, contract, internship, freelance]
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *     responses:
   *       200:
   *         description: Lista de empleos
   */
  router.get(
    '/',
    [
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    ],
    handleValidation,
    jobsController.getJobs
  );

  /**
   * @swagger
   * /api/jobs:
   *   post:
   *     summary: Crear nuevo empleo
   *     description: Crea una nueva vacante de empleo
   *     tags:
   *       - Empleos
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - description
   *               - requirements
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               requirements:
   *                 type: array
   *                 items:
   *                   type: string
   *               location:
   *                 type: object
   *                 properties:
   *                   city:
   *                     type: string
   *                   country:
   *                     type: string
   *                   remote:
   *                     type: boolean
   *               salary:
   *                 type: object
   *                 properties:
   *                   min:
   *                     type: number
   *                   max:
   *                     type: number
   *                   currency:
   *                     type: string
   *               type:
   *                 type: string
   *                 enum: [full-time, part-time, contract, internship, freelance]
   *     responses:
   *       201:
   *         description: Empleo creado
   *       401:
   *         description: No autenticado
   */
  router.post(
    '/',
    authenticate,
    checkPermission('jobs:create'),
    [
      body('title').notEmpty().withMessage('Title is required'),
      body('description').notEmpty().withMessage('Description is required'),
      body('requirements').isArray({ min: 1 }).withMessage('At least one requirement is required'),
      body('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
    ],
    handleValidation,
    jobsController.createJob
  );

  /**
   * @swagger
   * /api/jobs/{id}:
   *   get:
   *     summary: Obtener empleo por ID
   *     description: Retorna un empleo específico
   *     tags:
   *       - Empleos
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Empleo encontrado
   *       404:
   *         description: Empleo no encontrado
   */
  router.get('/:id', jobsController.getJobById);

  /**
   * @swagger
   * /api/jobs/{id}:
   *   put:
   *     summary: Actualizar empleo
   *     description: Actualiza los datos de un empleo
   *     tags:
   *       - Empleos
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Empleo actualizado
   *       403:
   *         description: No autorizado
   */
  router.put('/:id', authenticate, jobsController.updateJob);

  /**
   * @swagger
   * /api/jobs/{id}:
   *   delete:
   *     summary: Eliminar empleo
   *     description: Elimina un empleo existente
   *     tags:
   *       - Empleos
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Empleo eliminado
   *       403:
   *         description: No autorizado
   */
  router.delete('/:id', authenticate, jobsController.deleteJob);

  /**
   * @swagger
   * /api/jobs/{id}/apply:
   *   post:
   *     summary: Aplicar a empleo
   *     description: Postula a un empleo existente
   *     tags:
   *       - Empleos
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               coverLetter:
   *                 type: string
   *               resume:
   *                 type: string
   *     responses:
   *       201:
   *         description: Postulación exitosa
   *       400:
   *         description: Ya aplicaste a este empleo
   */
  router.post(
    '/:id/apply',
    authenticate,
    [
      body('coverLetter').optional().isString(),
      body('resume').optional().isString(),
    ],
    handleValidation,
    jobsController.applyToJob
  );

  /**
   * @swagger
   * /api/applications:
   *   get:
   *     summary: Mis postulaciones
   *     description: Retorna las postulaciones del usuario actual
   *     tags:
   *       - Empleos
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de postulaciones
   */
  router.get('/applications/me', authenticate, jobsController.getMyApplications);

  return router;
}

/**
 * Middleware para manejar errores de validación
 * @function handleValidation
 */
function handleValidation(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Error de validación',
      details: errors.array(),
    });
    return;
  }
  next();
}

export default createJobsRouter;
