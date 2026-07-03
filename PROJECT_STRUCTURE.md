# Project Structure

```
Fleet Financial Dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── constants.ts
│   │   │   ├── database.ts
│   │   │   ├── env.ts
│   │   │   └── index.ts
│   │   ├── controllers/
│   │   │   ├── analytics.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── booking.controller.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── expense.controller.ts
│   │   │   ├── journal.controller.ts
│   │   │   ├── master.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── report.controller.ts
│   │   │   ├── settings.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   └── vehicle.controller.ts
│   │   ├── middleware/
│   │   │   ├── audit.ts
│   │   │   ├── auth.ts
│   │   │   ├── error-handler.ts
│   │   │   ├── index.ts
│   │   │   ├── rate-limiter.ts
│   │   │   ├── rbac.ts
│   │   │   └── validate.ts
│   │   ├── routes/
│   │   │   ├── analytics.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── booking.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   ├── expense.routes.ts
│   │   │   ├── index.ts
│   │   │   ├── journal.routes.ts
│   │   │   ├── master.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   ├── report.routes.ts
│   │   │   ├── settings.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── vehicle.routes.ts
│   │   ├── services/
│   │   │   ├── financial-engine/
│   │   │   │   ├── analytics.service.ts
│   │   │   │   ├── cash-flow.service.ts
│   │   │   │   ├── dashboard-aggregation.service.ts
│   │   │   │   ├── dashboard.service.ts
│   │   │   │   ├── expense.service.ts
│   │   │   │   ├── fleet-analytics.service.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── notification-engine.service.ts
│   │   │   │   ├── profit.service.ts
│   │   │   │   └── revenue.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── expense.service.ts
│   │   │   ├── export.service.ts
│   │   │   ├── index.ts
│   │   │   ├── journal-metrics.ts
│   │   │   ├── journal.service.ts
│   │   │   ├── master.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── reminder.service.ts
│   │   │   ├── report.service.ts
│   │   │   ├── revenue-calculator.ts
│   │   │   ├── settings.service.ts
│   │   │   ├── user.service.ts
│   │   │   └── vehicle.service.ts
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   └── report.ts
│   │   ├── utils/
│   │   │   ├── errors.ts
│   │   │   ├── helpers.ts
│   │   │   ├── logger.ts
│   │   │   └── response.ts
│   │   ├── validators/
│   │   │   ├── auth.ts
│   │   │   ├── booking.ts
│   │   │   ├── expense.ts
│   │   │   ├── journal.ts
│   │   │   ├── master.ts
│   │   │   ├── notification.ts
│   │   │   ├── report.ts
│   │   │   ├── settings.ts
│   │   │   └── vehicle.ts
│   │   └── index.ts
│   ├── .env
│   ├── .env.example
│   ├── knexfile.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── dist/                         # Build output
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.tsx
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── bookings/
│   │   │   │   ├── booking-dashboard-widgets.tsx
│   │   │   │   ├── booking-form.tsx
│   │   │   │   └── index.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard-alerts.tsx
│   │   │   │   ├── dashboard-breakdown-charts.tsx
│   │   │   │   ├── dashboard-global-filters.tsx
│   │   │   │   ├── dashboard-kpi-cards.tsx
│   │   │   │   ├── dashboard-recent-activity.tsx
│   │   │   │   ├── dashboard-top-vehicles.tsx
│   │   │   │   └── dashboard-trend-charts.tsx
│   │   │   ├── expenses/
│   │   │   │   ├── expense-form.tsx
│   │   │   │   └── index.ts
│   │   │   ├── journal/
│   │   │   │   ├── index.ts
│   │   │   │   └── journal-form.tsx
│   │   │   ├── layout/
│   │   │   │   ├── command-palette.tsx
│   │   │   │   ├── mobile-sidebar.tsx
│   │   │   │   ├── navbar.tsx
│   │   │   │   ├── notification-bell.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── user-menu.tsx
│   │   │   ├── master/
│   │   │   │   └── index.ts
│   │   │   ├── reports/
│   │   │   │   ├── report-filters.tsx
│   │   │   │   ├── report-preview.tsx
│   │   │   │   ├── report-type-selector.tsx
│   │   │   │   └── saved-reports-panel.tsx
│   │   │   ├── shared/
│   │   │   │   ├── chart-card.tsx
│   │   │   │   ├── confirmation-dialog.tsx
│   │   │   │   ├── data-table.tsx
│   │   │   │   ├── drawer.tsx
│   │   │   │   ├── empty-state.tsx
│   │   │   │   ├── error-boundary.tsx
│   │   │   │   ├── error-state.tsx
│   │   │   │   ├── metric-card.tsx
│   │   │   │   ├── page-header.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   └── search-input.tsx
│   │   │   ├── ui/
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── command.tsx
│   │   │   │   ├── date-picker.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   └── tooltip.tsx
│   │   │   └── vehicles/
│   │   │       ├── index.ts
│   │   │       └── vehicle-form.tsx
│   │   ├── config/
│   │   │   ├── constants.ts
│   │   │   ├── index.ts
│   │   │   └── navigation.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── use-auth.ts
│   │   │   ├── use-booking-dashboard.ts
│   │   │   ├── use-click-outside.ts
│   │   │   ├── use-dashboard.ts
│   │   │   ├── use-debounce.ts
│   │   │   ├── use-filters.ts
│   │   │   ├── use-journal-metrics.ts
│   │   │   ├── use-master-values.ts
│   │   │   ├── use-media-query.ts
│   │   │   ├── use-notification.ts
│   │   │   ├── use-pagination.ts
│   │   │   ├── use-search.ts
│   │   │   ├── use-sort.ts
│   │   │   └── use-theme.ts
│   │   ├── layouts/
│   │   │   ├── auth-layout.tsx
│   │   │   └── dashboard-layout.tsx
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── analytics.tsx
│   │   │   ├── bookings.tsx
│   │   │   ├── change-password.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── expenses.tsx
│   │   │   ├── journal.tsx
│   │   │   ├── login.tsx
│   │   │   ├── master-data.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── notifications.tsx
│   │   │   ├── reports.tsx
│   │   │   ├── settings.tsx
│   │   │   ├── unauthorized.tsx
│   │   │   └── vehicles.tsx
│   │   ├── providers/
│   │   │   ├── auth-provider.tsx
│   │   │   ├── index.tsx
│   │   │   ├── notification-provider.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── routes/
│   │   │   ├── index.tsx
│   │   │   └── protected-route.tsx
│   │   ├── services/
│   │   │   ├── analytics.service.ts
│   │   │   ├── api-client.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── expense.service.ts
│   │   │   ├── index.ts
│   │   │   ├── journal.service.ts
│   │   │   ├── master.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── report.service.ts
│   │   │   ├── settings.service.ts
│   │   │   └── vehicle.service.ts
│   │   ├── stores/
│   │   │   ├── app-store.tsx
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── analytics.ts
│   │   │   ├── api.ts
│   │   │   ├── booking.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── expense.ts
│   │   │   ├── index.ts
│   │   │   ├── journal.ts
│   │   │   ├── master.ts
│   │   │   ├── notification.ts
│   │   │   ├── report.ts
│   │   │   ├── settings.ts
│   │   │   └── vehicle.ts
│   │   ├── validation/
│   │   │   ├── auth.ts
│   │   │   ├── booking.ts
│   │   │   ├── expense.ts
│   │   │   ├── index.ts
│   │   │   ├── journal.ts
│   │   │   └── vehicle.ts
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── postcss.config.js
│   ├── vite.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── .gitignore
│   └── .oxlintrc.json
│
├── database/
│   ├── migrations/
│   │   ├── 001_create_users.ts
│   │   ├── 002_create_sessions.ts
│   │   ├── 003_create_audit_logs.ts
│   │   ├── 004_create_vehicles.ts
│   │   ├── 005_create_master_data.ts
│   │   ├── 006_create_bookings.ts
│   │   ├── 007_create_journal_entries.ts
│   │   ├── 008_create_expenses.ts
│   │   ├── 009_create_report_templates.ts
│   │   ├── 010_create_report_history.ts
│   │   ├── 011_create_settings.ts
│   │   ├── 012_create_notifications.ts
│   │   ├── 013_create_fleet_vehicles.ts
│   │   └── 014_financial_ops_enums_and_fields.ts
│   ├── seeds/
│   │   ├── 001_seed_admin.ts
│   │   └── 002_seed_master_data.ts
│   └── init.sql
│
├── README.md
├── PROJECT_AUDIT.md
├── PROJECT_STRUCTURE.md
├── DATABASE_SCHEMA.md
├── AGENTS.md                            # AI assistant instructions
└── .prettierrc
```
