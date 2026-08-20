# Ganyu Hub — read this before any design work

Ganyu Hub is a creative-services marketplace for Malawi. Clients post jobs,
creatives bid, money sits in escrow until the client approves, payout is in MWK
over mobile money or bank. The product's job is **trust in a market where paying
a stranger online is not assumed to be safe.**

Most users are on **mid-range Android over paid mobile data**. Judge every screen
at **390px first** — a design that only works at 1440 is a design that does not
work. Nothing heavy.

---

## Live decisions

These supersede `uploads/DESIGN.md` and `uploads/DESIGN_BRIEF.md` wherever they
conflict. Those documents are the original rulebook and are now partly out of
date. **This file wins.**

### Surfaces — settled 14 Aug 2026

| | |
|---|---|
| Ground | **`#FFFFFF`** pure white |
| Raised | **`#F7F6F3`** off-white — cards, sheets, the bottom tab bar, sticky header |
| Band | `#F2F1EE` |
| Inset | `#F1F1F0` — recessed panels inside a card, **always with a `#DCDCDC` hairline** |
| Accent surface | **`#ECECEC`** light grey — the stamp ground, empty-state panels |
| Inverse | `#1A1611` ink |

The ground-to-raised step is small on purpose, so **separation is carried by
shadow and hairline, not by colour difference.**

**Cream `#EFE6CE` is deleted.** It is not a token, not a surface, not an accent.
The tokens `--gh-paper` and `--gh-wash` have been removed — use `--gh-ground`,
`--gh-raised`, `--gh-grey`. Earlier docs calling cream "the page background and
an asset to protect" are dead text.

### Type — settled 14 Aug 2026

**Inter is the only typeface on the site.** Page titles to body. Hierarchy comes
from weight and tracking, never from a change of face.

No exception: the stamp's lettering is part of its artwork, so it needs no second
webfont. Anton was loaded briefly for the coded stamp and is no longer used.

- Instrument Serif: **removed.**
- IBM Plex Mono: **removed.** Money, references and eyebrow labels are Inter with
  `font-variant-numeric: tabular-nums` — the alignment was always the point, not
  the monospace look.
- `--font-display` and `--font-mono` survive as aliases; both mean Inter.
- Page titles 30–44px at 600. Headings 21–26px at 600. Tracking tightens as size
  grows: −0.02em at 21px, −0.03em at 44px+.
- Landing hero: **"Malawian creatives." is not italic.**

### Colour

Teal `#069494` is the only chromatic accent (hover `#046B6B`). Ink `#1A1611` is a
warm near-black, never `#000`. Text hierarchy is ink at a percentage, not a second
grey. Reserved green `#2F5D3B` is for money-adjacent facts only — budget pills and
the verified badge.

**Hairlines are `#1A1611` at 18%, never solid black.**

### Elevation — three levels

0 flat on the ground, hairline only · 1 the card · 2 floats over the page (header,
tab bar, menus) · 3 covers the page (sheets, drawers, modals). Soft, low-spread,
warm ink at 4–12%. No hard drop shadows, nothing retro. A sheet rising from the
bottom throws its shadow upward. Every level pairs a shadow with a hairline.

### Geometry

Card radius **14px**. Controls 6px. Panels 8px. 8px spacing base. Touch targets
never below 44px. Content maxes at 1280px — margins grow, content does not.
768px is the shell switch.

---

## Hard rules

- **Currency is MWK with thousands separators.** `MWK 85,000`. Never a dollar
  sign. en-GB grouping, timezone Africa/Blantyre, tabular figures.
- **Five money states, all legible:** no payment yet · payment pending · in
  escrow · released · in dispute. Never collapse to grey.
- **Never show a zero, a dash or a placeholder where there is no data.** A section
  below its data threshold renders nothing at all. A creative below their first
  review reads "New · no reviews yet", never `0.0`.
- **Invent no ratings or statistics.** Use real content: "Logo for a Blantyre
  bakery", "MWK 85,000". No Lorem.
- **No create action in the bottom tab bar.**
- **Icons are Lucide, and only Lucide.** Never hand-draw an approximation — the
  system ships an `Icon` component and `components/core/Icon.prompt.md` carries
  the name mapping. The one deliberate exception is the six `StyleSwatch`
  drawings, which ship in the product; copy them, never redraw.
- **No emoji.** Two unicode exceptions ship: `♥ ♡` on the save button and `✦` in
  the hero badge.
- **Sentence case everywhere. No exclamation marks.**
- The mobile shell (tab bar, drawer, seller sheet) does not exist above md; the
  desktop shell (verb nav, icon rail) does not exist below it. **Build both.**

---

## Voice

Plain, second person, specific about money. Name the mechanism, not the feeling —
"Money is held in escrow", not "Shop with confidence". Always say who charges
what. Claim only what is true: the badge reads **"Checked by Ganyu Hub"**, never
"Verified professional".

