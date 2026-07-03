import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import { CreateExpenseDTO, UpdateExpenseDTO, PaginationMeta } from '../types';

const EXPENSE_ALLOWED_SORT_FIELDS = ['expense_date', 'amount', 'vendor', 'status', 'created_at'] as const;

export class ExpenseService {
  async create(data: CreateExpenseDTO, createdBy?: string) {
    const db = getDatabase();

    const category = await db('master_values')
      .where({ id: data.expense_category_id, deleted_at: null })
      .whereExists(function () {
        this.select('*')
          .from('master_types')
          .whereRaw('master_types.id = master_values.master_type_id')
          .where('master_types.code', 'expense_category');
      })
      .first();
    if (!category) throw new NotFoundError('Expense category not found');

    const paymentMode = await db('master_values')
      .where({ id: data.payment_mode_id, deleted_at: null })
      .whereExists(function () {
        this.select('*')
          .from('master_types')
          .whereRaw('master_types.id = master_values.master_type_id')
          .where('master_types.code', 'payment_mode');
      })
      .first();
    if (!paymentMode) throw new NotFoundError('Payment mode not found');

    if (data.vehicle_id) {
      const vehicle = await db('vehicles').where({ id: data.vehicle_id }).first();
      if (!vehicle) throw new NotFoundError('Vehicle not found');
      if (vehicle.deleted_at) throw new NotFoundError('Vehicle is deleted');
    }

    const [expense] = await db('expenses').insert({
      vehicle_id: data.vehicle_id || null,
      expense_category_id: data.expense_category_id,
      payment_mode_id: data.payment_mode_id,
      expense_date: data.expense_date || db.fn.now(),
      amount: data.amount,
      vendor: data.vendor || null,
      invoice_number: data.invoice_number || null,
      status: data.status || 'PENDING',
      remarks: data.remarks || null,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');

    return this.enrichExpense(expense);
  }

  async findAll(query: {
    page?: string;
    limit?: string;
    sort_by?: string;
    sort_order?: string;
    status?: string;
    search?: string;
    vehicle_id?: string;
    expense_category_id?: string;
    payment_mode_id?: string;
    date_from?: string;
    date_to?: string;
    include_deleted?: string;
  }) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...EXPENSE_ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['status', 'search', 'vehicle_id', 'expense_category_id', 'payment_mode_id']);

    let queryBuilder = db('expenses')
      .leftJoin('vehicles', 'expenses.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'expenses.expense_category_id', 'categories.id')
      .leftJoin('master_values as modes', 'expenses.payment_mode_id', 'modes.id')
      .select(
        'expenses.*',
        'vehicles.vehicle_number',
        'vehicles.vehicle_name',
        'categories.name as category_name',
        'modes.name as payment_mode_name'
      );

    if (query.include_deleted !== 'true') {
      queryBuilder = queryBuilder.whereNull('expenses.deleted_at');
    }

    if (filters.status) {
      queryBuilder = queryBuilder.where('expenses.status', filters.status);
    }

    if (filters.vehicle_id) {
      queryBuilder = queryBuilder.where('expenses.vehicle_id', filters.vehicle_id);
    }

    if (filters.expense_category_id) {
      queryBuilder = queryBuilder.where('expenses.expense_category_id', filters.expense_category_id);
    }

    if (filters.payment_mode_id) {
      queryBuilder = queryBuilder.where('expenses.payment_mode_id', filters.payment_mode_id);
    }

    if (query.date_from) {
      queryBuilder = queryBuilder.where('expenses.expense_date', '>=', query.date_from);
    }

    if (query.date_to) {
      queryBuilder = queryBuilder.where('expenses.expense_date', '<=', query.date_to);
    }

    if (filters.search) {
      queryBuilder = queryBuilder.where(function () {
        this.where('vehicles.vehicle_number', 'ilike', `%${filters.search}%`)
          .orWhere('vehicles.vehicle_name', 'ilike', `%${filters.search}%`)
          .orWhere('expenses.vendor', 'ilike', `%${filters.search}%`)
          .orWhere('expenses.invoice_number', 'ilike', `%${filters.search}%`)
          .orWhere('categories.name', 'ilike', `%${filters.search}%`);
      });
    }

    const countQuery = queryBuilder.clone();
    const countResult = await countQuery.count('* as count').first() as { count: string | number } | undefined;
    const total = Number(countResult?.count ?? 0);

    const expenses = await queryBuilder
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

    return { data: expenses, meta };
  }

  async findById(id: string) {
    const db = getDatabase();

    const expense = await db('expenses')
      .leftJoin('vehicles', 'expenses.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'expenses.expense_category_id', 'categories.id')
      .leftJoin('master_values as modes', 'expenses.payment_mode_id', 'modes.id')
      .select(
        'expenses.*',
        'vehicles.vehicle_number',
        'vehicles.vehicle_name',
        'categories.name as category_name',
        'modes.name as payment_mode_name'
      )
      .where('expenses.id', id)
      .whereNull('expenses.deleted_at')
      .first();

    if (!expense) throw new NotFoundError('Expense not found');

    return expense;
  }

  async update(id: string, data: UpdateExpenseDTO, updatedBy?: string) {
    const db = getDatabase();

    const expense = await db('expenses').where({ id }).first();
    if (!expense) throw new NotFoundError('Expense not found');

    if (data.expense_category_id) {
      const category = await db('master_values')
        .where({ id: data.expense_category_id, deleted_at: null })
        .whereExists(function () {
          this.select('*')
            .from('master_types')
            .whereRaw('master_types.id = master_values.master_type_id')
            .where('master_types.code', 'expense_category');
        })
        .first();
      if (!category) throw new NotFoundError('Expense category not found');
    }

    if (data.payment_mode_id) {
      const paymentMode = await db('master_values')
        .where({ id: data.payment_mode_id, deleted_at: null })
        .whereExists(function () {
          this.select('*')
            .from('master_types')
            .whereRaw('master_types.id = master_values.master_type_id')
            .where('master_types.code', 'payment_mode');
        })
        .first();
      if (!paymentMode) throw new NotFoundError('Payment mode not found');
    }

    if (data.vehicle_id) {
      const vehicle = await db('vehicles').where({ id: data.vehicle_id }).first();
      if (!vehicle) throw new NotFoundError('Vehicle not found');
    }

    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
      updated_by: updatedBy || null,
    };

    const fields: (keyof UpdateExpenseDTO)[] = [
      'vehicle_id', 'expense_category_id', 'payment_mode_id', 'expense_date',
      'amount', 'vendor', 'invoice_number', 'status', 'remarks',
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    await db('expenses').where({ id }).update(updateData);

    return this.findById(id);
  }

  async delete(id: string, deletedBy?: string) {
    const db = getDatabase();
    const expense = await db('expenses').where({ id }).first();
    if (!expense) throw new NotFoundError('Expense not found');

    await db('expenses').where({ id }).update({
      deleted_at: db.fn.now(),
      deleted_by: deletedBy || null,
      updated_at: db.fn.now(),
    });

    return { message: 'Expense deleted successfully' };
  }

  async restore(id: string, updatedBy?: string) {
    const db = getDatabase();
    const expense = await db('expenses').where({ id }).first();
    if (!expense) throw new NotFoundError('Expense not found');

    await db('expenses').where({ id }).update({
      deleted_at: null,
      deleted_by: null,
      updated_by: updatedBy || null,
      updated_at: db.fn.now(),
    });

    return this.findById(id);
  }

  async duplicate(id: string, createdBy?: string) {
    const db = getDatabase();
    const expense = await db('expenses').where({ id }).first();
    if (!expense) throw new NotFoundError('Expense not found');

    const [duplicated] = await db('expenses').insert({
      vehicle_id: expense.vehicle_id,
      expense_category_id: expense.expense_category_id,
      payment_mode_id: expense.payment_mode_id,
      expense_date: expense.expense_date,
      amount: expense.amount,
      vendor: expense.vendor,
      invoice_number: expense.invoice_number,
      status: 'PENDING',
      remarks: `Duplicated from ${expense.id}`,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');

    return this.findById(duplicated.id);
  }

  private async enrichExpense(expense: any): Promise<any> {
    const db = getDatabase();
    let vehicleNumber = null;
    let vehicleName = null;
    if (expense.vehicle_id) {
      const vehicle = await db('vehicles').where({ id: expense.vehicle_id }).select('vehicle_number', 'vehicle_name').first();
      vehicleNumber = vehicle?.vehicle_number || null;
      vehicleName = vehicle?.vehicle_name || null;
    }
    const category = await db('master_values').where({ id: expense.expense_category_id }).select('name').first();
    const mode = await db('master_values').where({ id: expense.payment_mode_id }).select('name').first();
    return {
      ...expense,
      vehicle_number: vehicleNumber,
      vehicle_name: vehicleName,
      category_name: category?.name || null,
      payment_mode_name: mode?.name || null,
    };
  }
}

export const expenseService = new ExpenseService();
