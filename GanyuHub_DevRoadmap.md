# Ganyu Hub - Development Roadmap

> Internal dev doc for Claude Code sessions. Last updated: 2026-07-01

---

## Project Status

MVP is built and running locally. Core marketplace loop exists.

- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind, Supabase (Postgres, Auth, Storage)
- **What works:** auth, profiles, portfolios, job posting, proposals, messaging, search, filters, save/bookmark, For You feed, Trending feed
- **What is missing:** payments, notifications, onboarding flow, dispute resolution, admin dashboard, job status tracking, contract confirmation

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
| Mobile money payment integration: Airtel Money or TNM Mpamba (whichever API approves first) | BLOCKED | Waiting on API approval. Wire up the abstraction layer now so plugin-in is fast. |
| UX/UI refresh: improve visual design, spacing, typography, color system | DONE 2026-07-01 | Full editorial redesign — Recharts across admin + user dashboards, animation layer (stagger, count-up, chip morph, heart bounce, dispute reveal, toasts), notification panel redesign, filter click-highlight fix, keyboard focus, empty states, 404/error pages, signup silent-error fix, password recovery flow. |
| Proposal limit per job: cap proposals a client receives to avoid overwhelm | DONE 2026-07-01 | `jobs.proposal_limit` (default 10). `submitProposal` guard rejects at cap. Job detail shows counter and swaps form for "job full" card when at limit. |
| Creative availability status: available now, busy, not taking work | DONE 2026-07-01 | `availability_status` enum + `profiles.availability`. Selector at `/dashboard/profile` (creative/agency only). Colored dot on avatar in creative cards. |

### P3 - Post-Traction

| Task | Status | Notes |
|------|--------|-------|
| Skill verification badges: manual or test-based verification layer | NOT STARTED | Not needed at launch. |
| Featured/boosted listings: paid placement for creatives | NOT STARTED | Only valuable when there is supply to boost. |
| Portfolio analytics: views, saves, proposal conversion for creatives | NOT STARTED | Nice-to-have once creatives are active. |
| International card payments: Stripe/Paystack/Flutterwave | NOT STARTED | Phase 2. Local mobile money first. |

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

**In-app notifications.** That is the first P0. Start there.

Supabase Realtime can handle this without a third-party service. Paste the context block above into Claude Code and say:

> "Build in-app notifications using Supabase Realtime. Notify the creative when a proposal is accepted or declined. Notify the client when a new proposal is received. Add a notification bell to the navbar with an unread count and a dropdown list."

That is your next session.
