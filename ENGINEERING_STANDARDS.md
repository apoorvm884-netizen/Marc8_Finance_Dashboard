# Engineering Standards — Fleet Financial Dashboard

This document defines the permanent engineering rules for the Fleet Financial Dashboard ERP. Every contributor must follow these standards.

---

## 1. Source of Truth Hierarchy

When conflicts arise, the following hierarchy determines authority:

| Rank | Document | Authority |
|---|---|---|
| 1 | BRD.md | Business Requirements — highest authority |
| 2 | PRD.md | Product Requirements — derived from BRD |
| 3 | Brand_Guidelines.md | Visual and UX standards |
| 4 | BUSINESS_RULES_FREEZE.md | Frozen business rules — do not modify without approval |
| 5 | Technical Architecture (this document) | Engineering standards and patterns |
| 6 | DEPLOY_ANYWHERE.md | Deployment portability requirements |

No document may contradict a higher-ranked document.

---

## 2. Folder Structure Rules

```
/
├── backend/           # Express + Knex API (deployed separately)
│   ├── src/
│   │   ├── config/    # Env vars, database, app config
│   │   ├── controllers/  # Route handlers (thin — delegate to services)
│   │   ├── middleware/    # Auth, RBAC, validation, error handling
│   │   ├── routes/       # Express route definitions
│   │   ├── services/     # Business logic (thick — all logic lives here)
│   │   ├── types/        # TypeScript type definitions
│   │   └── validators/   # Zod validation schemas
│   ├── database/
│   │   ├── migrations/   # Knex migration files (SINGLE SOURCE OF TRUTH)
│   │   └── seeds/        # Seed data
│   └── knexfile.ts
├── frontend/          # Vite + React SPA (deployed separately)
│   ├── public/        # Static assets (copied verbatim to dist)
│   ├── src/
│   │   ├── components/   # React components (one subdir per domain)
│   │   ├── config/       # App configuration (env-derived)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── layouts/      # Page layout components
│   │   ├── pages/        # Route-level page components
│   │   ├── providers/    # React context providers
│   │   ├── routes/       # Route definitions
│   │   ├── services/     # API client and service modules
│   │   ├── stores/       # State management
│   │   ├── types/        # TypeScript type definitions
│   │   └── validation/   # Zod validation schemas
│   └── vite.config.ts
├── docker-compose.yml  # Production-like local deployment
└── ENGINEERING_STANDARDS.md  # This file
```

### Rules
- **One source directory per deployable unit.** `backend/` and `frontend/` are independent.
- **No nested project copies.** Every `package.json` represents exactly one deployable project.
- **No stale or empty directories.** Delete abandoned shells immediately.
- **All database migrations in one place.** Single source of truth: `backend/database/migrations/`.

---

## 3. Environment Variable Policy

### All configuration must come from environment variables.

**Backend** — defined in `backend/src/config/env.ts`:
```typescript
// Required (app crashes if missing):
DATABASE_URL, JWT_SECRET

// Optional (sensible defaults):
PORT (5000), NODE_ENV (development), JWT_EXPIRES_IN (24h),
CORS_ORIGIN (http://localhost:3000), RATE_LIMIT_WINDOW (15),
RATE_LIMIT_MAX (100), LOG_LEVEL (debug)
```

**Frontend** — defined in `frontend/src/config/index.ts`:
```typescript
// Optional (sensible default for same-origin proxy):
VITE_API_URL (/api/v1)
```

### Rules
- No hardcoded URLs, ports, or credentials in source code.
- No `localhost`, `127.0.0.1`, or platform-specific hostnames in source.
- `.env` files are gitignored. Use `.env.example` as template.
- Every env var must have a documented default or throw at startup.
- Frontend env vars must use the `VITE_` prefix (Vite convention).

---

## 4. Deployment Independence Rules

### The application must deploy on any standard hosting without source modification.

Supported platforms (verified):
- ✅ Ubuntu VPS (Nginx, Apache)
- ✅ Docker (via provided Dockerfiles + docker-compose)
- ✅ PM2 process manager
- ✅ Render, Railway
- ✅ Vercel (frontend only, via `vercel.json`)
- ✅ Netlify (frontend only, via `_redirects`)
- ✅ Cloudflare Pages (frontend only, via `_redirects`)

