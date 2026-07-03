import { getDatabase } from '../../config/database';
import { revenueService } from './revenue.service';
import { expenseService } from './expense.service';
import { profitService } from './profit.service';
import { cashFlowService } from './cash-flow.service';

export class DashboardAggregationService {
  async getAggregatedMetrics() {
    const [todaysRevenue, monthlyRevenue, revenueByPlatform, revenueByVehicle, todaysExpenses, monthlyExpenses, expensesByCategory, netProfit, monthlyProfit, cashFlow] =
      await Promise.all([
        revenueService.getTodaysRevenue(),
        revenueService.getMonthlyRevenue(),
        this.getRevenueByPlatform(),
        this.getRevenueByVehicle(),
        expenseService.getTodaysExpenses(),
        expenseService.getMonthlyExpenses(),
        expenseService.getExpensesByCategory(),
        profitService.getNetProfit(),
        profitService.getMonthlyProfit(),
        cashFlowService.getCashFlowSummary(),
      ]);

    const latestBookings = await this.getLatestBookings(5);
    const activeBookings = await this.getActiveBookingCount();

    return {
      revenue: {
        todays: todaysRevenue,
        monthly: monthlyRevenue,
        by_platform: revenueByPlatform,
        by_vehicle: revenueByVehicle,
      },
      expenses: {
        todays: todaysExpenses,
        monthly: monthlyExpenses,
        by_category: expensesByCategory,
      },
      profit: {
        net: netProfit,
        monthly: monthlyProfit,
      },
      cash_flow: cashFlow,
      bookings: {
        active: activeBookings,
        latest: latestBookings,
      },
    };
  }

  private async getRevenueByPlatform(): Promise<{ platform_id: string; platform_name: string; total: number }[]> {
    const db = getDatabase();
    const rows = await db('bookings')
      .leftJoin('master_values as platforms', 'bookings.platform_id', 'platforms.id')
      .whereNull('bookings.deleted_at')
      .whereIn('bookings.status', ['COMPLETED', 'CONFIRMED'])
      .groupBy('bookings.platform_id', 'platforms.name')
      .select('bookings.platform_id', 'platforms.name as platform_name')
      .sum('bookings.net_revenue as total');
    return rows.map((r: any) => ({
      platform_id: r.platform_id,
      platform_name: r.platform_name || 'Unknown',
      total: Math.round(Number(r.total ?? 0) * 100) / 100,
    }));
  }

  private async getRevenueByVehicle(): Promise<{ vehicle_id: string; vehicle_number: string; total: number }[]> {
    const db = getDatabase();
    const rows = await db('bookings')
      .leftJoin('vehicles', 'bookings.vehicle_id', 'vehicles.id')
      .whereNull('bookings.deleted_at')
      .whereIn('bookings.status', ['COMPLETED', 'CONFIRMED'])
      .groupBy('bookings.vehicle_id', 'vehicles.vehicle_number')
      .select('bookings.vehicle_id', 'vehicles.vehicle_number')
      .sum('bookings.net_revenue as total');
    return rows.map((r: any) => ({
      vehicle_id: r.vehicle_id,
      vehicle_number: r.vehicle_number || 'Unknown',
      total: Math.round(Number(r.total ?? 0) * 100) / 100,
    }));
  }

  async getLatestBookings(limit: number = 5): Promise<any[]> {
    const db = getDatabase();
    return db('bookings')
      .leftJoin('vehicles', 'bookings.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as platforms', 'bookings.platform_id', 'platforms.id')
      .select(
        'bookings.*',
        'vehicles.vehicle_number',
        'vehicles.vehicle_name',
        'platforms.name as platform_name'
      )
      .whereNull('bookings.deleted_at')
      .orderBy('bookings.created_at', 'desc')
      .limit(limit);
  }

  private async getActiveBookingCount(): Promise<number> {
    const db = getDatabase();
    const result = await db('bookings')
      .whereNull('deleted_at')
      .whereIn('status', ['CONFIRMED', 'PENDING'])
      .count('* as count')
      .first();
    return Number(result?.count ?? 0);
  }
}

export const dashboardAggregationService = new DashboardAggregationService();
