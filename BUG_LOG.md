# Bug Log

Live-issue tracker for Ganyu Hub. Every bug from day zero, with problem, root cause, and fix. Format: bugs actively in play at the top; every historical bug in the Fixed section (newest first). This log is back-populated from CHANGELOG.md; new bugs are logged the moment they're reported.

Format per entry:

```
- **[ID] Short title** — reported <date>, area
  - Repro / Symptom
  - Cause
  - Fix: commit or CHANGELOG date
```

---

## In Progress

- **[BUG-006] Auth callback silently redirected to /dashboard on failed code exchange.** — reported 2026-08-04 during security audit.
  - **Repro:** expired/invalid/replayed magic-link `?code=` still redirected to `/dashboard`, where page-level guards then bounced the user with no context.
  - **Cause:** `app/auth/callback/route.ts` discarded the `error` from `exchangeCodeForSession(code)`.
  - **Fix shipped (2026-08-04):** check the error and redirect to `/login?error=Sign-in link expired or invalid...` when exchange fails.

- **[BUG-005] Password-recovery link mints a full session on GET (Supabase footgun) with no post-reset revocation.** — reported 2026-08-04 during security audit.
  - **Repro:** anyone who loads the recovery link (email prefetch, security scanner, browser history, shoulder surfer) is logged in as the target user. The real user later resetting their password only killed their own local cookie — the prefetcher's session survived.
  - **Cause:** `components/reset-password-form.tsx` called `signOut()` (default `local` scope) after password change, so any other session minted from the same recovery code remained valid on Supabase's side.
  - **Fix shipped (2026-08-04):** `signOut({ scope: "global" })` — updating the password now revokes every refresh token, kicking any prefetcher out immediately.

- **[BUG-004] Signout only cleared the local cookie; server-side refresh token stayed valid.** — reported 2026-08-04 by founder ("friend copied a session cookie into another browser and got in").
  - **Repro:** attacker copies `sb-*-auth-token` from victim's browser into their own. Victim clicks "Sign out". Attacker's copied cookie still works — the refresh token was never revoked server-side.
  - **Cause:** `app/auth/signout/route.ts` called `supabase.auth.signOut()` with the default `local` scope. `@supabase/ssr` defaults to `local`, which only wipes the current cookie store.
  - **Fix shipped (2026-08-04):** `signOut({ scope: "global" })` — every refresh token for the user is now revoked on signout, so any copied cookie dies with the click.

- **[BUG-003] Supabase auth cookies missing HttpOnly/Secure/SameSite — session hijack surface.** — reported 2026-08-04 during security review.
  - **Repro:** DevTools → Application → Cookies on a signed-in session shows `sb-*-auth-token*` cookies without HttpOnly. JS on any page (including any XSS payload) could read them and exfiltrate the session.
  - **Cause:** `lib/supabase/server.ts` and `lib/supabase/middleware.ts` passed the `options` from `@supabase/ssr`'s `setAll` callback through verbatim. Supabase's own defaults don't force HttpOnly/Secure — they leave it to the app.
  - **Fix shipped (2026-08-04):** added `hardenCookie()` helper in both files. Every auth-cookie write now forces `httpOnly: true`, `secure: true` in prod (off in dev so localhost still works), `sameSite: "lax"`, `path: "/"`. Existing sessions keep working; cookies re-flag on next token refresh.

- **[BUG-002] Onboarding "Finish & go to dashboard" leaked raw Postgres RLS error + wasn't logged.** — reported 2026-08-04 by beta creative on `/onboarding/creative`.
  - **Repro:** creative fills onboarding, presses Finish. Red banner appears: `new row violates row-level security policy for table "profiles"`. Nothing lands in `/admin/errors`.
  - **Cause:** BUG-001's fix changed `profiles.update` → `profiles.upsert(..., { onConflict: 'id' })`. Postgres checks the INSERT policy on any upsert regardless of which branch (INSERT vs UPDATE) actually executes. Schema only had `profiles update self`, no INSERT policy — so upsert failed for every existing user. Secondary: `completeCreativeOnboarding` returned `pErr.message` verbatim (leaked DB internals) and never called `logAdminError` (so admins had no signal).
  - **Fix shipped (2026-08-04):**
    - Added `profiles insert self` policy scoped to `auth.uid() = id` in `supabase/schema.sql` — makes upsert work whether the row exists or not.
    - Rewrote all six failure branches in `completeCreativeOnboarding` to route through `logAdminError` + `GENERIC_ERROR(ref)` — users now see a case ID, `/admin/errors` gets the raw Postgres error + code.
  - **Migration required:** re-run `supabase/schema.sql` in Supabase Studio to add the new policy. Fix is inert without it.

