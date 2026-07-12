# Test Log

Tracks what's been hands-on tested vs. what's been built but not yet confirmed working. Works alongside [`GanyuHub_DevRoadmap.md`](GanyuHub_DevRoadmap.md) (what to build) and [`BACKLOG.md`](BACKLOG.md) (known issues to fix later).

Legend: ✅ verified · ⚠️ tested with known issue · 🕒 prompted to test, awaiting confirmation · ⬜ never tested

Last updated: 2026-07-08

---

## ⬜ Session 3b (2026-07-12) — Top-up accept-and-pay (not yet tested)

Requires: Session 3a shipped + `increment_total_paid` RPC migration run.

1. **Happy path**: creative requests topup → client picks rail → "Accept & pay" → redirected to PayChangu → complete a sandbox payment → return lands on job page → topup status is `paid`, `jobs.total_paid_mwk` incremented by request amount.
2. **Escrow release uses new total**: after topup paid, client releases payment → verify creative receives `creativeNet(total_paid_mwk, rail)` — bigger than pre-topup release.
3. **Failed payment**: cancel or fail at PayChangu → callback marks topup `declined`, `total_paid_mwk` unchanged.
4. **Webhook idempotency**: webhook fires after callback → status stays `paid`, RPC not re-called (guarded by `status = 'pending'` check).
5. **Cancellation with paid topup**: paid topup on a job → cancellation request → admin sees `total_paid_mwk` in the split. Refund + creative cut must sum to `total_paid_mwk`.
6. **Guards**: creative can't hit `payTopUp` (client-only); non-pending topup rejects.

---

## ⬜ Session 3a (2026-07-12) — Top-up requests + decline (not yet tested)

Payment integration (accept-and-pay) ships in 3b. In 3a, creative can request, client can decline or ignore. `total_paid_mwk` column exists but only mutates through the acceptance write; adding paid-topup summation happens in 3b.

1. **Request**: as accepted creative on an in-progress job → new "Payment top-ups" card → enter amount + reason (≥20 chars) → submit. Expect: toast, request appears in amber "Pending" block, client gets "Top-up requested" notification.
2. **One-pending guard**: try to request a second topup while first is pending → server returns "You already have a pending top-up request…"
3. **Withdraw (creative)**: creative clicks "Withdraw request" on their pending topup → status flips to `cancelled`.
4. **Decline (client)**: client clicks "Decline" on the pending topup → status flips to `declined`. Creative gets "Top-up declined" notification.
5. **Cancellation auto-cancel**: with a pending topup, either party requests cancellation → verify topup row auto-flips to `cancelled` (SQL: `select status from payment_topups where job_id='<id>'`).
6. **Dispute auto-cancel**: raise a dispute manually with a pending topup → same auto-flip.
7. **Cron auto-cancel**: (harder to test) — 72h past deadline flip → same auto-flip.
8. **Money-math sweep**: on release payout, `creativeNet` reads `total_paid_mwk` (backfilled = `accepted_bid_mwk` for existing jobs, so amounts unchanged for non-topup jobs). Verify a normal release still pays the correct amount.
9. **Cancellation admin split**: `adminResolveCancellation` computes gross from `total_paid_mwk` first, falling back to `collection_amount_mwk` then `accepted_bid_mwk`. Verify existing cancellation flow unchanged for pre-topup jobs.
10. **Guards**: non-creative can't request; open/completed/cancelled jobs reject request.

---

## ⬜ Session 2 (2026-07-12) — Direct invites (not yet tested)

Two accounts needed: client (with an open job) + creative.

1. **Send invite**: client → creative profile → "Invite to job" → pick job → send → expect toast. Retry same creative → previously-invited job shows "(already invited)" disabled.
2. **Creative receives**: switch to creative → bell shows notification → click → lands on job page with emerald "You've been invited" banner + your message.
3. **Cap bypass**: fake 3 rejections via SQL: `insert into proposals (job_id, creative_id, cover_letter, bid_mwk, status) select '<job>', '<creative>', 'test', 1000, 'rejected' from generate_series(1,3);`. Without invite → blocked card. With invite → form + banner still shown, submit works.
4. **Guards**: non-clients don't see the button; non-open jobs don't appear in dropdown; RLS blocks direct-SQL inserts as wrong user.
5. **Cleanup**: `delete from proposals where cover_letter = 'test'; delete from job_invites where message like '%test%';`

| Feature | Notes |
|---|---|
| "Invite to job" button appears on creative profile | Only visible to signed-in non-owner; only if viewer has ≥1 open job |
| Invite dropdown lists only my open jobs | Jobs already invited to this creative show as disabled option |
| Invite creates notification | Creative gets "You've been invited to a job" notification with link |
| Invite banner on job page | Emerald banner shows on job page for invited creative with the invite message |
| Invite bypasses 3-cap | Creative with 3 rejections + invite can still submit a proposal |
| Duplicate invite blocked | Second invite for same creative+job returns "already invited" error |
| Non-open jobs can't be invited to | Trying to invite on in_progress/completed job → error |

---

## ⬜ Session 1 (2026-07-12) — 3-attempts proposal cap (not yet tested)

| Feature | Notes |
|---|---|
| Reapply after 1 rejection | Creative gets rejected → form re-appears with "attempt 2 of 3" header |
| Cap at 3 rejections | Third rejection → form gone, blocked card shows "Only a direct invite from the client can reopen it" |
| One-active-proposal guard | Try to submit while pending → server rejects with "You already have an active proposal on this job" |
| Rejected count excludes withdrawn/cancelled | Only `status='rejected'` should count against the 3 |
| Client-side view unchanged | Client sees all proposals (including rejected reapplies) in the proposals list |

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
