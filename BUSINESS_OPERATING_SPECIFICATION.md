# Business Operating Specification — Fleet Financial ERP

> Version 1.0  
> Phase 6A — Business Rules Freeze  
> **This document is the single source of truth for all business logic.**

---

## Executive Summary

The Fleet Financial ERP is a production-grade platform for managing fleet operations, financial transactions, maintenance, compliance, and analytics. It serves fleet owners, operators, accountants, and administrators with role-based access to vehicle lifecycle management, booking revenue tracking, expense control, outstanding liability management, journal/ledger collections, and configurable master data.

**Core mission**: Provide end-to-end financial visibility and operational control for fleets of owned, leased, and rental vehicles operating across multiple booking platforms.

**Business constraints**: Indian market (INR currency, en-IN locale), dark-theme UI, RBAC with 5 roles, soft-delete on all entities, and a centralized Financial Engine for all monetary calculations.

---

## Part 1 — Business Domain Identification

### D1. Fleet & Vehicle Domain
**Responsibility**: Manage the vehicle lifecycle from purchase to deactivation. Track all vehicle specifications, documents, compliance dates, and operational status.

| Sub-domain | Description |
|---|---|
| Vehicle Master | Vehicle identity, specs (brand, model, year, fuel, transmission), ownership type (owned/leased/rental), status |
| Document Tracking | Insurance, permit, road tax, pollution, fitness, RC expiry dates with status (valid/expiring_soon/expired/not_set) |
| Fleet Health | Aggregate health score, maintenance due counts, document expiry summaries |
| Service Scheduling | Planned maintenance intervals (km/days), auto-computation of next service dates |
| Vehicle Timeline | Chronological events (purchase, maintenance, platform changes) with metadata |

### D2. Ownership Domain
**Responsibility**: Define vehicle ownership models and financial relationships.

| Sub-domain | Description |
|---|---|
| Owned Fleet | Company-owned vehicles — full revenue/expense responsibility |
| Leased Vehicles | Leased from third party — lease payment tracked as expense |
| Rental Vehicles | Rented vehicles — rental cost tracked as expense |
| Client Co-Hosted | Client-owned vehicles on platform — revenue sharing/commission model |

### D3. Platform Management Domain
**Responsibility**: Manage booking platforms (Uber, Ola, Rapido, etc.) and vehicle-platform assignments.

| Sub-domain | Description |
|---|---|
| Platform Master | Platform definitions (name, code, commission model, payment cycle) |
| Vehicle Assignment | Assign vehicles to platforms, track assignment history, auto-end previous |
| Platform Analytics | Revenue, commission, bookings, outstanding by platform |

### D4. Booking Domain
**Responsibility**: Track all trip/booking revenue from platforms. Core revenue entry point.

| Sub-domain | Description |
|---|---|
| Booking Records | Trip details, fare breakdown, platform commission, net revenue |
| Payment Tracking | Payment status (pending/partial/paid/refunded) |
| Revenue Calculation | Net revenue = gross fare + doorstep charges - platform commission |
| Booking Metrics | Today's/monthly revenue, revenue by platform/vehicle |

### D5. Revenue Domain
**Responsibility**: Financial Engine — all revenue calculations, trends, and analytics.

| Sub-domain | Description |
|---|---|
| Revenue Calculation | Pure math functions for net revenue, commission, refunds |
| Revenue Aggregation | Daily/weekly/monthly/yearly totals, trends, growth rates |
| Platform Performance | Per-platform revenue, commission, booking metrics |
| Vehicle Revenue | Per-vehicle revenue calculation and ranking |

### D6. Expense Domain
**Responsibility**: Track all operational expenses with approval workflow.

| Sub-domain | Description |
|---|---|
| Expense Records | Expense details (category, amount, vendor, invoice, payment mode) |
| Expense Approval | Status workflow: pending → approved/rejected → reimbursed |
| Expense Analytics | By category, vehicle, payment mode, large expense alerts |

### D7. Journal/Ledger Domain
**Responsibility**: Track daily collections and ledger entries for vehicle financial settlements.

| Sub-domain | Description |
|---|---|
| Journal Entries | Collection records (amount collected vs total amount, ledger category) |
| Collection Metrics | Today's/monthly collections, by category, by vehicle |
| Journal Status | Pending/completed/cancelled tracking |
| Cash Flow | Inflow from completed collections vs outflow from approved expenses |

### D8. Outstanding Domain
**Responsibility**: Track upcoming and overdue liabilities (insurance, EMI, driver salary, vendor payments, taxes).

| Sub-domain | Description |
|---|---|
| Outstanding Records | Liability tracking (category, amount, due date, priority, status) |
| Payment Processing | Mark as paid — auto-converts to expense with payment details |
| Payment Planner | Aggregate view of upcoming/overdue liabilities |
| Cash Forecasting | Cash requirement projections (7/30 days, month, quarter, year) |

### D9. Maintenance Domain
**Responsibility**: Track vehicle maintenance records, parts, and vendor history.

