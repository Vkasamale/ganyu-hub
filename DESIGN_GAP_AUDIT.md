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

## F. Creative profile — reviewed `Fiver Profile (1)`, `pc profile`

### Missing from ours, ranked

1. **Reviews, with structure.** Not just a star average — each review carries
   reviewer identity + country, star value, date, truncated body with "See
   more", the *price paid* and *duration*, the service it came from, a
   Helpful yes/no vote, and a threaded **seller's response**. The response
   right is what makes a rating system feel fair to the person being rated.
2. **Rating in the identity block**, `★ 4.8 (153)`, the count linking to the
   reviews tab.
3. **Responsiveness signals** — "Online now", local time, "Average response
   time: 1 hour". Cheap to compute from `messages`, and directly answers the
   question a nervous client actually has.
4. **Underline tabs on the profile**: About · Services · Portfolio · Reviews.
   Ours is one long scroll.
5. **Sticky contact affordance** — Fiverr floats a "Message X" card that
   follows the scroll. Ours puts Message at the foot of the hero and it
   disappears.
6. **See public view.** A creative cannot currently tell what a client sees.
7. **Edit in place** — pencil per field on the owner's view, rather than a
   separate edit form.
8. **Persuasive empty states** — "Talent are hired 9x more often if they've
   published a portfolio" beats "No portfolio items". Give the user the
   reason, not the status.
9. **Repeat-client badge.** Trivial to derive from our jobs table, and it is
   strong local proof.

### Deliberately NOT copying

- Connects / paid boosts / "Promote with ads" — that is Upwork's revenue
  model, not ours, and it makes the profile feel like a slot machine.
- Country flags. Everyone here is in Malawi; district or city is the
  meaningful unit.

### Depends on schema we do not have

Reviews need a `reviews` table (job_id, rater_id, ratee_id, stars, body,
response, created_at) with RLS restricting a review to parties of a
*completed, paid* job. That last constraint is the whole point — it is what
makes the rating un-fakeable, and we already have `payment_released` to key
it on.

## G. Job / gig detail — reviewed `upwork Job (1)(2)(3)`, `fiver job`,
## `fivver job - FAQ`, `fivver job- recom`

### G1. Upwork job detail, mobile

Structure top to bottom: back chevron + centred "Job Details" title → icon-led
facts stack (Featured · $15.00 Fixed-price · Entry level) → Project Type →
Skills and Expertise (mandatory skills as chips) → Preferred qualifications
(Location ✓) → **Activity on this job** → **About the client** → **Client's
recent history** → sticky bottom bar.

**Activity on this job** — proposals count, **last viewed by client**,
interviewing, invites sent, unanswered invites. Two of these carry `?`
tooltips. This section answers "am I wasting my time?", which is the loudest
unspoken question a creative has. We log views in `interactions` already.

**Sticky bottom action bar**: `Apply now` filled + `♡ Save job` outline,
pinned, never scrolls away. Also the answer to the missing back button in
standalone PWA mode.

### G2. About the client — the biggest single gap in the product

| Their signal | Our equivalent | Have it? |
|---|---|---|
| Payment method verified | escrow **funded** — stronger than theirs | data yes, not surfaced |
| Phone number verified | phone already required at signup | data yes, not surfaced |
| ★ 5.00 of 21 reviews | — | **no reviews at all** |
| Country · city · local time | profile location; TZ already pinned to Malawi | partial |
| 17 jobs posted · 77% hire rate · 6 open | derivable: accepted proposals ÷ jobs posted | derivable |
| $595 total spent · 35 hires · 4 active | `total_paid_mwk` sums | derivable |
| Member since Sep 12, 2025 | `profiles.created_at` | have it, unused |

**Hire rate is the highest-value derived number we are not showing.** It tells
a creative whether a proposal is worth writing.

### G3. Reviews are BIDIRECTIONAL — corrects §F

"Client's recent history" shows, per completed job, the client's review of the
freelancer AND `To freelancer: Shirley R. ★5.0 Great work!` — the review going
back the other way.

For Malawi this is arguably the more important direction. A creative's real
fear is not a bad rating; it is a client who vanishes after delivery or
haggles the price down. A client rating, visible before you bid, is the
counter to that.

