# Repository Integrity Audit

## 1. ZIP Files

**Result: NONE**

No `.zip` files anywhere in the repository. The root `.gitignore` includes `*.zip` to prevent future additions.

---

## 2. Duplicate Copies of the Project

**Result: No functional duplicates, but one stale empty shell was found.**

| Path | Status | Files |
|---|---|---|
| `frontend/` | ✅ **Real frontend project** | 197 `.ts`/`.tsx` source files, full `src/` structure |
| `dashboard/frontend/` | ❌ Stale empty shell | Only empty directories (`src/`, `src/components/`, `src/components/outstanding/`) — zero files |
| `backend/` | ✅ **Real backend project** | 146 `.ts` source files, full `src/` structure |

The `dashboard/frontend/` directory is an abandoned attempt. It has **no code** — just 3 empty directories. It does NOT affect the frontend build or deployment.

---

## 3. Every `package.json`

| Path | Package Name | Purpose |
|---|---|---|
| `frontend/package.json` | `frontend` v0.0.0 | ✅ Vite + React frontend |
| `backend/package.json` | `fleet-financial-dashboard-backend` v1.0.0 | ✅ Express + Knex backend API |
| Root level | — | ❌ **NONE** |

**No root `package.json` exists.** This is correct — the frontend and backend are independent projects.

---

## 4. Every `vercel.json`

| Path | Status | Content |
|---|---|---|
| `vercel.json` (root) | ✅ Safety net | Deploys from repo root via `cd frontend && npm run build` |
| `frontend/vercel.json` | ✅ Primary | Deploys from `frontend/` directly |

Both are intentional. Only the one matching Vercel's "Root Directory" setting is used.

---

## 5. Every `netlify.toml`

**Result: NONE** — No Netlify configuration exists anywhere.

---

## 6. Every `vite.config.*`

| Path | Type |
|---|---|
| `frontend/vite.config.ts` | ✅ TypeScript Vite config |

**No other `vite.config.*` files exist** (no JS, no ESM, no copy at root or in `dashboard/`).

---

## 7. Every `index.html`

| Path | Status |
|---|---|
| `frontend/index.html` | ✅ Single source of truth |

**No other `index.html` files exist** (no copy at root, no copy in `dashboard/`, no copy in `backend/`).

---

## 8. Every `dist/` Folder

| Path | Size | .gitignore | Risk |
|---|---|---|---|
| `frontend/dist/` | ~several MB | ✅ Covered by `frontend/.gitignore` + root `.gitignore` | None |
| `backend/dist/` | ~2.2 MB | ✅ Covered by root `.gitignore` (`dist/` pattern matches any directory) | None |
| Root level | — | — | None |

**Both are covered by `.gitignore` patterns.** `frontend/dist/` has a dedicated entry in `frontend/.gitignore`; `backend/dist/` is covered by the root `.gitignore` pattern `dist/` (no leading slash, matches any depth).

---

## 9. Real Frontend Project

**The real frontend project is `frontend/`.**

Evidence:
- `frontend/package.json` with `vite`, `react`, all dependencies
- `frontend/vite.config.ts` — the only Vite config in the repo
- `frontend/index.html` — the only `index.html` in the repo
- `frontend/src/` — 197 source files (`.ts` + `.tsx`)
- `frontend/src/app/`, `frontend/src/components/` (14 component directories), `frontend/src/pages/`, `frontend/src/routes/`, etc.

---

## 10. Nested Frontend Copies

**Result: No nested copies.**

The `dashboard/frontend/` directory is **not a copy** — it is an empty shell with zero files. It has:
- No `package.json`
- No `index.html`
- No `.ts` or `.tsx` files
- No `node_modules`
- No configuration files of any kind

It can be safely deleted without affecting anything.

---

## 11. Stale Build Artifacts Being Committed

**Result: No stale build artifacts are tracked in git.**

| Check | Result |
|---|---|
| `git ls-files` | **0 tracked files** — no commits with files exist yet |
| `git ls-files dist/` | None (not tracked) |
| `git ls-files node_modules/` | None (not tracked) |
| Files not yet committed | 418 untracked files (all source code, docs, config — no build artifacts) |

The repo has not yet had its first commit. All files are currently untracked. The `.gitignore` patterns protect `dist/` and `node_modules/` from accidental inclusion on first commit.

**Recommendation:** Verify `.gitignore` before the first commit:
- Root `.gitignore` needs to cover `backend/dist/` and `backend/node_modules/` — it does (`dist/` and `node_modules/` patterns match at any directory depth) ✅
- Also review whether `database/` and `dashboard/` should be included or excluded

---

