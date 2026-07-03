import { revenueService } from './revenue.service';
import { expenseService } from './expense.service';
import { profitService } from './profit.service';
import { cashFlowService } from './cash-flow.service';
import { fleetAnalyticsService } from './fleet-analytics.service';

export class AnalyticsService {
  async getRevenueAnalytics(_filters?: { date_from?: string; date_to?: string; vehicle_id?: string; platform_id?: string }) {
    const [trend, growth, platformPerformance, vehicleRevenue, heatmap] = await Promise.all([
      revenueService.getRevenueTrend(12),
      revenueService.getRevenueGrowth(),
      revenueService.getPlatformPerformance(),
      fleetAnalyticsService.getRevenuePerVehicle(),
      revenueService.getRevenueHeatmap(),
    ]);

    return {
      trend,
      growth,
      platform_performance: platformPerformance,
      vehicle_revenue: vehicleRevenue,
      heatmap,
    };
  }

  async getExpenseAnalytics(_filters?: { date_from?: string; date_to?: string; expense_category_id?: string; payment_mode_id?: string }) {
    const [trend, byCategory, byPaymentMode, byVehicle, large] = await Promise.all([
      expenseService.getExpenseTrend(12),
      expenseService.getExpensesByCategory(),
      expenseService.getExpensesByPaymentMode(),
      expenseService.getExpensesByVehicle(),
      expenseService.getLargeExpenses(5000),
    ]);

    return {
      trend,
      by_category: byCategory,
      by_payment_mode: byPaymentMode,
      by_vehicle: byVehicle,
      large_expenses: large,
    };
  }

  async getProfitAnalytics(_filters?: { date_from?: string; date_to?: string }) {
    const [daily, weekly, monthly, yearly, trend, netMargin, vehicleProfitability] = await Promise.all([
      profitService.getDailyProfit(),
      profitService.getWeeklyProfit(),
      profitService.getMonthlyProfit(),
      profitService.getYearlyProfit(),
      profitService.getProfitTrend(12),
      profitService.getNetMargin(),
      fleetAnalyticsService.getVehicleProfitability(),
    ]);

    return {
      daily,
      weekly,
      monthly,
      yearly,
      trend,
      net_margin: netMargin,
      vehicle_profitability: vehicleProfitability,
    };
  }

  async getVehiclePerformance(_filters?: { vehicle_id?: string }) {
    const [vehicleProfitability, topPerforming, lowestPerforming, fleetSummary] = await Promise.all([
      fleetAnalyticsService.getVehicleProfitability(),
      fleetAnalyticsService.getTopPerformingVehicle(10),
      fleetAnalyticsService.getLowestPerformingVehicle(5),
      fleetAnalyticsService.getFleetSummary(),
    ]);

    return {
      vehicle_profitability: vehicleProfitability,
      top_performing: topPerforming,
      lowest_performing: lowestPerforming,
      fleet_summary: fleetSummary,
    };
  }

  async getPlatformComparison() {
    const platformPerformance = await revenueService.getPlatformPerformance();
    return platformPerformance.map(p => ({
      platform_name: p.platform_name,
      revenue: p.total_revenue,
      commission: p.total_commission,
      booking_count: p.booking_count,
      avg_revenue_per_booking: p.booking_count > 0 ? Math.round((p.total_revenue / p.booking_count) * 100) / 100 : 0,
    }));
  }

  async getExpenseCategoryBreakdown() {
    const byCategory = await expenseService.getExpensesByCategory();
    const total = byCategory.reduce((s, c) => s + c.total, 0);
    return byCategory.map(c => ({
      ...c,
      percentage: total > 0 ? Math.round((c.total / total) * 10000) / 100 : 0,
    }));
  }

  async getRevenueVsExpenseVsProfit() {
    const [revenueTrend, expenseTrend, profitTrend] = await Promise.all([
      revenueService.getRevenueTrend(12),
      expenseService.getExpenseTrend(12),
      profitService.getProfitTrend(12),
    ]);
    const monthMap = new Map<string, { revenue: number; expense: number; profit: number }>();
    for (const r of revenueTrend) {
      if (!monthMap.has(r.month)) monthMap.set(r.month, { revenue: 0, expense: 0, profit: 0 });
      monthMap.get(r.month)!.revenue = r.total;
    }
    for (const e of expenseTrend) {
      if (!monthMap.has(e.month)) monthMap.set(e.month, { revenue: 0, expense: 0, profit: 0 });
      monthMap.get(e.month)!.expense = e.total;
    }
    for (const p of profitTrend) {
      if (!monthMap.has(p.month)) monthMap.set(p.month, { revenue: 0, expense: 0, profit: 0 });
      monthMap.get(p.month)!.profit = p.total;
    }
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, vals]) => ({ month, ...vals }));
  }

  async getCashFlowAnalytics() {
    return cashFlowService.getCashFlowTrend(12);
  }

  async getMonthlyGrowth() {
    return revenueService.getRevenueGrowth();
  }

  async getQuarterlyGrowth() {
    const growth = await revenueService.getRevenueGrowth();
    return { quarterly_growth: growth.quarterly_growth };
  }

  async getYearlyGrowth() {
    const growth = await revenueService.getRevenueGrowth();
    return { yearly_growth: growth.yearly_growth };
  }
}

export const analyticsService = new AnalyticsService();
