# Contributing Guide

## Development Workflow

```bash
# 1. Clone and install
git clone <repo-url>
cd fleet-financial-dashboard
cd backend && npm install
cd ../frontend && npm install

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your database URL

# 3. Setup database
createdb fleet_financial_dashboard
cd ../backend && npx knex migrate:latest && npx knex seed:run

# 4. Start development (two terminals)
cd backend && npm run dev    # Port 5000
cd frontend && npm run dev   # Port 3000
```

## Code Quality

Every change must pass:

```bash
# Frontend
cd frontend
npm run typecheck   # TypeScript (strict mode)
npm run lint        # oxlint

# Backend
cd backend
npm run typecheck   # TypeScript
```

Zero TypeScript errors and zero lint errors are required before any commit.

## Architecture Rules

### Financial Engine Isolation
All financial calculations (revenue, expense, profit, cash flow, fleet analytics) live exclusively in `backend/src/services/financial-engine/`. No component, controller, or service outside this engine may calculate financial values directly.

### The `data-table` Generic Constraint
The `DataTable` component uses `TData` (unconstrained). When defining columns, use `ColumnDef<T>` without index signature requirements:

```tsx
const columns: ColumnDef<Booking>[] = [...];
<DataTable columns={columns} data={bookings} />
```

### Soft Delete Pattern
All primary entities support soft delete with `deleted_at` and `deleted_by`. Queries must include `WHERE deleted_at IS NULL`. Restore operations set `deleted_at = NULL`.

### Service Layer Pattern
Services are stateless objects with async methods. They call the API client (`api.get`, `api.post`, etc.) which handles authentication, retries, and error normalization.

## Coding Standards

### TypeScript
- Strict mode is enabled (`strict: true` in tsconfig)
- `noUnusedLocals` and `noUnusedParameters` are enabled
- Avoid `any`. Use `unknown` with proper narrowing.
- Use `const` for immutable values and `type`/`interface` for shared shapes.

### Naming
- Files: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- Exports: Named exports only (no `default` exports for components in `components/`)
- Hooks: `use-prefix` (`useAuth`, `useDebounce`)
- Services: Lowercase with dots (`booking.service.ts`, `api-client.ts`)

### State Management
- Global state: Auth (user/token), Theme, Notifications
- Page state: Local `useState` with `useCallback` for fetch functions
- No Zustand or Redux. The `app-store.tsx` uses React Context.
- No global state for server data. Cache via React Query patterns is not used (keep it simple).

### API Client
The `api-client.ts` handles:
- Automatic JWT token injection
- Retry logic for 5xx/429 responses
- 401 redirect to login
- JSON content type negotiation

### Error Handling
- API errors: Throw `ApiError` with status, code, and details
- UI errors: Display via `ErrorState` component or notification toast
- Catch blocks: Always use `parseError()` from `@/lib/utils` for consistent messages
- Never expose raw stack traces to users

## Pull Request Guidelines

- One concern per PR
- Include before/after for visual changes
- Add typecheck and lint results in PR description
- Reference the original issue/requirement

## Role-Based Access Control (RBAC)

Five roles in order of increasing privilege:
1. `VIEWER` - Read-only
2. `OPERATOR` - CRUD on records, no delete
3. `MANAGER` - Full operations, limited settings
4. `ADMIN` - All operations, settings
5. `SUPER_ADMIN` - Full system access

Role values are lowercase strings matching PostgreSQL ENUM values (`super_admin`, `admin`, `manager`, `operator`, `viewer`).

Use `PERMISSIONS` constants rather than inline role arrays:

```tsx
// Good
const allowed = PERMISSIONS.MANAGE_BOOKINGS.includes(user.role);

// Avoid
const allowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER].includes(user.role as never);
```
