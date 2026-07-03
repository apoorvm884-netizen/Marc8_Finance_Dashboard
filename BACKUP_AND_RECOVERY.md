# Backup & Recovery Guide

## Overview

This document describes the backup and recovery strategy for the Marc8 Fleet Financial ERP.

## Database Backup Strategy

### Automated Backup (Recommended)

Add a cron job on the database host or as a Docker sidecar container:

```bash
# Daily backup at 2 AM
0 2 * * * pg_dump -h localhost -U postgres -d fleet_dashboard -Fc -f /backups/fleet_dashboard_$(date +\%Y\%m\%d).dump

# Keep last 30 days, remove older
0 4 * * * find /backups -name "fleet_dashboard_*.dump" -mtime +30 -delete
```

### Docker-Based Backup

Create a backup script (`scripts/backup-db.sh`):

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
docker-compose exec -T db pg_dump -U postgres fleet_dashboard -Fc > "$BACKUP_DIR/fleet_dashboard_$TIMESTAMP.dump"
echo "Backup created: $BACKUP_DIR/fleet_dashboard_$TIMESTAMP.dump"
```

### Backup Verification

Monthly restore test to verify backup integrity:

```bash
# Restore to a temporary database
createdb fleet_dashboard_restore_test
pg_restore -d fleet_dashboard_restore_test ./backups/fleet_dashboard_latest.dump
# Run health check
psql -d fleet_dashboard_restore_test -c "SELECT count(*) FROM users;"
# Clean up
dropdb fleet_dashboard_restore_test
```

## WAL Archiving (Point-in-Time Recovery)

For production, enable WAL archiving in `postgresql.conf`:

```
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backups/wal/%f'
archive_timeout = 300
```

## Restore Procedure

### Full Restore

```bash
# 1. Stop the application
docker-compose down

# 2. Drop and recreate the database
docker-compose up -d db
sleep 5
docker-compose exec -T db psql -U postgres -c "DROP DATABASE IF EXISTS fleet_dashboard;"
docker-compose exec -T db psql -U postgres -c "CREATE DATABASE fleet_dashboard;"

# 3. Restore from backup
docker-compose exec -T db pg_restore -U postgres -d fleet_dashboard -Fc < ./backups/fleet_dashboard_20260702.dump

# 4. Start the application
docker-compose up -d
```

### Migration Rollback

```bash
# Rollback last migration
npx knex migrate:down

# Rollback all migrations in the last batch
npx knex migrate:rollback

# Rollback to a specific migration
npx knex migrate:down 014_create_outstandings.ts
```

## Environment Recovery

| Scenario | Recovery Step |
|---|---|
| `.env` file lost | Recreate from `backend/.env.example`, update secrets |
| Node modules corrupted | `npm ci` in both `backend/` and `frontend/` |
| Docker state lost | `docker-compose down -v` then `docker-compose up -d` (data lost without backup) |
| Full server failure | Deploy fresh from Git, restore DB from latest backup, configure `.env` |

## Deployment Rollback

### Vercel (Frontend)

```bash
# List deployments
vercel list

# Rollback to a specific deployment
vercel rollback <deployment-url>
```

### Docker (Full Stack)

```bash
# Rollback to previous image version
docker-compose down
git checkout <previous-tag>
docker-compose up -d --build

# Or use Docker image tags
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Recovery Checklist

- [ ] Identify what failed (DB, application, network, hardware)
- [ ] Stop the application or isolate the failing component
- [ ] Assess data loss window from last validated backup
- [ ] Restore database from the most recent known-good backup
- [ ] Verify database connectivity and migration state
- [ ] Restart application services
- [ ] Run smoke tests (health endpoint, critical workflows)
- [ ] Verify data integrity (compare key metrics with backup report)
- [ ] Notify stakeholders of recovery completion
- [ ] Document the incident and recovery actions
