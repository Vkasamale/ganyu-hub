# Ganyu Hub — DESIGN.md

> **Authority: [`design-system/CLAUDE.md`](design-system/CLAUDE.md) wins.**
> The Claude Design system export lives in [`design-system/`](design-system/)
> and is the live source of truth for colour, type, elevation, geometry and the
> stamp. Where this file disagrees with it, this file is wrong. The sections
> below were corrected against the export of 2026-08-20; anything not corrected
> should be checked against `design-system/tokens/` before it is trusted.

Design system rulebook. Read this before generating or changing any UI.

Values here are **extracted from the running codebase**, not invented:
`tailwind.config.ts`, `app/globals.css`, `components/ui/button.tsx`,
`components/job-header.tsx`. Where a rule is aspirational rather than shipped,
it says so.

Structure follows the Mastercard DESIGN.md outline (warm cream canvas,
editorial warmth) from `voltagent/awesome-design-md`. **The structure is
borrowed. Every value is ours.**

Companions: `DESIGN_BRIEF_MOBILE.md` (constraints for external designers) ·
`DESIGN_GAP_AUDIT.md` (what the product is missing, with evidence).

---

## 1. Visual Theme & Atmosphere

Ganyu Hub is a creative-services marketplace for Malawi. Clients post jobs,
creatives bid, money sits in escrow until the client releases it, and payout
runs in MWK over mobile money or bank.

The product's job is **trust in a market where paying a stranger online is not
assumed to be safe.** Every design decision serves that before it serves
beauty.

**The register: warm editorial, not startup SaaS.**

- **Pure white** (`#FFFFFF`) is the page ground; **off-white** `#F7F6F3` is
  the raised surface. Light grey `#ECECEC` is the accent. **Cream is deleted**
- **Deep teal** as the single accent — one colour, used with discipline
- **Inter is the only typeface.** Hierarchy comes from weight and tracking,
  never from a change of face. Money uses Inter's tabular figures — the
  alignment was always the point, not the monospace look
- A **rubber-stamp motif** carrying money state — the most distinctive device
  in the product. Ink on paper, not a badge.

**What this is not.** Not a Fiverr clone, not a dark-mode dev tool, not a
neon fintech. If a design lands on white-plus-green with rounded cards and a
sans-serif headline, it has failed, however polished it looks.

**Why it matters commercially.** Looking local and considered is an asset in a
market where the alternative is a foreign platform that does not take MWK. Do
not trade it away for familiarity.

---

## 2. Color Palette & Roles

### Brand

| Token | Hex | Role |
|---|---|---|
| `brand` / `stamp` | `#069494` | Primary action, links, the stamp ink |
| `brand-dark` / `stamp-dark` | `#046B6B` | Hover / pressed |
| `ink` / `brand-ink` | `#1A1611` | Body text, rules. Warm near-black — **never** `#000` |
| `ground` / `--gh-ground` | `#FFFFFF` | The page ground. Pure white |
| `raised` / `--gh-raised` | `#F7F6F3` | Raised off the ground — cards, sheets, the tab bar, sticky header |
| `band` / `--gh-ground-2` | `#F2F1EE` | One step deeper — alternating sections |
| `inset` / `--gh-grey-soft` | `#F1F1F0` | Recessed panels inside a card. **Always with a `#DCDCDC` hairline** |
| `grey` / `--gh-grey` | `#ECECEC` | The accent surface — stamp ground, empty-state panels |
| `brand-muted` | `#736A5C` | Secondary text, eyebrows |
| `inverse` | `#1A1611` | Ink. Closing CTA, dark blocks |
| `mark` | `#2F5D3B` | Reserved green accent. Use sparingly |
| `rule` | `#1A1611` | Hairlines — always at **18% opacity**, never solid |

### CSS variables (HSL, `app/globals.css`)

```
--background 43 33% 94%   --foreground 0 14% 17%
--primary    180 92% 30%  --primary-foreground 0 0% 100%
--secondary  43 20% 88%   --muted 43 20% 88%
--muted-foreground 0 5% 45%
--border     43 15% 82%   --ring 180 92% 30%
--radius     0.5rem
```

### Money states — semantic, and non-negotiable

Five states, five distinct colours. Rendered as the stamp in
`components/job-header.tsx`. **Never collapse these to grey.** Grey reads as
"nothing changed", and these are the five most consequential facts in the
product.

The five states are **supplied stamp artwork**, not coded chips — one PNG per
state in `design-system/assets/stamps/`, rendered by `MoneyStamp`. The
amber / sky / emerald chip triples were replaced on 2026-08-20. The inks below
exist so anything sitting *next to* a stamp can match it.

