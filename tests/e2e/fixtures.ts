import { Page, expect } from "@playwright/test";

// Seed / dedicated test accounts. Passwords were reset via the Supabase service-role
// key specifically for this audit run (see audit-report.md "Test accounts" section).
export const ADMIN = {
  email: "client.mphatso.banda.mqzvuwtc@seed.ganyu.local",
  password: "SeedAdmin123!",
};
export const SEED_CLIENT = {
  email: "client.towera.chirwa.mqzvuwtc@seed.ganyu.local",
  password: "SeedTest123!",
};
export const TEST_CREATIVE = {
  email: "creative@test.com",
  password: "SeedTest123!",
};

export async function login(page: Page, email: string, password: string) {
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
