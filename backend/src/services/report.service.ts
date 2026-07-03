import { getDatabase } from '../config/database';
import { revenueService, expenseService, profitService, cashFlowService, fleetAnalyticsService } from './financial-engine';
import { outstandingService } from './outstanding.service';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { ReportType, ReportFilters, ReportResult, ReportRow, ReportSummary, ReportTemplate, ReportHistory, CreateReportTemplateDTO, UpdateReportTemplateDTO } from '../types/report';

const REPORT_NAMES: Record<ReportType, string> = {
  daily_financial: 'Daily Financial Report',
  weekly_financial: 'Weekly Financial Report',
  monthly_financial: 'Monthly Financial Report',
  yearly_financial: 'Yearly Financial Report',
  custom_range: 'Custom Date Range Report',
  vehicle_revenue: 'Vehicle Revenue Report',
  vehicle_expense: 'Vehicle Expense Report',
  vehicle_profit: 'Vehicle Profit Report',
  platform_revenue: 'Platform Revenue Report',
  platform_commission: 'Platform Commission Report',
  platform_net_revenue: 'Platform Net Revenue Report',
  journal_collection: 'Journal Collection Report',
  expense_category: 'Expense Category Report',
  expense_payment_mode: 'Expense Payment Mode Report',
  fleet_performance: 'Fleet Performance Report',
  maintenance_cost: 'Maintenance Cost Report',
  maintenance_summary: 'Maintenance Summary Report',
  vendor_performance: 'Vendor Performance Report',
  profit_loss: 'Profit & Loss Report',
  fleet_utilization: 'Fleet Utilization Report',
  outstanding_collection: 'Outstanding Collection Report',
  outstanding_report: 'Outstanding Liability Report',
  upcoming_payment: 'Upcoming Payment Report',
  vehicle_profitability: 'Vehicle Profitability Report',
  platform_profitability: 'Platform Profitability Report',
  cash_requirement: 'Cash Requirement Forecast Report',
  outstanding_ageing: 'Outstanding Ageing Report',
  payment_calendar: 'Payment Calendar Report',
  revenue_by_platform: 'Revenue by Platform Report',
  revenue_by_category: 'Revenue by Category Report',
  executive_summary: 'Executive Financial Summary',
};

