# Fleet Financial Dashboard - Static HTML Version

This is a pure static HTML/CSS/Vanilla JS version of the Marc8 Fleet Financial Dashboard ERP, converted from the original React/TypeScript/Vite frontend.

## How to Use

1. **Open files directly**: Navigate to the `html/` folder and double-click any `.html` file to open in a browser. No server, build step, or Node.js required.
2. **Start with login**: Open `html/login.html`. Click "Continue as Guest" to access the dashboard.
3. **Navigate**: Use the sidebar to browse all pages. All data is static mock data for demonstration.

## Project Structure

```
Marc8_HTML/
├── html/           # All HTML pages (open these)
│   ├── login.html
│   ├── dashboard.html
│   ├── bookings.html
│   ├── journal-ledger.html
│   ├── expenses.html
│   ├── settlements.html
│   ├── outstandings.html
│   ├── fleet-dashboard.html
│   ├── maintenance.html
│   ├── service-schedules.html
│   ├── analytics.html
│   ├── reports.html
│   ├── notifications.html
│   ├── operations.html
│   ├── automation.html
│   ├── customers.html
│   ├── vendors.html
│   ├── drivers.html
│   ├── vehicles.html
│   ├── vehicle-owners.html
│   ├── accounts.html
│   ├── platform-masters.html
│   ├── expense-categories.html
│   ├── payment-modes.html
│   └── settings.html
├── css/            # Stylesheets
│   ├── brand.css         # Design tokens & CSS custom properties
│   ├── base.css          # Reset, typography, focus styles
│   ├── layout.css        # Sidebar, navbar, page layouts, grids
│   ├── components.css    # Buttons, badges, cards, modals, dropdowns
│   ├── dashboard.css     # KPI cards, charts, fleet health
│   ├── tables.css        # Data tables, sorting, pagination
│   ├── forms.css         # Form layouts and validation
│   ├── charts.css        # Chart containers and tooltips
│   ├── utilities.css     # Utility classes and animations
│   └── responsive.css    # Mobile/tablet/desktop breakpoints
├── js/             # JavaScript
│   ├── data.js           # Mock data store (cached generators)
│   └── app.js            # Core app: sidebar, modals, tables, charts, toasts
├── favicon.svg
├── README.md
└── HTML_CONVERSION_REPORT.md
```

## Design System

- **Background**: `#000250` (dark navy)
- **Surface**: `#0f172a` (slate 900)
- **Primary (Essence)**: `#183eeb`
- **Accent**: `#ff7200` (orange)
- **Success**: `#22c55e` (emerald)
- **Danger**: `#ef4444` (red)
- **Typography**: Manrope (headings) / Inter (body)

All components use glass-morphism effects with backdrop blur, subtle borders, and gradient overlays consistent with the original Tailwind design.

## Pages

| Page | File | Description |
|------|------|-------------|
| Login | login.html | Authentication with guest mode |
| Dashboard | dashboard.html | KPI cards, trends, fleet health, alerts |
| Bookings | bookings.html | Platform booking management |
| Journal Ledger | journal-ledger.html | Revenue collection tracking |
| Expenses | expenses.html | Fleet expense management |
| Settlements | settlements.html | Platform settlement tracking |
| Outstandings | outstandings.html | Pending collections |
| Fleet Dashboard | fleet-dashboard.html | Fleet health & vehicle list |
| Maintenance | maintenance.html | Service & repair records |
| Service Schedules | service-schedules.html | Upcoming services |
| Analytics | analytics.html | Charts & trends |
| Reports | reports.html | Generated reports |
| Notifications | notifications.html | Alerts & notifications |
| Operations | operations.html | Task management |
| Automation | automation.html | Workflow rules |
| Masters (x9) | *.html | Customers, vendors, drivers, vehicles, etc. |
| Settings | settings.html | Company & app configuration |

## Interactivity

- Sidebar collapse/expand (persisted in localStorage)
- Dropdown menus
- Modal dialogs & drawers (slide-in forms)
- Confirmation dialogs
- Data tables with search, filter, sort, pagination
- Canvas-based bar charts and pie/donut charts
- Toast notifications
- Command palette (⌘K / Ctrl+K)
- Responsive layout (mobile/tablet/desktop)

## Data

All data is mock/demo data generated client-side by `data.js`. Every page refresh generates fresh but consistent data (cached per session). No backend, API, or database required.

## Conversion from React

This was converted from a React 19 + TypeScript + Vite + Tailwind CSS + framer-motion + recharts application. All React patterns were replaced:
- JSX → Static HTML
- Tailwind → Custom CSS with custom properties
- React Router → Anchor links
- React state/hooks → Vanilla JS
- framer-motion → CSS animations
- recharts → Canvas-based charts
- tanstack/react-table → Vanilla table rendering
- react-hook-form + zod → Native HTML forms

## Browser Support

Works on all modern browsers (Chrome, Firefox, Safari, Edge). Dark mode only.
