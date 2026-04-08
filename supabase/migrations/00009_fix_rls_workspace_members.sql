-- Fix: tighten workspace_members INSERT policy to prevent race condition.
-- The old policy allowed any authenticated user to insert into a brand-new workspace
-- (the "no members yet" branch). The API already handles owner insertion with
-- service_role, so the RLS policy should only allow owner/admin inserts.
drop policy if exists "Owners and admins can insert members" on workspace_members;

create policy "Owners and admins can insert members"
  on workspace_members for insert
  to authenticated
  with check (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );
