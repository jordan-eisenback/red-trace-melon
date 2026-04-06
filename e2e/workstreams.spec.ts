import { test, expect } from "./fixtures";

test.describe("Workstreams", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/workstreams");
    // Dismiss any overlay that may have appeared
    await page.waitForTimeout(300);
    const overlay = page.locator(".fixed.inset-0").first();
    if (await overlay.isVisible().catch(() => false)) {
      await overlay.getByRole("button").last().click().catch(() => {});
      await page.waitForTimeout(200);
    }
  });

  test("page renders with gradient header", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /workstream/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /add workstream/i })).toBeVisible();
  });

  test("stats bar shows counts", async ({ page }) => {
    await expect(page.getByText(/total/i).first()).toBeVisible();
    await expect(page.getByText(/in progress/i).first()).toBeVisible();
    await expect(page.getByText(/complete/i).first()).toBeVisible();
  });

  test("view mode toggles between Swimlane and Dependency Graph", async ({ page }) => {
    const swimlaneBtn = page.getByRole("button", { name: /swimlane/i });
    const graphBtn = page.getByRole("button", { name: /dependency graph/i });
    await expect(swimlaneBtn).toBeVisible();
    await expect(graphBtn).toBeVisible();

    await graphBtn.click();
    // After switching to graph view, swimlane rows should be gone
    await expect(page.getByText(/foundation|platform|enablement/i).first()).not.toBeVisible();

    await swimlaneBtn.click();
    // Back to swimlane — layer labels reappear
    await expect(page.getByText(/foundation|platform|enablement/i).first()).toBeVisible();
  });

  test("swimlane rows render", async ({ page }) => {
    // Should show layer swimlanes
    await expect(page.getByText(/foundation|platform|enablement|delivery/i).first()).toBeVisible();
  });

  test("add workstream dialog opens and cancels", async ({ page }) => {
    await page.getByRole("button", { name: /add workstream/i }).click();
    // WorkstreamModal uses a fixed overlay div, not role="dialog"
    await expect(page.locator(".fixed.inset-0").last()).toBeVisible();
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.locator(".fixed.inset-0")).not.toBeVisible();
  });

  test("clicking a workstream row opens the detail panel", async ({ page }) => {
    const row = page.locator("[title='Click to open detail panel']").first();
    if (!(await row.isVisible())) { test.skip(); return; }
    await row.click();
    const detailPanel = page.locator(".bg-white.border.border-gray-200.rounded-xl.shadow-lg");
    await expect(detailPanel).toBeVisible({ timeout: 5000 });
  });

  test("detail panel edit button opens form", async ({ page }) => {
    const row = page.locator("[title='Click to open detail panel']").first();
    if (!(await row.isVisible())) { test.skip(); return; }
    await row.click();
    const detailPanel = page.locator(".bg-white.border.border-gray-200.rounded-xl.shadow-lg");
    await expect(detailPanel).toBeVisible();
    // Click the first icon button in the detail panel header (Edit)
    await detailPanel.getByRole("button").first().click();
    await expect(page.locator(".fixed.inset-0").last()).toBeVisible();
    await page.getByRole("button", { name: /cancel/i }).click();
  });

  test("add and delete a workstream", async ({ page }) => {
    await page.getByRole("button", { name: /add workstream/i }).click();
    const modal = page.locator(".fixed.inset-0").last();
    await expect(modal).toBeVisible();

    // WorkstreamModal uses plain <label> without htmlFor — use placeholder
    const uniqueTitle = `E2E-WS-${Date.now()}`;
    await modal.getByPlaceholder("Workstream name").fill(uniqueTitle);
    await modal.getByRole("button", { name: /add workstream/i }).click();
    await expect(page.locator(".fixed.inset-0")).not.toBeVisible();
    await expect(page.getByText(uniqueTitle).first()).toBeVisible();

    // Find and click the delete button on that specific workstream row
    const wsRow = page.locator(".flex.items-start.gap-3", { hasText: uniqueTitle }).first();
    await wsRow.hover();
    const deleteBtn = wsRow.getByRole("button").last(); // edit is first, delete is last
    await deleteBtn.click();
    // ConfirmDialog (Radix AlertDialog) appears
    await page.getByRole("button", { name: /delete/i }).last().click();
    await expect(page.getByText(uniqueTitle).first()).not.toBeVisible();
  });
});
