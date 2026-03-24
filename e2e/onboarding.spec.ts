import { test, expect } from '@playwright/test';

test.describe('Onboarding Page', () => {
  test('onboarding page renders step 1 - experience level', async ({ page }) => {
    await page.goto('/onboarding');
    // Should show experience level selection
    await expect(page.getByText(/beginner/i)).toBeVisible();
    await expect(page.getByText(/intermediate/i)).toBeVisible();
    await expect(page.getByText(/advanced/i)).toBeVisible();
  });

  test('onboarding has level selection options', async ({ page }) => {
    await page.goto('/onboarding');
    // Check for level cards/buttons
    const beginnerOption = page.getByText(/beginner/i).first();
    await expect(beginnerOption).toBeVisible();
  });
});
