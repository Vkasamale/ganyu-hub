-- Backfill job conversations for jobs accepted before threads existed.
--
-- Threads are created at acceptance (lib/accept-pending.ts), so every job
-- accepted before that shipped has no conversation and is missing from the Jobs
-- filter in Messages. This creates one thread per accepted job, retroactively.
--
-- Run in Supabase Studio (SQL editor). Safe to run more than once: the unique
-- constraint on (client_id, creative_id, job_id) makes the insert idempotent.
--
-- Run the steps in order. Step 1 changes nothing.

-- ---------------------------------------------------------------------------
-- STEP 1 — Dry run. See exactly what step 2 would create. Nothing is written.
-- ---------------------------------------------------------------------------
select
  j.id            as job_id,
  j.title,
  j.status,
  j.client_id,
  p.creative_id,
  coalesce(j.payment_confirmed_at, j.created_at) as thread_created_at
from jobs j
join proposals p on p.job_id = j.id and p.status = 'accepted'
left join message_threads t
       on t.job_id = j.id
      and t.client_id = j.client_id
      and t.creative_id = p.creative_id
where t.id is null
  and j.client_id is not null
  and p.creative_id is not null
order by thread_created_at desc;

-- ---------------------------------------------------------------------------
-- STEP 2 — The backfill itself.
--
-- created_at is stamped with when the job was actually paid for, not now, so
-- the conversation list sorts by real history instead of bunching every
-- backfilled thread at the top. distinct on guards against a job somehow
-- carrying two accepted proposals — it should not, but this insert is not the
-- place to find out.
-- ---------------------------------------------------------------------------
insert into message_threads (client_id, creative_id, job_id, created_at)
select distinct on (j.id)
  j.client_id,
  p.creative_id,
  j.id,
  coalesce(j.payment_confirmed_at, j.created_at)
from jobs j
join proposals p on p.job_id = j.id and p.status = 'accepted'
where j.client_id is not null
  and p.creative_id is not null
order by j.id, p.created_at asc
on conflict (client_id, creative_id, job_id) do nothing;

-- ---------------------------------------------------------------------------
-- STEP 3 — Verify. Every accepted job should now have exactly one thread, so
-- the "missing" count must be 0.
-- ---------------------------------------------------------------------------
select
  count(*) filter (where t.id is null)     as missing,
  count(*) filter (where t.id is not null) as have_thread
from jobs j
join proposals p on p.job_id = j.id and p.status = 'accepted'
left join message_threads t
       on t.job_id = j.id
      and t.client_id = j.client_id
      and t.creative_id = p.creative_id;
