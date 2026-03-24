import { test, expect } from '@playwright/test';

test.describe('Onboarding Page', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/onboarding');
    // Page uses useEffect to redirect when no user is present
    await page.waitForURL(/\/(login|$)/, { timeout: 5000 });
    const url = page.url();
    expect(url.endsWith('/login') || url.endsWith('/')).toBeTruthy();
  });
});
