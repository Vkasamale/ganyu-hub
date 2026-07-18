# Services & Costs

Single source of truth for every paid service Ganyu Hub needs (or will need). Broken down by stage. Update prices when you check them — providers change tiers without warning.

**FX assumption:** 1 USD ≈ 1,750 MWK (2026-07). All MWK figures are estimates — multiply the USD by whatever rate is on the day.

**Prices last verified:** 2026-07-17 (Vercel, Supabase, Resend, Plausible, UptimeRobot, Namecheap, PayChangu — pulled from `lib/fees.ts`).

**Legend:** ✅ live now · 🕒 needed at next stage · 💤 nice to have, not blocking

---

## Stage 1 — Closed Beta (now)

Goal: 6 creatives, 3–5 clients, 3 paid jobs end-to-end. Running on free tiers everywhere.

| Service | Purpose | Tier | Monthly (USD) | Monthly (MWK est) | Notes |
|---|---|---|---|---|---|
| Vercel | Hosting + serverless | Hobby (free) | $0 | 0 | 100GB data transfer, 1M edge requests, 1M function invocations. Non-commercial ToS technically. No hourly crons. |
| Supabase | DB + auth + storage | Free | $0 | 0 | 500MB DB, 5GB egress, 50k MAU, 1GB storage. **Auto-pauses after 1 week of inactivity.** No daily backups. Max 2 active projects. |
| GitHub | Code hosting | Free | $0 | 0 | — |
| Resend | Transactional email | Free (sandbox) | $0 | 0 | 3,000 emails/mo, **100/day cap**, 1 domain, 30-day retention. Currently sandbox — delivers only to `vinnykasa@gmail.com`. |
| PayChangu | Payments | Per-tx | $0 | 0 | Per-transaction only, no monthly. Fee breakdown in the PayChangu section below. |
| UptimeRobot | Uptime alerts | Free | $0 | 0 | 50 monitors, 5-min interval, HTTP + keyword + ping monitors, email alerts. No SSL/domain expiry. |
| Domain | ganyu-hub.vercel.app | Vercel-provided | $0 | 0 | Placeholder until Money Unlock Day. |
| **Stage 1 total** | | | **$0** | **0** | |

**Real cost right now:** internet + electricity + your time.

---

## Stage 2 — Money Unlock Day (public launch prep)

Goal: real domain, email that reaches strangers, backups on the DB that holds real money records.

| Service | Purpose | Tier | Monthly (USD) | Monthly (MWK est) | Notes |
|---|---|---|---|---|---|
| Domain (ganyuhub.com) | Real .com | Namecheap | ~$0.94 | ~1,650 | **$11.28/yr retail**, $6.79 first year with promo code NEWCOM679. |
| Vercel | Hosting | Pro | $20 | ~35,000 | Includes $20 usage credit (net = often $0 for small apps). 1 developer seat. Commercial ToS. Hourly crons. Custom domain HTTPS. |
| Supabase | DB | Pro | $25 | ~43,750 | **First project included.** 8GB DB, 250GB egress, 100k MAU, 100GB file storage, daily backups (7-day retention), no auto-pause. Includes $10/mo compute credit. Spend cap defaults ON. |
| Resend | Email (own domain) | Free | $0 | 0 | 3,000/mo, 100/day — enough for beta traffic on own domain. Upgrade to Pro when daily cap starts blocking. |
| UptimeRobot | Uptime | Free | $0 | 0 | Still enough. Upgrade only when SSL expiry / 60-sec matter. |
| PayChangu | Payments | Per-tx | — | — | Same per-tx model. Fees pulled from creative payout. |
| **Stage 2 total** | | | **~$46** | **~80,400** | |

**One-time at Stage 2:** ~$7 first year (ganyuhub.com with promo), then $11.28/yr from year 2.

---

## Stage 3 — Public Launch + Early Traction

Goal: real traffic, more email volume than free tier covers, first real analytics look.

| Service | Purpose | Tier | Monthly (USD) | Monthly (MWK est) | Notes |
|---|---|---|---|---|---|
| Vercel | Hosting | Pro | $20 | ~35,000 | Same. |
| Supabase | DB | Pro | $25 | ~43,750 | Same. |
| Resend | Email | Pro | $20 | ~35,000 | 50,000 emails/mo, no daily cap, 10 domains. Overage $0.90 per 1,000 emails. Upgrade when Free tier's 100/day starts blocking sends. |
| Plausible | Analytics | Starter (annual) | $9 | ~15,750 | 10k pageviews/mo, 1 site, 3-year retention. Billed annually saves 2 months (~$7.50/mo effective). Monthly billing is higher. **No free tier** — 30-day trial only. |
| UptimeRobot | Uptime | Solo | $8 | ~14,000 | 60-sec checks, SSL + domain expiry alerts, 10 monitors. Worth it once real money moves daily. |
| Domain | ganyuhub.com | Renewal | ~$0.94 | ~1,650 | Amortized. |
| **Stage 3 total** | | | **~$83** | **~145,150** | |

