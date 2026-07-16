# Ganyu Hub - Development Roadmap

> Internal dev doc for Claude Code sessions. Last updated: 2026-07-16 (Plausible analytics)

---

## Project Status

MVP is running in production. Full payment loop (collect → hold → release → cancel + refund) is live via PayChangu sandbox and confirmed end-to-end.

- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind, Supabase (Postgres, Auth, Storage), PayChangu (payments), Resend (email)
- **What works:** auth, profiles, portfolios, public + private job posting, proposals (3-attempt cap + invite-bypass), messaging (with job-link attachments), search, filters, save/bookmark, For You feed, Trending feed, PayChangu escrow collect/release/top-up/cancel with fee-reserve + payout floor, admin dashboard (sidebar nav with Users / Jobs / Disputes / Cancellations / Errors).
- **6-step manual test plan:** ✅ 6/6 cleared 2026-07-13. Merged `sandbox-test → main` (cbc0c33).
- **What is missing:** Resend domain verification (still blocks emails to non-owner addresses); the ⬜ list in TEST_LOG.md (search boxes, saved items round-trip, recordView populating interactions, empty states, image uploads for portfolio/avatars).

---

## Priority Task Board

Work through these in order. Do not skip to P1 while P0 items are open.

### P0 - Critical (Blocking Real Usage)

| Task | Status | Notes |
|------|--------|-------|
| In-app notifications: notify creative when proposal accepted/declined; notify client when proposal received | DONE 2026-06-25 | Supabase Realtime + 15s polling fallback. ~30s end-to-end latency observed — tracked in BACKLOG.md. |
| Email notifications: transactional emails for key events (proposal, hire, message) | DONE 2026-06-25 | Resend. Sandbox sender (`onboarding@resend.dev`) until a domain is verified. |
| Job status lifecycle: add states - in_progress, revision_requested, submitted, completed, disputed | DONE 2026-06-25 | Enum extended; `updateJobStatus` with role + transition guards; `<JobStatusPanel>` UI on job detail. Auto-flips to in_progress on accept. |
| Escrow state: add payment_held, payment_released, payment_disputed states even before real payment rails | DONE 2026-06-26 | `escrow_status` enum + column on jobs. `updateEscrowStatus` action with transition guards. `<EscrowPanel>` on job detail page — client-only controls. Manual flow until real rails. |

### P1 - High Priority

| Task | Status | Notes |
|------|--------|-------|
| Creative onboarding flow: guided 3-step setup on first login (add bio, upload portfolio piece, set rate) | DONE 2026-06-26 | `/onboarding/creative` page + `completeCreativeOnboarding` action + `onboarded_at` column. Dashboard redirects un-onboarded creatives/agencies. |
| Client onboarding flow: guided setup (company name, what they need, first job prompt) | DONE 2026-06-26 | `/onboarding/client` + `completeClientOnboarding` action. Dashboard redirect routes un-onboarded users by role. |
| Contract/scope confirmation: both parties confirm agreed scope before work starts | DONE 2026-06-28 | New `scope_pending` status between accept and in_progress. `<ScopeConfirmPanel>` + `confirmScope` action. Editing summary after creative confirms resets their confirmation. |
| Dispute resolution flow: add disputed state, admin review queue, resolution actions | DONE 2026-06-28 | `raiseDispute` action with required reason. Banner on job page; admin queue shows reason + raised-at. Admins notified on dispute raised. |
| Admin dashboard: view all users, jobs, proposals, flag/remove content, resolve disputes | DONE 2026-06-26 | `/admin` with stats, disputed queue (resolve as completed/cancelled), recent jobs (hide/unhide), recent users. Gated on `profiles.is_admin`. |

### P2 - Medium Priority

| Task | Status | Notes |
|------|--------|-------|
| Mobile money payment integration: Airtel Money or TNM Mpamba (whichever API approves first) | DONE 2026-07-10 | Shipped via PayChangu (mobile money + bank + card). Escrow collection wired 2026-07-08 (`ae1d585`); payouts wired 2026-07-10 (`283e6fd`); fee-transparency 2026-07-11 (`5b29eb5`); Session C payment-first accept 2026-07-11 (`c877106`); Session 3b top-up accept-and-pay 2026-07-12 (`9b8cebf`). Manual sandbox checkout still needed to un-skip E2E test 5. |
| UX/UI refresh: improve visual design, spacing, typography, color system | DONE 2026-07-01 | Full editorial redesign — Recharts across admin + user dashboards, animation layer (stagger, count-up, chip morph, heart bounce, dispute reveal, toasts), notification panel redesign, filter click-highlight fix, keyboard focus, empty states, 404/error pages, signup silent-error fix, password recovery flow. |
| Proposal limit per job: cap proposals a client receives to avoid overwhelm | DONE 2026-07-01 | `jobs.proposal_limit` (default 10). `submitProposal` guard rejects at cap. Job detail shows counter and swaps form for "job full" card when at limit. |
| Creative availability status: available now, busy, not taking work | DONE 2026-07-01 | `availability_status` enum + `profiles.availability`. Selector at `/dashboard/profile` (creative/agency only). Colored dot on avatar in creative cards. |

