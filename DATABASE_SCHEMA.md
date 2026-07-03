# Database Schema

> Auto-generated from migrations 001–015. PostgreSQL via Knex.

---

## Postgres ENUMs

| Enum | Values |
|---|---|
| `user_role` | `'super_admin'`, `'admin'`, `'manager'`, `'operator'`, `'viewer'` |
| `audit_action` | `'CREATE'`, `'UPDATE'`, `'DELETE'`, `'LOGIN'`, `'LOGOUT'`, `'CHANGE_PASSWORD'`, `'ACTIVATE'`, `'DEACTIVATE'`, `'EXPORT'`, `'IMPORT'` |
| `audit_entity` | `'USER'`, `'SESSION'`, `'VEHICLE'`, `'BOOKING'`, `'EXPENSE'`, `'MAINTENANCE'`, `'FUEL'`, `'INSURANCE'`, `'INVOICE'`, `'PAYMENT'`, `'REPORT'`, `'SETTINGS'` |
| `vehicle_status` | `'AVAILABLE'`, `'BOOKED'`, `'MAINTENANCE'`, `'INACTIVE'` |
| `booking_status` | `'PENDING'`, `'CONFIRMED'`, `'COMPLETED'`, `'CANCELLED'`, `'REFUNDED'` |
| `journal_status` | `'PENDING'`, `'COMPLETED'`, `'CANCELLED'` |
| `expense_status` | `'PENDING'`, `'APPROVED'`, `'REJECTED'`, `'REIMBURSED'` |
| `payment_status` | `'PENDING'`, `'PARTIALLY_PAID'`, `'PAID'`, `'REFUNDED'` |
| `notification_type` | `'system'`, `'success'`, `'warning'`, `'error'`, `'info'` |
| `reminder_type` | `'insurance_renewal'`, `'vehicle_service_due'`, `'road_tax_due'`, `'permit_expiry'`, `'fastag_low_balance'`, `'pending_journal_entries'`, `'pending_expenses'`, `'pending_bookings'`, `'high_expense_alert'`, `'negative_profit_alert'`, `'inactive_vehicles'`, `'vehicles_without_bookings'` |
| `reminder_status` | `'PENDING'`, `'COMPLETED'`, `'DISMISSED'` |

---

## Table: `users`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| username | varchar(100) | NO | — |
| email | varchar(255) | YES | — |
| password_hash | varchar(255) | NO | — |
| first_name | varchar(100) | YES | — |
| last_name | varchar(100) | YES | — |
| role | `user_role` | NO | `'viewer'` |
| is_active | boolean | NO | `true` |
| is_first_login | boolean | NO | `true` |
| last_login_at | timestamp | YES | — |
| restrictions | jsonb | YES | — |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |
| created_by | uuid | YES | — |
| updated_by | uuid | YES | — |

**PK:** `id`

**Unique:** `username`, `email`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `created_by` | `users(id)` | `SET NULL` |
| `updated_by` | `users(id)` | `SET NULL` |

**Indexes:**
- `idx_users_email` ON `email` WHERE `email IS NOT NULL`
- `idx_users_username` ON `username`
- `idx_users_role` ON `role`
- `idx_users_is_active` ON `is_active`

---

## Table: `sessions`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | NO | — |
| refresh_token | varchar(500) | NO | — |
| user_agent | varchar(500) | YES | — |
| ip_address | varchar(45) | YES | — |
| expires_at | timestamp | NO | — |
| created_at | timestamp | YES | `now()` |
| revoked_at | timestamp | YES | — |

**PK:** `id`

**Unique:** `refresh_token`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `user_id` | `users(id)` | `CASCADE` |

**Indexes:**
- `idx_sessions_user_id`
- `idx_sessions_refresh_token`
- `idx_sessions_expires_at`

---

## Table: `audit_logs`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | YES | — |
| action | `audit_action` | NO | — |
| entity_type | `audit_entity` | NO | — |
| entity_id | varchar(100) | YES | — |
| old_values | jsonb | YES | — |
| new_values | jsonb | YES | — |
| description | text | YES | — |
| ip_address | varchar(45) | YES | — |
| user_agent | varchar(500) | YES | — |
| created_at | timestamp | NO | `now()` |

