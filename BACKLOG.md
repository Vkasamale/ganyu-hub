# Backlog — Nice-to-haves and improvements

Things that work but could be better. Not urgent, not blocking. Pull from here when there's room.

---

## ▶ NEXT SESSION STARTS HERE — the design feedback loop (updated 2026-08-19)

**Where we stopped:** all 79 plan items (Phases 0–9) are shipped and merged to
`main`. The Claude Design **system run is done**, the **template prompt has
been written and run**, and the founder has made adjustments inside Claude
Design. The next step is the **feedback loop**, not more feature work.

**Read [`CLAUDE_DESIGN_WORKFLOW.md`](CLAUDE_DESIGN_WORKFLOW.md) first.** The
YouTube tutorial no longer has to be re-supplied — the whole method is written
down there, along with every ground decision made on 2026-08-19, the seven
answers given to Claude Design, and the exact next prompt to send.

**⚠️ The single most important step, and it has not been done:** the
`CLAUDE.md` request. Until it is sent, no correction the founder makes carries
forward to the next design, and every session re-explains the same things.
Exact wording is at the foot of `CLAUDE_DESIGN_WORKFLOW.md`.

**⚠️ The design docs are now out of date on purpose.** `DESIGN.md` §2 and
`DESIGN_BRIEF.md` still say the cream paper ground `#EFE6CE` is an asset to
protect. **That decision was reversed on 2026-08-19** — off-white `#F7F6F3` is
the page ground, pure white is the raised surface, cream survives only as an
accent. The founder chose not to rewrite the docs and to override them from
the prompt instead. A session that reads only the docs will get this wrong,
which is precisely what killed the 2026-08-12 run. Reconcile them before
resuming design work.

**Inputs already prepared, current as of 2026-08-13:**

- [`DESIGN.md`](DESIGN.md) — binding rulebook. Unchanged; its responsive table
  already describes the shipped shell.
- [`DESIGN_BRIEF.md`](DESIGN_BRIEF.md) — **rewritten from the code.** Surface
  inventory (public / signed-in / shell / reused components), the open visual
  decisions, and the do-not-change list.
- [`DESIGN_BRIEF_MOBILE.md`](DESIGN_BRIEF_MOBILE.md) — for a run with no repo
  access. §6 corrected: the tab bar and drawer are built, and the shipped tabs
  are `Home · Find work/Find someone · Messages · My work · Menu`, NOT the
  `Home/Browse/Messages/Jobs/Profile` the old draft proposed.
- [`DESIGN_GAP_AUDIT.md`](DESIGN_GAP_AUDIT.md) — every gap closed; now the
  reasoning record behind the §-numbers cited in code comments, not a to-do
  list.
- **Handoff folder** at `C:\Users\vinny\Desktop\ganyu-design-handoff` (3 MB, no
  `node_modules`): `components/` (92 files), `app/` (47 routes +
  `globals.css`), `tailwind.config.ts` (the palette), four `lib/` files (`nav`,
  `styles`, `task-phrases`, `utils`), the four design docs and the logo.
  Rebuildable from the repo at any time.

**Two decisions to settle before anything is composed on top of them** — both
ripple across every screen:

1. **paper-vs-white** (`DESIGN.md` §2). Surfaces mix `paper` `#EFE6CE`, `wash`
   `#DACFB2` and plain white with no stated rule.
2. **The `font-display` conflict** (§3). Inter / IBM Plex Mono / Instrument
   Serif — settle which face owns headings.

**Outstanding and NOT design work** (do not let these bleed into the template
session):

- Message editing: `messages.edited_at` renders an "Edited" marker but no edit
  UI exists. Needs an RLS update policy on `messages` plus an edit flow.
- `VERIFY_BACKLOG.md` steps 2–6 — founder clicks.
- The Ganyu-verified admin control (`/admin/users` → "Mark checked") is built
  but never exercised; it grants a public trust badge, so the founder decides.

