import { getDatabase } from '../config/database';
import { parsePagination } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';

export class SchedulerService {
  async create(data: {
    vehicle_id: string;
    service_type: string;
    interval_km?: number | null;
    interval_days?: number | null;
    last_service_km?: number | null;
    last_service_date?: string | null;
    is_recurring?: boolean;
    notes?: string | null;
  }, createdBy?: string) {
    const db = getDatabase();
    const vehicle = await db('vehicles').where({ id: data.vehicle_id }).first();
    if (!vehicle) throw new NotFoundError('Vehicle not found');

    const nextServiceKm = data.interval_km && data.last_service_km
      ? data.last_service_km + data.interval_km : (data.interval_km || null);
    const nextServiceDate = data.interval_days && data.last_service_date
      ? new Date(new Date(data.last_service_date).getTime() + data.interval_days * 86400000).toISOString().split('T')[0]
      : null;

    const [schedule] = await db('service_schedules').insert({
      vehicle_id: data.vehicle_id,
      service_type: data.service_type || 'both',
      interval_km: data.interval_km || null,
      interval_days: data.interval_days || null,
      last_service_km: data.last_service_km || null,
      last_service_date: data.last_service_date || null,
      next_service_km: nextServiceKm,
      next_service_date: nextServiceDate,
      is_recurring: data.is_recurring !== false,
      notes: data.notes || null,
      status: 'active',
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');

    return this.findById(schedule.id);
  }

  async findAll(query: any) {
    const db = getDatabase();
    const pagination = parsePagination(query);

    let qb = db('service_schedules')
      .leftJoin('vehicles', 'service_schedules.vehicle_id', 'vehicles.id')
      .select('service_schedules.*', 'vehicles.vehicle_number', 'vehicles.vehicle_name', 'vehicles.current_odometer');

    if (query.include_deleted !== 'true') qb = qb.whereNull('service_schedules.deleted_at');
    if (query.vehicle_id) qb = qb.where('service_schedules.vehicle_id', query.vehicle_id);
    if (query.status) qb = qb.where('service_schedules.status', query.status);

    const countResult = await qb.clone().count('* as count').first() as any;
    const total = Number(countResult?.count ?? 0);
    const data = await qb.orderBy('service_schedules.next_service_date', 'asc').limit(pagination.limit).offset(pagination.offset);

    return { data, meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit), hasNextPage: pagination.page * pagination.limit < total, hasPreviousPage: pagination.page > 1 } };
  }

  async findById(id: string) {
    const db = getDatabase();
    const item = await db('service_schedules')
      .leftJoin('vehicles', 'service_schedules.vehicle_id', 'vehicles.id')
      .select('service_schedules.*', 'vehicles.vehicle_number', 'vehicles.vehicle_name', 'vehicles.current_odometer')
      .where('service_schedules.id', id).whereNull('service_schedules.deleted_at').first();
    if (!item) throw new NotFoundError('Schedule not found');
    return item;
  }

  async update(id: string, data: any, updatedBy?: string) {
    const db = getDatabase();
    const schedule = await db('service_schedules').where({ id }).first();
    if (!schedule) throw new NotFoundError('Schedule not found');

    const updateData: any = { updated_at: db.fn.now(), updated_by: updatedBy || null };
    const fields = ['service_type', 'interval_km', 'interval_days', 'last_service_km', 'last_service_date',
      'next_service_km', 'next_service_date', 'is_recurring', 'notes', 'status'] as const;
    for (const f of fields) {
      if (data[f] !== undefined) updateData[f] = data[f];
    }

    await db('service_schedules').where({ id }).update(updateData);
    return this.findById(id);
  }

  async delete(id: string, deletedBy?: string) {
    const db = getDatabase();
    const schedule = await db('service_schedules').where({ id }).first();
    if (!schedule) throw new NotFoundError('Schedule not found');
    await db('service_schedules').where({ id }).update({
      deleted_at: db.fn.now(), deleted_by: deletedBy || null, updated_at: db.fn.now(),
    });
    return { message: 'Schedule deleted' };
  }

  async getUpcomingServices() {
    const db = getDatabase();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const in7Days = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];
    const in30Days = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];

    const schedules = await db('service_schedules')
      .leftJoin('vehicles', 'service_schedules.vehicle_id', 'vehicles.id')
      .select('service_schedules.*', 'vehicles.vehicle_number', 'vehicles.vehicle_name', 'vehicles.current_odometer')
      .whereNull('service_schedules.deleted_at').where('service_schedules.status', 'active');

    const upcoming = schedules.filter((s: any) => {
      const dateDue = s.next_service_date && s.next_service_date >= today && s.next_service_date <= in30Days;
      const kmDue = s.next_service_km && s.current_odometer && s.next_service_km <= s.current_odometer + 500;
      return dateDue || kmDue;
    });

    const overdue = schedules.filter((s: any) => {
      const dateOverdue = s.next_service_date && s.next_service_date < today;
      const kmOverdue = s.next_service_km && s.current_odometer && s.next_service_km <= s.current_odometer;
      return dateOverdue || kmOverdue;
    });

    return {
      upcoming: upcoming.map((s: any) => ({
        ...s,
        days_remaining: s.next_service_date ? Math.ceil((new Date(s.next_service_date).getTime() - now.getTime()) / 86400000) : null,
        km_remaining: s.next_service_km && s.current_odometer ? s.next_service_km - s.current_odometer : null,
      })),
      overdue: overdue.map((s: any) => ({
        ...s,
        days_overdue: s.next_service_date ? Math.ceil((now.getTime() - new Date(s.next_service_date).getTime()) / 86400000) : null,
        km_overdue: s.next_service_km && s.current_odometer ? s.current_odometer - s.next_service_km : null,
      })),
      next_7_days: schedules.filter((s: any) =>
        s.next_service_date && s.next_service_date >= today && s.next_service_date <= in7Days
      ).length,
      next_30_days: upcoming.length,
    };
  }
}

export const schedulerService = new SchedulerService();
