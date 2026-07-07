# Developer Integration Guide — Marc8 Fleet Financial ERP

**Target Audience:** Backend Engineer  
**Frontend Version:** 1.0.0  
**Purpose:** Connect a live backend API to this static HTML frontend  

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [HTML Pages](#2-html-pages)
3. [CSS Architecture](#3-css-architecture)
4. [JavaScript Architecture](#4-javascript-architecture)
5. [Mock Data Locations](#5-mock-data-locations)
6. [Where APIs Should Be Connected](#6-where-apis-should-be-connected)
7. [Expected API Response Formats](#7-expected-api-response-formats)
8. [Authentication Flow](#8-authentication-flow)
9. [Dashboard Data Requirements](#9-dashboard-data-requirements)
10. [Charts Data Requirements](#10-charts-data-requirements)
11. [Table Data Requirements](#11-table-data-requirements)
12. [Forms](#12-forms)
13. [Upload Components](#13-upload-components)
14. [Notifications](#14-notifications)
15. [Error Handling](#15-error-handling)
16. [Recommended Integration Sequence](#16-recommended-integration-sequence)

---

## 1. Folder Structure

```
Marc8_HTML_v1.0/
├── html/           # 33 HTML pages (one per route)
├── css/            # 10 stylesheets
│   ├── brand.css         # CSS custom properties — design tokens (colors, spacing, fonts)
│   ├── base.css          # Reset, typography, scrollbar, selection
│   ├── layout.css        # Sidebar + main content grid
│   ├── components.css    # Buttons, cards, badges, dropdowns, alerts, inputs
│   ├── dashboard.css     # Dashboard-specific widgets
│   ├── tables.css        # Table + pagination + sort styles
│   ├── forms.css         # Form input, select, textarea
│   ├── charts.css        # Chart container styles
│   ├── utilities.css     # Spacing, typography, flex/grid helpers
│   └── responsive.css    # Tablet/mobile breakpoints
├── js/
│   ├── data.js           # Mock data generators + DATA object (TO REPLACE)
│   └── app.js            # All frontend logic (TO RETAIN)
├── assets/         # (empty — reserved for uploads)
├── fonts/          # (empty — reserved for custom fonts)
├── icons/          # (empty — reserved for custom icons)
├── images/         # (empty — reserved for images)
├── favicon.svg
├── README.md
├── HTML_CONVERSION_REPORT.md
├── HTML_RUNTIME_VERIFICATION_REPORT.md
└── DEVELOPER_INTEGRATION_GUIDE.md
```

---

## 2. HTML Pages

### 2.1 Page Index

| # | File | `data-page` | Purpose | API Replacement |
|---|------|-------------|---------|-----------------|
| 1 | `login.html` | *(none)* | Authentication | Replace `handleGuestLogin()` |
| 2 | `dashboard.html` | `dashboard` | KPI dashboard | `DATA.getDashboard` |
| 3 | `bookings.html` | `bookings` | Booking list | `DATA.getBookings` |
| 4 | `journal-ledger.html` | `journal-ledger` | Journal entries | `DATA.getJournal` |
| 5 | `expenses.html` | `expenses` | Expense list | `DATA.getExpenses` |
| 6 | `settlements.html` | `settlements` | Settlement KPIs + list | `DATA.getSettlementDashboard` + `DATA.getSettlements` |
| 7 | `outstandings.html` | `outstandings` | Outstanding list | `DATA.getOutstandings` |
| 8 | `fleet-dashboard.html` | `fleet-dashboard` | Fleet health + vehicles | `DATA.getFleetDashboard` |
| 9 | `maintenance.html` | `maintenance` | Maintenance records | `DATA.getMaintenance` |
| 10 | `service-schedules.html` | `service-schedules` | Service schedules | `DATA.getSchedules` |
| 11 | `operations.html` | `operations` | Task list | `DATA.getTasks` |
| 12 | `automation.html` | `automation` | Automation rules | *(static empty state — no data needed)* |
| 13 | `analytics.html` | `analytics` | Analytics charts | `DATA.getAnalytics` |
| 14 | `reports.html` | `reports` | Report list | `DATA.getReports` |
| 15 | `notifications.html` | `notifications` | Notification list | `DATA.getNotifications` |
| 16 | `customers.html` | `customers` | Customer CRUD | *(inline script — see §6.3)* |
| 17 | `vendors.html` | `vendors` | Vendor CRUD | `DATA.getVendors` |
| 18 | `drivers.html` | `drivers` | Driver CRUD | *(inline script)* |
| 19 | `vehicles.html` | `vehicles` | Vehicle CRUD | `DATA.getVehicles` |
| 20 | `vehicle-owners.html` | `vehicle-owners` | Owner CRUD | `DATA.getVehicleOwners` |
| 21 | `accounts.html` | `accounts` | Account list | `DATA.getMasterData().accounts` |
| 22 | `platform-masters.html` | `platforms` | Platform list | `DATA.getMasterData().platforms` |
| 23 | `expense-categories.html` | `expense-categories` | Expense category list | `DATA.getMasterData().expense_categories` |
| 24 | `payment-modes.html` | `payment-modes` | Payment mode list | `DATA.getMasterData().payment_modes` |
| 25 | `fuel-types.html` | `fuel-types` | Fuel type list | `DATA.getMasterData().fuel_types` |
| 26 | `journal-categories.html` | `journal-categories` | Journal category list | `DATA.getMasterData().journal_categories` |
| 27 | `vehicle-status.html` | `vehicle-status` | Vehicle status CRUD | *(inline script)* |
| 28 | `ownership-types.html` | `ownership-types` | Ownership type CRUD | *(inline script)* |
| 29 | `transmission-types.html` | `transmission-types` | Transmission type CRUD | *(inline script)* |
| 30 | `outstanding-categories.html` | `outstanding-categories` | Outstanding category CRUD | *(inline script)* |
| 31 | `outstanding-priorities.html` | `outstanding-priorities` | Outstanding priority list | `DATA.getMasterData().outstanding_priorities` |
| 32 | `platform-categories.html` | `platform-categories` | Platform category list | `DATA.getMasterData().platform_categories` |
| 33 | `settings.html` | `settings` | Company settings | `DATA.getSettings` |

### 2.2 Page Identity

Every dashboard page identifies itself via:

```html
<body data-page="page-name">
```

`app.js` reads `document.body.dataset.page` to determine which initializer to run.

### 2.3 Script Load Order

All dashboard pages load scripts in this exact order:

```html
<script src="../js/data.js"></script>
<script src="../js/app.js"></script>
```

**This order must be preserved.** `data.js` defines the `DATA` global object that `app.js` consumes.

---

## 3. CSS Architecture

### 3.1 Design Tokens

All design tokens are CSS custom properties defined in `css/brand.css`:

```css
:root {
  --primary: #183eeb;
  --primary-hover: #1a45f5;
  --accent: #ff7200;
  --accent-hover: #e66500;
  --success: #22c55e;
  --warning: #f59e0b;
  --destructive: #ef4444;
  --info: #183eeb;
  --background: #0a0f1a;
  --surface: #111827;
  --surface-light: #1e293b;
  --border: #1e293b;
  --border-light: #334155;
  --foreground: #f8fafc;
  --muted: #94a3b8;
  --muted-foreground: #64748b;
  --secondary-400: #94a3b8;
  --secondary-500: #64748b;
  --radius: 0.5rem;
}
```

### 3.2 CSS Loading Order

All 10 CSS files are loaded on every page in this order:

1. `brand.css` — tokens must be first
2. `base.css` — reset, typography
3. `layout.css` — sidebar, main grid
4. `components.css` — buttons, cards, badges, dropdowns
5. `dashboard.css` — dashboard widgets
6. `tables.css` — data tables
7. `forms.css` — form controls
8. `charts.css` — chart canvases
9. `utilities.css` — helper classes
10. `responsive.css` — media queries (must be last)

### 3.3 Naming Convention

Utility-first hybrid approach. Classes follow Tailwind CSS conventions where applicable:
- `flex`, `flex-1`, `gap-2`, `p-4`, `m-2`, `text-sm`, `font-medium`
- Custom component classes: `sidebar-item`, `card`, `btn btn-primary`, `badge badge-success`
- State modifiers: `hidden`, `active`, `expanded`, `sidebar-collapsed`

### 3.4 Responsive Breakpoints

Defined in `css/responsive.css`:
- **Desktop**: >1024px — sidebar expanded (ml-64), full layout
- **Tablet**: 768–1024px — sidebar collapsed (ml-16)
- **Mobile**: <768px — sidebar hidden, hamburger navigation

---

## 4. JavaScript Architecture

### 4.1 Two Files, One Global Object

**`data.js`** defines:
- `window.DATA` — the data layer (16 getters returning arrays/objects)
- `window.DEMO_USER` — mock session user

**`app.js`** defines:
- All interactive behavior (sidebar, tables, charts, modals, toasts, command palette)
- Page-specific initializers called from `DOMContentLoaded`
- Utility functions via `window.*` for inline `onclick` access:
  - `toggleSidebar()`, `openCommandPalette()`, `showToast()`, `openModal()`, `closeModal()`
  - `openDrawer()`, `closeDrawer()`, `openConfirmDialog()`, `closeConfirmDialog()`

### 4.2 Initialization Flow

```
DOMContentLoaded fires
  → initSidebar()        # Restore sidebar state, set active nav
  → initDropdowns()      # Click-to-open dropdowns
  → initModals()         # Overlay click + Escape key handling
  → initCommandPalette() # ⌘K search
  → initConfirmDialog()  # Confirmation overlay
  → initBookingForm()    # Booking drawer form (if present)
  → page-specific init:  # Based on data-page attribute
      dashboard    → initDashboard()
      bookings     → initTable('bookings-table', ...)
      expenses     → initTable('expenses-table', ...)
      settings     → populate settings fields
      ...          → (see page index above)
```

### 4.3 Key Global Dependencies

| Global | Defined In | Consumed By | Purpose |
|--------|-----------|-------------|---------|
| `window.DATA` | data.js | app.js, inline scripts | Data getters |
| `window.DEMO_USER` | data.js | login.html | Mock user info |
| `window.toggleSidebar()` | app.js | All HTML pages | Sidebar collapse/expand |
| `window.showToast()` | app.js | HTML inline onclick` | Toast notifications |
| `window.openCommandPalette()` | app.js | HTML onclick | ⌘K search |
| `window.openConfirmDialog()` | app.js | Inline scripts | Delete confirmation |
| `window.openDrawer()` | app.js | Inline scripts | CRUD forms |
| `window.goToPage()` | app.js | initTable | Table pagination |

---

## 5. Mock Data Locations

### 5.1 The DATA Object

All mock data lives in `js/data.js` at lines 452–472:

```javascript
const DATA = {
  getVehicles:            () => cached('vehicles', generateVehicles),
  getBookings:            () => cached('bookings', generateBookings),
  getExpenses:            () => cached('expenses', generateExpenses),
  getJournal:             () => cached('journal', generateJournal),
  getOutstandings:        () => cached('outstandings', generateOutstandings),
  getSettlements:         () => cached('settlements', generateSettlements),
  getMaintenance:         () => cached('maintenance', generateMaintenance),
  getVendors:             () => cached('vendors', generateVendors),
  getVehicleOwners:       () => cached('owners', generateVehicleOwners),
  getSchedules:           () => cached('schedules', generateSchedules),
  getNotifications:       () => cached('notifications', generateNotifications),
  getTasks:               () => cached('tasks', generateTasks),
  getReports:             () => cached('reports', generateReports),
  getDashboard:           () => cached('dashboard', generateDashboardData),
  getSettlementDashboard: () => cached('settlement_dashboard', generateSettlementDashboard),
  getAnalytics:           () => cached('analytics', generateAnalytics),
  getFleetDashboard:      () => cached('fleet_dashboard', generateFleetDashboard),
  getMasterData:          () => cached('masters', generateMasterData),
  getSettings:            () => cached('settings', generateSettings),
};
```

### 5.2 Caching Layer

```javascript
const CACHE = new Map();
function cached(key, fn) {
  if (!CACHE.has(key)) CACHE.set(key, fn());
  return CACHE.get(key);
}
```

**During integration:** Remove or preserve the cache as desired. The `cached()` wrapper ensures data is generated once per session. For real APIs, you will replace the generator functions with `async fetch()` calls.

### 5.3 Inline Script Data

9 pages contain inline `<script>` blocks with their own mock data and CRUD logic:

| Page | Inline Data Variable | Type |
|------|---------------------|------|
| customers.html | `customers` array | Hardcoded 15 customer objects |
| vendors.html | *(uses DATA.getVendors + inline CRUD)* | DATA + inline |
| drivers.html | `drivers` array | Hardcoded driver objects |
| vehicles.html | *(uses DATA.getVehicles + inline CRUD)* | DATA + inline |
| vehicle-owners.html | *(uses DATA.getVehicleOwners)* | DATA + inline |
| vehicle-status.html | `vehicleStatuses` array | Hardcoded status objects |
| ownership-types.html | `ownershipTypes` array | Hardcoded type objects |
| transmission-types.html | `transmissionTypes` array | Hardcoded type objects |
| outstanding-categories.html | `outstandingCategories` array | Hardcoded category objects |

---

## 6. Where APIs Should Be Connected

### 6.1 Primary Integration Point: `js/data.js`

**Replace the `DATA` object's getters** with async functions that call your backend API.

**Before:**
```javascript
getBookings: () => cached('bookings', generateBookings),
```

**After:**
```javascript
getBookings: async () => {
  const res = await fetch('/api/bookings', {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
},
```

**Remove** the `cached()` wrapper if you want real-time data, or retain it with a TTL.

### 6.2 Pages Using `initTable()` — Simple Replacement

These 15 pages use `app.js`'s `initTable()` which calls a `DATA.get*()` getter:

```
bookings, journal-ledger, expenses, settlements, outstandings,
maintenance, service-schedules, reports, fleet-dashboard (vehicles table)
```

**Pattern in app.js:**
```javascript
if (page === 'bookings') {
  // ... column definitions ...
  initTable('bookings-table', { data: DATA.getBookings(), columns: columns, pageSize: 10, emptyMessage: 'No bookings found' });
}
```

**Change to async:**
```javascript
if (page === 'bookings') {
  var bookings = await DATA.getBookings();
  initTable('bookings-table', { data: bookings, columns: columns, pageSize: 10, emptyMessage: 'No bookings found' });
}
```

### 6.3 Pages With Inline Scripts — Per-Page Replacement

9 pages (customers, vendors, drivers, vehicles, vehicle-owners, vehicle-status, ownership-types, transmission-types, outstanding-categories) have inline `<script>` blocks with their own CRUD logic.

**Each inline script contains:**
- `load*()` — fetches data and renders a table
- `filter*()` — client-side filtering
- `render*()` — builds table rows
- `open*Drawer()`, `save*()`, `delete*()` — CRUD operations

**Integration pattern (example: customers.html):**
```javascript
async function loadCustomers() {
  const res = await fetch('/api/customers', { headers: authHeaders() });
  customers = await res.json();
  filterCustomers();
}
```

### 6.4 Master Data Pages Using `masterMappings`

8 pages (accounts, expense-categories, payment-modes, fuel-types, platform-masters, journal-categories, outstanding-priorities, platform-categories) use `app.js`'s `masterMappings` object:

```javascript
var masterMappings = {
  'accounts':            { label: 'Accounts',            filter: 'accounts',            emptyMsg: 'No accounts found' },
  'expense-categories':  { label: 'Expense Categories',  filter: 'expense_categories',  emptyMsg: '...' },
  'payment-modes':       { label: 'Payment Modes',       filter: 'payment_modes',       emptyMsg: '...' },
  'fuel-types':          { label: 'Fuel Types',          filter: 'fuel_types',          emptyMsg: '...' },
  'platforms':           { label: 'Platforms',           filter: 'platforms',           emptyMsg: '...' },
  'journal-categories':  { label: 'Journal Categories',  filter: 'journal_categories',  emptyMsg: '...' },
  'outstanding-priorities': { ... },
  'platform-categories': { ... },
};
```

These pages call `DATA.getMasterData()` which returns an object keyed by filter name.

**Integration:** Replace `DATA.getMasterData()` to return `GET /api/master-data` which includes all master data arrays in a single response.

---

## 7. Expected API Response Formats

### 7.1 Bookings

**`GET /api/bookings`**

```json
[
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
]
```

**Fields used by frontend:** `booking_id`, `vehicle_number`, `vehicle_name`, `platform_name`, `created_at`, `net_revenue`, `status`, `id`

### 7.2 Expenses

**`GET /api/expenses`**

```json
[
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
]
```

**Fields used by frontend:** `invoice_number`, `vehicle_number`, `category_name`, `amount`, `vendor`, `payment_mode_name`, `status`, `id`

### 7.3 Journal Ledger

**`GET /api/journal`**

```json
[
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
]
```

### 7.4 Outstandings

**`GET /api/outstandings`**

```json
[
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
]
```

**Computed field (frontend):** `balance = amount - paid_amount`

### 7.5 Settlements

**`GET /api/settlements`**

```json
[
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
]
```

### 7.6 Maintenance

**`GET /api/maintenance`**

```json
[
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
]
```

### 7.7 Service Schedules

**`GET /api/service-schedules`**

```json
[
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
]
```

### 7.8 Dashboard (Complex Object)

**`GET /api/dashboard`** — Returns a single composite object:

```json
{
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
      "yearly_growth": 45.0
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
```

### 7.9 Analytics

**`GET /api/analytics`**

```json
{
  "revenue": [ { "month": "Jan", "total": 1800000 } ],
  "expenses": [ { "month": "Jan", "total": 900000 } ],
  "profit": [ { "month": "Jan", "total": 700000 } ],
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
```

### 7.10 Fleet Dashboard

**`GET /api/fleet-dashboard`**

```json
{
  "fleet_health": { /* same structure as dashboard.fleet_health */ },
  "vehicles": [
    {
      "id": "v1",
      "vehicle_number": "MH-01-AB-1234",
      "brand": "Toyota",
      "model": "Innova Crysta",
      "fuel_type": "Diesel",
      "status": "active",
      "health_score": 85,
      "total_revenue_ytd": 1200000,
      "total_expense_ytd": 450000,
      "profit_ytd": 750000,
      "year": 2024,
      "transmission": "Manual",
      "owner_name": "Rajesh Sharma",
      "owner_type": "individual",
      "is_active": true,
      "last_service": "2026-05-15T00:00:00.000Z",
      "next_service": "2026-08-15T00:00:00.000Z",
      "documents": {
        "insurance_valid": true,
        "pollution_valid": true,
        "fitness_valid": true,
        "permit_valid": true
      }
    }
  ],
  "upcoming_services": [ /* same as service-schedules */ ],
  "alerts": [
    { "type": "warning", "message": "Insurance expiring for 2 vehicles this month", "vehicle": "" }
  ]
}
```

### 7.11 Settlement Dashboard

**`GET /api/settlement-dashboard`**

```json
{
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
```

### 7.12 Master Data

**`GET /api/master-data`**

```json
{
  "expense_categories": [ { "id": "c1", "name": "Fuel", "type": "expense_category", "is_active": true } ],
  "platforms": [ { "id": "p1", "name": "Uber", "type": "platform", "is_active": true } ],
  "payment_modes": [ { "id": "pm1", "name": "Cash", "type": "payment_mode", "is_active": true } ],
  "fuel_types": [ { "id": "ft1", "name": "Petrol", "type": "fuel_type", "is_active": true } ],
  "owner_types": [ { "id": "ot1", "name": "Individual", "type": "owner_type", "is_active": true } ],
  "vehicle_statuses": [ { "id": "vs1", "name": "Active", "type": "vehicle_status", "is_active": true } ],
  "journal_categories": [ { "id": "jc1", "name": "Booking Revenue", "type": "journal_category", "is_active": true } ],
  "outstanding_categories": [ { "id": "oc1", "name": "Platform Outstanding", "type": "outstanding_category", "is_active": true } ],
  "outstanding_priorities": [ { "id": "op1", "name": "Critical", "type": "outstanding_priority", "is_active": true } ],
  "platform_categories": [ { "id": "pc1", "name": "Aggregator", "type": "platform_category", "is_active": true } ],
  "transmission_types": [ { "id": "tt1", "name": "Manual", "type": "transmission_type", "is_active": true } ],
  "accounts": [ { "id": "a1", "name": "HDFC Bank - Current", "type": "account", "is_active": true } ]
}
```

### 7.13 Settings

**`GET /api/settings`**

```json
{
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
```

### 7.14 Vendors

**`GET /api/vendors`**

```json
[
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
]
```

### 7.15 Vehicle Owners

**`GET /api/vehicle-owners`**

```json
[
  {
    "id": "vo1",
    "name": "Rajesh Sharma",
    "phone": "+91-98765-43210",
    "email": "rajesh.sharma@example.com",
    "owner_type": "individual",
    "pan_number": "ABCDE1234F",
    "aadhar_number": "1234-5678-9012",
    "gst_number": null,
    "total_vehicles": 3,
    "is_active": true,
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-07-07T22:00:00.000Z"
  }
]
```

### 7.16 Status Value Constraints

The frontend maps status strings to color-coded badges. Use these exact status values:

| Endpoint | Valid Statuses |
|----------|----------------|
| `/api/bookings` | `active`, `completed`, `cancelled`, `refunded`, `no_show` |
| `/api/expenses` | `approved`, `pending`, `rejected`, `flagged` |
| `/api/journal` | `collected`, `pending`, `overdue`, `waived` |
| `/api/outstandings` | `pending`, `overdue`, `paid`, `partially_paid` |
| `/api/settlements` | `pending`, `completed`, `in_progress`, `disputed`, `cancelled` |
| `/api/maintenance` | `completed`, `in_progress`, `scheduled`, `cancelled` |
| `/api/service-schedules` | `scheduled`, `overdue`, `completed` |
| Priority | `high`, `medium`, `low`, `critical` |

---

## 8. Authentication Flow

### 8.1 Current Mock Flow

**Login page:** `html/login.html`

- **Username field** — pre-filled with "guest"
- **Password field** — pre-filled with "demo123"
- **"Continue as Guest" button** — calls `handleGuestLogin()` (inline script)
- **Form submit** — currently submits to `login.html` (no server action)

```javascript
function handleGuestLogin() {
  window.location.href = 'dashboard.html';
}
```

The mock user is hardcoded in `data.js`:

```javascript
const DEMO_USER = {
  id: 'guest-001',
  username: 'guest',
  email: 'guest@demo.com',
  first_name: 'Demo',
  last_name: 'User',
  role: 'super_admin',
  is_active: true,
  is_first_login: false,
};
```

### 8.2 Integration Path

1. **Replace `handleGuestLogin()`** with a real API call:

```javascript
async function handleLogin(username, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    showToast('Login failed', 'error');
    return;
  }
  const data = await res.json();
  localStorage.setItem('auth-token', data.token);
  window.location.href = 'dashboard.html';
}
```

2. **Add an auth header helper** to `data.js`:

```javascript
function authHeaders() {
  const token = localStorage.getItem('auth-token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}
```

3. **Add session validation** — check token on every page load. If missing or expired, redirect to login.

### 8.3 Session Storage

All session state is stored in `localStorage`:

| Key | Purpose |
|-----|---------|
| `sidebar-collapsed` | `true`/`false` — persisted sidebar state |
| `auth-token` | *(you implement)* — JWT or session token |

### 8.4 Sign Out

Every page has a user menu dropdown with a "Sign Out" button:

```html
<button class="dropdown-item" onclick="showToast('Signed out', 'info')">
  Sign Out
</button>
```

**Replace** the `onclick` with:
```javascript
function signOut() {
  localStorage.removeItem('auth-token');
  window.location.href = 'login.html';
}
```

---

## 9. Dashboard Data Requirements

### 9.1 KPI Elements

The dashboard (`html/dashboard.html`) reads these element IDs populated by `app.js`:

| Element ID | Data Source | Format |
|-----------|-------------|--------|
| `kpi-today-revenue` | `kpis.todays_revenue` | Currency (₹) |
| `kpi-weekly-revenue` | `kpis.weekly_revenue` | Currency (₹) |
| `kpi-monthly-profit` | `kpis.monthly_profit` | Currency (₹) |
| `kpi-cash-flow` | `kpis.cash_flow` | Currency (₹) |
| `kpi-active-vehicles` | `kpis.active_vehicles + "/" + kpis.total_vehicles` | String |
| `kpi-utilization` | `kpis.utilization_rate + "%"` | Percentage |
| `kpi-outstanding` | `kpis.outstanding_collections` | Currency (₹) |
| `kpi-net-margin` | `kpis.net_margin + "%"` | Percentage |
| `fh-score` | `fleet_health.health_score + "%"` | Percentage |
| `fh-insurance` | `fleet_health.insurance_due` | Number |
| `fh-maintenance` | `fleet_health.maintenance_due` | Number |
| `fh-permit` | `fleet_health.permit_due` | Number |

### 9.2 Dashboard Alert Elements

| Element ID | Logic |
|-----------|-------|
| `alerts-list` | Renders alert items for vehicles without bookings, pending journal entries, pending expenses, high-expense vehicles |
| `health-score-bar` | Width set to `fleet_health.health_score` percentage |

### 9.3 Top Vehicles Table

| Element ID | Display |
|-----------|---------|
| `top-vehicles-body` | Table body — top 5 vehicles sorted by `total_revenue` descending |

---

## 10. Charts Data Requirements

Charts are rendered via Canvas 2D API in `app.js`. No external charting library is used.

### 10.1 Bar Charts

**`renderBarChart(canvasId, data, options)`**

| Parameter | Type | Description |
|-----------|------|-------------|
| `canvasId` | String | DOM element ID of the canvas |
| `data` | Array | `[{ label: string, value: number }]` |
| `options.colors` | Array | Optional hex color array |

**Canvas IDs and their data sources:**

| Page | Canvas ID | Data Source | Data Mapping |
|------|-----------|-------------|--------------|
| dashboard | `chart-revenue` | `dashboard.trends.revenue` | `{ label: d.month, value: d.total }` |
| dashboard | `chart-expense` | `dashboard.trends.expense` | `{ label: d.month, value: d.total }` |
| settlements | `chart-settlement-trend` | `settlementDashboard.monthly_trend` | `{ label: d.month, value: d.settled }` |
| analytics | `chart-analytics-revenue` | `analytics.revenue` | `{ label: d.month, value: d.total }` |
| analytics | `chart-analytics-expenses` | `analytics.expenses` | `{ label: d.month, value: d.total }` |
| analytics | `chart-analytics-utilization` | `analytics.utilization` | `{ label: d.month, value: d.rate }` |

### 10.2 Pie/Donut Charts

**`renderPieChart(canvasId, data)`**

| Parameter | Type | Description |
|-----------|------|-------------|
| `canvasId` | String | DOM element ID |
| `data` | Array | `[{ label: string, value: number }]` — value determines slice proportion |

**Canvas IDs:**

| Page | Canvas ID | Data Source |
|------|-----------|-------------|
| dashboard | `chart-platform-pie` | `dashboard.breakdowns.revenue_by_platform` |
| dashboard | `chart-expense-pie` | `dashboard.breakdowns.expense_by_category` |
| analytics | `chart-analytics-platform` | `analytics.top_platforms` |
| analytics | `chart-analytics-cost` | `analytics.cost_breakdown` |

### 10.3 Chart Legend Elements

| Page | Legend ID | Source |
|------|-----------|--------|
| dashboard | `chart-legend-platform` | `breakdowns.revenue_by_platform` (top 5) |
| dashboard | `chart-legend-expense` | `breakdowns.expense_by_category` (top 5) |

---

## 11. Table Data Requirements

### 11.1 Table Initialization

All data tables use the shared `initTable(tableId, options)` function in `app.js`:

```javascript
initTable(tableId, {
  data: array,          // Array of row objects
  columns: array,       // Column definitions (see below)
  pageSize: number,     // Rows per page (default: 10)
  emptyMessage: string, // Shown when no data
});
```

### 11.2 Column Definition

Each column is an object:

```javascript
{ key: 'field_name', render: function(row) { return '...', width: '80px' } }
```

- `key` (string): The property name on the row object
- `render` (function, optional): Custom render function returning HTML. If omitted, raw value is displayed.
- `width` (string, optional): CSS width for the column

### 11.3 Table Registry

| Page | Table ID | Page Size | Column Keys |
|------|----------|-----------|-------------|
| bookings | `bookings-table` | 10 | booking_id, vehicle_number, platform_name, created_at, net_revenue, status, actions |
| journal-ledger | `journal-table` | 10 | id, vehicle_number, category_name, amount_collected, total_amount, platform_name, status, actions |
| expenses | `expenses-table` | 10 | invoice_number, vehicle_number, category_name, amount, vendor, payment_mode_name, status, actions |
| settlements | `settlements-table` | 10 | settlement_id, vehicle_number, platform_name, total_amount, net_amount, status, settlement_date |
| outstandings | `outstandings-table` | 10 | vehicle_number, platform_name, amount, paid_amount, balance, status, priority, due_date |
| fleet-dashboard | `fleet-vehicles-table` | 10 | vehicle_number, brand, model, fuel_type, status, health_score, total_revenue_ytd, total_expense_ytd |
| maintenance | `maintenance-table` | 10 | vehicle_number, service_type, vendor_name, cost, odometer_km, status, scheduled_date |
| service-schedules | `schedules-table` | 10 | vehicle_number, service_type, status, odometer_km, estimated_cost, assigned_to, scheduled_date |
| reports | `reports-table` | 10 | type, period, status, total_rows, generated_at, actions |
| all master data | `masters-table` | 10 | id, name, status |

### 11.4 Inline Script Tables

9 pages run their own table rendering (not via `initTable`):

| Page | Table Body ID | Render Function |
|------|---------------|-----------------|
| customers | `customersTableBody` | `renderCustomers()` |
| vendors | *(inline)* | `renderVendors()` |
| drivers | *(inline)* | `renderDrivers()` |
| vehicles | *(inline)* | `renderVehicles()` |
| vehicle-owners | *(inline)* | `renderVehicleOwners()` |
| vehicle-status | *(inline)* | `renderVehicleStatuses()` |
| ownership-types | *(inline)* | `renderOwnershipTypes()` |
| transmission-types | *(inline)* | `renderTransmissionTypes()` |
| outstanding-categories | *(inline)* | `renderOutstandingCategories()` |

### 11.5 Table Features

All `initTable`-based tables support:
- **Search**: Input with `data-table-search="{tableId}"`
- **Status filter**: Select with `data-table-filter="{tableId}"`
- **Sorting**: Click on `<th class="sortable" data-sort-key="key">`
- **Pagination**: Element with `data-table-pagination="{tableId}"`

---

## 12. Forms

### 12.1 Form Locations

Forms exist in two patterns:

**Pattern A — Inline Drawer Forms (9 pages with inline scripts):**
- Customers, vendors, drivers, vehicles, vehicle-owners, vehicle-status, ownership-types, transmission-types, outstanding-categories
- Forms are constructed dynamically via JavaScript string concatenation in `open*Drawer()` functions
- Form fields include name, email, phone, status, etc.

**Pattern B — Booking Drawer Form (app.js `initBookingForm`):**
- Defined in `app.js` (lines 673–681)
- Listens to `submit` event on `#booking-form`
- Currently shows a toast on submit — needs to be wired to POST

**Pattern C — Login Form (login.html):**
- Standard username/password form
- Guest login bypass via button click

### 12.2 Form Submission Pattern (Inline Pages)

Each inline CRUD page follows this pattern:

```javascript
function saveCustomer(e) {
  e.preventDefault();
  var form = document.getElementById('customerForm');
  var fd = new FormData(form);
  var editId = fd.get('edit_id');

  if (editId) {
    // UPDATE: find and modify in-place
    showToast('Customer updated', 'success');
  } else {
    // CREATE: push new object to array
    showToast('Customer created', 'success');
  }
  closeAllDrawers();
  filterCustomers();
}
```

**Replace the body of each `save*()` function with an API call:**

```javascript
async function saveCustomer(e) {
  e.preventDefault();
  var form = document.getElementById('customerForm');
  var fd = new FormData(form);
  var editId = fd.get('edit_id');
  var payload = Object.fromEntries(fd.entries());

  try {
    if (editId) {
      await fetch('/api/customers/' + editId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      showToast('Customer updated', 'success');
    } else {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      showToast('Customer created', 'success');
    }
    closeAllDrawers();
    await loadCustomers();
  } catch (err) {
    showToast('Error saving customer', 'error');
  }
}
```

### 12.3 No Form Validation Library

All form validation is browser-native (`required` attribute) or manual in inline scripts. There is no client-side validation library.

---

## 13. Upload Components

**There are no file upload components in this frontend.**

The `assets/`, `fonts/`, `icons/`, and `images/` directories exist as empty placeholders for future use. No page includes an `<input type="file">` or drag-and-drop zone.

If file upload is needed (e.g., invoice attachments, profile photos), it must be implemented from scratch.

---

## 14. Notifications

### 14.1 Notification Display

The notifications page (`html/notifications.html`) is populated by `app.js`:

```javascript
if (page === 'notifications') {
  var nData = DATA.getNotifications();
  // Renders each notification with icon, title, description, timestamp, read state
}
```

**Expected API `GET /api/notifications`:**

```json
[
  {
    "id": "n1",
    "title": "Insurance Expiring Soon",
    "description": "MH-01-AB-1234 insurance expires in 7 days",
    "type": "warning",
    "is_read": false,
    "created_at": "2026-07-01T10:00:00.000Z"
  }
]
```

**Type values and their icon colors:**
| Type | Icon Color |
|------|-----------|
| `info` | #183eeb (blue) |
| `warning` | #f59e0b (amber) |
| `success` | #22c55e (green) |
| `error` | #ef4444 (red) |

`is_read: true` sets the notification's opacity to 0.6.

### 14.2 Toast Notifications

The `showToast()` function (in `app.js`) is called from various actions:

```javascript
showToast('Customer saved', 'success');
showToast('Failed to load data', 'error');
showToast('Processing...', 'info');
showToast('Item deleted', 'warning');
```

These currently render on-screen for 4 seconds then auto-dismiss. The toast container is always present:

```html
<div id="toast-container"></div>
```

### 14.3 Header Notification Badge

Every page has a notifications dropdown button in the header:

```html
<button class="dropdown-toggle" data-dropdown="notifications">
  <span class="w-2 h-2 bg-red-500 rounded-full"></span>  <!-- unread indicator -->
</button>
```

The red dot is a static indicator. To make it dynamic, you would query `GET /api/notifications/unread-count` and set visibility based on the response.

---

## 15. Error Handling

### 15.1 Current Error Handling

The frontend has minimal error handling. Most data access assumes success:

- **No try/catch** around data getter calls in `app.js`
- **No loading states** — data is expected to be available synchronously
- **No error UI** for API failures — the table will simply be empty
- **Toast errors** are triggered only by explicit action failures (e.g., delete confirmation)

```javascript
// Current pattern — assumes success
var data = DATA.getBookings();
initTable('bookings-table', { data: data, ... });

// Should become:
try {
  var data = await DATA.getBookings();
  initTable('bookings-table', { data: data, ... });
} catch (err) {
  showToast('Failed to load bookings', 'error');
  initTable('bookings-table', { data: [], ... });
}
```

### 15.2 Recommended Error Handling Additions

When connecting a backend, add these patterns:

**Loading state:**
```html
<tr id="loading-row"><td colspan="5">Loading...</td></tr>
```

**Error state:**
```html
<tr><td colspan="5" class="table-error">
  <div class="text-red-400">Failed to load. <button onclick="retry()">Retry</button></div>
</td></tr>
```

**Global error handler:**
```javascript
window.addEventListener('unhandledrejection', function(e) {
  showToast('Something went wrong. Please try again.', 'error');
});
```

### 15.3 API Error Response Format

Standardize your error responses for the frontend to consume:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid booking ID",
    "details": { "field": "booking_id", "reason": "required" }
  }
}
```

---

## 16. Recommended Integration Sequence

### Phase 1: Foundation (Auth + Data Layer)

**Step 1 — Authentication**
- Replace `handleGuestLogin()` with real login API call
- Add token storage (localStorage)
- Add auth header helper to `data.js`
- Add sign-out logic
- Add token validation / redirect on page load

**Step 2 — Replace data.js (core entities)**
Start with the most-used endpoints:

```
1. GET /api/dashboard           → DATA.getDashboard()
2. GET /api/bookings            → DATA.getBookings()
3. GET /api/expenses            → DATA.getExpenses()
4. GET /api/settings            → DATA.getSettings()
5. GET /api/master-data         → DATA.getMasterData()
```

**Step 3 — Add error handling wrappers**
Wrap all data getters in try/catch. Add loading indicators.

### Phase 2: All List Pages

**Step 4 — Remaining table pages**

```
GET /api/journal              → DATA.getJournal()
GET /api/outstandings         → DATA.getOutstandings()
GET /api/settlements          → DATA.getSettlements()
GET /api/maintenance          → DATA.getMaintenance()
GET /api/service-schedules    → DATA.getSchedules()
GET /api/reports              → DATA.getReports()
GET /api/notifications        → DATA.getNotifications()
GET /api/tasks                → DATA.getTasks()
```

**Step 5 — Dashboard aggregates**

```
GET /api/settlement-dashboard → DATA.getSettlementDashboard()
GET /api/analytics            → DATA.getAnalytics()
GET /api/fleet-dashboard      → DATA.getFleetDashboard()
```

### Phase 3: CRUD Pages

**Step 6 — Master data CRUD (inline script pages)**
Replace per-page:
- customers (inline) → `GET/POST/PUT/DELETE /api/customers`
- vendors (inline + DATA) → `GET/POST/PUT/DELETE /api/vendors`
- drivers (inline) → `GET/POST/PUT/DELETE /api/drivers`
- vehicles (inline + DATA) → `GET/POST/PUT/DELETE /api/vehicles`
- vehicle-owners (inline + DATA) → `GET/POST/PUT/DELETE /api/vehicle-owners`
- vehicle-status (inline) → `GET/POST/PUT/DELETE /api/vehicle-statuses`
- ownership-types (inline) → `GET/POST/PUT/DELETE /api/owner-types`
- transmission-types (inline) → `GET/POST/PUT/DELETE /api/transmission-types`
- outstanding-categories (inline) → `GET/POST/PUT/DELETE /api/outstanding-categories`

### Phase 4: Polish

**Step 7 — Wire up form submissions**
- Booking drawer form (`initBookingForm` in app.js)
- All inline drawer forms (New/Edit/Delete)

**Step 8 — Notification badge**
- Add unread count API call
- Add polling for real-time updates (optional)

**Step 9 — Remove mock data**
- Delete the generator functions from `data.js`
- Remove the `cached()` wrapper
- Keep only the `DATA` object as the API proxy

---

## Key Technical Notes

1. **No async/await currently** — `app.js` runs synchronously. When replacing `DATA.get*()` with async calls, wrap page init in async IIFE or use `.then()`.

2. **Script load order matters** — `data.js` must load before `app.js`. `app.js` expects `window.DATA` and `window.DEMO_USER` to exist.

3. **No build step** — The frontend is pure HTML/CSS/JS. Serve it as static files. No webpack, no bundler, no npm install needed.

4. **No router** — Each HTML file is its own page. Navigation uses `<a href="...">` links. There is no client-side routing.

5. **CSS custom properties** — All brand colors and spacing tokens are in `brand.css`. Change them to rebrand the entire frontend.

6. **localStorage** is used for sidebar state persistence. Extend for auth token storage.

7. **Charts are Canvas 2D** — No charting library dependency. The bar and pie chart renderers are in `app.js` (lines 428–515).

8. **All monetary values** — The `formatCurrency()` function in `app.js` adds ₹ prefix and Indian number formatting (lakhs/crores). Store amounts as plain numbers in your API.
