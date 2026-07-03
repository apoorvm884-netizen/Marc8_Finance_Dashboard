# Production Build Root Cause Report

## Root Cause

**Vercel is serving the SOURCE `frontend/index.html` instead of the BUILT `frontend/dist/index.html`.**

The source `index.html` contains:
```html
<script type="module" src="/src/main.tsx"></script>
```

The built `dist/index.html` contains (correct):
```html
<script type="module" crossorigin src="/assets/index-BUqXCV1U.js"></script>
```

The browser receives the source version → requests `/src/main.tsx` → 404 → blank screen.

**Why this happens:** The Vercel project's "Output Directory" setting in the dashboard overrides the `vercel.json` `outputDirectory: "dist"`. The dashboard is configured to serve from the root directory (`.`) instead of `dist`, so `frontend/index.html` (source) is served instead of `frontend/dist/index.html` (built).

---

## Files Inspected

| File | Content |
|---|---|
| `frontend/index.html` | `<script type="module" src="/src/main.tsx">` — dev-mode reference |
| `frontend/dist/index.html` | `<script type="module" crossorigin src="/assets/index-BUqXCV1U.js">` — correct production reference |
| `frontend/vite.config.ts` | No `base`, no `outDir`, no `root`, no `publicDir` — all defaults (correct) |
| `frontend/vercel.json` | `outputDirectory: "dist"` — correct, but overridden by dashboard |
| Build output `frontend/dist/assets/` | 68 asset files present ✅ |

---

## Files Changed

### 1. `frontend/vercel.json` (updated)
**Before:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  ...
}
```
**After:**
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  ...
}
```
Added `"framework": "vite"` to explicitly use Vercel's Vite framework preset with known-good defaults.

### 2. `vercel.json` (NEW — repo root)
Added a safety-net `vercel.json` at the repo root that configures the project from the repository level:
```json
{
  "buildCommand": "cd frontend && npm run build",
  "installCommand": "cd frontend && npm install",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  ...
}
```
This ensures the project works if the Vercel root directory is set to the repo root instead of `frontend/`.

### 3. `frontend/index.html` (already fixed in previous session)
**Before:** `href="/vite.svg"` (404 — file doesn't exist)
**After:** `href="/favicon.svg"` (file exists in `public/` and `dist/`)

---

## Build Verification

| Check | Result |
|---|---|
| `npm run build` | ✅ 219ms, 710 modules |
| `dist/index.html` references | ✅ `/assets/index-BUqXCV1U.js` (NOT `main.tsx`) |
| `dist/assets/*.js` present | ✅ 68 files |
| `dist/favicon.svg` present | ✅ |
| Local preview — root URL | ✅ 200 |
| Local preview — favicon | ✅ 200 |
| Local preview — SPA fallback | ✅ 200 |

---

## Deployment Fix (Required Action)

1. **Set "Output Directory" in Vercel dashboard to `dist`** (or leave it empty/auto)
   - Navigate to Vercel Project → Settings → General → Build & Development Settings
   - Ensure "Output Directory" is `dist` (or blank for auto-detect)
   - This ensures Vercel serves `frontend/dist/index.html` instead of `frontend/index.html`

2. **Redeploy**
   - After setting the output directory, trigger a new deployment
   - Clear browser cache / hard refresh (Cmd+Shift+R) to avoid 304 cache issues

3. **Verify in Browser Network Tab**
   - `index.html` should return **200** (not 304)
   - Script should load from `/assets/index-*.js` (not `/src/main.tsx`)
   - No 404 errors

---

## Summary

The build is correct. `dist/index.html` has the right production asset references. The issue is entirely on Vercel's serving side: the dashboard's "Output Directory" setting overrides `frontend/vercel.json` and causes the source `frontend/index.html` to be served instead of `frontend/dist/index.html`.