| Sub-domain | Description |
|---|---|
| Maintenance Records | Service history (type, date, odometer, cost, vendor, warranty) |
| Parts Tracking | Parts used in maintenance (name, brand, quantity, price, warranty) |
| Fleet Health | Aggregate health score, maintenance cost analysis |
| Vendor Performance | Maintenance vendor tracking with ratings |

### D10. Vendor Domain
**Responsibility**: Manage external vendors (garages, mechanics, parts suppliers, insurance, finance).

| Sub-domain | Description |
|---|---|
| Vendor Master | Vendor details (type, contact, location, rating, services) |
| Vendor Types | Configurable categories (garage, mechanic, parts_supplier, etc.) |
| Vendor Analytics | Performance tracking, maintenance cost by vendor |

### D11. Settlement Domain
**Responsibility**: Financial settlement between fleet, platforms, drivers, and vehicle owners.

| Sub-domain | Description |
|---|---|
| Revenue Collection | Journal entries tracking collected vs owed amounts |
| Commission Settlement | Platform commission tracking and settlement |
| Outstanding Settlement | Liability payment processing via expense conversion |
| Profit Distribution | Owner/company profit allocation (future) |

### D12. Document & Compliance Domain
**Responsibility**: Track vehicle document expiry and regulatory compliance.

| Sub-domain | Description |
|---|---|
| Document Expiry | 6 document types (insurance, permit, road tax, pollution, fitness, RC) |
| Expiry Alerts | Automated notifications before expiry (configurable days) |
| Compliance Status | Real-time document validity per vehicle |

### D13. Notification Domain
**Responsibility**: In-app notifications for alerts, reminders, and system events.

| Sub-domain | Description |
|---|---|
| In-App Notifications | System/success/warning/error/info notification types |
| Reminders | 12 reminder types (insurance, service, tax, documents, etc.) |
| Notification Preferences | Per-user notification settings (in-app, email, summaries) |
| Automated Processing | Due reminder processing → notification generation |

### D14. Reporting & Analytics Domain
**Responsibility**: Generate financial and operational reports with export capabilities.

| Sub-domain | Description |
|---|---|
| Financial Reports | 33 report types (daily/weekly/monthly/yearly financial, vehicle/platform reports) |
| Analytics | Revenue/expense/profit analytics, fleet performance, platform comparison |
| Report Export | CSV and Excel export with summary and charts |
| Report Templates | Save/load/share report configurations |
| Report History | Track generated reports |

### D15. Master Data Domain
**Responsibility**: Configurable lookup values for all dropdown and categorization needs.

| Sub-domain | Description |
|---|---|
| Master Types | Category definitions (expense_category, payment_mode, platform, etc.) |
| Master Values | Configurable values with code, name, color, icon, display order |
| System Values | Protected values that cannot be deleted |

### D16. User & Role Domain
**Responsibility**: User management with role-based access control.

| Sub-domain | Description |
|---|---|
| User Management | CRUD users with role assignment |
| RBAC | 5 roles with granular permissions per endpoint |
| Authentication | JWT-based login, password policies, first-login enforcement |
| Audit Trail | All CUD operations logged with user, IP, and changes |

### D17. Settings Domain
**Responsibility**: Global application configuration across 6 setting groups.

| Sub-domain | Description |
|---|---|
| Company Profile | Company identity, currency, timezone, financial year |
| Dashboard Settings | Default dashboard, date range, widget visibility, layout |
| Financial Settings | Currency, tax percentage, document prefixes |
| Notification Settings | Global notification toggles, summary frequencies |
| User Preferences | Theme, sidebar, language, table density, page size |
| Security Settings | Password policy, session timeout, 2FA, login attempts |

---

## Part 2 — Complete Business Workflows

### W1. Vehicle Purchase Workflow
**Start**: New vehicle acquired
1. Enter vehicle master data (number, name, brand, model, year, specs)
2. Set ownership type (owned/leased/rental)
3. Enter purchase date, purchase price, initial odometer
4. Enter initial document expiry dates (insurance, permit, road tax, etc.)
5. Set service interval parameters (km and/or days)
6. Vehicle status defaults to AVAILABLE
7. **Decision**: Assign to platform? → Yes → W3. Platform Assignment
8. **Complete**: Vehicle is active in fleet

**Exceptions**: Duplicate vehicle_number rejected; fleet_code optional; soft-delete and restore supported.

### W2. Vehicle Registration & Documentation
**Start**: Vehicle acquired (pre or post purchase)
1. Enter chassis number, engine number
2. Register for fleet code
3. Upload vehicle photo (optional)
4. Enter all regulatory document expiry dates
5. **Decision**: Documents valid? → Yes → Active. No → Set reminders
6. **Complete**: Vehicle ready for platform assignment

