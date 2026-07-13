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
  phone text,
  created_at timestamptz not null default now()
);
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists onboarded_at timestamptz;
alter table profiles add column if not exists is_admin boolean not null default false;
alter table jobs add column if not exists hidden_at timestamptz;
alter table jobs add column if not exists proposal_limit integer not null default 10;

do $$ begin
  create type availability_status as enum ('available', 'busy', 'unavailable');
exception when duplicate_object then null; end $$;
alter table profiles add column if not exists availability availability_status not null default 'available';

create or replace function public.is_admin(uid uuid)
returns boolean language sql security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = uid), false);
$$;
revoke all on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated;

drop policy if exists "jobs update by admin" on jobs;
create policy "jobs update by admin" on jobs for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

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
alter table services add column if not exists price_mwk_max integer;
alter table services alter column price_mwk drop not null;

do $$ begin
  create type job_status as enum ('open', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;
alter type job_status add value if not exists 'submitted';
alter type job_status add value if not exists 'revision_requested';
alter type job_status add value if not exists 'disputed';
alter type job_status add value if not exists 'scope_pending';
alter type job_status add value if not exists 'cancellation_requested';

alter table jobs add column if not exists scope_summary text;
alter table jobs add column if not exists client_confirmed_scope_at timestamptz;
alter table jobs add column if not exists creative_confirmed_scope_at timestamptz;
alter table jobs add column if not exists dispute_reason text;
alter table jobs add column if not exists dispute_raised_by uuid references profiles(id) on delete set null;
alter table jobs add column if not exists dispute_raised_at timestamptz;

do $$ begin
  create type escrow_status as enum ('none', 'payment_held', 'payment_released', 'payment_disputed');
exception when duplicate_object then null; end $$;
alter table jobs add column if not exists escrow_status escrow_status not null default 'none';
-- PayChangu adds an intermediate "payment_pending" state: client clicked pay
-- and was redirected to checkout, but the webhook/verification hasn't
-- confirmed clearance yet.
alter type escrow_status add value if not exists 'payment_pending' before 'payment_held';
-- The agreed amount: set to the accepted proposal's bid when a proposal is
-- accepted. Money calculations use this; budget_mwk is only the posted asking
-- price and is the fallback for jobs still open with no accepted proposal.
alter table jobs add column if not exists accepted_bid_mwk integer;
-- PayChangu references. payment_ref is our tx_ref (unique per attempt).
alter table jobs add column if not exists payment_ref text;
alter table jobs add column if not exists payment_provider_id text;
alter table jobs add column if not exists payment_initiated_at timestamptz;

-- Payout to creative (PayChangu mobile-money or bank transfer). Flow:
--   payment_held + payout_status null      → nothing initiated
--   payment_held + payout_status 'pending' → payout requested, awaiting webhook
--   payment_held + payout_status 'failed'  → payout errored; client can retry
--   payment_released                       → payout confirmed by webhook
alter table jobs add column if not exists payout_ref text;
alter table jobs add column if not exists payout_provider_id text;
alter table jobs add column if not exists payout_status text;
alter table jobs add column if not exists payout_initiated_at timestamptz;
alter table jobs add column if not exists payout_error text;
alter table jobs add column if not exists payout_method text; -- 'mobile' | 'bank'

-- Creative payout destinations. Mobile money is primary; bank is optional
-- and blocked on PayChangu enabling the bank feature per-account.
alter table profiles add column if not exists payout_mobile_number text;
alter table profiles add column if not exists payout_mobile_network text; -- 'airtel' | 'tnm'
alter table profiles add column if not exists payout_bank_uuid text;
alter table profiles add column if not exists payout_bank_account_name text;
alter table profiles add column if not exists payout_bank_account_number text;

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
  created_at timestamptz not null default now()
);

-- ponytail: only one *active* proposal per (job, creative). Declined rows may
-- coexist so a creative can re-apply up to the 3-strike cap enforced in code.
alter table proposals drop constraint if exists proposals_job_id_creative_id_key;
create unique index if not exists proposals_active_unique
  on proposals (job_id, creative_id)
  where status in ('pending', 'accepted');

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

create or replace function public.creative_daily_views(p_creative_id uuid, p_days int default 30)
returns table(day date, views bigint)
language sql security definer set search_path = public as $$
  select date_trunc('day', created_at)::date as day, count(*)::bigint as views
  from interactions
  where target_type = 'creative' and target_id = p_creative_id
    and kind = 'view'
    and created_at > now() - (p_days || ' days')::interval
  group by 1
  order by 1;
$$;
grant execute on function public.creative_daily_views(uuid, int) to authenticated;

