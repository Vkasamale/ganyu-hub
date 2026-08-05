# Backlog — Nice-to-haves and improvements

Things that work but could be better. Not urgent, not blocking. Pull from here when there's room.

## Auth / Login (next-session task — scoped 2026-08-05)

- **"Continue with Google" login.** Build end-to-end; plumbing already exists (`app/auth/callback/route.ts`, SSR clients in `lib/supabase/`).
  - **User prerequisite (do first):** create a Google OAuth client — Google Cloud Console → APIs & Services → Credentials → OAuth client ID → Web application. Authorized redirect URI = `https://jbczoiiewuerssckkiuq.supabase.co/auth/v1/callback`. Paste Client ID + Secret into Supabase → Authentication → Auth Providers → **Google**, enable, save. (Provider is Disabled as of 2026-08-05.)
  - **App build:** add a "Continue with Google" button on `app/login/page.tsx` + `app/signup/page.tsx` calling `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: <site>/auth/callback } })`. Verify `app/auth/callback/route.ts` completes the code exchange and lands the user correctly.
  - **⚠️ The real work — role wrinkle:** email/password signup captures `role` (creative/client/agency) via `signUp` metadata (`app/actions.ts:39,54`); downstream logic keys off `profiles.role` + `onboarded_at`. **Google users skip the form → arrive with no role.** Must add a one-time "Are you a creative or a client?" step right after first Google sign-in (fold into the existing onboarding redirect — dashboard already routes un-onboarded users by role). Do NOT ship Google login without this; a null-role account breaks onboarding/job flows.
  - Confirm-email doesn't apply to Google (Google already verified the address) — only the role step is needed for OAuth users.

- **Passkey (WebAuthn) authentication — DEFERRED, do not build yet.** Supabase Passkeys is BETA; needs WebAuthn UI, device registration/management, and fallbacks. Email+password + Google covers every user at v0.8.0 — marginal benefit for real complexity. Revisit only if users ask. Requested 2026-08-05; deliberately held.

## Infrastructure

- **Turn on Plausible analytics.** Script tag shipped 2026-07-16, gated by env var. To activate: (1) sign up free at plausible.io, (2) add site `ganyu-hub.vercel.app` (later `ganyuhub.com`), (3) set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=ganyu-hub.vercel.app` in Vercel env, (4) redeploy. Pageviews only — custom events (`job_posted`, `job_completed`) added later if pageview data can't answer the question.

- **Buy `ganyuhub.com` and verify in Resend.** `ganyu.com` is NOT owned by us — it will never verify, remove that entry from Resend once the correct domain is live. Until then, emails route through Resend sandbox (`onboarding@resend.dev`) and only deliver to the Resend account owner (`vinnykasa@gmail.com`). Once `ganyuhub.com` is purchased and DNS records added: update `EMAIL_FROM` in `.env.local` to `Ganyu Hub <notifications@ganyuhub.com>` and redeploy. Part of Money Unlock Day.

## Identity & Trust (Public Launch / Scale tier — not beta)

- **Phone OTP verification for clients.** Lets guest-adjacent clients (e.g. a one-off "find a nail tech" hire) verify a real, reachable phone number without requiring an email, which most don't have reliably. Researched 2026-07-20: Twilio is too expensive for Malawi delivery (~$0.33/SMS, international routing tax). eSMS Africa advertises Malawi-local rates from ~30 MWK (~$0.017/SMS) with TNM/Airtel Malawi coverage, but support confirmed Malawi is NOT in their standard published pricing table and needs custom route provisioning via their engineering team (WhatsApp +254 114 494 147) — treat their advertised rate as unconfirmed until it's in writing. Africa's Talking is a credible backup, also lists Malawi, no public per-country rate, needs a direct quote. Also confirm whether Supabase Auth's phone-provider integration supports a custom/generic SMS webhook or only has built-in Twilio/MessageBird/Vonage adapters — may need a standalone OTP table + verification flow outside Supabase Auth if not. Do not build until a route is confirmed live and priced by a real test OTP to a real Malawi number.

- **ID + liveness verification badge for creatives.** Upgrades current KYC (ID captured before payout) to a certified badge: document scan + liveness check, verified creatives surfaced as more trustworthy / more likely to be hired. Handled by dedicated IDV vendors (e.g. Smile Identity, Youverify, Trulioo), not SMS gateways. Rough industry pricing ballpark ~$0.50–$2+ per verification depending on provider/coverage/liveness — meaningfully more expensive than OTP, unconfirmed for Malawi specifically, needs a real quote before committing. Not needed at beta scale (6 personally-recruited creatives you can call directly); revisit once supply is large enough that you can't personally vouch for everyone.

- **Agency accounts.** Frozen per Roadmap v3 feature freeze (Phase 4, after 3 paid jobs). Raised again 2026-07-20 mid job-events build — deliberately not scoped further right now to protect focus on the in-flight timeline/revisions/file-delivery sessions. When revisited: needs a real definition of what "agency" means on the platform (a profile type that manages multiple creative sub-profiles? a client-side team account? billing consolidation?) before any schema work starts — don't let a Claude Code session invent the model.

## Theming

- **Dark mode for public launch.** Site is heavy on white surfaces (`bg-paper`, `bg-white`, `card-soft`) and the reading experience gets tiring on long pages (Terms, dashboards, `/browse`). Ship a dark theme for the public-launch marketing push — not urgent for beta since the surface is still moving weekly and every color change would need re-QA in both themes. Approach: add a `dark:` variant sweep across the design tokens (`text-ink`, `text-ink/60`, `bg-paper`, `bg-wash`, `border-ink/10`, `card-soft`), toggle in the navbar with `next-themes`, respect `prefers-color-scheme` on first visit. Budget half a day to a day plus visual QA across every route. Do NOT ship piecemeal — half-themed pages look broken.

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

## Pre-launch decisions (deferred from 2026-07-02)

- **Client identity verification tiers.** Beta / early access: name + phone only. Full ID verification kicks in once escrow goes live and real money is held — hard requirement before PayChangu ships, not before beta.
- **Content policy + moderation ownership.** Beta ships with a three-line manual rule set (no adult content, no political material, no MLM). Full policy + moderator assignment happens after beta feedback, when the real moderation surface is visible.

## To add as we find them
