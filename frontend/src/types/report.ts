export const REPORT_TYPES = [
  'daily_financial', 'weekly_financial', 'monthly_financial', 'yearly_financial', 'custom_range',
  'vehicle_revenue', 'vehicle_expense', 'vehicle_profit',
  'platform_revenue', 'platform_commission', 'platform_net_revenue',
  'journal_collection', 'expense_category', 'expense_payment_mode', 'fleet_performance',
  'maintenance_cost', 'maintenance_summary', 'vendor_performance',
  'profit_loss', 'fleet_utilization', 'outstanding_collection',
  'outstanding_report', 'upcoming_payment', 'vehicle_profitability', 'platform_profitability',
  'cash_requirement', 'outstanding_ageing', 'payment_calendar',
  'revenue_by_platform', 'revenue_by_category', 'executive_summary',
] as const;

export type ReportType = typeof REPORT_TYPES[number];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
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
  cash_requirement: 'Cash Requirement Forecast',
  outstanding_ageing: 'Outstanding Ageing Report',
  payment_calendar: 'Payment Calendar Report',
  revenue_by_platform: 'Revenue by Platform Report',
  revenue_by_category: 'Revenue by Category Report',
  executive_summary: 'Executive Financial Summary',
};

export const REPORT_TYPE_ICONS: Record<ReportType, string> = {
  daily_financial: 'Calendar',
  weekly_financial: 'CalendarDays',
  monthly_financial: 'CalendarRange',
  yearly_financial: 'CalendarCheck',
  custom_range: 'SlidersHorizontal',
  vehicle_revenue: 'Truck',
  vehicle_expense: 'Truck',
  vehicle_profit: 'Truck',
  platform_revenue: 'Building2',
  platform_commission: 'Percent',
  platform_net_revenue: 'LineChart',
  journal_collection: 'BookOpen',
  expense_category: 'Tags',
  expense_payment_mode: 'CreditCard',
  fleet_performance: 'Gauge',
  maintenance_cost: 'IndianRupee',
  maintenance_summary: 'ClipboardList',
  vendor_performance: 'Building2',
  profit_loss: 'LineChart',
  fleet_utilization: 'Gauge',
  outstanding_collection: 'BookOpen',
  outstanding_report: 'CalendarClock',
  upcoming_payment: 'CalendarCheck',
  vehicle_profitability: 'TrendingUp',
  platform_profitability: 'Building2',
  cash_requirement: 'IndianRupee',
  outstanding_ageing: 'Clock',
  payment_calendar: 'CalendarDays',
  revenue_by_platform: 'BarChart3',
  revenue_by_category: 'PieChart',
  executive_summary: 'FileText',
};

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  vehicle_id?: string;
  platform_id?: string;
  expense_category_id?: string;
  payment_mode_id?: string;
  journal_category_id?: string;
  status?: string;
}

export interface ReportColumn {
  key: string;
  label: string;
}

export interface ReportChart {
  type: 'bar' | 'pie' | 'line';
  title: string;
  labels: string[];
  datasets: { label: string; data: number[]; color?: string }[];
}

export interface ReportResult {
  report_type: ReportType;
  report_name: string;
  generated_at: string;
  filters: ReportFilters;
  summary: Record<string, unknown>;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  charts?: ReportChart[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  report_type: ReportType;
  filters: ReportFilters;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportHistory {
  id: string;
  report_type: ReportType;
  filters: ReportFilters;
  status: string;
  created_at: string;
}
