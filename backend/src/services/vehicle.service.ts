import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError, ConflictError } from '../utils/errors';
import { Vehicle, CreateVehicleDTO, UpdateVehicleDTO, PaginationMeta } from '../types';
import { VEHICLE_ALLOWED_SORT_FIELDS } from '../config/constants';

export class VehicleService {
  async create(data: CreateVehicleDTO, createdBy?: string) {
    const db = getDatabase();

    const existing = await db<Vehicle>('vehicles')
      .where({ vehicle_number: data.vehicle_number })
      .first();

    if (existing) {
      throw new ConflictError('Vehicle number is already in use');
    }

    if (data.fleet_code) {
      const existingFleet = await db<Vehicle>('vehicles')
        .where({ fleet_code: data.fleet_code })
        .first();
      if (existingFleet) {
        throw new ConflictError('Fleet code is already in use');
      }
    }

    const insertData: Record<string, unknown> = {
      vehicle_number: data.vehicle_number,
      vehicle_name: data.vehicle_name,
      brand: data.brand ?? null,
      model: data.model ?? null,
      variant: data.variant ?? null,
      year: data.year ?? null,
      color: data.color ?? null,
      fuel_type: data.fuel_type ?? null,
      transmission: data.transmission ?? null,
      ownership_type: data.ownership_type ?? null,
      seating_capacity: data.seating_capacity ?? null,
      chassis_number: data.chassis_number ?? null,
      engine_number: data.engine_number ?? null,
      status: data.status || 'AVAILABLE',
      active_platform_id: data.active_platform_id ?? null,
      fleet_code: data.fleet_code ?? null,
      purchase_date: data.purchase_date ?? null,
      purchase_price: data.purchase_price ?? null,
      current_odometer: data.current_odometer ?? null,
      insurance_expiry: data.insurance_expiry ?? null,
      permit_expiry: data.permit_expiry ?? null,
      road_tax_expiry: data.road_tax_expiry ?? null,
      pollution_expiry: data.pollution_expiry ?? null,
      fitness_expiry: data.fitness_expiry ?? null,
      rc_expiry: data.rc_expiry ?? null,
      photo: data.photo ?? null,
      notes: data.notes ?? null,
      is_active: true,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    };

    const [vehicle] = await db<Vehicle>('vehicles')
      .insert(insertData)
      .returning('*');

    return vehicle;
  }

