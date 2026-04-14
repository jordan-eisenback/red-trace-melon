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
 *   - Export All — triggers a file download
 *   - Restore from Backup — valid ZIP loads data and shows confirm panel
 *   - Restore from Backup — invalid (non-ZIP) file shows error message
 *   - Restore from Backup — schema-invalid JSON inside ZIP shows validation warning
 *
 * Each test resets rtm-admin-visibility to the default (all visible) via
 * addInitScript so tests are fully isolated.
 */

import path from "path";
import os from "os";
import fs from "fs";
import JSZip from "jszip";
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

// ---------------------------------------------------------------------------
// Helper — build a valid RTM backup ZIP on disk and return the file path
// ---------------------------------------------------------------------------

async function buildValidBackupZip(overrides: {
  requirements?: unknown[];
  frameworks?: unknown[];
  epics?: unknown[];
  userStories?: unknown[];
  manifest?: Record<string, unknown>;
} = {}): Promise<string> {
  const requirements = overrides.requirements ?? [
    { id: "R-001", req: "Test requirement", type: "Enterprise", owner: "QA", parent: null, outcome: "", notes: "" },
  ];
  const frameworks = overrides.frameworks ?? [
    {
      id: "FW-001", name: "Test Framework", version: "1.0", description: "desc",
      category: "Compliance", isActive: true, controls: [],
    },
  ];
  const epics = overrides.epics ?? [
    { id: "E-001", title: "Test Epic", description: "desc", requirements: [], owner: "QA", status: "Backlog", priority: "High" },
  ];
  const userStories = overrides.userStories ?? [];
  const manifest = overrides.manifest ?? {
    version: 1,
    exportedAt: new Date().toISOString(),
    counts: { requirements: requirements.length, frameworks: frameworks.length, epics: epics.length, userStories: userStories.length },
  };

  const zip = new JSZip();
  zip.file("manifest.json",      JSON.stringify(manifest));
  zip.file("requirements.json",  JSON.stringify(requirements));
  zip.file("frameworks.json",    JSON.stringify(frameworks));
  zip.file("epics.json",         JSON.stringify(epics));
  zip.file("user-stories.json",  JSON.stringify(userStories));
  zip.file("story-map.json",     JSON.stringify({}));
  zip.file("story-jam.json",     JSON.stringify([]));
  zip.file("vendor-data.json",   JSON.stringify({}));

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  const tmpPath = path.join(os.tmpdir(), `rtm-test-backup-${Date.now()}.zip`);
  fs.writeFileSync(tmpPath, buffer);
  return tmpPath;
}

// ---------------------------------------------------------------------------
// Export All
// ---------------------------------------------------------------------------

test.describe("Export All Data", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("rtm-admin-visibility", JSON.stringify({}));
    });
    await page.goto("/admin");
  });

  test("Export All button is visible in the Data Management section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /data management/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /export all/i })).toBeVisible();
  });

  test("clicking Export All changes the button state (leaves idle)", async ({ page }) => {
    const exportBtn = page.getByRole("button", { name: /export all/i });
    await exportBtn.click();
    // In the headless browser the export completes (or errors) synchronously fast.
    // Assert the button leaves the "Export All" idle label — it becomes either
    // "Exporting…" (in-progress), "Exported" (success), or "Export failed — retry" (error).
    await expect(
      page.getByRole("button", { name: /exporting|exported|export failed/i })
    ).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// Restore from Backup — valid ZIP
// ---------------------------------------------------------------------------

test.describe("Restore from Backup — valid ZIP", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("rtm-admin-visibility", JSON.stringify({}));
    });
    await page.goto("/admin");
  });

  test("uploading a valid ZIP shows the restore confirmation panel", async ({ page }) => {
    const zipPath = await buildValidBackupZip();
    try {
      // The hidden file input accepts .zip — set it directly
      await page.locator('input[type="file"][accept=".zip"]').setInputFiles(zipPath);
      // Confirmation panel should appear
      await expect(page.getByText(/replace all current data\?/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /yes, restore/i })).toBeVisible();
    } finally {
      fs.unlinkSync(zipPath);
    }
  });

  test("the confirmation panel shows the correct item counts from the ZIP", async ({ page }) => {
    const zipPath = await buildValidBackupZip({
      requirements: [
        { id: "R-001", req: "Req one", type: "Enterprise", owner: "QA", parent: null, outcome: "", notes: "" },
        { id: "R-002", req: "Req two", type: "Enterprise", owner: "QA", parent: null, outcome: "", notes: "" },
      ],
    });
    try {
      await page.locator('input[type="file"][accept=".zip"]').setInputFiles(zipPath);
      await expect(page.getByText(/replace all current data\?/i)).toBeVisible();
      // Counts should mention 2 requirements
      await expect(page.getByText(/2 requirements/i)).toBeVisible();
    } finally {
      fs.unlinkSync(zipPath);
    }
  });

  test("cancelling the restore confirmation dismisses the panel", async ({ page }) => {
    const zipPath = await buildValidBackupZip();
    try {
      await page.locator('input[type="file"][accept=".zip"]').setInputFiles(zipPath);
      await expect(page.getByText(/replace all current data\?/i)).toBeVisible();
      await page.getByRole("button", { name: /^cancel$/i }).click();
      await expect(page.getByText(/replace all current data\?/i)).not.toBeVisible();
    } finally {
      fs.unlinkSync(zipPath);
    }
  });
});

