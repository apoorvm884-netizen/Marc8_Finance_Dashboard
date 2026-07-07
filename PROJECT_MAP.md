# Project Map — Marc8 Fleet Financial Dashboard

A visual guide to every folder in the repository.

```
Marc8_Finance_Dashboard/
│
├── frontend/ ─────────────────────────── MAIN DEV FOLDER
│   │  React 19 + TypeScript + Vite SPA
│   │  Run with: cd frontend && npm run dev
│   │
│   ├── src/
│   │   ├── app/              # App entry point, bootstrapping
│   │   ├── components/       # All UI components
│   │   │   ├── ui/           #   Shadcn primitives (button, input, dialog, etc.)
│   │   │   ├── shared/       #   Reusable app-specific components
│   │   │   ├── layout/       #   Sidebar, navbar, header, footer
│   │   │   ├── dashboard/    #   Dashboard KPI widgets
│   │   │   ├── bookings/     #   Booking-related components
│   │   │   ├── expenses/     #   Expense-related components
│   │   │   ├── journal/      #   Journal entry components
│   │   │   ├── reports/      #   Report generation components
│   │   │   ├── vehicles/     #   Vehicle-related components
│   │   │   └── ...           #   Feature-specific component folders
│   │   ├── config/           # App config (API URL, pagination, theme, nav)
│   │   ├── hooks/            # Custom React hooks (useAuth, useFilters, etc.)
│   │   ├── layouts/          # Auth layout, dashboard layout shells
│   │   ├── lib/              # Pure utility functions (no React)
│   │   ├── pages/            # Route-level page components
│   │   ├── providers/        # React context providers (Auth, Theme)
│   │   ├── routes/           # Route definitions + ProtectedRoute guard
│   │   ├── services/         # API client + per-feature service modules
│   │   ├── stores/           # Zustand state stores
│   │   ├── types/            # TypeScript interfaces and type exports
│   │   └── validation/       # Zod validation schemas (mirrors backend)
│   │
│   ├── __tests__/            # Frontend tests (Vitest + RTL)
│   ├── public/               # Static assets (favicon, icons)
│   ├── dist/                 # Build output (gitignored)
│   ├── vitest.config.ts      # Test configuration
│   └── vite.config.ts        # Vite build configuration
│
├── backend/ ─────────────────────────── API SERVER
│   │  Node.js + Express + TypeScript
│   │  Run with: cd backend && npm run dev
│   │  Requires: PostgreSQL database
│   │
│   ├── src/
│   │   ├── config/           # Database connection, env config
│   │   ├── controllers/      # Express route handlers
│   │   ├── middleware/        # Auth, RBAC, validation, error handling
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # Business logic layer
│   │   │   └── financial-engine/  # 🔒 Core financial calculations
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/            # Helpers, logger, custom errors
│   │   └── validators/       # Zod request validation schemas
│   │
│   ├── database/             # Database layer
│   │   ├── migrations/       #   14 Knex migration files
│   │   └── seeds/            #   Admin user + master data seeds
│   │
│   ├── __tests__/            # Backend tests (Vitest + Supertest)
│   ├── dist/                 # Build output (gitignored)
│   └── knexfile.ts           # Knex database configuration
│
├── releases/ ────────────────────────── DO NOT MODIFY
│   │  HTML release packages (static handoff)
│   │
│   └── Marc8_HTML_v1.0/      # Versioned HTML release
│       ├── html/              # Static HTML pages
│       ├── css/               # Stylesheets
│       ├── js/                # JavaScript files
│       └── ...                # Release documentation
│
├── Marc8_HTML/ ──────────────────────── DO NOT MODIFY
│   │  HTML working copy (source for releases/)
│   │
│   ├── html/                 # HTML page templates
│   ├── css/                  # CSS source
│   └── ...                   # Supporting assets
│
├── __tests__/ ───────────────────────── TEST DOCS
│   │  Shared test documentation and guides
│   │
│   └── README.md             # How to write and run tests
│
├── docker-compose.yml ───────────────── FULL-STACK DEPLOYMENT
│      Postgres + Backend + Frontend (Nginx)
│
├── Root documentation files:
│   ├── README.md              # ← START HERE
│   ├── GETTING_STARTED.md     # Step-by-step beginner guide
│   ├── PROJECT_MAP.md         # This file
│   ├── CONTRIBUTING.md        # Contribution guidelines
│   ├── DEPLOYMENT.md          # Deployment instructions
│   ├── BRD.md                 # Business Requirements Document
│   ├── PRD.md                 # Product Requirements Document
│   ├── ENGINEERING_STANDARDS.md
│   ├── DATABASE_SCHEMA.md
│   └── ... (certification & audit reports)
│
└── Generated reports (can be safely removed):
    ├── MARC8_FINAL_ENTERPRISE_READINESS_AUDIT.md
    ├── MARC8_RELEASE_1_FINAL_CERTIFICATION.md
    ├── MASTER_DATA_CERTIFICATION.md
    ├── TESTING_FOUNDATION_CERTIFICATION.md
    ├── FINAL_GITHUB_PUBLICATION_REPORT.md
    └── DEVELOPER_DEMO_LOGIN_REPORT.md
```

## Quick Reference

| Question | Answer |
|---|---|
| Where do I write code? | `frontend/src/` or `backend/src/` |
| What should I never touch? | `releases/`, `Marc8_HTML/` |
| Where are tests? | `frontend/__tests__/`, `backend/__tests__/` |
| Where is the API client? | `frontend/src/services/api-client.ts` |
| Where is the auth logic? | `frontend/src/providers/auth-provider.tsx` |
| Where are routes defined? | `frontend/src/routes/` (frontend), `backend/src/routes/` (backend) |
| Where is the database? | `backend/database/migrations/` + `backend/database/seeds/` |
| Where is the financial engine? | `backend/src/services/financial-engine/` |
| How to run without backend? | Use Developer Demo Login |
| How to build for production? | `cd frontend && npm run build` |
| How to deploy? | See `DEPLOYMENT.md` |
