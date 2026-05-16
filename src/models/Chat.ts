/**
 * @fileoverview Modelo de Mongoose para Chats
 * @module models/Chat
 */

import mongoose, { Schema, type Document } from 'mongoose';

/**
 * Interfaz del participante
 */
interface IParticipant {
  userId: mongoose.Types.ObjectId;
  name: string;
  role: 'employer' | 'candidate' | 'admin' | 'bot';
  joinedAt: Date;
  lastSeen?: Date;
}

/**
 * Interfaz del documento de Chat
 */
export interface IChatDocument extends Document {
  title: string;
  participants: IParticipant[];
  isGroup: boolean;
  employerId?: mongoose.Types.ObjectId;
  jobId?: string;
  lastMessage?: {
    content: string;
    senderName: string;
    createdAt: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['employer', 'candidate', 'admin', 'bot'],
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },
    lastSeen: { type: Date },
  },
  { _id: false }
);

const ChatSchema = new Schema<IChatDocument>(
  {
    title: { type: String, default: 'Chat' },
    participants: [ParticipantSchema],
    isGroup: { type: Boolean, default: false },
    employerId: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    jobId: { type: String },
    lastMessage: {
      content: { type: String },
      senderName: { type: String },
      createdAt: { type: Date },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ChatSchema.index({ 'participants.userId': 1 });
ChatSchema.index({ updatedAt: -1 });

const Chat = mongoose.model<IChatDocument>('Chat', ChatSchema);

export default Chat;
export type { IParticipant };
