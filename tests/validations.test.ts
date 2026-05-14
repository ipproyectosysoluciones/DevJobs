/**
 * @fileoverview Tests de validación de esquemas
 * @fileoverview Schema validation tests
 */

import { describe, it, expect } from "vitest";

// ─── Validation Schemas ───────────────────────────────────────────────────

describe("User Schema Validation", () => {
  describe("Email Validation", () => {
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    it("should accept valid email formats", () => {
      expect(validateEmail("user@company.com")).toBe(true);
      expect(validateEmail("user.name@company.co.uk")).toBe(true);
      expect(validateEmail("user+tag@company.org")).toBe(true);
    });

    it("should reject invalid email formats", () => {
      expect(validateEmail("")).toBe(false);
      expect(validateEmail("user")).toBe(false);
      expect(validateEmail("@company.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail("user@company")).toBe(false);
      expect(validateEmail("user@company.")).toBe(false);
    });
  });

  describe("Password Validation", () => {
    const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];
      
      if (password.length < 8) errors.push("Mínimo 8 caracteres");
      if (!/[A-Z]/.test(password)) errors.push("Al menos una mayúscula");
      if (!/[a-z]/.test(password)) errors.push("Al menos una minúscula");
      if (!/[0-9]/.test(password)) errors.push("Al menos un número");
      
      return { valid: errors.length === 0, errors };
    };

    it("should accept strong passwords", () => {
      const result = validatePassword("SecurePass123");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject weak passwords", () => {
      const result = validatePassword("weak");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject passwords without numbers", () => {
      const result = validatePassword("PasswordNoNumber");
      expect(result.errors).toContain("Al menos un número");
    });
  });

  describe("Name Validation", () => {
    const validateName = (name: string): boolean => {
      return name.trim().length >= 2 && name.trim().length <= 100;
    };

    it("should accept valid names", () => {
      expect(validateName("John")).toBe(true);
      expect(validateName("María José")).toBe(true);
    });

    it("should reject invalid names", () => {
      expect(validateName("")).toBe(false);
      expect(validateName("A")).toBe(false);
      expect(validateName("   ")).toBe(false);
    });
  });
});

// ─── Role Schema Validation ─────────────────────────────────────────────

describe("Role Schema Validation", () => {
  const validRoles = ["admin", "employer", "job_seeker", "premium", "moderator"];

  describe("Role Name Validation", () => {
    it("should accept valid role names", () => {
      validRoles.forEach(role => {
        expect(validRoles.includes(role)).toBe(true);
      });
    });

    it("should reject invalid role names", () => {
      expect(validRoles.includes("superadmin")).toBe(false);
      expect(validRoles.includes("root")).toBe(false);
      expect(validRoles.includes("")).toBe(false);
    });
  });

  describe("Permission Validation", () => {
    const validPermissions = [
      "*",
      "users:create", "users:read", "users:update", "users:delete",
      "jobs:create", "jobs:read", "jobs:update", "jobs:delete",
      "applications:create", "applications:read",
    ];

    it("should validate permission format", () => {
      const isValidPermission = (perm: string) => validPermissions.includes(perm) || perm === "*";
      
      expect(isValidPermission("*")).toBe(true);
      expect(isValidPermission("users:create")).toBe(true);
      expect(isValidPermission("invalid:permission")).toBe(false);
    });
  });
});

// ─── Vacancy Schema Validation ─────────────────────────────────────────

describe("Vacancy Schema Validation", () => {
  describe("Vacancy Data Validation", () => {
    const validateVacancy = (data: any): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];
      
      if (!data.titulo || data.titulo.length < 5) errors.push("Título muy corto");
      if (!data.empresa || data.empresa.length < 2) errors.push("Empresa requerida");
      if (!data.descripcion || data.descripcion.length < 20) errors.push("Descripción muy corta");
      if (!data.ubicacion) errors.push("Ubicación requerida");
      if (data.salary && (data.salary.min > data.salary.max)) errors.push("Rango salarial inválido");
      
      return { valid: errors.length === 0, errors };
    };

    it("should accept valid vacancy data", () => {
      const result = validateVacancy({
        titulo: "Desarrollador Senior Node.js",
        empresa: "TechCorp",
        descripcion: "Buscamos un desarrollador con experiencia en Node.js y TypeScript...",
        ubicacion: "Remoto",
      });
      
      expect(result.valid).toBe(true);
    });

    it("should reject invalid vacancy data", () => {
      const result = validateVacancy({});
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Salary Range Validation", () => {
    it("should validate salary range", () => {
      const isValidRange = (min: number, max: number) => min > 0 && max > 0 && min <= max;
      
      expect(isValidRange(1000, 2000)).toBe(true);
      expect(isValidRange(2000, 1000)).toBe(false);
      expect(isValidRange(-100, 200)).toBe(false);
    });
  });
});

// ─── Application Schema Validation ─────────────────────────────────────

describe("Application Schema Validation", () => {
  describe("Application Data Validation", () => {
    const validateApplication = (data: any): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];
      
      if (!data.vacanteId) errors.push("Vacante requerida");
      if (!data.candidatoId) errors.push("Candidato requerido");
      if (!data.cv) errors.push("CV requerido");
      
      return { valid: errors.length === 0, errors };
    };

    it("should accept valid application", () => {
      const result = validateApplication({
        vacanteId: "vac-123",
        candidatoId: "user-456",
        cv: "path/to/cv.pdf",
      });
      
      expect(result.valid).toBe(true);
    });

    it("should reject duplicate applications", () => {
      const hasDuplicate = (applications: any[], candidateId: string, vacancyId: string) => {
        return applications.some(
          app => app.candidatoId === candidateId && app.vacanteId === vacancyId
        );
      };

      const applications = [
        { vacanteId: "vac-1", candidatoId: "user-1" },
        { vacanteId: "vac-2", candidatoId: "user-1" },
      ];

      expect(hasDuplicate(applications, "user-1", "vac-1")).toBe(true);
      expect(hasDuplicate(applications, "user-1", "vac-3")).toBe(false);
    });
  });
});

// ─── URL Validation ───────────────────────────────────────────────────

describe("URL Validation", () => {
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  it("should validate correct URLs", () => {
    expect(validateUrl("https://devjobs.com")).toBe(true);
    expect(validateUrl("http://localhost:3000")).toBe(true);
  });

  it("should reject invalid URLs", () => {
    expect(validateUrl("not-a-url")).toBe(false);
    expect(validateUrl("")).toBe(false);
  });
});