export class ReportsService {
  async generateReport(reportType: ReportType, filters: ReportFilters = {}, userId?: string): Promise<ReportResult> {
    await this.recordHistory(reportType, filters, userId);

    switch (reportType) {
      case 'daily_financial': return this.dailyFinancial(filters);
      case 'weekly_financial': return this.weeklyFinancial(filters);
      case 'monthly_financial': return this.monthlyFinancial(filters);
      case 'yearly_financial': return this.yearlyFinancial(filters);
      case 'custom_range': return this.customRange(filters);
      case 'vehicle_revenue': return this.vehicleRevenue(filters);
      case 'vehicle_expense': return this.vehicleExpense(filters);
      case 'vehicle_profit': return this.vehicleProfit(filters);
      case 'platform_revenue': return this.platformRevenue(filters);
      case 'platform_commission': return this.platformCommission(filters);
      case 'platform_net_revenue': return this.platformNetRevenue(filters);
      case 'journal_collection': return this.journalCollection(filters);
      case 'expense_category': return this.expenseCategory(filters);
      case 'expense_payment_mode': return this.expensePaymentMode(filters);
      case 'fleet_performance': return this.fleetPerformance(filters);
      case 'maintenance_cost': return this.maintenanceCostReport(filters);
      case 'maintenance_summary': return this.maintenanceSummaryReport(filters);
      case 'vendor_performance': return this.vendorPerformanceReport(filters);
      case 'profit_loss': return this.profitLoss(filters);
      case 'fleet_utilization': return this.fleetUtilization(filters);
      case 'outstanding_collection': return this.outstandingCollection(filters);
      case 'outstanding_report': return this.outstandingReport(filters);
      case 'upcoming_payment': return this.upcomingPaymentReport(filters);
      case 'vehicle_profitability': return this.vehicleProfitabilityReport(filters);
      case 'platform_profitability': return this.platformProfitabilityReport(filters);
      case 'cash_requirement': return this.cashRequirementReport(filters);
      case 'outstanding_ageing': return this.outstandingAgeingReport(filters);
      case 'payment_calendar': return this.paymentCalendarReport(filters);
      case 'revenue_by_platform': return this.revenueByPlatformReport(filters);
      case 'revenue_by_category': return this.revenueByCategoryReport(filters);
      case 'executive_summary': return this.executiveSummaryReport(filters);
      default: throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  private async dailyFinancial(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const effectiveFilters = { ...filters, date_from: dayStart.toISOString(), date_to: dayEnd.toISOString() };
    const revenue = await revenueService.getTodaysRevenue();
    const expense = await expenseService.getTodaysExpenses();
    const profit = await profitService.getDailyProfit();
    const cashFlow = await cashFlowService.getCashFlowSummary();
    const expensesByCat = await expenseService.getExpensesByCategory();
    const revenueByPlat = await this.getRevenueByPlatform(effectiveFilters);
    const revenueByVeh = await this.getRevenueByVehicle(effectiveFilters);
    const collections = await this.getCollectionsByCategory(effectiveFilters);

    return {
      report_type: 'daily_financial',
      report_name: REPORT_NAMES.daily_financial,
      generated_at: new Date().toISOString(),
      filters: effectiveFilters,
      summary: { total_revenue: revenue, total_expense: expense, total_profit: profit, net_cash_flow: cashFlow.net_cash_flow },
      columns: [
        { key: 'metric', label: 'Metric' },
        { key: 'value', label: 'Value' },
      ],
      rows: [
        { metric: "Today's Revenue", value: revenue },
        { metric: "Today's Expense", value: expense },
        { metric: "Today's Profit", value: profit },
        { metric: 'Cash Flow', value: cashFlow.net_cash_flow },
        { metric: 'Total Inflow', value: cashFlow.total_inflow },
        { metric: 'Total Outflow', value: cashFlow.total_outflow },
      ],
      charts: [
        { type: 'bar', title: 'Revenue by Platform', labels: revenueByPlat.map(p => p.platform_name), datasets: [{ label: 'Revenue', data: revenueByPlat.map(p => p.total) }] },
        { type: 'bar', title: 'Expense by Category', labels: expensesByCat.map(c => c.category_name), datasets: [{ label: 'Expense', data: expensesByCat.map(c => c.total) }] },
      ],
    };
  }

  private async weeklyFinancial(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);

    const effectiveFilters = { ...filters, date_from: weekStart.toISOString(), date_to: weekEnd.toISOString() };
    const rows = await this.getDailyBreakdown('bookings', 'booking_date_time', 'net_revenue', weekStart, weekEnd, effectiveFilters);
    const totalRevenue = rows.reduce((s, r) => s + (Number(r.total) || 0), 0);
    const expenseRows = await this.getDailyBreakdown('expenses', 'expense_date', 'amount', weekStart, weekEnd, { ...effectiveFilters, status: 'APPROVED' });
    const totalExpense = expenseRows.reduce((s, r) => s + (Number(r.total) || 0), 0);

    return {
      report_type: 'weekly_financial',
      report_name: REPORT_NAMES.weekly_financial,
      generated_at: new Date().toISOString(),
      filters: effectiveFilters,
      summary: { total_revenue: totalRevenue, total_expense: totalExpense, total_profit: Math.round((totalRevenue - totalExpense) * 100) / 100 },
      columns: [
        { key: 'date', label: 'Date' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'expense', label: 'Expense' },
        { key: 'profit', label: 'Profit' },
      ],
      rows: rows.map((r: any) => ({
        date: r.date,
        revenue: Math.round(Number(r.total) * 100) / 100,
        expense: 0,
        profit: 0,
      })),
    };
  }

  private async monthlyFinancial(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const effectiveFilters = { ...filters, date_from: monthStart.toISOString(), date_to: monthEnd.toISOString() };
    const revenue = await revenueService.getMonthlyRevenue();
    const expense = await expenseService.getMonthlyExpenses();
    const profit = await profitService.getMonthlyProfit();
    const revenueByPlat = await this.getRevenueByPlatform(effectiveFilters);
    const expensesByCat = await expenseService.getExpensesByCategory();
    const revenueByVeh = await this.getRevenueByVehicle(effectiveFilters);

    return {
      report_type: 'monthly_financial',
      report_name: REPORT_NAMES.monthly_financial,
      generated_at: new Date().toISOString(),
      filters: effectiveFilters,
      summary: { total_revenue: revenue, total_expense: expense, total_profit: profit },
      columns: [
        { key: 'metric', label: 'Metric' },
        { key: 'value', label: 'Value' },
      ],
      rows: [
        { metric: 'Monthly Revenue', value: revenue },
        { metric: 'Monthly Expense', value: expense },
        { metric: 'Monthly Profit', value: profit },
      ],
      charts: [
        { type: 'bar', title: 'Revenue by Platform', labels: revenueByPlat.map(p => p.platform_name), datasets: [{ label: 'Revenue', data: revenueByPlat.map(p => p.total) }] },
        { type: 'bar', title: 'Expense by Category', labels: expensesByCat.map(c => c.category_name), datasets: [{ label: 'Expense', data: expensesByCat.map(c => c.total) }] },
        { type: 'bar', title: 'Revenue by Vehicle', labels: revenueByVeh.slice(0, 10).map(v => v.vehicle_number), datasets: [{ label: 'Revenue', data: revenueByVeh.slice(0, 10).map(v => v.total) }] },
      ],
    };
  }

  private async yearlyFinancial(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

    const effectiveFilters = { ...filters, date_from: yearStart.toISOString(), date_to: yearEnd.toISOString() };

    const monthlyRevenue = await db('bookings')
      .whereNull('deleted_at').whereIn('status', ['COMPLETED', 'CONFIRMED'])
      .where('booking_date_time', '>=', yearStart.toISOString())
      .where('booking_date_time', '<', yearEnd.toISOString())
      .groupBy(db.raw("to_char(booking_date_time, 'YYYY-MM')"))
      .select(db.raw("to_char(booking_date_time, 'YYYY-MM') as month"))
      .sum('net_revenue as total').orderBy('month', 'asc');

    const monthlyExpense = await db('expenses')
      .whereNull('deleted_at').whereIn('status', ['APPROVED', 'REIMBURSED'])
      .where('expense_date', '>=', yearStart.toISOString())
      .where('expense_date', '<', yearEnd.toISOString())
      .groupBy(db.raw("to_char(expense_date, 'YYYY-MM')"))
      .select(db.raw("to_char(expense_date, 'YYYY-MM') as month"))
      .sum('amount as total').orderBy('month', 'asc');

    const revenue = monthlyRevenue.reduce((s: number, r: any) => s + Number(r.total ?? 0), 0);
    const expense = monthlyExpense.reduce((s: number, r: any) => s + Number(r.total ?? 0), 0);

    return {
      report_type: 'yearly_financial',
      report_name: REPORT_NAMES.yearly_financial,
      generated_at: new Date().toISOString(),
      filters: effectiveFilters,
      summary: { total_revenue: Math.round(revenue * 100) / 100, total_expense: Math.round(expense * 100) / 100, total_profit: Math.round((revenue - expense) * 100) / 100 },
      columns: [{ key: 'month', label: 'Month' }, { key: 'revenue', label: 'Revenue' }, { key: 'expense', label: 'Expense' }, { key: 'profit', label: 'Profit' }],
      rows: monthlyRevenue.map((r: any) => {
        const exp = monthlyExpense.find((e: any) => e.month === r.month);
        const rev = Number(r.total ?? 0);
        const expAmt = Number(exp?.total ?? 0);
        return { month: r.month, revenue: Math.round(rev * 100) / 100, expense: Math.round(expAmt * 100) / 100, profit: Math.round((rev - expAmt) * 100) / 100 };
      }),
      charts: [
        { type: 'line', title: 'Monthly Revenue vs Expense', labels: monthlyRevenue.map((r: any) => r.month), datasets: [
          { label: 'Revenue', data: monthlyRevenue.map((r: any) => Number(r.total ?? 0)) },
          { label: 'Expense', data: monthlyExpense.map((r: any) => Number(r.total ?? 0)) },
        ]},
      ],
    };
  }

  private async customRange(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    const effectiveFilters = { ...filters };
    const revenueRows = await db('bookings')
      .leftJoin('vehicles', 'bookings.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as platforms', 'bookings.platform_id', 'platforms.id')
      .whereNull('bookings.deleted_at').whereIn('bookings.status', ['COMPLETED', 'CONFIRMED'])
      .modify(q => {
        if (effectiveFilters.date_from) q.where('bookings.booking_date_time', '>=', effectiveFilters.date_from);
        if (effectiveFilters.date_to) q.where('bookings.booking_date_time', '<=', effectiveFilters.date_to);
        if (effectiveFilters.vehicle_id) q.where('bookings.vehicle_id', effectiveFilters.vehicle_id);
        if (effectiveFilters.platform_id) q.where('bookings.platform_id', effectiveFilters.platform_id);
      })
      .select('bookings.*', 'vehicles.vehicle_number', 'platforms.name as platform_name');

    const totalRevenue = revenueRows.reduce((s: number, r: any) => s + Number(r.net_revenue ?? 0), 0);
    const totalCommission = revenueRows.reduce((s: number, r: any) => s + Number(r.platform_commission ?? 0), 0);

    return {
      report_type: 'custom_range',
      report_name: REPORT_NAMES.custom_range,
      generated_at: new Date().toISOString(),
      filters: effectiveFilters,
      summary: { total_revenue: Math.round(totalRevenue * 100) / 100, total_commission: Math.round(totalCommission * 100) / 100, total_bookings: revenueRows.length },
      columns: [
        { key: 'booking_id', label: 'Booking ID' },
        { key: 'vehicle_number', label: 'Vehicle' },
        { key: 'platform_name', label: 'Platform' },
        { key: 'gross_fare', label: 'Gross Fare' },
        { key: 'platform_commission', label: 'Commission' },
        { key: 'net_revenue', label: 'Net Revenue' },
        { key: 'status', label: 'Status' },
      ],
      rows: revenueRows.map((r: any) => ({
        booking_id: r.booking_id,
        vehicle_number: r.vehicle_number || '-',
        platform_name: r.platform_name || '-',
        gross_fare: Number(r.gross_fare ?? 0),
        platform_commission: Number(r.platform_commission ?? 0),
        net_revenue: Number(r.net_revenue ?? 0),
        status: r.status,
      })),
    };
  }

  private async vehicleRevenue(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    const data = await fleetAnalyticsService.getRevenuePerVehicle();
    const total = data.reduce((s, v) => s + v.total_revenue, 0);
    return {
      report_type: 'vehicle_revenue', report_name: REPORT_NAMES.vehicle_revenue,
      generated_at: new Date().toISOString(), filters,
      summary: { total_revenue: Math.round(total * 100) / 100, record_count: data.length },
      columns: [{ key: 'vehicle_number', label: 'Vehicle' }, { key: 'total_revenue', label: 'Total Revenue' }],
      rows: data.map(v => ({ vehicle_number: v.vehicle_number, total_revenue: v.total_revenue })),
      charts: [{ type: 'bar', title: 'Revenue per Vehicle', labels: data.map(v => v.vehicle_number), datasets: [{ label: 'Revenue', data: data.map(v => v.total_revenue) }] }],
    };
  }

  private async vehicleExpense(filters: ReportFilters): Promise<ReportResult> {
    const data = await fleetAnalyticsService.getExpensePerVehicle();
    const total = data.reduce((s, v) => s + v.total_expense, 0);
    return {
      report_type: 'vehicle_expense', report_name: REPORT_NAMES.vehicle_expense,
      generated_at: new Date().toISOString(), filters,
      summary: { total_expense: Math.round(total * 100) / 100, record_count: data.length },
      columns: [{ key: 'vehicle_number', label: 'Vehicle' }, { key: 'total_expense', label: 'Total Expense' }],
      rows: data.map(v => ({ vehicle_number: v.vehicle_number, total_expense: v.total_expense })),
      charts: [{ type: 'bar', title: 'Expense per Vehicle', labels: data.map(v => v.vehicle_number), datasets: [{ label: 'Expense', data: data.map(v => v.total_expense) }] }],
    };
  }

  private async vehicleProfit(filters: ReportFilters): Promise<ReportResult> {
    const [revenuePerVeh, expensePerVeh] = await Promise.all([
      fleetAnalyticsService.getRevenuePerVehicle(),
      fleetAnalyticsService.getExpensePerVehicle(),
    ]);
    const profitMap = new Map<string, { vehicle_number: string; revenue: number; expense: number; profit: number }>();
    for (const v of revenuePerVeh) {
      profitMap.set(v.vehicle_id, { vehicle_number: v.vehicle_number, revenue: v.total_revenue, expense: 0, profit: v.total_revenue });
    }
    for (const v of expensePerVeh) {
      const existing = profitMap.get(v.vehicle_id);
      if (existing) {
        existing.expense = v.total_expense;
        existing.profit = Math.round((existing.revenue - v.total_expense) * 100) / 100;
      } else {
        profitMap.set(v.vehicle_id, { vehicle_number: v.vehicle_number, revenue: 0, expense: v.total_expense, profit: -v.total_expense });
      }
    }
    const rows = Array.from(profitMap.values()).sort((a, b) => b.profit - a.profit);
    return {
      report_type: 'vehicle_profit', report_name: REPORT_NAMES.vehicle_profit,
      generated_at: new Date().toISOString(), filters,
      summary: { total_profit: Math.round(rows.reduce((s, r) => s + r.profit, 0) * 100) / 100, record_count: rows.length },
      columns: [{ key: 'vehicle_number', label: 'Vehicle' }, { key: 'revenue', label: 'Revenue' }, { key: 'expense', label: 'Expense' }, { key: 'profit', label: 'Profit' }],
      rows,
      charts: [{ type: 'bar', title: 'Profit per Vehicle', labels: rows.map(v => v.vehicle_number), datasets: [{ label: 'Profit', data: rows.map(v => v.profit) }] }],
    };
  }

  private async platformRevenue(filters: ReportFilters): Promise<ReportResult> {
    const data = await this.getRevenueByPlatform(filters);
    const total = data.reduce((s, p) => s + p.total, 0);
    return {
      report_type: 'platform_revenue', report_name: REPORT_NAMES.platform_revenue,
      generated_at: new Date().toISOString(), filters,
      summary: { total_revenue: Math.round(total * 100) / 100, record_count: data.length },
      columns: [{ key: 'platform_name', label: 'Platform' }, { key: 'total', label: 'Revenue' }],
      rows: data.map(p => ({ platform_name: p.platform_name, total: p.total })),
      charts: [{ type: 'pie', title: 'Revenue by Platform', labels: data.map(p => p.platform_name), datasets: [{ label: 'Revenue', data: data.map(p => p.total) }] }],
    };
  }

  private async platformCommission(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    let query = db('bookings')
      .leftJoin('master_values as platforms', 'bookings.platform_id', 'platforms.id')
      .whereNull('bookings.deleted_at').whereIn('bookings.status', ['COMPLETED', 'CONFIRMED'])
      .groupBy('bookings.platform_id', 'platforms.name')
      .select('bookings.platform_id', 'platforms.name as platform_name')
      .sum('bookings.platform_commission as total');
    if (filters.date_from) query = query.where('bookings.booking_date_time', '>=', filters.date_from);
    if (filters.date_to) query = query.where('bookings.booking_date_time', '<=', filters.date_to);
    if (filters.platform_id) query = query.where('bookings.platform_id', filters.platform_id);
    const rows = await query;
    const total = rows.reduce((s: number, r: any) => s + Number(r.total ?? 0), 0);
    return {
      report_type: 'platform_commission', report_name: REPORT_NAMES.platform_commission,
      generated_at: new Date().toISOString(), filters,
      summary: { total_commission: Math.round(total * 100) / 100, record_count: rows.length },
      columns: [{ key: 'platform_name', label: 'Platform' }, { key: 'total', label: 'Commission' }],
      rows: rows.map((r: any) => ({ platform_name: r.platform_name || 'Unknown', total: Math.round(Number(r.total ?? 0) * 100) / 100 })),
      charts: [{ type: 'bar', title: 'Commission by Platform', labels: rows.map((r: any) => r.platform_name || 'Unknown'), datasets: [{ label: 'Commission', data: rows.map((r: any) => Number(r.total ?? 0)) }] }],
    };
  }

  private async platformNetRevenue(filters: ReportFilters): Promise<ReportResult> {
    const data = await this.getRevenueByPlatform(filters);
    const total = data.reduce((s, p) => s + p.total, 0);
    return {
      report_type: 'platform_net_revenue', report_name: REPORT_NAMES.platform_net_revenue,
      generated_at: new Date().toISOString(), filters,
      summary: { total_net_revenue: Math.round(total * 100) / 100, record_count: data.length },
      columns: [{ key: 'platform_name', label: 'Platform' }, { key: 'total', label: 'Net Revenue' }],
      rows: data.map(p => ({ platform_name: p.platform_name, total: p.total })),
      charts: [{ type: 'bar', title: 'Net Revenue by Platform', labels: data.map(p => p.platform_name), datasets: [{ label: 'Net Revenue', data: data.map(p => p.total) }] }],
    };
  }

  private async journalCollection(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    let query = db('journal_entries')
      .leftJoin('vehicles', 'journal_entries.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'journal_entries.ledger_category_id', 'categories.id')
      .whereNull('journal_entries.deleted_at')
      .select('journal_entries.*', 'vehicles.vehicle_number', 'categories.name as category_name');
    if (filters.date_from) query = query.where('journal_entries.collection_date', '>=', filters.date_from);
    if (filters.date_to) query = query.where('journal_entries.collection_date', '<=', filters.date_to);
    if (filters.vehicle_id) query = query.where('journal_entries.vehicle_id', filters.vehicle_id);
    if (filters.journal_category_id) query = query.where('journal_entries.ledger_category_id', filters.journal_category_id);
    if (filters.status) query = query.where('journal_entries.status', filters.status);
    const rows = await query.orderBy('journal_entries.created_at', 'desc').limit(1000);
    const total = rows.reduce((s, r: any) => s + Number(r.amount_collected ?? 0), 0);

    const byCategory = await this.getCollectionsByCategory(filters);
    return {
      report_type: 'journal_collection', report_name: REPORT_NAMES.journal_collection,
      generated_at: new Date().toISOString(), filters,
      summary: { total_collections: Math.round(total * 100) / 100, record_count: rows.length },
      columns: [
        { key: 'vehicle_number', label: 'Vehicle' },
        { key: 'category_name', label: 'Category' },
        { key: 'amount_collected', label: 'Amount Collected' },
        { key: 'total_amount', label: 'Total Amount' },
        { key: 'status', label: 'Status' },
      ],
      rows: rows.map((r: any) => ({
        vehicle_number: r.vehicle_number || '-',
        category_name: r.category_name || '-',
        amount_collected: Number(r.amount_collected ?? 0),
        total_amount: Number(r.total_amount ?? 0),
        status: r.status,
      })),
      charts: [{ type: 'pie', title: 'Collections by Category', labels: byCategory.map(c => c.category_name), datasets: [{ label: 'Collections', data: byCategory.map(c => c.total) }] }],
    };
  }

  private async expenseCategory(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    let query = db('expenses')
      .leftJoin('master_values as categories', 'expenses.expense_category_id', 'categories.id')
      .leftJoin('master_values as modes', 'expenses.payment_mode_id', 'modes.id')
      .whereNull('expenses.deleted_at')
      .select('expenses.*', 'categories.name as category_name', 'modes.name as payment_mode_name');
    if (filters.date_from) query = query.where('expenses.expense_date', '>=', filters.date_from);
    if (filters.date_to) query = query.where('expenses.expense_date', '<=', filters.date_to);
    if (filters.expense_category_id) query = query.where('expenses.expense_category_id', filters.expense_category_id);
    if (filters.payment_mode_id) query = query.where('expenses.payment_mode_id', filters.payment_mode_id);
    if (filters.status) query = query.where('expenses.status', filters.status);
    const rows = await query.orderBy('expenses.created_at', 'desc').limit(1000);
    const total = rows.reduce((s, r: any) => s + Number(r.amount ?? 0), 0);
    const byCat = await expenseService.getExpensesByCategory();

    return {
      report_type: 'expense_category', report_name: REPORT_NAMES.expense_category,
      generated_at: new Date().toISOString(), filters,
      summary: { total_expense: Math.round(total * 100) / 100, record_count: rows.length },
      columns: [
        { key: 'category_name', label: 'Category' },
        { key: 'payment_mode_name', label: 'Payment Mode' },
        { key: 'amount', label: 'Amount' },
        { key: 'vendor', label: 'Vendor' },
        { key: 'status', label: 'Status' },
      ],
      rows: rows.map((r: any) => ({
        category_name: r.category_name || '-',
        payment_mode_name: r.payment_mode_name || '-',
        amount: Number(r.amount ?? 0),
        vendor: r.vendor || '-',
        status: r.status,
      })),
      charts: [{ type: 'pie', title: 'Expense by Category', labels: byCat.map(c => c.category_name), datasets: [{ label: 'Expense', data: byCat.map(c => c.total) }] }],
    };
  }

  private async expensePaymentMode(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    const byMode = await expenseService.getExpensesByPaymentMode();
    let query = db('expenses')
      .leftJoin('master_values as categories', 'expenses.expense_category_id', 'categories.id')
      .leftJoin('master_values as modes', 'expenses.payment_mode_id', 'modes.id')
      .whereNull('expenses.deleted_at')
      .select('expenses.*', 'categories.name as category_name', 'modes.name as payment_mode_name');
    if (filters.date_from) query = query.where('expenses.expense_date', '>=', filters.date_from);
    if (filters.date_to) query = query.where('expenses.expense_date', '<=', filters.date_to);
    if (filters.payment_mode_id) query = query.where('expenses.payment_mode_id', filters.payment_mode_id);
    if (filters.status) query = query.where('expenses.status', filters.status);
    const rows = await query.orderBy('expenses.created_at', 'desc').limit(1000);
    const total = rows.reduce((s, r: any) => s + Number(r.amount ?? 0), 0);

    return {
      report_type: 'expense_payment_mode', report_name: REPORT_NAMES.expense_payment_mode,
      generated_at: new Date().toISOString(), filters,
      summary: { total_expense: Math.round(total * 100) / 100, record_count: rows.length },
      columns: [
        { key: 'payment_mode_name', label: 'Payment Mode' },
        { key: 'category_name', label: 'Category' },
        { key: 'amount', label: 'Amount' },
        { key: 'vendor', label: 'Vendor' },
        { key: 'status', label: 'Status' },
      ],
      rows: rows.map((r: any) => ({
        payment_mode_name: r.payment_mode_name || '-',
        category_name: r.category_name || '-',
        amount: Number(r.amount ?? 0),
        vendor: r.vendor || '-',
        status: r.status,
      })),
      charts: [{ type: 'pie', title: 'Expense by Payment Mode', labels: byMode.map(m => m.payment_mode_name), datasets: [{ label: 'Expense', data: byMode.map(m => m.total) }] }],
    };
  }

  private async fleetPerformance(filters: ReportFilters): Promise<ReportResult> {
    const [fleetSummary, revenuePerVeh, expensePerVeh] = await Promise.all([
      fleetAnalyticsService.getFleetSummary(),
      fleetAnalyticsService.getRevenuePerVehicle(),
      fleetAnalyticsService.getExpensePerVehicle(),
    ]);
    return {
      report_type: 'fleet_performance', report_name: REPORT_NAMES.fleet_performance,
      generated_at: new Date().toISOString(), filters,
      summary: {
        total_vehicles: fleetSummary.total_vehicles,
        active_vehicles: fleetSummary.active_vehicles,
        booked_vehicles: fleetSummary.booked_vehicles,
        utilization_rate: fleetSummary.utilization_rate,
      },
      columns: [
        { key: 'vehicle_number', label: 'Vehicle' },
        { key: 'total_revenue', label: 'Revenue' },
        { key: 'total_expense', label: 'Expense' },
      ],
      rows: revenuePerVeh.map(v => {
        const exp = expensePerVeh.find(e => e.vehicle_id === v.vehicle_id);
        return { vehicle_number: v.vehicle_number, total_revenue: v.total_revenue, total_expense: exp?.total_expense ?? 0 };
      }),
      charts: [
        { type: 'bar', title: 'Revenue per Vehicle', labels: revenuePerVeh.map(v => v.vehicle_number), datasets: [{ label: 'Revenue', data: revenuePerVeh.map(v => v.total_revenue) }] },
      ],
    };
  }

  async getTemplates(userId: string): Promise<ReportTemplate[]> {
    const db = getDatabase();
    return db('report_templates').where({ created_by: userId }).orderBy('created_at', 'desc');
  }

  async createTemplate(data: CreateReportTemplateDTO, userId: string): Promise<ReportTemplate> {
    const db = getDatabase();
    const [template] = await db('report_templates').insert({
      name: data.name,
      report_type: data.report_type,
      filters: JSON.stringify(data.filters),
      is_favorite: data.is_favorite ?? false,
      created_by: userId,
    }).returning('*');
    return { ...template, filters: typeof template.filters === 'string' ? JSON.parse(template.filters) : template.filters };
  }

  async updateTemplate(id: string, data: UpdateReportTemplateDTO, userId: string): Promise<ReportTemplate> {
    const db = getDatabase();
    const existing = await db('report_templates').where({ id, created_by: userId }).first();
    if (!existing) throw new NotFoundError('Template not found');
    const updateData: Record<string, unknown> = { updated_at: db.fn.now() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.filters !== undefined) updateData.filters = JSON.stringify(data.filters);
    if (data.is_favorite !== undefined) updateData.is_favorite = data.is_favorite;
    await db('report_templates').where({ id }).update(updateData);
    const [template] = await db('report_templates').where({ id }).returning('*');
    return { ...template, filters: typeof template.filters === 'string' ? JSON.parse(template.filters) : template.filters };
  }

  async deleteTemplate(id: string, userId: string): Promise<void> {
    const db = getDatabase();
    const existing = await db('report_templates').where({ id, created_by: userId }).first();
    if (!existing) throw new NotFoundError('Template not found');
    await db('report_templates').where({ id }).delete();
  }

  async getHistory(userId: string): Promise<ReportHistory[]> {
    const db = getDatabase();
    return db('report_history').where({ generated_by: userId }).orderBy('created_at', 'desc').limit(50);
  }

  private async recordHistory(reportType: ReportType, filters: ReportFilters, userId?: string): Promise<void> {
    try {
      const db = getDatabase();
      await db('report_history').insert({
        report_type: reportType,
        filters: JSON.stringify(filters),
        status: 'GENERATED',
        generated_by: userId || null,
      });
    } catch (error) {
      logger.error(`Failed to record report history for ${reportType}`, { error, filters });
    }
  }

  private async getRevenueByPlatform(filters?: ReportFilters): Promise<{ platform_id: string; platform_name: string; total: number }[]> {
    const db = getDatabase();
    let query = db('bookings')
      .leftJoin('master_values as platforms', 'bookings.platform_id', 'platforms.id')
      .whereNull('bookings.deleted_at').whereIn('bookings.status', ['COMPLETED', 'CONFIRMED'])
      .groupBy('bookings.platform_id', 'platforms.name')
      .select('bookings.platform_id', 'platforms.name as platform_name')
      .sum('bookings.net_revenue as total');
    if (filters?.date_from) query = query.where('bookings.booking_date_time', '>=', filters.date_from);
    if (filters?.date_to) query = query.where('bookings.booking_date_time', '<=', filters.date_to);
    if (filters?.platform_id) query = query.where('bookings.platform_id', filters.platform_id);
    const rows = await query;
    return rows.map((r: any) => ({ platform_id: r.platform_id, platform_name: r.platform_name || 'Unknown', total: Math.round(Number(r.total ?? 0) * 100) / 100 }));
  }

  private async getRevenueByVehicle(filters?: ReportFilters): Promise<{ vehicle_id: string; vehicle_number: string; total: number }[]> {
    const db = getDatabase();
    let query = db('bookings')
      .leftJoin('vehicles', 'bookings.vehicle_id', 'vehicles.id')
      .whereNull('bookings.deleted_at').whereIn('bookings.status', ['COMPLETED', 'CONFIRMED'])
      .groupBy('bookings.vehicle_id', 'vehicles.vehicle_number')
      .select('bookings.vehicle_id', 'vehicles.vehicle_number')
      .sum('bookings.net_revenue as total');
    if (filters?.date_from) query = query.where('bookings.booking_date_time', '>=', filters.date_from);
    if (filters?.date_to) query = query.where('bookings.booking_date_time', '<=', filters.date_to);
    if (filters?.vehicle_id) query = query.where('bookings.vehicle_id', filters.vehicle_id);
    const rows = await query;
    return rows.map((r: any) => ({ vehicle_id: r.vehicle_id, vehicle_number: r.vehicle_number || 'Unknown', total: Math.round(Number(r.total ?? 0) * 100) / 100 }));
  }

  private async getCollectionsByCategory(filters?: ReportFilters): Promise<{ category_id: string; category_name: string; total: number }[]> {
    const db = getDatabase();
    let query = db('journal_entries')
      .leftJoin('master_values as categories', 'journal_entries.ledger_category_id', 'categories.id')
      .whereNull('journal_entries.deleted_at').whereIn('journal_entries.status', ['COMPLETED'])
      .groupBy('journal_entries.ledger_category_id', 'categories.name')
      .select('journal_entries.ledger_category_id as category_id', 'categories.name as category_name')
      .sum('journal_entries.amount_collected as total');
    if (filters?.date_from) query = query.where('journal_entries.collection_date', '>=', filters.date_from);
    if (filters?.date_to) query = query.where('journal_entries.collection_date', '<=', filters.date_to);
    if (filters?.journal_category_id) query = query.where('journal_entries.ledger_category_id', filters.journal_category_id);
    const rows = await query;
    return rows.map((r: any) => ({ category_id: r.category_id, category_name: r.category_name || 'Unknown', total: Math.round(Number(r.total ?? 0) * 100) / 100 }));
  }

  private async getDailyBreakdown(table: string, dateColumn: string, valueColumn: string, start: Date, end: Date, filters?: Record<string, any>): Promise<any[]> {
    const db = getDatabase();
    let query = db(table)
      .whereNull('deleted_at')
      .where(dateColumn, '>=', start.toISOString())
      .where(dateColumn, '<', end.toISOString())
      .groupBy(db.raw(`date(${dateColumn})::text`))
      .select(db.raw(`date(${dateColumn})::text as date`))
      .sum(`${valueColumn} as total`);
    if (filters?.status && table === 'expenses') query = query.where('status', filters.status);
    if (filters?.vehicle_id) query = query.where('vehicle_id', filters.vehicle_id);
    return query.orderBy('date', 'asc');
  }

  private async profitLoss(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      totalRevenueRow,
      totalExpenseRow,
      netProfit,
      netMargin,
      revenueByPlatform,
      expensesByCat,
      vehicleProfitability,
      monthlyRevenueRow,
      monthlyExpenseRow,
    ] = await Promise.all([
      db('bookings').whereNull('deleted_at').whereIn('status', ['COMPLETED', 'CONFIRMED']).sum('net_revenue as total').first(),
      db('expenses').whereNull('deleted_at').whereIn('status', ['APPROVED', 'REIMBURSED']).sum('amount as total').first(),
      profitService.getNetProfit(),
      profitService.getNetMargin(),
      this.getRevenueByPlatform(filters),
      expenseService.getExpensesByCategory(),
      fleetAnalyticsService.getVehicleProfitability(),
      db('bookings').whereNull('deleted_at').whereIn('status', ['COMPLETED', 'CONFIRMED']).where('booking_date_time', '>=', monthStart).sum('net_revenue as total').first(),
      db('expenses').whereNull('deleted_at').whereIn('status', ['APPROVED', 'REIMBURSED']).where('expense_date', '>=', monthStart).sum('amount as total').first(),
    ]);

    const totalRevenue = Number((totalRevenueRow as any)?.total ?? 0);
    const totalExpense = Number((totalExpenseRow as any)?.total ?? 0);
    const monthlyRevenue = Number((monthlyRevenueRow as any)?.total ?? 0);
    const monthlyExpense = Number((monthlyExpenseRow as any)?.total ?? 0);

    return {
      report_type: 'profit_loss', report_name: REPORT_NAMES.profit_loss,
      generated_at: new Date().toISOString(), filters,
      summary: {
        total_revenue: Math.round(Number(totalRevenue) * 100) / 100,
        total_expense: Math.round(Number(totalExpense) * 100) / 100,
        net_profit: Math.round(netProfit * 100) / 100,
        net_margin: netMargin,
        monthly_revenue: Math.round(Number(monthlyRevenue) * 100) / 100,
        monthly_expense: Math.round(Number(monthlyExpense) * 100) / 100,
      },
      columns: [
        { key: 'category', label: 'Category' },
        { key: 'amount', label: 'Amount (₹)' },
        { key: 'percentage', label: 'Percentage' },
      ],
      rows: [
        { category: 'Total Revenue', amount: Math.round(Number(totalRevenue) * 100) / 100, percentage: '100%' },
        { category: 'Total Expense', amount: Math.round(Number(totalExpense) * 100) / 100, percentage: Number(totalRevenue) > 0 ? `${Math.round((Number(totalExpense) / Number(totalRevenue)) * 100)}%` : '0%' },
        { category: 'Net Profit', amount: Math.round(netProfit * 100) / 100, percentage: Number(totalRevenue) > 0 ? `${Math.round((netProfit / Number(totalRevenue)) * 100)}%` : '0%' },
      ],
      charts: [
        { type: 'bar', title: 'Revenue by Platform', labels: revenueByPlatform.map(p => p.platform_name), datasets: [{ label: 'Revenue', data: revenueByPlatform.map(p => p.total) }] },
        { type: 'pie', title: 'Expense by Category', labels: expensesByCat.map(c => c.category_name), datasets: [{ label: 'Expense', data: expensesByCat.map(c => c.total) }] },
        { type: 'bar', title: 'Vehicle Profitability', labels: vehicleProfitability.slice(0, 10).map(v => v.vehicle_number), datasets: [{ label: 'Profit', data: vehicleProfitability.slice(0, 10).map(v => v.profit) }] },
      ],
    };
  }

  private async fleetUtilization(filters: ReportFilters): Promise<ReportResult> {
    const [fleetSummary, revenuePerVeh, expensePerVeh, avgRevenue, avgExpense] = await Promise.all([
      fleetAnalyticsService.getFleetSummary(),
      fleetAnalyticsService.getRevenuePerVehicle(),
      fleetAnalyticsService.getExpensePerVehicle(),
      fleetAnalyticsService.getAverageRevenuePerVehicle(),
      fleetAnalyticsService.getAverageExpensePerVehicle(),
    ]);

    const vehicleData = revenuePerVeh.map(v => {
      const exp = expensePerVeh.find(e => e.vehicle_id === v.vehicle_id);
      return {
        vehicle_number: v.vehicle_number,
        revenue: v.total_revenue,
        expense: exp?.total_expense ?? 0,
        profit: Math.round((v.total_revenue - (exp?.total_expense ?? 0)) * 100) / 100,
      };
    });

    return {
      report_type: 'fleet_utilization', report_name: REPORT_NAMES.fleet_utilization,
      generated_at: new Date().toISOString(), filters,
      summary: {
        total_vehicles: fleetSummary.total_vehicles,
        active: fleetSummary.active_vehicles,
        booked: fleetSummary.booked_vehicles,
        maintenance: fleetSummary.maintenance_vehicles,
        utilization_rate: fleetSummary.utilization_rate,
        avg_revenue_per_vehicle: avgRevenue,
        avg_expense_per_vehicle: avgExpense,
      },
      columns: [
        { key: 'metric', label: 'Metric' },
        { key: 'value', label: 'Value' },
      ],
      rows: [
        { metric: 'Total Vehicles', value: fleetSummary.total_vehicles },
        { metric: 'Active Vehicles', value: fleetSummary.active_vehicles },
        { metric: 'Booked Vehicles', value: fleetSummary.booked_vehicles },
        { metric: 'Maintenance', value: fleetSummary.maintenance_vehicles },
        { metric: 'Utilization Rate', value: `${fleetSummary.utilization_rate}%` },
        { metric: 'Avg Revenue/Vehicle', value: avgRevenue },
        { metric: 'Avg Expense/Vehicle', value: avgExpense },
      ],
      charts: [
        { type: 'bar', title: 'Revenue per Vehicle', labels: vehicleData.slice(0, 10).map(v => v.vehicle_number), datasets: [{ label: 'Revenue', data: vehicleData.slice(0, 10).map(v => v.revenue) }] },
        { type: 'bar', title: 'Expense per Vehicle', labels: vehicleData.slice(0, 10).map(v => v.vehicle_number), datasets: [{ label: 'Expense', data: vehicleData.slice(0, 10).map(v => v.expense) }] },
      ],
    };
  }

  private async maintenanceCostReport(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    let qb = db('maintenance_records')
      .leftJoin('vehicles', 'maintenance_records.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as types', 'maintenance_records.maintenance_type_id', 'types.id')
      .leftJoin('vendors', 'maintenance_records.vendor_id', 'vendors.id')
      .select(
        'vehicles.vehicle_number', 'vehicles.vehicle_name',
        'maintenance_records.cost', 'maintenance_records.service_date',
        'maintenance_records.odometer_reading', 'maintenance_records.status',
        'types.name as maintenance_type', 'vendors.name as vendor_name'
      )
      .whereNull('maintenance_records.deleted_at');

    if (filters.date_from) qb = qb.where('maintenance_records.service_date', '>=', filters.date_from);
    if (filters.date_to) qb = qb.where('maintenance_records.service_date', '<=', filters.date_to);
    if (filters.vehicle_id) qb = qb.where('maintenance_records.vehicle_id', filters.vehicle_id);

    const records = await qb.orderBy('maintenance_records.service_date', 'desc').limit(500);
    const totalCost = records.reduce((s: number, r: any) => s + Number(r.cost), 0);

    return {
      report_type: 'maintenance_cost', report_name: REPORT_NAMES.maintenance_cost,
      generated_at: new Date().toISOString(), filters,
      summary: { total_cost: Math.round(totalCost * 100) / 100, record_count: records.length },
      columns: [
        { key: 'vehicle_number', label: 'Vehicle' },
        { key: 'service_date', label: 'Date' },
        { key: 'maintenance_type', label: 'Type' },
        { key: 'cost', label: 'Cost' },
        { key: 'vendor_name', label: 'Vendor' },
        { key: 'status', label: 'Status' },
      ],
      rows: records.map((r: any) => ({
        vehicle_number: r.vehicle_number, service_date: r.service_date,
        maintenance_type: r.maintenance_type, cost: r.cost,
        vendor_name: r.vendor_name || '-', status: r.status,
      })),
      charts: [
        { type: 'bar', title: 'Maintenance Cost by Vehicle', labels: [...new Set(records.map((r: any) => r.vehicle_number))].slice(0, 20), datasets: [{ label: 'Total Cost', data: (Object.values(records.reduce((acc: any, r: any) => { acc[r.vehicle_number] = (acc[r.vehicle_number] || 0) + Number(r.cost); return acc; }, {})) as number[]).slice(0, 20) }] },
      ],
    };
  }

  private async maintenanceSummaryReport(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];

    const byType = await db('maintenance_records')
      .leftJoin('master_values as types', 'maintenance_records.maintenance_type_id', 'types.id')
      .whereNull('maintenance_records.deleted_at')
      .select('types.name as type_name')
      .count('* as count').sum('cost as total').groupBy('types.name');

    const byVehicle = await db('maintenance_records')
      .leftJoin('vehicles', 'maintenance_records.vehicle_id', 'vehicles.id')
      .whereNull('maintenance_records.deleted_at')
      .select('vehicles.vehicle_number')
      .count('* as count').sum('cost as total').groupBy('vehicles.vehicle_number')
      .orderByRaw('SUM(cost) DESC').limit(10);

    const upcomingServices = await db('service_schedules')
      .leftJoin('vehicles', 'service_schedules.vehicle_id', 'vehicles.id')
      .whereNull('service_schedules.deleted_at').where('service_schedules.status', 'active')
      .where('service_schedules.next_service_date', '<=', in30Days)
      .where('service_schedules.next_service_date', '>=', now.toISOString().split('T')[0])
      .select('vehicles.vehicle_number', 'service_schedules.next_service_date', 'service_schedules.service_type');

    return {
      report_type: 'maintenance_summary', report_name: REPORT_NAMES.maintenance_summary,
      generated_at: new Date().toISOString(), filters,
      summary: { total_types: byType.length, top_vehicle: byVehicle[0]?.vehicle_number || '-', upcoming_services: upcomingServices.length },
      columns: [
        { key: 'type_name', label: 'Type' },
        { key: 'count', label: 'Count' },
        { key: 'total', label: 'Total Cost' },
      ],
      rows: byType.map((r: any) => ({ type_name: r.type_name, count: Number(r.count), total: Math.round(Number(r.total) * 100) / 100 })),
      charts: [
        { type: 'pie', title: 'Maintenance by Type', labels: byType.map((r: any) => r.type_name), datasets: [{ label: 'Count', data: byType.map((r: any) => Number(r.count)) }] },
      ],
    };
  }

