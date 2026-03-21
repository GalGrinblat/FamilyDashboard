import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  const email = process.env.TEST_USER_EMAIL ?? 'test@example.com';
  const password = process.env.TEST_USER_PASSWORD ?? 'test-password';
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|login|כניסה/i }).click();
  await page.waitForURL(/\/(dashboard|finance|$)/, { timeout: 10000 });
}

test.describe('Finance Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/finance');
  });

  test('finance page loads and shows accounts section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /accounts|חשבונות/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test('add account dialog can be opened', async ({ page }) => {
    await page.getByRole('button', { name: /הוסף חשבון|add account/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByLabel(/שם החשבון/i)).toBeVisible();
  });

  test('pressing escape closes the add account dialog', async ({ page }) => {
    await page.getByRole('button', { name: /הוסף חשבון|add account/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
