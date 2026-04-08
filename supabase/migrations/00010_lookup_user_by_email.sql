-- Performant O(1) user lookup by email, callable from the service_role client.
create or replace function lookup_user_id_by_email(target_email text)
returns uuid
language sql
security definer
stable
as $$
  select id from auth.users where email = target_email limit 1;
$$;
