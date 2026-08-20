# Ganyu Hub — Design System

Ganyu Hub is a creative-services marketplace for Malawi. Clients post jobs,
creatives bid, the money sits in escrow until the client approves the work, and
payout runs in MWK over mobile money or bank.

The product's job is **trust in a market where paying a stranger online is not
assumed to be safe.** Every design decision serves that before it serves
beauty. The audience is mostly mid-range Android on paid data, so weight is a
design constraint, not an optimisation pass.

---

## Sources

Everything here was extracted from real code, not invented.

| Source | What it gave |
|---|---|
| `ganyu-design-handoff/` (attached codebase) | Every token value, ~90 components, both shells, page composition |
| `uploads/DESIGN.md` | The binding rulebook — colour roles, type, the stamp, elevation, do's and don'ts |
| `uploads/DESIGN_BRIEF.md` | Scope and the do-not-change list |
| `uploads/DESIGN_GAP_AUDIT.md` | Reasoning behind decisions (not a to-do list) |
| `uploads/DESIGN_BRIEF_MOBILE.md` | Mobile constraints |
| https://github.com/Vkasamale/ganyu-hub | `public/hero-photographer.webp`, the icon set, the logo files |

**If you have access, read the repo — it will make your work better than this
file can.** `components/` there is ground truth for anything abbreviated here,
and the file-level comments explain *why* each decision was made, which no
design system can carry for you. Start with `tailwind.config.ts`,
`app/globals.css`, `lib/nav.ts`, `lib/styles.ts`, `components/job-header.tsx`,
`components/creative-card.tsx`, `components/bottom-tab-bar.tsx`,
`components/home-hero.tsx`.

---

## Superseded rules — read this before DESIGN.md

The uploaded `DESIGN.md` and `DESIGN_BRIEF.md` are the original rulebook, and
two of their rules have since been overturned by the product owner. **Where they
conflict with this readme, this readme wins.**

| Rule in the documents | Current rule |
|---|---|
| Warm cream `#EFE6CE` is the page background and an asset to protect | **Dead.** Pure white `#FFFFFF` is the ground, off-white `#F7F6F3` is the raised surface, and light grey `#ECECEC` is the accent. Cream has been removed from the system entirely — it is not a token, not a surface, and not an accent. |
| Three faces: Instrument Serif, Inter, IBM Plex Mono | **Dead.** Inter is the only typeface on the site. Instrument Serif and IBM Plex Mono have both been removed. Money and references use Inter with `tabular-nums`. The token `--font-mono` survives as an alias and means Inter. |

The tokens `--gh-paper` and `--gh-wash` have been **removed** — use `--gh-ground`
(white), `--gh-raised` (off-white) or `--gh-grey` (the accent). `--font-display`
and `--font-mono` survive as aliases and both mean Inter.

Both decisions are now closed. `templates/screen-templates/` shows the current
state: white ground, off-white raised surfaces, light-grey accent, Inter throughout.

---

## The register

**Warm editorial, not startup SaaS.**

A pure white ground (`#FFFFFF`) with warm off-white (`#F7F6F3`) as the raised
surface, and light grey (`#ECECEC`) as the accent. Deep teal (`#069494`) is the
only chromatic accent, used sparingly. **Inter throughout** — hierarchy comes from
weight and tracking, not from a change of face.

The distinctive element is the rubber-stamp motif carrying money state: ink
pressed onto paper, not a badge. The brand mark is itself a stamp — dashed outer
ring, solid inner ring, a teal `G` in the middle. Everything else gets out of the
way so the stamp can be the thing people remember.

Because the ground-to-raised step is small, the work of separating surfaces falls
to shadow and hairline. That is the discipline that keeps a white-on-white product
from going flat, and it is what stops this reading as the generic marketplace
look: no gradient headers, no coloured section bands, no drop shadows.

---

## CONTENT FUNDAMENTALS

### Voice

Plain, second person, present tense, and specific about money. The product is
explaining an unfamiliar financial arrangement to people who have good reason to
be sceptical, so the copy is *concrete* rather than reassuring.

> "The client funds the job before work starts. We hold it. The creative gets
> paid when the work is approved — nobody has to trust a stranger."

> "Cash-out fees are charged by the payment provider, not Ganyu Hub — banks add
> a flat MWK 700 on top of the 3% both rails charge."

> "If something goes wrong, a human reads both sides and decides. Not a form,
> not a chatbot, not silence."

Three habits do most of the work:

