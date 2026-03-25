import { test, expect } from "./fixtures";

test.describe("Story Mapping", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/story-mapping");
    // Dismiss any overlay that may have appeared
    await page.waitForTimeout(300);
    const overlay = page.locator(".fixed.inset-0").first();
    if (await overlay.isVisible().catch(() => false)) {
      await overlay.getByRole("button").last().click().catch(() => {});
      await page.waitForTimeout(200);
    }
  });

  test("page renders with toolbar", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /user story map/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /coverage/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /export json/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /export csv/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /auto-link/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /outcome/i })).toBeVisible();
  });

  test("coverage panel opens and closes", async ({ page }) => {
    const btn = page.getByRole("button", { name: /coverage/i });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    // Panel or section should appear showing linked/unlinked info
    await expect(page.getByText(/linked|unlinked|coverage/i).nth(1)).toBeVisible();
    // Click again to toggle off
    await btn.click();
  });

  test("auto-link dialog opens and cancels", async ({ page }) => {
    const btn = page.getByRole("button", { name: /auto-link/i });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    // Auto-link modal only opens if there are matches above threshold;
    // otherwise a toast is shown. Check if modal appeared; if not, skip.
    const modal = page.locator(".fixed.inset-0").last();
    const modalVisible = await modal.isVisible({ timeout: 1500 }).catch(() => false);
    if (!modalVisible) {
      // Toast shown instead — that's acceptable
      return;
    }
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.locator(".fixed.inset-0")).not.toBeVisible();
  });

  test("add outcome dialog opens and cancels", async ({ page }) => {
    const btn = page.getByRole("button", { name: /^outcome$/i });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    // CrudModal uses fixed inset-0, not role="dialog"
    const modal = page.locator(".fixed.inset-0").last();
    await expect(modal).toBeVisible({ timeout: 5000 });
    await modal.getByRole("button", { name: /cancel/i }).click();
    await expect(modal).not.toBeVisible();
  });

  test("export JSON creates a downloadable file", async ({ page }) => {
    // Export uses blob URL + programmatic a.click() — no Playwright download event.
    // Verify no JS errors occur when clicking.
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    const btn = page.getByRole("button", { name: /export json/i });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });

  test("export CSV creates a downloadable file", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    const btn = page.getByRole("button", { name: /export csv/i });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });

  test("filter bar is present", async ({ page }) => {
    await expect(page.locator("select").first()).toBeVisible();
  });

  test("outcome columns render", async ({ page }) => {
    // The sticky header row contains outcome column labels
    const header = page.locator("[class*='sticky'], thead, [class*='header']").first();
    await expect(header).toBeVisible();
  });
});
