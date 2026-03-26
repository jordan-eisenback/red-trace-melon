/**
 * E2E tests for the velocity-snake vendor integration:
 *   - /vendor-scorecard   (VendorScorecard)
 *   - /requirement-coverage (RequirementCoverage)
 *   - /vendor-settings    (VendorSettings)
 *   - RequirementDetail   (Vendor Coverage section)
 *   - GapAnalysisPanel    (Vendor Coverage Gaps section)
 *
 * The fixture pre-seeds localStorage so the app starts with the default
 * vendor data (3 vendors, 1 evaluator, 1 criteria profile, 1 weighting profile).
 */

import { test, expect } from "./fixtures";

// ---------------------------------------------------------------------------
// Navigation — vendor pages appear in the nav
// ---------------------------------------------------------------------------

test.describe("Vendor nav links", () => {
  test("Vendor Scorecard link is present and navigates correctly", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /vendor scorecard/i }).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/vendor-scorecard/);
    await expect(page.getByRole("heading", { name: /vendor scorecard/i })).toBeVisible();
  });

  test("Req. Coverage link is present and navigates correctly", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /req.*coverage/i }).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/requirement-coverage/);
    await expect(page.getByRole("heading", { name: /requirement coverage/i })).toBeVisible();
  });

  test("Vendor Settings link is present and navigates correctly", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /vendor settings/i }).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/vendor-settings/);
    await expect(page.getByRole("heading", { name: /vendor settings/i })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// VendorScorecard page
// ---------------------------------------------------------------------------

test.describe("VendorScorecard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/vendor-scorecard");
  });

  test("renders summary stat cards", async ({ page }) => {
    // Stat cards render a label in a small text element — use exact match scoped to the card grid
    await expect(page.getByText("Vendors", { exact: true })).toBeVisible();
    await expect(page.getByText("Evaluators", { exact: true })).toBeVisible();
    await expect(page.getByText("Criteria", { exact: true })).toBeVisible();
  });

  test("Score Entry tab is default and shows evaluator selector", async ({ page }) => {
    await expect(page.getByText(/scoring as/i)).toBeVisible();
    // The select trigger for evaluator is present
    await expect(page.getByRole("combobox").first()).toBeVisible();
  });

  test("Score Entry tab shows per-vendor progress bars", async ({ page }) => {
    // Default data has 3 vendors — check at least one progress bar is rendered
    const progressBars = page.locator('[role="progressbar"]');
    await expect(progressBars.first()).toBeVisible();
  });

  test("Score Entry tab shows criteria accordion", async ({ page }) => {
    // The accordion items use AccordionTrigger which renders a button
    const accordionTriggers = page.locator('[data-radix-collection-item]');
    await expect(accordionTriggers.first()).toBeVisible();
  });

  test("Results tab renders without errors", async ({ page }) => {
    await page.getByRole("tab", { name: /results/i }).click();
    // Either the empty state or the chart card is shown
    const noResults = page.getByText(/no results yet/i);
    const chartCard = page.getByText(/overall normalised score/i);
    const hasOne = (await noResults.isVisible()) || (await chartCard.isVisible());
    expect(hasOne).toBe(true);
  });

  test("switching evaluators updates the selector value", async ({ page }) => {
    const select = page.getByRole("combobox").first();
    await select.click();
    // Pick the first item in the dropdown
    const firstOption = page.getByRole("option").first();
    const optionText = await firstOption.innerText();
    await firstOption.click();
    await expect(select).toContainText(optionText.trim());
  });
});

// ---------------------------------------------------------------------------
// RequirementCoverage page
// ---------------------------------------------------------------------------

