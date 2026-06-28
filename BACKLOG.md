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

## To add as we find them
