# Deploy Anywhere

## Overview

This is a **platform-independent** Fleet Financial ERP application.

No modifications to the source code are required to deploy on any standard Node.js environment. The same codebase works on:

- **Local machine** (macOS, Linux, Windows)
- **Ubuntu / Debian servers**
- **Docker containers**
- **Reverse proxies** (Nginx, Apache, Caddy)
- **Node.js hosts** (Railway, Render, Vercel, Heroku, DigitalOcean App Platform, AWS Elastic Beanstalk, Azure App Service, Google Cloud Run)
- **Any VPS** (DigitalOcean, Linode, Hetzner, AWS EC2)

## Project Structure

```
fleet-financial-dashboard/
├── backend/                          # Express API (TypeScript)
│   ├── src/
│   │   └── index.ts                  # Server entry point
│   ├── knexfile.ts                   # Database migrations/seeds config
│   ├── package.json
│   └── .env.example                  # Environment variable template
├── frontend/                         # React SPA (Vite + TypeScript)
│   ├── src/
│   │   └── main.tsx                  # Frontend entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts                # Dev proxy, build config
│   └── .env.example                  # Environment variable template
├── database/                         # SQL migrations and seed data
│   ├── migrations/
│   └── seeds/
└── DEPLOY_ANYWHERE.md                # This file
```

## Requirements

| Dependency | Version | Notes |
|-----------|---------|-------|
| Node.js | 18+ | LTS recommended |
| npm | 9+ | Comes with Node.js |
| PostgreSQL | 14+ | Managed or self-hosted |

## Environment Variables

### Backend (`backend/.env` or system env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Server listen port |
| `NODE_ENV` | No | `development` | `development`, `production`, or `test` |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/db`) |
| `JWT_SECRET` | **Yes** | — | Secret key for JWT token signing |
| `JWT_EXPIRES_IN` | No | `24h` | JWT token expiration duration |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin. Set to your frontend domain in production. |
| `RATE_LIMIT_WINDOW` | No | `15` | API rate limit window in minutes |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window |
| `LOG_LEVEL` | No | `debug` | Log level (production: `info` or `warn`) |

### Frontend (`frontend/.env` or build-time env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `/api/v1` | Backend API base URL. Can be same-origin path or absolute URL. |

## Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd fleet-financial-dashboard

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Configure backend environment
cd ../backend
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET at minimum
```

## Database Setup

```bash
# From the backend/ directory
npm run migrate    # Run all migrations
npm run seed       # Seed initial data (admin user + master data)
```

## Build Commands

### Backend

```bash
cd backend
npm install
npm run build      # Compiles TypeScript → dist/
npm start          # Runs: node dist/index.js
```

### Frontend

```bash
cd frontend
npm install
npm run build      # Builds static files → dist/
npm run preview    # Preview production build locally
```

### Production Architecture

For production, you need:

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Frontend   │────▶│  Reverse     │────▶│  Backend   │
│  (static)   │     │  Proxy       │     │  (Node.js) │
│  dist/      │     │  (nginx/     │     │  port 5000 │
│              │     │   Caddy/     │     │            │
│              │     │   Cloudflare)│     │            │
└─────────────┘     └──────────────┘     └──────┬─────┘
                                                │
                                         ┌──────▼─────┐
                                         │ PostgreSQL │
                                         └────────────┘
```

**Option A — Same domain (recommended):** Serve frontend static files through the reverse proxy and proxy `/api/v1` to the backend. Set `VITE_API_URL=/api/v1` (default).

**Option B — Separate domains:** Host frontend on any static host (Vercel, S3, etc.) and backend on a Node.js host. Set `VITE_API_URL=https://api.yourdomain.com/api/v1` and `CORS_ORIGIN=https://yourfrontend.com`.

## Development Commands

### Backend
```bash
cd backend
npm run dev        # Hot-reload via tsx watch (port 5000)
```

### Frontend
```bash
cd frontend
npm run dev        # Vite dev server with API proxy (port 3000)
```

The Vite dev server proxies `/api/*` requests to the backend at `http://localhost:5000`.

## Production Deployment Examples

### Direct (no proxy)

```bash
cd backend
NODE_ENV=production PORT=5000 DATABASE_URL=... JWT_SECRET=... CORS_ORIGIN=https://example.com node dist/index.js

cd frontend
VITE_API_URL=/api/v1 npm run build
# Serve frontend/dist/ with any static server (nginx, Python http.server, etc.)
```

### Nginx

```nginx
server {
    listen 80;
    server_name example.com;

    # Frontend static files
    root /path/to/frontend/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Asset caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker (example — create your own Dockerfile)

```dockerfile
# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/ .
RUN npm install && npm run build
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

```dockerfile
# Frontend Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/ .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
```

### Vercel

A `frontend/vercel.json` is provided for SPA routing on Vercel. This is **optional** — the frontend builds to plain static files and works with any static host.

## Startup Verification

```bash
# 1. Start the backend
cd backend
npm run build && npm start

# 2. Build the frontend
cd frontend
npm run build

# 3. Serve frontend static files
npx serve frontend/dist -l 3000

# 4. Verify
curl http://localhost:5000/api/v1/health
# {"success":true,"message":"Fleet Financial Dashboard API is running",...}
```

## Platform Independence Notes

| Concern | Status |
|---------|--------|
| Vercel lock-in | ✅ None. `vercel.json` is optional and contains deployment config only |
| Docker files | ❌ Not provided (but not required). Create your own Dockerfile per example above |
| Hardcoded paths | ✅ None. All paths are relative |
| Hardcoded URLs | ✅ None. URLs come from env vars with sensible defaults |
| Environment secrets | ✅ `.env` is gitignored. Never commit secrets |
| Build tooling | ✅ Standard `npm install && npm run build` for both projects |
| Database | ✅ PostgreSQL connection string via env var — works with any provider |
