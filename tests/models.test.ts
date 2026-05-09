import { describe, it, expect, beforeEach } from "vitest";
import type { IVacante } from "../src/types/vacante.js";
import type { IUsuario } from "../src/types/usuario.js";

/**
 * Tests para tipos de TypeScript
 * @en Tests for TypeScript types
 */
describe("TypeScript Types", () => {
  /**
   * Test: Interfaz IVacante
   * @en Test: IVacante interface
   */
  describe("IVacante", () => {
    it("should have required fields | debería tener campos requeridos", () => {
      const vacante: IVacante = {
        titulo: "Desarrollador Frontend",
        empresa: "Tech Corp",
        ubicacion: "Remoto",
        url: "desarrollador-frontend-abc123",
        skills: ["React", "TypeScript"],
        candidatos: [],
        autor: {} as unknown as import("mongoose").Types.ObjectId,
      };

      expect(vacante.titulo).toBe("Desarrollador Frontend");
      expect(vacante.empresa).toBe("Tech Corp");
      expect(vacante.skills).toHaveLength(2);
    });

    it("should allow optional fields | debería permitir campos opcionales", () => {
      const vacante: IVacante = {
        titulo: "Desarrollador Backend",
        empresa: "API Inc",
        ubicacion: "Madrid",
        url: "backend-dev-xyz789",
        skills: ["Node", "Express"],
        candidatos: [
          { nombre: "Juan", email: "juan@test.com", cv: "juan.pdf" },
        ],
        autor: {} as unknown as import("mongoose").Types.ObjectId,
        salario: "30000-50000",
        contrato: "Indefinido",
        descripcion: "Desarrollador con experiencia",
      };

      expect(vacante.salario).toBeDefined();
      expect(vacante.contrato).toBeDefined();
      expect(vacante.candidatos).toHaveLength(1);
    });
  });

  /**
   * Test: Interfaz IUsuario
   * @en Test: IUsuario interface
   */
  describe("IUsuario", () => {
    it("should have required fields | debería tener campos requeridos", () => {
      const usuario: IUsuario = {
        nombre: "Juan Pérez",
        email: "juan@example.com",
        password: "hashed_password",
      };

      expect(usuario.nombre).toBe("Juan Pérez");
      expect(usuario.email).toBe("juan@example.com");
      expect(usuario.password).toBeDefined();
    });

    it("should allow optional fields | debería permitir campos opcionales", () => {
      const usuario: IUsuario = {
        nombre: "María García",
        email: "maria@example.com",
        password: "hashed_password_123",
        imagen: "perfil.jpg",
        token: "reset-token-abc",
        expira: new Date("2025-12-31"),
      };

      expect(usuario.imagen).toBe("perfil.jpg");
      expect(usuario.token).toBeDefined();
      expect(usuario.expira).toBeInstanceOf(Date);
    });
  });
});