**PK:** `id`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `user_id` | `users(id)` | `SET NULL` |

**Indexes:**
- `idx_audit_logs_user_id`
- `idx_audit_logs_action`
- `idx_audit_logs_entity_type`
- `idx_audit_logs_entity_id`
- `idx_audit_logs_created_at`

---

## Table: `vehicles`

Columns from migration 004 (base):

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| vehicle_number | varchar(50) | NO | — |
| vehicle_name | varchar(200) | NO | — |
| brand | varchar(100) | YES | — |
| model | varchar(100) | YES | — |
| year | integer | YES | — |
| color | varchar(50) | YES | — |
| fuel_type | varchar(20) | YES | — |
| transmission | varchar(20) | YES | — |
| ownership_type | varchar(20) | YES | — |
| status | `vehicle_status` | NO | `'AVAILABLE'` |
| active_platform_id | uuid | YES | — |
| purchase_date | date | YES | — |
| purchase_price | decimal(12,2) | YES | — |
| current_odometer | integer | YES | `0` |
| notes | text | YES | — |
| is_active | boolean | NO | `true` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |
| deleted_at | timestamp | YES | — |
| created_by | uuid | YES | — |
| updated_by | uuid | YES | — |

Columns added in migration 013:

| Column | Type | Nullable | Default |
|---|---|---|---|
| fleet_code | varchar(50) | YES | — |
| variant | varchar(100) | YES | — |
| seating_capacity | integer | YES | — |
| chassis_number | varchar(100) | YES | — |
| engine_number | varchar(100) | YES | — |
| insurance_expiry | date | YES | — |
| permit_expiry | date | YES | — |
| road_tax_expiry | date | YES | — |
| pollution_expiry | date | YES | — |
| fitness_expiry | date | YES | — |
| rc_expiry | date | YES | — |
| photo | text | YES | — |
| deleted_by | uuid | YES | — |

**PK:** `id`

**Unique:** `vehicle_number`, `fleet_code`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `created_by` | `users(id)` | `SET NULL` |
| `updated_by` | `users(id)` | `SET NULL` |

**Indexes:**
- `idx_vehicles_vehicle_number`
- `idx_vehicles_status`
- `idx_vehicles_is_active`
- `idx_vehicles_fleet_code`
- `idx_vehicles_insurance_expiry`
- `idx_vehicles_fitness_expiry`
- `idx_vehicles_pollution_expiry`
- `idx_vehicles_deleted_at` WHERE `deleted_at IS NOT NULL`

**Soft delete:** `deleted_at` + `deleted_by`

---

## Table: `master_types`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| code | varchar(50) | NO | — |
| name | varchar(200) | NO | — |
| description | text | YES | — |
| is_active | boolean | NO | `true` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |

**PK:** `id`

**Unique:** `code`

---

## Table: `master_values`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| master_type_id | uuid | NO | — |
| code | varchar(50) | NO | — |
| name | varchar(200) | NO | — |
| description | text | YES | — |
| display_order | integer | YES | `0` |
| color | varchar(7) | YES | — |
| icon | varchar(50) | YES | — |
| is_system | boolean | NO | `false` |
| is_active | boolean | NO | `true` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |
| deleted_at | timestamp | YES | — |

**PK:** `id`

**Unique:** `(master_type_id, code)`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `master_type_id` | `master_types(id)` | `CASCADE` |

**Indexes:**
- `idx_master_values_master_type_id`
- `idx_master_values_code`
- `idx_master_values_display_order`
- `idx_master_values_deleted_at` WHERE `deleted_at IS NOT NULL`

**Soft delete:** `deleted_at`

---

## Table: `bookings`

