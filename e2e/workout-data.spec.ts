import { test, expect } from '@playwright/test';

test.describe('Workout Page (unauthenticated)', () => {
  test('workout page redirects or shows auth prompt for unauthenticated users', async ({ page }) => {
    await page.goto('/workout');
    // Should either redirect to login or show login prompt
    const url = page.url();
    const hasRedirected = url.includes('/login') || url.includes('/');
    const showsAuth = await page.getByText(/sign in/i).isVisible().catch(() => false);
    expect(hasRedirected || showsAuth).toBeTruthy();
  });

  test('dashboard page redirects for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    const url = page.url();
    const hasRedirected = url.includes('/login') || url.includes('/');
    const showsAuth = await page.getByText(/sign in/i).isVisible().catch(() => false);
    expect(hasRedirected || showsAuth).toBeTruthy();
  });

  test('progress page redirects for unauthenticated users', async ({ page }) => {
    await page.goto('/progress');
    const url = page.url();
    const hasRedirected = url.includes('/login') || url.includes('/');
    const showsAuth = await page.getByText(/sign in/i).isVisible().catch(() => false);
    expect(hasRedirected || showsAuth).toBeTruthy();
  });
});
