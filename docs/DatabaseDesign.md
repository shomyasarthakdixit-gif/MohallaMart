# MohallaMart Database Design

The database schema is managed via **Prisma ORM** in the `database/prisma/schema.prisma` file.
Currently, it uses **SQLite** for rapid development, but is built entirely with relational logic compatible with **PostgreSQL** for production.

## Core Models & Relationships

### `User`
- Represents all platform users.
- Identifiable by `id` (UUID), `phone`, `email`, and `firebaseUid`.
- Distinguishes roles using the `Role` enum (`CUSTOMER`, `SHOPKEEPER`, `ADMIN`).
- **Relationships:**
  - One-to-Many with `Address`.
  - One-to-Many with `Order` (as a customer).
  - One-to-Many with `Review`.
  - One-to-One with `Shop` (if `SHOPKEEPER`).

### `Shop`
- Represents a storefront managed by a `SHOPKEEPER`.
- Maintains properties like `name`, `address`, `latitude`, `longitude`, `deliveryRadius`.
- Utilizes `status` enum (`PENDING`, `APPROVED`, `REJECTED`) for Admin moderation.
- **Relationships:**
  - One-to-Many with `Product`.
  - One-to-Many with `Order` (orders placed at this specific shop).
  - One-to-Many with `Review` (reviews left by customers for this shop).

### `Product`
- Represents inventory items belonging to a specific `Shop`.
- Contains `name`, `price`, `stock`, `image`, and `isActive` toggle.
- **Relationships:**
  - Belongs to a `Shop`.
  - Belongs to a `Category`.
  - One-to-Many with `CartItem` and `OrderItem`.

### `Order` & `OrderItem`
- **Order** represents a checkout instance by a `User` at a `Shop`.
- Includes total pricing, `status` enum (`PENDING`, `ACCEPTED`, `DELIVERED`, `CANCELLED`), and `paymentStatus` enum (`PENDING`, `PAID`, `FAILED`).
- **Relationships:**
  - One-to-Many with `OrderItem`.
  - One-to-One with `Payment`.
  - One-to-One with `Delivery`.

### Auxiliary Models
- **Cart & CartItem:** Temporary persistence of user intent before checkout.
- **Payment:** Tracks Razorpay `transactionId`, `amount`, and verification signatures.
- **Notification:** Stores in-app alerts sent to users regarding order updates.
- **Review:** Rating (1-5) and comment system for customers reviewing shops.
- **Category:** Categorization tags for Products (e.g., "Groceries", "Electronics").

## Indexing Strategy (Phase 19)

To ensure high performance querying for standard list endpoints, standard relational indexes are implemented on high-throughput fields:

- `@@index([role])` and `@@index([phone])` on **User**.
- `@@index([ownerId])`, `@@index([status])`, and `@@index([isActive])` on **Shop**.
- `@@index([shopId])` and `@@index([categoryId])` on **Product**.
- `@@index([userId])`, `@@index([shopId])`, and `@@index([status])` on **Order**.
- `@@index([orderId])` on **Payment**, **Delivery**, and **OrderItem**.

This ensures O(log n) lookups instead of full table scans for all our heavy `findMany` queries with standard pagination!
