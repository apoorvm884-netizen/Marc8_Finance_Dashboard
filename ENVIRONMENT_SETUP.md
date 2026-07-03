# Environment Setup

## Prerequisites

| Dependency | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Runtime |
| PostgreSQL | 15+ | Database |
| npm | 9+ | Package manager |

## Backend Configuration

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/fleet_financial_dashboard` |
| `JWT_SECRET` | JWT signing key | (change for production) |
| `JWT_EXPIRES_IN` | Token expiry | `24h` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW` | Rate limit window (minutes) | `15` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `LOG_LEVEL` | Winston log level | `debug` |

## Frontend Configuration

No `.env` file is required for the frontend. The Vite proxy in `vite.config.ts` forwards `/api` requests to `http://localhost:5000`.

For production builds, set:
```bash
VITE_API_URL=https://your-api-domain.com/api
```

## Database Setup

```bash
# Create the database
createdb fleet_financial_dashboard

# Run migrations
cd backend
npx knex migrate:latest

# Seed admin user and master data
npx knex seed:run
```

Default admin credentials after seeding:
- Username: `admin`
- Password: `Admin@123`

**Change password immediately on first login.**

## Node.js Version Management

Use `nvm` (Node Version Manager) to ensure the correct Node.js version:

```bash
nvm install 20
nvm use 20
```

## Troubleshooting

### Database Connection Failed
Verify PostgreSQL is running:
```bash
pg_isready
```

### Port Already in Use
```bash
# Check what's using port 5000
lsof -i :5000
# Kill the process if needed
kill -9 <PID>
```

### Module Not Found
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
```
