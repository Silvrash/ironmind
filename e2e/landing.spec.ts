import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('shows hero headline and CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /train like arnold/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /start training/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('has correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/IronMind/i);
  });

  test('navigates to signup from CTA', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /start training/i }).click();
    await expect(page).toHaveURL('/signup');
  });

  test('navigates to login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('shows features section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/workout plans/i)).toBeVisible();
    await expect(page.getByText(/progress tracking/i)).toBeVisible();
  });
});
