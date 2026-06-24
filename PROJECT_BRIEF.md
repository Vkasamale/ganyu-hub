# Ganyu Hub — Project Brief

*Draft v0.2 — last updated 2026-06-24*

> **Status:** MVP is built and running locally. Tech stack is locked. Search + filters and a For You / Trending feed are shipped. Payments are still deferred. See [`CHANGELOG.md`](CHANGELOG.md) for the shipped history.
>
> **Locked decisions** (resolving open questions from earlier drafts):
> - **Tech stack:** Next.js 14 (App Router) + TypeScript + Tailwind + Supabase (Postgres, Auth, Storage). Hosting TBD.
> - **Launch audience:** clients-first, but both sides exist from day one.
> - **Monetization:** subscriptions + commission (rate TBD).
> - **Trust model:** open signup + reviews.
> - **Geography phase 1:** Malawi only.

## 1. One-line pitch

A Malawian creative-services marketplace where clients hire local talent — designers, developers, video/photo creatives, writers, marketers, and agencies — for real paid work, with portfolios, reviews, and full-platform payments. Internationally visible, but the brand makes it clear: **the work is done by Malawians**.

The name *Ganyu* (Chichewa for short-term/piece work) frames the platform as the modern, digital evolution of how Malawians have always found work.

## 2. Problem

- Talented Malawian creatives (often self-taught or skill-first, not degree-first) have no central, credible place to showcase work and get hired.
- Clients — local businesses, NGOs, and eventually international buyers — struggle to discover and vet Malawian creatives. Hiring happens through WhatsApp referrals and luck.
- Global platforms (Upwork, Fiverr) aren't built for Malawi: payments, identity, trust signals, and pricing assumptions don't fit.

## 3. Target users

### Clients (priority at launch)
- Local SMEs and startups needing branding, websites, content, video.
- NGOs and government projects sourcing local talent.
- Marketing teams who need fast, affordable creative work.
- International clients specifically looking to hire Malawian creatives (later).

### Creatives
- Independent designers, developers, video/photo people, writers, marketers.
- Marketing and creative **agencies** (multi-person profiles, not just solo freelancers).
- Skilled people without formal degrees — the platform validates them through portfolio + reviews, not credentials.

## 4. Categories at launch

All of the following:
- **Design** — graphic, UI/UX, brand, illustration
- **Development** — web, mobile, software
- **Video & photography** — videography, editing, photography, animation
- **Writing & marketing** — copywriting, content, social media, marketing agencies

## 5. Core features (MVP)

### For creatives
- Profile with skills, bio, rates, location
- Portfolio: project case studies (images, video, links, descriptions)
- Service listings ("I will design a logo for X")
- Reviews and ratings from completed jobs
- Agency/team profiles (multiple members under one brand)

### For clients
- Browse and search creatives by category, skill, rating, price
- Post jobs / project briefs
- Receive proposals from creatives
- Hire, message, and pay through the platform
- Leave reviews

### Platform
- Auth + profiles (client / creative / agency)
- Messaging (client ↔ creative)
- Job posting + proposals
- Reviews & ratings
- Payments + escrow (rails TBD — see §7)
- Admin / moderation tools

### Nice-to-have (post-MVP)
- Featured / boosted listings
- Skill verification badges
- Portfolio analytics for creatives
- Saved searches / alerts for clients

## 6. Monetization

Hybrid: **subscriptions + commissions**.
- **Commission** on each completed job (e.g. ~10% — exact rate TBD; benchmark against Upwork 10%, Fiverr 20%).
- **Subscription tier(s)** for creatives/agencies who want more visibility, more proposals per month, or featured placement. Possibly a client-side tier too for high-volume hirers.

## 7. Payments (deferred decision)

Approach: build the marketplace plumbing now, plug in payment rails once APIs are sorted.

Likely options to evaluate when ready:
- **Mobile money** — Airtel Money, TNM Mpamba (essential for the local side)
- **Cards** — Stripe / Paystack / Flutterwave (for international clients)
- **Crypto / stablecoin** — optional later, useful for bypassing forex friction on international jobs

Design the system so payments are a **swappable provider layer** behind an internal "wallet + escrow" abstraction — don't hardcode any single provider.

## 8. Trust & quality

- **Open signup + reviews** — anyone can join; ratings, reviews, and completed-job history do the filtering.
- Add verified badges later (ID verification, skill tests) as a signal layer on top of the open model.
- No invite-only or pre-vetting gate at launch — get supply liquidity first.

## 9. Positioning

- **Local-first, internationally visible.** Built for Malawians hiring Malawians. International clients are welcome, but the platform's identity is "this is Malawian work."
- **Skill over credentials.** Portfolios and reviews matter more than degrees.
- **Full marketplace, not a directory.** Discovery, hiring, payment, and reviews all happen in-platform.

## 10. Geographic roadmap

- **Phase 1 (launch → 12 months):** Dominate Malawi. Become the default place to hire Malawian creatives.
- **Phase 2 (12–24 months):** Regional expansion — Zambia, Mozambique, and other neighbors with similar market gaps.
- **Phase 3 (later):** Position as a bridge for international clients to hire African (starting with Malawian) creative talent.

## 11. Success metrics

Early (first 6 months):
- # of creative profiles live with at least one portfolio piece
- # of jobs posted by clients
- # of jobs completed end-to-end (proposal → hire → payment → review)
- GMV (gross marketplace volume) flowing through the platform

Later:
- Repeat-client rate
- Time-to-first-hire for new clients
- Creative earnings retention (creatives who earn → keep earning)
- Take rate vs. churn (does the commission/sub model hold up)

## 12. Open questions / decisions still to make

- **Brand & domain** — is "Ganyu Hub" final? Domain availability?
- **Payment provider shortlist** — once you're ready to pick rails.
- **Commission rate** — what % feels fair for the Malawian market without killing margins?
- **Subscription tiers** — what's free vs. paid for creatives?
- **Dispute resolution** — how do we handle "client says it's bad, creative says it's done"? Escrow + admin arbitration?
- **Currency** — MWK only at first? Or dual-display MWK/USD from day one?
- **KYC** — required to receive payouts? Optional verified badge? Required for international payouts only?
- **Tech stack** — not yet decided (web app first; mobile later).
- **Content policy** — what's not allowed (e.g. adult work, anything illegal)?
- **Tax / invoicing** — do we generate invoices for creatives? Report anything to MRA?

## 13. Next steps

1. Lock the brand name + grab the domain.
2. Wireframe the three core flows: (a) client posts a job, (b) creative submits proposal, (c) client hires + pays + reviews.
3. Pick the tech stack and stand up a thin v0 — auth, profiles, portfolios, job posting, messaging, fake/manual payments.
4. Recruit ~50 creatives by hand to seed supply before opening to clients.
5. Decide payment provider(s) and integrate once APIs are ready.
