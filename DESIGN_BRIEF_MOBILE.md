# Ganyu Hub — mobile UI brief

> **Authority: `design-system/CLAUDE.md` wins.** This brief exists for a run
> with no repo access. Where it disagrees with the Claude Design export, the
> export is right.

> **Status 2026-08-13:** the product is now feature-complete (all 79 planned
> items across Phases 0–9). If the design run CAN see the repo, use
> [`DESIGN_BRIEF.md`](DESIGN_BRIEF.md) — it carries the current surface
> inventory. This file remains the brief for a session working from
> screenshots alone. §6 has been corrected: several asks are already built.

For a design session that has no access to this repo. Everything a designer
needs in order to produce work that can actually be built here, plus the
patterns worth taking from Fiverr / Upwork / WhatsApp and the ones worth
refusing.

Source: 48 reference screenshots (22 iPhone 1290×2796, 26 desktop 1920×1032),
sampled 2026-08-08.

---

## 1. What Ganyu Hub is

A creative-services marketplace for Malawi. Clients post jobs, creatives bid,
money sits in escrow, the client releases it, the creative gets paid in MWK via
PayChangu (mobile money or bank). Currently closed beta.

The competitive point is **trust in a market where online payment is not
assumed to be safe**. That shapes everything: money state must always be
legible, and the app must not look like a foreign import.

## 2. Design language that already exists — do not replace

| Token | Value | Use |
|---|---|---|
| `brand.DEFAULT` | `#069494` | teal, primary actions |
| `brand.dark` | `#046B6B` | hover/active |
| `brand.ink` | `#1A1611` | body text |
| `ground` | `#FFFFFF` | the page ground, pure white |
| `raised` | `#F7F6F3` | cards, sheets, tab bar, sticky header |
| `band` | `#F2F1EE` | alternating sections |
| `inset` | `#F1F1F0` | recessed panels inside a card, always with a `#DCDCDC` hairline |
| `grey` | `#ECECEC` | the accent surface — stamp ground, empty-state panels |
| `brand.muted` | `#736A5C` | secondary text |

Type: **Inter, and nothing else.** Instrument Serif and IBM Plex Mono were both
removed on 2026-08-14. Figures that must align use `font-variant-numeric:
tabular-nums`, not a second face.

There is a **rubber-stamp motif** on the job header carrying money state. It is
the most distinctive thing in the product. Keep it.

**Updated 2026-08-14: cream is deleted, not demoted.** `#EFE6CE` read retro and
craft-fair; the target is modern. There is no cream in the system — the ground
is white, the raised surface off-white, the accent light grey. Because that step
is small, **separation is carried by shadow and hairline**, so the elevation
scale is load-bearing: three levels, soft, low-spread, warm ink at 4–12%, no
hard drop shadows, every level pairing a shadow with a hairline.

**What differentiates the product now is the rubber stamp**, not the palette —
supplied artwork, six states, heavy pressed ink. Teal is the only chromatic
accent and earns attention by being rare. Grey is a surface, not a colour.

## 3. Constraints a mockup must respect

- **Currency is MWK**, formatted with thousands separators, `en-GB` locale,
  `Africa/Blantyre` timezone. Amounts run 1,000–500,000. No `$`.
- **A job carries five money states**, and the UI must distinguish all five:
  no payment yet · payment pending · money in escrow · released to creative ·
  in dispute. Plus overlays for cancelled and deadline-extended.
- **Two roles** see different things. A creative does not post jobs; a client
  does not send proposals. Navigation must work for both without two apps.
- **Phone-first reality**: many users are on mid-range Android over mobile
  data. Heavy imagery and large webfonts cost real money to load.
- Existing breakpoints are Tailwind defaults; `md:` is the desktop switch.

## 4. Patterns to take from the references

**Bottom tab bar — 5 destinations, icon + label.** Universal across all three
references. Active state is a tinted shape behind the icon and label, not just
a colour change.

**No primary create action in the bar.** None of the three put "post"/"sell"
in the tab bar; Upwork keeps `+` in the header. The bar is for navigation.

**Avatar top-left opens a drawer** holding profile, settings, help, log out,
and the version number at the foot. This is where a crowded header goes on a
phone.

**Page title below the header, large and bold.** Then search. Then filter
chips or underline tabs. Consistent across all three references.

**Job card ordering** (Upwork, and it is good): meta row (badge · posted ·
proposal count) → title, link-coloured, truncated at 2 lines → one-line facts
(type · level · budget) → truncated description with "more" → skill chips →
trust row (payment verified ✓ · rating · spend · location).

**Floating filter pill**, bottom-right, above the bar.

## 5. Patterns to refuse

- **Their colour and iconography.** Structure yes, skin no.
- **Density for its own sake.** Upwork's cards carry ~9 facts. Ganyu's beta has
  far fewer jobs; the same density would look empty and anxious.
- **Illustrated empty states in a foreign style.** If an empty state needs art,
  it should come from the stamp/paper language.
- **US-market trust signals** ("Payment verified", "$500+ spent"). The
  equivalent here is escrow state and completed local jobs — invent the local
  version, don't translate theirs.

## 6. The specific asks

> **Updated 2026-08-13: 1 and 4 are now BUILT.** They were asks when this was
> written; they now exist in code and want *restyling*, not inventing. Design
> them as they are, or argue for a change — do not draw a different structure
> by accident.

1. **Bottom tab bar — built.** Four destinations plus Menu, and they are
   **role-aware**: `Home · Find work · Messages · My work · Menu` for a
   creative, `Home · Find someone · Messages · My work · Menu` for a client.
   Messages carries an unread count.
   **There is deliberately no create action in the bar** — a "+" between two
   tabs is what people hit by accident; posting a job is a header button. There
   is no Profile tab either; account lives in the drawer.
   Still wanted from you: active/inactive treatment, badge styling, and how the
   bar sits over a scrolled page. It already respects
   `env(safe-area-inset-bottom)` and the page reserves its height.
2. **Mobile job card** for the browse list, in at least two money states. The
   card now also carries a trust row ("Has paid into escrow · Hires 79% of the
   time · 28 jobs posted") and a dismiss control.
3. **Mobile job detail**, top third only: what is visible before any scroll.
   The money state and the primary action must both be above the fold.
4. **Drawer — built.** Grouped `Your work / Settings / Help` (plus `Admin` for
   admins), version number at the foot, opening from the Menu tab as a bottom
   sheet. Still wanted: the sheet's weight, group-heading treatment and row
   density.
5. **Seller sheet** (new, built). On a creative's profile a bar sits above the
   tab bar reading `<name> · From MWK 50,000 · Details`; tapping it opens a
   summary sheet. It contains **no form** — it links to the one real Message
   form. The two fixed bars stack and must never overlap.

Deliverables as images or self-contained HTML. Real MWK figures, real job
titles ("Logo for a Blantyre bakery", not "Lorem"), both roles represented.
