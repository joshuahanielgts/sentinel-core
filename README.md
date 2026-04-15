# Sentinel AI

Multi-tenant **contract risk analysis** app: upload PDF/DOCX contracts, run **Gemini** analysis, review clauses and risk scores, and chat about each contract with optional **Red Team** mode.

This repository is a **monorepo**:

| Part | Stack | Role |
|------|--------|------|
| **Frontend** | Vite + React + TypeScript (`/src`) | SPA; Supabase Auth; calls the API |
| **Backend** | Next.js 15 App Router (`/apps/api`) | **API routes only** — no pages, no SSR |
| **Data** | Supabase | Postgres, Auth, Storage, RLS |

## Repository layout

```
.
├── src/                    # Vite SPA (pages, components, hooks, api client)
├── apps/api/               # Next.js API server only
│   ├── app/api/            # REST endpoints
│   ├── lib/                # auth, env, Gemini, Supabase admin, rate limit
│   ├── middleware.ts       # CORS
│   └── vercel.json         # Vercel defaults for this app
├── supabase/migrations/    # SQL migrations
├── vercel.json             # SPA routing (use when deploying frontend from repo root)
├── claude.md               # Architecture & conventions
└── README.md
```

## Local development

**Terminal 1 — API**

```bash
cd apps/api
cp .env.local.example .env.local   # then fill in real keys
npm install
npm run dev
```

API: `http://localhost:3001`

**Terminal 2 — Frontend**

```bash
cp .env.local.example.frontend .env.local   # or create .env.local at repo root
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Set `VITE_API_URL=http://localhost:3001` (no `/api` suffix; the client adds `/api`).

### Required environment variables

**`apps/api/.env.local`**

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | JWT anon key (`eyJ...`), not the publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | JWT service role (server only) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `FRONTEND_URL` | Exact origin allowed for CORS (e.g. `http://localhost:5173`) |

**Frontend `.env.local` (repo root)**

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Same as `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Same anon JWT as API |
| `VITE_API_URL` | API base, e.g. `http://localhost:3001` or your deployed API URL |

### Database

Apply `supabase/migrations/00001_schema.sql` in the Supabase SQL Editor, or use `supabase db push` if you use the CLI.

---

## Deploying to Vercel

Use **two Vercel projects** (one for the API, one for the SPA).

### 1. Backend (Next.js API)

1. Import this GitHub repo.
2. **Root Directory:** `apps/api`
3. Framework: Next.js (auto-detected).
4. **Environment variables** (Production & Preview as needed):

   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `FRONTEND_URL` — set to your **deployed frontend URL**, e.g. `https://your-app.vercel.app`  
     (must match the browser origin exactly, including `https`.)

5. Deploy. Note the API URL, e.g. `https://sentinel-api.vercel.app`.

**Contract analysis** uses `export const maxDuration = 300` on the analyze route. On **Vercel Hobby**, serverless execution time is limited (often 10–60s depending on plan). If analysis times out, upgrade to **Pro** or run the API on a host with longer limits.

### 2. Frontend (Vite static app)

1. **Second** Vercel project, same repo.
2. **Root Directory:** `.` (repository root, leave empty / `/`).
3. **Build Command:** `npm run build`  
4. **Output Directory:** `dist`  
5. **Install Command:** `npm install`
6. The root `vercel.json` provides SPA **rewrites** so React Router paths (e.g. `/w/:id/dashboard`) load `index.html`.

**Frontend environment variables**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` — your **deployed API origin**, e.g. `https://sentinel-api.vercel.app` (no trailing slash; client appends `/api/...`).

7. After the first deploy, set **`FRONTEND_URL`** on the API project to this frontend URL and redeploy the API so CORS matches.

### Supabase auth redirects

In Supabase → Authentication → URL configuration, add:

- **Site URL:** your production frontend URL  
- **Redirect URLs:** same URL and any preview URLs you use (e.g. `https://*.vercel.app` if you use wildcard previews).

---

## API overview

All JSON routes expect `Authorization: Bearer <supabase_access_token>` unless noted.

| Area | Examples |
|------|-----------|
| Workspaces | `GET/POST /api/workspaces`, members CRUD |
| Contracts | list, upload (signed URL), `PATCH` confirm, `POST .../analyze`, clauses |
| Chat | sessions, `POST /api/chat/message` (streams `text/plain`), message history |
| Dashboard | `GET /api/dashboard/stats?workspace_id=` |

See `claude.md` for conventions (auth, RLS, Zod, no secrets in client code).

---

## Production build (local check)

```bash
# Frontend
npm run build

# API
cd apps/api && npm run build
```

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| CORS errors | `FRONTEND_URL` on API equals the exact frontend origin |
| `401` from API | JWT sent from Supabase session; not expired |
| Analysis timeout on Vercel | Plan limits; consider Pro or longer `maxDuration` eligibility |
| SPA 404 on refresh | Root `vercel.json` rewrites; Output Directory `dist` |
| Invalid Supabase key | Use JWT keys (`eyJ...`), not publishable-only keys |

---

## License

MIT
