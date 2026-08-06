# Next session — handoff

Written 2026-08-07 at the end of the payments/bugs session. Paste the prompt
below to start. Everything under it is the context behind it.

---

## The prompt (paste this)

> Two pieces of work, plus a decision I want to make with you first.
>
> **1. Deadline history.** `jobs.deadline` is overwritten in place, so once a
> deadline moves there's no record of what it originally was. Add the storage
> and surface it the same way budget and revisions now work on `/jobs/[id]` —
> current value as the headline, original shown struck through beside it. Decide
> with me whether that's a new `original_deadline` column on `jobs` or derived
> from the existing `deadline_extensions` table, and say which you'd pick and
> why before writing anything. It touches `supabase/schema.sql`, so remember
> that's applied manually.
>
> **2. Client profiles — discussion first, then build.** Right now
> `/creatives/[id]` renders *any* profile, so a client's page shows empty
> portfolio and services sections and an "Invite to job" button that makes no
> sense for them. Before fixing that, I want to settle the underlying question:
> **what actually distinguishes a client from a creative on Ganyu Hub, in
> functionality and in appearance?** Ask me questions, put options in front of
> me, and don't start building until we've agreed the model. Then implement it.
>
> Read `NEXT_SESSION.md` for full context and the smaller pending items.

---

## Where things stand

Bug log is **empty** — BUG-007, BUG-008 and BUG-009 are all fixed and verified.
Suite is **58 passing**. `main` is clean and deployed.

Recent work worth knowing about:

- **Fee model settled.** 3% on money in (all rails), 2% on payouts, plus a flat
  MWK 700 on bank transfers. The flat fee is deliberate and there's a regression
  test (`tests/fees.test.ts`) that fails if anyone "simplifies" it away — a
  percentage can never cover a flat cost on small payouts.
- **BUG-009** (top-up payments silently orphaned) was found by completing a real
  sandbox payment. The lesson is in `TEST_LOG.md`: money paths need a *completed*
  payment, not just a reachable checkout.
- **Formatters are pinned** to `en-GB` / `Africa/Blantyre` in `lib/utils.ts`.
  Unpinned locale/timezone was causing hydration mismatches that killed every
  button on data-backed routes (BUG-008). Don't reintroduce a bare
  `toLocaleDateString()`.

## Item 1 — deadline history, in detail

**Problem.** `jobs.deadline` (a `date`) is mutated when an extension is accepted.
`deadline_extensions` records `proposed_deadline` per request but never the
original, so the first value is lost the moment it changes.

**What "done" looks like** — match what budget and revisions already do on
`/jobs/[id]`:

- Budget: current total with `~~MWK 10,000~~ originally` beside it, driven by
  `accepted_bid_mwk` (immutable) vs `total_paid_mwk` (cumulative).
- Revisions: `1 of 1 included` plus a `+1 extra purchased` pill — deliberately
  never rendering `2 of 1`.

**Two approaches, both viable:**

| | Pros | Cons |
|---|---|---|
| New `jobs.original_deadline` column | Trivial to read; one query | Schema change, manual `schema.sql` re-run, needs backfill for existing rows |
| Derive from `deadline_extensions` | No schema change | Extra query; only works if an extension row exists; "original" is implicit |

Lean toward the column — it's honest storage rather than inference — but confirm
with the founder first. Backfill would be
`update jobs set original_deadline = deadline where original_deadline is null`.

## Item 2 — client vs creative, the real question

**Don't jump to code.** The founder explicitly wants the distinction agreed
first: *"that fine line needs to be set."*

**Current state:** `profiles.role` is `client | creative | agency` (nullable —
OAuth users pick later). `/creatives/[id]` loads any profile by id and
`notFound()`s only when missing. So a client already has a URL that renders,
badly.

**Questions worth putting to the founder:**

