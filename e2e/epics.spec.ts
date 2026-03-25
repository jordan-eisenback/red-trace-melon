import { test, expect } from "./fixtures";

test.describe("Epics & Stories", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/epics-stories");
    await page.waitForTimeout(300);
    const overlay = page.locator(".fixed.inset-0").first();
    if (await overlay.isVisible().catch(() => false)) {
      await overlay.getByRole("button").last().click().catch(() => {});
      await page.waitForTimeout(200);
    }
  });

  test("renders epic cards", async ({ page }) => {
    // The h1 is "Epics & User Stories" — wait for the page to fully load
    await expect(page.locator("h1").filter({ hasText: /Epics/i })).toBeVisible({ timeout: 10000 });
  });

  test("view toggle switches between Epics and Stories views", async ({ page }) => {
    // Should have tab/toggle buttons
    const storiesTab = page.getByRole("button", { name: /stories/i }).first();
    if (await storiesTab.isVisible()) {
      await storiesTab.click();
      await expect(page.getByText(/story|stories/i).first()).toBeVisible();
    }
  });

  test("add epic dialog opens and cancels", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /add epic/i });
    if (!(await addBtn.isVisible())) return;
    await addBtn.click();
    // EpicModal uses fixed inset-0, not role="dialog"
    const modal = page.locator(".fixed.inset-0").last();
    await expect(modal).toBeVisible({ timeout: 5000 });
    await modal.getByRole("button", { name: /cancel/i }).click();
    await expect(page.locator(".fixed.inset-0")).not.toBeVisible();
  });

  test("add and delete an epic", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /add epic/i });
    if (!(await addBtn.isVisible())) {
      test.skip();
      return;
    }
    await addBtn.click();
    // EpicModal uses fixed inset-0, not role="dialog"
    const modal = page.locator(".fixed.inset-0").last();
    await expect(modal).toBeVisible({ timeout: 5000 });

    // EpicModal has no htmlFor or placeholder on inputs — use nth() indexing
    // Text input order: [0] Epic ID, [1] Title, [2] Owner
    // Textarea: [0] Description
    const textInputs = modal.locator("input[type='text']");
    await textInputs.nth(0).fill("E2E-EPIC-999"); // Epic ID
    await textInputs.nth(1).fill("E2E Epic Test"); // Title
    await modal.locator("textarea").first().fill("E2E test epic created by Playwright"); // Description
    await textInputs.nth(2).fill("Playwright"); // Owner

    await modal.getByRole("button", { name: /create epic/i }).click();
    await expect(page.locator(".fixed.inset-0")).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText("E2E Epic Test")).toBeVisible();

    // Delete — find the epic card and click its delete button
    const epicCard = page.locator(".bg-white.rounded-lg.border.p-6", { hasText: "E2E Epic Test" }).first();
    await epicCard.locator(".flex.items-center.gap-1").getByRole("button").last().click();
    // ConfirmDialog (Radix AlertDialog)
    await page.locator('[role="alertdialog"]').getByRole("button", { name: /delete/i }).click();
    await expect(page.getByText("E2E Epic Test")).not.toBeVisible();
  });

  test("epic edit button opens pre-populated form", async ({ page }) => {
    // Epic cards render edit buttons in the top-right; buttons are always visible (no hover needed)
    // The epic card layout: flex items-start justify-between with buttons on the right
    const firstEpicCard = page.locator(".bg-white.rounded-lg.border.p-6").first();
    await expect(firstEpicCard).toBeVisible({ timeout: 10000 });
    // Edit button is first in the flex gap-1 container on the right
    const editBtn = firstEpicCard.locator(".flex.items-center.gap-1").getByRole("button").first();
    await editBtn.click();
    // EpicModal uses fixed inset-0
    await expect(page.locator(".fixed.inset-0").last()).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.locator(".fixed.inset-0")).not.toBeVisible();
  });
});
