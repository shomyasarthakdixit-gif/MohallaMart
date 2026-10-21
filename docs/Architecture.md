# MohallaMart Architecture

MohallaMart follows a decoupled monorepo architecture, splitting the Frontend (Next.js) and Backend (Express.js) into separate directories while sharing a common database interface via Prisma.

## Repository Structure

```text
MohallaMart/
├── client/         # Frontend Next.js application
├── server/         # Backend Node.js / Express application
├── database/       # Shared Prisma schema, migrations, and seed scripts
└── docs/           # Architecture and Design documents
```

## Frontend Architecture (`/client`)

The frontend is built with **Next.js 14 App Router** and prioritizes server-side rendering (SSR) where appropriate while utilizing client-side interactions for dynamic UI elements.

- **Routing:** Follows the Next.js `app/` directory convention. Layouts (`layout.tsx`) are used to persist navigation (Sidebar, Top Nav), while `template.tsx` handles smooth, animated page transitions (via Framer Motion).
- **State Management:** **Zustand** is used for global state (e.g., `authStore` for user session and roles, `cartStore` for managing the shopping cart).
- **Styling:** **Tailwind CSS** combined with **shadcn/ui** components for a rapid, responsive, and beautiful design system.
- **Data Fetching:** Axios is used in `lib/api.ts` to attach the Bearer token to all outbound requests automatically.

## Backend Architecture (`/server`)

The backend is a robust RESTful API built with **Express.js** and **TypeScript**.

- **Routing Structure:** Uses an organized `routes -> controller -> service` pattern.
  - *Routes* map HTTP methods to Controller actions.
  - *Controllers* handle `req` and `res`, validation, and HTTP responses.
- **Middleware:** 
  - `auth.middleware.ts` intercepts requests, verifies Firebase ID tokens, and attaches the parsed User object to `req.user`.
  - `error.middleware.ts` acts as a global catch-all error handler, standardizing JSON error outputs and logging via Winston.
- **Logging & Monitoring:** **Winston** is used for structured logging, printing clean development logs and saving error traces to `logs/error.log`.
- **Caching:** **Node-Cache** is utilized for high-throughput endpoints (e.g., fetching the approved shops list) to significantly reduce database load.

## Authentication Flow

MohallaMart delegates credential security to **Firebase Authentication** while maintaining authorization on the backend.

1. User authenticates on the Client via Firebase (Phone, Google, Email).
2. Firebase returns a secure ID Token to the Client.
3. Client sends this token to `/api/v1/auth/verify-phone`.
4. The Backend verifies the token using `firebase-admin`.
5. Upon verification, the Backend finds or creates the User record in Prisma.
6. The Backend generates a JWT (JSON Web Token) specific to MohallaMart.
7. The Client stores this JWT in cookies/local storage for subsequent requests.

## Payments (Razorpay Integration)

1. The Client requests order checkout.
2. The Backend uses the Razorpay SDK to create an `order_id`.
3. The Client initializes the Razorpay UI widget with the `order_id`.
4. Upon successful client-side payment, Razorpay redirects or calls a webhook on the Backend to verify the payment signature.
5. The Backend updates the order status to `PAID`.
