# Marc8 Fleet Financial ERP — Complete Project Structure & Architecture

> **Generated**: 3 July 2026
> **Version**: v1.0 (Production Certified)
> **Total Files**: 395+ (excluding `node_modules`, `.git`, `dist`)

---

## 1. Root Directory

**Purpose**: Project root — monorepo with `frontend/` and `backend/` subdirectories.
**Total files**: 40

```
Financial Dashboard/
│
├── .dockerignore                  # Docker build exclusion patterns
├── .gitignore                     # Git exclusion patterns
├── docker-compose.yml             # Docker Compose: PostgreSQL + Backend + Frontend
├── vercel.json                    # Vercel deployment config (build from frontend/)
│
├── BRD.md                         # Business Requirements Document (114 lines)
├── PRD.md                         # Product Requirements Document (58 lines)
├── Brand_Guidelines.md            # Brand & Visual Guidelines (74 lines)
├── BUSINESS_OPERATING_SPECIFICATION.md  # Business operating spec
├── BUSINESS_RULES_FREEZE.md       # Frozen business invariants (189 lines)
├── ENGINEERING_STANDARDS.md       # Engineering standards (417 lines)
├── README.md                      # Main project readme (213 lines)
├── CONTRIBUTING.md                # Contributor guide (120 lines)
├── ENVIRONMENT_SETUP.md           # Environment setup guide (90 lines)
├── DEPLOYMENT.md                  # Deployment guide (142 lines)
├── DEPLOY_ANYWHERE.md             # Platform-agnostic deployment (257 lines)
├── DATABASE_SCHEMA.md             # Database schema reference (808 lines)
├── PROJECT_STRUCTURE.md           # Previous project structure doc (302 lines)
├── PROJECT_AUDIT.md               # Module implementation audit (158 lines)
├── REPOSITORY_INTEGRITY_AUDIT.md  # Repository integrity check (399 lines)
├── PRODUCTION_BUILD_ROOT_CAUSE.md # Build failure RCA doc
├── VITE_BUILD_FAILURE_REPORT.md   # Vite build failure report
├── BACKUP_AND_RECOVERY.md         # Backup & recovery guide (NEW, Phase 7)
├── LAUNCH_CHECKLISTS.md           # Launch/UAT/smoke test checklists (NEW, Phase 7)
│
├── DEPLOYMENT_CERTIFICATION_REPORT.md     # Deployment certification
├── DEPLOYMENT_CERTIFICATION_FINAL.md      # Final deployment cert
├── DEPLOYMENT_INDEPENDENCE_REPORT.md      # Deployment independence
├── DEPLOYMENT_RUNTIME_AUDIT.md            # Runtime audit
│
├── PHASE_4B_ENGINEERING_REPORT.md
├── PHASE_5C_ERP_COMPLETION_REPORT.md
├── PHASE_5D1_PREMIUM_UI_REPORT.md
├── PHASE_5D2_MODULE_EXPERIENCE_REPORT.md
├── PHASE_5D3_PREMIUM_PRODUCT_REPORT.md
├── PHASE_6A_IMPLEMENTATION_PLAN.md
├── PHASE_6B1_COHOSTED_ENGINE_REPORT.md
├── PHASE_6B2_SETTLEMENT_ENGINE_REPORT.md
├── PHASE_6B2_1_SOURCE_OF_TRUTH_ALIGNMENT_REPORT.md
├── PHASE_6B3_OPERATIONS_WORKFLOW_REPORT.md
├── PHASE_6B4_AUTOMATION_INTELLIGENCE_REPORT.md
├── PHASE_6C_ENTERPRISE_EXPERIENCE_REPORT.md
├── PHASE_6D_ENTERPRISE_ACCEPTANCE_REPORT.md
├── PHASE_7_PRODUCTION_CERTIFICATION_REPORT.md
│
└── (frontend/  — see below)
└── (backend/   — see below)
```

---

## 2. Frontend (`frontend/`)

**Purpose**: React 19 SPA — Vite 8 build, Tailwind v4 styling, TypeScript 6.
**Total files**: 131 source files + 15 config/infra files

### 2.1 Frontend Configuration Files

**Purpose**: Build tooling, TypeScript config, linting, deployment platform configs.
**Files**: 15

```
frontend/
│
├── package.json                  # Dependencies & scripts
├── package-lock.json             # Lockfile
├── vite.config.ts                # Vite build config (React + Tailwind + path alias + chunk splitting)
├── tsconfig.json                 # TS project references (app + node)
├── tsconfig.app.json             # TS config for src/ (ES2020, JSX, path alias @/*)
├── tsconfig.node.json            # TS config for vite.config.ts
├── postcss.config.js             # PostCSS (empty — Tailwind handles it)
├── .oxlintrc.json                # Oxlint rules (react hooks, exports)
│
├── index.html                    # HTML entry (Google Fonts, favicon, root div)
├── vercel.json                   # Vercel SPA config (rewrites, cache headers)
│
├── .env.example                  # VITE_API_URL documentation
├── .gitignore                    # Frontend-specific git excludes
├── .dockerignore                 # Docker build excludes
├── .htaccess                     # Apache SPA rewrite + caching
│
├── Dockerfile                    # Multi-stage: node:20-alpine build → nginx:alpine serve
├── README.md                     # Vite template README (not customized)
│
├── DEPLOYMENT_RUNTIME_REPORT.md  # Frontend deployment runtime report
├── DIST_VERIFICATION_REPORT.md   # Dist verification report
├── RUNTIME_AUDIT.md              # Frontend runtime audit
│
├── public/
│   ├── _redirects                # Netlify/Cloudflare Pages SPA rule
│   ├── favicon.svg               # Favicon (9.5 kB SVG)
│   └── icons.svg                 # SVG sprite (5 kB)
│
└── src/                          # — see below
```

