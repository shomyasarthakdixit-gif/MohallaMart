# MohallaMart 2.0 — Production Blocker Remediation Report

## 1. Audit Findings Addressed
* Checkout Stock Integrity (Missing stock validation during order creation)
* Database Indexes (Missing essential indexes for scalability)
* Product Creation RBAC (Missing shopkeeper enforcement)
* Payment Provider Fail-Closed Behavior (Insecure fallback to mock in production)
* Unbounded API Endpoints (Admin and review endpoints returning entire tables)
* Global Search Scalability (In-memory spatial filtering of entire shop table)

## 2. Files Modified
* `server/src/modules/orders/order.controller.ts`
* `database/prisma/schema.prisma`
* `server/src/modules/products/product.route.ts`
* `server/src/modules/payments/payment.service.ts`
* `server/src/modules/admin/admin.controller.ts`
* `server/src/modules/reviews/review.controller.ts`
* `server/src/modules/search/search.controller.ts`

## 3. Database Schema Changes
* Added `@@index([userId])` and `@@index([shopId])` to `Order`.
* Added `@@index([shopId])` and `@@index([productId])` to `Review`.
* Added `@@index([orderId])` and `@@index([productId])` to `OrderItem`.
* Added `@@index([cartId])` and `@@index([productId])` to `CartItem`.
**Why:** To prevent catastrophic full-table scans when users query their order history or shopkeepers view orders/reviews.
**What was NOT changed:** No tables were removed, and no existing relations were modified.

## 4. Prisma Migration Details
* Migration generated and applied using `npx prisma db push` because the existing database was not previously managed by the Prisma Migrate `prisma/migrations` folder system. 
* All indexes were successfully created on the SQLite `dev.db`.

## 5. Stock Validation Implementation
* Replaced the simple `update` loop in `order.controller.ts` with a secure `prisma.$transaction`.
* **Why:** To prevent concurrent checkouts from driving stock into negative values.
* **What changed:** Before deducting stock, the transaction explicitly fetches the latest stock value (`product.stock < item.quantity`) and throws an error if insufficient, rolling back the entire cart checkout cleanly.
* **What was NOT changed:** The cart behavior, loyalty logic, and payment order flows were kept exactly as they were.

## 6. RBAC Remediation
* Added `requireShopkeeper` to the `POST /`, `PUT /:id`, and `DELETE /:id` product routes.
* **Why:** To ensure only authorized users with a `SHOPKEEPER` role (or `ADMIN`) can mutate product data.
* **What was NOT changed:** The inner shop-ownership check (which verifies the specific shop belongs to the user) was kept intact as a secondary defense.

## 7. Payment Fail-Closed Remediation
* Updated `payment.service.ts` constructor to check `process.env.NODE_ENV`.
* **Why:** To prevent the system from silently using the MockPaymentProvider if the Razorpay keys are omitted in production.
* **What changed:** It now logs a CRITICAL error and calls `process.exit(1)` if `PAYMENT_PROVIDER !== "razorpay"` in a production environment.

## 8. Pagination Changes
* Imported `getPagination` and applied it to `getAdminUsers`, `getAdminShops`, `getAdminOrders`, and `getReviews`.
* **Why:** To prevent OOM (Out of Memory) crashes when the DB grows.
* **What changed:** Used a `safeTake` cap of `1000`. The API now safely returns `results` along with a `pagination` metadata object.
* **What was NOT changed:** The frontend `AdminTable` was not redesigned. The API continues to return the array at the expected root key, allowing the frontend client-side search to function up to the safe maximum limit.

## 9. Global Search Assessment
* Re-implemented `globalSearch` to use a fast, approximate geographic **bounding box** pre-filter (`latitude: { gte, lte }, longitude: { gte, lte }`).
* **Why:** The previous logic fetched *all* active shops from the DB to calculate the Haversine distance in Node.js.
* **What changed:** We now supply Prisma with coordinate bounds for a ~50km radius. Prisma returns a much smaller subset of shops, and we run standard Haversine on that subset. Products are also now cleanly paginated.
* **What was NOT changed:** We did not introduce PostGIS or external spatial databases, adhering strictly to the architecture limits.

## 10. APIs Affected
* `POST /api/v1/orders`
* `POST, PUT, DELETE /api/v1/products`
* `GET /api/v1/admin/users`, `shops`, `orders`
* `GET /api/v1/reviews`
* `GET /api/v1/search`

## 11. Business Logic Preserved
* Delivery calculations, coupon logic, loyalty points deduction, and webhook handling are completely untouched.

## 12. Security Verification
* Confirmed that a customer cannot create products, and mock payment is strictly disabled in production.

## 13. Concurrency / Inventory Verification
* The `prisma.$transaction` locks the state context for the order execution, safely rejecting attempts to overdraw stock.

## 14. Migration Verification
* Prisma schema changes pushed successfully and generated the client successfully.

## 15. Build Result
* Backend Typecheck: `tsc --noEmit` succeeded.
* Frontend Build: `npm run build` succeeded.

## 16. Lint Result
* Next.js build succeeded. Explicit un-related lint warnings (`any` types, `exhaustive-deps`) remain as per the instruction **"NO UNRELATED CLEANUP"**.

## 17. Regression Verification
* The frontend paths for Shopkeeper Dashboard, Admin Users, and Customer Cart have been preserved perfectly, ensuring existing UI components continue operating smoothly with the fortified backend.

## 18. Remaining Known Risks
* **Webhook Replay Attack:** The Razorpay webhook endpoint does not verify idempotency. An attacker with the webhook secret could replay a successful payment event.
* **Review Verification:** Reviews currently do not mandate a valid purchase history.

## 19. Deferred Recommendations
* Implement a robust queuing system (e.g., Redis/BullMQ) for order processing if throughput scales past simple DB transaction capabilities.
* Track payment idempotency keys in the `Payment` table to reject duplicate webhook deliveries.
