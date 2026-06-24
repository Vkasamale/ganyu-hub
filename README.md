# Ganyu Hub

Malawian creative-services marketplace. See `PROJECT_BRIEF.md` for the product spec.

## Setup

1. `npm install`
2. Create a Supabase project, copy URL + anon key
3. `cp .env.local.example .env.local` and paste your keys
4. In the Supabase SQL editor, run `supabase/schema.sql`
5. `npm run dev`

## Stack

- Next.js 14 (App Router)
- Supabase (Postgres, Auth, Storage)
- Tailwind CSS
- TypeScript

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/signup`, `/login` | Auth |
| `/browse` | Browse creatives |
| `/creatives/[id]` | Creative profile |
| `/jobs` | Browse jobs |
| `/jobs/new` | Post a job (client) |
| `/jobs/[id]` | Job detail + proposals |
| `/dashboard` | Authed home |
| `/dashboard/profile` | Edit profile |
| `/dashboard/portfolio` | Manage portfolio |
| `/dashboard/proposals` | My proposals (creative) / received (client) |
| `/messages` | Threads |