1. **Name the mechanism, not the feeling.** "Money is held in escrow", not
   "Shop with confidence".
2. **Say who charges what.** Fees are always attributed. "Where did my money
   go?" is the question this product exists to prevent.
3. **Claim only what is true.** The verification badge reads **"Checked by
   Ganyu Hub"** — not "Verified professional", not "Trusted" — because we have
   checked an identity and a body of work, which is a claim about our process.

### Verbs, not nouns

Navigation and headings are phrased as what you get. The creative's nav reads
**Find work · Deliver work · Get paid**; the client's, **Find someone · Manage
work · Finances**. "Dashboard" is a word for the team, not for a tailor in
Blantyre.

Filters and scopes carry a whole sentence rather than a label, because "Creatives"
and "Jobs" mean nothing on a first visit: *"Search people — their work, prices
and reviews."*

### Casing, punctuation, numbers

- **Sentence case everywhere.** Titles, buttons, labels, tabs. No Title Case.
- **Uppercase only in the eyebrow role** (Plex Mono, 0.18em tracking) and the
  stamp label (0.16em) — and city lists get 0.32em: `BLANTYRE · LILONGWE · MZUZU`.
- **No exclamation marks.** Not one, anywhere.
- Middot `·` separates metadata: `2 days ago · Design`. En dash for ranges.
- Money is always `MWK 120,000` — en-GB grouping, timezone Africa/Blantyre, in
  tabular Plex Mono. Displayed figures carry a teal `k` marker from
  `.gh-price::before`; it is a pseudo-element, never typed.
- Dates spell out: *"14th of September 2026"*.
- Relative time for recency: *"2 days ago"*, *"6 hours ago"*.

### Zeros and absences

**Never a fabricated number, and never a zero standing in for nothing.** A
creative below their first review reads "New · no reviews yet", not `0.0`. A tab
with no items shows no count — a tab reading 0 is a tab you have already been
told not to press. A client-trust signal that cannot be computed is omitted, not
shown as "unknown". A budget that was left open reads "Budget: Open".

### Emoji and glyphs

**Effectively none.** Two exceptions ship, and neither is decorative: a `✦`
inside the hero badge ("Malawi's creative marketplace ✦"), and `♥ ♡` as the save
button's glyph. Everything else is a Lucide icon. Do not add emoji.

### Empty states

Two weights, chosen honestly. `prompt` — a whole surface with nothing in it —
gets a dashed panel, the `nothing-yet` stamp and a real way out. `quiet` — one empty region on a page
that is otherwise full — gets a line of text and at most a link. An empty
message thread needs no call to action; the reply box is right there.

---

## VISUAL FOUNDATIONS

### Colour

One accent. Teal `#069494` earns attention by being rare: primary buttons,
links, the active tab, the stamp ink. `#046B6B` on hover. Ink `#1A1611` is a warm
near-black and **never `#000`** — except in the hero's creative mode, which
inverts to true black deliberately.

**Text hierarchy is ink at a percentage, not a second grey.** 100 / 85 / 75 / 70
/ 65 / 60 / 55 / 45 / 25 / 18 / 10 / 5. `18%` is the hairline — every rule in the
product. `85%` is the avatar ground.

Two greens, and they do not mix: teal is the brand, `#2F5D3B` ("mark") is
reserved for money-adjacent facts — budget pills and the verified badge — and
nothing else.

**Three surfaces, no more.** The ground is off-white `#F7F6F3`; pure white is
anything raised off it — cards, sheets, the bottom tab bar, the sticky header;
light grey `#ECECEC` is the accent, carrying the stamp ground, empty-state panels and
insets inside cards, with `#F1F1F0` for those insets and `#F2F1EE` for bands.
The closing CTA stays solid ink.

The ground-to-card step is deliberately small, so **separation is carried by
shadow and hairline, not by the colour difference.** That is why the elevation
scale below is doing real work rather than decoration.

Money state is semantic and untouchable: five states, five colours — none (ink
outline on paper), pending (amber), held (sky), released (emerald), disputed
(red). Never grey. Job stages get their own five: sky → indigo → violet → amber
→ emerald.

### Type

**Inter is the only typeface.** One face from page titles to body, one webfont
request on a paid mobile connection. Hierarchy is carried by weight and tracking:

- Page titles **30–44px at 600**, tracking tightening as size grows — `-0.02em`
  at 21px through `-0.03em` at 44px and above. Inter needs that negative tracking
  at display sizes or it reads loose and generic.
