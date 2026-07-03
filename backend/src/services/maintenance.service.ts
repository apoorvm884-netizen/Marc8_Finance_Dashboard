import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';

const MAINTENANCE_ALLOWED_SORT_FIELDS = ['service_date', 'cost', 'created_at'] as const;

export class MaintenanceService {
  async create(data: any, createdBy?: string) {
    const db = getDatabase();

    const vehicle = await db('vehicles').where({ id: data.vehicle_id }).first();
    if (!vehicle) throw new NotFoundError('Vehicle not found');

    const maintType = await db('master_values').where({ id: data.maintenance_type_id, deleted_at: null })
      .whereExists(function () {
        this.select('*').from('master_types')
          .whereRaw('master_types.id = master_values.master_type_id')
          .where('master_types.code', 'maintenance_type');
      }).first();
    if (!maintType) throw new NotFoundError('Maintenance type not found');

    if (data.vendor_id) {
      const vendor = await db('vendors').where({ id: data.vendor_id }).first();
      if (!vendor) throw new NotFoundError('Vendor not found');
    }

    const [record] = await db('maintenance_records').insert({
      vehicle_id: data.vehicle_id,
      vendor_id: data.vendor_id || null,
      maintenance_type_id: data.maintenance_type_id,
      service_date: data.service_date,
      odometer_reading: data.odometer_reading || null,
      description: data.description || null,
      cost: data.cost,
      vendor_invoice: data.vendor_invoice || null,
      warranty_months: data.warranty_months || null,
      status: data.status || 'completed',
      notes: data.notes || null,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');

    if (data.parts && Array.isArray(data.parts) && data.parts.length > 0) {
      const partsData = data.parts.map((p: any) => ({
        maintenance_record_id: record.id,
        part_category_id: p.part_category_id || null,
        part_name: p.part_name,
        brand: p.brand || null,
        vendor: p.vendor || null,
        quantity: p.quantity || 1,
        unit_price: p.unit_price,
        total_price: p.total_price ?? (p.unit_price * (p.quantity || 1)),
        warranty_months: p.warranty_months || null,
        invoice_number: p.invoice_number || null,
        notes: p.notes || null,
      }));
      await db('maintenance_parts').insert(partsData);
    }

    if (data.odometer_reading) {
      await db('vehicles').where({ id: data.vehicle_id }).update({
        current_odometer: data.odometer_reading,
        updated_at: db.fn.now(),
      });
    }

    if (data.status === 'completed') {
      await db('vehicles').where({ id: data.vehicle_id }).where('status', 'MAINTENANCE').update({
        status: 'AVAILABLE',
        updated_at: db.fn.now(),
      });
    }

    await this.addTimelineEvent(data.vehicle_id, 'maintenance_completed',
      `Maintenance: ${maintType.name} - ₹${data.cost}`, 'maintenance', record.id, createdBy);

    return this.findById(record.id);
  }

  async findAll(query: any) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...MAINTENANCE_ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['vehicle_id', 'vendor_id', 'maintenance_type_id', 'status', 'search']);

    let qb = db('maintenance_records')
      .leftJoin('vehicles', 'maintenance_records.vehicle_id', 'vehicles.id')
      .leftJoin('vendors', 'maintenance_records.vendor_id', 'vendors.id')
      .leftJoin('master_values as types', 'maintenance_records.maintenance_type_id', 'types.id')
      .select(
        'maintenance_records.*',
        'vehicles.vehicle_number', 'vehicles.vehicle_name',
        'vendors.name as vendor_name',
        'types.name as maintenance_type_name',
        'types.color as maintenance_type_color'
      );

    if (query.include_deleted !== 'true') qb = qb.whereNull('maintenance_records.deleted_at');
    if (filters.vehicle_id) qb = qb.where('maintenance_records.vehicle_id', filters.vehicle_id);
    if (filters.vendor_id) qb = qb.where('maintenance_records.vendor_id', filters.vendor_id);
    if (filters.maintenance_type_id) qb = qb.where('maintenance_records.maintenance_type_id', filters.maintenance_type_id);
    if (filters.status) qb = qb.where('maintenance_records.status', filters.status);
    if (query.date_from) qb = qb.where('maintenance_records.service_date', '>=', query.date_from);
    if (query.date_to) qb = qb.where('maintenance_records.service_date', '<=', query.date_to);

    if (filters.search) {
      qb = qb.where(function () {
        this.where('vehicles.vehicle_number', 'ilike', `%${filters.search}%`)
          .orWhere('vendors.name', 'ilike', `%${filters.search}%`)
          .orWhere('types.name', 'ilike', `%${filters.search}%`);
      });
    }

    const countResult = await qb.clone().count('* as count').first() as any;
    const total = Number(countResult?.count ?? 0);
    const data = await qb.orderBy(sort.column, sort.order).limit(pagination.limit).offset(pagination.offset);

    const recordsWithParts = await Promise.all(data.map(async (r: any) => {
      const parts = await db('maintenance_parts').where({ maintenance_record_id: r.id });
      return { ...r, parts };
    }));

    return { data: recordsWithParts, meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit), hasNextPage: pagination.page * pagination.limit < total, hasPreviousPage: pagination.page > 1 } };
  }

  async findById(id: string) {
    const db = getDatabase();
    const record = await db('maintenance_records')
      .leftJoin('vehicles', 'maintenance_records.vehicle_id', 'vehicles.id')
      .leftJoin('vendors', 'maintenance_records.vendor_id', 'vendors.id')
      .leftJoin('master_values as types', 'maintenance_records.maintenance_type_id', 'types.id')
      .select(
        'maintenance_records.*',
        'vehicles.vehicle_number', 'vehicles.vehicle_name',
        'vendors.name as vendor_name',
        'types.name as maintenance_type_name',
        'types.color as maintenance_type_color'
      )
      .where('maintenance_records.id', id).whereNull('maintenance_records.deleted_at').first();
    if (!record) throw new NotFoundError('Maintenance record not found');
    const parts = await db('maintenance_parts').where({ maintenance_record_id: id });
    return { ...record, parts };
  }

  async update(id: string, data: any, updatedBy?: string) {
    const db = getDatabase();
    const record = await db('maintenance_records').where({ id }).first();
    if (!record) throw new NotFoundError('Maintenance record not found');

    const updateFields = ['vendor_id', 'maintenance_type_id', 'service_date', 'odometer_reading',
      'description', 'cost', 'vendor_invoice', 'warranty_months', 'status', 'notes'] as const;

    const updateData: any = { updated_at: db.fn.now(), updated_by: updatedBy || null };
    for (const field of updateFields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }

    await db('maintenance_records').where({ id }).update(updateData);
    return this.findById(id);
  }

  async delete(id: string, deletedBy?: string) {
    const db = getDatabase();
    const record = await db('maintenance_records').where({ id }).first();
    if (!record) throw new NotFoundError('Maintenance record not found');
    await db('maintenance_records').where({ id }).update({
      deleted_at: db.fn.now(), deleted_by: deletedBy || null, updated_at: db.fn.now(),
    });
    return { message: 'Maintenance record deleted' };
  }

  async restore(id: string, updatedBy?: string) {
    const db = getDatabase();
    const record = await db('maintenance_records').where({ id }).first();
    if (!record) throw new NotFoundError('Maintenance record not found');
    await db('maintenance_records').where({ id }).update({
      deleted_at: null, deleted_by: null, updated_by: updatedBy || null, updated_at: db.fn.now(),
    });
    return this.findById(id);
  }

  async getVehicleMaintenance(vehicleId: string) {
    const db = getDatabase();
    const records = await db('maintenance_records')
      .leftJoin('master_values as types', 'maintenance_records.maintenance_type_id', 'types.id')
      .select('maintenance_records.*', 'types.name as maintenance_type_name', 'types.color as maintenance_type_color')
      .where('maintenance_records.vehicle_id', vehicleId)
      .whereNull('maintenance_records.deleted_at')
      .orderBy('maintenance_records.service_date', 'desc');

    const recordsWithParts = await Promise.all(records.map(async (r: any) => {
      const parts = await db('maintenance_parts').where({ maintenance_record_id: r.id });
      return { ...r, parts };
    }));

    const totalCost = records.reduce((sum: number, r: any) => sum + Number(r.cost), 0);

    return { records: recordsWithParts, total_cost: totalCost, count: records.length };
  }

  async getFleetHealth() {
    const db = getDatabase();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const in30Days = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];

    const vehicles = await db('vehicles').whereNull('deleted_at').select('*');
    const totalVehicles = vehicles.length;
    const active = vehicles.filter((v: any) => v.status === 'AVAILABLE' || v.status === 'BOOKED').length;
    const inMaintenance = vehicles.filter((v: any) => v.status === 'MAINTENANCE').length;
    const inactive = vehicles.filter((v: any) => v.status === 'INACTIVE').length;

    const insuranceDue = vehicles.filter((v: any) => v.insurance_expiry && v.insurance_expiry >= today && v.insurance_expiry <= in30Days).length;
    const permitDue = vehicles.filter((v: any) => v.permit_expiry && v.permit_expiry >= today && v.permit_expiry <= in30Days).length;
    const fitnessDue = vehicles.filter((v: any) => v.fitness_expiry && v.fitness_expiry >= today && v.fitness_expiry <= in30Days).length;
    const pollutionDue = vehicles.filter((v: any) => v.pollution_expiry && v.pollution_expiry >= today && v.pollution_expiry <= in30Days).length;
    const rcDue = vehicles.filter((v: any) => v.rc_expiry && v.rc_expiry >= today && v.rc_expiry <= in30Days).length;

    const upcomingServices = await db('service_schedules')
      .whereNull('deleted_at').where('status', 'active')
      .where(function () {
        this.where('next_service_date', '>=', today).where('next_service_date', '<=', in30Days)
          .orWhere('next_service_km', '>', 0);
      }).count('* as count').first() as any;

    const maintCosts = await db('maintenance_records')
      .whereNull('deleted_at')
      .select('vehicle_id')
      .sum('cost as total')
      .groupBy('vehicle_id')
      .orderByRaw('SUM(cost) DESC');

    const highestMaintCost = maintCosts.length > 0 ? Math.round(Number(maintCosts[0]?.total ?? 0) * 100) / 100 : 0;
    const lowestMaintCost = maintCosts.length > 0 ? Math.round(Number(maintCosts[maintCosts.length - 1]?.total ?? 0) * 100) / 100 : 0;

    const vehiclesWithoutAssignment = vehicles.filter((v: any) => !v.active_platform_id && v.status !== 'INACTIVE').length;

    const expiredDocs = vehicles.filter((v: any) =>
      (v.insurance_expiry && v.insurance_expiry < today) ||
      (v.permit_expiry && v.permit_expiry < today) ||
      (v.fitness_expiry && v.fitness_expiry < today) ||
      (v.pollution_expiry && v.pollution_expiry < today) ||
      (v.rc_expiry && v.rc_expiry < today)
    ).length;

    const healthScore = totalVehicles > 0
      ? Math.round(((active / totalVehicles) * 30 + (1 - expiredDocs / Math.max(totalVehicles, 1)) * 25 +
          (1 - inMaintenance / Math.max(totalVehicles, 1)) * 20 + (1 - vehiclesWithoutAssignment / Math.max(totalVehicles, 1)) * 25) * 100) / 100
      : 0;

    return {
      total_vehicles: totalVehicles,
      active,
      inactive,
      in_maintenance: inMaintenance,
      maintenance_due: Number(upcomingServices?.count ?? 0),
      insurance_due: insuranceDue,
      permit_due: permitDue,
      fitness_due: fitnessDue,
      pollution_due: pollutionDue,
      rc_due: rcDue,
      upcoming_services: Number(upcomingServices?.count ?? 0),
      vehicles_in_maintenance: inMaintenance,
      highest_maintenance_cost: highestMaintCost,
      lowest_maintenance_cost: lowestMaintCost,
      vehicles_without_platform: vehiclesWithoutAssignment,
      expired_documents: expiredDocs,
      health_score: healthScore,
    };
  }

  private async addTimelineEvent(vehicleId: string, eventType: string, title: string, refType: string, refId: string, userId?: string) {
    const db = getDatabase();
    await db('vehicle_timeline_events').insert({
      vehicle_id: vehicleId, event_type: eventType, event_date: db.fn.now(),
      title, reference_type: refType, reference_id: refId, created_by: userId || null,
    });
  }
}

export const maintenanceService = new MaintenanceService();
