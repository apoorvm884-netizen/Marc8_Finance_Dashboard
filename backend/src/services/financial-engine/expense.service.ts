import { getDatabase } from '../../config/database';

export class ExpenseService {
  async getTotalExpenses(): Promise<number> {
    const db = getDatabase();
    const result = await db('expenses')
      .whereNull('deleted_at')
      .whereIn('status', ['APPROVED', 'REIMBURSED'])
      .sum('amount as total')
      .first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getTodaysExpenses(): Promise<number> {
    const db = getDatabase();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const result = await db('expenses')
      .whereNull('deleted_at')
      .whereIn('status', ['APPROVED', 'REIMBURSED'])
      .where('expense_date', '>=', todayStart)
      .sum('amount as total')
      .first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getWeeklyExpenses(): Promise<number> {
    const db = getDatabase();
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).toISOString();
    const result = await db('expenses')
      .whereNull('deleted_at')
      .whereIn('status', ['APPROVED', 'REIMBURSED'])
      .where('expense_date', '>=', weekStart)
      .sum('amount as total')
      .first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getMonthlyExpenses(): Promise<number> {
    const db = getDatabase();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const result = await db('expenses')
      .whereNull('deleted_at')
      .whereIn('status', ['APPROVED', 'REIMBURSED'])
      .where('expense_date', '>=', monthStart)
      .sum('amount as total')
      .first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getYearlyExpenses(): Promise<number> {
    const db = getDatabase();
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
    const result = await db('expenses')
      .whereNull('deleted_at')
      .whereIn('status', ['APPROVED', 'REIMBURSED'])
      .where('expense_date', '>=', yearStart)
      .sum('amount as total')
      .first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getVehicleExpense(vehicleId: string): Promise<number> {
    const db = getDatabase();
    const result = await db('expenses')
      .whereNull('deleted_at')
      .whereIn('status', ['APPROVED', 'REIMBURSED'])
      .where('vehicle_id', vehicleId)
      .sum('amount as total')
      .first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getExpensesByCategory(): Promise<{ category_id: string; category_name: string; total: number; percentage: number }[]> {
    const db = getDatabase();
    const totalResult = await this.getTotalExpenses();
    const rows = await db('expenses')
      .leftJoin('master_values as categories', 'expenses.expense_category_id', 'categories.id')
      .whereNull('expenses.deleted_at')
      .whereIn('expenses.status', ['APPROVED', 'REIMBURSED'])
      .groupBy('expenses.expense_category_id', 'categories.name')
      .select(
        'expenses.expense_category_id as category_id',
        'categories.name as category_name'
      )
      .sum('expenses.amount as total');
    return rows.map((r: any) => ({
      category_id: r.category_id,
      category_name: r.category_name || 'Unknown',
      total: Math.round(Number(r.total ?? 0) * 100) / 100,
      percentage: totalResult > 0 ? Math.round((Number(r.total ?? 0) / totalResult) * 10000) / 100 : 0,
    }));
  }

  async getExpensesByVehicle(): Promise<{ vehicle_id: string; vehicle_number: string; total: number }[]> {
    const db = getDatabase();
    const rows = await db('expenses')
      .leftJoin('vehicles', 'expenses.vehicle_id', 'vehicles.id')
      .whereNull('expenses.deleted_at')
      .whereIn('expenses.status', ['APPROVED', 'REIMBURSED'])
      .whereNotNull('expenses.vehicle_id')
      .groupBy('expenses.vehicle_id', 'vehicles.vehicle_number')
      .select(
        'expenses.vehicle_id',
        'vehicles.vehicle_number'
      )
      .sum('expenses.amount as total');
    return rows.map((r: any) => ({
      vehicle_id: r.vehicle_id,
      vehicle_number: r.vehicle_number || 'Unknown',
      total: Math.round(Number(r.total ?? 0) * 100) / 100,
    }));
  }

  async getExpensesByPaymentMode(): Promise<{ payment_mode_id: string; payment_mode_name: string; total: number }[]> {
    const db = getDatabase();
    const rows = await db('expenses')
      .leftJoin('master_values as modes', 'expenses.payment_mode_id', 'modes.id')
      .whereNull('expenses.deleted_at')
      .whereIn('expenses.status', ['APPROVED', 'REIMBURSED'])
      .groupBy('expenses.payment_mode_id', 'modes.name')
      .select(
        'expenses.payment_mode_id',
        'modes.name as payment_mode_name'
      )
      .sum('expenses.amount as total');
    return rows.map((r: any) => ({
      payment_mode_id: r.payment_mode_id,
      payment_mode_name: r.payment_mode_name || 'Unknown',
      total: Math.round(Number(r.total ?? 0) * 100) / 100,
    }));
  }

  async getExpenseTrend(months: number = 12): Promise<{ month: string; total: number }[]> {
    const db = getDatabase();
    const rows = await db('expenses')
      .whereNull('deleted_at')
      .whereIn('status', ['APPROVED', 'REIMBURSED'])
      .groupBy(db.raw("to_char(expense_date, 'YYYY-MM')"))
      .select(db.raw("to_char(expense_date, 'YYYY-MM') as month"))
      .sum('amount as total')
      .orderBy('month', 'asc')
      .limit(months);
    return rows.map((r: any) => ({ month: r.month, total: Math.round(Number(r.total ?? 0) * 100) / 100 }));
  }

  async getLargeExpenses(threshold: number = 10000): Promise<any[]> {
    const db = getDatabase();
    return db('expenses')
      .leftJoin('vehicles', 'expenses.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'expenses.expense_category_id', 'categories.id')
      .whereNull('expenses.deleted_at')
      .where('expenses.amount', '>=', threshold)
      .orderBy('expenses.amount', 'desc')
      .limit(20)
      .select(
        'expenses.*',
        'vehicles.vehicle_number',
        'categories.name as category_name'
      );
  }
}

export const expenseService = new ExpenseService();
