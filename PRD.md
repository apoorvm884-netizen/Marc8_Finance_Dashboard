# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Project:** Fleet Management Financial Dashboard & Ledger System
**To:** Development / Tech Team
**From:** Operations / Product Owner
**Date:** June 27, 2026
**Status:** Revised Specifications v2

---

## 1. Objective & Scope
The purpose of this project is to build a centralized Fleet Financial Dashboard & Analytics Platform to track, audit, and analyze all revenues, platform settlements, vehicle utilization, and operational costs across our car rental fleet.

## 2. Core Modules: Data Entry Systems
The application requires three entry types to ensure systematic tracking of platform bookings, manual journal entries, and running vehicle expenses.

### 2.1 Platform Bookings Entry Form (Revenue Tracking)
Captures earnings and logs generated through our active car rental platform channels.

| Field Name | Functional Logic & Expected Behavior |
| :--- | :--- |
| **Car Name / Number** | Searchable dropdown selector mapped to the vehicle fleet master list. |
| **Platform** | Fixed dropdown selection containing exactly: Zoomcar, Revv, Bharat, and Marc8. |
| **Booking ID** | Alphanumeric field issued by the corresponding platform. Must be unique to prevent duplicate inputs. |
| **Date and Time of Booking**| Unified date-time calendar widget mapping when the rental/trip commenced. |
| **Total Fare** | The total gross billing amount paid by the customer. |
| **Doorstep Charges** | Separate field to track home delivery/collection fees collected for the booking. Defaults to zero. |
| **Platform Commission** | Optional field to log platform-side deduction for precise net-payout calculation. |

### 2.2 Journal Entry Form (Collections & Settlements Ledger)
Tracks offline reconciliation amounts collected, physical settlements, and specific running operational event categories.

| Field Name | Functional Logic & Expected Behavior |
| :--- | :--- |
| **Collection Date** | Calendar input mapping the exact settlement/collection date. |
| **Target Car** | Dropdown selector to link the journal voucher to an individual vehicle. |
| **Amount Collected** | Total monetary volume actualized/cleared on this specific transaction event. |
| **Total Amount** | The grand running balance or full settlement amount corresponding to this record. |
| **Ledger Allocation Category**| Categorized tagging checkboxes or dropdown selectors including: Fastag, Fuel, Instances, Washing, Damage. |
| **Remarks / Description** | Text area block for tracking internal audit notes or specific incident references. |

### 2.3 Expense Entry Form
Captures general outlays, fleet overheads, and non-journaled operation leaks.

| Field Name | Functional Logic & Expected Behavior |
| :--- | :--- |
| **Expense Type / Category** | Dropdown menu featuring: Routine Maintenance, Insurance Premiums, State Permits, Road Tax, Driver Salaries, and General Administration Overheads. |
| **Associated Vehicle** | Dropdown menu to pinpoint the car causing the cost (or "Fleet-Wide" for common expenses). |
| **Payment Mode** | Dropdown identifying the account source: Cash, UPI, Corporate Card, or Fleet Fuel Card. |

## 3. Dashboard Analytics & Filters
The tech team should provide a continuous grid view with instantaneous multi-parameter global filtering:

- **Car-wise Filter:** Filter views by individual vehicle names/numbers or multi-select groups.
- **Platform Filter:** Isolate performance precisely across Zoomcar, Revv, Bharat, and Marc8.
- **Amount Collected Type Filter:** Isolate allocations across Fastag, Fuel, Instances, Washing, or Damage.
- **Date-wise Filter:** Interactive range controller to select Custom Periods, Monthly Views, or Fiscal Year views.
- **Expense Filter:** Segment financial overhead metrics based on distinct operational expense headers.
