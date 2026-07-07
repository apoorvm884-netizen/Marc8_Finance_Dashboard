# Test Suite — Fleet Financial ERP

## Framework

**Vitest** — single test runner for both backend (Node) and frontend (jsdom/React).

## Structure

```
├── backend/
│   ├── __tests__/
│   │   ├── unit/
│   │   │   ├── auth/auth.service.test.ts
│   │   │   ├── master/master.service.test.ts
│   │   │   └── financial-engine/revenue.service.test.ts
│   │   └── integration/
│   │       └── api/auth.test.ts
│   ├── vitest.config.ts
│   └── src/...
├── frontend/
│   ├── __tests__/
│   │   ├── setup.ts
│   │   └── components/Button.test.tsx
│   ├── vitest.config.ts
│   └── src/...
└── __tests__/
    └── README.md
```

## Commands

### Backend
```bash
cd backend
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### Frontend
```bash
cd frontend
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

## Coverage Configuration

- Provider: v8 (native, fast)
- Reports: text (console), json (CI), html (browser)
- Excludes: `types/`, entry points, `config/env.ts`

## Mocking Strategy

### Backend
- Database: All unit tests mock `getDatabase()` from `src/config/database.ts`
- Auth helpers: Token generation mocked for deterministic assertions
- Logger: Suppressed in test environment
- Pattern: Each test creates fresh mock query builders with `vi.fn()`

### Frontend
- Component tests: `@testing-library/react` with jsdom environment
- Setup: `@testing-library/jest-dom` matchers loaded globally

## Test Database Strategy

- Unit tests: No database required (all DB calls mocked)
- Integration tests: supertest + mocked database (no real Postgres needed)
- Future: For true DB integration, use `knexfile.ts` test environment with `fleet_dashboard_test` + docker-compose

## How to Add Tests

### Backend Unit Test
1. Create `backend/__tests__/unit/<domain>/<name>.test.ts`
2. Import the service; mock `getDatabase()` with `vi.mock()`
3. Use `createMockQueryBuilder()` pattern for DB mocks
4. Write tests with `describe`/`it`/`expect`

### Backend Integration Test
1. Create `backend/__tests__/integration/api/<name>.test.ts`
2. Build Express app instance, mock deps, use supertest

### Frontend Component Test
1. Create `frontend/__tests__/components/<Name>.test.tsx`
2. Render with `@testing-library/react`, interact with `userEvent`

## Remaining Recommended Tests

### Backend Unit (High Priority)
- [ ] User service (CRUD, activation, role management)
- [ ] Vehicle service (CRUD, status transitions)
- [ ] Booking service (create, update, cancel, refund)
- [ ] Expense service (CRUD, approval workflow)
- [ ] Journal service (CRUD, metrics calculation)
- [ ] Settlement engine (pipeline run, distribution calculation)
- [ ] Financial engine: expense.service, profit.service, cash-flow.service
- [ ] Middleware: auth (authenticate, optionalAuth), RBAC (authorize)
- [ ] Validators: Zod schemas for all entity types

### Backend Integration (Medium)
- [ ] Master data CRUD endpoints
- [ ] Vehicle CRUD endpoints
- [ ] Booking CRUD endpoints
- [ ] Protected routes (401 without token, 403 without role)

### Frontend Component (Medium)
- [ ] Input component (rendering, validation)
- [ ] DataTable component (rendering, sorting)
- [ ] Select, Badge, Dialog components

### Frontend Service (Lower)
- [ ] api-client (retry, error handling)
- [ ] Auth provider (login flow, guest mode)
