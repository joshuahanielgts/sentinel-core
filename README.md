# Sentinel Core

Sentinel Core is an AI-powered contract risk analysis platform.

You can:
- Upload contracts to workspace-scoped storage
- Run AI analysis to produce risk scores and clause-level findings
- Review dashboard stats and flagged risks
- Chat against analyzed contracts, including red-team mode

The repository is a split frontend and backend setup:
- Frontend: Vite + React + TypeScript at repository root
- Backend: Next.js API-only service in apps/api
- Data/Auth/Storage: Supabase
- AI: Google Gemini

## Repository Structure

```text
sentinel-core/
├── apps/
│   └── api/                        # Next.js API-only backend
│       ├── app/api/                # API routes
│       ├── lib/                    # auth/env/supabase/gemini helpers
│       └── types/                  # API and database typings
├── src/                            # Vite React frontend
│   ├── api/                        # typed API client modules
│   ├── components/                 # app and ui components
│   ├── contexts/                   # auth/theme/workspace contexts
│   ├── hooks/                      # React Query hooks
│   ├── layouts/                    # app/auth/marketing layouts
│   └── pages/                      # route pages
├── supabase/
│   ├── functions/                  # edge functions
│   ├── migrations/                 # SQL migrations
│   └── final_schema.sql            # idempotent schema delta script
└── README.md
```

## Architecture

```text
Frontend (Vite on 5173)
  -> Bearer JWT
Backend API (Next.js on 3001)
  -> Supabase (Postgres/Auth/Storage)
  -> Gemini
```

Security model highlights:
- Backend routes require auth and validate workspace access
- Data access is workspace-scoped
- RLS is enabled in Supabase
- Service role key is backend-only

## Prerequisites

- Node.js 18+
- npm
- Supabase project
- Gemini API key

## Environment Variables

### Frontend (.env.local at repo root)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
```

### Backend (apps/api/.env.local)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:5173
```

## Install

```bash
npm install
cd apps/api && npm install
```

## Run Locally

Terminal 1:
```bash
cd apps/api
npm run dev
```

Terminal 2:
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Build

Frontend:
```bash
npm run build
```

Backend:
```bash
cd apps/api
npm run build
```

## Database and Supabase

Migrations are under supabase/migrations.

For a consolidated idempotent schema update, use:
- supabase/final_schema.sql

If you use Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Then regenerate backend database types:

```bash
cd apps/api
npx supabase gen types typescript --project-id <project-id> > types/database.ts
```

## API Smoke Behavior

Expected unauthenticated behavior:
- GET /api/workspaces -> 401 Unauthorized
- OPTIONS /api/workspaces -> 204 with CORS headers

## Notes

- Keep secrets out of source control
- Do not commit local env files with real credentials
- Keep frontend and backend env files separate

## License

MIT
