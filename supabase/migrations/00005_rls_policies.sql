-- Workspaces: members can read their workspaces
create policy "Members can read workspace"
  on workspaces for select
  using (is_workspace_member(id));

create policy "Authenticated users can create workspaces"
  on workspaces for insert
  to authenticated
  with check (true);

create policy "Owners can update workspace"
  on workspaces for update
  using (
    exists (
      select 1 from workspace_members
      where workspace_id = workspaces.id
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

-- Workspace Members
create policy "Members can read workspace members"
  on workspace_members for select
  using (is_workspace_member(workspace_id));

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
    or not exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
    )
  );

create policy "Owners and admins can delete members"
  on workspace_members for delete
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- Contracts
create policy "Members can read contracts"
  on contracts for select
  using (is_workspace_member(workspace_id));

create policy "Members can insert contracts"
  on contracts for insert
  to authenticated
  with check (is_workspace_member(workspace_id));

create policy "Members can update contracts"
  on contracts for update
  using (is_workspace_member(workspace_id));

-- Contract Clauses
create policy "Members can read clauses"
  on contract_clauses for select
  using (is_workspace_member(workspace_id));

create policy "Members can insert clauses"
  on contract_clauses for insert
  to authenticated
  with check (is_workspace_member(workspace_id));

-- Analysis Runs
create policy "Members can read analysis runs"
  on analysis_runs for select
  using (is_workspace_member(workspace_id));

create policy "Members can insert analysis runs"
  on analysis_runs for insert
  to authenticated
  with check (is_workspace_member(workspace_id));

create policy "Members can update analysis runs"
  on analysis_runs for update
  using (is_workspace_member(workspace_id));

-- Chat Sessions
create policy "Members can read chat sessions"
  on chat_sessions for select
  using (is_workspace_member(workspace_id));

create policy "Members can insert chat sessions"
  on chat_sessions for insert
  to authenticated
  with check (is_workspace_member(workspace_id));

-- Chat Messages
create policy "Session members can read messages"
  on chat_messages for select
  using (
    exists (
      select 1 from chat_sessions cs
      where cs.id = chat_messages.session_id
        and is_workspace_member(cs.workspace_id)
    )
  );

create policy "Session members can insert messages"
  on chat_messages for insert
  to authenticated
  with check (
    exists (
      select 1 from chat_sessions cs
      where cs.id = chat_messages.session_id
        and is_workspace_member(cs.workspace_id)
    )
  );
