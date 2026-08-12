# Verification backlog — Phases 3 and 4

Everything here is built, committed and typechecking, but has **never run
against real data**. Two phases of form logic are unproven. Work down this list
in order; each step takes seconds, and Claude verifies the result read-only
after each one.

Why by hand: Claude's browser automation cannot submit React server-action
forms in this app. Proven repeatedly on 2026-08-12 — fields filled, click
registered, no row written, no POST reaching the server, including while signed
in and healthy. Forms clicked by the founder work first time.

---

## 1. Run the Phase 4 migration

`supabase/phase4-reviews.sql` in the Supabase SQL editor. Nothing in Phase 4
exists until this runs — the axis columns and the response column are not in
the database.

**Claude then checks:** all eight columns present.

## 2. Send the testimonial

The form at `/t/<token>` should still be filled. Click **Send testimonial**.

**Claude then checks:**
- the row flips to `submitted` with name, relationship and `submitted_at`
- re-opening the same link shows "Thank you — this one is already done"
  (the single-use guard — the highest-value check in Phase 3)
- a notification reached the creative

## 3. Publish it

`/dashboard/testimonials` → **Publish** on the waiting testimonial.

**Claude then checks:**
- it appears on the public profile under "Vouched for, off Ganyu Hub"
- it does **not** appear in the landing-page carousel, which must stay
  escrow-backed reviews only

## 4. Leave a multi-axis review

Open a completed job you were a party to and submit a review, rating all three
axes.

**Claude then checks:**
- the three axis columns are stored
- `rating` equals the mean of them (the derived overall)
- the breakdown renders under the review
- the job title and amount paid render beside it (item 33)

## 5. Reply to that review

As the person reviewed, use the **Reply** box under it.

**Claude then checks:**
- `response` and `responded_at` are written
- the reply renders threaded under the review
- a second reply is refused (reply-once guard)

## 6. Mobile pass (needs a phone, or devtools at 375px)

- reviews carousel peeks and swipes (item 34)
- the sticky action bar shows on a job and hides at ≥768px
- the install banner's iOS branch — still never run on a device

---

## Known gaps this does not cover

- **Turnstile is disabled locally** (commented out in `.env.local`), so the bot
  check on the public testimonial form has never been exercised.
- **The `/t/<invalid>` route returned HTTP 200** rather than 404 while
  rendering the not-found page. Right page, questionable status — confirm on a
  real deploy.
- **BUG-020** — the auth rate limit's real threshold, and whether it is per-IP
  or per-project, is still unmeasured.
