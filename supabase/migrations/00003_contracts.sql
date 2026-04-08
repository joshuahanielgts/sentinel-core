create table contracts (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references workspaces(id) on delete cascade,
  uploaded_by     uuid not null references auth.users(id),
  name            text not null,
  file_path       text not null,
  file_size       bigint,
  mime_type       text,
  status          text not null default 'pending'
                    check (status in ('pending', 'uploaded', 'analyzing', 'complete', 'error')),
  risk_score      integer check (risk_score between 0 and 100),
  summary         text,
  key_obligations jsonb,
  red_flags       jsonb,
  error_message   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table contract_clauses (
  id            uuid primary key default gen_random_uuid(),
  contract_id   uuid not null references contracts(id) on delete cascade,
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  raw_text      text not null,
  category      text not null,
  risk_level    text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  rationale     text not null,
  position      integer,
  created_at    timestamptz not null default now()
);

create table analysis_runs (
  id                  uuid primary key default gen_random_uuid(),
  contract_id         uuid not null references contracts(id) on delete cascade,
  workspace_id        uuid not null references workspaces(id) on delete cascade,
  status              text not null default 'pending'
                        check (status in ('pending', 'running', 'complete', 'error')),
  model               text not null,
  prompt_tokens       integer,
  completion_tokens   integer,
  total_tokens        integer,
  duration_ms         integer,
  error_message       text,
  created_at          timestamptz not null default now(),
  completed_at        timestamptz
);

alter table contracts enable row level security;
alter table contract_clauses enable row level security;
alter table analysis_runs enable row level security;
