import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError, ConflictError } from '../utils/errors';

const OUTSTANDING_ALLOWED_SORT_FIELDS = ['due_date', 'amount', 'priority', 'status', 'title', 'created_at'] as const;

export class OutstandingService {
  async create(data: {
    title: string;
    outstanding_category_id: string;
    vehicle_id?: string | null;
    platform_id?: string | null;
    vendor?: string | null;
    amount: number;
    due_date: string;
    priority?: string;
    status?: string;
    notes?: string | null;
  }, createdBy?: string) {
    const db = getDatabase();

    const category = await db('master_values')
      .where({ id: data.outstanding_category_id, deleted_at: null })
      .whereExists(function () {
        this.select('*').from('master_types')
          .whereRaw('master_types.id = master_values.master_type_id')
          .where('master_types.code', 'outstanding_category');
      }).first();
    if (!category) throw new NotFoundError('Outstanding category not found');

    if (data.vehicle_id) {
      const vehicle = await db('vehicles').where({ id: data.vehicle_id }).first();
      if (!vehicle) throw new NotFoundError('Vehicle not found');
    }

    if (data.platform_id) {
      const platform = await db('master_values').where({ id: data.platform_id, deleted_at: null }).first();
      if (!platform) throw new NotFoundError('Platform not found');
    }

    const computedStatus = this.computeStatus(data.due_date, data.status || 'upcoming');

    const [outstanding] = await db('outstandings').insert({
      title: data.title,
      outstanding_category_id: data.outstanding_category_id,
      vehicle_id: data.vehicle_id || null,
      platform_id: data.platform_id || null,
      vendor: data.vendor || null,
      amount: data.amount,
      due_date: data.due_date,
      priority: data.priority || 'normal',
      status: computedStatus,
      notes: data.notes || null,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');

    return this.enrichOutstanding(outstanding);
  }

  async findAll(query: {
    page?: string; limit?: string; sort_by?: string; sort_order?: string;
    status?: string; priority?: string; search?: string;
    vehicle_id?: string; platform_id?: string; outstanding_category_id?: string;
    date_from?: string; date_to?: string;
    due_date_from?: string; due_date_to?: string;
    include_deleted?: string;
  }) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...OUTSTANDING_ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, [
      'status', 'priority', 'search', 'vehicle_id', 'platform_id', 'outstanding_category_id'
    ]);

    let queryBuilder = db('outstandings')
      .leftJoin('vehicles', 'outstandings.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'outstandings.outstanding_category_id', 'categories.id')
      .leftJoin('master_values as platforms', 'outstandings.platform_id', 'platforms.id')
      .leftJoin('expenses', 'outstandings.paid_as_expense_id', 'expenses.id')
      .select(
        'outstandings.*',
        'vehicles.vehicle_number',
        'vehicles.vehicle_name',
        'categories.name as category_name',
        'categories.color as category_color',
        'platforms.name as platform_name',
        'expenses.amount as expense_amount',
        'expenses.status as expense_status'
      );

    if (query.include_deleted !== 'true') {
      queryBuilder = queryBuilder.whereNull('outstandings.deleted_at');
    }

    if (filters.status) {
      queryBuilder = queryBuilder.where('outstandings.status', filters.status);
    }
    if (filters.priority) {
      queryBuilder = queryBuilder.where('outstandings.priority', filters.priority);
    }
    if (filters.vehicle_id) {
      queryBuilder = queryBuilder.where('outstandings.vehicle_id', filters.vehicle_id);
    }
    if (filters.platform_id) {
      queryBuilder = queryBuilder.where('outstandings.platform_id', filters.platform_id);
    }
    if (filters.outstanding_category_id) {
      queryBuilder = queryBuilder.where('outstandings.outstanding_category_id', filters.outstanding_category_id);
    }
    if (query.due_date_from) {
      queryBuilder = queryBuilder.where('outstandings.due_date', '>=', query.due_date_from);
    }
    if (query.due_date_to) {
      queryBuilder = queryBuilder.where('outstandings.due_date', '<=', query.due_date_to);
    }

    if (filters.search) {
      queryBuilder = queryBuilder.where(function () {
        this.where('outstandings.title', 'ilike', `%${filters.search}%`)
          .orWhere('outstandings.vendor', 'ilike', `%${filters.search}%`)
          .orWhere('vehicles.vehicle_number', 'ilike', `%${filters.search}%`)
          .orWhere('vehicles.vehicle_name', 'ilike', `%${filters.search}%`)
          .orWhere('categories.name', 'ilike', `%${filters.search}%`);
      });
    }

    const countQuery = queryBuilder.clone();
    const countResult = await countQuery.count('* as count').first() as { count: string | number } | undefined;
    const total = Number(countResult?.count ?? 0);

    const outstandings = await queryBuilder
      .orderBy(sort.column, sort.order)
      .limit(pagination.limit)
      .offset(pagination.offset);

    return {
      data: outstandings,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        hasNextPage: pagination.page * pagination.limit < total,
        hasPreviousPage: pagination.page > 1,
      },
    };
  }