So the `reviews` table in §F must carry both directions off one job:
`job_id`, `rater_id`, `ratee_id`, `stars`, `body`, `response`, `created_at`,
with RLS allowing a row only from a party to a **completed, paid** job.

### G4. Fiverr gig detail — below-the-fold structure

Order: hero → description → **seller-authored FAQ accordion** → reviews →
**"People Who Viewed This Service Also Viewed"** carousel → **"Your Browsing
History"** with Clear All / See All.

- **FAQ is seller-written**, not templated. Locally this is where a creative
  answers "do you deliver in Blantyre?", "do I get the source file?", "can I
  take Airtel Money?" — a `faqs` jsonb on services covers it.
- **Sticky right-rail price card** on desktop: price, delivery, revisions,
  `Continue` never leave the screen. Our escrow panel scrolls away.
- **Co-view carousel** is buildable from `interactions` today.
- **"Clear All" on browsing history** — the trust-respecting detail; tracking
  the user can undo.
- Cards everywhere carry ♡ save at the image's top-right, `★ 4.9 (186)`, and
  **From €23** pricing.

### G5. Not copying

- Basic/Standard/Premium tiers — jobs here are bespoke with a bid; tiers would
  break the proposal flow.
- "Level 2" seller ranks — gamification needing volume we do not have.
- Per-package FAQ entries — tier-driven, same reason.

### G6. Upwork job detail — full ordering (from `upwork Job (5)` + `(1)`)

1. Back chevron + centred "Job Details"
2. Title (2 lines) + ♡ circle, right
3. Posted date · 📍 location
4. Connects cost (their paywall — skip)
5. "Needs to hire 25 Freelancers"
6. **Summary** heading + description, **paragraph breaks preserved**
7. Facts stack: Featured · price/Fixed-price · Experience level
8. Project Type
9. Skills and Expertise → mandatory skills chips
10. Preferred qualifications
11. Activity on this job
12. About the client
13. Client's recent history
14. Sticky `Apply now` / `♡ Save job`

⚠️ Check ours renders the brief with `whitespace-pre-line`. A five-paragraph
brief collapsed into one wall is a common and ugly bug.

### G7. Structured attributes instead of prose — highest-value steal

Fiverr puts a metadata strip under the description:
`Logo style: Minimalist` · `Logo type: Monogram, Abstract, Emblem` ·
`File format: AI, JPG, PDF, PNG, PSD, EPS, SVG`

And the package matrix rows are a deliverables checklist: logo transparency,
vector file, printable file, 3D mockup, source file, stationery, social kit,
**number of concepts**, **revisions**, **delivery time**.

**Why this matters here specifically — dispute prevention.** We already built
disputes, cancellations and an admin resolution queue. Nearly every
creative-services dispute is one of three arguments:

- "I thought the source file was included"
- "I expected three concepts, not one"
- "that's a revision, not a fix"

A structured deliverables spec agreed at **proposal** time turns each of those
from an argument into a lookup. It is the cheapest dispute-reduction mechanism
available, and it is data we already half-collect as free text. Category-specific
attribute sets (logo vs photography vs DJ set) fit our `CATEGORIES` constant.

### G8. Smaller items worth taking

- **AI-use disclosure box.** Fiverr: "Please inform the freelancer of any
  preferences or concerns regarding the use of AI tools." For a marketplace
  selling *human* creative work, "was this AI-generated?" is a live trust
  question. Cheap to add as a proposal field.
- **Rich-text description.** Their "About this gig" carries headings, bold and
  bullets. Ours is a plain textarea dump.
- **"Get to know <name>" card** at the foot of the gig — avatar · name ·
  `• Online` pill · tagline · ★ rating (count) — so the buyer never has to
  leave to size up the seller.
- **Save count as social proof** — `♡ 229` in the header, not just a toggle.
- **"Recommended for you"** carousel above the FAQ.

### G9. Category 2 status: COMPLETE (12 of 12)

`fiver job` · `fiver job 2` · `fiver job (2)(3)(4)` · `fivver job - FAQ` ·
`fivver job- recom` · `upwork Job (1)(2)(3)(4)(5)` — `(4)` was a duplicate of
the jobs list.

## H. Messages — reviewed `messages UI PC`, `mobile messages (1)(2)(3)`
## Category 5 status: COMPLETE (4 of 4)

