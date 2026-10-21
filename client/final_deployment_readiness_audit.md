# MOHALLAMART 2.0 — FINAL DEPLOYMENT READINESS AUDIT & LAUNCH PLAN

## 1. Executive Summary
This document constitutes the final Deployment Readiness Audit for MohallaMart 2.0. The audit was conducted in a strict read-only planning mode. 
The codebase logic is successfully fortified and cleared for production. However, from an infrastructure and deployment perspective, the application currently lacks production-grade databases, process management, and explicit deployment pipelines. 
**Final Verdict:** 🟡 **READY FOR DEPLOYMENT (CONDITIONAL)** — Code is ready, but the production environment architecture must be configured manually before launch.

---

## 2. Project Structure Audit
**Frontend:** `client/` (Next.js 16.2.10)
**Backend:** `server/` (Express, Node.js, TypeScript)
**Database:** `database/` (Prisma ORM)
**Package Managers:** `npm` (indicated by `package-lock.json`)
**Scripts:** 
- Client: `npm run dev`, `npm run build`, `npm run start`
- Server: `npm run dev` (tsx), `npm run build` (tsc), `npm run start` (node dist/server.js)
**Missing Infrastructure:** No Dockerfiles, PM2 configurations, or reverse proxy (Nginx) configurations exist in the repository.

---

## 3. Environment Variable Audit
### Frontend
| Variable | Used By | Required? | Dev Value? | Prod Value? | Secret? |
|----------|---------|-----------|------------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Axios (`api.ts`) | Yes | Yes (localhost fallback) | Yes | No |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Client | Yes | Yes (dummy values) | Yes | No |

### Backend
| Variable | Used By | Required? | Dev Value? | Prod Value? | Secret? |
|----------|---------|-----------|------------|-------------|---------|
| `PORT` | Express Server | Yes | Yes (5000) | Yes | No |
| `DATABASE_URL` | Prisma | Yes | Yes | Yes | Yes |
| `JWT_SECRET` | Auth Middleware | Yes | Yes | Yes | Yes |
| `NODE_ENV` | Global/Express | Yes | Yes | Yes (`production`) | No |
| `PAYMENT_PROVIDER` | Payment Service | Yes | Yes (`mock`) | Yes (`razorpay`) | No |
| `RAZORPAY_KEY_ID` | Razorpay SDK | Yes | No | Yes | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay SDK | Yes | No | Yes | Yes |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook Verifier | Yes | No | Yes | Yes |
| `CORS_ORIGIN` | Express CORS | Yes | No | Yes | No |
| `FIREBASE_PROJECT_ID` | Admin SDK | Optional | No | Optional | Yes |
| `GEMINI_API_KEY` | AI Features | Optional | Yes | Yes | Yes |

---

## 4. Secret & Credential Safety Audit
**Status:** 🟡 **ACTION REQUIRED**
- **Findings:** `server/.env` contains a plaintext `GEMINI_API_KEY`. While `server/.gitignore` correctly ignores `.env` (preventing accidental git commits), the key is currently resting on the local development disk. 
- **Action:** Ensure production secrets are securely injected via the hosting provider's environment variable manager (e.g., Vercel / Render / AWS Secrets Manager) and never written to raw files.

---

## 5. Database Production Readiness
**Status:** 🔴 **ACTION REQUIRED**
- **Engine:** The `schema.prisma` strictly defines `provider = "sqlite"`. SQLite is fundamentally unsuited for a high-concurrency production e-commerce platform.
- **Workflow:** The current development workflow relies on `npx prisma db push`.
- **Action:** 
  1. Change `provider` to `"postgresql"` in `schema.prisma`.
  2. Provision a production PostgreSQL instance (e.g., AWS RDS, Supabase, Neon).
  3. Initialize a formal migration history using `npx prisma migrate dev --name init`.
  4. Use `npx prisma migrate deploy` during the production CI/CD pipeline.

---

## 6. Authentication & Authorization
**Status:** 🟢 **SAFE**
- **Token:** Secure JWT-based backend verification.
- **RBAC:** `requireShopkeeper` and `requireAdmin` middlewares correctly secure protected mutation endpoints.
- **Action:** Ensure the production `JWT_SECRET` is generated using a secure entropy source (e.g., `openssl rand -base64 32`).

---

## 7. Payment Production Readiness
**Status:** 🟢 **SAFE**
- **Architecture:** The `PaymentService` abstracts the provider logic.
- **Safety Lock:** The backend actively intercepts `NODE_ENV === "production"` and fatally exits (`process.exit(1)`) if `PAYMENT_PROVIDER !== "razorpay"`. This guarantees mock payments can never be maliciously exploited in a live environment.
- **Action:** Razorpay live keys must be injected into the production environment.

---