- Headings **21–26px at 600**. Body **14px at 400**, long-form 16px. Labels 500.
- Italic is available for emphasis inside a title, used sparingly. The landing
  hero's "Malawian creatives." is **upright**.
- Money, references and counts use `font-variant-numeric: tabular-nums` so
  columns of figures align. That alignment was the only reason a monospace face
  was ever there.
- Eyebrow labels are Inter **600 uppercase at 0.16em** — a lighter weight
  disintegrates at that tracking.

Tailwind's steps only — 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48px. No
invented half-steps. `text-wrap: balance` on h1–h3, `pretty` on paragraphs.

Instrument Serif and IBM Plex Mono were both removed on 14 August 2026. The
tokens `--font-display` and `--font-mono` survive as aliases so older components
keep resolving; both mean Inter.

### Spacing and layout

8px base. Gutters 16px mobile / 32px desktop. Sections 56px / 80px. Card padding
16 (listing), 20 (job card), 24 (ui Card). Content maxes at 1280px and
**margins grow, content does not** — the feed at 1152px. 768px is the shell
switch; 1024px adds the sticky right rail. Touch targets never below 44px.

Fixed elements: the mobile tab bar (3.5rem plus safe area), the mobile sticky
action bar, the sticky desktop header, and the sticky filter/escrow rails. Pages
pad by `--tabbar-clearance` so nothing sits under the bar.

### Corners

Two answers on purpose: **6px** for controls (buttons, inputs, selects), **14–16px**
for cards, 8px for panels and sheets, 12px for the "ways in" tiles, pill for
chips, avatars and the stamp. Not rounded-everything — a control and a card are
different objects and should read that way.

### Borders and elevation

The hairline is `ink @ 18%`, and an editorial rule is preferred over a border box
wherever a divider will do. Cards carry a 6% border; fields a neutral `#D4D4D4`
that darkens to `#A3A3A3` on hover.

Three levels of depth, all warm and low-contrast, and every level pairs its
shadow with a hairline — on a small contrast step an edge reads before a shadow
does. **Level 0** is flat on the ground, hairline only: rows and dividers.
**Level 1** is the card, resting on the ground. **Level 2** floats over the page:
sticky header, bottom tab bar, menus, the sticky action bar. **Level 3** covers
the page: sheets, drawers, modals. A sheet rising from the bottom edge throws its
shadow **upward**. Never a hard drop shadow, nothing retro. The only heavy shadow
allowed is type sitting directly on a photograph.

Inner shadows are used once, as `inset 0 1px 0 rgba(26,22,17,0.06)` — a hairline
pressed under a control instead of a border.

### The stamp

The product's signature, and the one element meant to be memorable. It marks the
five stages a job's money passes through, and it is **supplied artwork rather
than code** — one PNG per state in `assets/stamps/`, rendered by `MoneyStamp`.

Each stamp is a double ring carrying "Ganyu Hub" arced above and below, three
stars each side, and the state on an angled label band whose interior is the
ground showing through. Worn edges, uneven ink, every one different. It sits on
the money figure's line at the card's right margin — 80px in dense rows, 104px on
mobile, 148px from md up — and the five inks are grey `#8C8C8C`, orange
`#E9A23B`, blue `#1D6E9E`, green `#1B9455`, red `#C22A2A`.

**Never redraw it, approximate it, or fall back to a chip, badge or dashed
border.** The wear is the whole point and it does not survive being imitated; a
coded version was tried and abandoned. The artwork is keyed to transparent so it
sits on any ground, and cut to 512px — roughly a tenth of the weight it arrived
at, which is the difference between a signature and the heaviest thing on the
page. Any new stamp gets the same treatment before it ships.

A sixth stamp, `nothing-yet`, marks absence and belongs to `EmptyState` — used
where a search returns nothing or a section has not been filled in yet. The five
money stamps are never borrowed for it, because they name stages of money and
nothing has started moving. The old wide 0.16em
tracking; `rotate(-6deg)` so it looks pressed rather than placed. **Judge it from
a rendered screenshot, never from markup.**

### Motion

Short, ease-out, physical. Nothing bounces. 100ms card hover lift (−2px), 150ms
controls, 200ms disclosures and the job card's teal edge wipe, 250ms hero theme
crossfade, 300ms cover-image scale to 1.03, 350ms save-heart pop to 1.3, 700ms
progress connectors filling with a 180ms-per-stage stagger. Carousels and rails
use `cubic-bezier(.32,.72,0,1)`; list entrances stagger 40–50ms per item.
`prefers-reduced-motion` is honoured globally.