Columns from migration 006 (base):

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| vehicle_id | uuid | NO | — |
| platform_id | uuid | NO | — |
| booking_id | varchar(255) | NO | — |
| booking_date_time | timestamptz | NO | — |
| trip_start | timestamptz | YES | — |
| trip_end | timestamptz | YES | — |
| gross_fare | decimal(12,2) | NO | `0` |
| doorstep_charges | decimal(12,2) | NO | `0` |
| platform_commission | decimal(12,2) | NO | `0` |
| net_revenue | decimal(12,2) | NO | `0` |
| status | `booking_status` | NO | `'PENDING'` |
| remarks | text | YES | — |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |
| deleted_at | timestamp | YES | — |
| created_by | uuid | YES | — |
| updated_by | uuid | YES | — |

Columns added in migration 014:

| Column | Type | Nullable | Default |
|---|---|---|---|
| discount | decimal(12,2) | NO | `0` |
| taxes | decimal(12,2) | NO | `0` |
| refund | decimal(12,2) | NO | `0` |
| customer_name | varchar(200) | YES | — |
| payment_status | `payment_status` | NO | `'PENDING'` |
| deleted_by | uuid | YES | — |

Columns added in migration 015:

| Column | Type | Nullable | Default |
|---|---|---|---|
| customer_phone | varchar(20) | YES | — |
| start_km | integer | YES | — |
| end_km | integer | YES | — |
| pre_check_images | jsonb | YES | — |
| post_check_images | jsonb | YES | — |
| fastag_amount | decimal(12,2) | NO | `0` |
| fuel_amount | decimal(12,2) | NO | `0` |
| incidents_amount | decimal(12,2) | NO | `0` |
| washing_amount | decimal(12,2) | NO | `0` |
| cancellation_fee | decimal(12,2) | NO | `0` |
| late_return_fee | decimal(12,2) | NO | `0` |
| co_driver_fee | decimal(12,2) | NO | `0` |
| damage_amount | decimal(12,2) | NO | `0` |
| doorstep_delivery_fee | decimal(12,2) | NO | `0` |
| miscellaneous_amount | decimal(12,2) | NO | `0` |

**PK:** `id`

**Unique:** `booking_id`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `vehicle_id` | `vehicles(id)` | `RESTRICT` |
| `platform_id` | `master_values(id)` | `RESTRICT` |
| `created_by` | `users(id)` | `SET NULL` |
| `updated_by` | `users(id)` | `SET NULL` |

**Indexes:**
- `idx_bookings_booking_id`
- `idx_bookings_vehicle_id`
- `idx_bookings_platform_id`
- `idx_bookings_status`
- `idx_bookings_booking_date_time`
- `idx_bookings_deleted_at` WHERE `deleted_at IS NOT NULL`

**Soft delete:** `deleted_at` + `deleted_by`

---

## Table: `journal_entries`

Columns from migration 007 (base):

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| vehicle_id | uuid | NO | — |
| collection_date | timestamptz | NO | `now()` |
| amount_collected | decimal(12,2) | NO | `0` |
| total_amount | decimal(12,2) | NO | `0` |
| ledger_category_id | uuid | NO | — |
| remarks | text | YES | — |
| status | `journal_status` | NO | `'PENDING'` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |
| deleted_at | timestamp | YES | — |
| created_by | uuid | YES | — |
| updated_by | uuid | YES | — |

Columns added in migration 014:

| Column | Type | Nullable | Default |
|---|---|---|---|
| reference_number | varchar(100) | YES | — |
| description | text | YES | — |
| deleted_by | uuid | YES | — |

**PK:** `id`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `vehicle_id` | `vehicles(id)` | `RESTRICT` |
| `ledger_category_id` | `master_values(id)` | `RESTRICT` |
| `created_by` | `users(id)` | `SET NULL` |
| `updated_by` | `users(id)` | `SET NULL` |

**Indexes:**
- `idx_journal_entries_vehicle_id`
- `idx_journal_entries_ledger_category_id`
- `idx_journal_entries_status`
- `idx_journal_entries_collection_date`
- `idx_journal_entries_deleted_at` WHERE `deleted_at IS NOT NULL`

**Soft delete:** `deleted_at` + `deleted_by`

---

