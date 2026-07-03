import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';

const VENDOR_ALLOWED_SORT_FIELDS = ['name', 'city', 'rating', 'created_at'] as const;

export class VendorService {
  async create(data: any, createdBy?: string) {
    const db = getDatabase();
    if (data.vendor_type_id) {
      const vt = await db('master_values').where({ id: data.vendor_type_id, deleted_at: null }).first();
      if (!vt) throw new NotFoundError('Vendor type not found');
    }
    const [vendor] = await db('vendors').insert({
      ...data,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');
    return this.enrich(vendor);
  }

  async findAll(query: any) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...VENDOR_ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['search', 'vendor_type_id']);

    let qb = db('vendors')
      .leftJoin('master_values as types', 'vendors.vendor_type_id', 'types.id')
      .select('vendors.*', 'types.name as vendor_type_name', 'types.color as vendor_type_color');

    if (query.include_deleted !== 'true') qb = qb.whereNull('vendors.deleted_at');
    if (filters.vendor_type_id) qb = qb.where('vendors.vendor_type_id', filters.vendor_type_id);
    if (query.is_active) qb = qb.where('vendors.is_active', query.is_active === 'true');
    if (filters.search) {
      qb = qb.where(function () {
        this.where('vendors.name', 'ilike', `%${filters.search}%`)
          .orWhere('vendors.contact_person', 'ilike', `%${filters.search}%`)
          .orWhere('vendors.phone', 'ilike', `%${filters.search}%`)
          .orWhere('vendors.city', 'ilike', `%${filters.search}%`);
      });
    }

    const countResult = await qb.clone().count('* as count').first() as any;
    const total = Number(countResult?.count ?? 0);
    const data = await qb.orderBy(sort.column, sort.order).limit(pagination.limit).offset(pagination.offset);

    return { data, meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit), hasNextPage: pagination.page * pagination.limit < total, hasPreviousPage: pagination.page > 1 } };
  }

  async findById(id: string) {
    const db = getDatabase();
    const vendor = await db('vendors')
      .leftJoin('master_values as types', 'vendors.vendor_type_id', 'types.id')
      .select('vendors.*', 'types.name as vendor_type_name', 'types.color as vendor_type_color')
      .where('vendors.id', id).whereNull('vendors.deleted_at').first();
    if (!vendor) throw new NotFoundError('Vendor not found');
    return vendor;
  }

  async update(id: string, data: any, updatedBy?: string) {
    const db = getDatabase();
    const vendor = await db('vendors').where({ id }).first();
    if (!vendor) throw new NotFoundError('Vendor not found');
    if (data.vendor_type_id) {
      const vt = await db('master_values').where({ id: data.vendor_type_id, deleted_at: null }).first();
      if (!vt) throw new NotFoundError('Vendor type not found');
    }
    await db('vendors').where({ id }).update({ ...data, updated_at: db.fn.now(), updated_by: updatedBy || null });
    return this.findById(id);
  }

  async delete(id: string, deletedBy?: string) {
    const db = getDatabase();
    const vendor = await db('vendors').where({ id }).first();
    if (!vendor) throw new NotFoundError('Vendor not found');
    await db('vendors').where({ id }).update({ deleted_at: db.fn.now(), deleted_by: deletedBy || null, updated_at: db.fn.now() });
    return { message: 'Vendor deleted' };
  }

  async restore(id: string, updatedBy?: string) {
    const db = getDatabase();
    const vendor = await db('vendors').where({ id }).first();
    if (!vendor) throw new NotFoundError('Vendor not found');
    await db('vendors').where({ id }).update({ deleted_at: null, deleted_by: null, updated_by: updatedBy || null, updated_at: db.fn.now() });
    return this.findById(id);
  }

  private async enrich(vendor: any) {
    if (!vendor.vendor_type_id) return { ...vendor, vendor_type_name: null, vendor_type_color: null };
    const vt = await getDatabase()('master_values').where({ id: vendor.vendor_type_id }).select('name', 'color').first();
    return { ...vendor, vendor_type_name: vt?.name || null, vendor_type_color: vt?.color || null };
  }
}

export const vendorService = new VendorService();
