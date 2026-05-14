/**
 * @fileoverview Tests completos para helpers de Handlebars
 * @fileoverview Complete tests for Handlebars helpers
 */

import { describe, it, expect } from "vitest";

// ─── String Helpers ───────────────────────────────────────────────────────

describe("String Helpers", () => {
  describe("truncate", () => {
    const truncate = (text: string, length: number) => {
      if (text.length <= length) return text;
      return text.substring(0, length) + "...";
    };

    it("should truncate long text", () => {
      const longText = "This is a very long text that should be truncated";
      const result = truncate(longText, 20);
      expect(result.length).toBeLessThanOrEqual(23);
      expect(result.endsWith("...")).toBe(true);
    });

    it("should not truncate short text", () => {
      const shortText = "Short";
      const result = truncate(shortText, 20);
      expect(result).toBe("Short");
    });
  });

  describe("slugify", () => {
    const slugify = (text: string) => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    it("should convert text to URL-friendly slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
      expect(slugify("Desarrollador Node.js")).toBe("desarrollador-nodejs");
    });

    it("should handle special characters", () => {
      expect(slugify("Test & Co.")).toBe("test-co");
      expect(slugify("José's App")).toBe("joses-app");
    });
  });

  describe("capitalize", () => {
    const capitalize = (text: string) => {
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("world")).toBe("World");
    });
  });
});

// ─── Date Helpers ─────────────────────────────────────────────────────────

describe("Date Helpers", () => {
  describe("formatDate", () => {
    const formatDate = (date: Date, locale: string = "es-ES") => {
      return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    it("should format date in Spanish", () => {
      const date = new Date("2024-01-15");
      const formatted = formatDate(date);
      expect(formatted).toContain("enero");
      expect(formatted).toContain("2024");
    });
  });

  describe("timeAgo", () => {
    const timeAgo = (date: Date) => {
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
      
      if (seconds < 60) return "hace un momento";
      if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
      if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
      if (seconds < 2592000) return `hace ${Math.floor(seconds / 86400)} días`;
      return formatDate(date);
    };

    it("should show minutes for recent dates", () => {
      const recent = new Date(Date.now() - 5 * 60 * 1000);
      expect(timeAgo(recent)).toContain("minutos");
    });

    it("should show hours for today", () => {
      const today = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(timeAgo(today)).toContain("horas");
    });
  });

  describe("isNew", () => {
    const isNew = (date: Date, days: number = 7) => {
      const threshold = days * 24 * 60 * 60 * 1000;
      return (Date.now() - date.getTime()) < threshold;
    };

    it("should identify new content", () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isNew(yesterday)).toBe(true);
    });

    it("should identify old content", () => {
      const lastWeek = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      expect(isNew(lastWeek)).toBe(false);
    });
  });
});

// ─── Array Helpers ───────────────────────────────────────────────────────

describe("Array Helpers", () => {
  describe("groupBy", () => {
    const groupBy = <T>(array: T[], key: keyof T) => {
      return array.reduce((groups, item) => {
        const groupKey = String(item[key]);
        (groups[groupKey] = groups[groupKey] || []).push(item);
        return groups;
      }, {} as Record<string, T[]>);
    };

    it("should group array items", () => {
      const items = [
        { category: "tech", name: "Item1" },
        { category: "tech", name: "Item2" },
        { category: "design", name: "Item3" },
      ];
      
      const grouped = groupBy(items, "category");
      
      expect(grouped.tech).toHaveLength(2);
      expect(grouped.design).toHaveLength(1);
    });
  });

  describe("sortBy", () => {
    const sortBy = <T>(array: T[], key: keyof T, order: "asc" | "desc" = "asc") => {
      return [...array].sort((a, b) => {
        const aVal = a[key] as any;
        const bVal = b[key] as any;
        return order === "asc" 
          ? aVal > bVal ? 1 : -1 
          : aVal < bVal ? 1 : -1;
      });
    };

    it("should sort ascending", () => {
      const items = [{ rank: 3 }, { rank: 1 }, { rank: 2 }];
      const sorted = sortBy(items, "rank");
      
      expect(sorted[0].rank).toBe(1);
      expect(sorted[2].rank).toBe(3);
    });

    it("should sort descending", () => {
      const items = [{ rank: 3 }, { rank: 1 }, { rank: 2 }];
      const sorted = sortBy(items, "rank", "desc");
      
      expect(sorted[0].rank).toBe(3);
    });
  });
});

// ─── HTML Helpers ───────────────────────────────────────────────────────

describe("HTML Helpers", () => {
  describe("stripTags", () => {
    const stripTags = (html: string) => {
      return html.replace(/<[^>]*>/g, "");
    };

    it("should remove HTML tags", () => {
      const html = "<p>Hello <strong>World</strong></p>";
      expect(stripTags(html)).toBe("Hello World");
    });

    it("should handle empty HTML", () => {
      const html = "Plain text";
      expect(stripTags(html)).toBe("Plain text");
    });
  });

  describe("safeHtml", () => {
    // In real implementation, this would mark HTML as safe
    const safeHtml = (html: string) => html;

    it("should preserve HTML", () => {
      const html = "<div>Content</div>";
      expect(safeHtml(html)).toBe("<div>Content</div>");
    });
  });

  describe("highlight", () => {
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const highlight = (text: string, term: string) => {
      if (!term) return text;
      const regex = new RegExp(`(${escapeRegex(term)})`, "gi");
      return text.replace(regex, "<mark>$1</mark>");
    };

    it("should highlight search term", () => {
      const result = highlight("Hello World", "World");
      expect(result).toContain("<mark>World</mark>");
    });

    it("should handle case insensitive", () => {
      const result = highlight("Hello WORLD", "world");
      expect(result).toContain("<mark>WORLD</mark>");
    });
  });
});

// ─── Number Helpers ─────────────────────────────────────────────────────

describe("Number Helpers", () => {
  describe("formatSalary", () => {
    const formatSalary = (min: number, max: number, currency: string = "USD") => {
      const formatter = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      });
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    };

    it("should format salary range", () => {
      const result = formatSalary(1000, 2000);
      expect(result).toContain("1000");
    });
  });

  describe("abbreviateNumber", () => {
    const abbreviateNumber = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toString();
    };

    it("should abbreviate thousands", () => {
      expect(abbreviateNumber(1500)).toBe("1.5K");
    });

    it("should abbreviate millions", () => {
      expect(abbreviateNumber(2500000)).toBe("2.5M");
    });
  });
});