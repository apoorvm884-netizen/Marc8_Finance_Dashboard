import { getDatabase } from '../config/database';
import { parsePagination } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import type {
  BusinessAlert, Recommendation, CreateBusinessAlertDTO, CreateRecommendationDTO,
  PaginationMeta, AlertSeverity, RecommendationPriority,
} from '../types';

export class IntelligenceService {
  async createAlert(data: CreateBusinessAlertDTO): Promise<BusinessAlert> {
    const db = getDatabase();
    const [alert] = await db('business_alerts').insert({
      alert_type: data.alert_type,
      title: data.title,
      description: data.description || null,
      severity: data.severity || 'info',
      entity_type: data.entity_type || null,
      entity_id: data.entity_id || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      created_by: data.created_by || null,
    }).returning('*');
    return alert;
  }

  async findAllAlerts(query: Record<string, string | undefined>) {
    const db = getDatabase();
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const offset = (page - 1) * limit;

    let qb = db('business_alerts').select('*');
    if (query.severity) qb = qb.where('severity', query.severity);
    if (query.alert_type) qb = qb.where('alert_type', query.alert_type);
    if (query.is_dismissed !== undefined) qb = qb.where('is_dismissed', query.is_dismissed === 'true');

    const countResult = await qb.clone().count('* as count').first() as { count: string | number };
    const total = Number(countResult?.count ?? 0);
    const data = await qb.orderBy('created_at', 'desc').limit(limit).offset(offset);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 },
    };
  }

  async dismissAlert(id: string): Promise<BusinessAlert> {
    const db = getDatabase();
    const existing = await db('business_alerts').where({ id }).first();
    if (!existing) throw new NotFoundError('Alert not found');
    const [alert] = await db('business_alerts').where({ id }).update({
      is_dismissed: true,
      is_read: true,
    }).returning('*');
    return alert;
  }

  async createRecommendation(data: CreateRecommendationDTO): Promise<Recommendation> {
    const db = getDatabase();
    const [rec] = await db('recommendations').insert({
      recommendation_type: data.recommendation_type,
      title: data.title,
      description: data.description || null,
      priority: data.priority || 'medium',
      entity_type: data.entity_type || null,
      entity_id: data.entity_id || null,
      supporting_data: data.supporting_data ? JSON.stringify(data.supporting_data) : null,
    }).returning('*');
    return rec;
  }

  async findAllRecommendations(query: Record<string, string | undefined>) {
    const db = getDatabase();
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const offset = (page - 1) * limit;

    let qb = db('recommendations').select('*');
    if (query.priority) qb = qb.where('priority', query.priority);
    if (query.status) qb = qb.where('status', query.status);
    if (query.recommendation_type) qb = qb.where('recommendation_type', query.recommendation_type);

    const countResult = await qb.clone().count('* as count').first() as { count: string | number };
    const total = Number(countResult?.count ?? 0);
    const data = await qb.orderByRaw("CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END")
      .orderBy('created_at', 'desc').limit(limit).offset(offset);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 },
    };
  }

  async actionRecommendation(id: string, userId?: string): Promise<Recommendation> {
    const db = getDatabase();
    const existing = await db('recommendations').where({ id }).first();
    if (!existing) throw new NotFoundError('Recommendation not found');
    const [rec] = await db('recommendations').where({ id }).update({
      status: 'actioned',
      actioned_at: db.fn.now(),
      actioned_by: userId || null,
    }).returning('*');
    return rec;
  }

  async dismissRecommendation(id: string): Promise<Recommendation> {
    const db = getDatabase();
    const existing = await db('recommendations').where({ id }).first();
    if (!existing) throw new NotFoundError('Recommendation not found');
    const [rec] = await db('recommendations').where({ id }).update({ status: 'dismissed' }).returning('*');
    return rec;
  }

  async generateInsights(): Promise<{ alerts_created: number; recommendations_created: number }> {
    const db = getDatabase();
    let alertsCreated = 0;
    let recommendationsCreated = 0;

    const vehicles = await db('vehicles').whereNull('deleted_at').select('id', 'vehicle_number', 'status', 'current_odometer');
    const bookings = await db('bookings').whereNull('deleted_at').select('id', 'vehicle_id', 'status', 'net_revenue', 'created_at');
    const settlements = await db('settlements').whereNull('deleted_at').select('id', 'status');
    const expenses = await db('expenses').whereNull('deleted_at').where('status', 'APPROVED').select('id', 'vehicle_id', 'amount');

    const recentBookings = bookings.filter(b =>
      new Date(b.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    );
    const bookedVehicleIds = new Set(recentBookings.map(b => b.vehicle_id));

    for (const vehicle of vehicles) {
      if (!bookedVehicleIds.has(vehicle.id) && vehicle.status !== 'INACTIVE') {
        await this.createAlert({
          alert_type: 'idle_vehicle',
          title: `Idle Vehicle: ${vehicle.vehicle_number}`,
          description: `No bookings in the last 30 days`,
          severity: 'warning',
          entity_type: 'vehicle',
          entity_id: vehicle.id,
        });
        alertsCreated++;
      }

      const vehicleExpenses = expenses.filter(e => e.vehicle_id === vehicle.id);
      const totalExpense = vehicleExpenses.reduce((s, e) => s + Number(e.amount), 0);
      if (totalExpense > 50000) {
        await this.createRecommendation({
          recommendation_type: 'review_high_maintenance',
          title: `High Maintenance: ${vehicle.vehicle_number}`,
          description: `Total expenses of ₹${totalExpense.toLocaleString('en-IN')} exceeds threshold`,
          priority: 'high',
          entity_type: 'vehicle',
          entity_id: vehicle.id,
          supporting_data: { total_expense: totalExpense, expense_count: vehicleExpenses.length },
        });
        recommendationsCreated++;
      }
    }

    const overdueSettlements = settlements.filter(s => s.status === 'pending_approval' || s.status === 'draft');
    if (overdueSettlements.length > 0) {
      await this.createAlert({
        alert_type: 'overdue_settlements',
        title: `${overdueSettlements.length} Settlement(s) Require Action`,
        description: `Settlements pending approval or in draft state`,
        severity: 'warning',
      });
      alertsCreated++;
    }

    const pendingApprovals = await db('approval_requests').where({ status: 'pending' }).count('* as count').first() as { count: string | number };
    if (Number(pendingApprovals?.count ?? 0) > 0) {
      const { count } = pendingApprovals as { count: number };
      await this.createAlert({
        alert_type: 'pending_approvals',
        title: `${count} Approval(s) Pending`,
        description: `Approval requests awaiting processing`,
        severity: 'info',
      });
      alertsCreated++;
    }

    return { alerts_created: alertsCreated, recommendations_created: recommendationsCreated };
  }
}

export const intelligenceService = new IntelligenceService();
