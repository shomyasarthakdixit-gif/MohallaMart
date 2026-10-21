# MohallaMart

<div align="center">
  <h3>Your neighborhood marketplace, elevated.</h3>
  <p>Connecting nearby residents with local shopkeepers through scheduled and express deliveries.</p>
</div>

---

## 🚀 Overview

MohallaMart is a full-stack, hyperlocal e-commerce platform built to digitize neighborhood commerce. 
It features three distinct experiences:
1. **Customer App**: Browse nearby shops, add items to cart, and checkout seamlessly.
2. **Shopkeeper Dashboard**: Manage inventory, track incoming orders, and handle business analytics.
3. **Admin Panel**: Global oversight of users, shops, and platform metrics.

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion, Zustand
- **Backend**: Node.js, Express.js, TypeScript, Winston (Logging), Node-Cache
- **Database**: SQLite (Development) / PostgreSQL (Production ready), Prisma ORM
- **Authentication**: Firebase Authentication (Phone, Google, Email)
- **Payments**: Razorpay Integration (Mocked in dev)

## 📦 Project Structure

MohallaMart is organized as a monorepo for seamless full-stack development:

```text
MohallaMart/
├── client/       # Next.js frontend application
├── server/       # Express.js REST API backend
├── database/     # Prisma schema and SQLite database
└── docs/         # Detailed architectural and technical documentation
```

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone & Install
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install

# Install database dependencies
cd ../database
npm install
```

### 2. Environment Variables
You need to set up `.env` files in both the `client` and `server` directories.
- Copy `server/.env.example` to `server/.env` and update the Firebase / Razorpay keys.
- Copy `client/.env.example` to `client/.env.local` and update the Firebase keys.
*(Note: Mock functionality is available in development mode if Firebase/Razorpay keys are missing or invalid).*

### 3. Database Initialization
```bash
cd database
# Generate Prisma Client
npx prisma generate
# Push the schema to the SQLite database
npx prisma db push
```

### 4. Running the Development Servers

**Start Backend (Terminal 1):**
```bash
cd server
npm run dev
# API runs on http://localhost:5000
# Swagger API Docs available at http://localhost:5000/api-docs
```

**Start Frontend (Terminal 2):**
```bash
cd client
npm run dev
# App runs on http://localhost:3000
```

## 📚 Documentation
For deeper dives into the system, refer to our detailed guides:
- [API Documentation](./docs/API_Documentation.md)
- [Architecture Guide](./docs/Architecture.md)
- [Database Design](./docs/DatabaseDesign.md)
- [User Manual](./docs/USER_MANUAL.md)

## 🚀 Deployment Guide (Production)

To deploy MohallaMart to the public internet, follow these steps. We use **Render** for the Backend API, **Vercel** for the Frontend, and **Supabase** for the PostgreSQL database.

### 1. Database (Supabase)
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Under project settings, find the **Database Settings** and copy your `Transaction connection string` (starting with `postgresql://`).
3. Add this URL to your environment variables as `DATABASE_URL`.

### 2. Backend (Render)
1. Push your code to a GitHub repository.
2. Go to [Render](https://render.com/) and connect your GitHub account.
3. Because the codebase includes a `render.yaml` file, you can go to Render's **Blueprints** tab and click **New Blueprint Instance**. Select your repository.
4. Render will automatically detect the backend and ask you to fill in the environment variables:
   - `DATABASE_URL`: The Supabase URL from Step 1.
   - `CORS_ORIGIN`: Set this to your frontend URL later (or `*` temporarily).
   - `JWT_SECRET`: A secure random string.
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: From your Firebase Admin SDK JSON.
5. Click **Apply** and wait for the backend to deploy. Once deployed, copy the Render URL (e.g., `https://mohallamart-backend.onrender.com`).

### 3. Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and connect your GitHub account.
2. Click **Add New Project** and select your repository.
3. Vercel will automatically detect the monorepo. Set the **Root Directory** to `client`.
4. Open the **Environment Variables** section and add:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL + `/api/v1` (e.g., `https://mohallamart-backend.onrender.com/api/v1`).
   - Add your Firebase Client keys (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.).
5. Click **Deploy**.

Once both are deployed, your full-stack MohallaMart platform is live on the internet!

---
*Status: Phase 21 Completed - Deployment Configuration Finalized*
