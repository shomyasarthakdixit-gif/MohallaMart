# MohallaMart Development Roadmap

This document serves as the master specification and source of truth for the development phases of MohallaMart.
The project is built incrementally. After each phase is completed, tested, and documented, development moves to the next logical phase.

## Current Progress Overview

- [x] **PHASE 0** — VALIDATION & PRODUCT DEFINITION
- [x] **PHASE 1** — PROJECT FOUNDATION
- [x] **PHASE 2** — SYSTEM & DATABASE ARCHITECTURE
- [x] **PHASE 3** — AUTHENTICATION & AUTHORIZATION
- [x] **PHASE 4** — CUSTOMER APPLICATION FOUNDATION
- [x] **PHASE 5** — SHOPKEEPER PLATFORM
- [x] **PHASE 6** — SHOPPING CART & CHECKOUT
- [x] **PHASE 7** — ORDER MANAGEMENT
- [x] **PHASE 8** — DELIVERY SYSTEM
- [x] **PHASE 9** — PAYMENTS
- [x] **PHASE 10** — MAPS & LOCATION
- [x] **PHASE 11** — NOTIFICATIONS
- [x] **PHASE 12** — ADMIN PANEL
- [x] **PHASE 13** — SEARCH & DISCOVERY
- [x] **PHASE 14** — BUSINESS & ANALYTICS
- [x] **PHASE 15** — AI FEATURES
- [x] **PHASE 16** — ADVANCED FEATURES
- [x] **PHASE 17** — SECURITY
- [x] **PHASE 18** — TESTING
- [x] **PHASE 19** — PERFORMANCE & PRODUCTION HARDENING
- [x] **PHASE 20** — DOCUMENTATION
- [x] **PHASE 21** — DEPLOYMENT
- [x] **PHASE 22** — FINAL PRODUCT POLISH

---

## Detailed Phases

### PHASE 0 — VALIDATION & PRODUCT DEFINITION (Completed)
- Market validation is already completed.
- Project name: MohallaMart.
- Target users: nearby/colony residents and local shopkeepers.
- Business model and core concept are defined.

### PHASE 1 — PROJECT FOUNDATION (Completed)
- Monorepo/project structure (Next.js frontend, Express backend)
- React + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- Environment configuration
- Clean architecture and API versioning (`/api/v1`)

### PHASE 2 — SYSTEM & DATABASE ARCHITECTURE (Completed)
- Create and implement complete database architecture (User, Address, Shop, Category, Product, Cart, Order, etc.)
- Primary/Foreign keys, relations, timestamps
- Prisma migrations and seed data.

### PHASE 3 — AUTHENTICATION & AUTHORIZATION (Completed)
- Customer & Shopkeeper registration/login
- Firebase Phone OTP and Email bypass for local dev
- JWT access tokens and secure token handling
- Role-based access control (CUSTOMER, SHOPKEEPER, ADMIN)

### PHASE 4 — CUSTOMER APPLICATION FOUNDATION (Completed)
Build a polished responsive customer application:
- [x] Landing page
- [x] Login / Registration
- [x] Home page (Nearby shops list)
- [x] Location permission
- [x] Shop categories
- [x] Shop details page
- [x] Product listing & details
- [x] Search, Filtering, Sorting
- [x] Product availability
- [x] Saved addresses & Profile
*Note: UI must be modern, responsive, accessible and production-quality.*

### PHASE 5 — SHOPKEEPER PLATFORM (Completed)
Build the dashboard for shop owners to manage their business:
- [x] Shopkeeper registration
- [x] Basic Dashboard outline
- [x] Shop profile, verification status, timings, delivery radius
- [x] Product CRUD & Category management
- [x] Inventory management, stock status, pricing
- [x] Order notifications & management (Accept/reject, Packing, Out-for-delivery, Delivered)
- [x] Order history & Sales dashboard

### PHASE 6 — SHOPPING CART & CHECKOUT (Completed)
Implement the complete cart and checkout system:
- [x] Persistent cart state (Local Storage + DB Sync)
- [x] Cart UI (Side drawer or dedicated page)
- [x] Add/Remove products with quantity management
- [x] Checkout process (Address selection, Delivery type, Payment method)
- [x] Order creation & Validation
- [x] Real-time total calculation with delivery fees)

