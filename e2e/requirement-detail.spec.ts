import { test, expect } from "./fixtures";

test.describe("Requirement Detail", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Navigate via the Eye link in the first row
    await page.locator("table tbody tr").first().getByRole("link").first().click();
    await expect(page).toHaveURL(/\/requirements\//);
  });

  test("shows requirement title and metadata", async ({ page }) => {
    // The detail page shows the requirement ID in a <code> element
    await expect(page.locator("code").first()).toBeVisible();
    // The detail card with requirement text and metadata fields is present
    await expect(page.locator(".bg-white.rounded-lg.shadow-sm.border").first()).toBeVisible();
    // Metadata labels like "Requirement", "Owner" are shown
    await expect(page.getByText(/requirement|owner/i).first()).toBeVisible();
  });

  test("edit button opens form dialog", async ({ page }) => {
    await page.getByRole("button", { name: /edit/i }).click();
    await expect(page.locator(".fixed.inset-0").last()).toBeVisible();
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.locator(".fixed.inset-0")).not.toBeVisible();
  });

  test("delete button opens confirm dialog", async ({ page }) => {
    await page.getByRole("button", { name: /delete/i }).click();
    // ConfirmDialog uses Radix AlertDialog which does have role="alertdialog"
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();
    await page.getByRole("button", { name: /cancel/i }).last().click();
  });

  test("shows framework mappings section", async ({ page }) => {
    await expect(page.getByText(/framework|control|mapping/i).first()).toBeVisible();
  });

  test("shows linked epics or stories section", async ({ page }) => {
    await expect(page.getByText(/epic|stor/i).first()).toBeVisible();
  });
});
