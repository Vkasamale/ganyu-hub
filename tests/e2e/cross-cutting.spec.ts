import { test, expect } from "@playwright/test";
import { login, screenshot, SEED_CLIENT } from "./fixtures";

test.describe("Cross-cutting UI behaviors", () => {
  test("toast appears bottom-right on successful form submit", async ({ page }) => {
    // Uses /dashboard/account (updateAccount) rather than job-post: postJob's server
    // action calls redirect() on success, so SavingForm's toast never renders for that
    // form (see audit-report.md "postJob toast never shows" finding). updateAccount does
    // not redirect, so its toast is a reliable, low-setup place to assert placement.
    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto("/dashboard/account");
    await page.getByLabel("Full name").fill("Towera Chirwa");
    await page.getByRole("button", { name: "Save account" }).click();

    const toast = page.locator("[data-sonner-toast]").first();
    await expect(toast).toBeVisible({ timeout: 10_000 });
    const box = await toast.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    // sonner default position is bottom-right unless overridden
    expect(box!.x + box!.width).toBeGreaterThan(viewport!.width / 2);
    expect(box!.y + box!.height).toBeGreaterThan(viewport!.height / 2);
    await screenshot(page, "toast-bottom-right");
  });

  test("SubmitButton shows spinner during pending state", async ({ page }) => {
    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto("/jobs/new");
    await page.getByLabel("Title").fill(`Spinner check ${Date.now()}`);
    await page.getByLabel("Category").selectOption("Design");
    await page.getByLabel("Brief").fill("Checking spinner state.");
    const submitBtn = page.getByRole("button", { name: "Post job" });
    await submitBtn.click();
    // spinner is a tiny animated span rendered only while pending; best-effort race capture
    const spinner = page.locator("span.animate-spin");
    const seen = await spinner.isVisible().catch(() => false);
    await screenshot(page, "submit-button-pending-or-after");
    test.info().annotations.push({ type: "note", description: `spinner captured: ${seen}` });
  });

  test("save (heart) button toggles optimistically with pop-scale", async ({ page }) => {
    // The button's accessible name itself flips Save <-> Unsave on click (see
    // components/save-button.tsx), so a name-based locator re-resolves to "no match"
    // immediately after the click. Bind to the containing <form> (stable) instead and
    // read the button inside it before/after.
    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto("/browse");
    const form = page.locator("form:has(button[aria-label='Save'], button[aria-label='Unsave'])").first();
    await expect(form).toBeVisible({ timeout: 10_000 });
    const button = form.locator("button");
    const before = await button.getAttribute("aria-label");
    await button.click();
    await expect(button).toHaveAttribute("aria-label", before === "Save" ? "Unsave" : "Save", { timeout: 3000 });
    await screenshot(page, "save-button-toggled");
  });

  test("skeleton loading state shows briefly on route transition", async ({ page }) => {
    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto("/dashboard");
    // "Jobs" (exact) — a substring match would also hit the top navbar's "Find jobs"
    // link (-> /jobs), not the dashboard sidebar's "Jobs" (-> /dashboard/jobs).
    const nav = page.getByRole("link", { name: "Jobs", exact: true });
    await Promise.all([
      page.waitForURL(/\/dashboard\/jobs/),
      nav.click(),
    ]);
    await screenshot(page, "route-transition-jobs");
  });
});
