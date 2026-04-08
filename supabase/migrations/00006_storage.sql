insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

create policy "Workspace members can read contract files"
  on storage.objects for select
  using (
    bucket_id = 'contracts'
    and auth.uid() is not null
    and is_workspace_member(
      (storage.foldername(name))[1]::uuid
    )
  );

create policy "Workspace members can upload contract files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'contracts'
    and is_workspace_member(
      (storage.foldername(name))[1]::uuid
    )
  );

create policy "Workspace members can delete contract files"
  on storage.objects for delete
  using (
    bucket_id = 'contracts'
    and auth.uid() is not null
    and is_workspace_member(
      (storage.foldername(name))[1]::uuid
    )
  );
