-- Sentinel Final Schema Delta (idempotent)
-- Purpose: apply all required schema/policy/function changes to align the current database
-- with the API/frontend code and migration history in this repository.

-- -----------------------------------------------------------------------------
-- 0) Core helper function for workspace membership checks
-- -----------------------------------------------------------------------------
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
$$;

-- -----------------------------------------------------------------------------
-- 1) Profiles trigger (auto-create profile on signup)
-- -----------------------------------------------------------------------------
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
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2) chat_messages workspace_id denormalization (required by API code)
-- -----------------------------------------------------------------------------
alter table public.chat_messages
  add column if not exists workspace_id uuid;

update public.chat_messages cm
set workspace_id = cs.workspace_id
from public.chat_sessions cs
where cm.session_id = cs.id
  and cm.workspace_id is null;

alter table public.chat_messages
  alter column workspace_id set not null;

alter table public.chat_messages
  drop constraint if exists chat_messages_workspace_id_fkey;

alter table public.chat_messages
  add constraint chat_messages_workspace_id_fkey
  foreign key (workspace_id)
  references public.workspaces(id)
  on delete cascade;

-- -----------------------------------------------------------------------------
-- 3) RPC used by workspace member invite flow
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 4) Analysis lock: only one active run per contract
-- -----------------------------------------------------------------------------
create unique index if not exists one_active_analysis_per_contract
  on public.analysis_runs (contract_id)
  where status in ('pending', 'running');

-- -----------------------------------------------------------------------------
-- 5) Required table constraints not guaranteed by current snapshot
-- -----------------------------------------------------------------------------
create unique index if not exists workspace_members_workspace_user_unique
  on public.workspace_members (workspace_id, user_id);

-- -----------------------------------------------------------------------------
-- 6) Enable RLS on all app tables
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 7) Replace policies with final intended set
-- -----------------------------------------------------------------------------
-- Profiles
 drop policy if exists "Users can read own profile" on public.profiles;
 drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Workspaces
 drop policy if exists "Members can read workspace" on public.workspaces;
 drop policy if exists "Authenticated users can create workspaces" on public.workspaces;
 drop policy if exists "Owners can update workspace" on public.workspaces;

create policy "Members can read workspace"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "Authenticated users can create workspaces"
  on public.workspaces for insert
  to authenticated
  with check (true);

create policy "Owners can update workspace"
  on public.workspaces for update
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = public.workspaces.id
        and wm.user_id = auth.uid()
        and wm.role = 'owner'
    )
  );

-- Workspace members
 drop policy if exists "Members can read workspace members" on public.workspace_members;
 drop policy if exists "Owners and admins can insert members" on public.workspace_members;
 drop policy if exists "Owners and admins can delete members" on public.workspace_members;

create policy "Members can read workspace members"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

create policy "Owners and admins can insert members"
  on public.workspace_members for insert
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

create policy "Owners and admins can delete members"
  on public.workspace_members for delete
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = public.workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- Contracts
 drop policy if exists "Members can read contracts" on public.contracts;
 drop policy if exists "Members can insert contracts" on public.contracts;
 drop policy if exists "Members can update contracts" on public.contracts;

create policy "Members can read contracts"
  on public.contracts for select
  using (public.is_workspace_member(workspace_id));

create policy "Members can insert contracts"
  on public.contracts for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "Members can update contracts"
  on public.contracts for update
  using (public.is_workspace_member(workspace_id));

-- Contract clauses
 drop policy if exists "Members can read clauses" on public.contract_clauses;
 drop policy if exists "Members can insert clauses" on public.contract_clauses;

create policy "Members can read clauses"
  on public.contract_clauses for select
  using (public.is_workspace_member(workspace_id));

create policy "Members can insert clauses"
  on public.contract_clauses for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

-- Analysis runs
 drop policy if exists "Members can read analysis runs" on public.analysis_runs;
 drop policy if exists "Members can insert analysis runs" on public.analysis_runs;
 drop policy if exists "Members can update analysis runs" on public.analysis_runs;

create policy "Members can read analysis runs"
  on public.analysis_runs for select
  using (public.is_workspace_member(workspace_id));

create policy "Members can insert analysis runs"
  on public.analysis_runs for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "Members can update analysis runs"
  on public.analysis_runs for update
  using (public.is_workspace_member(workspace_id));

-- Chat sessions
 drop policy if exists "Members can read chat sessions" on public.chat_sessions;
 drop policy if exists "Members can insert chat sessions" on public.chat_sessions;

create policy "Members can read chat sessions"
  on public.chat_sessions for select
  using (public.is_workspace_member(workspace_id));

create policy "Members can insert chat sessions"
  on public.chat_sessions for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

-- Chat messages (final version is workspace_id-based)
 drop policy if exists "Session members can read messages" on public.chat_messages;
 drop policy if exists "Session members can insert messages" on public.chat_messages;
 drop policy if exists "Workspace members can read messages" on public.chat_messages;
 drop policy if exists "Workspace members can insert messages" on public.chat_messages;

create policy "Workspace members can read messages"
  on public.chat_messages for select
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert messages"
  on public.chat_messages for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

-- Public forms tables
 drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
 drop policy if exists "Service role can read subscribers" on public.newsletter_subscribers;

create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers for insert
  with check (true);

create policy "Service role can read subscribers"
  on public.newsletter_subscribers for select
  using (false);

-- Optional: keep contact_submissions private to service role only.
-- No public select policy is created intentionally.

-- -----------------------------------------------------------------------------
-- 8) Storage bucket + policies (contracts)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

drop policy if exists "Workspace members can read contract files" on storage.objects;
drop policy if exists "Workspace members can upload contract files" on storage.objects;
drop policy if exists "Workspace members can delete contract files" on storage.objects;

create policy "Workspace members can read contract files"
  on storage.objects for select
  using (
    bucket_id = 'contracts'
    and auth.uid() is not null
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

create policy "Workspace members can upload contract files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'contracts'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

create policy "Workspace members can delete contract files"
  on storage.objects for delete
  using (
    bucket_id = 'contracts'
    and auth.uid() is not null
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

-- -----------------------------------------------------------------------------
-- 9) Grants/default privileges
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;