---

## Stage 4 — Scale (not urgent, keep for planning)

Only when the numbers demand it. Don't pre-buy.

| Service | Trigger | Estimated cost |
|---|---|---|
| Supabase Team plan | Outgrow Pro; need SOC2, PITR, read-only roles | **$599/mo** |
| Supabase PITR | Rollback to any second (add-on to Pro) | from $100/mo |
| Supabase Custom Domain | Branded Supabase project URL (add-on) | $10/mo flat |
| Vercel usage overage | If bandwidth/functions exceed $20 credit | pay-as-you-go |
| Resend Scale | 100k+ emails/mo | $90/mo |
| Resend Dedicated IP | 3,000+/day, high-volume senders | $30/mo add-on |
| Plausible Growth | 3 sites / team | $14/mo (annual) |
| UptimeRobot Team | Multiple maintainers, 100 monitors | $34/mo |
| Sentry / error tracking | When admin errors log gets noisy | $26/mo (Team) |
| Cloudflare in front | If Vercel bandwidth gets expensive | Free–$20/mo |

Don't budget for these yet — they're "if we win" problems.

---

## Non-monthly costs to remember

| Item | Cost | When |
|---|---|---|
| Business registration | Already paid | ✅ done |
| PayChangu setup / office visit | Free (their side) | ✅ visited |
| Custom email domain (ganyuhub.com) | $6.79 first year (promo) / $11.28/yr after | Money Unlock Day |
| Marketing (WhatsApp airtime, boosted posts) | Variable | Post-launch |
| Creative onboarding (transport, coffee, small thank-you) | Variable | Stage 1 (Week 2) |

---

## Rough running totals

- **Now:** $0/mo
- **Money Unlock Day (Stage 2):** ~$46/mo · ~80,400 MWK/mo
- **Public launch (Stage 3):** ~$83/mo · ~145,150 MWK/mo
- **First-year cash at Stage 2 sustained:** ~$552 USD · ~966,000 MWK (before Stage 3 upgrades)
- **First-year cash at Stage 3 sustained:** ~$996 USD · ~1,741,800 MWK

**Break-even at Stage 3:** with 15% commission (kept in full — PayChangu fees are passed to client/creative, see below), need ~970,000 MWK GMV/month to cover infra. That's ~7 jobs at MWK 140,000 each, or ~20 jobs at MWK 50,000.

---

## PayChangu — actual fee model

Source of truth: [`lib/fees.ts`](lib/fees.ts). Update both this doc AND that file if fees change.

**Collection fees** (charged to client on top of the bid — passed through, not absorbed by platform):

| Rail | Rate |
|---|---|
| Mobile money | 3.0% |
| Card | 3.0% |
| Bank transfer | 2.0% |

**Payout fees** (deducted from creative's payout — passed through, not absorbed by platform):

| Rail | Rate |
|---|---|
| Mobile money | 1.8% |
| Bank transfer | 1.5% + MWK 700 flat |

**Platform commission:** flat 15% of bid, kept in full — PayChangu fees do NOT erode it.

**Settlement timing:** T+1 (next business day). Enforced in code as of 2026-07-16 — releases blocked for 24h after `payment_held`.

**Monthly / setup fee:** none. Purely per-transaction.

**Support:** https://support.paychangu.com/

**Worked example — MWK 50,000 mobile-money job:**
- Client pays 50,000 + 1,500 collection fee = **MWK 51,500**
- Platform commission: **MWK 7,500** (15%, kept in full)
- Creative gross: 42,500 − 765 mobile payout fee = **MWK 41,735 net**
- PayChangu earns: 1,500 (collection) + 765 (payout) = MWK 2,265 (from client + creative, not from platform)

**Floor:** payouts under MWK 1,000 are skipped (`MIN_PAYOUT_MWK` in `lib/fees.ts:52`) — the fee would eat all of it.

---

## Notes / decisions to revisit

- **Plausible vs PostHog vs Umami.** Plausible = simple, paid, $9/mo. PostHog = free tier but heavier product. Umami = self-hostable on Supabase for free but adds ops burden. Sticking with Plausible (already wired). Sign-up parked in BACKLOG until Stage 3.
- **UptimeRobot free is enough** until first paid job completes. Upgrade to Solo ($8/mo) the day the first real payment clears — SSL/domain expiry alerts matter once real money is moving.
- **Supabase Pro is non-negotiable** the moment real payments run. Losing the DB of real MWK transactions because free-tier auto-paused would end the business.
- **Vercel Pro's $20 credit** effectively makes it free at small scale — real bill will only exceed $20 once traffic is real. Monitor via spend management.
- **Resend Free (3,000/mo, 100/day)** is enough for beta AND early public launch. Only upgrade once daily cap hits.

---

## How to update this doc

When you check a price, update the row + change "Prices last verified" line at top. When a service is switched on / off, move it between Stage tables. New services go in the appropriate stage; drop from the doc entirely if abandoned.
