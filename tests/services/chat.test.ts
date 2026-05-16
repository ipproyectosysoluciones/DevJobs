/**
 * @fileoverview Tests para el servicio de chat
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockChatData = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Test Chat',
  participants: [
    { userId: '507f1f77bcf86cd799439012', name: 'User', role: 'candidate', joinedAt: new Date() },
  ],
  isGroup: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMessageData = {
  _id: '507f1f77bcf86cd799439013',
  chatId: '507f1f77bcf86cd799439011',
  senderId: '507f1f77bcf86cd799439012',
  senderName: 'User',
  content: 'Hello',
  type: 'text',
  isFromBot: false,
  createdAt: new Date(),
};

const mockChatQuery = {
  sort: vi.fn().mockReturnThis(),
  lean: vi.fn().mockResolvedValue([mockChatData]),
};

const mockChatFindByIdQuery = {
  lean: vi.fn(),
};

const mockMessageQuery = {
  sort: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  lean: vi.fn().mockResolvedValue([mockMessageData]),
};

function createMockChatInstance(data = {}) {
  const doc = {
    ...mockChatData,
    ...data,
    toObject: vi.fn().mockReturnThis(),
    save: vi.fn().mockResolvedValue(true),
  };
  return doc;
}

const mockChatModel = {
  find: vi.fn().mockReturnValue(mockChatQuery),
  findById: vi.fn().mockReturnValue(mockChatFindByIdQuery),
};

const mockMessageModel = {
  find: vi.fn().mockReturnValue(mockMessageQuery),
  create: vi.fn().mockResolvedValue({ toObject: () => mockMessageData }),
};

vi.mock('../../src/models/Chat.js', () => {
  const model = vi.fn(function (data: Record<string, unknown>) {
    return createMockChatInstance(data);
  });
  Object.assign(model, mockChatModel);
  return { default: model };
});

vi.mock('../../src/models/Message.js', () => {
  const model = vi.fn();
  Object.assign(model, mockMessageModel);
  return { default: model };
});

describe('Chat Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChatQuery.sort.mockReturnValue(mockChatQuery);
    mockChatQuery.lean.mockResolvedValue([mockChatData]);
    mockChatFindByIdQuery.lean.mockReset();
    mockChatModel.findById.mockReturnValue(mockChatFindByIdQuery);
    mockMessageQuery.sort.mockReturnValue(mockMessageQuery);
    mockMessageQuery.limit.mockReturnValue(mockMessageQuery);
    mockMessageQuery.lean.mockResolvedValue([mockMessageData]);
  });

  describe('getChats', () => {
    it('should return user chats', async () => {
      const { getChats } = await import('../../src/services/chat/controller.js');

      const req = { user: { userId: '507f1f77bcf86cd799439012' } };
      const res = { json: vi.fn() };

      await getChats(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should return 401 when not authenticated', async () => {
      const { getChats } = await import('../../src/services/chat/controller.js');

      const req = { user: null };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getChats(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('createChat', () => {
    it('should create chat and return 201', async () => {
      const { createChat } = await import('../../src/services/chat/controller.js');

      const req = {
        body: {
          participantIds: ['507f1f77bcf86cd799439014'],
          title: 'New Chat',
        },
        user: { userId: '507f1f77bcf86cd799439012', nombre: 'Test', email: 'test@test.com' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createChat(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('sendMessage', () => {
    it('should send message and return 201', async () => {
      const savedChat = createMockChatInstance();
      mockChatModel.findById.mockReturnValue({
        ...savedChat,
        save: vi.fn().mockResolvedValue(true),
      });

      const { sendMessage } = await import('../../src/services/chat/controller.js');

      const req = {
        params: { chatId: '507f1f77bcf86cd799439011' },
        body: { content: 'Hello!' },
        user: { userId: '507f1f77bcf86cd799439012' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await sendMessage(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getMessages', () => {
    it('should return messages for a chat', async () => {
      mockChatFindByIdQuery.lean.mockResolvedValue(mockChatData);

      const { getMessages } = await import('../../src/services/chat/controller.js');

      const req = {
        params: { chatId: '507f1f77bcf86cd799439011' },
        query: { limit: '20' },
        user: { userId: '507f1f77bcf86cd799439012' },
      };
      const res = { json: vi.fn() };

      await getMessages(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });
  });
});