### W3. Platform Assignment Workflow
**Start**: Vehicle available for platform
1. Select vehicle, select platform, select category (optional)
2. Enter start date
3. System auto-ends any previous active assignment for the vehicle
4. Vehicle.active_platform_id updated
5. Timeline event created
6. **Complete**: Vehicle assigned to platform
7. **Reverse**: End assignment → set end_date, clear active_platform_id

**Rules**: One active assignment per vehicle at any time; assignment history preserved.

### W4. Booking Lifecycle Workflow
**Start**: Trip completed on platform
1. Enter booking data (vehicle, platform, booking_id, date/time, trip times)
2. Enter financial breakdown:
   - Gross fare, doorstep charges, platform commission
   - Optional: discount, taxes, refund
3. System calculates net revenue = gross_fare + doorstep_charges - platform_commission
4. Set booking status (→ PENDING or CONFIRMED)
5. Set payment status (→ PENDING)
6. **Decision Point**: Booking status transitions
   - PENDING → CONFIRMED (trip accepted)
   - CONFIRMED → COMPLETED (trip finished)
   - COMPLETED → CANCELLED | REFUNDED (post-completion issues)
7. **Complete**: Booking finalized

**Exceptions**: CANCELLED/REFUNDED bookings excluded from revenue totals; soft-delete supported.

### W5. Revenue Collection Workflow (Journal)
**Start**: Payment received from platform or customer
1. Create journal entry for a vehicle
2. Enter collection date, amount collected, total amount due
3. Select ledger category (collection type)
4. Optional: reference number, description
5. Status defaults to PENDING
6. **Decision Point**: Amount collected = total amount? → Mark as COMPLETED
7. **Complete**: Cash inflow recorded

**Exceptions**: Partial collections tracked via amount_collected < total_amount; shortfall tracked as outstanding.

### W6. Expense Processing Workflow
**Start**: Expense incurred
1. Create expense record
2. Enter category, payment mode, amount, date
3. Optional: link to vehicle, vendor, invoice number
4. Status defaults to PENDING
5. **Approval Gate**: PENDING → APPROVED or REJECTED
6. **Decision Point**: If REJECTED → end. If APPROVED → track for reimbursement
7. APPROVED → REIMBURSED (payment made)
8. **Complete**: Expense finalized

**Exceptions**: If linked from outstanding mark-as-paid, status is APPROVED directly; soft-delete supported.

### W7. Outstanding Liability Workflow
**Start**: Liability identified (insurance due, EMI, salary, vendor payment)
1. Create outstanding record
2. Enter title, category, amount, due date
3. Optional: link to vehicle, platform, vendor
4. Set priority (low/normal/high/urgent)
5. System auto-computes status based on due_date:
   - Future → upcoming
   - Today → due_today
   - Past → overdue
6. **Decision Point**: Pay now or track?
   - Track → Monitor until due
   - Pay now → Mark as paid
7. **Mark as Paid**:
   - Select payment mode, expense category
   - System auto-creates an APPROVED expense
   - Outstanding status → paid or partially_paid
   - Paid amount, paid_at recorded
8. **Complete**: Liability settled

**Exceptions**: Cannot edit paid outstandings; partial payment supported; soft-delete supported.

### W8. Maintenance Workflow
**Start**: Vehicle needs service
1. Create maintenance record
2. Select vehicle, maintenance type, service date, odometer reading
3. Optional: vendor, description, cost, warranty, invoice
4. Add parts used (part name, brand, quantity, unit price)
5. Status defaults to 'completed'
6. System updates vehicle odometer
7. System auto-sets vehicle to AVAILABLE (if it was in MAINTENANCE)
8. Timeline event created
9. **Complete**: Maintenance recorded

**Scheduled variant**:
- Service schedule triggers reminder → maintenance performed → record created → schedule updated (next_service_km/date)

### W9. Vehicle Exit Workflow
**Start**: Vehicle leaving fleet
1. Ensure no active platform assignments (end them)
2. Ensure no open bookings
3. Soft-delete the vehicle
4. Vehicle marked as INACTIVE
5. **Complete**: Vehicle removed from active operations

**Restore**: Soft-deleted vehicles can be restored with all history intact.

### W10. Document Expiry & Renewal Workflow
**Start**: Document approaching expiry (triggered by reminder or manual check)
1. Reminder fires (X days before expiry)
2. Notification generated
3. User renews document
4. Update vehicle document expiry date
5. **Complete**: Document renewed, reminder auto-dismissed on next processing cycle

### W11. Settlement Workflow (Future)
**Start**: Settlement period ends
1. Calculate total revenue for period
2. Calculate total commissions/fees
3. Apply ownership model (owned = full, co-hosted = split)
4. Generate settlement amount
5. Process payment
6. Record settlement
7. **Complete**: Financial period closed

### W12. Report Generation Workflow
**Start**: User requests report
1. Select report type (33 types available)
2. Configure filters (date range, vehicle, platform, category, etc.)
3. System generates report with summary, columns, rows, optional charts
4. **Decision**: Export? → CSV or Excel format
5. Save as template? → Name and save for reuse
6. Report history recorded
7. **Complete**: Report displayed/exported

