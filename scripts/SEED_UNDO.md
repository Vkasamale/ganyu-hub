# Undoing Seed Data

The seed script (`scripts/seed.mjs`) creates fake users, profiles, services, jobs, proposals, and reviews for local testing. Every seeded user has an email ending in `@seed.ganyu.local`, which makes them easy to wipe.

## How the wipe works

All seeded rows are anchored to `auth.users`. Deleting from `auth.users` cascades through every dependent table (`profiles`, `services`, `jobs`, `proposals`, `reviews`, etc.) because of `ON DELETE CASCADE` foreign keys.

So one SQL statement removes everything the seed script ever created.

## Wipe ALL seed data (every batch)

Open Supabase dashboard → **SQL Editor** → run:

```sql
delete from auth.users where email like '%@seed.ganyu.local';
```

That's it. Refresh the Authentication / Table Editor tabs and the seeded rows are gone.

## Wipe ONE specific batch

Each run prints its batch tag at the top, e.g. `Seeding batch mqzvo886…`. Emails for that run look like `firstname.lastname.mqzvo886@seed.ganyu.local` (or `client.firstname.lastname.mqzvo886@seed.ganyu.local` for clients).

To remove just that batch:

```sql
delete from auth.users where email like '%.<BATCH>@seed.ganyu.local';
```

Replace `<BATCH>` with the actual tag, e.g.:

```sql
delete from auth.users where email like '%.mqzvo886@seed.ganyu.local';
```

## Verify the wipe

```sql
select count(*) from auth.users where email like '%@seed.ganyu.local';
-- expect: 0

select count(*) from profiles where id in (
  select id from auth.users where email like '%@seed.ganyu.local'
);
-- expect: 0
```

## Re-seed after wiping

```
node scripts/seed.mjs
```

A new batch tag is generated each run, so re-seeding never collides with old data even if you skipped the wipe.

## Safety

- The `@seed.ganyu.local` suffix is reserved for seed data. Real users will never have it.
- The script never touches real `auth.users` rows — it only deletes ones whose email matches the seed pattern.
- Run this against your **local / dev** Supabase project. Do not run against production.
