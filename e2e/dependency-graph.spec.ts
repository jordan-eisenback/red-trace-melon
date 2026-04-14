/**
 * E2E tests for the Dependency Graph page — /dependencies
 *
 * Covers:
 *   - Page loads and heading is visible
 *   - ReactFlow canvas (.react-flow) is rendered
 *   - At least one ReactFlow node is present in the canvas
 *   - Clicking a node navigates to the requirement detail page
 *   - Legend items are visible
 *   - ReactFlow controls (zoom in/out, fit view) are present
 *
 * The route is lazy-loaded (React.lazy + Suspense) so tests use
 * waitForLoadState('networkidle') to wait for the chunk to hydrate.
 */

import { test, expect } from "./fixtures";

test.describe("Dependency Graph — /dependencies", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dependencies");
    // Wait for the lazy-loaded chunk and ReactFlow to finish rendering
    await page.waitForLoadState("networkidle");
    // ReactFlow mounts asynchronously; wait for the container selector
    await page.waitForSelector(".react-flow", { timeout: 15_000 });
  });

  test("heading and description are visible", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /dependency graph/i })
    ).toBeVisible();
    await expect(
      page.getByText(/visualizes parent-child relationships/i)
    ).toBeVisible();
  });

  test("ReactFlow canvas is rendered", async ({ page }) => {
    const canvas = page.locator(".react-flow");
    await expect(canvas).toBeVisible();
  });

  test("at least one ReactFlow node is visible in the canvas", async ({
    page,
  }) => {
    // ReactFlow renders nodes inside .react-flow__node elements
    const nodes = page.locator(".react-flow__node");
    await expect(nodes.first()).toBeVisible({ timeout: 10_000 });
    const count = await nodes.count();
    expect(count).toBeGreaterThan(0);
  });

  test("node contains a requirement ID label", async ({ page }) => {
    // Seed data starts with RBAC-ENT-001 — it must appear as a node label
    const nodeLabel = page.locator(".react-flow__node").filter({
      hasText: "RBAC-ENT-001",
    });
    await expect(nodeLabel.first()).toBeVisible({ timeout: 10_000 });
  });

  test("clicking a node navigates to the requirement detail page", async ({
    page,
  }) => {
    // ReactFlow positions nodes with absolute coords; after fitView they may
    // be outside the default Playwright viewport. Use dispatchEvent to fire
    // the synthetic click that ReactFlow's onNodeClick listens for.
    const firstNode = page.locator(".react-flow__node").first();
    await expect(firstNode).toBeVisible({ timeout: 10_000 });
    await firstNode.dispatchEvent("click");
    // Should navigate to /requirements/<id>
    await page.waitForURL(/\/requirements\//, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/requirements\//);
  });

  test("legend items are visible", async ({ page }) => {
    // The legend is a flex row of <span class="text-slate-600"> labels above the canvas.
    // Use .text-slate-600 to scope away from the node-label divs inside ReactFlow.
    await expect(
      page.locator("span.text-slate-600", { hasText: "Enterprise" }).first()
    ).toBeVisible();
    await expect(
      page.locator("span.text-slate-600", { hasText: "Capability" }).first()
    ).toBeVisible();
    await expect(
      page.locator("span.text-slate-600", { hasText: "Non-Functional" }).first()
    ).toBeVisible();
  });

  test("ReactFlow Controls panel is rendered", async ({ page }) => {
    // ReactFlow injects a controls panel with zoom buttons
    const controls = page.locator(".react-flow__controls");
    await expect(controls).toBeVisible({ timeout: 10_000 });
  });
});
