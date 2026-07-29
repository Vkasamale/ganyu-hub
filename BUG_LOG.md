# Bug Log

Live-issue tracker: problem, cause, fix. Newest first. Open bugs at the top; fixed bugs move to the "Fixed" section so the history stays. This log is back-populated from CHANGELOG.md for pre-log history; new bugs are logged the moment they're reported.

Format per entry:

```
- **[BUG-N] Short title** — reported <date> by <who>, on <route/feature>
  - Repro: exact steps
  - Expected / Actual
  - Cause: root cause once known
  - Fix: commit hash + one-line summary of the change
  - Status: open / investigating / fixed
```

---

## Open

_(none currently open — see In Progress below)_

## In Progress

- **[BUG-001] Creative onboarding "Finish & go to dashboard" does not save uploaded data.** — reported 2026-07-24 by beta creative, on `/onboarding/creative`.
  - **Repro:** creative fills headline, bio, categories, skills, portfolio piece with cover image, service; presses "Finish & go to dashboard". Redirects to `/dashboard`. Data is not visible on their profile or services page.
  - **Expected:** all three writes land (profiles update, portfolio_items insert, services insert) and are visible after redirect.
  - **Actual:** redirect fires but data doesn't show up. Contradictory on its face — if any insert had errored, the action would return early with a toast, no redirect. So either the mutations returned success but affected 0 rows (silent RLS or missing base row), or the storage upload errored and blocked the rest.
  - **Suspected cause:** most likely — `profiles.update().eq('id', user.id)` affected 0 rows because the profile row was never created for this auth user (signup path may have skipped the trigger). Supabase JS returns success on 0-row updates, so the action redirected as if it worked. Secondary suspect: storage bucket `portfolio` RLS rejecting the upload with a hard error that killed the whole action before any DB write.
  - **Mitigations shipped 2026-07-24 (commit pending):**
    - Swapped `profiles.update` → `profiles.upsert(..., { onConflict: 'id' })` so the row is created if missing.
    - Chained `.select('id')` on all three mutations; return an explicit error to the user + `console.error` to Vercel logs if any affected 0 rows.
    - Made cover-image upload non-fatal: if the storage upload errors, log it and continue with `cover_url = null`. The creative can re-add the image later; they don't lose the whole submission over a storage RLS hiccup.
    - Added `console.log("[onboarding] creative onboarded", user_id, "cover=", …)` on success for trace visibility in Vercel.
  - **Next step:** ask the reporting creative to try again. If it still fails, Vercel logs will now name the exact failing step. If it succeeds, backfill their earlier row manually from Supabase Studio.
  - **Status:** in progress — awaiting re-test in prod.

---

## Fixed

Back-populated from CHANGELOG.md history. Only entries with a clear bug-to-fix arc are included; feature ships are not bugs.

- **[FIX-2026-07-22a] /browse rate sort was ordering by a dead column.**
  - Cause: `Sort by "Lowest rate" / "Highest rate"` on `/browse` used `profiles.hourly_rate_mwk`, a column the codebase itself already marked dead. Real prices live in `services`.
  - Fix (`2583ae5`): dropped the DB `.order("hourly_rate_mwk")` branch; rate sort now runs in memory against the `fromPrice` map derived from `services.price_mwk`. Profiles with no priced service sink to the bottom either direction.

- **[FIX-2026-07-22b] Double-fee at checkout.**
  - Cause: `app/actions.ts` sent `clientCharge(bid, rail)` (bid + our processor-fee estimate) as the `amount` field to PayChangu. PayChangu treats `amount` as the base and adds its own fee on top for the customer — so the customer paid the fee twice (10,000 bid via bank → shown 10,200 → actually charged ~10,404).
  - Fix (`a818df7`): send the raw bid; the processor adds its fee once. `clientCharge` retained for UI display. Applied to both `acceptProposal` and top-up payment paths.

- **[FIX-2026-07-13a] Payouts stayed "pending" after PayChangu confirmed success.**
  - Cause: `verifyPayout` returned PayChangu's decimals verbatim for `amount`/`fee`. `reconcilePayout` wrote them into the `int` columns `payout_amount_mwk`/`payout_fee_mwk`, which Postgres silently rejected. UI toast said "Payout confirmed" but `payout_status` never advanced.
  - Fix: rounded both to integers on the way in, matching the earlier `verifyPayment` fix.

- **[FIX-2026-07-13b] Job page returned 500 from `revalidatePath` called during render.**
  - Cause: Next.js forbids `revalidatePath` in a component render path.
  - Fix: moved the revalidation into the mutating server action; render path only reads.

- **[FIX-2026-07-12a] PostgREST embed error `PGRST201` after a new FK landed.**
  - Cause: `jobs.pending_accept_proposal_id` created a second `jobs↔proposals` relationship. Unqualified PostgREST embeds became ambiguous, silently returning zero rows across dashboards.
  - Fix: pinned the affected embeds to `!proposals_job_id_fkey` in `app/dashboard/jobs/page.tsx` and `app/dashboard/proposals/page.tsx`. Earlier same-day one-off fix (`bada1cb`) handled the actions layer; this catches the read-side pages.

- **[FIX-2026-07-12b] 3-attempts-per-creative proposal cap was inert.**
  - Cause: `proposals.status` is a Postgres enum with values `pending | accepted | declined | withdrawn`. `submitProposal` and the job page filtered `.eq("status", "rejected")` — a value that doesn't exist — so `rejectedCount` was always 0 and the entire cap feature never engaged.
  - Fix (`478e575`): switched both call sites to the real enum value `declined`. Grew regression coverage via the mock-Supabase enum-validation hardening in the same window.

- **[FIX-2026-07-13c] Duplicated "Refresh payout status" button on escrow panel.**
  - Cause: JSX block copy-pasted twice.
  - Fix: removed the duplicate in `components/escrow-panel.tsx`.

- **[FIX-2026-07-11a] Double-payout on Release.**
  - Cause: the Release action could enqueue a payout twice under a fast repeat click / concurrent worker.
  - Fix: added a guard so a payout is enqueued only when the current `payout_status` allows it.
