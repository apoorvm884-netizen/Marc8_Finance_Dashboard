# Marc8 Fleet Financial ERP — Frontend API Contract

**Version:** 1.0.0  
**Status:** Final  
**Audience:** Backend Engineering Team  
**Purpose:** Single source of truth for all frontend-backend API integration  

---

## Table of Contents

- [Standard Response Envelope](#standard-response-envelope)
- [Standard Error Format](#standard-error-format)
- [Pagination, Sorting, Filtering, Searching](#pagination-sorting-filtering-searching)
- [Authentication Module](#authentication-module)
- [Dashboard Module](#dashboard-module)
- [Bookings Module](#bookings-module)
- [Journal Module](#journal-module)
- [Expenses Module](#expenses-module)
- [Settlements Module](#settlements-module)
- [Outstandings Module](#outstandings-module)
- [Fleet Dashboard Module](#fleet-dashboard-module)
- [Vehicles Module](#vehicles-module)
- [Vehicle Owners Module](#vehicle-owners-module)
- [Drivers Module](#drivers-module)
- [Customers Module](#customers-module)
- [Vendors Module](#vendors-module)
- [Maintenance Module](#maintenance-module)
- [Service Schedule Module](#service-schedule-module)
- [Notifications Module](#notifications-module)
- [Reports Module](#reports-module)
- [Analytics Module](#analytics-module)
- [Operations / Tasks Module](#operations--tasks-module)
- [Master Data Module](#master-data-module)
- [Settings Module](#settings-module)
- [File Uploads](#file-uploads)
- [Validation Rules Reference](#validation-rules-reference)
- [HTTP Status Code Conventions](#http-status-code-conventions)
- [Naming Conventions](#naming-conventions)
- [Versioning Strategy](#versioning-strategy)
- [Implementation Order](#implementation-order)
- [Endpoint Dependency Graph](#endpoint-dependency-graph)

---

## Standard Response Envelope

Every API response MUST use this wrapper:

```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { }
}
```

### Success Response

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | boolean | yes | Always `true` for 2xx responses |
| `message` | string | yes | Human-readable status message |
| `data` | object/array | yes | The response payload |

For list endpoints with pagination:

```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 35,
      "totalPages": 4
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | boolean | yes | Always `false` |
| `message` | string | yes | Human-readable error description |
| `error.code` | string | yes | Machine-readable error code (SCREAMING_SNAKE_CASE) |
| `error.details` | object | no | Field-level validation details |

### Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Request body or query validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Authenticated but insufficient permissions |
| `NOT_FOUND` | 404 | Requested resource does not exist |
| `CONFLICT` | 409 | Resource state conflict (e.g., duplicate) |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `RATE_LIMITED` | 429 | Too many requests |
| `TOKEN_EXPIRED` | 401 | Auth token has expired, refresh required |

---

## Pagination, Sorting, Filtering, Searching

All list endpoints share a common query parameter interface.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-based) |
| `pageSize` | integer | 10 | Items per page (max 100) |
| `sortBy` | string | `created_at` | Field to sort by |
| `sortOrder` | string | `desc` | `asc` or `desc` |
| `search` | string | — | Full-text search across searchable fields |
| `status` | string | — | Filter by status value |
| `startDate` | string (ISO 8601) | — | Filter records created on or after |
| `endDate` | string (ISO 8601) | — | Filter records created on or before |

### Example

```
GET /api/bookings?page=2&pageSize=10&sortBy=created_at&sortOrder=desc&status=completed&search=MH-01
```

### Pagination Response

```json
"pagination": {
  "page": 2,
  "pageSize": 10,
  "totalItems": 35,
  "totalPages": 4
}
```

### Sortable Column Convention

Any column rendered in a table with `class="sortable"` and `data-sort-key="field"` should be sortable. The frontend sends `sortBy=field` and `sortOrder=asc|desc`.

### Filterable Column Convention

Any `<select>` with `data-table-filter="tableId"` triggers a `status=value` query parameter.

### Searchable Fields Convention

Any `<input>` with `data-table-search="tableId"` performs a client-side search. For API-side search, the `search` parameter should match against: booking IDs, vehicle numbers, names, etc.

---

## Authentication Module

### POST /api/auth/login

**Purpose:** Authenticate user and return session token  
**Auth Required:** No  
**Rate Limit:** 5 attempts per minute per IP

#### Request Body

```json
{
  "username": "admin@marc8fleet.in",
  "password": "securePassword123"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `username` | string | yes | 3–100 characters, email or alphanumeric |
| `password` | string | yes | 8–128 characters |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
    "expiresIn": 3600,
    "user": {
      "id": "usr_001",
      "username": "admin",
      "email": "admin@marc8fleet.in",
      "first_name": "Admin",
      "last_name": "User",
      "role": "super_admin",
      "is_active": true,
      "is_first_login": false,
      "permissions": ["bookings.read", "bookings.write", "reports.export", "settings.manage"]
    }
  }
}
```

#### Error Responses

**401 Invalid credentials:**
```json
{
  "success": false,
  "message": "Invalid username or password",
  "error": { "code": "UNAUTHORIZED", "details": null }
}
```

**422 Validation:**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": { "field": "username", "reason": "Username is required" }
  }
}
```

### POST /api/auth/logout

**Purpose:** Invalidate current session token  
**Auth Required:** Yes  

#### Headers

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer {token}` |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

### GET /api/auth/me

**Purpose:** Get current authenticated user profile  
**Auth Required:** Yes  

#### Success Response (200)

```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "id": "usr_001",
    "username": "admin",
    "email": "admin@marc8fleet.in",
    "first_name": "Admin",
    "last_name": "User",
    "role": "super_admin",
    "is_active": true,
    "is_first_login": false,
    "permissions": ["bookings.read", "bookings.write", "reports.export", "settings.manage"]
  }
}
```

### POST /api/auth/refresh

**Purpose:** Refresh an expiring token  
**Auth Required:** No (uses refresh token)

#### Request Body

```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJl..."
}
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "bmV3IHJlZnJlc2ggdG9r...",
    "expiresIn": 3600
  }
}
```

### Guest Login (Frontend-Only)

The login page has a "Continue as Guest" button that currently bypasses authentication entirely. For production, this should redirect to the real login flow or be removed.

---

## Dashboard Module

### GET /api/dashboard

**Purpose:** Return all KPI data, trends, breakdowns, alerts, and fleet health for the main dashboard page  
**Auth Required:** Yes  
**Roles:** All authenticated roles  
**Cache:** 60 seconds (server-side)

#### Success Response (200)

```json
{
  "success": true,
  "message": "Dashboard data retrieved",
  "data": {
    "kpis": {
      "todays_revenue": 65000,
      "weekly_revenue": 390000,
      "monthly_revenue": 1690000,
      "yearly_revenue": 20280000,
      "todays_expense": 35000,
      "weekly_expense": 210000,
      "monthly_expense": 910000,
      "yearly_expense": 10920000,
      "todays_profit": 30000,
      "weekly_profit": 180000,
      "monthly_profit": 780000,
      "yearly_profit": 9360000,
      "net_profit": 9360000,
      "net_margin": 46.15,
      "cash_flow": 53300,
      "outstanding_collections": 550000,
      "total_vehicles": 12,
      "active_vehicles": 8,
      "available_vehicles": 3,
      "booked_vehicles": 5,
      "maintenance_vehicles": 2,
      "utilization_rate": 72,
      "avg_revenue_per_vehicle": 5417,
      "avg_expense_per_vehicle": 2917
    },
    "trends": {
      "revenue": [
        { "month": "Jan", "total": 1800000 }
      ],
      "expense": [
        { "month": "Jan", "total": 900000 }
      ],
      "profit": [
        { "month": "Jan", "total": 700000 }
      ],
      "cash_flow": [
        { "month": "Jan", "inflows": 1800000, "outflows": 900000 }
      ],
      "revenue_growth": {
        "monthly_growth": 12.5,
        "quarterly_growth": 22.3,
        "yearly_growth": 45
      }
    },
    "breakdowns": {
      "revenue_by_platform": [
        { "id": "p1", "name": "Uber", "total": 850000 }
      ],
      "expense_by_category": [
        { "id": "c1", "name": "Fuel", "total": 250000 }
      ],
      "revenue_by_vehicle": [
        { "id": "v1", "name": "MH-01-AB-1234", "total": 1200000 }
      ]
    },
    "recent": {
      "latest_bookings": [],
      "latest_expenses": []
    },
    "top_vehicles": {
      "top_performing": [
        { "id": "v1", "name": "MH-01-AB-1234", "total_revenue": 1800000 }
      ],
      "most_profitable": [
        { "id": "v1", "name": "MH-01-AB-1234", "profit": 900000, "margin": 42 }
      ]
    },
    "alerts": {
      "vehicles_without_bookings": 2,
      "pending_journal_entries": 4,
      "pending_expenses": 3,
      "vehicles_without_bookings_list": [
        { "vehicle_id": "v11", "vehicle_number": "WB-06-WX-7788" }
      ],
      "high_expense_vehicles": [
        { "vehicle_id": "v2", "vehicle_number": "MH-02-CD-5678", "total_expense": 650000 }
      ]
    },
    "fleet_health": {
      "health_score": 78,
      "insurance_due": 2,
      "permit_due": 3,
      "fitness_due": 1,
      "pollution_due": 2,
      "maintenance_due": 3,
      "vehicles_in_maintenance": 2,
      "vehicles_without_platform": 1,
      "expired_documents": 2
    }
  }
}
```

#### Frontend Element Mappings

| KPI | Element ID | Format |
|-----|-----------|--------|
| Today's revenue | `kpi-today-revenue` | `formatCurrency()` |
| Weekly revenue | `kpi-weekly-revenue` | `formatCurrency()` |
| Monthly profit | `kpi-monthly-profit` | `formatCurrency()` |
| Cash flow | `kpi-cash-flow` | `formatCurrency()` |
| Active vehicles | `kpi-active-vehicles` | `"8/12"` (active/total) |
| Utilization rate | `kpi-utilization` | `"72%"` |
| Outstanding collections | `kpi-outstanding` | `formatCurrency()` |
| Net margin | `kpi-net-margin` | `"46.15%"` |
| Fleet health score | `fh-score` | `"78%"` |
| Insurance due | `fh-insurance` | number |
| Maintenance due | `fh-maintenance` | number |
| Permit due | `fh-permit` | number |
| Health score bar | `health-score-bar` | CSS width percentage |

#### Chart Mappings

| Canvas ID | Data Path | Chart Type |
|-----------|-----------|------------|
| `chart-revenue` | `trends.revenue[].{label:month, value:total}` | Bar |
| `chart-expense` | `trends.expense[].{label:month, value:total}` | Bar |
| `chart-platform-pie` | `breakdowns.revenue_by_platform[].{label:name, value:total}` | Donut |
| `chart-expense-pie` | `breakdowns.expense_by_category[].{label:name, value:total}` | Donut |
| `chart-legend-platform` | `breakdowns.revenue_by_platform[0..4]` | Legend |
| `chart-legend-expense` | `breakdowns.expense_by_category[0..4]` | Legend |

---

## Bookings Module

### GET /api/bookings

**Purpose:** List all bookings with pagination, search, and filters  
**Auth Required:** Yes  
**Searchable fields:** `booking_id`, `vehicle_number`, `vehicle_name`, `platform_name`, `driver_name`, `customer_name`, `pickup_location`, `drop_location`  
**Sortable fields:** `booking_id`, `created_at`, `net_revenue`, `total_amount`, `status`  
**Filterable fields:** `status`, `platform_name`, `startDate`, `endDate`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": {
    "items": [
      {
        "id": "b1",
        "booking_id": "BK-0001",
        "vehicle_id": "v1",
        "vehicle_number": "MH-01-AB-1234",
        "vehicle_name": "Toyota Innova Crysta",
        "platform_name": "Uber",
        "net_revenue": 4500,
        "total_amount": 5200,
        "platform_commission": 300,
        "driver_name": "Rajesh Sharma",
        "customer_name": "Customer 1",
        "pickup_location": "Mumbai Airport",
        "drop_location": "Churchgate",
        "distance_km": 35,
        "status": "completed",
        "created_at": "2026-06-01T10:30:00.000Z",
        "updated_at": "2026-07-07T22:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 35,
      "totalPages": 4
    }
  }
}
```

### POST /api/bookings

**Purpose:** Create a new booking  
**Auth Required:** Yes

#### Request Body

```json
{
  "vehicle_id": "v1",
  "platform_name": "Uber",
  "customer_name": "Customer 1",
  "pickup_location": "Mumbai Airport",
  "drop_location": "Churchgate",
  "distance_km": 35,
  "net_revenue": 4500,
  "status": "active"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `vehicle_id` | string | yes | Must reference an existing vehicle |
| `platform_name` | string | yes | Must be a valid platform from master data |
| `customer_name` | string | yes | 2–200 characters |
| `pickup_location` | string | yes | 2–200 characters |
| `drop_location` | string | yes | 2–200 characters |
| `distance_km` | number | yes | 1–10000 |
| `net_revenue` | number | yes | 0–1000000 |
| `status` | string | yes | One of: `active`, `completed`, `cancelled`, `refunded`, `no_show` |

### PUT /api/bookings/{id}

**Purpose:** Update an existing booking  
**Auth Required:** Yes  
**Path Parameters:** `id` - Booking ID

#### Request Body

Same schema as POST. All fields are optional for PUT (partial update).

### DELETE /api/bookings/{id}

**Purpose:** Soft-delete a booking  
**Auth Required:** Yes  
**Path Parameters:** `id` - Booking ID

#### Success Response (200)

```json
{
  "success": true,
  "message": "Booking deleted successfully",
  "data": null
}
```

---

## Journal Module

### GET /api/journal

**Purpose:** List all journal entries  
**Auth Required:** Yes  
**Searchable fields:** `vehicle_number`, `booking_id`, `category_name`, `platform_name`  
**Sortable fields:** `created_at`, `amount_collected`, `total_amount`, `status`  
**Filterable fields:** `status`, `category_name`, `platform_name`

### GET /api/journal/{id}

**Purpose:** Get a single journal entry

#### Success Response (200)

```json
{
  "success": true,
  "message": "Journal entry retrieved",
  "data": {
    "items": [
      {
        "id": "j1",
        "vehicle_id": "v1",
        "vehicle_number": "MH-01-AB-1234",
        "vehicle_name": "Toyota Innova Crysta",
        "category_name": "Booking Revenue",
        "amount_collected": 4200,
        "total_amount": 5000,
        "platform_name": "Uber",
        "status": "collected",
        "booking_id": "BK-0042",
        "collected_by": "UPI",
        "created_at": "2026-06-15T14:00:00.000Z",
        "updated_at": "2026-07-07T22:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 20,
      "totalPages": 2
    }
  }
}
```

#### Valid Statuses

`collected`, `pending`, `overdue`, `waived`

#### Valid Category Values

`Booking Revenue`, `Extra KM Charges`, `Toll Reimbursement`, `Waiting Charges`, `Night Charges`, `Cancellation Fee`, `Platform Bonus`, `Peak Pricing`, `Deduction`, `Penalty`

---

## Expenses Module

### GET /api/expenses

**Purpose:** List all expenses  
**Auth Required:** Yes  
**Searchable fields:** `invoice_number`, `vehicle_number`, `category_name`, `vendor`, `description`  
**Sortable fields:** `amount`, `created_at`, `status`  
**Filterable fields:** `status`, `category_name`, `payment_mode_name`, `vendor`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Expenses retrieved successfully",
  "data": {
    "items": [
      {
        "id": "e1",
        "vehicle_id": "v1",
        "vehicle_number": "MH-01-AB-1234",
        "vehicle_name": "Toyota Innova Crysta",
        "category_name": "Fuel",
        "amount": 3200,
        "status": "approved",
        "vendor": "Bharat Petroleum",
        "payment_mode_name": "UPI",
        "description": "Regular maintenance",
        "invoice_number": "INV-1234",
        "created_at": "2026-06-10T08:00:00.000Z",
        "updated_at": "2026-07-07T22:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 25,
      "totalPages": 3
    }
  }
}
```

#### Valid Statuses

`approved`, `pending`, `rejected`, `flagged`

#### Valid Payment Modes

`Cash`, `UPI`, `Credit Card`, `Debit Card`, `Net Banking`, `Cheque`

---

## Settlements Module

### GET /api/settlements

**Purpose:** List all settlement records  
**Auth Required:** Yes  
**Searchable fields:** `settlement_id`, `vehicle_number`, `platform_name`  
**Sortable fields:** `total_amount`, `net_amount`, `settlement_date`, `status`  
**Filterable fields:** `status`, `platform_name`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Settlements retrieved successfully",
  "data": {
    "items": [
      {
        "id": "s1",
        "settlement_id": "STL-0001",
        "vehicle_id": "v1",
        "vehicle_number": "MH-01-AB-1234",
        "vehicle_name": "Toyota Innova Crysta",
        "platform_name": "Uber",
        "total_amount": 250000,
        "settled_amount": 225000,
        "commission": 12500,
        "tds": 2500,
        "net_amount": 210000,
        "status": "completed",
        "settlement_date": "2026-06-30T00:00:00.000Z",
        "period_start": "2026-06-01T00:00:00.000Z",
        "period_end": "2026-06-30T00:00:00.000Z",
        "created_at": "2026-05-01T00:00:00.000Z",
        "updated_at": "2026-07-07T22:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 20,
      "totalPages": 2
    }
  }
}
```

#### Valid Statuses

`pending`, `completed`, `in_progress`, `disputed`, `cancelled`

### GET /api/settlement-dashboard

**Purpose:** Return settlement KPIs and aggregated data for the settlements page header  
**Auth Required:** Yes

#### Success Response (200)

```json
{
  "success": true,
  "message": "Settlement dashboard retrieved",
  "data": {
    "total_pending": 850000,
    "total_completed": 5200000,
    "total_in_progress": 320000,
    "count_pending": 15,
    "count_completed": 45,
    "count_in_progress": 6,
    "monthly_trend": [
      { "month": "Jan", "settled": 800000, "pending": 250000 }
    ],
    "platform_wise": [
      { "platform": "Uber", "settled": 1200000, "pending": 150000 }
    ],
    "aging": [
      { "bucket": "0-15 days", "amount": 250000 },
      { "bucket": "16-30 days", "amount": 120000 },
      { "bucket": "31-45 days", "amount": 60000 },
      { "bucket": "46-60 days", "amount": 30000 },
      { "bucket": "60+ days", "amount": 15000 }
    ]
  }
}
```

#### Frontend Element Mappings

| Element ID | Field |
|-----------|--------|
| `stl-pending` | `total_pending` |
| `stl-completed` | `total_completed` |
| `stl-in-progress` | `total_in_progress` |
| `stl-count-pending` | `count_pending` |
| `stl-count-completed` | `count_completed` |
| `chart-settlement-trend` | `monthly_trend[].{label:month, value:settled}` (bar chart) |

---

## Outstandings Module

### GET /api/outstandings

**Purpose:** List all outstanding amounts  
**Auth Required:** Yes  
**Searchable fields:** `vehicle_number`, `platform_name`, `description`  
**Sortable fields:** `amount`, `paid_amount`, `due_date`, `priority`, `status`  
**Filterable fields:** `status`, `priority`, `platform_name`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Outstandings retrieved successfully",
  "data": {
    "items": [
      {
        "id": "o1",
        "vehicle_id": "v1",
        "vehicle_number": "MH-01-AB-1234",
        "vehicle_name": "Toyota Innova Crysta",
        "platform_name": "Uber",
        "amount": 85000,
        "paid_amount": 25000,
        "status": "partially_paid",
        "priority": "high",
        "due_date": "2026-07-15T00:00:00.000Z",
        "description": "Pending settlement",
        "created_at": "2026-05-01T00:00:00.000Z",
        "updated_at": "2026-07-07T22:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 15,
      "totalPages": 2
    }
  }
}
```

#### Frontend-Computed Fields

The frontend computes `balance = amount - paid_amount` and applies a CSS class (`text-red-400`) when `due_date` is in the past and `status` is not `paid`.

#### Valid Statuses

`pending`, `overdue`, `paid`, `partially_paid`

#### Valid Priority Levels

`high`, `medium`, `low`, `critical`

---

## Fleet Dashboard Module

### GET /api/fleet-dashboard

**Purpose:** Return fleet health data, vehicle list with performance metrics, and alerts  
**Auth Required:** Yes  
**Cache:** 60 seconds

#### Success Response (200)

```json
{
  "success": true,
  "message": "Fleet dashboard retrieved",
  "data": {
    "fleet_health": {
      "health_score": 78,
      "insurance_due": 2,
      "permit_due": 3,
      "fitness_due": 1,
      "pollution_due": 2,
      "maintenance_due": 3,
      "vehicles_in_maintenance": 2,
      "vehicles_without_platform": 1,
      "expired_documents": 2
    },
    "vehicles": [
      {
        "id": "v1",
        "vehicle_number": "MH-01-AB-1234",
        "brand": "Toyota",
        "model": "Innova Crysta",
        "year": 2024,
        "fuel_type": "Diesel",
        "transmission": "Manual",
        "status": "active",
        "seating_capacity": 7,
        "owner_name": "Rajesh Sharma",
        "owner_type": "individual",
        "is_active": true,
        "health_score": 85,
        "last_service": "2026-05-15T00:00:00.000Z",
        "next_service": "2026-08-15T00:00:00.000Z",
        "total_revenue_ytd": 1200000,
        "total_expense_ytd": 450000,
        "profit_ytd": 750000,
        "documents": {
          "insurance_valid": true,
          "pollution_valid": true,
          "fitness_valid": true,
          "permit_valid": true
        }
      }
    ],
    "upcoming_services": [],
    "alerts": [
      { "type": "warning", "message": "Insurance expiring for 2 vehicles this month", "vehicle": "" },
      { "type": "error", "message": "MH-02-CD-5678 missed scheduled maintenance", "vehicle": "MH-02-CD-5678" }
    ]
  }
}
```

#### Frontend Element Mappings

| Element ID | Field |
|-----------|--------|
| `fleet-health-score` | `fleet_health.health_score + "%"` |
| `fleet-insurance` | `fleet_health.insurance_due` |
| `fleet-maintenance` | `fleet_health.maintenance_due` |
| `fleet-permit` | `fleet_health.permit_due` |
| `fleet-fitness` | `fleet_health.fitness_due` |
| `fleet-pollution` | `fleet_health.pollution_due` |
| `fleet-health-bar` | CSS width = `fleet_health.health_score`% |
| `fleet-alerts` | `alerts[]` (rendered with type-based icons) |
| `fleet-vehicles-table` | `vehicles[]` (table with pagination) |

#### Fleet Vehicle Table Columns

| Column | Data Field | Render |
|--------|-----------|--------|
| Vehicle Number | `vehicle_number` | mono text |
| Brand | `brand` | raw |
| Model | `model` | raw |
| Fuel Type | `fuel_type` | raw |
| Status | `status` | `statusBadge()` |
| Health Score | `health_score` | green if >=70, red otherwise |
| Revenue YTD | `total_revenue_ytd` | `formatCurrency()` |
| Expense YTD | `total_expense_ytd` | red + `formatCurrency()` |

#### Alert Types

| Type | Icon Color |
|------|-----------|
| `warning` | Amber |
| `error` | Red |
| `info` | Blue |
| `success` | Green |

---

## Vehicles Module

### GET /api/vehicles

**Purpose:** List all fleet vehicles with full CRUD support  
**Auth Required:** Yes  
**Searchable fields:** `vehicle_number`, `brand`, `model`, `owner_name`  
**Filterable fields:** `status`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Vehicles retrieved successfully",
  "data": {
    "items": [
      {
        "id": "v1",
        "vehicle_number": "MH-01-AB-1234",
        "brand": "Toyota",
        "model": "Innova Crysta",
        "year": 2024,
        "variant": "ZXI",
        "fuel_type": "Diesel",
        "seating_capacity": 7,
        "transmission": "Manual",
        "owner_name": "Rajesh Sharma",
        "owner_type": "individual",
        "status": "active",
        "is_active": true,
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-07-07T22:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 12,
      "totalPages": 2
    }
  }
}
```

### POST /api/vehicles

**Purpose:** Create a new vehicle

#### Request Body

```json
{
  "vehicle_number": "MH-08-ZY-1122",
  "brand": "Toyota",
  "model": "Camry",
  "year": 2024,
  "fuel_type": "Petrol",
  "transmission": "Manual",
  "status": "active"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `vehicle_number` | string | yes | Pattern: `^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$` |
| `brand` | string | yes | 2–100 characters |
| `model` | string | yes | 2–100 characters |
| `year` | integer | yes | 2000–2030 |
| `fuel_type` | string | yes | Must be a valid fuel type from master data |
| `transmission` | string | yes | One of: `Manual`, `Automatic`, `CVT`, `AMT`, `DCT`, `DSG` |
| `status` | string | yes | One of: `active`, `available`, `maintenance`, `inactive` |

### PUT /api/vehicles/{id}

**Purpose:** Update a vehicle

### DELETE /api/vehicles/{id}

**Purpose:** Delete a vehicle

#### Valid Fuel Types

`Petrol`, `Diesel`, `Electric`, `CNG`, `LPG`

#### Valid Statuses

`active`, `available`, `maintenance`, `inactive`

#### Valid Transmissions

`Manual`, `Automatic`, `CVT`, `AMT`, `DCT`, `DSG`

---

## Vehicle Owners Module

### GET /api/vehicle-owners

**Purpose:** List all vehicle owners  
**Auth Required:** Yes  
**Searchable fields:** `name`, `phone`, `email`  
**Filterable fields:** `owner_type`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Vehicle owners retrieved successfully",
  "data": {
    "items": [
      {
        "id": "vo1",
        "name": "Rajesh Sharma",
        "phone": "+91-98765-43210",
        "email": "rajesh.sharma@example.com",
        "owner_type": "Individual",
        "pan_number": "ABCDE1234F",
        "aadhar_number": "1234-5678-9012",
        "gst_number": null,
        "total_vehicles": 3,
        "is_active": true,
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-07-07T22:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 8,
      "totalPages": 1
    }
  }
}
```

### POST /api/vehicle-owners

#### Request Body

```json
{
  "name": "Rajesh Sharma",
  "owner_type": "Individual",
  "phone": "+91-98765-43210",
  "email": "rajesh.sharma@example.com",
  "pan_number": "ABCDE1234F",
  "is_active": true
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | yes | 2–200 characters |
| `owner_type` | string | yes | One of: `Individual`, `Company` |
| `phone` | string | yes | 10–20 characters |
| `email` | string | yes | Valid email format |
| `pan_number` | string | no | Pattern: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$` |
| `is_active` | boolean | yes | |

---

## Drivers Module

### GET /api/drivers

**Purpose:** List all drivers  
**Auth Required:** Yes  
**Searchable fields:** `name`, `phone`, `email`  
**Filterable fields:** `status`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Drivers retrieved successfully",
  "data": {
    "items": [
      {
        "id": "d1",
        "name": "Rajesh Sharma",
        "phone": "+91-98765-43201",
        "email": "rajesh.s@email.com",
        "status": "active",
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-07-07T22:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "pageSize": 10, "totalItems": 15, "totalPages": 2 }
  }
}
```

### POST /api/drivers

#### Request Body

```json
{
  "name": "Rajesh Sharma",
  "phone": "+91-98765-43201",
  "email": "rajesh.s@email.com",
  "status": "active"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | yes | 2–200 characters |
| `phone` | string | yes | 10–20 characters |
| `email` | string | yes | Valid email |
| `status` | string | yes | One of: `active`, `inactive` |

---

## Customers Module

### GET /api/customers

**Purpose:** List all customers  
**Auth Required:** Yes  
**Searchable fields:** `name`, `email`, `phone`  
**Filterable fields:** `status`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": {
    "items": [
      {
        "id": "c1",
        "name": "Rahul Sharma",
        "email": "rahul.s@email.com",
        "phone": "+91-98765-43201",
        "status": "active"
      }
    ],
    "pagination": { "page": 1, "pageSize": 10, "totalItems": 15, "totalPages": 2 }
  }
}
```

### POST /api/customers

#### Request Body

```json
{
  "name": "Rahul Sharma",
  "email": "rahul.s@email.com",
  "phone": "+91-98765-43201",
  "status": "active"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | yes | 2–200 characters |
| `email` | string | yes | Valid email |
| `phone` | string | yes | 10–20 characters |
| `status` | string | yes | One of: `active`, `inactive` |

### PUT /api/customers/{id}

### DELETE /api/customers/{id}

---

## Vendors Module

### GET /api/vendors

**Purpose:** List all vendors  
**Auth Required:** Yes  
**Searchable fields:** `name`, `contact_person`, `category`, `phone`  
**Filterable fields:** `is_active`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Vendors retrieved successfully",
  "data": {
    "items": [
      {
        "id": "vd1",
        "name": "Bharat Petroleum",
        "contact_person": "Rajesh Kumar",
        "phone": "+91-98765-43210",
        "email": "rajesh@bharatpetroleum.in",
        "category": "Fuel",
        "gst_number": "27AABCU1234F1Z5",
        "address": "Mumbai",
        "is_active": true,
        "created_at": "2026-01-15T00:00:00.000Z",
        "updated_at": "2026-07-07T22:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "pageSize": 10, "totalItems": 8, "totalPages": 1 }
  }
}
```

### POST /api/vendors

#### Request Body

```json
{
  "name": "Bharat Petroleum",
  "contact_person": "Rajesh Kumar",
  "category": "Fuel",
  "phone": "+91-98765-43210",
  "gst_number": "27AABCU1234F1Z5",
  "is_active": true
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | yes | 2–200 characters |
| `contact_person` | string | yes | 2–100 characters |
| `category` | string | yes | 2–100 characters |
| `phone` | string | yes | 10–20 characters |
| `gst_number` | string | no | Pattern: `^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$` |
| `is_active` | boolean | yes | |

---

## Maintenance Module

### GET /api/maintenance

**Purpose:** List all maintenance records  
**Auth Required:** Yes  
**Searchable fields:** `vehicle_number`, `service_type`, `vendor_name`  
**Sortable fields:** `cost`, `odometer_km`, `scheduled_date`, `status`  
**Filterable fields:** `status`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Maintenance records retrieved successfully",
  "data": {
    "items": [
      {
        "id": "m1",
        "vehicle_id": "v1",
        "vehicle_number": "MH-01-AB-1234",
        "vehicle_name": "Toyota Innova Crysta",
        "service_type": "Regular Service",
        "description": "Oil change + filter replacement",
        "status": "completed",
        "cost": 8500,
        "parts": [
          { "name": "Engine Oil", "quantity": 1, "unit_price": 2500 },
          { "name": "Oil Filter", "quantity": 1, "unit_price": 350 }
        ],
        "vendor_name": "AutoCare Service",
        "odometer_km": 35000,
        "scheduled_date": "2026-06-20T00:00:00.000Z",
        "completed_date": "2026-06-21T00:00:00.000Z",
        "created_at": "2026-06-10T00:00:00.000Z",
        "updated_at": "2026-07-07T22:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "pageSize": 10, "totalItems": 12, "totalPages": 2 }
  }
}
```

### POST /api/maintenance

#### Request Body

```json
{
  "vehicle_id": "v1",
  "service_type": "Oil Change",
  "vendor": "AutoCare Service",
  "cost": 8500,
  "odometer": 35000,
  "scheduled_date": "2026-06-20",
  "status": "scheduled"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `vehicle_id` | string | yes | Must reference existing vehicle |
| `service_type` | string | yes | 2–200 characters |
| `vendor` | string | yes | 2–200 characters |
| `cost` | number | yes | 0–1000000 |
| `odometer` | integer | yes | 0–999999 |
| `scheduled_date` | string (date) | yes | ISO date format |
| `status` | string | yes | One of: `completed`, `in_progress`, `scheduled`, `cancelled` |

#### Valid Statuses

`completed`, `in_progress`, `scheduled`, `cancelled`

---

## Service Schedule Module

### GET /api/service-schedules

**Purpose:** List all scheduled services  
**Auth Required:** Yes  
**Sortable fields:** `estimated_cost`, `scheduled_date`, `status`  
**Searchable fields:** `vehicle_number`, `service_type`, `assigned_to`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Service schedules retrieved successfully",
  "data": {
    "items": [
      {
        "id": "sch1",
        "vehicle_id": "v1",
        "vehicle_number": "MH-01-AB-1234",
        "service_type": "Oil Change",
        "description": "Routine maintenance",
        "scheduled_date": "2026-07-20T00:00:00.000Z",
        "status": "scheduled",
        "odometer_km": 40000,
        "assigned_to": "Rajesh Sharma",
        "estimated_cost": 3500,
        "created_at": "2026-06-01T00:00:00.000Z",
        "updated_at": "2026-07-07T22:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "pageSize": 10, "totalItems": 10, "totalPages": 1 }
  }
}
```

#### Valid Statuses

`scheduled`, `overdue`, `completed`

---

## Notifications Module

### GET /api/notifications

**Purpose:** List all notifications  
**Auth Required:** Yes  
**Filterable fields:** `is_read`, `type`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Notifications retrieved",
  "data": {
    "items": [
      {
        "id": "n1",
        "title": "Insurance Expiring Soon",
        "description": "MH-01-AB-1234 insurance expires in 7 days",
        "type": "warning",
        "is_read": false,
        "created_at": "2026-07-01T10:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "pageSize": 20, "totalItems": 8, "totalPages": 1 }
  }
}
```

#### Valid Types

| Type | Icon Color | Use Case |
|------|-----------|----------|
| `info` | Blue (#183eeb) | General information |
| `warning` | Amber (#f59e0b) | Upcoming deadlines |
| `success` | Green (#22c55e) | Confirmations / payments received |
| `error` | Red (#ef4444) | High-expense alerts / failures |

#### Read State

`is_read: true` sets opacity to 0.6 in the frontend.

### GET /api/notifications/unread-count

**Purpose:** Return count of unread notifications (for header badge)

```json
{
  "success": true,
  "message": "Unread count retrieved",
  "data": { "count": 3 }
}
```

### PUT /api/notifications/{id}/read

**Purpose:** Mark a notification as read

---

## Reports Module

### GET /api/reports

**Purpose:** List generated reports  
**Auth Required:** Yes  
**Sortable fields:** `generated_at`, `type`, `status`  
**Filterable fields:** `status`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Reports retrieved",
  "data": {
    "items": [
      {
        "id": "r1",
        "type": "Profit & Loss",
        "generated_at": "2026-06-01T00:00:00.000Z",
        "period": "Jan 2026",
        "total_rows": 35,
        "status": "completed"
      }
    ],
    "pagination": { "page": 1, "pageSize": 10, "totalItems": 6, "totalPages": 1 }
  }
}
```

#### Valid Types

`Profit & Loss`, `Revenue Summary`, `Expense Report`, `Fleet Utilization`, `Settlement Report`, `Tax Summary`

#### Valid Statuses

`completed`, `failed`

### POST /api/reports/generate

**Purpose:** Generate a new report

#### Request Body

```json
{
  "type": "Profit & Loss",
  "period": "Jul 2026",
  "startDate": "2026-07-01",
  "endDate": "2026-07-31"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `type` | string | yes | Must be a valid report type |
| `period` | string | yes | `"MMM YYYY"` format |
| `startDate` | string (date) | yes | |
| `endDate` | string (date) | yes | Must be after startDate |

### GET /api/reports/{id}/download

**Purpose:** Download a report as CSV (returns file with `Content-Disposition: attachment`)

**Headers:** `Accept: text/csv`

---

## Analytics Module

### GET /api/analytics

**Purpose:** Return analytics data with revenue/expense/profit trends, utilization, platform performance, and cost breakdown  
**Auth Required:** Yes  
**Cache:** 120 seconds

#### Success Response (200)

```json
{
  "success": true,
  "message": "Analytics data retrieved",
  "data": {
    "revenue": [
      { "month": "Jan", "total": 1800000 }
    ],
    "expenses": [
      { "month": "Jan", "total": 900000 }
    ],
    "profit": [
      { "month": "Jan", "total": 700000 }
    ],
    "utilization": [
      { "month": "Jan", "rate": 72, "total_vehicles": 12, "active_vehicles": 8 }
    ],
    "top_platforms": [
      { "name": "Uber", "revenue": 1800000, "bookings": 320, "growth": 18 }
    ],
    "cost_breakdown": [
      { "category": "Fuel", "amount": 250000, "percentage": 22 }
    ]
  }
}
```

#### Chart Mappings

| Canvas ID | Data Path | Chart Type |
|-----------|-----------|------------|
| `chart-analytics-revenue` | `revenue[].{label:month, value:total}` | Bar |
| `chart-analytics-expenses` | `expenses[].{label:month, value:total}` | Bar |
| `chart-analytics-utilization` | `utilization[].{label:month, value:rate}` | Bar |
| `chart-analytics-platform` | `top_platforms[].{label:name, value:revenue}` | Donut |
| `chart-analytics-cost` | `cost_breakdown[].{label:category, value:amount}` | Donut |

---

## Operations / Tasks Module

### GET /api/tasks

**Purpose:** List operational tasks  
**Auth Required:** Yes  
**Filterable fields:** `status`, `priority`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Tasks retrieved",
  "data": {
    "items": [
      {
        "id": "t1",
        "title": "Verify settlement amounts",
        "status": "pending",
        "priority": "high",
        "assigned_to": "Rajesh Sharma",
        "due_date": "2026-07-15T00:00:00.000Z",
        "created_at": "2026-06-20T00:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "pageSize": 10, "totalItems": 5, "totalPages": 1 }
  }
}
```

#### Valid Statuses

`pending`, `in_progress`, `completed`

#### Priority-to-Color Mapping

| Priority | Dot Color |
|----------|-----------|
| `critical` | Red (bg-red-500) |
| `high` | Red (bg-red-500) |
| `medium` | Yellow (bg-yellow-500) |
| `low` | Green (bg-green-500) |

### Automation Page

The automation page (`html/automation.html`) is a **static empty state** that reads no API data. It displays:

> "No automation rules configured"


---

## Master Data Module

### GET /api/master-data

**Purpose:** Return all lookup/dropdown lists in a single response  
**Auth Required:** Yes  
**Cache:** 300 seconds (5 minutes — these change infrequently)

#### Success Response (200)

```json
{
  "success": true,
  "message": "Master data retrieved",
  "data": {
    "expense_categories": [
      { "id": "c1", "name": "Fuel", "type": "expense_category", "is_active": true }
    ],
    "platforms": [
      { "id": "p1", "name": "Uber", "type": "platform", "is_active": true }
    ],
    "payment_modes": [
      { "id": "pm1", "name": "Cash", "type": "payment_mode", "is_active": true }
    ],
    "fuel_types": [
      { "id": "ft1", "name": "Petrol", "type": "fuel_type", "is_active": true }
    ],
    "owner_types": [
      { "id": "ot1", "name": "Individual", "type": "owner_type", "is_active": true }
    ],
    "vehicle_statuses": [
      { "id": "vs1", "name": "Active", "type": "vehicle_status", "is_active": true }
    ],
    "journal_categories": [
      { "id": "jc1", "name": "Booking Revenue", "type": "journal_category", "is_active": true }
    ],
    "outstanding_categories": [
      { "id": "oc1", "name": "Platform Outstanding", "type": "outstanding_category", "is_active": true }
    ],
    "outstanding_priorities": [
      { "id": "op1", "name": "Critical", "type": "outstanding_priority", "is_active": true }
    ],
    "platform_categories": [
      { "id": "pc1", "name": "Aggregator", "type": "platform_category", "is_active": true }
    ],
    "transmission_types": [
      { "id": "tt1", "name": "Manual", "type": "transmission_type", "is_active": true }
    ],
    "accounts": [
      { "id": "a1", "name": "HDFC Bank - Current", "type": "account", "is_active": true }
    ]
  }
}
```

### Master Data Lookups

#### Platforms

Default values: `Uber`, `Ola`, `Rapido`, `Swiggy`, `Zomato`, `Amazon Flex`, `Dunzo`, `Porter`, `BluSmart`, `Meru`, `Savaari`, `Intercity Taxi`

#### Expense Categories

Default values: `Fuel`, `Maintenance`, `Toll`, `Parking`, `Insurance`, `EMI`, `Driver Salary`, `Cleaning`, `Repairs`, `Tyres`, `Battery`, `Coolant`, `Brake Pads`, `Oil Change`, `AC Service`

#### Payment Modes

Default values: `Cash`, `UPI`, `Credit Card`, `Debit Card`, `Net Banking`, `Cheque`

#### Journal Categories

Default values: `Booking Revenue`, `Extra KM Charges`, `Toll Reimbursement`, `Waiting Charges`, `Night Charges`, `Cancellation Fee`, `Platform Bonus`, `Peak Pricing`, `Deduction`, `Penalty`

#### Outstanding Categories

Default values: `Platform Outstanding`, `Driver Outstanding`, `Vendor Outstanding`, `Customer Outstanding`, `Other`

#### Outstanding Priorities

Default values: `Critical`, `High`, `Medium`, `Low`

#### Platform Categories

Default values: `Aggregator`, `Direct`, `Fleet`, `Corporate`

#### Fuel Types

Default values: `Petrol`, `Diesel`, `Electric`, `CNG`, `LPG`

#### Owner Types

Default values: `Individual`, `Company`, `Partnership`, `Trust`, `HUF`

#### Vehicle Statuses

Default values: `Active`, `Available`, `Maintenance`, `Inactive`, `Sold`

#### Transmission Types

Default values: `Manual`, `Automatic`, `CVT`, `AMT`, `DCT`

### Read-Only Master Data Table Pages

These 8 pages use the `GET /api/master-data` response filtered by the `filter` key:

| Page | `data-page` | `masterMappings.filter` | Table ID |
|------|-------------|------------------------|----------|
| accounts.html | `accounts` | `accounts` | `masters-table` |
| expense-categories.html | `expense-categories` | `expense_categories` | `masters-table` |
| payment-modes.html | `payment-modes` | `payment_modes` | `masters-table` |
| fuel-types.html | `fuel-types` | `fuel_types` | `masters-table` |
| platform-masters.html | `platforms` | `platforms` | `masters-table` |
| journal-categories.html | `journal-categories` | `journal_categories` | `masters-table` |
| outstanding-priorities.html | `outstanding-priorities` | `outstanding_priorities` | `masters-table` |
| platform-categories.html | `platform-categories` | `platform_categories` | `masters-table` |

These pages display a simple 3-column table: **ID**, **Name**, **Status** (active badge).

### CRUD Master Data Pages (With Inline Scripts)

These pages have full inline CRUD and read from their own endpoints:

| Page | Endpoint Pattern | Form Fields |
|------|-----------------|-------------|
| vehicle-status.html | `/api/vehicle-statuses` | `name`, `is_active` |
| ownership-types.html | `/api/owner-types` | `name`, `is_active` |
| transmission-types.html | `/api/transmission-types` | `name`, `is_active` |
| outstanding-categories.html | `/api/outstanding-categories` | `name`, `is_active` |

All have: `GET`, `POST`, `PUT /{id}`, `DELETE /{id}` with the same field pattern:
- `name` (string, required, 2–100 chars)
- `is_active` (boolean, required)

---

## Settings Module

### GET /api/settings

**Purpose:** Return all application settings  
**Auth Required:** Yes  
**Roles:** `super_admin`, `admin`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Settings retrieved",
  "data": {
    "company": {
      "name": "Marc8 Fleet Solutions Pvt Ltd",
      "address": "42, Tech Park Road, Andheri East, Mumbai - 400093",
      "gst": "27AABCU1234F1Z5",
      "pan": "AABCU1234F",
      "cin": "U74999MH2024PTC123456",
      "contact_email": "info@marc8fleet.in",
      "contact_phone": "+91-22-6789-1234"
    },
    "dashboard": {
      "default_view": "daily",
      "refresh_interval": 30,
      "show_charts": true,
      "show_alerts": true,
      "compact_mode": false
    },
    "financial": {
      "currency": "INR",
      "fiscal_year_start": "2026-04-01",
      "tax_rate": 18,
      "tds_rate": 1,
      "commission_rate": 12
    },
    "notification": {
      "email_alerts": true,
      "push_notifications": true,
      "sms_alerts": false,
      "daily_summary": true,
      "weekly_report": true
    },
    "preferences": {
      "language": "en-IN",
      "date_format": "dd/MM/yyyy",
      "time_format": "24h",
      "timezone": "Asia/Kolkata",
      "theme": "dark"
    },
    "security": {
      "two_factor": false,
      "session_timeout": 60,
      "password_policy": "strong",
      "ip_whitelist": [],
      "login_notifications": true
    }
  }
}
```

#### Frontend Element Mappings

| Element ID | Settings Path |
|-----------|--------------|
| `settings-company-name` | `company.name` |
| `settings-company-address` | `company.address` |
| `settings-company-gst` | `company.gst` |
| `settings-company-pan` | `company.pan` |
| `settings-company-email` | `company.contact_email` |
| `settings-company-phone` | `company.contact_phone` |
| `settings-currency` | `financial.currency` |
| `settings-tax-rate` | `financial.tax_rate + "%"` |
| `settings-tds-rate` | `financial.tds_rate + "%"` |
| `settings-commission-rate` | `financial.commission_rate + "%"` |
| `settings-refresh-interval` | `dashboard.refresh_interval + "s"` |
| `settings-session-timeout` | `security.session_timeout + " min"` |

### PUT /api/settings

**Purpose:** Update settings (partial update supported)  
**Auth Required:** Yes  
**Roles:** `super_admin`, `admin`

#### Request Body

Any subset of the settings object:

```json
{
  "company": {
    "name": "Updated Company Name",
    "contact_email": "new@email.com"
  },
  "dashboard": {
    "refresh_interval": 60
  }
}
```

---

## File Uploads

**There are no file upload components in this frontend.**

The `assets/`, `fonts/`, `icons/`, and `images/` directories exist as empty placeholders. No HTML page includes `<input type="file">` or any drag-and-drop zone.

If file upload is required (e.g., invoice PDFs, profile photos, CSV imports), the following would need to be added:

- **No existing endpoint** for file upload
- **No existing form field** of type `file`
- **Recommendation:** Implement `POST /api/uploads` returning `{ fileUrl, fileName, fileSize }` when upload components are introduced

---

## Validation Rules Reference

### Identifiers

| Rule | Pattern |
|------|---------|
| Vehicle Number | `^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$` |
| PAN Number | `^[A-Z]{5}[0-9]{4}[A-Z]{1}$` |
| GST Number | `^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$` |
| Phone | 10–20 characters, allow +, - and spaces |
| Email | Standard email format |

### Numeric Ranges

| Field | Min | Max |
|-------|-----|-----|
| `year` (vehicle) | 2000 | 2030 |
| `distance_km` | 1 | 10000 |
| `amount` (all monetary) | 0 | 10000000 |
| `odometer_km` | 0 | 999999 |
| `page` | 1 | 1000 |
| `pageSize` | 1 | 100 |

### String Lengths

| Field | Min | Max |
|-------|-----|-----|
| Names (customer, driver, vendor, etc.) | 2 | 200 |
| Location | 2 | 200 |
| Description | 2 | 500 |
| Invoice number | 2 | 50 |
| Booking ID | 2 | 50 |

### Required Fields

All fields marked `required` in POST/PUT request bodies must be non-null, non-empty strings, or valid numbers/booleans as specified.

---

## HTTP Status Code Conventions

| Code | Usage |
|------|-------|
| `200` | Successful GET, PUT, DELETE |
| `201` | Successful POST (resource created) |
| `400` | Malformed request syntax |
| `401` | Missing or invalid authentication token |
| `403` | Authenticated but insufficient role/permissions |
| `404` | Resource not found |
| `409` | Conflict (e.g., duplicate vehicle number) |
| `422` | Request body validation failure |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error |

### Error Response Body for Common Status Codes

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid request body",
  "error": { "code": "BAD_REQUEST", "details": "JSON parse error at position 42" }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Booking not found",
  "error": { "code": "NOT_FOUND", "details": { "id": "b999" } }
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "Vehicle number already exists",
  "error": { "code": "CONFLICT", "details": { "field": "vehicle_number", "value": "MH-01-AB-1234" } }
}
```

---

## Naming Conventions

### API Endpoints

- Use plural nouns: `/api/bookings`, `/api/vehicles`
- Use kebab-case for multi-word resources: `/api/vehicle-owners`, `/api/service-schedules`
- Use lowercase
- Nest under `/api/` prefix

### JSON Field Names

- `snake_case` for all field names (matching the existing mock data convention)
- Examples: `vehicle_number`, `total_amount`, `created_at`, `is_active`, `booking_id`

### Query Parameters

- `camelCase` for multi-word: `pageSize`, `sortBy`, `sortOrder`, `startDate`, `endDate`

### Status Values

- `snake_case` for multi-word status values: `partially_paid`, `in_progress`, `no_show`
- Lowercase single word: `active`, `completed`, `pending`

---

## Versioning Strategy

**Current:** v1 (implicit — no version prefix in URL path)

### Recommendation

Use **Accept header versioning** for API evolution:

| Version | Header |
|---------|--------|
| v1 (current) | `Accept: application/json` or no header |
| v2+ (future) | `Accept: application/vnd.marc8.v2+json` |

### Breaking Change Policy

- Adding new fields to responses: **non-breaking** — frontend ignores unknown fields
- Removing fields from responses: **breaking** — bump major version
- Changing field types: **breaking** — bump major version
- Adding new endpoints: **non-breaking**
- Changing endpoint URLs: **breaking** — bump major version

---

## Implementation Order

### Phase 1 — Foundation (Days 1–3)

```
1. POST /api/auth/login           ← Required for all other endpoints
2. POST /api/auth/logout
3. GET  /api/auth/me
4. POST /api/auth/refresh
5. GET  /api/settings             ← Required by settings page
6. GET  /api/master-data          ← Required by 8 master data pages + dropdowns
```

### Phase 2 — Core Business Data (Days 4–7)

```
7.  GET /api/dashboard            ← Primary landing page
8.  GET /api/bookings             ← Most complex table
9.  GET /api/expenses
10. GET /api/journal
11. GET /api/outstandings
12. GET /api/settlements
13. GET /api/settlement-dashboard
```

### Phase 3 — Fleet & Maintenance (Days 8–9)

```
14. GET /api/fleet-dashboard
15. GET /api/vehicles
16. GET /api/maintenance
17. GET /api/service-schedules
```

### Phase 4 — Master Data CRUD (Days 10–11)

```
18. GET/POST/PUT/DELETE /api/customers
19. GET/POST/PUT/DELETE /api/vendors
20. GET/POST/PUT/DELETE /api/drivers
21. GET/POST/PUT/DELETE /api/vehicles (already in Phase 3)
22. GET/POST/PUT/DELETE /api/vehicle-owners
23. GET/POST/PUT/DELETE /api/vehicle-statuses
24. GET/POST/PUT/DELETE /api/owner-types
25. GET/POST/PUT/DELETE /api/transmission-types
26. GET/POST/PUT/DELETE /api/outstanding-categories
```

### Phase 5 — Intelligence & Actions (Days 12–13)

```
27. GET /api/analytics
28. GET /api/reports
29. POST /api/reports/generate
30. GET /api/reports/{id}/download
31. GET /api/notifications
32. GET /api/notifications/unread-count
33. GET /api/tasks
34. PUT /api/settings
```

### Phase 6 — Create Operations (Days 14–15)

```
35. POST /api/bookings
36. POST /api/expenses
37. POST /api/maintenance
38. PUT  /api/bookings/{id}
39. PUT  /api/expenses/{id}
40. PUT  /api/maintenance/{id}
41. DELETE endpoints for all CRUD resources
```

---

## Endpoint Dependency Graph

```
POST /api/auth/login
  └── All other endpoints (via Bearer token)

GET /api/master-data
  └── All list pages (platform names, statuses, categories)

GET /api/dashboard
  └── dashboard.html (main landing page)

GET /api/settlement-dashboard
  └── settlements.html (header KPIs)

GET /api/fleet-dashboard
  └── fleet-dashboard.html
      └── Uses /api/vehicles data (embedded in response)
      └── Uses /api/service-schedules data (upcoming_services)

GET /api/analytics
  └── analytics.html
      └── Uses /api/dashboard trends (revenue/expense)

GET /api/settings
  └── settings.html

GET /api/bookings
  └── bookings.html

GET /api/expenses
  └── expenses.html

GET /api/journal
  └── journal-ledger.html

GET /api/outstandings
  └── outstandings.html

GET /api/settlements
  └── settlements.html (table)

GET /api/vehicles
  └── vehicles.html
  └── fleet-dashboard.html (vehicle table)

GET /api/maintenance
  └── maintenance.html

GET /api/service-schedules
  └── service-schedules.html

GET /api/notifications
  └── notifications.html

GET /api/reports
  └── reports.html

GET /api/tasks
  └── operations.html

GET /api/customers
  └── customers.html

GET /api/vendors
  └── vendors.html
  └── expenses.html (vendor dropdown)

GET /api/drivers
  └── drivers.html

GET /api/vehicle-owners
  └── vehicle-owners.html
```

### Independent Endpoints

These endpoints have no dependencies on each other and can be implemented in parallel:
- `GET /api/bookings`, `/api/expenses`, `/api/journal`, `/api/outstandings`, `/api/settlements`
- `GET /api/vehicles`, `/api/maintenance`, `/api/service-schedules`
- All CRUD for customers, vendors, drivers, vehicle-owners
- All master data CRUD pages

---

*End of API Contract — Marc8 Fleet Financial ERP v1.0.0*
