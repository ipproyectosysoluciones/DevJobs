/**
 * @fileoverview Controlador del servicio de chat
 * @module services/chat/controller
 */

import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Chat from '../../models/Chat.js';
import Message from '../../models/Message.js';
import type { 
  CreateChatRequest, 
  SendMessageRequest,
  ChatResponse,
  Participant 
} from './types.js';
import type { AuthenticatedRequest } from '../auth/middleware.js';

/**
 * Obtiene todos los chats del usuario
 */
export async function getChats(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;

    if (!user) {
      res.status(401).json({
        error: 'No autenticado',
        message: 'Not authenticated',
      });
      return;
    }

    const userChats = await Chat.find({
      'participants.userId': new mongoose.Types.ObjectId(user.userId),
      isActive: true,
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(userChats);
  } catch (error) {
    console.error('Error en getChats:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Obtiene un chat específico con sus mensajes
 */
export async function getChatById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const user = (req as unknown as AuthenticatedRequest).user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const chat = await Chat.findById(id).lean();

    if (!chat) {
      res.status(404).json({
        error: 'Chat no encontrado',
        message: 'Chat not found',
      });
      return;
    }

    const isParticipant = (chat.participants as Participant[]).some(
      p => p.userId.toString() === user?.userId
    );
    if (!isParticipant) {
      res.status(403).json({
        error: 'No autorizado',
        message: 'Not authorized to view this chat',
      });
      return;
    }

    const chatMessages = await Message.find({ chatId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const response: ChatResponse = {
      chat: chat as never,
      messages: chatMessages as never,
    };

    res.json(response);
  } catch (error) {
    console.error('Error en getChatById:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Crea un nuevo chat
 */
export async function createChat(req: Request, res: Response): Promise<void> {
  try {
    const chatData = req.body as CreateChatRequest;
    const user = (req as unknown as AuthenticatedRequest).user;

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
        name: user.nombre || user.email,
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

    const chat = new Chat({
      title: chatData.title || `Chat ${new Date().toLocaleDateString()}`,
      participants,
      isGroup: chatData.isGroup || false,
      jobId: chatData.jobId,
      isActive: true,
    });

    const savedChat = await chat.save();

    // Mensaje de sistema inicial
    await Message.create({
      chatId: savedChat._id,
      senderId: 'system',
      senderName: 'System',
      content: 'Chat iniciado',
      type: 'system',
      isFromBot: false,
    });

    res.status(201).json(savedChat.toObject());
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
 */
export async function sendMessage(req: Request, res: Response): Promise<void> {
  try {
    const chatId = req.params.chatId;
    const messageData = req.body as SendMessageRequest;
    const user = (req as unknown as AuthenticatedRequest).user;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      res.status(400).json({ error: 'ID de chat inválido' });
      return;
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404).json({
        error: 'Chat no encontrado',
        message: 'Chat not found',
      });
      return;
    }

    const participant = (chat.participants as Participant[]).find(
      p => p.userId.toString() === user?.userId
    );
    if (!participant) {
      res.status(403).json({
        error: 'No autorizado',
        message: 'Not authorized to send messages in this chat',
      });
      return;
    }

    const message = await Message.create({
      chatId: chat._id,
      senderId: user?.userId || 'system',
      senderName: participant.name,
      content: messageData.content,
      type: messageData.type || 'text',
      isFromBot: false,
    });

    // Update chat's last message
    chat.lastMessage = {
      content: messageData.content,
      senderName: participant.name,
      createdAt: new Date(),
    };
    chat.updatedAt = new Date();
    await chat.save();

    res.status(201).json(message.toObject());
  } catch (error) {
    console.error('Error en sendMessage:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Obtiene mensajes de un chat (paginados)
 */
export async function getMessages(req: Request, res: Response): Promise<void> {
  try {
    const chatId = req.params.chatId;
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before as string | undefined;
    const user = (req as unknown as AuthenticatedRequest).user;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      res.status(400).json({ error: 'ID de chat inválido' });
      return;
    }

    const chat = await Chat.findById(chatId).lean();

    if (!chat) {
      res.status(404).json({
        error: 'Chat no encontrado',
        message: 'Chat not found',
      });
      return;
    }

    const isParticipant = (chat.participants as Participant[]).some(
      p => p.userId.toString() === user?.userId
    );
    if (!isParticipant) {
      res.status(403).json({
        error: 'No autorizado',
        message: 'Not authorized to view this chat',
      });
      return;
    }

    const query: Record<string, unknown> = { chatId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const chatMessages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(chatMessages);
  } catch (error) {
    console.error('Error en getMessages:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Marca un chat como leído
 */
export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    const chatId = req.params.chatId;
    const user = (req as unknown as AuthenticatedRequest).user;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404).json({
        error: 'Chat no encontrado',
        message: 'Chat not found',
      });
      return;
    }

    const participant = (chat.participants as unknown as Array<Participant & { _id: string }>).find(
      p => p.userId.toString() === user?.userId
    );
    if (participant) {
      participant.lastSeen = new Date();
      await chat.save();
    }

    res.json({ message: 'Chat marcado como leído' });
  } catch (error) {
    console.error('Error en markAsRead:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

export default {
  getChats,
  getChatById,
  createChat,
  sendMessage,
  getMessages,
  markAsRead,
};
