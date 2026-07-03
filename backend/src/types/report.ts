export const REPORT_TYPES = [
  'daily_financial',
  'weekly_financial',
  'monthly_financial',
  'yearly_financial',
  'custom_range',
  'vehicle_revenue',
  'vehicle_expense',
  'vehicle_profit',
  'platform_revenue',
  'platform_commission',
  'platform_net_revenue',
  'journal_collection',
  'expense_category',
  'expense_payment_mode',
  'fleet_performance',
  'maintenance_cost',
  'maintenance_summary',
  'vendor_performance',
  'profit_loss',
  'fleet_utilization',
  'outstanding_collection',
  'outstanding_report',
  'upcoming_payment',
  'vehicle_profitability',
  'platform_profitability',
  'cash_requirement',
  'outstanding_ageing',
  'payment_calendar',
  'revenue_by_platform',
  'revenue_by_category',
  'executive_summary',
] as const;

export type ReportType = typeof REPORT_TYPES[number];

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

export interface GenerateReportDTO {
  report_type: ReportType;
  filters?: ReportFilters;
}

export interface ReportTemplate {
  id: string;
  name: string;
  report_type: ReportType;
  filters: ReportFilters;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateReportTemplateDTO {
  name: string;
  report_type: ReportType;
  filters: ReportFilters;
  is_favorite?: boolean;
}

export interface UpdateReportTemplateDTO {
  name?: string;
  filters?: ReportFilters;
  is_favorite?: boolean;
}

export interface ReportHistory {
  id: string;
  report_type: ReportType;
  filters: ReportFilters;
  status: string;
  created_at: string;
  generated_by: string | null;
}

export interface ReportSummary {
  total_revenue?: number;
  total_expense?: number;
  total_profit?: number;
  total_collections?: number;
  total_commission?: number;
  total_bookings?: number;
  record_count?: number;
  [key: string]: unknown;
}

export interface ReportRow {
  [key: string]: unknown;
}

export interface ReportResult {
  report_type: ReportType;
  report_name: string;
  generated_at: string;
  filters: ReportFilters;
  summary: ReportSummary;
  columns: { key: string; label: string }[];
  rows: ReportRow[];
  charts?: {
    type: 'bar' | 'pie' | 'line';
    title: string;
    labels: string[];
    datasets: { label: string; data: number[]; color?: string }[];
  }[];
}
