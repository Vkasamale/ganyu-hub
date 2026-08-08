# Ganyu Hub — DESIGN.md

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

- A **warm paper ground** (`#EFE6CE`), not white, not grey, not dark
- **Deep teal** as the single accent — one colour, used with discipline
- **Instrument Serif** for display, used italic for emphasis; humane, printed,
  a little literary
- **IBM Plex Mono** for money and metadata — numbers should read as *recorded*,
  not decorative
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
| `paper` / `brand-paper` | `#EFE6CE` | Warm canvas |
| `brand-muted` | `#736A5C` | Secondary text, eyebrows |
| `wash` | `#DACFB2` | Deeper paper, for banding and inset areas |
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

| State | Label | Tone |
|---|---|---|
| `none` | Not funded yet | `border-ink/25 bg-paper text-ink/60` |
| `payment_pending` | Payment pending | amber-400 / amber-50 / amber-900 |
| `payment_held` | Held in escrow | sky-400 / sky-50 / sky-900 |
| `payment_released` | Released to creative | emerald-500 / emerald-50 / emerald-900 |
| `payment_disputed` | In dispute | red-400 / red-50 / red-900 |

⚠️ **Known inconsistency to resolve, not to copy:** `paper` is defined as the
canvas and `--background` is the warm HSL equivalent, but `html, body` is
currently hard-set to `#FFFFFF`. The warm ground is therefore *declared but not
shipped*. New work should sit on paper or on white cards over paper — decide
deliberately, do not inherit the accident.

---

## 3. Typography Rules

| Face | Variable | Use |
|---|---|---|
| **Inter** | `--font-inter` | UI, body, headings |
| **IBM Plex Mono** | `--font-plex-mono` | Money, eyebrows, references, metadata |
| **Instrument Serif** | `--font-instrument-serif` | Display, used **italic** for emphasis |

**Shipped rules**

- `h1,h2,h3`: weight **600**, `letter-spacing: -0.015em`, `text-wrap: balance`
- `p, li`: `text-wrap: pretty`
- `.eyebrow`: Plex Mono · `0.72rem` · `0.18em` tracking · uppercase · `#736A5C`
- `.price`: Plex Mono, `tabular-nums`, `ss01`, with a **teal `k` prefix** via
  `::before` — the MWK marker
- `.tabular-nums` / `[data-tabular]` for any aligned figures
- Font smoothing: antialiased, `optimizeLegibility`

**Money typography is a rule, not a preference.** Every MWK figure is Plex
Mono with tabular numerals. Amounts must align vertically in any column, and a
number must never reflow when it changes.

⚠️ **Second known inconsistency:** Tailwind's `font-display` maps to **Inter**,
while `--font-display` in CSS maps to **Instrument Serif**. Two different
answers to "what is display type". Instrument Serif is the intended display
face; the Tailwind mapping is the bug.

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
3. Use Plex Mono + tabular numerals for every MWK figure.
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
paper  #EFE6CE   wash  #DACFB2
rule   ink @ 18%
radius 14px cards · rounded-md controls
type   Inter · IBM Plex Mono (money) · Instrument Serif (display, italic)
money  MWK, en-GB, Africa/Blantyre, tabular Plex Mono
```

**Example prompts**

- "A job card on paper: hairline dividers, teal title, MWK in Plex Mono,
  money-state stamp at the right margin of the money line."
- "Mobile bottom tab bar, 5 destinations, icon + label, tinted active shape,
  safe-area padding."
- "Escrow panel: fee breakdown with `?` disclosure per line, primary button
  reading 'Fund escrow (MWK 20,000)'."

**Documented gaps — do not silently invent these**

- Body background is white while `paper` is the declared canvas (§2).
- `font-display` resolves to Inter in Tailwind, Instrument Serif in CSS (§3).
- The stamp's texture is unresolved; position is settled (§4).
- No dark mode exists. Do not add one uninvited.
- No ratings, reviews, testimonials, or verification badges exist yet — see
  `DESIGN_GAP_AUDIT.md` §P before designing anything that implies them.
