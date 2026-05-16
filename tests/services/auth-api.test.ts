/**
 * @fileoverview Tests para el servicio de autenticación JWT
 * @fileoverview Auth API service tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Auth API Service', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('register', () => {
    it('should register a new user and return 201 with token', async () => {
      const { register } = await import('../../src/services/auth/controller.js');

      const req = {
        body: {
          email: 'test-reg@devjobs.com',
          password: 'password123',
          name: 'Test User',
          role: 'job_seeker',
        },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await register(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            email: 'test-reg@devjobs.com',
            name: 'Test User',
          }),
        })
      );
    });

    it('should return 400 if user already exists', async () => {
      const { register } = await import('../../src/services/auth/controller.js');

      const req = {
        body: {
          email: 'test-dupe@devjobs.com',
          password: 'password123',
          name: 'Test Dupe',
          role: 'job_seeker',
        },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await register(req as any, res as any);

      const res2 = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      await register(req as any, res2 as any);

      expect(res2.status).toHaveBeenCalledWith(400);
      expect(res2.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'El usuario ya existe' })
      );
    });
  });

  describe('login', () => {
    it('should login with valid credentials and return token', async () => {
      const { register, login } = await import('../../src/services/auth/controller.js');

      const registerReq = {
        body: {
          email: 'login-test@devjobs.com',
          password: 'password123',
          name: 'Login User',
          role: 'job_seeker',
        },
      };
      const registerRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      await register(registerReq as any, registerRes as any);

      const loginReq = {
        body: {
          email: 'login-test@devjobs.com',
          password: 'password123',
        },
      };
      const loginRes = {
        json: vi.fn(),
      };

      await login(loginReq as any, loginRes as any);

      expect(loginRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            email: 'login-test@devjobs.com',
          }),
        })
      );
    });

    it('should return 401 with invalid credentials', async () => {
      const { login } = await import('../../src/services/auth/controller.js');

      const req = {
        body: {
          email: 'nonexistent@devjobs.com',
          password: 'wrongpassword',
        },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await login(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Credenciales inválidas' })
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile when authenticated', async () => {
      const { register, getProfile } = await import('../../src/services/auth/controller.js');

      const registerReq = {
        body: {
          email: 'profile-test@devjobs.com',
          password: 'password123',
          name: 'Profile User',
          role: 'employer',
        },
      };
      const registerRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      await register(registerReq as any, registerRes as any);
      const registerData = registerRes.json.mock.calls[0][0];

      const profileReq = { user: { id: registerData.user.id, email: 'profile-test@devjobs.com' } };
      const profileRes = {
        json: vi.fn(),
      };

      getProfile(profileReq as any, profileRes as any);

      expect(profileRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'profile-test@devjobs.com',
          name: 'Profile User',
        })
      );
    });

    it('should return 401 when not authenticated', async () => {
      const { getProfile } = await import('../../src/services/auth/controller.js');

      const req = { user: null };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      getProfile(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });
});
