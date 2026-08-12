# Changelog

A running log of what has actually shipped, newest first. For the product
vision and unresolved decisions, see [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md).

## 2026-08-12 — Phase 3, testimonials (v0.9.4)

`IMPLEMENTATION_PLAN.md` items 26-28, audit §M11, §M1. The cold-start fix, and
it comes before extending reviews on purpose: in closed beta, `reviews` cannot
produce a row until an on-platform job completes, while a designer who has
worked in Blantyre for six years has clients who would vouch for them today.

**A separate `testimonials` table, NOT `reviews`** — and this corrects an
assumption made earlier in the session, when L8 was built on the belief that
Phase 3 would feed the review flow. A review is backed by a completed job and
money that moved through escrow. A testimonial is a past client vouching for
work Ganyu Hub never saw. Both are worth showing; merging them lets the weaker
signal borrow the stronger one's credibility. **The landing carousel therefore
still reads `reviews` only** — its cards say "Verified client", which must stay
true.

**It is a REQUEST flow, which is the entire point.** The creative creates a row
(`pending`) and sends the link; the past client writes the words. Self-written
praise is worth nothing and every reader knows it.

**The creative can publish or hide, and cannot edit a word.** Enforced in the
database by column-level grants — `revoke update on testimonials from
authenticated; grant update (status)` — not by the UI declining to show an
edit box. A UI-only limit still leaves the API open.

**The link is single-use, enforced in the WHERE clause.** The submit updates
`.eq("token", …).eq("status", "pending")` rather than reading then writing, so
two people opening the same link cannot both submit. A spent link gets a warm
"already done" page rather than a 404 — the likeliest visitor is the person who
just submitted and pressed back.

**Public block labelled off-platform** (§M1): no stars, no average, its own
heading, and a line saying these are clients from before the creative joined,
"not tied to a job on the platform, and not backed by escrow."

Abuse controls on the public endpoint: Turnstile, an IP rate limit, a 10-link
cap on unused requests per creative, and `noindex` on the page.

## 2026-08-12 — Phase 2, derived trust numbers (v0.9.3)

`IMPLEMENTATION_PLAN.md` items 18-25, audit §G2, §F3, §F9, §L2. Zero schema —
every figure is computed from rows we already hold.

**Item 24, "About the client" on job detail** — the plan calls this the biggest
single gap in the product, and it is: the block that tells a creative whether
writing a proposal is worth their evening. `components/about-client.tsx`, shown
to everyone EXCEPT the client themselves, and skipped for unclaimed
creative-made jobs where `client_id` is still null.

**Escrow funded leads the block.** It is a stronger signal than Upwork's
"payment method verified" and we have had it since escrow shipped — we simply
never showed it.

**One definition of the numbers, in `lib/client-trust.ts`.** `/clients/[id]`
already computed its own hire rate off a different formula (jobs that left the
open pool ÷ posted, no minimum sample), so the same client could show one
percentage on their profile and another on a job page. That page now reads the
shared source; verified live, both surfaces now agree at 61%.

**Numbers withhold themselves below a useful sample size.** Hire rate returns
null under three jobs — one job reads as either 0% or 100% and both are wrong
about the person. Reply time returns null under three replies, because two fast
replies is a mood, not a habit. The UI omits the row entirely rather than
printing a dash (§Q7).

**Reply time is a median, and counts first replies only.** A five-message burst
answered once is one response, not five; counting each would flatter the
number. A median means one reply sent after a weekend cannot define someone.

**Nothing says "verified".** The plan asked for a "phone verified ✓" badge.
`profiles.phone` is a plain text column — there is no OTP flow anywhere in this
codebase — so the badge reads **"Phone on file"** with a tooltip saying we have
not verified it. A trust marker we cannot back is worse than none, especially
on the surface where someone decides whether to trust a stranger with a week of
work.

**A client with no history is told so, not hidden.** "New to Ganyu Hub", plus a
line pointing out that escrow still protects the creative either way.

**Item 25** — every money state on `/dashboard/payments` now carries a `?`. Our
tooltips carry more weight than a comparable platform's: we charge 2% + MWK 700
on bank payouts, hold funds to the next business day, and take a separate
collection fee on the way in. A bare number invites someone to assume the worst
about all three.

## 2026-08-12 — Phase 0 and Phase 1 (v0.9.2)

`IMPLEMENTATION_PLAN.md` Phase 0 (all 8 items) and Phase 1 (items 9-17). The
landing page's dark sections L8-L11 shipped in the same pass.

**Landing L8-L11.** `components/home-proof.tsx`. L8 testimonials and L9
featured creatives are query-backed and render nothing below their threshold
(3 testimonials, 6 profiles with a portfolio item) — §Q7's rule, the same one
`showProof` already followed. L8 reads `reviews` rather than a new
testimonials table: it already carries rating, free-text comment and a
role-neutral reviewee, and Phase 3 collects offline-client testimonials
through that same flow, so a second table would be a second store for the same
sentence. Carousel peeks per §Q8 (`pr-16 md:pr-24`), CSS scroll-snap, no
library, no client component.

L10 and L11 are constants, not queries — a story write-up is copy someone has
to write and "the client agreed to be named" is a permission no column
records. **Both show a stated "not yet" rather than hiding** (founder's call,
overriding the dark-by-default rule): the line explains that publication waits
on someone's permission, which is a fact worth saying out loud.

**Phase 0.** Money buttons name the amount (§N4) — `Release MWK 20,000`, built
in one place in `escrow-panel.tsx` and reused by the mobile bar so the two
cannot drift; the client-side panel was never passed `heldMwk` at all.
`components/sticky-action-bar.tsx` is mobile-only and **links to the real
button rather than duplicating the form** — two live submit buttons for one
payment is how double-charges happen. `EmptyState` gained a `tone`, because
§H2 wants two weights: a button for an empty inbox, a quiet line for an empty
thread where the compose box is already on screen.

**Unread counts (§H3) needed no migration.** Phase 0 claims "no schema", but
there is no message read-state in the database. Every `sendMessage` already
writes a notification with `target_type='thread'`, so unread notifications for
a thread ARE its unread messages — `unreadByThread` in `lib/thread-previews.ts`
counts those, and opening a thread clears them. Ceiling is documented in the
code: a message that failed to notify is invisible to the count, and exactness
would need a per-participant `last_read_at`.

**The weighted checklist quotes no invented statistic.** The plan asked for
"4.5x more likely to get hired"; we have never measured that. The weights that
shipped are arithmetic we can defend — `/browse` hides any creative missing a
headline, bio, portfolio item or priced service, so each is a quarter of being
listed, hence `+50% listing` / `+25% listing` and lines like "Without one you
don't appear in Browse at all", which is literally true.

**Phase 1.** Ten new columns, all nullable and additive (`supabase/schema.sql`,
applied 2026-08-12). Portfolio items became case studies (§M10): cost as a
RANGE rather than a single figure, which would read as a quote; blank stores as
null and never 0, so a half-filled case study shows only the halves that exist.
A backwards range is sorted rather than rejected — that is a typo, not an
intention. Profiles gained tagline, languages (`text[]`, not an enum — Malawi
has more languages than a hand-maintained dropdown), hours per week, open to
work, and open for messages.

**`open_for_messages` is user-declared and never inferred** (§K2). A green dot
derived from last-seen is a surveillance signal nobody consented to. It shows
"Closed for now" on the profile but deliberately does NOT hide the Message
button — silently removing someone's only route of contact is a bigger change
than the plan asked for.

The 10-13 block in `updateProfile` is gated on a hidden `profile_prefs` marker.
An unchecked checkbox is simply absent from `FormData`, so without the marker
every other caller of that action (onboarding, the account page) would silently
switch both toggles off.

Profile tabs (§F4) put the tab in the URL and hide panes with a class, so the
page stays a server component, `?tab=reviews` is shareable, and every section
stays in the HTML for search engines.

**Three plan corrections, all meaning less work than assumed:** item 9's stated
blocker is already resolved (`addPortfolioItem` has uploaded to a storage
bucket for some time; `cover_url` is not a pasted URL), and items 16 and 17
already existed — "View public profile" is in the dashboard sidebar, and the
portfolio edit page already had per-item update, delete and per-image removal.

## 2026-08-12 — Announcement bar (v0.9.1.2)

`IMPLEMENTATION_PLAN.md` L1c, audit §Q8: "one line, a CTA, full width — worth
having as a component for beta announcements and the eventual launch." This is
the last of the three above-the-nav pieces.

`components/announcement-bar.tsx`. The message is a single `ANNOUNCEMENT`
constant at the top of the file with the edit instructions in the docblock
directly above it; **set it to `null` and the bar disappears entirely** — no
empty strip, no placeholder, which is §Q7's rule applied to a component that
has no data threshold to gate on.

Shipped live rather than dark, because there is something true to say: Ganyu
Hub is in beta and escrow and payouts are real.

**Dismissal is keyed on the announcement's `id`**, not a single
"announcement dismissed" flag. Someone who closed the beta notice must still
see the launch notice; one shared flag would mean the second announcement is
never seen by anyone who ever closed the first. The docblock says to bump the
id whenever the message changes, because that is the one thing that will be
forgotten.

**The install banner now stands down while an announcement is live.** Found by
screenshot: an announcement plus an install bar plus the sticky nav is ~110px
of chrome before any content on a 375px screen, about a seventh of the
viewport. The announcement is founder-set and time-limited so it wins; the
install prompt returns on the next page load once the announcement is closed.
`install-banner.tsx` imports `announcementShowing()` rather than duplicating
the key.

**Copy trimmed after looking at it.** The first draft wrapped to three lines on
a phone with the CTA on the end. Shortened to one, with a comment on the
constant saying why it has to stay short.

## 2026-08-12 — Install banner above the nav (v0.9.1.1)

`IMPLEMENTATION_PLAN.md` L1b, audit §Q8. Fiverr pins an app-install row above
everything on the signed-out page; ours is the same idea minus the parts we
cannot honestly copy.

`components/install-banner.tsx` is new. It renders in `app/layout.tsx`
**before** `<Navbar />` rather than inside the landing page, because the nav is
`sticky top-0` and anything rendered inside `<main>` is below it by
definition.

**This closes a real hole, not a cosmetic one.** `components/push-banner.tsx`
already carried the iOS Add-to-Home-Screen instructions — the only way an
iPhone user can install a PWA, since Safari implements no
`beforeinstallprompt` — but it renders on the dashboard, behind sign-in. A
visitor deciding whether Ganyu Hub is worth an account never saw it. §Q8:
"behind sign-in, which is exactly the wrong side of the door for install".

It renders **only when there is something to offer**: either the browser handed
us a `beforeinstallprompt` to fire, or this is an iPhone not yet running from
the home screen. That one condition also keeps it off desktop Firefox and
Safari, and off anyone already running standalone — no width check, no UA
sniffing beyond the iOS branch that has to exist. It hides itself on
`/dashboard`, where `push-banner.tsx` already offers install; two rows asking
for the same thing on one screen is a bug.

`dismissed` initialises to `true` and is only cleared once `localStorage` has
been read, so a returning visitor never sees the bar flash in and shove the
page down.

**Not copied:** Fiverr's ★ 4.9 (670k) store rating. We have no store listing
and never will — we are a PWA — and a manufactured equivalent is the exact
hollow trust signal §M3 argues against.

**Found by screenshot:** at 375px the two-sentence copy wrapped to three lines,
making a permanent top bar far too tall against Fiverr's one line. The second
sentence is now `hidden sm:inline`; the headline carries it alone on a phone.

## 2026-08-12 — The footer becomes a footer (v0.9.1)

`IMPLEMENTATION_PLAN.md` L5. What sat at the bottom of every page was a legal
strip — copyright, a version badge, and five links in a row. Audit §J2 records
Fiverr at five columns and Upwork at four, both split by audience; §J3 ranked
the audience split as the biggest structural gap in the whole footer category.

`components/footer.tsx` is new and replaces the block that lived inline in
`app/layout.tsx`. Four columns: **For clients** (post a job, browse creatives,
how the money works, content policy), **For creatives** (join, find work, how
you get paid, report an issue), **Categories** (8 of the 24 in `CATEGORIES`,
each linking into a filtered `/browse`, plus "All categories"), and
**Company** (contact, terms, privacy, release notes). 22 links, every one of
them checked against a running server — all 200.

**Columns on `md:`, accordions below.** Audit §Q8: both references collapse
every footer column into a disclosure row on mobile, and that is the only
thing that makes a four-column footer survivable on a phone. It is a client
component for exactly that reason — one `useState` per column, with `md:block`
forcing them open above the breakpoint so the toggle only means anything on
mobile. Not `components/collapsible.tsx`: that is a native `<details>`, and
`<details>` cannot be reliably forced open by a media query across browsers,
which is the one behaviour this needs.

`/release-notes` is new — audit §J3 #6, "the What's New panel already exists
behind the version badge; give it a real link". Same `RELEASES` constant, no
second source of truth.

**Found by looking at it, not at the markup.** The footer's inherited `mt-16`
left a band of dead white between the closing CTA and the new paper ground.
The old strip needed that margin to separate itself from `<main>`; this one
has its own ground and a hairline, so the gap only read as a seam. Removed.

