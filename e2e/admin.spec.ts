/**
 * E2E tests for the Admin page — /admin
 *
 * Covers:
 *   - Navigation to the admin page via the nav Admin link
 *   - Page structure (heading, two sections, reset button)
 *   - Section collapse / expand
 *   - Toggling a page switch removes that link from the nav bar
 *   - Re-toggling restores it
 *   - "Hide all" bulk action hides all nav items in the section
 *   - "Show all" bulk action restores them
 *   - Amber warning banner appears when items are hidden
 *   - Badge counter updates as items are hidden/restored
 *   - Protected switch (Requirements List) stays disabled
 *   - Reset all dialog — cancel keeps state, confirm resets to all-visible
 *   - localStorage key is written correctly
 *
 * Each test resets rtm-admin-visibility to the default (all visible) via
 * addInitScript so tests are fully isolated.
 */

import { test, expect } from "./fixtures";

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

test.describe("Admin nav link", () => {
  test("Admin link is present in nav and navigates to /admin", async ({ page }) => {
    await page.goto("/");
    const adminLink = page.getByRole("link", { name: /admin/i }).last();
    await expect(adminLink).toBeVisible();
    await adminLink.click();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByRole("heading", { name: /admin settings/i })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Page structure
// ---------------------------------------------------------------------------

test.describe("Admin page structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("rtm-admin-visibility", JSON.stringify({}));
    });
    await page.goto("/admin");
  });

  test("renders the page heading and description", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /admin settings/i })).toBeVisible();
    await expect(page.getByText(/control which pages and features are visible/i).first()).toBeVisible();
  });

  test("renders the Pages section", async ({ page }) => {
    await expect(page.getByText("Pages", { exact: true }).first()).toBeVisible();
  });

  test("renders the Features & Panels section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /features & panels/i })).toBeVisible();
  });

  test("renders the Reset all button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /reset all/i })).toBeVisible();
  });

  test("Pages section shows correct visible count badge (11/11)", async ({ page }) => {
    // All defaults are visible — badge should read 11/11
    await expect(page.getByText("11/11 visible")).toBeVisible();
  });

  test("Features section shows correct visible count badge (8/8)", async ({ page }) => {
    await expect(page.getByText("8/8 visible")).toBeVisible();
  });

  test("Requirements List switch is disabled (protected)", async ({ page }) => {
    const reqSwitch = page.getByRole("switch", { name: /toggle visibility of requirements list/i });
    await expect(reqSwitch).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Section collapse / expand
// ---------------------------------------------------------------------------

test.describe("Section collapse / expand", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("rtm-admin-visibility", JSON.stringify({}));
    });
    await page.goto("/admin");
  });

  test("clicking Pages section header collapses the list", async ({ page }) => {
    // Switches are visible by default
    const depSwitch = page.getByRole("switch", { name: /toggle visibility of dependencies/i });
    await expect(depSwitch).toBeVisible();

    // Click the section header button (contains "Pages" heading)
    await page.getByRole("button", { name: /pages/i }).first().click();
    await expect(depSwitch).not.toBeVisible();
  });

  test("clicking a collapsed section header expands it again", async ({ page }) => {
    const depSwitch = page.getByRole("switch", { name: /toggle visibility of dependencies/i });
    // Collapse
    await page.getByRole("button", { name: /pages/i }).first().click();
    await expect(depSwitch).not.toBeVisible();
    // Expand
    await page.getByRole("button", { name: /pages/i }).first().click();
    await expect(depSwitch).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Toggling individual items
// ---------------------------------------------------------------------------

test.describe("Individual toggle — removes / restores nav link", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("rtm-admin-visibility", JSON.stringify({}));
    });
    await page.goto("/admin");
  });

  test("hiding Dependencies removes it from the nav bar", async ({ page }) => {
    // Confirm it is in the nav before toggling
    await expect(page.getByRole("link", { name: /^dependencies$/i })).toBeVisible();

    // Toggle the switch off
    await page.getByRole("switch", { name: /toggle visibility of dependencies/i }).click();

    // The nav link should be gone
    await expect(page.getByRole("link", { name: /^dependencies$/i })).not.toBeVisible();
  });

  test("re-enabling Dependencies restores it to the nav bar", async ({ page }) => {
    // Hide it
    await page.getByRole("switch", { name: /toggle visibility of dependencies/i }).click();
    await expect(page.getByRole("link", { name: /^dependencies$/i })).not.toBeVisible();

    // Show it again
    await page.getByRole("switch", { name: /toggle visibility of dependencies/i }).click();
    await expect(page.getByRole("link", { name: /^dependencies$/i })).toBeVisible();
  });

  test("'hidden' badge appears on item row when toggled off", async ({ page }) => {
    // Scope to the Pages section row for "Hierarchy" (description: "Tree-based...")
    const hierarchyRow = page.locator("li").filter({ hasText: "Tree-based requirement hierarchy" });
    await hierarchyRow.getByRole("switch").click();
    await expect(hierarchyRow.getByText("hidden")).toBeVisible();
  });

  test("badge counter on section header updates when an item is hidden", async ({ page }) => {
    // Start: 11/11
    await expect(page.getByText("11/11 visible")).toBeVisible();
    // Hide Dependencies
    await page.getByRole("switch", { name: /toggle visibility of dependencies/i }).click();
    // Now: 10/11
    await expect(page.getByText("10/11 visible")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Warning banner
// ---------------------------------------------------------------------------

test.describe("Warning banner", () => {
  test("no warning banner when all items visible", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("rtm-admin-visibility", JSON.stringify({}));
    });
    await page.goto("/admin");
    await expect(page.getByText(/currently hidden/i)).not.toBeVisible();
  });

  test("amber warning banner appears after hiding an item", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("rtm-admin-visibility", JSON.stringify({}));
    });
    await page.goto("/admin");
    await page.getByRole("switch", { name: /toggle visibility of dependencies/i }).click();
    await expect(page.getByText(/1 item is currently hidden/i)).toBeVisible();
  });

  test("warning banner loads pre-seeded with hidden count", async ({ page }) => {
    // Seed with 3 items already hidden
    await page.addInitScript(() => {
      localStorage.setItem(
        "rtm-admin-visibility",
        JSON.stringify({
          "page:dependencies": false,
          "page:hierarchy": false,
          "page:workstreams": false,
        })
      );
    });
    await page.goto("/admin");
    await expect(page.getByText(/3 items are currently hidden/i)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Bulk actions — Hide all / Show all
// ---------------------------------------------------------------------------

test.describe("Bulk actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("rtm-admin-visibility", JSON.stringify({}));
    });
    await page.goto("/admin");
  });

  test("'Hide all' in Pages section removes all page nav links (except protected)", async ({
    page,
  }) => {
    // The Pages section Hide all button is the first "Hide all" on the page
    const hideAllBtns = page.getByRole("button", { name: /hide all/i });
    await hideAllBtns.first().click();

    // Non-protected pages should be gone from nav
    await expect(page.getByRole("link", { name: /^dependencies$/i })).not.toBeVisible();
    await expect(page.getByRole("link", { name: /^hierarchy$/i })).not.toBeVisible();
    await expect(page.getByRole("link", { name: /story mapping/i })).not.toBeVisible();
    // Requirements List is protected — its nav link (href="/") must still be visible
    await expect(page.getByRole("link", { name: "Requirements List" })).toBeVisible();
  });

  test("'Show all' in Pages section restores all nav links", async ({ page }) => {
    // First hide all
    await page.getByRole("button", { name: /hide all/i }).first().click();
    await expect(page.getByRole("link", { name: /^dependencies$/i })).not.toBeVisible();

    // Then show all
    await page.getByRole("button", { name: /show all/i }).first().click();
    await expect(page.getByRole("link", { name: /^dependencies$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^hierarchy$/i })).toBeVisible();
  });

  test("badge counter reads '1/11 visible' after Hide all pages", async ({ page }) => {
    await page.getByRole("button", { name: /hide all/i }).first().click();
    // Requirements List is protected so it stays visible → 1/11
    await expect(page.getByText("1/11 visible")).toBeVisible();
  });

  test("badge counter reads '11/11 visible' after Show all pages", async ({ page }) => {
    await page.getByRole("button", { name: /hide all/i }).first().click();
    await page.getByRole("button", { name: /show all/i }).first().click();
    await expect(page.getByText("11/11 visible")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Reset all dialog
// ---------------------------------------------------------------------------

test.describe("Reset all dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "rtm-admin-visibility",
        JSON.stringify({ "page:dependencies": false, "page:hierarchy": false })
      );
    });
    await page.goto("/admin");
  });

  test("Reset all opens confirmation dialog", async ({ page }) => {
    await page.getByRole("button", { name: /reset all/i }).click();
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();
    await expect(page.getByText(/reset visibility settings/i)).toBeVisible();
  });

  test("cancelling Reset all keeps existing hidden state", async ({ page }) => {
    await page.getByRole("button", { name: /reset all/i }).click();
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.locator('[role="alertdialog"]')).not.toBeVisible();
    // Items still hidden
    await expect(page.getByRole("link", { name: /^dependencies$/i })).not.toBeVisible();
  });

  test("confirming Reset all makes all items visible again", async ({ page }) => {
    await page.getByRole("button", { name: /reset all/i }).click();
    await page.getByRole("button", { name: /^reset$/i }).click();
    await expect(page.locator('[role="alertdialog"]')).not.toBeVisible();
    // Both previously-hidden items are restored in nav
    await expect(page.getByRole("link", { name: /^dependencies$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^hierarchy$/i })).toBeVisible();
    // Section badge back to 11/11
    await expect(page.getByText("11/11 visible")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

test.describe("localStorage persistence", () => {
  test("hiding an item persists after page reload", async ({ page }) => {
    // Use addInitScript (not evaluate) so the key survives the fixture's
    // localStorage.clear() + re-seed that runs on every page load/reload.
    // The fixture seeds rtm-has-visited first; this script runs second and
    // adds the clean admin-visibility state on top of it.
    // Key is namespaced with the default project id (proj_rbac).
    await page.addInitScript(() => {
      localStorage.setItem("rtm-admin-visibility-proj_rbac", JSON.stringify({}));
    });
    await page.goto("/admin");

    // Hide Workstreams via the toggle switch
    await page.getByRole("switch", { name: /toggle visibility of workstreams/i }).click();
    await expect(page.getByRole("link", { name: /^workstreams$/i })).not.toBeVisible();

    // Capture the current admin-visibility value so we can re-seed it on reload
    const savedState = await page.evaluate(() =>
      localStorage.getItem("rtm-admin-visibility-proj_rbac")
    );

    // Inject the saved state so it survives the clear() on reload
    await page.addInitScript((state) => {
      localStorage.setItem("rtm-admin-visibility-proj_rbac", state!);
    }, savedState);

    await page.reload();
    await expect(page.getByRole("link", { name: /^workstreams$/i })).not.toBeVisible();
  });

  test("rtm-admin-visibility key is written to localStorage", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("rtm-admin-visibility-proj_rbac", JSON.stringify({}));
    });
    await page.goto("/admin");

    await page.getByRole("switch", { name: /toggle visibility of help center/i }).click();

    const raw = await page.evaluate(() =>
      localStorage.getItem("rtm-admin-visibility-proj_rbac")
    );
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw!);
    expect(stored["page:help"]).toBe(false);
  });
});
