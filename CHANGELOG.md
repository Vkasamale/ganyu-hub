# Changelog

A running log of what has actually shipped, newest first. For the product
vision and unresolved decisions, see [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md).

## 2026-08-05 — CAPTCHA extended to share-link claim form

Wired Cloudflare Turnstile onto the `/j/[token]` public claim/sign-in form too. `acceptJobViaLink` now verifies the `cf-turnstile-response` token (after the rate-limit check, same fail-open behaviour as auth) and returns "Verification failed…" on a bad token; `app/j/[token]/page.tsx` renders `<Turnstile />` above the submit button. Turnstile live in production on `ganyu-hub.vercel.app` (keys added in Vercel, confirmed rendering on `/login`). All three CAPTCHA surfaces — login, signup, share-link claim — now covered.

## 2026-08-05 — CAPTCHA on auth + RLS regression test committed

Cloudflare Turnstile wired into login + signup. `components/turnstile.tsx` renders the widget only when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set; `lib/turnstile.ts` verifies the token server-side against Cloudflare's siteverify and **fails open when `TURNSTILE_SECRET_KEY` is unset**, so the forms are unchanged until you add keys. `signIn`/`signUp` now verify the `cf-turnstile-response` token (after the rate-limit check) and bounce back with an error if it fails. Env keys documented in `.env.local.example` (incl. Cloudflare's always-pass dev test keys). Also moved the authenticated RLS exploit test into the repo at `scripts/security/rls-exploit-test.mjs` (+ README) — run it after any `proposals`/`jobs` RLS or trigger change; it seeds throwaway fixtures, runs the self-accept + column-tamper attacks as a real creative session, asserts they're blocked and legit writes still work, and cleans up. Confirmed all 3 assertions PASS against the live DB. `/j/[token]` claim form left without a widget for now (phone-only public flow; rate-limited already).

## 2026-08-05 — Security audit round 3: underpayment guard, rate limiting, storage cap

Closed the four flagged follow-ups from round 2.
- **(A) Underpayment guard** — `paychangu/callback` + `webhook` routes now select `accepted_bid_mwk` and refuse to flip escrow to `payment_held` when the PayChangu-verified amount is below the agreed bid; logs an admin error (`payment_underpaid`) and leaves the job pending for manual handling.
- **(B/D) Rate limiting** — new Postgres-backed fixed-window limiter (`rate_limits` table + `check_rate_limit` RPC in `schema.sql`, `lib/rate-limit.ts` helper using the service-role client + client IP). Wired into `signIn` (10/10min per IP+email), `signUp` (5/hr per IP), and `acceptJobViaLink` (8/10min per IP). The share-link claim's wrong-password error is now generic ("We couldn't sign you in…") so it's no longer an account-enumeration / password-testing oracle.
- **(C) Storage cap** — `job-deliverables` bucket now carries a DB-level `file_size_limit` of 10MB (`on conflict do update`), so a direct Supabase SDK upload can't bypass the app's server-side size check. No DB MIME allow-list (design formats have unreliable MIME types; bucket is private + signed-URL only, so stored files never execute in-origin).

**Still needs you:** (1) run the updated `schema.sql` in Supabase Studio — the `rate_limits` table, `check_rate_limit` function, and bucket size cap are inert until then (rate-limit helper fails open, so nothing breaks meanwhile). (2) CAPTCHA on auth forms still requires a provider (hCaptcha/Cloudflare Turnstile) + env keys — server-side rate limiting is in, but a CAPTCHA is the other half against determined bots; say the word and provide keys to wire it.

## 2026-08-05 — Security audit round 2: TOCTOU claim guard + timing-safe cron

Deeper auditor pass (payment routes, full server-action authz sweep, public no-session surface). Two code fixes shipped: (1) `acceptJobViaLink` now claims the job with an atomic `.is("client_id", null)` filtered update + row-count check — two concurrent submissions on the same share link can no longer both attach (last-write-wins race closed). (2) `app/api/cron/non-response-check` bearer check switched from `!==` to `crypto.timingSafeEqual` (length-gated) so `CRON_SECRET` can't be timing-recovered. Confirmed safe in this pass: all `admin*` actions gate on `is_admin` via the user-session client; `updateEscrowStatus` (release) is client-only with T+1 hold, payout idempotency, server-computed `creativeNet`, and destination scoped to the creative's own `payout_methods`. Flagged for decision (not auto-fixed): collection webhook/callback don't hard-reject underpayment (`verified.amount < accepted_bid_mwk` still flips escrow to held); `acceptJobViaLink` is a password-test/enumeration oracle with no rate limit once a valid token is held; storage bucket lacks DB-level size/MIME caps; no rate-limiting/CAPTCHA on any auth surface.

## 2026-08-05 — Security: close creative→job privilege-escalation chain (RLS + trigger)

Static security audit (2026-08-05) found a self-service privilege-escalation path reachable by any logged-in creative via raw PostgREST calls, no UI needed. Fixes in `supabase/schema.sql` — **must be run in Supabase Studio to take effect** (source-of-truth updated; DB not yet migrated):

- **`proposals update`** had no `WITH CHECK`, so Postgres reused `USING` as the check — a creative could PATCH their own proposal to `status='accepted'` (self-accept). Now: client may accept/decline, creative may only withdraw.
- **`proposals insert`** had no job-state restriction — could propose on any job. Now: only `status='open'` jobs.
- **`jobs update by accepted creative`** grants a full-row UPDATE and RLS can't restrict columns, so a (self- or legitimately) accepted creative could PATCH `total_paid_mwk`/`escrow_status` directly — inflating their own release payout or faking completion. Added `guard_jobs_creative_update()` BEFORE UPDATE trigger that rejects a creative's change to protected money/ownership columns (escrow_status, total_paid_mwk, collection_amount_mwk, accepted_bid_mwk, budget_mwk, client_id, client_link_token, client_refund_status); skips service-role and the job's own client.
- **`payment_topups update`** had no `WITH CHECK` — either party could flip `status` and poison the webhook's pending-guard (dropping a real payment). Now: only the client may set `declined`; `paid` comes solely from the verified webhook (service-role).

Audit also **confirmed safe**: webhook HMAC uses `timingSafeEqual` with length check; escrow/topup side-effects are idempotent (pending-guarded); payment amounts are provider-attested via server-to-server verify; payout destinations are scoped to the creative's own `payout_methods`; no `dangerouslySetInnerHTML`; no user-controlled `redirect()`; no server-only secret reachable in the client bundle; `profiles insert self` correctly pins `auth.uid()=id`. Non-blocking follow-ups noted in TEST_LOG (topup-claim TOCTOU, cron secret `!==`, storage bucket size/MIME cap, no rate-limiting on auth).

## 2026-08-04 — GlassUploadButton: shared glassy-pill upload CTA

New `components/glass-upload-button.tsx` — pure CSS approximation of the Dribbble shader-upload-button reference: glossy white pill with inner highlight + subtle depth shadow, cloud-up icon, hover raises the button with a conic chromatic-gradient halo blurred behind it, active state presses in. Three sizes (sm/md/lg). Swapped in as the trigger for `ImagePicker` (sm), `MultiImagePicker` (md), and `JobDeliverySubmit` (md — the native `<Input type="file">` was replaced with a hidden input + glass trigger + inline filename). `AttachmentPicker` deliberately skipped — that's a paperclip icon inside the message composer, wrong context for a large pill CTA. No new deps; no shader/webgl.

## 2026-08-04 — Session 7 polish 2: progress bar clip fix + brief card redesign

Progress bar container gets `py-2 px-2` so the current dot's ring + `scale-110` bump aren't clipped vertically by `overflow-x-auto` (which forces `overflow-y: auto` under it). Brief card on `/jobs/[id]` redesigned: eyebrow "Project brief" label, brief text bumped to serif `text-lg`/`text-xl` with `leading-relaxed`, deliverables section separated by a hairline divider, meta row (Budget · Deadline · Revisions · Format) rebuilt as a compact `<dl>` strip with uppercase labels and `font-display` tabular-nums on Budget. Removed the standalone bold "Budget: MWK X" line — budget now lives inside the meta strip.

## 2026-08-04 — Fix: /jobs/[id] "oops" — client-bundle ReferenceError in job-stages

Removed the top-level `if (require.main === module)` self-check in `lib/job-stages.ts`. Once `JobProgressBar` became `"use client"` (previous polish push), this file was pulled into the browser bundle, where `module` isn't defined — every job detail page threw `ReferenceError` caught by `app/error.tsx`.

## 2026-08-04 — Session 7 polish: animated multi-color progress bar, pessimistic payout estimate

Progress bar (`components/job-progress-bar.tsx`) is now client-side with a mount animation — connectors sweep left→right (700ms, 180ms stagger) matching the recharts feel used on the dashboard. Each stage has its own color (sky → indigo → violet → amber → emerald); completed dots show a check only (no number), current dot is empty with a colored ring + scale bump, upcoming dots show grey numbers. Permanent 1-5 numeric guide rendered under each label. Job header (`components/job-header.tsx`) payout line now shows the pessimistic net after cash-out fee: `gross − max(payoutFee(gross,"bank"), payoutFee(gross,"mobile"))`, so the number can't shrink at cash-out regardless of which rail the creative picks. Label updated to "Creative receives (est., after cash-out fee)".

## 2026-08-04 — Session 7: job lifecycle progress bar + money-at-a-glance header

New pure display layer over the existing status enum and `job_events` log — no new statuses. `lib/job-stages.ts` maps `(job, events)` to `{currentIdx, overlay}` across five fixed stages: Proposal accepted → Escrow funded → In progress → Delivered → Completed. Cancelled and disputed render as overlays on the stage they occurred at (walks the event log to find where), not as their own stages. `components/job-progress-bar.tsx` is a horizontal stepper: completed stages are green with checks, current is highlighted with a ring, remaining is grey; the overlay stage gets a red (cancelled) or amber (disputed) marker with an inline "Cancelled here" / "Disputed here" label. `components/job-header.tsx` replaces the old CardHeader block at the top of the job detail page — title in display type, "Money in escrow: MWK X" in 3xl/4xl tabular figures using the same `total_paid_mwk ?? collection_amount_mwk ?? accepted_bid_mwk` precedence used everywhere else, "Creative receives: MWK Y" underneath from `creativeGross()` (respects `BETA_ZERO_COMMISSION`), progress bar directly below. Scoped strictly to the header — body content untouched. `lib/job-stages.ts` has an in-file `require.main` self-check covering escrow-held, completed, cancel-after-escrow, and dispute-after-delivery cases.