## Table: `expenses`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| vehicle_id | uuid | YES | — |
| expense_category_id | uuid | NO | — |
| payment_mode_id | uuid | NO | — |
| expense_date | timestamptz | NO | `now()` |
| amount | decimal(12,2) | NO | `0` |
| vendor | varchar(255) | YES | — |
| invoice_number | varchar(255) | YES | — |
| remarks | text | YES | — |
| status | `expense_status` | NO | `'PENDING'` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |
| deleted_at | timestamp | YES | — |
| created_by | uuid | YES | — |
| updated_by | uuid | YES | — |
| deleted_by | uuid | YES | — |

`deleted_by` added in migration 014.

**PK:** `id`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `vehicle_id` | `vehicles(id)` | `SET NULL` |
| `expense_category_id` | `master_values(id)` | `RESTRICT` |
| `payment_mode_id` | `master_values(id)` | `RESTRICT` |
| `created_by` | `users(id)` | `SET NULL` |
| `updated_by` | `users(id)` | `SET NULL` |

**Indexes:**
- `idx_expenses_vehicle_id`
- `idx_expenses_category_id`
- `idx_expenses_payment_mode_id`
- `idx_expenses_status`
- `idx_expenses_expense_date`
- `idx_expenses_deleted_at` WHERE `deleted_at IS NOT NULL`

**Soft delete:** `deleted_at` + `deleted_by`

---

## Table: `report_templates`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| name | varchar(255) | NO | — |
| report_type | varchar(100) | NO | — |
| filters | jsonb | NO | `'{}'` |
| is_favorite | boolean | NO | `false` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |
| created_by | uuid | YES | — |

**PK:** `id`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `created_by` | `users(id)` | `SET NULL` |

**Indexes:**
- `idx_report_templates_created_by`
- `idx_report_templates_report_type`

---

## Table: `report_history`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| report_type | varchar(100) | NO | — |
| filters | jsonb | NO | `'{}'` |
| status | varchar(50) | NO | `'GENERATED'` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |
| generated_by | uuid | YES | — |

**PK:** `id`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `generated_by` | `users(id)` | `SET NULL` |

**Indexes:**
- `idx_report_history_generated_by`
- `idx_report_history_report_type`
- `idx_report_history_created_at`

---

## Table: `company_profile`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| company_name | varchar(255) | YES | — |
| logo_url | varchar(500) | YES | — |
| address | text | YES | — |
| phone | varchar(50) | YES | — |
| email | varchar(255) | YES | — |
| gst_number | varchar(50) | YES | — |
| currency | varchar(10) | NO | `'INR'` |
| timezone | varchar(100) | NO | `'Asia/Kolkata'` |
| date_format | varchar(20) | NO | `'DD/MM/YYYY'` |
| financial_year_start | varchar(10) | NO | `'01-04'` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |

**PK:** `id`

**Index:** `idx_company_profile_updated_at`

---

## Table: `dashboard_settings`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| default_dashboard | varchar(50) | NO | `'executive'` |
| default_date_range | varchar(50) | NO | `'last_30_days'` |
| default_charts | jsonb | NO | `["revenue_trend","expense_breakdown","profit_overview","fleet_performance"]` |
| widget_visibility | jsonb | NO | `{"kpi_cards":true,"trend_charts":true,"breakdown_charts":true,"recent_activity":true,"top_vehicles":true,"alerts":true}` |
| dashboard_layout | jsonb | NO | `{"layout":"grid","columns":2}` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |

**PK:** `id`

**Index:** `idx_dashboard_settings_updated_at`

---

## Table: `financial_settings`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| default_currency | varchar(10) | NO | `'INR'` |
| currency_symbol | varchar(10) | NO | `'₹'` |
| decimal_precision | integer | NO | `2` |
| tax_percentage | decimal(5,2) | NO | `18` |
| invoice_prefix | varchar(20) | NO | `'INV-'` |
| booking_prefix | varchar(20) | NO | `'BKG-'` |
| journal_prefix | varchar(20) | NO | `'JRN-'` |
| expense_prefix | varchar(20) | NO | `'EXP-'` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |

