# Bug Log

Live-issue tracker for Ganyu Hub. Every bug from day zero, with problem, root cause, and fix. Format: bugs actively in play at the top; every historical bug in the Fixed section (newest first). This log is back-populated from CHANGELOG.md; new bugs are logged the moment they're reported.

Format per entry:

```
- **[ID] Short title** — reported <date>, area
  - Repro / Symptom
  - Cause
  - Fix: commit or CHANGELOG date
```

---

## In Progress

- **[BUG-020] Supabase Auth 429s under repeated page loads — `over_request_rate_limit`.** — found 2026-08-12, auth. **Partially fixed 2026-08-12; root cause understood, not eliminated.**
  - Symptom: every server action silently behaves as signed-out. `createTestimonialRequest` returned "Not signed in" and wrote nothing, with no failed INSERT in the log because the action bails before the write. Dev server log showed repeated `AuthApiError: Request rate limit reached` (status 429).
  - Cause: `supabase.auth.getUser()` is a NETWORK call to the Supabase Auth API, not a local token check. **Measured: one dashboard page view made three of them** — `components/navbar.tsx`, `app/dashboard/layout.tsx` and `app/dashboard/page.tsx`, all inside a single request. 94 call sites exist in total (56 of them in `app/actions.ts`). There is no middleware, so nothing refreshes the session centrally once per request.
  - Why the failure mode is nasty: a rate-limited `getUser()` is indistinguishable from being logged out. The user is silently signed out mid-action and nothing surfaces why.
  - Fix so far: `lib/supabase/user.ts` exports `getSessionUser()`, wrapped in React `cache()`, which dedupes per request render. The three calls on the dashboard render path collapse to one. **No security change** — the same validated `getUser()` still runs, and the cache never crosses a request boundary. Server actions deliberately keep their own call: an action must re-validate its caller.
  - Still open: the other ~35 page/component call sites have not been migrated, so other routes still make 2+ calls per view. The actual limit, whether it is per-IP or per-project, and whether real production traffic could reach it are all still unmeasured. **Do not swap `getUser()` for `getSession()`** — `getUser()` is the secure server-side choice.

- **[BUG-019] Duplicate creative profiles show the same person twice on the landing page.** — found 2026-08-12, data. **Data issue, not a code bug.**
  - Repro: load `/` while L9 is live. "Liness Manda" and "Chimwemwe Chinkhuntha" each appear twice in the featured row, with identical headline, price and rating.
  - Cause: two distinct `profiles` rows per person — `4f38566f…`/`ad19c600…` and `5f3bf355…`/`116e17c6…`. Seed/test data, duplicated at creation. Both rows are complete, so both legitimately qualify for the featured row.
  - Fix: delete the duplicate rows. **Deliberately not fixed in code** — de-duplicating by name would be wrong (two real people can share a name) and would hide the underlying data problem on every other surface. Founder action; check for attached jobs/threads before deleting.

- **[BUG-018] Every escrow release wrote the `payment_released` event twice.** — found 2026-08-07, payments. **Fixed, unverified in the app.**
  - Repro: fund and release a job, then `select event_type, metadata->>'via', created_at from job_events where event_type = 'payment_released'`. Two rows, ~620ms apart. Seen live on job `d2a9aea7-bbf9-4059-98fe-bc0bda536c58`, the same run that closed BUG-017.
  - Cause: two writers race, each correct alone. `reconcilePayout` (`actions.ts:1845`, tagged `via: "reconcile"`) is called at render time by `app/jobs/[id]/page.tsx:78` whenever `payout_status` is pending; the PayChangu webhook (`api/paychangu/webhook/route.ts:53`, tagged `via: "webhook"`) does the same work on the same trigger. Both follow read-guard → `verifyPayout` → update → log, and `verifyPayout` is a network call sitting *between* the guard and the write. Both read "not released yet" before either writes, so both pass and both log. The 620ms gap is the difference in their PayChangu round-trips.
  - Consequence: the timeline shows "Payment released to creative" twice, and anything counting the event double-counts. `escrow_status` itself is fine — the second update rewrites the same value.
  - Fix: made the UPDATE its own lock. Both writers now filter on the pre-state (`.neq("escrow_status", "payment_released")` in reconcile, `.eq("escrow_status", "payment_held")` in the webhook) and `.select("id")`; the event is logged only if a row actually came back. Whoever wins the compare-and-swap logs; the loser gets zero rows and stays quiet.
  - **VERIFIED FIXED 2026-08-07.** Fresh throwaway job `849eb4c9-26af-4bee-8fef-ad952fdef1ce`, run end to end and released from a disputed state: exactly one `payment_released` row, `via = reconcile`. The webhook's filtered UPDATE matched nothing and it logged nothing — the PostgREST behaviour the fix assumed, which the mock suite could not demonstrate. Confirmed on the disputed path, so it covers BUG-012's route too.

- **[BUG-012] Resolving a dispute in the creative's favour marks them paid but sends no money.** — found 2026-08-07, payments. **Open — highest severity outstanding.**
  - Repro: job in `payment_disputed`; client/admin moves escrow to `payment_released`.
  - Cause: all payout logic lives inside the `escrow_status === "payment_held" && next === "payment_released"` branch at `actions.ts:1424`, which initiates the PayChangu payout and returns. A release *from disputed* is a legal transition (`ESCROW_TRANSITIONS`) but never enters that branch — it falls through to the generic patch at `:1599`, which only sets `escrow_status`. The creative is then notified and emailed "Payment released" (`:1616-1634`). No `payout_ref` is written, so the idempotency guards at `:1437-1442` never trip and nothing downstream flags it.
  - Also note the 24h T+1 guard at `:1428` is gated on `payment_held` specifically, so this path skips it too.
  - Fix: the branch condition now accepts `payment_held` **or** `payment_disputed` as the source state, so a dispute resolved in the creative's favour runs the same payout path — including the T+1 guard and the idempotency claim. One-line condition change; every line inside the branch was already correct.
  - **VERIFIED FIXED 2026-08-07** on job `849eb4c9-26af-4bee-8fef-ad952fdef1ce`: funded, delivered, disputed, then released from `payment_disputed`. Money moved — `payout_ref = gh_po_849eb4c9…`, `payout_error` null, `escrow_status = payment_released`, and one `payment_released` event. `updateEscrowStatus` still has no unit coverage; this live run is the only evidence.

