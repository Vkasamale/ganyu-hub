-- Phase 5 migration — run once in the Supabase SQL editor.
-- Items 38, 40, 41, 42 (audit §G7, §N2, §N3, §G8, §G4). All additive and
-- nullable; existing proposals and services stay valid.
--
-- This is DISPUTE PREVENTION, not decoration. Nearly every creative-services
-- dispute is one of three arguments:
--   "I thought the source file was included"
--   "I expected three concepts, not one"
--   "that's a revision, not a fix"
-- Agreed at proposal time, each stops being an argument and becomes a lookup.
--
-- NOTE: proposals.revisions_offered and extra_revision_rate already exist and
-- are already wired end to end. Not repeated here.

-- Item 38 — the spec, captured where the promise is actually made.
alter table proposals add column if not exists delivery_days integer;
-- "Concepts" for design, "edited photos" for photography, "cuts" for video —
-- the number is generic, the WORD is category-specific and lives in
-- lib/deliverables.ts. Storing the label would freeze today's wording into
-- every historical row.
alter table proposals add column if not exists concepts integer;
alter table proposals add column if not exists formats text[] default '{}';
-- Nullable on purpose: false means "not included", null means "not stated".
-- Those are different promises, and the difference is what gets argued about.
alter table proposals add column if not exists source_files boolean;

-- Item 40 — add-ons with a price delta, e.g. [{"label":"Express delivery","price_mwk":10000}]
alter table proposals add column if not exists addons jsonb not null default '[]'::jsonb;

-- Item 41 — AI-use disclosure (§G8). Free text, not a checkbox: "background
-- removal only" and "fully generated" are not the same answer, and a boolean
-- would flatten them.
alter table proposals add column if not exists ai_disclosure text;

-- Item 42 — seller-authored FAQ, e.g. [{"q":"Do you do rush jobs?","a":"Yes, +50%."}]
alter table services add column if not exists faqs jsonb not null default '[]'::jsonb;