---

## Part 3 — State Machines

### SM1. Vehicle State Machine
| Status | Description | Allowed Transitions | Terminal? |
|--------|-------------|-------------------|-----------|
| AVAILABLE | Vehicle ready for platform/booking | → BOOKED, → MAINTENANCE, → INACTIVE | No |
| BOOKED | Vehicle on active trip | → AVAILABLE, → MAINTENANCE | No |
| MAINTENANCE | Vehicle undergoing service | → AVAILABLE | No |
| INACTIVE | Vehicle decommissioned | → AVAILABLE | Yes |

**Invalid transitions**: BOOKED → INACTIVE (must end booking first); INACTIVE → MAINTENANCE; MAINTENANCE → BOOKED.

### SM2. Booking State Machine
| Status | Description | Allowed Transitions | Terminal? |
|--------|-------------|-------------------|-----------|
| PENDING | Booking created, not confirmed | → CONFIRMED, → CANCELLED | No |
| CONFIRMED | Trip accepted/in progress | → COMPLETED, → CANCELLED | No |
| COMPLETED | Trip finished | → CANCELLED, → REFUNDED | Yes |
| CANCELLED | Booking cancelled | None | Yes |
| REFUNDED | Booking refunded | None | Yes |

**Invalid transitions**: PENDING → COMPLETED (must confirm first); CANCELLED → any; REFUNDED → any.

### SM3. Payment State Machine
| Status | Description | Allowed Transitions | Terminal? |
|--------|-------------|-------------------|-----------|
| PENDING | Payment not yet received | → PARTIALLY_PAID, → PAID, → REFUNDED | No |
| PARTIALLY_PAID | Partial amount received | → PAID, → REFUNDED | No |
| PAID | Full payment received | None | Yes |
| REFUNDED | Amount refunded | None | Yes |

### SM4. Expense State Machine
| Status | Description | Allowed Transitions | Terminal? |
|--------|-------------|-------------------|-----------|
| PENDING | Expense created, awaiting approval | → APPROVED, → REJECTED | No |
| APPROVED | Expense approved for payment | → REIMBURSED | No |
| REJECTED | Expense rejected | None | Yes |
| REIMBURSED | Expense paid | None | Yes |

**Special rule**: Expenses created via outstanding mark-as-paid skip PENDING → start at APPROVED.

**Invalid transitions**: PENDING → REIMBURSED (must approve first); APPROVED → REJECTED.

### SM5. Journal Entry State Machine
| Status | Description | Allowed Transitions | Terminal? |
|--------|-------------|-------------------|-----------|
| PENDING | Collection partially or fully uncollected | → COMPLETED, → CANCELLED | No |
| COMPLETED | Full amount collected | None | Yes |
| CANCELLED | Entry voided | None | Yes |

### SM6. Outstanding State Machine
| Status | Description | Allowed Transitions | Terminal? |
|--------|-------------|-------------------|-----------|
| upcoming | Due date in the future | → due_today, → overdue, → paid, → cancelled | No |
| due_today | Due date is today | → overdue, → paid, → cancelled | No |
| overdue | Past due date, unpaid | → paid, → cancelled | No |
| paid | Full amount paid via expense | None | Yes |
| partially_paid | Partial amount paid | → paid | No |
| cancelled | Liability voided | None | Yes |

**Auto-transition**: Status is recomputed on every read based on due_date vs current date (upcoming → due_today → overdue).

### SM7. Platform Assignment State Machine
| Status | Description | Allowed Transitions | Terminal? |
|--------|-------------|-------------------|-----------|
| active | Vehicle currently on platform | → ended | No |
| ended | Assignment terminated | None | Yes |

### SM8. Maintenance Record State Machine
| Status | Description | Allowed Transitions | Terminal? |
|--------|-------------|-------------------|-----------|
| scheduled | Maintenance planned | → in_progress, → cancelled | No |
| in_progress | Maintenance underway | → completed, → cancelled | No |
| completed | Maintenance finished | None | Yes |
| cancelled | Maintenance cancelled | None | Yes |

### SM9. Service Schedule State Machine
| Status | Description | Allowed Transitions | Terminal? |
|--------|-------------|-------------------|-----------|
| active | Schedule active, next service computed | → inactive | No |
| inactive | Schedule paused/stopped | → active | No |

### SM10. Reminder State Machine
| Status | Description | Allowed Transitions | Terminal? |
|--------|-------------|-------------------|-----------|
| PENDING | Reminder active | → COMPLETED, → DISMISSED | No |
| COMPLETED | Reminder actioned | None | Yes |
| DISMISSED | Reminder dismissed | None | Yes |

### SM11. Vehicle Document Status (Computed)
| Status | Description | Transition Logic |
|--------|-------------|-----------------|
| valid | Expiry date > 30 days from now | Computed on read |
| expiring_soon | Expiry date within 30 days | Computed on read |
| expired | Expiry date in the past | Computed on read |
| not_set | No expiry date entered | Computed on read |

