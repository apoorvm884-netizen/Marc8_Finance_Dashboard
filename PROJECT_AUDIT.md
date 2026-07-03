# Project Audit: Fleet Financial Dashboard

## Implemented Modules

| Module | Backend | Frontend | Status |
|--------|---------|----------|--------|
| Authentication | auth.service.ts, auth.controller.ts, auth middleware | Login, Change Password pages | Complete |
| RBAC | rbac middleware (5 roles) | ProtectedRoute, PermissionGuard | Complete |
| Fleet Master | Migration 013, fleet-analytics.service | Vehicle list + form | Complete |
| Platform Bookings | booking.service, controller, routes | List page, form drawer, dashboard widgets | Complete |
| Journal Ledger | journal.service, controller, routes | List page, form drawer | Complete |
| Expense Management | expense.service (x2), controller, routes | List page, form drawer, filters | Complete |
| Financial Engine | 9 services in financial-engine/ directory | — | Complete |
| Dashboard | dashboard.service, dashboard-aggregation.service | 7 widget components | Complete |
| Analytics | analytics.service, controller, routes | Analytics page with 8 chart sections | Complete |
| Reports | report.service, export.service, controller, routes | Report selector, generator, preview, templates | Complete |
| Notifications | notification.service, reminder.service, notification-engine | NotificationBell, combined page | Complete |
| Settings | settings.service, controller, routes | 6-tab settings page | Complete |
| Master Data | master.service, controller, routes | Dynamic master-values page by type | Complete |
| Shared Components | — | 11 shared + 20 UI components | Complete |

## Database Tables

| Table | Migration | Purpose |
|-------|-----------|---------|
| users | 001 | User accounts with roles |
| sessions | 002 | JWT session tracking |
| audit_logs | 003 | Audit trail |
| vehicles | 004 + 013 | Vehicle master + fleet fields |
| master_types | 005 | Master data type definitions |
| master_values | 005 | Configurable dropdown values |
| bookings | 006 + 014 | Booking records |
| journal_entries | 007 + 014 | Journal/ledger entries |
| expenses | 008 + 014 | Expense records |
| report_templates | 009 | Saved report templates |
| report_history | 010 | Generated report history |
| settings (6 tables) | 011 | Company, dashboard, financial, notification, user, security settings |
| notifications | 012 | In-app notifications |
| notification_templates | 012 | Notification templates |
| reminders | 012 | Reminder records |
| notification_preferences | 012 | User notification preferences |
| notification_history | 012 | Notification action history |

## API Endpoints

| Prefix | Endpoints |
|--------|-----------|
| `/api/v1/auth` | POST login, POST change-password |
| `/api/v1/users` | CRUD users |
| `/api/v1/vehicles` | CRUD + restore vehicles |
| `/api/v1/masters/:type` | CRUD + restore master values |
| `/api/v1/bookings` | CRUD + duplicate + restore + dashboard-metrics |
| `/api/v1/journal` | CRUD + duplicate + restore + metrics |
| `/api/v1/expenses` | CRUD + duplicate + restore |
| `/api/v1/dashboard` | GET aggregated dashboard data |
| `/api/v1/analytics` | 7 analytics endpoints |
| `/api/v1/reports` | Generate, export CSV/Excel, templates CRUD, history |
| `/api/v1/settings` | CRUD for 6 setting groups |
| `/api/v1/notifications` | List, unread count, mark read, delete |
| `/api/v1/reminders` | CRUD + restore + upcoming + due-today + process |
| `/api/v1/health` | Health check |

## Business Rules

- **Net Revenue** = Gross Fare + Doorstep Charges - Platform Commission (Financial Engine only)
- **Booking Statuses**: Booked → Active → Completed | Cancelled | Refunded
- **Payment Statuses**: Pending → Partially Paid → Paid | Refunded
- **Expense Statuses**: Pending → Approved | Rejected | Reimbursed
- **Journal Statuses**: Pending → Completed | Cancelled
- All financial values stored as `decimal(12,2)` in database
- All monetary values formatted as INR (`toLocaleString('en-IN')`) on frontend
- Soft delete with restore across all primary entities
- Deleted entities excluded from all aggregation queries

