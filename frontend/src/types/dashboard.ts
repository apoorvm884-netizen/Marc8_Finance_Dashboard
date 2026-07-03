export interface KPIs {
  todays_revenue: number;
  weekly_revenue: number;
  monthly_revenue: number;
  yearly_revenue: number;
  todays_expense: number;
  weekly_expense: number;
  monthly_expense: number;
  yearly_expense: number;
  todays_profit: number;
  weekly_profit: number;
  monthly_profit: number;
  yearly_profit: number;
  net_profit: number;
  net_margin: number;
  cash_flow: number;
  outstanding_collections: number;
  total_vehicles: number;
  active_vehicles: number;
  available_vehicles: number;
  booked_vehicles: number;
  maintenance_vehicles: number;
  utilization_rate: number;
  avg_revenue_per_vehicle: number;
  avg_expense_per_vehicle: number;
}

export interface TrendItem {
  month: string;
  total: number;
}

export interface CashFlowTrend {
  month: string;
  inflows: number;
  outflows: number;
}

export interface Trends {
  revenue: TrendItem[];
  expense: TrendItem[];
  profit: TrendItem[];
  cash_flow: CashFlowTrend[];
  revenue_growth?: {
    monthly_growth: number;
    quarterly_growth: number;
    yearly_growth: number;
  };
}

export interface PlatformBreakdown {
  platform_id: string;
  platform_name: string;
  total: number;
}

export interface CategoryBreakdown {
  category_id: string;
  category_name: string;
  total: number;
}

export interface VehicleBreakdown {
  vehicle_id: string;
  vehicle_number: string;
  total: number;
}

export interface Breakdowns {
  revenue_by_platform: PlatformBreakdown[];
  expense_by_category: CategoryBreakdown[];
  revenue_by_vehicle: VehicleBreakdown[];
  collections_by_category: CategoryBreakdown[];
}

export interface RecentBooking {
  id: string;
  booking_id: string;
  vehicle_number?: string;
  vehicle_name?: string;
  platform_name?: string;
  net_revenue: number;
  status: string;
  created_at: string;
}

export interface RecentJournalEntry {
  id: string;
  vehicle_number?: string;
  vehicle_name?: string;
  category_name?: string;
  amount_collected: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface RecentExpense {
  id: string;
  vehicle_number?: string;
  vehicle_name?: string;
  category_name?: string;
  payment_mode_name?: string;
  amount: number;
  status: string;
  vendor?: string;
  created_at: string;
}

export interface RecentActivity {
  latest_bookings: RecentBooking[];
  latest_journal_entries: RecentJournalEntry[];
  latest_expenses: RecentExpense[];
}

export interface TopVehicle {
  vehicle_id: string;
  vehicle_number: string;
  total_revenue?: number;
  total_expense?: number;
  profit?: number;
}

export interface PlatformRanking extends PlatformBreakdown {}

export interface TopVehicles {
  top_performing: TopVehicle[];
  top_expense: TopVehicle[];
  most_profitable: TopVehicle[];
  platform_ranking: PlatformRanking[];
  lowest_performing?: TopVehicle[];
  vehicle_profitability?: (TopVehicle & { margin?: number })[];
}

export interface AlertVehicle {
  vehicle_id: string;
  vehicle_number: string;
  total_expense?: number;
  profit?: number;
}

export interface Alerts {
  vehicles_without_bookings: number;
  vehicles_without_bookings_list: { vehicle_id: string; vehicle_number: string }[];
  high_expense_vehicles: AlertVehicle[];
  negative_profit_vehicles: AlertVehicle[];
  pending_journal_entries: number;
  pending_expenses: number;
  large_expenses?: any[];
}

export interface FleetHealthSummary {
  health_score: number;
  insurance_due: number;
  permit_due: number;
  fitness_due: number;
  pollution_due: number;
  rc_due: number;
  maintenance_due: number;
  vehicles_in_maintenance: number;
  vehicles_without_platform: number;
  expired_documents: number;
}

export interface DashboardData {
  kpis: KPIs;
  trends: Trends;
  breakdowns: Breakdowns;
  recent: RecentActivity;
  top_vehicles: TopVehicles;
  alerts: Alerts;
  heatmap?: { date: string; total: number }[];
  fleet_health?: FleetHealthSummary;
}
