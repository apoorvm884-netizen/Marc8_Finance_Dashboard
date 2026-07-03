import { getDatabase } from '../../config/database';
import { revenueService } from './revenue.service';
import { expenseService } from './expense.service';
import { profitService } from './profit.service';
import { cashFlowService } from './cash-flow.service';
import { fleetAnalyticsService } from './fleet-analytics.service';
import { maintenanceService } from '../maintenance.service';

export class DashboardService {
  async getDashboardData(filters?: {
    date_from?: string;
    date_to?: string;
    vehicle_id?: string;
    platform_id?: string;
    expense_category_id?: string;
    payment_mode_id?: string;
    journal_category_id?: string;
  }) {
    const [
      todaysRevenue,
      weeklyRevenue,
      monthlyRevenue,
      yearlyRevenue,
      todaysExpense,
      weeklyExpense,
      monthlyExpense,
      yearlyExpense,
      netProfit,
      todaysProfit,
      weeklyProfit,
      monthlyProfit,
      yearlyProfit,
      netMargin,
      cashFlow,
      fleetSummary,
      revenuePerVehicle,
      expensePerVehicle,
      avgRevenuePerVehicle,
      avgExpensePerVehicle,
      revenueGrowth,
      latestBookings,
      latestJournalEntries,
      latestExpenses,
      collectionsByCategory,
      expensesByCategory,
      vehiclesWithoutBookings,
      pendingJournalCount,
      pendingExpenseCount,
      outstandingCollections,
      revenueTrend,
      expenseTrend,
      profitTrend,
      platformPerformance,
      vehicleProfitability,
      largeExpenses,
      revenueHeatmap,
      fleetHealth,
    ] = await Promise.all([
      revenueService.getTodaysRevenue(),
      revenueService.getWeeklyRevenue(),
      revenueService.getMonthlyRevenue(),
      revenueService.getYearlyRevenue(),
      expenseService.getTodaysExpenses(),
      expenseService.getWeeklyExpenses(),
      expenseService.getMonthlyExpenses(),
      expenseService.getYearlyExpenses(),
      profitService.getNetProfit(),
      profitService.getDailyProfit(),
      profitService.getWeeklyProfit(),
      profitService.getMonthlyProfit(),
      profitService.getYearlyProfit(),
      profitService.getNetMargin(),
      cashFlowService.getCashFlowSummary(),
      fleetAnalyticsService.getFleetSummary(),
      fleetAnalyticsService.getRevenuePerVehicle(),
      fleetAnalyticsService.getExpensePerVehicle(),
      fleetAnalyticsService.getAverageRevenuePerVehicle(),
      fleetAnalyticsService.getAverageExpensePerVehicle(),
      revenueService.getRevenueGrowth(),
      this.getLatestBookings(5),
      this.getLatestJournalEntries(5),
      this.getLatestExpenses(5),
      expenseService.getExpensesByCategory(),
      this.getCollectionsByCategory(filters),
      this.getVehiclesWithoutBookings(),
      this.getPendingJournalCount(),
      this.getPendingExpenseCount(),
      cashFlowService.getOutstandingCollections(),
      revenueService.getRevenueTrend(12),
      expenseService.getExpenseTrend(12),
      profitService.getProfitTrend(12),
      revenueService.getPlatformPerformance(),
      fleetAnalyticsService.getVehicleProfitability(),
      expenseService.getLargeExpenses(10000),
      revenueService.getRevenueHeatmap(),
      maintenanceService.getFleetHealth(),
    ]);

    const monthlyCashFlow = await cashFlowService.getMonthlyCashFlow();

    const platformRanking = platformPerformance.map(p => ({
      platform_id: p.platform_id,
      platform_name: p.platform_name,
      total: p.total_revenue,
    }));

    const mostProfitable = vehicleProfitability.filter(v => v.profit > 0).slice(0, 5);
    const negativeProfitVehicles = vehicleProfitability.filter(v => v.profit < 0);

    const highExpenseVehicles = expensePerVehicle.filter(e => e.total_expense > 0)
      .sort((a, b) => b.total_expense - a.total_expense).slice(0, 5);

    return {
      kpis: {
        todays_revenue: todaysRevenue,
        weekly_revenue: weeklyRevenue,
        monthly_revenue: monthlyRevenue,
        yearly_revenue: yearlyRevenue,
        todays_expense: todaysExpense,
        weekly_expense: weeklyExpense,
        monthly_expense: monthlyExpense,
        yearly_expense: yearlyExpense,
        todays_profit: todaysProfit,
        weekly_profit: weeklyProfit,
        monthly_profit: monthlyProfit,
        yearly_profit: yearlyProfit,
        net_profit: netProfit,
        net_margin: netMargin,
        cash_flow: cashFlow.net_cash_flow,
        outstanding_collections: outstandingCollections,
        total_vehicles: fleetSummary.total_vehicles,
        active_vehicles: fleetSummary.active_vehicles,
        available_vehicles: fleetSummary.active_vehicles + fleetSummary.booked_vehicles,
        booked_vehicles: fleetSummary.booked_vehicles,
        maintenance_vehicles: fleetSummary.maintenance_vehicles,
        utilization_rate: fleetSummary.utilization_rate,
        avg_revenue_per_vehicle: avgRevenuePerVehicle,
        avg_expense_per_vehicle: avgExpensePerVehicle,
      },
      fleet_health: {
        health_score: fleetHealth.health_score,
        insurance_due: fleetHealth.insurance_due,
        permit_due: fleetHealth.permit_due,
        fitness_due: fleetHealth.fitness_due,
        pollution_due: fleetHealth.pollution_due,
        rc_due: fleetHealth.rc_due,
        maintenance_due: fleetHealth.maintenance_due,
        vehicles_in_maintenance: fleetHealth.vehicles_in_maintenance,
        vehicles_without_platform: fleetHealth.vehicles_without_platform,
        expired_documents: fleetHealth.expired_documents,
      },
      trends: {
        revenue: revenueTrend,
        expense: expenseTrend,
        profit: profitTrend,
        cash_flow: monthlyCashFlow,
        revenue_growth: revenueGrowth,
      },
      breakdowns: {
        revenue_by_platform: platformPerformance.map(p => ({
          platform_id: p.platform_id,
          platform_name: p.platform_name,
          total: p.total_revenue,
        })),
        expense_by_category: expensesByCategory,
        revenue_by_vehicle: revenuePerVehicle.slice(0, 10),
        collections_by_category: collectionsByCategory,
        expense_by_category_detailed: expensesByCategory,
      },
      recent: {
        latest_bookings: latestBookings,
        latest_journal_entries: latestJournalEntries,
        latest_expenses: latestExpenses,
      },
      top_vehicles: {
        top_performing: revenuePerVehicle.slice(0, 5),
        top_expense: highExpenseVehicles,
        most_profitable: mostProfitable,
        platform_ranking: platformRanking,
        lowest_performing: revenuePerVehicle.slice(-5).reverse(),
        vehicle_profitability: vehicleProfitability,
      },
      alerts: {
        vehicles_without_bookings: vehiclesWithoutBookings.length,
        vehicles_without_bookings_list: vehiclesWithoutBookings,
        high_expense_vehicles: highExpenseVehicles,
        negative_profit_vehicles: negativeProfitVehicles,
        pending_journal_entries: pendingJournalCount,
        pending_expenses: pendingExpenseCount,
        large_expenses: largeExpenses,
      },
      heatmap: revenueHeatmap,
    };
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

  private async getLatestJournalEntries(limit: number = 5): Promise<any[]> {
    const db = getDatabase();
    return db('journal_entries')
      .leftJoin('vehicles', 'journal_entries.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'journal_entries.ledger_category_id', 'categories.id')
      .select(
        'journal_entries.*',
        'vehicles.vehicle_number',
        'vehicles.vehicle_name',
        'categories.name as category_name'
      )
      .whereNull('journal_entries.deleted_at')
      .orderBy('journal_entries.created_at', 'desc')
      .limit(limit);
  }

  private async getLatestExpenses(limit: number = 5): Promise<any[]> {
    const db = getDatabase();
    return db('expenses')
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
      .whereNull('expenses.deleted_at')
      .orderBy('expenses.created_at', 'desc')
      .limit(limit);
  }

  async getCollectionsByCategory(filters?: any): Promise<{ category_id: string; category_name: string; total: number }[]> {
    const db = getDatabase();
    let query = db('journal_entries')
      .leftJoin('master_values as categories', 'journal_entries.ledger_category_id', 'categories.id')
      .whereNull('journal_entries.deleted_at')
      .whereIn('journal_entries.status', ['COMPLETED'])
      .groupBy('journal_entries.ledger_category_id', 'categories.name')
      .select('journal_entries.ledger_category_id as category_id', 'categories.name as category_name')
      .sum('journal_entries.amount_collected as total');
    if (filters?.date_from) query = query.where('journal_entries.collection_date', '>=', filters.date_from);
    if (filters?.date_to) query = query.where('journal_entries.collection_date', '<=', filters.date_to);
    if (filters?.journal_category_id) query = query.where('journal_entries.ledger_category_id', filters.journal_category_id);
    const rows = await query;
    return rows.map((r: any) => ({
      category_id: r.category_id,
      category_name: r.category_name || 'Unknown',
      total: Math.round(Number(r.total ?? 0) * 100) / 100,
    }));
  }

  private async getVehiclesWithoutBookings(): Promise<{ vehicle_id: string; vehicle_number: string }[]> {
    const db = getDatabase();
    const rows = await db('vehicles')
      .leftJoin('bookings', function () {
        this.on('vehicles.id', '=', 'bookings.vehicle_id')
          .andOnNull('bookings.deleted_at')
          .andOnIn('bookings.status', ['COMPLETED', 'CONFIRMED']);
      })
      .whereNull('vehicles.deleted_at')
      .whereNull('bookings.id')
      .select('vehicles.id as vehicle_id', 'vehicles.vehicle_number');
    return rows;
  }

  private async getPendingJournalCount(): Promise<number> {
    const db = getDatabase();
    const result = await db('journal_entries')
      .whereNull('deleted_at')
      .where('status', 'PENDING')
      .count('* as count')
      .first();
    return Number(result?.count ?? 0);
  }

  private async getPendingExpenseCount(): Promise<number> {
    const db = getDatabase();
    const result = await db('expenses')
      .whereNull('deleted_at')
      .where('status', 'PENDING')
      .count('* as count')
      .first();
    return Number(result?.count ?? 0);
  }
}

export const dashboardService = new DashboardService();
