import { test, expect } from "@playwright/test";
import { login, screenshot, ADMIN } from "./fixtures";

test.describe("Admin", () => {
  test("admin login and /admin renders charts", async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
    await expect(page.getByText("Signups · last 30 days")).toBeVisible();
    await expect(page.getByText("Jobs by status")).toBeVisible();
    await expect(page.getByText("Jobs by category")).toBeVisible();
    await screenshot(page, "admin-dashboard-charts");

    // hover a chart bar to check tooltip appears (recharts renders svg rects)
    const bar = page.locator("svg rect").first();
    if (await bar.count()) {
      await bar.hover();
      await page.waitForTimeout(300);
      await screenshot(page, "admin-chart-tooltip-hover");
    }
  });

  test("resolve a dispute as completed", async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto("/admin");
    const resolveBtn = page.getByRole("button", { name: "Resolve as completed" }).first();
    if (await resolveBtn.count()) {
      await resolveBtn.click();
      await page.waitForTimeout(1000);
      await screenshot(page, "admin-dispute-resolved");
    } else {
      test.skip(true, "No active disputes to resolve at time of test run");
    }
  });

  test("hide and unhide a job", async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto("/admin");
    const hideBtn = page.getByRole("button", { name: "Hide" }).first();
    await expect(hideBtn).toBeVisible({ timeout: 10_000 });
    await hideBtn.click();
    await page.waitForTimeout(800);
    await expect(page.getByText("hidden").first()).toBeVisible();
    await screenshot(page, "admin-job-hidden");

    const unhideBtn = page.getByRole("button", { name: "Unhide" }).first();
    await unhideBtn.click();
    await page.waitForTimeout(800);
    await screenshot(page, "admin-job-unhidden");
  });
});
