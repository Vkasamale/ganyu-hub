# Next session

Paste this whole file into a new session as the opening message.

> **Next session is the PWA.** That's the headline task — installable app,
> manifest, service worker, caching/offline strategy, icons, install prompt.
> Nothing below outranks it; the items here are context and follow-ups, not a
> queue to clear first. Two genuinely interact with PWA work: the notification
> split (§1) matters more once notifications can reach a phone, and the
> WhatsApp-style Messages layout was built against a full-desktop reference and
> has **not** been looked at at phone width.

---

## Setup

- **Chrome** — signed in as **EQ Admin Client** (client + admin). Keep Vercel and
  Supabase open here; Claude can't see those tabs and will ask you to read them.
- **In-app Browser pane** — signed in as **Adam Creative**. Must be *visible on
  screen*; collapsed, it stops compositing and every click lands at (0,0).

Preview: `https://ganyu-hub-git-sandbox-test-vkasamales-projects.vercel.app`

Branch `sandbox-test`, at `9606b0a` + a docs commit. `main` is production with
live keys — never test there. Before any money moves, confirm Vercel → Settings →
Environment Variables → **Preview** → `PAYCHANGU_SECRET_KEY` starts with
`sec-test-`. See `PAYCHANGU_TESTING.md` for test numbers (leading zero required).

Ground rules that have held throughout: the founder performs all logins and
clicks anything that moves money. Supabase is `select`-only without asking.
Update CHANGELOG, TEST_LOG, BUG_LOG and the roadmap on every push.

---

## 0. Run the production backfill — do this first

`main` shipped the job-conversation feature on 2026-08-07, but the backfill was
only ever run against **sandbox** (42 threads there). Until it runs against the
**production** Supabase project, Messages on production shows a `Jobs 0` chip and
none of the real jobs appear as conversations — the feature looks broken when it
isn't.

File: `supabase/backfill-job-threads.sql`. Three steps: dry run (writes nothing),
insert, verify (`missing` must come back `0`). Idempotent — safe to re-run.
**Founder runs it**; Claude does not write to the database.

Note before running: threads are created at acceptance, so this catches every job
accepted before the code shipped. It stamps `created_at` with the job's real
payment date, so backfilled threads sort by history instead of bunching at the
top of the list.

## 1. Look at what shipped — none of it has been opened in a browser

Everything below is typechecked and pushed, 85/85 green, but unverified on
screen. Start here; it's cheap and it's where surprises live.

- **Notification tabs split.** *This is the thing the founder actually reported.*
  Open the bell: job events (deliveries, disputes, releases) should now sit under
  **Jobs**, real chat under **Messages**. Root cause was `notification_kind` being
  a 4-value enum predating jobs, so everything job-shaped is written as
  `message_received`; tabs now read `target_type` instead.
- **The thread view.** Open any backfilled conversation. Expect: job events as
  centred system notes between message bubbles, in time order starting at
  proposal accepted; a "Latest event: …" jump link in the header; the job title
  under the person's name linking back to the job.
- **The job-picker chip.** In a thread composer, click **Job** — it should show a
  removable chip with the job's title, *not* `[[job:<uuid>]]` in the text box.
  Send one and confirm the job card still renders in the sent message.
- **Send work for review → status advances.** Needs a **funded** job; the delivery
  panel only renders while a job is active. Sending work should tick Delivered on
  the stepper with no second button.

## 2. The money-state stamp needs another pass

Position is settled and confirmed live — on the money's line, out at the card's
right margin, bigger. The *texture* isn't. Currently the flanking rules read as a
strike-through of the text and the double ring is too subtle to register; it's a
rounder chip, not ink. Founder wants an actual rubber stamp.

Next attempt: rules **above and below** the text rather than beside it (that's the
layout real stamps use), heavier outer ring visibly separated from the inner one,
wider tracking, possibly a dashed outer ring to suggest ink bleed. **Judge it from
a screenshot, not from markup** — that was the mistake last time.

Also still open: the header stamp says "Released to creative" while the Payment
card beneath says "Payment released". Two labels for one fact. Probably drop the
card's badge.