## 12. Duplicate `node_modules/` Folders

| Path | Size | .gitignore | Risk |
|---|---|---|---|
| `frontend/node_modules/` | (standard) | ✅ Covered | None |
| `backend/node_modules/` | ~71 MB | ✅ Covered by root `.gitignore` `node_modules/` | None |
| Root level | — | — | None |
| `dashboard/` | — | — | None |

Only two `node_modules/` folders exist, each belonging to its respective project (`frontend/` and `backend/`). Both are covered by `.gitignore`. No duplicate or confusing `node_modules/` exists.

**One concern:** The `frontend/node_modules/` and `frontend/dist/` exist locally. These are correctly gitignored, but a fresh `git clone && npm install` would regenerate them identically.

---

## 13. Project Trees

### Repository Root (`./`)

```
.
├── .git/
├── .gitignore                          # Covers dist/, node_modules/, *.zip, etc.
├── BRD.md
├── BUSINESS_OPERATING_SPECIFICATION.md
├── BUSINESS_RULES_FREEZE.md
├── Brand_Guidelines.md
├── CONTRIBUTING.md
├── DATABASE_SCHEMA.md
├── DEPLOYMENT.md
├── DEPLOYMENT_INDEPENDENCE_REPORT.md
├── DEPLOYMENT_RUNTIME_AUDIT.md
├── DEPLOY_ANYWHERE.md
├── ENVIRONMENT_SETUP.md
├── PHASE_4B_ENGINEERING_REPORT.md
├── PHASE_5C_ERP_COMPLETION_REPORT.md
├── PHASE_5D1_PREMIUM_UI_REPORT.md
├── PHASE_5D2_MODULE_EXPERIENCE_REPORT.md
├── PHASE_5D3_PREMIUM_PRODUCT_REPORT.md
├── PHASE_6A_IMPLEMENTATION_PLAN.md
├── PHASE_6B1_COHOSTED_ENGINE_REPORT.md
├── PHASE_6B2_1_SOURCE_OF_TRUTH_ALIGNMENT_REPORT.md
├── PHASE_6B2_SETTLEMENT_ENGINE_REPORT.md
├── PHASE_6B3_OPERATIONS_WORKFLOW_REPORT.md
├── PHASE_6B4_AUTOMATION_INTELLIGENCE_REPORT.md
├── PRD.md
├── PRODUCTION_BUILD_ROOT_CAUSE.md
├── PROJECT_AUDIT.md
├── PROJECT_STRUCTURE.md
├── README.md
├── VITE_BUILD_FAILURE_REPORT.md
├── vercel.json                          # Safety-net deployment config
│
├── backend/                             # Express + Knex backend API
│   ├── package.json
│   ├── knexfile.ts
│   ├── tsconfig.json
│   ├── .env / .env.example
│   ├── database/                        # Phase 6 migrations (settlements, automation)
│   │   └── migrations/
│   ├── src/                             # 146 .ts source files
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── types/
│   │   └── utils/
│   ├── dist/                            # Build output (gitignored)
│   └── node_modules/                    # Dependencies (gitignored)
│
├── frontend/                            # Vite + React frontend (DEPLOYMENT TARGET)
│   ├── package.json, package-lock.json
│   ├── vite.config.ts
│   ├── vercel.json
│   ├── index.html
│   ├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
│   ├── postcss.config.js
│   ├── .gitignore
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/                             # 197 source files
│   │   ├── app/                         # Route definitions
│   │   ├── components/                  # 14 subdirectories
│   │   ├── config/
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── providers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── validation/
│   ├── dist/                            # Build output (gitignored)
│   └── node_modules/                    # Dependencies (gitignored)
│
├── dashboard/                           # STALE — empty shell, no code
│   └── frontend/
│       └── src/
│           └── components/
│               └── outstanding/         # Empty directory
│
└── database/                            # Root-level migrations (Pre-backend era)
    ├── migrations/
    │   └── 14 migration files (001_create_users through 014_financial_ops)
    ├── seeds/
    │   └── 2 seed files
    └── init.sql
```

### `frontend/` Full Tree

