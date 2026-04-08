# CLAUDE.md — Sentinel AI (Autonomous Legal Grid)

> This file governs all AI-assisted development on this codebase.
> Read it in full before touching any file. It is the single source of truth for architecture decisions, conventions, and constraints.

---

## 1. Project Identity

**Sentinel AI** is a multi-tenant Contract Risk Analysis micro-SaaS. Users upload legal documents, receive AI-powered risk assessments, and interact with an AI chat assistant scoped to individual contracts.

The product has two distinct runtime environments:

| Layer | Technology | Deployed To |
|---|---|---|
| Frontend SPA | Vite + React + TypeScript | Vercel (static) / Netlify |
| API Server | Next.js (App Router, API routes only) | Vercel (serverless) |
| Data / Auth | Supabase (Postgres + Auth + Storage) | Supabase Cloud |
| AI Provider | Google Gemini API | Google Cloud |
| Payments | Stripe (Phase 10, not yet built) | Stripe Cloud |

> **Critical distinction**: Next.js is the API layer ONLY. There are no pages, no SSR, no `app/page.tsx` files. It is a pure serverless backend. The Vite SPA is a completely separate repository.

---

## 2. Repository Structure

### Frontend (`/apps/web` — Vite SPA)

```
apps/web/
├── src/
│   ├── api/              # Typed API client functions (never raw fetch)
│   ├── components/
│   │   ├── ui/           # ShadCN-generated primitives — NEVER hand-edit these
│   │   └── app/          # Business-logic components
│   ├── contexts/         # AuthContext, WorkspaceContext
│   ├── hooks/            # React Query hooks (one file per resource)
│   ├── layouts/          # AppLayout, AuthLayout
│   ├── lib/
│   │   ├── supabase.ts   # Supabase browser client (singleton)
│   │   └── utils.ts      # cn() helper and misc utilities
│   ├── pages/            # Route-level components
│   ├── types/            # Shared TypeScript interfaces
│   └── main.tsx
├── .env.local            # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
└── vite.config.ts
```

### Backend (`/apps/api` — Next.js API only)

```
apps/api/
├── app/
│   └── api/
│       ├── workspaces/
│       │   ├── route.ts              # GET, POST /api/workspaces
│       │   └── [id]/
│       │       ├── route.ts          # GET /api/workspaces/:id
│       │       └── members/
│       │           └── route.ts      # GET, POST, DELETE /api/workspaces/:id/members
│       ├── contracts/
│       │   ├── route.ts              # GET /api/contracts
│       │   ├── upload/route.ts       # POST /api/contracts/upload
│       │   └── [id]/
│       │       ├── route.ts          # GET /api/contracts/:id
│       │       ├── analyze/route.ts  # POST /api/contracts/:id/analyze
│       │       └── clauses/route.ts  # GET /api/contracts/:id/clauses
│       ├── chat/
│       │   ├── sessions/route.ts     # GET, POST /api/chat/sessions
│       │   └── message/route.ts      # POST /api/chat/message
│       └── dashboard/
│           └── stats/route.ts        # GET /api/dashboard/stats
├── lib/
│   ├── supabase.ts       # Server-side Supabase client (Service Role)
│   ├── auth.ts           # withAuth middleware wrapper
│   ├── gemini.ts         # Gemini API service
│   ├── env.ts            # Zod-validated environment config
│   └── errors.ts         # Typed API error helpers
├── types/
│   ├── database.ts       # Generated from Supabase (never hand-edit)
│   └── api.ts            # Request/response shapes
├── .env.local            # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY
└── next.config.ts
```

---

## 3. Non-Negotiable Architecture Rules

These rules exist to prevent security incidents and data leaks. Breaking them requires a documented decision.

### 3.1 Authentication

