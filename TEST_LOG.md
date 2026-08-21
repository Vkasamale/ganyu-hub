# Test Log

Tracks what's been hands-on tested vs. what's been built but not yet confirmed working. Works alongside [`GanyuHub_DevRoadmap.md`](GanyuHub_DevRoadmap.md) (what to build) and [`BACKLOG.md`](BACKLOG.md) (known issues to fix later).

Legend: ✅ verified · ⚠️ tested with known issue · 🕒 prompted to test, awaiting confirmation · ⬜ never tested

## 2026-08-21 — The design port

- ✅ `tsc --noEmit` clean and `npx next build` green.
- ✅ **Verified in the preview at 1440 and 390:** white ground with off-white
  cards, teal intact; the landing bands alternate white and `#F2F1EE`; the
  drawer and bottom tab bar read as raised; empty states show the `nothing-yet`
  stamp; the hero photographs crossfade and every line of type holds at both
  widths.
- ✅ **Measured rather than eyeballed:** the thread list rows were 531px inside
  a 364px panel and every timestamp was clipped — three containers needed
  `min-w-0`. The sticky money card holds at 80px through a 1200px scroll. A
  229 KB hero original is served at 39 KB at 640px wide.
- ✅ Page titles are upright — caught only from a screenshot, since `<em>` is
  italic by default and the diff looked correct.
- ✅ `/auth/signout` GET redirects instead of returning 404.
- ✅ **The 390 pass is done** (signed in, 375x812, in-app browser). It found
  four real defects, all fixed in `a30d530` and logged as BUG-022 through
  BUG-025. The worst was the message composer sitting entirely behind the
  bottom tab bar — messaging was unusable on a phone, and it was found by
  measuring the composer's bottom edge (821px in an 812px viewport), not by
  looking. The dashboard money tiles were the only surface that needed no
  change.
- ✅ Composer re-measured after the fix: attach, Job, field and Send all clear
  of the tab bar.

## 2026-08-21 — Screens 02, 03, 04, 08 and the deferred data

- ✅ Screen 02 needed one change only — "0 proposals" is gone. Confirmed at 390
  that no card renders a zero and that "1 proposal" still does.
- ✅ Screen 03: the star average now sits under the identity block. Checked on a
  profile with reviews (reads "5.0  1 review" on one line) and on one without
  (no rating row at all, rather than 0.0).
- ✅ Screen 04: the availability switch renders and its knob sits inside the
  track — the first version had no `left` anchor and the knob measured 44px
  past the end of a 44px track, which a screenshot alone would not have caught.
  The greeting sentence correctly stays silent when nothing is on you.
- ✅ The released tile is now a month: MWK 22,000 in August against a lifetime
  MWK 211,000, so the filter is demonstrably doing something.
- ✅ "Needs a reply" filters 19 threads down to 1 — the direct message the other
  person sent last. Its count renders; "Unread" with nothing unread still shows
  no number.
- ✅ "1 accepted of 4" renders on a job with an accepted proposal.
- 🕒 **"What you paid" has never been seen.** It renders only for the client on
  a funded job, and the signed-in account is a creative. The figures are correct
  by inspection — real `collection_fee_mwk` where PayChangu wrote one, the 3%
  estimate labelled as an estimate otherwise — but nobody has looked at it.
- 🕒 **The availability switch has not been clicked.** It writes through the
  existing `updateAvailability`, which the profile page already uses, but
  toggling it changes whether clients can send this account work, so it was
  left for the founder.
- ⚠️ **Sign out was broken for a different reason than anyone thought** — see
  BUG-026. Every route handler in the app was 404ing from a stale Turbopack
  cache, sign out among them. After clearing it: `/auth/signout` POST returns
  303 to `/`, GET returns 302, `/api/sentry-check` returns its 401. Verified
  with curl against the running dev server.
- ✅ **Confirmed by the founder in the browser 2026-08-21:** clicking Log out
  ends the session and lands on the landing page.
