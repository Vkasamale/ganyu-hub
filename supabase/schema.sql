-- Ganyu Hub schema. Run this in the Supabase SQL editor on a fresh project.
-- Idempotent: safe to re-run on an existing project (will add new tables/policies).
create extension if not exists "pgcrypto";

do $$ begin
  create type user_role as enum ('client', 'creative', 'agency');
exception when duplicate_object then null; end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'creative',
  full_name text,
  headline text,
  bio text,
  location text default 'Malawi',
  hourly_rate_mwk integer,
  avatar_url text,
  categories text[] default '{}',
  skills text[] default '{}',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', ''),
          coalesce((new.raw_user_meta_data->>'role')::user_role, 'creative'));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  cover_url text,
  project_url text,
  created_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  price_mwk integer not null,
  delivery_days integer not null default 7,
  created_at timestamptz not null default now()
);

do $$ begin
  create type job_status as enum ('open', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  brief text not null,
  budget_mwk integer,
  category text not null,
  status job_status not null default 'open',
  created_at timestamptz not null default now()
);

do $$ begin
  create type proposal_status as enum ('pending', 'accepted', 'declined', 'withdrawn');
exception when duplicate_object then null; end $$;

create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  creative_id uuid not null references profiles(id) on delete cascade,
  cover_letter text not null,
  bid_mwk integer not null,
  status proposal_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (job_id, creative_id)
);

create table if not exists message_threads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  creative_id uuid not null references profiles(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (client_id, creative_id, job_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references message_threads(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  reviewee_id uuid not null references profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (job_id, reviewer_id)
);

-- For You / Trending: interactions + saved_items
do $$ begin
  create type target_kind as enum ('job', 'creative');
exception when duplicate_object then null; end $$;

do $$ begin
  create type interaction_kind as enum ('view', 'click', 'save', 'unsave', 'message_sent', 'proposal_sent');
exception when duplicate_object then null; end $$;

create table if not exists interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  target_type target_kind not null,
  target_id uuid not null,
  kind interaction_kind not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_interactions_user_time on interactions(user_id, created_at desc);
create index if not exists idx_interactions_target_time on interactions(target_type, target_id, created_at desc);

create table if not exists saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  target_type target_kind not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);
create index if not exists idx_saved_user on saved_items(user_id, created_at desc);

create or replace function public.trending_items(p_target_type target_kind, p_limit int default 6)
returns table(target_id uuid, score bigint)
language sql security definer set search_path = public as $$
  select target_id, count(*) as score
  from interactions
  where target_type = p_target_type and created_at > now() - interval '7 days'
  group by target_id
  order by score desc
  limit p_limit;
$$;
grant execute on function public.trending_items(target_kind, int) to anon, authenticated;

alter table profiles enable row level security;
alter table portfolio_items enable row level security;
alter table services enable row level security;
alter table jobs enable row level security;
alter table proposals enable row level security;
alter table message_threads enable row level security;
alter table messages enable row level security;
alter table reviews enable row level security;
alter table interactions enable row level security;
alter table saved_items enable row level security;

drop policy if exists "profiles read" on profiles;
create policy "profiles read" on profiles for select using (true);
drop policy if exists "profiles update self" on profiles;
create policy "profiles update self" on profiles for update using (auth.uid() = id);

drop policy if exists "portfolio read" on portfolio_items;
create policy "portfolio read" on portfolio_items for select using (true);
drop policy if exists "portfolio write" on portfolio_items;
create policy "portfolio write" on portfolio_items for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "services read" on services;
create policy "services read" on services for select using (true);
drop policy if exists "services write" on services;
create policy "services write" on services for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "jobs read" on jobs;
create policy "jobs read" on jobs for select using (true);
drop policy if exists "jobs write" on jobs;
create policy "jobs write" on jobs for all using (auth.uid() = client_id) with check (auth.uid() = client_id);

drop policy if exists "proposals read" on proposals;
create policy "proposals read" on proposals for select using (
  auth.uid() = creative_id or auth.uid() in (select client_id from jobs where jobs.id = proposals.job_id)
);
drop policy if exists "proposals insert" on proposals;
create policy "proposals insert" on proposals for insert with check (auth.uid() = creative_id);
drop policy if exists "proposals update" on proposals;
create policy "proposals update" on proposals for update using (
  auth.uid() = creative_id or auth.uid() in (select client_id from jobs where jobs.id = proposals.job_id)
);

drop policy if exists "threads read" on message_threads;
create policy "threads read" on message_threads for select using (auth.uid() in (client_id, creative_id));
drop policy if exists "threads insert" on message_threads;
create policy "threads insert" on message_threads for insert with check (auth.uid() in (client_id, creative_id));

drop policy if exists "messages read" on messages;
create policy "messages read" on messages for select using (
  auth.uid() in (select client_id from message_threads where id = thread_id)
  or auth.uid() in (select creative_id from message_threads where id = thread_id)
);
drop policy if exists "messages insert" on messages;
create policy "messages insert" on messages for insert with check (
  auth.uid() = sender_id and (
    auth.uid() in (select client_id from message_threads where id = thread_id)
    or auth.uid() in (select creative_id from message_threads where id = thread_id)
  )
);

drop policy if exists "reviews read" on reviews;
create policy "reviews read" on reviews for select using (true);
drop policy if exists "reviews insert" on reviews;
create policy "reviews insert" on reviews for insert with check (auth.uid() = reviewer_id);

drop policy if exists "interactions own" on interactions;
create policy "interactions own" on interactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "saved own" on saved_items;
create policy "saved own" on saved_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_jobs_status on jobs(status);
create index if not exists idx_jobs_category on jobs(category);
create index if not exists idx_proposals_job on proposals(job_id);
create index if not exists idx_proposals_creative on proposals(creative_id);
create index if not exists idx_portfolio_profile on portfolio_items(profile_id);
create index if not exists idx_messages_thread on messages(thread_id, created_at);

-- Notifications
do $$ begin
  create type notification_kind as enum (
    'proposal_received',
    'proposal_accepted',
    'proposal_declined',
    'message_received'
  );
exception when duplicate_object then null; end $$;

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind notification_kind not null,
  title text not null,
  body text,
  link text,
  actor_id uuid references profiles(id) on delete set null,
  target_type text,
  target_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user_time on notifications(user_id, created_at desc);
create index if not exists idx_notifications_user_unread on notifications(user_id) where read_at is null;

alter table notifications enable row level security;

drop policy if exists "notifications read own" on notifications;
create policy "notifications read own" on notifications for select using (auth.uid() = user_id);
drop policy if exists "notifications update own" on notifications;
create policy "notifications update own" on notifications for update using (auth.uid() = user_id);
drop policy if exists "notifications insert authenticated" on notifications;
create policy "notifications insert authenticated" on notifications for insert with check (auth.uid() is not null);

-- Realtime: ensure publication includes notifications
do $$ begin
  alter publication supabase_realtime add table notifications;
exception when duplicate_object then null; when others then null; end $$;
