# Next session — port the app to the screenshots

Paste this whole file into a new session as the opening message.

> **This session has one job: make the app match the Claude Design screens.**
> Not feature work, not refactoring. The design system is settled and the port
> is roughly half done.

---

## The screenshots are the specification

`C:\Users\vinny\Desktop\Inspo 3\` — 20 PNGs of the Claude Design screens.

**Read each screenshot immediately before porting that screen, not all at the
start.** The previous session read five of twenty and then ran out of room to
act on them. One image, one screen, one commit.

| File | Screen |
|---|---|
| `pwa job 3.png`, `PWA job 2.png`, `PWA Job 4.png` | Post a job, steps 1, 2, 3 |
| `Dashboard.png`, `dashboard 2.png` | Dashboard home |
| `job detail.png`, `job details 2.png`, `Job.png`, `job 2.png`, `job 3.png` | Job detail |
| `messages.png`, `messages (2).png`, `messages (3).png`, `messages 3.png` | Messages |
| `profile.png`, `profile (2).png` | Creative profile |
| `creatives.png`, `creatives 2.png` | Browse |
| `empty ststes.png`, `eplty state.png` | Empty states |

Fifteen of these have never been opened by any session.

---

## Read this before touching colour — it cost a whole afternoon

**`design-system/CLAUDE.md` is a 212-line SUMMARY. It is not the system.**

The real values are in `design-system/tokens/*.css` (382 lines across seven
files) and are explained in `design-system/guidelines/*.card.html`. Both have
been in the repo since the export. `app/globals.css` now `@import`s the token
files directly, so they resolve in the browser — do not go back to
transcribing them.

**And the tokens file itself mixes two things.** Its header says every value was
"extracted from tailwind.config.ts, app/globals.css, job-header.tsx and
job-progress-bar.tsx" — so some tokens are just this repo's *old code* lifted
out, never designed.

> **The test that settles any colour question: grep `design-screens/GanyuHubScreens.dc.html`.**
> That file is the design. If a hex appears there, it is real.

Worked example, which flip-flopped three times in one day before this rule:

- `--stage-1..5` (sky, indigo, violet, amber, emerald) — **0 occurrences** in
  the screens, which use `#069494` teal 151 times. Legacy. The stage bar is teal.
- `--status-*` (`#22c55e`, `#facc15`, `#fbbf24`) — **present** in the screens.
  Real. Used for availability dots and stars.

---

## What is done

All eight exported screens are ported to some degree, plus:

- Tokens, elevation, money stamps, empty-state weights
- Hero photography slideshow, the money tiles, "Needs a reply" filter,
  "What you paid", "N jobs done", month-framed released tile
- **An open thread is full-screen on a phone** (`12cfac3`) — `app/layout.tsx`
  drops all site chrome on `/messages/<id>` below `md`

## What is NOT done — the actual work

From the five screenshots that were read:

**Post a job** (`/jobs/new`) — the design has three steps: "What you need",
"Budget & deadline", "Review". Ours has "What you need", "What you'll get",
"Budget". Missing entirely: **"Skills you are looking for"** (tag input) and
**"Where is the work?"** (location). Step 3 should be a Review step showing the
job as a card, with "Posting is free. Nothing leaves your account until you pick
someone and fund the job." Ours has no Review step.

**Dashboard** — ours is roughly half. Missing: "Needs you" as job cards with a
status pill, a money pill and an action button ("Deliver files →" / "Nudge the
client"); "Proposals sent" with Shortlisted / Under review / Not chosen pills;
and the entire desktop right rail (messages panel with avatars and unread
counts, "Jobs worth a look", profile-completeness card). Greeting should be
time-of-day ("Good morning, Chikondi"), not "Welcome back".

**Messages thread** — full-screen is done, the contents are not. Missing: the
stamp-ring watermark at 3% behind the stream, date divider chips (THURSDAY 20
AUGUST / YESTERDAY / TODAY), escrow events as their own stamped centred line
("Escrow funded · MWK 85,000 / Thoko paid 21 Aug · held until you deliver"),
teal outgoing bubbles vs raised incoming, file-attachment bubbles with size and
"delivered file", read receipts ("Read 09:14"), "Online" / "typing…" status,
and the `+` compose button on the list.

**Not yet examined at all:** browse, profile, empty states, and the remaining
job-detail and messages variants.

## Screens that genuinely do not exist yet

Only these four need generating in Claude Design. **Everything else already
exists** — a previous session wrongly asked for Post a job, which was already
drawn.

1. The share link signed out (`/j/[token]`) — first thing a person with no
   account ever sees, and it asks them to fund escrow
2. Money (`/dashboard/payments`)
3. Settings and profile editing (nine routes share one shape)
4. Sign in / sign up / onboarding

Briefs for all four are in `CLAUDE_DESIGN_WORKFLOW.md`. **Export as HTML, never
Print to PDF** — the PDFs contain zero extractable text, no renderer here can
open them, and the capture clipped a 27-artboard document down to two pages.

The one real colour gap: the system has no **messaging** palette (error,
warning, success, information banners). `--status-danger` exists but the
guideline reserves red-600 for log out and destructive actions only. Roughly a
hundred raw Tailwind colours across the app are improvising it.

---

## Ground rules that do not change

- **The founder performs all logins and anything that moves money.** Ask.
- **Supabase is `select`-only** without asking first.
- **`main` is production with live keys.** Update `CHANGELOG.md`, `TEST_LOG.md`,
  `BUG_LOG.md` and the roadmap on every push.
- **Node is capped at 6GB** in `.claude/launch.json`. Above ~8GB the machine
  crashes. Never run `next build` while the dev server is running.
- **Judge every screen at 390 first**, then 1440. Measure with
  `getBoundingClientRect()` rather than trusting a screenshot — every real
  defect this week was found by measuring, not by looking.

## Two traps that will waste an hour each

1. **Route handlers 404 with a stale `.next`.** If `/auth/signout`,
   `/auth/callback` or any `app/**/route.ts` returns 404 while pages work,
   delete `.next` before debugging the handler. Restarting the dev server is
   NOT enough. The dev log blames your application code. See BUG-026.
2. **The design PDFs on the Desktop are unreadable.** Do not retry them.

## Still unverified by a human

- "What you paid" on job detail has never been seen — it is client-only and the
  test account is a creative
- The availability switch has never been clicked
- No physical device has ever loaded this app