**PK:** `id`

**Index:** `idx_financial_settings_updated_at`

---

## Table: `notification_settings`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| email_notifications | boolean | NO | `true` |
| browser_notifications | boolean | NO | `true` |
| reminder_settings | boolean | NO | `true` |
| daily_summary | boolean | NO | `false` |
| weekly_summary | boolean | NO | `false` |
| monthly_summary | boolean | NO | `false` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |

**PK:** `id`

**Index:** `idx_notification_settings_updated_at`

---

## Table: `user_preferences`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| theme | varchar(20) | NO | `'dark'` |
| sidebar_state | varchar(20) | NO | `'expanded'` |
| language | varchar(10) | NO | `'en'` |
| table_density | varchar(20) | NO | `'comfortable'` |
| default_page_size | integer | NO | `10` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |

**PK:** `id`

**Index:** `idx_user_preferences_updated_at`

---

## Table: `security_settings`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| password_policy | jsonb | NO | `{"min_length":8,"require_uppercase":true,"require_lowercase":true,"require_numbers":true,"require_special":false}` |
| session_timeout_minutes | integer | NO | `60` |
| two_factor_enabled | boolean | NO | `false` |
| max_login_attempts | integer | NO | `5` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |

**PK:** `id`

**Index:** `idx_security_settings_updated_at`

---

## Table: `notifications`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| type | `notification_type` | NO | `'info'` |
| title | varchar(255) | NO | — |
| message | text | YES | — |
| entity_type | varchar(50) | YES | — |
| entity_id | uuid | YES | — |
| is_read | boolean | NO | `false` |
| is_archived | boolean | NO | `false` |
| user_id | uuid | YES | — |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |

**PK:** `id`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `user_id` | `users(id)` | `CASCADE` |

**Indexes:**
- `idx_notifications_user_id`
- `idx_notifications_is_read`
- `idx_notifications_created_at` DESC
- `idx_notifications_type`

---

## Table: `notification_templates`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| name | varchar(100) | NO | — |
| type | `notification_type` | NO | `'info'` |
| title_template | varchar(255) | NO | — |
| message_template | text | YES | — |
| variables | jsonb | YES | `'[]'` |
| is_active | boolean | NO | `true` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |

**PK:** `id`

**Unique:** `name`

---

## Table: `reminders`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| reminder_type | `reminder_type` | NO | — |
| vehicle_id | uuid | YES | — |
| title | varchar(255) | NO | — |
| description | text | YES | — |
| due_date | date | NO | — |
| remind_before_days | integer | NO | `7` |
| is_recurring | boolean | NO | `false` |
| recurring_interval_days | integer | YES | — |
| last_triggered_at | timestamp | YES | — |
| status | `reminder_status` | NO | `'PENDING'` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |
| deleted_at | timestamp | YES | — |
| created_by | uuid | YES | — |
| updated_by | uuid | YES | — |

**PK:** `id`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `vehicle_id` | `vehicles(id)` | `CASCADE` |
| `created_by` | `users(id)` | `SET NULL` |
| `updated_by` | `users(id)` | `SET NULL` |

**Indexes:**
- `idx_reminders_vehicle_id`
- `idx_reminders_due_date`
- `idx_reminders_status`
- `idx_reminders_type`
- `idx_reminders_deleted_at` WHERE `deleted_at IS NOT NULL`

**Soft delete:** `deleted_at`

---

## Table: `notification_preferences`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | NO | — |
| in_app_enabled | boolean | NO | `true` |
| email_enabled | boolean | NO | `false` |
| reminder_days_before | integer | NO | `7` |
| daily_summary | boolean | NO | `false` |
| weekly_summary | boolean | NO | `false` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |

**PK:** `id`

**Unique:** `user_id`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `user_id` | `users(id)` | `CASCADE` |

---

## Table: `notification_history`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| notification_id | uuid | YES | — |
| reminder_id | uuid | YES | — |
| user_id | uuid | YES | — |
| action | varchar(50) | NO | — |
| channel | varchar(20) | NO | `'in_app'` |
| created_at | timestamp | YES | `now()` |
| updated_at | timestamp | YES | `now()` |

