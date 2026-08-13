-- Phase 9 items 72 + 77 — read receipts, the edited marker, and Ganyu-verified.
--
-- Run in the Supabase SQL editor. Additive only: nullable columns on existing
-- tables. Nothing is dropped and no existing row is rewritten.

-- ---------------------------------------------------------------- item 72 --
-- Read receipts. lib/thread-previews.ts derives UNREAD COUNTS from
-- notifications and documents its own ceiling: "if unread ever has to be
-- exact, the upgrade is a last_read_at per participant". This is that upgrade,
-- and it is needed here because a receipt makes a claim about a PERSON — "they
-- have seen this" — which a count derived from notifications cannot honestly
-- support. A message that failed to notify would read as unseen forever, and
-- the creative would conclude they were being ignored.
--
-- Two columns rather than a reads table: a thread has exactly two
-- participants, fixed by `unique (client_id, creative_id, job_id)`.
alter table message_threads add column if not exists client_last_read_at timestamptz;
alter table message_threads add column if not exists creative_last_read_at timestamptz;

-- The "Edited" marker. Null means never edited — the honest default for every
-- row written before this column existed. Deliberately NOT backfilled to
-- created_at, which would claim every old message had been edited.
alter table messages add column if not exists edited_at timestamptz;

-- ---------------------------------------------------------------- item 77 --
-- Ganyu-verified (§O2). A HUMAN decision, recorded with who made it and when,
-- through the admin queue that already exists.
--
-- Deliberately not a boolean: "verified" with no date and no name is a claim
-- nobody can audit or withdraw. If we tell a client this person is vetted, we
-- must be able to say who vetted them, and when.
alter table profiles add column if not exists verified_at timestamptz;
alter table profiles add column if not exists verified_by uuid references profiles(id) on delete set null;
alter table profiles add column if not exists verified_note text;

create index if not exists idx_profiles_verified on profiles(verified_at) where verified_at is not null;

-- Only admins may grant it. The existing "profiles update self" policy would
-- otherwise let any creative mark themselves verified — the single most
-- damaging write in this schema, because the entire value of the badge is
-- that the subject did not award it to themselves.
revoke update (verified_at, verified_by, verified_note) on profiles from authenticated;
