import { test, expect } from "./fixtures";

test.describe("Navigation", () => {
  test("loads the home page (Requirements List)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /requirements/i })).toBeVisible();
  });

  // This test navigates through 6 pages sequentially; give it extra time under
  // parallel load (8 workers all hitting the same Vite dev server).
  test("nav links render and are clickable", async ({ page }) => {
    test.setTimeout(60_000);
    const navLinks = [
      { label: "Dependencies",          path: "/dependencies" },
      { label: "Story Mapping",         path: "/story-mapping" },
      { label: "Frameworks & Controls", path: "/frameworks" },
      { label: "Epics & Stories",       path: "/epics" },
      { label: "Workstreams",           path: "/workstreams" },
      { label: "Help",                  path: "/help" },
    ];

    for (const { label, path } of navLinks) {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      const link = page.getByRole("link", { name: label, exact: true }).first();
      await expect(link).toBeVisible();
      // Use Promise.all to start waiting for navigation before clicking
      await Promise.all([
        page.waitForURL(new RegExp(path), { timeout: 10_000 }),
        link.click(),
      ]);
    }
  });

  test("back navigation from requirement detail returns to list", async ({ page }) => {
    await page.goto("/");
    // Use the Eye (view) link — the row itself isn't clickable
    await page.locator("table tbody tr").first().getByRole("link").first().click();
    await expect(page).toHaveURL(/\/requirements\//);
    await page.getByRole("link", { name: /back/i }).click();
    await expect(page).toHaveURL("/");
  });
});
