-- Phase 3 migration — run once in the Supabase SQL editor.
-- Extracted verbatim from supabase/schema.sql; running it there instead is
-- equivalent. Safe to re-run: every statement is create-if-not-exists or an
-- explicit drop-then-create of a policy.

-- ---------------------------------------------------------------------------
-- Phase 3 — testimonials (IMPLEMENTATION_PLAN.md items 26-28, audit §M11, §M1).
--
-- Cold-start fix, and deliberately NOT the `reviews` table. A review is backed
-- by a completed job and real money moving through escrow. A testimonial is a
-- past client from before Ganyu Hub existed, vouching for work we never saw.
-- Both are worth showing; conflating them would let unverified praise borrow
-- the credibility of escrow-backed reviews. Separate table, separate label.
--
-- One row per REQUEST. The creative creates the row (status 'pending') and
-- sends the link; the past client fills it in once (status 'submitted'). The
-- token is single-use by virtue of that status check.
-- ---------------------------------------------------------------------------

do $$ begin
  create type testimonial_status as enum ('pending', 'submitted', 'published', 'hidden');
exception when duplicate_object then null; end $$;

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  creative_id uuid not null references profiles(id) on delete cascade,
  -- Filled by the CLIENT, not the creative. Null until submitted.
  client_name text,
  -- "Owner, Blantyre Bakery" — who they are to this creative.
  relationship text,
  body text,
  token text not null unique,
  status testimonial_status not null default 'pending',
  -- What the creative typed when requesting, so they can tell two pending
  -- links apart. Never shown publicly.
  request_note text,
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_testimonials_creative on testimonials(creative_id, created_at desc);

alter table testimonials enable row level security;

-- Anyone may read PUBLISHED testimonials — they are profile content.
drop policy if exists "testimonials read published" on testimonials;
create policy "testimonials read published" on testimonials for select using (status = 'published');

-- A creative sees all of their own, including pending links and hidden ones.
drop policy if exists "testimonials read own" on testimonials;
create policy "testimonials read own" on testimonials for select using (auth.uid() = creative_id);

drop policy if exists "testimonials insert own" on testimonials;
create policy "testimonials insert own" on testimonials for insert with check (auth.uid() = creative_id);

drop policy if exists "testimonials update own" on testimonials;
create policy "testimonials update own" on testimonials for update
  using (auth.uid() = creative_id) with check (auth.uid() = creative_id);

drop policy if exists "testimonials delete own" on testimonials;
create policy "testimonials delete own" on testimonials for delete using (auth.uid() = creative_id);

-- THE INTEGRITY LINE: a creative may publish or hide a testimonial, but may
-- never edit what their client wrote. RLS cannot express "only this column",
-- so column-level grants do it. Public submission runs through the service
-- role in a server action, which bypasses both.
revoke update on testimonials from authenticated;
grant update (status) on testimonials to authenticated;