## Financial Engine Summary

Located at `backend/src/services/financial-engine/`:

| Service | Responsibilities |
|---------|-----------------|
| `revenue.service.ts` | Revenue trend, growth, platform performance, today's revenue, monthly revenue, heatmap |
| `expense.service.ts` | Expense trend, by category/vehicle/payment mode, today's/monthly expenses, large expenses |
| `profit.service.ts` | Daily/weekly/monthly/yearly profit, profit trend, net margin |
| `cash-flow.service.ts` | Cash flow summary, monthly trend, pending collections |
| `dashboard-aggregation.service.ts` | Aggregated metrics for dashboard |
| `dashboard.service.ts` | Consolidated dashboard endpoint (aggregates all engine services) |
| `fleet-analytics.service.ts` | Revenue per vehicle, fleet summary, top/lowest performing, vehicle profitability |
| `analytics.service.ts` | Combined analytics, platform comparison, expense breakdown, cash flow analytics |
| `notification-engine.service.ts` | Expiry alerts, dashboard notifications, outstanding collections |

## Security Features

- **JWT Authentication**: Token-based auth with configurable expiration (8h default)
- **RBAC**: 5 roles with middleware-level permission checks per endpoint
- **Input Validation**: Zod schemas on every mutation endpoint
- **Rate Limiting**: Express rate limiter on all API routes
- **Audit Logging**: Critical operations logged to audit_logs table
- **Password Security**: bcrypt password hashing, minimum 8 chars, mixed case + numbers
- **Force First Login**: New users must change password on first login
- **SQL Injection Prevention**: Parameterized queries via Knex
- **CORS**: Configurable origin whitelist
- **Error Handling**: Centralized error handler, no stack traces in production

## RBAC Summary

| Role | Level | Permissions |
|------|-------|-------------|
| SUPER_ADMIN | 5 | Full system access, user management, settings |
| ADMIN | 4 | All business operations, reports, settings |
| MANAGER | 3 | Business operations, reports, limited settings |
| OPERATOR | 2 | Create/view/edit records, no delete |
| VIEWER | 1 | Read-only access to all modules |

## Notifications

- **Types**: system, success, warning, error, info
- **Reminder Types**: 12 types (insurance_renewal, vehicle_service_due, road_tax_due, permit_expiry, fastag_low_balance, pending_journal_entries, pending_expenses, pending_bookings, high_expense_alert, negative_profit_alert, inactive_vehicles, vehicles_without_bookings)
- **Delivery**: In-app only (30-second polling)
- **Features**: Unread count badge, mark as read, delete, notification preferences, reminder auto-processing

## Reports

- **18 Report Types**: Daily/Weekly/Monthly/Yearly financial, vehicle revenue/expense/profit, platform revenue/commission/net_revenue, journal collection, expense category/payment mode, fleet performance, profit/loss, fleet utilization, outstanding collection
- **Export**: CSV and Excel formats
- **Templates**: Save/load/share report configurations
- **History**: Track generated reports

## Analytics

- **7 Endpoints**: Revenue, expense, profit, vehicle performance, platform comparison, expense category breakdown, combined analytics
- **Visualizations**: Growth KPIs, trend charts, comparison charts, bar charts
- **Performance**: Parallelized queries, server-side aggregation

## Performance Optimizations

- Lazy-loaded routes (React.lazy)
- Debounced search inputs
- Paginated API responses
- Efficient database indexes (30+ indexes)
- Parallelized Promise.all in analytics and dashboard
- Financial Engine singleton pattern (no repeated instantiation)
- Chunked file exports for large datasets
- Optimized SELECT (no SELECT *)

## Remaining Future Enhancements

- Email/SMS notification delivery
- Light theme support
- Real-time WebSocket updates
- Mobile-responsive optimization
- Multi-tenancy support
- CI/CD pipeline
- Automated test suite (unit + integration + e2e)
- API documentation (OpenAPI/Swagger)
- `deleted_by` column migration for `reminders` and `master_values` tables
- Internationalization (i18n)
- Data export scheduling
- Bulk import via CSV/Excel
