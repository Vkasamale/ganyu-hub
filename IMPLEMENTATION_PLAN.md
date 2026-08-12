# Implementation plan — reference audit → shipped product

Agreed 2026-08-12. This is the build order for everything in
`DESIGN_GAP_AUDIT.md`, converted from findings into work.

**The rule that produced this split:**

- **We build** anything needing a table, a column, a query, a route, or a form
  field.
- **Claude Design polishes** spacing, type, colour, motion, card composition,
  the stamp.
- Claude Design can only design what exists. Hand it a skeleton and it designs
  a skeleton beautifully. So **structure ships first, finish ships last.**

**Design runs:** the Claude Design project running on 2026-08-12 was terminated
deliberately — it was designing against a product about to change on nearly
every surface. Next run happens after Phase 2, a third after Phase 6. Never
against an empty screen.

**Register:** Phases 0–9 are `product` register. The landing page (below) is
`brand`. See `PRODUCT.md`. Keep them separate or the plan becomes one pile.

---

## Standing rule — building room for data we don't have yet

Sections for future data get **built and wired now**, gated on a real
threshold, rendering **nothing** below it.

`app/page.tsx:30` already does this:

```ts
const showProof = jobsCompleted >= 3;
```

Generalise it. Never a zero, never a placeholder, never `★ — (0 reviews)`.
An empty testimonial carousel says "nobody uses this". A hidden one says
nothing at all, which is correct, because nothing is what we know.

---

## Landing page — before Phase 0

`brand` register. Currently two sections (hero + gated proof row) against
Fiverr's eight and Upwork's nine.

**The gap is imagery.** Both references are a full-bleed darkened photograph
with white display type and the search field sitting *on* the image. Our hero
is flat `#EFE6CE`. Everything else in it — mode toggle, search, rotating
categories — is already comparable. Upwork's hero carries the same
`I want to hire / I want to work` toggle we built independently; keep ours.

### Ship now — no new data

| # | Item |
|---|---|
| L1 | Hero: **photo + scrim on `md:` and up, flat brand band on mobile** — white type, search on the image, category pills below. Fiverr ships no hero image on mobile at all; ours should not either (§Q8) |
| L1b | **Install-the-app banner above the nav, signed out.** Dismissible, one line. `components/push-banner.tsx` already has the iOS Add-to-Home-Screen branch but only renders on the dashboard — behind sign-in, the wrong side of the door for install (§Q8) |
| L1c | Announcement bar component above the nav — one line + CTA, for beta and launch messaging (§Q8) |
| L2 | Value props — 4 icons: money held in escrow · paid in MWK, mobile money or bank · real Malawian creatives · disputes handled by a human |
| L3 | Category grid (icon cards from `CATEGORIES`) — 3 across on mobile with `View N more ˅`, not an endless scroll (§Q8) |
| L4 | How it works, with the same hire/work toggle as the hero |
| L5 | Real footer — audience split, category links, install the app (§J3). **Columns on `md:`, accordions below** — without that, a five-column footer is a very long phone scroll (§Q8) |
| L6 | CTA band above the footer |

### Build, wire, leave dark

| # | Section | Turns on at |
|---|---|---|
| L7 | Proof row | ≥3 completed jobs — **already built** |
| L8 | Testimonials carousel | ≥3 testimonials |
| L9 | Featured creatives | ≥6 profiles with a portfolio item |
| L10 | Success story | 1 completed job written up |
| L11 | Trusted-by row | ≥4 named clients with permission |

### Not copying

Award badges (we have none), pricing plan cards (commission-only at launch),
Upwork's cost-estimate tool (needs price data we don't have), enterprise
anything.

---

## Phase 0 — No schema, no new data

| # | Item | Where | § |
|---|---|---|---|
| 1 | Price in the CTA — `Fund escrow (MWK 20,000)` | escrow panel, every money button | N4 |
| 2 | Sticky action bar (mobile) + sticky money card (desktop) | job detail, profile | G1, M8 |
| 3 | Verify briefs render `whitespace-pre-line` | job detail | G6 |
| 4 | Persuasive empty states with a real CTA | ~12 surfaces | E, F8 |
| 5 | Two empty-state weights — button for an empty inbox, quiet link for an empty thread | messages | H2 |
| 6 | `+N` overflow on chip lists | skills, tags | M9 |
| 7 | Unread count pills | thread list | H3 |
| 8 | Weighted checklist — `Portfolio (+20%)` + "4.5x more likely to get hired" | `WelcomeChecklist` | L3 |