### 2.2 Frontend `src/` Entry & App Shell

**Purpose**: Application bootstrap, routing, providers, global CSS.
**Files**: 7

```
frontend/src/
│
├── main.tsx                      # Entry point — StrictMode + GlobalErrorBoundary + App
├── index.css                     # Global styles (517 lines) — Tailwind v4, glass variants,
│                                 #   brand tokens, responsive utilities, dark theme
├── vite-env.d.ts                 # Vite client type declarations
│
├── app/
│   ├── index.ts                  # Barrel export for App
│   └── app.tsx                   # App root — Providers → BrowserRouter → Routes
│
├── routes/
│   ├── index.tsx                 # Route definitions (26 lazy-loaded pages + auth layout)
│   └── protected-route.tsx       # Auth guard — redirects to /login if unauthenticated
│
├── providers/
│   ├── index.tsx                 # Provider composition (Theme → Auth → Notification → AppStore)
│   ├── theme-provider.tsx        # Theme context (dark/light, localStorage, system preference)
│   ├── auth-provider.tsx         # Auth context (login, logout, session, token storage)
│   └── notification-provider.tsx  # Toast notification system
│
└── layouts/
    ├── auth-layout.tsx           # Auth page layout (centered card, no sidebar)
    └── dashboard-layout.tsx      # Dashboard layout (sidebar + navbar + main content)
```

### 2.3 Frontend `src/config/`

**Purpose**: Application configuration constants, navigation definition.
**Files**: 3

```
frontend/src/config/
├── constants.ts                  # ROLES, PERMISSIONS, STORAGE_KEYS, QUERY_KEYS,
│                                 #   PAGINATION, DATE_FORMATS
├── index.ts                      # App config (apiUrl from VITE_API_URL, app name, version)
└── navigation.ts                 # Sidebar navigation tree with role-based visibility
```

### 2.4 Frontend `src/stores/`

**Purpose**: State management (React Context + useReducer).
**Files**: 2

```
frontend/src/stores/
├── index.ts                      # Barrel export
└── app-store.tsx                 # AppStore — sidebar state, recently viewed pages (with localStorage persistence)
```

### 2.5 Frontend `src/hooks/`

**Purpose**: Custom React hooks.
**Files**: 16

```
frontend/src/hooks/
├── index.ts                      # Barrel export (all hooks)
├── use-auth.ts                   # Auth context consumer
├── use-theme.ts                  # Theme context consumer
├── use-notification.ts           # Notification context consumer
├── use-media-query.ts            # Responsive breakpoint detection (sm/md/lg/xl/2xl)
├── use-click-outside.ts          # Click outside detection
├── use-debounce.ts               # Value debouncing
├── use-pagination.ts             # Pagination state management
├── use-search.ts                 # Search with debounce
├── use-filters.ts                # URL-persisted filter state
├── use-sort.ts                   # Sort state management
├── use-master-values.ts          # Master data (expense categories, platforms, etc.)
├── use-dashboard.ts              # Dashboard data fetching
├── use-booking-dashboard.ts      # Booking dashboard data
├── use-journal-metrics.ts        # Journal metrics data
├── use-outstanding-dashboard.ts  # Outstanding dashboard data
└── use-keyboard-shortcuts.ts     # Global keyboard shortcuts (Phase 6C)
```

### 2.6 Frontend `src/services/`

**Purpose**: API client layer — HTTP calls to backend.
**Files**: 27

```
frontend/src/services/
├── index.ts                      # Barrel export (all services)
├── api-client.ts                 # Axios/fetch wrapper — base URL, auth headers, error handling
├── auth.service.ts               # Login, logout, profile, change password
├── vehicle.service.ts            # CRUD + filter/search for vehicles
├── booking.service.ts            # CRUD for bookings
├── expense.service.ts            # CRUD for expenses
├── journal.service.ts            # CRUD for journal entries
├── outstanding.service.ts        # CRUD for outstandings
├── settlement.service.ts         # CRUD + pipeline + dashboard metrics for settlements
├── maintenance.service.ts        # CRUD for maintenance records
├── vendor.service.ts             # CRUD for vendors
├── master.service.ts             # Master data (categories, platforms, etc.)
├── dashboard.service.ts          # Dashboard KPIs and metrics
├── analytics.service.ts          # Analytics data
├── report.service.ts             # Report generation and history
├── notification.service.ts       # Notifications CRUD
├── settings.service.ts           # Settings CRUD
├── scheduler.service.ts          # Service schedule CRUD
├── platform-assignment.service.ts # Platform assignment CRUD
├── vehicle-lifecycle.service.ts  # Document lifecycle tracking
├── vehicle-owner.service.ts      # Vehicle owner CRUD
├── automation.service.ts         # Automation rules and execution
├── intelligence.service.ts       # Business alerts and recommendations
├── task.service.ts               # Tasks CRUD
├── approval.service.ts           # Approval requests
├── activity.service.ts           # Activity log
├── sla.service.ts                # SLA monitoring
├── escalation.service.ts         # Escalation management
└── job-scheduler.service.ts      # Job scheduler
```

### 2.7 Frontend `src/types/`

**Purpose**: TypeScript type definitions and interfaces.
**Files**: 21

