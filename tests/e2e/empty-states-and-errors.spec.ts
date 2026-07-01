import { test, expect } from "@playwright/test";
import { login, uniqueEmail, screenshot, SEED_CLIENT } from "./fixtures";

test.describe("Empty states", () => {
  test("/browse with an unmatched query shows EmptyState + Clear filters", async ({ page }) => {
    await page.goto("/browse?q=zzzzznonexistentquery9999");
    await expect(page.getByText("No creatives match these filters.")).toBeVisible();
    const clear = page.getByRole("link", { name: "Clear filters" });
    await expect(clear).toBeVisible();
    await screenshot(page, "browse-empty-state");
  });

  test("/jobs with an unmatched query shows EmptyState + Clear filters", async ({ page }) => {
    await page.goto("/jobs?q=zzzzznonexistentquery9999");
    await expect(page.getByText("No jobs match these filters.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Clear filters" })).toBeVisible();
    await screenshot(page, "jobs-empty-state");
  });
});

test.describe("404 page", () => {
  test("hitting an unknown route renders the custom not-found page", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Nothing here." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
    await screenshot(page, "404-page");
  });
});

test.describe("Signup with already-used email", () => {
  test("shows an error banner instead of silently succeeding", async ({ page }) => {
    // Reuse a known-existing seed account's email — signUp should redirect back to
    // /signup?error=... rather than silently creating/logging in.
    await page.goto("/signup?role=client");
    await page.getByLabel("Full name").fill("Duplicate Email Test");
    await page.getByLabel("Email").fill(SEED_CLIENT.email);
    await page.getByLabel("Password").fill("TestPass123!");
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL(/\/signup\?error=/, { timeout: 10_000 });
    await expect(page.locator("p.text-red-700")).toBeVisible();
    await screenshot(page, "signup-duplicate-email-error");
  });
});
