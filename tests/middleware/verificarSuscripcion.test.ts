/**
 * @fileoverview Tests para middleware de verificación de suscripción
 * @fileoverview Subscription verification middleware tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Query object (lo que devuelve findOne - un Query de Mongoose)
const mockQuery = {
  sort: vi.fn(),
};

// Mock del modelo Subscription
const mockSubscription = {
  findOne: vi.fn().mockReturnValue(mockQuery),
};

vi.mock('../../src/models/Subscription.js', () => ({
  default: mockSubscription,
}));

describe('verificarSuscripcion Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.sort.mockReturnValue(mockQuery);
  });

  it('should allow access for user with sufficient plan', async () => {
    mockQuery.sort.mockResolvedValue({
      plan: 'premium',
      status: 'active',
    });

    const { verificarSuscripcion } = await import('../../src/middleware/verificarSuscripcion.js');
    
    const middleware = verificarSuscripcion('basic');
    const req = { user: { _id: 'user123' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    await middleware(req as any, res as any, next);
    
    expect(next).toHaveBeenCalled();
  });

  it('should deny access for user with insufficient plan', async () => {
    mockQuery.sort.mockResolvedValue({
      plan: 'free',
      status: 'active',
    });

    const { verificarSuscripcion } = await import('../../src/middleware/verificarSuscripcion.js');
    
    const middleware = verificarSuscripcion('premium');
    const req = { user: { _id: 'user123' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    await middleware(req as any, res as any, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Insufficient subscription',
      })
    );
  });

  it('should assume free plan for users without subscription', async () => {
    mockQuery.sort.mockResolvedValue(null);

    const { verificarSuscripcion } = await import('../../src/middleware/verificarSuscripcion.js');
    
    const middleware = verificarSuscripcion('premium');
    const req = { user: { _id: 'user123' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    await middleware(req as any, res as any, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should deny access for unauthenticated users', async () => {
    const { verificarSuscripcion } = await import('../../src/middleware/verificarSuscripcion.js');
    
    const middleware = verificarSuscripcion('basic');
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    await middleware(req as any, res as any, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
  });

  describe('soloPremium', () => {
    it('should only allow premium users', async () => {
      mockQuery.sort.mockResolvedValue({
        plan: 'premium',
        status: 'active',
      });

      const { soloPremium } = await import('../../src/middleware/verificarSuscripcion.js');
      
      const middleware = soloPremium();
      const req = { user: { _id: 'user123' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req as any, res as any, next);
      
      expect(next).toHaveBeenCalled();
    });
  });
});