```
frontend/src/types/
├── index.ts                      # Barrel export
├── api.ts                        # Generic API response types (ApiResponse, PaginatedResponse, etc.)
├── vehicle.ts                    # Vehicle, CreateVehicleDTO, UpdateVehicleDTO, VehicleStatus, etc.
├── booking.ts                    # Booking, BookingStatus, PaymentStatus, etc.
├── expense.ts                    # Expense, ExpenseStatus, etc.
├── journal.ts                    # JournalEntry, JournalStatus, etc.
├── outstanding.ts                # Outstanding, OutstandingStatus, OutstandingPriority, etc.
├── settlement.ts                 # Settlement, SettlementDashboardMetrics, etc.
├── dashboard.ts                  # KPIs, FleetHealthSummary, DashboardData, etc.
├── analytics.ts                  # AnalyticsData, RevenueMetrics, etc.
├── report.ts                     # ReportType, ReportFilters, ReportResult, etc.
├── maintenance.ts                # Maintenance, FleetHealth, etc.
├── vendor.ts                     # Vendor
├── master.ts                     # MasterValue, MasterType
├── notification.ts               # Notification, Reminder, NotificationPreferences
├── settings.ts                   # CompanyProfile, all settings interfaces
├── scheduler.ts                  # ServiceSchedule
├── platform-assignment.ts        # PlatformAssignment
├── vehicle-lifecycle.ts          # LifecycleEvent, DocumentStatus
├── vehicle-owner.ts              # VehicleOwner, OwnerType, etc.
├── workflow.ts                   # WorkflowDefinition, Task, Approval, SLA, ActivityLog
└── automation.ts                 # AutomationSummary, BusinessAlert, Recommendation
```

### 2.8 Frontend `src/validation/`

**Purpose**: Zod validation schemas for forms.
**Files**: 13

```
frontend/src/validation/
├── index.ts                      # Barrel export
├── auth.ts                       # Login form schema
├── vehicle.ts                    # Vehicle form schema
├── booking.ts                    # Booking form schema
├── expense.ts                    # Expense form schema
├── journal.ts                    # Journal entry form schema
├── outstanding.ts                # Outstanding form schema
├── settlement.ts                 # Settlement form schema
├── maintenance.ts                # Maintenance form schema
├── vendor.ts                     # Vendor form schema
├── platform-assignment.ts        # Platform assignment form schema
├── scheduler.ts                  # Service schedule form schema
└── vehicle-owner.ts              # Vehicle owner form schema
```

### 2.9 Frontend `src/lib/`

**Purpose**: Utility functions.
**Files**: 1

```
frontend/src/lib/
└── utils.ts                      # cn() — Tailwind class merging (clsx + tailwind-merge)
```

### 2.10 Frontend `src/constants/`

**Purpose**: (Empty) — reserved for additional constants.
**Files**: 0

### 2.11 Frontend `src/components/ui/`

**Purpose**: Primitive UI components — Radix-based, CVA-styled, reusable.
**Files**: 21

```
frontend/src/components/ui/
├── button.tsx                    # Button with variants (primary, secondary, outline, ghost, destructive)
├── card.tsx                      # Card with glass, hover, accent variants
├── badge.tsx                     # Badge with variants (default, secondary, destructive, outline)
├── avatar.tsx                    # Avatar with fallback initials
├── checkbox.tsx                  # Checkbox with label
├── switch.tsx                    # Toggle switch
├── input.tsx                     # Text input with icon support
├── label.tsx                     # Form label
├── select.tsx                    # Dropdown select
├── dialog.tsx                    # Modal dialog
├── drawer.tsx                    # Slide-in drawer
├── popover.tsx                   # Popover overlay
├── dropdown-menu.tsx             # Dropdown menu
├── tooltip.tsx                   # Tooltip on hover
├── tabs.tsx                      # Tabbed interface
├── table.tsx                     # HTML table primitives (Table, Thead, Tbody, Tr, Th, Td)
├── skeleton.tsx                  # Skeleton loading placeholder
├── scroll-area.tsx               # Custom scrollable area
├── separator.tsx                 # Visual separator
├── toast.tsx                     # Toast notification
├── command.tsx                   # Command palette primitives (cmdk)
└── date-picker.tsx               # Calendar date picker (single + range)
```

### 2.12 Frontend `src/components/shared/`

**Purpose**: Shared business-agnostic components used across pages.
**Files**: 14

```
frontend/src/components/shared/
├── data-table.tsx                # Full-featured table (sorting, filtering, pagination, column visibility, export, density)
├── pagination.tsx                # Pagination controls
├── search-input.tsx              # Search input with debounce
├── metric-card.tsx               # KPI metric card (icon, value, trend, loading state)
├── chart-card.tsx                # Chart wrapper card
├── page-header.tsx               # Page title + description + actions
├── breadcrumb.tsx                # Breadcrumb navigation
├── confirmation-dialog.tsx       # Confirm action dialog
├── drawer.tsx                    # Reusable slide-in drawer for forms
├── empty-state.tsx               # Empty state placeholder
├── error-state.tsx               # Error state with retry
├── error-boundary.tsx            # React error boundary with fallback
└── global-error-boundary.tsx     # Root-level error boundary (full page)
```

### 2.13 Frontend `src/components/layout/`

**Purpose**: Layout chrome components.
**Files**: 6

```
frontend/src/components/layout/
├── sidebar.tsx                   # Main sidebar (collapsible, sections, recently viewed)
├── mobile-sidebar.tsx            # Mobile drawer sidebar
├── navbar.tsx                    # Top navbar (breadcrumb, search, notifications, theme, user menu)
├── command-palette.tsx           # Cmd+K command palette
├── notification-bell.tsx         # Notification bell with unread count
└── user-menu.tsx                 # User dropdown (profile, settings, logout)
```