- **[BUG-001] Creative onboarding "Finish & go to dashboard" does not save uploaded data.** — reported 2026-07-24 by beta creative, on `/onboarding/creative`.
  - **Repro:** creative fills headline, bio, categories, skills, portfolio piece with cover image, service; presses "Finish & go to dashboard". Redirects to `/dashboard`. Data is not visible on their profile or services page.
  - **Cause (suspected):** redirect firing while data is missing means the mutations returned success but affected 0 rows. Most likely the `profiles` row was never created for this auth user, so `profiles.update().eq('id', user.id)` matched nothing (Supabase JS treats 0-row updates as success and never errors). Secondary suspect: storage bucket `portfolio` RLS rejecting the upload with a hard error that killed the whole action before any DB write. **Update 2026-08-04**: the upsert fix from `2ffcefe` was itself blocked by a missing INSERT policy — see BUG-002. That's why the reporter kept hitting a hard error instead of a silent no-save.
  - **Mitigations shipped (`2ffcefe`, 2026-07-24):**
    - `profiles.update` → `profiles.upsert(..., { onConflict: 'id' })` so the row is created if missing.
    - `.select('id')` chained on all three writes (`profiles`, `portfolio_items`, `services`); explicit user error + `console.error` to Vercel logs on any 0-row result.
    - Cover-image upload made non-fatal (logs and continues with `cover_url = null`) so a storage RLS hiccup doesn't wipe the whole submission.
    - Success log `[onboarding] creative onboarded <user_id> cover=<bool>` added for trace visibility.
  - **Next step:** after BUG-002's INSERT policy migration lands, ask the reporting creative to try again. If it still fails, `/admin/errors` (now populated) will name the exact failing step.
  - **Status:** in progress — awaiting re-test in prod post-BUG-002 fix.

## Open

_(none currently open — see In Progress above)_

---

## Fixed

Back-populated from `CHANGELOG.md`. Newest first. Only entries with a clear bug-to-fix arc are included; pure feature ships aren't bugs.

### 2026-07-22

- **[FIX-2026-07-22a] `/browse` rate sort was inert (ordering by a dead column).**
  - Symptom: "Lowest rate" and "Highest rate" on `/browse` didn't change the order.
  - Cause: sort used `profiles.hourly_rate_mwk`, a column the codebase itself flagged dead. Real prices live in `services`.
  - Fix (`2583ae5`): dropped the DB `.order("hourly_rate_mwk")` branch; rate sort now runs in memory against the `fromPrice` map derived from `services.price_mwk`. Profiles with no priced service sink to the bottom either direction.

- **[FIX-2026-07-22b] Double-fee at checkout.**
  - Symptom: 10,000 MWK bid via bank rail. Checkout screen said 10,200. Customer was actually charged ~10,404 — fee applied twice.
  - Cause: `app/actions.ts` sent `clientCharge(bid, rail)` (bid + our fee estimate) as `amount` to PayChangu. PayChangu treats `amount` as base and adds its own fee on top for the customer.
  - Fix (`a818df7`): send raw bid; processor adds its fee once. `clientCharge` retained for UI display. Applied to both `acceptProposal` and top-up payment paths.

### 2026-07-17

- **[FIX-2026-07-17a] WCAG contrast pass 2: `text-stamp` failed AA on white for small text.**
  - Symptom: same #069494-on-white contrast failure across dashboard/admin small-text links and stamped badges.
  - Fix: full swap of `text-stamp` → `text-stamp-dark` across 12 files. Decorative italic display headings kept bright — they meet AA-large at 3:1.

### 2026-07-16