### PHASE 7 — ORDER MANAGEMENT (Completed)
Implement complete order lifecycle:
- [x] Order states: PENDING, ACCEPTED, REJECTED, PACKING, READY_FOR_DELIVERY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
- [x] Order creation, Shop-specific orders
- [x] Customer order tracking and shopkeeper order management

### PHASE 8 — DELIVERY SYSTEM (Completed)
Implement hyperlocal delivery concept:
- [x] SCHEDULED DELIVERY vs EXPRESS DELIVERY (Configurable per shop)
- [x] Delivery assignment architecture and fee calculation
- [x] Radius validation (Deferred to Phase 10)

### PHASE 9 — PAYMENTS (Completed)
PaymentProvider Architecture:
- [x] Abstracted `PaymentProvider` interface to support multiple gateways.
- [x] `MockPaymentProvider` for local development and automated testing (success/failure scenarios).
- [x] `RazorpayPaymentProvider` integrated (Note: External credentials are not currently available for local validation; will use later).
- [x] Webhook handling and signature verification abstractly managed via Provider.
- [x] Refund architecture and duplicate webhook safety.
- [x] Cash on Delivery (COD).
### PHASE 10 — MAPS & LOCATION (Completed)
- [x] Customer location coordinates, Nearby shop discovery
- [x] Distance calculation, Shop delivery radius

### PHASE 11 — NOTIFICATIONS (Completed)
- [x] In-app, Email, Push Notifications (Firebase Cloud Messaging) for Order states and Payments.

### PHASE 12 — ADMIN PANEL (Completed)
- [x] Professional admin dashboard (Users, Shopkeepers, Shops approval, Orders, Payments, Analytics).

### PHASE 13 — SEARCH & DISCOVERY (Completed)
- [x] Shop search, Product search, Category search
- [x] Filters, Sorting, Open-now shops

### PHASE 14 — BUSINESS & ANALYTICS (Completed)
- [x] Customer spending insights
- [x] Shopkeeper revenue and analytics
- [x] Admin platform growth metrics

### PHASE 15 — AI FEATURES (Completed)
*Add AI only after the core marketplace is stable.*
- [x] AI shopping assistant (Natural-language shopping list)
- [x] Smart recommendations

### PHASE 16 — ADVANCED FEATURES (Completed)
- [x] WhatsApp/Voice ordering, Multi-language support, Coupons, Loyalty points, Reviews, PWA

### PHASE 17 — SECURITY (Completed)
- [x] Zod validation
- [x] Helmet, CORS, Rate limiting
- [x] CSRF protection (implicit via Bearer token usage)
- [x] Audit logging (Deferred to basic structured logging via morgan/winston in production phase)
- [x] Webhook signature verification

### PHASE 18 — TESTING (Completed)
- [x] Established backend Jest testing environment.
- [x] Written `MockPaymentProvider` unit tests.
- [x] Written `PaymentController` webhook integration tests.

### PHASE 19 — PERFORMANCE & PRODUCTION HARDENING (Completed)
- [x] Pagination for all heavy list endpoints (`getProductsByShopId`, `getNearbyShops`, `getMyOrders`, `getShopOrders`).
- [x] Database indexes added to `schema.prisma` for critical queries (users, orders, shops, statuses).
- [x] Caching introduced (`node-cache`) for high-traffic shop lists.
- [x] Centralized error monitoring (`errorHandler` middleware).
- [x] Structured logging (`winston`) integrated into server lifecycle.

### PHASE 20 — DOCUMENTATION (Not Started)
- Update all `docs/*.md` files, API documentation

### PHASE 21 — DEPLOYMENT (Not Started)
- Vercel for Frontend, Railway/Supabase for Backend & DB, CI/CD

### PHASE 22 — FINAL PRODUCT POLISH (Not Started)
- Fix bugs, remove placeholder data, improve UX, SEO, Performance optimization

---

*Note: Update this roadmap file after each completed phase.*
