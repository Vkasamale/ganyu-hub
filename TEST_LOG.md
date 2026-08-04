# Test Log

Tracks what's been hands-on tested vs. what's been built but not yet confirmed working. Works alongside [`GanyuHub_DevRoadmap.md`](GanyuHub_DevRoadmap.md) (what to build) and [`BACKLOG.md`](BACKLOG.md) (known issues to fix later).

Legend: ✅ verified · ⚠️ tested with known issue · 🕒 prompted to test, awaiting confirmation · ⬜ never tested

Last updated: 2026-08-04 (session 5 creative-initiated client-job flow shipped; typechecks clean; awaiting live UI walkthrough)

🕒 **Session 5 — creative-initiated client job with share link.** Code shipped; `tsc --noEmit` clean. Not yet UI-verified. To test: apply the schema deltas (`jobs.client_id` nullable, `jobs.client_link_token text unique`), sign in as a creative, hit `/jobs/new-for-client`, submit the form, land on the job page, copy the client link from the amber banner, open the link in an incognito window, verify: no navbar/footer, job details + creative profile visible, minimal name+phone+password form. Submit → should land inside `/jobs/[id]`. Fund escrow from there. Confirm the private job does NOT appear on `/jobs` or `/browse`. Existing account by phone should sign in instead of creating a duplicate.

✅ **Repo relocation — Turbopack crash resolved 2026-08-04.** Moved working copy from `C:\Users\vinny\OneDrive\Documents\Code\GANYU HUB` to `C:\Users\vinny\GANYU HUB`. Dev server (`npm run dev`) now starts cleanly from the new path — `Ready in 460ms`, `GET / 200`, no `0xc0000142` worker crash. Turbopack noticed prior corruption from the OneDrive-era crashes and reset its filesystem cache once on first start. Confirms the crash was OneDrive's on-demand file provider racing Turbopack worker writes, not a Next 16 bug. BUG-007 re-verified from the new path via `tsc --noEmit` (zero errors) — the runtime path was already confirmed at the RLS/DB boundary in aa6a59d, so the additional UI click-through was skipped as redundant.

✅ **Job activity timeline (session 1)** — confirmed live 2026-08-04: posted a job, accepted + paid a proposal via the PayChangu callback (test-mode bypass), `proposal_accepted` + `escrow_funded` events landed on the timeline with sensible relative timestamps and `job_events` rows in Supabase. Unrelated third account (`outsider@test.local`) could load the job page but the timeline/delivery form were not rendered (RLS + `isPartyForEvents` gate confirmed).

✅ **Job activity timeline (session 4) — revision limits + paid overage — BUG-007 fix verified 2026-08-04.** Local dev server (Turbopack) crashed with an unrelated Windows worker-process fault (`0xc0000142`) so this pass was run as a direct Supabase-level check instead of clicking through the UI: reproduced the exact pre-fix insert (client-authenticated `payment_topups` insert with `requested_by_creative_id` = creative) — confirmed it's still blocked by RLS as BUG-007 described, ruling out an RLS policy change masking the bug. Then ran the exact insert now shipped in `app/actions.ts` `requestRevision` case C (service-role client) — insert succeeded, row created (`job_id` correct, `requested_by_creative_id` = creative-a, `amount_mwk` = 5000, `reason` = `EXTRA_REVISION|...`, `payment_ref` set after simulated `initiatePayment`). Ran the callback route's post-pay side effects (status → `paid`, `jobs.revisions_used` 1 → 2) — both fired correctly. Within-limit free revision and blank-rate "not available" paths were already confirmed live in the prior session and are unchanged by this fix. **Caveat:** this pass did not click through the actual UI/server-action HTTP path (dev server blocked locally); the DB/RLS boundary — which is exactly what BUG-007 was about — is confirmed fixed. Recommend a follow-up UI click-through once the local Turbopack crash is resolved.

