# Ganyu Hub Roadmap v3: Beta, then the World

> Replaces Roadmap v2. Last updated: 2026-07-13.
> Structure: Milestone 1 (Closed Beta, mostly free, this month) then Money Unlock Day (one sitting) then Milestone 2 (Public Launch, gated).
> Rule: code only ships when it unblocks real users, real money, or real proof.

---

## Reality Snapshot (honest version)

- Platform: live in production on vercel.app. Payment loop 6/6 on PayChangu sandbox (merged cbc0c33).
- Supply: 1 creative live (test account, zero images). 5 verbal yeses. That is not supply yet.
- Demand: 0 clients.
- Email: Resend sandbox delivers only to the owner. Supabase auth emails (signup confirm, password reset) deliver to anyone but are rate limited to a few per hour.
- Money: sandbox only. Business IS registered. PayChangu production keys require an office visit with the certificate, not a subscription.
- Cash constraint: domain + Vercel Pro + Supabase Pro deferred to later this month (forex). These block PUBLIC launch polish, not closed beta.

---

## Locked Decisions (unchanged from v2, single source of truth)

| Decision | Locked value |
|---|---|
| Commission | 15% flat, deducted from creative payout, net shown at quote time |
| Currency | MWK only |
| Creative KYC | ID before payout eligibility |
| Client KYC | Name + phone for beta; full ID before public launch |
| Rate model | Per-service rate cards |
| Trust model | Open signup + reviews; portfolio is the credential; no badges |
| Content policy | Three lines (no adult, no political, no MLM); Vincent moderates |
| Subscriptions | Frozen until 50+ completed paid jobs |
| Proposal cap | 3 declined attempts; direct invites bypass |
| Top-ups | Only while payment_held |
| Cancellation | 15% payout reserve per side, MWK 1,000 floor |
| Beta shape | Closed: 6 creatives + 3 to 5 concierge clients. No open signup push |
| Anti-leakage | No public WhatsApp/phone on profiles pre-hire; contact after escrow funds |

Consistency check (resolved 2026-07-13, from `lib/fees.ts:4` + `app/admin/cancellations/page.tsx:121`):

- **Completion:** platform takes flat **15%** (`PLATFORM_COMMISSION`).
- **Cancellation:** platform take varies by phase — A_early (<24h post-payment) is **10%** (85/5/10 client/creative/platform); A_late is **15%** (50/35/15); B is **15%** (15/70/15); C is **15%** (30/55/15). The 15% per-side `CANCELLATION_PAYOUT_RESERVE_PCT` is sized to protect the tightest (A_early) case. The stale comment on `lib/fees.ts:43` that says "the platform's 10%" is only accurate for A_early — worth rewording when someone next touches that file.

---

## Shipped (summary; full detail in CHANGELOG.md, do not rebuild)

Core marketplace (auth, roles, profiles, portfolios, jobs, proposals, messaging, onboarding, rate cards). Discovery (search, filters, 24 categories, saves, For You, Trending). Trust (status machine, scope confirmation, disputes, reviews with star rollups, notifications in-app + email). Payments (PayChangu escrow collect/verify/webhook, payment-first accept, payouts with reconcile, double-payout lock, saved payout methods, fee transparency per rail, top-ups, cancellation splits, deadline extensions, 72h cron, fee reserve + payout floor, unified money layer). Proposal economics (3-cap, invites, private jobs, proposal limit). Admin (sidebar, queues, error log + user reports). Brand + UX (teal system, redesign, empty states, image upload for cover/avatar/onboarding piece). Testing (unit + Playwright + enum-validated mocks + TEST_LOG discipline). **Design port (2026-08-22):** the twenty Claude Design screens ported one at a time — post-a-job, dashboard at `/dashboard`, messages full-screen on a phone, job detail, and the creative profile rebuilt flat with the money column beside the name. Outstanding from the port: headings site-wide want Title Case (BACKLOG.md), and four screens have no page yet — share link signed out, Money, settings, sign-in/onboarding.

