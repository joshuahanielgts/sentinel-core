-- Denormalize workspace_id onto chat_messages so RLS policies can avoid
-- a JOIN through chat_sessions on every row check.

alter table chat_messages
  add column if not exists workspace_id uuid
  references workspaces(id) on delete cascade;

update chat_messages cm
set workspace_id = cs.workspace_id
from chat_sessions cs
where cm.session_id = cs.id;

alter table chat_messages
  alter column workspace_id set not null;

create policy "Workspace members can read messages"
  on chat_messages for select
  using (is_workspace_member(workspace_id));

create policy "Workspace members can insert messages"
  on chat_messages for insert
  to authenticated
  with check (is_workspace_member(workspace_id));

drop policy if exists "Session members can read messages" on chat_messages;
drop policy if exists "Session members can insert messages" on chat_messages;
