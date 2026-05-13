/**
 * @fileoverview Tipos e interfaces para el servicio de chat
 * @fileoverview Types and interfaces for chat service
 * @module services/chat/types
 */

/**
 * Mensaje del chat
 * @interface Message
 */
export interface Message {
  /** ID único del mensaje | Message unique ID */
  _id: string;
  /** ID del chat | Chat ID */
  chatId: string;
  /** ID del usuario que envía | Sender user ID */
  senderId: string;
  /** Nombre del remitente | Sender name */
  senderName: string;
  /** Contenido del mensaje | Message content */
  content: string;
  /** Tipo de mensaje | Message type */
  type: MessageType;
  /** Indica si es del Bot | Whether from Bot */
  isFromBot: boolean;
  /** Metadata adicional | Additional metadata */
  metadata?: Record<string, unknown>;
  /** Fecha de creación | Creation timestamp */
  createdAt: Date;
}

/**
 * Tipos de mensaje
 * @typedef {('text' | 'image' | 'file' | 'system' | 'typing')} MessageType
 */
export type MessageType = 'text' | 'image' | 'file' | 'system' | 'typing';

/**
 * Chat/Conversación
 * @interface Chat
 */
export interface Chat {
  /** ID único del chat | Chat unique ID */
  _id: string;
  /** Título del chat | Chat title */
  title: string;
  /** Participantes del chat | Chat participants */
  participants: Participant[];
  /** Indica si es grupo | Whether it's a group chat */
  isGroup: boolean;
  /** ID del empleador (si es relacionado a empleo) | Employer ID (if job related) */
  employerId?: string;
  /** ID del empleo (si es relacionado a postulación) | Job ID (if application related) */
  jobId?: string;
  /** Último mensaje | Last message */
  lastMessage?: Message;
  /** Indica si está activo | Whether active */
  isActive: boolean;
  /** Fecha de creación | Creation date */
  createdAt: Date;
  /** Fecha de actualización | Update date */
  updatedAt: Date;
}

/**
 * Participante del chat
 * @interface Participant
 */
export interface Participant {
  /** ID del usuario | User ID */
  userId: string;
  /** Nombre del usuario | User name */
  name: string;
  /** Rol del usuario en el chat | User role in chat */
  role: 'employer' | 'candidate' | 'admin' | 'bot';
  /** Fecha de entrada | Join date */
  joinedAt: Date;
  /** Última vez visto | Last seen */
  lastSeen?: Date;
}

/**
 * Solicitud para crear un chat
 * @interface CreateChatRequest
 */
export interface CreateChatRequest {
  /** Título del chat | Chat title */
  title?: string;
  /** IDs de participantes | Participants IDs */
  participantIds: string[];
  /** ID del empleo relacionado (opcional) | Related job ID (optional) */
  jobId?: string;
  /** Indica si es grupo | Whether it's a group */
  isGroup?: boolean;
}

/**
 * Solicitud para enviar mensaje
 * @interface SendMessageRequest
 */
export interface SendMessageRequest {
  /** Contenido del mensaje | Message content */
  content: string;
  /** Tipo de mensaje | Message type */
  type?: MessageType;
}

/**
 * Eventos de WebSocket
 * @interface SocketEvents
 */
export interface SocketEvents {
  // Cliente → Servidor
  'chat:join': (chatId: string) => void;
  'chat:leave': (chatId: string) => void;
  'message:send': (data: { chatId: string; content: string; type?: MessageType }) => void;
  'typing:start': (chatId: string) => void;
  'typing:stop': (chatId: string) => void;
  
  // Servidor → Cliente
  'message:new': (message: Message) => void;
  'message:update': (message: Message) => void;
  'chat:update': (chat: Chat) => void;
  'typing:indicator': (data: { chatId: string; userId: string; isTyping: boolean }) => void;
  'user:joined': (data: { chatId: string; participant: Participant }) => void;
  'user:left': (data: { chatId: string; userId: string }) => void;
  'notification': (data: { type: string; message: string; data?: unknown }) => void;
}

/**
 * Respuesta de chat
 * @interface ChatResponse
 */
export interface ChatResponse {
  /** Chat encontrado | Chat found */
  chat: Chat;
  /** Mensajes del chat | Chat messages */
  messages: Message[];
}

/**
 * Configuración de BuilderBot
 * @interface BuilderBotConfig
 */
export interface BuilderBotConfig {
  /** URL del servicio de BuilderBot | BuilderBot service URL */
  url: string;
  /** API Key para autenticación | API Key for authentication */
  apiKey?: string;
  /** Habilitar modo debug | Enable debug mode */
  debug?: boolean;
}
