create table chat_sessions (
  id            uuid primary key default gen_random_uuid(),
  contract_id   uuid not null references contracts(id) on delete cascade,
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id),
  title         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references chat_sessions(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);

alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
