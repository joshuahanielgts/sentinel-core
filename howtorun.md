# How to Run Sentinel AI

## Prerequisites

- Node.js 18+
- A Supabase project (yours: `sbfiqzvppqqqpqlqodlk`)
- Supabase CLI (`npm install -g supabase`)
- A Google Gemini API key

---

## Step 1: Install Dependencies

Open two terminals.

**Terminal 1 — API:**

```bash
cd apps/api
npm install
```

**Terminal 2 — Frontend:**

```bash
cd apps/web
npm install
```

---

## Step 2: Set Up Environment Variables

Both `.env.local` files are already created with your Supabase URL, publishable key, and Gemini API key.

**One thing you still need:** your **Supabase Service Role Key**.

1. Go to https://supabase.com/dashboard/project/sbfiqzvppqqqpqlqodlk/settings/api
2. Under **Project API keys**, copy the `service_role` key (the secret one)
3. Open `apps/api/.env.local` and replace `PASTE_YOUR_SERVICE_ROLE_KEY_HERE` with it

The file should look like:

```
SUPABASE_URL=https://sbfiqzvppqqqpqlqodlk.supabase.co
SUPABASE_ANON_KEY=sb_publishable_oR3GuhaeYfDY-kPK7mGjmw_yAs1RiWp
SUPABASE_SERVICE_ROLE_KEY=<paste your service_role key here>
GEMINI_API_KEY=AIzaSyAgX1BU7rAkDL_Bm5Q48n_IylmYkm0uN78
FRONTEND_URL=http://localhost:5173
```

---

## Step 3: Run Database Migrations

Link the Supabase CLI to your project and push the schema:

```bash
npx supabase login
npx supabase link --project-ref sbfiqzvppqqqpqlqodlk
npx supabase db push
```

This applies all 6 migration files:
1. `00001_profiles.sql` — profiles table + auto-create trigger on signup
2. `00002_workspaces.sql` — workspaces, workspace_members, `is_workspace_member()` function
3. `00003_contracts.sql` — contracts, contract_clauses, analysis_runs
4. `00004_chat.sql` — chat_sessions, chat_messages
5. `00005_rls_policies.sql` — Row Level Security policies for all tables
6. `00006_storage.sql` — `contracts` storage bucket + storage RLS policies

---

## Step 4: Enable Auth Providers in Supabase Dashboard

### Email/Password (should be enabled by default)

1. Go to https://supabase.com/dashboard/project/sbfiqzvppqqqpqlqodlk/auth/providers
2. Confirm **Email** provider is enabled
3. For local dev, you may want to disable "Confirm email" under **Auth > Settings** so you can sign up without email verification

### Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Create an **OAuth 2.0 Client ID** (Web application type)
3. Set **Authorized redirect URI** to:
   ```
   https://sbfiqzvppqqqpqlqodlk.supabase.co/auth/v1/callback
   ```
4. Copy the **Client ID** and **Client Secret**
5. Go to https://supabase.com/dashboard/project/sbfiqzvppqqqpqlqodlk/auth/providers
6. Enable **Google** provider
7. Paste your Client ID and Client Secret
8. Save

---

## Step 5: Start the Dev Servers

### Terminal 1 — API Server (port 3001)

```bash
cd apps/api
npm run dev
```

Expected output:

```
  ▲ Next.js 15.x
  - Local: http://localhost:3001
```

### Terminal 2 — Frontend (port 5173)

```bash
cd apps/web
npm run dev
```

Expected output:

```
  VITE v6.x  ready in Xms
  ➜  Local:   http://localhost:5173/
```

---

## Step 6: Use the App

Open **http://localhost:5173** in your browser.

1. **Sign up** with email/password or click "Continue with Google"
2. **Create a workspace** (e.g. "My Company" with slug "my-company")
3. Navigate to **Contracts** and click **Upload**
4. Upload a PDF or DOCX contract (max 25 MB)
5. Click **Analyze** — Gemini 2.5 Pro will extract clauses and score risk
6. Open the **Chat** panel to ask the AI questions about the contract
7. Check the **Dashboard** for risk distribution charts and alerts

---

## Build for Production

```bash
# API
cd apps/api
npm run build
npm run start

# Frontend
cd apps/web
npm run build
```

The frontend build output is in `apps/web/dist/` — deploy to Vercel, Netlify, or any static host.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Vite + React 19 + TypeScript + Tailwind CSS 4 |
| UI | ShadCN components + Radix UI + Lucide Icons |
| Charts | Recharts |
| API | Next.js 15 (API routes only, port 3001) |
| Database | Supabase Postgres with RLS |
| Auth | Supabase Auth (email + Google OAuth) |
| Storage | Supabase Storage (signed URL uploads) |
| AI | Google Gemini 2.5 Pro |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Missing environment variables` on API start | Open `apps/api/.env.local` and paste your service role key |
| `Unauthorized` errors in the browser | Verify `VITE_SUPABASE_ANON_KEY` in `apps/web/.env.local` matches your Supabase publishable key |
| CORS errors | Verify `FRONTEND_URL` in `apps/api/.env.local` is `http://localhost:5173` |
| `supabase db push` fails | Run `npx supabase link --project-ref sbfiqzvppqqqpqlqodlk` first |
| Upload fails | Check Supabase Dashboard > Storage — the `contracts` bucket should exist after running migrations |
| Google OAuth "redirect_uri_mismatch" | Ensure the redirect URI in Google Console matches `https://sbfiqzvppqqqpqlqodlk.supabase.co/auth/v1/callback` |
