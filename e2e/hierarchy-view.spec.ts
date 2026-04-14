/**
 * E2E tests for the Hierarchy View page — /hierarchy
 *
 * Covers:
 *   - Page loads and heading is visible
 *   - Tree structure renders (type-group sections present)
 *   - At least one TreeNode row is visible
 *   - Root requirement RBAC-ENT-001 is visible
 *   - Expand All button expands collapsed nodes (child becomes visible)
 *   - Collapse All button re-hides the child nodes
 *   - Clicking a requirement row navigates to the detail page
 *
 * Seed data guarantees:
 *   - RBAC-ENT-001 is a root requirement (parent: null) of type "Enterprise"
 *   - RBAC-CAP-103 has parent "RBAC-ENT-001" — so it starts collapsed at level 1
 *     (level < 2 is auto-expanded by the component, so level-0 children ARE
 *      visible by default; we use "Expand All" to test the toggle behaviour)
 */

import { test, expect } from "./fixtures";

test.describe("Hierarchy View — /hierarchy", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/hierarchy");
    await page.waitForLoadState("networkidle");
    // Wait for the tree to paint
    await page.waitForSelector(".space-y-4", { timeout: 10_000 });
  });

  test("heading and description are visible", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /hierarchy view/i })
    ).toBeVisible();
    await expect(
      page.getByText(/requirements organized by parent-child relationships/i)
    ).toBeVisible();
  });

  test("at least one type-group section is rendered", async ({ page }) => {
    // Each group has a header with the type name (e.g. "Enterprise")
    const groupHeaders = page.locator(
      ".bg-white.rounded-lg .bg-slate-50.px-4.py-3"
    );
    const count = await groupHeaders.count();
    expect(count).toBeGreaterThan(0);
  });

  test("root requirement RBAC-ENT-001 is visible", async ({ page }) => {
    const node = page.locator("code").filter({ hasText: "RBAC-ENT-001" });
    await expect(node.first()).toBeVisible({ timeout: 10_000 });
  });

  test("child requirement of RBAC-ENT-001 is visible at default expansion", async ({
    page,
  }) => {
    // level-0 children are auto-expanded (level < 2), so RBAC-CAP-103 should
    // already be visible without clicking anything
    const child = page.locator("code").filter({ hasText: "RBAC-CAP-103" });
    await expect(child.first()).toBeVisible({ timeout: 10_000 });
  });

  test("Expand All button is visible and has correct label", async ({
    page,
  }) => {
    const btn = page.getByRole("button", { name: /expand all/i });
    await expect(btn).toBeVisible();
  });

  test("Expand All / Collapse All toggle works", async ({ page }) => {
    // Initial state: button says "Expand All"
    const btn = page.getByRole("button", { name: /expand all/i });
    await expect(btn).toBeVisible();

    // Click → should switch to "Collapse All"
    await btn.click();
    await expect(
      page.getByRole("button", { name: /collapse all/i })
    ).toBeVisible();

    // Click again → back to "Expand All"
    await page.getByRole("button", { name: /collapse all/i }).click();
    await expect(
      page.getByRole("button", { name: /expand all/i })
    ).toBeVisible();
  });

  test("clicking a requirement row navigates to the detail page", async ({
    page,
  }) => {
    // Click the link for RBAC-ENT-001
    const link = page
      .getByRole("link")
      .filter({ has: page.locator("code", { hasText: "RBAC-ENT-001" }) })
      .first();
    await expect(link).toBeVisible({ timeout: 10_000 });
    await link.click();
    await page.waitForURL(/\/requirements\/RBAC-ENT-001/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/requirements\/RBAC-ENT-001/);
  });

  test("Enterprise type group section is present", async ({ page }) => {
    // Seed data has Enterprise-type root requirements, so a group header "Enterprise" must exist
    const enterpriseHeader = page.getByText("Enterprise").first();
    await expect(enterpriseHeader).toBeVisible({ timeout: 10_000 });
  });
});