---

# MILESTONE 1: CLOSED BETA (this month, no subscriptions required)

**Definition of beta:** 6 creatives fully live, 3 to 5 hand-held clients, real MWK moving through PayChangu production on the vercel.app URL. Invite-only in practice. You are the concierge, the moderator, and the notification system.

**Beta is DONE when:** 3 jobs completed end to end with real money, both-sided reviews on each, and 14 consecutive days without a critical error.

### Week 1: Unblock and backfill (free)

- [ ] Claude Code session: CHANGELOG backfill from git log (2026-06-29 to 07-06 gap). Prompt already provided.
- [ ] Claude Code session: portfolio image upload (replace cover_url text field with ImagePicker + Supabase Storage). Prompt already provided. Verify click by click with the live recruit's account, including that old pasted-URL items still render.
- [ ] Supabase dashboard check: Authentication settings, is "Confirm email" ON? If ON, either space beta signups out (rate limit is a few auth emails per hour) or switch it OFF for the closed beta and note it in this doc to re-enable at public launch.
- [x] Claude Code session: /terms and /privacy pages. Plain English: who holds money, the 15% fee, dispute process, ID storage, no off-platform payments. Link from footer and signup. (Shipped 2026-07-15.)
- [ ] Book the PayChangu office visit. Bring: registration certificate, your ID, bank details, expected monthly volumes, and the escrow flow explained on one page. Goal: production keys + written confirmation of live fees + their blessing of the hold-and-release model.

### Week 2: Supply becomes real (free)

- [ ] Sit-down onboarding, one creative per day, you drive: photo, bio, 2+ portfolio pieces uploaded as images, 1+ service on the rate card, payout method saved, ID captured.
- [ ] Take a portrait of each creative while there (phone, good light). This is your future landing imagery.
- [ ] Ask each for exactly one referral. Target 10 total, do not exceed 12 for beta.
- [ ] While onboarding, burn down the never-tested list live: search q param, save/unsave round-trip, recordView rows appearing in interactions, feed correctness, empty states. Update TEST_LOG.md as you go.
- [ ] First test of images landing in Storage at small scale happens here, naturally, with real work.

### Week 3: Demand becomes real (free)

- [ ] Write the target list: 20 businesses/NGOs/marketing teams you or your creatives can reach. Columns: name, contact, need, warm path, status.
- [ ] The concierge pitch: "Tell me what you need. I match you, brief the creative, manage delivery. You pay through the platform and the money sits in escrow until you approve the work." Optionally waive the fee on job one; proof matters more than revenue right now.
- [ ] Close 3 to 5 clients. Post jobs on their behalf if needed. You are the account manager.
- [ ] When PayChangu production keys land: swap env keys, run ONE small real-money job first (smallest honest job available, even MWK 5,000) and watch it through collect, hold, release, payout, with /admin/errors open the whole time.

### Week 4: Complete the proof

- [ ] 3 real paid jobs completed end to end. Chase both reviews within 48 hours of each completion.
- [ ] Screenshot everything. Note every point of confusion; those notes are your public-launch bug list.
- [ ] Write case study #1 (one page: brief, the work, price, timeline, quotes from both sides).
- [ ] WhatsApp is your notification layer during beta: when a job posts, ping matching creatives directly. Target time-to-first-proposal under 24 hours.

### Beta feature freeze

Nothing ships during beta except: the Week 1 sessions above, bug fixes from live usage, and TEST_LOG items. Subscriptions, wallets, tips, agencies, boosts, git-portfolios, admin polish, messaging features: all frozen. New ideas go to BACKLOG.md.

---

# MONEY UNLOCK DAY (one sitting, when funds land later this month)

Do these in one session, in this order. Budget roughly USD 60 for the first month.

