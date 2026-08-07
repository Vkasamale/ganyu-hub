# PayChangu sandbox testing

Reference for running payment tests without moving real money. Source:
<https://developer.paychangu.com/docs/test> — check there if something here
looks stale.

**These are PayChangu's published dummy values.** No real credentials belong in
this file, ever.

---

## How test vs live is decided

There is no sandbox host. `lib/payments.ts` always calls
`https://api.paychangu.com` — **the key alone decides whether a payment is
real.**

- `PAYCHANGU_SECRET_KEY` scoped to **Preview + Development** = test keys
- Same var scoped to **Production** = live keys, real money

So test on the **preview branch URL**
(`ganyu-hub-git-<branch>-<scope>.vercel.app`), never on production.

Test mode is enabled by default on a new PayChangu account; going live needs
compliance docs and a swap to live keys.

---

## Mobile money test numbers

⚠️ **Add the leading zero.** PayChangu's docs list these without it
(`990000000`), but the platform needs `0990000000` — confirmed by hand
2026-08-07. If a payout or collection fails on a valid-looking number, check
this first.

| Operator | Number | Result |
| --- | --- | --- |
| Airtel Money | `0990000000` | Success |
| Airtel Money | `0990000001` | Failed |
| TNM Mpamba | `0899817565` | Success |
| TNM Mpamba | `0899817566` | Failed |

## Test cards

3DS OTP for all of them: `1234`. CVC `123`, expiry `12/30`.

| Brand | Number | Scenario |
| --- | --- | --- |
| VISA | `4242424242424242` | 3DS success |
| VISA | `4000000000003220` | 3DS timeout |
| VISA | `4000000000009995` | Insufficient funds |
| VISA | `4000000000000002` | Declined |
| Mastercard | `5555555555554444` | 3DS success |
| Mastercard | `5200000000000008` | 3DS error |

## Bank — no test credentials exist

PayChangu publishes **no** test bank account numbers. Two bank-rail payout
attempts on 2026-08-07 (ERR-00012, ERR-00013) were rejected by
`direct-charge/payouts/initialize` — see the note at `lib/payments.ts:226`.

**Confirmed 2026-08-07:** that creative's default payout method was a *real*
bank account. A test key cannot reach the real banking rail and there is no
dummy account to stand in for one, so the rejection was correct behaviour, not a
bug. The lesson is that the creative's default method decides whether a sandbox
release is possible at all — check it before blaming the code.

**So: use a mobile payout method when testing releases.** A creative whose
default is bank cannot complete a sandbox payout.

---

## Gotchas that have already cost time

- **A job pins its payout method.** `actions.ts:1470` prefers
  `jobs.payout_method_id` over the creative's current default — changing the
  default does *not* redirect an existing job's payout. Test releases on a job
  created *after* the method you want.
- **Releases are blocked for 24h after funding.** The T+1 guard at
  `actions.ts:1428` rejects release while `payment_held_at` is under a day old.
  Funding and release cannot happen in the same session. Legacy jobs with a null
  `payment_held_at` skip the check.
- **Preview shares the production Supabase database.** No staging DB. Test rows
  are real rows — use throwaway jobs and clean up.
- **Turnstile** is domain-locked, so previews use Cloudflare's always-pass test
  keys (`1x00000000000000000000AA` /
  `1x0000000000000000000000000000000AA`), scoped to Preview + Development.
