-- ============================================================
-- SENTINEL AI — Complete Database Schema
-- ============================================================

-- 1. EXTENSIONS
create extension if not exists pgcrypto;

-- 2. TABLES (in dependency order)

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id),
  name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  status text not null default 'pending'
    check (status in ('pending', 'uploaded', 'analyzing', 'complete', 'error')),
  risk_score integer check (risk_score between 0 and 100),
  summary text,
  key_obligations jsonb,
  red_flags jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contract_clauses (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  raw_text text not null,
  category text not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  rationale text not null,
  position integer,
  created_at timestamptz not null default now()
);

create table if not exists public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'running', 'complete', 'error')),
  model text not null,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  duration_ms integer,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_submissions (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  company text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid not null default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.rate_limit_log (
  user_id uuid not null references auth.users(id) on delete cascade,
  window bigint not null,
  count integer not null default 1,
  primary key (user_id, window)
);

-- 3. HELPER FUNCTIONS (after tables so plpgsql bodies can reference them)

create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language plpgsql
security definer
stable
as $$
begin
  return exists (
    select 1
    from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
end;
$$;

create or replace function public.lookup_user_id_by_email(target_email text)
returns uuid
language sql
security definer
stable
as $$
  select id
  from auth.users
  where email = target_email
  limit 1;
$$;

create or replace function public.increment_rate_limit(
  p_user_id uuid,
  p_window bigint,
  p_limit integer
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_count integer;
begin
  insert into public.rate_limit_log (user_id, window, count)
  values (p_user_id, p_window, 1)
  on conflict (user_id, window)
  do update set count = public.rate_limit_log.count + 1
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  return new;
end;
$$;

-- 4. INDEXES

-- analysis_runs
create unique index if not exists one_active_analysis_per_contract
  on public.analysis_runs (contract_id)
  where status in ('pending', 'running');

-- 5. TRIGGERS

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- 6. ROW LEVEL SECURITY

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_clauses enable row level security;
alter table public.analysis_runs enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.rate_limit_log enable row level security;

-- profiles

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- workspaces

drop policy if exists "Members can read workspace" on public.workspaces;
create policy "Members can read workspace"
  on public.workspaces
  for select
  using (public.is_workspace_member(id));

drop policy if exists "Authenticated users can create workspaces" on public.workspaces;
create policy "Authenticated users can create workspaces"
  on public.workspaces
  for insert
  to authenticated
  with check (true);

drop policy if exists "Owners can update workspace" on public.workspaces;
create policy "Owners can update workspace"
  on public.workspaces
  for update
  using (
    exists (
      select 1
      from public.workspace_members
      where workspace_id = public.workspaces.id
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

-- workspace_members

drop policy if exists "Members can read workspace members" on public.workspace_members;
create policy "Members can read workspace members"
  on public.workspace_members
  for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Owners and admins can insert members" on public.workspace_members;
create policy "Owners and admins can insert members"
  on public.workspace_members
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = public.workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
    or not exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = public.workspace_members.workspace_id
    )
  );

drop policy if exists "Owners and admins can delete members" on public.workspace_members;
create policy "Owners and admins can delete members"
  on public.workspace_members
  for delete
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = public.workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- contracts

drop policy if exists "Members can read contracts" on public.contracts;
create policy "Members can read contracts"
  on public.contracts
  for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can insert contracts" on public.contracts;
create policy "Members can insert contracts"
  on public.contracts
  for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can update contracts" on public.contracts;
create policy "Members can update contracts"
  on public.contracts
  for update
  using (public.is_workspace_member(workspace_id));

-- contract_clauses

drop policy if exists "Members can read clauses" on public.contract_clauses;
create policy "Members can read clauses"
  on public.contract_clauses
  for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can insert clauses" on public.contract_clauses;
create policy "Members can insert clauses"
  on public.contract_clauses
  for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

-- analysis_runs

drop policy if exists "Members can read analysis runs" on public.analysis_runs;
create policy "Members can read analysis runs"
  on public.analysis_runs
  for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can insert analysis runs" on public.analysis_runs;
create policy "Members can insert analysis runs"
  on public.analysis_runs
  for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can update analysis runs" on public.analysis_runs;
create policy "Members can update analysis runs"
  on public.analysis_runs
  for update
  using (public.is_workspace_member(workspace_id));

-- chat_sessions

drop policy if exists "Members can read chat sessions" on public.chat_sessions;
create policy "Members can read chat sessions"
  on public.chat_sessions
  for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can insert chat sessions" on public.chat_sessions;
create policy "Members can insert chat sessions"
  on public.chat_sessions
  for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

-- chat_messages (final policy set)

drop policy if exists "Session members can read messages" on public.chat_messages;
drop policy if exists "Session members can insert messages" on public.chat_messages;

drop policy if exists "Workspace members can read messages" on public.chat_messages;
create policy "Workspace members can read messages"
  on public.chat_messages
  for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can insert messages" on public.chat_messages;
create policy "Workspace members can insert messages"
  on public.chat_messages
  for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

-- newsletter_subscribers

drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers
  for insert
  with check (true);

drop policy if exists "Service role can read subscribers" on public.newsletter_subscribers;
create policy "Service role can read subscribers"
  on public.newsletter_subscribers
  for select
  using (false);

-- contact_submissions
-- Intentionally no policies: RLS enabled, read/write reserved to service_role.

-- 7. STORAGE

insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

drop policy if exists "Workspace members can read contract files" on storage.objects;
create policy "Workspace members can read contract files"
  on storage.objects
  for select
  using (
    bucket_id = 'contracts'
    and auth.uid() is not null
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "Workspace members can upload contract files" on storage.objects;
create policy "Workspace members can upload contract files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'contracts'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "Workspace members can delete contract files" on storage.objects;
create policy "Workspace members can delete contract files"
  on storage.objects
  for delete
  using (
    bucket_id = 'contracts'
    and auth.uid() is not null
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

-- 8. GRANTS

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to authenticated, service_role;
grant select on all tables in schema public to anon;
grant all on all sequences in schema public to authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to authenticated, service_role;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant all on sequences to authenticated, service_role;
alter default privileges in schema public
  grant all on routines to anon, authenticated, service_role;

revoke all on public.rate_limit_log from anon, authenticated;
grant select, insert, update on public.rate_limit_log to service_role;
