/**
 * @fileoverview Tests para mongodbController
 * @fileoverview Tests for mongodbController
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────
vi.mock("../../src/models/Role.js", () => {
  const mockRoleDocument = (overrides: Record<string, unknown> = {}) => ({
    _id: "mock-id",
    name: "test_role",
    description: "Test role",
    permissions: [],
    isSystemRole: false,
    isActive: true,
    userCount: 0,
    save: vi.fn().mockResolvedValue(true),
    toObject: vi.fn().mockReturnValue({}),
    ...overrides,
  });

  const Role = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    findByIdAndDelete: vi.fn(),
  };

  return {
    default: Object.assign(Role, { mockRoleDocument }),
    __test: { mockRoleDocument },
  };
});

vi.mock("../../src/models/Usuarios.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockReq(overrides: Record<string, unknown> = {}) {
  return {
    params: {},
    body: {},
    user: undefined,
    ...overrides,
  } as any;
}

function mockRes() {
  const res: Record<string, any> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as any;
}

/**
 * Mock Role.findOne to support .lean() chaining
 * Some functions use Role.findOne().lean(), others use Role.findOne() directly
 */
function mockFindOne(impl: ((query: any) => any) | Record<string, any>) {
  if (typeof impl === "function") {
    (Role.findOne as Mock).mockImplementation(impl);
  } else {
    (Role.findOne as Mock).mockResolvedValue(impl);
  }
}

function mockFindOneLean(result: unknown) {
  (Role.findOne as Mock).mockReturnValue({
    lean: vi.fn().mockResolvedValue(result),
  });
}

// ─── Imports (después de mocks) ─────────────────────────────────────────────

const Role = (await import("../../src/models/Role.js")).default;
const Usuario = (await import("../../src/models/Usuarios.js")).default;

