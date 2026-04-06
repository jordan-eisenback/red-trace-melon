import { test as base } from "@playwright/test";

/**
 * Extended `test` that dismisses the WelcomeModal and any other overlays
 * before yielding the page to the test body.
 *
 * Isolation guarantee (required for workers: 'auto' / fullyParallel: true):
 *   Each test begins with a fully-cleared localStorage so no write-test can
 *   pollute the next test running in the same browser context.  The two
 *   "always-on" keys are re-seeded immediately after the clear so the app
 *   never shows the WelcomeModal or UpdateBanner.
 *
 *   Per-test addInitScript calls in individual spec files run *after* this
 *   fixture script (scripts execute in registration order), so they can
 *   safely overwrite specific keys on top of this clean slate.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Clear all localStorage then re-seed the two modal-suppression keys.
    // This runs before every navigation, guaranteeing test isolation even
    // when multiple tests share the same browser context (same worker).
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem("rtm-has-visited", "true");
      localStorage.setItem("rtm-update-banner-seen", "true");
    });

    // After each navigation, wait for any welcome/onboarding overlay and dismiss it
    page.on("load", async () => {
      try {
        // If a full-screen overlay is present, click the first close/dismiss button
        const overlay = page.locator(".fixed.inset-0").first();
        const isVisible = await overlay.isVisible({ timeout: 800 }).catch(() => false);
        if (isVisible) {
          const closeBtn = overlay.getByRole("button").last();
          await closeBtn.click({ timeout: 1000 }).catch(() => {});
        }
      } catch {
        // Ignore — no overlay present
      }
    });

    await use(page);
  },
});

export { expect } from "@playwright/test";
