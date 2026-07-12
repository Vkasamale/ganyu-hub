import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { login, screenshot, SEED_CLIENT, TEST_CREATIVE } from "./fixtures";

// Service-role client for SQL fixture setup/cleanup (mirrors TEST_LOG.md snippets).
function loadEnv() {
  try {
    const txt = readFileSync(resolve(__dirname, "../../.env.local"), "utf8");
    for (const l of txt.split(/\r?\n/)) {
      const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}
loadEnv();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CLIENT_ID = "110cdddd-a473-4e1a-a681-924b34ece9be";
const CREATIVE_ID = "ceb20bc6-30d2-4ac4-adc8-c9f4d4d50006";

test.describe.configure({ mode: "serial" });

test.describe("Session 1: 3-attempts proposal cap", () => {
  const jobTitle = `E2E Cap Job ${Date.now()}`;
  let jobUrl = "";

  test.afterAll(async () => {
    await sb.from("proposals").delete().eq("cover_letter", "cap-test attempt");
    if (jobUrl) {
      const id = jobUrl.split("/").pop();
      await sb.from("proposals").delete().eq("job_id", id);
      await sb.from("jobs").delete().eq("id", id);
    }
  });

  test("reapply after rejection, cap at 3, one-active-proposal guard", async ({ page }) => {
    // BUG (confirmed live 2026-07-12): proposals.status enum has no "rejected" value
    // (only 'pending'|'accepted'|'declined'|'withdrawn' — supabase/schema.sql:148).
    // submitProposal's cap check (app/actions.ts:630) and the job page's reapply
    // banner (app/jobs/[id]/page.tsx:66) both filter on status === "rejected", which
    // never matches a real declined row. The cap never triggers. Flip to test.fail()
    // -> test.fixme() once app/actions.ts:630 and app/jobs/[id]/page.tsx:66,465 are
    // fixed to check "declined" instead.
    test.fail();
    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto("/jobs/new");
    await page.getByLabel("Title").fill(jobTitle);
    await page.getByLabel("Category").selectOption("Design");
    await page.getByLabel("Brief").fill("Session 1 cap test job. This is a filler brief written purely to satisfy the 200-character minimum required by the job posting form so this automated E2E test can proceed past validation and reach the created job detail page for cap testing.");
    await page.getByLabel("Budget (MWK)").fill("100000");
    await page.getByLabel("Deliverables (min 50 characters)").fill("Final files delivered in the agreed format, source files included, one revision round covered by this test job.");
    await page.getByRole("button", { name: "Post job" }).click();
    await page.waitForURL(/\/jobs\/[0-9a-f-]+$/, { timeout: 10_000 });
    jobUrl = page.url();
    const jobId = jobUrl.split("/").pop()!;

    for (let attempt = 1; attempt <= 3; attempt++) {
      await login(page, TEST_CREATIVE.email, TEST_CREATIVE.password);
      await page.goto(jobUrl);
      if (attempt > 1) {
        await expect(page.getByText(new RegExp(`attempt ${attempt} of 3`, "i"))).toBeVisible({ timeout: 3_000 });
      }
      await page.getByLabel("Cover letter").fill("cap-test attempt");
      await page.getByLabel("Your bid (MWK)").fill("50000");
      await page.getByRole("button", { name: "Submit proposal" }).click();
      await expect(page.getByText(/You have sent a proposal/i)).toBeVisible({ timeout: 10_000 });

      // One-active-proposal guard: re-navigating while pending shouldn't show the form.
      await page.goto(jobUrl);
      await expect(page.getByLabel("Cover letter")).toHaveCount(0);

      // Client rejects it via SQL (no reject UI found in a quick scan; reuse DB write
      // the same way the app's own reject action would — status flip only).
      // NOTE: the proposals.status enum is ('pending','accepted','declined','withdrawn') —
      // there is no 'rejected' value (see supabase/schema.sql:148). declineProposal
      // correctly writes 'declined' (app/actions.ts:702), but submitProposal's cap
      // check and the job page's banner both filter on status === "rejected"
      // (app/actions.ts:630, app/jobs/[id]/page.tsx:66), which never matches. This
      // is a real bug: the 3-attempt cap never triggers in production.
      await sb.from("proposals").update({ status: "declined" }).eq("job_id", jobId).eq("creative_id", CREATIVE_ID).eq("status", "pending");
    }

    await page.goto(jobUrl);
    await expect(page.getByText(/Only a direct invite from the client can reopen it/i)).toBeVisible({ timeout: 3_000 });
    await screenshot(page, "session1-cap-blocked-card");

    // Client-side view unchanged: all 3 rejected proposals visible.
    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto(`/dashboard/proposals?tab=received`);
    await screenshot(page, "session1-client-proposals-view");
  });
});

test.describe("Session 2: direct invites", () => {
  const jobTitle = `E2E Invite Job ${Date.now()}`;
  let jobId = "";
  let jobUrl = "";

  test.afterAll(async () => {
    await sb.from("proposals").delete().eq("cover_letter", "test");
    await sb.from("job_invites").delete().ilike("message", "%test%");
    if (jobId) {
      await sb.from("proposals").delete().eq("job_id", jobId);
      await sb.from("job_invites").delete().eq("job_id", jobId);
      await sb.from("jobs").delete().eq("id", jobId);
    }
  });

  test("send invite, creative receives, banner, duplicate blocked", async ({ page }) => {
    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto("/jobs/new");
    await page.getByLabel("Title").fill(jobTitle);
    await page.getByLabel("Category").selectOption("Design");
    await page.getByLabel("Brief").fill("Session 2 invite test job. This is a filler brief written purely to satisfy the 200-character minimum required by the job posting form so this automated E2E test can proceed past validation and reach the created job detail page for invite testing.");
    await page.getByLabel("Budget (MWK)").fill("100000");
    await page.getByLabel("Deliverables (min 50 characters)").fill("Final files delivered in the agreed format, source files included, one revision round covered by this test job.");
    await page.getByRole("button", { name: "Post job" }).click();
    await page.waitForURL(/\/jobs\/[0-9a-f-]+$/, { timeout: 10_000 });
    jobUrl = page.url();
    jobId = jobUrl.split("/").pop()!;

    // Send invite from client's side (find the creative's public profile via API/DB, navigate directly).
    const { data: creativeProfile } = await sb.from("profiles").select("id").eq("id", CREATIVE_ID).maybeSingle();
    expect(creativeProfile).toBeTruthy();
    await page.goto(`/creatives/${CREATIVE_ID}`);
    const inviteSummary = page.locator("summary", { hasText: "Invite to job" });
    await expect(inviteSummary).toBeVisible({ timeout: 10_000 });
    await inviteSummary.click();
    await screenshot(page, "session2-invite-dropdown");
    const select = page.locator("select#job_id");
    await select.selectOption({ label: jobTitle });
    const sendBtn = page.getByRole("button", { name: /send invite/i });
    await sendBtn.click();
    await expect(page.getByText(/Invite sent/i).first()).toBeVisible({ timeout: 10_000 });

    // Retry: previously-invited job shows "(already invited)".
    await page.goto(`/creatives/${CREATIVE_ID}`);
    await page.locator("summary", { hasText: "Invite to job" }).click();
    await expect(page.locator("option", { hasText: "(already invited)" })).toHaveCount(1, { timeout: 5000 });
    await screenshot(page, "session2-already-invited");

    // Creative receives: bell notification + banner on job page.
    await login(page, TEST_CREATIVE.email, TEST_CREATIVE.password);
    await page.goto("/dashboard");
    const bell = page.getByRole("button", { name: /notifications/i }).first();
    if (await bell.count()) {
      await bell.click();
      await expect(page.getByText(/invited to a job/i).first()).toBeVisible({ timeout: 10_000 });
    }
    await page.goto(jobUrl);
    await expect(page.getByText(/You've been invited/i)).toBeVisible({ timeout: 10_000 });
    await screenshot(page, "session2-invite-banner");

    // Cap bypass: with invite, form is shown and submit works.
    await expect(page.getByLabel("Cover letter")).toBeVisible({ timeout: 5000 });
    await page.getByLabel("Cover letter").fill("test");
    await page.getByLabel("Your bid (MWK)").fill("30000");
    await page.getByRole("button", { name: "Submit proposal" }).click();
    await expect(page.getByText(/You have sent a proposal/i)).toBeVisible({ timeout: 10_000 });
    await screenshot(page, "session2-invited-proposal-submitted");
  });
});

test.describe("Session 3a: top-up requests, decline, auto-cancel", () => {
  test.describe.configure({ mode: "serial" });
  const jobTitle = `E2E Topup Job ${Date.now()}`;
  let jobUrl = "";
  let jobId = "";

  test.afterAll(async () => {
    if (jobId) {
      await sb.from("payment_topups").delete().eq("job_id", jobId);
      await sb.from("proposals").delete().eq("job_id", jobId);
      await sb.from("jobs").delete().eq("id", jobId);
    }
  });

  test("drive a job to in_progress with fixture creative accepted", async ({ page }) => {
    test.setTimeout(60_000);
    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto("/jobs/new");
    await page.getByLabel("Title").fill(jobTitle);
    await page.getByLabel("Category").selectOption("Design");
    await page.getByLabel("Brief").fill("Session 3a top-up test job. This is a filler brief written purely to satisfy the 200-character minimum required by the job posting form so this automated E2E test can proceed past validation and reach the created job detail page for top-up testing.");
    await page.getByLabel("Budget (MWK)").fill("100000");
    await page.getByLabel("Deliverables (min 50 characters)").fill("Final files delivered in the agreed format, source files included, one revision round covered by this test job.");
    await page.getByRole("button", { name: "Post job" }).click();
    await page.waitForURL(/\/jobs\/[0-9a-f-]+$/, { timeout: 10_000 });
    jobUrl = page.url();
    jobId = jobUrl.split("/").pop()!;

    await login(page, TEST_CREATIVE.email, TEST_CREATIVE.password);
    await page.goto(jobUrl);
    await page.getByLabel("Cover letter").fill("Proposal for top-up test job.");
    await page.getByLabel("Your bid (MWK)").fill("90000");
    await page.getByRole("button", { name: "Submit proposal" }).click();
    await expect(page.getByText(/You have sent a proposal/i)).toBeVisible({ timeout: 10_000 });

    // Accepting now requires funding escrow via PayChangu first ("payment-first
    // acceptance", commit c877106) before the proposal actually wins — that's a
    // separate, already-shipped flow, not what Session 3a is testing. Drive the
    // job straight to in_progress + accepted proposal via SQL so we can exercise
    // the top-up feature itself, same as the SQL fixtures TEST_LOG.md already uses
    // for other sessions.
    await sb.from("proposals").update({ status: "accepted" }).eq("job_id", jobId).eq("creative_id", CREATIVE_ID);
    await sb.from("jobs").update({
      status: "in_progress",
      accepted_bid_mwk: 90000,
      total_paid_mwk: 90000,
      escrow_status: "payment_held",
    }).eq("id", jobId);

    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto(jobUrl);
    await screenshot(page, "session3a-job-status-in-progress");

    const { data: job } = await sb.from("jobs").select("status").eq("id", jobId).maybeSingle();
    expect(job?.status).toBe("in_progress");
  });

  test("request a top-up, one-pending guard, withdraw", async ({ page }) => {
    test.skip(!jobId, "prior test did not produce an in_progress job");
    await login(page, TEST_CREATIVE.email, TEST_CREATIVE.password);
    await page.goto(jobUrl);
    await expect(page.getByRole("heading", { name: "Payment top-ups" })).toBeVisible({ timeout: 10_000 });
    await page.getByLabel("Extra amount (MWK)").fill("15000");
    await page.getByLabel("Why the extra?").fill("Client asked for two extra revisions beyond the original scope.");
    await page.getByRole("button", { name: "Request top-up" }).click();
    await expect(page.getByText(/Pending: MWK 15,000/i)).toBeVisible({ timeout: 10_000 });
    await screenshot(page, "session3a-topup-pending");

    // One-pending guard: the request form should be gone while one is pending.
    await expect(page.getByLabel("Extra amount (MWK)")).toHaveCount(0);

    const { data: rows } = await sb.from("payment_topups").select("id,status").eq("job_id", jobId);
    expect(rows?.length).toBe(1);
    expect(rows?.[0].status).toBe("pending");

    // Withdraw.
    await page.getByRole("button", { name: "Withdraw request" }).click();
    await page.waitForTimeout(1000);
    const { data: afterWithdraw } = await sb.from("payment_topups").select("status").eq("id", rows![0].id).maybeSingle();
    expect(afterWithdraw?.status).toBe("cancelled");
    await screenshot(page, "session3a-topup-withdrawn");
  });

  test("request again, client declines", async ({ page }) => {
    test.skip(!jobId, "prior test did not produce an in_progress job");
    await login(page, TEST_CREATIVE.email, TEST_CREATIVE.password);
    await page.goto(jobUrl);
    await page.getByLabel("Extra amount (MWK)").fill("20000");
    await page.getByLabel("Why the extra?").fill("Second round of top-up testing needs its own pending row.");
    await page.getByRole("button", { name: "Request top-up" }).click();
    await expect(page.getByText(/Pending: MWK 20,000/i)).toBeVisible({ timeout: 10_000 });

    await login(page, SEED_CLIENT.email, SEED_CLIENT.password);
    await page.goto(jobUrl);
    await expect(page.getByText(/Pending: MWK 20,000/i)).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Decline" }).click();
    await page.waitForTimeout(1000);
    const { data: declined } = await sb.from("payment_topups").select("status").eq("job_id", jobId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    expect(declined?.status).toBe("declined");
    await screenshot(page, "session3a-topup-declined");
  });

  test("cancellation request auto-cancels a pending top-up", async ({ page }) => {
    test.skip(!jobId, "prior test did not produce an in_progress job");
    await login(page, TEST_CREATIVE.email, TEST_CREATIVE.password);
    await page.goto(jobUrl);
    await page.getByLabel("Extra amount (MWK)").fill("5000");
    await page.getByLabel("Why the extra?").fill("Third top-up request, this one gets auto-cancelled by cancellation.");
    await page.getByRole("button", { name: "Request top-up" }).click();
    await expect(page.getByText(/Pending: MWK 5,000/i)).toBeVisible({ timeout: 10_000 });

    const cancelBtn = page.getByRole("button", { name: "Cancel job" });
    await expect(cancelBtn).toBeVisible({ timeout: 10_000 });
    await cancelBtn.click();
    await page.getByPlaceholder(/why/i).or(page.locator("textarea").last()).fill(
      "E2E audit: testing top-up auto-cancel on cancellation request, needs 30+ characters."
    );
    await page.getByRole("button", { name: "Request cancellation" }).click();
    await page.waitForTimeout(1500);

    const { data: row } = await sb.from("payment_topups").select("status").eq("job_id", jobId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    expect(row?.status).toBe("cancelled");
    await screenshot(page, "session3a-topup-auto-cancelled-on-cancellation");
  });
});
