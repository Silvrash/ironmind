import { test, expect } from '@playwright/test';

test.describe('Premium Page', () => {
  test('renders pricing info with $9.99/month price', async ({ page }) => {
    await page.goto('/premium');
    // Target the large price display specifically (exact match on the price span)
    await expect(page.getByText('$9.99', { exact: true })).toBeVisible();
    await expect(page.getByText(/\/month/i)).toBeVisible();
  });

  test('shows upgrade to premium button', async ({ page }) => {
    await page.goto('/premium');
    await expect(page.getByRole('button', { name: /upgrade to premium/i })).toBeVisible();
  });

  test('shows free tier feature list', async ({ page }) => {
    await page.goto('/premium');
    await expect(page.getByText(/set & rep logging/i)).toBeVisible();
    await expect(page.getByText(/personal records tracking/i)).toBeVisible();
  });

  test('shows premium tier feature list', async ({ page }) => {
    await page.goto('/premium');
    await expect(page.getByText(/full ai coach suggestions/i)).toBeVisible();
    await expect(page.getByText(/advanced analytics & volume charts/i)).toBeVisible();
  });

  test('shows money-back guarantee', async ({ page }) => {
    await page.goto('/premium');
    await expect(page.getByText(/30-day money-back guarantee/i)).toBeVisible();
  });

  test('shows test mode stripe notice', async ({ page }) => {
    await page.goto('/premium');
    await expect(page.getByText(/test mode/i)).toBeVisible();
    await expect(page.getByText(/4242 4242 4242 4242/i)).toBeVisible();
  });

  test('unauthenticated user clicking upgrade redirects to login', async ({ page }) => {
    await page.goto('/premium');
    await page.getByRole('button', { name: /upgrade to premium/i }).click();
    await expect(page).toHaveURL('/login');
  });
});
