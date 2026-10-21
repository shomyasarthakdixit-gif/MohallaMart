# MohallaMart 2.0 — Phase 9B Deployment Infrastructure Readiness Audit

## 1. Executive Summary
This report constitutes the Phase 9B Deployment Infrastructure Readiness Audit for MohallaMart 2.0. The audit was conducted in a strict read-only planning mode. The repository is structurally sound for PaaS deployment (Vercel + Render). However, as a monorepo, the deployment scripts require careful configuration to ensure the `database` workspace is built and the Prisma Client is generated correctly in the cloud before the `client` and `server` build. The application is **READY FOR IMPLEMENTATION** of the deployment phase.

## 2. Current Architecture
- **Frontend:** Next.js (Workspace: `client`)
- **Backend:** Express (Workspace: `server`)
- **Database:** Prisma & Neon PostgreSQL (Workspace: `database`)
- **Repository Structure:** NPM Workspace Monorepo

## 3. Repository Structure Findings
- The project is an NPM monorepo defined in the root `package.json`.
- `client/` and `server/` both depend on the local `database/` package.
- **Finding:** The root `package.json` contains `build:client` and `build:server` scripts, but lacks a `build:database` script. The `database/` workspace must be explicitly built (`tsc`) and the Prisma client generated (`prisma generate`) before the backend or frontend builds in the CI/CD pipeline.

## 4. Vercel Readiness (Frontend)
- **Framework:** Next.js 16.2.10
- **Project Root:** Vercel automatically detects NPM workspaces. The project root can be set to `client`.
- **Build Command:** Vercel defaults (`npm run build`) will work seamlessly if the root `package.json` install resolves the workspaces.
- **Environment Variables Required:**
  - `NEXT_PUBLIC_API_URL` (Public)
  - `NEXT_PUBLIC_FIREBASE_API_KEY` (Public)
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` (Public)
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (Public)
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (Public)
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (Public)
  - `NEXT_PUBLIC_FIREBASE_APP_ID` (Public)

## 5. Render Readiness (Backend)
- **Framework:** Express / Node.js
- **Project Root:** `server/` (or repository root with a custom build command).
- **Build Command Needed:** Since `server` depends on the compiled `database` workspace, the Render Build Command must compile both.
  *(Future command to be used: `npm install && cd database && npx prisma generate && npx prisma migrate deploy && npm run build && cd ../server && npm run build`)*
- **Start Command:** `cd server && npm run start` (which executes `node dist/server.js`).
- **Health Check:** A `/health` or similar unauthenticated endpoint does NOT currently exist in `server/src/routes/v1/index.ts`. This should be added in Phase 9C for Render to accurately monitor uptime.

## 6. Neon/Database Deployment Readiness
- Phase 9A successfully switched the provider to `postgresql` and initialized the migration history.
- The Render deployment MUST execute `npx prisma migrate deploy` during the build phase.
- **CRITICAL:** `prisma db push` must NEVER be executed against production. `prisma migrate deploy` is the only safe command.

## 7. Environment Variable Matrix
| Variable | Scope | Required | Public/Secret | Target |
|----------|-------|----------|---------------|--------|
| `NEXT_PUBLIC_API_URL` | Frontend | Yes | Public | Vercel |
| `NEXT_PUBLIC_FIREBASE_*` | Frontend | Yes | Public | Vercel |
| `DATABASE_URL` | Backend | Yes | Secret | Render |
| `JWT_SECRET` | Backend | Yes | Secret | Render |
| `NODE_ENV` | Global | Yes | Public | Render (`production`) |
| `PORT` | Backend | Optional | Public | Render (Auto-injected) |
| `PAYMENT_PROVIDER` | Backend | Yes | Public | Render (`razorpay`) |
| `RAZORPAY_KEY_ID` | Backend | Yes | Secret | Render |
| `RAZORPAY_KEY_SECRET` | Backend | Yes | Secret | Render |
| `RAZORPAY_WEBHOOK_SECRET` | Backend | Yes | Secret | Render |
| `CORS_ORIGIN` | Backend | Yes | Public | Render (`https://www.mohallamart.com`) |
| `GEMINI_API_KEY` | Backend | Yes | Secret | Render |

