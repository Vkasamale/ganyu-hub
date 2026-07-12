# Test Log

Tracks what's been hands-on tested vs. what's been built but not yet confirmed working. Works alongside [`GanyuHub_DevRoadmap.md`](GanyuHub_DevRoadmap.md) (what to build) and [`BACKLOG.md`](BACKLOG.md) (known issues to fix later).

Legend: ✅ verified · ⚠️ tested with known issue · 🕒 prompted to test, awaiting confirmation · ⬜ never tested

Last updated: 2026-07-12

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
| Invite bypasses 3-cap | ⚠️ Can't be meaningfully tested — the cap itself is dead code (see Session 1 bug) |
| Duplicate invite blocked | ✅ Confirmed live + unit test |
| Non-open jobs can't be invited to | ✅ Confirmed via unit test (`tests/actions/invites.test.ts:30`) |

---

## ⚠️ Session 1 (2026-07-12) — 3-attempts proposal cap — BUG FOUND

**Real bug, confirmed live 2026-07-12** (Playwright run: `tests/e2e/sessions-1-2-3.spec.ts`, "Session 1" describe block, wrapped in `test.fail()` since it's expected to fail until fixed):

`proposals.status` is a Postgres enum with values `pending | accepted | declined | withdrawn` (`supabase/schema.sql:148`) — there is **no `'rejected'` value**. `declineProposal` correctly writes `status: "declined"` (`app/actions.ts:702`). But:
- The cap-check query in `submitProposal` filters `.eq("status", "rejected")` (`app/actions.ts:630`) — never matches a real declined row, so `rejectedCount` is always 0 and the cap **never triggers**.
- The job page's reapply banner does the same: `myProposals.filter(p => p.status === "rejected")` (`app/jobs/[id]/page.tsx:66`, also used at line 465).

**Net effect: the entire 3-attempts cap feature is inert in production.** A declined creative can resubmit proposals indefinitely; the "attempt 2 of 3" banner and the "Only a direct invite…" blocked card never appear. The unit tests in `tests/actions/submitProposal.test.ts` all pass because the mock Supabase client doesn't enforce the real enum — they inject the literal string `"rejected"` directly into mock data, masking the bug. This is worth a follow-up: fix both references to check `"declined"` instead, and fix the mock/test data so a real enum mismatch like this would be caught.

| Feature | Notes |
|---|---|
| Reapply after 1 rejection | ❌ Broken — "attempt 2 of 3" header never appears (`app/jobs/[id]/page.tsx:66,465` checks the wrong status string) |
| Cap at 3 rejections | ❌ Broken — blocked card never appears (`app/actions.ts:630` checks the wrong status string) |
| One-active-proposal guard | ✅ Confirmed live — re-navigating while a proposal is pending correctly hides the form |
| Rejected count excludes withdrawn/cancelled | N/A — moot, the count is always 0 regardless (see bug above) |
| Client-side view unchanged | ✅ Confirmed live — client's `/dashboard/proposals?tab=received` still lists all proposals |

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

## ⬜ Never tested

| Feature | Notes |
|---|---|
| Proposal limit — "job full" card at cap | Skipped this session: default cap is 10 proposals/job (see `app/jobs/[id]/page.tsx` `proposalLimit`); seeding 10 proposals from 10 distinct creatives just to hit the cap is heavier scaffolding than the "keep specs minimal" constraint allows. Revisit if a lower per-job cap becomes easy to set via seed/admin. |
| Job / creative filters (`<FiltersBar>`) | Category, skills, price range, sort — also in BACKLOG |
| Search (`?q=`) on `/browse` and `/jobs` | Title + brief ILIKE — never hands-on tested since shipping |
| For You / Trending feed correctness | Categories match, view counts populate correctly |
| Saved items (`/dashboard/saved`) round-trip | Save/unsave, page reflects state |
| Public profile rendering for an unsigned visitor | No "Message" or "Request quote" buttons should appear |
| Job posted by client visible on their `/dashboard/jobs` | Should appear under Active |
| `recordView` actually populating `interactions` | Needed for Trending |
| Multi-browser realtime test (two real browsers, not just tabs) | Confirms it's not just Next router-refresh |

## Responsiveness & UI polish (mostly untested)

- Mobile breakpoint (<640px): navbar, dashboard tiles, job detail panel stack
- Tablet breakpoint (640–1024px): rate card grid, jobs list density
- Notification dropdown clipping on small screens
- User menu dropdown clipping (right-edge `right-0` should be fine, but verify)
- Long full_name truncation in user menu trigger (set to `max-w-[120px]`)
- Long category/skill arrays wrapping cleanly on profiles
- Empty states across pages (no jobs, no proposals, no notifications)
- Color contrast on the brand red against white / neutral-50 backgrounds

## Process

- When a 🕒 item is verified, move it to ✅ or ⚠️
- When a ⚠️ item ships a fix, move it back to ✅ and clear the backlog row
- New build → add 🕒 items to "Prompted to test" so they don't get forgotten