create or replace function public.creative_totals(p_creative_id uuid)
returns table(views_total bigint, views_30d bigint, saves_total bigint, saves_30d bigint)
language sql security definer set search_path = public as $$
  select
    (select count(*) from interactions where target_type='creative' and target_id=p_creative_id and kind='view')::bigint,
    (select count(*) from interactions where target_type='creative' and target_id=p_creative_id and kind='view' and created_at > now() - interval '30 days')::bigint,
    (select count(*) from saved_items where target_type='creative' and target_id=p_creative_id)::bigint,
    (select count(*) from saved_items where target_type='creative' and target_id=p_creative_id and created_at > now() - interval '30 days')::bigint;
$$;
grant execute on function public.creative_totals(uuid) to authenticated;

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
drop policy if exists "jobs update by accepted creative" on jobs;
create policy "jobs update by accepted creative" on jobs for update
  using (auth.uid() in (select creative_id from proposals where proposals.job_id = jobs.id and proposals.status = 'accepted'))
  with check (auth.uid() in (select creative_id from proposals where proposals.job_id = jobs.id and proposals.status = 'accepted'));

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

-- Realtime: ensure publication includes notifications + REPLICA IDENTITY FULL
-- (required for filtered postgres_changes subscriptions on RLS-protected tables)
alter table notifications replica identity full;
alter table jobs replica identity full;
alter table proposals replica identity full;
do $$ begin
  alter publication supabase_realtime add table notifications;
exception when duplicate_object then null; when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table jobs;
exception when duplicate_object then null; when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table proposals;
exception when duplicate_object then null; when others then null; end $$;

-- Message attachments
alter table messages add column if not exists attachment_url text;
alter table messages add column if not exists attachment_name text;
alter table messages add column if not exists attachment_type text;
alter table messages add column if not exists attachment_size integer;
alter table messages alter column body drop not null;

-- Storage bucket for job/thread file exchange
insert into storage.buckets (id, name, public)
values ('job-files', 'job-files', true)
on conflict (id) do nothing;

drop policy if exists "job-files read" on storage.objects;
create policy "job-files read" on storage.objects for select
  using (bucket_id = 'job-files');

drop policy if exists "job-files insert" on storage.objects;
create policy "job-files insert" on storage.objects for insert
  with check (bucket_id = 'job-files' and auth.uid() is not null);

-- Portfolio gallery (additional images beyond cover) + service image
alter table portfolio_items add column if not exists images text[] not null default '{}';
alter table services add column if not exists image_url text;

-- Profile cover photo (banner). Reuses the `portfolio` bucket.
alter table profiles add column if not exists cover_url text;

-- Storage bucket for portfolio covers and avatars (path prefixed by uid)
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

drop policy if exists "portfolio read" on storage.objects;
create policy "portfolio read" on storage.objects for select
  using (bucket_id = 'portfolio');

