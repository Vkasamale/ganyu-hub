# Claude Design workflow — the method, and where Ganyu Hub is in it

The founder supplied a transcribed YouTube tutorial on using Claude Design.
Earlier sessions lost it to compaction and `BACKLOG.md` flagged it as missing;
it was supplied again on 2026-08-19 and the method is recorded here so no
future session has to ask for it a third time.

Written in our own words rather than pasted verbatim — the source is someone
else's video, and what matters is the instructions, not the wording. Nothing
actionable has been dropped.

---

## The method: three inputs, in order

The tutorial's argument is that most people open Claude Design, pick a
template and start prompting, and get generic output they then burn tokens
trying to rescue. The fix is preparing three things first, each built from the
one before it.

### Input 1 — `DESIGN.md`

A plain text rulebook for how the design looks and feels: colours, fonts,
spacing, and how components like buttons and cards are styled. Tool-agnostic —
it works with any AI tool; Claude Design just converts it into something
native to itself.

The tutorial's shortcut is a public GitHub repository holding `DESIGN.md`
files from major brands. Download one (it uses Stripe), give it to any
chatbot, and ask it to strip the proprietary content and substitute its own
judgement, keeping everything else as is, then rename it. The cleaning step
matters because Claude Design will not copy a real brand's guidelines — you
need a file that is still detailed but safe to use.

**Ganyu Hub did not need this step.** We already have a real
[`DESIGN.md`](DESIGN.md) written from our own shipped code, which is strictly
better than a laundered brand file.

### Input 2 — the design system

A style guide in Claude Design's own format. Same colours, fonts and logos,
restructured so the tool can act on it. Once it exists, everything generated
afterwards comes out on-brand without re-explaining the look each time.

How the tutorial does it:

1. New chat in Claude Design.
2. Pick the latest Opus model — it performs well without Fable's token cost.
3. Set effort to **max**.
4. Click **Create design system**.
5. First field: a short description (its example — "gradient design system,
   subtle, beautiful and minimalistic").
6. Ignore the remaining options; scroll to the bottom and upload the
   `DESIGN.md` file.
7. Wait. It took about 15 minutes in the video, with 10–20 given as the range.

While it runs it reads the file, turns it into a working rulebook, and
generates sample slides and components so the style can be judged visually.

Reviewing it:
- The team checkbox at the top is irrelevant for a solo operator.
- Scroll down for generated mockups.
- Use the **feedback** button and describe changes in plain English (its
  example: replacing a specific dark colour with a hex code from a personal
  palette). A change of that size landed in about a minute.
- Optionally upload extras that then apply to everything afterwards: a voice
  principles file so copy sounds like you, a business logo, and any icons used
  repeatedly. Tell it what each upload is. The video confirmed the voice file
  took ("no em dashes, no corporate jargon, write for the ear") and that the
  logo and icons were absorbed into the system.

**Ganyu Hub status: done.** The system run completed. The founder then made
adjustments in Claude Design directly.

### Input 3 — the template

A pre-built starting point in your style that every new design begins from.
The tutorial's is a slide deck (title slide, section dividers, two-column
layout).

The division of labour it draws, worth keeping straight:
- **Design system** owns how things *look* — colours, fonts, logos.
- **Template** is built from the system and owns how a piece is *laid out* —
  which sections exist and how they are arranged.

Used together, every new piece starts on-brand and pre-structured instead of
from a blank canvas.

Prompt shape it used: "Go ahead and build a slide deck template for workshops
and trainings. You pick the number of slides."

Then it iterated on the template, because everything built later inherits it.
Its feedback was concrete and visual — add the gradient mesh to every
white-background slide rather than only the covers, drop the orange
backgrounds, scale text up to fill empty space, add the logo to the
bottom-left footer.

Navigation note, since the video calls it unintuitive: the **Design System**
button returns to the homepage, and the **all project files** dropdown shows
the project's folders, where a template lives under `templates`. Opening its
HTML file returns to the template view.

**Ganyu Hub status: the template prompt has been written and run.** See below.

---

## Generating from the template

