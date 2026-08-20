# UI kit — Ganyu Hub web (desktop)

A click-through recreation of the desktop product. Open `index.html`.

## Screens

| File | What it recreates |
|---|---|
| `WebShell.jsx` | Sticky paper header (logo, `PrimaryNav`, notification dot, Post a job, avatar) and the four-column footer. The "viewing as" pill flips role so you can see both nav wordings. |
| `MarketingHome.jsx` | The signed-out landing page: the two-mode hero, "Why Ganyu Hub", "How it works" with its own client/creative toggle, proof rails, and the ink closing CTA. |
| `BrowseCreatives.jsx` | `/browse` — search scope, sticky filter panel (category, budget, visual style), sort, and a three-up `CreativeCard` grid. |
| `JobsList.jsx` | `/jobs` — search scope, page tabs, sort, stacked `JobCard`s. |
| `JobDetail.jsx` | The money-at-a-glance header with the stamp and stage tracker, the brief, proposals/messages/files/activity tabs, and the sticky escrow rail. **Fund → deliver → release advances the stamp and the tracker.** |

## Things worth clicking

- The hero's **I want to hire / I want to find work** toggle inverts the whole hero (paper → black, teal → light teal) over 250ms and swaps every string. The header nav follows it.
- On the job detail, the right rail's button changes with the stage: **Fund escrow → Mark work delivered → Approve & release**. Watch the stamp change colour and the connectors fill.
- Filter to a category with no results on browse to see the `prompt` empty state.

## What is deliberately not here

Auth, the job wizard, dashboards, payouts, admin and the message composer. This is a visual and interaction recreation, not the product — where a surface is missing it is missing, not invented.

Content is illustrative (`../data.js`); the *wording style* is the product's. Category list is a plausible subset — the real one lives in `lib/types.ts`.