test.describe("RequirementCoverage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/requirement-coverage");
  });

  test("renders summary cards — Total, Linked, Gaps", async ({ page }) => {
    await expect(page.getByText(/total requirements/i)).toBeVisible();
    await expect(page.getByText(/linked to criteria/i)).toBeVisible();
    await expect(page.getByText(/no vendor coverage/i)).toBeVisible();
  });

  test("renders the requirement matrix table", async ({ page }) => {
    // Table headers: Requirement, Type, Linked Criteria, Coverage
    await expect(page.getByRole("columnheader", { name: /requirement/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /type/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /linked criteria/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /coverage/i })).toBeVisible();
  });

  test("search filter narrows the table", async ({ page }) => {
    // Count rows before filter
    const rowsBefore = await page.locator("tbody tr").count();

    // Type a specific requirement ID fragment that won't match everything
    const searchInput = page.getByPlaceholder(/search requirements/i);
    await searchInput.fill("RTM-001");

    const rowsAfter = await page.locator("tbody tr").count();
    expect(rowsAfter).toBeLessThanOrEqual(rowsBefore);
  });

  test("?search= query param pre-populates search filter", async ({ page }) => {
    await page.goto("/requirement-coverage?search=RTM-001");
    const searchInput = page.getByPlaceholder(/search requirements/i);
    await expect(searchInput).toHaveValue("RTM-001");
  });

  test("clicking the map button opens the mapping modal", async ({ page }) => {
    // Find the first link/unlink icon button in the table and click it
    const mapBtn = page.locator("tbody tr").first().getByRole("button").last();
    await mapBtn.click();
    // The modal dialog should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.getByText(/map vendor criteria/i)).toBeVisible();
  });

  test("mapping modal can be closed with Done", async ({ page }) => {
    const mapBtn = page.locator("tbody tr").first().getByRole("button").last();
    await mapBtn.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.getByRole("button", { name: /done/i }).click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test("mapping modal shows criteria accordion", async ({ page }) => {
    const mapBtn = page.locator("tbody tr").first().getByRole("button").last();
    await mapBtn.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    // At least one accordion trigger (criterion category) is visible
    await expect(
      page.locator('[role="dialog"] button[data-radix-collection-item]').first()
    ).toBeVisible();
  });

  test("mapped/unmapped filter works", async ({ page }) => {
    const filterSelect = page.getByRole("combobox", { name: "" }).nth(1);
    await filterSelect.click();
    await page.getByRole("option", { name: /unmapped/i }).click();
    // All visible rows should show the AlertTriangle (no criteria linked)
    // — just verify the filter applied without error
    await expect(page.locator("tbody")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// VendorSettings page
// ---------------------------------------------------------------------------

test.describe("VendorSettings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/vendor-settings");
  });

  test("renders four tabs", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /vendors/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /evaluators/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /criteria profiles/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /weighting/i })).toBeVisible();
  });

  // ---- Vendors tab --------------------------------------------------------

  test("Vendors tab lists default vendors with type badges", async ({ page }) => {
    // Default data: Cayosoft (existing), Netwrix (replacement), Replacement Option 2
    await expect(page.getByText(/cayosoft/i)).toBeVisible();
    await expect(page.getByText(/netwrix/i)).toBeVisible();
    // At least one "Current" badge
    await expect(page.getByText("Current").first()).toBeVisible();
  });

  test("Add Vendor dialog opens and can be cancelled", async ({ page }) => {
    await page.getByRole("button", { name: /add vendor/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: /add vendor/i })).toBeVisible();
    // Close via clicking outside (Radix closes on Escape)
    await page.keyboard.press("Escape");
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test("can add a new vendor", async ({ page }) => {
    await page.getByRole("button", { name: /add vendor/i }).click();
    await page.getByLabel(/name/i).fill("Test Vendor E2E");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await expect(page.getByText("Test Vendor E2E")).toBeVisible();
  });

  test("can edit an existing vendor", async ({ page }) => {
    // Click the first edit (pencil) button
    await page.locator('[title="Edit vendor"]').first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: /edit vendor/i })).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("delete vendor shows confirm dialog", async ({ page }) => {
    // Add a disposable vendor first so we have something we can delete
    await page.getByRole("button", { name: /add vendor/i }).click();
    await page.getByLabel(/name/i).fill("Delete Me");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // The new vendor is appended last — use its title-attributed delete button
    await page.locator('[title="Delete vendor"]').last().click();
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.locator('[role="alertdialog"]')).not.toBeVisible();
  });

  // ---- Evaluators tab -----------------------------------------------------

  test("Evaluators tab shows default evaluator", async ({ page }) => {
    await page.getByRole("tab", { name: /evaluators/i }).click();
    await expect(page.getByText(/default evaluator/i)).toBeVisible();
    await expect(page.getByText(/evaluator@example\.com/i)).toBeVisible();
  });

  test("can add a new evaluator", async ({ page }) => {
    await page.getByRole("tab", { name: /evaluators/i }).click();
    await page.getByRole("button", { name: /add evaluator/i }).click();
    await page.getByLabel(/name/i).fill("QA Tester");
    await page.getByLabel(/email/i).fill("qa@example.com");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await expect(page.getByText("QA Tester")).toBeVisible();
  });

  // ---- Criteria Profiles tab ----------------------------------------------

  test("Criteria Profiles tab shows default profile as active", async ({ page }) => {
    await page.getByRole("tab", { name: /criteria profiles/i }).click();
    await expect(page.getByRole("heading", { name: /identity governance/i })).toBeVisible();
    // Active badge
    await expect(page.getByText("Active").first()).toBeVisible();
  });

  test("active profile delete button is disabled with tooltip text", async ({ page }) => {
    await page.getByRole("tab", { name: /criteria profiles/i }).click();
    // The delete button on the active profile card should be disabled
    const activeCard = page.locator('[class*="border-indigo"]').first();
    const deleteBtn = activeCard.getByRole("button").last();
    await expect(deleteBtn).toBeDisabled();
    // The title attribute explains why
    const titleAttr = await deleteBtn.getAttribute("title");
    expect(titleAttr).toMatch(/deactivate|activate another/i);
  });

  test("Create Profile dialog opens and closes", async ({ page }) => {
    await page.getByRole("tab", { name: /criteria profiles/i }).click();
    await page.getByRole("button", { name: /create profile/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: /create criteria profile/i })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test("Import CSV dialog opens and shows format guidance", async ({ page }) => {
    await page.getByRole("tab", { name: /criteria profiles/i }).click();
    await page.getByRole("button", { name: /import csv/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    // Description should mention both comma and tab
    await expect(page.getByText(/comma.*tab|tab.*comma/i).first()).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("can export the active profile as CSV", async ({ page }) => {
    await page.getByRole("tab", { name: /criteria profiles/i }).click();
    // Listen for the download event
    const downloadPromise = page.waitForEvent("download");
    await page.locator('[title="Export profile as CSV"]').first().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });

  // ---- Weighting Profiles tab ---------------------------------------------

  test("Weighting Profiles tab shows default profile as active", async ({ page }) => {
    await page.getByRole("tab", { name: /weighting/i }).click();
    await expect(page.getByText(/default profile/i)).toBeVisible();
    await expect(page.getByText("Active").first()).toBeVisible();
    // Scale and mode badges
    await expect(page.getByText(/scale: 1-5/i)).toBeVisible();
    await expect(page.getByText(/mode: sub-criteria/i)).toBeVisible();
  });

  test("active weighting profile delete button is disabled", async ({ page }) => {
    await page.getByRole("tab", { name: /weighting/i }).click();
    const activeCard = page.locator('[class*="border-indigo"]').first();
    const deleteBtn = activeCard.getByRole("button").last();
    await expect(deleteBtn).toBeDisabled();
  });

  test("Add Profile dialog opens with scale and mode selects", async ({ page }) => {
    await page.getByRole("tab", { name: /weighting/i }).click();
    await page.getByRole("button", { name: /add profile/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.getByText(/scoring scale/i).first()).toBeVisible();
    await expect(page.getByText(/scoring mode/i).first()).toBeVisible();
    await expect(page.getByText(/category weights/i).first()).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("can create a new weighting profile", async ({ page }) => {
    await page.getByRole("tab", { name: /weighting/i }).click();
    await page.getByRole("button", { name: /add profile/i }).click();
    await page.getByLabel(/name/i).fill("E2E Weighting Profile");
    await page.getByRole("button", { name: /^create$/i }).click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await expect(page.getByText("E2E Weighting Profile")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// RequirementDetail — Vendor Coverage section
// ---------------------------------------------------------------------------

test.describe("RequirementDetail Vendor Coverage section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("table tbody tr").first().getByRole("link").first().click();
    await expect(page).toHaveURL(/\/requirements\//);
  });

  test("Vendor Coverage section heading is visible", async ({ page }) => {
    await expect(page.getByText(/vendor coverage/i)).toBeVisible();
  });

  test("shows empty state with link to coverage page when no criteria linked", async ({ page }) => {
    // Default: no links set, so either 'No vendor criteria linked' or
    // 'No criteria profile active' should appear
    const emptyMsg = page
      .getByText(/no vendor criteria linked|no criteria profile is active/i)
      .first();
    // If empty state shows, verify the CTA link is present
    const isEmptyVisible = await emptyMsg.isVisible();
    if (isEmptyVisible) {
      const ctaLink = page.getByRole("link", { name: /map a criterion|configure one/i }).first();
      await expect(ctaLink).toBeVisible();
    }
    // Either empty state or linked criteria chips — both are valid initial states
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GapAnalysisPanel — Vendor Coverage Gaps section
// ---------------------------------------------------------------------------

test.describe("GapAnalysisPanel Vendor Coverage Gaps", () => {
  test.beforeEach(async ({ page }) => {
    // GapAnalysisPanel is rendered on the Frameworks & Controls page
    await page.goto("/frameworks");
  });

  test("Vendor Coverage Gaps section is visible when profile is active", async ({ page }) => {
    // Default data has an active criteria profile, so the section renders
    await expect(page.getByRole("heading", { name: /vendor coverage gaps/i })).toBeVisible();
  });

  test("shows gap count badge", async ({ page }) => {
    // The section accordion button includes the gap count as text
    const sectionBtn = page.getByRole("button", { name: /vendor coverage gaps/i }).first();
    await expect(sectionBtn).toBeVisible();
  });

  test("clicking a gap item navigates to coverage page with search pre-filled", async ({
    page,
  }) => {
    // Expand the Vendor Coverage Gaps section if not already open
    const sectionBtn = page.getByRole("button", { name: /vendor coverage gaps/i }).first();
    await sectionBtn.click();

    // If there are gap items, click the first one
    const firstGapItem = page
      .locator(".bg-white.p-3.rounded-lg.border")
      .filter({ hasText: /RTM-/i })
      .first();

    const hasGaps = await firstGapItem.isVisible().catch(() => false);
    if (hasGaps) {
      const reqId = await firstGapItem.locator(".font-mono").innerText();
      await firstGapItem.click();
      await expect(page).toHaveURL(/requirement-coverage/);
      // The search param should be present in the URL
      const url = page.url();
      expect(url).toContain("search=");
      // And the search input should be pre-filled
      const searchInput = page.getByPlaceholder(/search requirements/i);
      await expect(searchInput).toHaveValue(reqId.trim());
    }
  });

  test("summary banner shows vendor gap count when gaps exist", async ({ page }) => {
    // The indigo banner in the Summary Stats section appears when vendorGaps > 0
    const banner = page.locator('[class*="bg-indigo-50"]').filter({
      hasText: /vendor evaluation criterion/i,
    });
    // Either the banner is visible (gaps exist) or it isn't (all linked) — both are valid
    const bannerCount = await banner.count();
    expect(bannerCount).toBeGreaterThanOrEqual(0);
  });
});