| State | Stamp label | Ink |
|---|---|---|
| `none` | NO PAYMENT YET | `#8C8C8C` grey |
| `payment_pending` | PAYMENT PENDING | `#E9A23B` orange |
| `payment_held` | IN ESCROW | `#1D6E9E` blue |
| `payment_released` | RELEASED | `#1B9455` green |
| `payment_disputed` | IN DISPUTE | `#C22A2A` red |

A **sixth stamp, `nothing-yet`** (`#8C8C8C`), marks absence and belongs to
`EmptyState`. The five money stamps are never borrowed for it — they name
stages of money, and nothing has moved yet.

### Ground vs raised — settled 2026-08-14

**Cream `#EFE6CE` is deleted.** Not demoted, not an accent — removed from the
system, along with `#DACFB2` and the `paper` / `wash` tokens. Any text calling
cream "the page background and an asset to protect" is dead.

Pure white is the ground, off-white `#F7F6F3` is the raised surface, light grey
`#ECECEC` is the accent. The ground-to-raised step is deliberately small, so
**separation is carried by shadow and hairline, not by the colour difference.**
The elevation scale in §6 is therefore load-bearing: three levels, soft and
low-spread, warm ink at 4–12%, no hard drop shadows, every level pairing a
shadow with a hairline.

⚠️ **Not yet repainted in code.** `tailwind.config.ts`, `app/globals.css` and
`app/manifest.ts` still ship the cream palette. Canonical values are in
[`design-system/tokens/colors.css`](design-system/tokens/colors.css) — port
from there, not from this table.

---

## 3. Typography Rules

**Inter is the only typeface** (settled 2026-08-14). Page titles to body.
Hierarchy comes from weight and tracking, never from a change of face — one
font file is also one download on a paid mobile connection.

- **Instrument Serif: removed.**
- **IBM Plex Mono: removed.** Money, references and eyebrow labels are Inter
  with `font-variant-numeric: tabular-nums`.
- `--font-display` and `--font-mono` survive as aliases; both mean Inter.
- Page titles 30–44px at 600. Headings 21–26px at 600. Tracking tightens as
  size grows: −0.02em at 21px, −0.03em at 44px+.
- Landing hero: **"Malawian creatives." is not italic.**

**Shipped rules**

- `h1,h2,h3`: weight **600**, `letter-spacing: -0.015em`, `text-wrap: balance`
- `p, li`: `text-wrap: pretty`
- `.eyebrow`: `0.72rem` · `0.18em` tracking · uppercase · `#736A5C`
- `.price`: `tabular-nums`, `ss01`, with a **teal `k` prefix** via `::before` —
  the MWK marker
- `.tabular-nums` / `[data-tabular]` for any aligned figures
- Font smoothing: antialiased, `optimizeLegibility`

**Money typography is a rule, not a preference.** Every MWK figure uses
tabular numerals. Amounts must align vertically in any column, and a
number must never reflow when it changes.

The old `font-display` conflict is dissolved rather than resolved: both
mappings now mean Inter.

**Locale is fixed.** `en-GB`, `Africa/Blantyre`. Currency is MWK with thousands
separators, no `$`, typical range 1,000–500,000. Formatters are pinned in
`lib/utils.ts` — never format dates or money inline.

---

## 4. Component Stylings

### Buttons (`components/ui/button.tsx`)

- Radius `rounded-md`; sizes `h-9` / `h-10` / `h-11`
- Transition: background, shadow, transform, colour · **150ms ease-out**
- Press: `active:scale-[0.97]` — a physical, stamp-like acknowledgement
- Focus: `ring-2 ring-brand` with `ring-offset-2` on **paper**
- Variants: `default` (teal, white text) · `outline` · `ghost` · `link`

**Rule from the reference audit (§N4): when a button moves money, the amount
goes on the button.** `Fund escrow (MWK 20,000)`, not `Continue`. This is the
cheapest defence against the misunderstanding that becomes a dispute.

### Cards

- `.card-soft`: white · radius **14px** · `1px rgba(0,0,0,0.06)` border ·
  two-layer shadow (`0 2px 8px /6%` + `0 12px 24px /4%`)
- `--shadow-dashboard` for raised surfaces:
  `0 25px 80px -12px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)`

### Rules and images

- `.hairline`: 1px, ink at **18%** — the editorial divider. Prefer a hairline
  over a border box.
- `img`: `outline: 1px solid rgba(26,22,17,0.10)` inset. Every image is
  *mounted*, never floating.

