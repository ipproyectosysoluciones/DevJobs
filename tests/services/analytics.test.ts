/**
 * @fileoverview Tests para el servicio de analíticas
 * @fileoverview Analytics service tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Analytics Service', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('trackEvent', () => {
    it('should register a valid event and return 201', async () => {
      const { trackEvent } = await import('../../src/services/analytics/controller.js');
      
      const req = {
        body: { eventType: 'page_view', data: { page: '/' } },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        user: { userId: 'user123' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      trackEvent(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Evento registrado' })
      );
    });

    it('should return 400 for invalid event type', async () => {
      const { trackEvent } = await import('../../src/services/analytics/controller.js');
      
      const req = {
        body: { eventType: 'invalid_type' },
        ip: '127.0.0.1',
        headers: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      trackEvent(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Tipo de evento inválido' })
      );
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard metrics', async () => {
      const { getDashboard } = await import('../../src/services/analytics/controller.js');
      
      const req = {};
      const res = {
        json: vi.fn(),
      };

      getDashboard(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalUsers: expect.any(Number),
          totalJobs: expect.any(Number),
        })
      );
    });
  });

  describe('getVisitTrends', () => {
    it('should return trends with default 30 days', async () => {
      const { getVisitTrends } = await import('../../src/services/analytics/controller.js');
      
      const req = { query: {} };
      const res = {
        json: vi.fn(),
      };

      getVisitTrends(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            label: expect.any(String),
            value: expect.any(Number),
          }),
        ])
      );
    });

    it('should respect days query parameter', async () => {
      const { getVisitTrends } = await import('../../src/services/analytics/controller.js');
      
      const req = { query: { days: '7' } };
      const res = {
        json: vi.fn(),
      };

      getVisitTrends(req as any, res as any);

      const trends = (res.json as any).mock.calls[0][0];
      expect(trends).toHaveLength(7);
    });
  });

  describe('getRecentEvents', () => {
    it('should return recent events array', async () => {
      const { getRecentEvents } = await import('../../src/services/analytics/controller.js');
      
      const req = { query: {} };
      const res = {
        json: vi.fn(),
      };

      getRecentEvents(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });
  });
});
