import { test, expect } from '@playwright/test';

test.describe('Main User Journey: Event Creation, Budget Inspection, Update & Persistence', () => {
  test('creates an event, inspects budget, updates budget and verifies persistence across refresh', async ({
    page,
  }) => {
    // 1. Visit application
    await page.goto('/');
    await expect(page).toHaveTitle(/Celebrato/i);

    // 2. Open Create Event Guided Wizard
    const newEventBtn = page.getByRole('button', { name: 'New Event', exact: true });
    await expect(newEventBtn).toBeVisible();
    await newEventBtn.click();

    // Verify wizard is open
    await expect(page.getByText('Create Celebration Blueprint')).toBeVisible();

    // Step 1: Select Occasion (Click College Fest)
    const festBtn = page.getByRole('button', { name: /College Fest/i });
    await festBtn.click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2: Name, Date & Location
    await expect(page.getByText('Name, Date & Location')).toBeVisible();
    const eventNameInput = page.locator('input[value="Campus Cultural Night 2026"]');
    await eventNameInput.fill('E2E Tech Fiesta 2026');

    const locationInput = page.locator('input[value="Mangalore, Karnataka"]');
    await locationInput.fill('Bangalore Tech Campus');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3: Audience & Atmosphere
    await expect(page.getByText('Audience & Atmosphere')).toBeVisible();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 4: Budget & Priorities
    await expect(page.getByText('Budget & Priorities')).toBeVisible();
    const budgetInput = page.locator('input[type="number"]').first();
    await budgetInput.fill('250000');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 5: Personalization & Highlights
    await expect(page.getByText('Personalization & Highlights')).toBeVisible();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 6: Review & Generate
    await expect(page.getByText('Ready to Generate Blueprint')).toBeVisible();
    await expect(page.getByText('E2E Tech Fiesta 2026')).toBeVisible();

    // Click Generate AI Plan
    const generateBtn = page.getByRole('button', { name: /Generate AI Plan/i });
    await generateBtn.click();

    // Wizard closes and navigates to the event in studio/overview
    await expect(page.getByText('Create Celebration Blueprint')).not.toBeVisible();

    // 3. Inspect its budget
    // Navigate to Budget tab using Sidebar
    const budgetTabBtn = page.locator('button[title="Budget & Rescue"]');
    await budgetTabBtn.click();

    // Inspect Total Planned Limit
    await expect(page.getByText('Total Planned Limit')).toBeVisible();
    await expect(page.getByText(/(250,000|2,50,000)/)).toBeVisible();

    // 4. Update the budget by adding a new custom category
    const newCategoryInput = page.getByPlaceholderText(/New Category Name/i);
    await expect(newCategoryInput).toBeVisible();
    await newCategoryInput.fill('Drone Aerial Light Show');

    const amountInput = page.locator('form input[type="number"]');
    await amountInput.fill('25000');

    const addCategoryBtn = page.getByRole('button', { name: /Add Category/i });
    await addCategoryBtn.click();

    // Verify new category is rendered in the allocations
    await expect(page.getByText('Drone Aerial Light Show')).toBeVisible();

    // Verify negative remaining balance appears because of the additional 25,000
    await expect(page.getByText(/Remaining Balance/i)).toBeVisible();
    await expect(page.getByText(/-[\s\S]*(25,000|25,000)/)).toBeVisible();

    // 5. Refresh page and verify changes persist from localStorage
    await page.reload();

    // Verify newly created event is still active
    const activeSelect = page.locator('header select');
    await expect(activeSelect).toContainText('E2E Tech Fiesta 2026');

    // Switch back to Budget tab
    await page.locator('button[title="Budget & Rescue"]').click();

    // Check that 'Drone Aerial Light Show' is still present after refresh
    await expect(page.getByText('Drone Aerial Light Show')).toBeVisible();

    // Check that remaining balance still reflects the persistent update
    await expect(page.getByText(/Remaining Balance/i)).toBeVisible();
    await expect(page.getByText(/-[\s\S]*(25,000|25,000)/)).toBeVisible();
  });
});