### H1. Attachment cards — the one we actually need

WhatsApp renders a file as a card: glyph · `receipt.pdf` · **"1 page • PDF •
2 MB"** · **View** | **Save as…**

Job deliverables ARE files, already in the private `job-deliverables` bucket
served by signed URL. A card showing `logo-final.ai · 2.4 MB` with View/Save
beats a bare link, and it makes the delivery legible as an event in the thread
we now merge job events into.

### H2. Two empty-state weights — settles an open handoff item

| | Upwork | Fiverr |
|---|---|---|
| Copy | "No messages yet!" | "Send your first message. You'll find your conversations all right here." |
| Action | full-width primary button | quiet underlined link |

Use the **button** for a completely empty inbox, the **quiet link** for a
single empty thread. That answers the `NEXT_SESSION.md` item about job threads
with no activity reading oddly: "No activity yet" should be quiet, not a CTA.

### H3. Also worth taking

- **Unread count pills** (already flagged missing in our own handoff).
- **Media/event type in the list preview** — WhatsApp shows "📷 3 photos",
  "🎤 0:09". Our job threads already have the equivalent vocabulary: "Files
  delivered", "Payment released".
- **Read receipts** (✓✓) and an **"Edited"** marker.
- **Left icon rail** on desktop, avatar pinned bottom — a desktop analogue of
  the mobile tab bar.

### H4. Not copying

- Pin / archive / mute — three features for a beta with ~25 conversations.
- Voice notes, calls, status — not our product.
- "Ask Meta AI" in the search field.

## I. Job posting form — reviewed `Job form`, `job form category`,
## `pc job form`. Category 9 status: COMPLETE (3 of 3)

Upwork's Project Catalog creation wizard. The most directly applicable set so
far, because this is where §G7's structured attributes are actually captured.

### I1. Wizard shape

`1 Overview → 2 Pricing → 3 Gallery → 4 Process → 5 Description → 6 Review`

- Completed steps show a **pencil**, not a lock — step back freely.
- **Preview project** always available: see it as the buyer will.
- Footer: `Save & exit` (quiet text) + `Save & Continue` (filled).

### I2. Field pattern, used for every field

Heading → one-line plain-language helper → input → counter.

- Title carries a **fixed prefix inside the field**: `You will get` ▸
  placeholder. Forces a benefit-shaped title.
- Counter enforces **both ends**: `26/75 characters (min. 7 words)`.

### I3. Category is inferred, not hunted

After a title is typed: "Here are some suggestions based on your project
title" → 5 radios as full breadcrumb paths → "Not seeing the right fit?
Browse all categories".

We need no ML for this — a keyword match against the existing `CATEGORIES`
constant gets most of the way, with Browse-all as the escape hatch.

### I4. Attributes are conditional on category

Before a category: "Select a category above to view options."
After: checkbox grids (`Industry (Optional) — Choose up to 5`), then
`Search tags (optional)`, max 5, type-to-select or Enter for a custom tag.

**This is the capture point for the deliverables spec in §G7** — formats,
number of concepts, revisions, source files — per category.

### I5. Reassurance copy

Right rail: "Need help getting started?" + two links + **"You can always come
back and change your project later."** We ask beta users to post real jobs
with real money; that one sentence removes a real fear.

Note the link to BUG-016: `SavingForm` used to wipe fields on failed
validation. A wizard with genuinely editable prior steps is the structural
version of that fix.

### I6. Not copying

- The Gallery step and the 6-step length. Our jobs are bespoke requests, not
  productised catalogue listings — 2–3 steps, not 6.

## J. Footer — reviewed `Footer`, `footer (2)`
## Category 8 status: COMPLETE (2 of 2)

### J1. Both sites put content ABOVE the footer

- **Fiverr**: "Find freelance talent — your way" — three route cards (post a
  brief / we find them for you €181 / team built for you), each icon + title +
  description + price + button.
