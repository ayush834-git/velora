import { test, expect } from '@playwright/test';

test.describe('VELORA Cinematic Experience', () => {
  test('should load the hero scene, interact with filter, and spin for a result', async ({ page }) => {
    // Navigate to local dev server
    await page.goto('/');

    // 1. Verify Hero Scene loads
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('text=VELORA').first()).toBeVisible();
    
    // 2. Open Filter Panel
    const filterBtn = page.locator('button:has-text("Moods & Genres")').first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
    }
    
    // 3. Trigger Spin
    const spinBtn = page.locator('button:has-text("Spin Now")').first();
    await expect(spinBtn).toBeVisible();
    await spinBtn.click();

    // 4. Verify scrolling/pinning in the Spin section
    await expect(page.locator('#spin')).toBeVisible();
    
    // Wait for the animation / simulated API to finish and scroll to results
    // Spin animation duration is ~2.5s before the synthetic scroll
    await page.waitForTimeout(3000);
    
    // 5. Verify Result Scene is displayed correctly
    await expect(page.locator('#result')).toBeVisible();
    await expect(page.locator('#result >> text=Play Trailer')).toBeVisible();
  });
});
