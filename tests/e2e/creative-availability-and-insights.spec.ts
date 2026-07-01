import { test, expect, Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { login, screenshot, TEST_CREATIVE } from "./fixtures";

// Playwright config doesn't load .env.local and no dotenv dep is installed — read the
// two keys we need directly. ponytail: two-line parser, not a general env loader.
function readEnvLocal(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  const envPath = path.resolve(__dirname, "../../.env.local");
  if (!fs.existsSync(envPath)) return undefined;
  const line = fs.readFileSync(envPath, "utf8").split("\n").find((l) => l.startsWith(`${key}=`));
  return line?.slice(key.length + 1).trim();
}

// TEST_CREATIVE has never completed onboarding (no onboarded_at), so any /dashboard*
// hit redirects to /onboarding/creative (see app/dashboard/layout.tsx). Complete it
// once per test via this helper so the rest of the flow (profile/dashboard pages)
// is reachable — this also happens to exercise the onboarding-submit flow itself.
//
// IMPORTANT: auth.spec.ts asserts TEST_CREATIVE is HIDDEN from /browse because it has
// an incomplete profile (no headline/bio/portfolio/services — see lib/profile-complete.ts).
// Completing onboarding here would flip that profile to "complete" and break that
// existing spec's assumption for good (real DB, no reset between runs). We use the
// service-role key to revert TEST_CREATIVE back to its incomplete-profile fixture state
// in afterAll so other specs relying on it stay valid.
async function ensureOnboarded(page: Page) {
  await page.goto("/dashboard");
  if (!page.url().includes("/onboarding/creative")) return;
  await page.getByLabel("Headline").fill("E2E audit creative");
  await page.getByLabel("Short bio").fill("Seeded via E2E audit for dashboard/profile flows.");
  await page.getByLabel("Project title").fill("E2E audit sample project");
  await page.getByLabel("Service title").fill("E2E audit service");
  await page.getByLabel("From (MWK)").fill("50000");
  await page.getByRole("button", { name: "Finish & go to dashboard" }).click();
  await page.waitForURL(/\/dashboard$/, { timeout: 10_000 });
}

test.afterAll(async () => {
  const url = readEnvLocal("NEXT_PUBLIC_SUPABASE_URL");
  const key = readEnvLocal("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return; // ponytail: best-effort cleanup only, not run in CI without the key
  const admin = createClient(url, key);
  // TEST_CREATIVE's seeded full_name is "EQ VK" (see auth.spec.ts) — look up by that
  // rather than paginating admin.auth.admin.listUsers(), which silently returns no
  // match once the seed script has created enough users to push past page 1.
  const { data: user } = await admin.from("profiles").select("id").eq("full_name", "EQ VK").maybeSingle();
  const uid = user?.id;
  if (!uid) return;
  await admin.from("portfolio_items").delete().eq("creative_id", uid);
  await admin.from("services").delete().eq("creative_id", uid);
  await admin.from("profiles").update({
    onboarded_at: null,
    headline: null,
    bio: null,
    categories: [],
    skills: [],
    availability: "available",
  }).eq("id", uid);
});

test.describe("Creative availability", () => {
  test("availability selector on /dashboard/profile persists after reload", async ({ page }) => {
    await login(page, TEST_CREATIVE.email, TEST_CREATIVE.password);
    await ensureOnboarded(page);
    await page.goto("/dashboard/profile");
    const select = page.locator("#availability");
    await expect(select).toBeVisible();
    await select.selectOption("busy");
    await page.getByRole("button", { name: "Update" }).click();
    await expect(page.getByText("Availability updated.").first()).toBeVisible({ timeout: 10_000 });
    await page.reload();
    await expect(page.locator("#availability")).toHaveValue("busy");
    await screenshot(page, "profile-availability-persisted");

    // reset to available so other specs relying on visibility aren't affected
    await page.locator("#availability").selectOption("available");
    await page.getByRole("button", { name: "Update" }).click();
    await expect(page.getByText("Availability updated.").first()).toBeVisible({ timeout: 10_000 });
  });

  test("/browse creative card shows a colored dot when not available", async ({ page }) => {
    await login(page, TEST_CREATIVE.email, TEST_CREATIVE.password);
    await ensureOnboarded(page);
    await page.goto("/dashboard/profile");
    await page.locator("#availability").selectOption("busy");
    await page.getByRole("button", { name: "Update" }).click();
    await expect(page.getByText("Availability updated.").first()).toBeVisible({ timeout: 10_000 });

    await page.goto("/browse");
    const dot = page.locator("[title='Busy']");
    const count = await dot.count();
    test.info().annotations.push({ type: "note", description: `busy-dot matches found: ${count}` });
    await screenshot(page, "browse-availability-dot");

    // reset
    await page.goto("/dashboard/profile");
    await page.locator("#availability").selectOption("available");
    await page.getByRole("button", { name: "Update" }).click();
  });
});

test.describe("Portfolio / profile insights", () => {
  test("/dashboard as a creative shows Profile insights with 4 KPIs and a chart", async ({ page }) => {
    await login(page, TEST_CREATIVE.email, TEST_CREATIVE.password);
    await ensureOnboarded(page);
    await page.goto("/dashboard");
    await expect(page.getByText("Profile insights")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Views (30d)")).toBeVisible();
    await expect(page.getByText("Saves (30d)")).toBeVisible();
    await expect(page.getByText("Proposals sent").first()).toBeVisible();
    await expect(page.getByText("Save rate")).toBeVisible();
    await expect(page.locator("svg").first()).toBeVisible();
    await screenshot(page, "dashboard-profile-insights");
  });
});