## 8. API & CORS Audit
**Status:** 🟡 **ACTION REQUIRED**
- **CORS:** In `app.ts`, `corsOptions.origin` falls back to `"*"` if `CORS_ORIGIN` is missing, even in production. This is a severe risk if misconfigured.
- **Rate Limiting:** Aggressively configured to `500` requests per 15 minutes per IP in production.
- **Payload Limits:** Securely throttled to `10kb` to prevent DoS via large JSON payloads.
- **Action:** Explicitly define `CORS_ORIGIN=https://www.mohallamart.com` in production to prevent CORS hijacking.

---

## 9. Frontend Production Audit
**Status:** 🟢 **READY**
- Next.js 16.2 (`client/`) compiles successfully via `npm run build`. 
- SSG and API routes are successfully optimized.
- **Action:** Deploy using Vercel or standard Node.js hosting with `npm run start`.

---

## 10. Backend Production Audit
**Status:** 🟡 **ACTION REQUIRED**
- The backend successfully compiles (`tsc`).
- **Missing:** The repository lacks process management logic (e.g., PM2 ecosystem file, Dockerfile) to handle crashes, restarts, and clustered instances.
- **Action:** Create a `Dockerfile` for the backend, or run via `pm2 start dist/server.js -i max` to maximize CPU utilization.

---

## 11. Deployment Architecture
**OPTION A — Managed PaaS (RECOMMENDED)**
- **Frontend:** Vercel (Zero-config Next.js optimizations, Edge CDN).
- **Backend:** Render or Railway (Automated deployments from GitHub, easy env management).
- **Database:** Supabase or Neon (Managed Serverless PostgreSQL).
- *Pros:* High development velocity, minimal devops overhead.
- *Cons:* Slightly higher cost at extreme scale.

**OPTION B — AWS Native**
- **Frontend/Backend:** AWS ECS (Fargate) + Application Load Balancer.
- **Database:** AWS RDS (PostgreSQL).
- *Pros:* Complete control, lower cost at massive scale.
- *Cons:* High operational and configuration complexity.

---

## 12. Domain / HTTPS / CORS Plan
- **Frontend Domain:** `https://www.mohallamart.com` (Requires A/CNAME records).
- **API Domain:** `https://api.mohallamart.com` (Requires SSL cert, configured in Render/AWS).
- **CORS:** Must strictly allow `https://www.mohallamart.com`.
- **Razorpay Webhook:** Point Razorpay dashboard to `https://api.mohallamart.com/api/v1/payments/webhook`.

---

## 13. Security Readiness
* **P0 — Must fix before launch:** Change Prisma SQLite to PostgreSQL.
* **P1 — Strongly recommended:** Explicitly configure `CORS_ORIGIN` to prevent `*` fallback.
* **P2 — Post-launch hardening:** Implement payment idempotency tracking. Add APM (Sentry) for blind-spot error monitoring.

---

## 14. Observability & Monitoring
**Existing:** Winston logger outputs to console.
**Action Required:** Integration with Datadog, New Relic, or Sentry for production error aggregation. Log retention policies must be configured on the host.

---

## 15. Backup & Disaster Recovery
**Status:** 🔴 **ACTION REQUIRED**
- No automated backup exists in the codebase.
- **Action:** Database provider (RDS/Neon) MUST have Automated Daily Backups enabled with Point-In-Time-Recovery (PITR) of at least 7 days.

---

## 16. Pre-Launch Production Test Plan
- [ ] **Customer:** End-to-end checkout flow using a live Razorpay test card.
- [ ] **Concurrency:** Execute two simultaneous checkout requests against a single-stock item.
- [ ] **Shopkeeper:** Accept/Reject mock orders on the dashboard.
- [ ] **Webhooks:** Verify Razorpay webhook successfully mutates DB order status to "SUCCESS".
- [ ] **Admin:** Verify pagination boundary caps successfully at 1000 items.

---

## 17. Deployment Sequence
1. **PHASE A (Database):** Provision PostgreSQL and apply schema (`prisma migrate deploy`).
2. **PHASE B (Secrets):** Generate JWT secrets, obtain live Razorpay & Firebase keys.
3. **PHASE C (Backend):** Deploy backend container/service to Render/AWS. Verify `/api/v1` health check.
4. **PHASE D (Frontend):** Deploy Next.js to Vercel, injecting `NEXT_PUBLIC_API_URL`.
5. **PHASE E (DNS & CORS):** Map domains and enforce CORS.
6. **PHASE F (Payment):** Register live backend webhook URL in Razorpay Dashboard.
7. **PHASE G (Smoke Test):** Run Pre-Launch Test Plan on live URL.

---

## 18. GO / NO-GO VERIFICATION
**VERDICT:** 🟡 **CONDITIONAL**
Can this exact repository safely be deployed? **NO.** 
*Condition:* The `schema.prisma` MUST be switched from SQLite to PostgreSQL prior to generating the first production migration.

---
DEPLOYMENT READINESS AUDIT COMPLETE — NO IMPLEMENTATION PERFORMED — AWAITING APPROVAL.
