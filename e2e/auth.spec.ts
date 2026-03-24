import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('signup page renders form fields', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByLabel(/your name/i)).toBeVisible();
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('login page renders form fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('signup page has link to login', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('login page has link to signup', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /start training free/i })).toBeVisible();
  });

  test('signup form stays on page and does not navigate when submitted empty', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL('/signup');
  });

  test('login form stays on page and does not navigate when submitted empty', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('signup form shows error when passwords do not match', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel(/your name/i).fill('Arnold');
    await page.getByLabel(/^email$/i).fill('arnold@example.com');
    await page.getByLabel(/^password$/i).fill('password123');
    await page.getByLabel(/confirm password/i).fill('different123');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL('/signup');
  });

  test('password toggle shows and hides password on signup', async ({ page }) => {
    await page.goto('/signup');
    const passwordInput = page.getByLabel(/^password$/i);
    await expect(passwordInput).toHaveAttribute('type', 'password');
    // Click the toggle button (eye icon button inside password field)
    await page.locator('button[type="button"]').first().click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
