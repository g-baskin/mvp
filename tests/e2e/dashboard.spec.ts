import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load dashboard and show New Project button', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Check page title
    await expect(page.locator('h1')).toContainText('My Projects');

    // Check New Project button exists
    await expect(page.getByRole('button', { name: /New Project/i })).toBeVisible();
  });

  test('should open New Project dialog and show questionnaire type options', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Click New Project button
    await page.getByRole('button', { name: /New Project/i }).click();

    // Check dialog opened
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Create New Project')).toBeVisible();

    // Check questionnaire type buttons exist
    await expect(page.getByRole('button', { name: /Full Questionnaire/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Short Version/i })).toBeVisible();

    // Check labels show question counts within buttons
    await expect(page.getByRole('button', { name: /Full Questionnaire/i }).getByText('405 questions')).toBeVisible();
    await expect(page.getByRole('button', { name: /Short Version/i }).getByText('~50 essential questions')).toBeVisible();
  });

  test('should create a project with full questionnaire type', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Open dialog
    await page.getByRole('button', { name: /New Project/i }).click();

    // Fill form
    await page.getByPlaceholder('My Awesome MVP').fill('Test Project Full');
    await page.getByPlaceholder('Brief description').fill('Testing full questionnaire');

    // Submit (full questionnaire is selected by default)
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Should redirect to wizard page
    await expect(page).toHaveURL(/\/projects\/.+/);
  });

  test('should create a project with short questionnaire type', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Open dialog
    await page.getByRole('button', { name: /New Project/i }).click();

    // Fill form
    await page.getByPlaceholder('My Awesome MVP').fill('Test Project Short');
    await page.getByPlaceholder('Brief description').fill('Testing short questionnaire');

    // Select short version
    await page.getByRole('button', { name: /Short Version/i }).click();

    // Submit
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Should redirect to wizard page
    await expect(page).toHaveURL(/\/projects\/.+/);
  });
});
