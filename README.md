# Marc8 Fleet Financial Dashboard

A production-grade fleet financial management system. Manage bookings, expenses, journal entries, vehicles, vendors, settlements, and more — with real-time analytics, reporting, and role-based access.

## Quick Start (No Backend Required)

```bash
# 1. Clone
git clone https://github.com/apoorvm884-netizen/Marc8_Finance_Dashboard.git
cd Marc8_Finance_Dashboard

# 2. Install frontend dependencies
cd frontend && npm install

# 3. Start the frontend
npm run dev
```

Open `http://localhost:3000` and login with:

| Username | Password |
|---|---|
| `developer@marc8.local` | `Marc8@Demo123` |

This uses built-in demo data — no database or backend server needed. All pages, charts, and reports work immediately.

## Features

- **Dashboard** — Real-time fleet financial KPIs, revenue trends, expense breakdowns
- **Bookings** — Full booking lifecycle with platform integration
- **Expenses** — Categorized expense tracking with receipt management
- **Journal** — Double-entry accounting with auto-balancing
- **Settlements** — Platform-wise settlement reconciliation
- **Vehicles** — Complete vehicle lifecycle management
- **Vendors** — Vendor management with payment tracking
- **Vehicle Owners** — Owner management with financial settlements
- **Maintenance** — Service scheduling with fleet health monitoring
- **Reports** — Exportable reports (Excel/PDF) with filters
- **Analytics** — Interactive charts, trend analysis, financial intelligence
- **Outstanding** — Payment tracking with DSO/DPO analytics
- **Automation** — Rule-based workflow automation
- **Notifications** — In-app notifications with priority queue
- **Master Data** — Configurable dropdowns, categories, and reference data

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| **Components** | Shadcn UI (Radix primitives), Framer Motion, Recharts |
| **Forms** | React Hook Form + Zod |
| **Tables** | TanStack Table |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL via Knex.js |
| **Auth** | JWT with 5 roles (SUPER_ADMIN, ADMIN, MANAGER, OPERATOR, VIEWER) |
| **Container** | Docker + Docker Compose |

## Repository Structure

```
Marc8_Finance_Dashboard/
├── frontend/          # React SPA — main development folder
│   ├── src/
│   │   ├── app/       # App entry, providers
│   │   ├── components/# UI components (shared, ui, dashboard, layout, etc.)
│   │   ├── config/    # App configuration, constants, navigation
│   │   ├── hooks/     # Custom React hooks
│   │   ├── layouts/   # Auth and dashboard layout shells
│   │   ├── lib/       # Utility functions
│   │   ├── pages/     # Route-level page components
│   │   ├── providers/ # React context providers (auth, theme, etc.)
│   │   ├── routes/    # Route definitions + protected route wrapper
│   │   ├── services/  # API client + service modules
│   │   ├── stores/    # Zustand state stores
│   │   ├── types/     # TypeScript interfaces
│   │   └── validation/# Zod validation schemas
│   └── __tests__/     # Frontend tests (Vitest)
│
├── backend/           # Express API — deploy separately
│   ├── src/
│   │   ├── config/    # DB, env configuration
│   │   ├── controllers/# Route handlers
│   │   ├── middleware/ # Auth, RBAC, validation, error handling
│   │   ├── routes/    # Express route definitions
│   │   ├── services/  # Business logic
│   │   │   └── financial-engine/  # Core financial calculations
│   │   ├── types/     # TypeScript interfaces
│   │   ├── utils/     # Helpers, errors, logger
│   │   └── validators/# Zod schemas
│   ├── database/      # Knex migrations + seeds
│   └── __tests__/     # Backend tests (Vitest + Supertest)
│
├── releases/          # HTML release packages (static handoff)
├── Marc8_HTML/        # HTML working copy
├── __tests__/         # Shared test documentation
├── docker-compose.yml # Full-stack deployment
└── docs and reports   # Engineering docs, certification reports
```

## Running Locally

### Frontend Only (No Backend Needed)

```bash
cd frontend
npm install
npm run dev
```

Login: `developer@marc8.local` / `Marc8@Demo123`

### Full Stack (With Backend)

**Prerequisites:** Node.js 20+, PostgreSQL 15+, npm 9+

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env      # Edit with your database credentials
npm install
npx knex migrate:latest
npx knex seed:run
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/fleet_dashboard` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | Token expiration | `24h` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` |
| `RATE_LIMIT_WINDOW` | Rate limit window (minutes) | `15` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `LOG_LEVEL` | Logging level | `debug` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API URL (production) | `/api/v1` |

## Build Commands

```bash
# Frontend
cd frontend && npm run build     # Production build → frontend/dist/

# Backend
cd backend && npm run build      # TypeScript compile → backend/dist/
cd backend && npm start          # Run compiled backend
```

## Test Commands

```bash
# Frontend tests
cd frontend && npm test          # 7 tests (Components)
cd frontend && npm run test:watch
cd frontend && npm run test:coverage

# Backend tests
cd backend && npm test           # 32 tests (Unit + Integration)
cd backend && npm run test:watch
cd backend && npm run test:coverage
```

## Deployment

| Platform | Frontend | Backend | Notes |
|---|---|---|---|
| **GitHub Pages** | ✅ | ❌ | Static frontend only |
| **Vercel** | ✅ | ❌ | `frontend/vercel.json` configured |
| **Netlify** | ✅ | ❌ | SPA with redirects |
| **Render** | ✅ | ✅ | Backend + PostgreSQL |
| **Railway** | ✅ | ✅ | Backend + PostgreSQL |
| **Docker** | ✅ | ✅ | `docker-compose.yml` for full stack |

### Deploy to Vercel

```bash
cd frontend
npx vercel --prod
```

Set `VITE_API_URL` to your backend URL in Vercel environment variables.

### Deploy with Docker

```bash
docker-compose up --build
```

Requires `JWT_SECRET` environment variable set.

## Developer Demo Login

When running the frontend without a backend, use these credentials:

- **Username:** `developer@marc8.local`
- **Password:** `Marc8@Demo123`

This bypasses the backend API and loads the app with built-in demo data. All features, charts, and reports work with realistic sample data. To remove this temporary login later, see `frontend/src/providers/auth-provider.tsx` and remove the `TEMPORARY DEVELOPER DEMO LOGIN` blocks.

## Backend Integration

To connect a real backend:

1. Deploy the backend (see `backend/` and `docker-compose.yml`)
2. Set `VITE_API_URL` to the backend URL (e.g., `https://api.yourdomain.com/api/v1`)
3. Rebuild the frontend
4. Remove the temporary dev login from `frontend/src/providers/auth-provider.tsx`

## FAQ

**Q: Do I need a database to run the app?**
A: No. The Developer Demo Login loads the app with built-in mock data.

**Q: Which folder should I work in?**
A: `frontend/` for UI work, `backend/` for API work.

**Q: Which folder should I NOT modify?**
A: `releases/` (HTML handoff packages), `Marc8_HTML/` (HTML working copy), and certification/audit reports at root.

**Q: How do I add a new page?**
A: Add a component in `frontend/src/pages/`, add a route in `frontend/src/routes/`, and add a nav link in `frontend/src/config/navigation.ts`.

**Q: How do I add a new API endpoint?**
A: Add a route in `backend/src/routes/`, a controller in `backend/src/controllers/`, a service in `backend/src/services/`, and a validator in `backend/src/validators/`.

**Q: The developer login stopped working?**
A: Check that `VITE_API_URL` is NOT set to a real backend URL. The dev login intercept happens before the API call.

## Contributing

See `CONTRIBUTING.md` for guidelines.