Back on the Claude Design homepage: select the design system, select the
template, attach the source content (its example was workshop talking points
in plain markdown), and send with an instruction like "turn the attached
talking points into a deck and ask me anything you need before you build".

It pauses and asks questions first. **Answer them properly.** The video is
explicit that a few extra minutes here saves hours later, and that
"decide for me" exists for genuine uncertainty only. Ganyu Hub's answers to
its seven questions are recorded below.

---

## The part that compounds — `CLAUDE.md`

Two kinds of feedback exist, and only one of them carries forward.

**Project-level feedback**, which applies to the current design *and every
future one*. The move is to pair the feedback with a standing request:

> Review my feedback below, and in addition to making the edits, create a
> CLAUDE.md you'll read for all future designs.

A `CLAUDE.md` in Claude Design is a plain text file of standing instructions
that it reads before every new design. Every correction gets saved and applied
to everything afterwards, so corrections compound instead of being repeated.

The consequence the video draws out: for the next piece of work, **do not
create a new project — start a new chat inside the existing one**, because the
new chat inherits everything in `CLAUDE.md`.

**Surgical, single-piece feedback**, which does not:
- **Edit** — select an element directly and change size, colour, weight.
- **Annotate** — draw on the design (it circled two elements) and type an
  instruction about what was circled.
