/**
 * @fileoverview Tests para adminRolesController
 * @fileoverview Tests for adminRolesController
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import * as adminRolesController from "../../src/controllers/adminRolesController.js";

// ─── Setup mocks ───────────────────────────────────────────────────────────────

vi.mock("../../src/models/Role.js", () => ({
  default: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../src/models/Usuarios.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

// Import after mocks
import Role from "../../src/models/Role.js";
import Usuario from "../../src/models/Usuarios.js";

// Helper to cast vi.fn()
const mockFn = () => vi.fn();

describe("adminRolesController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    req = {
      params: {},
      body: {},
      flash: vi.fn(),
    } as unknown as Request;
    
    res = {
      redirect: vi.fn(),
      render: vi.fn(),
    } as unknown as Response;
  });

  describe("mostrarRoles", () => {
    it("should render roles index with active roles", async () => {
      const mockRoles = [
        { name: "admin", description: "Admin", isActive: true, userCount: 2 },
        { name: "employer", description: "Employer", isActive: true, userCount: 5 },
      ];
      
      (Role.find as ReturnType<typeof vi.fn>).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockRoles),
      } as any);

      await adminRolesController.mostrarRoles(req as Request, res as Response);

      expect(res.render).toHaveBeenCalledWith(
        "roles/index",
        expect.objectContaining({
          nombrePagina: "Gestión de Roles | Role Management",
          roles: mockRoles,
        })
      );
    });

    it("should redirect on error", async () => {
      (Role.find as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error("DB error");
      });

      await adminRolesController.mostrarRoles(req as Request, res as Response);

      expect(req.flash).toHaveBeenCalledWith("error", "Error al cargar los roles");
      expect(res.redirect).toHaveBeenCalledWith("/administracion");
    });
  });

  describe("formCrearRol", () => {
    it("should render crear form with permissions", async () => {
      const mockRoleWithPermissions = {
        permissions: ["users:read", "jobs:create"],
      };
      
      (Role.findOne as ReturnType<typeof vi.fn>).mockResolvedValue(mockRoleWithPermissions);

      await adminRolesController.formCrearRol(req as Request, res as Response);

      expect(res.render).toHaveBeenCalledWith(
        "roles/crear",
        expect.objectContaining({
          nombrePagina: "Crear Nuevo Rol | Create New Role",
          todosPermisos: ["users:read", "jobs:create"],
        })
      );
    });

    it("should handle no roles found", async () => {
      (Role.findOne as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await adminRolesController.formCrearRol(req as Request, res as Response);

      expect(res.render).toHaveBeenCalledWith(
        "roles/crear",
        expect.objectContaining({
          todosPermisos: [],
        })
      );
    });
  });

  describe("crearRol", () => {
    it("should create role and redirect on success", async () => {
      req.body = {
        name: "new_role",
        description: "New Role Description",
        permissions: ["users:read"],
      };

      (Role.findOne as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (Role.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        name: "new_role",
        description: "New Role Description",
      });

      await adminRolesController.crearRol(req as Request, res as Response);

      expect(Role.create).toHaveBeenCalledWith({
        name: "new_role",
        description: "New Role Description",
        permissions: ["users:read"],
        isSystemRole: false,
        isActive: true,
        userCount: 0,
      });
      expect(req.flash).toHaveBeenCalledWith("mensaje", "Rol creado exitosamente");
      expect(res.redirect).toHaveBeenCalledWith("/admin/roles");
    });

    it("should redirect if role already exists", async () => {
      req.body = {
        name: "existing_role",
        description: "Existing Role",
      };

      (Role.findOne as ReturnType<typeof vi.fn>).mockResolvedValue({ name: "existing_role" });

      await adminRolesController.crearRol(req as Request, res as Response);

      expect(req.flash).toHaveBeenCalledWith("error", "El rol ya existe");
      expect(res.redirect).toHaveBeenCalledWith("/admin/roles/crear");
    });

    it("should redirect if name or description missing", async () => {
      req.body = { name: "", description: "" };

      await adminRolesController.crearRol(req as Request, res as Response);

      expect(req.flash).toHaveBeenCalledWith("error", "El nombre y descripción del rol son requeridos");
      expect(res.redirect).toHaveBeenCalledWith("/admin/roles/crear");
    });
  });

  describe("formEditarRol", () => {
    it("should render editar form with role data", async () => {
      req.params = { name: "admin" };
      
      const mockRoleData = {
        name: "admin",
        description: "Admin Role",
        permissions: ["*"],
        isActive: true,
      };
      
      const mockSampleRole = {
        permissions: ["users:read", "jobs:create"],
      };

      (Role.findOne as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(mockRoleData)
        .mockResolvedValueOnce(mockSampleRole);

      await adminRolesController.formEditarRol(req as Request, res as Response);

      expect(res.render).toHaveBeenCalledWith(
        "roles/editar",
        expect.objectContaining({
          nombrePagina: "Editar Rol: admin",
          rol: mockRoleData,
        })
      );
    });

    it("should redirect if role not found", async () => {
      req.params = { name: "nonexistent" };
      
      (Role.findOne as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await adminRolesController.formEditarRol(req as Request, res as Response);

      expect(req.flash).toHaveBeenCalledWith("error", "Rol no encontrado");
      expect(res.redirect).toHaveBeenCalledWith("/admin/roles");
    });
  });

  describe("actualizarRol", () => {
    it("should update role and redirect on success", async () => {
      req.params = { name: "test_role" };
      req.body = {
        description: "Updated Description",
        permissions: ["users:read"],
      };

      const mockRoleInstance = {
        isSystemRole: false,
        description: "Old",
        permissions: [],
        isActive: true,
        save: vi.fn().mockResolvedValue(true),
      };

      (Role.findOne as ReturnType<typeof vi.fn>).mockResolvedValue(mockRoleInstance);

      await adminRolesController.actualizarRol(req as Request, res as Response);

      expect(mockRoleInstance.description).toBe("Updated Description");
      expect(mockRoleInstance.permissions).toEqual(["users:read"]);
      expect(mockRoleInstance.save).toHaveBeenCalled();
      expect(req.flash).toHaveBeenCalledWith("mensaje", "Rol actualizado exitosamente");
      expect(res.redirect).toHaveBeenCalledWith("/admin/roles");
    });

    it("should not update system roles", async () => {
      req.params = { name: "admin" };
      req.body = { description: "Trying to change" };

      const mockRoleInstance = {
        isSystemRole: true,
        save: vi.fn(),
      };

      (Role.findOne as ReturnType<typeof vi.fn>).mockResolvedValue(mockRoleInstance);

      await adminRolesController.actualizarRol(req as Request, res as Response);

      expect(req.flash).toHaveBeenCalledWith("error", "No se puede modificar un rol del sistema");
      expect(res.redirect).toHaveBeenCalledWith("/admin/roles/editar/admin");
    });
  });

  describe("eliminarRol", () => {
    it("should soft delete role on success", async () => {
      req.params = { name: "test_role" };

      const mockRoleInstance = {
        isSystemRole: false,
        isActive: true,
        save: vi.fn().mockResolvedValue(true),
      };

      (Role.findOne as ReturnType<typeof vi.fn>).mockResolvedValue(mockRoleInstance);

      await adminRolesController.eliminarRol(req as Request, res as Response);

      expect(mockRoleInstance.isActive).toBe(false);
      expect(mockRoleInstance.save).toHaveBeenCalled();
      expect(req.flash).toHaveBeenCalledWith("mensaje", "Rol eliminado exitosamente");
      expect(res.redirect).toHaveBeenCalledWith("/admin/roles");
    });

    it("should not delete system roles", async () => {
      req.params = { name: "admin" };

      const mockRoleInstance = {
        isSystemRole: true,
        save: vi.fn(),
      };

      (Role.findOne as ReturnType<typeof vi.fn>).mockResolvedValue(mockRoleInstance);

      await adminRolesController.eliminarRol(req as Request, res as Response);

      expect(req.flash).toHaveBeenCalledWith("error", "No se puede eliminar un rol del sistema");
      expect(res.redirect).toHaveBeenCalledWith("/admin/roles");
    });
  });

  describe("asignarRol", () => {
    it("should render asignar form with user and roles", async () => {
      req.params = { userId: "user123" };
      
      const mockUser = {
        _id: "user123",
        nombre: "Test User",
      };
      
      const mockRoles = [
        { name: "admin", description: "Admin" },
        { name: "employer", description: "Employer" },
      ];

      (Usuario.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
      (Role.find as ReturnType<typeof vi.fn>).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockRoles),
      } as any);

      await adminRolesController.asignarRol(req as Request, res as Response);

      expect(res.render).toHaveBeenCalledWith(
        "roles/asignar",
        expect.objectContaining({
          nombrePagina: "Asignar Rol | Assign Role",
          userId: "user123",
          roles: mockRoles,
        })
      );
    });

    it("should redirect if user not found", async () => {
      req.params = { userId: "nonexistent" };
      
      (Usuario.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await adminRolesController.asignarRol(req as Request, res as Response);

      expect(req.flash).toHaveBeenCalledWith("error", "Usuario no encontrado");
      expect(res.redirect).toHaveBeenCalledWith("/administracion");
    });
  });

  describe("procesarAsignacion", () => {
    it("should assign role and update counts", async () => {
      req.params = { userId: "user123" };
      req.body = { roleName: "employer" };
      
      const mockUser = {
        role: "job_seeker",
        save: vi.fn().mockResolvedValue(true),
      };
      
      const mockRoleInstance = {
        name: "employer",
        userCount: 5,
        save: vi.fn().mockResolvedValue(true),
      };

      (Usuario.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
      (Role.findOne as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(mockRoleInstance)
        .mockResolvedValueOnce({ name: "job_seeker", userCount: 3, save: vi.fn().mockResolvedValue(true) });

      await adminRolesController.procesarAsignacion(req as Request, res as Response);

      expect(mockUser.role).toBe("employer");
      expect(mockUser.save).toHaveBeenCalled();
      expect(req.flash).toHaveBeenCalledWith("mensaje", "Rol asignado exitosamente");
    });

    it("should redirect if role already assigned", async () => {
      req.params = { userId: "user123" };
      req.body = { roleName: "admin" };
      
      const mockUser = {
        role: "admin",
      };

      (Usuario.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
      (Role.findOne as ReturnType<typeof vi.fn>).mockResolvedValue({ name: "admin" });

      await adminRolesController.procesarAsignacion(req as Request, res as Response);

      expect(req.flash).toHaveBeenCalledWith("error", "El usuario ya tiene este rol asignado");
      expect(res.redirect).toHaveBeenCalledWith("/admin/roles/asignar/user123");
    });
  });
});