drop policy if exists "portfolio insert" on storage.objects;
create policy "portfolio insert" on storage.objects for insert
  with check (
    bucket_id = 'portfolio'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "portfolio update own" on storage.objects;
create policy "portfolio update own" on storage.objects for update
  using (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Email lookup: security-definer so server actions can resolve recipient emails
-- without the service role key. Only callable by authenticated users.
create or replace function public.get_user_email(uid uuid)
returns text language sql security definer set search_path = public, auth as $$
  select email::text from auth.users where id = uid;
$$;
revoke all on function public.get_user_email(uuid) from public, anon;

-- Reviews: tighten insert so only a party to a COMPLETED job can review the
-- other party. Server action also enforces this (defense in depth).
create index if not exists idx_reviews_reviewee on reviews(reviewee_id, created_at desc);

drop policy if exists "reviews insert" on reviews;
create policy "reviews insert" on reviews for insert with check (
  auth.uid() = reviewer_id
  and reviewer_id <> reviewee_id
  and exists (
    select 1 from jobs j
    left join proposals p on p.job_id = j.id and p.status = 'accepted'
    where j.id = reviews.job_id
      and j.status = 'completed'
      and auth.uid() in (j.client_id, p.creative_id)
  )
);

-- Job files are PRIVATE: served via short-lived signed URLs, readable only by
-- the two participants of the thread. Object path is `<thread_id>/<uuid>_name`,
-- so foldername[1] is the thread id. Supersedes the earlier public config.
update storage.buckets set public = false where id = 'job-files';

drop policy if exists "job-files read" on storage.objects;
drop policy if exists "job-files read participants" on storage.objects;
create policy "job-files read participants" on storage.objects for select using (
  bucket_id = 'job-files'
  and exists (
    select 1 from message_threads t
    where t.id::text = (storage.foldername(name))[1]
      and auth.uid() in (t.client_id, t.creative_id)
  )
);

drop policy if exists "job-files insert" on storage.objects;
drop policy if exists "job-files insert participants" on storage.objects;
create policy "job-files insert participants" on storage.objects for insert with check (
  bucket_id = 'job-files'
  and exists (
    select 1 from message_threads t
    where t.id::text = (storage.foldername(name))[1]
      and auth.uid() in (t.client_id, t.creative_id)
  )
);
grant execute on function public.get_user_email(uuid) to authenticated;

-- Admin error log. Populated by lib/admin-errors.ts on payment/payout/webhook
-- failures. Users see only ERR-XXXXX case IDs; raw messages stay here.
create sequence if not exists admin_errors_short_id_seq;
create table if not exists admin_errors (
  id uuid primary key default gen_random_uuid(),
  short_id text not null unique default 'ERR-' || lpad(nextval('admin_errors_short_id_seq')::text, 5, '0'),
  occurred_at timestamptz not null default now(),
  operation text not null,
  job_id uuid references jobs(id) on delete set null,
  user_id uuid references profiles(id) on delete set null,
  message text not null,
  context jsonb,
  resolved_at timestamptz,
  resolved_by uuid references profiles(id),
  resolved_note text
);
create index if not exists admin_errors_unresolved on admin_errors(occurred_at desc) where resolved_at is null;
create index if not exists admin_errors_job on admin_errors(job_id);
alter table admin_errors enable row level security;
drop policy if exists "admin_errors read admin" on admin_errors;
create policy "admin_errors read admin" on admin_errors for select using (public.is_admin(auth.uid()));
drop policy if exists "admin_errors update admin" on admin_errors;
create policy "admin_errors update admin" on admin_errors for update using (public.is_admin(auth.uid()));
-- Users can insert their own reports (operation='user_report'); server-side
-- helper checks user_id = auth.uid() to prevent impersonation.
drop policy if exists "admin_errors insert user report" on admin_errors;
create policy "admin_errors insert user report" on admin_errors for insert
  with check (
    auth.uid() = user_id
    and operation = 'user_report'
  );

-- Saved payout methods (multiple per user). Replaces the flat payout_* columns
-- on profiles for reads; those columns are left in place unused.
create table if not exists payout_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('mobile','bank')),
  mobile_number text,
  mobile_network text check (mobile_network in ('airtel','tnm')),
  bank_uuid text,
  bank_account_name text,
  bank_account_number text,
  label text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists payout_methods_user_id_idx on payout_methods(user_id);
-- Enforce at most one default per user.
create unique index if not exists payout_methods_one_default_per_user
  on payout_methods(user_id) where is_default;

-- Per-job override: creative can select a specific saved method for this job.
alter table jobs add column if not exists payout_method_id uuid references payout_methods(id);

-- Structured job posting (scope-removal follow-through). Additive, nullable
-- so historical jobs keep working.
alter table jobs add column if not exists deliverables text;
alter table jobs add column if not exists deadline date;
alter table jobs add column if not exists revisions_included integer;
alter table jobs add column if not exists format_spec text;

-- Payment settlement timestamp (distinct from payment_initiated_at, which is
-- when we redirected the client to PayChangu — this is when clearance landed).
alter table jobs add column if not exists payment_confirmed_at timestamptz;

-- Cancellation record. Written when either party requests, then updated by
-- admin when they resolve. Executes two payouts (client refund + creative cut).
alter table jobs add column if not exists cancellation_reason text;
alter table jobs add column if not exists cancellation_requested_by uuid references profiles(id);
alter table jobs add column if not exists cancellation_requested_at timestamptz;
alter table jobs add column if not exists cancellation_resolved_by uuid references profiles(id);
alter table jobs add column if not exists cancellation_client_refund_mwk integer;
alter table jobs add column if not exists cancellation_creative_cut_mwk integer;
alter table jobs add column if not exists client_refund_ref text;
alter table jobs add column if not exists client_refund_status text;
alter table jobs add column if not exists creative_cut_ref text;
alter table jobs add column if not exists creative_cut_status text;

-- Mutual deadline extension: either party proposes, the other approves.
create table if not exists deadline_extensions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  proposed_by uuid not null references profiles(id),
  proposed_deadline date not null,
  reason text,
  status text not null default 'pending',
  responded_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists deadline_extensions_one_pending_per_job
  on deadline_extensions(job_id) where status = 'pending';
alter table deadline_extensions enable row level security;
drop policy if exists "de read parties" on deadline_extensions;
create policy "de read parties" on deadline_extensions for select using (
  auth.uid() = proposed_by
  or auth.uid() in (select client_id from jobs where id = job_id)
  or auth.uid() in (select creative_id from proposals where job_id = deadline_extensions.job_id and status = 'accepted')
);
drop policy if exists "de write parties" on deadline_extensions;
create policy "de write parties" on deadline_extensions for all using (
  auth.uid() in (select client_id from jobs where id = job_id)
  or auth.uid() in (select creative_id from proposals where job_id = deadline_extensions.job_id and status = 'accepted')
);

-- Fee capture (populated on successful verify calls). Nulls on jobs paid
-- before this shipped — treat as "unknown" in any report.
alter table jobs add column if not exists collection_fee_mwk integer;
alter table jobs add column if not exists collection_amount_mwk integer;
alter table jobs add column if not exists payout_fee_mwk integer;
alter table jobs add column if not exists payout_amount_mwk integer;
alter table jobs add column if not exists payment_rail text;

-- Pending accept: which proposal the client is trying to pay for. Cleared on
-- payment success (proposal is promoted) or on cancellation. Job stays 'open'
-- and other proposals stay 'pending' the whole time.
alter table jobs add column if not exists pending_accept_proposal_id uuid references proposals(id) on delete set null;

alter table payout_methods enable row level security;
drop policy if exists "payout_methods self read" on payout_methods;
create policy "payout_methods self read" on payout_methods for select using (auth.uid() = user_id);
drop policy if exists "payout_methods self insert" on payout_methods;
create policy "payout_methods self insert" on payout_methods for insert with check (auth.uid() = user_id);
drop policy if exists "payout_methods self update" on payout_methods;
create policy "payout_methods self update" on payout_methods for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "payout_methods self delete" on payout_methods;
create policy "payout_methods self delete" on payout_methods for delete using (auth.uid() = user_id);

-- Direct invites: a client invites a specific creative to a job.
-- Bypasses the 3-attempts-per-creative cap in submitProposal.
create table if not exists job_invites (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  creative_id uuid not null references profiles(id) on delete cascade,
  from_client_id uuid not null references profiles(id),
  message text,
  status text not null default 'pending',
  responded_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists job_invites_one_pending
  on job_invites(job_id, creative_id) where status = 'pending';
create index if not exists job_invites_creative on job_invites(creative_id, status);
alter table job_invites enable row level security;
drop policy if exists "invites read parties" on job_invites;
create policy "invites read parties" on job_invites for select using (
  auth.uid() = creative_id or auth.uid() = from_client_id
);
drop policy if exists "invites insert client" on job_invites;
create policy "invites insert client" on job_invites for insert with check (
  auth.uid() = from_client_id
  and auth.uid() in (select client_id from jobs where id = job_id)
);
drop policy if exists "invites update creative" on job_invites;
create policy "invites update creative" on job_invites for update using (auth.uid() = creative_id);

-- Incremental payment top-ups (Session 3a).
-- Creative requests extra money mid-job; client accepts (via PayChangu in 3b)
-- or declines. Any pending topup is auto-cancelled when the job enters
-- cancellation_requested or disputed (client can't be charged mid-dispute).
create table if not exists payment_topups (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  requested_by_creative_id uuid not null references profiles(id),
  amount_mwk integer not null check (amount_mwk > 0),
  reason text,
  status text not null default 'pending',
  payment_ref text,
  payment_provider_id text,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);
create unique index if not exists payment_topups_one_pending
  on payment_topups(job_id) where status = 'pending';
create index if not exists payment_topups_by_job on payment_topups(job_id, created_at desc);
alter table payment_topups enable row level security;
drop policy if exists "topups read parties" on payment_topups;
create policy "topups read parties" on payment_topups for select using (
  auth.uid() = requested_by_creative_id
  or auth.uid() in (select client_id from jobs where id = job_id)
);
drop policy if exists "topups insert creative" on payment_topups;
create policy "topups insert creative" on payment_topups for insert with check (
  auth.uid() = requested_by_creative_id
  and auth.uid() in (
    select creative_id from proposals
    where job_id = payment_topups.job_id and status = 'accepted'
  )
);
drop policy if exists "topups update parties" on payment_topups;
create policy "topups update parties" on payment_topups for update using (
  auth.uid() = requested_by_creative_id
  or auth.uid() in (select client_id from jobs where id = job_id)
);

-- Cumulative escrow (original + paid topups). Backfill from accepted_bid_mwk
-- so pre-existing jobs are correct. Money math (release payout, cancellation
-- split) reads this; accepted_bid_mwk stays immutable for history.
alter table jobs add column if not exists total_paid_mwk integer;
update jobs set total_paid_mwk = accepted_bid_mwk
  where total_paid_mwk is null and accepted_bid_mwk is not null;

-- Atomic increment of total_paid_mwk when a topup clears. Called by webhook
-- and callback — both may fire; RPC makes concurrent adds safe.
create or replace function public.increment_total_paid(p_job_id uuid, p_amount integer)
returns void language sql security definer set search_path = public as $$
  update jobs
    set total_paid_mwk = coalesce(total_paid_mwk, coalesce(accepted_bid_mwk, 0)) + p_amount
  where id = p_job_id;
$$;
revoke all on function public.increment_total_paid(uuid, integer) from public, anon;
grant execute on function public.increment_total_paid(uuid, integer) to authenticated, service_role;