Not built: the "install the app" footer item (§J3 #5) belongs to L1b, the
install banner, and an accessibility statement (§J3 #7), which is the
founder's copy to write rather than mine to invent. Both stay in the plan.

## 2026-08-12 — The reference audit becomes a build order

**Documentation only. No code changed, no schema touched.**

`IMPLEMENTATION_PLAN.md` is new: the 79 findings in `DESIGN_GAP_AUDIT.md`
converted from observations into phased work, plus the landing page ahead of
Phase 0. The split rule is that we build anything needing a table, column,
query, route or form field, and Claude Design polishes spacing, type, colour,
motion and the stamp. Design can only design what exists, so structure ships
first and finish ships last. The Claude Design run in flight was terminated
deliberately — it was designing against a product about to change on nearly
every surface.

**Correction carried into the plan.** The audit claims in §C, §F and §G2 that
we have no reviews. That was written from screenshots without reading the
schema. `reviews` has shipped since 2026-07-03 (`supabase/schema.sql:211`)
with role-neutral `reviewer_id`/`reviewee_id` columns, so the bidirectional
requirement in §G3 is already satisfied structurally, and star averages
already render on `/creatives/[id]` and `/browse`. Phase 4 is therefore
"extend and surface" — multi-axis scores, a ratee's right of response, and the
client direction made visible — not "build reviews".

**`DESIGN_GAP_AUDIT.md` §Q** covers a second reference set of 16 signed-out
landing pages. Both Fiverr and Upwork build the hero the same way: a
full-bleed photograph darkened hard, white display type, and the search field
sitting on the image rather than below it. Neither uses a posed shot and
neither has anyone looking at the camera. Ours is flat `#EFE6CE` — everything
else in our hero already matches theirs, including a hire/work toggle Upwork
arrived at independently, so the photograph is the entire gap.

**`DESIGN.md` §10** is the imagery section the document never had, which is
why the landing page has no imagery. Scrim treatment and contrast floor, the
no-eye-contact rule, a ≤120 KB mobile budget against Fiverr's 1.4 MB hero, and
the constraint that a photograph showing the wrong country undoes the
"Malawian by default" claim — so when in doubt, shoot tighter, because no
visible location cannot be the wrong location. Preferred provenance is
commissioning a beta photographer through the platform: one completed job that
is simultaneously real GMV, a case study, and the hero art.

**§Q8, from mobile captures of the same two pages, corrects the imagery rule
the same day it was written.** Fiverr ships **no hero image at all on mobile**
— a flat brand band with headline and search; Upwork keeps one but darkens it
until it is effectively a dark ground. The hero photograph is a desktop
concern. Given Malawian data costs that is the better answer rather than a
compromise: the mobile hero ships zero image bytes, and the element is
replaced rather than art-directed. Also from that set: footers collapse to
accordions on mobile (which is what makes §J3's five columns survivable on a
phone), carousels deliberately let the next card peek at the right edge
because that is the only affordance signalling a swipe, and an
**install-the-app banner sits pinned above the nav while signed out** — the
iOS discovery path we do not have, since `components/push-banner.tsx` renders
its Add-to-Home-Screen branch only on the dashboard, behind sign-in, which is
the wrong side of the door for an install prompt.

**Standing rule recorded across all three:** build sections for data we do not
have yet, gate them on a real threshold, and render nothing below it.
`app/page.tsx:30` already does this for the proof row. Never a zero, never a
placeholder, never `★ — (0 reviews)`.

## 2026-08-08 — Installable app, and the first real push notification

**Ganyu Hub is now a PWA — additive, nothing removed.** `app/manifest.ts` is
Next's native manifest route (no `next-pwa`, no build plugin — that package
exists to generate this file and a Workbox worker, both smaller written by
hand). Icons are derived from the existing `public/logo-g.png`, including a
separate maskable variant inset to the 80% safe zone, because Android crops
`any` icons to a circle and would clip the G. `viewport.themeColor` and
`appleWebApp` in the root layout give the installed app its chrome. The only
change a web visitor sees is one dismissible banner on the dashboard.

**The service worker deliberately caches almost nothing.** `public/sw.js` is
~60 hand-written lines: navigations are network-first with `/offline` as the
fallback, and everything else — server actions, Supabase, RSC payloads, auth
cookies — goes straight to the network untouched. Every screen here is money,
jobs, or messages behind auth: a cached dashboard showing a stale escrow state
is worse than an honest offline page, and a cached response carrying one
account's data would survive a sign-out. The installability requirement is a
fetch handler, not a populated cache. Upgrade path noted in the file:
stale-while-revalidate for public `/browse` and profiles only, if it ever earns
its keep.

**Push is wired at `logJobEvent`, not at the call sites.** The two release paths
(`reconcilePayout` and the PayChangu webhook) race on every payout and are
already serialised by the compare-and-swap added for BUG-018 — exactly one of
them reaches the logger. Hooking the logger therefore means exactly one push,
for free, and avoids the second hand-maintained list that let `JOB_EVENT_TYPES`
drift from the SQL constraint. One event type only (`payment_released`) as
proof the pipe works end to end; the rest are one case each afterwards.

**Dead subscriptions prune themselves.** `lib/push.ts` deletes a row on 404/410
(the endpoint is gone for good) but keeps it on 429/5xx/network, which are
transient — deleting on any failure would silently unsubscribe a creative whose
push service had a bad minute. `sendPushNotification` never throws: push is a
courtesy on top of money that has already moved. Covered by
`tests/lib/push-prune.test.ts`.

**`push_subscriptions`** is keyed by `endpoint` **unique**, not by user — the
endpoint is the device identity, and without the constraint every dashboard
visit would insert a duplicate and a creative would get four copies of one
notification. RLS is a single `auth.uid() = profile_id` policy with no admin
read: these keys can put a message on someone's lock screen.

**Config, while in there.** `PAYCHANGU_WEBHOOK_SECRET_KEY` in `.env.local` was
a typo — `lib/payments.ts:126` reads `PAYCHANGU_WEBHOOK_SECRET`, so signature
verification was taking the `!secret` branch and rejecting every webhook
**locally**. Vercel had the correct name throughout, so no deployed environment
was ever affected. Renamed. An audit of all 20 variables against `process.env.*`
found three more dead entries (`PAYCHANGU_PUBLIC_KEY`, and the Google OAuth pair
that belongs only in the Supabase dashboard).

## 2026-08-07 (evening) — Messages becomes the record of the work

**The Jobs tab in notifications never worked, and not for the reason it looked
like.** `notification_kind` is a four-value enum written before jobs existed
(`proposal_received`/`accepted`/`declined` + `message_received`), so all twenty-odd
job notifications — deliveries, disputes, escrow moves, deadline changes — are
written as `message_received` because there is no other value to use. The tabs
matched `kind` against `/job|dispute|escrow/`, which hits none of them, so Jobs
was permanently empty and Messages swallowed everything. The tabs now read
`target_type`, which was already correct on every row (`job` / `thread` /
`creative`). No enum migration, no touching the call sites. Covered by
`tests/lib/notification-tabs.test.ts`.

**Every accepted job is now a conversation.** The schema already allowed it —
`message_threads.job_id` is nullable with `unique (client_id, creative_id,
job_id)` — and nothing used it. Acceptance creates the thread, so Messages holds
the history of every job whether or not either party types. The thread view
merges that job's events into the message stream by time, rendered as centred
system notes between the bubbles using the same labels as the job page, so a
question can sit directly under the delivery it is about. Events carry anchors
and the header offers a jump link to the most recent one — coming back after a
long stretch of talking lands on what happened, not the bottom of a scroll.

**The list reads like a chat app.** Search over job titles, names and preview
text; `All / Jobs / Direct` chips with live counts replacing stacked section
headings; a preview on every row showing the last thing that happened, message or
event ("Payment released to creative" needs no special casing); sorting by that
activity instead of creation date. Timestamps became clock-time / Yesterday /
weekday / date — the list previously showed "25d ago" directly above
"26/06/2026". Pinned to Malawi time with the near-midnight cases tested, since
that is precisely how BUG-008 happened.

**Job threads group under the person, collapsed by default.** Eighteen jobs under
one name is a scroll, not a list. Groups expand on click; search and the
currently-open thread force their group open, which is why expansion is React
state rather than a native `<details>`. 25 conversations now render as 5 rows.

**The job picker stops showing a UUID.** It pasted `[[job:<uuid>]]` into the
message box — a marker the user was never meant to edit and could half-delete and
send broken. The marker still goes out in the body; it now rides in a hidden
field while the composer shows a removable chip with the job's title.

**Backfill required and run**: `supabase/backfill-job-threads.sql` creates threads
for jobs accepted before this shipped, stamped with the job's real payment date so
they sort by history rather than bunching at the top. 42 threads created, 0
missing. Idempotent.

Noted while backfilling, not chased: four jobs sit at status `open` while
carrying an accepted proposal (`testign2`, `email testing`, `poster`, `logo`).
Almost certainly legacy seed data from before payment-first acceptance, but
anything reasoning "accepted ⇒ in progress" is wrong about those four.

## 2026-08-07 (later) — BUG-018 and BUG-012 both verified, and who closes a job

**BUG-018 is fixed, confirmed on a real release.** A fresh throwaway job
(`849eb4c9…`) run end to end produced exactly **one** `payment_released` row,
`via = reconcile`. The webhook arrived second, its filtered UPDATE matched
nothing, and it correctly logged nothing — the PostgREST behaviour the fix rests
on and that `mockSupabase` could never demonstrate.

**BUG-012 is fixed, also verified live.** The release was taken from
`payment_disputed`, and this time money actually moved: `payout_ref` written,
`payout_error` null, `escrow_status` `payment_released`. The old silent
fall-through that emailed the creative and moved nothing is gone. It produced a
single release event too, so BUG-018 is confirmed on the disputed path as well.

Also cleared live, all previously unverified: chevron collapsibles, the sandbox
settlement copy, and preview-deploy share links now emitting preview URLs. All
five money-state badges have now been seen on screen.

**Releasing payment no longer implies the job is done — because it isn't.** A
client may release early ("it's my friend, pay him now, sort it out later"), so
completion can't be inferred from payment. Instead: the escrow panel now
recommends releasing once satisfied, while making clear it's the client's call
and that funds can't be pulled back; and **closing the job is the creative's
action**, available only after `payment_released`. Closing an unpaid job would
just be a cancellation wearing a different label, so the server refuses it.

Left alone deliberately: sending a delivery still doesn't advance `status` —
"Mark as submitted" stays an explicit creative action. Known gap: a client who
releases early and goes quiet leaves the job open until the creative closes it.

## 2026-08-07 — BUG-017 closed, and the duplicate it revealed

A fresh end-to-end run in the sandbox — post, propose, accept, fund, release —
and `payment_released` landed with a real timestamp. **BUG-017 is verified
fixed.** The escrow-release-speed figure on `/clients/[id]` finally has
something to read.

The same query showed the event written **twice**, 620ms apart. Two writers race
on every release: `reconcilePayout`, which the job page calls at render time
whenever a payout is pending, and the PayChangu webhook. Both run
read-guard → `verifyPayout` → update → log, and `verifyPayout` is a network call
sitting between the guard and the write, so both pass the guard before either
writes. Fixed by making the UPDATE its own lock — each writer filters on the
pre-state and logs only if a row actually came back. Logged as BUG-018.

**The list that caused BUG-017 is no longer duplicated.** `JobEventType` is now
derived from a runtime `JOB_EVENT_TYPES` array, and a new test parses the CHECK
constraint straight out of `schema.sql` and fails if the two diverge. Two
hand-maintained copies became one list plus a guard.

**BUG-016 verified in passing** — a short brief is rejected and Title, Category,
Brief, Deliverables, Deadline and Budget all survive the error.

**Sandbox copy no longer lies.** The escrow panel and the accept picker both
promised funds settle "the next business day" even in sandbox, where settlement
is instant — which made every test run look broken. Both now say so when test
keys are in use.

**Share links from a preview deploy pointed at production.** `APP_URL` is
production everywhere, so sharing a sandbox job handed people a production URL
for a job that only exists in sandbox. `SITE_URL` now prefers Vercel's own host
on non-production deploys. Only `NEXT_PUBLIC_*` vars are read there — a
server-only var would be undefined in the browser bundle and reintroduce the
hydration mismatch that module exists to prevent. ⚠️ Requires "Automatically
expose System Environment Variables" in Vercel; without it, nothing changes.

**Collapsibles use a chevron now** instead of a "See more" text link — points
down when collapsed, flips up when open, with the label kept as screen-reader
text.

## 2026-08-07 — Job page: money state you can actually see

Released the funds on a live sandbox job and didn't notice anything had changed.
"Released to creative" was grey text in the same slot that had said "Money in
escrow" a moment earlier — three distinct financial states rendered as three
phrasings of one grey line. Held, released and disputed now each get a coloured
stamp badge in the title card: sky for held, emerald for released, red for
dispute, amber for pending, grey for not funded. It's a keyed map, so the
partial-deposit state ("x deposited") is one added key when that lands.

**Payment moved directly under the header.** It was the most important thing on
the page and a long scroll down.

**The big cards collapse.** Project brief shows a 110-character teaser with a
"see more" — the budget, deadline and revision terms below it stay visible,
since those are what people come back to check. Activity collapses to a single
line naming the current stage, expandable to the full history. Send delivery
collapses to its title. Built on native `<details>`: no state, no client JS,
works with JavaScript off.

**"Something gone wrong?" is a button now,** sitting in one action row beside
"Propose deadline extension" and "Cancel job", expanding into a card only when a
dispute actually needs explaining. A standing red card for a thing that usually
never happens was shouting.

Note for anyone re-reading the BUG-014 verification below: the header labels
changed with this work. "JOB VALUE" is now "Not funded yet" and "MONEY IN
ESCROW" is now "Held in escrow".

⚠️ Not yet looked at in a browser in any state.

## 2026-08-07 — A real release, and the bug it exposed

Ran the first complete escrow release end to end in the sandbox: EQ Admin posted
a throwaway job, Adam Creative proposed, the client funded MWK 2,000 and
released. The money moved. **No `payment_released` event was written.**

`job_events_event_type_check` never listed `'payment_released'`, though
`JobEventType` has emitted it since it was added, so every insert violated the
constraint. `logJobEvent` console-logs and returns instead of throwing —
deliberately, so logging can never block a payout — which made the failure
invisible in production.

That event's `created_at` is the only record of *when* a creative was paid;
`escrow_status` records only that release happened. Forward-only, so every
release before this has lost its timestamp for good. It also explains why the
escrow-release-speed figure on `/clients/[id]` had nothing to show: it was
waiting on events that could never have existed.

Unit tests could not have caught it — `mockSupabase` doesn't enforce CHECK
constraints, so both writers passed while neither worked. Only a real release
could surface it. ⚠️ The `alter table` was run on the live DB the same day, but
no release has been logged successfully yet — that check is still outstanding.

**Two sandbox-only changes made the test possible at all.** PayChangu settles
T+1, so releases are blocked for 24h after funding — correct for live, since the
provider holds one pooled balance rather than per-job funds, but pure friction in
sandbox where settlement is instant. `isTestMode()` keys off the `sec-test-`
prefix rather than `VERCEL_ENV`, so live keys in a preview deploy still get the
guard. The server exemption alone wasn't enough: the escrow panel disables the
Release button during the hold, so that gate had to be lifted in the UI too.

**Payout estimates now show both cash-out rails.** A single pessimistic figure
advertised MWK 1,260 on a 2,000 job when the creative would actually receive
1,960 — at that size the flat bank fee is the whole fee, so the estimate ran 35%
low. Mobile and bank now sit side by side, with the fee attributed to the payment
provider rather than left looking like ours.

tsc clean; 69/69. BUG-017.

## 2026-08-07 — Four bug fixes: disputed releases, escrow label, date format, form data loss

**A dispute resolved in the creative's favour now actually pays them.** Every
line of payout logic sat inside a branch gated on `escrow_status ===
"payment_held"`, so a release *from* `payment_disputed` — a legal transition —
fell straight through to the generic patch that only sets `escrow_status`. The
job was marked released, the creative was notified and emailed "Payment
released", and no money moved. No `payout_ref` was written either, so nothing
downstream flagged it. The branch now accepts `payment_held` **or**
`payment_disputed`; everything inside it, including the T+1 guard and the
idempotency claim, was already correct.

**The header no longer claims money is in escrow after it's been released.** The
label was hardcoded while the amount came from `total_paid_mwk ??
collection_amount_mwk ?? accepted_bid_mwk`, so a released job showed "MONEY IN
ESCROW MWK 80,000" directly above "Funds released to the creative. Done." It's
now derived from `escrow_status`, and the "Creative receives (est.…)" line goes
past tense once released.

**One date format instead of two.** The Deadline field rendered "1st of
September 2026" while the activity feed and extension panel showed `2026-09-01`.
`formatDeadline` now applies at all three raw-ISO sites. Rows written before
this keep their ISO body — they're test rows, not backfilled.

**A rejected form submit no longer throws away what you typed.** React blanks
uncontrolled fields once a form action settles, so failing validation on Post a
job wiped Title and Deadline while Brief and Budget survived (those components
hold their own state). `SavingForm` now snapshots the submission and refills
only the fields that came back empty — fixed in the shared wrapper, so every
form benefits. Files, passwords and hidden inputs are skipped.

tsc clean; 66/66. BUG-012, BUG-014, BUG-015, BUG-016.

## 2026-08-07 — Payout failures now say what actually went wrong

Two release attempts on a held job failed with admin-log entries reading
literally `[object Object]` (ERR-00012, ERR-00013). The reason was destroyed at
the throw site: PayChangu returns `message` as a string for most errors but as
an object (field → messages) for validation failures, and `new Error(obj)`
coerces to `"[object Object]"`.

That single coercion blinded every downstream consumer — `jobs.payout_error`
(`actions.ts:1547`) and `logAdminError` (`admin-errors.ts:32`) both derive from
`e.message`, so neither could ever recover the detail. On a money path where the
client sees only `GENERIC_MONEY_ERROR`, the admin log is the *only* place the
cause exists, and it was unreadable by construction.

`apiMessage()` in `lib/payments.ts` now serialises non-string messages, applied
at both throw sites (mobile `:201`, bank `:228`) since it's one root cause with
two call sites. No behaviour change on success paths.

Not yet diagnosed: *why* the bank payout is rejected. That needs one more
release attempt with this deployed — the point of the fix is that the next
failure will be legible.

tsc clean; 65/65.

## 2026-08-07 — Record *when* a creative gets paid

`escrow_status = 'payment_released'` recorded that release happened but never
when. `payment_held_at` marks the start of the wait; nothing marked the end. So
"how long did this creative wait to be paid" — the one thing a creative most
wants to know about a client before bidding — was not computable, even
approximately.

New `payment_released` event on the existing append-only `job_events` log,
written at both release sites: the payout webhook
([webhook/route.ts](app/api/paychangu/webhook/route.ts)) and the reconcile path
in `updateEscrowStatus`'s sibling. `updateEscrowStatus` itself doesn't write the
status — it initiates the payout and the HMAC-verified webhook flips it — so
those two are the complete set.

Chose the event log over a `jobs.payment_released_at` column: no schema change
(so no manual `schema.sql` re-run), `created_at` gives the timestamp for free,
append-only means it can't be quietly overwritten, and the release now shows on
the job timeline as "Payment released to creative" — visible value beyond the
statistic. Cost is one extra query whenever the average is computed.

**This is forward-only.** Releases that already happened are unrecoverable —
nothing ever stored the moment. Which is why it went in now rather than when the
client page wants to display it.

The stat is deliberately *not* on `/clients/[id]` yet: it would read "—" for
every client until real releases accrue. Marked in place with how to compute it.

`LABELS` in `job-timeline.tsx` is typed `Record<JobEventType, string>`, so the
compiler refuses the new member without a label — no silent blank rows.

tsc clean; 62/62.

## 2026-08-07 — Clients no longer asked to approve their own extra-revision charge

The "Payment top-ups" panel on `/jobs/[id]` renders any pending row with
**Accept & pay** / **Decline**. It was built for top-ups the *creative*
requests. An extra revision is the **client's own** charge, paid through its own
redirect — so the client was being asked to approve a request they made
themselves.

`requested_by_creative_id` can't distinguish the two: `requestRevision` stamps
it with the accepted creative either way (it has to — RLS keys on it). The
`EXTRA_REVISION|` marker in `reason` is the only discriminator, and it's already
what the callback and webhook key on, so the panel now uses it too — filtered at
the point `pendingTopup` is chosen rather than patched at each button.

Paid extra revisions still appear under History, which has no buttons.

That also made the marker-decoding block in the pending card dead — rows
carrying the marker no longer reach it — so it's gone; `reason` there is now
always the creative's own words.

Known narrow edge: while a client's extra-revision payment is mid-flight, the
creative sees the "Request top-up" form (no pending row is visible to them).
Submitting hits the one-pending-per-job constraint and returns the existing
friendly "You already have a pending top-up" error.

tsc clean; 62/62.

## 2026-08-07 — Deadline history, and clients get their own profile page

**⚠️ `supabase/schema.sql` changed — re-run it manually before this works in
production:** `alter table jobs add column if not exists original_deadline date;`

**Deadline history.** `jobs.deadline` was mutated in place by
`respondToDeadlineExtension`, so the first agreed date vanished the moment an
extension was approved. Deriving the original from `deadline_extensions` is
impossible, not merely awkward — that table stores `proposed_deadline`, the
*new* value, and the `deadline_extended` event logs `{ new_deadline }`. Nothing
ever recorded the value being replaced.

So: a new nullable `jobs.original_deadline`, stamped once via
`coalesce(original_deadline, deadline)` on the first approved extension. Later
extensions keep the first value. `/jobs/[id]` renders it struck through beside
the current date, matching what budget (`accepted_bid_mwk` vs `total_paid_mwk`)
and revisions already do.

**No backfill, deliberately.** `set original_deadline = deadline where
original_deadline is null` would stamp already-extended jobs with their
*extended* date and label it "originally" — a confident lie. Those jobs have
genuinely lost their original; null renders nothing, same as an unchanged
budget.

**Client vs creative.** `/creatives/[id]` rendered any profile, so a client's
page showed empty portfolio and services sections and an "Invite to job" button
aimed at someone who doesn't sell. The distinction now has a shape: a creative
is a seller and their page is a public shop window; a client is a buyer and
their page is a hiring record, read by one creative at one moment — deciding
whether to bid.

- New `/clients/[id]`: identity, jobs posted, hire rate, completed count, member
  since, and reviews from creatives. `noindex`, and gated to signed-in creatives
  (plus the owner); anyone else gets a short explanation, not a broken page.
- `/creatives/[id]` redirects to it when `role === 'client'`. Only on the
  explicit role — `role` is nullable until onboarding, and those profiles have
  shared links pointing at the creative route already.
- Reviews needed **no** schema change: `leaveReview` has always set
  `reviewee_id = isClient ? creativeId : job.client_id`. What was wrong was the
  route it generated — a creative's review of a client linked the client to
  `/creatives/…`. Now routed by side, with wording to match.

Escrow-release speed was left out of the client page: `jobs` records
`payment_held_at` but no release timestamp, so it isn't derivable. Marked in
place with the upgrade path.

Also fixed a stale vocabulary in `tests/helpers/mockSupabase.ts` —
`deadline_extensions.status` was listed as `accepted` when the code writes
`approved` and `superseded`, which would have thrown a misleading error at the
first test to filter on it.

tsc clean; 62/62 (was 58 — four new tests on the stamp).

## 2026-08-06 — Job page: share row moved to the foot of the brief card

Same treatment as the creative profile, for consistency. `ShareButtons` was
sitting in the byline strip (`Posted by … · 2h ago`) directly under `JobHeader`,
which mixed metadata with an action. It now sits at the **foot of the Project
brief card**, under the budget/deadline/revisions/format list, behind a hairline
divider and labelled "Share this job" — you share a job after reading it, not
before. Right-aligned on desktop (`sm:ml-auto`), stacks left on mobile.

The byline strip's `flex justify-between` was dead once it had a single child, so
it collapsed to a plain `<p>`.

`next build` compiled successfully; tsc clean; 57/57.

## 2026-08-07 — BUG-009: top-up payments were silently orphaned (money path)

Found by actually completing a sandbox payment. **Every top-up — extra revisions
and creative-requested top-ups alike — took the client's money and recorded
nothing.**

`payment_ref` is the only key the callback and webhook use to find a top-up
(`.eq("payment_ref", txRef)`). Both `requestRevision` and `payTopUp` wrote it
through the **user's** Supabase client and discarded the result. The
`topups update parties` policy's `WITH CHECK` requires the resulting row to have
`status = 'declined'`, so a write that leaves it `pending` is rejected — 0 rows
updated, silently. `payment_ref` stayed `NULL`, and neither settlement path
could ever match the payment back.

A **regression from the 2026-08-05 security audit**, which added that
`WITH CHECK` to stop either party self-marking `paid`. The hole it closed was
real; the collateral damage went unnoticed because the update's error was never
checked.

- Both writes now use a **service-role** client and `.select("id")` to prove a
  row was affected.
- On failure the action **returns an error instead of redirecting to checkout** —
  refusing money we can't reconcile beats taking it and losing it. Logged to
  `/admin/errors` with the tx ref.
- The RLS policy is **unchanged** — users still can't set `status='paid'`.
- New regression test: "refuses to reach checkout if the payment_ref write
  affects 0 rows". Suite 57 → **58**.

⚠️ **Check production** for top-ups paid between 2026-08-05 and this fix:
`select … from payment_topups where payment_ref is null and status = 'pending';`
See BUG_LOG for the full query and reconciliation note.

## 2026-08-06 — BUG-008 confirmed fixed + creative-profile actions moved to card foot

**BUG-008 closed.** Copy/share now work in prod on `/creatives/[id]`; the pinned
formatters below were the cause. Moved to Fixed in `BUG_LOG.md`.

**Profile hero card reordered.** Message / Invite to job / save / share used to sit
in the top-right of the hero, competing with the name and headline for attention.
They now sit at the **foot of the card**, below the category chips, behind their own
hairline divider — identity reads first, then what you can do about it. Share is
pushed right of the primary CTAs (`sm:ml-auto`) so "Message" stays the obvious
action, and stacks left on mobile. The old wrapper's `md:flex-row md:justify-between`
became dead once it had a single child, so it collapsed to a plain `relative z-10`
(kept — the avatar overlaps the banner).

`next build` compiled successfully; tsc clean; 57/57.

## 2026-08-06 — Pin locale + timezone in all formatters (BUG-008 lead)

Every helper in `lib/utils.ts` formatted with the **runtime default** locale and
timezone. Vercel renders in UTC; every user is in Malawi (UTC+2) — so the server
and the browser produced different strings for the same value.

Two bugs in one. Users saw the wrong day for the two hours before local midnight,
and React saw a server/client mismatch, which makes it discard hydration for the
whole subtree — killing every button inside it, not just the one that looked
broken. That is the leading explanation for BUG-008, and the route split lines up
exactly: `/jobs/[id]` and `/creatives/[id]` use these helpers, `/login` uses none
(grep count 0) and was the page that hydrated fine.

- `formatMwk` used `toLocaleString("en-MW")` — not present in every ICU build, so
  Node and the browser could fall back to different grouping. Now `en-GB`.
- `timeAgo`'s >30-day fallback used bare `toLocaleDateString()` — no locale, no
  timezone. Now routes through the new pinned `formatDate`.
- `daysUntil` compared against the *runtime's* local midnight. Now computes
  "today" in `Africa/Blantyre` explicitly, so deadline counts agree everywhere.
- `creatives/[id]` formatted "member since" with `toLocaleDateString(undefined, …)`
  — the browser's language on the client, Node's default on the server. Now uses
  the new `formatMonthYear`.
- `formatDeadline` was already deterministic; left alone.

New `tests/utils-format.test.ts` runs every formatter under four hostile runtime
timezones (UTC, Africa/Blantyre, Pacific/Kiritimati, America/Los_Angeles) and
asserts identical output, so an unpinned formatter can't creep back in.

⚠️ **Not yet confirmed as the whole cause** — the original BUG-008 report noted no
console error, and React usually logs hydration mismatches loudly. Needs a prod
click-test on the share buttons. Correct regardless of that outcome.

Suite 50 → **57**. tsc clean.

## 2026-08-06 — Payout fee: 2% mobile, 2% + MWK 700 bank

`PAYOUT_RATES` was `mobile {1.8%, 0}` / `bank {1.5%, 700}`; now a single exported
`PAYOUT_RATE = 0.02` with bank **keeping** its flat MWK 700.

Why the flat component stays: a percentage scales with the amount, the bank's 700
doesn't. To cover the real `1.5% + 700`, a pure percentage breaks even only at
**MWK 140,000 (at 2%)** or **MWK 70,000 (at 2.5%)** — and the shortfall approaches
the full 700 as amounts shrink. Observed bids are MWK 1,000–50,000, so a flat-only
rate would have lost money on effectively every bank payout. `2% + 700` always
covers, with a small margin.

- New `tests/fees.test.ts` (8 cases) pins this down: bank payout fee ≥ real cost
  across MWK 1,000–500,000, collection rates uniform, net never negative, and an
  explicit regression guard asserting `PAYOUT_RATES.bank.flat === 700` so the flat
  fee can't be "simplified" away later.
- Copy updated everywhere the old 1.5–1.8% appeared: `/how-money-works` fee table
  (now notes mobile money is better value on small jobs, since the flat 700 doesn't
  shrink) and `PricingExplainer`. Both read the constant, so they can't drift.
- `CANCELLATION_PAYOUT_RESERVE_PCT` comment corrected — the 15% reserve now covers
  bank down to ~MWK 5,400 (was ~4,700) since the rate moved 1.5% → 2%.

Suite 42 → **50 passing**. tsc clean.

## 2026-08-06 — Flat 3% collection fee, styled Select, no more raw `EXTRA_REVISION|`

- **All collection rails quote 3%.** `COLLECTION_RATES` was 3/3/2 (bank transfer
  cheaper); now a single exported `COLLECTION_RATE = 0.03` feeds all three.
  Rationale: the quote is produced *before* the client picks a method (they choose
  on PayChangu's hosted page), so a per-rail number implied a choice that hadn't
  happened. One rate is one story and never under-quotes. **No money changes** —
  `collectionFee`/`clientCharge` are display estimates only; the raw amount goes to
  PayChangu and the real fee lands in `collection_fee_mwk` on verify.
- **`components/ui/select.tsx`** — styled native `<select>` matching `Input`'s
  height, border, radius and focus ring, with `appearance-none` + an inline SVG
  chevron. Native on purpose (zero JS, works pre-hydration, free mobile pickers).
  Wired into the top-up "Pay with" field and the money calculator.
- **Fixed: `"EXTRA_REVISION|"` rendered raw** in the top-up panel on `/jobs/[id]`.
  `payment_topups.reason` is a protocol string (`EXTRA_REVISION|<note>`) and was
  printed verbatim, so users saw an internal token with an underscore and a pipe.
  Now renders "Extra revision", with the note quoted underneath only when present
  (an empty note previously produced a bare `""`). The DB value is untouched — the
  callback/webhook still parse the marker.
- **Top-up rail options no longer repeat the fee.** With one rate all three read
  identically, so the fee moved to a single line under the field: "+MWK X
  processing fee (3%)".
- **Calculator lost its collection-rail selector** — with a uniform rate it changed
  nothing. Payout rail stays; that one is a real choice (bank carries a flat MWK 700).

⚠️ Payout rates deliberately **unchanged** pending a decision — a flat percentage
can never cover bank's flat MWK 700 on small payouts. See TEST_LOG.

tsc clean, 42/42.

## 2026-08-06 — Preview deploys settle against themselves (PayChangu callback host)

`lib/payments.ts` `siteUrl()` now returns `https://$VERCEL_URL` when
`VERCEL_ENV === "preview"`, falling back to `NEXT_PUBLIC_SITE_URL` otherwise.
`NEXT_PUBLIC_SITE_URL` is set for every Vercel environment, so previously a
preview deploy sent PayChangu's `callback_url`/`return_url` to **production** —
a test payment would have settled the live deployment instead of the one under
test. Same shape as the `APP_URL` bug that broke Google login. Unblocks using a
Vercel Preview environment with PayChangu test keys (test keys scoped to
Preview + Development, live keys to Production only, so there is no manual key
swapping to forget). Production behaviour unchanged. tsc clean, 42/42.

## 2026-08-06 — "How the money works" page + first-run guidance is once-per-USER

⚠️ **Re-run `supabase/schema.sql` before deploying** — adds three nullable
`timestamptz` columns to `profiles` (`welcome_dismissed_at`, `money_guide_seen_at`,
`toured_at`). The code selects `toured_at`, so deploying ahead of the migration
breaks the dashboard.

- **New page `/how-money-works`** (`app/how-money-works/page.tsx`) — plain-language
  explainer: the 4 escrow steps, a "who charges what" table naming the payment
  provider vs. us, and 4 FAQs (when the client is charged, undelivered work,
  paid extra revisions, whether we take a cut of provider fees). Public route,
  so it doubles as a trust page for signed-out visitors.
- **Live calculator** (`components/money-calculator.tsx`) — enter a price, pick a
  collection rail and a payout rail, and both sides update instantly: what the
  client is charged vs. what lands in the creative's account. Every figure runs
  through `lib/fees.ts` (`collectionFee`/`clientCharge`/`creativeGross`/
  `payoutFee`/`creativeNet`), so the page can't quote a number the platform
  won't honour. Two-sided by design — `proposal-payout-preview.tsx` already
  covers the creative's take-home alone.
- **Fixed: the checklist step went to the wrong place.** "See how the money works"
  pointed at `/jobs/new` (and the creative variant at `/dashboard/payments`).
  Both now point at `/how-money-works`.
- **Fixed: the step never ticked.** It had no `done` flag at all. Viewing the page
  now stamps `profiles.money_guide_seen_at`, so the checklist shows ✓ on the next
  dashboard visit. (No `revalidatePath` during render — that's FIX-2026-07-13b.)
- **Fixed: guidance replayed on every new browser.** The welcome checklist and the
  tour were gated on `localStorage` (`gh_welcome_dismissed_v1` / `gh_tour_done_v1`),
  which is per-BROWSER — so signing in on another device (or after clearing site
  data) replayed both. Both flags now live on the profile via one new server action,
  `markMilestone(key)`, writing `welcome_dismissed_at` / `toured_at` under the
  existing `profiles update self` RLS policy. Existing users have `NULL`, so they
  still get the guidance exactly once.
- `PricingExplainer` now links through to the full breakdown.

tsc clean, 42/42, `next build` clean (`/how-money-works` registered).

## 2026-08-05 — Interactive first-run tour (driver.js)

Added `components/product-tour.tsx` — a one-time guided tour that runs on the
dashboard the first time a user lands (after onboarding). Spotlight popovers walk
them through the **menu**, the **workspace**, and the **reminders** panel, with
role-aware copy and Next/Back/Got-it controls. Anchored via `data-tour`
attributes in `dashboard/layout.tsx`; gated on `localStorage["gh_tour_done_v1"]`
so it shows once (skip/close also marks it seen). New dependency: `driver.js@1.8.0`
(tiny, zero-dep). `next build` compiles clean. Completes the "Both" guidance plan
(checklist + tour). Refinements (per-nav-item targets, a replay link) backlogged.

## 2026-08-05 — MoneyInput on every money field + fee panel on all money pages

- **Comma formatting everywhere.** Every MWK input now uses `MoneyInput`
  (shows `50,000`, submits raw digits): proposal bid + top-up amount +
  extra-revision rate (`jobs/[id]`), rate-card editor (`dashboard/services`),
  new-for-client price + extra-revision rate, invite budget. (Onboarding prices
  and job-post budget were already done.) Percentages, revision counts, and
  delivery days stay plain number inputs.
- **`PricingExplainer` as a safety net** on every money-decision surface:
  job-post, proposal form, new-for-client, invite, and the payments dashboard
  (audience-aware wording).

Server parsing unchanged (hidden input carries the plain number). tsc clean, 42/42.

## 2026-08-05 — First-run guidance: welcome checklist, empty-state nudges, fee panel

Make the platform guide new users instead of leaving them to scavenge.

- **Dismissible welcome checklist** (`components/welcome-checklist.tsx`) at the top
  of the dashboard. Role-based steps (complete profile / post-or-find a job / see
  how the money works) that tick off as done; ✕ dismisses via localStorage.
- **Empty-state reminders.** The dashboard Reminders panel now, when nothing is
  pending, points the user at their core action ("Post your first job",
  "Find work to bid on") instead of a dead-end "all caught up".
- **Reusable pricing panel** (`components/pricing-explainer.tsx`) — a native
  `<details>` "How the money works" explainer (escrow → fees → payout, numbers
  from `lib/fees.ts`). Placed on the job-post page; drop-in for proposal/payments.
- **Card overflow fix.** `CardContent` gained `min-w-0 break-words` so long text
  (URLs, emails, names) wraps inside the card instead of spilling out on resize.
- **Comma formatting** extended to the job-post budget field (`MoneyInput`).

Follow-ups backlogged: interactive step-tour (popups on real UI), and rolling
`MoneyInput` to the remaining money fields. tsc clean, unit suite 42/42.

## 2026-08-05 — Creative onboarding UX: tag chips, money commas, generic wording

Made creative onboarding fit any creative, not just visual artists.

- **Skills → tag/chip input** (`components/tag-input.tsx`). Type a skill, press
  Enter (or comma) → it locks in as a removable bubble; Backspace on an empty box
  removes the last. Submits one hidden `name="skills"` per chip;
  `completeCreativeOnboarding` reads them with `formData.getAll("skills")`.
- **Thousands separators on money** (`components/money-input.tsx`). Price fields
  show `50,000` as you type but submit raw digits (hidden input), so server
  parsing is unchanged. Wired into the two service-price fields.
- **Generic "example of your work" wording.** Card 2 retitled + placeholders now
  cover DJs / performers / service providers (sets, gigs, events), not just
  "projects". Service-title example includes "DJ set"; project-URL relabelled
  "Link (optional)".
- **Delivery time optional.** Live acts (DJs) have no fixed turnaround.
  `services.delivery_days` made **nullable** (was `not null default 7`); blank →
  null; rate-card + public-profile render sites guard the null. **⚠️ Re-run
  `schema.sql` in Supabase** (adds `alter column delivery_days drop not null`).

Note: comma formatting so far is onboarding prices only — job/proposal/top-up
money fields are a follow-up. tsc clean, unit suite 42/42.

## 2026-08-05 — Google login: robust first-run routing + identity prefill

Follow-up on the OAuth login. Two fixes:

1. **Post-login routing no longer silently lands OAuth users on the dashboard.**
   The dashboard gate previously only redirected `if (profile && !profile.onboarded_at)`,
   so a **missing** profiles row (trigger skipped / pre-existing auth user) fell
   through to a default-`creative` dashboard instead of onboarding. Now: no
   profile **or** no role → `/onboarding/role`; then un-onboarded → role-specific
   onboarding. `chooseRole` and `completeClientOnboarding` switched from
   `update().eq(id)` to `upsert({id,...})` so a missing row is created rather than
   updating zero rows.
2. **Onboarding prefills the Google identity.** Both onboarding forms
   (`app/onboarding/creative`, `app/onboarding/client`) now seed **name** and show
   **email** read-only from `user.user_metadata` + `user.email`, plus a **phone /
   WhatsApp** field (saved to `profiles.phone`). Note: Google's sign-in scopes
   return name + email + avatar only — **not phone** — so phone stays a manual
   (prefilled-if-known) field. Creative onboarding gained the name/email/phone
   block it never had; both save `full_name`/`phone` on completion.

Unit suite 42/42 green (added `.gte/.lte/.gt` and `.upsert` to the test mock).

## 2026-08-05 — "Continue with Google" login (OAuth) + one-time role step

Added Google OAuth sign-in end-to-end. A `GoogleSignin` button
(`components/google-signin.tsx`) on `/login` and `/signup` submits a
server-action form (`signInWithGoogle` in `app/actions.ts`) that calls
`supabase.auth.signInWithOAuth({ provider: "google", redirectTo: <site>/auth/callback })`
and hops the browser to Google. The existing `app/auth/callback/route.ts`
completes the code exchange (`exchangeCodeForSession`) and lands the user on
`/dashboard` — unchanged, verified.

**The role wrinkle (the real work).** Email signup captures `role` via `signUp`
metadata; Google users skip that form. The DB trigger previously *defaulted*
absent roles to `'creative'`, silently mis-roling every Google client. Fixed at
the root: `profiles.role` is now **nullable with no default** and the
`handle_new_user` trigger no longer coalesces — a Google user arrives with
`role = null` = "hasn't chosen". A new `/onboarding/role` page asks
"creative or client?" once (server action `chooseRole` writes the role, then
hands off to the matching onboarding form). The dashboard layout routes any
un-onboarded, null-role user to `/onboarding/role` before the role-specific
onboarding, so there's no bypass. Onboarding completion also self-heals the role
(`completeClientOnboarding` → `client`, `completeCreativeOnboarding` →
`creative`) so it's correct regardless of path. Existing null-tolerant reads
(`(profile?.role as Role) || "creative"`) mean no other flow breaks on null.

Confirm-email doesn't apply to OAuth (Google already verified the address).

**Requires re-running `supabase/schema.sql`** in Supabase (drops the not-null +
default on `profiles.role` and updates the trigger). Also requires the Google
OAuth client + Client ID/Secret configured in Supabase → Auth → Providers →
Google, and enabled.

## 2026-08-05 — Footer version badge + "What's new"

Added a clickable `v0.8.0` badge in the footer next to "© Ganyu Hub". Clicking
it opens a curated "What's new" panel listing recent user-facing features. Built
as a native `<details>`/`<summary>` — works with zero JS (no hydration
dependency). Source is `lib/whats-new.ts` (`RELEASES` + `VERSION`), which is a
**deliberately curated, public-safe list — NOT CHANGELOG.md**: no security,
RLS, or schema details ever go in it. `VERSION` derives from the top release
entry, so bumping a release there updates the badge automatically.

## 2026-08-05 — Email verification (Supabase confirm-email) + v0.8.0

Turned on the path for Supabase Auth's built-in "Confirm email" so fake/typo'd
emails can't create usable accounts. `signUp` now checks the returned session:
with confirm-email on, Supabase returns no session until the user clicks the
link, so we redirect to `/login?info=…` ("check your inbox…") instead of
`/dashboard` (which would just bounce an unconfirmed user). Added a green info
banner to the login page (`info` searchParam) to render that message. Chose
Supabase's built-in mailer for delivery (Resend sandbox only reaches the owner
address, and no domain is bought yet) — **activate by toggling "Confirm email"
ON in Supabase → Authentication → Providers → Email**; the code already handles
both states (session present → dashboard; absent → check-inbox notice).

Also stamped a real version: `package.json` 0.1.0 → **0.8.0** (roughly session 8
of dev) so "where are we" has a concrete answer.

## 2026-08-05 — Social share buttons + rich link previews

New `components/share-buttons.tsx` — a reusable social-share row (WhatsApp, X, Facebook, Instagram, native Share, copy) wired onto **creative profiles** (`/creatives/[id]`), **jobs** (`/jobs/[id]`), **finished work** (`/creatives/[id]/portfolio/[itemId]`), and the **client-link banner** (so a creative can send the claim link via any network). The three primary links (WhatsApp/X/Facebook) are plain anchors whose absolute hrefs are computed server-side via new `lib/site-url.ts` (`absUrl`), so they render correct in the SSR HTML and work with zero JS. Instagram has no web link-share intent, so that button copies the link with a "paste into your story/DM" hint; the native Share button (mobile) is the real path to IG/Messenger/etc.

Rich link previews: added a branded 1200×630 OG card at `app/opengraph-image.tsx` (logo + wordmark on brand teal) for the homepage and any page without its own image, and switched the root card to `summary_large_image`. Added per-page OG to the portfolio-work page (had none) — previews now show the work's cover image + title. Creative profiles already had avatar-based OG.

**Known limitation:** on the data-backed routes (creative/job), the *interactive* buttons (copy / native-share / Instagram-copy) depend on the route content hydrating, which didn't hydrate in the dev preview (the whole route content, not just the share row — the layout shell hydrates, `/login` hydrates). The WhatsApp/X/Facebook links and all previews work regardless (server-rendered). Needs a prod-build check to confirm whether the copy/native buttons come alive there.

## 2026-08-05 — CAPTCHA extended to share-link claim form

Wired Cloudflare Turnstile onto the `/j/[token]` public claim/sign-in form too. `acceptJobViaLink` now verifies the `cf-turnstile-response` token (after the rate-limit check, same fail-open behaviour as auth) and returns "Verification failed…" on a bad token; `app/j/[token]/page.tsx` renders `<Turnstile />` above the submit button. Turnstile live in production on `ganyu-hub.vercel.app` (keys added in Vercel, confirmed rendering on `/login`). All three CAPTCHA surfaces — login, signup, share-link claim — now covered.

## 2026-08-05 — CAPTCHA on auth + RLS regression test committed

Cloudflare Turnstile wired into login + signup. `components/turnstile.tsx` renders the widget only when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set; `lib/turnstile.ts` verifies the token server-side against Cloudflare's siteverify and **fails open when `TURNSTILE_SECRET_KEY` is unset**, so the forms are unchanged until you add keys. `signIn`/`signUp` now verify the `cf-turnstile-response` token (after the rate-limit check) and bounce back with an error if it fails. Env keys documented in `.env.local.example` (incl. Cloudflare's always-pass dev test keys). Also moved the authenticated RLS exploit test into the repo at `scripts/security/rls-exploit-test.mjs` (+ README) — run it after any `proposals`/`jobs` RLS or trigger change; it seeds throwaway fixtures, runs the self-accept + column-tamper attacks as a real creative session, asserts they're blocked and legit writes still work, and cleans up. Confirmed all 3 assertions PASS against the live DB. `/j/[token]` claim form left without a widget for now (phone-only public flow; rate-limited already).

## 2026-08-05 — Security audit round 3: underpayment guard, rate limiting, storage cap

Closed the four flagged follow-ups from round 2.
- **(A) Underpayment guard** — `paychangu/callback` + `webhook` routes now select `accepted_bid_mwk` and refuse to flip escrow to `payment_held` when the PayChangu-verified amount is below the agreed bid; logs an admin error (`payment_underpaid`) and leaves the job pending for manual handling.
- **(B/D) Rate limiting** — new Postgres-backed fixed-window limiter (`rate_limits` table + `check_rate_limit` RPC in `schema.sql`, `lib/rate-limit.ts` helper using the service-role client + client IP). Wired into `signIn` (10/10min per IP+email), `signUp` (5/hr per IP), and `acceptJobViaLink` (8/10min per IP). The share-link claim's wrong-password error is now generic ("We couldn't sign you in…") so it's no longer an account-enumeration / password-testing oracle.
- **(C) Storage cap** — `job-deliverables` bucket now carries a DB-level `file_size_limit` of 10MB (`on conflict do update`), so a direct Supabase SDK upload can't bypass the app's server-side size check. No DB MIME allow-list (design formats have unreliable MIME types; bucket is private + signed-URL only, so stored files never execute in-origin).

**Still needs you:** (1) run the updated `schema.sql` in Supabase Studio — the `rate_limits` table, `check_rate_limit` function, and bucket size cap are inert until then (rate-limit helper fails open, so nothing breaks meanwhile). (2) CAPTCHA on auth forms still requires a provider (hCaptcha/Cloudflare Turnstile) + env keys — server-side rate limiting is in, but a CAPTCHA is the other half against determined bots; say the word and provide keys to wire it.

## 2026-08-05 — Security audit round 2: TOCTOU claim guard + timing-safe cron

Deeper auditor pass (payment routes, full server-action authz sweep, public no-session surface). Two code fixes shipped: (1) `acceptJobViaLink` now claims the job with an atomic `.is("client_id", null)` filtered update + row-count check — two concurrent submissions on the same share link can no longer both attach (last-write-wins race closed). (2) `app/api/cron/non-response-check` bearer check switched from `!==` to `crypto.timingSafeEqual` (length-gated) so `CRON_SECRET` can't be timing-recovered. Confirmed safe in this pass: all `admin*` actions gate on `is_admin` via the user-session client; `updateEscrowStatus` (release) is client-only with T+1 hold, payout idempotency, server-computed `creativeNet`, and destination scoped to the creative's own `payout_methods`. Flagged for decision (not auto-fixed): collection webhook/callback don't hard-reject underpayment (`verified.amount < accepted_bid_mwk` still flips escrow to held); `acceptJobViaLink` is a password-test/enumeration oracle with no rate limit once a valid token is held; storage bucket lacks DB-level size/MIME caps; no rate-limiting/CAPTCHA on any auth surface.

## 2026-08-05 — Security: close creative→job privilege-escalation chain (RLS + trigger)

Static security audit (2026-08-05) found a self-service privilege-escalation path reachable by any logged-in creative via raw PostgREST calls, no UI needed. Fixes in `supabase/schema.sql` — **must be run in Supabase Studio to take effect** (source-of-truth updated; DB not yet migrated):

- **`proposals update`** had no `WITH CHECK`, so Postgres reused `USING` as the check — a creative could PATCH their own proposal to `status='accepted'` (self-accept). Now: client may accept/decline, creative may only withdraw.
- **`proposals insert`** had no job-state restriction — could propose on any job. Now: only `status='open'` jobs.
- **`jobs update by accepted creative`** grants a full-row UPDATE and RLS can't restrict columns, so a (self- or legitimately) accepted creative could PATCH `total_paid_mwk`/`escrow_status` directly — inflating their own release payout or faking completion. Added `guard_jobs_creative_update()` BEFORE UPDATE trigger that rejects a creative's change to protected money/ownership columns (escrow_status, total_paid_mwk, collection_amount_mwk, accepted_bid_mwk, budget_mwk, client_id, client_link_token, client_refund_status); skips service-role and the job's own client.
- **`payment_topups update`** had no `WITH CHECK` — either party could flip `status` and poison the webhook's pending-guard (dropping a real payment). Now: only the client may set `declined`; `paid` comes solely from the verified webhook (service-role).

Audit also **confirmed safe**: webhook HMAC uses `timingSafeEqual` with length check; escrow/topup side-effects are idempotent (pending-guarded); payment amounts are provider-attested via server-to-server verify; payout destinations are scoped to the creative's own `payout_methods`; no `dangerouslySetInnerHTML`; no user-controlled `redirect()`; no server-only secret reachable in the client bundle; `profiles insert self` correctly pins `auth.uid()=id`. Non-blocking follow-ups noted in TEST_LOG (topup-claim TOCTOU, cron secret `!==`, storage bucket size/MIME cap, no rate-limiting on auth).

## 2026-08-04 — GlassUploadButton: shared glassy-pill upload CTA

New `components/glass-upload-button.tsx` — pure CSS approximation of the Dribbble shader-upload-button reference: glossy white pill with inner highlight + subtle depth shadow, cloud-up icon, hover raises the button with a conic chromatic-gradient halo blurred behind it, active state presses in. Three sizes (sm/md/lg). Swapped in as the trigger for `ImagePicker` (sm), `MultiImagePicker` (md), and `JobDeliverySubmit` (md — the native `<Input type="file">` was replaced with a hidden input + glass trigger + inline filename). `AttachmentPicker` deliberately skipped — that's a paperclip icon inside the message composer, wrong context for a large pill CTA. No new deps; no shader/webgl.

## 2026-08-04 — Session 7 polish 2: progress bar clip fix + brief card redesign

Progress bar container gets `py-2 px-2` so the current dot's ring + `scale-110` bump aren't clipped vertically by `overflow-x-auto` (which forces `overflow-y: auto` under it). Brief card on `/jobs/[id]` redesigned: eyebrow "Project brief" label, brief text bumped to serif `text-lg`/`text-xl` with `leading-relaxed`, deliverables section separated by a hairline divider, meta row (Budget · Deadline · Revisions · Format) rebuilt as a compact `<dl>` strip with uppercase labels and `font-display` tabular-nums on Budget. Removed the standalone bold "Budget: MWK X" line — budget now lives inside the meta strip.

## 2026-08-04 — Fix: /jobs/[id] "oops" — client-bundle ReferenceError in job-stages

Removed the top-level `if (require.main === module)` self-check in `lib/job-stages.ts`. Once `JobProgressBar` became `"use client"` (previous polish push), this file was pulled into the browser bundle, where `module` isn't defined — every job detail page threw `ReferenceError` caught by `app/error.tsx`.

## 2026-08-04 — Session 7 polish: animated multi-color progress bar, pessimistic payout estimate

Progress bar (`components/job-progress-bar.tsx`) is now client-side with a mount animation — connectors sweep left→right (700ms, 180ms stagger) matching the recharts feel used on the dashboard. Each stage has its own color (sky → indigo → violet → amber → emerald); completed dots show a check only (no number), current dot is empty with a colored ring + scale bump, upcoming dots show grey numbers. Permanent 1-5 numeric guide rendered under each label. Job header (`components/job-header.tsx`) payout line now shows the pessimistic net after cash-out fee: `gross − max(payoutFee(gross,"bank"), payoutFee(gross,"mobile"))`, so the number can't shrink at cash-out regardless of which rail the creative picks. Label updated to "Creative receives (est., after cash-out fee)".

## 2026-08-04 — Session 7: job lifecycle progress bar + money-at-a-glance header

New pure display layer over the existing status enum and `job_events` log — no new statuses. `lib/job-stages.ts` maps `(job, events)` to `{currentIdx, overlay}` across five fixed stages: Proposal accepted → Escrow funded → In progress → Delivered → Completed. Cancelled and disputed render as overlays on the stage they occurred at (walks the event log to find where), not as their own stages. `components/job-progress-bar.tsx` is a horizontal stepper: completed stages are green with checks, current is highlighted with a ring, remaining is grey; the overlay stage gets a red (cancelled) or amber (disputed) marker with an inline "Cancelled here" / "Disputed here" label. `components/job-header.tsx` replaces the old CardHeader block at the top of the job detail page — title in display type, "Money in escrow: MWK X" in 3xl/4xl tabular figures using the same `total_paid_mwk ?? collection_amount_mwk ?? accepted_bid_mwk` precedence used everywhere else, "Creative receives: MWK Y" underneath from `creativeGross()` (respects `BETA_ZERO_COMMISSION`), progress bar directly below. Scoped strictly to the header — body content untouched. `lib/job-stages.ts` has an in-file `require.main` self-check covering escrow-held, completed, cancel-after-escrow, and dispute-after-delivery cases.

## 2026-08-04 — Session 5: creative-initiated client jobs with share link

Creatives can now create a job on an existing client's behalf when terms are agreed off-platform, and hand the client a private link that leads straight into the job. New surfaces: **`/jobs/new-for-client`** (creative-only form: title, brief, deliverables, category, agreed price, deadline, revisions_included, extra_revision_rate); **`/j/[token]`** (public landing — no navbar/footer chrome, shows job details + creative profile, minimal name+phone+password form); **"Copy client link"** banner on the job page when the creative views an unclaimed job. Two new server actions in `app/actions.ts`: `createJobForClient` (inserts job with `visibility='private'`, `status='scope_pending'`, `client_id=null`, `client_link_token=<24-byte base64url>`, plus a synthetic `proposals` row `status='accepted'` so every existing creative-side RLS gate keeps working unchanged) and `acceptJobViaLink` (public, no session; matches existing users by `profiles.phone` or creates new account with synthetic email `<phone>@ganyu-phone.local`, attaches `client_id`, logs `proposal_accepted` event, redirects to `/jobs/[id]`). Schema deltas: `jobs.client_id` becomes nullable, new `jobs.client_link_token text unique`. Two supporting bits: root `middleware.ts` sets `x-pathname` so root layout can strip nav on `/j/*`, and `/jobs/[id]/page.tsx` was made null-safe on `client_id` and now grants access to the accepted creative on unclaimed private jobs. No new RLS policies — the synthetic accepted proposal was the trick.

## 2026-08-04 — Repo moved off OneDrive; Turbopack crash resolved

Working copy moved from `C:\Users\vinny\OneDrive\Documents\Code\GANYU HUB` to `C:\Users\vinny\GANYU HUB`. The intermittent Next 16 / Turbopack `0xc0000142` worker crash was environmental — OneDrive's on-demand file provider was racing Turbopack's cache writes. Dev server from the new path: clean start, `GET / 200`, Turbopack noticed prior corruption and reset its cache once. BUG-007 re-verified via `tsc --noEmit` (typecheck clean; RLS-level behaviour was already confirmed in aa6a59d). Housekeeping: `@vercel/analytics@^2.0.1` added to deps (not yet wired), `tsconfig.tsbuildinfo` added to `.gitignore` (regenerable), obsolete `GANYU HUB dcos .zip` / `Docs.zip` removed.

## 2026-08-04 — BUG-007 fix verified E2E

Confirmed the e88d527 fix for BUG-007. Local dev server hit an unrelated Turbopack/Windows crash (`0xc0000142` in a spawned worker), so verification ran as a direct Supabase-level check instead of a UI click-through: reproduced the pre-fix client-authenticated `payment_topups` insert (still RLS-blocked, confirming the diagnosis), then ran the exact service-role insert now shipped in `requestRevision` case C — succeeded, correct row shape (`job_id`, `requested_by_creative_id`, `amount_mwk=5000`, `reason` starts `EXTRA_REVISION|`). Ran the callback's post-pay side effects on that row — `payment_topups.status` → `paid`, `jobs.revisions_used` 1 → 2, both correct. No code changes; temporary `TEST_MODE_SKIP_PAYCHANGU_VERIFY` bypass added and reverted (`lib/payments.ts` diff is empty). Test data cleaned up. Recommend a UI click-through pass once the local Turbopack crash is resolved. See `TEST_LOG.md`.

## 2026-08-04 — BUG-007 fix: paid revision overage top-up now uses service-role client

`requestRevision` case C (paid-overage branch in `app/actions.ts`) previously ran the `payment_topups` insert through the client's own authenticated Supabase client, tripping the `auth.uid() = requested_by_creative_id` RLS check and silently blocking every paid revision. Switched that single insert to a service-role client (same pattern as `releasePayment`'s payout profile lookup). RLS policy unchanged; creative-initiated inserts still enforce the original rule. Requires `SUPABASE_SERVICE_ROLE_KEY` (already required by release/payout paths).

