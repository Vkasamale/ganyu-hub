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

---

## 1. Verify BUG-017 is actually fixed

The `alter table` adding `'payment_released'` to `job_events_event_type_check`
was run on the live DB on 2026-08-07, but **no release has been logged
successfully yet**. Until one is, the fix is unproven.

Run a fresh throwaway job end to end — post as EQ, propose as Adam, accept,
fund, release — then:

```sql
select event_type, created_at from job_events
where job_id = '<new job id>' order by created_at;
```

A `payment_released` row must be present. If it is, item 2 below becomes
possible for the first time.

Context: that event's `created_at` is the only record of *when* a creative was
paid — `escrow_status` records only that release happened. Every release before
the fix lost its timestamp permanently.

## 2. Step-by-step dispute test — BUG-012

**Claude drives both sides; I click anything that moves money.**

BUG-012 was fixed but never verified: releasing from `payment_disputed` used to
fall through to a patch that only set `escrow_status`, so the job was marked
released, the creative was emailed "Payment released", and no money moved. The
branch now accepts `payment_held` **or** `payment_disputed`. `updateEscrowStatus`
has no unit coverage at all, so a live run is the only evidence available.

Sequence: fund a fresh job → flag a dispute → resolve it as a release → confirm
PayChangu actually initiated a payout (`payout_ref` written, `payout_status` not
`failed`) and that a `payment_released` event landed.

Watch for: the T+1 guard sits inside the same branch, so it now applies to the
disputed path too — fine in sandbox, where `isTestMode()` skips it.

## 3. Job page redesign — money state and scrolling

The page doesn't show what state the money is in, and buries it below the fold.
My feedback in full:

- **A stamp/badge in the title card showing money state.** "Released to
  creative" as grey text is invisible — I released the funds and didn't notice
  anything had changed. This is someone's money; held vs released vs deposited
  are three distinct financial states and must be visually distinct (colour, a
  stamp-like badge), not three phrasings of the same grey line.
- **Move the Payment card near the top.** It's the most important thing on the
  page and it's currently a long scroll down.
- **Make the big cards collapsible.** I'm very anti-scrolling.
  - Project brief: one or two lines with a "see more".
  - Activity: collapse to a single line showing the current stage, expandable
    to the full history.
  - Send delivery: smaller card, expandable.
- **"Something gone wrong?" shouldn't be a whole card** — make it a button like
  "Propose deadline extension" and "Cancel job", expanding into a card when a
  dispute actually needs explaining.
- **Design it to accommodate deposits**, since partial payments are coming and
  will need their own visual state ("x deposited", "released to creative").

## 4. Deposits — design settled, two decisions open

Creatives who need materials money upfront. Settled: it's an *early partial
release*, not a second collection, because the client already funds the full
amount at acceptance. The cap is set as a percentage at proposal stage, as a
structured field rather than chat.

Still open:
- Who absorbs the doubled payout fee (`1.5% + MWK 700` charged twice)?
- Cancellation maths once deposit money is already out.

---

## Also outstanding

- **BUG-016 unverified** — Post a job with a brief under 200 characters and
  confirm Title and Deadline survive the error.
- **Min-length counters read as maximums.** "144/200" on a field needing *at
  least* 200 characters is actively misleading — it caused a valid brief to be
  shortened. Wording fix.
- **"Next business day" copy shows even in sandbox** (`escrow-panel.tsx` hint,
  `accept-proposal-picker.tsx`). Cosmetic, but confusing during tests.
- **Rotate the PayChangu test webhook secret and test public key** — exposed in
  a screenshot.
- **`JobEventType` and the SQL CHECK constraint are two hand-maintained copies
  of one list.** BUG-017 was the second divergence; a third is a matter of time.
- **Clean up throwaway test rows** — job `99e8569b…`, the earlier `0ba49618…`,
  and the three deadline extensions on `changu`.
- **Buy `ganyuhub.com`** (mine to do).

## Ground rules that held all session

- I perform all logins and click anything that moves money. Claude never enters
  card numbers, including sandbox test cards; sandbox phone numbers are fine.
- Supabase access is read-only (`select` only) without asking first.
- Production (`ganyu-hub.vercel.app`) carries live keys and real money — never
  test there.
- Update CHANGELOG, TEST_LOG, BUG_LOG and the roadmap on every push.