### 2.14 Frontend `src/components/dashboard/`

**Purpose**: Dashboard page widgets.
**Files**: 9

```
frontend/src/components/dashboard/
├── dashboard-kpi-cards.tsx       # KPI metric cards (financial health, fleet overview, outstanding)
├── dashboard-trend-charts.tsx    # Revenue/expense trend charts
├── dashboard-breakdown-charts.tsx # Revenue & expense breakdown (pie charts)
├── dashboard-fleet-health-section.tsx # Fleet health section
├── dashboard-alerts.tsx          # Alerts & warnings list
├── dashboard-recent-activity.tsx # Recent activity timeline
├── dashboard-top-vehicles.tsx    # Top vehicles by performance
├── dashboard-global-filters.tsx  # Global date/vehicle/platform filters
└── dashboard-payment-planner.tsx # Payment planner widget
```

### 2.15 Frontend `src/components/bookings/`

**Purpose**: Booking module components.
**Files**: 2

```
frontend/src/components/bookings/
├── index.ts                      # Barrel export
├── booking-form.tsx              # Booking create/edit form (drawer-based)
└── booking-dashboard-widgets.tsx # Booking dashboard widgets
```

### 2.16 Frontend `src/components/expenses/`

**Purpose**: Expense module components.
**Files**: 1

```
frontend/src/components/expenses/
├── index.ts                      # Barrel export
└── expense-form.tsx              # Expense create/edit form (drawer-based)
```

### 2.17 Frontend `src/components/journal/`

**Purpose**: Journal module components.
**Files**: 1

```
frontend/src/components/journal/
├── index.ts                      # Barrel export
└── journal-form.tsx              # Journal entry create/edit form (drawer-based)
```

### 2.18 Frontend `src/components/outstanding/`

**Purpose**: Outstanding module components.
**Files**: 1

```
frontend/src/components/outstanding/
└── outstanding-form.tsx          # Outstanding create/edit form (drawer-based)
```

### 2.19 Frontend `src/components/settlements/`

**Purpose**: Settlement module components.
**Files**: 2

```
frontend/src/components/settlements/
├── settlement-form.tsx           # Settlement create/edit form (drawer-based)
└── pipeline-run-dialog.tsx       # Settlement pipeline execution dialog
```

### 2.20 Frontend `src/components/vehicles/`

**Purpose**: Vehicle module components.
**Files**: 1

```
frontend/src/components/vehicles/
├── index.ts                      # Barrel export
└── vehicle-form.tsx              # Vehicle create/edit form (drawer-based)
```

### 2.21 Frontend `src/components/vehicle-owners/`

**Purpose**: Vehicle owner module components.
**Files**: 1

```
frontend/src/components/vehicle-owners/
└── vehicle-owner-form.tsx        # Vehicle owner create/edit form (drawer-based)
```

### 2.22 Frontend `src/components/vendors/`

**Purpose**: Vendor module components.
**Files**: 1

```
frontend/src/components/vendors/
└── vendor-form.tsx               # Vendor create/edit form (drawer-based)
```

### 2.23 Frontend `src/components/maintenance/`

**Purpose**: Maintenance module components.
**Files**: 2

```
frontend/src/components/maintenance/
├── maintenance-form.tsx          # Maintenance create/edit form (drawer-based)
└── schedule-form.tsx             # Service schedule form
```

### 2.24 Frontend `src/components/master/`

**Purpose**: Master data module components.
**Files**: 0 (empty — no dedicated sub-components beyond the page itself)

```
frontend/src/components/master/
```

### 2.25 Frontend `src/components/reports/`

**Purpose**: Reports module components.
**Files**: 4

```
frontend/src/components/reports/
├── report-type-selector.tsx      # Report type selection panel
├── report-filters.tsx            # Report filter controls
├── report-preview.tsx            # Report preview with charts and table
└── saved-reports-panel.tsx       # Saved reports sidebar
```

### 2.26 Frontend Pages (`src/pages/`)

**Purpose**: Page-level components (28 pages, all lazy-loaded).
**Files**: 28

```
frontend/src/pages/
├── login.tsx                     # Login page (zod form, error display)
├── change-password.tsx           # Change password page
├── dashboard.tsx                 # Main dashboard (KPIs, charts, fleet health, alerts, activity)
├── fleet-dashboard.tsx           # Fleet-specific dashboard (health score, services)
├── vehicle-financials.tsx        # Vehicle financial performance detail
├── bookings.tsx                  # Bookings list (DataTable, filters, drawer form)
├── journal.tsx                   # Journal entries list (DataTable, filters, drawer form)
├── expenses.tsx                  # Expenses list (DataTable, filters, drawer form)
├── outstanding.tsx               # Outstanding list (DataTable, filters, pay dialog)
├── settlements.tsx               # Settlements list (DataTable, filters, drawer form)
├── settlement-dashboard.tsx      # Settlement dashboard (metrics, trends, distribution)
├── settlement-detail.tsx         # Settlement detail view
├── vehicles.tsx                  # Vehicles list (DataTable, filters, drawer form)
├── vehicle-owners.tsx            # Vehicle owners list (DataTable, filters)
├── vehicle-owner-detail.tsx      # Vehicle owner detail (vehicles, documents)
├── vendors.tsx                   # Vendors list (DataTable, filters)
├── maintenance.tsx               # Maintenance list (DataTable, filters, drawer form)
├── service-schedules.tsx         # Service schedules (DataTable, filters, schedule form)
├── analytics.tsx                 # Analytics page (revenue, expenses, utilization)
├── reports.tsx                   # Reports page (type selector, filters, preview, saved)
├── notifications.tsx             # Notifications + reminders page
├── operations.tsx                # Operations center (tasks, approvals, SLA, activity)
├── tasks.tsx                     # Tasks list
├── automation.tsx                # Automation page (alerts, recommendations, rules)
├── master-data.tsx               # Master data management (CRUD for all master types)
├── settings.tsx                  # Settings page (multi-tab: company, dashboard, financial, etc.)
├── not-found.tsx                 # 404 page
└── unauthorized.tsx              # 403 access denied page
```

