# Next session

Paste this whole file into a new session as the opening message.

---

## Setup before we start

Two browser surfaces, separate cookie jars — this is what makes step-by-step
testing possible, so get both up before anything else:

- **Chrome** — signed in as **EQ Admin Client** (the client, and the admin).
  Keep Vercel and Supabase open here too. Note: Claude can only drive tabs in
  the tab group it creates, so it cannot see your Vercel or Supabase tabs — it
  will ask you to read those.
- **In-app Browser pane** — signed in as **Adam Creative**. It must be
  *visible on screen*, not collapsed; when hidden it stops compositing frames
  and every click lands at (0,0) and silently does nothing.

Preview URL: `https://ganyu-hub-git-sandbox-test-vkasamales-projects.vercel.app`

Confirm before any money moves: Vercel → Settings → Environment Variables →
**Preview** → `PAYCHANGU_SECRET_KEY` starts with `sec-test-`. The PayChangu
dashboard toggle and this env var are different switches; this one is what the
deploy actually sends. See `PAYCHANGU_TESTING.md` for test numbers (leading
zero required) and the known gotchas.

**Branch note:** the work is on `sandbox-test` (currently `b0f458a`). `main` is
production and deploys with live keys — never commit test work there. Local
`sandbox-test` is stale; push with `git push origin HEAD:sandbox-test` from a
branch based on `origin/sandbox-test`.

---

## 1. Verify BUG-018 — the duplicate release event

**The one blocking item, and it needs a funded job.**

Every escrow release wrote `payment_released` **twice**, 620ms apart:
`reconcilePayout` (which the job page calls at render time whenever a payout is
pending) races the PayChangu webhook. Both run read-guard → `verifyPayout` →
update → log, and `verifyPayout` is a network call sitting between the guard and
the write, so both pass the guard before either writes.

Fixed by making the UPDATE its own lock — each writer filters on the pre-state
and logs only if a row came back. **Unverified.** It rests on PostgREST
returning an empty array for a filtered update that matches nothing. Standard
behaviour, but `mockSupabase` cannot demonstrate it, so only a real release
counts.

Run a fresh throwaway end to end — post as EQ, propose as Adam, accept, fund,
release — then:

```sql
select event_type, metadata->>'via' as via, created_at from job_events
where job_id = '<new job id>' and event_type = 'payment_released';
```

**One row = fixed. Two rows = the assumption was wrong and the fix needs
rethinking** (next option is a unique partial index on
`(job_id, event_type) where event_type = 'payment_released'`, which makes the
database refuse the second write regardless of who is racing).

## 2. BUG-012 — the dispute release path

**Highest-severity open item. Still never verified.** Fold it into the same run
as item 1 and it costs almost nothing extra.

Releasing from `payment_disputed` used to fall through to a patch that only set
`escrow_status`: the job was marked released, the creative was emailed "Payment
released", and no money moved. The branch now accepts `payment_held` **or**
`payment_disputed`. `updateEscrowStatus` has no unit coverage at all, so a live
run is the only evidence available.

Sequence: fund a fresh job → flag a dispute → resolve it as a release → confirm
PayChangu actually initiated a payout (`payout_ref` written, `payout_status` not
`failed`) and that a `payment_released` event landed — **exactly one**, which
also re-tests item 1 on the disputed path.

Watch for: the T+1 guard sits inside the same branch, so it applies to the
disputed path too — fine in sandbox, where `isTestMode()` skips it.

Doing it this way also surfaces the last two money-state badges: **amber
`payment_pending`** and **red `payment_disputed`**, the only two of five not yet
seen on screen.

## 3. Look at what shipped unverified

All deployed to `sandbox-test`, none of it looked at in a browser:

- **Chevron collapsibles** — replaced the "See more" text link. Points down
  collapsed, flips up open. Check the brief, Activity and Send delivery.
- **Sandbox settlement copy** — escrow panel and accept picker no longer promise
  "the next business day" when test keys are in use.
- **Share links** — preview deploys should now emit preview URLs instead of
  production ones. ⚠️ **Inert until you enable "Automatically expose System
  Environment Variables" in Vercel.** Without it `NEXT_PUBLIC_VERCEL_ENV` is
  undefined and it falls through to `APP_URL` exactly as before. Do that first,
  then check a share link from a sandbox job.

## 4. Job page — the badge artwork you're supplying

The money-state stamp works and reads clearly (grey not-funded → sky held →
emerald released, all confirmed live). You said you'd supply designed badge
artwork for **"Released to creative"**. Blocked on that asset.

Worth deciding when it arrives: the other four states are plain coloured chips,
and one illustrated state among four plain ones may look accidental. Look at the
set together before committing.

Noted and not urgent: the header stamp says "Released to creative" while the
Payment card directly beneath says "Payment released" — two labels for one fact,
a few inches apart. Probably drop the card's badge.

## 5. Deposits — design settled, two decisions open

Creatives who need materials money upfront. Settled: it's an *early partial
release*, not a second collection, because the client already funds the full
amount at acceptance. The cap is set as a percentage at proposal stage, as a
structured field rather than chat.

Still open:
- Who absorbs the doubled payout fee (`1.5% + MWK 700` charged twice)?
- Cancellation maths once deposit money is already out.

The badge is ready for it: `MONEY_STATE` in `components/job-header.tsx` is a
keyed map, so "x deposited" is one added key.

---

## Closed on 2026-08-07 — do not re-test

- **BUG-017** — `payment_released` now written with a real timestamp, verified
  live on job `d2a9aea7…`. The `/clients/[id]` release-speed figure has data.
- **BUG-016** — short brief rejected; Title, Category, Brief, Deliverables,
  Deadline and Budget all survive the error. Verified live.
- **`JobEventType` / SQL constraint drift** — the root cause of BUG-017. Now one
  runtime `JOB_EVENT_TYPES` array with the type derived from it, plus
  `tests/lib/job-event-types.test.ts`, which parses the CHECK constraint out of
  `schema.sql` and fails if the two lists diverge.
- **Job page redesign** — money-state stamp, Payment card moved under the
  header, collapsible brief/activity/delivery, dispute demoted to a button in a
  single action row. Confirmed live on both sides.
- **Min-length counters** — reviewed and deliberately left alone. Going over the
  minimum is fine and reads fine. Not a bug.
- **Header showing MWK 0 on an unfunded job** — not a bug. Accept *is* pay, so a
  job nobody has funded correctly shows zero.

## Also outstanding

- **Rotate the PayChangu test webhook secret and test public key** — exposed in
  a screenshot.
- **Clean up throwaway test rows** — jobs `99e8569b…`, `d2a9aea7…`, the earlier
  `0ba49618…`, and the three deadline extensions on `changu`.
- **Buy `ganyuhub.com`** (mine to do).

## Ground rules that held all session

- I perform all logins and click anything that moves money. Claude never enters
  card numbers, including sandbox test cards; sandbox phone numbers are fine.
- Supabase access is read-only (`select` only) without asking first.
- Production (`ganyu-hub.vercel.app`) carries live keys and real money — never
  test there.
- Update CHANGELOG, TEST_LOG, BUG_LOG and the roadmap on every push.