## 8. Localhost Dependency Audit
- **Frontend `lib/api.ts`:** Falls back to `"http://localhost:5000/api/v1"` if `NEXT_PUBLIC_API_URL` is missing. (Harmless, mitigated by Vercel env var).
- **Backend `server.ts`:** Logs `Server running on http://localhost:${PORT}`. (Harmless logging).
- **Backend Swagger:** `http://localhost:${PORT}/api/v1`. (Harmless logging/dev tools).
- **Verdict:** No hard-coded production-blocking localhost dependencies were found.

## 9. CORS Audit
- `app.ts` relies on `CORS_ORIGIN` when `NODE_ENV === "production"`.
- If `CORS_ORIGIN` is missing in production, it falls back to `"*"`, exposing the API globally.
- **Requirement:** `CORS_ORIGIN=https://www.mohallamart.com` MUST be explicitly set in Render.

## 10. Git/Secret Safety Audit
- `.gitignore` (Root, Server, Client, Database) correctly ignores all `.env` files.
- The `dev.db` database is properly ignored.
- No secrets were found committed in the repository structure.

## 11. Production Scripts Audit
- **Missing Scripts:** The root `package.json` currently lacks unified build scripts that handle the `database` workspace alongside `server` and `client`.
- **Action Needed (Phase 9C):** Add a `build:database` script to the root `package.json` to streamline the Vercel and Render build pipelines.

## 12. Proposed Render Configuration
- **Type:** Web Service
- **Root Directory:** *(Empty / Repository Root)*
- **Build Command:** `npm install && npm run build:database && npx prisma migrate deploy --schema=database/prisma/schema.prisma && npm run build:server` *(Requires script additions in Phase 9C)*
- **Start Command:** `cd server && npm run start`
- **Node Version:** Default / Latest LTS (18+).

## 13. Proposed Vercel Configuration
- **Framework:** Next.js
- **Root Directory:** `client`
- **Build Command:** Default (`npm run build`) will succeed if the monorepo root correctly handles dependencies.

## 14. Future Deployment Sequence
1. **Phase 9C (Pre-deploy prep):** Update root `package.json` scripts, add backend `/health` endpoint.
2. **Phase 9D (Backend Deploy):** Provision Render Web Service, inject secrets, execute DB migrations.
3. **Phase 9E (Frontend Deploy):** Provision Vercel Project, inject public env vars.
4. **Phase 9F (DNS & Payments):** Configure custom domains, hook Razorpay Live webhooks to API domain.

## 15. Risks and Blockers
- **P0:** Missing root package scripts for compiling the `database` workspace will cause Render builds to fail because `server` cannot resolve `database` if it is not built.
- **P1:** Missing `/health` endpoint means Render cannot perform zero-downtime health checks during deployment.

## 16. Owner Actions
- Create Vercel project.
- Create Render web service.
- Generate live Razorpay API keys.
- Prepare production Firebase config.
- Prepare DNS records for custom domains.

## 17. Phase 9C Prerequisites
In the next phase, the repository must be updated with:
- Root `package.json` build scripts.
- A basic `/health` route in the Express backend.

## 18. Final GO / NO-GO Verdict
🟢 **READY FOR IMPLEMENTATION** (Phase 9C Pre-Deployment Updates).

---
FILES MODIFIED:
NONE

FILES CREATED:
phase_9b_deployment_infrastructure_readiness_audit.md

IMPLEMENTATION PERFORMED:
NONE

DEPLOYMENT PERFORMED:
NONE

DATABASE MODIFIED:
NO

NEON MODIFIED:
NO

VERCEL DEPLOYED:
NO

RENDER DEPLOYED:
NO

RAZORPAY MODIFIED:
NO

NEXT PHASE:
Awaiting explicit approval.