No migrations. ~1 session.

---

## Phase 1 — Profile depth

| # | Item | Needs | § |
|---|---|---|---|
| 9 | **Portfolio item as case study** — cost range, duration, description, date, category chips | columns on `portfolio_items` | M10 |
| 10 | Tagline field | 1 column | M9 |
| 11 | Languages — Chichewa / English / Tumbuka / Yao | 1 array column | M2 |
| 12 | "Online for messages" toggle — user-declared, not inferred from last-seen | 1 bool | K2 |
| 13 | Availability — hours/week + open-to-work | 2 columns | M4 |
| 14 | "Self-reported" label on skills | none | M3 |
| 15 | Profile tabs — About · Services · Portfolio · Reviews | none | F4 |
| 16 | See public view | 1 route | F6 |
| 17 | Per-item edit/delete rather than one big form | none | M4 |

**Item 9 is the highest-value item in this phase.** Cost and duration answer
the two questions every client asks before messaging, without them asking.
Needs no reviews, no ratings, no volume — a creative can fill it in today with
work from last year.

**Item 9 depends on** the portfolio image upload in `BACKLOG.md` (Media) —
`cover_url` is still a pasted text URL. Case studies with hosted-elsewhere
images will look broken. Do the upload first or accept it.

---

## Phase 2 — Derived trust numbers

Zero schema. Every number already exists in data we hold.

| # | Number | Source | § |
|---|---|---|---|
| 18 | **Hire rate** — accepted proposals ÷ jobs posted | jobs + proposals | G2 |
| 19 | Jobs posted · open jobs | jobs | G2 |
| 20 | Total spent / total earned MWK | `total_paid_mwk` | G2 |
| 21 | Member since | `profiles.created_at` | G2 |
| 22 | Average response time | `messages` timestamps | F3 |
| 23 | Repeat-client badge | jobs | F9 |
| 24 | **"About the client" block on job detail** — the above, plus escrow funded ✓ and phone verified ✓ | assembles 18–23 | G2 |
| 25 | Money overview — in escrow / released / payout pending / paid, each with a `?` | existing escrow states | L2 |

**Item 24 is the biggest single gap in the product.** It is the block that
tells a creative whether writing a proposal is worth their time. Escrow
*funded* is a stronger signal than Upwork's "payment method verified", and we
already have it — we just never show it.

`?` tooltips matter more for us than for them: we carry `2% + MWK 700` on bank
payouts, a settlement hold, and separate collection fees.

**Run Claude Design here** — landing page, profiles and trust numbers are real
by this point, and it is a meaningful surface to design against.

---

## Phase 3 — Testimonials

Cold-start fix. Comes **before** extending reviews.

| # | Item | § |
|---|---|---|
| 26 | `testimonials` table — creative_id, client name, relationship, body, token, status | M11 |
| 27 | **Request-a-testimonial flow reusing the `/j/[token]` pattern** | M11 |
| 28 | Public testimonials block on the profile, labelled off-platform | M1 |

**Why before reviews:** we are in closed beta. Reviews cannot produce a row
until on-platform jobs complete. A designer who has worked in Blantyre for six
years has real clients who would vouch for them today. It is a REQUEST flow —
the creative sends a link, the past client fills it in — which is what stops it
being self-written praise. The token machinery already exists.

---

## Phase 4 — Reviews: extend and surface

⚠️ **Correction to `DESIGN_GAP_AUDIT.md` §F/§G2/§C, which claim we have no
reviews.** That was written from screenshots without reading the schema.

**What already ships** (`supabase/schema.sql:211`, built 2026-07-03):

```sql
reviews (id, job_id, reviewer_id, reviewee_id, rating 1–5, comment, created_at)
unique (job_id, reviewer_id)
```

RLS restricts inserts to a party of a completed job. Columns are role-neutral,
so **§G3's bidirectional requirement is already satisfied structurally** —
clients can be rated today. Star averages already render on `/creatives/[id]`
and on `/browse` cards.

**What is actually missing:**

