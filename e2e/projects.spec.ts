/**
 * E2E tests for the Projects page — /projects
 *
 * Covers:
 *   - "Projects" nav link is present and navigates to /projects
 *   - Page renders heading and default RBAC project card
 *   - ProjectSwitcher in the header shows the active project name
 *   - Creating a new project via the page form
 *   - Editing a project name inline
 *   - Switching the active project via the card button
 *   - ProjectSwitcher dropdown lists projects and switches on click
 *   - Deleting a project (with confirmation)
 *   - Cannot delete the last project (trash button hidden)
 *   - New project dialog via the ProjectSwitcher "New project" button
 */

import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Seed a fresh projects list so tests are independent of seed data. */
async function seedProjects(
  page: Page,
  projects: Array<{ id: string; name: string; color: string; description?: string }>,
  activeId: string,
) {
  await page.addInitScript(
    ({ projects, activeId }: { projects: unknown[]; activeId: string }) => {
      const now = new Date().toISOString();
      const full = projects.map((p: unknown) => {
        const proj = p as { id: string; name: string; color: string; description?: string };
        return { ...proj, createdAt: now, updatedAt: now };
      });
      localStorage.setItem("rtm-projects", JSON.stringify(full));
      localStorage.setItem("rtm-active-project", JSON.stringify(activeId));
    },
    { projects, activeId },
  );
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

test.describe("Projects nav link", () => {
  test("Projects link is in the nav and navigates to /projects", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /projects/i }).last();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/projects/);
  });
});

// ---------------------------------------------------------------------------
// Page structure
// ---------------------------------------------------------------------------

