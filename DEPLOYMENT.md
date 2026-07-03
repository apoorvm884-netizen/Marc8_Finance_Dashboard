# Deployment Guide

## Architecture Overview

```
                         ┌──────────────┐
                         │   Frontend   │
                         │  (Vite/React)│
                         └──────┬───────┘
                                │ HTTPS
                         ┌──────▼───────┐
                         │   Backend    │
                         │  (Express)   │
                         └──────┬───────┘
                                │ TCP
                         ┌──────▼───────┐
                         │  PostgreSQL  │
                         └──────────────┘
```

## Frontend Deployment (Vercel Recommended)

### 1. Build

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

### 2. Environment Variables (Vercel)

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-api-domain.com/api` |

### 3. Vercel Configuration

A `vercel.json` is already configured at `frontend/vercel.json` with SPA fallback routing.

### 4. Manual Build Verification

```bash
# Preview the production build locally
npm run preview
```

## Backend Deployment

### 1. Build

```bash
cd backend
npm run build
```

Output: `backend/dist/`

### 2. Environment Variables

Set all variables from `.env.example`. In production:

| Variable | Recommendation |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Generate a strong 64-char random string |
| `LOG_LEVEL` | `warn` or `error` |
| `CORS_ORIGIN` | Your frontend domain |
| `RATE_LIMIT_WINDOW` | `15` |
| `RATE_LIMIT_MAX` | `100` |

### 3. Process Manager (Production)

Use PM2 or a systemd service:

```bash
# PM2
npm install -g pm2
pm2 start dist/index.js --name fleet-api
pm2 save
pm2 startup
```

### 4. Reverse Proxy (Nginx Example)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Deployment

### 1. Managed PostgreSQL (Recommended)

Use a managed provider (Supabase, Render, AWS RDS, Railway).

### 2. Run Migrations

```bash
cd backend
DATABASE_URL=postgresql://user:pass@host:5432/db npx knex migrate:latest
```

### 3. Seed Data (First Deploy Only)

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db npx knex seed:run
```

**Do not run seeds on existing production databases.**

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Admin user created and password changed
- [ ] CORS origin matches frontend domain
- [ ] JWT_SECRET is a strong, unique value
- [ ] SSL/TLS enabled on reverse proxy
- [ ] Rate limiting configured
- [ ] Logging level set to `warn` or `error`
- [ ] Frontend API URL points to backend domain
- [ ] Health check endpoint responds: `GET /api/v1/health`

## Health Check

```bash
curl https://your-api-domain.com/api/v1/health
# Expected: { "success": true, "message": "OK", "timestamp": "..." }
```