- **[BUG-013] Payout failures logged as `[object Object]`, hiding the cause on a money path.** — found 2026-08-07, payments/observability. **Fixed, pending verification.**
  - Repro: release payment on a held job where PayChangu rejects the payout. Admin log shows `[object Object]` (ERR-00012, ERR-00013); client sees only `GENERIC_MONEY_ERROR`.
  - Cause: PayChangu returns `message` as a string for most errors but as an object for validation failures. `new Error(obj)` coerces to `"[object Object]"`, destroying the reason at the throw site — and both `jobs.payout_error` (`actions.ts:1547`) and `logAdminError` (`admin-errors.ts:32`) derive from `e.message`, so neither could recover it.
  - Fix: `apiMessage()` in `lib/payments.ts`, applied at both throw sites (mobile `:201`, bank `:228`). CHANGELOG 2026-08-07. Covered by `tests/lib/payout-error-message.test.ts`.

- **[BUG-014] "Money in escrow" is shown on jobs whose escrow has already been released.** — found 2026-08-07, UI/trust.
  - Repro: any job with `escrow_status = 'payment_released'` — seen on `changu` and `AIRTEL TEST`. Header reads "MONEY IN ESCROW MWK 80,000" directly above a panel saying "Funds released to the creative. Done."
  - Cause: `components/job-header.tsx:29` derives the amount from `total_paid_mwk ?? collection_amount_mwk ?? accepted_bid_mwk` and never reads `escrow_status`; the label is hardcoded. Reachable in production, not just from hand-edited test state — `components/escrow-panel.tsx:32-35` offers "Release payment" whenever status is `payment_held`, with no requirement that the job be delivered.
  - Fix: label now derived from `escrow_status` via a map in `job-header.tsx` — none → "Job value", payment_pending → "Payment pending", payment_held → "Money in escrow", payment_released → "Released to creative", payment_disputed → "In dispute". The "Creative receives (est.…)" line also switches to past tense once released. No prop change: `escrow_status` was already on `JobStageInput`. **Fixed 2026-08-07.** Wording is still the founder's to overrule.

- **[BUG-015] Deadline dates render in two different formats on the same page.** — found 2026-08-07, UI polish.
  - Repro: `/jobs/[id]` on a job with an approved extension. The Deadline field shows "1st of September 2026"; the Activity entries and the extension panel show `2026-09-01`.
  - Cause: the extension panel and `logJobEvent` bodies interpolate the raw ISO date (`actions.ts:2171`) instead of passing it through the same formatter the deadline field uses.
  - Fix: `formatDeadline` applied at all three raw-ISO sites — the event body (`actions.ts:2171`), the "proposed a new deadline" notification (`:2130`), and both dates in `deadline-extension-panel.tsx`. Covered by a new case in `tests/actions/deadline-extension.test.ts`. **Fixed 2026-08-07.**
  - Known residue: event bodies are stored strings, so the rows written before this keep their ISO form. Not backfilled — they're test rows. If it ever matters for real history, render from `metadata.new_deadline` instead of the stored body.

- **[BUG-017] The `payment_released` event is silently dropped — no record of when a creative was paid.** — found 2026-08-07 by a real sandbox release, payments/observability. **FIXED AND VERIFIED 2026-08-07.**
  - Repro: complete a real release. `escrow_status` becomes `payment_released` and the money moves, but `select * from job_events where job_id = …` shows no release row. Confirmed on job `99e8569b…`: only `escrow_funded`, `proposal_accepted`, `work_started`.
  - Cause: `job_events_event_type_check` in `supabase/schema.sql` never listed `'payment_released'`, though `JobEventType` (`lib/job-events.ts:25`) emits it. Every insert violates the constraint. `logJobEvent` catches and console-logs instead of throwing — deliberately, so a logging failure can't block a payout — so the drop is invisible in production.
  - Impact: per the comment at `lib/job-events.ts:21-24`, this event's `created_at` is the **only** record of when a creative actually got paid. `escrow_status` records that release happened, never when. Forward-only, so every release before this fix has permanently lost its timestamp. Also blocks the escrow-release-speed figure on `/clients/[id]` — item 2 of this session's handoff, which was waiting on "real `payment_released` events" that could never have existed.
  - Why tests missed it: `mockSupabase` doesn't enforce CHECK constraints, and both writers (`webhook/route.ts:63`, `actions.ts:1854`) were only ever exercised against the mock. Only a real end-to-end release could surface it.
  - Fix: `'payment_released'` added to the constraint in `schema.sql`. **`create table if not exists` will not alter an existing table — the live DB needed the explicit `alter table … drop constraint / add constraint` run by hand**, done 2026-08-07.
  - **Verified 2026-08-07** on a fresh end-to-end run (job `d2a9aea7-bbf9-4059-98fe-bc0bda536c58`, MWK 2,000): posted as EQ, proposed as Adam, accepted, funded, released. `payment_released` present with a real `created_at` of `18:11:34+00`. The release-speed figure on `/clients/[id]` now has data to read. The same query exposed BUG-018 (the event written twice) — see In Progress.
  - Follow-up shipped the same day: `JobEventType` is now derived from a runtime `JOB_EVENT_TYPES` array, and `tests/lib/job-event-types.test.ts` parses the CHECK constraint out of `schema.sql` and fails if the two lists diverge. The root cause was two hand-maintained copies of one list; that's now one list plus a guard.
  - Follow-up worth considering: the allow-list and `JobEventType` are two hand-maintained copies of the same list. A third divergence is only a matter of time.

- **[BUG-016] A rejected form submit throws away everything typed into plain inputs.** — found 2026-08-07 while posting a test job, UX/data-loss.
  - Repro: Post a job, fill it in, submit with the brief under 200 chars. The error appears — and Title and Deadline are now empty. Cost three retries to get one job posted.
  - Cause: React blanks uncontrolled fields once a form action settles. `SavingForm` never called `reset()`; the loss is React's own post-action behaviour. Fields survived only where the component held its own state (`MoneyInput`, `CharCountTextarea`), which is why Brief and Budget looked fine and Title and Deadline didn't — it looked arbitrary from the outside.
  - Fix: `SavingForm` snapshots the submitted `FormData` and, on the error branch only, refills fields that came back empty. Fixed in the shared wrapper rather than the job form, so every form in the app is covered. Only blank fields are written, so state-holding components are never stomped; files, passwords and hidden inputs are skipped. **Fixed 2026-08-07.**
  - Not covered by a test — would need jsdom, which isn't installed, and adding a dependency for one assertion isn't worth it. Verify by hand: submit Post a job with a short brief and confirm Title and Deadline survive.
  - Related, unfixed: the min-length counters read as maximums. "144/200" on a field that needs *at least* 200 chars misled me into shortening a valid brief. Wording fix still open.

