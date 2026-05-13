/**
 * @fileoverview Rutas del servicio de chat
 * @fileoverview Chat service routes
 * @module services/chat/routes
 */

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import * as chatController from './controller.js';
import { authenticate } from '../auth/middleware.js';

/**
 * Crea el router de chat
 * @function createChatRouter
 * @description Factory function que crea las rutas de chat
 * @returns {Router} Router de Express configurado
 */
export function createChatRouter(): Router {
  const router = Router();

  /**
   * @swagger
   * /api/chat/chats:
   *   get:
   *     summary: Obtener mis chats
   *     description: Retorna lista de chats del usuario actual
   *     tags:
   *       - Chat
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de chats
   */
  router.get('/chats', authenticate, chatController.getChats);

  /**
   * @swagger
   * /api/chat/chats:
   *   post:
   *     summary: Crear nuevo chat
   *     description: Crea una nueva conversación
   *     tags:
   *       - Chat
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - participantIds
   *             properties:
   *               title:
   *                 type: string
   *               participantIds:
   *                 type: array
   *                 items:
   *                   type: string
   *               jobId:
   *                 type: string
   *               isGroup:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Chat creado
   */
  router.post(
    '/chats',
    authenticate,
    [
      body('participantIds').isArray({ min: 1 }).withMessage('At least one participant required'),
      body('title').optional().isString(),
      body('jobId').optional().isString(),
      body('isGroup').optional().isBoolean(),
    ],
    handleValidation,
    chatController.createChat
  );

  /**
   * @swagger
   * /api/chat/chats/{id}:
   *   get:
   *     summary: Obtener chat por ID
   *     description: Retorna un chat específico con sus mensajes
   *     tags:
   *       - Chat
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
   *         description: Chat encontrado
   *       404:
   *         description: Chat no encontrado
   */
  router.get('/chats/:id', authenticate, chatController.getChatById);

  /**
   * @swagger
   * /api/chat/messages/{chatId}:
   *   get:
   *     summary: Obtener mensajes de un chat
   *     description: Retorna los mensajes de un chat específico
   *     tags:
   *       - Chat
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: chatId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *     responses:
   *       200:
   *         description: Lista de mensajes
   */
  router.get('/messages/:chatId', authenticate, chatController.getMessages);

  /**
   * @swagger
   * /api/chat/messages/{chatId}:
   *   post:
   *     summary: Enviar mensaje
   *     description: Envía un mensaje a un chat
   *     tags:
   *       - Chat
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: chatId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - content
   *             properties:
   *               content:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [text, image, file]
   *     responses:
   *       201:
   *         description: Mensaje enviado
   */
  router.post(
    '/messages/:chatId',
    authenticate,
    [
      body('content').notEmpty().withMessage('Message content is required'),
      body('type').optional().isIn(['text', 'image', 'file']),
    ],
    handleValidation,
    chatController.sendMessage
  );

  /**
   * @swagger
   * /api/chat/{chatId}/read:
   *   post:
   *     summary: Marcar chat como leído
   *     description: Marca los mensajes de un chat como leídos
   *     tags:
   *       - Chat
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: chatId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Chat marcado como leído
   */
  router.post('/:chatId/read', authenticate, chatController.markAsRead);

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

export default createChatRouter;
