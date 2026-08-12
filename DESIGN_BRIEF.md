# Design brief — deferred until after Phase 9

> **Schedule changed 2026-08-12 (founder).** `IMPLEMENTATION_PLAN.md` puts
> design runs after Phase 2 and after Phase 6. The founder’s call is to run
> design **once, after every phase is built.** That trades away early visual
> feedback in exchange for never designing a surface twice — defensible,
> given Phase 6 rebuilds the signed-in home wholesale.
>
> Consequence to accept knowingly: the product stays visually unfinished
> through Phases 4–9, and the whole visual system lands in one pass at the
> end. Keep this brief current as phases land — a stale brief is what made
> the 2026-08-12 run unusable.

## Original scope (still applies, now against the finished product)

For the Claude Design run scheduled in [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md)
after Phase 2. Read with [`DESIGN.md`](DESIGN.md), which is the binding rulebook —
this brief says what to work on and what not to touch. Where the two disagree,
`DESIGN.md` wins.

---

## ⚠️ Prerequisite — do not start the run until this is true

**Phases 0–2 are committed locally but NOT pushed.** As of writing, `main` on
the remote is at `26eaffa`, which predates all of it.

A run started before the push would design:

- the old proof row — no testimonials, no featured creatives, no trusted-by
- empty states as bare grey sentences
- profiles with no tabs, no tagline, no languages, no case-study fields
- job pages with no "About the client" block
- money buttons that do not name the amount

That is designing against a product that no longer exists — the exact reason
the 2026-08-12 run was terminated. **Push `claude/next-session-8450b2` (two
commits, `cd7fa28` and `535bc69`), merge to `main`, and make the repo readable
by the run first.**

---

## The split rule

**We build anything needing a table, a column, a query, a route or a form
field. Design polishes.** Design can only design what exists — hand it a
skeleton and it designs a skeleton beautifully. Structure ships first, finish
ships last.

## What is handed over

From `IMPLEMENTATION_PLAN.md` § "Handed to Claude Design":

- **Stamp texture.** Position is settled and confirmed live — on the money's
  line, at the card's right margin, larger. The *texture* is not. The flanking
  rules read as a strike-through and the double ring is too subtle; it reads as
  a rounded chip, not as ink. Next attempt: rules **above and below** the text
  rather than beside it, a heavier outer ring visibly separated from the inner
  one, wider tracking, possibly a dashed outer ring for ink bleed.
- **Shadows and elevation** (`DESIGN.md` §6).
- **Type scale.**
- **Card composition.**
- **Motion.**
- **Carousel styling** — the testimonial row on the landing page, and any
  carousel in Phase 6. The peek is a requirement, not a style choice (§Q8).
- **The paper-vs-white inconsistency** (`DESIGN.md` §2). Surfaces mix `paper`
  (`#EFE6CE`), `wash` (`#DACFB2`) and plain white with no stated rule for which
  belongs where. Decide the rule, then apply it.
- **The `font-display` conflict** (`DESIGN.md` §3). Three faces are defined —
  Inter for UI, Plex Mono for money and eyebrows, Instrument Serif for display
  italic — and usage has drifted. Settle which face owns headings.

**Finish, not features.**

## Scope: the system first, and one finished surface

This run happens with Phases 3–9 still ahead, so **most screens are going to
change structurally.** Spend the run on what survives that, not on composition
work Phase 6 will throw away.

**In scope — the visual system.** Stamp texture, shadows and elevation, type
scale, motion, the paper-vs-white rule, the `font-display` conflict. These are
decisions about the language, and they apply to screens that do not exist yet
as much as to the ones that do.

**In scope — the landing page.** Eight live sections plus two that state "not
yet". It is finished at 11 of 11 and **no remaining phase touches it**, so it
is the one surface where composition work is safe today.

**Treat carefully — job detail and creative profile.** Both are freshly built
and worth looking at, but Phase 5 adds structured deliverables to job detail
and Phase 4 rewrites the reviews block on the profile. Style what is there; do
not re-architect either page.

**OUT of scope — the signed-in dashboard.** Phase 6 (item 44, audit §B and
§O1) replaces it wholesale: it stops being a stats dashboard and becomes a feed
of sections, led by two eyebrow action cards — `RECOMMENDED FOR YOU` and
`PROFILE PROGRESS` — with carousels beneath. Designing it now means designing a
page already scheduled for demolition. The plan puts the *third* design run
immediately after Phase 6 for exactly this reason.

**OUT of scope — messages.** Phase 9.

---

## Do not change

These are not aesthetic preferences. Each is a decision with a reason, and
several were expensive to arrive at.

- **Never render a zero, a dash, or a placeholder where we have no data** (§Q7).
  Sections with a data threshold render *nothing* below it. Do not "improve" a
  hidden section by giving it a skeleton, a sample card, or a greyed-out
  preview. An empty testimonial carousel says "nobody uses this"; a hidden one
  says nothing, which is accurate.
- **Do not invent numbers.** No "4.5x more likely", no sample ratings, no
  filler statistics in mockups. Every figure on screen is derived from real
  rows and traceable to `lib/client-trust.ts` or an equivalent.
- **Do not upgrade "Phone on file" to "Phone verified."** We do not verify
  phone numbers. The wording is exact and deliberate.
- **Do not restyle the money-state semantics** (`DESIGN.md` §2, "Money states —
  semantic, and non-negotiable"). Held, released, disputed and pending each own
  a colour. Texture is yours; meaning is not.
- **Do not give the mobile hero a photograph.** Mobile ships no hero image at
  all and that is finished, not pending. Do not art-direct a mobile crop.
- **Card radius is 14px; controls are `rounded-md`** (§7). No
  rounded-everything.
- **Hairlines are `ink` at 18% opacity, never solid.** `ink` is `#1A1611`,
  never `#000`.
- **Copy that states a fact is not decoration.** Lines like "no work starts
  until the money is in" or "we never guess it from when you were last online"
  are commitments to the reader. Tighten the words; do not delete the claim.
- **Do not convert server components to client components for a visual
  effect.** The profile tabs, landing sections and trust block are all
  server-rendered on purpose.

## How to judge the work

`DESIGN.md` §4: **build → screenshot → critique against `DESIGN.md` → fix.**
Judge from a screenshot, never from the code. Every defect found in the
2026-08-12 landing-page session was invisible in the source and obvious in the
image.

## Known-good reference points

Settled. Match these rather than redesigning them:

- The proof row's restraint on the landing page.
- The peeking testimonial carousel's card width and gap.
- `CreativeCard` — reused on `/browse`, saved items and the landing page, so a
  change there lands in three places at once.
