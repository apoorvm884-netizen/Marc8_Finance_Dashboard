# Fleet Financial Dashboard

A production-grade fleet financial management system built with React 19, Node.js/Express, TypeScript, and PostgreSQL. Provides comprehensive booking, expense, journal, and fleet management with real-time financial analytics, reporting, and role-based access control.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (React 19)             │
│  ┌──────────┬──────────┬──────────┬──────────┐  │
│  │  Auth   │ Dashboard│ Analytics│  Reports │  │
│  │  Pages  │  Widgets │  Charts  │  Export   │  │
│  ├──────────┼──────────┼──────────┼──────────┤  │
│  │  Bookings │ Expenses│ Journal  │ Settings │  │
│  ├──────────┴──────────┴──────────┴──────────┤  │
│  │         Shared UI + Layout Components       │  │
│  └─────────────────────────────────────────────┘  │
│                        │ REST API                  │
├────────────────────────┼─────────────────────────┤
│           Backend (Express + TypeScript)           │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  Routes  │ │ Controllers  │ │  Validators   │  │
│  ├──────────┤ ├──────────────┤ ├──────────────┤  │
│  │ Services │ │ Financial    │ │  Middleware   │  │
│  │          │ │ Engine       │ │  (Auth/RBAC)  │  │
│  └──────────┘ └──────────────┘ └──────────────┘  │
│                        │ Knex                      │
├────────────────────────┼─────────────────────────┤
│              PostgreSQL Database                   │
│  14 Migrations · 5 Enums · 15+ Tables             │
└───────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite 6** build tool
- **Tailwind CSS 4** with dark finance theme
- **Shadcn UI** component primitives
- **React Router 7** with lazy loading
- **TanStack Table** for data tables
- **React Hook Form + Zod** for form validation
- **Framer Motion** for animations
- **Recharts** for charts
- **date-fns** for date handling
- **xlsx** for Excel export

### Backend
- **Node.js** with **Express** and **TypeScript**
- **Knex.js** query builder
- **PostgreSQL** database
- **JWT** authentication with RBAC (5 roles)
- **Zod** request validation
- **xlsx** for Excel export
- **Winston** logging
- **express-rate-limit** for rate limiting

## Folder Structure

```
Fleet Financial Dashboard/
├── backend/
│   ├── src/                    # TypeScript source
│   │   ├── config/             # DB, env, constants
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, RBAC, validation, error handling
│   │   ├── routes/            # Express route definitions
│   │   ├── services/          # Business logic
│   │   │   └── financial-engine/  # Core financial calculations
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # Helpers, errors, logger, response
│   │   └── validators/        # Zod schemas
│   ├── knexfile.ts
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/               # App entry
│   │   ├── components/        # UI components
│   │   │   ├── shared/        # Reusable shared components
│   │   │   ├── ui/            # Shadcn primitives
│   │   │   ├── dashboard/     # Dashboard widgets
│   │   │   ├── bookings/      # Booking components
│   │   │   ├── expenses/      # Expense components
│   │   │   ├── journal/       # Journal components
│   │   │   ├── reports/       # Report components
│   │   │   ├── vehicles/      # Vehicle components
│   │   │   ├── master/        # Master data components
│   │   │   └── layout/        # Navbar, sidebar, etc.
│   │   ├── config/            # Navigation, constants
│   │   ├── hooks/             # Custom React hooks
│   │   ├── layouts/           # Auth/dashboard layouts
│   │   ├── lib/               # Utility functions
│   │   ├── pages/             # Route pages
│   │   ├── providers/         # Context providers
│   │   ├── routes/            # Route configuration
│   │   ├── services/          # API client + services
│   │   ├── stores/            # Zustand stores
│   │   ├── types/             # TypeScript interfaces
│   │   └── validation/        # Zod schemas (reference)
│   ├── vite.config.ts
│   └── tsconfig.json
├── database/
│   ├── migrations/            # 14 Knex migrations
│   ├── seeds/                 # Admin + master data seeds
│   └── init.sql              # Database initialization
```

## Installation

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm 9+

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd fleet-financial-dashboard

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Environment variables
cp backend/.env.example backend/.env
# Edit .env with your database credentials

# Create database
createdb fleet_financial_dashboard

# Run migrations
cd ../backend
npx knex migrate:latest

# Seed data
npx knex seed:run

# Start development servers
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/fleet_financial_dashboard` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | JWT expiration | `8h` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:5173` |

## Build

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## Default Admin Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `Admin@123` |
| Role | `SUPER_ADMIN` |

**🔴 Change password on first login. Update in production deployment.**

## Database Migrations

```bash
# Run all migrations
npx knex migrate:latest

# Rollback last migration
npx knex migrate:down

# Rollback all migrations
npx knex migrate:rollback

# Create new migration
npx knex migrate:make migration_name
```

## Key Design Decisions

- **Financial Engine**: All financial calculations (revenue, expense, profit, cash flow, fleet analytics) are centralized in `backend/src/services/financial-engine/`. No React component, controller, or service outside this engine may directly calculate financial values.
- **Soft Delete**: All primary entities support soft delete with `deleted_at` and `deleted_by` columns. Restore operations preserve data integrity.
- **RBAC**: Five roles (SUPER_ADMIN, ADMIN, MANAGER, OPERATOR, VIEWER) with granular permission checks per endpoint.
- **Master Data**: Configurable dropdowns (platforms, expense categories, payment modes, ledger categories, booking/payment/expense statuses) load dynamically from the Master Data Engine.
- **Net Revenue Formula**: `Gross Fare + Doorstep Charges - Platform Commission`. Managed exclusively by the Financial Engine.

## Known Limitations

- Email/SMS notifications are not yet implemented (in-app notifications only)
- Dark theme only (light theme toggling is not supported)
- Real-time WebSocket updates are not implemented (30-second polling for notifications)
- Mobile responsive but not optimized for small screens
- Multi-tenancy is not supported
- No CI/CD pipeline configured
- `deleted_by` tracking missing on `reminders` and `master_values` tables (requires migration)
