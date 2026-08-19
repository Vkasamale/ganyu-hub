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

## Where this stands, and what comes next

The template prompt has been written and run, and the founder has made
adjustments inside Claude Design. **The next step is the feedback loop, and
specifically the `CLAUDE.md` step**, which has not been done yet:

> In addition to making those edits, create a CLAUDE.md you will read before
> every future Ganyu Hub design, capturing the decisions we just made and
> anything I correct from here on.

From then on: **new chat inside the same project**, never a new project.

Two things still open:

- **The serif question** from decision 2 above. It needs judging from a
  mockup, not from argument.
- **The repo's design docs now disagree with the live design system.**
  `DESIGN.md` §2 and `DESIGN_BRIEF.md` both still protect the cream ground.
  The prompt out-ranked them for this run, which is survivable, but a session
  that reads only the docs will get it wrong. Reconcile before the design work
  is picked up again — this is exactly the failure that killed the 2026-08-12
  run.
