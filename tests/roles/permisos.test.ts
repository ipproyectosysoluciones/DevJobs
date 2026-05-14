/**
 * @fileoverview Tests para middleware de permisos
 * @fileoverview Tests for permissions middleware
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("../../src/services/roles/mongodbController.js", () => ({
  getRolePermissions: vi.fn(),
}));

vi.mock("../../src/models/Role.js", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

// ─── Import after mocks ────────────────────────────────────────────────────

import {
  getUserPermissions,
  hasPermission,
  verificarPermiso,
  soloAdmin,
} from "../../src/middleware/permisos.js";
import * as mongodbController from "../../src/services/roles/mongodbController.js";

describe("permisos middleware", () => {
  let getRolePermissionsMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    getRolePermissionsMock = mongodbController.getRolePermissions as ReturnType<typeof vi.fn>;
  });

  describe("getUserPermissions", () => {
    it("should return permissions from MongoDB when available", async () => {
      getRolePermissionsMock.mockResolvedValue(["*", "users:read"]);

      const permissions = await getUserPermissions("admin");

      expect(getRolePermissionsMock).toHaveBeenCalledWith("admin");
      expect(permissions).toEqual(["*", "users:read"]);
    });

    it("should fallback to local ROLE_PERMISSIONS_FALLBACK on MongoDB error", async () => {
      getRolePermissionsMock.mockRejectedValue(new Error("DB unavailable"));

      const permissions = await getUserPermissions("admin");

      expect(permissions).toEqual(["*"]);
    });

    it("should return empty array for unknown role when fallback also fails", async () => {
      getRolePermissionsMock.mockRejectedValue(new Error("DB unavailable"));

      // Role not in fallback
      const permissions = await getUserPermissions("unknown_role");

      expect(permissions).toEqual([]);
    });
  });

  describe("hasPermission", () => {
    it("should return true when user has the required permission", async () => {
      getRolePermissionsMock.mockResolvedValue(["*", "users:read"]);

      const result = await hasPermission("admin", "users:read");

      expect(result).toBe(true);
    });

    it("should return true when user has wildcard permission", async () => {
      getRolePermissionsMock.mockResolvedValue(["*"]);

      const result = await hasPermission("admin", "users:delete");

      expect(result).toBe(true);
    });

    it("should return false when user lacks required permission", async () => {
      getRolePermissionsMock.mockResolvedValue(["users:read"]);

      const result = await hasPermission("job_seeker", "users:delete");

      expect(result).toBe(false);
    });

    it("should return false for unknown role", async () => {
      getRolePermissionsMock.mockResolvedValue([]);

      const result = await hasPermission("unknown", "users:read");

      expect(result).toBe(false);
    });
  });

  describe("verificarPermiso", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        user: undefined,
        flash: vi.fn(),
      } as unknown as Request;
      
      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        redirect: vi.fn(),
      } as unknown as Response;
      
      next = vi.fn();
    });

    it("should call next() when user has permission", async () => {
      getRolePermissionsMock.mockResolvedValue(["*"]);

      const middleware = verificarPermiso("users:read");
      
      req.user = { role: "admin" } as any;
      
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it("should redirect to /administracion when user lacks permission", async () => {
      getRolePermissionsMock.mockResolvedValue(["users:read"]);

      const middleware = verificarPermiso("users:delete");
      
      req.user = { role: "job_seeker" } as any;
      
      await middleware(req as Request, res as Response, next);

      expect(res.redirect).toHaveBeenCalledWith("/administracion");
    });

    it("should redirect to login when user is not authenticated", async () => {
      const middleware = verificarPermiso("users:read");
      
      req.user = undefined;
      
      await middleware(req as Request, res as Response, next);

      expect(res.redirect).toHaveBeenCalledWith("/iniciar-sesion");
    });
  });

  describe("soloAdmin", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        user: undefined,
        flash: vi.fn(),
      } as unknown as Request;
      
      res = {
        redirect: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      
      next = vi.fn();
    });

    it("should call next() when user is admin", async () => {
      getRolePermissionsMock.mockResolvedValue(["*"]);

      const middleware = soloAdmin();
      
      req.user = { role: "admin" } as any;
      
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it("should redirect to /administracion when user is not admin", async () => {
      getRolePermissionsMock.mockResolvedValue(["jobs:read"]);

      const middleware = soloAdmin();
      
      req.user = { role: "employer" } as any;
      
      await middleware(req as Request, res as Response, next);

      expect(res.redirect).toHaveBeenCalledWith("/administracion");
    });

    it("should redirect to login when user is not authenticated", async () => {
      const middleware = soloAdmin();
      
      req.user = undefined;
      
      await middleware(req as Request, res as Response, next);

      expect(res.redirect).toHaveBeenCalledWith("/iniciar-sesion");
    });
  });
});