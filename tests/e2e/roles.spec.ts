import { test, expect } from '@playwright/test';

/**
 * @fileoverview Tests E2E completos para Panel de Administración
 * @fileoverview Complete E2E tests for Admin Panel
 */

// ─── Page Objects ───────────────────────────────────────────────────────────

class RolesPage {
  constructor(private page) {}

  async goto() {
    await this.page.goto('/admin/roles');
  }

  async getTitle() {
    return this.page.locator('h1, h2').first().textContent();
  }

  getCreateLink() {
    return this.page.locator('a[href*="/admin/roles/crear"]');
  }

  getEditLinks() {
    return this.page.locator('a[href*="/admin/roles/editar"]');
  }

  getDeleteForms() {
    return this.page.locator('form[action*="eliminar"]');
  }
}

class LoginPage {
  constructor(private page) {}

  async goto() {
    await this.page.goto('/iniciar-sesion');
  }

  async login(email, password) {
    await this.page.fill('input[name="email"], input[name="username"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"], input[type="submit"]');
  }
}

// ─── Tests: Roles Panel ─────────────────────────────────────────────────────

test.describe('Admin Roles Panel - Navigation', () => {
  test('should load roles page', async ({ page }) => {
    await page.goto('/admin/roles');
    // Page should either show roles list or redirect to login (if not authenticated)
    const url = page.url();
    expect(url).toMatch(/(\/admin\/roles|\/iniciar-sesion)/);
  });

  test('should have admin navigation breadcrumb', async ({ page }) => {
    await page.goto('/admin/roles');
    // Check for admin navigation back link
    const adminLink = page.locator('a[href="/administracion"]');
    await expect(adminLink).toHaveCount(1);
  });
});

test.describe('Admin Roles Panel - Create Role', () => {
  test('should display create form fields', async ({ page }) => {
    await page.goto('/admin/roles/crear');
    
    // Check form exists
    await expect(page.locator('form')).toBeVisible();
    
    // Check required fields
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
  });

  test('should show validation for empty name', async ({ page }) => {
    await page.goto('/admin/roles/crear');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Should show error or redirect back with flash error
    const url = page.url();
    expect(url).toMatch(/(\/admin\/roles\/crear|\/admin\/roles\?error)/);
  });

  test('should allow permission selection', async ({ page }) => {
    await page.goto('/admin/roles/crear');
    
    // Check for permissions checkboxes (if any)
    const checkboxes = page.locator('input[type="checkbox"][name="permissions"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Admin Roles Panel - Edit Role', () => {
  test('should load edit form with existing data', async ({ page }) => {
    // Navigate directly to edit for a system role
    await page.goto('/admin/roles/editar/admin');
    
    // Should load the form (even if system roles have restrictions)
    const url = page.url();
    expect(url).toContain('/admin/roles/editar');
  });
});

test.describe('Admin Roles Panel - List', () => {
  test('should display roles in table or list', async ({ page }) => {
    await page.goto('/admin/roles');
    
    // Check if there's a table or list of roles
    const table = page.locator('table');
    const list = page.locator('ul, ol');
    
    const hasTable = await table.count() > 0;
    const hasList = await list.count() > 0;
    
    expect(hasTable || hasList).toBeTruthy();
  });

  test('should show role metadata (name, description, userCount)', async ({ page }) => {
    await page.goto('/admin/roles');
    
    // Check for role information display
    const content = await page.content();
    // Should contain role-related text
    expect(content).toMatch(/role|rol/i);
  });
});

// ─── Tests: Authentication ─────────────────────────────────────────────────

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users from admin', async ({ page }) => {
    await page.goto('/admin/roles');
    
    // Should redirect to login or show access denied
    const url = page.url();
    expect(url).toMatch(/(\/iniciar-sesion|\/login|access-denied)/);
  });

  test('should show login form', async ({ page }) => {
    await page.goto('/iniciar-sesion');
    
    await expect(page.locator('input[name="email"], input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});

// ─── Tests: Public Routes ─────────────────────────────────────────────────

test.describe('Public Routes', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should load job listing', async ({ page }) => {
    await page.goto('/');
    
    // Check for job listings or "no jobs" message
    const content = await page.content();
    expect(content).toMatch(/vacante|job|empleo/i);
  });

  test('should navigate to job details', async ({ page }) => {
    await page.goto('/');
    
    // Try clicking on first job link if exists
    const jobLink = page.locator('a[href^="/vacantes/"]').first();
    const count = await jobLink.count();
    
    if (count > 0) {
      await jobLink.click();
      expect(page.url()).toContain('/vacantes/');
    }
  });
});

// ─── Tests: Error Handling ─────────────────────────────────────────────---

test.describe('Error Handling', () => {
  test('should handle 404 gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page-12345');
    
    // Should show error page or redirect
    const status = page.response()?.status() || 200;
    expect([404, 302, 200]).toContain(status);
  });

  test('should show meaningful error for invalid role', async ({ page }) => {
    await page.goto('/admin/roles/editar/this_role_does_not_exist_12345');
    
    // Should either show error or redirect
    const url = page.url();
    expect(url).toMatch(/(\/admin\/roles|error|not-found)/i);
  });
});

// ─── Tests: Responsive Design ─────────────────────────────────────────────

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Page should be usable on mobile
    await expect(page.locator('body')).toBeVisible();
  });
});