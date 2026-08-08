# Ganyu Hub — mobile UI brief

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
| `brand.paper` | `#EFE6CE` | warm background |
| `brand.muted` | `#736A5C` | secondary text |

Type: **Inter** (sans/UI), **IBM Plex Mono** (numerals, refs), **Instrument
Serif** (display headings, used italic for emphasis).

There is a **rubber-stamp motif** on the job header carrying money state. It is
the most distinctive thing in the product. Keep it.

**This palette is an asset, not a placeholder.** Paper-and-teal with a serif
display face reads local and considered; it does not read as a Fiverr clone.
Any direction that arrives at white-plus-green has thrown away the one thing
that differentiates the product visually.

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

1. **Bottom tab bar.** 5 destinations for each role. Proposal: Home ·
   Browse · Messages · Jobs · Profile. Show active/inactive, badge counts, and
   how it sits over a scrolled page. Must survive `env(safe-area-inset-bottom)`
   on iOS and the absence of a browser back button when installed as a PWA.
2. **Mobile job card** for the browse list, in at least two money states.
3. **Mobile job detail**, top third only: what is visible before any scroll.
   The money state and the primary action must both be above the fold.
4. **Header + drawer** on mobile: what stays in the top bar, what moves into
   the drawer.

Deliverables as images or self-contained HTML. Real MWK figures, real job
titles ("Logo for a Blantyre bakery", not "Lorem"), both roles represented.
