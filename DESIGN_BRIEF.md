# Design brief — the run is now unblocked

> **Authority: [`design-system/CLAUDE.md`](design-system/CLAUDE.md) wins.** The
> Claude Design export in [`design-system/`](design-system/) is the live source
> of truth. This brief was written before it existed; where the two disagree,
> the export is right.

> **Status 2026-08-13: all 79 items across Phases 0–9 are built.** The founder's
> call was to run design **once, after every phase**, trading early visual
> feedback for never designing a surface twice. That has now happened. Nothing
> structural is scheduled after this run, so **every surface is safe to compose,
> not just style.**
>
> The 2026-08-12 run was terminated because the brief described a product that
> no longer existed. This file was rewritten from the code on 2026-08-13.

Read with [`DESIGN.md`](DESIGN.md) — that is the binding rulebook. This brief
says what to work on and what not to touch. Where they disagree, `DESIGN.md`
wins.

---

## Before starting

The work is on branch **`claude/next-session-8450b2`**, pushed. `main` is far
behind and designing against it would repeat the 2026-08-12 mistake. Point the
run at that branch, or merge it to `main` first.

## The split rule

**We build anything needing a table, a column, a query, a route or a form
field. Design polishes.** Structure shipped first; finish ships now.

---

## What exists (the surface inventory)

Next.js App Router, Tailwind, server components by default. Everything below is
live and populated with real seed data.