---

## Auth / Login (next-session task — scoped 2026-08-05)

- ~~**"Continue with Google" login.**~~ **Built 2026-08-05.** Button on `/login` + `/signup` → `signInWithGoogle` server action → `signInWithOAuth`; callback verified. Role wrinkle solved at the root: `profiles.role` made nullable (no default), `handle_new_user` no longer defaults to creative, new `/onboarding/role` picker (`chooseRole`) + dashboard-layout gate route null-role users to pick once. Unit tests green, tsc clean. **Pending activation:** re-run `schema.sql` + configure/enable Google provider in Supabase (see CHANGELOG + DevRoadmap). Original scope below for reference.
- **"Continue with Google" login.** Build end-to-end; plumbing already exists (`app/auth/callback/route.ts`, SSR clients in `lib/supabase/`).
  - **User prerequisite (do first):** create a Google OAuth client — Google Cloud Console → APIs & Services → Credentials → OAuth client ID → Web application. Authorized redirect URI = `https://jbczoiiewuerssckkiuq.supabase.co/auth/v1/callback`. Paste Client ID + Secret into Supabase → Authentication → Auth Providers → **Google**, enable, save. (Provider is Disabled as of 2026-08-05.)
  - **App build:** add a "Continue with Google" button on `app/login/page.tsx` + `app/signup/page.tsx` calling `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: <site>/auth/callback } })`. Verify `app/auth/callback/route.ts` completes the code exchange and lands the user correctly.
  - **⚠️ The real work — role wrinkle:** email/password signup captures `role` (creative/client/agency) via `signUp` metadata (`app/actions.ts:39,54`); downstream logic keys off `profiles.role` + `onboarded_at`. **Google users skip the form → arrive with no role.** Must add a one-time "Are you a creative or a client?" step right after first Google sign-in (fold into the existing onboarding redirect — dashboard already routes un-onboarded users by role). Do NOT ship Google login without this; a null-role account breaks onboarding/job flows.
  - Confirm-email doesn't apply to Google (Google already verified the address) — only the role step is needed for OAuth users.

- ~~**Passkey (WebAuthn) authentication — DEFERRED, do not build yet.**~~ **Built 2026-08-19**, at the founder's call after enabling Passkeys in the Supabase dashboard. `components/passkey.tsx` — `RegisterPasskey` on `/dashboard/account`, `PasskeySignIn` on `/login`. Still BETA at Supabase, hence `auth.experimental.passkey: true` in `lib/supabase/client.ts`. Original deferral reasoning, kept because the trade-off was accepted knowingly rather than forgotten: Supabase Passkeys is BETA; needs WebAuthn UI, device registration/management, and fallbacks. Email+password + Google covers every user at v0.8.0. Requested 2026-08-05; held until 2026-08-19.
  - **Relying Party ID is `ganyuhub.com`** with origins `https://www.ganyuhub.com,https://ganyuhub.com`. Do not narrow the RP ID to the `www` host — the apex is not a subdomain of it, and passkeys would silently stop being offered to anyone arriving without the `www`.
  - **Still missing: no way to remove a passkey.** A user who loses the device has no self-service path; they fall back to email+password, which is survivable but not final. `auth.passkey.*` exposes list/update/delete — wire them into the account card when someone actually needs it.

## Search Console / SEO (2026-08-19)

- **Sitemap not yet submitted.** `https://www.ganyuhub.com/sitemap.xml` is live
  and valid — 95 URLs, all on `www.ganyuhub.com` — and `robots.txt` points at
  it while blocking `/dashboard`, `/messages`, `/t/`, `/auth/` and `/api/`.
  Both verified live. All that remains is founder clicks: Search Console →
  Sitemaps → add `sitemap.xml`, then URL inspection on the homepage → Request
  indexing, once. The property is already a Domain property
  (`sc-domain:ganyuhub.com`), which covers apex, `www` and every subdomain —
  do **not** add a URL-prefix property, it splits the reporting.
