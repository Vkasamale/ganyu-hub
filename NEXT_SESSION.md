# Next session

Paste this whole file into a new session as the opening message.

> **Next session is the DESIGN TEMPLATE. Not feature work.**
>
> All 79 plan items (Phases 0–9) are shipped and merged to `main` as of
> 2026-08-13, and the Claude Design **system** run is done. What remains is the
> template step.
>
> **Before anything else, ask the founder for the transcribed YouTube video
> about using Claude Design.** It is not in this repo and did not survive
> compaction. The founder supplied it deliberately, because the generic
> approach needed adapting to how this site is built — so do not improvise the
> template step without it.
>
> Then read **`BACKLOG.md` → "▶ NEXT SESSION STARTS HERE"**, which lists the
> prepared inputs (`DESIGN.md`, `DESIGN_BRIEF.md`, the handoff folder on the
> Desktop) and the two decisions — paper-vs-white and the `font-display`
> conflict — worth settling before anything is composed on top of them.
>
> Everything below this line is older context, kept for reference. It is **not**
> a queue to clear, and its "headline task" is long finished.

---

## Setup

- **Chrome** — signed in as **EQ Admin Client** (client + admin). Keep Vercel and
  Supabase open here; Claude can't see those tabs and will ask you to read them.
- **In-app Browser pane** — signed in as **Adam Creative**. Must be *visible on
  screen*; collapsed, it stops compositing and every click lands at (0,0), and
  screenshots time out with "the page is not compositing frames".

**Branches: `main` only.** `redesign/job-page` and `sandbox-test` were deleted
locally and on the remote on 2026-08-12 — all three were at the same commit, so
nothing was lost. `test/paychangu-sandbox` and three `vercel/*` branches still
exist on the remote and were deliberately left alone.

`main` is production with live keys. Before any money moves, confirm
Vercel → Settings → Environment Variables → **Preview** →
`PAYCHANGU_SECRET_KEY` starts with `sec-test-`. See `PAYCHANGU_TESTING.md` for
test numbers (leading zero required).

Local dev: `npm run dev` in `C:\Users\vinny\GANYU HUB`. Note the OneDrive path
is *not* the live repo — `.claude/launch.json` there is attach-only and points
at `http://localhost:3000`.

Ground rules that have held throughout: the founder performs all logins and
clicks anything that moves money. Supabase is `select`-only without asking.
Update CHANGELOG, TEST_LOG, BUG_LOG and the roadmap on every push.

---

## 0. Read these three first

`IMPLEMENTATION_PLAN.md` is the spine — the 79 findings in
`DESIGN_GAP_AUDIT.md` turned into phased work, with the landing page (L1–L11)
sitting *before* Phase 0. `DESIGN.md` §4 (judge from a screenshot), §7 (14px
cards, `rounded-md` controls) and §10 (imagery) are the rules that caught every
defect this session.

**The split rule, which decides what we do and what Claude Design does:** we
build anything needing a table, a column, a query, a route or a form field.
Claude Design polishes spacing, type, colour, motion, card composition, the
stamp. Design can only design what exists, so structure ships first.

## 1. L8–L11 — build the sections, leave them dark

This is the headline task. Four sections, each rendering **nothing at all**
below its threshold.

| # | Section | Turns on at |
|---|---|---|
| L8 | Testimonials carousel | ≥3 testimonials |
| L9 | Featured creatives | ≥6 profiles with a portfolio item |
| L10 | Success story | 1 completed job written up |
| L11 | Trusted-by row | ≥4 named clients with permission |

**The pattern already exists — copy it, don't invent it.** `app/page.tsx:30` is
`const showProof = jobsCompleted >= 3;` and the proof row simply isn't rendered
below that. Audit §Q7 generalises it: *never a zero, never a placeholder, never
`★ — (0 reviews)`.* An empty testimonial carousel says "nobody uses this"; a
hidden one says nothing, which is accurate.

Two things to settle while building:

- **L8 has no data source yet.** Testimonials come from Phase 3, which uses the
  existing `/j/[token]` share-link machinery to collect them from a creative's
  *offline* clients. Closed beta produces zero review rows until on-platform
  jobs complete, which is exactly why Phase 3 is sequenced before Phase 4.
  Decide whether L8 reads `reviews` or a new testimonials source *before*
  writing the query.