## 2026-08-04 — Full E2E test walk: BUG-001 confirmed fixed, BUG-007 found

Ran a full manual/scripted walk of the job activity timeline (sessions 1-4) end to end against the real Supabase project with live PayChangu keys, using a temporary local-only `verifyPayment()` bypass (`TEST_MODE_SKIP_PAYCHANGU_VERIFY`, reverted before commit — zero diff on `lib/payments.ts`) so escrow could clear via the real `/api/paychangu/callback` route without touching PayChangu's hosted checkout.

- **BUG-001 re-tested and confirmed fixed** — fresh creative onboarding (`creative-a@test.local`) saved headline/bio/portfolio piece/service in one submission with no RLS error, `profiles.onboarded_at` set correctly.
- **Job A (full lifecycle)** — post → propose → accept-and-pay → escrow_funded → proposal_accepted → work_started → submitted → completed, all events landed on the timeline in order. Release Payment intentionally not clicked (live payout keys). Outsider RLS held.
- **Job B (file delivery)** — under-10MB upload, over-10MB client-side rejection, external-link delivery all confirmed live; outsider couldn't see the delivery form or any delivery events.
- **Job C (revisions) — found BUG-007**: the paid-revision-overage top-up (client confirms "Pay MWK X & continue" after included revisions are used) silently fails — RLS on `payment_topups` insert requires `auth.uid() = requested_by_creative_id`, but this code path is invoked by the client inserting on the creative's behalf. No topup row is ever created, the revision counter never advances. Logged as BUG-007, not fixed this session (test-only run, no RLS/auth changes). Free within-limit revisions and the blank-rate "not available" path both work correctly.

