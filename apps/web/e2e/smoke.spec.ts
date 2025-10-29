import { test, expect } from '@playwright/test';

test('app loads and displays tri-pane layout', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.toolbar')).toBeVisible();
  await expect(page.locator('.outline-panel')).toBeVisible();
  await expect(page.locator('.canvas-pane')).toBeVisible();
  await expect(page.locator('.code-pane')).toBeVisible();
});

test('toolbar has undo/redo and insert buttons', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('button', { hasText: 'Undo' })).toBeVisible();
  await expect(page.locator('button', { hasText: 'Redo' })).toBeVisible();
  await expect(page.locator('button', { hasText: 'Div' })).toBeVisible();
  await expect(page.locator('button', { hasText: 'Paragraph' })).toBeVisible();
  await expect(page.locator('button', { hasText: 'Heading' })).toBeVisible();
});

test('outline panel displays document tree', async ({ page }) => {
  await page.goto('/');

  const outlinePanel = page.locator('.outline-panel');
  await expect(outlinePanel.locator('.panel__header', { hasText: 'Outline' })).toBeVisible();
  await expect(outlinePanel.locator('.outline__list').first()).toBeVisible();
  await expect(outlinePanel.locator('.outline__item', { hasText: 'html' })).toBeVisible();
});

test('canvas renders HTML content', async ({ page }) => {
  await page.goto('/');

  const canvasPane = page.locator('.canvas-pane');
  await expect(canvasPane.locator('.panel__header', { hasText: 'Canvas' })).toBeVisible();
  await expect(canvasPane.locator('.canvas__surface')).toBeVisible();

  const canvasSurface = canvasPane.locator('.canvas__surface');
  await expect(
    canvasSurface.locator('h1', { hasText: 'Welcome to the HTML Editor' })
  ).toBeVisible();
});

test('monaco editor is mounted', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.code-pane .monaco-editor')).toBeVisible({ timeout: 10000 });
});

test('theme toggle works', async ({ page }) => {
  await page.goto('/');

  const app = page.locator('.app');
  await expect(app).toHaveClass(/light/);

  const themeButton = page.locator('button', { hasText: /Theme:/ });
  await themeButton.click();

  await expect(app).toHaveClass(/dark/);
});
