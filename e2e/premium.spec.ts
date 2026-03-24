import { test, expect } from '@playwright/test';

test.describe('Premium Page', () => {
  test('premium page renders pricing info', async ({ page }) => {
    await page.goto('/premium');
    await expect(page.getByText(/premium/i)).toBeVisible();
    await expect(page.getByText(/9\.99/i)).toBeVisible();
  });

  test('shows free vs premium feature comparison', async ({ page }) => {
    await page.goto('/premium');
    await expect(page.getByText(/free/i)).toBeVisible();
  });

  test('shows upgrade button', async ({ page }) => {
    await page.goto('/premium');
    await expect(page.getByRole('button', { name: /upgrade/i })).toBeVisible();
  });
});