  private async vendorPerformanceReport(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    let qb = db('vendors')
      .leftJoin('maintenance_records', 'vendors.id', 'maintenance_records.vendor_id')
      .leftJoin('master_values as types', 'vendors.vendor_type_id', 'types.id')
      .select(
        'vendors.id', 'vendors.name', 'vendors.rating', 'vendors.city',
        'types.name as vendor_type_name',
        db.raw('COUNT(maintenance_records.id) as service_count'),
        db.raw('COALESCE(SUM(maintenance_records.cost), 0) as total_cost')
      )
      .whereNull('vendors.deleted_at')
      .groupBy('vendors.id', 'types.name');

    if (filters.date_from) qb = qb.where('maintenance_records.service_date', '>=', filters.date_from);
    if (filters.date_to) qb = qb.where('maintenance_records.service_date', '<=', filters.date_to);

    const vendors = await qb.orderByRaw('COALESCE(SUM(maintenance_records.cost), 0) DESC').limit(100);

    return {
      report_type: 'vendor_performance', report_name: REPORT_NAMES.vendor_performance,
      generated_at: new Date().toISOString(), filters,
      summary: { total_vendors: vendors.length, top_vendor: vendors[0]?.name || '-', total_services: vendors.reduce((s: number, v: any) => s + Number(v.service_count), 0) },
      columns: [
        { key: 'name', label: 'Vendor' },
        { key: 'vendor_type_name', label: 'Type' },
        { key: 'city', label: 'City' },
        { key: 'rating', label: 'Rating' },
        { key: 'service_count', label: 'Services' },
        { key: 'total_cost', label: 'Total Cost' },
      ],
      rows: vendors.map((v: any) => ({ name: v.name, vendor_type_name: v.vendor_type_name || '-', city: v.city || '-', rating: v.rating || '-', service_count: Number(v.service_count), total_cost: Math.round(Number(v.total_cost) * 100) / 100 })),
      charts: [
        { type: 'bar', title: 'Vendor Cost Comparison', labels: vendors.slice(0, 10).map((v: any) => v.name), datasets: [{ label: 'Total Cost', data: vendors.slice(0, 10).map((v: any) => Number(v.total_cost)) }] },
      ],
    };
  }

