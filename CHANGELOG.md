# Changelog

A running log of what has actually shipped, newest first. For the product
vision and unresolved decisions, see [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md).

## 2026-07-13 — Minimum payout floor on cancellations (MWK 1,000)

Below MWK 1,000 the PayChangu transfer fee eats most or all of the money, so paying it out is theatre — recipient sees zero, platform loses fees. New `MIN_PAYOUT_MWK` in `lib/fees.ts`: any cancellation leg whose after-reserve amount falls below it skips `initiatePayout` entirely and stays with the platform. Admin queue shows exactly what happens ("payout MWK 0 — below MWK 1,000 floor — rolled to platform") and the amber warning explains why. Honest to the recipient (they'd get zero either way) and stops us burning transfer fees on dust.

## 2026-07-13 — Cancellation payout-fee reserve (flat 15% off each side)

Platform's 10% cut on a cancellation was being eaten by PayChangu's per-payout transfer fees (bank is MWK 700 flat), turning small cancellations into a loss. New rule: each side's cancellation share is reduced by a flat 15% reserve (`CANCELLATION_PAYOUT_RESERVE_PCT` in `lib/fees.ts`) before we hand it to `initiatePayout`, so PayChangu's fee comes out of the recipient's slice, not the platform's. Admin queue now shows the pre-reserve share, the reserve deducted, and the actual payout — plus a warning when either side's share is under MWK 4,700 (where 15% no longer covers the MWK 700 bank flat). Tune the constant if reality disagrees. Removed the redundant [BACKLOG.md](BACKLOG.md#payments) entry for this.

## 2026-07-13 — Admin cancellation queue: include paid top-ups in gross

The queue displayed `collection_amount_mwk || accepted_bid_mwk` as the gross to split, which ignored paid top-ups. `adminResolveCancellation` was already validating against `total_paid_mwk`, so the enforcement was correct — only the UI showed the wrong number and misleading split percentages. Switched display to `total_paid_mwk || collection_amount_mwk || accepted_bid_mwk` and added a breakdown line for top-up jobs: `(original X + top-ups Y)`. Testing Step 4 caught this: a MWK 9k job with a paid MWK 5k top-up showed "gross 9,270" instead of 14,000.

## 2026-07-13 — Top-ups locked to `payment_held`; creative fee-net line

Testing Step 4 surfaced a math problem: after `payment_released`, top-ups could still be created and paid, which meant "in escrow" numbers no longer matched what was actually held. New rule — top-ups only while `escrow_status = 'payment_held'`. `requestTopUp` and `payTopUp` both reject otherwise; the creative-side request form is hidden post-release. Tips-after-release moved to [BACKLOG.md](BACKLOG.md#payments).

While there, added a small fee-net hint on the creative's `EscrowPanel` when funds are held: "You'll receive ~MWK {net} after Ganyu's 15% fee." Uses `creativeAmount()` on `total_paid_mwk`. Client side unchanged — they think in gross, creative thinks in net.

## 2026-07-13 — Payout: round decimals + remove duplicate refresh button

`verifyPayout` was returning PayChangu's raw decimals for `amount` / `fee`. `reconcilePayout` then wrote them into the int columns `payout_amount_mwk` / `payout_fee_mwk`, which Postgres silently rejects, so `payout_status` stayed `"pending"` even though the UI toast said "Payout confirmed. Status updated to Released." Rounded both to integers, same fix already applied to `verifyPayment`. Also deleted a duplicated "Refresh payout status" JSX block in `escrow-panel.tsx`.

## 2026-07-13 — Fix job page 500 (revalidatePath during render)

`app/jobs/[id]/page.tsx` calls `reconcilePayout()` at render time to settle missed payout webhooks. `reconcilePayout` internally called `revalidatePath`, which Next 14 forbids during render — the whole page threw and users saw "Something went sideways" on any job with a pending payout. Gave `reconcilePayout` an optional `{ skipRevalidate: true }` mode; the render-path caller uses it (the page re-fetches the row right after, so revalidate is redundant there). Form-action callers in `escrow-panel` unchanged.

## 2026-07-12 — Disambiguate jobs↔proposals PostgREST embeds

Session C's new `jobs.pending_accept_proposal_id` FK created a second `jobs↔proposals` relationship, so every unqualified PostgREST embed started returning `PGRST201` and zero rows — silently on the dashboards. Pinned the three embeds in `app/dashboard/jobs/page.tsx` and `app/dashboard/proposals/page.tsx` to `!proposals_job_id_fkey`. (An earlier one-off fix on `bada1cb` handled the actions layer; this catches the read-side pages that failed later, uncovered by the E2E rerun.)

Test 5 in `client-job-flow.spec.ts` (dispute-while-scope_pending) skipped with a TODO — it was written for single-click accept, but Accept is now picker → Pay → PayChangu webhook → `scope_pending`. Belongs in the Session 3b PayChangu-sandbox bucket; un-skip when that lands and rewrite it to drive the real chain.

## 2026-07-12 — E2E spec hardening

- `login()` helper in `tests/e2e/helpers.ts` now clears cookies before navigating, so session state from one spec file can't leak into the next.
- `client-job-flow.spec.ts` fills the new required Brief (200-char min) + Deliverables fields on the post-job form.
- `postJob` action revalidates `/dashboard/jobs` on success so the just-posted row appears without a manual refresh.
- Mock Supabase (`tests/helpers/mockSupabase.ts`) now validates enum status filters and errors on bogus values — the "declined" vs "rejected" bug (below) slipped past tests before because mocks silently accepted any string.

## 2026-07-12 — Fix Session 1 cap: `declined`, not `rejected`

`proposals.status` is a real Postgres enum with values `pending | accepted | declined | withdrawn`. `submitProposal` and the job page's reapply banner filtered `.eq("status", "rejected")` — a value that doesn't exist — so `rejectedCount` was always 0 and the entire 3-attempts cap feature was inert. Fixed both call sites (`app/actions.ts:630`, `app/jobs/[id]/page.tsx:66,465`). Unit tests grew regression coverage for the enum check via the mock-hardening above.

## 2026-07-12 — Test coverage for Sessions 1/2/3

New unit tests for the server actions and cron paths introduced in Sessions 1, 2, 3a, and 3b: `tests/actions/submitProposal.test.ts`, `invites.test.ts`, `topups.test.ts`, `dispute-cancellation.test.ts`. Playwright spec `sessions-1-2-3.spec.ts` walks the happy paths for the proposal cap, direct invites, and topup request/decline live in a browser.

## 2026-07-12 — Session 3b: top-up accept-and-pay

Creative-requested top-ups are now billable. Client picks a rail on the pending request, `payTopUp` builds a PayChangu `initiatePayment` charge like the initial acceptance flow, callback + webhook routes handle both `job:<id>` and `topup:<id>` tx_refs. On success, the new `increment_total_paid` RPC atomically bumps `jobs.total_paid_mwk` by the request amount and flips the topup to `paid`. Payout math (`lib/money.ts`) reads `total_paid_mwk` with `accepted_bid_mwk` fallback.

**Migration required:** re-run `supabase/schema.sql` for the `payment_topups` table and `increment_total_paid` RPC.

## 2026-07-12 — Session 3a: top-up requests + decline

Creative side of the top-up flow. New `payment_topups` table, `requestTopUp` action (one pending per job), `withdrawTopUp` (creative), `declineTopUp` (client). Top-up UI on the job page for both parties. Dispute + cancellation transitions auto-cancel any pending topup; a 72h non-response cron ages abandoned requests to `cancelled`. Money layer respects `total_paid_mwk` for `creativeNet` and the admin cancellation split.

## 2026-07-12 — Session 2: direct client-to-creative invites

New "Invite to job" button on creative profiles (client-only). Dropdown lists my open jobs, marks already-invited ones as `(already invited)`. Invited creatives get a notification + a banner on the job page and bypass the 3-attempts cap (Session 1). New `job_invites` table + `inviteCreative` / `respondToInvite` actions.

## 2026-07-12 — Session 1: 3-attempts-per-creative proposal cap

A creative gets at most 3 declined attempts on the same job before being blocked from resubmitting (`declined | withdrawn` count; direct invites bypass). Reapply banner shows "attempt N of 3" between attempts; blocked state shows an "Only a direct invite from the client can reopen this" card. See the enum-string fix above — this feature was inert on ship day and only actually engaged after `478e575`.

## 2026-07-12 — Admin error log + user report system

- `errors` table + `sanitizeError()` helper: server actions surface a short, user-safe message and stash the raw stack + payload in `errors`.
- User-facing "Report an error" link in the footer opens a form that writes into the same table with the current URL + user id.
- `/admin` gets an Errors card listing recent entries with the raw payload one click deep.

**Migration required:** re-run `supabase/schema.sql` for the `errors` table + policies.

## 2026-07-12 — Job form: description overflow + friendlier deadline

Long briefs no longer break the layout on the job detail page (proper wrapping + max-height + scroll). Deadline picker now shows a human date ("20th of July 2026") and a "N days left" pill, and defaults to a sensible offset instead of yesterday's date.

## 2026-07-12 — Cron: hourly → daily (Hobby plan)

Vercel Hobby only allows daily crons. All hourly schedules (dispute non-response, topup expiry, deadline extensions) collapsed to a single daily cron. Semantics unchanged, just less frequent aging.

## 2026-07-12 — Session D: cancellation + deadline extensions + 72h non-response cron

Either party can request cancellation with a reason; the other party has 72 hours to accept or dispute. Creative can request a deadline extension with a proposed new date; client accepts or declines. A cron ages non-responded requests: cancellations auto-resolve, extensions auto-decline. New columns on `jobs` for pending cancellation/extension state, plus `cancellation_requests` and `deadline_extensions` tables. `adminResolveCancellation` splits escrow according to work-done proportion.

**Migration required:** re-run `supabase/schema.sql`.

## 2026-07-11 — Fee-on-top for client, fee-through for creative

Real fee capture on both rails.

- Client is charged `bid + PayChangu collection fee` at accept-and-pay. Full bid lands in escrow; fee is recorded on the job so it shows on receipts.
- Creative receives `bid − PayChangu payout fee`; payout amount and fee stored per job.
- `AcceptProposalPicker` shows a live breakdown (bid + fee = total) per rail (mobile money / bank / card).

New columns on `jobs`: `collection_rail`, `collection_amount_mwk`, `collection_fee_mwk`, `payout_fee_mwk`. Money helpers (`lib/money.ts`, `lib/fees.ts`) are now the single source of truth for both dashboards.

**Migration required:** re-run `supabase/schema.sql`.

## 2026-07-11 — Session C: payment-first acceptance

Accepting a proposal no longer instantly locks the creative in. Client picks a payment rail, the app starts a PayChangu charge, and the proposal only wins once escrow is funded (`escrow_status = payment_held`). While payment is in flight, `jobs.pending_accept_proposal_id` marks the tentative winner and both parties see a "Payment pending — this creative isn't locked in yet" card. If the payment fails or times out, the pending marker clears and other proposals stay decideable.

- New action path: `decideProposal('accepted', rail)` → `initiatePayment` → PayChangu redirect → callback/webhook finalizes.
- Errors from `decideProposal` are now surfaced verbatim on the form (the silent-failure path was hiding the real cause).
- `bada1cb` fixed a same-day PGRST201 in the actions layer caused by the new FK (a broader sweep landed as `0443041` today).

**Migration required:** re-run `supabase/schema.sql` for `jobs.pending_accept_proposal_id`.

## 2026-07-11 — Multiple saved payout methods + per-job override

Creatives can save more than one payout destination (default flagged), with a tabbed Add-method form (mobile money / bank / card; the "Type" label above the tabs was redundant, dropped). Per-job payout override lets a creative pick which saved method receives a specific release. Payout reconciliation runs automatically on `/dashboard/payments` load and via a manual button (same pattern as the collection callback).

New table `payout_methods` with RLS scoped to owner; new column `jobs.payout_method_id`.

**Migration required:** re-run `supabase/schema.sql`.

## 2026-07-11 — Prevent double-payout on Release

The Release button could fire twice under a slow network and produce two PayChangu payouts. Now: server-side lock on `jobs.payout_status` (only `none` can transition to `initiated`), UI hides the button once initiated, and the payout webhook matches by `job_id` so a duplicate charge id can't re-mark the job.

## 2026-07-10 — Release payment: creative-email lookup fixes

Three small fixes chained together:

- `295417d` — `releasePayment` was failing with "creative profile not found" because the query joined on the wrong column; corrected.
- `75f60cf` — When the lookup did fail, the error was swallowed; now the real cause bubbles up to the client for a report.
- `e451335` — `profiles` has no email column; the lookup now goes through `auth.users` (via the existing `get_user_email` RPC).

## 2026-07-10 — Payment details card for all roles + checkout prefill

The "Payment details" card on the job page used to only render for the client; creatives couldn't see the rail, fee, or status of a payment they were about to be paid from. Now visible to both parties. PayChangu checkout is prefilled with the client's saved name/phone/email to skip re-entry.

## 2026-07-10 — Wire PayChangu payouts (mobile + bank)

Payouts to the creative go out on real PayChangu rails (mobile money + bank). Server-side verify roundtrip mirrors the collection flow: initiate → poll/verify → mark `jobs.payout_status = paid`. Webhook path shares the callback dispatcher used for collections.

## 2026-07-09 — Brand logo + navbar grid alignment

Placeholder "K" swapped for the actual `G` mark. Navbar container now uses the same max-width + horizontal padding as page content, so the logo lines up with the leftmost column of the grid on every route.

## 2026-07-08 — Wire escrow collection to PayChangu sandbox

First real payment leg. Accept-a-proposal flow calls `initiatePayment` → PayChangu hosted checkout → callback lands on `/api/paychangu/callback` → server-side verify moves `escrow_status: none → payment_held`. Webhook path (`/api/paychangu/webhook`) is idempotent by `tx_ref` and covers the case where the redirect is lost. Env vars: `PAYCHANGU_SECRET`, `PAYCHANGU_PUBLIC_KEY`, `PAYCHANGU_BASE_URL`.

## 2026-07-08 — Content policy page + disclosure links

New `/policy/content` page describing what can/can't be posted (no adult, no illegal, no MLM, no harmful/dangerous services). Post-job and portfolio-add forms link to it under their submit buttons, both as click-through consent (not gating).

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
