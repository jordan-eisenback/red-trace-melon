import { test, expect } from "./fixtures";

test.describe("Tooltips", () => {
  test("tooltip appears on Export Excel button in RequirementsList", async ({ page }) => {
    await page.goto("/");
    const exportBtn = page.getByRole("button", { name: /export/i });
    await exportBtn.hover();
    await page.waitForTimeout(400); // delayDuration=300
    await expect(page.getByText(/excel workbook|export all/i)).toBeVisible();
  });

  test("tooltip appears on delete button in RequirementsList", async ({ page }) => {
    await page.goto("/");
    // Hover the row first to reveal action buttons, then hover the delete button
    const row = page.locator("table tbody tr").first();
    await row.hover();
    await page.waitForTimeout(100);
    const deleteBtn = row.getByRole("button").last();
    await deleteBtn.hover();
    await page.waitForTimeout(400);
    await expect(page.getByText(/delete this requirement/i)).toBeVisible();
  });

  test("tooltip appears on Edit button in RequirementDetail", async ({ page }) => {
    await page.goto("/");
    // Navigate via the Eye link
    await page.locator("table tbody tr").first().getByRole("link").first().click();
    await expect(page).toHaveURL(/\/requirements\//);
    const editBtn = page.getByRole("button", { name: /edit/i });
    await editBtn.hover();
    await page.waitForTimeout(400);
    await expect(page.getByText(/edit this requirement/i)).toBeVisible();
  });

  test("tooltip appears on Add Workstream button", async ({ page }) => {
    await page.goto("/workstreams");
    const btn = page.getByRole("button", { name: /add workstream/i });
    await btn.hover();
    await page.waitForTimeout(400);
    await expect(page.getByText(/add a new workstream/i)).toBeVisible();
  });

  test("tooltip appears on Swimlane view toggle", async ({ page }) => {
    await page.goto("/workstreams");
    await page.getByRole("button", { name: /swimlane/i }).hover();
    await page.waitForTimeout(400);
    await expect(page.getByText(/grouped by layer/i)).toBeVisible();
  });

  test("tooltip appears on Auto-link button in Story Mapping", async ({ page }) => {
    await page.goto("/story-mapping");
    await page.getByRole("button", { name: /auto-link/i }).hover();
    await page.waitForTimeout(400);
    await expect(page.getByText(/keyword and requirement matching/i)).toBeVisible();
  });

  test("tooltip appears on Add Framework button", async ({ page }) => {
    await page.goto("/frameworks");
    await page.getByRole("button", { name: /add framework/i }).hover();
    await page.waitForTimeout(400);
    await expect(page.getByText(/new compliance framework/i)).toBeVisible();
  });

  test("tooltip appears on Expand All button", async ({ page }) => {
    await page.goto("/frameworks");
    await page.getByRole("button", { name: /expand all/i }).hover();
    await page.waitForTimeout(400);
    await expect(page.getByText(/expand all frameworks/i)).toBeVisible();
  });
});
