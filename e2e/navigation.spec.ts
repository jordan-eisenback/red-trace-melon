import { test, expect } from "./fixtures";

test.describe("Navigation", () => {
  test("loads the home page (Requirements List)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /requirements/i })).toBeVisible();
  });

  test("nav links render and are clickable", async ({ page }) => {
    await page.goto("/");

    const navLinks = [
      { label: "Dependencies",         path: "/dependencies" },
      { label: "Story Mapping",        path: "/story-mapping" },
      { label: "Frameworks & Controls",path: "/frameworks" },
      { label: "Epics & Stories",      path: "/epics" },
      { label: "Workstreams",          path: "/workstreams" },
      { label: "Help",                 path: "/help" },
    ];

    for (const { label, path } of navLinks) {
      await page.goto("/");
      const link = page.getByRole("link", { name: label, exact: true }).first();
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(new RegExp(path));
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