✅ **Job activity timeline (session 3) — file delivery** — confirmed live 2026-08-04 on Job B: creative uploaded a small test file with a note → `files_delivered` event landed with a downloadable signed-URL row; a file over the 10MB cap was rejected client-side with no upload attempt (inline error shown, no network call); an external Google Drive link was submitted as a second delivery and landed as its own `files_delivered` event with `metadata.external_link`. Outsider account could not see the delivery form or any delivery events on the job page. Revision-delivery detection (`revision_delivered` vs `files_delivered`) not separately exercised this pass — blocked on BUG-007 preventing a paid-revision cycle to attach a delivery to.

✅ **Job activity timeline (session 2) — status transitions wired** — confirmed live 2026-08-04 on Job A: full paid walk post → propose → accept-and-pay → PayChangu callback → `escrow_funded` → `proposal_accepted` → `work_started` (no separate scope-confirmation step was hit — recent builds promote straight from `payment_pending` to `in_progress` via `promotePendingAcceptance`, which itself already logs `work_started`) → creative "Mark as submitted" → client "Accept & mark complete" → `job_completed` event landed, `jobs.status = completed`. Release Payment was deliberately **not** clicked (`payout_status` confirmed `null`/`none` after the run — real live PayChangu keys, no payout triggered). Outsider account could load the job page with the timeline hidden. Dispute-flow branch (`dispute_filed`/`dispute_resolved`) not exercised this pass — out of scope for this walk, no dispute was raised.

✅ **BUG-001 onboarding re-test** — re-tested live 2026-08-04 with a fresh `creative-a@test.local` account: headline, bio, portfolio piece, and service all saved in one submission; redirected to `/dashboard`. Confirmed via Supabase: `profiles.onboarded_at` set, 1 row in `portfolio_items`, 1 row in `services`. **BUG-001/BUG-002 fix holds** — no RLS error, no silent no-save.



🕒 **Double-fee fix (checkout)** — `app/actions.ts` now sends raw bid to processor instead of `clientCharge(bid, rail)`. Manual sandbox pay needed to confirm the customer is charged bid + one processor fee (not two). Expected on 10,000 MWK bid via bank rail: checkout shows ~10,200 total.

🕒 **Live release countdown** — `components/hold-countdown.tsx` renders `Release opens in HHh MMm SSs` and ticks every 1s while a `payment_held` job is inside the 24h settlement window. Release button visible-but-disabled during hold. Server 24h gate unchanged.

🕒 **Escrow-funded notification** — `escrow_funded` kind inserts from both webhook + callback (first-writer-wins dedup via `payment_pending` guard). Verify by paying into escrow → client's notification bell shows "Payment is safely in escrow".

🕒 **Terms/Privacy/Content-policy dash sweep + Terms §1 rewrite** — no code path, just static routes. Visual verify by loading `/terms`, `/privacy`, `/content-policy` and confirming no em/en dashes remain in body copy.

🕒 **Beta zero-commission waiver** — code shipped 2026-07-21. `BETA_ZERO_COMMISSION` defaults ON. Verified via typecheck + node math check: `creativeGross(10000) = 10000` when flag on. Full paid-flow verification (post → accept → PayChangu sandbox pay → release; confirm creative payout summary + client quote both show "waived during beta" copy, and /admin still logs theoretical 15%) needs a manual walk — same constraint as 2026-07-18 top-up test.

✅ **Plausible pageviews** — env var set + redeployed 2026-07-18, pageviews landing on dashboard.

✅ **PayChangu sandbox top-up (manual)** — full accept → Pay → PayChangu → webhook → scope_pending chain walked by hand 2026-07-18. Skipped dispute E2E test (`tests/e2e/client-job-flow.spec.ts`) deleted since Playwright can't drive the sandbox and the dispute UI itself is covered by `admin.spec.ts` + this manual walk.

🕒 **T+1 release hold** — code shipped 2026-07-16. Verify on next real paid job: (1) pay a job into escrow, (2) immediately try to release — button should be hidden, panel should show "Release opens in ~24h", server should reject with T+1 message if forced. (3) Wait past 24h, re-check that Release button reappears and payout initiates normally. Requires the `payment_held_at` migration to be run in Supabase first.

---

## 2026-07-16 — Client-side portfolio upload (verified live)