test.describe("Projects page — structure", () => {
  test.beforeEach(async ({ page }) => {
    await seedProjects(
      page,
      [{ id: "proj_rbac", name: "RBAC / IGA", color: "#6366f1" }],
      "proj_rbac",
    );
    await page.goto("/projects");
  });

  test("renders the page heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /^projects$/i })).toBeVisible();
  });

  test("renders the default RBAC project card", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "RBAC / IGA" })).toBeVisible();
  });

  test("active project card shows the Active badge", async ({ page }) => {
    await expect(page.getByText("Active", { exact: true })).toBeVisible();
  });

  test("New project button is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /new project/i }).first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// ProjectSwitcher (header)
// ---------------------------------------------------------------------------

test.describe("ProjectSwitcher in header", () => {
  test.beforeEach(async ({ page }) => {
    await seedProjects(
      page,
      [
        { id: "proj_rbac", name: "RBAC / IGA", color: "#6366f1" },
        { id: "proj_ztna", name: "Zero Trust", color: "#0ea5e9" },
      ],
      "proj_rbac",
    );
    await page.goto("/");
  });

  test("shows the active project name in the header trigger", async ({ page }) => {
    await expect(page.getByRole("button", { name: /RBAC \/ IGA/i }).first()).toBeVisible();
  });

  test("clicking the trigger opens the dropdown", async ({ page }) => {
    await page.getByRole("button", { name: /RBAC \/ IGA/i }).first().click();
    await expect(page.getByText("Zero Trust")).toBeVisible();
  });

  test("selecting a project in the dropdown switches the active project", async ({ page }) => {
    await page.getByRole("button", { name: /RBAC \/ IGA/i }).first().click();
    await page.getByRole("option", { name: /Zero Trust/i }).click();
    // Trigger should now show the new project name
    await expect(page.getByRole("button", { name: /Zero Trust/i }).first()).toBeVisible();
  });

  test("pressing Escape closes the dropdown", async ({ page }) => {
    await page.getByRole("button", { name: /RBAC \/ IGA/i }).first().click();
    await expect(page.getByText("Zero Trust")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Zero Trust")).not.toBeVisible();
  });

  test("'New project' button in dropdown opens the dialog", async ({ page }) => {
    await page.getByRole("button", { name: /RBAC \/ IGA/i }).first().click();
    await page.getByRole("button", { name: /new project/i }).click();
    await expect(page.getByRole("heading", { name: /new project/i })).toBeVisible();
    await expect(page.getByPlaceholder(/zero trust/i)).toBeVisible();
  });

  test("creating a project via switcher dialog adds it to the dropdown", async ({ page }) => {
    await page.getByRole("button", { name: /RBAC \/ IGA/i }).first().click();
    await page.getByRole("button", { name: /new project/i }).click();
    await page.getByPlaceholder(/zero trust/i).fill("SOC 2 Audit");
    await page.getByRole("button", { name: /create project/i }).click();
    // Switcher trigger updates to the new project
    await expect(page.getByRole("button", { name: /SOC 2 Audit/i }).first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Creating a project (page form)
// ---------------------------------------------------------------------------

test.describe("Projects page — create project", () => {
  test.beforeEach(async ({ page }) => {
    await seedProjects(
      page,
      [{ id: "proj_rbac", name: "RBAC / IGA", color: "#6366f1" }],
      "proj_rbac",
    );
    await page.goto("/projects");
    await page.getByRole("button", { name: /new project/i }).first().click();
  });

  test("inline form appears after clicking New project", async ({ page }) => {
    await expect(page.getByPlaceholder(/zero trust network access/i)).toBeVisible();
  });

  test("Create button is disabled when name is empty", async ({ page }) => {
    await expect(page.getByRole("button", { name: /^create$/i })).toBeDisabled();
  });

  test("filling name enables the Create button", async ({ page }) => {
    await page.getByPlaceholder(/zero trust network access/i).fill("IAM Review");
    await expect(page.getByRole("button", { name: /^create$/i })).toBeEnabled();
  });

  test("submitting the form adds a new project card", async ({ page }) => {
    await page.getByPlaceholder(/zero trust network access/i).fill("IAM Review");
    await page.getByRole("button", { name: /^create$/i }).click();
    await expect(page.getByRole("heading", { name: "IAM Review" })).toBeVisible();
  });

  test("Cancel hides the inline form", async ({ page }) => {
    await page.getByRole("button", { name: /^cancel$/i }).first().click();
    await expect(page.getByPlaceholder(/zero trust network access/i)).not.toBeVisible();
  });

  test("new project card shows Active badge (switched automatically)", async ({ page }) => {
    await page.getByPlaceholder(/zero trust network access/i).fill("Brand New");
    await page.getByRole("button", { name: /^create$/i }).click();
    // The new card heading should be visible and the Active badge near it
    await expect(page.getByRole("heading", { name: "Brand New" })).toBeVisible();
    // Active badge appears somewhere on the page (new project is auto-switched)
    await expect(page.getByText("Active", { exact: true }).first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Editing a project
// ---------------------------------------------------------------------------

test.describe("Projects page — edit project", () => {
  test.beforeEach(async ({ page }) => {
    await seedProjects(
      page,
      [{ id: "proj_rbac", name: "RBAC / IGA", color: "#6366f1" }],
      "proj_rbac",
    );
    await page.goto("/projects");
    // Click the pencil edit button on the first card
    await page.getByRole("button", { name: /edit project/i }).first().click();
  });

  test("inline edit form appears", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Save", exact: true })).toBeVisible();
  });

  test("changing the name and saving updates the card", async ({ page }) => {
    // Use the first text input in the edit form (the name field, which has no placeholder text in the form)
    const editForm = page.locator("form").first();
    const inputs = editForm.getByRole("textbox");
    await inputs.first().clear();
    await inputs.first().fill("Renamed Project");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Renamed Project" })).toBeVisible();
  });

  test("Cancel reverts to the original name", async ({ page }) => {
    const editForm = page.locator("form").first();
    const inputs = editForm.getByRole("textbox");
    await inputs.first().clear();
    await inputs.first().fill("Oops");
    await page.getByRole("button", { name: /^cancel$/i }).first().click();
    await expect(page.getByRole("heading", { name: "RBAC / IGA" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Oops" })).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Switching active project via card button
// ---------------------------------------------------------------------------

test.describe("Projects page — switch active project", () => {
  test.beforeEach(async ({ page }) => {
    await seedProjects(
      page,
      [
        { id: "proj_rbac", name: "RBAC / IGA", color: "#6366f1" },
        { id: "proj_ztna", name: "Zero Trust", color: "#0ea5e9" },
      ],
      "proj_rbac",
    );
    await page.goto("/projects");
  });

  test("Switch button is absent on the active card", async ({ page }) => {
    // The RBAC card is active — find it by its heading, then scope to the card
    const rbacHeading = page.getByRole("heading", { name: "RBAC / IGA" });
    // The card wrapping div is 2 levels above the h3
    const rbacCard = rbacHeading.locator("..").locator("..");
    await expect(rbacCard.getByRole("button", { name: /^switch$/i })).not.toBeVisible();
  });

  test("clicking Switch on an inactive card gives it the Active badge", async ({ page }) => {
    await page.getByRole("button", { name: /^switch$/i }).first().click();
    // Zero Trust card should now show Active badge — scope to its heading's card
    const ztnaHeading = page.getByRole("heading", { name: "Zero Trust" });
    const ztnaCard = ztnaHeading.locator("..").locator("..");
    await expect(ztnaCard.getByText("Active", { exact: true })).toBeVisible();
  });

  test("switching updates the ProjectSwitcher trigger in the header", async ({ page }) => {
    await page.getByRole("button", { name: /^switch$/i }).first().click();
    await expect(page.getByRole("button", { name: /Zero Trust/i }).first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Deleting a project
// ---------------------------------------------------------------------------

test.describe("Projects page — delete project", () => {
  test.beforeEach(async ({ page }) => {
    await seedProjects(
      page,
      [
        { id: "proj_rbac", name: "RBAC / IGA", color: "#6366f1" },
        { id: "proj_del",  name: "To Be Deleted", color: "#ef4444" },
      ],
      "proj_rbac",
    );
    await page.goto("/projects");
  });

  test("trash button is visible on non-last projects", async ({ page }) => {
    await expect(page.getByRole("button", { name: /delete project/i }).first()).toBeVisible();
  });

  test("clicking trash shows inline confirmation", async ({ page }) => {
    // Click trash on the second card (To Be Deleted)
    await page.getByRole("button", { name: /delete project/i }).last().click();
    await expect(page.getByText(/delete "To Be Deleted"/i)).toBeVisible();
  });

  test("Cancel in confirmation keeps the project", async ({ page }) => {
    await page.getByRole("button", { name: /delete project/i }).last().click();
    await page.getByRole("button", { name: /^cancel$/i }).last().click();
    await expect(page.getByText("To Be Deleted")).toBeVisible();
  });

  test("confirming Delete removes the card", async ({ page }) => {
    await page.getByRole("button", { name: /delete project/i }).last().click();
    await page.getByRole("button", { name: /^delete$/i }).last().click();
    // Wait for the card heading to disappear (toast may still show project name briefly)
    await expect(page.getByRole("heading", { name: "To Be Deleted" })).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Last-project protection
// ---------------------------------------------------------------------------

test.describe("Projects page — last project protection", () => {
  test("trash button is hidden when only one project exists", async ({ page }) => {
    await seedProjects(
      page,
      [{ id: "proj_rbac", name: "RBAC / IGA", color: "#6366f1" }],
      "proj_rbac",
    );
    await page.goto("/projects");
    await expect(page.getByRole("button", { name: /delete project/i })).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Backup & Restore panel
// ---------------------------------------------------------------------------

test.describe("Projects page — Backup & Restore panel", () => {
  test.beforeEach(async ({ page }) => {
    await seedProjects(
      page,
      [{ id: "proj_rbac", name: "RBAC / IGA", color: "#6366f1" }],
      "proj_rbac",
    );
    await page.goto("/projects");
  });

  test("Backup & Restore toggle is visible on each card", async ({ page }) => {
    await expect(page.getByText(/backup & restore/i).first()).toBeVisible();
  });

  test("clicking the toggle expands the panel", async ({ page }) => {
    await page.getByText(/backup & restore/i).first().click();
    await expect(page.getByRole("button", { name: /export/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /choose zip/i })).toBeVisible();
  });

  test("clicking the toggle again collapses the panel", async ({ page }) => {
    await page.getByText(/backup & restore/i).first().click();
    await expect(page.getByRole("button", { name: /export/i }).first()).toBeVisible();
    await page.getByText(/backup & restore/i).first().click();
    await expect(page.getByRole("button", { name: /export/i })).not.toBeVisible();
  });
});
