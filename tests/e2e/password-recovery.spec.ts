import { test, expect } from "@playwright/test";
import { screenshot } from "./fixtures";

// NOTE: There is no "forgot password" request link anywhere in the app (no link on
// /login, no resetPasswordForEmail call in app/actions.ts) — the /reset-password page
// is only reachable via the recovery-link callback (app/auth/callback/route.ts). Per
// the task, we skip the request-from-/login step (it doesn't exist) and verify the
// page itself renders correctly when hit directly, as a stand-in for "valid token" load.
test.describe("Password recovery page", () => {
  test("/reset-password renders form with password + confirm fields", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByRole("heading", { name: "Set a new password" })).toBeVisible();
    await expect(page.getByLabel("New password")).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Update password" })).toBeVisible();
    await screenshot(page, "reset-password-form");
  });

  test("mismatched passwords shows inline error, not a silent failure", async ({ page }) => {
    await page.goto("/reset-password");
    await page.getByLabel("New password").fill("NewPass123!");
    await page.getByLabel("Confirm password").fill("Different123!");
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByText("Passwords don't match.")).toBeVisible();
  });
});