```
frontend/
├── .DS_Store
├── .env.example
├── .gitignore
├── .oxlintrc.json
├── DEPLOYMENT_RUNTIME_REPORT.md
├── README.md
├── RUNTIME_AUDIT.md
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── tsconfig.app.json
├── tsconfig.app.tsbuildinfo
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.node.tsbuildinfo
├── vercel.json
├── vite.config.ts
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── dist/                       # Build output (gitignored)
├── node_modules/               # Dependencies (gitignored)
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── vite-env.d.ts
    ├── app/
    │   └── routes.tsx
    ├── components/
    │   ├── bookings/
    │   ├── dashboard/
    │   ├── expenses/
    │   ├── journal/
    │   ├── layout/
    │   ├── maintenance/
    │   ├── master/
    │   ├── outstanding/
    │   ├── reports/
    │   ├── settlements/
    │   ├── shared/
    │   ├── ui/
    │   ├── vehicle-owners/
    │   ├── vehicles/
    │   └── vendors/
    ├── config/
    │   └── index.ts
    ├── constants/
    │   └── index.ts
    ├── hooks/
    │   ├── use-debounce.ts
    │   └── use-master-values.ts
    ├── layouts/
    │   ├── auth-layout.tsx
    │   ├── dashboard-layout.tsx
    │   └── root-layout.tsx
    ├── lib/
    │   ├── utils.ts
    │   └── xlsx.ts
    ├── pages/
    │   ├── analytics.tsx
    │   ├── automation.tsx
    │   ├── bookings.tsx
    │   ├── change-password.tsx
    │   ├── dashboard.tsx
    │   ├── expenses.tsx
    │   ├── journal.tsx
    │   ├── login.tsx
    │   ├── maintenance.tsx
    │   ├── master-data.tsx
    │   ├── not-found.tsx
    │   ├── notifications.tsx
    │   ├── operations.tsx
    │   ├── outstanding.tsx
    │   ├── reports.tsx
    │   ├── service-schedules.tsx
    │   ├── settlement-dashboard.tsx
    │   ├── settlement-detail.tsx
    │   ├── settlement-form.tsx
    │   ├── settings.tsx
    │   ├── tasks.tsx
    │   ├── unauthorized.tsx
    │   ├── vehicle-financials.tsx
    │   ├── vehicle-owner-detail.tsx
    │   ├── vehicle-owner-form.tsx
    │   ├── vehicle-owners.tsx
    │   ├── vehicles.tsx
    │   └── vendors.tsx
    ├── providers/
    │   ├── app-store-provider.tsx
    │   ├── auth-provider.tsx
    │   ├── notification-provider.tsx
    │   └── theme-provider.tsx
    ├── routes/
    │   ├── auth-route.tsx
    │   └── protected-route.tsx
    ├── services/
    │   ├── auth.service.ts
    │   ├── master.service.ts
    │   ├── scheduler.service.ts
    │   ├── settlement.service.ts
    │   ├── task.service.ts
    │   ├── vendor.service.ts
    │   └── vehicle.service.ts
    ├── stores/
    │   ├── auth.store.ts
    │   └── ui.store.ts
    ├── types/
    │   └── index.ts
    └── validation/
        └── schemas.ts
```

---

## 14. Correct Deployment Root

### For Vercel (frontend)

**`frontend/`** is the deployment root for Vercel.

Two `vercel.json` configurations exist to handle either Root Directory setting:

| Vercel Root Directory Setting | Config File Used | Build Command |
|---|---|---|
| `frontend/` (recommended) | `frontend/vercel.json` | `npm run build` |
| repo root (alternative) | `vercel.json` (root) | `cd frontend && npm run build` |

**Recommended:** Set Vercel "Root Directory" to `frontend/` (cleaner, standard single-project setup).

### For the backend

The backend (`backend/`) is NOT deployed via Vercel. It is deployed separately (likely on a VPS or Railway). Its `backend/dist/` is the compiled output for `node dist/index.js`.

---

## Summary of Issues Found

| # | Issue | Severity | Action |
|---|---|---|---|
| 1 | `dashboard/frontend/` — empty stale directory shell | 🟡 Low | Delete `dashboard/frontend/` (no code to lose) |
| 2 | `database/` at root vs `backend/database/` — parallel migration directories | 🟡 Low | Verify both are needed (root = pre-backend schema; backend = Phase 6 extensions). Consider consolidating if backend handles all migrations. |
| 3 | `backend/` has no `.gitignore` | 🟡 Low | Backend `dist/` and `node_modules/` are covered by root `.gitignore`, but explicit local `.gitignore` is best practice |
| 4 | `frontend/` has only one `index.html` and one `vite.config.ts` | ✅ Clean | No action needed |
| 5 | No `.zip`, `.rar`, or archive files | ✅ Clean | No action needed |
| 6 | `node_modules/` only exists in `frontend/` and `backend/` — both gitignored | ✅ Clean | No action needed |
| 7 | `dist/` only exists in `frontend/` and `backend/` — both gitignored | ✅ Clean | No action needed |
| 8 | No duplicate projects, no nested copies | ✅ Clean | No action needed |
| 9 | No Netlify config | ✅ Clean | No action needed |