- Should a client page be public at all, or only visible to creatives they've
  worked with? Reputation cuts both ways — clients who pay promptly are worth
  surfacing; a public page for someone who just posted one job may be noise.
- What does a creative need to know before bidding? Jobs posted, hire rate,
  average time to release escrow, reviews *from creatives*?
- Reviews are currently creative-facing only. Do clients get reviewed too? That
  is a real product decision, not a layout one.
- Shared vs separate route: `/clients/[id]`, or one `/u/[id]` that branches on
  role? Note existing share links point at `/creatives/[id]` — changing the
  route affects `lib/site-url.ts` consumers and anything already shared.
- Agency is a third role, currently frozen (see `BACKLOG.md`). Decide whether
  this work should anticipate it or ignore it for now.

**Minimum fix if the discussion stalls:** hide the creative-only sections
(portfolio, services, "Invite to job", "Services from …") when the profile has
no services and `role !== 'creative'`. Stops the broken-looking page without
prejudging the model.

## Smaller pending items

- **Hide `EXTRA_REVISION|` top-ups from the "Payment top-ups" panel** on
  `/jobs/[id]`. That panel was built for creative-requested top-ups and renders
  any pending row with an "Accept & pay" button — so a charge the *client*
  initiated reappears as one for them to accept. Only visible while a payment is
  mid-flight now that BUG-009 is fixed, but still wrong.
- **`ganyuhub.com` is still unbought.** It blocks two things: real notification
  email (Resend is sandboxed and only delivers to the founder, so beta creatives
  get nothing) and the Supabase project ref showing on the Google consent screen.
  Highest real-world impact of anything outstanding.
- **Check Vercel `APP_URL`** is the production URL, not localhost. A localhost
  value there broke Google login on 2026-08-05 and still feeds share/email links.
- **Wallet with batched withdrawals** — see `BACKLOG.md` → Payments. The only
  route to a genuinely flat payout percentage. Needs volume first.
- **Tour refinements** — per-nav-item targets, a replay link. See `BACKLOG.md`.

## Founder to-dos carried over (not code)

- [ ] **Re-enable Vercel Authentication** (Settings → Deployment Protection).
      Turned off to let PayChangu reach the preview; the preview talks to the
      **production** database, so leaving it public is untidy.
- [ ] **Delete the sandbox test job** `b926bfca-9f5b-4aa8-a43b-e1d1aa845aae`
      (and its proposals/top-ups) — it sits in production with hand-stamped
      escrow state and will skew dashboard totals.
- [ ] **Rotate the PayChangu test webhook secret and test public key** — both
      were visible in a screenshot. Test credentials only; the live secret key
      was masked.
- [ ] **Delete the `test/paychangu-sandbox` branch** when sandbox testing is done.

## Testing notes that will save time

- Preview URLs: use the **branch** URL
  (`ganyu-hub-git-<branch>-<scope>.vercel.app`), never the per-deployment
  `ganyu-<hash>` one — the latter is an immutable snapshot and will serve stale
  code after a fix.
- Preview shares the **production** Supabase project. There is no staging DB.
  Use throwaway rows and clean up.
- PayChangu test keys are scoped to Vercel **Preview + Development**; live keys
  are Production-only. There is no sandbox *host* — `lib/payments.ts` always
  calls `api.paychangu.com`, and the key alone decides test vs live.
- Cloudflare Turnstile is domain-locked, so previews use Cloudflare's always-pass
  test keys (`1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`),
  also scoped to Preview + Development.

## Standing rules

- Update `CHANGELOG.md`, `TEST_LOG.md` and `GanyuHub_DevRoadmap.md` on every push.
- Version stays in `0.x` until public launch; human-facing versions are
  four-part (e.g. `0.8.1.2`), `package.json` stays valid 3-part semver.
- `supabase/schema.sql` is applied **manually** — call out any change loudly.
- Live repo is `C:\Users\vinny\GANYU HUB`, not the OneDrive path.
