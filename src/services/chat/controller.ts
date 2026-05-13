/**
 * @fileoverview Controlador del servicio de chat
 * @fileoverview Chat service controller
 * @module services/chat/controller
 */

import type { Request, Response } from 'express';
import type { 
  Chat, 
  Message, 
  CreateChatRequest, 
  SendMessageRequest,
  ChatResponse,
  Participant 
} from './types.js';

// Base de datos en memoria (en producción, usar MongoDB)
const chats: Map<string, Chat> = new Map();
const messages: Map<string, Message[]> = new Map();

// Inicializar con datos de ejemplo
seedChats();

/**
 * Obtiene todos los chats del usuario
 * @function getChats
 * @description Retorna lista de chats del usuario actual
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getChats(req: Request, res: Response): void {
  const user = (req as any).user;
  
  if (!user) {
    res.status(401).json({
      error: 'No autenticado',
      message: 'Not authenticated',
    });
    return;
  }

  const userChats = Array.from(chats.values()).filter(chat =>
    chat.participants.some(p => p.userId === user.userId) && chat.isActive
  );

  res.json(userChats);
}

/**
 * Obtiene un chat específico con sus mensajes
 * @function getChatById
 * @description Retorna un chat específico con sus mensajes
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getChatById(req: Request, res: Response): void {
  const { id } = req.params;
  const user = (req as any).user;

  const chat = chats.get(id);

  if (!chat) {
    res.status(404).json({
      error: 'Chat no encontrado',
      message: 'Chat not found',
    });
    return;
  }

  // Verificar que el usuario es participante
  const isParticipant = chat.participants.some(p => p.userId === user?.userId);
  if (!isParticipant) {
    res.status(403).json({
      error: 'No autorizado',
      message: 'Not authorized to view this chat',
    });
    return;
  }

  const chatMessages = messages.get(id) || [];

  const response: ChatResponse = {
    chat,
    messages: chatMessages,
  };

  res.json(response);
}

/**
 * Crea un nuevo chat
 * @function createChat
 * @description Crea una nueva conversación/chat
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {Promise<void>}
 */
export async function createChat(req: Request, res: Response): Promise<void> {
  try {
    const chatData = req.body as CreateChatRequest;
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        error: 'No autenticado',
        message: 'Not authenticated',
      });
      return;
    }

    if (!chatData.participantIds || chatData.participantIds.length === 0) {
      res.status(400).json({
        error: 'Se requiere al menos un participante',
        message: 'At least one participant is required',
      });
      return;
    }

    const participants: Participant[] = [
      {
        userId: user.userId,
        name: user.name || user.email,
        role: 'candidate',
        joinedAt: new Date(),
      },
      ...chatData.participantIds.map(id => ({
        userId: id,
        name: 'Usuario',
        role: 'employer' as const,
        joinedAt: new Date(),
      })),
    ];

    const chat: Chat = {
      _id: crypto.randomUUID(),
      title: chatData.title || `Chat ${new Date().toLocaleDateString()}`,
      participants,
      isGroup: chatData.isGroup || false,
      jobId: chatData.jobId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    chats.set(chat._id, chat);
    messages.set(chat._id, []);

    // Mensaje de sistema inicial
    const systemMessage: Message = {
      _id: crypto.randomUUID(),
      chatId: chat._id,
      senderId: 'system',
      senderName: 'System',
      content: 'Chat iniciado',
      type: 'system',
      isFromBot: false,
      createdAt: new Date(),
    };
    
    messages.get(chat._id)?.push(systemMessage);

    res.status(201).json(chat);
  } catch (error) {
    console.error('Error en createChat:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Envía un mensaje al chat
 * @function sendMessage
 * @description Envía un mensaje a un chat existente
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function sendMessage(req: Request, res: Response): void {
  const { chatId } = req.params;
  const messageData = req.body as SendMessageRequest;
  const user = (req as any).user;

  const chat = chats.get(chatId);

  if (!chat) {
    res.status(404).json({
      error: 'Chat no encontrado',
      message: 'Chat not found',
    });
    return;
  }

  // Verificar que el usuario es participante
  const participant = chat.participants.find(p => p.userId === user?.userId);
  if (!participant) {
    res.status(403).json({
      error: 'No autorizado',
      message: 'Not authorized to send messages in this chat',
    });
    return;
  }

  const message: Message = {
    _id: crypto.randomUUID(),
    chatId,
    senderId: user.userId,
    senderName: user.name || user.email,
    content: messageData.content,
    type: messageData.type || 'text',
    isFromBot: false,
    createdAt: new Date(),
  };

  const chatMessages = messages.get(chatId) || [];
  chatMessages.push(message);
  messages.set(chatId, chatMessages);

  // Actualizar último mensaje del chat
  chat.lastMessage = message;
  chat.updatedAt = new Date();
  chats.set(chatId, chat);

  res.status(201).json(message);
}

/**
 * Obtiene mensajes de un chat
 * @function getMessages
 * @description Retorna los mensajes de un chat
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getMessages(req: Request, res: Response): void {
  const { chatId } = req.params;
  const { limit = 50, before } = req.query;
  const user = (req as any).user;

  const chat = chats.get(chatId);

  if (!chat) {
    res.status(404).json({
      error: 'Chat no encontrado',
      message: 'Chat not found',
    });
    return;
  }

  // Verificar que el usuario es participante
  const isParticipant = chat.participants.some(p => p.userId === user?.userId);
  if (!isParticipant) {
    res.status(403).json({
      error: 'No autorizado',
      message: 'Not authorized to view this chat',
    });
    return;
  }

  let chatMessages = messages.get(chatId) || [];

  // Filtrar por fecha si se especifica
  if (before) {
    chatMessages = chatMessages.filter(m => 
      new Date(m.createdAt) < new Date(before as string)
    );
  }

  // Limitar resultados
  chatMessages = chatMessages.slice(-parseInt(limit as string));

  res.json(chatMessages);
}

/**
 * Marca un chat como leído
 * @function markAsRead
 * @description Marca los mensajes de un chat como leídos
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function markAsRead(req: Request, res: Response): void {
  const { chatId } = req.params;
  const user = (req as any).user;

  const chat = chats.get(chatId);

  if (!chat) {
    res.status(404).json({
      error: 'Chat no encontrado',
      message: 'Chat not found',
    });
    return;
  }

  // Actualizar último visto del usuario
  const participant = chat.participants.find(p => p.userId === user?.userId);
  if (participant) {
    participant.lastSeen = new Date();
    chats.set(chatId, chat);
  }

  res.json({ message: 'Chat marcado como leído' });
}

/**
 * Inicializa datos de ejemplo
 * @function seedChats
 */
function seedChats(): void {
  // Chats de ejemplo ya están inicializados como Maps vacíos
  // En producción, esto vendría de MongoDB
}

export default {
  getChats,
  getChatById,
  createChat,
  sendMessage,
  getMessages,
  markAsRead,
};