### Rules
- **No provider-specific code.** No Vercel SDKs, Netlify functions, AWS SDKs.
- **No platform-specific configuration in source.** Platform configs (`vercel.json`, `Dockerfile`) are OPTIONAL overlays — the app works without them.
- **SPA routing** must work via standard `index.html` fallback (no platform-specific rewrites baked into the app).
- **API base path** must be configurable via env var, not hardcoded.

---

## 5. Code Quality Rules

### Never hardcode business logic.
- Business rules go in `BUSINESS_RULES_FREEZE.md`.
- Financial calculations go in `backend/src/services/financial-engine/`.
- Route handlers (controllers) must be thin — delegate to services.

### Never hardcode financial calculations.
- All financial logic in `backend/src/services/financial-engine/`.
- Calculations must be unit-testable pure functions.

### Never hardcode user-facing strings.
- Use constants in `frontend/src/config/constants.ts`.

### Patterns to avoid:
```typescript
// ❌ BAD: hardcoded URL
const API_URL = 'http://localhost:5000/api/v1';

// ❌ BAD: hardcoded business rule
if (amount > 10000) { /* approve */ }

// ❌ BAD: hardcoded role/permission
if (user.role === 'admin') { /* grant access */ }
```

### Patterns to follow:
```typescript
// ✅ GOOD: env-derived URL
const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';

// ✅ GOOD: config-driven business rule
const approvalLimit = config.financial.approvalThreshold;
```

---

## 6. TypeScript Rules

### Strict mode is required.

```json
{
  "strict": true,
  "noUnusedLocals": false,
  "noUnusedParameters": false,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "strictNullChecks": true,
  "esModuleInterop": true
}
```

### Additional rules:
- Define shared types in `types/index.ts`.
- Use Zod for runtime validation (backend: validators/, frontend: validation/).
- Avoid `any`. Use `unknown` with type guards when the type is uncertain.
- Use `import type` for type-only imports.
- Every public API endpoint must have a Zod validation schema.

---

## 7. Build Rules

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run build        # tsc — compiles to dist/
npm start            # node dist/src/index.js
npm run migrate      # Knex migrations
npm run seed         # Knex seeds
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run build        # vite build — outputs to dist/
npm run preview      # vite preview — preview production build locally
```

### Rules
- Clean builds must succeed from scratch: `rm -rf node_modules dist && npm install && npm run build`.
- No build warnings in production. Zero warnings = zero regressions.
- TypeScript errors are build failures. Do not bypass with `// @ts-expect-error` without explicit documented reason.

---

## 8. RBAC Rules

Roles are defined in `frontend/src/config/constants.ts`:
```
super_admin > admin > manager > operator > viewer
```

### Backend enforcement:
```typescript
router.get('/users', authorize('super_admin', 'admin'), handler);
```

### Frontend enforcement:
```typescript
const { user } = useAuth();
if (!can(PERMISSIONS.MANAGE_USERS, user?.role)) return <Unauthorized />;
```

### Rules:
- Backend is the authoriative enforcement layer. Frontend is UX only.
- Every protected route must have backend RBAC middleware.
- Permissions are checked in middleware, not in controllers.
- Frontend hides UI elements based on role but must never rely on hiding for security.

---

## 9. Financial Engine Rules

All financial logic in `backend/src/services/financial-engine/`:
```
financial-engine/
├── analytics.service.ts
├── cash-flow.service.ts
├── dashboard-aggregation.service.ts
├── dashboard.service.ts
├── expense.service.ts
├── fleet-analytics.service.ts
├── index.ts
├── notification-engine.service.ts
├── profit.service.ts
└── revenue.service.ts
```

### Rules:
- Every financial calculation must be a pure function (input → output, no side effects).
- No database calls inside calculation functions.
- No HTTP requests inside calculation functions.
- Calculations must be unit-testable independently.
- Currency handling: use integer math (paise/cents), never `Number` for monetary values.
- All financial reports must be auditable (timestamp + user + snapshot).

---

## 10. Database Migration Rules

### Single source of truth: `backend/database/migrations/`

- All migrations (both foundational schema and feature extensions) live here.
- Migration file naming: `YYYYMMDDHHmmss_description.ts` (Knex timestamp format).
- Migrations must be idempotent — running `migrate:latest` twice produces the same schema.
- Never modify a committed migration. Create a new migration for schema changes.
- Seeds go in `backend/database/seeds/` and are idempotent (use `del()` before `insert()`).