### SM12. User State Machine
| Status | Description | Allowed Transitions | Terminal? |
|--------|-------------|-------------------|-----------|
| active | User can log in | → inactive | No |
| inactive | User cannot log in | → active | No |

**Special**: is_first_login flag forces password change on next login.

---

## Part 4 — Financial Rules

### FR1. Revenue Calculation
- **Net Revenue Formula** (SOLE SOURCE: Financial Engine revenue.service.ts)
  ```
  net_revenue = gross_fare + doorstep_charges - platform_commission
  ```
- **Booking Commission**: `gross_fare * commission_percent / 100`
- **Refund Validation**: `max(0, refundAmount)`
- **Financials Validation**: gross_fare ≥ 0, doorstep_charges ≥ 0, platform_commission ≥ 0
- **Discount and Taxes**: Tracked but do NOT affect net_revenue calculation (informational)

### FR2. Revenue Aggregation
- **Today's Revenue**: Sum of COMPLETED + CONFIRMED bookings for today
- **Weekly Revenue**: Sum for current ISO week
- **Monthly Revenue**: Sum for current calendar month
- **Yearly Revenue**: Sum for current calendar year
- **Vehicle Revenue**: Sum for specific vehicle across all statuses
- **Platform Revenue**: Sum for specific platform
- **Growth Rate**: Month-over-month, quarter-over-quarter, year-over-year percentage change

### FR3. Expense Rules
- **Valid amounts**: ≥ 0
- **Approved expenses only**: Counted in financial aggregations (PENDING and REJECTED excluded)
- **Large expense threshold**: Configurable, default ₹10,000

### FR4. Profit Rules
- **Net Profit**: Total revenue - total expense (APPROVED + REIMBURSED)
- **Net Margin**: `(net_profit / total_revenue) * 100` (if total_revenue > 0, else 0)
- **Vehicle Profit**: vehicle_revenue - vehicle_expense
- **Profit contributes to**: Vehicle profitability ranking, fleet analytics

### FR5. Cash Flow Rules
- **Inflow**: Sum of amount_collected from COMPLETED journal entries
- **Outflow**: Sum of amount from APPROVED + REIMBURSED expenses
- **Net Cash Flow**: inflow - outflow
- **Pending Collections**: Sum of (total_amount - amount_collected) for PENDING journal entries

### FR6. Outstanding Rules
- **Status auto-computation**: Based on due_date vs current date
- **Mark as paid**: Always creates an expense (APPROVED status) via the expense service
- **Partial payment**: Paid amount < original amount → status = partially_paid
- **Full payment**: Paid amount ≥ original amount → status = paid
- **Paid outstandings**: Cannot be edited (frozen)
- **Restore paid outstanding**: Allowed (sets status back to computed value)

### FR7. Platform Financial Rules
- **Per-platform revenue**: Sum of net_revenue for all COMPLETED + CONFIRMED bookings
- **Per-platform commission**: Sum of platform_commission for all bookings
- **Per-platform net revenue**: Sum of net_revenue per platform
- **Average revenue per booking**: Total revenue / total booking count per platform

### FR8. Journal Financial Rules
- **Shortfall**: total_amount - amount_collected (tracked as unrealized)
- **Collections**: Only COMPLETED journal entries counted in cash flow inflow
- **Ledger categories**: Must be of master_type 'journal_category'

### FR9. Fiscal Period Rules
- **Financial Year**: Configurable start month (default: April → Indian fiscal year)
- **Time periods**: Day (00:00-23:59), Week (ISO Mon-Sun), Month, Quarter, Year
- **Trend periods**: Default 12-month rolling for revenue/expense/profit trends

### FR10. Monetary Precision
- All financial values stored as `DECIMAL(12,2)` in database
- All monetary values displayed as INR (`₹`) with en-IN locale formatting
- Decimal precision: 2 by default, configurable in Financial Settings
- Currency code: INR (configurable in Financial Settings)

---

## Part 5 — Ownership Models

### OM1. Owned Fleet (OWNED)
- **Revenue**: 100% to company
- **Expenses**: 100% company responsibility
- **Profit**: Full company profit after expenses
- **Platform commissions**: Deducted from gross fare per platform rate
- **Vehicle exit**: Company can sell/decommission at any time
- **Driver model**: Driver salary tracked as expense or settlement

### OM2. Leased Fleet (LEASED)
- **Revenue**: 100% to company
- **Lease payment**: Tracked as recurring expense
- **Expenses**: Company responsibility (maintenance, fuel, insurance)
- **Profit**: Revenue - (lease payment + all expenses)
- **Vehicle exit**: At lease term end, vehicle returned to lessor

### OM3. Rental Vehicles (RENTAL)
- **Revenue**: 100% to company (sub-rental model)
- **Rental cost**: Tracked as expense (rental payment to vehicle owner)
- **Expenses**: Company responsibility
- **Profit**: Revenue - (rental cost + expenses)

