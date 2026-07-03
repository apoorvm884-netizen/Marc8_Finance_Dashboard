# Vite Build Failure Report

## Root Cause

**`"framework": "vite"` in `vercel.json` caused Vercel to use the Vite preset's default build command (`vite build`) directly, ignoring the custom `buildCommand`.** The build ran from a directory without `node_modules/.bin/vite`, producing `vite: command not found`.

### Detailed Explanation

When `"framework": "vite"` is set in `vercel.json`, Vercel applies the Vite framework preset which hardcodes:
- Build command: `vite build`
- Install command: `npm install`
- Output directory: `dist`

This preset **overrides** the custom `buildCommand` in `vercel.json`. Vercel ran `vite build` directly instead of `npm run build` (or `cd frontend && npm run build`).

Two possible scenarios for where the command ran:

| Scenario | Why it fails |
|---|---|
| **Root directory = repo root** | No `package.json` or `node_modules` at repo root — `vite` binary does not exist |
| **Root directory = `frontend/`** | Vite preset may also override `installCommand`, skipping correct dependency installation |

**Confirmed locally:**
- `vite` is in `frontend/package.json` `devDependencies` as `"vite": "^8.1.0"`
- `node_modules/.bin/vite` exists in `frontend/` at `frontend/node_modules/.bin/vite`
- No `node_modules/` exists at repo root
- `npm install` + `npm run build` from `frontend/` succeeds cleanly
- `npm install` fails at repo root (no `package.json`)
- `vite build` run from repo root fails with `vite: command not found`

---

## Files Inspected

| File | Finding |
|---|---|
| `frontend/package.json` | `vite` in `devDependencies` ✅ (v8.1.0) |
| `frontend/package-lock.json` | Present ✅ |
| `frontend/node_modules/.bin/vite` | Symlink exists ✅ (`../vite/bin/vite.js`) |
| `frontend/vercel.json` | Had `"framework": "vite"` ❌ (removed) |
| `vercel.json` (repo root) | Had `"framework": "vite"` ❌ (removed) |
| `package.json` (repo root) | Does NOT exist ✅ (no confusion) |
| `node_modules/` (repo root) | Does NOT exist ✅ (no confusion) |

---

## Files Changed

### `frontend/vercel.json`
**Removed:** `"framework": "vite"`

Before:
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  ...
}
```

After:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  ...
}
```

### `vercel.json` (repo root)
**Removed:** `"framework": "vite"`

Before:
```json
{
  "buildCommand": "cd frontend && npm run build",
  "installCommand": "cd frontend && npm install",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  ...
}
```

After:
```json
{
  "buildCommand": "cd frontend && npm run build",
  "installCommand": "cd frontend && npm install",
  "outputDirectory": "frontend/dist",
  ...
}
```

---

## Verification

| Test | Result |
|---|---|
| `npm install` then `npm run build` from `frontend/` (clean) | ✅ Builds in ~220ms |
| `cd frontend && npm install && cd .. && cd frontend && npm run build` (Vercel repo-root scenario) | ✅ Builds in ~246ms |
| `frontend/node_modules/.bin/vite` exists after install | ✅ Yes |
| No `framework` field in either `vercel.json` | ✅ Confirmed |
| No `package.json` at repo root | ✅ Confirmed (avoids confusion) |

---

## How the Fix Works

By removing `"framework": "vite"`, Vercel falls back to **auto-detection** — it reads `frontend/package.json`, detects `vite` in `devDependencies`, and applies the Vite preset. However, the explicit `buildCommand` and `installCommand` in `vercel.json` **override** the auto-detected defaults (unlike `framework: "vite"` which overrides the custom commands).

This is the correct precedence chain:
```
vercel.json custom settings  >  auto-detected framework defaults
```
But:
```
"framework": "vite" preset hardcoded settings  >  vercel.json custom settings
```