1. Buy ganyuhub.com (about USD 12/yr). Registrar that plays nice with limited forex: try Cloudflare or Namecheap; if the card fails, a voucher/PayPal path or a trusted contact abroad settles it.
2. Add domain to Resend, paste DNS records at the registrar, delete the dead ganyu.com entry. Wait for Verified.
3. Set EMAIL_FROM to the verified domain. Redeploy.
4. Point Supabase Auth SMTP at Resend so signup/reset emails stop being rate limited. Re-enable "Confirm email" if it was turned off for beta.
5. Vercel Pro (USD 20/mo): commercial terms compliance + hourly crons (restores true 72h aging on disputes/top-ups).
6. Attach custom domain in Vercel, update APP_URL (https, no trailing slash), redeploy.
7. Supabase Pro (USD 25/mo): daily backups, no auto-pause. This is insurance on real payment records, buy it for that.
8. Sanity pass from DEPLOY.md: sign up with a fresh inbox, reset password, confirm links point at the new domain.

---

# MILESTONE 2: PUBLIC LAUNCH

**Gates: do not launch until ALL are true.**

1. Money Unlock Day complete (domain, email, Pro tiers).
2. Beta done (3 paid jobs, reviews, 14 clean days).
3. 10+ creatives live with full profiles and captured IDs.
4. Client ID verification decision implemented (locked: full ID before public money from strangers).
5. Terms and Privacy live.
6. Launch-prep dev sessions below shipped and verified.

### Launch-prep dev sessions (order matters)

- [ ] Ratings into ranking: fold star average + review count into /browse ordering and lib/feed.ts; extend rollups to dashboard feed and saved cards.
- [ ] OG meta tags per creative and per job (name, headline, avatar/cover, stars). Test by pasting links into WhatsApp; they must render as rich cards.
- [ ] Hardening pass: confirm every PayChangu webhook path re-verifies with their API before any DB write; add basic rate limiting on signup, login, submitProposal, sendMessage.
- [ ] Landing proof row returns with REAL numbers (jobs completed, MWK paid out, creatives live) and real portraits from Week 2.
- [ ] Analytics: Plausible or PostHog + the Monday ritual (signups, profiles completed, jobs posted, proposals per job, time-to-first-proposal, completes, GMV, disputes, errors).
- [ ] Reduced-motion audit + WCAG contrast pass (PRODUCT.md promised both).
- [ ] Uptime monitor (UptimeRobot free) on the production domain.

### Launch moment

- [ ] Publish 3 case studies + creative portraits.
- [ ] The story: Malawian work by Malawian humans, paid in kwacha, protected by escrow. Pitch local outlets and the startup community (mHub circles and similar).
- [ ] WhatsApp + Facebook engine: creative spotlights, finished-work posts, client testimonials. Every completed job becomes content.
- [ ] First non-commission revenue AFTER launch traction: featured listings (profiles.featured_until + sort key + subtle border). Admin-granted for launch partners first, paid later.
- [ ] Subscriptions: revisit only after 50 completed paid jobs. The pricing table stays theoretical until then.

---

## Claude Code Session Rules (unchanged)

```
PROJECT: Ganyu Hub - Malawian creative services marketplace
STACK: Next.js 14 App Router, TypeScript, Tailwind, Supabase, PayChangu, Resend
STATUS: Closed beta phase, Roadmap v3.
TODAY'S TASK: [ONE task from the current week]
RULES: One task only. Migration first, then server action, then UI.
Numbered steps with spacing, no paragraph walls.
End with click-by-click browser verification steps. They are the QA mechanism, not ceremony.
```

- One task per session. Update this doc + TEST_LOG.md after each. Commit descriptively.
- Session transcripts survive /clear: recover any past session with `claude --resume` inside the project folder. But prefer git log as the source of record.

## Definition of Launched (unchanged from v2)

1. A stranger can sign up and receive email at their own address.
2. Real MWK moved through production PayChangu on 3+ completed jobs.
3. 10+ creatives live with full profiles and captured IDs.
4. Both-sided reviews exist and affect ranking.
5. Terms and Privacy live and linked.
6. You know your weekly numbers without opening the database.

Everything before that is a very sophisticated demo. Beta is how the demo earns its first receipts.