### OM4. Client Co-Hosted (Future — Requires Code)
- **Revenue split**: Percentage negotiated per vehicle
- **Company commission**: X% of gross revenue
- **Client payout**: (100-X)% of gross revenue minus platform commissions
- **Expenses**: Shared per agreement (typically client pays maintenance, company pays platform fees)
- **Settlement**: Periodic (weekly/monthly) settlement to client
- **Vehicle exit**: Client can reclaim vehicle; platform assignment ended

### OM5. Revenue Sharing Model (Future — Requires Code)
- **Driver revenue share**: Gross revenue split between company and driver
- **Typical split**: 70% driver / 30% company (configurable)
- **Driver payout**: Driver share - driver expenses
- **Expense allocation**: Fuel, repairs allocated per agreement

### OM6. Commission-Only Model (Future — Requires Code)
- **Company earns**: Flat commission per trip or percentage of gross fare
- **All operating expenses**: Borne by vehicle owner/driver
- **Platform commissions**: Deducted before company commission calculation

---

## Part 6 — Platform Rules

### PR1. Platform Assignment Rules
- A vehicle can have exactly one **active** platform assignment at any time
- Creating a new active assignment **auto-ends** any existing active assignment
- Assignment history is preserved indefinitely
- Assignments track: vehicle, platform, category, start/end dates

### PR2. Platform Revenue Models
Each platform (Uber, Ola, Rapido, etc.) has:
- **Commission model**: Percentage of gross fare (configurable per platform)
- **Payment cycle**: Weekly, bi-weekly, or monthly (tracked in platform master)
- **Categories**: Configurable sub-types (e.g., Uber Go, Uber XL, Uber Premier)

### PR3. Platform Switching Process
1. End current assignment (set end_date)
2. Create new assignment to different platform
3. Booking history remains associated with original platform
4. Platform analytics are aggregated per platform, not per vehicle

### PR4. Multi-Platform Operation
- Vehicles can switch platforms over time
- Historical bookings retain original platform_id
- Analytics compare performance across platforms

### PR5. Offline Operation
- Bookings can be entered manually for cash trips or non-platform sources
- Manual bookings use a "Manual/Offline" platform type

### PR6. Platform Extensibility
- New platforms added via Master Data (master_type='platform', master_values)
- No code changes needed to add a platform
- Platform-specific commission logic: uses same percentage formula (future: configurable rules)

---

## Part 7 — Approval Matrix

### AP1. Vehicle Approvals
| Action | Required Approval | Notes |
|--------|-----------------|-------|
| Create vehicle | MANAGER+ (self) | Vehicle master entry |
| Update vehicle | MANAGER+ (self) | Spec changes, status changes |
| Delete vehicle (soft) | MANAGER+ | Sets deleted_at |
| Restore vehicle | ADMIN+ | Undo soft delete |
| Duplicate vehicle | MANAGER+ | Clone existing |
| Activate/Deactivate | ADMIN+ | Toggle is_active |

### AP2. Expense Approvals
| Action | Required Approval | Notes |
|--------|-----------------|-------|
| Create expense | OPERATOR+ (self) | Draft entry |
| Approve expense | ADMIN, MANAGER | PENDING → APPROVED |
| Reject expense | ADMIN, MANAGER | PENDING → REJECTED |
| Delete expense | MANAGER+ | Soft delete |
| Restore expense | ADMIN+ | Undo soft delete |

### AP3. Outstanding Approvals
| Action | Required Approval | Notes |
|--------|-----------------|-------|
| Create outstanding | OPERATOR+ (self) | Liability entry |
| Update outstanding | MANAGER+ | Except paid outstandings (frozen) |
| Mark as paid | MANAGER+ | Creates expense automatically |
| Delete outstanding | MANAGER+ | Soft delete |
| Restore outstanding | ADMIN+ | Undo soft delete |

### AP4. Maintenance Approvals
| Action | Required Approval | Notes |
|--------|-----------------|-------|
| Create maintenance | MANAGER+ (self) | Record entry |
| Update maintenance | MANAGER+ | Changes to existing record |
| Delete maintenance | MANAGER+ | Soft delete |
| Restore maintenance | ADMIN+ | Undo soft delete |

### AP5. Vendor Approvals
| Action | Required Approval | Notes |
|--------|-----------------|-------|
| Create vendor | MANAGER+ (self) | Vendor master entry |
| Update vendor | MANAGER+ | Changes to details |
| Delete vendor | MANAGER+ | Soft delete |
| Restore vendor | ADMIN+ | Undo soft delete |

### AP6. Settlement Approvals (Future)
| Action | Required Approval | Notes |
|--------|-----------------|-------|
| Generate settlement | MANAGER+ | Period-end calculation |
| Approve settlement | ADMIN+ | Financial commitment |
| Process payment | ADMIN+ | Actual funds transfer |

