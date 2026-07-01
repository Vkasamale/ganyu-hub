# Product

## Register

split

Primary treatment is `product` (marketplace UX: dashboard, browse, jobs, messages, admin), with `brand` treatment reserved for the landing page and any campaign surfaces. Per-task register overrides this default when a design task lives clearly on one side.

## Users

**Clients (priority at launch):** local Malawian SMEs, NGOs, government project leads, and marketing teams who need branding, sites, content, or video. They are currently hiring through WhatsApp referrals and want a more credible, searchable alternative. International clients specifically seeking Malawian talent join later.

**Creatives:** independent designers, developers, video/photo people, writers, marketers, plus multi-person agencies. Predominantly skill-first rather than degree-first — many are self-taught. Portfolio + reviews are how they prove themselves; the platform must never require credentials.

**Job to be done:** for clients, find and hire a trustworthy Malawian creative for a specific piece of work without playing WhatsApp roulette. For creatives, showcase real shipped work, get discovered, get paid.

## Product Purpose

Ganyu Hub is the modern digital evolution of *ganyu* (Chichewa for short-term work). It is a Malawi-first creative-services marketplace that lets clients hire local talent and lets creatives run a real portfolio-driven business with full-platform payments, reviews, and dispute resolution. Success is measured in real jobs completed on-platform (not signups), and in the platform becoming the default way Malawians find creative work.

## Brand Personality

**Warm. Local. Aspirational.**

The interface should feel proud of being Malawian without being nostalgic or NGO-earnest. It's a working tool for people who take their craft seriously — designers, developers, agencies — and its aesthetic should match theirs, not talk down to them. Confident but not corporate; grounded but not scrappy.

**Brand color:** `#069494` (teal) is the primary. Applied across tailwind tokens, CSS vars, SVG art, and chart colors (commit `5f8bff7`).

## Anti-references

- **Fiverr / Upwork templated marketplace.** Gig-economy visual language — grey-blue navy, stock illustration heroes, endless carousels of avatars, "trusted by 10,000 businesses" trust rows. Cheap-feeling. Ganyu Hub is not a race-to-the-bottom bidding site.
- **SaaS cream/beige + tracked uppercase eyebrows.** The 2026-saturated "editorial-warm" AI default. Small `ABOUT / PROCESS / PRICING` kickers over every section, warm-neutral bg with a single accent. Reads as templated the moment a designer sees it.
- **NGO-development-org aesthetic.** Green ribbons, stock photos of hands, "we serve communities" pastiche. Malawian identity is carried by the product itself and the creatives on it — not by donor-language visuals.

## Design Principles

1. **The work is the credential.** Portfolios and reviews replace certificates. The interface must never gate discovery behind badges, verification tiers, or skill tests — the platform's job is to surface work, not judge people.
2. **Malawian by default, not by decoration.** The identity is in the name, the categories, the currency (MWK), the copy, and the people on it. Don't lean on chitenje patterns or landmark photos as identity crutches; they're spice, not structure.
3. **Client-first without disrespecting creatives.** Clients are the priority at launch, but every screen a creative touches (dashboard, portfolio editor, proposal form, analytics) must feel like a tool they'd choose, not one they tolerate.
4. **Trust through transparency.** Show reviews, dispute state, escrow state, availability. Never hide the mess — it's what separates this from WhatsApp referrals.
5. **Fast, readable, mobile-honest.** Data caps in Malawi are real. Design for a phone on a slow connection first, then scale up.

## Accessibility & Inclusion

- **WCAG 2.1 AA baseline.** Body copy ≥4.5:1 contrast, large text ≥3:1, focus rings visible on every interactive element.
- **Reduced-motion honored.** All motion has a `prefers-reduced-motion: reduce` alternative (crossfade or instant transition). Current animation layer needs auditing against this.
- **English at launch, Chichewa-ready.** UI copy uses the shortest clearest English. Category names and key CTAs should be short enough that a Chichewa translation will fit the same layout later.
- **Low-bandwidth honest.** Images lazy-load, hero art is optional, layouts don't punish users with slow connections.

## Business Model

**Commission.** 15% flat, taken from the creative's payout. Shown transparently at quote time — a creative priced at MWK 10,000 displays both the client price and the creative's net (MWK 8,500) side by side before commitment. No surprise deductions at payout.

**Currency.** MWK only. No toggle. International payment support, if ever needed, is a payment-processor concern, not a UI feature.

**KYC.**
- **Creatives:** ID required before payout eligibility. Payout details (mobile money — Airtel Money / TNM Mpamba — plus bank) wired through PayChangu.
- **Clients:** account registration only, with an optional self-declared agency flag (no formal business registration required to use it). Individual client identity verification is currently the weaker side of fraud protection — **open decision, revisit before launch.**

**Content policy.** Deferred to a dedicated session. Moderation ownership (who reviews flags) also unresolved. Backlogged, not blocking launch prep.

**Subscription tiers.** Both sides free to join and transact. Commission is the only mandatory revenue. Paid tiers are upsells, not gates.

- **Creatives:** featured placement, more proposals/month, trust badge.
- **Clients:** unlimited concurrent job postings, priority visibility, faster support.

Each side offered monthly and annual, each split student / regular → four pricing points per side.

Indicative pricing (Ntchito-style strikethrough discount framing):

| Tier | Monthly | Annual (shown → billed) |
|---|---|---|
| Student | MWK 5,000 | MWK 60,000 → ~35–38,000 |
| Regular | MWK 10,000 | MWK 120,000 → ~70–75,000 |

**Agencies** get a mandatory monthly subscription **plus** commission. Backlogged; not built now.