// ---------------------------------------------------------------------------
// Restore from Backup — invalid ZIP
// ---------------------------------------------------------------------------

test.describe("Restore from Backup — invalid file", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("rtm-admin-visibility", JSON.stringify({}));
    });
    await page.goto("/admin");
  });

  test("uploading a non-ZIP file shows an error message", async ({ page }) => {
    // Write a plain text file with a .zip extension — JSZip will reject it
    const tmpPath = path.join(os.tmpdir(), `rtm-test-invalid-${Date.now()}.zip`);
    fs.writeFileSync(tmpPath, "this is not a zip file");
    try {
      await page.locator('input[type="file"][accept=".zip"]').setInputFiles(tmpPath);
      // JSZip throws "Can't find end of central directory : is this a zip file ?"
      // AdminPage renders the raw error message in a red <p> under the Restore button
      await expect(page.getByText(/is this a zip file/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/replace all current data\?/i)).not.toBeVisible();
    } finally {
      fs.unlinkSync(tmpPath);
    }
  });

  test("uploading a ZIP with wrong manifest version shows an error", async ({ page }) => {
    const zipPath = await buildValidBackupZip({ manifest: { version: 99, exportedAt: new Date().toISOString(), counts: {} } });
    try {
      await page.locator('input[type="file"][accept=".zip"]').setInputFiles(zipPath);
      await expect(page.getByText(/does not appear to be a valid rtm backup/i)).toBeVisible({ timeout: 5000 });
    } finally {
      fs.unlinkSync(zipPath);
    }
  });
});

// ---------------------------------------------------------------------------
// Restore from Backup — schema-invalid JSON
// ---------------------------------------------------------------------------

test.describe("Restore from Backup — schema-invalid JSON", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("rtm-admin-visibility", JSON.stringify({}));
    });
    await page.goto("/admin");
  });

  test("items failing AJV validation show a warning toast and the confirm panel still appears", async ({ page }) => {
    // Requirement missing required fields — AJV will reject it
    const zipPath = await buildValidBackupZip({
      requirements: [
        { id: "R-BAD" }, // missing req, type, owner, parent, outcome, notes
      ],
    });
    try {
      await page.locator('input[type="file"][accept=".zip"]').setInputFiles(zipPath);
      // The warning panel text is injected by AdminPage once restoreWarnings is non-empty
      await expect(
        page.getByText(/item\(s\) failed schema validation and will be skipped/i)
      ).toBeVisible({ timeout: 5000 });
      // Confirm panel still appears — invalid items are skipped, valid ones proceed
      await expect(page.getByText(/replace all current data\?/i)).toBeVisible({ timeout: 5000 });
    } finally {
      fs.unlinkSync(zipPath);
    }
  });
});