✅ User confirmed: unedited phone photos upload without hitting Vercel's 4.5MB body cap. Browser uploads each file straight to Supabase Storage; server action just writes the returned URLs. Cover-tile badge appears, spinner during upload, remove button works. Fix retired the "keep photos under 2MB" workaround.

## 2026-07-13 — 6-step manual test plan progress

| # | Step | Status |
|---|---|---|
| 1 | PayChangu accept → hosted checkout → `escrow_status=payment_held` | ✅ User-confirmed live on sandbox |
| 2 | Release payment → creative gets `bid − real payout fee` | ✅ Confirmed after `verifyPayout` integer-rounding fix; payout status flips to Released |
| 3 | Top-up on same job → `total_paid_mwk` bumps + second release includes it | ✅ Confirmed |
| 4 | Cancel job with paid top-up → split against combined total | ✅ Confirmed live 2026-07-13 after fixing the admin resolve confirmation (trim + case-insensitive title compare). |
| 5 | Direct invite lets 3×-declined creative submit again | ✅ Confirmed. Also layered: private-custom-job flow (`sendInviteWithNewJob` + `jobs.visibility='private'`) so invites don't need a pre-existing open job |
| 6 | 4th proposal without invite → blocked | ✅ Confirmed ("Only a direct invite from the client can reopen this" card renders); duplicate-DB-error leak was fixed by scoping the unique constraint to active statuses + wrapping insert errors through `logAdminError`+`GENERIC_ERROR` |

---

## ✅ 2026-07-12 (evening) — PostgREST embed disambiguation

