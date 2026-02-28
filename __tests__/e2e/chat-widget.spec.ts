import { test, expect } from '@playwright/test';

test.describe('Chat Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays floating chat button', async ({ page }) => {
    await expect(page.getByLabel('Open chat')).toBeVisible();
  });

  test('opens chat panel when button is clicked', async ({ page }) => {
    await page.getByLabel('Open chat').click();
    await expect(page.getByText('Skyline AI')).toBeVisible();
    await expect(page.getByText(/I'm Skyline AI/)).toBeVisible();
  });

  test('shows welcome message in empty chat', async ({ page }) => {
    await page.getByLabel('Open chat').click();
    await expect(page.getByText(/Ask me about properties/)).toBeVisible();
  });

  test('closes chat panel via header close button', async ({ page }) => {
    await page.getByLabel('Open chat').click();
    await expect(page.getByText('Skyline AI')).toBeVisible();
    await page.getByLabel('Close chat').first().click();
    await expect(page.getByLabel('Open chat')).toBeVisible();
  });

  test('has chat input with placeholder', async ({ page }) => {
    await page.getByLabel('Open chat').click();
    await expect(page.getByPlaceholder(/Ask about properties/)).toBeVisible();
  });

  test('has send button', async ({ page }) => {
    await page.getByLabel('Open chat').click();
    await expect(page.getByLabel('Send message')).toBeVisible();
  });
});