- **Carousels must peek** (§Q8) — the next card deliberately half-visible at
  the right edge is the only affordance saying the row swipes. A row ending
  flush at the viewport edge reads as a static grid.

## 2. Phase 0 — eight items, no migrations, ~1 session

| # | Item | Where | § |
|---|---|---|---|
| 1 | Price in the CTA — `Fund escrow (MWK 20,000)` | escrow panel, every money button | N4 |
| 2 | Sticky action bar (mobile) + sticky money card (desktop) | job detail, profile | G1, M8 |
| 3 | Verify briefs render `whitespace-pre-line` | job detail | G6 |
| 4 | Persuasive empty states with a real CTA | ~12 surfaces | E, F8 |
| 5 | Two empty-state weights — button for an empty inbox, quiet link for an empty thread | messages | H2 |
| 6 | `+N` overflow on chip lists | skills, tags | M9 |
| 7 | Unread count pills | thread list | H3 |
| 8 | Weighted checklist — `Portfolio (+20%)` + "4.5x more likely to get hired" | `WelcomeChecklist` | L3 |

Items 1 and 2 are the visible wins. Item 7 also closes a standing Messages gap
(§5 below).

## 3. Landing page — what shipped 2026-08-12, and what's untested

Eight of eleven items. `main` at `4f38fb0`, badge `v0.9.1.2`.

Shipped: L1 mobile hero (flat band — *finished*, not waiting), L1b install
banner, L1c announcement bar, L2 value props, L3 category grid, L4 how it
works, L5 real footer, L6 CTA band. L7 proof row pre-existed and is live on
real numbers (MWK 1.6M, 19 jobs, 59 creatives).

**Nothing here has been opened on a physical phone.** Three items need a real
device and one needs a login:

- **The install banner's iOS branch has never run.** It is the entire reason
  the component exists — Safari implements no `beforeinstallprompt`, so the
  Add-to-Home-Screen hint is the only install path an iPhone user has. On a
  real iPhone the bar should read "Tap ⧉ then Add to Home Screen" with **no**
  Install button. Desktop testing used a synthetic event.
- **A real `beforeinstallprompt` on Android Chrome**, and whether `prompt()`
  actually opens the install sheet.
- **Install-banner suppression on `/dashboard`** — needs a signed-in session.
- **The footer accordion is a touch control** and no thumb has tested the tap
  targets. Keyboard traversal also unchecked.

Also unexercised: setting `ANNOUNCEMENT = null` in
`components/announcement-bar.tsx` to retire the beta bar. Correct by
inspection; worth ten seconds the first time you use it.

**Editing the announcement:** one constant at the top of
`components/announcement-bar.tsx`. **Bump its `id` whenever the text changes** —
dismissal is keyed on the id, so a visitor who closed the beta notice would
otherwise never see the launch notice.

## 4. Hero photography — waiting on assets

Beta creatives are sending photographs; none have arrived. `DESIGN.md` §10 is
the checklist to judge them against: no eye contact, face partial or absent,
real space, mid-action, already dark, dead space left for type. Forbidden:
posed, NGO grammar, chitenje-as-shorthand, and above all **the wrong country**.

Budget is **≤160 KB desktop, 0 KB mobile**. Mobile ships no hero image at all
and that is finished, not pending — Fiverr ships none either (§Q8). Do not
art-direct a mobile crop; replace the element. Full arrival procedure in
`BACKLOG.md`.

## 5. Messages — the pieces deliberately left out

- **Message-body search.** Search covers job titles, names and preview text,
  all client-side. Searching message *history* needs a server query against
  `messages.body` plus a Postgres text index. Deferred until thread volume
  justifies the index — say so rather than quietly skipping it.
- **Unread state.** No unread bolding or per-thread count yet. Phase 0 item 7
  covers the count pill.
- **Empty-thread preview reads oddly**: a job thread with no messages and no
  events falls back to the other person's name, which is already the group
  header. Should read "No activity yet".
- **Tab split for direct vs job conversations.** `All / Jobs / Direct` filter
  chips already ship in `components/thread-list.tsx`. The founder had not seen
  them when the request was made, so the real question is whether chips are the
  right weight or whether this wants true tabs — **not** whether the split
  exists. Ask before building; do not rebuild what is there.

## 6. The money-state stamp needs another pass

Position is settled and confirmed live — on the money's line, at the card's
right margin, bigger. The *texture* isn't. The flanking rules read as a
strike-through and the double ring is too subtle; it's a rounder chip, not ink.