### The stamp

The money-state stamp is the product's signature. Current direction, from
founder feedback:

- Sits **on the money's line**, at the card's right margin, larger than a badge
- Wants to read as **ink pressed onto paper**: rules **above and below** the
  text (not flanking, which reads as strike-through), a heavier outer ring
  visibly separated from the inner, wide tracking, possibly a dashed outer ring
  suggesting ink bleed
- **Judge it from a screenshot, never from markup.**

---

## 5. Layout Principles

- **8px base unit.** Tailwind's default scale; do not invent half-steps.
- Content max width **1280px** (`max-w-7xl`); reading columns narrower.
- `md:` is the desktop switch. Mobile is the default, not the fallback.
- **Mobile shell (to build):** bottom tab bar, 5 destinations, icon + label,
  active state = a tinted shape behind icon *and* label. No create action in
  the bar. Body needs bottom padding plus `env(safe-area-inset-bottom)`.
- **Installed as a PWA there is no browser back button.** Every screen must be
  escapable from within the UI.
- Page pattern: header → large title → search → filter chips → content.

---

## 6. Depth & Elevation

Four levels. Warm, low-contrast shadows — never hard drop shadows, never pure
black.

| Level | Use | Value |
|---|---|---|
| 0 | Flat on paper | none, separated by hairline |
| 1 | Card | `.card-soft` two-layer |
| 2 | Raised panel | `--shadow-dashboard` |
| 3 | Sticky bar / sheet | Level 2 + a top hairline |

**Sticky surfaces are structural, not decorative.** Mobile: a bottom action bar
holding the primary action. Desktop: the money/action card sticks in the right
rail. In both cases the money and the action must never scroll out of view.

---

## 7. Do's and Don'ts

**Do**

1. Put the amount on any button that moves money.
2. Give each of the five money states its own colour.
3. Use tabular numerals for every MWK figure.
4. Use hairlines at 18% ink instead of boxed borders.
5. Keep one accent. Teal earns attention by being rare.
6. Write empty states with a reason and a route — "Talent are hired 9x more
   often with a portfolio" beats "No items".
7. Label unverified claims honestly ("Self-reported").
8. Explain fees inline with a `?`, at the point the number appears.
9. Preserve authors' paragraph breaks (`whitespace-pre-line`) in briefs.
10. Keep touch targets ≥ 44×44px.
11. Honour `prefers-reduced-motion` — already globally handled.
12. Judge the stamp, and any texture work, from a rendered screenshot.

**Don't**

1. Don't use pure white `#FFF` as a *brand* surface or pure black `#000` ever.
2. Don't add a second accent colour to create emphasis — use weight and space.
3. Don't render money in a proportional face.
4. Don't grey out a money state.
5. Don't let the primary action scroll away.
6. Don't introduce rounded-everything: 14px cards, `rounded-md` controls.
7. Don't use flags or foreign trust signals ("Payment verified", "$500+
   spent"). The local equivalents are escrow state and completed local jobs.
8. Don't collapse a fee into a single figure without disclosing its parts.

---

## 8. Responsive Behavior

| Breakpoint | Shell | Notes |
|---|---|---|
| < 768 (mobile) | Bottom tab bar; slim header (logo + bell); sticky action bar | Default. Many users on mid-range Android over paid mobile data — imagery and webfonts cost them money |
| `md:` 768+ | Top navbar returns; browse links and "Post a job" reappear (`hidden md:flex`) | |
| `lg:` 1024+ | Two-column: content + sticky right rail (money/action card) | |
| `xl:` 1280+ | Max width caps; margins grow, content does not | |

Standalone PWA: respect `env(safe-area-inset-bottom)`; assume no browser
chrome and no back button.

---

## 9. Agent Prompt Guide

**Quick reference**

```
teal   #069494   hover #046B6B
ink    #1A1611   muted #736A5C
ground #FFFFFF   raised #F7F6F3   band #F2F1EE
inset  #F1F1F0   grey accent #ECECEC (+ #DCDCDC edge)
rule   ink @ 18%
radius 14px cards · rounded-md controls
type   Inter only · tabular-nums for money
money  MWK, en-GB, Africa/Blantyre, tabular figures
```

**Example prompts**

- "A job card: off-white #F7F6F3 raised on the white ground, hairline dividers, teal title, MWK in tabular figures,
  money-state stamp at the right margin of the money line."
- "Mobile bottom tab bar, 5 destinations, icon + label, tinted active shape,
  safe-area padding."