- Every Next.js API route MUST be wrapped in `withAuth`. No exceptions.
- `withAuth` extracts the `user` from the Supabase JWT passed as `Authorization: Bearer <token>` in the request header.
- The Supabase **anon key** lives only in the frontend. The **service role key** lives only in the Next.js backend and is never exposed to the client.
- Frontend authenticates via Supabase Auth client (`supabase.auth.signInWithPassword`, OAuth). It then includes the JWT in every API call to the Next.js backend.

```typescript
// lib/auth.ts — the withAuth wrapper pattern
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type AuthHandler = (
  req: NextRequest,
  user: User,
  params: Record<string, string>
) => Promise<NextResponse>

export function withAuth(handler: AuthHandler) {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    return handler(req, user, context.params)
  }
}
```

### 3.2 Row Level Security

- RLS is ENABLED on every table. Never call `supabase.rpc('disable_rls', ...)` or equivalent.
- The server-side service role client bypasses RLS for admin operations. Use it only when needed and always perform manual workspace membership validation before any query.
- The helper function `is_workspace_member(workspace_id UUID)` must be called in every RLS policy that touches workspace-scoped data. Do not inline the membership check SQL — use the function.
- If an RLS policy change is needed, write it as a new migration file. Never run `ALTER POLICY` statements manually against production.

### 3.3 Multi-Tenancy

- Every database table that holds business data has a `workspace_id UUID NOT NULL` column.
- Every API route that reads or writes workspace-scoped data must validate that the authenticated user is a member of the target workspace. Do not trust the `workspace_id` from the request body alone.
- The canonical membership check on the API layer:

```typescript
const { data: membership } = await supabase
  .from('workspace_members')
  .select('role')
  .eq('workspace_id', workspaceId)
  .eq('user_id', user.id)
  .single()

if (!membership) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### 3.4 Environment Variables

All env vars are validated at startup via Zod in `lib/env.ts`. The app must crash on startup if required vars are missing — never use optional chaining (`?.`) on `process.env` values.

**Backend required vars:**
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
```

**Frontend required vars (VITE_ prefix):**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_URL
```

---

## 4. Database Schema

### Tables (in dependency order)

```sql
-- 1. profiles (1:1 with auth.users, created via trigger)
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. workspaces
create table workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3. workspace_members
create table workspace_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null check (role in ('owner', 'admin', 'member')),
  created_at    timestamptz not null default now(),
  unique(workspace_id, user_id)
);