- **Open decision: should beta creative profiles be indexed?** The sitemap
  includes creative profiles and job pages, so real users' profiles become
  searchable while the product is still closed beta. Recommendation is to
  leave it — those URLs are already public and search visibility is the point
  of a marketplace — but it is a change in kind for beta users. To hold them
  back, drop the creative and job URLs from `app/sitemap.ts` and keep the
  landing and category pages.

## Onboarding / guidance

- ~~**Interactive step-by-step tour (popups pointing at real UI).**~~ **Built 2026-08-05.** `components/product-tour.tsx` (driver.js 1.8.0) runs a one-time spotlight tour on the dashboard pointing at the nav / workspace / reminders (`data-tour` anchors in `dashboard/layout.tsx`), gated on `localStorage["gh_tour_done_v1"]`, role-aware copy. **Possible refinement:** point at individual nav items (Jobs, Payments) and the welcome checklist rather than whole containers; add a "Replay tour" link in Account settings; a `profiles.toured_at` column if it needs to survive across devices (localStorage is per-browser).
- ~~**Roll comma/thousands formatting to the remaining money fields.**~~ **Done 2026-08-05.** `MoneyInput` now on every MWK field: onboarding service prices, job-post budget, proposal bid, top-up amount, rate-card editor (`dashboard/services`), new-for-client price + extra-revision rate, invite budget, and the `jobs/[id]` extra-revision rate. Percentages / revision counts / days deliberately left as plain number inputs.

## Infrastructure

- **Sentry: live and verified 2026-08-19.** Errors + tracing across all three
  runtimes, `global-error.tsx`, source maps gated on `SENTRY_AUTH_TOKEN`, tunnel
  at `/monitoring`. Verified end to end on production: `/api/sentry-check`
  thrown twice, both events arrived in the `javascript-nextjs` project. Env vars
  come from the Vercel/Sentry integration, which provisions
  `NEXT_PUBLIC_SENTRY_DSN` only — hence the server/edge fallback to it.

  Still worth doing: turn on **Automatically expose System Environment
  Variables** in Vercel. Without it `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` is
  undefined, so browser-side errors carry no `release` tag and can't be pinned
  to a deploy. `lib/site-url.ts` wants that toggle too, for preview-deploy share
  links.

- **Sentry Session Replay — deliberately NOT enabled.** It is Sentry's headline
  recommendation for user-facing apps and it was skipped on purpose: the
  surfaces worth replaying here are private messages, job briefs and MWK
  amounts. Replay masks text by default, but that default deserves an audit
  against *our* screens before it records a single session — not a shrug.
  Same reason `dataCollection` is omitted from every `init`: passing the object
  at all, even `{}`, flips unset categories to permissive.

- **Sentry crons.** `app/api/cron` + `vercel.json` crons are exactly what
  Sentry's cron check-ins are for — a silently-never-firing daily job is
  invisible today. Worth adding once the DSN exists and errors are confirmed.

