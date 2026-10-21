# MohallaMart 2.0 — Final Production Readiness Audit

**Status:** Completed
**Verdict:** **NOT READY FOR PRODUCTION** (Blockers Identified)

## Overview
A comprehensive audit of the MohallaMart 2.0 application (Phases 1–8) has been conducted to determine production readiness. While the UI and frontend flow look excellent and the architecture is fundamentally sound, several critical backend, database, and security issues act as hard blockers for deployment. 

The audit findings are classified by severity and domain below. No code modifications were made during this audit phase.

---

## 1. Security & Authentication

### 🔴 CRITICAL (Blocker)
* **RBAC Bypass on Product Creation:** The `/api/v1/products` `POST` endpoint uses the `requireAuth` middleware but misses the `requireShopkeeper` middleware. Any authenticated user can create products if they have a shop. While it implicitly checks `shop.ownerId === userId`, it does not strictly enforce the shopkeeper role, which could lead to permission escalation if the shop creation logic is ever relaxed.
  * **Classification:** NEW, PHASE 6 RELATED.

### 🟡 HIGH (Condition)
* **Mock Payment Fallback:** The `PaymentService` falls back to `MockPaymentProvider` if `PAYMENT_PROVIDER` is missing in the environment. In mock mode, the signature check simply expects `"mock_success"`. If the environment variable is misconfigured in production, users can easily bypass payments.
  * **Classification:** NEW, PHASE 4 RELATED.

### 🟢 INFORMATIONAL
* **User Role Self-Escalation in Service:** The `AuthService` handles requested roles, allowing a user to request "SHOPKEEPER" on login. While this matches the MVP requirement for easy shop onboarding, it circumvents administrative approval for role changes.
  * **Classification:** PRE-EXISTING, PHASE 1 RELATED.

---

## 2. Cart & Order Integrity

### 🔴 CRITICAL (Blocker)
* **Negative Stock / Missing Checkout Validation:** The `addToCart` endpoint validates stock correctly, but the actual **Order Creation** endpoint (`createOrder`) **does not re-validate stock levels** before inserting the order. It blindly decrements stock `data: { stock: { decrement: item.quantity } }`. If two users check out concurrently, or if stock changes after the item is added to the cart, the stock will go negative, breaking inventory integrity.
  * **Classification:** NEW, PHASE 4 RELATED.

---

## 3. Database Schema & Performance

### 🔴 CRITICAL (Blocker)
* **Missing Essential Indexes:** The `schema.prisma` lacks vital indexes for querying rapidly growing tables, which will cause immediate full-table scan bottlenecks in production:
  * `Order` table: Missing indexes on `userId` and `shopId`.
  * `Review` table: Missing indexes on `shopId` and `productId`.
  * `OrderItem` & `CartItem` tables: Missing indexes on `orderId` and `cartId`.
  * **Classification:** NEW, PRE-EXISTING.

### 🟡 HIGH (Condition)
* **Missing API Pagination:** Several critical endpoints lack pagination entirely and fetch the full database table, leading to memory leaks and timeouts:
  * `getAdminOrders` (Hardcoded `take: 100`)
  * `getAdminUsers` (No limits, fetches all users)
  * `getAdminShops` (No limits)
  * `globalSearch` (Fetches all shops to memory before filtering by distance, then filters products in memory)
  * `getReviews` (No limits)
  * **Classification:** NEW, PHASE 7 & 3 RELATED.
* **Haversine Calculation in Memory:** The `globalSearch` and `getNearbyShops` endpoints calculate the Haversine distance in Node.js memory instead of using the database (e.g., PostGIS or standard SQL math). As the `Shop` table grows, reading the entire table into Node.js to filter coordinates will severely degrade performance.
  * **Classification:** PRE-EXISTING, PHASE 3 RELATED.

---

## 4. Error Handling & Edge Cases

### 🟡 HIGH (Condition)
* **Webhook Replay Vulnerability:** The `handleWebhook` logic in `payment.controller.ts` does not check for webhook idempotency or replay attacks. It updates the payment status based on `providerOrderId` without verifying if the event was already processed.
  * **Classification:** NEW, PHASE 4 RELATED.

### 🟢 LOW
* **Unverified Reviews:** The `createReview` endpoint allows any logged-in user to leave a review for any shop or product without verifying if they actually purchased it (acknowledged in the code with a `// For now` comment).
  * **Classification:** PRE-EXISTING, PHASE 3 RELATED.

---

## 5. Configuration & Environment

### 🟡 HIGH (Condition)
* **Potential Secret Exposure:** The `server/.env` file contains sensitive values like `JWT_SECRET` and `GEMINI_API_KEY`. While it is correctly listed in `.gitignore`, the physical presence of API keys in development files needs strict rotation before production to ensure dev keys aren't reused in prod.
  * **Classification:** PRE-EXISTING.

---

## 6. Frontend / UI (Phases 1-8)

### 🟢 PASSED (Ready)
* The visual redesign (Local, Warm, Editorial, Professional) has been maintained strictly.
* Error states and 404 pages (Phase 8) are fully implemented and visually consistent.
* Customer, Shopkeeper, and Admin routes correctly enforce client-side UI restrictions based on the user's role.
* The Next.js production build (`npm run build`) completed successfully with no outstanding breaking lint errors.
* Form validations using Zod and React Hook Form are robust.

---

## Final Recommendation

MohallaMart 2.0 is visually and experientially ready for production, but **structurally unsafe** for launch due to the missing order-stock validation, missing database indexes, and missing backend pagination on heavy admin/search routes. 

**Required Actions Before Launch:**
1. Fix the checkout stock validation (Cart/Order Integrity).
2. Add the missing `@@index` directives to `schema.prisma` for `Order`, `Review`, `OrderItem`, and `CartItem`.
3. Implement pagination for Admin API endpoints and the global search endpoint.
4. Ensure `PAYMENT_PROVIDER` is strictly enforced in production to prevent mock bypass.

Once these blockers are resolved, the application will be ready for a production deployment.