-- 4. contracts
create table contracts (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references workspaces(id) on delete cascade,
  uploaded_by     uuid not null references auth.users(id),
  name            text not null,
  file_path       text not null,      -- Supabase Storage path
  file_size       bigint,
  mime_type       text,
  status          text not null default 'pending'
                    check (status in ('pending', 'uploaded', 'analyzing', 'complete', 'error')),
  risk_score      integer check (risk_score between 0 and 100),
  error_message   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 5. contract_clauses
create table contract_clauses (
  id            uuid primary key default gen_random_uuid(),
  contract_id   uuid not null references contracts(id) on delete cascade,
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  raw_text      text not null,
  category      text not null,   -- e.g. 'Indemnification', 'Termination', 'IP Assignment'
  risk_level    text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  rationale     text not null,
  position      integer,
  created_at    timestamptz not null default now()
);

-- 6. analysis_runs
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

-- 7. chat_sessions
create table chat_sessions (
  id            uuid primary key default gen_random_uuid(),
  contract_id   uuid not null references contracts(id) on delete cascade,
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id),
  title         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 8. chat_messages
create table chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references chat_sessions(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);
```

### RLS Helper Function

```sql
create or replace function is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
$$;
```

### Triggers

```sql
-- Auto-create profile on signup
create or replace function handle_new_user()
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

---

## 5. TypeScript Types

### 5.1 Core Database Types

```typescript
// types/database.ts — generated by Supabase CLI, do not hand-edit
// Regenerate with: npx supabase gen types typescript --project-id <id> > types/database.ts
```

### 5.2 Application Types

```typescript
// types/api.ts

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ContractStatus = 'pending' | 'uploaded' | 'analyzing' | 'complete' | 'error'
export type WorkspaceRole = 'owner' | 'admin' | 'member'
export type MessageRole = 'user' | 'assistant'

export interface GeminiAnalysisResponse {
  summary: string
  overall_risk_level: RiskLevel
  risk_score: number          // 0-100
  key_obligations: string[]
  red_flags: string[]
  clauses: GeminiClause[]
}

export interface GeminiClause {
  raw_text: string
  category: string
  risk_level: RiskLevel
  rationale: string
  position: number
}

export interface UploadContractRequest {
  name: string
  file_name: string
  file_size: number
  mime_type: string
  workspace_id: string
}

export interface UploadContractResponse {
  contract_id: string
  upload_url: string
  upload_path: string
}

export interface ChatMessageRequest {
  session_id: string
  content: string
}

export interface DashboardStats {
  total_contracts: number
  contracts_by_risk: Record<RiskLevel, number>
  pending_analysis: number
  recent_high_risk_clauses: RecentClause[]
}

export interface RecentClause {
  id: string
  contract_name: string
  category: string
  risk_level: RiskLevel
  rationale: string
}
```

---

## 6. Gemini API Integration

### System Prompt (Contract Analysis)

The Gemini call in `lib/gemini.ts` must use this exact system prompt structure:

```typescript
const ANALYSIS_SYSTEM_PROMPT = `
You are a senior contract attorney AI. Your job is to analyze legal contracts and return a structured risk assessment.

You MUST respond with valid JSON only. No markdown, no explanation, no preamble.

Return exactly this structure:
{
  "summary": "2-3 sentence plain-English summary of the contract",
  "overall_risk_level": "low" | "medium" | "high" | "critical",
  "risk_score": <integer 0-100>,
  "key_obligations": ["obligation 1", "obligation 2"],
  "red_flags": ["red flag 1", "red flag 2"],
  "clauses": [
    {
      "raw_text": "exact text of the clause",
      "category": "category name",
      "risk_level": "low" | "medium" | "high" | "critical",
      "rationale": "1-2 sentence explanation of why this is risky or safe",
      "position": <integer, order in document starting at 1>
    }
  ]
}

Risk scoring:
- 0-25: Low risk. Standard commercial terms.
- 26-50: Medium risk. Some unfavorable terms but negotiable.
- 51-75: High risk. Material clauses that significantly favor the other party.
- 76-100: Critical risk. Clauses that could expose the signing party to severe liability.
`.trim()
```

### Gemini Service Pattern

```typescript
// lib/gemini.ts

import { GoogleGenerativeAI, Part } from '@google/generative-ai'
import { env } from './env'
import type { GeminiAnalysisResponse } from '@/types/api'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export async function analyzeContract(
  fileBuffer: Uint8Array,
  mimeType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
): Promise<GeminiAnalysisResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

  const filePart: Part = {
    inlineData: {
      data: Buffer.from(fileBuffer).toString('base64'),
      mimeType,
    },
  }

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [filePart, { text: 'Analyze this contract.' }] }],
    systemInstruction: ANALYSIS_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  })

  const raw = result.response.text()

  let parsed: GeminiAnalysisResponse
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${raw.slice(0, 200)}`)
  }

  return parsed
}
```

---

## 7. API Route Conventions

### Response Format

All API routes return JSON. Success and error responses follow this shape:

```typescript
// Success
{ data: T }

// Error
{ error: string, code?: string }
```

### HTTP Status Codes

| Situation | Code |
|---|---|
| Success (read) | 200 |
| Success (created) | 201 |
| Validation error | 400 |
| Unauthenticated | 401 |
| Forbidden (not workspace member) | 403 |
| Not found | 404 |
| Internal / Gemini failure | 500 |

### Route Template

Every route file follows this exact pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

const RequestSchema = z.object({
  // define your shape here
})

export const POST = withAuth(async (req, user, params) => {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // ... business logic

  return NextResponse.json({ data: result }, { status: 201 })
})
```

