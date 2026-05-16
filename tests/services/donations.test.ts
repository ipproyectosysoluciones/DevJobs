/**
 * @fileoverview Tests para el servicio de Donaciones
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDonationData = {
  _id: '507f1f77bcf86cd799439011',
  userId: '507f1f77bcf86cd799439012',
  amount: 50,
  currency: 'USD',
  paymentMethod: 'stripe',
  planId: 'plan_2',
  status: 'pending',
  transactionId: 'stripe_507f1f77bcf86cd799439013',
  createdAt: new Date(),
  toObject: vi.fn().mockReturnThis(),
};

const mockDonationModel = {
  find: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
};

vi.mock('../../src/models/Donation.js', () => {
  const model = vi.fn();
  Object.assign(model, mockDonationModel);
  return { default: model };
});

describe('Donations Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPlans', () => {
    it('should return active donation plans sorted by order', async () => {
      const { getPlans } = await import('../../src/services/donations/controller.js');

      const req = {};
      const res = {
        json: vi.fn(),
      };

      getPlans(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ _id: 'plan_1', name: 'Supporter' }),
          expect.objectContaining({ _id: 'plan_2', name: 'Sponsor' }),
          expect.objectContaining({ _id: 'plan_3', name: 'Patron' }),
        ])
      );

      const plans = res.json.mock.calls[0][0];
      expect(plans[0].order).toBeLessThan(plans[1].order);
      expect(plans[1].order).toBeLessThan(plans[2].order);
    });

    it('should only return active plans', async () => {
      const { getPlans } = await import('../../src/services/donations/controller.js');

      const req = {};
      const res = {
        json: vi.fn(),
      };

      getPlans(req as any, res as any);

      const plans = res.json.mock.calls[0][0];
      expect(plans.every((p: { isActive: boolean }) => p.isActive)).toBe(true);
    });
  });

  describe('createDonation', () => {
    it('should create a pending donation and return 201', async () => {
      mockDonationModel.create.mockResolvedValue({
        ...mockDonationData,
        _id: 'new_donation_id',
      });

      const { createDonation } = await import('../../src/services/donations/controller.js');

      const req = {
        body: { amount: 25, currency: 'USD', paymentMethod: 'paypal', planId: 'plan_1' },
        user: { userId: 'user123' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createDonation(req as any, res as any);

      expect(mockDonationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          amount: 25,
          currency: 'USD',
          paymentMethod: 'paypal',
          status: 'pending',
          planId: 'plan_1',
        })
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          checkoutUrl: expect.stringContaining('paypal.com'),
        })
      );
    });

    it('should return 400 for invalid amount', async () => {
      const { createDonation } = await import('../../src/services/donations/controller.js');

      const req = {
        body: { amount: 0, paymentMethod: 'stripe' },
        user: { userId: 'user123' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createDonation(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Monto inválido' })
      );
    });

    it('should handle anonymous users', async () => {
      mockDonationModel.create.mockResolvedValue(mockDonationData);

      const { createDonation } = await import('../../src/services/donations/controller.js');

      const req = {
        body: { amount: 10, paymentMethod: 'stripe' },
        user: undefined,
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createDonation(req as any, res as any);

      expect(mockDonationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'anonymous' })
      );
    });
  });

  describe('confirmDonation', () => {
    it('should confirm a donation successfully', async () => {
      const mockSave = vi.fn().mockResolvedValue(true);
      const mockDonation = {
        ...mockDonationData,
        status: 'pending',
        save: mockSave,
      };

      mockDonationModel.findById.mockResolvedValue(mockDonation);

      const { confirmDonation } = await import('../../src/services/donations/controller.js');

      const req = {
        params: { donationId: '507f1f77bcf86cd799439011' },
        body: { transactionId: 'tx_123', status: 'completed' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await confirmDonation(req as any, res as any);

      expect(mockDonationModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockDonation.status).toBe('completed');
      expect(mockDonation.transactionId).toBe('tx_123');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should return 400 for invalid donation ID', async () => {
      const { confirmDonation } = await import('../../src/services/donations/controller.js');

      const req = {
        params: { donationId: 'invalid-id' },
        body: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await confirmDonation(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID inválido' });
    });

    it('should return 404 for non-existent donation', async () => {
      mockDonationModel.findById.mockResolvedValue(null);

      const { confirmDonation } = await import('../../src/services/donations/controller.js');

      const req = {
        params: { donationId: '507f1f77bcf86cd799439099' },
        body: { status: 'completed' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await confirmDonation(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getMyDonations', () => {
    it("should return the authenticated user's donations", async () => {
      mockDonationModel.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([mockDonationData]),
        }),
      });

      const { getMyDonations } = await import('../../src/services/donations/controller.js');

      const req = { user: { userId: 'user123' } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await getMyDonations(req as any, res as any);

      expect(mockDonationModel.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ amount: 50 })])
      );
    });

    it('should return 401 without authentication', async () => {
      const { getMyDonations } = await import('../../src/services/donations/controller.js');

      const req = { user: undefined };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getMyDonations(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('getStats', () => {
    it('should return aggregated donation stats', async () => {
      mockDonationModel.find.mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          { ...mockDonationData, amount: 100, userId: { toString: () => 'user1' }, createdAt: new Date('2026-01-01') },
          { ...mockDonationData, amount: 50, userId: { toString: () => 'user2' }, createdAt: new Date('2026-01-15') },
          { ...mockDonationData, amount: 75, userId: { toString: () => 'user1' }, createdAt: new Date('2026-02-01') },
        ]),
      });

      const { getStats } = await import('../../src/services/donations/controller.js');

      const req = {};
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await getStats(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 225,
          totalDonations: 3,
          uniqueDonors: 2,
          averageDonation: 75,
          largestDonation: 100,
          smallestDonation: 50,
        })
      );
    });

    it('should return empty stats when no donations exist', async () => {
      mockDonationModel.find.mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      });

      const { getStats } = await import('../../src/services/donations/controller.js');

      const req = {};
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await getStats(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 0,
          totalDonations: 0,
          uniqueDonors: 0,
        })
      );
    });
  });
});
