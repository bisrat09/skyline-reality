import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Skyline Realty/);
  });

  test('displays hero section with headline', async ({ page }) => {
    await expect(page.getByText('Find Your Dream Home in')).toBeVisible();
    await expect(page.getByText('Seattle')).toBeVisible();
  });

  test('displays CTA buttons in hero', async ({ page }) => {
    await expect(page.getByText('Browse Properties')).toBeVisible();
    await expect(page.getByText('Chat with AI')).toBeVisible();
  });

  test('displays navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Properties' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Services' }).first()).toBeVisible();
  });

  test('displays featured properties section', async ({ page }) => {
    await expect(page.getByText('Featured Properties')).toBeVisible();
    // Check that property cards render with prices
    await expect(page.getByText('$525,000')).toBeVisible();
  });

  test('displays services section', async ({ page }) => {
    await expect(page.getByText('Why Choose Skyline')).toBeVisible();
    await expect(page.getByText('AI-Powered Search')).toBeVisible();
    await expect(page.getByText('Instant Lead Response')).toBeVisible();
  });

  test('displays stats section', async ({ page }) => {
    await expect(page.getByText('Properties Sold')).toBeVisible();
    await expect(page.getByText('Client Satisfaction')).toBeVisible();
  });

  test('displays testimonials section', async ({ page }) => {
    await expect(page.getByText('What Our Clients Say')).toBeVisible();
    await expect(page.getByText('Sarah M.')).toBeVisible();
  });

  test('displays CTA section', async ({ page }) => {
    await expect(page.getByText('Perfect Home?')).toBeVisible();
    await expect(page.getByText('Start Chatting Now')).toBeVisible();
  });

  test('displays footer', async ({ page }) => {
    await expect(page.getByText('Browse Listings')).toBeVisible();
    await expect(page.getByText(/Skyline Realty. All rights reserved/)).toBeVisible();
  });

  test('smooth scrolls to sections via nav links', async ({ page }) => {
    await page.getByRole('link', { name: 'Properties' }).first().click();
    await page.waitForTimeout(500);
    const propertiesSection = page.locator('#properties');
    await expect(propertiesSection).toBeVisible();
  });
});