**PK:** `id`

**FK:**
| Column | References | On Delete |
|---|---|---|
| `notification_id` | `notifications(id)` | `SET NULL` |
| `reminder_id` | `reminders(id)` | `SET NULL` |
| `user_id` | `users(id)` | `SET NULL` |

**Indexes:**
- `idx_notification_history_user_id`
- `idx_notification_history_action`

---

## Table Relationships

```
users ──┬── self-referencing (created_by, updated_by → id)
        │
        ├── sessions (user_id → id) CASCADE
        ├── audit_logs (user_id → id) SET NULL
        ├── vehicles (created_by/updated_by → id) SET NULL
        ├── bookings (created_by/updated_by → id) SET NULL
        ├── journal_entries (created_by/updated_by → id) SET NULL
        ├── expenses (created_by/updated_by → id) SET NULL
        ├── report_templates (created_by → id) SET NULL
        ├── report_history (generated_by → id) SET NULL
        ├── notifications (user_id → id) CASCADE
        ├── reminders (created_by/updated_by → id) SET NULL
        ├── notification_preferences (user_id → id) CASCADE
        └── notification_history (user_id → id) SET NULL

master_types
  └── master_values (master_type_id → id) CASCADE

master_values ──┬── bookings (platform_id → id) RESTRICT
                ├── journal_entries (ledger_category_id → id) RESTRICT
                └── expenses (expense_category_id → id) RESTRICT
                            (payment_mode_id → id) RESTRICT

vehicles ──┬── bookings (vehicle_id → id) RESTRICT
           ├── journal_entries (vehicle_id → id) RESTRICT
           ├── expenses (vehicle_id → id) SET NULL
           └── reminders (vehicle_id → id) CASCADE

notifications
  └── notification_history (notification_id → id) SET NULL

reminders
  └── notification_history (reminder_id → id) SET NULL
```

---

## Soft Delete Patterns

Six tables use soft-delete via a `deleted_at` timestamp. Three of them also track who performed the deletion via `deleted_by`.

| Table | `deleted_at` | `deleted_by` | Migration |
|---|---|---|---|
| `vehicles` | ✅ | ✅ (added 013) | 004, 013 |
| `master_values` | ✅ | ❌ | 005 |
| `bookings` | ✅ | ✅ (added 014) | 006, 014 |
| `journal_entries` | ✅ | ✅ (added 014) | 007, 014 |
| `expenses` | ✅ | ✅ (added 014) | 008, 014 |
| `reminders` | ✅ | ❌ | 012 |

All soft-deleted tables have partial indexes on `deleted_at WHERE deleted_at IS NOT NULL` for efficient querying of non-deleted (filtering `WHERE deleted_at IS NULL`).

---

## Constraint Summary

- **CASCADE** on delete: `sessions.user_id`, `master_values.master_type_id`, `notifications.user_id`, `notification_preferences.user_id`, `reminders.vehicle_id`
- **RESTRICT** on delete: `bookings.vehicle_id`, `bookings.platform_id`, `journal_entries.vehicle_id`, `journal_entries.ledger_category_id`, `expenses.expense_category_id`, `expenses.payment_mode_id`
- **SET NULL** on delete: all `created_by` / `updated_by` references, `audit_logs.user_id`, `expenses.vehicle_id`, `report_templates.created_by`, `report_history.generated_by`, `notification_history.*`, `reminders.created_by/updated_by`
- **Unique constraints** in table definitions: `users(username)`, `users(email)`, `sessions(refresh_token)`, `vehicles(vehicle_number)`, `vehicles(fleet_code)`, `master_types(code)`, `master_values(master_type_id, code)`, `bookings(booking_id)`, `notification_templates(name)`, `notification_preferences(user_id)`
- All UUID PKs use `gen_random_uuid()` for generation
- All tables with `created_by`/`updated_by` reference `users(id)` with `SET NULL`