**Public**
- `/` signed out — the landing page. 11 of 11 sections.
- `/c/<slug>` — 24 category landing pages ("Get a logo, poster or menu
  designed" as the H1, category as subtitle).
- `/browse`, `/jobs` — listings with a filter bar, and a **search scope
  selector** above it (two cards, each with a sentence).
- `/creatives/<id>` — profile: hero, tabs, rate card, portfolio grid, reviews,
  testimonials, "Get to know <name>" at the foot.
- `/creatives/<id>/portfolio/<id>` — **full-bleed media carousel** with a
  "1 of 20" counter.
- `/jobs/<id>` — job detail: money header, progress bar, brief (markdown),
  "About the client", "Activity on this job", proposals.
- `/how-money-works`, `/release-notes`, legal pages.

**Signed in**
- `/` — **the home feed.** "Since you were last here" (unread notifications,
  unread messages, live jobs and whose move each is), then two action cards,
  then a For You carousel, then "Pick up where you left off".
- `/dashboard` — **numbers only.** Stats, profile insights, 6-month chart,
  escrow donut, active-jobs table.
- `/dashboard/*` — jobs, proposals, saved, portfolio, services, payments,
  profile, account, testimonials.
- `/messages` + `/messages/<id>` — thread list with a **desktop icon rail**,
  attachment cards, read receipts.
- `/jobs/new` — **three-step wizard** with a live preview.
- `/admin/*` — internal.

**Shell**
- Mobile: **bottom tab bar** (4 destinations + Menu, no create action) and a
  **grouped drawer** (Your work / Settings / Help, version at the foot).
- Desktop: **verb nav** (Find work / Deliver work / Get paid — or Find someone /
  Manage work / Finances), settings gear, avatar menu.
- Every page: **pre-footer** (ways-in cards + trust cards) then the footer.

**Components most worth your attention** — each is reused, so a change lands
in several places at once:
`creative-card`, `job-card`, `service-card`, `feed-carousel`, `page-tabs`,
`empty-state`, `pre-footer`, `bottom-tab-bar`, `media-carousel`, `seller-sheet`,
`get-to-know`, `verified-badge`, `style-swatch`, `job-wizard`, `rich-text`.

---

## In scope

Everything. Specifically the unfinished visual decisions:

- ~~**The paper-vs-white inconsistency**~~ **Closed 2026-08-14.** Pure white
  `#FFFFFF` is the page ground, off-white `#F7F6F3` is the raised surface,
  light grey `#ECECEC` is the accent. **Cream `#EFE6CE` is deleted from the
  system**, along with `#DACFB2` and the `paper` / `wash` tokens. The
  ground-to-raised step is small on purpose, so separation is carried by shadow
  and hairline. **Porting it into the code is still outstanding.**
- ~~**The `font-display` conflict**~~ **Closed 2026-08-14. Inter is the only
  typeface.** Instrument Serif and IBM Plex Mono are both removed; money and
  eyebrows are Inter with `font-variant-numeric: tabular-nums`. Hierarchy comes
  from weight and tracking, never from a change of face.
- ~~**Stamp texture**~~ **Closed 2026-08-20.** The stamp is supplied artwork,
  six PNGs in `design-system/assets/stamps/` rendered by `MoneyStamp`. Never
  redraw or approximate it.
- **Shadows and elevation** (§6), **type scale**, **card composition**,
  **motion**.
- **The new Phase 7–9 surfaces**, which have had no design pass at all: the tab
  bar, the drawer, the icon rail, the seller sheet, the wizard's step rail, the
  style swatches.

---

## Do not change

Each is a decision with a reason, several expensive to reach.

- **Never render a zero, a dash, or a placeholder where we have no data**
  (§Q7). Sections below their data threshold render *nothing*. Do not
  "improve" a hidden section with a skeleton, a sample card or a greyed
  preview. An empty testimonial row says "nobody uses this"; a hidden one says
  nothing, which is accurate. This is why the media carousel shows no counter
  at one image, the save count hides below 3, and tabs hide a count of 0.
- **Do not invent numbers.** No sample ratings, no filler statistics, no
  "4.5x more likely". Every figure on screen traces to a real row.
- **Do not upgrade "Phone on file" to "Phone verified."** We do not verify
  phone numbers.
- **Do not reword the trust badge.** It says "Checked by Ganyu Hub" — a claim
  about our process, not a guarantee about someone's conduct. Not "Verified
  professional", not "Trusted".
- **One live action per surface.** The mobile seller sheet and the escrow bar
  contain **no forms** — they link to the single real form. Two live submits
  for one payment is how double-charges happen.
- **No create action in the bottom tab bar.** A "+" between two tabs is what
  people hit by accident.
- **One filter control per breakpoint.** The messages icon rail replaces the
  chips above `md`; they never both show.
- **Do not restyle the money-state semantics** (`DESIGN.md` §2). Held,
  released, disputed and pending each own a colour. Texture is yours; meaning
  is not.
- **Do not give the mobile hero a photograph.** Mobile ships no hero image and
  that is finished, not pending.
- **Card radius is 14px; controls are `rounded-md`** (§7).
- **Hairlines are `ink` at 18% opacity, never solid.** `ink` is `#1A1611`,
  never `#000`.
- **Style swatches are inline SVG, not images.** Six of them, drawn in code, so
  nothing loads on a Malawian mobile connection and no swatch can be a photo of
  work nobody here made. Restyle the shapes; do not replace them with assets.
- **Copy that states a fact is not decoration.** "No work starts until the
  money is in", "we never guess it from when you were last online" — tighten
  the words, keep the claim.
- **Do not convert server components to client components for a visual
  effect.** Profile tabs, landing sections, the trust block and the pre-footer
  are server-rendered on purpose.

---

## How to judge the work

`DESIGN.md` §4: **build → screenshot → critique against `DESIGN.md` → fix.**
Judge from a screenshot, never from the code. Every defect found in the
2026-08-12 session was invisible in the source and obvious in the image.

Check both breakpoints. The mobile shell (tab bar, drawer, seller sheet) does
not exist above `md`, and the desktop shell (verb nav, icon rail) does not
exist below it — a screenshot at one width shows you half the product.

## Known-good reference points

Settled. Match these rather than redesigning them:

- The proof row's restraint on the landing page.
- The peeking carousel's card width and gap — the peek is a requirement, not a
  style choice (§Q8).
- `CreativeCard` — reused on `/browse`, saved items, the home feed and the
  landing page, so one change lands in four places.