  async findById(id: string) {
    const db = getDatabase();
    const outstanding = await db('outstandings')
      .leftJoin('vehicles', 'outstandings.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'outstandings.outstanding_category_id', 'categories.id')
      .leftJoin('master_values as platforms', 'outstandings.platform_id', 'platforms.id')
      .leftJoin('expenses', 'outstandings.paid_as_expense_id', 'expenses.id')
      .select(
        'outstandings.*',
        'vehicles.vehicle_number',
        'vehicles.vehicle_name',
        'categories.name as category_name',
        'categories.color as category_color',
        'platforms.name as platform_name',
        'expenses.amount as expense_amount',
        'expenses.status as expense_status'
      )
      .where('outstandings.id', id)
      .whereNull('outstandings.deleted_at')
      .first();

    if (!outstanding) throw new NotFoundError('Outstanding not found');
    return outstanding;
  }

  async update(id: string, data: Record<string, unknown>, updatedBy?: string) {
    const db = getDatabase();
    const outstanding = await db('outstandings').where({ id }).first();
    if (!outstanding) throw new NotFoundError('Outstanding not found');
    if (outstanding.deleted_at) throw new NotFoundError('Outstanding is deleted');
    if (outstanding.status === 'paid' && data.status !== 'paid') {
      throw new ConflictError('Cannot modify a paid outstanding. Use restore first.');
    }

    const stringFields = ['title', 'vendor', 'notes', 'priority', 'status',
      'outstanding_category_id', 'vehicle_id', 'platform_id'
    ] as const;
    const numFields = ['amount'] as const;

    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
      updated_by: updatedBy || null,
    };

    for (const field of stringFields) {
      if (data[field] !== undefined) {
        const val = data[field];
        updateData[field] = val === '' || val === null ? null : val;
      }
    }
    for (const field of numFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }
    if (data.due_date !== undefined) {
      updateData.due_date = data.due_date;
    }

    if (updateData.due_date || updateData.status === undefined) {
      const newDueDate = (updateData.due_date as string) || outstanding.due_date;
      const newStatus = data.status as string || outstanding.status;
      updateData.status = this.computeStatus(newDueDate, newStatus);
    }

    await db('outstandings').where({ id }).update(updateData);
    return this.findById(id);
  }

  async delete(id: string, deletedBy?: string) {
    const db = getDatabase();
    const outstanding = await db('outstandings').where({ id }).first();
    if (!outstanding) throw new NotFoundError('Outstanding not found');

    await db('outstandings').where({ id }).update({
      deleted_at: db.fn.now(),
      deleted_by: deletedBy || null,
      updated_at: db.fn.now(),
    });
    return { message: 'Outstanding deleted successfully' };
  }

  async restore(id: string, updatedBy?: string) {
    const db = getDatabase();
    const outstanding = await db('outstandings').where({ id }).first();
    if (!outstanding) throw new NotFoundError('Outstanding not found');

    const computedStatus = this.computeStatus(outstanding.due_date, 'upcoming');

    await db('outstandings').where({ id }).update({
      deleted_at: null,
      deleted_by: null,
      status: computedStatus,
      updated_by: updatedBy || null,
      updated_at: db.fn.now(),
    });
    return this.findById(id);
  }