### AP7. Platform Assignment Approvals
| Action | Required Approval | Notes |
|--------|-----------------|-------|
| Create assignment | MANAGER+ | Vehicle → platform |
| End assignment | MANAGER+ | Terminate platform association |

### AP8. Master Data Approvals
| Action | Required Approval | Notes |
|--------|-----------------|-------|
| Create master value | ADMIN+ | Adds dropdown option |
| Update master value | ADMIN+ | Changes to values |
| Delete master value | ADMIN+ | Cannot delete system values |
| Restore master value | ADMIN+ | Undo soft delete |

### AP9. Report Access
| Action | Required Approval | Notes |
|--------|-----------------|-------|
| View reports | VIEWER+ | Read reports |
| Generate reports | MANAGER+ | On-demand generation |
| Export reports | MANAGER+ | CSV/Excel download |
| Save templates | MANAGER+ | Personal templates |
| Manage templates | MANAGER+ (own) | Edit/delete own templates |

### AP10. User Management Approvals
| Action | Required Approval | Notes |
|--------|-----------------|-------|
| Create user | ADMIN+ | SUPER_ADMIN only for delete |
| Update user | ADMIN+ | Role changes, profile |
| Delete user | SUPER_ADMIN only | Hard delete |
| Activate/Deactivate | ADMIN+ | Toggle user access |
| View users | MANAGER+ | User list and details |

### AP11. Settings Approvals
| Action | Required Approval | Notes |
|--------|-----------------|-------|
| View settings | ALL roles | Read access |
| Update company/settings | ADMIN+ | Global configuration |
| Update preferences | OPERATOR+ (self) | Personal preferences |

---

## Part 8 — Automation Rules

### AR1. Outstanding → Expense Auto-Conversion
- **Trigger**: Outstanding marked as paid
- **Action**: Create APPROVED expense with category = expense_category_id, payment_mode = payment_mode_id, amount = paid_amount
- **Post-condition**: Outstanding.paid_as_expense_id = new expense.id

### AR2. Outstanding Status Auto-Computation
- **Trigger**: On every read/create/update of outstanding
- **Logic**: Compare due_date to current date → upcoming (future), due_today (today), overdue (past)
- **Override**: If status is paid/cancelled/partially_paid, preserve existing status

### AR3. Vehicle Status Auto-Set on Maintenance
- **Trigger**: Maintenance record created with status=completed
- **Logic**: If vehicle.status was MAINTENANCE, set to AVAILABLE
- **Post-condition**: Vehicle odometer updated to maintenance odometer reading

### AR4. Service Schedule Next-Date Computation
- **Trigger**: Service schedule created or updated
- **Logic**: next_service_km = last_service_km + interval_km; next_service_date = add days to last_service_date
- **Recurring**: If is_recurring=true, next dates are computed for future schedules

### AR5. Platform Assignment Auto-End
- **Trigger**: New active assignment created for vehicle with existing active assignment
- **Logic**: Previous active assignment.status → ended; end_date → assignment start_date
- **Post-condition**: Vehicle.active_platform_id → new platform

### AR6. Reminder Processing
- **Trigger**: Manual or scheduled (POST /reminders/process)
- **Logic**: Find all PENDING reminders where due_date - remind_before_days <= today
- **Action**: Create notifications for each due reminder
- **Recurring**: For recurring reminders, compute next due date after processing

### AR7. Document Expiry Alerts
- **Trigger**: Dashboard load / Notification engine processing
- **Logic**: Compare vehicle document expiry dates to current date + configurable days_before
- **Categories**: insurance, permit, road_tax, pollution, fitness, RC (6 document types)
- **Threshold**: Default 30 days before expiry (configurable in notification preferences)

### AR8. Large Expense Alert
- **Trigger**: Expense created/updated with amount > threshold (default ₹10,000)
- **Action**: Generate warning notification
- **Dashboard**: Displayed in alerts section

### AR9. Negative Profit Alert
- **Trigger**: Dashboard data generation detects vehicle with negative profit
- **Action**: Generate warning notification
- **Dashboard**: Displayed in alerts section with vehicle details

### AR10. Pending Items Alert
- **Trigger**: Daily/on-demand check
- **Items**: PENDING journal entries, PENDING expenses, PENDING bookings
- **Action**: Generate info notifications with counts
- **Dashboard**: Displayed in alerts section

### AR11. Inactive Vehicles Alert
- **Trigger**: Dashboard data generation
- **Logic**: Vehicles with no bookings in lookback period
- **Action**: Warning notification
- **Dashboard**: Listed in alerts section

### AR12. Net Revenue Auto-Calculation
- **Trigger**: Booking created or updated where financial fields changed
- **Logic**: net_revenue = gross_fare + doorstep_charges - platform_commission
- **Location**: Financial Engine revenue.service.ts (single source of truth)

### AR13. Dashboard Data Refresh
- **Trigger**: Manual refresh via filter bar or page load
- **Logic**: Parallelized Promise.all across 10+ data sources
- **Data**: KPIs, trends, breakdowns, recent activity, alerts, fleet health, top vehicles

