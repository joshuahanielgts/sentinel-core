# Sentinel AI — Contract Risk Analysis API

Backend API for Sentinel AI, a multi-tenant contract risk analysis platform. Upload legal documents (PDF/DOCX), receive AI-powered risk assessments with clause-level findings, and interact with an AI chat assistant scoped to individual contracts.

## Tech Stack

| Layer | Technology |
|---|---|
| API Server | Next.js 15 (App Router, API routes only) |
| Database / Auth / Storage | Supabase (Postgres + Auth + Storage) |
| AI | Google Gemini 2.5 Pro |
| Validation | Zod |
| Runtime | Node.js 18+ |

> **This repository is a pure API backend.** There are no pages, no SSR, no HTML rendering. The frontend is a separate application that consumes these endpoints.

## Repository Structure

```
sentinel-core/
├── apps/api/                       # Next.js API-only backend
│   ├── app/api/                    # API route handlers
│   │   ├── workspaces/             # Workspace CRUD
│   │   ├── contracts/              # Upload, detail, analyze, clauses
│   │   ├── chat/                   # Sessions, messages, streaming
│   │   └── dashboard/              # Aggregated stats
│   ├── lib/                        # Shared modules
│   │   ├── auth.ts                 # withAuth middleware (JWT validation)
│   │   ├── env.ts                  # Zod-validated environment config
│   │   ├── errors.ts               # Typed error responses
│   │   ├── gemini.ts               # Gemini API (analysis + chat)
│   │   ├── rateLimit.ts            # DB-backed rate limiting
│   │   └── supabase.ts             # Admin client (service role)
│   ├── types/                      # TypeScript type definitions
│   │   ├── api.ts                  # Request/response interfaces
│   │   └── database.ts             # Generated Supabase types
│   └── middleware.ts               # CORS handling
├── supabase/
│   ├── migrations/00001_schema.sql # Complete database schema
│   └── config.toml                 # Local Supabase config
├── claude.md                       # Architecture decisions & conventions
└── README.md
```

## API Endpoints

All endpoints require `Authorization: Bearer <supabase-jwt>` except OPTIONS.

### Workspaces

| Method | Path | Description |
|---|---|---|
| GET | `/api/workspaces` | List user's workspaces |
| POST | `/api/workspaces` | Create workspace (user becomes owner) |
| GET | `/api/workspaces/:id` | Get workspace detail |
| GET | `/api/workspaces/:id/members` | List members |
| POST | `/api/workspaces/:id/members` | Add member by email |
| DELETE | `/api/workspaces/:id/members` | Remove member |

### Contracts

| Method | Path | Description |
|---|---|---|
| GET | `/api/contracts?workspace_id=` | List contracts in workspace |
| POST | `/api/contracts/upload` | Get signed upload URL (PDF/DOCX) |
| GET | `/api/contracts/:id` | Contract detail (status, risk score, summary) |
| PATCH | `/api/contracts/:id` | Confirm upload (`status: 'uploaded'`) |
| POST | `/api/contracts/:id/analyze` | Trigger Gemini analysis |
| GET | `/api/contracts/:id/clauses` | List extracted clauses |

### Chat

| Method | Path | Description |
|---|---|---|
| GET | `/api/chat/sessions?contract_id=` | List chat sessions for a contract |
| POST | `/api/chat/sessions` | Create new session |
| POST | `/api/chat/message` | Send message (streams response) |
| GET | `/api/chat/messages?session_id=` | Get message history |

### Dashboard

| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard/stats?workspace_id=` | Risk breakdown, counts, recent high-risk clauses |

## Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google Gemini API](https://aistudio.google.com/apikey) key

### 1. Install dependencies

```bash
cd apps/api
npm install
```

### 2. Configure environment

Create `apps/api/.env.local`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...                    # JWT anon key (NOT the publishable key)
SUPABASE_SERVICE_ROLE_KEY=eyJ...            # JWT service role key
GEMINI_API_KEY=AIza...
FRONTEND_URL=http://localhost:5173          # CORS allowed origin
```

> **Important:** The `SUPABASE_ANON_KEY` must be the JWT-format anon key (starts with `eyJ`), not the `sb_publishable_` key. Find it in Supabase Dashboard > Settings > API > Project API keys.

### 3. Apply database schema

Option A — Supabase CLI:
```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Option B — Run `supabase/migrations/00001_schema.sql` directly in the Supabase SQL Editor.

### 4. Regenerate TypeScript types (optional)

```bash
npx supabase gen types typescript --project-id <project-id> > types/database.ts
```

### 5. Start the dev server

```bash
cd apps/api
npm run dev
```

The API runs at `http://localhost:3001`.

### 6. Verify

```bash
# Should return 401 Unauthorized (no token)
curl http://localhost:3001/api/workspaces

# Should return 200 with CORS headers
curl -X OPTIONS http://localhost:3001/api/workspaces -v
```

## Build for Production

```bash
cd apps/api
npm run build
npm start
```

## Security Model

- **Every route** is wrapped in `withAuth` — validates the Supabase JWT and extracts the user.
- **Workspace membership** is checked on every data-access route. Users can only read/write data in workspaces they belong to.
- **Row Level Security** is enabled on all tables. RLS policies use `is_workspace_member()` for workspace-scoped data.
- **Service role key** is backend-only, never exposed to clients. The API validates membership manually before using the admin client.
- **Rate limiting** uses a DB-backed sliding window (`increment_rate_limit` RPC).
- **File uploads** use Supabase signed URLs — files go directly to storage, never through the API server.

## Contract Analysis Flow

1. **Upload**: Client calls `POST /api/contracts/upload` with metadata → receives signed URL
2. **Direct upload**: Client uploads file directly to Supabase Storage using the signed URL
3. **Confirm**: Client calls `PATCH /api/contracts/:id` with `{ status: 'uploaded' }`
4. **Analyze**: Client calls `POST /api/contracts/:id/analyze` → Gemini processes the document
5. **Results**: Contract status becomes `complete` with `risk_score`, `summary`, `key_obligations`, `red_flags`, and individual `contract_clauses`

## Chat Flow

1. **Create session**: `POST /api/chat/sessions` with `contract_id`
2. **Send message**: `POST /api/chat/message` with `session_id`, `content`, and optional `mode: 'redteam'`
3. **Response streams** back as `text/plain` chunks (Gemini streaming)
4. **History**: `GET /api/chat/messages?session_id=` returns persisted messages

Red-team mode uses an adversarial prompt that stress-tests the contract from opposing counsel's perspective.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `401` on all requests | Wrong or expired JWT | Check that the frontend sends a valid Supabase session token |
| `Invalid API key` error on startup | Wrong `SUPABASE_ANON_KEY` | Use the JWT anon key (`eyJ...`), not `sb_publishable_` |
| `FRONTEND_URL` validation error | Missing env var | Add `FRONTEND_URL=http://localhost:5173` to `.env.local` |
| CORS errors in browser | Origin mismatch | Set `FRONTEND_URL` to match your frontend's origin |
| Analysis fails with network error | Proxy/firewall blocks Gemini | Allow outbound HTTPS to `generativelanguage.googleapis.com` |
| Analysis fails with 403 | Invalid Gemini key | Verify `GEMINI_API_KEY` and that the Gemini API is enabled |
| `permission denied for table` | Missing grants | Re-run the migration or apply the GRANTS section in SQL Editor |

## License

MIT
