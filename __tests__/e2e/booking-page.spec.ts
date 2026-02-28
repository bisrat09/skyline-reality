import { test, expect } from '@playwright/test';

test.describe('Booking Page', () => {
  test('displays booking page heading', async ({ page }) => {
    await page.goto('/booking');
    await expect(page.getByText('Book a Showing')).toBeVisible();
  });

  test('displays booking subtitle', async ({ page }) => {
    await page.goto('/booking');
    await expect(page.getByText(/Select a convenient time/)).toBeVisible();
  });

  test('has correct page title', async ({ page }) => {
    await page.goto('/booking');
    await expect(page).toHaveTitle(/Book a Showing/);
  });
});
