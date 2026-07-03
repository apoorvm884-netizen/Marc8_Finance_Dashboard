import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import { journalMetricsService } from './journal-metrics';
import { CreateJournalEntryDTO, UpdateJournalEntryDTO, PaginationMeta } from '../types';

const JOURNAL_ALLOWED_SORT_FIELDS = ['collection_date', 'amount_collected', 'total_amount', 'status', 'created_at'] as const;

export class JournalService {
  async create(data: CreateJournalEntryDTO, createdBy?: string) {
    const db = getDatabase();

    const vehicle = await db('vehicles').where({ id: data.vehicle_id }).first();
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    if (vehicle.deleted_at) throw new NotFoundError('Vehicle is deleted');

    const category = await db('master_values')
      .where({ id: data.ledger_category_id, deleted_at: null })
      .whereExists(function () {
        this.select('*')
          .from('master_types')
          .whereRaw('master_types.id = master_values.master_type_id')
          .where('master_types.code', 'journal_category');
      })
      .first();
    if (!category) throw new NotFoundError('Ledger category not found');

    const [entry] = await db('journal_entries').insert({
      vehicle_id: data.vehicle_id,
      collection_date: data.collection_date || null,
      amount_collected: data.amount_collected,
      total_amount: data.total_amount,
      ledger_category_id: data.ledger_category_id,
      reference_number: data.reference_number || null,
      description: data.description || null,
      status: data.status || 'PENDING',
      remarks: data.remarks || null,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');

    return this.enrichJournalEntry(entry);
  }

  async findAll(query: {
    page?: string;
    limit?: string;
    sort_by?: string;
    sort_order?: string;
    status?: string;
    search?: string;
    vehicle_id?: string;
    ledger_category_id?: string;
    date_from?: string;
    date_to?: string;
    include_deleted?: string;
  }) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...JOURNAL_ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['status', 'search', 'vehicle_id', 'ledger_category_id']);

    let queryBuilder = db('journal_entries')
      .leftJoin('vehicles', 'journal_entries.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'journal_entries.ledger_category_id', 'categories.id')
      .select(
        'journal_entries.*',
        'vehicles.vehicle_number',
        'vehicles.vehicle_name',
        'categories.name as category_name'
      );

    if (query.include_deleted !== 'true') {
      queryBuilder = queryBuilder.whereNull('journal_entries.deleted_at');
    }

    if (filters.status) {
      queryBuilder = queryBuilder.where('journal_entries.status', filters.status);
    }

    if (filters.vehicle_id) {
      queryBuilder = queryBuilder.where('journal_entries.vehicle_id', filters.vehicle_id);
    }

    if (filters.ledger_category_id) {
      queryBuilder = queryBuilder.where('journal_entries.ledger_category_id', filters.ledger_category_id);
    }

    if (query.date_from) {
      queryBuilder = queryBuilder.where('journal_entries.collection_date', '>=', query.date_from);
    }

    if (query.date_to) {
      queryBuilder = queryBuilder.where('journal_entries.collection_date', '<=', query.date_to);
    }

    if (filters.search) {
      queryBuilder = queryBuilder.where(function () {
        this.where('vehicles.vehicle_number', 'ilike', `%${filters.search}%`);
      });
    }

    const countQuery = queryBuilder.clone();
    const countResult = await countQuery.count('* as count').first() as { count: string | number } | undefined;
    const total = Number(countResult?.count ?? 0);

    const entries = await queryBuilder
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

    return { data: entries, meta };
  }

  async findById(id: string) {
    const db = getDatabase();

    const entry = await db('journal_entries')
      .leftJoin('vehicles', 'journal_entries.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'journal_entries.ledger_category_id', 'categories.id')
      .select(
        'journal_entries.*',
        'vehicles.vehicle_number',
        'vehicles.vehicle_name',
        'categories.name as category_name'
      )
      .where('journal_entries.id', id)
      .whereNull('journal_entries.deleted_at')
      .first();

    if (!entry) throw new NotFoundError('Journal entry not found');

    return entry;
  }

  async update(id: string, data: UpdateJournalEntryDTO, updatedBy?: string) {
    const db = getDatabase();

    const entry = await db('journal_entries').where({ id }).first();
    if (!entry) throw new NotFoundError('Journal entry not found');

    if (data.vehicle_id) {
      const vehicle = await db('vehicles').where({ id: data.vehicle_id }).first();
      if (!vehicle) throw new NotFoundError('Vehicle not found');
    }

    if (data.ledger_category_id) {
      const category = await db('master_values')
        .where({ id: data.ledger_category_id, deleted_at: null })
        .whereExists(function () {
          this.select('*')
            .from('master_types')
            .whereRaw('master_types.id = master_values.master_type_id')
            .where('master_types.code', 'journal_category');
        })
        .first();
      if (!category) throw new NotFoundError('Ledger category not found');
    }

    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
      updated_by: updatedBy || null,
    };

    const fields: (keyof UpdateJournalEntryDTO)[] = [
      'vehicle_id', 'collection_date', 'amount_collected',
      'total_amount', 'ledger_category_id', 'reference_number',
      'description', 'status', 'remarks',
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    await db('journal_entries').where({ id }).update(updateData);

    return this.findById(id);
  }

  async delete(id: string, deletedBy?: string) {
    const db = getDatabase();
    const entry = await db('journal_entries').where({ id }).first();
    if (!entry) throw new NotFoundError('Journal entry not found');

    await db('journal_entries').where({ id }).update({
      deleted_at: db.fn.now(),
      deleted_by: deletedBy || null,
      updated_at: db.fn.now(),
    });

    return { message: 'Journal entry deleted successfully' };
  }

  async restore(id: string, updatedBy?: string) {
    const db = getDatabase();
    const entry = await db('journal_entries').where({ id }).first();
    if (!entry) throw new NotFoundError('Journal entry not found');

    await db('journal_entries').where({ id }).update({
      deleted_at: null,
      deleted_by: null,
      updated_by: updatedBy || null,
      updated_at: db.fn.now(),
    });

    return this.findById(id);
  }

  async duplicate(id: string, createdBy?: string) {
    const db = getDatabase();
    const entry = await db('journal_entries').where({ id }).first();
    if (!entry) throw new NotFoundError('Journal entry not found');

    const [duplicated] = await db('journal_entries').insert({
      vehicle_id: entry.vehicle_id,
      collection_date: entry.collection_date,
      amount_collected: entry.amount_collected,
      total_amount: entry.total_amount,
      ledger_category_id: entry.ledger_category_id,
      reference_number: entry.reference_number,
      description: entry.description,
      status: 'PENDING',
      remarks: `Duplicated from ${entry.id}`,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');

    return this.findById(duplicated.id);
  }

  async getMetrics() {
    return journalMetricsService.getMetrics();
  }

  private async enrichJournalEntry(entry: any): Promise<any> {
    const db = getDatabase();
    const vehicle = await db('vehicles').where({ id: entry.vehicle_id }).select('vehicle_number', 'vehicle_name').first();
    const category = await db('master_values').where({ id: entry.ledger_category_id }).select('name').first();
    return {
      ...entry,
      vehicle_number: vehicle?.vehicle_number || null,
      vehicle_name: vehicle?.vehicle_name || null,
      category_name: category?.name || null,
    };
  }
}

export const journalService = new JournalService();
