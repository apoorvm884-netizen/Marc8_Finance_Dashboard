# Business Rules Freeze — Fleet Financial ERP

> Version 1.0 — Phase 6A  
> **These rules are frozen and may not be violated by any implementation.**

---

## Part 10 — Non-Negotiable Business Rules (Invariants)

### INV1. Financial Calculation Singularity
**Rule**: All financial calculations (revenue, expense, profit, cash flow, fleet analytics) MUST be computed exclusively by the Financial Engine (`backend/src/services/financial-engine/`).
**Applies to**: Net revenue, commission, refunds, profit, margin, cash flow, fleet health metrics.
**Violation**: Any controller, service, or frontend component directly calculating financial values.
**Enforcement**: Code review gate.

### INV2. Net Revenue Formula Immutability
**Rule**: `net_revenue = gross_fare + doorstep_charges - platform_commission`
**Applies to**: Booking creation and update.
**Violation**: Using any other formula for net revenue.
**Source**: Financial Engine `revenue.service.ts`.

### INV3. Completed Booking Immutability
**Rule**: COMPLETED booking's financial fields (gross_fare, doorstep_charges, platform_commission, net_revenue) MUST NOT be modified after status is COMPLETED.
**Applies to**: Booking update operations.
**Violation**: Allowing edits to financial fields of COMPLETED bookings.
**Note**: Refund processing creates a REFUNDED booking (new status) rather than modifying the original.

### INV4. Paid Outstanding Frozen
**Rule**: Outstandings with status `paid` or `partially_paid` MUST NOT allow editing of amount, due_date, title, or category fields.
**Applies to**: Outstanding update operations.
**Violation**: Allowing edits to paid outstandings.

### INV5. Maintenance History Immutability
**Rule**: Maintenance records, once created, maintain their integrity. Cost, service_date, and parts data MUST NOT be altered in a way that breaks audit trail.
**Applies to**: Maintenance update operations.
**Note**: Soft delete is allowed, but historical accuracy of maintenance data is preserved.

### INV6. Single Active Platform Assignment
**Rule**: A vehicle MUST have at most one active platform assignment at any time.
**Applies to**: Platform assignment creation.
**Enforcement**: When creating new active assignment, any existing active assignment is auto-ended.

### INV7. No Orphan Records
**Rule**: All foreign key references MUST resolve to existing records. Soft-deleted records are still valid FK targets for read operations.
**Applies to**: All entity relationships.
**Violation**: Vehicle references in bookings where vehicle is hard-deleted.

### INV8. Soft Delete Mandate
**Rule**: All primary business entities MUST use soft delete (`deleted_at`, `deleted_by` columns) rather than hard delete.
**Applies to**: Vehicles, bookings, expenses, outstandings, journal entries, vendors, maintenance records, service schedules, reminders, master values.
**Violation**: Using `DELETE FROM` SQL statement on any entity table.

### INV9. Audit Trail Mandate
**Rule**: Every CREATE, UPDATE, DELETE, RESTORE, ACTIVATE, DEACTIVATE operation on business entities MUST be logged in the `audit_logs` table.
**Applies to**: All CUD operations via controllers.
**Fields captured**: user_id, action, entity_type, entity_id, old_values (JSON), new_values (JSON), ip_address, user_agent.

### INV10. UUID Primary Keys
**Rule**: All entity primary keys MUST be UUIDs generated via `gen_random_uuid()`.
**Applies to**: All database tables.
**Violation**: Sequential integer IDs or custom ID schemes.

### INV11. Monetary Type Constraint
**Rule**: All monetary value columns MUST be `DECIMAL(12,2)` in the database.
**Applies to**: amount, total, gross_fare, net_revenue, platform_commission, doorstep_charges, discount, taxes, refund, cost, unit_price, total_price, purchase_price, paid_amount, amount_collected, total_amount.
**Violation**: Using FLOAT, INTEGER, or VARCHAR for monetary values.

### INV12. Paginated List Responses
**Rule**: All list endpoints MUST return paginated responses with `{data[], meta: {page, limit, total, totalPages, hasNextPage, hasPreviousPage}}`.
**Applies to**: All GET endpoints returning collections.
**Violation**: Returning unbounded arrays.

### INV13. Input Validation Requirement
**Rule**: Every mutation endpoint MUST validate input through a Zod schema before processing.
**Applies to**: All POST, PUT, PATCH endpoints.
**Enforcement**: Validation middleware applied to all routes.

### INV14. RBAC Enforcement
**Rule**: Every non-public endpoint MUST enforce role-based access control via the `authorize()` middleware.
**Applies to**: All authenticated routes.
**Exception**: Public routes (login) skip RBAC.
**Roles**: SUPER_ADMIN, ADMIN, MANAGER, OPERATOR, VIEWER.

### INV15. Master Data Centralization
**Rule**: All dropdown options, category types, and configurable enumerations MUST be stored in `master_types` / `master_values` tables, NOT hardcoded in code.
**Applies to**: Expense categories, payment modes, platforms, ledger categories, outstanding categories, vendor types, maintenance types, part categories, service types, timeline event types.
**Exception**: Entity statuses (AVAILABLE, BOOKED, PENDING, CONFIRMED, etc.) are valid as TypeScript enums in code.

