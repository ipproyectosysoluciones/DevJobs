/**
 * @fileoverview Tests para el servicio de empleos
 * @fileoverview Jobs service tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockJobData = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Test Job',
  description: 'A test job',
  requirements: ['Skill A', 'Skill B'],
  employerId: '507f1f77bcf86cd799439012',
  location: { city: 'Madrid', country: 'España', remote: true },
  salary: { min: 30000, max: 50000, currency: 'EUR' },
  type: 'full-time',
  status: 'active',
  applications: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Chainable query mock for find
const mockQuery = {
  sort: vi.fn().mockReturnThis(),
  skip: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  lean: vi.fn().mockResolvedValue([]),
};

// Chainable query mock for findById
const mockFindByIdQuery = {
  lean: vi.fn(),
};

const mockJobModel = {
  find: vi.fn().mockReturnValue(mockQuery),
  findById: vi.fn().mockReturnValue(mockFindByIdQuery),
  findByIdAndDelete: vi.fn(),
  countDocuments: vi.fn().mockResolvedValue(0),
};

// Mock constructor: returns a Job-like instance
function createMockInstance(data = {}) {
  return {
    ...mockJobData,
    ...data,
    toObject: vi.fn().mockReturnThis(),
    save: vi.fn().mockResolvedValue(true),
  };
}

vi.mock('../../src/models/Job.js', () => {
  const model = vi.fn(function (data: Record<string, unknown>) {
    return createMockInstance(data);
  });
  Object.assign(model, mockJobModel);
  return { default: model };
});

describe('Jobs Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.sort.mockReturnValue(mockQuery);
    mockQuery.skip.mockReturnValue(mockQuery);
    mockQuery.limit.mockReturnValue(mockQuery);
    mockQuery.lean.mockResolvedValue([]);
    mockFindByIdQuery.lean.mockReset();
    mockJobModel.findById.mockReturnValue(mockFindByIdQuery);
  });

  describe('getJobs', () => {
    it('should return paginated jobs list', async () => {
      const jobsList = [{ ...mockJobData, _id: '1' }, { ...mockJobData, _id: '2' }];
      mockQuery.lean.mockResolvedValue(jobsList);
      mockJobModel.countDocuments.mockResolvedValue(2);

      const { getJobs } = await import('../../src/services/jobs/controller.js');

      const req = { query: { page: '1', limit: '10' } };
      const res = { json: vi.fn() };

      await getJobs(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          jobs: expect.any(Array),
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        })
      );
    });

    it('should apply search filter', async () => {
      const { getJobs } = await import('../../src/services/jobs/controller.js');

      const req = { query: { search: 'frontend', page: '1', limit: '10' } };
      const res = { json: vi.fn() };

      await getJobs(req as any, res as any);

      expect(mockJobModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
        })
      );
    });
  });

  describe('getJobById', () => {
    it('should return job when found', async () => {
      mockFindByIdQuery.lean.mockResolvedValue(mockJobData);

      const { getJobById } = await import('../../src/services/jobs/controller.js');

      const req = { params: { id: '507f1f77bcf86cd799439011' } };
      const res = { json: vi.fn() };

      await getJobById(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(mockJobData);
    });

    it('should return 404 when job not found', async () => {
      mockFindByIdQuery.lean.mockResolvedValue(null);

      const { getJobById } = await import('../../src/services/jobs/controller.js');

      const req = { params: { id: '507f1f77bcf86cd799439011' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getJobById(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createJob', () => {
    it('should create job and return 201', async () => {
      const { default: JobModel } = await import('../../src/models/Job.js');

      // The constructor mock handles instantiation
      const { createJob } = await import('../../src/services/jobs/controller.js');

      const req = {
        body: {
          title: 'New Job',
          description: 'Description',
          requirements: ['Skill A'],
          type: 'full-time',
        },
        user: { userId: '507f1f77bcf86cd799439012' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createJob(req as any, res as any);

      expect(JobModel).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Job' })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('deleteJob', () => {
    it('should return 403 when not the owner', async () => {
      const job = createMockInstance({ employerId: '507f1f77bcf86cd799439099' });
      mockFindByIdQuery.lean.mockReset();
      mockJobModel.findById.mockResolvedValue(job);

      const { deleteJob } = await import('../../src/services/jobs/controller.js');

      const req = {
        params: { id: '507f1f77bcf86cd799439011' },
        user: { userId: 'other-user', role: 'job_seeker' },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await deleteJob(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should succeed when user is owner', async () => {
      const job = createMockInstance({ employerId: 'owner-id' });
      mockJobModel.findById.mockResolvedValue(job);

      const { deleteJob } = await import('../../src/services/jobs/controller.js');

      const req = {
        params: { id: '507f1f77bcf86cd799439011' },
        user: { userId: 'owner-id', role: 'employer' },
      };
      const res = {
        json: vi.fn(),
      };

      await deleteJob(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Empleo eliminado' })
      );
    });
  });
});