---

## 8. Frontend Conventions

### State Management

- Server state (API data): **React Query only**. No manual `useState` + `useEffect` for async data.
- Global client state: React Context (`AuthContext`, `WorkspaceContext`). Keep it minimal.
- Local component state: `useState` / `useReducer`.
- Do not use Redux, Zustand, or Jotai. The current setup does not need them.

### React Query Hooks

One file per resource in `src/hooks/`. Export named hooks:

```typescript
// hooks/useContracts.ts
export function useContracts(workspaceId: string) { ... }
export function useContract(contractId: string) { ... }
export function useUploadContract() { ... }   // useMutation
export function useAnalyzeContract() { ... }  // useMutation
```

Query key convention: `['contracts', workspaceId]`, `['contract', contractId]`, `['clauses', contractId]`

### API Client

Never write `fetch` calls inline in components. All API calls go through typed functions in `src/api/`:

```typescript
// api/contracts.ts
import { apiClient } from './client'
import type { UploadContractRequest, UploadContractResponse } from '@/types/api'

export const contractsApi = {
  upload: (data: UploadContractRequest) =>
    apiClient.post<UploadContractResponse>('/contracts/upload', data),

  analyze: (contractId: string) =>
    apiClient.post(`/contracts/${contractId}/analyze`),

  list: (workspaceId: string) =>
    apiClient.get(`/contracts?workspace_id=${workspaceId}`),
}
```

The `apiClient` always reads the JWT from the Supabase session and injects `Authorization: Bearer <token>`.

### Component Rules

- Use ShadCN components for all UI primitives (Button, Input, Dialog, etc.). Do not build your own.
- Do not hand-edit files inside `src/components/ui/` — these are ShadCN-managed.
- Business components live in `src/components/app/`.
- Every page component is a default export in `src/pages/`. Route registration lives in `src/main.tsx`.
- Zod schemas for form validation live next to the form component that uses them.

---

## 9. File Storage

### Bucket Configuration

Bucket name: `contracts`
Path structure: `{workspace_id}/{contract_id}/{filename}`

### Upload Flow (Two-Phase)

1. Frontend calls `POST /api/contracts/upload` with file metadata → receives a signed upload URL + a new `contract_id`.
2. Frontend uploads file **directly to Supabase Storage** using the signed URL (never through the Next.js API — this would exhaust function memory limits).
3. Frontend calls `PATCH /api/contracts/:id` to confirm upload complete → backend updates status to `uploaded`.

### Storage RLS Policy

```sql
-- Only workspace members can read contract files
create policy "workspace members can read contracts"
on storage.objects for select
using (
  auth.uid() is not null
  and is_workspace_member(
    (storage.foldername(name))[1]::uuid  -- first path segment = workspace_id
  )
);
```

---

## 10. Phased Build Plan

Work through phases in strict order. Do not start a phase until the previous one is verified.

| Phase | Scope | Status |
|---|---|---|
| **1** | DB schema, triggers, RLS, storage | ⬜ Not started |
| **2** | Next.js scaffold, `withAuth`, env validation, TS types, route stubs | ⬜ Not started |
| **3** | Workspace + members API (full CRUD) | ⬜ Not started |
| **4** | Vite frontend, auth flows, route guards, workspace context, app shell | ⬜ Not started |
| **5** | Document upload pipeline (signed URL flow, contracts list page) | ⬜ Not started |
| **6** | Gemini analysis pipeline, clause storage, contract detail page, risk gauge | ⬜ Not started |
| **7** | Contract chat (sessions, streaming messages, chat panel) | ⬜ Not started |
| **8** | Dashboard (stats API, Recharts visualizations, alerts panel) | ⬜ Not started |
| **9** | Hardening (error boundaries, rate limiting, RLS audit, MIME validation) | ⬜ Not started |
| **10** | Stripe payments, usage gates, billing page | ⬜ Not started |

