import { test, expect, Page } from '@playwright/test';

// Helper: log in with test credentials (set via environment variables for CI)
async function login(page: Page) {
  const email = process.env.TEST_USER_EMAIL ?? 'test@example.com';
  const password = process.env.TEST_USER_PASSWORD ?? 'test-password';
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|login|כניסה/i }).click();
  await page.waitForURL(/\/(dashboard|finance|$)/, { timeout: 10000 });
}

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('sidebar is visible after login', async ({ page }) => {
    await expect(page.locator('nav, [data-testid="sidebar"]').first()).toBeVisible();
  });

  test('can navigate to Finance page', async ({ page }) => {
    await page.getByRole('link', { name: /finance|פיננסי/i }).click();
    await expect(page).toHaveURL(/\/finance/);
  });

  test('can navigate to Housing page', async ({ page }) => {
    await page.getByRole('link', { name: /housing|נדל.ן|דיור/i }).click();
    await expect(page).toHaveURL(/\/housing/);
  });
});