**Migration:** none. **Cleanup:** `.env.local`'s test-only env var removed; three test accounts (`client-a@test.local`, `creative-a@test.local`, `outsider@test.local`) left in the DB for the founder to delete via the SQL snippet provided in the test session output.

## 2026-08-04 — Session security hardening (BUG-003/004/005/006)

Triggered by a founder-side demo: friend copied a valid `sb-*-auth-token` cookie from one browser into another and was logged in as the victim. Root cause was three-layered — none critical on its own, all critical together — plus a fourth silent-failure paper-cut spotted in the same audit.

- **BUG-003** — `lib/supabase/server.ts` + `lib/supabase/middleware.ts` passed Supabase SSR's default cookie options through verbatim, so `sb-*-auth-token*` was set without `HttpOnly` / `Secure` / `SameSite`. Any XSS could read the cookie. Added `hardenCookie()` helper on both write paths: forces `httpOnly: true`, `secure: true` in prod (off in dev so localhost stays on `http://`), `sameSite: "lax"`, `path: "/"`. Existing sessions re-flag on next token refresh.
- **BUG-004** — `app/auth/signout/route.ts` called `signOut()` with the default `local` scope (only clears the current cookie store). A cookie already exfiltrated survived the victim clicking Sign out. Changed to `signOut({ scope: "global" })` — every refresh token for the user is now revoked, so the copied cookie dies on the click.
- **BUG-005** — `components/reset-password-form.tsx` had the same footgun on the reset-password flow. Anyone who loaded a recovery link before the real user (email prefetch, security scanner, browser history, over-the-shoulder) held a full session that survived the password change. Reset now `signOut({ scope: "global" })` after `updateUser({ password })` — every session minted from the recovery code dies the moment the real user sets their new password.
- **BUG-006** — `app/auth/callback/route.ts` discarded the `error` return from `exchangeCodeForSession(code)`. Expired/invalid/replayed magic-link codes still redirected to `/dashboard`, where page-level guards bounced the user with no context. Now redirects to `/login?error=Sign-in link expired or invalid...` on failure.

