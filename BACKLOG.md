# Backlog — Nice-to-haves and improvements

Things that work but could be better. Not urgent, not blocking. Pull from here when there's room.

## Performance

- **Notification latency.** Observed ~30s end-to-end delivery during 2026-06-25 testing. Realtime is meant to be near-instant; polling fallback is 15s. Investigate: is Realtime firing at all on prod-like setup? REPLICA IDENTITY FULL is set — check the channel actually subscribes (browser console) and that the publication includes `notifications`. If Realtime is dead, drop polling to 5–10s as a stopgap.

## Infrastructure

- **Verify `ganyu.com` in Resend.** Domain added 2026-06-25, currently Pending DNS verification. Until verified, emails route through Resend sandbox (`onboarding@resend.dev`) and only deliver to the Resend account owner (`vinnykasa@gmail.com`). When status flips to Verified: update `EMAIL_FROM` in `.env.local` to `Ganyu Hub <notifications@ganyu.com>` (or similar) and redeploy.

## Trust & Loop-Closing

- **Reviews / feedback after completed work.** Once a job hits `completed`, prompt both sides (client and creative) to leave a rating + short written review of the other party. Surfaces on profiles (star average, recent reviews) and feeds into search ranking. The `reviews` table is already in the schema but isn't wired to anything. Important for the open-signup trust model.

## Media

- **Image upload for portfolio (and avatars).** Right now portfolio items take a `cover_url` text field, so creatives have to host images elsewhere and paste a URL. Wire up Supabase Storage: create a `portfolio` bucket with public read + owner-only write, swap the URL input for a file upload that stores to `portfolio/<profile_id>/<uuid>.ext` and saves the public URL. Same for profile avatars.

## Search & Filters

- **Job and creative filters: verify they actually work.** `<FiltersBar>` on `/browse` and `/jobs` exposes category multi-select, skills tags, price range, and sort. None of this has been tested end-to-end since the feed/Trending refactor. Sit with each filter, change values, confirm URL params update + results actually narrow. Likely culprits if broken: SSR filters reading from URL searchParams but the FiltersBar client component not pushing them back, OR Supabase queries ignoring the param when it's an empty string.

## Landing-page imagery

- **Hero right-side imagery.** Removed 2026-06-29 — the layered photo + chitenje block + clay arc + spinning "Find creatives" badge on the right column was pulled to keep the launch landing page clean while the imagery story is figured out. The `<HeroArt />` component (`components/hero-art.tsx`) and `/public/hero-photographer.webp` are still in the repo as a starting point. To bring it back: re-add the right column in `app/page.tsx` (revert the `grid-cols-[1.15fr_1fr]` block) and pick the imagery direction — single portrait of a real Malawian creative we've onboarded, a portfolio collage from real shipped work, or stay graphic-only with the chitenje composition. Best after we have 3–5 seeded creatives whose portraits/work we can actually feature.

## Landing-page proof

- **Landing hero proof row.** Removed 2026-06-29 — placeholder stats ("5 categories live", "K — local currency", "48h median time to first proposal") were aspirational, not real. Bring back once we have actual numbers worth quoting: real category count from `CATEGORIES.length`, real median-time-to-first-proposal from `proposals.created_at - jobs.created_at`, and either a "creatives live" count or a recognisable client logo strip if/when we have one.

## Search & Filters — followup

- **Filter pill highlight doesn't update on click.** `/browse` and `/jobs` category multi-select: clicking a category in the dropdown does not visually mark it as selected immediately. The selected state only renders after "Apply filters" is pressed — so you filter blind. Also: after "Clear all", re-opening the dropdown still shows the previous selections checked — clear isn't detaching the local UI state from prior committed state. Fix: make the dropdown drive off a local `useState` mirror of the committed filters, update it synchronously on click, and reset it from props when committed filters change (including clear-all). Filters themselves work end-to-end — purely a selected-state UX bug in `<FiltersBar>`.

## Monetisation (blocked on payment rails)

- **Featured / boosted listings.** Paid placement for creatives — either creative pays to boost their profile in `/browse` results, or client pays to boost their job in `/jobs`. Sits behind the mobile-money integration since it needs to actually charge someone. Simplest cut when ready: `profiles.featured_until timestamptz` + card sort key + subtle gold border on card. Admin-granted boost is a possible pre-payments stopgap for launch partners.
- **International card payments (Stripe / Paystack / Flutterwave).** Phase 2 — local mobile money ships first. When we open this up: Paystack has best Malawi card presence, Stripe requires a workaround entity, Flutterwave supports MWK. Should route through the same escrow abstraction as mobile money so the UI doesn't fork by payment method.

## Ideas — creative-facing (post-analytics)

- **Git-as-portfolio for devs.** Let developer creatives link a GitHub repo per portfolio item; auto-pull the README (rendered) and, for web projects, an embedded live preview (via a headless render service or Vercel/Netlify deploy hook). Would remove the "paste screenshots of your work" friction for devs and match the platform's skill-first, portfolio-is-your-credential ethos. Would need: OAuth GitHub for the creative, a repo URL field on `portfolio_items`, a fetch/render worker.

## To add as we find them
