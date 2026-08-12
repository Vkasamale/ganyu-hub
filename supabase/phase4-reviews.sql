-- Phase 4 migration — run once in the Supabase SQL editor.
-- Items 29 and 30 (audit §N1, §F1). Additive and nullable: every existing
-- review row stays valid, and every existing query keeps working.
--
-- NOTE: `reviews.rating` stays the headline number and is NOT replaced. It is
-- computed as the mean of whichever axes were given, so star averages on
-- /browse, /creatives/[id] and lib/feed.ts keep working untouched. One number
-- to sort by, three to explain it.

-- Item 29, creative axes: how they were to work with.
alter table reviews add column if not exists rating_communication integer
  check (rating_communication between 1 and 5);
alter table reviews add column if not exists rating_quality integer
  check (rating_quality between 1 and 5);
alter table reviews add column if not exists rating_deadline integer
  check (rating_deadline between 1 and 5);

-- Item 29, client axes. §N1 argues these matter MORE here: a creative's real
-- fear is not a bad rating, it is a client who vanishes after delivery or
-- haggles the price down after the fact.
alter table reviews add column if not exists rating_brief_clarity integer
  check (rating_brief_clarity between 1 and 5);
alter table reviews add column if not exists rating_paid_on_time integer
  check (rating_paid_on_time between 1 and 5);
alter table reviews add column if not exists rating_fair_revisions integer
  check (rating_fair_revisions between 1 and 5);

-- Item 30: the ratee's right of response, threaded under the review.
alter table reviews add column if not exists response text;
alter table reviews add column if not exists responded_at timestamptz;

-- The reviewee — and ONLY the reviewee — may reply, and may never touch the
-- rating or the reviewer's words. RLS cannot express "only these columns", so
-- column-level grants do. Same pattern as testimonials.
drop policy if exists "reviews respond as reviewee" on reviews;
create policy "reviews respond as reviewee" on reviews for update
  using (auth.uid() = reviewee_id)
  with check (auth.uid() = reviewee_id);

revoke update on reviews from authenticated;
grant update (response, responded_at) on reviews to authenticated;