**Migration:** none required.
**One-time cleanup for the demonstrated hijack:** have the victim sign out once on the post-`8967c8a` deploy. That single global-scope signout revokes every existing session including the copied one.

## 2026-08-04 — Job activity timeline: sessions 2 + 3 + 4 (batch)

Ships the remaining three sessions of the timeline system in one drop. Nobody was on platform, so batching kept the beta database in one consistent shape rather than three intermediate ones.

**Session 2 — status transitions wired into the event log.** `logJobEvent` now fires from every lifecycle mutation: `escrow_funded` (PayChangu callback + webhook, atomic guard via `.eq("escrow_status","payment_pending").select("id")` so callback+webhook race is deduped and the fund-notification only fires once), `work_started` (both `promotePendingAcceptance` for payment-first accept and `confirmScope` when both parties confirm), `job_completed` + `cancelled` (via `updateJobStatus`), `dispute_filed` (via `raiseDispute` and the 72h `cron/non-response-check` with `actorId: null` + "Auto-flagged" note), `dispute_resolved` (via `adminResolveDispute`), `cancelled` (via `adminResolveCancellation` with split percentages in the note), `deadline_extended` (via `respondToDeadlineExtension` on approve).

**Session 3 — file delivery.** New private `job-deliverables` storage bucket, path `<job_id>/<uuid>.<ext>`, RLS: accepted-creative insert/delete, participants + admin read. New `components/job-delivery-submit.tsx` client component (creative-only, active-job-only): file picker with 10MB hard cap (client-side reject before any upload attempt), external-link fallback for larger files, mutual exclusion enforced client + server. New `submitDelivery` server action uploads via the user-scoped client (RLS enforces the accepted-creative-only rule) and writes `{ file_url, file_name, file_type, size_bytes }` or `{ external_link }` into `job_events.metadata`. Revision detection: if the most recent relevant event was `revision_requested`, logs as `revision_delivered` instead of `files_delivered`. Timeline extended to render download links (via batch-minted signed URLs, 1h TTL) or external links inline.