## 2026-08-04 — Session 5: creative-initiated client jobs with share link

Creatives can now create a job on an existing client's behalf when terms are agreed off-platform, and hand the client a private link that leads straight into the job. New surfaces: **`/jobs/new-for-client`** (creative-only form: title, brief, deliverables, category, agreed price, deadline, revisions_included, extra_revision_rate); **`/j/[token]`** (public landing — no navbar/footer chrome, shows job details + creative profile, minimal name+phone+password form); **"Copy client link"** banner on the job page when the creative views an unclaimed job. Two new server actions in `app/actions.ts`: `createJobForClient` (inserts job with `visibility='private'`, `status='scope_pending'`, `client_id=null`, `client_link_token=<24-byte base64url>`, plus a synthetic `proposals` row `status='accepted'` so every existing creative-side RLS gate keeps working unchanged) and `acceptJobViaLink` (public, no session; matches existing users by `profiles.phone` or creates new account with synthetic email `<phone>@ganyu-phone.local`, attaches `client_id`, logs `proposal_accepted` event, redirects to `/jobs/[id]`). Schema deltas: `jobs.client_id` becomes nullable, new `jobs.client_link_token text unique`. Two supporting bits: root `middleware.ts` sets `x-pathname` so root layout can strip nav on `/j/*`, and `/jobs/[id]/page.tsx` was made null-safe on `client_id` and now grants access to the accepted creative on unclaimed private jobs. No new RLS policies — the synthetic accepted proposal was the trick.

## 2026-08-04 — Repo moved off OneDrive; Turbopack crash resolved

Working copy moved from `C:\Users\vinny\OneDrive\Documents\Code\GANYU HUB` to `C:\Users\vinny\GANYU HUB`. The intermittent Next 16 / Turbopack `0xc0000142` worker crash was environmental — OneDrive's on-demand file provider was racing Turbopack's cache writes. Dev server from the new path: clean start, `GET / 200`, Turbopack noticed prior corruption and reset its cache once. BUG-007 re-verified via `tsc --noEmit` (typecheck clean; RLS-level behaviour was already confirmed in aa6a59d). Housekeeping: `@vercel/analytics@^2.0.1` added to deps (not yet wired), `tsconfig.tsbuildinfo` added to `.gitignore` (regenerable), obsolete `GANYU HUB dcos .zip` / `Docs.zip` removed.

## 2026-08-04 — BUG-007 fix verified E2E

Confirmed the e88d527 fix for BUG-007. Local dev server hit an unrelated Turbopack/Windows crash (`0xc0000142` in a spawned worker), so verification ran as a direct Supabase-level check instead of a UI click-through: reproduced the pre-fix client-authenticated `payment_topups` insert (still RLS-blocked, confirming the diagnosis), then ran the exact service-role insert now shipped in `requestRevision` case C — succeeded, correct row shape (`job_id`, `requested_by_creative_id`, `amount_mwk=5000`, `reason` starts `EXTRA_REVISION|`). Ran the callback's post-pay side effects on that row — `payment_topups.status` → `paid`, `jobs.revisions_used` 1 → 2, both correct. No code changes; temporary `TEST_MODE_SKIP_PAYCHANGU_VERIFY` bypass added and reverted (`lib/payments.ts` diff is empty). Test data cleaned up. Recommend a UI click-through pass once the local Turbopack crash is resolved. See `TEST_LOG.md`.

## 2026-08-04 — BUG-007 fix: paid revision overage top-up now uses service-role client

`requestRevision` case C (paid-overage branch in `app/actions.ts`) previously ran the `payment_topups` insert through the client's own authenticated Supabase client, tripping the `auth.uid() = requested_by_creative_id` RLS check and silently blocking every paid revision. Switched that single insert to a service-role client (same pattern as `releasePayment`'s payout profile lookup). RLS policy unchanged; creative-initiated inserts still enforce the original rule. Requires `SUPABASE_SERVICE_ROLE_KEY` (already required by release/payout paths).

## 2026-08-04 — Full E2E test walk: BUG-001 confirmed fixed, BUG-007 found

Ran a full manual/scripted walk of the job activity timeline (sessions 1-4) end to end against the real Supabase project with live PayChangu keys, using a temporary local-only `verifyPayment()` bypass (`TEST_MODE_SKIP_PAYCHANGU_VERIFY`, reverted before commit — zero diff on `lib/payments.ts`) so escrow could clear via the real `/api/paychangu/callback` route without touching PayChangu's hosted checkout.

- **BUG-001 re-tested and confirmed fixed** — fresh creative onboarding (`creative-a@test.local`) saved headline/bio/portfolio piece/service in one submission with no RLS error, `profiles.onboarded_at` set correctly.
- **Job A (full lifecycle)** — post → propose → accept-and-pay → escrow_funded → proposal_accepted → work_started → submitted → completed, all events landed on the timeline in order. Release Payment intentionally not clicked (live payout keys). Outsider RLS held.
- **Job B (file delivery)** — under-10MB upload, over-10MB client-side rejection, external-link delivery all confirmed live; outsider couldn't see the delivery form or any delivery events.
- **Job C (revisions) — found BUG-007**: the paid-revision-overage top-up (client confirms "Pay MWK X & continue" after included revisions are used) silently fails — RLS on `payment_topups` insert requires `auth.uid() = requested_by_creative_id`, but this code path is invoked by the client inserting on the creative's behalf. No topup row is ever created, the revision counter never advances. Logged as BUG-007, not fixed this session (test-only run, no RLS/auth changes). Free within-limit revisions and the blank-rate "not available" path both work correctly.

**Migration:** none. **Cleanup:** `.env.local`'s test-only env var removed; three test accounts (`client-a@test.local`, `creative-a@test.local`, `outsider@test.local`) left in the DB for the founder to delete via the SQL snippet provided in the test session output.

## 2026-08-04 — Session security hardening (BUG-003/004/005/006)

Triggered by a founder-side demo: friend copied a valid `sb-*-auth-token` cookie from one browser into another and was logged in as the victim. Root cause was three-layered — none critical on its own, all critical together — plus a fourth silent-failure paper-cut spotted in the same audit.

- **BUG-003** — `lib/supabase/server.ts` + `lib/supabase/middleware.ts` passed Supabase SSR's default cookie options through verbatim, so `sb-*-auth-token*` was set without `HttpOnly` / `Secure` / `SameSite`. Any XSS could read the cookie. Added `hardenCookie()` helper on both write paths: forces `httpOnly: true`, `secure: true` in prod (off in dev so localhost stays on `http://`), `sameSite: "lax"`, `path: "/"`. Existing sessions re-flag on next token refresh.
- **BUG-004** — `app/auth/signout/route.ts` called `signOut()` with the default `local` scope (only clears the current cookie store). A cookie already exfiltrated survived the victim clicking Sign out. Changed to `signOut({ scope: "global" })` — every refresh token for the user is now revoked, so the copied cookie dies on the click.
- **BUG-005** — `components/reset-password-form.tsx` had the same footgun on the reset-password flow. Anyone who loaded a recovery link before the real user (email prefetch, security scanner, browser history, over-the-shoulder) held a full session that survived the password change. Reset now `signOut({ scope: "global" })` after `updateUser({ password })` — every session minted from the recovery code dies the moment the real user sets their new password.
- **BUG-006** — `app/auth/callback/route.ts` discarded the `error` return from `exchangeCodeForSession(code)`. Expired/invalid/replayed magic-link codes still redirected to `/dashboard`, where page-level guards bounced the user with no context. Now redirects to `/login?error=Sign-in link expired or invalid...` on failure.

**Migration:** none required.
**One-time cleanup for the demonstrated hijack:** have the victim sign out once on the post-`8967c8a` deploy. That single global-scope signout revokes every existing session including the copied one.

## 2026-08-04 — Job activity timeline: sessions 2 + 3 + 4 (batch)

Ships the remaining three sessions of the timeline system in one drop. Nobody was on platform, so batching kept the beta database in one consistent shape rather than three intermediate ones.

**Session 2 — status transitions wired into the event log.** `logJobEvent` now fires from every lifecycle mutation: `escrow_funded` (PayChangu callback + webhook, atomic guard via `.eq("escrow_status","payment_pending").select("id")` so callback+webhook race is deduped and the fund-notification only fires once), `work_started` (both `promotePendingAcceptance` for payment-first accept and `confirmScope` when both parties confirm), `job_completed` + `cancelled` (via `updateJobStatus`), `dispute_filed` (via `raiseDispute` and the 72h `cron/non-response-check` with `actorId: null` + "Auto-flagged" note), `dispute_resolved` (via `adminResolveDispute`), `cancelled` (via `adminResolveCancellation` with split percentages in the note), `deadline_extended` (via `respondToDeadlineExtension` on approve).

**Session 3 — file delivery.** New private `job-deliverables` storage bucket, path `<job_id>/<uuid>.<ext>`, RLS: accepted-creative insert/delete, participants + admin read. New `components/job-delivery-submit.tsx` client component (creative-only, active-job-only): file picker with 10MB hard cap (client-side reject before any upload attempt), external-link fallback for larger files, mutual exclusion enforced client + server. New `submitDelivery` server action uploads via the user-scoped client (RLS enforces the accepted-creative-only rule) and writes `{ file_url, file_name, file_type, size_bytes }` or `{ external_link }` into `job_events.metadata`. Revision detection: if the most recent relevant event was `revision_requested`, logs as `revision_delivered` instead of `files_delivered`. Timeline extended to render download links (via batch-minted signed URLs, 1h TTL) or external links inline.

**Session 4 — revision limits + paid overage.** Proposals carry `revisions_offered` (int, default 1) and optional `extra_revision_rate` (int MWK — blank = hard limit). On accept, both copy into `jobs.revisions_included` / `jobs.extra_revision_rate` inside the same guarded update in `promotePendingAcceptance`. New `jobs.revisions_used int default 0` counter. New client-only `RequestRevisionPanel`: within-limit is free, over-limit-with-rate shows an amber confirm prompt then routes through the existing top-up escrow rail (`payment_topups` insert + `initiatePayment` redirect — no parallel payment path), over-limit-no-rate hard-stops with the "please discuss directly" message. Post-payment side effects (increment counter + log `revision_requested`) fire from the PayChangu callback + webhook when the paid top-up's `reason` starts with the `EXTRA_REVISION|` marker. Timeline header now shows **"Revisions: X of Y used"**.

