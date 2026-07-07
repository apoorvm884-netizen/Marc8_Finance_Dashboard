# Testing Foundation Certification

## Marc8 Fleet Financial ERP

**Date:** 2026-07-07  
**Status:** Certified — Critical Blocker C1 Resolved  
**Previous State:** Zero testing infrastructure (C1: NO in enterprise audit)  
**Current State:** Professional testing foundation with 39 passing tests  

---

## Framework Selected

**Vitest v4** — single test runner for both backend and frontend.

Rationale:
- **Single runner** across both packages (Node + jsdom/React)
- **Native TypeScript/ESM** — zero configuration for `.ts` files
- **Fast** — uses esbuild for transformation, sub-second test runs
- **Jest-compatible API** — `describe`/`it`/`expect`, easy migration path
- **Built-in coverage** via v8 provider (no Istanbul dependency)
- **Vite-native** — frontend already uses Vite; backend config is trivial

---

## Folder Structure

```
backend/
├── __tests__/
│   ├── unit/
│   │   ├── auth/
│   │   │   └── auth.service.test.ts          (6 tests)
│   │   ├── master/
│   │   │   └── master.service.test.ts         (5 tests)
│   │   └── financial-engine/
│   │       └── revenue.service.test.ts        (16 tests)
│   └── integration/
│       └── api/
│           └── auth.test.ts                   (5 tests)
├── vitest.config.ts
└── src/...

frontend/
├── __tests__/
│   ├── setup.ts
│   └── components/
│       └── Button.test.tsx                    (7 tests)
├── vitest.config.ts
└── src/...

__tests__/
└── README.md                                   (documentation + recipe)
```

**Total: 5 test files, 39 tests, 0 failures**

| Layer | File | Tests | Type |
|---|---|---|---|
| Authentication | `auth.service.test.ts` | 6 | Unit |
| Master Data | `master.service.test.ts` | 5 | Unit |
| Financial Engine | `revenue.service.test.ts` | 16 | Unit |
| API Endpoint | `auth.test.ts` | 5 | Integration |
| React Component | `Button.test.tsx` | 7 | Component |

---

## Commands

### Backend
```bash
cd backend
npm test              # vitest run — 32 tests in ~500ms
npm run test:watch    # vitest — watch mode
npm run test:coverage # vitest run --coverage
```

### Frontend
```bash
cd frontend
npm test              # vitest run — 7 tests in ~650ms
npm run test:watch    # vitest — watch mode
npm run test:coverage # vitest run --coverage
```

---

## Coverage Configuration

| Setting | Backend | Frontend |
|---|---|---|
| Provider | `v8` | `v8` |
| Reports | text, json, html | text, json, html |
| Output dir | `__tests__/coverage/` | `__tests__/coverage/` |
| Include | `src/**/*.ts` | `src/**/*.{ts,tsx}` |
| Exclude | `types/`, `config/env.ts`, `index.ts` | `types/`, `main.tsx`, `vite-env.d.ts` |

Coverage threshold is not enforced — the goal is a professional foundation, not chasing percentages.

---

## Mocking Strategy

### Backend — Database Mocking Pattern

All backend services depend on `getDatabase()` from `src/config/database.ts` which returns a Knex instance. The standard mock pattern:

```ts
vi.mock('../../../src/config/database', () => ({
  getDatabase: vi.fn(),
}));

function createMockDb() {
  const qb = {
    where: vi.fn().mockReturnThis(),
    whereNull: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    // ... all Knex QueryBuilder methods
  };
  const db: any = vi.fn(() => qb);       // callable: db('table_name')
  db.fn = { now: vi.fn().mockReturnValue('2024-01-01T00:00:00.000Z') };
  return db;
}
```

Key design decisions:
- `db` is a **callable function** (Knex is callable: `knex('table_name')`)
- Each `db()` call returns a fresh query builder for isolated test setup
- `vi.clearAllMocks()` in `beforeEach` ensures clean state
- Token generation and password comparison are mocked for deterministic assertions
- Environment config and logger are suppressed in tests

### Frontend — Component Testing Pattern

- **`@testing-library/react`** — renders components in jsdom
- **`@testing-library/jest-dom/vitest`** — DOM matchers (`toBeInTheDocument`, `toBeDisabled`)
- **`@testing-library/user-event`** — simulates realistic user interactions
- `@/` path alias resolved via `resolve.alias` in vitest config

---

## Fixtures

Test fixtures are defined inline within each test file. For example:

- **Auth tests**: `mockUser` object with all required user fields
- **Master data tests**: `mockTypes` array, `mockPlatformType` object
- **Financial engine tests**: No fixtures needed (pure computation)

No external fixture files are needed at this scale. As the test suite grows, common fixtures can be extracted to `backend/__tests__/fixtures/` or `frontend/__tests__/fixtures/`.

---

## Test Database Strategy

| Test Type | Database Required | Strategy |
|---|---|---|
| Backend unit | No | All DB calls mocked via `createMockDb()` |
| Backend integration | No | Mocked DB + supertest for HTTP assertions |
| Frontend component | No | jsdom virtual DOM |
| Future: true DB integration | Yes | `knexfile.ts` test env → `fleet_dashboard_test` DB via docker-compose |

The existing `knexfile.ts` already has a `test` environment configured for `fleet_dashboard_test` database. When true integration tests are needed, they can use Docker Compose to spin up Postgres, run migrations, and execute queries against the real database.

---

## How Future Developers Add Tests

### Backend Unit Test
```bash
touch backend/__tests__/unit/<domain>/<service>.test.ts
```
1. Import the service
2. Mock `getDatabase()` with `vi.mock()`
3. Use `createMockDb()` to set up query return values
4. Write `describe`/`it`/`expect` assertions
5. Run: `cd backend && npm test`

