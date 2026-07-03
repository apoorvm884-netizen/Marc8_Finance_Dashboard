import { getDatabase } from '../../config/database';
import { revenueService } from './revenue.service';
import { expenseService } from './expense.service';

export class ProfitService {
  async getNetProfit(): Promise<number> {
    const totalRevenue = await this.getTotalRevenue();
    const totalExpenses = await expenseService.getTotalExpenses();
    return Math.round((totalRevenue - totalExpenses) * 100) / 100;
  }

  async getDailyProfit(): Promise<number> {
    const todaysRevenue = await revenueService.getTodaysRevenue();
    const todaysExpenses = await expenseService.getTodaysExpenses();
    return Math.round((todaysRevenue - todaysExpenses) * 100) / 100;
  }

  async getWeeklyProfit(): Promise<number> {
    const weeklyRevenue = await revenueService.getWeeklyRevenue();
    const weeklyExpenses = await expenseService.getWeeklyExpenses();
    return Math.round((weeklyRevenue - weeklyExpenses) * 100) / 100;
  }

  async getMonthlyProfit(): Promise<number> {
    const monthlyRevenue = await revenueService.getMonthlyRevenue();
    const monthlyExpenses = await expenseService.getMonthlyExpenses();
    return Math.round((monthlyRevenue - monthlyExpenses) * 100) / 100;
  }

  async getYearlyProfit(): Promise<number> {
    const yearlyRevenue = await revenueService.getYearlyRevenue();
    const yearlyExpenses = await expenseService.getYearlyExpenses();
    return Math.round((yearlyRevenue - yearlyExpenses) * 100) / 100;
  }

  async getVehicleProfit(vehicleId: string): Promise<{ revenue: number; expense: number; profit: number }> {
    const [revenue, expense] = await Promise.all([
      revenueService.getVehicleRevenue(vehicleId),
      expenseService.getVehicleExpense(vehicleId),
    ]);
    return {
      revenue: Math.round(revenue * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      profit: Math.round((revenue - expense) * 100) / 100,
    };
  }

  async getNetMargin(): Promise<number> {
    const totalRevenue = await this.getTotalRevenue();
    const netProfit = await this.getNetProfit();
    if (totalRevenue === 0) return 0;
    return Math.round((netProfit / totalRevenue) * 10000) / 100;
  }

  async getProfitTrend(months: number = 12): Promise<{ month: string; total: number }[]> {
    const [revenueTrend, expenseTrend] = await Promise.all([
      revenueService.getRevenueTrend(months),
      expenseService.getExpenseTrend(months),
    ]);
    const monthMap = new Map<string, { revenue: number; expense: number }>();
    for (const r of revenueTrend) {
      if (!monthMap.has(r.month)) monthMap.set(r.month, { revenue: 0, expense: 0 });
      monthMap.get(r.month)!.revenue = r.total;
    }
    for (const e of expenseTrend) {
      if (!monthMap.has(e.month)) monthMap.set(e.month, { revenue: 0, expense: 0 });
      monthMap.get(e.month)!.expense = e.total;
    }
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, vals]) => ({
        month,
        total: Math.round((vals.revenue - vals.expense) * 100) / 100,
      }));
  }

  getNetMarginPercent(revenue: number, expense: number): number {
    if (revenue === 0) return 0;
    return Math.round(((revenue - expense) / revenue) * 10000) / 100;
  }

  private async getTotalRevenue(): Promise<number> {
    const db = getDatabase();
    const result = await db('bookings')
      .whereNull('deleted_at')
      .whereIn('status', ['COMPLETED', 'CONFIRMED'])
      .sum('net_revenue as total')
      .first();
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }
}

export const profitService = new ProfitService();
