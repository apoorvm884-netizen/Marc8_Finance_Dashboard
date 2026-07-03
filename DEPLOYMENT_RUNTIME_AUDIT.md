# Deployment & Runtime Audit Report

## 1. Root Cause

**Most likely cause: Vercel project root directory is not set to `frontend/`.**

The Vercel project must have **Root Directory** set to `frontend/` because:
- `package.json` is at `frontend/package.json` (not repo root)
- `vercel.json` is at `frontend/vercel.json` (not repo root)
- Vite config is at `frontend/vite.config.ts`
- Build output is at `frontend/dist/`

If the Vercel project root is set to the repository root (`/`), Vercel will not find `package.json`, will fail to detect the Vite framework, and will not build correctly.

**Secondary cause: `index.html` referenced `/vite.svg` but the file is `favicon.svg`.** This caused a favicon 404 but not the blank screen. Fixed.

---

## 2. ZIP File Findings

| Check | Result |
|---|---|
| `.zip` files in project | **None found** — clean |
| Affects deployment | N/A |

---

## 3. Build Findings

| Check | Result |
|---|---|
| `npm install` | ✅ Successful |
| `npm run build` | ✅ **Successful** (218-246ms) |
| Build output | `frontend/dist/` |
| `index.html` in dist | ✅ Present — correct script/CSS references |
| Assets generated | 68 asset files (JS + CSS + SVG) |
| Dynamic chunks | All page chunks present (login, dashboard, operations, automation, etc.) |
| Modulepreload links | 5 preload links, all match existing dist files |

### Pre-existing TypeScript Errors (non-blocking)

The `build` script uses `vite build` only (not `tsc`). Using `tsc -b` would fail with:
- `src/pages/tasks.tsx` — imports `CreateTaskDTO`, `TaskPriority`, `TaskStatus` which don't exist in `@/types/workflow`
- `src/pages/operations.tsx` — unused imports `CheckCircle2`, `Clock`, `BarChart3`
- Various other page-level type errors from library version mismatches (tanstack/react-table v8.21, Zod v4, CVA)

These are NOT in the critical startup path — they only affect lazy-loaded pages.

---

## 4. Runtime Findings

### Production Preview (local)

| Scenario | Result |
|---|---|
| Root `/` | Serves `index.html` ✅ |
| `/dashboard` | Serves `index.html` (SPA fallback) ✅ |
| `/login` | Serves `index.html` (SPA fallback) ✅ |
| `/assets/index-*.js` | 200 OK ✅ |
| `/assets/index-*.css` | 200 OK ✅ |
| `/favicon.svg` | **Was 404 → now 200** ✅ (fixed) |

### React Initialization Flow

The startup path is:
1. `index.html` loads → `#root` element exists
2. `main.tsx` render → null-guarded `createRoot()`
3. `GlobalErrorBoundary` wraps app (catches crashes with recovery UI)
4. `Providers` → `ThemeProvider` > `NotificationProvider` > `AuthProvider` > `AppStoreProvider`
5. All `localStorage` operations are wrapped in `try/catch`
6. `RouterProvider router={router}` → `createBrowserRouter(routes)` — validated API ✅
7. `AuthProvider` → checks localStorage → dispatches `AUTH_FAILURE` (no token) → `isLoading: false`
8. `ProtectedRoute` → redirects to `/login`
9. Login page renders via `lazy()` + `Suspense` ✅

### No blocking runtime errors found

- `createBrowserRouter` and `RouterProvider` are valid in react-router-dom v7.18.0 ✅
- All icon imports (including `Zap`, `Settings2`) exist in lucide-react ✅
- Zod v4 schemas parse correctly ✅
- `@hookform/resolvers/zod` is compatible ✅
- `@radix-ui/react-slot` Slot component has correct `asChild` handling ✅
- All providers have proper error guards ✅

---

## 5. Deployment Findings

### Vercel Configuration

| Setting | Value |
|---|---|
| **Required Root Directory** | `frontend/` (MUST be set in Vercel project settings) |
| `vercel.json` location | `frontend/vercel.json` |
| Build command | `npm run build` (now explicit in `vercel.json`) |
| Output directory | `dist/` (now explicit in `vercel.json`) |
| Install command | `npm install` (now explicit in `vercel.json`) |
| SPA fallback | `/((?!api).*)` → `/index.html` ✅ |
| Asset caching | `/assets/*` — immutable, 1 year max-age ✅ |

### Environment Variables Required in Vercel

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `/api/v1` (path-based proxy) |

### No duplicate configurations found

- 1 `vite.config.ts` at `frontend/` ✅
- 1 `package.json` with build scripts at `frontend/` ✅
- 1 `tsconfig.json` (with references) at `frontend/` ✅
- 1 `public/` folder at `frontend/` ✅
- 1 `src/` folder at `frontend/src/` ✅

---

## 6. Files Modified

| File | Change | Reason |
|---|---|---|
| `frontend/index.html` | `href="/vite.svg"` → `href="/favicon.svg"` | Favicon 404 — public folder has `favicon.svg`, not `vite.svg` |
| `frontend/vercel.json` | Added `buildCommand`, `outputDirectory`, `installCommand` | Explicit config prevents framework auto-detection issues |

---

## 7. Verification

| Check | Status |
|---|---|
| `npm run build` | ✅ PASS (218ms) |
| `dist/index.html` favicon reference | ✅ `/favicon.svg` |
| `dist/favicon.svg` exists | ✅ |
| Local preview: root URL | ✅ 200 |
| Local preview: favicon | ✅ 200 (was 404 before fix) |
| Local preview: JS bundle | ✅ 200 |
| Local preview: CSS bundle | ✅ 200 |
| Local preview: SPA fallback | ✅ 200 |
| Backend build | ✅ PASS |

---

## 8. Final Deployment Status

**Deployment fix applied.** After redeploying to Vercel:

1. **Verify Vercel project Root Directory is set to `frontend/`** — this is the most critical setting
2. **Set `VITE_API_URL` environment variable** in Vercel project settings if using a separate backend domain
3. **Redeploy** — the build should now produce correct static assets with no 404s

### If blank screen persists after redeploy:

- Check Vercel Deployment Logs for build errors
- Check Browser Console for JavaScript errors
- Verify the `vercel.json` rewrites are being applied (look at Network tab for asset 200s)
- Ensure `VITE_API_URL` is accessible from the browser (no CORS issues)
- Try accessing `https://your-domain.vercel.app/login` directly

### Remaining known issues (not blocking):

- TypeScript errors in page-level code (tasks.tsx: import `CreateTaskDTO`, etc. from wrong module)
- Missing routes for `/fleet`, `/masters/customers`, etc. in sidebar navigation hit 404 catch-all
- Zod v4 removed `required_error` — affects some form schemas at submission time