- **Turn on Plausible analytics.** Script tag shipped 2026-07-16, gated by env var. To activate: (1) sign up free at plausible.io, (2) add site `ganyu-hub.vercel.app` (later `ganyuhub.com`), (3) set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=ganyu-hub.vercel.app` in Vercel env, (4) redeploy. Pageviews only — custom events (`job_posted`, `job_completed`) added later if pageview data can't answer the question.

- ~~**Buy `ganyuhub.com` and verify in Resend.**~~ **Done 2026-08-09.** Bought at
  Namecheap (auto-renew on, WhoisGuard on). DNS on Namecheap BasicDNS:
  `A @ → 76.76.21.21`, `CNAME www → cname.vercel-dns.com.`; parking A record and
  the `ganyuhub.com → www` redirect deleted. Vercel serves **www as canonical**,
  apex 308s to it. Resend **verified** — DKIM (`resend._domainkey`), SPF on the
  `send` subdomain (TXT + MX priority 10) and `_dmarc` all resolve publicly.
  Mail Settings switched `Email Forwarding → Custom MX`, which removed
  Namecheap's forwarding SPF (no longer needed — Resend scopes its SPF to
  `send`, so there was never a conflict with the apex record). Vercel's "DNS
  Change Recommended" badge is advisory only: it advertises a new IP range and
  states the legacy records keep working. **Superseded by "Domain unlocked"
  below.**

- **[OLD SCOPE, kept for reference] Buy `ganyuhub.com` and verify in Resend.** `ganyu.com` is NOT owned by us — it will never verify, remove that entry from Resend once the correct domain is live. Until then, emails route through Resend sandbox (`onboarding@resend.dev`) and only deliver to the Resend account owner (`vinnykasa@gmail.com`). Once `ganyuhub.com` is purchased and DNS records added: update `EMAIL_FROM` in `.env.local` to `Ganyu Hub <notifications@ganyuhub.com>` and redeploy. Part of Money Unlock Day.

- **WhatsApp Cloud API notifications.** In progress 2026-07/08 — Meta Developer App "Ganyu Hub" created, WhatsApp use case attached, test number available via "Try it out" (Step 1). Chosen over Twilio to keep beta cost at zero (Twilio requires prepaid balance; Meta's own Cloud API is free through the test tier — up to 5 verified recipient numbers, no payment method required). Path: Step 1 (test number, 5 verified recipients, free) → Step 2 Production setup (real phone number, message templates, payment method — only needed once beta outgrows 5 recipients) → Step 3 Business verification (only needed for full production volume). Any *creative-initiated* message outside a 24h reply window needs a pre-approved message template — draft plain, transactional wording (new job match, file delivered, status update) since promotional-sounding templates get rejected. Do not wire into Claude Code / the app until a real test message has been sent and received through Step 1, and API key + Phone Number ID + WABA ID are in hand.

## Domain unlocked — NEXT SESSION TOPIC (added 2026-08-09)

`ganyuhub.com` is live and Resend is verified. This section is the agenda for
that discussion, not a queue to clear. Nothing here is started.

**Config that must land first — blocks most of the rest.** Vercel Production:
`APP_URL` and `NEXT_PUBLIC_SITE_URL` → `https://www.ganyuhub.com`, `EMAIL_FROM`
→ `Ganyu Hub <noreply@ganyuhub.com>`, plus the three VAPID vars. Then redeploy
(env changes need a build). Supabase → Auth → URL Configuration: Site URL and
`https://www.ganyuhub.com/auth/callback`, or Google login breaks on the new
domain. PayChangu webhook repointed. Production `push_subscriptions` table run.

### 1. Email actually reaches people now — the big one

Resend was sandbox-only and delivered **exclusively to the account owner**.
Every notification email the app has ever "sent" to a beta creative went
nowhere. That constraint is gone.

- Audit what the app currently emails, and to whom. Volume goes 0 → real.
- Decide which events deserve email vs in-app only. A creative who gets an
  email per job event will mute us.
- Send one real end-to-end job through and read what actually lands **before**
  telling beta users about the domain.
- Templates are unbranded; a verified sending domain makes branding worth doing.

### 2. Branded reply address

`EMAIL_REPLY_TO` stays `vinnykasa@gmail.com` deliberately — **nothing receives
mail at `@ganyuhub.com`** (Resend receiving off; Namecheap forwarding removed
with the Custom MX switch). Options when ready: ImprovMX free tier (2 records,
apex MX slot is free since Resend only claimed `send`, forwards to Gmail) or
Resend Inbound (a webhook, not a mailbox — right for routing `support@` into
the admin panel later, wrong for reading replies). Zoho's free tier is gone.

### 3. Share links stop looking disposable

Share buttons and `absUrl()` now emit `ganyuhub.com` instead of a
`*.vercel.app` URL. In a market where hiring happens over WhatsApp referrals,
the link *is* the credibility. Worth re-checking OG cards render correctly on
the real domain.

