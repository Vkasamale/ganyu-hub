import { test, expect } from "@playwright/test";
import { login, uniqueEmail, screenshot, SEED_CLIENT } from "./fixtures";

test.describe("Auth", () => {
  test("signup as client redirects to /dashboard", async ({ page }) => {
    await page.goto("/signup?role=client");
    await expect(page.locator('input[name="role"][value="client"]')).toBeChecked();
    await page.getByLabel("Full name").fill("E2E Client");
    await page.getByLabel("Email").fill(uniqueEmail("e2e-client"));
    await page.getByLabel("Password").fill("TestPass123!");
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
    await screenshot(page, "signup-client-dashboard");
  });

  test("signup as creative redirects to /dashboard", async ({ page }) => {
    await page.goto("/signup?role=creative");
    await expect(page.locator('input[name="role"][value="creative"]')).toBeChecked();
    await page.getByLabel("Full name").fill("E2E Creative");
    await page.getByLabel("Email").fill(uniqueEmail("e2e-creative"));
    await page.getByLabel("Password").fill("TestPass123!");
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
    await screenshot(page, "signup-creative-dashboard");
  });

  test("login with seeded client works", async ({ page }) => {
    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await expect(page).toHaveURL(/\/dashboard/);
    await screenshot(page, "login-seed-client-dashboard");
  });

  test("incomplete profile is hidden from /browse", async ({ page }) => {
    // TEST_CREATIVE (creative@test.com) has no portfolio/services seeded per profile-complete gate.
    await page.goto("/browse");
    await expect(page.getByText("EQ VK")).toHaveCount(0);
  });
});