  async markAsPaid(id: string, data: {
    payment_mode_id: string;
    expense_category_id: string;
    paid_amount?: number;
    paid_date?: string;
    notes?: string | null;
  }, paidBy?: string) {
    const db = getDatabase();
    const outstanding = await db('outstandings').where({ id }).first();
    if (!outstanding) throw new NotFoundError('Outstanding not found');
    if (outstanding.deleted_at) throw new NotFoundError('Outstanding is deleted');
    if (outstanding.status === 'paid') throw new ConflictError('Outstanding is already paid');
    if (outstanding.status === 'cancelled') throw new ConflictError('Outstanding is cancelled');

    const paymentMode = await db('master_values')
      .where({ id: data.payment_mode_id, deleted_at: null })
      .whereExists(function () {
        this.select('*').from('master_types')
          .whereRaw('master_types.id = master_values.master_type_id')
          .where('master_types.code', 'payment_mode');
      }).first();
    if (!paymentMode) throw new NotFoundError('Payment mode not found');

    const expenseCategory = await db('master_values')
      .where({ id: data.expense_category_id, deleted_at: null })
      .whereExists(function () {
        this.select('*').from('master_types')
          .whereRaw('master_types.id = master_values.master_type_id')
          .where('master_types.code', 'expense_category');
      }).first();
    if (!expenseCategory) throw new NotFoundError('Expense category not found');

    const paidAmount = data.paid_amount ?? outstanding.amount;
    const paidDate = data.paid_date || new Date().toISOString().split('T')[0];
    const newStatus = paidAmount >= outstanding.amount ? 'paid' : 'partially_paid';

    const [expense] = await db('expenses').insert({
      vehicle_id: outstanding.vehicle_id,
      expense_category_id: data.expense_category_id,
      payment_mode_id: data.payment_mode_id,
      expense_date: paidDate,
      amount: paidAmount,
      vendor: outstanding.vendor || `Outstanding: ${outstanding.title}`,
      remarks: data.notes || `Auto-generated from outstanding: ${outstanding.title}`,
      status: 'APPROVED',
      created_by: paidBy || null,
      updated_by: paidBy || null,
    }).returning('*');

    await db('outstandings').where({ id }).update({
      status: newStatus,
      paid_as_expense_id: expense.id,
      paid_amount: paidAmount,
      paid_at: db.fn.now(),
      notes: data.notes !== undefined ? data.notes : outstanding.notes,
      updated_at: db.fn.now(),
      updated_by: paidBy || null,
    });

    return this.findById(id);
  }

  async getPaymentPlanner(filters?: {
    date_from?: string;
    date_to?: string;
    vehicle_id?: string;
  }): Promise<{
    total_outstanding: number;
    due_today: number;
    due_this_week: number;
    due_this_month: number;
    overdue_amount: number;
    upcoming_payments: number;
    largest_liability: { title: string; amount: number } | null;
  }> {
    const db = getDatabase();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekEnd = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    let baseQuery = db('outstandings')
      .whereNull('deleted_at')
      .whereNotIn('status', ['paid', 'cancelled']);

    if (filters?.vehicle_id) {
      baseQuery = baseQuery.where('vehicle_id', filters.vehicle_id);
    }

    const [totalResult, dueTodayResult, dueWeekResult, dueMonthResult, overdueResult, largestResult] = await Promise.all([
      baseQuery.clone().sum('amount as total').first(),
      baseQuery.clone().where('due_date', today).sum('amount as total').first(),
      baseQuery.clone().where('due_date', '>=', today).where('due_date', '<=', weekEnd).sum('amount as total').first(),
      baseQuery.clone().where('due_date', '>=', today).where('due_date', '<=', monthEnd).sum('amount as total').first(),
      baseQuery.clone().where('due_date', '<', today).sum('amount as total').first(),
      baseQuery.clone().orderBy('amount', 'desc').select('title', 'amount').first(),
    ]);

    return {
      total_outstanding: Math.round(Number(totalResult?.total ?? 0) * 100) / 100,
      due_today: Math.round(Number(dueTodayResult?.total ?? 0) * 100) / 100,
      due_this_week: Math.round(Number(dueWeekResult?.total ?? 0) * 100) / 100,
      due_this_month: Math.round(Number(dueMonthResult?.total ?? 0) * 100) / 100,
      overdue_amount: Math.round(Number(overdueResult?.total ?? 0) * 100) / 100,
      upcoming_payments: Number(await baseQuery.clone().count('* as count').first().then((r: any) => r?.count ?? 0)),
      largest_liability: largestResult ? { title: largestResult.title, amount: Math.round(Number(largestResult.amount) * 100) / 100 } : null,
    };
  }

