import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError, ConflictError } from '../utils/errors';

const OWNER_ALLOWED_SORT_FIELDS = ['name', 'owner_type', 'city', 'ownership_status', 'agreement_status', 'created_at', 'updated_at'] as const;

export class VehicleOwnerService {
  async create(data: any, createdBy?: string) {
    const db = getDatabase();
    const [owner] = await db('vehicle_owners').insert({
      ...data,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');
    return this.enrich(owner);
  }

  async findAll(query: any) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...OWNER_ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['search', 'owner_type', 'ownership_status', 'agreement_status']);

    let qb = db('vehicle_owners');

    if (query.include_deleted !== 'true') qb = qb.whereNull('vehicle_owners.deleted_at');
    if (filters.owner_type) qb = qb.where('vehicle_owners.owner_type', filters.owner_type);
    if (filters.ownership_status) qb = qb.where('vehicle_owners.ownership_status', filters.ownership_status);
    if (filters.agreement_status) qb = qb.where('vehicle_owners.agreement_status', filters.agreement_status);
    if (query.is_active) qb = qb.where('vehicle_owners.is_active', query.is_active === 'true');
    if (filters.search) {
      qb = qb.where(function () {
        this.where('vehicle_owners.name', 'ilike', `%${filters.search}%`)
          .orWhere('vehicle_owners.phone', 'ilike', `%${filters.search}%`)
          .orWhere('vehicle_owners.city', 'ilike', `%${filters.search}%`)
          .orWhere('vehicle_owners.agreement_number', 'ilike', `%${filters.search}%`);
      });
    }

    const countResult = await qb.clone().count('* as count').first() as any;
    const total = Number(countResult?.count ?? 0);
    const data = await qb.orderBy(sort.column, sort.order).limit(pagination.limit).offset(pagination.offset);

    return { data, meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit), hasNextPage: pagination.page * pagination.limit < total, hasPreviousPage: pagination.page > 1 } };
  }

  async findById(id: string) {
    const db = getDatabase();
    const owner = await db('vehicle_owners').where({ id }).whereNull('deleted_at').first();
    if (!owner) throw new NotFoundError('Vehicle owner not found');
    return this.enrichWithVehicles(owner);
  }

  async update(id: string, data: any, updatedBy?: string) {
    const db = getDatabase();
    const owner = await db('vehicle_owners').where({ id }).first();
    if (!owner) throw new NotFoundError('Vehicle owner not found');
    await db('vehicle_owners').where({ id }).update({ ...data, updated_at: db.fn.now(), updated_by: updatedBy || null });
    return this.findById(id);
  }

  async delete(id: string, deletedBy?: string) {
    const db = getDatabase();
    const owner = await db('vehicle_owners').where({ id }).first();
    if (!owner) throw new NotFoundError('Vehicle owner not found');
    await db('vehicle_owners').where({ id }).update({ deleted_at: db.fn.now(), deleted_by: deletedBy || null, updated_at: db.fn.now() });
    return { message: 'Vehicle owner deleted' };
  }

  async restore(id: string, updatedBy?: string) {
    const db = getDatabase();
    const owner = await db('vehicle_owners').where({ id }).first();
    if (!owner) throw new NotFoundError('Vehicle owner not found');
    await db('vehicle_owners').where({ id }).update({ deleted_at: null, deleted_by: null, updated_by: updatedBy || null, updated_at: db.fn.now() });
    return this.findById(id);
  }

  async assignOwner(vehicleId: string, ownerId: string | null, notes?: string | null, createdBy?: string) {
    const db = getDatabase();
    const vehicle = await db('vehicles').where({ id: vehicleId }).first();
    if (!vehicle) throw new NotFoundError('Vehicle not found');

    const previousOwnerId = vehicle.current_owner_id;
    let previousOwnerName = null;

    if (previousOwnerId) {
      const prevOwner = await db('vehicle_owners').where({ id: previousOwnerId }).first();
      previousOwnerName = prevOwner?.name || null;
    }

    if (ownerId) {
      const owner = await db('vehicle_owners').where({ id: ownerId }).whereNull('deleted_at').first();
      if (!owner) throw new NotFoundError('Owner not found');

      await db('ownership_history').insert({
        vehicle_id: vehicleId,
        owner_id: ownerId,
        event_type: previousOwnerId ? 'owner_changed' : 'owner_assigned',
        event_date: db.fn.now(),
        previous_owner_name: previousOwnerName,
        new_owner_name: owner.name,
        previous_agreement_number: null,
        new_agreement_number: owner.agreement_number,
        notes: notes || null,
        created_by: createdBy || null,
      });

      await db('vehicles').where({ id: vehicleId }).update({
        current_owner_id: ownerId,
        updated_at: db.fn.now(),
        updated_by: createdBy || null,
      });
    } else {
      // Unassign owner
      await db('ownership_history').insert({
        vehicle_id: vehicleId,
        owner_id: null,
        event_type: 'ownership_ended',
        event_date: db.fn.now(),
        previous_owner_name: previousOwnerName,
        new_owner_name: null,
        notes: notes || null,
        created_by: createdBy || null,
      });

      await db('vehicles').where({ id: vehicleId }).update({
        current_owner_id: null,
        updated_at: db.fn.now(),
        updated_by: createdBy || null,
      });
    }

    return this.getVehicleOwner(vehicleId);
  }

  async getVehicleOwner(vehicleId: string) {
    const db = getDatabase();
    const vehicle = await db('vehicles').where({ id: vehicleId }).first();
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    if (!vehicle.current_owner_id) return null;
    return this.findById(vehicle.current_owner_id);
  }

  async getOwnerVehicles(ownerId: string) {
    const db = getDatabase();
    const owner = await db('vehicle_owners').where({ id: ownerId }).first();
    if (!owner) throw new NotFoundError('Vehicle owner not found');
    return db('vehicles').select('id', 'vehicle_number', 'vehicle_name', 'status')
      .where({ current_owner_id: ownerId }).whereNull('deleted_at');
  }

  async getOwnershipHistory(vehicleId: string) {
    const db = getDatabase();
    return db('ownership_history').where({ vehicle_id: vehicleId }).orderBy('event_date', 'desc');
  }

  async getOwnerDocuments(ownerId: string) {
    const db = getDatabase();
    const owner = await db('vehicle_owners').where({ id: ownerId }).first();
    if (!owner) throw new NotFoundError('Vehicle owner not found');
    return db('owner_documents').where({ owner_id: ownerId }).whereNull('deleted_at').orderBy('created_at', 'desc');
  }

  async addDocument(ownerId: string, data: any, createdBy?: string) {
    const db = getDatabase();
    const owner = await db('vehicle_owners').where({ id: ownerId }).first();
    if (!owner) throw new NotFoundError('Vehicle owner not found');

    const latestDoc = await db('owner_documents')
      .where({ owner_id: ownerId, document_type: data.document_type })
      .whereNull('deleted_at')
      .orderBy('version', 'desc')
      .first();

    const [doc] = await db('owner_documents').insert({
      ...data,
      owner_id: ownerId,
      version: (latestDoc?.version || 0) + 1,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');
    return doc;
  }

  async updateDocument(ownerId: string, docId: string, data: any, updatedBy?: string) {
    const db = getDatabase();
    const doc = await db('owner_documents').where({ id: docId, owner_id: ownerId }).first();
    if (!doc) throw new NotFoundError('Document not found');
    await db('owner_documents').where({ id: docId }).update({ ...data, updated_at: db.fn.now(), updated_by: updatedBy || null });
    return db('owner_documents').where({ id: docId }).first();
  }

  async deleteDocument(ownerId: string, docId: string) {
    const db = getDatabase();
    const doc = await db('owner_documents').where({ id: docId, owner_id: ownerId }).first();
    if (!doc) throw new NotFoundError('Document not found');
    await db('owner_documents').where({ id: docId }).update({ deleted_at: db.fn.now() });
    return { message: 'Document deleted' };
  }

  private async enrich(owner: any) {
    return owner;
  }

  private async enrichWithVehicles(owner: any) {
    const vehicles = await getDatabase()('vehicles')
      .select('id', 'vehicle_number', 'vehicle_name')
      .where({ current_owner_id: owner.id })
      .whereNull('deleted_at');
    return { ...owner, linked_vehicles: vehicles };
  }
}

export const vehicleOwnerService = new VehicleOwnerService();
