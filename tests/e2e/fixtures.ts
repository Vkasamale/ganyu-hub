import { Page, expect } from "@playwright/test";

// Stable fixture accounts minted by scripts/seed.mjs (STABLE_FIXTURES). Fixed
// emails + password, no batch suffix, recreated identically on every reseed —
// so these never drift. Keep in sync with STABLE_FIXTURES / FIXTURE_PASSWORD.
const FIXTURE_PASSWORD = "GanyuFixture!2026";
export const ADMIN = {
  email: "fixture-admin@ganyuhub.test",
  password: FIXTURE_PASSWORD,
};
export const SEED_CLIENT = {
  email: "fixture-client@ganyuhub.test",
  password: FIXTURE_PASSWORD,
};
export const TEST_CREATIVE = {
  email: "fixture-creative@ganyuhub.test",
  password: FIXTURE_PASSWORD,
};

export async function login(page: Page, email: string, password: string) {
  // Clear any prior session first: middleware bounces /login → /dashboard for
  // an already-authed user, causing the wrong account to persist across
  // login() calls (fixture-client posts a job, but /dashboard renders for
  // whoever was in the cookie jar). Kill Supabase cookies before every login.
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.locator('form button[type="submit"]', { hasText: "Log in" }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
}

export function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@e2e.ganyu.local`;
}

export async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}
