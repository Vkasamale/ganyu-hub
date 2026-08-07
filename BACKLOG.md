# Backlog — Nice-to-haves and improvements

Things that work but could be better. Not urgent, not blocking. Pull from here when there's room.

## Auth / Login (next-session task — scoped 2026-08-05)

- ~~**"Continue with Google" login.**~~ **Built 2026-08-05.** Button on `/login` + `/signup` → `signInWithGoogle` server action → `signInWithOAuth`; callback verified. Role wrinkle solved at the root: `profiles.role` made nullable (no default), `handle_new_user` no longer defaults to creative, new `/onboarding/role` picker (`chooseRole`) + dashboard-layout gate route null-role users to pick once. Unit tests green, tsc clean. **Pending activation:** re-run `schema.sql` + configure/enable Google provider in Supabase (see CHANGELOG + DevRoadmap). Original scope below for reference.
- **"Continue with Google" login.** Build end-to-end; plumbing already exists (`app/auth/callback/route.ts`, SSR clients in `lib/supabase/`).
  - **User prerequisite (do first):** create a Google OAuth client — Google Cloud Console → APIs & Services → Credentials → OAuth client ID → Web application. Authorized redirect URI = `https://jbczoiiewuerssckkiuq.supabase.co/auth/v1/callback`. Paste Client ID + Secret into Supabase → Authentication → Auth Providers → **Google**, enable, save. (Provider is Disabled as of 2026-08-05.)
  - **App build:** add a "Continue with Google" button on `app/login/page.tsx` + `app/signup/page.tsx` calling `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: <site>/auth/callback } })`. Verify `app/auth/callback/route.ts` completes the code exchange and lands the user correctly.
  - **⚠️ The real work — role wrinkle:** email/password signup captures `role` (creative/client/agency) via `signUp` metadata (`app/actions.ts:39,54`); downstream logic keys off `profiles.role` + `onboarded_at`. **Google users skip the form → arrive with no role.** Must add a one-time "Are you a creative or a client?" step right after first Google sign-in (fold into the existing onboarding redirect — dashboard already routes un-onboarded users by role). Do NOT ship Google login without this; a null-role account breaks onboarding/job flows.
  - Confirm-email doesn't apply to Google (Google already verified the address) — only the role step is needed for OAuth users.

- **Passkey (WebAuthn) authentication — DEFERRED, do not build yet.** Supabase Passkeys is BETA; needs WebAuthn UI, device registration/management, and fallbacks. Email+password + Google covers every user at v0.8.0 — marginal benefit for real complexity. Revisit only if users ask. Requested 2026-08-05; deliberately held.

## Onboarding / guidance

- ~~**Interactive step-by-step tour (popups pointing at real UI).**~~ **Built 2026-08-05.** `components/product-tour.tsx` (driver.js 1.8.0) runs a one-time spotlight tour on the dashboard pointing at the nav / workspace / reminders (`data-tour` anchors in `dashboard/layout.tsx`), gated on `localStorage["gh_tour_done_v1"]`, role-aware copy. **Possible refinement:** point at individual nav items (Jobs, Payments) and the welcome checklist rather than whole containers; add a "Replay tour" link in Account settings; a `profiles.toured_at` column if it needs to survive across devices (localStorage is per-browser).
- ~~**Roll comma/thousands formatting to the remaining money fields.**~~ **Done 2026-08-05.** `MoneyInput` now on every MWK field: onboarding service prices, job-post budget, proposal bid, top-up amount, rate-card editor (`dashboard/services`), new-for-client price + extra-revision rate, invite budget, and the `jobs/[id]` extra-revision rate. Percentages / revision counts / days deliberately left as plain number inputs.

## Infrastructure