### 4. SEO becomes worth doing at all

Pointless on `vercel.app`; now the cheapest acquisition channel we have.

- `sitemap.ts` and `robots.ts` (Next has native metadata routes for both)
- **Category landing pages** with plain-language descriptions — see
  `DESIGN_GAP_AUDIT.md` §O3; already recommended for UX, doubles as SEO
- Task-phrased entry points (§L1) map onto search intent ("logo design
  Blantyre") far better than our category taxonomy does
- Per-page canonical URLs

### 5. Installed PWA carries the real domain

The home-screen app shows `ganyuhub.com`, not a Vercel subdomain. Worth
redoing the iOS install test on the real domain — the install is per-origin,
so anything installed from the preview URL is a different app.

### 6. Plausible can finally be switched on

Existing backlog item above: set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=ganyuhub.com`
(not the vercel.app value) and redeploy.

### 7. Subdomains now available

`admin.` / `status.` / `docs.` — none needed yet. Noted so the option is
remembered, not to build.

### 8. Email posture to tighten later

DMARC is `p=none` (monitor only). Once real send volume exists and reports look
clean, move to `quarantine`. Do not tighten before there is data.

### 9. Domain ops

Auto-renew on, WhoisGuard on. Renewal is a single point of failure for the
whole product — email, auth redirects, share links, the installed PWA. Worth a
calendar reminder independent of Namecheap's own.

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

## Landing page — SCHEDULED, see `IMPLEMENTATION_PLAN.md` (added 2026-08-12)

**No longer a backlog item.** The landing page rebuild is scheduled ahead of
Phase 0 in `IMPLEMENTATION_PLAN.md`, items L1–L11. The two entries below are
kept because they record *why* the current page is bare — read them before
rebuilding, they are the reason the hero is flat.

Reviewed 16 Fiverr/Upwork landing-page screenshots 2026-08-12 →
`DESIGN_GAP_AUDIT.md` §Q. Both references are a **full-bleed darkened
photograph** with white display type and the search field sitting *on* the
image. Ours is flat `#EFE6CE`. Everything else in our hero already matches
theirs — the photograph is the entire gap.

Photography rules now exist in `DESIGN.md` §10 (scrim treatment, no eye
contact, **≤160 KB desktop / 0 KB mobile**, and "no visible location beats the
wrong location"). The mobile figure is zero on purpose — §Q8 corrected an
earlier ≤120 KB mobile-crop budget once the mobile captures showed Fiverr
ships no hero image on a phone at all. Do not art-direct a mobile crop;
replace the element. Preferred provenance is **commissioning a beta photographer through
the platform** — a completed job, real GMV, a case study and hero art in one.

### Hero photography — WAITING ON ASSETS (2026-08-12)

**Beta creatives are sending photographs.** Not yet received. The landing page
ships **without any hero image** in the meantime, and that is a real shipping
state, not a stub:

- **Mobile needs no image at all** — `DESIGN.md` §10 and audit §Q8. Fiverr
  ships none either. So the mobile hero is *finished*, not waiting.
- **Desktop ships the flat band too** until photographs land. It reads as a
  deliberate editorial choice on warm paper, not as a hole.

**When the photographs arrive:**

1. Check each against `DESIGN.md` §10 — no eye contact, real space,
   mid-action, already dark, dead space on the left for the headline, and no
   visible location that isn't Malawi
2. Drop each behind the scrim and **screenshot it at 1280px** before judging.
   A photograph plus scrim plus white type cannot be judged from markup (§10)
3. AVIF + WebP fallback, responsive `srcset`, LQIP, `priority`, **≤160 KB**
4. Desktop only — do not introduce a mobile hero image
5. Credit the photographer, and log the shoot as a real job on the platform if
   it was commissioned through it

The hero component takes an optional image from day one, so this is a swap,
not a rebuild.

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