const {
  getRoles,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  assignRole,
  checkPermission,
  getRolePermissions,
  initializeSystemRoles,
} = await import("../../src/services/roles/mongodbController.js");

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("mongodbController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getRolePermissions (non-Express) ─────────────────────────────────────

  describe("getRolePermissions", () => {
    it("should return permissions for an existing role", async () => {
      mockFindOneLean({
        permissions: ["jobs:read", "jobs:create"],
      });

      const result = await getRolePermissions("employer");

      expect(result).toEqual(["jobs:read", "jobs:create"]);
      expect(Role.findOne).toHaveBeenCalledWith({
        name: "employer",
        isActive: true,
      });
    });

    it("should return empty array when role not found", async () => {
      mockFindOneLean(null);

      const result = await getRolePermissions("nonexistent");

      expect(result).toEqual([]);
    });
  });

  // ── getRoles ─────────────────────────────────────────────────────────────

  describe("getRoles", () => {
    it("should return all active roles", async () => {
      const fakeRoles = [
        { name: "admin", isActive: true },
        { name: "employer", isActive: true },
      ];
      (Role.find as Mock).mockReturnValue({
        lean: vi.fn().mockResolvedValue(fakeRoles),
      });

      const req = mockReq();
      const res = mockRes();

      await getRoles(req, res);

      expect(Role.find).toHaveBeenCalledWith({ isActive: true });
      expect(res.json).toHaveBeenCalledWith(fakeRoles);
    });

    it("should return 500 on error", async () => {
      (Role.find as Mock).mockReturnValue({
        lean: vi.fn().mockRejectedValue(new Error("DB error")),
      });

      const req = mockReq();
      const res = mockRes();

      await getRoles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Error al obtener roles" }),
      );
    });
  });

  // ── getRoleByName ────────────────────────────────────────────────────────

  describe("getRoleByName", () => {
    it("should return a role by name", async () => {
      const fakeRole = { name: "employer", isActive: true };
      mockFindOneLean(fakeRole);

      const req = mockReq({ params: { name: "employer" } });
      const res = mockRes();

      await getRoleByName(req, res);

      expect(Role.findOne).toHaveBeenCalledWith({
        name: "employer",
        isActive: true,
      });
      expect(res.json).toHaveBeenCalledWith(fakeRole);
    });

    it("should return 404 when role not found", async () => {
      mockFindOneLean(null);

      const req = mockReq({ params: { name: "ghost" } });
      const res = mockRes();

      await getRoleByName(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ── createRole ───────────────────────────────────────────────────────────

  describe("createRole", () => {
    const validBody = {
      name: "custom_role",
      description: "Custom role",
      permissions: ["jobs:read"],
    };

    it("should create a new role", async () => {
      (Role.findOne as Mock).mockResolvedValue(null);
      (Role.create as Mock).mockResolvedValue({ ...validBody, isSystemRole: false });

      const req = mockReq({
        body: validBody,
        user: { role: "admin" },
      });
      const res = mockRes();

      await createRole(req, res);

      expect(Role.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should reject non-admin users", async () => {
      const req = mockReq({
        body: validBody,
        user: { role: "employer" },
      });
      const res = mockRes();

      await createRole(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(Role.create).not.toHaveBeenCalled();
    });

    it("should reject duplicate role names", async () => {
      (Role.findOne as Mock).mockResolvedValue({ name: "custom_role" });

      const req = mockReq({
        body: validBody,
        user: { role: "admin" },
      });
      const res = mockRes();

      await createRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "El rol ya existe" }),
      );
    });
  });

  // ── assignRole ───────────────────────────────────────────────────────────

  describe("assignRole", () => {
    const validReq = {
      params: { userId: "user-123" },
      body: { roleName: "employer" },
      user: { role: "admin" },
    };

    it("should assign a role to a user", async () => {
      const mockRole = {
        name: "employer",
        userCount: 5,
        save: vi.fn().mockResolvedValue(true),
      };
      (Role.findOne as Mock).mockResolvedValue(mockRole);

      const mockUser = {
        _id: "user-123",
        role: "job_seeker",
        save: vi.fn().mockResolvedValue(true),
      };
      (Usuario.findById as Mock).mockResolvedValue(mockUser);

      // First call is for targetRole, second for previousRole
      (Role.findOne as Mock).mockImplementation(async (query: any) => {
        if (query.name === "job_seeker") {
          return { name: "job_seeker", userCount: 3, save: vi.fn() };
        }
        return mockRole;
      });

      const req = mockReq(validReq);
      const res = mockRes();

      await assignRole(req, res);

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRole.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should reject invalid roleName", async () => {
      const req = mockReq({
        params: { userId: "user-123" },
        body: { roleName: "invalid_role" },
        user: { role: "admin" },
      });
      const res = mockRes();

      await assignRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("inválido") }),
      );
    });

    it("should skip reassignment when same role", async () => {
      const mockRole = {
        name: "employer",
        userCount: 5,
        save: vi.fn(),
      };
      (Role.findOne as Mock).mockResolvedValue(mockRole);

      const mockUser = {
        _id: "user-123",
        role: "employer",
        save: vi.fn(),
      };
      (Usuario.findById as Mock).mockResolvedValue(mockUser);

      const req = mockReq(validReq);
      const res = mockRes();

      await assignRole(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ alreadyAssigned: true }),
      );
      expect(mockUser.save).not.toHaveBeenCalled();
    });
  });

  // ── deleteRole ───────────────────────────────────────────────────────────

  describe("deleteRole", () => {
    it("should soft-delete a role", async () => {
      const mockRole = {
        name: "custom_role",
        isSystemRole: false,
        isActive: true,
        save: vi.fn().mockResolvedValue(true),
        _id: "role-1",
      };
      (Role.findOne as Mock).mockResolvedValue(mockRole);

      const req = mockReq({
        params: { name: "custom_role" },
        user: { role: "admin" },
      });
      const res = mockRes();

      await deleteRole(req, res);

      expect(mockRole.isActive).toBe(false);
      expect(mockRole.save).toHaveBeenCalled();
    });

    it("should reject deleting system roles", async () => {
      const mockRole = {
        name: "admin",
        isSystemRole: true,
        save: vi.fn(),
      };
      (Role.findOne as Mock).mockResolvedValue(mockRole);

      const req = mockReq({
        params: { name: "admin" },
        user: { role: "admin" },
      });
      const res = mockRes();

      await deleteRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "No se puede eliminar un rol del sistema" }),
      );
    });
  });

  // ── checkPermission ──────────────────────────────────────────────────────

  describe("checkPermission", () => {
    it("should return true when user has permission", async () => {
      mockFindOneLean({
        permissions: ["jobs:read", "jobs:create"],
      });

      const req = mockReq({
        body: { permission: "jobs:read" },
        user: { role: "employer" },
      });
      const res = mockRes();

      await checkPermission(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ hasPermission: true }),
      );
    });

    it("should return false when user lacks permission", async () => {
      mockFindOneLean({
        permissions: ["jobs:read"],
      });

      const req = mockReq({
        body: { permission: "admin:full" },
        user: { role: "employer" },
      });
      const res = mockRes();

      await checkPermission(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ hasPermission: false }),
      );
    });

    it("should return 401 when user not authenticated", async () => {
      const req = mockReq({
        body: { permission: "jobs:read" },
        user: undefined,
      });
      const res = mockRes();

      await checkPermission(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  // ── initializeSystemRoles ────────────────────────────────────────────────

  describe("initializeSystemRoles", () => {
    it("should create all system roles if none exist", async () => {
      (Role.findOne as Mock).mockResolvedValue(null);
      (Role.create as Mock).mockResolvedValue({});

      await initializeSystemRoles();

      // 5 system roles should be created
      expect(Role.create).toHaveBeenCalledTimes(5);
    });

    it("should not create already-existing system roles", async () => {
      (Role.findOne as Mock).mockResolvedValue({ name: "admin" });

      await initializeSystemRoles();

      // First role found, should skip; loop continues
      expect(Role.create).not.toHaveBeenCalled();
    });
  });
});
