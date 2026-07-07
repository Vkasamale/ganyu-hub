# Changelog

A running log of what has actually shipped, newest first. For the product
vision and unresolved decisions, see [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md).

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
