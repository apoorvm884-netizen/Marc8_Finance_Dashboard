import { getDatabase } from '../config/database';
import { parsePagination, parseSort } from '../utils/helpers';
import { NotFoundError, ConflictError } from '../utils/errors';

export class PlatformAssignmentService {
  async create(data: {
    vehicle_id: string;
    platform_id: string;
    platform_category_id?: string | null;
    start_date: string;
    end_date?: string | null;
    notes?: string | null;
  }, createdBy?: string) {
    const db = getDatabase();

    const vehicle = await db('vehicles').where({ id: data.vehicle_id }).first();
    if (!vehicle) throw new NotFoundError('Vehicle not found');

    const platform = await db('master_values').where({ id: data.platform_id, deleted_at: null }).first();
    if (!platform) throw new NotFoundError('Platform not found');

    if (data.platform_category_id) {
      const cat = await db('master_values').where({ id: data.platform_category_id, deleted_at: null })
        .whereExists(function () {
          this.select('*').from('master_types')
            .whereRaw('master_types.id = master_values.master_type_id')
            .where('master_types.code', 'platform_category');
        }).first();
      if (!cat) throw new NotFoundError('Platform category not found');
    }

    await db('vehicle_platform_assignments')
      .where({ vehicle_id: data.vehicle_id, status: 'active' })
      .update({ status: 'ended', end_date: data.start_date });

    const [assignment] = await db('vehicle_platform_assignments').insert({
      vehicle_id: data.vehicle_id,
      platform_id: data.platform_id,
      platform_category_id: data.platform_category_id || null,
      start_date: data.start_date,
      end_date: data.end_date || null,
      notes: data.notes || null,
      created_by: createdBy || null,
    }).returning('*');

    await db('vehicles').where({ id: data.vehicle_id }).update({ active_platform_id: data.platform_id, updated_at: db.fn.now() });

    await this.addTimelineEvent(data.vehicle_id, 'platform_assigned', `Platform changed to ${platform.name}`, 'assignment', assignment.id, createdBy);

    return this.findById(assignment.id);
  }

  async findAll(query: any) {
    const db = getDatabase();
    const pagination = parsePagination(query);

    let qb = db('vehicle_platform_assignments')
      .leftJoin('vehicles', 'vehicle_platform_assignments.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as platforms', 'vehicle_platform_assignments.platform_id', 'platforms.id')
      .leftJoin('master_values as categories', 'vehicle_platform_assignments.platform_category_id', 'categories.id')
      .select(
        'vehicle_platform_assignments.*',
        'vehicles.vehicle_number', 'vehicles.vehicle_name',
        'platforms.name as platform_name',
        'categories.name as category_name'
      );

    if (query.vehicle_id) qb = qb.where('vehicle_platform_assignments.vehicle_id', query.vehicle_id);
    if (query.platform_id) qb = qb.where('vehicle_platform_assignments.platform_id', query.platform_id);
    if (query.status) qb = qb.where('vehicle_platform_assignments.status', query.status);

    const countResult = await qb.clone().count('* as count').first() as any;
    const total = Number(countResult?.count ?? 0);
    const data = await qb.orderBy('vehicle_platform_assignments.created_at', 'desc').limit(pagination.limit).offset(pagination.offset);

    return { data, meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit), hasNextPage: pagination.page * pagination.limit < total, hasPreviousPage: pagination.page > 1 } };
  }

  async findById(id: string) {
    const db = getDatabase();
    const item = await db('vehicle_platform_assignments')
      .leftJoin('vehicles', 'vehicle_platform_assignments.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as platforms', 'vehicle_platform_assignments.platform_id', 'platforms.id')
      .leftJoin('master_values as categories', 'vehicle_platform_assignments.platform_category_id', 'categories.id')
      .select(
        'vehicle_platform_assignments.*',
        'vehicles.vehicle_number', 'vehicles.vehicle_name',
        'platforms.name as platform_name',
        'categories.name as category_name'
      )
      .where('vehicle_platform_assignments.id', id).first();
    if (!item) throw new NotFoundError('Assignment not found');
    return item;
  }

  async endAssignment(id: string, data: { end_date: string; notes?: string | null }, updatedBy?: string) {
    const db = getDatabase();
    const assignment = await db('vehicle_platform_assignments').where({ id }).first();
    if (!assignment) throw new NotFoundError('Assignment not found');
    if (assignment.status === 'ended') throw new ConflictError('Assignment already ended');

    await db('vehicle_platform_assignments').where({ id }).update({
      status: 'ended',
      end_date: data.end_date,
      notes: data.notes !== undefined ? data.notes : assignment.notes,
    });

    await db('vehicles').where({ id: assignment.vehicle_id }).update({
      active_platform_id: null,
      updated_at: db.fn.now(),
    });

    await this.addTimelineEvent(assignment.vehicle_id, 'platform_ended', 'Platform assignment ended', 'assignment', id, updatedBy);

    return this.findById(id);
  }

  async getVehicleAssignmentHistory(vehicleId: string) {
    const db = getDatabase();
    return db('vehicle_platform_assignments')
      .leftJoin('master_values as platforms', 'vehicle_platform_assignments.platform_id', 'platforms.id')
      .leftJoin('master_values as categories', 'vehicle_platform_assignments.platform_category_id', 'categories.id')
      .select(
        'vehicle_platform_assignments.*',
        'platforms.name as platform_name',
        'categories.name as category_name'
      )
      .where('vehicle_platform_assignments.vehicle_id', vehicleId)
      .orderBy('vehicle_platform_assignments.created_at', 'desc');
  }

  private async addTimelineEvent(vehicleId: string, eventType: string, title: string, refType: string, refId: string, userId?: string) {
    const db = getDatabase();
    await db('vehicle_timeline_events').insert({
      vehicle_id: vehicleId,
      event_type: eventType,
      event_date: db.fn.now(),
      title,
      reference_type: refType,
      reference_id: refId,
      created_by: userId || null,
    });
  }
}

export const platformAssignmentService = new PlatformAssignmentService();
