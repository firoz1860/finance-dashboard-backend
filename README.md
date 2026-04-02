# Finance Data Processing and Access Control Dashboard

This project is a full-stack finance dashboard where teams can capture and analyze financial transactions while enforcing role-based permissions. It combines secure JWT authentication, an API-first backend, and a responsive React interface built around operational reporting workflows. The app is intentionally structured in modules so each domain area (auth, users, records, dashboard) can scale independently.

## Tech Stack

- Backend: Node.js, Express.js
- Database: SQLite (via Prisma) for quick local setup
- ORM: Prisma
- Auth: JWT + bcrypt password hashing
- Frontend: React (Vite), React Router v6
- Styling: Pure CSS with design tokens (CSS variables)
- Charts: Recharts
- Icons: Lucide React

## Setup

```bash
# 1) Clone and move into project root
cd finance-dashboard

# 2) Backend setup
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev

# 3) In a second terminal, frontend setup
cd ../frontend
npm install
npm run dev
```

- Backend runs at `http://localhost:5050`
- Frontend runs at `http://localhost:5173`

## Environment Variables

Backend `.env` (copied from `.env.example`):

- `PORT`: API port
- `DATABASE_URL`: Prisma DB connection string (SQLite default: `file:./dev.db`)
- `JWT_SECRET`: signing secret for access tokens
- `JWT_EXPIRES_IN`: token expiry window (example: `1d`)

Frontend optional environment variable:

- `VITE_API_BASE_URL`: API base URL (default: `http://localhost:5050/api`)

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ADMIN | Register a new user |
| POST | `/api/auth/register/open` | Public | Bootstrapping registration route |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| POST | `/api/auth/logout` | Any authenticated | Client-side logout acknowledgement |
| GET | `/api/auth/me` | Any authenticated | Current user profile |
| GET | `/api/users` | ADMIN | List users (paginated) |
| GET | `/api/users/:id` | ADMIN | Fetch one user |
| POST | `/api/users` | ADMIN | Create user |
| PATCH | `/api/users/:id` | ADMIN | Update role/status |
| DELETE | `/api/users/:id` | ADMIN | Soft deactivate user |
| GET | `/api/records` | VIEWER/ANALYST/ADMIN | List records with filters |
| GET | `/api/records/:id` | VIEWER/ANALYST/ADMIN | Get single record |
| POST | `/api/records` | ANALYST/ADMIN | Create record |
| PATCH | `/api/records/:id` | ADMIN | Update record |
| DELETE | `/api/records/:id` | ADMIN | Soft delete record |
| GET | `/api/dashboard/summary` | VIEWER/ANALYST/ADMIN | Totals and net balance |
| GET | `/api/dashboard/by-category` | VIEWER/ANALYST/ADMIN | Grouped totals by category |
| GET | `/api/dashboard/trend?period=monthly` | VIEWER/ANALYST/ADMIN | Monthly trend data |
| GET | `/api/dashboard/recent` | VIEWER/ANALYST/ADMIN | Last 10 transactions |

## Role Permissions

| Action | VIEWER | ANALYST | ADMIN |
|---|---:|---:|---:|
| View dashboard summary | Yes | Yes | Yes |
| View records + filters | Yes | Yes | Yes |
| Create records | No | Yes | Yes |
| Update records | No | No | Yes |
| Delete records | No | No | Yes |
| View users | No | No | Yes |
| Manage users | No | No | Yes |

## Seed Data

```bash
cd backend
npm run prisma:seed
```

Creates:
- `admin@finance.dev / Admin@123`
- `analyst@finance.dev / Analyst@123`
- `viewer@finance.dev / Viewer@123`
- 36 seeded financial records across categories and recent months

## Register and Login Guide

Use one of these two flows:

1. **Seeded flow (fastest for local testing)**
   - Run `npm run prisma:seed` in `backend`
   - Login from the frontend with:
     - `admin@finance.dev / Admin@123`
     - `analyst@finance.dev / Analyst@123`
     - `viewer@finance.dev / Viewer@123`

2. **Fresh DB flow (first account bootstrap)**
   - If there are no users yet, call `POST /api/auth/register/open`
   - This creates the **first ADMIN** account
   - After first account exists, open registration is blocked and you must use:
     - `POST /api/auth/register` with ADMIN token, or
     - `POST /api/users` as ADMIN

PowerShell example (fresh DB bootstrap):

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/register/open" `
  -ContentType "application/json" `
  -Body '{"name":"Owner","email":"owner@finance.dev","password":"Owner@123"}'
```

PowerShell example (login):

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@finance.dev","password":"Admin@123"}'
```

## Folder Structure

- `backend/src/modules`: business domains (auth, users, records, dashboard)
- `backend/src/middleware`: auth, RBAC, and global error handling
- `backend/prisma`: schema + seed scripts
- `frontend/src/components`: layout, UI primitives, and chart widgets
- `frontend/src/pages`: route-level screens
- `frontend/src/services`: API clients and endpoint wrappers

## Assumptions

- SQLite is chosen for fast local development and demo readiness.
- JWT invalidation is client-side token clear (no server-side denylist table).
- First-user bootstrap is supported using `/api/auth/register/open`; later user creation should happen via admin flows.

## Known Limitations / Tradeoffs

- No refresh token rotation yet.
- `Users` screen in frontend is scaffolded and can be extended with full CRUD UI.
- Tests and Swagger are not yet wired in this iteration.
- Trend endpoint currently returns only months with data, not forced empty months.