- **[FIX-2026-07-16a] WCAG contrast: `text-brand` (#069494) failed AA on white (~3.7:1).**
  - Symptom: small-text teal links fell under the 4.5:1 threshold for normal text.
  - Fix: swapped to `text-brand-dark` (#046B6B, ~5.4:1, AA-passing) in the four auth/CTA link sites (`app/login/page.tsx`, `app/signup/page.tsx`, `app/forgot-password/page.tsx`, `app/jobs/[id]/page.tsx`).

- **[FIX-2026-07-16b] Portfolio uploads capped at Vercel's 4.5MB body / 10s server-action limits.**
  - Symptom: uploading multiple unedited phone photos in one shot failed or timed out.
  - Fix: `MultiImagePicker` now uploads client-side directly to Supabase Storage as each file is picked (parallel, with per-tile status). Server actions receive a JSON array of pre-uploaded URLs, not File objects. Vercel body/timeout limits no longer apply.

### 2026-07-15

- **[FIX-2026-07-15a] User menu dropdown clipped items on short viewports.**
  - Symptom: admin accounts couldn't reach the "Admin" link at the bottom of the menu on short screens.
  - Cause: `overflow-hidden` with no height cap.
  - Fix: `max-h-[calc(100vh-5rem)]` + `overflow-y-auto`; panel swapped to a flex column so it scrolls internally.

### 2026-07-13

- **[FIX-2026-07-13a] Payouts stayed "pending" even after PayChangu confirmed success.**
  - Symptom: UI toast said "Payout confirmed. Status updated to Released." but `payout_status` never left `pending`.
  - Cause: `verifyPayout` returned PayChangu's decimals verbatim for `amount`/`fee`. `reconcilePayout` wrote them into the `int` columns `payout_amount_mwk`/`payout_fee_mwk`; Postgres silently rejected the write.
  - Fix: rounded both to integers on the way in, matching the earlier `verifyPayment` fix.

- **[FIX-2026-07-13b] Job page returned 500 from `revalidatePath` during render.**
  - Symptom: any job with a pending payout crashed the page ("Something went sideways").
  - Cause: `app/jobs/[id]/page.tsx` called `reconcilePayout()` at render time; `reconcilePayout` internally called `revalidatePath`, which Next 14 forbids inside render.
  - Fix: gave `reconcilePayout` a `{ skipRevalidate: true }` mode used by the render caller (the page re-fetches after, so revalidate is redundant there). Form-action callers unchanged.

- **[FIX-2026-07-13c] Cancellation queue understated gross when top-ups were paid.**
  - Symptom: MWK 9k job with a paid MWK 5k top-up displayed "gross 9,270" instead of 14,000, misleading the split percentages.
  - Cause: admin display read `collection_amount_mwk || accepted_bid_mwk` and ignored `total_paid_mwk`. Enforcement math was already correct — only the UI lied.
  - Fix: switched display to `total_paid_mwk || collection_amount_mwk || accepted_bid_mwk` with an `(original X + top-ups Y)` breakdown.

- **[FIX-2026-07-13d] Top-ups could be created + paid after `payment_released`.**
  - Symptom: "in escrow" totals stopped matching reality after release when a top-up was subsequently paid.
  - Cause: `requestTopUp` and `payTopUp` had no post-release guard.
  - Fix: both actions reject when `escrow_status ≠ 'payment_held'`; creative-side request form hidden after release. Tips-after-release moved to backlog.

- **[FIX-2026-07-13e] Admin cancel confirmation rejected legitimate confirms.**
  - Symptom: typing the job title into the admin cancel confirm sometimes failed with no useful reason.
  - Cause: `adminResolveCancellation` compared with `===`, so a trailing space in the DB title or a different case in the admin's typing bounced it.
  - Fix: trim + case-insensitive normalize on both sides before compare (the field is a "did you mean" gate, not a security check).

- **[FIX-2026-07-13f] Invite-to-job popup was clipped inside parent card.**
  - Symptom: on the creative profile, the `<details>` dropdown for "Invite to job" was cut off by the parent card's overflow.
  - Fix: replaced the inline dropdown with a real link to a dedicated page (`/creatives/[id]/invite`).

- **[FIX-2026-07-13g] Proposal submit leaked raw Postgres unique-constraint error.**
  - Symptom: user saw "duplicate key value violates unique constraint proposals_job_id_creative_id_key".
  - Cause: total unique constraint blocked reapplication even though the 3-attempts flow explicitly allows it.
  - Fix: dropped the total constraint; added a partial unique index scoped to `status in ('pending','accepted')`. Wrapped the insert in `logAdminError` + `GENERIC_ERROR` so future failures surface in `/admin/errors` instead of the UI.

- **[FIX-2026-07-13h] Cancellation payouts ate the platform's cut on small jobs.**
  - Symptom: platform's 10% on cancellation was being consumed by PayChangu's per-payout transfer fees (bank MWK 700 flat).
  - Fix: added `CANCELLATION_PAYOUT_RESERVE_PCT` (15%) — each side's cancellation share is reduced by a flat reserve before payout so the transfer fee comes out of the recipient's slice, not the platform's. Admin queue shows pre-reserve share + reserve deducted + actual payout, with a warning when either side falls below MWK 4,700.

- **[FIX-2026-07-13i] Dust cancellations paid MWK 0 while burning transfer fees.**
  - Symptom: cancellation splits under MWK 1,000 were fully consumed by PayChangu's transfer fee.
  - Fix: `MIN_PAYOUT_MWK = 1000` — legs below the floor skip `initiatePayout` entirely and stay with the platform. Admin queue labels this ("payout MWK 0 — below MWK 1,000 floor — rolled to platform").

- **[FIX-2026-07-13j] Long unbroken briefs pushed job cards past the mobile viewport.**
  - Cause: no line clamp, no word-break for pseudo-words like `sandboxtestsandboxtest…`.
  - Fix: 2-line clamp, explicit "More info →" affordance below, `overflow-wrap: anywhere` so pseudo-words break before the clamp fires.

- **[FIX-2026-07-13k] Duplicated "Refresh payout status" button on escrow panel.**
  - Cause: JSX block copy-pasted twice in `components/escrow-panel.tsx`.
  - Fix: removed the duplicate.

### 2026-07-12

- **[FIX-2026-07-12a] PostgREST embeds returned zero rows silently across dashboards (`PGRST201`).**
  - Symptom: dashboards showed empty jobs/proposals lists after a new FK landed.
  - Cause: Session C's new `jobs.pending_accept_proposal_id` FK created a second `jobs↔proposals` relationship; every unqualified PostgREST embed became ambiguous and silently returned zero rows.
  - Fix (`0443041`): pinned the affected embeds to `!proposals_job_id_fkey` in `app/dashboard/jobs/page.tsx` and `app/dashboard/proposals/page.tsx`. Earlier same-day one-off (`bada1cb`) handled the actions layer.

- **[FIX-2026-07-12b] 3-attempts-per-creative proposal cap never engaged.**
  - Symptom: cap feature was inert on ship day.
  - Cause: `proposals.status` is a Postgres enum `pending | accepted | declined | withdrawn`. Both `submitProposal` and the job page filtered `.eq("status", "rejected")` — a value that doesn't exist — so `rejectedCount` was always 0.
  - Fix (`478e575`): switched to `declined` at all call sites. Regression coverage grew via the mock-Supabase enum-validation hardening below.

- **[FIX-2026-07-12c] Mock Supabase silently accepted bogus enum values, letting FIX-2026-07-12b slip past tests.**
  - Cause: `tests/helpers/mockSupabase.ts` didn't validate enum status filters.
  - Fix: mock now errors on bogus values; the "declined" vs "rejected" bug would fail tests today.

- **[FIX-2026-07-12d] Just-posted jobs didn't appear on the dashboard without a manual refresh.**
  - Cause: `postJob` didn't revalidate `/dashboard/jobs`.
  - Fix: added `revalidatePath('/dashboard/jobs')` on success.

- **[FIX-2026-07-12e] E2E cookie state leaked between spec files.**
  - Cause: `login()` helper didn't clear cookies before navigating.
  - Fix: helper now clears cookies before login.

- **[FIX-2026-07-12f] Long briefs broke the job detail page layout; deadline picker was hostile.**
  - Cause: brief field had no wrap/max-height/scroll. Deadline defaulted to yesterday.
  - Fix: proper wrapping + max-height + scroll on the brief. Deadline picker shows a human date ("20th of July 2026") + "N days left" pill; defaults to a sensible future offset.

- **[FIX-2026-07-12g] Hourly cron schedules never fired on Vercel Hobby.**
  - Symptom: dispute non-response, topup expiry, and deadline extension aging didn't run.
  - Cause: Vercel Hobby only supports daily crons.
  - Fix: collapsed all hourly schedules to a single daily cron. Semantics unchanged, aging is just less frequent.

### 2026-07-11

- **[FIX-2026-07-11a] Double-payout on Release under slow-network double-click.**
  - Cause: no server-side guard; button could fire twice before the first response returned, producing two PayChangu payouts.
  - Fix: server-side lock on `jobs.payout_status` (only `none → initiated`); UI hides the button once initiated; payout webhook matches by `job_id` so a duplicate charge id can't re-mark the job.

- **[FIX-2026-07-11b] `decideProposal` errors were hidden from the user.**
  - Symptom: silent-failure path in accept-proposal made real causes invisible.
  - Fix: errors now surface verbatim on the accept form.

### 2026-07-10

- **[FIX-2026-07-10a] `releasePayment` failed with "creative profile not found".**
  - Cause (`295417d`): lookup joined on the wrong column.
  - Fix: corrected the join.

- **[FIX-2026-07-10b] When FIX-2026-07-10a failed, the real error was swallowed.**
  - Fix (`75f60cf`): the real cause now bubbles up to the client.

- **[FIX-2026-07-10c] Email lookup for release-payment hit a non-existent column.**
  - Cause: `profiles` has no email column; code was reading it.
  - Fix (`e451335`): lookup goes through `auth.users` via the existing `get_user_email` RPC.

- **[FIX-2026-07-10d] "Payment details" card only rendered for the client.**
  - Symptom: creative couldn't see the rail, fee, or status of the payment they were about to be paid from.
  - Fix: card now visible to both parties; PayChangu checkout prefilled with the client's saved name/phone/email.

### 2026-07-08

- **[FIX-2026-07-08a] Landing category rotator pushed the search bar off-screen.**
  - Cause: hero listed the full `CATEGORIES` array (24 entries), producing an absurdly tall column.
  - Fix: shows 6 categories at a time in a keyed batch, cycles every 3.8s through 4 batches with Framer AnimatePresence. Hover pauses; `prefers-reduced-motion` locks to first batch.

- **[FIX-2026-07-08b] Portfolio "Add cover photo" pill pointed to the wrong route.**
  - Cause: link targeted `/dashboard/account` instead of `/dashboard/profile`.
  - Fix: repointed to `/dashboard/profile`.

- **[FIX-2026-07-08c] `ImagePicker` wide-shape layout put the upload button in the wrong column.**
  - Cause: default row layout pushed the button off to the side when the preview was full-width.
  - Fix: wide shape now stacks preview + button vertically.

### 2026-07-06

- **[FIX-2026-07-06a] Category taxonomy drift in production DB.**
  - Symptom: rows carried categories that no longer matched the canonical list after the taxonomy was constrained.
  - Fix: `scripts/audit-categories.mjs` and `scripts/normalize-categories.mjs` added to detect and repair drift; forms constrained to the canonical set.

### 2026-07-02

- **[FIX-2026-07-02a] `SavingForm` `silent` prop leaked to the DOM as an unknown HTML attribute.**
  - Symptom: React warning on every form using `silent`.
  - Fix (`8954ef0`): prop no longer forwarded to the underlying `<form>` element.

### 2026-07-01

- **[FIX-2026-07-01a] RSC race: `revalidatePath` landed before redirect, leaving stale UI.**
  - Symptom: user navigated to the next page and saw pre-mutation state.
  - Fix (`dd1dad0`): ordered revalidation so post-redirect view is fresh.

- **[FIX-2026-07-01b] `SavingForm` didn't render server-action `info` strings.**
  - Symptom: messages like "Check your inbox to confirm the new email" never appeared.
  - Fix (`dd1dad0`): `SavingForm` now surfaces `info` alongside errors.

---

## Notes

- IDs are chronological: `FIX-YYYY-MM-DD-<letter>`; live open bugs use `BUG-NNN`. Numbering restarts only if we ever rebuild the log.
- When BUG-NNN gets fixed, keep the entry in In Progress until the deploy lands and the reporter re-tests, then move to Fixed with the commit hash.
- Pre-2026-06-24 (before the initial MVP scaffold `2695603`) is not covered — nothing was shipped that could have been broken. If bugs are found in commits earlier than the changelog captures, add them under a "Pre-launch" section here.
