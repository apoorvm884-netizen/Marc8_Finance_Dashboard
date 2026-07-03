import { getDatabase } from '../../config/database';
import { expenseService } from './expense.service';
import { outstandingService } from '../outstanding.service';

interface VehicleExpiryRecord {
  id: string;
  vehicle_number: string;
  vehicle_name: string;
  insurance_expiry: string | null;
  permit_expiry: string | null;
  road_tax_expiry: string | null;
  fitness_expiry: string | null;
  pollution_expiry: string | null;
  rc_expiry: string | null;
}

interface ExpiryAlertItem {
  vehicle_id: string;
  vehicle_number: string;
  expiry_date: string;
}

export class NotificationEngineService {
  async getExpiryAlerts(daysBefore: number = 30): Promise<{
    insurance: ExpiryAlertItem[];
    permit: ExpiryAlertItem[];
    road_tax: ExpiryAlertItem[];
    fitness: ExpiryAlertItem[];
    pollution: ExpiryAlertItem[];
    rc: ExpiryAlertItem[];
  }> {
    const db = getDatabase();
    const now = new Date();
    const warningDate = new Date(now.getTime() + daysBefore * 86400000).toISOString();

    const vehicles: VehicleExpiryRecord[] = await db('vehicles')
      .whereNull('deleted_at')
      .select(
        'id',
        'vehicle_number',
        'vehicle_name',
        'insurance_expiry',
        'permit_expiry',
        'road_tax_expiry',
        'fitness_expiry',
        'pollution_expiry',
        'rc_expiry'
      );

    const filterByExpiry = (field: keyof VehicleExpiryRecord): ExpiryAlertItem[] =>
      vehicles
        .filter((v) => {
          const date = v[field] as string | null;
          return date && date <= warningDate && date >= now.toISOString();
        })
        .map((v) => ({ vehicle_id: v.id, vehicle_number: v.vehicle_number, expiry_date: v[field] as string }));

    return {
      insurance: filterByExpiry('insurance_expiry'),
      permit: filterByExpiry('permit_expiry'),
      road_tax: filterByExpiry('road_tax_expiry'),
      fitness: filterByExpiry('fitness_expiry'),
      pollution: filterByExpiry('pollution_expiry'),
      rc: filterByExpiry('rc_expiry'),
    };
  }

  async getDashboardNotifications(): Promise<{
    expiring: { type: string; count: number; items: ExpiryAlertItem[] }[];
    refunded_bookings: number;
    cancelled_bookings: number;
    large_expenses: number;
    outstanding_collections: number;
    outstanding_alerts: {
      due_today: number;
      overdue: { count: number; amount: number };
      upcoming_large: { title: string; amount: number }[];
    };
  }> {
    const db = getDatabase();
    const [expiryAlerts, refunded, cancelled, largeExpenses, outstanding, planner, dueToday] = await Promise.all([
      this.getExpiryAlerts(30),
      db('bookings').whereNull('deleted_at').where('status', 'REFUNDED').count('* as count').first(),
      db('bookings').whereNull('deleted_at').where('status', 'CANCELLED').count('* as count').first(),
      expenseService.getLargeExpenses(10000),
      this.getTotalOutstanding(),
      outstandingService.getPaymentPlanner(),
      db('outstandings')
        .whereNull('deleted_at')
        .where('status', 'due_today')
        .count('* as count').first(),
    ]);

    const expiring = [
      { type: 'Insurance Expiring', count: expiryAlerts.insurance.length, items: expiryAlerts.insurance },
      { type: 'Permit Expiring', count: expiryAlerts.permit.length, items: expiryAlerts.permit },
      { type: 'Road Tax Due', count: expiryAlerts.road_tax.length, items: expiryAlerts.road_tax },
      { type: 'Fitness Due', count: expiryAlerts.fitness.length, items: expiryAlerts.fitness },
      { type: 'Pollution Due', count: expiryAlerts.pollution.length, items: expiryAlerts.pollution },
      { type: 'RC Due', count: expiryAlerts.rc.length, items: expiryAlerts.rc },
    ].filter(e => e.count > 0);

    const overdueCount = await db('outstandings')
      .whereNull('deleted_at')
      .where('status', 'overdue')
      .count('* as count').first()
      .then((r: any) => Number(r?.count ?? 0));

    const upcomingLarge = await db('outstandings')
      .whereNull('deleted_at')
      .whereNotIn('status', ['paid', 'cancelled'])
      .where('due_date', '>=', new Date().toISOString().split('T')[0])
      .orderBy('amount', 'desc')
      .limit(3)
      .select('title', 'amount');

    return {
      expiring,
      refunded_bookings: Number(refunded?.count ?? 0),
      cancelled_bookings: Number(cancelled?.count ?? 0),
      large_expenses: largeExpenses.length,
      outstanding_collections: outstanding,
      outstanding_alerts: {
        due_today: Number(dueToday?.count ?? 0),
        overdue: { count: overdueCount, amount: planner.overdue_amount },
        upcoming_large: upcomingLarge.map((r: any) => ({ title: r.title, amount: Math.round(Number(r.amount) * 100) / 100 })),
      },
    };
  }

  private async getTotalOutstanding(): Promise<number> {
    const db = getDatabase();
    const [result] = await db.raw(
      `SELECT COALESCE(SUM(total_amount - amount_collected), 0) as total
       FROM journal_entries
       WHERE deleted_at IS NULL AND status = 'PENDING'`
    );
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }
}

export const notificationEngineService = new NotificationEngineService();
