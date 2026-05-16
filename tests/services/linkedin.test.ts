/**
 * @fileoverview Tests para el servicio de LinkedIn
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios for LinkedIn API helpers (dynamic import in controller)
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockProfileData = {
  _id: '507f1f77bcf86cd799439011',
  userId: '507f1f77bcf86cd799439012',
  linkedInId: 'linkedin-user-123',
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  profile: {
    localizedFirstName: 'John',
    localizedLastName: 'Doe',
    profilePicture: 'https://example.com/pic.jpg',
    email: 'john@example.com',
    headline: 'Software Engineer',
  },
  connectedAt: new Date(),
  lastSyncedAt: new Date(),
  toObject: vi.fn().mockReturnThis(),
  save: vi.fn().mockResolvedValue(true),
};

const mockLinkedInProfileModel = {
  findOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
  deleteOne: vi.fn(),
};

vi.mock('../../src/models/LinkedInProfile.js', () => {
  const model = vi.fn();
  Object.assign(model, mockLinkedInProfileModel);
  return { default: model };
});

describe('LinkedIn Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthorizationUrl', () => {
    it('should return authorization URL when client ID is configured', async () => {
      process.env.LINKEDIN_CLIENT_ID = 'test-client-id';

      const { getAuthorizationUrl } = await import('../../src/services/linkedin/controller.js');

      const req = {};
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      getAuthorizationUrl(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          authorizationUrl: expect.stringContaining('linkedin.com/oauth/v2/authorization'),
          state: expect.any(String),
        })
      );

      const result = res.json.mock.calls[0][0];
      const url = new URL(result.authorizationUrl);
      expect(url.searchParams.get('client_id')).toBe('test-client-id');
    });

    it('should return 500 when client ID is not configured', async () => {
      delete process.env.LINKEDIN_CLIENT_ID;

      const { getAuthorizationUrl } = await import('../../src/services/linkedin/controller.js');

      const req = {};
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      getAuthorizationUrl(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'LinkedIn no configurado' })
      );
    });
  });

  describe('handleCallback', () => {
    it('should return 400 when authorization code is missing', async () => {
      const { handleCallback } = await import('../../src/services/linkedin/controller.js');

      const req = {
        query: { error: 'access_denied' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await handleCallback(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when code is missing', async () => {
      const { handleCallback } = await import('../../src/services/linkedin/controller.js');

      const req = { query: {} };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await handleCallback(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Código de autorización faltante' })
      );
    });
  });

  describe('getLinkedProfile', () => {
    it('should return linked profile for authenticated user', async () => {
      mockLinkedInProfileModel.findOne.mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockProfileData),
      });

      const { getLinkedProfile } = await import('../../src/services/linkedin/controller.js');

      const req = { user: { userId: 'user123' } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await getLinkedProfile(req as any, res as any);

      expect(mockLinkedInProfileModel.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'linkedin-user-123',
          firstName: 'John',
          lastName: 'Doe',
          connected: true,
        })
      );
    });

    it('should return 404 when profile is not linked', async () => {
      mockLinkedInProfileModel.findOne.mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      });

      const { getLinkedProfile } = await import('../../src/services/linkedin/controller.js');

      const req = { user: { userId: 'user123' } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await getLinkedProfile(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 401 without authentication', async () => {
      const { getLinkedProfile } = await import('../../src/services/linkedin/controller.js');

      const req = { user: undefined };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getLinkedProfile(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('syncProfile', () => {
    it('should sync and update lastSyncedAt', async () => {
      // Mock axios responses for LinkedIn API calls
      const axios = await import('axios');
      (axios.default.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { sub: 'linkedin-user-123', given_name: 'John', family_name: 'Doe' },
      });
      (axios.default.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { access_token: 'new-token', refresh_token: 'new-refresh' },
      });

      const mockDoc = {
        ...mockProfileData,
        accessToken: 'new-token',
        save: vi.fn().mockResolvedValue(true),
      };

      mockLinkedInProfileModel.findOne.mockResolvedValue(mockDoc);

      const { syncProfile } = await import('../../src/services/linkedin/controller.js');

      const req = { user: { userId: 'user123' } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await syncProfile(req as any, res as any);

      expect(mockLinkedInProfileModel.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockDoc.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Perfil sincronizado' })
      );
    });

    it('should return 404 when no LinkedIn profile exists', async () => {
      mockLinkedInProfileModel.findOne.mockResolvedValue(null);

      const { syncProfile } = await import('../../src/services/linkedin/controller.js');

      const req = { user: { userId: 'user123' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await syncProfile(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 401 without authentication', async () => {
      const { syncProfile } = await import('../../src/services/linkedin/controller.js');

      const req = { user: undefined };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await syncProfile(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('disconnect', () => {
    it('should delete LinkedIn profile and return success', async () => {
      mockLinkedInProfileModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const { disconnect } = await import('../../src/services/linkedin/controller.js');

      const req = { user: { userId: 'user123' } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await disconnect(req as any, res as any);

      expect(mockLinkedInProfileModel.deleteOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Cuenta de LinkedIn desvinculada' })
      );
    });

    it('should return 401 without authentication', async () => {
      const { disconnect } = await import('../../src/services/linkedin/controller.js');

      const req = { user: undefined };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await disconnect(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('searchJobs', () => {
    it('should return mock jobs with default params', async () => {
      const { searchJobs } = await import('../../src/services/linkedin/controller.js');

      const req = { query: {} };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await searchJobs(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          jobs: expect.any(Array),
          total: expect.any(Number),
        })
      );

      const result = res.json.mock.calls[0][0];
      expect(result.jobs.length).toBeLessThanOrEqual(10);
    });

    it('should include keyword and location in job results', async () => {
      const { searchJobs } = await import('../../src/services/linkedin/controller.js');

      const req = { query: { keyword: 'React', location: 'Remote' } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await searchJobs(req as any, res as any);

      const result = res.json.mock.calls[0][0];
      expect(result.jobs[0].title).toContain('React');
      expect(result.jobs[0].location).toBe('Remote');
    });
  });

  describe('getJobDetails', () => {
    it('should return job details for given jobId', async () => {
      const { getJobDetails } = await import('../../src/services/linkedin/controller.js');

      const req = { params: { jobId: 'linkedin_job_42' } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await getJobDetails(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'linkedin_job_42',
          title: expect.any(String),
          company: expect.any(String),
        })
      );
    });
  });
});
