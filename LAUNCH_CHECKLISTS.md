# Launch Checklists — Marc8 Fleet Financial ERP v1.0

## UAT Checklist

### Authentication & Access
- [ ] Login with valid credentials (all roles)
- [ ] Login with invalid credentials shows error
- [ ] Token expiry redirects to login
- [ ] Logout clears session
- [ ] Password change flow works
- [ ] Profile update works

### Fleet Module
- [ ] Create vehicle with all fields
- [ ] Edit vehicle details
- [ ] Soft-delete and restore vehicle
- [ ] Search/filter vehicles by status, fuel type, ownership type
- [ ] Upload and view vehicle documents
- [ ] View vehicle financial summary

### Bookings
- [ ] Create booking with platform assignment
- [ ] Edit booking details
- [ ] Cancel booking
- [ ] Filter by date range, vehicle, status

### Revenue & Expenses
- [ ] Journal entry creation with ledger categories
- [ ] Expense recording with payment mode
- [ ] Expense approval workflow
- [ ] Filter by date, category, vehicle

### Outstanding
- [ ] Outstanding entry creation
- [ ] Mark as paid
- [ ] Filter by status, priority, due date
- [ ] Cash requirement forecast view

### Settlements
- [ ] Run settlement pipeline
- [ ] Approve/reject settlements
- [ ] Process payments
- [ ] View settlement dashboard metrics
- [ ] Owner vs platform settlement types

### Reports
- [ ] Generate each of 14 report types
- [ ] Apply filters to reports
- [ ] Export CSV from reports
- [ ] View report charts

### Automation
- [ ] Generate business insights
- [ ] View business alerts
- [ ] Action recommendations
- [ ] Dismiss alerts/recommendations

### Operations
- [ ] View task dashboard
- [ ] Create and assign tasks
- [ ] Approval request workflow
- [ ] View activity timeline
- [ ] SLA breach monitoring

### User Management
- [ ] Create user with role assignment
- [ ] Edit user details
- [ ] Deactivate/activate user
- [ ] Verify role-based access restrictions

---

## Smoke Test Checklist

### Backend

- [ ] `GET /api/v1/health` returns `{"status": "ok"}`
- [ ] Database connection is verified
- [ ] Auth endpoints return proper tokens
- [ ] Protected routes reject unauthenticated requests
- [ ] Protected routes enforce role authorization
- [ ] List endpoints return paginated results
- [ ] Create endpoints validate required fields
- [ ] Update endpoints return updated records
- [ ] Delete endpoints soft-delete records
- [ ] CSV export generates valid CSV
- [ ] Report generation returns structured data

### Frontend

- [ ] Application loads without console errors
- [ ] Login page renders and submits
- [ ] Dashboard shows KPI cards with data
- [ ] All sidebar navigation links resolve
- [ ] Command palette opens (Ctrl+K)
- [ ] Table sorting and pagination works
- [ ] Theme toggle works (dark/light)
- [ ] Responsive layout renders on mobile viewport
- [ ] Page transitions animate smoothly
- [ ] Empty states render when no data
- [ ] Error states render on API failure

---

## Post-Deployment Checklist

### Immediate (First 15 Minutes)

- [ ] Health endpoint returns `status: "ok"`
- [ ] All 3 services running (DB, API, Frontend)
- [ ] Login works with admin credentials
- [ ] Dashboard loads with data
- [ ] Critical workflows execute (booking → revenue → expense)
- [ ] No 500 errors in API logs
- [ ] No 404 errors in frontend console

### Short-Term (First Hour)

- [ ] All 28 frontend routes resolve correctly
- [ ] Search across all list pages works
- [ ] Filters apply correctly on each module
- [ ] Pagination works on large datasets
- [ ] Export CSV downloads valid file
- [ ] Settlement pipeline runs without error
- [ ] Report generation completes for all 14 types
- [ ] Notifications appear for triggered events

### Extended (First 24 Hours)

- [ ] Background automation runs on schedule
- [ ] Reminders are created and delivered
- [ ] No memory leak in frontend after prolonged use
- [ ] No connection pool exhaustion in backend
- [ ] Audit logs capture all CUD operations
- [ ] Error rates remain below threshold

---

## Rollback Checklist

- [ ] Identify the scope of rollback (frontend only, backend, DB, full)
- [ ] Notify stakeholders of rollback decision
- [ ] If DB rollback: stop all services to prevent data divergence
- [ ] Restore database from pre-deployment backup
- [ ] Revert application code to previous version
- [ ] Verify rollback (run smoke tests)
- [ ] Document reason for rollback
- [ ] Schedule post-mortem

### Quick Rollback Commands

```bash
# Frontend only (Vercel)
vercel rollback <deployment-id>

# Full Docker stack
docker-compose down
git checkout <previous-tag>
docker-compose up -d --build

# Database (destructive — data loss)
pg_restore -U postgres -d fleet_dashboard -Fc < backup_file.dump
```

---

## Go/No-Go Checklist

### Prerequisites

- [ ] All UAT test cases pass (sign off from QA lead)
- [ ] No CRITICAL or HIGH security findings open
- [ ] Backend TypeScript compiles with 0 errors
- [ ] Frontend build completes with 0 errors
- [ ] Database migrations run cleanly
- [ ] Environment variables configured for production
- [ ] SSL/TLS certificates installed and valid
- [ ] CORS origin configured for production domain
- [ ] Rate limiting configured for production traffic
- [ ] JWT_SECRET is a strong, unique value

### Operational Readiness

- [ ] Database backup strategy in place and verified
- [ ] Monitoring/alerting configured (health endpoint)
- [ ] Rollback procedure documented and understood
- [ ] On-call engineer assigned for first 24 hours
- [ ] Stakeholders notified of release window
- [ ] Communication channel established for incident reporting

### Final Decision

- [ ] **GO** — All checks pass
- [ ] **CONDITIONAL GO** — Issues identified, mitigated, documented
- [ ] **NO GO** — Blocking issue found (list below)

### Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| Engineering Lead | | | |
| QA Lead | | | |
| Product Owner | | | |
| Operations | | | |