- **Upwork**: two illustrated trust cards ("Client feedback counts toward your
  Job Success Score", "**Dispute assistance**") then a centred CTA.

### J2. Footer proper

| | Fiverr | Upwork |
|---|---|---|
| Columns | 5 | 4 |
| Split by audience | For Clients / For Freelancers | — |
| Categories listed | 12 links | no |
| Social | — | Follow Us + 5 icons |
| App | — | Apple + Android badges |
| Notable | Trust & Safety, Social Impact | **Accessibility**, **Release notes**, Your Privacy Choices |

Ours today is a single row: © · version badge · Contact · Terms · Privacy ·
Content policy · Report an issue. Clean, but it is a legal strip, not a footer.

### J3. Add, ranked

1. **Audience split — For Clients / For Creatives.** Biggest structural gap;
   every reference does it.
2. **Category links** from the existing `CATEGORIES` constant. Free navigation
   and free SEO for a marketplace nobody searches by name yet.
3. **Pre-footer "ways in" cards.** We already have three real routes: post a
   job · browse creatives · **invite a client via share link**. That third is
   genuinely unusual and currently almost invisible.
4. **Trust cards above the footer** — escrow, disputes and the admin
   resolution queue all exist, and `/how-money-works` is already written.
5. **"Install the app"** — our equivalent of their app-store badges, and the
   discovery path iOS users currently do not have (see push-banner iOS branch).
6. **Release notes** — the What's New panel already exists behind the version
   badge; give it a real link.
7. **Accessibility statement** — cheap trust signal.

### J4. Not copying

Enterprise/Pro tiers, affiliate + creator programmes, "Do not sell or share my
personal information" (CCPA-specific, not Malawi).

## K. Settings + account menu — reviewed `Fivver settings`,
## `PC user profile drop down`. Category 7 COMPLETE (1 of 1); 11 partial.

### K1. Fiverr mobile settings tab — this is our mobile drawer

Coloured header band: avatar with **camera badge** (change photo inline) ·
online dot · username · bell. Then a grouped list, bold section headings,
every row `icon · label · chevron`:

- **My Fiverr** — My briefs · Saved lists · My interests · Invite friends
- **Settings** — Preferences · Account
- **Resources** — Support · Community and legal · Become a Seller

Our three groups map cleanly: *Your work* (jobs, proposals, saved) ·
*Settings* (account, notifications) · *Help* (how money works, contact,
terms, report an issue).

### K2. Upwork avatar dropdown

Avatar · name · **role label** · **"Online for messages" TOGGLE** · Your
profile · Stats and trends · Account health · Membership plan · Connects ·
**Theme: Light** · Account settings · Log out.

**The online toggle is the honest version of §F's "Online now".**
User-declared beats inferred-from-last-seen: less creepy, more accurate, and
it lets a creative say "not available this week" without vanishing.

### K3. Verb-based desktop nav — worth considering

`Find work ▾` · `Deliver work ▾` · `Manage finances ▾` · `Messages`

Maps to what someone came to DO, not to our table names (Jobs / Proposals /
Payments). Our two roles want different verbs, which fits the role-aware
navigation the tab-bar work needs anyway.

Also there: **search scope selector** (`Search … | Jobs ▾`) — one field that
can search jobs or creatives instead of two separate searches. And a promo
carousel with a **pause button** — accessibility basic we would otherwise miss.

### K4. Not copying

Membership plans, Connects, Account-health scores, identity-verification
badges (that is a KYC programme, not a UI element).

## L. Search + Overview — reviewed `Fivver search`, `fivver search 2`,
## `overview`, `pc guide`. Categories 6 and 10 COMPLETE.

### L1. Task-phrased entry points — best single idea in the set

Fiverr's Interests tab lists **verbs, not taxonomy**:

- "Develop a brand identity" → *Logo Design, Business Cards & Stationery*
- "Get professional photos taken" → *Product, Lifestyle & Fashion Photographers*
- "Create print-ready designs" → *T-Shirts & Merchandise, Illustration*

The category name is demoted to the subtitle.

**A Malawian shop owner does not know they want "Graphics & Design".** They
know they want a logo for their bakery, or photos of stock for WhatsApp. Our
`CATEGORIES` constant is a taxonomy for us, not an entry point for them. A
mapping table of task phrases → categories is small and would change how
findable the whole marketplace is.

Also on that tab: "Choose your interests for a better discovery experience"
with an explicit opt-in button — personalisation the user switches on.

### L2. Upwork Overview — money-centric, not job-centric

Four buckets, each with a `?` tooltip: **Work in progress · In review ·
Pending · Available**, plus "Last payment: $0.00" and the honest footnote
"Note: this report is updated every hour."

**Ours answers "what jobs do I have". Theirs answers "where is my money and
when do I get it".** Our five escrow states already map to buckets: in escrow ·
released · payout pending · paid. A creative wants that as one row of figures.

`?` tooltips matter more for us than for them — we carry `2% + MWK 700` on
bank payouts, a T+1 settlement hold, and separate collection fees.

### L3. Weighted profile completeness (`pc guide`)

Ring around the avatar, "90% complete — You're almost done!", the persuasive
stat "**4.5 times more likely** to get hired", and a checklist with explicit
weights: Portfolio **(+20%)**, Education (+10%), Video introduction (+10%),
Certifications (+10%), Linked accounts (+10%).

We already ship `WelcomeChecklist`. Adding weights and one evidence line turns
a task list into a motivation. Pairs with §F8 (persuasive empty states).

Also there: **"Profile Visibility: Upwork Users Only"** — a real privacy
control on the profile itself.

## M. Profile, continued — reviewed `profile`, `profile 2`

Full section inventory of Upwork's profile (owner view).

**Left rail:** Promote with ads · Connects · Video introduction · Hours per
week ("More than 30 hrs/week", "Open to contract to hire") · Languages ·
**Verifications** (ID: Unverified + *Verify your identity*; Phone: Verified ✓)
· Licenses · Education (with edit AND delete per entry) · Diversity cert.

**Main:** Portfolio (Published/Drafts) · Work history · Skills (labelled
**"Self-reported"**) · Working style · Your project catalog · **Testimonials —
Endorsements from past clients**.

### M1. Testimonials solve our cold-start problem

Separate from reviews: endorsements collected from **past, off-platform
clients**. We are in closed beta with zero review history. A creative who has
been designing in Blantyre for six years has real clients who would vouch for
them. This bootstraps trust BEFORE the review system has data — arguably more
urgent than reviews themselves, and it needs no completed on-platform job.

### M2. Languages — free local differentiation

Chichewa · English · Tumbuka · Yao. A client in Mzuzu choosing between two
designers cares. Neither reference has to think about this; we do.

### M3. "Self-reported" as an explicit label

Honest about what is unverified. Worth copying wholesale as a pattern: it lets
us show trust signals without over-claiming them.

### M4. Also worth taking

- **Verifications block** with visible unverified states and a fix-it link.
  Phone is already required at signup, so one row is already true for us.
- **Availability**: hours per week + open-to-work flag. Pairs with the
  "Online for messages" toggle in §K2.
- **Work history** section — for us this is completed jobs, which we have.
- Per-item **edit and delete** icons rather than one big edit form.

### M5. Not copying

Connects, paid boosts, diversity certification, military veteran, working-style
assessments, project catalog (that is productised gigs — see §G5).

### M6. Fiverr public profile — `Fiver Profile (2)(3)`

**Identity block:** avatar with green online ring + **play-button badge** for a
video intro · name + **@handle** · ★ 4.8 (153) · Level 2 · **tagline**
("Architect 2D 3D Interior exterior Rendering Expert") · 📍 country ·
💬 languages · `More about me` + ♡ · skills chips with a **`+9` overflow**.

**Sticky right card, follows the page:** avatar · name · rate · "Online •
07:53 PM local time" · `Contact me` · `📹 Book a consultation` · avg response
time. **On scroll the header condenses** to avatar/name/rating/tabs/CTA.

**Services tab:** cards of image · category · "I will…" title · **From €10 /
project** · `More details` · `Show all (7)`.

### M7. The "tell them what you need" card — we already built this

Among the fixed service cards sits one that is not a service: *"Want to work
on an hourly basis? Tell <name> what you need."* → `Ask about hourly orders`.

An escape hatch for "none of these quite fit". **We have the mechanism
already**: the creative-initiated job + share link from Session 5. Turned
around, a client on a profile says "none of these — here is my brief" and it
becomes a job invited to that creative. Built, and currently almost
undiscoverable.

### M8. Condensing sticky header

Our profile hero scrolls away and takes Message and Invite with it. This is
the desktop counterpart to the mobile sticky action bar in §G1 — same problem,
same fix.

### M9. Cheap additions

- **Tagline** field: one line, e.g. "Logo and brand design for Malawian small
  business".
- **Languages** (again — see §M2).
- **`+N` overflow** on chip lists instead of wrapping forever.
- **Video intro** as a play badge on the avatar.
- Portfolio items carry a date ("From: December 2025").

### M10. Portfolio item as a CASE STUDY — build this first (`Fiver Profile (4)`)

Not an image with a caption. Each item carries:

- before/after cover image + **photo-count badge**
- `From: December 2025`
- title, e.g. "Hand Sketch to AutoCAD DWG & PDF Conversion"
- a description: what the client provided, the goal, what was delivered
- category chips
- **Project cost: $50–$100** | **Project duration: 1–7 days**
- thumbnail strip ending in a **`+20 Projects`** tile

**Why first:** we already have portfolio items (image + title). Adding a cost
range and duration answers the two questions every client asks before
messaging, without them asking — and it sets price expectations before a
negotiation starts. It needs no reviews, no ratings and no volume; a creative
can fill it in today with work from last year.

Below it: **Work experience** — role · company · Freelance · dates · "5 yrs" ·
bulleted achievements with `more` truncation.

### M11. "Request a testimonial" — the mechanism, and we own it already

Testimonials empty state: "Showcase your skills with **non-Upwork client
testimonials**" → **Request a testimonial**.

It is a REQUEST flow: the creative sends a link, the past client fills it in.
That is what stops it being self-written praise.

**We already have this machinery.** `/j/[token]` lets a creative invite a
client into a job by tokenised URL (Session 5). Point the same pattern at a
testimonial form and a Blantyre designer can bring six years of offline
reputation onto the platform on day one. Same token approach, no new concepts,
and it works before a single on-platform job completes.

### M12. Category 1 status: COMPLETE (10 of 10)

`Fiver Profile (1)(2)(3)(4)` · `profile` · `profile 2` · `profile 3` ·
`profile 4` · `pc profile` · `PC user profile drop down` · `mobile User ui`
(the last was a duplicate of the Upwork drawer, §K).

Remaining sections seen: Certifications, Other experiences ("Add any other
experiences that help you stand out").

## N. Mobile job/gig screens — `fivver jobs mobile (1)–(6)`,
## `Proposals Mobile`, `Upwork jobs drop down`.
## Categories 3 and 11 COMPLETE.

### N1. Multi-dimensional ratings

Fiverr does not show one star score. It shows an overall **and three axes**:

- Seller communication level — 4.9
- Quality of delivery — 4.8
- Value of delivery — 4.8

For us the locally meaningful axes are probably **communication · quality of
work · met the deadline**; and for rating CLIENTS (see §G3): **clear brief ·
paid on time · reasonable with revisions**. Multi-axis makes a 4.2 legible
instead of ominous, and it tells the ratee what to fix.

### N2. Deliverables spec table — the definitive shape for §G7

Mixed value types in one table: `Delivery days: 2 Days` · `Revisions:
Unlimited` · `2D drawings: 1` · `High-level of detail ✓` · `Source file ✓` ·
`Include layout sheets ✓`. Number, text, and tick in the same structure.

### N3. Add-ons with a price delta

`○ Express delivery in 1 day  +€10` — a radio that changes the total rather
than reopening the negotiation. Rush work is real here; this prices it
cleanly.

### N4. PRICE IN THE BUTTON — most important item for a money app

The CTA reads **`Continue (€25)`**, not "Continue".

Ours should read **"Fund escrow (MWK 20,000)"**. At the moment money moves the
amount belongs on the button. It is the cheapest possible defence against "I
did not realise how much I was paying" — which is precisely the complaint that
becomes a dispute.

### N5. Mobile patterns worth taking

- **Seller info as a bottom sheet** (drag handle), with icon-led fact rows:
  From + their local time · level · languages · avg response time.
- **Full-bleed media carousel** with `1 of 20` counter, video play button, and
  back/♡/… floating over the image.
- **Reviews as a horizontal swipeable carousel**, not a vertical list — huge
  vertical-space saving on a phone.
- **Floating "Chat" pill** with the other person's avatar, persistent through
  the whole scroll. The mobile counterpart of §G1's sticky bar.
- **Portfolio grid with a `+20 more` overlay tile.**
- Price tiers as a **segmented control** with an underline indicator.

### N6. Search scope selector (`Upwork jobs drop down`)

`Jobs` — "Apply to jobs posted by clients" · `Talent` — "Find freelancers and
agencies" · `Projects` — "See projects from other pros". Icon + label + **a
sentence explaining the scope**. Ours needs two: Jobs and Creatives.

## O. Home / discovery — `home page`, `home page 2`, `Fivver home`,
## `Fivver home 2`, `fivver home 3`. Category 4 COMPLETE.

### O1. Signed-in home serves TWO jobs at once

Fiverr desktop: "Welcome back, Vincent" then **two action cards with eyebrow
labels** —

- `RECOMMENDED FOR YOU` — "Post a project brief / Get tailored offers" →
  Get started
- `PROFILE PROGRESS` — "You've added 25% of your profile" → Complete Info

Then carousels: "Based on what you might be looking for" (led by a **Keep
exploring** tile) · "Gigs you may like" · "Verified Pro services in Logo
Design".

Our dashboard reports stats and does neither job. Two cards with eyebrow
labels would cover the returning creative AND the browsing client.

### O2. "Vetted Pro" — strongest trust idea in the whole set for our market

"**Hand-vetted talent** for all your professional needs" + a `Vetted Pro`
badge on each card.

We already have an admin role and an admin queue. A **Ganyu-verified** badge —
meaning a human checked this person is real and the work is theirs — is worth
more in Malawi than any algorithmic score. Fiverr cannot credibly do this at
their scale; we can at ours. It also gives a natural premium tier later
without inventing Connects.

### O3. Category landing page (`fivver home 3`)

Back chevron · centred **category title** · **plain-language description**
("Hire a designer to create a logo for a new brand or give your existing logo
a face lift") · filter chips (All / Style / Service includes / Seller Level) ·
**visual sub-filters**.

**The visual style filter is the standout.** `Flat` / `3D` / `Vintage` shown as
*illustrated examples*, not words. Many clients here have never commissioned
design and do not have the vocabulary. Letting them point at a picture is the
difference between briefing and giving up. Applies to logo style, photography
style, video style — just images plus a tag.

Results render as **horizontal cards**: image collage left, rating + title +
♡ + `From €X` right.

### O4. Card anatomy, consistent everywhere

image + ♡ (top-right) · video play badge if video · seller avatar + name +
level · title (2 lines) · ★ rating (count) · **From €X** · optional "Offers
video consultations".

## P. ALL 11 CATEGORIES COMPLETE — synthesis

### P1. The five findings that are not UI at all

1. **Reviews, bidirectional, multi-axis** (§G3, §N1). Clients rated too. Axes,
   not one number.
2. **Testimonials via request link** (§M11) — solves cold-start before any
   review exists, and reuses our `/j/[token]` machinery.
3. **Derived trust numbers** (§G2) — hire rate, jobs posted, total spent,
   member since, response time. All computable from data we already hold.
4. **Structured deliverables spec** (§G7, §N2) — the cheapest dispute
   reduction available, captured at proposal time.
5. **Ganyu-verified badge** (§O2) — human vetting as the local trust moat.

### P2. The five cheapest UI wins

1. **Price in the CTA** — "Fund escrow (MWK 20,000)" (§N4).
2. **Sticky action bar** (mobile) / **sticky money card** (desktop) (§G1, §M8).
3. **Portfolio items as case studies** with cost + duration (§M10).
4. **Persuasive empty states** with a real CTA (§E, §F8).
5. **Bottom tab bar** + grouped drawer (§A, §K1).

### P3. Recurring structural gaps

- We have no **save/♡** affordance on cards anywhere, despite `interactions`.
- We have no **"From MWK X"** price framing on creative services.
- We have no **task-phrased entry points** (§L1) — only a category taxonomy.
- We have no **visual filters** (§O3).
- Nothing is **carousel-shaped**; everything is a vertical list.


Remaining: `IMG_2963`, `2965`–`2977` (13 mobile), and all 26 desktop
screenshots — job detail on scroll, creative profile, settings, messaging
thread, footer.