### P3 - Post-Traction

| Task | Status | Notes |
|------|--------|-------|
| Skill verification badges: manual or test-based verification layer | WON'T SHIP 2026-07-01 | Conflicts with platform ethos — portfolio IS the credential; no degree/cert gatekeeping. |
| Featured/boosted listings: paid placement for creatives | MOVED TO BACKLOG 2026-07-01 | Blocked on mobile-money integration. Captured under BACKLOG.md → Monetisation. |
| Portfolio analytics: views, saves, proposal conversion for creatives | IN PROGRESS 2026-07-01 | Reuses `interactions` table; chart on `/dashboard`. |
| International card payments: Stripe/Paystack/Flutterwave | MOVED TO BACKLOG 2026-07-01 | Phase 2. Local mobile money first. Captured under BACKLOG.md → Monetisation. |

---

## What Is Already Shipped

Do not rebuild these. They exist and work.

### Authentication and Profiles
- Signup, login, OAuth callback, signout
- Auto-profile trigger on user creation
- Client / creative / agency role separation
- Profile editor in dashboard

### Marketplace Core
- Public browse of creatives with profile pages
- Portfolio: project case studies, images, links, descriptions
- Job posting and job browse pages
- Proposal submission, accept, decline
- Messaging threads between client and creative

### Discovery Layer
- Search and filters on /browse and /jobs (URL-driven, shareable)
- FiltersBar: text search, multi-select categories, skills tags, price range, sort
- For You feed: clients see creatives, creatives see jobs (matched by category)
- Trending this week: most-viewed in last 7 days
- Save/bookmark on every creative and job card
- /dashboard/saved page

### Data Layer
- Supabase Postgres: 8 tables, enum types, RLS policies
- interactions, saved_items, trending_items RPC
- toggleSave, recordView server actions
- lib/feed.ts helper module

---

## Open Business Decisions

These are not code tasks. Make these decisions before building the features they affect.

### Commission Rate
- Upwork charges 10%. Fiverr charges 20%.
- Malawian market is price-sensitive. Start at 10% and test.
- Affects how you structure the escrow release calculation.

### Currency Display
- MWK only at launch, or dual MWK/USD from day one?
- Recommendation: dual display from day one. USD anchors value perception for international clients.

### KYC Requirements
- Required to receive payouts? Optional verified badge? Required only for international payouts?
- Recommendation: require basic KYC (name and phone) for payouts. Full ID verification as optional badge.

### Content Policy
- What is not allowed on the platform?
- Minimum: no adult work, no illegal services, no fake reviews, no off-platform payment requests.

### Subscription Tiers for Creatives
- What is free vs. paid?
- Suggested: free tier gets 3 proposals/month. Paid tier gets unlimited and featured placement.

---

## Supply Seeding Plan

This is not optional. A marketplace with no creatives is a form with no fields.

### Target: 10 Creatives Before Any Public Launch
- You already know 5 people. Call them this week.
- Sit with each one and load their profile manually if needed.
- Get at least 2 portfolio pieces per creative live before you show a client.
- Aim for at least 2 categories covered: design and development minimum.

### What Each Seeded Creative Needs
- Profile photo, bio, skills list, hourly rate or project rate
- At least 2 portfolio pieces with images and descriptions
- At least 1 service listing
- A direct WhatsApp or contact link as backup (trust signal at launch)

---

## Claude Code Session Instructions

Paste this block at the start of every Claude Code session:

```
PROJECT: Ganyu Hub - Malawian creative services marketplace
STACK: Next.js 14 App Router, TypeScript, Tailwind, Supabase
STATUS: MVP running locally. Core loop done. Working on [INSERT CURRENT TASK].
TODAY'S TASK: [PASTE ONE TASK FROM THE P0/P1 LIST ABOVE]
```

### Rules for Every Session
- One task per Claude Code session. Do not context-switch mid-session.
- Always ask Claude Code to write the Supabase migration first, then the server action, then the UI component. In that order.
- After each task, update the status in this document and commit with a descriptive message.

---

## What to Build Next (Right Now)

**Manual PayChangu sandbox top-up.** All that's blocking the Session 3b E2E tests 2–5 and the skipped dispute test in `client-job-flow.spec.ts` is one hand-driven checkout on PayChangu's sandbox. Complete that, then un-skip the test and re-run.

Then: run the pending `payment_topups` + `increment_total_paid` migrations in Supabase Studio (bottom of `supabase/schema.sql`), and verify Session D live via a 4-login walkthrough.

