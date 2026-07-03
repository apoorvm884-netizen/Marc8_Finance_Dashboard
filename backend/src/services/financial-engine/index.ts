import { revenueService, RevenueService } from './revenue.service';
import { expenseService, ExpenseService } from './expense.service';
import { profitService, ProfitService } from './profit.service';
import { cashFlowService, CashFlowService } from './cash-flow.service';
import { dashboardAggregationService, DashboardAggregationService } from './dashboard-aggregation.service';
import { fleetAnalyticsService, FleetAnalyticsService } from './fleet-analytics.service';
import { dashboardService, DashboardService } from './dashboard.service';
import { analyticsService, AnalyticsService } from './analytics.service';
import { notificationEngineService, NotificationEngineService } from './notification-engine.service';

export class FinancialEngine {
  public readonly revenue: RevenueService;
  public readonly expense: ExpenseService;
  public readonly profit: ProfitService;
  public readonly cashFlow: CashFlowService;
  public readonly dashboard: DashboardAggregationService;
  public readonly fleet: FleetAnalyticsService;
  public readonly dashboardService: DashboardService;
  public readonly analytics: AnalyticsService;
  public readonly notifications: NotificationEngineService;

  constructor() {
    this.revenue = revenueService;
    this.expense = expenseService;
    this.profit = profitService;
    this.cashFlow = cashFlowService;
    this.dashboard = dashboardAggregationService;
    this.fleet = fleetAnalyticsService;
    this.dashboardService = dashboardService;
    this.analytics = analyticsService;
    this.notifications = notificationEngineService;
  }

  async getFullFinancialSummary() {
    return this.dashboard.getAggregatedMetrics();
  }
}

export {
  revenueService,
  RevenueService,
  expenseService,
  ExpenseService,
  profitService,
  ProfitService,
  cashFlowService,
  CashFlowService,
  dashboardAggregationService,
  DashboardAggregationService,
  fleetAnalyticsService,
  FleetAnalyticsService,
  dashboardService,
  DashboardService,
  analyticsService,
  AnalyticsService,
  notificationEngineService,
  NotificationEngineService,
};

export const financialEngine = new FinancialEngine();
