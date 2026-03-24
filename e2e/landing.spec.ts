import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('shows hero headline and CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /train like arnold/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /start training free/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
  });

  test('has correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/IronMind/i);
  });

  test('navigates to signup from hero CTA', async ({ page }) => {
    await page.goto('/');
    // Use the hero CTA specifically (second "Start Training Free" link — header has none)
    await page.getByRole('link', { name: /start training free/i }).first().click();
    await expect(page).toHaveURL('/signup');
  });

  test('navigates to login from header', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /sign in/i }).first().click();
    await expect(page).toHaveURL('/login');
  });

  test('shows features section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/arnold-era workout plans/i)).toBeVisible();
    await expect(page.getByText(/progressive overload tracking/i)).toBeVisible();
  });

  test('shows Arnold quote in CTA section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/last three or four reps/i)).toBeVisible();
    await expect(page.getByText(/Arnold Schwarzenegger/i)).toBeVisible();
  });

  test('shows stats section with training programs count', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/training programs/i)).toBeVisible();
    await expect(page.getByText(/25\+/i)).toBeVisible();
  });
});