## 3. Messages — the pieces deliberately left out

- **Message-body search.** Search currently covers job titles, names and preview
  text, all client-side. Searching message *history* needs a server query against
  `messages.body` plus a Postgres text index. Deferred until thread volume
  justifies the index — say so rather than quietly skipping it.
- **Unread state.** No unread bolding or per-thread count yet; WhatsApp has both
  and the founder's reference screenshot shows them.
- **Empty-thread preview reads oddly**: a job thread with no messages and no
  events falls back to the other person's name, which is already the group
  header. Should read "No activity yet".

## 3b. Tab split for direct vs job conversations — founder request

Raised at the end of 2026-08-07, logged in `BACKLOG.md` → Messages. **Check the
live page before writing anything:** `All / Jobs / Direct` filter chips already
ship in `components/thread-list.tsx`, taken from the founder's WhatsApp Web
reference, and they replaced an earlier build that used stacked section headings.
The founder had not seen the chips when the request was made.

So the real question is whether chips are the right weight, or whether this wants
true tabs (underline, persisted selection) — not whether the split exists.
Ask before building; do not rebuild what is there.

## 4. Deposits — design settled, two decisions open

Creatives needing materials money upfront. Settled: an *early partial release*,
not a second collection, capped as a percentage set at proposal stage as a
structured field. Still open:

- Who absorbs the doubled payout fee (`2% + MWK 700` charged twice)?
- Cancellation maths once deposit money is already out.

`MONEY_STATE` in `components/job-header.tsx` is a keyed map, so "x deposited" is
one added key.

## 5. Job page — the "job settings" idea

Founder floated grouping Cancel job / Something gone wrong / deadline extension
behind a per-job settings control, then said it wasn't a complete thought. Left
alone deliberately. Worth revisiting *after* using the current layout, since
merging delivery and submit already removed one standing control.

---

## Closed 2026-08-07 — do not re-test

- **BUG-018** — verified live on `849eb4c9…`: exactly one `payment_released`,
  `via = reconcile`. The webhook lost the compare-and-swap and wrote nothing.
- **BUG-012** — verified live on the same job, released from `payment_disputed`:
  `payout_ref` written, `payout_error` null. Money actually moved.
- **BUG-017**, **BUG-016** — closed earlier the same day.
- All five money-state badges seen on screen.
- Chevron collapsibles, sandbox settlement copy, preview-URL share links.
- **Who closes a job** — decided: releasing payment does NOT imply the work is
  done (a client may pay a friend early), so completion is never inferred from
  payment. Escrow panel recommends releasing once satisfied; **closing is the
  creative's action, gated on `payment_released`**, and sits at the very bottom
  of the page as a last resort.
- **Send work for review** — sending work IS submitting it; "Mark as submitted"
  is gone.
- **Job conversation backfill** — run, 42 threads, 0 missing. Don't run again
  (harmless if you do; it's idempotent).

## Still outstanding

- ~~Rotate the exposed PayChangu keys~~ — **closed 2026-08-07, no action needed.**
  Founder's call, and correct: those are `sec-test-` sandbox keys, not live ones.
  They cannot move real money. Do not re-raise this.
- **Clean up throwaway rows** — jobs `849eb4c9…`, `99e8569b…`, `d2a9aea7…`,
  `0ba49618…`, and the three deadline extensions on `changu`. Note these now have
  conversations attached, so deleting jobs should cascade or the threads go stale.
- **Buy `ganyuhub.com`** (founder's) — gates working notification email.
- **Four jobs at status `open` carrying an accepted proposal** (`testign2`,
  `email testing`, `poster`, `logo`). Legacy seed data; anything assuming
  "accepted ⇒ in progress" is wrong about them.
- A client who releases early and goes quiet leaves the job open until the
  creative closes it — stale `in_progress` rows can accumulate.
- Backlog proper lives in `BACKLOG.md`. Highest-value unblocked items: deposits,
  moving "revisions included" from client to creative, portfolio image upload.
