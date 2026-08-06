# Ganyu Hub - Development Roadmap

## Versioning policy (set 2026-08-05)

**`v1.0.0` is reserved for the public launch — nothing else ever ships as 1.0.**
Everything between now and going public stays in the `0.x` range. Only when the
app goes public does the version become `1.0.0`.

Two version strings, kept in lockstep:

- **Human-facing** (footer version badge `lib/whats-new.ts`, roadmap, CHANGELOG)
  uses a **four-number** scheme: `0.8.0` → `0.8.1` → `0.8.1.2` → `0.9.0` … Add
  decimals freely.
- **`package.json` `version`** must stay **valid 3-part semver** (npm/Vercel
  reject a 4th number) — use the nearest 3-part, so badge `0.8.1.2` → package
  `0.8.1`.

Bump both on each shipped change. Public launch = `1.0.0` in both.

> Internal dev doc for Claude Code sessions. Last updated: 2026-08-06 (JOB PAGE SHARE ROW: moved `ShareButtons` out of the `Posted by … · 2h ago` byline strip (metadata mixed with an action) to the FOOT of the Project brief card, under the budget/deadline/revisions/format `<dl>`, behind a divider and labelled "Share this job"; `sm:ml-auto` right-aligns on desktop, stacks left on mobile. Byline strip's flex/justify-between collapsed to a plain `<p>` once it had one child. Consistent with the creative-profile card change. `next build` clean (42/42 static pages), tsc clean, 57/57. Earlier same-day: **BUG-008 VERIFIED FIXED IN PROD** — Copy/share buttons work on `/creatives/[id]`; the unpinned-formatter hydration mismatch WAS the cause. Moved to Fixed in BUG_LOG. Both open bugs (007 + 008) are now closed. Also reordered the creative-profile hero: Message / Invite to job / save / share moved from top-right (competing with the name) to the FOOT of the card below the category chips, behind a divider; share `sm:ml-auto` so it right-aligns on desktop and stacks left on mobile; the old flex wrapper collapsed to `relative z-10` once it had one child. `next build` clean, tsc clean, 57/57. Earlier same-day: BUG-008 LEAD — FORMATTERS PINNED: all of `lib/utils.ts` formatted with the RUNTIME DEFAULT locale/timezone. Vercel = UTC, users = Malawi UTC+2 ⇒ server and browser render different strings ⇒ React discards hydration for the whole subtree ⇒ every button inside dies. Route split matches the bug exactly: `/jobs/[id]` (formatMwk+timeAgo+formatDeadline+daysUntil) and `/creatives/[id]` (formatMwk+timeAgo) were dead; `/login` uses NONE of them (grep 0) and hydrated fine. Fixed: pinned `LOCALE="en-GB"` + `TZ="Africa/Blantyre"`, new `formatDate`/`formatMonthYear` helpers, `daysUntil` now computes today in Malawi, `formatMwk` off the ICU-unreliable `en-MW`. New `tests/utils-format.test.ts` runs every formatter under 4 hostile timezones (suite 50→**57**). ⚠️ NOT confirmed as THE cause — original report saw no console error and React usually logs mismatches loudly; needs a prod Copy-button click-test. Fix is correct regardless (wrong day shown to all users pre-midnight). Earlier same-day: WALLET BACKLOGGED: creative balance + batched withdrawals logged under BACKLOG.md → Payments, with the full `required % = 1.5% + (700 / min payout)` derivation. It's the only route to a genuinely flat payout percentage — batching pays the bank's flat 700 once per WITHDRAWAL instead of once per job, so average size rises and ~3% covers it. Explicitly NOT now: needs volume, a ledger model decided up front (immutable rows, never a mutable balance column), and its own session. Payout fee stays `2% + MWK 700` bank / `2%` mobile. Earlier same-day: PAYOUT FEE DECIDED: `PAYOUT_RATE = 0.02` both rails, bank KEEPS `flat: 700` (was mobile 1.8%/0, bank 1.5%/700). A pure percentage can never cover a flat cost — break-even vs the real `1.5%+700` is MWK 140k at 2% / MWK 70k at 2.5%, and real bids are 1k–50k, so flat-only would lose money on every bank payout. New `tests/fees.test.ts` (8 cases, suite 42→**50**) asserts bank fee ≥ real cost across 1k–500k plus a regression guard on `PAYOUT_RATES.bank.flat === 700` so the flat fee can't be simplified away. Copy updated in `/how-money-works` + `PricingExplainer` (both read the constant). `CANCELLATION_PAYOUT_RESERVE_PCT` comment corrected: 15% covers bank down to ~MWK 5,400 (was ~4,700). Earlier same-day: PAYMENTS UX: collection fee flattened to a single `COLLECTION_RATE = 0.03` for ALL rails (was 3/3/2 — bank was cheaper); the quote happens BEFORE the client picks a method on PayChangu's page, so a per-rail number implied a choice that hadn't happened. Display-only change — raw amount still goes to PayChangu, real fee lands in `collection_fee_mwk`. New `components/ui/select.tsx` (styled native select matching Input: height/border/radius/brand focus ring, appearance-none + inline SVG chevron) wired into the top-up "Pay with" field + money calculator. Fixed raw `"EXTRA_REVISION|"` token leaking into the top-up panel UI → now reads "Extra revision" with the note quoted below only when non-empty (DB value untouched; callback/webhook still parse the marker). Calculator dropped its collection-rail selector (uniform rate = nothing to pick); payout rail kept (bank's flat MWK 700 is a real difference). **⚠️ OPEN DECISION — PAYOUT FEE:** a flat percentage can NEVER cover bank's `1.5% + MWK 700`; break-even is MWK 140k at 2%, MWK 70k at 2.5%, and real bids are 1k–50k, so both lose money on every bank payout. Recommended `2% mobile / 2% + MWK 700 bank`. `PAYOUT_RATES` left unchanged until decided. tsc clean, 42/42. Earlier same-day: **BUG-007 VERIFIED FIXED IN PROD** — paid revision overage now reaches PayChangu checkout (job `a84be0b1…`), proving the `payment_topups` service-role insert clears RLS; fix was `e88d527`, moved from In Progress to Fixed in BUG_LOG. Verified with ZERO money: the insert precedes `initiatePayment`, so reaching checkout is proof. Remaining untested: `revisions_used` 1→2 on a cleared payment (webhook leg, needs test keys). Earlier same-day: PREVIEW CALLBACK HOST: `lib/payments.ts` `siteUrl()` now prefers `https://$VERCEL_URL` when `VERCEL_ENV==="preview"` — `NEXT_PUBLIC_SITE_URL` is set in every Vercel env, so previews were sending PayChangu's callback/return URLs to PRODUCTION (a test payment would settle the live deploy). Unblocks a Preview env with PayChangu **test keys** (test keys → Preview+Development, live keys → Production only; no manual swapping). Prod path unchanged. NOTE FOR TESTING: there is no "accepted but unpaid" state — `decideProposal` only pins the winner (`pending_accept_proposal_id` + `escrow_status=payment_pending`); `promotePendingAcceptance()` flips the proposal to accepted + job to `in_progress` ONLY from the verified callback/webhook. So revision/overage testing needs either a settled payment, the `TEST_MODE_SKIP_PAYCHANGU_VERIFY` local bypass, or stamping the post-payment columns in Studio. BUG-007's RLS fix can be verified with NO money: reaching PayChangu checkout at all proves the `payment_topups` insert succeeded, since the insert precedes `initiatePayment`. Earlier same-day: MONEY GUIDE + ONCE-PER-USER GUIDANCE: new public page `/how-money-works` (`app/how-money-works/page.tsx`) — 4 escrow steps, "who charges what" table (provider vs. us), 4 FAQs, plus a LIVE calculator `components/money-calculator.tsx` (price + collection rail + payout rail → what the client is charged AND what lands in the creative's account; all figures via lib/fees.ts so they can't drift). Fixed two checklist bugs: "See how the money works" pointed at `/jobs/new` (creative variant at `/dashboard/payments`) → now `/how-money-works`; and the step had NO `done` flag → viewing the page stamps `profiles.money_guide_seen_at` (no revalidatePath during render, cf. FIX-2026-07-13b). Fixed the replay bug: welcome checklist + tour were gated on localStorage (`gh_welcome_dismissed_v1`/`gh_tour_done_v1`) = per-BROWSER, so a new device replayed them; both now persist on the profile via new server action `markMilestone(key)` → `welcome_dismissed_at`/`toured_at` under the existing `profiles update self` RLS policy. Existing users are NULL so they still see it once. `PricingExplainer` links through. **⚠️ Re-run schema.sql in Supabase BEFORE deploying** — adds `welcome_dismissed_at`, `money_guide_seen_at`, `toured_at` to profiles; `dashboard/layout.tsx` selects `toured_at`, so deploying first breaks the dashboard. tsc clean, 42/42, `next build` clean. Earlier: INTERACTIVE TOUR: `components/product-tour.tsx` (driver.js 1.8.0) — one-time spotlight tour on the dashboard (menu → workspace → reminders, role-aware), anchored via `data-tour` attrs in dashboard/layout.tsx, gated on localStorage `gh_tour_done_v1`. New dep driver.js@1.8.0. `next build` clean. Completes the checklist+tour guidance plan. Refinements backlogged (per-nav-item targets, replay link, `profiles.toured_at` for cross-device). Earlier same-day: MONEY UX SWEEP: `MoneyInput` (comma/thousands, hidden raw-digit input) now on EVERY MWK field — jobs/[id] bid + top-up + extra-revision rate, dashboard/services price + max, jobs/new-for-client price + extra-rate, creatives/[id]/invite budget (plus onboarding prices + job-post budget from earlier). Non-money numbers (percent, revision counts, delivery days) left plain. `PricingExplainer` panel now on all money-decision pages: job-post, proposal form, new-for-client, invite, payments dashboard (audience-aware). Server parsing unchanged. tsc clean, 42/42. Earlier same-day: FIRST-RUN GUIDANCE: dismissible welcome checklist (`components/welcome-checklist.tsx`, localStorage dismiss) on the dashboard with role-based steps that tick off as done; dashboard Reminders panel now shows role CTAs ("Post your first job" / "Find work to bid on") when nothing is pending; reusable `components/pricing-explainer.tsx` (native `<details>`, escrow→fees→payout, numbers from lib/fees.ts) placed on job-post page (drop-in for proposal/payments); `CardContent` got `min-w-0 break-words` so long text wraps inside cards instead of overflowing on resize; job-post budget now uses MoneyInput (commas). Backlogged: interactive step-tour (react-joyride/driver.js, popups on real UI) + rolling MoneyInput to remaining money fields (proposal bid, top-up, rate-card editor). tsc clean, 42/42. Earlier same-day: ONBOARDING UX: creative onboarding made creative-agnostic (DJs/performers/service providers, not just visual artists). Skills field → tag/chip input (`components/tag-input.tsx`, Enter/comma to add bubble); server reads `formData.getAll("skills")`. Money fields → thousands separators as you type (`components/money-input.tsx`, hidden raw-digit input; wired into the two service prices only — job/proposal/top-up money still plain, follow-up). "Add a piece of work" reworded to "Add one example of your work" with DJ/gig/event-friendly placeholders. Delivery time made OPTIONAL: `services.delivery_days` now NULLABLE (was not-null default 7); blank→null; render guards in `creatives/[id]` + `dashboard/services`. **⚠️ Re-run schema.sql in Supabase** (`alter column delivery_days drop not null`). tsc clean, 42/42. Earlier same-day: GOOGLE LOGIN FOLLOW-UP: fixed first-run routing + identity prefill. Dashboard gate now sends **missing-profile OR null-role** users to `/onboarding/role` (was silently rendering a default-creative dashboard — the reported "lands on main page, never onboarding" bug); `chooseRole` + `completeClientOnboarding` now UPSERT so a missing profiles row is created not 0-row-updated. Onboarding (creative + client) prefills **name** and shows **email** read-only from `user.user_metadata`/`user.email`, plus a phone field saved to `profiles.phone`; creative form gained the name/email/phone block it never had. ⚠️ Google sign-in scopes return name+email+avatar, NOT phone — phone is manual. To re-test first-run, delete the Google user in Supabase Auth (cascades profile) and sign in fresh. Unit suite 42/42 (mock gained `.gte/.lte/.gt/.upsert`). Earlier same-day fixed 11 stale mockSupabase fixtures. Earlier same-day: "Continue with Google" OAuth shipped end-to-end. GoogleSignin button (components/google-signin.tsx) on /login + /signup → server action signInWithGoogle → supabase.auth.signInWithOAuth(google, redirectTo=<site>/auth/callback); existing app/auth/callback/route.ts completes the exchange and lands /dashboard (verified, unchanged). ROLE WRINKLE fixed at root: profiles.role is now NULLABLE with NO default and handle_new_user no longer coalesces to 'creative' (that silently mis-roled Google clients) → Google users arrive role=null. New /onboarding/role page (server action chooseRole) asks creative-or-client once; dashboard layout routes un-onboarded null-role users there before role-specific onboarding (no bypass); onboarding completions self-heal role (client/creative). Null-tolerant reads (`(profile?.role as Role) || "creative"`) mean nothing else breaks. Unit tests tests/actions/chooseRole.test.ts 5/5 green, tsc clean. **⚠️ Re-run schema.sql in Supabase** (role nullable + trigger) AND configure Google OAuth client + Client ID/Secret in Supabase → Auth → Providers → Google + enable + allow <site>/auth/callback redirect. Passkeys deferred per BACKLOG. Earlier same-day: VERSION BADGE: clickable v0.8.0 badge in footer next to "© Ganyu Hub" → opens a curated "What's new" panel (native <details>, zero JS). Source lib/whats-new.ts (RELEASES+VERSION) is public-curated, NOT CHANGELOG.md — no security/RLS/schema details ever. Bump a release there → badge auto-updates. Earlier same-day: EMAIL VERIFY: wired the path for Supabase Auth's built-in "Confirm email" — signUp now redirects to /login?info=check-inbox when Supabase returns no session (confirm-email on) instead of /dashboard; login page renders a green info banner. Chose Supabase's built-in mailer (Resend sandbox only reaches owner; no domain bought yet). **ACTIVATE: toggle "Confirm email" ON in Supabase → Authentication → Providers → Email** — code handles both states. Stamped version package.json 0.1.0 → v0.8.0. Earlier same-day: SHARE: social share row (components/share-buttons.tsx — WhatsApp/X/Facebook/Instagram/native/copy) on creative profiles, jobs, portfolio work, and the client-link banner; primary links are server-rendered absolute URLs via lib/site-url.ts (absUrl) so they work with zero JS. Rich link previews: branded 1200×630 app/opengraph-image.tsx + summary_large_image root card + per-page OG on portfolio work. ⚠️ KNOWN: copy/native/IG buttons need route-content hydration which didn't fire in dev preview on /creatives/[id] + /jobs/[id] (whole route content, not just share row; layout+/login hydrate fine) — verify on prod build, investigate route hydration separately if still dead. Earlier same-day: SECURITY: Cloudflare Turnstile CAPTCHA now LIVE in prod on login + signup + the /j/[token] share-link claim form (components/turnstile.tsx + lib/turnstile.ts, env-gated; keys added in Vercel for ganyu-hub.vercel.app, confirmed rendering). Authenticated RLS exploit test committed at scripts/security/rls-exploit-test.mjs (+README); all 3 assertions PASS on live DB (self-accept blocked 403, total_paid_mwk tamper blocked by trigger, legit status write allowed). **To activate CAPTCHA in prod: add the two Turnstile env vars in Vercel.** Earlier same-day: SECURITY round 3: closed the 4 flagged follow-ups — underpayment guard on both PayChangu routes (won't hold escrow below accepted_bid), Postgres-backed rate limiter (rate_limits table + check_rate_limit RPC + lib/rate-limit.ts) wired into signIn/signUp/acceptJobViaLink, generic error on the share-link claim to kill the enumeration/password oracle, and a 10MB DB-level file_size_limit on the job-deliverables bucket. **⚠️ Re-run schema.sql in Supabase Studio** (rate_limits table, check_rate_limit fn, bucket cap). CAPTCHA on auth still pending — needs a provider + env keys. Earlier same-day: audit round 2 (share-link TOCTOU + timing-safe cron). Earlier: static audit found + fixed a creative→job privilege-escalation chain — `proposals update` had no WITH CHECK (self-accept), `proposals insert` allowed proposing on non-open jobs, and the accepted-creative full-row jobs UPDATE let a creative PATCH money/ownership columns directly. Fixed in `supabase/schema.sql` via tightened WITH CHECK on proposals + payment_topups policies and a new `guard_jobs_creative_update()` BEFORE UPDATE trigger. **⚠️ Must be run in Supabase Studio — live DB not yet patched.** See CHANGELOG + TEST_LOG. Deferred non-blocking follow-ups: acceptJobViaLink claim TOCTOU, cron secret timing-safe compare, storage bucket size/MIME caps, auth rate-limiting. Earlier same-day: GlassUploadButton shipped: new shared `components/glass-upload-button.tsx` — glassy white pill with cloud-up icon, hover chromatic halo, three sizes. Wired into ImagePicker, MultiImagePicker, and JobDeliverySubmit as the upload trigger. AttachmentPicker skipped — paperclip context. Earlier same-day: session 7 polish 2 shipped: fixed current-stage dot clipping on progress bar (added `py-2 px-2` to overflow container), redesigned brief card on `/jobs/[id]` — eyebrow label, serif body, hairline dividers, meta strip with Budget/Deadline/Revisions/Format. Earlier same-day: hotfix — removed `require.main === module` self-check in `lib/job-stages.ts` that threw ReferenceError in the client bundle once `JobProgressBar` became `"use client"` (was showing "oops" on every job page). Earlier same-day: session 7 polish shipped: progress bar is now animated with a left→right sweep on mount matching dashboard chart feel, each stage has its own color, completed dots show just a check, and there's a permanent 1-5 numeric guide underneath. Header payout line now uses `gross − max(bank fee, mobile fee)` so the number can't shrink at cash-out; label reads "Creative receives (est., after cash-out fee)". Earlier same-day: session 7 shipped: job lifecycle progress bar + money-at-a-glance header on `/jobs/[id]`. New `lib/job-stages.ts` (pure fn + self-check), `components/job-progress-bar.tsx`, `components/job-header.tsx`. Zero schema, zero RLS, no new statuses — pure display layer over the existing status enum + `job_events` log. Cancel/dispute render as overlays on the stage where they happened. Escrow amount uses existing `total_paid_mwk ?? collection_amount_mwk ?? accepted_bid_mwk` precedence; payout uses `creativeGross()` (respects `BETA_ZERO_COMMISSION`). Header scoped strictly to top section — body untouched. Earlier same-day: session 5 shipped: creative-initiated client jobs with share link. New surfaces `/jobs/new-for-client`, `/j/[token]`, "Copy client link" banner on `/jobs/[id]`. Two new server actions `createJobForClient` + `acceptJobViaLink`. Uses a synthetic accepted `proposals` row to reuse every existing RLS gate — zero new policies. Root middleware.ts added to expose pathname for chromeless landing. **Schema deltas required in Supabase** — see block below. Earlier same-day: repo moved off OneDrive (Turbopack crash resolved), BUG-007 verified from new path.)

## Google-login schema deltas (run once in Supabase Studio — 2026-08-05)

```sql
-- profiles.role: allow null = "OAuth user hasn't picked a role yet"
alter table profiles alter column role drop not null;
alter table profiles alter column role drop default;
-- handle_new_user: stop defaulting absent role to 'creative' (see schema.sql
-- for the full CREATE OR REPLACE — re-running schema.sql applies both).
```
Also required outside SQL: create a Google OAuth client (redirect URI
`https://jbczoiiewuerssckkiuq.supabase.co/auth/v1/callback`), paste Client
ID/Secret into Supabase → Auth → Providers → Google, enable, and add
`<site>/auth/callback` to the allowed redirect URLs.

## Session 5 schema deltas (run once in Supabase Studio)

```sql
alter table jobs alter column client_id drop not null;
alter table jobs add column if not exists client_link_token text unique;
```

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

