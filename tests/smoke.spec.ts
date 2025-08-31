import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  
  // Check if the page loads
  await expect(page).toHaveTitle(/Naveeg/);
  
  // Check for key elements
  await expect(page.locator('h1')).toBeVisible();
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  
  // Test navigation to features page
  await page.click('text=Features');
  await expect(page).toHaveURL(/.*features/);
  
  // Test navigation to pricing page
  await page.click('text=Pricing');
  await expect(page).toHaveURL(/.*pricing/);
});