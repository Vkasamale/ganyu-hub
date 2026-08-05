# Security scripts

## rls-exploit-test.mjs

Authenticated regression test for the 2026-08-05 RLS privilege-escalation fix.
It seeds a throwaway creative + client + job + pending proposal via the
service-role key, logs in **as the creative** with the anon key, then attempts
the two exploits the fix closed and cleans everything up afterwards:

- **T1** — creative self-accepts their own proposal → must be blocked (403).
- **T2a** — accepted creative PATCHes `jobs.total_paid_mwk` → must be blocked
  by the `guard_jobs_creative_update` trigger.
- **T2b** — accepted creative makes a legit status write → must still succeed.

Run it after any change to the `proposals`/`jobs` RLS policies or the trigger:

```bash
node scripts/security/rls-exploit-test.mjs
```

Reads `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local`. It runs against whatever DB
those point at — currently production — but leaves no residue (all test rows are
prefixed `rlstest_` / `@ganyu-test.local` and deleted in a `finally` block).
Exits non-zero if any assertion fails.
