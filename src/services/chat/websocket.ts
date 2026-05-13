/**
 * @fileoverview Servidor WebSocket para chat en tiempo real
 * @fileoverview WebSocket server for real-time chat
 * @module services/chat/websocket
 */

import { Server as SocketIOServer, type Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { TokenPayload } from '../auth/types.js';
import type { Message } from './types.js';

/**
 * Opciones de configuración del servidor WebSocket
 * @interface WebSocketOptions
 */
interface WebSocketOptions {
  /** Servidor HTTP | HTTP server */
  server: HTTPServer;
  /** Ruta del servidor WebSocket | WebSocket server path */
  path?: string;
  /** Habilitar CORS | Enable CORS */
  cors?: boolean;
}

/**
 * Clase para manejar el servidor WebSocket
 * @class ChatWebSocketServer
 * @description Gestiona las conexiones WebSocket para el chat en tiempo real
 */
class ChatWebSocketServer {
  private io: SocketIOServer;
  private activeUsers: Map<string, { socketId: string; userId: string }> = new Map();
  private typingUsers: Map<string, Set<string>> = new Map();

  /**
   * Constructor del servidor WebSocket
   * @constructor
   * @param {WebSocketOptions} options - Opciones de configuración
   */
  constructor(options: WebSocketOptions) {
    this.io = new SocketIOServer(options.server, {
      path: options.path || '/ws/chat',
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
      },
    });

    this.setupEventHandlers();
  }

  /**
   * Configura los manejadores de eventos
   * @method setupEventHandlers
   * @description Inicializa los eventos de WebSocket
   */
  private setupEventHandlers(): void {
    // Autenticación de conexión
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      next();
    });

    // Conexión de cliente
    this.io.on('connection', (socket: Socket) => {
      console.log(`Cliente conectado: ${socket.id}`);
      
      // Manejar autenticación después de conexión
      const token = socket.handshake.auth.token;
      const user = this.decodeToken(token);
      
      if (user) {
        this.activeUsers.set(user.userId, {
          socketId: socket.id,
          userId: user.userId,
        });
        
        socket.data.user = user;
        console.log(`Usuario autenticado: ${user.email}`);
      }

      // Unirse a un chat
      socket.on('chat:join', (chatId: string) => {
        socket.join(chatId);
        console.log(`Socket ${socket.id} se unió al chat ${chatId}`);
        
        // Notificar a otros usuarios
        if (user) {
          socket.to(chatId).emit('user:joined', {
            chatId,
            participant: {
              userId: user.userId,
              name: user.email,
              role: 'candidate',
              joinedAt: new Date(),
            },
          });
        }
      });

      // Salir de un chat
      socket.on('chat:leave', (chatId: string) => {
        socket.leave(chatId);
        
        if (user) {
          socket.to(chatId).emit('user:left', {
            chatId,
            userId: user.userId,
          });
        }
      });

      // Enviar mensaje
      socket.on('message:send', (data: { chatId: string; content: string; type?: string }) => {
        const message: Message = {
          _id: crypto.randomUUID(),
          chatId: data.chatId,
          senderId: user?.userId || 'anonymous',
          senderName: user?.email || 'Anonymous',
          content: data.content,
          type: (data.type as any) || 'text',
          isFromBot: false,
          createdAt: new Date(),
        };

        // Enviar a todos en el chat incluyendo el remitente
        this.io.to(data.chatId).emit('message:new', message);
      });

      // Indicador de escritura
      socket.on('typing:start', (chatId: string) => {
        if (user) {
          // Agregar al mapa de usuarios escribiendo
          if (!this.typingUsers.has(chatId)) {
            this.typingUsers.set(chatId, new Set());
          }
          this.typingUsers.get(chatId)?.add(user.userId);

          socket.to(chatId).emit('typing:indicator', {
            chatId,
            userId: user.userId,
            isTyping: true,
          });
        }
      });

      socket.on('typing:stop', (chatId: string) => {
        if (user) {
          this.typingUsers.get(chatId)?.delete(user.userId);

          socket.to(chatId).emit('typing:indicator', {
            chatId,
            userId: user.userId,
            isTyping: false,
          });
        }
      });

      // Desconexión
      socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
        
        if (user) {
          this.activeUsers.delete(user.userId);
          
          // Notificar que el usuario abandonó todos sus chats
          this.typingUsers.forEach((users, chatId) => {
            if (users.has(user.userId)) {
              users.delete(user.userId);
              this.io.to(chatId).emit('user:left', {
                chatId,
                userId: user.userId,
              });
            }
          });
        }
      });
    });
  }

  /**
   * Decodifica el token JWT
   * @method decodeToken
   * @description Decodifica el token sin verificar
   * @param {string} token - Token JWT
   * @returns {TokenPayload | null} Payload del token
   */
  private decodeToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return payload as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Envía un mensaje a un chat específico
   * @method sendMessageToChat
   * @description Envía un mensaje a través del servidor
   * @param {string} chatId - ID del chat
   * @param {Message} message - Mensaje a enviar
   */
  sendMessageToChat(chatId: string, message: Message): void {
    this.io.to(chatId).emit('message:new', message);
  }

  /**
   * Envía una notificación a un usuario
   * @method sendNotification
   * @description Envía una notificación a un usuario específico
   * @param {string} userId - ID del usuario
   * @param {object} notification - Notificación a enviar
   */
  sendNotification(userId: string, notification: { type: string; message: string; data?: unknown }): void {
    const user = this.activeUsers.get(userId);
    if (user) {
      this.io.to(user.socketId).emit('notification', notification);
    }
  }

  /**
   * Obtiene el número de conexiones activas
   * @method getActiveConnections
   * @description Retorna el número de conexiones activas
   * @returns {number} Número de conexiones
   */
  getActiveConnections(): number {
    return this.activeUsers.size;
  }

  /**
   * Cierra el servidor WebSocket
   * @method close
   * @description Cierra todas las conexiones y el servidor
   */
  close(): void {
    this.io.close();
  }
}

export default ChatWebSocketServer;
export { ChatWebSocketServer };