### Migration order:
```
001_create_users.ts                  ← Foundation
...
014_financial_ops_enums_and_fields.ts
20240601000001_create_outstandings.ts  ← Phase 6 extensions
...
20240601000007_create_automation_intelligence.ts
```

---

## 11. Testing Rules

### Backend testing requirements:
- Service layer: unit tests for all financial engine calculations.
- Middleware: unit tests for auth, RBAC, validation.
- Controllers: integration tests with mocked services.
- Routes: API contract tests.

### Frontend testing requirements:
- Hooks: unit tests.
- Components: render tests for shared components.
- Pages: smoke tests (renders without crash).
- Validation: schema validation tests.

### Running tests:
```bash
cd backend && npm test      # When test suite is added
cd frontend && npm test     # When test suite is added
```

---

## 12. Documentation Rules

### Required documents:
```
BRD.md                              — Business Requirements Document
PRD.md                              — Product Requirements Document
Brand_Guidelines.md                 — Visual identity
BUSINESS_RULES_FREEZE.md            — Frozen business rules
DEPLOY_ANYWHERE.md                  — Deployment portability guide
ENGINEERING_STANDARDS.md            — This document (engineering rules)
```

### Rules:
- Every phase completion generates a phase report (`PHASE_*.md`).
- Architecture decisions must be documented in `PROJECT_AUDIT.md`.
- Deployment configuration changes must be documented in `DEPLOYMENT_*.md` reports.
- No documentation-only changes without corresponding code changes (and vice versa).

---

## 13. API Convention Rules

### Backend API:
```
Base path: /api/v1
Health:    GET /api/v1/health
```

### Response format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error format:
```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": [ { "field": "email", "message": "Invalid email", "code": "invalid_string" } ]
}
```

### Rules:
- All endpoints prefixed with `/api/v1/`.
- All responses use the same envelope (`success` + `data` or `success` + `message`).
- Pagination: query params `page`, `pageSize`, response includes `total`, `page`, `pageSize`, `totalPages`.
- Error status codes: 400 (validation), 401 (auth), 403 (RBAC), 404 (not found), 409 (conflict), 422 (Zod), 429 (rate limit), 500 (server).

---

## 14. Security Rules

- Helmet middleware enabled on all backend routes.
- CORS configured via `CORS_ORIGIN` env var (never `*` in production).
- Rate limiting on all API routes (env-configurable).
- Auth via JWT Bearer tokens in `Authorization` header.
- Passwords hashed with bcryptjs.
- SQL injection prevented via Knex parameterized queries.
- No secrets in source code — all credentials from env vars.
- Upload file size limited (10mb via Express JSON limit).
- Graceful shutdown on SIGTERM/SIGINT.

---

## 15. Deployment Rules

### Before any deployment:
1. Both builds pass: `backend/ && npm run build` and `frontend/ && npm run build`
2. Environment variables configured per `.env.example`
3. Database migrations run
4. No untracked secrets (check `git status` for accidental `.env` commits)

### Deployment options:
```
Frontend:  Vercel | Netlify | Cloudflare Pages | Nginx | Apache | Docker
Backend:   Ubuntu VPS (PM2) | Render | Railway | Docker
Database:  PostgreSQL (any hosted or self-managed)
```

### No source modification required for any platform.
Platform-specific files (`vercel.json`, `_redirects`, `.htaccess`, `Dockerfile`) are optional enhancements, not requirements.

---

## 16. Never Hardcode Business Logic

Business logic belongs in:
1. `BUSINESS_RULES_FREEZE.md` — frozen, authoritative specification
2. `backend/src/services/` — implementation in TypeScript
3. `backend/src/services/financial-engine/` — financial calculations

Frontend must never contain business logic. Frontend displays data and sends user input to the API. All decisions, validations, and calculations happen on the backend.

---

## 17. Never Hardcode Financial Calculations

Financial calculations live exclusively in `backend/src/services/financial-engine/`. Each module is a pure function that takes inputs and returns outputs. No database access, no HTTP calls, no side effects.

Financial engine modules:
- `revenue.service.ts` — Revenue calculations
- `expense.service.ts` — Expense calculations
- `profit.service.ts` — Profit/Loss calculations
- `cash-flow.service.ts` — Cash flow calculations
- `analytics.service.ts` — Financial analytics
- `fleet-analytics.service.ts` — Fleet-specific metrics
- `dashboard-aggregation.service.ts` — Dashboard aggregation
- `dashboard.service.ts` — Dashboard metrics
- `notification-engine.service.ts` — Financial notifications
