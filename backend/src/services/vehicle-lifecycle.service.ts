import { getDatabase } from '../config/database';
import { NotFoundError } from '../utils/errors';

export class VehicleLifecycleService {
  async getTimeline(vehicleId: string) {
    const db = getDatabase();
    const vehicle = await db('vehicles').where({ id: vehicleId }).first();
    if (!vehicle) throw new NotFoundError('Vehicle not found');

    const dbEvents = await db('vehicle_timeline_events')
      .where({ vehicle_id: vehicleId })
      .orderBy('event_date', 'desc')
      .limit(100);

    const purchaseEvent = {
      id: 'purchase',
      vehicle_id: vehicleId,
      event_type: 'vehicle_purchased',
      event_date: vehicle.purchase_date || vehicle.created_at,
      title: `Vehicle Purchased - ${vehicle.vehicle_number}`,
      description: `Purchase price: ₹${Number(vehicle.purchase_price || 0).toLocaleString('en-IN')}`,
      reference_type: 'vehicle',
      reference_id: vehicleId,
      metadata: null,
      created_at: vehicle.created_at,
    };

    return [purchaseEvent, ...dbEvents];
  }

  async addEvent(data: {
    vehicle_id: string;
    event_type: string;
    event_date: string;
    title: string;
    description?: string | null;
    reference_type?: string | null;
    reference_id?: string | null;
    metadata?: Record<string, unknown> | null;
  }, createdBy?: string) {
    const db = getDatabase();
    const vehicle = await db('vehicles').where({ id: data.vehicle_id }).first();
    if (!vehicle) throw new NotFoundError('Vehicle not found');

    const [event] = await db('vehicle_timeline_events').insert({
      vehicle_id: data.vehicle_id,
      event_type: data.event_type,
      event_date: data.event_date,
      title: data.title,
      description: data.description || null,
      reference_type: data.reference_type || null,
      reference_id: data.reference_id || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      created_by: createdBy || null,
    }).returning('*');

    return event;
  }

  async getVehicleIntelligence(vehicleId: string) {
    const db = getDatabase();

    const [vehicle, revenueResult, expenseResult, outstandingResult, maintResult, assignments, timeline] = await Promise.all([
      db('vehicles').where({ id: vehicleId }).first(),
      db('bookings').whereNull('deleted_at').where('vehicle_id', vehicleId).whereIn('status', ['COMPLETED', 'CONFIRMED']).sum('net_revenue as total').first(),
      db('expenses').whereNull('deleted_at').where('vehicle_id', vehicleId).whereIn('status', ['APPROVED', 'REIMBURSED']).sum('amount as total').first(),
      db('outstandings').whereNull('deleted_at').where('vehicle_id', vehicleId).whereNotIn('status', ['paid', 'cancelled']).sum('amount as total').first(),
      db('maintenance_records').whereNull('deleted_at').where('vehicle_id', vehicleId).sum('cost as total').first(),
      db('vehicle_platform_assignments').leftJoin('master_values as platforms', 'vehicle_platform_assignments.platform_id', 'platforms.id')
        .select('vehicle_platform_assignments.*', 'platforms.name as platform_name')
        .where('vehicle_platform_assignments.vehicle_id', vehicleId).orderBy('created_at', 'desc'),
      this.getTimeline(vehicleId),
    ]);

    if (!vehicle) throw new NotFoundError('Vehicle not found');

    const revenue = Math.round(Number(revenueResult?.total ?? 0) * 100) / 100;
    const expense = Math.round(Number(expenseResult?.total ?? 0) * 100) / 100;
    const outstanding = Math.round(Number(outstandingResult?.total ?? 0) * 100) / 100;
    const maintenanceCost = Math.round(Number(maintResult?.total ?? 0) * 100) / 100;
    const profit = Math.round((revenue - expense) * 100) / 100;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 10000) / 100 : 0;

    const docStatus = {
      insurance: { date: vehicle.insurance_expiry, status: this.getDocStatus(vehicle.insurance_expiry) },
      permit: { date: vehicle.permit_expiry, status: this.getDocStatus(vehicle.permit_expiry) },
      road_tax: { date: vehicle.road_tax_expiry, status: this.getDocStatus(vehicle.road_tax_expiry) },
      fitness: { date: vehicle.fitness_expiry, status: this.getDocStatus(vehicle.fitness_expiry) },
      pollution: { date: vehicle.pollution_expiry, status: this.getDocStatus(vehicle.pollution_expiry) },
      rc: { date: vehicle.rc_expiry, status: this.getDocStatus(vehicle.rc_expiry) },
    };

    const expiredCount = Object.values(docStatus).filter((d: any) => d.status === 'expired').length;
    const totalDocs = Object.values(docStatus).filter((d: any) => d.date !== null).length;
    const healthScore = totalDocs > 0
      ? Math.round(((totalDocs - expiredCount) / totalDocs) * 60 + 40)
      : 70;

    return {
      vehicle: { id: vehicle.id, vehicle_number: vehicle.vehicle_number, vehicle_name: vehicle.vehicle_name, status: vehicle.status },
      revenue, expense, outstanding, maintenance_cost: maintenanceCost, profit, margin,
      document_status: docStatus,
      health_score: Math.min(100, healthScore),
      platform_history: assignments,
      service_history: timeline.filter((e: any) => e.event_type === 'maintenance_completed'),
      timeline,
    };
  }

  private getDocStatus(date: string | null): 'valid' | 'expiring_soon' | 'expired' | 'not_set' {
    if (!date) return 'not_set';
    const now = new Date();
    const docDate = new Date(date);
    const in30Days = new Date(now.getTime() + 30 * 86400000);
    if (docDate < now) return 'expired';
    if (docDate <= in30Days) return 'expiring_soon';
    return 'valid';
  }
}

export const vehicleLifecycleService = new VehicleLifecycleService();