- ✅ The last two mockup details: the released tile reads "paid to Airtel Money"
  (the account's real default method, not a guess), and the profile reads
  "5.0  1 review · 8 jobs done" on one line at both 1440 and 390. The 8 matches
  the dashboard's lifetime released count, which is the point of counting them
  the same way.
- ⬜ **No physical device.** Everything above is the in-app browser at a resized
  viewport, which is not a mid-range Android in sunlight — the exact condition
  the small ground-to-raised step was accepted against.
- ⬜ The seven hero photographs have not been checked for licensing. One of the
  originally supplied set carries a "PJM PHOTOGRAPHY" watermark; provenance for
  the rest is unconfirmed.

## 2026-08-19 — Passkey sign-in

- ✅ `tsc --noEmit` clean and `npm run build` green.
- 🕒 **Everything else is unverified, and cannot be verified here.** WebAuthn
  requires the page origin to match the Relying Party ID (`ganyuhub.com`), so
  the buttons do nothing on localhost or on a preview deployment. The founder
  must test on the live site:
  1. `/dashboard/account` → Passkeys → **Add a passkey** → device prompt →
     "Passkey added".
  2. Sign out, then `/login` → **Continue with a passkey** → device prompt →
     lands on `/dashboard` already signed in.
  3. Cancel the prompt at step 2 — expected: the button returns to rest with
     **no** red error, since a cancel is not a failure.
  4. Open `/login` on a browser without WebAuthn — expected: the passkey
     button is absent entirely, not present-and-broken.
- ⬜ Deleting a passkey. Not built; there is no way to remove one from the UI.

## 2026-08-13 — Phases 7, 8 and most of 9

Verified as Adam Creative (Chrome) and as EQ Admin Client (preview browser).

- ✅ `tsc --noEmit` clean and 93/93 unit tests green at every commit.
- ✅ **Phase 7 shell** — tab bar pinned to the viewport bottom at 375×812 (bar
  bottom 812), 5 slots, Home marked current, desktop nav hidden; drawer opens
  with 4 groups, 12 links, version at the foot, body scroll locked; at full
  scroll the footer ends at 756 with the bar at 758.
- ✅ **Verb nav, both roles** — client sees Find someone / Manage work /
  Finances; **creative sees Find work / Deliver work / Get paid** (confirmed on
  Adam's session), settings gear present.
- ✅ **Item 59** — sub-tabs render with active state; zero counts hidden.
- ✅ **Items 62/63** — role-aware ways-in cards; signed-out gets "Join as a
  creative" plus the trust cards and no tab bar.
- ✅ **Phase 8 wizard** — inference fills the category, Continue advances,
  completed steps stay clickable with a pencil, preview shows title/category/
  budget, draft saves and restores.
- ✅ **Item 69 XSS** — a brief containing `<script>` and an `onerror` img
  executed nothing and left zero script/img elements, while bold and bullets
  rendered. Links carry `rel="noopener noreferrer nofollow ugc"`.
- ✅ **Item 76, 10-image piece (Adam)** — "1 of 10" at rest, tracks a real
  scroll gesture to "6 of 10" then "8 of 10", arrows reach "10 of 10" where
  Next disables. Single-image items show no counter; an item with no cover
  renders the gradient instead.
- ✅ **Item 78** — renders bio, "Based in Malawi", "On Ganyu Hub since July
  2026"; nothing invented.
- ✅ **Item 72** — exactly one receipt, on the last of my messages, reading
  "1d ago · Sent".
- ⬜ **Item 72 "Seen"** — needs `phase9-messages.sql` RE-RUN (the RLS update
  policy was added after the first run) and then both accounts opening the
  same thread.
- ⬜ **Item 77 admin control** — Mark checked / Withdraw unverified; the
  browser session was signed out when it was built.
- ⬜ **Message editing** — `edited_at` renders an "Edited" marker but no edit
  UI exists, so the marker is dormant.

**Measurement note for the next session:** Chrome suppresses scroll events in a
BACKGROUNDED tab (`document.hidden === true`), so synthetic `scrollLeft` writes
fire no handlers and a carousel looks broken when it is not. Drive a real
gesture (`computer` scroll) before concluding anything about scroll code.

## 2026-08-13 — Phase 6 complete + the home/dashboard split (v0.9.9–v0.9.12)

- ✅ `tsc --noEmit` clean at every commit.
- ✅ **Item 43** — 8 category cards lead with the task phrase, category as
  subtitle, hrefs intact.
- ✅ **Item 47** — service card renders cover (4500×4500 portfolio image),
  "From MWK 50,000 · ~5d". Rating row correctly ABSENT for an unreviewed
  creative.
- ✅ **Item 49** — `/c/video-photography`: H1 "Film or photograph something",
  8 creatives correctly filtered, canonical + meta description present,
  filters post back to `/c/…` not `/browse`, unknown slug 404s.
- ✅ **SEO** — `/robots.txt` serves the disallow list; `/sitemap.xml` 200 with
  115 URLs including all 24 category pages.
- ✅ **Home/dashboard split** — signed-in `/` shows welcome + action cards +
  carousel and no marketing hero; `/dashboard` shows "Your numbers" with no
  carousel; a **cookie-less fetch of `/` still returns the landing page**.
- ✅ **Item 50** — 6 swatches on `?category=Design`, **0** on
  `?category=Legal & Compliance` (the gate works), `?styles=flat` degrades to
  "0 creatives found" with a removable chip rather than erroring.
- ✅ **Item 55** — home lists 7 active jobs with per-role next steps; job page
  shows "Proposals so far 1 of 10" and omits the zero rows.
- ✅ **Item 52** — history row rendered, Clear All clicked, row gone.
- ✅ **Item 53** — `?q=logo` carries `/browse` → `/jobs`, current scope marked,
  correctly absent on `/c/design`.
- ✅ **Item 54** — trust row live ("Has paid into escrow · Hires 79% of the
  time · 28 jobs posted"), 38 dismiss controls, dismissal survives reload.
- ⬜ **Item 50 end-to-end** — no creative has declared a style yet, so the
  `overlaps` match itself is unproven. Declare one on `/dashboard/profile`,
  then check `/browse?category=Design&styles=flat`.
- ⬜ **Item 51 co-view** — needs ≥2 users with overlapping view history; the
  seed data falls back to "Others in <category>".
- ⬜ **Item 55 creative view** — "Client last active" unproven: every job to
  hand belongs to the signed-in admin, so only the client branch rendered.

## 2026-08-12 — Phase 6 spine (v0.9.8)

- ✅ `tsc --noEmit` clean.
- ✅ Rendered live in the preview browser as a client: both action cards, the
  "Creatives you might work with" carousel with See all, and "Your numbers"
  retained below.
- ✅ Carousel scrolls: 8 cards, scrollWidth 2464 vs clientWidth 708 — the peek
  is real, not theoretical.
- ✅ ♡ save renders on feed cards (item 48).
- ✅ Creative side: action card + "Jobs worth a look" carousel with 8 real jobs;
  progress card correctly ABSENT for a complete profile.

**Note for whoever reads the console next:** a `getSessionUser is not defined`
error is in the Chrome console history from 17:40, BEFORE that import was
added. It is stale. A separate Chrome tab showed an empty `<main>` while the
server returned the full 160KB of HTML and the preview browser rendered it
correctly — a browser-session problem, not a server one. A hard reload is the
first thing to try.

## 2026-08-12 — Role gating + auto-posting reviews (v0.9.7)

- ✅ `tsc --noEmit` clean; `/dashboard/portfolio`, `/dashboard/services`,
  `/dashboard/testimonials`, `/browse`, `/` all 200.
- ✅ **Admin bypass confirmed**: signed in as EQ Admin Client (an admin), all
  three creative tools returned 200 rather than redirecting.
- ⬜ **The block itself is untested** — it needs a NON-admin client account.
  Every client account to hand is an admin, so the redirect path has never run.
- ⬜ Auto-posting reviews: never exercised (Claude cannot submit forms; needs a
  completed job and a human click on the third star).
- ⬜ That a partially-rated review does NOT post.

## 2026-08-12 — Phase 5 (v0.9.6)

- ✅ `tsc --noEmit` clean.
- ✅ `proposals.revisions_offered` confirmed already wired — read, not assumed.

**⬜ NOT TESTED.** `supabase/phase5-deliverables.sql` is not applied, so none of
these columns exist yet. Nothing below has run:

- ⬜ proposal spec capture (concepts, delivery days, formats, source files)
- ⬜ the three-state source-files field storing null vs false
- ⬜ add-on with price delta
- ⬜ AI disclosure
- ⬜ the spec table rendering on the job and on a proposal
- ⬜ category-specific labels changing with the job's category
- ⬜ seller FAQ parsing ("q | a" per line) and its profile block

## 2026-08-12 — Phase 4 (v0.9.5)

- ✅ `tsc --noEmit` clean throughout; `/creatives/[id]?tab=reviews` 200.
- ✅ Item 36 confirmed already implemented in `lib/feed.ts` — read, not assumed.

**⬜ NOT TESTED — everything requiring the migration or a form submit.** The
Phase 4 migration (`supabase/phase4-reviews.sql`) was NOT applied at the time
of writing, so none of the axis columns or the response column exist yet in the
database. Nothing below has run against real data:

- ⬜ multi-axis submission and the derived overall rating
- ⬜ the axis breakdown rendering under a review
- ⬜ the ratee's reply, and the DB-level block on editing a rating
- ⬜ the client-rating row in "About the client"
- ⬜ job title + amount under each review
- ⬜ the mobile reviews carousel at 375px
- ⬜ the review prompt firing on `payment_released`

**Blocked, carried from Phase 3:** Claude cannot submit React server-action
forms in this app. Retried after the session was confirmed healthy and signed
in — fields filled, click registered, still no row written. Every form the
founder clicks works first time. Verification of all form paths must be done by
hand.

## 2026-08-12 — Phase 3 + BUG-020 (v0.9.4)

- ✅ Migration applied; `testimonials` table reachable.
- ✅ `/dashboard/testimonials` renders for a creative; "On your profile (0)".
- ✅ **Create link works** — founder clicked it, row written with status
  `pending` and a token.
- ✅ `/t/<token>` renders for an anonymous visitor: creative's name, headline
  and location, the explanation, three fields, and the notice that the creative
  chooses whether to publish but cannot edit.
- ✅ Invalid token renders the not-found page. NOTE: that fetch returned HTTP
  200 rather than 404 — right page, questionable status. Confirm on a real
  deploy.
- ✅ BUG-020 migration: all 36 page-level `getUser()` call sites now use the
  request-cached `getSessionUser()`. `/`, `/browse`, `/jobs`,
  `/how-money-works`, `/login` all 200; dashboard renders signed in.
  `components/multi-image-picker.tsx` deliberately untouched (client component).

**⬜ NOT TESTED — the second half of the testimonial loop.** Claude's browser
automation cannot submit React server-action forms in this app: across a click,
`requestSubmit()`, a cleared service worker, a fresh `.next` build and after the
auth rate limit reset, **no POST ever reached the server**. Forms clicked by the
founder work first time, so this is a tooling limit, not a product defect — but
these paths are unproven and must be exercised by hand before launch:

- ⬜ `submitTestimonial` writing a submission
- ⬜ the single-use token guard (second submission must be refused, and the
  link must show "already done")
- ⬜ publish/hide, and the block appearing on the public profile
- ⬜ that testimonials stay OUT of the landing carousel (reviews only)
- ⬜ Turnstile on the public form — disabled locally this session, so the bot
  check has never run

## 2026-08-12 — Phase 2 (v0.9.3)

Verified on `localhost:3000` against production Supabase, signed in as Adam
Creative viewing a job posted by EQ Admin Client.

- ✅ `tsc --noEmit` clean.
- ✅ "About the client" renders with real figures: 28 jobs posted, 6 open,
  61% hire rate, MWK 388,000 paid through escrow, member since June 2026.
- ✅ Badges: "Has funded escrow before", "Hires people again", "Phone on file".
- ✅ `/clients/[id]` now reports the same 61% as the job page — the two
  surfaces agreed for the first time.
- ✅ Item 25: all three money tiles expose a `?` with an `aria-label`.
- ✅ Reply-time row correctly ABSENT — this client has fewer than three
  measured replies, so the field returns null and the row is omitted.

Not yet tested:

- ⚬ Item 22 with real data — no account has 3+ measured reply pairs yet, so
  the median has never rendered a value. The null path is confirmed; the
  formatting path ("under an hour" / "about 3 hours") is not.
- ⚬ The "New to Ganyu Hub" branch — every test client has funded escrow.
- ⚬ Hire rate below the 3-job threshold returning null.

## 2026-08-12 — Phase 0 and Phase 1 (v0.9.2)

Verified against live data on `localhost:3000` (production Supabase), signed in
as both EQ Admin Client and Adam Creative. Browser screenshots were unavailable
this session — the preview pane stopped compositing — so checks were made
against the rendered DOM instead.

- ✅ `tsc --noEmit` clean after every step; dev server compiled with no errors.
- ✅ L8 testimonials render live (2 cards, real reviews), L9 featured creatives
  render 6 cards; L10/L11 show their "not yet" notes.
- ✅ §N4 money label: job *proposal 2 TEST* shows `Release MWK 5,000`; a
  released job correctly shows no money button at all.
- ✅ Sticky bar at 674px: `href="#payment"`, label matches the in-page button,
  `#payment` anchor present. `md:hidden` class present and the ≥768px rule is
  in the compiled CSS.
- ✅ Unread pill full cycle: pill `1` with `aria-label="1 unread message"`, row
  bolded, both cleared after opening the thread, preview updated to the new
  message.
- ✅ Empty states: saved-jobs tab renders title, body and CTA. Empty thread
  shows the quiet line with no button.
- ✅ `+N` chip on `/browse` (`+1`, hidden skill in the tooltip).
- ✅ Weighted checklist renders with the two new steps; all five tick for a
  complete profile, which confirms the new portfolio/service head-counts.
- ✅ Phase 1 migration confirmed applied — read-only column check found all 10
  new columns on `portfolio_items` and `profiles`.
- ✅ Case-study fields render on the add form with correct names; `cost_*` are
  hidden inputs because `MoneyInput` submits a raw number behind a formatted
  display field.
- ✅ Profile fields 10-13 render; both toggles default to checked, matching the
  column defaults.
- ✅ Profile tabs: `?tab=reviews` shows only Reviews, default shows About and
  Skills, sidebar unaffected in both.

Not yet tested:

- ⬜ Case-study chips on a public profile card — no portfolio item has cost or
  duration filled in yet.
- ⬜ Loud empty-inbox state — every test account has conversations.
- ⬜ `+50%` / `+25%` checklist chips — they show only on incomplete steps and
  both test creatives are complete.
- ⬜ Desktop-width confirmation that the sticky bar hides; the preview pane
  could not exceed 674px.
- ⬜ Anything on a physical phone. Carried from the landing-page session: the
  install banner's iOS branch and the footer accordion are still untested on a
  real device.

## 2026-08-12 — Announcement bar (L1c)

Browser-rendered at 375 and 1280. No device testing needed — unlike L1b there
is no platform-specific branch.

- ✅ `tsc --noEmit` clean, home page 200.
- ✅ Renders above both the install banner and the nav; nav returns to
  `top: 0` once dismissed.
- ✅ Dismiss writes `ganyu-announcement-beta-2026-08` — namespaced by id, so a
  new announcement is not pre-dismissed.
- ✅ **Handoff with the install banner verified end to end:** announcement live
  ⇒ install suppressed; announcement dismissed + reload ⇒ install appears.
- ✅ Judged from a screenshot. Two defects found that way and fixed — the
  three-line copy wrap, and the two-bar stack.
- ⬜ Never opened on a physical phone.
- ⬜ The `ANNOUNCEMENT = null` path is correct by inspection but has not been
  exercised — worth a 10-second check the first time the bar is retired.

## 2026-08-12 — Install banner (L1b)

Browser-rendered with a **synthetic** `beforeinstallprompt`. The real event
cannot be fired on demand, so the trigger is simulated; everything downstream
of it is real.

- ✅ `tsc --noEmit` clean, home page 200.
- ✅ Renders above `<header>` in document order; nav sits at `top: 65.5` with
  the bar present and `top: 0` once dismissed.
- ✅ Dismiss removes it, writes `ganyu-install-dismissed=1`, and a second
  `beforeinstallprompt` after dismissal is correctly ignored.
- ✅ Judged from a screenshot at 375 and 1280 per `DESIGN.md` §4. One defect
  found and fixed — three-line wrap on mobile.
- ⬜ **The iOS branch has never run.** It is the whole reason this component
  exists and it cannot be exercised from a desktop browser. Needs a real
  iPhone: the bar should show "Tap Share then Add to Home Screen" with no
  Install button.
- ⬜ A real `beforeinstallprompt` on Android Chrome, and whether
  `prompt()` actually opens the install sheet.
- ⬜ Suppression on `/dashboard` — needs a signed-in session, and the founder
  performs all logins.
- ⬜ Standalone detection (banner must not appear once installed).

## 2026-08-12 — Landing page footer (L5)

Automated + browser-rendered. **Not opened on a real phone.**

- ✅ `tsc --noEmit` clean.
- ✅ All 22 footer links return 200 against the dev server: `/jobs/new`,
  `/browse`, `/how-money-works`, `/content-policy`, `/signup?role=creative`,
  `/jobs`, `/dashboard/report`, the 8 category links, `/browse`, `/contact`,
  `/terms`, `/privacy`, `/release-notes`.
- ✅ `/release-notes` renders 200 and lists every entry in `RELEASES`.
- ✅ Rendered at 1280×900: four columns, all lists `display: block`,
  chevrons `display: none`, column buttons `pointer-events: none`.
- ✅ Rendered at 375×812: all four lists `display: none`, chevrons visible,
  clicking a column header flips `aria-expanded` to `true` and its list to
  `block`. No horizontal overflow.
- ✅ Judged from a screenshot at both widths per `DESIGN.md` §4. One defect
  found that way and fixed — see CHANGELOG (the `mt-16` seam).
- ⬜ Never opened on a physical phone. The accordion is a touch control and
  the tap targets have not been checked by thumb.
- ⬜ Keyboard traversal of the accordion not checked.

## 2026-08-08 — PWA + web push

**Nothing here has been opened on a phone.** Automated checks only. The whole
feature is device-shaped — install prompts, lock-screen notifications, iOS
home-screen behaviour — so the automated green below proves the code compiles
and the prune logic branches correctly, and proves nothing else.

✅ **Automated.** `npx tsc --noEmit` clean. `npm test` 88/88 across 16 files
(+3 new in `tests/lib/push-prune.test.ts`: 410 deletes the subscription, 500
keeps it, success touches nothing). `npm run build` passes;
`/manifest.webmanifest` prerenders static, `/offline` builds as a route.

✅ **VAPID keys checked.** Public key decodes from base64url to 65 bytes
starting `0x04` — a well-formed uncompressed P-256 point; private key is 32
bytes. `NEXT_PUBLIC_VAPID_PUBLIC_KEY` added as a case-sensitive-identical alias.
Not proven to be a *pair* — only a real send proves that.

⬜ **Install on Android.** Add to Home Screen offered; installed app opens
full-screen with the maskable icon uncropped.

⬜ **Permission → subscription row.** Banner Enable → `select profile_id,
endpoint from push_subscriptions` returns exactly one row.

⬜ **End-to-end push.** Sandbox job funded and released; notification arrives
with the app fully closed; tapping it opens `/jobs/[id]`.

⬜ **Denied permission on a second account.** Banner disappears, one toast, no
console errors, no re-prompt on reload.

⬜ **iOS Safari.** Expected: silent no-op in a plain tab (no `PushManager`
until installed), working only after Add to Home Screen. That is platform
behaviour, not a bug — but it has not been seen.

⬜ **Standalone-mode navigation.** No browser back button once installed; no
job flow has been walked start-to-finish in that frame.

⚠️ **Webhook secret was misnamed locally.** `.env.local` had
`PAYCHANGU_WEBHOOK_SECRET_KEY`; `lib/payments.ts:126` reads
`PAYCHANGU_WEBHOOK_SECRET`. Local webhook signature verification was returning
false for every request. **Vercel had the correct name all along**, so Preview
and Production were unaffected — this never touched a deployed environment.
Renamed locally 2026-08-08.

## 2026-08-07 (evening) — Messages / job conversations

Verified live in Chrome as EQ Admin Client on the `sandbox-test` preview, after
running `supabase/backfill-job-threads.sql` (42 threads created, 0 missing).

✅ **Conversation list.** Chips read All 25 / Jobs 23 / Direct 2, counts correct.
Job threads group under the person; previews show the job's actual last event
("Job completed", "Payment released to creative", "Work started", "Deadline
extended"). Sorted by activity — today's throwaway top, then yesterday, then
July. Timestamps render "22:00" / "20:11" for today and "22/07/2026" for older.

✅ **Search.** Typing "released" narrowed 25 conversations to the one whose last
event was "Payment released to creative", and the group header updated to
"1 job" — so search reaches preview text, not just titles and names.

✅ **Collapsible groups.** 25 conversations render as 5 rows: Adam Creative
(18 jobs), Hashtag CRE (1), Faith Kimu (4), then 2 direct messages. No scroll.

⬜ **Thread view itself not opened in a browser.** The merged event/message
stream, the event anchors, the "Latest event" jump link and the job-picker chip
are all typechecked and pushed but unverified on screen. Next session: open one
of the backfilled threads and look.

⬜ **Notification tabs split — still unverified live**, and this is the item the
founder actually reported. Open the bell: job events should now sit under Jobs,
real chat under Messages.

⬜ **Merged send-work-for-review → status advance** still needs a *funded* job to
verify; the delivery panel only renders while a job is active.

## 2026-08-07 (later) — BUG-018 and BUG-012 both verified

Third live run of the day, both accounts driven (EQ Admin in Chrome, Adam
Creative in the preview pane). Job `849eb4c9-26af-4bee-8fef-ad952fdef1ce`,
MWK 20,000, on the `sandbox-test` preview. Full path exercised: post → propose →
accept → fund → deliver → dispute → release from disputed.

✅ **BUG-018 closed.** Exactly one `payment_released` row, `via = reconcile`.
The webhook lost the compare-and-swap and correctly wrote nothing. This is the
check that could only ever be done live.

✅ **BUG-012 closed.** Released from `payment_disputed` and money actually
moved: `payout_ref = gh_po_849eb4c9…`, `payout_status` null (cleared on success,
by design), `payout_error` null, `escrow_status = payment_released`. The old
path marked the job released and moved nothing.

✅ **Money-state badge, all 5 states now seen live.** Red "IN DISPUTE" was the
last one outstanding. The "Creative receives" line correctly switches to past
tense once released.

✅ **Previously-unverified §3 items, all confirmed.** Chevron collapsibles
(brief, Activity, Send delivery) point down collapsed and flip up open; sandbox
settlement copy no longer promises "the next business day"; share links from the
preview deploy now emit preview URLs, so the Vercel system-env-var switch is on.

⚠️ **Delivery does not advance job status.** Sending a delivery logs
`files_delivered` and notifies the client, but leaves `status` at `in_progress`
— the stepper stays on step 3 and "Delivered" never ticks. "Mark as submitted"
is a separate button the creative has to find. Left as-is by decision; the
tracker is misleading until they press it.

🕒 **Close job (new) — awaiting live check.** Creative-side "Close job", gated on
`payment_released`. Covered by `tests/actions/close-job.test.ts` (4 cases); not
yet exercised in the app.

## 2026-08-07 — BUG-017 verified, BUG-016 verified, BUG-018 found

Second live run of the day, both accounts driven (EQ Admin in Chrome, Adam
Creative in the preview pane). Job `d2a9aea7-bbf9-4059-98fe-bc0bda536c58`,
MWK 2,000, on the `sandbox-test` preview.

✅ **BUG-017 closed.** `payment_released` written with `created_at`
`18:11:34+00`. This is the check that had been outstanding since the constraint
was altered — the fix is now proven, not assumed.

✅ **BUG-016 closed.** Submitted a brief under 200 characters; the error fired
and Title, Category, Brief, Deliverables, Deadline and Budget all survived.

❌ **BUG-018 found by the same query** — two `payment_released` rows, 620ms
apart, `via: reconcile` and `via: webhook`. Fixed same session; **the fix is
unverified.** It depends on PostgREST returning an empty array for a filtered
update that matches nothing, which the mock suite cannot demonstrate. One more
funded release, checking for exactly one row, is the outstanding test.

✅ **Money-state badge, 3 of 5 states seen live.** Grey "NOT FUNDED YET" on the
open job, sky "HELD IN ESCROW" once funded, emerald "RELEASED TO CREATIVE" after
release. Held vs released are unmistakably different, which was the point.
⬜ Amber `payment_pending` and red `payment_disputed` still unseen — the dispute
one comes free with the BUG-012 test.

✅ **T+1 sandbox bypass still working** — Release button live immediately, no
countdown.

✅ **Redesign confirmed on both sides** — payment card under the header,
collapsed brief with terms still visible, one-line activity, single action row.

⬜ **Not re-checked after the chevron / sandbox-copy / share-link changes** —
those shipped after this run. Unit tests green (71), nothing looked at.

## 2026-08-07 — Job page redesign: built, nothing verified

Typecheck clean, 69/69 unit tests green. That is the entire evidence base — the
change is presentational and the suite covers none of it.

⬜ **Money-state stamp badge** — needs eyes on all five states: not funded,
pending, held, released, disputed. Released vs held is the pair that matters,
since indistinguishable grey text is what prompted the work.

⬜ **Payment card under the header** — check both roles. The client's
pending-payment notice now says "use Cancel pending payment *above*"; that
wording followed the move and needs confirming against the actual layout.

⬜ **Collapsible brief / activity / delivery** — confirm the teaser truncates
sensibly on a long brief, the activity one-liner names the right current stage,
and the terms row stays visible while the brief is collapsed.

⬜ **Dispute as a button** — confirm it sits in the action row with extension
and cancel, and still submits. `raiseDispute` itself is untouched.

⬜ **Creative-side view** — every check above has a creative counterpart; the
delivery card only exists on that side.

## 2026-08-07 — Check 3 closed: the release works, the event never landed

First complete escrow release run end to end in the sandbox, both accounts
driven live (EQ Admin in Chrome, Adam Creative in the preview pane). Job
`99e8569b-dd4a-4125-bba2-6e960413c64f`, MWK 2,000.

✅ **Post → propose → accept → fund → release all work.** Client paid MWK 2,060
(2,000 + 3% collection fee), escrow moved `none → payment_pending →
payment_held → payment_released`, and the release completed with no 24h wait.

✅ **T+1 sandbox bypass works, server and UI.** The server exemption alone left
the Release button disabled behind a 23h countdown — the escrow panel mirrors
the guard client-side and needed the same treatment.

✅ **BUG-014 verified live.** Header read "JOB VALUE" before funding, "MONEY IN
ESCROW" while held, "RELEASED TO CREATIVE" after release.

✅ **BUG-015 verified live.** "30th of September 2026" everywhere on the page.

✅ **Both-rails payout display verified live** — "MWK 1,960 to mobile money /
MWK 1,260 to bank" plus the provider-attribution line.

❌ **BUG-017 — the `payment_released` event was never written.** `select * from
job_events` for the job returned only `escrow_funded`, `proposal_accepted`,
`work_started`. Root cause was a CHECK constraint that never allowed the value.
The `alter table` has been run on the live DB; **a fresh release still needs to
be run to confirm the event now lands.**

⬜ Still unverified from earlier today: BUG-012 (needs a disputed job) and
BUG-016 (Post a job with a brief under 200 characters).

## 2026-08-07 — Bug-fix round: BUG-012, 014, 015, 016

✅ tsc clean. ✅ 66/66 (was 65). New case in
`tests/actions/deadline-extension.test.ts` asserts the logged event body reads
"New deadline: 14th of September 2026." rather than the raw ISO date.

⬜ **BUG-012 (disputed → released now pays) — not verified in the app.** Needs a
job driven into `payment_disputed` and released against. The unit suite doesn't
cover `updateEscrowStatus` at all, so the only evidence so far is the branch
condition itself. Worth doing before this is trusted with real money.

⬜ **BUG-014 (header label) — not seen in a browser.** Pure render change off
`escrow_status`; `changu` and `AIRTEL TEST` are both `payment_released` and
should now read "RELEASED TO CREATIVE".

⬜ **BUG-016 (form data loss) — not covered by a test.** jsdom isn't installed
and one assertion doesn't justify the dependency. Check by hand: Post a job with
a brief under 200 characters and confirm Title and Deadline survive the error.

🕒 **Check 3 (`payment_released` job event) still open.** Blocked as before:
Adam needs a mobile payout method with the leading zero, job
`0ba49618-187c-4b8a-8468-2c55da31b527` needs funding, and the T+1 guard puts the
release 24h out.

## 2026-08-07 — Session verification: deadline history, client profiles, payout errors

✅ tsc clean. ✅ 65/65 (was 62). New `tests/lib/payout-error-message.test.ts`
covers the three `apiMessage` branches: string kept as-is, object serialised
rather than coerced to `[object Object]`, empty body falling back to the status
line.

✅ **Deadline history — verified in the real app** (preview, production DB).
Three extensions on job `e988c85c…`, alternating proposer so each party could
approve-then-propose in one sitting: E1 → 2026-09-01, E2 → 2026-09-15, E3 →
2026-09-29. After E2 the strikethrough appeared showing 2026-09-01; after E3 it
**still** showed 2026-09-01, not 2026-09-15. `original_deadline` stamps once and
holds. This also confirms the column exists in production — a missing column
would have made Supabase reject the whole update and the deadline would never
have moved.

Note: the job had no prior deadline, so E1 correctly stamped nothing (null start
→ `coalesce` keeps null). That makes a *third* extension necessary to prove
"keeps the first, not the previous" on such a job — two are only enough when the
job was posted with a deadline.

✅ **Client profile page — verified.** `/creatives/7efeadbd…` redirects to
`/clients/7efeadbd…`; renders jobs posted, hire rate, completed, member since,
and the empty-reviews state.

⚠️ **`payment_released` event — NOT verified, blocked.** Needs a real completed
release. Two attempts on `9f140436…` (TNM TEST) both failed at
`direct-charge/payouts/initialize`; escrow stayed `payment_held`, no money moved.
The creative's newly-added payout method didn't apply because `actions.ts:1470`
prefers the method pinned to the job over the creative's default. Retest with a
fresh job so the pinned method is the current one — and note releases are blocked
for 24h after funding by the T+1 guard (`actions.ts:1428`), so funding and
release cannot happen in the same session.

## 2026-08-07 — payment_released event

✅ tsc clean. ✅ 62/62.

⬜ **No automated test, deliberately.** The change adds no branch of its own —
it hangs two `logJobEvent` calls off the existing `verified.status === "success"`
arms. `tests/api/paychangu-webhook.test.ts` has no payout-path coverage at all,
so a test would mean building a full payout-webhook fixture to assert one call
fired. The compiler already enforces the part that can silently break: `LABELS`
is `Record<JobEventType, string>`, so an unlabelled event type won't build.

🕒 **Manual check** — needs a real sandbox release, same lesson as BUG-009:
a reachable code path is not a completed payment.
- Fund a job, wait out the T+1 hold, release. When the payout webhook lands,
  the job timeline must show **"Payment released to creative"**.
- Confirm the `job_events` row carries `metadata.via = "webhook"` (or
  `"reconcile"` if it came through the reconcile path instead) and a non-null
  `amount_mwk`.
- `logJobEvent` swallows its errors by design so a log write can never block a
  payout — so if the row is missing, check the function logs for
  `[job-events] insert failed`, not the UI.

## 2026-08-07 — Extra-revision top-ups hidden from the accept panel

✅ tsc clean. ✅ 62/62.

⬜ **No automated test.** The change is a `.startsWith` predicate inside a server
component, and the suite has no page-render harness — extracting it to a
testable helper would be more machinery than the line it guards. Covered by the
manual check below instead.

🕒 **Manual check** (`/jobs/[id]`, escrow held, client side):
- Request an extra revision and get as far as the PayChangu redirect, then
  abandon it. Return to the job. The **Payment top-ups** panel must *not* show
  a pending row with "Accept & pay" — that was the bug.
- Complete an extra-revision payment. It should appear under **History** with
  status `paid`, and the escrow total should rise.
- Have the creative request a genuine top-up. That one **must** still show with
  "Accept & pay" and its reason in quotes — this is the regression risk of the
  filter.
- While a client's extra revision is mid-flight, the creative sees the "Request
  top-up" form. Submitting should return "You already have a pending top-up on
  this job", not a raw constraint error.

## 2026-08-07 — Deadline history + client profile page

✅ tsc clean. ✅ 62/62 (was 58). New `tests/actions/deadline-extension.test.ts`
covers the four branches of the `original_deadline` stamp: first approval takes
the pre-extension date; a second approval keeps the *first* original rather than
the previous one; a job with no deadline stays null; a declined extension leaves
`jobs` untouched.

⚠️ **The stamp cannot work in production until `supabase/schema.sql` is re-run**
(`alter table jobs add column if not exists original_deadline date;`). Until
then Supabase will reject the update's unknown column. Check this first if the
strikethrough never appears.

🕒 **Manual check — deadline history** (`/jobs/[id]`, job with an accepted
proposal):
- Propose an extension from one side, approve from the other. Current deadline
  updates; `~~1 Sep 2026~~ originally` appears beside the days-left pill.
- Approve a *second* extension. The struck date must still be the **first**
  one, not the date it just replaced. This is the case worth actually clicking.
- A job whose deadline never moved shows no strikethrough at all.

🕒 **Manual check — client profiles**:
- Visit a client's `/creatives/[id]` → redirects to `/clients/[id]`. No empty
  portfolio/services sections, no "Invite to job".
- Signed in as a creative: stats render (jobs posted, hire rate, completed,
  member since). Hire rate should read `—`, not `0%` or `NaN`, for a client who
  has posted nothing.
- Signed in as a *client* viewing another client: gets the "Client profiles are
  for creatives" card, not the record.
- Signed out: redirected to login with `?next=/clients/[id]`.
- A profile with `role = null` (OAuth user who hasn't onboarded) must still
  render at `/creatives/[id]` — the redirect is deliberately narrow.
- Complete a job as the creative, leave a review, then open the client's
  notification: it must link to `/clients/…`, not `/creatives/…`.

## 2026-08-06 — Job page share row moved to brief-card foot

✅ tsc clean. ✅ 57/57. ✅ `npx next build` compiled successfully, 42/42 static
pages generated.

🕒 **Manual check** (`/jobs/[id]`):
- Byline now reads `Posted by … · 2h ago` alone, no share icons beside it.
- Share icons sit at the foot of the **Project brief** card, under the
  budget/deadline/revisions/format list, behind a divider, labelled
  "Share this job".
- Desktop: icons right-aligned. Mobile: label and icons stack left, nothing
  overflows the card.
- Click Copy → "Link copied!" (regression check on BUG-008's fix).

## 2026-08-07 — Sandbox test found BUG-009 (top-up payments orphaned)

The PayChangu sandbox test of BUG-007's webhook leg **did not pass — and that's
the point.** It surfaced a worse bug that unit tests could never have caught,
because it lived in the RLS policy, not the code.

**Observed** after completing a real MWK 5,000 test payment:

| Field | Expected | Actual |
|---|---|---|
| `payment_topups.status` | `paid` | `pending` |
| `payment_topups.payment_ref` | `ghtop_…` | **`null`** |
| `jobs.revisions_used` | 2 | 1 |

`payment_ref` null was the tell — it's the only key the callback/webhook use to
find the row, so settlement was impossible. See BUG-009 for the full chain.

✅ tsc clean. ✅ **58/58** (was 57) — new regression test "refuses to reach
checkout if the payment_ref write affects 0 rows", which fails if anyone routes
that write back through the user's client.

⬜ **Re-run the sandbox test** on a preview rebuilt with the fix. Same steps;
this time expect `status=paid`, `payment_ref` populated, `revisions_used=2`.

⚠️ **Production check outstanding** — top-ups paid between the 2026-08-05 audit
and this fix took money with nothing recorded. Query in BUG-009.

**Worth noting for future sessions:** BUG-007's fix was verified without
completing a payment (reaching checkout proved the insert cleared RLS). That was
sound for what it tested, but everything *after* the redirect stayed unexercised
— which is exactly where BUG-009 was hiding. Money paths need a completed
payment, not just a reachable checkout.

## 2026-08-06 — BUG-008 VERIFIED FIXED in prod ✅ + profile card reorder

✅ **Confirmed in prod** on `ganyu-hub.vercel.app/creatives/698d7433-…`: the Copy
button flashes "Link copied!" and the page is fully interactive. Reporter:
"The copy button works. Everything seems to work."

So the hydration hypothesis below was correct — unpinned locale/timezone
formatters were the cause. The earlier "no console error" note was the one piece
of counter-evidence and it turned out to be a red herring (React's hydration
warning is easy to miss in a busy console). BUG-008 moved to Fixed.

✅ tsc clean. ✅ 57/57. ✅ `npx next build` compiled successfully (the
dynamic-`cookies` prerender notices are pre-existing and unrelated).

🕒 **Manual check on the reordered hero card** (`/creatives/[id]`):
- Message / Invite to job / ♡ / share now sit at the **foot** of the card, under
  the category chips, behind a divider — not top-right next to the name.
- Desktop: share icons right-aligned, CTAs left. Mobile: everything stacks left,
  nothing overflows the card.
- Signed-out and own-profile views: only the share row renders (no Message/Invite)
  — confirm it still looks deliberate rather than stranded.

## 2026-08-06 — BUG-008: root-cause lead found, formatters pinned

✅ tsc clean. ✅ **57/57** (was 50) — new `tests/utils-format.test.ts`, 7 cases.

**The evidence that pointed here** (static, not guesswork):

| Route | Uses `lib/utils` money/date helpers? | Hydrated? |
|---|---|---|
| `/jobs/[id]` | `formatMwk` `timeAgo` `formatDeadline` `daysUntil` | ❌ dead |
| `/creatives/[id]` | `formatMwk` `timeAgo` | ❌ dead |
| `/login` | none — grep count **0** | ✅ fine |

Server renders UTC, users are UTC+2, formatters used runtime defaults ⇒ different
server/client strings ⇒ React discards hydration for the subtree ⇒ every button
in it goes dead. Matches the "whole route content, not just the share row"
symptom.

Tests assert every formatter returns identical output under four runtime
timezones (UTC, Africa/Blantyre, Pacific/Kiritimati, America/Los_Angeles),
including the nasty boundaries — 22:30 UTC (next day in Malawi) and 31 Aug
23:00 UTC (already September in Malawi).

⬜ **NOT YET CONFIRMED IN PROD.** Counter-evidence: the original report says no
console error appeared, and React normally logs hydration mismatches loudly. So
treat this as a strong lead, not a closed bug.

🕒 **Prod check:** open a live `/creatives/[id]`, click **Copy** on the share row
→ expect a "Link copied!" flash. Also open DevTools console on first load and
look for a hydration warning. If Copy works, BUG-008 closes. If not, the
formatters were a real but separate bug and the hydration hunt continues (next
suspects: a `"use client"` boundary or an async render in the page tree).

## 2026-08-06 — Payout fee 2% / 2% + MWK 700 — DECIDED & covered by tests ✅

✅ tsc clean. ✅ **50/50** (was 42) — new `tests/fees.test.ts`, 8 cases.

Resolves the open decision logged below. Chosen: `PAYOUT_RATE = 0.02` for both
rails, bank keeps `flat: 700`.

The tests encode the reasoning so it can't be lost:
- `bank always covers the real 1.5% + MWK 700 cost` — asserted at MWK 1,000 /
  5,000 / 10,000 / 25,000 / 50,000 / 100,000 / 140,000 / 500,000.
- `a flat percentage with no flat component would NOT cover it` — a deliberate
  regression guard. Asserts `2% × 10,000 < real cost` **and**
  `PAYOUT_RATES.bank.flat === 700`, so deleting the flat fee fails the suite
  with an explanatory comment rather than silently losing money.
- net never negative at any amount incl. 0 and 1; mobile nets more than bank at
  MWK 10,000 (the flat 700 biting, as intended).
- cancellation reserve still covers bank payout fee at ≥ ~MWK 5,400.

🕒 **Manual check:** `/how-money-works` fee table + calculator and the
`PricingExplainer` panel should all read 2% with the bank's flat MWK 700 called
out. All three read the constant, so they move together.

## 2026-08-06 — Flat 3% collection, styled Select, EXTRA_REVISION label

✅ tsc --noEmit clean. ✅ `npx vitest run` 42/42 (no test asserted the old 2%
bank rate, so nothing needed realigning).
🕒 **Manual check:** on `/jobs/[id]` with a pending extra-revision top-up —
panel reads "Extra revision" not `"EXTRA_REVISION|"`; the "Pay with" dropdown
matches the site's inputs (same height/border/radius, brand focus ring, custom
chevron); fee shows once below the field as "+MWK X processing fee (3%)".
🕒 `/how-money-works` — calculator has 2 fields not 3; fee table says 3% flat.

### ⚠️ OPEN DECISION: payout fee cannot be a flat percentage

Bank payouts really cost `1.5% + MWK 700`. For a flat rate `p` to cover that you
need `p·G ≥ 0.015G + 700`, so break-even is **MWK 140,000 at 2%** and **MWK
70,000 at 2.5%** — and as G shrinks the shortfall approaches the full 700 for
*any* percentage. Observed bids are MWK 1,000–50,000, so a flat 2% or 2.5%
loses money on effectively every real bank payout.

| Bank payout | Real cost | 2% | 2.5% |
|---|---|---|---|
| 10,000 | 850 | 200 ❌ | 250 ❌ |
| 50,000 | 1,450 | 1,000 ❌ | 1,250 ❌ |
| 100,000 | 2,200 | 2,000 ❌ | 2,500 ✅ |
| 140,000 | 2,800 | 2,800 ✅ | 3,500 ✅ |

Recommended: **2% on mobile, 2% + MWK 700 on bank** — always covers, keeps a "2%"
headline, states the bank surcharge honestly. `PAYOUT_RATES` left at
`mobile {1.8%, 0}` / `bank {1.5%, 700}` until this is decided.

## 2026-08-06 — BUG-007 paid revision overage: VERIFIED FIXED in prod ✅

✅ **Verified live** on `ganyu-hub.vercel.app`, job `a84be0b1-cbdb-4ef9-bd2b-c66fbce814e4`.

Setup (no payment made): accepted a proposal as the client, abandoned at
checkout, then stamped the post-payment state directly in Studio —
`status=in_progress`, `escrow_status=payment_held`, `revisions_included=1`,
`revisions_used=1`, `extra_revision_rate=5000`, pinned proposal flipped to
`accepted`. Confirmed via select before testing.

Test: as the client → "Request changes" showed *1 of 1 used* + **Request extra
revision** → amber confirm → **Pay MWK 5,000 & continue** → **PayChangu checkout
loaded.** ✅

Why that's sufficient: the `payment_topups` insert happens *before*
`initiatePayment`, so reaching checkout at all proves the insert cleared RLS —
which is exactly what BUG-007 blocked. Zero MWK spent. Previously this produced
either a raw RLS toast or silence.

⬜ **Still untested:** `jobs.revisions_used` advancing 1 → 2 on a cleared
payment (webhook leg). Separate code path from the fix, previously working;
needs test keys + the Preview env to exercise.

🔎 Reusable technique: there is no "accepted but unpaid" state (acceptance is
payment-first — `promotePendingAcceptance()` only runs from the verified
callback/webhook), so stamping the post-payment columns in Studio is the way to
reach any downstream state without spending money. SQL kept in the session notes.

## 2026-08-06 — Preview-deploy callback host

✅ tsc --noEmit clean. ✅ `npx vitest run` 42/42.
✅ Static: production path unchanged (`VERCEL_ENV` is `"production"` there, so the
new branch can't fire); only preview deploys take the new host.
🕒 **Confirm when first used:** push a branch → open the preview URL → start any
payment → the PayChangu checkout's callback/return URLs should carry the
`*-git-*.vercel.app` preview host, not `ganyu-hub.vercel.app`.

### Note: there is no "accepted but unpaid" state to test from

Acceptance is payment-first by design. `decideProposal` only pins the winner
(`jobs.pending_accept_proposal_id`, `escrow_status: payment_pending`); the
proposal is not flipped to `accepted` until `promotePendingAcceptance()` runs
from the verified callback/webhook. So a job cannot reach `in_progress` — and
therefore cannot reach the revision flow — without a cleared payment. To reach
downstream states for testing, either settle a real (small) payment, use the
`TEST_MODE_SKIP_PAYCHANGU_VERIFY` local bypass (CHANGELOG 2026-08-04), or stamp
the post-payment columns directly in Supabase Studio.

## 2026-08-06 — "How the money works" page + once-per-user guidance

✅ tsc --noEmit clean. ✅ `npx vitest run` 42/42. ✅ `npx next build` compiled
successfully with `/how-money-works` registered as a dynamic route.
✅ Static: calculator reads only `lib/fees.ts` exports, so displayed figures
can't drift from checkout/payout math. Page write is guarded (`if (p &&
!p.money_guide_seen_at)`) and calls no `revalidatePath` during render.

⚠️ **Blocked on migration:** `supabase/schema.sql` must be re-run BEFORE this
deploys. `dashboard/layout.tsx` now selects `toured_at`; without the column
PostgREST errors, `profile` comes back null, and every dashboard visit bounces
to `/onboarding/role`. Run the SQL first, then push.

🕒 **Manual UI check (browser), after the migration:**
1. Dashboard → click "See how the money works" → lands on `/how-money-works`
   (previously went to `/jobs/new`).
2. Type a price, switch collection + payout rails → both columns recompute live;
   figures carry thousands separators.
3. Back to `/dashboard` → the third checklist item is now ticked ✓.
4. Click Dismiss on the welcome card → reload → stays gone.
5. **The real regression test:** sign in to the same account in a different
   browser (or incognito) → welcome card and tour must NOT reappear. This is
   what the localStorage version got wrong.
6. Sign in as a brand-new user → both DO appear, once.

## 2026-08-05 — Interactive first-run tour (driver.js)

✅ tsc --noEmit clean. ✅ `npx vitest run` 42/42. ✅ `npx next build` compiled
successfully (validates the `driver.js/dist/driver.css` import — the one thing tsc
can't check; pre-existing dynamic-`cookies` prerender notices are unrelated/non-fatal).
✅ Static: `ProductTour` gated on `localStorage["gh_tour_done_v1"]`; anchors
`[data-tour="nav|main|reminders"]` all live in `dashboard/layout.tsx` (always
rendered, mobile + desktop). Missing-anchor guard marks seen instead of trapping.
🕒 **Manual UI check (browser):** first dashboard visit → 3-step spotlight tour
appears (menu → workspace → reminders); Next/Back/Got-it work; after finishing or
closing, reload → tour does NOT reappear. To re-test: clear `gh_tour_done_v1` in
localStorage (or use a fresh browser/incognito).

## 2026-08-05 — MoneyInput on all money fields + fee panel on all money pages

✅ tsc --noEmit clean. ✅ `npx vitest run` 42/42.
✅ Static: every MWK `<Input type="number">` swapped for `<MoneyInput>` (raw-digit
hidden input → server `Number(...)` unchanged): `jobs/[id]` bid/top-up/extra-rate,
`dashboard/services` price + max, `jobs/new-for-client` price + extra-rate,
`creatives/[id]/invite` budget. `PricingExplainer` added to job-post, proposal,
new-for-client, invite, payments (audience-aware).
🕒 **Manual UI check (browser):** type `100000` in any bid/price/budget → shows
`100,000`, and the proposal/job/service still saves the right number. Each money
page shows the "How the money works" panel.

## 2026-08-05 — First-run guidance (checklist, empty-state reminders, fee panel)

✅ tsc --noEmit clean. ✅ `npx vitest run` 42/42.
✅ Static: `WelcomeChecklist` (client, localStorage dismiss) renders on dashboard
with role-based steps (done flags from myJobs/proposalsSent counts). Dashboard
Reminders panel appends role CTAs when `reminders.length === 0`. `PricingExplainer`
(native `<details>`, numbers from lib/fees.ts) on job-post page. `CardContent` now
`min-w-0 break-words`. Job-post budget uses `MoneyInput`.
🕒 **Manual UI check (browser):** (1) new account → dashboard shows welcome
checklist; completing a step ticks it; Dismiss hides it and it stays hidden on
reload; (2) empty dashboard shows "Post your first job"/"Find work to bid on";
(3) job-post shows "How the money works" panel, budget formats with commas;
(4) resize a card with a long URL/name → text wraps, doesn't overflow.
⚠️ Card overflow fix is defensive/global (`CardContent`). If a specific card still
overflows, it's likely a non-Card container — needs the screenshot to pinpoint.

## 2026-08-05 — Creative onboarding UX (tag chips, money commas, generic wording)

✅ tsc --noEmit clean. ✅ `npx vitest run` 42/42.
✅ Static: skills TagInput submits repeated hidden `name="skills"`;
`completeCreativeOnboarding` switched to `formData.getAll("skills")` (flatMaps any
pasted commas). MoneyInput submits raw digits via hidden input → `Number(...)`
parsing unchanged. `service_delivery_days` blank → null; column made nullable;
both render sites (`creatives/[id]`, `dashboard/services`) guard null.
🕒 **Manual UI check (needs a browser):** on `/onboarding/creative` — (1) type a
skill + Enter → chip appears, ✕ removes it, Backspace-on-empty removes last;
(2) type `50000` in a price → shows `50,000`, saves 50000; (3) leave delivery
blank → finishes, and the service shows no "~Nd" on the public profile.
⚠️ **Re-run `schema.sql` in Supabase** first (delivery_days → nullable), else a
blank delivery errors on insert.

## 2026-08-05 — Google login: first-run routing + identity prefill

✅ tsc --noEmit clean. ✅ `npx vitest run` 42/42 (added `.upsert` to the mock chain).
✅ Static trace: dashboard gate now routes **missing profile OR null role** →
`/onboarding/role` (was silently rendering a default-creative dashboard — the
"lands on main page" symptom). `chooseRole` + `completeClientOnboarding` upsert so
a missing profiles row is created, not a 0-row update.
✅ Prefill wired: creative + client onboarding seed name from
`profiles.full_name || user_metadata.full_name || name`, show email read-only from
`user.email`, and expose a phone field (`profiles.phone`). Creative form gained the
name/email/phone block it lacked.
⚠️ **Google does not provide phone** via sign-in scopes (openid/email/profile) —
name + email prefill, phone is manual. Documented, not a bug.
🕒 **Re-test the first-run flow (needs a reset account):** an already-onboarded
Google account correctly goes straight to `/dashboard`. To see role→onboarding
again, delete the user in Supabase → Authentication → Users (cascades the profile
row) and sign in fresh → expect `/onboarding/role` → pick role → onboarding form
**pre-filled with your Google name + email**. Confirm the deployed Vercel build is
the latest commit (routing fix only takes effect once deployed).

## 2026-08-05 — Unit suite green: stale mockSupabase fixtures realigned

✅ `npx vitest run` — **42/42 pass** (was 11 failing, all pre-existing, unrelated to Google-login). No production code changed — only test fixtures and one mock-helper gap. Root cause was queue-based `mockSupabase` fixtures drifting behind guards/reads the actions had since added:
- `tests/actions/topups.test.ts` (4): `requestTopUp`/`payTopUp` now guard `jobs.escrow_status === "payment_held"` before the creative/pending checks → added `escrow_status: "payment_held"` to the job rows/embeds that assert a later branch.
- `tests/actions/submitProposal.test.ts` (5): `submitProposal` now issues a leading rate-limit `proposals` count → prepended one `{ count: 0 }` to each `proposals` queue. Also added `.gte/.lte/.gt` passthroughs to the mock chain (the rate-limit query chains `.gte("created_at", …)`, which the mock didn't expose).
- `tests/api/cron-non-response.test.ts` (1): the disputed-status `update` chains `.select("id")` and the route flags only on affected rows → update fixture now returns `data: [{ id: "job-1" }]`.
- `tests/api/paychangu-webhook.test.ts` (1): the top-up paid-flip `update` chains `.select("id")`; `increment_total_paid` fires only on affected rows → update fixture now returns `data: [{ id: "t1" }]`.

## 2026-08-05 — "Continue with Google" login (OAuth) + role step

✅ tsc --noEmit clean.
✅ Unit: `tests/actions/chooseRole.test.ts` — 5/5 pass. Covers signed-out → `/login`; off-vocab role ("agency") → re-ask `/onboarding/role` with no write; `client`/`creative` → save + hand off to matching onboarding; update error → `/onboarding/role?error=`.
✅ Static trace: callback exchanges `code` and lands `/dashboard`; dashboard layout routes null-role un-onboarded users to `/onboarding/role`; `/onboarding/role` guards already-onboarded (→ dashboard) and already-roled (→ specific onboarding).
✅ Supabase setup confirmed done (2026-08-05): schema.sql re-run (`profiles.role` `is_nullable=YES`), Google provider enabled with Client ID/Secret, `http://localhost:3000/auth/callback` + `https://ganyu-hub.vercel.app/auth/callback` allow-listed, Site URL = prod, Confirm-email ON.
✅ Live dev walk (localhost:3000, 2026-08-05): "Continue with Google" renders on `/login`, "Sign up with Google" on `/signup`. Clicking → real Google consent screen at accounts.google.com with correct `client_id` (…0dt.apps.googleusercontent.com) and `redirect_uri=https://jbczoiiewuerssckkiuq.supabase.co/auth/v1/callback`. `/onboarding/role` correctly redirects a signed-out visitor to `/login`. Email signup form unchanged (creative/client/agency radios intact).
🕒 **Final human step (needs a real Google account — Claude can't sign in):** complete the consent → first-time Google user should land on `/onboarding/role` → pick "Client" → `/onboarding/client` → finish → `/dashboard` as a client. Repeat with "Creative". Sign out / back in → straight to `/dashboard`, no re-ask. Verify prod after deploy (local tree not yet pushed — no git repo).

## 2026-08-05 — Footer version badge + "What's new"

✅ tsc --noEmit clean.
✅ Verified in dev preview (DOM): footer badge summary reads "v0.8.0", panel lists 2 releases / 7 notes, first note correct. Native `<details>` — content in DOM, works with zero JS.
🕒 Prod: click the badge, confirm the panel opens and matches the curated list.

## 2026-08-05 — Email verification (Supabase confirm-email) + v0.8.0

✅ tsc --noEmit clean.
✅ `signUp` routes on session presence: session absent → `/login?info=check-inbox`, session present → `/dashboard`. Login page renders the green `info` banner.
🕒 Activate in Supabase (toggle "Confirm email" ON, Authentication → Providers → Email), then test: sign up with a fresh address → expect "check your inbox" on /login, a Supabase confirmation email, and no dashboard access until confirmed. Try a bogus address → never confirms → no access.
🕒 Confirm Supabase's built-in mailer actually delivers (default mailer has low daily limits; swap to a verified Resend domain before real traffic).

## 2026-08-05 — Social share buttons + link previews

✅ tsc --noEmit clean.
✅ Share links baked into SSR HTML with correct absolute URLs (verified via curl on `/creatives/[id]`): WhatsApp carries full text+URL, X `url=` populated, Facebook `u=` populated. Work with zero JS.
✅ OG meta verified via curl: creative profile → og:image = avatar, twitter:card = summary_large_image; branded `/opengraph-image` renders 1200×630 (tab title "opengraph-image (1200×630)").
⚠️ Copy / native-share / Instagram-copy buttons did NOT hydrate in dev preview on `/creatives/[id]` and `/jobs/[id]` — the whole route *content* isn't hydrating there (layout shell + `/login` do hydrate; no console/overlay error). Appears independent of the share components (share links themselves render server-side and work). 🕒 Re-check on the deployed prod build: click Copy on a live profile → expect "Link copied!" flash. If still dead in prod, investigate the route-hydration mismatch separately.
🕒 Verify link previews on prod: paste a `/creatives/[id]`, `/jobs/[id]`, and homepage URL into WhatsApp/X → expect avatar/cover/branded-logo card respectively.

## 2026-08-05 — CAPTCHA on share-link claim form

✅ Turnstile live in production (login confirmed rendering). Share-link claim form now also renders `<Turnstile />`; `acceptJobViaLink` verifies the token after rate-limit.
✅ tsc --noEmit clean.
🕒 Verify on prod: open a valid `/j/<token>` link → widget shows above "Accept & continue"; submit succeeds normally; tampering/removing the token → "Verification failed. Please try again."

## 2026-08-05 — Security audit round 3 (underpayment, rate limit, storage cap)

⬜ **ACTION REQUIRED: re-run `supabase/schema.sql` in Supabase Studio** — adds `rate_limits` table, `check_rate_limit()` RPC, and the `job-deliverables` 10MB `file_size_limit`. Until run: rate limiter fails open (no limiting) and direct-SDK oversized uploads still possible.
🕒 Verify after running:
  - Underpayment: simulate a PayChangu success with amount < accepted_bid → job stays `payment_pending`, `admin_errors` gets a `payment_underpaid` row, escrow NOT held.
  - Rate limit: 11 rapid failed logins from one IP+email → 11th returns "Too many attempts…"; share-link claim wrong-password 9× → 9th rate-limited; error text never reveals whether the phone exists.
  - Storage cap: direct `supabase.storage.from('job-deliverables').upload()` of an 11MB file → rejected by the bucket.
✅ tsc --noEmit clean after all round-3 changes.

## 2026-08-05 — Security audit + RLS/trigger fixes

⬜ **ACTION REQUIRED: run the updated policies + trigger in `supabase/schema.sql` in Supabase Studio.** The source-of-truth is fixed but the live DB is NOT patched until you run: the new `proposals update`, `proposals insert`, `topups update parties` policies and the `guard_jobs_creative_update()` function + `trg_guard_jobs_creative_update` trigger.
🕒 Verify after running:
  - As a creative, `PATCH /rest/v1/proposals?id=eq.<own>` with `{status:"accepted"}` → should now be rejected (was the self-accept hole).
  - As an accepted creative, `PATCH /rest/v1/jobs?id=eq.<job>` with `{total_paid_mwk: 999999}` → should raise "not allowed to modify protected job columns".
  - Legit flows still work: creative marks delivered (status transition), sets payout method; client accepts a proposal; webhook still flips escrow/topup to paid.
✅ Confirmed-safe (no fix needed): webhook HMAC timingSafeEqual; escrow/topup idempotency; provider-attested amounts; payout dest scoped to own methods; no dangerouslySetInnerHTML; no open redirect; no secret in client bundle; profiles insert-self pinned.
🕒 Non-blocking follow-ups (deferred): acceptJobViaLink claim TOCTOU (add `.is("client_id", null)` to the update); cron `!==` → timingSafeEqual; `job-deliverables` bucket `file_size_limit`/`allowed_mime_types`; rate-limiting/CAPTCHA on signUp/signIn.

## 2026-08-04 — GlassUploadButton

🕒 Portfolio uploader (`/dashboard/portfolio/[id]`) shows the glass pill for "Upload images"/"Add more".
🕒 Profile/service avatar pickers show the glass pill for "Change"/"Choose image".
🕒 Job delivery submit (`/jobs/[id]`) uses hidden input + glass "Choose file" trigger, filename shows inline.
🕒 Hover raises the button and reveals the chromatic halo; disabled state greys out without lift.

## 2026-08-04 — Session 7 polish 2 (bar clip fix + brief card)

✅ /jobs/[id] loads (was throwing → "oops" after `"use client"` pulled `job-stages.ts` into the client bundle; `require.main === module` referenced undefined `module`). Confirmed live by user on prod after redeploy of `6f1df0b`.
🕒 Current-stage dot no longer clipped (added `py-2` on scrollable container).
🕒 Brief card new hierarchy (eyebrow label, serif body, meta strip) on `/jobs/[id]` — Vinny to eyeball on a job with a longer brief + full meta.

## 2026-08-04 — Session 7 polish (animated bar + pessimistic payout)

🕒 Progress bar mount animation on `/jobs/[id]` — connectors sweep left→right on load, per-stage colors, completed = check only, current = ringed empty dot, numeric guide row underneath.
🕒 Header payout line now reads "Creative receives (est., after cash-out fee)" and equals `gross − max(bank fee, mobile fee)`.
🕒 375px width — header + animated bar still don't overflow.

Last updated: 2026-08-04 (session 7 job progress bar + at-a-glance header shipped; typechecks clean; awaiting live UI walkthrough)

🕒 **Session 7 — job lifecycle progress bar + redesigned header.** Code shipped; `tsc --noEmit` clean. Pure display layer over existing `jobs.status` + `job_events` — zero schema/RLS changes. Verification to run: open an in-progress test job and confirm the stepper highlights the correct stage and the header shows escrow amount (from `total_paid_mwk`) and payout amount (`creativeGross(escrow)` — should equal escrow while `BETA_ZERO_COMMISSION` is on). Fund a fresh job from open → completion and watch stages advance. Cancel one partway and confirm the red "Cancelled here" marker lands on the correct stage (walks `job_events` to find the stage the cancellation event fired at). Check 375px width — the stepper container uses `overflow-x: auto` with `min-w-[520px]` so it scrolls horizontally on narrow viewports rather than breaking the header layout.

🕒 **Session 5 — creative-initiated client job with share link.** Code shipped; `tsc --noEmit` clean. Not yet UI-verified. To test: apply the schema deltas (`jobs.client_id` nullable, `jobs.client_link_token text unique`), sign in as a creative, hit `/jobs/new-for-client`, submit the form, land on the job page, copy the client link from the amber banner, open the link in an incognito window, verify: no navbar/footer, job details + creative profile visible, minimal name+phone+password form. Submit → should land inside `/jobs/[id]`. Fund escrow from there. Confirm the private job does NOT appear on `/jobs` or `/browse`. Existing account by phone should sign in instead of creating a duplicate.

✅ **Repo relocation — Turbopack crash resolved 2026-08-04.** Moved working copy from `C:\Users\vinny\OneDrive\Documents\Code\GANYU HUB` to `C:\Users\vinny\GANYU HUB`. Dev server (`npm run dev`) now starts cleanly from the new path — `Ready in 460ms`, `GET / 200`, no `0xc0000142` worker crash. Turbopack noticed prior corruption from the OneDrive-era crashes and reset its filesystem cache once on first start. Confirms the crash was OneDrive's on-demand file provider racing Turbopack worker writes, not a Next 16 bug. BUG-007 re-verified from the new path via `tsc --noEmit` (zero errors) — the runtime path was already confirmed at the RLS/DB boundary in aa6a59d, so the additional UI click-through was skipped as redundant.

✅ **Job activity timeline (session 1)** — confirmed live 2026-08-04: posted a job, accepted + paid a proposal via the PayChangu callback (test-mode bypass), `proposal_accepted` + `escrow_funded` events landed on the timeline with sensible relative timestamps and `job_events` rows in Supabase. Unrelated third account (`outsider@test.local`) could load the job page but the timeline/delivery form were not rendered (RLS + `isPartyForEvents` gate confirmed).

✅ **Job activity timeline (session 4) — revision limits + paid overage — BUG-007 fix verified 2026-08-04.** Local dev server (Turbopack) crashed with an unrelated Windows worker-process fault (`0xc0000142`) so this pass was run as a direct Supabase-level check instead of clicking through the UI: reproduced the exact pre-fix insert (client-authenticated `payment_topups` insert with `requested_by_creative_id` = creative) — confirmed it's still blocked by RLS as BUG-007 described, ruling out an RLS policy change masking the bug. Then ran the exact insert now shipped in `app/actions.ts` `requestRevision` case C (service-role client) — insert succeeded, row created (`job_id` correct, `requested_by_creative_id` = creative-a, `amount_mwk` = 5000, `reason` = `EXTRA_REVISION|...`, `payment_ref` set after simulated `initiatePayment`). Ran the callback route's post-pay side effects (status → `paid`, `jobs.revisions_used` 1 → 2) — both fired correctly. Within-limit free revision and blank-rate "not available" paths were already confirmed live in the prior session and are unchanged by this fix. **Caveat:** this pass did not click through the actual UI/server-action HTTP path (dev server blocked locally); the DB/RLS boundary — which is exactly what BUG-007 was about — is confirmed fixed. Recommend a follow-up UI click-through once the local Turbopack crash is resolved.

✅ **Job activity timeline (session 3) — file delivery** — confirmed live 2026-08-04 on Job B: creative uploaded a small test file with a note → `files_delivered` event landed with a downloadable signed-URL row; a file over the 10MB cap was rejected client-side with no upload attempt (inline error shown, no network call); an external Google Drive link was submitted as a second delivery and landed as its own `files_delivered` event with `metadata.external_link`. Outsider account could not see the delivery form or any delivery events on the job page. Revision-delivery detection (`revision_delivered` vs `files_delivered`) not separately exercised this pass — blocked on BUG-007 preventing a paid-revision cycle to attach a delivery to.

✅ **Job activity timeline (session 2) — status transitions wired** — confirmed live 2026-08-04 on Job A: full paid walk post → propose → accept-and-pay → PayChangu callback → `escrow_funded` → `proposal_accepted` → `work_started` (no separate scope-confirmation step was hit — recent builds promote straight from `payment_pending` to `in_progress` via `promotePendingAcceptance`, which itself already logs `work_started`) → creative "Mark as submitted" → client "Accept & mark complete" → `job_completed` event landed, `jobs.status = completed`. Release Payment was deliberately **not** clicked (`payout_status` confirmed `null`/`none` after the run — real live PayChangu keys, no payout triggered). Outsider account could load the job page with the timeline hidden. Dispute-flow branch (`dispute_filed`/`dispute_resolved`) not exercised this pass — out of scope for this walk, no dispute was raised.

✅ **BUG-001 onboarding re-test** — re-tested live 2026-08-04 with a fresh `creative-a@test.local` account: headline, bio, portfolio piece, and service all saved in one submission; redirected to `/dashboard`. Confirmed via Supabase: `profiles.onboarded_at` set, 1 row in `portfolio_items`, 1 row in `services`. **BUG-001/BUG-002 fix holds** — no RLS error, no silent no-save.



🕒 **Double-fee fix (checkout)** — `app/actions.ts` now sends raw bid to processor instead of `clientCharge(bid, rail)`. Manual sandbox pay needed to confirm the customer is charged bid + one processor fee (not two). Expected on 10,000 MWK bid via bank rail: checkout shows ~10,200 total.

🕒 **Live release countdown** — `components/hold-countdown.tsx` renders `Release opens in HHh MMm SSs` and ticks every 1s while a `payment_held` job is inside the 24h settlement window. Release button visible-but-disabled during hold. Server 24h gate unchanged.

🕒 **Escrow-funded notification** — `escrow_funded` kind inserts from both webhook + callback (first-writer-wins dedup via `payment_pending` guard). Verify by paying into escrow → client's notification bell shows "Payment is safely in escrow".

🕒 **Terms/Privacy/Content-policy dash sweep + Terms §1 rewrite** — no code path, just static routes. Visual verify by loading `/terms`, `/privacy`, `/content-policy` and confirming no em/en dashes remain in body copy.

🕒 **Beta zero-commission waiver** — code shipped 2026-07-21. `BETA_ZERO_COMMISSION` defaults ON. Verified via typecheck + node math check: `creativeGross(10000) = 10000` when flag on. Full paid-flow verification (post → accept → PayChangu sandbox pay → release; confirm creative payout summary + client quote both show "waived during beta" copy, and /admin still logs theoretical 15%) needs a manual walk — same constraint as 2026-07-18 top-up test.

✅ **Plausible pageviews** — env var set + redeployed 2026-07-18, pageviews landing on dashboard.

✅ **PayChangu sandbox top-up (manual)** — full accept → Pay → PayChangu → webhook → scope_pending chain walked by hand 2026-07-18. Skipped dispute E2E test (`tests/e2e/client-job-flow.spec.ts`) deleted since Playwright can't drive the sandbox and the dispute UI itself is covered by `admin.spec.ts` + this manual walk.

🕒 **T+1 release hold** — code shipped 2026-07-16. Verify on next real paid job: (1) pay a job into escrow, (2) immediately try to release — button should be hidden, panel should show "Release opens in ~24h", server should reject with T+1 message if forced. (3) Wait past 24h, re-check that Release button reappears and payout initiates normally. Requires the `payment_held_at` migration to be run in Supabase first.

---

## 2026-07-16 — Client-side portfolio upload (verified live)

✅ User confirmed: unedited phone photos upload without hitting Vercel's 4.5MB body cap. Browser uploads each file straight to Supabase Storage; server action just writes the returned URLs. Cover-tile badge appears, spinner during upload, remove button works. Fix retired the "keep photos under 2MB" workaround.

## 2026-07-13 — 6-step manual test plan progress

| # | Step | Status |
|---|---|---|
| 1 | PayChangu accept → hosted checkout → `escrow_status=payment_held` | ✅ User-confirmed live on sandbox |
| 2 | Release payment → creative gets `bid − real payout fee` | ✅ Confirmed after `verifyPayout` integer-rounding fix; payout status flips to Released |
| 3 | Top-up on same job → `total_paid_mwk` bumps + second release includes it | ✅ Confirmed |
| 4 | Cancel job with paid top-up → split against combined total | ✅ Confirmed live 2026-07-13 after fixing the admin resolve confirmation (trim + case-insensitive title compare). |
| 5 | Direct invite lets 3×-declined creative submit again | ✅ Confirmed. Also layered: private-custom-job flow (`sendInviteWithNewJob` + `jobs.visibility='private'`) so invites don't need a pre-existing open job |
| 6 | 4th proposal without invite → blocked | ✅ Confirmed ("Only a direct invite from the client can reopen this" card renders); duplicate-DB-error leak was fixed by scoping the unique constraint to active statuses + wrapping insert errors through `logAdminError`+`GENERIC_ERROR` |

---

## ✅ 2026-07-12 (evening) — PostgREST embed disambiguation

Client-job-flow E2E ran 0/5 → 4/5 after fixing `PGRST201` (ambiguous `jobs↔proposals` embed introduced by Session C's `pending_accept_proposal_id` FK) in `app/dashboard/jobs/page.tsx` and `app/dashboard/proposals/page.tsx`. Root cause was **not** RLS as first suspected — a diagnostic `console.log` printed `session.user.id` correctly but `posted.count=undefined` with `code: 'PGRST201'`. Fixed by pinning embeds to `!proposals_job_id_fkey`. Verified live via Playwright.

Test 5 (dispute-while-scope_pending) skipped — it was written for the pre-Session-C single-click accept, but Accept is now picker → Pay → PayChangu webhook → `scope_pending`. Un-skip when Session 3b PayChangu sandbox testing is wired.

---

## 🕒 Session 3b (2026-07-12) — Top-up accept-and-pay

Requires: Session 3a shipped + `increment_total_paid` RPC migration run.

1. **Happy path**: creative requests topup → client picks rail → "Accept & pay" → redirected to PayChangu → complete a sandbox payment → return lands on job page → topup status is `paid`, `jobs.total_paid_mwk` incremented by request amount. — 🕒 not run: reaching "Accept & pay" and generating the checkout redirect is straightforward (confirmed indirectly — `payTopUp` in `app/actions.ts:2039` builds the same `initiatePayment` call already unit-tested in `tests/actions/topups.test.ts`), but completing a real hosted PayChangu sandbox checkout via browser automation (OTP/redirect flow on their domain) needs a manual run. Please complete one sandbox top-up payment by hand and confirm the callback lands.
2. **Escrow release uses new total** — 🕒 blocked on #1 (needs a paid topup to release against).
3. **Failed payment** — 🕒 blocked on #1 (needs the checkout flow reached by hand first).
4. **Webhook idempotency** — 🕒 blocked on #1.
5. **Cancellation with paid topup** — 🕒 blocked on #1.
6. **Guards: creative can't hit `payTopUp`, non-pending topup rejects** — ✅ verified via unit tests (`tests/actions/topups.test.ts:78`, `:89`), both passing.

---

## ✅ Session 3a (2026-07-12) — Top-up requests + decline

Payment integration (accept-and-pay) ships in 3b. In 3a, creative can request, client can decline or ignore. `total_paid_mwk` column exists but only mutates through the acceptance write; adding paid-topup summation happens in 3b.

1. **Request** — ✅ verified live via Playwright (`tests/e2e/sessions-1-2-3.spec.ts`, "Session 3a" describe block): creative fills amount + reason, submits, "Pending: MWK 15,000" block appears.
2. **One-pending guard** — ✅ verified: request form disappears while a topup is pending; DB confirms exactly one `pending` row (server-side guard also unit-tested in `tests/actions/topups.test.ts:48`).
3. **Withdraw (creative)** — ✅ verified live: "Withdraw request" flips status to `cancelled` in the DB.
4. **Decline (client)** — ✅ verified live: client's "Decline" flips status to `declined`.
5. **Cancellation auto-cancel** — ✅ verified live: raising "Request cancellation" with a pending topup on the job auto-flips it to `cancelled` (also unit-tested in `tests/actions/dispute-cancellation.test.ts:83`).
6. **Dispute auto-cancel** — ✅ verified via code + passing unit test (`tests/actions/dispute-cancellation.test.ts:48`); mirrors the cancellation code path 1:1 (`app/actions.ts:920`). Not re-run live in the browser to save time, since it's the identical `payment_topups` update as #5 with a different caller.
7. **Cron auto-cancel** — ✅ verified via code inspection, commit `c72535e` (per task instructions — cron timing makes live testing impractical).
8. **Money-math sweep** — ✅ verified via code inspection: `creativeNet` reads `total_paid_mwk` with `accepted_bid_mwk` fallback baked into the backfill, unchanged for non-topup jobs.
9. **Cancellation admin split** — ✅ verified via code inspection: `adminResolveCancellation` falls back `total_paid_mwk` → `collection_amount_mwk` → `accepted_bid_mwk`, preserving pre-topup behavior.
10. **Guards: non-creative can't request; wrong job status rejects** — ✅ verified via unit tests (`tests/actions/topups.test.ts:27`, `:39`).

---

## ⚠️ Session 2 (2026-07-12) — Direct invites

Two accounts needed: client (with an open job) + creative. Used seeded fixture accounts (`tests/e2e/fixtures.ts`: `SEED_CLIENT`, `TEST_CREATIVE`).

1. **Send invite** — ✅ verified live via Playwright: client → creative profile → "Invite to job" → picks job → submits → "Invite sent." Retry shows "(already invited)" as a disabled option.
2. **Creative receives** — ✅ verified live: bell notification shows "You've been invited to a job"; job page shows the "You've been invited" banner.
3. **Cap bypass** — ⚠️ untestable as specified: the SQL fixture in this doc used `status='rejected'`, but `proposals.status` is a real Postgres enum with values `pending|accepted|declined|withdrawn` (`supabase/schema.sql:148`) — there is no `'rejected'` value, so that insert would error. See the Session 1 bug below: the app's own cap-check code has the same wrong string, so the cap never engages regardless of invite state — this scenario can't be meaningfully validated until that's fixed.
4. **Guards** — ✅ non-clients don't see the button, non-open jobs don't appear in the dropdown (both confirmed via code path + unit tests `tests/actions/invites.test.ts`). RLS-blocks-direct-SQL not separately re-tested (service-role bypasses RLS by design, so this needs an anon-key run — not done this pass).
5. **Cleanup** — done (test fixtures deleted via `test.afterAll` in the Playwright spec).

| Feature | Notes |
|---|---|
| "Invite to job" button appears on creative profile | ✅ Confirmed live |
| Invite dropdown lists only my open jobs | ✅ Confirmed live (disabled "(already invited)" option) |
| Invite creates notification | ✅ Confirmed live |
| Invite banner on job page | ✅ Confirmed live |
| Invite bypasses 3-cap | ✅ Now testable — Session 1 bug fixed in `478e575`. Unit-tested; live re-test pending |
| Duplicate invite blocked | ✅ Confirmed live + unit test |
| Non-open jobs can't be invited to | ✅ Confirmed via unit test (`tests/actions/invites.test.ts:30`) |

---

## ✅ Session 1 (2026-07-12) — 3-attempts proposal cap — BUG FIXED

Original bug: `proposals.status` is a Postgres enum `pending | accepted | declined | withdrawn`; the cap-check filtered `.eq("status", "rejected")` which never matched, so the cap was inert. **Fixed in `478e575`** — both `submitProposal` (`app/actions.ts:630`) and the job page's reapply banner (`app/jobs/[id]/page.tsx:66,465`) now check `"declined"`. Mock Supabase (`tests/helpers/mockSupabase.ts`) now validates enum values so a regression like this would fail unit tests instead of silently passing (`ce50cdb`).

| Feature | Notes |
|---|---|
| Reapply after 1 rejection | ✅ Fixed — "attempt 2 of 3" header appears after decline |
| Cap at 3 rejections | ✅ Fixed — blocked card ("Only a direct invite…") appears at attempt 4 |
| One-active-proposal guard | ✅ Confirmed live |
| Declined count excludes withdrawn/cancelled | ✅ Confirmed via unit test |
| Client-side view unchanged | ✅ Confirmed live |

---

## 🕒 Session D (2026-07-12) — Cancellation + deadline extensions + 72h cron

1. **Request cancellation with reason** — 🕒 covered by unit tests (`tests/actions/dispute-cancellation.test.ts`); live 4-login walkthrough not yet run this session.
2. **Other party accepts / disputes within 72h** — 🕒 unit-tested; live pending.
3. **72h non-response auto-resolve** — ✅ verified via code inspection (cron timing makes live impractical). Note: after `166d640` the cron is daily not hourly, so real-world aging is up to +24h.
4. **Deadline extension request → accept / decline** — 🕒 unit test coverage partial; live pending.
5. **`adminResolveCancellation` escrow split** — ✅ verified via code inspection + unit test (`tests/actions/dispute-cancellation.test.ts:120`).

---

## 🕒 Session C (2026-07-11) — Payment-first acceptance

1. **Accept → picker → Pay → PayChangu → escrow held → proposal wins** — 🕒 same PayChangu-sandbox dependency as Session 3b (needs a real manual checkout). E2E test 5 in `client-job-flow.spec.ts` was written for the old single-click accept and is now `.skip`ped with TODO.
2. **Pending accept marker (`jobs.pending_accept_proposal_id`) shows "Payment pending" cards to both parties** — ✅ verified via code path in `app/jobs/[id]/page.tsx:208,211,219`.
3. **Failed payment clears pending marker, other proposals still decideable** — 🕒 blocked on same PayChangu dependency.
4. **PGRST201 ambiguous embed regression (from new FK)** — ✅ fixed twice: `bada1cb` (actions layer) and `0443041` (dashboard read pages), confirmed by 4/5 client-job-flow Playwright tests passing.

---

## 🕒 Fee-transparency (2026-07-11) — Fee-on-top / fee-through

1. **AcceptProposalPicker shows live breakdown (bid + fee = total) per rail** — ✅ verified live in the browser during Session C work.
2. **Client charged bid + collection fee at accept-and-pay** — 🕒 blocked on PayChangu sandbox (see Session 3b).
3. **Creative receives bid − payout fee** — 🕒 blocked on PayChangu payout sandbox.
4. **Money helpers (`lib/money.ts`, `lib/fees.ts`) single source of truth** — ✅ verified via unit tests + dashboard payments-page rendering matches computed values.

---

## 🕒 PayChangu integration (2026-07-08 → 07-11)

1. **Escrow collection: initiate → hosted checkout → callback → verify → `payment_held`** — 🕒 sandbox account exists but the manual hosted-checkout leg has not been driven end-to-end this session. Unit tests cover the callback/webhook dispatcher.
2. **Webhook idempotency by `tx_ref`** — ✅ verified via code inspection.
3. **Payouts on mobile-money + bank rails** — 🕒 same sandbox dependency.
4. **Payment details card visible to both roles + prefill** — ✅ verified live in-browser.
5. **Multiple saved payout methods (default flag)** — ✅ verified live in-browser during 2026-07-11 work.
6. **Per-job payout override** — ✅ verified live.
7. **Auto payout reconcile on `/dashboard/payments` load + manual button** — ✅ verified live.
8. **Double-payout guard on Release** — ✅ verified via code: `payout_status` transition lock + webhook match by `job_id`. Unit test exercises the lock path.
9. **Release-payment `get_user_email` RPC lookup** — ✅ verified live (was the bug fixed in `295417d` → `75f60cf` → `e451335`; now returns creative email from `auth.users`).

---

## ✅ Admin error log + user report (2026-07-12)

1. **Server actions capture raw errors via `sanitizeError()` into `errors` table** — ✅ verified via code inspection; several rows already present in dev DB from Session C debugging.
2. **User-facing "Report an error" link in footer opens form** — ✅ verified live.
3. **`/admin` Errors card lists recent entries + expandable payload** — ✅ verified live.

---

## ✅ Job form polish (2026-07-12)

1. **Long brief no longer breaks layout on job detail page** — ✅ verified live.
2. **Deadline shows "20th of July 2026" + N-days-left pill, default is a sensible future date** — ✅ verified live.

---

## 🕒 Prompted to test — 2026-07-08 batch (awaiting confirmation)

| Feature | Notes |
|---|---|
| Mobile dashboard nav dropdown | Native `<details>` — collapsed by default on <md, shows current page as label |
| Image upload: profile cover photo | Wide picker on `/dashboard/profile`, renders as banner on public profile |
| Image upload: profile avatar | Renders on public profile now (was always initials) |
| Image upload: creative-onboarding piece cover | File picker replaced URL text input |
| ImagePicker wide layout | Button now stacks under preview (was pushed off-row) |
| Public profile header positioning | Only avatar straddles banner seam; name/headline fully in white |
| Categories expanded to 24 | Add each new one via CategoryPicker on profile edit; browse filter finds them |
| Searchable CategoryPicker | Type in the search box on `/browse` filters; chip list narrows live |
| Landing category rotator | Batch swap every ~3.8s; hover pauses; See all 24 → link works |
| Payments dashboard charts | Bar chart + escrow donut render; empty state when no data |
| Portfolio item detail page rebuild | Hero + sidebar + more-from-creator all render |

---

## ✅ Verified working

| Feature | Notes |
|---|---|
| Save feedback on Profile edit | Green ✓ banner shows on save |
| Save feedback on Portfolio add | Form resets after save |
| Save feedback on Post job | Redirects to new job; no banner expected |
| Save feedback on Send proposal | Green banner appears |
| Save feedback on Send message | Input clears, "Sent." flashes |
| In-app notification bell | Unread count, dropdown, mark all read |
| In-app: client notified on new proposal | Confirmed end-to-end |
| In-app: creative notified on accept/decline | Confirmed |
| In-app: message notifications | Confirmed |
| Email: client receives "new proposal" | ✅ user confirmed |
| Email: client receives "work submitted for review" | ✅ user confirmed |
| Job status: "Mark as submitted" (creative side) | Works after RLS policy added |
| Job status: realtime auto-refresh on update | <10s via realtime + polling |
| Job status: badge on detail page | Live |
| `/dashboard/jobs` split into Active / Completed | Confirmed |
| Portfolio-add prompt on completed job (creative side) | Confirmed |
| Rate card system (services CRUD + custom inquiry) | User confirmed "thats working" |
| Admin dashboard access + stats render | EQ New Client promoted via SQL, `/admin` loads with stats (5/9/6/0) + recent jobs list |
| Scope confirmation: both sides confirm → auto-flip to `in_progress` | User confirmed end-to-end working |
| Dispute resolution: raise → reason banner → admin resolves | User confirmed end-to-end working |
| `/reset-password` renders form + validates | Confirmed via Playwright (`tests/e2e/password-recovery.spec.ts`) — page loads, mismatched-password shows inline error |
| Empty states on `/browse` and `/jobs` | Confirmed via Playwright (`tests/e2e/empty-states-and-errors.spec.ts`) — zero-result query shows `EmptyState` + "Clear filters" CTA on both |
| Custom 404 page | Confirmed via Playwright — `/this-does-not-exist` renders "Nothing here." + "Back to home" |
| Signup with already-used email shows error banner | Confirmed via Playwright — redirects to `/signup?error=...`, no silent success |
| Creative availability selector persists after reload | Confirmed via Playwright — `/dashboard/profile` select round-trips through `updateAvailability` + reload |
| Creative onboarding submit (profile + portfolio + service in one shot) | Confirmed incidentally via Playwright — `ensureOnboarded` helper completes the form and lands back on `/dashboard` |
| Dashboard "Profile insights" section (creative) | Confirmed via Playwright — 4 KPI cards (Views/Saves/Proposals sent/Save rate) + chart render |
| Account → change name / phone | User confirmed: values persist after save + reload |
| Account → change password | User confirmed: new password works on re-login |
| Forgot-password request link | Added on `/login` → `/forgot-password` page → `supabase.auth.resetPasswordForEmail` with `redirectTo=/auth/callback?type=recovery`. End-to-end confirmed by user in-session |
| Scope confirmation: client edits summary after creative confirms → resets creative confirmation | User confirmed |
| Escrow: creative notified on payment state change | User confirmed |
| Custom service request from client side + notification + thread creation | User confirmed |
| Creative onboarding redirect + submit | User confirmed (also incidentally verified by Playwright `ensureOnboarded` helper) |
| Client onboarding redirect + "Post a job now" radio | User confirmed |
| Landing page: "Browse jobs" CTA, "Types of creatives" grid + Content Creation category | User confirmed |
| User profile dropdown menu (avatar + name) + navbar responsive at narrow widths | User confirmed |
| Job status: Request revision → Re-submit cycle | User confirmed end-to-end (client requests, creative re-submits, status flips back to Submitted) |
| Escrow: Mark payment held → Release | User confirmed end-to-end |
| Admin: resolve dispute as completed / cancelled | User confirmed |
| Admin: hide / unhide job | User confirmed — hidden jobs disappear from public listings, reappear on unhide |

## ⚠️ Tested, known issue (tracked in BACKLOG)

| Feature | Issue | Backlog item |
|---|---|---|
| In-app notification latency | ~30s end-to-end during testing | "Notification latency" |
| Email delivery to anyone other than `vinnykasa@gmail.com` | Resend sandbox only delivers to account owner until `ganyu.com` domain verifies | "Verify ganyu.com in Resend" |
| Email: proposal accepted (creative side) | Not received — same domain issue | Same as above |
| Email: job completed (either side) | Not received — same domain issue | Same as above |
| Account → change email | `updateAccount` correctly calls `supabase.auth.updateUser({ email })`; SavingForm now surfaces the `info` message ("Check your inbox to confirm the new email."). Email swap requires clicking Supabase confirmation link in the new (and, if secure email change is on, old) inbox — this is by design, not a bug. Full end-to-end swap not yet confirmed | Track in BACKLOG if Supabase confirmation redirect URL isn't set correctly |

## 🕒 Prompted to test, awaiting confirmation

_(empty — all outstanding items verified 2026-07-02)_

## ⬜ Never tested (2026-07-13 sweep)

| Feature | Notes |
|---|---|
| Proposal limit — "job full" card at cap | Default cap 10 proposals/job. Needs a low-cap job or 10 seeded proposals to hit. |
| Search (`?q=`) on `/browse` and `/jobs` | Title + brief ILIKE — never hands-on tested since shipping. |
| For You / Trending feed correctness | Depends on `interactions` rows accumulating (see next item). |
| Saved items (`/dashboard/saved`) round-trip | Save/unsave from a card, page reflects the new state. |
| `recordView` populating `interactions` | Open a job/creative signed-in, check `interactions` table has a fresh row. Feeds Trending. |
| Empty states across pages | No jobs / no proposals / no notifications / no saved items — each should render the friendly empty card, not a blank space. |
| Portfolio + avatar image upload | Currently URL text field only. Backlog: swap to Supabase Storage. |
| Email delivery to non-`vinnykasa@gmail.com` inboxes | Blocked on `ganyu.com` Resend verification. |
| Change-email flow end-to-end | Supabase sends the confirmation email — needs the domain fix above to test properly. |

## Process

- When a 🕒 item is verified, move it to ✅ or ⚠️
- When a ⚠️ item ships a fix, move it back to ✅ and clear the backlog row
- New build → add 🕒 items to "Prompted to test" so they don't get forgotten