  async getCashRequirementForecast(filters?: {
    months?: number;
  }): Promise<{
    next_7_days: number;
    next_30_days: number;
    current_month: number;
    quarter: number;
    year: number;
    outstanding_breakdown: { category_name: string; total: number }[];
    expense_forecast: { month: string; total: number }[];
  }> {
    const db = getDatabase();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const in7Days = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];
    const in30Days = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0).toISOString().split('T')[0];
    const yearEnd = new Date(now.getFullYear() + 1, 0, 0).toISOString().split('T')[0];

    const unpaidQuery = db('outstandings')
      .whereNull('deleted_at')
      .whereNotIn('status', ['paid', 'cancelled']);

    const sumDueIn = (endDate: string) =>
      unpaidQuery.clone().where('due_date', '>=', today).where('due_date', '<=', endDate).sum('amount as total').first();

    const [sevenDay, thirtyDay, currMonth, quarter, year, breakdown, expenseForecast] = await Promise.all([
      sumDueIn(in7Days),
      sumDueIn(in30Days),
      sumDueIn(monthEnd),
      sumDueIn(quarterEnd),
      sumDueIn(yearEnd),
      unpaidQuery.clone()
        .leftJoin('master_values as categories', 'outstandings.outstanding_category_id', 'categories.id')
        .groupBy('categories.name')
        .select('categories.name as category_name')
        .sum('amount as total'),
      db('expenses')
        .whereNull('deleted_at')
        .whereIn('status', ['APPROVED', 'REIMBURSED'])
        .where('expense_date', '>=', today)
        .groupBy(db.raw("to_char(expense_date::date, 'YYYY-MM')"))
        .select(db.raw("to_char(expense_date::date, 'YYYY-MM') as month"))
        .sum('amount as total')
        .orderBy('month', 'asc')
        .limit(12),
    ]);

    return {
      next_7_days: Math.round(Number((sevenDay as any)?.total ?? 0) * 100) / 100,
      next_30_days: Math.round(Number((thirtyDay as any)?.total ?? 0) * 100) / 100,
      current_month: Math.round(Number((currMonth as any)?.total ?? 0) * 100) / 100,
      quarter: Math.round(Number((quarter as any)?.total ?? 0) * 100) / 100,
      year: Math.round(Number((year as any)?.total ?? 0) * 100) / 100,
      outstanding_breakdown: (breakdown || []).map((r: any) => ({
        category_name: r.category_name || 'Unknown',
        total: Math.round(Number(r.total ?? 0) * 100) / 100,
      })),
      expense_forecast: (expenseForecast || []).map((r: any) => ({
        month: r.month,
        total: Math.round(Number(r.total ?? 0) * 100) / 100,
      })),
    };
  }

  async getVehicleFinancialIntelligence(vehicleId: string) {
    const db = getDatabase();
    const vehicle = await db('vehicles').where({ id: vehicleId }).first();
    if (!vehicle) throw new NotFoundError('Vehicle not found');

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];

    const [
      revenueResult,
      expenseResult,
      outstandingResult,
      revenueTrend,
      expenseTrend,
      outstandingTrend,
      insuranceDue,
      permitDue,
      roadTaxDue,
      fitnessDue,
      pollutionDue,
      rcDue,
      serviceDue,
    ] = await Promise.all([
      db('bookings').whereNull('deleted_at').where('vehicle_id', vehicleId).whereIn('status', ['COMPLETED', 'CONFIRMED']).sum('net_revenue as total').first(),
      db('expenses').whereNull('deleted_at').where('vehicle_id', vehicleId).whereIn('status', ['APPROVED', 'REIMBURSED']).sum('amount as total').first(),
      db('outstandings').whereNull('deleted_at').where('vehicle_id', vehicleId).whereNotIn('status', ['paid', 'cancelled']).sum('amount as total').first(),
      db('bookings').whereNull('deleted_at').where('vehicle_id', vehicleId).whereIn('status', ['COMPLETED', 'CONFIRMED'])
        .groupBy(db.raw("to_char(created_at::date, 'YYYY-MM')"))
        .select(db.raw("to_char(created_at::date, 'YYYY-MM') as month"))
        .sum('net_revenue as total')
        .orderBy('month', 'asc')
        .limit(12),
      db('expenses').whereNull('deleted_at').where('vehicle_id', vehicleId).whereIn('status', ['APPROVED', 'REIMBURSED'])
        .groupBy(db.raw("to_char(expense_date::date, 'YYYY-MM')"))
        .select(db.raw("to_char(expense_date::date, 'YYYY-MM') as month"))
        .sum('amount as total')
        .orderBy('month', 'asc')
        .limit(12),
      db('outstandings').whereNull('deleted_at').where('vehicle_id', vehicleId).whereNotIn('status', ['paid', 'cancelled'])
        .groupBy(db.raw("to_char(due_date, 'YYYY-MM')"))
        .select(db.raw("to_char(due_date, 'YYYY-MM') as month"))
        .sum('amount as total')
        .orderBy('month', 'asc')
        .limit(12),
      vehicle.insurance_expiry,
      vehicle.permit_expiry,
      vehicle.road_tax_expiry,
      vehicle.fitness_expiry,
      vehicle.pollution_expiry,
      vehicle.rc_expiry,
      null,
    ]);

    const totalRevenue = Math.round(Number(revenueResult?.total ?? 0) * 100) / 100;
    const totalExpense = Math.round(Number(expenseResult?.total ?? 0) * 100) / 100;
    const totalOutstanding = Math.round(Number(outstandingResult?.total ?? 0) * 100) / 100;
    const profit = Math.round((totalRevenue - totalExpense) * 100) / 100;
    const netMargin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 10000) / 100 : 0;

    return {
      revenue: totalRevenue,
      expense: totalExpense,
      outstanding: totalOutstanding,
      profit,
      net_margin: netMargin,
      documents_due: {
        insurance: insuranceDue,
        permit: permitDue,
        road_tax: roadTaxDue,
        fitness: fitnessDue,
        pollution: pollutionDue,
        rc: rcDue,
        service: serviceDue,
      },
      revenue_trend: (revenueTrend || []).map((r: any) => ({ month: r.month, total: Math.round(Number(r.total) * 100) / 100 })),
      expense_trend: (expenseTrend || []).map((r: any) => ({ month: r.month, total: Math.round(Number(r.total) * 100) / 100 })),
      outstanding_trend: (outstandingTrend || []).map((r: any) => ({ month: r.month, total: Math.round(Number(r.total) * 100) / 100 })),
    };
  }

  async getPlatformAnalytics(filters?: {
    date_from?: string;
    date_to?: string;
  }) {
    const db = getDatabase();
    let bookingQuery = db('bookings').whereNull('deleted_at').whereIn('status', ['COMPLETED', 'CONFIRMED']);
    let outstandingQuery = db('outstandings').whereNull('deleted_at').whereNotIn('status', ['paid', 'cancelled']);

    if (filters?.date_from) {
      bookingQuery = bookingQuery.where('booking_date_time', '>=', filters.date_from);
      outstandingQuery = outstandingQuery.where('created_at', '>=', filters.date_from);
    }
    if (filters?.date_to) {
      bookingQuery = bookingQuery.where('booking_date_time', '<=', filters.date_to);
      outstandingQuery = outstandingQuery.where('created_at', '<=', filters.date_to);
    }

    const [revenueByPlatform, bookingsByPlatform, outstandingByPlatform, platformCount] = await Promise.all([
      bookingQuery.clone()
        .leftJoin('master_values as platforms', 'bookings.platform_id', 'platforms.id')
        .groupBy('platforms.id', 'platforms.name')
        .select('platforms.id as platform_id', 'platforms.name as platform_name')
        .sum('bookings.net_revenue as total')
        .sum('bookings.gross_fare as gross_fare')
        .sum('bookings.platform_commission as commission')
        .orderByRaw('SUM(bookings.net_revenue) DESC'),
      bookingQuery.clone()
        .groupBy('platform_id')
        .select('platform_id')
        .count('* as total'),
      outstandingQuery.clone()
        .leftJoin('master_values as platforms', 'outstandings.platform_id', 'platforms.id')
        .groupBy('platforms.id', 'platforms.name')
        .select('platforms.id as platform_id', 'platforms.name as platform_name')
        .sum('amount as total'),
      db('master_values').whereNull('deleted_at')
        .whereExists(function () {
          this.select('*').from('master_types')
            .whereRaw('master_types.id = master_values.master_type_id')
            .where('master_types.code', 'platform');
        }).count('* as count').first(),
    ]);

    return {
      revenue_by_platform: (revenueByPlatform || []).map((r: any) => ({
        platform_id: r.platform_id,
        platform_name: r.platform_name || 'Unknown',
        total_revenue: Math.round(Number(r.total ?? 0) * 100) / 100,
        gross_fare: Math.round(Number(r.gross_fare ?? 0) * 100) / 100,
        commission: Math.round(Number(r.commission ?? 0) * 100) / 100,
      })),
      bookings_by_platform: (bookingsByPlatform || []).map((r: any) => ({
        platform_id: r.platform_id,
        total: Number(r.total ?? 0),
      })),
      outstanding_by_platform: (outstandingByPlatform || []).map((r: any) => ({
        platform_id: r.platform_id,
        platform_name: r.platform_name || 'Unknown',
        total: Math.round(Number(r.total ?? 0) * 100) / 100,
      })),
      total_platforms: Number(platformCount?.count ?? 0),
    };
  }

  computeStatus(dueDate: string, currentStatus: string): string {
    if (['paid', 'cancelled'].includes(currentStatus)) return currentStatus;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    if (dueDate < today) return 'overdue';
    if (dueDate === today) return 'due_today';
    return 'upcoming';
  }

  private async enrichOutstanding(outstanding: any): Promise<any> {
    const db = getDatabase();
    let vehicleNumber: string | null = null;
    let vehicleName: string | null = null;
    if (outstanding.vehicle_id) {
      const vehicle = await db('vehicles').where({ id: outstanding.vehicle_id }).select('vehicle_number', 'vehicle_name').first();
      vehicleNumber = vehicle?.vehicle_number || null;
      vehicleName = vehicle?.vehicle_name || null;
    }
    const category = await db('master_values').where({ id: outstanding.outstanding_category_id }).select('name', 'color').first();
    let platformName: string | null = null;
    if (outstanding.platform_id) {
      const platform = await db('master_values').where({ id: outstanding.platform_id }).select('name').first();
      platformName = platform?.name || null;
    }
    let expenseAmount: number | null = null;
    let expenseStatus: string | null = null;
    if (outstanding.paid_as_expense_id) {
      const expense = await db('expenses').where({ id: outstanding.paid_as_expense_id }).select('amount', 'status').first();
      expenseAmount = expense?.amount || null;
      expenseStatus = expense?.status || null;
    }
    return {
      ...outstanding,
      vehicle_number: vehicleNumber,
      vehicle_name: vehicleName,
      category_name: category?.name || null,
      category_color: category?.color || null,
      platform_name: platformName,
      expense_amount: expenseAmount,
      expense_status: expenseStatus,
    };
  }
}

export const outstandingService = new OutstandingService();
