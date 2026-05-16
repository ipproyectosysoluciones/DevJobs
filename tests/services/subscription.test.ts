/**
 * @fileoverview Tests para el servicio de suscripciones
 * @fileoverview Subscription service tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Query object (lo que devuelve findOne/find - un Query de Mongoose)
const mockQuery = {
  sort: vi.fn(),
  skip: vi.fn(),
  limit: vi.fn(),
  populate: vi.fn(),
};

// Mock del modelo Subscription
const mockSubscription = {
  findOne: vi.fn().mockReturnValue(mockQuery),
  findByIdAndUpdate: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  find: vi.fn().mockReturnValue(mockQuery),
  countDocuments: vi.fn(),
};

vi.mock('../../src/models/Subscription.js', () => ({
  default: mockSubscription,
}));

describe('Subscription Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mockQuery chain defaults
    mockQuery.sort.mockReturnValue(mockQuery);
    mockQuery.skip.mockReturnValue(mockQuery);
    mockQuery.limit.mockReturnValue(mockQuery);
    mockQuery.populate.mockReturnValue(mockQuery);
  });

  describe('getSubscription', () => {
    it('should return subscription when found', async () => {
      const mockSub = {
        userId: 'user123',
        plan: 'premium',
        status: 'active',
      };
      mockQuery.sort.mockResolvedValue(mockSub);

      // Importar después del mock
      const { getSubscription } = await import('../../src/services/subscription/controller.js');
      
      // Mock request/response
      const req = { params: { userId: 'user123' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getSubscription(req as any, res as any);
      
      expect(mockSubscription.findOne).toHaveBeenCalledWith({
        userId: 'user123',
        status: 'active',
      });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith(mockSub);
    });

    it('should return 404 when no subscription found', async () => {
      mockQuery.sort.mockResolvedValue(null);

      const { getSubscription } = await import('../../src/services/subscription/controller.js');
      
      const req = { params: { userId: 'user123' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getSubscription(req as any, res as any);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createSubscription', () => {
    it('should create subscription with default values', async () => {
      mockSubscription.create.mockResolvedValue({
        userId: 'user123',
        plan: 'free',
        status: 'active',
      });

      const { createSubscription } = await import('../../src/services/subscription/controller.js');
      
      const req = { body: { userId: 'user123' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createSubscription(req as any, res as any);
      
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription successfully', async () => {
      mockSubscription.findByIdAndUpdate.mockResolvedValue({
        _id: 'sub123',
        plan: 'premium',
      });

      const { updateSubscription } = await import('../../src/services/subscription/controller.js');
      
      const req = { params: { id: 'sub123' }, body: { plan: 'premium' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await updateSubscription(req as any, res as any);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      mockSubscription.findByIdAndUpdate.mockResolvedValue({
        _id: 'sub123',
        status: 'cancelled',
      });

      const { cancelSubscription } = await import('../../src/services/subscription/controller.js');
      
      const req = { params: { id: 'sub123' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await cancelSubscription(req as any, res as any);
      
      expect(res.json).toHaveBeenCalled();
    });
  });
});