---

## 3. Backend (`backend/`)

**Purpose**: Express.js REST API — Node.js, TypeScript, Knex/PostgreSQL.
**Total files**: 131 source files + 8 config/infra files

### 3.1 Backend Configuration Files

**Purpose**: Application config, TypeScript, Docker, database.
**Files**: 8

```
backend/
│
├── package.json                  # Dependencies & scripts
├── package-lock.json             # Lockfile
├── tsconfig.json                 # TS config (ES2022, commonjs, strict)
├── knexfile.ts                   # Knex config (dev/prod/test environments, pool settings)
│
├── .env                          # Active environment variables (gitignored)
├── .env.example                  # Example env vars (9 variables documented)
├── .gitignore                    # Backend-specific git excludes
├── .dockerignore                 # Docker build excludes
│
└── Dockerfile                    # Multi-stage: node:20-alpine build → run
```

### 3.2 Backend Entry Point

**Purpose**: Server bootstrap — middleware, routes, startup validation.
**Files**: 1

```
backend/src/
└── index.ts                      # Express app — helmet, CORS, rate limiting, routes, error handler,
                                  #   DB connection check, graceful shutdown (SIGTERM/SIGINT)
```

### 3.3 Backend `src/config/`

**Purpose**: Configuration modules.
**Files**: 4

```
backend/src/config/
├── index.ts                      # Barrel export
├── env.ts                        # Environment variable loading & validation (PORT, DATABASE_URL, JWT_SECRET, etc.)
├── database.ts                   # Knex connection pool factory (getDatabase, checkDatabaseConnection, closeDatabaseConnection)
└── constants.ts                  # Domain constants (VEHICLE_STATUSES, FUEL_TYPES, BOOKING_STATUSES, etc.)
```

### 3.4 Backend `src/middleware/`

**Purpose**: Express middleware functions.
**Files**: 7

```
backend/src/middleware/
├── index.ts                      # Barrel export
├── auth.ts                       # JWT authentication — extract + verify Bearer token
├── rbac.ts                       # Role-based authorization — authorize(...roles)
├── validate.ts                   # Zod validation — validate(body), validateQuery, validateParams
├── rate-limiter.ts               # Rate limiting — authRateLimiter (20/15min), apiRateLimiter
├── error-handler.ts              # Global error handler — Zod errors, operational errors, unexpected errors
└── audit.ts                      # Audit logging — createAuditLog(), auditLog(action, entityType) middleware
```

### 3.5 Backend `src/routes/`

**Purpose**: Route definitions — 30 route files covering all API endpoints.
**Files**: 30

```
backend/src/routes/
├── index.ts                      # Route aggregator — mounts all sub-routers under /api/v1
├── auth.routes.ts                # POST /login, /logout, /change-password, GET/PUT /profile
├── user.routes.ts                # CRUD /users (admin)
├── vehicle.routes.ts             # CRUD /vehicles
├── vehicle-lifecycle.routes.ts   # GET /vehicle-lifecycle
├── vehicle-owner.routes.ts       # CRUD /vehicle-owners
├── booking.routes.ts             # CRUD /bookings
├── expense.routes.ts             # CRUD /expenses
├── journal.routes.ts             # CRUD /journal
├── outstanding.routes.ts         # CRUD /outstandings
├── settlement.routes.ts          # CRUD /settlements + pipeline + payments
├── master.routes.ts              # CRUD /masters (master data types + values)
├── dashboard.routes.ts           # GET /dashboard (aggregated metrics)
├── analytics.routes.ts           # GET /analytics (revenue, expense, utilization)
├── report.routes.ts              # POST /reports/generate, GET /reports, /reports/:id, etc.
├── notification.routes.ts        # GET /notifications, /reminders CRUD, templates, preferences
├── vendor.routes.ts              # CRUD /vendors
├── maintenance.routes.ts         # CRUD /maintenance
├── scheduler.routes.ts           # CRUD /service-schedules
├── platform-assignment.routes.ts # CRUD /platform-assignments
├── settings.routes.ts            # CRUD /settings (company, dashboard, financial, notification, preferences, security)
├── activity.routes.ts            # GET /activity
├── approval.routes.ts            # CRUD /approvals
├── task.routes.ts                # CRUD /tasks
├── sla.routes.ts                 # CRUD /sla (breaches)
├── escalation.routes.ts          # CRUD /escalations
├── workflow.routes.ts            # CRUD /workflows
├── automation.routes.ts          # CRUD /automation (rules)
├── job-scheduler.routes.ts       # CRUD /scheduler (jobs)
└── intelligence.routes.ts        # CRUD /intelligence (alerts + recommendations)
```

### 3.6 Backend `src/controllers/`

**Purpose**: Request handlers — thin layer between routes and services.
**Files**: 25

