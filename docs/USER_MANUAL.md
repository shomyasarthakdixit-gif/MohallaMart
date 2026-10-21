# MohallaMart User Manual

Welcome to **MohallaMart**, your local neighborhood marketplace! This manual provides a quick overview of how to use the platform depending on your role.

---

## 🛍️ 1. Customer Guide

As a customer, you can browse local shops, add products to your cart, and place delivery orders directly from your neighborhood shopkeepers.

**Getting Started:**
1. Navigate to the **MohallaMart Homepage**.
2. Click **Login** and enter your phone number or authenticate with Google.
3. You will be redirected to the Customer Dashboard (`/home`).

**Shopping & Ordering:**
1. Browse shops on the **Home** tab or use the global **Search bar** at the top.
2. Click on a Shop to view its catalog of **Products**.
3. Click "Add to Cart" on any product.
4. Navigate to the **Cart** tab in the sidebar to review your items.
5. Click **Checkout** to proceed to payment (via Razorpay).
6. Once paid, the order will appear in your **Orders** tab where you can track its status (`PENDING` -> `ACCEPTED` -> `DELIVERED`).

---

## 🏪 2. Shopkeeper Guide

As a shopkeeper, MohallaMart provides you with a dedicated dashboard to manage your digital storefront.

**Getting Started:**
1. During signup, verify yourself as a Shopkeeper (or have an Admin upgrade your account).
2. Upon login, you will be redirected to the **Shopkeeper Panel** (`/dashboard`).
3. If this is your first time, you must complete your **Shop Profile** (Name, Address, Delivery Radius) before accepting orders.

**Managing Your Store:**
- **Dashboard (`/dashboard`)**: View daily metrics, recent orders, and total revenue.
- **Products (`/dashboard/products`)**: Add new items, set prices, manage stock counts, and upload product images.
- **Orders (`/dashboard/orders`)**: View incoming orders. You must click **Accept** on pending orders, and then update their status to **Delivered** once fulfilled.

---

## 🛡️ 3. Admin Guide

Admins have global oversight over the entire platform. 

**Getting Started:**
1. Admin accounts must be manually designated in the database (set `role = 'ADMIN'`).
2. Log in using your credentials.
3. You will be redirected to the **Admin Panel** (`/admin/dashboard`).

**Responsibilities:**
- **User Management (`/admin/users`)**: View all registered users on the platform. Ban or suspend abusive users.
- **Shop Moderation (`/admin/shops`)**: All newly created shops default to a `PENDING` state. As an admin, you must review the shop's details and click **Approve** for the shop to become visible to Customers.
- **Global Orders (`/admin/orders`)**: View all cross-platform orders for analytics and dispute resolution.
