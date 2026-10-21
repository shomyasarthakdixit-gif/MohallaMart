# MOHALLAMART 2.0 — PHASE 9 DEPLOYMENT IMPLEMENTATION PLAN

## 1. Executive Summary
This document constitutes the Phase 9 Planning Audit for MohallaMart 2.0. The audit confirms that the codebase functionally and structurally is poised for deployment. However, the repository lacks the necessary infrastructure definitions and a production-grade database to support a public launch. This plan outlines the exact sequence and strategy to safely transition MohallaMart 2.0 into a robust production environment.

## 2. Current Deployment Architecture
- **Frontend:** Next.js 16.2.10 running locally (`npm run dev`). No explicit Vercel config, but is fully compatible.
- **Backend:** Express/Node.js compiling via `tsc` to `/dist`. Single-process execution via `node dist/server.js`. No PM2/Docker config.
- **Database:** Prisma ORM connecting to a local `dev.db` SQLite file. No active migration history.
- **Third-Party Services:** Razorpay (mocked locally), Firebase (auth/client).

## 3. Verified Repository Structure
- Client: `d:\MohallaMart\client`
- Server: `d:\MohallaMart\server`
- Database: `d:\MohallaMart\database\prisma`

## 4. Database Audit
- **Current Provider:** `sqlite`
- **Schema Validation:** The schema relies strictly on provider-agnostic scalar types (`String`, `Float`, `Int`, `Boolean`, `DateTime`). It uses UUIDs universally for IDs (`@default(uuid())`). No Enums (Strings used for statuses), no JSON types.
- **Raw Queries:** `grep_search` confirmed NO `$queryRaw` or `$executeRaw` operations exist.
- **Migrations:** None. Relying on `npx prisma db push`.

## 5. SQLite → PostgreSQL Migration Analysis
The schema is 100% portable to PostgreSQL. Changing `provider = "postgresql"` will not break any Prisma queries because the types are agnostic and no raw SQL exists.
- **Data Migration:** Since there is no formal migration history, the safest approach is a **Fresh PostgreSQL Migration**. We will discard the local `dev.db` data for production, initialize a fresh migration history against a clean PostgreSQL instance, and re-seed any required structural data (e.g., admin accounts).

## 6. Recommended PostgreSQL Provider
- **Primary Recommendation:** **Neon** (or Supabase). 
  - *Why:* Serverless PostgreSQL architecture, generous free tier suitable for early startup launch, branching capabilities, instant PITR (Point In Time Recovery), and seamless pooling.
- **Fallback:** **Render PostgreSQL** (Easy unified deployment with backend, though less scalable than Neon).

## 7. Prisma Migration Strategy
1. Backup/ignore `dev.db`.
2. Change `provider = "postgresql"`.
3. Point `DATABASE_URL` to a clean PostgreSQL instance.
4. Run `npx prisma migrate dev --name init`. This generates the `000000000000_init/migration.sql` file containing all schemas, indexes, and constraints.
5. In the CI/CD pipeline, execute `npx prisma migrate deploy` prior to the backend startup to safely apply subsequent schema updates.

## 8. Environment Variable Matrix
| Variable | Scope | Required | Secret | Purpose |
|----------|-------|----------|--------|---------|
| `NEXT_PUBLIC_API_URL` | Frontend | Yes | No | Backend API domain |
| `NEXT_PUBLIC_FIREBASE_*` | Frontend | Yes | No | Client-side Firebase init |
| `DATABASE_URL` | Backend | Yes | Yes | Prisma PostgreSQL URI |
| `JWT_SECRET` | Backend | Yes | Yes | Secure backend auth tokens |
| `PORT` | Backend | Yes | No | Express binding port (usually auto-injected by PaaS) |
| `NODE_ENV` | Global | Yes | No | Set to `production` |
| `PAYMENT_PROVIDER` | Backend | Yes | No | Must be exactly `razorpay` |
| `RAZORPAY_KEY_ID` | Backend | Yes | Yes | Razorpay Prod Key |
| `RAZORPAY_KEY_SECRET`| Backend | Yes | Yes | Razorpay Prod Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Backend | Yes | Yes | Webhook verification signature |
| `CORS_ORIGIN` | Backend | Yes | No | `https://www.mohallamart.com` |
| `GEMINI_API_KEY` | Backend | Yes | Yes | AI integration (if active) |

## 9. Secret Safety Audit
- **Findings:** A local `.env` exists in `server/` with a plaintext `GEMINI_API_KEY`. While properly `.gitignore`d, all secrets must be transitioned to the cloud provider's Secret Manager.
- **Rule:** No `.env` files will be deployed. PaaS UI (Vercel/Render) will handle all injection.