  private async outstandingCollection(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    const { total_collected, total_outstanding } = await cashFlowService.calculateJournalBalance();

    let query = db('journal_entries')
      .leftJoin('vehicles', 'journal_entries.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'journal_entries.ledger_category_id', 'categories.id')
      .whereNull('journal_entries.deleted_at')
      .where('journal_entries.status', 'PENDING')
      .select(
        'journal_entries.*',
        'vehicles.vehicle_number',
        'categories.name as category_name',
        db.raw('(journal_entries.total_amount - journal_entries.amount_collected) as outstanding_amount')
      )
      .having(db.raw('(journal_entries.total_amount - journal_entries.amount_collected)'), '>', 0);
    if (filters.date_from) query = query.where('journal_entries.collection_date', '>=', filters.date_from);
    if (filters.date_to) query = query.where('journal_entries.collection_date', '<=', filters.date_to);
    if (filters.vehicle_id) query = query.where('journal_entries.vehicle_id', filters.vehicle_id);
    if (filters.journal_category_id) query = query.where('journal_entries.ledger_category_id', filters.journal_category_id);
    const rows = await query.orderBy(db.raw('outstanding_amount'), 'desc');

    return {
      report_type: 'outstanding_collection', report_name: REPORT_NAMES.outstanding_collection,
      generated_at: new Date().toISOString(), filters,
      summary: {
        total_collected: Math.round(total_collected * 100) / 100,
        total_outstanding: Math.round(total_outstanding * 100) / 100,
        outstanding_entries: rows.length,
      },
      columns: [
        { key: 'vehicle_number', label: 'Vehicle' },
        { key: 'category_name', label: 'Category' },
        { key: 'amount_collected', label: 'Collected' },
        { key: 'total_amount', label: 'Total Due' },
        { key: 'outstanding_amount', label: 'Outstanding' },
      ],
      rows: rows.map((r: any) => ({
        vehicle_number: r.vehicle_number || '-',
        category_name: r.category_name || '-',
        amount_collected: Number(r.amount_collected ?? 0),
        total_amount: Number(r.total_amount ?? 0),
        outstanding_amount: Number(r.outstanding_amount ?? 0),
      })),
    };
  }

  private async outstandingReport(filters: ReportFilters): Promise<ReportResult> {
    const result = await outstandingService.findAll({
      ...filters,
      page: '1', limit: '1000',
      sort_by: 'due_date', sort_order: 'asc',
    });
    const totalAmount = result.data.reduce((sum: number, o: any) => sum + Number(o.amount), 0);
    const unpaidAmount = result.data
      .filter((o: any) => !['paid', 'cancelled'].includes(o.status))
      .reduce((sum: number, o: any) => sum + Number(o.amount), 0);

    return {
      report_type: 'outstanding_report', report_name: REPORT_NAMES.outstanding_report,
      generated_at: new Date().toISOString(), filters,
      summary: { total_outstanding: totalAmount, unpaid: unpaidAmount, record_count: result.data.length },
      columns: [
        { key: 'title', label: 'Title' },
        { key: 'category_name', label: 'Category' },
        { key: 'vehicle_number', label: 'Vehicle' },
        { key: 'amount', label: 'Amount' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Status' },
      ],
      rows: result.data.map((o: any) => ({
        title: o.title,
        category_name: o.category_name || '-',
        vehicle_number: o.vehicle_number || '-',
        amount: Number(o.amount),
        due_date: o.due_date,
        priority: o.priority,
        status: o.status,
      })),
    };
  }

  private async upcomingPaymentReport(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    let query = db('outstandings')
      .leftJoin('vehicles', 'outstandings.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'outstandings.outstanding_category_id', 'categories.id')
      .whereNull('outstandings.deleted_at')
      .whereNotIn('outstandings.status', ['paid', 'cancelled'])
      .where('outstandings.due_date', '>=', today)
      .where('outstandings.due_date', '<=', in30Days)
      .select('outstandings.*', 'vehicles.vehicle_number', 'categories.name as category_name')
      .orderBy('outstandings.due_date', 'asc');
    if (filters.vehicle_id) query = query.where('outstandings.vehicle_id', filters.vehicle_id);
    const rows = await query.limit(1000);
    const totalAmount = rows.reduce((s: number, r: any) => s + Number(r.amount), 0);

    return {
      report_type: 'upcoming_payment', report_name: REPORT_NAMES.upcoming_payment,
      generated_at: new Date().toISOString(), filters,
      summary: { total_upcoming: totalAmount, record_count: rows.length },
      columns: [
        { key: 'title', label: 'Title' },
        { key: 'category_name', label: 'Category' },
        { key: 'vehicle_number', label: 'Vehicle' },
        { key: 'amount', label: 'Amount' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'priority', label: 'Priority' },
      ],
      rows: rows.map((r: any) => ({
        title: r.title,
        category_name: r.category_name || '-',
        vehicle_number: r.vehicle_number || '-',
        amount: Number(r.amount),
        due_date: r.due_date,
        priority: r.priority,
      })),
    };
  }

  private async vehicleProfitabilityReport(filters: ReportFilters): Promise<ReportResult> {
    const profitability = await fleetAnalyticsService.getVehicleProfitability();
    return {
      report_type: 'vehicle_profitability', report_name: REPORT_NAMES.vehicle_profitability,
      generated_at: new Date().toISOString(), filters,
      summary: {
        total_vehicles: profitability.length,
        profitable: profitability.filter((v: any) => v.profit > 0).length,
        unprofitable: profitability.filter((v: any) => v.profit < 0).length,
      },
      columns: [
        { key: 'vehicle_number', label: 'Vehicle' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'expense', label: 'Expense' },
        { key: 'profit', label: 'Profit' },
        { key: 'margin', label: 'Margin %' },
      ],
      rows: profitability.map((v: any) => ({
        vehicle_number: v.vehicle_number || '-',
        revenue: Number(v.revenue ?? 0),
        expense: Number(v.expense ?? 0),
        profit: Number(v.profit ?? 0),
        margin: v.revenue > 0 ? Math.round((v.profit / v.revenue) * 10000) / 100 : 0,
      })),
    };
  }

  private async platformProfitabilityReport(filters: ReportFilters): Promise<ReportResult> {
    const analytics = await outstandingService.getPlatformAnalytics({ date_from: filters.date_from, date_to: filters.date_to });
    return {
      report_type: 'platform_profitability', report_name: REPORT_NAMES.platform_profitability,
      generated_at: new Date().toISOString(), filters,
      summary: { total_platforms: analytics.total_platforms },
      columns: [
        { key: 'platform_name', label: 'Platform' },
        { key: 'total_revenue', label: 'Revenue' },
        { key: 'gross_fare', label: 'Gross Fare' },
        { key: 'commission', label: 'Commission' },
      ],
      rows: analytics.revenue_by_platform.map((p: any) => ({
        platform_name: p.platform_name,
        total_revenue: p.total_revenue,
        gross_fare: p.gross_fare,
        commission: p.commission,
      })),
    };
  }

  private async cashRequirementReport(filters: ReportFilters): Promise<ReportResult> {
    const forecast = await outstandingService.getCashRequirementForecast();
    return {
      report_type: 'cash_requirement', report_name: REPORT_NAMES.cash_requirement,
      generated_at: new Date().toISOString(), filters,
      summary: {
        next_7_days: forecast.next_7_days,
        next_30_days: forecast.next_30_days,
        current_month: forecast.current_month,
        quarter: forecast.quarter,
        year: forecast.year,
      },
      columns: [
        { key: 'period', label: 'Period' },
        { key: 'amount', label: 'Required Amount' },
      ],
      rows: [
        { period: 'Next 7 Days', amount: forecast.next_7_days },
        { period: 'Next 30 Days', amount: forecast.next_30_days },
        { period: 'Current Month', amount: forecast.current_month },
        { period: 'Quarter', amount: forecast.quarter },
        { period: 'Year', amount: forecast.year },
      ],
      charts: [
        { type: 'bar', title: 'Cash Requirement Forecast', labels: ['7 Days', '30 Days', 'Month', 'Quarter', 'Year'], datasets: [{ label: 'Required', data: [forecast.next_7_days, forecast.next_30_days, forecast.current_month, forecast.quarter, forecast.year] }] },
      ],
    };
  }

  private async outstandingAgeingReport(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const days30 = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];
    const days60 = new Date(now.getTime() - 60 * 86400000).toISOString().split('T')[0];
    const days90 = new Date(now.getTime() - 90 * 86400000).toISOString().split('T')[0];

    const rows = await db('outstandings')
      .leftJoin('vehicles', 'outstandings.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'outstandings.outstanding_category_id', 'categories.id')
      .whereNull('outstandings.deleted_at')
      .whereNotIn('outstandings.status', ['paid', 'cancelled'])
      .select('outstandings.*', 'vehicles.vehicle_number', 'categories.name as category_name')
      .orderBy('outstandings.due_date', 'asc')
      .limit(1000);

    const ageingBuckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    for (const r of rows) {
      const dueDate = new Date(r.due_date);
      const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / 86400000);
      if (diffDays <= 0) continue;
      if (diffDays <= 30) ageingBuckets['0-30'] += Number(r.amount);
      else if (diffDays <= 60) ageingBuckets['31-60'] += Number(r.amount);
      else if (diffDays <= 90) ageingBuckets['61-90'] += Number(r.amount);
      else ageingBuckets['90+'] += Number(r.amount);
    }

    return {
      report_type: 'outstanding_ageing', report_name: REPORT_NAMES.outstanding_ageing,
      generated_at: new Date().toISOString(), filters,
      summary: {
        total_overdue: Object.values(ageingBuckets).reduce((a: number, b: number) => a + b, 0),
        ...ageingBuckets,
      },
      columns: [
        { key: 'bucket', label: 'Ageing Bucket' },
        { key: 'amount', label: 'Amount' },
      ],
      rows: [
        { bucket: '0-30 Days', amount: ageingBuckets['0-30'] },
        { bucket: '31-60 Days', amount: ageingBuckets['31-60'] },
        { bucket: '61-90 Days', amount: ageingBuckets['61-90'] },
        { bucket: '90+ Days', amount: ageingBuckets['90+'] },
      ],
      charts: [
        { type: 'pie', title: 'Outstanding Ageing', labels: Object.keys(ageingBuckets), datasets: [{ label: 'Amount', data: Object.values(ageingBuckets) }] },
      ],
    };
  }

  private async paymentCalendarReport(filters: ReportFilters): Promise<ReportResult> {
    const db = getDatabase();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yearEnd = new Date(now.getFullYear() + 1, 0, 0).toISOString().split('T')[0];

    let query = db('outstandings')
      .leftJoin('vehicles', 'outstandings.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'outstandings.outstanding_category_id', 'categories.id')
      .whereNull('outstandings.deleted_at')
      .whereNotIn('outstandings.status', ['paid', 'cancelled'])
      .where('outstandings.due_date', '>=', today)
      .where('outstandings.due_date', '<=', yearEnd)
      .select('outstandings.*', 'vehicles.vehicle_number', 'categories.name as category_name')
      .orderBy('outstandings.due_date', 'asc');
    if (filters.vehicle_id) query = query.where('outstandings.vehicle_id', filters.vehicle_id);
    const rows = await query.limit(1000);

    return {
      report_type: 'payment_calendar', report_name: REPORT_NAMES.payment_calendar,
      generated_at: new Date().toISOString(), filters,
      summary: { upcoming_payments: rows.length },
      columns: [
        { key: 'title', label: 'Title' },
        { key: 'category_name', label: 'Category' },
        { key: 'amount', label: 'Amount' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'priority', label: 'Priority' },
      ],
      rows: rows.map((r: any) => ({
        title: r.title,
        category_name: r.category_name || '-',
        amount: Number(r.amount),
        due_date: r.due_date,
        priority: r.priority,
      })),
      charts: [
        { type: 'line', title: 'Payment Calendar', labels: rows.slice(0, 12).map((r: any) => r.due_date), datasets: [{ label: 'Amount', data: rows.slice(0, 12).map((r: any) => Number(r.amount)) }] },
      ],
    };
  }

  private async revenueByPlatformReport(filters: ReportFilters): Promise<ReportResult> {
    const analytics = await outstandingService.getPlatformAnalytics({ date_from: filters.date_from, date_to: filters.date_to });
    return {
      report_type: 'revenue_by_platform', report_name: REPORT_NAMES.revenue_by_platform,
      generated_at: new Date().toISOString(), filters,
      summary: { total_platforms: analytics.total_platforms },
      columns: [
        { key: 'platform_name', label: 'Platform' },
        { key: 'total_revenue', label: 'Revenue' },
        { key: 'gross_fare', label: 'Gross Fare' },
        { key: 'commission', label: 'Commission' },
        { key: 'bookings', label: 'Bookings' },
      ],
      rows: analytics.revenue_by_platform.map((p: any) => ({
        platform_name: p.platform_name,
        total_revenue: p.total_revenue,
        gross_fare: p.gross_fare,
        commission: p.commission,
        bookings: analytics.bookings_by_platform.find((b: any) => b.platform_id === p.platform_id)?.total || 0,
      })),
      charts: [
        { type: 'bar', title: 'Revenue by Platform', labels: analytics.revenue_by_platform.map((p: any) => p.platform_name), datasets: [{ label: 'Revenue', data: analytics.revenue_by_platform.map((p: any) => p.total_revenue) }] },
      ],
    };
  }

  private async revenueByCategoryReport(filters: ReportFilters): Promise<ReportResult> {
    const categories = await expenseService.getExpensesByCategory();
    const totalExpense = categories.reduce((s: number, c: any) => s + c.total, 0);
    return {
      report_type: 'revenue_by_category', report_name: REPORT_NAMES.revenue_by_category,
      generated_at: new Date().toISOString(), filters,
      summary: { total_expense: totalExpense, categories: categories.length },
      columns: [
        { key: 'category_name', label: 'Category' },
        { key: 'total', label: 'Amount' },
        { key: 'percentage', label: '% of Total' },
      ],
      rows: categories.map((c: any) => ({
        category_name: c.category_name || 'Unknown',
        total: c.total,
        percentage: totalExpense > 0 ? Math.round((c.total / totalExpense) * 10000) / 100 : 0,
      })),
      charts: [
        { type: 'pie', title: 'Expense by Category', labels: categories.map((c: any) => c.category_name), datasets: [{ label: 'Amount', data: categories.map((c: any) => c.total) }] },
      ],
    };
  }

  private async executiveSummaryReport(filters: ReportFilters): Promise<ReportResult> {
    const [profitability, revenue, expense, profit, cashFlow, planner, forecast] = await Promise.all([
      fleetAnalyticsService.getVehicleProfitability(),
      revenueService.getYearlyRevenue(),
      expenseService.getTotalExpenses(),
      profitService.getNetProfit(),
      cashFlowService.getCashFlowSummary(),
      outstandingService.getPaymentPlanner(),
      outstandingService.getCashRequirementForecast(),
    ]);

    const avgMargin = revenue > 0 ? Math.round((profit / revenue) * 10000) / 100 : 0;
    const sortedByProfit = [...profitability].sort((a: any, b: any) => b.profit - a.profit);
    const topVehicle = sortedByProfit[0];
    const lowestVehicle = sortedByProfit[sortedByProfit.length - 1];
    const profitableCount = profitability.filter((v: any) => v.profit > 0).length;

    return {
      report_type: 'executive_summary', report_name: REPORT_NAMES.executive_summary,
      generated_at: new Date().toISOString(), filters,
      summary: {
        total_revenue: revenue, total_expense: expense, total_profit: profit,
        net_margin: avgMargin, cash_position: cashFlow.net_cash_flow,
        total_outstanding: planner.total_outstanding,
        overdue_amount: planner.overdue_amount,
        cash_required_30d: forecast.next_30_days,
        healthy_vehicles: profitableCount,
      },
      columns: [
        { key: 'metric', label: 'Metric' },
        { key: 'value', label: 'Value' },
      ],
      rows: [
        { metric: 'Total Revenue', value: revenue },
        { metric: 'Total Expense', value: expense },
        { metric: 'Net Profit', value: profit },
        { metric: 'Net Margin', value: `${avgMargin}%` },
        { metric: 'Cash Position', value: cashFlow.net_cash_flow },
        { metric: 'Total Outstanding', value: planner.total_outstanding },
        { metric: 'Overdue Amount', value: planner.overdue_amount },
        { metric: 'Total Inflow', value: cashFlow.total_inflow },
        { metric: 'Total Outflow', value: cashFlow.total_outflow },
        { metric: 'Cash Required (30 days)', value: forecast.next_30_days },
        { metric: 'Due Today', value: planner.due_today },
        { metric: 'Due This Week', value: planner.due_this_week },
        { metric: 'Due This Month', value: planner.due_this_month },
        { metric: 'Largest Liability', value: planner.largest_liability ? `${planner.largest_liability.title} - ₹${planner.largest_liability.amount}` : 'None' },
        { metric: 'Top Vehicle', value: topVehicle ? `${topVehicle.vehicle_number} - Profit: ₹${topVehicle.profit}` : 'N/A' },
        { metric: 'Healthy Vehicles', value: profitability.length > 0 ? `${profitableCount}/${profitability.length}` : 'N/A' },
      ],
      charts: [
        { type: 'bar', title: 'Revenue vs Expense vs Profit', labels: ['Revenue', 'Expense', 'Profit'], datasets: [{ label: 'Amount', data: [revenue, expense, profit] }] },
        { type: 'bar', title: 'Cash Requirement Forecast', labels: ['7 Days', '30 Days', 'Month', 'Quarter', 'Year'], datasets: [{ label: 'Required', data: [forecast.next_7_days, forecast.next_30_days, forecast.current_month, forecast.quarter, forecast.year] }] },
      ],
    };
  }
}

export const reportsService = new ReportsService();