---

## Backlog — Proposal & Payment Enhancements (2026-07)

**All sessions shipped 2026-07-12 (S1, S2, S3a, S3b) plus Session C (payment-first accept, 2026-07-11) and Session D (cancellation + deadline extensions + 72h cron, 2026-07-12). Details in CHANGELOG.md.** Kept below as historical spec.

### Session 1 — 3-attempts-per-creative proposal cap — DONE 2026-07-12 (`0ee56fd`, cap-string bug fixed in `478e575`)
- **Schema:** none. Reuse `proposals` (`job_id`, `creative_id`, `status`).
- **Logic:** in `submitProposal`, count existing `status='rejected'` proposals for `(job_id, creative_id)`. If ≥3, reject: "You've used all 3 attempts on this job."
- **Rule:** only `rejected` counts. `withdrawn` and `accepted-then-cancelled` do not.
- **UI:** proposal form shows "Attempt N of 3"; blocked-state card explains the cap and points to inviting-only path.

### Session 2 — Direct invites (bypasses cap) — DONE 2026-07-12 (`637cb97`)
- **Schema:** new table `job_invites (id, job_id, creative_id, from_client_id, message, created_at, responded_at, status: pending|accepted|declined)` + partial unique `(job_id, creative_id) where status='pending'`. RLS: client can insert for own jobs; creative can read/update own row.
- **Actions:** `inviteCreative(jobId, creativeId, message)`, `respondToInvite(inviteId, accept)`.
- **UI:** "Invite to job" button on creative profile (client picks from own open jobs). Creative sees notification + banner on job page. Submit-path in Session 1's cap logic exempts creatives with a `pending`-or-`accepted` invite.

### Session 3 — Incremental payment top-ups — DONE 2026-07-12 (3a: `25207fa`, 3b: `9b8cebf`)
- **Schema:**
  - New table `payment_topups (id, job_id, requested_by_creative_id, amount_mwk, reason, status: pending|paid|declined|cancelled, payment_ref, payment_provider_id, created_at, responded_at)`.
  - Add `jobs.total_paid_mwk integer` — backfill = `budget_mwk` for existing rows on migration.
- **Field naming decision (locked):**
  - `budget_mwk` = immutable original accepted bid (historical/display).
  - `total_paid_mwk` = cumulative cleared escrow (original + all paid top-ups).
  - All money-movement code paths read `total_paid_mwk`. Audit list must be swept in this session:
    - `updateEscrowStatus` release branch → `creativeNet(total_paid_mwk, rail)`
    - `adminResolveCancellation` → validate `refund + cut ≤ total_paid_mwk`
    - Cancellation queue admin UI display
    - `EscrowPanel` "held" display
    - Financial report sums
    - Client dashboard "In Escrow" stat
  - Explicitly still reads `budget_mwk` (do not change): job cards, proposal-form defaults, "original vs final" analytics.
- **Cancellation × top-up rule (Session D collision, locked):**
  - Split applies to `total_paid_mwk`, not `budget_mwk`.
  - Admin cancellation queue must render a breakdown line: `original X + topup#1 Y + topup#2 Z = total_paid_mwk`.
  - `adminResolveCancellation` validates `refund + cut = total_paid_mwk` (was `= budget_mwk`).
  - Any `payment_topups` row with `status='pending'` at cancellation-request time is auto-cancelled so the client isn't charged while a dispute is pending.
- **Dispute × top-up rule (locked):**
  - Same rule extends to `disputed`. Any transition into `disputed` (via `raiseDispute`, admin action, or the `non-response-check` cron 72h auto-flag) auto-cancels all `payment_topups` rows with `status='pending'` for that job.
  - Notify the creative: "Your pending top-up on X was cancelled because the job entered dispute. You can re-request after resolution if the job resumes."
  - The `non-response-check` cron gets one extra query alongside the status flip.
- **Actions:** `requestTopUp(jobId, amount, reason)` (creative, job must be `in_progress|revision_requested`), `declineTopUp(id)` (client), `payTopUp(id)` → PayChangu checkout with `meta.topup_id`.
- **Webhook/callback:** `/api/paychangu/callback` and `/api/paychangu/webhook` detect `meta.topup_id`, mark topup `paid`, `UPDATE jobs SET total_paid_mwk = total_paid_mwk + amount WHERE id = topup.job_id`.
- **UI:** on job page during in-progress states — creative "Request additional payment" form; client sees pending topups with Accept (→ payment) / Decline; history of past topups shown to both.
- **Split-session note:** if diff gets loud, split into 3a (schema + request/accept UI + `total_paid_mwk` sweep) and 3b (PayChangu integration + release-payout math).

### Sequencing
- Sessions 1 & 2 can proceed in either order.
- Session 3 does not start until the two prereq answers above are considered locked (they are — this doc is the record).