## 10. Backend Deployment Recommendation
- **Primary:** **Render** (Web Service).
  - *Why:* Zero-downtime deploys out-of-the-box, connects seamlessly to GitHub, auto-injects `PORT`, native Node.js support, free/cheap tier. We will configure the build command to `npm install && npm run build` and start command to `node dist/server.js`.

## 11. Frontend Deployment Recommendation
- **Primary:** **Vercel**.
  - *Why:* Creators of Next.js. Instant global CDN edge caching, native Next.js image optimization, automatic SSL. Zero configuration required beyond connecting the GitHub repo and adding the `NEXT_PUBLIC_*` variables.

## 12. Domain / DNS / HTTPS Plan
- **Frontend:** `https://www.mohallamart.com` (Managed by Vercel; Vercel handles Let's Encrypt SSL/HTTPS automatically via CNAME).
- **Backend:** `https://api.mohallamart.com` (Managed by Render; Render handles SSL/HTTPS automatically via CNAME).

## 13. CORS Plan
- Explicitly configure `CORS_ORIGIN=https://www.mohallamart.com` in the Render environment variables. This prevents the Express fallback from enabling wildcard `*` access in production.

## 14. Razorpay Production Plan
1. Toggle Razorpay Dashboard to "Live Mode".
2. Generate new Live Key ID / Secret.
3. Configure Razorpay Webhook URL to `https://api.mohallamart.com/api/v1/payments/webhook`.
4. Subscribe webhook to `payment.captured` and `payment.failed`.
5. Set `PAYMENT_PROVIDER=razorpay` on the Render backend.

## 15. Backup & Disaster Recovery Plan
- Delegate to DB provider (e.g., Neon).
- Enable Automated Daily Backups.
- Retain Point-in-Time Recovery (PITR) for a minimum of 7 days.
- In the event of catastrophic data corruption, the DB will be restored to an hour prior via the provider's dashboard.

## 16. Observability Plan
- **Monitoring:** Sentry (Free Tier) integrated into Express (`@sentry/node`) to trap unhandled promise rejections and 500 errors.
- **Uptime:** BetterUptime (or UptimeRobot) pinging `https://api.mohallamart.com/api/v1/health` (requires creating a simple `/health` endpoint).

## 17. CI/CD Plan
- **CI (Testing):** GitHub Action executing `npm run lint` and `npx tsc --noEmit` on every PR to `main`.
- **CD (Deploy):** Vercel auto-deploys frontend on `main` push. Render auto-deploys backend on `main` push. Render build command will incorporate `npx prisma migrate deploy` prior to spinning up `node dist/server.js`.

## 18. Security Checklist
- [ ] Database credentials not leaked.
- [ ] `PAYMENT_PROVIDER=razorpay` strictly enforced.
- [ ] `CORS_ORIGIN` strictly bounded.
- [ ] `NODE_ENV=production` hides Express stack traces.
- [ ] JWT secret uniquely generated with high entropy.
- [ ] Rate limits actively preventing DoS (`max: 500` per 15m is configured).

## 19. Production Testing Plan
- Execute E2E checkout in production using a small INR real transaction (then refund).
- Verify Shopkeeper receives the notification and order state transitions via webhook.
- Verify Admin dashboard pagination bounds.

## 20. Migration Rollback Strategy
- A failed Prisma migration deployment will abort the Render build, leaving the previous backend container active. Zero downtime.
- Severe application bugs post-deployment can be instantly reverted on Vercel/Render by clicking "Rollback to previous deployment".

## 21. Cost Estimate (Startup Phase)
- **Frontend (Vercel):** $0/mo (Hobby tier)
- **Backend (Render):** $0 - $7/mo
- **Database (Neon):** $0 - $19/mo
- **Domain:** ~$15/yr
- **Total Initial Run Rate:** ~$0-$30/mo

## 22. Exact Implementation Sequence
- **Phase 9A** — Provision Neon PostgreSQL Database.
- **Phase 9B** — Execute `prisma migrate dev --name init` and push schema.
- **Phase 9C** — Provision Vercel & Render instances.
- **Phase 9D** — Inject Secret Environment Variables (Auth, DB, Firebase).
- **Phase 9E** — Generate & Inject Razorpay Live Keys.
- **Phase 9F** — Map Custom Domains & Enforce CORS.
- **Phase 9G** — Implement Sentry & `/health` endpoint.
- **Phase 9H** — Final Live Smoke Testing.

## 23. Risks & Blockers
- **Risk:** Transition from local SQLite to remote PostgreSQL introduces network latency for Prisma queries; however, the `findMany` queries are generally well-indexed.
- **Blockers:** Domain names and Cloud Accounts (Vercel, Render, Neon, Razorpay) must be provisioned by the owner.

## 24. Final Deployment Readiness Verdict
**PLANNING COMPLETE.** The system is architecturally sound for the proposed PaaS infrastructure. Ready to proceed to Phase 9 implementation.