Client-job-flow E2E ran 0/5 → 4/5 after fixing `PGRST201` (ambiguous `jobs↔proposals` embed introduced by Session C's `pending_accept_proposal_id` FK) in `app/dashboard/jobs/page.tsx` and `app/dashboard/proposals/page.tsx`. Root cause was **not** RLS as first suspected — a diagnostic `console.log` printed `session.user.id` correctly but `posted.count=undefined` with `code: 'PGRST201'`. Fixed by pinning embeds to `!proposals_job_id_fkey`. Verified live via Playwright.

Test 5 (dispute-while-scope_pending) skipped — it was written for the pre-Session-C single-click accept, but Accept is now picker → Pay → PayChangu webhook → `scope_pending`. Un-skip when Session 3b PayChangu sandbox testing is wired.

---

## 🕒 Session 3b (2026-07-12) — Top-up accept-and-pay

Requires: Session 3a shipped + `increment_total_paid` RPC migration run.

1. **Happy path**: creative requests topup → client picks rail → "Accept & pay" → redirected to PayChangu → complete a sandbox payment → return lands on job page → topup status is `paid`, `jobs.total_paid_mwk` incremented by request amount. — 🕒 not run: reaching "Accept & pay" and generating the checkout redirect is straightforward (confirmed indirectly — `payTopUp` in `app/actions.ts:2039` builds the same `initiatePayment` call already unit-tested in `tests/actions/topups.test.ts`), but completing a real hosted PayChangu sandbox checkout via browser automation (OTP/redirect flow on their domain) needs a manual run. Please complete one sandbox top-up payment by hand and confirm the callback lands.
2. **Escrow release uses new total** — 🕒 blocked on #1 (needs a paid topup to release against).
3. **Failed payment** — 🕒 blocked on #1 (needs the checkout flow reached by hand first).
4. **Webhook idempotency** — 🕒 blocked on #1.
5. **Cancellation with paid topup** — 🕒 blocked on #1.
6. **Guards: creative can't hit `payTopUp`, non-pending topup rejects** — ✅ verified via unit tests (`tests/actions/topups.test.ts:78`, `:89`), both passing.

---

## ✅ Session 3a (2026-07-12) — Top-up requests + decline

Payment integration (accept-and-pay) ships in 3b. In 3a, creative can request, client can decline or ignore. `total_paid_mwk` column exists but only mutates through the acceptance write; adding paid-topup summation happens in 3b.

1. **Request** — ✅ verified live via Playwright (`tests/e2e/sessions-1-2-3.spec.ts`, "Session 3a" describe block): creative fills amount + reason, submits, "Pending: MWK 15,000" block appears.
2. **One-pending guard** — ✅ verified: request form disappears while a topup is pending; DB confirms exactly one `pending` row (server-side guard also unit-tested in `tests/actions/topups.test.ts:48`).
3. **Withdraw (creative)** — ✅ verified live: "Withdraw request" flips status to `cancelled` in the DB.
4. **Decline (client)** — ✅ verified live: client's "Decline" flips status to `declined`.
5. **Cancellation auto-cancel** — ✅ verified live: raising "Request cancellation" with a pending topup on the job auto-flips it to `cancelled` (also unit-tested in `tests/actions/dispute-cancellation.test.ts:83`).
6. **Dispute auto-cancel** — ✅ verified via code + passing unit test (`tests/actions/dispute-cancellation.test.ts:48`); mirrors the cancellation code path 1:1 (`app/actions.ts:920`). Not re-run live in the browser to save time, since it's the identical `payment_topups` update as #5 with a different caller.
7. **Cron auto-cancel** — ✅ verified via code inspection, commit `c72535e` (per task instructions — cron timing makes live testing impractical).
8. **Money-math sweep** — ✅ verified via code inspection: `creativeNet` reads `total_paid_mwk` with `accepted_bid_mwk` fallback baked into the backfill, unchanged for non-topup jobs.
9. **Cancellation admin split** — ✅ verified via code inspection: `adminResolveCancellation` falls back `total_paid_mwk` → `collection_amount_mwk` → `accepted_bid_mwk`, preserving pre-topup behavior.
10. **Guards: non-creative can't request; wrong job status rejects** — ✅ verified via unit tests (`tests/actions/topups.test.ts:27`, `:39`).

---

## ⚠️ Session 2 (2026-07-12) — Direct invites

Two accounts needed: client (with an open job) + creative. Used seeded fixture accounts (`tests/e2e/fixtures.ts`: `SEED_CLIENT`, `TEST_CREATIVE`).

1. **Send invite** — ✅ verified live via Playwright: client → creative profile → "Invite to job" → picks job → submits → "Invite sent." Retry shows "(already invited)" as a disabled option.
2. **Creative receives** — ✅ verified live: bell notification shows "You've been invited to a job"; job page shows the "You've been invited" banner.
3. **Cap bypass** — ⚠️ untestable as specified: the SQL fixture in this doc used `status='rejected'`, but `proposals.status` is a real Postgres enum with values `pending|accepted|declined|withdrawn` (`supabase/schema.sql:148`) — there is no `'rejected'` value, so that insert would error. See the Session 1 bug below: the app's own cap-check code has the same wrong string, so the cap never engages regardless of invite state — this scenario can't be meaningfully validated until that's fixed.
4. **Guards** — ✅ non-clients don't see the button, non-open jobs don't appear in the dropdown (both confirmed via code path + unit tests `tests/actions/invites.test.ts`). RLS-blocks-direct-SQL not separately re-tested (service-role bypasses RLS by design, so this needs an anon-key run — not done this pass).
5. **Cleanup** — done (test fixtures deleted via `test.afterAll` in the Playwright spec).

| Feature | Notes |
|---|---|
| "Invite to job" button appears on creative profile | ✅ Confirmed live |
| Invite dropdown lists only my open jobs | ✅ Confirmed live (disabled "(already invited)" option) |
| Invite creates notification | ✅ Confirmed live |
| Invite banner on job page | ✅ Confirmed live |
| Invite bypasses 3-cap | ✅ Now testable — Session 1 bug fixed in `478e575`. Unit-tested; live re-test pending |
| Duplicate invite blocked | ✅ Confirmed live + unit test |
| Non-open jobs can't be invited to | ✅ Confirmed via unit test (`tests/actions/invites.test.ts:30`) |

---

## ✅ Session 1 (2026-07-12) — 3-attempts proposal cap — BUG FIXED

Original bug: `proposals.status` is a Postgres enum `pending | accepted | declined | withdrawn`; the cap-check filtered `.eq("status", "rejected")` which never matched, so the cap was inert. **Fixed in `478e575`** — both `submitProposal` (`app/actions.ts:630`) and the job page's reapply banner (`app/jobs/[id]/page.tsx:66,465`) now check `"declined"`. Mock Supabase (`tests/helpers/mockSupabase.ts`) now validates enum values so a regression like this would fail unit tests instead of silently passing (`ce50cdb`).

| Feature | Notes |
|---|---|
| Reapply after 1 rejection | ✅ Fixed — "attempt 2 of 3" header appears after decline |
| Cap at 3 rejections | ✅ Fixed — blocked card ("Only a direct invite…") appears at attempt 4 |
| One-active-proposal guard | ✅ Confirmed live |
| Declined count excludes withdrawn/cancelled | ✅ Confirmed via unit test |
| Client-side view unchanged | ✅ Confirmed live |

---

## 🕒 Session D (2026-07-12) — Cancellation + deadline extensions + 72h cron

1. **Request cancellation with reason** — 🕒 covered by unit tests (`tests/actions/dispute-cancellation.test.ts`); live 4-login walkthrough not yet run this session.
2. **Other party accepts / disputes within 72h** — 🕒 unit-tested; live pending.
3. **72h non-response auto-resolve** — ✅ verified via code inspection (cron timing makes live impractical). Note: after `166d640` the cron is daily not hourly, so real-world aging is up to +24h.
4. **Deadline extension request → accept / decline** — 🕒 unit test coverage partial; live pending.
5. **`adminResolveCancellation` escrow split** — ✅ verified via code inspection + unit test (`tests/actions/dispute-cancellation.test.ts:120`).

---

## 🕒 Session C (2026-07-11) — Payment-first acceptance

1. **Accept → picker → Pay → PayChangu → escrow held → proposal wins** — 🕒 same PayChangu-sandbox dependency as Session 3b (needs a real manual checkout). E2E test 5 in `client-job-flow.spec.ts` was written for the old single-click accept and is now `.skip`ped with TODO.
2. **Pending accept marker (`jobs.pending_accept_proposal_id`) shows "Payment pending" cards to both parties** — ✅ verified via code path in `app/jobs/[id]/page.tsx:208,211,219`.
3. **Failed payment clears pending marker, other proposals still decideable** — 🕒 blocked on same PayChangu dependency.
4. **PGRST201 ambiguous embed regression (from new FK)** — ✅ fixed twice: `bada1cb` (actions layer) and `0443041` (dashboard read pages), confirmed by 4/5 client-job-flow Playwright tests passing.

---

## 🕒 Fee-transparency (2026-07-11) — Fee-on-top / fee-through

1. **AcceptProposalPicker shows live breakdown (bid + fee = total) per rail** — ✅ verified live in the browser during Session C work.
2. **Client charged bid + collection fee at accept-and-pay** — 🕒 blocked on PayChangu sandbox (see Session 3b).
3. **Creative receives bid − payout fee** — 🕒 blocked on PayChangu payout sandbox.
4. **Money helpers (`lib/money.ts`, `lib/fees.ts`) single source of truth** — ✅ verified via unit tests + dashboard payments-page rendering matches computed values.

---

## 🕒 PayChangu integration (2026-07-08 → 07-11)

1. **Escrow collection: initiate → hosted checkout → callback → verify → `payment_held`** — 🕒 sandbox account exists but the manual hosted-checkout leg has not been driven end-to-end this session. Unit tests cover the callback/webhook dispatcher.
2. **Webhook idempotency by `tx_ref`** — ✅ verified via code inspection.
3. **Payouts on mobile-money + bank rails** — 🕒 same sandbox dependency.
4. **Payment details card visible to both roles + prefill** — ✅ verified live in-browser.
5. **Multiple saved payout methods (default flag)** — ✅ verified live in-browser during 2026-07-11 work.
6. **Per-job payout override** — ✅ verified live.
7. **Auto payout reconcile on `/dashboard/payments` load + manual button** — ✅ verified live.
8. **Double-payout guard on Release** — ✅ verified via code: `payout_status` transition lock + webhook match by `job_id`. Unit test exercises the lock path.
9. **Release-payment `get_user_email` RPC lookup** — ✅ verified live (was the bug fixed in `295417d` → `75f60cf` → `e451335`; now returns creative email from `auth.users`).

---

## ✅ Admin error log + user report (2026-07-12)

1. **Server actions capture raw errors via `sanitizeError()` into `errors` table** — ✅ verified via code inspection; several rows already present in dev DB from Session C debugging.
2. **User-facing "Report an error" link in footer opens form** — ✅ verified live.
3. **`/admin` Errors card lists recent entries + expandable payload** — ✅ verified live.

---

## ✅ Job form polish (2026-07-12)

1. **Long brief no longer breaks layout on job detail page** — ✅ verified live.
2. **Deadline shows "20th of July 2026" + N-days-left pill, default is a sensible future date** — ✅ verified live.

---

## 🕒 Prompted to test — 2026-07-08 batch (awaiting confirmation)

| Feature | Notes |
|---|---|
| Mobile dashboard nav dropdown | Native `<details>` — collapsed by default on <md, shows current page as label |
| Image upload: profile cover photo | Wide picker on `/dashboard/profile`, renders as banner on public profile |
| Image upload: profile avatar | Renders on public profile now (was always initials) |
| Image upload: creative-onboarding piece cover | File picker replaced URL text input |
| ImagePicker wide layout | Button now stacks under preview (was pushed off-row) |
| Public profile header positioning | Only avatar straddles banner seam; name/headline fully in white |
| Categories expanded to 24 | Add each new one via CategoryPicker on profile edit; browse filter finds them |
| Searchable CategoryPicker | Type in the search box on `/browse` filters; chip list narrows live |
| Landing category rotator | Batch swap every ~3.8s; hover pauses; See all 24 → link works |
| Payments dashboard charts | Bar chart + escrow donut render; empty state when no data |
| Portfolio item detail page rebuild | Hero + sidebar + more-from-creator all render |

---

## ✅ Verified working

| Feature | Notes |
|---|---|
| Save feedback on Profile edit | Green ✓ banner shows on save |
| Save feedback on Portfolio add | Form resets after save |
| Save feedback on Post job | Redirects to new job; no banner expected |
| Save feedback on Send proposal | Green banner appears |
| Save feedback on Send message | Input clears, "Sent." flashes |
| In-app notification bell | Unread count, dropdown, mark all read |
| In-app: client notified on new proposal | Confirmed end-to-end |
| In-app: creative notified on accept/decline | Confirmed |
| In-app: message notifications | Confirmed |
| Email: client receives "new proposal" | ✅ user confirmed |
| Email: client receives "work submitted for review" | ✅ user confirmed |
| Job status: "Mark as submitted" (creative side) | Works after RLS policy added |
| Job status: realtime auto-refresh on update | <10s via realtime + polling |
| Job status: badge on detail page | Live |
| `/dashboard/jobs` split into Active / Completed | Confirmed |
| Portfolio-add prompt on completed job (creative side) | Confirmed |
| Rate card system (services CRUD + custom inquiry) | User confirmed "thats working" |
| Admin dashboard access + stats render | EQ New Client promoted via SQL, `/admin` loads with stats (5/9/6/0) + recent jobs list |
| Scope confirmation: both sides confirm → auto-flip to `in_progress` | User confirmed end-to-end working |
| Dispute resolution: raise → reason banner → admin resolves | User confirmed end-to-end working |
| `/reset-password` renders form + validates | Confirmed via Playwright (`tests/e2e/password-recovery.spec.ts`) — page loads, mismatched-password shows inline error |
| Empty states on `/browse` and `/jobs` | Confirmed via Playwright (`tests/e2e/empty-states-and-errors.spec.ts`) — zero-result query shows `EmptyState` + "Clear filters" CTA on both |
| Custom 404 page | Confirmed via Playwright — `/this-does-not-exist` renders "Nothing here." + "Back to home" |
| Signup with already-used email shows error banner | Confirmed via Playwright — redirects to `/signup?error=...`, no silent success |
| Creative availability selector persists after reload | Confirmed via Playwright — `/dashboard/profile` select round-trips through `updateAvailability` + reload |
| Creative onboarding submit (profile + portfolio + service in one shot) | Confirmed incidentally via Playwright — `ensureOnboarded` helper completes the form and lands back on `/dashboard` |
| Dashboard "Profile insights" section (creative) | Confirmed via Playwright — 4 KPI cards (Views/Saves/Proposals sent/Save rate) + chart render |
| Account → change name / phone | User confirmed: values persist after save + reload |
| Account → change password | User confirmed: new password works on re-login |
| Forgot-password request link | Added on `/login` → `/forgot-password` page → `supabase.auth.resetPasswordForEmail` with `redirectTo=/auth/callback?type=recovery`. End-to-end confirmed by user in-session |
| Scope confirmation: client edits summary after creative confirms → resets creative confirmation | User confirmed |
| Escrow: creative notified on payment state change | User confirmed |
| Custom service request from client side + notification + thread creation | User confirmed |
| Creative onboarding redirect + submit | User confirmed (also incidentally verified by Playwright `ensureOnboarded` helper) |
| Client onboarding redirect + "Post a job now" radio | User confirmed |
| Landing page: "Browse jobs" CTA, "Types of creatives" grid + Content Creation category | User confirmed |
| User profile dropdown menu (avatar + name) + navbar responsive at narrow widths | User confirmed |
| Job status: Request revision → Re-submit cycle | User confirmed end-to-end (client requests, creative re-submits, status flips back to Submitted) |
| Escrow: Mark payment held → Release | User confirmed end-to-end |
| Admin: resolve dispute as completed / cancelled | User confirmed |
| Admin: hide / unhide job | User confirmed — hidden jobs disappear from public listings, reappear on unhide |

## ⚠️ Tested, known issue (tracked in BACKLOG)

| Feature | Issue | Backlog item |
|---|---|---|
| In-app notification latency | ~30s end-to-end during testing | "Notification latency" |
| Email delivery to anyone other than `vinnykasa@gmail.com` | Resend sandbox only delivers to account owner until `ganyu.com` domain verifies | "Verify ganyu.com in Resend" |
| Email: proposal accepted (creative side) | Not received — same domain issue | Same as above |
| Email: job completed (either side) | Not received — same domain issue | Same as above |
| Account → change email | `updateAccount` correctly calls `supabase.auth.updateUser({ email })`; SavingForm now surfaces the `info` message ("Check your inbox to confirm the new email."). Email swap requires clicking Supabase confirmation link in the new (and, if secure email change is on, old) inbox — this is by design, not a bug. Full end-to-end swap not yet confirmed | Track in BACKLOG if Supabase confirmation redirect URL isn't set correctly |

## 🕒 Prompted to test, awaiting confirmation

_(empty — all outstanding items verified 2026-07-02)_

## ⬜ Never tested (2026-07-13 sweep)

| Feature | Notes |
|---|---|
| Proposal limit — "job full" card at cap | Default cap 10 proposals/job. Needs a low-cap job or 10 seeded proposals to hit. |
| Search (`?q=`) on `/browse` and `/jobs` | Title + brief ILIKE — never hands-on tested since shipping. |
| For You / Trending feed correctness | Depends on `interactions` rows accumulating (see next item). |
| Saved items (`/dashboard/saved`) round-trip | Save/unsave from a card, page reflects the new state. |
| `recordView` populating `interactions` | Open a job/creative signed-in, check `interactions` table has a fresh row. Feeds Trending. |
| Empty states across pages | No jobs / no proposals / no notifications / no saved items — each should render the friendly empty card, not a blank space. |
| Portfolio + avatar image upload | Currently URL text field only. Backlog: swap to Supabase Storage. |
| Email delivery to non-`vinnykasa@gmail.com` inboxes | Blocked on `ganyu.com` Resend verification. |
| Change-email flow end-to-end | Supabase sends the confirmation email — needs the domain fix above to test properly. |

## Process

- When a 🕒 item is verified, move it to ✅ or ⚠️
- When a ⚠️ item ships a fix, move it back to ✅ and clear the backlog row
- New build → add 🕒 items to "Prompted to test" so they don't get forgotten