### Backend Integration Test
```bash
touch backend/__tests__/integration/api/<endpoint>.test.ts
```
1. Build an Express app instance (see `auth.test.ts` for pattern)
2. Mock all external dependencies (DB, env, logger, helpers)
3. Use `supertest` for HTTP requests
4. Assert on response status, body, and headers

### Frontend Component Test
```bash
touch frontend/__tests__/components/<Component>.test.tsx
```
1. Import the component
2. Render with `render(<Component />)` from `@testing-library/react`
3. Find elements with `screen.getByRole` / `screen.getByText`
4. Simulate user input with `userEvent`
5. Assert with jest-dom matchers

---

## Starter Tests — Proof of Functionality

### ✅ Authentication (`auth.service.test.ts` — 6 tests)
- Login with valid credentials returns token + sanitized user
- Login with invalid username throws 401
- Login with inactive account throws deactivation error
- Change password succeeds for valid current password
- Change password throws for non-existent user
- Get profile returns sanitized user

### ✅ Financial Engine (`revenue.service.test.ts` — 16 tests)
- `calculateNetRevenue`: 4 tests (normal, zero, negative commission, rounding)
- `calculateBookingCommission`: 3 tests (percentage, zero, rounding)
- `calculateBookingRefund`: 2 tests (positive, negative cap)
- `validateFinancials`: 4 tests (valid, negative gross fare, negative doorstep, negative commission)
- Database queries: 3 tests (today's revenue, null returns 0, monthly revenue)

### ✅ Master Data (`master.service.test.ts` — 5 tests)
- `getMasterTypes`: returns all types ordered by code
- `getMasterValues`: paginated results with metadata
- `getMasterValues`: throws for invalid type
- `createMasterValue`: creates and returns new value
- `createMasterValue`: throws for duplicate code

### ✅ API Endpoint (`auth.test.ts` — 5 tests)
- POST /api/v1/auth/login: 200 with token for valid credentials
- POST /api/v1/auth/login: 401 for invalid credentials
- POST /api/v1/auth/login: 422 for validation errors
- POST /api/v1/auth/login: 422 for missing password
- GET /api/v1/health: 200 with status

### ✅ React Component (`Button.test.tsx` — 7 tests)
- Renders with default variant
- Renders with 5 different variants (destructive, outline, ghost, link, secondary)
- Renders with 3 different sizes (sm, lg, icon)
- Shows loading spinner and disables button
- Fires onClick on user click
- Does not fire onClick when disabled
- Renders as child component via `asChild` prop

---

## Remaining Recommended Tests

The following should be added by developers as part of regular development workflow:

### Backend Unit (High Priority for Coverage)
- [ ] User service: CRUD operations, activation toggle, role assignment
- [ ] Vehicle service: CRUD, status transitions, duplicate detection
- [ ] Booking service: CRUD, cancellation, refund calculation
- [ ] Expense service: CRUD, approval/rejection workflow
- [ ] Journal service: CRUD, metrics calculation
- [ ] Settlement service: pipeline execution, distribution calculation
- [ ] Other financial engine services: expense.service, profit.service, cash-flow.service
- [ ] Auth middleware: `authenticate()` and `optionalAuth()`
- [ ] RBAC middleware: `authorize()` role checks
- [ ] Validation middleware: `validate()` Zod schema enforcement
- [ ] Utility functions: pagination, sorting, filtering, response helpers
- [ ] All Zod validator schemas

### Backend Integration (Medium Priority)
- [ ] Master data CRUD endpoints (GET/POST/PUT/DELETE)
- [ ] Vehicle CRUD endpoints
- [ ] Booking CRUD endpoints with status transitions
- [ ] Protected route access control (401 no token, 403 wrong role)
- [ ] Rate limiting behavior on auth endpoints

### Frontend Component (Medium Priority)
- [ ] Input component: rendering, error states, icon support
- [ ] DataTable component: columns, sorting, pagination, loading, empty states
- [ ] Select component: rendering options, selection events
- [ ] Badge component: all variants (success, warning, info, destructive)
- [ ] Dialog component: open/close lifecycle, confirm action

### Frontend Service/Integration (Lower Priority)
- [ ] api-client: retry logic, error handling, auth token injection
- [ ] auth-provider: login flow, token persistence, guest mode
- [ ] use-master-values hook: data fetching, caching

---

## Certification Statement

I certify that:

1. **Framework**: Vitest v4 selected and configured for both backend and frontend
2. **Configuration**: vitest.config.ts in both packages with coverage, aliases, and proper environments
3. **Folder structure**: `__tests__/` directories in backend/ and frontend/ with unit, integration, and component subdirectories
4. **Mocking**: Standardized `createMockDb()` pattern for database mocking; `vi.mock()` for helpers, env, and logger
5. **Fixtures**: Inline test fixtures in each test file
6. **Test database**: `knexfile.ts` test environment ready for future real DB integration tests
7. **Starter tests**: 39 passing tests covering authentication, financial engine computations, master data CRUD, API endpoints, and React components
8. **No business logic changed**: All source files untouched — only test files and configs added
9. **No frontend behavior changed**: Component test validates existing behavior
10. **No API contracts changed**: Integration test uses existing routes unchanged

**Critical Blocker C1 is resolved. The project has an enterprise-grade testing foundation.**

---

## Verification

```
Backend:  32 tests passed (4 files, 512ms)
Frontend:  7 tests passed (1 file, 642ms)
Total:    39 tests passed (5 files)
Coverage:  Configured (v8 provider, text/json/html reports)
```