**Session 4 — revision limits + paid overage.** Proposals carry `revisions_offered` (int, default 1) and optional `extra_revision_rate` (int MWK — blank = hard limit). On accept, both copy into `jobs.revisions_included` / `jobs.extra_revision_rate` inside the same guarded update in `promotePendingAcceptance`. New `jobs.revisions_used int default 0` counter. New client-only `RequestRevisionPanel`: within-limit is free, over-limit-with-rate shows an amber confirm prompt then routes through the existing top-up escrow rail (`payment_topups` insert + `initiatePayment` redirect — no parallel payment path), over-limit-no-rate hard-stops with the "please discuss directly" message. Post-payment side effects (increment counter + log `revision_requested`) fire from the PayChangu callback + webhook when the paid top-up's `reason` starts with the `EXTRA_REVISION|` marker. Timeline header now shows **"Revisions: X of Y used"**.

Runtime bug caught locally before push: `EXTRA_REVISION_MARKER` was originally exported from `app/actions.ts`, which is a `"use server"` file — Next.js only allows async function exports there. Dropped the `export` keyword; the marker is used inline in the callback + webhook comparisons anyway.

**Migration required:** re-run `supabase/schema.sql` before this deploy is exercisable. Adds the `job-deliverables` bucket + 3 policies (S3) and the 4 revision columns on `proposals` / `jobs` (S4). Session 1's `job_events` table and CHECK constraint already covered `files_delivered`/`revision_delivered`, so no CHECK update.

Test plan: consolidated Job A/B/C plan in TEST_LOG covers all four sessions in ~25 min instead of four separate runs.

## 2026-07-25 — Job activity timeline: schema + first event + render (session 1 of 4)

Foundation for the multi-session job activity/timeline system. New `job_events` table (append-only): `id uuid pk`, `job_id fk jobs`, `event_type text CHECK` (11 initial values covering the full lifecycle), `actor_id fk profiles nullable`, `note text nullable`, `metadata jsonb nullable`, `created_at`. Index on `(job_id, created_at)`. RLS: select allowed for the client, the accepted creative, and admin. No insert/update/delete policies on purpose — the only writer is the service-role helper.

