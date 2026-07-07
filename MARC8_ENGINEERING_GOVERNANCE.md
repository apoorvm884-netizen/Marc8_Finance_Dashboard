# Marc8 Engineering Governance

**Permanent Engineering Constitution — Marc8 Fleet Financial ERP**

| Attribute | Value |
|---|---|
| **Document Version** | 1.0.0 |
| **Effective Date** | 2026-07-07 |
| **Status** | Ratified — Revision requires Architecture Board approval |
| **Applies To** | All code, documentation, infrastructure, and process within the Marc8 Fleet Financial ERP monorepo |

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Source of Truth Hierarchy](#2-source-of-truth-hierarchy)
3. [Folder Standards](#3-folder-standards)
4. [Naming Conventions](#4-naming-conventions)
5. [API Standards](#5-api-standards)
6. [UI Standards](#6-ui-standards)
7. [Component Standards](#7-component-standards)
8. [Accessibility Standards](#8-accessibility-standards)
9. [Financial Engine Rules](#9-financial-engine-rules)
10. [Database Migration Policy](#10-database-migration-policy)
11. [Git Branching Strategy](#11-git-branching-strategy)
12. [Release Strategy](#12-release-strategy)
13. [Versioning Policy](#13-versioning-policy)
14. [Code Review Checklist](#14-code-review-checklist)
15. [Testing Requirements](#15-testing-requirements)
16. [Definition of Done](#16-definition-of-done)
17. [Deployment Policy](#17-deployment-policy)
18. [Security Policy](#18-security-policy)
19. [Performance Budgets](#19-performance-budgets)
20. [Future AI Integration Standards](#20-future-ai-integration-standards)
21. [Rules That MUST NEVER Be Violated](#21-rules-that-must-never-be-violated)

---

## 1. Project Vision

### 1.1 Mission Statement

Marc8 Fleet Financial ERP is a centralized financial command center for Eightlines Fleet Private Limited. It provides real-time visibility into fleet revenue, platform settlements, vehicle utilisation, operational costs, and profitability across owned and co-hosted fleet assets.

### 1.2 Core Tenets

- **Single Source of Financial Truth:** Every rupee transacted across Zoomcar, Revv, Bharat Cars, Offline, and Marc8 channels is reconciled, tracked, and auditable in one system.
- **Role-Appropriate Access:** Five hierarchical roles (super_admin, admin, manager, operator, viewer) see only the data and actions they need.
- **Financial Engine Purity:** All monetary calculations are computed by a dedicated, isolated financial engine — never in controllers, never in the frontend.
- **Platform Agnosticism:** The system runs on any standard hosting without source modification.
- **Static HTML Viability:** A fully functional static HTML version exists alongside the React SPA, ensuring backend integration can proceed without the React build chain.

### 1.3 Users

| Persona | Role in System | Primary Concern |
|---|---|---|
| Syed Fardeen (CEO) | super_admin | Strategic P&L, macro fleet health |
| Numer Saqlain M (CFBO) | super_admin | Cash flow, auditing, financial controls |
| Mohammed Azam (MD) | admin | Asset onboarding, yield assessment |
| Shaik Afnan Sabil (Journal Mgr) | manager | Bookings, expenses, daily operations |
| Afreen / Faryal (Accountants) | manager | Ledger entries, tax processing, payouts |
| Md Junaid Khan (COO) | operator | Ground ops, service tracking, breakdowns |

---

## 2. Source of Truth Hierarchy

When conflicts arise between documents or artifacts, the following hierarchy determines authority. A lower-rank document must never contradict a higher-rank document.

| Rank | Document / Artifact | Authority | Change Authority |
|---|---|---|---|
| 1 | `BRD.md` | Business Requirements — highest authority | CEO + CFBO approval |
| 2 | `PRD.md` | Product Requirements — derived from BRD | Product Owner approval |
| 3 | `Brand_Guidelines.md` | Visual identity, voice, tone | Brand team (Beeezy) |
| 4 | `BUSINESS_RULES_FREEZE.md` | Frozen business rules — invariants | Architecture Board (unanimous) |
| 5 | `MARC8_ENGINEERING_GOVERNANCE.md` | This document — engineering constitution | Architecture Board (unanimous) |
| 6 | `ENGINEERING_STANDARDS.md` | Technical standards and patterns | Lead Engineer approval |
| 7 | `FRONTEND_API_CONTRACT.md` | API contract between frontend and backend | Lead Engineer + API team |
| 8 | `DATABASE_SCHEMA.md` | Database schema specification | Database lead approval |
| 9 | `DEPLOY_ANYWHERE.md` | Deployment portability requirements | DevOps lead approval |
| 10 | Code (implementation) | Actual source code | Code review |

### 2.1 Conflict Resolution Process

1. Identify the highest-ranked document that speaks to the conflict.
2. If the conflict is between two documents at the same rank, the document with the later modification date prevails.
3. Resolve ambiguity by escalating to the next rank's change authority.
4. Document the resolution in `PROJECT_AUDIT.md` with a timestamp and rationale.

### 2.2 Phase Reports

Phase reports (`PHASE_*.md`) are informational records of completed work. They do not carry authority in the hierarchy. If a phase report contradicts a higher-ranked document, the higher-ranked document prevails and the phase report should be corrected.

---

## 3. Folder Standards

### 3.1 Monorepo Layout

The repository is a flat monorepo with exactly three deployable units plus supporting assets:

```
/
├── backend/                     # Express + Knex + TypeScript API
│   ├── src/
│   │   ├── config/              # env.ts, database.ts, constants.ts
│   │   ├── controllers/         # Thin route handlers (delegate to services)
│   │   ├── middleware/          # auth, rbac, validate, error-handler, audit, rate-limiter
│   │   ├── routes/              # Express route definitions (one per domain)
│   │   ├── services/            # Business logic (thick layer)
│   │   │   └── financial-engine/  # Financial calculation pure functions
│   │   ├── types/               # TypeScript type definitions
│   │   ├── utils/               # errors.ts, helpers.ts, logger.ts, response.ts
│   │   └── validators/          # Zod schemas (one per domain)
│   ├── database/
│   │   ├── migrations/          # SINGLE SOURCE OF TRUTH for schema
│   │   └── seeds/               # Seed data (idempotent)
│   ├── knexfile.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/                    # Vite + React 19 + Tailwind 4 SPA
│   ├── public/                  # Copied verbatim to dist
│   ├── src/
│   │   ├── app/                 # Root component, router setup
│   │   ├── components/          # One subdirectory per domain (bookings/, dashboard/, etc.)
│   │   │   ├── shared/          # Reusable generic components (DataTable, Drawer, etc.)
│   │   │   └── ui/              # Shadcn UI primitives (button, input, dialog, etc.)
│   │   ├── config/              # constants.ts, navigation.ts
│   │   ├── hooks/               # Custom React hooks
│   │   ├── layouts/             # auth-layout, dashboard-layout
│   │   ├── lib/                 # Utility modules (utils.ts)
│   │   ├── pages/               # Route-level page components
│   │   ├── providers/           # React context providers
│   │   ├── routes/              # Route definitions, protected-route
│   │   ├── services/            # API client + frontend service modules
│   │   ├── stores/              # State management
│   │   ├── types/               # TypeScript type definitions
│   │   └── validation/          # Client-side Zod schemas
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── Marc8_HTML/                  # Static HTML version (vanilla HTML/CSS/JS)
│   ├── css/                     # 10 CSS files (design system)
│   │   ├── brand.css            # Design tokens (CSS custom properties)
│   │   ├── base.css             # Reset and typography
│   │   ├── layout.css           # Sidebar, navbar, grid layouts
│   │   ├── components.css       # Buttons, cards, modals, dropdowns
│   │   ├── dashboard.css        # Dashboard-specific styles
│   │   ├── tables.css           # Data table and pagination styles
│   │   ├── forms.css            # Form and validation styles
│   │   ├── charts.css           # Chart containers and tooltips
│   │   ├── utilities.css        # Utility classes and animations
│   │   └── responsive.css       # Three breakpoint media queries
│   ├── js/
│   │   ├── data.js              # Mock data store (replace with API calls)
│   │   └── app.js               # All interactivity (retain as-is)
│   ├── html/                    # 33 HTML pages
│   └── favicon.svg
│
├── releases/                    # Release packages
│   └── Marc8_HTML_v1.0/         # Versioned release directories
│
├── docker-compose.yml            # 3-service stack: db + backend + frontend
├── vercel.json                   # Vercel deployment config (optional overlay)
│
└── *.md                          # Documentation root (BRD, PRD, governance, reports)
```

### 3.2 Rules

- **Exactly one `package.json` per deployable unit.** No nested project copies.
- **All database migrations in one directory.** `backend/database/migrations/` is the single source of truth. No inline schema definitions elsewhere.
- **No stale or empty directories.** Delete abandoned shells immediately upon discovery.
- **No source files outside `backend/`, `frontend/`, or `Marc8_HTML/`.** Documentation markdown files may live at root.
- **HTML release mirrors are exact copies.** `releases/Marc8_HTML_v*` must be functionally identical to `Marc8_HTML/` at the time of release.
- **Release packages are write-once.** Never modify a tagged release directory. Bug fixes produce a new release version.

---

## 4. Naming Conventions

### 4.1 Backend (TypeScript)

| Artifact | Convention | Example |
|---|---|---|
| Files | `kebab-case.type.ts` | `booking.service.ts`, `auth.routes.ts` |
| Classes | `PascalCase` | `FinancialEngine`, `AuthService` |
| Functions | `camelCase` | `getBookings()`, `calculateNetRevenue()` |
| Variables | `camelCase` | `totalRevenue`, `pageSize` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_PAGE_SIZE`, `JWT_EXPIRES_IN` |
| Types/Interfaces | `PascalCase` | `Booking`, `CreateBookingDto` |
| Enums | `PascalCase` | `BookingStatus`, `UserRole` |
| Enum values | `UPPER_SNAKE_CASE` | `BookingStatus.COMPLETED` |
| Database columns | `snake_case` | `created_at`, `gross_fare`, `platform_commission` |
| Database tables | `snake_case` (plural) | `users`, `booking_records`, `audit_logs` |
| Route files | `kebab-case.routes.ts` | `booking.routes.ts` |
| Controller files | `kebab-case.controller.ts` | `booking.controller.ts` |
| Service files | `kebab-case.service.ts` | `booking.service.ts` |
| Validator files | `kebab-case.ts` | `booking.ts` |
| Knex migration files | `YYYYMMDDHHmmss_description.ts` | `20240601000001_create_outstandings.ts` |

### 4.2 Frontend (TypeScript/React)

| Artifact | Convention | Example |
|---|---|---|
| Files | `kebab-case.tsx` | `booking-form.tsx`, `data-table.tsx` |
| React components | `PascalCase` | `BookingForm`, `DataTable` |
| Page components | `PascalCase` (match route) | `BookingsPage`, `DashboardPage` |
| Custom hooks | `useCamelCase` | `useAuth`, `useDebounce`, `usePagination` |
| CSS classes | `kebab-case` | `btn-primary`, `stat-card`, `kpi-value` |
| CSS custom properties | `--kebab-case` | `--essence`, `--accent`, `--surface` |
| Service modules | `kebab-case.service.ts` | `booking.service.ts` |
| Type files | `kebab-case.ts` | `booking.ts` |
| Validation files | `kebab-case.ts` | `booking.ts` |
| Providers | `PascalCase` | `AuthProvider`, `ThemeProvider` |

### 4.3 Static HTML (Marc8_HTML)

| Artifact | Convention | Example |
|---|---|---|
| HTML files | `kebab-case.html` | `journal-ledger.html`, `expense-categories.html` |
| CSS files | `kebab-case.css` | `brand.css`, `components.css` |
| JS files | `kebab-case.js` | `data.js`, `app.js` |
| `data-page` attribute | `kebab-case` | `data-page="journal-ledger"` |
| CSS classes | `kebab-case` | Same as frontend convention |

### 4.4 General Rules

- **No Hungarian notation.** Do not prefix variables with types (`strName`, `arrItems`).
- **No trailing underscores** except for internal module state.
- **Abbreviations:** Use sparingly. `API` is acceptable; `calcNetRev` is not (use `calculateNetRevenue`).
- **Booleans:** Prefix with `is`, `has`, `can`, or `should` (`isActive`, `hasErrors`, `canEdit`).
- **IDs:** Use `camelCase` in TypeScript/React, `snake_case` in database columns, `kebab-case` in HTML attributes.

---

## 5. API Standards

### 5.1 Base URL

```
Production: /api/v1/*
Development: /api/v1/*
```

The base path is configurable via `VITE_API_URL` env var. It must never be hardcoded as `localhost` or `127.0.0.1`.

### 5.2 Standard Response Envelope

Every API response uses the same envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable message"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [
    { "field": "email", "message": "Invalid email format", "code": "invalid_string" }
  ]
}
```

### 5.3 Paginated Responses

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Query parameters: `?page=1&pageSize=20&sortBy=created_at&sortOrder=desc&search=term&status=active`

### 5.4 HTTP Status Codes

| Code | When to Use |
|---|---|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no content) |
| 400 | Validation failure (missing/invalid fields) |
| 401 | Missing or invalid authentication |
| 403 | Authenticated but insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate, state violation) |
| 422 | Zod validation error |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

### 5.5 Endpoint Naming

- **Collections:** `GET /api/v1/bookings` (plural noun)
- **Single resource:** `GET /api/v1/bookings/:id`
- **Create:** `POST /api/v1/bookings`
- **Update:** `PUT /api/v1/bookings/:id`
- **Partial update:** `PATCH /api/v1/bookings/:id`
- **Delete (soft):** `DELETE /api/v1/bookings/:id`
- **Restore:** `POST /api/v1/bookings/:id/restore`
- **Custom actions:** `POST /api/v1/bookings/:id/approve`

### 5.6 Input Validation

Every mutation endpoint MUST validate input through a Zod schema before processing. Validation errors must return field-level messages in the standard error format.

### 5.7 Rate Limiting

Every endpoint is rate-limited via `express-rate-limit`. Limits are configurable through environment variables. Default: 100 requests per 15-minute window per IP.

---

## 6. UI Standards

### 6.1 Design System

The Marc8 design system is defined by CSS custom properties in `brand.css` and `Brand_Guidelines.md`:

| Token | Value | Usage |
|---|---|---|
| `--essence` | `#183eeb` | Primary actions, links, technology feel |
| `--accent` | `#ff7200` | Highlights, engagement, momentum |
| `--dark-navy` | `#000250` | Backgrounds, credibility, stability |
| `--surface` | Dark surface tones | Cards, sidebars, content areas |
| `--financial-green` | Positive financial indicators |
| `--financial-red` | Negative financial indicators |

### 6.2 Theme

- **Dark theme only.** No light mode is supported.
- **Glass morphism:** Use `.glass`, `.glass-card`, `.glass-surface` for depth.
- **Typography:** Manrope for headings, Inter for body (Google Fonts).

### 6.3 Layout

- **Sidebar:** Fixed left (64px collapsed, 256px expanded). Collapsed state is persisted in `localStorage`.
- **Navbar:** Fixed top. Contains search bar, notification bell, user menu.
- **Content area:** Scrollable main area between sidebar and navbar.
- **Responsive breakpoints:**
  - Mobile: `<=640px` — Sidebar hidden, full-width tables
  - Tablet: `641-1024px` — 2-column grids
  - Desktop: `>=1025px` — Full multi-column layout

### 6.4 Form Standards

- Every form must provide visual validation feedback (red borders, error text below fields).
- Submit buttons must show loading state during submission.
- Disabled form fields must have a distinct visual style.
- Date pickers must use a unified date-time widget.
- Searchable dropdowns must be used for vehicle selection and platform selection.

### 6.5 Table Standards

- Server-side pagination, sorting, and filtering.
- Every table must show total record count.
- Empty states with helpful messages are required.
- Sortable columns indicate direction with an icon.
- Status columns use colored badges.

### 6.6 Banner/Toast Standards

- 4 toast types: `success` (green), `error` (red), `warning` (amber), `info` (blue).
- Auto-dismiss after 5 seconds for success/info, persistent for error/warning until user dismisses.
- Stacked toasts supported (up to 5 visible).

---

## 7. Component Standards

### 7.1 React Component Structure

```
src/components/domain-name/
├── domain-component.tsx   # Primary component
├── index.ts              # Re-export barrel file
```

### 7.2 Component Rules

- **One component per file** (except for trivial sub-components in the same file).
- **Named exports preferred** over default exports for components.
- **Props interface defined above the component** with `PascalCase + Props` naming.
- **Destructure props** at the function signature.
- **Avoid prop drilling** beyond 3 levels — use context or store.
- **All components should be typed.** Avoid `any` in props.
- **Memoize expensive computations** with `useMemo` and `useCallback`.

### 7.3 Shared Components (in `components/shared/`)

These are reusable across domains:

- `DataTable` — Generic table with sort, search, filter, pagination
- `Drawer` — Slide-in panel for forms and detail views
- `ConfirmationDialog` — Action confirmation with cancel/confirm
- `PageHeader` — Consistent page titles and breadcrumbs
- `MetricCard` — KPI display card
- `ChartCard` — Chart container with title
- `SearchInput` — Debounced search input
- `Pagination` — Page navigation controls
- `EmptyState` — Empty data illustration with message
- `ErrorState` — Error display with retry
- `ErrorBoundary` — Component crash boundary
- `Breadcrumb` — Navigation breadcrumb trail
- `CommandPalette` — Ctrl+K command search

### 7.4 UI Primitives (in `components/ui/`)

Shadcn UI primitives with Radix UI underpinnings. Do not modify these directly — extend via composition or custom components.

### 7.5 Static HTML Component Rules (Marc8_HTML)

The static HTML version uses a simplified component model:

- **All interactivity in `app.js`.** No separate JS files per page.
- **Data in `data.js`.** Single mock data provider.
- **Page identity via `data-page` attribute.** `app.js` dispatches to page-specific initializers using this attribute.
- **Reusable patterns:** `initTable()`, `renderBarChart()`, `renderPieChart()`, `openModal()`, `openDrawer()`, `showToast()` are global functions.
- **No build step.** All files are served as-is.

---

## 8. Accessibility Standards

### 8.1 Minimum Requirements

- **All interactive elements must be keyboard accessible.**
- **All form inputs must have associated labels.**
- **Color is never the sole indicator of state.** Use icons, text, or patterns alongside color.
- **Focus indicators must be visible.** Use `focus-visible` for keyboard-only focus rings.
- **Images must have `alt` text** (or `alt=""` for decorative images).
- **Skip-to-content link** must be the first focusable element on every page.

### 8.2 ARIA

- Use semantic HTML elements (`<nav>`, `<main>`, `<header>`, `<footer>`) over generic `<div>`s.
- Use `aria-label` or `aria-labelledby` on interactive regions that lack visible labels.
- Use `aria-expanded` on expandable controls.
- Use `aria-current="page"` on active navigation items.
- Use `role="alert"` for dynamically appearing error messages.
- Use `role="status"` for live region updates.

### 8.3 Color Contrast

- All text must meet WCAG 2.1 AA contrast ratios (4.5:1 for normal text, 3:1 for large text).
- Financial colors (green/red) must maintain sufficient contrast against dark backgrounds.

### 8.4 Reduced Motion

- Respect `prefers-reduced-motion`. Disable or reduce animations when the user setting is active.
- All animations must have a `@media (prefers-reduced-motion: no-preference)` guard.

---

## 9. Financial Engine Rules

### 9.1 Isolation

All financial calculations MUST live exclusively in `backend/src/services/financial-engine/`. No controller, service, utility, or frontend component may calculate financial values directly.

### 9.2 Directory

```
financial-engine/
├── index.ts
├── revenue.service.ts           # Net revenue, commission calculations
├── expense.service.ts            # Expense aggregation, cost analysis
├── profit.service.ts             # P&L per vehicle, per platform, aggregate
├── cash-flow.service.ts          # Cash flow forecasting
├── analytics.service.ts          # Financial analytics & trends
├── fleet-analytics.service.ts    # Fleet-specific metrics
├── dashboard-aggregation.service.ts  # Dashboard KPI aggregation
├── dashboard.service.ts          # Dashboard metrics computation
├── notification-engine.service.ts    # Financial alerts and reminders
```

### 9.3 Pure Function Mandate

Every financial engine function MUST be a pure function (input → output, no side effects):

```typescript
// ✅ CORRECT
function calculateNetRevenue(grossFare: number, doorstepCharges: number, commission: number): number {
  return grossFare + doorstepCharges - commission;
}
```

```typescript
// ❌ WRONG — side effects
function calculateNetRevenue(booking: Booking): number {
  const result = booking.grossFare + booking.doorstepCharges - booking.commission;
  booking.netRevenue = result;  // Side effect!
  return result;
}
```

### 9.4 Rules

- **No database calls** inside calculation functions.
- **No HTTP requests** inside calculation functions.
- **No global state access** inside calculation functions.
- **Currency handling:** Use integer math (paise/cents) for monetary values. Never use floating-point `Number` for financial calculations.
- **All financial reports must be auditable:** Include timestamp, user, and data snapshot.
- **Every calculation must be unit-testable independently.**
- **Net revenue formula is immutable:** `net_revenue = gross_fare + doorstep_charges - platform_commission`

---

## 10. Database Migration Policy

### 10.1 Single Source of Truth

`backend/database/migrations/` is the sole authoritative source for the database schema. No inline schema definitions, no raw SQL files elsewhere, no ORM-driven schema generation.

### 10.2 File Naming

```
YYYYMMDDHHmmss_description.ts
```

Examples:
- `20240601000001_create_outstandings.ts`
- `20240601000007_create_automation_intelligence.ts`

### 10.3 Rules

- **Migrations must be idempotent.** Running `knex migrate:latest` twice produces the same schema.
- **Never modify a committed migration.** If a schema change is needed, create a new migration.
- **Never squash or rebase migrations** after they have been applied to any environment.
- **Seeds must be idempotent.** Use `.del()` before `.insert()`.
- **Down migrations are optional** but recommended for dev environments.
- **Every migration must have a corresponding entry in `DATABASE_SCHEMA.md`** updated before release.

### 10.4 Columns Required on All Primary Entity Tables

- `id` — UUID, `gen_random_uuid()`, primary key
- `created_at` — timestamp, default `now()`
- `updated_at` — timestamp, default `now()`
- `created_by` — UUID, nullable, FK to `users(id)`
- `updated_by` — UUID, nullable, FK to `users(id)`
- `deleted_at` — timestamp, nullable (soft delete)
- `deleted_by` — UUID, nullable, FK to `users(id)`

### 10.5 Monetary Columns

All monetary value columns MUST be `DECIMAL(12,2)`. Never use `FLOAT`, `INTEGER`, or `VARCHAR` for monetary values.

---

## 11. Git Branching Strategy

### 11.1 Branch Model

```
main                    # Production — always deployable
  └── develop           # Integration branch — feature complete
       ├── feat/*       # Feature branches (merged to develop)
       ├── fix/*        # Bug fix branches (merged to develop)
       ├── refactor/*   # Refactoring branches (merged to develop)
       └── docs/*       # Documentation branches (merged to develop)
```

### 11.2 Branch Naming

| Prefix | Purpose | Example |
|---|---|---|
| `feat/` | New feature | `feat/booking-export` |
| `fix/` | Bug fix | `fix/null-date-crash` |
| `refactor/` | Code refactoring | `refactor/engine-modules` |
| `docs/` | Documentation only | `docs/governance-v2` |
| `release/` | Release preparation | `release/v1.1.0` |
| `hotfix/` | Emergency production fix | `hotfix/auth-bypass` |

### 11.3 Rules

- **`main` must always be deployable.** No broken builds, no WIP code, no debug statements.
- **All branches except `main` and `develop` are ephemeral.** Delete after merge.
- **No direct commits to `main` or `develop`.** Use pull requests.
- **Feature branches branch from `develop`, merge back to `develop`.**
- **Hotfix branches branch from `main`, merge to both `main` and `develop`.**
- **Release branches branch from `develop`, merge to `main` and back to `develop`.**
- **Signed commits are required** for `main` branch.
- **Commit messages:** `type(scope): description` — e.g., `feat(booking): add CSV export`, `fix(journal): handle null date`.

### 11.4 Pull Request Requirements

- Title must follow conventional commit format.
- Description must explain what and why (not how).
- Must reference the issue/ticket number.
- Must pass CI (typecheck + lint + build).
- Must have at least one approving review.
- No PR may introduce new TypeScript errors or lint warnings.

---

## 12. Release Strategy

### 12.1 Release Cadence

| Type | Cadence | Process |
|---|---|---|
| Major | Quarterly (or as needed) | release/ branch from develop, feature complete, full QA cycle |
| Minor | Monthly | release/ branch from develop, scoped feature set, QA cycle |
| Patch | As needed (bug fixes) | cherry-pick fixes to main, tag |
| Hotfix | Emergency | hotfix/ branch from main, expedited review |

### 12.2 Release Process

1. Create `release/vX.Y.Z` from `develop`.
2. Run full test suite and QA audit.
3. Generate `RELEASE_NOTES_vX.Y.Z.md`.
4. Create release package in `releases/` directory.
5. Tag commit on `main` with `vX.Y.Z`.
6. Merge `release/` into `main` and back into `develop`.

### 12.3 Release Package Contents

```
releases/Marc8_HTML_vX.Y.Z/
├── README.md
├── RELEASE_NOTES_vX.Y.Z.md
├── FRONTEND_API_CONTRACT.md
├── DEVELOPER_INTEGRATION_GUIDE.md
├── HTML_RUNTIME_VERIFICATION_REPORT.md  (if HTML release)
├── favicon.svg
├── css/              (10 files)
├── js/               (data.js + app.js)
└── html/             (33 pages)
```

### 12.4 Release Checklist

- [ ] All tests pass (backend + frontend)
- [ ] TypeScript builds with zero errors
- [ ] Lint passes with zero warnings
- [ ] API contract is current
- [ ] Database migrations are final
- [ ] `DATABASE_SCHEMA.md` is updated
- [ ] `RELEASE_NOTES_vX.Y.Z.md` is generated
- [ ] HTML runtime verification (if HTML release): 33/33 pages, 0 console errors, 0 broken links
- [ ] Release package is zipped and committed to `releases/`
- [ ] Tag is pushed to remote
- [ ] Deployment is verified on staging

---

## 13. Versioning Policy

### 13.1 SemVer

Marc8 follows strict Semantic Versioning: `MAJOR.MINOR.PATCH`

| Component | MAJOR | MINOR | PATCH |
|---|---|---|---|
| Frontend (React) | Breaking UI change | Feature addition | Bug fix |
| Frontend (HTML) | Breaking HTML structure | New page/module | Bug fix |
| Backend API | Breaking API contract change | New endpoint/field | Bug fix |
| Database | Breaking schema change | New table/column | Migration fix |
| Documentation | Restructure | New section | Correction |

### 13.2 Version Sources

| Artifact | Location |
|---|---|
| Backend | `backend/package.json` → `version` |
| Frontend (React) | `frontend/package.json` → `version` |
| Frontend (HTML) | `releases/Marc8_HTML_vX.Y.Z/` directory name |
| API contract | `FRONTEND_API_CONTRACT.md` header |

### 13.3 API Versioning

The API version is embedded in the URL path: `/api/v1/`. Backward-incompatible changes require a new API version (`/api/v2/`).

- **Additive changes** (new fields, new endpoints) do NOT require a new API version.
- **Breaking changes** (renamed fields, removed endpoints, changed response structure) DO require a new API version.
- **Deprecated endpoints** must remain functional for at least one minor version cycle before removal.
- Deprecated endpoints return a `Sunset` header with the removal date.

---

## 14. Code Review Checklist

Every pull request must be evaluated against this checklist before merging.

### 14.1 Correctness

- [ ] Does the code do what it says it does?
- [ ] Are edge cases handled (empty state, null, undefined, error)?
- [ ] Are there any race conditions or timing issues?
- [ ] Does the code handle concurrent modifications safely?

### 14.2 Architecture

- [ ] Does the code follow the Source of Truth hierarchy?
- [ ] Does it respect the Financial Engine isolation rule?
- [ ] Are controllers thin? Is business logic in services?
- [ ] Are frontend calculations avoided (delegate to API)?
- [ ] Is the code in the correct directory?

### 14.3 Business Rules

- [ ] Does the code respect `BUSINESS_RULES_FREEZE.md` invariants?
- [ ] Are completed booking financial fields protected from modification?
- [ ] Are paid outstandings protected from modification?
- [ ] Is soft delete used instead of hard delete?
- [ ] Is an audit trail created for every CUD operation?

### 14.4 API Contract

- [ ] Do new/ modified endpoints follow the standard response envelope?
- [ ] Are paginated responses using the `meta` object?
- [ ] Is input validated with Zod?
- [ ] Is RBAC enforced via `authorize()` middleware?
- [ ] Is the `FRONTEND_API_CONTRACT.md` updated?

### 14.5 Security

- [ ] Are there any secrets, passwords, or tokens in the code?
- [ ] Is user input sanitized / escaped?
- [ ] Are SQL queries parameterized (Knex)?
- [ ] Is rate limiting applied?
- [ ] Are error messages safe (no stack traces leaked)?
- [ ] Is CORS properly configured?

### 14.6 TypeScript

- [ ] Does the code compile with `strict: true`?
- [ ] Are there any `any` types that can be replaced with `unknown`?
- [ ] Are `import type` used for type-only imports?
- [ ] Are Zod schemas defined for new endpoints?

### 14.7 Testing

- [ ] Are there tests for new functionality?
- [ ] Do existing tests still pass?
- [ ] Are financial engine functions unit-tested as pure functions?
- [ ] Are validation schemas tested?

### 14.8 Performance

- [ ] Are N+1 queries avoided?
- [ ] Are database queries indexed?
- [ ] Are large lists paginated?
- [ ] Are expensive computations memoized?

### 14.9 Compliance

- [ ] Does the code meet accessibility standards?
- [ ] Are brand guidelines followed?
- [ ] Are naming conventions followed?
- [ ] Are folder structure rules followed?

---

## 15. Testing Requirements

### 15.1 Test Pyramid

```
    /\        E2E Tests (future)
   /  \       Integration Tests
  /    \      Service/API Tests
 /______\     Unit Tests (foundation)
```

### 15.2 Backend Testing

| Layer | Framework | Coverage Target | What to Test |
|---|---|---|---|
| Financial Engine | Vitest / Jest | 100% | Every pure function, edge cases, precision |
| Services | Vitest / Jest | 90% | Business logic, error paths |
| Middleware | Vitest / Jest | 90% | Auth, RBAC, validation, rate limiting |
| Controllers | Supertest | 80% | Request/response, status codes, error formats |
| Validators | Vitest / Jest | 100% | Every Zod schema, valid/invalid inputs |
| Routes (integration) | Supertest | 70% | Full request lifecycle |

### 15.3 Frontend Testing

| Layer | Framework | Coverage Target | What to Test |
|---|---|---|---|
| Hooks | Vitest + React Testing Library | 80% | Hook behavior, state transitions |
| Shared components | Vitest + React Testing Library | 80% | Render, props, user interactions |
| Pages | Vitest + React Testing Library | 60% | Render without crash, data display |
| Validation schemas | Vitest | 100% | Every Zod schema |
| Service modules | Vitest | 80% | API client calls, error handling |

### 15.4 Static HTML Testing

| Test | Tool | Requirement |
|---|---|---|
| Console errors | Chrome Headless | 0 across all 33 pages |
| Runtime exceptions | Chrome Headless | 0 across all 33 pages |
| Broken links | Link checker | 0 across all internal navigation |
| Duplicate IDs | HTML validator | 0 across all files |
| CSS syntax | CSS validator | 0 errors across all 10 CSS files |
| JS syntax | `node -c` | Passes for `data.js` and `app.js` |

### 15.5 Mandatory Gates

- **Zero TypeScript errors** allowed in any commit.
- **Zero lint warnings** allowed in any commit.
- **Clean build** from scratch: `rm -rf node_modules dist && npm install && npm run build`.
- **No `// @ts-expect-error`** without an explicit documented reason in the same comment.

---

## 16. Definition of Done

A task, feature, or bug fix is considered **Done** only when all of the following criteria are met:

### 16.1 Code Complete

- [ ] Code is written and follows all governance standards
- [ ] No TODO, FIXME, HACK, or DEBUG comments remain
- [ ] No commented-out code remains
- [ ] No `console.log` or debugger statements remain
- [ ] All new code is covered by appropriate tests

### 16.2 Build & Lint

- [ ] Backend builds with zero TypeScript errors
- [ ] Frontend builds with zero TypeScript errors
- [ ] Backend lint passes with zero warnings
- [ ] Frontend lint passes with zero warnings
- [ ] Clean build from scratch succeeds

### 16.3 Tests

- [ ] New feature has unit tests
- [ ] All existing tests still pass
- [ ] Financial engine functions have pure-function unit tests
- [ ] Zod validation schemas have schema tests

### 16.4 Documentation

- [ ] `FRONTEND_API_CONTRACT.md` is updated for new/modified endpoints
- [ ] `DATABASE_SCHEMA.md` is updated for new/modified tables
- [ ] Phase report is generated (if applicable)
- [ ] JSDoc or inline comments for non-obvious logic

### 16.5 Review

- [ ] Code review is completed and approved
- [ ] All items on the Code Review Checklist (§14) pass
- [ ] Business rules are not violated

### 16.6 Integration

- [ ] Branch is up to date with `develop`
- [ ] No merge conflicts
- [ ] CI pipeline passes
- [ ] If HTML release: 33/33 pages verified with 0 console errors

---

## 17. Deployment Policy

### 17.1 Supported Targets

The application must deploy on any standard hosting without source modification:

| Target | Frontend | Backend | Database |
|---|---|---|---|
| Ubuntu VPS (Nginx/Apache) | ✅ | ✅ | ✅ |
| Docker (docker-compose) | ✅ | ✅ | ✅ |
| PM2 process manager | — | ✅ | — |
| Vercel | ✅ | — | — |
| Netlify | ✅ | — | — |
| Cloudflare Pages | ✅ | — | — |
| Render | ✅ | ✅ | — |
| Railway | ✅ | ✅ | — |

### 17.2 Provider-Specific Config

Provider-specific configuration files (`vercel.json`, `Dockerfile`, `_redirects`, `.htaccess`) are **optional overlays**. The application must work correctly without them.

### 17.3 Pre-Deployment Checklist

- [ ] Backend build: `cd backend && npm run build` succeeds
- [ ] Frontend build: `cd frontend && npm run build` succeeds
- [ ] Environment variables configured (copy `.env.example` to `.env`)
- [ ] Database migrations run: `npx knex migrate:latest`
- [ ] Database seeds run: `npx knex seed:run`
- [ ] No untracked secrets: `git status` checked for accidental `.env`
- [ ] Health endpoint responds: `GET /api/v1/health` returns 200

### 17.4 Docker Deployment

Three-service stack defined in `docker-compose.yml`:
1. `db` — PostgreSQL 16 Alpine
2. `backend` — Express API (Node.js)
3. `frontend` — Nginx serving built SPA

### 17.5 Rollback Procedure

1. Revert to previous deployment: `docker-compose down && docker-compose up -d` (with previous images).
2. If database migration is the issue, rollback: `npx knex migrate:rollback`.
3. If frontend issue, redeploy previous build artifact.
4. Document the rollback trigger and resolution in `PROJECT_AUDIT.md`.

---

## 18. Security Policy

### 18.1 Authentication

- **JWT-based auth** with access + refresh token pattern.
- Access token expiry: 24 hours (configurable via `JWT_EXPIRES_IN`).
- Refresh tokens stored in `sessions` table, revocable.
- Passwords hashed with **bcryptjs** (cost factor: 10+).
- Default credentials exist only in documentation, never in production.
- Login rate limiting: 5 attempts per minute per IP.

### 18.2 Authorization (RBAC)

- Five roles: `super_admin > admin > manager > operator > viewer`.
- Backend is the authoritative enforcement layer. Frontend hiding is UX-only.
- Every non-public endpoint MUST have `authorize()` middleware.
- Permissions checked in middleware, not in controllers.

### 18.3 Input Validation

- All input validated with **Zod** schemas on every mutation endpoint.
- HTML escaping applied to all user-displayed strings (XSS prevention).
- File upload size limited: 10 MB (Express JSON body limit).

### 18.4 HTTP Security

- **Helmet middleware** enabled on all routes.
- **CORS** configured via `CORS_ORIGIN` env var. Never `*` in production.
- **Rate limiting** on all API routes (configurable via env vars).
- **Morgan** logging in combined format for audit trail.

### 18.5 Database Security

- **SQL injection prevented** via Knex parameterized queries.
- **Soft delete** instead of hard delete for all primary entities.
- **Audit logging** for every CUD operation: who, what, when, old/new values, IP, user agent.

### 18.6 Secrets Management

- **No secrets in source code.** Zero exceptions.
- All credentials from environment variables.
- `.env` is gitignored. `.env.example` is the template.
- JWT secret must be a minimum of 32 characters.
- Production secrets must be rotated quarterly.

### 18.7 Operational Security

- Graceful shutdown on `SIGTERM` / `SIGINT` (close DB connections, finish pending requests).
- Health check endpoint (`GET /api/v1/health`) does not leak system information.
- Error responses never include stack traces in production (`NODE_ENV=production` suppresses them).

---

## 19. Performance Budgets

### 19.1 Frontend (React SPA)

| Metric | Target (Desktop) | Target (Mobile 3G) |
|---|---|---|
| First Contentful Paint (FCP) | < 1.5s | < 3.0s |
| Largest Contentful Paint (LCP) | < 2.5s | < 4.0s |
| Time to Interactive (TTI) | < 3.0s | < 5.0s |
| Total Blocking Time (TBT) | < 200ms | < 300ms |
| Cumulative Layout Shift (CLS) | < 0.1 | < 0.1 |
| JavaScript bundle size (gzip) | < 250 KB | < 250 KB |
| CSS bundle size (gzip) | < 30 KB | < 30 KB |

### 19.2 Backend API

| Metric | Target |
|---|---|
| P50 response time | < 200ms |
| P95 response time | < 500ms |
| P99 response time | < 1000ms |
| API error rate | < 0.1% |
| Database query time (P95) | < 100ms |

### 19.3 Static HTML (Marc8_HTML)

| Metric | Target |
|---|---|
| Page load (total) | < 2.0s on broadband |
| JavaScript total (data.js + app.js) | < 50 KB gzip |
| CSS total (10 files) | < 15 KB gzip |
| HTML per page | < 20 KB gzip |

### 19.4 Database

| Metric | Target |
|---|---|
| Query response (P95) | < 100ms |
| Migration execution | < 30s for all migrations |
| Connection pool | 20 (configurable) |

### 19.5 Budget Enforcement

- Performance regression of >10% on any metric blocks the release.
- Lighthouse CI run is required before every release.
- Unoptimized images, render-blocking resources, and excessive DOM size are automatic review blockers.

---

## 20. Future AI Integration Standards

This section defines the architectural rules for future AI/ML features. These standards are active now — any AI-related code must comply even before full AI integration begins.

### 20.1 OCR and Receipt Scanning

| Requirement | Standard |
|---|---|
| Processing layer | Backend service (`backend/src/services/intelligence.service.ts`) |
| Image input | Accept JPEG, PNG, PDF (max 10 MB per file) |
| Output format | Structured expense data matching `expense` schema |
| Storage | Uploaded images stored in configurable path (env var `UPLOAD_DIR`) |
| Audit trail | Every OCR scan logged: input file hash, output confidence, timestamp, user |
| Confidence threshold | Minimum 80% confidence for auto-categorization. Below 80% → manual review queue |
| PII handling | All images must pass through PII redaction before storage. No credit card numbers, Aadhaar, or PAN in stored images |

### 20.2 Receipt Categorization

| Requirement | Standard |
|---|---|
| Categories | Must map to existing `expense_categories` master data |
| Auto-tagging | Engine adds `category`, `confidence`, and `auto_tagged: true` |
| Review | Auto-tagged expenses enter a "pending review" state |
| Learning | User corrections must be logged for model retraining |
| Opt-out | Users can disable auto-categorization in settings |

### 20.3 AI Transaction Categorization

| Requirement | Standard |
|---|---|
| Scope | Journal entries, expenses, outstandings |
| Training data | Curated from user-approved historical records only |
| Predictions | Must include `category`, `confidence`, `model_version` |
| UI display | Show AI prediction as a suggestion (not auto-applied) with approval button |
| Rollback | Each AI action must be reversible (audit trail tracks pre/post state) |

### 20.4 AI Integration Architecture Rules

- **AI services are backend services.** No AI computation in the frontend.
- **All AI operations must be asynchronous.** Never block an API response waiting for AI inference.
- **AI model files are NOT stored in the repository.** Models are loaded from a configurable path (env var `AI_MODELS_DIR`).
- **Every AI decision must be explainable.** Store the input, rules/ model version, and confidence for every AI action.
- **AI features must have a manual override.** The user must always be able to accept, reject, or correct an AI suggestion.
- **AI failures must never crash the application.** Wrap AI calls in try/catch with graceful fallback to manual input.

### 20.5 Data Privacy

- **No customer PII sent to external AI APIs** unless explicitly configured and documented.
- **All AI processing must comply with Indian IT Act 2000 and GDPR-equivalent standards** for any EU user data.
- **Users have the right to opt out** of AI-powered features entirely.
- **AI activity is audited** in the `audit_logs` table with `entity_type = 'AI_ACTION'`.

---

## 21. Rules That MUST NEVER Be Violated

These rules are absolute. Violation, whether intentional or accidental, must be immediately reverted, documented in `PROJECT_AUDIT.md`, and escalated to the Architecture Board.

### R1. Financial Engine Purity

**Financial calculations belong ONLY in `backend/src/services/financial-engine/`.**

No controller, service (outside the engine), frontend component, hook, utility, or HTML page may compute revenue, expense, profit, cash flow, margin, utilisation percentage, or any derived financial metric. The frontend displays what the API returns. The static HTML version uses mock data from `data.js` only as a stand-in — every mock calculation must be replaced with an API call before production.

**Why:** One bug in one controller corrupts financial reporting across the entire system. One engine, audited and tested, prevents this.

### R2. Source of Truth Inviolability

**No code or document may contradict a higher-ranked document in the Source of Truth Hierarchy (§2).**

If code implements something different from `BRD.md`, the code is wrong. If `PRD.md` contradicts `BRD.md`, `PRD.md` is wrong. If this governance document contradicts `BRD.md`, this document is wrong.

**Why:** Without strict hierarchy, every decision becomes negotiable. The business requirements must always win.

### R3. Frozen Business Rules Are Inviolable

**The invariants in `BUSINESS_RULES_FREEZE.md` (INV1 through INV14) may not be violated by any implementation.**

Any change to a frozen rule requires unanimous Architecture Board approval and updates the document version.

**Why:** These rules encode the core financial and operational logic that the entire business depends on. Breaking them means breaking financial reporting, audit trails, or data integrity.

### R4. Soft Delete Mandate

**All primary business entities MUST use soft delete. Hard deletion is prohibited.**

Tables must include `deleted_at` and `deleted_by` columns. Queries must include `WHERE deleted_at IS NULL`. Restore operations set `deleted_at = NULL`.

**Why:** Hard deletion destroys audit trails, breaks foreign key references, and makes financial reconciliation impossible. In a financial system, data permanence is not optional.

### R5. Completed Booking Immutability

**Once a booking reaches COMPLETED status, its financial fields (`gross_fare`, `doorstep_charges`, `platform_commission`, `net_revenue`) MUST NOT be modified.**

Refunds must be processed as new transactions (linked to the original booking), not as modifications.

**Why:** This is a core accounting principle. Completed transactions are part of the permanent financial record. Allowing edits would make P&L statements non-auditable.

### R6. UUID Primary Keys

**All entity primary keys MUST be UUIDs generated via `gen_random_uuid()`. Sequential integer IDs are prohibited.**

**Why:** UUIDs prevent enumeration attacks, eliminate ID collision risks in distributed systems, and allow safe data merging across environments.

### R7. Monetary Column Type

**All monetary value columns MUST be `DECIMAL(12,2)`. `FLOAT`, `INTEGER`, and `VARCHAR` are prohibited for monetary values.**

**Why:** Floating-point arithmetic introduces rounding errors that compound across thousands of transactions. A system that tracks rupees and paise must use exact decimal math.

### R8. No Hardcoded Configuration

**No URLs, ports, credentials, or environment-specific values may be hardcoded in source code.**

All configuration comes from environment variables. `.env` is gitignored. `.env.example` is the template.

**Why:** Hardcoded configuration makes the application non-portable, creates security risks (leaked credentials), and prevents standard CI/CD practices.

### R9. No Secrets in Source

**No password, API key, token, certificate, or credential of any kind may exist in source code, in any file tracked by git.**

**Why:** Git history is permanent. A committed secret is a compromised secret, even if removed in a later commit.

### R10. RBAC Enforcement on Every Protected Endpoint

**Every non-public API endpoint MUST enforce role-based access control via the `authorize()` middleware.**

The frontend may hide UI elements for UX, but backend RBAC is the authoritative security layer. Frontend-only access control is not access control.

**Why:** Security enforced only in the frontend is security theater. A user with curl can bypass any frontend check.

### R11. Zod Validation on Every Mutation

**Every POST, PUT, and PATCH endpoint MUST validate input through a Zod schema before processing.**

**Why:** Unvalidated input is the root cause of SQL injection, data corruption, and business rule violations. Schema validation at the boundary catches all of these.

### R12. Paginated List Responses

**All GET endpoints returning collections MUST return paginated responses with the standard `meta` object. Unbounded arrays are prohibited.**

**Why:** An unbounded list endpoint will eventually break under load. Pagination protects both the client (memory) and server (CPU/database).

### R13. Audit Trail on Every CUD Operation

**Every CREATE, UPDATE, DELETE, RESTORE, ACTIVATE, and DEACTIVATE operation on business entities MUST be logged in `audit_logs`.**

**Why:** In a financial system, who did what and when is not optional. Audit trails are required for compliance, troubleshooting, and fraud detection.

### R14. No Platform-Specific Code

**The application must deploy on any standard hosting without source modification. No provider SDKs, no platform-specific APIs in application code.**

Platform-specific configuration files (`vercel.json`, `Dockerfile`) are optional overlays. The app must work without them.

**Why:** Provider lock-in is an existential risk. If the chosen platform changes pricing, policies, or reliability, the application must be able to move without a rewrite.

### R15. Frontend Must Not Contain Business Logic

**Business logic, decision rules, financial calculations, and validation beyond simple UI hints MUST NOT exist in frontend code.**

The frontend displays data and sends user input to the API. All decisions, validations, and calculations happen on the backend. The `Marc8_HTML/` version's `data.js` is explicitly a mock stand-in — every mock function must be replaced with an API call before production.

**Why:** Business logic in the frontend is duplicated, unauditable, unversioned, and impossible to secure. It creates two sources of truth that inevitably diverge.

---

## Violation Consequences

| Violation | Consequence |
|---|---|
| R1–R3 | Immediate revert + Architecture Board review |
| R4–R7 | Immediate revert + mandatory code review audit |
| R8–R9 | Security incident — immediate revert + root cause analysis |
| R10–R13 | Release blocking — must be fixed before merge |
| R14–R15 | Code review rejection — must be fixed before approval |

---

*This document is the permanent engineering constitution for the Marc8 Fleet Financial ERP. It supersedes all prior engineering guidance. Amendments require unanimous Architecture Board approval and MUST be recorded with version history in `PROJECT_AUDIT.md`.*

**End of MARC8_ENGINEERING_GOVERNANCE.md**