| # | Item | § |
|---|---|---|
| 29 | **Multi-axis ratings.** Creatives: communication · quality of work · met the deadline. Clients: clear brief · paid on time · reasonable with revisions | N1 |
| 30 | **Ratee's right of response**, threaded under the review | F1 |
| 31 | Surface the client direction — a client's rating visible on the job before you bid | G3 |
| 32 | `★ 4.8 (153)` in identity blocks, count linking to the reviews tab | F2 |
| 33 | Review body carrying price paid + duration + the service it came from | F1 |
| 34 | Reviews as a horizontal carousel on mobile | N5 |
| 35 | Review prompt triggered on `payment_released` — reuses the push pipe in `lib/job-events.ts` | — |
| 36 | Fold rating into search ranking (`lib/feed.ts`) — already flagged in `BACKLOG.md` | — |

**Why multi-axis matters here:** a bare 4.2 reads as ominous. Three axes make
it legible, and they tell the ratee what to fix. For Malawi the client
direction is arguably more important than the creative one — a creative's real
fear is not a bad rating, it is a client who vanishes after delivery or haggles
the price down after the fact.

---

## Phase 5 — Structured deliverables

| # | Item | § |
|---|---|---|
| 37 | Category-specific attribute sets on `CATEGORIES` (logo vs photography vs video) | I4 |
| 38 | Deliverables spec captured at **proposal** time — formats, concepts, revisions, delivery days, source file ✓ | G7, N2 |
| 39 | Rendered as a spec table on the job and the proposal | N2 |
| 40 | Add-ons with a price delta — `Express delivery +MWK 10,000` | N3 |
| 41 | AI-use disclosure field on proposals | G8 |
| 42 | Seller-authored FAQ (`faqs` jsonb on services) | G4 |

**This is dispute prevention, not decoration.** We already built disputes,
cancellations and an admin resolution queue. Nearly every creative-services
dispute is one of three arguments:

- "I thought the source file was included"
- "I expected three concepts, not one"
- "that's a revision, not a fix"

A structured spec agreed at proposal time turns each of those from an argument
into a lookup. It is data we already half-collect as free text.

**Sequence with** the `revisions_offered` item in `BACKLOG.md` (Scope /
proposals) — same form, same accept-time copy to the job. Do them together.

---

## Phase 6 — Discovery

Largest single chunk. Depends on Phase 4 for the ratings on cards.

| # | Item | § |
|---|---|---|
| 43 | **Task-phrased entry points** — "Get professional photos taken", category demoted to subtitle | L1 |
| 44 | Home as a feed of sections, not a stats dashboard | B, O1 |
| 45 | Two eyebrow action cards — `RECOMMENDED FOR YOU` / `PROFILE PROGRESS` | O1 |
| 46 | Horizontal carousels + a "See all" pattern | B |
| 47 | Service card shape — image, rating, ♡, title, **From MWK X** | C, O4 |
| 48 | **♡ save on cards** — `interactions` and `saved_items` both exist, never surfaced | P3 |
| 49 | Category landing pages with plain-language descriptions | O3 |
| 50 | **Visual style filters** — Flat / 3D / Vintage as pictures, not words | O3 |
| 51 | Co-view carousel from `interactions` | G4 |
| 52 | Browsing history with **Clear All** | G4 |
| 53 | Search scope selector — Jobs / Creatives, each with a sentence | N6, K3 |
| 54 | Job card: proposal count, trust row, dismiss, save | D |
| 55 | Activity on this job — proposals, last viewed by client, invites | G1 |

**Item 43 matters more than it looks.** A Malawian shop owner does not know
they want "Graphics & Design". They know they want a logo for their bakery.
`CATEGORIES` is a taxonomy for us, not an entry point for them.

**Item 50** is the standout: many clients here have never commissioned design
and do not have the vocabulary. Letting them point at a picture is the
difference between briefing and giving up.

**Item 49 doubles as SEO** — see the domain-unlocked section of `BACKLOG.md`.

**Run Claude Design again after this phase.**

---

## Phase 7 — Navigation shell