- "Escrow panel: fee breakdown with `?` disclosure per line, primary button
  reading 'Fund escrow (MWK 20,000)'."

**Documented gaps — do not silently invent these**

- Body background is white while `paper` is the declared canvas (§2).
- `font-display` and `font-mono` are both aliases for Inter (§3).
- The stamp's texture is unresolved; position is settled (§4).
- No dark mode exists. Do not add one uninvited.
- Ratings and reviews **do** exist (`reviews` table, shipped 2026-07-03) but
  are single-axis with no response mechanism. Testimonials and verification
  badges do not exist at all. See `DESIGN_GAP_AUDIT.md` §P and
  `IMPLEMENTATION_PLAN.md` Phase 4 before designing anything that implies them.

---

## 10. Imagery

Added 2026-08-12 from `DESIGN_GAP_AUDIT.md` §Q. Until now this document had no
photography rules at all, which is why the landing page has no photography.

### The hero photograph is a desktop concern

Fiverr ships **no hero image at all on mobile** — a flat brand-coloured band
with the headline and search. Upwork keeps one but darkens it until it reads
as a dark ground. See `DESIGN_GAP_AUDIT.md` §Q8.

So: **photo on `md:` and up, flat band below.** Do not art-direct a mobile
crop — replace the element. Given Malawian data costs this is the better
answer anyway, not a compromise: **the mobile hero ships zero image bytes.**

### The construction

A hero photograph is **a dark ground, not a picture**. Type sits on it and must
win.

- Full-bleed, edge to edge, no rounded corners at the hero
- **Scrim is mandatory**: a linear gradient from ~`rgba(26,22,17,0.75)` at the
  type side to ~`0.35` at the far edge. Ink, never pure black — the same warm
  near-black as `ink`
- Body copy over image must still clear **4.5:1**. Measure it, do not eyeball
  it
- Left third stays quiet — the headline lives there
- The search field sits **on** the image, not below it

### Choosing a photograph

The references work because of what they refuse, not what they show.

**Required**

1. **No eye contact.** Nobody looking at the camera
2. **Face partial or absent.** Over the shoulder, side-on, from behind, or
   hands only
3. **A real space** — visible clutter, real walls, natural light
4. **Mid-action.** Hands on a keyboard, adjusting a light, holding a camera
5. **Already dark.** A bright photo fights the scrim; a moody one absorbs it
6. **Wide, with dead space** where the headline goes

**Forbidden**

- Posed studio shots, smiling-at-camera, "diverse team high-fiving"
- Stock photos of hands receiving things, or any donor/NGO visual grammar —
  see §1 anti-references. Malawian identity is carried by the product and the
  people on it
- Chitenje pattern or landmark photography as an identity crutch. Spice, not
  structure
- **A location that is not Malawi.** Foreign signage, wrong architecture, a
  Lagos or Nairobi skyline. Users will clock it instantly and it undoes the
  entire "Malawian by default" claim

**When in doubt, go tighter and more abstract.** Hands, a desk, a camera body,
a screen. No visible location cannot be the wrong location.

### Provenance, in preference order

1. **Commission a beta photographer through the platform.** The only option
   that cannot be told from the real thing, because it is. It is a completed
   job, real GMV, a case study, and hero art at once — and "every photograph
   here was taken by someone we hired on this platform" is a line neither
   reference can say
2. Portraits and work from creatives already onboarded, with permission
3. Objects, not people — a printed poster, a lit studio setup, tools on a
   desk. The safe interim: no model release needed, no location to get wrong
4. Licensed stock, last resort. Commercial use, no attribution in-page, model
   release for any identifiable face

### Weight — a hard constraint, not a preference

Many users are on mid-range Android over paid mobile data. Fiverr ships a
1.4 MB hero. **We do not.**

- AVIF with a WebP fallback
- Responsive `srcset`, real breakpoints, art-directed crop on mobile
- LQIP blur placeholder
- `priority` on the hero image **only** — everything below the fold lazy-loads
- Budget: **≤160 KB** for the desktop hero. **0 KB on mobile** — there is no
  mobile hero image (see above)

### Treatment elsewhere

- Every image keeps the `img` outline from §4 — 1px ink at 10%. Images are
  *mounted*, never floating
- Portfolio and case-study images are the creative's work, shown honestly: no
  crop that changes the composition, no filter, no duotone
- Decorative imagery is optional by design — the layout must not collapse when
  it fails to load

### Judge from a screenshot

Same rule as the stamp (§4). A photograph plus a scrim plus white type cannot
be evaluated from markup. Render it and look.
