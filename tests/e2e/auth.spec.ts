import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('redirects unauthenticated users to login page', async ({ page }) => {
    await page.goto('/');
    // Should be redirected to the login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page has expected form elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading')).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|login|כניסה/i })).toBeVisible();
  });

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|login|כניסה/i }).click();
    // Wait for an error message to appear
    await expect(page.getByRole('alert').or(page.locator('[data-sonner-toast]'))).toBeVisible({
      timeout: 5000,
    });
  });
});
