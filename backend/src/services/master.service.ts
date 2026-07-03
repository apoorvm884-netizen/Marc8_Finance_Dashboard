import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError, ConflictError } from '../utils/errors';
import { MasterType, MasterValue, CreateMasterValueDTO, UpdateMasterValueDTO, PaginationMeta } from '../types';

const MASTER_ALLOWED_SORT_FIELDS = ['code', 'name', 'display_order', 'created_at', 'updated_at'];

export class MasterService {
  async getMasterTypes() {
    const db = getDatabase();

    const types = await db<MasterType>('master_types')
      .select('*')
      .orderBy('code', 'asc');

    return types;
  }

  async getMasterValues(masterType: string, query: {
    page?: string;
    limit?: string;
    sort_by?: string;
    sort_order?: string;
    search?: string;
    is_active?: string;
    include_deleted?: string;
  }) {
    const db = getDatabase();

    const masterTypeRecord = await db<MasterType>('master_types')
      .where({ code: masterType })
      .first();

    if (!masterTypeRecord) {
      throw new NotFoundError(`Master type '${masterType}' not found`);
    }

    const pagination = parsePagination(query);
    const sort = parseSort(query, [...MASTER_ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['search', 'is_active']);

    let queryBuilder = db<MasterValue>('master_values')
      .where({ master_type_id: masterTypeRecord.id });

    if (query.include_deleted !== 'true') {
      queryBuilder = queryBuilder.whereNull('deleted_at');
    }

    if (filters.is_active !== undefined) {
      queryBuilder = queryBuilder.where('is_active', filters.is_active === 'true');
    }

    if (filters.search) {
      queryBuilder = queryBuilder.where(function () {
        this.where('code', 'ilike', `%${filters.search}%`)
          .orWhere('name', 'ilike', `%${filters.search}%`);
      });
    }

    const countQuery = queryBuilder.clone();
    const countResult = await countQuery.count('* as count').first() as { count: string | number } | undefined;
    const total = Number(countResult?.count ?? 0);

    const values = await queryBuilder
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
      data: values,
      meta,
    };
  }

  async getMasterValueById(masterType: string, id: string) {
    const db = getDatabase();

    const masterTypeRecord = await db<MasterType>('master_types')
      .where({ code: masterType })
      .first();

    if (!masterTypeRecord) {
      throw new NotFoundError(`Master type '${masterType}' not found`);
    }

    const value = await db<MasterValue>('master_values')
      .where({ id, master_type_id: masterTypeRecord.id })
      .first();

    if (!value || value.deleted_at) {
      throw new NotFoundError('Master value not found');
    }

    return value;
  }

  async createMasterValue(masterType: string, data: CreateMasterValueDTO, createdBy?: string) {
    const db = getDatabase();

    const masterTypeRecord = await db<MasterType>('master_types')
      .where({ code: masterType })
      .first();

    if (!masterTypeRecord) {
      throw new NotFoundError(`Master type '${masterType}' not found`);
    }

    const existing = await db<MasterValue>('master_values')
      .where({ master_type_id: masterTypeRecord.id, code: data.code })
      .first();

    if (existing) {
      throw new ConflictError(`Code '${data.code}' already exists for master type '${masterType}'`);
    }

    const [value] = await db<MasterValue>('master_values')
      .insert({
        master_type_id: masterTypeRecord.id,
        code: data.code,
        name: data.name,
        description: data.description || null,
        display_order: data.display_order ?? 0,
        is_active: data.is_active ?? true,
        created_by: createdBy || null,
        updated_by: createdBy || null,
      })
      .returning('*');

    return value;
  }

  async updateMasterValue(masterType: string, id: string, data: UpdateMasterValueDTO, updatedBy?: string) {
    const db = getDatabase();

    const masterTypeRecord = await db<MasterType>('master_types')
      .where({ code: masterType })
      .first();

    if (!masterTypeRecord) {
      throw new NotFoundError(`Master type '${masterType}' not found`);
    }

    const value = await db<MasterValue>('master_values')
      .where({ id, master_type_id: masterTypeRecord.id })
      .first();

    if (!value || value.deleted_at) {
      throw new NotFoundError('Master value not found');
    }

    if (data.code && data.code !== value.code) {
      const existing = await db<MasterValue>('master_values')
        .where({ master_type_id: masterTypeRecord.id, code: data.code })
        .whereNot({ id })
        .first();

      if (existing) {
        throw new ConflictError(`Code '${data.code}' already exists for master type '${masterType}'`);
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
      updated_by: updatedBy || null,
    };

    const fields: (keyof UpdateMasterValueDTO)[] = ['code', 'name', 'description', 'display_order', 'is_active'];

    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    await db('master_values')
      .where({ id })
      .update(updateData);

    const updatedValue = await db<MasterValue>('master_values')
      .where({ id })
      .first();

    return updatedValue!;
  }

  async deleteMasterValue(masterType: string, id: string) {
    const db = getDatabase();

    const masterTypeRecord = await db<MasterType>('master_types')
      .where({ code: masterType })
      .first();

    if (!masterTypeRecord) {
      throw new NotFoundError(`Master type '${masterType}' not found`);
    }

    const value = await db<MasterValue>('master_values')
      .where({ id, master_type_id: masterTypeRecord.id })
      .first();

    if (!value || value.deleted_at) {
      throw new NotFoundError('Master value not found');
    }

    if (value.is_system) {
      throw new ConflictError('System master values cannot be deleted');
    }

    await db('master_values')
      .where({ id })
      .update({
        deleted_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
  }

  async restoreMasterValue(masterType: string, id: string, updatedBy?: string) {
    const db = getDatabase();

    const masterTypeRecord = await db<MasterType>('master_types')
      .where({ code: masterType })
      .first();

    if (!masterTypeRecord) {
      throw new NotFoundError(`Master type '${masterType}' not found`);
    }

    const value = await db<MasterValue>('master_values')
      .where({ id, master_type_id: masterTypeRecord.id })
      .first();

    if (!value) {
      throw new NotFoundError('Master value not found');
    }

    if (!value.deleted_at) {
      return value;
    }

    await db('master_values')
      .where({ id })
      .update({
        deleted_at: null,
        updated_at: db.fn.now(),
        updated_by: updatedBy || null,
      });

    const restoredValue = await db<MasterValue>('master_values')
      .where({ id })
      .first();

    return restoredValue!;
  }
}

export const masterService = new MasterService();
