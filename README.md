<div align="center">

```
███████╗███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗
██╔════╝██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║
███████╗█████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║
╚════██║██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║
 ███████║███████╗██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗
╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
```

**AUTONOMOUS LEGAL DEFENSE GRID**

An AI-powered Contract Risk Analysis Platform — upload a contract, get a 0–100 risk score, understand every clause in plain English, and fire back a counter-proposal before you ever sign.

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Tests](https://img.shields.io/badge/tests-38%20passing-blue)](#testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-gray)](#license)

</div>

---

## The Problem

Contracts are written to protect the drafter. Hiring a lawyer for every NDA or service agreement is expensive. Most individuals and small businesses sign blindly and inherit hidden liabilities they never saw coming.

## The Solution

SENTINEL is not a document reader — it is an **Autonomous Legal Defense Grid**. It ingests entire legal files, scores every clause on a 0–100 risk scale, translates legalese into plain English, and auto-drafts counter-proposals so you negotiate from a position of strength.

---

## Architecture

SENTINEL is a decoupled, three-tier system. The tiers are independently deployed and communicate only through authenticated API calls.

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT TIER                                                    │
│  Vite SPA (React + TypeScript)       → Vercel / Netlify Static  │
└───────────────────────┬─────────────────────────────────────────┘
                        │  HTTPS  +  Supabase JWT
┌───────────────────────▼─────────────────────────────────────────┐
│  API TIER                                                       │
│  Next.js Serverless (API routes only) → Vercel Functions        │
│  • Validates JWT on every request                               │
│  • Calls Gemini API                                             │
│  • Queries Supabase with Service Role                           │
└──────────┬────────────────────────────┬────────────────────────┘
           │                            │
┌──────────▼──────────┐    ┌────────────▼──────────────────────────┐
│  DATA TIER          │    │  AI TIER                              │
│  Supabase           │    │  Google Gemini 1.5 Pro                │
│  • PostgreSQL + RLS │    │  • OCR extraction                     │
│  • Auth (PKCE)      │    │  • Risk analysis → structured JSON    │
│  • Storage (S3)     │    │  • Contract chat + Red Team mode      │
└─────────────────────┘    └───────────────────────────────────────┘
```

> **Important:** Next.js serves no pages — it is a pure serverless API backend. The Vite SPA and the Next.js API are separate repositories deployed independently.

---

## Features

### Sentinel Vision — Document Ingestion
Upload a PDF, PNG, or JPG (up to 10 MB). Gemini 1.5 Flash extracts text via multimodal OCR in seconds, handling scanned documents and low-quality images without preprocessing.

### Risk Analysis — The Brain
Gemini 1.5 Pro ingests the full contract in a single context window — no chunking, no context loss. Every clause is scored and tagged:

| Risk Level | Score | Meaning |
|---|---|---|
| Low | 0–25 | Standard commercial terms |
| Medium | 26–50 | Unfavorable but negotiable |
| High | 51–75 | Materially favors the other party |
| Critical | 76–100 | Severe liability exposure |

Each clause comes with a plain-English rationale — not just what the risk is, but specifically why it hurts you.

### Active Defense — The Shield
**Auto-Negotiator:** Generates a professional counter-proposal letter targeting every high and critical clause.

**War Room (Contract Chat):** Ask any question about your contract in natural language. Toggle **Red Team Mode** to have the AI simulate opposing counsel and stress-test your position for loopholes.

**Obligation Tracker:** Automatically extracts deadlines, deliverables, and recurring obligations so nothing slips through.

### Multi-Tenant Security
Every user belongs to a workspace. All contracts, clauses, analysis runs, and chat sessions are scoped to a `workspace_id` enforced at the database level via Postgres Row-Level Security — users cannot read or write data outside their own tenant regardless of API behavior.

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| Frontend | React 18, TypeScript, Vite | SPA, routing, state |
| UI | ShadCN UI, Radix UI, Recharts, Lucide | Components, charts, icons |
| State | React Query, Zod | Server state, validation |
| API | Next.js (App Router, routes only) | Serverless middleware |
| Database | Supabase PostgreSQL | Persistent storage with RLS |
| Auth | Supabase Auth (PKCE + OAuth) | JWT-based, Google SSO |
| Storage | Supabase Storage (S3-backed) | Contract file storage |
| AI | Google Gemini 1.5 Pro / Flash | Analysis, OCR, chat |
| Payments | Stripe *(planned)* | Usage-based billing |

---

## Repository Structure

```
sentinel-core/
├── apps/
│   ├── web/                          # Vite SPA (frontend)
│   │   └── src/
│   │       ├── api/                  # Typed API client — never raw fetch
│   │       ├── components/
│   │       │   ├── ui/               # ShadCN primitives — do not hand-edit
│   │       │   └── app/              # Business components
│   │       ├── contexts/             # AuthContext, WorkspaceContext
│   │       ├── hooks/                # React Query hooks per resource
│   │       ├── layouts/              # AppLayout, AuthLayout
│   │       ├── lib/                  # supabase.ts, utils.ts
│   │       ├── pages/                # Route-level components
│   │       └── types/                # Shared TypeScript interfaces
│   │
│   └── api/                          # Next.js API (backend only)
│       ├── app/api/
│       │   ├── workspaces/           # GET, POST /api/workspaces
│       │   ├── contracts/
│       │   │   ├── upload/           # POST — returns signed upload URL
│       │   │   └── [id]/
│       │   │       ├── analyze/      # POST — triggers Gemini pipeline
│       │   │       └── clauses/      # GET — clause list
│       │   ├── chat/
│       │   │   ├── sessions/         # GET, POST
│       │   │   └── message/          # POST — streaming response
│       │   └── dashboard/stats/      # GET — aggregate risk stats
│       ├── lib/
│       │   ├── auth.ts               # withAuth middleware wrapper
│       │   ├── gemini.ts             # AI service (analysis + chat)
│       │   ├── supabase.ts           # Server-side Supabase client
│       │   └── env.ts                # Zod-validated env config
│       └── types/
│           ├── database.ts           # Generated by Supabase CLI
│           └── api.ts                # Request/response shapes
│
├── supabase/
│   └── migrations/                   # Versioned SQL — never ALTER manually
│
└── tests/
    ├── web/                          # Vitest + Testing Library (14 tests)
    └── api/                          # Vitest API route tests (24 tests)
```

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini 1.5)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/sentinel-core.git
cd sentinel-core

# Install both workspaces
npm install --workspaces
```

### 2. Configure environment variables

**Frontend** (`apps/web/.env.local`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
```

**Backend** (`apps/api/.env.local`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

> The service role key lives in the backend only and is never exposed to the client. See `CLAUDE.md` for the full security model.

### 3. Provision the database

Link your Supabase project and push all migrations:

```bash
cd apps/api
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

This creates all tables (`profiles`, `workspaces`, `workspace_members`, `contracts`, `contract_clauses`, `analysis_runs`, `chat_sessions`, `chat_messages`), enables RLS on every table, registers the `is_workspace_member()` helper function, creates the `handle_new_user` trigger, and configures the `contracts` storage bucket.

### 4. Generate TypeScript types

```bash
npx supabase gen types typescript --project-id your-project-id \
  > apps/api/types/database.ts
```

### 5. Start development servers

```bash
# Terminal 1 — API server on :3001
cd apps/api && npm run dev

# Terminal 2 — Frontend on :5173
cd apps/web && npm run dev
```

Open `http://localhost:5173`.

---

## Document Upload Flow

Files never transit through the serverless API to avoid memory limits. The upload is two-phase:

```
1. Frontend  →  POST /api/contracts/upload  (metadata only)
              ←  { contract_id, signed_upload_url }

2. Frontend  →  PUT signed_upload_url  (file bytes directly to Supabase Storage)

3. Frontend  →  PATCH /api/contracts/:id  (confirm upload complete)
              ←  { status: "uploaded" }

4. User clicks Analyze

5. Frontend  →  POST /api/contracts/:id/analyze
   API       →  Pulls file from Storage → Sends to Gemini → Saves clauses → Updates risk_score
              ←  { status: "complete", risk_score: 74 }
```

---

## Testing

```bash
# Frontend unit tests (Vitest + Testing Library)
cd apps/web && npm test

# API route tests (Vitest)
cd apps/api && npm test

# Type checking across both workspaces
npm run typecheck --workspaces

# All tests
npm test --workspaces
```

Current status: **38 tests passing. Zero type errors.**

---

## Deployment

Both apps deploy to Vercel from the same monorepo. Set the root directory per project in your Vercel dashboard:

| Project | Root Directory | Build Command | Output |
|---|---|---|---|
| sentinel-web | `apps/web` | `npm run build` | `dist/` |
| sentinel-api | `apps/api` | `npm run build` | Next.js serverless |

Add the environment variables from Step 2 to each Vercel project under **Settings → Environment Variables**.

---

## Security Model

- Every API route is wrapped in `withAuth` — no unguarded endpoints exist.
- RLS is enabled on all tables. The `is_workspace_member(workspace_id)` Postgres function gates every read and write.
- The Supabase service role key is only used after the API route has manually verified workspace membership.
- Files in Storage are scoped to `{workspace_id}/{contract_id}/filename` — Storage RLS policies enforce workspace membership on every object read.
- Schema changes go through versioned migration files. No direct `ALTER TABLE` on production.

---

## Team

Built by **J Joshua Haniel**, **S Yashwant**, and **Surya Sivakumar**

Guided by **Ms. S. Niranjana**, Assistant Professor (Jr.G.)

---

## License

MIT License — © 2026 SENTINEL Legal Operating System
