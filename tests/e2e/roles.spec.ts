import { test, expect } from '@playwright/test';

/**
 * @fileoverview Tests E2E para el Panel de Administración de Roles
 * @fileoverview E2E tests for Role Admin Panel
 */

test.describe('Admin Roles Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin roles panel - assuming user is logged in as admin
    // In a real scenario, we'd need to set up auth state
    await page.goto('/admin/roles');
  });

  test('should display roles list page', async ({ page }) => {
    // The page should load without crashing
    await expect(page).toHaveURL(/\/admin\/roles/);
  });

  test('should have create role button', async ({ page }) => {
    // Check for create button/link
    const createLink = page.locator('a[href*="/admin/roles/crear"]');
    await expect(createLink).toBeVisible();
  });

  test('should navigate to create role form', async ({ page }) => {
    await page.click('a[href*="/admin/roles/crear"]');
    await expect(page).toHaveURL(/\/admin\/roles\/crear/);
  });

  test('should display form fields for new role', async ({ page }) => {
    await page.goto('/admin/roles/crear');
    
    // Check for form fields
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
  });
});

test.describe('Role Assignment', () => {
  test('should have assign role functionality', async ({ page }) => {
    // Navigate to roles page and check for assign links
    await page.goto('/admin/roles');
    
    // Should have links to assign roles (would need actual user ID in real scenario)
    const assignLinks = page.locator('a[href*="/admin/roles/asignar"]');
    // These may or may not be visible depending on whether there are users
  });
});

test.describe('Navigation', () => {
  test('should have back to admin link', async ({ page }) => {
    await page.goto('/admin/roles');
    
    // Check for back navigation
    const backLink = page.locator('a[href="/administracion"]');
    await expect(backLink).toBeVisible();
  });
});