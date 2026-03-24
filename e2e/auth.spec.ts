import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('signup page renders form fields', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByLabel(/display name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('login page renders form fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('signup page has link to login', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('login page has link to signup', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /create account/i })).toBeVisible();
  });

  test('signup form shows validation with empty submit', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('button', { name: /create account/i }).click();
    // Form should not navigate away (HTML5 validation or custom)
    await expect(page).toHaveURL('/signup');
  });
});