| # | Item | § |
|---|---|---|
| 56 | **Bottom tab bar**, 5 destinations, no create action in the bar | A |
| 57 | Mobile drawer, grouped — Your work / Settings / Help, version at the foot | A, K1 |
| 58 | Settings gear in the header | A |
| 59 | Sub-tabs under page titles (underline) | A |
| 60 | Verb-based desktop nav — Find work / Deliver work / Manage finances | K3 |
| 61 | **Real footer** — audience split, category links, install the app, release notes, accessibility | J3 |
| 62 | Pre-footer "ways in" cards — post a job · browse creatives · **invite a client via share link** | J3 |
| 63 | Trust cards above the footer — escrow, disputes, `/how-money-works` | J3 |

Ours today is a legal strip, not a footer. **Item 62's third route is genuinely
unusual and currently almost invisible** — the creative-initiated job + share
link from Session 5.

Body needs bottom padding plus `env(safe-area-inset-bottom)`. Installed as a
PWA there is no browser back button — every screen must be escapable from
within the UI.

---

## Phase 8 — Job posting wizard

| # | Item | § |
|---|---|---|
| 64 | 2–3 step wizard (not their 6), pencil on completed steps, never a lock | I1, I6 |
| 65 | Preview as the client will see it + `Save & exit` | I1 |
| 66 | Field pattern: heading → one-line plain-language helper → input → counter enforcing both ends | I2 |
| 67 | **Category inferred from the title** — keyword match against `CATEGORIES`, browse-all as the escape hatch | I3 |
| 68 | Reassurance copy: "You can always come back and change your project later." | I5 |
| 69 | Rich-text description | G8 |

**Item 64 is the structural version of the BUG-016 fix** — `SavingForm` used to
wipe fields on failed validation; a wizard with genuinely editable prior steps
is that fix made architectural.

**Item 68** is one sentence and removes a real fear. We ask beta users to post
real jobs with real money.

---

## Phase 9 — Messages and remaining

| # | Item | § |
|---|---|---|
| 70 | **Attachment cards** — `logo-final.ai · 2.4 MB` · View / Save. Bucket and signed URLs already exist | H1 |
| 71 | Event type in the list preview — "Files delivered", "Payment released" | H3 |
| 72 | Read receipts + an "Edited" marker | H3 |
| 73 | Desktop left icon rail | H3 |
| 74 | Floating Chat pill on profile and job | N5 |
| 75 | Seller info as a bottom sheet (mobile) | N5 |
| 76 | Full-bleed media carousel, `1 of 20` counter | N5 |
| 77 | **Ganyu-verified badge** — human vetting through the existing admin queue | O2 |
| 78 | "Get to know <name>" card at the foot of the gig | G8 |
| 79 | Save count as social proof — `♡ 229`, not just a toggle | G8 |

**Item 77 is the strongest trust idea in the whole reference set for our
market.** A human checked this person is real and the work is theirs. Fiverr
cannot credibly do this at their scale; we can at ours. It also gives a natural
premium tier later without inventing Connects.

**Item 70** makes delivery legible as an event in the thread we already merge
job events into.

---

## Not building — from the audit's own "not copying"

- Connects, paid boosts, "Promote with ads" — Upwork's revenue model, and it
  makes a profile feel like a slot machine
- Basic / Standard / Premium tiers — our jobs are bespoke with a bid; tiers
  would break the proposal flow
- "Level 2" seller ranks — gamification needing volume we do not have
- Country flags — everyone here is in Malawi; district or city is the unit
- Pin / archive / mute — three features for a beta with ~25 conversations
- Voice notes, calls, status, "Ask Meta AI"
- Account-health scores, membership plans, identity-verification badges as UI
  (that is a KYC programme — see `BACKLOG.md` Identity & Trust)
- "Do not sell or share my personal information" — CCPA-specific, not Malawi
- Enterprise / Pro tiers, affiliate and creator programmes
- The Gallery step and the 6-step wizard length

---

## Handed to Claude Design

Stamp texture · shadows and elevation · type scale · card composition · motion ·
carousel styling · the paper-vs-white inconsistency (`DESIGN.md` §2) · the
`font-display` conflict (§3).

**Finish, not features.**

---

## Scale

79 items plus the landing page. Roughly 10–12 sessions.

Phases 0–2 alone are 25 items, need almost no migration, and would visibly
change the product. Phases 3 and 4 are the ones Claude Design categorically
cannot do for us.