- **Tweaks** — ask for toggles ("one to toggle my logo, one to show slide
  numbers"). Nothing appears to happen at first; reopening the tweaks icon
  shows the new toggles, each flipping the decision across every slide at
  once, and a state can be saved as the default.

Rule of thumb: **edit** and **annotate** fix one thing in one place;
**tweaks** are for a single decision that repeats everywhere and you want to
flip between options before committing.

## Export

Share button, top right. PowerPoint and PDF are there, plus **more formats and
apps**. The video prefers a standalone HTML file — it opens in any browser by
double-clicking and can be sent to anyone. HTML also unlocks extras; its real
workshop deck had a presenter-view button opening interactive speaker notes.

---

## Ganyu Hub: how the method was adapted

Ganyu Hub is a web product, not a slide deck, so input 3 is a **screen
template set**, not a deck: page shell, list page, detail page, card, empty
state. Everything else in the method transfers unchanged, including the
`CLAUDE.md` step, which is the part that actually compounds.

### Ground decisions made on 2026-08-19

These **override** `DESIGN.md` and `DESIGN_BRIEF.md`, which have not been
rewritten. Both still describe the cream paper ground as an asset to protect.
That is no longer true.

1. **The cream paper ground is dropped.** `#EFE6CE` reads retro and
   craft-fair; the founder is aiming for modern and futuristic, and a ground
   colour pulling the other way cannot be fixed by layout.
   - **`#F7F6F3` off-white is the page ground. Pure white is the raised
     surface** — cards, sheets, the bottom tab bar.
   - The off-white must be **warm, never grey**. A grey ground plus a teal
     accent is the generic-marketplace look `DESIGN_BRIEF_MOBILE.md` §5 warns
     against, and it is what every competitor already looks like.
   - **Consequence, accepted deliberately:** off-white against white is about
     a 2% luminance step — invisible on a mid-range Android in sunlight. So
     separation is carried by **shadows and hairlines**, not by the colour
     difference. The elevation scale becomes load-bearing and has to be built
     properly: three levels, soft and low-spread, no hard drop shadows.
   - `#EFE6CE` is **not deleted**. It drops to an accent on the rubber stamp,
     empty-state panels and inset panels inside cards, so the palette keeps a
     Malawian note. Deliberately **not** the pre-footer band or the signed-out
     hero — cream across a full band is how the retro look returns by
     accident.
2. **Type ownership.** Instrument Serif italic is for **page titles only**.
   Inter owns every heading below a page title. IBM Plex Mono owns money,
   references and eyebrow labels.
   - **Open question:** the serif was chosen to sit on cream. On clean white it
     reads either editorial-modern or dated. It was kept for now, with one
     page title set in Inter requested alongside it so the founder can judge
     from a mockup rather than in the abstract. **This is unresolved.**

### Answers given to Claude Design's seven questions

1. **How far does the off-white change reach?** — Everything: templates,
   tokens, all 19 specimen cards and both UI kits repainted in one pass. A
   half-repainted system means future designs inherit whichever half they
   happen to read.
2. **How should 390 and 1440 sit together?** — Side by side on one page. A
   width toggle hides the comparison, which is the reason for looking.
3. **Five separate templates or one file?** — One combined file. Consistency
   across templates is what is being judged, and it is invisible when each
   opens in its own tab.
4. **Which role do the shells default to?** — Both, toggleable. The roles
   differ by one word per nav item; picking one means never seeing the other
   until it is built wrong.
5. **What does the list page list?** — Both jobs and creatives, as a toggle on
   the same template. They share the layout and differ only in the card.
6. **Where should `#EFE6CE` keep earning its place?** — The rubber stamp's
   ground, empty-state panels, and inset panels inside cards. Not the
   pre-footer band, not the signed-out hero.
7. **Anything else?** — Judge every screen at 390 first, since most users are
   on mid-range Android over paid mobile data. The stamp is the one element
   that should be memorable; everything else gets out of the way. And
   `DESIGN.md`'s cream-ground rule is dead — ignore it wherever it appears.

### Also asked for

Three variants of the **rubber stamp**, which is the most distinctive element
in the product and is not finished — it currently reads as a rounded chip
rather than ink. Directions given: rules above and below the text rather than
flanking it (flanking rules read as a strike-through), a heavier outer ring
visibly separated from the inner one, wider letter-spacing, and a dashed outer
ring for bleed.

---

## Where this stands

The eight screens were generated, exported and ported. `CLAUDE.md` was written
and lives at `design-system/CLAUDE.md`. Both items left open at the last
writing are closed: the serif question was settled by deleting the serif, and
the repo docs were reconciled with the live system on 2026-08-21.

**Export as HTML, never Print to PDF.** The two PDFs made on 2026-08-20 contain
zero extractable text, no renderer available here can rasterise them, and the
capture clipped most of both documents.

**There is a live connection now.** The `DesignSync` tool reads and writes the
Claude Design project directly, so the design system can be re-read at any time
instead of waiting for a zip. New screens no longer need exporting by hand.

## `design-system/CLAUDE.md` is a summary, not the system

Read this before touching colour.

`CLAUDE.md` is 212 lines. It is a digest, and it does not list every token. The
actual values live in **`design-system/tokens/colors.css`** and are explained in
**`design-system/guidelines/*.card.html`**. Both have been in the repo since the
export.

On 2026-08-22 a session read only `CLAUDE.md`, concluded the system defined no
stage or status colours, and "fixed" two components that were already correct:

- The job progress bar carried `--stage-1` to `--stage-5` — sky, indigo, violet,
  amber, emerald. It was flattened to a single teal and the commit called it "a
  rainbow that invents a colour per stage". It was a faithful port.
- The availability dot carried `--status-available` and `--status-busy`. It was
  changed to teal and ink tints.

Both are restored, and both now reference named `stage-*` and `status-*` values
in `tailwind.config.ts` rather than raw hexes, so the next reader can see they
come from the system.

**The rule: grep `design-system/tokens/` before deciding a colour is unowned.**

---

# What to ask for next

Eight routes were designed. **Thirty-eight were not** — the register is
[`DESIGN.md`](DESIGN.md) section 15. Each brief below quotes the copy that is in
the app today.

## 0. First — the one real colour gap

The system covers a great deal: brand, ink ladder, surfaces, money states, job
stages, and the status set (star, available, busy, away, danger). What it does
**not** define is *messaging*: what an error banner, a warning banner, a success
banner and an inline field error look like. Roughly a hundred raw colour values
across the app improvise that, mostly as red-50/red-200/red-700 tints.

`--status-danger` exists but the guideline reserves it: red-600 appears on log
out and destructive actions and nowhere else. So form errors cannot simply
borrow it.

> The design system defines status colours for availability, stars and
> destructive actions, but nothing for messages. Add error, warning, success and
> information: as a full-width banner, as an inline error under a form field,
> and as a small chip. Say how each differs from the five money-state inks and
> from the five job-stage colours, since a page can show all three at once.

## 1. Screen 09 — Post a job

The only un-designed route where a weak screen costs money directly.

> Screen 09: Post a job, the client three-step form.
>
> Steps: "What you need" (title, category, description), "What you will get"
> (deliverables, deadline, revisions included, format), "Budget" (one MWK
> figure).
>
> The budget step shows the job as a creative will actually read it: a live
> preview card with title, category chip, budget, deadline and brief, filling in
> as they type.
>
> Footer on every step: Back, Continue (or "Post this job" on the last), and
> "Save and finish later" because drafts are normal, not a failure. Under it,
> permanently: posting does not commit you to anything, and nobody is paid until
> you approve the work.
>
> Show 390 and 1440.

**Keep the preview.** It is what stops a client writing three vague lines and
getting no proposals.

Covers `/jobs/new`, `/jobs/new-for-client`.

## 2. Screen 10 — The share link, signed out

The first thing someone with no account ever sees, and it asks them for money.

> Screen 10: A job offer opened from a share link by someone with no account.
> The page carries no header and no footer.
>
> Headline "A job for you". The job title, budget, deadline, deliverables and
> revisions included. The creative who sent it. Then the money: what is being
> asked for, the 3% processing fee, the total, and what escrow means in one
> sentence for a reader who has never heard the word.
>
> Primary action "Accept this job and fund escrow".
>
> Show 390 and 1440.

Covers `/j/[token]`, `/t/[token]`; informs `/c/[slug]`.

## 3. Screen 11 — Money

Where a creative goes to answer "where is my money", and where a wrong number is
unforgivable.

> Screen 11: The money page, in two parts.
>
> "Where the money sits": the amounts held in escrow and released, with the jobs
> behind each, using the money stamps.
>
> "Transactions": every movement, what it was, which job, when, how much, and
> where it went (Airtel Money, TNM Mpamba, bank). Cash-out fees are charged by
> the payment provider, not by Ganyu Hub, and the page should say so without
> making it feel like a warning.
>
> MWK with thousands separators and tabular figures. Nothing renders as a zero.
>
> Show 390 and 1440. On a phone this cannot be a table.

Covers `/dashboard/payments`; informs `/dashboard/report`.

## 4. Screen 12 — Setting yourself up

Nine routes share one shape: a long surface filled in once, revisited rarely.

> Screen 12: The profile and account editing surface. Long forms in sections:
> who you are, your work, your prices, your payout method, security and
> passkeys.
>
> Show what an unfinished profile looks like. A creative with no portfolio item
> does not appear in Browse at all, and the screen has to say that where it
> matters rather than in a banner at the top.
>
> Include the saved state, the unsaved state, and one field in error while the
> rest of the form is fine.
>
> Show 390 and 1440.

Covers `/dashboard/profile`, `/dashboard/account`, `/dashboard/services`,
`/dashboard/portfolio`, `/dashboard/portfolio/[id]`, `/dashboard/testimonials`,
`/creatives/[id]/invite`.

## 5. Screen 13 — Getting in

Small, and already close, but it is where a stranger decides whether this site
deserves a password.

> Screen 13: Sign in and sign up. Email and password, Google, and a passkey.
> Sign-up asks one question first, "I am a creative, I want to show my work and
> get hired" or "I am a client, I want to hire creatives for work", and that
> answer changes what is asked next.
>
> Show the error states: a wrong password, and an email already registered.
>
> Show 390 and 1440.

Covers `/login`, `/signup`, `/forgot-password`, `/reset-password`,
`/onboarding/role`, `/onboarding/client`, `/onboarding/creative`.

## Not worth a screen

**Admin**, `/admin` and its five sub-pages: internal, one viewer, already
consistent. **Legal and static**, `/terms`, `/privacy`, `/content-policy`,
`/release-notes`, `/contact`, `/offline`: these want the page-shell template
that already exists.

## Order, if only some get made

1. The messaging colours, which unblock roughly a hundred sites
2. Screen 09, Post a job, the only one that costs money when it is weak
3. Screen 10, the share link, first impression for people with no account
4. Screen 11, Money, where a wrong number does real damage
5. Screen 12, setting up, nine routes each seen rarely
6. Screen 13, getting in, small and already close
