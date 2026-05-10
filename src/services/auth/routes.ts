/**
 * @fileoverview Rutas del servicio de autenticación
 * @fileoverview Authentication service routes
 * @module services/auth/routes
 */

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import * as authController from './controller.js';
import { authenticate } from './middleware.js';

/**
 * Crea el router de autenticación
 * @function createAuthRouter
 * @description Factory function que crea las rutas de autenticación
 * @returns {Router} Router de Express configurado
 * 
 * @example
 * const authRouter = createAuthRouter();
 * app.use('/api/auth', authRouter);
 */
export function createAuthRouter(): Router {
  const router = Router();

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Registro de usuario
   *     description: Crea una nueva cuenta de usuario en DevJobs
   *     tags:
   *       - Autenticación
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - name
   *               - role
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: usuario@devjobs.com
   *               password:
   *                 type: string
   *                 format: password
   *                 minLength: 8
   *                 example: password123
   *               name:
   *                 type: string
   *                 example: Juan Pérez
   *               role:
   *                 type: string
   *                 enum: [admin, employer, job_seeker, premium, moderator]
   *                 example: job_seeker
   *     responses:
   *       201:
   *         description: Usuario creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                 user:
   *                   type: object
   *       400:
   *         description: Error de validación
   *       500:
   *         description: Error interno
   */
  router.post(
    '/register',
    [
      body('email').isEmail().withMessage('Email válido requerido'),
      body('password')
        .isLength({ min: 8 })
        .withMessage('Mínimo 8 caracteres'),
      body('name').notEmpty().withMessage('Nombre requerido'),
      body('role')
        .isIn(['admin', 'employer', 'job_seeker', 'premium', 'moderator'])
        .withMessage('Rol inválido'),
    ],
    handleValidation,
    authController.register
  );

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Inicio de sesión
   *     description: Autentica usuario y retorna token JWT
   *     tags:
   *       - Autenticación
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Login exitoso
   *       401:
   *         description: Credenciales inválidas
   */
  router.post(
    '/login',
    [
      body('email').isEmail().withMessage('Email válido requerido'),
      body('password').notEmpty().withMessage('Contraseña requerida'),
    ],
    handleValidation,
    authController.login
  );

  /**
   * @swagger
   * /api/auth/profile:
   *   get:
   *     summary: Obtener perfil
   *     description: Retorna datos del usuario autenticado
   *     tags:
   *       - Autenticación
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil del usuario
   *       401:
   *         description: No autorizado
   */
  router.get('/profile', authenticate, authController.getProfile);

  return router;
}

/**
 * Middleware para manejar errores de validación
 * @function handleValidation
 * @description Procesa resultados de express-validator
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

export default createAuthRouter;