**Hover** darkens or tints rather than fading: teal → teal-dark, ghost → a 4–6%
ink tint, outline → `#FAFAFA` with a darker border, listing cards lift 2px and
deepen their shadow. Links underline with a 4px offset. **Press** is always
`scale(0.97)` — the same physical acknowledgement the stamp motif implies.

### Transparency and blur

Sparingly, and only where something must sit over content: the sticky header,
the mobile tab bar and the sticky action bar are paper at 95% with an 8px
backdrop blur; the category pill over a card cover is paper at 95%; the drawer
scrim is ink at 40%. Nothing else is translucent — glass panels are not part of
this vocabulary.

### Imagery

Real work by real people: warm, unstyled, mid-shot, Malawian. Photographs carry
`.gh-mounted`, a 1px inset `ink @ 10%` outline, so they read as *mounted* rather
than floating. It is opt-in and only photographs take it — as a global `img` rule
it drew a hairline box around every transparent PNG, the stamps worst of all.
Cover crops are 4:3 on creative cards, 128px band on service cards.

Where a photograph carries type, the scrim is ink 75% → 35% left to right —
heaviest under the type, never pure black, and a protection gradient rather than
a capsule. The shipped home hero carries **no photograph at all**; the scrim
treatment lives in `hero-art.tsx`, kept in the repo but not mounted. The mobile
hero ships zero image bytes, which is a data-cost decision, not an omission.

A missing avatar is a teal radial gradient (`#069494 → #046B6B → #023939`) with
the initials in Inter at 600 — never a grey silhouette. A missing photo
should not look like a missing person.

### Backgrounds

Flat colour. No repeating patterns, no textures, no noise, no gradient
backgrounds — the two gradients in the system are the avatar fallback and the
hero scrim. Editorial banding (paper / wash-40%) does the work that a texture
would do elsewhere.

---

## ICONOGRAPHY

**Lucide, and only Lucide.** `lucide-react` is used throughout the product;
`components/nav-icons.tsx` is the single place that maps nav keys to icons, so
one destination can never wear two different icons in two shells.

