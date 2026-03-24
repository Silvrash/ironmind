import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('landing page returns HTTP 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('landing page renders without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    await page.waitForSelector('h1');
    expect(errors).toHaveLength(0);
  });

  test('login page is reachable and shows sign in form', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('signup page is reachable and shows create account form', async ({ page }) => {
    const response = await page.goto('/signup');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('primary CTA on landing page is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /start training free/i }).first()).toBeVisible();
  });

  test('premium page is reachable', async ({ page }) => {
    const response = await page.goto('/premium');
    expect(response?.status()).toBe(200);
    await expect(page.getByText('$9.99', { exact: true })).toBeVisible();
  });
});