Navigation is verbs. Creative: Find work · Deliver work · Get paid. Client: Find
someone · Manage work · Finances.

---

## The rubber stamp — settled 20 Aug 2026

The most distinctive element in the product, and the one thing that should be
memorable — everything else gets out of the way.

**It is a heavy, distressed, hand-pressed stamp, not a badge or a chip.** The
built form, in `templates/screen-templates/`:

- A circular double ring — heavy outer, thinner inner, clearly separated — with
  three small stars above and three below, and **"Ganyu Hub" arced** above and
  beneath.
- An angled rectangular label band crossing the circle, carrying the state. The
  band's interior is the ground it sits on, so it reads as paper showing through.
- The whole stamp tilted a few degrees; the band tilted again inside it.
- Text is heavy condensed uppercase — worn block letterpress.
- Sizes: **80px** in dense rows, **104px** on mobile, **148px** from md up.

**The stamps are supplied artwork, not drawn in code** — `assets/stamps/`, one
PNG per state, rendered by `MoneyStamp`. A sixth, `nothing-yet`, marks absence
and belongs to `EmptyState`; the five money stamps are never borrowed for it,
because they name stages of money and nothing has moved yet. Each carries "Ganyu Hub" arced around a
double ring, three stars each side, and the state on an angled label band. Worn
edges, uneven ink, every one different.

Never redraw, approximate, or substitute a chip, badge or dashed border. A coded
imitation was tried on 19 Aug and replaced by this artwork on 20 Aug.

The files are keyed **fully** transparent and cut to 512px, about a tenth of the
weight they arrived at. Any new stamp gets the same treatment before it ships — a
2MB stamp is the heaviest thing on the page and this product cannot afford one.

Two things that each put a visible box around a stamp, both fixed:

1. **The keying.** The source paper is off-white, not pure white, so a white
   point of 255 leaves the background at 1–2% alpha. Key against ~238 and floor
   anything under 6% to zero.
2. **A global `img { outline }` rule** in `tokens/base.css`. It existed to mount
   photographs, and it drew a hairline square around every transparent PNG —
   stamps and logo included. The outline is now opt-in via `.gh-mounted`, which
   only photographs carry. **Do not reinstate a global image outline.**

### Stamp ink colours

These are the money-state colours now. They replace the old amber/sky/emerald set.

| State | Ink |
|---|---|
| Nothing yet (empty states) | `#8C8C8C` grey |
| No payment yet | `#8C8C8C` grey |
| Payment pending | `#E9A23B` orange |
| In escrow | `#1D6E9E` blue |
| Released | `#1B9455` green |
| In dispute | `#C22A2A` red |

Label text is verbatim and uppercase: NO PAYMENT YET · PAYMENT PENDING ·
IN ESCROW · RELEASED · IN DISPUTE.

---

## Where things live

- `templates/screen-templates/ScreenTemplates.dc.html` — the five screen layouts
  every new mockup starts from, each at 390 and 1440: page shell, list page,
  detail page, cards, empty state. Start here.
- `components/` — 22 components in five groups, each with a `.d.ts` and a
  `.prompt.md` carrying the non-obvious rules.
- `tokens/` — the CSS custom properties. `styles.css` is the entry point.
- `guidelines/` — foundation specimen cards.
- `ui_kits/web` and `ui_kits/mobile` — click-through recreations.
- `readme.md` — the full design guide.

---

## Open

- Nothing outstanding on the stamps.
- `uploads/DESIGN.md` and `DESIGN_BRIEF.md` still contain the dead cream and
  three-face rules. They have not been edited — this file is the correction.

## Log

- **20 Aug 2026** — Removed the global `img { outline }` rule, which was drawing
  a hairline box around every stamp and the logo. Photographs opt in with
  `.gh-mounted`.
- **20 Aug 2026** — Sixth stamp `nothing-yet` added and wired into `EmptyState`,
  replacing the Lucide search circle. All six re-keyed against a 238 white point,
  which removed the faint box edge the first pass left around each PNG.
- **20 Aug 2026** — Stamp replaced with supplied artwork in `assets/stamps/`,
  keyed transparent and cut 2048px → 512px. `MoneyStamp` now renders the PNGs;
  the `--money-*` chip triples became one `--money-*-ink` per state. Empty
  states lost their stamp — they are not a stage of money. Anton dropped.
- **19 Aug 2026** — Stamp direction settled: heavy distressed pressed ink rather
  than a chip. Money-state colours changed to grey/orange/blue/green/red.
- **14 Aug 2026** — Ground changed cream → off-white, then off-white → white with
  off-white as the raised surface. Cream removed entirely; light grey is the
  accent. Instrument Serif and IBM Plex Mono removed; Inter is the only face.
  Elevation rebuilt as three levels. "Malawian creatives." set upright.
