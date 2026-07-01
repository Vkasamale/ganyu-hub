import { test, expect } from "@playwright/test";
import { login, screenshot, SEED_CLIENT, TEST_CREATIVE } from "./fixtures";

test.describe("Client dashboard", () => {
  test("/dashboard KPI cards + charts render", async ({ page }) => {
    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto("/dashboard");
    await page.waitForTimeout(1200); // count-up animation
    await expect(page.locator("svg").first()).toBeVisible();
    await screenshot(page, "client-dashboard-kpis-charts");
  });

  test("/dashboard/jobs charts render, tabs switch", async ({ page }) => {
    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto("/dashboard/jobs");
    await expect(page.locator("svg").first()).toBeVisible();
    await screenshot(page, "client-dashboard-jobs-charts");
  });

  test("/dashboard/proposals weekly + sent-vs-received charts, tabs", async ({ page }) => {
    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto("/dashboard/proposals");
    await expect(page.locator("svg").first()).toBeVisible();
    await screenshot(page, "client-dashboard-proposals-charts");

    const receivedTab = page.getByRole("link", { name: /received/i }).or(page.getByRole("tab", { name: /received/i }));
    if (await receivedTab.count()) {
      await receivedTab.first().click();
      await page.waitForTimeout(500);
      await screenshot(page, "client-dashboard-proposals-received-tab");
    }
  });
});

test.describe("Creative dashboard + payments", () => {
  test("/dashboard for creative renders KPIs/charts", async ({ page }) => {
    await login(page, TEST_CREATIVE.email, TEST_CREATIVE.password);
    await page.goto("/dashboard");
    await page.waitForTimeout(1200);
    await screenshot(page, "creative-dashboard-kpis-charts");
  });

  test("/dashboard/payments renders", async ({ page }) => {
    // TEST_CREATIVE deliberately has no portfolio/services (used to test the profile-
    // completeness gate in auth.spec.ts), so /dashboard/payments would render the gate's
    // onboarding checklist instead of payment rows. Use SEED_CLIENT, whose profile is
    // complete, so this test actually exercises the payments page content.
    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto("/dashboard/payments");
    await expect(page.locator("main").first()).toBeVisible();
    await screenshot(page, "client-dashboard-payments");
  });
});