```
backend/src/controllers/
├── auth.controller.ts            # Login, logout, profile, change password
├── user.controller.ts            # User CRUD
├── vehicle.controller.ts         # Vehicle CRUD
├── vehicle-lifecycle.controller.ts  # Document lifecycle
├── vehicle-owner.controller.ts   # Vehicle owner CRUD
├── booking.controller.ts         # Booking CRUD
├── expense.controller.ts         # Expense CRUD
├── journal.controller.ts         # Journal entry CRUD
├── outstanding.controller.ts     # Outstanding CRUD
├── settlement.controller.ts      # Settlement CRUD, pipeline, payments
├── master.controller.ts          # Master data CRUD
├── dashboard.controller.ts       # Dashboard data
├── analytics.controller.ts       # Analytics data
├── report.controller.ts          # Report generation, history, templates
├── notification.controller.ts    # Notifications, reminders, templates, preferences
├── vendor.controller.ts          # Vendor CRUD
├── maintenance.controller.ts     # Maintenance CRUD
├── scheduler.controller.ts       # Service schedule CRUD
├── platform-assignment.controller.ts  # Platform assignment CRUD
├── settings.controller.ts        # Settings CRUD
├── activity.controller.ts        # Activity log
├── approval.controller.ts        # Approval CRUD
├── task.controller.ts            # Task CRUD
├── sla.controller.ts             # SLA breach CRUD
├── escalation.controller.ts      # Escalation CRUD
├── workflow.controller.ts        # Workflow CRUD
├── automation.controller.ts      # Automation CRUD
├── job-scheduler.controller.ts   # Job scheduler CRUD
└── intelligence.controller.ts    # Alerts & recommendations CRUD
```

### 3.7 Backend `src/services/`

**Purpose**: Business logic layer — 24 service files + Financial Engine module.
**Files**: 30

```
backend/src/services/
├── index.ts                      # Barrel export
├── auth.service.ts               # Authentication — login, verify, password management
├── user.service.ts               # User CRUD
├── vehicle.service.ts            # Vehicle CRUD with filtering
├── vehicle-lifecycle.service.ts  # Document expiry tracking
├── vehicle-owner.service.ts      # Vehicle owner CRUD, documents
├── booking.service.ts            # Booking CRUD, dashboard metrics, enrichment
├── expense.service.ts            # Expense CRUD, enrichment
├── journal.service.ts            # Journal entry CRUD, enrichment
├── journal-metrics.ts            # Journal aggregation metrics
├── outstanding.service.ts        # Outstanding CRUD, cash requirement forecast, ageing
├── settlement.service.ts         # Settlement CRUD, pipeline, payments, dashboard metrics
├── master.service.ts             # Master data CRUD (types + values)
├── report.service.ts             # Report generation (14 report types), history, templates
├── export.service.ts             # CSV/data export
├── notification.service.ts       # Notification CRUD, templates, preferences
├── reminder.service.ts           # Reminder CRUD
├── maintenance.service.ts        # Maintenance CRUD
├── scheduler.service.ts          # Service schedule CRUD
├── platform-assignment.service.ts # Platform assignment CRUD
├── settings.service.ts           # Settings CRUD (company, dashboard, financial, etc.)
├── revenue-calculator.ts         # Revenue calculation utilities
├── activity.service.ts           # Activity log
├── approval.service.ts           # Approval CRUD
├── task.service.ts               # Task CRUD
├── sla.service.ts                # SLA monitoring
├── escalation.service.ts         # Escalation management
├── workflow.service.ts           # Workflow engine (state machine)
├── automation.service.ts         # Automation rules
├── job-scheduler.service.ts      # Scheduled job management
├── vendor.service.ts             # Vendor CRUD
└── intelligence.service.ts       # Business alerts + recommendations
```

### 3.8 Backend `src/services/financial-engine/`

**Purpose**: Core financial calculation engine — all revenue/expense/profit/cash-flow logic.
**Files**: 10

```
backend/src/services/financial-engine/
├── index.ts                      # Barrel export
├── revenue.service.ts            # Revenue aggregation queries
├── expense.service.ts            # Expense aggregation queries
├── profit.service.ts             # Profit = Revenue − Expense calculations
├── cash-flow.service.ts          # Cash flow calculations
├── dashboard.service.ts          # Dashboard metrics aggregation
├── dashboard-aggregation.service.ts  # Lower-level dashboard aggregations
├── fleet-analytics.service.ts    # Fleet-wide analytics (utilization, maintenance rate)
├── analytics.service.ts          # Business analytics
└── notification-engine.service.ts # Threshold-based notification triggers
```

### 3.9 Backend `src/validators/`

**Purpose**: Zod validation schemas for request bodies, queries, and params.
**Files**: 26

```
backend/src/validators/
├── auth.ts                       # Login, change-password, create-user, update-user, update-profile, user-id params
├── vehicle.ts                    # Vehicle create/update schemas
├── booking.ts                    # Booking create/update schemas
├── expense.ts                    # Expense create/update schemas
├── journal.ts                    # Journal entry create/update schemas
├── outstanding.ts                # Outstanding create/update schemas
├── settlement.ts                 # Settlement create/update schemas, revenue models, payment methods
├── maintenance.ts                # Maintenance create/update schemas
├── master.ts                     # Master type/value schemas
├── vendor.ts                     # Vendor create/update schemas
├── report.ts                     # Report generation schemas
├── notification.ts               # Notification/reminder schemas
├── settings.ts                   # Settings schemas
├── scheduler.ts                  # Service schedule schemas
├── platform-assignment.ts        # Platform assignment schemas
├── vehicle-lifecycle.ts          # Document lifecycle schemas
├── vehicle-owner.ts              # Vehicle owner schemas
├── activity.ts                   # Activity query + entity params schemas
├── approval.ts                   # Approval schemas
├── task.ts                       # Task schemas
├── sla.ts                        # SLA schemas
├── escalation.ts                 # Escalation schemas
├── workflow.ts                   # Workflow schemas
├── automation.ts                 # Automation rule schemas
├── job-scheduler.ts              # Job scheduler schemas
└── intelligence.ts               # Alert/recommendation schemas
```

