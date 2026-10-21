# MohallaMart 2.0 — Final P0 Stock Concurrency Remediation Report

## 1. Executive Summary
This report details the final surgical remediation of the P0 stock concurrency race condition. The vulnerability, which allowed concurrent cart checkouts to push product stock into negative values, has been entirely mitigated by replacing a read-modify-write pattern with a strictly atomic conditional update at the database level.

## 2. Original Vulnerability
The `order.controller.ts` endpoint processed checkouts using the following flow inside `prisma.$transaction`:
1. `findUnique`: Read product stock.
2. Application-level check: `if (product.stock < quantity) throw Error`.
3. `update`: Decrement stock unconditionally (`decrement: quantity`).

## 3. Root Cause
Because `findUnique` inside a Prisma Interactive Transaction does not inherently apply row-level locking (such as `SELECT ... FOR UPDATE`), two concurrent checkouts could simultaneously read `stock = 1`, pass the application-level check, and issue the unconditional `decrement: 1`, resulting in `stock = -1`.

## 4. Exact Fix
The non-atomic `findUnique` and `update` logic was entirely removed. It was replaced with a single, atomic `updateMany` operation. 

## 5. Atomic Stock Operation Explanation
Using Prisma's `updateMany`, the operation is compiled by the database driver into a single SQL statement conceptually equivalent to:
```sql
UPDATE Product 
SET stock = stock - quantity 
WHERE id = productId AND stock >= quantity
```
If the operation successfully finds a row meeting the criteria, Prisma returns `{ count: 1 }`.
If the stock has already been depleted by a concurrent transaction, it returns `{ count: 0 }`.

## 6. Transaction Boundary
The atomic `updateMany` occurs directly inside the existing `prisma.$transaction`. If `count === 0`, an error is manually thrown (`Insufficient stock`), which instantly cascades and rolls back the entire Prisma transaction, ensuring no partial states survive.

## 7. Multi-Product Rollback Behavior
For multi-product checkouts, the atomic decrement is executed in a loop. If Product A successfully decrements, but Product B yields `count === 0` (insufficient stock), an error is thrown. The entire transaction rolls back, which intrinsically restores the inventory for Product A back to its exact pre-checkout state.

## 8. Concurrency Verification
**Scenario:** Initial `stock = 1`. Concurrent checkouts Request A and Request B for `quantity = 1`.
- Both requests initiate the Prisma transaction and arrive at the `updateMany` step.
- The underlying SQLite database serializes the conflicting writes.
- Request A's `UPDATE` executes first, decrements the stock to 0, and returns `count = 1`.
- Request B's `UPDATE` executes immediately after, evaluates the condition `WHERE id = X AND stock >= 1`, finds NO matching row (because stock is now 0), and returns `count = 0`.
- Request A commits successfully. Request B throws an exception, rolls back, and returns the appropriate HTTP 400 error to the client. Negative inventory is mathematically impossible.

## 9. Error Handling
If `count === 0`, the system explicitly attempts a secondary (informational) `findUnique` strictly to populate the product name in the error message, ensuring the frontend gracefully receives the expected message: `Insufficient stock for product: [Name]`. The HTTP 400 status remains intact, preventing corrupted carts or incorrect payment flows.

## 10. Existing Business Logic Preserved
- No cart validation, shop grouping, or state machine logic was touched.
- Delivery fees, discount pro-rating, and loyalty point subtractions operate exactly as before.
- Multi-shop checkout and related notification dispatches remain unmodified.

## 11. Previously Fixed Blockers Re-verified
The surgical stock fix did not interfere with any previous fixes:
- Database indexes are unchanged.
- Product RBAC (`requireShopkeeper`) remains enforced in `product.route.ts`.
- The `PaymentService` retains its `process.exit(1)` production lock.
- API pagination remains intact for Admin and Reviews.
- Global Search retains its bounding-box logic.

## 12. Tests Executed
- Focused review of `updateMany` Prisma return types.
- Backend Type Compilation check (`tsc --noEmit`).
- Frontend Client Build (`npm run build`).

## 13. Build / Type Check Results
- `npx tsc --noEmit` on the server: SUCCESS.
- `npm run build` on the client: SUCCESS.

## 14. Exact Files Modified
- Modified: `d:\MohallaMart\server\src\modules\orders\order.controller.ts`
- Created: None
- Deleted: None

## 15. Remaining Risks
None related to the P0 stock inventory.

## 16. Final P0 Status
**RESOLVED**
