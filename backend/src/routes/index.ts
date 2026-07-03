import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import vehicleRoutes from './vehicle.routes';
import masterRoutes from './master.routes';
import bookingRoutes from './booking.routes';
import journalRoutes from './journal.routes';
import expenseRoutes from './expense.routes';
import dashboardRoutes from './dashboard.routes';
import analyticsRoutes from './analytics.routes';
import reportRoutes from './report.routes';
import settingsRoutes from './settings.routes';
import outstandingRoutes from './outstanding.routes';
import { notificationRoutes, reminderRoutes } from './notification.routes';
import vendorRoutes from './vendor.routes';
import platformAssignmentRoutes from './platform-assignment.routes';
import maintenanceRoutes from './maintenance.routes';
import vehicleLifecycleRoutes from './vehicle-lifecycle.routes';
import schedulerRoutes from './scheduler.routes';
import vehicleOwnerRoutes from './vehicle-owner.routes';
import settlementRoutes from './settlement.routes';
import workflowRoutes from './workflow.routes';
import approvalRoutes from './approval.routes';
import taskRoutes from './task.routes';
import slaRoutes from './sla.routes';
import escalationRoutes from './escalation.routes';
import activityRoutes from './activity.routes';
import automationRoutes from './automation.routes';
import jobSchedulerRoutes from './job-scheduler.routes';
import intelligenceRoutes from './intelligence.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/masters', masterRoutes);
router.use('/bookings', bookingRoutes);
router.use('/journal', journalRoutes);
router.use('/expenses', expenseRoutes);
router.use('/outstandings', outstandingRoutes);
router.use('/vendors', vendorRoutes);
router.use('/platform-assignments', platformAssignmentRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/vehicle-lifecycle', vehicleLifecycleRoutes);
router.use('/service-schedules', schedulerRoutes);
router.use('/vehicle-owners', vehicleOwnerRoutes);
router.use('/settlements', settlementRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reminders', reminderRoutes);
router.use('/workflows', workflowRoutes);
router.use('/approvals', approvalRoutes);
router.use('/tasks', taskRoutes);
router.use('/sla', slaRoutes);
router.use('/escalations', escalationRoutes);
router.use('/activity', activityRoutes);
router.use('/automation', automationRoutes);
router.use('/scheduler', jobSchedulerRoutes);
router.use('/intelligence', intelligenceRoutes);

import { checkDatabaseConnection } from '../config/database';

router.get('/health', async (_req, res) => {
  const dbOk = await checkDatabaseConnection();
  const status = dbOk ? 'ok' : 'degraded';
  res.status(dbOk ? 200 : 503).json({
    status,
    message: dbOk ? 'Fleet Financial Dashboard API is running' : 'Database connection failed',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: { database: dbOk ? 'connected' : 'disconnected' },
  });
});

export default router;