### 3.10 Backend `src/types/`

**Purpose**: Shared TypeScript type definitions.
**Files**: 2

```
backend/src/types/
├── index.ts                      # All domain types (1702 lines) — User, Vehicle, Booking, Expense,
│                                 #   Journal, Outstanding, Settlement, Workflow, Task, etc.
└── report.ts                     # Report-specific types (ReportType, ReportFilters, ReportResult, etc.)
```

### 3.11 Backend `src/utils/`

**Purpose**: Utility functions.
**Files**: 4

```
backend/src/utils/
├── helpers.ts                    # generateUUID, hashPassword, comparePassword, generateToken, verifyToken,
│                                 #   sanitizeUser, parsePagination, parseSort, parseFilters, getRolePermissions
├── logger.ts                     # Logging utility — 4 levels (error/warn/info/debug), JSON in production
├── errors.ts                     # Custom error classes (NotFoundError, ValidationError, UnauthorizedError, etc.)
└── response.ts                   # Standard API response helpers (sendSuccess, sendError, sendValidationError)
```

### 3.12 Backend `database/`

**Purpose**: Database migrations and seed files.
**Files**: 23

```
backend/database/
│
├── migrations/
│   ├── 001_create_users.ts               # users table + user_role ENUM
│   ├── 002_create_sessions.ts            # sessions table
│   ├── 003_create_audit_logs.ts          # audit_logs table + ENUMs
│   ├── 004_create_vehicles.ts            # vehicles table + indexes
│   ├── 005_create_master_data.ts         # master_types + master_values tables
│   ├── 006_create_bookings.ts            # bookings table + indexes
│   ├── 007_create_journal_entries.ts     # journal_entries table + indexes
│   ├── 008_create_expenses.ts            # expenses table + indexes
│   ├── 009_create_report_templates.ts    # report_templates + report_history tables
│   ├── 010_create_report_history.ts      # Additional report history columns
│   ├── 011_create_settings.ts            # 6 settings tables (company, dashboard, financial, notification, preferences, security)
│   ├── 012_create_notifications.ts       # notifications + reminders tables
│   ├── 013_create_fleet_vehicles.ts      # Additional fleet vehicle fields
│   ├── 014_financial_ops_enums_and_fields.ts  # Financial operation ENUMs + columns
│   ├── 20240601000001_create_outstandings.ts  # outstandings table
│   ├── 20240601000002_create_fleet_operations.ts  # Fleet operations tables
│   ├── 20240601000003_create_vehicle_owners.ts    # vehicle_owners + documents/events tables
│   ├── 20240601000004_create_settlements.ts       # settlements + settlement_* tables
│   ├── 20240601000005_create_source_of_truth_alignment.ts  # SoT alignment
│   ├── 20240601000006_create_workflow_operations.ts  # Workflow tables
│   └── 20240601000007_create_automation_intelligence.ts  # Automation + intelligence tables
│
└── seeds/
    ├── 001_seed_admin.ts              # Default admin user
    └── 002_seed_master_data.ts        # Master data seed (expense categories, platforms, payment modes, etc.)
```

---

## 4. Architecture Summary