New `lib/job-events.ts:logJobEvent(jobId, eventType, note?, opts?)` — service-role insert via the same `createServerClient` pattern as `lib/admin-errors.ts`. Missing service key is a soft-fail (logs, doesn't throw) so a misconfigured deploy can't take down the acceptance path.

Wired at exactly one call site this session (proof of concept): `lib/accept-pending.ts:promotePendingAcceptance` now logs `proposal_accepted` with `actor_id = client_id` and `metadata.proposal_id`. The log call is gated on the affected-rows of the guarded `jobs.update ... eq("status", "open")` so webhook + callback races don't produce duplicate rows.

New `components/job-timeline.tsx` — presentational server component. Vertical timeline, oldest→newest, dot + inline SVG icon + human label + `timeAgo` (reused from `lib/utils.ts`). Rendered on `app/jobs/[id]/page.tsx` just below `JobStatusPanel`, visible to both parties, hidden when there are no events. Existing status badge untouched — timeline is additive per spec.

**Migration required:** re-run `supabase/schema.sql` for `job_events` and its policy.

Sessions 2–4 will fan more writers into `logJobEvent` (escrow_funded, files_delivered, revisions, completion, dispute, cancel, deadline) and eventually mirror timeline entries into the message thread.

## 2026-07-24 (b) — BUG_LOG.md fully back-populated from day zero

Combed the entire CHANGELOG.md (624 lines, 2026-06-24 → today) and pulled every entry with a clear bug-to-fix arc into `BUG_LOG.md`. 30 historical fixes now logged in `FIX-YYYY-MM-DD-<letter>` format under a Fixed section, newest first, grouped by date. Each entry has symptom / cause / fix. Coverage spans payment double-charges, PostgREST embed regressions, dead-column sort, silent 0-row updates, RLS gaps, image-upload capping, WCAG contrast failures, cron scheduling, RSC render-time race, prop leakage, deadline defaults, taxonomy drift, layout clipping, and duplicate JSX. Pure feature ships excluded.

BUG-001 stays In Progress at the top until the reporter re-tests on the new deploy.

## 2026-07-24 — BUG-001 mitigations + BUG_LOG.md

Creative reported that "Finish & go to dashboard" on `/onboarding/creative` redirected them but saved nothing. Redirect firing while nothing lands points at a silent 0-row mutation, most likely a missing profiles base row so `.update().eq('id', user.id)` matched nothing (Supabase JS treats 0-row updates as success). Shipped defensive changes:

- `profiles.update` → `profiles.upsert(..., { onConflict: 'id' })` so a missing row auto-creates.
- Chained `.select('id')` on all three writes (`profiles`, `portfolio_items`, `services`); explicit user error + `console.error` to Vercel logs if any affected 0 rows.
- Cover-image upload now non-fatal — logs and continues with `cover_url = null` on failure so the creative doesn't lose their bio over a storage RLS hiccup.
- Success log `[onboarding] creative onboarded <user_id> cover=<bool>` for trace visibility.

New `BUG_LOG.md` at repo root: problem/cause/fix format, open bugs at top, fixed section back-populated with the notable historical fixes from CHANGELOG (rate sort, double-fee, payout-pending, PGRST201, 3-attempts cap, etc.). Going forward all beta bug reports are logged here first.

## 2026-07-22 (f) — /browse rate sort was broken (dead column)

`Sort by "Lowest rate" / "Highest rate"` on `/browse` was ordering by `profiles.hourly_rate_mwk` — a column the codebase itself already marked dead (real prices live in `services`). Result: the sort effectively did nothing. Fixed by dropping the DB `.order("hourly_rate_mwk")` branch and re-sorting `visibleProfiles` in memory by the already-computed `fromPrice` map (min service price per profile). Profiles with no priced service sink to the bottom either direction. `top_rated` and `newest` unchanged.

## 2026-07-22 (e) — Live char counters on Brief + Deliverables; revisions backlog note

Replaced "(min 200 characters)" / "(min 50 characters)" label suffixes on the job-post form (`app/jobs/new/page.tsx`) and the private-invite form (`app/creatives/[id]/invite/page.tsx`) with a live `count/min` counter under the textarea. New `components/char-count-textarea.tsx` client component; server-side `minLength` still enforced via prop pass-through.

Backlog: added "Move 'revisions included' from the client to the creative" under a new Scope/proposals section. Creative should commit revisions in the proposal since the number is a function of their price, not the client's guess.

## 2026-07-22 (d) — Terms §1 formatting pass + Contact page

Reformatted Terms §1 with bold lead-ins per paragraph ("Why we exist.", "The middle ground.", "Built for skill, not certificates.", "What 'ganyu' means.", "Reach us anytime.") matching Section 2's rhythm. Bolded key phrases: "registered Malawian business", "held in escrow", "Both the client and the creative are protected. Both are accountable." Reads scannable instead of a wall of text.

Added `/contact` route (`app/contact/page.tsx`): WhatsApp/call, email, report-form pointer, location. Footer link added in `app/layout.tsx` as first item in the nav row.

## 2026-07-22 (c) — Terms §1 rewrite in founder voice

Replaced the placeholder "Who we are" section with a longer, personal, first-person origin: registered Malawian business, started in Blantyre. The "why" is now the broader pattern of upfront payment + disappearing service providers in the local creative space, not a single anecdote. Reinforces escrow + accountability positioning. Contact block now surfaces WhatsApp/call (+265 886 072 933) and email (CiTiMrKt@gmail.com) alongside the report form.

## 2026-07-22 (b) — Dash sweep, live release countdown, escrow-funded notification

Stripped em/en dashes from `/terms`, `/privacy`, `/content-policy` (AI-tell). Replaced with commas, periods, or colons — no wording changes. Rewrote Terms §1 "Who we are" in first-person, more human voice ("We're a small team based in Blantyre…").

Release-payment button: was hidden during the 24h settlement hold. Now visible-but-disabled with a live countdown ("Release opens in 14h 22m 03s") that ticks every second. New `components/hold-countdown.tsx` client component. Server enforcement of the 24h gate unchanged.

Client notification when payment lands in escrow: `escrow_funded` kind, inserted from both the PayChangu webhook and callback paths (whichever fires first wins — the other's branch is guarded by `escrow_status === "payment_pending"` so no duplicates). Copy: "Payment is safely in escrow — Funds for [job] are held. The creative can begin work. You'll be able to release payment the next business day."

## 2026-07-22 — Double-fee fix + PayChangu name removed from user-facing copy

Fixed double-charge on checkout: `app/actions.ts` was passing `clientCharge(bid, rail)` (bid + our fee estimate) as the `amount` to the processor, which then added its own fee on top of that, so the customer paid the fee twice (10,000 bid → shown 10,200 → actually charged ~10,404). Both `acceptProposal` and the top-up payment path now pass the raw bid — the processor adds its fee on top for the customer, and the full bid still lands in escrow. `clientCharge` stays for UI display.

Rebranded user-facing "PayChangu" mentions to generic language ("our secure checkout", "processing fee", "payment") in `escrow-panel.tsx`, `accept-proposal-picker.tsx`, `jobs/[id]/page.tsx`, `add-payout-method-form.tsx`, `dashboard/profile/page.tsx`. Support issues will route to us instead of the vendor. Legal disclosure in `terms/page.tsx` + `privacy/page.tsx` keeps the vendor name (required disclosure). Admin pages also keep it (internal, useful for diagnosis).

T+1 language softened: "PayChangu clears funds the next business day (T+1)" → "Funds settle the next business day after payment." Client now sees the settlement notice up-front in the `payment_held` hint AND at accept-time in the payment picker, so they know money can't be released instantly.

## 2026-07-21 — Beta zero-commission waiver + backlog OTP/IDV research

Added `BETA_ZERO_COMMISSION` flag in `lib/fees.ts` (env-driven, default ON). Creatives keep 100% of the bid during beta; PayChangu payout fee pass-through unchanged. `creativeGross` routes through `effectiveCommission()`; `lib/payments.ts:creativeAmount` delegates through it so escrow-panel + cancellation split honor the flag. UI copy updated in `proposal-payout-preview.tsx` ("Waived during beta"), `accept-proposal-picker.tsx` ("No platform fee during beta"), `escrow-panel.tsx` (creative help line). Admin money tile now labeled "Platform revenue (waived during beta)" but still logs the theoretical 15% so visibility is preserved. One-line launch flip: set `NEXT_PUBLIC_BETA_ZERO_COMMISSION=false` in Vercel + redeploy.

BACKLOG: added Identity & Trust section (phone OTP research — eSMS Africa Malawi rate unconfirmed, Africa's Talking backup; IDV vendors Smile/Youverify/Trulioo ~$0.50–$2/verify unconfirmed for Malawi). Rewrote Resend entry — `ganyu.com` is not owned; buy `ganyuhub.com` instead.

## 2026-07-18 — Delete stale skipped dispute E2E test

Removed the `test.skip(...)` "raise a dispute while job is scope_pending" block from `tests/e2e/client-job-flow.spec.ts`. Was gated on PayChangu sandbox wiring — now unblocked via manual sandbox pass, but the accept flow requires a real PayChangu checkout that Playwright can't drive. Dispute UI is already covered elsewhere (`admin.spec.ts` + manual walkthrough), so the test was rot. Also enabled Plausible in prod (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN` set in Vercel, redeployed) — backlog Infrastructure entry can close.

## 2026-07-17 — SERVICES.md (financial single source of truth)

New top-level [SERVICES.md](SERVICES.md) — every paid service by stage (Beta / Money Unlock Day / Public Launch / Scale), with real prices verified from provider pricing pages (Vercel Pro $20, Supabase Pro $25, Resend Free/Pro $0/$20, Plausible Starter $9/mo yearly, UptimeRobot Free/Solo $0/$8, Namecheap ganyuhub.com $6.79 y1 promo / $11.28/yr). PayChangu section pulls actual rates from `lib/fees.ts` (mobile 3%/1.8%, bank 2%/1.5%+MWK700, 15% platform commission kept in full since PayChangu fees are pass-through). Running totals per stage: $0/mo → ~$46/mo (Stage 2) → ~$83/mo (Stage 3). Break-even at Stage 3: ~970k MWK GMV/month.

## 2026-07-17 — WCAG contrast sweep pass 2 (text-stamp)

Full swap of `text-stamp` → `text-stamp-dark` across 12 files (components/{job-card,filters-bar,multi-image-picker}, app/admin/{page,users/page}, app/creatives/[id]/{page,portfolio/[itemId]/page}, app/dashboard/{layout,page,jobs/page,payments/page,proposals/page}). Covers small-text links (~text-xs), stamped badges on `bg-stamp/10`, and the admin "warn" stat tile. #069494 → #046B6B lifts contrast on white from ~3.7:1 to ~5.4:1 (AA-passing for normal text). Reverted the two decorative italic display headings (`app/dashboard/page.tsx:146`, `app/dashboard/jobs/page.tsx:135`) back to bright `text-stamp` — those are large text and part of the brand's teal accent; they already meet AA-large at 3:1. Closes the backlog item.

## 2026-07-16 — Accessibility audit: reduced-motion + WCAG contrast pass 1

Reduced-motion: nothing to do — `app/globals.css:36` already zeros out animation/transition durations under `prefers-reduced-motion: reduce`. Verified.

WCAG contrast: audited teal usage on white. `text-brand` (#069494) = ~3.7:1, fails AA for normal text. Swapped to `text-brand-dark` (#046B6B ≈ 5.4:1, passes) in the four auth/CTA link sites (`app/login/page.tsx`, `app/signup/page.tsx`, `app/forgot-password/page.tsx`, `app/jobs/[id]/page.tsx`). Same #069494 issue applies to `text-stamp` used as small-text links across the dashboard — logged in BACKLOG for a full sweep. Badges on tinted `bg-stamp/10` still meet contrast and were left alone.

## 2026-07-16 — Plausible analytics (pageviews only)

Added the Plausible script to `app/layout.tsx`, gated by `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Inert until the env var is set in Vercel — no accidental data leak, no perf hit. To turn on: (1) create a free Plausible account, add site `ganyu-hub.vercel.app` (later `ganyuhub.com`), (2) set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=ganyu-hub.vercel.app` in Vercel env, (3) redeploy. That gives pageviews, unique visitors, referrers, top pages — enough for the Monday ritual to start (signups = /signup views, jobs page traffic, etc.). Ponytail: no custom events yet; add `plausible('job_posted')` etc. only when pageview data can't answer a real question.

## 2026-07-16 — T+1 release hold on payouts

PayChangu settles collections the next business day (T+1) — funds don't hit our main balance immediately, so a client who paid at 11pm and approved at 11:05pm can't actually be paid out until the next business day. Enforced now on both server and UI. New nullable column `jobs.payment_held_at` gets stamped whenever escrow flips to `payment_held` (both `app/api/paychangu/callback/route.ts` and `app/api/paychangu/webhook/route.ts`). `updateEscrowStatus` rejects a `payment_held → payment_released` transition when `payment_held_at` is under 24h old, returning a message with hours remaining. `EscrowPanel` hides the Release button during the hold window and shows "PayChangu clears funds the next business day (T+1). Release opens in ~Nh." Legacy jobs (null timestamp) skip the check. Ponytail: flat 24h wall-clock hold — upgrade to real business-day logic if a weekend hold ever generates a complaint. Reference: https://support.paychangu.com/

## 2026-07-16 — Landing proof row with real numbers

Homepage now has a "Real numbers · Ganyu Hub to date" row under the hero: GMV, jobs completed, creatives live — all pulled from the same money computation used on `/admin`. Row is guarded by `jobsCompleted >= 3` so it stays hidden until the numbers are worth showing (avoids "MWK 0 · 0 jobs · 1 creative" during pre-launch). Required a small refactor: the old fully-client `app/page.tsx` is now split — `components/home-hero.tsx` keeps the interactive mode-toggle hero, and `app/page.tsx` is a server component that renders the hero + the new proof row. No schema changes.

## 2026-07-16 — Portfolio uploads: client-side direct to Supabase

Killed the last real blocker on portfolio-image uploads: files no longer round-trip through Vercel. `MultiImagePicker` now uses the Supabase browser client to upload each file straight to Storage the moment it's picked (parallel), with per-tile spinner / cover / failed states. The hidden input the parent form posts to the server is now a JSON array of already-uploaded URLs, not File objects. `addPortfolioItem` and `addPortfolioImages` server actions dropped their upload code — they just parse the URL array and write to the DB. Consequence: Vercel's 4.5MB body cap and 10-second server-action timeout are no longer in play, so a creative can add 10 unedited phone photos (30MB+ total) in one shot. Kept the same `name="cover_files"` prop so both callers (`app/dashboard/portfolio/page.tsx`, `app/dashboard/portfolio/[id]/page.tsx`) needed no change. Existing storage RLS at `supabase/schema.sql:436` (auth.uid must match the first path segment) already permits this — no policy migration.

## 2026-07-15 — Ratings into ranking (Browse + For You)

Reviews now shape discovery. `/browse` gets a new **Top rated** sort option in the FiltersBar — profiles are ranked by `avg × log(count+1)` so a 4.8-with-20-reviews outranks a lone 5-star, and unrated creatives sink to the bottom. `getForYouCreatives` (dashboard + homepage feed) quietly does the same re-rank: it now fetches a 4× candidate pool from the category-matched query and re-ranks by the same Bayesian-ish score before returning the top N. Recency remains the default browse sort — only clients who opt into "Top rated" or land on For You get the review-weighted view. Uses the existing `reviews` table; no schema, no new indexes.

## 2026-07-15 — Rate limits on submitProposal + sendMessage

Two guards for the "we're taking real money and inviting real users" era. `submitProposal` now blocks any creative who has already submitted 5 proposals in the last 60 seconds across all jobs — stops spamming every open job in one burst. `sendMessage` blocks any sender who has already sent 20 messages in the last 60 seconds across all threads — stops thread-flooding and cross-user harassment. Both use a `SELECT count(*)` pre-check on the existing table (no new tables, no new deps). Skipped signup/login: Supabase Auth already rate-limits those server-side.

## 2026-07-15 — OG rich-preview cards for creative profiles + jobs

Pasting a creative profile or job link into WhatsApp, Facebook, or any preview-aware surface now renders a proper card instead of a bare URL. Root layout `app/layout.tsx` gets a `metadataBase` and site-wide OG/Twitter defaults (title, description, logo). `/creatives/[id]` gets a per-profile `generateMetadata` that pulls name + primary category + headline + avg star rating; uses the creative's avatar as the OG image when available. `/jobs/[id]` gets a per-job `generateMetadata` that surfaces title, category, budget, and first 140 chars of the brief. Private direct-invite jobs return a generic "Private invite" title with `robots: noindex, nofollow` — no leaking the title or brief in link previews or search. Verify by pasting a live URL into WhatsApp after the deploy settles.

## 2026-07-15 — Site-wide: killed the "→" affordance arrow

Stripped the trailing `→` from every link/button label on the site — job cards ("More info"), homepage ("See all N"), message-embedded job cards ("Open job"), dashboard job rows ("Open"), dashboard "See all", admin disputes "Open job", creative profile completeness chips, portfolio grid "Click to edit", and the "See all" on the public portfolio detail page. The affordance now comes from the button/link styling itself. Kept: decorative rotating badge arrow in `hero-art.tsx` (art, not affordance) and arithmetic arrows in `admin/cancellations` labels ("MWK X → payout Y" as split math).

## 2026-07-15 — Admin nav shortcuts + trend bar color + policy pages as cards

Admin sidebar picks up jump-links for **Money**, **Trends**, and **People & activity** (hash anchors to sections on `/admin`). PeriodBarChart historical bars swapped from muted ink-gray to a soft stamp tint so the trend charts read as teal-family, not grey — current week stays full stamp. `/terms`, `/privacy`, and `/content-policy` sections wrapped in `card-soft` so each rule reads as its own tile instead of a wall of paragraphs.

## 2026-07-15 — Admin overview: analyst dashboard (money + trends)

Rebuilt `/admin` around what a data analyst actually looks for. Headline is now a 6-tile **Money** row: GMV, platform revenue (15% of completed + cancellation take), MWK currently in escrow, paid to creatives, refunded to clients, average completed job value. Below it, **Trends** — 8-week weekly bars for GMV, jobs posted, signups, and disputes, with the current week highlighted. People & activity strip breaks users down by role (clients / creatives / agencies) and links each into `/admin/users?role=`. Existing daily-signups line + jobs-by-status + jobs-by-category charts kept, but pushed below the money view. Moderation queues (disputes / cancellations / errors) demoted to the bottom of the page — they only visually flag when non-zero. Killed the "→" arrow affordance on the KPI tiles; the whole card is the click target with a hover elevation + border tint. All computed server-side in one Promise.all — no new tables, no schema changes.

## 2026-07-15 — User menu: scrollable on short screens

Dropdown had `overflow-hidden` with no height cap, so on short viewports items at the bottom (notably the Admin link for admin accounts) were clipped with no way to reach them. Added `max-h-[calc(100vh-5rem)]` + `overflow-y-auto` and swapped the panel to a flex column so it scrolls internally.

## 2026-07-15 — /terms and /privacy pages

Plain-English Terms of Service and Privacy Policy at `/terms` and `/privacy`. Covers who holds the money (escrow via PayChangu), the flat 15% commission, cancellation splits, dispute process, ID storage, and the no-off-platform-payments rule. Business name "Ganyu Hub", address "Blantyre, Malawi". Linked from the footer alongside Content policy / Report; signup form now has a "By signing up you agree to…" line above the Log in link.

## 2026-07-13 — Merged to prod: 6-step manual plan green

Full sandbox test plan cleared before merging `sandbox-test → main` (cbc0c33): PayChangu accept → checkout → escrow held; release with real payout fee; top-up on same job; cancel with paid top-up; direct invite lets 3×-declined creative submit; 4th proposal without invite blocked.

## 2026-07-13 — Job cards: 2-line brief + explicit "More info →" + overflow-wrap:anywhere

Long unbroken briefs were pushing cards wider than the mobile viewport. Clamped the description to 2 lines, added a visible "More info →" affordance beneath it so the truncation reads as intentional, and switched to `overflow-wrap: anywhere` so pseudo-words like `sandboxtestsandboxtest…` also break mid-word before the clamp fires.

## 2026-07-13 — Messages: attach a job link

Composer gets a "Job" button next to the file-attach button — dropdown of jobs the sender is party to (client's own + jobs a creative has proposed on). Picking one appends a `[[job:UUID]]` marker to the message body. Renderer parses the marker inline and swaps it for a small job card (title, status, budget) that links to `/jobs/[id]`. No schema change; marker lives in the existing `messages.body` text (`lib/message-markers.ts`, `components/message-body.tsx`, `components/message-job-picker.tsx`).

## 2026-07-13 — Admin dashboard: sidebar nav + dedicated Users / Jobs / Disputes pages

The old `/admin` was one long stacked scroll with underlined "→" hyperlinks to sub-pages. Rebuilt as a real sidebar (Overview / Users / Jobs / Disputes / Cancellations / Error log) with the overview page trimmed to KPI cards + charts. Each KPI card is now a link that lights up when its count is non-zero.

New `/admin/users` and `/admin/jobs` use the same filter-chip pattern as the errors page (role chips for users; status chips for jobs) plus a title/name search. New `/admin/disputes` renders each dispute as a collapsed `<details>` card — click to reveal the reason and resolve controls, keeping the page compact when the queue grows.

## 2026-07-13 — Admin errors log: SAST timestamps + job/client/creative names + filter chips

Rows previously showed a truncated UUID and a raw ISO timestamp. Now each row surfaces: short_id + operation badge + `formatSAST()` (Africa/Johannesburg), job title (real title, batch-looked-up) with UUID stub next to it, client name, creative name (from accepted proposal, falling back to any proposal on the job), and the erroring user's name. New `lib/admin-format.ts` centralises SAST formatting and operation grouping. Filter chips (All / Payments / Payouts / Proposals & invites / Other) narrow the list without a full page rewrite. Context JSON hidden in a `<details>` so long rows don't dominate the view.

## 2026-07-13 — Admin cancellations: Pending / Resolved-history tabs

The queue only showed pending items. Added a "Resolved history" tab that lists jobs with `status = 'cancelled'` and `cancellation_resolved_by is not null`, each with the client-refund and creative-cut payout status badges so admin can see whether the money actually moved.

## 2026-07-13 — Admin cancel: trim + case-insensitive title confirm

`adminResolveCancellation` was rejecting resolves with a strict `===` compare when the DB title had a trailing space or the admin typed a different case. The confirm input is a "did you mean this" gate, not a security check — normalized both sides before comparing.

## 2026-07-13 — Private direct jobs (jobs.visibility)

New column `jobs.visibility` ('public' | 'private', default 'public') gated by a check constraint. Public queries (`/jobs`, `lib/feed.ts`) filter to `visibility='public'` so private jobs never surface on the market. `app/jobs/[id]/page.tsx` returns 404 for private jobs unless the viewer is the client or has a `job_invites` row. New `sendInviteWithNewJob` action creates a private job + invite in one submit. The invite page (`/creatives/[id]/invite`) hosts both flows: pick an existing open job, or send a fresh private job — the "Invite to job" button on the profile always shows now (no longer gated on the client having pre-existing open jobs).

## 2026-07-13 — Invite-to-job: dedicated page + fix leaked DB error

The `<details>` popup on the creative's profile was clipped inside the parent card. Replaced with a real `Link` to `/creatives/[id]/invite`. Also fixed a proposal submit that was leaking the raw Postgres error text (`duplicate key value violates unique constraint proposals_job_id_creative_id_key`) to the user — the total unique constraint blocked re-application even though the 3-attempt flow explicitly allows it. Dropped the constraint, added a partial unique index scoped to `status in ('pending','accepted')`, and wrapped the insert in `logAdminError` + `GENERIC_ERROR` so future failures surface in `/admin/errors` instead of the UI.

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

## 2026-07-07 — CategoryPicker restyled as chips

CategoryPicker rebuilt to render as filter-style chips matching the `/browse` filter row, so the picker on profile edit and job posting stops looking like a plain multi-select and lines up with the rest of the taxonomy UI (commit `0809734`).

## 2026-07-07 — Money layer uses accepted bid as the agreed amount

`lib/money.ts` and all downstream reads (dashboard, payments, jobs) now treat the accepted proposal's bid as the agreed amount, not the client's posted budget. Posted budget stays a hint at listing time; once a proposal is accepted the bid is the number that flows through commitment and payout math (commit `d769031`).

## 2026-07-07 — DEPLOY.md

Added `DEPLOY.md` with the required env vars, Vercel setup steps, and Supabase migration sequence so the deploy story lives outside a chat window (commit `ed5f8d7`).

## 2026-07-06 — Money source-of-truth (lib/money.ts) + MK → MWK

New `lib/money.ts` gives one place to answer "how much has the client actually spent" (released) and "how much is committed" (accepted, whether released or still held). Dashboard, `/dashboard/payments`, and job pages repointed to those helpers so numbers stop drifting across pages. Currency label switched from placeholder `MK` to `MWK` everywhere (commit `a2aeae9`).

## 2026-07-06 — Reviews loop + portfolio detail/edit + private job-file attachments

Completed jobs now prompt both sides for a 1–5 star review with an optional comment via `submitReview`; RLS locks inserts to parties of a completed job. Star average + recent reviews render on `/creatives/[id]` (replacing the fake "Response time" stat) and `/browse` cards show real stars via a per-profile rollup.

Portfolio items got a proper detail route and an edit route so creatives can manage pieces without leaving the app.

Message attachments moved off public URLs onto a private `job-files` Supabase Storage bucket, with signed URLs minted per-view (RLS scopes reads to thread participants). New `AttachmentPicker`, `MessageAttachment`, `ImagePicker`, and `MultiImagePicker` components underpin the flow. Also switched image renders to `next/image` where sane and added `tests/e2e/mobile.spec.ts` covering the newly responsive screens (commit `a2aeae9`).

## 2026-07-06 — Category taxonomy constrained to canonical six

Seed data and post/edit forms constrained to the canonical six categories (Photography renamed to Video & Photography; Content Creation added). Added audit + normalise scripts (`scripts/audit-categories.mjs`, `scripts/normalize-categories.mjs`) to detect and fix drift already in the DB (commits `a2aeae9`, `7f736ca`).

## 2026-07-06 — E2E: stable fixtures + broaden test-DB wipe

Test-DB wipe expanded to cover the new tables added since the last reseed, and Playwright fixtures reworked to hand tests a predictable starting state instead of re-deriving one every run (commit `9d9e1ee`).

## 2026-07-06 — E2E: client-job-flow aligned to Active/Open taxonomy + dispute timing

`tests/e2e/client-job-flow.spec.ts` updated for the split of Active vs Open on `/dashboard/jobs` and for the new timing on dispute raise (needs the job to have moved past `scope_pending`) so the spec matches what a real client actually does (commit `b95e25f`).

## 2026-07-02 — PRODUCT.md: document business decisions

Started `PRODUCT.md` as the durable record of business decisions that don't live naturally in code or the changelog — commission %, refund policy, category taxonomy, moderation stance, deferred pre-launch decisions (commit `129d5d6`).

## 2026-07-02 — Verify remaining status flows + fix SavingForm silent prop

Walked the remaining job status transitions live and cleared them off the test log. Fixed a bug in `SavingForm` where `silent` was being passed through to the DOM as an unknown attribute, producing a React warning on every form that used it (commit `8954ef0`).

## 2026-07-01 — Motion P1 polish

Second motion pass after the sitewide animation layer landed: entry timings tightened, hover transitions synced, and a couple of jitter cases removed on route change (commit `d6fe9e7`).

## 2026-07-01 — Brand red placeholder swapped to teal #069494

Replaced the placeholder brand red with `#069494` teal everywhere it appeared as `stamp` / brand accent — buttons, links, badges, focus rings. No structural changes, purely a token swap (commit `5f8bff7`).

## 2026-07-01 — Honor `prefers-reduced-motion` + init PRODUCT.md

Animation layer now respects the OS reduced-motion preference: transitions collapse to instant when the user has that set. Also spun up `PRODUCT.md` as a placeholder for the business-decisions record that lands the next day (commit `1594d2c`).

## 2026-07-01 — Fix RSC revalidation race + landing switcher + surface email info

Fixed an RSC race where a form action's `revalidatePath` landed before the redirect, leaving stale UI on the next page. Landing hero got a category switcher, and `SavingForm` now surfaces server-action `info` strings alongside errors so messages like "Check your inbox to confirm the new email" actually render (commit `dd1dad0`).

## 2026-07-01 — Forgot-password flow + e2e specs for untested surfaces

`/forgot-password` page + `/reset-password` page wired through `supabase.auth.resetPasswordForEmail` with `redirectTo=/auth/callback?type=recovery`. Added Playwright specs for password recovery, empty states, error pages, and other previously untested surfaces (commit `4e295d2`).

## 2026-07-01 — Portfolio analytics for creatives

Dashboard gained a Profile Insights section with four KPIs (views, saves, proposals sent, save rate) plus a small trend chart, all sourced from the `interactions` table (commit `64df767`).

## 2026-07-01 — Password recovery, proposal cap, availability, UI polish

Bundle commit covering: initial password-recovery scaffolding, the first cut of the per-job proposal cap (10/job), creative availability selector on `/dashboard/profile`, and a raft of small UI polish across cards, headers, and forms (commit `616bd5b`).

## 2026-07-01 — Recharts across admin/dashboard + sitewide animation layer + landing polish

Introduced Recharts as the charting library and used it for the admin signups/status/category charts and the dashboard's Profile Insights trend. Also added a sitewide animation layer (page/route transitions, card pop on hover, subtle motion primitives in `components/animated.tsx`) and another pass of landing-page polish (commit `b780bd9`).

## 2026-06-30 — White theme, Inter font, dual-mode hero, payments scaffold, seed script

Broad visual reset: white theme, Inter typeface, dual-mode landing hero (creative-first / client-first switcher). Payments got its first scaffold — dashboard route, currency helpers, and the shape of what a real integration would populate. `scripts/seed.mjs` added so a fresh DB can be brought to a demo state without hand-clicking (commit `2eddaeb`).

## 2026-06-29 — Editorial redesign (Ganyu Press): landing, dashboard, profile, messages

Three commits landed together as an editorial visual system:

- **Ganyu Press landing** and editorial dashboard — full-bleed hero, magazine-style typography, tabbed dashboard replacing the flat stack (commit `34575d8`).
- **Sticky nav** on every route, editorial rework of the public profile and the messages surface, and the full-bleed hero polished for real content (commit `09612d8`).
- **Profile-completeness gate** blocking creatives from being public until they have a bio, at least one portfolio piece, and a service; card-pop hover motion applied across creative + job cards; new **admin shell** so the admin routes render inside their own layout instead of the dashboard (commit `02c73a0`).

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
