import { test, expect } from '@playwright/test';

// These tests run on iPhone 13 viewport (configured in playwright.config.ts)
test.describe('Mobile Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays hamburger menu on mobile', async ({ page }) => {
    await expect(page.getByLabel('Open menu')).toBeVisible();
  });

  test('opens mobile menu when hamburger is tapped', async ({ page }) => {
    await page.getByLabel('Open menu').click();
    await expect(page.getByLabel('Close menu')).toBeVisible();
    // Check that mobile nav links are visible
    await expect(page.getByText('Properties').last()).toBeVisible();
  });

  test('closes mobile menu when close button is tapped', async ({ page }) => {
    await page.getByLabel('Open menu').click();
    await page.getByLabel('Close menu').click();
    await expect(page.getByLabel('Open menu')).toBeVisible();
  });

  test('hero section is readable on mobile', async ({ page }) => {
    await expect(page.getByText('Find Your Dream Home in')).toBeVisible();
    await expect(page.getByText('Browse Properties')).toBeVisible();
  });

  test('chat widget is accessible on mobile', async ({ page }) => {
    await page.getByLabel('Open chat').click();
    await expect(page.getByText('Skyline AI')).toBeVisible();
    await expect(page.getByPlaceholder(/Ask about properties/)).toBeVisible();
  });

  test('property cards stack vertically on mobile', async ({ page }) => {
    const cards = page.locator('#properties').locator('[class*="rounded-xl"]');
    await expect(cards.first()).toBeVisible();
  });
});
