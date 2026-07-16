# Backlog — Nice-to-haves and improvements

Things that work but could be better. Not urgent, not blocking. Pull from here when there's room.

## Infrastructure

- **Turn on Plausible analytics.** Script tag shipped 2026-07-16, gated by env var. To activate: (1) sign up free at plausible.io, (2) add site `ganyu-hub.vercel.app` (later `ganyuhub.com`), (3) set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=ganyu-hub.vercel.app` in Vercel env, (4) redeploy. Pageviews only — custom events (`job_posted`, `job_completed`) added later if pageview data can't answer the question.

- **Verify `ganyu.com` in Resend.** Domain added 2026-06-25, currently Pending DNS verification. Until verified, emails route through Resend sandbox (`onboarding@resend.dev`) and only deliver to the Resend account owner (`vinnykasa@gmail.com`). When status flips to Verified: update `EMAIL_FROM` in `.env.local` to `Ganyu Hub <notifications@ganyu.com>` (or similar) and redeploy.

## Accessibility

- **Finish the WCAG contrast sweep.** Audited 2026-07-16. `text-brand` swapped to `text-brand-dark` on auth pages (login/signup/forgot-password/jobs signup CTA) — those are AA-compliant now. Still to do: `text-stamp` used as small-text links across dashboard/browse (`app/dashboard/page.tsx`, `app/dashboard/jobs/page.tsx`, `components/filters-bar.tsx`, `app/creatives/[id]/page.tsx`, and status badges on `app/dashboard/payments/page.tsx`) — #069494 on white = ~3.7:1, fails AA for normal text (needs 4.5:1). Safe fix: `text-stamp` → `text-stamp-dark` (#046B6B ≈ 5.4:1) anywhere it's on a white background. Skip usages on colored backgrounds like `bg-stamp/10` badges (those still meet contrast). Reduced-motion is already handled globally via `app/globals.css:36` — nothing to do there.

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