### AR14. Fleet Health Score Computation
- **Trigger**: Fleet health endpoint called
- **Inputs**: Vehicle counts by status, document expiry counts, maintenance costs, platform assignments
- **Output**: Numeric score (0-100), status breakdown, due items

---

## Part 9 — Role Responsibilities

### R1. SUPER_ADMIN
| Responsibility | Permissions |
|---|---|
| Full system access | All endpoints |
| User management (CRUD, activate/deactivate, delete) | `users:*` |
| Settings management | All settings endpoints |
| System configuration | Master data, platform management |
| Financial oversight | Reports, analytics, dashboard |
| **Restrictions**: Cannot be deleted; can delete other users |

### R2. ADMIN
| Responsibility | Permissions |
|---|---|
| All business operations | Vehicles, bookings, expenses, outstandings, journal CRUD |
| User management (no delete) | Create, update, activate/deactivate |
| Settings management | Company, dashboard, financial, notification, security, preferences |
| Report management | Generate, export, manage templates |
| Master data management | Create, update, delete master values |
| **Restrictions**: Cannot delete users; cannot delete SUPER_ADMIN accounts |

### R3. MANAGER
| Responsibility | Permissions |
|---|---|
| Vehicle management | CRUD, duplicate vehicles |
| Booking management | CRUD, approve bookings |
| Expense management | CRUD, approve/reject expenses |
| Outstanding management | CRUD, mark as paid |
| Maintenance management | CRUD maintenance records |
| Vendor management | CRUD vendors |
| Report management | Generate, export, save templates |
| Platform assignments | Create, end assignments |
| Service schedules | CRUD schedules |
| Journal entries | CRUD, duplicate |
| **Restrictions**: Cannot manage users; cannot modify settings; cannot delete (soft-delete only) |

### R4. OPERATOR
| Responsibility | Permissions |
|---|---|
| Create records | Vehicles, bookings, expenses, outstandings, journal entries |
| View records | All entities (read access) |
| Update records | Edit existing records |
| Notification management | Mark as read, update preferences |
| **Restrictions**: Cannot delete records; cannot approve expenses; cannot mark outstandings as paid; cannot manage users, settings, or master data |

### R5. VIEWER
| Responsibility | Permissions |
|---|---|
| Read-only access | All entities (view only) |
| Dashboard viewing | Dashboard, analytics, reports |
| **Restrictions**: Cannot create, update, delete, or approve anything; no settings access; no user management |

### R6. Permission-to-Role Mapping
| Permission | SUPER_ADMIN | ADMIN | MANAGER | OPERATOR | VIEWER |
|---|---|---|---|---|---|
| users:create | ✅ | ✅ | ❌ | ❌ | ❌ |
| users:read | ✅ | ✅ | ✅ | ❌ | ❌ |
| users:update | ✅ | ✅ | ❌ | ❌ | ❌ |
| users:delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| users:activate | ✅ | ✅ | ❌ | ❌ | ❌ |
| users:deactivate | ✅ | ✅ | ❌ | ❌ | ❌ |
| vehicles:* | ✅ | ✅ | ✅ (CRUD) | ✅ (C,U) | ❌ |
| vehicles:read | ✅ | ✅ | ✅ | ✅ | ✅ |
| bookings:* | ✅ | ✅ | ✅ (CRUD) | ✅ (C,U) | ❌ |
| bookings:read | ✅ | ✅ | ✅ | ✅ | ✅ |
| bookings:approve | ✅ | ✅ | ✅ | ❌ | ❌ |
| expenses:* | ✅ | ✅ | ✅ (CRUD) | ✅ (C,U) | ❌ |
| expenses:read | ✅ | ✅ | ✅ | ✅ | ✅ |
| expenses:approve | ✅ | ✅ | ✅ | ❌ | ❌ |
| outstandings:* | ✅ | ✅ | ✅ (CRUD) | ✅ (C,U) | ❌ |
| outstandings:read | ✅ | ✅ | ✅ | ✅ | ✅ |
| outstandings:mark-paid | ✅ | ✅ | ✅ | ❌ | ❌ |
| reports:* | ✅ | ✅ | ✅ | ❌ | ❌ |
| reports:read | ✅ | ✅ | ✅ | ✅ | ✅ |
| reports:export | ✅ | ✅ | ✅ | ❌ | ❌ |
| audit:read | ✅ | ✅ | ❌ | ❌ | ❌ |
| masters:manage | ✅ | ✅ | ❌ | ❌ | ❌ |
| journal:* | ✅ | ✅ | ✅ (CRUD) | ✅ (C,U) | ❌ |
| journal:read | ✅ | ✅ | ✅ | ✅ | ✅ |
| settings:* | ✅ | ✅ (except security) | ❌ | ❌ | ❌ |
| analytics:read | ✅ | ✅ | ✅ | ✅ | ✅ |