Next attempt: rules **above and below** the text rather than beside it (the
layout real stamps use), heavier outer ring visibly separated from the inner
one, wider tracking, possibly a dashed outer ring for ink bleed. **Judge it
from a screenshot** — that was the mistake last time.

Still open: the header stamp says "Released to creative" while the Payment card
beneath says "Payment released". Two labels for one fact. Probably drop the
card's badge.

## 7. Deposits — design settled, two decisions open

Creatives needing materials money upfront. Settled: an *early partial release*,
not a second collection, capped as a percentage set at proposal stage as a
structured field. Still open:

- Who absorbs the doubled payout fee (`2% + MWK 700` charged twice)?
- Cancellation maths once deposit money is already out.

`MONEY_STATE` in `components/job-header.tsx` is a keyed map, so "x deposited"
is one added key.

## 8. Claude Design — a fresh run, and when

The in-flight run was **terminated deliberately** on 2026-08-12: it was
designing against a product about to change on nearly every surface, and
feeding it corrections mid-run would have contradicted its own inputs.

`IMPLEMENTATION_PLAN.md` puts the next run **after Phase 2**, once derived
trust numbers exist, and a second one after Phase 6. Don't start one before
then — the same problem recurs.

The cheap version of the design-critic loop is worth using in the meantime and
is already `DESIGN.md` §4: build → screenshot → critique against `DESIGN.md` →
fix. It caught every defect this session, none of which were visible in code.

---

## Outstanding — founder actions

Nothing here is Claude's to do.

- **Production config, still not done** (carried from the PWA session):
  Vercel **Production** env vars — `APP_URL`, `NEXT_PUBLIC_SITE_URL`,
  `EMAIL_FROM`, and the three VAPID vars — then redeploy. Supabase Auth URL
  Configuration. The production `push_subscriptions` table. PayChangu webhook
  repointed at production.
- **Flip the repo back to private.** It was opened for the Claude Design run;
  the founder's call is to close it once design work is done.
- **Buy `ganyuhub.com`** — gates working notification email.
- **Clean up throwaway rows** — jobs `849eb4c9…`, `99e8569b…`, `d2a9aea7…`,
  `0ba49618…`, and the three deadline extensions on `changu`. These now have
  conversations attached, so deleting jobs should cascade or the threads go
  stale.

## Known-stale data — don't be confused by it

- **Four jobs at status `open` carrying an accepted proposal** (`testign2`,
  `email testing`, `poster`, `logo`). Legacy seed data; anything assuming
  "accepted ⇒ in progress" is wrong about them.
- A client who releases early and goes quiet leaves the job open until the
  creative closes it — stale `in_progress` rows can accumulate.

## Closed — do not re-open

- **Reviews exist.** `DESIGN_GAP_AUDIT.md` §C, §F and §G2 claim we have none;
  they were written from screenshots without reading the schema. `reviews`
  shipped 2026-07-03 (`supabase/schema.sql:211`) with role-neutral
  `reviewer_id`/`reviewee_id`, so §G3's bidirectional requirement is already
  satisfied structurally, and star averages already render on `/creatives/[id]`
  and `/browse`. **Phase 4 is "extend and surface", not "build reviews".**
- **Rotate the exposed PayChangu keys** — closed 2026-08-07, no action needed.
  Those are `sec-test-` sandbox keys and cannot move real money. Do not
  re-raise.
- **BUG-018, BUG-012, BUG-017, BUG-016** — all verified closed 2026-08-07.
- **Job conversation backfill** — run, 42 threads, 0 missing. Idempotent, but
  no reason to run again.
- **Who closes a job** — releasing payment does NOT imply the work is done (a
  client may pay a friend early), so completion is never inferred from payment.
  Closing is the creative's action, gated on `payment_released`.

## Where things live

- `IMPLEMENTATION_PLAN.md` — the build order. Start here.
- `DESIGN_GAP_AUDIT.md` — 79 findings, §A–§Q. §Q is the landing pages, §Q8 is
  mobile and corrects several desktop conclusions.
- `DESIGN.md` — the rules. §4 screenshots, §7 radii, §10 imagery.
- `BACKLOG.md` — known issues and waiting-on-assets.
- `CHANGELOG.md` / `TEST_LOG.md` / `BUG_LOG.md` / `GanyuHub_DevRoadmap.md` —
  updated on every push. The roadmap carries the L1–L11 status table.
