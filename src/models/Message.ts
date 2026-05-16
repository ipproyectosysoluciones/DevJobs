/**
 * @fileoverview Modelo de Mongoose para Mensajes
 * @module models/Message
 */

import mongoose, { Schema, type Document } from 'mongoose';

type MessageType = 'text' | 'image' | 'file' | 'system' | 'typing';

/**
 * Interfaz del documento de Mensaje
 */
export interface IMessageDocument extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  content: string;
  type: MessageType;
  isFromBot: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    senderName: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system', 'typing'],
      default: 'text',
    },
    isFromBot: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

MessageSchema.index({ chatId: 1, createdAt: -1 });

const Message = mongoose.model<IMessageDocument>('Message', MessageSchema);

export default Message;
export type { MessageType };
