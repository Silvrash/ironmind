import { test, expect } from '@playwright/test';

test.describe('Protected routes (unauthenticated)', () => {
  for (const route of ['/workout', '/dashboard', '/progress']) {
    test(`${route} redirects unauthenticated users away from protected content`, async ({ page }) => {
      await page.goto(route);
      // Wait for any client-side redirect to settle
      await page.waitForLoadState('networkidle');
      const url = page.url();
      // Must have left the protected route — either redirected to /login or landing
      const redirectedToLogin = url.includes('/login');
      const redirectedToLanding = url.endsWith('/') || url.endsWith(':3000/');
      expect(redirectedToLogin || redirectedToLanding).toBeTruthy();
      // Must NOT still be on the protected route
      expect(url).not.toContain(route);
    });
  }
});
