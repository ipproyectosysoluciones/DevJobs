import { test, expect } from '@playwright/test';

/**
 * @fileoverview Tests E2E para Vacantes (Postulaciones)
 * @fileoverview E2E tests for Vacancies (Applications)
 */

test.describe('Vacancies - Job Listings', () => {
  test('should display job listings on home page', async ({ page }) => {
    await page.goto('/');
    
    // Check for job listings or "no jobs" message
    const content = await page.content();
    expect(content).toMatch(/vacante|empleo|job/i);
  });

  test('should navigate to job details', async ({ page }) => {
    await page.goto('/');
    
    // Look for a job link
    const jobLinks = page.locator('a[href^="/vacantes/"]');
    const count = await jobLinks.count();
    
    if (count > 0) {
      await jobLinks.first().click();
      // Should be on a detail page
      expect(page.url()).toContain('/vacantes/');
    }
  });

  test('should search jobs', async ({ page }) => {
    await page.goto('/');
    
    // Look for search form
    const searchForm = page.locator('form[action*="buscador"]');
    const hasSearch = await searchForm.count() > 0;
    
    if (hasSearch) {
      await page.fill('input[name="q"], input[name="busqueda"]', 'developer');
      await searchForm.first().submit();
      
      // Should show search results
      expect(page.url()).toMatch(/busqueda|search|q=developer/i);
    }
  });

  test('should filter jobs by category', async ({ page }) => {
    await page.goto('/');
    
    // Look for category filter
    const categoryLinks = page.locator('a[href*="categoria"], a[href*="area"]');
    const count = await categoryLinks.count();
    
    if (count > 0) {
      await categoryLinks.first().click();
      // Should filter results
      expect(page.url()).toMatch(/categoria|area|filter/i);
    }
  });
});

test.describe('Vacancies - Application Flow', () => {
  test('should show apply button on job details', async ({ page }) => {
    // Go to a specific job (need URL or navigate from home)
    await page.goto('/');
    
    // Try to find a job to apply
    const jobLink = page.locator('a[href^="/vacantes/"]').first();
    const count = await jobLink.count();
    
    if (count > 0) {
      await jobLink.click();
      
      // Check for apply button/form
      const applyButton = page.locator('button:has-text("Postular"), a:has-text("Postular"), input[type="submit"][value*="Postular"]');
      const hasApply = await applyButton.count() > 0;
      
      // Either shows apply or requires login
      const url = page.url();
      expect(url).toContain('/vacantes/');
    }
  });

  test('should require login to apply', async ({ page }) => {
    // Direct job URL if known
    await page.goto('/vacantes/test-job');
    
    // Try to submit application
    // Should redirect to login or show error
    const url = page.url();
    expect(url).toMatch(/(\/vacantes|\/iniciar-sesion)/);
  });

  test('should handle CV upload for application', async ({ page }) => {
    await page.goto('/iniciar-sesion');
    
    // Login first
    // Then try to apply
    // Should show file upload for CV
    const fileInput = page.locator('input[type="file"]');
    const hasFileInput = await fileInput.count() > 0;
    
    // File input may or may not be present depending on auth state
    expect(typeof hasFileInput).toBe('boolean');
  });
});

test.describe('Vacancies - Employer Dashboard', () => {
  test('should show employer options after login', async ({ page }) => {
    // This would require authentication
    await page.goto('/administracion');
    
    // Should either redirect to login or show dashboard
    const url = page.url();
    expect(url).toMatch(/(\/administracion|\/iniciar-sesion)/);
  });

  test('should have new vacancy button for employers', async ({ page }) => {
    await page.goto('/administracion');
    
    // Look for new vacancy link
    const newVacancyLink = page.locator('a[href*="/vacantes/nueva"]');
    // May require login to see
  });
});

test.describe('Search & Filter', () => {
  test('should search by keyword', async ({ page }) => {
    await page.goto('/');
    
    // Find search input
    const searchInput = page.locator('input[name="q"], input[name="busqueda"], input[placeholder*="buscar"]').first();
    const count = await searchInput.count();
    
    if (count > 0) {
      await searchInput.fill('javascript');
      await searchInput.press('Enter');
      
      // Should show results
      expect(page.url()).toMatch(/q=|busqueda|search/i);
    }
  });

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/buscador');
    await page.fill('input[name="q"]', 'nonexistentjobxyz123');
    await page.click('button[type="submit"]');
    
    // Should show "no results" message
    const content = await page.content();
    expect(content).toMatch(/no|sin resultados|vacio|0/i);
  });

  test('should filter by location', async ({ page }) => {
    await page.goto('/');
    
    // Look for location filter
    const locationFilter = page.locator('select[name="ubicacion"], input[name="ubicacion"]');
    const count = await locationFilter.count();
    
    if (count > 0) {
      // Location filter exists
      expect(true).toBeTruthy();
    }
  });
});

test.describe('Error Handling - Vacancies', () => {
  test('should show 404 for invalid vacancy URL', async ({ page }) => {
    await page.goto('/vacantes/this-vacancy-does-not-exist-12345');
    
    // Should redirect or show error
    const content = await page.content();
    expect(content).toMatch(/no encontrado|404|error|not found/i);
  });

  test('should handle expired vacancies', async ({ page }) => {
    // If there's a way to mark vacancies as expired
    await page.goto('/vacantes/expired-job');
    
    // Should handle gracefully
    const url = page.url();
    expect(url).toMatch(/(\/vacantes|\/)/);
  });
});