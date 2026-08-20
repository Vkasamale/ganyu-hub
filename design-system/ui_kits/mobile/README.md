# UI kit — Ganyu Hub mobile app (PWA)

The product is mobile-first and installable, mostly used on mid-range Android
over paid data. Open `index.html` — the phone is 390px wide inside a bezel, with
the shell components positioned `absolute` so they pin to the frame instead of
the browser viewport.

## Screens

| Screen | What it recreates |
|---|---|
| `HomeFeed` | Signed-in home: greeting, two "ways in" tiles, an escrow figure with its stamp, a peeking creative rail, then job cards. |
| `JobsMobile` | `/jobs` — search scope stacked to one column, page tabs, job cards. |
| `BrowseMobile` | `/browse` — search field, a horizontally scrolling category chip row, collapsible visual-style filter, stacked creative cards. |
| `JobDetailMobile` | Money-at-a-glance header, brief, fee disclosure, proposals — with `StickyActionBar` pinned above the tab bar. |
| `MessagesMobile` | Thread list with unread pills and the job each thread belongs to. |
| `PostJobMobile` | Three-step post-a-job wizard: what you need → budget & deadline → review. |

Plus `AppBar` (the kit's own top bar: logo, search, notification bell — 44px
targets throughout) and the design system's `BottomTabBar` + `NavDrawer`.

## Things worth clicking

- **Menu** opens the grouped drawer — Your work / Settings / Help, log out in red, version at the foot.
- On the job detail the pinned bar advances the escrow stage, so you can watch the stamp go **not funded → held → delivered → released** and the tracker fill.
- **Switch role** changes the second tab between "Find work" and "Find someone" — wording only, never capability.

## Mobile-specific rules this kit demonstrates

- The tab bar is paper at 95% with a backdrop blur and `env(safe-area-inset-bottom)` padding; content pads by `--tabbar-clearance`.
- Rails peek. The next card is half-visible at the right edge or nobody swipes.
- No create action in the tab bar.
- Every target is at least 44px.
- The mobile hero ships **zero image bytes** — there is no photograph on this shell at all, which is a data-cost decision, not an omission.

Content is illustrative (`../data.js`). Auth, payouts, dashboards and admin are
not recreated.