### 4.1 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React | 19.2.7 |
| Build Tool | Vite | 8.1.0 |
| Styling | Tailwind CSS | 4.3.1 |
| Routing | React Router | 7.18.0 |
| Table | @tanstack/react-table | 8.21.3 |
| Forms | react-hook-form + @hookform/resolvers | 5.4.0 |
| Validation | Zod | 4.4.3 (frontend) / 3.23.8 (backend) |
| Animation | framer-motion | 12.42.0 |
| Charts | recharts | 3.9.0 |
| UI Primitives | @radix-ui/* | Multiple |
| Icons | lucide-react | 1.21.0 |
| Command Palette | cmdk | 1.1.1 |
| Linting | oxlint | 1.69.0 |
| **Backend Framework** | Express.js | 4.21.0 |
| **Database** | PostgreSQL | 16 (Alpine) |
| **Query Builder** | Knex | 3.1.0 |
| **Auth** | JSON Web Tokens | 9.0.2 |
| **Password Hashing** | bcryptjs | 2.4.3 |
| **Validation** | Zod | 3.23.8 |
| **Security Headers** | Helmet | 7.1.0 |
| **Rate Limiting** | express-rate-limit | 7.4.0 |
| **Logging** | Morgan + custom logger | 1.10.0 |
| **Dev Runner** | tsx | 4.19.0 |
| **TypeScript** | TypeScript | 6.0.2 (frontend) / 5.5.4 (backend) |

### 4.2 Frontend Architecture

```
Component Tree:
  GlobalErrorBoundary
  └── App
      └── Providers (Theme → Auth → Notification → AppStore)
          └── BrowserRouter
              ├── /login → AuthLayout → LoginPage
              ├── /change-password → AuthLayout → ChangePasswordPage
              └── / → ProtectedRoute → DashboardLayout
                  ├── Sidebar (collapsible, role-filtered navigation)
                  ├── Navbar (breadcrumb, search, command palette, notifications, user menu)
                  └── <Outlet> (26 lazy-loaded pages via React.lazy + Suspense)
                  │
                  ├── /dashboard
                  ├── /bookings
                  ├── /journal-ledger
                  ├── /expenses
                  ├── /outstandings
                  ├── /settlements
                  ├── /fleet
                  ├── /maintenance
                  ├── /service-schedules
                  ├── /analytics
                  ├── /reports
                  ├── /operations
                  ├── /tasks
                  ├── /automation
                  ├── /notifications
                  ├── /vehicles
                  ├── /vehicle-owners
                  ├── /vehicle-financials
                  ├── /masters/*
                  ├── /vendors
                  ├── /settings
                  ├── /notifications
                  ├── /settlement-dashboard
                  ├── /settlement-detail
                  ├── /vehicle-owner-detail
                  └── /change-password
```

### 4.3 Backend Architecture

```
Request Flow:
  Request → Helmet → CORS → Rate Limiter → Routes
    → Auth Middleware (JWT verification)
    → RBAC Middleware (role check)
    → Validation Middleware (Zod body/query/params)
    → Audit Middleware (CUD operations)
    → Controller (request parsing)
    → Service (business logic)
      → Financial Engine (financial calculations)
      → Database (Knex queries)
    → Response (standardized via response.ts)
  → Error Handler (Zod → validation error, operational → 4xx, unexpected → 500)

Route Organization:
  /api/v1/
  ├── /health              (public — health check + DB status)
  ├── /auth                (public + authenticated)
  ├── /users               (admin only)
  ├── /vehicles            (role-gated)
  ├── /bookings            (role-gated)
  ├── /expenses            (role-gated)
  ├── /journal             (role-gated)
  ├── /outstandings        (role-gated)
  ├── /settlements         (role-gated)
  ├── /vendors             (role-gated)
  ├── /maintenance         (role-gated)
  ├── /service-schedules   (role-gated)
  ├── /platform-assignments (role-gated)
  ├── /vehicle-owners      (role-gated)
  ├── /vehicle-lifecycle   (role-gated)
  ├── /masters             (role-gated)
  ├── /dashboard           (role-gated)
  ├── /analytics           (role-gated)
  ├── /reports             (role-gated)
  ├── /settings            (role-gated)
  ├── /notifications       (role-gated)
  ├── /reminders           (role-gated)
  ├── /workflows           (role-gated)
  ├── /approvals           (role-gated)
  ├── /tasks               (role-gated)
  ├── /sla                 (role-gated)
  ├── /escalations         (role-gated)
  ├── /activity            (role-gated)
  ├── /automation          (role-gated)
  ├── /scheduler           (role-gated)
  └── /intelligence        (role-gated)
```

### 4.4 Database Architecture

```
21 Migrations → 25+ tables:
├── users, sessions
├── audit_logs
├── vehicles
├── master_types, master_values
├── bookings
├── journal_entries
├── expenses
├── report_templates, report_history
├── settings (6 tables: company, dashboard, financial, notification, preferences, security)
├── notifications, reminders
├── outstandings
├── vehicle_owners, vehicle_owner_documents, ownership_events
├── settlements, settlement_bookings, settlement_expenses, settlement_payments
├── fleet operations tables
├── workflow tables
└── automation/intelligence tables
```

### 4.5 Deployment Architecture

```
Docker Compose:
  db (postgres:16-alpine) → backend (node:20-alpine) → frontend (nginx:alpine)
                          ↕
                    Named Volume: postgres_data

Standalone:
  Frontend: Vercel, Netlify, Cloudflare Pages, Nginx, Apache
  Backend:  PM2, Docker, Node.js direct
  Database: PostgreSQL (managed or self-hosted)

Platform Support:
  ├── Vercel:          vercel.json (root + frontend/)
  ├── Netlify:         public/_redirects
  ├── Cloudflare Pages: public/_redirects
  ├── Apache:          .htaccess
  ├── Nginx:           Dockerfile (frontend)
  └── Docker:          docker-compose.yml
```

### 4.6 File Count Summary

| Directory | Files | Purpose |
|---|---|---|
| Root | 40 | Documentation, config, Docker |
| frontend/src/pages/ | 28 | Page components |
| frontend/src/components/ | 67 | UI, shared, domain, layout components |
| frontend/src/hooks/ | 16 | Custom React hooks |
| frontend/src/services/ | 27 | API client services |
| frontend/src/types/ | 21 | TypeScript type definitions |
| frontend/src/validation/ | 13 | Zod form validation schemas |
| frontend/src/config/ | 3 | App configuration |
| frontend/src/stores/ | 2 | State management |
| frontend/src/providers/ | 4 | Context providers |
| frontend/src/routes/ | 2 | Route definitions |
| frontend/src/layouts/ | 2 | Layout components |
| frontend/src/lib/ | 1 | Utilities |
| frontend/src/app/ | 2 | App shell |
| frontend/src/ | 517 lines CSS | Global styles |
| **Frontend total** | **~190 source files** | |
| backend/src/services/ | 30 | Business logic services |
| backend/src/services/financial-engine/ | 10 | Financial calculation engine |
| backend/src/controllers/ | 29 | Request handlers |
| backend/src/routes/ | 30 | Route definitions |
| backend/src/validators/ | 26 | Zod validation schemas |
| backend/src/middleware/ | 7 | Express middleware |
| backend/src/types/ | 2 | TypeScript type definitions |
| backend/src/utils/ | 4 | Utilities |
| backend/src/config/ | 4 | App configuration |
| backend/database/migrations/ | 21 | Database schema migrations |
| backend/database/seeds/ | 2 | Seed data |
| **Backend total** | **~165 source files** | |
| **Grand total** | **~395+ files** | |

---

*Generated: 3 July 2026 — Complete canonical project structure for Marc8 Fleet Financial ERP v1.0*
