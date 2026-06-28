# Test Log

Tracks what's been hands-on tested vs. what's been built but not yet confirmed working. Works alongside [`GanyuHub_DevRoadmap.md`](GanyuHub_DevRoadmap.md) (what to build) and [`BACKLOG.md`](BACKLOG.md) (known issues to fix later).

Legend: ✅ verified · ⚠️ tested with known issue · 🕒 prompted to test, awaiting confirmation · ⬜ never tested

Last updated: 2026-06-28

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

## ⚠️ Tested, known issue (tracked in BACKLOG)

| Feature | Issue | Backlog item |
|---|---|---|
| In-app notification latency | ~30s end-to-end during testing | "Notification latency" |
| Email delivery to anyone other than `vinnykasa@gmail.com` | Resend sandbox only delivers to account owner until `ganyu.com` domain verifies | "Verify ganyu.com in Resend" |
| Email: proposal accepted (creative side) | Not received — same domain issue | Same as above |
| Email: job completed (either side) | Not received — same domain issue | Same as above |

## 🕒 Prompted to test, awaiting confirmation

| Feature | Where to test |
|---|---|
| Account → change name / phone | `/dashboard/account` |
| Account → change email + confirmation link flow | `/dashboard/account` (sends to new + old address) |
| Account → change password | `/dashboard/account` Security card |
| Job status: Request revision → Re-submit cycle | Job page, client + creative tabs |
| Job status: Flag dispute (either side) | Job page status panel |
| Escrow: Mark payment held / Release / Dispute | Job page Payment panel, client only |
| Escrow: creative notification on payment state change | Should see in bell + email |
| Custom service request from client side | Creative profile page form |
| Custom service request notification + thread creation | Creative receives notification + lands in message thread |
| Creative onboarding redirect (new signup) | First `/dashboard` hit auto-redirects to `/onboarding/creative` |
| Creative onboarding submit (profile + portfolio + service in one shot) | Finish button → back to `/dashboard` |
| Client onboarding redirect | New client signup → `/onboarding/client` |
| Client onboarding "Post a job now" radio | If yes → lands on `/jobs/new` after finishing |
| Admin: resolve dispute as completed/cancelled | Triggers notification + email to both parties |
| Admin: hide / unhide job | Hidden jobs disappear from `/jobs` listing |
| Landing page: "Browse jobs" CTA | Hero buttons row |
| Landing page: "Types of creatives" heading + new "Content Creation" category | Bottom category grid |
| User profile dropdown menu (avatar + name) | Top-right of navbar |
| Navbar responsive at narrow widths | Browse links collapse into dropdown |

## ⬜ Never tested

| Feature | Notes |
|---|---|
| Job / creative filters (`<FiltersBar>`) | Category, skills, price range, sort — also in BACKLOG |
| Search (`?q=`) on `/browse` and `/jobs` | Title + brief ILIKE — never hands-on tested since shipping |
| For You / Trending feed correctness | Categories match, view counts populate correctly |
| Saved items (`/dashboard/saved`) round-trip | Save/unsave, page reflects state |
| Public profile rendering for an unsigned visitor | No "Message" or "Request quote" buttons should appear |
| Job posted by client visible on their `/dashboard/jobs` | Should appear under Active |
| `recordView` actually populating `interactions` | Needed for Trending |
| Multi-browser realtime test (two real browsers, not just tabs) | Confirms it's not just Next router-refresh |

## Responsiveness & UI polish (mostly untested)

- Mobile breakpoint (<640px): navbar, dashboard tiles, job detail panel stack
- Tablet breakpoint (640–1024px): rate card grid, jobs list density
- Notification dropdown clipping on small screens
- User menu dropdown clipping (right-edge `right-0` should be fine, but verify)
- Long full_name truncation in user menu trigger (set to `max-w-[120px]`)
- Long category/skill arrays wrapping cleanly on profiles
- Empty states across pages (no jobs, no proposals, no notifications)
- Color contrast on the brand red against white / neutral-50 backgrounds

## Process

- When a 🕒 item is verified, move it to ✅ or ⚠️
- When a ⚠️ item ships a fix, move it back to ✅ and clear the backlog row
- New build → add 🕒 items to "Prompted to test" so they don't get forgotten
