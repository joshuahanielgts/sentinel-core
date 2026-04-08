# SENTINEL AI
Project: Autonomous Legal Grid (Contract Risk Analysis Micro-SaaS)
Objective: Build a complete, multi-tenant web application from scratch. You will act as the Senior Full-Stack Architect and Lead Developer. Do not write the entire codebase at once. Read this entire document, acknowledge it, and then output a Phased Execution Plan.

## 1. TECH STACK
Frontend: React (built with Vite), TypeScript, Tailwind CSS

UI Components: ShadCN UI, Radix UI, Recharts (for dashboard), Lucide Icons

State/Data Fetching: React Query, React Router, Zod (validation)

Backend Runtime: Next.js Serverless API Routes (deployed on Vercel)

Database & Auth: Supabase (PostgreSQL), Supabase Auth, Supabase Storage

AI Provider: Google Gemini API (Handles OCR extraction, risk analysis, and chat)

Payments (Optional/Later): Stripe

## 2. SYSTEM ARCHITECTURE & DATA FLOW
We are using a decoupled tier architecture:

Client Tier (Vite SPA): Handles UI, local state, and routes.

Vercel Serverless Tier (Next.js API): Acts as the secure middleware. It validates Supabase JWTs, triggers external AI API calls, formats data, and securely queries the database using a Service Role or User Context.

Supabase Data Tier: The single source of truth. Handles User Auth, Postgres Database (with strict Row Level Security), and AWS S3-backed Storage buckets for PDF/Docx files.

Standard Request Flow:
UI (User Action) -> Sends Request + Supabase JWT -> Next.js API Route -> Validates Session -> Executes Logic (Calls Gemini/Supabase) -> Returns Data to UI

## 3. CORE MODULES
Authentication: Email/Password & Google OAuth via Supabase. Protected routes on frontend.

Workspaces (Multi-tenant): Users belong to Workspaces. All contracts and chats are scoped to a Workspace ID using Postgres RLS.

Document Upload: Drag-and-drop file upload pushing directly to Supabase Storage.

AI Contract Analysis Pipeline: * Next.js API pulls document text/images.

Sends via system prompt to Gemini API.

Gemini returns structured JSON (extracted clauses, risk level, summary).

API saves results to Postgres.

Contract Chat: Interactive AI assistant scoped to a specific contract for Q&A, translating legalese, and highlighting obligations.

Dashboard: Visualizes risk gauges, total documents, and recent alerts.

## 4. DATABASE SCHEMA (POSTGRESQL)
The schema uses gen_random_uuid() for IDs and relies heavily on foreign keys.

profiles (1:1 with auth.users via Postgres trigger)

workspaces (Tenant container)

workspace_members (Maps users to workspaces with roles: owner, admin, member)

contracts (Belongs to workspace, tracks upload status and overall risk score)

contract_clauses (Belongs to contract. Stores raw text, risk level, and rationale)

analysis_runs (Tracks AI execution, tokens, and status)

chat_sessions & chat_messages (For the document Q&A feature)

Security: Row Level Security (RLS) is ENABLED on all tables. A helper function is_workspace_member(workspace_id) validates all reads/writes.

## 5. API ENDPOINTS (NEXT.JS v1)
Auth/Context: /api/workspaces, /api/workspaces/:id/members

Contracts: /api/contracts/upload, /api/contracts/:id

Analysis: /api/contracts/:id/analyze (Triggers Gemini pipeline), /api/contracts/:id/clauses

Chat: /api/chat/sessions, /api/chat/message

## 6. EXECUTION RULES (STRICT COMMANDS FOR CLAUDE)
Do not write code yet. Your first output must be a detailed, step-by-step Phase Plan (Phase 1: DB/Auth setup, Phase 2: API scaffolding, etc.).

Iterative Build: We will build exactly ONE feature or module at a time. I will tell you when to proceed to the next step.

No Placeholders: When generating code for a step, provide complete, production-ready files. Do not leave // TODO: implement logic comments. Write the logic.

Security First: Never bypass Supabase RLS policies. Ensure Next.js API routes validate the user's session token before executing logic.

Types: Define strict TypeScript interfaces for all database queries and Gemini API responses.