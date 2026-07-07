# Getting Started with Marc8 Fleet Financial Dashboard

This guide walks you through every step from cloning the repo to running the app — no prior knowledge of the project required.

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/apoorvm884-netizen/Marc8_Finance_Dashboard.git
cd Marc8_Finance_Dashboard
```

## Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

This installs React, Vite, Tailwind CSS, and all other frontend dependencies. (~180 packages)

## Step 3: Start the Frontend (No Backend Needed)

```bash
npm run dev
```

You should see:
```
VITE v8.1.0  ready in 150ms
➜  Local:   http://localhost:3000/
```

Open `http://localhost:3000` in your browser.

## Step 4: Login with Developer Credentials

On the login page, enter:

| Field | Value |
|---|---|
| **Username** | `developer@marc8.local` |
| **Password** | `Marc8@Demo123` |

Click **Sign in**.

> **Why this works:** The app intercepts these specific credentials and loads built-in demo data — no backend server or database required.

## Step 5: Explore the Dashboard

After logging in you'll see:

- **Dashboard tab** — Financial KPIs, revenue/expense charts
- **Navigation sidebar** — Access all modules: Bookings, Expenses, Journal, Vehicles, Vendors, Reports, Analytics, and more
- **Dark finance theme** — All data is realistic sample data

Try clicking through different modules to see the demo data in action.

## Step 6: Run Tests

```bash
# Frontend tests (7 tests)
npm test

# With coverage
npm run test:coverage
```

```bash
# Backend tests (32 tests)
cd ../backend
npm install
npm test
```

## Step 7: Build for Production

```bash
cd ../frontend
npm run build
```

Output goes to `frontend/dist/`. This is a static site — deploy it to any static hosting (GitHub Pages, Vercel, Netlify, etc.).

## Step 8: Set Up the Backend (Optional)

When you're ready to connect a real backend:

1. **Install PostgreSQL** (version 15+) and create a database

2. **Configure the backend:**
   ```bash
   cd ../backend
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   npm install
   npx knex migrate:latest
   npx knex seed:run
   npm run dev
   ```

3. **Configure the frontend to use the backend:**
   Create `frontend/.env`:
   ```
   VITE_API_URL=http://localhost:5000/api/v1
   ```
   Then restart the frontend.

4. **Remove the temporary developer login:**
   In `frontend/src/providers/auth-provider.tsx`, delete the two `TEMPORARY DEVELOPER DEMO LOGIN` blocks.

## Troubleshooting

| Problem | Solution |
|---|---|
| `npm install` fails | Use Node.js 20+ (check with `node --version`) |
| `npm run dev` fails | Delete `node_modules` and `package-lock.json`, run `npm install` again |
| Login button does nothing | Open browser DevTools Console — check for the demo data import warning |
| Blank white page | Check the Console tab for errors. The login page should load at `/` |
| "Failed to fetch" errors | You're not using the dev login — make sure you entered the exact credentials above |
| Port 3000 is in use | Edit `frontend/vite.config.ts` → `server.port` to a different number |
| Backend connection refused | Backend is not running. Use the Developer Demo Login instead. |

## Quick Command Reference

```bash
# I want to...
npm run dev              # Start the frontend dev server
npm run build            # Build the frontend for production
npm test                 # Run frontend tests
npm run test:watch       # Run tests in watch mode
npm run lint             # Lint the frontend code
npm run typecheck        # Type check the frontend
cd backend && npm run dev    # Start the backend server
```

## Need Help?

- **Project overview:** See `README.md`
- **Folder structure:** See `PROJECT_MAP.md`
- **Deployment:** See `DEPLOYMENT.md`
- **Engineering standards:** See `ENGINEERING_STANDARDS.md`
- **Database schema:** See `DATABASE_SCHEMA.md`
- **Contributing:** See `CONTRIBUTING.md`