---

## 11. Code Generation Rules

When generating code for this project, follow these constraints absolutely:

1. **No placeholders.** Never write `// TODO`, `// implement later`, or stub functions that return `null`. Write the complete implementation.

2. **No bypassing auth.** Every route uses `withAuth`. No exceptions. No public endpoints except health checks.

3. **Zod on every input.** Every API route that receives a request body must validate it with a Zod schema before touching the database.

4. **Type the database.** All Supabase queries must use the generated `Database` type. Never use `any` for query results.

5. **Service role scoping.** The `supabaseAdmin` client (service role) is only used after the API route has already validated workspace membership manually. Never use it to bypass access checks.

6. **Migrations, not direct SQL.** Schema changes go in versioned migration files (`supabase/migrations/YYYYMMDDHHMMSS_description.sql`). Never ALTER production tables directly.

7. **One concern per file.** Routes handle HTTP. `lib/gemini.ts` handles AI. `lib/auth.ts` handles auth. Do not mix these.

8. **Errors are typed.** Use the `AppError` helper in `lib/errors.ts` to return consistent error shapes. Do not throw raw strings.

9. **Streaming for chat.** The `POST /api/chat/message` route streams the Gemini response using `ReadableStream`. Do not buffer the full response before returning.

10. **Never commit secrets.** `.env.local` is in `.gitignore`. If a secret appears in source code, it is a critical bug.

---

## 12. Common Mistakes to Avoid

| Mistake | Why it's wrong | Correct approach |
|---|---|---|
| Using `SUPABASE_SERVICE_ROLE_KEY` in the frontend | Bypasses all RLS, full DB access for anyone | Service role key is backend-only |
| Calling Gemini API from the frontend | Exposes API key, no rate limiting | Call through `/api/contracts/:id/analyze` |
| Uploading files through the Next.js API route | Serverless functions have memory limits (~50MB) | Use signed URL → direct-to-storage upload |
| Querying without `workspace_id` filter | Data leaks across tenants | Always scope queries to `workspace_id` |
| Storing chat history in component state | Lost on refresh, breaks back-navigation | Persist to `chat_messages` table |
| Ignoring Gemini token counts | Unbounded cost per analysis run | Log `prompt_tokens` and `completion_tokens` to `analysis_runs` |
| Re-running analysis on a completed contract | Wastes tokens and money | Check `contracts.status === 'complete'` before triggering analysis |
| Editing `src/components/ui/` files | ShadCN overwrites them on next add | Override styles via Tailwind classes on the usage site |

---

## 13. Local Development Setup

```bash
# 1. Clone repos
git clone <frontend-repo> apps/web
git clone <backend-repo>  apps/api

# 2. Install deps
cd apps/web && npm install
cd ../api && npm install

# 3. Link Supabase project
cd ../api
npx supabase login
npx supabase link --project-ref <your-project-ref>

# 4. Run migrations
npx supabase db push

# 5. Generate types
npx supabase gen types typescript --project-id <id> > types/database.ts

# 6. Start dev servers
# Terminal 1
cd apps/api && npm run dev     # Next.js on :3001

# Terminal 2
cd apps/web && npm run dev     # Vite on :5173
```

---

## 14. Testing Checklist (Pre-PR)

Before any PR is opened, manually verify:

- [ ] A new user can sign up and a `profiles` row is created automatically
- [ ] A user cannot read contracts from a workspace they are not a member of (test with two accounts)
- [ ] Uploading a file creates a `contracts` row with `status: 'pending'` → `'uploaded'`
- [ ] Triggering analysis updates `status` to `'analyzing'` → `'complete'` and populates `contract_clauses`
- [ ] A user cannot trigger analysis on a contract in another workspace (403 expected)
- [ ] Chat messages persist across page refreshes
- [ ] The dashboard stats reflect accurate counts for the active workspace only