import { test as base } from "@playwright/test";

/**
 * Extended `test` that dismisses the WelcomeModal and any other overlays
 * before yielding the page to the test body.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Pre-seed localStorage before any JS runs
    await page.addInitScript(() => {
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