- **[BUG-009] — RESOLVED 2026-08-07. Verified in prod. Moved to Fixed (see below).**

- **[BUG-009] Every top-up payment was silently orphaned — `payment_ref` never written, so paid money could never be matched back.** — found 2026-08-07 during the PayChangu sandbox test of BUG-007's webhook leg.
  - **Repro:** client pays a top-up (extra revision, or a creative-requested top-up) → PayChangu checkout completes successfully → but `payment_topups.status` stays `pending`, `payment_ref` is `NULL`, `jobs.revisions_used` never advances, and `total_paid_mwk` never increases. No error anywhere. Confirmed live on the sandbox: a completed MWK 5,000 extra-revision payment left `status=pending, payment_ref=null, revisions_used=1 of 1`.
  - **Cause:** the `topups update parties` policy (`supabase/schema.sql:792`, added by the 2026-08-05 security audit) has `with check (auth.uid() in (select client_id …) and status = 'declined')`. That `WITH CHECK` is evaluated against the **resulting row**, so *any* user-context update that leaves `status = 'pending'` is rejected — including the `payment_ref` write. Both `requestRevision` case C (`actions.ts:2301`) and `payTopUp` (`actions.ts:2723`) wrote `payment_ref` through the **user's** client and **discarded the result**, so RLS silently updated 0 rows. `payment_ref` is the only key the settlement paths use to find the row (`callback/route.ts:26` and the webhook both do `.eq("payment_ref", txRef)`), so with it `NULL` neither could ever settle the payment.
  - **A regression, not an original defect.** Before the 2026-08-05 audit the policy had no `WITH CHECK` and these writes succeeded. Tightening the policy silently broke the money path — the audit fixed a real hole (either party could self-mark `paid`) but nothing caught the collateral damage, because the update's error was never checked.
  - **Fix (2026-08-07):** both writes now go through a **service-role** client (same pattern as BUG-007's insert), and both `.select("id")` to prove a row was actually affected. If the write fails or affects 0 rows, the action **returns an error instead of redirecting to checkout** — refusing to take money we can't reconcile is strictly better than taking it and losing it. Failures are logged to `/admin/errors` with the tx ref. **The RLS policy is deliberately unchanged**, so users still cannot set `status='paid'`; only the server can write `payment_ref`.
  - **Regression test:** `tests/actions/topups.test.ts` — "refuses to reach checkout if the payment_ref write affects 0 rows". Suite 57 → 58.
  - ⚠️ **Check production for orphaned top-ups.** Any top-up paid between 2026-08-05 (audit) and this fix would have taken the client's money with nothing recorded:
    ```sql
    select id, job_id, amount_mwk, status, created_at
    from payment_topups where payment_ref is null and status = 'pending';
    ```
    Cross-check each against PayChangu's transaction list. Beta volume is low, so this may well be empty — but it must be checked, not assumed.
  - **VERIFIED FIXED 2026-08-07 (sandbox).** Re-ran the full flow on a preview built from the fix: `payment_topups.status = paid`, `payment_ref = ghtop_ba505992-…`, `jobs.revisions_used = 2`. Both settlement legs work.
  - **Production check: CLEAN.** The orphan query returned exactly one row — job `b926bfca-…`, our own sandbox job. No real customer payment was affected; beta volume meant nobody hit the bug in the two days it was live.
  - ⚠️ **Gotcha that cost a test cycle:** the first re-test ran against a Vercel *per-deployment* URL (`ganyu-<hash>.vercel.app`), which is an immutable snapshot and therefore still contained the bug. Always test previews on the **branch** URL (`ganyu-hub-git-<branch>-<scope>.vercel.app`), which follows the latest build.
  - **Status:** fixed and verified. Move to Fixed at next tidy-up.


- **[BUG-008] — RESOLVED 2026-08-06. Moved to Fixed (see below).**

<!-- Superseded by the Fixed entry dated 2026-08-06. Kept out of In Progress.
- **[BUG-008] Data-backed route content does not hydrate in dev preview — interactive share buttons dead.** — found 2026-08-05 while wiring social share buttons.
  - **Repro / Symptom:** on `/creatives/[id]` and `/jobs/[id]` in the dev preview, the entire route *content* doesn't hydrate — clicking the share row's Copy / native-Share / Instagram-copy buttons does nothing (no "Link copied!" flash). The layout shell hydrates and `/login` hydrates fully, so it's scoped to the data-backed page content, not the whole app. No console error, no Next dev overlay error; deterministic across reloads and a clean server restart.
  - **Cause:** unknown. Confirmed NOT the share components themselves (whole route content is affected, and removing `sonner` from the share row didn't fix it). Appears to be a route-level server/client hydration mismatch on these dynamic pages.
  - **Mitigation shipped (2026-08-05):** the 3 primary share links (WhatsApp/X/Facebook) were made plain `<a>` anchors with server-computed absolute URLs via `lib/site-url.ts`, so they render into the SSR HTML and work with **zero JS** regardless of hydration. Only the copy/native/IG buttons remain dependent on hydration.
  - **Likely root cause found 2026-08-06 (fix shipped, awaiting prod confirmation):** every formatter in `lib/utils.ts` rendered with the **runtime default** locale/timezone. Vercel renders in UTC; every user is in Malawi (UTC+2), so server and browser produced different strings for the same value — the textbook trigger for React discarding hydration across a whole subtree. The route split matches exactly: `/jobs/[id]` uses `formatMwk` + `timeAgo` + `formatDeadline` + `daysUntil`; `/creatives/[id]` uses `formatMwk` + `timeAgo`; **`/login` uses none of them (grep count 0) — and `/login` was the one page that hydrated fine.** Specific offenders: `formatMwk` used `toLocaleString("en-MW")` (not in every ICU build → different fallback grouping on Node vs browser); `timeAgo`'s >30-day fallback called `toLocaleDateString()` with no locale *and* no timezone; `daysUntil` compared against the runtime's local midnight (UTC vs UTC+2 disagree for two hours every evening); `creatives/[id]` formatted "member since" with `toLocaleDateString(undefined, …)`, which resolves to the *browser's* language on the client and Node's default on the server.
  - **Fix (2026-08-06):** pinned `LOCALE = "en-GB"` and `TZ = "Africa/Blantyre"` across all of `lib/utils.ts`; added `formatDate` + `formatMonthYear` helpers so no call site formats dates ad hoc. New `tests/utils-format.test.ts` runs every formatter under four hostile runtime timezones (UTC, Africa/Blantyre, Pacific/Kiritimati, America/Los_Angeles) and asserts identical output, so an unpinned formatter can't be reintroduced. Suite 50 → 57.
  - ⚠️ **Caveat — not yet confirmed as THE cause.** The original report says "no console error, no Next dev overlay error", and React normally logs a hydration mismatch loudly. So this may be a contributing bug rather than the whole story. It is worth fixing regardless: unpinned formatters were showing the wrong day to every user in the two hours before midnight.
  - **Next step:** re-check on the deployed **prod build** — click Copy on a live profile; if it flashes "Link copied!", prod hydration is fine and this is dev-only. If still dead in prod, investigate the route-hydration mismatch on `/creatives/[id]` + `/jobs/[id]` as its own task (suspect a server/client boundary or async-render issue in the page tree). See TEST_LOG 2026-08-05.
-->


- **[BUG-007] — RESOLVED 2026-08-06. Moved to Fixed (see below).**

<!-- Superseded by the Fixed entry dated 2026-08-06. Kept out of In Progress.
- **[BUG-007] Paid revision overage (session 4) is completely broken — RLS blocks the top-up insert.** — found 2026-08-04 during full E2E walk (Job C).
  - **Repro:** client uses all included revisions, then clicks "Request extra revision" → confirms "Pay MWK X & continue" on a job with `extra_revision_rate` set. No error is visible in the UI (toast fails silently in some paths / user just sees nothing happen); no PayChangu checkout appears; `payment_topups` gets zero new rows; `jobs.revisions_used` never advances past the included count.
  - **Cause:** `requestRevision`'s paid-overage branch (`app/actions.ts`, case C) is invoked by the **client** and inserts into `payment_topups` with `requested_by_creative_id: accepted.creative_id` — but the insert runs through the client's own authenticated Supabase client. The RLS policy `"topups insert creative"` in `supabase/schema.sql` requires `auth.uid() = requested_by_creative_id`. Since `auth.uid()` here is the *client's* id, not the creative's, every insert is rejected by RLS and `tErr` is set; the function returns `{ error: tErr.message }` (a raw Postgres RLS string) and nothing is ever created. This is the same "upsert/insert checked against the wrong policy" shape as BUG-002, just on a different table.
  - **Fix (not yet shipped):** either (a) run this insert with the service-role client (matches the pattern already used by `submitDelivery`'s service-role upload), or (b) add an additional RLS branch on `payment_topups` insert allowing `auth.uid() = (select client_id from jobs where id = job_id)` when the row's `reason` carries the `EXTRA_REVISION|` marker. Route (a) is the smaller diff and keeps the RLS policy's intent ("creative requests, client just pays") intact from an audit standpoint — flag for next session, don't apply mid-audit.
  - **Verified broken live:** `supabase/schema.sql:698-705` policy vs. `app/actions.ts` `requestRevision` case C, confirmed via full E2E walk 2026-08-04 (Job C1: `revisions_used` stuck at 1/1, `payment_topups` empty after both attempts).
  - **Fix shipped (2026-08-04):** `requestRevision` case C now inserts into `payment_topups` via a service-role client (same pattern as `releasePayment`'s profile lookup). RLS policy left unchanged — creative-initiated inserts still constrained by `auth.uid() = requested_by_creative_id`; client-initiated overage top-ups bypass RLS through the server-only key. Requires `SUPABASE_SERVICE_ROLE_KEY` (already required elsewhere).
-->


- **[BUG-006] Auth callback silently redirected to /dashboard on failed code exchange.** — reported 2026-08-04 during security audit.
  - **Repro:** expired/invalid/replayed magic-link `?code=` still redirected to `/dashboard`, where page-level guards then bounced the user with no context.
  - **Cause:** `app/auth/callback/route.ts` discarded the `error` from `exchangeCodeForSession(code)`.
  - **Fix shipped (2026-08-04):** check the error and redirect to `/login?error=Sign-in link expired or invalid...` when exchange fails.

- **[BUG-005] Password-recovery link mints a full session on GET (Supabase footgun) with no post-reset revocation.** — reported 2026-08-04 during security audit.
  - **Repro:** anyone who loads the recovery link (email prefetch, security scanner, browser history, shoulder surfer) is logged in as the target user. The real user later resetting their password only killed their own local cookie — the prefetcher's session survived.
  - **Cause:** `components/reset-password-form.tsx` called `signOut()` (default `local` scope) after password change, so any other session minted from the same recovery code remained valid on Supabase's side.
  - **Fix shipped (2026-08-04):** `signOut({ scope: "global" })` — updating the password now revokes every refresh token, kicking any prefetcher out immediately.

- **[BUG-004] Signout only cleared the local cookie; server-side refresh token stayed valid.** — reported 2026-08-04 by founder ("friend copied a session cookie into another browser and got in").
  - **Repro:** attacker copies `sb-*-auth-token` from victim's browser into their own. Victim clicks "Sign out". Attacker's copied cookie still works — the refresh token was never revoked server-side.
  - **Cause:** `app/auth/signout/route.ts` called `supabase.auth.signOut()` with the default `local` scope. `@supabase/ssr` defaults to `local`, which only wipes the current cookie store.
  - **Fix shipped (2026-08-04):** `signOut({ scope: "global" })` — every refresh token for the user is now revoked on signout, so any copied cookie dies with the click.

- **[BUG-003] Supabase auth cookies missing HttpOnly/Secure/SameSite — session hijack surface.** — reported 2026-08-04 during security review.
  - **Repro:** DevTools → Application → Cookies on a signed-in session shows `sb-*-auth-token*` cookies without HttpOnly. JS on any page (including any XSS payload) could read them and exfiltrate the session.
  - **Cause:** `lib/supabase/server.ts` and `lib/supabase/middleware.ts` passed the `options` from `@supabase/ssr`'s `setAll` callback through verbatim. Supabase's own defaults don't force HttpOnly/Secure — they leave it to the app.
  - **Fix shipped (2026-08-04):** added `hardenCookie()` helper in both files. Every auth-cookie write now forces `httpOnly: true`, `secure: true` in prod (off in dev so localhost still works), `sameSite: "lax"`, `path: "/"`. Existing sessions keep working; cookies re-flag on next token refresh.

- **[BUG-002] Onboarding "Finish & go to dashboard" leaked raw Postgres RLS error + wasn't logged.** — reported 2026-08-04 by beta creative on `/onboarding/creative`.
  - **Repro:** creative fills onboarding, presses Finish. Red banner appears: `new row violates row-level security policy for table "profiles"`. Nothing lands in `/admin/errors`.
  - **Cause:** BUG-001's fix changed `profiles.update` → `profiles.upsert(..., { onConflict: 'id' })`. Postgres checks the INSERT policy on any upsert regardless of which branch (INSERT vs UPDATE) actually executes. Schema only had `profiles update self`, no INSERT policy — so upsert failed for every existing user. Secondary: `completeCreativeOnboarding` returned `pErr.message` verbatim (leaked DB internals) and never called `logAdminError` (so admins had no signal).
  - **Fix shipped (2026-08-04):**
    - Added `profiles insert self` policy scoped to `auth.uid() = id` in `supabase/schema.sql` — makes upsert work whether the row exists or not.
    - Rewrote all six failure branches in `completeCreativeOnboarding` to route through `logAdminError` + `GENERIC_ERROR(ref)` — users now see a case ID, `/admin/errors` gets the raw Postgres error + code.
  - **Migration required:** re-run `supabase/schema.sql` in Supabase Studio to add the new policy. Fix is inert without it.

- **[BUG-001] Creative onboarding "Finish & go to dashboard" does not save uploaded data.** — reported 2026-07-24 by beta creative, on `/onboarding/creative`.
  - **Repro:** creative fills headline, bio, categories, skills, portfolio piece with cover image, service; presses "Finish & go to dashboard". Redirects to `/dashboard`. Data is not visible on their profile or services page.
  - **Cause (suspected):** redirect firing while data is missing means the mutations returned success but affected 0 rows. Most likely the `profiles` row was never created for this auth user, so `profiles.update().eq('id', user.id)` matched nothing (Supabase JS treats 0-row updates as success and never errors). Secondary suspect: storage bucket `portfolio` RLS rejecting the upload with a hard error that killed the whole action before any DB write. **Update 2026-08-04**: the upsert fix from `2ffcefe` was itself blocked by a missing INSERT policy — see BUG-002. That's why the reporter kept hitting a hard error instead of a silent no-save.
  - **Mitigations shipped (`2ffcefe`, 2026-07-24):**
    - `profiles.update` → `profiles.upsert(..., { onConflict: 'id' })` so the row is created if missing.
    - `.select('id')` chained on all three writes (`profiles`, `portfolio_items`, `services`); explicit user error + `console.error` to Vercel logs on any 0-row result.
    - Cover-image upload made non-fatal (logs and continues with `cover_url = null`) so a storage RLS hiccup doesn't wipe the whole submission.
    - Success log `[onboarding] creative onboarded <user_id> cover=<bool>` added for trace visibility.
  - **Next step:** after BUG-002's INSERT policy migration lands, ask the reporting creative to try again. If it still fails, `/admin/errors` (now populated) will name the exact failing step.
  - **Status:** in progress — awaiting re-test in prod post-BUG-002 fix.

## Open

_(none currently open — see In Progress above)_

---

## Fixed

Back-populated from `CHANGELOG.md`. Newest first. Only entries with a clear bug-to-fix arc are included; pure feature ships aren't bugs.

### 2026-08-13

- **[BUG-021] Review notifications all said "You got a 0★ review".** — found 2026-08-13, reviews
  - Symptom: every review notification title read `0★`, a rating the schema does not permit (`check (rating between 1 and 5)`). Found by eye, not by a test — it appeared on the new home feed the moment unread notifications were surfaced there.
  - Cause: `app/actions.ts` built the title from `rating`, the legacy single-star form field. Since `ReviewAxes` began auto-posting from the three axes that field is never submitted, so `Number(undefined)` → `NaN` → rendered as `0`. The stored row was always correct — the insert uses the validated `overall` mean — so only the notification lied.
  - Fix: title now uses `overall`. Commit 2026-08-13.
  - **Not fixed: existing rows.** Notifications already written keep the wrong title. Rewriting them is a data edit and needs the founder — worth doing only if a real user ever saw one.

### 2026-08-07

- **[BUG-011] A creative's review of a client linked the client to `/creatives/…`.** Found 2026-08-07 while building client profiles; fixed `a40cefe`.
  - **Symptom:** creative completes a job and reviews the client. The client's notification links to `/creatives/<their-id>` — a page built for sellers, showing them an empty portfolio, empty services and an "Invite to job" button aimed at themselves.
  - **Cause:** `leaveReview` has always set `reviewee_id` correctly by side (`isClient ? creativeId : job.client_id`), but hardcoded `/creatives/${reviewee_id}` for both the notification link and `revalidatePath`. Two-sided reviews shipped without a two-sided route.
  - **Fix:** route by the reviewer's side — `isClient ? /creatives/… : /clients/…` — using the flag already in scope, no extra query. Notification wording differentiated too. New `/clients/[id]` is the destination.

- **[BUG-010] Clients were asked to accept and pay a charge they had initiated themselves.** Found 2026-08-07 reviewing the pending items; fixed `0a16bfd`.
  - **Symptom:** client requests an extra revision → redirected to PayChangu → returns to the job page and the "Payment top-ups" panel shows their own charge as pending with **Accept & pay** / **Decline**.
  - **Cause:** the panel was built for top-ups the *creative* requests. It rendered any row with `status = 'pending'`. `requested_by_creative_id` can't distinguish them — `requestRevision` stamps it with the accepted creative either way, because RLS keys on it.
  - **Fix:** exclude rows whose `reason` carries the `EXTRA_REVISION|` marker at the point `pendingTopup` is chosen — the same discriminator the callback and webhook already use — rather than patching each button. Paid extra revisions still appear under History, which has no actions. Narrowed further by BUG-009's fix, which stopped these rows lingering after payment.

### 2026-08-06

- **[BUG-008] Data-backed route content never hydrated — every interactive control on `/creatives/[id]` and `/jobs/[id]` was dead.** Reported 2026-08-05; fixed `5ab8a30`; **confirmed working in prod 2026-08-06.**
  - **Symptom:** on the two data-backed routes, the whole route *content* failed to hydrate — the share row's Copy / native-Share / Instagram buttons did nothing. The layout shell hydrated, and `/login` hydrated fully, so it looked scoped to "dynamic pages". Deterministic across reloads. Misleadingly, no console error was noticed at report time, which is why it was originally filed as an unknown-cause hydration mismatch.
  - **Cause:** every formatter in `lib/utils.ts` rendered with the **runtime default** locale/timezone. Vercel renders in UTC; every user is in Malawi (UTC+2). Server and browser therefore produced different text for the same value, React detected the mismatch and discarded hydration for that whole subtree — taking every button in it down, not just the share row. Offenders: `formatMwk` → `toLocaleString("en-MW")` (absent from some ICU builds ⇒ different fallback grouping on Node vs browser); `timeAgo`'s >30-day fallback → bare `toLocaleDateString()` (no locale, no timezone); `daysUntil` → compared against the *runtime's* local midnight; `creatives/[id]` "member since" → `toLocaleDateString(undefined, …)`, which resolves to the browser's language on the client and Node's default on the server.
  - **The tell:** `/jobs/[id]` uses all four helpers, `/creatives/[id]` uses two, and **`/login` uses none (grep count 0)** — which is exactly the working/broken split that was reported.
  - **Fix (`5ab8a30`):** pinned `LOCALE = "en-GB"` + `TZ = "Africa/Blantyre"` throughout `lib/utils.ts`; added `formatDate` and `formatMonthYear` so no call site formats dates ad hoc; `daysUntil` now computes "today" in Malawi. New `tests/utils-format.test.ts` runs every formatter under four hostile runtime timezones (UTC, Africa/Blantyre, Pacific/Kiritimati, America/Los_Angeles) and asserts identical output, so an unpinned formatter fails CI rather than silently breaking a page. Suite 50 → 57.
  - **Verified 2026-08-06, prod:** Copy on a live creative profile flashes "Link copied!". Reporter confirmed "everything seems to work".
  - **Second bug fixed in passing:** the unpinned formatters were also showing the wrong calendar day to every user during the two hours before local midnight.

- **[BUG-007] Paid revision overage was completely broken — RLS blocked the top-up insert.** Reported 2026-08-04 during the full E2E walk (Job C); fixed `e88d527`; **verified in prod 2026-08-06.**
  - **Symptom:** client exhausts included revisions, clicks "Request extra revision" → confirms "Pay MWK X & continue" on a job with `extra_revision_rate` set. Nothing happened — no PayChangu checkout, zero new `payment_topups` rows, `jobs.revisions_used` stuck at the included count.
  - **Cause:** the paid-overage branch (`requestRevision` case C) is invoked by the **client**, but inserted into `payment_topups` with `requested_by_creative_id: accepted.creative_id` through the *client's own* authenticated Supabase client. Policy `"topups insert creative"` requires `auth.uid() = requested_by_creative_id`; `auth.uid()` here is the client, so every insert was rejected. Same "checked against the wrong policy" shape as BUG-002, different table.
  - **Fix (`e88d527`):** the insert now runs through a service-role client — the pattern already used elsewhere in the file for privileged server-only writes. The RLS policy is deliberately **left unchanged**, so creative-initiated inserts stay constrained by `auth.uid() = requested_by_creative_id` and only this client-pays branch bypasses it. Requires `SUPABASE_SERVICE_ROLE_KEY` (already required elsewhere). Every failure path returns a visible error — missing key, duplicate top-up (`23505` → friendly message), and payment-init throw (→ `logAdminError` + `GENERIC_MONEY_ERROR(ref)`); `request-revision-panel.tsx` renders all of them via `toast.error`.
  - **Verification (2026-08-06, prod):** job `a84be0b1…` stamped to `in_progress` / `payment_held` / `revisions_used 1 of 1` / `extra_revision_rate 5000`, then requested an extra revision as the client → **PayChangu checkout loaded**. Since the `payment_topups` insert precedes `initiatePayment`, reaching checkout at all proves the insert succeeded — no payment needed to confirm the fix.
  - **Not covered by this verification:** `jobs.revisions_used` advancing 1 → 2, which only fires from the webhook on a cleared payment. Separate code path, unchanged by this fix, previously working.

### 2026-07-22

- **[FIX-2026-07-22a] `/browse` rate sort was inert (ordering by a dead column).**
  - Symptom: "Lowest rate" and "Highest rate" on `/browse` didn't change the order.
  - Cause: sort used `profiles.hourly_rate_mwk`, a column the codebase itself flagged dead. Real prices live in `services`.
  - Fix (`2583ae5`): dropped the DB `.order("hourly_rate_mwk")` branch; rate sort now runs in memory against the `fromPrice` map derived from `services.price_mwk`. Profiles with no priced service sink to the bottom either direction.

- **[FIX-2026-07-22b] Double-fee at checkout.**
  - Symptom: 10,000 MWK bid via bank rail. Checkout screen said 10,200. Customer was actually charged ~10,404 — fee applied twice.
  - Cause: `app/actions.ts` sent `clientCharge(bid, rail)` (bid + our fee estimate) as `amount` to PayChangu. PayChangu treats `amount` as base and adds its own fee on top for the customer.
  - Fix (`a818df7`): send raw bid; processor adds its fee once. `clientCharge` retained for UI display. Applied to both `acceptProposal` and top-up payment paths.

### 2026-07-17

- **[FIX-2026-07-17a] WCAG contrast pass 2: `text-stamp` failed AA on white for small text.**
  - Symptom: same #069494-on-white contrast failure across dashboard/admin small-text links and stamped badges.
  - Fix: full swap of `text-stamp` → `text-stamp-dark` across 12 files. Decorative italic display headings kept bright — they meet AA-large at 3:1.

### 2026-07-16

- **[FIX-2026-07-16a] WCAG contrast: `text-brand` (#069494) failed AA on white (~3.7:1).**
  - Symptom: small-text teal links fell under the 4.5:1 threshold for normal text.
  - Fix: swapped to `text-brand-dark` (#046B6B, ~5.4:1, AA-passing) in the four auth/CTA link sites (`app/login/page.tsx`, `app/signup/page.tsx`, `app/forgot-password/page.tsx`, `app/jobs/[id]/page.tsx`).

- **[FIX-2026-07-16b] Portfolio uploads capped at Vercel's 4.5MB body / 10s server-action limits.**
  - Symptom: uploading multiple unedited phone photos in one shot failed or timed out.
  - Fix: `MultiImagePicker` now uploads client-side directly to Supabase Storage as each file is picked (parallel, with per-tile status). Server actions receive a JSON array of pre-uploaded URLs, not File objects. Vercel body/timeout limits no longer apply.

### 2026-07-15

- **[FIX-2026-07-15a] User menu dropdown clipped items on short viewports.**
  - Symptom: admin accounts couldn't reach the "Admin" link at the bottom of the menu on short screens.
  - Cause: `overflow-hidden` with no height cap.
  - Fix: `max-h-[calc(100vh-5rem)]` + `overflow-y-auto`; panel swapped to a flex column so it scrolls internally.

### 2026-07-13

- **[FIX-2026-07-13a] Payouts stayed "pending" even after PayChangu confirmed success.**
  - Symptom: UI toast said "Payout confirmed. Status updated to Released." but `payout_status` never left `pending`.
  - Cause: `verifyPayout` returned PayChangu's decimals verbatim for `amount`/`fee`. `reconcilePayout` wrote them into the `int` columns `payout_amount_mwk`/`payout_fee_mwk`; Postgres silently rejected the write.
  - Fix: rounded both to integers on the way in, matching the earlier `verifyPayment` fix.

- **[FIX-2026-07-13b] Job page returned 500 from `revalidatePath` during render.**
  - Symptom: any job with a pending payout crashed the page ("Something went sideways").
  - Cause: `app/jobs/[id]/page.tsx` called `reconcilePayout()` at render time; `reconcilePayout` internally called `revalidatePath`, which Next 14 forbids inside render.
  - Fix: gave `reconcilePayout` a `{ skipRevalidate: true }` mode used by the render caller (the page re-fetches after, so revalidate is redundant there). Form-action callers unchanged.

- **[FIX-2026-07-13c] Cancellation queue understated gross when top-ups were paid.**
  - Symptom: MWK 9k job with a paid MWK 5k top-up displayed "gross 9,270" instead of 14,000, misleading the split percentages.
  - Cause: admin display read `collection_amount_mwk || accepted_bid_mwk` and ignored `total_paid_mwk`. Enforcement math was already correct — only the UI lied.
  - Fix: switched display to `total_paid_mwk || collection_amount_mwk || accepted_bid_mwk` with an `(original X + top-ups Y)` breakdown.

- **[FIX-2026-07-13d] Top-ups could be created + paid after `payment_released`.**
  - Symptom: "in escrow" totals stopped matching reality after release when a top-up was subsequently paid.
  - Cause: `requestTopUp` and `payTopUp` had no post-release guard.
  - Fix: both actions reject when `escrow_status ≠ 'payment_held'`; creative-side request form hidden after release. Tips-after-release moved to backlog.

- **[FIX-2026-07-13e] Admin cancel confirmation rejected legitimate confirms.**
  - Symptom: typing the job title into the admin cancel confirm sometimes failed with no useful reason.
  - Cause: `adminResolveCancellation` compared with `===`, so a trailing space in the DB title or a different case in the admin's typing bounced it.
  - Fix: trim + case-insensitive normalize on both sides before compare (the field is a "did you mean" gate, not a security check).

- **[FIX-2026-07-13f] Invite-to-job popup was clipped inside parent card.**
  - Symptom: on the creative profile, the `<details>` dropdown for "Invite to job" was cut off by the parent card's overflow.
  - Fix: replaced the inline dropdown with a real link to a dedicated page (`/creatives/[id]/invite`).

- **[FIX-2026-07-13g] Proposal submit leaked raw Postgres unique-constraint error.**
  - Symptom: user saw "duplicate key value violates unique constraint proposals_job_id_creative_id_key".
  - Cause: total unique constraint blocked reapplication even though the 3-attempts flow explicitly allows it.
  - Fix: dropped the total constraint; added a partial unique index scoped to `status in ('pending','accepted')`. Wrapped the insert in `logAdminError` + `GENERIC_ERROR` so future failures surface in `/admin/errors` instead of the UI.

- **[FIX-2026-07-13h] Cancellation payouts ate the platform's cut on small jobs.**
  - Symptom: platform's 10% on cancellation was being consumed by PayChangu's per-payout transfer fees (bank MWK 700 flat).
  - Fix: added `CANCELLATION_PAYOUT_RESERVE_PCT` (15%) — each side's cancellation share is reduced by a flat reserve before payout so the transfer fee comes out of the recipient's slice, not the platform's. Admin queue shows pre-reserve share + reserve deducted + actual payout, with a warning when either side falls below MWK 4,700.

- **[FIX-2026-07-13i] Dust cancellations paid MWK 0 while burning transfer fees.**
  - Symptom: cancellation splits under MWK 1,000 were fully consumed by PayChangu's transfer fee.
  - Fix: `MIN_PAYOUT_MWK = 1000` — legs below the floor skip `initiatePayout` entirely and stay with the platform. Admin queue labels this ("payout MWK 0 — below MWK 1,000 floor — rolled to platform").

- **[FIX-2026-07-13j] Long unbroken briefs pushed job cards past the mobile viewport.**
  - Cause: no line clamp, no word-break for pseudo-words like `sandboxtestsandboxtest…`.
  - Fix: 2-line clamp, explicit "More info →" affordance below, `overflow-wrap: anywhere` so pseudo-words break before the clamp fires.

- **[FIX-2026-07-13k] Duplicated "Refresh payout status" button on escrow panel.**
  - Cause: JSX block copy-pasted twice in `components/escrow-panel.tsx`.
  - Fix: removed the duplicate.

### 2026-07-12

- **[FIX-2026-07-12a] PostgREST embeds returned zero rows silently across dashboards (`PGRST201`).**
  - Symptom: dashboards showed empty jobs/proposals lists after a new FK landed.
  - Cause: Session C's new `jobs.pending_accept_proposal_id` FK created a second `jobs↔proposals` relationship; every unqualified PostgREST embed became ambiguous and silently returned zero rows.
  - Fix (`0443041`): pinned the affected embeds to `!proposals_job_id_fkey` in `app/dashboard/jobs/page.tsx` and `app/dashboard/proposals/page.tsx`. Earlier same-day one-off (`bada1cb`) handled the actions layer.

- **[FIX-2026-07-12b] 3-attempts-per-creative proposal cap never engaged.**
  - Symptom: cap feature was inert on ship day.
  - Cause: `proposals.status` is a Postgres enum `pending | accepted | declined | withdrawn`. Both `submitProposal` and the job page filtered `.eq("status", "rejected")` — a value that doesn't exist — so `rejectedCount` was always 0.
  - Fix (`478e575`): switched to `declined` at all call sites. Regression coverage grew via the mock-Supabase enum-validation hardening below.

- **[FIX-2026-07-12c] Mock Supabase silently accepted bogus enum values, letting FIX-2026-07-12b slip past tests.**
  - Cause: `tests/helpers/mockSupabase.ts` didn't validate enum status filters.
  - Fix: mock now errors on bogus values; the "declined" vs "rejected" bug would fail tests today.

- **[FIX-2026-07-12d] Just-posted jobs didn't appear on the dashboard without a manual refresh.**
  - Cause: `postJob` didn't revalidate `/dashboard/jobs`.
  - Fix: added `revalidatePath('/dashboard/jobs')` on success.

- **[FIX-2026-07-12e] E2E cookie state leaked between spec files.**
  - Cause: `login()` helper didn't clear cookies before navigating.
  - Fix: helper now clears cookies before login.

- **[FIX-2026-07-12f] Long briefs broke the job detail page layout; deadline picker was hostile.**
  - Cause: brief field had no wrap/max-height/scroll. Deadline defaulted to yesterday.
  - Fix: proper wrapping + max-height + scroll on the brief. Deadline picker shows a human date ("20th of July 2026") + "N days left" pill; defaults to a sensible future offset.

- **[FIX-2026-07-12g] Hourly cron schedules never fired on Vercel Hobby.**
  - Symptom: dispute non-response, topup expiry, and deadline extension aging didn't run.
  - Cause: Vercel Hobby only supports daily crons.
  - Fix: collapsed all hourly schedules to a single daily cron. Semantics unchanged, aging is just less frequent.

### 2026-07-11

- **[FIX-2026-07-11a] Double-payout on Release under slow-network double-click.**
  - Cause: no server-side guard; button could fire twice before the first response returned, producing two PayChangu payouts.
  - Fix: server-side lock on `jobs.payout_status` (only `none → initiated`); UI hides the button once initiated; payout webhook matches by `job_id` so a duplicate charge id can't re-mark the job.

- **[FIX-2026-07-11b] `decideProposal` errors were hidden from the user.**
  - Symptom: silent-failure path in accept-proposal made real causes invisible.
  - Fix: errors now surface verbatim on the accept form.

### 2026-07-10

- **[FIX-2026-07-10a] `releasePayment` failed with "creative profile not found".**
  - Cause (`295417d`): lookup joined on the wrong column.
  - Fix: corrected the join.

- **[FIX-2026-07-10b] When FIX-2026-07-10a failed, the real error was swallowed.**
  - Fix (`75f60cf`): the real cause now bubbles up to the client.

- **[FIX-2026-07-10c] Email lookup for release-payment hit a non-existent column.**
  - Cause: `profiles` has no email column; code was reading it.
  - Fix (`e451335`): lookup goes through `auth.users` via the existing `get_user_email` RPC.

- **[FIX-2026-07-10d] "Payment details" card only rendered for the client.**
  - Symptom: creative couldn't see the rail, fee, or status of the payment they were about to be paid from.
  - Fix: card now visible to both parties; PayChangu checkout prefilled with the client's saved name/phone/email.

### 2026-07-08

- **[FIX-2026-07-08a] Landing category rotator pushed the search bar off-screen.**
  - Cause: hero listed the full `CATEGORIES` array (24 entries), producing an absurdly tall column.
  - Fix: shows 6 categories at a time in a keyed batch, cycles every 3.8s through 4 batches with Framer AnimatePresence. Hover pauses; `prefers-reduced-motion` locks to first batch.

- **[FIX-2026-07-08b] Portfolio "Add cover photo" pill pointed to the wrong route.**
  - Cause: link targeted `/dashboard/account` instead of `/dashboard/profile`.
  - Fix: repointed to `/dashboard/profile`.

- **[FIX-2026-07-08c] `ImagePicker` wide-shape layout put the upload button in the wrong column.**
  - Cause: default row layout pushed the button off to the side when the preview was full-width.
  - Fix: wide shape now stacks preview + button vertically.

### 2026-07-06

- **[FIX-2026-07-06a] Category taxonomy drift in production DB.**
  - Symptom: rows carried categories that no longer matched the canonical list after the taxonomy was constrained.
  - Fix: `scripts/audit-categories.mjs` and `scripts/normalize-categories.mjs` added to detect and repair drift; forms constrained to the canonical set.

### 2026-07-02

- **[FIX-2026-07-02a] `SavingForm` `silent` prop leaked to the DOM as an unknown HTML attribute.**
  - Symptom: React warning on every form using `silent`.
  - Fix (`8954ef0`): prop no longer forwarded to the underlying `<form>` element.

### 2026-07-01

- **[FIX-2026-07-01a] RSC race: `revalidatePath` landed before redirect, leaving stale UI.**
  - Symptom: user navigated to the next page and saw pre-mutation state.
  - Fix (`dd1dad0`): ordered revalidation so post-redirect view is fresh.

- **[FIX-2026-07-01b] `SavingForm` didn't render server-action `info` strings.**
  - Symptom: messages like "Check your inbox to confirm the new email" never appeared.
  - Fix (`dd1dad0`): `SavingForm` now surfaces `info` alongside errors.

---

## Notes

- IDs are chronological: `FIX-YYYY-MM-DD-<letter>`; live open bugs use `BUG-NNN`. Numbering restarts only if we ever rebuild the log.
- When BUG-NNN gets fixed, keep the entry in In Progress until the deploy lands and the reporter re-tests, then move to Fixed with the commit hash.
- Pre-2026-06-24 (before the initial MVP scaffold `2695603`) is not covered — nothing was shipped that could have been broken. If bugs are found in commits earlier than the changelog captures, add them under a "Pre-launch" section here.
