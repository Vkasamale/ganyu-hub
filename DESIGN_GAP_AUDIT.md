# Gap audit — Fiverr / Upwork / WhatsApp vs Ganyu Hub

What the references have that we don't. Working notes, built screenshot by
screenshot. Companion to `DESIGN_BRIEF_MOBILE.md` (which is the outward brief);
this file is the inventory of missing flesh.

Reference set: 48 screenshots, 2026-08-08. Progress marked below.

---

## Reviewed so far

`IMG_2956` WhatsApp chats · `IMG_2957` Upwork messages (empty) ·
`IMG_2958` Upwork jobs list · `IMG_2959` Upwork proposals ·
`IMG_2960` Upwork drawer · `IMG_2961` Fiverr home · `IMG_2962` Fiverr home
scrolled · `IMG_2964` Fiverr categories

---

## A. Navigation shell

| Pattern | Them | Us |
|---|---|---|
| Bottom tab bar, 5 destinations | all three | **missing** |
| Avatar top-left → full drawer | Upwork | partial — `UserMenu` dropdown, desktop-shaped |
| Settings gear in header | Upwork | missing |
| Page title below header, large | all three | inconsistent |
| Sub-tabs under title (underline) | Upwork: Active/Referrals/Archived | missing on proposals |
| Filter chips with counts | WhatsApp, us | **we have this** (`thread-list.tsx`) |
| Floating "Filters" pill over list | Upwork | missing |

Drawer contents worth copying (Upwork): Profile · My stats · Account health ·
Reports · Settings · Help & Support · Theme · Log out · **version number at the
foot**. We already surface a version badge in the footer — it belongs here too
on mobile.

## B. Home / discovery — our biggest structural gap

Fiverr's logged-in home is a **feed of sections**, not a dashboard:

1. Centred logo + full-width search
2. "Popular services" — horizontal card carousel, image + label, "See All"
3. "What sparks your interest?" — interest chips with `+ Add`, feeding
   personalisation
4. Promo banner (referral: "Share & get up to $100 off")
5. "What's new on Fiverr?" — horizontal editorial cards
6. "Inspired by your browsing history" — horizontal gig cards

**Ours is a stats dashboard.** That is right for a returning user with active
jobs and wrong for a browsing client. Gap: no discovery surface, no horizontal
carousels, no "see all" pattern, no personalisation hooks.

## C. The gig/service card — we have no equivalent

Fiverr's card: cover image · ★ rating + review count · heart (save) · title
(2–3 lines) · **"From €10"**.

We have services with prices but no card of this shape anywhere, and:

- **No ratings or reviews at all.** This is the single biggest missing piece
  of trust machinery. Their card leads with 4.8 (140).
- **No "from" price** framing on creative services.
- Saving exists (`interactions`) but isn't surfaced as a heart on cards.

## D. Job card (Upwork) vs ours

Their order: meta row (Featured · posted · proposal count) → title (link
colour, 2 lines) → facts line (type · level · budget) → truncated description
+ "more" → skill chips → trust row (payment verified ✓ · stars · spend ·
location) → thumbs-down / heart actions.

Gaps for us: no proposal-count on the card, no "dismiss" action, no trust row,
no per-card save.

## E. Empty states

Upwork Messages empty: illustration + "No messages yet!" + a **primary CTA that
routes somewhere useful** ("Search for jobs"). Ours mostly render nothing or a
bare line. Cheap, high-impact fix.

## F. Still to review

Remaining: `IMG_2963`, `2965`–`2977` (13 mobile), and all 26 desktop
screenshots — job detail on scroll, creative profile, settings, messaging
thread, footer.