### INV16. JWT Authentication Mandate
**Rule**: All authenticated routes MUST validate JWT Bearer tokens from the Authorization header.
**Applies to**: All routes except `/auth/login` and `/health`.
**Token contents**: userId, username, role.

### INV17. First Login Password Change
**Rule**: Users with `is_first_login = true` MUST be forced to change password on their next login.
**Applies to**: Authentication flow, frontend route guard.

### INV18. Deleted Entity Exclusion
**Rule**: Soft-deleted records MUST be excluded from all aggregation queries (dashboard, analytics, reports) unless explicitly requested via `include_deleted` parameter.
**Applies to**: Revenue sums, expense sums, vehicle counts, profit calculations, all aggregate functions.

### INV19. System Master Value Protection
**Rule**: Master values marked `is_system = true` MUST NOT be deletable.
**Applies to**: Master data delete operations.

### INV20. No Direct Database Access from Frontend
**Rule**: The frontend MUST NEVER directly access the database. All data operations MUST go through the REST API.
**Applies to**: Frontend code.
**Violation**: Client-side database queries, embedded SQL, direct database connections from frontend.

### INV21. Password Security Standards
**Rule**: Passwords MUST be hashed using bcrypt before storage. Minimum 8 characters, must contain uppercase, number, and special character.
**Applies to**: User creation and password change.

### INV22. Financial Year Integrity
**Rule**: Financial year settings MUST be configurable (not hardcoded to April-March). All fiscal period calculations MUST respect the configured financial year start month.
**Applies to**: Financial Engine, Reports, Analytics.

### INV23. Booking-Revenue Consistency
**Rule**: Every booking's net_revenue MUST be calculated by the Financial Engine at creation and re-calculated whenever financial fields change.
**Applies to**: Booking create and update.
**Violation**: Allowing net_revenue to be directly set by the user.

### INV24. Expense → Outstanding Link Integrity
**Rule**: When an outstanding is marked as paid, the resulting expense MUST reference the outstanding via `paid_as_expense_id`. The expense status MUST be APPROVED (not PENDING).
**Applies to**: Outstanding mark-as-paid workflow.

### INV25. No Negative Monetary Values
**Rule**: All monetary inputs (gross_fare, doorstep_charges, platform_commission, amount, cost, etc.) MUST be ≥ 0.
**Applies to**: Input validation for all financial fields.
**Exception**: Refund amounts recorded in booking (refund ≥ 0, stored separately).

### INV26. Booking ID Uniqueness
**Rule**: `booking_id` (the external platform's booking ID) MUST be unique within the system.
**Applies to**: Booking creation.
**Enforcement**: Database unique constraint or service-level check.

### INV27. Vehicle Number Uniqueness
**Rule**: `vehicle_number` (license plate) MUST be unique within the system.
**Applies to**: Vehicle creation and update.
**Enforcement**: Database unique constraint.

### INV28. Audit Log Immutability
**Rule**: Audit log entries MUST NOT be editable or deletable. They are append-only.
**Applies to**: audit_logs table.

### INV29. Reporting Data Consistency
**Rule**: All report generation MUST use the same Financial Engine functions as the dashboard and analytics. Report results MUST be reproducible with the same filters.
**Applies to**: Report generation.

### INV30. REST API Contract Stability
**Rule**: Once implemented, API response shapes MUST NOT change without versioning (`/api/v1/` prefix).
**Applies to**: All API endpoints.
**Rationale**: Frontend depends on stable API contracts.

---

## Business Rule Enforcement Mechanisms

| Rule | Enforcement Layer | Verification Method |
|------|-----------------|-------------------|
| INV1-2 | Code organization | Backend module boundary review |
| INV3-4 | Service logic | Unit tests covering forbidden transitions |
| INV5 | Service logic | Audit log verification |
| INV6 | Service logic | Assignment creation test |
| INV7 | Database constraints | FK constraints in migrations |
| INV8 | Code conventions | Migration review |
| INV9 | Middleware | Audit log table inspection |
| INV10 | Database schema | Migration review |
| INV11 | Database schema | Column type review |
| INV12 | Route conventions | API response shape tests |
| INV13 | Middleware | Route definition review |
| INV14 | Middleware | Route definition review |
| INV15 | Architecture | Master data usage audit |
| INV16 | Middleware | Route definition review |
| INV17 | Frontend/Auth | Login flow test |
| INV18 | Service logic | Aggregation query review |
| INV19 | Service logic | Delete endpoint test |
| INV20 | Architecture | Build-time verification |
| INV21 | Service logic | Password hash inspection |
| INV22 | Service logic | Settings usage audit |
| INV23 | Service logic | Booking create/update test |
| INV24 | Service logic | Mark-as-paid workflow test |
| INV25 | Validation | Zod schema review |
| INV26 | Database+Service | Unique constraint + test |
| INV27 | Database+Service | Unique constraint + test |
| INV28 | Architecture | Audit endpoint RBAC |
| INV29 | Architecture | Cross-function comparison |
| INV30 | Architecture | API versioning strategy |
