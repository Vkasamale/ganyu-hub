-- Phase 6 item 50 — visual style filters (§O3, §K2).
--
-- Run this in the Supabase SQL editor. Additive only: one column with a
-- default and one index. Nothing is dropped and no existing row is rewritten.
--
-- §K2 is why this is a stored column rather than something we infer: styles
-- must be USER-DECLARED. Guessing "this person's work is vintage" from their
-- portfolio puts words in a creative's mouth and then filters them out of
-- searches on the strength of our own guess.
--
-- Values are slugs from lib/styles.ts: flat, 3d, hand-drawn, vintage,
-- photographic, bold-type. Deliberately not a Postgres enum — adding a style
-- should be a one-line code change, not a migration.
--
-- No grant needed: the "profiles update self" policy already covers every
-- column on profiles, and that table has no column-level revokes.

alter table profiles add column if not exists styles text[] not null default '{}';

-- GIN supports the `overlaps` (&&) filter /browse uses for a multi-select.
create index if not exists idx_profiles_styles on profiles using gin (styles);
