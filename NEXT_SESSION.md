# Next session — handoff

Written 2026-08-07 at the end of the deadline-history / client-profiles session.
Paste the prompt below to start. Everything under it is the context behind it.

---

## The prompt (paste this)

> Three things, smallest first.
>
> **1. Verify last session's work in the real app.** Three changes shipped that
> only unit tests have seen. The checks are written out in `TEST_LOG.md` under
> the 2026-08-07 entries — the ones that matter are: approve *two* deadline
> extensions on one job and confirm the struck-through date is still the
> **first** one; visit a client's `/creatives/[id]` and confirm it redirects to
> `/clients/[id]`; and complete a real sandbox release so the
> `payment_released` job event actually lands. That last one needs a
> **completed** payment, not just a reachable checkout — that's the BUG-009
> lesson.
>
> **2. Surface escrow-release speed on `/clients/[id]`** — but only if real
> `payment_released` events exist by then. Pair each event's `created_at`
> against that job's `payment_held_at` and show the average. If no releases
> have accrued yet, say so and skip it rather than shipping a stat that reads
> "—" for everyone.
>
> **3. `ganyuhub.com`.** Still unbought, still the highest real-world impact of
> anything outstanding. Beta creatives currently receive **no** notification
> email at all.
>
> Read `NEXT_SESSION.md` for full context and the smaller pending items.

---

## Where things stand

Bug log is **empty of open bugs** — BUG-001 through BUG-011 are all fixed.
Suite is **62 passing**. `main` is clean.

**⚠️ Two commits are unpushed** as of writing: `0a16bfd` (extra-revision panel)
and `e50313d` (`payment_released` event). Push them before starting anything, or
the working tree will disagree with production.

Shipped this session:

- **Deadline history.** `jobs.original_deadline`, stamped once on the first
  approved extension, struck through beside the current date on `/jobs/[id]`.
  **The column is already applied in production** — verified by querying it.
- **Client profiles.** `/clients/[id]` — a hiring record (jobs posted, hire
  rate, completed, member since, reviews from creatives), `noindex`, gated to
  signed-in creatives. `/creatives/[id]` redirects when `role = 'client'`.
- **BUG-010** — clients no longer asked to accept and pay their own
  extra-revision charge.
- **BUG-011** — creative→client review links now route to `/clients/…`.
- **`payment_released` job event** — records *when* a creative is paid.

## The model that got settled (don't re-litigate)

A **creative** is a seller. Their page is a public shop window — portfolio,
services, price-from, "Invite to job". Its job is to win work.

A **client** is a buyer. They aren't browsed; a creative lands on their page
from a specific job, at one moment: deciding whether to bid. Its job is to
answer "is this person worth working for".

Decided with the founder: client pages are visible to **signed-in creatives**
(not public, not restricted to past collaborators); creatives **do** review
clients after escrow releases; and clients live at **`/clients/[id]`**, a
separate route, so existing `/creatives/[id]` share links keep working.

Reviews needed no schema change — `leaveReview` has always set `reviewee_id` by
side. Only the route it generated was wrong.

## Item 2 — escrow-release speed, in detail

**Why it isn't built yet.** The client page's whole purpose is answering "will
this person pay", and that's the one stat it can't show. `payment_held_at` marks
the start of the wait; nothing marked the end — so the duration wasn't
computable at all.

**What changed.** A `payment_released` event is now logged at both release
sites: the payout webhook and the reconcile path. (`updateEscrowStatus` never
writes that status itself — it initiates the payout and the HMAC-verified
webhook flips it — so those two are the complete set.)

Chosen over a `jobs.payment_released_at` column: no schema change, `created_at`
is free, append-only can't be overwritten, and the release now shows on the job
timeline as "Payment released to creative".

**It only accrues forward.** Past releases are unrecoverable. Which is exactly
why the display was deferred and the recording wasn't.

**To build the stat:** for the client's jobs, fetch `payment_released` events
from `job_events`, pair each against that job's `payment_held_at`, average the
delta in days. One extra query. The `ponytail:` comment at the foot of
`app/clients/[id]/page.tsx` says the same.

## Smaller pending items

- **`ganyuhub.com` is still unbought.** Blocks two things: real notification
  email (Resend is sandboxed and only delivers to the founder, so beta creatives
  get nothing) and the Supabase project ref showing on the Google consent
  screen.
- **`APP_URL` — resolved, no action.** Production `og:url` renders as
  `https://ganyu-hub.vercel.app`, and `APP_URL` takes precedence over
  everything in `lib/site-url.ts`, so a localhost value would have shown there.
  Note the same string is also the hardcoded fallback, so this proves the value
  isn't *wrong*, not that it's *set*. Either way share/email links are correct.
- **Wallet with batched withdrawals** — see `BACKLOG.md` → Payments. The only
  route to a genuinely flat payout percentage. Needs volume first.
- **Tour refinements** — per-nav-item targets, a replay link. See `BACKLOG.md`.
- **Agency has no page of its own** — deliberate, logged in `BACKLOG.md`.
  `agency` and un-onboarded `null` roles still render the creative layout.

## Founder to-dos carried over (not code)

- [ ] **Rotate the PayChangu test webhook secret and test public key** — both
      were visible in a screenshot. Test credentials only; the live secret key
      was masked.
- [ ] **Delete the `test/paychangu-sandbox` branch** when sandbox testing is
      done.
- [ ] Confirm the sandbox test job `b926bfca-…` and Vercel Deployment
      Protection were both dealt with — believed done, never confirmed in
      writing.

## Testing notes that will save time

- Preview URLs: use the **branch** URL
  (`ganyu-hub-git-<branch>-<scope>.vercel.app`), never the per-deployment
  `ganyu-<hash>` one — the latter is an immutable snapshot and will serve stale
  code after a fix.
- Production is `https://ganyu-hub.vercel.app`. (`ganyu.vercel.app` is an
  unrelated project — someone else's music API.)
- Preview shares the **production** Supabase project. There is no staging DB.
  Use throwaway rows and clean up.
- PayChangu test keys are scoped to Vercel **Preview + Development**; live keys
  are Production-only. There is no sandbox *host* — `lib/payments.ts` always
  calls `api.paychangu.com`, and the key alone decides test vs live.
- Cloudflare Turnstile is domain-locked, so previews use Cloudflare's always-pass
  test keys (`1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`),
  also scoped to Preview + Development.
- `logJobEvent` swallows its own errors on purpose, so a failed log can never
  block a payout. If a timeline row is missing, check the function logs for
  `[job-events] insert failed` — the UI will not tell you.

## Standing rules

- Update `CHANGELOG.md`, `TEST_LOG.md` and `GanyuHub_DevRoadmap.md` on every push.
- Version stays in `0.x` until public launch; human-facing versions are
  four-part (e.g. `0.8.1.2`), `package.json` stays valid 3-part semver.
- `supabase/schema.sql` is applied **manually** — call out any change loudly.
- Live repo is `C:\Users\vinny\GANYU HUB`, not the OneDrive path.