- **Turn on Plausible analytics.** Script tag shipped 2026-07-16, gated by env var. To activate: (1) sign up free at plausible.io, (2) add site `ganyu-hub.vercel.app` (later `ganyuhub.com`), (3) set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=ganyu-hub.vercel.app` in Vercel env, (4) redeploy. Pageviews only — custom events (`job_posted`, `job_completed`) added later if pageview data can't answer the question.

- **Buy `ganyuhub.com` and verify in Resend.** `ganyu.com` is NOT owned by us — it will never verify, remove that entry from Resend once the correct domain is live. Until then, emails route through Resend sandbox (`onboarding@resend.dev`) and only deliver to the Resend account owner (`vinnykasa@gmail.com`). Once `ganyuhub.com` is purchased and DNS records added: update `EMAIL_FROM` in `.env.local` to `Ganyu Hub <notifications@ganyuhub.com>` and redeploy. Part of Money Unlock Day.

- **WhatsApp Cloud API notifications.** In progress 2026-07/08 — Meta Developer App "Ganyu Hub" created, WhatsApp use case attached, test number available via "Try it out" (Step 1). Chosen over Twilio to keep beta cost at zero (Twilio requires prepaid balance; Meta's own Cloud API is free through the test tier — up to 5 verified recipient numbers, no payment method required). Path: Step 1 (test number, 5 verified recipients, free) → Step 2 Production setup (real phone number, message templates, payment method — only needed once beta outgrows 5 recipients) → Step 3 Business verification (only needed for full production volume). Any *creative-initiated* message outside a 24h reply window needs a pre-approved message template — draft plain, transactional wording (new job match, file delivered, status update) since promotional-sounding templates get rejected. Do not wire into Claude Code / the app until a real test message has been sent and received through Step 1, and API key + Phone Number ID + WABA ID are in hand.

## Identity & Trust (Public Launch / Scale tier — not beta)

- **Phone OTP verification for clients.** Lets guest-adjacent clients (e.g. a one-off "find a nail tech" hire) verify a real, reachable phone number without requiring an email, which most don't have reliably. Researched 2026-07-20: Twilio is too expensive for Malawi delivery (~$0.33/SMS, international routing tax). eSMS Africa advertises Malawi-local rates from ~30 MWK (~$0.017/SMS) with TNM/Airtel Malawi coverage, but support confirmed Malawi is NOT in their standard published pricing table and needs custom route provisioning via their engineering team (WhatsApp +254 114 494 147) — treat their advertised rate as unconfirmed until it's in writing. Africa's Talking is a credible backup, also lists Malawi, no public per-country rate, needs a direct quote. Also confirm whether Supabase Auth's phone-provider integration supports a custom/generic SMS webhook or only has built-in Twilio/MessageBird/Vonage adapters — may need a standalone OTP table + verification flow outside Supabase Auth if not. Do not build until a route is confirmed live and priced by a real test OTP to a real Malawi number.

- **ID + liveness verification badge for creatives.** Upgrades current KYC (ID captured before payout) to a certified badge: document scan + liveness check, verified creatives surfaced as more trustworthy / more likely to be hired. Handled by dedicated IDV vendors (e.g. Smile Identity, Youverify, Trulioo), not SMS gateways. Rough industry pricing ballpark ~$0.50–$2+ per verification depending on provider/coverage/liveness — meaningfully more expensive than OTP, unconfirmed for Malawi specifically, needs a real quote before committing. Not needed at beta scale (6 personally-recruited creatives you can call directly); revisit once supply is large enough that you can't personally vouch for everyone.

- **Agency profiles have no page of their own (2026-08-07).** Client profiles shipped at `/clients/[id]`, and `/creatives/[id]` now redirects only when `role = 'client'` — so `agency` (and any un-onboarded `null` role) still renders the creative layout. That's deliberate: agency is frozen and inventing a third page would prejudge the model. Whoever unfreezes agency inherits this decision, and the route split is where it lands.

- **Agency accounts.** Frozen per Roadmap v3 feature freeze (Phase 4, after 3 paid jobs). Raised again 2026-07-20 mid job-events build — deliberately not scoped further right now to protect focus on the in-flight timeline/revisions/file-delivery sessions. When revisited: needs a real definition of what "agency" means on the platform (a profile type that manages multiple creative sub-profiles? a client-side team account? billing consolidation?) before any schema work starts — don't let a Claude Code session invent the model.

## Payments

- **Upfront deposit / milestone payments.** Raised 2026-08-07 by a creative directly: some jobs need money upfront to cover materials before work can start (e.g. "job is MWK 300,000, I need MWK 100,000 upfront to buy X"). **Design decision made with the founder: this must stay a Ganyu Hub-processed payment, never a direct client-to-creative transfer** — an off-platform deposit recreates the exact "guy who knows a guy" trust gap the platform exists to solve, and a creative disappearing with an off-platform deposit becomes a story about Ganyu Hub even though it happened around it.

  **Shape:** two-tranche payment on the same job, both funded through PayChangu into escrow as normal, but releasing on different triggers — the **deposit releases to the creative immediately on funding** (before work starts, since covering upfront cost is the entire point), the **balance stays held exactly like today**, released only after delivery and approval.

  **Required guardrail:** cap the deposit as a percentage of total job value (e.g. 50% max), set by the creative at proposal stage alongside bid/revisions — otherwise this reopens the exact bad-faith case escrow is meant to prevent (100% "deposit," then vanish).

  **Non-trivial, touches a lot:** proposal form (deposit %, capped), job funding flow (two payment events on one job instead of one), payout logic (an early partial release before completion), and — this is the sharp edge — **cancellation/dispute math**, since the existing fee-reserve and split logic assumes a job is either fully funded-and-held or not; a job that's partially released before cancellation needs its own handling. Scope as its own multi-session build, same pattern as the revisions feature. Sequence after `ganyuhub.com` / notification email, which remains higher real-world impact.

- **Creative wallet with batched withdrawals — the only way to reach a genuinely flat payout percentage.** Raised 2026-08-06 while settling payout fees. Not urgent; needs real volume first.

  **The problem it solves.** Bank payouts cost `1.5% + MWK 700`. A percentage scales with the amount; the flat 700 doesn't. So the percentage needed to always cover cost is:

  ```
  required % = 1.5% + (700 / smallest payout allowed)
  ```

  | Min payout | Flat % that always covers |
  |---|---|
  | 1,000 (today's `MIN_PAYOUT_MWK`) | **71.5%** |
  | 10,000 | 8.5% |
  | 50,000 | 2.9% |
  | 140,000 | 2% |

  So a flat rate is a *floor* problem, not a percentage problem — you can only have a low flat rate by refusing small payouts, which is hostile in the Malawi context. Hence the shipped compromise: `2% + MWK 700` on bank, `2%` on mobile (2026-08-06, `lib/fees.ts`, pinned by `tests/fees.test.ts`).

  **Why a wallet fixes it.** Today payouts are per-job, so a creative doing five MWK 10,000 jobs pays the 700 five times. With a balance they withdraw on their own schedule, the 700 is paid **once per withdrawal, not once per job**. Average withdrawal size rises, and a flat ~3% covers it comfortably — a uniform percentage with no exception to explain, and *cheaper for creatives doing lots of small jobs*, who are exactly the people the flat fee hurts most today.

  **Rough shape when built:** a balance ledger (credits on release, debits on withdrawal, immutable rows — never a mutable `balance` column), a withdrawal request flow with the existing `MIN_PAYOUT_MWK` floor applied per *withdrawal* rather than per job, reconciliation against PayChangu transfers, and a "pending vs available" split so escrow released today isn't withdrawable before it has settled. Touches `releasePayment`, the payout reconcile path, and the payments dashboard. Non-trivial — treat as its own session, and don't start it without deciding the ledger model first.

  **Revisit when:** creatives are regularly doing multiple small jobs per month, or bank payout fees become a visible cost line. Not before.

## Theming

- **Dark mode for public launch.** Site is heavy on white surfaces (`bg-paper`, `bg-white`, `card-soft`) and the reading experience gets tiring on long pages (Terms, dashboards, `/browse`). Ship a dark theme for the public-launch marketing push — not urgent for beta since the surface is still moving weekly and every color change would need re-QA in both themes. Approach: add a `dark:` variant sweep across the design tokens (`text-ink`, `text-ink/60`, `bg-paper`, `bg-wash`, `border-ink/10`, `card-soft`), toggle in the navbar with `next-themes`, respect `prefers-color-scheme` on first visit. Budget half a day to a day plus visual QA across every route. Do NOT ship piecemeal — half-themed pages look broken.

- **Display/heading font exploration.** Raised 2026-07/08 after seeing a wide-tracked, bold uppercase broadcast-credits style font (Bebas Neue / Oswald / Druk territory). Good candidate for hero headlines and short section labels (eyebrows, category pills) — NOT for body text or job descriptions, wide-tracked all-caps fonts fatigue fast at paragraph length. Ganyu Hub already has a locked teal token system + shipped editorial redesign, so this is a deliberate design pass touching every page, not a quick swap — bundle with the dark mode work above since both require full-route visual QA. Not a beta task.

## Job page polish (raised 2026-08-07, after the money-state redesign shipped)

- ~~**Chevron arrows instead of the "See more" text link.**~~ **Shipped
  2026-08-07**, same day it was raised — inline SVG chevron with
  `group-open:-rotate-180` and a 200ms transition, "Expand"/"Collapse" kept as
  sr-only text. Not looked at in a browser yet. Original scope below.
- **Chevron arrows instead of the "See more" text link.** The collapsibles
  (`components/collapsible.tsx`, used by the project brief, Activity and Send
  delivery) currently expand via a small "See more" / "Hide" text link. Founder
  wants the standard directional chevron — a wide V pointing **down** when
  collapsed, flipping to point **up** when expanded, animating between the two.
  Cheap: one inline SVG chevron plus `group-open:rotate-180` and a
  `transition-transform` on the existing `<details>` — no new dependency, and the
  `group`/`group-open` wiring is already in place. Drop the text entirely, but
  keep an `aria-label` so the control still announces itself.

- **Real badge artwork for the "Released to creative" stamp.** Founder is
  supplying a designed badge/logo asset for the released state. Today it's a
  plain emerald outlined chip built from the `MONEY_STATE` map in
  `components/job-header.tsx` — legible and clearly distinct, but it reads as a
  tag rather than a stamp. Swap in the supplied artwork when it lands. Note the
  other four states (not funded, pending, held, disputed) stay as coloured chips
  unless artwork arrives for them too — one illustrated state among four plain
  ones may look accidental, so check the set together. **Blocked on the founder
  providing the asset.**

- **Duplicate money-state wording.** The header stamp says "Released to
  creative" and the Payment card immediately beneath says "Payment released" —
  two labels for one fact, a few inches apart. Probably drop the Payment card's
  own badge and let the stamp carry it. Noticed in the same review; not urgent.

## Messages (raised 2026-08-07)

- **A proper tab split between direct messages and job conversations.** Requested
  for next session. ⚠️ **Read this first: a version already ships.**
  `components/thread-list.tsx` renders `All / Jobs / Direct` filter **chips** with
  live counts, and the list below is one scroll. That was a deliberate call taken
  from the founder's WhatsApp Web reference, which filters with chips rather than
  splitting into sections — it replaced an earlier build that *did* use stacked
  "Jobs" / "Direct messages" headings.
  So the open question is not "does the split exist" but **whether chips are the
  right weight for it**. Options if they aren't: promote them to real tabs with an
  underline and a persisted selection; or go back to two visually separate
  sections, which is what was there before and was moved away from. Look at the
  live page before building — the founder had not seen the chips when this was
  raised, and rebuilding what already exists is the likely failure mode.
- **Unread state.** No unread bolding and no per-thread unread count; the WhatsApp
  reference has both. Pairs with the tab question — an unread count per tab is
  what makes tabs earn their space.
- **Message-body search.** Search currently covers job titles, names and preview
  text, all client-side over loaded threads. Searching message *history* needs a
  server query against `messages.body` plus a Postgres text index. Deliberately
  deferred until thread volume justifies the index.
- **Empty-thread preview reads oddly** — a job thread with no messages and no
  events falls back to the other person's name, which is already the group
  header directly above it. Should read "No activity yet". One-line fix.

## Accessibility

- ~~**Finish the WCAG contrast sweep.**~~ **Shipped 2026-07-17.** Full `text-stamp` → `text-stamp-dark` swap across 12 files; decorative italic display headings kept as bright `text-stamp` (large text, AA-passing at 3:1). See CHANGELOG 2026-07-17.

## Scope / proposals

- **Move "revisions included" from the client to the creative.** Currently the client sets `revisions_included` on the job post form (`app/jobs/new/page.tsx`, `app/creatives/[id]/invite/page.tsx`), which is backwards: the creative is the one whose price is a function of how many rounds of changes they'll absorb. The client can't correctly guess a number that keeps the bid math sensible. The right shape: keep the field on the job form as an optional *ask* ("how many revisions would you like?"), but make the creative set the actual committed number on their proposal, alongside bid and turnaround. That number is what shows in the accepted scope and what the dispute path enforces. Schema: add `revisions_offered int` to `proposals`; on accept, copy to `jobs.revisions_included` so the rest of the flow keeps working unchanged.

## Payments

- **Tips after release.** Once escrow is released the fund cycle is closed — no more top-ups (enforced 2026-07-13). A separate "Send a tip" flow could let clients add money post-release without re-opening escrow: goes straight to the creative through a fresh PayChangu payout, no back-and-forth. Nice to have; not urgent.

- **On-platform wallets for creatives.** Instead of a PayChangu payout per completed job, creatives accrue a balance on Ganyu Hub and withdraw when they want (or set a threshold). Batches payouts → fewer transfer fees, and gives creatives a running "money you've earned here" view that doubles as social proof. Also unlocks internal transfers (creative-to-creative referrals, agency splits) without touching a payment rail. Non-trivial: needs a ledger table with double-entry semantics, admin reconciliation, and KYC once balances get large.

## Trust & Loop-Closing

- ~~**Reviews / feedback after completed work.**~~ **Shipped 2026-07-03.** Completed jobs prompt both parties to rate (1–5 stars) + comment via `submitReview`; RLS restricts inserts to a party of a completed job. Star average + recent reviews render on `/creatives/[id]` (replaced the fake "Response time" stat); browse `CreativeCard`s show real stars via a per-profile rollup in `app/browse/page.tsx`. Still TODO: fold rating into search ranking (`lib/feed.ts` / trending RPC), and extend the rollup to the dashboard feed / saved-page cards (currently only `/browse` computes it).

## Media

- **Image upload for portfolio (and avatars).** Right now portfolio items take a `cover_url` text field, so creatives have to host images elsewhere and paste a URL. Wire up Supabase Storage: create a `portfolio` bucket with public read + owner-only write, swap the URL input for a file upload that stores to `portfolio/<profile_id>/<uuid>.ext` and saves the public URL. Same for profile avatars.
- **Inline avatar upload from own public profile.** When the signed-in user is viewing their own `/creatives/[id]` page, clicking the avatar circle should open the file picker directly and upload a new avatar in place — no round-trip to `/dashboard/profile`. Keep the existing Edit-profile flow untouched; this is purely a shortcut for the most common tweak. Owner-only — for non-owners the avatar stays a static image.

## Landing-page imagery

- **Hero right-side imagery.** Removed 2026-06-29 — the layered photo + chitenje block + clay arc + spinning "Find creatives" badge on the right column was pulled to keep the launch landing page clean while the imagery story is figured out. The `<HeroArt />` component (`components/hero-art.tsx`) and `/public/hero-photographer.webp` are still in the repo as a starting point. To bring it back: re-add the right column in `app/page.tsx` (revert the `grid-cols-[1.15fr_1fr]` block) and pick the imagery direction — single portrait of a real Malawian creative we've onboarded, a portfolio collage from real shipped work, or stay graphic-only with the chitenje composition. Best after we have 3–5 seeded creatives whose portraits/work we can actually feature.

## Landing-page proof

- **Landing hero proof row.** Removed 2026-06-29 — placeholder stats ("5 categories live", "K — local currency", "48h median time to first proposal") were aspirational, not real. Bring back once we have actual numbers worth quoting: real category count from `CATEGORIES.length`, real median-time-to-first-proposal from `proposals.created_at - jobs.created_at`, and either a "creatives live" count or a recognisable client logo strip if/when we have one.

## Monetisation (blocked on payment rails)

- **Featured / boosted listings.** Paid placement for creatives — either creative pays to boost their profile in `/browse` results, or client pays to boost their job in `/jobs`. Sits behind the mobile-money integration since it needs to actually charge someone. Simplest cut when ready: `profiles.featured_until timestamptz` + card sort key + subtle gold border on card. Admin-granted boost is a possible pre-payments stopgap for launch partners.

## Ideas — creative-facing (post-analytics)

- **Git-as-portfolio for devs.** Let developer creatives link a GitHub repo per portfolio item; auto-pull the README (rendered) and, for web projects, an embedded live preview (via a headless render service or Vercel/Netlify deploy hook). Would remove the "paste screenshots of your work" friction for devs and match the platform's skill-first, portfolio-is-your-credential ethos. Would need: OAuth GitHub for the creative, a repo URL field on `portfolio_items`, a fetch/render worker.

## AI features (Phase 3/4 — needs real data volume first)

- **Job description writing assist for creatives.** A "improve this description" action that takes a creative's rough notes for a client-facing job (the creative-initiated job flow) and turns them into a clear, professional brief. Cheap to build (single off-the-shelf LLM API call, no fine-tuning, no new infra) and directly raises the quality of what clients see. Reasonable to pull forward earlier than the matching feature below since it doesn't depend on having a large creative pool — one creative's job post is enough to be useful.

- **AI-assisted creative-to-job matching.** Suggests creatives who might fit a newly posted job (category + past job history + skills tags), and could power smarter WhatsApp "a job matching your skills was posted" notifications instead of a blunt category-only filter. Explicitly NOT useful yet — with a handful of live creatives, any matching engine just restates "here's the only person available." Revisit once there's enough creative volume and job history for suggestions to be non-trivial (Phase 3, alongside "ratings into ranking").

- **AI-generated marketing/portfolio copy — do NOT build.** Considered and rejected 2026-07/08: the platform's core pitch is real, human, Malawian creatives — AI-written portfolio descriptions or marketing copy directly undermines that story. Leave this off the list permanently unless the positioning itself changes.

## Pre-launch decisions (deferred from 2026-07-02)

- **Client identity verification tiers.** Beta / early access: name + phone only. Full ID verification kicks in once escrow goes live and real money is held — hard requirement before PayChangu ships, not before beta.
- **Content policy + moderation ownership.** Beta ships with a three-line manual rule set (no adult content, no political material, no MLM). Full policy + moderator assignment happens after beta feedback, when the real moderation surface is visible.

## To add as we find them
