# Changelog

A running log of what has actually shipped, newest first. For the product
vision and unresolved decisions, see [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md).

## 2026-06-24 — Save/bookmark + For You + Trending feed (`69e4084`)

The social-feed layer on top of the marketplace.

- New schema: `interactions`, `saved_items`, and a `trending_items` RPC
- Heart/save button on every creative + job card and detail page
- New `/dashboard/saved` page listing saved creatives and jobs
- Dashboard now shows two role-aware rails:
  - **For You** — clients see creatives, creatives see jobs (matched by category)
  - **Trending this week** — most-viewed in the last 7 days
- Detail pages record view interactions, feeding Trending and future personalization
- New server actions: `toggleSave`, `recordView`
- New helper module `lib/feed.ts`

## 2026-06-24 — Search + filters on /browse and /jobs (`479aa2c`)

URL-driven filtering on both browse pages.

- New `<FiltersBar>` component (text search, multi-select categories, skills tag input, price range, sort)
- `/browse` filters creatives by name/headline/bio match, category overlap, skill overlap, hourly-rate range
- `/jobs` filters open jobs by title/brief match, category, budget range
- Filters are URL params, so results are shareable and back/forward work
- Result count and Clear button on both pages

## 2026-06-24 — Initial MVP scaffold (`2695603`)

The full working marketplace MVP — 46 files, end-to-end loop.

- Next.js 14 (App Router) + TypeScript + Tailwind + shadcn-style UI primitives
- Supabase: Postgres schema with 8 tables, enum types, auto-profile trigger, full RLS policies
- Auth: signup, login, OAuth callback, signout
- Public browse of creatives + creative profile pages with portfolios
- Job posting, proposals (submit / accept / decline)
- Messaging threads with send-message
- Dashboard: profile editor, portfolio manager, proposals (sent + received)
- Server actions for every mutation
- SSR-safe Supabase clients + session-refresh middleware
