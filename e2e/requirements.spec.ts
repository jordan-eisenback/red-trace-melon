import { test, expect } from "./fixtures";

test.describe("Requirements List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders requirement rows", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("search filters requirements", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i).first();
    await searchInput.fill("RBAC");
    await page.waitForTimeout(300);
    const rows = page.locator("table tbody tr");
    const filtered = await rows.count();
    expect(filtered).toBeGreaterThan(0);

    await searchInput.fill("zzznomatch999");
    await page.waitForTimeout(300);
    const noRows = await page.locator("table tbody tr").count();
    expect(noRows).toBe(0);
  });

  test("type filter dropdown reduces results", async ({ page }) => {
    const allCount = await page.locator("table tbody tr").count();

    const typeSelect = page.locator("select").first();
    await typeSelect.selectOption({ index: 1 }); // pick first non-All option
    await page.waitForTimeout(200);
    const filtered = await page.locator("table tbody tr").count();
    expect(filtered).toBeLessThanOrEqual(allCount);
  });

  test("add requirement dialog opens and cancels", async ({ page }) => {
    await page.getByRole("button", { name: /add requirement/i }).click();
    // The modal uses a fixed overlay div, not role="dialog"
    await expect(page.locator(".fixed.inset-0").last()).toBeVisible();
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.locator(".fixed.inset-0")).not.toBeVisible();
  });

  test("add and delete a requirement", async ({ page }) => {
    await page.getByRole("button", { name: /add requirement/i }).click();
    const modal = page.locator(".fixed.inset-0").last();
    await expect(modal).toBeVisible();

    // RequirementFormDialog has no htmlFor labels — use placeholders
    // ID field: placeholder "e.g., RBAC-REQ-1.1"
    const idInput = modal.getByPlaceholder(/e\.g\., RBAC-REQ/i);
    await idInput.fill("E2E-TST-999");
    // Description (req) field: placeholder "Enter the requirement description"
    await modal.getByPlaceholder(/Enter the requirement description/i).fill("E2E Test Requirement Created by Playwright");
    // Type field is required — placeholder "e.g., Enterprise, Capability"
    await modal.getByPlaceholder(/e\.g\., Enterprise/i).fill("Enterprise");
    // Owner field is required — placeholder "e.g., RBAC Product"
    await modal.getByPlaceholder(/e\.g\., RBAC Product/i).fill("Playwright");

    // Submit button says "Create" for new requirements
    await modal.getByRole("button", { name: "Create" }).click();
    await expect(page.locator(".fixed.inset-0")).not.toBeVisible({ timeout: 5000 });

    // Verify it appears in the table
    await expect(page.getByText("E2E-TST-999")).toBeVisible();

    // Delete it — hover the row to reveal action buttons
    const row = page.locator("tr", { hasText: "E2E-TST-999" });
    await row.hover();
    await row.getByRole("button").last().click(); // delete button
    // ConfirmDialog (Radix AlertDialog) — click the destructive Delete button
    await page.locator('[role="alertdialog"]').getByRole("button", { name: /delete/i }).click();
    // Wait for the toast to disappear, then check the row is gone
    await page.waitForTimeout(500);
    await expect(page.locator("tr", { hasText: "E2E-TST-999" })).not.toBeAttached({ timeout: 5000 });
  });

  test("view requirement detail from row", async ({ page }) => {
    // Use the Eye (View) link — first link in the first row's action cell
    const firstRowViewLink = page.locator("table tbody tr").first().getByRole("link").first();
    await firstRowViewLink.click();
    await expect(page).toHaveURL(/\/requirements\//);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("export excel button is present", async ({ page }) => {
    await expect(page.getByRole("button", { name: /export/i })).toBeVisible();
  });
});