  async findAll(query: {
    page?: string;
    limit?: string;
    sort_by?: string;
    sort_order?: string;
    status?: string;
    fuel_type?: string;
    transmission?: string;
    ownership_type?: string;
    search?: string;
    is_active?: string;
    include_deleted?: string;
    insurance_expiring_soon?: string;
    fitness_expiring_soon?: string;
    pollution_expiring_soon?: string;
  }) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...VEHICLE_ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['status', 'fuel_type', 'transmission', 'ownership_type', 'is_active', 'search']);

    let queryBuilder = db<Vehicle>('vehicles');

    if (query.include_deleted !== 'true') {
      queryBuilder = queryBuilder.whereNull('deleted_at');
    }

    if (filters.status) {
      queryBuilder = queryBuilder.where('status', filters.status);
    }

    if (filters.fuel_type) {
      queryBuilder = queryBuilder.where('fuel_type', filters.fuel_type);
    }

    if (filters.transmission) {
      queryBuilder = queryBuilder.where('transmission', filters.transmission);
    }

    if (filters.ownership_type) {
      queryBuilder = queryBuilder.where('ownership_type', filters.ownership_type);
    }

    if (filters.is_active !== undefined) {
      queryBuilder = queryBuilder.where('is_active', filters.is_active === 'true');
    }

    if (query.insurance_expiring_soon === 'true') {
      queryBuilder = queryBuilder.where('insurance_expiry', '>=', db.fn.now())
        .where('insurance_expiry', '<=', db.raw("NOW() + INTERVAL '30 days'"));
    }

    if (query.fitness_expiring_soon === 'true') {
      queryBuilder = queryBuilder.where('fitness_expiry', '>=', db.fn.now())
        .where('fitness_expiry', '<=', db.raw("NOW() + INTERVAL '30 days'"));
    }

    if (query.pollution_expiring_soon === 'true') {
      queryBuilder = queryBuilder.where('pollution_expiry', '>=', db.fn.now())
        .where('pollution_expiry', '<=', db.raw("NOW() + INTERVAL '30 days'"));
    }

    if (filters.search) {
      queryBuilder = queryBuilder.where(function () {
        this.where('vehicle_number', 'ilike', `%${filters.search}%`)
          .orWhere('vehicle_name', 'ilike', `%${filters.search}%`)
          .orWhere('brand', 'ilike', `%${filters.search}%`)
          .orWhere('model', 'ilike', `%${filters.search}%`)
          .orWhere('variant', 'ilike', `%${filters.search}%`)
          .orWhere('fleet_code', 'ilike', `%${filters.search}%`);
      });
    }

    const countQuery = queryBuilder.clone();
    const countResult = await countQuery.count('* as count').first() as { count: string | number } | undefined;
    const total = Number(countResult?.count ?? 0);

    const vehicles = await queryBuilder
      .orderBy(sort.column, sort.order)
      .limit(pagination.limit)
      .offset(pagination.offset);

    const meta: PaginationMeta = {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
      hasNextPage: pagination.page * pagination.limit < total,
      hasPreviousPage: pagination.page > 1,
    };

    return {
      data: vehicles,
      meta,
    };
  }

  async findById(id: string) {
    const db = getDatabase();

    const vehicle = await db<Vehicle>('vehicles')
      .where({ id })
      .first();

    if (!vehicle || vehicle.deleted_at) {
      throw new NotFoundError('Vehicle not found');
    }

    return vehicle;
  }

  async update(id: string, data: UpdateVehicleDTO, updatedBy?: string) {
    const db = getDatabase();

    const vehicle = await db<Vehicle>('vehicles')
      .where({ id })
      .first();

    if (!vehicle || vehicle.deleted_at) {
      throw new NotFoundError('Vehicle not found');
    }

    if (data.vehicle_number && data.vehicle_number !== vehicle.vehicle_number) {
      const existing = await db<Vehicle>('vehicles')
        .where({ vehicle_number: data.vehicle_number })
        .whereNot({ id })
        .first();

      if (existing) {
        throw new ConflictError('Vehicle number is already in use');
      }
    }

    if (data.fleet_code && data.fleet_code !== vehicle.fleet_code) {
      const existingFleet = await db<Vehicle>('vehicles')
        .where({ fleet_code: data.fleet_code })
        .whereNot({ id })
        .first();

      if (existingFleet) {
        throw new ConflictError('Fleet code is already in use');
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
      updated_by: updatedBy || null,
    };

    const fields: (keyof UpdateVehicleDTO)[] = [
      'vehicle_number', 'vehicle_name', 'fleet_code', 'brand', 'model', 'variant', 'year', 'color',
      'fuel_type', 'transmission', 'ownership_type', 'seating_capacity', 'chassis_number', 'engine_number',
      'status', 'active_platform_id',
      'purchase_date', 'purchase_price', 'current_odometer',
      'insurance_expiry', 'permit_expiry', 'road_tax_expiry', 'pollution_expiry', 'fitness_expiry', 'rc_expiry',
      'photo', 'notes', 'is_active',
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    await db('vehicles')
      .where({ id })
      .update(updateData);

    const updatedVehicle = await db<Vehicle>('vehicles')
      .where({ id })
      .first();

    return updatedVehicle!;
  }

  async delete(id: string, deletedBy?: string) {
    const db = getDatabase();

    const vehicle = await db<Vehicle>('vehicles')
      .where({ id })
      .first();

    if (!vehicle || vehicle.deleted_at) {
      throw new NotFoundError('Vehicle not found');
    }

    await db('vehicles')
      .where({ id })
      .update({
        deleted_at: db.fn.now(),
        deleted_by: deletedBy || null,
        updated_at: db.fn.now(),
      });

    return { message: 'Vehicle deleted successfully' };
  }

  async restore(id: string, updatedBy?: string) {
    const db = getDatabase();

    const vehicle = await db<Vehicle>('vehicles')
      .where({ id })
      .first();

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    if (!vehicle.deleted_at) {
      return vehicle;
    }

    await db('vehicles')
      .where({ id })
      .update({
        deleted_at: null,
        deleted_by: null,
        updated_at: db.fn.now(),
        updated_by: updatedBy || null,
      });

    const restoredVehicle = await db<Vehicle>('vehicles')
      .where({ id })
      .first();

    return restoredVehicle!;
  }

  async duplicate(id: string, createdBy?: string) {
    const db = getDatabase();

    const vehicle = await db<Vehicle>('vehicles')
      .where({ id })
      .first();

    if (!vehicle || vehicle.deleted_at) {
      throw new NotFoundError('Vehicle not found');
    }

    let copyNumber = `${vehicle.vehicle_number}-copy`;
    let counter = 1;
    while (await db<Vehicle>('vehicles').where({ vehicle_number: copyNumber }).first()) {
      counter++;
      copyNumber = `${vehicle.vehicle_number}-copy${counter}`;
    }

    const [duplicate] = await db<Vehicle>('vehicles')
      .insert({
        vehicle_number: copyNumber,
        vehicle_name: `${vehicle.vehicle_name} (Copy)`,
        brand: vehicle.brand,
        model: vehicle.model,
        variant: vehicle.variant,
        year: vehicle.year,
        color: vehicle.color,
        fuel_type: vehicle.fuel_type,
        transmission: vehicle.transmission,
        ownership_type: vehicle.ownership_type,
        seating_capacity: vehicle.seating_capacity,
        chassis_number: vehicle.chassis_number,
        engine_number: vehicle.engine_number,
        status: 'AVAILABLE',
        active_platform_id: null,
        fleet_code: null,
        purchase_date: vehicle.purchase_date,
        purchase_price: vehicle.purchase_price,
        current_odometer: vehicle.current_odometer,
        insurance_expiry: null,
        permit_expiry: null,
        road_tax_expiry: null,
        pollution_expiry: null,
        fitness_expiry: null,
        rc_expiry: null,
        photo: null,
        notes: vehicle.notes,
        is_active: true,
        created_by: createdBy || null,
        updated_by: createdBy || null,
      })
      .returning('*');

    return duplicate;
  }

  async findByVehicleNumber(vehicleNumber: string) {
    const db = getDatabase();

    const vehicle = await db<Vehicle>('vehicles')
      .where({ vehicle_number: vehicleNumber })
      .first();

    if (!vehicle || vehicle.deleted_at) {
      throw new NotFoundError('Vehicle not found');
    }

    return vehicle;
  }
}

export const vehicleService = new VehicleService();
