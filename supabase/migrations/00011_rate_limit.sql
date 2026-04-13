-- Rate limiting table (Supabase-backed, survives cold starts)
create table if not exists public.rate_limit_log (
  user_id  uuid    not null references auth.users(id) on delete cascade,
  window   bigint  not null,
  count    integer not null default 1,
  primary key (user_id, window)
);

-- No RLS — accessed only by service role
alter table public.rate_limit_log disable row level security;

-- Atomic increment + limit check function
create or replace function public.increment_rate_limit(
  p_user_id uuid,
  p_window  bigint,
  p_limit   integer
) returns boolean
language plpgsql
security definer
as $$
declare
  v_count integer;
begin
  insert into public.rate_limit_log (user_id, window, count)
  values (p_user_id, p_window, 1)
  on conflict (user_id, window)
  do update set count = rate_limit_log.count + 1
  returning count into v_count;
  return v_count <= p_limit;
end;
$$;