There is no icon font, no sprite sheet, and no PNG icon set — icons are React
components at build time. For browser-only use, load the UMD build and use the
`Icon` wrapper:

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```
```jsx
<Icon name="Wallet" size={20} />
```

Sizes in use: **14px** inline with 11–12px text · **18px** drawer rows · **20px**
tab bar and toolbars · **24–28px** feature rows. Stroke **2** for UI, **1.5** for
large decorative. Icons take `currentColor` and inherit the row's ink opacity —
an icon is never a second colour beside its label.

The nav mapping the product ships: home→Home, search→Search,
message→MessageSquare, briefcase→Briefcase, inbox→Inbox, bookmark→Bookmark,
chart→ChartNoAxesColumn, folder→FolderOpen, list→List, user→User, shield→Shield,
wallet→Wallet, external→ExternalLink, help→CircleHelp, flag→Flag,
sparkle→Sparkles, settings→Settings, menu→Menu. Elsewhere: BadgeCheck
(verified), HandCoins (budget), ShieldCheck / Smartphone / Scale (value props),
ArrowRight (every "see all"), ChevronDown (disclosures).

**Hand-drawn SVG appears exactly once, deliberately:** the six visual-style
swatches in `StyleSwatch`. They are drawings of styles, not icons — no image
files, nothing to licence, nothing to download on a slow connection, and a swatch
can never be a photo of work nobody on the platform made. Those drawings ship in
the product; copy them, never redraw them.

**Unicode as icon:** only `♥ ♡` on the save button and `✦` in the hero badge.
**Emoji:** none.

---

## Index

### Root

- **`styles.css`** — the entry point consumers link. `@import` lines only.
- **`readme.md`** — this file.
- **`SKILL.md`** — Agent Skills front matter, for use in Claude Code.
- **`github.md`** — source-repo association and screen map.
- **`thumbnail.html`** — the homepage tile.

### `tokens/`

`fonts.css` (the three webfonts) · `colors.css` (brand, ink ladder, semantic
surfaces, five money states, five job stages, status accents) ·
`typography.css` (faces, scale, and `.gh-eyebrow` / `.gh-price` /
`.gh-hairline` ported verbatim from `globals.css`) · `spacing.css` (scale, radii,
layout maxima, mobile chrome, carousel geometry) · `elevation.css` (four levels,
image outline, hero scrim) · `motion.css` · `base.css` (resets, links,
reduced-motion).

### `components/` — 22 components in five groups

**core** — `Button` · `Input` · `Textarea` · `Select` · `Label` · `Badge` ·
`Card` (+ `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`,
`CardFooter`) · `Logo` · `Icon`

**money** — `MoneyStamp` (the artwork stamps) · `JobProgressBar` · `MoneyInput` · `PricingExplainer`

**listings** — `CreativeCard` · `JobCard` · `ServiceCard` · `FeedCarousel`
(+ `FeedCard`)

**navigation** — `BottomTabBar` (+ `NavDrawer`) · `PrimaryNav` · `PageTabs` ·
`StickyActionBar` · `SearchScope`

**trust** — `VerifiedBadge` · `Stars` · `StarRatingInput` · `SaveButton` ·
`EmptyState` · `TagInput` · `StyleSwatch` (+ `StyleChoices`)

Each has a sibling `.d.ts` (props contract) and `.prompt.md` (what & when, a
usage example, and the rules that are not obvious from the props).

**Intentional additions.** One: **`Icon`**. The product has no icon primitive
because React imports do that job (`nav-icons.tsx` maps nav keys to
`lucide-react` components); a browser-only design system needs a wrapper, so
this one renders Lucide from the UMD global. Everything else maps 1:1 to a
component in the codebase.

### `templates/`

- **`screen-templates/`** — the five reusable screen layouts every new mockup
  starts from, each built at **390 and 1440**: page shell, list page, detail page
  with the money header, the two cards, and the empty state. Also carries the
  five money stamps and the italic-vs-upright page-title comparison.

### `ui_kits/`

- **`web/`** — desktop recreation: the two-mode marketing hero, value props, how
  it works, proof rails, the ink closing CTA, browse with its sticky filter
  panel, the jobs list, and the job detail with its escrow rail. Fund → deliver
  → release advances the stamp and the tracker. See `ui_kits/web/README.md`.
- **`mobile/`** — the PWA shell at 390px: home feed, jobs, browse, job detail
  with the pinned action bar, messages, and the three-step post-a-job flow, with
  the grouped drawer. See `ui_kits/mobile/README.md`.
- **`data.js`** — illustrative content shared by both.

### `guidelines/` — 19 specimen cards

Colours (brand, ink ladder, surfaces, money states, job stages, status accents) ·
Type (display, body, mono, eyebrow, scale) · Spacing (scale, radii, layout) ·
Brand (elevation, motion, logo, iconography, imagery).

### `assets/`

| File | What it is |
|---|---|
| `logo-g.png` | The stamp mark — teal `G`, dashed outer ring. The origin of the stamp motif. Carries a small "Ai" watermark in the source file. |
| `stamps/*.png` | Six stamps. Five money states — `no-payment-yet`, `payment-pending`, `in-escrow`, `released`, `in-dispute` — rendered by `MoneyStamp`, plus `nothing-yet` for `EmptyState`. Keyed fully transparent, 512px, watermark removed. |
| `ganyu-hub-lockup.png` | Full lockup: mark + "Ganyu" in dark serif + "Hub" in teal italic serif |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | PWA icons |
| `hero-photographer.webp` | The hero photograph (58 KB) from `hero-art.tsx` — present in the repo, not mounted in the shipped hero |

---

## Quick reference

```
teal   #069494   hover #046B6B
ink    #1A1611   muted #736A5C
ground #FFFFFF   raised #F7F6F3   grey #ECECEC
mark   #2F5D3B   (reserved green, money-adjacent only)
rule   ink @ 18%
radius 14px cards · 6px controls
type   Inter only · tabular-nums for money
money  MWK, en-GB, Africa/Blantyre, Inter tabular, teal k marker
press  active:scale(0.97) · 150ms ease-out
icons  Lucide, stroke 2 (UI) / 1.5 (large)
```

---

## Caveats

- **No font binaries.** Inter is loaded from Google Fonts in `tokens/fonts.css`.
  If you want it self-hosted, drop the files in `assets/fonts/` and replace that
  import with real `@font-face` rules.
- The logo files carry small watermarks from the source artwork. Clean vector
  originals would be better if you have them.
- The category list in the UI kits is a plausible subset; the real one lives in
  `lib/types.ts`.
