import { test, expect } from '@playwright/test';

test('app loads and displays split layout', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h3', { hasText: 'Editor' })).toBeVisible();
  await expect(page.locator('h3', { hasText: 'Canvas' })).toBeVisible();
  await expect(page.locator('#canvas')).toBeVisible();
});

test('monaco editor is mounted', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10000 });
});