Runtime bug caught locally before push: `EXTRA_REVISION_MARKER` was originally exported from `app/actions.ts`, which is a `"use server"` file — Next.js only allows async function exports there. Dropped the `export` keyword; the marker is used inline in the callback + webhook comparisons anyway.

**Migration required:** re-run `supabase/schema.sql` before this deploy is exercisable. Adds the `job-deliverables` bucket + 3 policies (S3) and the 4 revision columns on `proposals` / `jobs` (S4). Session 1's `job_events` table and CHECK constraint already covered `files_delivered`/`revision_delivered`, so no CHECK update.

Test plan: consolidated Job A/B/C plan in TEST_LOG covers all four sessions in ~25 min instead of four separate runs.

## 2026-07-25 — Job activity timeline: schema + first event + render (session 1 of 4)

Foundation for the multi-session job activity/timeline system. New `job_events` table (append-only): `id uuid pk`, `job_id fk jobs`, `event_type text CHECK` (11 initial values covering the full lifecycle), `actor_id fk profiles nullable`, `note text nullable`, `metadata jsonb nullable`, `created_at`. Index on `(job_id, created_at)`. RLS: select allowed for the client, the accepted creative, and admin. No insert/update/delete policies on purpose — the only writer is the service-role helper.

New `lib/job-events.ts:logJobEvent(jobId, eventType, note?, opts?)` — service-role insert via the same `createServerClient` pattern as `lib/admin-errors.ts`. Missing service key is a soft-fail (logs, doesn't throw) so a misconfigured deploy can't take down the acceptance path.

Wired at exactly one call site this session (proof of concept): `lib/accept-pending.ts:promotePendingAcceptance` now logs `proposal_accepted` with `actor_id = client_id` and `metadata.proposal_id`. The log call is gated on the affected-rows of the guarded `jobs.update ... eq("status", "open")` so webhook + callback races don't produce duplicate rows.

New `components/job-timeline.tsx` — presentational server component. Vertical timeline, oldest→newest, dot + inline SVG icon + human label + `timeAgo` (reused from `lib/utils.ts`). Rendered on `app/jobs/[id]/page.tsx` just below `JobStatusPanel`, visible to both parties, hidden when there are no events. Existing status badge untouched — timeline is additive per spec.

**Migration required:** re-run `supabase/schema.sql` for `job_events` and its policy.

Sessions 2–4 will fan more writers into `logJobEvent` (escrow_funded, files_delivered, revisions, completion, dispute, cancel, deadline) and eventually mirror timeline entries into the message thread.

## 2026-07-24 (b) — BUG_LOG.md fully back-populated from day zero

Combed the entire CHANGELOG.md (624 lines, 2026-06-24 → today) and pulled every entry with a clear bug-to-fix arc into `BUG_LOG.md`. 30 historical fixes now logged in `FIX-YYYY-MM-DD-<letter>` format under a Fixed section, newest first, grouped by date. Each entry has symptom / cause / fix. Coverage spans payment double-charges, PostgREST embed regressions, dead-column sort, silent 0-row updates, RLS gaps, image-upload capping, WCAG contrast failures, cron scheduling, RSC render-time race, prop leakage, deadline defaults, taxonomy drift, layout clipping, and duplicate JSX. Pure feature ships excluded.

BUG-001 stays In Progress at the top until the reporter re-tests on the new deploy.

## 2026-07-24 — BUG-001 mitigations + BUG_LOG.md

Creative reported that "Finish & go to dashboard" on `/onboarding/creative` redirected them but saved nothing. Redirect firing while nothing lands points at a silent 0-row mutation, most likely a missing profiles base row so `.update().eq('id', user.id)` matched nothing (Supabase JS treats 0-row updates as success). Shipped defensive changes:

- `profiles.update` → `profiles.upsert(..., { onConflict: 'id' })` so a missing row auto-creates.
- Chained `.select('id')` on all three writes (`profiles`, `portfolio_items`, `services`); explicit user error + `console.error` to Vercel logs if any affected 0 rows.
- Cover-image upload now non-fatal — logs and continues with `cover_url = null` on failure so the creative doesn't lose their bio over a storage RLS hiccup.
- Success log `[onboarding] creative onboarded <user_id> cover=<bool>` for trace visibility.

New `BUG_LOG.md` at repo root: problem/cause/fix format, open bugs at top, fixed section back-populated with the notable historical fixes from CHANGELOG (rate sort, double-fee, payout-pending, PGRST201, 3-attempts cap, etc.). Going forward all beta bug reports are logged here first.

## 2026-07-22 (f) — /browse rate sort was broken (dead column)

`Sort by "Lowest rate" / "Highest rate"` on `/browse` was ordering by `profiles.hourly_rate_mwk` — a column the codebase itself already marked dead (real prices live in `services`). Result: the sort effectively did nothing. Fixed by dropping the DB `.order("hourly_rate_mwk")` branch and re-sorting `visibleProfiles` in memory by the already-computed `fromPrice` map (min service price per profile). Profiles with no priced service sink to the bottom either direction. `top_rated` and `newest` unchanged.

## 2026-07-22 (e) — Live char counters on Brief + Deliverables; revisions backlog note

Replaced "(min 200 characters)" / "(min 50 characters)" label suffixes on the job-post form (`app/jobs/new/page.tsx`) and the private-invite form (`app/creatives/[id]/invite/page.tsx`) with a live `count/min` counter under the textarea. New `components/char-count-textarea.tsx` client component; server-side `minLength` still enforced via prop pass-through.

Backlog: added "Move 'revisions included' from the client to the creative" under a new Scope/proposals section. Creative should commit revisions in the proposal since the number is a function of their price, not the client's guess.

## 2026-07-22 (d) — Terms §1 formatting pass + Contact page

Reformatted Terms §1 with bold lead-ins per paragraph ("Why we exist.", "The middle ground.", "Built for skill, not certificates.", "What 'ganyu' means.", "Reach us anytime.") matching Section 2's rhythm. Bolded key phrases: "registered Malawian business", "held in escrow", "Both the client and the creative are protected. Both are accountable." Reads scannable instead of a wall of text.

Added `/contact` route (`app/contact/page.tsx`): WhatsApp/call, email, report-form pointer, location. Footer link added in `app/layout.tsx` as first item in the nav row.

## 2026-07-22 (c) — Terms §1 rewrite in founder voice

Replaced the placeholder "Who we are" section with a longer, personal, first-person origin: registered Malawian business, started in Blantyre. The "why" is now the broader pattern of upfront payment + disappearing service providers in the local creative space, not a single anecdote. Reinforces escrow + accountability positioning. Contact block now surfaces WhatsApp/call (+265 886 072 933) and email (CiTiMrKt@gmail.com) alongside the report form.

## 2026-07-22 (b) — Dash sweep, live release countdown, escrow-funded notification

Stripped em/en dashes from `/terms`, `/privacy`, `/content-policy` (AI-tell). Replaced with commas, periods, or colons — no wording changes. Rewrote Terms §1 "Who we are" in first-person, more human voice ("We're a small team based in Blantyre…").

Release-payment button: was hidden during the 24h settlement hold. Now visible-but-disabled with a live countdown ("Release opens in 14h 22m 03s") that ticks every second. New `components/hold-countdown.tsx` client component. Server enforcement of the 24h gate unchanged.

Client notification when payment lands in escrow: `escrow_funded` kind, inserted from both the PayChangu webhook and callback paths (whichever fires first wins — the other's branch is guarded by `escrow_status === "payment_pending"` so no duplicates). Copy: "Payment is safely in escrow — Funds for [job] are held. The creative can begin work. You'll be able to release payment the next business day."

## 2026-07-22 — Double-fee fix + PayChangu name removed from user-facing copy

Fixed double-charge on checkout: `app/actions.ts` was passing `clientCharge(bid, rail)` (bid + our fee estimate) as the `amount` to the processor, which then added its own fee on top of that, so the customer paid the fee twice (10,000 bid → shown 10,200 → actually charged ~10,404). Both `acceptProposal` and the top-up payment path now pass the raw bid — the processor adds its fee on top for the customer, and the full bid still lands in escrow. `clientCharge` stays for UI display.

Rebranded user-facing "PayChangu" mentions to generic language ("our secure checkout", "processing fee", "payment") in `escrow-panel.tsx`, `accept-proposal-picker.tsx`, `jobs/[id]/page.tsx`, `add-payout-method-form.tsx`, `dashboard/profile/page.tsx`. Support issues will route to us instead of the vendor. Legal disclosure in `terms/page.tsx` + `privacy/page.tsx` keeps the vendor name (required disclosure). Admin pages also keep it (internal, useful for diagnosis).

T+1 language softened: "PayChangu clears funds the next business day (T+1)" → "Funds settle the next business day after payment." Client now sees the settlement notice up-front in the `payment_held` hint AND at accept-time in the payment picker, so they know money can't be released instantly.

## 2026-07-21 — Beta zero-commission waiver + backlog OTP/IDV research

Added `BETA_ZERO_COMMISSION` flag in `lib/fees.ts` (env-driven, default ON). Creatives keep 100% of the bid during beta; PayChangu payout fee pass-through unchanged. `creativeGross` routes through `effectiveCommission()`; `lib/payments.ts:creativeAmount` delegates through it so escrow-panel + cancellation split honor the flag. UI copy updated in `proposal-payout-preview.tsx` ("Waived during beta"), `accept-proposal-picker.tsx` ("No platform fee during beta"), `escrow-panel.tsx` (creative help line). Admin money tile now labeled "Platform revenue (waived during beta)" but still logs the theoretical 15% so visibility is preserved. One-line launch flip: set `NEXT_PUBLIC_BETA_ZERO_COMMISSION=false` in Vercel + redeploy.

BACKLOG: added Identity & Trust section (phone OTP research — eSMS Africa Malawi rate unconfirmed, Africa's Talking backup; IDV vendors Smile/Youverify/Trulioo ~$0.50–$2/verify unconfirmed for Malawi). Rewrote Resend entry — `ganyu.com` is not owned; buy `ganyuhub.com` instead.

## 2026-07-18 — Delete stale skipped dispute E2E test

Removed the `test.skip(...)` "raise a dispute while job is scope_pending" block from `tests/e2e/client-job-flow.spec.ts`. Was gated on PayChangu sandbox wiring — now unblocked via manual sandbox pass, but the accept flow requires a real PayChangu checkout that Playwright can't drive. Dispute UI is already covered elsewhere (`admin.spec.ts` + manual walkthrough), so the test was rot. Also enabled Plausible in prod (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN` set in Vercel, redeployed) — backlog Infrastructure entry can close.

## 2026-07-17 — SERVICES.md (financial single source of truth)

New top-level [SERVICES.md](SERVICES.md) — every paid service by stage (Beta / Money Unlock Day / Public Launch / Scale), with real prices verified from provider pricing pages (Vercel Pro $20, Supabase Pro $25, Resend Free/Pro $0/$20, Plausible Starter $9/mo yearly, UptimeRobot Free/Solo $0/$8, Namecheap ganyuhub.com $6.79 y1 promo / $11.28/yr). PayChangu section pulls actual rates from `lib/fees.ts` (mobile 3%/1.8%, bank 2%/1.5%+MWK700, 15% platform commission kept in full since PayChangu fees are pass-through). Running totals per stage: $0/mo → ~$46/mo (Stage 2) → ~$83/mo (Stage 3). Break-even at Stage 3: ~970k MWK GMV/month.

## 2026-07-17 — WCAG contrast sweep pass 2 (text-stamp)

Full swap of `text-stamp` → `text-stamp-dark` across 12 files (components/{job-card,filters-bar,multi-image-picker}, app/admin/{page,users/page}, app/creatives/[id]/{page,portfolio/[itemId]/page}, app/dashboard/{layout,page,jobs/page,payments/page,proposals/page}). Covers small-text links (~text-xs), stamped badges on `bg-stamp/10`, and the admin "warn" stat tile. #069494 → #046B6B lifts contrast on white from ~3.7:1 to ~5.4:1 (AA-passing for normal text). Reverted the two decorative italic display headings (`app/dashboard/page.tsx:146`, `app/dashboard/jobs/page.tsx:135`) back to bright `text-stamp` — those are large text and part of the brand's teal accent; they already meet AA-large at 3:1. Closes the backlog item.

## 2026-07-16 — Accessibility audit: reduced-motion + WCAG contrast pass 1

Reduced-motion: nothing to do — `app/globals.css:36` already zeros out animation/transition durations under `prefers-reduced-motion: reduce`. Verified.

WCAG contrast: audited teal usage on white. `text-brand` (#069494) = ~3.7:1, fails AA for normal text. Swapped to `text-brand-dark` (#046B6B ≈ 5.4:1, passes) in the four auth/CTA link sites (`app/login/page.tsx`, `app/signup/page.tsx`, `app/forgot-password/page.tsx`, `app/jobs/[id]/page.tsx`). Same #069494 issue applies to `text-stamp` used as small-text links across the dashboard — logged in BACKLOG for a full sweep. Badges on tinted `bg-stamp/10` still meet contrast and were left alone.

## 2026-07-16 — Plausible analytics (pageviews only)

Added the Plausible script to `app/layout.tsx`, gated by `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Inert until the env var is set in Vercel — no accidental data leak, no perf hit. To turn on: (1) create a free Plausible account, add site `ganyu-hub.vercel.app` (later `ganyuhub.com`), (2) set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=ganyu-hub.vercel.app` in Vercel env, (3) redeploy. That gives pageviews, unique visitors, referrers, top pages — enough for the Monday ritual to start (signups = /signup views, jobs page traffic, etc.). Ponytail: no custom events yet; add `plausible('job_posted')` etc. only when pageview data can't answer a real question.

## 2026-07-16 — T+1 release hold on payouts

PayChangu settles collections the next business day (T+1) — funds don't hit our main balance immediately, so a client who paid at 11pm and approved at 11:05pm can't actually be paid out until the next business day. Enforced now on both server and UI. New nullable column `jobs.payment_held_at` gets stamped whenever escrow flips to `payment_held` (both `app/api/paychangu/callback/route.ts` and `app/api/paychangu/webhook/route.ts`). `updateEscrowStatus` rejects a `payment_held → payment_released` transition when `payment_held_at` is under 24h old, returning a message with hours remaining. `EscrowPanel` hides the Release button during the hold window and shows "PayChangu clears funds the next business day (T+1). Release opens in ~Nh." Legacy jobs (null timestamp) skip the check. Ponytail: flat 24h wall-clock hold — upgrade to real business-day logic if a weekend hold ever generates a complaint. Reference: https://support.paychangu.com/

## 2026-07-16 — Landing proof row with real numbers

Homepage now has a "Real numbers · Ganyu Hub to date" row under the hero: GMV, jobs completed, creatives live — all pulled from the same money computation used on `/admin`. Row is guarded by `jobsCompleted >= 3` so it stays hidden until the numbers are worth showing (avoids "MWK 0 · 0 jobs · 1 creative" during pre-launch). Required a small refactor: the old fully-client `app/page.tsx` is now split — `components/home-hero.tsx` keeps the interactive mode-toggle hero, and `app/page.tsx` is a server component that renders the hero + the new proof row. No schema changes.

## 2026-07-16 — Portfolio uploads: client-side direct to Supabase

Killed the last real blocker on portfolio-image uploads: files no longer round-trip through Vercel. `MultiImagePicker` now uses the Supabase browser client to upload each file straight to Storage the moment it's picked (parallel), with per-tile spinner / cover / failed states. The hidden input the parent form posts to the server is now a JSON array of already-uploaded URLs, not File objects. `addPortfolioItem` and `addPortfolioImages` server actions dropped their upload code — they just parse the URL array and write to the DB. Consequence: Vercel's 4.5MB body cap and 10-second server-action timeout are no longer in play, so a creative can add 10 unedited phone photos (30MB+ total) in one shot. Kept the same `name="cover_files"` prop so both callers (`app/dashboard/portfolio/page.tsx`, `app/dashboard/portfolio/[id]/page.tsx`) needed no change. Existing storage RLS at `supabase/schema.sql:436` (auth.uid must match the first path segment) already permits this — no policy migration.

## 2026-07-15 — Ratings into ranking (Browse + For You)

Reviews now shape discovery. `/browse` gets a new **Top rated** sort option in the FiltersBar — profiles are ranked by `avg × log(count+1)` so a 4.8-with-20-reviews outranks a lone 5-star, and unrated creatives sink to the bottom. `getForYouCreatives` (dashboard + homepage feed) quietly does the same re-rank: it now fetches a 4× candidate pool from the category-matched query and re-ranks by the same Bayesian-ish score before returning the top N. Recency remains the default browse sort — only clients who opt into "Top rated" or land on For You get the review-weighted view. Uses the existing `reviews` table; no schema, no new indexes.

## 2026-07-15 — Rate limits on submitProposal + sendMessage

Two guards for the "we're taking real money and inviting real users" era. `submitProposal` now blocks any creative who has already submitted 5 proposals in the last 60 seconds across all jobs — stops spamming every open job in one burst. `sendMessage` blocks any sender who has already sent 20 messages in the last 60 seconds across all threads — stops thread-flooding and cross-user harassment. Both use a `SELECT count(*)` pre-check on the existing table (no new tables, no new deps). Skipped signup/login: Supabase Auth already rate-limits those server-side.

## 2026-07-15 — OG rich-preview cards for creative profiles + jobs

Pasting a creative profile or job link into WhatsApp, Facebook, or any preview-aware surface now renders a proper card instead of a bare URL. Root layout `app/layout.tsx` gets a `metadataBase` and site-wide OG/Twitter defaults (title, description, logo). `/creatives/[id]` gets a per-profile `generateMetadata` that pulls name + primary category + headline + avg star rating; uses the creative's avatar as the OG image when available. `/jobs/[id]` gets a per-job `generateMetadata` that surfaces title, category, budget, and first 140 chars of the brief. Private direct-invite jobs return a generic "Private invite" title with `robots: noindex, nofollow` — no leaking the title or brief in link previews or search. Verify by pasting a live URL into WhatsApp after the deploy settles.

## 2026-07-15 — Site-wide: killed the "→" affordance arrow

Stripped the trailing `→` from every link/button label on the site — job cards ("More info"), homepage ("See all N"), message-embedded job cards ("Open job"), dashboard job rows ("Open"), dashboard "See all", admin disputes "Open job", creative profile completeness chips, portfolio grid "Click to edit", and the "See all" on the public portfolio detail page. The affordance now comes from the button/link styling itself. Kept: decorative rotating badge arrow in `hero-art.tsx` (art, not affordance) and arithmetic arrows in `admin/cancellations` labels ("MWK X → payout Y" as split math).

## 2026-07-15 — Admin nav shortcuts + trend bar color + policy pages as cards

Admin sidebar picks up jump-links for **Money**, **Trends**, and **People & activity** (hash anchors to sections on `/admin`). PeriodBarChart historical bars swapped from muted ink-gray to a soft stamp tint so the trend charts read as teal-family, not grey — current week stays full stamp. `/terms`, `/privacy`, and `/content-policy` sections wrapped in `card-soft` so each rule reads as its own tile instead of a wall of paragraphs.

## 2026-07-15 — Admin overview: analyst dashboard (money + trends)

Rebuilt `/admin` around what a data analyst actually looks for. Headline is now a 6-tile **Money** row: GMV, platform revenue (15% of completed + cancellation take), MWK currently in escrow, paid to creatives, refunded to clients, average completed job value. Below it, **Trends** — 8-week weekly bars for GMV, jobs posted, signups, and disputes, with the current week highlighted. People & activity strip breaks users down by role (clients / creatives / agencies) and links each into `/admin/users?role=`. Existing daily-signups line + jobs-by-status + jobs-by-category charts kept, but pushed below the money view. Moderation queues (disputes / cancellations / errors) demoted to the bottom of the page — they only visually flag when non-zero. Killed the "→" arrow affordance on the KPI tiles; the whole card is the click target with a hover elevation + border tint. All computed server-side in one Promise.all — no new tables, no schema changes.

## 2026-07-15 — User menu: scrollable on short screens

Dropdown had `overflow-hidden` with no height cap, so on short viewports items at the bottom (notably the Admin link for admin accounts) were clipped with no way to reach them. Added `max-h-[calc(100vh-5rem)]` + `overflow-y-auto` and swapped the panel to a flex column so it scrolls internally.

## 2026-07-15 — /terms and /privacy pages

Plain-English Terms of Service and Privacy Policy at `/terms` and `/privacy`. Covers who holds the money (escrow via PayChangu), the flat 15% commission, cancellation splits, dispute process, ID storage, and the no-off-platform-payments rule. Business name "Ganyu Hub", address "Blantyre, Malawi". Linked from the footer alongside Content policy / Report; signup form now has a "By signing up you agree to…" line above the Log in link.

## 2026-07-13 — Merged to prod: 6-step manual plan green

Full sandbox test plan cleared before merging `sandbox-test → main` (cbc0c33): PayChangu accept → checkout → escrow held; release with real payout fee; top-up on same job; cancel with paid top-up; direct invite lets 3×-declined creative submit; 4th proposal without invite blocked.

## 2026-07-13 — Job cards: 2-line brief + explicit "More info →" + overflow-wrap:anywhere

Long unbroken briefs were pushing cards wider than the mobile viewport. Clamped the description to 2 lines, added a visible "More info →" affordance beneath it so the truncation reads as intentional, and switched to `overflow-wrap: anywhere` so pseudo-words like `sandboxtestsandboxtest…` also break mid-word before the clamp fires.

## 2026-07-13 — Messages: attach a job link

Composer gets a "Job" button next to the file-attach button — dropdown of jobs the sender is party to (client's own + jobs a creative has proposed on). Picking one appends a `[[job:UUID]]` marker to the message body. Renderer parses the marker inline and swaps it for a small job card (title, status, budget) that links to `/jobs/[id]`. No schema change; marker lives in the existing `messages.body` text (`lib/message-markers.ts`, `components/message-body.tsx`, `components/message-job-picker.tsx`).

## 2026-07-13 — Admin dashboard: sidebar nav + dedicated Users / Jobs / Disputes pages

The old `/admin` was one long stacked scroll with underlined "→" hyperlinks to sub-pages. Rebuilt as a real sidebar (Overview / Users / Jobs / Disputes / Cancellations / Error log) with the overview page trimmed to KPI cards + charts. Each KPI card is now a link that lights up when its count is non-zero.

New `/admin/users` and `/admin/jobs` use the same filter-chip pattern as the errors page (role chips for users; status chips for jobs) plus a title/name search. New `/admin/disputes` renders each dispute as a collapsed `<details>` card — click to reveal the reason and resolve controls, keeping the page compact when the queue grows.

## 2026-07-13 — Admin errors log: SAST timestamps + job/client/creative names + filter chips

Rows previously showed a truncated UUID and a raw ISO timestamp. Now each row surfaces: short_id + operation badge + `formatSAST()` (Africa/Johannesburg), job title (real title, batch-looked-up) with UUID stub next to it, client name, creative name (from accepted proposal, falling back to any proposal on the job), and the erroring user's name. New `lib/admin-format.ts` centralises SAST formatting and operation grouping. Filter chips (All / Payments / Payouts / Proposals & invites / Other) narrow the list without a full page rewrite. Context JSON hidden in a `<details>` so long rows don't dominate the view.

## 2026-07-13 — Admin cancellations: Pending / Resolved-history tabs

The queue only showed pending items. Added a "Resolved history" tab that lists jobs with `status = 'cancelled'` and `cancellation_resolved_by is not null`, each with the client-refund and creative-cut payout status badges so admin can see whether the money actually moved.

## 2026-07-13 — Admin cancel: trim + case-insensitive title confirm

`adminResolveCancellation` was rejecting resolves with a strict `===` compare when the DB title had a trailing space or the admin typed a different case. The confirm input is a "did you mean this" gate, not a security check — normalized both sides before comparing.

## 2026-07-13 — Private direct jobs (jobs.visibility)

New column `jobs.visibility` ('public' | 'private', default 'public') gated by a check constraint. Public queries (`/jobs`, `lib/feed.ts`) filter to `visibility='public'` so private jobs never surface on the market. `app/jobs/[id]/page.tsx` returns 404 for private jobs unless the viewer is the client or has a `job_invites` row. New `sendInviteWithNewJob` action creates a private job + invite in one submit. The invite page (`/creatives/[id]/invite`) hosts both flows: pick an existing open job, or send a fresh private job — the "Invite to job" button on the profile always shows now (no longer gated on the client having pre-existing open jobs).

## 2026-07-13 — Invite-to-job: dedicated page + fix leaked DB error

The `<details>` popup on the creative's profile was clipped inside the parent card. Replaced with a real `Link` to `/creatives/[id]/invite`. Also fixed a proposal submit that was leaking the raw Postgres error text (`duplicate key value violates unique constraint proposals_job_id_creative_id_key`) to the user — the total unique constraint blocked re-application even though the 3-attempt flow explicitly allows it. Dropped the constraint, added a partial unique index scoped to `status in ('pending','accepted')`, and wrapped the insert in `logAdminError` + `GENERIC_ERROR` so future failures surface in `/admin/errors` instead of the UI.

## 2026-07-13 — Minimum payout floor on cancellations (MWK 1,000)

Below MWK 1,000 the PayChangu transfer fee eats most or all of the money, so paying it out is theatre — recipient sees zero, platform loses fees. New `MIN_PAYOUT_MWK` in `lib/fees.ts`: any cancellation leg whose after-reserve amount falls below it skips `initiatePayout` entirely and stays with the platform. Admin queue shows exactly what happens ("payout MWK 0 — below MWK 1,000 floor — rolled to platform") and the amber warning explains why. Honest to the recipient (they'd get zero either way) and stops us burning transfer fees on dust.

## 2026-07-13 — Cancellation payout-fee reserve (flat 15% off each side)

Platform's 10% cut on a cancellation was being eaten by PayChangu's per-payout transfer fees (bank is MWK 700 flat), turning small cancellations into a loss. New rule: each side's cancellation share is reduced by a flat 15% reserve (`CANCELLATION_PAYOUT_RESERVE_PCT` in `lib/fees.ts`) before we hand it to `initiatePayout`, so PayChangu's fee comes out of the recipient's slice, not the platform's. Admin queue now shows the pre-reserve share, the reserve deducted, and the actual payout — plus a warning when either side's share is under MWK 4,700 (where 15% no longer covers the MWK 700 bank flat). Tune the constant if reality disagrees. Removed the redundant [BACKLOG.md](BACKLOG.md#payments) entry for this.

## 2026-07-13 — Admin cancellation queue: include paid top-ups in gross

The queue displayed `collection_amount_mwk || accepted_bid_mwk` as the gross to split, which ignored paid top-ups. `adminResolveCancellation` was already validating against `total_paid_mwk`, so the enforcement was correct — only the UI showed the wrong number and misleading split percentages. Switched display to `total_paid_mwk || collection_amount_mwk || accepted_bid_mwk` and added a breakdown line for top-up jobs: `(original X + top-ups Y)`. Testing Step 4 caught this: a MWK 9k job with a paid MWK 5k top-up showed "gross 9,270" instead of 14,000.

## 2026-07-13 — Top-ups locked to `payment_held`; creative fee-net line

Testing Step 4 surfaced a math problem: after `payment_released`, top-ups could still be created and paid, which meant "in escrow" numbers no longer matched what was actually held. New rule — top-ups only while `escrow_status = 'payment_held'`. `requestTopUp` and `payTopUp` both reject otherwise; the creative-side request form is hidden post-release. Tips-after-release moved to [BACKLOG.md](BACKLOG.md#payments).

While there, added a small fee-net hint on the creative's `EscrowPanel` when funds are held: "You'll receive ~MWK {net} after Ganyu's 15% fee." Uses `creativeAmount()` on `total_paid_mwk`. Client side unchanged — they think in gross, creative thinks in net.

## 2026-07-13 — Payout: round decimals + remove duplicate refresh button

`verifyPayout` was returning PayChangu's raw decimals for `amount` / `fee`. `reconcilePayout` then wrote them into the int columns `payout_amount_mwk` / `payout_fee_mwk`, which Postgres silently rejects, so `payout_status` stayed `"pending"` even though the UI toast said "Payout confirmed. Status updated to Released." Rounded both to integers, same fix already applied to `verifyPayment`. Also deleted a duplicated "Refresh payout status" JSX block in `escrow-panel.tsx`.

## 2026-07-13 — Fix job page 500 (revalidatePath during render)

`app/jobs/[id]/page.tsx` calls `reconcilePayout()` at render time to settle missed payout webhooks. `reconcilePayout` internally called `revalidatePath`, which Next 14 forbids during render — the whole page threw and users saw "Something went sideways" on any job with a pending payout. Gave `reconcilePayout` an optional `{ skipRevalidate: true }` mode; the render-path caller uses it (the page re-fetches the row right after, so revalidate is redundant there). Form-action callers in `escrow-panel` unchanged.

## 2026-07-12 — Disambiguate jobs↔proposals PostgREST embeds

Session C's new `jobs.pending_accept_proposal_id` FK created a second `jobs↔proposals` relationship, so every unqualified PostgREST embed started returning `PGRST201` and zero rows — silently on the dashboards. Pinned the three embeds in `app/dashboard/jobs/page.tsx` and `app/dashboard/proposals/page.tsx` to `!proposals_job_id_fkey`. (An earlier one-off fix on `bada1cb` handled the actions layer; this catches the read-side pages that failed later, uncovered by the E2E rerun.)

Test 5 in `client-job-flow.spec.ts` (dispute-while-scope_pending) skipped with a TODO — it was written for single-click accept, but Accept is now picker → Pay → PayChangu webhook → `scope_pending`. Belongs in the Session 3b PayChangu-sandbox bucket; un-skip when that lands and rewrite it to drive the real chain.

## 2026-07-12 — E2E spec hardening

- `login()` helper in `tests/e2e/helpers.ts` now clears cookies before navigating, so session state from one spec file can't leak into the next.
- `client-job-flow.spec.ts` fills the new required Brief (200-char min) + Deliverables fields on the post-job form.
- `postJob` action revalidates `/dashboard/jobs` on success so the just-posted row appears without a manual refresh.
- Mock Supabase (`tests/helpers/mockSupabase.ts`) now validates enum status filters and errors on bogus values — the "declined" vs "rejected" bug (below) slipped past tests before because mocks silently accepted any string.

## 2026-07-12 — Fix Session 1 cap: `declined`, not `rejected`

`proposals.status` is a real Postgres enum with values `pending | accepted | declined | withdrawn`. `submitProposal` and the job page's reapply banner filtered `.eq("status", "rejected")` — a value that doesn't exist — so `rejectedCount` was always 0 and the entire 3-attempts cap feature was inert. Fixed both call sites (`app/actions.ts:630`, `app/jobs/[id]/page.tsx:66,465`). Unit tests grew regression coverage for the enum check via the mock-hardening above.

## 2026-07-12 — Test coverage for Sessions 1/2/3

New unit tests for the server actions and cron paths introduced in Sessions 1, 2, 3a, and 3b: `tests/actions/submitProposal.test.ts`, `invites.test.ts`, `topups.test.ts`, `dispute-cancellation.test.ts`. Playwright spec `sessions-1-2-3.spec.ts` walks the happy paths for the proposal cap, direct invites, and topup request/decline live in a browser.

## 2026-07-12 — Session 3b: top-up accept-and-pay

Creative-requested top-ups are now billable. Client picks a rail on the pending request, `payTopUp` builds a PayChangu `initiatePayment` charge like the initial acceptance flow, callback + webhook routes handle both `job:<id>` and `topup:<id>` tx_refs. On success, the new `increment_total_paid` RPC atomically bumps `jobs.total_paid_mwk` by the request amount and flips the topup to `paid`. Payout math (`lib/money.ts`) reads `total_paid_mwk` with `accepted_bid_mwk` fallback.

**Migration required:** re-run `supabase/schema.sql` for the `payment_topups` table and `increment_total_paid` RPC.

## 2026-07-12 — Session 3a: top-up requests + decline

Creative side of the top-up flow. New `payment_topups` table, `requestTopUp` action (one pending per job), `withdrawTopUp` (creative), `declineTopUp` (client). Top-up UI on the job page for both parties. Dispute + cancellation transitions auto-cancel any pending topup; a 72h non-response cron ages abandoned requests to `cancelled`. Money layer respects `total_paid_mwk` for `creativeNet` and the admin cancellation split.

## 2026-07-12 — Session 2: direct client-to-creative invites

New "Invite to job" button on creative profiles (client-only). Dropdown lists my open jobs, marks already-invited ones as `(already invited)`. Invited creatives get a notification + a banner on the job page and bypass the 3-attempts cap (Session 1). New `job_invites` table + `inviteCreative` / `respondToInvite` actions.

## 2026-07-12 — Session 1: 3-attempts-per-creative proposal cap

A creative gets at most 3 declined attempts on the same job before being blocked from resubmitting (`declined | withdrawn` count; direct invites bypass). Reapply banner shows "attempt N of 3" between attempts; blocked state shows an "Only a direct invite from the client can reopen this" card. See the enum-string fix above — this feature was inert on ship day and only actually engaged after `478e575`.

## 2026-07-12 — Admin error log + user report system

- `errors` table + `sanitizeError()` helper: server actions surface a short, user-safe message and stash the raw stack + payload in `errors`.
- User-facing "Report an error" link in the footer opens a form that writes into the same table with the current URL + user id.
- `/admin` gets an Errors card listing recent entries with the raw payload one click deep.

**Migration required:** re-run `supabase/schema.sql` for the `errors` table + policies.

## 2026-07-12 — Job form: description overflow + friendlier deadline

Long briefs no longer break the layout on the job detail page (proper wrapping + max-height + scroll). Deadline picker now shows a human date ("20th of July 2026") and a "N days left" pill, and defaults to a sensible offset instead of yesterday's date.

## 2026-07-12 — Cron: hourly → daily (Hobby plan)

Vercel Hobby only allows daily crons. All hourly schedules (dispute non-response, topup expiry, deadline extensions) collapsed to a single daily cron. Semantics unchanged, just less frequent aging.

## 2026-07-12 — Session D: cancellation + deadline extensions + 72h non-response cron

Either party can request cancellation with a reason; the other party has 72 hours to accept or dispute. Creative can request a deadline extension with a proposed new date; client accepts or declines. A cron ages non-responded requests: cancellations auto-resolve, extensions auto-decline. New columns on `jobs` for pending cancellation/extension state, plus `cancellation_requests` and `deadline_extensions` tables. `adminResolveCancellation` splits escrow according to work-done proportion.

**Migration required:** re-run `supabase/schema.sql`.

## 2026-07-11 — Fee-on-top for client, fee-through for creative

Real fee capture on both rails.

- Client is charged `bid + PayChangu collection fee` at accept-and-pay. Full bid lands in escrow; fee is recorded on the job so it shows on receipts.
- Creative receives `bid − PayChangu payout fee`; payout amount and fee stored per job.
- `AcceptProposalPicker` shows a live breakdown (bid + fee = total) per rail (mobile money / bank / card).

New columns on `jobs`: `collection_rail`, `collection_amount_mwk`, `collection_fee_mwk`, `payout_fee_mwk`. Money helpers (`lib/money.ts`, `lib/fees.ts`) are now the single source of truth for both dashboards.

**Migration required:** re-run `supabase/schema.sql`.

## 2026-07-11 — Session C: payment-first acceptance

Accepting a proposal no longer instantly locks the creative in. Client picks a payment rail, the app starts a PayChangu charge, and the proposal only wins once escrow is funded (`escrow_status = payment_held`). While payment is in flight, `jobs.pending_accept_proposal_id` marks the tentative winner and both parties see a "Payment pending — this creative isn't locked in yet" card. If the payment fails or times out, the pending marker clears and other proposals stay decideable.

- New action path: `decideProposal('accepted', rail)` → `initiatePayment` → PayChangu redirect → callback/webhook finalizes.
- Errors from `decideProposal` are now surfaced verbatim on the form (the silent-failure path was hiding the real cause).
- `bada1cb` fixed a same-day PGRST201 in the actions layer caused by the new FK (a broader sweep landed as `0443041` today).

**Migration required:** re-run `supabase/schema.sql` for `jobs.pending_accept_proposal_id`.

## 2026-07-11 — Multiple saved payout methods + per-job override

Creatives can save more than one payout destination (default flagged), with a tabbed Add-method form (mobile money / bank / card; the "Type" label above the tabs was redundant, dropped). Per-job payout override lets a creative pick which saved method receives a specific release. Payout reconciliation runs automatically on `/dashboard/payments` load and via a manual button (same pattern as the collection callback).

New table `payout_methods` with RLS scoped to owner; new column `jobs.payout_method_id`.

**Migration required:** re-run `supabase/schema.sql`.

## 2026-07-11 — Prevent double-payout on Release

The Release button could fire twice under a slow network and produce two PayChangu payouts. Now: server-side lock on `jobs.payout_status` (only `none` can transition to `initiated`), UI hides the button once initiated, and the payout webhook matches by `job_id` so a duplicate charge id can't re-mark the job.

## 2026-07-10 — Release payment: creative-email lookup fixes

Three small fixes chained together:

- `295417d` — `releasePayment` was failing with "creative profile not found" because the query joined on the wrong column; corrected.
- `75f60cf` — When the lookup did fail, the error was swallowed; now the real cause bubbles up to the client for a report.
- `e451335` — `profiles` has no email column; the lookup now goes through `auth.users` (via the existing `get_user_email` RPC).

## 2026-07-10 — Payment details card for all roles + checkout prefill

The "Payment details" card on the job page used to only render for the client; creatives couldn't see the rail, fee, or status of a payment they were about to be paid from. Now visible to both parties. PayChangu checkout is prefilled with the client's saved name/phone/email to skip re-entry.

## 2026-07-10 — Wire PayChangu payouts (mobile + bank)

Payouts to the creative go out on real PayChangu rails (mobile money + bank). Server-side verify roundtrip mirrors the collection flow: initiate → poll/verify → mark `jobs.payout_status = paid`. Webhook path shares the callback dispatcher used for collections.

## 2026-07-09 — Brand logo + navbar grid alignment

Placeholder "K" swapped for the actual `G` mark. Navbar container now uses the same max-width + horizontal padding as page content, so the logo lines up with the leftmost column of the grid on every route.

## 2026-07-08 — Wire escrow collection to PayChangu sandbox

First real payment leg. Accept-a-proposal flow calls `initiatePayment` → PayChangu hosted checkout → callback lands on `/api/paychangu/callback` → server-side verify moves `escrow_status: none → payment_held`. Webhook path (`/api/paychangu/webhook`) is idempotent by `tx_ref` and covers the case where the redirect is lost. Env vars: `PAYCHANGU_SECRET`, `PAYCHANGU_PUBLIC_KEY`, `PAYCHANGU_BASE_URL`.

## 2026-07-08 — Content policy page + disclosure links

New `/policy/content` page describing what can/can't be posted (no adult, no illegal, no MLM, no harmful/dangerous services). Post-job and portfolio-add forms link to it under their submit buttons, both as click-through consent (not gating).

## 2026-07-08 — Landing category rotator

Landing hero previously listed the entire `CATEGORIES` array — 24 entries after the expansion made the column absurdly tall and pushed the search bar off-screen. Now shows 6 categories at a time in a keyed batch, cycling every 3.8s through 4 batches with a Framer AnimatePresence swap (whole batch exits together, next batch enters together, small child stagger). Hover pauses; `prefers-reduced-motion` locks to the first batch. A permanent "See all 24 →" row anchors the bottom. Same rotator serves both hero modes (client / creative).

## 2026-07-08 — Searchable CategoryPicker, deduplicated

`CategoryPicker` is now client-side with a search input and a max-height scrollable chip area, and takes an optional `name` prop (defaults to `categories`). `FiltersBar` on `/browse` and `/jobs` swapped its inline chip wall for `<CategoryPicker name="category" />` — one source of truth, same UX everywhere (onboarding, profile edit, browse filters, jobs filters). Selected chips filtered out by search are preserved as hidden inputs so they survive form submit.

## 2026-07-08 — Payments dashboard charts

Between the summary stat cards and the transactions list, two new visual cards (stack on mobile):

- **6-month bar chart** — `PeriodBarChart` reused from `admin-charts.tsx`. Released spend (clients) or payouts (creatives) grouped by the row's `created_at` month, current month highlighted in stamp-teal.
- **Escrow donut** — `OutcomeDonutChart` split by state (in escrow / released / open / disputed) with a colour-coded legend below and total MWK stamped in center.

No new deps — recharts was already installed for the admin page.

## 2026-07-08 — Portfolio item detail page rebuild

The old page rendered title + description + optional link + image grid — mostly empty when items had no images.

Now: hero band (uploaded cover image, or teal fallback with the title stamped inside), category chips + "Added" date + "View live project ↗" CTA row, two-column body with an *About this project* card + gallery grid on the left and a creator sidebar (avatar + headline + location + "View full profile" button) + project details card on the right, and a **More from `<first name>`** 4-up strip at the bottom pulling other portfolio items from the same creator. Never blank now.

## 2026-07-08 — Categories expanded to 24

`CATEGORIES` in `lib/types.ts` grew from 6 → 24 to cover the actual freelance surface: added Data & Analytics, Data Entry & Admin, Translation & Transcription, Audio & Music, Animation & Motion, IT & Networking, Product & UX, Tutoring & Training, Business & Consulting, Fashion & Tailoring, Events & Entertainment, Finance & Accounting, Legal & Compliance, Sales & Customer Support, Health & Wellness, Engineering & Architecture, Crafts & Handmade, Agriculture & Food. Original six preserved verbatim so all existing rows stayed canonical (audit-categories.mjs still clean). All consumers (CategoryPicker, FiltersBar, /jobs/new, /browse, action-layer whitelist, audit script) pick up new values automatically because they all read from `lib/types.ts`.

## 2026-07-08 — Image upload for profile cover + onboarding piece cover

- New `profiles.cover_url` column. Wide `ImagePicker` on `/dashboard/profile` bound to `cover_file`; `updateProfile` uploads to `portfolio/<uid>/cover/<uuid>.ext` (reuses existing `portfolio` bucket + RLS — no new bucket needed) and stores public URL.
- Public profile banner now renders `cover_url` as background if set, teal fallback gradient otherwise, with a bottom scrim for legibility.
- Public profile avatar renders `avatar_url` if set (was always initials before).
- White ring on the avatar circle; header block sits below banner, only avatar straddles the seam.
- "Add cover photo" pill on the public profile now correctly points at `/dashboard/profile` (was `/dashboard/account`).
- `piece_cover_url` text input in creative onboarding replaced by `<ImagePicker name="piece_cover_file" shape="wide">`; `completeCreativeOnboarding` handles the upload.
- `ImagePicker` wide-shape layout: preview full width, button stacks below (was pushed off the row into an adjacent column).

**Migration required:** re-run `supabase/schema.sql` for `profiles.cover_url`.

## 2026-07-07 — Mobile dashboard nav: native dropdown

Dashboard sidebar was a full vertical list stacked on top of content on mobile. Replaced with a native `<details>` dropdown showing the current page as the label, expanding to a vertical list of all nav items. Zero JS state; desktop (≥md) sidebar unchanged.

## 2026-07-07 — CategoryPicker restyled as chips

CategoryPicker rebuilt to render as filter-style chips matching the `/browse` filter row, so the picker on profile edit and job posting stops looking like a plain multi-select and lines up with the rest of the taxonomy UI (commit `0809734`).

## 2026-07-07 — Money layer uses accepted bid as the agreed amount

`lib/money.ts` and all downstream reads (dashboard, payments, jobs) now treat the accepted proposal's bid as the agreed amount, not the client's posted budget. Posted budget stays a hint at listing time; once a proposal is accepted the bid is the number that flows through commitment and payout math (commit `d769031`).

## 2026-07-07 — DEPLOY.md

Added `DEPLOY.md` with the required env vars, Vercel setup steps, and Supabase migration sequence so the deploy story lives outside a chat window (commit `ed5f8d7`).

## 2026-07-06 — Money source-of-truth (lib/money.ts) + MK → MWK

New `lib/money.ts` gives one place to answer "how much has the client actually spent" (released) and "how much is committed" (accepted, whether released or still held). Dashboard, `/dashboard/payments`, and job pages repointed to those helpers so numbers stop drifting across pages. Currency label switched from placeholder `MK` to `MWK` everywhere (commit `a2aeae9`).

## 2026-07-06 — Reviews loop + portfolio detail/edit + private job-file attachments

Completed jobs now prompt both sides for a 1–5 star review with an optional comment via `submitReview`; RLS locks inserts to parties of a completed job. Star average + recent reviews render on `/creatives/[id]` (replacing the fake "Response time" stat) and `/browse` cards show real stars via a per-profile rollup.

Portfolio items got a proper detail route and an edit route so creatives can manage pieces without leaving the app.

Message attachments moved off public URLs onto a private `job-files` Supabase Storage bucket, with signed URLs minted per-view (RLS scopes reads to thread participants). New `AttachmentPicker`, `MessageAttachment`, `ImagePicker`, and `MultiImagePicker` components underpin the flow. Also switched image renders to `next/image` where sane and added `tests/e2e/mobile.spec.ts` covering the newly responsive screens (commit `a2aeae9`).

## 2026-07-06 — Category taxonomy constrained to canonical six

Seed data and post/edit forms constrained to the canonical six categories (Photography renamed to Video & Photography; Content Creation added). Added audit + normalise scripts (`scripts/audit-categories.mjs`, `scripts/normalize-categories.mjs`) to detect and fix drift already in the DB (commits `a2aeae9`, `7f736ca`).

## 2026-07-06 — E2E: stable fixtures + broaden test-DB wipe

Test-DB wipe expanded to cover the new tables added since the last reseed, and Playwright fixtures reworked to hand tests a predictable starting state instead of re-deriving one every run (commit `9d9e1ee`).

## 2026-07-06 — E2E: client-job-flow aligned to Active/Open taxonomy + dispute timing

`tests/e2e/client-job-flow.spec.ts` updated for the split of Active vs Open on `/dashboard/jobs` and for the new timing on dispute raise (needs the job to have moved past `scope_pending`) so the spec matches what a real client actually does (commit `b95e25f`).

## 2026-07-02 — PRODUCT.md: document business decisions

Started `PRODUCT.md` as the durable record of business decisions that don't live naturally in code or the changelog — commission %, refund policy, category taxonomy, moderation stance, deferred pre-launch decisions (commit `129d5d6`).

## 2026-07-02 — Verify remaining status flows + fix SavingForm silent prop

Walked the remaining job status transitions live and cleared them off the test log. Fixed a bug in `SavingForm` where `silent` was being passed through to the DOM as an unknown attribute, producing a React warning on every form that used it (commit `8954ef0`).

## 2026-07-01 — Motion P1 polish

Second motion pass after the sitewide animation layer landed: entry timings tightened, hover transitions synced, and a couple of jitter cases removed on route change (commit `d6fe9e7`).

## 2026-07-01 — Brand red placeholder swapped to teal #069494

Replaced the placeholder brand red with `#069494` teal everywhere it appeared as `stamp` / brand accent — buttons, links, badges, focus rings. No structural changes, purely a token swap (commit `5f8bff7`).

## 2026-07-01 — Honor `prefers-reduced-motion` + init PRODUCT.md

Animation layer now respects the OS reduced-motion preference: transitions collapse to instant when the user has that set. Also spun up `PRODUCT.md` as a placeholder for the business-decisions record that lands the next day (commit `1594d2c`).

## 2026-07-01 — Fix RSC revalidation race + landing switcher + surface email info

Fixed an RSC race where a form action's `revalidatePath` landed before the redirect, leaving stale UI on the next page. Landing hero got a category switcher, and `SavingForm` now surfaces server-action `info` strings alongside errors so messages like "Check your inbox to confirm the new email" actually render (commit `dd1dad0`).

## 2026-07-01 — Forgot-password flow + e2e specs for untested surfaces

`/forgot-password` page + `/reset-password` page wired through `supabase.auth.resetPasswordForEmail` with `redirectTo=/auth/callback?type=recovery`. Added Playwright specs for password recovery, empty states, error pages, and other previously untested surfaces (commit `4e295d2`).

## 2026-07-01 — Portfolio analytics for creatives

Dashboard gained a Profile Insights section with four KPIs (views, saves, proposals sent, save rate) plus a small trend chart, all sourced from the `interactions` table (commit `64df767`).

## 2026-07-01 — Password recovery, proposal cap, availability, UI polish

Bundle commit covering: initial password-recovery scaffolding, the first cut of the per-job proposal cap (10/job), creative availability selector on `/dashboard/profile`, and a raft of small UI polish across cards, headers, and forms (commit `616bd5b`).

## 2026-07-01 — Recharts across admin/dashboard + sitewide animation layer + landing polish

Introduced Recharts as the charting library and used it for the admin signups/status/category charts and the dashboard's Profile Insights trend. Also added a sitewide animation layer (page/route transitions, card pop on hover, subtle motion primitives in `components/animated.tsx`) and another pass of landing-page polish (commit `b780bd9`).

## 2026-06-30 — White theme, Inter font, dual-mode hero, payments scaffold, seed script

Broad visual reset: white theme, Inter typeface, dual-mode landing hero (creative-first / client-first switcher). Payments got its first scaffold — dashboard route, currency helpers, and the shape of what a real integration would populate. `scripts/seed.mjs` added so a fresh DB can be brought to a demo state without hand-clicking (commit `2eddaeb`).

## 2026-06-29 — Editorial redesign (Ganyu Press): landing, dashboard, profile, messages

Three commits landed together as an editorial visual system:

- **Ganyu Press landing** and editorial dashboard — full-bleed hero, magazine-style typography, tabbed dashboard replacing the flat stack (commit `34575d8`).
- **Sticky nav** on every route, editorial rework of the public profile and the messages surface, and the full-bleed hero polished for real content (commit `09612d8`).
- **Profile-completeness gate** blocking creatives from being public until they have a bio, at least one portfolio piece, and a service; card-pop hover motion applied across creative + job cards; new **admin shell** so the admin routes render inside their own layout instead of the dashboard (commit `02c73a0`).

## 2026-06-28 — Dispute resolution flow (P1)

A real dispute path with context, not a one-click status flip.

- New `jobs.dispute_reason`, `jobs.dispute_raised_by`, `jobs.dispute_raised_at` columns.
- New server action `raiseDispute` — requires a written reason (10+ chars), validates the job is in a disputable state (`scope_pending`, `in_progress`, `submitted`, `revision_requested`), flips status to `disputed`, notifies the other party **and every admin** via in-app + email.
- New `<DisputePanel>` on the job detail page — collapsible "Flag a dispute" with textarea, replacing the bare "Flag dispute" button in the status panel (which silently bypassed the reason).
- New `<DisputeBanner>` shown to both parties (and admins) when status = `disputed`, displaying the raised reason.
- `/admin` disputed queue now shows the reason inline and sorts by `dispute_raised_at` desc.
- `updateJobStatus` no longer accepts `disputed` — all disputes route through `raiseDispute`.

**Migration required:** re-run `supabase/schema.sql` for the three new columns.

## 2026-06-28 — Contract / scope confirmation (P1)

Both sides agree on what's being delivered before work starts — kills most disputes at the source.

- New `scope_pending` job status. `decideProposal('accepted')` now flips the job here instead of jumping straight to `in_progress`.
- New `jobs.scope_summary`, `jobs.client_confirmed_scope_at`, `jobs.creative_confirmed_scope_at` columns.
- New server action `confirmScope` — client writes/edits the scope summary; both parties confirm. Editing the summary after the creative confirmed resets their confirmation. Once both sides confirm, the job auto-flips to `in_progress`.
- New `<ScopeConfirmPanel>` on the job detail page — visible to both sides while status = `scope_pending`. Shows summary, both confirmation checkmarks, role-specific CTA.
- Status panel extended: client can cancel during `scope_pending`; either party can dispute.
- Notifications + emails fired on each confirmation and on the final flip to `in_progress`.

**Migration required:** re-run `supabase/schema.sql` for the new enum value and three columns.



## 2026-06-26 — Admin dashboard (P1)

Basic moderation surface so the marketplace can actually be policed.

- New `profiles.is_admin` boolean column. Mark someone admin via SQL: `update profiles set is_admin = true where id = '<uuid>'`.
- New SQL function `public.is_admin(uuid)` — security-definer; basis for admin RLS.
- New `jobs.hidden_at` column — admins can soft-hide jobs from public listings (`/jobs` query now filters `hidden_at IS NULL`).
- New policy `jobs update by admin` — admins can write to any job (used by dispute resolution + hide).
- New page `/admin` — stats (users, jobs, open, disputed), disputed-jobs queue with one-click "Resolve as completed / cancelled", recent jobs with hide/unhide, recent users.
- New actions: `adminResolveDispute`, `adminHideJob`. Resolve fires notifications + emails to both parties.
- `<UserMenu>` shows an **Admin** link when `profile.is_admin` is true.

**Migration required:** re-run `supabase/schema.sql` for the new columns, function, and policy. Then `update profiles set is_admin = true where id = '<your-uuid>'` to give yourself the link.

## 2026-06-26 — Client onboarding (P1)

Two-step setup so new clients aren't dropped onto an empty dashboard.

- New page `/onboarding/client` — name/company, headline, bio, hire categories, optional "post my first job now" radio
- New server action `completeClientOnboarding` — stamps `onboarded_at`; redirects to `/jobs/new` if they picked yes, otherwise to `/dashboard`
- Dashboard redirect now sends un-onboarded users to `/onboarding/client` or `/onboarding/creative` by role

## 2026-06-26 — Rate card replaces hourly rate

Malawi works per-service, not per-hour. The platform now reflects that.

- `services` table wired up (was unused). Added `price_mwk_max` for range pricing. `price_mwk` now nullable so old rows don't block migration.
- New page `/dashboard/services` — manage your rate card: add, edit-via-add, delete
- New actions: `upsertService`, `deleteService`, `requestCustomService`
- Public creative profile (`/creatives/[id]`) now shows the rate card. Falls back to a "no services yet" hint.
- New **"Don't see what you need?"** section on creative profiles — clients submit a custom request, it opens a message thread with the creative, fires a notification + email
- Onboarding step 3 swapped from "hourly rate" to "first service"
- Hourly rate field removed from the profile editor (column kept in DB to avoid losing existing data)
- Services tile added to dashboard + user menu

## 2026-06-26 — Creative onboarding (P1)

Guided 3-step setup so new creatives don't land on a blank profile and bounce.

- New `profiles.onboarded_at` column — null until they finish onboarding
- New page `/onboarding/creative` — single form with 3 sections: identity (headline, bio, categories, skills), first portfolio piece, hourly rate
- New server action `completeCreativeOnboarding` — saves profile, inserts the first portfolio item, stamps `onboarded_at`, redirects to dashboard
- Dashboard redirects creative + agency users with `onboarded_at = null` to the onboarding flow

**Migration required:** re-run `supabase/schema.sql` for the new column.

## 2026-06-26 — Landing & nav refresh

- Landing hero: new "Browse jobs" CTA next to "Browse creatives"
- Category section now has a "Types of creatives" heading and a 5-column grid
- New "Content Creation" category added to `CATEGORIES`
- Navbar: new `<UserMenu>` dropdown (avatar + name) on the right, replaces the inline Sign out button and the Dashboard link. Inside: Dashboard, Account & security, Edit profile, Portfolio, Jobs, Proposals, Saved, Messages, public profile, sign out.
- Primary nav (Browse creatives / Browse jobs) now shows from `sm:` instead of `md:` so it survives more screen widths.
- Account page: new "Security" card lets users change their password (via new `updatePassword` action).

## 2026-06-26 — Escrow state (manual) (P0)

Manual escrow tracking — real money rails come later, but the trust layer exists now.

- New `escrow_status` enum: `none`, `payment_held`, `payment_released`, `payment_disputed`
- New `jobs.escrow_status` column, default `none`
- New server action `updateEscrowStatus` — client-only, with transition guards (none → held → released | disputed, etc.)
- New `<EscrowPanel>` on the job detail page — visible to both sides, action buttons only for the client
- Creative gets a notification + email on every payment-state change

**Migration required:** re-run `supabase/schema.sql` for the new enum and column.

## 2026-06-26 — Auto-refresh + lifecycle polish

- New `<JobRealtime>` client component subscribes to `jobs` + `proposals` for the open job, calls `router.refresh()` on updates (+ 10s polling fallback) — fixes the "page goes stale until I reload" problem
- `decideProposal` now revalidates the specific job page so the creative sees the accepted state without manual refresh
- `/dashboard/jobs` split into **Active jobs** and **Completed jobs** sections (both posted and engagements)
- Job completion notification rewritten to specifically nudge the creative to add the work to their portfolio
- New portfolio-add prompt on the job page when status is `completed` (creative side only) — pre-fills title from the job

## 2026-06-25 — Job status lifecycle (P0)

Real job states with guarded transitions, so both sides can track progress.

- `job_status` enum extended: `submitted`, `revision_requested`, `disputed` (kept existing `open`, `in_progress`, `completed`, `cancelled`)
- `decideProposal('accepted')` now auto-flips the job to `in_progress`
- New server action `updateJobStatus(formData)` with role + transition guards:
  - Creative: `in_progress → submitted`, `revision_requested → submitted`, any active → `disputed`
  - Client: `submitted → completed | revision_requested`, `open → cancelled`, any active → `disputed`
- New `<JobStatusPanel>` on job detail page — role-aware action buttons + status display
- Status badge near job title on the detail page
- Each transition fires an in-app notification + email to the other party

**Migration required:** re-run `supabase/schema.sql` for the three new enum values.

## 2026-06-25 — Email notifications via Resend (P0)

Transactional emails alongside the existing in-app notifications.

- New `lib/email.ts` — Resend wrapper with `sendEmail({to, subject, heading, body, ctaText?, ctaPath?})`, simple HTML template, missing-key + send-failure resilience (logs and moves on, never throws into the action)
- New SQL function `public.get_user_email(uid)` — security-definer lookup so server actions can resolve recipient emails without the service role key
- `submitProposal`, `decideProposal`, `sendMessage` now fire one email per event, after the in-app notification insert
- New env vars: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `APP_URL`

**Migration required:** re-run `supabase/schema.sql` for the `get_user_email` function.

**Sender:** using Resend's sandbox `onboarding@resend.dev` until a domain is verified. Replies route to `EMAIL_REPLY_TO`.

## 2026-06-25 — In-app notifications (P0)

Realtime notification layer so the platform stops being a silent dead drop.

- New schema: `notifications` table, `notification_kind` enum (`proposal_received`, `proposal_accepted`, `proposal_declined`, `message_received`), RLS scoped to owner, added to `supabase_realtime` publication
- Notifications inserted from `submitProposal`, `decideProposal`, `sendMessage`
- New server actions: `markNotificationRead`, `markAllNotificationsRead`
- New `<NotificationBell>` client component in the navbar — unread badge, dropdown, "mark all read", live-updating via Supabase Realtime channel `notifications:<user_id>`
- Each notification links to the relevant job or message thread

**Migration required:** re-run `supabase/schema.sql` in the Supabase SQL editor before testing.

**Known limitation:** end-to-end notification delivery observed at ~30s during smoke testing — acceptable for MVP, tracked in [`BACKLOG.md`](BACKLOG.md) for follow-up.

## 2026-06-24 — Save/bookmark + For You + Trending feed (`69e4084`)

The social-feed layer on top of the marketplace.

- New schema: `interactions`, `saved_items`, and a `trending_items` RPC
- Heart/save button on every creative + job card and detail page
- New `/dashboard/saved` page listing saved creatives and jobs
- Dashboard now shows two role-aware rails:
  - **For You** — clients see creatives, creatives see jobs (matched by category)
  - **Trending this week** — most-viewed in the last 7 days
- Detail pages record view interactions, feeding Trending and future personalization
- New server actions: `toggleSave`, `recordView`
- New helper module `lib/feed.ts`

## 2026-06-24 — Search + filters on /browse and /jobs (`479aa2c`)

URL-driven filtering on both browse pages.

- New `<FiltersBar>` component (text search, multi-select categories, skills tag input, price range, sort)
- `/browse` filters creatives by name/headline/bio match, category overlap, skill overlap, hourly-rate range
- `/jobs` filters open jobs by title/brief match, category, budget range
- Filters are URL params, so results are shareable and back/forward work
- Result count and Clear button on both pages

## 2026-06-24 — Initial MVP scaffold (`2695603`)

The full working marketplace MVP — 46 files, end-to-end loop.

- Next.js 14 (App Router) + TypeScript + Tailwind + shadcn-style UI primitives
- Supabase: Postgres schema with 8 tables, enum types, auto-profile trigger, full RLS policies
- Auth: signup, login, OAuth callback, signout
- Public browse of creatives + creative profile pages with portfolios
- Job posting, proposals (submit / accept / decline)
- Messaging threads with send-message
- Dashboard: profile editor, portfolio manager, proposals (sent + received)
- Server actions for every mutation
- SSR-safe Supabase clients + session-refresh middleware
